/* global Migrations */
import prepareLessonScenarios from './prepareLessonScenarios.js';
import prepareQAs from './prepareQAs.js';
import updateAdminHomePageData from './updateAdminHomePageData';

Migrations.add({
  version: 6,
  name: 'Insert scenario data ',
  up() {
    // prepareLessonScenarios();
    // updateAdminHomePageData();
    // prepareQAs();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios(); 
  }

});
