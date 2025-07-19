import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { Input } from '@/components/ui/input'
import { IconFilter, IconX } from '@tabler/icons-react'
import { Task } from '../data/schema'
import { statuses, taskTypes } from '../data/data'

interface Props {
  tasks: Task[]
  onFilteredTasksChange: (filteredTasks: Task[]) => void
}

interface Filters {
  status: string[]
  taskType: string[]
  platform: string[]
  projectId: string
  submitId: string
  dateRange: {
    from: string
    to: string
  }
}

export function TaskFilters({ tasks, onFilteredTasksChange }: Props) {
  const [filters, setFilters] = useState<Filters>({
    status: [],
    taskType: [],
    platform: [],
    projectId: '',
    submitId: '',
    dateRange: {
      from: '',
      to: ''
    }
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Get unique platforms from tasks
  const uniquePlatforms = Array.from(new Set(tasks.map(t => t.platform_account.platform)))

  const applyFilters = (newFilters: Filters) => {
    let filtered = tasks

    // Status filter
    if (newFilters.status.length > 0) {
      filtered = filtered.filter(task => newFilters.status.includes(task.status))
    }

    // Task type filter
    if (newFilters.taskType.length > 0) {
      filtered = filtered.filter(task => newFilters.taskType.includes(task.task_type))
    }

    // Platform filter
    if (newFilters.platform.length > 0) {
      filtered = filtered.filter(task => newFilters.platform.includes(task.platform_account.platform))
    }

    // Project ID filter
    if (newFilters.projectId) {
      filtered = filtered.filter(task => 
        task.project_id.toString().includes(newFilters.projectId)
      )
    }

    // Submit ID filter
    if (newFilters.submitId) {
      filtered = filtered.filter(task => 
        task.submit_id.toLowerCase().includes(newFilters.submitId.toLowerCase())
      )
    }

    // Date range filter
    if (newFilters.dateRange.from) {
      filtered = filtered.filter(task => 
        new Date(task.created_at) >= new Date(newFilters.dateRange.from)
      )
    }
    if (newFilters.dateRange.to) {
      filtered = filtered.filter(task => 
        new Date(task.created_at) <= new Date(newFilters.dateRange.to)
      )
    }

    onFilteredTasksChange(filtered)
  }

  const updateFilter = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const toggleArrayFilter = (key: 'status' | 'taskType' | 'platform', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray)
  }

  const clearAllFilters = () => {
    const emptyFilters: Filters = {
      status: [],
      taskType: [],
      platform: [],
      projectId: '',
      submitId: '',
      dateRange: { from: '', to: '' }
    }
    setFilters(emptyFilters)
    applyFilters(emptyFilters)
  }

  const hasActiveFilters = 
    filters.status.length > 0 ||
    filters.taskType.length > 0 ||
    filters.platform.length > 0 ||
    filters.projectId ||
    filters.submitId ||
    filters.dateRange.from ||
    filters.dateRange.to

  const activeFilterCount = 
    filters.status.length +
    filters.taskType.length +
    filters.platform.length +
    (filters.projectId ? 1 : 0) +
    (filters.submitId ? 1 : 0) +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-8"
              >
                <IconX className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <Badge
                  key={status.value}
                  variant={filters.status.includes(status.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('status', status.value)}
                >
                  {status.icon && <status.icon className="h-3 w-3 mr-1" />}
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Task Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Task Type</label>
            <div className="flex flex-wrap gap-2">
              {taskTypes.map(type => (
                <Badge
                  key={type.value}
                  variant={filters.taskType.includes(type.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('taskType', type.value)}
                >
                  {type.icon && <type.icon className="h-3 w-3 mr-1" />}
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Platform Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Platform</label>
            <div className="flex flex-wrap gap-2">
              {uniquePlatforms.map(platform => (
                <Badge
                  key={platform}
                  variant={filters.platform.includes(platform) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('platform', platform)}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project ID</label>
              <Input
                placeholder="Search by project ID..."
                value={filters.projectId}
                onChange={(e) => updateFilter('projectId', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Submit ID</label>
              <Input
                placeholder="Search by submit ID..."
                value={filters.submitId}
                onChange={(e) => updateFilter('submitId', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Created Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="date"
                  placeholder="From date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="date"
                  placeholder="To date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}