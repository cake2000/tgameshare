import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import lessonPlanPage from '../components/lessonPlanPage.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import _ from 'lodash';
import { USER_TYPES } from '../../../../lib/enum';

export const composer = ({ context, levelNumber, lessonNumber, history }, onData) => {
  
  const userId = Meteor.userId();
  if (!userId)
      history.push('/signin');
  if (!Meteor.subscribe('usersGetUserData').ready()) return;
  const checkUser = Meteor.user() && Meteor.user().getPerson();
  if (checkUser && _.indexOf(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER) >= 0) {
    onData(null, { levelNumber, lessonNumber });
  } else if (checkUser && _.indexOf(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER) < 0) {
    history.push('/player');
  } else {
    history.push('/player');
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
)(lessonPlanPage);
