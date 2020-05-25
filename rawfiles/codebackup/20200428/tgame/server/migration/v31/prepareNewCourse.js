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





// // algo lesson 0
// lessonNumber = 0;

// var sid = "algo_lesson_" + (lessonNumber);
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[0] Swapping Values',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'swap between 2 variables',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 2,
//   gameId: algoScratchGameId,
//   gameName: 'Algo in Scratch',
//   slideFileId: sid,
//   _id: `LAS${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);



// // algo lesson 4
// lessonNumber = 4;

// var sid = "algo_lesson_" + (lessonNumber);
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: '[4] Recursion',
//   LessonSequenceNumber: lessonNumber,
//   coins: 1000,
//   concepts: 'recursion',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 2,
//   gameId: algoScratchGameId,
//   gameName: 'Algo in Scratch',
//   slideFileId: sid,
//   _id: `LAS${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
// };
// gameLessonScenarioData.push(lessonObj);


// algo lesson ５
lessonNumber = 5;

var sid = "algo_lesson_" + (lessonNumber);
var lessonObj = {
  userId: 'system',
  package: 'advanced',
  LessonName: '[5] Merge Sort',
  LessonSequenceNumber: lessonNumber,
  coins: 1000,
  concepts: 'merge sort',
  studyTime: "25 to 35 minutes",
  Difficulty: 2,
  gameId: algoScratchGameId,
  gameName: 'Algo in Scratch',
  slideFileId: sid,
  _id: `LAS${lessonNumber}`,
  group: TUTORIAL_GROUP.BEGINNER.FOUNDATION
};
gameLessonScenarioData.push(lessonObj);



// //  lesson 3
// lessonNumber = 3;
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



// //  lesson ５
// lessonNumber = 5;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[5] Avoiding Manholes',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Path Selection',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// //  lesson 35
// lessonNumber = 35;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[35] Counter Dice',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Variables',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// //  lesson 36
// lessonNumber = 36;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[36] Dice Game',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Variables',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// //  lesson 37
// lessonNumber = 37;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[37] A Shopping List',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Variables',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// //  lesson 38
// lessonNumber = 38;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[38] A Shopping List (2)',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Variables',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);


// //  lesson 39
// lessonNumber = 39;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[39] Cookie Clicker',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Variables',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// //  lesson 40
// lessonNumber = 40;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[40] The Counting Starfish',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Variables',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);



// //  lesson 41
// lessonNumber = 41;
// var sid = "school_a_lesson_" + lessonNumber;
// var lessonObj = {
//   userId: 'system',
//   package: 'schoolA',
//   LessonName: '[41] Review',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Review',
//   studyTime: "25 to 35 minutes",
//   Difficulty: 1,
//   gameId: schoolAGameId,
//   gameName: 'Level A',
//   slideFileId: sid,
//   _id: `LEVELA${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);





//  lesson 42
lessonNumber = 42;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[42] Happy Drawing with Tina (3)',
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


//  lesson 18
lessonNumber = 18;
var sid = "school_a_lesson_" + lessonNumber;
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  LessonName: '[18] Bringing Coco Home with Repeats',
  LessonNameCH: '[18] 用重复积木帮助Coco回家',
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



//  lesson 18 ch
lessonNumber = 18;
var sid = "school_a_lesson_" + lessonNumber + "_ch";
var lessonObj = {
  userId: 'system',
  package: 'schoolA',
  locale: 'zh-cn',
  LessonName: '[18] 用重复积木帮助Coco回家',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Repeat Block',
  studyTime: "25 to 35 minutes",
  Difficulty: 1,
  gameId: schoolAGameCHId,
  gameName: 'Level A',
  slideFileId: sid,
  _id: `LEVELA${lessonNumber}_CH`,
  group: TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS
};

gameLessonScenarioData.push(lessonObj);





// // algo js lesson 11
// lessonNumber = 11;
// var sid = "algorithmjs_lesson_" + (lessonNumber);
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: `[${lessonNumber}] Dynamic Programming II`,
//   LessonSequenceNumber: lessonNumber,
//   coins: 1500,
//   concepts: "Dynamic Programming", 
//   studyTime: "60 to 90 minutes",
//   Difficulty: 4,
//   gameId: algorithmGameId,
//   gameName: 'Data Structure and Algorithm in JavaScript',
//   slideFileId: sid,
//   _id: `LDA${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);


