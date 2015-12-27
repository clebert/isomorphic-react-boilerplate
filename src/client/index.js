import {createHistory} from 'history'
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import React from 'react'
import reducer from '../shared/reducer'
import {render} from 'react-dom'
import route from '../shared/route'
import {Router} from 'react-router'
import sendJsonAsync from './utils/send-json-async'
import {pushPath, syncReduxAndRouter} from 'redux-simple-router'

const store = createStore(reducer, window.__state)

store.subscribe(async () => {
  try {
    await sendJsonAsync(store.getState(), '/api/sync-state')
  } catch (e) {
    if (window.location.pathname !== '/oops') {
      store.dispatch(pushPath('/oops'))
    }
  }
})

const history = createHistory()

syncReduxAndRouter(history, store)

render((
  <Provider store={store}>
    <Router history={history}>{route}</Router>
  </Provider>
), document.querySelector('main'))
