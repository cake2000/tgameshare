/* global Migrations */
import prepareLessonScenarios from './prepareLessonScenarios';
import prepareLanguageLessons from './prepareLanguageLessons.js';
import prepareGameData from './prepareGameDataMatch3';
import prepareUserAICodeMatch3 from './prepareUserAICodeMatch3';
import prepareUserAICode from './prepareUserAICode';
import prepareQAs from './prepareQAs.js';


Migrations.add({
  version: 22,
  name: 'prepare pool lesson for class',
  up() {
    prepareQAs();
    prepareLanguageLessons();
    prepareLessonScenarios();
    prepareUserAICode();
    prepareUserAICodeMatch3();
    prepareGameData();
  },
  down() {}
});
