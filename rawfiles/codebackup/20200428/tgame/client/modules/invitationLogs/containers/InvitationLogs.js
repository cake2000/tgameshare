import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import InvitationLogs from '../components/InvitationLogs.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context }, onData) => {
  const { LocalState } = context();
  const isLoading = LocalState.get('INVITATION_LOG_LOADING');
  onData(null, { isLoading });
};

export const depsMapper = (context, actions) => ({
  decline: actions.invite.decline,
  accept: actions.invite.accept,
  joinRoom: actions.tournament.joinRoom,
  cancel: actions.tournament.cancel,
  createGameRoom: actions.gamesBoard.createGameRoom,
  invitePlayer: actions.gameRoom.invitePlayer,
  fetchInvitationLogs: actions.invitationLogs.fetchInvitationLogs,
  setAllNotiAsRead: actions.invite.setAllNotiAsRead,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper),
)(InvitationLogs);
