import React, { useState, forwardRef } from 'react'
import ResizableBox, { Resizable } from 'resizable'
import './style.less'

export default function () {
  const [state, setState] = useState({ width: 200, height: 200 })


  const onClick = () => {
    setState({ width: 200, height: 200 })
  }

  const onResize = (event, { node, size, direction }) => {
    setState({ width: size.width, height: size.height })
  }


  return (
    <div>
      <button onClick={onClick} style={{ marginBottom: '10px' }}>Reset first element's width/height</button>
      <div className="layoutRoot">
        <Resizable className="box" height={state.height} width={state.width} onResize={onResize} resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}>
          <div className="box" style={{ width: state.width + 'px', height: state.height + 'px' }}>
            <span className="text">普通的伸缩组件 200 x 200</span>
          </div>
        </Resizable>
        <ResizableBox className="box" width={200} height={200}>
          <span className="text">ResizableBox</span>
        </ResizableBox>
        <ResizableBox
          className="custom-box box"
          width={200}
          height={200}
          handle={<span className="custom-handle custom-handle-se" />}>
          <span className="text">更换东南方向的下标</span>
        </ResizableBox>
        <ResizableBox
          className="custom-box box"
          width={200}
          height={200}
          handle={(d, ref, handle) => <span className={`custom-handle custom-handle-${d}`} ref={ref} {...handle} />}
          resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}>
          <span className="text">每个方向都有自定义标记</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} draggableOpts={{ grid: [25, 25] }}>
          <span className="text">每次固定25px</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} lockAspectRatio>
          <span className="text">锁了长宽比</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} minConstraints={[150, 150]} maxConstraints={[500, 300]}>
          <span className="text">最小150*150，最大500*300</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={120} lockAspectRatio>
          <span className="text">锁长宽比</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} axis="x">
          <span className="text">只能X轴拖动</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} axis="y">
          <span className="text">只能Y轴拖动</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} axis="both">
          <span className="text">都可以拖动</span>
        </ResizableBox>
        <ResizableBox className="box" width={200} height={200} axis="none">
          <span className="text">不能拖动</span>
        </ResizableBox>
      </div>
    </div>
  )
}
