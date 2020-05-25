import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { generateToken } from '../../../../lib/util';

class Referral extends Component {
  state = {
    error: null,
    isLoading: false,
    success: false,
    showNotification: false
  };

  toggleNotification = () => {
    this.setState(previous => ({ showNotification: !previous.showNotification }));
  };

  submitContact = (e) => {
    e.preventDefault();

    if (this.name.value.trim().length === 0) {
      return this.setState({ error: 'Name is required' });
    }
    if (this.email.value.trim().length === 0) {
      return this.setState({ error: 'Email is required' });
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.email.value.trim())) {
      return this.setState({ error: 'Email is invalid' });
    }
    this.setState({ isLoading: true, error: null, success: false });
    return Meteor.call('sendFriendEmail', this.email.value.trim(), this.name.value.trim(), generateToken(this.email.value), (err) => {
      this.setState({ isLoading: false });
      if (err) {
        return this.setState({ error: err.reason });
      }
      return this.setState({ success: true, showNotification: true });
    });
  };

  render() {
    const {
      error, isLoading, success, showNotification
    } = this.state;

    return (
      <div className="tg-page tg-page--general tg-page--playerHome account-plans">
        <div className="gamesboard__wrapper tg-tutorial__container">
          <div className="tg-page__container__wrapper">
            <div className="upgrade-account referral">
              <div className="modal__body">
                <div className="referral-container">
                  <div className="referral-logo">
                    <img src="/images/referral_friends.jpg" alt="" />
                  </div>
                  <h1 className="referral-title">Invite A Friend</h1>
                  <div className="referral-content">
                    If you think a friend of yours might also like to play and learn on our platform, please use the form below
                    to send an invitation to him/her.
                    <br />
                    <br />
                    He/she can sign up for a free account and try it out. If he/she decides to upgrade to a premium account, both
                    you and he/she will get one month of premium membership for
                    <span className="free"> FREE</span>
                    !
                  </div>
                  <div className="referral-form">
                    <form onSubmit={this.submitContact} className="referral-form__container">
                      <div className="referral-form__block">
                        <div className="referral-form__block--item">
                          <label htmlFor="Name">
                            Name:
                          </label>
                          <input
                            ref={(element) => { this.name = element; }}
                            data-name="Name"
                            id="Name"
                            name="name"
                            placeholder="Enter name"
                            type="text"
                            className="referral-email"
                          />
                        </div>
                        <div className="referral-form__block--item">
                          <label htmlFor="Email">
                            Email:
                          </label>
                          <input
                            ref={(element) => { this.email = element; }}
                            data-name="Email"
                            id="Email"
                            name="Email"
                            placeholder="Enter email"
                            type="text"
                            className="referral-email"
                          />
                        </div>
                      </div>
                      {
                        error && (
                          <div className="referral-error">
                            <span>{error}</span>
                          </div>
                        )
                      }
                      <div className="referral-submit">
                        <button type="submit">
                          Send Invitation
                        </button>
                      </div>
                    </form>
                    {
                      success && showNotification && (
                        <div className="referral-success">
                          <span>{`An email has been sen to ${this.email.value}. Thank You!`}</span>
                          <button type="button" onClick={this.toggleNotification} value="Dismiss">OK</button>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Referral.propTypes = {};

export default Referral;
