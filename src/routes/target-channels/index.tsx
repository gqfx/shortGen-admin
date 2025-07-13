import { createFileRoute } from '@tanstack/react-router'
import { TargetChannelsPage } from '@/features/target-channels'

export const Route = createFileRoute('/target-channels/')({
  component: TargetChannelsPage,
})