import { createFileRoute } from '@tanstack/react-router'
import WorkflowRegistry from '@/features/workflow-registry'

export const Route = createFileRoute('/workflow-registry/')({
  component: WorkflowRegistry,
})