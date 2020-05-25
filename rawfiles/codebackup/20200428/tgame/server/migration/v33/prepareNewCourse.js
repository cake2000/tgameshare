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
const balloonBusterGameId = MIGRATION_CONST.balloonBusterGameId;
const schoolAGameId = MIGRATION_CONST.schoolAGameId;
const schoolAGameCHId = MIGRATION_CONST.schoolAGameCHId;
const schoolBGameId = MIGRATION_CONST.schoolBGameId;

const htmlparser = require('htmlparser2');
const fs = require('fs');


var gameLessonScenarioData = [];
var lessonNumber = 0;



//  lesson 2
lessonNumber = 2;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  lessonType: 'offline, preparation',
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



lessonNumber = 3;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  lessonType: 'online, core',
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



lessonNumber = 35;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[35] A Message Relay Game - Variables',
  lessonType: 'unplugged, preparation',
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


lessonNumber = 36;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[36] Counter Dice',
  lessonType: 'unplugged, preparation',
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



lessonNumber = 37;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  lessonType: 'computer, core',
  LessonName: '[37] A Dice Game',
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



lessonNumber = 38;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[38] A Shopping List',
  lessonType: 'computer, core',
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



lessonNumber = 39;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[39] A Shopping List (2)',
  lessonType: 'computer, core',
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


lessonNumber = 40;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[40] Cookie Clicker',
  lessonType: 'computer, core',
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



lessonNumber = 41;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[41] The Counting Starfish',
  lessonType: 'computer, core',
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



lessonNumber = 42;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[42] Review',
  lessonType: 'computer, review',
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


lessonNumber = 43;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[43] Happy Drawing with Tina (3)',
  lessonType: 'computer, review',
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

lessonNumber = 44;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[44] Happy Drawing with Tina (4)',
  lessonType: 'computer, review',
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


lessonNumber = 45;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[45] Going Online Safely',
  lessonType: 'unplugged, core',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Online Safety',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);


lessonNumber = 46;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[46] Your Scratch Account',
  lessonType: 'computer, core',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Password, Scratch Account',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);

lessonNumber = 47;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[47] A School Calendar',
  lessonType: 'computer, core',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Click and Show',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



lessonNumber = 48;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[48] A School Calendar (2)',
  lessonType: 'computer, core',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Click and Show',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




lessonNumber = 49;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[49] A Person I Admire',
  lessonType: 'computer, review',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "75 to 105 minutes",
  Difficulty: 1,
  gameId: schoolAGameId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);






lessonNumber = 1;
var sid = "school_b_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolB',
  LessonName: '[1] An African Country',
  lessonType: 'computer, review',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Review',
  studyTime: "50 to 70 minutes",
  Difficulty: 1,
  gameId: schoolBGameId,
  gameName: 'Level B',
  slideFileId: sid,
  _id: `LEVELB${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



lessonNumber = 2;
var sid = "school_b_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolB',
  LessonName: '[2] Game - Monopoly Jr.',
  lessonType: 'unplugged, preparation',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Coordinates 1D, Random Number',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolBGameId,
  gameName: 'Level B',
  slideFileId: sid,
  _id: `LEVELB${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



lessonNumber = 3;
var sid = "school_b_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolB',
  LessonName: '[3] Game - Monopoly Jr. 2D',
  lessonType: 'unplugged, preparation',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Coordinates 2D, Random Number',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolBGameId,
  gameName: 'Level B',
  slideFileId: sid,
  _id: `LEVELB${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



lessonNumber = 4;
var sid = "school_b_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolB',
  LessonName: '[4] Monopoly Jr. 2D in Scratch',
  lessonType: 'computer, core',
  LessonSequenceNumber: lessonNumber,
  coins: 600,
  concepts: 'Coordinates 2D, Random Number',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolBGameId,
  gameName: 'Level B',
  slideFileId: sid,
  _id: `LEVELB${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




lessonNumber = 1;

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


// // recycler 


lessonNumber = 5;

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

// lessonNumber = 3;
// sid = "recycler_lesson_" + (lessonNumber);
// var lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[3] Making Upgrades',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'compare and search',
//   studyTime: "25 to 40 minutes",
//   Difficulty: 2,
//   gameId: recyclerGameId,
//   gameName: 'Super Recycler',
//   slideFileId: sid,
//   _id: `LSR${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);



// algo lesson 7
lessonNumber = 7;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[7] Sorting Algorithm Comparison',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'algorithm complexity',
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// //////////////////////////////////////////////
// //******* School Lessons Chinese Version ************/
// /////////////////////////////////////////////



// //  lesson 1
// lessonNumber = 1;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[1] Saving Coco',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Sequencing, Directions',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




// //  lesson 3
// lessonNumber ++;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[3] Bringing Coco Home',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Sequencing, Directions',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



//  lesson 1
lessonNumber = 1;
var sid = "school_a_lesson_" + lessonNumber + "_ch";;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[1] 拯救小狗Coco',
  locale: 'zh-cn',
  lessonType: '线下，准备',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '顺序执行，方向',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  lesson 2
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[2] 拯救小狗Coco（2）',
  locale: 'zh-cn',
  lessonType: '线下，准备',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '顺序执行，方向',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 3
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[3] 带Coco回家',
  locale: 'zh-cn',
  lessonType: '上机，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '顺序执行，方向',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 4
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[4] 捡骨头吃',
  locale: 'zh-cn',
  lessonType: '上机，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '挑选路线',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson ５ ch
lessonNumber = 5;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[5] 躲开没有盖上的下水管道',
  lessonType: '上机，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '挑选路线',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  lesson 6 ch
lessonNumber = 6;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[6] Tina - 画画的乌龟',
  lessonType: '线下，准备',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '前进，转弯',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 7 ch
lessonNumber = 7;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[7] Tina - 画画的乌龟（２）',
  lessonType: '线下，准备',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '前进，转弯',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);






lessonNumber = 8;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[8] 和Tina一起愉快地画画',
  lessonType: '线上，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '前进，转弯',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




lessonNumber = 9;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[9] 解决问题',
  lessonType: '在线，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Debug',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



lessonNumber = 10;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[10] 和Tina一起调试',
  lessonType: '在线，复习',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Debug',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 11
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[11] 在图灵学校的问候',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  lessonType: '在线，核心',
  concepts: '角色，背景',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);



