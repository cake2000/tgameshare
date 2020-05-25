export default {
  createChatSupport({ Meteor }) {
    Meteor.call('chatSupport.createNewChatSupport', (err) => {
      if (err) console.log('error', err);
    });
  },
  addNewMessageFromUser({ Meteor }, message, chatSupportId, callback) {
    Meteor.call('chatSupport.addNewMessageFromUser', message, chatSupportId, callback);
  },
  addNewMessageFromSupporter({ Meteor }, message, chatSupportId, callback) {
    Meteor.call('chatSupport.addNewMessageFromSupporter', message, chatSupportId, callback);
  },
  markAsSeenMessageFromSupporter({ Meteor }, chatSupportId) {
    Meteor.call('chatSupport.markAsSeenMessageFromSupporter', chatSupportId);
  },
  markAsSeenMessageFromUser({ Meteor }, chatSupportId) {
    Meteor.call('chatSupport.markAsSeenMessageFromUser', chatSupportId);
  }
};
