import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { SELECT_SCHOOL_TYPES } from '../../../../lib/enum.js';
import { getBase64String } from '../../../../lib/util';
import Select from 'react-select';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '540px',
    padding: '0',
    background: 'transparent',
    borderRadius: '0px',
    maxHeight: 'calc(100vh - 40px)',
    border: 'none',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

class TeacherAccountModal extends React.Component {
  static propTypes = {

  }

  constructor(props) {
    super(props);
    const { firstName, lastName, school } = Meteor.user().profile;
    this.state = {
      schoolType: SELECT_SCHOOL_TYPES.SCHOOL,
      userData: {
        firstName,
        lastName,
        schoolName: school,
        afterSchoolName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        note: '',
        schools: []
      },
      imageInfo: {}
    };
  }

  componentDidMount() {
    Meteor.call('getSchools', '', null, (err, res) => {
      if (!err) {
        this.setState({ schools: res });
      }
    });
  }

  closeModal = () => {
    const { toggleTeacherAccountModal } = this.props;
    this.setState({
      imageInfo: {}
    });
    toggleTeacherAccountModal();
  }

  registerAsTeacher = (base64Image = '') => {
    const { userData, imageInfo, schoolType } = this.state;
    const { registerAsTeacher } = this.props;
    registerAsTeacher({
      ...userData,
      teacherType: schoolType,
      imageInfo: {
        title: imageInfo.name,
        size: imageInfo.size,
        url: base64Image
      }
    }, (err, res) => {
      if (err) {
        console.log(err);
        alert(err.reason);
      } else {
        this.closeModal();
      }
    });
  }

  submitTeacher = (e) => {
    e.preventDefault();
    const { imageInfo } = this.state;
    if (this.state.schoolType === SELECT_SCHOOL_TYPES.SCHOOL && imageInfo instanceof Blob) {
      getBase64String(imageInfo, { width: 180, height: 180 }, (base64Image) => {
        this.registerAsTeacher(base64Image);
      });
    } else {
      console.log('register teacher');
      this.registerAsTeacher();
    }
  }

  changeValue = (type, e) => {
    const { userData } = this.state;
    const value = e.target ? e.target.value : e;
    switch (type) {
      case 'schoolName':
        userData.schoolName = value;
        break;
      case 'afterSchoolName':
        userData.afterSchoolName = value;
        break;
      case 'phone':
        userData.phone = value;
        break;
      case 'address':
        userData.address = value;
        break;
      case 'city':
        userData.city = value;
        break;
      case 'state':
        userData.state = value;
        break;
      case 'zipCode':
        userData.zipCode = value;
        break;
      case 'note':
        userData.note = value;
        break;
      default:
        break;
    }

    this.setState({
      userData: { ...userData }
    });
  }

  valueTeacherPicture = (event) => {
    const { files } = event.target;
    if (files.length > 0) {
      this.setState({
        imageInfo: files[0]
      });
    }
  }


  toggleNameSchoolChecked = () => {
    this.setState({ schoolType: SELECT_SCHOOL_TYPES.SCHOOL });
  }

  toggleNameAfterSchoolChecked = () => {
    this.setState({ schoolType: SELECT_SCHOOL_TYPES.AFTER_SCHOOL });
  }

  toggleIndividualChecked = () => {
    this.setState({ schoolType: SELECT_SCHOOL_TYPES.INDIVIDUAL });
  }

  handleLoadSchools = (value) => {
    if (value.trim().length > 0) {
      Meteor.call('getSchools', value.trim(), (err, res) => {
        if (!err) {
          this.setState({ schools: res });
        }
      });
    }
  };

  handleSelectSchool = (type, value) => {
    const { userData } = this.state;

    userData[type] = value._id;
    this.setState({ userData });
  };

