import { createFileRoute } from '@tanstack/react-router'
import WorkerConfigs from '@/features/worker-configs'

export const Route = createFileRoute('/worker-configs/')({
  component: WorkerConfigs,
})