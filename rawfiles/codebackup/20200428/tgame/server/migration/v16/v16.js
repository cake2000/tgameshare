/* global Migrations */
import prepareLanguageLessons from './prepareLanguageLessons.js';
import prepareLessonScenariosTank from './prepareLessonScenariostank.js';
import prepareQAs from './prepareQAs.js';
import prepareGameData from './prepareGameData.js';

Migrations.add({
  version: 16,
  name: 'add language lesson data',
  up() {
    prepareLanguageLessons();
    prepareQAs();
    prepareGameData();
    prepareLessonScenariosTank();
  },
  down() {}
});
