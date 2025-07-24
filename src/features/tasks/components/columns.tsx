import { ColumnDef, Row } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { taskTypes, statuses } from '../data/data'
import { Task, taskSchema } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { useTasks } from '../context/tasks-context'

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
    accessorKey: 'submit_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Submit ID' />
    ),
    cell: ({ row }) => {
      const submitId = row.getValue('submit_id') as string | null
      return (
        <div className='w-[100px]'>
          {submitId ? <Badge>有</Badge> : <Badge variant='secondary'>无</Badge>}
        </div>
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
      const task = taskSchema.parse(row.original)
      const { platform_account: platformAccount } = task

      const copyToClipboard = (text: string | undefined) => {
        if (text) {
          navigator.clipboard.writeText(text)
          toast.success('Copied to clipboard!')
        } else {
          toast.error('No content to copy.')
        }
      }

      if (!platformAccount) {
        return <div className='w-[150px] text-muted-foreground'>No account</div>
      }

      const displayName =
        platformAccount.nickname || platformAccount.name || 'Unknown'

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className='flex items-center space-x-2 w-[150px] cursor-pointer'>
              <Avatar className='h-6 w-6'>
                <AvatarImage
                  src={platformAccount.avatar_url || ''}
                  alt={displayName}
                />
                <AvatarFallback className='text-xs'>
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-sm font-medium truncate'>
                  {displayName}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {platformAccount.platform || 'Unknown'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[180px]'>
            <DropdownMenuItem onClick={() => copyToClipboard(platformAccount.credentials?.email)}>
              {platformAccount.credentials?.email || 'N/A'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(platformAccount.credentials?.password)}>
              {platformAccount.credentials?.password || 'N/A'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(platformAccount.proxy)}>
              {platformAccount.proxy || 'N/A'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Actions' />
    ),
    cell: ({ row }) => <TaskActionsCell row={row} />,
  },
]

const TaskActionsCell = ({ row }: { row: Row<Task> }) => {
  const task = taskSchema.parse(row.original)
  const { setOpen, setCurrentRow, enqueueTask } = useTasks()

  return (
    <div className='flex items-center space-x-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          setCurrentRow(task)
          setOpen('detail')
        }}
      >
        View Details
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          setCurrentRow(task)
          setOpen('update')
        }}
      >
        Edit
      </Button>
      {task.status === 'waiting' && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            enqueueTask(task.id)
          }}
        >
          Start
        </Button>
      )}
      {['failed', 'error'].includes(task.status) && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            enqueueTask(task.id)
          }}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
