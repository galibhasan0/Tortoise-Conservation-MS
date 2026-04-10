import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Edit2, Plus, Calendar, Weight, Heart, MapPin } from 'lucide-react';

interface Tortoise {
  id: string;
  name: string;
  species: string;
  age: number;
  gender: 'Male' | 'Female' | 'Unknown';
  weight: number;
  healthStatus: 'Healthy' | 'Injured' | 'Ill' | 'Under Treatment';
  enclosure: string;
  dateArrived: string;
  dateOfBirth?: string;
}

const mockTortoises: Tortoise[] = [
  {
    id: '1',
    name: 'Shelly',
    species: 'Sulcata Tortoise',
    age: 15,
    gender: 'Female',
    weight: 45.5,
    healthStatus: 'Healthy',
    enclosure: 'Enclosure A',
    dateArrived: '2020-03-15',
    dateOfBirth: '2008-05-20',
  },
  {
    id: '2',
    name: 'Rocky',
    species: 'African Spurred Tortoise',
    age: 22,
    gender: 'Male',
    weight: 68.2,
    healthStatus: 'Healthy',
    enclosure: 'Enclosure B',
    dateArrived: '2015-07-22',
    dateOfBirth: '2001-03-10',
  },
  {
    id: '3',
    name: 'Luna',
    species: 'Hermann\'s Tortoise',
    age: 8,
    gender: 'Female',
    weight: 12.4,
    healthStatus: 'Under Treatment',
    enclosure: 'Enclosure C',
    dateArrived: '2022-11-01',
    dateOfBirth: '2015-06-15',
  },
  {
    id: '4',
    name: 'Atlas',
    species: 'Leopard Tortoise',
    age: 18,
    gender: 'Male',
    weight: 52.1,
    healthStatus: 'Healthy',
    enclosure: 'Enclosure A',
    dateArrived: '2018-02-14',
    dateOfBirth: '2005-09-28',
  },
];

const Tortoises: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTortoise, setSelectedTortoise] = useState<Tortoise | null>(
    id ? mockTortoises.find(t => t.id === id) || null : null
  );

  const filteredTortoises = mockTortoises.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Injured':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Ill':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Under Treatment':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Tortoise Profiles</h1>
              <p className="text-muted-foreground">View and manage tortoise records</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              Add Tortoise
            </button>
          </div>

          {selectedTortoise ? (
            // Tortoise Detail View
            <div className="space-y-6">
              <button
                onClick={() => setSelectedTortoise(null)}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-all"
              >
                ← Back to List
              </button>

              <div className="glass-panel p-8 border-white/10">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-6xl">
                      🐢
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {selectedTortoise.name}
                      </h2>
                      <p className="text-cyan-400 text-lg font-semibold mb-4">
                        {selectedTortoise.species}
                      </p>
                      <span className={`inline-block px-4 py-2 rounded-lg border font-medium text-sm ${getHealthColor(selectedTortoise.healthStatus)}`}>
                        {selectedTortoise.healthStatus}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center gap-2">
                    <Edit2 size={18} />
                    Edit
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-muted-foreground text-sm mb-1">Age</p>
                    <p className="text-2xl font-bold text-foreground">{selectedTortoise.age} yrs</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-muted-foreground text-sm mb-1">Gender</p>
                    <p className="text-2xl font-bold text-foreground">{selectedTortoise.gender}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-muted-foreground text-sm mb-1">Weight</p>
                    <p className="text-2xl font-bold text-foreground">{selectedTortoise.weight} kg</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-muted-foreground text-sm mb-1">Enclosure</p>
                    <p className="text-2xl font-bold text-foreground">{selectedTortoise.enclosure}</p>
                  </div>
                </div>

                {/* Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-cyan-400" />
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      {selectedTortoise.dateOfBirth && (
                        <div>
                          <p className="text-sm text-muted-foreground">Date of Birth</p>
                          <p className="text-foreground font-medium">{selectedTortoise.dateOfBirth}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Date Arrived</p>
                        <p className="text-foreground font-medium">{selectedTortoise.dateArrived}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Heart size={18} className="text-emerald-400" />
                      Health Summary
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm"><span className="text-muted-foreground">Last Check-up:</span> <span className="text-foreground font-medium">5 days ago</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Next Scheduled:</span> <span className="text-foreground font-medium">2024-04-20</span></p>
                      <p className="text-sm"><span className="text-muted-foreground">Vaccinations:</span> <span className="text-emerald-300 font-medium">Current</span></p>
                    </div>
                  </div>
                </div>

                {/* Care Logs */}
                <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-foreground mb-4">Recent Care Logs</h3>
                  <div className="space-y-3">
                    {[
                      { date: '2024-04-10', action: 'Feeding', notes: 'Ate well, vegetables consumed' },
                      { date: '2024-04-08', action: 'Health Check', notes: 'Vitals normal, no issues detected' },
                      { date: '2024-04-05', action: 'Habitat Maintenance', notes: 'Water replaced, enclosure cleaned' },
                      { date: '2024-04-02', action: 'Feeding', notes: 'Normal appetite, all portions consumed' },
                    ].map((log, idx) => (
                      <div key={idx} className="flex items-start justify-between py-3 border-b border-white/10 last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.notes}</p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{log.date}</p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                    View All Logs
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Tortoise List View
            <div className="space-y-6">
              {/* Search */}
              <div className="glass-panel p-6 border-white/10">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or species..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              {/* Tortoises Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTortoises.map((tortoise) => (
                  <button
                    key={tortoise.id}
                    onClick={() => setSelectedTortoise(tortoise)}
                    className="glass-panel p-6 border-white/10 text-left hover:border-cyan-500/50 hover:bg-white/[0.08] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-3xl group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all">
                        🐢
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getHealthColor(tortoise.healthStatus)}`}>
                        {tortoise.healthStatus}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {tortoise.name}
                    </h3>
                    <p className="text-cyan-400 text-sm font-medium mb-4">
                      {tortoise.species}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Age</span>
                        <span className="text-foreground font-medium">{tortoise.age} years</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="text-foreground font-medium">{tortoise.weight} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Enclosure</span>
                        <span className="text-foreground font-medium">{tortoise.enclosure}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredTortoises.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tortoises found matching your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Tortoises;
