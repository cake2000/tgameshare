import { Games, Scenarios, UserChat, UserCodeTesting } from '../../../lib/collections';
import { LEVELS, OPPONENTS, TUTORIAL_GROUP, MIGRATION_CONST } from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;
const htmlparser = require('htmlparser2');
const fs = require('fs');



// old pool tutorials at /home/binyu/dev/iGame/iGameApp/public/RiskyPool
// pool jargon glossary: http://billiards.colostate.edu/glossary.html
// top machine learning algorithms: https://towardsdatascience.com/a-tour-of-the-top-10-algorithms-for-machine-learning-newbies-dde4edffae11




var gameLessonScenarioData = [];
var lessonNumber = 1;


// lesson 1
var lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 500,
  concepts: 'Coordinates, Function, Object',
  ScenarioName: 'A Simple Break Shot',
  lessonName: 'ASimpleBreakShot',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(false); \r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
lessonObj.baselineCode =
  `function getBreakShot() {
  return { 
    aimx: 0, 
    aimy: 0
  }; 
}`;
gameLessonScenarioData.push(lessonObj);

// lesson 2
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'A Silly Call Shot',
  lessonName: 'ARandomCallShot',
  coins: 500,
  concepts: 'Function/Object revisited, Random Number',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, -200, -80);
PlaceBallOnTable(2, -50, -200);
PlaceBallOnTable(3, -450, -300);
PlaceBallOnTable(4, 0, 0);
TakeCallShot();
await WaitForAllBallStop();
ReportEndOfTest();
  `,
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
// lessonObj.baselineCode =
// `
// function getCallShot() {
//   return { 
//     aimx: 0, aimy: 0
//   }; 
// }
// `;
gameLessonScenarioData.push(lessonObj);



// lesson 3
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `Release Your First Bot`,
  lessonName: `ManageYourRobotReleases`,
  coins: 200,
  concepts: 'Release Versions',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 1,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
gameLessonScenarioData.push(lessonObj);



// lesson 4
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Down Goes The Black Ball',
  lessonName: 'DownGoesTheBlackBall',
  coins: 500,
  concepts: 'Random Number revisited, Array',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -80);\r\nPlaceBallOnTable(1, 0, 50 + Math.floor(Math.random()*400)); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
  `
function getCallShot() {
  return { 
    aimx: Balls[1].x, 
    aimy: ?, 
    strength: 50
  }; 
}`;
gameLessonScenarioData.push(lessonObj);



// lesson 5
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Aim Position Calculation Helper',
  lessonName: 'AimPositionCalculationHelper',
  coins: 500,
  concepts: 'Function and Array revisited, const vs let',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nPlaceBallOnTable(6, 330, 130); \r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
  `function getCallShot() {
  //TODO: shoot ball 3 into pocket 0
  return { 
    aimx: Balls[3].x + 40, 
    aimy: Balls[3].y + ?, 
    strength: 30 
  };
}`;
gameLessonScenarioData.push(lessonObj);



// lesson 6
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Shot Success Probability',
  lessonName: 'ShotSuccessProbability',
  coins: 1000,
  concepts: 'Async/Await, Probability, Conditional',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 4,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
  `
function getCallShot() {
  // calculate shot commands
  const aimPoint0 = getAimPosition(Balls[3], Pockets[0]);
  const cmd0 = {
    aimx: aimPoint0.x,
    aimy: aimPoint0.y,
    strength: 30,
    targetBallID: 3,
    targetPocketID: 0
  };

  const aimPoint1 = getAimPosition(Balls[3], Pockets[1]);
  const cmd1 = {
    aimx: aimPoint1.x,
    aimy: aimPoint1.y,
    strength: 30,
    targetBallID: 3,
    targetPocketID: 1
  };

  // calculate success probability for cmd0 and cmd1
  const prob0 = await calculateProbability(cmd0);
  const prob1 = ? ;

  // always return cmd0 for now
  return cmd0;
}
`;
gameLessonScenarioData.push(lessonObj);




