import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LectureComponent from '../components/LectureComponent.jsx';

export const composer = ({ context, history, clearErrors, lesson, currentLocale, userLesson, slide, slideContent, studentId }, onData) => {
  const { Meteor, Collections } = context();
  const userId = studentId || Meteor.userId();
  // console.log("in LectureComponent container and lesson is " + JSON.stringify(lesson));
  if (lesson !== null && userLesson!= null) {
    // const userIds = [userId];
    // let users = [];

    // if (Meteor.subscribe('userGetAvatar', userIds).ready()) {
    //   users = Meteor.users.find(
    //     { _id: { $in: userIds } },
    //     {
    //       fields: {
    //         username: 1,
    //         avatar: 1
    //       }
    //     }
    //   ).fetch();
    // }

    onData(null, { userLesson, lesson, history, slide, slideContent, currentLocale });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  handNewUserChatAction: actions.LessonChatAction.handNewUserChatAction,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(LectureComponent);
