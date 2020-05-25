import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { ChatSupport, Message, LessonChatHistory } from '../../lib/collections';

export default function () {
  Meteor.publish('changeSupport.getCountUnRead', () => {
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('user-is-required', 'User is required');
    return ChatSupport.find({ userId }, {
      fields: {
        unReadClientCount: 1,
        userId: 1
      }
    });
  });
  Meteor.publish('chatSupport.getInfoChatSupport', function getInfoChatSupport(chatSupportId) {
    check(chatSupportId, Match.Maybe(String));

    if (!chatSupportId || !this.userId) {
      return this.ready();
    }
    const chatSupport = ChatSupport.findOne({ _id: chatSupportId });

    return [
      // Get last message in this chat support
      LessonChatHistory.find(
        { chatSupportId },
        {
          limit: 1,
          sort: {
            createdAt: -1
          }
        }
      ),
      Meteor.users.find({ _id: chatSupport.userId }, { fields: { avatar: 1, username: 1 } })
    ];
  });

  Meteor.publish('chatSupport.getConversation', function getConversation(query) {
    check(query, Match.Maybe(Object));

    if (!this.userId) {
      return this.ready();
    }
    if (query.userValue) {
      const users = Meteor.users.find({ username: { $regex: new RegExp(query.userValue, 'i') } }, { fields: { _id: 1 } }).map(user => user._id);
      return ChatSupport.find({ userId: { $in: users } }, { sort: { lastTimeAdded: -1 }, skip: query.skip, limit: query.limit });
    }
    return ChatSupport.find({}, { sort: { lastTimeAdded: -1 }, skip: query.skip, limit: query.limit });
  });

  Meteor.publishComposite('changeSupport.getById', (chatSupportId) => {
    check(chatSupportId, String);
    return {
      find() {
        const userId = Meteor.userId();
        if (!userId) {
          return null;
        }
        return ChatSupport.find({ _id: chatSupportId });
      },
      children: [
        {
          find(chatSupport) {
            return Message.find({ chatSupportId: chatSupport._id });
          }
        },
        {
          find(chatSupport) {
            return Meteor.users.find({ _id: chatSupport.userId });
          }
        }
      ]
    };
  });

  Meteor.publish('chatSupport.getByUserId', function getByUserId() {
    if (!this.userId) {
      return this.ready();
    }
    return ChatSupport.find({ userId: this.userId });
  });

  Meteor.publish('chatSupport.getAllChatSupportCounter', function getAllChatSupportCounter(keyword) {
    check(keyword, Match.Maybe(String));

    let countMessages = 0;
    let initializing = true;
    const subscription = this;
    const query = {};

    if (keyword && keyword.trim() !== '') {
      const users = Meteor.users.find({ username: { $regex: new RegExp(keyword, 'i') } }, { fields: { _id: 1 } }).map(user => user._id);
      query.userId = { $in: users };
    }
    const handle = ChatSupport.find(query).observeChanges({
      added: () => {
        countMessages += 1;

        if (!initializing) {
          subscription.changed('counters', Meteor.userId(), { countMessages });
        }
      },

      removed: () => {
        countMessages -= 1;
        subscription.changed('counters', Meteor.userId(), { countMessages });
      }

      // We don't care about `changed` events.
    });
    initializing = false;
    subscription.added('counters', Meteor.userId(), { countMessages });
    subscription.ready();
    subscription.onStop(() => handle.stop());
  });
}
