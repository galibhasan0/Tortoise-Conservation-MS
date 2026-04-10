import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';

interface HabitatMetric {
  id: string;
  enclosure: string;
  temperature: number;
  humidity: number;
  pH?: number;
  lastUpdated: string;
  status: 'optimal' | 'warning' | 'critical';
}

interface EnvironmentLog {
  id: string;
  enclosure: string;
  type: 'temperature' | 'humidity' | 'cleaning' | 'water_change';
  value?: number;
  notes: string;
  timestamp: string;
}

const mockHabitatMetrics: HabitatMetric[] = [
  {
    id: '1',
    enclosure: 'Enclosure A',
    temperature: 29.5,
    humidity: 72,
    pH: 7.2,
    lastUpdated: '2024-04-15 09:30',
    status: 'optimal',
  },
  {
    id: '2',
    enclosure: 'Enclosure B',
    temperature: 22.1,
    humidity: 65,
    pH: 7.4,
    lastUpdated: '2024-04-15 09:20',
    status: 'critical',
  },
  {
    id: '3',
    enclosure: 'Enclosure C',
    temperature: 28.8,
    humidity: 75,
    pH: 7.1,
    lastUpdated: '2024-04-15 09:15',
    status: 'optimal',
  },
  {
    id: '4',
    enclosure: 'Tank A',
    temperature: 26.5,
    humidity: 80,
    pH: 7.8,
    lastUpdated: '2024-04-15 09:25',
    status: 'warning',
  },
];

const mockEnvironmentLogs: EnvironmentLog[] = [
  {
    id: '1',
    enclosure: 'Enclosure A',
    type: 'temperature',
    value: 29.5,
    notes: 'Temperature reading',
    timestamp: '2024-04-15 09:30',
  },
  {
    id: '2',
    enclosure: 'Enclosure B',
    type: 'cleaning',
    notes: 'Full enclosure cleaning performed',
    timestamp: '2024-04-15 08:00',
  },
  {
    id: '3',
    enclosure: 'Tank A',
    type: 'water_change',
    notes: '50% water change completed',
    timestamp: '2024-04-14 14:00',
  },
  {
    id: '4',
    enclosure: 'Enclosure C',
    type: 'humidity',
    value: 75,
    notes: 'Humidity optimized',
    timestamp: '2024-04-14 10:30',
  },
];

const Habitats: React.FC = () => {
  const [metrics] = useState(mockHabitatMetrics);
  const [logs] = useState(mockEnvironmentLogs);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'border-emerald-500/50 bg-emerald-500/10';
      case 'warning':
        return 'border-amber-500/50 bg-amber-500/10';
      case 'critical':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermometer size={18} className="text-red-400" />;
      case 'humidity':
        return <Droplets size={18} className="text-cyan-400" />;
      case 'cleaning':
        return <Wind size={18} className="text-purple-400" />;
      case 'water_change':
        return <Droplets size={18} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const stats = [
    { label: 'Enclosures', value: metrics.length, color: 'cyan' },
    { label: 'Optimal', value: metrics.filter(m => m.status === 'optimal').length, color: 'emerald' },
    { label: 'Warnings', value: metrics.filter(m => m.status === 'warning').length, color: 'amber' },
    { label: 'Critical', value: metrics.filter(m => m.status === 'critical').length, color: 'red' },
  ];

  return (
    <ProtectedRoute requiredRoles={['Env Tech', 'Supervisor']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Habitat Monitoring</h1>
              <p className="text-muted-foreground">Monitor environmental conditions</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              Log Measurement
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const colorClass = {
                cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
                emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
                amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
                red: 'from-red-500/20 to-red-500/5 border-red-500/30',
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

          {/* Current Habitat Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Current Status</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className={`glass-panel p-6 border ${getStatusColor(metric.status)}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">
                      {metric.enclosure}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(metric.status)}`}>
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Thermometer size={14} />
                        Temperature
                      </p>
                      <p className="text-xl font-bold text-red-300">{metric.temperature}°C</p>
                      {metric.temperature < 25 || metric.temperature > 32 && (
                        <p className="text-xs text-amber-300 mt-1">Out of range</p>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Droplets size={14} />
                        Humidity
                      </p>
                      <p className="text-xl font-bold text-cyan-300">{metric.humidity}%</p>
                    </div>
                    {metric.pH && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs text-muted-foreground mb-2">pH Level</p>
                        <p className="text-xl font-bold text-purple-300">{metric.pH}</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Last updated: {metric.lastUpdated}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Logs */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity Log</h2>
            <div className="glass-panel border-white/10">
              <div className="space-y-3 p-6">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 py-3 border-b border-white/10 last:border-0">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">
                          {log.enclosure}
                        </h4>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{log.notes}</p>
                      {log.value && (
                        <p className="text-xs text-cyan-300 mt-1">
                          Reading: {log.value} {log.type === 'temperature' ? '°C' : log.type === 'humidity' ? '%' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Guidelines */}
          <div className="glass-panel p-6 border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" />
              Environmental Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Optimal Ranges</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Temperature: 25-32°C (varies by species)</li>
                  <li>• Humidity: 60-80%</li>
                  <li>• pH (water): 6.5-7.5</li>
                  <li>• Daylight: 12-14 hours daily</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Maintenance Schedule</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Water change: 3x weekly</li>
                  <li>• Full enclosure cleaning: Weekly</li>
                  <li>• Filter maintenance: Bi-weekly</li>
                  <li>• Equipment check: Daily</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Habitats;
