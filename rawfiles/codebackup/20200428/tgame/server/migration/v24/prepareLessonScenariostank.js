import {
  Scenarios
} from '../../../lib/collections';
import {
  TUTORIAL_GROUP,
  MIGRATION_CONST
} from '../../../lib/enum';

const tankGameId = MIGRATION_CONST.tankGameId;
const htmlparser = require('htmlparser2');


const gameLessonScenarioData = [];
let lessonNumber = 1;


// lesson 1
let lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 500,
  concepts: 'Tank Commands, Functions, Variables, If Condition, Randomness',
  ScenarioName: '[1] A Random Walker',
  lessonName: 'ARandomlyShootingTank',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTile('R', 5, 2);
PlaceTank('blue', 5, 5);
PlaceTank('white', 10, 5, false);

await SetupTickUpdates(300);

ReportEndOfTest();
`,
  Difficulty: 2,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
lessonObj.baselineCode =`
function getNewCommand() {
  return "S"; 
}
`;
gameLessonScenarioData.push(lessonObj);
lessonNumber += 1;

// lesson 2
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: 'Array, For Loop',
  ScenarioName: '[2] Shooting At A White Tank',
  lessonName: 'ShootAWhiteTank',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTile('R', 5, 2);
PlaceTank('blue', 5, 5);
PlaceTank('white', 10, 5, false);

await SetupTickUpdates(180);

ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};

gameLessonScenarioData.push(lessonObj);
lessonNumber += 1;

// lesson 3
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 1000,
  concepts: 'Array, For Loop',
  ScenarioName: '[3] Shooting At A White Tank II',
  lessonName: 'ShootAWhiteTankII',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTile('R', 5, 2);
PlaceTank('blue', 5, 5);
PlaceTank('white', 10, 5, false);
PlaceTank('white', 5, 10, false);

await SetupTickUpdates(480);

ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};


gameLessonScenarioData.push(lessonObj);

/*
// Lesson 3
lessonNumber += 1;

lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `[3] Manage Your Code Versions`,
  lessonName: `ManageYourCodeVersions`,
  coins: 200,
  concepts: 'Release Versions',
  studyTime: "5 to 10 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
RemoveAllTanks();
PlaceTile('R', 5, 2);
PlaceTank('blue', 5, 5, 0, false, true);
PlaceTank('white', 10, 5, 1, false);

await SetupTickUpdates(180);

ReportEndOfTest();
  `,
  Difficulty: 1,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
gameLessonScenarioData.push(lessonObj);
*/

// Lesson 4

lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 500,
  concepts: 'Test Driven Development',
  ScenarioName: '[4] Setting Up A Test',
  lessonName: 'ChangeTestScript',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTile('R', 5, 2);
PlaceTank('blue', 5, 5);
PlaceTank('white', 10, 5, false);

await SetupTickUpdates(180);

ReportEndOfTest();
`,
  Difficulty: 2,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.TEST_SCRIPT
};
lessonObj.baselineCode = `
function getNewCommand() {
  for (let i = 0; i < Tanks.length; i += 1){
    const curTank = Tanks[i];
    if (curTank.color == "white") {
      if (MyTank.r == curTank.r) {
        if (MyTank.c < curTank.c && MyTank.dir != "R") {
          return "R";
        } else if (MyTank.c > curTank.c && MyTank.dir != "L") {
          return "L";
        } else {
          return "S";
        }
      } else if (MyTank.c == curTank.c) {
        if (MyTank.r < curTank.r && MyTank.dir != "D") {
          return "D";
        } else if (MyTank.r > curTank.r && MyTank.dir != "U") {
          return "U";
        } else {
          return "S";
        }
      }  // end of column check
    } // end of color check
  } // end of for loop

  return "";
}      
`;
gameLessonScenarioData.push(lessonObj);


// Lesson 5
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 1200,
  concepts: '2D Array, For Loop',
  ScenarioName: '[5] Designing a Nice Battlefield',
  lessonName: 'DesignABattleField',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();

ReportEndOfTest(); 
`,
  Difficulty: 4,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.TEST_SCRIPT
};

gameLessonScenarioData.push(lessonObj);

