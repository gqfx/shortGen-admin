import { createFileRoute } from '@tanstack/react-router'
import { VideoDetailPage } from '@/features/target-videos/components/video-detail'

export const Route = createFileRoute('/target-videos/$videoId')({
  component: VideoDetailPage,
})