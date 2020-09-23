import React, { FC, memo } from 'react'
import { ResponsiveGridLayout } from 'grid-layout'
import './style.less'

const layouts = {
  lg: [
    { x: 0, y: 0, w: 2, h: 2, i: '0' },
    { x: 2, y: 0, w: 2, h: 5, i: '1' },
    { x: 4, y: 0, w: 2, h: 2, i: '2' },
    { x: 2, y: 5, w: 2, h: 2, i: '3' },
  ]
}

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
