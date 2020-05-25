/* global Migrations */
import prepareEvaluation from './prepareEvaluation.js';
import addTestUserData from './addTestUserData';

Migrations.add({
  version: 14,
  name: 'add evaluation data',
  up() {
    prepareEvaluation();
    addTestUserData();
  },
  down() {
  }
});
