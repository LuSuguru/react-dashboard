import React, { cloneElement, ReactElement, CSSProperties, MouseEvent, useState, memo, FC } from 'react'
import { DraggableCoreProps, DraggableData } from 'draggable'
import classnames from 'clsx'

import { Axis, Direction, ResizeData } from '../type'
import ResizeHandle, { ResizeHandleProps, ResizeType } from './ResizeHandle'

export interface ResizableProps extends Omit<ResizeHandleProps, 'direction' | 'resizeHandler'> {
  axis?: Axis
  children: ReactElement
  className?: string
  style?: CSSProperties
  resizeHandles?: Direction[]
  draggableOpts?: DraggableCoreProps
  transformScale?: number
  width: number
  height: number
  lockAspectRatio?: boolean
  minConstraints?: [number, number]
  maxConstraints?: [number, number]
  onResizeStart?: (e: MouseEvent<HTMLElement>, data: ResizeData) => any
  onResize?: (e: MouseEvent<HTMLElement>, data: ResizeData) => any
  onResizeStop?: (e: MouseEvent<HTMLElement>, data: ResizeData) => any
}

const Resizable: FC<ResizableProps> = (props) => {
  const { children, className, style, resizeHandles, draggableOpts, handle, transformScale, axis, lockAspectRatio, minConstraints, maxConstraints } = props
  const [slack, setSlack] = useState({
    slackW: 0,
    slackH: 0
  })

  function runConstraints(width: number, height: number) {
    const [min, max] = [minConstraints, maxConstraints]
    if (!min && !max) {
      return [width, height]
    }

    if (lockAspectRatio) {
      if (height === props.height) { // 东西方向
        const ratio = props.width / props.height
        height = width / ratio
        width = height * ratio
      } else { // 南北方向
        const ratio = props.height / props.width
        width = height / ratio
        height = width * ratio
      }
    }

    const [oldW, oldH] = [width, height]

    // 做缓冲
    let { slackW, slackH } = slack
    width += slackW
    height += slackH

    if (min) {
      width = Math.max(min[0], width)
      height = Math.max(min[1], height)
    }

    if (max) {
      width = Math.min(max[0], width)
      height = Math.min(max[1], height)
    }

    slackW += (oldW - width)
    slackH += (oldH - height)

    console.log(slackW, slackH)

    if (slackW !== slack.slackW || slackH !== slack.slackH) {
      setSlack({ slackW, slackH })
    }

    return [width, height]
  }

  const resizeHandler = (resizeType: ResizeType, direction: Direction) => (e: MouseEvent<HTMLElement>, { node, deltaX, deltaY }: DraggableData) => {
    deltaX /= transformScale
    deltaY /= transformScale

    const canDragX = ['both', 'x'].includes(axis) && !['n', 's'].includes(direction)
    const canDragY = ['both', 'y'].includes(axis) && !['e', 'w'].includes(direction)

    // 西和北坐标距离是负的，需要反过来
    if (canDragX && direction[direction.length - 1] === 'w') {
      deltaX = -deltaX
    }
    if (canDragY && direction[0] === 'n') {
      deltaY = -deltaY
    }

    let width = props.width + (canDragX ? deltaX : 0)
    let height = props.height + (canDragY ? deltaY : 0)

    const widthChanged = width !== props.width
    const heightChanged = height !== props.height

    // 拖拽时没变化
    if (resizeType === 'onResize' && !widthChanged && !heightChanged) {
      return
    }

    [width, height] = runConstraints(width, height)

    // 拖拽时没变化
    if (resizeType === 'onResize' && !widthChanged && !heightChanged) {
      return
    }

    if (resizeType === 'onResizeStop') {
      setSlack({ slackW: 0, slackH: 0 })
    }

    if (typeof props[resizeType] === 'function') {
      props[resizeType](e, { node, size: { width, height }, direction })
    }
  }

  return cloneElement(React.Children.only(children), {
    className: classnames(children.props.className, className, 'react-resizable'),
    style: { ...children.props.style, ...style },
    children: [
      ...Array.isArray(children.props.children) ? children.props.children : [children.props.children],
      ...resizeHandles.map(direction => (
        <ResizeHandle
          key={direction}
          draggableOpts={draggableOpts}
          direction={direction}
          handle={handle}
          resizeHandler={resizeHandler} />))
    ]
  })
}

Resizable.defaultProps = {
  resizeHandles: ['se'],
  transformScale: 1,
  axis: 'both',
  minConstraints: [20, 20],
  maxConstraints: [Infinity, Infinity]
}

export default memo(Resizable)
