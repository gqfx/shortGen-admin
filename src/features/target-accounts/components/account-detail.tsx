import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Home, ChevronRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AccountDetailProvider, useAccountDetail } from '../context/account-detail-context'
import { AccountStatistics } from './account-statistics'

function AccountDetailContent() {
  const { accountId } = useParams({ from: '/target-accounts/$accountId' })
  const navigate = useNavigate()
  const { account, loading, error, refreshAccountData } = useAccountDetail()

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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHomeClick}
            className="h-auto p-1 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAccountsClick}
            className="h-auto p-1 hover:text-foreground"
          >
            Target Accounts
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Account Detail</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Accounts</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {loading ? 'Loading...' : account?.display_name || 'Account Detail'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? `Account ID: ${accountId}` : `@${account?.username || 'unknown'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-destructive">
                <p className="text-sm font-medium">Error loading account data:</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Statistics Section */}
        <AccountStatistics 
          account={account} 
          loading={loading}
          className="mb-6"
        />

        {/* Main Content Grid Layout */}
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
                  Video filtering and batch operations will be implemented in tasks 6-8
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

        {/* Full Width Section for Video List */}
        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Video list with filtering and batch operations will be implemented in tasks 6-8
            </p>
          </CardContent>
        </Card>
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