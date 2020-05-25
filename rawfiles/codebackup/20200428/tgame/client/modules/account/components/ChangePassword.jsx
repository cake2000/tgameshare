import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { generateToken } from '../../../../lib/util';
import { Accounts, AccountsClient } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';

class ChangePassword extends Component {
  state = {
    error: null,
    isLoading: false,
    success: false,
    showNotification: false
  };

  submitChange = (e) => {
    e.preventDefault();

    // if (this.name.value.trim().length === 0) {
    //   return this.setState({ error: 'Name is required' });
    // }
    // if (this.email.value.trim().length === 0) {
    //   return this.setState({ error: 'Email is required' });
    // }
    // if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(this.email.value.trim())) {
    //   return this.setState({ error: 'Email is invalid' });
    // }
    this.setState({ isLoading: true, error: null, success: false });


    Accounts.changePassword(this.currentpassword.value.trim(), this.newpassword.value.trim(), (err) => {
      if (err) {
        //throw new Meteor.Error(500, err);
        Bert.alert({
          title: 'Error',
          message: `Password change failed: ${err}.`,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });            
      } else {
        Bert.alert({
          title: 'Success',
          message: `Your password has been updated successfully!`,
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-check'
        });    
      }
    });

    // return Meteor.call('doChangePassword', this.currentpassword.value.trim(), this.newpassword.value.trim(), (err) => {
    //   this.setState({ isLoading: false });
    //   if (err) {
    //     return this.setState({ error: err.reason });
    //   }
    //   return this.setState({ success: true, showNotification: true });
    // });
  };

  render() {
    const {
      error, isLoading, success, showNotification
    } = this.state;

    return (
      <div className="tg-page tg-page--general tg-page--playerHome account-plans">
        <div className="gamesboard__wrapper tg-tutorial__container">
          <div className="tg-page__container__wrapper">
            <center>
            <div className="ChangePassword">
              <div className="modal__body">
                <div className="ChangePassword-container">
                  <h1 className="ChangePassword-title">Change your password</h1>
                  <div className="ChangePassword-form">
                    <form onSubmit={this.submitChange.bind(this)} className="ChangePassword-form__container">
                      <div className="ChangePassword-form__block">
                        <br/>
                        <div className="ChangePassword-form__block--item">
                          {/* <label htmlFor="password_current_name">
                            Current password:
                          </label> */}
                          <input
                            ref={(element) => { this.currentpassword = element; }}
                            data-name="Current Password"
                            id="currentpassword"
                            name="name"
                            placeholder="Old password"
                            type="password"
                            className="ChangePassword-currentpassword"
                          />
                        </div>
                        <br/>
                        <div className="ChangePassword-form__block--item">
                          {/* <label htmlFor="newpasswordname">
                            New password:
                          </label> */}
                          <input
                            ref={(element) => { this.newpassword = element; }}
                            data-name="New Password"
                            id="newpassword"
                            name="newpassword"
                            placeholder="New password"
                            type="password"
                            className="ChangePassword-newpassword"
                          />
                        </div>
                        <br/>
                      </div>
                      {
                        error && (
                          <div className="ChangePassword-error">
                            <span>{error}</span>
                          </div>
                        )
                      }
                      <div className="ChangePassword-submit">
                        <button type="submit">
                          Submit
                        </button>
                      </div>
                    </form>
                    {
                      success && showNotification && (
                        <div className="ChangePassword-success">
                          <span>{`Your password has been updated successfully. Thank You!`}</span>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
            </center>
          </div>
        </div>
      </div>
    );
  }
}

ChangePassword.propTypes = {};

export default ChangePassword;
