import _map from 'lodash/map';
import { GameItem } from '../../../lib/collections';
import { MIGRATION_CONST } from '../../../lib/enum';

const addDefaultUnderMinerItem = () => {
  const crystalItemIds = _map(GameItem.find({ gameId: MIGRATION_CONST.match3GameId }).fetch(), '_id');

  // Remove default tank items before
  Meteor.users.update({}, { $pull: { 'profile.itemGames': { itemId: { $in: crystalItemIds } } } }, { multi: true });

  const defaultUnderMinerItems = GameItem.find({
    gameId: MIGRATION_CONST.match3GameId,
    defaultInTypes: true
  }).fetch();

  if (defaultUnderMinerItems.length > 0) {
    const itemGames = _map(defaultUnderMinerItems, gameItem => ({ itemId: gameItem._id, active: true }));

    Meteor.users.update({}, {
      $push: {
        'profile.itemGames': {
          $each: itemGames
        }
      }
    }, { multi: true });
  }
};

export default addDefaultUnderMinerItem;
