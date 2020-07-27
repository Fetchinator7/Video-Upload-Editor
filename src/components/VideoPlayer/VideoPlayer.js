import React, { Component } from 'react';
// import { PrismCode } from 'react-prism';
import { Player, ControlBar, ForwardControl, Shortcut } from 'video-react';
// import { button } from 'reactstrap';
import './VideoPlayer.css';
import '../../../node_modules/video-react/dist/video-react.css';
import TestVideo from '../../test-videos/Title.mp4';
// import TestVideo from '../../test-videos/Title.mov';

export default class PlayerControlExample extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      source: TestVideo
    };

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.load = this.load.bind(this);
    this.changeCurrentTime = this.changeCurrentTime.bind(this);
    this.seek = this.seek.bind(this);
    this.changePlaybackRateRate = this.changePlaybackRateRate.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.setMuted = this.setMuted.bind(this);
  }

  componentDidMount() {
    // subscribe state change
    this.player.subscribeToStateChange(this.handleStateChange.bind(this));
  }

  setMuted(muted) {
    return () => {
      this.player.muted = muted;
    };
  }

  handleStateChange(state) {
    // copy player state to this component's state
    this.setState({
      player: state
    });
  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  load() {
    this.player.load();
  }

  changeCurrentTime(seconds) {
    return () => {
      const { player } = this.player.getState();
      this.player.seek(player.currentTime + seconds);
    };
  }

  seek(seconds) {
    return () => {
      this.player.seek(seconds);
    };
  }

  changePlaybackRateRate(steps) {
    return () => {
      const { player } = this.player.getState();
      this.player.playbackRate = player.playbackRate + steps;
    };
  }

  changeVolume(steps) {
    return () => {
      const { player } = this.player.getState();
      this.player.volume = player.volume + steps;
    };
  }

  render() {
    return (
      <div className='video'>
        <header className='App-header'>
          <h1>Video Player</h1>
        </header>
        <Player
          className='video'
          ref={player => {
            this.player = player;
          }}
          autoPlay
          playsInline
          // src={this.state.source}
          src='https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
        >
          <Shortcut clickable={false} shortcuts={this.newShortcuts} />
          <source src={this.state.source} />
          <ControlBar autoHide={false}>
            <ForwardControl seconds={5} order={3.1} />
            <ForwardControl seconds={10} order={3.2} />
            <ForwardControl seconds={30} order={3.3} />
          </ControlBar>
        </Player>
        {/* <div className="py-3">
          <button onClick={this.play} className="mr-3">
            play()
          </button>
          <button onClick={this.pause} className="mr-3">
            pause()
          </button>
          <button onClick={this.load} className="mr-3">
            load()
          </button>
        </div>
        <div className="pb-3">
          <button onClick={this.changeCurrentTime(10)} className="mr-3">
            currentTime += 10
          </button>
          <button onClick={this.changeCurrentTime(-10)} className="mr-3">
            currentTime -= 10
          </button>
          <button onClick={this.seek(50)} className="mr-3">
            currentTime = 50
          </button>
        </div>
        <div className="pb-3">
          <button onClick={this.changePlaybackRateRate(1)} className="mr-3">
            playbackRate++
          </button>
          <button onClick={this.changePlaybackRateRate(-1)} className="mr-3">
            playbackRate--
          </button>
          <button onClick={this.changePlaybackRateRate(0.1)} className="mr-3">
            playbackRate+=0.1
          </button>
          <button onClick={this.changePlaybackRateRate(-0.1)} className="mr-3">
            playbackRate-=0.1
          </button>
        </div>
        <div className="pb-3">
          <button onClick={this.changeVolume(0.1)} className="mr-3">
            volume+=0.1
          </button>
          <button onClick={this.changeVolume(-0.1)} className="mr-3">
            volume-=0.1
          </button>
          <button onClick={this.setMuted(true)} className="mr-3">
            muted=true
          </button>
          <button onClick={this.setMuted(false)} className="mr-3">
            muted=false
          </button>
        </div> */}
        {JSON.stringify(this.state.player, null, 2)}
        <div>State</div>
        {/* <pre>
          <PrismCode className="language-json">
            {JSON.stringify(this.state.player, null, 2)}
          </PrismCode>
        </pre> */}
      </div>
    );
  }
}
