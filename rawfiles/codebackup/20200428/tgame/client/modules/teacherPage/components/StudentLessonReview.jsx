import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'react-table/react-table.css';
import AddCoinsModal from './AddCoinsModal.jsx';
import SlideModal from './SlideModal.jsx';
import CodeModal from './CodeModal.jsx';
import { REGISTER_CLASS_STATUS } from '../../../../lib/enum';
// import { SlideContent, Lessons } from '../../../../lib/collections/index.js';

class StudentLessonReview extends Component {

  state = {
    showModal: false,
    showModalSlide: false,
    showModalCode: false,
    selectedSlideId: '',
    selectedAttemptIndex: -1
  };

  showSlide = (slideId) => {
    // const { showModalSlide } = this.state;
    this.setState({
      showModalSlide: true,
      selectedSlideId: slideId
    });    
  };

  showuserCode = (slideId, attemptIndex) => {
    const { classId, student, ul, lesson, slideContent } = this.props;
    const log = ul.slideVisitLog.find(e => (e.slideId == slideId));

    const att = log.attempt[attemptIndex];
    if (att.code == "ACTION_CLICK_HINT") {
      return;
    }

    if (att.code == "ACTION_CLICK_ANSWER") {
      return;
    }
    
    this.setState({
      showModalCode: true,
      selectedSlideId: slideId,
      selectedAttemptIndex: attemptIndex
    });
  }


  hideSlide = () => {
    this.setState({
      showModalSlide: false,
      selectedSlideId: ""
    });    
  };


  hideuserCode = () => {
    this.setState({
      showModalCode: false,
      selectedSlideId: "",
      selectedAttemptIndex: -1
    });    
  };

  goBackToClass = () => {
    const { history, classId } = this.props;
    if (classId == "school") {
      history.push(`/school`);
    } else {

      history.push(`/class/${classId}`);
    }
  }

  handleRedirect = (studentId, p) => {
    const { history, classId } = this.props;
    if (p.course.includes("New)")) {
      history.push(`/newclass/${classId}/${studentId}/${p.id}`);
    } else {
      history.push(`/class/${classId}/${studentId}/${p.id}`);
    }
  };

  handleRedirectUserTest= (studentId, testId) => {
    const { history, classId } = this.props;

    history.push(`/class/${classId}/${studentId}/usertestcase_${testId}`);
  };



  handleApprove = (type, userId) => {
    const { classId, handleApprove } = this.props;

    handleApprove(type, userId, classId);
  };

  getCodeSegment = (row) => {
    if (!row.value.includes("codingresult_") && !row.value.includes("qeresult_")) return (<div></div>);
    if (row.value.includes("codingresult_")) {
      const p = row.value.split("_");
      const marks = [];
      for (let k=1; k<p.length; k++) {
        if (p[k].trim() != "") {
          marks.push(p[k]);
        }
      }
  
      return (
        <div style={{overflowX: "auto", overflowY: "hidden"}}>
        {marks.map((m, attemptIndex) => (
          <FontAwesomeIcon key={m + "-" + attemptIndex} onClick={() => this.showuserCode(row.original.slideId, attemptIndex)} style={{cursor: "pointer", marginTop: "5px", fontSize: "18px", marginRight: "5px", color: m=="times-circle" ? "red" : m == "play-circle" ? "blue" : "green"}} title={m=="times-circle" ? "failure" : m == "play-circle" ? "no test" : "success"} icon={m} />
        ))}
        </div>
      );
  
    } else {
      const p = row.value.split("_");
      const marks = [];
      for (let k=1; k<p.length; k++) {
        if (p[k].trim() != "") {
          marks.push(p[k]);
        }
      }
  
      return (
        <div style={{overflowX: "auto", overflowY: "hidden"}}>
        {marks.map((m, attemptIndex) => (
          <FontAwesomeIcon key={m + "-" + attemptIndex} onClick={() => this.showuserCode(row.original.slideId, attemptIndex)} style={{cursor: m == "question-circle" || m == "info-circle" ? "default" : "pointer", marginTop: "5px", fontSize: "18px", marginRight: "5px", color: m=="question-circle" ? "orange" : m == "info-circle" ? "blue" : m == "times-circle" ? "red" : "green"}} title={m=="question-circle" ? "check hint" : m == "info-circle" ? "check answer" : "submission"} icon={m} />
        ))}
        </div>
      );
  
    }
      // return (
      //   (
      //     <div style={{marginTop: "5px"}}>
      //       <span>{row.value.substring(row.value.indexOf("_")+1, row.value.indexOf("|"))}</span> <FontAwesomeIcon style={{color: "red"}} icon={"times"} /> <span style={{marginLeft: "5px"}}>{row.value.substring(1 + row.value.indexOf("|"))}</span> <FontAwesomeIcon style={{color: "green"}} icon={"check"} />
      //     </div>  
      //   )
      // );  
  }


  getCodeSegmentOld = (row) => {
    // console.log("row " + row.value);
      return (
          row.value.includes("codingresult_") && 
          (
            <div style={{marginTop: "5px"}}>
              <span>{row.value.substring(row.value.indexOf("_")+1, row.value.indexOf("|"))}</span> <FontAwesomeIcon style={{color: "red"}} icon={"times"} /> <span style={{marginLeft: "5px"}}>{row.value.substring(1 + row.value.indexOf("|"))}</span> <FontAwesomeIcon style={{color: "green"}} icon={"check"} />
            </div>  
          )
        );  
  }

