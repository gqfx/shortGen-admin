import { createFileRoute } from '@tanstack/react-router'
import { TargetVideosPage } from '@/features/target-videos'

export const Route = createFileRoute('/target-videos/')({
  component: TargetVideosPage,
})