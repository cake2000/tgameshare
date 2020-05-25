import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { each, uniq } from 'lodash';
import { ActiveGameList } from '../../lib/collections';
import { LEVELS, PAYMENT_FREE, PAYMENT_PRO } from '../../lib/enum';

export default function () {
  Meteor.publish('getGamesResultHistory', (gameId, userId, level) => {
    check(gameId, String);
    check(userId, String);
    check(level, String);

    const activeGameQuery = {
      query: {
        gameId,
        playerInfo: { $elemMatch: { userId } }
      },
      options: {
        fields: {
          playerInfo: 1, winners: 1, createdAt: 1, gameId: 1
        },
        sort: { createdAt: -1 },
        limit: 15
      }
    };
    let accountType = {};
    let userIds = [];

    switch (level) {
      case LEVELS.BEGINNER:
        accountType = { $in: [...PAYMENT_PRO, ...PAYMENT_FREE] };
        break;
      case LEVELS.ADVANCED:
        accountType = { $in: PAYMENT_PRO };
        break;
      default:
        accountType = { $in: [...PAYMENT_PRO, ...PAYMENT_FREE] };
        break;
    }
    ActiveGameList.find(
      activeGameQuery.query,
      activeGameQuery.options,
      { fields: { playerInfo: 1 } }
    ).map((game) => {
      each(game.playerInfo, (player) => {
        if (player.userId !== Meteor.userId()) {
          userIds.push(player.userId);
        }
      });
      return game;
    });
    userIds = uniq(userIds);
    const users = Meteor.users.find(
      { _id: { $in: userIds }, accountType },
      {
        fields: {
          username: 1, status: 1, avatar: 1, accountType: 1
        }
      }
    );
    return [
      ActiveGameList.find(activeGameQuery.query, activeGameQuery.options),
      users
    ];
  });
}
