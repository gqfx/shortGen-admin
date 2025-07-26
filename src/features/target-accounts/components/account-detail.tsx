import { useParams, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Home, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AccountDetailProvider, useAccountDetail } from '../context/account-detail-context'
import { AccountStatistics } from './account-statistics'
import { VideoList } from './video-list'
import { useResponsive, useTouchFriendly } from '@/hooks/use-responsive'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from 'lucide-react'


function AccountDetailContent() {
  const { accountId: _accountId } = useParams({ from: '/target-accounts/$accountId' })
  const navigate = useNavigate()
  const { account, loading, error } = useAccountDetail()
  const { isMobile } = useResponsive()
  const { touchTargetSize, touchSpacing, touchPadding } = useTouchFriendly()


  const handleBack = () => {
    navigate({ to: '/target-accounts' })
  }

  const handleHomeClick = () => {
    navigate({ to: '/' })
  }

  const handleAccountsClick = () => {
    navigate({ to: '/target-accounts' })
  }

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.altKey) {
        switch (event.key) {
          case 'ArrowLeft':
          case 'Backspace':
            event.preventDefault()
            handleBack()
            break
          case 'h':
            event.preventDefault()
            handleHomeClick()
            break
        }
      }

      if (event.key === 'Escape') {
        handleBack()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleBack, handleHomeClick])

  return (
    <div className="min-h-screen bg-background">
      <main className={`container mx-auto ${isMobile ? 'px-3 py-4' : 'px-4 py-6'} space-y-4 md:space-y-6`}>
        {/* Mobile-Optimized Breadcrumb Navigation */}
        <nav 
          className={`flex items-center ${touchSpacing} text-sm text-muted-foreground overflow-x-auto`}
          aria-label="Breadcrumb navigation"
          role="navigation"
        >
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            onClick={handleHomeClick}
            className={`${touchTargetSize} ${isMobile ? 'p-2' : 'h-auto p-1'} hover:text-foreground flex-shrink-0`}
            aria-label="Go to home page"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {isMobile && <span className="ml-2 text-xs">Home</span>}
          </Button>
          <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            onClick={handleAccountsClick}
            className={`${touchTargetSize} ${isMobile ? 'px-3 py-2' : 'h-auto p-1'} hover:text-foreground flex-shrink-0`}
            aria-label="Go to target accounts list"
          >
            <span className={isMobile ? 'text-xs' : ''}>Target Accounts</span>
          </Button>
          <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span 
            className={`text-foreground font-medium ${isMobile ? 'text-xs' : ''} truncate`}
            aria-current="page"
          >
            Account Detail
          </span>
        </nav>

        <Collapsible defaultOpen className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center px-4 py-2">
              <h2 className="text-lg font-semibold">Account Overview</h2>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Account Statistics Section */}
            <AccountStatistics 
              account={account} 
              loading={loading}
              className={isMobile ? 'mb-4' : 'mb-6'}
            />

            {/* Last Updated Info */}
            <div className="text-sm text-muted-foreground px-4">
              Last Updated: {account?.updated_at ? new Date(account.updated_at).toLocaleString() : 'N/A'}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator className={isMobile ? 'my-4' : ''} />

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className={`${touchPadding} ${isMobile ? 'pt-4' : 'pt-6'}`}>
              <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-2'} text-destructive`}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Error loading account data:</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} ${isMobile ? 'break-words' : ''}`}>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Width Section for Video List with Filters */}
        <VideoList />
      </main>
    </div>
  )
}

export function AccountDetailPage() {
  const { accountId } = useParams({ from: '/target-accounts/$accountId' })
  
  return (
    <AccountDetailProvider accountId={accountId}>
      <AccountDetailContent />
    </AccountDetailProvider>
  )
}