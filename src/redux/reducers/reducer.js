import { combineReducers } from 'redux';

const user = (state = '', action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    default:
      return state;
  }
};

const loading = (state = false, action) => {
  switch (action.type) {
    case 'SHOW_LOADING':
      return true;
    case 'HIDE_LOADING':
      return false;
    default:
      return state;
  }
};

const uploadFiles = (state = [], action) => {
  switch (action.type) {
    case 'SET_UPLOAD_FILES':
      // The user canceled the file upload so there's nothing to add.
      if (action.payload === '') {
        return state;
      } else if (typeof action.payload === 'string') {
        return [...state, action.payload];
      } else {
        return action.payload;
      }
    default:
      return state;
  }
};

export default combineReducers({
  user,
  loading,
  uploadFiles
});
