import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  Channel,
  targetAccountAnalysisApi,
  ApiResponse 
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface ChannelsContextType {
  channels: Channel[]
  loading: boolean
  error: string | null
  pagination: {
    skip: number
    limit: number
    total: number
  }
  filters: {
    platform?: string
  }
  
  // Actions
  fetchChannels: () => Promise<void>
  setFilters: (filters: Partial<ChannelsContextType['filters']>) => void
  setPagination: (pagination: Partial<ChannelsContextType['pagination']>) => void
  resetFilters: () => void
}

const ChannelsContext = createContext<ChannelsContextType | undefined>(undefined)

export function useChannels() {
  const context = useContext(ChannelsContext)
  if (context === undefined) {
    throw new Error('useChannels must be used within a ChannelsProvider')
  }
  return context
}

interface ChannelsProviderProps {
  children: React.ReactNode
}

export function ChannelsProvider({ children }: ChannelsProviderProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0,
  })
  const [filters, setFiltersState] = useState<ChannelsContextType['filters']>({})

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await targetAccountAnalysisApi.getChannels(
        pagination.skip,
        pagination.limit,
        filters.platform
      )
      
      if (response.data.code === 0) {
        setChannels(response.data.data)
        setPaginationState(prev => ({
          ...prev,
          total: response.data.data.length
        }))
      } else {
        setError(response.data.msg || 'Failed to fetch channels')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.skip, pagination.limit, filters.platform])

  const setFilters = useCallback((newFilters: Partial<ChannelsContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, skip: 0 })) // Reset to first page when filters change
  }, [])

  const setPagination = useCallback((newPagination: Partial<ChannelsContextType['pagination']>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({})
    setPaginationState(prev => ({ ...prev, skip: 0 }))
  }, [])

  // Fetch data on mount and when pagination/filters change
  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const value: ChannelsContextType = {
    channels,
    loading,
    error,
    pagination,
    filters,
    fetchChannels,
    setFilters,
    setPagination,
    resetFilters,
  }

  return (
    <ChannelsContext.Provider value={value}>
      {children}
    </ChannelsContext.Provider>
  )
}