from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Workload, Metric
from services.resource_optimizer import ResourceOptimizer
from services.cost_calculator import CostCalculator
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/workloads", tags=["workloads"])

# Pydantic models for request/response
class WorkloadCreate(BaseModel):
    name: str
    type: str  # training/inference
    cpu_cores: int
    gpu_count: int = 0
    memory_gb: float
    cost_per_hour: float

class WorkloadUpdate(BaseModel):
    name: str = None
    type: str = None
    cpu_cores: int = None
    gpu_count: int = None
    memory_gb: float = None
    cost_per_hour: float = None
    status: str = None

class WorkloadResponse(BaseModel):
    id: int
    name: str
    type: str
    status: str
    cpu_cores: int
    gpu_count: int
    memory_gb: float
    cost_per_hour: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class WorkloadWithMetrics(WorkloadResponse):
    metrics: List[dict] = []
    total_cost: float = 0.0
    efficiency_score: float = 0.0

@router.post("/", response_model=WorkloadResponse)
def create_workload(workload: WorkloadCreate, db: Session = Depends(get_db)):
    """Create a new AI workload"""
    
    # Validate workload type
    if workload.type not in ["training", "inference"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type must be 'training' or 'inference'"
        )
    
    # Validate resource requirements
    if workload.cpu_cores <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPU cores must be greater than 0"
        )
    
    if workload.memory_gb <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Memory must be greater than 0"
        )
    
    # Create workload
    db_workload = Workload(
        name=workload.name,
        type=workload.type,
        cpu_cores=workload.cpu_cores,
        gpu_count=workload.gpu_count,
        memory_gb=workload.memory_gb,
        cost_per_hour=workload.cost_per_hour,
        status="pending"
    )
    
    db.add(db_workload)
    db.commit()
    db.refresh(db_workload)
    
    return db_workload

@router.get("/", response_model=List[WorkloadResponse])
def get_workloads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workloads with pagination"""
    
    workloads = db.query(Workload).offset(skip).limit(limit).all()
    return workloads

@router.get("/{workload_id}", response_model=WorkloadWithMetrics)
def get_workload(workload_id: int, db: Session = Depends(get_db)):
    """Get a specific workload with metrics and analysis"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Get recent metrics
    metrics = db.query(Metric).filter(
        Metric.workload_id == workload_id
    ).order_by(Metric.timestamp.desc()).limit(10).all()
    
    # Calculate total cost
    total_cost = sum(metric.cost_accumulation for metric in metrics)
    
    # Get efficiency analysis
    optimizer = ResourceOptimizer()
    analysis = optimizer.analyze_workload_efficiency(workload)
    
    # Format metrics for response
    metrics_data = []
    for metric in metrics:
        metrics_data.append({
            "id": metric.id,
            "timestamp": metric.timestamp.isoformat(),
            "cpu_usage": metric.cpu_usage,
            "gpu_usage": metric.gpu_usage,
            "memory_usage": metric.memory_usage,
            "cost_accumulation": metric.cost_accumulation
        })
    
    return WorkloadWithMetrics(
        id=workload.id,
        name=workload.name,
        type=workload.type,
        status=workload.status,
        cpu_cores=workload.cpu_cores,
        gpu_count=workload.gpu_count,
        memory_gb=workload.memory_gb,
        cost_per_hour=workload.cost_per_hour,
        created_at=workload.created_at,
        metrics=metrics_data,
        total_cost=total_cost,
        efficiency_score=analysis["efficiency_score"]
    )

@router.put("/{workload_id}", response_model=WorkloadResponse)
def update_workload(workload_id: int, workload_update: WorkloadUpdate, db: Session = Depends(get_db)):
    """Update a workload"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Update only provided fields
    update_data = workload_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workload, field, value)
    
    db.commit()
    db.refresh(workload)
    
    return workload

@router.delete("/{workload_id}")
def delete_workload(workload_id: int, db: Session = Depends(get_db)):
    """Delete a workload"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Delete associated metrics first
    db.query(Metric).filter(Metric.workload_id == workload_id).delete()
    
    # Delete the workload
    db.delete(workload)
    db.commit()
    
    return {"message": "Workload deleted successfully"}

@router.post("/{workload_id}/start")
def start_workload(workload_id: int, db: Session = Depends(get_db)):
    """Start a workload"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    if workload.status == "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workload is already running"
        )
    
    workload.status = "running"
    db.commit()
    
    return {"message": "Workload started successfully"}

@router.post("/{workload_id}/stop")
def stop_workload(workload_id: int, db: Session = Depends(get_db)):
    """Stop a workload"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    if workload.status != "running":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workload is not running"
        )
    
    workload.status = "completed"
    db.commit()
    
    return {"message": "Workload stopped successfully"}

@router.get("/{workload_id}/optimization")
def get_workload_optimization(workload_id: int, db: Session = Depends(get_db)):
    """Get optimization recommendations for a workload"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    optimizer = ResourceOptimizer()
    analysis = optimizer.analyze_workload_efficiency(workload)
    
    return analysis

@router.get("/{workload_id}/cost-analysis")
def get_workload_cost_analysis(workload_id: int, db: Session = Depends(get_db)):
    """Get cost analysis for a workload"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Get metrics for cost analysis
    metrics = db.query(Metric).filter(
        Metric.workload_id == workload_id
    ).order_by(Metric.timestamp.asc()).all()
    
    cost_calculator = CostCalculator()
    
    # Calculate various cost metrics
    hourly_cost = cost_calculator.calculate_workload_cost(workload, 1.0)
    monthly_cost = cost_calculator.calculate_monthly_cost(workload)
    cost_trends = cost_calculator.analyze_cost_trends(workload_id, metrics)
    alternatives = cost_calculator.compare_cost_alternatives(workload)
    
    return {
        "current_hourly_cost": hourly_cost,
        "projected_monthly_cost": monthly_cost,
        "cost_trends": cost_trends,
        "alternatives": alternatives
    }
