import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Calendar, Apple, Droplet } from 'lucide-react';

interface FeedingLog {
  id: string;
  date: string;
  tortoise: string;
  foodType: string;
  quantity: number;
  notes: string;
  caretaker: string;
  consumed: boolean;
}

const mockFeedingLogs: FeedingLog[] = [
  {
    id: '1',
    date: '2024-04-15',
    tortoise: 'Shelly',
    foodType: 'Mixed Vegetables',
    quantity: 250,
    notes: 'Ate well, good appetite',
    caretaker: 'John Smith',
    consumed: true,
  },
  {
    id: '2',
    date: '2024-04-15',
    tortoise: 'Rocky',
    foodType: 'Leafy Greens',
    quantity: 300,
    notes: 'Normal intake',
    caretaker: 'John Smith',
    consumed: true,
  },
  {
    id: '3',
    date: '2024-04-15',
    tortoise: 'Luna',
    foodType: 'Mixed Vegetables',
    quantity: 150,
    notes: 'Reduced appetite noted',
    caretaker: 'Mike Johnson',
    consumed: false,
  },
  {
    id: '4',
    date: '2024-04-14',
    tortoise: 'Atlas',
    foodType: 'Cactus Pads',
    quantity: 200,
    notes: 'Preferred food, ate quickly',
    caretaker: 'John Smith',
    consumed: true,
  },
  {
    id: '5',
    date: '2024-04-14',
    tortoise: 'Shelly',
    foodType: 'Mixed Vegetables',
    quantity: 250,
    notes: 'Healthy appetite',
    caretaker: 'John Smith',
    consumed: true,
  },
];

const Feeding: React.FC = () => {
  const [logs, setLogs] = useState(mockFeedingLogs);
  const [filter, setFilter] = useState<'all' | 'consumed' | 'pending'>('all');

  const filteredLogs = logs.filter(log => {
    if (filter === 'consumed') return log.consumed;
    if (filter === 'pending') return !log.consumed;
    return true;
  });

  const stats = [
    { label: 'Total Feedings', value: logs.length, icon: Apple, color: 'cyan' },
    { label: 'Consumed', value: logs.filter(l => l.consumed).length, icon: Apple, color: 'emerald' },
    { label: 'Pending Review', value: logs.filter(l => !l.consumed).length, icon: Apple, color: 'amber' },
  ];

  return (
    <ProtectedRoute requiredRoles={['Caretaker', 'Supervisor']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Feeding & Care Logs</h1>
              <p className="text-muted-foreground">Track feeding and consumption patterns</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              Log Feeding
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

          {/* Filters */}
          <div className="glass-panel p-6 border-white/10">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'consumed', 'pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === status
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'consumed' ? 'Consumed' : 'Pending Review'}
                </button>
              ))}
            </div>
          </div>

          {/* Feeding Logs */}
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="glass-panel p-6 border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {log.tortoise}
                    </h3>
                    <p className="text-cyan-400 text-sm">{log.foodType}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    log.consumed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {log.consumed ? 'Consumed' : 'Pending'}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  {log.notes}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    <div className="flex items-center gap-2">
                      <Apple size={16} className="text-cyan-400" />
                      <span className="text-foreground font-medium">{log.quantity}g</span>
                    </div>
                    <div className="text-muted-foreground">
                      Logged by: <span className="text-foreground font-medium">{log.caretaker}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{log.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feeding Guidelines */}
          <div className="glass-panel p-6 border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Apple size={20} className="text-emerald-400" />
              Feeding Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Food Types</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Mixed Vegetables (daily)</li>
                  <li>• Leafy Greens (daily)</li>
                  <li>• Cactus Pads (3x weekly)</li>
                  <li>• Supplements (weekly)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Portion Guidelines</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Small tortoises: 100-200g daily</li>
                  <li>• Medium tortoises: 200-400g daily</li>
                  <li>• Large tortoises: 400g+ daily</li>
                  <li>• Juveniles: 3x daily feeding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Feeding;
