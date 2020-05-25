import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import AddCoinsModal from './AddCoinsModal.jsx';
import ResetLessonModal from './ResetLessonModal.jsx';
import { REGISTER_CLASS_STATUS } from '../../../../lib/enum';
import { SlideContent, Lessons } from '../../../../lib/collections/index.js';

class ProgressPage extends Component {

  state = {
    showModal: false,
    showModalReset: false,
    myResetType: 0,
    userId: '',
    fullname: ''
  };

  handleRedirect = (studentId, p) => {
    const { history, classId } = this.props;
    if (p.progress > 0 || p.progress == -1) {
      if (!p.course.includes("Old)")) {
        history.push(`/newclass/${classId}/${studentId}/${p.id}`);
      } else {
        history.push(`/class/${classId}/${studentId}/${p.id}`);
      }
    }
  };

  handleRedirectUserTest= (studentId, testId) => {
    const { history, classId } = this.props;

    history.push(`/class/${classId}/${studentId}/usertestcase_${testId}`);
  };

  // toggleSyncLock = (user) => {
  //   const { showModal, showModalReset } = this.state;

  //   Meteor.call('toggleSyncLock', user._id);
  // };

  handleAddCoins = (user) => {
    const { showModal, showModalReset } = this.state;

    if (!user) {
      this.setState({
        showModal: !showModal,
        userId: '',
        fullname: ''
      });  
    } else {
      this.setState({
        showModal: !showModal,
        userId: user._id,
        fullname: user.fullname
      });
    }
  };

  resetPassword = (user, allow) => {
    Meteor.call('resetUserPassword', user._id, (err) => {
      if (err) {
        //throw new Meteor.Error(500, err);
        Bert.alert({
          title: 'Error',
          message: `Reset password failed: ${err}.`,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });            
      } else {
        Bert.alert({
          title: 'Success',
          message: `Password has been reset for ${user.username} to these 8 letters: 12345678`,
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-check'
        });    
      }

    });

  };

  handleResetLesson = (user, type) => {
    const { showModalReset } = this.state;

    if (!user) {
      this.setState({
        showModalReset: !showModalReset,
        myResetType: type,
        userId: '',
        fullname: ''
      });  
    } else {
      this.setState({
        showModalReset: !showModalReset,
        myResetType: type,
        userId: user._id,
        fullname: user.fullname
      });
    }

  };

  handleApprove = (type, userId) => {
    const { classId, handleApprove } = this.props;

    handleApprove(type, userId, classId);
  };

  handleAllowFastForward = (user, allow) => {
    const { showModalReset } = this.state;

    Meteor.call('handleAllowFastForward', user._id, allow);
  };

