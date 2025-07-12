import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBulb, IconPlus, IconEdit, IconCheck, IconX, IconEye } from '@tabler/icons-react'
import InspirationsProvider, { useInspirations } from './context/inspirations-context'
import { InspirationDialogs } from './components/inspiration-dialogs'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

function InspirationsContent() {
  const {
    inspirations,
    isLoading,
    error,
    setSelectedInspiration,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailDialogOpen,
    approveInspiration,
    rejectInspiration,
  } = useInspirations()

  const handleEdit = (inspiration: any) => {
    setSelectedInspiration(inspiration)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (inspiration: any) => {
    setSelectedInspiration(inspiration)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDetails = (inspiration: any) => {
    setSelectedInspiration(inspiration)
    setIsDetailDialogOpen(true)
  }

  const handleApprove = async (inspiration: any) => {
    try {
      await approveInspiration(inspiration.id, { score: 5 })
    } catch (error) {
      console.error('Failed to approve inspiration:', error)
    }
  }

  const handleReject = async (inspiration: any) => {
    try {
      await rejectInspiration(inspiration.id, { review_notes: 'Rejected' })
    } catch (error) {
      console.error('Failed to reject inspiration:', error)
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
            <h2 className='text-2xl font-bold tracking-tight'>Inspirations</h2>
            <p className='text-muted-foreground'>
              Manage your creative inspirations and ideas for content generation.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Inspiration
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading inspirations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-600">Error loading inspirations: {error.message}</div>
          </div>
        ) : inspirations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">No inspirations found. Click "Add Inspiration" to create one.</div>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {inspirations.map((inspiration) => (
              <Card key={inspiration.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <IconBulb className='h-5 w-5 text-muted-foreground' />
                      <Badge 
                        variant='secondary' 
                        className={getStatusColor(inspiration.status)}
                      >
                        {inspiration.status}
                      </Badge>
                    </div>
                    <div className='flex space-x-1'>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleViewDetails(inspiration)}
                        title='View Details'
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleEdit(inspiration)}
                        title='Edit Inspiration'
                      >
                        <IconEdit className='h-4 w-4' />
                      </Button>
                      {inspiration.status === 'pending' && (
                        <>
                          <Button 
                            variant='ghost' 
                            size='sm'
                            onClick={() => handleApprove(inspiration)}
                            title='Approve'
                            className='text-green-600 hover:text-green-700'
                          >
                            <IconCheck className='h-4 w-4' />
                          </Button>
                          <Button 
                            variant='ghost' 
                            size='sm'
                            onClick={() => handleReject(inspiration)}
                            title='Reject'
                            className='text-red-600 hover:text-red-700'
                          >
                            <IconX className='h-4 w-4' />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant='ghost' 
                        size='sm'
                        onClick={() => handleDelete(inspiration)}
                        title='Delete Inspiration'
                        className='text-red-600 hover:text-red-700'
                      >
                        <IconX className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='text-lg mb-2'>{inspiration.title}</CardTitle>
                  <CardDescription className='mb-4'>
                    {inspiration.description}
                  </CardDescription>
                  <div className='space-y-2 text-sm text-muted-foreground'>
                    <div className='flex justify-between'>
                      <span>Source:</span>
                      <span>{inspiration.source}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Project Type:</span>
                      <span>{inspiration.project_type_code}</span>
                    </div>
                    {inspiration.score && (
                      <div className='flex justify-between'>
                        <span>Score:</span>
                        <span>{inspiration.score}/5</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <InspirationDialogs />
    </>
  )
}

export default function Inspirations() {
  return (
    <InspirationsProvider>
      <InspirationsContent />
    </InspirationsProvider>
  )
}