  render() {
    const { showModal, isCompletedLesson = true } = this.props;
    const {
      schoolType, userData = {}, imageInfo = {}, schools
    } = this.state;
    const {
      schoolName, afterSchoolName, phone, address, city, state, zipCode, note
    } = userData;
    const { name: certificateFileName = null } = imageInfo;

    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel="Modal"
      >
        {isCompletedLesson
          ? (
            <div className="modal-Shopping">
              <div className="modal-Shopping__header">
                <div className="modal-Shopping__header__title">Teacher Information</div>
                <div className="modal-Shopping__header__close">
                  <span onClick={this.closeModal} role="presentation"><i className="fa fa-times" /></span>
                </div>
              </div>
              <div className="modal-Shopping__main" style={{ padding: 20 }}>
                <form id="submitForm" className="form" onSubmit={el => this.submitTeacher(el)}>
                  <div className="modal__body--content">
                    <div className="form__group form__group--radio">
                      <div className="form__group__radio">
                        <input
                          type="radio"
                          name="orgazination"
                          id="cbSchool"
                          onClick={this.toggleNameSchoolChecked}
                          defaultChecked
                        />
                        {' '}
                        <label htmlFor="cbSchool"> School</label>
                        <input
                          type="radio"
                          name="orgazination"
                          id="cbAfterSchool"
                          onClick={this.toggleNameAfterSchoolChecked}
                        />
                        {' '}
                        <label htmlFor="cbAfterSchool"> After-school Organization</label>
                        <input
                          type="radio"
                          name="orgazination"
                          id="cbIndividual"
                          onClick={this.toggleIndividualChecked}
                        />
                        {' '}
                        <label htmlFor="cbIndividual"> Individual</label>
                        <div className="form__group__err--orgazination" />
                      </div>
                    </div>
                    {schoolType === SELECT_SCHOOL_TYPES.SCHOOL
                    && (
                    <div className="form__group form__group--textbox" htmlFor="cbSchool">
                      <span className="form__group__title" htmlFor="name">Name of School</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="text"
                          placeholder=""
                          required
                          value={schoolName}
                          onChange={e => this.changeValue('schoolName', e)}
                        />
                      </div>
                      {/* <div className="form__group__control">
                        <Select
                          searchable
                          placeholder="School"
                          onInputChange={this.handleLoadSchools}
                          labelKey="SchoolName"
                          valueKey="_id"
                          options={schools}
                          value={schoolName}
                          required
                          onChange={value => this.handleSelectSchool('schoolName', value)}
                        />
                      </div> */}
                      <span className="form__group__error form__group__err" />
                    </div>
                    )
                  }
                    {schoolType === SELECT_SCHOOL_TYPES.AFTER_SCHOOL
                    && (
                    <div className="form__group form__group--textbox" htmlFor="cbAfterSchool">
                      <span className="form__group__title" htmlFor="name">Name of After School Organization</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="text"
                          placeholder=""
                          required
                          value={afterSchoolName}
                          onChange={e => this.changeValue('afterSchoolName', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    )
                  }
                    {schoolType === SELECT_SCHOOL_TYPES.INDIVIDUAL
                    && [
                      <div className="form__group form__group--textbox" htmlFor="cbSchool" key="1">
                        <span className="form__group__title" htmlFor="name">Name of School (optional)</span>
                        <div className="form__group__control">
                          <Select
                            searchable
                            placeholder="School"
                            onInputChange={this.handleLoadSchools}
                            labelKey="SchoolName"
                            valueKey="_id"
                            options={schools}
                            value={schoolName}
                            onChange={value => this.handleSelectSchool('schoolName', value)}
                          />
                        </div>
                        <span className="form__group__error form__group__err" />
                      </div>,
                      <div className="form__group form__group--textbox" htmlFor="cbAfterSchool" key="2">
                        <span className="form__group__title" htmlFor="name">Name of After School Organization (optional)</span>
                        <div className="form__group__control">
                          <input
                            className="input form__group__text"
                            type="text"
                            placeholder=""
                            required
                            value={afterSchoolName}
                            onChange={e => this.changeValue('afterSchoolName', e)}
                          />
                        </div>
                        <span className="form__group__error form__group__err" />
                      </div>
                    ]
                  }
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title" htmlFor="name">Phone Number</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="tel"
                          placeholder=""
                          pattern="^(1[ \-\+]{0,3}|\+1[ -\+]{0,3}|\+1|\+)?((\(\+?1-[2-9][0-9]{1,2}\))|(\(\+?[2-8][0-9][0-9]\))|(\(\+?[1-9][0-9]\))|(\(\+?[17]\))|(\([2-9][2-9]\))|([ \-\.]{0,3}[0-9]{2,4}))?([ \-\.][0-9])?([ \-\.]{0,3}[0-9]{2,4}){2,3}$"
                          title="XXX-XXX-XXXX"
                          required
                          value={phone}
                          onChange={e => this.changeValue('phone', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title" htmlFor="name">Street Address</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="text"
                          placeholder=""
                          required
                          value={address}
                          onChange={e => this.changeValue('address', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title" htmlFor="name">City</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="text"
                          placeholder=""
                          required
                          value={city}
                          onChange={e => this.changeValue('city', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title" htmlFor="name">State</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="text"
                          placeholder=""
                          required
                          value={state}
                          onChange={e => this.changeValue('state', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    <div className="form__group form__group--textbox">
                      <span className="form__group__title" htmlFor="name">Zip Code</span>
                      <div className="form__group__control">
                        <input
                          className="input form__group__text"
                          type="text"
                          placeholder=""
                          required
                          value={zipCode}
                          onChange={e => this.changeValue('zipCode', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    {/* {schoolType === SELECT_SCHOOL_TYPES.SCHOOL
                    && (
                    <div className="form__group">
                      <span className="form__group__title" htmlFor="name">Picture of Official Teacher Certificate</span>
                      <div className="form__group__picture">
                        <input type="file" name="image-upload" id="official-teacher-certificate" onChange={this.valueTeacherPicture} />
                        <label htmlFor="official-teacher-certificate">
                          <span className="picture-name">
                            {certificateFileName || ""}
                          </span>
                          <strong className="file-upload-button btn">Select File</strong>
                        </label>
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    )
                  } */}
                    <div className="form__group form__group--textarea">
                      <span className="form__group__title" htmlFor="name">Note</span>
                      <div className="form__group__title">
                        <textarea
                          className="input form__group__textarea"
                          type="text"
                          placeholder=""
                          value={note}
                          onChange={e => this.changeValue('note', e)}
                        />
                      </div>
                      <span className="form__group__error form__group__err" />
                    </div>
                    <div className="form__group form__group__button">
                      <button type="submit" className="btn">Register</button>
                      {
                      // will add in the future for edit info
                      // <button className="btn btn-default">Edit</button>
                    }
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )
          : (
            <div className="modal_block_general change-pw-modal">
              <div className="modal__header">
                <div className="modal__header--title">Teacher Information</div>
                <div className="modal__header--close" onClick={this.closeModal} role="presentation">x</div>
              </div>
              <div className="modal__body">
                <span className="form__group__notification">To register as a teacher, we require that you have successfully completed all the lessons in at least one game that you choose.</span>
              </div>
            </div>
          )
        }
      </Modal>
    );
  }
}

export default TeacherAccountModal;
