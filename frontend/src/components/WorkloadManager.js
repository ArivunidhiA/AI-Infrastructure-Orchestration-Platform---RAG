import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Play, 
  Square, 
  Edit, 
  Trash2, 
  Settings,
  Server,
  Cpu,
  MemoryStick,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { workloadAPI } from '../services/api';
import { apiUtils } from '../services/api';
import toast from 'react-hot-toast';

const WorkloadManager = () => {
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkload, setEditingWorkload] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'training',
    cpu_cores: 4,
    gpu_count: 0,
    memory_gb: 16,
    cost_per_hour: 0
  });

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const fetchWorkloads = async () => {
    try {
      setLoading(true);
      const response = await workloadAPI.getWorkloads();
      setWorkloads(response.data);
    } catch (error) {
      toast.error('Failed to fetch workloads');
      console.error('Error fetching workloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkload = async (e) => {
    e.preventDefault();
    try {
      // Calculate cost based on resources
      const calculatedCost = calculateCost(formData);
      const workloadData = { ...formData, cost_per_hour: calculatedCost };
      
      await workloadAPI.createWorkload(workloadData);
      toast.success('Workload created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchWorkloads();
    } catch (error) {
      toast.error('Failed to create workload');
      console.error('Error creating workload:', error);
    }
  };

  const handleUpdateWorkload = async (e) => {
    e.preventDefault();
    try {
      const calculatedCost = calculateCost(formData);
      const workloadData = { ...formData, cost_per_hour: calculatedCost };
      
      await workloadAPI.updateWorkload(editingWorkload.id, workloadData);
      toast.success('Workload updated successfully');
      setEditingWorkload(null);
      resetForm();
      fetchWorkloads();
    } catch (error) {
      toast.error('Failed to update workload');
      console.error('Error updating workload:', error);
    }
  };

  const handleDeleteWorkload = async (id) => {
    if (window.confirm('Are you sure you want to delete this workload?')) {
      try {
        await workloadAPI.deleteWorkload(id);
        toast.success('Workload deleted successfully');
        fetchWorkloads();
      } catch (error) {
        toast.error('Failed to delete workload');
        console.error('Error deleting workload:', error);
      }
    }
  };

  const handleStartWorkload = async (id) => {
    try {
      await workloadAPI.startWorkload(id);
      toast.success('Workload started');
      fetchWorkloads();
    } catch (error) {
      toast.error('Failed to start workload');
      console.error('Error starting workload:', error);
    }
  };

  const handleStopWorkload = async (id) => {
    try {
      await workloadAPI.stopWorkload(id);
      toast.success('Workload stopped');
      fetchWorkloads();
    } catch (error) {
      toast.error('Failed to stop workload');
      console.error('Error stopping workload:', error);
    }
  };

  const calculateCost = (data) => {
    // Simple cost calculation based on resources
    const baseCost = 0.1; // Base cost per hour
    const cpuCost = data.cpu_cores * 0.05;
    const gpuCost = data.gpu_count * 2.0;
    const memoryCost = data.memory_gb * 0.01;
    
    return Math.round((baseCost + cpuCost + gpuCost + memoryCost) * 100) / 100;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'training',
      cpu_cores: 4,
      gpu_count: 0,
      memory_gb: 16,
      cost_per_hour: 0
    });
  };

  const openEditForm = (workload) => {
    setEditingWorkload(workload);
    setFormData({
      name: workload.name,
      type: workload.type,
      cpu_cores: workload.cpu_cores,
      gpu_count: workload.gpu_count,
      memory_gb: workload.memory_gb,
      cost_per_hour: workload.cost_per_hour
    });
    setShowCreateForm(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'status-running';
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-400">Loading workloads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Workload Manager</h1>
          <p className="text-gray-400 mt-1">Manage your AI workloads and resources</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Workload</span>
        </button>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingWorkload) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-dark p-6 rounded-xl w-full max-w-md border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingWorkload ? 'Edit Workload' : 'Create New Workload'}
            </h2>
            
            <form onSubmit={editingWorkload ? handleUpdateWorkload : handleCreateWorkload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workload Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter workload name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="training">Training</option>
                  <option value="inference">Inference</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CPU Cores
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cpu_cores}
                    onChange={(e) => setFormData({ ...formData, cpu_cores: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GPU Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.gpu_count}
                    onChange={(e) => setFormData({ ...formData, gpu_count: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Memory (GB)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.memory_gb}
                  onChange={(e) => setFormData({ ...formData, memory_gb: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Estimated Cost:</span>
                  <span className="text-green-400 font-semibold">
                    {apiUtils.formatCurrency(calculateCost(formData))}/hour
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingWorkload ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingWorkload(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workloads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workloads.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Workloads Found</h3>
            <p className="text-gray-400 mb-4">Create your first workload to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Workload
            </button>
          </div>
        ) : (
          workloads.map((workload) => (
            <div
              key={workload.id}
              className="glass-dark p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 card-hover"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <Server className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{workload.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{workload.type}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(workload.status)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(workload.status)}
                    <span className="capitalize">{workload.status}</span>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">CPU</span>
                  </div>
                  <span className="text-sm font-medium text-white">{workload.cpu_cores} cores</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Memory</span>
                  </div>
                  <span className="text-sm font-medium text-white">{workload.memory_gb} GB</span>
                </div>
                
                {workload.gpu_count > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">GPU</span>
                    </div>
                    <span className="text-sm font-medium text-white">{workload.gpu_count} units</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Cost</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {apiUtils.formatCurrency(workload.cost_per_hour)}/hr
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {workload.status === 'running' ? (
                  <button
                    onClick={() => handleStopWorkload(workload.id)}
                    className="btn-danger flex-1 flex items-center justify-center space-x-1"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartWorkload(workload.id)}
                    className="btn-success flex-1 flex items-center justify-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                )}
                
                <button
                  onClick={() => openEditForm(workload)}
                  className="btn-secondary p-2"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteWorkload(workload.id)}
                  className="btn-danger p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-400">
                  Created {apiUtils.formatRelativeTime(workload.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkloadManager;
