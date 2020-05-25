import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Games } from '../../lib/collections';

export default function () {
  Meteor.publish('games.list', function() {
    const self = this;

    const gameListHandle = Games.find().observe({
      added (game) {
        self.added('games', game._id, game);
      }
    });
    self.ready();
    self.onStop(() => {
      gameListHandle.stop();
    });
  });
  Meteor.publish('games.item', (itemId) => {
    check(itemId, String);

    return Games.find({ _id: itemId });
  });
}
