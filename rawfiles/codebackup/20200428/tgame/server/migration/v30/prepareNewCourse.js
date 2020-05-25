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
const canvasGameId = MIGRATION_CONST.canvasGameId;
const algorithmGameId = MIGRATION_CONST.algorithmGameId;
const tankGameId = MIGRATION_CONST.tankGameId;
const scratchGameId = MIGRATION_CONST.scratchGameId;
const flappybirdGameId = MIGRATION_CONST.flappybirdGameId;
const scratchSoccerGameId = MIGRATION_CONST.scratchSoccerGameId;
const drawingturtleGameId = MIGRATION_CONST.drawingturtleGameId;
const kturtleGameId = MIGRATION_CONST.ia_k_turtleGameId;

const generalconceptsGameId = MIGRATION_CONST.generalconceptsGameId;
const scratchtankGameId = MIGRATION_CONST.scratchtankGameId;
const tankscratch2GameId = MIGRATION_CONST.tankscratch2GameId;
const candycrushGameId = MIGRATION_CONST.candycrushGameId;
const appleharvestGameId = MIGRATION_CONST.appleharvestGameId;
const recyclerGameId = MIGRATION_CONST.recyclerGameId;
const codinggameGameId = MIGRATION_CONST.codinggameGameId;
const algoScratchGameId = MIGRATION_CONST.algoScratchGameId;
const mazeGameId = MIGRATION_CONST.mazeGameId;
const schoolAGameId = MIGRATION_CONST.schoolAGameId;

const htmlparser = require('htmlparser2');
const fs = require('fs');


var gameLessonScenarioData = [];
var lessonNumber = 0;


// // lesson 0
// var sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[0] Introduction To The Trajectory Pool Game ',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Game Rules, Winning Strategies',  
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 1
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[1] Using Coordinates To Aim Shots',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Coordinates, Aiming Point',
//   studyTime: "20 to 30 minutes",
//   Difficulty: 1,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);

// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 1]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Coordinates, Aiming Point',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 2
// lessonNumber++;
// sid = `pool_lesson_${lessonNumber}`;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[2] Shot Command Objects',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Objects, Shot Command',
//   studyTime: "30 to 45 minutes",
//   Difficulty: 2,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);


// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 2]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Objects, Shot Command',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 3
// lessonNumber++;
// sid = `pool_lesson_${lessonNumber}`;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[3] Your First Game Bot',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Functions',
//   studyTime: "30 to 45 minutes",
//   Difficulty: 2,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 3]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Functions',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 4
// lessonNumber++;
// sid = `pool_lesson_${lessonNumber}`;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[4] Calculating the Aiming Point',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Geometry For Aiming, Arrays',
//   studyTime: "30 to 40 minutes",
//   Difficulty: 2,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);


// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 4]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Geometry For Aiming, Arrays',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 5
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[5] Shot Success Probability',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Success Probability, Console Logging',  
//   studyTime: "20 to 30 minutes",
//   Difficulty: 2,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);


// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 5]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Geometry For Aiming, Arrays',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 2,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 6
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[6] Choosing A Better Shot',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Comparison and Logical Operators, Conditional Statement',  
//   studyTime: "35 to 50 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);


// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 6]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Comparison and Logical Operators, Conditional Statement',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 7
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[7] Checking All Pockets',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'For-Loop, Arrays',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 7]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'For-Loop, Arrays',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 8
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[8] Review',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Everything so far',  
//   studyTime: "30 to 40 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 8]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Everything so far',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 9
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[9] Checking All Pockets And All Balls',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Nested for-loops',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);


// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 9]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Nested for-loops',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 10
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[10] Placing Cue Ball By Hand',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Problem-solving strategy',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 10]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Problem-solving strategy',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 11
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[11] Improving How Variables Are Used',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'const, let, variable scope',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 11]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'const, let, variable scope',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 12
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[12] Review and Release',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'variables, operators, structures, patterns, releases',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 4,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 12]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'const, let, variable scope',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 4,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 12.5
// // lessonNumber ++;
// sid = "pool_lesson_12.5";
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[ToolBox] Designing Test Cases For Your Factory',
//   LessonSequenceNumber: 12.5,
//   coins: 1000,
//   concepts: 'Test-Driven Development',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L12.5`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 13
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[13] Accelerating Your Game Bot',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1200,
//   concepts: 'continue and break',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
// };
// gameLessonScenarioData.push(lessonObj);


// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 13]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'continue and break',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 14
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[14] Skipping Shots With Bad Angles',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1200,
//   concepts: 'angles, continue and break',  
//   studyTime: "25 to 35 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
// };
// gameLessonScenarioData.push(lessonObj);



// sid = "pool_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 14]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'angles, continue and break',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 15
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[15] How To Make An Awesome Kick Shot',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1500,
//   concepts: 'trial and error, physics of rebound',  
//   studyTime: "35 to 50 minutes",
//   Difficulty: 4,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
// };
// gameLessonScenarioData.push(lessonObj);

// // lesson 16
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[16] Kick Shots: The Full Solution',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1500,
//   concepts: 'function refactor',  
//   studyTime: "35 to 50 minutes",
//   Difficulty: 4,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 17
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[17] Bank Shots: The Full Solution',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1500,
//   concepts: 'trial and error revisited',  
//   studyTime: "35 to 50 minutes",
//   Difficulty: 4,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 18
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[18] Combo Shots',
//   LessonSequenceNumber: lessonNumber,
//   coins: 2000,
//   concepts: 'balance speed and accuracy',  
//   studyTime: "40 to 60 minutes",
//   Difficulty: 5,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
// };
// gameLessonScenarioData.push(lessonObj);

