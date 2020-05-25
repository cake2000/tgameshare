import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'lodash';
import {
  GameRoom, Games, FriendWaitingList, UserAICodeProd, Tournament, ActiveGameList, GameItem
} from '../../lib/collections';
import { ITEM_GAME_TYPE } from '../../lib/enum';

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default function () {
  Meteor.publish('gameRoom.findByOwner', (ownerId) => {
    check(ownerId, String);
    const gameRoom = GameRoom.findOne({ owner: ownerId });
    const { gameId = null, playerInfo = [], owner = null } = gameRoom || {};
    const aiVersion = playerInfo.map(player => player.aiVersion);
    const UserAICodeProdCursor = UserAICodeProd.find({ _id: { $in: aiVersion }, userId: { $in: ['system', Meteor.userId()] } });
    const userList = owner ? [owner] : [];
    _.each(playerInfo, (item) => {
      if (item.userId) {
        userList.push(item.userId);
      }
    });
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const playerUserIds = playerInfo.filter(player => player.userId);
    const selector = {
      $and: [{}],
      isActive: false,
      winners: [],
      createdAt: { $gte: date }
    };
    if (playerUserIds.length === playerInfo.length) {
      playerUserIds.map(player => selector.$and.push({
        playerInfo: {
          $elemMatch: {
            userId: player.userId
          }
        }
      }));
    }
    const ActiveGameListCursor = ActiveGameList.find(
      selector, {
        sort: { createdAt: -1 }
      }
    );
    return [
      GameRoom.find({ owner: ownerId }),
      Games.find({ _id: gameId }),
      UserAICodeProdCursor,
      Meteor.users.find({ _id: { $in: userList } }),
      ActiveGameListCursor
    ];
  });

  Meteor.publish('gameRoom.findById', (id) => {
    check(id, String);
    const gameRoom = GameRoom.findOne({ _id: id });
    const { gameId = null, playerInfo = [], owner = null } = gameRoom || {};
    const aiVersion = playerInfo.map(player => player.aiVersion);
    const UserAICodeProdCursor = UserAICodeProd.find({ _id: { $in: aiVersion }, userId: { $in: ['system', Meteor.userId()] } });
    const userList = owner ? [owner] : [];
    _.each(playerInfo, (item) => {
      if (item.userId) {
        userList.push(item.userId);
      }
    });
    return [
      GameRoom.find({ _id: id }),
      Games.find({ _id: gameId }),
      UserAICodeProdCursor,
      Meteor.users.find({ _id: { $in: userList } })
    ];
  });

  Meteor.publish('GameRoomListWithId', (roomId) => {
    check(roomId, String);
    return ActiveGameList.find({ _id: roomId });
  });

  Meteor.publish('GameRoomListWithMe', (userId) => {
    check(userId, String);
    const activeGameListOption = {
      query: { playerInfo: { $elemMatch: { userId } }, isActive: true },
      fields: { ballPosSnapshot: 0, actions: 0, gameCommandHistory: 0 }
    };
    let userAICodeProd;
    const userIds = [];
    const aiVersions = [];
    ActiveGameList.find(
      activeGameListOption.query,
      activeGameListOption.fields
    ).map((activeGame) => {
      _.each(activeGame.playerInfo, (item) => {
        userIds.push(item.userId);
      });
      if (activeGame.aiVersion) {
        aiVersions.push(activeGame.aiVersion);
      }
      return activeGame;
    });
    if (aiVersions.length > 0) {
      userAICodeProd = UserAICodeProd.find({ userId: { $in: ['system', Meteor.userId()] }, _id: { $in: aiVersions } });
    } else {
      userAICodeProd = UserAICodeProd.find({ userId: 'system', SubTrackName: 'Standard' });
    }
    return [
      ActiveGameList.find(activeGameListOption.query, activeGameListOption.fields),
      Meteor.users.find({ _id: { $in: userIds } }, {
        fields: { _id: 1, avatar: 1 }
      }),
      userAICodeProd
    ];
  });

  Meteor.publish('GameRoomListWithRoomId', function GameRoomListWithRoomId(roomId) {
    check(roomId, String);
    const activeGame = ActiveGameList.findOne({ _id: roomId, isActive: true });
    if (!activeGame) {
      console.log('Active game not found');
      return this.ready();
    }

    const aiVersionIds = _.map(activeGame.playerInfo, 'aiVersion');
    const query = [
      {
        userId: 'system',
        SubTrackName: 'Standard'
      }
    ];
    if (aiVersionIds.length > 0) {
      query.push({ _id: { $in: aiVersionIds } });
    }

    return [
      ActiveGameList.find({ _id: roomId, isActive: true }),
      UserAICodeProd.find({ $or: query }),
      Meteor.users.find({ _id: { $in: _.map(activeGame.playerInfo, 'userId') } })
    ];
  });


  Meteor.publish('ActiveGameList.GameItem', (resumeGameId) => {
    check(resumeGameId, String);
    const selector = {
      _id: resumeGameId
    };
    const { playerInfo } = ActiveGameList.findOne(selector);
    let gameItemsList = [];
    _.each(playerInfo, (item) => {
      gameItemsList = _.concat(gameItemsList, item.defaultItems);
    });

    return [
      ActiveGameList.find(selector),
      GameItem.find({ _id: { $in: _.uniq(gameItemsList) } })
    ];
  });

  Meteor.publish('OneResumeGame', (resumeGameId) => {
    check(resumeGameId, String);
    const selector = {
      _id: resumeGameId
    };
    return ActiveGameList.find(selector);
  });


  Meteor.publish('ActiveGameList', function (activeGameId) {
    check(activeGameId, String);

    const handle = ActiveGameList.find({ _id: activeGameId }).observeChanges({
      added: (id) => {
        this.added('actions', id, { actions: null });
      },
      changed: (id, fields) => {
        if (fields.actions) {
          this.changed('actions', id, { actions: fields.actions[fields.actions.length - 1] });
        }
        // else {
        //   // console.log('fields', fields);
        //   this.changed('actions', id, { actions: null });
        // }
      }
    });

    this.ready();
    this.onStop(() => handle.stop());
  });

  Meteor.publish('UserAICodeProdLabels', function (gameId, SubTrackName, uid) {
    check(gameId, String);
    check(SubTrackName, String);
    check(uid, String);

    // const userId = this.userId;
    const userId = uid == "" ? this.userId : uid;
    // console.log("user id " + userId);
    // if (!Roles.userIsInRole(userId, ROLES.AI)) {
    //   return null;
    // }

    const selector = {
      userId, gameId, SubTrackName
    };

    // console.log(`in UserAICodeProdLabels ${JSON.stringify(UserAICodeProd.find(selector, { fields: { releaseName: 1 } }).fetch())}`);

    // const cnt = UserAICodeProd.find(selector).count();

    // return UserAICodeProd.find(selector, {sort: {releasedAt:-1}, limit: 1});
    // return UserAICodeProd.find(selector, { fields: { releaseName: 1 } });
    return UserAICodeProd.find(selector);
  });



  Meteor.publish('EveryUserAICodeProd', () => {
    console.log("EveryUserAICodeProd");
    // const legitUsers = ["kEmnDrYssC2gKNDxx"];

    // if (!legitUsers.includes(this.userId)) {
    const idparts = Meteor.userId().split("_");
    if (idparts[0] != "autorunner" || !isNumeric(idparts[1])) {
      console.log("EveryUserAICodeProd not legit");
      return null;
    }
    return UserAICodeProd.find();
  });

  Meteor.publish('AllUserAICodeProd', (SubTrackName) => {
    check(SubTrackName, String);
    const selector = {
      SubTrackName, userId: { $in: ['system', Meteor.userId()] }
    };
    return UserAICodeProd.find(selector);
  });

  Meteor.publish('UserAICodeProd', (gameId, SubTrackName) => {
    check(gameId, String);
    check(SubTrackName, String);
    const selector = {
      gameId,
      SubTrackName,
      userId: Meteor.userId()
    };
    return UserAICodeProd.find(selector);
  });

  Meteor.publish('UserAICodeList', (userId, gameId) => {
    check(gameId, String);
    check(userId, String);

    const selector = {
      userId, gameId
    };

    return UserAICodeProd.find(selector);
  });

  Meteor.publish('UserAICodeProd.ById', (aiCodeId) => {
    check(aiCodeId, String);

    // return UserAICodeProd.find(selector, {sort: {releasedAt:-1}, limit: 1});
    return UserAICodeProd.find({ _id: aiCodeId });
  });

  Meteor.publish('FriendWaitingListWithMe', function (gameTrack) {
    check(gameTrack, String);
    const userId = this.userId;

    const selector = {
      $and:
        [
          { TrackName: gameTrack },
          {
            $or: [{ userId1: userId }, { userId2: userId }]
          }
        ]
    };

    return FriendWaitingList.find(selector);
  });

  Meteor.publish('OpenPublicTournaments', function (gameTrack) {
    check(gameTrack, String);
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('user Id not found');
    }

    const selector = { TrackName: gameTrack, isOpen: true, isPublic: true };

    return Tournament.find(selector, { fields: { registeredUserIds: 0 } });
  });
}
