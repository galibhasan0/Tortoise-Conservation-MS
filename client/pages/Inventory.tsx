import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Package, AlertTriangle, TrendingDown } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  lastReordered: string;
  status: 'in_stock' | 'low' | 'critical';
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Mixed Vegetables',
    category: 'Food',
    quantity: 45,
    unit: 'kg',
    minStock: 30,
    lastReordered: '2024-04-10',
    status: 'in_stock',
  },
  {
    id: '2',
    name: 'Cactus Pads',
    category: 'Food',
    quantity: 12,
    unit: 'kg',
    minStock: 20,
    lastReordered: '2024-04-01',
    status: 'low',
  },
  {
    id: '3',
    name: 'Supplements (Calcium)',
    category: 'Medical',
    quantity: 5,
    unit: 'bottles',
    minStock: 10,
    lastReordered: '2024-03-25',
    status: 'critical',
  },
  {
    id: '4',
    name: 'UV Lamps (10W)',
    category: 'Equipment',
    quantity: 3,
    unit: 'units',
    minStock: 4,
    lastReordered: '2024-04-05',
    status: 'low',
  },
  {
    id: '5',
    name: 'Enclosure Substrate',
    category: 'Materials',
    quantity: 150,
    unit: 'liters',
    minStock: 100,
    lastReordered: '2024-04-08',
    status: 'in_stock',
  },
  {
    id: '6',
    name: 'Heating Elements',
    category: 'Equipment',
    quantity: 8,
    unit: 'units',
    minStock: 5,
    lastReordered: '2024-03-30',
    status: 'in_stock',
  },
  {
    id: '7',
    name: 'Water Filters',
    category: 'Equipment',
    quantity: 2,
    unit: 'units',
    minStock: 5,
    lastReordered: '2024-04-12',
    status: 'critical',
  },
  {
    id: '8',
    name: 'Medical Supplies',
    category: 'Medical',
    quantity: 15,
    unit: 'items',
    minStock: 10,
    lastReordered: '2024-04-06',
    status: 'in_stock',
  },
];

const Inventory: React.FC = () => {
  const [inventory] = useState(mockInventory);
  const [filter, setFilter] = useState<'all' | 'in_stock' | 'low' | 'critical'>('all');

  const filteredItems = inventory.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'low':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-foreground border-white/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food':
        return 'bg-cyan-500/20 text-cyan-300';
      case 'Medical':
        return 'bg-red-500/20 text-red-300';
      case 'Equipment':
        return 'bg-purple-500/20 text-purple-300';
      case 'Materials':
        return 'bg-amber-500/20 text-amber-300';
      default:
        return 'bg-white/10 text-foreground';
    }
  };

  const stats = [
    { label: 'Total Items', value: inventory.length, icon: Package, color: 'cyan' },
    { label: 'In Stock', value: inventory.filter(i => i.status === 'in_stock').length, icon: Package, color: 'emerald' },
    { label: 'Low Stock', value: inventory.filter(i => i.status === 'low').length, icon: AlertTriangle, color: 'amber' },
    { label: 'Critical', value: inventory.filter(i => i.status === 'critical').length, icon: TrendingDown, color: 'red' },
  ];

  return (
    <ProtectedRoute requiredRoles={['Collection Officer', 'Supervisor']}>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
              <p className="text-muted-foreground">Manage supplies and equipment</p>
            </div>
            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
              <Plus size={20} />
              New Item
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
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
              {(['all', 'in_stock', 'low', 'critical'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    filter === status
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-white/5 border border-white/10 text-foreground hover:border-white/20'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'in_stock' ? 'In Stock' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="glass-panel border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Item Name</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Category</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Quantity</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Min Stock</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-muted-foreground font-medium">Last Reordered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                      <td className="py-4 px-6 text-foreground font-medium">{item.name}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-foreground">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-4 px-6 text-foreground">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status === 'in_stock' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Critical'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{item.lastReordered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items match your filter</p>
              </div>
            )}
          </div>

          {/* Reorder Alert */}
          {inventory.some(i => i.status === 'critical') && (
            <div className="glass-panel p-6 border-red-500/50 bg-red-500/10">
              <div className="flex items-start gap-4">
                <AlertTriangle size={24} className="text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-300 mb-2">Critical Stock Items</h3>
                  <p className="text-sm text-red-200 mb-3">
                    The following items are critically low and need immediate reordering:
                  </p>
                  <ul className="space-y-1 text-sm">
                    {inventory
                      .filter(i => i.status === 'critical')
                      .map(i => (
                        <li key={i.id} className="text-red-200">
                          • {i.name} - {i.quantity} {i.unit} (Min: {i.minStock})
                        </li>
                      ))}
                  </ul>
                  <button className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg font-medium text-sm hover:bg-red-500/30 transition-all">
                    Create Purchase Order
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Inventory;
