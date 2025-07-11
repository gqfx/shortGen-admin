import { createFileRoute } from '@tanstack/react-router'
import PlatformAccounts from '@/features/platform-accounts'

export const Route = createFileRoute('/platform-accounts/')({
  component: PlatformAccounts,
})