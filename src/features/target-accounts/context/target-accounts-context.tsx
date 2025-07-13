import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  TargetAccount, 
  CreateTargetAccountRequest, 
  UpdateTargetAccountRequest,
  targetAccountAnalysisApi,
  ApiResponse 
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface TargetAccountsContextType {
  targetAccounts: TargetAccount[]
  loading: boolean
  error: string | null
  pagination: {
    skip: number
    limit: number
    total: number
  }
  filters: {
    platform?: string
    isActive?: boolean
    category?: string
  }
  
  // Actions
  fetchTargetAccounts: () => Promise<void>
  createTargetAccount: (data: CreateTargetAccountRequest) => Promise<TargetAccount | null>
  updateTargetAccount: (id: number, data: UpdateTargetAccountRequest) => Promise<TargetAccount | null>
  deleteTargetAccount: (id: number) => Promise<boolean>
  setFilters: (filters: Partial<TargetAccountsContextType['filters']>) => void
  setPagination: (pagination: Partial<TargetAccountsContextType['pagination']>) => void
  resetFilters: () => void
}

const TargetAccountsContext = createContext<TargetAccountsContextType | undefined>(undefined)

export function useTargetAccounts() {
  const context = useContext(TargetAccountsContext)
  if (context === undefined) {
    throw new Error('useTargetAccounts must be used within a TargetAccountsProvider')
  }
  return context
}

interface TargetAccountsProviderProps {
  children: React.ReactNode
}

export function TargetAccountsProvider({ children }: TargetAccountsProviderProps) {
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPaginationState] = useState({
    skip: 0,
    limit: 50,
    total: 0,
  })
  const [filters, setFiltersState] = useState<TargetAccountsContextType['filters']>({})

  const fetchTargetAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await targetAccountAnalysisApi.getAccounts(
        pagination.skip,
        pagination.limit,
        filters.platform,
        filters.isActive,
        filters.category
      )
      
      if (response.data.code === 0) {
        setTargetAccounts(response.data.data)
        setPaginationState(prev => ({
          ...prev,
          total: response.data.data.length
        }))
      } else {
        setError(response.data.msg || 'Failed to fetch target accounts')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      // Don't show toast for initial data loading errors
      console.error('Failed to fetch target accounts:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pagination.skip, pagination.limit, filters.platform, filters.isActive, filters.category])

  const createTargetAccount = useCallback(async (data: CreateTargetAccountRequest): Promise<TargetAccount | null> => {
    try {
      const response = await targetAccountAnalysisApi.createAccount(data)
      
      if (response.data.code === 0) {
        toast.success('Target account created successfully')
        await fetchTargetAccounts()
        return response.data.data
      } else {
        toast.error(response.data.msg || 'Failed to create target account')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [fetchTargetAccounts])

  const updateTargetAccount = useCallback(async (id: number, data: UpdateTargetAccountRequest): Promise<TargetAccount | null> => {
    try {
      const response = await targetAccountAnalysisApi.updateAccount(id, data)
      
      if (response.data.code === 0) {
        toast.success('Target account updated successfully')
        await fetchTargetAccounts()
        return response.data.data
      } else {
        toast.error(response.data.msg || 'Failed to update target account')
        return null
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return null
    }
  }, [fetchTargetAccounts])

  const deleteTargetAccount = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await targetAccountAnalysisApi.deleteAccount(id)
      
      if (response.data.code === 0) {
        toast.success('Target account deleted successfully')
        await fetchTargetAccounts()
        return true
      } else {
        toast.error(response.data.msg || 'Failed to delete target account')
        return false
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      toast.error(errorMessage)
      return false
    }
  }, [fetchTargetAccounts])

  const setFilters = useCallback((newFilters: Partial<TargetAccountsContextType['filters']>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, skip: 0 })) // Reset to first page when filters change
  }, [])

  const setPagination = useCallback((newPagination: Partial<TargetAccountsContextType['pagination']>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState({})
    setPaginationState(prev => ({ ...prev, skip: 0 }))
  }, [])

  // Fetch data on mount and when pagination/filters change
  useEffect(() => {
    fetchTargetAccounts()
  }, [fetchTargetAccounts])

  const value: TargetAccountsContextType = {
    targetAccounts,
    loading,
    error,
    pagination,
    filters,
    fetchTargetAccounts,
    createTargetAccount,
    updateTargetAccount,
    deleteTargetAccount,
    setFilters,
    setPagination,
    resetFilters,
  }

  return (
    <TargetAccountsContext.Provider value={value}>
      {children}
    </TargetAccountsContext.Provider>
  )
}