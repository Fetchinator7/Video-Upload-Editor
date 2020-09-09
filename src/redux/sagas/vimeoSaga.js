import axios from 'axios';
import { takeEvery, put } from 'redux-saga/effects';

const ENABLE_AUDIO_ONLY_OPTION = 'ENABLE_AUDIO_ONLY_OPTION';
const SET_INVALID_CHARACTER_ARRAY = 'SET_INVALID_CHARACTER_ARRAY';
const SET_INVALID_FILENAME_REPLACEMENT_CHARACTER = 'SET_INVALID_FILENAME_REPLACEMENT_CHARACTER';

function* confirmVimeoCredentialsExist() {
  try {
    // Start with an empty error string. The error message will be appended if there is one.
    let errorStr = '';

    const users = yield axios.get('/video/users');
    if (users.status === 204) {
      errorStr += `Heads up! No users have been specified so you'll only have the default "Other" option.
      See the README for more info on how to add your own users.
      If you want to dismiss this message but don't want to add users then include "USERS=[]" in the .env`;
      yield put({ type: 'SET_USERS', payload: [] });
    } else {
      yield put({ type: 'SET_USERS', payload: users.data });
    }

    const getURL = '/vimeo/verify-vimeo-credentials';
    // Check for the different environment variables and if one doesn't exist
    // append the error text for that value to the error message.
    const clientID = yield axios.get(`${getURL}/CLIENT_ID`);
    errorStr += clientID.data;
    const clientSecret = yield axios.get(`${getURL}/CLIENT_SECRET`);
    errorStr += clientSecret.data;
    const accessToken = yield axios.get(`${getURL}/ACCESS_TOKEN`);
    errorStr += accessToken.data;
    const outputPath = yield axios.get('/video/verify-output-path');
    errorStr += outputPath.data;
    const separateAudioOnly = yield axios.get('/video/check-separate-audio-only');
    if (separateAudioOnly.data === true) {
      yield put({ type: ENABLE_AUDIO_ONLY_OPTION });
    }
    const replaceInvalidFilenameCharactersWith = yield axios.get('/video/invalid-filename-replacement-character');
    yield put({ type: SET_INVALID_FILENAME_REPLACEMENT_CHARACTER, payload: replaceInvalidFilenameCharactersWith.data });
    const invalidFilenameCharacterArray = yield axios.get('/video/invalid-filename-character-array');
    yield put({ type: SET_INVALID_CHARACTER_ARRAY, payload: invalidFilenameCharacterArray.data });

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
