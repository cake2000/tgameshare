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
const tankGameId = MIGRATION_CONST.tankGameId;
const htmlparser = require('htmlparser2');
const fs = require('fs');


var gameLessonScenarioData = [];
var lessonNumber = 0;


// lesson 0
var sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Introduction To The Trajectory Pool Game ',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Game Rules, Winning Strategies',  
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
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
  studyTime: "20 to 30 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);

sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Coordinates, Aiming Point',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
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
  studyTime: "30 to 45 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);


sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Objects, Shot Command',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
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
  studyTime: "30 to 45 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 3]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Functions',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
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
  concepts: 'Geometry For Aiming, Arrays',
  studyTime: "30 to 40 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);


sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 4]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Geometry For Aiming, Arrays',
  studyTime: "10 to 15 minutes",
  Difficulty: 1,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
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
  concepts: 'Success Probability, Console Logging',  
  studyTime: "20 to 30 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);


sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 5]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Geometry For Aiming, Arrays',
  studyTime: "10 to 15 minutes",
  Difficulty: 2,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);


// lesson 6
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[6] Choosing A Better Shot',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Comparison and Logical Operators, Conditional Statement',  
  studyTime: "35 to 50 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);


sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 6]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Comparison and Logical Operators, Conditional Statement',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);


// lesson 7
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[7] Introducing For-Loops',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'For-Loop, Arrays',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 7]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'For-Loop, Arrays',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);



// lesson 8
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[8] Review',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Everything so far',  
  studyTime: "30 to 40 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[Homework 8]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Everything so far',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION2
};
gameLessonScenarioData.push(lessonObj);



// lesson 9
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[9] Nested For-Loops',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Nested for-loops',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);


sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 9]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Nested for-loops',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);



// lesson 10
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[10] Placing Cue Ball By Hand',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Problem-solving strategy',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 10]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'Problem-solving strategy',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);



// lesson 11
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[11] Variables and Their Scope',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'const, let, variable scope',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 11]',
  LessonSequenceNumber: lessonNumber,
  coins: 400,
  concepts: 'const, let, variable scope',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);


// lesson 12
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[12] Review and Release',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'variables, operators, structures, patterns, releases',  
  studyTime: "25 to 35 minutes",
  Difficulty: 4,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 12]',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'const, let, variable scope',
  studyTime: "10 to 15 minutes",
  Difficulty: 4,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);



// lesson 12.5
// lessonNumber ++;
sid = "pool_lesson_12.5";
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[ToolBox] Designing Test Cases For Your Factory',
  LessonSequenceNumber: 12.5,
  coins: 1000,
  concepts: 'Test-Driven Development',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L12.5`,
  group: TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3
};
gameLessonScenarioData.push(lessonObj);




// lesson 13
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[13] Accelerating Your Game Bot',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'continue and break',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
};
gameLessonScenarioData.push(lessonObj);


sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 13]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'continue and break',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
};
gameLessonScenarioData.push(lessonObj);




// lesson 14
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[14] Accelerating Your Game Bot Using Angles',
  LessonSequenceNumber: lessonNumber,
  coins: 1200,
  concepts: 'angles, continue and break',  
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
};
gameLessonScenarioData.push(lessonObj);



sid = "pool_homework_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 14]',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'angles, continue and break',
  studyTime: "10 to 15 minutes",
  Difficulty: 3,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT
};
gameLessonScenarioData.push(lessonObj);




// lesson 15
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[15] Kick Shots: A New Trick In The Bag',
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'trial and error, physics of rebound',  
  studyTime: "35 to 50 minutes",
  Difficulty: 4,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
};
gameLessonScenarioData.push(lessonObj);


// lesson 16
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[16] Kick Shots: The Full Solution',
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'function refactor',  
  studyTime: "35 to 50 minutes",
  Difficulty: 4,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
};
gameLessonScenarioData.push(lessonObj);


// lesson 17
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[17] Bank Shots: A Different Kind of Rebound',
  LessonSequenceNumber: lessonNumber,
  coins: 1500,
  concepts: 'trial and error revisited',  
  studyTime: "35 to 50 minutes",
  Difficulty: 4,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
};
gameLessonScenarioData.push(lessonObj);


// lesson 18
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[18] Combo Shots',
  LessonSequenceNumber: lessonNumber,
  coins: 2000,
  concepts: 'balance speed and accuracy',  
  studyTime: "40 to 60 minutes",
  Difficulty: 5,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS
};
gameLessonScenarioData.push(lessonObj);

// lesson 19
lessonNumber ++;
sid = "pool_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[19] End State of Your Shot',
  LessonSequenceNumber: lessonNumber,
  coins: 2000,
  concepts: 'Multi-step Optimization',  
  studyTime: "40 to 60 minutes",
  Difficulty: 5,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  slideFileId: sid,
  _id: `L${lessonNumber}`,
  group: TUTORIAL_GROUP.ADVANCED.ADVANCED_TECH
};
gameLessonScenarioData.push(lessonObj);




// new tank lessons
lessonNumber = 0;


// lesson 0
var sid = "tank_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[0] Introduction to The Smart Tank Game',
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
  LessonName: '[2] Introduction to JavaScript Objects',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Objects',  
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
  concepts: 'Objects',
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
  LessonName: '[4] Shooting At Enemy Tanks',
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
  LessonName: '[5] Introduction to For-Loops',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'For-Loops, Continue',  
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);


// lesson 6
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[6] 2D Arrays and the Maze',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: '2D Arrays, Nested For-Loops',  
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};
gameLessonScenarioData.push(lessonObj);

// lesson 7
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[7] Searching For The Shortest Path Using The Greedy Algorithm',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
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

// lesson 8
lessonNumber ++;
var sid = "tank_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'starter',
  LessonName: '[8] Review',
  LessonSequenceNumber: lessonNumber,
  coins: 800,
  concepts: 'Everything so far',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: tankGameId,
  gameName: 'SmartTank',
  slideFileId: sid,
  _id: `LT${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2
};

gameLessonScenarioData.push(lessonObj);

const prepareNewCourse = () => {
  Lessons.remove({gameId: poolGameId});
  Lessons.remove({gameId: tankGameId});
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
    // console.log(`inserting new slide lesson ${doc._id} ${doc.LessonSequenceNumber}`);
    Lessons.insert(doc);
  });
};

export default prepareNewCourse;
// export removeLessonLessons;

