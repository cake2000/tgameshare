import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ROLES, ACTION_TYPE_SUPPORT_MESSAGE, USER_TYPES } from '../../lib/enum';
import { ChatSupport, Message } from '../../lib/collections';

export default function () {
  Meteor.methods({
    'chatSupport.markAsSeenMessageFromSupporter': function(chatSupportId) {
      check(chatSupportId, String);
      const person = Meteor.user().getPerson();
      if (person && person.type.includes(USER_TYPES.SUPPORTER)) {
        // Mark unread count of chatSupport
        Meteor.call('chatSupport.markAsSeen', chatSupportId, true);
      } else {
        throw new Meteor.Error('role-invalid', 'This role is not valid');
      }
    },
    'chatSupport.markAsSeenMessageFromUser': function(chatSupportId) {
      check(chatSupportId, String);
      Meteor.call('chatSupport.markAsSeen', chatSupportId, false);
      const user = Meteor.user();
      if (user.roles && [ROLES.MANUAL, ROLES.AI].indexOf(user.roles[0]) !== -1) {
        // Mark unread count of chatSupport
        Meteor.call('chatSupport.markAsSeen', chatSupportId, false);
      } else {
        throw new Meteor.Error('role-invalid', 'This role is not valid');
      }
    },
    'chatSupport.markAsSeen': function(chatSupportId, fromSupporter) {
      check(chatSupportId, String);
      check(fromSupporter, Boolean);
      const queryUpdate = {};
      let fieldsSet = '';
      if (fromSupporter) {
        queryUpdate.actionType = ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT;
        fieldsSet = 'unReadCount';
      } else {
        queryUpdate.actionType = {
          $ne: ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT
        };
        fieldsSet = 'unReadClientCount';
      }
      const setValue = {};
      setValue[fieldsSet] = 0;
      // Set count to 0
      ChatSupport.update(chatSupportId, {
        $set: setValue
      });
      // Update all messages of opposite is seen true
      Message.update(queryUpdate, {
        $set: {
          isSeen: true
        }
      }, { multi: true });
    },
    'chatSupport.createNewChatSupport': function() {
      const userId = Meteor.userId();
      if (!userId) return null;
      const chatSupportData = {
        userId,
        unReadCount: 0,
        unReadClientCount: 0,
        createdAt: new Date(),
        lastTimeAdded: new Date()
      };
      return ChatSupport.insert(chatSupportData);
    },
    'chatSupport.addNewMessageFromSupporter': function(message, chatSupportId) {
      check(message, String);
      check(chatSupportId, String);
      const userId = Meteor.userId();
      if (!userId) return null;
      const messageData = {
        message,
        actionType: ACTION_TYPE_SUPPORT_MESSAGE.SUPPORT_TEXT,
        chatSupportId
      };
      return Meteor.call('chatSupport.addNewMessage', messageData, chatSupportId);
    },
    'chatSupport.addNewMessageFromUser': function(message, chatSupportId) {
      check(message, String);
      check(chatSupportId, String);
      const userId = Meteor.userId();
      if (!userId) return null;
      const messageData = {
        message,
        actionType: 'USER_TEXT',
        chatSupportId
      };
      const messageId = Meteor.call('chatSupport.addNewMessage', messageData, chatSupportId);
      // Should get message from user in here and process with Tbot
      // Meteor.call('talkToBotUserChatWithMessage', messageData.message);
      return messageId;
    },
    'chatSupport.addNewMessage': function(messageData) {
      const userId = Meteor.userId();
      if (!userId) return null;
      check(messageData, Object);
      check(messageData.message, String);
      check(messageData.actionType, String);
      check(messageData.chatSupportId, String);

      const createdAtTime = new Date();

      // Update unread for client or support admin
      const updateUnread = {};
      if (messageData.actionType === ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT) {
        updateUnread.unReadCount = 1;
      } else updateUnread.unReadClientCount = 1;

      const messageId = Message.insert(Object.assign({}, messageData, {
        createdAt: createdAtTime,
        createdBy: userId,
        isSeen: false
      }));

      ChatSupport.update(messageData.chatSupportId, {
        $inc: updateUnread,
        $set: {
          lastTimeAdded: createdAtTime
        }
      });
      return messageId;
    }
  });
}
