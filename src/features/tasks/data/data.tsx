import {
  IconChecks,
  IconClock,
  IconLoader2,
  IconX,
  IconCirclePause,
  IconVideo,
  IconMusic,
  IconPhoto,
  IconFileText,
  IconCube,
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
} from '@tabler/icons-react'

export const taskTypes = [
  {
    value: 'video_generation',
    label: 'Video Generation',
    icon: IconVideo,
  },
  {
    value: 'audio_generation',
    label: 'Audio Generation',
    icon: IconMusic,
  },
  {
    value: 'image_generation',
    label: 'Image Generation',
    icon: IconPhoto,
  },
  {
    value: 'text_generation',
    label: 'Text Generation',
    icon: IconFileText,
  },
  {
    value: 'general',
    label: 'General',
    icon: IconCube,
  },
]

export const statuses = [
  {
    value: 'waiting',
    label: 'Waiting',
    icon: IconCirclePause,
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: IconClock,
  },
  {
    value: 'processing',
    label: 'Processing',
    icon: IconLoader2,
  },
  {
    value: 'completed',
    label: 'Completed',
    icon: IconChecks,
  },
  {
    value: 'failed',
    label: 'Failed',
    icon: IconX,
  },
]

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: IconArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: IconArrowRight,
  },
  {
    label: 'High',
    value: 'high',
    icon: IconArrowUp,
  },
]

// Keep legacy exports for compatibility
export const labels = taskTypes
