import { createFileRoute } from '@tanstack/react-router'
import { TargetAccountsPage } from '@/features/target-accounts'

export const Route = createFileRoute('/target-accounts/')({
  component: TargetAccountsPage,
})