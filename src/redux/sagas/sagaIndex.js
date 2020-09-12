import { all } from 'redux-saga/effects';
import vimeoSaga from './vimeoSaga';
import videoSaga from './videoSaga';
import { openSocket } from './socket';

export default function* rootSaga() {
  yield all([
    vimeoSaga(),
    videoSaga(),
    openSocket()
  ]);
}
