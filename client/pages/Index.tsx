import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SupervisorDashboard from '@/components/dashboards/SupervisorDashboard';
import DefaultDashboard from '@/components/dashboards/DefaultDashboard';

const Index: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Supervisor':
        return <SupervisorDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>{renderDashboard()}</Layout>
    </ProtectedRoute>
  );
};

export default Index;
