import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import SearchTablePresets from '../VideosTable/VideosTableDefaults';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import { Button, createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import UsersJsonFile from './users.json';
import VideosTable from '../VideosTable/VideosTable';

const useStyles = createMuiTheme(
  SearchTablePresets.theme
);

class HomePage extends Component {
  state = {
    exportSeparateAudio: true
  }

  render() {
    return (
      <>
        <MuiThemeProvider theme={useStyles}>
          <header className='App-header'>
            <h1>Homepage</h1>
          </header>
          Select a user:
          <FormControl component='fieldset'>
            <RadioGroup
              aria-label='settings'
              name='settings1'
              value={this.props.user}
              onChange={
                event => this.props.enableEditing && this.props.dispatch({
                  type: 'SET_USER',
                  payload: event.target.value
                })
              }
            >
              <br />
              {UsersJsonFile.users.map((users, index) =>
                <FormControlLabel
                  value={users}
                  control={<Radio />}
                  label={users}
                  key={`user-options-${index}`}
                />
              )}
              <FormControlLabel
                value='Other'
                control={<Radio />}
                label='Other'
              />
            </RadioGroup>
            Export audio
            <Checkbox
              color='primary'
              checked={this.state.exportSeparateAudio}
              value={this.state.exportSeparateAudio}
              onClick={() => this.setState({ exportSeparateAudio: !this.state.exportSeparateAudio })}
            />
            <Button
              variant='contained'
              color='primary'
              disabled={!this.props.enableEditing}
              onClick={() => this.props.dispatch({ type: 'OPEN_PYTHON_FILE_PICKER' })}
            >
              Add File
            </Button>
          </FormControl>
          <VideosTable />
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
                    exportSeparateAudio: Boolean(this.state.exportSeparateAudio)
                  },
                  visibility: videoObj.visibility,
                  index: index,
                  password: videoObj.password
                });
                return;
              });
            }}
          >
            Upload Video(s)
          </Button>
        </MuiThemeProvider>
      </>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  enableEditing: state.enableEditing,
  loading: state.loading,
  videos: state.uploadFiles
});

export default connect(mapStateToProps)(withRouter(HomePage));
