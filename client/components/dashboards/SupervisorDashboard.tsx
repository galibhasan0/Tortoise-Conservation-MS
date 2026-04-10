import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';

const SupervisorDashboard: React.FC = () => {
  const taskStats = [
    { label: 'Completed Tasks', value: '18', icon: CheckCircle, color: 'emerald' },
    { label: 'Pending Tasks', value: '7', icon: Clock, color: 'cyan' },
    { label: 'Active Alerts', value: '3', icon: AlertTriangle, color: 'amber' },
    { label: 'Team Members', value: '12', icon: Users, color: 'purple' },
  ];

  const tasks = [
    { id: 1, title: 'Check habitat temperature', status: 'In Progress', priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Feed tortoises in enclosure 3', status: 'Pending', priority: 'high', dueDate: 'Today' },
    { id: 3, title: 'Prepare health report', status: 'Pending', priority: 'medium', dueDate: 'Tomorrow' },
    { id: 4, title: 'Schedule vet appointment', status: 'Pending', priority: 'medium', dueDate: 'This week' },
  ];

  const alerts = [
    { id: 1, message: 'Habitat temperature anomaly in Enclosure 2', severity: 'high' },
    { id: 2, message: 'Water quality check needed for Tank A', severity: 'medium' },
    { id: 3, message: 'Staff absence: John due at 9 AM', severity: 'low' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Supervisor Dashboard</h1>
        <p className="text-muted-foreground">Task management and team overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {taskStats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 glow-emerald',
            cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 glow-cyan',
            amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 glow-amber',
            purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 glow-purple',
          };

          return (
            <div
              key={idx}
              className={`glass-panel p-6 border bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <Icon size={24} className={`text-${stat.color}-400`} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Tasks and Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 glass-panel p-6 border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock size={20} className="text-cyan-400" />
              Assigned Tasks
            </h2>
            <Link to="/tasks" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-muted-foreground">{task.dueDate}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'In Progress'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-panel p-6 border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" />
              Active Alerts
            </h2>
            <Link to="/alerts" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              More
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : alert.severity === 'medium'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                }`}
              >
                <p className={`text-sm font-medium ${
                  alert.severity === 'high'
                    ? 'text-red-300'
                    : alert.severity === 'medium'
                    ? 'text-amber-300'
                    : 'text-cyan-300'
                }`}>
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-panel p-6 border-white/10">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
            Create New Task
          </button>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-background font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
            Assign Staff
          </button>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-background font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
