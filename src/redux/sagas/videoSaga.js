import axios from 'axios';
import { put, takeEvery } from 'redux-saga/effects';

function* uploadVideoFiles(action) {
  try {
    console.log('saga');
    const response = yield axios.get('/video/file-picker', action.payload);
    yield put({ type: 'SET_UPLOAD_FILES', payload: response.data });
  } catch (error) {
    console.log('Error uploading video', error);
  }
}

function* videoSaga() {
  yield takeEvery('OPEN_PYTHON_FILE_PICKER', uploadVideoFiles);
}

export default videoSaga;
