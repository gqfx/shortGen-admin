import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'
import PlatformAccountsProvider, { usePlatformAccounts } from './context/platform-accounts-context'
import { PlatformAccountDialogs } from './components/platform-account-dialogs'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'

function PlatformAccountsContent() {
  const {
    platformAccounts,
    isLoading,
    error,
    setIsCreateDialogOpen,
    refreshAccounts,
  } = usePlatformAccounts()

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
          <div className='flex items-center space-x-2'>
            <Button onClick={() => refreshAccounts()} variant='outline' size='sm'>
              <IconRefresh className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <IconPlus className='mr-2 h-4 w-4' />
              Add Account
            </Button>
          </div>
        </div>

        <div className='-mx-4 flex-1 px-4 py-1 flex flex-col'>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading platform accounts...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-red-600">Error loading platform accounts: {error.message}</div>
            </div>
          ) : (
            <div className='flex-grow overflow-y-auto'>
              <DataTable data={platformAccounts} columns={columns} />
            </div>
          )}
        </div>
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