// // lesson 19
// lessonNumber ++;
// sid = "pool_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[19] End State of Your Shot',
//   LessonSequenceNumber: lessonNumber,
//   coins: 2000,
//   concepts: 'Multi-step Optimization',  
//   studyTime: "40 to 60 minutes",
//   Difficulty: 5,
//   gameId: poolGameId,
//   gameName: 'TrajectoryPool',
//   slideFileId: sid,
//   _id: `L${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.ADVANCED_TECH
// };
// gameLessonScenarioData.push(lessonObj);





// new canvas lessons
lessonNumber = 0;

// lesson 0
var sid = "canvasjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Introduction ',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'test',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: canvasGameId,
  gameName: 'Canvas Drawing',
  slideFileId: sid,
  _id: `LCJ${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




// new coding games
lessonNumber = 0;

// lesson 0
var sid = "codinggame_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Candy Crush',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: '2D coordinates',
  studyTime: "15 to 25 minutes",
  Difficulty: 3,
  gameId: codinggameGameId,
  gameName: 'Coding Game',
  slideFileId: sid,
  _id: `LNCG${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);

// lesson 1
lessonNumber++;
var sid = "codinggame_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Drawing Turtle Jr',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: '2D coordinates',
  studyTime: "15 to 25 minutes",
  Difficulty: 1,
  gameId: codinggameGameId,
  gameName: 'Coding Game',
  slideFileId: sid,
  _id: `LNCG${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// lesson 2
lessonNumber++;
var sid = "codinggame_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Drawing Turtle Sr',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: '2D coordinates',
  studyTime: "15 to 25 minutes",
  Difficulty: 2,
  gameId: codinggameGameId,
  gameName: 'Coding Game',
  slideFileId: sid,
  _id: `LNCG${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


// lesson 3
lessonNumber++;
var sid = "codinggame_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Flappy Bird',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Timing Control',
  studyTime: "15 to 25 minutes",
  Difficulty: 1,
  gameId: codinggameGameId,
  gameName: 'Coding Game',
  slideFileId: sid,
  _id: `LNCG${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// lesson 4
lessonNumber++;
var sid = "codinggame_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[4] 3D Maze Escape',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: '3D Navigation',
  studyTime: "15 to 25 minutes",
  Difficulty: 2,
  gameId: codinggameGameId,
  gameName: 'Coding Game',
  slideFileId: sid,
  _id: `LNCG${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// new algo in scratch lessons
lessonNumber = 0;

// lesson 0
var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[0] Swapping Values',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'swap between 2 variables',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




// lesson 1
lessonNumber ++;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[1] Bubble Sort',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'sorting with neighbor swaps',
  studyTime: "25 to 35 minutes",
  Difficulty: 2,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// lesson 2
lessonNumber ++;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[2] Selection Sort',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'sorting by selecting',
  studyTime: "25 to 35 minutes",
  Difficulty: 2,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




// lesson 3
lessonNumber ++;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[3] Insertion Sort',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'sorting by insertion',
  studyTime: "25 to 35 minutes",
  Difficulty: 2,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




// lesson 4
lessonNumber ++;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[4] Recursion',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'recursion',
  studyTime: "25 to 35 minutes",
  Difficulty: 2,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);





// new recycler lessons
lessonNumber = 0;

// lesson 0
var sid = "recycler_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] All-in-one Introduction',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'game AI introduction',
  studyTime: "35 to 45 minutes",
  Difficulty: 2,
  gameId: recyclerGameId,
  gameName: 'Super Recycler',
  slideFileId: sid,
  _id: `LSR${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



lessonNumber ++;

sid = "recycler_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] A Simple AI Player',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'moving and waiting commands',
  studyTime: "25 to 40 minutes",
  Difficulty: 1,
  gameId: recyclerGameId,
  gameName: 'Super Recycler',
  slideFileId: sid,
  _id: `LSR${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);





lessonNumber ++;

sid = "recycler_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Waste Item Selection',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'compare and search',
  studyTime: "25 to 40 minutes",
  Difficulty: 2,
  gameId: recyclerGameId,
  gameName: 'Super Recycler',
  slideFileId: sid,
  _id: `LSR${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);





lessonNumber ++;

sid = "recycler_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Making Upgrades',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'compare and search',
  studyTime: "25 to 40 minutes",
  Difficulty: 2,
  gameId: recyclerGameId,
  gameName: 'Super Recycler',
  slideFileId: sid,
  _id: `LSR${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




lessonNumber ++;

sid = "recycler_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[4] Making Upgrades (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'compare and search',
  studyTime: "25 to 40 minutes",
  Difficulty: 2,
  gameId: recyclerGameId,
  gameName: 'Super Recycler',
  slideFileId: sid,
  _id: `LSR${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



lessonNumber ++;

sid = "recycler_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[5] Next Steps',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Optimization Strategy',
  studyTime: "10 to 1000 minutes",
  Difficulty: 3,
  gameId: recyclerGameId,
  gameName: 'Super Recycler',
  slideFileId: sid,
  _id: `LSR${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




/*
// new tank lessons
lessonNumber = 0;


// lesson 0
var sid = "tank_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Introduction to the Smart Tank Game',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Game Rules, Winning Strategies',  
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


// lesson 1
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] A Silly Walker',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Functions',  
  studyTime: "30 to 45 minutes",
  Difficulty: 1,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Functions',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// lesson 2
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Get to Know Your Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Objects, Console Log',  
  studyTime: "30 to 45 minutes",
  Difficulty: 1,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Objects, Console Log',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);




// lesson 3
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Know Your Enemy',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Arrays, Coordinate System',  
  studyTime: "30 to 45 minutes",
  Difficulty: 2,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Arrays, Coordinate System',
  studyTime: "10 to 15 minutes",
  Difficulty: 2,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// lesson 4
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[4] Shooting at a White Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Comparison and Logic',  
  studyTime: "30 to 45 minutes",
  Difficulty: 2,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);




sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 4]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Comparison and Logic',
  studyTime: "10 to 15 minutes",
  Difficulty: 2,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);


// lesson 5
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[5] Attacking All White Tanks Automatically',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'For-Loops, Continue',  
  studyTime: "35 to 50 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Comparison and Logic',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);



// lesson 6
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[6] Analyzing the Battlefield',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: '2D Arrays, Hard-coded Numbers',  
  studyTime: "35 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);




sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: '2D Arrays, Hard-coded Numbers',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);


// lesson 7
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[7] The Path Blockage Problem',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Removing Hard-coded Numbers',  
  studyTime: "30 to 40 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);


sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 7]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Removing Hard-coded Numbers',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);




// lesson 8
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[8] Moving Towards a Target Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Greedy Algorithm, Manhattan Distance',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};

gameLessonScenarioData.push(lessonObj);


sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 8]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Greedy Algorithm, Manhattan Distance',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);



// lesson 9
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[9] Collecting Crystals and Weapons',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Code Refactoring, Shortest Path',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 9]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Code Refactoring',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};
gameLessonScenarioData.push(lessonObj);



// lesson 10
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[10] Allocating Power Points',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Rule based system',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};

gameLessonScenarioData.push(lessonObj);


sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 10]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Rule based system',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};
gameLessonScenarioData.push(lessonObj);



// lesson 11
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[11] Attacking Opponent Tanks',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Number-based decision making',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 11]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Number-based decision making',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};
gameLessonScenarioData.push(lessonObj);


// lesson 12
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[12] Review',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Everything So Far',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 12]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Everything so far',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};
gameLessonScenarioData.push(lessonObj);


// lesson 12.5
// lessonNumber ++;
sid = "tank_lesson_12.5";
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[ToolBox] Designing Test Cases for Your Factory',
  LessonSequenceNumber: 12.5,
  coins: 1200,
  concepts: 'Test-Driven Development',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT12.5`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};
gameLessonScenarioData.push(lessonObj);


// lesson 13 final exam

lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[13] Exam',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Review of all concepts',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3
};

gameLessonScenarioData.push(lessonObj);


// lesson 14
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[14] Shortest Path - A* Search Algorithm',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'A* Search Algorithm',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};

gameLessonScenarioData.push(lessonObj);




sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 14]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'A* Search Algorithm',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};
gameLessonScenarioData.push(lessonObj);



// lesson 15
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[15] Shortest Path - A* Search Algorithm II',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'A* Search Algorithm, Nested For-Loop, 2D Array Traverse',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 15]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'A* Search Algorithm II',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};
gameLessonScenarioData.push(lessonObj);



// lesson 16
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[16] Collecting the Closest Crystals First',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Compare and Select',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};

gameLessonScenarioData.push(lessonObj);


sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 16]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Compare and Select',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};
gameLessonScenarioData.push(lessonObj);



// lesson 17
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[17] Attacking the Closest White Tanks First',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Arrow Function, Array Methods',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};

gameLessonScenarioData.push(lessonObj);




sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 17]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Arrow Function, Array Methods',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};
gameLessonScenarioData.push(lessonObj);



// lesson 18
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[18] Grabbing the Best Weapon',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Lookup Table, Global Variable',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};

gameLessonScenarioData.push(lessonObj);


sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 18]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Lookup Table',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK
};
gameLessonScenarioData.push(lessonObj);


// lesson 19
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[19] Avoiding Dangerous Areas',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Danger Score, 2D Array Revisit',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DANGEROUS_SITUATIONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 19]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Danger Score, 2D Array Revisit',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DANGEROUS_SITUATIONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 20
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[20] Escaping from Dangerous Places',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Danger Score, Linear Search',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DANGEROUS_SITUATIONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 20]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Danger Score, Linear Search',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DANGEROUS_SITUATIONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 21
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[21] Considering Opponent Actions",
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Game Theory',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.OPTIMIZE_YOUR_ROBOT_TANK_II
};

gameLessonScenarioData.push(lessonObj);



sid = "tank_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[Homework 21]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Game Theory',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.ADVANCED.OPTIMIZE_YOUR_ROBOT_TANK_II
};
gameLessonScenarioData.push(lessonObj);


// lesson 22
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[22] End Game Strategies",
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Strategies in End-Game Mode',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.OPTIMIZE_YOUR_ROBOT_TANK_II
};

gameLessonScenarioData.push(lessonObj);

// lesson 23
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[23] The Range of Special Weapons",
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Leveraging Weapon's Range",
  studyTime: "30 to 45 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_SPECIAL_WEAPONS
};

gameLessonScenarioData.push(lessonObj);

// lesson 24
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[24] Attacking Multiple Tanks in One Shot",
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Leveraging Weapon's Range",
  studyTime: "30 to 45 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_SPECIAL_WEAPONS
};

gameLessonScenarioData.push(lessonObj);

// lesson 25
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[25] Special Strategies for the Freezer",
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Strategy Design",
  studyTime: "30 to 45 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_SPECIAL_WEAPONS
};

gameLessonScenarioData.push(lessonObj);


// lesson 26
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[26] Teamwork Preparation",
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Switch, Leader Election, Communication Channel",
  studyTime: "30 to 45 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_TEAMWORK
};

gameLessonScenarioData.push(lessonObj);

// lesson 27
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[27] Coordinated Resource Allocation",
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Process Design",
  studyTime: "30 to 45 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_TEAMWORK
};

gameLessonScenarioData.push(lessonObj);


// lesson 28
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[28] Fighting as a Team",
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Process Design",
  studyTime: "30 to 45 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_TEAMWORK
};

gameLessonScenarioData.push(lessonObj);


// lesson 29
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: "[29] Future Directions",
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: "Tank Improvement Ideas",
  studyTime: "20 to 30 minutes",
  Difficulty: 4,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.TANK_TEAMWORK
};

gameLessonScenarioData.push(lessonObj);




*/






// scratch lessons old


// lesson 0
lessonNumber = 0;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Let The Bird Fly!',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Adjust Timing Based on Result',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 200,
  concepts: 'Timing control',
  studyTime: "5 to 10 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 1
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Fly High, Fly Low!',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Adjust Timing Based on Result',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 200,
  concepts: 'Adjust Timing Based on Result',
  studyTime: "5 to 10 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 2
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Blocking Tubes',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Define New Blocks',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 200,
  concepts: 'Use New Blocks',
  studyTime: "5 to 10 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 3
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Flying To The Nest Automatically',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Error Correction',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 200,
  concepts: 'Error Correction',
  studyTime: "5 to 10 minutes",
  Difficulty: 1,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 4
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[4] Flying To The Nest Automatically 2',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Measure timing data',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 4]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Measure timing data',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 5
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[5] Putting It All Together',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Automatic index for a list',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Automatic index for a list',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 6
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[6] A Silly Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Achieve random behaviors',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);






sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Achieve random behaviors',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 7
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[7] Collecting Crystals',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Automaticaly seeking a target',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 7]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Automaticaly seeking a target',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 8
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[8] Collecting The Nearest Crystal First (I)',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Traversing a list using repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 8]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Traversing a list using repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 9
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[9] Collecting The Nearest Crystal First (II)',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Search through a list using repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 9]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Search through a list using repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);





// lesson 10
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[10] Upgrading Your Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'rule-based system',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 10]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'rule-based system',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 11
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[11] Attacking White Tanks',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'rule-based system',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 11]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'rule-based system',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 12
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[12] Attacking White Tanks (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Stopping Condition For Repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 12]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Stopping Condition For Repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 13
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[13] Attacking White Tanks (3)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Index + Repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 13]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Stopping Condition For Repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 14
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[14] Attacking The Red Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Number-based Decision',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 14]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Number-based Decision',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 15
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[15] Dodging Shells',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Problem Solving Skills',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 15]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Problem Solving Skills',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 16
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[16] Review and Release',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Review and Release',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



