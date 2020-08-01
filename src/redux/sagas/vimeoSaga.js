import axios from 'axios';
import { takeEvery } from 'redux-saga/effects';

function* uploadVideo(action) {
  try {
    yield axios.post('/vimeo/', action.payload);
  } catch (error) {
    console.log('Error uploading video', error);
  }
}

function* vimeoSaga() {
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO', uploadVideo);
}

export default vimeoSaga;
