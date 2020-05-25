/* global WOW */
import React from 'react';
import PropTypes from 'prop-types';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

class ResendVerification extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    userId: PropTypes.string.isRequired,
    success: PropTypes.bool,
    resendVerifyEmail: PropTypes.func.isRequired
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

  resendVerify = () => {
    const { resendVerifyEmail, userId } = this.props;
    if (userId) {
      this.setState({ isResend: true });
      resendVerifyEmail(userId);
    }
  }

  render() {
    const { isLoading } = this.state;

    return (
      <div className="tg-page tg-page--forgotpassword">
        <div className="tg-page__content tg-container tg-page__content--forgotpassword">

          <div className="form form--signup">
            <h4 className="form__title">Please Verify Your Email</h4>
            <div className="form__block">
              <div className="form__group form__group--textbox">
                <span className="form__group__desc" htmlFor="email-address">
                  <p>Please check for our email titled "[TuringGame] Please verify your email" and click the verification link in there.</p>
                  <br />
                  <p> If you can't find the email (not even in spam or promotion box), click button below to have the verification email resent to you.</p>
                </span>
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
                      <span>A verification email has been sent to your email address.</span>
                      <button onClick={this.resendVerify} className="button button--submit" type="button">
                        {isLoading
                          ? <LoadingIcon />
                          : 'Resend Verification Email'
                        }
                      </button>
                    </span>
                  )
                  : (
                    <button className="button button--submit" type="button" onClick={this.resendVerify}>
                      {isLoading
                        ? <LoadingIcon />
                        : 'Resend Verification Email'
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

export default ResendVerification;
