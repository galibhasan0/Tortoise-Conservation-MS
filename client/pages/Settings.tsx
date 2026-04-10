import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [dataRetention, setDataRetention] = useState('30days');

  const handleSave = () => {
    // Save settings logic
    console.log({ theme, notifications, dataRetention });
  };

  return (
    <ProtectedRoute requiredRoles={['Admin', 'Supervisor']}>
      <Layout>
        <div className="space-y-8 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
            <p className="text-muted-foreground">Configure system parameters and preferences</p>
          </div>

          {/* General Settings */}
          <div className="glass-panel p-8 border-white/10">
            <h2 className="text-2xl font-bold text-foreground mb-6">General Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
                >
                  <option value="dark">Dark (AI Aura)</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Data Retention Period</label>
                <select
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
                >
                  <option value="7days">7 days</option>
                  <option value="30days">30 days</option>
                  <option value="90days">90 days</option>
                  <option value="1year">1 year</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 px-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-foreground font-medium">System Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive system alerts and notifications</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                    notifications ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </div>

          {/* User Management */}
          <div className="glass-panel p-8 border-white/10">
            <h2 className="text-2xl font-bold text-foreground mb-6">User Management</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Dr. Sarah Wilson', role: 'Vet', status: 'Active' },
                    { name: 'John Smith', role: 'Caretaker', status: 'Active' },
                    { name: 'Emma Davis', role: 'Breeding Officer', status: 'Inactive' },
                    { name: 'Mike Johnson', role: 'Staff', status: 'Active' },
                  ].map((user, idx) => (
                    <tr key={idx} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-all">
                      <td className="py-3 px-4 text-foreground">{user.name}</td>
                      <td className="py-3 px-4 text-foreground">{user.role}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Information */}
          <div className="glass-panel p-8 border-white/10">
            <h2 className="text-2xl font-bold text-foreground mb-6">System Information</h2>

            <div className="space-y-3">
              {[
                { label: 'System Version', value: '1.0.0' },
                { label: 'Database', value: 'Connected' },
                { label: 'API Status', value: 'Operational' },
                { label: 'Last Backup', value: '2 hours ago' },
              ].map((info, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <span className="text-muted-foreground">{info.label}</span>
                  <span className="text-foreground font-medium">{info.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Settings;
