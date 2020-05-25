import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import CodeMirrorComponent from '../components/CodeMirror.jsx';
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

const doLoading = function(Collections, scenario, onData) {
  RobotCode = Collections.UserRobotCodeByLesson.findOne({
    gameId: scenario.gameId, UserID: getUID() == ""? Meteor.userId() : getUID(),
    ScenarioID: scenario._id
    // SubTrackName: scenario.SubTrackName
  });

  if (!RobotCode) { 
    // new logic:
    // case 1: this is a new lesson without apply baseline
    // case 2: this is a half done old lesson done before switching to lesson-wise robot code
    // case 3: this is a user-test

    // first copy from old robot code table, for case 2
    RobotCode = Collections.UserRobotCode.findOne({
      gameId: scenario.gameId, UserID: getUID() == ""? Meteor.userId() : getUID()
    });

    if (!RobotCode) {
      // otherwise try to load from latest updated lesson's code: will handle case 1 and 3!
      RobotCode = Collections.UserRobotCodeByLesson.findOne({
        gameId: scenario.gameId, UserID: getUID() == ""? Meteor.userId() : getUID(),
      },{sort: {lastUpdateTime: -1}, limit: 1});


      // if that is not found either, then set to blank
      if (!RobotCode) {
        //debugger;
      }
    }
  }



  if (scenario.isUserTest) {
    UserSetupCode = Collections.UserCodeTesting.findOne({
      ScenarioID: "usertestcase_" + scenario._id, gameId: scenario.gameId, UserID: getUID() == ""? Meteor.userId() : getUID()
    });
  } else {
    
    UserSetupCode = Collections.UserCodeTesting.findOne({
      ScenarioID: scenario._id, gameId: scenario.gameId, UserID: getUID() == ""? Meteor.userId() : getUID()
    });
  }


  const theid = getUID() == ""? Meteor.userId() : getUID();
  ReleaseLabels = Collections.UserAICodeProd.find({
    userId: theid, gameId: scenario.gameId
  }, {
    releaseName: 1
  }).map(element => element.releaseName);

  // debugger;
  if (!UserSetupCode) {
    // SetupCode = scenario.SetupScript;
    // NoUserTestingCode = true;
    // console.log("no user setup code!");
  } else {
    // console.log("loaded user setup code!" + JSON.stringify(UserSetupCode));
    window.UserSetupCode = UserSetupCode;
  }
  onData(null, { UserSetupCode, RobotCode, scenario, ReleaseLabels });
};

export const composer = ({ context, history, clearErrors, scenarioProps, isProfessionalUser }, onData) => {
  const { Meteor, Collections } = context();
  const scenario = scenarioProps;

  if (!scenario) return clearErrors;

  let sid = scenario._id;
  if (scenario.isUserTest) {
    sid = "usertestcase_" + scenario._id;
  }


  const uid = getUID();

  // newly rewritten:
  setTimeout(() => {
    Tracker.autorun(() => {
      if (Meteor.subscribe('UserRobotCode', scenario.gameId, 'Standard', uid).ready() &&
      Meteor.subscribe('UserRobotCodeByLesson', scenario.gameId, 'Standard', uid).ready() &&
      Meteor.subscribe('UserCodeForTesting', sid, uid).ready() &&
      Meteor.subscribe('UserAICodeProdLabels', scenario.gameId, 'Standard', uid).ready()
      ) {
        // add sth reactive inside autorun!
        // console.log("new code update");
        // RobotCode = Collections.UserRobotCode.findOne({ gameId: scenario.gameId, userId: uid == "" ? Meteor.userId() : uid  });

        // // const isProfessionalUser = true; // TODO: to get from user account info
        // if (1) {
        //   UserSetupCode = Collections.UserCodeTesting.findOne({
        //     ScenarioID: sid, gameId: scenario.gameId, UserID: uid == ""? Meteor.userId() : uid
        //   });
        // }

        if (false && !window.eslint) {
          // require("/js/eslint.js)
          if (!inLoadingEslint) {
            $.getScript("/js/eslint.min.js", function( data, textStatus, jqxhr) {
              console.log("! ! got eslint");
              window.eslint = new window.eslint();
              delete window._babelPolyfill;
              doLoading(Collections, scenario, onData);
              console.log("! ! load empty for now");
              inLoadingEslint = false;
              // onData(null, { UserSetupCode, RobotCode, scenario: null, ReleaseLabels });
            });

            inLoadingEslint = true;
          } else {
            console.log("alreadyy out eslint");
          }
        } else {
          // console.log("! ! directly loading ");
          doLoading(Collections, scenario, onData);
        }
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
