import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
  category: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Feed tortoises in Enclosure A',
    description: 'Provide fresh vegetables and water',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-04-15',
    assignee: 'John Smith',
    category: 'Feeding',
  },
  {
    id: '2',
    title: 'Check habitat temperature',
    description: 'Verify temperature is 28-32°C',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-04-15',
    assignee: 'Sarah Williams',
    category: 'Habitat',
  },
  {
    id: '3',
    title: 'Prepare health report',
    description: 'Compile weekly health status for all tortoises',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-04-18',
    assignee: 'Dr. Wilson',
    category: 'Health',
  },
  {
    id: '4',
    title: 'Clean enclosure B',
    description: 'Full cleaning and disinfection',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-04-13',
    assignee: 'Mike Johnson',
    category: 'Maintenance',
  },
  {
    id: '5',
    title: 'Schedule veterinary appointment',
    description: 'Book appointment for Rocky\'s check-up',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-04-20',
    assignee: 'Admin',
    category: 'Health',
  },
  {
    id: '6',
    title: 'Update feeding logs',
    description: 'Record daily feeding amounts',
    status: 'in_progress',
    priority: 'low',
    dueDate: '2024-04-15',
    assignee: 'John Smith',
    category: 'Admin',
  },
];

const Tasks: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredTasks = mockTasks.filter(task => {
    const statusMatch = filter === 'all' || task.status === filter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={20} className="text-emerald-400" />;
      case 'in_progress':
        return <Clock size={20} className="text-cyan-400" />;
      default:
        return <Circle size={20} className="text-amber-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'in_progress':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/20';
    }
  };

  const stats = [
    { label: 'Total Tasks', value: mockTasks.length, color: 'cyan' },
    { label: 'In Progress', value: mockTasks.filter(t => t.status === 'in_progress').length, color: 'purple' },
    { label: 'Pending', value: mockTasks.filter(t => t.status === 'pending').length, color: 'amber' },
    { label: 'Completed', value: mockTasks.filter(t => t.status === 'completed').length, color: 'emerald' },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Tasks</h1>
              <p className="text-muted-foreground">Manage and track all tasks</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              New Task
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const colorClass = {
                cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
                purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
                amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
                emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
              };
              return (
                <div
                  key={idx}
                  className={`glass-panel p-6 border bg-gradient-to-br ${colorClass[stat.color as keyof typeof colorClass]}`}
                >
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="glass-panel p-6 border-white/10">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter === status
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                        : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm font-medium text-muted-foreground">Priority:</span>
              </div>
              <div className="flex gap-2">
                {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      priorityFilter === priority
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                    }`}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel p-6 border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <button className="mt-1">{getStatusIcon(task.status)}</button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`font-semibold text-lg ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getStatusColor(task.status)}`}>
                        {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                        <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
                          {task.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Assigned to: <span className="text-foreground font-medium">{task.assignee}</span>
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Due: <span className="text-foreground font-medium">{task.dueDate}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tasks found with the selected filters</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Tasks;
