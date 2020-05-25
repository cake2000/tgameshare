import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import PlayerInviteModal from '../components/PlayerInviteModal.jsx';
import { COINS_WAGER, LEVELS, PAYMENT_FREE, PAYMENT_PRO, ROLES } from '../../../../lib/enum';
import { ActiveGameList } from '../../../../lib/collections';
import { validateEmail } from '../../../../lib/util';

export const composer = ({ context, gameId, gameRoomId, level }, onData) => {
  const { Meteor, LocalState } = context();
  const playerInvitationHistory = [];
  const userId = Meteor.userId();
  const searchKeyword = LocalState.get('SEARCH_KEYWORD_USER');
  let allowInviteEmail = false;

  if (userId && Meteor.subscribe('users.getUsersInvite', gameRoomId).ready() && Meteor.subscribe('getGamesResultHistory', gameId, userId, level).ready()) {
    // Filter duplicate history
    let coins = 0;
    let accountType = {};

    switch (level) {
      case LEVELS.BEGINNER:
        coins = COINS_WAGER.BEGINNER;
        accountType = { $in: [...PAYMENT_PRO, ...PAYMENT_FREE] };
        break;
      case LEVELS.ADVANCED:
        coins = COINS_WAGER.ADVANCED;
        accountType = { $in: PAYMENT_PRO };
        break;
      default:
        accountType = { $in: [...PAYMENT_PRO, ...PAYMENT_FREE] };
        break;
    }
    let gameHistory = ActiveGameList.find(
      {
        $and: [
          {
            gameId
          },
          {
            playerInfo: {
              $elemMatch: {
                userId
              }
            }
          }
        ]
      },
      {
        fields: {
          playerInfo: 1,
          winners: 1,
          createdAt: 1,
          gameId: 1
        },
        sort: {
          createdAt: -1
        },
        limit: 20
      }
    ).fetch();
    gameHistory = gameHistory.filter((game) => {
      const userIdPlay = game.playerInfo.map(user => user.userId).find(id => id !== userId);
      const gameCheck = gameHistory.find((gameHis) => {
        const userIdCheck = gameHis.playerInfo.map(user => user.userId).find(id => id !== userId);

        return userIdPlay === userIdCheck && gameHis.createdAt > game.createdAt;
      });

      return !gameCheck;
    });
    gameHistory.map((user) => {
      const userIds = user.playerInfo.filter(info => info.userId !== Meteor.userId())
        .map(info => info.userId);
      const users = userIds.map(usersId => Meteor.users.findOne(
        { _id: usersId, accountType },
        {
          fields: {
            username: 1, status: 1, avatar: 1, inRoom: 1, inGame: 1, userInPage: 1, accountType: 1
          }
        }
      ));

      playerInvitationHistory.push(
        {
          ...user,
          playerInfo: users
        }
      );
      return null;
    });

    const userOnline = Meteor.users.find(
      {
        'status.online': true,
        _id: { $ne: Meteor.userId() },
        'profile.coins': { $gte: coins },
        roles: { $nin: [ROLES.SUPER_ADMIN, ROLES.SUPPORT] },
        accountType
      },
      {
        fields: {
          username: 1,
          inGame: 1,
          inRoom: 1,
          userInPage: 1,
          'status.online': 1,
          'profile.coins': 1,
          avatar: 1,
          accountType: 1
        }
      }
    ).fetch();
    let userSearchResult = [];
    if (searchKeyword) {
      userSearchResult = Meteor.users.find(
        {
          $and: [{
            $or: [
              {
                username: {
                  $regex: new RegExp(searchKeyword, 'i'),
                },
              },
              {
                'emails.address': {
                  $regex: new RegExp(searchKeyword, 'i'),
                }
              }
            ],
            _id: { $ne: userId },
            roles: { $nin: [ROLES.SUPER_ADMIN, ROLES.SUPPORT] },
            'profile.coins': { $gte: coins },
            accountType
          }]
        },
        {
          fields: {
            username: 1,
            inGame: 1,
            inRoom: 1,
            userInPage: 1,
            'status.online': 1,
            'profile.coins': 1,
            avatar: 1,
            accountType: 1
          }
        }
      ).fetch();
    }
    if (validateEmail(searchKeyword)) {
      allowInviteEmail = Meteor.users.findOne({ 'emails.address': searchKeyword }) === undefined;
    }
    onData(null, { userOnline, playerInvitationHistory, searchKeyword, userSearchResult, allowInviteEmail });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context,
  changeSearchKeyword: actions.gameRoom.changeSearchKeyword,
  sendInviteEmail: actions.account.sendInviteEmail,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(PlayerInviteModal);
