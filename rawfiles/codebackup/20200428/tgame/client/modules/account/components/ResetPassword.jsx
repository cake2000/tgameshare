/* global WOW */
import React from 'react';
import PropTypes from 'prop-types';
import { PASSWORD_INVAILD } from '../../../configs/contants';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

class ResetPassword extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    success: PropTypes.bool,
    updatePassword: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    error: '',
    success: false
  }

  constructor(props) {
    super(props);
    this.state = {
      submitError: {},
      isLoading: false
    };
  }

  componentDidMount() {
    new WOW().init(); // Wow is animation package for login form
  }

  componentDidUpdate(prevProps) {
    if (prevProps.success !== this.props.success && this.props.success === true) {
      this.props.history.push('/signin');
    }
  }

  validateForm = (dataForm) => {
    const { password } = dataForm;
    const submitError = {};

    if (password.length < 6) {
      submitError.password = PASSWORD_INVAILD;
    }

    this.setState({ submitError });
    return submitError;
  }

  updatePassword = () => {
    const { updatePassword, match: { params: { token } } } = this.props;
    const password = this.password.value;
    if (JSON.stringify(this.validateForm({ password })) !== '{}') {
      return false;
    }
    this.setState({ isLoading: true });
    return updatePassword(password, token, () => this.setState({ isLoading: false }));
  }

  render() {
    const { isLoading } = this.state;

    return (
      <div className="tg-page tg-page--signup">
        <div className="tg-page__content tg-container tg-page__content--signup">
          <div className="form form--signup">
            <h4 className="form__title">Reset Password</h4>
            <div className="form__block">
              <div className="form__group form__group--textbox">
                <span
                  className="form__group__title"
                  htmlFor="email-address"
                >
                  Submit your new password
                </span>
                <div className="form__group__control">
                  <input type="password" className="input" ref={(element) => { this.password = element; }} />
                </div>
                {
                  this.state.submitError.password
                    ? <span htmlFor=" " className="form__group__error validate-error">{this.state.submitError.password}</span>
                    : null
                }
              </div>
              {
                this.props.error
                  ? <span htmlFor=" " className="form__group__error validate-server-error">{this.props.error}</span>
                  : null
              }

            </div>
            <div className="form__group form__group--action">
              {
                  this.props.success
                    ? (
                      <span className="reset-password-reuslt">
                        <span>A reset password link have been sent to your email address.</span>
                        <button className="button button--submit">Resend</button>
                      </span>
                    )
                    : (
                      <button className="button button--submit" type="button" onClick={this.updatePassword}>
                        {
                        isLoading
                          ? <LoadingIcon />
                          : 'Submit'
                      }
                      </button>
                    )
                }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
