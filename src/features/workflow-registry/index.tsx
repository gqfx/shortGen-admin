import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconGitBranch, IconPlus, IconEdit, IconTrash, IconToggleLeft, IconToggleRight, IconEye, IconLink } from '@tabler/icons-react'
import type { WorkflowRegistry } from '@/lib/api'
import WorkflowRegistryProvider, { useWorkflowRegistry } from './context/workflow-registry-context'
import { WorkflowRegistryDialogs } from './components/workflow-registry-dialogs'

const getWorkflowTypeColor = (type: string) => {
  switch (type) {
    case 'inspiration':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    case 'transform':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'execution':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

function WorkflowRegistryContent() {
  const {
    workflows,
    isLoading,
    error,
    setSelectedWorkflow,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailDialogOpen,
    activateWorkflow,
    deactivateWorkflow,
  } = useWorkflowRegistry()

  const handleEdit = (workflow: WorkflowRegistry) => {
    setSelectedWorkflow(workflow)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (workflow: WorkflowRegistry) => {
    setSelectedWorkflow(workflow)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (workflow: WorkflowRegistry) => {
    setSelectedWorkflow(workflow)
    setIsDetailDialogOpen(true)
  }

  const handleToggleActive = async (workflow: WorkflowRegistry) => {
    try {
      if (workflow.is_active) {
        await deactivateWorkflow(workflow.id)
      } else {
        await activateWorkflow(workflow.id)
      }
    } catch (error) {
      console.error('Failed to toggle workflow status:', error)
    }
  }

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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Workflow Registry</h2>
            <p className='text-muted-foreground'>
              Manage workflow configurations for content generation pipelines.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Workflow
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading workflows...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-600">Error loading workflows: {error.message}</div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No workflows found. Click "Add Workflow" to create one.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {workflows.map((workflow) => (
              <Card key={workflow.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <IconGitBranch className='h-5 w-5 text-muted-foreground' />
                      <Badge 
                        variant='secondary' 
                        className={getWorkflowTypeColor(workflow.workflow_type)}
                      >
                        {workflow.workflow_type}
                      </Badge>
                      {workflow.is_active ? (
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className='flex space-x-1'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewDetails(workflow)}
                        title='View Details'
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleEdit(workflow)}
                        title='Edit Workflow'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleToggleActive(workflow)}
                        title={workflow.is_active ? 'Deactivate' : 'Activate'}
                        className={workflow.is_active ? 'text-orange-600' : 'text-green-600'}
                      >
                        {workflow.is_active ? <IconToggleLeft className='h-4 w-4' /> : <IconToggleRight className='h-4 w-4' />}
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDelete(workflow)}
                        title='Delete Workflow'
                        className='text-red-600 hover:text-red-700'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{workflow.name}</CardTitle>
                  <CardDescription className='mb-4'>
                    {workflow.description}
                  </CardDescription>
                  <div className='space-y-2 text-sm text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>ID:</span>
                      <span className='font-mono text-xs truncate max-w-32' title={workflow.id}>
                        {workflow.id}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <span className={workflow.is_active ? 'text-green-600' : 'text-red-600'}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span>Webhook:</span>
                      <div className='flex items-center text-muted-foreground'>
                        <IconLink className='h-3 w-3 mr-1' />
                        <span className='text-xs'>
                          {workflow.n8n_webhook_url ? 'Configured' : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <WorkflowRegistryDialogs />
    </>
  )
}

export default function WorkflowRegistry() {
  return (
    <WorkflowRegistryProvider>
      <WorkflowRegistryContent />
    </WorkflowRegistryProvider>
  )
}