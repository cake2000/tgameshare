/* global Migrations */
import updateAdminHomePageData from './updateAdminHomePageData';

Migrations.add({
  version: 4,
  name: 'Prepare admin home page data',
  up() {
    updateAdminHomePageData();
  },
  down() {
    // code to migrate down to version 3
  }

});
