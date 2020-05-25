export default {
  changeElement: ({ LocalState, Meteor }, elementId) => {
    LocalState.set('SELECTED_ELEMENT_ID', elementId);
  },
};
