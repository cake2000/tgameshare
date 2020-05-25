/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

class InviteComponent extends React.Component {
  static propTypes = {
    gameRoomData: PropTypes.object,
    countdown: PropTypes.object,
    game: PropTypes.object,
    owner: PropTypes.object,
    decline: PropTypes.func.isRequired,
    accept: PropTypes.func.isRequired,
    history: PropTypes.object
  }

  static defaultProps = {
    gameRoomData: null,
    countdown: null,
    game: null,
    owner: null,
    history: null
  }

  render() {
    const { gameRoomData, countdown, game, owner } = this.props;

    return (
      <div className="request--container">
        <div className="request--wrapper">
          <div className="request__header">
            <span>Do you want to join ?</span>
          </div>
          <div className="request__content">
            <div className="detail--wrapper">
              <div className="detail__title">
                <span>Game:</span>
              </div>
              <div className="detail__content">
                <span>{game.title}</span>
              </div>
            </div>
            <div className="detail--wrapper">
              <div className="detail__title">
                <span>Username:</span>
              </div>
              <div className="detail__content">
                <span>{owner.username}</span>
              </div>
            </div>
            <div className="detail--wrapper">
              <div className="detail__title">
                <span>Level:</span>
              </div>
              <div className="detail__content">
                <span>{gameRoomData.level}</span>
              </div>
            </div>
            <div className="detail--wrapper">
              <div className="detail__title">
                <span>Countdown:</span>
              </div>
              <div className="detail__content">
                <span>{countdown.count}</span>
              </div>
            </div>
            <div className="detail--button">
              <button
                className="detail--button__accept"
                onClick={() => {
                  this.props.accept(gameRoomData._id, Meteor.userId(), this.props.history);
                }}
              >Accept</button>
              <button
                className="detail--button__decline"
                onClick={() => {
                  this.props.decline(gameRoomData._id, Meteor.userId());
                }}
              >Decline</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InviteComponent;
