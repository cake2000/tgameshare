/* eslint object-shorthand: [2, "consistent"]*/
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { GameItem, GameRoom } from '../../lib/collections';

export default function () {
  Meteor.methods({
    'gameItem.setDefaultItems'(userId) {
      check(userId, String);
      const user = Meteor.users.findOne({ _id: userId });
      if (!user) {
        throw new Meteor.Error('User is not found');
      }
      const defaultItems = GameItem.find({ defaultInTypes: true });
      const itemGames = defaultItems.map(item => ({
        active: true,
        itemId: item._id,
      }));

      return Meteor.users.update({
        _id: userId
      }, {
        $set: {
          'profile.itemGames': itemGames,
        },
      });
    },
    'gameItem.setActiveItemGameRoom'(gameRoomId, gameItemId) {
      check(gameRoomId, String);
      check(gameItemId, String);
      const userId = Meteor.userId();
      if (!userId) {
        throw new Meteor.Error('User is not found');
      }
      const gameRoom = GameRoom.findOne({ _id: gameRoomId });
      if (!gameRoom) {
        throw new Meteor.Error('Game room is not found');
      }
      const gameItem = GameItem.findOne({ _id: gameItemId });
      if (!gameItem) {
        throw new Meteor.Error('Game item is not found');
      }
      const { playerInfo } = gameRoom;
      const updatedPlayerInfo = playerInfo.map((play) => {
        if (play.userId !== userId) return play;
        const { defaultItems } = play;
        const updatedDefaultItems = defaultItems.map(i => GameItem.findOne({ _id: i }))
          .filter(item => !(item.gameId === gameItem.gameId && item.type === gameItem.type))
          .map(i => i._id);
        updatedDefaultItems.push(gameItem._id);
        return {
          ...play,
          defaultItems: updatedDefaultItems,
        };
      });

      GameRoom.update(gameRoomId, {
        $set: {
          playerInfo: updatedPlayerInfo,
        }
      });
    },
    'gameItem.setActiveItem'(gameItemId) {
      check(gameItemId, String);
      const user = Meteor.user();
      const itemGames = user.profile.itemGames;
      if (!itemGames.find(item => item.itemId === gameItemId)) {
        throw new Meteor.Error('You do not have this item');
      }
      const gameItem = GameItem.findOne({ _id: gameItemId });
      const updateItems = itemGames.map((itemGame) => {
        if (itemGame.itemId === gameItemId) {
          return {
            ...itemGame,
            active: true,
          };
        }
        // Set active for all item have same type
        const item = GameItem.findOne({ _id: itemGame.itemId });
        if (item.gameId === gameItem.gameId && gameItem.type === item.type) {
          return {
            ...itemGame,
            active: false,
          };
        }
        return itemGame;
      });

      return Meteor.users.update(user._id, {
        $set: {
          'profile.itemGames': updateItems,
        }
      });
    },
    'gameItem.upgrade'(gameItemId) {
      check(gameItemId, String);
      const user = Meteor.user();
      if (!user) {
        throw new Meteor.Error('Method need login');
      }
      const gameItem = GameItem.findOne({ _id: gameItemId });
      if (!gameItem) {
        throw new Meteor.Error('Game is not found');
      }

      const coins = user.profile.coins;
      if (coins < gameItem.price) {
        throw new Meteor.Error('You do not have enough coins to buy this item!');
      }
      // Update item games (bought) and subtract coins
      const itemGames = user.profile.itemGames;
      itemGames.push({
        itemId: gameItem._id,
        active: false,
      });

      const currentCoins = user.profile.coins - gameItem.price;


      return Meteor.users.update(user._id, {
        $set: {
          'profile.coins': currentCoins,
          'profile.itemGames': itemGames,
        }
      });
    },
    'gameItem.getByIds'(ids = []) {
      check(ids, Array);
      return GameItem.find({
        _id: {
          $in: ids
        }
      }).fetch();
    },
    'gameItem.getByType'(ids = [], type) {
      check(ids, Array);
      check(type, String);
      return GameItem.find({
        _id: {
          $in: ids
        },
        type: type
      }).fetch();
    }
  });
}
