export default {
  clearValue({ LocalState }) {
    LocalState.set('USER', null);
    LocalState.set('USER_LIMIT', null);
    LocalState.set('USER_SKIP', null);
  },
  searchUser({ LocalState }, value, skip) {
    LocalState.set('USER', value);
    LocalState.set('USER_SKIP', skip);
  },
  setUserLimitAndSkip({ LocalState }, limit, skip) {
    LocalState.set('USER_LIMIT', limit);
    LocalState.set('USER_SKIP', skip);
  }
};
