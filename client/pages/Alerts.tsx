import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AlertCircle, Bell, CheckCircle2, Filter } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  relatedTortoise?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Habitat Temperature Alert',
    message: 'Temperature in Enclosure 2 dropped to 22°C. Requires immediate attention.',
    severity: 'critical',
    category: 'Habitat',
    timestamp: '2024-04-15 09:30',
    read: false,
    actionable: true,
    relatedTortoise: 'Luna',
  },
  {
    id: '2',
    title: 'Health Check Overdue',
    message: 'Rocky is overdue for routine health examination. Schedule appointment.',
    severity: 'high',
    category: 'Health',
    timestamp: '2024-04-14 14:20',
    read: false,
    actionable: true,
    relatedTortoise: 'Rocky',
  },
  {
    id: '3',
    title: 'Water Quality Issue',
    message: 'pH levels in Tank A are slightly elevated. Monitor and adjust if needed.',
    severity: 'medium',
    category: 'Habitat',
    timestamp: '2024-04-14 10:15',
    read: true,
    actionable: false,
  },
  {
    id: '4',
    title: 'Staff Absence Notice',
    message: 'John will be absent tomorrow. Reassign feeding tasks for Enclosure A.',
    severity: 'medium',
    category: 'Staff',
    timestamp: '2024-04-13 16:45',
    read: true,
    actionable: true,
  },
  {
    id: '5',
    title: 'Vaccination Due',
    message: 'Atlas is due for annual vaccination. Schedule with veterinarian.',
    severity: 'low',
    category: 'Health',
    timestamp: '2024-04-13 11:30',
    read: true,
    actionable: true,
    relatedTortoise: 'Atlas',
  },
  {
    id: '6',
    title: 'Feeding Supply Low',
    message: 'Vegetable supply running low. Order more greens for next week.',
    severity: 'low',
    category: 'Supplies',
    timestamp: '2024-04-12 08:00',
    read: true,
    actionable: false,
  },
];

const Alerts: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = mockAlerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const readMatch = filterRead === 'all' || (filterRead === 'unread' && !alert.read) || (filterRead === 'read' && alert.read);
    return severityMatch && readMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10 text-red-300';
      case 'high':
        return 'border-amber-500/50 bg-amber-500/10 text-amber-300';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
      case 'low':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
      default:
        return 'border-white/10 bg-white/5 text-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const unreadCount = mockAlerts.filter(a => !a.read).length;
  const criticalCount = mockAlerts.filter(a => a.severity === 'critical').length;

  const stats = [
    { label: 'Total Alerts', value: mockAlerts.length, icon: Bell },
    { label: 'Unread', value: unreadCount, icon: AlertCircle },
    { label: 'Critical', value: criticalCount, icon: AlertCircle },
  ];

  return (
    <ProtectedRoute requiredRoles={['Admin', 'Supervisor']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Alerts & Notifications</h1>
              <p className="text-muted-foreground">System alerts and important notifications</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <CheckCircle2 size={20} />
              Mark All Read
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 border-white/10 flex items-start justify-between"
                >
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
                  </div>
                  <Icon size={24} className="text-cyan-400" />
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="glass-panel p-6 border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Severity:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(severity)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filterSeverity === severity
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'unread', 'read'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterRead(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filterRead === status
                      ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`glass-panel p-6 border-l-4 hover:border-white/20 transition-all cursor-pointer group ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {alert.severity === 'critical' ? (
                      <AlertCircle size={24} className="text-red-400" />
                    ) : (
                      <Bell size={24} className="text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!alert.read && (
                          <span className="inline-flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-foreground mb-4">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3 flex-wrap text-sm">
                        <span className="bg-white/5 px-2 py-1 rounded text-muted-foreground">
                          {alert.category}
                        </span>
                        {alert.relatedTortoise && (
                          <span className="bg-white/5 px-2 py-1 rounded text-muted-foreground">
                            Tortoise: <span className="text-foreground font-medium">{alert.relatedTortoise}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        {alert.actionable && (
                          <button className="px-3 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all">
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No alerts match the selected filters</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Alerts;
