import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface BatchOperationResult {
  success: number
  failed: number
  total: number
  errors: string[]
}

interface BatchResultDisplayProps {
  isLoading: boolean
  result: BatchOperationResult | null
  showResult: boolean
}

export function BatchResultDisplay({
  isLoading,
  result,
  showResult,
}: BatchResultDisplayProps) {
  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing batch download...
        </div>
        <Progress value={undefined} className="h-2" />
      </div>
    )
  }

  if (showResult && result) {
    return (
      <Alert className={`mt-4 ${result.failed > 0 ? 'border-destructive' : 'border-green-500'}`}>
        <div className="flex items-center gap-2">
          {result.failed > 0 ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription>
            <div className="space-y-1">
              <div>
                Batch operation completed: {result.success} successful, {result.failed} failed out of {result.total} total
              </div>
              {result.errors.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Errors: {result.errors.join(', ')}
                </div>
              )}
            </div>
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return null
}