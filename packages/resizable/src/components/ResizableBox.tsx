import React, { memo, MouseEvent, useEffect, useState } from 'react'
import Resizable, { ResizableProps } from './resizable'
import { ResizeData } from '../type'

function ResizableBox(props: ResizableProps) {
  const [state, setState] = useState({
    width: props.width,
    height: props.height
  })
  const {
    axis, draggableOpts, handle, resizeHandles, transformScale, lockAspectRadio, minConstraints, maxConstraints,
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
        lockAspectRadio,
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
