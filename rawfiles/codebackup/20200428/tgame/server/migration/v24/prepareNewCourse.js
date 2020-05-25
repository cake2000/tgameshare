/**
 * new lessons for pool game
 *
 */
import {
  Games, Lessons, SlideContent, UserChat, UserCodeTesting
} from '../../../lib/collections';
import {
  LEVELS, OPPONENTS, TUTORIAL_GROUP, MIGRATION_CONST
} from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;
const htmlparser = require('htmlparser2');
const fs = require('fs');


var gameLessonScenarioData = [];
var lessonNumber = 0;


// lesson 0
var sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Pool Game Introduction',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Game Rules, Winning Strategies',  
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


// lesson 1
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Using Coordinates To Aim Shots',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Coordinates, Aiming Point',
  studyTime: "15 to 25 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


// lesson 2
lessonNumber++;
sid = `pool_lesson_${lessonNumber}`;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Introducing Objects',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Objects, Shot Command',
  studyTime: "15 to 25 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);

// lesson 3
lessonNumber++;
sid = `pool_lesson_${lessonNumber}`;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Introducing Functions',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Functions',
  studyTime: "15 to 25 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// lesson 4
lessonNumber++;
sid = `pool_lesson_${lessonNumber}`;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[4] Calculating the Aiming Point',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Functions',
  studyTime: "15 to 25 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


// lesson 5
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[5] Shot Success Probability',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Success Probability, Logging',  
  studyTime: "15 to 25 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);





const prepareNewCourse = () => {
  Lessons.remove({gameId: poolGameId});
  let id = 0;
  _.map(gameLessonScenarioData, (doc) => {
    doc._id = `L${id++}`;
    console.log(`inserting newdoc ${doc._id} ${doc.LessonSequenceNumber}`);
    Lessons.insert(doc);
  });
};

export default prepareNewCourse;
// export removeLessonLessons;

