/* global WOW */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { EMAIL_INVAILD, PASSWORD_REQUIRED, EMAIL_PATT } from '../../../configs/contants';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import AgeConfirm from './AgeConfirm.jsx';
import { setGAUserIDAndType } from '../../../lib/GA';

class SignIn extends React.Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    error: PropTypes.string
  }

  static defaultProps = {
    error: ''
  }

  constructor(props) {
    super(props);
    this.state = {
      submitError: {},
      isLoggingIn: false,
      showAgeConfirm: false
    };
    this.submitForm = this.submitForm.bind(this);
  }

  componentDidMount() {
    new WOW().init(); // Wow is animation package for login form
    document.addEventListener('keypress', this.handleKeypressEvent);
    this.intervalId = setInterval(() => {
      const { history } = this.props;

      if (Meteor.userId()) {
        history.push('/player');
      }
    }, 100);
  }

  componentWillUnmount() {
    document.removeEventListener('keypress', this.handleKeypressEvent);
    clearInterval(this.intervalId);
  }

  handleKeypressEvent = (event) => {
    if (event.charCode === 13) {
      this.submitForm();
    }
  }

  validateForm = (dataForm) => {
    const { email, password } = dataForm;
    const submitError = {};

    if (!EMAIL_PATT.test(email)) {
      submitError.email = EMAIL_INVAILD;
    }
    if (!password || password === '') {
      submitError.password = PASSWORD_REQUIRED;
    }

    this.setState({ submitError });
    return submitError;
  }

  submitForm = () => {
    const { history } = this.props;
    const email = this.email.value;
    const password = this.password.value;

    if (JSON.stringify(this.validateForm({ email, password })) !== '{}') {
      return false;
    }

    const { login } = this.props;
    this.setState({ submitError: {}, isLoggingIn: true });
    return login(email, password, this.props.history, () => {
      this.setState({ isLoggingIn: false });
    });
  }

  loginWithFacebook = (e) => {
    const { history } = this.props;
    e.preventDefault();
    Meteor.loginWithFacebook({ requestPermissions: ['public_profile', 'email'] }, (err) => {
      if (err) {
        console.log('Facebook login error', err);
      }
      console.log('Facebook login');
      Meteor.logoutOtherClients();
      history.push('/');

      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();
    });
  }

  loginWithGoogle = (e) => {
    const { history } = this.props;
    e.preventDefault();
    Meteor.loginWithGoogle({}, (err) => {
      if (err) {
        console.log('Google login error', err);
      }
      console.log('Google login');
      Meteor.logoutOtherClients();
      history.push('/');

      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();
    });
  }

  loginWithTwitter = (e) => {
    const { history } = this.props;
    e.preventDefault();
    Meteor.loginWithTwitter({}, (err) => {
      if (err) {
        console.log('Twitter login error', err);
      }
      console.log('Twitter login');
      Meteor.logoutOtherClients();
      history.push('/');

      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();
    });
  }

  render() {
    const { isLoggingIn } = this.state;
    const { history } = this.props;

    return (
      <div className="tg-page tg-page--signin">
        {/* <Banner title="Sign In" /> */}
        <div className="tg-page__content tg-page__content--signin tg-container">
          {/* animation wow zoomIn */}
          <div className="form form--signup">
            <h2 className="form__title">Welcome!</h2>
            <div className="form__block">
              <div className="form__group form__group--textbox">
                <span className="form__group__title" htmlFor="email-address">Email Address </span>
                <div className="form__group__control">
                  <input type="text" className="input signin-email" ref={(element) => { this.email = element; }} />
                </div>
                {
                  this.state.submitError.email
                    ? <span htmlFor=" " className="form__group__error validate-error">{this.state.submitError.email}</span>
                    : <span htmlFor=" " className="form__group__error validate-error validate-hidden">Error hidden</span>
                }
              </div>
              <div className="form__group form__group--textbox">
                <span className="form__group__title" htmlFor="password">Password </span>
                <div className="form__group__control">
                  <input type="password" className="input signin-password" ref={(element) => { this.password = element; }} />
                </div>
                {
                  this.state.submitError.password ? <span htmlFor=" " className="form__group__error validate-error">{this.state.submitError.password}</span>
                    : <span htmlFor=" " className="form__group__error validate-error validate-hidden">Error hidden</span>
                }
                {
                  this.props.error
                    ? <span htmlFor=" " className="form__group__error validate-server-error">{this.props.error}</span>
                    : <span htmlFor=" " className="form__group__error validate-server-error validate-hidden">Error hidden</span>
                }
              </div>
              <div className="form__group form__group--link">
                <div onClick={() => history.push('/signup')} className="link link--login" role="presentation">
                  Sign Up
                </div>
                <Link to="/forgot-password" className="link link--forgotPassword">Forgot Password</Link>
              </div>
            </div>
            <div className="form__group form__group--action">
              <button
                className="button button--submit signin-submit"
                type="button"
                onClick={this.submitForm}
                disabled={isLoggingIn}
              >
                {
                  isLoggingIn
                    ? <LoadingIcon />
                    : null
                }
                {
                  !isLoggingIn
                    ? 'Log In'
                    : null
                }
              </button>

            </div>
            <div className="form__group--social">
              <span className="form__group__line">or</span>
              <button
                className="button button--facebook"
                type="button"
                onClick={this.loginWithFacebook}
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 216 216"
                    color="#ffffff"
                    className="social-icon"
                  >
                    <path
                      fill="#ffffff"
                      d="
                      M204.1 0H11.9C5.3 0 0 5.3 0 11.9v192.2c0 6.6 5.3 11.9 11.9
                      11.9h103.5v-83.6H87.2V99.8h28.1v-24c0-27.9 17-43.1 41.9-43.1
                      11.9 0 22.2.9 25.2 1.3v29.2h-17.3c-13.5 0-16.2 6.4-16.2
                      15.9v20.8h32.3l-4.2 32.6h-28V216h55c6.6 0 11.9-5.3
                      11.9-11.9V11.9C216 5.3 210.7 0 204.1 0z"
                    />
                  </svg>
                </span>
                Login with Facebook
              </button>
              <button
                className="button button--twitter"
                type="button"
                onClick={this.loginWithTwitter}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300.00006 244.18703" height="244.19" width="300" version="1.1" className="social-icon">
                  <g transform="translate(-539.18 -568.86)">
                    <path d="m633.9 812.04c112.46 0 173.96-93.168 173.96-173.96 0-2.6463-0.0539-5.2806-0.1726-7.903 11.938-8.6302 22.314-19.4 30.498-31.66-10.955 4.8694-22.744 8.1474-35.111 9.6255 12.623-7.5693 22.314-19.543 26.886-33.817-11.813 7.0031-24.895 12.093-38.824 14.841-11.157-11.884-27.041-19.317-44.629-19.317-33.764 0-61.144 27.381-61.144 61.132 0 4.7978 0.5364 9.4646 1.5854 13.941-50.815-2.5569-95.874-26.886-126.03-63.88-5.2508 9.0354-8.2785 19.531-8.2785 30.73 0 21.212 10.794 39.938 27.208 50.893-10.031-0.30992-19.454-3.0635-27.69-7.6468-0.009 0.25652-0.009 0.50661-0.009 0.78077 0 29.61 21.075 54.332 49.051 59.934-5.1376 1.4006-10.543 2.1516-16.122 2.1516-3.9336 0-7.766-0.38716-11.491-1.1026 7.7838 24.293 30.355 41.971 57.115 42.465-20.926 16.402-47.287 26.171-75.937 26.171-4.929 0-9.7983-0.28036-14.584-0.84634 27.059 17.344 59.189 27.464 93.722 27.464" fill="#fff" />
                  </g>
                </svg>
                Login with Twitter
              </button>
              <button
                className="button button--google"
                type="button"
                onClick={this.loginWithGoogle}
              >
                <span>
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18px"
                    height="18px"
                    viewBox="0 0 48 48"
                    className="social-icon"
                  >
                    <g>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </g>
                  </svg>
                </span>
                Login with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignIn;
