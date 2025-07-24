import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { useAccessibility } from '@/hooks/use-accessibility'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Clock,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SceneData {
  sceneId: string
  startTime: number
  endTime: number
  thumbnailUrl: string
  description: string
  confidence: number
}

interface SceneAnalysisSliderProps {
  scenes: SceneData[]
  onSceneClick?: (scene: SceneData) => void
  onTimeNavigate?: (timeInSeconds: number) => void
  className?: string
  loading?: boolean
  selectedSceneId?: string
  currentTime?: number
  autoSyncWithPlayback?: boolean
}

export function SceneAnalysisSlider({
  scenes,
  onSceneClick,
  onTimeNavigate,
  className,
  loading = false,
  selectedSceneId,
  currentTime = 0,
  autoSyncWithPlayback = true
}: SceneAnalysisSliderProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<number>(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { announceStatus } = useAccessibility()

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Format time range display
  const formatTimeRange = useCallback((startTime: number, endTime: number): string => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }, [formatTime])

  // Calculate scene duration
  const getSceneDuration = useCallback((startTime: number, endTime: number): string => {
    const duration = endTime - startTime
    return `${Math.round(duration)}s`
  }, [])

  // Enhanced scroll to specific scene with smooth transitions
  const scrollToScene = useCallback((index: number) => {
    const sceneElement = sceneRefs.current[index]
    const container = scrollContainerRef.current
    
    if (sceneElement && container) {
      const containerRect = container.getBoundingClientRect()
      const sceneRect = sceneElement.getBoundingClientRect()
      
      // Calculate scroll position to center the scene with padding
      const scrollLeft = sceneElement.offsetLeft - (containerRect.width / 2) + (sceneRect.width / 2)
      
      // Enhanced smooth scrolling with custom easing
      const startScrollLeft = container.scrollLeft
      const distance = scrollLeft - startScrollLeft
      const duration = 600 // 600ms for smooth animation
      const startTime = performance.now()
      
      // Custom easing function for smoother animation
      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
      }
      
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easeInOutCubic(progress)
        
        container.scrollLeft = startScrollLeft + (distance * easedProgress)
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll)
        } else {
          // Add subtle bounce effect at the end
          const bounceDistance = 10
          container.scrollLeft = scrollLeft + bounceDistance
          
          setTimeout(() => {
            container.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            })
          }, 100)
        }
      }
      
      requestAnimationFrame(animateScroll)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (scenes.length === 0) return

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        setFocusedIndex(prev => {
          const newIndex = Math.max(0, prev - 1)
          scrollToScene(newIndex)
          return newIndex
        })
        break
      case 'ArrowRight':
        event.preventDefault()
        setFocusedIndex(prev => {
          const newIndex = Math.min(scenes.length - 1, prev + 1)
          scrollToScene(newIndex)
          return newIndex
        })
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        const focusedScene = scenes[focusedIndex]
        if (focusedScene) {
          announceStatus(`Navigating to scene ${focusedIndex + 1}: ${focusedScene.description}`)
          onSceneClick?.(focusedScene)
          onTimeNavigate?.(focusedScene.startTime)
        }
        break
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        scrollToScene(0)
        break
      case 'End':
        event.preventDefault()
        const lastIndex = scenes.length - 1
        setFocusedIndex(lastIndex)
        scrollToScene(lastIndex)
        break
      case 'Escape':
        event.preventDefault()
        // Remove focus from the slider
        if (event.currentTarget) {
          (event.currentTarget as HTMLElement).blur()
        }
        break
    }
  }, [scenes, focusedIndex, onSceneClick, onTimeNavigate, scrollToScene])

  // Enhanced scene click handler with improved navigation and feedback
  const handleSceneClick = useCallback((scene: SceneData, index: number) => {
    setFocusedIndex(index)
    setLastSyncTime(Date.now()) // Update sync time to prevent auto-sync interference
    
    announceStatus(`Selected scene ${index + 1}: ${scene.description}`)
    onSceneClick?.(scene)
    onTimeNavigate?.(scene.startTime)
    
    // Enhanced smooth scroll with improved timing and animations
    setTimeout(() => {
      scrollToScene(index)
      
      // Enhanced visual feedback with multiple animation layers
      const sceneElement = sceneRefs.current[index]
      if (sceneElement) {
        // Main scale and glow animation
        sceneElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        sceneElement.style.transform = 'scale(1.06)'
        sceneElement.style.boxShadow = '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)'
        sceneElement.style.zIndex = '15'
        sceneElement.style.filter = 'brightness(1.1) contrast(1.05)'
        
        // Add enhanced ripple effect with multiple waves
        const ripple1 = document.createElement('div')
        ripple1.className = 'absolute inset-0 rounded-lg pointer-events-none'
        ripple1.style.background = 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 60%)'
        ripple1.style.animation = 'pulse 1s ease-out'
        sceneElement.appendChild(ripple1)
        
        const ripple2 = document.createElement('div')
        ripple2.className = 'absolute inset-0 rounded-lg pointer-events-none'
        ripple2.style.background = 'radial-gradient(circle at center, rgba(147, 197, 253, 0.2) 0%, transparent 80%)'
        ripple2.style.animation = 'pulse 1.4s ease-out 0.2s'
        sceneElement.appendChild(ripple2)
        
        // Add enhanced navigation indicator with time display
        const navIndicator = document.createElement('div')
        navIndicator.className = 'absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-full text-xs font-medium animate-in fade-in-0 slide-in-from-top-2 duration-500 backdrop-blur-sm border border-blue-400/30'
        navIndicator.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex flex-col">
              <span class="font-semibold">Jumping to Scene</span>
              <span class="opacity-90">${Math.floor(scene.startTime / 60)}:${(scene.startTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        `
        sceneElement.appendChild(navIndicator)
        
        // Add corner accent animations for enhanced visual feedback
        const corners = ['top-right', 'bottom-left', 'bottom-right']
        const cornerElements: HTMLElement[] = []
        
        corners.forEach((corner, cornerIndex) => {
          const cornerElement = document.createElement('div')
          cornerElement.className = `absolute w-4 h-4 border-2 border-blue-400 z-20`
          
          switch (corner) {
            case 'top-right':
              cornerElement.style.top = '8px'
              cornerElement.style.right = '8px'
              cornerElement.style.borderLeft = 'none'
              cornerElement.style.borderBottom = 'none'
              break
            case 'bottom-left':
              cornerElement.style.bottom = '8px'
              cornerElement.style.left = '8px'
              cornerElement.style.borderRight = 'none'
              cornerElement.style.borderTop = 'none'
              break
            case 'bottom-right':
              cornerElement.style.bottom = '8px'
              cornerElement.style.right = '8px'
              cornerElement.style.borderLeft = 'none'
              cornerElement.style.borderTop = 'none'
              break
          }
          
          cornerElement.style.animation = `corner-highlight 1.5s ease-in-out ${cornerIndex * 0.15}s`
          sceneElement.appendChild(cornerElement)
          cornerElements.push(cornerElement)
        })
        
        // Add progress indicator
        const progressBar = document.createElement('div')
        progressBar.className = 'absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full overflow-hidden z-20'
        progressBar.innerHTML = '<div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style="width: 100%; animation: progress-fill 1s ease-out;"></div>'
        sceneElement.appendChild(progressBar)
        
        // Enhanced cleanup with staggered timing
        setTimeout(() => {
          sceneElement.style.transform = 'scale(1)'
          sceneElement.style.boxShadow = ''
          sceneElement.style.zIndex = ''
          sceneElement.style.filter = ''
          
          // Remove elements with improved staggered timing
          setTimeout(() => {
            navIndicator?.remove()
            setTimeout(() => {
              ripple1?.remove()
              setTimeout(() => {
                ripple2?.remove()
                progressBar?.remove()
                cornerElements.forEach((el, elIndex) => {
                  setTimeout(() => el?.remove(), elIndex * 50)
                })
                setTimeout(() => {
                  sceneElement.style.transition = ''
                }, 200)
              }, 150)
            }, 150)
          }, 300)
        }, 500)
      }
    }, 100)
  }, [onSceneClick, onTimeNavigate, scrollToScene])

  // Navigation buttons
  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }, [])

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }, [])

  // Auto-scroll to selected scene with enhanced synchronization
  useEffect(() => {
    if (selectedSceneId) {
      const sceneIndex = scenes.findIndex(scene => scene.sceneId === selectedSceneId)
      if (sceneIndex !== -1 && sceneIndex !== focusedIndex) {
        setFocusedIndex(sceneIndex)
        
        // Enhanced smooth scrolling with timing
        setTimeout(() => {
          scrollToScene(sceneIndex)
        }, 100)
      }
    }
  }, [selectedSceneId, scenes, focusedIndex, scrollToScene])

  // Enhanced synchronization with video playback position
  useEffect(() => {
    if (autoSyncWithPlayback && currentTime !== undefined && scenes.length > 0) {
      // Debounce the sync to avoid excessive updates
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(() => {
        // Only sync if we haven't manually synced recently
        const timeSinceLastSync = Date.now() - lastSyncTime
        if (timeSinceLastSync > 2000) { // 2 second cooldown
          const newCurrentSceneIndex = scenes.findIndex(scene => 
            currentTime >= scene.startTime && currentTime <= scene.endTime
          )
          
          if (newCurrentSceneIndex !== -1 && newCurrentSceneIndex !== currentSceneIndex) {
            setCurrentSceneIndex(newCurrentSceneIndex)
            setFocusedIndex(newCurrentSceneIndex)
            
            // Enhanced smooth scroll to current scene with better animation
            setTimeout(() => {
              scrollToScene(newCurrentSceneIndex)
              
              // Add enhanced visual feedback for auto-sync with sync indicator
              const sceneElement = sceneRefs.current[newCurrentSceneIndex]
              if (sceneElement) {
                // Main sync animation
                sceneElement.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                sceneElement.style.transform = 'scale(1.02)'
                sceneElement.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)'
                sceneElement.style.zIndex = '5'
                
                // Add sync indicator
                const syncIndicator = document.createElement('div')
                syncIndicator.className = 'absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full z-20 animate-in fade-in-0 zoom-in-95 duration-300'
                syncIndicator.innerHTML = `
                  <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                `
                sceneElement.appendChild(syncIndicator)
                
                // Add subtle pulse effect
                const pulseOverlay = document.createElement('div')
                pulseOverlay.className = 'absolute inset-0 rounded-lg pointer-events-none'
                pulseOverlay.style.background = 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                pulseOverlay.style.animation = 'scene-sync-indicator 1s ease-out'
                sceneElement.appendChild(pulseOverlay)
                
                setTimeout(() => {
                  sceneElement.style.transform = 'scale(1)'
                  sceneElement.style.boxShadow = ''
                  sceneElement.style.zIndex = ''
                  
                  // Remove indicators
                  setTimeout(() => {
                    syncIndicator?.remove()
                    pulseOverlay?.remove()
                    sceneElement.style.transition = ''
                  }, 400)
                }, 400)
              }
            }, 150)
          }
        }
      }, 300) // Reduced debounce for more responsive sync
    }
  }, [currentTime, scenes, autoSyncWithPlayback, lastSyncTime, scrollToScene, currentSceneIndex])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  // Handle scroll events for touch feedback and enhanced mobile support
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout
    let touchStartX: number | null = null
    let touchStartY: number | null = null

    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    // Enhanced touch support for better mobile experience
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !touchStartY) return

      const touchEndX = e.touches[0].clientX
      const touchEndY = e.touches[0].clientY
      const deltaX = Math.abs(touchEndX - touchStartX)
      const deltaY = Math.abs(touchEndY - touchStartY)

      // If horizontal swipe is more significant than vertical, prevent default scrolling
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      touchStartX = null
      touchStartY = null
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 space-y-2">
                  <Skeleton className="h-24 w-40 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (scenes.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Scenes Available</h3>
            <p className="text-sm text-muted-foreground">
              Scene analysis data is not available for this video.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with navigation controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Scene Analysis</h3>
              <Badge variant="secondary" className="ml-2">
                {scenes.length} scenes
              </Badge>
            </div>
            
            <div className="flex items-center gap-2" role="group" aria-label="Scene navigation controls">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={isScrolling}
                className="h-8 w-8 p-0 touch-manipulation"
                aria-label="Scroll scenes left"
                title="Scroll scenes left"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={isScrolling}
                className="h-8 w-8 p-0 touch-manipulation"
                aria-label="Scroll scenes right"
                title="Scroll scenes right"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Scene slider container */}
          <div 
            className="relative"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listbox"
            aria-label={`Scene analysis slider with ${scenes.length} scenes`}
            aria-activedescendant={`scene-${focusedIndex}`}
            aria-describedby="scene-navigation-help"
          >
            <ScrollArea orientation="horizontal" className="w-full">
              <div
                ref={scrollContainerRef}
                className="flex gap-3 sm:gap-4 pb-4 min-w-full"
                style={{ 
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth'
                }}
              >
                {scenes.map((scene, index) => {
                  const isSelected = selectedSceneId === scene.sceneId
                  const isFocused = focusedIndex === index
                  
                  return (
                    <div
                      key={scene.sceneId}
                      ref={el => { sceneRefs.current[index] = el }}
                      id={`scene-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex-shrink-0 cursor-pointer transition-all duration-200 group",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg",
                        isSelected && "ring-2 ring-blue-500 ring-offset-2",
                        isFocused && "ring-2 ring-blue-400 ring-offset-1"
                      )}
                      style={{ scrollSnapAlign: 'start' }}
                      onClick={() => handleSceneClick(scene, index)}
                      onFocus={() => setFocusedIndex(index)}
                      tabIndex={isFocused ? 0 : -1}
                    >
                      <div className="w-48 sm:w-52 md:w-56 space-y-3">
                        {/* Scene thumbnail */}
                        <div className="relative">
                          <div className={cn(
                            "relative aspect-video bg-muted rounded-lg overflow-hidden",
                            "border-2 transition-colors duration-200",
                            isSelected ? "border-blue-500" : "border-transparent",
                            "group-hover:border-blue-300"
                          )}>
                            <img
                              src={scene.thumbnailUrl}
                              alt={`Scene ${index + 1} thumbnail: ${scene.description}`}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const placeholder = document.createElement('div')
                                  placeholder.className = 'w-full h-full flex items-center justify-center bg-muted'
                                  placeholder.setAttribute('role', 'img')
                                  placeholder.setAttribute('aria-label', 'Scene thumbnail failed to load')
                                  placeholder.innerHTML = '<svg class="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>'
                                  parent.appendChild(placeholder)
                                }
                              }}
                            />
                            
                            {/* Play overlay */}
                            <div className={cn(
                              "absolute inset-0 bg-black/40 flex items-center justify-center",
                              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            )}>
                              <div className="bg-white/90 rounded-full p-2">
                                <Play className="w-4 h-4 text-gray-800 fill-current" />
                              </div>
                            </div>

                            {/* Scene number badge */}
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-xs" aria-label={`Scene number ${index + 1}`}>
                                {index + 1}
                              </Badge>
                            </div>

                            {/* Confidence indicator */}
                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant={scene.confidence > 0.8 ? "default" : "secondary"}
                                className="text-xs"
                                aria-label={`Analysis confidence: ${Math.round(scene.confidence * 100)} percent`}
                              >
                                {Math.round(scene.confidence * 100)}%
                              </Badge>
                            </div>

                            {/* Duration badge */}
                            <div className="absolute bottom-2 right-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-black/60 text-white border-white/20"
                                aria-label={`Scene duration: ${getSceneDuration(scene.startTime, scene.endTime)}`}
                              >
                                {getSceneDuration(scene.startTime, scene.endTime)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Scene information */}
                        <div className="space-y-2">
                          {/* Time range */}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span 
                              className="font-mono"
                              aria-label={`Scene time range from ${formatTime(scene.startTime)} to ${formatTime(scene.endTime)}`}
                            >
                              {formatTimeRange(scene.startTime, scene.endTime)}
                            </span>
                          </div>

                          {/* Description */}
                          <p className={cn(
                            "text-sm leading-relaxed line-clamp-3",
                            "group-hover:text-blue-700 transition-colors duration-200"
                          )}>
                            {scene.description}
                          </p>

                          {/* Enhanced action button with better feedback */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 h-8 text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              
                              // Enhanced visual feedback for direct navigation
                              const button = e.currentTarget
                              button.style.transform = 'scale(0.95)'
                              button.style.transition = 'transform 0.1s ease-out'
                              
                              setTimeout(() => {
                                button.style.transform = 'scale(1)'
                                setTimeout(() => {
                                  button.style.transition = ''
                                }, 100)
                              }, 100)
                              
                              onTimeNavigate?.(scene.startTime)
                            }}
                          >
                            <Maximize2 className="w-3 h-3" />
                            Jump to Scene
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Keyboard navigation hint */}
          <div 
            className="text-xs text-muted-foreground text-center pt-2 border-t"
            role="note"
            aria-label="Keyboard navigation instructions"
            id="scene-navigation-help"
          >
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">←→</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> Select</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Home/End</kbd> First/Last</span>
              <span><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> Exit</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}