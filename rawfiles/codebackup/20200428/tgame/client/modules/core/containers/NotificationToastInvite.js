import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import NotificationToastInvite from '../components/Notification/NotificationToast/NotificationToastInvite.jsx';

export const composer = ({ context, notiId }, onData) => {
  const { Collections: { Notifications, Games }, Meteor } = context();
  let notification = null;
  let game = null;
  let sender = null;
  const handleNoti = Meteor.subscribe('notification.getSingleNotification', notiId);

  if (handleNoti.ready()) {
    notification = Notifications.findOne({ _id: notiId });
    game = Games.findOne({ _id: notification.game.id });
    sender = Meteor.users.findOne({ _id: notification.sender.userId });
  }

  onData(null, { game, notification, sender });
};

export const depsMapper = (context, actions) => ({
  decline: actions.invite.decline,
  accept: actions.invite.accept,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(NotificationToastInvite);
