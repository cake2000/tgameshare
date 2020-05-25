/* global WOW */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Banner from '../../core/components/Banner.jsx';
import { EMAIL_INVAILD, EMAIL_PATT } from '../../../configs/contants';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

class ForgotPassword extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    success: PropTypes.bool,
    resetPassword: PropTypes.func.isRequired
  };

  static defaultProps = {
    error: '',
    success: false
  };

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

  validateForm = (dataForm) => {
    const { email } = dataForm;
    const submitError = {};

    if (!EMAIL_PATT.test(email)) {
      submitError.email = EMAIL_INVAILD;
    }

    this.setState({ submitError });
    return submitError;
  };

  resetPassword = () => {
    const { resetPassword } = this.props;
    const email = this.email.value;

    if (JSON.stringify(this.validateForm({ email })) !== '{}') {
      return false;
    }

    this.setState({ isLoading: true });

    return resetPassword(email, () => this.setState({ isLoading: false }));
  };

  render() {
    const { isLoading } = this.state;

    return (
      <div className="tg-page tg-page--forgotpassword">
        <div className="tg-page__content tg-container tg-page__content--forgotpassword">

          <div className="form form--signup">
            <h4 className="form__title">Forgot Password</h4>
            <div className="form__block">
              <div className="form__group form__group--textbox">
                <span className="form__group__title" htmlFor="email-address">Submit your email address and we’ll send you a link to reset your password. </span>
                <div className="form__group__control">
                  <input type="text" className="input" ref={(element) => { this.email = element; }} />
                </div>
                {
                  this.state.submitError.email
                    ? <span htmlFor=" " className="form__group__error validate-error">{this.state.submitError.email}</span>
                    : <span htmlFor=" " className="form__group__error validate-error validate-hidden">Error hidden</span>
                }
              </div>
              {
                this.props.error
                  ? <span htmlFor=" " className="form__group__error validate-server-error">{this.props.error}</span>
                  : null
              }

              <div className="form__group form__group--link">
                <Link to="signin" className="link link--login">Cancel</Link>
              </div>
            </div>
            <div className="form__group form__group--action">
              {
                this.props.success
                  ? (
                    <span className="reset-password-reuslt">
                      <span>A reset password link have been sent to your email address.</span>
                      <button onClick={this.resetPassword} className="button button--submit">
                        {isLoading ? <LoadingIcon /> : 'Resend'}
                      </button>
                    </span>
                  )
                  : (
                    <button className="button button--submit" type="button" onClick={this.resetPassword}>
                      {isLoading
                        ? <LoadingIcon />
                        : 'Send'
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

export default ForgotPassword;
