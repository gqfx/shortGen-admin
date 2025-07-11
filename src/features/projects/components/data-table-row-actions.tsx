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
import { Project } from '@/lib/api'
import { useProjects } from '../context/projects-context'
import { IconEdit, IconTrash, IconRefresh, IconEye } from '@tabler/icons-react'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const project = row.original as Project
  const { setSelectedProject, setIsEditDialogOpen, setIsDeleteDialogOpen } = useProjects()

  const handleEdit = () => {
    setSelectedProject(project)
    setIsEditDialogOpen(true)
  }

  const handleDelete = () => {
    setSelectedProject(project)
    setIsDeleteDialogOpen(true)
  }

  const handleView = () => {
    setSelectedProject(project)
    // Navigate to project details page
    console.log('View project:', project.id)
  }

  const handleRegenerate = () => {
    // Handle project regeneration
    console.log('Regenerate project:', project.id)
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
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleView}>
          <IconEye className='mr-2 h-4 w-4' />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <IconEdit className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRegenerate}>
          <IconRefresh className='mr-2 h-4 w-4' />
          Regenerate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-red-600'>
          <IconTrash className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}