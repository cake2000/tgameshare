
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
import { Number } from 'es6-shim';
import _ from 'lodash';
import { UserChat, UserLesson, Lessons, TBotQA, Scenarios, UserScenarios, UserRobotCodeByLesson, UserRobotCode, TBotIssue, Languages, SlideContent } from '../../lib/collections';
import { USER_TYPES } from '../../lib/enum';

const acorn = require("acorn");

const AllQuizTypes = ["quiz", "q0", "q1", "q2", "q3", "coding", "survey", "input"];
const QuizTypes = ["q0","q1","q2","q3"];
const ExampleTypes = ["e0","e1","e2","e3"];

const dmp = DiffMatchPatch.DiffMatchPatch;

const userHasVisitedSlideBefore = function(allLogs, slideId) {
  if (["ourgoal", "welcome"].includes(slideId)) return false;
  for (let k=0; k<allLogs.length; k++) {
    const vlogs = allLogs[k].slideVisitLog;
    for (let j=0; j<vlogs.length; j++) {
      if (vlogs[j].slideId == slideId) {
        return true;
      }
    }
  }
  return false;
}

const getPatch = function(oldv, newv) {
  // console.log("\n\n\n get patch\n");
  // console.log("old is " + oldv);
  // console.log("new is " + newv);

  const diff = dmp.diff_main(oldv, newv, true);

  if (diff.length > 2) {
    dmp.diff_cleanupSemantic(diff);
  }
  const patchList = dmp.patch_make(oldv, newv, diff);
  const patchText = dmp.patch_toText(patchList);

  return patchText;
};

const htmlparser = require("htmlparser2");


const USER_LEVELS = {
  SLOW: 0,
  AVERAGE: 1,
  FAST: 2
};

const getUserGrade = function(user) {
  console.log("getUserGrade: " + user.profile.grade + " " + user.profile.gradeAsOfDate);
  const years = Math.floor((Date.now() - user.profile.gradeAsOfDate)/(365 * 1000*60*60*24) ) ;
  const gradeNow = user.profile.grade + years;
  const todayMonth = (new Date()).getMonth();
  const gradeAsOfMonth = (new Date(user.profile.gradeAsOfDate)).getMonth();
  if (todayMonth >= 8 && gradeAsOfMonth <= 8) {
    return gradeNow + 1;
  } else {
    return gradeNow;
  }
}

const getUserLevel = function() {
  return USER_LEVELS.AVERAGE;
  const user = Meteor.user();
  const currentGrade = getUserGrade(user);
  const userExperience = user.javascriptlevel ? user.javascriptlevel.toUpperCase() : "NONE";
  console.log("getUserLevel " + currentGrade + " " + userExperience + " ");
  if (userExperience == "SOME" && currentGrade >= 8 ) {
    return USER_LEVELS.FAST;
  } else if (userExperience == "NONE" && currentGrade <= 6 ) {
    return USER_LEVELS.SLOW;
  } else {
    return USER_LEVELS.AVERAGE;
  }

}

const getNextNodeStart = function(slideContent, startK = 0) {
  // console.log("getNextNodeStart from " + startK);
  const slide = slideContent.slideInfo[startK];
  for (let j=startK+1; j<slideContent.slideInfo.length; j++) {
    const ns = slideContent.slideInfo[j];
    // console.log("j " + j + " " + ns.NODE + " " + ns.TYPE);
    if (slide.NODE !== ns.NODE) {
      return ns;
    }
  }
  // console.log("return null ");
  return null;
}

const getFirstExampleOrQuizSlideInNode = function(slideContent, startK, typelevel) {
  // console.log("find next item at level " + typelevel);
  const slide = slideContent.slideInfo[startK];
  const quizType = "q" + typelevel;
  const exampleType = "e" + typelevel;
  for (let j=0; j<slideContent.slideInfo.length; j++) {
    const ns = slideContent.slideInfo[j];
    // console.log("j " + j + " " + ns.NODE + " " + ns.TYPE);
    if (slide.NODE == ns.NODE && (ns.TYPE == quizType || ns.TYPE == exampleType) ) {
      // console.log("found node " + ns.ID + " " + ns.TYPE);
      return ns;
    }
  }
  // console.log("return null " + typelevel);
  return null;
}

// out of how many questions in this quiz group, how many correct
const getUserQuizResult = function(ul) {
  // console.log("getUserQuizResult " + ul.currentSlideId);
  for (let j=0; j<ul.slideVisitLog.length; j++) {
    if (ul.slideVisitLog[j].slideId == ul.currentSlideId) {
      const log = ul.slideVisitLog[j];
      let totalQs = 0;
      let correctQs = 0;
      for (let k=j; k>=0; k--) {
        const log2 = ul.slideVisitLog[k];
        if (log2.slideType == log.slideType && log2.slideNode == log.slideNode) {
          totalQs ++;
          if (log2.answer == log2.input) {
            correctQs ++;
          }
        }
      }

      return {
        totalQs, correctQs
      };
    }
  }

  console.log("error getting user quiz result");

  return {
    totalQs: 0, correctQs: 0
  };
}

