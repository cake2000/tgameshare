import React from 'react';
import _get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import Avatar from '../../../core/components/Avatar.jsx';
import UserProfileModal from '../../containers/UserProfileModal.js';

class PlayerInfo extends React.Component {
  state = {
    isOpenUserProfileModal: false
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  toggleUserProfileModal(isOpenUserProfileModal = true) {
    this.setState({ isOpenUserProfileModal });
  }

  openUserProfileModal = () => {
    this.toggleUserProfileModal(true);
  }

  closeUserProfileModal = () => {
    this.toggleUserProfileModal(false);
  }

  render() {
    const { isOpenUserProfileModal } = this.state;
    const user = Meteor.user();
    const url = _get(user, 'avatar.url');
    const profile = _get(user, 'profile');
    const shouldUpdateProfile = Boolean(
      !profile
      || !_get(user, 'username')
      || !_get(profile, 'firstName')
      || !_get(profile, 'lastName')
      || !_get(profile, 'gender')
      || !_get(profile, 'zipcode')
      || !_get(profile, 'grade')
      || !_get(user, 'emails[0].address')
    );

    return user ? (
      <div className="player-info">
        <div className="player-info__wrapper">
          <Avatar url={url} />
          <span className="player-info__username">{user.username}</span>
          <a className="update-info-button" role="presentation" onClick={this.openUserProfileModal}>Update Profile</a>
          {shouldUpdateProfile && (
          <span className="player-info__warning">
            <i className="fa fa-exclamation-triangle" />
            Your profile is not complete!
          </span>
          )}

          <UserProfileModal
            isOpen={isOpenUserProfileModal}
            closeModal={this.closeUserProfileModal}
          />
        </div>
      </div>
    ) : null;
  }
}

export default PlayerInfo;
