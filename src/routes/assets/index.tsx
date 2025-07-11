import { createFileRoute } from '@tanstack/react-router'
import Assets from '@/features/assets'

export const Route = createFileRoute('/assets/')({
  component: Assets,
})