import { createFileRoute } from '@tanstack/react-router'
import { TargetStatisticsPage } from '@/features/target-statistics'

export const Route = createFileRoute('/target-statistics/')({
  component: TargetStatisticsPage,
})