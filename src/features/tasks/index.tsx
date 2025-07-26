import React from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TaskStatsCards } from './components/task-stats-cards'
import { TaskFilters } from './components/task-filters'
import TasksProvider, { useTasks } from './context/tasks-context'
import PlatformAccountsProvider from '../platform-accounts/context/platform-accounts-context'
import { Pagination } from '@/components/ui/pagination'

function TasksContent() {
  const { tasks, isLoading, error, pagination, setPagination } = useTasks()

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
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-red-600">Error loading tasks: {error.message}</div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">No tasks found. Click "Add Task" to create one.</div>
            </div>
          ) : (
            <>
              <TaskStatsCards tasks={tasks} />
              {/* The TaskFilters component might need to be adapted or removed if filtering is now server-side */}
              {/* For now, we assume it might still be used for client-side filtering on the current page */}
              <TaskFilters tasks={tasks} onFilteredTasksChange={() => {}} />
              <DataTable data={tasks} columns={columns} />
              <div className="mt-4 flex justify-end">
                <Pagination
                  page={pagination.page}
                  pageSize={pagination.size}
                  total={pagination.total}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                  onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
                />
              </div>
            </>
          )}
        </div>
      </Main>

      <TasksDialogs />
    </>
  )
}

export default function Tasks() {
  return (
    <PlatformAccountsProvider>
      <TasksProvider>
        <TasksContent />
      </TasksProvider>
    </PlatformAccountsProvider>
  )
}