import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class HomePage extends Component {
  render() {
    return (
      <>
        <header className='App-header'>
          <h1>Homepage</h1>
        </header>
      </>
    );
  }
}

export default withRouter(HomePage);
