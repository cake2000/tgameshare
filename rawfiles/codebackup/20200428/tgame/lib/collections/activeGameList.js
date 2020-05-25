import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import _get from 'lodash/get';
import _isString from 'lodash/isString';
import { GAME_TYPE } from '../enum';

const ActiveGameList = new Mongo.Collection('ActiveGameList');

function hookInsert(userId, gameItem) {
  switch (gameItem.gameType) {
    case GAME_TYPE.PRACTICE: {
      const owner = _get(gameItem, 'playerInfo[0].userId');
      Meteor.users.update(owner, {
        $inc: {
          'profile.practiceGamesCount': 1,
        },
      });
      break;
    }
    case GAME_TYPE.BATTLE:
    case GAME_TYPE.MATCH: {
      // Increase for all player
      const { playerInfo } = gameItem;
      const playerIds = playerInfo.map(player => player.userId);
      const battleCountKey = gameItem.gameType === GAME_TYPE.BATTLE ? 'officialBattleCount' : 'onlineBattleCount';

      Meteor.users.update(
        {
          _id: { $in: playerIds, }
        },
        {
          $inc: {
            [`profile.${battleCountKey}`]: 1,
          }
        },
        {
          multi: true,
        }
      );
      break;
    }
    default: break;
  }
}

function hookUpdate(userId, gameItem) {
  switch (gameItem.gameType) {
    case GAME_TYPE.MATCH:
    case GAME_TYPE.BATTLE: {
      const prevGameItem = this.previous;
      if (!prevGameItem.winners && gameItem.winners) {
        // Increase winBattle for players in team
        const filteredWinners = gameItem.winners.filter(uid => _isString(uid));
        const battleWonCountkey = gameItem.gameType === GAME_TYPE.BATTLE ? 'officialBattleWonCount' : 'battleWonCount'

        Meteor.users.update(
          {
            _id: { $in: filteredWinners }
          },
          {
            $inc: {
              [`profile.${battleWonCountkey}`]: 1,
            },
          },
          {
            multi: 1
          }
        );
      }
      break;
    }
  
    default:
      break;
  }
}

ActiveGameList.after.insert(hookInsert);

ActiveGameList.after.update(hookUpdate);

const Schema = {};

Schema.ActiveGameList = new SimpleSchema({
  playerInfo: {
    type: Array
  },
  'playerInfo.$': {
    type: Object
  },
  'playerInfo.$.slot': {
    type: Number,
    optional: true,
  },
  'playerInfo.$.teamID': {
    type: String,
    label: '0 or 1 since there are only 2 teams',
    allowedValues: ['0', '1']
  },
  'playerInfo.$.userId': {
    type: String,
    label: 'Player Id'
  },
  'playerInfo.$.username': {
    type: String,
    optional: true,
    label: 'User name'
  },
  'playerInfo.$.playerType': {
    type: String,
    label: 'AI or Human'
  },
  'playerInfo.$.playerAvatarURL': {
    type: String,
    label: 'Avatar URL'
  },
  'playerInfo.$.playerCoins': {
    type: Number,
    label: 'Gold coins'
  },
  'playerInfo.$.aiVersion': {
    type: String,
    optional: true,
    label: 'ai release version'
  },
  // 'playerInfo.$.inRoom': {
  //   type: Boolean,
  //   label: 'Ready or not',
  //   optional: true,
  // },
  'playerInfo.$.defaultItems': {
    type: Array,
    optional: true,
    defaultValue: [],
  },
  'playerInfo.$.defaultItems.$': String,

  'playerInfo.$.ready': {
    type: Boolean,
    label: 'Ready or not',
    optional: true,
  },
  'playerInfo.$.username': {
    type: String,
    optional: true,
  },
  'playerInfo.$.failedToReconnect': {
    type: Boolean,
    optional: true,
  },
  /* set to true by the event that the 2nd player entering room, which triggers the p2p setup process.
  and if any updates shows any player not in room, then the other player can only exit game
  */
  // bothEnteredRoom: {
  //   type: Boolean,
  //   default: false
  // },
  usersInRoom: {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'usersInRoom.$': {
    type: Boolean,
  },
  lastUpdateID: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  gameId: {
    type: String
  },
  difficulty: {
    type: String,
    label: '0 for BEGINNER, 1 for ADVANCED. This should come from the configuration page when the user sets up the game'
  },
  lastInd: {
    type: String,
    label: 'this is a number indicating the latest move made by any player.'
  },
  gameCommandHistory: {
    type: Array,
    optional: true
  },
  'gameCommandHistory.$': {
    type: Object,
  },
  ballPosSnapshot: {
    type: Array,
    optional: true,
    label: 'This is an array of snapshots of the ball position on table, taken after the user makes a shot and all balls come to a full stop. This is used for playback of the game in the future'
  },
  'ballPosSnapshot.$': {
    type: Object,
  },
  'ballPosSnapshot.$.ID': {
    type: Number
  },
  'ballPosSnapshot.$.x': {
    type: Number
  },
  'ballPosSnapshot.$.y': {
    type: Number
  },
  gameType: {
    type: Number,
    label: 'Game Type'
  },
  winners: {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'winners.$': {
    type: String
  },
  notiId: {
    type: String,
    optional: true
  },
  gameRoomId: {
    type: String,
    optional: true
  },
  owner: {
    type: String,
    optional: true
  },
  host: {
    type: String,
    optional: true
  },
  connectionInfo: {
    type: Object,
    optional: true,
    defaultValue: {},
  },
  createdAt: {
    type: Date,
    defaultValue: new Date()
  },
  runId: {
    type: String, optional: true
  },
  reconnectCounter: {
    type: Number, optional: true
  },
  gameState: {
    type: Object,
    optional: true,
    defaultValue: {}
  }
});

// ActiveGameList.attachSchema(Schema.ActiveGameList);

// indexing
Meteor.startup(() => {
  if (Meteor.isServer) {
    ActiveGameList._ensureIndex({ isActive: 1, 'playerInfo.userId': 1 });
  }
  export default ActiveGameList;
});
