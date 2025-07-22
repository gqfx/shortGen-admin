import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Download, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Bug,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { errorLogger, ErrorLog, ErrorMetrics, getErrorMetrics, exportErrorLogs, clearErrorLogs } from '@/utils/error-logging'

export function ErrorMonitoringDashboard() {
  const [metrics, setMetrics] = useState<ErrorMetrics | null>(null)
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedComponent, setSelectedComponent] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, selectedComponent, selectedLevel])

  const loadData = () => {
    setIsLoading(true)
    try {
      const currentMetrics = getErrorMetrics()
      const currentLogs = errorLogger.getLogs()
      
      setMetrics(currentMetrics)
      setLogs(currentLogs)
    } catch (error) {
      console.error('Failed to load error data:', error)
      toast.error('Failed to load error monitoring data')
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedComponent) {
      filtered = filtered.filter(log => log.component === selectedComponent)
    }

    if (selectedLevel) {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }

    setFilteredLogs(filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ))
  }

  const handleExportLogs = () => {
    try {
      const exportData = exportErrorLogs()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Error logs exported successfully')
    } catch (error) {
      toast.error('Failed to export error logs')
    }
  }

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
      clearErrorLogs()
      loadData()
      toast.success('Error logs cleared')
    }
  }

  const handleResolveError = (errorId: string) => {
    errorLogger.resolveError(errorId)
    loadData()
    toast.success('Error marked as resolved')
  }

  const getComponentList = () => {
    const components = new Set(logs.map(log => log.component))
    return Array.from(components).sort()
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'info': return 'outline'
      default: return 'outline'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading error monitoring data...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Error Monitoring Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleClearLogs} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.totalErrors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.recentErrors.length}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Component</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(metrics.errorsByComponent)[0] || 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {Object.values(metrics.errorsByComponent)[0] || 0} errors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Types</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(metrics.errorsByType).length}</div>
              <p className="text-xs text-muted-foreground">Different types</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="top-errors">Top Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="component">Component</Label>
                  <select
                    id="component"
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">All Components</option>
                    {getComponentList().map(component => (
                      <option key={component} value={component}>{component}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">All Levels</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Logs ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No error logs found matching the current filters.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelColor(log.level) as any}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{log.component}</span>
                          {log.action && (
                            <span className="text-sm text-muted-foreground">
                              → {log.action}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {getTimeAgo(log.timestamp)}
                          </span>
                          {log.resolved ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Button
                              onClick={() => handleResolveError(log.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm">{log.message}</p>
                      
                      <div className="text-xs text-muted-foreground">
                        <div>ID: {log.id}</div>
                        <div>Time: {formatTimestamp(log.timestamp)}</div>
                        <div>URL: {log.url}</div>
                        {log.userId && <div>User: {log.userId}</div>}
                      </div>

                      {log.stack && process.env.NODE_ENV === 'development' && (
                        <details className="text-xs">
                          <summary className="cursor-pointer">Stack Trace</summary>
                          <pre className="bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Errors by Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.errorsByComponent).map(([component, count]) => (
                      <div key={component} className="flex items-center justify-between">
                        <span>{component}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Errors by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(metrics.errorsByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="top-errors" className="space-y-4">
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Most Frequent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.topErrors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No frequent errors found.
                    </div>
                  ) : (
                    metrics.topErrors.map((error, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="destructive">{error.count} occurrences</Badge>
                          <span className="text-sm text-muted-foreground">
                            Last: {getTimeAgo(error.lastOccurred)}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{error.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}