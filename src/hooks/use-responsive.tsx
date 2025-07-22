import { useState, useEffect } from 'react'

// Breakpoint definitions matching Tailwind CSS defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

export interface ResponsiveState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  breakpoint: Breakpoint | 'xs'
  orientation: 'portrait' | 'landscape'
  isTouch: boolean
}

/**
 * Enhanced responsive design hook that provides comprehensive screen size and device information
 * 
 * @returns ResponsiveState object with current screen information
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Initialize with safe defaults for SSR
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        breakpoint: 'lg' as const,
        orientation: 'landscape',
        isTouch: false,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    
    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      isLargeDesktop: width >= BREAKPOINTS.xl,
      breakpoint: getBreakpoint(width),
      orientation: height > width ? 'portrait' : 'landscape',
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateState = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setState({
        width,
        height,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        isLargeDesktop: width >= BREAKPOINTS.xl,
        breakpoint: getBreakpoint(width),
        orientation: height > width ? 'portrait' : 'landscape',
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      })
    }

    // Use ResizeObserver for better performance if available
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(updateState)
      resizeObserver.observe(document.documentElement)
      
      return () => {
        resizeObserver.disconnect()
      }
    } else {
      // Fallback to resize event listener
      window.addEventListener('resize', updateState, { passive: true })
      return () => window.removeEventListener('resize', updateState)
    }
  }, [])

  return state
}

/**
 * Get the current breakpoint based on width
 */
function getBreakpoint(width: number): Breakpoint | 'xs' {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * Hook for checking if current screen matches a specific breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive()
  return width >= BREAKPOINTS[breakpoint]
}

/**
 * Hook for getting responsive values based on current breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}): T | undefined {
  const { breakpoint } = useResponsive()
  
  // Return the value for the current breakpoint or the closest smaller one
  const breakpointOrder: (Breakpoint | 'xs')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return undefined
}

/**
 * Hook for touch-friendly interactions
 */
export function useTouchFriendly() {
  const { isTouch, isMobile } = useResponsive()
  
  return {
    isTouch,
    isMobile,
    // Recommended touch target size (44px minimum)
    touchTargetSize: isTouch ? 'h-11 min-h-[44px]' : 'h-9',
    // Touch-friendly spacing
    touchSpacing: isTouch ? 'gap-3' : 'gap-2',
    // Touch-friendly padding
    touchPadding: isTouch ? 'p-4' : 'p-3',
  }
}