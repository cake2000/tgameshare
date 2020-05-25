export default {
  saveRobotCode({ Meteor }, gameId, changeCode, chatId, lintError, ScenarioID) {
    Meteor.call('saveRobotCodeChange', gameId, changeCode, chatId, lintError, ScenarioID, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  saveRobotCodeReset({ Meteor }, gameId, changeCode, chatId, lintError, ScenarioID) {
    Meteor.call('saveRobotCodeChangeReset', gameId, changeCode, chatId, lintError, ScenarioID, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  saveTestingCode({ Meteor }, gameId, scenarioid, changeCode) {

    Meteor.call('saveTestingCodeChange', gameId, scenarioid, changeCode, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  }
};
