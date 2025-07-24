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
import { Project } from '../data/schema'
import { useProjects } from '../context/projects-context'
import { IconEdit, IconTrash, IconRefresh, IconEye, IconCalculator } from '@tabler/icons-react'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const project = row.original as Project
  const {
    setSelectedProject,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    regenerateProject,
    recalculateProjectTasks,
  } = useProjects()

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
    // This would ideally navigate to a project details page
    // For now, we can just log it.
    console.log('View project:', project.id)
  }

  const handleRegenerate = () => {
    regenerateProject(project.id)
  }

  const handleRecalculate = () => {
    recalculateProjectTasks(project.id)
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
          Edit Project
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRegenerate}>
          <IconRefresh className='mr-2 h-4 w-4' />
          Regenerate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRecalculate}>
          <IconCalculator className='mr-2 h-4 w-4' />
          Recalculate Tasks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-red-600 focus:text-red-500'>
          <IconTrash className='mr-2 h-4 w-4' />
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}