import { MouseEvent as ReactMouseEvent, useState, useEffect, useRef } from 'react'

export interface DraggableData {
  node: HTMLElement
  x: number
  y: number
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
}
interface Props {
  handleNode: any // 拖动区域
  cancelNode: any //  不可拖动区域
  disabled: boolean // 是否开启关闭拖动
  offsetParent: HTMLElement // 参考的父节点
  scale: number // 缩放放大比例
  grid: [number, number] // 最小的移动距离
  onMouseDown: (e: ReactMouseEvent<HTMLElement>) => void
  onStart: (e: ReactMouseEvent<HTMLElement>, coreEvent: DraggableData) => boolean
  onDrag: (e: ReactMouseEvent<HTMLElement>, coreEvent: DraggableData) => boolean
  onStop: (e: ReactMouseEvent<HTMLElement>, coreEvent: DraggableData) => boolean
}

function getOffsetXYFromParent(e: ReactMouseEvent<HTMLElement>, offsetParent: HTMLElement, scale: number) {
  const isBody = offsetParent === offsetParent.ownerDocument.body
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect()

  return {
    x: (e.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale,
    y: (e.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale
  }
}

function snapToGrid(gird: [number, number], deltaX: number, deltaY: number) {
  const x = Math.round(deltaX / gird[0]) * gird[0]
  const y = Math.round(deltaY / gird[1]) * gird[1]
  return [x, y]
}

export default function useDraggable(node: HTMLElement, props: Props) {
  const [dragging, setDragging] = useState(false)
  const [{ lastX, lastY }, setLastXY] = useState({ lastX: NaN, lastY: NaN })

  const mounted = useRef(false)

  const { disabled = false, handleNode, cancelNode, scale = 1, grid } = props

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false

      if (node) {
        const { ownerDocument } = node
        ownerDocument.removeEventListener('mousemove', onDrag as any)
        ownerDocument.removeEventListener('mouseup', onMouseUp as any)
      }
    }
  }, [])

  function createCoreData(node: HTMLElement, x: number, y: number): DraggableData {
    const isStart = Number.isNaN(lastX)
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
    const offsetParent = props.offsetParent || node.offsetParent || node.ownerDocument.body
    return getOffsetXYFromParent(e, offsetParent, scale)
  }

  function onDrag(e: ReactMouseEvent<HTMLElement>) {
    let { x, y } = getPostion(e)

    if (Array.isArray(grid)) {
      let deltaX = x - lastX
      let deltaY = y - lastY;
      [deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY)

      if (!deltaX && !deltaY) return
      x = lastX + deltaX
      y = lastY + deltaY
    }

    const coreEvent = createCoreData(node, x, y)

    const shouldUpdate = props?.onDrag(e, coreEvent)
    if (!shouldUpdate || !mounted.current) {
      onMouseUp(new MouseEvent('mouseup') as any)
      return
    }

    setLastXY({ lastX: x, lastY: y })
  }

  function onMouseUp(e: ReactMouseEvent<HTMLElement>) {
    if (!dragging) return
    const { x, y } = getPostion(e)
    const coreEvent = createCoreData(node, x, y)

    const shouldContinue = props?.onStop(e, coreEvent)
    if (!shouldContinue || !mounted.current) return false

    setDragging(false)
    setLastXY({ lastX: NaN, lastY: NaN })

    if (node) {
      const { ownerDocument } = node
      ownerDocument.removeEventListener('mousemove', onDrag as any)
      ownerDocument.removeEventListener('mouseup', onMouseUp as any)
    }
  }

  function onMouseDown(e: ReactMouseEvent<HTMLElement>) {
    props.onMouseDown(e)

    const { ownerDocument } = node

    if (disabled
      || !(e.target instanceof (<any>ownerDocument.defaultView).Node)
      || !(handleNode && e.target === handleNode)
      || (cancelNode && e.target === cancelNode)) {
      return
    }

    const { x, y } = getPostion(e)
    const coreEvent = createCoreData(node, x, y)

    const shouldUpdate = props?.onStart(e, coreEvent)
    if (!shouldUpdate || !mounted.current) {
      return
    }

    setDragging(true)
    setLastXY({ lastX: x, lastY: y })

    ownerDocument.addEventListener('mousemove', onDrag as any, { capture: true })
    ownerDocument.addEventListener('mouseup', onMouseUp as any, { capture: true })
  }

  return {
    onMouseDown,
    onMouseUp
  }
}
