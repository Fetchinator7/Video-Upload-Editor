import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import SearchTablePresets from '../VideosTable/VideosTableDefaults';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import { Button, Dialog, DialogContent, DialogContentText, createMuiTheme, MuiThemeProvider, DialogTitle, DialogActions, TextField } from '@material-ui/core';
import UsersJsonFile from './users.json';
import visibilityOptions from '../VideosTable/visibilityOptions.json';
import VideosTable from '../VideosTable/VideosTable';

const useStyles = createMuiTheme(
  SearchTablePresets.theme
);

class HomePage extends Component {
  state = {
    dialogueOpen: false,
    dialogueText: 'text silly',
    visibilityLevelOpen: false,
    visibilityLevel: 'anybody',
    showTextField: false,
    password: ''
  }

  showPasswordField = (bool) => {
    this.setState({ showTextField: bool })
  }

  render() {
    return (
      <>
        <MuiThemeProvider theme={useStyles}>
          <header className='App-header'>
            <h1>Homepage</h1>
            <h1>visibility Level: {this.state.visibilityLevel}</h1>
            <h1>{(this.state.visibilityLevel === 'password') && `Password: ${this.state.password}`}</h1>
          </header>
          Select a user:
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
            <Dialog
              disableBackdropClick
              disableEscapeKeyDown
              maxWidth="xs"
              // onEntering={handleEntering}
              aria-labelledby="confirmation-dialog-title"
              open={this.state.visibilityLevelOpen}
            >
              <DialogTitle id="confirmation-dialog-title">Phone Ringtone</DialogTitle>
              <DialogContent dividers>
                <RadioGroup
                  // ref={radioGroupRef}
                  aria-label="ringtone"
                  name="ringtone"
                  value={this.state.visibilityLevel}
                  onChange={event => this.setState({ visibilityLevel: event.target.value })}
                >
                  {visibilityOptions.visibility.map((option) => {
                    if (option.title === this.state.visibilityLevel) {
                      if (this.state.showTextField !== option.password) {
                        this.setState({ showTextField: option.password })
                      }
                    }
                    return <FormControlLabel value={option.title} key={option.title} control={<Radio />} label={option.title} />
                  })}
                </RadioGroup>
              {/* Dialogue that prompts the user to send a message for a new user request. */}
              {this.state.showTextField &&
                <TextField
                  focused
                  autoFocus
                  margin="dense"
                  label="Password:"
                  type="text"
                  fullWidth
                  maxLength='10'
                  value={this.state.message}
                  onChange={
                    // Set maximum number of message characters to 1000.
                    event => event.target.value.length <= 1000 && this.setState({ password: event.target.value })
                  }
                />
              }
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    this.state.password && this.setState({ visibilityLevelOpen: false })
                  }}
                  color="primary"
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
            <Button
              variant='contained'
              color='primary'
              onClick={() => this.setState({ visibilityLevelOpen: !this.state.visibilityLevelOpen })}
            >
              visibility
          </Button>
            <Button
              variant='contained'
              color='primary'
              disabled={this.props.videos.length > 0}
              onClick={() => this.props.dispatch({ type: 'OPEN_PYTHON_FILE_PICKER' })}
            >
              Add File
          </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => this.setState({ dialogueOpen: true })}
            >
              Open
          </Button>
          </FormControl>
          <VideosTable />
          <Button
            variant='contained'
            color='primary'
            disabled={(!this.props.user || this.props.videos.length === 0)}
            onClick={() =>
              this.props.videos.map((videoObj, index) => {
                this.props.dispatch({ type: 'DISABLE_EDITING' });
                this.props.dispatch({
                  type: 'UPLOAD_VIDEO_TO_VIMEO_AND_ARCHIVE_SOURCE',
                  payload: {
                    videoPath: videoObj.path,
                    title: videoObj.title,
                    description: videoObj.description,
                    userName: this.props.user
                  },
                  visibility: this.state.visibilityLevel,
                  index: index,
                  password: this.state.password
                });
              })}
          >
            Upload Video(s)
        </Button>
          <Dialog open={this.state.dialogueOpen}>
            <DialogContent>
              <DialogContentText>
                {this.state.dialogueText}
              </DialogContentText>
            </DialogContent>
          </Dialog>
        </MuiThemeProvider>
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
