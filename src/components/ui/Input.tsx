"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const themeSettings = useThemeSettings();
    return (
      <input
        type={type}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        style={
          {
            "--primary-color": hexToRgb(themeSettings?.primary || "#8C1F21"),
          } as React.CSSProperties
        }
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
