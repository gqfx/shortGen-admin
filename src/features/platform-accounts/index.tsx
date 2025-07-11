import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCloud, IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react'

// Mock data
const mockPlatformAccounts = [
  {
    id: 1,
    platform: 'dreamina' as const,
    name: 'Dreamina Account 1',
    credentials: { api_key: '***masked***' },
    status: 'active' as const,
    daily_limit: 100,
    used_today: 45,
    last_used_at: '2024-01-15T14:30:00Z',
    is_available: true,
    remaining_quota: 55,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },
  {
    id: 2,
    platform: 'midjourney' as const,
    name: 'Midjourney Pro',
    credentials: { api_key: '***masked***' },
    status: 'active' as const,
    daily_limit: 200,
    used_today: 180,
    last_used_at: '2024-01-15T16:45:00Z',
    is_available: true,
    remaining_quota: 20,
    created_at: '2024-01-08T10:15:00Z',
    updated_at: '2024-01-15T16:45:00Z',
  },
  {
    id: 3,
    platform: 'runway' as const,
    name: 'Runway Studio',
    credentials: { api_key: '***masked***' },
    status: 'inactive' as const,
    daily_limit: 50,
    used_today: 0,
    last_used_at: null,
    is_available: false,
    remaining_quota: 50,
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z',
  },
]

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'dreamina':
      return 'bg-blue-100 text-blue-800'
    case 'midjourney':
      return 'bg-purple-100 text-purple-800'
    case 'runway':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function PlatformAccounts() {
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
            <h2 className='text-2xl font-bold tracking-tight'>Platform Accounts</h2>
            <p className='text-muted-foreground'>
              Manage external platform accounts and API credentials for content generation.
            </p>
          </div>
          <Button variant='default' size='sm' className='h-8 gap-1'>
            <IconPlus className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
              Add Account
            </span>
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {mockPlatformAccounts.map((account) => (
            <Card key={account.id} className='group hover:shadow-md transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <IconCloud className='h-5 w-5 text-muted-foreground' />
                    <Badge className={`text-xs ${getPlatformColor(account.platform)}`}>
                      {account.platform}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(account.status)}`}>
                      {account.status}
                    </Badge>
                  </div>
                  <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <IconRefresh className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-red-600'>
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <CardTitle className='text-lg'>{account.name}</CardTitle>
                <CardDescription>
                  Daily quota: {account.used_today}/{account.daily_limit}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-muted-foreground'>Usage Today</span>
                      <span className='font-medium'>{Math.round((account.used_today / account.daily_limit) * 100)}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div 
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${(account.used_today / account.daily_limit) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Remaining:</span>
                      <span className='font-medium'>{account.remaining_quota}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Available:</span>
                      <Badge variant={account.is_available ? 'default' : 'destructive'}>
                        {account.is_available ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Last Used:</span>
                      <span className='font-medium'>
                        {account.last_used_at 
                          ? new Date(account.last_used_at).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
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