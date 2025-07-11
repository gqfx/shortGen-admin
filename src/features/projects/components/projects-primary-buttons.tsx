import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useProjects } from '../context/projects-context'

export function ProjectsPrimaryButtons() {
  const { setIsCreateDialogOpen } = useProjects()

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='default'
        size='sm'
        onClick={() => setIsCreateDialogOpen(true)}
        className='h-8 gap-1'
      >
        <IconPlus className='h-3.5 w-3.5' />
        <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
          Add Project
        </span>
      </Button>
    </div>
  )
}