import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, Video, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccountDetail } from '../context/account-detail-context'
import type { VideoFilters } from '../context/account-detail-context'

/**
 * VideoFilters Component
 * 
 * Provides comprehensive filtering controls for video lists in account detail pages.
 * Features:
 * - Search functionality for video titles
 * - Status filtering (all, downloaded, not downloaded, analyzed)
 * - Date range filtering for published dates
 * - Clear filters functionality
 * - Expandable/collapsible interface
 * - Active filter indicators and individual filter removal
 * 
 * Requirements satisfied: 3.1, 3.2, 9.1
 */
export function VideoFilters() {
  const { currentFilters, filterVideos, loading } = useAccountDetail()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<VideoFilters>(currentFilters || {})

  // Status options with icons and labels
  const statusOptions = [
    { value: 'all', label: 'All Videos', icon: Video },
    { value: 'downloaded', label: 'Downloaded', icon: Download },
    { value: 'not_downloaded', label: 'Not Downloaded', icon: X },
    { value: 'analyzed', label: 'Analyzed', icon: Filter },
  ]

  // Sort options
  const sortOptions = [
    { value: 'views_desc', label: 'Most Views' },
    { value: 'date_desc', label: 'Newest First' },
  ]

  const updateFilter = (key: keyof VideoFilters, value: VideoFilters[keyof VideoFilters]) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    
    // Only apply filters if not loading
    if (!loading) {
      filterVideos(newFilters)
    }
  }

  const updateDateRange = (field: 'start' | 'end', value: string) => {
    const newDateRange = {
      start: '',
      end: '',
      ...localFilters.dateRange,
      [field]: value
    }
    updateFilter('dateRange', newDateRange as { start: string; end: string; })
  }

  const clearAllFilters = () => {
    const emptyFilters: VideoFilters = {
      dateRange: undefined,
      status: 'all',
      searchQuery: '',
      sortBy: 'views_desc'
    }
    setLocalFilters(emptyFilters)
    
    // Only apply filters if not loading
    if (!loading) {
      filterVideos(emptyFilters)
    }
  }

  const clearDateRange = () => {
    updateFilter('dateRange', undefined)
  }

  // Sync local filters with context filters when they change
  useEffect(() => {
    setLocalFilters(currentFilters || {})
  }, [currentFilters])

  const hasActiveFilters = 
    (localFilters.status && localFilters.status !== 'all') ||
    (localFilters.searchQuery && localFilters.searchQuery.trim()) ||
    (localFilters.dateRange && (localFilters.dateRange.start || localFilters.dateRange.end)) ||
    (localFilters.sortBy && localFilters.sortBy !== 'views_desc')

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.status && localFilters.status !== 'all') count++
    if (localFilters.searchQuery && localFilters.searchQuery.trim()) count++
    if (localFilters.dateRange && (localFilters.dateRange.start || localFilters.dateRange.end)) count++
    if (localFilters.sortBy && localFilters.sortBy !== 'views_desc') count++
    return count
  }

  return (
    <div className="mb-6">
      <div className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Video Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Always visible: Search and quick filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search video titles..."
              value={localFilters.searchQuery || ''}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
              disabled={loading}
              aria-label="Search video titles"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={localFilters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value as VideoFilters['status'])}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filter by video status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Filter */}
          <Select
            value={localFilters.sortBy || 'views_desc'}
            onValueChange={(value) => updateFilter('sortBy', value as VideoFilters['sortBy'])}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px]" aria-label="Sort by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expandable advanced filters */}
        {isExpanded && (
          <>
            <Separator />
            
            {/* Date Range Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Published Date Range
                </label>
                {localFilters.dateRange && (localFilters.dateRange.start || localFilters.dateRange.end) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="h-6 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <Input
                    type="date"
                    value={localFilters.dateRange?.start || ''}
                    onChange={(e) => updateDateRange('start', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <Input
                    type="date"
                    value={localFilters.dateRange?.end || ''}
                    onChange={(e) => updateDateRange('end', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div>
                <label className="text-sm font-medium mb-2 block">Active Filters</label>
                <div className="flex flex-wrap gap-2">
                  {localFilters.status && localFilters.status !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Status: {statusOptions.find(s => s.value === localFilters.status)?.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => updateFilter('status', 'all')}
                      />
                    </Badge>
                  )}
                  {localFilters.sortBy && localFilters.sortBy !== 'views_desc' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Sort: {sortOptions.find(s => s.value === localFilters.sortBy)?.label}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => updateFilter('sortBy', 'views_desc')}
                      />
                    </Badge>
                  )}
                  {localFilters.searchQuery && localFilters.searchQuery.trim() && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: "{localFilters.searchQuery}"
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => updateFilter('searchQuery', '')}
                      />
                    </Badge>
                  )}
                  {localFilters.dateRange && (localFilters.dateRange.start || localFilters.dateRange.end) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Date: {localFilters.dateRange.start || '...'} to {localFilters.dateRange.end || '...'}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={clearDateRange}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}