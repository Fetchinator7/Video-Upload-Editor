import React from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VideosTablePresets from './VideosTableDefaults';
import MUIDataTable from 'mui-datatables';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorIcon from '@material-ui/icons/Error';
import CancelIcon from '@material-ui/icons/Cancel';
import upArrow from '../../icons/up-arrow.gif';
import visibilityOptions from './visibilityOptions.json';
import { MuiThemeProvider, createMuiTheme, TextField, Button, CircularProgress, RadioGroup, DialogActions, DialogContent, Dialog, DialogTitle, Checkbox } from '@material-ui/core';
import RadioButton from '../RadioButton';
import '../App/App.css';
import './VideosTable.css';

const visibilityLevelOpenIndex = 'visibilityLevelOpenIndex';
const trimDropDownOpenIndex = 'trimDropDownOpenIndex';
const showPasswordField = 'showPasswordField';

const visibility = 'visibility';
const password = 'password';
const trimStart = 'trimStart';
const trimEnd = 'trimEnd';
const title = 'title';
const description = 'description';
const exportSeparateAudio = 'exportSeparateAudio';

const SET_UPLOAD_FILES = 'SET_UPLOAD_FILES';

const green = '#18bc3c';
const yellow = '#dde238';
const red = '#d31f1f';

const useStyles = createMuiTheme(
  VideosTablePresets.theme
);

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

class Table extends React.Component {
  // These null local state values will be set to the index of the video in the array they reference.
  state = {
    [visibilityLevelOpenIndex]: null,
    [showPasswordField]: false,
    [trimDropDownOpenIndex]: null
  }

  // This is the field for entering a trimming timecode range for either the start or stop time.
  TimecodeTextField = (autoFocusField, label, inputArr, objKeyword, stateIndex) => {
    return (
      <TextField
        focused
        autoFocus={autoFocusField ? true : false}
        margin="dense"
        label={label}
        type="text"
        fullWidth
        // The state default for trimDropDownOpenIndex is null (it's only accessible after a video has been added)
        // so default to an empty string but otherwise use the index from the local state to determine what value this should have.
        value={inputArr[this.state[trimDropDownOpenIndex]] ? inputArr[this.state[trimDropDownOpenIndex]][objKeyword] : ''}
        onChange={
          event => {
            event.persist();
            event.preventDefault();
            // This filters the input to see if it's valid but either way it returns the string of the next value so always set that.
            const newTextValue = checkValidTimecodeInput(inputArr[stateIndex][objKeyword], event.nativeEvent.data, event.target.value);
            this.updateVidObject(stateIndex, objKeyword, newTextValue, false)
            this.setState({ [trimDropDownOpenIndex]: stateIndex })
          }
        }
      />
    )
  }

  // If a video object needs to be updated use the index to change the object in the array.
  updateVidObject = (stateIndex, updateVidObjectKey, newVal, nullifyState) => {
    const updateArr = [...this.props.videos];
    updateArr[stateIndex] = { ...this.props.videos[stateIndex], [updateVidObjectKey]: newVal };
    this.props.dispatch({ type: SET_UPLOAD_FILES, payload: updateArr });
    if (nullifyState !== false) {
      this.setState({ [nullifyState]: null })
    }
  }

