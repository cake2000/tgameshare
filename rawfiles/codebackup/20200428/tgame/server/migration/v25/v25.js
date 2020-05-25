/* global Migrations */
import prepareLessonScenariosTank from './prepareLessonScenariostank.js';
import addTankWarItems from './addTankWarItems.js';
import prepareUserAICode from './prepareUserAICode';
import prepareGameData from './prepareGameDataMatch3';
import prepareUserAICodeMatch3 from './prepareUserAICodeMatch3';

Migrations.add({
  version: 25,
  name: 'Update Lessons for Pool game',
  up() {
    addTankWarItems();
    prepareLessonScenariosTank();
    prepareUserAICode();
    prepareUserAICodeMatch3();
    prepareGameData();
  },
  down() {
  }
});
