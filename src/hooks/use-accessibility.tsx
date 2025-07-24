import { useEffect, useRef, useCallback } from 'react'

interface UseAccessibilityOptions {
  announceChanges?: boolean
  manageFocus?: boolean
  trapFocus?: boolean
}

interface FocusTrapOptions {
  initialFocus?: HTMLElement | null
  returnFocus?: HTMLElement | null
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    announceChanges = true,
    manageFocus = true,
    trapFocus = false
  } = options

  const announcementRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Create live region for announcements
  useEffect(() => {
    if (!announceChanges) return

    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.id = 'accessibility-announcements'
    
    document.body.appendChild(liveRegion)
    announcementRef.current = liveRegion

    return () => {
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion)
      }
    }
  }, [announceChanges])

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !announcementRef.current) return

    announcementRef.current.setAttribute('aria-live', priority)
    announcementRef.current.textContent = message

    // Clear after announcement to allow repeated announcements
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = ''
      }
    }, 1000)
  }, [announceChanges])

  // Focus management utilities
  const focusElement = useCallback((element: HTMLElement | null, options?: { preventScroll?: boolean }) => {
    if (!manageFocus || !element) return

    element.focus({ preventScroll: options?.preventScroll })
  }, [manageFocus])

  const saveFocus = useCallback(() => {
    if (!manageFocus) return
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [manageFocus])

  const restoreFocus = useCallback(() => {
    if (!manageFocus || !previousFocusRef.current) return
    previousFocusRef.current.focus()
    previousFocusRef.current = null
  }, [manageFocus])

  // Focus trap implementation
  const trapFocusInElement = useCallback((element: HTMLElement, options: FocusTrapOptions = {}) => {
    if (!trapFocus) return () => {}

    const { initialFocus, returnFocus } = options
    
    // Save current focus
    const previousFocus = returnFocus || (document.activeElement as HTMLElement)
    
    // Get all focusable elements
    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ')
      
      return Array.from(element.querySelectorAll(focusableSelectors)) as HTMLElement[]
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    // Set initial focus
    if (initialFocus) {
      initialFocus.focus()
    } else {
      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }

    element.addEventListener('keydown', handleKeyDown)

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeyDown)
      if (previousFocus && previousFocus.focus) {
        previousFocus.focus()
      }
    }
  }, [trapFocus])

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, label: string) => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = label
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all duration-200'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })

    return skipLink
  }, [])

  // Keyboard navigation helper
  const handleArrowNavigation = useCallback((
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void,
    options: {
      wrap?: boolean
      orientation?: 'horizontal' | 'vertical' | 'both'
      onActivate?: (index: number) => void
    } = {}
  ) => {
    const { wrap = true, orientation = 'both', onActivate } = options

    if (items.length === 0) return

    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0)
        }
        break
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1)
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0)
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault()
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1)
        }
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        onActivate?.(currentIndex)
        return
    }

    if (newIndex !== currentIndex) {
      onIndexChange(newIndex)
      items[newIndex]?.focus()
    }
  }, [])

  // ARIA live region utilities
  const announceStatus = useCallback((status: string) => {
    announce(`Status: ${status}`, 'polite')
  }, [announce])

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])

  const announceLoading = useCallback((message: string = 'Loading') => {
    announce(message, 'polite')
  }, [announce])

  return {
    announce,
    announceStatus,
    announceError,
    announceSuccess,
    announceLoading,
    focusElement,
    saveFocus,
    restoreFocus,
    trapFocusInElement,
    createSkipLink,
    handleArrowNavigation
  }
}

// Hook for managing reduced motion preferences
export function useReducedMotion() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return {
    prefersReducedMotion,
    getTransitionDuration: (normalDuration: number) => prefersReducedMotion ? 0 : normalDuration,
    getAnimationClass: (normalClass: string, reducedClass: string = '') => 
      prefersReducedMotion ? reducedClass : normalClass
  }
}

// Hook for managing high contrast preferences
export function useHighContrast() {
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

  return {
    prefersHighContrast,
    getContrastClass: (normalClass: string, highContrastClass: string) =>
      prefersHighContrast ? highContrastClass : normalClass
  }
}

// Hook for managing color scheme preferences
export function useColorScheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return {
    prefersDark,
    prefersLight: !prefersDark
  }
}