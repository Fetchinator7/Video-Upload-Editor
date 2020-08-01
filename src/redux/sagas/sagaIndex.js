import { all } from 'redux-saga/effects';
import vimeoSaga from './vimeoSaga';
import videoSaga from './videoSaga';

export default function* rootSaga() {
  yield all([
    vimeoSaga(),
    videoSaga()
  ]);
}