export default function () {
  Meteor.methods({
    getSlideContent(slideId) {
      check(slideId, String);
      // console.log("inside called getSlideContent " + slideId);
      const slideContent = SlideContent.findOne({_id: slideId});
      if (!slideContent) {
        return `<html><body>Slide with id ${slideId} is not found! </body></html>`;
      }
      return slideContent.content;
      // return "<html><body>hello2</body></html>";
    },

    jumpToPrevSlide(ulID, newIndex) {
      check(ulID, String);
      check(newIndex, Number);
      // console.log("in jumpToPrevSlide " + ulID + " " + newIndex );
      if (!Meteor.user()) {
        console.log("jumpToPrevSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("jumpToPrevSlide can't find userlesson!");
        return;
      }
      // const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      // const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});

      UserLesson.update({_id: ulID}, {$set: {
        currentSlideId: ul.slideVisitLog[newIndex].slideId
      }});
    },

    resetCurrentSlideProgress(ulID) {
      check(ulID, String);
      if (!Meteor.user()) {
        console.log("resetCurrentSlideProgress user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("resetCurrentSlideProgress can't find userlesson!");
        return;
      }

    },

    gotoLatestVisitedSlide(ulID) {
      check(ulID, String);
      // console.log("in gotoLatestVisitedSlide " + ulID );
      if (!Meteor.user()) {
        console.log("gotoLatestVisitedSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("gotoLatestVisitedSlide can't find userlesson!");
        return;
      }

      // console.log("ul.lessonId " + ul.lessonId + " ul.currentSlideId " + ul.currentSlideId);
      const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      // console.log("slideContent " + lesson.slideFileId);
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});
      const slideIds = [];
      for (let k=0; k < slideContent.slideInfo.length; k++) {
        slideIds.push(slideContent.slideInfo[k].ID);
      }
      // console.log("slideIds " + JSON.stringify(slideIds));
      let newCurId = slideIds[0];
      let beforeProblemId = false;
      for (let k=ul.slideVisitLog.length - 1; k >= 0; k--) {
        const log = ul.slideVisitLog[k];
        if (log.slideId == ul.currentSlideId) {
          beforeProblemId = true;
          continue;
        }
        if (beforeProblemId) {
          if ( slideIds.includes(log.slideId) ) {
            newCurId = log.slideId; break;
          }
        }
      }
      // console.log("newCurId " + newCurId);

      // UserLesson.update(
      //   {_id: ulID },
      //   { $pull: { slideVisitLog: { slideId: ul.currentSlideId } } },
      // );

      // Meteor.defer(() => {
        UserLesson.update({_id: ulID}, {$set: {
          currentSlideId: newCurId
        }});
      // });

    },


    gotoFirstSlide(ulID) {
      check(ulID, String);
      // console.log("in gotoFirstSlide " + ulID );
      if (!Meteor.user()) {
        console.log("gotoFirstSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("gotoFirstSlide can't find userlesson!");
        return;
      }

      // const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      // const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});

      UserLesson.update({_id: ulID}, {$set: {
        currentSlideId: ul.slideVisitLog[0].slideId
      }});
    },

    goToLast(ulID) {
      check(ulID, String);
      // console.log("in goToLast " + ulID );
      if (!Meteor.user()) {
        console.log("goToLast user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("goToLast can't find userlesson!");
        return;
      }
      // const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      // const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});
      UserLesson.update({_id: ulID}, {$set: {
        currentSlideId: ul.slideVisitLog[ul.slideVisitLog.length-1].slideId
      }});
    },

    jumpToNextSlide(ulID) {
      check(ulID, String);
      // console.log("in jumpToNextSlide " + ulID );
      if (!Meteor.user()) {
        console.log("jumpToNextSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("jumpToNextSlide can't find userlesson!");
        return;
      }

      const log = ul.slideVisitLog.find(e => (e.slideId == ul.currentSlideId));
      if ( AllQuizTypes.includes(log.slideType) && !log.completed) {
        console.log("jumpToNextSlide: can't skip");
        return;
      }

      const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});


      // find user visited latest slide in slide content
      for (let k=0; k < slideContent.slideInfo.length - 1; k++) {
        const slide = slideContent.slideInfo[k];
        if (slide.ID == ul.currentSlideId) {
          console.log("found current slide " + slide.ID);
          let slide2 = slideContent.slideInfo[k+1];
          // skip school grade

          // if we have already been here before, then go there
          for (let j=1; j<ul.slideVisitLog.length; j++) {
            if (ul.slideVisitLog[j].slideId == slide2.ID) {
              UserLesson.update({_id: ulID}, {$set: {
                currentSlideId: slide2.ID
              }});
              return;
            }
          }


          UserLesson.update({_id: ulID}, {
            $set: {
              currentSlideId: slide2.ID
            },
            $push:{
              slideVisitLog: {
                slideId: slide2.ID,
                slideType: slide2.TYPE.toLowerCase(),
                slideNode: slide2.NODE,
                autoTrigger: false,
                skipped: false,
                openTime: new Date()
              }
            }
          });
        }
      }
    },

    jumpToNextQuiz(ulID) {
      check(ulID, String);
      // console.log("in jumpToNextQuiz " + ulID );
      if (!Meteor.user()) {
        console.log("jumpToNextQuiz user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("jumpToNextQuiz can't find userlesson!");
        return;
      }

      const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});

      const latestUL = ul.slideVisitLog[ul.slideVisitLog.length-1];
      if ( AllQuizTypes.includes(latestUL.slideType.toLowerCase()) && !latestUL.completed) {
        console.log("last ul is not completed yet " + latestUL.slideId);
        UserLesson.update({_id: ulID}, {$set: {
          currentSlideId: latestUL.slideId
        }});
        return;
      }

      // find user visited latest slide in slide content
      for (let k=0; k < slideContent.slideInfo.length; k++) {
        const slide = slideContent.slideInfo[k];
        if (slide.ID == latestUL.slideId) {
          console.log("found latest visited slide " + slide.ID);

          // then find next quiz or coding slide and jump there, marking all middle slides as skipped
          for (let x=k+1; x < slideContent.slideInfo.length; x++) {
            const slide2 = slideContent.slideInfo[x];
            console.log("slide2 at " + x + " is " + JSON.stringify(slide2));

            if (slide2.ID == "summary" || AllQuizTypes.includes(slide2.TYPE.toLowerCase())) {
              console.log("found end at " + x);
              UserLesson.update({_id: ulID}, {
                $push:{
                  slideVisitLog: {
                    slideId: slide2.ID,
                    slideType: slide2.TYPE.toLowerCase(),
                    slideNode: slide2.NODE,
                    autoTrigger: false,
                    skipped: false,
                    openTime: new Date()
                  }
                }
              });
              console.log("found end attt " + x);
              UserLesson.update({_id: ulID}, {$set: {
                currentSlideId: slide2.ID
              }});
              return;
            } else {
              console.log("skipped  " + x);
              UserLesson.update({_id: ulID}, {
                $push:{
                  slideVisitLog: {
                    slideId: slide2.ID,
                    slideType: slide2.TYPE.toLowerCase(),
                    slideNode: slide2.NODE,
                    autoTrigger: false,
                    skipped: true,
                    openTime: new Date()
                  }
                }
              });
            }
          }
        }
      }
    },

    // no jumping, simple navigation through slideVisitLog
    gotoPrevSlide(ulID) {
      check(ulID, String);
      // console.log("in gotoPrevSlide " + ulID );
      if (!Meteor.user()) {
        console.log("gotoPrevSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("gotoPrevSlide can't find userlesson!");
        return;
      }

      for (let j=1; j<ul.slideVisitLog.length; j++) {
        if (ul.slideVisitLog[j].slideId == ul.currentSlideId) {
          UserLesson.update({_id: ulID}, {$set: {
            currentSlideId: ul.slideVisitLog[j-1].slideId
          }});
          return;
        }
      }

      // const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      // const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});

      // for (let k=1; k < slideContent.slideInfo.length; k++) {
      //   const slide = slideContent.slideInfo[k];
      //   if (slide.ID == ul.currentSlideId) {
      //     console.log("gotoPrevSlide found current " + ul.currentSlideId + " so prev is " + slideContent.slideInfo[k-1].ID);
      //     UserLesson.update({_id: ulID}, {$set: {
      //       currentSlideId: slideContent.slideInfo[k-1].ID
      //     }});
      //     return;
      //   }
      // }
      // done or not found, so do nothing for now!
      console.log("gotoPrevSlide: no slide found!");
    },

    gotoBilingualTimeSlide(ulID, localeSelected) {
      check(ulID, String);
      // check(isAuto, Boolean);
      check(localeSelected, String);

      console.log("in gotoNextSlide " + ulID + " localeSelected " + localeSelected );
      const user = Meteor.user();
      if (!user) {
        console.log("gotoBilingualTimeSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("gotoBilingualTimeSlide can't find userlesson!");
        return;
      }

      console.log("gotoBilingualTimeSlide  current " + ul.currentSlideId);

      // need to start a new slide!
      const userId = Meteor.userId();
      const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});
      const allLogs = UserLesson.find({
        userId, lessonId: {$ne: lesson._id}
      }, {fields: {
        lessonId: 1, 'slideVisitLog.slideId': 1, 'slideVisitLog.slideType': 1
      }}).fetch();



      for (let k=0; k < slideContent.slideInfo.length-1; k++) {
        const slide = slideContent.slideInfo[k];
        if (slide.ID == ul.currentSlideId) {
          console.log("gotoBilingualTimeSlide found current " + ul.currentSlideId + " so next is " + slideContent.slideInfo[k+1].ID);

          // by default new slide is next slide
          let newSlide = slideContent.slideInfo[k+1];


          slide.TYPE = slide.TYPE.toLowerCase();
          newSlide.TYPE = newSlide.TYPE.toLowerCase();
          console.log("current slide type " + slide.TYPE + " newslide type " + newSlide.TYPE);
          if (true) {

            for (let r=k+1; r < slideContent.slideInfo.length-1; r++) {
              const ss = slideContent.slideInfo[r];
              console.log("checking slide r " + r + " type " + ss.TYPE + " id " + ss.ID);
              if (ss.ID == ul.currentSlideId + "_" + localeSelected) {
                newSlide = ss; break;
              }
            }
          }

          // do we need to add a new log or reuse existing?
          let currentLog = null;
          let currentPos = -1;
          for (let j=0; j<ul.slideVisitLog.length; j++) {
            if (ul.slideVisitLog[j].slideId == slide.ID) {
              currentLog = ul.slideVisitLog[j];
              currentPos = j;
            }
            if (ul.slideVisitLog[j].slideId == newSlide.ID) {
              // console.log("we've been to that next slide before! " + j + " " + newSlide.ID);
              UserLesson.update({_id: ulID}, {$set: {
                currentSlideId: newSlide.ID
              }});
              return;
            }
          }

          // console.log("update current to new id " + newSlide.ID);
          // need to add
          UserLesson.update({_id: ulID}, {
            $set: {
              currentSlideId: newSlide.ID
            },
            $push:{
              slideVisitLog: {
                $each: [ {
                  slideId: newSlide.ID,
                  slideType: newSlide.TYPE.toLowerCase(),
                  slideNode: newSlide.NODE,
                  autoTrigger: true,
                  skipped: false,
                  attempt: [],
                  openTime: new Date()
                } ],
                $position: currentPos+1
             }
            }
          });
          // UserLesson.update({_id: ulID}, {$set: {
          //   currentSlideId: newSlide.ID
          // }});
          return;
        }
      }
      // done or not found, so do nothing for now!
      // console.log("gotoNextSlide: no slide found!");
    },

    // main function to control slide flow!
    gotoNextSlide(ulID, okToShowHint) {
      check(ulID, String);
      // check(isAuto, Boolean);
      check(okToShowHint, Boolean);

      // console.log("in gotoNextSlide " + ulID + " okToShowHint " + okToShowHint );
      const user = Meteor.user();
      if (!user) {
        console.log("gotoNextSlide user not found");
        return;
      }
      // finished current user slide as usual!
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("gotoNextSlide can't find userlesson!");
        return;
      }

      // if (!isAuto) {
      //   for (let j=0; j<ul.slideVisitLog.length-1; j++) {
      //     if (ul.slideVisitLog[j].slideId == ul.currentSlideId) {
      //       UserLesson.update({_id: ulID}, {$set: {
      //         currentSlideId: ul.slideVisitLog[j+1].slideId
      //       }});
      //       return;
      //     }
      //   }
      //   return;
      // }

      // console.log("gotoNextSlide  current " + ul.currentSlideId);

      // need to start a new slide!
      const userId = Meteor.userId();
      const lesson = Lessons.findOne({ _id: ul.lessonId }, {fields: {'slideFileId': 1}});
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId}, {fields: {'slideInfo': 1}});
      const allLogs = UserLesson.find({
        userId, lessonId: {$ne: lesson._id}
      }, {fields: {
        lessonId: 1, 'slideVisitLog.slideId': 1, 'slideVisitLog.slideType': 1
      }}).fetch();



      for (let k=0; k < slideContent.slideInfo.length-1; k++) {
        const slide = slideContent.slideInfo[k];
        if (slide.ID == ul.currentSlideId) {
          // console.log("gotoNextSlide found current " + ul.currentSlideId + " so next is " + slideContent.slideInfo[k+1].ID);
          if (slide.TYPE == "endoflesson") {
            return;
          }

          // by default new slide is next slide
          let newSlide = slideContent.slideInfo[k+1];
          // console.log("current slide type " + slide.TYPE + " newslide type " + newSlide.TYPE);

          slide.TYPE = slide.TYPE.toLowerCase();
          newSlide.TYPE = newSlide.TYPE.toLowerCase();
          // console.log("slide " + JSON.stringify(slide));
          // console.log("newSlide " + JSON.stringify(newSlide));
          // console.log("current slide type " + slide.TYPE + " id " + slide.ID + " newslide type " + newSlide.TYPE + " id " + newSlide.ID);
          if (QuizTypes.includes(slide.TYPE) ) {
            if (slide.TYPE == newSlide.TYPE) {
              // still in same quiz group, just continue
            } else {
              // end of current quiz group, need to decide where to go next based on performance and user level
              // const userLevel = getUserLevel();
              // const userQuizResult = getUserQuizResult(ul);

              newSlide = getNextNodeStart(slideContent, k);
            }
          } else if (slide.NODE == "bilingualtime") {
            newSlide = getNextNodeStart(slideContent, k);
          } else {

            for (let r=k+1; r < slideContent.slideInfo.length-1; r++) {
              const ss = slideContent.slideInfo[r];
              // console.log("checking slide r " + r + " type " + ss.TYPE + " id " + ss.ID);
              if (ss.TYPE.toLowerCase() == "hint") {
                if (okToShowHint) {
                  // console.log("aa updating newSlide to " + ss.ID);
                  newSlide = ss;
                  break;
                } else {
                  // skip
                }
              } else if (ss.TYPE.toLowerCase() == "coding" && ss.NODE == "extracredit" ) {
                if (okToShowHint) {
                  // console.log("bb updating newSlide to " + ss.ID);
                  newSlide = ss;
                  break;
                } else {
                  // skip
                  break;
                }
              } else {
                // check for skipping survey!
                if (ss.ID == 'schoolgrade') {
                  if (user.profile.grade)
                    continue;
                }
                // console.log("cc updating newSlide to " + ss.ID);
                newSlide = ss; break;
              }
            }
          }

          // console.log("newSlide is " + newSlide.ID);

          // do we need to add a new log or reuse existing?
          let currentLog = null;
          let currentPos = -1;
          for (let j=0; j<ul.slideVisitLog.length; j++) {
            if (ul.slideVisitLog[j].slideId == slide.ID) {
              currentLog = ul.slideVisitLog[j];
              currentPos = j;
            }
            if (ul.slideVisitLog[j].slideId == newSlide.ID) {
              // console.log("we've been to that next slide before! " + j + " " + newSlide.ID);
              UserLesson.update({_id: ulID}, {$set: {
                currentSlideId: newSlide.ID
              }});
              return;
            }
          }

          const isLastSlide = currentLog.slideId == ul.slideVisitLog[ul.slideVisitLog.length-1].slideId;


          // going into a new slide
          // console.log("showing a new hint? " + okToShowHint);
          if (isLastSlide && !okToShowHint && AllQuizTypes.includes(currentLog.slideType.toLowerCase()) && !currentLog.completed) {
            // reject it!



            if (userHasVisitedSlideBefore(allLogs, currentLog.slideId) || user._id == "ScDM5NzhdHgyyHsYw" ||  user._id == "kEmnDrYssC2gKNDxx" || user.profile.allowFastForward ||  currentLog.slideType.toLowerCase() == "coding" && currentLog.slideNode == "extracredit") {
              // ok to skip for extra credit slide!
            } else {
              console.log("current slide not completed so reject " + currentLog.slideType.toLowerCase() + " " + currentLog.slideNode);
              return;
            }
          }

          // console.log("update current to new id " + newSlide.ID);
          // need to add
          UserLesson.update({_id: ulID}, {
            $set: {
              currentSlideId: newSlide.ID
            },
            $push:{
              slideVisitLog: {
                $each: [ {
                  slideId: newSlide.ID,
                  slideType: newSlide.TYPE.toLowerCase(),
                  slideNode: newSlide.NODE,
                  autoTrigger: true,
                  skipped: false,
                  attempt: [],
                  openTime: new Date()
                } ],
                $position: currentPos+1
             }
            }
          });
          // UserLesson.update({_id: ulID}, {$set: {
          //   currentSlideId: newSlide.ID
          // }});
          return;
        }
      }
      // done or not found, so do nothing for now!
      // console.log("gotoNextSlide: no slide found!");
    },

    handleHintButtonClick(ulID) {
      check(ulID, String);
      // console.log("in handleHintButtonClick " + ulID );
      Meteor.call("gotoNextSlide", ulID, true);
    },


    autoPlayNextSlide(ulID) {
      check(ulID, String);
      // console.log("in autoPlayNextSlide " + ulID );
      Meteor.call("gotoNextSlide", ulID, false);
    },

    doAwardCoins(award) {
      check(award, Number);
      const userId = Meteor.userId();
      console.log("do award coins " + award );
      Meteor.users.update({_id: userId}, {$inc: {'profile.coins': award}}); // increase 10 coins for quiz!
    },

    setTestPassed(ulID, award, passingSlideId) {
      check(ulID, String);
      check(award, Number);
      check(passingSlideId, String);
      // console.log("in setTestPassed " + ulID + " " + award);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("setTestPassed user id is null");
        return;
      }
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("setTestPassed can't find userlesson!");
        return;
      }

      // set this slide to be completed for this user
      // console.log("setTestPassed for slide Id " + ul.currentSlideId);
      for (let j=0; j<ul.slideVisitLog.length; j++) {
        // console.log("j's Id " + ul.slideVisitLog[j].slideId);
        if (ul.slideVisitLog[j].slideId == passingSlideId) {

          let ind = 'slideVisitLog.' + (j) + ".completed";
          if (ul.slideVisitLog[j].slideType.toLowerCase() !== "coding" && ul.slideVisitLog[j].slideType.toLowerCase() !== "endoflesson") {
            // hint or solution slide
            // set first slide for the same node as completed
            for (let k=j-1; k>=0; k--) {
              // console.log("slideType for " + k + " " + ul.slideVisitLog[k].slideType.toLowerCase());
              if (ul.slideVisitLog[k].slideType.toLowerCase() == "coding") {
                ind = 'slideVisitLog.' + (k) + ".completed";
                break;
              }
            }
          }
          // console.log("setTestPassed ind is " + ind);
          const opt = {};
          opt[ind] = true;
          opt[ind+"Time"] = new Date();
          UserLesson.update({_id: ulID}, {$set: opt});

          if (award > 0) {
            const userId = Meteor.userId();
            Meteor.setTimeout(()=>{
              Meteor.users.update({_id: userId}, {$inc: {'profile.coins': award}}); // increase 10 coins for quiz!
            }, 200);
          }


        }
      }
    },

    newLessonUpdateProgress(ulID) {
      check(ulID, String);

      const userId = Meteor.userId();
      if (!userId) {
        console.log("newLessonUpdateProgress user id is null");
        return;
      }
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("newLessonUpdateProgress can't find userlesson! " + ulID);
        return;
      }

      // set this slide to be completed for this user
      //const completedCount = ul.slideVisitLog.length;
      let lastVisit = ul.slideVisitLog[ul.slideVisitLog.length-1];
      for (let i = 0; i < ul.slideVisitLog.length; i++) {
        const log = ul.slideVisitLog[i];
        // console.log(i + " " + log.slideId);
        if (log.slideId == "endoflesson") {
          lastVisit = log;
          break;
        }
      }

      // console.log("newLessonUpdateProgress ul.lessonId " + ul.lessonId);
      const lesson = Lessons.findOne({ _id: ul.lessonId });
      const tutorialId = lesson._id;
      // console.log(`newLessonUpdateProgress for ${lesson.slideFileId} ${lastVisit.slideId} `);
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId});

      const totalCount = slideContent.slideInfo.length;
      // try to find the latest slide visited in slideContent
      for (let k=0; k<slideContent.slideInfo.length; k++) {
        const sc = slideContent.slideInfo[k];
        // console.log("sc " + k + " is " + sc.ID);
        if (sc.ID == lastVisit.slideId) {
          // console.log("found slide " + lastVisit.slideId + " at " + k + " total " + totalCount);
          let progress = (1+k) / totalCount;
          if (lastVisit.slideId == "endoflesson") progress = 1;
          // console.log("newLessonUpdateProgress progress " + progress);
          const userObj = Meteor.users.findOne({ _id: userId });

          if (userObj && userObj.tutorial && userObj.tutorial.length > 0) {
            let tutorial = userObj.tutorial;
            let updatedTutorial = false;

            for (let k=0; k<tutorial.length; k++ ) {
              if (tutorial[k].id == tutorialId) {
                // console.log("newLessonUpdateProgress found " + tutorialId);
                tu = tutorial[k];
                tu.progress = progress;
                updatedTutorial = true;
              }
            }
            if (updatedTutorial) {
              // console.log("newLessonUpdateProgress new push " + JSON.stringify(tutorial));
              Meteor.users.update({
                _id: Meteor.userId(),
              }, { $set: {tutorial} });
              return;
            }
          }

          const tutorial = {
            id: tutorialId,
            unlocked: true, // need this?
            progress,
            gameId: ul.gameId,
            ScenarioSequenceNumber: lesson.LessonSequenceNumber
          };
          // console.log("newLessonUpdateProgress new add " + JSON.stringify(tutorial));
          Meteor.users.update({
            _id: Meteor.userId()
          }, { $addToSet: { tutorial } });


          break;
        }
      }


    },

    recordQuickExerciseAttempt(ulID, slideId, code, result) {
      check(ulID, String);
      check(slideId, String);
      check(code, String);
      check(result, String);
      // console.log("recordQuickExerciseAttempt " + ulID + " " + slideId);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("recordQuickExerciseAttempt user id is null");
        return;
      }
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("recordQuickExerciseAttempt can't find userlesson!");
        return;
      }


      for (let j=0; j<ul.slideVisitLog.length; j++) {
        if (ul.slideVisitLog[j].slideId == slideId) {
          const opt = {};
          const ind = 'slideVisitLog.' + j + ".attempt";
          opt[ind] = {
            time: new Date(),
            result,
            code
          };
          // console.log("opt is " + JSON.stringify(opt));

          try {
            UserLesson.update({_id: ulID}, {$push: opt});
          } catch (e) {
            let err = e.message;
            console.log("error " + err);
          }

          return;
        }
      }

    },

    recordTestAttempt(ulID, slideId, result, code) {
      check(ulID, String);
      check(slideId, String);
      check(result, String);
      check(code, String);
      // console.log("recordTestAttempt " + ulID + " " + slideId);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("recordTestAttempt user id is null");
        return;
      }
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("recordTestAttempt can't find userlesson!");
        return;
      }


      // set this slide to be completed for this user
      for (let j=0; j<ul.slideVisitLog.length; j++) {
        if (ul.slideVisitLog[j].slideId == slideId) {
          const opt = {};
          const ind = 'slideVisitLog.' + j + ".attempt";
          opt[ind] = {
            time: new Date(),
            result,
            code
          };
          // console.log("opt is " + JSON.stringify(opt));

          try {
            UserLesson.update({_id: ulID}, {$push: opt});
          } catch (e) {
            let err = e.message;
            console.log("error " + err);
          }

          return;
        }
      }

    },

    submitUserInput(ulID, slideId, field, input) {
      check(ulID, String);
      check(slideId, String);
      check(field, String);
      check(input, String);
      // console.log("submitUserInput " + ulID + " " + slideId + " " + field + " " + input);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("submitUserInput user id is null");
        return;
      }
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("submitUserInput can't find userlesson!");
        return;
      }
      if (field == "SN") {
        // update student nick name
        Meteor.users.update({_id: userId}, {$set: {studentname: input}});

      }


      // set this slide to be completed for this user
      for (let j=0; j<ul.slideVisitLog.length; j++) {
        if (ul.slideVisitLog[j].slideId == slideId) {
          const ind = 'slideVisitLog.' + j + ".completed";
          // console.log("ind is " + ind);
          const opt = {};
          opt[ind] = true;
          opt[ind+"Time"] = new Date();
          const ind2 = 'slideVisitLog.' + j + ".input";
          opt[ind2] = input;
          UserLesson.update({_id: ulID}, {$set: opt});
          return;
        }
      }


    },



    // difference between survey and quiz is that survey usually results in
    // some data stored in user collection
    submitUserSurvey(ulID, slideId, field, input) {
      check(ulID, String);
      check(slideId, String);
      check(field, String);
      check(input, String);
      // console.log("submitUserSurvey " + ulID + " " + slideId + " " + field + " " + input);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("submitUserSurvey user id is null");
        return;
      }
      const ul = UserLesson.findOne({ _id: ulID });
      if (!ul) {
        console.log("submitUserSurvey can't find userlesson!");
        return;
      }
      if (field == "SchoolGrade") {
        // Meteor.users.update({_id: userId}, {$set: {
        //   schoolgrade: input,
        //   schoolgradedate: Date.now()
        // }});
        const GradeMap = {
          '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12, '>=13': 13
        };
        let g = GradeMap[input];
        if (!g) {
          g = 6;
        }
        Meteor.users.update({_id: userId}, {$set: {
          'profile.grade': g,
          'profile.gradeAsOfDate': Date.now()
        }});
      }
      if (field == "JavaScriptLevel") {
        Meteor.users.update({_id: userId}, {$set: {javascriptlevel: input}});
      }


      // set this slide to be completed for this user
      for (let j=0; j<ul.slideVisitLog.length; j++) {
        if (ul.slideVisitLog[j].slideId == slideId) {
          const ind = 'slideVisitLog.' + j + ".completed";
          // console.log("ind is " + ind);
          const opt = {};
          opt[ind] = true;
          opt[ind+"Time"] = new Date();
          const ind2 = 'slideVisitLog.' + j + ".input";
          opt[ind2] = input;

          if (field.indexOf("quizanswer") == 0) {
            const correctAnswer = field.substring(11);
            const ind3 = 'slideVisitLog.' + j + ".answer";
            opt[ind3] = correctAnswer;
            if (correctAnswer == input) {
              // switched to use doAwardCoins instead!
              // Meteor.setTimeout(()=>{
              //   Meteor.users.update({_id: userId}, {$inc: {'profile.coins': 10}}); // increase 10 coins for quiz!
              // }, 2000);
            }
          }
          UserLesson.update({_id: ulID}, {$set: opt});
          return;
        }
      }
    },



    initializeUserLessonServer(lessonId) {
      check(lessonId, String);
      const userId = Meteor.userId();
      //console.log(`initializeUserLessonServer for ${lessonId} ${userId}`);

      const existingLesson = UserLesson.findOne({ lessonId, userId });
      //console.log(`initializeUserLessonServer existingLesson ${existingLesson}`);
      if (existingLesson) {
        console.log("initializeUserLessonServer lesson already existed!");
        return;
      }
      if (!userId) {
        console.log("initializeUserLessonServer user id is null");
        return;
      }
      //console.log(`initializeUserLessonServer 1 for ${lessonId} ${userId}`);
      const user = Meteor.users.findOne({ _id: Meteor.userId() });
      const language = user.defaultLanguage ? user.defaultLanguage : 'JavaScript';
      //console.log(`initializeUserLessonServer 2 for ${lessonId} ${userId}`);
      const lesson = Lessons.findOne({ _id: lessonId });
      //console.log(`initializeUserLessonServer 3 for ${lessonId} ${lesson.slideFileId}`);
      const slideContent = SlideContent.findOne({_id: lesson.slideFileId});
      //console.log(`initializeUserLessonServer 4 for ${lessonId} ${lesson.slideFileId} ${JSON.stringify(slideContent)}`);
      // buildScenario(lesson, language);
      const firstSlideId= slideContent.slideInfo[0].ID;
      //console.log(`initializeUserLessonServer 5 for ${lessonId} ${firstSlideId}`);
      const ul = {
        lessonId, userId, currentSlideId: firstSlideId, slideVisitLog: [{
          slideId: firstSlideId, slideType: slideContent.slideInfo[0].TYPE.toLowerCase(),
          slideNode: slideContent.slideInfo[0].NODE,
          autoTrigger: true, skipped: false,
          openTime: new Date()
        }], coinsPaid: false, unlocked: true
      };
      //console.log(`initializeUserLessonServer insert! ${JSON.stringify(ul)}`);
      UserLesson.insert(ul);
    },

    saveUserRobotCodeForLesson(ulId, value, saveInd) {
      check(ulId, String);
      check(value, String);
      check(saveInd, Number);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("saveUserRobotCodeForLesson user id is null");
        return;
      }

      const ul = UserLesson.findOne({ _id: ulId, userId });
      // console.log(`saveUserRobotCodeForLesson existingLesson ${ulId}`);
      if (!ul) {
        console.log("saveUserRobotCodeForLesson lesson does not exist!");
        return;
      }

      let slideId = ul.currentSlideId;
      let log2 = ul.slideVisitLog.find(e => (e.slideId == slideId));
      
      if (log2.slideNode !== "extracredit") {
        if (slideId.indexOf("_") >= 0) {
          slideId = slideId.substring(0, slideId.indexOf("_"));
          // console.log("new slideId " + slideId);
          log2 = ul.slideVisitLog.find(e => (e.slideId == slideId));
        }
      }

      // save robot code to the first log with the same slideNode as current slide (like a hint) ??
      
      // const log = ul.slideVisitLog.find(e => (e.slideNode == log2.slideNode));
      if (log2.userRobotCode == value && value != "INVALIDECODE") return;

      // console.log(`do saveUserRobotCodeForLesson for ${ulId} ${value} ${saveInd}`);

      for (let j=0; j<ul.slideVisitLog.length; j++) {
        if (ul.slideVisitLog[j].slideId == slideId) {
          var opt = {};
          const ind = 'slideVisitLog.' + j + ".userRobotCode";
          opt[ind] = value;
          const ind2 = 'slideVisitLog.' + j + ".robotCodeInd";
          opt[ind2] = saveInd || 1000;


          if (value == "INVALIDECODE") {
            const ind3 = 'slideVisitLog.' + j + ".completed";
            // opt = {};
            opt[ind3] = "";
            // UserLesson.update({_id: ulId}, {$set: opt});


            // UserLesson.find({_id: ulId }).forEach(function(doc) {
            //   var slideVisitLog = doc.slideVisitLog;
            //   var x = slideVisitLog[j];
            //   delete (x["completed"]);
            //   UserLesson.save(doc);
            // });

          }

          // console.log("opt is " + JSON.stringify(opt));
          UserLesson.update({_id: ulId}, {$set: opt});


          return;
        }
      }
    },

    saveUserTestScriptForLesson(ulId, value, saveInd) {
      check(ulId, String);
      check(value, String);
      check(saveInd, Number);
      const userId = Meteor.userId();
      if (!userId) {
        console.log("saveUserTestScriptForLesson user id is null");
        return;
      }
      // console.log(`saveUserTestScriptForLesson for ${ulId} ${userId}`);

      const ul = UserLesson.findOne({ _id: ulId, userId });
      // console.log(`saveUserTestScriptForLesson ul ${ul}`);
      if (!ul) {
        console.log("saveUserTestScriptForLesson lesson does not exist!");
        return;
      }

      const log2 = ul.slideVisitLog.find(e => (e.slideId == ul.currentSlideId));
      // const log = ul.slideVisitLog.find(e => (e.slideNode == log2.slideNode));
      // console.log("log2 is " + JSON.stringify(log2));
      // console.log("log is " + JSON.stringify(log));
      if (log2.userTestScript == value) return;
      // console.log(`saveUserTestScriptForLesson ul.slideVisitLog.length ${ul.slideVisitLog.length}`);
      for (let j=0; j<ul.slideVisitLog.length; j++) {
        // console.log(`ul.slideVisitLog[${j}].slideId ${ul.slideVisitLog[j].slideId}`);
        if (ul.slideVisitLog[j].slideId == log2.slideId) {
          const ind = 'slideVisitLog.' + j + ".userTestScript";
          const opt = {};
          opt[ind] = value;
          const ind2 = 'slideVisitLog.' + j + ".testScriptInd";
          opt[ind2] = saveInd;
          // console.log(`saveUserTestScriptForLesson for ${JSON.stringify(opt)}`);
          UserLesson.update({_id: ulId}, {$set: opt});
          return;
        }
      }
    }
  });
}
