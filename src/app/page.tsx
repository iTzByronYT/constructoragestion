'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { LoginForm } from '@/components/auth/login-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <DashboardLayout />;
}