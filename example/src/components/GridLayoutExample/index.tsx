import React, { FC } from 'react'
import { GridLayout } from 'grid-layout'
import './style.less'

const layout = [
  { x: 0, y: 0, w: 2, h: 2, i: '0' },
  { x: 2, y: 0, w: 2, h: 5, i: '1' },
  { x: 4, y: 0, w: 2, h: 2, i: '2' },
  { x: 2, y: 5, w: 2, h: 2, i: '3' },
]

const GridLayoutExample: FC<any> = () => (
  <div>
    <div className="layoutJSON">
      <code>[x,y,w,h]</code>:
      <div className="columns">
        {layout.map(l => (
          <div className="layoutItem" key={l.i}>
            <b>{l.i}</b>
            {`: [${l.x}, ${l.y}, ${l.w}, ${l.h}]`}
          </div>
        ))}
      </div>
    </div>
    <div>
      <GridLayout layout={layout} width={800} cols={6} rowHeight={30} containerPadding={[0, 0]}>
        {layout.map(l => (
          <div key={l.i}>
            <span className="text">{l.i}</span>
          </div>
        ))}
      </GridLayout>
    </div>
  </div>
)

export default GridLayoutExample
