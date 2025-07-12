import { createFileRoute } from '@tanstack/react-router'
import ProjectTypes from '@/features/project-types'

export const Route = createFileRoute('/project-types/')({
  component: ProjectTypes,
})