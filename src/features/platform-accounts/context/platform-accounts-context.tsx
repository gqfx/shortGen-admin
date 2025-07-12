import { createContext, useContext, ReactNode, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { platformAccountsApi, PlatformAccount } from '@/lib/api'
import { toast } from 'sonner'

interface PlatformAccountsContextType {
  platformAccounts: PlatformAccount[]
  isLoading: boolean
  error: any
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
  createAccount: (data: any) => Promise<void>
  updateAccount: (id: number, data: any) => Promise<void>
  deleteAccount: (id: number) => Promise<void>
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
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['platformAccounts'],
    queryFn: async () => {
      console.log('🔄 Fetching platform accounts from API...')
      try {
        const response = await platformAccountsApi.getAll(0, 100)
        console.log('✅ Platform Accounts API Response:', response.data)
        return response
      } catch (err) {
        console.error('❌ Platform Accounts API Error:', err)
        throw err
      }
    },
  })

  const platformAccounts = apiResponse?.data?.data || []
  console.log('📊 Processed platform accounts:', platformAccounts)

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => platformAccountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Platform account created successfully')
      setIsCreateDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(`Failed to create platform account: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => platformAccountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Platform account updated successfully')
      setIsEditDialogOpen(false)
      setSelectedAccount(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to update platform account: ${error.response?.data?.msg || error.message}`)
    },
  })

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => platformAccountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformAccounts'] })
      toast.success('Platform account deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedAccount(null)
    },
    onError: (error: any) => {
      toast.error(`Failed to delete platform account: ${error.response?.data?.msg || error.message}`)
    },
  })

  const refreshAccounts = () => {
    refetch()
  }

  const createAccount = async (data: any) => {
    await createMutation.mutateAsync(data)
  }

  const updateAccount = async (id: number, data: any) => {
    await updateMutation.mutateAsync({ id, data })
  }

  const deleteAccount = async (id: number) => {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <PlatformAccountsContext.Provider
      value={{
        platformAccounts,
        isLoading,
        error,
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
        refreshAccounts,
      }}
    >
      {children}
    </PlatformAccountsContext.Provider>
  )
}