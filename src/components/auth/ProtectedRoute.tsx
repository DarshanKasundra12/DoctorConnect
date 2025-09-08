import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

const ProtectedRoute = () => {
  const { user, loading, isOnboardingComplete } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading || (user && isOnboardingComplete === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (user && isOnboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is authenticated and has completed onboarding, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;