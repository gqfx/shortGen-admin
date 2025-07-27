import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
  onSelectAll: () => void
  onClearSelection: () => void
  onBatchDownload: () => void
  selectedCount: number
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onSelectAll,
  onClearSelection,
  onBatchDownload,
  selectedCount,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault()
            onSelectAll()
            break
          case 'd':
            if (selectedCount > 0) {
              event.preventDefault()
              onBatchDownload()
            }
            break
        }
      }

      if (event.key === 'Escape') {
        onClearSelection()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSelectAll, onClearSelection, onBatchDownload, selectedCount, enabled])
}