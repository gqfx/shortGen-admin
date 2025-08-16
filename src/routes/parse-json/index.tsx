import { createFileRoute } from '@tanstack/react-router'
import ParseJsonPage from '@/features/parse-json'

export const Route = createFileRoute('/parse-json/')({
  component: ParseJsonPage,
})