// lesson 17
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[17] Introducing The Candy Crush Game',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Game Rules',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 17]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Game Rules',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 18
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[18] Searching For Single Matches',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: '2D table as 1D list',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 18]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '2D table as 1D list',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 19
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[19] Searching For Single Matches (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Generalize a solution',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 19]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Generalize a solution',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);





// lesson 20
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[20] Searching in Both Directions',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Generalize a solution',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 20]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Generalize a solution',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 21
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[21] Swapping To The Right',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Generalize a solution',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 21]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Generalize a solution',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 22
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[22] Searching For The Best Move',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Linear search',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 22]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Linear search',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 23
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[23] Handling Reward Candies (1)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Using lists for counting',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 23]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Using lists for counting',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 24
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[24] Handling Reward Candies (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Using mod for matching',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 24]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Using mod for matching',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 25
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[25] Cascade Matches (1)',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Making a swap',
  studyTime: "15 to 20 minutes",
  Difficulty: 4,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 25]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Making a swap',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 26
lessonNumber++;
var sid = "scratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[26] Cascade Matches (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'Using mod properly',
  studyTime: "15 to 20 minutes",
  Difficulty: 4,
  gameId: scratchGameId,
  gameName: 'Scratch',
  slideFileId: sid,
  _id: `LS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 26]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Using mod properly',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: scratchGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
};
gameLessonScenarioData.push(lessonObj);























// scratch lessons new organization


// // lesson 0
// lessonNumber = 0;
// var sid = "flappybird_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[0] Let The Bird Fly!',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Adjust Timing Based on Result',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "flappybird_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 0]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 200,
//   concepts: 'Timing control',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 1
// lessonNumber++;
// var sid = "flappybird_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[1] Fly High, Fly Low!',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Adjust Timing Based on Result',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "flappybird_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 1]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 200,
//   concepts: 'Adjust Timing Based on Result',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 2
// lessonNumber++;
// var sid = "flappybird_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[2] Blocking Tubes',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Define New Blocks',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "flappybird_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 2]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 200,
//   concepts: 'Use New Blocks',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 3
// lessonNumber++;
// var sid = "flappybird_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[3] Flying To The Nest Automatically',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Error Correction',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "flappybird_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 3]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 200,
//   concepts: 'Error Correction',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 1,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 4
// lessonNumber++;
// var sid = "flappybird_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[4] Flying To The Nest Automatically 2',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'Measure timing data',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "flappybird_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 4]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 300,
//   concepts: 'Measure timing data',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 5
// lessonNumber++;
// var sid = "flappybird_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[5] Putting It All Together',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'Automatic index for a list',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "flappybird_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 5]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 300,
//   concepts: 'Automatic index for a list',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: flappybirdGameId,
//   gameName: 'Flappy Bird',
//   slideFileId: sid,
//   _id: `LFB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// lesson 0 for new smart tank scratch
// lessonNumber = 0;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[0] A Silly Tank',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'Achieve random behaviors',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 0]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 300,
//   concepts: 'Achieve random behaviors',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 1
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[1] Collecting Crystals',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'Automaticaly seeking a target',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);






// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 1]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 300,
//   concepts: 'Automaticaly seeking a target',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 2
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[2] Collecting The Nearest Crystal First (I)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'Traversing a list using repeat',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 2]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 300,
//   concepts: 'Traversing a list using repeat',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 3
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[3] Collecting The Nearest Crystal First (II)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 600,
//   concepts: 'Search through a list using repeat',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 3]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 300,
//   concepts: 'Search through a list using repeat',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // new lesson 4
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[4] Upgrading Your Tank',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'rule-based system',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);





// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 4]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'rule-based system',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);


// // lesson 5
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[5] Attacking White Tanks',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'rule-based system',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// // lesson 5
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[5] Attacking White Tanks',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'rule-based system',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 5]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'rule-based system',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 5]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'rule-based system',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 6
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[6] Attacking White Tanks (2)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Stopping Condition For Repeat',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// // lesson 6
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[6] Attacking White Tanks (2)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Stopping Condition For Repeat',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 6]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Stopping Condition For Repeat',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 7
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[7] Attacking White Tanks (3)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Index + Repeat',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 7]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Stopping Condition For Repeat',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// // new lesson 8
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[8] Attacking The Opponent Tank',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Number-based Decision',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// // new lesson 8
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[8] Attacking The Opponent Tank',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Number-based Decision',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 8]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Number-based Decision',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// // lesson 9
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[9] Dodging Shells',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Complex conditions',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// // lesson 9
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[9] Dodging Shells',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Complex conditions',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 9]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Complex conditions ',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 9]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Complex conditions ',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // new lesson 10
lessonNumber = 10;
var sid = "tankscratch2_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[10] Special Weapons (1)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Compound conditionals',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankscratch2GameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch2_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 10]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Compound conditionals',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: tankscratch2GameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);

