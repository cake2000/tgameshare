import React from 'react';
import PropTypes from 'prop-types';
import SearchBox from './SearchBox.jsx';
import _debounce from 'lodash/debounce';
import _get from 'lodash/get';

class QATitleBar extends React.PureComponent {
  static propTypes = {
    changeKeyword: PropTypes.func.isRequired
  }

  render() {
    const { changeKeyword } = this.props;

    return (
      <span className="QA_title_bar">
        <span>Q&A</span>
        <span className="search_chat_history_container">
          <SearchBox onChange={changeKeyword} />
        </span>
      </span>
    );
  }
}

export default QATitleBar;
