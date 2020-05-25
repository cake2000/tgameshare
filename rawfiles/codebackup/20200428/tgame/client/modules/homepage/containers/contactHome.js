import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ContactHome from '../components/contactHome/contactHome.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { LocalState, Meteor, Collections } = context();
  const error = LocalState.get('CONTACT_ERROR');
  const success = LocalState.get('CONTACT_SUCCESS');
  if (Meteor.subscribe('adminGeneralData').ready()) {
    const adminGeneralData = Collections.Admin.findOne({ type: 'general' });
    const adminEmail = adminGeneralData.data.email;
    onData(null, { error, success, adminEmail });
  }
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  contactSubmit: actions.contact.contactSubmit,
  clearErrors: actions.contact.clearErrors,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ContactHome);
