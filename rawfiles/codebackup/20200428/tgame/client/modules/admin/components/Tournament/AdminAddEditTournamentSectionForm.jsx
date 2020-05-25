/* global tinymce */

import React from 'react';
import PropTypes from 'prop-types';
import { TOURNAMENT_ORGANIZED_BY } from '../../../../../lib/enum.js';


class AdminAddEditTournamentSectionForm extends React.Component {
  static propTypes = {
    section: PropTypes.object,
    index: PropTypes.number,
    closeModal: PropTypes.func.isRequired,
    saveSection: PropTypes.func.isRequired,
    tournamentOrganizedBy: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    let section = {
      name: '',
      numberOfRounds: 1,
      playerRatingLowerBound: -1,
      playerRatingUpperBound: 10000,
    };
    if (props.section) {
      section = props.section;
    }
    this.state = {
      section,
    };
  }

  changeValue = (type, e) => {
    const { section } = this.state;
    const value = e.target.value;
    if (type === 'name') {
      section[type] = value;
    } else if (Number.isNaN(value)) {
      section[type] = 0;
    } else {
      section[type] = Number(value);
    }
    this.setState({ section });
  }

  saveChanges = () => {
    const { section } = this.state;
    const { saveSection, closeModal, index } = this.props;

    saveSection(section, this.props.section ? 'edit' : 'add', index);
    closeModal();
  }

  render() {
    const { section } = this.state;
    const { tournamentOrganizedBy } = this.props;
    return (
      <div className="admin-edit-game-practice admin-form">
        <div className="admin-form__header">
          <strong>{this.props.section ? 'Edit tournament section' : 'Add new tournament section'}</strong>
        </div>
        <div className="admin-form__block">
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Name</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={section.name}
                onChange={(e) => { this.changeValue('name', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          {
            tournamentOrganizedBy === TOURNAMENT_ORGANIZED_BY.AGE ?
              <div>
                <div className="admin-form__item">
                  <label className="admin-form__item__label" htmlFor="text-input">Player Birth Year Lower Bound</label>
                  <div className="admin-form__item__input">
                    <input
                      type="text"
                      value={section.playerBirthYearLowerBound}
                      onChange={(e) => { this.changeValue('playerBirthYearLowerBound', e); }}
                      id="text-input"
                      name="text-input"
                      className="admin-form__item__input__control"
                    />
                  </div>
                </div>
                <div className="admin-form__item">
                  <label className="admin-form__item__label" htmlFor="text-input">Player Birth Year Upper Bound</label>
                  <div className="admin-form__item__input">
                    <input
                      type="text"
                      value={section.playerBirthYearUpperBound}
                      onChange={(e) => { this.changeValue('playerBirthYearUpperBound', e); }}
                      id="text-input"
                      name="text-input"
                      className="admin-form__item__input__control"
                    />
                  </div>
                </div>
              </div> :
              <div>
                <div className="admin-form__item">
                  <label className="admin-form__item__label" htmlFor="text-input">Player Rating Lower Bound</label>
                  <div className="admin-form__item__input">
                    <input
                      type="text"
                      value={section.playerRatingLowerBound}
                      onChange={(e) => { this.changeValue('playerRatingLowerBound', e); }}
                      id="text-input"
                      name="text-input"
                      className="admin-form__item__input__control"
                    />
                  </div>
                </div>
                <div className="admin-form__item">
                  <label className="admin-form__item__label" htmlFor="text-input">Player Rating Upper Bound</label>
                  <div className="admin-form__item__input">
                    <input
                      type="text"
                      value={section.playerRatingUpperBound}
                      onChange={(e) => { this.changeValue('playerRatingUpperBound', e); }}
                      id="text-input"
                      name="text-input"
                      className="admin-form__item__input__control"
                    />
                  </div>
                </div>

                <div className="admin-form__item">
                  <label className="admin-form__item__label" htmlFor="text-input">Player Grade Lower Bound</label>
                  <div className="admin-form__item__input">
                    <input
                      type="text"
                      value={section.playerGradeLowerBound}
                      onChange={(e) => { this.changeValue('playerGradeLowerBound', e); }}
                      id="text-input"
                      name="text-input"
                      className="admin-form__item__input__control"
                    />
                  </div>
                </div>
                <div className="admin-form__item">
                  <label className="admin-form__item__label" htmlFor="text-input">Player Grade Upper Bound</label>
                  <div className="admin-form__item__input">
                    <input
                      type="text"
                      value={section.playerGradeUpperBound}
                      onChange={(e) => { this.changeValue('playerGradeUpperBound', e); }}
                      id="text-input"
                      name="text-input"
                      className="admin-form__item__input__control"
                    />
                  </div>
                </div>
              </div>
          }
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Number of rounds</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={section.numberOfRounds}
                onChange={(e) => { this.changeValue('numberOfRounds', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
        </div>
        <div className="admin-form__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.saveChanges(); }}
          >Save changes</button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.props.closeModal(); }}
          >Cancel</button>
        </div>
      </div>
    );
  }
}

export default AdminAddEditTournamentSectionForm;
