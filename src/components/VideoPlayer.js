import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class VideoPlayer extends Component {
  render() {
    return (
      <>
        <header className='App-header'>
          <h1>Video Player</h1>
        </header>
      </>
    );
  }
}

export default withRouter(VideoPlayer);
