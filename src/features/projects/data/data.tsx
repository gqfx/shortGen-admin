import {
  IconChecks,
  IconClock,
  IconLoader2,
  IconX,
  IconCube,
  IconVideo,
  IconMusic,
  IconPhoto,
  IconFileText,
} from '@tabler/icons-react'

export const statuses = [
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

export const projectTypes = [
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