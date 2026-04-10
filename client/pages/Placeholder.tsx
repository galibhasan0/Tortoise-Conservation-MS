import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

const Placeholder: React.FC = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/')[1].charAt(0).toUpperCase() + location.pathname.split('/')[1].slice(1);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center glass-panel p-12 max-w-md border-white/10">
            <h1 className="text-2xl font-bold text-foreground mb-2">{pageName} Page</h1>
            <p className="text-muted-foreground mb-6">
              This page is currently under development. Continue prompting in the chat to build out this section.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Current route: <span className="font-mono text-cyan-400">{location.pathname}</span></p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Placeholder;
