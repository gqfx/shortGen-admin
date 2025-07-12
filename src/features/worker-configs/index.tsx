import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconAdjustments, IconPlus, IconEdit, IconTrash, IconToggleLeft, IconToggleRight, IconEye } from '@tabler/icons-react'
import WorkerConfigsProvider, { useWorkerConfigs } from './context/worker-configs-context'
import { WorkerConfigDialogs } from './components/worker-config-dialogs'

const getConfigTypeColor = (type: string) => {
  switch (type) {
    case 'execution':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'validation':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'processing':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getWorkerTypeColor = (type: string) => {
  switch (type) {
    case 'video_generator':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'image_generator':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'audio_generator':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'text_generator':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

function WorkerConfigsContent() {
  const {
    workerConfigs,
    isLoading,
    error,
    setSelectedConfig,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailDialogOpen,
    updateConfig,
  } = useWorkerConfigs()

  const handleEdit = (config: any) => {
    setSelectedConfig(config)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (config: any) => {
    setSelectedConfig(config)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (config: any) => {
    setSelectedConfig(config)
    setIsDetailDialogOpen(true)
  }

  const handleToggleActive = async (config: any) => {
    try {
      await updateConfig(config.id, {
        ...config,
        is_active: !config.is_active,
      })
    } catch (error) {
      console.error('Failed to toggle config status:', error)
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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Worker Configurations</h2>
            <p className='text-muted-foreground'>
              Manage worker configurations and settings for content generation tasks.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Configuration
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading worker configurations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-600">Error loading worker configurations: {error.message}</div>
          </div>
        ) : workerConfigs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No worker configurations found. Click "Add Configuration" to create one.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {workerConfigs.map((config) => (
              <Card key={config.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <IconAdjustments className='h-5 w-5 text-muted-foreground' />
                      <Badge 
                        variant='secondary' 
                        className={getWorkerTypeColor(config.worker_type)}
                      >
                        {config.worker_type}
                      </Badge>
                      <Badge 
                        variant='outline' 
                        className={getConfigTypeColor(config.config_type)}
                      >
                        {config.config_type}
                      </Badge>
                    </div>
                    <div className='flex space-x-1'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewDetails(config)}
                        title='View Details'
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleEdit(config)}
                        title='Edit Configuration'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleToggleActive(config)}
                        title={config.is_active ? 'Deactivate' : 'Activate'}
                        className={config.is_active ? 'text-orange-600' : 'text-green-600'}
                      >
                        {config.is_active ? <IconToggleRight className='h-4 w-4' /> : <IconToggleLeft className='h-4 w-4' />}
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDelete(config)}
                        title='Delete Configuration'
                        className='text-red-600 hover:text-red-700'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{config.config_name || config.name}</CardTitle>
                  <CardDescription className='mb-4'>
                    {config.description}
                  </CardDescription>
                  <div className='space-y-2 text-sm text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Priority:</span>
                      <span>{config.priority}/10</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <span className={config.is_active ? 'text-green-600' : 'text-red-600'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Version:</span>
                      <span>{config.version || '1.0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <WorkerConfigDialogs />
    </>
  )
}

export default function WorkerConfigs() {
  return (
    <WorkerConfigsProvider>
      <WorkerConfigsContent />
    </WorkerConfigsProvider>
  )
}