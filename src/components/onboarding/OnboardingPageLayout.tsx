import { ReactNode } from 'react';

interface OnboardingPageLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
}

export function OnboardingPageLayout({
  children,
  currentStep,
  totalSteps = 3,
}: OnboardingPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md space-y-6 px-5 py-6">{children}</div>

      <div className="mx-auto max-w-md px-5 py-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
