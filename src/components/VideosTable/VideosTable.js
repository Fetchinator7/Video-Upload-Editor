import React from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VideosTablePresets from './VideosTableDefaults';
import MUIDataTable from 'mui-datatables';
import DeleteIcon from '@material-ui/icons/Delete';
import { MuiThemeProvider, createMuiTheme, TextField, Button, CircularProgress } from '@material-ui/core';

const useStyles = createMuiTheme(
  VideosTablePresets.theme
);

class Table extends React.Component {
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
                  const text = event.target.value;
                  const updateArr = this.props.videos.map((videoObj, index) => tableMeta.rowIndex === index ? { ...videoObj, title: text } : videoObj);
                  this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
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
                  const text = event.target.value;
                  const updateArr = this.props.videos.map((videoObj, index) => tableMeta.rowIndex === index ? { ...videoObj, description: text } : videoObj);
                  this.props.dispatch({ type: 'SET_UPLOAD_FILES', payload: updateArr });
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
                  this.props.enableEditing && this.props.dispatch({
                    type: 'SET_UPLOAD_FILES',
                    payload: this.props.videos.slice(0, tableMeta.rowIndex).concat(this.props.videos.slice(tableMeta.rowIndex + 1, this.props.videos.length))
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
        videoObj.path ? [videoObj.title, videoObj.description, `...${videoObj.path.slice(-40)}`] : []
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
