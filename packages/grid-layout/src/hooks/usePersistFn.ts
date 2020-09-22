import { useCallback, useRef } from 'react'

export default function usePersistFn<T extends any[], R>(fn: (...args: T) => R) {
  const fnRef = useRef<typeof fn>(() => {
    throw new Error('should not invoke a persist fn while rendering')
  })

  fnRef.current = fn

  const persistFn = useCallback((...args: T) => fnRef.current(...args), [])

  return persistFn
}
