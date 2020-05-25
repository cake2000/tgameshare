import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import AddTeacherModal from './AddTeacherModal.jsx';
import { REGISTER_CLASS_STATUS } from '../../../../lib/enum';

class ManageTeacherSection extends Component {
  static propTypes = {
    teacherList: PropTypes.arrayOf(PropTypes.any).isRequired,
    registeredClasses: PropTypes.arrayOf(PropTypes.any).isRequired,
    addNewClass: PropTypes.func.isRequired,
    removeClass: PropTypes.func.isRequired,
    updateClass: PropTypes.func.isRequired,
    getClassesForTeacher: PropTypes.func.isRequired
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      showAddTeacherModal: false,
      isUpdate: false,
      selectedClass: null
    };
  }

  toggleAddTeacherModal = () => {
    this.setState({
      showAddTeacherModal: !this.state.showAddTeacherModal,
      isUpdate: false,
      selectedClass: null
    });
  };

  handleUpdate = ({ owner, teacherName, name, _id }) => {
    const selectedClass = {
      classData: {
        name,
        _id
      },
      teacher: {
        value: owner,
        label: teacherName
      }
    };
    this.setState({
      isUpdate: true,
      showAddTeacherModal: true,
      selectedClass
    });
  };

  handleRemove = (classId) => {
    const { removeClass } = this.props;
    removeClass(classId, (error) => {
      if (error) {
        console.log('error - ', error);
      }
    });
  };

  render() {
    const {
      teacherList,
      registeredClasses,
      getClassesForTeacher,
      addNewClass,
      updateClass
    } = this.props;
    const { showAddTeacherModal, isUpdate, selectedClass } = this.state;
    const styleColumn = {
      style: {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerStyle: {
        borderBottom: '1px solid white',
      }
    };

    const columns = [{
      Header: 'Class Name',
      id: 'className',
      ...styleColumn,
      accessor: item => item.name,
    }, {
      Header: 'Game Name',
      id: 'gameName',
      ...styleColumn,
      accessor: item => item.gameName,
    }, {
      Header: 'Teacher Name',
      id: 'teacherName',
      accessor: item => item.teacherName,
      ...styleColumn,
    // }, {
    //   Header: 'Class Forum',
    //   id: 'linkTo',
    //   ...styleColumn,
    //   accessor: item => `https://forum.tgame.ai/c/classarea/${item._id}`,
    //   Cell: row => row.original.status === REGISTER_CLASS_STATUS.APPROVE && (<a target="_blank" href={row.value}>Go</a>)
    }, {
      Header: 'Action',
      ...styleColumn,
      accessor: item => item,
      id: 'action',
      Cell: (item) => {
        const { teacherName, status, owner, name, _id } = item.value;
        return (
          <div className="invitation-action-buttons">
            <div className="invite-button-group">
              {status == REGISTER_CLASS_STATUS.APPROVE ? <div /> : 
                <button
                  className="inviteButton inviteButton--accept"
                  onClick={() => this.handleUpdate({ owner, teacherName, name, _id })}
                >
                  Update
                </button>
              }
              
              <button
                className="inviteButton inviteButton--decine"
                onClick={() => this.handleRemove(_id)}
              >
                Remove
              </button>
            </div>
          </div>
        );
      },
    }, {
      Header: 'Status',
      id: 'status',
      accessor: item => item.status,
      ...styleColumn,
    }];
    return (
      <div className="basic-info basic-info--accountInfo" style={{background: '#3257a4'}} >
        <div className="basic-info__title">
          <h4 className="basic-info__title__heading">Manage Classes (as a student)</h4>
        </div>
        <ReactTable
          NoDataComponent={() => null}
          showPagination={false}
          pageSize={registeredClasses.length}
          data={registeredClasses}
          columns={columns}
          style={{ marginBottom: "20px" }}
        />
        <div className="basic-info__content__line">
          <button
            style={{fontSize: "20px"}}
            className="btn"
            onClick={this.toggleAddTeacherModal}
          >
            Register for a new class
          </button>
        </div>
        <AddTeacherModal
          showModal={showAddTeacherModal}
          toggleAddTeacherModal={this.toggleAddTeacherModal}
          isUpdate={isUpdate}
          selectedClass={selectedClass}
          teacherList={teacherList}
          addNewClass={addNewClass}
          updateClass={updateClass}
          getClassesForTeacher={getClassesForTeacher}
          registeredClasses={registeredClasses}
        />
      </div>
    );
  }
}

export default ManageTeacherSection;
