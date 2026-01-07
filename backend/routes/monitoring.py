"""Monitoring and metrics routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
import time
from datetime import datetime, timedelta
from backend.database import get_table
from backend.models.dynamodb import (
    Metric, MetricCreate, DashboardStats, PerformanceTrend
)
from backend.auth.dependencies import get_current_user_optional

router = APIRouter(prefix="/api", tags=["monitoring"])


@router.get("/metrics", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user = Depends(get_current_user_optional)
):
    """Get dashboard statistics"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        workloads_table = get_table('workloads')
        metrics_table = get_table('metrics')
        
        # Get all workloads for tenant
        try:
            workloads_response = workloads_table.query(
                IndexName='tenant-id-index',
                KeyConditionExpression='tenant_id = :tenant_id',
                ExpressionAttributeValues={':tenant_id': tenant_id}
            )
        except Exception:
            # Fallback to scan if GSI doesn't exist yet
            workloads_response = workloads_table.scan(
                FilterExpression='tenant_id = :tenant_id',
                ExpressionAttributeValues={':tenant_id': tenant_id}
            )
        
        workloads = workloads_response.get('Items', [])
        total_workloads = len(workloads)
        running_workloads = sum(1 for w in workloads if w.get('status') == 'running')
        
        # Calculate total monthly cost (estimate)
        total_monthly_cost = sum(
            float(w.get('cost_per_hour', 0)) * 24 * 30
            for w in workloads
        )
        
        # Get recent metrics
        all_metrics = []
        for workload in workloads:
            workload_id = workload['id']
            try:
                metrics_response = metrics_table.query(
                    IndexName='workload-id-timestamp-index',
                    KeyConditionExpression='workload_id = :workload_id',
                    ExpressionAttributeValues={':workload_id': workload_id},
                    Limit=10,
                    ScanIndexForward=False  # Most recent first
                )
            except Exception:
                # Fallback to scan if GSI doesn't exist yet
                metrics_response = metrics_table.scan(
                    FilterExpression='workload_id = :workload_id',
                    ExpressionAttributeValues={':workload_id': workload_id},
                    Limit=10
                )
            all_metrics.extend(metrics_response.get('Items', []))
        
        # Calculate averages
        if all_metrics:
            avg_cpu = sum(float(m.get('cpu_usage', 0)) for m in all_metrics) / len(all_metrics)
            avg_memory = sum(float(m.get('memory_usage', 0)) for m in all_metrics) / len(all_metrics)
        else:
            avg_cpu = 0.0
            avg_memory = 0.0
        
        # Recent activity (simplified)
        recent_activity = [
            {
                'action': f"Started {w['name']}",
                'status': w.get('status', 'pending'),
                'timestamp': w.get('created_at', str(int(time.time())))
            }
            for w in workloads[:3]
        ]
        
        return DashboardStats(
            total_workloads=total_workloads,
            running_workloads=running_workloads,
            total_monthly_cost=round(total_monthly_cost, 2),
            cost_savings=round(total_monthly_cost * 0.15, 2),  # Estimate
            avg_cpu_usage=round(avg_cpu, 1),
            avg_memory_usage=round(avg_memory, 1),
            recent_activity=recent_activity
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard stats: {str(e)}"
        )


@router.get("/metrics/{workload_id}", response_model=List[Metric])
async def get_workload_metrics(
    workload_id: str,
    hours: int = 24,
    current_user = Depends(get_current_user_optional)
):
    """Get metrics for a specific workload"""
    try:
        metrics_table = get_table('metrics')
        
        # Calculate timestamp threshold
        threshold = int(time.time()) - (hours * 3600)
        
        try:
            response = metrics_table.query(
                IndexName='workload-id-timestamp-index',
                KeyConditionExpression='workload_id = :workload_id AND #timestamp >= :threshold',
                ExpressionAttributeValues={
                    ':workload_id': workload_id,
                    ':threshold': threshold
                },
                ExpressionAttributeNames={
                    '#timestamp': 'timestamp'
                },
                ScanIndexForward=False  # Most recent first
            )
        except Exception:
            # Fallback to scan if GSI doesn't exist yet
            response = metrics_table.scan(
                FilterExpression='workload_id = :workload_id AND #timestamp >= :threshold',
                ExpressionAttributeValues={
                    ':workload_id': workload_id,
                    ':threshold': threshold
                },
                ExpressionAttributeNames={
                    '#timestamp': 'timestamp'
                }
            )
        
        metrics = [Metric(**item) for item in response.get('Items', [])]
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching metrics: {str(e)}"
        )


@router.post("/metrics", response_model=Metric, status_code=status.HTTP_201_CREATED)
async def create_metric(
    metric: MetricCreate,
    current_user = Depends(get_current_user_optional)
):
    """Create a new metric"""
    try:
        metrics_table = get_table('metrics')
        
        metric_id = str(uuid.uuid4())
        timestamp = int(time.time())
        
        metric_item = {
            'id': metric_id,
            'workload_id': metric.workload_id,
            'cpu_usage': metric.cpu_usage,
            'memory_usage': metric.memory_usage,
            'gpu_usage': metric.gpu_usage if metric.gpu_usage is not None else 0.0,
            'timestamp': timestamp
        }
        
        metrics_table.put_item(Item=metric_item)
        
        return Metric(**metric_item)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating metric: {str(e)}"
        )


@router.get("/performance", response_model=List[PerformanceTrend])
async def get_performance_trends(
    days: int = 7,
    current_user = Depends(get_current_user_optional)
):
    """Get performance trends over time"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        workloads_table = get_table('workloads')
        metrics_table = get_table('metrics')
        
        # Get workloads for tenant
        try:
            workloads_response = workloads_table.query(
                IndexName='tenant-id-index',
                KeyConditionExpression='tenant_id = :tenant_id',
                ExpressionAttributeValues={':tenant_id': tenant_id}
            )
        except Exception:
            # Fallback to scan if GSI doesn't exist yet
            workloads_response = workloads_table.scan(
                FilterExpression='tenant_id = :tenant_id',
                ExpressionAttributeValues={':tenant_id': tenant_id}
            )
        workloads = workloads_response.get('Items', [])
        
        # Generate trend data (simplified - in production, aggregate real metrics)
        trends = []
        end_date = datetime.now()
        
        for i in range(days):
            date = end_date - timedelta(days=days - i - 1)
            date_str = date.strftime('%Y-%m-%d')
            
            # Aggregate metrics for this date (simplified)
            total_cost = sum(float(w.get('cost_per_hour', 0)) * 24 for w in workloads)
            avg_cpu = 65.0 + (i % 5) * 3  # Simulated variation
            avg_memory = 70.0 + (i % 5) * 2
            avg_gpu = 45.0 + (i % 5) * 3
            
            trends.append(PerformanceTrend(
                date=date_str,
                total_cost=round(total_cost, 2),
                cpu_usage=round(avg_cpu, 1),
                memory_usage=round(avg_memory, 1),
                gpu_usage=round(avg_gpu, 1)
            ))
        
        return trends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching performance trends: {str(e)}"
        )

