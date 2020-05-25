import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '0px',
    display: 'flex',
    alignItems: 'center',
  }
};

export default class ResetLessonModel extends Component {

  state = {
    error: null,
    success: '',
    isLoading: false
  };

  closeModal = () => {
    const { toggleResetLessonModal } = this.props;

    this.setState({
      error: null,
      success: '',
      isLoading: false
    });
    toggleResetLessonModal();
  };

  handleButtonAction = () => {
    const { resetLessonForUser, moveForwardLessonForUser, resetType, gameId, userId, username } = this.props;

    this.setState({ isLoading: true, success: '', error: null });
    if (this.lessonid.value.length > 0) {

      if (resetType == 1) {
        resetLessonForUser(userId, this.lessonid.value, (error) => {
          if (error) {
            this.setState({ error: error.message });
          } else {
            this.setState({ success: 'Lesson reset successfully!' }, () => {
              this.closeModal();
            });
          }
          this.setState({ isLoading: false });
        });
      } else {
        moveForwardLessonForUser(userId, this.lessonid.value, (error) => {
          if (error) {
            this.setState({ error: error.message });
          } else {
            this.setState({ success: 'Lesson moved forward successfully!' }, () => {
              this.closeModal();
            });
          }
          this.setState({ isLoading: false });
        });
      }

   }
  };

  handleInput = (e) => {
    if (e.target.validationMessage.length > 0) {
      this.setState({ error: e.target.validationMessage });
    } else {
      this.setState({ error: null });
    }
  };

  render() {
    const { showModal, resetType, fullname } = this.props;
    const { error, isLoading, success } = this.state;
    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel={'Modal'}
      >
        <div className="modal-Shopping">
          <div className="modal-Shopping__header">
            <div className="modal-Shopping__header__title">{ (resetType == 1 ? "Reset Lesson Progress for " : "Move Slides Forward for ") + fullname}</div>
            <div className="modal-Shopping__header__close">
                <span onClick={this.closeModal} role="presentation"><i className="fa fa-times" /></span>
              </div>

          </div>
          <div className="modal__body">
            <div className="modal__body--content">
              <div className="form form--upgrade">
              <div className="form__group" style={{margin: "10px"}}>
                  <div style={{marginBottom: '20px'}}>
                    <label htmlFor="coins" className="modalDes">Input lesson ID (last part of lesson URL, such as "L1", "T2_H", etc)</label>
                  </div>
                  <input
                    className="field is-empty form__group__text"
                    type="string"
                    id="lessonid"
                    placeholder="L1"
                    ref={(e) => { this.lessonid = e; }}
                    onChange={this.handleInput}
                    defaultValue={""}
                  />
                </div>
                {
                  error &&
                    <span className="form-status--error">
                      {error}
                    </span>
                }
                {
                  success.length > 0 &&
                    <span className="form-status--success">
                      {success}
                    </span>
                }
                <div className="btn--group">
                  {isLoading ?
                    <button className="btn btn-info">
                      <LoadingIcon width="60px" />
                    </button> :
                    <button
                      className="btn btn-info"
                      onClick={this.handleButtonAction}
                      disabled={!!error}
                    >
                      {resetType == 1 ? "Reset" : "Forward"}
                    </button>
                  }
                  <button className="btn btn-default" onClick={this.closeModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

ResetLessonModel.defaultProps = {
  userId: ''
};

ResetLessonModel.propTypes = {
  toggleResetLessonModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  resetLessonForUser: PropTypes.func.isRequired
};
