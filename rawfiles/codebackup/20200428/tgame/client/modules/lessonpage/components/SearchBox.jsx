import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _debounce from 'lodash/debounce';

class SearchBox extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.handleSearchTerm = _debounce(this.handleSearchTerm, 300);
  }

  handleSearchTerm = () => {
    const { onChange } = this.props;

    if (this.searchInput) {
      onChange(this.searchInput.value);
      this.forceUpdate();
    }
  }

  clearInput = () => {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.handleSearchTerm();
      this.searchInput.focus();
    }
  }

  render() {
    return (
      <div className="awesome-searchBox">
        <i className="fa fa-search" />
        <input type="text" ref={(input) => { this.searchInput = input; }} onChange={this.handleSearchTerm} />
        <i
          className="fa fa-times"
          onClick={this.clearInput}
          role="presentation"
          style={{ display: (_get(this.searchInput, 'value') && this.searchInput.value.trim() !== '') ? 'block' : 'none' }}
        />
      </div>
    );
  }
}

export default SearchBox;