// Lesson 6
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: '2D Array, For Loop',
  ScenarioName: '[6] Designing a Nice Battlefield II',
  lessonName: 'DesignABattleFieldII',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();

const tiles = {
  R: [],
  M: [],
  T: []
};

const tileTypes = Object.keys(tiles);
for (let j = 0; j < tileTypes.length; j += 1) {
  const tileType = tileTypes[j];
  const positions = tiles[tileType];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(tileType, pos[0], pos[1]);
  }
}

ReportEndOfTest(); 
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.TEST_SCRIPT
};

gameLessonScenarioData.push(lessonObj);

// Lesson 7
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: 'Shortest Path, A-Star Algorithm',
  ScenarioName: `[${lessonNumber}] The A* Algorithm for Shortest Path`,
  lessonName: 'ShortestPath',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceCrystal(10, 5);

await SetupTickUpdates(500);

ReportEndOfTest();

`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_I
};

gameLessonScenarioData.push(lessonObj);


// Lesson 8
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 1000,
  concepts: 'Code Refactoring, Shortest Path',
  ScenarioName: `[${lessonNumber}] Picking Up A Crystal`,
  lessonName: 'ShortestPathII',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceCrystal(10, 5);

await SetupTickUpdates(500);

ReportEndOfTest();

`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_I
};

gameLessonScenarioData.push(lessonObj);


// Lesson 9
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: 'Array and For Loop Re-visit',
  ScenarioName: `[${lessonNumber}] Collecting the Closest Crystal`,
  lessonName: 'GetClosestCrystal',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);

await SetupTickUpdates(900);

ReportEndOfTest();

`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_I
};

gameLessonScenarioData.push(lessonObj);


// Lesson 10
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: 'Arrow Functions, Array Methods: Find, Includes, Filter',
  ScenarioName: `[${lessonNumber}] Array Methods`,
  lessonName: 'ArrayFunctionTutorial',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

await SetupTickUpdates(200);

ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_I
};

gameLessonScenarioData.push(lessonObj);


// Lesson 11
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: 'Chase and Attack tanks',
  ScenarioName: `[${lessonNumber}] Chasing White Tanks`,
  lessonName: 'GoAttackWhiteTanks',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceTank('white', 4, 1, false);
PlaceTank('white', 6, 8, false);
PlaceTank('white', 12, 6, false);

await SetupTickUpdates(1600);

ReportEndOfTest();

`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_I
};

gameLessonScenarioData.push(lessonObj);

// Lesson 12
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 1000,
  concepts: 'If condition re-visit, Rule based system, Decision tree',
  ScenarioName: `[${lessonNumber}] Power Points Allocation`,
  lessonName: 'AllocatePowerPoints',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceCrystal(3, 4);
PlaceCrystal(5, 4);
PlaceCrystal(4, 4);
PlaceCrystal(6, 4);
PlaceCrystal(7, 4);

SetTankProperties(0, {health: 100, specialPower: {
  speed: 0, damage: 0, reload: 0, healthRegen: 0}});

await SetupTickUpdates(500);

ReportEndOfTest();

`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_II
};

lessonObj.baselineCode = `
function upgradeSpecialPowers() {
  if (MyTank.powerPoint == 0 ) return "";
  return "1"; 
}
`;

gameLessonScenarioData.push(lessonObj);

// Lesson 13
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 800,
  concepts: 'If condition and rule based system re-visit',
  ScenarioName: `[${lessonNumber}] Get Special Weapon`,
  lessonName: 'GetSpecialWeapon',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceWeapon(SPECIAL_WEAPON_TYPES.LASER_GUN, 10, 5);
PlaceWeapon(SPECIAL_WEAPON_TYPES.WAY4, 6, 8);
PlaceWeapon(SPECIAL_WEAPON_TYPES.WAY4, 12, 6);
PlaceWeapon(SPECIAL_WEAPON_TYPES.LASER_GUN, 12, 12);

await SetupTickUpdates(300);

ReportEndOfTest();

`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_II
};

lessonObj.baselineCode = `
function weaponIsBetter(weaponType1, weaponType2) {
  return true;
}

function getSpecialWeapon() {
  return "";
}
`;

gameLessonScenarioData.push(lessonObj);


