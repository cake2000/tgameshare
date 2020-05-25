import React, { Component } from 'react';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import _find from 'lodash/find';
import PlayerStatics from '../../homepage/components/playerHome/PlayerStatics.jsx';
import PastChallenge from './PastChallenge.jsx';
import Avatar from '../../core/components/Avatar.jsx';
import { DEFAULT_AVATAR, MIGRATION_CONST } from '../../../../lib/enum.js';
import { NO_BOT_RELEASE } from './PlayerItem.jsx';

class PlayerBasicInfo extends Component {
  state = {
    isLoading: false,
    error: null
  };

  getStatics = playerInfo => ({
    coins: _get(playerInfo, 'profile.coins', 0),
    practiceGamesCount: _get(playerInfo, 'profile.practiceGamesCount', 0),
    onlineBattleCount: _get(playerInfo, 'profile.onlineBattleCount', 0),
    battleWonCount: _get(playerInfo, 'profile.battleWonCount', 0)
  })

  componentDidMount() {
    const { playerId } = this.props;
    if (playerId) {
      this.getPlayerRanking(playerId);
    }
  }

  componentDidUpdate(prevProps) {
    const { playerId } = this.props;
    if (prevProps.playerId !== playerId) {
      this.getPlayerRanking(playerId);
    }
  }

  async getPlayerRanking(playerId) {
    this.setState({ isLoading: true, error: null });

    Meteor.call('getUserRanking', playerId, (err, result) => {
      if (err) {
        this.setState({
          isLoading: false,
          error: _.get(err, 'reason', '')
        });
      } else {
        this.setState({ isLoading: false, error: null });
        if (this.userRankingLabel) {
          this.userRankingLabel.innerHTML = `#${_get(_find(result, { gameId: MIGRATION_CONST.poolGameId }), 'numberRanking', 'None')}`;
        }
        // if (result && result.length > 0) {
        //   const newState = _.reduce(result, (memo, { gameId, name, numberRanking }) => {
        //     switch (gameId) {
        //       case MIGRATION_CONST.poolGameId:
        //         return { ...memo, [name]: numberRanking };
        //       case MIGRATION_CONST.tankGameId:
        //         return { ...memo, [name]: numberRanking };
        //       default:
        //         return memo;
        //     }
        //   }, {});

        //   console.log('newState', newState);
        //   this.setState(prevState => ({
        //     ...prevState,
        //     ...newState
        //   }));
        // }
      }
    });
  }

  loadPlayerBasicInfo = (playerId) => {
    const { loadPlayerBasicInfo } = this.props;

    loadPlayerBasicInfo(playerId);
  }

  openChallengeBot = () => {
    const { openChallengeBot, playerId, playerInfo } = this.props;
    // const opponentKey = playerId !== ownerId ? 'challenger' : 'defender';
    // const opponent = {
    //   _id: playerInfo._id,
    //   username: _get(Meteor.users.findOne({ _id: challengeHistory[opponentKey]._id }), 'username')
    // };
    openChallengeBot(playerInfo);
  }

  openChallengeManually = () => {
    const { openChallengeManually, playerInfo } = this.props;
    openChallengeManually(playerInfo);
  }

  getMyBotLink = () => {
    const { botRelease } = this.props;
    if (botRelease === NO_BOT_RELEASE) {
      return (<span className="presentation presentation--disabled" key={1} onClick={this.promptForBot} role="presentation">My Bot</span>);
    }
    return (<span className="presentation" key={1} onClick={this.openChallengeBot} role="presentation">My Bot</span>);
  }

  render() {
    const { isLoading } = this.state;
    const { playerInfo, challengeHistoryList, playerId } = this.props;
    const statics = this.getStatics(playerInfo);

    if (!playerInfo) return null;

    return (
      <div>
        <div className="player-block">
          <div className="player-block__groups">
            <div className="player-info" style={{ marginRight: 40, flex: 0 }}>
              <div className="player-info__wrapper">
                <Avatar url={_get(playerInfo, 'avatar.url', DEFAULT_AVATAR)} />
                <span className="player-info__username" style={{ margin: '15px 0 0 0' }}>{_get(playerInfo, 'username')}</span>
                <div className="player-ranking__wrapper no-shadow">
                  <div className="player-ranking__rating">
                    <div className="player-ranking__rating__items">
                      <img src="/img_v2/Pool@2x.png" alt="Pool game" />
                      { isLoading ? <i className="fa fa-circle-o-notch fa-spin" /> : <span className="player-ranking__rating__items__number" ref={(element) => { this.userRankingLabel = element; }} /> }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            { !_isEmpty(statics) && <PlayerStatics statics={statics} style={{ flex: 1, height: '100%' }} /> }
          </div>
        </div>
        {Meteor.userId() !== playerInfo._id && (
        <div className="ChallengeText" >
          <span>
            {"Challenge " + playerInfo.username + ": "}
            {Meteor.userId() !== playerInfo._id && [
            this.getMyBotLink(),
            ' /',
            <span key="2" className="Past-challenge__challenge__right presentation" role="presentation" onClick={this.openChallengeManually}>Myself</span>
          ]}

          </span>
        </div>
        )}
        <PastChallenge
          {...this.props}
          challengeHistoryList={challengeHistoryList}
          playerId={playerId}
          loadPlayerBasicInfo={this.loadPlayerBasicInfo}
        />
      </div>
    );
  }
}

export default PlayerBasicInfo;
