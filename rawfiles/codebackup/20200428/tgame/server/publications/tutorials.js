import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {
  Scenarios, Lessons, UserChat, UserScenarios, UserLesson, SlideContent
} from '../../lib/collections';

export default function () {
  Meteor.publish('tutorials.list', (gameId) => {
    check(gameId, Match.Maybe(String));
    const self = this;
    const tutorialListHandle = Scenarios.find({ gameId }).observe({
      added (scenarios) {
        self.added('Scenarios', scenarios._id, scenarios);
      }
    });
    self.ready();
    self.onStop(() => {
      tutorialListHandle.stop();
    });
  });

  Meteor.publish('user.scenarios', function getScenarios(gameId) {
    check(gameId, Match.Maybe(String));
    if (!this.userId) return this.ready();

    return UserScenarios.find({ gameId, userId: this.userId },
      {
        fields: {
          _id: 1,
          userId: 1,
          ScenarioName: 1,
          ScenarioSequenceNumber: 1,
          gameId: 1
        }
      });
  });

  Meteor.publish('scenarios.list.system', (gameId) => {
    check(gameId, Match.Maybe(String));
    // console.log(`publishing scenarios ${Scenarios.find({ gameId }).count()} `);
    return Scenarios.find({ gameId, userId: 'system' }, {
      fields: {
        _id: 1,
        userId: 1,
        package: 1,
        coins: 1,
        concepts: 1,
        studyTime: 1,
        ScenarioName: 1,
        ScenarioSequenceNumber: 1,
        Difficulty: 1,
        locked: 1,
        gameId: 1,
        gameName: 1,
        group: 1
      }
    });
  });

  Meteor.publish('userscenario.byId', (_id) => {
    check(_id, String);
    const selector = { _id };
    return UserScenarios.find(selector);
  });

  Meteor.publish('scenario.byId', (id) => {
    check(id, String);
    const selector = { _id: id };
    return Scenarios.find(selector);
  });

  Meteor.publish('lesson.byId', (_id) => {
    check(_id, String);
    const selector = { _id };
    return Lessons.find(selector);
  });

  Meteor.publish('lesson.byGameIds', (gameId) => {
    check(gameId, String);
    const selector = { gameId };
    return Lessons.find(selector);
  });

  Meteor.publish('AllSlideContent', (fileId) => {
    check(fileId, String);
    return SlideContent.find({ _id: fileId }, {
      fields: { content: 0 }
    });
  });

  Meteor.publish('AllUserLesson', (lessonId, userId) => {
    check(lessonId, Match.Maybe(String));
    check(userId, Match.Maybe(String));
    // console.log("AllUserLesson: try to find " + lessonId + " for " + userId);
    let res = [];
    try {
      res = UserLesson.find({ userId, lessonId });
    } catch (e) {
      console.log(`error ${e}`);
    }
    return res;
  });

  Meteor.publish('AllUserLessonLogs', () => {
    let res = [];
    if (!Meteor.userId()) return [];
    // console.log("in AllUserLessonLogs 2 " + Meteor.userId());
    try {
      res = UserLesson.find({ userId: Meteor.userId() }, {fields: {lessonId: 1, userId: 1, 'slideVisitLog.slideId': 1, 'slideVisitLog.slideType': 1}});
      // res = UserLesson.find({ userId: Meteor.userId() }, {fields: {lessonId: 1, userId: 1}} );
    } catch (e) {
      console.log(`error ${JSON.stringify(e)}`);
    }
    return res;
  });

  Meteor.publish('UserChatForScenario', (scenarioId, userId) => {
    check(scenarioId, Match.Maybe(String));
    check(userId, Match.Maybe(String));

    return UserChat.find({ userId, scenarioId });
  });

  Meteor.publish('scenario.getListForStudent', (scenarioIds) => {
    check(scenarioIds, Array);

    return Scenarios.find(
      {
        _id: { $in: scenarioIds }
      },
      {
        fields: {
          ScenarioName: 1
        }
      }
    );
  });

  Meteor.publish('allscenariolist', () => {
    return Scenarios.find(
      {
      },
      {
        fields: {
          ScenarioName: 1,
          package: 1,
          ScenarioSequenceNumber: 1,
        }
      }
    );
  });

  Meteor.publish('alllessonlist', () => {
    return Lessons.find(
      {
      },
      {
        fields: {
          LessonName: 1,
          package: 1,
          LessonSequenceNumber: 1,
          slideFileId: 1
        }
      }
    );
  });


}