// Lesson 14
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 1000,
  concepts: 'If condition and rule based system re-visit',
  ScenarioName: `[${lessonNumber}] Attack Opponent Tank`,
  lessonName: 'AttackOpponentTank',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceTank('red', 7, 7, false);

PlaceCrystal(10, 5);
PlaceCrystal(4, 1);
PlaceCrystal(6, 8);
PlaceCrystal(12, 6);
PlaceCrystal(12, 12);
for (let i = 1; i < 14; i += 1) {
  PlaceCrystal(1, i);
}
await SetupTickUpdates(2000);

ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_II
};

lessonObj.baselineCode = `
function attackOpponent() {
  return "";
}
`;

gameLessonScenarioData.push(lessonObj);


// lesson 15
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1200,
  concepts: '2D array re-visit',
  ScenarioName: `[${lessonNumber}] Avoid dangerous paths`,
  lessonName: 'AvoidDangerousPaths',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [7, 4], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [5, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};

const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 4, 5);
PlaceTank('red', 7, 7, false);

PlaceTank('white', 7, 12, false);
PlaceTank('white', 7, 13, false);
PlaceTank('white', 7, 9, false);
PlaceTank('white', 7, 10, false);
PlaceTank('white', 1, 8, false);
PlaceTank('white', 2, 6, false);

await SetupTickUpdates(220);

ReportEndOfTest();
`,
  Difficulty: 4,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES_I
};

gameLessonScenarioData.push(lessonObj);


// lesson 15
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1200,
  concepts: '2D array re-visit, Danger evaluation',
  ScenarioName: `[${lessonNumber}] Escape From Danger`,
  lessonName: 'EscapeFromDanger',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

const tiles = {
  R: [[4, 2], [9, 3], [5, 7], [6, 7], [8, 7], [8, 8], [10, 9], [11, 6], [11, 7]],
  M: [[3, 2], [7, 3], [5, 5], [6, 5], [6, 6], [9, 6], [10, 6], [10, 7], [2, 9], [2, 10], [8, 9], [9 ,9]],
  T: [[6, 2], [3, 3], [4, 3], [6, 3], [8, 3], [5, 6], [8, 6], [9, 7], [9, 8], [10, 8], [11, 8], [11, 9],
                [3, 9], [3, 10], [6, 11], [6, 12], [9, 11], [10, 11], [11, 11], [8, 12], [9, 12], [10, 12], [11, 12]],
};
const keys = Object.keys(tiles);
for (let j = 0; j < keys.length; j += 1) {
  const key = keys[j];
  const positions = tiles[key];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    PlaceTile(key, pos[0], pos[1]);
  }
}

PlaceTank('blue', 7, 4);
PlaceTank('white', 7, 7, false);
PlaceTank('white', 7, 8, false);
PlaceTank('white', 7, 10, false);
PlaceTank('white', 7, 11, false);
PlaceTank('white', 8, 4, false);

await SetupTickUpdates(20);

ReportEndOfTest();
`,
  Difficulty: 4,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES_I
};

gameLessonScenarioData.push(lessonObj);


// lesson 16
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'Impacts of opponents',
  ScenarioName: `[${lessonNumber}] Consider Opponent's Behaviors`,
  lessonName: 'ConsiderOpponentsBehaviors',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTank('blue', 6, 7);
PlaceTank('red', 4, 5, false);
PlaceCrystal(13, 12);
PlaceCrystal(2, 3);
PlaceWeapon(SPECIAL_WEAPON_TYPES.LASER_GUN, 3, 3);
PlaceWeapon(SPECIAL_WEAPON_TYPES.WAY4, 13, 13);

await SetupTickUpdates(300);
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES_II
};

gameLessonScenarioData.push(lessonObj);


// lesson 17
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1200,
  concepts: '2D array re-visit, Special strategies',
  ScenarioName: `[${lessonNumber}] Strategies for Special Weapons`,
  lessonName: 'StrategiesForSpecialWeapons',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTank('blue', 6, 7); 
PlaceTank('red', 10, 5, false); 
PlaceTank('red', 8, 9, false); 
PlaceTank('white', 2, 2, false); 
PlaceTank('white', 10, 6, false); 
PlaceTank('white', 3, 6, false); 
PlaceWeapon(SPECIAL_WEAPON_TYPES.MISSILE, 3, 3); 
  
await SetupTickUpdates(450); 
ReportEndOfTest(); 
`,
  Difficulty: 4,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES_II
};

gameLessonScenarioData.push(lessonObj);


// lesson 18
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 500,
  concepts: 'Teamwork, Leader Election',
  ScenarioName: `[${lessonNumber}] Leader Election`,
  lessonName: 'TeamworkFramework',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
RemoveAllTanks();

PlaceTank('blue', 6, 7);
PlaceTank('blue', 10, 5);
PlaceTank('blue', 8, 9);

await SetupTickUpdates(300);
ReportEndOfTest();
`,
  Difficulty: 2,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.TEAMWORK
};

gameLessonScenarioData.push(lessonObj);


// lesson 19
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'Teamwork, Team communication',
  ScenarioName: `[${lessonNumber}] Communication Channel`,
  lessonName: 'TeamworkFrameworkII',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
RemoveAllTanks();

PlaceTank('blue', 6, 7);
PlaceTank('blue', 10, 5);
PlaceTank('blue', 8, 9);

await SetupTickUpdates(300);
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.TEAMWORK
};

gameLessonScenarioData.push(lessonObj);


// lesson 20
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'Teamwork, Limited resources',
  ScenarioName: `[${lessonNumber}] Resource Allocation I`,
  lessonName: 'TeamworkAllocateResource',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTank('blue', 6, 7);
PlaceTank('blue', 10, 5);
PlaceTank('blue', 8, 9);

PlaceCrystal(13, 12);
PlaceCrystal(2, 3);
PlaceCrystal(7, 8);

await SetupTickUpdates(500);
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.TEAMWORK
};

gameLessonScenarioData.push(lessonObj);


// lesson 21
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1800,
  concepts: 'Teamwork, Limited resources',
  ScenarioName: `[${lessonNumber}] Resource Allocation II`,
  lessonName: 'TeamworkAllocateResourceII',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ClearMaze();
RemoveAllTanks();

PlaceTank('blue', 6, 7, true);
PlaceTank('blue', 10, 5, true);
PlaceTank('blue', 8, 9, true);

PlaceCrystal(13, 12);
PlaceCrystal(2, 3);
PlaceCrystal(7, 8);

await SetupTickUpdates(500);
ReportEndOfTest();
`,
  Difficulty: 5,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.TEAMWORK
};

gameLessonScenarioData.push(lessonObj);

// lesson 22
lessonNumber += 1;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1800,
  concepts: 'Teamwork, Collaboration',
  ScenarioName: `[${lessonNumber}] Attacking Opponent`,
  lessonName: 'TeamworkAttackingOpponent',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
RemoveAllTanks();

PlaceTank('blue', 3, 4);
PlaceTank('red', 4, 5);
PlaceTank('blue', 6, 7);
PlaceTank('red', 7, 2);
PlaceTank('blue', 10, 8);
PlaceTank('red', 9, 5);

SetTankProperties(0, {specialPower: {
  speed: 2, damage: 3, reload: 2, healthRegen: 2}});
SetTankProperties(2, {specialPower: {
  speed: 2, damage: 3, reload: 2, healthRegen: 2}});
SetTankProperties(4, {specialPower: {
  speed: 2, damage: 3, reload: 2, healthRegen: 2}});

SetTankProperties(1, {health: 2000, specialPower: {
  speed: 2, damage: 1, reload: 2, healthRegen: 0}});
SetTankProperties(3, {specialPower: {
  speed: 2, damage: 1, reload: 2, healthRegen: 2}});
SetTankProperties(5, {specialPower: {
  speed: 2, damage: 1, reload: 2, healthRegen: 2}});

await SetupTickUpdates(1000);
ReportEndOfTest();
`,
  Difficulty: 5,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.TEAMWORK
};

gameLessonScenarioData.push(lessonObj);



