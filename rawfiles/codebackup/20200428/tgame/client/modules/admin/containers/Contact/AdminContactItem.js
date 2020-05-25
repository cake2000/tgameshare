import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import AdminContactItem from '../../components/Contact/AdminContact.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections, Meteor, LocalState } = context();
  const err = LocalState.get('ADMIN_CONTACT_ERROR');

  if (Meteor.subscribe('adminGetContactData').ready()) {
    const contacts = Collections.Contact.find().fetch();
    onData(null, { err, contacts });
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
)(AdminContactItem);
