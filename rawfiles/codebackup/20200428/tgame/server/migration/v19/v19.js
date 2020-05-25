/* global Migrations */
import prepareLessonScenarios from './prepareLessonScenarios';
import prepareLanguageLessons from './prepareLanguageLessons.js';

Migrations.add({
  version: 19,
  name: 'prepare pool lesson for class',
  up() {
    // prepareLanguageLessons();
    // prepareLessonScenarios();
  },
  down() {}
});
