export default {
  loadPlayerBasicInfo({ LocalState }, playerId) {
    LocalState.set('PLAYER_ID', playerId);
  },
  getPlayerBasicInfoId({ LocalState }) {
    return LocalState.get('PLAYER_ID');
  }
};
