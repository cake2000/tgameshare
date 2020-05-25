/* eslint object-shorthand: [2, "consistent"]*/
/* eslint no-underscore-dangle: 0 */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GameRoom, TournamentRound, Notifications } from '../../lib/collections';
import { NOTIFICATION, PLAYER_TYPE, GAME_INVITE_STATUS } from '../../lib/enum';


const setAllNotiAsRead = (userId) => {
  const readNotiQuery = [
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
      ],
    },
    {
      $or: [
        {
          'readBy.readerId': {
            $ne: userId
          },
        },
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
      ]
    }
  ];
  Notifications.update(
    {
      $and: [
        ...readNotiQuery,
        {
          status: GAME_INVITE_STATUS.WAITING
        }
      ]
    },
    {
      $push: {
        readBy: {
          readerId: userId,
          readAt: new Date()
        }
      }
    },
    { multi: true }
  );
  Notifications.update(
    {
      $and: [
        ...readNotiQuery,
        {
          status: {
            $ne: GAME_INVITE_STATUS.WAITING
          }
        }
      ]
    },
    {
      $push: {
        readBy: {
          readerId: userId,
          readAt: new Date()
        },
        isDelete: {
          playerId: userId,
          deletedAt: new Date(),
        }
      }
    },
    { multi: true }
  );
};

export default function () {
  Meteor.methods({
    'notification.setAllAsRead'() {
      Meteor.defer(() => {
        setAllNotiAsRead(this.userId);
      });
    },
    'notification.generateNoti'(notiObj) {
      check(notiObj, Object);

      const generateInviteMessage = () => {
        const { entityType, message } = notiObj;
        // const user = Meteor.users.findOne({ _id: sender.userId });

        switch (entityType) {
          case NOTIFICATION.INVITE_TO_PLAY_GAME:
            return ' has invited you to play ';
          case NOTIFICATION.TOURNAMENT_INVITE:
            return '';
          case NOTIFICATION.FINISH_TOURNAMENT:
            return `Section ${message.sectionName} of ${message.tournamentName} has ended. Click here to view result`;
          default:
            return undefined;
        }
      };

      const generateNotiObject = {
        game: notiObj.game,
        gameLevel: notiObj.gameLevel,
        teamSize: notiObj.teamSize,
        status: GAME_INVITE_STATUS.WAITING,
        sender: notiObj.sender,
        recipients: notiObj.recipients,
        message: generateInviteMessage(),
        createdAt: new Date(),
        readBy: [],
        entityType: notiObj.entityType,
        entityId: notiObj.entityId,
        actionOnEntity: notiObj.actionOnEntity,
        isDelete: [],
      };

      const noti = _.omit(
        generateNotiObject,
        value => _.isUndefined(value) || _.isNull(value)
      );

      return Notifications.insert(noti);
    },

    'notification.gameRoundCountdown'(notiId) {
      check(notiId, String);
      const { entityId, actionOnEntity, _id, readBy } = Notifications.findOne({ _id: notiId });
      const intervalId = Meteor.setInterval(() => {
        const round = TournamentRound.findOne({ _id: entityId });
        if (round.numberOfPairs === round.numberOfFinishPairs) {
          actionOnEntity.countdown = 0;
        } else {
          actionOnEntity.countdown -= 1;
        }
        Notifications.update({ _id: _id }, { $set: { actionOnEntity } });

        if (actionOnEntity.countdown <= 0) {
          Meteor.clearInterval(intervalId);
          if (readBy.some(element => element.readerId === this.userId)) {
            Meteor.defer(() => {
              Meteor.call('tournament.seen', _id);
            });
          }
          round.pairs.map((pair) => {
            const gameRoom = GameRoom.findOne({ _id: pair.gameRoomId });
            if (gameRoom) {
              const countReady = gameRoom.playerInfo.find(player => player.ready === true);
              if (!countReady) {
                Meteor.defer(() => {
                  Meteor.call('finishTournamentSectionRound', round._id, pair.players[0].playerId, pair.id, PLAYER_TYPE.BOTH_LOSER);
                });
              }
            }
            return null;
          });
        }
      }, 1000);
    }
  });
}

