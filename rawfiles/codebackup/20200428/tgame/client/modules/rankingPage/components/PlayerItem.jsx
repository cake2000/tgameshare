/* global Bert */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export const NO_BOT_RELEASE = "no-bot-selected-special-value-IUYDFSW";

class PlayerItem extends Component {
  openChallengeBot = () => {
    const { player, openChallengeBot } = this.props;
    openChallengeBot(player);
  }

  promptForBot = () => {
    Bert.alert("Please specify your official bot release first.", 'danger', 'fixed-top');
  }

  openChallengeManually = () => {
    const { player, openChallengeManually } = this.props;
    openChallengeManually(player);
  }

  getMyBotLink() {
    const { myBotRelease } = this.props;
    if (myBotRelease === NO_BOT_RELEASE) {
      return (<span className="presentation presentation--disabled" key={1} onClick={this.promptForBot} role="presentation">My Bot</span>);
    }
    return (<span className="presentation presentation--mybot" key={1} onClick={this.openChallengeBot} role="presentation">My Bot</span>);
  }

  openPlayerBasicInfo = () => {
    const { player: { _id }, openPlayerBasicInfo } = this.props;

    openPlayerBasicInfo(_id);
  }

  render() {
    const { player } = this.props;
    const isYourRecord = Meteor.userId() === player._id;

    return (
      <div className={`ranking__table__content__items ${isYourRecord ? 'ranking__table__content__items--owner' : ''}`} key={player._id}>
        <div className="ranking__table__content__items__number"><span>{player.rankingNumber + 1}</span></div>
        <div className="ranking__table__content__items__rating"><span>{Math.max(50, Math.ceil(player.rating))}</span></div>
        <div className="ranking__table__content__items__fullname"><span onClick={this.openPlayerBasicInfo} role="presentation"><span className="presentation presentation--username">{ player.username || '-'}</span></span></div>
        <div className="ranking__table__content__items__coin"><span>{player.coins >= 0 ? player.coins : '-'}</span></div>
        <div className="ranking__table__content__items__battle"><span>{`${player.officialBattleWonCount || 0}/${player.officialBattleCount || 0}`}</span></div>
        <div className="ranking__table__content__items__challenge">
          { !isYourRecord
            && [
              this.getMyBotLink(),
              <span className="presentation presentation--myself" key={2} onClick={this.openChallengeManually} role="presentation">Myself</span>
            ]
          }
        </div>
      </div>
    );
  }
}

PlayerItem.propTypes = {
  player: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    rating: PropTypes.number,
    rankingNumber: PropTypes.number,
    username: PropTypes.string
  }).isRequired,
  openChallengeBot: PropTypes.func.isRequired,
  openChallengeManually: PropTypes.func.isRequired
};

export default PlayerItem;
