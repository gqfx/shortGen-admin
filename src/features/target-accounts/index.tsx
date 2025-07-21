import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Search, Filter, Edit, Trash2, RefreshCw, Video, History } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TargetAccountsProvider, useTargetAccounts } from './context/target-accounts-context'
import { TargetAccountDialogs } from './components/target-account-dialogs'
import { CrawlManagement } from './components/crawl-management'
import { VideoManagement } from './components/video-management'
import { TargetAccount } from '@/lib/api'

function TargetAccountsContent() {
  const {
    targetAccounts,
    loading,
    error,
    pagination,
    filters,
    navigationState,
    deleteTargetAccount,
    setFilters,
    setPagination,
    resetFilters,
    navigateToAccountDetail,
    openProfilePage,
    triggerAccountCrawl,
    batchTriggerCrawl,
    getAccountVideos,
  } = useTargetAccounts()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTargetAccount, setEditingTargetAccount] = useState<TargetAccount | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<TargetAccount | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [crawlLoading, setCrawlLoading] = useState<string | null>(null)
  const [crawlDialogOpen, setCrawlDialogOpen] = useState(false)
  const [crawlAccount, setCrawlAccount] = useState<TargetAccount | null>(null)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [videoAccount, setVideoAccount] = useState<TargetAccount | null>(null)

  const handleEdit = (account: TargetAccount) => {
    setEditingTargetAccount(account)
    setEditOpen(true)
  }

  const handleDelete = (account: TargetAccount) => {
    setAccountToDelete(account)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (accountToDelete) {
      await deleteTargetAccount(accountToDelete.id)
      setDeleteDialogOpen(false)
      setAccountToDelete(null)
    }
  }

  const handleTriggerCrawl = (account: TargetAccount) => {
    setCrawlAccount(account)
    setCrawlDialogOpen(true)
  }

  const handleBatchCrawl = () => {
    if (selectedAccounts.length === 0) return
    setCrawlDialogOpen(true)
  }

  const handleViewVideos = (account: TargetAccount) => {
    setVideoAccount(account)
    setVideoDialogOpen(true)
  }

  const handleAccountClick = (account: TargetAccount) => {
    navigateToAccountDetail(account.id)
  }

  const handleAvatarClick = (e: React.MouseEvent, account: TargetAccount) => {
    e.stopPropagation() // Prevent row click
    openProfilePage(account.profile_url)
  }

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(filteredAccounts.map(account => account.id))
    }
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

  const getFrequencyBadge = (frequency: string) => {
    const variants = {
      hourly: 'destructive',
      daily: 'default',
      weekly: 'secondary',
    } as const

    return (
      <Badge variant={variants[frequency as keyof typeof variants] || 'default'}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    )
  }

  const filteredAccounts = targetAccounts.filter(account =>
    account.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.category && account.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading target accounts: {error}</p>
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
          <h1 className="text-3xl font-bold">Target Accounts</h1>
          <p className="text-muted-foreground">
            Manage target accounts for monitoring and analysis
          </p>
          {selectedAccounts.length > 0 && (
            <p className="text-sm text-blue-600 mt-1">
              {selectedAccounts.length} account(s) selected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedAccounts.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBatchCrawl}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Batch Crawl ({selectedAccounts.length})
            </Button>
          )}
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Target Account
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{targetAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Accounts being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <span className="text-2xl">🟢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targetAccounts.filter(a => a.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targetAccounts.filter(a => a.is_verified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Verified accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Added</CardTitle>
            <span className="text-2xl">🆕</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targetAccounts.filter(a => {
                if (!a.created_at) return false
                const created = new Date(a.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return created > weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Added this week
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
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[300px]"
              />
            </div>



            <Select
              value={filters.isActive !== undefined ? filters.isActive.toString() : 'all'}
              onValueChange={(value) => setFilters({ isActive: value === 'all' ? undefined : value === 'true' })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
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
          <CardTitle>Target Accounts ({filteredAccounts.length})</CardTitle>
          <CardDescription>
            A list of target accounts configured for monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Monitor Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Crawled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow 
                    key={account.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleAccountClick(account)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={() => toggleAccountSelection(account.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar 
                          className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20"
                          onClick={(e) => handleAvatarClick(e, account)}
                        >
                          <AvatarImage src={account.avatar_url || undefined} alt={account.display_name} />
                          <AvatarFallback>
                            {account.display_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{account.display_name}</p>
                            {account.is_verified && (
                              <Badge variant="secondary" className="text-xs">✓</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{account.username || account.account_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {account.category ? 
                          account.category.charAt(0).toUpperCase() + account.category.slice(1) : 
                          'Uncategorized'
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {account.monitor_frequency ? getFrequencyBadge(account.monitor_frequency) : (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {account.last_crawled_at ? (
                        <span className="text-sm">
                          {new Date(account.last_crawled_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(account)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No target accounts found</p>
              <Button onClick={() => setCreateOpen(true)} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add First Target Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TargetAccountDialogs
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        editingTargetAccount={editingTargetAccount}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={confirmDelete}
        title="Delete Target Account"
        desc={`Are you sure you want to delete "${accountToDelete?.display_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelBtnText="Cancel"
        destructive={true}
      />

      <CrawlManagement
        open={crawlDialogOpen}
        onOpenChange={setCrawlDialogOpen}
        accountId={crawlAccount?.id}
        accountIds={selectedAccounts.length > 0 ? selectedAccounts : undefined}
        accountName={crawlAccount?.display_name}
      />

      <VideoManagement
        open={videoDialogOpen}
        onOpenChange={setVideoDialogOpen}
        accountId={videoAccount?.id || ''}
        accountName={videoAccount?.display_name || ''}
      />
    </div>
  )
}

export function TargetAccountsPage() {
  return (
    <TargetAccountsProvider>
      <TargetAccountsContent />
    </TargetAccountsProvider>
  )
}