/* global SyncedCron */

Meteor.startup(() => {
  SyncedCron.start();
});