// // algo js lesson 12
// lessonNumber = 12;
// var sid = "algorithmjs_lesson_" + (lessonNumber);
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: `[${lessonNumber}] Graphs I`,
//   LessonSequenceNumber: lessonNumber,
//   coins: 1500,
//   concepts: "Undirected Graph, Directed Graph, Graph Representations", 
//   studyTime: "45 to 60 minutes",
//   Difficulty: 3,
//   gameId: algorithmGameId,
//   gameName: 'Data Structure and Algorithm in JavaScript',
//   slideFileId: sid,
//   _id: `LDA${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);


// // algo js lesson 13
// lessonNumber = 13;
// var sid = "algorithmjs_lesson_" + (lessonNumber);
// var lessonObj = {
//   userId: 'system',
//   package: 'advanced',
//   LessonName: `[${lessonNumber}] Graphs II`,
//   LessonSequenceNumber: lessonNumber,
//   coins: 1500,
//   concepts: "Breadth-First Traversal, Depth-First Traversal, Cycle Detection", 
//   studyTime: "60 to 90 minutes",
//   Difficulty: 4,
//   gameId: algorithmGameId,
//   gameName: 'Data Structure and Algorithm in JavaScript',
//   slideFileId: sid,
//   _id: `LDA${lessonNumber}`,
//   group: TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);



// // apple homework 1
// lessonNumber = 1;
// sid = "appleharvest_homework_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[Homework 1]',
//   LessonSequenceNumber: lessonNumber,
//   coins: 250,
//   concepts: 'Add and Delete Sprites',
//   studyTime: "10 to 15 minutes",
//   Difficulty: 1,
//   gameId: appleharvestGameId,
//   gameName: 'Apple Harvest',
//   slideFileId: sid,
//   _id: `LAH${lessonNumber}_H`,
//   group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
// };
// gameLessonScenarioData.push(lessonObj);


// //  apple lesson 4
// lessonNumber = 4;
// sid = "appleharvest_lesson_" + lessonNumber;
// lessonObj = {
//   userId: 'system',
//   package: 'starter',
//   LessonName: '[4] Dropping the Apple',
//   LessonSequenceNumber: lessonNumber,
//   coins: 500,
//   concepts: 'Hat Blocks, Go to, Change y by, Forever',
//   studyTime: "20 to 25 minutes",
//   Difficulty: 2,
//   gameId: appleharvestGameId,
//   gameName: 'Apple Harvest',
//   slideFileId: sid,
//   _id: `LAH${lessonNumber}`,
//   group: TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS
// };

// gameLessonScenarioData.push(lessonObj);

//  balloon lesson 0
lessonNumber = 0;
sid = "balloonbuster_lesson_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[0] Introduction to the Balloon Buster',
  LessonSequenceNumber: lessonNumber,
  coins: 500,
  concepts: 'Drawing Sprites, Bitmap and Vector',
  studyTime: "25 to 30 minutes",
  Difficulty: 2,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);

lessonNumber = 0;
sid = "balloonbuster_homework_" + lessonNumber;
lessonObj = {
  userId: 'system',
  package: 'intermediate',
  LessonName: '[Homework 0]',
  LessonSequenceNumber: lessonNumber,
  coins: 250,
  concepts: 'Drawing Sprites, Bitmap and Vector',
  studyTime: "10 to 15 minutes",
  Difficulty: 2,
  gameId: balloonBusterGameId,
  gameName: 'Balloon Buster',
  slideFileId: sid,
  _id: `LBB${lessonNumber}_H`,
  group: TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS
};

gameLessonScenarioData.push(lessonObj);


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


// algo js lesson 7
lessonNumber = 7;
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



const prepareNewCourse = () => {
  
  _.map(gameLessonScenarioData, (doc) => {
    Lessons.remove({_id: doc._id});
    Lessons.insert(doc);
  });
};

export default prepareNewCourse;
// export removeLessonLessons;