const parseLessonHTML = (lessonName, gameName) => {
  const data = Assets.getText(`TutorialLessons/${gameName}/${lessonName}.html`);

  const json = [];
  let currentElement = {};

  const parser = new htmlparser.Parser({
    onopentag(name, attribs) {
      if (name === 'element') {
        currentElement = {
          elementId: attribs.elementid,
          codeType: attribs.codetype ? attribs.codetype : '',
          elementType: attribs.elementtype ? attribs.elementtype : '', // lower case only!!
          answerKey: attribs.answerkey ? attribs.answerkey : '',
          answerReason: attribs.answerreason ? attribs.answerreason : '',
          html: '',
          codeHidden: true,
          // hints: {},
          condition: attribs.condition ? attribs.condition : '',
          conditionInd: attribs.conditionind ? attribs.conditionind : '',
          optional: attribs.optional ? attribs.optional : 'False',
          showCondition: attribs.showcondition ? attribs.showcondition : '',
          languageSkills: attribs.languageskills ? attribs.languageskills : '',
          // codecondition: attribs.codecondition ? attribs.codecondition : '',
        };
        // console.log("\n\n\n\ncurrent element " + JSON.stringify(currentElement));
      } else {
        currentElement.html += `<${name} `;
        Object.keys(attribs).forEach((field) => {
          currentElement.html += `${field} = "${attribs[field]}"`;
        });
        currentElement.html += '>';
      }
    },
    ontext(text) {
      currentElement.html += text;
    },
    onclosetag(name) {
      if (name === 'element') {
        // seperate html vs code
        const allhtmllines = currentElement.html.split("\n");
        let html = "";
        let code = "";
        let cleancode = "";
        let inCode = false;
        let inCleanCode = false;
        for (let i = 0; i < allhtmllines.length; i++) {
          const line = allhtmllines[i];
          // console.log("reviewing line " + line);
          if (!inCode) {
            if (inCleanCode) {

            } else {
              if (line.indexOf("<code") >= 0) {
                // console.log("found code block");
                inCode = true;
              }
              if (line.indexOf("<cleancode") >= 0) {
                // console.log("found clean code block");
                inCleanCode = true;
              }
            }
          }

          if (inCode) {
            if (line.indexOf("<code") >= 0) {
              if (line.indexOf("false") >= 0) {
                currentElement.codeHidden = false;
              } else {
                currentElement.codeHidden = true;
              }
              // console.log("set codeHidden " + currentElement.codeHidden);
            } else if (line.indexOf("</code>") >= 0) {
              // do nothing
              // console.log("end code block");
              inCode = false;
            } else {
              code += `${line} \n`;
            }
          } else if (inCleanCode) {
            if (line.indexOf("<cleancode") >= 0) {} else if (line.indexOf("</cleancode>") >= 0) {
              // console.log("end clean code block");
              inCleanCode = false;
            } else {
              // console.log("add to clean code: " + line);
              cleancode += `${line} \n`;
            }
          } else {
            html += `${line} \n`;
          }
        }
        currentElement.html = html;
        currentElement.code = code;
        currentElement.cleancode = cleancode;
        json.push(currentElement);
      } else if (name.indexOf('condition') >= 0) {
        // skip
      } else {
        currentElement.html += `</${name}>`;
      }
    }
  }, {
    decodeEntities: true
  });
  parser.write(data);
  parser.end();

  // console.log("json is " + JSON.stringify(json));
  return json;
};


const prepareLessonScenariosTank = () => {
  if (Scenarios.find({
    gameId: tankGameId
  }).count() > 0) {
    Scenarios.remove({
      gameId: tankGameId
    });
  }

  let id = 1;
  _.map(gameLessonScenarioData, (doc) => {
    // add elements as parsed from the lesson html to the doc first
    doc.instructionElements = parseLessonHTML(doc.lessonName, doc.gameName);
    // const newdoc = JSON.parse(JSON.stringify(doc));
    doc._id = `T${id++}`;
    console.log(`inserting newdoc ${doc._id} ${doc.ScenarioSequenceNumber}`);
    const readonlyLineNumbers = [];
    if (doc.applyBaselineCode) {
      const p = doc.baselineCode.split("\n");
      let newBaseline = "";
      for (let i = 0; i < p.length; i++) {
        newBaseline += `${p[i].replace("---", "")}\n`;
        continue;
      }
      doc.baselineCode = newBaseline;
    }
    doc.readonlyLinenumbers = readonlyLineNumbers;
    Scenarios.insert(doc);
  });
};


export default prepareLessonScenariosTank;
