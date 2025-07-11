import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconAdjustments, IconPlus, IconEdit, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-react'

// Mock data
const mockWorkerConfigs = [
  {
    id: 1,
    config_name: 'video_worker_config',
    config_type: 'execution',
    worker_type: 'video_generator',
    config_data: {
      max_concurrent: 3,
      timeout: 300,
      quality: 'high',
      format: 'mp4'
    },
    description: 'Configuration for video generation workers',
    priority: 10,
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },
  {
    id: 2,
    config_name: 'audio_worker_config',
    config_type: 'execution',
    worker_type: 'audio_generator',
    config_data: {
      max_concurrent: 5,
      timeout: 180,
      bitrate: '320kbps',
      format: 'mp3'
    },
    description: 'Configuration for audio generation workers',
    priority: 8,
    is_active: true,
    created_at: '2024-01-08T10:15:00Z',
    updated_at: '2024-01-12T09:20:00Z',
  },
  {
    id: 3,
    config_name: 'image_worker_config',
    config_type: 'execution',
    worker_type: 'image_generator',
    config_data: {
      max_concurrent: 8,
      timeout: 120,
      resolution: '1024x1024',
      format: 'png'
    },
    description: 'Configuration for image generation workers',
    priority: 6,
    is_active: false,
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-14T11:10:00Z',
  },
]

const getWorkerTypeColor = (type: string) => {
  switch (type) {
    case 'video_generator':
      return 'bg-blue-100 text-blue-800'
    case 'audio_generator':
      return 'bg-green-100 text-green-800'
    case 'image_generator':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPriorityColor = (priority: number) => {
  if (priority >= 8) return 'bg-red-100 text-red-800'
  if (priority >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

export default function WorkerConfigs() {
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
            <h2 className='text-2xl font-bold tracking-tight'>Worker Configurations</h2>
            <p className='text-muted-foreground'>
              Manage worker configurations for different content generation tasks.
            </p>
          </div>
          <Button variant='default' size='sm' className='h-8 gap-1'>
            <IconPlus className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
              Add Config
            </span>
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {mockWorkerConfigs.map((config) => (
            <Card key={config.id} className='group hover:shadow-md transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <IconAdjustments className='h-5 w-5 text-muted-foreground' />
                    <Badge className={`text-xs ${getWorkerTypeColor(config.worker_type)}`}>
                      {config.worker_type}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(config.priority)}`}>
                      Priority {config.priority}
                    </Badge>
                  </div>
                  <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      {config.is_active ? (
                        <IconToggleRight className='h-4 w-4 text-green-600' />
                      ) : (
                        <IconToggleLeft className='h-4 w-4 text-gray-400' />
                      )}
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-red-600'>
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <CardTitle className='text-lg'>{config.config_name}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Type:</span>
                    <span className='font-medium'>{config.config_type}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Status:</span>
                    <Badge variant={config.is_active ? 'default' : 'secondary'}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className='space-y-1'>
                    <span className='text-sm text-muted-foreground'>Configuration:</span>
                    <div className='bg-muted p-2 rounded text-xs font-mono'>
                      {Object.entries(config.config_data).map(([key, value]) => (
                        <div key={key} className='flex justify-between'>
                          <span>{key}:</span>
                          <span className='font-semibold'>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Updated:</span>
                    <span className='font-medium'>
                      {new Date(config.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </>
  )
}