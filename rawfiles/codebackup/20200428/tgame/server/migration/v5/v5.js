/* global Migrations */
import createAdminForumAccount from './createAdminForumAccount';

Migrations.add({
  version: 5,
  name: 'Prepare admin forum account',
  up() {
    createAdminForumAccount();
  },
  down() {
    // code to migrate down to version 3
  }

});
