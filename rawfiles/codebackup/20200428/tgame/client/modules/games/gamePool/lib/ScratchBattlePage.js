import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ScratchBattlePage from './ScratchBattlePage.jsx';
import LoadingPage from '../../../loading/components/loadingPage.jsx';
import { UserScratchAIFile, Classes, Games } from '../../../../../lib/collections';
import _ from 'lodash';
import { USER_TYPES } from '../../../../../lib/enum';

export const composer = ({ context, history, playerinfo, playerinfo2 }, onData) => {
  let parts = playerinfo.split("|");
  let userid1 = parts[1];
  let userid2 = parts[2];
  let gameId = parts[3];
  let studentListHandle = null;
  if (playerinfo=="") {
    // one student challenging another
    parts = playerinfo2.split("|");
    userid1 = Meteor.userId();
    user2key = parts[1];
    userid2 = parts[2];
    gameId = parts[3];
    studentListHandle = Meteor.subscribe('allmybattlestudentscode2', gameId, [userid2, user2key]);
  } else {
    // teacher or admin running battle between students
    studentListHandle = Meteor.subscribe('allmybattlestudentscode', gameId, [userid1, userid2]);

  }
  
  const userId = Meteor.userId();
  if (!userId)
      history.push('/signin');
  if (!Meteor.subscribe('usersGetUserData').ready()) return;
  const checkUser = Meteor.user() && Meteor.user().getPerson();

  if (playerinfo=="" || (checkUser && _.indexOf(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER) >= 0)) {
    if (studentListHandle.ready() ) {
      const students = Meteor.users.find(
        {
          _id: {$in: [userid1, userid2]}
        },
        {
          fields: {
            username: 1,
            'emails': 1,
          }
        }
      ).fetch();

      const rawaicode = UserScratchAIFile.find(
        {
          UserID: {$in: [userid1, userid2]}
        }
      ).fetch();

      let aicode = [];
      if (rawaicode[0].UserID == userid1) {
        aicode.push(rawaicode[0]);
      } 
      if (rawaicode.length > 1 && rawaicode[1].UserID == userid1) {
        aicode.push(rawaicode[1]);
      }

      if (rawaicode[0].UserID == userid2) {
        aicode.push(rawaicode[0]);
      } 
      if (rawaicode.length > 1 && rawaicode[1].UserID == userid2) {
        aicode.push(rawaicode[1]);
      }

      onData(null, { students, aicode });
    }
  } else if (checkUser && _.indexOf(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER) < 0) {
    history.push('/gamesBoard');
  }
};

export const depsMapper = (context, actions) => {
  return ({
    context: () => context,
  });
};

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper),
)(ScratchBattlePage);
