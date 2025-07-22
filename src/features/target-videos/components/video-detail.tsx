
import { useParams, Link } from '@tanstack/react-router'
import { VideoDetailProvider, useVideoDetail } from '../context/video-detail-context'
import { VideoInformation } from './video-information'
import { VideoPlayer } from './video-player'
import { AnalysisResults } from './analysis-results'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

function VideoDetailContent() {
  const { 
    video, 
    loading, 
    error, 
    currentTime, 
    updateCurrentTime, 
    seekToTime, 
    highlightedScene 
  } = useVideoDetail()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Video information skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/target-accounts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Accounts
              </Link>
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/target-accounts">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Accounts
              </Link>
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>Video not found</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/target-accounts">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Accounts
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            / Video Details
          </span>
        </div>

        {/* Video Information */}
        <VideoInformation video={video} />

        {/* Video Player and Analysis Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Player/Thumbnail Component */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Video Player</h2>
            <VideoPlayer video={video} />
          </div>

          {/* Analysis Results */}
          <AnalysisResults />
        </div>
      </div>
    </div>
  )
}

export function VideoDetailPage() {
  const { videoId } = useParams({ from: '/target-videos/$videoId' })

  return (
    <VideoDetailProvider videoId={videoId}>
      <VideoDetailContent />
    </VideoDetailProvider>
  )
}