import React, { ReactElement, cloneElement, useRef, useState, useEffect, MouseEvent } from 'react'
import useDraggable, { DraggableData, Props as DraggableCoreProps, defaultCoreProps } from './useDraggable'

interface Position {
  x: number
  y: number
}

interface BoundRect {
  left: number
  right: number
  top: number
  bottom: number
}

interface Props extends DraggableCoreProps {
  children: ReactElement
  position: Position
  defaultPostion: Position
  bounds: BoundRect | string | boolean
}

function Draggable(props: Props) {
  const { position, defaultPostion = { x: 0, y: 0 }, children, bounds, scale, ...coreProps } = { ...defaultCoreProps, ...props }

  const [dragged, setDragged] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [slack, setSlack] = useState({
    slackX: 0,
    slackY: 0
  })
  const [state, setState] = useState({
    x: position?.x || defaultPostion?.x,
    y: position?.y || defaultPostion?.y
  })

  const nodeRef = useRef<HTMLElement>(null)

  useDraggable(nodeRef, {
    onStart: onDragStart,
    onDrag,
    onStop: onDragStop
  })

  useEffect(() => {
    setDragging(false)
  }, [])

  function createDraggableData(coreData: DraggableData): DraggableData {
    return {
      node: coreData.node,
      x: state.x + coreData.deltaX / scale,
      y: state.y + coreData.deltaY / scale,
      deltaX: coreData.deltaX / scale,
      deltaY: coreData.deltaY / scale,
      lastX: state.x,
      lastY: state.y
    }
  }

  function onDragStart(e: MouseEvent<HTMLElement>, coreData: DraggableData) {
    const shouldStart = props.onStart(e, createDraggableData(coreData))

    if (shouldStart === false) return false

    setDragging(true)
    setDragged(true)
  }

  function onDrag(e: MouseEvent<HTMLElement>, coreData: DraggableData) {
    if (!dragging) return false

    const uiData = createDraggableData(coreData)
    let { x, y } = uiData

    if (bounds) {
      x += slack.slackX
      y += slack.slackY



      const [newX, newY] = 
    }
  }

  return cloneElement(React.Children.only(children), {
    ref: nodeRef
  })
}

export default Draggable

export { useDraggable }
