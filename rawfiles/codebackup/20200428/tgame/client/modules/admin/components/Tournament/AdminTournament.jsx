import React from 'react';
import PropTypes from 'prop-types';
import AdminTournamentForm from '../../containers/Tournament/AdminTournamentForm.js';
import AdminTournamentItem from './AdminTournamentItem.jsx';

class AdminTournament extends React.Component {

  static propTypes = {
    tournaments: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      currentTournamentId: null
    };
  }

  onAddTournament = () => {
    this.setState({ currentTournamentId: null });
    this.toggleForm();
  }

  setTournamentForEdit = (tournamentId, e) => {
    e.preventDefault();
    this.setState({ currentTournamentId: tournamentId });
    this.toggleForm();
  }

  toggleForm = () => this.setState({ showForm: !this.state.showForm });

  render() {
    const { showForm, currentTournamentId } = this.state;
    const { tournaments } = this.props;
    return (
      <div className="admin-tournament">
        {
          !showForm ?
            <div className="admin-cards">
              <div className="admin-title">Tournaments</div>
              <div className="admin-cards__content">
                {
                  _.map(tournaments, (tournament, index) => (
                    <AdminTournamentItem
                      key={index}
                      tournament={tournament}
                      setTournamentForEdit={this.setTournamentForEdit}
                    />
                  ))
                }
                <div role="button" tabIndex={0} onClick={this.toggleForm} className="admin-cards__content__add-btn">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                  >
                    <i className="fa fa-plus" /> Add Tournament
                  </button>
                </div>
              </div>
            </div>
           : <AdminTournamentForm
             tournamentId={currentTournamentId}
             closeForm={this.onAddTournament}
           />
        }
      </div>
    );
  }
}

export default AdminTournament;
