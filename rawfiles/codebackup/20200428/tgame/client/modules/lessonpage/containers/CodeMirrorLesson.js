import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import CodeMirrorComponent from '../components/CodeMirrorLesson.jsx';
import { debug } from 'util';


function getUID() {
  const path = window.location.pathname;
  let uid = "";
  if (path.indexOf("/class") == 0) {
    // "/class/kpGqDfZSqcpBqQ8RQ/8WsN3rqnZ8odhKpHG/P1"
    const p = path.split("/");
    uid = p[3];
  }
  return uid;
}

// let eslintLoaded = false;
let RobotCode = null;
let ReleaseLabels = [];
let UserSetupCode = null;
let inLoadingEslint = false;
// let subscribedID = "";
// let NoUserTestingCode = false;

const doLoading = function(Collections, lesson, userLesson, slideContent, slide, onData) {
  
  ReleaseLabels = Collections.UserAICodeProd.find({
    userId: getUID() == ""? Meteor.userId() : getUID(), gameId: lesson.gameId
  }, {
    releaseName: 1
  }).map(element => element.releaseName);

  onData(null, { lesson, userLesson, slideContent, slide, ReleaseLabels });
};

export const composer = ({ context, history, clearErrors, lesson, userLesson, slideContent, slide, isProfessionalUser }, onData) => {
  const { Meteor, Collections } = context();

  const uid = getUID();
  // newly rewritten:
  setTimeout(() => {
    Tracker.autorun(() => {
      if (Meteor.subscribe('UserAICodeProdLabels', lesson.gameId, 'Standard', uid).ready()
      ) {
        doLoading(Collections, lesson, userLesson, slideContent, slide, onData);
      }
    });
  }, 0);
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  releaseAICode: actions.tutorial.releaseAICode,
  loadAICodeRelease: actions.tutorial.loadAICodeRelease,
  deleteAICodeRelease: actions.tutorial.deleteAICodeRelease,
  saveRobotCode: actions.codeEditer.saveRobotCode,
  saveRobotCodeReset: actions.codeEditer.saveRobotCodeReset,
  saveTestingCode: actions.codeEditer.saveTestingCode,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(CodeMirrorComponent);
