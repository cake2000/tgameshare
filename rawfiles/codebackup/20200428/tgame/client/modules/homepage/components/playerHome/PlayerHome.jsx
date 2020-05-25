/* eslint-disable import/no-unresolved */
import React, { Component } from 'react';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import PlayerStatics from './PlayerStatics.jsx';
import PlayerUpgrade from './PlayerUpgrade.jsx';
import Footer from '../../../core/components/Footer';
import PlayerInfo from './PlayerInfo.jsx';
import PlayerRanking from './PlayerRanking.jsx';
import PlayerCourses from '../../containers/PlayerCourses.js';

class PlayerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statics: {},
      boughtItems: [],
      officialRating: 0,
      officialRd: -1
    };
  }

  componentWillMount() {
    this.getGameItem(this.props.user);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.user, nextProps.user)) {
      this.getGameItem(nextProps.user);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  getGameItem = async (user) => {
    const itemGames = get(user, 'profile.itemGames', []);

    const statics = {
      coins: get(user, 'profile.coins', 0),
      practiceGamesCount: get(user, 'profile.practiceGamesCount', 0),
      onlineBattleCount: get(user, 'profile.onlineBattleCount', 0),
      battleWonCount: get(user, 'profile.battleWonCount', 0)
    };
    const gameItem = await new Promise((resolve, reject) => {
      Meteor.call('gameItem.getByIds', itemGames.map(i => i.itemId), (error, result) => {
        if (!error) {
          return resolve(result);
        }
        return reject(error);
      });
    });
    const boughtItems = gameItem.map(item => ({
      ...item,
      active: !!itemGames.find(i => i.itemId === item._id && i.active === true)
    }));
    this.setState({
      statics,
      boughtItems
    });
  }

  render() {
    const {
      statics, boughtItems
    } = this.state;
    const { isAIUser, gamesList, user } = this.props;

    return (
      <div className="tg-page tg-page--general tg-page--playerHome" id="player-home">
        <div className="tg-page__container">
          <div className="tg-page__container__wrapper">
            <div className="player-block">
              <div className="player-block__groups">
                <PlayerInfo />
                {
                  !isEmpty(statics) && <PlayerStatics statics={statics} />
                }
              </div>
              <PlayerRanking user={user} />
              { isAIUser && <PlayerCourses /> }
            </div>
            {
              !isEmpty(statics) && !isEmpty(boughtItems) && gamesList && gamesList.length > 0
              && <PlayerUpgrade coins={statics.coins} gamesList={gamesList} boughtItems={boughtItems} />
            }
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

export default PlayerHome;
