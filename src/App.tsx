import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { useContextSelector } from "use-context-selector";
import { Toaster } from 'react-hot-toast';

import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import Unauthorized from "./pages/Unauthorized";

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

  if (roles && !roles.includes(userRole || "")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#4CAF50",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#F44336",
                color: "white",
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route
            path="/orders"
            element={
              <PrivateRoute roles={["WAITER", "MANAGER"]}>
                <Orders />
              </PrivateRoute>
            }
          />
          <Route 
            path="/unauthorized" 
            element={<Unauthorized />} 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    </AuthProvider>
  );
}
