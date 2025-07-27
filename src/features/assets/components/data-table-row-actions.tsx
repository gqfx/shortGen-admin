import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Asset } from '../data/schema'
import { useAssets } from '../context/assets-context'
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const asset = row.original as Asset
  const { setSelectedAsset, setIsEditDialogOpen, deleteAsset } = useAssets()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleEdit = () => {
    setSelectedAsset(asset)
    setIsEditDialogOpen(true)
  }

  const handleView = () => {
    setSelectedAsset(asset)
    // This would ideally navigate to a asset details page
    // For now, we can just log it.
  }

  const handleDelete = () => {
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    await deleteAsset(asset.id)
    setIsConfirmOpen(false)
  }

  return (
    <>
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
            查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <IconEdit className='mr-2 h-4 w-4' />
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className='text-red-600 focus:text-red-500'
          >
            <IconTrash className='mr-2 h-4 w-4' />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title='确认删除'
        desc='您确定要删除此资产吗？此操作无法撤销。'
        handleConfirm={handleConfirmDelete}
      />
    </>
  )
}