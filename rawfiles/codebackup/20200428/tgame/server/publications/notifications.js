import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Notifications, Games, GameRoom, Tournament, TournamentSection, TournamentRound } from '../../lib/collections';
import { NOTIFICATION, PLAYER_TYPE } from '../../lib/enum';
import { TIMES } from '../../lib/const';

// let intervalId;

function handleInviteToPlayerCountdown({ id, field }, userId) {
  const { actionOnEntity } = field;

  if (actionOnEntity.countdown === 0) return;

  if (actionOnEntity.countdown === undefined) {
    switch (field.entityType) {
      case NOTIFICATION.INVITE_TO_PLAY_GAME:
        actionOnEntity.countdown = 30;
        break;
      case NOTIFICATION.FINISH_TOURNAMENT:
        return;
      default:
        break;
    }
  }
  const { entityId } = field;
  this.added('notifications', id, { actionOnEntity });
  const intervalId = Meteor.setInterval(() => {
    actionOnEntity.countdown -= 1;
    const noti = Notifications.findOne({ _id: id });

    if (!noti.isDelete.find(element => element.playerId === Meteor.userId())) {
      try {
        this.changed('notifications', id, { ...actionOnEntity });
      } catch (error) {
        Meteor.clearInterval(intervalId);
      }
      Notifications.update({ _id: id }, { $set: { actionOnEntity } });
    } else {
      Meteor.clearInterval(intervalId);
    }

    if (actionOnEntity.countdown <= 0) {
      Meteor.clearInterval(intervalId);
      switch (field.entityType) {
        case NOTIFICATION.INVITE_TO_PLAY_GAME:
          Meteor.call('gameRoom.declineInvite', entityId, id);
          break;

        default:
          break;
      }
    }
  }, 1000);
}

export default function () {
  Meteor.publish('notification.unreadCount', function() {
    const userId = Meteor.userId();
    Counts.publish(this, 'unReadNotiCount', Notifications.find( // cursor to handle noti count
      {
        $and: [
          {
            recipients: userId,
          },
          {
            $or: [
              {
                isDelete: {
                  $exists: false,
                }
              },
              {
                isDelete: {
                  $eq: [],
                }
              },
              {
                'isDelete.playerId': {
                  $ne: userId
                }
              }
            ]
          },
          {
            $or: [
              {
                readBy: {
                  $exists: false,
                }
              },
              {
                readBy: {
                  $eq: [],
                }
              },
              {
                'readBy.readerId': {
                  $ne: userId
                }
              }
            ]
          }
        ]
      }
    ));
  });

  Meteor.publish('notification.listToShow', function () {
    const userId = this.userId;
    // console.log('publishing notification.listToShow ' + userId);
    return Notifications.find(
      {
        $and: [
          {
            recipients: userId,
          },
          {
            $or: [
              {
                isDelete: {
                  $exists: false,
                }
              },
              {
                isDelete: {
                  $eq: [],
                }
              },
              {
                'isDelete.playerId': {
                  $ne: userId
                }
              }
            ]
          },
          {
            $or: [
              {
                readBy: {
                  $exists: false,
                }
              },
              {
                readBy: {
                  $eq: [],
                }
              },
              {
                'readBy.readerId': {
                  $ne: userId
                }
              }
            ]
          },
        ]
      },
      {
        limit: 3,
        sort: { createdAt: -1 }
      }
    );
  });
  Meteor.publishComposite('notification.getSingleNotification', notiId => ({
    find() {
      check(notiId, String);
      return Notifications.find({ _id: notiId });
    },
    children: [
      {
        find(notification) {
          return Games.find({ _id: notification.game.id });
        }
      },
      {
        find(notification) {
          return Meteor.users.find({ _id: notification.sender.userId }, { fields: { username: 1, avatar: 1 } });
        }
      }
    ]
  }));
  Meteor.publish('notification.getGameInfo', () => {
    return Games.find({}, {
      fields: {
        _id: 1,
        title: 1,
        teamSize: 1,
        teamNumber: 1,
        imageUrl: 1,
      }
    });
  });
  Meteor.publish('notification.getGameRoom', () => {
    return GameRoom.find({}, {
      fields: {
        _id: 1,
        gameId: 1,
        level: 1,
        playerInfo: 1,
      }
    });
  });
  Meteor.publish('notification.users', () => {
    return Meteor.users.find({}, {
      fields: {
        _id: 1,
        username: 1,
        avatar: 1,
      }
    });
  });
  Meteor.publish('notification.tournament', () => {
    return Tournament.find({}, {
      fields: {
        _id: 1,
        Name: 1,
      }
    });
  });
  Meteor.publish('notification.section', () => {
    return TournamentSection.find({}, {
      fields: {
        _id: 1,
        name: 1,
        registeredUserIds: 1,
      }
    });
  });
  Meteor.publish('notification.tournamentRound', (ids) => {
    check(ids, Array);
    return TournamentSection.find(
      {
        _id: {
          $in: ids
        }
      },
      {
        fields: {
          _id: 1,
          sectionId: 1,
          tournamentId: 1,
        }
      });
  });
}
