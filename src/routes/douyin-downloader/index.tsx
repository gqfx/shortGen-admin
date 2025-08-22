import { createFileRoute } from '@tanstack/react-router'
import DouyinDownloaderPage from '@/features/douyin-downloader'

export const Route = createFileRoute('/douyin-downloader/')({
  component: DouyinDownloaderPage,
})