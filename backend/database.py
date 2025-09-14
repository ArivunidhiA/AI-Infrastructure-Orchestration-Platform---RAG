from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import os

# Database configuration
DATABASE_URL = "sqlite:///./ai_infrastructure.db"

# Create engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_sample_data():
    """Initialize database with sample data"""
    from services.document_processor import DocumentProcessor
    from services.rag_engine import RAGEngine
    from models import Workload, Metric, Optimization, Document, RAGQuery
    import json
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Workload).count() > 0:
            return
        
        # Create sample workloads
        sample_workloads = [
            {
                "name": "Image Classification Training",
                "type": "training",
                "status": "running",
                "cpu_cores": 8,
                "gpu_count": 2,
                "memory_gb": 32.0,
                "cost_per_hour": 12.50
            },
            {
                "name": "NLP Model Inference",
                "type": "inference",
                "status": "running",
                "cpu_cores": 4,
                "gpu_count": 1,
                "memory_gb": 16.0,
                "cost_per_hour": 6.25
            },
            {
                "name": "Recommendation System Batch",
                "type": "training",
                "status": "completed",
                "cpu_cores": 16,
                "gpu_count": 4,
                "memory_gb": 64.0,
                "cost_per_hour": 25.00
            }
        ]
        
        for workload_data in sample_workloads:
            workload = Workload(**workload_data)
            db.add(workload)
        
        db.commit()
        
        # Create sample metrics for running workloads
        running_workloads = db.query(Workload).filter(Workload.status == "running").all()
        for workload in running_workloads:
            for i in range(10):  # 10 sample metrics
                metric = Metric(
                    workload_id=workload.id,
                    cpu_usage=75.0 + (i * 2),
                    gpu_usage=80.0 + (i * 1.5),
                    memory_usage=60.0 + (i * 3),
                    cost_accumulation=workload.cost_per_hour * (i + 1)
                )
                db.add(metric)
        
        # Create sample optimizations
        for workload in running_workloads:
            optimization = Optimization(
                workload_id=workload.id,
                recommendation=f"Consider using spot instances for {workload.name} to reduce costs by 70%",
                potential_savings=workload.cost_per_hour * 0.7,
                status="pending"
            )
            db.add(optimization)
        
        # Create sample documents for RAG
        sample_docs = [
            {
                "title": "AWS EC2 Instance Types Guide",
                "content": "AWS offers various EC2 instance types optimized for different workloads. For AI/ML training, use compute-optimized instances like C5 or GPU instances like P3. For inference, memory-optimized instances like R5 are often sufficient. Always consider the cost-performance ratio when selecting instances.",
                "doc_type": "guide"
            },
            {
                "title": "GPU Memory Optimization Best Practices",
                "content": "To optimize GPU memory usage: 1) Use mixed precision training with FP16, 2) Implement gradient checkpointing, 3) Use data parallelism instead of model parallelism when possible, 4) Monitor memory usage with nvidia-smi, 5) Consider using smaller batch sizes if memory is limited.",
                "doc_type": "best_practice"
            },
            {
                "title": "Common Training Job Failures and Solutions",
                "content": "Common issues include: Out of memory errors (reduce batch size or use gradient accumulation), CUDA out of memory (check GPU memory allocation), Data loading bottlenecks (increase num_workers or use faster storage), Loss not decreasing (check learning rate and data preprocessing).",
                "doc_type": "troubleshooting"
            },
            {
                "title": "Cost Optimization Strategies",
                "content": "To reduce AI infrastructure costs: 1) Use spot instances for training jobs, 2) Implement auto-scaling based on demand, 3) Use reserved instances for predictable workloads, 4) Monitor and terminate idle resources, 5) Choose appropriate instance types based on actual resource usage.",
                "doc_type": "best_practice"
            }
        ]
        
        # Process documents and create embeddings
        doc_processor = DocumentProcessor()
        rag_engine = RAGEngine()
        
        for doc_data in sample_docs:
            # Generate mock embeddings
            embeddings = rag_engine.generate_embeddings(doc_data["content"])
            doc_data["vector_embeddings"] = json.dumps(embeddings)
            
            document = Document(**doc_data)
            db.add(document)
        
        db.commit()
        
        print("Sample data initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing sample data: {e}")
        db.rollback()
    finally:
        db.close()

# Import here to avoid circular imports
