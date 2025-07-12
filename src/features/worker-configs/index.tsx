import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconAdjustments, IconPlus, IconEdit, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-react'

// No data available - API integration needed
const mockWorkerConfigs: any[] = []

const getConfigTypeColor = (type: string) => {
  switch (type) {
    case 'execution':
      return 'bg-blue-100 text-blue-800'
    case 'validation':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getWorkerTypeColor = (type: string) => {
  switch (type) {
    case 'video_generator':
      return 'bg-red-100 text-red-800'
    case 'audio_processor':
      return 'bg-blue-100 text-blue-800'
    case 'image_processor':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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
              Manage worker configurations for different types of content generation tasks.
            </p>
          </div>
          <Button>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Config
          </Button>
        </div>

        {mockWorkerConfigs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No worker configurations found. API integration needed.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {mockWorkerConfigs.map((config) => (
              <Card key={config.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <IconAdjustments className='h-5 w-5 text-muted-foreground' />
                      <Badge 
                        variant='secondary' 
                        className={getConfigTypeColor(config.config_type)}
                      >
                        {config.config_type}
                      </Badge>
                    </div>
                    <div className='flex space-x-1'>
                      <Button variant='ghost' size='sm'>
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm'>
                        {config.is_active ? <IconToggleRight className='h-4 w-4' /> : <IconToggleLeft className='h-4 w-4' />}
                      </Button>
                      <Button variant='ghost' size='sm'>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{config.config_name}</CardTitle>
                  <CardDescription className='mb-4'>
                    {config.description}
                  </CardDescription>
                  <div className='space-y-2 text-sm text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Worker Type:</span>
                      <Badge 
                        variant='outline' 
                        className={getWorkerTypeColor(config.worker_type)}
                      >
                        {config.worker_type}
                      </Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span>Priority:</span>
                      <span>{config.priority}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <span className={config.is_active ? 'text-green-600' : 'text-red-600'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>
    </>
  )
}