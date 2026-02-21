import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { FC, ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  /**
   * If true: route requires onboarding to be completed (Home/Settings).
   * If false: route requires onboarding to NOT be completed (Onboarding pages).
   */
  requireOnboardingComplete: boolean;
  /**
   * Where to send the user when the requirement isn't met.
   */
  redirectTo: string;
}

/**
 * RouteGuard - Single guard for both protected and onboarding routes.
 * Uses AppContext.settings.onboardingComplete as the single source of truth.
 */
export const RouteGuard: FC<RouteGuardProps> = ({
  children,
  requireOnboardingComplete,
  redirectTo,
}) => {
  const { settings } = useApp();
  const isComplete = settings.onboardingComplete;

  const allowed = requireOnboardingComplete ? isComplete : !isComplete;
  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
