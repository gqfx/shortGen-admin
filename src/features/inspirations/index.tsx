import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBulb, IconPlus, IconEdit, IconCheck, IconX } from '@tabler/icons-react'

// No data available - API integration needed
const mockInspirations: any[] = []

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function Inspirations() {
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
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Inspirations</h2>
            <p className='text-muted-foreground'>
              Manage creative inspirations and project ideas for content generation.
            </p>
          </div>
          <Button variant='default' size='sm' className='h-8 gap-1'>
            <IconPlus className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
              Add Inspiration
            </span>
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {mockInspirations.map((inspiration) => (
            <Card key={inspiration.id} className='group hover:shadow-md transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <IconBulb className='h-5 w-5 text-muted-foreground' />
                    <Badge className={`text-xs ${getStatusColor(inspiration.status)}`}>
                      {inspiration.status}
                    </Badge>
                  </div>
                  <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                      <IconEdit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-green-600'>
                      <IconCheck className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-red-600'>
                      <IconX className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <CardTitle className='text-lg'>{inspiration.title}</CardTitle>
                <CardDescription>{inspiration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Type:</span>
                    <span className='font-medium'>{inspiration.project_type_code}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Source:</span>
                    <span className='font-medium'>{inspiration.source}</span>
                  </div>
                  {inspiration.score && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Score:</span>
                      <Badge variant='outline'>{inspiration.score.toFixed(1)}</Badge>
                    </div>
                  )}
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Created:</span>
                    <span className='font-medium'>
                      {new Date(inspiration.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
    </>
  )
}