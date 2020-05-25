import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import StudentLessonReview from '../components/StudentLessonReview.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

const TypeMap = {
  "q0": "Quiz",
  "q1": "Quiz",
  "q2": "Quiz",
  "q3": "Quiz",
  "info": "Info",
  "e0": "Info",
  "e1": "Info",
  "e2": "Info",
  "e3": "Info",
  "summary": "Summary",
  "homework": "Homework",
  "coding": "Coding",
  "hint": "Hint",
  "solution": "Solution",
};

export const composer = ({ context, classId, studentId, lessonId, history }, onData) => {
  const { Collections } = context();

  if (!Meteor.userId()) {
    history.push('/signin');
    return;
  }

  const id = lessonId;
  let lesson = null;
  const user = Meteor.user();
  const userId = Meteor.userId();
  const classListHandle = Meteor.subscribe('classes.list');
  
  const p = id.split("_");
  const usertestid = p[1];
  // const handleGameItems = Meteor.subscribe('gameItem.getAll');
  if (!user) return;

  if (typeof (id) !== "undefined" && Meteor.subscribe('users.getListStudents', [studentId]).ready()  && classListHandle.ready() && Meteor.subscribe('alllessonlist').ready()  ) {
    const c = Collections.Classes.findOne({ _id: classId, owner: Meteor.userId() });

    if (!["kEmnDrYssC2gKNDxx"].includes(userId) && !c.users.includes(studentId)) {
      console.log("you are not teacher of this student " + studentId);
      history.push(`/teacher`);
      return;
    }

    // get one student info
    const student = Meteor.users.findOne(
      {
        _id: studentId
      },
      {
        fields: {
          username: 1,
          'tutorial.id': 1,
          'tutorial.progress': 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
          'profile.coins': 1,
          'profile.inClasses': 1,
          'profile.grade': 1
        }
      }
    );


    lesson = Collections.Lessons.findOne({ _id: id });
    if (!lesson) {
      history.push(`/class/${classId}`);
      return;
    }

    const slideContentHandle = Meteor.subscribe('AllSlideContent', lesson.slideFileId);
    const userlessonHandle = Meteor.subscribe('AllUserLesson', lessonId, studentId);

    if (slideContentHandle.ready() && userlessonHandle.ready() ) {
      const slideContent = Collections.SlideContent.findOne({_id: lesson.slideFileId})

      const ul = Collections.UserLesson.findOne({userId: studentId, lessonId});
      if (!ul) {
        console.log("userlesson not found " + studentId + " " + lessonId)
        history.push(`/class/${classId}`);
        return;
      }
  
      // add lesson slide info into ul
      let count = 0;
      for (let k=0; k<ul.slideVisitLog.length; k++) {
        const log = ul.slideVisitLog[k];
        for (let j=0; j<slideContent.slideInfo.length; j++) {
          if (slideContent.slideInfo[j].ID == log.slideId) {
            log.TITLE = slideContent.slideInfo[j].TITLE;
            log.seq = count ++;
            
            log.TYPE = slideContent.slideInfo[j].TYPE;
            if (TypeMap[log.TYPE]) {
              log.TYPE = TypeMap[log.TYPE];
            }
            log.result = "";
            
            if (log.TYPE == "Quiz" && log.input && log.input != "") {
              if (log.answer == log.input) {
                log.result = "Correct_" + log.input;
              } else {
                log.result = "Wrong_" + log.input;
              }
            //} else if (["Coding", "Hint", "Solution"].includes(log.TYPE)) {
            } else if (log.TYPE !== "input" && log.attempt && log.attempt.length > 0) {
              // if (log.TYPE == "Hint" ) console.log("coding log " + JSON.stringify(log));
              if (true) {
                let failCount = 0;
                let passCount = 0;
                let playCount = 0;
                log.result = "codingresult_";
                for (let x=0; x<log.attempt.length; x++) {
                  if (!log.attempt[x].result) continue;
                  if (log.attempt[x].result.toLowerCase().includes("fail") || log.attempt[x].result.toLowerCase().includes("please call") || log.attempt[x].result.toLowerCase().includes("error")) {
                    // failCount ++;
                    log.result += "times-circle_";
                  } else if (log.attempt[x].result.toLowerCase().includes("test passed")) {
                    // passCount ++;
                    log.result += "check-circle_";
                  } else {
                    playCount ++;
                    log.result += "play-circle_";
                  }                
                }
                
              }
            } else if (log.TYPE == "input" && log.attempt && log.attempt.length > 0) {
              // quick exercise
              if (true) {
                log.result = "qeresult_";
                for (let x=0; x<log.attempt.length; x++) {
                  if (log.attempt[x].code == "ACTION_CLICK_HINT") {
                    log.result += "question-circle_";
                  } else if (log.attempt[x].code == "ACTION_CLICK_ANSWER") {
                    // passCount ++;
                    log.result += "info-circle_";
                  } else {
                    let isLastAttempt = false;
                    if (k < ul.slideVisitLog.length-1) {
                      if (x == log.attempt.length-1) {
                        isLastAttempt = true;
                      }
                    }
                    
                    if (log.attempt[x].result == "success" || isLastAttempt) {
                      log.result += "check-circle_";
                    } else {
                      //log.result += "play-circle_";
                      log.result += "times-circle_";
                    }
                  }                
                }
                
              }
            }
            // console.log("log result " + k + " " + log.result);
            break;
          }
        }
      }
  
      onData(null, { lesson, ul, student, slideContent });
  
    }

  }
};

export const depsMapper = (context, actions) => {
  return ({
    context: () => context,
    addCoinsToUser: actions.teacherPage.addCoinsToUser,
    resetLessonForUser: actions.teacherPage.resetLessonForUser,
    handleApprove: actions.teacherPage.handleApprove
  });
};

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper),
)(StudentLessonReview);
