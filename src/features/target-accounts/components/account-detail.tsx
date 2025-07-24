import { useParams, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { ArrowLeft, Home, ChevronRight, RefreshCw, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AccountDetailProvider, useAccountDetail } from '../context/account-detail-context'
import { AccountStatistics } from './account-statistics'
import { VideoFilters } from './video-filters'
import { VideoList } from './video-list'
import { useResponsive, useTouchFriendly } from '@/hooks/use-responsive'

function AccountDetailContent() {
  const { accountId } = useParams({ from: '/target-accounts/$accountId' })
  const navigate = useNavigate()
  const { account, loading, error, refreshAccountData } = useAccountDetail()
  const { isMobile, isTablet, isDesktop } = useResponsive()
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

  const handleRefresh = async () => {
    await refreshAccountData()
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
          case 'r':
            event.preventDefault()
            handleRefresh()
            break
        }
      }

      if (event.key === 'Escape') {
        handleBack()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleBack, handleHomeClick, handleRefresh])

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

        {/* Responsive Header Section */}
        <div className={`flex flex-col ${isDesktop ? 'lg:flex-row lg:items-center lg:justify-between' : ''} gap-4`}>
          <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-4`}>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={handleBack}
              className={`${touchTargetSize} flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
              aria-label="Go back to target accounts list"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className={isMobile ? '' : 'hidden sm:inline'}>Back to Accounts</span>
              <span className={isMobile ? 'hidden' : 'sm:hidden'}>Back</span>
            </Button>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 
                className={`${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'} font-bold`}
                id="account-detail-title"
              >
                {loading ? 'Loading...' : account?.display_name || 'Account Detail'}
              </h1>
              <p 
                className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}
                aria-describedby="account-detail-title"
              >
                {loading ? `Account ID: ${accountId}` : `@${account?.username || 'unknown'}`}
              </p>
            </div>
          </div>
          <div className={`flex items-center ${touchSpacing} ${isMobile ? 'justify-center' : ''}`}>
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={handleRefresh}
              disabled={loading}
              className={`${touchTargetSize} flex items-center gap-2 ${isMobile ? 'px-6' : ''}`}
              aria-label={loading ? 'Refreshing account data' : 'Refresh account data'}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className={isMobile ? '' : 'hidden sm:inline'}>Refresh</span>
            </Button>
          </div>
        </div>

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

        {/* Account Statistics Section */}
        <AccountStatistics 
          account={account} 
          loading={loading}
          className={isMobile ? 'mb-4' : 'mb-6'}
        />

        {/* Video Filters Section */}
        <VideoFilters />

        {/* Responsive Main Content Layout */}
        {isDesktop ? (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Video Management */}
            <div className="lg:col-span-8 space-y-6">
              {/* Video Management Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Additional video management tools and analytics will be available here
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Quick actions will be available once account data is loaded
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Mobile/Tablet Stacked Layout */
          <div className="space-y-4">
            {/* Quick Actions Card - Moved to top on mobile */}
            <Card>
              <CardHeader className={touchPadding}>
                <CardTitle className={isMobile ? 'text-lg' : ''}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className={touchPadding}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Quick actions will be available once account data is loaded
                </p>
              </CardContent>
            </Card>

            {/* Video Management Section */}
            <Card>
              <CardHeader className={touchPadding}>
                <CardTitle className={isMobile ? 'text-lg' : ''}>Video Management</CardTitle>
              </CardHeader>
              <CardContent className={touchPadding}>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  Additional video management tools and analytics will be available here
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Width Section for Video List */}
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