// lesson 7
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Walking Through Multiple Pockets',
  lessonName: 'WalkingThroughMultiplePockets',
  coins: 1000,
  concepts: 'Simple Search Algorithm',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
  `
async function getCallShot() {
  const aimPoint0 = getAimPosition(Balls[3], Pockets[0]);
  const cmd0 = {
    aimx: aimPoint0.x,
    aimy: aimPoint0.y,
    strength: 30,
    targetBallID: 3,
    targetPocketID: 0
  };
  const aimPoint1 = getAimPosition(Balls[3], Pockets[1]);
  const cmd1 = {
    aimx: aimPoint1.x,
    aimy: aimPoint1.y,
    strength: 30,
    targetBallID: 3,
    targetPocketID: 1
  };
  const aimPoint2 = getAimPosition(Balls[3], Pockets[2]);
  const cmd2 = {
    aimx: aimPoint2.x,
    aimy: aimPoint2.y,
    strength: 30,
    targetBallID: 3,
    targetPocketID: 2
  };

  const prob0 = await calculateProbability(cmd0);
  const prob1 = await calculateProbability(cmd1);
  const prob2 = await calculateProbability(cmd2);

  // walk through commands and compare probability 
  let bestCommand = null;
  let highestProb = -1;

  if (prob0 > highestProb) {
    bestCommand = cmd0;
    highestProb = prob0;
  }

  //check on cmd1 and cmd2
  if (prob1 > highestProb) {
    bestCommand = ? ;
    highestProb = ? ;
  }
  
  if ( ? ) {
    bestCommand = ? ;
    highestProb = ? ;
  }

  // return the best command we found
  return bestCommand;
}

function getBreakShot() {
  return {
    aimx: 0,
    aimy: 0,
    strength: 80
  };
}
`;
gameLessonScenarioData.push(lessonObj);





// lesson 8
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Using For-Loop to Walk Through All Pockets',
  lessonName: 'UsingForLoop',
  coins: 1000,
  concepts: 'For-loop, Break',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
  `
async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = null;
  let highestProb = -1;

  //TODO: complete for-loop using variable 'pocketID'
  for (let pocketID = ? ; pocketID <= ? ; ? ) {
    const aimPoint = getAimPosition(Balls[3], Pockets[pocketID]);
    const cmd = {
      aimx: aimPoint.x,
      aimy: aimPoint.y,
      strength: 30,
      targetBallID: 3,
      targetPocketID: pocketID
    };
    const prob = await calculateProbability(cmd);

    if ( ? ) {
      bestCommand = cmd;
      highestProb = prob;
    }
  }
  // return the best command we found
  return bestCommand;
}

function getBreakShot() {
  return {
    aimx: 0,
    aimy: 0,
    strength: 80
  };
}
`;
gameLessonScenarioData.push(lessonObj);


// lesson 9
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'For-Loop for All Balls',
  lessonName: "AnotherForLoop",
  coins: 1000,
  concepts: 'iterate through array, For-loop revisited',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 600, 380);\r\nPlaceBallOnTable(2, -170, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nPlaceBallOnTable(6, 630, 330);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
  `
async function getCallShot() {
  // place holder for best command and its probability
  let bestCommand = null;
  let highestProb = -1;

  // array of ball IDs that can be legally targeted
  const legalBallIDs = world.CandidateBallList[MyID];

  //TODO: complete for-loop to iterate through all legalBallIDs
  for (let k = ? ; ? ; ? ) {
    const ballID = ?;
    for (let pocketID = 0; pocketID <= 5 ; pocketID ++) {
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);
      const cmd = { 
        aimx: aimPoint.x, 
        aimy: aimPoint.y, 
        strength: 30, 
        targetBallID: ballID, 
        targetPocketID: pocketID 
      };
      const prob = await calculateProbability(cmd);
        if ( prob > highestProb ) {
        // found a better command: record the command and its probability
        bestCommand = cmd ; 
        highestProb = prob ;
      }
    } // end of for loop "pocketID"
  } // end of for loop "k"

  return bestCommand;
}

function getBreakShot() {
  return { 
    aimx: 0, 
    aimy: 0, 
    strength: 80
  }; 
}
`;
gameLessonScenarioData.push(lessonObj);








// lesson 10
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `Changing Test Script`,
  lessonName: 'ChangingTestScript',
  coins: 500,
  concepts: 'Test-Driven Development (TDD)',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
// clear out all balls first  
ResetTable(true);

// place a few balls back on table by specifying ballID, x and y
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -886, -250);
await UpdateWorld();

// set robot to shoot red balls only
ChooseRedColor(); 

// prompt robot to make a call shot
TakeCallShot();

// report end of test when all balls stop
await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL
};

gameLessonScenarioData.push(lessonObj);



