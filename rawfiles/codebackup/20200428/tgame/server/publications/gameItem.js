import { Meteor } from 'meteor/meteor';
import { GameItem } from '../../lib/collections';

export default function () {
  Meteor.publish('gameItem.getAll', () => GameItem.find({}));
  Meteor.publish('getItem.getListByGameAndType', (gameId, type) => {
    check(gameId, String);
    check(type, String);
    return GameItem.find({
      type,
      gameId,
    });
  });
}
