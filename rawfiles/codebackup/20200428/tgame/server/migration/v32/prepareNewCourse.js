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

const htmlparser = require('htmlparser2');
const fs = require('fs');


var gameLessonScenarioData = [];
var lessonNumber = 0;

// recycler 

lessonNumber = 3;
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



// algo lesson ６
lessonNumber = 6;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[6] Merge Sort (2)',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'merge sort',
  studyTime: "25 to 35 minutes",
  Difficulty: 3,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



//////////////////////////////////////////////
//******* School Lessons Chinese Version ************/
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
  lessonType: '线下，预备',
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




//  school a lesson 18 ch
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


// IA English 

//  lesson 43
lessonNumber = 43;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[43] Happy Drawing with Tina (4)',
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


//  lesson 44
lessonNumber = 44;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[44] Going Online Safely',
  lessonType: 'offline, core',
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


lessonNumber = 45;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[45] Your Scratch Account',
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


/******************************************
 ***** Balloon Buster *********************
 ******************************************/

lessonNumber = 1;
sid = "balloonbuster_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[1] Balloon Clones',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Cloning',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "balloonbuster_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 1]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Cloning',
  studyTime: "20 to 25 minutes",
  Difficulty: 3,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);

lessonNumber = 2;
sid = "balloonbuster_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[2] Busting the Balloons',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Mouse Related Blocks',
  studyTime: "15 to 20 minutes",
  Difficulty: 2,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);

sid = "balloonbuster_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 2]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Mouse Related Blocks',
  studyTime: "20 to 25 minutes",
  Difficulty: 3,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);

lessonNumber = 3;
sid = "balloonbuster_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[3] Adding Some Randomness',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Completing the game',
  studyTime: "20 to 25 minutes",
  Difficulty: 2,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);

lessonNumber = 4;
sid = "balloonbuster_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[4] Putting Things Together',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Review',
  studyTime: "30 to 45 minutes",
  Difficulty: 3,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);


//  Maze lesson 5
lessonNumber = 5;
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

//  Maze lesson 7
lessonNumber = 7;
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


const prepareNewCourse = () => {
  
  _.map(gameLessonScenarioData, (doc) => {
    Lessons.remove({_id: doc._id});
    Lessons.insert(doc);
  });
};

export default prepareNewCourse;
// export removeLessonLessons;

