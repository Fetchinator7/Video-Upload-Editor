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
      if (action.payload.path === '') {
        return state;
      } else if (action.payload.length) {
        return action.payload;
      } else {
        return [...state, action.payload];
      }
    case 'CLEAR_UPLOAD_FILES':
      return [];
    default:
      return state;
  }
};

export default combineReducers({
  user,
  loading,
  uploadFiles
});
