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

export default combineReducers({
  user,
  loading
});
