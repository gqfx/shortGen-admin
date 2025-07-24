import { create } from 'zustand'
import { Video, TargetAccount } from '@/lib/api'

interface VideoFilters {
  dateRange?: {
    start: string
    end: string
  }
  status?: 'all' | 'downloaded' | 'not_downloaded' | 'analyzed'
  videoType?: 'all' | 'long' | 'short' | 'live'
  searchQuery?: string
}

interface TargetAccountsState {
  accounts: TargetAccount[]
  videos: Record<string, Video[]>
  filters: Record<string, VideoFilters>
  setAccounts: (accounts: TargetAccount[]) => void
  setVideos: (accountId: string, videos: Video[]) => void
  updateVideo: (accountId: string, videoId: string, updatedVideo: Partial<Video>) => void
  setFilters: (accountId: string, filters: VideoFilters) => void
}

export const useTargetAccountsStore = create<TargetAccountsState>((set) => ({
  accounts: [],
  videos: {},
  filters: {},
  setAccounts: (accounts: TargetAccount[]) => set({ accounts }),
  setVideos: (accountId: string, videos: Video[]) =>
    set((state: TargetAccountsState) => ({
      videos: {
        ...state.videos,
        [accountId]: videos,
      },
    })),
  updateVideo: (accountId: string, videoId: string, updatedVideo: Partial<Video>) =>
    set((state: TargetAccountsState) => {
      const videos = state.videos[accountId] || []
      const updatedVideos = videos.map((video: Video) =>
        video.id === videoId ? { ...video, ...updatedVideo } : video
      )
      return {
        videos: {
          ...state.videos,
          [accountId]: updatedVideos,
        },
      }
    }),
  setFilters: (accountId: string, filters: VideoFilters) =>
    set((state: TargetAccountsState) => ({
      filters: {
        ...state.filters,
        [accountId]: filters,
      },
    })),
}))