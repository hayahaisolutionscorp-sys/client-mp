"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function AnimatedSection({ id, className, style, children }: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });

  return (
    <div
      ref={ref}
      id={id}
      className={cn(className, isInView ? "in-view" : "")}
      style={style}
    >
      {children}
    </div>
  );
}
