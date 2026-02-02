import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "glow" | "success" | "warning"
  }
>(({ className, value, variant = "default", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-500 ease-out",
        variant === "default" && "bg-primary",
        variant === "glow" && "bg-primary shadow-[0_0_10px_rgba(6,153,106,0.6),0_0_20px_rgba(6,153,106,0.4)]",
        variant === "success" && "bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.6)]",
        variant === "warning" && "bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.6)]"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
