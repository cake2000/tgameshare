
export default {

  initializeUserChat({ Meteor }, scenarioId) {
    Meteor.call('initializeUserChatServer', scenarioId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },

  

  initializeUserChatUser({ Meteor }, scenarioId) {
    Meteor.call('initializeUserChatServerUser', scenarioId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },

  /*
  userActionType                actionContent           
  0: USER_TEXT                  the text the user typed
  1: USER_RUN_RESULT            "test succeeded" or "test failed"
  */
  handNewUserChatAction({ Meteor }, chatId, userActionType, actionContent, lintError, TestRunCount, CodeChangeCount) {
    if (typeof(TestRunCount) == "undefined") TestRunCount = 0;
    if (typeof(CodeChangeCount) == "undefined") CodeChangeCount = 0;
    Meteor.call('handNewUserChatAction', chatId, userActionType, actionContent, lintError ? lintError :"", TestRunCount, CodeChangeCount, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  }
};
