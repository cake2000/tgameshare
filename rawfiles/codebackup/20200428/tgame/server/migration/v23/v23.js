/* global Migrations */
import addTankWarItems from './addTankWarItems.js';
import setDefaultTankGameItems from './setDefaultTankGameItems.js';

Migrations.add({
  version: 23,
  name: 'Add Tank War items',
  up() {
    addTankWarItems();
    setDefaultTankGameItems();
  },
  down() {
  }
});
