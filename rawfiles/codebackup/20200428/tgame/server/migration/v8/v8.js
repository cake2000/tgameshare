/* global Migrations */
import prepareLessonScenarios from './prepareLessonScenarios.js';


Migrations.add({
  version: 8,
  name: 'add lesson data',
  up() {
    // prepareLessonScenarios();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
