import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Asset, assetsApi, PaginatedResponse, ApiResponse } from '@/lib/api'

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
  deleteAsset: (id: string) => void
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

  const { data: queryResult, isLoading, refetch } = useQuery<ApiResponse<PaginatedResponse<Asset>>, Error>({
    queryKey: ['assets', pagination.page, pagination.size],
    queryFn: () => assetsApi.getAll(pagination.page, pagination.size),
  })

  useEffect(() => {
    if (queryResult?.data) {
      const { total, page, size, pages } = queryResult.data
      setPagination(prev => ({ ...prev, total, page, size, pages }))
      setAssets(queryResult.data.items)
    }
  }, [queryResult?.data])

  const refreshAssets = () => {
    refetch()
  }

  const deleteAsset = (id: string) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.id !== id))
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