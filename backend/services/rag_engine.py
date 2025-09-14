import json
import random
import numpy as np
from typing import List, Dict, Any, Tuple
from models import Document, RAGQuery

class RAGEngine:
    """RAG (Retrieval Augmented Generation) engine for infrastructure knowledge"""
    
    def __init__(self):
        # Mock embedding dimensions (OpenAI uses 1536 dimensions)
        self.embedding_dim = 1536
        self.similarity_threshold = 0.7
        
        # Mock knowledge base for common infrastructure questions
        self.knowledge_base = {
            "aws_setup": "To set up AWS for AI workloads: 1) Create EC2 instances with appropriate instance types (P3 for GPU, C5 for CPU), 2) Configure security groups for your applications, 3) Set up IAM roles with necessary permissions, 4) Use EBS volumes for persistent storage, 5) Consider using spot instances for cost savings on fault-tolerant workloads.",
            "gpu_optimization": "GPU optimization techniques: 1) Use mixed precision training (FP16), 2) Implement gradient checkpointing to reduce memory usage, 3) Use data parallelism for multi-GPU training, 4) Monitor GPU utilization with nvidia-smi, 5) Consider using TensorRT for inference optimization, 6) Use CUDA streams for overlapping computation and data transfer.",
            "cost_optimization": "Cost optimization strategies: 1) Use spot instances for training jobs (up to 90% savings), 2) Implement auto-scaling based on demand, 3) Use reserved instances for predictable workloads (up to 75% savings), 4) Monitor and terminate idle resources, 5) Choose appropriate instance types based on actual usage, 6) Use S3 for data storage instead of EBS when possible.",
            "monitoring": "Infrastructure monitoring best practices: 1) Set up CloudWatch for AWS resources, 2) Monitor CPU, memory, GPU utilization, 3) Set up alerts for high resource usage, 4) Track costs and usage patterns, 5) Use APM tools for application performance, 6) Implement log aggregation and analysis.",
            "troubleshooting": "Common troubleshooting steps: 1) Check resource utilization and bottlenecks, 2) Review logs for errors and warnings, 3) Verify network connectivity and security groups, 4) Check disk space and I/O performance, 5) Validate data pipeline and preprocessing, 6) Test with smaller datasets to isolate issues."
        }
    
    def generate_embeddings(self, text: str) -> List[float]:
        """Generate mock embeddings for text (simulates OpenAI embeddings)"""
        # In a real implementation, this would call OpenAI's embedding API
        # For now, generate random but consistent embeddings
        random.seed(hash(text) % 2**32)
        return [random.uniform(-1, 1) for _ in range(self.embedding_dim)]
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        # Convert to numpy arrays
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Calculate cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        return dot_product / (norm1 * norm2)
    
    def retrieve_relevant_documents(self, query: str, documents: List[Document], top_k: int = 3) -> List[Tuple[Document, float]]:
        """Retrieve most relevant documents for a query"""
        
        # Generate query embedding
        query_embedding = self.generate_embeddings(query)
        
        # Calculate similarities
        similarities = []
        for doc in documents:
            if doc.vector_embeddings:
                doc_embeddings = json.loads(doc.vector_embeddings)
                similarity = self.calculate_similarity(query_embedding, doc_embeddings)
                similarities.append((doc, similarity))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
    
    def generate_answer(self, question: str, context_documents: List[Document]) -> Dict[str, Any]:
        """Generate answer based on question and context documents"""
        
        # Extract context from documents
        context = ""
        sources = []
        
        for doc in context_documents:
            context += f"\n\n{doc.title}:\n{doc.content}"
            sources.append({
                "id": doc.id,
                "title": doc.title,
                "doc_type": doc.doc_type
            })
        
        # Generate answer based on context and knowledge base
        answer = self._generate_contextual_answer(question, context)
        
        # Calculate confidence score
        confidence = self._calculate_confidence(question, answer, context)
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence_score": confidence,
            "context_used": len(context_documents)
        }
    
    def _generate_contextual_answer(self, question: str, context: str) -> str:
        """Generate contextual answer using mock LLM"""
        
        question_lower = question.lower()
        
        # Check if question matches knowledge base patterns
        if any(keyword in question_lower for keyword in ["aws", "amazon", "ec2", "setup"]):
            base_answer = self.knowledge_base["aws_setup"]
        elif any(keyword in question_lower for keyword in ["gpu", "cuda", "optimization", "memory"]):
            base_answer = self.knowledge_base["gpu_optimization"]
        elif any(keyword in question_lower for keyword in ["cost", "expensive", "cheap", "savings", "optimize"]):
            base_answer = self.knowledge_base["cost_optimization"]
        elif any(keyword in question_lower for keyword in ["monitor", "tracking", "metrics", "alert"]):
            base_answer = self.knowledge_base["monitoring"]
        elif any(keyword in question_lower for keyword in ["error", "problem", "issue", "troubleshoot", "fix"]):
            base_answer = self.knowledge_base["troubleshooting"]
        else:
            base_answer = "Based on the available documentation and best practices, here's what I can help you with:"
        
        # Enhance answer with context if available
        if context:
            base_answer += f"\n\nAdditional context from your documentation:\n{context[:500]}..."
        
        # Add specific recommendations based on question
        if "cost" in question_lower:
            base_answer += "\n\nFor immediate cost savings, consider: 1) Switching to spot instances for non-critical workloads, 2) Implementing auto-scaling, 3) Reviewing your current instance types for right-sizing opportunities."
        elif "performance" in question_lower:
            base_answer += "\n\nFor performance optimization, focus on: 1) Right-sizing your instances, 2) Optimizing your application code, 3) Using appropriate storage types, 4) Implementing caching strategies."
        
        return base_answer
    
    def _calculate_confidence(self, question: str, answer: str, context: str) -> float:
        """Calculate confidence score for the generated answer"""
        
        # Base confidence
        confidence = 0.5
        
        # Increase confidence if context is available
        if context and len(context) > 100:
            confidence += 0.2
        
        # Increase confidence if answer contains specific technical details
        technical_indicators = ["instance", "gpu", "cpu", "memory", "cost", "optimization", "aws", "ec2"]
        if any(indicator in answer.lower() for indicator in technical_indicators):
            confidence += 0.2
        
        # Increase confidence if question is specific
        if len(question.split()) > 5:  # Longer questions are usually more specific
            confidence += 0.1
        
        return min(1.0, confidence)
    
    def process_query(self, question: str, documents: List[Document]) -> Dict[str, Any]:
        """Process a RAG query and return comprehensive response"""
        
        # Retrieve relevant documents
        relevant_docs = self.retrieve_relevant_documents(question, documents)
        
        # Filter by similarity threshold
        filtered_docs = [doc for doc, sim in relevant_docs if sim >= self.similarity_threshold]
        
        # If no relevant documents found, use all top documents
        if not filtered_docs:
            filtered_docs = [doc for doc, sim in relevant_docs[:3]]
        
        # Generate answer
        result = self.generate_answer(question, filtered_docs)
        
        # Add metadata
        result.update({
            "question": question,
            "total_documents_searched": len(documents),
            "relevant_documents_found": len(relevant_docs),
            "documents_used": len(filtered_docs),
            "similarity_scores": [sim for _, sim in relevant_docs[:3]]
        })
        
        return result
    
    def get_suggested_questions(self) -> List[str]:
        """Get list of suggested questions for users"""
        return [
            "How can I optimize my GPU usage for training?",
            "What are the best practices for cost optimization?",
            "How do I set up monitoring for my AI workloads?",
            "What instance types should I use for inference?",
            "How can I reduce my AWS costs?",
            "What are common troubleshooting steps for training failures?",
            "How do I implement auto-scaling?",
            "What's the difference between spot and on-demand instances?",
            "How can I improve my model training performance?",
            "What monitoring tools should I use?"
        ]
    
    def search_documents(self, query: str, documents: List[Document]) -> List[Dict[str, Any]]:
        """Search through documents and return ranked results"""
        
        relevant_docs = self.retrieve_relevant_documents(query, documents, top_k=10)
        
        results = []
        for doc, similarity in relevant_docs:
            results.append({
                "id": doc.id,
                "title": doc.title,
                "content_preview": doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
                "doc_type": doc.doc_type,
                "similarity_score": similarity,
                "upload_date": doc.upload_date.isoformat()
            })
        
        return results
