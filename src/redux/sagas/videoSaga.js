import axios from 'axios';
import { put, takeEvery } from 'redux-saga/effects';

function* selectVideoFiles(action) {
  try {
    const response = yield axios.get('/video/file-picker', action.payload);
    yield put({ type: 'SET_UPLOAD_FILES', payload: { path: response.data, title: '', description: '' } });
  } catch (error) {
    console.log('Error uploading video', error);
  }
}

function* uploadVideoFiles(action) {
  try {
    yield put({ type: 'SET_LOADING', payload: action.index });
    const response = yield axios.post('/video/', action.payload);
    console.log('uri', response.data.uri);
  } catch (error) {
    console.log('Error uploading video', error);
  } finally {
    yield put({ type: 'CLEAR_LOADING', payload: action.index });
  }
}

function* videoSaga() {
  yield takeEvery('OPEN_PYTHON_FILE_PICKER', selectVideoFiles);
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO_AND_ARCHIVE_SOURCE', uploadVideoFiles);
}

export default videoSaga;
