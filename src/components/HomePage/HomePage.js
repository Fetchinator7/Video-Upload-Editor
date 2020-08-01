import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import { Button, TextField, CircularProgress, ListItemIcon } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MovieIcon from '@material-ui/icons/Movie';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import UsersJsonFile from './users.json';

class HomePage extends Component {
  state = {
    title: '',
    description: ''
  }

  render() {
    console.log(this.state.title);
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
        <TextField
          variant='outlined'
          placeholder='Description'
          value={this.state.description}
          type="text"
          onChange={(event) => {
            event.target.value.length <= 50 &&
              this.setState({
                description: event.target.value
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
            variant="contained"
            color='primary'
            onClick={() => this.props.dispatch({ type: 'OPEN_PYTHON_FILE_PICKER' })}
          >
            Upload File
          </Button>
          <Button
            variant='contained'
            color='primary'
            disabled={(!this.state.title || !this.props.user || this.props.videos.length === 0)}
            onClick={() =>
              this.props.dispatch({
                type: 'UPLOAD_VIDEO_TO_VIMEO',
                payload: {
                  videoPath: '/vimeo',
                  title: this.state.title,
                  description: this.state.description
                }
              }), () => {
                this.setState({ title: '', description: '' })
              }
            }
          >
            Upload Video
          </Button>
          <List component="nav" aria-label="main mailbox folders">
            {this.props.videos.map((video, index) =>
              <>
                <ListItem key={`video-file-to-upload-${index}`}>
                  <ListItemIcon>{<MovieIcon />}</ListItemIcon>
                  <ListItemText primary={video} />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      this.props.dispatch({
                        type: 'SET_UPLOAD_FILES',
                        payload: this.props.videos.slice(0, index).concat(this.props.videos.slice(index + 1, this.props.videos.length))
                      })
                    }}
                  >
                    {<DeleteIcon />}
                  </Button>
                </ListItem>
              </>
            )}
          </List>
        </FormControl>
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
