import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminGeneral from '../../components/General/AdminGeneral.jsx';

export const composer = ({ context, clearErrors, gameId }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_GENERAL_ERROR');
  if (Meteor.subscribe('adminGeneralData').ready()) {
    const generalData = Collections.Admin.findOne({ type: 'general' });
    onData(null, { err, generalData: generalData.data });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  updateGeneral: actions.admin.updateGeneral,
  clearErrors: actions.admin.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(AdminGeneral);