  render() {
    const videosArr = this.props.videos;
    // Get the base formatted data then add the "comments" column to the end.
    const columns = [
      this.props.enableEditing ?
        {
          name: 'Plus Audio Only',
          options: {
            sort: false,
            customBodyRenderLite: (dataIndex) => {
              return (
                <FormControlLabel
                  control={
                    <Checkbox
                      color='primary'
                      style={{ color: '#25f900' }}
                      checked={videosArr[dataIndex][exportSeparateAudio]}
                      value={videosArr[dataIndex][exportSeparateAudio]}
                    />
                  }
                  onChange={event => {
                    this.updateVidObject(dataIndex, exportSeparateAudio, !videosArr[dataIndex][exportSeparateAudio], false)
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
            customBodyRenderLite: (dataIndex) => {
              return (
                <TextField
                  color={videosArr[dataIndex][title] ? 'primary' : 'secondary'}
                  value={videosArr[dataIndex][title]}
                  onChange={event => {
                    this.updateVidObject(dataIndex, title, event.target.value, false)
                  }}
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
            customBodyRenderLite: (dataIndex) => {
              return (
                <TextField
                  color='primary'
                  value={videosArr[dataIndex][description]}
                  onChange={event => {
                    this.updateVidObject(dataIndex, description, event.target.value, false)
                  }}
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
            customBodyRenderLite: (dataIndex) => {
              return (
                <FormControlLabel
                  control={
                    <Button
                      variant='outlined'
                      onClick={() => {
                        this.setState({ [visibilityLevelOpenIndex]: dataIndex })
                      }}>
                      {videosArr[dataIndex][visibility]}
                    </Button>
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
      this.props.enableEditing ?
        {
          name: 'Trim',
          options: {
            sort: false,
            customBodyRenderLite: (dataIndex) => {
              return (
                <FormControlLabel
                  control={
                    <Button
                      variant='outlined'
                      style={videosArr[dataIndex][trimStart] || videosArr[dataIndex][trimEnd] ? { color: '#25f900' } : undefined}
                      onClick={() => {
                        this.setState({ [trimDropDownOpenIndex]: dataIndex })
                      }}>
                      Trim
                  </Button>
                  }
                />
              );
            }
          }
        } : {
          name: 'Trim',
          options: {
            sort: false,
            customBodyRenderLite: (dataIndex) => {
              return (
                <div className={videosArr[dataIndex][trimStart] || videosArr[dataIndex][trimEnd] ? 'trim' : undefined}>TRIM</div>
              );
            }
          }
        },
      this.props.enableEditing ?
        {
          name: 'Cancel',
          options: {
            sort: false,
            customBodyRenderLite: (dataIndex) => {
              return (
                <FormControlLabel
                  control={
                    <Button variant='outlined' disabled={!this.props.enableEditing}>
                      <CancelIcon color='secondary' />
                    </Button>
                  }
                  onClick={() => {
                    const videos = [...videosArr];
                    this.props.enableEditing && this.props.dispatch({
                      type: SET_UPLOAD_FILES,
                      payload: videos.slice(0, dataIndex).concat(videos.slice(dataIndex + 1, videos.length))
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
              const uri = videosArr[tableMeta.rowIndex].uri
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

    let data = videosArr.map(videoObj => {
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
      this.props.uploaded.length === videosArr.length && this.props.dispatch({ type: 'EXIT_PROCESS' });
    }

    return (
      <>
        <MuiThemeProvider theme={useStyles}>
          <MUIDataTable title='Videos To Upload' data={data} columns={columns} options={VideosTablePresets.options} />
          <Dialog
            open={this.state[visibilityLevelOpenIndex] === null ? false : true}
          >
            <DialogTitle id="confirmation-dialog-title">Video Visibility</DialogTitle>
            <DialogContent dividers>
              <RadioGroup
                value={videosArr[this.state[visibilityLevelOpenIndex]] ? videosArr[this.state[visibilityLevelOpenIndex]][visibility].toUpperCase() : ''}
                onChange={event => this.updateVidObject(this.state[visibilityLevelOpenIndex], visibility, event.target.value, false)}
              >
                {visibilityOptions.visibility.map((option) => {
                  const videoObj = videosArr[this.state[visibilityLevelOpenIndex]];
                  const title = option.title.toUpperCase();
                  if (videoObj) {
                    if (videoObj[visibility] === password.toUpperCase() && this.state[showPasswordField] === false) {
                      this.setState({ [showPasswordField]: true })
                    } else if (videoObj[visibility] !== password.toUpperCase() && this.state[showPasswordField] === true) {
                      this.setState({ [showPasswordField]: false })
                    }
                  }
                  return <FormControlLabel value={title} key={title} control={<RadioButton.selectedRadioButton />} label={title} />
                })}
              </RadioGroup>
              {this.state[showPasswordField] &&
                <TextField
                  focused
                  autoFocus
                  margin="dense"
                  label="Password:"
                  type="text"
                  fullWidth
                  value={videosArr[this.state[visibilityLevelOpenIndex]] ? videosArr[this.state[visibilityLevelOpenIndex]][password] : ''}
                  onChange={
                    event => this.updateVidObject(this.state[visibilityLevelOpenIndex], password, event.target.value, false)
                  }
                />
              }
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  const vidVisObj = { ...videosArr[this.state[visibilityLevelOpenIndex]] };
                  // If the visibility is password make sure a password has been entered before closing.
                  if (vidVisObj[visibility] === password && vidVisObj[password].length === 0) {
                    return;
                  } else {
                    this.updateVidObject(this.state[visibilityLevelOpenIndex], visibility, vidVisObj[visibility], visibilityLevelOpenIndex);
                  }
                }}
                color="primary"
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state[trimDropDownOpenIndex] !== null ? true : false}
            onClose={() => this.setState({ [trimDropDownOpenIndex]: null })}
          >
            <DialogTitle id="confirmation-dialog-title">Timecode format = "00:00:00.00" (hours, minutes, seconds, and fractions of a second.)</DialogTitle>
            <DialogTitle>"5" = 5 seconds, "5.3" = 5.3 seconds, "1:05" = 1 minute and 5 seconds, "2:12:00" = 2 hours and 12 minutes.</DialogTitle>
            <DialogContent dividers>
              <>
                {this.TimecodeTextField(true, 'Trim Start Timecode:', [...videosArr], trimStart, this.state[trimDropDownOpenIndex])}
                {this.TimecodeTextField(false, 'Trim End Timecode:', [...videosArr], trimEnd, this.state[trimDropDownOpenIndex])}
              </>
            </DialogContent>
            <Button
              onClick={() => {
                // If the visibility is password make sure a password has been entered before closing.
                this.setState({ [trimDropDownOpenIndex]: null })
              }}
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
            <div className='text'><CircularProgress style={{ color: green }} />: Rendering Locally</div>
            <br />
            <div className='text'><img alt='Up' src={upArrow} />: Uploading To Vimeo</div>
            <br />
            <div className='text'><CircularProgress style={{ color: yellow }} />: Transcoding On Vimeo</div>
            <br />
            <div className='text'><CheckCircleOutlineIcon style={{ color: green, fontSize: 45 }} />: Successfully Uploaded</div>
            <br />
            <div className='text'><ErrorIcon style={{ color: red, fontSize: 45 }} />: Error</div>
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
