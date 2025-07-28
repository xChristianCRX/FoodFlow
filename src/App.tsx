import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContextSelector } from 'use-context-selector';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import Auth from './pages/Auth';
import Tables from './pages/Tables';
import Unauthorized from './pages/Unauthorized';
import { Layout } from "./components/Layout";
import Menu from './pages/Menu';
import Users from './pages/Users';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const isAuthenticated = useContextSelector(AuthContext, (ctx) => ctx.isAuthenticated);
  const userRole = useContextSelector(AuthContext, (ctx) => ctx.user?.role);
  const isLoading = useContextSelector(AuthContext, (ctx) => ctx.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#D35400] animate-spin" />
          <p className="text-lg font-medium text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(userRole || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#4CAF50',
                color: 'white',
                fontSize: '14px',
                padding: '16px',
              },
              icon: '✓',
              duration: 3000,
            },
            error: {
              style: {
                background: '#F44336',
                color: 'white',
                fontSize: '14px',
                padding: '16px',
              },
              icon: '✕',
              duration: 4000,
            },
            loading: {
              style: {
                background: '#D35400',
                color: 'white',
                fontSize: '14px',
                padding: '16px',
              },
              icon: '⟳',
            },
          }}
        />

        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/tables" replace />} />
            <Route
              path="tables"
              element={
                <PrivateRoute roles={['WAITER', 'ADMIN', 'MANAGER']}>
                  <Tables />
                </PrivateRoute>
              }
            />
            <Route
              path="menu"
              element={
                <PrivateRoute roles={['ADMIN', 'MANAGER']}>
                  <Menu />
                </PrivateRoute>
              }
            />
            <Route
              path="users"
              element={
                <PrivateRoute roles={['ADMIN']}>
                  <Users />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    </AuthProvider>
  );
}
