export default {
  releaseAICode({ LocalState }, PlayerCode, gameId, releaseName, SubTrackName, callback) {
    Meteor.call('ReleaseAICode', PlayerCode, gameId, releaseName, SubTrackName, (err) => {
      if (err) {
        callback(err.reason);
      } else {
        callback(false);
      }
    });
  },
  loadAICodeRelease({ LocalState }, PlayerCode, gameId, releaseName, SubTrackName, ScenarioID, callback) {
    Meteor.call('LoadAICodeRelease', PlayerCode, gameId, releaseName, SubTrackName, ScenarioID, (err) => {
      if (err) {
        callback(err.reason);
      } else {
        callback(false);
      }
    });
  },
  deleteAICodeRelease({ LocalState }, gameId, releaseName, SubTrackName, callback) {
    Meteor.call('DeleteAICodeRelease', gameId, releaseName, SubTrackName, (err) => {
      if (err) {
        callback(err.reason);
      } else {
        callback(false);
      }
    });
  },

  selectGameTutorial({ LocalState }, { gameId, packageType, isSlideFormat }) {
    LocalState.set('GAME_SELECTED_TUTORIAL', { gameId, packageType, isSlideFormat });
  },
  tutorialBack({ LocalState }) {
    LocalState.set('GAME_SELECTED_TUTORIAL', null);
  },
  setTutorials({ LocalState }, starterTutorials, advancedTutorials) {
    LocalState.set('TUTORIALS', { starterTutorials, advancedTutorials });
  },
  changeTutorial({ LocalState }, tutorialId) {
    LocalState.set('TUTORIALID', tutorialId);
  },
  updateUserLanguageLevel({ LocalState }, language, value) {
    Meteor.call('updateUserLanguageLevel', language, value);
  },
  updateUserAssessment({ LocalState }, language, key, value) {
    Meteor.call('updateUserAssessment', language, key, value);
  },
  updateUserLanguageSkills({ LocalState }, userId, languageName, skills) {
    Meteor.call('language.addSkills', userId, languageName, skills);
  },
};
