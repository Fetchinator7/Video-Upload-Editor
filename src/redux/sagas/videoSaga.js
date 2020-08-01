import axios from 'axios';
import { put, takeEvery, delay } from 'redux-saga/effects';

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
    const uri = response.data.uri;
    yield put({ type: 'CLEAR_LOADING', payload: action.index });
    yield put({ type: 'SET_TRANSCODING', payload: action.index });
    let transCoding = true;
    while (transCoding === true) {
      const transCodingResponse = yield axios.get(`/vimeo/transcode-status/${uri}`);
      yield delay(5000);
      console.log('transCodingResponse.data', transCodingResponse.data);
      if (transCodingResponse.data === 'Finished') {
        transCoding = false;
      }
    }
    yield put({ type: 'CLEAR_TRANSCODING', payload: action.index });
  } catch (error) {
    console.log('Error uploading video', error);
    yield put({ type: 'SET_UPLOAD_ERROR', payload: action.index });
  } finally {
    yield put({ type: 'CLEAR_LOADING', payload: action.index });
    yield put({ type: 'CLEAR_TRANSCODING', payload: action.index });
    yield put({ type: 'ENABLE_EDITING' });
  }
}

function* videoSaga() {
  yield takeEvery('OPEN_PYTHON_FILE_PICKER', selectVideoFiles);
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO_AND_ARCHIVE_SOURCE', uploadVideoFiles);
}

export default videoSaga;
