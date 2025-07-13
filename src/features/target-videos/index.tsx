import React, { useState } from 'react'
import { Search, Filter, ExternalLink, Play, Download, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VideosProvider, useVideos } from './context/videos-context'

function VideosContent() {
  const {
    videos,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
  } = useVideos()

  const [searchTerm, setSearchTerm] = useState('')

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

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case 'short':
        return '⚡'
      case 'long':
        return '📹'
      case 'live':
        return '🔴'
      default:
        return '📹'
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.platform_video_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading videos: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Target Videos</h1>
          <p className="text-muted-foreground">
            View videos discovered and tracked by the analysis system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <span className="text-2xl">🎬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">
              Videos discovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloaded</CardTitle>
            <span className="text-2xl">💾</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => v.is_downloaded).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Videos downloaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Short Videos</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => v.video_type === 'short').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Short format videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Long Videos</CardTitle>
            <span className="text-2xl">📹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => v.video_type === 'long').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Long format videos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[300px]"
              />
            </div>

            <Input
              type="number"
              placeholder="Account ID"
              value={filters.accountId || ''}
              onChange={(e) => setFilters({ accountId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-[150px]"
            />

            <Select
              value={filters.videoType || 'all'}
              onValueChange={(value) => setFilters({ videoType: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Video Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isDownloaded !== undefined ? filters.isDownloaded.toString() : 'all'}
              onValueChange={(value) => setFilters({ isDownloaded: value === 'all' ? undefined : value === 'true' })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Download Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Downloaded</SelectItem>
                <SelectItem value="false">Not Downloaded</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Videos ({filteredVideos.length})</CardTitle>
          <CardDescription>
            Video content discovered and tracked by the analysis system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-28 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[300px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Downloaded</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
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
                        <div className="max-w-[300px]">
                          <p className="font-medium line-clamp-2">{video.title}</p>
                          <p className="text-sm text-muted-foreground">ID: {video.platform_video_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{getPlatformIcon(video.platform)}</span>
                        <span className="capitalize">{video.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{getVideoTypeIcon(video.video_type)}</span>
                        <span className="capitalize">{video.video_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDuration(video.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{video.account_id}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={video.is_downloaded ? 'default' : 'secondary'}>
                          {video.is_downloaded ? (
                            <>
                              <Download className="mr-1 h-3 w-3" />
                              Downloaded
                            </>
                          ) : (
                            'Not Downloaded'
                          )}
                        </Badge>
                        {video.is_downloaded && video.local_file_size && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(video.local_file_size)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(video.published_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.video_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredVideos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No videos found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Videos will appear here as they are discovered by the analysis system
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function TargetVideosPage() {
  return (
    <VideosProvider>
      <VideosContent />
    </VideosProvider>
  )
}