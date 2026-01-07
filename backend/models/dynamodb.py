"""Pydantic models for DynamoDB entities"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class WorkloadType(str, Enum):
    training = "training"
    inference = "inference"


class WorkloadStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    stopped = "stopped"


class OptimizationStatus(str, Enum):
    pending = "pending"
    applied = "applied"
    rejected = "rejected"


class UserRole(str, Enum):
    admin = "admin"
    operator = "operator"
    viewer = "viewer"


# Base Models
class TenantBase(BaseModel):
    name: str


class TenantCreate(TenantBase):
    pass


class Tenant(TenantBase):
    id: str
    created_at: str
    
    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.viewer


class UserCreate(UserBase):
    password: str
    tenant_id: str


class User(UserBase):
    id: str
    tenant_id: str
    is_active: bool = True
    created_at: str
    
    class Config:
        from_attributes = True


class WorkloadBase(BaseModel):
    name: str
    type: WorkloadType
    cpu_cores: int = Field(gt=0)
    gpu_count: int = Field(ge=0, default=0)
    memory_gb: float = Field(gt=0)


class WorkloadCreate(WorkloadBase):
    tenant_id: str


class WorkloadUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[WorkloadType] = None
    cpu_cores: Optional[int] = Field(None, gt=0)
    gpu_count: Optional[int] = Field(None, ge=0)
    memory_gb: Optional[float] = Field(None, gt=0)
    status: Optional[WorkloadStatus] = None


class Workload(WorkloadBase):
    id: str
    status: WorkloadStatus
    cost_per_hour: float
    tenant_id: str
    created_at: str
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True


class MetricBase(BaseModel):
    workload_id: str
    cpu_usage: float = Field(ge=0, le=100)
    memory_usage: float = Field(ge=0, le=100)
    gpu_usage: Optional[float] = Field(None, ge=0, le=100)


class MetricCreate(MetricBase):
    pass


class Metric(MetricBase):
    id: str
    timestamp: str
    
    class Config:
        from_attributes = True


class OptimizationBase(BaseModel):
    workload_id: str
    recommendation: str
    potential_savings: float = Field(ge=0)


class OptimizationCreate(OptimizationBase):
    pass


class Optimization(OptimizationBase):
    id: str
    status: OptimizationStatus
    created_at: str
    
    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    title: str
    content: str
    doc_type: str = "guide"


class DocumentCreate(DocumentBase):
    tenant_id: str
    s3_key: Optional[str] = None


class Document(DocumentBase):
    id: str
    s3_key: Optional[str] = None
    tenant_id: str
    upload_date: str
    
    class Config:
        from_attributes = True


class RAGQueryBase(BaseModel):
    query: str
    tenant_id: str


class RAGQueryCreate(RAGQueryBase):
    pass


class RAGQueryResponse(BaseModel):
    id: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence_score: float = Field(ge=0, le=1)
    created_at: str


class RAGQuery(RAGQueryBase):
    id: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence_score: float
    created_at: str
    
    class Config:
        from_attributes = True


# Dashboard and Analytics Models
class DashboardStats(BaseModel):
    total_workloads: int
    running_workloads: int
    total_monthly_cost: float
    cost_savings: float
    avg_cpu_usage: float
    avg_memory_usage: float
    recent_activity: Optional[List[Dict[str, Any]]] = None


class CostAnalysis(BaseModel):
    total_monthly_cost: float
    total_potential_savings: float
    savings_percentage: float
    optimization_opportunities: List[Dict[str, Any]]


class EfficiencyAnalysis(BaseModel):
    workloads: List[Dict[str, Any]]


class SavingsSummary(BaseModel):
    applied_optimizations: int
    total_savings: float
    monthly_savings: float


class PerformanceTrend(BaseModel):
    date: str
    total_cost: Optional[float] = None
    cpu_usage: Optional[float] = None
    memory_usage: Optional[float] = None
    gpu_usage: Optional[float] = None

