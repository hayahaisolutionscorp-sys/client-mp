"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/hooks/theme-settings";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-gray-400 disabled:text-gray-100 disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#23abff] text-white hover:opacity-90",
        destructive: "bg-[#dc2626] text-white hover:opacity-90",
        outline: "border bg-white hover:bg-gray-100",
        secondary: "bg-gray-600 text-white hover:bg-gray-500",
        ghost: "hover:bg-gray-200 text-black",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size, asChild = false, disabled, ...props }, ref) => {
    const themeSettings = useThemeSettings();
    const Comp = asChild ? Slot : "button";

    // Dynamically apply theme settings colors using `style`
    const style: React.CSSProperties = {};
    if (themeSettings) {
      if (variant === "default" && themeSettings.primaryColor) {
        style.backgroundColor = themeSettings.primaryColor;
      }
      if (variant === "destructive" && themeSettings.buttonDestructiveColor) {
        style.backgroundColor = themeSettings.buttonDestructiveColor;
      }
      if (variant === "outline" && themeSettings.primaryColor) {
        style.borderColor = themeSettings.primaryColor;
        style.color = themeSettings.primaryColor;
      }
      if (variant === "secondary" && themeSettings.secondaryColor) {
        style.backgroundColor = themeSettings.secondaryColor;
        style.color = "white"; // Ensure text is visible on secondary color
      }
      if (variant === "ghost" && themeSettings.primaryColor) {
        style.color = themeSettings.primaryColor;
      }
      if (variant === "link" && themeSettings.primaryColor) {
        style.color = themeSettings.primaryColor;
      }
    }

    // Override disabled button color to gray
    if (disabled) {
      style.backgroundColor = "gray";
      style.color = "white";
      style.opacity = "0.25";
      style.cursor = "not-allowed";
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        style={style}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
