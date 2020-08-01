import { all } from 'redux-saga/effects';
import vimeoSaga from './vimeoSaga';

export default function* rootSaga() {
  yield all([
    vimeoSaga()
  ]);
}
