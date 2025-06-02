import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts: Toast[] = []

export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast: Toast = { id, title, description, variant }
  
  // For now, just console.log the toast
  console.log(`Toast (${variant}):`, title, description)
  
  // You can implement a proper toast system here
  // This is a minimal implementation
  if (typeof window !== 'undefined') {
    if (variant === 'destructive') {
      alert(`Error: ${title}\n${description}`)
    } else {
      alert(`${title}\n${description}`)
    }
  }
  
  return { dismiss: () => {} }
}

export const useToast = () => {
  return { toast }
} 