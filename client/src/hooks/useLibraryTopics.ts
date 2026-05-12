import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api'
import type { LibraryTopic } from '@/types'

export function useLibraryTopics() {
  const [topics, setTopics] = useState<LibraryTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTopics = useCallback(async () => {
    try {
      setError(null)
      const nextTopics = await api.getTopics()
      setTopics(nextTopics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTopics()
  }, [loadTopics])

  return {
    topics,
    isLoading,
    error,
    refreshTopics: loadTopics,
  }
}
