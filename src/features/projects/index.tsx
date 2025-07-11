import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { ProjectsDialogs } from './components/projects-dialogs'
import { ProjectsPrimaryButtons } from './components/projects-primary-buttons'
import ProjectsProvider from './context/projects-context'

// Mock data - replace with actual API call
const mockProjects = [
  {
    id: 1,
    name: 'AI Short Video Project',
    project_type: 'video_generation',
    status: 'processing' as const,
    initial_parameters: { style: 'modern' },
    inspiration_id: 1,
    score: 4.5,
    score_details: { creativity: 4.8, technical: 4.2 },
    review_notes: 'Excellent creative concept',
    used_transform_workflow_id: 'transform_123',
    used_execution_workflow_id: 'exec_456',
    total_tasks: 10,
    completed_tasks: 7,
    failed_tasks: 1,
    output_asset_id: 123,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:45:00Z',
  },
  {
    id: 2,
    name: 'Product Demo Video',
    project_type: 'video_generation',
    status: 'completed' as const,
    initial_parameters: { duration: 60 },
    inspiration_id: null,
    score: 3.8,
    score_details: null,
    review_notes: null,
    used_transform_workflow_id: null,
    used_execution_workflow_id: null,
    total_tasks: 8,
    completed_tasks: 8,
    failed_tasks: 0,
    output_asset_id: 456,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-12T16:30:00Z',
  },
]

export default function Projects() {
  return (
    <ProjectsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Projects</h2>
            <p className='text-muted-foreground'>
              Manage your video generation projects and track their progress.
            </p>
          </div>
          <ProjectsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={mockProjects} columns={columns} />
        </div>
      </Main>

      <ProjectsDialogs />
    </ProjectsProvider>
  )
}