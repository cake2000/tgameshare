import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import TeacherPage from '../components/teacherPage.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import { Classes, UserScratchAIFile, Games } from '../../../../lib/collections';
import _ from 'lodash';
import { USER_TYPES } from '../../../../lib/enum';

export const composer = ({ context, history }, onData) => {
  const classListHandle = Meteor.subscribe('classes.list');
  const fileListHandle = Meteor.subscribe('allmystudentswithbattlecode');
  const studentListHandle = Meteor.subscribe('allmybattlestudents');
  
  const userId = Meteor.userId();
  if (!userId)
      history.push('/signin');
  if (!Meteor.subscribe('usersGetUserData').ready()) return;
  const checkUser = Meteor.user() && Meteor.user().getPerson();

  if (checkUser && _.indexOf(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER) >= 0) {
    if (classListHandle.ready() && studentListHandle.ready() && fileListHandle.ready() ) {
      const classes = Classes.find({ owner: userId }).map(c => ({ ...c}));
      const filesWithCode = UserScratchAIFile.find({}).fetch();
      let studentsWithCodeIDs = [];
      filesWithCode.forEach(file => studentsWithCodeIDs.push(file.UserID));

      const students = Meteor.users.find(
        {
        },
        {
          fields: {
            username: 1,
            'emails': 1,
          }
        }
      ).fetch();
      const studentsWithCode = students.filter(s => studentsWithCodeIDs.includes(s._id));
      onData(null, { classes, students, studentsWithCode });
    }
  } else if (checkUser && _.indexOf(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER) < 0) {
    history.push('/player');
  } else {
    history.push('/player');
  }
};

export const depsMapper = (context, actions) => {
  return ({
    addClass: actions.teacherPage.addClass,
    removeClass: actions.teacherPage.removeClass,
    renameClass: actions.teacherPage.renameClass,
    context: () => context,
  });
};

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper),
)(TeacherPage);
