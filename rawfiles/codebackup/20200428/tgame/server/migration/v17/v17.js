/* global Migrations */
import prepareUserAICode from './prepareUserAICode';

Migrations.add({
  version: 17,
  name: 'add user AI Code for tank war',
  up() {
    prepareUserAICode();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