//  lesson 12
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[12] 在图灵学校的问候（2）',
  lessonType: '在线，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '角色',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





//  lesson 13
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[13] 在图灵学校的问候（3）',
  lessonType: '在线，核心',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '说积木',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 14
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[14] 照顾老人的机器人',
  lessonType: '在线，复习',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '复习',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




//  lesson 15
lessonNumber ++;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[15] 照顾老人的机器人（2）',
  lessonType: '在线，复习',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '复习',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);












// //  school a lesson 18 ch
lessonNumber = 18;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  locale: 'zh-cn',
  lessonType: '上机，核心',
  LessonName: '[18] 用重复积木帮助Coco回家',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: '重复积木',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);




// //  school a lesson 18 
lessonNumber = 18;
var sid = "school_a_lesson_" + lessonNumber + "";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  lessonType: 'computer, core',
  LessonName: '[18] Bringing Coco Home with Repeat Blocks',
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







// /******************************************
//  ***** Balloon Buster *********************
//  ******************************************/

// lessonNumber = 1;
// sid = "balloonbuster_lesson_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[1] Balloon Clones',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Cloning',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 2,
//   gameId: balloonBusterGameId,
//   gameName: 'Balloon Buster',
//   slideFileId: sid,
//   _id: `LBB${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// sid = "balloonbuster_homework_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 1]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Cloning',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 3,
//   gameId: balloonBusterGameId,
//   gameName: 'Balloon Buster',
//   slideFileId: sid,
//   _id: `LBB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// lessonNumber = 2;
// sid = "balloonbuster_lesson_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[2] Busting the Balloons',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Mouse Related Blocks',
//   studyTime: "15 to 20 minutes",
//   Difficulty: 2,
//   gameId: balloonBusterGameId,
//   gameName: 'Balloon Buster',
//   slideFileId: sid,
//   _id: `LBB${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// sid = "balloonbuster_homework_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[Homework 2]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Mouse Related Blocks',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 3,
//   gameId: balloonBusterGameId,
//   gameName: 'Balloon Buster',
//   slideFileId: sid,
//   _id: `LBB${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// lessonNumber = 3;
// sid = "balloonbuster_lesson_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[3] Adding Some Randomness',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Completing the game',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 2,
//   gameId: balloonBusterGameId,
//   gameName: 'Balloon Buster',
//   slideFileId: sid,
//   _id: `LBB${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// lessonNumber = 4;
// sid = "balloonbuster_lesson_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[4] Putting Things Together',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Review',
//   studyTime: "30 to 45 minutes",
//   Difficulty: 3,
//   gameId: balloonBusterGameId,
//   gameName: 'Balloon Buster',
//   slideFileId: sid,
//   _id: `LBB${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// //  Maze lesson 5
// lessonNumber = 5;
// var sid = "maze_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[5] Showing the Time Spent',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Timer, Text Join',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 2,
//   gameId: mazeGameId,
//   gameName: 'Maze',
//   slideFileId: sid,
//   _id: `LM${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

// //  Maze lesson 7
// lessonNumber = 7;
// var sid = "maze_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'intermediate',
//   LessonName: '[7] Putting Things Together',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Review',
//   studyTime: "45 to 60 minutes",
//   Difficulty: 3,
//   gameId: mazeGameId,
//   gameName: 'Maze',
//   slideFileId: sid,
//   _id: `LM${lessonNumber}`,
//   group: TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);




const prepareNewCourse = () => {
  
  _.map(gameLessonScenarioData, (doc) => {
    Lessons.remove({_id: doc._id});
    Lessons.insert(doc);
  });
};

export default prepareNewCourse;
// export removeLessonLessons;

