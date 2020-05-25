import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import AddCoinsModal from './AddCoinsModal.jsx';
import ResetLessonModal from './ResetLessonModal.jsx';
import SearchBox from '../../lessonpage/components/SearchBox.jsx';
// import Impersonate from 'impersonate';

import { REGISTER_CLASS_STATUS } from '../../../../lib/enum';
import { SlideContent, Lessons } from '../../../../lib/collections/index.js';

class ProgressPage extends Component {

  state = {
    showModal: false,
    showModalReset: false,
    myResetType: 0,
    userId: '',
    fullname: '',
    studentKeyword: ''
  };

  componentDidMount() {
    $("#mainDiv > div > center > span > div > i.fa.fa-search").hide();
  }

  handleRedirect = (studentId, p) => {
    const { history, classId } = this.props;
    if (p.progress > 0 || p.progress == -1) {
      if (!p.course.includes("Old)")) {
        history.push(`/newclass/school/${studentId}/${p.id}`);
      } else {
        history.push(`/class/school/${studentId}/${p.id}`);
      }
    }
  };

  handleRedirectUserTest= (studentId, testId) => {
    const { history, classId } = this.props;

    history.push(`/class/${classId}/${studentId}/usertestcase_${testId}`);
  };

  doImpersonate = (user, newv) => {

    if (newv) {
      Impersonate.do(user._id, function(err, userId) {
        if (err) return;
        console.log("You are now impersonating user " + userId);
      });
    } else {
      // Impersonate.undo(function(err, userId) {
      //   if (err) return;
      //   console.log("Impersonating no more, welcome back #" + userId);
      // })
    }
  }

  setGrandFather = (user, newv) => {
    Meteor.call('setGrandFathered', user._id, newv);
  }

  setViewSchool = (user, newv) => {
    Meteor.call('setCanViewSchool', user._id, newv);
  }

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

  resetPassword = (user, allow) => {
    Meteor.call('resetUserPassword', user._id);
  };

  verifyEmail = (user, allow) => {
    Meteor.call('doVerifyEmail', user._id, true);
  };

  handlestudentKeywordChange = value => {
    this.setState({ studentKeyword: value });
  }

