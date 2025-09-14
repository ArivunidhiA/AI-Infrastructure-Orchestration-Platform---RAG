import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { optimizationAPI } from '../services/api';
import { apiUtils } from '../services/api';
import toast from 'react-hot-toast';

const CostOptimizer = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [costAnalysis, setCostAnalysis] = useState(null);
  const [efficiencyAnalysis, setEfficiencyAnalysis] = useState(null);
  const [savingsSummary, setSavingsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);
      const [recResponse, costResponse, efficiencyResponse, savingsResponse] = await Promise.all([
        optimizationAPI.getRecommendations(),
        optimizationAPI.getCostAnalysis(),
        optimizationAPI.getEfficiencyAnalysis(),
        optimizationAPI.getSavingsSummary()
      ]);
      
      setRecommendations(recResponse.data);
      setCostAnalysis(costResponse.data);
      setEfficiencyAnalysis(efficiencyResponse.data);
      setSavingsSummary(savingsResponse.data);
    } catch (error) {
      toast.error('Failed to fetch optimization data');
      console.error('Error fetching optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimization = async (recommendationId) => {
    try {
      await optimizationAPI.applyOptimization(recommendationId);
      toast.success('Optimization applied successfully');
      fetchOptimizationData();
    } catch (error) {
      toast.error('Failed to apply optimization');
      console.error('Error applying optimization:', error);
    }
  };

  const handleRejectOptimization = async (recommendationId) => {
    try {
      await optimizationAPI.rejectOptimization(recommendationId);
      toast.success('Optimization rejected');
      fetchOptimizationData();
    } catch (error) {
      toast.error('Failed to reject optimization');
      console.error('Error rejecting optimization:', error);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      await optimizationAPI.generateRecommendations();
      toast.success('Generating new recommendations...');
      fetchOptimizationData();
    } catch (error) {
      toast.error('Failed to generate recommendations');
      console.error('Error generating recommendations:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'status-running';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-failed';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-400">Loading optimization data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Cost Optimizer</h1>
          <p className="text-gray-400 mt-1">Optimize your infrastructure costs and performance</p>
        </div>
        <button
          onClick={handleGenerateRecommendations}
          className="btn-primary flex items-center space-x-2"
        >
          <Lightbulb className="w-5 h-5" />
          <span>Generate Recommendations</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Monthly Cost</p>
              <p className="text-2xl font-bold text-white">
                {apiUtils.formatCurrency(costAnalysis?.total_monthly_cost || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Potential Savings</p>
              <p className="text-2xl font-bold text-green-400">
                {apiUtils.formatCurrency(costAnalysis?.total_potential_savings || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Applied Optimizations</p>
              <p className="text-2xl font-bold text-white">
                {savingsSummary?.applied_optimizations || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="metric-card card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Savings Percentage</p>
              <p className="text-2xl font-bold text-yellow-400">
                {apiUtils.formatPercentage(costAnalysis?.savings_percentage || 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Target className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        {[
          { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
          { id: 'efficiency', label: 'Efficiency Analysis', icon: BarChart3 },
          { id: 'cost-analysis', label: 'Cost Analysis', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Recommendations List */}
          <div className="glass-dark p-6 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Optimization Recommendations</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {recommendations.length} recommendations
                </span>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Recommendations</h3>
                <p className="text-gray-400 mb-4">Generate recommendations to optimize your costs</p>
                <button
                  onClick={handleGenerateRecommendations}
                  className="btn-primary"
                >
                  Generate Recommendations
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(rec.status)}
                              <span className="capitalize">{rec.status}</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">
                            Workload #{rec.workload_id}
                          </span>
                        </div>
                        
                        <p className="text-white mb-3">{rec.recommendation}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">
                              {apiUtils.formatCurrency(rec.potential_savings)} savings
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">
                              {apiUtils.formatRelativeTime(rec.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {rec.status === 'pending' && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApplyOptimization(rec.id)}
                            className="btn-success px-3 py-1 text-sm"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => handleRejectOptimization(rec.id)}
                            className="btn-danger px-3 py-1 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          <div className="glass-dark p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-6">Workload Efficiency Analysis</h3>
            
            {efficiencyAnalysis?.workloads && efficiencyAnalysis.workloads.length > 0 ? (
              <div className="space-y-4">
                {efficiencyAnalysis.workloads.map((workload) => (
                  <div
                    key={workload.workload_id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{workload.workload_name}</h4>
                        <p className="text-sm text-gray-400 capitalize">{workload.workload_type}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Efficiency:</span>
                          <span className={`font-semibold ${
                            workload.efficiency_score > 0.8 ? 'text-green-400' :
                            workload.efficiency_score > 0.6 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {apiUtils.formatPercentage(workload.efficiency_score * 100)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Current Cost:</span>
                        <p className="text-white font-medium">
                          {apiUtils.formatCurrency(workload.current_cost)}/hr
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Potential Savings:</span>
                        <p className="text-green-400 font-medium">
                          {apiUtils.formatCurrency(workload.potential_savings)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Recommendations:</span>
                        <p className="text-white font-medium">
                          {workload.recommendations_count}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No efficiency data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'cost-analysis' && (
        <div className="space-y-6">
          <div className="glass-dark p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-6">Cost Analysis</h3>
            
            {costAnalysis?.optimization_opportunities && costAnalysis.optimization_opportunities.length > 0 ? (
              <div className="space-y-4">
                {costAnalysis.optimization_opportunities.map((opp, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{opp.workload_name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Savings:</span>
                        <span className="text-green-400 font-semibold">
                          {apiUtils.formatCurrency(opp.potential_savings)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Current Cost:</span>
                        <p className="text-white font-medium">
                          {apiUtils.formatCurrency(opp.current_cost)}/month
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Optimized Cost:</span>
                        <p className="text-green-400 font-medium">
                          {apiUtils.formatCurrency(opp.optimized_cost)}/month
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="text-gray-400 text-sm">Recommendation:</span>
                      <p className="text-white text-sm mt-1">{opp.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No cost analysis data available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostOptimizer;
