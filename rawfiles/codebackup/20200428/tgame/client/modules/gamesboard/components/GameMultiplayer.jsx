import React from 'react';
import PropTypes from 'prop-types';
import { GAMEBOARD_STATEMENT } from '../../../../lib/const';
import { MULTIPLAYER_MODE_MAP } from '../../../../lib/enum';

class GameMultiplayer extends React.Component {
  static propTypes = {
    options: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectOption: PropTypes.func.isRequired,
    selectGame: PropTypes.func.isRequired
  };

  static defaultProps = {
    options: []
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.selectOption = this.selectOption.bind(this);
  }

  selectOption(name) {
    const { selectOption } = this.props;
    selectOption(MULTIPLAYER_MODE_MAP[name]);
  }

  renderMultiplayerIcon = (number) => {
    return (
      <div className="label">
        <span className="label--bold">{number}&nbsp;</span>
        <span className="label--small">vs</span>
        <span className="label--bold">&nbsp;{number}</span>
      </div>
    );
  }

  renderOption = (option, index) => {
    const number = MULTIPLAYER_MODE_MAP[option];
    const { teamSize } = this.props;

    return (
      <div
        aria-hidden
        key={`gameMode-${index}`}
        className={["gameMode__content__items", number === teamSize ? 'active' : ''].join(' ')}
        onClick={() => this.selectOption(option)}
      >
        <div className="gameMode__content__items__info">
          <div className="gameMode__content__items__title">{this.renderMultiplayerIcon(number)}</div>
        </div>
      </div>
    );
  }

  render() {
    const {
      options, error, isGamePool, selectGame
    } = this.props;
    return (
      <div className={["gameMode", isGamePool ? 'smaller' : 'smaller'].join(' ')} id="difficulty">
        <div className="configure-groups__header gameMode__header">
          {/* <div
            aria-hidden
            className="back-btn"
            onClick={() => selectGame()}
          >
            <i className="fa fa-angle-left" />
            <span> Back</span>
          </div> */}
          <h1 className="gameMode__header__title difficulty-title">Choose Multiplayer</h1>
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
          {options.map(this.renderOption)}
        </div>
      </div>
    );
  }
}

export default GameMultiplayer;
