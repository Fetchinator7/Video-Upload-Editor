import React from 'react';
import Radio from '@material-ui/core/Radio';
import { withStyles } from '@material-ui/core';

const green = '#25f900';
const orange = '#f9a200';
const red = '#f90000';

const SelectedRadioButton = withStyles({
  // turns the radio button green
  root: {
    color: green,
    '&$checked': {
      color: orange
    }
  },
  checked: {}
})((props) => <Radio color='default' {...props} />);

const EmptyRadioButton = withStyles({
  // turns the radio button green
  root: {
    color: red
  },
  checked: {}
})((props) => <Radio color='default' {...props} />);

export default {
  selectedRadioButton: SelectedRadioButton,
  emptyRadioButton: EmptyRadioButton
};
