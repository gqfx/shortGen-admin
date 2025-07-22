import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
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
}

export function SceneAnalysisSlider({
  scenes,
  onSceneClick,
  onTimeNavigate,
  className,
  loading = false,
  selectedSceneId
}: SceneAnalysisSliderProps) {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])

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

  // Scroll to specific scene
  const scrollToScene = useCallback((index: number) => {
    const sceneElement = sceneRefs.current[index]
    const container = scrollContainerRef.current
    
    if (sceneElement && container) {
      const containerRect = container.getBoundingClientRect()
      const sceneRect = sceneElement.getBoundingClientRect()
      
      // Calculate scroll position to center the scene
      const scrollLeft = sceneElement.offsetLeft - (containerRect.width / 2) + (sceneRect.width / 2)
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
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
    }
  }, [scenes, focusedIndex, onSceneClick, onTimeNavigate, scrollToScene])

  // Handle scene click
  const handleSceneClick = useCallback((scene: SceneData, index: number) => {
    setFocusedIndex(index)
    onSceneClick?.(scene)
    onTimeNavigate?.(scene.startTime)
    
    // Add smooth scroll to center the clicked scene
    setTimeout(() => {
      scrollToScene(index)
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

  // Auto-scroll to selected scene
  useEffect(() => {
    if (selectedSceneId) {
      const sceneIndex = scenes.findIndex(scene => scene.sceneId === selectedSceneId)
      if (sceneIndex !== -1 && sceneIndex !== focusedIndex) {
        setFocusedIndex(sceneIndex)
        scrollToScene(sceneIndex)
      }
    }
  }, [selectedSceneId, scenes, focusedIndex, scrollToScene])

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
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={isScrolling}
                className="h-8 w-8 p-0 touch-manipulation"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={isScrolling}
                className="h-8 w-8 p-0 touch-manipulation"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scene slider container */}
          <div 
            className="relative"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listbox"
            aria-label="Scene analysis slider"
            aria-activedescendant={`scene-${focusedIndex}`}
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
                              alt={`Scene ${index + 1}: ${scene.description}`}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const placeholder = document.createElement('div')
                                  placeholder.className = 'w-full h-full flex items-center justify-center bg-muted'
                                  placeholder.innerHTML = '<svg class="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>'
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
                              <Badge variant="secondary" className="text-xs">
                                {index + 1}
                              </Badge>
                            </div>

                            {/* Confidence indicator */}
                            <div className="absolute top-2 right-2">
                              <Badge 
                                variant={scene.confidence > 0.8 ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {Math.round(scene.confidence * 100)}%
                              </Badge>
                            </div>

                            {/* Duration badge */}
                            <div className="absolute bottom-2 right-2">
                              <Badge variant="outline" className="text-xs bg-black/60 text-white border-white/20">
                                {getSceneDuration(scene.startTime, scene.endTime)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Scene information */}
                        <div className="space-y-2">
                          {/* Time range */}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="font-mono">
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

                          {/* Action button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
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
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Use arrow keys to navigate, Enter/Space to select, Home/End to jump to first/last scene
          </div>
        </div>
      </CardContent>
    </Card>
  )
}