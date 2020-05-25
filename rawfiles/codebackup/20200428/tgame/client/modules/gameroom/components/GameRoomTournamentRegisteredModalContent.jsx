import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import { GENDER_VALUE, SCHOOL_GRADES } from '../../../../lib/enum';

export default class GameRoomTournamentRegisteredModalContent extends React.Component {
  static propTypes = {
    userData: PropTypes.objectOf(PropTypes.any).isRequired,
    onClose: PropTypes.func.isRequired,
    joinTournamentSection: PropTypes.func.isRequired,
    sectionId: PropTypes.string,
    tournament: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userAICodes: PropTypes.array.isRequired // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    sectionId: '',
    title: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      userData: {
        ...props.userData,
        profile: {
          ...props.userData.profile,
        }
      },
      errMessages: {
        username: '',
        email: '',
      },
      register: {
        isProcessing: false,
        error: '',
      },
      robot: ''
    };
  }

  componentWillMount() {
    this.setState({
      register: {
        ...this.state.register,
        error: ''
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { userAICodes, tournament } = nextProps;
    const { userData } = this.state;

    if (JSON.stringify(userAICodes) !== JSON.stringify(this.props.userAICodes)) {
      this.setState({ robot: userAICodes[0] ? userAICodes[0]._id : '' });
    }
  }

  onConfirm = (e) => {
    e.preventDefault();
    const {
      onClose,
      sectionId,
      tournament,
    } = this.props;
    const { robot } = this.state;
    const tournamentId = tournament._id;
    if (this.validateForm() > 0) {
      return false;
    }
    this.setState({
      register: { ...this.state.register, isProcessing: true, error: '' }
    });
    return this.props.joinTournamentSection(tournamentId, sectionId, this.state.userData, robot, (err) => {
      this.setState({
        register: { ...this.state.register, isProcessing: false, error: err }
      });
      if (!err || err === '') {
        onClose();
      }
    });
  };

  onCancel = (e) => {
    e.preventDefault();
    const {
      onClose
    } = this.props;
    onClose();
  };

  validateForm = () => {
    const { userData, errMessages, robot } = this.state;
    let count = 0;
    if (!userData.username || userData.username.trim() === '' ) {
      count += 1;
      errMessages.username = 'UserId is required';
    } else if (userData.username.match(/[^A-Za-z_'-\s]/i)) {
      errMessages.username = 'UserId do not include special characters';
    } else {
      errMessages.username = '';
    }
    if (!userData.profile.firstName || userData.profile.firstName.trim() === '') {
      count += 1;
      errMessages.firstName = 'First name is required';
    } else if (userData.profile.firstName.match(/[^A-Za-z_'-\s]/i)) {
      errMessages.firstName = 'First name do not include special characters or number';
    } else {
      errMessages.firstName = '';
    }
    if (!userData.profile.lastName || userData.profile.lastName.trim() === '') {
      count += 1;
      errMessages.lastName = 'Last name is required';
    } else if (userData.profile.lastName.match(/[^A-Za-z_'-\s]/i)) {
      errMessages.lastName = 'First name do not include special characters or number';
    } else {
      errMessages.lastName = '';
    }
    if (!userData.emails[0].address || userData.emails[0].address.trim() === '') {
      count += 1;
      errMessages.email = 'Email is required';
    } else {
      errMessages.email = '';
    }
    if (!userData.profile.zipcode) {
      errMessages.zipcode = 'Zip code is required';
      count += 1;
    } else if (userData.profile.zipcode.length !== 5 ||
      !/^\d+$/.test(userData.profile.zipcode)) {
      count += 1;
      errMessages.zipcode = 'Zip code is not valid';
    } else {
      errMessages.zipcode = '';
    }
    const grade = Number(userData.profile.grade);
    if (grade < 1 || grade > 13) {
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
    if (robot.length === 0) {
      count += 1;
      errMessages.robot = 'Robot is required';
    }

    this.setState({ errMessages });
    return count;
  };

  changeValue = (type, e) => {
    const { userData } = this.state;
    const value = e.target ? e.target.value : e;

    switch (type) {
      case 'username':
        userData[type] = value;
        break;
      case 'robot': // eslint-disable-line
        this.setState({ [type]: value });
        break;
      default:
        userData.profile[type] = value;
        break;
    }
    this.setState({ userData });
    this.validateForm();
  };

  render() {
    const { errMessages, userData, register, robot } = this.state;
    const { error } = register;
    const {
      tournament,
      userAICodes
    } = this.props;
    const confirmationClassNames = classNames({
      btn: true,
      'btn-disabled': this.state.register.isProcessing
    });
    const confirmationLabel = this.state.register.isProcessing ? 'Confirming' : 'Confirm';
    return (
      <div className="registered-info">
        <div className="registered-info--header">
          <div className="registered-info--header__title">
            <span>{`${tournament.Name}`}</span>
          </div>
          <div className="registered-info--header__time">
            <span>{moment(tournament.startTime).format('MMMM Do YYYY, HH:mma')}</span>
          </div>
          <div className="registered-info--header__description">
            <span>
              {tournament.description}
            </span>
          </div>
        </div>
        <div className="registered-info__content">
          <ReactTooltip place="left" />
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">Username</span>
            <div className="registered-form">
              <input
                className="registered-form__text"
                type="text"
                placeholder="User ID"
                required="required"
                value={userData.username}
                onChange={e => this.changeValue('username', e)}
                onBlur={() => { this.validateForm(); }}
              />
              <div className="registered-form__err">
                <span>{errMessages.username}</span>
              </div>
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">First Name</span>
            <div className="registered-form">
              <input
                className="registered-form__text"
                type="text"
                placeholder="First Name"
                required="required"
                value={userData.profile.firstName}
                onChange={e => this.changeValue('firstName', e)}
                onBlur={() => { this.validateForm(); }}
              />
              <div className="registered-form__err">
                <span>{errMessages.firstName}</span>
              </div>
              <i data-tip="Full name is needed when we issue awards and certificates for you after tournaments" className="registered-form__hint fa fa-question-circle" />
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">Last Name</span>
            <div className="registered-form">
              <input
                className="registered-form__text"
                type="text"
                placeholder="Last Name"
                required="required"
                value={userData.profile.lastName}
                onChange={e => this.changeValue('lastName', e)}
                onBlur={() => { this.validateForm(); }}
              />
              <div className="registered-form__err">
                <span>{errMessages.lastName}</span>
              </div>
              <i data-tip="Full name is needed when we issue awards and certificates for you after tournaments" className="registered-form__hint fa fa-question-circle" />
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">Gender</span>
            <div className="form registered-form">
              <div className="registered-form__radio">
                <input
                  className="registered-form__radio__check"
                  onChange={e => this.changeValue('gender', e)}
                  value={GENDER_VALUE.MALE}
                  type="radio"
                  name="gender"
                  id="cbMale"
                  checked={userData.profile.gender === GENDER_VALUE.MALE}
                /> <label htmlFor="cbMale"> Male</label>&nbsp;&nbsp;
                <input
                  className="registered-form__radio__check"
                  onChange={e => this.changeValue('gender', e)}
                  value={GENDER_VALUE.FEMALE}
                  type="radio"
                  name="gender"
                  id="cbFemale"
                  checked={userData.profile.gender === GENDER_VALUE.FEMALE}
                /> <label htmlFor="cbFemale"> Female</label>
                <div className="registered-form__err--gender">{errMessages.gender}</div>
                <i data-tip="Gender is needed when we group you in tournaments" className="registered-form__hint_white fa fa-question-circle" />
              </div>
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">Email</span>
            <div className="registered-form">
              <input
                className="registered-form__text"
                type="text"
                disabled
                placeholder="Email"
                required="required"
                value={userData.emails[0].address}
                onChange={e => this.changeValue('email', e)}
                onBlur={() => { this.validateForm(); }}
              />
              <div className="registered-form__err">
                <span>{errMessages.email}</span>
              </div>
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">Zip Code</span>
            <div className="registered-form">
              <input
                className="registered-form__text"
                type="text"
                placeholder="Zip Code"
                required="required"
                onChange={e => this.changeValue('zipcode', e)}
                onBlur={() => { this.validateForm(); }}
                value={userData.profile.zipcode}
              />
              <div className="registered-form__err">
                <span>{errMessages.zipcode}</span>
              </div>
              <i data-tip="Zip code is needed when we issue awards and certificates for you after tournaments" className="registered-form__hint fa fa-question-circle" />
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">School Grade</span>
            <div className="registered-form">
              <select
                className="registered-form__select"
                value={userData.profile.grade}
                onChange={e => this.changeValue('grade', e)}
              >
                {SCHOOL_GRADES.map(grade => (<option key={grade.value} value={grade.value}>{grade.name}</option>))}
              </select>
              <div className="registered-form__err">
                <span>{errMessages.grade}</span>
              </div>
            </div>
          </div>
          <div className="registered-info__content__line">
            <span className="registered-info__content__line__label">Robot Release</span>
            <div className="registered-form">
              <select
                className="registered-form__select"
                value={robot}
                onChange={e => this.changeValue('robot', e)}
              >
                {
                  userAICodes.map(code => (
                    <option key={code._id} value={code._id}>
                      {code.releaseName}
                    </option>
                  ))
                }
              </select>
              <div className="registered-form__err">
                <span>{errMessages.robot}</span>
              </div>
            </div>
          </div>
          <div className="registered-form--action">
            <span className="registered-form--action__err">{error}</span>
            <button className={confirmationClassNames} onClick={this.onConfirm}>{confirmationLabel}</button>
            <button className="btn btn-transparent" onClick={this.onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }
}
