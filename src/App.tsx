import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContextSelector } from 'use-context-selector';
import { Toaster } from 'react-hot-toast';

import Auth from './pages/Auth';
import Tables from './pages/Tables';
import Orders from './pages/Orders';
import Unauthorized from './pages/Unauthorized';
import { Layout } from "./components/Layout";
import Menu from './pages/Menu';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const isAuthenticated = useContextSelector(AuthContext, (ctx) => ctx.isAuthenticated);
  const userRole = useContextSelector(AuthContext, (ctx) => ctx.user?.role);

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
      <Toaster position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#4CAF50',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#F44336',
              color: 'white',
            },
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
          <Route path="tables"
            element={
              <PrivateRoute roles={['WAITER', 'MANAGER']}>
                <Tables />
              </PrivateRoute>
            }
          />

          <Route path="orders"
            element={
              <PrivateRoute roles={['WAITER', 'MANAGER']}>
                <Orders />
              </PrivateRoute>
            }
          />

          <Route path="menu"
            element={
              <PrivateRoute roles={['WAITER', 'MANAGER']}>
                <Menu />
              </PrivateRoute>
            }
          />
          <Route index element={<Navigate to="/tables" />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
