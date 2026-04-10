import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Edit2 } from 'lucide-react';
import Layout from '@/components/Layout';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveProfile = () => {
    if (fullName.trim()) {
      updateProfile({ fullName, email });
      setIsEditing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-8 border-cyan-500/30">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-4xl font-bold text-background">
                {user?.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user?.fullName}</h2>
                <p className="text-cyan-400 font-semibold">{user?.role}</p>
                <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg border border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center gap-2"
            >
              <Edit2 size={18} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing && (
            <div className="space-y-6 pt-8 border-t border-white/10">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="glass-panel p-8 border-white/10">
          <h2 className="text-2xl font-bold text-foreground mb-6">Security</h2>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Current Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-background font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Change Password
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="glass-panel p-8 border-white/10">
          <h2 className="text-2xl font-bold text-foreground mb-6">Account Information</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-muted-foreground">User ID</span>
              <span className="text-foreground font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <span className="text-muted-foreground">Role</span>
              <span className="text-foreground font-semibold">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-emerald-400 font-medium">Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