// lesson 11
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `Placing Cue Ball 'By Hand'`,
  lessonName: "PlacingCueBallByHand",
  coins: 1000,
  concepts: 'revisit Functions/Objects',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
  ResetTable(true);
  PlaceBallOnTable(0, 0, 0);
  PlaceBallOnTable(2, -570, 180); 
  PlaceBallOnTable(3, 0, -150);
  PlaceBallOnTable(1, -719, -37);
  ChooseRedColor(); 

  await PlaceCueBallFromHand();
  TakeCallShot();

  await WaitForAllBallStop();
  ReportEndOfTest();
  `,
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL
};
lessonObj.baselineCode =
  `
function getCueBallPlacement() {
  return {
    x: 0,
    y: 0
  };
}
`;
gameLessonScenarioData.push(lessonObj);




// lesson 12
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `Optimizing Cue Ball Placement`,
  lessonName: "AvoidingBlockedPockets",
  coins: 1000,
  concepts: 'revisit For-loops, Path Blockage',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -570, 180); 
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(1, -920, -422);
PlaceBallOnTable(5, -338, -60);
ChooseRedColor(); 
await PlaceCueBallFromHand();
TakeCallShot();
await WaitForAllBallStop();
ReportEndOfTest();
  `,
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL
};
lessonObj.baselineCode =
  `
function getCueBallPlacement() {
  const ballPos = Balls[3];
  for (let pocketID=0; pocketID <=5; pocketID ++) {
    const pocketPos = Pockets[pocketID];
    //TODO: calculate whether this pocket is blocked from ball 3
    const isBlocked = ?;
    if ( ? ) {
      return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);  
    }
  }
}
`;
gameLessonScenarioData.push(lessonObj);


// new lessons for differentiate! intermediate
// 15. repeat testing for better break shot (no graphing!): end state, console log, repeating
// 13. search for optimal cue ball end position using strength/spin while keeping prob is high  
// 14. play safety when there is no good shot: white -> red -> yellow -> corner pocket
// 16. better cue ball placement function 
// 17. 
// 16. special case? maybe add after first release!

// self:
// 13. calculate end state for avoid cueball/blackball: you can change it more! if you don't like cue ball ending position!
// 17.  better cue ball placement for next shot 
// 18. rebounding 

/*
TODO:
1. DONE add question for scratch
2. add links to home page 
3. add link to forum at beginning of lesson, 
3.5 add clean code also to beginning of lesson -> cherish?
4. DONE create forum topic for scheduling online games
5. a clear path for students to get human help -> cherish?
6. top 5 worst case scenarios
7. presentation and hand out
8. DONE venue for presentation 
9. isolate scratch block
10. check out great neck house. projector or TV!
*/


// new lesson 13
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'End State, Repeated Simulation, Logging to Console',
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `Repeated Simulation for The Break Shot`,
  lessonName: `TestForBestBreakShot`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
// reset table to game start layout
ResetTable(false);
TakeBreakShot();
await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

gameLessonScenarioData.push(lessonObj);


// new lesson 14
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'Search for the Optimal Solution',
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `Optimizing Cue Ball End Position`,
  lessonName: `OptimizingCueBallEndPosition`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `

ResetTable(true);

PlaceBallOnTable(0, 860, -213);
PlaceBallOnTable(1, 339, -413);
PlaceBallOnTable(2, 899, -368);
PlaceBallOnTable(3, -888, 106);
await UpdateWorld();

ChooseRedColor(); 

TakeCallShot();
await WaitForAllBallStop();

TakeCallShot();
await WaitForAllBallStop();

ReportEndOfTest();
  `,
  Difficulty: 4,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

gameLessonScenarioData.push(lessonObj);

// old setup
// PlaceBallOnTable(0, 854, -213);
// PlaceBallOnTable(1, 339, -413);
// PlaceBallOnTable(2, 899, -368);
// PlaceBallOnTable(3, -883, 93);


// new lesson 15
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'Defense with Safety Shot, Search revisited',
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `Play Safety When There is No Good Shot`,
  lessonName: `PlaySafetyIfNoGoodShot`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `

ResetTable(true);

PlaceBallOnTable(0, -800, 96);
PlaceBallOnTable(1, 839, -413);
PlaceBallOnTable(2, -600, 168);
PlaceBallOnTable(4, 737, 395);
PlaceBallOnTable(8, 686, -208);
await UpdateWorld();

ChooseRedColor(); 

TakeCallShot();
await WaitForAllBallStop();
ReportEndOfTest();
  `,
  Difficulty: 4,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

