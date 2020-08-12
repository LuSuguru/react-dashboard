import { useCallback, useRef, useEffect } from 'react'

export default function usePersistFn<T extends any[], R>(fn: (...args: T) => R) {
  const fnRef = useRef<typeof fn>(() => {
    throw new Error('should not invoke a persist fn while rendering')
  })

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const persistFn = useCallback((...args: T) => fnRef.current(...args), [])

  return persistFn
}
