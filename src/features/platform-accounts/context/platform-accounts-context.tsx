import { createContext, useContext, ReactNode, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  platformAccountsApi,
  PlatformAccount,
  PlatformAccountCreate,
  PlatformAccountUpdate,
  PlatformAccountUsageReset,
} from '@/lib/api'
import { toast } from 'sonner'

interface ApiErrorResponse {
  msg: string
}

interface PlatformAccountsContextType {
  platformAccounts: PlatformAccount[]
  isLoading: boolean
  error: any
  platforms: string[]
  selectedAccount: PlatformAccount | null
  setSelectedAccount: (account: PlatformAccount | null) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isDetailDialogOpen: boolean
  setIsDetailDialogOpen: (open: boolean) => void
  createAccount: (data: PlatformAccountCreate) => Promise<void>
  updateAccount: (id: string, data: PlatformAccountUpdate) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  resetUsage: (id: string, data: PlatformAccountUsageReset) => Promise<void>
  refreshAccounts: () => void
}

const PlatformAccountsContext = createContext<PlatformAccountsContextType | undefined>(undefined)

export const usePlatformAccounts = () => {
  const context = useContext(PlatformAccountsContext)
  if (context === undefined) {
    throw new Error('usePlatformAccounts must be used within a PlatformAccountsProvider')
  }
  return context
}

interface PlatformAccountsProviderProps {
  children: ReactNode
}

export default function PlatformAccountsProvider({ children }: PlatformAccountsProviderProps) {
  const [selectedAccount, setSelectedAccount] = useState<PlatformAccount | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // Fetch platform accounts
  const { data: accountsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['platformAccounts'],
    queryFn: () => platformAccountsApi.getAll(0, 100),
  })
  const platformAccounts = accountsResponse?.data || []

  // Fetch available platforms
  const { data: platformsResponse } = useQuery({
    queryKey: ['platformAccountPlatforms'],
    queryFn: () => platformAccountsApi.getPlatforms(),
  })
  const platforms = platformsResponse?.data || []

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: (data: PlatformAccountCreate) => platformAccountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Platform account created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(`Failed to create platform account: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlatformAccountUpdate }) =>
      platformAccountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Platform account updated successfully')
      setIsEditDialogOpen(false)
      setSelectedAccount(null)
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(`Failed to update platform account: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Platform account deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedAccount(null)
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(`Failed to delete platform account: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Reset usage mutation
  const resetUsageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlatformAccountUsageReset }) =>
      platformAccountsApi.resetUsage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Account usage reset successfully')
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(`Failed to reset usage: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshAccounts = () => {
    refetch()
  }

  const createAccount = async (data: PlatformAccountCreate) => {
    await createMutation.mutateAsync(data)
  }

  const updateAccount = async (id: string, data: PlatformAccountUpdate) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteAccount = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const resetUsage = async (id: string, data: PlatformAccountUsageReset) => {
    await resetUsageMutation.mutateAsync({ id, data })
  }

  return (
    <PlatformAccountsContext.Provider
      value={{
        platformAccounts,
        isLoading,
        error,
        platforms,
        selectedAccount,
        setSelectedAccount,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isDetailDialogOpen,
        setIsDetailDialogOpen,
        createAccount,
        updateAccount,
        deleteAccount,
        resetUsage,
        refreshAccounts,
      }}
    >
      {children}
    </PlatformAccountsContext.Provider>
  )
}