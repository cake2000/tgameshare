import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/airbnb.css';
import AdminAddEditTournamentSectionForm from './AdminAddEditTournamentSectionForm.jsx';
import { TOURNAMENT_ORGANIZED_BY } from '../../../../../lib/enum.js';


class AdminTournamentForm extends React.Component {
  static propTypes = {
    tournament: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    games: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    tournamentId: PropTypes.string,
    updateTournament: PropTypes.func.isRequired,
    closeForm: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    let tournament = {
      Name: '',
      description: '',
      RegistrationFee: 0,
      gameId: props.games[0]._id,
      isAIOnly: false,
      isHumanOnly: false,
      sections: [],
      startTime: new Date(),
      organizedBy: TOURNAMENT_ORGANIZED_BY.RATING
    };
    if (props.tournamentId) {
      tournament = props.tournament;
    }
    this.state = {
      tournament,
      selectSection: null,
      showModal: false,
      sectionIndex: null,
      errorMessage: {
        name: ''
      }
    };
  }

  onEditSection = (section, index) => {
    this.setState({
      selectSection: section,
      sectionIndex: index
    });
    this.toggleModal();
  }
  onDeleteSection = (index) => {
    const tournament = Object.assign({}, this.state.tournament);
    tournament.sections.splice(index, 1);
    this.setState({ tournament });
  }

  updateStartDate = (value) => {
    const tournament = Object.assign({}, this.state.tournament);

    tournament.startTime = value[0];
    this.setState({ tournament });
  }

  validateForm = () => {
    let errCount = 0;
    const { tournament } = this.state;
    const errorMessage = Object.assign({}, this.state.errorMessage);
    if (tournament.Name.trim() === '') {
      errorMessage.name = 'Tournament name is required';
      this.setState({ errorMessage });
      errCount += 1;
    } else {
      errorMessage.name = '';
    }
    return errCount;
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { tournament } = this.state;
    if (property === 'RegistrationFee' || property === 'rounds') {
      tournament[property] = Number(value);
    } else {
      tournament[property] = value;
    }
    this.setState({ tournament });
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  }

  showModal = () => {
    this.setState({ selectSection: null });
    this.toggleModal();
  }

  handleCheckbox = (type, e) => {
    const isChecked = e.target.checked;
    const tournament = Object.assign({}, this.state.tournament);

    if (type === 'isAIOnly') {
      tournament.isAIOnly = isChecked;
      if (isChecked) { tournament.isHumanOnly = !isChecked; }
    }
    if (type === 'isHumanOnly') {
      tournament.isHumanOnly = isChecked;
      if (isChecked) { tournament.isAIOnly = !isChecked; }
    }
    this.setState({ tournament });
  }

  saveSection = (section, action, index) => {
    const tournament = Object.assign({}, this.state.tournament);
    const sections = tournament.sections;
    if (action === 'edit') {
      sections[index] = section;
      tournament.sections = sections;
    } else {
      tournament.sections.push(section);
    }
    this.setState({ tournament });
  }

  saveChanges = () => {
    if (this.validateForm() > 0) {
      return false;
    }
    const tournament = Object.assign({}, this.state.tournament);
    const { updateTournament, tournamentId, closeForm } = this.props;
    return updateTournament(tournamentId, tournament, () => {
      closeForm();
    });
  }

