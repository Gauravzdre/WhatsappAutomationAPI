import * as React from "react"
import { cn } from "@/lib/utils"

const MobileForm = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ className, ...props }, ref) => (
  <form
    ref={ref}
    className={cn("space-y-4 sm:space-y-6", className)}
    {...props}
  />
))
MobileForm.displayName = "MobileForm"

const MobileFormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    required?: boolean
  }
>(({ className, required, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  >
    {children}
  </div>
))
MobileFormField.displayName = "MobileFormField"

const MobileFormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean
  }
>(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm sm:text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
))
MobileFormLabel.displayName = "MobileFormLabel"

const MobileFormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-12 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2",
      "text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent",
      "file:text-sm file:font-medium placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
MobileFormInput.displayName = "MobileFormInput"

const MobileFormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] sm:min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2",
      "text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
MobileFormTextarea.displayName = "MobileFormTextarea"

const MobileFormSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    className={cn(
      "flex h-12 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2",
      "text-base sm:text-sm ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </select>
))
MobileFormSelect.displayName = "MobileFormSelect"

const MobileFormButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    fullWidth?: boolean
  }
>(({ className, variant = 'default', size = 'default', fullWidth = false, ...props }, ref) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  }

  const sizeClasses = {
    default: 'h-12 sm:h-10 px-4 py-2',
    sm: 'h-10 sm:h-9 rounded-md px-3',
    lg: 'h-14 sm:h-11 rounded-md px-8',
    icon: 'h-12 w-12 sm:h-10 sm:w-10',
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-base sm:text-sm font-medium ring-offset-background",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
MobileFormButton.displayName = "MobileFormButton"

const MobileFormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-destructive", className)}
    {...props}
  />
))
MobileFormError.displayName = "MobileFormError"

const MobileFormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs sm:text-sm text-muted-foreground", className)}
    {...props}
  />
))
MobileFormDescription.displayName = "MobileFormDescription"

export {
  MobileForm,
  MobileFormField,
  MobileFormLabel,
  MobileFormInput,
  MobileFormTextarea,
  MobileFormSelect,
  MobileFormButton,
  MobileFormError,
  MobileFormDescription,
} 