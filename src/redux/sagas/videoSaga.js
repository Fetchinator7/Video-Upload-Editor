import axios from 'axios';
import moment from 'moment';
import { eventChannel } from 'redux-saga';
import io from 'socket.io-client';
import { put, takeEvery, delay, select, call, take } from 'redux-saga/effects';

const view = 'view';
const visibility = 'visibility';
const password = 'password';
const output = 'output';
const uriKey = 'uri';
const SET_UPLOAD_FILES = 'SET_UPLOAD_FILES';
const OUTPUT_MESSAGE = 'OUTPUT_MESSAGE';
const VIDEO_ERROR_MESSAGE = 'VIDEO_ERROR_MESSAGE';
const HIDE_INVALID_CHARACTER_WARNING = 'HIDE_INVALID_CHARACTER_WARNING';

function* selectVideoFiles(action) {
  const globalState = yield select();
  let exportSeparateAudio;
  // If the global state for showing the checkboxes for separate audio is true default to
  // the boxes being selected/exportSeparateAudio = true, but it it's false no checkboxes will
  // be shown meaning there's no way for the user to change it so default to false.
  if (globalState.audioOnlyOption) {
    exportSeparateAudio = true;
  } else {
    exportSeparateAudio = false;
  }
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
        exportSeparateAudio: exportSeparateAudio,
        trimStart: '',
        trimEnd: ''
      }
    });
  } catch (error) {
    console.log('Error selecting video', error);
  }
}

const axiosPost = (argObj) => {
  return axios.post(argObj.url, argObj.payload);
};

function* uploadVideoFiles(action) {
  try {
    yield put({ type: HIDE_INVALID_CHARACTER_WARNING });
    yield put({ type: 'SET_RENDERING', payload: action.index });
    yield put({ type: 'OPEN_SOCKET' });
    const renderResponse = yield call(axiosPost, { url: '/video', payload: action.payload });
    yield put({ type: 'CLEAR_RENDERING', payload: action.index });
    yield put({ type: OUTPUT_MESSAGE, payload: renderResponse.data[output], index: action.index });

    yield put({ type: 'SET_UPLOADING', payload: action.index });
    const uploadResponse = yield axios.post('/vimeo', renderResponse.data.bodyObj);
    yield put({ type: OUTPUT_MESSAGE, payload: uploadResponse.data[output], index: action.index });

    const uriRes = uploadResponse.data;
    yield put({ type: 'CLEAR_UPLOADING', payload: action.index });

    const globalState = yield select();
    const updateArr = [...globalState.uploadFiles];
    updateArr[action.index] = { ...globalState.uploadFiles[action.index], [uriKey]: uriRes };
    yield put({ type: SET_UPLOAD_FILES, payload: updateArr });

    yield put({ type: 'UPDATE_VIDEO_VISIBILITY', payload: { [uriKey]: uriRes, [view]: action[visibility], [password]: action[password] } });
    yield put({ type: 'SET_TRANSCODING', payload: action.index });
    let transCoding = true;
    while (transCoding === true) {
      const transCodingResponse = yield axios.get(`/vimeo/transcode-status/${uriRes}`);
      yield put({ type: OUTPUT_MESSAGE, payload: transCodingResponse.data[output], index: action.index });
      yield delay(5000);
      if (transCodingResponse.data === 'Finished') {
        transCoding = false;
      }
    }
    yield put({ type: 'CLEAR_TRANSCODING', payload: action.index });
    yield put({ type: 'SET_UPLOADED', payload: action.index });
  } catch (error) {
    console.log('Error uploading video', error);
    console.log('error.response.data', error.response.data);
    yield put({ type: 'SET_UPLOAD_ERROR', payload: action.index });
    yield put({ type: VIDEO_ERROR_MESSAGE, payload: error.response ? error.response.data : error, index: action.index });
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
