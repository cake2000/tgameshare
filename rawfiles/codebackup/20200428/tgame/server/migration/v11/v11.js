/* global Migrations */
import prepareTournamentTestData from './prepareTournamentTestData';

Migrations.add({
  version: 11,
  name: 'Insert tournament data',
  up() {
    prepareTournamentTestData();
  },
  down() {
    // code to migrate down to version 0

  }
});