  render() {
    const { classId, student, ul, lesson, slideContent } = this.props;
    
    const { showModal, showModalSlide, showModalCode, userId, selectedSlideId, selectedAttemptIndex } = this.state;
    const that = this;

    // for (let k=0; k<ul.slideVisitLog.length; k++) {
    //   const log = ul.slideVisitLog[k];
    //   // console.log("render  " + k + " " + log.result);
    // }
    const styleColumn = {
      style: {
        textAlign: 'left',
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'left',
      },
      headerStyle: {
        borderBottom: '1px solid white',
      }
    };
    const columns = [
      {
        Header: 'ID',
        accessor: 'seq',
        ...styleColumn,
        width: 30
      },
      {
        Header: 'Title',
        accessor: 'TITLE',
        ...styleColumn,
        width: 520
      },
      {
        Header: 'Time',
        accessor: 'openTime',
        ...styleColumn,
        width: 130,
        Cell: function(row) {
          if (row && row.value) 
            return (
              <div>
                {moment(row.value).format('MMM DD, HH:mm:ss')}
              </div>
            );
          else
            return (<div></div>);
        }
      },
      {
        Header: 'Type',
        accessor: 'TYPE',
        ...styleColumn,
        width: 120,
        Cell: function(row) {
          if (row && row.value) 
            return (
              <div>
                {
                  <button
                    className="logDetailButton"
                    onClick={() => that.showSlide(row.original.slideId)}
                  >
                    {row.value}
                  </button>
                }
              </div>
            );
          else
            return (<div></div>);
        }
      },
      {
        Header: 'Answer',
        accessor: 'result',
        // ...styleColumn,        
        style: {
          textAlign: 'left',
          display: 'flex',
          alignItems: 'left',
          justifyContent: 'left',
        },
        width: 300,
        Cell: function(row) {
          if (row && row.value && row.value != "") 
            return ( 
          
              (["Correct", "Wrong"].includes(row.value.substring(0, row.value.indexOf("_"))) &&
                (
                  <div style={{marginTop: "5px"}}>
                    <span>{row.value.substring(row.value.indexOf("_")+1)}</span> <FontAwesomeIcon style={{color: row.value.includes("Correct") ? "green" : "red" }} icon={row.value.includes("Correct") ? "check" : "times"} />
                  </div>
                )
              )
              ||
              that.getCodeSegment(row)
              //(
                //row.value.includes("codingresult_") && 
                // (
                //   <div style={{marginTop: "5px"}}>
                //     <span>{row.value.substring(row.value.indexOf("_")+1, row.value.indexOf("|"))}</span> <FontAwesomeIcon style={{color: "red"}} icon={"times"} /> <span style={{marginLeft: "5px"}}>{row.value.substring(1 + row.value.indexOf("|"))}</span> <FontAwesomeIcon style={{color: "green"}} icon={"check"} />
                //   </div>  
                // )
              //)
            );
          else
            return (<div></div>);
        }
      },
      // {
      //   Header: 'Code',
      //   accessor: 'codingresult',
      //   // ...styleColumn,        
      //   width: 200,
      //   Cell: row => row.value!= "" && (
      //     <div>
      //       <span>{row.value.substring(0, row.value.indexOf("_"))}</span> <FontAwesomeIcon style={{color: "red"}} icon={"times"} /> <span>{row.value.substring(1 + row.value.indexOf("_"))}</span> <FontAwesomeIcon style={{color: "green"}} icon={"check"} />
      //     </div>
      //   )
      // },
    ];

    let sname = student.profile.firstName + " " + student.profile.lastName;
    if (!student.profile.firstName) {
      sname = student.username;
    }

    return (
      <div className="teacherPageClass">
        <br/>
        <span className="studentViewBack logDetailButton" onClick={this.goBackToClass.bind(this)} >{"<< back to class"}</span>
        <center><h4 className="teacherPageClass-title">{sname + " - " + lesson.LessonName}</h4></center>
        <div className="teacherPageClass--content">
          <div className="teacherPageClass--content__header" />
          <ReactTable
            NoDataComponent={() => null}
            showPagination={false}
            style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 180px)', maxHeight: 'calc(100vh - 180px)', maxWidth: 1234 }}
            pageSize={50}
            data={ul.slideVisitLog}
            columns={columns}
          />
        </div>
        <SlideModal
          showModal={showModalSlide}
          ul={ul}
          student={student}
          slideFileId={lesson.slideFileId}
          slideContent={slideContent}
          selectedSlideId={selectedSlideId}
          hideSlide={this.hideSlide}
          userId={userId}
        />
        <CodeModal
          showModal={showModalCode}
          ul={ul}
          student={student}
          slideFileId={lesson.slideFileId}
          slideContent={slideContent}
          selectedSlideId={selectedSlideId}
          selectedAttemptIndex={selectedAttemptIndex}
          hideCode={this.hideuserCode}
          userId={userId}
        />

      </div>
    );
  }
}

StudentLessonReview.propTypes = {
  history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  // students: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  // scenarios: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  classId: PropTypes.string.isRequired,
  // addCoinsToUser: PropTypes.func.isRequired,
  // handleApprove: PropTypes.func.isRequired
};

StudentLessonReview.defaultProps = {
  history: null
};

export default StudentLessonReview;
