import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconPhoto, IconVideo, IconMusic, IconFileText, IconPlus, IconEdit, IconTrash, IconDownload } from '@tabler/icons-react'
import AssetsProvider, { useAssets } from './context/assets-context'

// Mock data
const mockAssets = [
  {
    id: 1,
    name: 'Product Demo Video',
    description: 'High-quality product demonstration video',
    asset_type: 'video' as const,
    storage_path: '/storage/videos/demo.mp4',
    asset_metadata: { resolution: '1920x1080', fps: 30, codec: 'H.264' },
    duration_seconds: 120,
    source: 'ai_generated',
    visibility: 'public' as const,
    status: 'ACTIVE',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:45:00Z',
  },
  {
    id: 2,
    name: 'Background Music',
    description: 'Ambient background music for videos',
    asset_type: 'audio' as const,
    storage_path: '/storage/audio/bg_music.mp3',
    asset_metadata: { bitrate: '320kbps', format: 'MP3' },
    duration_seconds: 180,
    source: 'uploaded',
    visibility: 'private' as const,
    status: 'ACTIVE',
    created_at: '2024-01-12T08:15:00Z',
    updated_at: '2024-01-12T08:15:00Z',
  },
  {
    id: 3,
    name: 'Hero Image',
    description: 'Main hero image for landing page',
    asset_type: 'image' as const,
    storage_path: '/storage/images/hero.jpg',
    asset_metadata: { width: 1920, height: 1080, format: 'JPEG' },
    duration_seconds: null,
    source: 'uploaded',
    visibility: 'public' as const,
    status: 'ACTIVE',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z',
  },
]

const getAssetIcon = (type: string) => {
  switch (type) {
    case 'video':
      return IconVideo
    case 'audio':
      return IconMusic
    case 'image':
      return IconPhoto
    case 'text':
      return IconFileText
    default:
      return IconFileText
  }
}

const getAssetTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'bg-blue-100 text-blue-800'
    case 'audio':
      return 'bg-green-100 text-green-800'
    case 'image':
      return 'bg-purple-100 text-purple-800'
    case 'text':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function AssetsContent() {
  const { setIsCreateDialogOpen, setSelectedAsset, setIsEditDialogOpen, setIsDeleteDialogOpen } = useAssets()

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (asset: any) => {
    setSelectedAsset(asset)
    setIsDeleteDialogOpen(true)
  }

  const handleDownload = (asset: any) => {
    console.log('Download asset:', asset.id)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Assets</h2>
            <p className='text-muted-foreground'>
              Manage your media assets including videos, images, audio, and text files.
            </p>
          </div>
          <Button
            variant='default'
            size='sm'
            onClick={() => setIsCreateDialogOpen(true)}
            className='h-8 gap-1'
          >
            <IconPlus className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
              Add Asset
            </span>
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {mockAssets.map((asset) => {
            const Icon = getAssetIcon(asset.asset_type)
            return (
              <Card key={asset.id} className='group hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <Icon className='h-5 w-5 text-muted-foreground' />
                      <Badge className={`text-xs ${getAssetTypeColor(asset.asset_type)}`}>
                        {asset.asset_type}
                      </Badge>
                    </div>
                    <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDownload(asset)}
                        className='h-8 w-8 p-0'
                      >
                        <IconDownload className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(asset)}
                        className='h-8 w-8 p-0'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(asset)}
                        className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className='text-lg'>{asset.name}</CardTitle>
                  <CardDescription>{asset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Visibility:</span>
                      <Badge variant={asset.visibility === 'public' ? 'default' : 'secondary'}>
                        {asset.visibility}
                      </Badge>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Source:</span>
                      <span className='font-medium'>{asset.source}</span>
                    </div>
                    {asset.duration_seconds && (
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Duration:</span>
                        <span className='font-medium'>{asset.duration_seconds}s</span>
                      </div>
                    )}
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Created:</span>
                      <span className='font-medium'>
                        {new Date(asset.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </Main>
    </>
  )
}

export default function Assets() {
  return (
    <AssetsProvider>
      <AssetsContent />
    </AssetsProvider>
  )
}