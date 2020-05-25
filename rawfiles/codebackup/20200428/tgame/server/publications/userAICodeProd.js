import { check } from 'meteor/check';
import { UserAICodeProd, ActiveGameList } from '../../lib/collections';

const GAME_TYPE = {
  PRACTICE: 1,
  MATCH: 2,
  TESTING: 3,
  TOURNAMENT: 4,
  AUTORUN: 5,
  REPLAY: 6,
  BATTLE: 7
};

export default function () {
  Meteor.publish('userAICode.getAll', (gameId) => {
    check(gameId, String);

    return UserAICodeProd.find(
      {
        userId: Meteor.userId(),
        gameId
      },
      {
        fields: {
          userId: 1,
          gameId: 1,
          releaseName: 1
        }
      }
    );
  });

  Meteor.publish('userAICode.getAllForGameRoom', (gameRoomId) => {
    check(gameRoomId, String);
    const room = ActiveGameList.findOne({ _id: gameRoomId });
    if (!room) return null;
    if (room.gameType !== GAME_TYPE.BATTLE) return null;
    const idList = [];
    for (let ind = 0; ind < room.playerInfo.length; ind += 1) {
      idList.push(room.playerInfo[ind].userId);
    }

    return UserAICodeProd.find(
      {
        userId: { $in: idList },
        gameId: room.gameId
      },
      {
        fields: {
          userId: 1,
          gameId: 1,
          releaseName: 1,
          PlayerCode: 1
        }
      }
    );
  });

  Meteor.publish('userAICode.getAllForGameRoomLabel', (gameRoomId) => {
    check(gameRoomId, String);
    const room = ActiveGameList.findOne({ _id: gameRoomId });
    if (!room) return null;
    const idList = [];
    for (let ind = 0; ind < room.playerInfo.length; ind += 1) {
      idList.push(room.playerInfo[ind].userId);
    }

    return UserAICodeProd.find(
      {
        userId: { $in: idList },
        gameId: room.gameId
      },
      {
        fields: {
          userId: 1,
          gameId: 1,
          releaseName: 1
        }
      }
    );
  });


  Meteor.publish('userAICode.getById', (codeId) => {
    check(codeId, String);

    return UserAICodeProd.find(codeId, {
      fields: {
        userId: 1,
        releaseName: 1
      }
    });
  });

  Meteor.publish('userAICode.getAllByUserId', (userId) => {
    check(userId, String);

    return UserAICodeProd.find({ userId }, { fields: { userId: 1, releaseName: 1, gameId: 1, releasedAt: 1 }, $sort: { releasedAt: -1 } });
  });
}
