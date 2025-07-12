import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCloud, IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react'

// No data available - API integration needed
const mockPlatformAccounts: any[] = []

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
          <Button>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Account
          </Button>
        </div>

        {mockPlatformAccounts.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No platform accounts found. API integration needed.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {mockPlatformAccounts.map((account) => (
              <Card key={account.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <IconCloud className='h-5 w-5 text-muted-foreground' />
                      <Badge 
                        variant='secondary' 
                        className={getPlatformColor(account.platform)}
                      >
                        {account.platform}
                      </Badge>
                    </div>
                    <div className='flex space-x-1'>
                      <Button variant='ghost' size='sm'>
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm'>
                        <IconRefresh className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='sm'>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{account.name}</CardTitle>
                  <div className='space-y-2 text-sm text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <Badge 
                        variant='outline' 
                        className={getStatusColor(account.status)}
                      >
                        {account.status}
                      </Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span>Daily Limit:</span>
                      <span>{account.daily_limit}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Used Today:</span>
                      <span>{account.used_today}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Available:</span>
                      <span className={account.is_available ? 'text-green-600' : 'text-red-600'}>
                        {account.is_available ? 'Yes' : 'No'}
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