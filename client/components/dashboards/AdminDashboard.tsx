import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '24', change: '+2 this week', icon: Users, color: 'cyan' },
    { label: 'Active Sessions', value: '8', change: '+1 online', icon: TrendingUp, color: 'purple' },
    { label: 'System Alerts', value: '3', change: 'Requires attention', icon: AlertCircle, color: 'amber' },
    { label: 'Configuration', value: 'Optimal', change: 'All systems normal', icon: Settings, color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management tools</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClasses = {
            cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 glow-cyan',
            purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 glow-purple',
            amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 glow-amber',
            emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 glow-emerald',
          };

          return (
            <div
              key={idx}
              className={`glass-panel p-6 border bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
                </div>
                <Icon size={24} className={`text-${stat.color}-400`} />
              </div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 border-white/10">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            User Management
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Manage system users, roles, and permissions
          </p>
          <Link
            to="/users"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            Manage Users
          </Link>
        </div>

        <div className="glass-panel p-6 border-white/10">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings size={20} className="text-purple-400" />
            System Settings
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Configure system parameters and preferences
          </p>
          <Link
            to="/settings"
            className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-background font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Go to Settings
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-6 border-white/10">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          {[
            { action: 'User login', actor: 'Dr. Sarah Wilson', time: '2 hours ago' },
            { action: 'Configuration change', actor: 'System', time: '5 hours ago' },
            { action: 'Backup completed', actor: 'Automated', time: '12 hours ago' },
            { action: 'New user created', actor: 'Admin', time: '1 day ago' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
              <div>
                <p className="text-foreground font-medium">{item.action}</p>
                <p className="text-sm text-muted-foreground">By {item.actor}</p>
              </div>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
