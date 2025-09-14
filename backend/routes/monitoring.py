from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models import Workload, Metric, Optimization
from services.resource_optimizer import ResourceOptimizer
from services.cost_calculator import CostCalculator
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

# Pydantic models
class MetricCreate(BaseModel):
    workload_id: int
    cpu_usage: float
    gpu_usage: float = 0.0
    memory_usage: float
    cost_accumulation: float

class MetricResponse(BaseModel):
    id: int
    workload_id: int
    timestamp: datetime
    cpu_usage: float
    gpu_usage: float
    memory_usage: float
    cost_accumulation: float
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_workloads: int
    running_workloads: int
    total_monthly_cost: float
    cost_savings: float
    avg_cpu_usage: float
    avg_memory_usage: float
    avg_gpu_usage: float
    recent_activity: List[Dict[str, Any]]

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    
    # Get workload counts
    total_workloads = db.query(Workload).count()
    running_workloads = db.query(Workload).filter(Workload.status == "running").count()
    
    # Calculate total monthly cost
    cost_calculator = CostCalculator()
    all_workloads = db.query(Workload).all()
    total_monthly_cost = sum(
        cost_calculator.calculate_monthly_cost(workload)["regional_cost"] 
        for workload in all_workloads
    )
    
    # Calculate cost savings from optimizations
    applied_optimizations = db.query(Optimization).filter(
        Optimization.status == "applied"
    ).all()
    cost_savings = sum(opt.potential_savings for opt in applied_optimizations)
    
    # Get average resource usage from recent metrics
    recent_metrics = db.query(Metric).filter(
        Metric.timestamp >= datetime.utcnow() - timedelta(hours=24)
    ).all()
    
    if recent_metrics:
        avg_cpu_usage = sum(m.cpu_usage for m in recent_metrics) / len(recent_metrics)
        avg_memory_usage = sum(m.memory_usage for m in recent_metrics) / len(recent_metrics)
        avg_gpu_usage = sum(m.gpu_usage for m in recent_metrics) / len(recent_metrics)
    else:
        avg_cpu_usage = avg_memory_usage = avg_gpu_usage = 0.0
    
    # Get recent activity
    recent_workloads = db.query(Workload).order_by(
        Workload.created_at.desc()
    ).limit(5).all()
    
    recent_activity = []
    for workload in recent_workloads:
        recent_activity.append({
            "type": "workload",
            "action": f"Created {workload.name}",
            "timestamp": workload.created_at.isoformat(),
            "status": workload.status
        })
    
    return DashboardStats(
        total_workloads=total_workloads,
        running_workloads=running_workloads,
        total_monthly_cost=total_monthly_cost,
        cost_savings=cost_savings,
        avg_cpu_usage=avg_cpu_usage,
        avg_memory_usage=avg_memory_usage,
        avg_gpu_usage=avg_gpu_usage,
        recent_activity=recent_activity
    )

@router.get("/metrics/{workload_id}", response_model=List[MetricResponse])
def get_workload_metrics(
    workload_id: int, 
    hours: int = 24, 
    db: Session = Depends(get_db)
):
    """Get metrics for a specific workload"""
    
    # Verify workload exists
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Get metrics within time range
    start_time = datetime.utcnow() - timedelta(hours=hours)
    metrics = db.query(Metric).filter(
        Metric.workload_id == workload_id,
        Metric.timestamp >= start_time
    ).order_by(Metric.timestamp.asc()).all()
    
    return metrics

