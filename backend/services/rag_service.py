"""RAG (Retrieval Augmented Generation) service"""
from typing import Dict, List, Any
from backend.services.vector_service import VectorService
from backend.services.llm_service import LLMService
from backend.config.settings import get_settings

settings = get_settings()


class RAGService:
    """Complete RAG pipeline service"""
    
    def __init__(self):
        self.vector_service = VectorService()
        self.llm_service = LLMService()
    
    def query(self, query: str, tenant_id: str) -> Dict[str, Any]:
        """Complete RAG query pipeline"""
        try:
            # Step 1: Vector search to retrieve relevant documents
            relevant_docs = self.vector_service.search(query, tenant_id, top_k=3)
            
            # Step 2: Generate response using LLM with context
            if relevant_docs:
                context = "\n\n".join([
                    f"Document: {doc['title']}\n{doc['content']}"
                    for doc in relevant_docs
                ])
                
                prompt = f"""You are an AI assistant helping with infrastructure questions.

Context from knowledge base:
{context}

Question: {query}

Please provide a helpful answer based on the context above. If the context doesn't contain relevant information, say so."""
                
                answer = self.llm_service.generate_response(prompt)
                
                # Calculate confidence based on similarity scores
                avg_similarity = sum(doc.get('similarity_score', 0) for doc in relevant_docs) / len(relevant_docs)
                confidence = min(0.95, max(0.3, avg_similarity))
            else:
                # No relevant documents found
                answer = "I don't have specific information about that topic in my knowledge base. Please try rephrasing your question or ask about GPU optimization, cost management, memory troubleshooting, auto-scaling, model performance, resource allocation, system monitoring, or performance bottlenecks."
                confidence = 0.1
            
            # Format sources
            sources = [
                {
                    'title': doc['title'],
                    'doc_type': doc.get('doc_type', 'guide')
                }
                for doc in relevant_docs
            ]
            
            return {
                'answer': answer,
                'sources': sources,
                'confidence_score': confidence
            }
        except Exception as e:
            print(f"Error in RAG query: {e}")
            # Fallback response
            return {
                'answer': "I'm sorry, I encountered an error processing your question. Please try again.",
                'sources': [],
                'confidence_score': 0.1
            }
    
    def index_document(self, doc_id: str, title: str, content: str, doc_type: str, tenant_id: str):
        """Index a document in the vector store"""
        try:
            self.vector_service.index_document(doc_id, title, content, doc_type, tenant_id)
        except Exception as e:
            print(f"Error indexing document: {e}")
    
    def delete_document(self, doc_id: str, tenant_id: str):
        """Delete a document from the vector store"""
        try:
            self.vector_service.delete_document(doc_id, tenant_id)
        except Exception as e:
            print(f"Error deleting document: {e}")

