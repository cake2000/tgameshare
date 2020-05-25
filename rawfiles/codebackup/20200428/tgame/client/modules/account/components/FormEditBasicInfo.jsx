import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Select from 'react-select';
import { GENDER_VALUE, SCHOOL_GRADES } from '../../../../lib/enum';

class FormEditBasicInfo extends React.Component {
  static propTypes = {
    closeForm: PropTypes.func.isRequired,
    userData: PropTypes.objectOf(PropTypes.any).isRequired,
    updateUserAction: PropTypes.func.isRequired,
    updateUserProfileAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      userData: {
        ...props.userData,
        profile: {
          ...props.userData.profile
        }
      },
      errMessages: {
        username: '',
        email: ''
      },
      showSuccess: false,
      isUpdating: false,
      schools: [],
    };
    this.hideForm = this.hideForm.bind(this);
  }

  componentDidMount() {
    // new WOW().init(); // Wow is animation package for login form
    Meteor.call('getSchools', '', 'profile', (err, res) => {
      if (!err) {
        this.setState({ schools: res });
      }
    });
  }

  hideForm() {
    const { closeForm } = this.props;
    // clear errors
    this.setState({ errMessages: {} });

    closeForm();
  }

  changeValue = (type, e) => {
    const { userData } = this.state;
    const value = e.target ? e.target.value : e;

    switch (type) {
      case 'username':
        userData.username = value;
        break;
      case 'firstName':
        userData.profile.firstName = value;
        break;
      case 'lastName':
        userData.profile.lastName = value;
        break;
      case 'email':
        userData.emails[0].address = value;
        break;
      case 'birthday':
        userData.profile.birthday = new Date(value);
        break;
      case 'gender':
        userData.profile.gender = value;
        break;
      case 'zipcode':
        userData.profile.zipcode = value;
        break;
      case 'school':
        userData.profile.school = value;
        break;        
      case 'grade':
        userData.profile.grade = value;
        break;
      default:
        break;
    }

    this.setState({ userData });
    this.validateForm();
  }

  updateUser = () => {
    const { updateUserAction, updateUserProfileAction } = this.props;
    const { userData } = this.state;
    if (this.validateForm() > 0) {
      return false;
    }
    this.setState({ isUpdating: true });

    return updateUserProfileAction(userData, (error) => {
      this.setState({ isUpdating: false, showSuccess: (!error) });
      setTimeout(() => {
        this.setState({ showSuccess: false });
        if (!error) {
          this.hideForm();
        } else {
          this.setState({ errMessages: { username: error } });
        }
      }, 300);
    });
  }

  validateForm = () => {
    const { userData, errMessages } = this.state;
    let count = 0;
    if (!userData.username || userData.username.trim() === '') {
      count += 1;
      errMessages.username = 'User name is required';
    } else if (userData.username.match(/[^A-Za-z0-9_'-\s]/i)) {
      // count += 1;
      // errMessages.username = 'User name should not contain special character';
    } else {
      errMessages.username = '';
    }
    if (!userData.profile.firstName || userData.profile.firstName.trim() === '') {
      count += 1;
      errMessages.firstName = 'First name is required';
    } else if (userData.profile.firstName.match(/[^A-Za-z_'-\s]/i)) {
      count += 1;
      errMessages.firstName = 'First name should not contain any special character or number';
    } else {
      errMessages.firstName = '';
    }
    if (!userData.profile.lastName || userData.profile.lastName.trim() === '') {
      count += 1;
      errMessages.lastName = 'Last name is required';
    } else if (userData.profile.lastName.match(/[^A-Za-z_'-\s]/i)) {
      count += 1;
      errMessages.lastName = 'Last name shouldn not contain any special character or number';
    } else {
      errMessages.lastName = '';
    }
    if (!userData.profile.school || userData.profile.school.trim() === '') {
      count += 1;
      errMessages.school = 'School is required';
    } else {
      errMessages.school = '';
    }
    if (!userData.emails[0].address || userData.emails[0].address.trim() === '') {
      count += 1;
      errMessages.email = 'Email is required';
    } else {
      errMessages.email = '';
    }
    if (!userData.profile.zipcode) {
      count += 1;
      errMessages.zipcode = 'Zip code is required';
    } else if (userData.profile.zipcode.length !== 5
      || !/^\d+$/.test(userData.profile.zipcode)) {
      count += 1;
      errMessages.zipcode = 'Zip code is not valid';
    } else {
      errMessages.zipcode = '';
    }
    const grade = Number(userData.profile.grade);
    if (grade < 1 || grade > 14) {
      count += 1;
      errMessages.grade = 'Grade is not valid';
    } else {
      errMessages.grade = '';
    }
    if (userData.profile.gender !== GENDER_VALUE.MALE && userData.profile.gender !== GENDER_VALUE.FEMALE) {
      count += 1;
      errMessages.gender = 'Gender is not valid';
    } else {
      errMessages.gender = '';
    }
    this.setState({ errMessages });
    return count;
  };

  handleLoadSchools = (value) => {
    if (value.trim().length > 0) {
      Meteor.call('getSchools', value, 'profile', (err, res) => {
        if (!err) {
          this.setState({ schools: res });
        }
      });
    }
  };

  handleSelectSchool = (value) => {
    const { userData } = this.state;

    userData.profile.school = value._id;
    this.setState({ userData });
  };

  render() {
    const {
      userData, errMessages, isUpdating, showSuccess, schools
    } = this.state;
    const birthday = userData && userData.profile && userData.profile.birthday;
    const birthdayInit = new Date(birthday);
    const propsPicker = {};
    if (birthday) {
      propsPicker.initialDate = birthdayInit;
    }
    return (
      <div className="modal-updateProfile">
        <div className="form__block form__block--updateProfile">
          <ReactTooltip />
          <div className="form__group form__group--textbox">
            <span className="form__group__title" htmlFor="name">User Name </span>
            <div className="form__group__control">
              <input
                className="input input--userId"
                type="text"
                placeholder="User ID"
                required="required"
                disabled={isUpdating}
                value={userData.username}
                onChange={e => this.changeValue('username', e)}
                onBlur={() => { this.validateForm(); }}
              />
            </div>
            <span className="form__group__error validate-error">{errMessages.username}</span>
          </div>

          <div className="form__group form__group--textbox">
            <span className="form__group__title" htmlFor="name">First Name </span>
            <div className="form__group__control">
              <input
                className="input"
                type="text"
                placeholder="First Name"
                required="required"
                disabled={isUpdating}
                value={userData.profile.firstName}
                onChange={e => this.changeValue('firstName', e)}
                onBlur={() => { this.validateForm(); }}
              />
            </div>
            <span className="form__group__error validate-error">{errMessages.firstName}</span>
            <i data-tip="Full name is needed when we issue awards and certificates for you after tournaments" className="form__group__hint fa fa-question-circle" />
          </div>
          <div className="form__group form__group--textbox">
            <span className="form__group__title" htmlFor="name">Last Name </span>
            <div className="form__group__control">
              <input
                className="input"
                type="text"
                placeholder="Last Name"
                required="required"
                disabled={isUpdating}
                value={userData.profile.lastName}
                onChange={e => this.changeValue('lastName', e)}
                onBlur={() => { this.validateForm(); }}
              />
            </div>
            <span className="form__group__error validate-error">{errMessages.lastName}</span>
            <i data-tip="Full name is needed when we issue awards and certificates for you after tournaments" className="form__group__hint fa fa-question-circle" />
          </div>
          <div className="form__group form__group--radio">
            <span className="form__group__title" htmlFor="name">Gender</span>
            <div className="form__group__radio">
              <input
                onChange={e => this.changeValue('gender', e)}
                value={GENDER_VALUE.MALE}
                checked={userData.profile.gender === GENDER_VALUE.MALE}
                type="radio"
                name="gender"
                id="cbMale"
                disabled={isUpdating}
              />
              {' '}
              <label htmlFor="cbMale"> Male</label>
                &nbsp;&nbsp;
              <input
                onChange={e => this.changeValue('gender', e)}
                value={GENDER_VALUE.FEMALE}
                checked={userData.profile.gender === GENDER_VALUE.FEMALE}
                type="radio"
                name="gender"
                id="cbFemale"
                disabled={isUpdating}
              />
              {' '}
              <label htmlFor="cbFemale"> Female</label>
              <i data-tip="Gender is needed when we group you in tournaments" className="form__group__hint fa fa-question-circle" />
              <div className="form__group__error validate-error">{errMessages.gender}</div>
            </div>
          </div>
          <div className="form__group form__group--textbox">
            <span className="form__group__title" htmlFor="name">Email </span>
            <div className="form__group__control">
              <input
                className="input"
                type="text"
                disabled
                placeholder="Email"
                required="required"
                value={userData.emails[0].address}
                onChange={e => this.changeValue('email', e)}
                onBlur={() => { this.validateForm(); }}
              />
            </div>
            <span className="form__group__error validate-error">{errMessages.email}</span>
          </div>
          <div className="form__group form__group--textbox">
            <span className="form__group__title" htmlFor="name">Zip Code </span>
            <div className="form__group__control">
              <input
                className="input"
                type="text"
                placeholder="Zip Code"
                required="required"
                name="zipcode"
                disabled={isUpdating}
                value={userData.profile.zipcode}
                onChange={e => this.changeValue('zipcode', e)}
                onBlur={() => { this.validateForm(); }}
              />
            </div>
            <span className="form__group__error validate-error">{errMessages.zipcode}</span>
            <i data-tip="Zip code is needed when we issue awards and certificates for you after tournaments" className="form__group__hint fa fa-question-circle" />
          </div>
          <div className="form__group form__group--textbox">
            <span className="form__group__title">School</span>

            <div className="form__group__control">
              <input
                className="input"
                type="text"
                placeholder=""
                required=""
                name="SchoolName"
                disabled={isUpdating}
                value={userData.profile.school}
                onChange={e => this.changeValue('school', e)}
                onBlur={() => { this.validateForm(); }}
              />
            </div>
            <span className="form__group__error validate-error">{errMessages.school}</span>
            {/* <div className="form__group__control">
              <Select
                searchable
                placeholder="School"
                onInputChange={this.handleLoadSchools}
                labelKey="SchoolName"
                valueKey="_id"
                options={schools}
                value={userData.profile.school}
                onChange={this.handleSelectSchool}
              />
            </div> */}
          </div>
          <div className="form__group form__group--select">
            <span className="form__group__title" htmlFor="School Grade">School Grade</span>
            <div className="form__group__control form__group__control--select">
              <select
                name="grade"
                onChange={e => this.changeValue('grade', e)}
                value={userData.profile.grade}
                disabled={isUpdating}
              >
                {
                  SCHOOL_GRADES.map(grade => (<option key={grade.value} value={grade.value}>{grade.name}</option>))
                }
              </select>
            </div>
          </div>
        </div>
        <div className="form__group form__group--action">
          <button className="btn btn-cancel" onClick={this.hideForm} type="button">Cancel</button>
          <button className="button button--submit" disabled={isUpdating} onClick={this.updateUser} type="button">
            Update
            {isUpdating && <i className="fa fa-spin fa-circle-o-notch" style={{ marginLeft: '6px' }} /> }
            {showSuccess && <i className="fa fa-check" style={{ marginLeft: '6px' }} /> }
          </button>
        </div>
      </div>
    );
  }
}

export default FormEditBasicInfo;
