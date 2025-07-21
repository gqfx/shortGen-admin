import { createFileRoute } from '@tanstack/react-router'
import { AccountDetailPage } from '@/features/target-accounts/components/account-detail'

export const Route = createFileRoute('/target-accounts/$accountId')({
  component: AccountDetailPage,
})
