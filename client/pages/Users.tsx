import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@tortoisecare.local',
    role: 'Vet',
    status: 'active',
    joinDate: '2022-03-15',
    lastLogin: '2024-04-15',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@tortoisecare.local',
    role: 'Caretaker',
    status: 'active',
    joinDate: '2021-07-20',
    lastLogin: '2024-04-14',
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.davis@tortoisecare.local',
    role: 'Breeding Officer',
    status: 'active',
    joinDate: '2023-01-10',
    lastLogin: '2024-04-15',
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike.johnson@tortoisecare.local',
    role: 'Staff',
    status: 'inactive',
    joinDate: '2020-11-05',
    lastLogin: '2024-03-20',
  },
  {
    id: '5',
    name: 'Dr. James Brown',
    email: 'james.brown@tortoisecare.local',
    role: 'Vet',
    status: 'active',
    joinDate: '2021-05-12',
    lastLogin: '2024-04-15',
  },
  {
    id: '6',
    name: 'Lisa Chen',
    email: 'lisa.chen@tortoisecare.local',
    role: 'Env Tech',
    status: 'active',
    joinDate: '2023-06-01',
    lastLogin: '2024-04-14',
  },
  {
    id: '7',
    name: 'Robert Martinez',
    email: 'robert.martinez@tortoisecare.local',
    role: 'Collection Officer',
    status: 'suspended',
    joinDate: '2022-08-15',
    lastLogin: '2024-02-10',
  },
  {
    id: '8',
    name: 'Angela Thompson',
    email: 'angela.thompson@tortoisecare.local',
    role: 'Supervisor',
    status: 'active',
    joinDate: '2020-02-03',
    lastLogin: '2024-04-15',
  },
];

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roles = Array.from(new Set(mockUsers.map(u => u.role)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'suspended':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const stats = [
    { label: 'Total Users', value: mockUsers.length, color: 'cyan' },
    { label: 'Active', value: mockUsers.filter(u => u.status === 'active').length, color: 'emerald' },
    { label: 'Inactive', value: mockUsers.filter(u => u.status === 'inactive').length, color: 'gray' },
    { label: 'Suspended', value: mockUsers.filter(u => u.status === 'suspended').length, color: 'red' },
  ];

  return (
    <ProtectedRoute requiredRoles={['Admin']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
              <p className="text-muted-foreground">Manage system users and permissions</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              New User
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const colorClass = {
                cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
                emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
                gray: 'from-gray-500/20 to-gray-500/5 border-gray-500/30',
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

          {/* Search and Filters */}
          <div className="glass-panel p-6 border-white/10 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Role:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    roleFilter === 'all'
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  All Roles
                </button>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      roleFilter === role
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                        : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'active', 'inactive', 'suspended'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      statusFilter === status
                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-panel border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Role</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Last Login</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="py-4 px-6 text-foreground font-medium">{user.name}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{user.email}</td>
                      <td className="py-4 px-6 text-foreground">{user.role}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{user.lastLogin}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-cyan-400 hover:text-cyan-300">
                            <Edit2 size={18} />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-red-400 hover:text-red-300">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Users;
