import { check } from 'meteor/check';
import _ from 'lodash';
import { Notifications, ActiveGameList } from '../../lib/collections';
import { NOTIFICATION } from '../../lib/enum';

const inviteType = [NOTIFICATION.INVITE_TO_PLAY_GAME, NOTIFICATION.TOURNAMENT_INVITE];
const getQuery = userId => ({
  $or: [
    {
      recipients: userId
    },
    {
      'sender.userId': userId
    },
    {
      $and: [
        {
          'sender.type': 'system'
        },
        {
          recipients: userId
        }
      ]
    }
  ],
  entityType: { $in: inviteType },
});

const userFields = {
  _id: 1,
  username: 1,
  inGame: 1,
  inRoom: 1,
  'status.online': 1,
  userInPage: 1
};

export default function () {
  Meteor.publish('invitationLogs.list', function(limit) {
    check(limit, Number);
    const selector = getQuery(Meteor.userId());
    const options = {
      fields: {
        _id: 1,
        sender: 1,
        game: 1,
        gameLevel: 1,
        recipients: 1,
        createdAt: 1,
        entityType: 1,
        status: 1,
        isDelete: 1,
        entityId: 1
      },
      sort: { createdAt: -1 },
      limit,
    };
    const notifcationCursor = Notifications.find(selector, options);
    const notifications = notifcationCursor.fetch();
    const userSet = _.reduce(
      notifications,
      (result, value) => [
        ...result,
        ...value.recipients,
        value.sender.userId,
      ],
      []);
    const userIds = _.uniq(userSet);
    const notiSet = _.reduce(
      notifications,
      (result, value) => [
        ...result,
        ...value.recipients,
        value.sender.userId,
      ],
      []);
    const notiIds = _.uniq(notiSet);
    Mongo.Collection._publishCursor(notifcationCursor, this, 'InvitationLogs');
    return [
      Meteor.users.find({ _id: { $in: userIds } }),
      ActiveGameList.find({ notiId: { $in: notiIds } })
    ];
  });
}

