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
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
    border: 'none',
    display: 'flex',
    padding: '0px',
    alignItems: 'center',
    background: '#f5f5f5',
    overflow: 'hidden',
    height: '500px'
  }
};

class AddStudentsModal extends Component {
  state = {
    students: [],
    selectedStudents: [],
    isLoading: false
  };

  selectStudent = (value) => {
    this.setState({ selectedStudents: value });
  };

  handleSearchStudents = (value) => {
    if (value.trim().length > 0) {
      Meteor.call('searchStudents', value, (err, res) => {
        if (res) {
          this.setState({ students: res });
        }
      });
    }
  };

  handleMouseDown = option => (event) => {
    event.preventDefault();
    event.stopPropagation();
    option.onSelect(option.option, event);
  };

  handleMouseEnter = option => (event) => {
    option.onFocus(option.option, event);
  };

  handleMouseMove = option => (event) => {
    if (option.isFocused) return;
    option.onFocus(option.option, event);
  };

  handleRemoveValue = value => (e) => {
    e.stopPropagation();
    let { selectedStudents } = this.state;

    if (!value.disabled) {
      value.onRemove(value.value);
    }
    selectedStudents = selectedStudents.filter(student => student._id !== value.value._id);
    this.setState({ selectedStudents });
  };

  renderOption = (option) => {
    return (
      <div
        className={option.className}
        onMouseDown={this.handleMouseDown(option)}
        onMouseEnter={this.handleMouseEnter(option)}
        onMouseMove={this.handleMouseMove(option)}
        role="presentation"
      >
        {`${option.option.profile.firstName || ''} ${option.option.profile.lastName || ''} (${option.option.username}) - ${option.option.emails[0].address}`}
      </div>
    );
  };

  renderValue = (value) => {
    return (
      <div className="Select-value">
        <span className="Select-value-label">
          <i
            onMouseDown={this.handleRemoveValue(value)}
            className="fa fa-times"
            aria-hidden="true"
          />
          {` | `}
          {`${value.value.profile.firstName || ''} ${value.value.profile.lastName || ''} (${value.value.username}) - ${value.value.emails[0].address}`}
        </span>
      </div>
    );
  };

  handleGoToPaymentDetail = () => {
    const { goToPaymentDetail, toggleAddStudentsModal, premiumPlan } = this.props;
    const { selectedStudents } = this.state;

    goToPaymentDetail(premiumPlan, selectedStudents);
    toggleAddStudentsModal();
  };

  render() {
    const { showModal, toggleAddStudentsModal } = this.props;
    const { students, isLoading, selectedStudents } = this.state;

    return (
      <Modal
        style={StyleModal}
        isOpen={showModal}
        contentLabel="Modal"
      >
        <div className="coupon-modal add-student-modal">
          <div className="modal__header">
            <div className="modal__header__title">
              Add Students
            </div>
            <div className="modal__header__action">
              <button
                onClick={() => toggleAddStudentsModal()}
                type="button"
              >
                <i className="fa fa-times" />
              </button>
            </div>
          </div>
          <div className="modal__content payment-form">
            <Select
              onChange={this.selectStudent}
              value={selectedStudents}
              onInputChange={this.handleSearchStudents}
              valueKey="_id"
              optionComponent={this.renderOption}
              valueComponent={this.renderValue}
              options={students}
              multi
            />
          </div>
          <div className="form__group form__group--action">
            <button
              className="btn charged-btn"
              type="submit"
              disabled={isLoading}
              onClick={this.handleGoToPaymentDetail}
            >
              {
                isLoading ? (
                  <LoadingIcon />
                ) : 'Add payment'
              }
            </button>
            <button
              className="btn cancelled-btn"
              type="button"
              onClick={() => toggleAddStudentsModal()}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

AddStudentsModal.propTypes = {
  toggleAddStudentsModal: PropTypes.func.isRequired,
  goToPaymentDetail: PropTypes.func.isRequired,
  premiumPlan: PropTypes.shape(),
  showModal: PropTypes.bool.isRequired
};

AddStudentsModal.defaultProps = {
  premiumPlan: null
};

export default AddStudentsModal;