  render() {
    const { students, scenarios, moveForwardLessonForUser, classData, addCoinsToUser, resetLessonForUser, classId } = this.props;
    const { showModal, myResetType, showModalReset, userId, fullname, studentKeyword } = this.state;
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
    
    const styleColumnWrap = {
      style: {
        textAlign: 'center',
        wrap: 'wrap',
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
        Header: 'Email',
        accessor: 'email',
        ...styleColumn,
        width: 100,
      },
      {
        Header: 'ID',
        accessor: '_id',
        ...styleColumnWrap,
        width: 50,
      },
      {
        Header: 'Grade',
        accessor: 'profile.grade',
        ...styleColumn,
        width: 60,
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
        width: 120,
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
                            //(100*(1-  typeof(p.progress) == "undefined" ? 100 : Math.max(0.05, p.progress)));
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
        width: 80,
        Cell: row => (
          <div className="level__info__coin2">
            <img src="/images/coin.png" style={{width: "18px", height: "18px"}} alt="" />
            <span>{row.value}</span>
          </div>
        )
      },
      {
        Header: 'Reward',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">
            <button
              onClick={
                () => this.handleAddCoins(row.original)
              }
            >
              Add
            </button>
          </div>
        )
      },
      {
        Header: 'Veri Email',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">
              <button
                onClick={() => that.verifyEmail(row.original, true)}
              >
                Enable
              </button>
          </div>
        )
      },
      {
        Header: 'Reset Password',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">
              <button
                onClick={() => that.resetPassword(row.original)}
              >
                12345678
              </button>
          </div>
        )
      },
      {
        Header: 'Fast Mode',
        ...styleColumn,
        width: 80,
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
        Header: 'Imper',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">

<table>
  <tbody>
  <tr>
    <td>
    <button
              onClick={() => this.doImpersonate(row.original, true)}
            >
              Do
            </button>
      
    </td>
  </tr>
  <tr>
    <td>
      
    <button
              onClick={() => this.doImpersonate(row.original, false)}
            >
              Undo
            </button>
            
      
    </td>
  </tr>
  </tbody>
</table>

          </div>
        )
      },


      {
        Header: 'GrandF',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">

<table>
  <tbody>
  <tr>
    <td>
    {"" + row.original.isGrandfathered}

    </td>
  </tr>

  <tr>
    <td>
    <button
              onClick={() => this.setGrandFather(row.original, true)}
            >
              Allow
            </button>
      
    </td>
  </tr>
  <tr>
    <td>
      
    <button
              onClick={() => this.setGrandFather(row.original, false)}
            >
              Deny
            </button>
            
      
    </td>
  </tr>
  </tbody>
</table>

          </div>
        )
      },

      {
        Header: 'School',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div className="invitation-action-buttons">

<table>
  <tbody>
  <tr>
    <td>
    {"" + row.original.canViewSchool}

    </td>
  </tr>

  <tr>
    <td>
    <button
              onClick={() => this.setViewSchool(row.original, true)}
            >
              Allow
            </button>
      
    </td>
  </tr>
  <tr>
    <td>
      
    <button
              onClick={() => this.setViewSchool(row.original, false)}
            >
              Deny
            </button>
            
      
    </td>
  </tr>
  </tbody>
</table>

          </div>
        )
      },


      {
        Header: 'Lesson',
        ...styleColumn,
        width: 80,
        Cell: row => (
          <div style={{display: 'block'}} className="invitation-action-buttons">



<table>
  <tbody>
  <tr>
    <td>

      


    <button
              onClick={() => this.handleResetLesson(row.original)}
            >
              Reset
            </button>
    </td>
  </tr>
  <tr>
    <td>
      

    <button style={{marginTop: "5px"}}
              onClick={() => that.handleResetLesson(row.original, 2)}
            >
              Forward
            </button>        
            
      
    </td>
  </tr>
  </tbody>
</table>








    
          </div>
        )
      },
      // {
      //   Header: 'Action',
      //   ...styleColumn,
      //   width: 150,
      //   Cell: row => (
      //     <div className="invitation-action-buttons">
      //       <div className="invite-button-group">
      //         {
      //           row.original.profile.inClasses.find(item => item.classId === classId).status === REGISTER_CLASS_STATUS.PENDING &&
      //             <button
      //               className="inviteButton inviteButton--accept"
      //               onClick={() => this.handleApprove(REGISTER_CLASS_STATUS.APPROVE, row.original._id)}
      //             >
      //               Approve
      //             </button>
      //         }
      //         <button
      //           className="inviteButton inviteButton--decine"
      //           onClick={() => this.handleApprove(REGISTER_CLASS_STATUS.DISAPPROVE, row.original._id)}
      //         >
      //           DEL
      //         </button>
      //       </div>
      //     </div>
      //   )
      // }
    ];

    let ss = students;
    if (studentKeyword != '') {
      const grades = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'g10', 'g11', 'g12', 'g13'];
      if (grades.includes(studentKeyword)) {
        const grade = Number(studentKeyword.substr(1));
        ss = students.filter(s => s.profile && s.profile.grade && s.profile.grade == grade );
      } else {
        ss = students.filter(s => (s.emails && s.emails[0] && s.emails[0].address && s.emails[0].address.toLowerCase().includes(studentKeyword.toLowerCase())) || (s.username && s.username.toLowerCase().includes(studentKeyword.toLowerCase())) || (s.profile && s.profile.firstName && s.profile.firstName.toLowerCase().includes(studentKeyword.toLowerCase())) || (s.profile && s.profile.lastName && s.profile.lastName.toLowerCase().includes(studentKeyword.toLowerCase())) );
      }
    }

    // new lesson only??
    // ss = ss.filter(function(s) {
    //   let found = false;
    //   for (let k=0; k<s.tutorial.length; k++) {
    //     const t= s.tutorial[k];
    //     if (t.id.charAt(0) == "L") {
    //       found = true;
    //       break;
    //     }
    //   }
    //   return found;
    // });

    return (
      <div className="teacherPageClass">
        <center>
          {/* <h2 className="teacherPageClass-title">{"School View"}</h2> */}
          <div style={{padding: "10px"}}>
            <span style={{marginTop: "1px"}}> search by name or username; use "gX" for grade search </span> 
            <span>{ss.length + "/" + students.length}</span>
          </div>
          <span className="search_chat_history_container">
            <SearchBox onChange={this.handlestudentKeywordChange} />
          </span>
          
        </center>
       
        <div className="teacherPageClass--content">
          <div className="teacherPageClass--content__header" />
          <ReactTable
            NoDataComponent={() => null}
            showPagination={false}
            style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 180px)', maxHeight: 'calc(100vh - 180px)', maxWidth: 1234 }}
            pageSize={50}
            data={ss}
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
  addCoinsToUser: PropTypes.func.isRequired,
  handleApprove: PropTypes.func.isRequired
};

ProgressPage.defaultProps = {
  history: null
};

export default ProgressPage;
