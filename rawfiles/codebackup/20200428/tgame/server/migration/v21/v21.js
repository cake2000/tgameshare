/* global Migrations */
import prepareMultiplayerMode from './prepareMultiplayerMode';

Migrations.add({
  version: 21,
  name: 'update game data',
  up() {
    prepareMultiplayerMode();
  },
  down() {
  }
});
