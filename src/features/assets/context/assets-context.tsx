import { createContext, useContext, ReactNode, useState } from 'react'
import { Asset } from '@/lib/api'

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
  const [assets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const refreshAssets = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <AssetsContext.Provider
      value={{
        assets,
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