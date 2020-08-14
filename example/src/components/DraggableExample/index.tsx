import React, { useState, MouseEvent, forwardRef } from 'react'
import Draggable from 'draggable/index'

const Box = forwardRef((props, ref) => <div className="box" ref={ref} {...props}>有包裹层</div>)

function DraggableExample() {
  const [deltaPosition, setDeltaPosition] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: -400, y: 200 })

  function onControlledDrag(e, pos) {
    const { x, y } = pos
    console.log(position)
    setPosition({ x, y })
  }

  function onDrag(e, uiData) {
    setDeltaPosition({ x: deltaPosition.x + uiData.deltaX, y: deltaPosition.y + uiData.deltaY })
  }

  function onChangeXPos(e: MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()

    const { x, y } = position
    setPosition({
      x: x - 10,
      y
    })
  }

  function onChangeYPos(e: MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()

    const { x, y } = position
    setPosition({
      x,
      y: y - 10
    })
  }

  return (
    <div className="layoutRoot">
      <Draggable position={position} onStop={onControlledDrag}>
        <Box />
      </Draggable>
      <Draggable>
        <div className="box">任意移动</div>
      </Draggable>
      <Draggable axis="x">
        <div className="box cursor-x">只能 X 轴</div>
      </Draggable>
      <Draggable axis="y">
        <div className="box cursor-y">只能 Y 轴</div>
      </Draggable>
      <Draggable onStart={() => false}>
        <div className="box">不能移动</div>
      </Draggable>
      <Draggable onDrag={onDrag}>
        <div className="box">
          <div>有坐标</div>
          <div>x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}</div>
        </div>
      </Draggable>
      <Draggable handle="strong">
        <div className="box no-cursor">
          <strong className="cursor">
            <div>点击这里拖拽</div>
          </strong>
          <div>部分区域可拖拽</div>
        </div>
      </Draggable>
      <Draggable handle="strong">
        <div className="box no-cursor" style={{ display: 'flex', flexDirection: 'column' }}>
          <strong className="cursor">
            <div>点击这里拖拽</div>
          </strong>
          <div style={{ overflow: 'scroll' }}>
            <div style={{ background: 'yellow', whiteSpace: 'pre-wrap' }}>
              长列表
              {'\n' + Array(40).fill('爱').join('\n')}
            </div>
          </div>
        </div>
      </Draggable>
      <Draggable cancel="strong">
        <div className="box">
          <strong className="no-cursor">点击这里不能拖拽</strong>
          <div>不可拖拽</div>
        </div>
      </Draggable>
      <Draggable grid={[25, 25]}>
        <div className="box">25 x 25 间隔</div>
      </Draggable>
      <Draggable grid={[50, 50]}>
        <div className="box">50 x 50 间隔</div>
      </Draggable>
      <Draggable bounds={{ top: -100, left: -100, right: 100, bottom: 100 }} onDrag={onDrag}>
        <div className="box">我只能移动 周围100像素 x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}</div>
      </Draggable>

      <div className="box" style={{ height: '500px', width: '500px', position: 'relative', overflow: 'auto', padding: '0' }}>
        <div style={{ height: '1000px', width: '1000px', padding: '10px' }}>
          <Draggable bounds="parent">
            <div className="box">
              只能在父元素内拖拽移动
            </div>
          </Draggable>
          <Draggable bounds="parent">
            <div className="box">
              只能在父元素内拖拽移动
            </div>
          </Draggable>
        </div>
      </div>

      <Draggable>
        <div className="box" style={{ position: 'absolute', bottom: '100px', right: '100px' }}>
          绝对定位元素
        </div>
      </Draggable>
      <Draggable defaultPosition={{ x: 25, y: 25 }}>
        <div className="box">
          {"有默认位置 {x: 25, y: 25}"}
        </div>
      </Draggable>
      <Draggable positionOffset={{ x: '-10%', y: '-10%' }}>
        <div className="box">
          {'有位置偏移 {x: \'-10%\', y: \'-10%\'}'}
        </div>
      </Draggable>
      <Draggable position={position} onDrag={onControlledDrag}>
        <div className="box">
          受控的
          <div>
            <a href="#" onClick={onChangeXPos}>控制 x ({position.x})</a>
          </div>
          <div>
            <a href="#" onClick={onChangeYPos}>控制 y ({position.y})</a>
          </div>
        </div>
      </Draggable>
      <Draggable position={position} onStop={onControlledDrag}>
        <div className="box">
          受控的,只在停止时移动
          <div>
            <a href="#" onClick={onChangeXPos}>控制 x ({position.x})</a>
          </div>
          <div>
            <a href="#" onClick={onChangeYPos}>控制 y ({position.y})</a>
          </div>
        </div>
      </Draggable>
    </div>
  )
}

export default DraggableExample
