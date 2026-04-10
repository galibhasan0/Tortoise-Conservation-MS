import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Download, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'health' | 'feeding' | 'breeding' | 'operations';
  description: string;
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Weekly Health Summary',
    type: 'health',
    description: 'Comprehensive health status for all tortoises',
    lastGenerated: '2024-04-14',
    frequency: 'weekly',
  },
  {
    id: '2',
    name: 'Monthly Feeding Report',
    type: 'feeding',
    description: 'Feeding patterns and consumption trends',
    lastGenerated: '2024-04-01',
    frequency: 'monthly',
  },
  {
    id: '3',
    name: 'Breeding Season Summary',
    type: 'breeding',
    description: 'Breeding success rates and offspring data',
    lastGenerated: '2024-03-31',
    frequency: 'monthly',
  },
  {
    id: '4',
    name: 'Daily Operations Log',
    type: 'operations',
    description: 'Staff activities and habitat maintenance',
    lastGenerated: '2024-04-15',
    frequency: 'daily',
  },
  {
    id: '5',
    name: 'Quarterly Inventory Analysis',
    type: 'operations',
    description: 'Supply usage and reordering trends',
    lastGenerated: '2024-04-01',
    frequency: 'monthly',
  },
  {
    id: '6',
    name: 'Annual Health Statistics',
    type: 'health',
    description: 'Year-over-year health trends and achievements',
    lastGenerated: '2024-01-01',
    frequency: 'yearly',
  },
];

const mockAnalytics = [
  { metric: 'Total Tortoises', value: '24', trend: '+2' },
  { metric: 'Health Status: Healthy', value: '22', trend: '92%' },
  { metric: 'Feeding Compliance', value: '98%', trend: '+1%' },
  { metric: 'Successful Breedings', value: '8', trend: '+1' },
];

const Reports: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'all' | 'health' | 'feeding' | 'breeding' | 'operations'>('all');

  const filteredReports = mockReports.filter(report => {
    if (selectedType === 'all') return true;
    return report.type === selectedType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'health':
        return 'bg-red-500/20 text-red-300';
      case 'feeding':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'breeding':
        return 'bg-purple-500/20 text-purple-300';
      case 'operations':
        return 'bg-cyan-500/20 text-cyan-300';
      default:
        return 'bg-white/10 text-foreground';
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'weekly':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'monthly':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'yearly':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  return (
    <ProtectedRoute requiredRoles={['Admin', 'Supervisor']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate and view system reports</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Download size={20} />
              Export Data
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockAnalytics.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"
              >
                <p className="text-muted-foreground text-sm font-medium">{item.metric}</p>
                <div className="flex items-end justify-between mt-4">
                  <h3 className="text-3xl font-bold text-foreground">{item.value}</h3>
                  <span className="text-sm text-emerald-400 font-semibold">{item.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Report Builder */}
          <div className="glass-panel p-6 border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-cyan-400" />
              Generate Custom Report
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Report Type</label>
                <select className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all">
                  <option>Health Report</option>
                  <option>Feeding Analysis</option>
                  <option>Breeding Summary</option>
                  <option>Operations Log</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Date Range</label>
                <select className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Format</label>
                <select className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>

            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-background font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Generate Report
            </button>
          </div>

          {/* Report Filters */}
          <div className="glass-panel p-6 border-white/10">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'health', 'feeding', 'breeding', 'operations'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedType === type
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {type === 'all' ? 'All Reports' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Available Reports */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Available Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="glass-panel p-6 border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-white/10">
                        {report.type === 'health' ? (
                          <BarChart3 size={20} className="text-red-400" />
                        ) : report.type === 'feeding' ? (
                          <PieChart size={20} className="text-emerald-400" />
                        ) : report.type === 'breeding' ? (
                          <TrendingUp size={20} className="text-purple-400" />
                        ) : (
                          <Calendar size={20} className="text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-cyan-300 transition-all">
                          {report.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full border font-medium text-xs ${getFrequencyBadge(report.frequency)}`}>
                        {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                      </span>
                      <span className="text-muted-foreground">
                        Last generated: <span className="text-foreground font-medium">{report.lastGenerated}</span>
                      </span>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-cyan-400 hover:text-cyan-300">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="glass-panel p-6 border-white/10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Download size={20} className="text-emerald-400" />
              Quick Export
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 rounded-lg border border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left">
                <p className="font-semibold text-foreground mb-1">All Tortoise Data</p>
                <p className="text-xs text-muted-foreground">Export complete tortoise database</p>
              </button>
              <button className="p-4 rounded-lg border border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left">
                <p className="font-semibold text-foreground mb-1">This Month Logs</p>
                <p className="text-xs text-muted-foreground">Export April activity logs</p>
              </button>
              <button className="p-4 rounded-lg border border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left">
                <p className="font-semibold text-foreground mb-1">Health Records</p>
                <p className="text-xs text-muted-foreground">Export medical history</p>
              </button>
              <button className="p-4 rounded-lg border border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-left">
                <p className="font-semibold text-foreground mb-1">Inventory Report</p>
                <p className="text-xs text-muted-foreground">Export supply levels</p>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Reports;
