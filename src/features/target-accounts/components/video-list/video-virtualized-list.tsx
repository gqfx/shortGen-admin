import { FixedSizeList as List } from 'react-window'
import { Video } from '@/lib/api'
import { VideoItem } from './video-item'

interface VideoVirtualizedListProps {
  videos: Video[]
  selectedVideoIds: Set<string>
  onVideoSelect: (videoId: string, checked: boolean) => void
  onVideoAction: (video: Video, action: 'download' | 'view') => void
  onThumbnailClick: (video: Video) => void
  height?: number
  itemSize?: number
}

interface RowProps {
  index: number
  style: React.CSSProperties
  data: {
    videos: Video[]
    selectedVideoIds: Set<string>
    handleVideoSelect: (videoId: string, checked: boolean) => void
    handleVideoAction: (video: Video, action: 'download' | 'view') => void
    handleThumbnailClick: (video: Video) => void
  }
}

const Row = ({ index, style, data }: RowProps) => {
  const {
    videos,
    selectedVideoIds,
    handleVideoSelect,
    handleVideoAction,
    handleThumbnailClick,
  } = data
  const video = videos[index]
  const isSelected = selectedVideoIds.has(video.id)

  return (
    <div style={style}>
      <VideoItem
        video={video}
        isSelected={isSelected}
        onSelect={handleVideoSelect}
        onAction={handleVideoAction}
        onThumbnailClick={handleThumbnailClick}
      />
    </div>
  )
}

export function VideoVirtualizedList({
  videos,
  selectedVideoIds,
  onVideoSelect,
  onVideoAction,
  onThumbnailClick,
  height = 600,
  itemSize = 150,
}: VideoVirtualizedListProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No videos found for this account
      </div>
    )
  }

  return (
    <div className={`h-[${height}px]`}>
      <List
        height={height}
        itemCount={videos.length}
        itemSize={itemSize}
        width="100%"
        itemData={{
          videos,
          selectedVideoIds,
          handleVideoSelect: onVideoSelect,
          handleVideoAction: onVideoAction,
          handleThumbnailClick: onThumbnailClick,
        }}
      >
        {Row}
      </List>
    </div>
  )
}