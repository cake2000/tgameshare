import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Classes, Games, Scenarios, UserScenarios } from '../../lib/collections';

export default function () {
  Meteor.publish('classes.list', () => {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('user is not found');
    }
    const classesCursor = Classes.find(
      { owner: userId },
      {
        fields: {
          class_id: 1,
          name: 1,
          createdTime: 1,
          gameName: 1,
          numbOfStudents: 1,
          showSolutionButton: 1,
          isScreenLocked: 1,
          showFastForwardButton: 1,
          isScreenLocked: 1,
          userGroupID: 1,
          owner: 1,
          game: 1,
          users: 1,
        },
        sort: {
          createdTime: -1,
        }
      });
    const gamesCursor = Games.find(
      {},
      {
        fields: {
          title: 1
        }
      }
    );
    return [
      classesCursor,
      gamesCursor,
    ];
  });


  Meteor.publish('allusertestsforstudents', (classId) => {
    check(classId, String);
    const c = Classes.findOne(classId);
    if (!c) return [];
    return [
      UserScenarios.find(
        {
          userId: { $in: c.users }
        },
        {
          fields: {
            ScenarioName: 1, userId: 1
          }
        }
      )
    ];
  });

  Meteor.publish('classes.single', (classId) => {
    check(classId, String);

    return Classes.find({ _id: classId });
  });

  
  Meteor.publish('mysuperclassusers', () => {
    if (!Meteor.userId()) {
      return [];
    }
    const userId = Meteor.userId();
    if (!["ScDM5NzhdHgyyHsYw", "ScDM5NzhdHgyyHsYw", "kEmnDrYssC2gKNDxx"].includes(Meteor.userId())) {
      return [];
    }
    // console.log("before return " + userId);
    // return Meteor.users.find({}, {fields: {username: 1, avatar: 1}});
    return Meteor.users.find({ $and: [
      {username: { $not: /autorunner_/i } },
      {username: { $not: /^TestAI/i } },
    ]  }, {fields: {username: 1, avatar: 1, isGrandfathered: 1, canViewSchool: 1}});

    
  });
}