// // new lesson 11

lessonNumber = 11;
var sid = "tankscratch2_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[11] Special Weapons (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: '2D Geometry',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: tankscratch2GameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};


gameLessonScenarioData.push(lessonObj);



sid = "tankscratch2_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 11]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Compound conditionals',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: tankscratch2GameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);

// // new lesson 12
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[12] Special Weapons (3)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Game strategy',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 12]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Game strategy',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 12]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Game strategy',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // new lesson 13
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[13] Special Weapons (4)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Procedures with parameters',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 13]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Procedures with parameters',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 13]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Procedures with parameters',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // new lesson 14
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[14] Weapon Preference',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Using a list for ranking',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 14]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Using a list for ranking',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);

// sid = "tankscratch2_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 14]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Using a list for ranking',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);


// // new lesson 15
// lessonNumber++;
// var sid = "tankscratch2_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[15] Building Your Own AI',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Test-Driven Development',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: tankscratch2GameId,
//   gameName: 'Smart Tank Scratch',
//   slideFileId: sid,
//   _id: `LSTS${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// general concept lesson 0
lessonNumber = 0;
var sid = "generalconcepts_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] What Is Artificial Intelligence',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Definition of AI',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: generalconceptsGameId,
  gameName: 'General Concepts',
  slideFileId: sid,
  _id: `LGC${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.GENERALCONCEPTS_LESSONS
};

gameLessonScenarioData.push(lessonObj);


// general concept lesson 1

lessonNumber ++;
var sid = "generalconcepts_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Using The TuringGame Platform',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Setup And Usage',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: generalconceptsGameId,
  gameName: 'General Concepts',
  slideFileId: sid,
  _id: `LGC${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.GENERALCONCEPTS_LESSONS
};

gameLessonScenarioData.push(lessonObj);





// new lesson 1 for kindergarten
lessonNumber = 1;
var sid = "ia_k_turtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Introducing The Drawing Turtle',
  LessonSequenceNumber: lessonNumber,
  coins: 200,
  concepts: 'Basic Commands',
  studyTime: "20 to 25 minutes",
  Difficulty: 1,
  gameId: kturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LKT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);








// new lesson 0
lessonNumber = 0;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Introducing The Drawing Turtle',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Turning Degrees',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "drawingturtle_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Turning Degrees',
  studyTime: "5 to 10 minutes",
  Difficulty: 1,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};
gameLessonScenarioData.push(lessonObj);





