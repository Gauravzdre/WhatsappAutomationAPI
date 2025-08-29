"use client"

import { useEffect, useState } from "react"

// Type definitions for performance APIs
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number
  processingEnd: number
  target?: EventTarget
}

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
  lastInputTime: number
  sources?: Array<{
    node?: Node
    currentRect?: DOMRectReadOnly
    previousRect?: DOMRectReadOnly
  }>
}

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  useEffect(() => {
    // Measure Time to First Byte
    if (performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.navigationStart
      setMetrics(prev => ({ ...prev, ttfb }))
    }

    // Measure First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Measure Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Measure First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fidEntry = entries[0] as PerformanceEventTiming
      if (fidEntry && 'processingStart' in fidEntry) {
        setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }))
      }
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Measure Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      for (const entry of entries) {
        const layoutShiftEntry = entry as LayoutShift
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }))
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Cleanup
    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  // Log metrics for debugging
  useEffect(() => {
    if (Object.values(metrics).some(m => m !== null)) {
      console.log('Performance Metrics:', metrics)
      
      // Send to analytics service
      // analytics.track('performance_metrics', metrics)
    }
  }, [metrics])

  return null // This component doesn't render anything
}

// Hook for measuring component render performance
export function usePerformanceMeasure(name: string) {
  useEffect(() => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      const duration = end - start
      
      console.log(`${name} render time: ${duration.toFixed(2)}ms`)
      
      // Track slow renders
      if (duration > 16) { // 60fps threshold
        console.warn(`${name} took ${duration.toFixed(2)}ms to render (slow)`)
      }
    }
  })
}

// Hook for measuring async operations
export function useAsyncPerformance<T>(
  asyncFn: () => Promise<T>,
  name: string
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = async () => {
    setIsLoading(true)
    setError(null)
    
    const start = performance.now()
    
    try {
      const result = await asyncFn()
      const duration = performance.now() - start
      
      console.log(`${name} completed in ${duration.toFixed(2)}ms`)
      
      // Track slow operations
      if (duration > 1000) {
        console.warn(`${name} took ${duration.toFixed(2)}ms (slow)`)
      }
      
      setData(result)
    } catch (err) {
      const duration = performance.now() - start
      console.error(`${name} failed after ${duration.toFixed(2)}ms:`, err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return { execute, isLoading, error, data }
}

// Component for measuring image load performance
export function PerformanceImage({
  src,
  alt,
  className,
  onLoad,
  onError,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loadTime, setLoadTime] = useState<number | null>(null)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const loadTime = performance.now() - performance.timing.navigationStart
    setLoadTime(loadTime)
    
    console.log(`Image ${src} loaded in ${loadTime.toFixed(2)}ms`)
    
    onLoad?.(e)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Image ${src} failed to load`)
    onError?.(e)
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  )
}

// Hook for measuring scroll performance
export function useScrollPerformance() {
  const [scrollMetrics, setScrollMetrics] = useState({
    scrollCount: 0,
    averageScrollTime: 0,
    lastScrollTime: 0
  })

  useEffect(() => {
    let scrollCount = 0
    let totalScrollTime = 0
    let lastScrollStart = performance.now()

    const handleScrollStart = () => {
      lastScrollStart = performance.now()
    }

    const handleScrollEnd = () => {
      const scrollTime = performance.now() - lastScrollStart
      scrollCount++
      totalScrollTime += scrollTime
      
      setScrollMetrics({
        scrollCount,
        averageScrollTime: totalScrollTime / scrollCount,
        lastScrollTime: scrollTime
      })
    }

    let scrollTimeout: NodeJS.Timeout
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScrollEnd, 150) // Debounce scroll end
    }

    document.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('scrollstart', handleScrollStart, { passive: true })

    return () => {
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('scrollstart', handleScrollStart)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return scrollMetrics
}

// Component for measuring user interactions
export function InteractionTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const trackInteraction = (event: Event) => {
      const target = event.target as HTMLElement
      const interactionType = event.type
      const timestamp = performance.now()
      
      console.log(`Interaction: ${interactionType} on ${target.tagName} at ${timestamp}`)
      
      // Send to analytics
      // analytics.track('user_interaction', {
      //   type: interactionType,
      //   target: target.tagName,
      //   timestamp
      // })
    }

    const events = ['click', 'input', 'focus', 'blur', 'submit']
    
    events.forEach(eventType => {
      document.addEventListener(eventType, trackInteraction, { passive: true })
    })

    return () => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, trackInteraction)
      })
    }
  }, [])

  return <>{children}</>
}
