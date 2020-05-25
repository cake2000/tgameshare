/* global Migrations */
import prepareUserData from './prepareUserData';
import addTestUserData from './addTestUserData';
import insertItemGame from './insertItemGame';

Migrations.add({
  version: 7,
  name: 'Change user data',
  up() {
    addTestUserData();
    prepareUserData();
    insertItemGame();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
