import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Player } from 'video-react';
import TestVideo from '../../test-videos/Title.mp4';

class VideoPlayer extends Component {
  render() {
    return (
      <>
        <header className='App-header'>
          <h1>Video Player</h1>
        </header>
        <Player
          playsInline
          src={TestVideo}
        />
      </>
    );
  }
}

export default withRouter(VideoPlayer);
