import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import ManageTeacherSection from '../components/ManageTeacherSection.jsx';
import { USER_TYPES } from '../../../../lib/enum.js';
import { Persons } from '../../../../lib/collections';

export const composer = ({ context, clearErrors, profile }, onData) => {
  const { Collections } = context();
  let teacherList = [];
  let registeredClasses = [];
  const classIdList = profile.inClasses ? profile.inClasses.map(classData => classData.classId) : [];

  if (Meteor.subscribe('users.teacherList', classIdList).ready() &&
    Meteor.subscribe('games.list').ready()) {
    const personCursor = Persons.find(
      {
        type: USER_TYPES.TEACHER
      },
      {
        fields: {
          userId: 1,
          type: 1,
          teacherProfile: 1,
        }
      }
    );
    const teacherIds = personCursor.map(person => person.userId);
    teacherList = Meteor.users.find(
      {
        _id: { $in: teacherIds }
      }
    ).map(item => ({ value: item._id, label: `${item.profile.firstName} ${item.profile.lastName} (${item.username})` }));

    if (classIdList.length > 0 && profile.inClasses) {
      registeredClasses = profile.inClasses.map((item) => {
        const classDetail = Collections.Classes.findOne(item.classId);
        const gameDetail = Collections.Games.findOne(classDetail.game) || {};
        const teacherDetail = Meteor.users.findOne(classDetail.owner);
        return {
          name: classDetail.name || '',
          gameName: gameDetail.title || '',
          _id: classDetail._id,
          teacherName: `${teacherDetail.profile.firstName} ${teacherDetail.profile.lastName}`,
          owner: classDetail.owner,
          status: item.status
        };
      });
    }
    
  }
  onData(null, { teacherList, registeredClasses });
  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  addNewClass: actions.account.addNewClass,
  removeClass: actions.account.removeClass,
  updateClass: actions.account.updateClass,
  getClassesForTeacher: actions.account.getClassesForTeacher,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(ManageTeacherSection);
