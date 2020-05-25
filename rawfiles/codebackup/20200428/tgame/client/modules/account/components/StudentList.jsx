import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import ReactTable from 'react-table';
import swal from 'sweetalert';
import AddStudentsModal from './AddStudentsModal';
import LoadingIcon from '../../../lib/LoadingIcon';

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
    maxWidth: '670px',
    width: '100%',
    margin: '0 auto',
    border: 'none',
    display: 'flex',
    padding: '0px',
    alignItems: 'center',
    background: '#f5f5f5',
  }
};

class StudentListModal extends Component {
  state = {
    openSearchingStudentsModal: false,
    isLoading: false
  };

  handleLoading = () => {
    this.setState(previousState => ({ isLoading: !previousState.isLoading }));
  };

  handleOpenSearchingStudentsModal = () => {
    this.setState(previous => ({ openSearchingStudentsModal: !previous.openSearchingStudentsModal }));
  };

  handleCancelStudentSubscription = value => () => {
    const { cancelStudentSubscription } = this.props;

    swal({
      title: `Do you want to cancel this student's subscription`,
      text: '',
      icon: 'warning',
      buttons: {
        confirm: {
          text: 'Yes',
          value: true,
          visible: true,
          className: "",
          closeModal: true
        },
        cancel: {
          text: 'No',
          value: null,
          visible: true,
          className: '',
          closeModal: true
        }
      },
      dangerMode: true
    })
      .then((confirmed) => {
        if (confirmed) {
          this.handleLoading();
          cancelStudentSubscription(value.original._id, (err) => {
            if (err) {
              console.log(err);
            }
            this.handleLoading();
          });
        }
      });
  };

  render() {
    const {
      showModal, toggleStudentAccountsModal, goToPaymentDetail,
      premiumPlan, students
    } = this.props;
    const { openSearchingStudentsModal, isLoading } = this.state;

    const styleColumn = {
      style: {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      headerStyle: {
        borderBottom: '1px solid white'
      }
    };
    const columns = [
      {
        Header: 'Name',
        accessor: 'fullName',
        ...styleColumn,
        width: 170
      },
      {
        Header: 'Username',
        accessor: 'username',
        ...styleColumn,
        width: 150
      },
      {
        Header: 'Email',
        accessor: 'email',
        ...styleColumn,
        width: 150
      },
      {
        Header: 'Remove',
        ...styleColumn,
        width: 150,
        Cell: row => (
          <div>
            <button
              type="button"
              className="admin-btn admin-btn--trans step-rows__item__add-btn"
              onClick={this.handleCancelStudentSubscription(row)}
              disabled={isLoading}
            >
              {
                isLoading ? <LoadingIcon width="11px" height="14px" /> : <i className="fa fa-trash-o" />
              }
            </button>
          </div>
        )
      }
    ];

    return (
      <Modal
        style={StyleModal}
        isOpen={showModal}
        contentLabel="Modal"
      >
        <div className="coupon-modal">
          <div className="modal__header">
            <div className="modal__header__title">
              Student Accounts
            </div>
            <div className="modal__header__action">
              <button
                type="button"
                className="modal__header__action--addStudent"
                onClick={this.handleOpenSearchingStudentsModal}
              >
                <i className="fa fa-plus" />
                Add students
              </button>
              <button
                onClick={toggleStudentAccountsModal()}
                type="button"
              >
                <i className="fa fa-times" />
              </button>
            </div>
          </div>
          <div className="modal__content payment-form">
            <ReactTable
              NoDataComponent={() => null}
              showPagination={false}
              style={{ height: 'calc(100vh - 180px)', maxWidth: 1235 }}
              pageSize={50}
              data={students}
              columns={columns}
            />
          </div>
        </div>
        {
          openSearchingStudentsModal && (
            <AddStudentsModal
              goToPaymentDetail={goToPaymentDetail}
              showModal={openSearchingStudentsModal}
              toggleAddStudentsModal={this.handleOpenSearchingStudentsModal}
              premiumPlan={premiumPlan}
            />
          )
        }
      </Modal>
    );
  }
}

StudentListModal.propTypes = {
  toggleStudentAccountsModal: PropTypes.func.isRequired,
  goToPaymentDetail: PropTypes.func.isRequired,
  premiumPlan: PropTypes.shape(),
  showModal: PropTypes.bool.isRequired,
  students: PropTypes.arrayOf(PropTypes.shape()),
  cancelStudentSubscription: PropTypes.func.isRequired
};

StudentListModal.defaultProps = {
  premiumPlan: null,
  students: []
};

export default StudentListModal;
