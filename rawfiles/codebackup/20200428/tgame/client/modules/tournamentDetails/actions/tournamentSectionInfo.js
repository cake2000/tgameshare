export default {
  updateRobotRelease({ LocalState }, robot, sectionId) {
    Meteor.call('updateRobotRelease', robot, sectionId);
  }
};
