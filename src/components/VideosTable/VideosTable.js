import React from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VideosTablePresets from './VideosTableDefaults';
import MUIDataTable from 'mui-datatables';
import DeleteIcon from '@material-ui/icons/Delete';
import PrivacyOptions from './privacyOptions.json';
import { MuiThemeProvider, createMuiTheme, TextField, Button, CircularProgress, Menu, MenuItem, List, ListItem } from '@material-ui/core';

const useStyles = createMuiTheme(
  VideosTablePresets.theme
);

class Table extends React.Component {
  updateFile = (newVal, tableMeta, attr) => {
    const updateArr = this.props.videos.map((videoObj, index) => tableMeta.rowIndex === index ? { ...videoObj, [attr]: newVal } : videoObj);
    this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
  }

  render() {
    // Get the base formatted data then add the "comments" column to the end.
    const columns = [
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
                  <TextField color='primary' defaultValue={value} disabled={!this.props.enableEditing} />
                }
              />
            );
          }
        }
      },
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
                  <TextField color='primary' defaultValue={value} disabled={!this.props.enableEditing} />
                }
              />
            );
          }
        }
      },
      {
        name: 'Privacy',
        options: {
          sort: false,
          customBodyRender: (value, tableMeta) => {
            console.log(tableMeta);
            return (
              <FormControlLabel
                control={
                  <>
                    <Button
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={event => {
                        this.updateFile(event, tableMeta, 'dropDownIsOpen');
                      }}>
                      {tableMeta.rowData[2]}
                    </Button>
                    <Menu
                      // id="simple-menu"
                      anchorEl={tableMeta}
                      keepMounted
                      open={Boolean(this.props.videos[tableMeta.rowIndex].dropDownIsOpen)}
                      onClose={() => this.updateFile(false, tableMeta, 'dropDownIsOpen')}
                    >
                      {console.log(PrivacyOptions)}
                      {PrivacyOptions.privacy.map(option =>
                        <MenuItem onClick={() => {
                          this.updateFile(false, tableMeta, 'dropDownIsOpen')
                          this.updateFile(option, tableMeta, 'privacy')
                        }}>{option}</MenuItem>
                      )}
                    </Menu>
                  </>
                }
              // onChange={event => {
              //   this.updateFile(event.target.value, tableMeta, 'dropDownIsOpen');
              // }}
              />
            );
          }
        }
      },
      {
        name: 'File Path'
      },
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
      }
    ];

    let data = this.props.videos.map(videoObj => {
      return (
        videoObj.path ? [videoObj.title, videoObj.description, videoObj.privacy, `...${videoObj.path.slice(-40)}`] : []
      );
    });

    if (this.props.enableEditing === false) {
      columns.unshift(
        {
          name: 'Status'
        }
      );
      data = this.props.videos.map((vidObj, index) => {
        if (this.props.loading.includes(index)) {
          return [<CircularProgress key={`loading-${index}`} />, ...data[index]];
        } else if (this.props.transCoding.includes(index)) {
          return ['code', ...data[index]];
        } else if (this.props.uploadError.includes(index)) {
          return ['err', ...data[index]];
        } else {
          return ['yep', ...data[index]];
        }
      });
    }

    // Since the user is viewing their games show a trash can to delete that game and
    // a pen to edit the comments for their game.
    return (
      <>
        {/* Table. */}
        <MuiThemeProvider theme={useStyles}>
          <MUIDataTable title='Videos To Upload' data={data} columns={columns} options={VideosTablePresets.options} />
        </MuiThemeProvider>
      </>
    );
  }
}

const mapStateToProps = state => ({
  videos: state.uploadFiles,
  loading: state.loading,
  transCoding: state.transCoding,
  uploadError: state.uploadError,
  enableEditing: state.enableEditing
});

export default connect(mapStateToProps)(Table);
