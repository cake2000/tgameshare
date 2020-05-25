import React, { PureComponent } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import GameOption from './GameOption.jsx';
import GameValue from './GameValue.jsx';

function arrowRenderer() {
  return (
    <span style={{ color: '#000', fontSize: 15 }}><i className="fa fa-caret-down" /></span>
  );
}

class GameSelection extends PureComponent {
  componentDidMount() {
    // auto-select the first game of the list, while init
    const { listGames } = this.props;
    if (listGames && listGames.length > 0) {
      this.selectGame(listGames[0]);
    }
  }

  componentDidUpdate(prevProps) {
    const { isLoading, listGames } = this.props;

    // when the list games is loaded, auto-select the first game
    if (prevProps.isLoading && prevProps.isLoading !== isLoading) {
      if (listGames && listGames.length > 0) {
        this.selectGame(listGames[0]);
      }
    }
  }

  selectGame = (game) => {
    const { onSelect } = this.props;
    if (game && _.isFunction(onSelect)) {
      onSelect(game);
    }
  }

  render() {
    const {
      value, listGames, isLoading, disabled
    } = this.props;

    return (
      <Select
        className="Select--gameSelect"
        onChange={game => this.selectGame(game)}
        options={listGames}
        value={value}
        isLoading={isLoading}

        disabled={disabled}
        isSearchable={ false }
        searchable={ false }
        optionComponent={GameOption}
        valueComponent={GameValue}
        clearable={false}
        labelKey="title"
        valueKey="_id"
        arrowRenderer={arrowRenderer}
        placeholder="Select Game"
      />
    );
  }
}

GameSelection.propTypes = {
  onSelect: PropTypes.func.isRequired,
  value: PropTypes.string,
  listGames: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    imageUrl: PropTypes.string,
    multiplayerMode: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool
};

GameSelection.defaultProps = {
  value: '',
  multiplayerMode: [],
  disabled: false
};

export default GameSelection;
