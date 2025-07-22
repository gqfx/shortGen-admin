import { useState } from 'react'
import { SceneAnalysisSlider } from '../components/scene-analysis-slider'

// Mock scene data for demonstration
const mockScenes = [
  {
    sceneId: 'scene-1',
    startTime: 0,
    endTime: 15,
    thumbnailUrl: 'https://via.placeholder.com/320x180/4f46e5/ffffff?text=Scene+1',
    description: 'Opening scene with introduction and title card. The video begins with a fade-in effect.',
    confidence: 0.95
  },
  {
    sceneId: 'scene-2',
    startTime: 15,
    endTime: 45,
    thumbnailUrl: 'https://via.placeholder.com/320x180/7c3aed/ffffff?text=Scene+2',
    description: 'Main content presentation with speaker talking to camera in a well-lit studio setting.',
    confidence: 0.88
  },
  {
    sceneId: 'scene-3',
    startTime: 45,
    endTime: 78,
    thumbnailUrl: 'https://via.placeholder.com/320x180/2563eb/ffffff?text=Scene+3',
    description: 'Demonstration or tutorial segment showing step-by-step process with screen recording.',
    confidence: 0.92
  },
  {
    sceneId: 'scene-4',
    startTime: 78,
    endTime: 105,
    thumbnailUrl: 'https://via.placeholder.com/320x180/dc2626/ffffff?text=Scene+4',
    description: 'Interview or discussion segment with multiple participants in a casual environment.',
    confidence: 0.76
  },
  {
    sceneId: 'scene-5',
    startTime: 105,
    endTime: 130,
    thumbnailUrl: 'https://via.placeholder.com/320x180/059669/ffffff?text=Scene+5',
    description: 'Product showcase or review with close-up shots and detailed explanations.',
    confidence: 0.91
  },
  {
    sceneId: 'scene-6',
    startTime: 130,
    endTime: 155,
    thumbnailUrl: 'https://via.placeholder.com/320x180/ea580c/ffffff?text=Scene+6',
    description: 'Call-to-action segment encouraging viewers to subscribe, like, and comment.',
    confidence: 0.84
  },
  {
    sceneId: 'scene-7',
    startTime: 155,
    endTime: 180,
    thumbnailUrl: 'https://via.placeholder.com/320x180/8b5cf6/ffffff?text=Scene+7',
    description: 'Closing credits and end screen with related video suggestions and social media links.',
    confidence: 0.89
  }
]

export function SceneAnalysisSliderExample() {
  const [selectedSceneId, setSelectedSceneId] = useState<string>()
  const [currentTime, setCurrentTime] = useState<number>(0)

  const handleSceneClick = (scene: typeof mockScenes[0]) => {
    setSelectedSceneId(scene.sceneId)
    console.log('Scene clicked:', scene)
  }

  const handleTimeNavigate = (timeInSeconds: number) => {
    setCurrentTime(timeInSeconds)
    console.log('Navigate to time:', timeInSeconds)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Scene Analysis Slider Example</h1>
        <p className="text-muted-foreground">
          This example demonstrates the Scene Analysis Slider component with mock data.
        </p>
      </div>

      {/* Current state display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <span className="text-sm font-medium">Selected Scene:</span>
          <p className="text-sm text-muted-foreground">
            {selectedSceneId || 'None selected'}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium">Current Time:</span>
          <p className="text-sm text-muted-foreground">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Scene Analysis Slider */}
      <SceneAnalysisSlider
        scenes={mockScenes}
        onSceneClick={handleSceneClick}
        onTimeNavigate={handleTimeNavigate}
        selectedSceneId={selectedSceneId}
      />

      {/* Loading state example */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Loading State</h2>
        <SceneAnalysisSlider
          scenes={[]}
          loading={true}
        />
      </div>

      {/* Empty state example */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Empty State</h2>
        <SceneAnalysisSlider
          scenes={[]}
          loading={false}
        />
      </div>

      {/* Usage instructions */}
      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900">How to Use</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Mouse:</strong> Click on any scene thumbnail to select it and navigate to that time</li>
          <li>• <strong>Keyboard:</strong> Use arrow keys to navigate, Enter/Space to select, Home/End to jump</li>
          <li>• <strong>Touch:</strong> Swipe horizontally to scroll through scenes on mobile devices</li>
          <li>• <strong>Navigation:</strong> Use the left/right arrow buttons to scroll the scene list</li>
          <li>• <strong>Accessibility:</strong> Full keyboard navigation and screen reader support</li>
        </ul>
      </div>
    </div>
  )
}