"""RAG (Retrieval Augmented Generation) routes"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Dict, Any
import uuid
import time
from backend.database import get_table
from backend.models.dynamodb import Document, DocumentCreate, RAGQueryResponse
from backend.auth.dependencies import get_current_user_optional
from backend.services.rag_service import RAGService
from backend.services.s3_service import S3Service
from pydantic import BaseModel

# Initialize services (lazy loading to handle missing dependencies)
rag_service = None
s3_service = None

def get_rag_service():
    global rag_service
    if rag_service is None:
        rag_service = RAGService()
    return rag_service

def get_s3_service():
    global s3_service
    if s3_service is None:
        s3_service = S3Service()
    return s3_service

router = APIRouter(prefix="/api/rag", tags=["rag"])


class RAGQueryRequest(BaseModel):
    query: str


@router.post("/", response_model=RAGQueryResponse)
async def query_rag(
    request: RAGQueryRequest,
    current_user = Depends(get_current_user_optional)
):
    """Query the RAG system"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        
        # Use RAG service to get response
        rag = get_rag_service()
        response = rag.query(query=request.query, tenant_id=tenant_id)
        
        # Store query in database
        queries_table = get_table('rag_queries')
        query_id = str(uuid.uuid4())
        queries_table.put_item(Item={
            'id': query_id,
            'query': request.query,
            'answer': response['answer'],
            'sources': response['sources'],
            'confidence_score': response['confidence_score'],
            'tenant_id': tenant_id,
            'created_at': int(time.time())
        })
        
        return RAGQueryResponse(
            id=query_id,
            answer=response['answer'],
            sources=response['sources'],
            confidence_score=response['confidence_score'],
            created_at=str(int(time.time()))
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing RAG query: {str(e)}"
        )


@router.get("/", response_model=Dict[str, Any])
async def get_rag_info(
    current_user = Depends(get_current_user_optional)
):
    """Get RAG system information, documents, and suggested questions"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        documents_table = get_table('documents')
        
        # Get documents for tenant
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
        
        documents = [
            {
                'id': item['id'],
                'title': item['title'],
                'content': item['content'][:100] + "..." if len(item.get('content', '')) > 100 else item.get('content', ''),
                'doc_type': item.get('doc_type', 'guide'),
                'upload_date': item.get('upload_date', ''),
                'tags': item.get('tags', [])
            }
            for item in response.get('Items', [])
        ]
        
        suggested_questions = [
            "How can I optimize my GPU usage?",
            "What are the best practices for cost management?",
            "How do I troubleshoot high memory usage?",
            "What is auto-scaling and how does it work?",
            "How can I improve my model performance?",
            "What are the recommended resource allocations?",
            "How do I monitor system health effectively?",
            "What are the common performance bottlenecks?"
        ]
        
        return {
            'message': "RAG API is working",
            'suggested_questions': suggested_questions,
            'documents': documents,
            'availableMethods': ["POST for queries", "GET for status"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching RAG info: {str(e)}"
        )


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user_optional)
):
    """Upload a document to the knowledge base"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        
        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # Upload to S3
        s3 = get_s3_service()
        s3_key = s3.upload_document(
            file_content=content,
            filename=file.filename,
            tenant_id=tenant_id
        )
        
        # Store document metadata in DynamoDB
        documents_table = get_table('documents')
        document_id = str(uuid.uuid4())
        
        document_item = {
            'id': document_id,
            'title': file.filename,
            'content': content_str,
            'doc_type': 'guide',
            's3_key': s3_key,
            'tenant_id': tenant_id,
            'upload_date': str(int(time.time()))
        }
        
        documents_table.put_item(Item=document_item)
        
        # Index document in vector store
        try:
            rag = get_rag_service()
            rag.index_document(
                doc_id=document_id,
                title=file.filename,
                content=content_str,
                doc_type='guide',
                tenant_id=tenant_id
            )
        except Exception as e:
            print(f"Error indexing document: {e}")
            # Continue even if indexing fails
        
        return {
            'success': True,
            'message': 'Document uploaded successfully',
            'document_id': document_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Delete a document from the knowledge base"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        documents_table = get_table('documents')
        
        # Get document
        response = documents_table.get_item(Key={'id': document_id})
        if 'Item' not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        document = response['Item']
        if document['tenant_id'] != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete from S3 if s3_key exists
        if document.get('s3_key'):
            try:
                s3 = get_s3_service()
                s3.delete_document(document['s3_key'])
            except Exception as e:
                print(f"Error deleting from S3: {e}")
        
        # Delete from DynamoDB
        documents_table.delete_item(Key={'id': document_id})
        
        # Delete from vector store
        try:
            rag = get_rag_service()
            rag.delete_document(document_id, tenant_id)
        except Exception as e:
            print(f"Error deleting from vector store: {e}")
        
        return {'success': True, 'message': 'Document deleted successfully'}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )

