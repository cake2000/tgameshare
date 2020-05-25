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
  coins: 2000,
  concepts: 'Coordinates, Function, Object',  
  ScenarioName: 'A Simple Break Shot',
  lessonName: 'ASimpleBreakShot',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(false); \r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
lessonObj.baselineCode =
`function getBreakShot() {
  return { 
    aimx: 0, aimy: 0
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
  coins: 1000,
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
  gameId: poolGameId,
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
  coins: 500,
  concepts: 'Release Versions',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 1,
  locked: true,
  gameId: poolGameId,
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
  coins: 1000,
  concepts: 'Random Number revisited, Array',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -80);\r\nPlaceBallOnTable(1, 0, 50 + Math.floor(Math.random()*400)); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
`function getCallShot() {
  return { 
    aimx: Balls[1].x, aimy: ?, strength: 50
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
  coins: 1000,
  concepts: 'Function and Array revisited, const vs let',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nPlaceBallOnTable(6, 330, 130); \r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
`function getCallShot() {
  //TODO: shoot ball 3 into pocket 0
  return { 
    aimx: Balls[3].x + 40, aimy: Balls[3].y + ?, strength: 30 
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
  coins: 1500,
  concepts: 'Async/Await, Probability, Conditional',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 4,
  locked: true,
  gameId: poolGameId,
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
  const cmd0 = { aimx: aimPoint0.x, aimy: aimPoint0.y, strength: 30, 
    targetBallID: 3, targetPocketID: 0 };
  
  const aimPoint1 = getAimPosition(Balls[3], Pockets[1]);
  const cmd1 = { aimx: aimPoint1.x, aimy: aimPoint1.y, strength: 30, 
    targetBallID: 3, targetPocketID: 1 };

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
  coins: 1500,
  concepts: 'Simple Search Algorithm',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
`
async function getCallShot() {
  const aimPoint0 = getAimPosition(Balls[3], Pockets[0]);
  const cmd0 = { aimx: aimPoint0.x, aimy: aimPoint0.y, strength: 30, 
    targetBallID: 3, targetPocketID: 0 };
  const aimPoint1 = getAimPosition(Balls[3], Pockets[1]);
  const cmd1 = { aimx: aimPoint1.x, aimy: aimPoint1.y, strength: 30, 
    targetBallID: 3, targetPocketID: 1 };
  const aimPoint2 = getAimPosition(Balls[3], Pockets[2]);
  const cmd2 = { aimx: aimPoint2.x, aimy: aimPoint2.y, strength: 30, 
    targetBallID: 3, targetPocketID: 2 };

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
    aimx: 0, aimy: 0, strength: 80
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
  coins: 2000,
  concepts: 'For-loop, Break',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
`
async function getCallShot() {
  // place holder for best command and higest probability
  let bestCommand = null;
  let highestProb = -1;

  //TODO: complete for-loop using variable 'pocketID'
  for (let pocketID = ?; pocketID <= ? ; ?) {
    const aimPoint = getAimPosition(Balls[3], Pockets[pocketID]);
    const cmd = { 
      aimx: aimPoint.x, 
      aimy: aimPoint.y, 
      strength: 30, 
      targetBallID: ballID, 
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
    aimx: 0, aimy: 0, strength: 80
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
  coins: 1500,
  concepts: 'iterate through array, For-loop revisited',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 600, 380);\r\nPlaceBallOnTable(2, -170, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nPlaceBallOnTable(6, 630, 330);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
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
    }
  }
  return bestCommand;
}

function getBreakShot() {
  return { 
    aimx: 0, aimy: 0, strength: 80
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
  coins: 1000,
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
  gameId: poolGameId,
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
  coins: 2000,
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
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL
};
lessonObj.baselineCode =
`
function getCueBallPlacement() {
  return {x: 0, y: 0};
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
  coins: 1500,
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
  gameId: poolGameId,
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
  coins: 2000,
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
  gameId: poolGameId,
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
  coins: 3000,
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
  gameId: poolGameId,
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
  coins: 3000,
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
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

gameLessonScenarioData.push(lessonObj);













// lesson 13
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  ScenarioName: `Skipping Blocked Balls and Pockets`, // using isPathBlocked
  lessonName: `IgnoreBlockedBallsandPockets`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -532, -255);
PlaceBallOnTable(3, 5, -150);
PlaceBallOnTable(4, 0, -350);
PlaceBallOnTable(6, 260, -124);
PlaceBallOnTable(7, -289, -150);
PlaceBallOnTable(8, 460, -404);
PlaceBallOnTable(9, 460, 224);


ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SPEED_UP_CALL_SHOTS
};

gameLessonScenarioData.push(lessonObj);





// lesson 14
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  // using new API to calculate angle between 2 lines: cue ball to target ball and target ball to target pocket
  ScenarioName: `Skipping Impossible Pockets`,
  lessonName: `IgnoringImpossiblePockets`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -354, -217);
PlaceBallOnTable(3, 225, -88);
PlaceBallOnTable(7, 630, 103);

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SPEED_UP_CALL_SHOTS
};

gameLessonScenarioData.push(lessonObj);



// lesson 15
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  // using new API to calculate angle between target ball and side pocket
  ScenarioName: `Skipping Wide Angles to Side Pockets`,
  lessonName: `IgnoringWideAngletoSidePockets`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, -500, 0);
PlaceBallOnTable(2, -326, -296);
PlaceBallOnTable(3, 225, -88);
PlaceBallOnTable(6, -208, -175);
PlaceBallOnTable(7, 630, 103);
PlaceBallOnTable(9, -250, 399);

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.SPEED_UP_CALL_SHOTS
};

gameLessonScenarioData.push(lessonObj);


// lesson 16
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `Avoid Pocketing Cue Ball or Black Ball`,
  lessonName: `AvoidPocketingCueBallorBlackBall`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(1, -903, -312);
PlaceBallOnTable(2, 0, -437);
PlaceBallOnTable(3, 3, 385);
PlaceBallOnTable(7, 851, 371); 

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();`,
  Difficulty: 4,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.MORE_INTERMEDIATE_TACTICS,
};

gameLessonScenarioData.push(lessonObj);





// lesson 17
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  // use a hill climbing for micro-adjustment of strength of a shot
  ScenarioName: `Refine Shot Strength`,
  lessonName: `RefineShotAngleandStrength`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true); 
PlaceBallOnTable(2,-100, -50);
PlaceBallOnTable(1,-551, 216);
PlaceBallOnTable(0,600, 300);

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();`,
  Difficulty: 5,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.MORE_INTERMEDIATE_TACTICS,
};

gameLessonScenarioData.push(lessonObj);







// lesson 18
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  // in getCueballPlacement, test if cue ball place point is out side cushions or blocked from target ball. also remember target ball and pocket chosen to save time!?
  ScenarioName: `Improving Cue Ball Placement`,
  lessonName: `ImproveCueBallPlacement`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(1, -843, -410);
PlaceBallOnTable(2, 0, -150);
PlaceBallOnTable(4, 0, -80);
PlaceBallOnTable(3, 105, 430);
PlaceBallOnTable(5, 284, 40);
PlaceBallOnTable(6, 789, -356);
PlaceBallOnTable(8, -333, 80);

ChooseRedColor(); 

await PlaceCueBallFromHand();
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
  `,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.INTERMEDIATE.MORE_INTERMEDIATE_TACTICS
};

gameLessonScenarioData.push(lessonObj);




  // lesson 19
  lessonNumber++;
  lessonObj = {
    userId: 'system',
    visibleUserIds: [],
    package: 'intermediate2',
    // world.Pockets2, which has all mirrors already? also need to do grid search
    ScenarioName: `Rebound Shot Using Mirrored Pockets - Part I`,
    lessonName: `ReboundShotUsingMirroredPockets`,
    ScenarioSequenceNumber: lessonNumber,
    SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, -463, 329);
PlaceBallOnTable(2, -335, -422);
PlaceBallOnTable(1, 255, -355);

ChooseRedColor(); 
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
    group: TUTORIAL_GROUP.INTERMEDIATE.REBOUNDS,
  };

gameLessonScenarioData.push(lessonObj);




  // lesson 20
  lessonNumber++;
  lessonObj = {
    userId: 'system',
    visibleUserIds: [],
    package: 'intermediate2',
    // world.Pockets2, which has all mirrors already? also need to do grid search
    ScenarioName: `Rebound Shot Using Mirrored Pockets - Part II`,
    lessonName: `ReboundShotUsingMirroredPocketsII`,
    ScenarioSequenceNumber: lessonNumber,
    SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, -463, 329);
PlaceBallOnTable(2, -335, -422);
PlaceBallOnTable(1, 255, -355);

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
    group: TUTORIAL_GROUP.INTERMEDIATE.REBOUNDS,
  };

gameLessonScenarioData.push(lessonObj);





// lesson 21
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate2',
  // if all balls are blocked for direct shot, find indirect shot to touch a ball with my color to avoid foul
  ScenarioName: `Rebound Shot When There is No Direct Shot`,
  lessonName: `ReboundShotWhenThereisNoDirectShot`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
  ResetTable(true);

  PlaceBallOnTable(0, 441, -418);
  PlaceBallOnTable(1, -275, -433);
  PlaceBallOnTable(2, 805, -55);
  PlaceBallOnTable(3, 318, -419);
  PlaceBallOnTable(4, 597, -279);
  PlaceBallOnTable(8, 249, -429);
  PlaceBallOnTable(10, 318, -375);
  
  ChooseRedColor(); 
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
  group: TUTORIAL_GROUP.INTERMEDIATE.REBOUNDS,
};

gameLessonScenarioData.push(lessonObj);




/* --------- Start of Machine Learning -------- */


// lesson 22
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // repeat breakshot many times and summarize result to see if it is good
  ScenarioName: `Repeating a Test`,
  lessonName: `RepeatingaTest`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
  
// move all balls to starting position
ResetTable(false);
// define the break shot command to be evaluated
const cmd = {cueballx: -500, cuebally: 0, aimx: 0, aimy: 0, strength: 85};
// place cue ball on table according to command
PlaceBallOnTable(0, cmd.cueballx, cmd.cuebally);

// simulate a shot with no random noise added
const endState = await calculateEndState(cmd);
// format the endState object as a string and print it out
console.log(JSON.stringify(endState));

// report the end of test
ReportEndOfTest();


`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.LINEAR_REGRESSION_MODEL
};

gameLessonScenarioData.push(lessonObj);


/*
ResetTable(false);

  // define an array of 3 different break shot commands
  var shotCmds = [];
  shotCmds.push({cueballx: -500, cuebally: 0, aimx: 0, aimy: 0, strength: 85});
  shotCmds.push({cueballx: -500, cuebally: 100, aimx: 0, aimy: 50, strength: 85});
  shotCmds.push({cueballx: -500, cuebally: 200, aimx: 0, aimy: 100, strength: 85});

  var commandList = [];
  var goodShotCountList = [];
  var badShotCountList = [];
  for (var cmdInd=0; cmdInd < shotCmds.length; cmdInd ++) {
    var cmd = shotCmds[cmdInd];
    PlaceBallOnTable(0, cmd.cueballx, cmd.cuebally);
    await UpdateWorld();
    var goodShotCount = 0;
    var totalRuns = 20;
    for (var i=0; i<totalRuns; i++) {
      var endState = await calculateEndState(cmd, true);
      var isGoodShot = false;
      for (var ballID=2; ballID<endState.length; ballID++) {
        if (endState[ballID].inPocketID != null) {
          isGoodShot = true;
          break;
        }
      }
      if (isGoodShot)
        goodShotCount ++;
    }
    commandList.push("Command" + cmdInd);
    goodShotCountList.push(goodShotCount);
    badShotCountList.push(totalRuns - goodShotCount);
  }

  var allResults = {
    Command: commandList,
    GoodShot: goodShotCountList,
    BadShot: badShotCountList
  };

  await SubmitData('BreakShotResult', allResults);
  PlotData('BreakShotResult', 'BasicColumn', 'Command');
  ReportEndOfTest();
*/




// lesson 23
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // store test data into local web storage
  ScenarioName: `Linear Regression Model - Part I`,
  lessonName: `LinearRegressionModelPartI`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
const probabilityList = [];
const ballDistanceList = [];
//TODO: complete pocket distance related code
//h0::initialize pocketDistanceList as an empty array::use []
const pocketDistanceList = ?;
const cutAngleList = [];

// run through 300 random scenarios
for (let i=0; i<300; i++) {
  // randomly place cue ball and ball 2 on table
  PlaceBallOnTable(0, 1600 * Math.random() - 800, 800 * Math.random() - 400);
  PlaceBallOnTable(2, 1600 * Math.random() - 800, 800 * Math.random() - 400);
  await UpdateWorld();
  const cmd = calculateShotCommand(2, 0);
  const aimPos = new Victor(cmd.aimx, cmd.aimy);
  const prob = await calculateProbability(cmd);
  if (prob > 0) {
    probabilityList.push(prob);
    ballDistanceList.push(dist2(Balls[2], Balls[0]));
    pocketDistanceList.push(?);
    cutAngleList.push(Math.abs(getCutAngle(Pockets[0], aimPos, Balls[0])));
  }
}
const result = {
  BallDistance: ballDistanceList,
  PocketDistance: pocketDistanceList,
  CutAngle: cutAngleList,
  Probability: probabilityList
};
await SubmitData('testresult1', result);
ReportEndOfTest();  
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.LINEAR_REGRESSION_MODEL
};

gameLessonScenarioData.push(lessonObj);





// lesson 24
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // store test data into local web storage
  ScenarioName: `Linear Regression Model - Part II`,
  lessonName: `LinearRegressionModelPartII`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
const allResults = await LoadData('testresult1');
const model = await TrainLinearModel('testresult1', 'Probability', ['BallDistance']);
console.log("model intercept: " + model.intercept);
console.log("model coefficient for BallDistance: " + model.coefficients.BallDistance);
console.log("model rSquared: " + model.rSquared);
const predictedProb = [];
for (let i=0; i<allResults.Probability.length; i++) {
  const x = allResults.BallDistance[i];
  const prob = model.intercept + model.coefficients.BallDistance * x;
  predictedProb.push(prob);
}
const newResults = {};
newResults.Probability = allResults.Probability;
newResults.PredictedProbability = predictedProb;
await SubmitData('linearModelResult', newResults);
await PlotData('linearModelResult', 'Scatter', 'PredictedProbability', 'Probability');
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.LINEAR_REGRESSION_MODEL
};

gameLessonScenarioData.push(lessonObj);



// lesson 25
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // read data from indexeddb and train linear regression model and plot result
  ScenarioName: `Logistic Regression Model - Part I`,
  lessonName: `LogisticRegressionModelPartI`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
//move all balls into pocket
ResetTable(true);
//place ball 0/2/3/4/6/7
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();`,
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.LOGISTIC_REGRESSION_MODEL
};

gameLessonScenarioData.push(lessonObj);



// lesson 26
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // read data from indexeddb and train linear regression model and plot result
  ScenarioName: `Logistic Regression Model - Part II`,
  lessonName: `LogisticRegressionModelPartII`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
//move all balls into pocket
ResetTable(true);
//place ball 0/2/3/4/6/7
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();`,
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.LOGISTIC_REGRESSION_MODEL
};

gameLessonScenarioData.push(lessonObj);




// lesson 27
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // for call shot, if more than one choice have success probability above threshold of 70%, then
  // compare success probability of next shot according to model prediction using the cue ball's end position
  ScenarioName: `Choosing Shot With Better Cue Ball End Position`,
  lessonName: `ChoosingShotWithBetterCueBallEndPosition`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
//move all balls into pocket
ResetTable(true);
//place ball 0/2/3/4/6/7
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();`,
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.MORE_ADVANCED_TACTICS
};

gameLessonScenarioData.push(lessonObj);




// lesson 28
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // for call shot, if more than one choice have success probability above threshold of 70%, then
  // compare success probability of next shot according to model prediction using the cue ball's end position
  ScenarioName: `Adjust Strength/Spin to Improve Cue Ball Position for Next Shot`,
  lessonName: `AdjustStrengthSpintoImproveCueBallPositionforNextShot`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
//move all balls into pocket
ResetTable(true);
//place ball 0/2/3/4/6/7
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();`,
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.MORE_ADVANCED_TACTICS
};

gameLessonScenarioData.push(lessonObj);




// lesson 29
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // for call shot, if I don't have any good hope of pocketing, then adjust Strength/Spin to Minimize Success Probability for Opponent
  ScenarioName: `Snooker Opponent If No Good Shot For Me`,
  lessonName: `SnookerOpponentIfNoGoodShotForMe`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
//move all balls into pocket
ResetTable(true);
//place ball 0/2/3/4/6/7
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.MORE_ADVANCED_TACTICS
};

gameLessonScenarioData.push(lessonObj);




// lesson 30
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'advanced',
  // determine which color to choose based on scoring each ball's position using # of pockets blocked from it, and distance to pockets not blocked.
  ScenarioName: `Choosing Color When Table is Open`,
  lessonName: `ChoosingColorWhenTableisOpen`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
//move all balls into pocket
ResetTable(true);
//place ball 0/2/3/4/6/7
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();`,
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.ADVANCED.MORE_ADVANCED_TACTICS
};

gameLessonScenarioData.push(lessonObj);





/*

pro account: you get some advanced features, like your name tag is golden. you can use a different stick?
you can use a different cue ball or table if anyone is playing with you. ??



tutorial level 1: algo refine for target ball probability: (greedy and heuristics)
1. how to use test code editor and key APIs

ResetTable()
PlaceBallOnTable()
ChooseRedColor()
ChooseYellowColor()
PlaceCueBallFromHand()
TakeCallShot()
TakeBreakShot()

2. improving getCallShot's full grid search by
  a. skip blocked target balls from pocket or ball (using isPathBlocked)
  b. skipping those pockets with >= 90 degrees angles between line cueball to target ball and target ball to pocket
     need to write a new function getLineAngle(point1, point2, point3)


3. avoid pocketing cue ball or black ball
  a. get more info on one run's result: first touche ball and  where balls ends at (including pocket)
try a few searches by changing aim to avoid pocketing cue ball or black ball

4. refine call shot direction and strength to improve probability using local greedy search in each direction

5. in getCueballPlacement, test if cue ball place point is out side cushions or blocked from target ball. also remember target ball and pocket chosen to save time!?

6. reflection shot using search

Machine learning:
1. collect statistics by repeating break shot
2. collect data for shot
3. run linear regression model for probability and store coefficients on server


improve cue ball movement

1. load coefficients, try different strength and direction, and in each result, look for highest probability, and
   use strength with highest next probability target
   independent variables: angle, distance cue to target ball, distance target to pocket, corner or middle pockets, strength level
2. choosing color: evaluate each ball on table's avg probability of pocketing given
   a. cue ball from random sample of say 9 location from each quarter of table
   b. target pocket is blocked or not, and if so, 0 points!



7. stopping with back spin for near straight shot

4. refine strength
6. back spin
7. side spin
8.
9. snooker
10. first touch my ball and rebound to touch my ball
12. special test cases
  a. single black ball ending
  b. black with one opponent ball
  c. black with 2 opponent balls

machine learning:

https://www.kdnuggets.com/2016/08/10-algorithms-machine-learning-engineers.html
https://towardsdatascience.com/a-tour-of-the-top-10-algorithms-for-machine-learning-newbies-dde4edffae11
https://medium.com/technology-nineleaps/popular-machine-learning-algorithms-a574e3835ebb
https://www.quora.com/What-are-the-top-10-data-mining-or-machine-learning-algorithms-In-2006-the-IEEE-Conference-on-Data-Mining-identified-the-10-top-algorithms-Are-these-still-valid
http://abhijitannaldas.com/kmeans-vs-knn-in-machine-learning.html

1. repeat break shot and collect statistics -> lesson5.html under PathPool using WaitForAllBallStop
1.5 Naive Bayes Classification: classify each ball as good or bad!! ??
https://www.quora.com/What-is-the-difference-between-logistic-regression-and-Naive-Bayes


2. repeat call shot and build logit model on probability
3. using #2, search 3 steps further in tree
4. game theory: if I'm behind a lot, need to take more risk!
5. learn if opponent is human or robot
6. choose color


*/






const gameLessonScenarioDataOld = [
  {
    _id: '683b53e2e9026608852dd03c',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'Pick Up Ball and Shoot!',
    ScenarioSequenceNumber: 1,
    SetupScript: 'ClearWorld();\r\nMoveCar("C0", 0, 15, 180);\r\nMoveCar("C1", 0, -130, 0);\r\nPlaceBall("red", "B0", 0, 0);\r\nstartRobot();',
    Difficulty: 2,
    locked: true,
    gameId: 'z7Zw82CrjYW2ZJWZZ',
    gameName: 'DodgeBall',
  },
  {
    _id: '683b53e2e9026608852dd03d',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'A Simple State Machine',
    ScenarioSequenceNumber: 2,
    SetupScript: 'ClearWorld();\r\nMoveCar("C0", 0, 30, 180);\r\nMoveCar("C1", 200, -200, 0);\r\nstartRobot();',
    Difficulty: 3,
    locked: true,
    gameId: 'z7Zw82CrjYW2ZJWZZ',
    gameName: 'DodgeBall',
  },
  {
    _id: '683b53e2e9026608852dd03e',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'Detecting Obstacles Using Camera Image',
    ScenarioSequenceNumber: 3,
    SetupScript: 'ClearWorld();\r\nMoveCar("C0", 0, 20, 180);\r\nMoveCar("C1", 0, -130, 0);\r\nAddSilo(11,-60, -70, 30);\r\nAddSilo(12, 50, -140, 20);\r\nstartRobot();',
    Difficulty: 3,
    locked: true,
    gameId: 'z7Zw82CrjYW2ZJWZZ',
    gameName: 'DodgeBall',
  },
  // {
  //   _id: '683b53e2e9026608852dd03f',
  //   userId: 'system',
  //   visibleUserIds: [],
  //   package: 'starter',
  //   ScenarioName: 'Turn Around Obstacles',
  //   ScenarioSequenceNumber: 4,
  //   SetupScript: 'ClearWorld();\r\nMoveCar("C0", 0, 70, 180);\r\nMoveCar("C1", -250, -250, 0);\r\nAddSilo(10,-50, 0, 40);\r\nAddSilo(11,70, 0, 60);\r\nAddSilo(12, 0, -100, 30);\r\nPlaceBall("red", "B0", 30, -83);\r\nPlaceBall("red", "B1", 33, -78);\r\nPlaceBall("red", "B2", 36, -73);\r\n PlaceBall("red", "B3", 39, -68);\r\n PlaceBall("red", "B4", 42, -63);\r\nPlaceBall("red", "B5", 45, -58);\r\nstartRobot();',
  //   Difficulty: 2,
  //   locked: true,
  //   gameId: 'z7Zw82CrjYW2ZJWZZ',
  //   gameName: 'DodgeBall',
  // },
  {
    _id: '683b53e2e9026608852dd03g',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'Seeking Balls to Pick Up',
    ScenarioSequenceNumber: 4,
    SetupScript: 'ClearWorld();\r\nMoveCar("C0", 0, 80, 180);\r\nMoveCar("C1", -250, 250, 0);\r\nAddSilo(10,-120, -80, 40);\r\nAddSilo(11,80, 0, 60);\r\nPlaceBall("red", "B0", -10, 23);\r\nstartRobot();',
    Difficulty: 3,
    locked: true,
    gameId: 'z7Zw82CrjYW2ZJWZZ',
    gameName: 'DodgeBall',
  },
  {
    _id: '783d53e2e9026608852dd03h',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'Seeking Opponent to Shoot',
    ScenarioSequenceNumber: 5,
    SetupScript: 'ClearWorld();\r\nMoveCar("C0", 0, 40, 180);\r\nMoveCar("C1", -10, -80, 0);\r\nPlaceBall("red", "B0", 5, 20);\r\nstartRobot();',
    Difficulty: 4,
    locked: true,
    gameId: 'z7Zw82CrjYW2ZJWZZ',
    gameName: 'DodgeBall',
  },
  {
    _id: '583b53e2e9026608852dd03c',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'The Break Shot',
    ScenarioSequenceNumber: 1,
    SetupScript: 'ResetTable(false); \r\nTakeBreakShot();',
    Difficulty: 1,
    locked: true,
    gameId: poolGameId,
    gameName: 'PathPool',
    hideReleaseButton: true
  },
  {
    _id: 'P2',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'The Call Shot: Down Goes the Black Ball',
    ScenarioSequenceNumber: 2,
    SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -90);\r\nPlaceBallOnTable(1, 0, 100 + Math.floor(Math.random()*150)); \r\nTakeCallShot();',
    Difficulty: 2,
    locked: true,
    gameId: poolGameId,
    gameName: 'PathPool',
    hideReleaseButton: true
  },
  // {
  //   _id: '583b53e2e9026608852dd03e',
  //   userId: 'system',
  //   visibleUserIds: [],
  //   package: 'starter',
  //   ScenarioName: 'The Call Shot: Calculate Aiming Position Using Vector Operation',
  //   ScenarioSequenceNumber: 3,
  //   SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -90);\r\nPlaceBallOnTable(1, -100+Math.floor(Math.random()*110), Math.floor(Math.random()*200)); \r\nTakeCallShot();',
  //   Difficulty: 3,
  //   locked: true,
  //   gameId: poolGameId,
  //   gameName: 'PathPool',
  //   hideReleaseButton: true
  // },
  {
    _id: 'P3',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'The Call Shot: Search for Optimal Target Ball/Pocket',
    ScenarioSequenceNumber: 3,
    //SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0.25, 0.2);\r\nPlaceBallOnTable(2, 0.15, -0.3); \r\nPlaceBallOnTable(3, -0.25, -0.1); \r\nPlaceBallOnTable(6, 0.4, -0.35); \r\nChooseRedColor(); \r\nTakeCallShot();\r\n',
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 50, -50);\r\nPlaceBallOnTable(6, 330, 130); \r\nChooseRedColor(); \r\nTakeCallShot();\r\n',
    Difficulty: 3,
    locked: true,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P4',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'Placing Cue Ball by Hand',
    ScenarioSequenceNumber: 4,
    // SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    //SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0, 0); \r\nPlaceBallOnTable(2, -150, 250); \r\nPlaceBallOnTable(3, -500, 200); \r\nPlaceBallOnTable(4, -400, 260); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand(); \r\n',
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0, 0); \r\nPlaceBallOnTable(2, -150, 250); \r\nPlaceBallOnTable(3, -500, 200); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand(); \r\n',
    Difficulty: 3,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P5',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: 'Optimizing Your Break Shot',
    ScenarioSequenceNumber: 5,
    SetupScript: 'ResetTable();\r\nTakeBreakShot();',
    Difficulty: 3,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P6',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: 'Making a Rebound Shot',
    ScenarioSequenceNumber: 6,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 390, -130);\r\nPlaceBallOnTable(1, 520, -200);\r\nPlaceBallOnTable(2, 370, -245);\r\nPlaceBallOnTable(3, -540, -32);\r\nSetCandidateBalls([2]);\r\nChooseRedColor();\r\nTakeCallShot();',
    Difficulty: 3,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P7',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: 'A Model for Shot Success Probability',
    ScenarioSequenceNumber: 7,
    SetupScript: 'ResetTable(true);\r\nSetCandidateBalls([2]);\r\n\r\nlet cueballx = 100;\r\nlet cuebally = 200;\r\nlet targetx = 0;\r\nlet targety = 0;\r\nPlaceBallOnTable(0, cueballx, cuebally);\r\nPlaceBallOnTable(2, targetx, targety);\r\n\r\nlet prob = GetCallShotProbability();',
    Difficulty: 4,
    gameId: poolGameId,
    gameName: 'PathPool',
  },

  {
    _id: 'P8',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: 'Choosing Your Color Suite at Open Table',
    ScenarioSequenceNumber: 8,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    Difficulty: 2,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P9',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: 'Positioning Cue Ball for The Next Shot',
    ScenarioSequenceNumber: 9,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    Difficulty: 2,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P10',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: 'Snookering The Opponent',
    ScenarioSequenceNumber: 10,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    Difficulty: 2,
    gameId: poolGameId,
    gameName: 'PathPool',
  },
  {
    _id: 'P11',
    userId: 'system',
    visibleUserIds: [],
    package: 'advanced',
    ScenarioName: '[Machine Learning] K-Nearest Neighbor Model for Position Score',
    ScenarioSequenceNumber: 11,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    Difficulty: 2,
    gameId: poolGameId,
    gameName: 'PathPool',
  }

];






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
        for (var i=0; i<allhtmllines.length; i++) {
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
    doc._id = `P${id ++}`;
    // console.log("inserting newdoc " + doc._id + " " + doc.ScenarioSequenceNumber);
    const readonlyLineNumbers = [];
    if (doc.applyBaselineCode) {
      const p = doc.baselineCode.split("\n");
      let newBaseline = "";
      for (let i=0; i<p.length; i++) {
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