@router.post("/metrics", response_model=MetricResponse)
def create_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    """Add new metric data"""
    
    # Verify workload exists
    workload = db.query(Workload).filter(Workload.id == metric.workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Validate usage percentages
    if not (0 <= metric.cpu_usage <= 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CPU usage must be between 0 and 100"
        )
    
    if not (0 <= metric.memory_usage <= 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Memory usage must be between 0 and 100"
        )
    
    if not (0 <= metric.gpu_usage <= 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GPU usage must be between 0 and 100"
        )
    
    # Create metric
    db_metric = Metric(
        workload_id=metric.workload_id,
        cpu_usage=metric.cpu_usage,
        gpu_usage=metric.gpu_usage,
        memory_usage=metric.memory_usage,
        cost_accumulation=metric.cost_accumulation
    )
    
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    
    return db_metric

@router.get("/resource-usage")
def get_resource_usage_summary(db: Session = Depends(get_db)):
    """Get resource usage summary across all workloads"""
    
    # Get all running workloads
    running_workloads = db.query(Workload).filter(Workload.status == "running").all()
    
    if not running_workloads:
        return {
            "total_cpu_cores": 0,
            "total_gpu_count": 0,
            "total_memory_gb": 0,
            "utilized_cpu_cores": 0,
            "utilized_gpu_count": 0,
            "utilized_memory_gb": 0,
            "workloads": []
        }
    
    # Calculate totals
    total_cpu_cores = sum(w.cpu_cores for w in running_workloads)
    total_gpu_count = sum(w.gpu_count for w in running_workloads)
    total_memory_gb = sum(w.memory_gb for w in running_workloads)
    
    # Get recent metrics for utilization calculation
    recent_metrics = db.query(Metric).filter(
        Metric.timestamp >= datetime.utcnow() - timedelta(hours=1)
    ).all()
    
    # Calculate utilization
    utilized_cpu_cores = 0
    utilized_gpu_count = 0
    utilized_memory_gb = 0
    
    for workload in running_workloads:
        workload_metrics = [m for m in recent_metrics if m.workload_id == workload.id]
        if workload_metrics:
            avg_cpu = sum(m.cpu_usage for m in workload_metrics) / len(workload_metrics)
            avg_gpu = sum(m.gpu_usage for m in workload_metrics) / len(workload_metrics)
            avg_memory = sum(m.memory_usage for m in workload_metrics) / len(workload_metrics)
            
            utilized_cpu_cores += workload.cpu_cores * (avg_cpu / 100)
            utilized_gpu_count += workload.gpu_count * (avg_gpu / 100)
            utilized_memory_gb += workload.memory_gb * (avg_memory / 100)
    
    # Format workload data
    workload_data = []
    for workload in running_workloads:
        workload_metrics = [m for m in recent_metrics if m.workload_id == workload.id]
        if workload_metrics:
            latest_metric = max(workload_metrics, key=lambda x: x.timestamp)
            workload_data.append({
                "id": workload.id,
                "name": workload.name,
                "type": workload.type,
                "cpu_usage": latest_metric.cpu_usage,
                "gpu_usage": latest_metric.gpu_usage,
                "memory_usage": latest_metric.memory_usage,
                "status": workload.status
            })
    
    return {
        "total_cpu_cores": total_cpu_cores,
        "total_gpu_count": total_gpu_count,
        "total_memory_gb": total_memory_gb,
        "utilized_cpu_cores": utilized_cpu_cores,
        "utilized_gpu_count": utilized_gpu_count,
        "utilized_memory_gb": utilized_memory_gb,
        "workloads": workload_data
    }

@router.get("/performance-trends")
def get_performance_trends(days: int = 7, db: Session = Depends(get_db)):
    """Get performance trends over time"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get all metrics in time range
    metrics = db.query(Metric).filter(
        Metric.timestamp >= start_date
    ).order_by(Metric.timestamp.asc()).all()
    
    # Group metrics by date
    daily_metrics = {}
    for metric in metrics:
        date = metric.timestamp.date()
        if date not in daily_metrics:
            daily_metrics[date] = []
        daily_metrics[date].append(metric)
    
    # Calculate daily averages
    trends = []
    for date, day_metrics in daily_metrics.items():
        if day_metrics:
            avg_cpu = sum(m.cpu_usage for m in day_metrics) / len(day_metrics)
            avg_gpu = sum(m.gpu_usage for m in day_metrics) / len(day_metrics)
            avg_memory = sum(m.memory_usage for m in day_metrics) / len(day_metrics)
            total_cost = sum(m.cost_accumulation for m in day_metrics)
            
            trends.append({
                "date": date.isoformat(),
                "avg_cpu_usage": avg_cpu,
                "avg_gpu_usage": avg_gpu,
                "avg_memory_usage": avg_memory,
                "total_cost": total_cost,
                "metric_count": len(day_metrics)
            })
    
    return {
        "trends": trends,
        "period_days": days,
        "total_metrics": len(metrics)
    }

@router.post("/generate-sample-metrics/{workload_id}")
def generate_sample_metrics(workload_id: int, count: int = 10, db: Session = Depends(get_db)):
    """Generate sample metrics for testing/demo purposes"""
    
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    # Generate sample metrics
    for i in range(count):
        # Generate realistic usage patterns
        base_time = datetime.utcnow() - timedelta(hours=count-i)
        
        # Simulate realistic usage patterns
        cpu_usage = random.uniform(60, 90) + random.uniform(-10, 10)
        gpu_usage = random.uniform(70, 95) if workload.gpu_count > 0 else 0
        memory_usage = random.uniform(50, 80) + random.uniform(-5, 5)
        
        # Ensure values are within bounds
        cpu_usage = max(0, min(100, cpu_usage))
        gpu_usage = max(0, min(100, gpu_usage))
        memory_usage = max(0, min(100, memory_usage))
        
        # Calculate cost accumulation
        cost_accumulation = workload.cost_per_hour * (i + 1)
        
        metric = Metric(
            workload_id=workload_id,
            timestamp=base_time,
            cpu_usage=cpu_usage,
            gpu_usage=gpu_usage,
            memory_usage=memory_usage,
            cost_accumulation=cost_accumulation
        )
        
        db.add(metric)
    
    db.commit()
    
    return {"message": f"Generated {count} sample metrics for workload {workload_id}"}

@router.get("/alerts")
def get_system_alerts(db: Session = Depends(get_db)):
    """Get system alerts based on current metrics"""
    
    alerts = []
    
    # Get recent metrics
    recent_metrics = db.query(Metric).filter(
        Metric.timestamp >= datetime.utcnow() - timedelta(hours=1)
    ).all()
    
    # Check for high resource usage
    for metric in recent_metrics:
        if metric.cpu_usage > 90:
            alerts.append({
                "type": "warning",
                "message": f"High CPU usage ({metric.cpu_usage:.1f}%) detected",
                "workload_id": metric.workload_id,
                "timestamp": metric.timestamp.isoformat()
            })
        
        if metric.memory_usage > 90:
            alerts.append({
                "type": "warning",
                "message": f"High memory usage ({metric.memory_usage:.1f}%) detected",
                "workload_id": metric.workload_id,
                "timestamp": metric.timestamp.isoformat()
            })
        
        if metric.gpu_usage > 95:
            alerts.append({
                "type": "warning",
                "message": f"Very high GPU usage ({metric.gpu_usage:.1f}%) detected",
                "workload_id": metric.workload_id,
                "timestamp": metric.timestamp.isoformat()
            })
    
    # Check for idle workloads
    running_workloads = db.query(Workload).filter(Workload.status == "running").all()
    for workload in running_workloads:
        workload_metrics = [m for m in recent_metrics if m.workload_id == workload.id]
        if workload_metrics:
            avg_cpu = sum(m.cpu_usage for m in workload_metrics) / len(workload_metrics)
            if avg_cpu < 10:
                alerts.append({
                    "type": "info",
                    "message": f"Workload '{workload.name}' appears to be idle (CPU: {avg_cpu:.1f}%)",
                    "workload_id": workload.id,
                    "timestamp": datetime.utcnow().isoformat()
                })
    
    return {
        "alerts": alerts,
        "total_alerts": len(alerts),
        "critical_count": len([a for a in alerts if a["type"] == "critical"]),
        "warning_count": len([a for a in alerts if a["type"] == "warning"]),
        "info_count": len([a for a in alerts if a["type"] == "info"])
    }
