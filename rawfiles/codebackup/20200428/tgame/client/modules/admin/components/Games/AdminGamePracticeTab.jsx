import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import adminEnums from '../../configs/adminEnums.js';
import AdminAddEditGamePracticeForm from '../../containers/Games/AdminAddEditGamePracticeForm.js';

class AdminGamePracticeTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      selectTutorial: null
    };
  }

  onEditTutorial = (id) => {
    this.setState({ selectTutorial: id });
    this.toggleModal();
  }

  getDifficultyStars = (difficulty) => {
    const stars = [];
    for (let i = 0; i < 5; i += 1) {
      if (i < difficulty) {
        stars.push(<span className="fa fa-star" key={i} />);
      } else {
        stars.push(<span className="fa fa-star-o" key={i} />);
      }
    }
    return (
      <div className="difficulty-star">
        {stars}
      </div>
    );
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal });
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { game } = this.state;

    game[property] = value;
    this.setState({ game });
  }

  render() {
    const { lessons } = this.props;
    const { showModal, selectTutorial } = this.state;
    return (
      <div className="admin-game-practice admin-form">
        <div className="admin-form__block ">
          {
            _.map(adminEnums.LESSON_LEVEL.ARRAY_OBJECT, (type, index) => (
              <div className="admin-game-practice__part" key={index}>
                <div className="admin-game-practice__part__title ">
                  {type.value}
                </div>
                <div>
                  {
                    _.map(
                      lessons,
                      (lesson, subindex) => {
                        if (lesson.package === type.key) {
                          return (
                            <div className="admin-form__item" key={subindex}>
                              <div className="admin-form__item__input">
                                <input
                                  type="text"
                                  defaultValue={lesson.ScenarioName}
                                  id="text-input"
                                  name="text-input"
                                  className="admin-form__item__input__control"
                                  disabled
                                />
                              </div>
                              {this.getDifficultyStars(lesson.Difficulty)}
                              <button
                                type="button"
                                className="admin-btn admin-btn--primary"
                                onClick={() => { this.onEditTutorial(lesson._id); }}
                              >
                                <i className="fa fa-pencil" />
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--danger"
                              >
                                <i className="fa fa-trash-o" />
                              </button>
                            </div>
                          );
                        } return null;
                      }
                    )
                  }
                </div>
              </div>
              ))
          }
          <div>
            <button type="button" className="admin-btn admin-btn--primary" onClick={() => { this.onEditTutorial(null); }}>Add Tutorial</button>
          </div>
        </div>
        <div className="admin-form__footer">
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.props.closeForm}>Cancel</button>
        </div>
        <Modal
          isOpen={showModal}
          contentLabel="Edit game practice"
          onRequestClose={this.toggleModal}
        >
          <AdminAddEditGamePracticeForm tutorialId={selectTutorial} closeModal={this.toggleModal} />
        </Modal>
      </div>
    );
  }
}

export default AdminGamePracticeTab;
