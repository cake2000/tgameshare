import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import GameContents from '../components/GameContents.jsx';
import LoadingPage from '../../loading/components/loadingPage.jsx';

export const composer = ({ context, gameSelected }, onData) => {
  const { Meteor, Collections } = context();

  if (Meteor.subscribe('UserAICodeProd', gameSelected._id, 'Standard').ready()) {
    const gamesRelease = Collections.UserAICodeProd.find({
      userId: Meteor.userId(), gameId: gameSelected._id, SubTrackName: 'Standard'
    }, { sort: { releasedAt: -1 } }).fetch();

    onData(null, { gamesRelease, gameSelected });
  }
};

export const depsMapper = (context, actions) => ({
  showWarningModal: actions.gamesBoard.showWarningModal,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(GameContents);
