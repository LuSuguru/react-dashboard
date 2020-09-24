import React, { FC, memo } from 'react'
import { ResponsiveGridLayout } from 'grid-layout'
import './style.less'

function generateLayout() {
  return new Array(20).fill(1).map((item, i) => {
    console.log(1)
    const y = Math.ceil(Math.random() * 4) + 1
    return {
      x: Math.round(Math.random() * 5) * 2,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: i.toString(),
      static: Math.random() < 0.05
    }
  })
}

const layouts = { lg: generateLayout() }

const Test = memo((props: any) => (
  <div {...props}>
    <span className="text">{props.children}</span>
  </div>
))

const GridLayoutExample: FC<any> = () => (
  <div>
    <div className="layoutJSON">
      <code>[x,y,w,h]</code>:
      <div className="columns">
        {layouts.lg.map(l => (
          <div className="layoutItem" key={l.i}>
            <b>{l.i}</b>
            {`: [${l.x}, ${l.y}, ${l.w}, ${l.h}]`}
          </div>
        ))}
      </div>
    </div>
    <div>
      <ResponsiveGridLayout
        layouts={layouts}
        resizeHandles={['se', 's', 'e']}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        containerPadding={[0, 0]}>
        {layouts.lg.map(l => (
          <div key={l.i}>
            <Test>{l.i}</Test>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  </div>
)

export default GridLayoutExample
