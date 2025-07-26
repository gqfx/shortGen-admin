import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PlatformAccount } from '@/lib/api'
import { usePlatformAccounts } from '../context/platform-accounts-context'
import { IconEdit, IconTrash, IconEye, IconRefresh } from '@tabler/icons-react'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const account = row.original as PlatformAccount
  const {
    setSelectedAccount,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailDialogOpen,
    resetUsage,
  } = usePlatformAccounts()

  const handleEdit = () => {
    setSelectedAccount(account)
    setIsEditDialogOpen(true)
  }

  const handleDelete = () => {
    setSelectedAccount(account)
    setIsDeleteDialogOpen(true)
  }

  const handleView = () => {
    setSelectedAccount(account)
    setIsDetailDialogOpen(true)
  }

  const handleResetUsage = () => {
    resetUsage(account.id, { used_today: 0 })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem onClick={handleView}>
          <IconEye className='mr-2 h-4 w-4' />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <IconEdit className='mr-2 h-4 w-4' />
          Edit Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResetUsage}>
          <IconRefresh className='mr-2 h-4 w-4' />
          Reset Usage
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-red-600 focus:text-red-500'>
          <IconTrash className='mr-2 h-4 w-4' />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}