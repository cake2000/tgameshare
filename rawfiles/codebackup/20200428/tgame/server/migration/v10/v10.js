/* global Migrations */
import addMoreItems from './addMoreItems.js';


Migrations.add({
  version: 10,
  name: 'add more item',
  up() {
    addMoreItems();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
