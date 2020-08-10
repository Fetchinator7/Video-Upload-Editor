import { combineReducers } from 'redux';

const user = (state = '', action) => {
  // The string of which user is uploading.
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
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

const uploading = (state = [], action) => {
  // An array of ints that show which videos are uploading by their index.
  const stateArr = [...state];
  switch (action.type) {
    case 'SET_UPLOADING':
      stateArr.push(action.payload);
      return stateArr;
    case 'CLEAR_UPLOADING':
      stateArr.splice(stateArr.indexOf(action.payload), 1);
      return stateArr;
    default:
      return state;
  }
};

const transCoding = (state = [], action) => {
  // An array of ints that show which videos are transcoding by their index.
  const stateArr = [...state];
  switch (action.type) {
    case 'SET_TRANSCODING':
      stateArr.push(action.payload);
      return stateArr;
    case 'CLEAR_TRANSCODING':
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

export default combineReducers({
  user,
  rendering,
  uploadFiles,
  enableEditing,
  transCoding,
  uploadError,
  uploading,
  uploaded
});
