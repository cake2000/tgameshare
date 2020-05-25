import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Select from 'react-select';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

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

export default class AddTeacherModal extends Component {
  static propTypes = {
    showModal: PropTypes.bool.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    teacherList: PropTypes.arrayOf(PropTypes.any).isRequired,
    registeredClasses: PropTypes.arrayOf(PropTypes.any).isRequired,
    selectedClass: PropTypes.objectOf(PropTypes.any),
    toggleAddTeacherModal: PropTypes.func.isRequired,
    addNewClass: PropTypes.func.isRequired,
    updateClass: PropTypes.func.isRequired,
    getClassesForTeacher: PropTypes.func.isRequired
  };

  static defaultProps = {
    selectedClass: null
  };

  constructor(props) {
    super(props);
    this.state = {
      success: '',
      error: null,
      isLoading: false,
      teacher: null,
      classData: null,
      classList: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const { selectedClass, getClassesForTeacher } = nextProps;

    if (JSON.stringify(this.props.selectedClass) !== JSON.stringify(nextProps.selectedClass) && nextProps.selectedClass) {
      this.setState({ classData: nextProps.selectedClass.classData });

      getClassesForTeacher(selectedClass.teacher.value, (err, res) => {
        this.setState({ classList: res });
      });
    }
  }

  closeModal = () => {
    const { toggleAddTeacherModal } = this.props;
    this.setState({
      error: null,
      isLoading: false,
      teacher: null,
      classData: null,
      classList: []
    });
    toggleAddTeacherModal();
  };

  handleChange = (type, value) => {
    const { getClassesForTeacher } = this.props;

    this.setState({ [type]: value });
    if (type === 'teacher') {
      this.setState({ isShowClassNameInput: true });
      getClassesForTeacher(value.value, (err, res) => {
        this.setState({ classData: null, classList: res });
      });
    }
  };

  handleButtonAction = () => {
    const {
      isUpdate, selectedClass, addNewClass, updateClass, registeredClasses
    } = this.props;
    const { classData } = this.state;

    if (classData) {
      if (registeredClasses.find(registeredClass => registeredClass._id === classData._id)) {
        this.setState({ error: 'You are already in this class' });
        return;
      }
      if (isUpdate) {
        if (selectedClass.classData._id !== classData._id) {
          updateClass(selectedClass.classData._id, classData._id, (error) => {
            if (!error) {
              this.closeModal();
            } else {
              this.setState({ error: error.reason, isLoading: false });
            }
          });
        } else {
          this.closeModal();
        }
      } else {
        addNewClass(classData._id, (error) => {
          if (!error) {
            this.closeModal();
          } else {
            this.setState({ error: error.reason, isLoading: false });
          }
        });
      }
    }
  };

  render() {
    const {
      showModal, isUpdate, selectedClass, teacherList
    } = this.props;
    const {
      error, isLoading, teacher, classData, classList
    } = this.state;

    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel="Modal"
      >
        <div className="modal-Shopping">
          <div className="modal-Shopping__header">
            <div className="modal-Shopping__header__title">Register for a new class</div>
            <div className="modal-Shopping__header__close">
              <span onClick={this.closeModal} role="presentation"><i className="fa fa-times" /></span>
            </div>
          </div>
          <div className="modal-Shopping__main" style={{ height: 'auto', padding: 20 }}>
            <div className="modal__body--content">
              <div className="form">
                <div className="form__group form__group--textbox">
                  <span className="form__group__title">Select Teacher</span>
                  <div className="form__group__control">
                    <Select
                      isSearchable
                      onChange={value => this.handleChange('teacher', value)}
                      options={teacherList}
                      disabled={isUpdate}
                      value={isUpdate ? selectedClass.teacher : teacher}
                      placeholder="Teacher"
                    />
                  </div>
                </div>
                <div className="form__group form__group--textbox">
                  <span className="form__group__title">Class Name</span>
                  <div className="form__group__control">
                    <Select
                      isSearchable
                      onChange={value => this.handleChange('classData', value)}
                      options={classList}
                      labelKey="name"
                      valueKey="_id"
                      value={classData}
                      placeholder="Class"
                    />
                  </div>
                </div>
                <span className="form-status--error">{error || ''}</span>
                <div className="btn--group">
                  {isLoading
                    ? (
                      <button className="btn btn-info" type="button">
                        <LoadingIcon
                          width="148px"
                        />
                      </button>
                    )
                    : (
                      <button className="btn btn-info" onClick={this.handleButtonAction} type="button">
                        {isUpdate ? 'Update' : 'Register'}
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
