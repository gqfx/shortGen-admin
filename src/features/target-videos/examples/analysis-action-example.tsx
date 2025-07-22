import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AnalysisAction } from '../components/analysis-action'
import { VideoDetailProvider } from '../context/video-detail-context'

interface AnalysisActionExampleProps {
  className?: string
}

export function AnalysisActionExample({ className }: AnalysisActionExampleProps) {
  // Example video IDs - replace with actual video IDs from your system
  const exampleVideoIds = [
    'example-video-1', // Downloaded but not analyzed
    'example-video-2', // Downloaded and analyzed
    'example-video-3'  // Downloaded with failed analysis
  ]

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Analysis Action Component Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Default Variant */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Default Variant</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Full status display with detailed information and progress tracking.
            </p>
            <VideoDetailProvider videoId={exampleVideoIds[0]}>
              <AnalysisAction variant="default" />
            </VideoDetailProvider>
          </div>

          <Separator />

          {/* Compact Variant */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Minimal display suitable for lists and tight spaces.
            </p>
            <div className="flex items-center gap-4">
              <VideoDetailProvider videoId={exampleVideoIds[0]}>
                <AnalysisAction variant="compact" />
              </VideoDetailProvider>
              <VideoDetailProvider videoId={exampleVideoIds[1]}>
                <AnalysisAction variant="compact" />
              </VideoDetailProvider>
            </div>
          </div>

          <Separator />

          {/* Inline Variant */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Inline Variant</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Button-only display for action bars and toolbars.
            </p>
            <div className="flex items-center gap-2">
              <VideoDetailProvider videoId={exampleVideoIds[0]}>
                <AnalysisAction variant="inline" />
              </VideoDetailProvider>
              <VideoDetailProvider videoId={exampleVideoIds[2]}>
                <AnalysisAction variant="inline" />
              </VideoDetailProvider>
            </div>
          </div>

          <Separator />

          {/* Usage Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
            <div className="space-y-4">
              
              {/* Video Player Integration */}
              <div>
                <h4 className="font-medium mb-2">In Video Player</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use default variant for comprehensive status display.
                </p>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <VideoDetailProvider videoId={exampleVideoIds[0]}>
                    <AnalysisAction variant="default" />
                  </VideoDetailProvider>
                </div>
              </div>

              {/* Video List Integration */}
              <div>
                <h4 className="font-medium mb-2">In Video Lists</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use compact variant for space-efficient display.
                </p>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Example Video Title</h5>
                      <p className="text-sm text-muted-foreground">Published 2 days ago</p>
                    </div>
                    <VideoDetailProvider videoId={exampleVideoIds[0]}>
                      <AnalysisAction variant="compact" />
                    </VideoDetailProvider>
                  </div>
                </div>
              </div>

              {/* Action Bar Integration */}
              <div>
                <h4 className="font-medium mb-2">In Action Bars</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use inline variant for button-only display.
                </p>
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Video Actions:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <VideoDetailProvider videoId={exampleVideoIds[0]}>
                        <AnalysisAction variant="inline" />
                      </VideoDetailProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Component Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Component Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Status Tracking</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Analysis not started</li>
                  <li>• Analysis queued (pending)</li>
                  <li>• Analysis in progress</li>
                  <li>• Analysis completed</li>
                  <li>• Analysis failed</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">User Actions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Trigger analysis for downloaded videos</li>
                  <li>• Retry failed analysis</li>
                  <li>• View analysis progress</li>
                  <li>• Display analysis results summary</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}