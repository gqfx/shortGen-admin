import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, RefreshCw, MoreVertical } from 'lucide-react'
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { TargetAccountsProvider, useTargetAccounts } from './context/target-accounts-context'
import { TargetAccountDialogs } from './components/target-account-dialogs'
import { CrawlManagement } from './components/crawl-management'
import { VideoManagement } from './components/video-management'
import { TargetAccount } from '@/lib/api'
import { useResponsive, useTouchFriendly } from '@/hooks/use-responsive'
import { useAccessibility } from '@/hooks/use-accessibility'

function TargetAccountsContent() {
  const {
    targetAccounts,
    loading,
    error,
    filters,
    deleteTargetAccount,
    setFilters,
    resetFilters,
    navigateToAccountDetail,
    openProfilePage,
  } = useTargetAccounts()

  const { isMobile, isTablet, isDesktop } = useResponsive()
  const { touchTargetSize, touchSpacing, touchPadding } = useTouchFriendly()
  const { announceStatus, announceError, announceSuccess } = useAccessibility()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTargetAccount, setEditingTargetAccount] = useState<TargetAccount | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<TargetAccount | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [crawlDialogOpen, setCrawlDialogOpen] = useState(false)
  const [crawlAccount, setCrawlAccount] = useState<TargetAccount | null>(null)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [videoAccount, setVideoAccount] = useState<TargetAccount | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

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
      try {
        await deleteTargetAccount(accountToDelete.id)
        announceSuccess(`Account ${accountToDelete.display_name} deleted successfully`)
        setDeleteDialogOpen(false)
        setAccountToDelete(null)
      } catch (error) {
        announceError(`Failed to delete account ${accountToDelete.display_name}`)
      }
    }
  }


  const handleBatchCrawl = () => {
    if (selectedAccounts.length === 0) {
      announceError('No accounts selected for batch crawl')
      return
    }
    announceStatus(`Starting batch crawl for ${selectedAccounts.length} accounts`)
    setCrawlDialogOpen(true)
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
    <div className={`space-y-4 md:space-y-6 ${isMobile ? 'p-3' : 'p-4 md:p-6'}`} role="main" aria-label="Target Accounts Management">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#accounts-table" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        onFocus={(e) => e.currentTarget.scrollIntoView()}
      >
        Skip to accounts table
      </a>
      
      {/* Responsive Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`} id="page-title">Target Accounts</h1>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`} aria-describedby="page-title">
            Manage target accounts for monitoring and analysis
          </p>
          {selectedAccounts.length > 0 && (
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 mt-1`} 
               role="status" 
               aria-live="polite"
               aria-atomic="true"
               aria-label={`${selectedAccounts.length} accounts selected`}>
              {selectedAccounts.length} account(s) selected
            </p>
          )}
        </div>
        
        {/* Responsive Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`} role="toolbar" aria-label="Account actions">
          {selectedAccounts.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBatchCrawl}
              size={isMobile ? "default" : "default"}
              className={`${touchTargetSize} ${isMobile ? 'w-full justify-center' : ''}`}
              aria-label={`Start batch crawl for ${selectedAccounts.length} selected accounts`}
              aria-describedby="selected-count"
            >
              <RefreshCw className={`${isMobile ? 'mr-2' : 'mr-2'} h-4 w-4`} aria-hidden="true" />
              {isMobile ? `Batch Crawl (${selectedAccounts.length})` : `Batch Crawl (${selectedAccounts.length})`}
            </Button>
          )}
          <Button 
            onClick={() => setCreateOpen(true)}
            size={isMobile ? "default" : "default"}
            className={`${touchTargetSize} ${isMobile ? 'w-full justify-center' : ''}`}
            aria-label="Add new target account"
          >
            <Plus className={`${isMobile ? 'mr-2' : 'mr-2'} h-4 w-4`} aria-hidden="true" />
            {isMobile ? 'Add Account' : 'Add Target Account'}
          </Button>
        </div>
      </div>

      {/* Responsive Stats Cards */}
      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`} role="region" aria-label="Account statistics">
        <Card role="img" aria-label={`Total accounts: ${targetAccounts.length}`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'} ${isMobile ? touchPadding : ''}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Total Accounts</CardTitle>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'}`} aria-hidden="true">👥</span>
          </CardHeader>
          <CardContent className={isMobile ? touchPadding : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`} aria-label={`${targetAccounts.length} total accounts`}>{targetAccounts.length}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              {isMobile ? 'Monitored' : 'Accounts being monitored'}
            </p>
          </CardContent>
        </Card>

        <Card role="img" aria-label={`Active accounts: ${targetAccounts.filter(a => a.is_active).length}`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'} ${isMobile ? touchPadding : ''}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Active</CardTitle>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'}`} aria-hidden="true">🟢</span>
          </CardHeader>
          <CardContent className={isMobile ? touchPadding : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`} aria-label={`${targetAccounts.filter(a => a.is_active).length} active accounts`}>
              {targetAccounts.filter(a => a.is_active).length}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              {isMobile ? 'Active' : 'Currently monitoring'}
            </p>
          </CardContent>
        </Card>

        <Card role="img" aria-label={`Verified accounts: ${targetAccounts.filter(a => a.is_verified).length}`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'} ${isMobile ? touchPadding : ''}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Verified</CardTitle>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'}`} aria-hidden="true">✅</span>
          </CardHeader>
          <CardContent className={isMobile ? touchPadding : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`} aria-label={`${targetAccounts.filter(a => a.is_verified).length} verified accounts`}>
              {targetAccounts.filter(a => a.is_verified).length}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              Verified
            </p>
          </CardContent>
        </Card>

        <Card role="img" aria-label={`Recent accounts: ${targetAccounts.filter(a => {
                if (!a.created_at) return false
                const created = new Date(a.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return created > weekAgo
              }).length} added this week`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1' : 'pb-2'} ${isMobile ? touchPadding : ''}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Recent</CardTitle>
            <span className={`${isMobile ? 'text-lg' : 'text-2xl'}`} aria-hidden="true">🆕</span>
          </CardHeader>
          <CardContent className={isMobile ? touchPadding : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`} aria-label={`${targetAccounts.filter(a => {
                if (!a.created_at) return false
                const created = new Date(a.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return created > weekAgo
              }).length} accounts added this week`}>
              {targetAccounts.filter(a => {
                if (!a.created_at) return false
                const created = new Date(a.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return created > weekAgo
              }).length}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
              {isMobile ? 'This week' : 'Added this week'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Responsive Filters */}
      <Card>
        <CardHeader className={isMobile ? touchPadding : ''}>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
            <CardTitle className={isMobile ? 'text-base' : ''}>Filters</CardTitle>
            {isMobile && (
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className={`${touchTargetSize} w-full`}>
                    <Filter className="mr-2 h-4 w-4" />
                    Show Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold">Filter Accounts</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <Input
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={touchTargetSize}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={filters.isActive !== undefined ? filters.isActive.toString() : 'all'}
                          onValueChange={(value) => setFilters({ isActive: value === 'all' ? undefined : value === 'true' })}
                        >
                          <SelectTrigger className={touchTargetSize}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col space-y-2 pt-4">
                        <Button variant="outline" onClick={resetFilters} className={touchTargetSize}>
                          <Filter className="mr-2 h-4 w-4" />
                          Reset Filters
                        </Button>
                        <Button onClick={() => setFiltersOpen(false)} className={touchTargetSize}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </CardHeader>
        {!isMobile && (
          <CardContent>
            <div className={`flex ${isTablet ? 'flex-col space-y-3' : 'flex-wrap gap-4'}`}>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${isTablet ? 'w-full' : 'w-[300px]'}`}
                />
              </div>

              <Select
                value={filters.isActive !== undefined ? filters.isActive.toString() : 'all'}
                onValueChange={(value) => setFilters({ isActive: value === 'all' ? undefined : value === 'true' })}
              >
                <SelectTrigger className={`${isTablet ? 'w-full' : 'w-[180px]'}`}>
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
        )}
      </Card>

      {/* Responsive Table/Cards */}
      <Card>
        <CardHeader className={isMobile ? touchPadding : ''}>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
            <div>
              <CardTitle className={isMobile ? 'text-base' : ''}>
                Target Accounts ({filteredAccounts.length})
              </CardTitle>
              <CardDescription className={isMobile ? 'text-xs' : ''}>
                {isMobile ? 'Configured accounts' : 'A list of target accounts configured for monitoring'}
              </CardDescription>
            </div>
            {!isMobile && filteredAccounts.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className={isMobile ? touchPadding : ''}>
          {loading ? (
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex items-center ${touchSpacing}`}>
                  <Skeleton className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} rounded-full`} />
                  <div className="space-y-2 flex-1">
                    <Skeleton className={`h-4 ${isMobile ? 'w-[200px]' : 'w-[250px]'}`} />
                    <Skeleton className={`h-4 ${isMobile ? 'w-[150px]' : 'w-[200px]'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : isMobile ? (
            /* Mobile Card Layout */
            <div className="space-y-3">
              {/* Mobile Select All */}
              {filteredAccounts.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {selectedAccounts.length} selected
                  </span>
                </div>
              )}
              
              {filteredAccounts.map((account) => (
                <Card 
                  key={account.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleAccountClick(account)}
                >
                  <CardContent className={`${touchPadding} space-y-3`}>
                    {/* Account Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedAccounts.includes(account.id)}
                            onCheckedChange={() => toggleAccountSelection(account.id)}
                            className={touchTargetSize}
                          />
                        </div>
                        <Avatar 
                          className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} cursor-pointer hover:ring-2 hover:ring-primary/20 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200`}
                          onClick={(e) => handleAvatarClick(e, account)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAvatarClick(e, account)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View ${account.display_name}'s profile page in new tab`}
                          aria-describedby={`account-${account.id}-info`}
                          title={`Click to view ${account.display_name}'s profile`}
                        >
                          <AvatarImage src={account.avatar_url || undefined} alt={`${account.display_name} avatar`} />
                          <AvatarFallback className="text-xs" aria-label={`${account.display_name} initials`}>
                            {account.display_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm truncate">{account.display_name}</p>
                            {account.is_verified && (
                              <Badge variant="secondary" className="text-xs">✓</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            @{account.username || account.account_id}
                          </p>
                        </div>
                      </div>
                      
                      {/* Mobile Actions Menu */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className={`${touchTargetSize} p-2`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(account)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(account)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Account Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {account.category ?
                              account.category.charAt(0).toUpperCase() + account.category.slice(1) :
                              'Uncategorized'
                            }
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">
                          <Badge variant={account.is_active ? 'default' : 'secondary'} className="text-xs">
                            {account.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Subscribers:</span>
                        <div className="mt-1 font-medium">
                          {account.latest_snapshot ? 
                            (account.latest_snapshot.subscriber_count ?? 0).toLocaleString() : 
                            'N/A'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Videos:</span>
                        <div className="mt-1 font-medium">
                          {account.latest_snapshot ? 
                            (account.latest_snapshot.total_videos_count ?? 0).toLocaleString() : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Last Crawled */}
                    <div className="text-xs text-muted-foreground">
                      Last crawled: {account.last_crawled_at ? 
                        new Date(account.last_crawled_at).toLocaleDateString() : 
                        'Never'
                      }
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Desktop Table Layout */
            <Table id="accounts-table" role="table" aria-label="Target accounts list">
              <TableHeader>
                <TableRow role="row">
                  <TableHead className="w-12" role="columnheader">
                    <Checkbox
                      checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label={`Select all ${filteredAccounts.length} accounts`}
                      title={selectedAccounts.length === filteredAccounts.length ? "Deselect all accounts" : "Select all accounts"}
                    />
                  </TableHead>
                  <TableHead role="columnheader">Account</TableHead>
                  <TableHead role="columnheader">Category</TableHead>
                  <TableHead role="columnheader">Subscribers</TableHead>
                  <TableHead role="columnheader">Total Videos</TableHead>
                  <TableHead role="columnheader">Total Views</TableHead>
                  <TableHead role="columnheader">Status</TableHead>
                  <TableHead role="columnheader">Last Crawled</TableHead>
                  <TableHead className="text-right" role="columnheader">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody role="rowgroup">
                {filteredAccounts.map((account, index) => (
                  <TableRow 
                    key={account.id} 
                    className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    onClick={() => handleAccountClick(account)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleAccountClick(account)
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    aria-label={`Account ${account.display_name}, ${account.is_active ? 'active' : 'inactive'}, ${account.latest_snapshot?.subscriber_count || 0} subscribers`}
                    aria-rowindex={index + 2}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} role="gridcell">
                      <Checkbox
                        checked={selectedAccounts.includes(account.id)}
                        onCheckedChange={() => toggleAccountSelection(account.id)}
                        aria-label={`Select account ${account.display_name}`}
                        aria-describedby={`account-${account.id}-info`}
                        title={selectedAccounts.includes(account.id) ? `Deselect ${account.display_name}` : `Select ${account.display_name}`}
                      />
                    </TableCell>
                    <TableCell role="gridcell">
                      <div className="flex items-center space-x-3" id={`account-${account.id}-info`}>
                        <Avatar 
                          className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200"
                          onClick={(e) => handleAvatarClick(e, account)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAvatarClick(e, account)
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View ${account.display_name}'s profile page in new tab`}
                          aria-describedby={`account-${account.id}-info`}
                          title={`Click to view ${account.display_name}'s profile`}ew ${account.display_name}'s profile`}
                        >
                          <AvatarImage src={account.avatar_url || undefined} alt={`${account.display_name} avatar`} />
                          <AvatarFallback aria-label={`${account.display_name} initials`}>
                            {account.display_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{account.display_name}</p>
                            {account.is_verified && (
                              <Badge variant="secondary" className="text-xs" aria-label="Verified account">✓</Badge>
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
                      {account.latest_snapshot ? (
                        <span className="text-sm font-medium">
                          {(account.latest_snapshot.subscriber_count ?? 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.latest_snapshot ? (
                        <span className="text-sm font-medium">
                          {(account.latest_snapshot.total_videos_count ?? 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {account.latest_snapshot ? (
                        <span className="text-sm font-medium">
                          {(account.latest_snapshot.total_views ?? 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
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
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()} role="gridcell">
                      <div className="flex items-center justify-end gap-2" role="group" aria-label={`Actions for ${account.display_name}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(account)}
                          aria-label={`Edit account ${account.display_name}`}
                          title={`Edit ${account.display_name}`}
                        >
                          <Edit className="mr-1 h-3 w-3" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(account)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete account ${account.display_name}`}
                          title={`Delete ${account.display_name}`}
                        >
                          <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
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
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>No target accounts found</p>
              <Button 
                onClick={() => setCreateOpen(true)} 
                className={`mt-2 ${touchTargetSize}`}
                size={isMobile ? "default" : "default"}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isMobile ? 'Add Account' : 'Add First Target Account'}
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