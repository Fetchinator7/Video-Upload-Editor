import axios from 'axios';
import { takeEvery } from 'redux-saga/effects';

function* uploadVideo(action) {
  try {
    yield axios.post('/vimeo/', action.payload);
  } catch (error) {
    console.log('Error uploading to Vimeo', error);
  }
}

function* updateVideoVisibility(action) {
  try {
    yield axios.patch('/vimeo/', action.payload);
  } catch (error) {
    console.log('Error updating video visibility', error);
  }
}

function* vimeoSaga() {
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO', uploadVideo);
  yield takeEvery('UPDATE_VIDEO_VISIBILITY', updateVideoVisibility);
}

export default vimeoSaga;