  render() {
    const { tournament, showModal, selectSection, sectionIndex, errorMessage } = this.state;
    const { games, tournamentId, closeForm } = this.props;
    return (
      <div className="admin-tournament-from">
        <div className="admin-form__header">
          <strong>{tournamentId ? 'Edit Tournament' : 'Add Tournament'}</strong>
        </div>
        <div className="admin-form">
          <div className="admin-form__block">
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Name</label>
              <div className="admin-form__item__input">
                <input
                  type="text"
                  value={tournament.Name}
                  onChange={(e) => { this.changeValue('Name', e); }}
                  id="text-input"
                  name="text-input"
                  className="admin-form__item__input__control"
                />
                <div className="admin-err-msg">{errorMessage.name}</div>
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Description</label>
              <div className="admin-form__item__input">
                <textarea
                  type="text"
                  value={tournament.description}
                  onChange={(e) => { this.changeValue('description', e); }}
                  id="text-input"
                  name="text-input"
                  className="admin-form__item__input__control"
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Registration Fee</label>
              <div className="admin-form__item__input" >
                <input
                  type="text"
                  value={tournament.RegistrationFee}
                  onChange={(e) => { this.changeValue('RegistrationFee', e); }}
                  id="text-input"
                  name="text-input"
                  className="admin-form__item__input__control"
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Start Time</label>
              <div className="admin-form__item__input" >
                <Flatpickr
                  data-enable-time
                  onChange={value => this.updateStartDate(value)}
                  options={{
                    defaultDate: tournament.startTime,
                  }}
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Games</label>
              <div className="admin-form__item__input">
                <select name="package" value={tournament.gameId} onChange={(e) => { this.changeValue('gameId', e); }}>
                  {
                  _.map(games, (game, index) => (
                    <option value={game._id} key={index}>{game.title}</option>)
                  )
                }
                </select>
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">AI Only</label>
              <div className="admin-form__item__input">
                <input
                  type="checkbox"
                  onChange={(e) => { this.handleCheckbox('isAIOnly', e); }}
                  checked={tournament.isAIOnly}
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Human Only</label>
              <div className="admin-form__item__input">
                <input
                  type="checkbox"
                  onChange={(e) => { this.handleCheckbox('isHumanOnly', e); }}
                  checked={tournament.isHumanOnly}
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Organized By</label>
              <div className="admin-form__item__input">
                <select name="package" value={tournament.organizedBy} onChange={(e) => { this.changeValue('organizedBy', e); }}>
                  {
                    _.map(TOURNAMENT_ORGANIZED_BY.ARRAY_OBJECT, (object, index) => (
                      <option value={object.key} key={index}>{object.value}</option>)
                    )
                  }
                </select>
              </div>
            </div>
            {
              tournament.sections && tournament.sections.length > 0 &&
              <div className="admin-form__item">
                <label className="admin-form__item__label" htmlFor="text-input">Sections</label>
                <div className="admin-form__item__input">
                  <div className="section-list">
                    {
                      _.map(tournament.sections, (section, index) => (
                        <div className="section-list__item" key={index}>
                          <div className="admin-form__item__input">
                            <input
                              type="text"
                              defaultValue={section.name}
                              id="text-input"
                              name="text-input"
                              className="admin-form__item__input__control"
                              disabled
                            />
                          </div>
                          <button
                            type="button"
                            className="admin-btn admin-btn--primary"
                            onClick={() => { this.onEditSection(section, index); }}
                          >
                            <i className="fa fa-pencil" />
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger"
                            onClick={() => { this.onDeleteSection(index); }}
                          >
                            <i className="fa fa-trash-o" />
                          </button>
                        </div>
                      ))
                    }
                    <div className="section-list__add-button">
                      <button
                        type="button"
                        className="admin-btn admin-btn--primary step-rows__add-btn"
                        onClick={() => { this.showModal(); }}
                      >
                        <i className="fa fa-plus" />
                        {'  '} Add new section
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="admin-form__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={this.saveChanges}
          >Save changes</button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { closeForm(); }}
          >Cancel</button>
        </div>
        <Modal
          isOpen={showModal}
          contentLabel="Edit tournament section"
          onRequestClose={() => this.toggleModal()}
        >
          <AdminAddEditTournamentSectionForm
            section={selectSection}
            tournamentOrganizedBy={tournament.organizedBy}
            sectionIndex={sectionIndex}
            closeModal={this.toggleModal}
            saveSection={this.saveSection}
          />
        </Modal>
      </div>
    );
  }
}

export default AdminTournamentForm;
