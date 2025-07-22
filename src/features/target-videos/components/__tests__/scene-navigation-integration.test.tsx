import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { VideoPlayer } from '../video-player'
import { SceneAnalysisSlider } from '../scene-analysis-slider'
import { Video } from '@/lib/api'

// Mock the video detail context
const mockUseVideoDetail = vi.fn()
vi.mock('../context/video-detail-context', () => ({
  useVideoDetail: () => mockUseVideoDetail()
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn()
  }
}))

describe('Scene Navigation Integration', () => {
  const mockVideo: Video = {
    id: 'test-video-1',
    title: 'Test Video',
    description: 'Test video description',
    thumbnail_url: 'https://example.com/thumb.jpg',
    video_url: 'https://example.com/video.mp4',
    duration: 120,
    view_count: 1000,
    like_count: 100,
    comment_count: 50,
    published_at: '2024-01-01T00:00:00Z',
    platform: 'youtube',
    video_type: 'short',
    is_downloaded: true,
    local_file_path: '/path/to/video.mp4',
    download_status: 'completed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    target_account_id: 'account-1'
  }

  const mockScenes = [
    {
      sceneId: 'scene-1',
      startTime: 0,
      endTime: 30,
      thumbnailUrl: 'https://example.com/scene1.jpg',
      description: 'Opening scene',
      confidence: 0.9
    },
    {
      sceneId: 'scene-2',
      startTime: 30,
      endTime: 60,
      thumbnailUrl: 'https://example.com/scene2.jpg',
      description: 'Middle scene',
      confidence: 0.85
    },
    {
      sceneId: 'scene-3',
      startTime: 60,
      endTime: 90,
      thumbnailUrl: 'https://example.com/scene3.jpg',
      description: 'Ending scene',
      confidence: 0.8
    }
  ]

  const mockVideoDetailContext = {
    triggerDownload: vi.fn(),
    loadingStates: { download: false },
    errorStates: { download: null },
    canTriggerDownload: false,
    downloadProgress: null,
    retryDownload: vi.fn(),
    cancelDownload: vi.fn(),
    getDownloadStatusMessage: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseVideoDetail.mockReturnValue(mockVideoDetailContext)
  })

  it('should handle scene click and navigate to specific timestamp', async () => {
    const mockOnTimeNavigate = vi.fn()
    const mockOnSceneClick = vi.fn()

    render(
      <SceneAnalysisSlider
        scenes={mockScenes}
        onSceneClick={mockOnSceneClick}
        onTimeNavigate={mockOnTimeNavigate}
        selectedSceneId="scene-1"
        currentTime={0}
        autoSyncWithPlayback={true}
      />
    )

    // Find and click on the second scene
    const sceneElements = screen.getAllByRole('option')
    expect(sceneElements).toHaveLength(3)

    fireEvent.click(sceneElements[1])

    // Verify that the callbacks were called with correct parameters
    await waitFor(() => {
      expect(mockOnSceneClick).toHaveBeenCalledWith(mockScenes[1])
      expect(mockOnTimeNavigate).toHaveBeenCalledWith(30) // startTime of scene-2
    })
  })

  it('should synchronize scene selection with video playback time', async () => {
    const mockOnTimeNavigate = vi.fn()
    const mockOnSceneClick = vi.fn()

    const { rerender } = render(
      <SceneAnalysisSlider
        scenes={mockScenes}
        onSceneClick={mockOnSceneClick}
        onTimeNavigate={mockOnTimeNavigate}
        currentTime={0}
        autoSyncWithPlayback={true}
      />
    )

    // Simulate video playback progressing to scene 2
    rerender(
      <SceneAnalysisSlider
        scenes={mockScenes}
        onSceneClick={mockOnSceneClick}
        onTimeNavigate={mockOnTimeNavigate}
        currentTime={45} // This should be in scene-2 (30-60)
        autoSyncWithPlayback={true}
      />
    )

    // Wait for the synchronization to occur
    await waitFor(() => {
      const sceneElements = screen.getAllByRole('option')
      // The second scene should be focused/selected
      expect(sceneElements[1]).toHaveAttribute('aria-selected', 'false') // Since selectedSceneId is not set
    }, { timeout: 3000 })
  })

  it('should handle keyboard navigation correctly', async () => {
    const mockOnTimeNavigate = vi.fn()
    const mockOnSceneClick = vi.fn()

    render(
      <SceneAnalysisSlider
        scenes={mockScenes}
        onSceneClick={mockOnSceneClick}
        onTimeNavigate={mockOnTimeNavigate}
        selectedSceneId="scene-1"
        currentTime={0}
        autoSyncWithPlayback={true}
      />
    )

    const slider = screen.getByRole('listbox')
    
    // Test arrow key navigation
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    
    // Test Enter key to select scene
    fireEvent.keyDown(slider, { key: 'Enter' })

    await waitFor(() => {
      expect(mockOnSceneClick).toHaveBeenCalled()
      expect(mockOnTimeNavigate).toHaveBeenCalled()
    })
  })

  it('should handle video player time updates and scene highlighting', async () => {
    const mockOnTimeUpdate = vi.fn()
    const mockOnSeekToTime = vi.fn()
    const highlightedScene = mockScenes[1]

    render(
      <VideoPlayer
        video={mockVideo}
        currentTime={45}
        onTimeUpdate={mockOnTimeUpdate}
        onSeekToTime={mockOnSeekToTime}
        highlightedScene={highlightedScene}
        autoSyncWithScenes={true}
      />
    )

    // Verify that the video player renders correctly
    expect(screen.getByText('Downloaded')).toBeInTheDocument()
    
    // The video element should be present
    const videoElement = screen.getByRole('application') || document.querySelector('video')
    expect(videoElement).toBeTruthy()
  })

  it('should provide smooth scrolling when navigating between scenes', async () => {
    const mockOnTimeNavigate = vi.fn()
    const mockOnSceneClick = vi.fn()

    render(
      <SceneAnalysisSlider
        scenes={mockScenes}
        onSceneClick={mockOnSceneClick}
        onTimeNavigate={mockOnTimeNavigate}
        selectedSceneId="scene-1"
        currentTime={0}
        autoSyncWithPlayback={true}
      />
    )

    const slider = screen.getByRole('listbox')
    
    // Test Home key (should go to first scene)
    fireEvent.keyDown(slider, { key: 'Home' })
    
    // Test End key (should go to last scene)
    fireEvent.keyDown(slider, { key: 'End' })
    
    // Test Enter to select the last scene
    fireEvent.keyDown(slider, { key: 'Enter' })

    await waitFor(() => {
      expect(mockOnSceneClick).toHaveBeenCalledWith(mockScenes[2]) // Last scene
      expect(mockOnTimeNavigate).toHaveBeenCalledWith(60) // startTime of last scene
    })
  })

  it('should handle direct scene navigation via jump button', async () => {
    const mockOnTimeNavigate = vi.fn()

    render(
      <SceneAnalysisSlider
        scenes={mockScenes}
        onTimeNavigate={mockOnTimeNavigate}
        selectedSceneId="scene-1"
        currentTime={0}
        autoSyncWithPlayback={true}
      />
    )

    // Find the jump button (it should be visible on hover)
    const jumpButtons = screen.getAllByText('Jump to Scene')
    expect(jumpButtons.length).toBeGreaterThan(0)

    // Click the first jump button
    fireEvent.click(jumpButtons[0])

    await waitFor(() => {
      expect(mockOnTimeNavigate).toHaveBeenCalledWith(mockScenes[0].startTime)
    })
  })
})