import { take, call, fork } from 'redux-saga/effects';
import io from 'socket.io-client';
import { inbound } from './socketEvents';

// connect establishes the saga socket.io connection with the server.
function connect() {
  // Create our socket
  const socket = io("http://localhost:5000");

  // Return a promise that automatically resolves once the socket
  // connection is established.
  return new Promise((resolve) => {
    socket.on('connect', () => {
      resolve(socket);
    });
  });
}

//
export function* openSocket() {
  // begin upon receiving the OPEN_SOCKET dispatch
  while (true) {
    yield take('OPEN_SOCKET');
    // get our socket from connect
    const socket = yield call(connect);

    // pass our socket to our inbound and outbound sagas
    yield fork(inbound, socket);
  }
}
