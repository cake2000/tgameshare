export default {
  addClass({ Meteor }, form, callback) {
    Meteor.call('addClass', form, callback);
  },

  removeClass({ Meteor }, _id, callback) {
    Meteor.call('removeClass', _id, callback);
  },

  renameClass({ Meteor }, _id, newName, callback) {
    Meteor.call('renameClass', _id, newName, callback);
  },

  addCoinsToUser({ Meteor }, userId, coins, callback) {
    Meteor.call('addCoinsToUser', userId, coins, callback);
  },

  resetLessonForUser({ Meteor }, userId, lessonID, callback) {
    Meteor.call('resetLessonForUser', userId, lessonID, callback);
  },

  moveForwardLessonForUser({ Meteor }, userId, lessonID, callback) {
    Meteor.call('moveForwardLessonForUser', userId, lessonID, callback);
  },

  handleApprove({ Meteor }, type, userId, classId) {
    Meteor.call('handleApprove', type, userId, classId);
  }
};
