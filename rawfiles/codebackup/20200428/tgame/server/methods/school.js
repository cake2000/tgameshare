import { check, Match } from 'meteor/check';
import { Schools } from '/lib/collections';

export default function() {
  Meteor.methods({
    getSchools: (value, page) => {
      check(value, String);
      check(page, Match.Maybe(String));

      let schools = [];
      const query = { SchoolName: { $regex: new RegExp(value, 'i'), $ne: '' } };

      if (page) {
        const schoolId = Meteor.users.findOne(Meteor.userId()).profile.school;

        if (schoolId) {
          query._id = {
            $ne: schoolId
          };
        }
        if (page === 'profile') {
          const schoolData = Schools.findOne(schoolId, { fields: { SchoolName: 1 } });

          if (schoolData) {
            schools.push(schoolData);
          }
        } else if (page === 'leaderBoard') {
          schools = [
            {
              _id: 'All',
              SchoolName: 'All Schools'
            }
          ];
          if (schoolId) {
            schools.push({
              _id: schoolId,
              SchoolName: 'My School'
            });
          }
        }
      }
      schools.push(...Schools.find(query, { fields: { SchoolName: 1 }, limit: 50 }).fetch());
      return schools;
    }
  });
}
