import React, { memo, MouseEvent, useEffect, useState, FC } from 'react'
import Resizable, { ResizableProps } from './Resizable'
import { ResizeData } from '../type'

const ResizableBox: FC<ResizableProps> = (props) => {
  const [state, setState] = useState({
    width: props.width,
    height: props.height
  })
  const {
    axis, draggableOpts, handle, resizeHandles, transformScale, lockAspectRatio, minConstraints, maxConstraints,
    width: propsWidth,
    height: propsHeight,
    onResize: propsOnResize,
    onResizeStart, onResizeStop, ...otherProps } = props

  useEffect(() => {
    setState({ width: propsWidth, height: propsHeight })
  }, [propsWidth, propsHeight])

  function onResize(e: MouseEvent<HTMLElement>, data: ResizeData) {
    if (propsOnResize) { // 受控
      e?.persist()
      return propsOnResize(e, data)
    }

    setState(data.size) // 非受控
  }

  return (
    <Resizable
      onResize={onResize}
      {...state}
      {...{
        axis,
        draggableOpts,
        handle,
        resizeHandles,
        transformScale,
        lockAspectRatio,
        minConstraints,
        maxConstraints,
        onResizeStart,
        onResizeStop
      }}>
      <div style={{ width: `${state.width}px`, height: `${state.height}px` }} {...otherProps} />
    </Resizable>
  )
}

export default memo(ResizableBox)
