from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Workload(Base):
    __tablename__ = "workloads"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # training/inference
    status = Column(String(50), default="pending")  # pending/running/completed/failed
    cpu_cores = Column(Integer, nullable=False)
    gpu_count = Column(Integer, default=0)
    memory_gb = Column(Float, nullable=False)
    cost_per_hour = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    metrics = relationship("Metric", back_populates="workload")
    optimizations = relationship("Optimization", back_populates="workload")

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    workload_id = Column(Integer, ForeignKey("workloads.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    cpu_usage = Column(Float, nullable=False)  # percentage
    gpu_usage = Column(Float, default=0.0)  # percentage
    memory_usage = Column(Float, nullable=False)  # percentage
    cost_accumulation = Column(Float, nullable=False)  # total cost so far
    
    # Relationships
    workload = relationship("Workload", back_populates="metrics")

class Optimization(Base):
    __tablename__ = "optimizations"
    
    id = Column(Integer, primary_key=True, index=True)
    workload_id = Column(Integer, ForeignKey("workloads.id"))
    recommendation = Column(Text, nullable=False)
    potential_savings = Column(Float, nullable=False)  # percentage or dollar amount
    status = Column(String(50), default="pending")  # pending/applied/rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    workload = relationship("Workload", back_populates="optimizations")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    doc_type = Column(String(100), nullable=False)  # guide/troubleshooting/best_practice
    upload_date = Column(DateTime, default=datetime.utcnow)
    vector_embeddings = Column(Text)  # JSON string of embeddings
    
    # Relationships
    rag_queries = relationship("RAGQuery", back_populates="document")

class RAGQuery(Base):
    __tablename__ = "rag_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(Text)  # JSON string of source document IDs
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    # Relationships
    document = relationship("Document", back_populates="rag_queries")
