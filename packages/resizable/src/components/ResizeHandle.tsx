import React, { memo, RefObject, ReactElement, MouseEvent, FC } from 'react'
import { useDraggable, DraggableCoreProps, DraggableData } from 'draggable'

import { Direction } from '../type'

export type ResizeType = 'onResizeStop' | 'onResizeStart' | 'onResize'

type HandleFunction = (
  resizeHandle: Direction, ref: RefObject<any>,
  handle: {
    onMouseUp: (e: MouseEvent<HTMLElement>) => any
    onMouseDown: (e: MouseEvent<HTMLElement>) => any
  }) => ReactElement

export interface ResizeHandleProps {
  draggableOpts?: DraggableCoreProps
  direction: Direction
  handle?: HandleFunction | ReactElement
  resizeHandler: (resizeType: ResizeType, direction: Direction) => (e: MouseEvent<HTMLElement>, data: DraggableData) => any
}

const ResizeHandle: FC<ResizeHandleProps> = (props) => {
  const { direction, draggableOpts, handle, resizeHandler } = props

  const { onMouseUp, onMouseDown, nodeRef } = useDraggable({
    ...draggableOpts,
    onStop: resizeHandler('onResizeStop', direction),
    onDrag: resizeHandler('onResize', direction),
    onStart: resizeHandler('onResizeStart', direction),
  })

  if (handle) {
    if (typeof handle === 'function') {
      return handle(direction, nodeRef, { onMouseDown, onMouseUp })
    }

    return React.cloneElement(handle, {
      ref: nodeRef,
      onMouseUp,
      onMouseDown
    })
  }

  return (
    <span
      ref={nodeRef}
      className={`react-resizable-handle react-resizable-handle-${direction}`}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown} />)
}

export default memo(ResizeHandle)
