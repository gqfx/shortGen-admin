import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Calendar,
  Video,
  Eye,
  Clock
} from 'lucide-react'
import { TargetAccount } from '@/lib/api'
import { useResponsive, useTouchFriendly } from '@/hooks/use-responsive'

interface AccountStatisticsProps {
  account: TargetAccount | null
  loading?: boolean
  className?: string
}


function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const renderDiff = (diff: number) => {
  if (diff > 0) {
    return <span className="text-xs text-green-500 ml-1">↑{formatNumber(diff)}</span>
  } else if (diff < 0) {
    return <span className="text-xs text-red-500 ml-1">↓{formatNumber(Math.abs(diff))}</span>
  }
  return null
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
  useResponsive()
  useTouchFriendly()

  const latest_snapshot = account?.snapshots && account.snapshots.length > 0 ? account.snapshots[0] : null
  const prev_snapshot = account?.snapshots && account.snapshots.length > 1 ? account.snapshots[1] : null

  const subscriberDiff = latest_snapshot && prev_snapshot ? (latest_snapshot.subscriber_count ?? 0) - (prev_snapshot.subscriber_count ?? 0) : 0
  const viewsDiff = latest_snapshot && prev_snapshot ? (latest_snapshot.total_views ?? 0) - (prev_snapshot.total_views ?? 0) : 0
  const videosDiff = latest_snapshot && prev_snapshot ? (latest_snapshot.total_videos_count ?? 0) - (prev_snapshot.total_videos_count ?? 0) : 0

  const accountAge = account?.published_at ?
    Math.floor((new Date().getTime() - new Date(account.published_at).getTime()) / (1000 * 60 * 60 * 24)) : 0

  const statItems = [
    {
      title: "Subscribers",
      value: latest_snapshot?.subscriber_count ? (
        <>
          {formatNumber(latest_snapshot.subscriber_count)}
          {renderDiff(subscriberDiff)}
        </>
      ) : (
        'N/A'
      ),
      icon: <Users className="h-4 w-4" />,
      description: latest_snapshot?.subscriber_count ? `${latest_snapshot.subscriber_count.toLocaleString()} total subscribers` : undefined,
    },
    {
      title: "Account Created",
      value: formatDate(account?.published_at || null),
      icon: <Calendar className="h-4 w-4" />,
      description: account?.published_at ? `${accountAge} days ago` : undefined,
    },
    {
      title: "Total Videos",
      value: latest_snapshot?.total_videos_count ? (
        <>
          {formatNumber(latest_snapshot.total_videos_count)}
          {renderDiff(videosDiff)}
        </>
      ) : (
        'N/A'
      ),
      icon: <Video className="h-4 w-4" />,
      description: latest_snapshot?.total_videos_count ? `${latest_snapshot.total_videos_count.toLocaleString()} videos` : "Videos in this account",
    },
    {
      title: "Total Views",
      value: latest_snapshot?.total_views ? (
        <>
          {formatNumber(latest_snapshot.total_views)}
          {renderDiff(viewsDiff)}
        </>
      ) : (
        'N/A'
      ),
      icon: <Eye className="h-4 w-4" />,
      description: "Across all videos",
    },
    {
      title: "Last Crawled",
      value: getRelativeTime(account?.last_crawled_at || null),
      icon: <Clock className="h-4 w-4" />,
      description: account?.last_crawled_at ? formatDate(account.last_crawled_at) : 'Never crawled',
    }
  ];

  return (
    <Card className={className}>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
          {statItems.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 text-muted-foreground">
                {item.icon}
                <p className="text-sm font-medium">{item.title}</p>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{item.value}</div>
              )}
              {loading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}