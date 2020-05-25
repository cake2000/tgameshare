/* global Migrations */
import addNewLesson from './addNewLesson.js';
import addTankWarItems from './addTankWarItems.js';
import prepareNewCourse from './prepareNewCourse.js';
import prepareLessonScenariosTank from './prepareLessonScenariostank.js';

Migrations.add({
  version: 24,
  name: 'Add New Lesson',
  up() {
    // addTankWarItems();
    // addNewLesson();
    // prepareNewCourse();
    // prepareLessonScenariosTank();
  },
  down() {
  }
});
