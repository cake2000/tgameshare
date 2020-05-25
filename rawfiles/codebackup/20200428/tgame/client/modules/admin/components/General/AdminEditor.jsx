import React, { Component, PropTypes } from 'react';
import RichTextEditor from 'react-rte';


class AdminEditor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    string: PropTypes.string.isRequired
  };

  state = {
    value: RichTextEditor.createValueFromString(this.props.string, 'html')
  }

  onChange = (value) => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(
        value.toString('html')
      );
    }
  };

  render () {
    return (
      <RichTextEditor
        value={this.state.value}
        onChange={this.onChange}
      />
    );
  }
}

export default AdminEditor;

