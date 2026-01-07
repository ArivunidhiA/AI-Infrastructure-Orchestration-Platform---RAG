"""Vector search service using Pinecone"""
from typing import List, Dict, Any, Optional
import numpy as np
from backend.config.settings import get_settings

settings = get_settings()

# Try to import Pinecone
PINECONE_AVAILABLE = False
try:
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    # Pinecone not installed, will use fallback
    pass


class VectorService:
    """Service for vector search operations"""
    
    def __init__(self):
        self.use_pinecone = settings.use_pinecone and PINECONE_AVAILABLE and settings.pinecone_api_key
        self.index_name = settings.pinecone_index_name
        
        if self.use_pinecone and PINECONE_AVAILABLE:
            try:
                if settings.pinecone_api_key:
                    self.pc = Pinecone(api_key=settings.pinecone_api_key)
                    # Get or create index
                    existing_indexes = [idx.name for idx in self.pc.list_indexes()]
                    if self.index_name not in existing_indexes:
                        try:
                            self.pc.create_index(
                                name=self.index_name,
                                dimension=1536,  # Standard embedding dimension
                                metric='cosine',
                                spec=ServerlessSpec(
                                    cloud='aws',
                                    region=settings.aws_region
                                )
                            )
                        except Exception as e:
                            print(f"Error creating Pinecone index: {e}")
                    self.index = self.pc.Index(self.index_name)
                else:
                    self.use_pinecone = False
            except Exception as e:
                print(f"Error initializing Pinecone: {e}")
                self.use_pinecone = False
        else:
            self.use_pinecone = False
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        if self.use_pinecone:
            # Use Bedrock Titan for embeddings (if available)
            try:
                from backend.services.llm_service import LLMService
                llm_service = LLMService()
                return llm_service.generate_embedding(text)
            except Exception as e:
                print(f"Error generating embedding with Bedrock: {e}")
                return self._simple_embedding(text)
        else:
            return self._simple_embedding(text)
    
    def _simple_embedding(self, text: str) -> List[float]:
        """Simple fallback embedding (not for production)"""
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()
        # Convert to 1536-dim vector
        return [float(int(hash_hex[i:i+2], 16)) / 255.0 for i in range(0, min(32, len(hash_hex)), 2)] * 48
    
    def index_document(self, doc_id: str, title: str, content: str, doc_type: str, tenant_id: str):
        """Index document in vector store"""
        if not self.use_pinecone:
            return  # Skip if Pinecone not available
        
        try:
            # Generate embedding
            embedding = self.generate_embedding(f"{title} {content}")
            
            # Store in Pinecone
            self.index.upsert(vectors=[{
                'id': f"{tenant_id}_{doc_id}",
                'values': embedding,
                'metadata': {
                    'doc_id': doc_id,
                    'title': title,
                    'content': content[:500],  # Store first 500 chars
                    'doc_type': doc_type,
                    'tenant_id': tenant_id
                }
            }])
        except Exception as e:
            print(f"Error indexing document: {e}")
    
    def search(self, query: str, tenant_id: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if not self.use_pinecone:
            # Fallback to keyword search
            return self._keyword_search(query, tenant_id, top_k)
        
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Search in Pinecone
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter={'tenant_id': tenant_id}
            )
            
            # Format results
            documents = []
            for match in results.matches:
                metadata = match.metadata
                documents.append({
                    'title': metadata.get('title', ''),
                    'content': metadata.get('content', ''),
                    'doc_type': metadata.get('doc_type', 'guide'),
                    'similarity_score': match.score,
                    'doc_id': metadata.get('doc_id')
                })
            
            return documents
        except Exception as e:
            print(f"Error searching Pinecone: {e}")
            return self._keyword_search(query, tenant_id, top_k)
    
    def _keyword_search(self, query: str, tenant_id: str, top_k: int) -> List[Dict[str, Any]]:
        """Fallback keyword-based search"""
        from backend.database import get_table
        
        try:
            from backend.database import get_table
            documents_table = get_table('documents')
            try:
                response = documents_table.query(
                    IndexName='tenant-id-index',
                    KeyConditionExpression='tenant_id = :tenant_id',
                    ExpressionAttributeValues={':tenant_id': tenant_id}
                )
            except Exception:
                # Fallback to scan if GSI doesn't exist yet
                response = documents_table.scan(
                    FilterExpression='tenant_id = :tenant_id',
                    ExpressionAttributeValues={':tenant_id': tenant_id}
                )
            
            # Simple keyword matching
            query_words = query.lower().split()
            scored_docs = []
            
            for item in response.get('Items', []):
                content = (item.get('title', '') + ' ' + item.get('content', '')).lower()
                score = sum(1 for word in query_words if word in content)
                
                if score > 0:
                    scored_docs.append({
                        'title': item.get('title', ''),
                        'content': item.get('content', '')[:200],
                        'doc_type': item.get('doc_type', 'guide'),
                        'similarity_score': min(0.9, score / len(query_words)),
                        'doc_id': item.get('id')
                    })
            
            # Sort by score and return top_k
            scored_docs.sort(key=lambda x: x['similarity_score'], reverse=True)
            return scored_docs[:top_k]
        except Exception as e:
            print(f"Error in keyword search: {e}")
            return []
    
    def delete_document(self, doc_id: str, tenant_id: str):
        """Delete document from vector store"""
        if not self.use_pinecone:
            return
        
        try:
            self.index.delete(ids=[f"{tenant_id}_{doc_id}"])
        except Exception as e:
            print(f"Error deleting from Pinecone: {e}")

