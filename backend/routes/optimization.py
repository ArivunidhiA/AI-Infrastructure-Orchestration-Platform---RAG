from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models import Workload, Optimization
from services.resource_optimizer import ResourceOptimizer
from services.cost_calculator import CostCalculator
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/optimization", tags=["optimization"])

# Pydantic models
class OptimizationResponse(BaseModel):
    id: int
    workload_id: int
    recommendation: str
    potential_savings: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class OptimizationApply(BaseModel):
    recommendation_id: int
    apply: bool = True

@router.get("/recommendations", response_model=List[OptimizationResponse])
def get_optimization_recommendations(
    status_filter: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get optimization recommendations"""
    
    query = db.query(Optimization)
    
    if status_filter:
        query = query.filter(Optimization.status == status_filter)
    
    optimizations = query.order_by(Optimization.created_at.desc()).limit(limit).all()
    return optimizations

@router.get("/recommendations/{workload_id}", response_model=List[OptimizationResponse])
def get_workload_optimizations(workload_id: int, db: Session = Depends(get_db)):
    """Get optimization recommendations for a specific workload"""
    
    # Verify workload exists
    workload = db.query(Workload).filter(Workload.id == workload_id).first()
    if not workload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workload not found"
        )
    
    optimizations = db.query(Optimization).filter(
        Optimization.workload_id == workload_id
    ).order_by(Optimization.created_at.desc()).all()
    
    return optimizations

@router.post("/recommendations/generate")
def generate_optimization_recommendations(db: Session = Depends(get_db)):
    """Generate optimization recommendations for all workloads"""
    
    optimizer = ResourceOptimizer()
    cost_calculator = CostCalculator()
    
    # Get all running workloads
    running_workloads = db.query(Workload).filter(Workload.status == "running").all()
    
    generated_count = 0
    
    for workload in running_workloads:
        # Check if workload already has pending optimizations
        existing_optimizations = db.query(Optimization).filter(
            Optimization.workload_id == workload.id,
            Optimization.status == "pending"
        ).count()
        
        if existing_optimizations > 0:
            continue  # Skip if already has pending optimizations
        
        # Analyze workload efficiency
        analysis = optimizer.analyze_workload_efficiency(workload)
        
        # Create optimization recommendations
        for rec in analysis["recommendations"]:
            optimization = Optimization(
                workload_id=workload.id,
                recommendation=rec["reason"],
                potential_savings=rec["potential_savings"],
                status="pending"
            )
            db.add(optimization)
            generated_count += 1
    
    db.commit()
    
    return {
        "message": f"Generated {generated_count} optimization recommendations",
        "workloads_analyzed": len(running_workloads)
    }

@router.post("/apply/{recommendation_id}")
def apply_optimization(recommendation_id: int, db: Session = Depends(get_db)):
    """Apply an optimization recommendation"""
    
    optimization = db.query(Optimization).filter(
        Optimization.id == recommendation_id
    ).first()
    
    if not optimization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Optimization recommendation not found"
        )
    
    if optimization.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Optimization has already been processed"
        )
    
    # Apply the optimization (in a real system, this would trigger actual changes)
    optimization.status = "applied"
    db.commit()
    
    return {
        "message": "Optimization applied successfully",
        "optimization_id": recommendation_id,
        "potential_savings": optimization.potential_savings
    }

@router.post("/reject/{recommendation_id}")
def reject_optimization(recommendation_id: int, db: Session = Depends(get_db)):
    """Reject an optimization recommendation"""
    
    optimization = db.query(Optimization).filter(
        Optimization.id == recommendation_id
    ).first()
    
    if not optimization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Optimization recommendation not found"
        )
    
    if optimization.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Optimization has already been processed"
        )
    
    optimization.status = "rejected"
    db.commit()
    
    return {
        "message": "Optimization rejected",
        "optimization_id": recommendation_id
    }

@router.get("/cost-analysis")
def get_cost_optimization_analysis(db: Session = Depends(get_db)):
    """Get comprehensive cost optimization analysis"""
    
    cost_calculator = CostCalculator()
    all_workloads = db.query(Workload).all()
    
    if not all_workloads:
        return {
            "message": "No workloads found for analysis",
            "total_workloads": 0,
            "total_monthly_cost": 0,
            "potential_savings": 0
        }
    
    # Generate cost optimization report
    report = cost_calculator.generate_cost_optimization_report(all_workloads)
    
    return report

@router.get("/efficiency-analysis")
def get_efficiency_analysis(db: Session = Depends(get_db)):
    """Get efficiency analysis for all workloads"""
    
    optimizer = ResourceOptimizer()
    all_workloads = db.query(Workload).all()
    
    efficiency_data = []
    total_potential_savings = 0
    
    for workload in all_workloads:
        analysis = optimizer.analyze_workload_efficiency(workload)
        
        efficiency_data.append({
            "workload_id": workload.id,
            "workload_name": workload.name,
            "workload_type": workload.type,
            "efficiency_score": analysis["efficiency_score"],
            "current_cost": analysis["current_cost"],
            "potential_savings": analysis["total_potential_savings"],
            "recommendations_count": len(analysis["recommendations"])
        })
        
        total_potential_savings += analysis["total_potential_savings"]
    
    # Sort by efficiency score (lowest first - most inefficient)
    efficiency_data.sort(key=lambda x: x["efficiency_score"])
    
    return {
        "workloads": efficiency_data,
        "total_workloads": len(all_workloads),
        "total_potential_savings": total_potential_savings,
        "average_efficiency": sum(w["efficiency_score"] for w in efficiency_data) / len(efficiency_data) if efficiency_data else 0
    }

@router.get("/auto-scaling-recommendations")
def get_auto_scaling_recommendations(db: Session = Depends(get_db)):
    """Get auto-scaling recommendations for workloads"""
    
    optimizer = ResourceOptimizer()
    running_workloads = db.query(Workload).filter(Workload.status == "running").all()
    
    scaling_recommendations = []
    
    for workload in running_workloads:
        # Get recent metrics for the workload
        from ..models import Metric
        recent_metrics = db.query(Metric).filter(
            Metric.workload_id == workload.id,
            Metric.timestamp >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        if recent_metrics:
            # Convert to dict format for the optimizer
            metrics_data = []
            for metric in recent_metrics:
                metrics_data.append({
                    "cpu_usage": metric.cpu_usage,
                    "gpu_usage": metric.gpu_usage,
                    "memory_usage": metric.memory_usage
                })
            
            # Get scaling recommendations
            scaling_rec = optimizer.generate_auto_scaling_recommendations(workload, metrics_data)
            
            if scaling_rec["recommendations"]:
                scaling_recommendations.append({
                    "workload_id": workload.id,
                    "workload_name": workload.name,
                    "recommendations": scaling_rec["recommendations"],
                    "current_utilization": scaling_rec["current_utilization"],
                    "confidence": scaling_rec["confidence"]
                })
    
    return {
        "scaling_recommendations": scaling_recommendations,
        "total_workloads_analyzed": len(running_workloads),
        "workloads_with_recommendations": len(scaling_recommendations)
    }

@router.get("/savings-summary")
def get_savings_summary(db: Session = Depends(get_db)):
    """Get summary of cost savings from applied optimizations"""
    
    # Get applied optimizations
    applied_optimizations = db.query(Optimization).filter(
        Optimization.status == "applied"
    ).all()
    
    total_savings = sum(opt.potential_savings for opt in applied_optimizations)
    
    # Get pending optimizations
    pending_optimizations = db.query(Optimization).filter(
        Optimization.status == "pending"
    ).all()
    
    potential_savings = sum(opt.potential_savings for opt in pending_optimizations)
    
    # Get rejected optimizations
    rejected_optimizations = db.query(Optimization).filter(
        Optimization.status == "rejected"
    ).all()
    
    rejected_savings = sum(opt.potential_savings for opt in rejected_optimizations)
    
    return {
        "applied_optimizations": len(applied_optimizations),
        "total_savings": total_savings,
        "pending_optimizations": len(pending_optimizations),
        "potential_savings": potential_savings,
        "rejected_optimizations": len(rejected_optimizations),
        "rejected_savings": rejected_savings,
        "total_optimizations": len(applied_optimizations) + len(pending_optimizations) + len(rejected_optimizations)
    }

@router.delete("/recommendations/{recommendation_id}")
def delete_optimization(recommendation_id: int, db: Session = Depends(get_db)):
    """Delete an optimization recommendation"""
    
    optimization = db.query(Optimization).filter(
        Optimization.id == recommendation_id
    ).first()
    
    if not optimization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Optimization recommendation not found"
        )
    
    db.delete(optimization)
    db.commit()
    
    return {"message": "Optimization recommendation deleted successfully"}
