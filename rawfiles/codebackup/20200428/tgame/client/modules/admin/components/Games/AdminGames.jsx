import React from 'react';
import PropTypes from 'prop-types';
import AdminGameForm from '../../containers/Games/AdminGameForm.js';
import AdminGameItem from './AdminGameItem.jsx';

class AdminGames extends React.Component {

  static propTypes = {
    games: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      currentGameId: null
    };
  }

  setGameForEdit = (gameId, e) => {
    e.preventDefault();
    this.setState({ currentGameId: gameId });
    this.toggleForm();
  }

  toggleForm = () => this.setState({ showForm: !this.state.showForm });

  render() {
    const { showForm, currentGameId } = this.state;
    const { games } = this.props;
    return (
      <div className="admin-homepage-game">
        {
          !showForm ?
            <div className="admin-cards">
              <div className="admin-title">Games</div>
              <div className="admin-cards__content">
                {
                  _.map(games, (game, index) => (
                    <AdminGameItem
                      key={index}
                      game={game}
                      setGameForEdit={this.setGameForEdit}
                    />
                  ))
                }
                <div role="button" tabIndex={0} onClick={this.toggleForm} className="admin-cards__content__add-btn">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                  >
                    <i className="fa fa-plus" /> Add Game
                  </button>
                </div>
              </div>
            </div>
           : <AdminGameForm
             gameId={currentGameId}
             closeForm={this.toggleForm}
           />
        }
      </div>
    );
  }
}

export default AdminGames;
