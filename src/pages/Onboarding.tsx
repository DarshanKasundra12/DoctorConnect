import DoctorProfileForm from '@/components/auth/DoctorProfileForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Onboarding = () => {
  const { user, isOnboardingComplete, checkOnboardingStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!user) {
      navigate('/auth');
      return;
    }

    // If onboarding is already complete, redirect to dashboard
    if (isOnboardingComplete === true) {
      navigate('/dashboard');
      return;
    }
  }, [user, isOnboardingComplete, navigate]);

  const handleOnboardingComplete = async () => {
    // Refresh the onboarding status
    await checkOnboardingStatus();
    // Navigate to dashboard
    navigate('/dashboard');
  };

  // Show loading or nothing while checking authentication/onboarding status
  if (!user || isOnboardingComplete === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If onboarding is already complete, don't show the form (navigation will happen via useEffect)
  if (isOnboardingComplete === true) {
    return null;
  }

  return <DoctorProfileForm onComplete={handleOnboardingComplete} />;
};

export default Onboarding;