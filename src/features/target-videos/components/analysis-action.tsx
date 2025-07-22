import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw,
  CheckCircle,
  Brain,
  Zap
} from 'lucide-react'
import { useVideoDetail } from '../context/video-detail-context'
import { cn } from '@/lib/utils'

interface AnalysisActionProps {
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  showStatus?: boolean
}

export function AnalysisAction({ 
  className,
  variant = 'default',
  showStatus = true
}: AnalysisActionProps) {
  const {
    video,
    analysis,
    loadingStates,
    errorStates,
    isVideoDownloaded,
    isAnalysisAvailable,
    canTriggerAnalysis,
    triggerAnalysis
  } = useVideoDetail()

  if (!video) {
    return null
  }

  // Don't show if video is not downloaded
  if (!isVideoDownloaded) {
    return null
  }

  const handleTriggerAnalysis = async () => {
    if (canTriggerAnalysis) {
      await triggerAnalysis(video.id)
    }
  }

  const getAnalysisStatus = () => {
    if (!analysis) return 'not_started'
    return analysis.analysisStatus
  }

  const getStatusIcon = () => {
    const status = getAnalysisStatus()
    
    if (loadingStates.triggerAnalysis) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Brain className="w-4 h-4 text-purple-600" />
    }
  }

  const getStatusText = () => {
    const status = getAnalysisStatus()
    
    if (loadingStates.triggerAnalysis) {
      return 'Starting analysis...'
    }
    
    switch (status) {
      case 'pending':
        return 'Analysis Queued'
      case 'processing':
        return 'Analyzing Video...'
      case 'completed':
        return 'Analysis Complete'
      case 'failed':
        return 'Analysis Failed'
      default:
        return 'Ready to Analyze'
    }
  }

  const getStatusColor = () => {
    const status = getAnalysisStatus()
    
    if (loadingStates.triggerAnalysis) return 'text-blue-700'
    
    switch (status) {
      case 'pending':
        return 'text-yellow-700'
      case 'processing':
        return 'text-blue-700'
      case 'completed':
        return 'text-green-700'
      case 'failed':
        return 'text-red-700'
      default:
        return 'text-purple-700'
    }
  }

  const getBgColor = () => {
    const status = getAnalysisStatus()
    
    if (loadingStates.triggerAnalysis) return 'bg-blue-50 border-blue-200'
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-purple-50 border-purple-200'
    }
  }

  const isAnalysisInProgress = () => {
    const status = getAnalysisStatus()
    return loadingStates.triggerAnalysis || status === 'pending' || status === 'processing'
  }

  const canRetryAnalysis = () => {
    const status = getAnalysisStatus()
    return status === 'failed' && !loadingStates.triggerAnalysis
  }

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {canTriggerAnalysis ? (
          <Button
            onClick={handleTriggerAnalysis}
            disabled={loadingStates.triggerAnalysis}
            size="sm"
            variant="outline"
            className="h-8"
          >
            {loadingStates.triggerAnalysis ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Brain className="w-3 h-3 mr-1" />
            )}
            Analyze
          </Button>
        ) : showStatus && (
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className={cn("text-sm font-medium", getStatusColor())}>
              {getStatusText()}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Inline variant for button-only display
  if (variant === 'inline') {
    if (!canTriggerAnalysis && !canRetryAnalysis()) {
      return null
    }

    return (
      <Button
        onClick={handleTriggerAnalysis}
        disabled={loadingStates.triggerAnalysis}
        size="sm"
        variant={canRetryAnalysis() ? "destructive" : "default"}
        className={cn("gap-2", className)}
      >
        {loadingStates.triggerAnalysis ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : canRetryAnalysis() ? (
          <RefreshCw className="w-4 h-4" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        {canRetryAnalysis() ? 'Retry Analysis' : 'Analyze Video'}
      </Button>
    )
  }

  // Default variant - full status display
  return (
    <div className={cn("space-y-3", className)}>
      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={cn("text-sm font-medium", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>
        
        {(canTriggerAnalysis || canRetryAnalysis()) && (
          <Button
            onClick={handleTriggerAnalysis}
            disabled={loadingStates.triggerAnalysis}
            size="sm"
            variant={canRetryAnalysis() ? "destructive" : "default"}
            className="gap-2"
          >
            {loadingStates.triggerAnalysis ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : canRetryAnalysis() ? (
              <RefreshCw className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {canRetryAnalysis() ? 'Retry Analysis' : 'Analyze Video'}
          </Button>
        )}
      </div>

      {/* Status Card */}
      {showStatus && (
        <div className={cn("p-4 rounded-lg border", getBgColor())}>
          <div className="space-y-3">
            {/* Status Message */}
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div className="flex-1">
                <p className={cn("text-sm font-medium", getStatusColor())}>
                  {getStatusText()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAnalysisStatusDescription()}
                </p>
              </div>
            </div>

            {/* Progress Indicator for Processing */}
            {getAnalysisStatus() === 'processing' && (
              <div className="space-y-2">
                <Progress value={undefined} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Analyzing video content and generating scene breakdowns...
                </p>
              </div>
            )}

            {/* Error Details */}
            {errorStates.triggerAnalysis && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-medium mb-1">Analysis Error</p>
                <p className="text-xs text-red-600">{errorStates.triggerAnalysis}</p>
              </div>
            )}

            {/* Analysis Results Summary */}
            {isAnalysisAvailable && analysis && (
              <div className="p-3 bg-green-100 border border-green-200 rounded-md">
                <p className="text-sm text-green-700 font-medium mb-2">Analysis Complete</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-green-600">Scenes Detected:</span>
                    <span className="ml-1 font-medium">{analysis.scenes.length}</span>
                  </div>
                  <div>
                    <span className="text-green-600">Summary:</span>
                    <span className="ml-1 font-medium">
                      {analysis.summary ? 'Available' : 'Not available'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Analysis completed on {new Date(analysis.updatedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Analysis Status Badge */}
            <div className="flex items-center justify-between">
              <Badge 
                variant={getAnalysisStatus() === 'completed' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs",
                  getAnalysisStatus() === 'completed' && "bg-green-100 text-green-800 border-green-200",
                  getAnalysisStatus() === 'processing' && "bg-blue-100 text-blue-800 border-blue-200",
                  getAnalysisStatus() === 'pending' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                  getAnalysisStatus() === 'failed' && "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {getStatusText()}
              </Badge>
              
              {analysis && (
                <span className="text-xs text-muted-foreground">
                  ID: {analysis.id}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function getAnalysisStatusDescription(): string {
    const status = getAnalysisStatus()
    
    switch (status) {
      case 'not_started':
        return 'Click the analyze button to start video content analysis'
      case 'pending':
        return 'Analysis task has been queued and will start shortly'
      case 'processing':
        return 'AI is analyzing video content to identify scenes and generate insights'
      case 'completed':
        return 'Video analysis is complete. You can now view scene breakdowns and summary'
      case 'failed':
        return 'Analysis failed due to an error. You can retry the analysis'
      default:
        return 'Analysis status unknown'
    }
  }
}