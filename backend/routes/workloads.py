"""Workload management routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid
import time
from backend.database import get_table
from backend.models.dynamodb import (
    Workload, WorkloadCreate, WorkloadUpdate, WorkloadStatus
)
from backend.auth.dependencies import get_current_user_optional

router = APIRouter(prefix="/api/workloads", tags=["workloads"])


def calculate_cost(cpu_cores: int, gpu_count: int, memory_gb: float) -> float:
    """Calculate cost per hour based on resources"""
    base_cost = 0.1
    cpu_cost = cpu_cores * 0.05
    gpu_cost = gpu_count * 2.0
    memory_cost = memory_gb * 0.01
    return round(base_cost + cpu_cost + gpu_cost + memory_cost, 2)


@router.get("/", response_model=List[Workload])
async def get_workloads(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user_optional)
):
    """Get all workloads for current tenant"""
    try:
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        workloads_table = get_table('workloads')
        
        # Query by tenant_id using GSI
        try:
            response = workloads_table.query(
                IndexName='tenant-id-index',
                KeyConditionExpression='tenant_id = :tenant_id',
                ExpressionAttributeValues={':tenant_id': tenant_id},
                Limit=limit
            )
        except Exception:
            # Fallback to scan if GSI doesn't exist yet
            response = workloads_table.scan(
                FilterExpression='tenant_id = :tenant_id',
                ExpressionAttributeValues={':tenant_id': tenant_id},
                Limit=limit
            )
        
        workloads = []
        for item in response.get('Items', []):
            workloads.append(Workload(**item))
        
        return workloads
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching workloads: {str(e)}"
        )


@router.get("/{workload_id}", response_model=Workload)
async def get_workload(
    workload_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Get specific workload by ID"""
    try:
        workloads_table = get_table('workloads')
        response = workloads_table.get_item(Key={'id': workload_id})
        
        if 'Item' not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workload not found"
            )
        
        workload = Workload(**response['Item'])
        
        # Check tenant access
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        if workload.tenant_id != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return workload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching workload: {str(e)}"
        )


@router.post("/", response_model=Workload, status_code=status.HTTP_201_CREATED)
async def create_workload(
    workload: WorkloadCreate,
    current_user = Depends(get_current_user_optional)
):
    """Create new workload"""
    try:
        tenant_id = current_user.tenant_id if current_user else workload.tenant_id or "default-tenant"
        workloads_table = get_table('workloads')
        
        workload_id = str(uuid.uuid4())
        cost_per_hour = calculate_cost(
            workload.cpu_cores,
            workload.gpu_count,
            workload.memory_gb
        )
        
        workload_item = {
            'id': workload_id,
            'name': workload.name,
            'type': workload.type.value,
            'status': WorkloadStatus.pending.value,
            'cpu_cores': workload.cpu_cores,
            'gpu_count': workload.gpu_count,
            'memory_gb': workload.memory_gb,
            'cost_per_hour': cost_per_hour,
            'tenant_id': tenant_id,
            'created_at': str(int(time.time())),
            'updated_at': str(int(time.time()))
        }
        
        workloads_table.put_item(Item=workload_item)
        
        return Workload(**workload_item)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating workload: {str(e)}"
        )


@router.put("/{workload_id}", response_model=Workload)
async def update_workload(
    workload_id: str,
    workload_update: WorkloadUpdate,
    current_user = Depends(get_current_user_optional)
):
    """Update workload"""
    try:
        workloads_table = get_table('workloads')
        
        # Get existing workload
        response = workloads_table.get_item(Key={'id': workload_id})
        if 'Item' not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workload not found"
            )
        
        existing = response['Item']
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        if existing['tenant_id'] != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update fields
        update_expression = "SET updated_at = :updated_at"
        expression_attribute_values = {':updated_at': str(int(time.time()))}
        
        if workload_update.name:
            update_expression += ", #name = :name"
            expression_attribute_values[':name'] = workload_update.name
        if workload_update.type:
            update_expression += ", #type = :type"
            expression_attribute_values[':type'] = workload_update.type.value
        if workload_update.cpu_cores is not None:
            update_expression += ", cpu_cores = :cpu_cores"
            expression_attribute_values[':cpu_cores'] = workload_update.cpu_cores
        if workload_update.gpu_count is not None:
            update_expression += ", gpu_count = :gpu_count"
            expression_attribute_values[':gpu_count'] = workload_update.gpu_count
        if workload_update.memory_gb is not None:
            update_expression += ", memory_gb = :memory_gb"
            expression_attribute_values[':memory_gb'] = workload_update.memory_gb
        if workload_update.status:
            update_expression += ", #status = :status"
            expression_attribute_values[':status'] = workload_update.status.value
        
        # Recalculate cost if resources changed
        cpu_cores = workload_update.cpu_cores if workload_update.cpu_cores else existing['cpu_cores']
        gpu_count = workload_update.gpu_count if workload_update.gpu_count is not None else existing['gpu_count']
        memory_gb = workload_update.memory_gb if workload_update.memory_gb else existing['memory_gb']
        new_cost = calculate_cost(cpu_cores, gpu_count, memory_gb)
        update_expression += ", cost_per_hour = :cost_per_hour"
        expression_attribute_values[':cost_per_hour'] = new_cost
        
        # Update workload
        workloads_table.update_item(
            Key={'id': workload_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames={
                '#name': 'name',
                '#type': 'type',
                '#status': 'status'
            },
            ReturnValues='ALL_NEW'
        )
        
        # Get updated workload
        response = workloads_table.get_item(Key={'id': workload_id})
        return Workload(**response['Item'])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating workload: {str(e)}"
        )


@router.delete("/{workload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workload(
    workload_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Delete workload"""
    try:
        workloads_table = get_table('workloads')
        
        # Check if workload exists and user has access
        response = workloads_table.get_item(Key={'id': workload_id})
        if 'Item' not in response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workload not found"
            )
        
        tenant_id = current_user.tenant_id if current_user else "default-tenant"
        if response['Item']['tenant_id'] != tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        workloads_table.delete_item(Key={'id': workload_id})
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting workload: {str(e)}"
        )


@router.post("/{workload_id}/start", response_model=Workload)
async def start_workload(
    workload_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Start a workload"""
    return await update_workload(
        workload_id,
        WorkloadUpdate(status=WorkloadStatus.running),
        current_user
    )


@router.post("/{workload_id}/stop", response_model=Workload)
async def stop_workload(
    workload_id: str,
    current_user = Depends(get_current_user_optional)
):
    """Stop a workload"""
    return await update_workload(
        workload_id,
        WorkloadUpdate(status=WorkloadStatus.stopped),
        current_user
    )

