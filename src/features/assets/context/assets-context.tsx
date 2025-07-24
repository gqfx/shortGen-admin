import { createContext, useContext, ReactNode, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Asset, assetsApi } from '@/lib/api'

interface AssetsApiResponse {
  code: number;
  msg: string;
  data: Asset[];
}

interface AssetsContextType {
  assets: Asset[]
  isLoading: boolean
  selectedAsset: Asset | null
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isDeleteDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setIsDeleteDialogOpen: (open: boolean) => void
  setSelectedAsset: (asset: Asset | null) => void
  refreshAssets: () => void
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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch assets
  const { data: assets, isLoading, refetch } = useQuery<AssetsApiResponse, Error, Asset[]>({
    queryKey: ['assets'],
    queryFn: () => assetsApi.getAll(0, 100),
    select: (response) => (response?.data && Array.isArray(response.data) ? response.data : []),
  })

  const refreshAssets = () => {
    refetch()
  }

  return (
    <AssetsContext.Provider
      value={{
        assets: assets || [],
        isLoading,
        selectedAsset,
        isCreateDialogOpen,
        isEditDialogOpen,
        isDeleteDialogOpen,
        setIsCreateDialogOpen,
        setIsEditDialogOpen,
        setIsDeleteDialogOpen,
        setSelectedAsset,
        refreshAssets,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}