/* eslint object-shorthand: [2, "consistent"]*/
/* eslint-env es6 */
/* eslint no-param-reassign: 0 */
/* eslint no-underscore-dangle: 0 */
/* global SyncedCron */


import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import moment from 'moment';
import { Admin, Games, TournamentSection, Tournament } from '../../lib/collections';
import { TOURNAMENT_SECTION_STATUS, TOURNAMENT_STATUS, TOURNAMENT_REWARD } from '../../lib/enum.js';
import { startTournament } from '../cronjobs/tournament.js';
import { TIMES } from '../../lib/const.js';

export default function () {
  Meteor.methods({
    'adminUpdateHomepage' (homepageData) {
      check(homepageData, Object);
      // if (!user) throw new Meteor.Error(403, 'Your request token for reset password is expired');
      const checkData = Admin.findOne({ type: 'homepage' });

      if (checkData) {
        return Admin.update({ type: 'homepage' }, { $set: { data: homepageData } });
      }
      return Admin.insert({ type: 'homepage', data: homepageData });
    },

    'adminUpdateGame' (gameId, game) {
      check(gameId, Match.Any);
      check(game, Object);
      if (gameId) { Games.update({ _id: gameId }, { $set: game }); } else {
        Games.insert(game);
      }
    },


    'adminUpdateTournament' (tournamentId, tournament) {
      check(tournamentId, Match.Any);
      check(tournament, Object);
      const reward = [];

      for (let i = 0; i < 3; i++) {
        reward.push({
          top: i + 1,
          type: TOURNAMENT_REWARD.MEMBERSHIP
        });
      }
      const sections = tournament.sections;
      const oldTournamentSections = TournamentSection.find({
        tournamentId: tournamentId }).fetch();
      delete tournament.sections;
      if (tournamentId) {
        // Update current tournament
        Tournament.update(
          { _id: tournamentId }, { $set: tournament });
        // Update tournament sections
        _.map(sections, (section) => {
          // if section is exists, just update it
          const sectionNew = {...section};
          delete sectionNew._id;

          if (section._id) {
            TournamentSection.update(
              { _id: section._id }, { $set: sectionNew });
          } else {
            // If sections is not exist, create new tournament section
            const now = new Date();
            section.tournamentId = tournamentId;
            section.type = 'custom';
            section.registeredUserIds = [];
            section.currentRound = 0;
            section.status = TOURNAMENT_SECTION_STATUS.PREPARED;
            section.createdAt = now;
            section.reward = reward;
            section.startTime = now;
            section.announcement = [];
            TournamentSection.insert(section);
          }
        });

        // We need delete section is not exists of a tournament
        _.map(oldTournamentSections, (section) => {
          const checkItem = _.find(sections, item => item._id === section._id);
          if (!checkItem) {
            TournamentSection.remove({ _id: section._id });
          }
        });
      } else {
        tournament.status = TOURNAMENT_STATUS.PREPARED;
        tournament.createdAt = new Date();
        const newTournamentId = Tournament.insert(tournament);
        const newSection = {
          createdAt: new Date(),
          tournamentId: newTournamentId,
          type: 'Registration',
          name: 'New Registration',
          registeredUserIds: [],
          numberOfRounds: 1,
          currentRound: 0,
          status: TOURNAMENT_SECTION_STATUS.PREPARED,
          reward: reward,
          startTime: new Date(),
          announcement: []
        };
        TournamentSection.insert(newSection);


        // Create a cron job to start tournament on time
        const cronjobTime = moment(tournament.startTime)
          .subtract({ minutes: TIMES.START_TOURNAMENT_BEFORE });
        Meteor.defer(() => {
          SyncedCron.add({
            name: `Start tournament ${tournament.Name} - ${newTournamentId}`,
            schedule: parser => parser.cron(cronjobTime.format('m H D M d')),
            job: () => {
              tournament._id = newTournamentId;
              startTournament(tournament);
            }
          });
        });
      }
    },

    'adminUpdateGeneral' (generalData) {
      check(generalData, Object);
      const checkData = Admin.findOne({ type: 'general' });

      if (checkData) {
        return Admin.update({ type: 'general' }, { $set: { data: generalData } });
      }
      return Admin.insert({ type: 'general', data: generalData });
    },
  });
}
