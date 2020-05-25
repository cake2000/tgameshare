import { Random } from 'meteor/random';
import _ from 'lodash';
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import Factories from '../components/Factories.jsx';
import { MIGRATION_CONST, PACKAGE_TYPES } from '../../../../lib/enum.js';
import { UserTest, Games } from '../../../../lib/collections/index.js';

export const composer = ({ context, history }, onData) => {
  const userId = Meteor.userId();
  if (!userId) {
    history.push('/signin');
  }
  const { Collections } = context();

  const usertestHandle = Meteor.subscribe('users.getUserTest');
  const gameHandle = Meteor.subscribe('games.list');
  
  if (usertestHandle.ready() && gameHandle.ready() ) {

    const usertests = UserTest.find({userId}).fetch();
    const games = Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.canvasGameId, MIGRATION_CONST.algorithmGameId, MIGRATION_CONST.tankGameId] } }).fetch();
    for (let k=0; k<games.length; k++) {
      const g = games[k];
      let totalcnt = 0;
      let passcnt = 0;
      for (let j=0; j<usertests.length; j++) {
        const t = usertests[j];
        if (t.gameId == g._id) {
          if (t.testName && t.testResult) {
            totalcnt ++;
            if (t.testResult == "PASS") {
              passcnt ++;
            }
          }
        }
      }
      g.totalcnt = totalcnt;
      g.passcnt = passcnt;
    }
    onData(null, { games });
  } else {
    onData(null, {});
  }
};

export const depsMapper = (context, actions) => ({
  // selectGameTutorial: actions.tutorial.selectGameTutorial,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(Factories);
