import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class GameComponent extends React.Component {
  static propTypes = {
    game: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    selectGame: PropTypes.func.isRequired,
    gameSelected: PropTypes.object // eslint-disable-line react/forbid-prop-types
  }
  static defaultProps = {
    gameSelected: null
  }
  constructor(props) {
    super(props);
    this.state = {};
    this.selectGame = this.selectGame.bind(this);
  }

  selectGame = () => {
    const { game, selectGame } = this.props;
    selectGame(game);
  }

  render() {
    const { game } = this.props;
    const selected = classNames({
      'game--wrapper': true,
      // active: (gameSelected && gameSelected.name === game.name)
    });

    return (
      <div aria-hidden className={selected} onClick={this.selectGame}>
        <div className="game__info">
          <img className="game__info__image" src={game.imageUrl} alt="game" />
          <div className="game__info__title">{game.title}</div>
          <div className="game__info__text">{game.description}</div>
        </div>
      </div>
    );
  }
}

export default GameComponent;
