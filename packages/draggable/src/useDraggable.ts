import { MouseEvent as ReactMouseEvent, useState, useEffect, useRef } from 'react'
import { isNum } from './utils/utils'
import { DraggableData } from './types'
import usePersistFn from './utils/usePersistFn'
import { addUserSelectStyles, removeUserSelectStyles, matchesAndParentsTo } from './utils/dom'

export interface DraggableCoreProps {
  handle?: string // 拖动区域的选择器
  cancel?: string //  不可拖动区域的选择器
  disabled?: boolean // 是否开启关闭拖动
  offsetParent?: HTMLElement | null// 参考的父节点
  scale?: number // 缩放放大比例
  grid?: [number, number] | null// 最小的移动距离
  enableUserSelectHack?: boolean // 是否可以 user-select
  onMouseDown?: (e: ReactMouseEvent<HTMLElement>) => any
  onStart?: (e: ReactMouseEvent<HTMLElement>, coreEvent: DraggableData) => any
  onDrag?: (e: ReactMouseEvent<HTMLElement>, coreEvent: DraggableData) => any
  onStop?: (e: ReactMouseEvent<HTMLElement>, coreEvent: DraggableData) => any
}

export const defaultCoreProps: Partial<DraggableCoreProps> = {
  disabled: false,
  scale: 1,
  enableUserSelectHack: true
}

function getOffsetXYFromParent(e: ReactMouseEvent<HTMLElement>, offsetParent: HTMLElement, scale: number) {
  const isBody = offsetParent === offsetParent.ownerDocument.body
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()

  return {
    x: (e.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale,
    y: (e.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale
  }
}

function snapToGrid(grid: [number, number], deltaX: number, deltaY: number) {
  const x = Math.round(deltaX / grid[0]) * grid[0]
  const y = Math.round(deltaY / grid[1]) * grid[1]
  return [x, y]
}

export default function useDraggable(props: DraggableCoreProps) {
  const [dragging, setDragging] = useState(false)
  const [{ lastX, lastY }, setLastXY] = useState({ lastX: NaN, lastY: NaN })

  const mounted = useRef(false)
  const nodeRef = useRef<HTMLElement>(null)

  const { disabled, handle, cancel, scale, grid, enableUserSelectHack } = { ...defaultCoreProps, ...props }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false

      if (nodeRef.current) {
        const { ownerDocument } = nodeRef.current
        ownerDocument.removeEventListener('mousemove', onDrag as any)
        ownerDocument.removeEventListener('mouseup', onMouseUp as any)

        if (enableUserSelectHack) {
          removeUserSelectStyles(ownerDocument)
        }
      }
    }
  }, [])

  function createCoreData(node: HTMLElement, x: number, y: number): DraggableData {
    const isStart = !isNum(lastX)
    if (isStart) {
      return {
        node,
        deltaX: 0, deltaY: 0,
        lastX: x, lastY: y,
        x, y
      }
    }
    return {
      node,
      deltaX: x - lastX, deltaY: y - lastY,
      lastX, lastY,
      x, y
    }
  }

  function getPostion(e: ReactMouseEvent<HTMLElement>) {
    const offsetParent = props.offsetParent || nodeRef.current.offsetParent || nodeRef.current.ownerDocument.body
    return getOffsetXYFromParent(e, offsetParent as HTMLElement, scale)
  }

  const onDrag = usePersistFn((e: ReactMouseEvent<HTMLElement>) => {
    let { x, y } = getPostion(e)

    if (Array.isArray(grid)) {
      let deltaX = x - lastX
      let deltaY = y - lastY;
      [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY)

      if (!deltaX && !deltaY) return
      x = lastX + deltaX
      y = lastY + deltaY
    }

    const coreEvent = createCoreData(nodeRef.current, x, y)

    const shouldUpdate = props.onDrag?.(e, coreEvent)
    if (shouldUpdate === false || !mounted.current) {
      onMouseUp(new MouseEvent('mouseup') as any)
      return
    }

    setLastXY({ lastX: x, lastY: y })
  })

  const onMouseUp = usePersistFn((e: ReactMouseEvent<HTMLElement>) => {
    if (!dragging) return

    const { x, y } = getPostion(e)
    const coreEvent = createCoreData(nodeRef.current, x, y)

    const shouldContinue = props.onStop?.(e, coreEvent)
    if (shouldContinue === false || !mounted.current) return false

    setDragging(false)
    setLastXY({ lastX: NaN, lastY: NaN })

    if (nodeRef.current) {
      const { ownerDocument } = nodeRef.current

      if (enableUserSelectHack) {
        removeUserSelectStyles(ownerDocument)
      }

      ownerDocument.removeEventListener('mousemove', onDrag as any, { capture: true })
      ownerDocument.removeEventListener('mouseup', onMouseUp as any, { capture: true })
    }
  })

  const onMouseDown = usePersistFn((e: ReactMouseEvent<HTMLElement>) => {
    props.onMouseDown?.(e)

    const { ownerDocument } = nodeRef.current

    if (disabled
      || !(e.target instanceof (<any>ownerDocument.defaultView).Node)
      || (handle && !matchesAndParentsTo(e.target as Element, handle, nodeRef.current))
      || (cancel && matchesAndParentsTo(e.target as Element, cancel, nodeRef.current))) {
      return
    }

    const { x, y } = getPostion(e)
    const coreEvent = createCoreData(nodeRef.current, x, y)

    const shouldUpdate = props.onStart?.(e, coreEvent)
    if (shouldUpdate === false || !mounted.current) {
      return
    }

    if (enableUserSelectHack) {
      addUserSelectStyles(ownerDocument)
    }

    setDragging(true)
    setLastXY({ lastX: x, lastY: y })

    ownerDocument.addEventListener('mousemove', onDrag as any, { capture: true })
    ownerDocument.addEventListener('mouseup', onMouseUp as any, { capture: true })
  })

  return {
    onMouseDown,
    onMouseUp,
    nodeRef
  }
}
