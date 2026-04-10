import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Calendar, Heart, TrendingUp } from 'lucide-react';

interface BreedingRecord {
  id: string;
  date: string;
  female: string;
  male: string;
  status: 'planned' | 'attempted' | 'successful' | 'failed';
  clutchSize?: number;
  expectedHatchDate?: string;
  notes: string;
}

const mockBreedingRecords: BreedingRecord[] = [
  {
    id: '1',
    date: '2024-04-10',
    female: 'Shelly',
    male: 'Rocky',
    status: 'successful',
    clutchSize: 8,
    expectedHatchDate: '2024-07-15',
    notes: 'Successful mating, eggs laid',
  },
  {
    id: '2',
    date: '2024-03-28',
    female: 'Luna',
    male: 'Atlas',
    status: 'attempted',
    notes: 'Attempted but unsuccessful',
  },
  {
    id: '3',
    date: '2024-03-10',
    female: 'Emma',
    male: 'Rocky',
    status: 'successful',
    clutchSize: 6,
    expectedHatchDate: '2024-06-20',
    notes: 'Successful breeding season',
  },
  {
    id: '4',
    date: '2024-04-20',
    female: 'Shelly',
    male: 'Atlas',
    status: 'planned',
    notes: 'Scheduled for breeding season',
  },
];

const Breeding: React.FC = () => {
  const [records, setRecords] = useState(mockBreedingRecords);
  const [filter, setFilter] = useState<'all' | 'planned' | 'attempted' | 'successful' | 'failed'>('all');

  const filteredRecords = records.filter(record => {
    if (filter === 'all') return true;
    return record.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'planned':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'attempted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const stats = [
    { label: 'Total Records', value: records.length, color: 'cyan' },
    { label: 'Successful', value: records.filter(r => r.status === 'successful').length, color: 'emerald' },
    { label: 'Planned', value: records.filter(r => r.status === 'planned').length, color: 'cyan' },
  ];

  return (
    <ProtectedRoute requiredRoles={['Breeding Officer', 'Supervisor']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Breeding Management</h1>
              <p className="text-muted-foreground">Manage breeding programs and records</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              New Record
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const colorClass = {
                cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
                emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
                purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
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
            <div className="flex gap-2 flex-wrap">
              {(['all', 'planned', 'attempted', 'successful', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === status
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Breeding Records */}
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="glass-panel p-6 border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {record.female} × {record.male}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Date: <span className="text-foreground font-medium">{record.date}</span>
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium border whitespace-nowrap ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  {record.notes}
                </p>

                {record.clutchSize && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Clutch Size</p>
                      <p className="text-xl font-bold text-emerald-300">{record.clutchSize} eggs</p>
                    </div>
                    {record.expectedHatchDate && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Expected Hatch Date</p>
                        <p className="text-lg font-bold text-cyan-300">{record.expectedHatchDate}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Days Remaining</p>
                      <p className="text-lg font-bold text-purple-300">
                        {record.expectedHatchDate ? 
                          Math.ceil((new Date(record.expectedHatchDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
                          : '-'} days
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Breeding Guidelines */}
          <div className="glass-panel p-6 border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart size={20} className="text-emerald-400" />
              Breeding Season Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Optimal Conditions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Temperature: 28-32°C</li>
                  <li>• Humidity: 60-80%</li>
                  <li>• Daylight: 12-14 hours</li>
                  <li>• Age: 10+ years for breeding</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Timeline</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Incubation: 60-120 days</li>
                  <li>• Hatchling care: 1-2 years</li>
                  <li>• Peak season: Spring/Summer</li>
                  <li>• Rest period: Winter</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Breeding;
