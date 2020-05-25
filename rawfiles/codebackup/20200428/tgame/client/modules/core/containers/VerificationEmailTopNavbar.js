/* global Roles */
import React from 'react';
import swal from "sweetalert";
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

class VerificationEmailTopNavbar extends React.Component {
  state = {
    isLoading: false,
    error: null
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  resendVerify = () => {
    const { resendVerifyEmail } = this.props;
    const userId = Meteor.userId();

    this.setState({ isLoading: true, error: null });
    if (userId) {
      resendVerifyEmail(userId, (err) => {
        this.setState({ isLoading: false, error: err && err.reason ? err.reason : null });
        swal(
          "We've resent the verification email. Thank you.",
          {
            icon: "success"
          }
        );
      });
    }
  };

  render() {
    const { isLoading } = this.state;
    return (
      Meteor.user() && Meteor.user().emails[0].verified === false
        && (
        <div className={["verification-email", isLoading ? 'verification-email__loading' : ''].join(' ')} onClick={this.resendVerify} role="presentation">
          <span className="verification-email__text">
            Please verify your email. Click here to have the verification email resent.
          </span>
        </div>
        )
    );
  }
}

export const composer = ({ Meteor, generalModalInfo }, onData) => {
  if (Roles.subscription.ready() && Meteor.subscribe('usersGetUserData').ready()) {
    const currentUser = Meteor.user();
    onData(null, { currentUser, generalModalInfo });
  }
};

export const depsMapper = (context, actions) => {
  const { Meteor } = context;
  return ({
    resendVerifyEmail: actions.verifyEmail.resendVerifyEmail,
    Meteor
  });
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(VerificationEmailTopNavbar);
