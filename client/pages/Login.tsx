import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const ROLES: UserRole[] = [
  'Admin',
  'Supervisor',
  'Vet',
  'Caretaker',
  'Breeding Officer',
  'Env Tech',
  'Collection Officer',
  'Staff',
];

const LOGIN_DESCRIPTIONS: Record<UserRole, string> = {
  'Admin': 'Full system access and configuration',
  'Supervisor': 'Task management and team oversight',
  'Vet': 'Health records and medical care',
  'Caretaker': 'Daily care and feeding tasks',
  'Breeding Officer': 'Breeding program management',
  'Env Tech': 'Habitat and environment monitoring',
  'Collection Officer': 'Collection and inventory management',
  'Staff': 'General support tasks',
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Caretaker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');
    try {
      await login(username, password, selectedRole);
      navigate('/');
    } catch (error: any) {
      setLoginError(error?.message ?? 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Role Selection */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AURA Shell
                </span>
              </h1>
              <p className="text-muted-foreground">Tortoise Conservation Management System</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground mb-4">Select Your Role</h2>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedRole === role
                      ? 'glass-panel border-cyan-500/50 bg-cyan-500/10 glow-cyan'
                      : 'glass-card border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="font-semibold text-foreground">{role}</div>
                  <div className="text-sm text-muted-foreground">
                    {LOGIN_DESCRIPTIONS[role]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center">
            <form onSubmit={handleLogin} className="w-full space-y-6">
              <div className="glass-panel p-8 border-purple-500/30">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Login</h3>

                {/* Username */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-foreground">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:bg-white/15 transition-all"
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:bg-white/15 transition-all pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mb-6 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/10"
                      disabled={isLoading}
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-cyan-400 hover:text-cyan-300 transition-all"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
                    {loginError}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || !username.trim() || !password.trim()}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-background font-semibold hover:shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 glow-cyan"
                >
                  <LogIn size={18} />
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              {/* Info Box */}
              <div className="glass-card p-4 border-cyan-500/20 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">Demo Credentials</p>
                <div className="space-y-1">
                  <p><span className="text-cyan-400">Admin:</span> admin / admin123</p>
                  <p><span className="text-cyan-400">Supervisor:</span> supervisor1 / demo123</p>
                  <p><span className="text-cyan-400">Vet:</span> vet1 / demo123</p>
                  <p><span className="text-cyan-400">Caretaker:</span> caretaker1 / demo123</p>
                  <p className="text-xs opacity-60 mt-2">Role is determined by your account, not the selector.</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
