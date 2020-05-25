import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import { MIGRATION_CONST } from '../../../../lib/enum';

const StyleModal = maxWidth => ({
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  content: {
    top: '200px',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, 0%)',
    maxWidth: maxWidth || '880px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    padding: '0px',
    display: 'flex',
    alignItems: 'center'
  }
});

const BUILD_BOT_TITLE = `Official Bot Needed!`;

class ChallengePopup extends Component {
  state = {
    isLoading: false,
    error: null
  };

  componentWillUnmount() {
    this.setState({ isLoading: false, error: null });
  }

  renderBody = () => {
    const {
      isAIBattle, game, opponent, isMissingMyBot: noBot,
      botRelease, botReleases
    } = this.props;
    const opponentName = _.get(opponent, 'username');
    const gameTitle = _.get(game, 'title');

    if (noBot && isAIBattle) {
      return (
        <div className="challenge--main">
          <div className="challenge__line">Please take our courses to build your own gamebots, and set your official bot on top of the leaderboard page.</div>
        </div>
      );
    }

    if (!isAIBattle) {
      return (
        <div className="challenge--main">
          <div className="challenge__line">
            {`You are about to manually challenge `}
            <b>{opponentName}</b>
            {`’s bot in a ${gameTitle} game.`}
          </div>
          <div className="challenge__line">This game won’t cost you any coins, and no bot’s rating score will be affected.</div>
        </div>
      );
    }
    const botReleaseName = _.get(_.find(botReleases, { _id: botRelease }), 'releaseName');

    return (
      <div className="challenge--main">
        <div className="challenge__line">
          {`You are about to challenge `}
          <b>{opponentName}</b>
          {`’s bot using your own bot, for no obvious reason other than fame and fortune.`}
        </div>
        <div className="challenge__line">
          {`You will gladly pay `}
          <b>{opponentName}</b>
          <span> 25 coins </span>
          for this privilege, and both of your game bots will get an updated rating score based on the outcome of this battle. You will be rewarded
          {' '}
          <span>50 coins </span>
          {' '}
          if you win!
        </div>
        <div className="challenge__line">
          {`Your official game bot version for the ${gameTitle} game is “`}
          <span>{botReleaseName}</span>
          ”. You can select which bot to use at the top of the leaderboard page.
        </div>
      </div>
    );
  };

  startBattle = (type = 1) => () => {
    const {
      isAIBattle, game, opponent,
      botRelease, history
    } = this.props;
    this.setState({ isLoading: true });

    // start a challenge
    const challengeGame = {
      opponent,
      game,
      botRelease,
      isAIBattle,
      type
    };
    Meteor.call('startChallengeGame', challengeGame, (err, activeGameRoomId) => {
      if (err && err.reason) {
        this.setState({ isLoading: false, error: err.reason });
      } else if (activeGameRoomId) {
        history.push(`/playgame/${activeGameRoomId}`);
      }
    });
  };

  cancel = () => {
    const { onClose } = this.props;
    this.setState({ isLoading: false, error: null });
    onClose();
  };

  renderButtons = () => {
    const {
      game, isMissingMyBot: noBot, isAIBattle
    } = this.props;
    const { isLoading } = this.state;
    const isMissingMyBot = noBot && isAIBattle;
    const buttonName = `Start ${game && game._id === MIGRATION_CONST.tankGameId && !isAIBattle ? '1v1 ' : ''}Battle Now`;

    if (!isMissingMyBot) {
      if (game && game._id === MIGRATION_CONST.tankGameId) {
        if (isAIBattle) {
          return (
            <div>
              <button
                onClick={this.startBattle(1)}
                disabled={isLoading}
                className="tank-button"
                type="button"
              >
                Start 1v1 Battle Now
              </button>
              <button
                onClick={this.startBattle(2)}
                disabled={isLoading}
                className="tank-button"
                type="button"
              >
                Start 2v2 Battle Now
              </button>
              <button
                onClick={this.startBattle(3)}
                disabled={isLoading}
                className="tank-button"
                type="button"
              >
                Start 3v3 Battle Now
              </button>
            </div>
          );
        }
      }
      return (
        <button
          onClick={this.startBattle(1)}
          disabled={isLoading}
          className="tank-button"
          type="button"
        >
          {buttonName}
        </button>
      );
    }
    return null;
  };

  render() {
    const { isLoading, error } = this.state;
    const {
      isOpen, isMissingMyBot: noBot, isAIBattle, game
    } = this.props;
    const isMissingMyBot = noBot && isAIBattle;

    return (
      <Modal
        style={StyleModal(game && game._id === MIGRATION_CONST.tankGameId && isAIBattle && '940px')}
        isOpen={!!isOpen}
        contentLabel="Modal"
      >
        <div className="modal_block_general modal--challenge-modal">
          { isLoading && <div className="modal_block_general__loadingOverlay"><LoadingIcon /></div> }
          <div className="modal__header">
            <span className="modal__header__title">{isMissingMyBot ? BUILD_BOT_TITLE : 'Challenge'}</span>
          </div>
          <div className="modal__body">
            <div className="modal__body__content">
              {this.renderBody()}
              { error && !isMissingMyBot && <span className="error-msg">{error}</span>}
            </div>
          </div>
          <div className="modal__footer">
            <div className="modal__footer__content">
              { this.renderButtons() }
              <button className="cancel-battle" onClick={this.cancel} type="button">Cancel Challenge</button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

ChallengePopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  botRelease: PropTypes.string.isRequired,
  isMissingMyBot: PropTypes.bool.isRequired,
  isAIBattle: PropTypes.bool.isRequired
};

ChallengePopup.defaultProps = {
};

export default withRouter(ChallengePopup);
