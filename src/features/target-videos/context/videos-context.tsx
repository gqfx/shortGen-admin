import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  Video,
  targetAccountAnalysisApi,
  TriggerDownloadRequest,
  DownloadResponse,
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface VideosContextType {
  videos: Video[]
  loading: boolean
  error: string | null
  pagination: {
    skip: number
    limit: number
    total: number
  }
  filters: {
    accountId?: number
    channelId?: number
    videoType?: string
    isDownloaded?: boolean
  }
  
  // Actions
  fetchVideos: () => Promise<void>
  setFilters: (filters: Partial<VideosContextType['filters']>) => void
  setPagination: (pagination: Partial<VideosContextType['pagination']>) => void
  resetFilters: () => void
  triggerVideoDownload: (videoIds: string[], priority?: number) => Promise<DownloadResponse | undefined>
}

const VideosContext = createContext<VideosContextType | undefined>(undefined)

export function useVideos() {
  const context = useContext(VideosContext)
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideosProvider')
  }
  return context
}

interface VideosProviderProps {
  children: React.ReactNode
}

export function VideosProvider({ children }: VideosProviderProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0,
  })
  const [filters, setFiltersState] = useState<VideosContextType['filters']>({})

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await targetAccountAnalysisApi.getVideos(
        pagination.skip,
        pagination.limit,
        filters.accountId,
        filters.channelId,
        filters.videoType,
        filters.isDownloaded
      )
      
      if (response.data.code === 0) {
        setVideos(response.data.data)
        setPaginationState(prev => ({
          ...prev,
          total: response.data.data.length
        }))
      } else {
        setError(response.data.msg || 'Failed to fetch videos')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      // Don't show toast for initial data loading errors
    } finally {
      setLoading(false)
    }
  }, [pagination.skip, pagination.limit, filters.accountId, filters.channelId, filters.videoType, filters.isDownloaded])

  const setFilters = useCallback((newFilters: Partial<VideosContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, skip: 0 })) // Reset to first page when filters change
  }, [])

  const setPagination = useCallback((newPagination: Partial<VideosContextType['pagination']>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({})
    setPaginationState(prev => ({ ...prev, skip: 0 }))
  }, [])

  const triggerVideoDownload = useCallback(async (videoIds: string[], priority?: number): Promise<DownloadResponse | undefined> => {
    const toastId = toast.loading(`Triggering download for ${videoIds.length} video(s)...`)
    try {
      const request: TriggerDownloadRequest = { video_ids: videoIds, priority }
      const response = await targetAccountAnalysisApi.triggerVideoDownload(request)
      
      if (response.data.code === 0) {
        toast.success(response.data.msg || 'Download task created successfully.', { id: toastId })
        // Optionally, refresh the videos list to show updated status
        fetchVideos()
        return response.data.data
      } else {
        toast.error(response.data.msg || 'Failed to create download task.', { id: toastId })
        return undefined
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage, { id: toastId })
      return undefined
    }
  }, [fetchVideos])

  // Fetch data on mount and when pagination/filters change
  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const value: VideosContextType = {
    videos,
    loading,
    error,
    pagination,
    filters,
    fetchVideos,
    setFilters,
    setPagination,
    resetFilters,
    triggerVideoDownload,
  }

  return (
    <VideosContext.Provider value={value}>
      {children}
    </VideosContext.Provider>
  )
}