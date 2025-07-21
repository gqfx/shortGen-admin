# Target Account API Update Design

## Overview

This document outlines the updates needed to align the target account pages with the new API specification provided in `target_account.md`. The new API uses `/api/analysis` as the base path and introduces several new features.

## Key Changes Required

### 1. API Base Path Update
- **Current**: `/api/target-account-analysis`
- **New**: `/api/analysis`

### 2. New API Endpoints to Implement

#### Account Management
- `POST /accounts/quick-add` - Quick add with immediate crawl trigger
- `POST /accounts/{account_id}/trigger-crawl` - Manual crawl trigger
- `POST /accounts/batch-trigger-crawl` - Batch crawl trigger
- `DELETE /accounts/{account_id}` - Enhanced delete with force option

#### Data Retrieval
- `GET /accounts/{account_id}/videos` - Get account videos
- `GET /accounts/{account_id}/snapshots` - Get account snapshots
- `GET /videos/{video_id}/snapshots` - Get video snapshots

#### Task Management
- `GET /tasks/` - Get monitoring tasks
- `PUT /tasks/{task_id}` - Update task status

#### Video Downloads
- `POST /videos/trigger-download` - Trigger video downloads

### 3. Type Updates Required

#### New Request Types
```typescript
interface QuickAddAccountRequest {
  channel_url: string
  category?: string
  video_limit?: number
  crawl_videos?: boolean
}

interface AccountCrawlRequest {
  crawl_videos?: boolean
  video_limit?: number
}

interface BatchAccountCrawlRequest {
  account_ids: number[]
  crawl_videos?: boolean
  video_limit?: number
}

interface DeleteAccountRequest {
  force?: boolean
}

interface TriggerDownloadRequest {
  video_ids: number[]
  priority?: number
}

interface MonitoringTaskUpdate {
  status?: string
  error_message?: string
}
```

#### Updated Response Types
```typescript
interface QuickAddResponse {
  account: TargetAccount
  tasks: Array<{
    task_id: number
    task_type: string
  }>
}

interface CrawlResponse {
  account_id: number
  tasks: Array<{
    task_id: number
    task_type: string
  }>
}

interface BatchCrawlResponse {
  results: Array<{
    account_id: number
    status: 'success' | 'failed'
    task_count?: number
    error?: string
  }>
}

interface DownloadResponse {
  requested_videos: number
  valid_videos: number
  invalid_video_ids: number[]
  tasks: Array<{
    task_id: number
    video_id: number
    status: string
  }>
}
```

### 4. UI Enhancements

#### New Features to Add
1. **Crawl Management**
   - Manual trigger crawl button for individual accounts
   - Batch crawl trigger for multiple accounts
   - Task status monitoring

2. **Video Management**
   - View account videos
   - Trigger video downloads
   - Download status tracking

3. **Enhanced Delete**
   - Force delete option
   - Running tasks warning

4. **Data Visualization**
   - Account snapshots/history
   - Video engagement metrics
   - Task monitoring dashboard

#### Updated Forms
1. **Quick Add Form** (replaces current create form)
   - Simplified with automatic detection
   - Immediate crawl trigger option
   - Video limit configuration

2. **Account Actions Menu**
   - Add "Trigger Crawl" option
   - Add "View Videos" option
   - Add "View History" option

## Implementation Plan

### Phase 1: API Layer Updates
1. Update API base path in `src/lib/api.ts`
2. Add new API methods for all endpoints
3. Update existing API methods to match new specification
4. Add new TypeScript interfaces

### Phase 2: Context Updates
1. Update `TargetAccountsContext` to use new API methods
2. Add new context methods for crawl management
3. Add task monitoring capabilities

### Phase 3: UI Component Updates
1. Update dialogs to use new quick-add API
2. Add crawl management components
3. Add video management components
4. Update action menus and buttons

### Phase 4: New Features
1. Implement task monitoring dashboard
2. Add video download management
3. Add data visualization components
4. Implement batch operations

## Files to Update

### Core API Files
- `src/lib/api.ts` - Update API methods and types
- `src/features/target-accounts/context/target-accounts-context.tsx` - Update context

### Component Files
- `src/features/target-accounts/index.tsx` - Main page updates
- `src/features/target-accounts/components/target-account-dialogs.tsx` - Dialog updates

### New Component Files (to create)
- `src/features/target-accounts/components/crawl-management.tsx`
- `src/features/target-accounts/components/video-management.tsx`
- `src/features/target-accounts/components/task-monitoring.tsx`

## Success Criteria

1. ✅ All API calls use the new `/api/analysis` base path
2. ✅ Quick-add functionality works with immediate crawl triggering
3. ✅ Manual crawl triggering is available for individual and batch accounts
4. ✅ Enhanced delete with force option is implemented
5. ✅ Video management and download triggering is functional
6. ✅ Task monitoring provides real-time status updates
7. ✅ All existing functionality continues to work seamlessly

## Completed Updates

### API Layer ✅
- Updated base path from `/api/target-account-analysis` to `/api/analysis`
- Added new API methods for quick-add, crawl management, and task monitoring
- Updated TypeScript interfaces for new request/response types
- Maintained backward compatibility where needed

### Page Structure ✅
- ❌ Removed `/target-channels` page and functionality
- ✅ Created new `/monitoring-tasks` page with full task management
- ✅ Enhanced `/target-accounts` page with new features

### Navigation ✅
- Updated sidebar navigation to remove "Channels" 
- Added "Monitoring Tasks" to Target Account Analysis section
- Maintained logical grouping and user flow

### New Features ✅
- Quick-add accounts with immediate crawl triggering
- Individual and batch crawl management with configurable options
- Video management with download triggering
- Comprehensive task monitoring with filtering and status updates
- Enhanced account management with force delete option