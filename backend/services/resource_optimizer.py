import random
from typing import List, Dict, Any
from models import Workload

class ResourceOptimizer:
    """Service for optimizing resource allocation and suggesting improvements"""
    
    def __init__(self):
        self.instance_types = {
            "cpu_optimized": {
                "c5.large": {"cpu": 2, "memory": 4, "cost_per_hour": 0.096},
                "c5.xlarge": {"cpu": 4, "memory": 8, "cost_per_hour": 0.192},
                "c5.2xlarge": {"cpu": 8, "memory": 16, "cost_per_hour": 0.384},
                "c5.4xlarge": {"cpu": 16, "memory": 32, "cost_per_hour": 0.768}
            },
            "gpu_optimized": {
                "p3.2xlarge": {"cpu": 8, "gpu": 1, "memory": 61, "cost_per_hour": 3.06},
                "p3.8xlarge": {"cpu": 32, "gpu": 4, "memory": 244, "cost_per_hour": 12.24},
                "p3.16xlarge": {"cpu": 64, "gpu": 8, "memory": 488, "cost_per_hour": 24.48}
            },
            "memory_optimized": {
                "r5.large": {"cpu": 2, "memory": 16, "cost_per_hour": 0.126},
                "r5.xlarge": {"cpu": 4, "memory": 32, "cost_per_hour": 0.252},
                "r5.2xlarge": {"cpu": 8, "memory": 64, "cost_per_hour": 0.504}
            }
        }
    
    def analyze_workload_efficiency(self, workload: Workload) -> Dict[str, Any]:
        """Analyze current workload configuration and suggest optimizations"""
        
        # Simulate analysis based on workload type and resources
        current_cost = workload.cost_per_hour
        efficiency_score = self._calculate_efficiency_score(workload)
        
        recommendations = []
        
        # CPU optimization
        if workload.type == "inference" and workload.cpu_cores > 8:
            recommendations.append({
                "type": "cpu_optimization",
                "current": f"{workload.cpu_cores} cores",
                "suggested": "4-8 cores",
                "reason": "Inference workloads typically don't need high CPU counts",
                "potential_savings": current_cost * 0.3
            })
        
        # GPU optimization
        if workload.gpu_count > 0 and workload.type == "inference":
            if workload.gpu_count > 1:
                recommendations.append({
                    "type": "gpu_optimization",
                    "current": f"{workload.gpu_count} GPUs",
                    "suggested": "1 GPU",
                    "reason": "Single GPU often sufficient for inference",
                    "potential_savings": current_cost * 0.5
                })
        
        # Memory optimization
        if workload.memory_gb > workload.cpu_cores * 4:
            recommendations.append({
                "type": "memory_optimization",
                "current": f"{workload.memory_gb}GB",
                "suggested": f"{workload.cpu_cores * 4}GB",
                "reason": "Memory allocation may be excessive for CPU count",
                "potential_savings": current_cost * 0.2
            })
        
        # Instance type recommendations
        instance_rec = self._recommend_instance_type(workload)
        if instance_rec:
            recommendations.append(instance_rec)
        
        return {
            "efficiency_score": efficiency_score,
            "current_cost": current_cost,
            "recommendations": recommendations,
            "total_potential_savings": sum(rec["potential_savings"] for rec in recommendations)
        }
    
    def _calculate_efficiency_score(self, workload: Workload) -> float:
        """Calculate efficiency score based on resource utilization"""
        # Mock calculation - in real scenario, would use actual metrics
        base_score = 0.7
        
        # Adjust based on workload type
        if workload.type == "training" and workload.gpu_count > 0:
            base_score += 0.2
        elif workload.type == "inference" and workload.cpu_cores <= 8:
            base_score += 0.1
        
        # Adjust based on memory efficiency
        memory_ratio = workload.memory_gb / (workload.cpu_cores * 4)
        if 0.5 <= memory_ratio <= 2.0:
            base_score += 0.1
        
        return min(1.0, base_score)
    
    def _recommend_instance_type(self, workload: Workload) -> Dict[str, Any]:
        """Recommend optimal instance type based on workload requirements"""
        
        if workload.type == "training" and workload.gpu_count > 0:
            # GPU training workload
            for instance_type, specs in self.instance_types["gpu_optimized"].items():
                if (specs["cpu"] >= workload.cpu_cores and 
                    specs["gpu"] >= workload.gpu_count and 
                    specs["memory"] >= workload.memory_gb):
                    
                    savings = workload.cost_per_hour - specs["cost_per_hour"]
                    if savings > 0:
                        return {
                            "type": "instance_type",
                            "current": f"Custom: {workload.cpu_cores}CPU, {workload.gpu_count}GPU, {workload.memory_gb}GB",
                            "suggested": f"{instance_type}: {specs['cpu']}CPU, {specs['gpu']}GPU, {specs['memory']}GB",
                            "reason": "Pre-configured instance types often more cost-effective",
                            "potential_savings": savings
                        }
        
        elif workload.type == "inference":
            # CPU inference workload
            for instance_type, specs in self.instance_types["cpu_optimized"].items():
                if (specs["cpu"] >= workload.cpu_cores and 
                    specs["memory"] >= workload.memory_gb):
                    
                    savings = workload.cost_per_hour - specs["cost_per_hour"]
                    if savings > 0:
                        return {
                            "type": "instance_type",
                            "current": f"Custom: {workload.cpu_cores}CPU, {workload.memory_gb}GB",
                            "suggested": f"{instance_type}: {specs['cpu']}CPU, {specs['memory']}GB",
                            "reason": "Pre-configured instance types often more cost-effective",
                            "potential_savings": savings
                        }
        
        return None
    
    def generate_auto_scaling_recommendations(self, workload: Workload, metrics: List[Dict]) -> Dict[str, Any]:
        """Generate auto-scaling recommendations based on metrics"""
        
        if not metrics:
            return {"recommendation": "Insufficient data for scaling recommendations"}
        
        # Calculate average utilization
        avg_cpu = sum(m["cpu_usage"] for m in metrics) / len(metrics)
        avg_memory = sum(m["memory_usage"] for m in metrics) / len(metrics)
        
        recommendations = []
        
        # CPU scaling recommendations
        if avg_cpu > 80:
            recommendations.append({
                "type": "scale_up",
                "resource": "CPU",
                "reason": f"High CPU utilization ({avg_cpu:.1f}%)",
                "suggested_action": "Increase CPU cores by 50%"
            })
        elif avg_cpu < 30:
            recommendations.append({
                "type": "scale_down",
                "resource": "CPU",
                "reason": f"Low CPU utilization ({avg_cpu:.1f}%)",
                "suggested_action": "Decrease CPU cores by 25%"
            })
        
        # Memory scaling recommendations
        if avg_memory > 85:
            recommendations.append({
                "type": "scale_up",
                "resource": "Memory",
                "reason": f"High memory utilization ({avg_memory:.1f}%)",
                "suggested_action": "Increase memory by 50%"
            })
        elif avg_memory < 40:
            recommendations.append({
                "type": "scale_down",
                "resource": "Memory",
                "reason": f"Low memory utilization ({avg_memory:.1f}%)",
                "suggested_action": "Decrease memory by 25%"
            })
        
        return {
            "current_utilization": {
                "cpu": avg_cpu,
                "memory": avg_memory
            },
            "recommendations": recommendations,
            "confidence": 0.85 if len(metrics) > 5 else 0.6
        }
