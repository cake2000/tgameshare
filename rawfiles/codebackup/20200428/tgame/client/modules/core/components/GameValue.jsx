import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { GameIcon } from './GameOption.jsx';

class GameValue extends Component {
  static propTypes = {
    children: PropTypes.node,
    value: PropTypes.shape()
  }

  render () {
    const { value, children } = this.props;

    return (
      <div className="Select-value" title={value.title}>
        <span className="Select-value-label">
          <GameIcon game={value} />
          {children}
        </span>
      </div>
    );
  }
}

export default GameValue;
