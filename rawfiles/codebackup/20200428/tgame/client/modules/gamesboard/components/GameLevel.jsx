import React from 'react';
import PropTypes from 'prop-types';
// import ReactSVG from 'react-svg';
import { GAMEBOARD_STATEMENT } from '../../../../lib/const';
import { LEVELS, PAYMENT_PRO } from '../../../../lib/enum';
// import { COINS_WAGER, OPPONENTS } from '../../../../lib/enum';

class GameLevel extends React.Component {
  static propTypes = {
    levels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectLevel: PropTypes.func.isRequired,
    levelSelected: PropTypes.string,
    history: PropTypes.shape().isRequired
    // gameMode: PropTypes.string.isRequired
  };

  static defaultProps = {
    levels: [],
    levelSelected: null
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.selectLevel = this.selectLevel.bind(this);
  }

  selectLevel(name) {
    const { accountType, isGrandfathered } = Meteor.user();
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered;

    if (!isPremium && name !== LEVELS.BEGINNER) {
      const { history } = this.props;

      history.push('/account-management');
    } else {
      const { selectLevel } = this.props;
      selectLevel(name);
    }
  }

  renderLevel = (level) => {
    const { /* gameMode, */ levelSelected } = this.props;
    const { accountType, isGrandfathered } = Meteor.user();
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered;
    const premiumClassName = !isPremium && level.name !== LEVELS.BEGINNER;

    return (
      <div
        aria-hidden
        key={level.name}
        className={`gameMode__content__items ${level.name === levelSelected && 'active'} ${premiumClassName && 'lockPremium'}`}
        onClick={() => this.selectLevel(level.name)}
      >
        <div className="gameMode__content__items__info">
          {
            premiumClassName && (
              <div className="gameMode__content__items__premiumLink">
                Premium account only
              </div>
            )
          }
          <div className={`level--${level.name}`}>
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </div>
          <div className="gameMode__content__items__title">{level.name}</div>
          {/*
            Free to play!
            For now players can play online game for free.
          {
            gameMode !== OPPONENTS.MYSELF.name
              && (
              <div className="gameMode__content__items__info__coin">
                <img src="/images/coin.png" alt="" />
                <span>{COINS_WAGER[level.name.toUpperCase()]}</span>
              </div>
              )
          } */}
        </div>
      </div>
    );
  }

  render() {
    const { levels, error, isGamePool } = this.props;
    return (
      <div className={["gameMode", isGamePool ? 'smaller' : 'smaller'].join(' ')} id="gameMode">
        <div className="gameMode__header">
          <h1 className="gameMode__header__title">Choose Difficulty</h1>
          {
            error === 'NOT_LEVEL'
              && (
              <div className="option__header__error">
                <span>{GAMEBOARD_STATEMENT.NOT_LEVEL}</span>
              </div>
              )
          }
        </div>
        <div className="gameMode__content">
          {levels.map(this.renderLevel)}
        </div>
      </div>
    );
  }
}

export default GameLevel;
