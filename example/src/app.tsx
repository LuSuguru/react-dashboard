import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import DraggableExample from './components/DraggableExample'
import ResizableExample from './components/ResizeExample'

import './style.less'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">draggable</Link>
            </li>
            <li>
              <Link to="/resizable">resizable</Link>
            </li>
            {/* <li>
            <Link to="/users">Users</Link>
          </li> */}
          </ul>
        </nav>

        <Switch>
          <Route path="/resizable">
            <ResizableExample />
          </Route>
          <Route path="/">
            <DraggableExample />
          </Route>
          {/* <Route path="/">
          <Home />
        </Route> */}
        </Switch>
      </div>
    </Router>)
}

ReactDOM.render(<App />, document.getElementById('root'))


if (module.hot) {
  module.hot.accept()
}
