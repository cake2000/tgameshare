import React from 'react';
import PropTypes from 'prop-types';


class AdminGameItem extends React.Component {
  static propTypes = {
    setGameForEdit: PropTypes.func.isRequired,
    game: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  }


  render() {
    const { game } = this.props;

    return (
      <div className="admin-homepage-game-item admin-cards__content__item">
        <div className="admin-cards__content__item__block">
          <img
            src={game.customImage ? game.customImage : game.imageUrl}
            alt="Game logo"
            style={{ objectFit: 'cover', width: '100px', height: '100px' }}
          />
          <div className="admin-cards__content__item__block__info">
            <div className="admin-cards__content__item__block__info__title">{game.title}</div>
            <div className="admin-cards__content__item__block__info__desc">{game.description}</div>
          </div>
        </div>
        <div className="admin-cards__content__item__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={(e) => { this.props.setGameForEdit(game._id, e); }}
          >
            <i className="fa fa-pencil-square-o" />
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.deleteGame(); }}
          >
            <i className="fa fa-trash-o" />
          </button>
        </div>
      </div>
    );
  }
}

export default AdminGameItem;
