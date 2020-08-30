import React from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VideosTablePresets from './VideosTableDefaults';
import MUIDataTable from 'mui-datatables';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorIcon from '@material-ui/icons/Error';
import upArrow from '../../icons/up-arrow.gif';
import visibilityOptions from './visibilityOptions.json';
import { MuiThemeProvider, createMuiTheme, TextField, Button, CircularProgress, Radio, RadioGroup, DialogActions, DialogContent, Dialog, DialogTitle, Checkbox } from '@material-ui/core';
import '../App/App.css';

const useStyles = createMuiTheme(
  VideosTablePresets.theme
);

// Find all the objects in the videos array that have visibilityDropDownIsOpen === true to get the
// default radio button value.
const getOpenVidAttr = (attr, dropDown, arr) => {
  const val = arr.filter(videoObj => (videoObj[dropDown] === true))
  if (val.length !== 0) {
    return val[0][attr];
  }
  return '';
}

const checkValidTimecodeInput = (value, key, newValue) => {
  // Confirm the input is in the valid "00:00:00.00" timecode format.
  // Only allow one period.
  const checkQtyCharacter = '.';
  const qtyOfAllowedCharacter = 1;
  let qtyOfCharacter = 0;
  // Allow up to 2 colons.
  const requireEveryOtherCharacterExceptDecimals = ':';
  const allowQtyRequireEveryOtherCharacterExceptDecimals = 2;
  let qtyRequireEveryOtherCharacterExceptDecimals = 0;
  const punctuationKeys = ['.', ':'];
  const numbersKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const allowedKeys = [...numbersKeys, ...punctuationKeys];
  // The input doesn't change so return early.
  if (value === newValue) {
    return value;
  }
  // Count how many checkQtyCharacter(".") and qtyRequireEveryOtherCharacterExceptDecimals(":")
  // are in the string to determine if any more can be entered.
  if (value !== '') {
    qtyOfCharacter = value.split(checkQtyCharacter).length - 1;
    qtyRequireEveryOtherCharacterExceptDecimals = value.split(requireEveryOtherCharacterExceptDecimals).length - 1;
  }
  // Don't allow more than qtyOfAllowedCharacter(1) checkQtyCharacter(".")
  if (key === checkQtyCharacter && qtyOfCharacter >= qtyOfAllowedCharacter) {
    console.log(`Error, the input can't have more than ${qtyOfAllowedCharacter} "${checkQtyCharacter}"`);
    // Prevent the checkQtyCharacter from being accepted by returning the original value.
    return value;
    // Don't allow more than allowQtyRequireEveryOtherCharacterExceptDecimals(2) requireEveryOtherCharacterExceptDecimals(":")
  } else if (key === requireEveryOtherCharacterExceptDecimals && qtyRequireEveryOtherCharacterExceptDecimals >= allowQtyRequireEveryOtherCharacterExceptDecimals) {
    console.log(`Error, the input can't have more than ${allowQtyRequireEveryOtherCharacterExceptDecimals} "${requireEveryOtherCharacterExceptDecimals}"`);
    // Prevent the requireEveryOtherCharacterExceptDecimals from being accepted by returning the original value.
    return value;
    // If the input is empty and a punctuationKeys ("." or ":") was entered precede it with a 0.
  } else if (value.length === 0 && punctuationKeys.includes(key)) {
    return '0' + newValue;
  } else if (newValue.length === value.length - 1) {
    // A character was deleted so return the new string.
    return newValue;
  } else {
    // If the keyboard value matches any item in the allowedKeys array enteredAValidKey = true.
    const enteredAValidKey = allowedKeys.some(allowedKey => key === allowedKey);
    if (enteredAValidKey === false) {
      console.log(`Error, the input can't have any non-numeric characters (except "." and ":").`);
      return value;
    } else {
      // This character passed all the criteria so return the new value.
      return newValue;
    }
  }
}

