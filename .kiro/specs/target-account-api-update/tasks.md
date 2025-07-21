# Target Account API Update - Implementation Tasks

## Page Structure Changes

### 1. Remove Separate Channel Page
- **Current**: `/target-channels` - separate channel management
- **Action**: Remove this page since channels are now managed as part of accounts
- **Files to remove**:
  - `src/routes/target-channels/`
  - `src/features/target-channels/` (if exists)

### 2. Enhanced Target Accounts Page
- **Current**: `/target-accounts` - basic account management
- **New**: Enhanced with channel functionality and crawl management
- **Features to add**:
  - Quick-add with immediate crawl trigger
  - Manual crawl triggering (individual and batch)
  - Video management integration
  - Task status monitoring

### 3. New Monitoring Tasks Page
- **New**: `/monitoring-tasks` - dedicated task management
- **Features**:
  - View all monitoring tasks
  - Filter by account, video, task type, status
  - Update task status
  - Task history and logs
  - Real-time status updates

## Navigation Updates

### Sidebar Navigation Changes
```typescript
// Remove
{
  title: 'Target Channels',
  url: '/target-channels',
  icon: IconChannel,
}

// Keep enhanced
{
  title: 'Target Accounts',
  url: '/target-accounts', 
  icon: IconUsers,
}

// Add new
{
  title: 'Monitoring Tasks',
  url: '/monitoring-tasks',
  icon: IconTasks,
}
```

## Implementation Steps

### Phase 1: Remove Target Channels
1. Remove route files
2. Remove from sidebar navigation
3. Clean up unused components

### Phase 2: Create Monitoring Tasks Page
1. Create route structure
2. Create task management components
3. Implement task filtering and updates
4. Add to navigation

### Phase 3: Update Target Accounts
1. Enhance with channel functionality
2. Add crawl management features
3. Integrate video management
4. Update context and API calls

## File Structure

### New Files to Create
```
src/routes/monitoring-tasks/
  └── index.tsx
src/features/monitoring-tasks/
  ├── index.tsx
  ├── context/
  │   └── monitoring-tasks-context.tsx
  └── components/
      ├── task-filters.tsx
      ├── task-table.tsx
      └── task-details.tsx
```

### Files to Remove
```
src/routes/target-channels/
src/features/target-channels/ (if exists)
```

### Files to Update
```
src/components/layout/data/sidebar-data.ts
src/routeTree.gen.ts (will be auto-generated)
src/features/target-accounts/ (already updated)
```

## API Integration Points

### Target Accounts Page
- Use `/api/analysis/accounts/quick-add` for adding accounts
- Use `/api/analysis/accounts/{id}/trigger-crawl` for manual crawls
- Use `/api/analysis/accounts/batch-trigger-crawl` for batch operations
- Use `/api/analysis/accounts/{id}/videos` for video management

### Monitoring Tasks Page  
- Use `/api/analysis/tasks/` for task listing
- Use `/api/analysis/tasks/{id}` for task updates
- Support filtering by account_id, video_id, task_type, status
- Real-time updates for task status changes

## Success Criteria

1. ✅ Target Channels page removed
2. ✅ Monitoring Tasks page created and functional
3. ✅ Target Accounts page enhanced with new features
4. ✅ Navigation updated correctly
5. ✅ All API endpoints integrated properly
6. ✅ No broken links or references
7. ✅ Smooth user experience across all pages

## Implementation Status

### ✅ Phase 1: Remove Target Channels - COMPLETED
- Removed `src/routes/target-channels/index.tsx`
- Removed `src/features/target-channels/` directory
- Updated sidebar navigation

### ✅ Phase 2: Create Monitoring Tasks Page - COMPLETED
- Created route structure at `src/routes/monitoring-tasks/`
- Implemented full feature set:
  - Context for state management
  - Task filtering by account, video, type, status
  - Task table with actions (retry, cancel, view details)
  - Real-time status updates
  - Statistics dashboard
- Added to navigation menu

### ✅ Phase 3: Update Target Accounts - COMPLETED
- Enhanced with new API integration
- Added crawl management dialogs
- Added video management functionality
- Implemented batch operations
- Updated forms for quick-add functionality

## Key Features Implemented

### Monitoring Tasks Page
- **Task Overview**: Statistics cards showing pending, processing, completed, and failed tasks
- **Advanced Filtering**: Filter by account ID, video ID, task type, and status
- **Task Management**: Retry failed tasks, cancel running tasks, view task details
- **Real-time Updates**: Automatic refresh and status monitoring

### Enhanced Target Accounts Page
- **Quick Add**: Simplified account addition with immediate crawl triggering
- **Batch Operations**: Select multiple accounts for batch crawl operations
- **Crawl Management**: Configurable crawl settings with video limits
- **Video Management**: View account videos and trigger downloads
- **Enhanced Actions**: Improved dropdown menus with new options

### API Integration
- All endpoints updated to use `/api/analysis` base path
- New request/response types implemented
- Backward compatibility maintained
- Error handling and user feedback improved