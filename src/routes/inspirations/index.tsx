import { createFileRoute } from '@tanstack/react-router'
import Inspirations from '@/features/inspirations'

export const Route = createFileRoute('/inspirations/')({
  component: Inspirations,
})