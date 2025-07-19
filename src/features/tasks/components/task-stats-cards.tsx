import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  IconChecks, 
  IconClock, 
  IconLoader2, 
  IconX, 
  IconPlayerPause,
  IconCurrencyDollar,
  IconList
} from '@tabler/icons-react'
import { Task } from '../data/schema'

interface Props {
  tasks: Task[]
}

export function TaskStatsCards({ tasks }: Props) {
  const stats = {
    total: tasks.length,
    waiting: tasks.filter(t => t.status === 'waiting').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    totalGenerateCost: tasks.reduce((sum, t) => sum + (t.forecast_generate_cost || 0), 0),
    totalQueueCost: tasks.reduce((sum, t) => sum + (t.forecast_queue_cost || 0), 0),
  }

  const totalCost = stats.totalGenerateCost + stats.totalQueueCost

  const statusCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: IconList,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Waiting',
      value: stats.waiting,
      icon: IconPlayerPause,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: IconClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: IconLoader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: IconChecks,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: IconX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
      {statusCards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.value > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {((card.value / stats.total) * 100).toFixed(1)}%
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Cost Summary Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Cost
          </CardTitle>
          <div className="p-2 rounded-md bg-purple-50">
            <IconCurrencyDollar className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{totalCost.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Gen: {stats.totalGenerateCost.toFixed(2)} | Queue: {stats.totalQueueCost.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}