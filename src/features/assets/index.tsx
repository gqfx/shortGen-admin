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

function AssetsContent() {
  const { assets, isLoading } = useAssets()

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video': return IconVideo
      case 'image': return IconPhoto
      case 'audio': return IconMusic
      case 'text': return IconFileText
      default: return IconFileText
    }
  }

  const getAssetTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'image': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'audio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'text': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
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
              Manage your digital assets including videos, images, audio, and documents.
            </p>
          </div>
          <Button>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Asset
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading assets...</div>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No assets found. API returned empty data.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {assets.map((asset) => {
              const Icon = getAssetIcon(asset.asset_type)
              return (
                <Card key={asset.id} className='hover:shadow-md transition-shadow'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center space-x-2'>
                        <Icon className='h-5 w-5 text-muted-foreground' />
                        <Badge 
                          variant='secondary' 
                          className={getAssetTypeBadgeColor(asset.asset_type)}
                        >
                          {asset.asset_type}
                        </Badge>
                      </div>
                      <div className='flex space-x-1'>
                        <Button variant='ghost' size='sm'>
                          <IconEdit className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <IconDownload className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className='text-lg mb-2'>{asset.name}</CardTitle>
                    <CardDescription className='mb-4'>
                      {asset.description}
                    </CardDescription>
                    <div className='space-y-2 text-sm text-muted-foreground'>
                      <div className='flex justify-between'>
                        <span>Source:</span>
                        <span>{asset.source}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Status:</span>
                        <Badge variant='outline'>{asset.status}</Badge>
                      </div>
                      <div className='flex justify-between'>
                        <span>Visibility:</span>
                        <span className='capitalize'>{asset.visibility}</span>
                      </div>
                      {asset.duration_seconds && (
                        <div className='flex justify-between'>
                          <span>Duration:</span>
                          <span>{Math.floor(asset.duration_seconds / 60)}m {asset.duration_seconds % 60}s</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
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