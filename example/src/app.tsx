import React, { memo, useRef } from 'react'
import ReactDOM from 'react-dom'
import Draggable from 'draggable'

function App() {
  const ref = useRef(null)

  return (
    <Draggable>
      <div ref={ref}>
        1
      </div>
    </Draggable>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))


if (module.hot) {
  module.hot.accept()
}