import { Meteor } from 'meteor/meteor';
import _map from 'lodash/map';
import _uniq from 'lodash/uniq';
import { check, Match } from 'meteor/check';
import { LessonChatHistory } from '../../lib/collections';

export default function() {
  Meteor.publish('lessonChatHistory.getLessonChatHistory', (chatSupportId, keyword, limit, skip) => {
    check(chatSupportId, Match.Maybe(String));
    check(keyword, Match.Maybe(String));
    check(limit, Match.Maybe(Number));
    check(skip, Match.Maybe(Number));

    const selector = {
      chatSupportId
    };
    if (keyword && keyword.trim() !== '') {
      selector.content = { $regex: new RegExp(keyword, 'i') };
    }
    const option = {
      sort: {
        createdAt: -1
      }
    };
    if (skip) {
      option.skip = skip;
    }
    if (limit && limit !== -1) {
      option.limit = limit;
    }

    const lessonChatHistoryCursor = LessonChatHistory.find(selector, option);
    const messages = lessonChatHistoryCursor.fetch();
    const userIds = _uniq(_map(messages, 'createdBy'));

    return [
      lessonChatHistoryCursor,
      Meteor.users.find({ _id: { $in: userIds } }, { fields: { username: 1, avatar: 1 } })
    ];
  });

  Meteor.publish('lessonChatHistory.getAllMessagesCounter', function getAllMessagesCounter(chatSupportId, keyword) {
    check(chatSupportId, String);
    check(keyword, Match.Maybe(String));

    let countMessages = 0;
    let initializing = true;
    const subscription = this;
    const selector = {
      chatSupportId
    };
    if (keyword && keyword.trim() !== '') {
      selector.content = { $regex: new RegExp(keyword, 'i') };
    }
    const handle = LessonChatHistory.find(selector).observeChanges({
      added: () => {
        countMessages += 1;

        if (!initializing) {
          subscription.changed('counters', chatSupportId, { countMessages });
        }
      },

      removed: () => {
        countMessages -= 1;
        subscription.changed('counters', chatSupportId, { countMessages });
      }

      // We don't care about `changed` events.
    });
    initializing = false;
    subscription.added('counters', chatSupportId, { countMessages });
    subscription.ready();
    subscription.onStop(() => handle.stop());
  });
  // Meteor.publish('lessonChatHistory.getMessageActivityAllByUserId', (ownerId) => {
  //   check(ownerId, String);

  //   return [
  //     LessonChatHistory.find({ ownerId }, { sort: { createdAt: -1 }, limit: 20 }),
  //     Lessons.find({})
  //   ];
  // });
}
