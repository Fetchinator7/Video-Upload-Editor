import React, { Component } from 'react';
import { connect } from 'react-redux';
import SearchTablePresets from '../VideosTable/VideosTableDefaults';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import { Button, createMuiTheme, MuiThemeProvider, FormLabel } from '@material-ui/core';
import VideosTable from '../VideosTable/VideosTable';
import RadioButton from '../RadioButton';
import io from 'socket.io-client';
import './App.css';
const socket = io();

const characterToReplaceInvalidFilenameCharactersWith = 'characterToReplaceInvalidFilenameCharactersWith';
const displayInvalidFilenameCharacterWarning = 'displayInvalidFilenameCharacterWarning';
const title = 'title';

const useStyles = createMuiTheme(
  SearchTablePresets.theme
);

const isDisabled = (user, videos, enableEditing) => {
  if (user === '' || videos.length === 0 || videos.some(videoObj => videoObj[title] === '') || videos.some(videoObj => String(videoObj[title]).slice(-1) === ' ' || !enableEditing)) {
    return true;
  } else {
    return false;
  }
}
class HomePage extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'CONFIRM_VIDEO_CREDENTIALS_EXIST' });
    this.props.dispatch({ type: 'OPEN_SOCKET' });
  }

  render() {
    const userSelected = Boolean(this.props.user);
    return (
      <>
        {/* If an environment variable is undefined show warning text
        but still allow the application to be used as normal. */}
        <h2 className='text'>{this.props.errorMessage}</h2>
        <MuiThemeProvider theme={useStyles}>
          <header className='text'>
            <h1>Select Video(s) To Upload:</h1>
          </header>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>Select a user:</FormLabel>
            <RadioGroup
              value={this.props.user}
              disabled={!this.props.enableEditing}
              onChange={
                event => this.props.enableEditing && this.props.dispatch({
                  type: 'SET_USER',
                  payload: event.target.value
                })
              }
            >
              {this.props.users.map((user, index) =>
                <FormControlLabel
                  value={user}
                  control={userSelected ? <RadioButton.selectedRadioButton /> : <RadioButton.emptyRadioButton />}
                  label={user}
                  className='text'
                  key={`user-radio-buttons-${index}`}
                />
              )}
              <FormControlLabel
                value='Other'
                control={userSelected ? <RadioButton.selectedRadioButton /> : <RadioButton.emptyRadioButton />}
                className='text'
                label='Other'
              />
            </RadioGroup>
          </FormControl>
          <br />
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              socket.emit('hey', { 0: 42.8 });
              socket.emit('upload.progress', { 0: 22.8 });
            }}
          >
            Connect
          </Button>
          <Button
            variant='contained'
            color='primary'
            disabled={!this.props.enableEditing}
            onClick={() => this.props.dispatch({ type: 'OPEN_PYTHON_FILE_PICKER' })}
          >
            Add File
          </Button>
          <Button
            variant='contained'
            color='primary'
            // Confirm that a user has been selected, there's at least one video to upload,
            // and each video has a title (not an empty string).
            disabled={isDisabled(this.props.user, this.props.videos, this.props.enableEditing)}
            onClick={() => {
              this.props.dispatch({ type: 'DISABLE_EDITING' });
              this.props.videos.map((videoObj, index) => {
                this.props.dispatch({
                  type: 'UPLOAD_VIDEO_TO_VIMEO_AND_ARCHIVE_SOURCE',
                  payload: {
                    videoPath: videoObj.path,
                    title: videoObj.title,
                    description: videoObj.description,
                    userName: this.props.user,
                    exportSeparateAudio: videoObj.exportSeparateAudio,
                    trimStart: videoObj.trimStart,
                    trimEnd: videoObj.trimEnd,
                    [characterToReplaceInvalidFilenameCharactersWith]: this.props[characterToReplaceInvalidFilenameCharactersWith]
                  },
                  visibility: videoObj.visibility,
                  index: index,
                  password: videoObj.password
                });
                // Suppress "Expected to return a value in arrow function" compile warning.
                return '';
              });
            }}
          >
            Upload Video(s)
          </Button>
          <VideosTable />
          <div id={this.props[displayInvalidFilenameCharacterWarning] ? 'invalidCharacterWarning' : undefined}>{this.props[displayInvalidFilenameCharacterWarning]}</div>
        </MuiThemeProvider>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  users: state.users,
  enableEditing: state.enableEditing,
  loading: state.loading,
  videos: state.uploadFiles,
  outputMessage: state.outputMessage,
  videoErrorMessage: state.videoErrorMessage,
  errorMessage: state.errorMessage,
  [characterToReplaceInvalidFilenameCharactersWith]: state[characterToReplaceInvalidFilenameCharactersWith],
  [displayInvalidFilenameCharacterWarning]: state[displayInvalidFilenameCharacterWarning]
});

export default connect(mapStateToProps)(HomePage);
