import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Collections from '../../lib/collections';

const { GamesRelease } = Collections;

export default function () {
  Meteor.publish('gamesRelease.byGameId', (gameId, userId) => {
    check(gameId, Match.Maybe(String));
    check(userId, Match.Maybe(String));

    return GamesRelease.find({ gameId, userId });
  });
}
