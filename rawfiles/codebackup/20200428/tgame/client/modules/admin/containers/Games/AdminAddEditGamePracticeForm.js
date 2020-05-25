import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminAddEditGamePracticeForm from '../../components/Games/AdminAddEditGamePracticeForm.jsx';
import { unlimitedSubsCache } from '../../../../cache/index';

export const composer = ({ context, clearErrors, tutorialId }, onData) => {
  const { LocalState, Collections } = context();
  const err = LocalState.get('ADMIN_GAME_ERROR');
  if (tutorialId) {
    if (unlimitedSubsCache.subscribe('testcases.one', tutorialId).ready()) {
      const lesson = Collections.Scenarios.findOne(tutorialId);
      onData(null, { err, lesson });
    }
  } else {
    onData(null, { err, lesson: null });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminAddEditGamePracticeForm);
