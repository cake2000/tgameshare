import React, { Component } from 'react';
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
    alignItems: 'center'
  }
};

export default class ChangeAccountPasswordModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      success: '',
      error: {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      password: {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      isLoading: false
    };
  }

  closeModal = () => {
    const { closeChangePasswordModal } = this.props;
    this.clearError();
    this.setState({ success: '' });
    closeChangePasswordModal();
  }

  clearError = () => {
    const { error } = this.state;

    error.confirmNewPassword = '';
    error.oldPassword = '';
    error.newPassword = '';

    this.setState({ error });
  }

  validatePassword = () => {
    const { password, error } = this.state;
    const { oldPassword, newPassword, confirmNewPassword } = password;
    if (oldPassword.length === 0) {
      error.oldPassword = 'Old password is required';
      this.setState({ error });
      return false;
    }
    if (newPassword.length === 0) {
      error.newPassword = 'New password is required';
      this.setState({ error });
      return false;
    }
    if (confirmNewPassword.length === 0) {
      error.confirmNewPassword = 'Confirm password is required';
      this.setState({ error });
      return false;
    }
    if (newPassword.length < 8) {
      error.newPassword = 'Password must be at least 8 characters';
      this.setState({ error });
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      error.newPassword = 'Password does not match';
      error.confirmNewPassword = 'Password does not match';
      this.setState({ error });
      return false;
    }
    return true;
  }

  handlePasswordChange = (field, value) => {
    const { password } = this.state;

    password[field] = value;
    this.setState({ password });
  }

  changePassword = () => {
    const { changePassword, userData } = this.props;
    const { password, error } = this.state;
    this.setState({ isLoading: true });
    this.clearError();
    if (!this.validatePassword()) {
      this.setState({ isLoading: false });
      return;
    }

    changePassword(userData.username, password.oldPassword, password.newPassword, (errMsg) => {
      this.setState({ isLoading: false });
      if (errMsg) {
        error.oldPassword = 'Incorrect old password!';
        this.setState({ error });
        return;
      }
      this.setState({ success: 'Password has changed successful!' });
      setTimeout(() => this.closeModal(), 1000); // auto close modal after 1s
    });
  }

  render() {
    const { showModal } = this.props;
    const { error, success, isLoading } = this.state;

    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel="Modal"
      >
        <div className="modal_block_general change-pw-modal">
          <div className="modal__header">
            <div className="modal__header--title">Change Password</div>
            <div className="modal__header--close" onClick={this.closeModal} role="presentation">x</div>
          </div>
          <div className="modal__body">
            <div className="modal__body--content">
              {
                success
                  ? (
                    <div className="form-status--success">
                      {success}
                    </div>
                  )
                  : null
              }
              <div className="form form--upgrade">
                <div className="form__group">
                  <label htmlFor="oldPassword">Old password:</label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="cardholder-name"
                    className="field is-empty form__group__text"
                    placeholder="Old passowrd"
                    onChange={(e) => { this.handlePasswordChange('oldPassword', e.target.value); }}
                  />
                  <span className="form-status--error">{error.oldPassword || ''}</span>
                </div>
                <div className="form__group">
                  <label htmlFor="newPassword">New password:</label>
                  <input
                    className="field is-empty form__group__text"
                    type="password"
                    id="newPassword"
                    placeholder="New password"
                    onChange={(e) => { this.handlePasswordChange('newPassword', e.target.value); }}
                  />
                  <span className="form-status--error">{error.newPassword || ''}</span>
                </div>
                <div className="form__group">
                  <label htmlFor="confirmPassword">Confirm new password:</label>
                  <input
                    className="field is-empty form__group__text"
                    type="password"
                    placeholder="Confirm new password"
                    onChange={(e) => { this.handlePasswordChange('confirmNewPassword', e.target.value); }}
                  />
                  <span className="form-status--error">{error.confirmNewPassword || ' '}</span>
                </div>
                <div className="btn--group">
                  <button className="btn btn-info" onClick={this.changePassword} type="button">
                    {
                      isLoading
                        ? (
                          <LoadingIcon
                            width="148px"
                          />
                        )
                        : 'Change password'
                    }
                  </button>
                  <button className="btn btn-default" onClick={this.closeModal} type="button">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
