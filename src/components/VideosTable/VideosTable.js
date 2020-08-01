import React from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import VideosTablePresets from './VideosTableDefaults';
import MUIDataTable from 'mui-datatables';
import DeleteIcon from '@material-ui/icons/Delete';
import { MuiThemeProvider, createMuiTheme, TextField, Button } from '@material-ui/core';

const useStyles = createMuiTheme(
  VideosTablePresets.theme
);

class Table extends React.Component {
  // componentDidMount() {
  //   this.props.videos.map(videoObj => this.setState({ uploadFilesArr: ...this.state.uploadFilesArr }))
  // }

  // componentWillUnmount() {
  //   this.props.dispatch({ type: 'CLEAR_UPLOAD_FILES' });
  // }

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
                  <TextField color='primary' defaultValue={value} />
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
                  <TextField color='primary' defaultValue={value} />
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
                  <Button variant='contained'>
                    <DeleteIcon color='secondary' />
                  </Button>
                }
                onClick={() => {
                  this.props.dispatch({
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

    const data = this.props.videos.map(videoObj => {
      return (
        [videoObj.title, videoObj.description, `...${videoObj.path.slice(-40)}`]
      );
    });

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
  videos: state.uploadFiles
});

export default connect(mapStateToProps)(Table);
