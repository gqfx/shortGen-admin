import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  Hash,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useVideoDetail } from '../context/video-detail-context'
import { AnalysisAction } from './analysis-action'
import { SceneAnalysisSlider } from './scene-analysis-slider'
import { cn } from '@/lib/utils'

interface AnalysisResultsProps {
  className?: string
}

export function AnalysisResults({ className }: AnalysisResultsProps) {
  const {
    video,
    analysis,
    loadingStates,
    errorStates,
    isVideoDownloaded,
    isAnalysisAvailable,
    fetchAnalysis,
    selectedSceneId,
    selectScene,
    highlightScene,
    seekToTime
  } = useVideoDetail()

  // Don't render if video is not available
  if (!video) {
    return null
  }

  // Show message if video is not downloaded
  if (!isVideoDownloaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Video must be downloaded before analysis results can be displayed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show loading state
  if (loadingStates.analysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading analysis data...</span>
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (errorStates.analysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Failed to load analysis data: {errorStates.analysis}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => video && fetchAnalysis(video.id)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Show analysis action if no analysis is available
  if (!analysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Brain className="w-4 h-4" />
              <AlertDescription>
                No analysis data available for this video. Start analysis to generate scene breakdowns and content summary.
              </AlertDescription>
            </Alert>
            <AnalysisAction variant="default" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show analysis results
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Status and Metadata */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AnalysisStatusIcon status={analysis.analysisStatus} />
              <span className="font-medium">
                <AnalysisStatusText status={analysis.analysisStatus} />
              </span>
            </div>
            <Badge 
              variant={analysis.analysisStatus === 'completed' ? 'default' : 'secondary'}
              className={getStatusBadgeClass(analysis.analysisStatus)}
            >
              {analysis.analysisStatus.toUpperCase()}
            </Badge>
          </div>

          {/* Analysis Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Analysis ID:</span>
              <span className="font-mono text-xs">{analysis.id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Completed:</span>
              <span>{new Date(analysis.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Analysis Results Content */}
        {analysis.analysisStatus === 'completed' && (
          <div className="space-y-6">
            {/* Scene Analysis Slider */}
            {analysis.scenes.length > 0 && (
              <SceneAnalysisSlider
                scenes={analysis.scenes}
                selectedSceneId={selectedSceneId}
                onSceneClick={(scene) => {
                  selectScene(scene.sceneId)
                  highlightScene(scene)
                }}
                onTimeNavigate={(timeInSeconds) => {
                  seekToTime(timeInSeconds)
                }}
              />
            )}

            {/* Scene Analysis Summary */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Scene Analysis Summary
              </h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">
                    {analysis.scenes.length} scenes detected
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Video has been analyzed and broken down into {analysis.scenes.length} distinct scenes with timestamps and descriptions.
                </p>
              </div>
            </div>

            {/* Content Summary */}
            {analysis.summary && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Summary
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {analysis.scenes.length}
                </div>
                <div className="text-sm text-purple-600">Scenes</div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {analysis.summary ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-indigo-600">Summary</div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-teal-700">
                  {getAverageConfidence(analysis.scenes)}%
                </div>
                <div className="text-sm text-teal-600">Avg Confidence</div>
              </div>
            </div>


          </div>
        )}

        {/* Analysis in Progress */}
        {(analysis.analysisStatus === 'pending' || analysis.analysisStatus === 'processing') && (
          <div className="space-y-4">
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                Analysis is {analysis.analysisStatus}. Results will appear here once completed.
              </AlertDescription>
            </Alert>
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">
                AI is analyzing video content...
              </p>
            </div>
          </div>
        )}

        {/* Analysis Failed */}
        {analysis.analysisStatus === 'failed' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Analysis failed to complete. You can retry the analysis process.
              </AlertDescription>
            </Alert>
            <AnalysisAction variant="default" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper Components
function AnalysisStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-600" />
    case 'processing':
      return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'failed':
      return <AlertCircle className="w-5 h-5 text-red-600" />
    default:
      return <Brain className="w-5 h-5 text-purple-600" />
  }
}

function AnalysisStatusText({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return 'Analysis Queued'
    case 'processing':
      return 'Analysis in Progress'
    case 'completed':
      return 'Analysis Complete'
    case 'failed':
      return 'Analysis Failed'
    default:
      return 'Analysis Status Unknown'
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return ''
  }
}

function getAverageConfidence(scenes: Array<{ confidence: number }>): number {
  if (scenes.length === 0) return 0
  const total = scenes.reduce((sum, scene) => sum + scene.confidence, 0)
  return Math.round((total / scenes.length) * 100)
}