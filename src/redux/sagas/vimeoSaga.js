import axios from 'axios';
import { takeEvery, put } from 'redux-saga/effects';

function* confirmVimeoCredentialsExist() {
  try {
    const getURL = '/vimeo/verify-vimeo-credentials';
    // Start with an empty error string. The error message will be appended if there is one.
    let errorStr = '';

    // Check for the XXX environment variable and if it doesn't exist
    // append the error text for the new value of the error message.
    const clientID = yield axios.get(`${getURL}/CLIENT_ID`);
    errorStr += clientID.data;
    const clientSecret = yield axios.get(`${getURL}/CLIENT_SECRET`);
    errorStr += clientSecret.data;
    const accessToken = yield axios.get(`${getURL}/ACCESS_TOKEN`);
    errorStr += accessToken.data;
    const outputPath = yield axios.get('/video/verify-output-path/MAIN_OUTPUT_FOLDER');
    errorStr += outputPath.data;

    // Set the global state error message to the combined error message string.
    // If there's no text (because there was no error) nothing will change visibly.
    yield put({ type: 'SET_MISSING_ENV_ERROR_MESSAGE', payload: errorStr });
  } catch (error) {
    console.log('Error getting the env variables', error);
  }
}

function* uploadVideo(action) {
  // Upload the input video to Vimeo.
  try {
    yield axios.post('/vimeo/', action.payload);
  } catch (error) {
    console.log('Error uploading to Vimeo', error);
  }
}

function* updateVideoVisibility(action) {
  // Update the visibility for a video based of the uri.
  try {
    yield axios.patch('/vimeo/', action.payload);
  } catch (error) {
    console.log('Error updating video visibility', error);
  }
}

function* vimeoSaga() {
  yield takeEvery('CONFIRM_VIDEO_CREDENTIALS_EXIST', confirmVimeoCredentialsExist);
  yield takeEvery('UPLOAD_VIDEO_TO_VIMEO', uploadVideo);
  yield takeEvery('UPDATE_VIDEO_VISIBILITY', updateVideoVisibility);
}

export default vimeoSaga;
