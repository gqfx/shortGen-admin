import { createFileRoute } from '@tanstack/react-router'
import { MonitoringTasksPage } from '@/features/monitoring-tasks'

export const Route = createFileRoute('/monitoring-tasks/')({
  component: MonitoringTasksPage,
})
