import json
import re
from typing import List, Dict, Any
from models import Document
from .rag_engine import RAGEngine

class DocumentProcessor:
    """Service for processing and chunking infrastructure documentation"""
    
    def __init__(self):
        self.rag_engine = RAGEngine()
        self.max_chunk_size = 1000  # Maximum characters per chunk
        self.overlap_size = 200     # Overlap between chunks
    
    def process_document(self, title: str, content: str, doc_type: str) -> Dict[str, Any]:
        """Process a document and prepare it for storage"""
        
        # Clean and preprocess content
        cleaned_content = self._clean_content(content)
        
        # Split into chunks if content is too long
        chunks = self._split_into_chunks(cleaned_content)
        
        # Generate embeddings for each chunk
        chunk_embeddings = []
        for chunk in chunks:
            embeddings = self.rag_engine.generate_embeddings(chunk)
            chunk_embeddings.append(embeddings)
        
        # Combine all chunk embeddings
        combined_embeddings = self._combine_embeddings(chunk_embeddings)
        
        return {
            "title": title,
            "content": cleaned_content,
            "doc_type": doc_type,
            "chunks": chunks,
            "chunk_embeddings": chunk_embeddings,
            "combined_embeddings": combined_embeddings,
            "chunk_count": len(chunks)
        }
    
    def _clean_content(self, content: str) -> str:
        """Clean and normalize document content"""
        
        # Remove extra whitespace
        content = re.sub(r'\s+', ' ', content)
        
        # Remove special characters but keep important punctuation
        content = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]]', '', content)
        
        # Normalize line breaks
        content = content.replace('\n', ' ').replace('\r', ' ')
        
        # Remove multiple spaces
        content = re.sub(r' +', ' ', content)
        
        return content.strip()
    
    def _split_into_chunks(self, content: str) -> List[str]:
        """Split content into overlapping chunks"""
        
        if len(content) <= self.max_chunk_size:
            return [content]
        
        chunks = []
        start = 0
        
        while start < len(content):
            end = start + self.max_chunk_size
            
            # Try to break at sentence boundary
            if end < len(content):
                # Look for sentence endings within the last 100 characters
                sentence_end = content.rfind('.', start, end)
                if sentence_end > start + self.max_chunk_size - 100:
                    end = sentence_end + 1
                else:
                    # Look for word boundary
                    word_end = content.rfind(' ', start, end)
                    if word_end > start + self.max_chunk_size - 50:
                        end = word_end
            
            chunk = content[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - self.overlap_size
            if start >= len(content):
                break
        
        return chunks
    
    def _combine_embeddings(self, chunk_embeddings: List[List[float]]) -> List[float]:
        """Combine multiple chunk embeddings into a single document embedding"""
        
        if not chunk_embeddings:
            return []
        
        if len(chunk_embeddings) == 1:
            return chunk_embeddings[0]
        
        # Average the embeddings
        combined = []
        for i in range(len(chunk_embeddings[0])):
            avg_value = sum(emb[i] for emb in chunk_embeddings) / len(chunk_embeddings)
            combined.append(avg_value)
        
        return combined
    
    def extract_keywords(self, content: str) -> List[str]:
        """Extract keywords from document content"""
        
        # Common infrastructure keywords
        infrastructure_keywords = [
            'aws', 'ec2', 's3', 'lambda', 'cloudformation', 'iam', 'vpc',
            'gpu', 'cpu', 'memory', 'storage', 'instance', 'cluster',
            'docker', 'kubernetes', 'container', 'microservice',
            'monitoring', 'logging', 'metrics', 'alerting',
            'cost', 'optimization', 'scaling', 'performance',
            'security', 'encryption', 'authentication', 'authorization',
            'database', 'postgresql', 'mysql', 'mongodb', 'redis',
            'api', 'rest', 'graphql', 'webhook', 'endpoint',
            'ml', 'ai', 'training', 'inference', 'model', 'pipeline',
            'data', 'etl', 'processing', 'analytics', 'visualization'
        ]
        
        content_lower = content.lower()
        found_keywords = []
        
        for keyword in infrastructure_keywords:
            if keyword in content_lower:
                found_keywords.append(keyword)
        
        # Also extract technical terms (words with numbers or special patterns)
        technical_terms = re.findall(r'\b\w*\d+\w*\b', content_lower)
        found_keywords.extend(technical_terms)
        
        return list(set(found_keywords))
    
    def categorize_document(self, content: str) -> str:
        """Automatically categorize document based on content"""
        
        content_lower = content.lower()
        
        # Define category patterns
        categories = {
            'guide': ['how to', 'tutorial', 'step by step', 'getting started', 'setup', 'configuration'],
            'troubleshooting': ['error', 'problem', 'issue', 'fix', 'debug', 'troubleshoot', 'solution'],
            'best_practice': ['best practice', 'recommendation', 'should', 'avoid', 'optimize', 'efficient'],
            'reference': ['api', 'reference', 'documentation', 'specification', 'parameter', 'option'],
            'architecture': ['architecture', 'design', 'pattern', 'structure', 'component', 'system']
        }
        
        # Count matches for each category
        category_scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            category_scores[category] = score
        
        # Return category with highest score, default to 'guide'
        if category_scores:
            return max(category_scores, key=category_scores.get)
        return 'guide'
    
    def validate_document(self, title: str, content: str) -> Dict[str, Any]:
        """Validate document before processing"""
        
        errors = []
        warnings = []
        
        # Check title
        if not title or len(title.strip()) < 3:
            errors.append("Title must be at least 3 characters long")
        
        # Check content
        if not content or len(content.strip()) < 50:
            errors.append("Content must be at least 50 characters long")
        
        # Check for minimum technical content
        technical_indicators = ['aws', 'gpu', 'cpu', 'instance', 'cost', 'optimization', 'monitoring']
        if not any(indicator in content.lower() for indicator in technical_indicators):
            warnings.append("Document may not contain infrastructure-related content")
        
        # Check content length
        if len(content) > 50000:
            warnings.append("Document is very long and may be split into many chunks")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "estimated_chunks": max(1, len(content) // self.max_chunk_size)
        }
    
    def process_uploaded_file(self, filename: str, content: str) -> Dict[str, Any]:
        """Process an uploaded file and extract relevant information"""
        
        # Extract title from filename
        title = filename.replace('_', ' ').replace('-', ' ').replace('.txt', '').replace('.md', '')
        title = title.title()
        
        # Auto-categorize
        doc_type = self.categorize_document(content)
        
        # Validate
        validation = self.validate_document(title, content)
        
        if not validation["valid"]:
            return {
                "success": False,
                "errors": validation["errors"],
                "warnings": validation["warnings"]
            }
        
        # Process document
        processed = self.process_document(title, content, doc_type)
        
        # Extract keywords
        keywords = self.extract_keywords(content)
        
        return {
            "success": True,
            "title": processed["title"],
            "content": processed["content"],
            "doc_type": processed["doc_type"],
            "keywords": keywords,
            "chunk_count": processed["chunk_count"],
            "embeddings": processed["combined_embeddings"],
            "warnings": validation["warnings"]
        }
