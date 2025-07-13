import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  TargetAccount,
  TargetAccountStatistics,
  VideoEngagementMetrics,
  Video,
  targetAccountAnalysisApi,
  ApiResponse 
} from '@/lib/api'
import { handleServerError } from '@/utils/handle-server-error'
import { toast } from 'sonner'

interface StatisticsContextType {
  targetAccounts: TargetAccount[]
  selectedAccountId: number | null
  accountStatistics: TargetAccountStatistics[]
  growthTrends: {
    followers_trend: number
    videos_trend: number
    avg_daily_growth: number
    total_growth_rate: number
    analysis_period_days: number
    data_points: number
  } | null
  trendingVideos: Video[]
  analyticsSummary: {
    account: TargetAccount
    latest_stats: TargetAccountStatistics
    recent_videos: Video[]
    growth_trends: any
    engagement_analysis: any
  } | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchTargetAccounts: () => Promise<void>
  setSelectedAccount: (accountId: number | null) => void
  fetchAccountStatistics: (accountId: number, days?: number) => Promise<void>
  fetchGrowthTrends: (accountId: number, days?: number) => Promise<void>
  fetchTrendingVideos: (accountId?: number, metric?: string, days?: number) => Promise<void>
  fetchAnalyticsSummary: (accountId: number) => Promise<void>
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined)

export function useStatistics() {
  const context = useContext(StatisticsContext)
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider')
  }
  return context
}

interface StatisticsProviderProps {
  children: React.ReactNode
}

export function StatisticsProvider({ children }: StatisticsProviderProps) {
  const [targetAccounts, setTargetAccounts] = useState<TargetAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [accountStatistics, setAccountStatistics] = useState<TargetAccountStatistics[]>([])
  const [growthTrends, setGrowthTrends] = useState<StatisticsContextType['growthTrends']>(null)
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([])
  const [analyticsSummary, setAnalyticsSummary] = useState<StatisticsContextType['analyticsSummary']>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTargetAccounts = useCallback(async () => {
    try {
      setError(null)
      
      const response = await targetAccountAnalysisApi.getAccounts(0, 100, undefined, true)
      
      if (response.data.code === 0) {
        setTargetAccounts(response.data.data)
        // Auto-select first account if none selected
        if (!selectedAccountId && response.data.data.length > 0) {
          setSelectedAccountId(response.data.data[0].id)
        }
      } else {
        setError(response.data.msg || 'Failed to fetch target accounts')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [selectedAccountId])

  const setSelectedAccount = useCallback((accountId: number | null) => {
    setSelectedAccountId(accountId)
    // Clear previous data when switching accounts
    setAccountStatistics([])
    setGrowthTrends(null)
    setTrendingVideos([])
    setAnalyticsSummary(null)
  }, [])

  const fetchAccountStatistics = useCallback(async (accountId: number, days = 30) => {
    try {
      setError(null)
      
      const response = await targetAccountAnalysisApi.getAccountStatistics(accountId, days)
      
      if (response.data.code === 0) {
        setAccountStatistics(response.data.data)
      } else {
        setError(response.data.msg || 'Failed to fetch account statistics')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [])

  const fetchGrowthTrends = useCallback(async (accountId: number, days = 7) => {
    try {
      setError(null)
      
      const response = await targetAccountAnalysisApi.getGrowthTrends(accountId, days)
      
      if (response.data.code === 0) {
        setGrowthTrends(response.data.data)
      } else {
        setError(response.data.msg || 'Failed to fetch growth trends')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [])

  const fetchTrendingVideos = useCallback(async (accountId?: number, metric = 'views_count', days = 7) => {
    try {
      setError(null)
      
      const response = await targetAccountAnalysisApi.getTrendingVideos(accountId, metric, days, 10)
      
      if (response.data.code === 0) {
        setTrendingVideos(response.data.data)
      } else {
        setError(response.data.msg || 'Failed to fetch trending videos')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [])

  const fetchAnalyticsSummary = useCallback(async (accountId: number) => {
    try {
      setError(null)
      
      const response = await targetAccountAnalysisApi.getAnalyticsSummary(accountId)
      
      if (response.data.code === 0) {
        setAnalyticsSummary(response.data.data)
      } else {
        setError(response.data.msg || 'Failed to fetch analytics summary')
      }
    } catch (error) {
      const errorMessage = handleServerError(error)
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      await fetchTargetAccounts()
      setLoading(false)
    }
    
    fetchInitialData()
  }, [fetchTargetAccounts])

  // Fetch detailed data when account is selected
  useEffect(() => {
    if (selectedAccountId) {
      const fetchAccountData = async () => {
        await Promise.all([
          fetchAccountStatistics(selectedAccountId),
          fetchGrowthTrends(selectedAccountId),
          fetchTrendingVideos(selectedAccountId),
          fetchAnalyticsSummary(selectedAccountId)
        ])
      }
      
      fetchAccountData()
    }
  }, [selectedAccountId, fetchAccountStatistics, fetchGrowthTrends, fetchTrendingVideos, fetchAnalyticsSummary])

  const value: StatisticsContextType = {
    targetAccounts,
    selectedAccountId,
    accountStatistics,
    growthTrends,
    trendingVideos,
    analyticsSummary,
    loading,
    error,
    fetchTargetAccounts,
    setSelectedAccount,
    fetchAccountStatistics,
    fetchGrowthTrends,
    fetchTrendingVideos,
    fetchAnalyticsSummary,
  }

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  )
}