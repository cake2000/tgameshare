export default {
  closeModal({ LocalState }, oldState) {
    const newState = Object.assign({}, oldState);
    newState.showModal = false;
    LocalState.set('GENERAL_MODAL_INFO', newState);
  }
};
