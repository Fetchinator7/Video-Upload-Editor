import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import { Button, TextField, CircularProgress } from '@material-ui/core';
import UsersJsonFile from './users.json';

class HomePage extends Component {
  state = {
    title: ''
  }

  render() {
    return (
      <>
        <header className='App-header'>
          <h1>Homepage</h1>
        </header>
        <TextField
          variant='outlined'
          placeholder='Video Title'
          value={this.state.title}
          type="text"
          onChange={(event) => {
            event.target.value.length <= 50 &&
              this.setState({
                title: event.target.value
              })
          }}
        />
        {this.props.loading && <CircularProgress />}
        <FormControl component='fieldset'>
          <RadioGroup
            aria-label='settings'
            name='settings1'
            value={this.props.user}
            onChange={
              event => this.props.dispatch({
                type: 'SET_USER',
                payload: event.target.value
              })
            }
          >
            <br />
            {UsersJsonFile.users.map((user, index) =>
              <FormControlLabel value={user} control={<Radio />} label={user} key={`user-options-${index}`} />
            )}
          </RadioGroup>
          <Button
            variant='contained'
            color='primary'
            disabled={!this.props.user}
            onClick={() => this.props.dispatch({
              type: 'UPLOAD_VIDEO_TO_VIMEO',
              payload: {
                videoPath: "/Users/Family/Luke-New/Scripts/Portfolio Projects/video-upload-editor/src/test-videos/Title.mp4",
                title: "Test Title",
                description: "Test Description"
              }
            })}
          >
            Upload Video
          </Button>
        </FormControl>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  loading: state.loading
});

export default connect(mapStateToProps)(withRouter(HomePage));
