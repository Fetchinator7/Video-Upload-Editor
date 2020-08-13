import React, { Component } from 'react';
import { connect } from 'react-redux';
import SearchTablePresets from '../VideosTable/VideosTableDefaults';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import { Button, createMuiTheme, MuiThemeProvider, FormLabel } from '@material-ui/core';
import UsersJsonFile from '../../users.json';
import VideosTable from '../VideosTable/VideosTable';
import './App.css';

const useStyles = createMuiTheme(
  SearchTablePresets.theme
);

class HomePage extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'CONFIRM_VIDEO_CREDENTIALS_EXIST' });
  }

  render() {
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
              {UsersJsonFile.users.map((users, index) =>
                <FormControlLabel
                  value={users}
                  control={<Radio />}
                  label={users}
                  className='text'
                  key={`user-options-${index}`}
                />
              )}
              <FormControlLabel
                value='Other'
                control={<Radio />}
                className='text'
                label='Other'
              />
            </RadioGroup>
          </FormControl>
          <br />
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
            disabled={(!this.props.user || this.props.videos.length === 0 || this.props.videos.some(videoObj => videoObj.title === '') || !this.props.enableEditing)}
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
                    trimEnd: videoObj.trimEnd
                  },
                  visibility: videoObj.visibility,
                  index: index,
                  password: videoObj.password
                });
              });
            }}
          >
            Upload Video(s)
          </Button>
          <VideosTable />
        </MuiThemeProvider>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  enableEditing: state.enableEditing,
  loading: state.loading,
  videos: state.uploadFiles,
  errorMessage: state.errorMessage
});

export default connect(mapStateToProps)(HomePage);
