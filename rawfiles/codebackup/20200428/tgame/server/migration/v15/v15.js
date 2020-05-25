/* global Migrations */
import prepareLessonScenarios from './prepareLessonScenarios';
import prepareLanguageLessons from './prepareLanguageLessons';
import prepareQAs from './prepareQAs';

Migrations.add({
  version: 15,
  name: 'update lesson data',
  up() {
    // prepareLessonScenarios();
    // prepareLanguageLessons();
    prepareQAs();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
