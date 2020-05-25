import React from 'react';
import PropTypes from 'prop-types';


class AdminTournamentItem extends React.Component {
  static propTypes = {
    setTournamentForEdit: PropTypes.func.isRequired,
    tournament: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  }


  render() {
    const { tournament } = this.props;

    return (
      <div className="admin-homepage-game-item admin-cards__content__item">
        <div className="admin-cards__content__item__block">
          <div className="admin-cards__content__item__block__info">
            <div className="admin-cards__content__item__block__info__title">{tournament.Name}</div>
            {/* <div className="admin-cards__content__item__block__info__desc">{game.description}</div> */}
          </div>
        </div>
        <div className="admin-cards__content__item__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={(e) => { this.props.setTournamentForEdit(tournament._id, e); }}
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

export default AdminTournamentItem;
