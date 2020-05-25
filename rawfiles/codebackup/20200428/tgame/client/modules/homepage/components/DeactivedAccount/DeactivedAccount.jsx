import React, { Component } from 'react';
import moment from 'moment';

class DeactivedAccount extends Component {
  render() {
    const { activeAccount } = this.props;
    const user = Meteor.user();
    const { accountStatus } = user;
    const _activeAccount = () => {
      activeAccount(() => null);
    };


    return (
      <div className="deactivated-section">
        <center><div className="deactivated-heading">Account Is Deactivated</div></center>
        <div className="deactivated-block">
          <div className="deactivated-block__message">
            Your account was deactivated at {' '}
            <span className="deactivated-block__time">
              {moment(accountStatus.modifiedAt).format('MM-DD-YYYY HH:mma')}
            </span>
          </div>
          <div className="deactivated-block__active">
            <a
              aria-hidden
              onClick={_activeAccount}
            >
              Click here to active your account
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default DeactivedAccount;
