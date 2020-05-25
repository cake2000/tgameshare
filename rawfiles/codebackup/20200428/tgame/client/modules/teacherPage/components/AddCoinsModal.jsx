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

export default class AddCoinsModal extends Component {

  state = {
    error: null,
    success: '',
    isLoading: false
  };

  closeModal = () => {
    const { toggleAddCoinsModal } = this.props;

    this.setState({
      error: null,
      success: '',
      isLoading: false
    });
    toggleAddCoinsModal();
  };

  handleButtonAction = () => {
    const { addCoinsToUser, userId } = this.props;

    this.setState({ isLoading: true, success: '', error: null });
    if (this.coins.value.length > 0) {
      addCoinsToUser(userId, this.coins.valueAsNumber, (error) => {
        if (error) {
          this.setState({ error: error.message });
        } else {
          this.setState({ success: 'Add successfully!' }, () => {
            this.closeModal();
          });
        }
        this.setState({ isLoading: false });
      });
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
    const { showModal, fullname } = this.props;
    const { error, isLoading, success } = this.state;
    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel={'Modal'}
      >
        <div className="modal-Shopping">
          <div className="modal-Shopping__header" style={{paddingBottom: '6px'}}>
            <div className="modal-Shopping__header__title">{"Add Coins for " + fullname}</div>
            <div className="modal-Shopping__header__close">
                <span onClick={this.closeModal} role="presentation"><i className="fa fa-times" /></span>
              </div>
          </div>
          <div className="modal__body">
            <div className="modal__body--content">
              <div className="form form--upgrade">
                <div className="form__group" style={{margin: "10px"}}>
                  <div style={{marginBottom: '20px'}}>
                    <label htmlFor="coins" className="modalDes">How many coins to add:</label>
                  </div>
                  <input
                    className="field is-empty form__group__text"
                    type="number"
                    id="coins"
                    placeholder="Coins"
                    ref={(e) => { this.coins = e; }}
                    onChange={this.handleInput}
                    defaultValue={0}
                    min={'0'}
                    max={'10000'}
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
                      Add
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

AddCoinsModal.defaultProps = {
  userId: ''
};

AddCoinsModal.propTypes = {
  toggleAddCoinsModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  addCoinsToUser: PropTypes.func.isRequired
};
