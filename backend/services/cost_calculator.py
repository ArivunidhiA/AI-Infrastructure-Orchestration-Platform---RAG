import random
from typing import List, Dict, Any
from datetime import datetime, timedelta
from models import Workload, Metric

class CostCalculator:
    """Service for calculating and analyzing infrastructure costs"""
    
    def __init__(self):
        # Mock pricing data (in real scenario, would fetch from cloud provider APIs)
        self.base_pricing = {
            "cpu_per_core_hour": 0.05,
            "gpu_per_hour": 2.50,
            "memory_per_gb_hour": 0.01,
            "storage_per_gb_month": 0.10
        }
        
        # Regional pricing multipliers
        self.regional_multipliers = {
            "us-east-1": 1.0,
            "us-west-2": 1.1,
            "eu-west-1": 1.2,
            "ap-southeast-1": 1.15
        }
    
    def calculate_workload_cost(self, workload: Workload, hours: float = 1.0) -> Dict[str, Any]:
        """Calculate cost for a workload over specified hours"""
        
        # Base cost calculation
        cpu_cost = workload.cpu_cores * self.base_pricing["cpu_per_core_hour"] * hours
        gpu_cost = workload.gpu_count * self.base_pricing["gpu_per_hour"] * hours
        memory_cost = workload.memory_gb * self.base_pricing["memory_per_gb_hour"] * hours
        
        total_cost = cpu_cost + gpu_cost + memory_cost
        
        # Apply regional multiplier (mock)
        region = "us-east-1"  # Default region
        regional_cost = total_cost * self.regional_multipliers[region]
        
        return {
            "cpu_cost": cpu_cost,
            "gpu_cost": gpu_cost,
            "memory_cost": memory_cost,
            "base_cost": total_cost,
            "regional_cost": regional_cost,
            "region": region,
            "hours": hours,
            "cost_per_hour": regional_cost / hours if hours > 0 else 0
        }
    
    def calculate_monthly_cost(self, workload: Workload) -> Dict[str, Any]:
        """Calculate monthly cost for a workload"""
        monthly_hours = 24 * 30  # 24 hours * 30 days
        return self.calculate_workload_cost(workload, monthly_hours)
    
    def analyze_cost_trends(self, workload_id: int, metrics: List[Metric]) -> Dict[str, Any]:
        """Analyze cost trends for a workload"""
        
        if not metrics:
            return {"error": "No metrics available for analysis"}
        
        # Sort metrics by timestamp
        sorted_metrics = sorted(metrics, key=lambda x: x.timestamp)
        
        # Calculate daily costs
        daily_costs = {}
        for metric in sorted_metrics:
            date = metric.timestamp.date()
            if date not in daily_costs:
                daily_costs[date] = 0
            daily_costs[date] += metric.cost_accumulation
        
        # Calculate trends
        dates = list(daily_costs.keys())
        costs = list(daily_costs.values())
        
        if len(costs) < 2:
            return {"error": "Insufficient data for trend analysis"}
        
        # Calculate trend direction
        recent_avg = sum(costs[-7:]) / min(7, len(costs)) if len(costs) >= 7 else costs[-1]
        older_avg = sum(costs[:-7]) / max(1, len(costs) - 7) if len(costs) > 7 else costs[0]
        
        trend_direction = "increasing" if recent_avg > older_avg else "decreasing"
        trend_percentage = abs((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
        
        # Calculate projected monthly cost
        avg_daily_cost = sum(costs) / len(costs)
        projected_monthly = avg_daily_cost * 30
        
        return {
            "daily_costs": daily_costs,
            "trend_direction": trend_direction,
            "trend_percentage": trend_percentage,
            "average_daily_cost": avg_daily_cost,
            "projected_monthly_cost": projected_monthly,
            "total_cost": sum(costs),
            "data_points": len(costs)
        }
    
    def compare_cost_alternatives(self, workload: Workload) -> List[Dict[str, Any]]:
        """Compare cost of different resource configurations"""
        
        alternatives = []
        
        # Current configuration
        current_cost = self.calculate_workload_cost(workload, 1.0)
        alternatives.append({
            "name": "Current Configuration",
            "cpu_cores": workload.cpu_cores,
            "gpu_count": workload.gpu_count,
            "memory_gb": workload.memory_gb,
            "cost_per_hour": current_cost["regional_cost"],
            "monthly_cost": current_cost["regional_cost"] * 24 * 30,
            "is_current": True
        })
        
        # Alternative 1: Reduce resources by 25%
        alt1_cpu = max(1, int(workload.cpu_cores * 0.75))
        alt1_gpu = max(0, int(workload.gpu_count * 0.75))
        alt1_memory = max(1.0, workload.memory_gb * 0.75)
        
        alt1_workload = Workload(
            name=workload.name,
            type=workload.type,
            cpu_cores=alt1_cpu,
            gpu_count=alt1_gpu,
            memory_gb=alt1_memory,
            cost_per_hour=0  # Will be calculated
        )
        
        alt1_cost = self.calculate_workload_cost(alt1_workload, 1.0)
        alternatives.append({
            "name": "Reduced Resources (25% less)",
            "cpu_cores": alt1_cpu,
            "gpu_count": alt1_gpu,
            "memory_gb": alt1_memory,
            "cost_per_hour": alt1_cost["regional_cost"],
            "monthly_cost": alt1_cost["regional_cost"] * 24 * 30,
            "savings_percentage": (current_cost["regional_cost"] - alt1_cost["regional_cost"]) / current_cost["regional_cost"] * 100,
            "is_current": False
        })
        
        # Alternative 2: Spot instances (70% cheaper)
        spot_cost = current_cost["regional_cost"] * 0.3
        alternatives.append({
            "name": "Spot Instances",
            "cpu_cores": workload.cpu_cores,
            "gpu_count": workload.gpu_count,
            "memory_gb": workload.memory_gb,
            "cost_per_hour": spot_cost,
            "monthly_cost": spot_cost * 24 * 30,
            "savings_percentage": 70.0,
            "is_current": False,
            "note": "May be interrupted, suitable for fault-tolerant workloads"
        })
        
        # Alternative 3: Reserved instances (40% cheaper)
        reserved_cost = current_cost["regional_cost"] * 0.6
        alternatives.append({
            "name": "Reserved Instances (1-year)",
            "cpu_cores": workload.cpu_cores,
            "gpu_count": workload.gpu_count,
            "memory_gb": workload.memory_gb,
            "cost_per_hour": reserved_cost,
            "monthly_cost": reserved_cost * 24 * 30,
            "savings_percentage": 40.0,
            "is_current": False,
            "note": "Requires 1-year commitment"
        })
        
        return alternatives
    
    def calculate_roi(self, workload: Workload, business_value: float) -> Dict[str, Any]:
        """Calculate ROI for a workload based on business value"""
        
        monthly_cost = self.calculate_monthly_cost(workload)["regional_cost"]
        
        if monthly_cost == 0:
            return {"error": "Cannot calculate ROI with zero cost"}
        
        roi_percentage = (business_value - monthly_cost) / monthly_cost * 100
        payback_period = monthly_cost / (business_value / 30) if business_value > 0 else float('inf')
        
        return {
            "monthly_cost": monthly_cost,
            "business_value": business_value,
            "roi_percentage": roi_percentage,
            "payback_period_days": payback_period,
            "net_value": business_value - monthly_cost,
            "is_profitable": business_value > monthly_cost
        }
    
    def generate_cost_optimization_report(self, workloads: List[Workload]) -> Dict[str, Any]:
        """Generate comprehensive cost optimization report"""
        
        total_monthly_cost = 0
        optimization_opportunities = []
        
        for workload in workloads:
            monthly_cost = self.calculate_monthly_cost(workload)["regional_cost"]
            total_monthly_cost += monthly_cost
            
            # Find optimization opportunities
            alternatives = self.compare_cost_alternatives(workload)
            best_alternative = min(alternatives[1:], key=lambda x: x["monthly_cost"])
            
            if best_alternative["monthly_cost"] < monthly_cost:
                optimization_opportunities.append({
                    "workload_name": workload.name,
                    "current_cost": monthly_cost,
                    "optimized_cost": best_alternative["monthly_cost"],
                    "potential_savings": monthly_cost - best_alternative["monthly_cost"],
                    "savings_percentage": best_alternative["savings_percentage"],
                    "recommendation": best_alternative["name"]
                })
        
        total_potential_savings = sum(opp["potential_savings"] for opp in optimization_opportunities)
        
        return {
            "total_monthly_cost": total_monthly_cost,
            "total_workloads": len(workloads),
            "optimization_opportunities": optimization_opportunities,
            "total_potential_savings": total_potential_savings,
            "savings_percentage": (total_potential_savings / total_monthly_cost * 100) if total_monthly_cost > 0 else 0,
            "report_generated": datetime.utcnow().isoformat()
        }
