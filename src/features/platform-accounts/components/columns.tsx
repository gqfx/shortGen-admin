import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { PlatformAccount } from '@/lib/api'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export const columns: ColumnDef<PlatformAccount>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>
    },
  },
  {
    id: 'proxy',
    accessorFn: (row) => row.credentials?.proxy,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='代理' />
    ),
    cell: ({ row }) => {
      const proxy = row.getValue('proxy') as string
      return proxy || '-'
    },
  },
  {
    accessorKey: 'used_today',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usage Today' />
    ),
    cell: ({ row }) => {
      const used = row.getValue('used_today') as number
      const limit = row.original.daily_limit
      return (
        <div>
          {used} / {limit || '∞'}
        </div>
      )
    },
  },
  {
    accessorKey: 'credit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Credit' />
    ),
    cell: ({ row }) => {
      const credit = row.getValue('credit') as number
      return <div>{credit}</div>
    },
  },
  {
    accessorKey: 'is_available',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Available' />
    ),
    cell: ({ row }) => {
      const isAvailable = row.getValue('is_available')
      return (
        <Badge variant={isAvailable ? 'default' : 'destructive'}>
          {isAvailable ? 'Yes' : 'No'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className='text-sm text-muted-foreground'>
          {format(date, 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]