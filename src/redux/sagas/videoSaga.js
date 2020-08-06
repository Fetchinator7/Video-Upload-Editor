import axios from 'axios';
import moment from 'moment';
import { put, takeEvery, delay, select } from 'redux-saga/effects';

function* selectVideoFiles(action) {
  try {
    const response = yield axios.get('/video/file-picker', action.payload);
    yield put({
      type: 'SET_UPLOAD_FILES',
      payload: {
        path: response.data,
        title: `${moment().format('yyyy-MM-DD')} `,
        description: '',
        visibility: 'anybody',
        uri: '',
        password: '',
        exportSeparateAudio: true,
        dropDownIsOpen: false
      }
    });
  } catch (error) {
    console.log('Error uploading video', error);
  }
}

function* uploadVideoFiles(action) {
  try {
    yield put({ type: 'SET_RENDERING', payload: action.index });
    const renderResponse = yield axios.post('/video/', action.payload);
    yield put({ type: 'CLEAR_RENDERING', payload: action.index });

    yield put({ type: 'SET_UPLOADING', payload: action.index });
    const uploadResponse = yield axios.post('/vimeo', renderResponse.data.bodyObj);

    const uri = uploadResponse.data;
    yield put({ type: 'CLEAR_UPLOADING', payload: action.index });

    const globalState = yield select();
    const updateArr = globalState.uploadFiles.map((videoObj, index) => action.index === index ? { ...videoObj, uri: uri } : videoObj);
    yield put({ type: 'SET_UPLOAD_FILES', payload: updateArr });

    yield put({ type: 'UPDATE_VIDEO_VISIBILITY', payload: { uri: uri, view: action.visibility, password: action.password } });
    yield put({ type: 'SET_TRANSCODING', payload: action.index });
    let transCoding = true;
    while (transCoding === true) {
      const transCodingResponse = yield axios.get(`/vimeo/transcode-status/${uri}`);
      yield delay(5000);
      if (transCodingResponse.data === 'Finished') {
        transCoding = false;
      }
    }
    yield put({ type: 'CLEAR_TRANSCODING', payload: action.index });
    yield put({ type: 'SET_UPLOADED', payload: action.index });
  } catch (error) {
    console.log('Error uploading video', error);
    yield put({ type: 'SET_UPLOAD_ERROR', payload: action.index });
  } finally {
    yield put({ type: 'CLEAR_LOADING', payload: action.index });
    yield put({ type: 'CLEAR_TRANSCODING', payload: action.index });
    yield put({ type: 'CLEAR_RENDERING', payload: action.index });
    yield put({ type: 'CLEAR_UPLOADING', payload: action.index });
  }
}

function* exitProcess() {
  try {
    yield axios.get('/video/exit-process');
  } catch (error) {
    console.log('Clean exit.');
  }
}

function* videoSaga() {
  yield takeEvery('OPEN_PYTHON_FILE_PICKER', selectVideoFiles);
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO_AND_ARCHIVE_SOURCE', uploadVideoFiles);
  yield takeEvery('EXIT_PROCESS', exitProcess);
}

export default videoSaga;
