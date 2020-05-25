import addUnderMinerItems from './addUnderMinerItems';
import addDefaultUnderMinerItem from './addDefaultUnderMinerItem';
import addPoolItems from './addPoolItems';
import prepareNewCourse from './prepareNewCourse.js';
import addNewLesson from './addNewLesson.js';

Migrations.add({
  version: 27,
  name: 'Add Crystal items',
  up() {
    // addNewLesson();
    // prepareNewCourse();
    addUnderMinerItems();
    addDefaultUnderMinerItem();
    addPoolItems();
  },
  down() {
  }
});
