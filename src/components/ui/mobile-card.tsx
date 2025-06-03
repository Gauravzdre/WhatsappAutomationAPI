import * as React from "react"
import { cn } from "@/lib/utils"

const MobileCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'compact' | 'full-width'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'p-4 sm:p-6',
    compact: 'p-3 sm:p-4',
    'full-width': 'p-4 sm:p-6 w-full'
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
        "hover:shadow-md active:scale-[0.98] sm:active:scale-100",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
MobileCard.displayName = "MobileCard"

const MobileCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    compact?: boolean
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      compact ? "pb-2" : "pb-3",
      className
    )}
    {...props}
  />
))
MobileCardHeader.displayName = "MobileCardHeader"

const MobileCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl'
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
MobileCardTitle.displayName = "MobileCardTitle"

const MobileCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm sm:text-base text-muted-foreground leading-relaxed",
      className
    )}
    {...props}
  />
))
MobileCardDescription.displayName = "MobileCardDescription"

const MobileCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'tight' | 'normal' | 'loose'
  }
>(({ className, spacing = 'normal', ...props }, ref) => {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-3 sm:space-y-4',
    loose: 'space-y-4 sm:space-y-6'
  }

  return (
    <div
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  )
})
MobileCardContent.displayName = "MobileCardContent"

const MobileCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    direction?: 'row' | 'column'
  }
>(({ className, direction = 'row', ...props }, ref) => {
  const directionClasses = {
    row: 'flex flex-col sm:flex-row gap-2 sm:gap-3',
    column: 'flex flex-col gap-2'
  }

  return (
    <div
      ref={ref}
      className={cn(
        "pt-3 sm:pt-4",
        directionClasses[direction],
        className
      )}
      {...props}
    />
  )
})
MobileCardFooter.displayName = "MobileCardFooter"

export {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardContent,
  MobileCardFooter,
} 