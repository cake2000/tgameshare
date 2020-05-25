import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import StudentList from '../components/StudentList.jsx';

export const composer = ({ context, clearErrors }, onData) => {
  const { Collections } = context();
  const person = Meteor.user().getPerson();
  let students = [];

  if (person.teacherProfile.paidStudents && Meteor.subscribe('users.getStudentsInfo', person.teacherProfile.paidStudents).ready()) {
    students = Meteor.users.find({ _id: { $in: person.teacherProfile.paidStudents } }, {
      fields: {
        username: 1,
        emails: 1,
        profile: 1
      }
    }).map(student => ({
      _id: student._id,
      fullName: `${student.profile.firstName || ''} ${student.profile.lastName || ''}`,
      username: student.username,
      email: student.emails[0].address
    }));
  }
  onData(null, { students });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  cancelStudentSubscription: actions.account.cancelStudentSubscription,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(StudentList);
