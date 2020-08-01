import axios from 'axios';
import { put, takeEvery } from 'redux-saga/effects';

function* uploadVideo(action) {
  try {
    yield put({ type: 'SHOW_LOADING' });
    yield axios.post('/vimeo/', action.payload);
  } catch (error) {
    console.log('Error uploading video', error);
  } finally {
    yield put({ type: 'HIDE_LOADING' });
  }
}

function* vimeoSaga() {
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO', uploadVideo);
}

export default vimeoSaga;
