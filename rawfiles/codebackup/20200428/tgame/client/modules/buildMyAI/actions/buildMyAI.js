export default {
  updateProgress({ Meteor }, tutorialId, progress, gameId, ScenarioSequenceNumber) {
    Meteor.call('accountupdateProgress', tutorialId, progress, gameId, ScenarioSequenceNumber, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  changeTutorial({ LocalState }, tutorialId) {
    LocalState.set('TUTORIALID', tutorialId);
  }
};
