/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import rootSaga from './redux/sagas/sagaIndex';
import rootReducer from './redux/reducers/reducer';

const sagaMiddleware = createSagaMiddleware();

// NOTE: For debugging to work the Chrome Debugger needs the [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
const storeInstance = createStore(rootReducer, process.env.NODE_ENV === 'development'
  ? (
    compose(applyMiddleware(sagaMiddleware), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
  )
  : applyMiddleware(sagaMiddleware));


sagaMiddleware.run(rootSaga);

ReactDOM.render(<Provider store={storeInstance}>
  <App />
</Provider>, document.getElementById('root'));
