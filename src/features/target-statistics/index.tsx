import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Users, Video, Eye, ThumbsUp, Calendar, BarChart3, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatisticsProvider, useStatistics } from './context/statistics-context'

function StatisticsContent() {
  const {
    targetAccounts,
    selectedAccountId,
    accountStatistics,
    growthTrends,
    trendingVideos,
    analyticsSummary,
    loading,
    error,
    setSelectedAccount,
    fetchAccountStatistics,
    fetchGrowthTrends,
    fetchTrendingVideos,
  } = useStatistics()

  const [statisticsDays, setStatisticsDays] = useState(30)
  const [trendsDays, setTrendsDays] = useState(7)

  const selectedAccount = targetAccounts.find(acc => acc.id === selectedAccountId)
  const latestStats = accountStatistics[0] // Most recent stats

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatGrowthRate = (rate: number) => {
    return `${rate >= 0 ? '+' : ''}${rate.toFixed(2)}%`
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '📺'
      case 'tiktok':
        return '🎵'
      case 'bilibili':
        return '📹'
      default:
        return '📺'
    }
  }

  const handleAccountChange = (accountId: string) => {
    setSelectedAccount(parseInt(accountId))
  }

  const handleStatisticsDaysChange = (days: string) => {
    const daysNum = parseInt(days)
    setStatisticsDays(daysNum)
    if (selectedAccountId) {
      fetchAccountStatistics(selectedAccountId, daysNum)
    }
  }

  const handleTrendsDaysChange = (days: string) => {
    const daysNum = parseInt(days)
    setTrendsDays(daysNum)
    if (selectedAccountId) {
      fetchGrowthTrends(selectedAccountId, daysNum)
      fetchTrendingVideos(selectedAccountId, 'views_count', daysNum)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading statistics: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Target Account Statistics</h1>
          <p className="text-muted-foreground">
            View analytics and growth trends for monitored accounts
          </p>
        </div>
      </div>

      {/* Account Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Account</CardTitle>
          <CardDescription>Choose an account to view detailed statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedAccountId?.toString() || ''} onValueChange={handleAccountChange}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select an account">
                  {selectedAccount && (
                    <div className="flex items-center space-x-2">
                      <span>{getPlatformIcon(selectedAccount.platform)}</span>
                      <span>{selectedAccount.display_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {targetAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <span>{getPlatformIcon(account.platform)}</span>
                      <span>{account.display_name}</span>
                      <Badge variant="outline" className="ml-2">
                        {account.platform}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statisticsDays.toString()} onValueChange={handleStatisticsDaysChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedAccount && (
        <>
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedAccount.avatar_url || undefined} alt={selectedAccount.display_name} />
                  <AvatarFallback>
                    {selectedAccount.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedAccount.display_name}</h2>
                  <p className="text-muted-foreground">@{selectedAccount.username}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{selectedAccount.category}</Badge>
                  {selectedAccount.is_verified && (
                    <Badge variant="secondary">✓ Verified</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Current Stats */}
          {latestStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Followers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(latestStats.followers_count)}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {latestStats.followers_growth >= 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                    )}
                    {formatGrowthRate(latestStats.followers_growth_rate)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(latestStats.total_videos_count)}</div>
                  <p className="text-xs text-muted-foreground">
                    Content library
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(latestStats.total_views)}</div>
                  <p className="text-xs text-muted-foreground">
                    All-time views
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(latestStats.total_likes)}</div>
                  <p className="text-xs text-muted-foreground">
                    All-time likes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Growth Trends */}
          {growthTrends && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Growth Trends</CardTitle>
                    <CardDescription>
                      Growth analysis for the last {trendsDays} days
                    </CardDescription>
                  </div>
                  <Select value={trendsDays.toString()} onValueChange={handleTrendsDaysChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Followers Growth</p>
                      <p className="text-2xl font-bold">{formatNumber(growthTrends.followers_trend)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Video className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Videos Added</p>
                      <p className="text-2xl font-bold">{growthTrends.videos_trend}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Daily Growth</p>
                      <p className="text-2xl font-bold">{formatNumber(growthTrends.avg_daily_growth)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Growth Rate</p>
                      <p className="text-2xl font-bold">{formatGrowthRate(growthTrends.total_growth_rate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historical Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Historical Statistics</CardTitle>
              <CardDescription>
                Statistics history for the last {statisticsDays} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountStatistics.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Videos</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountStatistics.slice(0, 10).map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(stat.collected_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatNumber(stat.followers_count)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {stat.followers_growth >= 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span className={stat.followers_growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {stat.followers_growth > 0 ? '+' : ''}{stat.followers_growth}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatNumber(stat.total_videos_count)}</TableCell>
                        <TableCell>{formatNumber(stat.total_views)}</TableCell>
                        <TableCell>{formatNumber(stat.total_likes)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No historical data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trending Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Videos</CardTitle>
              <CardDescription>
                Top performing videos from the last {trendsDays} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendingVideos.length > 0 ? (
                <div className="space-y-4">
                  {trendingVideos.map((video) => (
                    <div key={video.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-muted overflow-hidden">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.removeAttribute('style')
                            }}
                          />
                        ) : null}
                        <div className="flex h-full w-full items-center justify-center" style={{ display: video.thumbnail_url ? 'none' : 'flex' }}>
                          <Play className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-2">{video.title}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>Published: {new Date(video.published_at).toLocaleDateString()}</span>
                          <Badge variant="outline">{video.video_type}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.video_url, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No trending videos found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedAccount && !loading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Select an Account</h3>
              <p className="text-muted-foreground">
                Choose a target account from the dropdown above to view detailed statistics and analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      )}
    </div>
  )
}

export function TargetStatisticsPage() {
  return (
    <StatisticsProvider>
      <StatisticsContent />
    </StatisticsProvider>
  )
}