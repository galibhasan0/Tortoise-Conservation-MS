import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Heart, AlertTriangle, TrendingUp, Search } from 'lucide-react';

interface HealthRecord {
  id: string;
  tortoiseName: string;
  tortoiseId: string;
  date: string;
  type: 'checkup' | 'treatment' | 'vaccination' | 'exam';
  vetName: string;
  notes: string;
  status: 'normal' | 'concern' | 'critical';
  temperature?: number;
  weight?: number;
}

const mockHealthRecords: HealthRecord[] = [
  {
    id: '1',
    tortoiseName: 'Shelly',
    tortoiseId: '1',
    date: '2024-04-10',
    type: 'checkup',
    vetName: 'Dr. Sarah Wilson',
    notes: 'Routine check-up completed. All vitals normal.',
    status: 'normal',
    temperature: 28.5,
    weight: 45.5,
  },
  {
    id: '2',
    tortoiseName: 'Luna',
    tortoiseId: '3',
    date: '2024-04-08',
    type: 'treatment',
    vetName: 'Dr. James Brown',
    notes: 'Minor shell inflammation treated. Prescribed topical medication.',
    status: 'concern',
    temperature: 29.2,
    weight: 12.4,
  },
  {
    id: '3',
    tortoiseName: 'Rocky',
    tortoiseId: '2',
    date: '2024-04-05',
    type: 'vaccination',
    vetName: 'Dr. Sarah Wilson',
    notes: 'Annual vaccination administered. No adverse reactions.',
    status: 'normal',
    temperature: 28.0,
    weight: 68.2,
  },
  {
    id: '4',
    tortoiseName: 'Atlas',
    tortoiseId: '4',
    date: '2024-03-28',
    type: 'exam',
    vetName: 'Dr. James Brown',
    notes: 'Pre-breeding health assessment. Cleared for breeding season.',
    status: 'normal',
    temperature: 27.8,
    weight: 52.1,
  },
  {
    id: '5',
    tortoiseName: 'Shelly',
    tortoiseId: '1',
    date: '2024-03-15',
    type: 'checkup',
    vetName: 'Dr. Sarah Wilson',
    notes: 'Regular health check. Weight stable, appetite good.',
    status: 'normal',
    temperature: 28.3,
    weight: 45.2,
  },
];

const Health: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'checkup' | 'treatment' | 'vaccination' | 'exam'>('all');

  const filteredRecords = mockHealthRecords.filter(record => {
    const matchesSearch = record.tortoiseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || record.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'concern':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle size={20} className="text-red-400" />;
      case 'concern':
        return <AlertTriangle size={20} className="text-amber-400" />;
      default:
        return <Heart size={20} className="text-emerald-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'Regular Check-up';
      case 'treatment':
        return 'Treatment';
      case 'vaccination':
        return 'Vaccination';
      case 'exam':
        return 'Examination';
      default:
        return type;
    }
  };

  const stats = [
    { label: 'Total Records', value: mockHealthRecords.length, icon: Heart, color: 'cyan' },
    { label: 'Normal Status', value: mockHealthRecords.filter(r => r.status === 'normal').length, icon: TrendingUp, color: 'emerald' },
    { label: 'Concerns', value: mockHealthRecords.filter(r => r.status === 'concern').length, icon: AlertTriangle, color: 'amber' },
  ];

  return (
    <ProtectedRoute requiredRoles={['Vet']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Health Records</h1>
              <p className="text-muted-foreground">Medical history and health monitoring</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              New Record
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              const colorClass = {
                cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
                emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
                amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
              };
              return (
                <div
                  key={idx}
                  className={`glass-panel p-6 border bg-gradient-to-br ${colorClass[stat.color as keyof typeof colorClass]}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
                    </div>
                    <Icon size={24} className={`text-${stat.color}-400`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="glass-panel p-6 border-white/10 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tortoise name or veterinarian..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'checkup', 'treatment', 'vaccination', 'exam'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedType === type
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {type === 'all' ? 'All Types' : getTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Health Records */}
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="glass-panel p-6 border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <button className="mt-1 flex-shrink-0">
                    {getStatusIcon(record.status)}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {record.tortoiseName}
                        </h3>
                        <p className="text-cyan-400 text-sm">
                          {getTypeLabel(record.type)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4">
                      {record.notes}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        <div>
                          <span className="text-muted-foreground">Veterinarian: </span>
                          <span className="text-foreground font-medium">{record.vetName}</span>
                        </div>
                        {record.temperature && (
                          <div>
                            <span className="text-muted-foreground">Temperature: </span>
                            <span className="text-foreground font-medium">{record.temperature}°C</span>
                          </div>
                        )}
                        {record.weight && (
                          <div>
                            <span className="text-muted-foreground">Weight: </span>
                            <span className="text-foreground font-medium">{record.weight} kg</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {record.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No health records found</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Health;
