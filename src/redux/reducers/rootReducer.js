import { combineReducers } from 'redux';
import primary from './reducer';
import errors from './errorsReducer';

/*
 * RootReducer is the primary reducer for our entire project
 * It bundles up all of the other reducers so our project can use them.
 * This is imported in index.js as rootSaga
 */
const rootReducer = combineReducers({
  primary,
  errors
});

export default rootReducer;
