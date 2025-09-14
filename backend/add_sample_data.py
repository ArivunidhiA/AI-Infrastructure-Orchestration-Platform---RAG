#!/usr/bin/env python3
"""
Script to add sample workloads and data to the database for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import get_db, engine
from models import Workload, Metric, Optimization
from datetime import datetime, timedelta
import random

def add_sample_workloads():
    """Add sample workloads to the database"""
    db = next(get_db())
    
    try:
        # Check if workloads already exist
        existing_workloads = db.query(Workload).count()
        if existing_workloads > 0:
            print(f"Found {existing_workloads} existing workloads. Skipping sample data creation.")
            return
        
        # Sample workloads
        sample_workloads = [
            {
                "name": "Image Classification Model",
                "type": "inference",
                "status": "running",
                "cpu_cores": 8,
                "gpu_count": 2,
                "memory_gb": 32.0,
                "cost_per_hour": 12.50,
                "created_at": datetime.now() - timedelta(hours=2)
            },
            {
                "name": "NLP Model Inference",
                "type": "inference", 
                "status": "running",
                "cpu_cores": 16,
                "gpu_count": 4,
                "memory_gb": 64.0,
                "cost_per_hour": 25.00,
                "created_at": datetime.now() - timedelta(hours=1)
            },
            {
                "name": "Recommendation System Batch",
                "type": "training",
                "status": "completed",
                "cpu_cores": 12,
                "gpu_count": 4,
                "memory_gb": 48.0,
                "cost_per_hour": 20.00,
                "created_at": datetime.now() - timedelta(hours=3)
            },
            {
                "name": "Computer Vision Training",
                "type": "training",
                "status": "running",
                "cpu_cores": 20,
                "gpu_count": 8,
                "memory_gb": 128.0,
                "cost_per_hour": 45.00,
                "created_at": datetime.now() - timedelta(minutes=30)
            }
        ]
        
        # Create workloads
        for workload_data in sample_workloads:
            workload = Workload(**workload_data)
            db.add(workload)
        
        db.commit()
        print(f"Added {len(sample_workloads)} sample workloads")
        
        # Add sample metrics for running workloads
        running_workloads = db.query(Workload).filter(Workload.status == "running").all()
        
        for workload in running_workloads:
            # Add metrics for the last 24 hours
            for i in range(24):
                timestamp = datetime.now() - timedelta(hours=i)
                metric = Metric(
                    workload_id=workload.id,
                    timestamp=timestamp,
                    cpu_usage=random.uniform(60, 90),
                    gpu_usage=random.uniform(40, 80) if workload.gpu_count > 0 else 0,
                    memory_usage=random.uniform(65, 85),
                    cost_accumulation=workload.cost_per_hour * (i + 1)
                )
                db.add(metric)
        
        db.commit()
        print(f"Added sample metrics for {len(running_workloads)} running workloads")
        
        # Add sample optimization recommendations
        sample_recommendations = [
            {
                "workload_id": running_workloads[0].id if running_workloads else 1,
                "recommendation": "Consider reducing GPU count from 2 to 1. Current GPU utilization is only 45%.",
                "potential_savings": 6.25,
                "status": "pending"
            },
            {
                "workload_id": running_workloads[1].id if len(running_workloads) > 1 else 1,
                "recommendation": "Scale down CPU cores from 16 to 12. CPU utilization averages 70%.",
                "potential_savings": 8.50,
                "status": "pending"
            },
            {
                "workload_id": running_workloads[0].id if running_workloads else 1,
                "recommendation": "Implement auto-scaling based on demand patterns.",
                "potential_savings": 15.00,
                "status": "pending"
            }
        ]
        
        for rec_data in sample_recommendations:
            optimization = Optimization(**rec_data)
            db.add(optimization)
        
        db.commit()
        print(f"Added {len(sample_recommendations)} sample optimization recommendations")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_workloads()
    print("Sample data creation completed!")
