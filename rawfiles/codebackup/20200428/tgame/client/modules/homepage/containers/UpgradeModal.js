import { useDeps, composeWithTracker, composeAll } from 'mantra-core';

import UpgradeModal from '../components/playerHome/UpgradeModal.jsx';

export const composer = ({ context, clearErrors,
  activeItemChoosen, activeItems, fromGameRoom, boughtItems }, onData) => {
  const { Meteor, Collections } = context();
  let loading = true;
  let gameItems = [];
  if (activeItemChoosen) {
    const { gameId, type } = activeItemChoosen;
    const handleGameItem = Meteor.subscribe('getItem.getListByGameAndType', gameId, type);
    if (handleGameItem.ready()) {
      const query = {
        type,
        gameId,
      };
      if (fromGameRoom) {
        query._id = {
          $in: boughtItems.map(item => item._id)
        };
      }
      gameItems = Collections.GameItem.find(query, {
        sort: {
          price: 1
        },
      }).fetch();
      loading = false;
    }
  }
  onData(null, {
    loading,
    gameItems,
  });
  return clearErrors;
};

export const depsMapper = context => ({
  context: () => context,
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(UpgradeModal);
