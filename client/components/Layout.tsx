import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu, X, LogOut, User, Settings, Bell, Home, Users, TrendingUp, CheckSquare,
  AlertTriangle, Heart, Activity, Utensils, GitBranch, BarChart2, Package
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'dashboard': <Home size={20} />,
      'users': <Users size={20} />,
      'settings': <Settings size={20} />,
      'trending-up': <TrendingUp size={20} />,
      'check-square': <CheckSquare size={20} />,
      'alert-triangle': <AlertTriangle size={20} />,
      'heart': <Heart size={20} />,
      'activity': <Activity size={20} />,
      'utensils': <Utensils size={20} />,
      'git-branch': <GitBranch size={20} />,
      'home': <Home size={20} />,
      'bar-chart-2': <BarChart2 size={20} />,
      'package': <Package size={20} />,
    };
    return icons[iconName] || <Home size={20} />;
  };

  const getRoleMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', href: '/', icon: 'dashboard' },
    ];

    const roleItems: Record<string, Array<{ label: string; href: string; icon: string }>> = {
      'Admin': [
        { label: 'Users', href: '/users', icon: 'users' },
        { label: 'Settings', href: '/settings', icon: 'settings' },
        { label: 'Reports', href: '/reports', icon: 'trending-up' },
      ],
      'Supervisor': [
        { label: 'Tasks', href: '/tasks', icon: 'check-square' },
        { label: 'Settings', href: '/settings', icon: 'settings' },
        { label: 'Alerts', href: '/alerts', icon: 'alert-triangle' },
      ],
      'Vet': [
        { label: 'Health Records', href: '/health', icon: 'heart' },
        { label: 'Tortoises', href: '/tortoises', icon: 'activity' },
      ],
      'Caretaker': [
        { label: 'Tasks', href: '/tasks', icon: 'check-square' },
        { label: 'Feeding', href: '/feeding', icon: 'utensils' },
        { label: 'Tortoises', href: '/tortoises', icon: 'activity' },
      ],
      'Breeding Officer': [
        { label: 'Breeding', href: '/breeding', icon: 'git-branch' },
        { label: 'Tortoises', href: '/tortoises', icon: 'activity' },
      ],
      'Env Tech': [
        { label: 'Habitats', href: '/habitats', icon: 'home' },
        { label: 'Metrics', href: '/metrics', icon: 'bar-chart-2' },
      ],
      'Collection Officer': [
        { label: 'Inventory', href: '/inventory', icon: 'package' },
        { label: 'Tortoises', href: '/tortoises', icon: 'activity' },
      ],
      'Staff': [
        { label: 'My Tasks', href: '/tasks', icon: 'check-square' },
        { label: 'Tortoises', href: '/tortoises', icon: 'activity' },
      ],
    };

    const items = roleItems[user?.role || 'Staff'] || [];
    return baseItems.concat(items);
  };

  const menuItems = getRoleMenuItems();
  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass-panel flex flex-col transition-all duration-300 border-r border-white/10`}
      >
        {/* Logo/Brand */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-background glow-cyan">
              AS
            </div>
            {sidebarOpen && <span className="font-bold text-lg">AURA</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 glow-cyan'
                  : 'text-foreground hover:bg-white/5 border border-transparent'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              {getIconComponent(item.icon)}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile Mini */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/profile')
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-foreground hover:bg-white/5'
            }`}
          >
            <User size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Profile</span>}
          </Link>

          {sidebarOpen && (
            <div className="text-xs text-muted-foreground px-4 py-2">
              <p className="font-semibold">{user?.fullName}</p>
              <p className="text-muted-foreground">{user?.role}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-24 bg-card border border-white/20 rounded-full p-1 hover:bg-white/10 transition-all"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-panel border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AURA Shell
            </h1>
            <p className="text-sm text-muted-foreground">Tortoise Conservation Management</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/20">
              <Bell size={20} className="text-cyan-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
            </button>

            {user?.role === 'Admin' || user?.role === 'Supervisor' ? (
              <Link
                to="/settings"
                className="p-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/20"
              >
                <Settings size={20} className="text-purple-400" />
              </Link>
            ) : null}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