// new lesson 1
lessonNumber ++;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Using Repeat Loops',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Loops',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "drawingturtle_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Repeat Loops',
  studyTime: "5 to 10 minutes",
  Difficulty: 1,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// new lesson 2
lessonNumber ++;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Nested Loops',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Nested Repeat Loops',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "drawingturtle_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Repeat Loops',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// turtle new lesson 3
lessonNumber ++;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Custom Drawing Blocks',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'define drawing blocks',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "drawingturtle_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'define drawing blocks',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS
};
gameLessonScenarioData.push(lessonObj);






// turtle new lesson 4
lessonNumber ++;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[4] Flying and Painting',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Sequencing Operations',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);






sid = "drawingturtle_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework ４]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Sequencing Operations',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DRAWING_TURTLE_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// turtle new lesson ５
lessonNumber ++;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[5] Drawing A Train',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Define Blocks',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);





sid = "drawingturtle_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Define Blocks',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DRAWING_TURTLE_LESSONS
};
gameLessonScenarioData.push(lessonObj);





// turtle new lesson 6
lessonNumber ++;
var sid = "drawingturtle_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[6] Creating Your Own Drawing',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Review',
  studyTime: "25 to 40 minutes",
  Difficulty: 2,
  gameId: drawingturtleGameId,
  gameName: 'Drawing Turtle',
  slideFileId: sid,
  _id: `LDT${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.DRAWING_TURTLE_LESSONS
};

gameLessonScenarioData.push(lessonObj);









// soccer new lesson 0
lessonNumber = 0;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[0] Introducing Scratch Soccer',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Random behaviors',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Random behaviors',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// soccer lesson 1
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[1] Picking Up The Ball',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Searching for the best',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Searching for the best',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// soccer lesson 2
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[2] Shooting The Ball',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Linear Search',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Rebound calculation',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// soccer lesson 3
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[3] Defending The Goal',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Dynamic Positioning',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Dynamic Positioning',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// soccer lesson 4
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[4] Passing The Ball',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Team collaboration',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 4]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Team collaboration',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// soccer lesson 5
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[5] Passing The Ball (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Geometry for Rebounds',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Geometry for Rebounds',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// soccer lesson 6
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[6] Defense Improvement',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Defense Strategy',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Defense Strategy',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// soccer lesson 7
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[7] The Double Speed Award (1)',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Review Searching Method',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 7]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Defense Strategy',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// soccer lesson 8
lessonNumber ++;
var sid = "scratchsoccer_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[8] The Double Speed Award (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Swapping 2 Variables',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchSoccerGameId,
  gameName: 'Scratch Soccer',
  slideFileId: sid,
  _id: `LSS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "scratchsoccer_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 8]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Swapping 2 Variables',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchSoccerGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LSS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// bbbb 



// lesson 0 for smart tank scratch old 
lessonNumber = 0;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[0] A Silly Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Achieve random behaviors',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Achieve random behaviors',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);






// lesson 1
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[1] Collecting Crystals',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Automaticaly seeking a target',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Automaticaly seeking a target',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 2
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[2] Collecting The Nearest Crystal First (I)',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Traversing a list using repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Traversing a list using repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 3
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[3] Collecting The Nearest Crystal First (II)',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Search through a list using repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 300,
  concepts: 'Search through a list using repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);





// lesson 4
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[4] Upgrading Your Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'rule-based system',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 4]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'rule-based system',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 5
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[5] Attacking White Tanks',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'rule-based system',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'rule-based system',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);




// lesson 6
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[6] Attacking White Tanks (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Stopping Condition For Repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Stopping Condition For Repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 7
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[7] Attacking White Tanks (3)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Index + Repeat',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);




sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 7]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Stopping Condition For Repeat',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);



// lesson 8
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[8] Attacking The Red Tank',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Number-based Decision',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 8]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Number-based Decision',
  studyTime: "5 to 10 minutes",
  Difficulty: 2,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 9
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[9] Dodging Shells',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Problem Solving Skills',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);



sid = "tankscratch_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 9]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Problem Solving Skills',
  studyTime: "5 to 10 minutes",
  Difficulty: 3,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 10
lessonNumber++;
var sid = "tankscratch_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[10] Review and Release',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'Review and Release',
  studyTime: "15 to 20 minutes",
  Difficulty: 3,
  gameId: scratchtankGameId,
  gameName: 'Smart Tank Scratch',
  slideFileId: sid,
  _id: `LTS${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS
};

gameLessonScenarioData.push(lessonObj);






// new candy crush lessons 

// lesson 0
// lessonNumber = 0;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[0] Introducing The Candy Crush Game',
//   LessonSequenceNumber: lessonNumber,
//   coins: 800,
//   concepts: 'Game Rules',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 0]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 400,
//   concepts: 'Game Rules',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 2,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 18
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[1] Searching For Single Matches',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: '2D table as 1D list',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 1]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: '2D table as 1D list',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 19
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[2] Searching For Single Matches (2)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Generalize a solution',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 2]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Generalize a solution',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);





// // lesson 3
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[3] Searching in Both Directions',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Generalize a solution',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 3]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Generalize a solution',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




// // lesson 21
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[4] Swapping To The Right',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Generalize a solution',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 4]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Generalize a solution',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 5
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[5] Searching For The Best Move',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Linear search',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 5]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Linear search',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 6
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[6] Handling Reward Candies (1)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Using lists for counting',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 6]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Using lists for counting',
//   studyTime: "5 to 10 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 7
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[7] Handling Reward Candies (2)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'Using mod for matching',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 7]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Using mod for matching',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 8
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[8] Cascade Matches (1)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1200,
//   concepts: 'Making a swap',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 4,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 8]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Making a swap',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // lesson 9
// lessonNumber++;
// var sid = "candycrush_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[9] Cascade Matches (2)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1200,
//   concepts: 'Using mod properly',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 4,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// sid = "candycrush_homework_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 9]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Using mod properly',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 3,
//   gameId: candycrushGameId,
//   gameName: 'CandyCrush',
//   slideFileId: sid,
//   _id: `LCC${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);




