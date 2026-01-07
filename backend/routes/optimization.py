"""Cost optimization routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
import time
from backend.database import get_table
from backend.models.dynamodb import (
    Optimization, OptimizationCreate, OptimizationStatus,
    CostAnalysis, EfficiencyAnalysis, SavingsSummary
)
from backend.auth.dependencies import get_current_user_optional

router = APIRouter(prefix="/api", tags=["optimization"])


@router.get("/optimization", response_model=List[Optimization])
async def get_optimizations(
    status_filter: str = None,
    limit: int = 50,
    current_user = Depends(get_current_user_optional)
):
    """Get optimization recommendations"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        optimizations_table = get_table('optimizations')
        workloads_table = get_table('workloads')
        
        # Get workloads for tenant
        workloads_response = workloads_table.query(
            IndexName='tenant-id-index',
            KeyConditionExpression='tenant_id = :tenant_id',
            ExpressionAttributeValues={':tenant_id': tenant_id}
        )
        workloads = workloads_response.get('Items', [])
        
        # Get optimizations
        if status_filter:
            response = optimizations_table.query(
                IndexName='status-index',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeValues={':status': status_filter},
                ExpressionAttributeNames={'#status': 'status'},
                Limit=limit
            )
        else:
            response = optimizations_table.scan(Limit=limit)
        
        optimizations = []
        for item in response.get('Items', []):
            # Filter by tenant (check workload tenant)
            workload_id = item.get('workload_id')
            workload = next((w for w in workloads if w['id'] == workload_id), None)
            if workload:
                optimizations.append(Optimization(**item))
        
        return optimizations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching optimizations: {str(e)}"
        )


@router.post("/optimization", response_model=List[Optimization])
async def generate_recommendations(
    current_user = Depends(get_current_user_optional)
):
    """Generate optimization recommendations"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        workloads_table = get_table('workloads')
        optimizations_table = get_table('optimizations')
        
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
        
        recommendations = []
        for workload in workloads:
            # Generate recommendations based on workload characteristics
            workload_id = workload['id']
            cost_per_hour = float(workload.get('cost_per_hour', 0))
            
            # Recommendation 1: Spot instances
            if cost_per_hour > 2.0:
                rec = {
                    'id': str(uuid.uuid4()),
                    'workload_id': workload_id,
                    'recommendation': f"Consider using spot instances for {workload['name']} to reduce costs by 40%",
                    'potential_savings': round(cost_per_hour * 0.4 * 24 * 30, 2),
                    'status': OptimizationStatus.pending.value,
                    'created_at': str(int(time.time()))
                }
                optimizations_table.put_item(Item=rec)
                recommendations.append(Optimization(**rec))
            
            # Recommendation 2: Right-sizing
            if float(workload.get('cpu_usage', 0)) < 50:
                rec = {
                    'id': str(uuid.uuid4()),
                    'workload_id': workload_id,
                    'recommendation': f"Right-size {workload['name']} - CPU usage is low, consider smaller instance",
                    'potential_savings': round(cost_per_hour * 0.2 * 24 * 30, 2),
                    'status': OptimizationStatus.pending.value,
                    'created_at': str(int(time.time()))
                }
                optimizations_table.put_item(Item=rec)
                recommendations.append(Optimization(**rec))
        
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.post("/optimization/{optimization_id}/apply", response_model=Optimization)
async def apply_optimization(
    optimization_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Apply an optimization"""
    try:
        optimizations_table = get_table('optimizations')
        
        optimizations_table.update_item(
            Key={'id': optimization_id},
            UpdateExpression="SET #status = :status, updated_at = :updated_at",
            ExpressionAttributeValues={
                ':status': OptimizationStatus.applied.value,
                ':updated_at': str(int(time.time()))
            },
            ExpressionAttributeNames={'#status': 'status'},
            ReturnValues='ALL_NEW'
        )
        
        response = optimizations_table.get_item(Key={'id': optimization_id})
        return Optimization(**response['Item'])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying optimization: {str(e)}"
        )


@router.get("/cost-analysis", response_model=CostAnalysis)
async def get_cost_analysis(
    current_user = Depends(get_current_user_optional)
):
    """Get cost analysis"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        workloads_table = get_table('workloads')
        
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
        
        total_monthly_cost = sum(
            float(w.get('cost_per_hour', 0)) * 24 * 30
            for w in workloads
        )
        
        total_potential_savings = total_monthly_cost * 0.2  # 20% estimate
        savings_percentage = 20.1
        
        opportunities = [
            {
                'workload_name': w['name'],
                'current_cost': round(float(w.get('cost_per_hour', 0)) * 24 * 30, 2),
                'optimized_cost': round(float(w.get('cost_per_hour', 0)) * 24 * 30 * 0.8, 2),
                'potential_savings': round(float(w.get('cost_per_hour', 0)) * 24 * 30 * 0.2, 2),
                'recommendation': f"Optimize {w['name']} resources"
            }
            for w in workloads[:2]
        ]
        
        return CostAnalysis(
            total_monthly_cost=round(total_monthly_cost, 2),
            total_potential_savings=round(total_potential_savings, 2),
            savings_percentage=savings_percentage,
            optimization_opportunities=opportunities
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching cost analysis: {str(e)}"
        )


@router.get("/efficiency-analysis", response_model=EfficiencyAnalysis)
async def get_efficiency_analysis(
    current_user = Depends(get_current_user_optional)
):
    """Get efficiency analysis"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        workloads_table = get_table('workloads')
        
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
        
        efficiency_data = [
            {
                'workload_id': w['id'],
                'workload_name': w['name'],
                'workload_type': w.get('type', 'inference'),
                'efficiency_score': 0.75 + (hash(w['id']) % 20) / 100,  # Simulated
                'current_cost': float(w.get('cost_per_hour', 0)),
                'potential_savings': float(w.get('cost_per_hour', 0)) * 0.2,
                'recommendations_count': 2
            }
            for w in workloads
        ]
        
        return EfficiencyAnalysis(workloads=efficiency_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching efficiency analysis: {str(e)}"
        )


@router.get("/savings-summary", response_model=SavingsSummary)
async def get_savings_summary(
    current_user = Depends(get_current_user_optional)
):
    """Get savings summary"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        optimizations_table = get_table('optimizations')
        
        # Count applied optimizations
        try:
            response = optimizations_table.query(
                IndexName='status-index',
                KeyConditionExpression='#status = :status',
                ExpressionAttributeValues={':status': OptimizationStatus.applied.value},
                ExpressionAttributeNames={'#status': 'status'}
            )
        except Exception:
            # Fallback to scan if GSI doesn't exist yet
            response = optimizations_table.scan(
                FilterExpression='#status = :status',
                ExpressionAttributeValues={':status': OptimizationStatus.applied.value},
                ExpressionAttributeNames={'#status': 'status'}
            )
        
        applied_items = response.get('Items', [])
        applied_count = len(applied_items)
        
        # Calculate savings
        total_savings = sum(
            float(item.get('potential_savings', 0))
            for item in applied_items
        )
        
        return SavingsSummary(
            applied_optimizations=applied_count,
            total_savings=round(total_savings, 2),
            monthly_savings=round(total_savings / 12, 2)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching savings summary: {str(e)}"
        )

