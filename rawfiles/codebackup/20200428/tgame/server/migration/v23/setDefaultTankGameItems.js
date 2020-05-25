import _map from 'lodash/map';
import { GameItem } from "../../../lib/collections";
import { MIGRATION_CONST } from '../../../lib/enum';

export default function setDefaultTankGameItems() {
  const tankItemIds = _map(GameItem.find({ gameId: MIGRATION_CONST.tankGameId }).fetch(), '_id');

  // Remove default tank items before
  Meteor.users.update({}, { $pull: { 'profile.itemGames': { itemId: { $in: tankItemIds } } } }, { multi: true });

  const defaultTankGameItems = GameItem.find({
    gameId: MIGRATION_CONST.tankGameId,
    defaultInTypes: true
  }).fetch();

  if (defaultTankGameItems.length > 0) {
    const itemGames = _map(defaultTankGameItems, gameItem => ({ itemId: gameItem._id, active: true }));

    Meteor.users.update({}, {
      $push: {
        'profile.itemGames': {
          $each: itemGames
        }
      }
    }, { multi: true });
  }
}
