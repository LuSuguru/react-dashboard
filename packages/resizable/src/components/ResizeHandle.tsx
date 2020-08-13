import React, { memo, useRef, RefObject, ReactElement, MouseEvent } from 'react'
import { useDraggable } from 'draggable'
import { DraggableCoreProps } from 'draggable/src/useDraggable'
import { DraggableData } from 'draggable/src/types'

import { Direction } from '../type'

export type ResizeType = 'onResizeStop' | 'onResizeStart' | 'onResize'

export interface ResizeHandleProps {
  draggableOpts?: DraggableCoreProps
  direction: Direction
  handle?: (resizeHandle: Direction, ref: RefObject<any>) => ReactElement | ReactElement
  resizeHandler: (resizeType: ResizeType, direction: Direction) => (e: MouseEvent<HTMLElement>, data: DraggableData) => any
}

function ResizeHandle(props: ResizeHandleProps) {
  const { direction, draggableOpts, handle, resizeHandler } = props
  const nodeRef = useRef(null)

  const { onMouseUp, onMouseDown } = useDraggable(nodeRef, {
    ...draggableOpts,
    onStop: resizeHandler('onResizeStop', direction),
    onDrag: resizeHandler('onResize', direction),
    onStart: resizeHandler('onResizeStart', direction),
  })

  if (handle) {
    if (typeof handle === 'function') {
      return handle(direction, nodeRef)
    }
    return React.cloneElement(handle, {
      ref: nodeRef
    })
  }

  return (
    <span
      className={`react-resizable-handle react-resizable-handle-${direction}`}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown} />)
}

export default memo(ResizeHandle)
