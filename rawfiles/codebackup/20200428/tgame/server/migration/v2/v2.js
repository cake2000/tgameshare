/* global Migrations */
import prepareLessonScenarios from './prepareLessonScenarios.js';

Migrations.add({
  version: 2,
  name: 'Insert scenario data ',
  up() {
    // prepareLessonScenarios();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }

});