//////////////////////////////////////////////
//******* IA NYC School Lessons ************/
/////////////////////////////////////////////


//  lesson 1
lessonNumber = 1;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[1] Saving Coco',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sequencing, Directions',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  lesson 2
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[2] Saving Coco (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sequencing, Directions',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 3
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[3] Bringing Coco Home',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sequencing, Directions',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 4
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[4] Grabbing Bones',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Path Selection',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  lesson ５
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[5] Avoiding Manholes',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Path Selection',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 6
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[6] Tina the Drawing Turtle',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Forward, Turning',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);






//  lesson ７
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[7] Tina the Drawing Turtle (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Forward, Turning',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);






//  lesson8
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[8] Happy Drawings with Tina',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sequencing, Directions',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 9
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[9] Fixing Problems',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Debugging',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 10
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[10] Debugging with Tina',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Debugging',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 11
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[11] Greetings at the Turing School',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sprites and Backdrops',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 12
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[12] Greetings at the Turing School (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sprites',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 13
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[13] Greetings at the Turing School (3)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Say',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 14
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[14] Carebots for the Elderly',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 15
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[15] Carebots for the Elderly (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 16
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[16] Coco Learns to Repeat',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Symbol',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 17
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[17] Coco Learns to Repeat (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Symbol',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 18
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[18] Bringing Coco Home with Repeats',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Block',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 19
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[19] Bringing Coco Home with Repeats (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Events',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 20
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[20] Drawing with Repeats',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Symbol',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 21
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[21] Drawing with Repeats (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Symbol',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 22
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[22] Happy Drawings Using Repeat Blocks',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Block',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 23
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[23] Happy Drawings Using Repeat Blocks (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Block',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 24
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[24] A Smart Display',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Costume',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  lesson 25 old 14
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[25] Fun with Signs',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Event',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 26 old 15
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[26] Controlling Joy',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Event',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 27 old 16
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[27] The Recycling Truck',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Event',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 28 old 17
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[28] Music in Numbers',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Music, Animation',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 29 old 1８
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[29] Game - True or False',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Conditional',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);






//  lesson 30 old 19
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[30] The Recycling Truck 2',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Conditional',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 31
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[31] National Flags - A Memory Game',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Events, Costumes',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 32
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[32] Endangered Animals',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Events, Costumes',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 33
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[33] Smart Farming',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 34
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[34] Smart Farming (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 35
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[35] Counter Dice',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Variables',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 36
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[36] Dice Game',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Variables',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//////////////////////////////////////////////
//******* Apple Harvest Lessons ************/
/////////////////////////////////////////////

//  lesson 0
lessonNumber = 0;
var sid = "appleharvest_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Introduction to Scratch',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Programming Language, Scratch History',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Introduction to Scratch',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson １
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[1] Sprites',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Add and Delete Sprites',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Add and Delete Sprites',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);



//  lesson 2
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[2] Backdrops',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Add and Delete Backdrops',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Add and Delete Backdrops',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 3
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[3] Placing the Apple At the Top',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Coordinate System, Sprite Configuration',
  studyTime: "15 to 20 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Coordinate System, Sprite Configuration',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 4
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[4] Dropping the Apple',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Hat Blocks, Go to, Change y by, Forever',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 4]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Hat Blocks, Go to, Change y by, Forever',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 5
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[5] Collecting the Apple',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'C Blocks, If Then, Sensing Blocks',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'C Blocks, If Then, Sensing Blocks',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 6
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[6] A Lot of Apples',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Random Number',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Random Number',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);

//  lesson 7
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[7] Counting Apples',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Variable',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 7]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Variable',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);

//  lesson 8
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[8] End Game Rules',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Comparison Operator',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 8]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Comparison Operator',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 9
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[9] Apples in the Bowl',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Costumes',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 9]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Costumes',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 10
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[10] Adding Sounds',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sounds',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 10]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Sounds',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 11
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[11] Apples Falling Faster',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Logic Operators',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "appleharvest_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 11]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Logic Operators',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 12
lessonNumber ++;
sid = "appleharvest_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[12] Putting Things Together',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "30 to 45 minutes",
  Difficulty: 2,
  gameId: appleharvestGameId,
  gameName: 'Apple Harvest',
  slideFileId: sid,
  _id: `LAH${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//////////////////////////////////////////////
//******* Maze Lessons ************/
/////////////////////////////////////////////

//  lesson 0
lessonNumber = 0;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[0] Introduction to Maze Game',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Maze Game, Sprites and Backdrops Review',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "maze_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Maze Game, Sprites and Backdrops Review',
  studyTime: "10 to 15 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};
gameLessonScenarioData.push(lessonObj);

//  lesson 1
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[1] Moving the Cat',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sensing Keypress Events',
  studyTime: "25 to 30 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "maze_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Sensing Keypress Events',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 2
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[2] Turning the Cat',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Direction',
  studyTime: "25 to 30 minutes",
  Difficulty: 3,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "maze_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Direction',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 3
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[3] Blocking the Cat',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Sensing Color, Reverse Action',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "maze_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Sensing Color, Reverse Action',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};
gameLessonScenarioData.push(lessonObj);


//  lesson 4
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[4] Adding the Mazes',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Animation, Background Music',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  lesson 5
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[5] Showing the Time Spent',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Timer, Text Join',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);


sid = "maze_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Timer, Text Join',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};
gameLessonScenarioData.push(lessonObj);

//  lesson 6
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[6] Messages',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Message Broadcast',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "maze_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Messages',
  studyTime: "20 to 25 minutes",
  Difficulty: 3,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};
gameLessonScenarioData.push(lessonObj);

//  lesson 7
lessonNumber ++;
var sid = "maze_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[7] Putting Things Together',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: mazeGameId,
  gameName: 'Maze',
  slideFileId: sid,
  _id: `LM${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
};

gameLessonScenarioData.push(lessonObj);

/////////////////////////////////////////////
/******* Algorithm Lessons *****************/
/////////////////////////////////////////////

lessonNumber = 1;

// lesson 1
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[1] Array',
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'Array', 
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 2
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Searching in Arrays`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'Searching, Lookup Table', 
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 3
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Array Sorting I`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'Sorting, Selection Sort, Bubble Sort', 
  studyTime: "45 to 60 minutes",
  Difficulty: 4,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 4
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Recursion`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'Recursion, Binary Search', 
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 5
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Array Sorting II`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'Divide and Conquer, Merge Sort, Quicksort', 
  studyTime: "45 to 60 minutes",
  Difficulty: 4,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 6
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] 2D Array I`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: '2D Array Traverse, Search a Sorted Matrix', 
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 7
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] 2D Array II`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Toeplitz Matrix, Pascal's Triangle, Transpose Matrix", 
  studyTime: "45 to 60 minutes",
  Difficulty: 4,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);

