import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import _get from 'lodash/get';
import { ACTION_TYPE_SUPPORT_MESSAGE } from '../enum';

const LessonChatHistory = new Mongo.Collection('lessonChatHistory', {
  transform: message => {
    const userCreatedBy = Meteor.users.findOne({ _id: message.createdBy });
    const username = message.createdBy === 'system' ? 'TBot' : _get(userCreatedBy, 'username');
    const avatar = message.createdBy === 'system' ? '/images/userRobotChat.jpg' : _get(userCreatedBy, 'avatar.url', '/img_v2/ProfileIcon.png');

    return ({
    ...message,
    username,
    avatar
  })
}
});
const Schema = {};

// disable auto reply for now!
// function hookInsert(userId, doc) {
//   if (doc.messageType === ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT) {
//     Meteor.call('lessonChatHistory.botReply', doc.chatSupportId, doc.content);
//     // Meteor.call('lessonChatHistory.recreateSupport', doc.chatSupportId, doc.content);
//   }
// }

Schema.LessonChatHistory = new SimpleSchema({
  createdBy: {
    type: String,
    label: 'Id of user who creates this message'
  },
  createdAt: {
    type: Date
  },
  content: {
    type: String,
    label: 'Message content in HTML format including plain text, image, code, ...'
  },
  messageType: {
    type: String
  },
  isRead: {
    type: Boolean
  },
  chatSupportId: {
    type: String,
    label: 'Id of chat support containing all chat messages'
  }
});

LessonChatHistory.attachSchema(Schema.LessonChatHistory);

// LessonChatHistory.after.insert(hookInsert);

Meteor.startup(() => {
  if (Meteor.isServer) {
    // LessonChatHistory._ensureIndex({ content: 'text' });
  }
  export default LessonChatHistory;
});
