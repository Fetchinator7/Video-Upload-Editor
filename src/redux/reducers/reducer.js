import { combineReducers } from 'redux';

const ENABLE_AUDIO_ONLY_OPTION = 'ENABLE_AUDIO_ONLY_OPTION';
const VIDEO_ERROR_MESSAGE = 'VIDEO_ERROR_MESSAGE';
const OUTPUT_MESSAGE = 'OUTPUT_MESSAGE';
const SET_INVALID_FILENAME_REPLACEMENT_CHARACTER = 'SET_INVALID_FILENAME_REPLACEMENT_CHARACTER';
const SET_INVALID_CHARACTER_ARRAY = 'SET_INVALID_CHARACTER_ARRAY';
const DISPLAY_INVALID_CHARACTER_WARNING = 'DISPLAY_INVALID_CHARACTER_WARNING';
const HIDE_INVALID_CHARACTER_WARNING = 'HIDE_INVALID_CHARACTER_WARNING';
const SET_TRANSCODING = 'SET_TRANSCODING';
const CLEAR_TRANSCODING = 'CLEAR_TRANSCODING';
const SET_UPLOADING = 'SET_UPLOADING';
const REMOVE_UPLOADING = 'REMOVE_UPLOADING';
const invalidCharArr = 'invalidCharArr';
const replaceInvalidCharacterWithKey = 'replaceInvalidCharacterWithKey';

const user = (state = '', action) => {
  // The string of which user is uploading.
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    default:
      return state;
  }
};

const users = (state = [], action) => {
  // Hold the different users that will be options for the radio buttons in an array.
  switch (action.type) {
    case 'SET_USERS':
      return action.payload;
    default:
      return state;
  }
};

const audioOnlyOption = (state = false, action) => {
  // A boolean that uses conditional rendering to either show or hide things based on it the
  // user started the upload process.
  switch (action.type) {
    case ENABLE_AUDIO_ONLY_OPTION:
      return true;
    default:
      return state;
  }
};

const rendering = (state = [], action) => {
  // An array of ints that show which videos are rendering by their index.
  const stateArr = [...state];
  switch (action.type) {
    case 'SET_RENDERING':
      stateArr.push(action.payload);
      return stateArr;
    case 'CLEAR_RENDERING':
      stateArr.splice(stateArr.indexOf(action.payload), 1);
      return stateArr;
    default:
      return state;
  }
};

const uploading = (state = {}, action) => {
  let returnMessage = { ...state };
  switch (action.type) {
    case SET_UPLOADING:
      returnMessage = { ...state, ...action.payload };
      return returnMessage;
    case REMOVE_UPLOADING:
      delete returnMessage[String(action.payload)];
      return returnMessage;
    default:
      return state;
  }
};

const transCoding = (state = [], action) => {
  // An array of ints that show which videos are transcoding by their index.
  const stateArr = [...state];
  switch (action.type) {
    case SET_TRANSCODING:
      stateArr.push(action.payload);
      return stateArr;
    case CLEAR_TRANSCODING:
      stateArr.splice(stateArr.indexOf(action.payload), 1);
      return stateArr;
    default:
      return state;
  }
};

const uploaded = (state = [], action) => {
  // An array of ints that show which videos have uploaded by their index.
  const stateArr = [...state];
  switch (action.type) {
    case 'SET_UPLOADED':
      stateArr.push(action.payload);
      return stateArr;
    default:
      return state;
  }
};

const uploadError = (state = [], action) => {
  // An array of ints that show which videos had an error based on their index.
  const stateArr = [...state];
  switch (action.type) {
    case 'SET_UPLOAD_ERROR':
      stateArr.push(action.payload);
      return stateArr;
    case 'CLEAR_UPLOAD_ERROR':
      stateArr.splice(stateArr.indexOf(action.payload), 1);
      return stateArr;
    default:
      return state;
  }
};

const uploadFiles = (state = [], action) => {
  switch (action.type) {
    case 'SET_UPLOAD_FILES':
      // The user canceled the file upload so there's nothing to add.
      if (action.payload.path === '') {
        return state;
      } else if (action.payload.length) {
        return action.payload;
        // The user removed all of the file they had selected to upload.
      } else if (action.payload.length === 0) {
        return [];
      } else {
        return [...state, action.payload];
      }
    case 'CLEAR_UPLOAD_FILES':
      return [];
    default:
      return state;
  }
};

const enableEditing = (state = true, action) => {
  // A boolean that uses conditional rendering to either show or hide things based on it the
  // user started the upload process.
  switch (action.type) {
    case 'ENABLE_EDITING':
      return true;
    case 'DISABLE_EDITING':
      return false;
    default:
      return state;
  }
};

const outputMessage = (state = {}, action) => {
  // This holds a text field for all of the successful output from python.
  // This will assign the key to the index of which video has the error and a value of the error text.
  let returnMessage = { ...state };
  if (action.payload) {
    returnMessage = { ...state, [String(action.index)]: action.payload };
  }
  switch (action.type) {
    case OUTPUT_MESSAGE:
      return returnMessage;
    default:
      return state;
  }
};

const videoErrorMessage = (state = {}, action) => {
  // This holds a text field for all of the error output from python.
  // This will assign the key to the index of which video has the error and a value of the error text.
  let returnMessage = { ...state };
  if (action.payload) {
    returnMessage = { ...state, [String(action.index)]: action.payload };
  }
  switch (action.type) {
    case VIDEO_ERROR_MESSAGE:
      return returnMessage;
    default:
      return state;
  }
};

const errorMessage = (state = '', action) => {
  // A string to displays an error message if at least one of the environment variables is undefined.
  switch (action.type) {
    case 'SET_MISSING_ENV_ERROR_MESSAGE':
      return action.payload;
    default:
      return state;
  }
};

const invalidCharactersArrayPlatformSpecific = (state = [], action) => {
  // This is the array that holds the invalid characters base on the current operating system.
  switch (action.type) {
    case SET_INVALID_CHARACTER_ARRAY:
      return action.payload;
    default:
      return state;
  }
};

const displayInvalidFilenameCharacterWarning = (state = false, action) => {
  // This warning will appear on the bottom left if the user entered invalid filename
  // characters for the video title.
  switch (action.type) {
    case DISPLAY_INVALID_CHARACTER_WARNING:
      return `Heads up! Filenames can't contain ${action[invalidCharArr].map(char => `"${char}"`)} so the video title will stay the same, but those invalid filename characters will be replaced with "${action[replaceInvalidCharacterWithKey]}" for the output filename and/or input filename.`;
    case HIDE_INVALID_CHARACTER_WARNING:
      return '';
    default:
      return state;
  }
};

const characterToReplaceInvalidFilenameCharactersWith = (state = '', action) => {
  // This is the character to replace invalid filename characters with. By default it removes the character,
  // but the user can change that by setting REPLACE_INVALID_FILENAME_CHARACTERS_WITH in the .env
  switch (action.type) {
    case SET_INVALID_FILENAME_REPLACEMENT_CHARACTER:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  user,
  users,
  audioOnlyOption,
  rendering,
  uploadFiles,
  enableEditing,
  transCoding,
  uploadError,
  uploading,
  uploaded,
  outputMessage,
  videoErrorMessage,
  errorMessage,
  invalidCharactersArrayPlatformSpecific,
  displayInvalidFilenameCharacterWarning,
  characterToReplaceInvalidFilenameCharactersWith
});
