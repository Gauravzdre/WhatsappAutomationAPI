"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Skip to main content link
export function SkipToMainContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}

// Focus trap for modals and dialogs
export function FocusTrap({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return <div ref={containerRef}>{children}</div>
}

// Live region for announcements
export function LiveRegion({ 
  children, 
  ariaLive = "polite",
  className 
}: { 
  children: React.ReactNode
  ariaLive?: "polite" | "assertive" | "off"
  className?: string
}) {
  return (
    <div
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

// Visually hidden but accessible to screen readers
export function VisuallyHidden({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
        className
      )}
    >
      {children}
    </span>
  )
}

// Accessible button with proper ARIA attributes
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  "aria-label"?: string
  "aria-describedby"?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-busy={loading}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
      {children}
    </button>
  )
}

// Accessible form field with proper labeling
export function AccessibleFormField({
  label,
  error,
  required = false,
  children,
  className,
  ...props
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId()
  const errorId = React.useId()

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <label
        htmlFor={id}
        className="block text-sm font-medium leading-6"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? errorId : undefined,
        required,
      })}
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible loading spinner
export function AccessibleSpinner({ 
  size = "md",
  "aria-label": ariaLabel = "Loading",
  className 
}: {
  size?: "sm" | "md" | "lg"
  "aria-label"?: string
  className?: string
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn("animate-spin", sizeClasses[size], className)}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

// Accessible tooltip
export function AccessibleTooltip({
  children,
  content,
  position = "top",
  className
}: {
  children: React.ReactNode
  content: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg",
            positionClasses[position],
            className
          )}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              [position]: "-4px",
              left: position === "top" || position === "bottom" ? "50%" : "auto",
              top: position === "left" || position === "right" ? "50%" : "auto",
              transform: `translate(${position === "top" || position === "bottom" ? "-50%" : "0"}, ${position === "left" || position === "right" ? "-50%" : "0"}) rotate(45deg)`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Accessibility utilities
export const accessibilityUtils = {
  // Generate unique IDs
  generateId: (prefix = "id") => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex')
    return (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA' ||
      tabIndex === '0' ||
      (tabIndex !== null && parseInt(tabIndex) >= 0)
    )
  },
  
  // Get all focusable elements
  getFocusableElements: (container: HTMLElement) => {
    return Array.from(container.querySelectorAll('*')).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && accessibilityUtils.isFocusable(el)
    )
  }
}
