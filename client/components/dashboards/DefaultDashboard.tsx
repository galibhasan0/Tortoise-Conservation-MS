import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, AlertTriangle, Calendar, Users } from 'lucide-react';

const DefaultDashboard: React.FC = () => {
  const { user } = useAuth();

  const getRoleInfo = () => {
    const info: Record<string, { description: string; primaryColor: string }> = {
      'Vet': { description: 'Health records and medical care', primaryColor: 'red' },
      'Caretaker': { description: 'Daily care and feeding tasks', primaryColor: 'green' },
      'Breeding Officer': { description: 'Breeding program management', primaryColor: 'purple' },
      'Env Tech': { description: 'Habitat and environment monitoring', primaryColor: 'cyan' },
      'Collection Officer': { description: 'Collection and inventory management', primaryColor: 'blue' },
      'Staff': { description: 'General support tasks', primaryColor: 'cyan' },
    };
    return info[user?.role || 'Staff'] || { description: 'Tortoise care', primaryColor: 'cyan' };
  };

  const info = getRoleInfo();

  const quickStats = [
    { label: 'Active Tasks', value: '5', icon: CheckCircle, color: 'cyan' },
    { label: 'Pending Items', value: '3', icon: Calendar, color: 'amber' },
    { label: 'Team Members', value: '8', icon: Users, color: 'purple' },
    { label: 'Important Alerts', value: '1', icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{user?.role} Dashboard</h1>
        <p className="text-muted-foreground">{info.description}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 glow-cyan',
            amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 glow-amber',
            purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 glow-purple',
            red: 'from-red-500/20 to-red-500/5 border-red-500/30',
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Welcome Card */}
        <div className="glass-panel p-6 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Welcome, {user?.fullName}!</h2>
          <p className="text-muted-foreground mb-4">
            You're logged in as {user?.role}. This role provides access to specific modules and features designed for your responsibilities.
          </p>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
            Get Started
          </button>
        </div>

        {/* System Status */}
        <div className="glass-panel p-6 border-white/10">
          <h2 className="text-xl font-semibold text-foreground mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-foreground">Server Status</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-emerald-400 font-medium">Online</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-foreground">Database</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-emerald-400 font-medium">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-foreground">System Load</span>
              <span className="text-cyan-400 font-medium">23%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-6 border-white/10">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'Task completed', detail: 'Morning feeding routine', time: '2 hours ago' },
            { action: 'Report generated', detail: 'Weekly health summary', time: '6 hours ago' },
            { action: 'Data updated', detail: 'Habitat metrics refreshed', time: '12 hours ago' },
            { action: 'Alert received', detail: 'Temperature variation noted', time: '1 day ago' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div>
                <p className="text-foreground font-medium">{item.action}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DefaultDashboard;
