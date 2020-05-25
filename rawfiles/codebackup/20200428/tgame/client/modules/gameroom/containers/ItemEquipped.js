/* globals Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import get from 'lodash/get';
import { GameItem } from '../../../../lib/collections';

import ItemEquipped from '../components/ItemEquipped.jsx';

export const composer = ({ context, defaultItems, userId }, onData) => {
  const { Meteor } = context();
  if (!userId) {
    return onData(null, {
      items: []
    });
  }

  const gameItemHandle = Meteor.subscribe('gameItem.getAll');
  const playerProfileHandle = Meteor.subscribe('users.getProfileUser', userId);
  if (gameItemHandle.ready() && playerProfileHandle.ready()) {
    const user = Meteor.users.findOne(
      { _id: userId },
      {
        fields: {
          profile: 1
        }
      }
    );
    let itemGames = get(user, 'profile.itemGames', []);

    itemGames = GameItem.find(
      {
        _id: {
          $in: itemGames.map(i => i.itemId)
        }
      }, {
        sort: {
          type: 1
        }
      }
    ).fetch().map(item => ({
      ...item,
      active: defaultItems.indexOf(item._id) !== -1
    }));

    onData(null, {
      items: itemGames
    });
  }
};

export const depsMapper = (context, actions) => ({
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ItemEquipped);
