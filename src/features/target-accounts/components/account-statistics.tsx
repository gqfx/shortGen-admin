import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Calendar, 
  Video, 
  Eye, 
  Clock, 
  FileText,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import { TargetAccount } from '@/lib/api'

interface AccountStatisticsProps {
  account: TargetAccount | null
  loading?: boolean
  className?: string
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  loading?: boolean
  placeholder?: string
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ 
  title, 
  value, 
  icon, 
  loading = false, 
  placeholder = 'N/A',
  description,
  trend 
}: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <div className="text-muted-foreground">{icon}</div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3" />
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {value || placeholder}
            </div>
          )}
          {description && !loading && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {loading && description && (
            <Skeleton className="h-4 w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid Date'
  }
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  } catch {
    return 'Unknown'
  }
}

export function AccountStatistics({ account, loading = false, className }: AccountStatisticsProps) {
  // Calculate derived statistics
  const totalVideos = 0 // This would come from video count API
  const totalViews = 0 // This would come from aggregated video views
  const accountAge = account?.created_at ? 
    Math.floor((new Date().getTime() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className={className}>
      {/* Account Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Account Overview</span>
            </CardTitle>
            {account?.is_verified && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Verified</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Account Name and Username */}
            <div className="space-y-2">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{account?.display_name || 'Unknown Account'}</h3>
                  <p className="text-sm text-muted-foreground">@{account?.username || 'unknown'}</p>
                </>
              )}
            </div>
            
            {/* Account Description */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed">
                  {account?.description || 'No description available'}
                </p>
              )}
            </div>

            {/* Category and Status */}
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </>
              ) : (
                <>
                  {account?.category && (
                    <Badge variant="outline">{account.category}</Badge>
                  )}
                  <Badge variant={account?.is_active ? 'default' : 'secondary'}>
                    {account?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Subscriber Count */}
        <StatCard
          title="Subscribers"
          value={account?.subscriber_count ? formatNumber(account.subscriber_count) : 'N/A'}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
          description={account?.subscriber_count ? `${account.subscriber_count.toLocaleString()} total subscribers` : undefined}
        />

        {/* Account Creation Date */}
        <StatCard
          title="Account Created"
          value={formatDate(account?.created_at || null)}
          icon={<Calendar className="h-4 w-4" />}
          loading={loading}
          description={account?.created_at ? `${accountAge} days ago` : undefined}
        />

        {/* Total Videos (placeholder - would come from API) */}
        <StatCard
          title="Total Videos"
          value={totalVideos || 'N/A'}
          icon={<Video className="h-4 w-4" />}
          loading={loading}
          placeholder="Loading..."
          description="Videos in this account"
        />

        {/* Total Views (placeholder - would come from API) */}
        <StatCard
          title="Total Views"
          value={totalViews ? formatNumber(totalViews) : 'N/A'}
          icon={<Eye className="h-4 w-4" />}
          loading={loading}
          placeholder="Loading..."
          description="Across all videos"
        />

        {/* Last Crawled */}
        <StatCard
          title="Last Crawled"
          value={getRelativeTime(account?.last_crawled_at || null)}
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
          description={account?.last_crawled_at ? formatDate(account.last_crawled_at) : 'Never crawled'}
        />

        {/* Monitor Frequency */}
        <StatCard
          title="Monitor Frequency"
          value={account?.monitor_frequency ? account.monitor_frequency.charAt(0).toUpperCase() + account.monitor_frequency.slice(1) : 'N/A'}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={loading}
          description={`Crawl limit: ${account?.video_crawl_limit || 'N/A'} videos`}
        />
      </div>

      {/* Additional Information Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Account Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Account ID</p>
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {account?.account_id || 'N/A'}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              {loading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="text-sm">
                  {formatDate(account?.updated_at || null)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}