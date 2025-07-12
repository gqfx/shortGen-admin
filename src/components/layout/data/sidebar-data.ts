import {
  IconChecklist,
  IconLayoutDashboard,
  IconFolder,
  IconPhoto,
  IconBulb,
  IconCloud,
  IconAdjustments,
  IconWorkflow,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: IconChecklist,
        },
      ],
    },
    {
      title: 'Content Management',
      items: [
        {
          title: 'Projects',
          url: '/projects',
          icon: IconFolder,
        },
        {
          title: 'Assets',
          url: '/assets',
          icon: IconPhoto,
        },
        {
          title: 'Inspirations',
          url: '/inspirations',
          icon: IconBulb,
        },
        {
          title: 'Platform Accounts',
          url: '/platform-accounts',
          icon: IconCloud,
        },
        {
          title: 'Worker Configs',
          url: '/worker-configs',
          icon: IconAdjustments,
        },
        {
          title: 'Workflow Registry',
          url: '/workflow-registry',
          icon: IconWorkflow,
        },
      ],
    },
  ],
}
