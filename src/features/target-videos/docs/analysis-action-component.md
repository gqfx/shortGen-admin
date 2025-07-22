# Analysis Action Component

## Overview

The Analysis Action Component provides a comprehensive interface for managing video analysis operations. It displays analysis buttons for downloaded but unanalyzed videos, implements analysis task triggering functionality, shows analysis progress and status updates, and handles analysis completion and error states.

## Features

### Core Functionality
- **Analysis Triggering**: Allows users to start video analysis for downloaded videos
- **Status Tracking**: Displays current analysis status (not started, pending, processing, completed, failed)
- **Progress Monitoring**: Shows analysis progress and status updates
- **Error Handling**: Handles analysis failures with retry functionality
- **Multiple Variants**: Supports different display modes for various use cases

### Status States
1. **Not Started**: Video is downloaded but analysis hasn't been triggered
2. **Pending**: Analysis task is queued and waiting to start
3. **Processing**: Analysis is currently running
4. **Completed**: Analysis finished successfully with results available
5. **Failed**: Analysis failed with error details and retry option

## Component Variants

### Default Variant
- Full status display with detailed information
- Progress indicators and status cards
- Error details and retry functionality
- Analysis results summary
- Best for: Video detail pages, comprehensive status display

### Compact Variant
- Minimal display suitable for lists
- Shows status icon and text
- Action button when applicable
- Best for: Video lists, space-constrained areas

### Inline Variant
- Button-only display
- Shows only when action is available
- Retry button for failed analysis
- Best for: Action bars, toolbars

## Usage Examples

### Video Player Integration
```tsx
import { AnalysisAction } from '@/features/target-videos/components/analysis-action'
import { VideoDetailProvider } from '@/features/target-videos/context/video-detail-context'

// In video player component
{video.is_downloaded && (
  <VideoDetailProvider videoId={video.id}>
    <AnalysisAction variant="default" />
  </VideoDetailProvider>
)}
```

### Video List Integration
```tsx
// In video list item
{video.is_downloaded && (
  <VideoDetailProvider videoId={video.id}>
    <AnalysisAction variant="compact" showStatus={false} />
  </VideoDetailProvider>
)}
```

### Action Bar Integration
```tsx
// In action bar
<VideoDetailProvider videoId={video.id}>
  <AnalysisAction variant="inline" />
</VideoDetailProvider>
```

## API Integration

The component integrates with the following API endpoints:
- `POST /api/analysis/videos/{videoId}/trigger-analysis` - Trigger video analysis
- `GET /api/analysis/videos/{videoId}/analysis` - Get analysis results
- `GET /api/analysis/tasks/` - Monitor analysis task status

## Requirements Fulfilled

### Requirement 6.2: Analysis Button Display
- ✅ Shows analysis button for downloaded but unanalyzed videos
- ✅ Button is only visible when video is downloaded
- ✅ Button is disabled when analysis is already in progress

### Requirement 6.3: Analysis Task Triggering
- ✅ Implements analysis task triggering functionality
- ✅ Sends analysis requests to the backend API
- ✅ Handles API responses and errors appropriately

### Requirement 6.4: Analysis Progress Display
- ✅ Shows analysis progress and status updates
- ✅ Displays different states (pending, processing, completed, failed)
- ✅ Provides visual feedback during analysis

### Requirement 9.1: Operation Feedback
- ✅ Provides immediate visual feedback for user actions
- ✅ Shows loading states during analysis triggering
- ✅ Displays success and error messages

### Requirement 9.2: Error Handling
- ✅ Displays specific error messages when analysis fails
- ✅ Provides retry functionality for failed analysis
- ✅ Shows appropriate error states and recovery options

## Component Architecture

### Props Interface
```tsx
interface AnalysisActionProps {
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  showStatus?: boolean
}
```

### Context Integration
The component uses the `VideoDetailContext` to:
- Access video information and analysis status
- Trigger analysis operations
- Monitor loading and error states
- Handle analysis progress updates

### State Management
- Uses context-based state management for video and analysis data
- Handles loading states for different operations
- Manages error states with specific error messages
- Tracks analysis progress and status updates

## Styling and Theming

The component uses Tailwind CSS classes and follows the design system:
- Consistent color coding for different states
- Responsive design for different screen sizes
- Accessible focus states and keyboard navigation
- Proper contrast ratios for readability

## Testing Considerations

### Unit Tests
- Component rendering with different props
- User interaction handling (button clicks)
- State changes and updates
- Error handling scenarios

### Integration Tests
- API integration for analysis triggering
- Context provider integration
- Status updates and progress tracking
- Error recovery flows

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels and descriptions
- Focus management during state changes

## Future Enhancements

### Potential Improvements
1. **Batch Analysis**: Support for analyzing multiple videos at once
2. **Analysis Scheduling**: Allow scheduling analysis for later execution
3. **Analysis Presets**: Different analysis configurations and options
4. **Progress Details**: More detailed progress information during analysis
5. **Analysis History**: View previous analysis attempts and results

### Performance Optimizations
1. **Lazy Loading**: Load analysis data only when needed
2. **Caching**: Cache analysis results to reduce API calls
3. **Debouncing**: Prevent rapid successive analysis triggers
4. **Memory Management**: Proper cleanup of resources and subscriptions

## Files Created

1. `src/features/target-videos/components/analysis-action.tsx` - Main component
2. `src/features/target-videos/components/index.ts` - Component exports
3. `src/features/target-videos/examples/analysis-action-example.tsx` - Usage examples
4. `src/features/target-videos/docs/analysis-action-component.md` - Documentation

## Integration Points

### Video Player Component
- Added analysis action to video player for downloaded videos
- Integrated both inline and default variants
- Provides comprehensive analysis management

### Video List Component
- Updated video list to use analysis action component
- Replaced placeholder analysis functionality
- Uses compact variant for space efficiency

### Context Provider
- Leverages existing VideoDetailContext for state management
- Uses analysis-related methods and state
- Maintains consistency with other video operations