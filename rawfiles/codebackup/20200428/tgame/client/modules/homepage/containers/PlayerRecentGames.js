import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _ from 'lodash';
import { GAME_INVITE_STATUS, NOTIFICATION } from '../../../../lib/enum';
import PlayerRecentGames from '../components/playerHome/PlayerRecentGames.jsx';

const getMode = (notiId, Collections) => {
  const gameHistory = Collections.ActiveGameList.findOne({ notiId }, {
    fields: {
      playerInfo: 1,
    },
  });
  if (gameHistory && gameHistory.playerInfo) {
    const { playerInfo } = gameHistory;
    const info = playerInfo.find(infoGame => infoGame.userId === Meteor.userId());
    if (info) {
      if (info.playerType === 'AI') return `${info.playerType}(${info.aiList.find(ai => ai._id === info.aiVersion).releaseName})`;
      return info.playerType;
    }
  } return '';
};
const getStatus = (status, notiId, Collections) => {
  if (status === GAME_INVITE_STATUS.ACCEPT) {
    const gameHistory = Collections.ActiveGameList.findOne(
      {
        notiId
      },
      {
        fields: {
          winners: 1,
          notiId: 1
        }
      }
    );
    if (gameHistory) {
      const isWinner = !!gameHistory.winners.find(uid => uid === Meteor.userId());
      return isWinner ? 'Win' : 'Lost';
    }
  }
  return status;
};

export const composer = ({ context, clearErrors }, onData) => {
  const { Meteor, Collections } = context();
  const limit = 5;
  const handleFetchInvitationLogs = Meteor.subscribe('invitationLogs.list', limit);
  if (handleFetchInvitationLogs.ready()) {
    const query = {
      $or: [
        {
          'sender.userId': Meteor.userId()
        },
        {
          recipients: Meteor.userId()
        },
      ],
      entityType: NOTIFICATION.INVITE_TO_PLAY_GAME,
    };
    // const invitationLogs = [];
    const pureInvitationLogs = Collections.InvitationLogs.find(query, {
      fields: { _id: 1, sender: 1, game: 1, gameLevel: 1, recipients: 1, createdAt: 1, status: 1, entityId: 1 },
      sort: { createdAt: -1 },
      limit
    }).fetch();
    const invitationLogs = _.reduce(pureInvitationLogs, (result, noti) => {
      // if user is sender => add all noti to recipents
      // if user is recipent => add 1
      const { sender, recipients } = noti;
      const userInviteIds = sender.userId === Meteor.userId() ? recipients : [sender.userId];
      const usersInvite = Meteor.users.find(
        {
          _id: { $in: userInviteIds }
        },
        {
          fields: {
            avatar: 1, username: 1, inRoom: 1, inGame: 1, status: 1, userInPage: 1
          }
        }
      ).fetch();
      const newNotis = _.reduce(usersInvite, (results, user) => [
        ...results,
        Object.assign({}, noti, {
          user_invite: {
            name: user.username,
            avatar: user.avatar,
            id: user._id,
            status: user.status,
            inGame: user.inGame,
            inRoom: user.inRoom,
            userInPage: user.userInPage,
          },
          status: getStatus(noti.status, noti._id, Collections),
          mode: getMode(noti._id, Collections),
        })
      ], []);
      return [
        ...result,
        ...newNotis,
      ];
    }, []);
    onData(null, { loading: false, invitationLogs: _.take(invitationLogs, limit) });
  } else {
    onData(null, { loading: true, invitationLogs: [] });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  decline: actions.invite.decline,
  accept: actions.invite.accept,
  createGameRoom: actions.gamesBoard.createGameRoom,
  invitePlayer: actions.gameRoom.invitePlayer,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(PlayerRecentGames);
