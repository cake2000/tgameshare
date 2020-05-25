/* global WOW */
import React from 'react';
import PropTypes from 'prop-types';
import swal from "sweetalert";
import 'react-select/dist/react-select.css';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import {
  MESSAGES
} from '../../../../lib/const.js';
import { ROLES, SIGN_UP_TYPES, TRACK_USER_FROM_CHANNELS } from '../../../../lib/enum';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { get100Years, getDaysInMonth } from '../../../../lib/util';
import { setGAUserIDAndType } from '../../../lib/GA';
import { getDataFromToken } from '../../../../lib/util';

const errorMessages = MESSAGES().SIGNUP_FORM.ERRORS;

const yearList = get100Years();
const dayList = getDaysInMonth();

class SignUp extends React.Component {
  static propTypes = {
    createUser: PropTypes.func.isRequired,
    error: PropTypes.string,
    success: PropTypes.bool,
    isSubmit: PropTypes.bool,
    isResend: PropTypes.bool,
    resendVerifyEmail: PropTypes.func.isRequired,
    userId: PropTypes.string,
    match: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isWidget: PropTypes.bool,
    login: PropTypes.func.isRequired,
    joinRoomByInviteEmail: PropTypes.func.isRequired,
    token: PropTypes.string
  };

  static defaultProps = {
    error: '',
    success: false,
    userId: null,
    match: {},
    isSubmit: false,
    isResend: false,
    isWidget: false,
    token: null
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      acceptTerms: false,
      accountType: ROLES.AI,
      submitError: {},
      channel: TRACK_USER_FROM_CHANNELS[0].value,
      selectedType: SIGN_UP_TYPES[0],
      year: null,
      month: null,
      day: null,
      loginWith: null,
      isSending: false,
      sendingSuccess: null,
      sendingError: null,
      schools: [],
      selectedSchool: null,
      phone: null,
      address: null,
      city: null,
      state: null,
      zipcode: null,
      referralUser: null
    };
    this.submitForm = this.submitForm.bind(this);
    this.resendVerify = this.resendVerify.bind(this);
  }

  componentDidMount() {
    new WOW().init(); // Wow is animation package for login form
    const { match: { params }, token } = this.props;

    if (token) {
      const data = getDataFromToken(token);

      if (data) {
        const { userId, error, email } = data;

        if (error) {
          swal({
            title: error,
            text: '',
            icon: 'warning',
            buttons: {
              confirm: {
                text: 'OK',
                value: true,
                visible: true,
                className: "",
                closeModal: true
              }
            },
            dangerMode: true
          });
        } else {
          this.setState({ referralUser: userId, email });
        }
      }
    }
    if (params && params.type) {
      this.setState({ accountType: params.type });
    }
    Meteor.call('getSchools', '', null, (err, res) => {
      if (!err) {
        this.setState({ schools: res });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { loading } = this.props;

    if (loading && !nextProps.loading && nextProps.checkParentEmail) {
      this.handleInput('email', { target: { value: nextProps.query.parentEmail } });
      this.handleSelectButton('email')();
      this.handleSelectType(SIGN_UP_TYPES.find(type => type.name === ROLES.STUDENT));
    }
  }

  componentDidUpdate(prevProps) {
    const {
      success, checkParentEmail, query, login, joinRoomByInviteEmail, history
    } = this.props;
    if (checkParentEmail && !prevProps.success && success && query.gameRoomId) {
      const { email, password } = this.state;
      login(email, password, history, () => {
        joinRoomByInviteEmail(query.gameRoomId, history);
      });
    }
  }

  handleInput = (type, e) => {
    const { value } = e.target;

    if (type === 'acceptTerms') {
      this.setState({ acceptTerms: e.target.checked }, () => {
        this.validateForm('acceptTerms');
      });
    } else {
      this.setState({ [type]: value });
    }
  };

  handleSelectChange = (e) => {
    this.setState({
      channel: e.target.value
    });
  };

  validateForm = (type) => {
    const {
      username,
      email, password,
      confirmPassword,
      firstName,
      lastName,
      submitError,
      acceptTerms,
      selectedSchool,
      selectedType,
      loginWith
    } = this.state;
    let errCount = 0;

    if (loginWith === 'email') {
      // Validate  username
      if (!type || type === 'username') {
        if (!username || username.trim() === '') {
          submitError.username = errorMessages.USERNAME_REQUIRED;
          errCount += 1;
        } else if (username.trim()
          .indexOf(' ') > -1) {
          submitError.username = errorMessages.USERNAME_NO_SPACE;
          errCount += 1;
        } else if (username.trim().length > 15) {
          submitError.username = errorMessages.USERNAME_IS_TOO_LONG;
          errCount += 1;
        } else {
          submitError.username = '';
        }
        if (type) {
          this.setState({ submitError });
          return errCount;
        }
      }

      // Validate  email
      if (!type || type === 'email') {
        if (!errorMessages.EMAIL_PATT.test(email.trim())) {
          submitError.email = errorMessages.EMAIL_INVAILD;
          errCount += 1;
        } else {
          submitError.email = '';
        }
        if (type) {
          this.setState({ submitError });
          return errCount;
        }
      }
      // Validate password
      if (!type || type === 'password') {
        if (!password || password === '') {
          submitError.password = errorMessages.PASSWORD_REQUIRED;
          errCount += 1;
        } else if (password.length <= 7) {
          submitError.password = errorMessages.PASSWORD_INVAILD;
          errCount += 1;
        } else {
          submitError.password = '';
        }
        if (type) {
          this.setState({ submitError });
          return errCount;
        }
      }
      // Validate confirm password
      if (!type || type === 'confirmPassword') {
        if (password !== confirmPassword) {
          submitError.confirmPassword = errorMessages.PASSWORD_NOT_MATCH;
          errCount += 1;
        } else {
          submitError.confirmPassword = '';
        }
        if (type) {
          this.setState({ submitError });
          return errCount;
        }
      }
      // Validate accept terms
      if (!type || type === 'acceptTerms') {
        if (acceptTerms === false) {
          errCount += 1;
          submitError.acceptTerms = errorMessages.TERM_ACCEPT_REQUIRED;
        } else {
          submitError.acceptTerms = '';
        }
        if (type) {
          this.setState({ submitError });
          return errCount;
        }
      }
    }
    // Validate account type
    // if (selectedType.name === ROLES.TEACHER && (!type || type === 'firstName')) {
    //   if (!firstName || firstName.trim().length === 0) {
    //     submitError.firstName = errorMessages.FIRST_NAME_REQUIRED;
    //     errCount += 1;
    //     this.setState({ submitError });
    //     return errCount;
    //   }
    // }
    //
    // if (selectedType.name === ROLES.TEACHER && (!type || type === 'lastName')) {
    //   if (!lastName || lastName.trim().length === 0) {
    //     submitError.lastName = errorMessages.LAST_NAME_REQUIRED;
    //     errCount += 1;
    //     this.setState({ submitError });
    //     return errCount;
    //   }
    // }
    //
    // if (!type) {
    //   if (selectedType.name === ROLES.TEACHER && !selectedSchool) {
    //     submitError.school = errorMessages.SCHOOL_REQUIRED;
    //     errCount += 1;
    //     this.setState({ submitError });
    //     return errCount;
    //   }
    // }

    this.setState({ submitError });
    return errCount;
  };

  resendVerify() {
    const { resendVerifyEmail, userId } = this.props;
    if (userId) {
      resendVerifyEmail(userId);
    }
  }

  submitForm() {
    const {
      username, email, password, accountType, channel, selectedType,
      firstName, lastName, selectedSchool, day, month, year,
      phone, address, city, state, zipcode, referralUser
    } = this.state;

    if (this.validateForm() > 0) {
      return false;
    }

    const {
      createUser, query, history, login
    } = this.props;
    const profile = selectedType.name !== ROLES.TEACHER ? {
      dateOfBirth: `${month} ${day} ${year}`
    } : {};

    // if (selectedType.name === ROLES.TEACHER) {
    //   profile = {
    //     firstName,
    //     lastName,
    //     schoolName: selectedSchool,
    //     phone,
    //     address,
    //     city,
    //     state,
    //     zipcode
    //   };
    // }
    createUser({
      username,
      email,
      password,
      accountType,
      channel,
      type: selectedType.name,
      referralUser,
      parentInfo: query,
      profile
    }, history, (error, result) => {
      if (!error) {
        if (result.isVerified) {
          login(email, password, history);
        }
      }
    });
    return true;
  }

  handleSendParentEmail = () => {
    const submitError = {};

    if (!errorMessages.EMAIL_PATT.test(this.parentEmail.value.trim())) {
      submitError.email = errorMessages.EMAIL_INVAILD;
      this.setState({ submitError });
      return;
    }
    const { sendParentEmail } = this.props;
    const { day, month, year } = this.state;
    const dateOfBirth = `${month} ${day} ${year}`;

    this.setState({ isSending: true });
    sendParentEmail(this.parentEmail.value, dateOfBirth, (error) => {
      if (!error) {
        this.setState({ sendingSuccess: true });
      } else {
        this.setState({
          sendingError: error.reason
        });
      }
      this.setState({
        isSending: false
      });
    });
  };

  handleSelectType = type => () => {
    this.setState({ selectedType: type, sendingError: null, sendingSuccess: null });
  };

  handleChangeBirthDay = type => (e) => {
    this.setState({ [type]: e.target.value });
  };

  renderSocialButton = () => {
    const {
      schools, selectedSchool, selectedType, submitError
    } = this.state;

    return [
      selectedType.name === ROLES.TEACHER && (
        <div style={{color: '#105707', marginBottom: "15px"}} className="form__group__error validate-error teacher-warning">
          After you sign up, please go to the 'Class' page to add school details for approval.
        </div>
      ),
      // selectedType.name === ROLES.TEACHER && (
      //   <div className="form__group form__group--container" key="user-name">
      //     <div className="form__group form__group--textbox">
      //       <span className="form__group__title">First Name</span>
      //       <div className="form__group__control form__group__control--nameGroup">
      //         <input
      //           type="text"
      //           className="input input--userId"
      //           onChange={(e) => { this.handleInput('firstName', e); }}
      //           onBlur={() => { this.validateForm('firstName'); }}
      //         />
      //       </div>
      //       {
      //         submitError.firstName
      //           ? <span className="form__group__error validate-error">{submitError.firstName}</span>
      //           : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
      //       }
      //     </div>
      //     <div className="form__group form__group--textbox">
      //       <span className="form__group__title">Last Name</span>
      //       <div className="form__group__control form__group__control--nameGroup">
      //         <input
      //           type="text"
      //           className="input input--userId"
      //           onChange={(e) => { this.handleInput('lastName', e); }}
      //           onBlur={() => { this.validateForm('lastName'); }}
      //         />
      //       </div>
      //       {
      //         submitError.lastName
      //           ? <span className="form__group__error validate-error">{submitError.lastName}</span>
      //           : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
      //       }
      //     </div>
      //   </div>
      // ),
      // selectedType.name === ROLES.TEACHER && (
      //   <div className="form__group form__group--textbox" key="school">
      //     <span className="form__group__title">School</span>
      //     <div className="form__group__control">
      //       <Select
      //         searchable
      //         placeholder="School"
      //         onInputChange={this.handleLoadSchools}
      //         labelKey="SchoolName"
      //         valueKey="_id"
      //         options={schools}
      //         value={selectedSchool}
      //         onChange={this.handleSelectSchool}
      //       />
      //     </div>
      //     {
      //       submitError.school
      //         ? <span className="form__group__error validate-error">{submitError.school}</span>
      //         : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
      //     }
      //   </div>
      // ),
      // selectedType.name === ROLES.TEACHER && (
      //   <div className="form__group form__group--container" key="phone-address">
      //     <div className="form__group form__group--textbox">
      //       <span className="form__group__title">Phone Number</span>
      //       <div className="form__group__control">
      //         <input
      //           className="input form__group__text"
      //           type="tel"
      //           placeholder=""
      //           pattern="^(1[ \-\+]{0,3}|\+1[ -\+]{0,3}|\+1|\+)?((\(\+?1-[2-9][0-9]{1,2}\))|(\(\+?[2-8][0-9][0-9]\))|(\(\+?[1-9][0-9]\))|(\(\+?[17]\))|(\([2-9][2-9]\))|([ \-\.]{0,3}[0-9]{2,4}))?([ \-\.][0-9])?([ \-\.]{0,3}[0-9]{2,4}){2,3}$"
      //           title="XXX-XXX-XXXX"
      //           ref={(e) => { this.phone = e; }}
      //         />
      //       </div>
      //       <span className="form__group__error form__group__err" />
      //     </div>
      //     <div className="form__group form__group--textbox" key="zipCode">
      //       <span className="form__group__title">Zip Code</span>
      //       <div className="form__group__control">
      //         <input
      //           className="input form__group__text"
      //           type="text"
      //           placeholder=""
      //           ref={(e) => { this.zipCode = e; }}
      //         />
      //       </div>
      //       <span className="form__group__error form__group__err" />
      //     </div>
      //   </div>
      // ),
      // selectedType.name === ROLES.TEACHER && (
      //   <div className="form__group form__group--container" key="city-state">
      //     <div className="form__group form__group--textbox" key="city">
      //       <span className="form__group__title">City</span>
      //       <div className="form__group__control">
      //         <input
      //           className="input form__group__text"
      //           type="text"
      //           placeholder=""
      //           ref={(e) => { this.city = e; }}
      //         />
      //       </div>
      //       <span className="form__group__error form__group__err" />
      //     </div>
      //     <div className="form__group form__group--textbox" key="state">
      //       <span className="form__group__title">State</span>
      //       <div className="form__group__control">
      //         <input
      //           className="input form__group__text"
      //           type="text"
      //           placeholder=""
      //           ref={(e) => { this.stateData = e; }}
      //         />
      //       </div>
      //       <span className="form__group__error form__group__err" />
      //     </div>
      //   </div>
      // ),
      // selectedType.name === ROLES.TEACHER && (
      //   <div className="form__group form__group--textbox" key="Street address">
      //     <span className="form__group__title">Street Address</span>
      //     <div className="form__group__control">
      //       <input
      //         className="input form__group__text"
      //         type="text"
      //         placeholder=""
      //         required
      //         ref={(e) => { this.address = e; }}
      //       />
      //     </div>
      //     <span className="form__group__error form__group__err" />
      //   </div>
      // ),
      (
        <div className="form__group--social-signup" key="123">
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
            Sign up with Facebook Login
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
            Sign up with Twitter Login
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
            Sign up with Google login
          </button>
          <button
            className="button button--submit"
            type="button"
            onClick={this.handleSelectButton('email')}
          >
            Sign up with your email
          </button>
        </div>
      )
    ];
  };

  renderParentEmail = (age) => {
    const {
      sendingSuccess, selectedType, submitError, sendingError
    } = this.state;

    if (sendingSuccess) {
      return (
        <div className="form__group form__group--textbox">
          <span className="form__group__title">Please ask your parent or guardian to check our invitation email.</span>
        </div>
      );
    }
    return (
      <div className="form__group form__group--textbox">
        {
          (age >= 13 || !selectedType.showAge) && this.renderSocialButton()
        }
        {
          (age && age < 13 && selectedType.showAge) && [
            (
              <span key="form__group__title" className="form__group__title">Parent or Guardian Email (since you are under 13)</span>
            ),
            (
              <div key="form__group__control" className="form__group__control">
                <input
                  type="text"
                  className="input"
                  ref={(element) => { this.parentEmail = element; }}
                />
                {
                  submitError.email && <span className="form__group__error validate-error">{submitError.email}</span>
                }
              </div>
            ),
            sendingError && <span key="sending-error" className="form__group__error validate-error">{sendingError}</span>
          ]
        }
      </div>
    );
  };

  handleSelectButton = name => () => {
    this.setState({
      loginWith: name,
      submitError: {},
      sendingSuccess: null,
      sendingError: null,
      // phone: this.phone ? this.phone.value.trim() : null,
      // address: this.address ? this.address.value.trim() : null,
      // city: this.city ? this.city.value.trim() : null,
      // state: this.stateData ? this.stateData.value.trim() : null,
      // zipcode: this.zipCode ? this.zipCode.value.trim() : null
    });
  };

  handleReturnHomepage = () => {
    const { history } = this.props;

    history.push('/');
  };

  loginWithFacebook = (e) => {
    const { selectedType } = this.state;
    const {
      history, updateUserProfile
    } = this.props;
    // const userData = this.handleReturnUserData();

    // if (!userData) return false;
    e.preventDefault();
    Meteor.loginWithFacebook({ requestPermissions: ['public_profile', 'email'] }, (err) => {
      if (err) {
        console.log('Facebook login error', err);
      }
      console.log('Facebook login');
      // userData._id = Meteor.userId();
      // userData.username = Meteor.user().username;
      // userData.emails = Meteor.user().emails;
      // updateUserProfile(userData, error => console.log(error));
      Meteor.logoutOtherClients();
      if (selectedType.name === ROLES.TEACHER) {
        history.push('/classmanage');
      } else {
        history.push('/');
      }
      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();
    });
    return true;
  };

  loginWithGoogle = (e) => {
    const { selectedType } = this.state;
    const {
      history, updateUserProfile
    } = this.props;
    // const userData = this.handleReturnUserData();

    // if (!userData) return false;
    e.preventDefault();
    Meteor.loginWithGoogle({}, (err) => {
      if (err) {
        console.log('Google login error', err);
      }
      console.log('Google login');
      // userData._id = Meteor.userId();
      // userData.username = Meteor.user().username;
      // userData.emails = Meteor.user().emails;
      // updateUserProfile(userData, error => console.log(error));
      Meteor.logoutOtherClients();
      if (selectedType.name === ROLES.TEACHER) {
        history.push('/classmanage');
      } else {
        history.push('/');
      }

      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();
    });
    return true;
  };

  loginWithTwitter = (e) => {
    const { selectedType } = this.state;
    const {
      history, updateUserProfile
    } = this.props;
    // const userData = this.handleReturnUserData();

    // if (!userData) return false;
    e.preventDefault();
    Meteor.loginWithTwitter({}, (err) => {
      if (err) {
        console.log('Twitter login error', err);
      }
      console.log('Twitter login');
      // userData._id = Meteor.userId();
      // userData.username = Meteor.user().username;
      // userData.emails = Meteor.user().emails;
      // updateUserProfile(userData, error => console.log(error));
      Meteor.logoutOtherClients();
      if (selectedType.name === ROLES.TEACHER) {
        history.push('/classmanage');
      } else {
        history.push('/');
      }

      // Send User ID and Type to Google Analytics session
      setGAUserIDAndType();
    });
    return true;
  };

  handleReturnUserData = () => {
    const {
      selectedType, firstName, lastName, selectedSchool, day, month, year
    } = this.state;
    const userData = {
      type: selectedType.name
    };

    if (this.validateForm() > 0) {
      return null;
    }
    userData.profile = {
      dateOfBirth: `${month} ${day} ${year}`
    };

    if (selectedType.name === ROLES.TEACHER) {
      userData.profile = {
        firstName,
        lastName,
        school: selectedSchool,
        phone: this.phone.value.trim(),
        address: this.address.value.trim(),
        city: this.city.value.trim(),
        state: this.stateData.value.trim(),
        zipcode: this.zipCode.value.trim()
      };
    }
    return userData;
  };

  handleLoadSchools = (value) => {
    if (value.trim().length > 0) {
      Meteor.call('getSchools', value.trim(), (err, res) => {
        if (!err) {
          this.setState({ schools: res });
        }
      });
    }
  };

  handleSelectSchool = (value) => {
    this.setState({ selectedSchool: value._id });
  };

  render() {
    const {
      isSubmit, success, isResend, isWidget, error, loading, checkParentEmail
    } = this.props;
    const {
      channel, selectedType, year, month, day, loginWith, isSending, submitError,
      acceptTerms, email, sendingSuccess
    } = this.state;
    const isLoading = isSubmit ? 'button--submit--loading' : '';
    const channels = TRACK_USER_FROM_CHANNELS;
    let age = null;

    if (loading) {
      return (
        <LoadingPage />
      );
    }
    if (year && month && !day) {
      const dayListBasedOnSelect = moment(`${year}-${month}`, 'YYYY-MMM').daysInMonth();

      if (dayList.length < dayListBasedOnSelect) {
        for (let i = dayList.length + 1; i <= dayListBasedOnSelect; i++) {
          dayList.push(i);
        }
      } else if (dayList.length > dayListBasedOnSelect) {
        for (let i = dayList.length; i > dayListBasedOnSelect; i--) {
          dayList.pop();
        }
      }
    } else if (year && month && day) {
      age = moment().diff(moment(`${year}-${month}-${day}`, 'YYYY-MMM-DD'), 'year');
    }
    return (
      <div className={isWidget === false ? 'tg-page tg-page--signup' : 'tg-page--signup'}>
        {/* <div className="page-notification">
          {`This site is still under development.
           If you are interested in participating a beta test, please sign up and we'll contact you when we are ready for the beta test. Thanks`}
        </div> */}
        <div className="tg-page__content tg-container tg-page__content--signup">
          <div className="tg-page__content--signup__container">
            <div className="tg-page__content--signup__container--element">
              <h3 style={{marginBottom: '20px'}}>
                The world's best gamebot programming lessons.
              </h3>
              <div style={{fontSize: '18px', lineHeight: '24px'}}>
                {selectedType.name === ROLES.TEACHER ? "Join TuringGame to help your students as they learn to program through our online courses and build their own gamebots." : "Join TuringGame to start building your own gamebot, and learn the JavaScript programming language and Artificial Intelligence algorithms at the same time."}
                <br />
                <br />
                By signing up for TuringGame, you agree to our
                <a href="/terms" target="_blank"> Terms of Service </a>
                and
                <a href="/privacy" target="_blank"> Privacy Policy</a>
                .
              </div>
            </div>
            {
              loginWith === 'email' ? (
                <div id="signup-form" className="form form--signup">
                  <h4 className="form__title">Sign Up</h4>
                  <div
                    className="form--signup__back"
                    role="presentation"
                    onClick={this.handleSelectButton()}
                  >
                    <span>
                      <i className="fa fa-angle-left" />
                      Back
                    </span>
                  </div>
                  <div className="form__block">
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title">User Name </span>
                      <div className="form__group__control form__group__control--nameGroup">
                        <input
                          type="text"
                          className="input input--userId"
                          onChange={(e) => { this.handleInput('username', e); }}
                          onBlur={() => { this.validateForm('username'); }}
                        />
                      </div>
                      {
                        submitError.username
                          ? <span className="form__group__error validate-error">{submitError.username}</span>
                          : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
                      }
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title">Email Address </span>
                      <div className="form__group__control">
                        <input
                          type="text"
                          className="input"
                          value={email}
                          readOnly={checkParentEmail}
                          ref={(element) => { this.email = element; }}
                          onChange={(e) => { this.handleInput('email', e); }}
                          onBlur={() => { this.validateForm('email'); }}
                        />
                      </div>
                      {
                        submitError.email
                          ? <span className="form__group__error validate-error">{submitError.email}</span>
                          : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
                      }
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title">Password </span>
                      <div className="form__group__control">
                        <input
                          type="password"
                          className="input"
                          ref={(element) => { this.password = element; }}
                          onChange={(e) => { this.handleInput('password', e); }}
                          onBlur={() => { this.validateForm('password'); }}
                        />
                      </div>
                      {
                        submitError.password
                          ? <span className="form__group__error validate-error">{submitError.password}</span>
                          : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
                      }
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title">Confirm Password </span>
                      <div className="form__group__control">
                        <input
                          type="password"
                          className="input"
                          ref={(element) => { this.confirmPassword = element; }}
                          onChange={(e) => { this.handleInput('confirmPassword', e); }}
                          onBlur={() => { this.validateForm('confirmPassword'); }}
                        />
                      </div>
                      {
                        submitError.confirmPassword
                          ? <span className="form__group__error validate-error">{submitError.confirmPassword}</span>
                          : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
                      }
                    </div>
                    <div className="form__group form__group--select">
                      <span className="form__group__title">
                        How did you find us?
                      </span>
                      <div className="form__group__control form__group__control--select">
                        <select
                          required="required"
                          value={channel}
                          onChange={(e) => { this.handleSelectChange(e); }}
                        >
                          {
                            channels.map(item => (
                              <option
                                value={item.value}
                                key={item.value}
                              >
                                {item.label}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                    <div className="form__group form__group--desc">
                      <input
                        onBlur={() => { this.validateForm('acceptTerms'); }}
                        checked={acceptTerms}
                        id="acceptTerms"
                        className="checkboxCustomize"
                        onChange={(e) => { this.handleInput('acceptTerms', e); }}
                        type="checkbox"
                      />
                      <label className="checkmark" htmlFor="acceptTerms">
                        I accept the site
                        <a href="/terms" target="_blank">Terms of Service</a>
                        and agree to the
                        <a href="/privacy" target="_blank">Privacy Policy</a>
                      </label>
                      {
                        submitError.acceptTerms
                          ? <span className="form__group__error validate-error">{submitError.acceptTerms}</span>
                          : <span className="form__group__error validate-error validate-hidden">Error hidden</span>
                      }
                    </div>
                    {
                      error ? (
                        <div className="form__group form__group--desc">
                          <span className="form__group__error validate-server-error">{error}</span>
                        </div>
                      ) : (
                        <div className="form__group form__group--desc">
                          <span className="form__group__error validate-server-error validate-hidden">Error hidden</span>
                        </div>
                      )
                    }
                    <div className="form__group form__group--loginLink">
                      <p>Already have an account?</p>
                      <Link to="/signin" className="link link--login">Login</Link>
                    </div>
                  </div>
                  <div className="form__group form__group--action">
                    {
                      success && checkParentEmail && <label htmlFor=" ">You can login right now !</label>
                    }
                    {
                      success && !checkParentEmail
                        && <button className="button button--resendVerify" type="button" disabled={isResend} onClick={this.resendVerify}>{isResend ? 'Sent' : 'Resend verify'}</button>
                    }
                    {
                      !success
                      && (
                      <button
                        id="submit-btn"
                        className={`button button--submit ${isLoading}`}
                        disabled={isSubmit}
                        type="button"
                        onClick={this.submitForm}
                      >
                        {
                          isSubmit ? <LoadingIcon /> : 'Sign Up'
                        }
                      </button>
                      )
                    }
                  </div>
                </div>
              ) : (
                <div id="signup-form" className="form form--signup">
                  <h4 className="form__title">Join TuringGame</h4>
                  <div className="form__block prepareForm">
                    <div className="form__group form__group--selectType">
                      {
                        SIGN_UP_TYPES.map(type => (
                          <div
                            key={type.name}
                            className={`form__group--selectType__element ${selectedType.name === type.name && 'selected-type'}`}
                            onClick={this.handleSelectType(type)}
                            role="presentation"
                          >
                            {type.name == "Teacher" ? "Guardian/Teacher" : type.name}
                          </div>
                        ))
                      }
                    </div>
                    {
                      selectedType.showAge && (
                        <div className="form__group form__group--textbox">
                          <span className="form__group__title">Date Of Birth</span>
                          <div className="form__group--dateOfBirth">
                            <div className="form__group__control form__group__control--select">
                              <select
                                onChange={this.handleChangeBirthDay('year')}
                                value={year || 'Year'}
                              >
                                <option disabled>Year</option>
                                {
                                  yearList.map(yearData => (
                                    <option key={yearData}>{yearData}</option>
                                  ))
                                }
                              </select>
                            </div>
                            <div className="form__group__control form__group__control--select">
                              <select
                                onChange={this.handleChangeBirthDay('month')}
                                value={month || 'Month'}
                              >
                                <option disabled>Month</option>
                                {
                                  moment.monthsShort().map(monthData => (
                                    <option key={monthData}>{monthData}</option>
                                  ))
                                }
                              </select>
                            </div>
                            <div className="form__group__control form__group__control--select">
                              <select
                                disabled={!month || !year}
                                onChange={this.handleChangeBirthDay('day')}
                                value={day || 'Day'}
                              >
                                <option disabled>Day</option>
                                {
                                  year && month && dayList.map(dayData => (
                                    <option key={dayData}>{dayData}</option>
                                  ))
                                }
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    {
                      (age || !selectedType.showAge) && this.renderParentEmail(age)
                    }
                    <div className="form__group form__group--loginLink">
                      <p>Already have an account?</p>
                      <Link to="/signin" className="link link--login">Login</Link>
                    </div>
                  </div>
                  {
                    (age && age < 13 && selectedType.showAge) && (
                      <div className="form__group form__group--action">
                        {
                          sendingSuccess ? (
                            <button
                              className="button button--submit signin-submit"
                              type="button"
                              onClick={this.handleReturnHomepage}
                            >
                              Got it
                            </button>
                          ) : (
                            <button
                              className="button button--submit signin-submit"
                              type="button"
                              onClick={this.handleSendParentEmail}
                              disabled={isSending}
                            >
                              {
                                isSending ? <LoadingIcon /> : 'Send'
                              }
                            </button>
                          )
                        }
                      </div>
                    )
                  }
                </div>
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default SignUp;
