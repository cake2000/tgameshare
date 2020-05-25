import React, { Component } from 'react';
import Modal from 'react-modal';
import Avatar from '../../../core/components/Avatar';
import FormEditBasicInfo from '../../../account/components/FormEditBasicInfo';
import ChangeAccountPasswordModal from '../../../account/containers/ChangeAccountPasswordModal';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '540px',
    padding: 0,
    border: 'none',
    borderRadius: 20,
    width: '100%',
    margin: '0 auto'
  }
};

class UserProfileModal extends Component {
  state = {
    editBasicForm: false,
    showChangePasswordModal: false,
    isLoading: false,
    error: null
  }

  toggleEditForm = (editBasicForm = true) => {
    this.setState({ editBasicForm });
  }

  openEditForm = () => {
    this.toggleEditForm(true);
  }

  closeEditForm = () => {
    this.toggleEditForm(false);
  }

  toggleChangePasswordModal = (showChangePasswordModal = true) => {
    this.setState({ showChangePasswordModal });
  }

  openChangePasswordModal = () => {
    this.toggleChangePasswordModal(true);
  }

  closeChangePasswordModal = () => {
    this.toggleChangePasswordModal(false);
  }

  checkImageFile(file) {
    if (file && file.type && file.type.split('/')[0] === 'image') {
      return true;
    }
    this.setState({ error: 'Please select an image file' });

    return false;
  }

  checkFileSize(file) {
    const maximumFileSize = 1024 * 1024 * 5; // 5 MB
    if (file.size > maximumFileSize || file.fileSize > maximumFileSize) {
      this.setState({ error: 'File size must less than 5 MB' });

      return false;
    }

    return true;
  }

  uploadAvatar(e) {
    if (e && _.isFunction(e.preventDefault)) {
      e.preventDefault();
    }
    const { uploadUserAvatarAction } = this.props;

    if (e.target && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      this.setState({ isLoading: true, error: null });
      if (this.checkImageFile(file) && this.checkFileSize(file)) {
        if (_.isFunction(uploadUserAvatarAction)) {
          uploadUserAvatarAction(file, (error) => {
            if (error) {
              console.error(error);
              this.setState({ isLoading: false, error: 'Error! Please try again later' });
            } else {
              this.setState({ isLoading: false, error: null });
            }
          });
        } else {
          this.setState({ isLoading: false, error: 'Cannot upload avatar' });
        }
      } else {
        this.setState({ isLoading: false });
      }
    }
  }

  closeModal = () => {
    const { closeModal } = this.props;
    closeModal();
  }

  render() {
    const {
      userData, userError, updateUserAction, updateUserProfileAction, isOpen
    } = this.props;
    const {
      editBasicForm, error, showChangePasswordModal, isLoading
    } = this.state;

    return (
      <Modal
        style={StyleModal}
        isOpen={!!isOpen}
        contentLabel="Modal"
      >
        { isLoading && <div>User Profile is Loading...</div>}
        { error && <span className="error-msg">{error}</span>}
        <div className="updateProfile form form--updateProfile">
          <h4 className="form__title">Basic Info</h4>
          <div className="updateProfile__avatar">
            <div className="updateProfile__avatar_img">
              <Avatar />
              <label htmlFor="personal-profile-image-upload-input">
                <span className="file-upload-button">Update Avatar</span>
                <input type="file" name="image-upload" id="personal-profile-image-upload-input" onChange={e => this.uploadAvatar(e)} />
              </label>
              {error && <span className="upload-error">{error}</span>}
            </div>
          </div>
          <div className="form__group__error validate-error validate-hidden">
            {error && <span className="upload-error">{error}</span>}
          </div>


          <FormEditBasicInfo
            closeForm={this.closeModal}
            editBasicForm={editBasicForm}
            userData={userData}
            userError={userError}
            updateUserAction={updateUserAction}
            updateUserProfileAction={updateUserProfileAction}
          />
        </div>

        <ChangeAccountPasswordModal
          userData={userData}
          showModal={showChangePasswordModal}
          closeChangePasswordModal={this.closeChangePasswordModal}
        />
      </Modal>
    );
  }
}

export default UserProfileModal;
