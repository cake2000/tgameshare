import prepareNewCourse from './prepareNewCourse.js';
import addNewLesson from './addNewLesson.js';
import prepareSupporter from './prepareSupporter';

Migrations.add({
  version: 29,
  name: 'Add Crystal items',
  up() {
    // addNewLesson();
    // prepareNewCourse();
    prepareSupporter();
  },
  down() {
  }
});
