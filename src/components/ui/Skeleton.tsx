import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{ backgroundColor: 'var(--theme-skeleton, hsl(var(--muted)))' }}
      {...props}
    />
  )
}

export { Skeleton }
