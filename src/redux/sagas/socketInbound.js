import { eventChannel } from 'redux-saga';
import { call, take, put } from 'redux-saga/effects';

// messages channel returns
function socketChannel(socket) {
  return new eventChannel((dispatch) => {
    socket.on('upload.progress', (data) => {
      console.log(data);
      console.log({ type: 'SET_UPLOADED', payload: data });
      dispatch({ type: 'SET_UPLOADED', payload: data });
    });

    socket.on('upload.finish', (data) => {
      console.log(data);
      console.log({ type: 'CLEAR_UPLOADED', payload: data });
      dispatch({ type: 'CLEAR_UPLOADED', payload: data });
    });

    // we need to return a unsubscriber function that handles any necessary cleanup
    // since we don't need any cleanup we just pass an empty function
    return () => {};
  });
}

// inbound handles passing actions from the event channel to
// the sagas
export function* inbound(socket) {
  const channel = yield call(socketChannel, socket);
  while (true) {
    const action = yield take(channel);
    console.log(action);
    yield put(action);
  }
}
