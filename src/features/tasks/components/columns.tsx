import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { taskTypes, statuses } from '../data/data'
import { Task } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Task>[] = [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>#{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'submit_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Submit ID' />
    ),
    cell: ({ row }) => {
      const submitId = row.getValue('submit_id') as string | null
      if (!submitId) {
        return <div className='w-[100px] text-muted-foreground text-xs'>No ID</div>
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className='w-[100px] truncate text-xs font-mono'>
                {submitId}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{submitId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'task_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const taskType = taskTypes.find((type) => type.value === row.getValue('task_type'))
      const taskTypeValue = row.getValue('task_type') as string

      return (
        <div className='flex space-x-2'>
          <Badge variant='outline'>
            {taskType ? taskType.label : taskTypeValue}
          </Badge>
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
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='text-muted-foreground mr-2 h-4 w-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'platform_account',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Platform Account' />
    ),
    cell: ({ row }) => {
      const platformAccount = row.getValue('platform_account') as Task['platform_account']
      
      if (!platformAccount || !platformAccount.nickname) {
        return <div className='w-[150px] text-muted-foreground'>No account</div>
      }

      return (
        <div className='flex items-center space-x-2 w-[150px]'>
          <Avatar className='h-6 w-6'>
            <AvatarImage src={platformAccount.avatar_url || ''} alt={platformAccount.nickname || 'Account'} />
            <AvatarFallback className='text-xs'>
              {platformAccount.nickname ? platformAccount.nickname.slice(0, 2).toUpperCase() : 'NA'}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='text-sm font-medium truncate'>{platformAccount.nickname || 'Unknown'}</span>
            <span className='text-xs text-muted-foreground'>{platformAccount.platform || 'Unknown'}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'forecast_generate_cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gen Cost' />
    ),
    cell: ({ row }) => {
      const cost = row.getValue('forecast_generate_cost') as number | null
      return (
        <div className='w-[80px] text-right font-mono text-sm'>
          {cost !== null ? cost.toFixed(2) : '0.00'}
        </div>
      )
    },
  },
  {
    accessorKey: 'forecast_queue_cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Queue Cost' />
    ),
    cell: ({ row }) => {
      const cost = row.getValue('forecast_queue_cost') as number | null
      return (
        <div className='w-[80px] text-right font-mono text-sm'>
          {cost !== null ? cost.toFixed(2) : '0.00'}
        </div>
      )
    },
  },
  {
    accessorKey: 'project_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Project' />
    ),
    cell: ({ row }) => {
      const projectId = row.getValue('project_id') as number | null
      return (
        <div className='w-[100px]'>
          {projectId ? `Project #${projectId}` : 'No Project'}
        </div>
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
        <div className='w-[120px]'>
          {format(date, 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  {
    accessorKey: 'started_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Started' />
    ),
    cell: ({ row }) => {
      const startedAt = row.getValue('started_at') as string | null
      if (!startedAt) {
        return <div className='w-[120px] text-muted-foreground'>Not started</div>
      }
      const date = new Date(startedAt)
      return (
        <div className='w-[120px]'>
          {format(date, 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  {
    accessorKey: 'completed_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Completed' />
    ),
    cell: ({ row }) => {
      const completedAt = row.getValue('completed_at') as string | null
      if (!completedAt) {
        return <div className='w-[120px] text-muted-foreground'>Not completed</div>
      }
      const date = new Date(completedAt)
      return (
        <div className='w-[120px]'>
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
