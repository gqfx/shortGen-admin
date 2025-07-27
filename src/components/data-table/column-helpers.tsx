import { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// 选择列
export function createSelectColumn<T>(): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

// 可排序的文本列
export function createSortableTextColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    cell?: (value: any) => React.ReactNode
    className?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className={options?.className}
      >
        {header}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const value = getValue()
      return options?.cell ? options.cell(value) : value
    },
  }
}

// 日期列
export function createDateColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    format?: 'relative' | 'absolute' | 'custom'
    customFormatter?: (date: string) => string
    className?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ getValue }) => {
      const dateValue = getValue() as string
      if (!dateValue) return 'N/A'

      try {
        const date = new Date(dateValue)
        
        switch (options?.format) {
          case 'absolute':
            return date.toLocaleDateString()
          case 'custom':
            return options.customFormatter?.(dateValue) || dateValue
          case 'relative':
          default:
            return formatDistanceToNow(date, { addSuffix: true })
        }
      } catch {
        return 'Invalid date'
      }
    },
    meta: {
      className: options?.className,
    },
  }
}

// 状态徽章列
export function createStatusColumn<T>(
  accessorKey: keyof T,
  header: string,
  statusConfig: Record<string, {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }>,
  options?: {
    className?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ getValue }) => {
      const status = getValue() as string
      const config = statusConfig[status] || {
        label: status,
        variant: 'outline' as const,
      }
      
      return (
        <Badge variant={config.variant} className={options?.className}>
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }
}

// 数字列（带格式化）
export function createNumberColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    format?: 'currency' | 'percentage' | 'compact' | 'custom'
    customFormatter?: (value: number) => string
    currency?: string
    className?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className={options?.className}
      >
        {header}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const value = getValue() as number
      if (value === null || value === undefined) return 'N/A'

      switch (options?.format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: options.currency || 'USD',
          }).format(value)
        case 'percentage':
          return `${(value * 100).toFixed(2)}%`
        case 'compact':
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
          return value.toString()
        case 'custom':
          return options.customFormatter?.(value) || value.toString()
        default:
          return value.toLocaleString()
      }
    },
  }
}

// 操作列
export function createActionsColumn<T>(
  actions: Array<{
    label: string
    onClick: (item: T) => void
    variant?: 'default' | 'destructive'
    disabled?: (item: T) => boolean
  }>,
  options?: {
    className?: string
  }
): ColumnDef<T> {
  return {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={options?.className}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {actions.map((action, index) => (
              <div key={index}>
                {index > 0 && action.variant === 'destructive' && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem
                  onClick={() => action.onClick(item)}
                  disabled={action.disabled?.(item)}
                  className={action.variant === 'destructive' ? 'text-destructive' : ''}
                >
                  {action.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}

// 链接列
export function createLinkColumn<T>(
  accessorKey: keyof T,
  header: string,
  getLinkUrl: (item: T) => string,
  options?: {
    external?: boolean
    className?: string
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ getValue, row }) => {
      const value = getValue() as string
      const url = getLinkUrl(row.original)
      
      return (
        <a
          href={url}
          target={options?.external ? '_blank' : undefined}
          rel={options?.external ? 'noopener noreferrer' : undefined}
          className={`text-primary hover:underline ${options?.className || ''}`}
        >
          {value}
        </a>
      )
    },
  }
}