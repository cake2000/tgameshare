/* global Migrations */
import prepareUserAICode from './prepareUserAICode';

Migrations.add({
  version: 20,
  name: 'update tgame bot code for tank war',
  up() {
    prepareUserAICode();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
