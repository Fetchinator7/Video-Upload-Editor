import { eventChannel } from 'redux-saga';
import { call, take, put } from 'redux-saga/effects';

function socketChannel(socket) {
  return new eventChannel((dispatch) => {
    socket.on('upload.progress', (data) => {
      dispatch({ type: 'SET_UPLOADING', payload: data });
    });

    socket.on('upload.finish', (data) => {
      dispatch({ type: 'REMOVE_UPLOADING', payload: data });
    });

    // We need to return an "unsubscriber" function that handles any necessary cleanup
    // but since no cleanup is necessary just pass an empty function.
    return () => {};
  });
}

// inbound handles passing actions from the event channel to
// the sagas
export function* inbound(socket) {
  const channel = yield call(socketChannel, socket);
  while (true) {
    const action = yield take(channel);
    yield put(action);
  }
}
