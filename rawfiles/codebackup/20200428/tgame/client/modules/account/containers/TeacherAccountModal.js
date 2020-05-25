import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import TeacherAccountModal from '../components/TeacherAccountModal.jsx';
import { ADMIN_PUBLICATION } from '../../../../lib/enum.js';

export const depsMapper = (context, actions) => {
  return ({
    context: () => context,
    registerAsTeacher: actions.account.registerAsTeacher,
  });
};

export default composeAll(
  useDeps(depsMapper)
)(TeacherAccountModal);
