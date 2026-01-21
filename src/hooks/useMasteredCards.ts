import { useState, useCallback } from 'react'
import { usePersistence } from './usePersistence'

export function useMasteredCards() {
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('masteredIds')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })
  
  const [lastMasteredId, setLastMasteredId] = useState<string | null>(null)
  
  usePersistence('masteredIds', masteredIds)

  const toggleMastered = useCallback((id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setLastMasteredId(null)
      } else {
        next.add(id)
        setLastMasteredId(id)
      }
      return next
    })
  }, [])

  const undoMastered = useCallback(() => {
    if (lastMasteredId) {
      setMasteredIds(prev => {
        const next = new Set(prev)
        next.delete(lastMasteredId)
        return next
      })
      setLastMasteredId(null)
    }
  }, [lastMasteredId])

  const resetMastered = useCallback(() => {
    if (confirm('Are you sure you want to reset all mastered cards?')) {
      setMasteredIds(new Set())
    }
  }, [])

  return { masteredIds, lastMasteredId, toggleMastered, undoMastered, resetMastered, setMasteredIds }
}