  render() {
    const { students, scenarios, classData, addCoinsToUser, moveForwardLessonForUser, resetLessonForUser, classId } = this.props;
    const { showModal, showModalReset, myResetType, userId, fullname } = this.state;
    const that = this;
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
    const columns = [
      {
        Header: 'Name',
        accessor: 'fullname',
        ...styleColumn,
        width: 120
      },
      // {
      //   Header: 'Last name',
      //   accessor: 'profile.lastName',
      //   ...styleColumn,
      //   width: 100
      // },
      {
        Header: 'Username',
        accessor: 'username',
        ...styleColumn,
        width: 100,
      },
      {
        Header: 'G',
        accessor: 'profile.grade',
        ...styleColumn,
        width: 30,
      },
      // {
      //   Header: 'Lessons',
      //   accessor: 'tutorial',
      //   ...styleColumn,
      //   width: 300,
      //   Cell: row => row.value && (
      //     <div>
      //       {
      //         row.value.map((tutorial) => {
      //           const tutorialDetails = scenarios.find(element => tutorial && element._id === tutorial.id);
      //           return (
      //             <div key={tutorial.id} className="invitation-action-buttons">
      //               {
      //                 tutorialDetails &&
      //                 <button
      //                   className="no-border"
      //                   onClick={() => this.handleRedirect(row.original._id, tutorial.id)}
      //                 >
      //                   {tutorialDetails.ScenarioName} - {tutorial.progress * 100}%
      //                 </button>
      //               }
      //             </div>
      //           );
      //         })
      //       }
      //     </div>
      //   )
      // },

      {
        Header: 'Courses',
        accessor: 'courses',
        ...styleColumn,
        width: 130,
        Cell: function(row) {
          if (row && row.value) 
            return (
              <div>
                {
                  row.value.map((course) => {
                    return (
                      <div key={course.name} className="progress-course-name">
                        {course.name}
                        {/* {
                          course.progresses.map((p) => {
                            //return (<span>{p.progress}%</span>)
                            return (
                              <span onClick={() => this.handleRedirect(row.original._id, p)} title={p.lesson + ": " + (p.progress*100).toFixed(0) + "%"} style={{background: "linear-gradient(orange 0%, orange " + (100*(1-p.progress)) + "%, green " + (100*(1-p.progress)) + "%, green 100%)"}}>
    
                              </span>
                            )
                          })
                        } */}
                      </div>
                    );
                  })
                }
              </div>
            );
          else
            return (<div></div>);
        }
      },

      {
        Header: 'Progress',
        accessor: 'courses',
        ...styleColumn,
        width: 450,
        Cell: function(row) {
          if (row && row.value) 
            return (
              <div>
                {
                  row.value.map((course) => {
                    return (
                      <div key={course.name + "-progress"} className="progress-course">
                        {
                          course.progresses.map((p) => {
                            //return (<span>{p.progress}%</span>)
                            let prog = 100*(1 -p.progress); 
                            if (p.progress == -1) {
                              prog = 95;
                            }
                            if (p.lesson.includes("[Homework")) {
                              return (
                                <span onClick={() => that.handleRedirect(row.original._id, p)} title={p.lesson + ": " + ( Math.max(0, p.progress)*100).toFixed(0) + "%"} style={{cursor: prog < 100 ? "pointer" : "default", background: "linear-gradient(cornflowerblue 0%, cornflowerblue " + prog + "%, blue " + prog + "%, blue 100%)"}}>
                                </span>
                              );
                            } else {
                              return (
                                <span onClick={() => that.handleRedirect(row.original._id, p)} title={p.lesson + ": " + ( Math.max(0, p.progress)*100).toFixed(0) + "%"} style={{cursor: prog < 100 ? "pointer" : "default", background: "linear-gradient(orange 0%, orange " + prog + "%, green " + prog + "%, green 100%)"}}>
                                </span>
                              );
                            }

                          })
                        }
                      </div>
                    );
                  })
                }
              </div>
            );
          else
            return (<div></div>);
        }
      },
      // {
      //   Header: 'Test Cases',
      //   accessor: 'testcases',
      //   ...styleColumn,
      //   width: 200,
      //   Cell: row => row.value && (
      //     <div>
      //       {
      //         row.value.map((test) => {
      //           return (
      //             <div key={test._id} className="invitation-action-buttons">
      //               {
      //                 <button
      //                   className="no-border"
      //                   onClick={() => this.handleRedirectUserTest(row.original._id, test._id)}
      //                 >
      //                   {test.ScenarioName.substr(0, 25)}
      //                 </button>
      //               }
      //             </div>
      //           );
      //         })
      //       }
      //     </div>
      //   )
      // },
      {
        Header: 'Coins',
        accessor: 'profile.coins',
        ...styleColumn,
        width: 90,
        Cell: row => (
          <div className="level__info__coin2">
            <img src="/images/coin.png" style={{width: "18px", height: "18px"}} alt="" />
            <span>{row.value}</span>
          </div>
        )
      },
      // {
      //   Header: 'Sync',
      //   ...styleColumn,
      //   width: 80,
      //   Cell: row => (
      //     <div className={row.original.synclocked ? "unlock-buttons" : "lock-buttons"}>
      //       <button
      //         onClick={
      //           () => that.toggleSyncLock(row.original)
      //         }
      //       >
      //         {row.original.synclocked ? "Unlock" : "Lock"}
      //       </button>
      //     </div>
      //   )
      // },
      {
        Header: 'Reward',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">
            <button
              onClick={
                () => that.handleAddCoins(row.original)
              }
            >
              Add
            </button>
          </div>
        )
      },
      {
        Header: 'Lesson',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div style={{display: 'block'}} className="invitation-action-buttons">
            <button
              onClick={() => that.handleResetLesson(row.original, 1)}
            >
              Reset
            </button> <br/>

            <button style={{marginTop: "5px"}}
              onClick={() => that.handleResetLesson(row.original, 2)}
            >
              Forward
            </button>

          </div>
        )
      },
      {
        Header: 'Pwd',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">
              <button
                onClick={() => that.resetPassword(row.original)}
              >
                Reset
              </button>
          </div>
        )
      },
      {
        Header: 'Fast Mode',
        ...styleColumn,
        width: 90,
        Cell: row => (
          <div className="invitation-action-buttons">
            { !row.original.profile.allowFastForward &&
              <button
                onClick={() => that.handleAllowFastForward(row.original, true)}
              >
                Enable
              </button>
            }
            { row.original.profile.allowFastForward &&
              <button
                onClick={() => that.handleAllowFastForward(row.original, false)}
              >
                Disable
              </button>
            }
            
          </div>
        )
      },
      {
        Header: 'Approval',
        ...styleColumn,
        width: 150,
        Cell: row => (
          <div style={{display: 'block'}} className="invitation-action-buttons">
            <div style={{display: 'block'}} className="invite-button-group">
              {
                row.original.profile.inClasses && row.original.profile.inClasses.length > 0 && row.original.profile.inClasses.find(item => item.classId === classId).status === REGISTER_CLASS_STATUS.PENDING &&
                  <button
                    className="inviteButton inviteButton--accept"
                    onClick={() => that.handleApprove(REGISTER_CLASS_STATUS.APPROVE, row.original._id)}
                  >
                    Approve
                  </button>
              }
                  <br/>
              <button style={{marginTop: "5px"}}
                className="inviteButton inviteButton--decine"
                onClick={() => that.handleApprove(REGISTER_CLASS_STATUS.DISAPPROVE, row.original._id)}
              >
                DEL
              </button>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="teacherPageClass">
        <br/>
        <center><h2 className="teacherPageClass-title">{"Manage Class - " + classData.name}</h2></center>
        <div className="teacherPageClass--content">
          <div className="teacherPageClass--content__header" />
          <ReactTable
            NoDataComponent={() => null}
            showPagination={false}
            style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 180px)', maxHeight: 'calc(100vh - 180px)', maxWidth: 1434 }}
            pageSize={50}
            data={students}
            columns={columns}
          />
        </div>
        <AddCoinsModal
          showModal={showModal}
          userId={userId}
          fullname={fullname}
          toggleAddCoinsModal={this.handleAddCoins}
          addCoinsToUser={addCoinsToUser}
        />
        <ResetLessonModal
          showModal={showModalReset}
          resetType={myResetType}
          userId={userId}
          fullname={fullname}
          gameId={classData.game}
          toggleResetLessonModal={this.handleResetLesson}
          resetLessonForUser={resetLessonForUser}
          moveForwardLessonForUser={moveForwardLessonForUser}
        />
      </div>
    );
  }
}

ProgressPage.propTypes = {
  history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  students: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  scenarios: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  classId: PropTypes.string.isRequired,
  addCoinsToUser: PropTypes.func.isRequired,
  handleApprove: PropTypes.func.isRequired
};

ProgressPage.defaultProps = {
  history: null
};

export default ProgressPage;
