import React from 'react';
import _ from 'lodash';
import { Link, NavLink } from 'react-router-dom';
import { MIGRATION_CONST, PAYMENT_PRO } from '../../../../../lib/enum';

class PlayerRanking extends React.Component {
  state = {
    isLoading: false,
    error: null,
    poolRank: 0,
    tankRank: 0
  }

  componentWillMount() {
    this.getUserRanking();
  }

  async getUserRanking() {
    this.setState({ isLoading: true, error: null });
    const userId = Meteor.userId();
    if (!userId) {
      this.setState({
        isLoading: false,
        error: 'Please login'
      });
      return;
    }
    Meteor.call('getUserRanking', userId, (err, result) => {
      if (err) {
        this.setState({
          isLoading: false,
          error: _.get(err, 'reason', '')
        });
      } else {
        this.setState({ isLoading: false, error: null });
        if (result && result.length > 0) {
          const newState = _.reduce(result, (memo, { gameId, numberRanking }) => {
            switch (gameId) {
              case MIGRATION_CONST.poolGameId:
                return { ...memo, poolRank: numberRanking };
              case MIGRATION_CONST.tankGameId:
                return { ...memo, tankRank: numberRanking };
              default:
                return memo;
            }
          }, {});
          this.setState(prevState => ({
            ...prevState,
            ...newState
          }));
        }
      }
    });
  }

  render() {
    const {
      isLoading, error, poolRank, tankRank
    } = this.state;
    const { user } = this.props;

    let myPoolRanking = Math.round(poolRank);
    let myTankRanking = Math.round(tankRank);

    myPoolRanking = myPoolRanking === 0 ? 'None' : `#${myPoolRanking}`;
    myTankRanking = myTankRanking === 0 ? 'None' : `#${myTankRanking}`;
    const { accountType, isGrandfathered } = Meteor.user();
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered;

    return (
      <div className="player-ranking player-ranking--information">
        <div className="player-ranking__wrapper">
          <span className="player-ranking__wrapper__desc">Your Current Ranking</span>
          <div className="player-ranking__rating">
            <div className="player-ranking__rating__items">
              <img src="/img_v2/Pool@2x.png" alt="raking" />
              {
                isPremium ? (
                  <span className="player-ranking__rating__items__number">
                    {/* { isLoading ? '' : `${myranking} (${_.get(user, 'playGames[0].rating')})` } */}
                    { isLoading ? '' : `${myPoolRanking}` }
                  </span>
                ) : (
                  <span className="player-ranking__rating__items__premiumWarning">
                    <NavLink to="/account-management">
                      <span>Premium account only</span>
                    </NavLink>
                  </span>
                )
              }
            </div>
            <div className="player-ranking__rating__items">
              <img src="/img_v2/Tank@2x.png" alt="raking" />
              {
                isPremium ? (
                  <span className="player-ranking__rating__items__number">
                    {/* { isLoading ? '' : `${myranking} (${_.get(user, 'playGames[0].rating')})` } */}
                    { isLoading ? '' : `${myTankRanking}` }
                  </span>
                ) : (
                  <span className="player-ranking__rating__items__premiumWarning">
                    <NavLink to="/account-management">
                      <span>Premium account only</span>
                    </NavLink>
                  </span>
                )
              }
            </div>
            {/* please hide the ranking for tank war game for now until we release the tutorials for it next January */}
            {/* <div className="player-ranking__rating__items">
              <img src="/img_v2/Tank@2x.png" alt="raking" />
              <span className="player-ranking__rating__items__number">
                { isLoading ? '' : `#${Math.round(tankRank)}` }
              </span>
            </div> */}
          </div>
          <Link className="player-ranking__action" to="leaderboard">View National Leaderboard</Link>
          { error && <span className="error-msg">{error}</span>}
        </div>
      </div>
    );
  }
}

export default PlayerRanking;
