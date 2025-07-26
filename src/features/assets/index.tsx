import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import AssetsProvider, { useAssets } from './context/assets-context'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'

function AssetsContent() {
  const { assets, isLoading } = useAssets()

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

        {isLoading && !assets.length ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading assets...</div>
          </div>
        ) : (
          <DataTable columns={columns} data={assets} />
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