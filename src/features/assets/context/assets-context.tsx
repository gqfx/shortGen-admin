import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Asset, assetsApi, PaginatedResponse } from '@/lib/api'
import { toast } from 'sonner'

interface PaginationState {
  page: number
  size: number
  total: number
  pages: number
}

interface AssetsContextType {
  assets: Asset[]
  isLoading: boolean
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  selectedAsset: Asset | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setSelectedAsset: (asset: Asset | null) => void
  refreshAssets: () => void
  deleteAsset: (id: string) => Promise<void>
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined)

export const useAssets = () => {
  const context = useContext(AssetsContext)
  if (!context) {
    throw new Error('useAssets must be used within an AssetsProvider')
  }
  return context
}

interface AssetsProviderProps {
  children: ReactNode
}

export default function AssetsProvider({ children }: AssetsProviderProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    size: 10,
    total: 0,
    pages: 1,
  })

  const { data: queryResult, isLoading, refetch } = useQuery<PaginatedResponse<Asset>, Error>({
    queryKey: ['assets', pagination.page, pagination.size],
    queryFn: () => assetsApi.getAll(pagination.page, pagination.size).then(res => res.data),
  })

  useEffect(() => {
    if (queryResult) {
      const { total, page, size, pages } = queryResult
      setPagination(prev => ({ ...prev, total, page, size, pages }))
      setAssets(queryResult.items)
    }
  }, [queryResult])

  const refreshAssets = () => {
    refetch()
  }

  const deleteAsset = async (id: string) => {
    try {
      const response = await assetsApi.delete(id)
      
      if (response.data?.message) {
        toast.success("资源已删除", {
          description: response.data.message,
        })
      }
      
      // Remove from local state
      setAssets(prevAssets => prevAssets.filter(asset => asset.id !== id))
      
      // Close delete dialog if open
      setIsDeleteDialogOpen(false)
      
      // Clear selected asset
      setSelectedAsset(null)
      
      // Refresh the assets list to ensure consistency
      refreshAssets()
    } catch (error) {
      console.error('Failed to delete asset:', error)
      toast.error("删除失败", {
        description: "无法删除该资源，请稍后重试",
      })
    }
  }

  return (
    <AssetsContext.Provider
      value={{
        assets,
        isLoading,
        pagination,
        setPagination,
        selectedAsset,
        isCreateDialogOpen,
        isEditDialogOpen,
        isDeleteDialogOpen,
        setIsCreateDialogOpen,
        setIsEditDialogOpen,
        setIsDeleteDialogOpen,
        setSelectedAsset,
        refreshAssets,
        deleteAsset,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}