gameLessonScenarioData.push(lessonObj);


// new lesson 16
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `Speed Up Search for Best Call Shots`, // using isPathBlocked
  lessonName: `SpeedUpSearchOfBestCallShots`,
  coins: 1000,
  concepts: 'avoid unnecessary work, continue in a loop, cut angle',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);

PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -532, -255);
PlaceBallOnTable(3, 225, -88);
PlaceBallOnTable(7, -289, -150);
PlaceBallOnTable(8, 460, -404);

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

gameLessonScenarioData.push(lessonObj);





// new lesson 17
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  ScenarioName: `Kick Shots To The Rescue`,
  lessonName: `PowerfulBankShots`,
  coins: 1000,
  concepts: 'Mirror point calculation, search revisited',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);

PlaceBallOnTable(0, 379, -45);
PlaceBallOnTable(1, -275, -433);
PlaceBallOnTable(2, 742, -255);
PlaceBallOnTable(3, 187, -350);
PlaceBallOnTable(4, 507, -117);
PlaceBallOnTable(5, 264, -198);

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 5,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES,
};

gameLessonScenarioData.push(lessonObj);

// new lesson 18
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  ScenarioName: `Special Logic for Pre-defined Scenarios`,
  lessonName: `SpecialLogicForPredefinedSituations`,
  coins: 1000,
  concepts: 'End Game',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
  ResetTable(true);
  PlaceBallOnTable(0, -800, -300);
  PlaceBallOnTable(1, 680, 0);
  PlaceBallOnTable(4, 125, 150);
  
  ChooseRedColor(); 
	await UpdateWorld();
  TakeCallShot();
  
  await WaitForAllBallStop();
  ReportEndOfTest();
`,
  Difficulty: 4,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES,
};

gameLessonScenarioData.push(lessonObj);












var parseLessonHTML = function (lessonName, gameName) {
  var data = Assets.getText(`TutorialLessons/${gameName}/${lessonName}.html`);
  //var data = fs.readFileSync(`TutorialLessons/${gameName}/${lessonName}.html`);
  // console.log("data is " + data);

  var json = [];
  var currentElement = {};

  var parser = new htmlparser.Parser({
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
        var allhtmllines = currentElement.html.split("\n");
        var html = "";
        var code = "";
        var cleancode = "";
        var inCode = false;
        var inCleanCode = false;
        for (var i = 0; i < allhtmllines.length; i++) {
          var line = allhtmllines[i];
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
            if (line.indexOf("<cleancode") >= 0) {
            } else if (line.indexOf("</cleancode>") >= 0) {
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




const removeLessonScenarios = () => {
  // if (UserChat.find().count() > 0) {
  //   UserChat.remove({});
  // }
}

const prepareLessonScenarios = () => {

  // if (UserChat.find().count() > 0) {
  //   UserChat.remove({});
  // }
  // if (UserCodeTesting.find().count() > 0) {
  //   UserCodeTesting.remove({});
  // }
  // return;
  if (Scenarios.find().count() > 0) {
    Scenarios.remove({});
  }

  let id = 1;
  _.map(gameLessonScenarioData, (doc) => {
    // add elements as parsed from the lesson html to the doc first
    doc.instructionElements = parseLessonHTML(doc.lessonName, doc.gameName);
    // const newdoc = JSON.parse(JSON.stringify(doc));
    doc._id = `P${id++}`;
    console.log("inserting newdoc " + doc._id + " " + doc.ScenarioSequenceNumber);
    const readonlyLineNumbers = [];
    if (doc.applyBaselineCode) {
      const p = doc.baselineCode.split("\n");
      let newBaseline = "";
      for (let i = 0; i < p.length; i++) {
        newBaseline += `${p[i].replace("---", "")}\n`;
        continue;
        // if (!p[i].trim().endsWith("---")) {
        //   readonlyLineNumbers.push(i);
        //   newBaseline += `${p[i]}                                                                        ////READONLY\n`;
        // } else {
        //   newBaseline += `${p[i].replace("---", "")}\n`;
        // }
      }
      doc.baselineCode = newBaseline;
    }
    doc.readonlyLinenumbers = readonlyLineNumbers;
    Scenarios.insert(doc);
  });
};


export default prepareLessonScenarios;
// export removeLessonScenarios;