// lesson 8
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Strings I`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Strings, String Reverse, Roman Numerals", 
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);

// lesson 9
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Strings II`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Unicode, String Comparasion, Lookup Table", 
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);

// lesson 10
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Dynamic Programming I`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Dynamic Programming, Optimal Substructure", 
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 11
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Dynamic Programming II`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Dynamic Programming", 
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 12
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Graphs I`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Undirected Graph, Directed Graph, Graph Representations", 
  studyTime: "45 to 60 minutes",
  Difficulty: 3,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);


// lesson 13
lessonNumber ++;
var sid = "algorithmjs_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: `[${lessonNumber}] Graphs II`,
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: "Breadth-First Traversal, Depth-First Traversal, Cycle Detection", 
  studyTime: "45 to 60 minutes",
  Difficulty: 4,
  gameId: algorithmGameId,
  gameName: 'Data Structure and Algorithm in JavaScript',
  slideFileId: sid,
  _id: `LDA${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
};
gameLessonScenarioData.push(lessonObj);



const prepareNewCourse = () => {
  // Lessons.remove({gameId: poolGameId});
  // Lessons.remove({gameId: tankGameId});
  Lessons.remove({gameId: canvasGameId});
  Lessons.remove({gameId: algorithmGameId});
  Lessons.remove({gameId: recyclerGameId});
  Lessons.remove({gameId: algoScratchGameId});
  Lessons.remove({gameId: codinggameGameId});
  Lessons.remove({gameId: scratchGameId});
  Lessons.remove({gameId: scratchtankGameId});
  Lessons.remove({gameId: scratchSoccerGameId});
  Lessons.remove({gameId: generalconceptsGameId});
  Lessons.remove({gameId: drawingturtleGameId});
  Lessons.remove({gameId: kturtleGameId});
  // Lessons.remove({gameId: flappybirdGameId});
  // Lessons.remove({gameId: candycrushGameId});
  Lessons.remove({gameId: tankscratch2GameId, _id: "LSTS10"});
  Lessons.remove({gameId: tankscratch2GameId, _id: "LSTS10_H"});
  Lessons.remove({gameId: tankscratch2GameId, _id: "LSTS11"});
  Lessons.remove({gameId: tankscratch2GameId, _id: "LSTS11_H"});
  // Lessons.remove({gameId: tankscratch2GameId});
  Lessons.remove({gameId: appleharvestGameId});
  Lessons.remove({gameId: mazeGameId});
  Lessons.remove({gameId: schoolAGameId});
  Lessons.remove({gameId: "scratch2873ukjfw"});
  let id = 0;
  let id2 = 0;
  _.map(gameLessonScenarioData, (doc) => {
    // if (doc.slideFileId.includes("homework")) {
    //   doc._id = `L${id++}`;    
    // } else {
    //   if (doc.LessonSequenceNumber == 12.5) {
    //     doc._id = `L12.5`;
    //   } else if (doc.gameId == poolGameId) {
    //     doc._id = `L${id++}`;
    //   } else if (doc.gameId == tankGameId) {
    //     doc._id = `LT${id2++}`;
    //   }
    // }
    // console.log(`inserting new slide lesson ${doc._id} ${doc.LessonSequenceNumber} ${doc.gameId} `);
    Lessons.insert(doc);
  });
};

export default prepareNewCourse;
// export removeLessonLessons;

