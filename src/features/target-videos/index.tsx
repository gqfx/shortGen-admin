import React, { useState } from 'react'
import { Search, Filter, ExternalLink, Play, Download, Clock, BrainCircuit, Loader2 } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VideosProvider, useVideos } from './context/videos-context'
import { targetAccountAnalysisApi } from '@/lib/api'
import { toast } from 'sonner'
import { handleServerError } from '@/utils/handle-server-error'

function VideosContent() {
  const {
    videos,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    triggerVideoDownload,
    pagination,
    setPagination,
  } = useVideos()

  const [searchTerm, setSearchTerm] = useState('')
  const [analyzingVideoId, setAnalyzingVideoId] = useState<string | null>(null)

  const handleAnalyzeVideo = async (videoId: string) => {
    setAnalyzingVideoId(videoId)
    try {
      const response = await targetAccountAnalysisApi.triggerVideoLensAnalysis(videoId)
      if (response.data.code === 0) {
        toast.success('Video analysis task started', {
          description: `Job ID: ${response.data.data.job_id}`,
        })
      } else {
        toast.error('Failed to start analysis', {
          description: response.data.msg,
        })
      }
    } catch (error) {
      toast.error('Failed to start analysis', {
        description: handleServerError(error),
      })
    } finally {
      setAnalyzingVideoId(null)
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
    <div className="space-y-6 p-6">
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

            <Select
              value={filters.sortBy || 'published_at'}
              onValueChange={(value) => setFilters({ sortBy: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published_at">Sort by Date</SelectItem>
                <SelectItem value="views_count">Sort by Views</SelectItem>
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
                  <TableHead>Views</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Duration</TableHead>
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
                        <div className="max-w-[200px] truncate">
                          <p className="font-medium" title={video.title}>{video.title}</p>
                          <p className="text-sm text-muted-foreground">ID: {video.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {video.latest_snapshot ? (
                        <span className="text-sm font-medium">
                          {video.latest_snapshot.views_count.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {video.latest_snapshot ? (
                        <span className="text-sm font-medium">
                          {video.latest_snapshot.likes_count.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {video.latest_snapshot ? (
                        <span className="text-sm font-medium">
                          {video.latest_snapshot.comments_count.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDuration(video.duration)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(video.published_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {video.is_downloaded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAnalyzeVideo(video.id)}
                            disabled={analyzingVideoId === video.id}
                          >
                            {analyzingVideoId === video.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <BrainCircuit className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {!video.is_downloaded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => triggerVideoDownload([video.id])}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(video.video_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
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
        <div className="flex items-center justify-end space-x-2 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination({ skip: pagination.skip - pagination.limit })}
            disabled={pagination.skip === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination({ skip: pagination.skip + pagination.limit })}
            disabled={filteredVideos.length < pagination.limit}
          >
            Next
          </Button>
        </div>
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