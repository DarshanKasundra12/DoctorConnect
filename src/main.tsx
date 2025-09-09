import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Calls from './pages/Calls';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Teleconsult from './pages/Teleconsult';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import './index.css'

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = () => {
  const { user, loading, isOnboardingComplete } = useAuth();
  
  // Show loading spinner while checking auth status
  if (loading || (user && isOnboardingComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (user && isOnboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is authenticated and has completed onboarding, render the protected content
  return <Outlet />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Protected Dashboard Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calls" element={<Calls />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/prescriptions" element={<Prescriptions />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/teleconsult" element={<Teleconsult />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
