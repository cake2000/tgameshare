import React, { Component } from 'react';
// import PropTypes from 'prop-types';

export function GameIcon({ game }) {
  const gameIconStyle = {
    borderRadius: 3,
    display: 'inline-block',
    marginRight: 10,
    position: 'relative',
    top: -2,
    verticalAlign: 'middle'
  };
  

  return (
    <img src={game.imageUrl} width={15} height={15} alt={game.title} style={gameIconStyle} />
  );
}

export default class GameOption extends Component {
  // static propTypes = {
  //   children: PropTypes.node,
  //   className: PropTypes.string,
  //   isDisabled: PropTypes.bool,
  //   isFocused: PropTypes.bool,
  //   isSelected: PropTypes.bool,
  //   onFocus: PropTypes.func,
  //   onSelect: PropTypes.func,
  //   option: PropTypes.object.isRequired
  // }

  handleMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onSelect(this.props.option, event);
  }

  handleMouseEnter = (event) => {
    this.props.onFocus(this.props.option, event);
  }

  handleMouseMove = (event) => {
    if (this.props.isFocused) return;
    this.props.onFocus(this.props.option, event);
  }

  render() {
    const { className, option, children } = this.props;

    let url = option.imageUrl;
    if (url == "/images/turtlegreen.png" && option.packageType != "starter") {
      option.imageUrl = "/images/turtlecolor1.png";
    }

    return (
      <div
        className={className}
        onMouseDown={this.handleMouseDown}
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        title={option.title}
        role="presentation"
      >
        <GameIcon game={option} />
        {children}
      </div>
    );
  }
}
