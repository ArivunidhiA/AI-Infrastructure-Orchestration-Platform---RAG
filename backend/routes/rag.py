from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models import Document, RAGQuery
from services.rag_engine import RAGEngine
from services.document_processor import DocumentProcessor
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter(prefix="/api/rag", tags=["rag"])

# Pydantic models
class RAGQueryRequest(BaseModel):
    question: str

class RAGQueryResponse(BaseModel):
    id: int
    question: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    doc_type: str
    upload_date: datetime
    
    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    document_id: int = None
    errors: List[str] = []
    warnings: List[str] = []

@router.post("/query", response_model=RAGQueryResponse)
def query_rag_system(query_request: RAGQueryRequest, db: Session = Depends(get_db)):
    """Query the RAG system with a question"""
    
    if not query_request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty"
        )
    
    # Get all documents
    documents = db.query(Document).all()
    
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No documents available in the knowledge base"
        )
    
    # Process query with RAG engine
    rag_engine = RAGEngine()
    result = rag_engine.process_query(query_request.question, documents)
    
    # Save query to database
    rag_query = RAGQuery(
        question=query_request.question,
        answer=result["answer"],
        sources=json.dumps(result["sources"]),
        confidence_score=result["confidence_score"]
    )
    
    db.add(rag_query)
    db.commit()
    db.refresh(rag_query)
    
    # Format response
    sources = []
    if result["sources"]:
        for source in result["sources"]:
            sources.append({
                "id": source["id"],
                "title": source["title"],
                "doc_type": source["doc_type"]
            })
    
    return RAGQueryResponse(
        id=rag_query.id,
        question=rag_query.question,
        answer=rag_query.answer,
        sources=sources,
        confidence_score=rag_query.confidence_score,
        created_at=rag_query.created_at
    )

@router.get("/history", response_model=List[RAGQueryResponse])
def get_query_history(
    limit: int = 20,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """Get query history"""
    
    queries = db.query(RAGQuery).order_by(
        RAGQuery.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    response = []
    for query in queries:
        sources = []
        if query.sources:
            try:
                sources = json.loads(query.sources)
            except json.JSONDecodeError:
                sources = []
        
        response.append(RAGQueryResponse(
            id=query.id,
            question=query.question,
            answer=query.answer,
            sources=sources,
            confidence_score=query.confidence_score,
            created_at=query.created_at
        ))
    
    return response

@router.get("/suggested-questions")
def get_suggested_questions():
    """Get suggested questions for users"""
    
    rag_engine = RAGEngine()
    return {
        "suggested_questions": rag_engine.get_suggested_questions()
    }

@router.post("/docs/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a document to the knowledge base"""
    
    # Check file type
    if not file.filename.endswith(('.txt', '.md')):
        return DocumentUploadResponse(
            success=False,
            message="Only .txt and .md files are supported",
            errors=["Unsupported file type"]
        )
    
    # Read file content
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
    except Exception as e:
        return DocumentUploadResponse(
            success=False,
            message="Failed to read file content",
            errors=[f"File read error: {str(e)}"]
        )
    
    # Process document
    doc_processor = DocumentProcessor()
    result = doc_processor.process_uploaded_file(file.filename, content_str)
    
    if not result["success"]:
        return DocumentUploadResponse(
            success=False,
            message="Document processing failed",
            errors=result["errors"],
            warnings=result["warnings"]
        )
    
    # Save to database
    document = Document(
        title=result["title"],
        content=result["content"],
        doc_type=result["doc_type"],
        vector_embeddings=json.dumps(result["embeddings"])
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return DocumentUploadResponse(
        success=True,
        message="Document uploaded and processed successfully",
        document_id=document.id,
        warnings=result["warnings"]
    )

@router.post("/docs", response_model=DocumentResponse)
def create_document(
    title: str,
    content: str,
    doc_type: str = "guide",
    db: Session = Depends(get_db)
):
    """Create a document in the knowledge base"""
    
    if not title.strip() or not content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and content are required"
        )
    
    # Process document
    doc_processor = DocumentProcessor()
    result = doc_processor.process_document(title, content, doc_type)
    
    # Save to database
    document = Document(
        title=result["title"],
        content=result["content"],
        doc_type=result["doc_type"],
        vector_embeddings=json.dumps(result["combined_embeddings"])
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        content=document.content,
        doc_type=document.doc_type,
        upload_date=document.upload_date
    )

@router.get("/docs", response_model=List[DocumentResponse])
def get_documents(
    doc_type: str = None,
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """Get all documents in the knowledge base"""
    
    query = db.query(Document)
    
    if doc_type:
        query = query.filter(Document.doc_type == doc_type)
    
    documents = query.order_by(
        Document.upload_date.desc()
    ).offset(skip).limit(limit).all()
    
    return documents

@router.get("/docs/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get a specific document"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        content=document.content,
        doc_type=document.doc_type,
        upload_date=document.upload_date
    )

@router.delete("/docs/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Delete a document from the knowledge base"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete associated RAG queries
    db.query(RAGQuery).filter(RAGQuery.document_id == document_id).delete()
    
    # Delete the document
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}

@router.get("/search")
def search_documents(
    query: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Search documents using semantic search"""
    
    if not query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty"
        )
    
    # Get all documents
    documents = db.query(Document).all()
    
    if not documents:
        return {
            "results": [],
            "total_documents": 0,
            "query": query
        }
    
    # Search using RAG engine
    rag_engine = RAGEngine()
    results = rag_engine.search_documents(query, documents, top_k=limit)
    
    return {
        "results": results,
        "total_documents": len(documents),
        "query": query
    }

@router.get("/stats")
def get_rag_stats(db: Session = Depends(get_db)):
    """Get RAG system statistics"""
    
    # Count documents by type
    doc_types = db.query(Document.doc_type).distinct().all()
    doc_type_counts = {}
    for doc_type in doc_types:
        count = db.query(Document).filter(Document.doc_type == doc_type[0]).count()
        doc_type_counts[doc_type[0]] = count
    
    # Count total queries
    total_queries = db.query(RAGQuery).count()
    
    # Count recent queries (last 24 hours)
    from datetime import timedelta
    recent_queries = db.query(RAGQuery).filter(
        RAGQuery.created_at >= datetime.utcnow() - timedelta(hours=24)
    ).count()
    
    # Average confidence score
    avg_confidence = db.query(RAGQuery).with_entities(
        db.func.avg(RAGQuery.confidence_score)
    ).scalar() or 0
    
    return {
        "total_documents": db.query(Document).count(),
        "document_types": doc_type_counts,
        "total_queries": total_queries,
        "recent_queries_24h": recent_queries,
        "average_confidence": round(avg_confidence, 2)
    }

@router.get("/query/{query_id}", response_model=RAGQueryResponse)
def get_query(query_id: int, db: Session = Depends(get_db)):
    """Get a specific query by ID"""
    
    query = db.query(RAGQuery).filter(RAGQuery.id == query_id).first()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )
    
    sources = []
    if query.sources:
        try:
            sources = json.loads(query.sources)
        except json.JSONDecodeError:
            sources = []
    
    return RAGQueryResponse(
        id=query.id,
        question=query.question,
        answer=query.answer,
        sources=sources,
        confidence_score=query.confidence_score,
        created_at=query.created_at
    )
