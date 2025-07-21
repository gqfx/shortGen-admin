
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMonitoringTasks } from '../context/monitoring-tasks-context'

export function TaskFilters() {
  const { filters, setFilters, resetFilters } = useMonitoringTasks()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Account ID..."
              value={filters.accountId?.toString() || ''}
              onChange={(e) => setFilters({ 
                accountId: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-[150px]"
              type="number"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Video ID..."
              value={filters.videoId?.toString() || ''}
              onChange={(e) => setFilters({ 
                videoId: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-[150px]"
              type="number"
            />
          </div>

          <Select
            value={filters.taskType || 'all'}
            onValueChange={(value) => setFilters({ taskType: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Task Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Task Types</SelectItem>
              <SelectItem value="crawl_channel_info">Crawl Channel Info</SelectItem>
              <SelectItem value="crawl_channel_videos">Crawl Channel Videos</SelectItem>
              <SelectItem value="download_video_file">Download Video File</SelectItem>
              <SelectItem value="analyze_video_content">Analyze Video Content</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => setFilters({ status: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={resetFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}