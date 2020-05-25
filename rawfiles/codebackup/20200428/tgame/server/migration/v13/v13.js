/* global Migrations */
import prepareTeacherData from './prepareTeacherData';


Migrations.add({
  version: 13,
  name: 'add teacher data',
  up() {
    prepareTeacherData();
  },
  down() {}
});
