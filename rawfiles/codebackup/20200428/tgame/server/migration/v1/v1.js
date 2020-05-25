/* global Migrations */
import prepareAdminData from './prepareAdminData';
import prepareGameData from './prepareGameData';
import prepareUserAICode from './prepareUserAICode';
import prepareDefaultUser from './prepareDefaultUser';

Migrations.add({
  version: 1,
  name: 'Insert basic data to start application',
  up() {
    prepareGameData();
    prepareDefaultUser();
    prepareAdminData();
    prepareUserAICode();
  },
  down() {
    // code to migrate down to version 0

  }
});
