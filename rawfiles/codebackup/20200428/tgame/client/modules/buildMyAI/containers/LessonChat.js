import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LessonChat from '../components/LessonChat.jsx';

export const composer = ({ context, history, clearErrors, scenario, studentId }, onData) => {
  const { Meteor, Collections } = context();
  const userId = studentId || Meteor.userId();
  // console.log("in LessonChat container and scenario is " + JSON.stringify(scenario));
  if (scenario !== null && scenario._id) {
    const userChatHandle = Meteor.subscribe('UserChatForScenario', scenario._id, userId);
    if (userChatHandle.ready()) {
      const userChat = Collections.UserChat.findOne({
        scenarioId: scenario._id, userId
      });
      const userIds = userChat ? [
        ...new Set(userChat.chats.filter(item => item.sender && item.sender !== Meteor.userId()).map(item => item.sender))
      ] : [];
      let users = [];

      if (Meteor.subscribe('userGetAvatar', userIds).ready()) {
        users = Meteor.users.find(
          { _id: { $in: userIds } },
          {
            fields: {
              username: 1,
              avatar: 1
            }
          }
        ).fetch();
      }

      onData(null, { userChat, scenario, history, users });
    }
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  handNewUserChatAction: actions.LessonChatAction.handNewUserChatAction,
  initializeUserChat: actions.LessonChatAction.initializeUserChat,
  initializeUserChatUser: actions.LessonChatAction.initializeUserChatUser,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(LessonChat);
