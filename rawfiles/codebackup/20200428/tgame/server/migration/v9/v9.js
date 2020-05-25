import insertZipCode from './insertZipCode';

Migrations.add({
  version: 9,
  name: 'Import Zipcode',
  up() {
    insertZipCode();
  },
  down() {
    // code to migrate down to version 1
    // removeLessonScenarios();
  }
});
