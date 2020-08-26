import { CSSProperties } from 'react'
import { Bound } from '@/type'

export function setTransform({ top, left, width, height }: Bound): CSSProperties {
  const translate = `translate(${left}px,${top}px)`

  return {
    transform: translate,
    WebkitTransform: translate,
    msTransform: translate,
    OTransform: translate,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  }
}

export function setTopLeft({ top, left, width, height }: Bound): CSSProperties {
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: 'absolute'
  }
}

export function perc(num: number): string {
  return num * 100 + '%'
}
