import { Fragment, ReactNode } from 'react';

interface OnboardingStepHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function OnboardingStepHeader({
  title,
  description,
  icon,
}: OnboardingStepHeaderProps) {
  return (
    <Fragment>
      {icon ? (
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      ) : null}

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-base text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </Fragment>
  );
}
