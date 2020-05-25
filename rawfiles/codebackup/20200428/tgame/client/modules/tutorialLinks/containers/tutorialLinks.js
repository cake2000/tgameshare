/* global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import TutorialLinksComponent from '../components/tutorialLinks.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { ROLES, MIGRATION_CONST } from '../../../../lib/enum';

export const composer = ({
  Collections, Meteor, history
}, onData) => {
  let games = [];
  const user = Meteor.user();

  if (user && Roles.subscription.ready()) {
    if (Roles.userIsInRole(Meteor.userId(), ROLES.AI)) {
      const isReady = Meteor.subscribe('games.list').ready();
      if (isReady) {
        games = Collections.Games.find({
          _id: {
            $in: [
              MIGRATION_CONST.poolGameId,
              MIGRATION_CONST.tankGameId,
              MIGRATION_CONST.canvasGameId,
              MIGRATION_CONST.algorithmGameId
            ]
          }
        }).fetch();
        onData(null, {
          isReady, user, games
        });
      }
    } else {
      history.push('/gamesBoard');
    }
  }
};

export const depsMapper = ({ Collections, Meteor, LocalState }, actions) => ({
  updateUserLanguageLevel: actions.tutorial.updateUserLanguageLevel,
  tutorialBack: actions.tutorial.tutorialBack,
  updateUserLanguageSkills: actions.tutorial.updateUserLanguageSkills,
  Collections,
  Meteor,
  LocalState
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(TutorialLinksComponent);