const TimecodeTextField = (autoFocusField, label, inputArr, objKeyword, dispatch) => {
  return (
    <TextField
      focused
      autoFocus={autoFocusField ? true : undefined}
      margin="dense"
      label={label}
      type="text"
      fullWidth
      value={getOpenVidAttr(objKeyword, 'trimDropDownIsOpen', inputArr)}
      onChange={
        event => {
          event.persist();
          event.preventDefault();
          const openObjIndex = inputArr.findIndex(vidObj => vidObj.trimDropDownIsOpen)
          const newTextValue = checkValidTimecodeInput(inputArr[openObjIndex][objKeyword], event.nativeEvent.data, event.target.value);
          let updateArr = [...inputArr];
          updateArr[openObjIndex] = { ...inputArr[openObjIndex], [objKeyword]: newTextValue };
          dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
        }
      }
    />
  )
}

class Table extends React.Component {
  state = {
    visibilityLevelOpen: false,
    showTextField: false,
    trimDropDownIsOpen: false,
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
          name: 'Plus Audio Only',
          options: {
            sort: false,
            customBodyRender: (value, tableMeta) => {
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      color='primary'
                      style={{ color: '#25f900' }}
                      checked={this.props.videos[tableMeta.rowIndex].exportSeparateAudio}
                      value={this.props.videos[tableMeta.rowIndex].exportSeparateAudio}
                    />
                  }
                  onChange={() => {
                    this.updateFile(!value, tableMeta, 'exportSeparateAudio');
                  }}
                />
              );
            }
          }
        } : {
          name: 'Status',
          options: {
            sort: false
          }
        },
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
                    <TextField
                      color={this.props.videos[tableMeta.rowIndex].title ? 'primary' : 'secondary'}
                      value={this.props.videos[tableMeta.rowIndex].title}
                    />
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
      this.props.enableEditing ?
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
                        onClick={() => {
                          this.updateFile(!this.props.videos[tableMeta.rowIndex].visibilityDropDownIsOpen, tableMeta, 'visibilityDropDownIsOpen');
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
        } : {
          name: 'Visibility',
          options: {
            sort: false,
            customBodyRender: (value) => {
              return (
                value.toUpperCase()
              );
            }
          }
        },
      {
        name: 'File Path',
        options: {
          sort: false,
        }
      },
      this.props.enableEditing &&
      {
        name: 'Trim',
        options: {
          sort: false,
          customBodyRenderLite: (dataIndex) => {
            return (
              <FormControlLabel
                control={
                  <>
                    <Button
                      style={this.props.videos[dataIndex].trimStart || this.props.videos[dataIndex].trimEnd ? { color: '#25f900' } : undefined}
                      onClick={() => {
                        this.updateFile(!this.props.videos[dataIndex].trimDropDownIsOpen, { rowIndex: dataIndex }, 'trimDropDownIsOpen');
                        this.setState({ trimDropDownIsOpen: !this.state.trimDropDownIsOpen })
                      }}>
                      Trim
                      </Button>
                  </>
                }
              />
            );
          }
        }
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
        videoObj.path ? [videoObj.exportSeparateAudio, videoObj.title, videoObj.description, videoObj.visibility, `...${videoObj.path.slice(-70)}`, '', ''] : []
      );
    });

    if (this.props.enableEditing === false) {
      data = data.map((vidObj, index) => {
        // Remove the export audio indicator at the beginning of the array and replace it
        // with the upload status indicator.
        const vidData = [...data[index]];
        vidData.shift();
        if (this.props.uploadError.includes(index)) {
          return [<ErrorIcon style={{ color: '#d31f1f', fontSize: 40 }} />, ...vidData];
        } else if (this.props.rendering.includes(index)) {
          return [<CircularProgress style={{ color: '#18bc3c' }} key={`loading-${index}`} />, ...vidData];
        } else if (this.props.uploading.includes(index)) {
          return [<img alt='Up' src={upArrow} />, ...vidData];
        } else if (this.props.transCoding.includes(index)) {
          return [<CircularProgress style={{ color: '#dde238' }} />, ...vidData];
        } else {
          return [<CheckCircleOutlineIcon style={{ color: '#18bc3c', fontSize: 40 }} />, ...vidData];
        }
      });
      this.props.uploaded.length === this.props.videos.length && this.props.dispatch({ type: 'EXIT_PROCESS' });
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
                value={getOpenVidAttr('visibility', 'visibilityDropDownIsOpen', this.props.videos)}
                onChange={event => {
                  const updateArr = this.props.videos.map(videoObj => (videoObj.visibilityDropDownIsOpen === true) ? { ...videoObj, visibility: event.target.value } : videoObj);
                  this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
                }}
              >
                {visibilityOptions.visibility.map((option) => {
                  const vidVisArr = this.props.videos.filter(videoObj => (videoObj.visibilityDropDownIsOpen === true));
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
                  value={getOpenVidAttr('password', 'visibilityDropDownIsOpen', this.props.videos)}
                  onChange={
                    // Set maximum number of message characters to 100.
                    event => {
                      const updateArr = this.props.videos.map(videoObj => (videoObj.visibilityDropDownIsOpen === true) ? { ...videoObj, password: event.target.value } : videoObj);
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
                  const vidVisArr = this.props.videos.filter(videoObj => (videoObj.visibilityDropDownIsOpen === true));
                  if (vidVisArr[0].visibility === 'password' && vidVisArr[0].password.length === 0) {
                    return;
                  } else {
                    const updateArr = this.props.videos.map(videoObj => (videoObj.visibilityDropDownIsOpen === true) ? { ...videoObj, visibilityDropDownIsOpen: false } : videoObj);
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
          <Dialog
            open={this.state.trimDropDownIsOpen}
          >
            <DialogTitle id="confirmation-dialog-title">Timecode format = "00:00:00.00" (hours, minutes, seconds, and fractions of a second.)</DialogTitle>
            <DialogTitle>"5" = 5 seconds, "5.3" = 5.3 seconds, "1:05" = 1 minute and 5 seconds, "2:12:00" = 2 hours and 12 minutes.</DialogTitle>
            <DialogContent dividers>
              <>
                {TimecodeTextField(true, 'Trim Start Timecode:', [...this.props.videos], 'trimStart', this.props.dispatch)}
                <TextField
                  focused
                  margin="dense"
                  label="Trim End Timecode:"
                  type="text"
                  fullWidth
                  value={getOpenVidAttr('trimEnd', 'trimDropDownIsOpen', this.props.videos)}
                  onChange={
                    // Set maximum number of message characters to 100.
                    event => {
                      const updateArr = this.props.videos.map(videoObj => (videoObj.trimDropDownIsOpen === true) ? { ...videoObj, trimEnd: event.target.value } : videoObj);
                      this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
                    }
                  }
                />
              </>
            </DialogContent>
            <Button
              onClick={() => {
                // If the visibility is password make sure a password has been entered before closing.
                const updateArr = this.props.videos.map(videoObj => (videoObj.trimDropDownIsOpen === true) ? { ...videoObj, trimDropDownIsOpen: false } : videoObj);
                this.setState({ trimDropDownIsOpen: !this.state.trimDropDownIsOpen })
                this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
              }
              }
              color="primary"
            >
              Ok
            </Button>
          </Dialog>
        </MuiThemeProvider>
        {!this.props.enableEditing &&
          (<>
            <br />
            <br />
            <br />
            <div className='text'><CircularProgress style={{ color: '#18bc3c' }} />: Rendering Locally</div>
            <br />
            <div className='text'><img alt='Up' src={upArrow} />: Uploading To Vimeo</div>
            <br />
            <div className='text'><CircularProgress style={{ color: '#dde238' }} />: Transcoding On Vimeo</div>
            <br />
            <div className='text'><CheckCircleOutlineIcon style={{ color: '#18bc3c', fontSize: 45 }} />: Successfully Uploaded</div>
            <br />
            <div className='text'><ErrorIcon style={{ color: '#d31f1f', fontSize: 45 }} />: Error</div>
          </>)
        }
      </>
    );
  }
}

const mapStateToProps = state => ({
  videos: state.uploadFiles,
  rendering: state.rendering,
  uploading: state.uploading,
  uploaded: state.uploaded,
  transCoding: state.transCoding,
  uploadError: state.uploadError,
  enableEditing: state.enableEditing
});

export default connect(mapStateToProps)(Table);
