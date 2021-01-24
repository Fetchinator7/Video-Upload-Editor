import { combineReducers } from 'redux';
const SET_FILE_SELECTION_ERROR = 'SET_FILE_SELECTION_ERROR';

const fileSelection = (state = '', action) => {
  switch (action.type) {
    case SET_FILE_SELECTION_ERROR:
      // return '';
      return 'Error getting selected file path. (Set IGNORE_FILE_SELECTION_ERRORS=true in the .env and reload the project to disable this error.)';
    default:
      return state;
  }
};

export default combineReducers({ fileSelection });
