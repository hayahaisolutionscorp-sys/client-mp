"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useThemeSettings } from "@/hooks/theme-settings";
import { useBranding } from "@/hooks/branding";

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
  ({ className, variant = "default", size, asChild = false, disabled, onClick, children, ...props }, ref) => {
    const themeSettings = useThemeSettings();
    const branding = useBranding();
    const Comp = asChild ? Slot : "button";
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
    const [isInView, setIsInView] = React.useState(asChild);
    const localRef = React.useRef<HTMLButtonElement | null>(null);

    const buttonTemplate = ((branding?.colors as any)?.buttonTemplate || "modern-solid") as
      | "modern-solid"
      | "gradient-shift"
      | "glass-frost"
      | "outline-tech"
      | "soft-minimal";

    const templateAccentClassByKey: Record<string, string> = {
      "modern-solid": "",
      "gradient-shift": "border-transparent",
      "glass-frost": "border-white/40 text-slate-900",
      "outline-tech": "bg-transparent",
      "soft-minimal": "border-transparent",
    };

    // Dynamically apply theme settings colors using `style`
    const style: React.CSSProperties = {};
    if (themeSettings) {
      if (variant === "default" && themeSettings.primaryColor && buttonTemplate === "modern-solid") {
        style.backgroundColor = themeSettings.primaryColor;
      }
      if (variant === "destructive") {
        style.backgroundColor = "#DC2626";
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

    React.useEffect(() => {
      if (asChild || !localRef.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(localRef.current);
      return () => observer.disconnect();
    }, [asChild]);

    const templateClassByKey: Record<string, string> = {
      "modern-solid": "shadow-[0_6px_18px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.18)]",
      "gradient-shift": "bg-[linear-gradient(120deg,#23abff,#0ea5e9,#0284c7)] bg-[length:180%_180%] hover:bg-[position:100%_50%] text-white shadow-[0_10px_24px_rgba(14,165,233,0.35)] hover:-translate-y-0.5",
      "glass-frost": "border border-white/40 bg-white/45 backdrop-blur-md text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.14)] hover:bg-white/60 hover:-translate-y-0.5",
      "outline-tech": "border-2 border-slate-400 bg-transparent text-slate-800 hover:border-slate-700 hover:bg-slate-900 hover:text-white",
      "soft-minimal": "bg-slate-100 text-slate-800 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.3)] hover:bg-slate-200",
    };

    const templateClass = templateClassByKey[buttonTemplate] || templateClassByKey["modern-solid"];
    const templateAccentClass = templateAccentClassByKey[buttonTemplate] || "";
    const entranceClass = isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      if (!asChild && !disabled && localRef.current) {
        const rect = localRef.current.getBoundingClientRect();
        const sizePx = Math.max(rect.width, rect.height) * 1.2;
        const ripple = {
          id: Date.now(),
          x: event.clientX - rect.left - sizePx / 2,
          y: event.clientY - rect.top - sizePx / 2,
          size: sizePx,
        };
        setRipples((prev) => [...prev, ripple]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((item) => item.id !== ripple.id));
        }, 500);
      }

      onClick?.(event);
    };

    // Variants that should NOT receive the global template background/color overrides
    const isTemplateIgnored = variant === "outline" || variant === "ghost" || variant === "link" || variant === "destructive" || variant === "secondary";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          "relative overflow-hidden transition-all duration-300 ease-out",
          entranceClass,
          variant !== "link" && templateAccentClass,
          variant === "default" && templateClass,
          className
        )}
        ref={(node: HTMLButtonElement | null) => {
          localRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        style={style}
        disabled={disabled}
        onClick={handleClick}
        {...(isTemplateIgnored ? { "data-template-ignore": "true" } : {})}
        {...props}
      >
        {children}
        {!asChild &&
          ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="pointer-events-none absolute rounded-full bg-white/45 animate-ping"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                animationDuration: "500ms",
              }}
            />
          ))}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
