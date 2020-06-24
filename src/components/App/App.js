import React, { Component } from 'react';
import HomePage from '../HomePage';
import Second from '../Second';
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
              <NavLink exact to='/second' activeClassName='active'>SECOND</NavLink>
            </li>
          </ul>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route exact path='/second'>
            <Second />
          </Route>
        </Router>
      </>
    );
  }
}

export default App;
