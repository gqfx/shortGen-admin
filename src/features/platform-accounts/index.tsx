import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconCloud, IconPlus, IconEdit, IconTrash, IconRefresh, IconEye } from '@tabler/icons-react'
import PlatformAccountsProvider, { usePlatformAccounts } from './context/platform-accounts-context'
import { PlatformAccountDialogs } from './components/platform-account-dialogs'

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case 'dreamina':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'midjourney':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'runway':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactive':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'suspended':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

function PlatformAccountsContent() {
  const {
    platformAccounts,
    isLoading,
    error,
    setSelectedAccount,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailDialogOpen,
  } = usePlatformAccounts()

  const handleEdit = (account: any) => {
    setSelectedAccount(account)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (account: any) => {
    setSelectedAccount(account)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (account: any) => {
    setSelectedAccount(account)
    setIsDetailDialogOpen(true)
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
            <h2 className='text-2xl font-bold tracking-tight'>Platform Accounts</h2>
            <p className='text-muted-foreground'>
              Manage external platform accounts and API credentials for content generation.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Account
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading platform accounts...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-600">Error loading platform accounts: {error.message}</div>
          </div>
        ) : platformAccounts.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No platform accounts found. Click "Add Account" to create one.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {platformAccounts.map((account) => (
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
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewDetails(account)}
                        title='View Details'
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleEdit(account)}
                        title='Edit Account'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDelete(account)}
                        title='Delete Account'
                        className='text-red-600 hover:text-red-700'
                      >
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
                      <span>Remaining:</span>
                      <span>{account.remaining_quota}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Available:</span>
                      <span className={account.is_available ? 'text-green-600' : 'text-red-600'}>
                        {account.is_available ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {account.credentials?.email && (
                      <div className='flex justify-between'>
                        <span>Email:</span>
                        <span className='truncate max-w-32' title={account.credentials.email}>
                          {account.credentials.email}
                        </span>
                      </div>
                    )}
                    {account.credentials?.proxy && (
                      <div className='flex justify-between'>
                        <span>Proxy:</span>
                        <span className='truncate max-w-32 font-mono text-xs' title={account.credentials.proxy}>
                          {account.credentials.proxy}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <PlatformAccountDialogs />
    </>
  )
}

export default function PlatformAccounts() {
  return (
    <PlatformAccountsProvider>
      <PlatformAccountsContent />
    </PlatformAccountsProvider>
  )
}