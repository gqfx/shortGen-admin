import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconSettings, IconPlus, IconEdit, IconTrash, IconToggleLeft, IconToggleRight, IconEye, IconArrowUp, IconArrowDown, IconCode } from '@tabler/icons-react'
import ProjectTypesProvider, { useProjectTypes } from './context/project-types-context'
import { ProjectTypesDialogs } from './components/project-types-dialogs'

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'video':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'audio':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'image':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'education':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

function ProjectTypesContent() {
  const {
    projectTypes,
    isLoading,
    error,
    setSelectedProjectType,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailDialogOpen,
    activateProjectType,
    deactivateProjectType,
    updateSortOrder,
  } = useProjectTypes()

  const handleEdit = (projectType: any) => {
    setSelectedProjectType(projectType)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (projectType: any) => {
    setSelectedProjectType(projectType)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (projectType: any) => {
    setSelectedProjectType(projectType)
    setIsDetailDialogOpen(true)
  }

  const handleToggleActive = async (projectType: any) => {
    try {
      if (projectType.is_active) {
        await deactivateProjectType(projectType.code)
      } else {
        await activateProjectType(projectType.code)
      }
    } catch (error) {
      console.error('Failed to toggle project type status:', error)
    }
  }

  const handleSortOrderChange = async (projectType: any, direction: 'up' | 'down') => {
    try {
      const newSortOrder = direction === 'up' 
        ? projectType.sort_order - 1 
        : projectType.sort_order + 1
      if (newSortOrder >= 1) {
        await updateSortOrder(projectType.code, newSortOrder)
      }
    } catch (error) {
      console.error('Failed to update sort order:', error)
    }
  }

  // Sort project types by sort_order
  const sortedProjectTypes = [...projectTypes].sort((a, b) => a.sort_order - b.sort_order)

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
            <h2 className='text-2xl font-bold tracking-tight'>Project Types</h2>
            <p className='text-muted-foreground'>
              Manage project type configurations and workflow associations.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Project Type
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading project types...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-600">Error loading project types: {error.message}</div>
          </div>
        ) : sortedProjectTypes.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No project types found. Click "Add Project Type" to create one.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {sortedProjectTypes.map((projectType) => (
              <Card key={projectType.code} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <IconSettings className='h-5 w-5 text-muted-foreground' />
                      <Badge 
                        variant='secondary' 
                        className={getCategoryColor(projectType.category)}
                      >
                        {projectType.category}
                      </Badge>
                      {projectType.is_active ? (
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
                        onClick={() => handleViewDetails(projectType)}
                        title='View Details'
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleEdit(projectType)}
                        title='Edit Project Type'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleSortOrderChange(projectType, 'up')}
                        title='Move Up'
                        disabled={projectType.sort_order <= 1}
                        className='text-blue-600'
                      >
                        <IconArrowUp className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleSortOrderChange(projectType, 'down')}
                        title='Move Down'
                        className='text-blue-600'
                      >
                        <IconArrowDown className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleToggleActive(projectType)}
                        title={projectType.is_active ? 'Deactivate' : 'Activate'}
                        className={projectType.is_active ? 'text-orange-600' : 'text-green-600'}
                      >
                        {projectType.is_active ? <IconToggleLeft className='h-4 w-4' /> : <IconToggleRight className='h-4 w-4' />}
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDelete(projectType)}
                        title='Delete Project Type'
                        className='text-red-600 hover:text-red-700'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{projectType.name}</CardTitle>
                  <CardDescription className='mb-4'>
                    {projectType.description}
                  </CardDescription>
                  <div className='space-y-2 text-sm text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Code:</span>
                      <span className='font-mono text-xs truncate max-w-32' title={projectType.code}>
                        {projectType.code}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Sort Order:</span>
                      <span>{projectType.sort_order}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <span className={projectType.is_active ? 'text-green-600' : 'text-red-600'}>
                        {projectType.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span>Workflows:</span>
                      <div className='flex items-center text-muted-foreground'>
                        <IconCode className='h-3 w-3 mr-1' />
                        <span className='text-xs'>
                          {[
                            projectType.inspiration_workflow_id,
                            projectType.transform_workflow_id,
                            projectType.execution_workflow_id
                          ].filter(Boolean).length} linked
                        </span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span>Parameters:</span>
                      <div className='flex items-center text-muted-foreground'>
                        <IconCode className='h-3 w-3 mr-1' />
                        <span className='text-xs'>
                          {Object.keys(projectType.default_parameters || {}).length} params
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

      <ProjectTypesDialogs />
    </>
  )
}

export default function ProjectTypes() {
  return (
    <ProjectTypesProvider>
      <ProjectTypesContent />
    </ProjectTypesProvider>
  )
}