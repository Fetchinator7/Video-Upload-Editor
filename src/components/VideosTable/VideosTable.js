import React from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VideosTablePresets from './VideosTableDefaults';
import MUIDataTable from 'mui-datatables';
import DeleteIcon from '@material-ui/icons/Delete';
import visibilityOptions from './visibilityOptions.json';
import { MuiThemeProvider, createMuiTheme, TextField, Button, CircularProgress, Radio, RadioGroup, DialogActions, DialogContent, Dialog, DialogTitle } from '@material-ui/core';

const useStyles = createMuiTheme(
  VideosTablePresets.theme
);

class Table extends React.Component {
  state = {
    visibilityLevelOpen: false,
    showTextField: false,
    visibleTableMeta: ''
  }

  updateFile = (newVal, tableMeta, attr) => {
    const updateArr = this.props.videos.map((videoObj, index) => tableMeta.rowIndex === index ? { ...videoObj, [attr]: newVal } : videoObj);
    this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
  }

  render() {
    // Get the base formatted data then add the "comments" column to the end.
    const columns = [
      this.props.enableEditing ?
        {
          name: 'Title',
          options: {
            customBodyRender: (value, tableMeta) => {
              return (
                <FormControlLabel
                  onChange={event => {
                    this.updateFile(event.target.value, tableMeta, 'title');
                  }}
                  control={
                    <TextField color='primary' value={this.props.videos[tableMeta.rowIndex].title} />
                  }
                />
              );
            }
          }
        } : {
          name: 'Title',
        },
      this.props.enableEditing ?
        {
          name: 'Description',
          options: {
            customBodyRender: (value, tableMeta) => {
              return (
                <FormControlLabel
                  onChange={event => {
                    this.updateFile(event.target.value, tableMeta, 'description');
                  }}
                  control={
                    <TextField color='primary' value={this.props.videos[tableMeta.rowIndex].description} />
                  }
                />
              );
            }
          }
        } : {
          name: 'Description',
        },
      {
        name: 'Visibility',
        options: {
          sort: false,
          customBodyRender: (value, tableMeta) => {
            return (
              <FormControlLabel
                control={
                  <>
                    <Button
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={() => {
                        this.updateFile(!this.props.videos[tableMeta.rowIndex].dropDownIsOpen, tableMeta, 'dropDownIsOpen');
                        this.setState({ visibilityLevelOpen: !this.state.visibilityLevelOpen })
                      }}>
                      {this.props.videos[tableMeta.rowIndex].visibility}
                    </Button>
                  </>
                }
              />
            );
          }
        }
      },
      {
        name: 'File Path'
      },
      this.props.enableEditing ?
        {
          name: 'Cancel',
          options: {
            sort: false,
            customBodyRender: (value, tableMeta) => {
              return (
                <FormControlLabel
                  control={
                    <Button variant='contained' disabled={!this.props.enableEditing}>
                      <DeleteIcon color='secondary' />
                    </Button>
                  }
                  onClick={() => {
                    const videos = [...this.props.videos];
                    this.props.enableEditing && this.props.dispatch({
                      type: 'SET_UPLOAD_FILES',
                      payload: videos.slice(0, tableMeta.rowIndex).concat(videos.slice(tableMeta.rowIndex + 1, videos.length))
                    });
                  }}
                />
              );
            }
          }
        } : {
          name: 'Link',
          options: {
            sort: false,
            customBodyRender: (value, tableMeta) => {
              const uri = this.props.videos[tableMeta.rowIndex].uri
              return (
                <FormControlLabel
                  control={
                    <Button
                      color='primary'
                      variant='contained'
                      href={`https://vimeo.com/${uri}`}
                      disabled={!Boolean(uri)}
                    >
                      Open
                    </Button>
                  }
                />
              );
            }
          }
        }
    ];

    let data = this.props.videos.map(videoObj => {
      return (
        videoObj.path ? [videoObj.title, videoObj.description, videoObj.visibility, `...${videoObj.path.slice(-40)}`, ''] : []
      );
    });

    if (this.props.enableEditing === false) {
      columns.unshift(
        {
          name: 'Status'
        }
      );
      data = this.props.videos.map((vidObj, index) => {
        if (this.props.uploadError.includes(index)) {
          return ['err', ...data[index]];
        } else if (this.props.rendering.includes(index)) {
          return [<CircularProgress key={`loading-${index}`} />, ...data[index]];
        } else if (this.props.uploading.includes(index)) {
          return ['up', ...data[index]];
        } else if (this.props.transCoding.includes(index)) {
          return ['code', ...data[index]];
        } else {
          return ['yep', ...data[index]];
        }
      });
    }

    // Find all the objects in the videos array that have dropDownIsOpen === true to get the
    // default radio button value.
    const getOpenVidAttr = (attr) => {
      const val = this.props.videos.filter(videoObj => (videoObj.dropDownIsOpen === true))
      if (val.length !== 0) {
        return val[0][attr];
      }
      return '';
    }
    return (
      <>
        <MuiThemeProvider theme={useStyles}>
          <MUIDataTable title='Videos To Upload' data={data} columns={columns} options={VideosTablePresets.options} />
          <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open={this.state.visibilityLevelOpen}
          >
            <DialogTitle id="confirmation-dialog-title">Video Visibility</DialogTitle>
            <DialogContent dividers>
              <RadioGroup
                value={getOpenVidAttr('visibility')}
                onChange={event => {
                  const updateArr = this.props.videos.map(videoObj => (videoObj.dropDownIsOpen === true) ? { ...videoObj, visibility: event.target.value } : videoObj);
                  this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
                }}
              >
                {visibilityOptions.visibility.map((option) => {
                  const vidVisArr = this.props.videos.filter(videoObj => (videoObj.dropDownIsOpen === true));
                  if (vidVisArr.length !== 0) {
                    if (vidVisArr[0].visibility === 'password' && this.state.showTextField === false) {
                      this.setState({ showTextField: true })
                    } else if (vidVisArr[0].visibility !== 'password' && this.state.showTextField === true) {
                      this.setState({ showTextField: false })
                    }
                  }
                  return <FormControlLabel value={option.title} key={option.title} control={<Radio />} label={option.title} />
                })}
              </RadioGroup>
              {this.state.showTextField &&
                <TextField
                  focused
                  autoFocus
                  margin="dense"
                  label="Password:"
                  type="text"
                  fullWidth
                  defaultValue={this.state.message}
                  value={getOpenVidAttr('password')}
                  onChange={
                    // Set maximum number of message characters to 100.
                    event => {
                      const updateArr = this.props.videos.map(videoObj => (videoObj.dropDownIsOpen === true) ? { ...videoObj, password: event.target.value } : videoObj);
                      this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
                    }
                  }
                />
              }
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  // If the visibility is password make sure a password has been entered before closing.
                  // this.state.visibilityLevel === 'password' ? this.state.password !== '' && this.setState({ visibilityLevelOpen: false }) : this.setState({ visibilityLevelOpen: false })
                  const vidVisArr = this.props.videos.filter(videoObj => (videoObj.dropDownIsOpen === true));
                  if (vidVisArr[0].visibility === 'password' && vidVisArr[0].password.length === 0) {
                    return;
                  } else {
                    const updateArr = this.props.videos.map(videoObj => (videoObj.dropDownIsOpen === true) ? { ...videoObj, dropDownIsOpen: false } : videoObj);
                    this.setState({ visibilityLevelOpen: !this.state.visibilityLevelOpen })
                    this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
                  }
                }}
                color="primary"
              >
                Ok
                </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </>
    );
  }
}

const mapStateToProps = state => ({
  videos: state.uploadFiles,
  rendering: state.rendering,
  uploading: state.uploading,
  transCoding: state.transCoding,
  uploadError: state.uploadError,
  enableEditing: state.enableEditing
});

export default connect(mapStateToProps)(Table);
