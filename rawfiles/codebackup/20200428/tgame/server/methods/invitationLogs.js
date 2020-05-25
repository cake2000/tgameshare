import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
  Notifications, ActiveGameList, TournamentRound
} from '../../lib/collections';
import {
  NOTIFICATION, GAME_INVITE_STATUS, GAME_TYPE_ARRAY, INVITATION_LOGS_GAME_TYPE
} from '../../lib/enum';

const emptyObject = {};

export default function () {
  Meteor.methods({
    'fetch.invitationLogs': (limit) => {
      check(limit, Number);
      const emptyList = [];
      const getMode = (notiId, entityType) => {
        const gameHistory = ActiveGameList.findOne(
          {
            notiId,
            'playerInfo.userId': Meteor.userId()
          },
          {
            fields: {
              playerInfo: 1,
              gameType: 1
            }
          }
        );
        if (gameHistory && gameHistory.playerInfo) {
          const { playerInfo } = gameHistory;
          const info = playerInfo.find(infoGame => infoGame.userId === Meteor.userId());
          if (info) {
            if (info.playerType === 'AI') return `${info.playerType}(${((info.aiList || emptyList).find(ai => ai._id === info.aiVersion) || emptyObject).releaseName})`;
            return {
              mode: info.playerType,
              gameType: GAME_TYPE_ARRAY[gameHistory.gameType - 1].name
            };
          }
        } return {
          mode: '',
          gameType: entityType === NOTIFICATION.INVITE_TO_PLAY_GAME ? INVITATION_LOGS_GAME_TYPE.ONLINE : INVITATION_LOGS_GAME_TYPE.TOURNAMENT
        };
      };
      const getStatus = (status, notiId) => {
        if (status === GAME_INVITE_STATUS.ACCEPT) {
          const gameHistory = ActiveGameList.findOne(
            {
              notiId
            },
            {
              fields: {
                winners: 1,
                notiId: 1
              },
              sort: {
                createdAt: -1
              }
            }
          );
          if (gameHistory) {
            return !!gameHistory.winners.find(uid => uid === Meteor.userId()) ? 'Win' : 'Lost'; // eslint-disable-line
          }
        }
        return status;
      };


      const query = {
        $or: [
          {
            recipients: Meteor.userId()
          },
          {
            'sender.userId': Meteor.userId()
          },
          {
            'sender.type': 'system'
          }
        ],
        entityType: { $in: [NOTIFICATION.INVITE_TO_PLAY_GAME, NOTIFICATION.TOURNAMENT_INVITE] }
      };

      const invitationLogs = [];
      Notifications.find(query, {
        fields: {
          _id: 1,
          sender: 1,
          game: 1,
          gameLevel: 1,
          recipients: 1,
          createdAt: 1,
          status: 1,
          entityId: 1,
          entityType: 1
        },
        sort: { createdAt: -1 },
        limit: limit === -1 ? undefined : limit
      }).map((noti) => {
        const mode = getMode(noti._id, noti.entityType);
        if (Meteor.userId() === noti.sender.userId) {
          const users = Meteor.users.find(
            { _id: { $in: noti.recipients } },
            {
              fields:
              {
                avatar: 1, username: 1, inRoom: 1, inGame: 1, status: 1, userInPage: 1
              }
            }
          ).fetch();
          users.map(user => invitationLogs.push(Object.assign(noti, {
            user_invite: {
              name: user.username,
              avatar: user.avatar,
              id: user._id,
              status: user.status,
              inGame: user.inGame,
              inRoom: user.inRoom,
              userInPage: user.userInPage
            },
            status: getStatus(noti.status, noti._id),
            mode: mode.mode,
            gameType: mode.gameType
          })));

          return null;
        } if (noti.sender.type === 'system') {
          const round = TournamentRound.findOne({ _id: noti.entityId });
          if (!round) return null;
          const thepairs = round.pairs.filter(pair => pair.players[0].playerId != null && pair.players[1].playerId != null);
          const pairData = thepairs.find(pair => pair.players.find(player => player.playerId === Meteor.userId()));
          if (!pairData) return null;
          const opponent = pairData.players.find(player => player.playerId !== Meteor.userId());
          const user = Meteor.users.findOne({ _id: opponent.playerId }, {
            fields: {
              avatar: 1, username: 1, inRoom: 1, inGame: 1, status: 1, userInPage: 1
            }
          });

          invitationLogs.push(Object.assign(noti, {
            user_invite: {
              name: user ? user.username : 'Unknown',
              avatar: user.avatar,
              id: user._id,
              status: user.status,
              inGame: user.inGame,
              inRoom: user.inRoom,
              userInPage: user.userInPage
            },
            status: pairData.status,
            mode: mode.mode,
            gameType: mode.gameType,
            pairData
          }));

          return null;
        }

        const user = Meteor.users.findOne({ _id: noti.sender.userId }, {
          fields: {
            avatar: 1, username: 1, inRoom: 1, inGame: 1, status: 1, userInPage: 1
          }
        });
        if (user) {
          invitationLogs.push(Object.assign(noti, {
            user_invite: {
              name: user.username,
              avatar: user.avatar,
              id: user._id,
              status: user.status,
              inGame: user.inGame,
              inRoom: user.inRoom,
              userInPage: user.userInPage
            },
            status: getStatus(noti.status, noti._id),
            mode: mode.mode,
            gameType: mode.gameType
          }));
        }

        return null;
      });
      return invitationLogs;
    }
  });
}
