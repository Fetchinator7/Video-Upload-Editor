import React, { Component } from 'react';
import HomePage from '../HomePage';
import VideoPlayer from '../VideoPlayer';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import './App.css';

class App extends Component {
  render() {
    return (
      <>
        <Router>
          <ul className='nav'>
            <li>
              <NavLink exact to='/' activeClassName='active'>HOME</NavLink>
            </li>
            <li>
              <NavLink exact to='/video-player' activeClassName='active'>VIDEO PLAYER</NavLink>
            </li>
          </ul>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route exact path='/video-player'>
            <VideoPlayer />
          </Route>
        </Router>
      </>
    );
  }
}

export default App;
