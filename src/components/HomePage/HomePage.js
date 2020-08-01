import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import { Button, CircularProgress } from '@material-ui/core';
import UsersJsonFile from './users.json';
import VideosTable from '../VideosTable/VideosTable';

class HomePage extends Component {
  render() {
    return (
      <>
        <header className='App-header'>
          <h1>Homepage</h1>
        </header>
        Select a user:
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
            onClick={() => this.props.dispatch({ type: 'OPEN_PYTHON_FILE_PICKER' })}
          >
            Upload File
          </Button>
        </FormControl>
        <VideosTable />
        <Button
          variant='contained'
          color='primary'
          disabled={(!this.props.user || this.props.videos.length === 0)}
          onClick={() =>
            this.props.dispatch({
              type: 'UPLOAD_VIDEO_TO_VIMEO',
              payload: {
                videoPath: '/vimeo',
                title: this.state.title,
                description: this.state.description
              }
            })}
        >
          Upload Video(s)
        </Button>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  loading: state.loading,
  videos: state.uploadFiles
});

export default connect(mapStateToProps)(withRouter(HomePage));
