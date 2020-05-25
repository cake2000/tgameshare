/* global Bert */
import React from 'react';
import _get from 'lodash/get';
import moment from 'moment';
import { NO_BOT_RELEASE } from './PlayerItem.jsx';

export default class PastChallengeItem extends React.PureComponent {
  loadPlayerBasicInfo = () => {
    const { challengeHistory, loadPlayerBasicInfo, playerId } = this.props;
    const { ownerId } = challengeHistory;

    const opponentKey = playerId !== ownerId ? 'challenger' : 'defender';
    loadPlayerBasicInfo(challengeHistory[opponentKey]._id);
  }

  openChallengeBot = () => {
    const { openChallengeBot, playerId, challengeHistory } = this.props;
    const { ownerId } = challengeHistory;
    const opponentKey = playerId !== ownerId ? 'challenger' : 'defender';
    const opponent = {
      _id: challengeHistory[opponentKey]._id,
      username: _get(Meteor.users.findOne({ _id: challengeHistory[opponentKey]._id }), 'username')
    };
    openChallengeBot(opponent);
  }

  openChallengeManually = () => {
    const { openChallengeManually, playerId, challengeHistory } = this.props;
    const { ownerId } = challengeHistory;
    const opponentKey = playerId !== ownerId ? 'challenger' : 'defender';
    const opponent = {
      _id: challengeHistory[opponentKey]._id,
      username: _get(Meteor.users.findOne({ _id: challengeHistory[opponentKey]._id }), 'username')
    };
    openChallengeManually(opponent);
  }

  promptForBot = () => {
    Bert.alert("Please specify your official bot release first.", 'danger', 'fixed-top');
  }

  getMyBotLink = () => {
    const { botRelease } = this.props;
    if (botRelease === NO_BOT_RELEASE) {
      return (<span className="presentation presentation--disabled" key={1} onClick={this.promptForBot} role="presentation">My Bot</span>);
    }
    return (<span className="presentation" key={1} onClick={this.openChallengeBot} role="presentation">My Bot</span>);
  }

  render() {
    const {
      challengeHistory,
      playerId
    } = this.props;
    const {
      _id, ownerId, winnerId, createdAt
    } = challengeHistory;
    const currentPlayerKey = playerId === ownerId ? 'challenger' : 'defender';
    const opponentKey = playerId !== ownerId ? 'challenger' : 'defender';
    const isWinner = playerId === winnerId;
    const result = isWinner ? 'Won' : 'Lost';

    return (
      <tr key={_id}>
        <td>{moment(createdAt).format('YYYY/MM/DD')}</td>
        <td>{moment(createdAt).format('hh:mm:ss A')}</td>
        <td>{currentPlayerKey.charAt(0).toUpperCase() + currentPlayerKey.substr(1).toLowerCase()}</td>
        <td>
          <span className="Past-challenge__opponent-rating presentation presentation--username" role="presentation" onClick={this.loadPlayerBasicInfo}>
            {_get(Meteor.users.findOne({ _id: challengeHistory[opponentKey]._id }), 'username')}
          </span>
          {`(${challengeHistory[opponentKey].rating})`}
        </td>
        <td>{result}</td>
        <td>
          {`${challengeHistory[currentPlayerKey].ratingChange[0]}`}
          <i
            className="fa fa-long-arrow-right"
            aria-hidden="true"
            style={{
              color: isWinner ? '#009688' : '#ff3c2df7',
              transform: `rotate(${isWinner ? '-90deg' : '90deg'})`
            }}
          />
          {`${challengeHistory[currentPlayerKey].ratingChange[1]}`}
        </td>
        {/* <th>
          {Meteor.userId() !== challengeHistory[opponentKey]._id && [
            this.getMyBotLink(),
            ' /',
            <span key="2" className="Past-challenge__challenge__right presentation" role="presentation" onClick={this.openChallengeManually}>Myself</span>
          ]}
        </th> */}
      </tr>
    );
  }
}
