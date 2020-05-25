/**
 * additional lessons for pool game?
 * 
 * improve cue ball placement: outside cushion, plan for next shot
 * choosing side on start of game
 * indirect shot: aiming at another ball
 * planning for the next 2 shots
 * 
 * 
 */
import { Games, Scenarios, UserChat, UserCodeTesting } from '../../../lib/collections';
import { LEVELS, OPPONENTS, TUTORIAL_GROUP, MIGRATION_CONST } from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;
const htmlparser = require('htmlparser2');
const fs = require('fs');




var gameLessonScenarioData = [];
var lessonNumber = 1;


// lesson 1
var lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 500,
  concepts: 'Coordinates, Function, Object',  
  studyTime: "20 to 30 minutes",
  ScenarioName: '[1] A Simple Break Shot',
  lessonName: 'ASimpleBreakShot',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(false); \r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
lessonObj.baselineCode =
`
// define a new function called "getBreakShot"
function getBreakShot() {
  // return a shot command to shoot at point (0, 0)
  return { aimx: 0, aimy: 0 }; 
// mark the end of the function "getBreakShot"
}
`;
gameLessonScenarioData.push(lessonObj);


// lesson 2
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: '[2] A Silly Call Shot',
  lessonName: 'ARandomCallShot',
  coins: 500,
  concepts: 'Function/Object revisited, Random Number',
  studyTime: "15 to 25 minutes",
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
  ScenarioName: `[3] Releasing Your First Bot`,
  lessonName: `ManageYourRobotReleases`,
  coins: 200,
  concepts: 'Release Versions',
  studyTime: "5 to 10 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 1,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false, // will read from lesson 2's code, or read from old robot code table
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
gameLessonScenarioData.push(lessonObj);



// lesson 4
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: '[4] Down Goes The Black Ball',
  lessonName: 'DownGoesTheBlackBall',
  coins: 500,
  concepts: 'Random Number revisited, Array',
  studyTime: "20 to 30 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -80);\r\nPlaceBallOnTable(1, 0, 50 + Math.floor(Math.random()*350)); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
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
  ScenarioName: '[5] Aim Position Calculation Helper',
  lessonName: 'AimPositionCalculationHelper',
  coins: 500,
  concepts: 'Function and Array revisited, variables (const vs let)',
  studyTime: "20 to 30 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nPlaceBallOnTable(6, 330, 130); \r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
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
  ScenarioName: '[6] Shot Success Probability',
  lessonName: 'ShotSuccessProbability',
  coins: 1000,
  concepts: 'Async/Await, Probability, Conditional',
  studyTime: "25 to 35 minutes",
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
  // calculate command for shooting ball 3 to pocket 0
  const aimPoint0 = getAimPosition(Balls[3], Pockets[0]);
  const cmd0 = {
    aimx: aimPoint0.x, aimy: aimPoint0.y, strength: 30,
    targetBallID: 3, targetPocketID: 0
  };

  // add a command for shooting ball 3 to pocket 1

  // add code to calculate success probability for each command

  
  // always return cmd0 for now
  return cmd0;
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

// const aimPoint1 = getAimPosition(Balls[3], Pockets[1]);
// const cmd1 = {
//   aimx: aimPoint1.x, aimy: aimPoint1.y, strength: 30,
//   targetBallID: 3, targetPocketID: 1
// };

// // calculate success probability for cmd0 and cmd1
// const prob0 = await calculateProbability(cmd0);
// const prob1 = ? ;





// lesson 7
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: '[7] Walking Through Multiple Pockets',
  lessonName: 'WalkingThroughMultiplePockets',
  coins: 600,
  concepts: 'Simple Search Algorithm',
  studyTime: "15 to 25 minutes",
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
  // calculate shot command for shooting ball 3 into pocket 0
  const aimPoint0 = getAimPosition(Balls[3], Pockets[0]);
  const cmd0 = {
    aimx: aimPoint0.x, aimy: aimPoint0.y, strength: 30,
    targetBallID: 3, targetPocketID: 0
  };

  // calculate shot command for shooting ball 3 into pocket 1
  const aimPoint1 = getAimPosition(Balls[3], Pockets[1]);
  const cmd1 = {
    aimx: aimPoint1.x, aimy: aimPoint1.y, strength: 30,
    targetBallID: 3, targetPocketID: 1
  };

  // calculate shot command for shooting ball 3 into pocket 2
  const aimPoint2 = getAimPosition(Balls[3], Pockets[2]);
  const cmd2 = {
    aimx: aimPoint2.x, aimy: aimPoint2.y, strength: 30,
    targetBallID: 3, targetPocketID: 2
  };

  // query for success probability for each command
  const prob0 = await calculateProbability(cmd0);
  const prob1 = await calculateProbability(cmd1);
  const prob2 = await calculateProbability(cmd2);

  // search for the command with the highest probability
  let bestCommand = null;
  let highestProb = -1;

  // if cmd0 has higher probability, save it as our best choice
  if (prob0 > highestProb) {
    bestCommand = cmd0;
    // keep track of highest probability seen so far
    highestProb = prob0; 
  }

  // if cmd1 has higher probability, save it as our best choice
  if (prob1 > highestProb) {
    bestCommand = ? ;
    highestProb = ? ;
  }
  
  // if cmd2 has higher probability, save it as our best choice
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
  ScenarioName: '[8] Using A For-Loop to Walk Through All Pockets',
  lessonName: 'UsingForLoop',
  coins: 1000,
  concepts: 'For-loop, Break',
  studyTime: "20 to 30 minutes",
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
  ScenarioName: '[9] For-Loop for All Balls',
  lessonName: "AnotherForLoop",
  coins: 1000,
  concepts: 'iterate through array, for-loop revisited',
  studyTime: "20 to 30 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 600, 380);\r\nPlaceBallOnTable(2, -170, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nPlaceBallOnTable(6, 630, 330);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true, // changed after reset
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
`
async function getCallShot() {
  // place holder for best command and its probability
  let bestCommand = null;
  let highestProb = -1;

  // array of ball IDs that can be legally targeted
  // such as [2, 3, 6]
  const legalBallIDs = world.CandidateBallList[MyID];

  //TODO: complete for-loop to iterate through all legalBallIDs
  for (let k = ? ; ? ; ? ) {
    const ballID = ?;

    for (let pocketID = 0; pocketID <= 5 ; pocketID ++) {
      const aimPoint = getAimPosition(Balls[?], Pockets[pocketID]);
      const cmd = { 
        aimx: aimPoint.x, 
        aimy: aimPoint.y, 
        strength: 30, 
        targetBallID: ?, 
        targetPocketID: pocketID 
      };
      const prob = await calculateProbability(cmd);
      if ( prob > highestProb ) {
        // found a better command: record the command and its probability
        bestCommand = cmd; 
        highestProb = prob;
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
  ScenarioName: `[10] Changing Test Script`,
  lessonName: 'ChangingTestScript',
  coins: 500,
  concepts: 'Test-Driven Development (TDD)',
  studyTime: "15 to 25 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
// clear out all balls first  
ResetTable(true);

// place a few balls on table by specifying ballID, x and y

// only change the x and y parameters in these 2 lines:
PlaceBallOnTable(0, 0, 0); // cue ball
PlaceBallOnTable(3, 0, -150); // ball 3


// please keep code below unchanged

PlaceBallOnTable(2, -270, 180);
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
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL
};

lessonObj.baselineCode =
`
async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = null;
  let highestProb = -1;
  const legalBallIDs = world.CandidateBallList[MyID];

  for (let k = 0; k <= legalBallIDs.length - 1; k = k + 1) {
    const ballID = legalBallIDs[k];

    for (let pocketID = 0; pocketID <= 5; pocketID = pocketID + 1) {
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);
      const cmd = {
        aimx: aimPoint.x, 
        aimy: aimPoint.y, 
        strength: 30,
        targetBallID: ballID, 
        targetPocketID: pocketID
      };
      const prob = await calculateProbability(cmd);

      if (prob > highestProb) {
        bestCommand = cmd;
        highestProb = prob;
      }
    } // end of "pocketID" for-loop 
  } // end of "k" for-loop 
  
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



// lesson 11
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `[11] Placing Cue Ball 'By Hand'`,
  lessonName: "PlacingCueBallByHand",
  coins: 1000,
  concepts: 'revisit Functions/Objects',
  studyTime: "20 to 30 minutes",
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
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL
};
lessonObj.baselineCode =
`
//TODO: add a new function getCueBallPlacement
function ? {
  return ?;
}

async function getCallShot() { 
  // place holder for best command and highest probability 
  let bestCommand = null; 
  let highestProb = -1; 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  
  for (let k = 0; k <= legalBallIDs.length - 1; k = k + 1) { 
    const ballID = legalBallIDs[k]; 
  
    for (let pocketID = 0; pocketID <= 5; pocketID = pocketID + 1) { 
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]); 
      const cmd = {  
        aimx: aimPoint.x,  
        aimy: aimPoint.y,  
        strength: 30,  
        targetBallID: ballID,  
        targetPocketID: pocketID  
      }; 
      const prob = await calculateProbability(cmd); 
  
      if (prob > highestProb) { 
        bestCommand = cmd; 
        highestProb = prob; 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
  
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




// lesson 12
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `[12] Optimizing Cue Ball Placement`,
  lessonName: "AvoidingBlockedPockets",
  coins: 1000,
  concepts: 'revisit For-loops, Path Blockage',
  studyTime: "25 to 35 minutes",
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

async function getCallShot() { 
  // place holder for best command and highest probability 
  let bestCommand = null; 
  let highestProb = -1; 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  
  for (let k = 0; k <= legalBallIDs.length - 1; k = k + 1) { 
    const ballID = legalBallIDs[k]; 
  
    for (let pocketID = 0; pocketID <= 5; pocketID = pocketID + 1) { 
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]); 
      const cmd = {  
        aimx: aimPoint.x,  
        aimy: aimPoint.y,  
        strength: 30,  
        targetBallID: ballID,  
        targetPocketID: pocketID  
      }; 
      const prob = await calculateProbability(cmd); 
  
      if (prob > highestProb) { 
        bestCommand = cmd; 
        highestProb = prob; 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
  
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



// new lesson 13
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'End State, Repeated Simulation, Logging to Console',
  studyTime: "60 to 90 minutes",
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `[13] Repeated Simulation for The Break Shot`,
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
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

lessonObj.baselineCode = 
`
function getCueBallPlacement() {
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k++) {
    const ballID = legalBallIDs[k];
    const ballPos = Balls[ballID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {
      const pocketPos = Pockets[pocketID];
      const isBlocked = isPathBlocked(ballPos, pocketPos);
      if (!isBlocked) {
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);
      }
    } // end of for loop "pocketID"
  } // end of for loop "k"
}

async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = null;
  let highestProb = -1;
  const legalBallIDs = world.CandidateBallList[MyID];

  for (let k = 0; k <= legalBallIDs.length - 1; k = k + 1) {
    const ballID = legalBallIDs[k];

    for (let pocketID = 0; pocketID <= 5; pocketID = pocketID + 1) {
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);
      const cmd = {
        aimx: aimPoint.x,
        aimy: aimPoint.y,
        strength: 30,
        targetBallID: ballID,
        targetPocketID: pocketID
      };
      const prob = await calculateProbability(cmd);

      if (prob > highestProb) {
        bestCommand = cmd;
        highestProb = prob;
      }
    } // end of for loop "pocketID"
  } // end of for loop "k"
  
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


// new lesson 14
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  coins: 1000,
  concepts: 'Search for the optimal solution',
  studyTime: "60 to 90 minutes",
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `[14] Optimizing Cue Ball End Position`,
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
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};

lessonObj.baselineCode =
`
function getCueBallPlacement() { 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k++) { 
    const ballID = legalBallIDs[k]; 
    const ballPos = Balls[ballID]; 
    for (let pocketID = 0; pocketID <= 5; pocketID++) { 
      const pocketPos = Pockets[pocketID]; 
      const isBlocked = isPathBlocked(ballPos, pocketPos); 
      if (!isBlocked) { 
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter); 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
} 

async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = null;
  let highestProb = -1;
  const legalBallIDs = world.CandidateBallList[MyID];

  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];
    
    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) {
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      // iterate through strength values of 20/40/60/80 and get end states

      // Step 1: add for loop on strength value s
      for (let s = ?; s ?; s = ?) {
        
        // Step 2: update the strength value on cmd
        const cmd = {strength: ?, aimx: aimPoint.x, aimy: aimPoint.y, targetBallID: ballID, targetPocketID: pocketID };

        const endStates = await calculateEndState(cmd, false);

        // Step 3: get cue ball position
        const cueballPosition = ?;

        const prob = await calculateProbability(cmd);
        if (prob > highestProb) {
          bestCommand = cmd; 
          highestProb = prob;
        }
      } // end of for loop "s"
    } // end of for loop "pocketID"
  } // end of for loop "k"

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
  studyTime: "60 to 90 minutes",
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `[15] Play Safety When There is No Good Shot`,
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
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT,
};
lessonObj.baselineCode =
`
function getCueBallPlacement() { 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k++) { 
    const ballID = legalBallIDs[k]; 
    const ballPos = Balls[ballID]; 
    for (let pocketID = 0; pocketID <= 5; pocketID++) { 
      const pocketPos = Pockets[pocketID]; 
      const isBlocked = isPathBlocked(ballPos, pocketPos); 
      if (!isBlocked) { 
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter); 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
} 

async function getCallShot() {
  // place holder for best command and its probability
  let bestCommand = { prob: -1 };
  const tableCenter = { x: 0, y: 0 };
  const legalBallIDs = world.CandidateBallList[MyID];

  for (let k = 0; k <= legalBallIDs.length - 1; k = k + 1) {
    const ballID = legalBallIDs[k];
    for (let pocketID = 0; pocketID <= 5; pocketID = pocketID + 1) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);
      // iterate through strength values of 20/40/60/80
      for (let s = 20; s <= 80; s = s + 20) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID };
        const endStates = await calculateEndState(cmd, false);
        const cueballPosition = endStates[0];
        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          if (cmd.distance < bestCommand.distance) { bestCommand = cmd; }
        } else {
          if (cmd.prob > bestCommand.prob) { bestCommand = cmd; }
        }
      } // end of for loop "s"
    } // end of for loop "pocketID"
  } // end of for loop "k"

  // new code starts here

  // make a soft shot when we don't have a good chance
  // if there is less than 50-50 chance of success
  if (bestCommand.prob ? 50) {
    bestCommand.? = ?;
  }
  // new code ends here

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


// new lesson 16
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `[16] Speed Up Search for Best Call Shots`, // using isPathBlocked
  lessonName: `SpeedUpSearchOfBestCallShots`,
  coins: 1000,
  concepts: 'avoid unnecessary work, continue in a loop, cut angle',
  studyTime: "60 to 90 minutes",
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
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES,
};

lessonObj.baselineCode =
`
function getCueBallPlacement() { 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k++) { 
    const ballID = legalBallIDs[k]; 
    const ballPos = Balls[ballID]; 
    for (let pocketID = 0; pocketID <= 5; pocketID++) { 
      const pocketPos = Pockets[pocketID]; 
      const isBlocked = isPathBlocked(ballPos, pocketPos); 
      if (!isBlocked) { 
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter); 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
} 

async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = {
    prob: -1
  };

  // new constant representing table center
  const tableCenter = {
    x: 0, 
    y: 0
  };
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];

    // new code: skip this ball if blocked from cue ball
    
    const isBlocked = ? ;
    if (isBlocked) {
      ? ;
    }
    // new code ends here

    for (let pocketID = 0; pocketID <= 5; pocketID = pocketID + 1) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      // iterate through strength values of 20/40/60/80
      for (let s = 20; s <= 80; s = s + 20) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, 
          targetBallID: ballID, targetPocketID: pocketID };

        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];
        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        // new method to update best command 
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          if (cmd.distance < bestCommand.distance) { bestCommand = cmd; }
        } else {
          if (cmd.prob > bestCommand.prob) { bestCommand = cmd; }
        }
      } // end of for loop "s"
    } // end of for loop "pocketID"
  } // end of for loop "k"

  if (bestCommand.prob < 50) {
    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s = 2; s < 40; s = s + 1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    } // end of for loop "s"
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




// new lesson 17
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `[17] Kick Shots To The Rescue`,
  lessonName: `PowerfulBankShots`,
  coins: 1200,
  concepts: 'Mirror point calculation, searching revisited',
  studyTime: "60 to 90 minutes",
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
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES,
};

lessonObj.baselineCode =
`
function getCueBallPlacement() { 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k++) { 
    const ballID = legalBallIDs[k]; 
    const ballPos = Balls[ballID]; 
    for (let pocketID = 0; pocketID <= 5; pocketID++) { 
      const pocketPos = Pockets[pocketID]; 
      const isBlocked = isPathBlocked(ballPos, pocketPos); 
      if (!isBlocked) { 
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter); 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
} 

async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = {prob: -1};

  const tableCenter = {x: 0, y: 0};
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) continue;

    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) continue ;

      // iterate through strength values of 20/40/60/80
      for (let s = 20; s <= 80; s = s + 20) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID };
        
        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        // new method to update best command 
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          // both commands are good enough for probability, 
          // so compare their cue ball end position
          if (cmd.distance < bestCommand.distance) {
              bestCommand = cmd; 
          }
        } else {
          // simply choose the one with higher probability
          if (cmd.prob > bestCommand.prob) {
              bestCommand = cmd; 
          }
        }
      }
    }
  } // end of for-loop for "k"

  //TODO: try to hit ball 2 with a rebound when there is no direct shot

  // new code starts here

  // Step 1: do not enter the safety shot logic when no good shot is found
  if (? && bestCommand.prob < 50) {
    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s=2; s<40; s=s+1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    }
  } else if (bestCommand.prob == -1) {
    // Step 2: no direct shot available, return a manually picked aiming point for now
    bestCommand = {aimx: ?, aimy: ?, strength: 45};
  }

  // new code ends here

  // return the best command we have found
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

// new lesson 18
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `[18] Customized Logic for Pre-defined Scenarios`,
  lessonName: `SpecialLogicForPredefinedSituations`,
  coins: 1500,
  concepts: 'Adding new branch to bot logic',
  studyTime: "60 to 90 minutes",
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
  Difficulty: 5,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES,
};
lessonObj.baselineCode =
`
function getCueBallPlacement() { 
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k++) { 
    const ballID = legalBallIDs[k]; 
    const ballPos = Balls[ballID]; 
    for (let pocketID = 0; pocketID <= 5; pocketID++) { 
      const pocketPos = Pockets[pocketID]; 
      const isBlocked = isPathBlocked(ballPos, pocketPos); 
      if (!isBlocked) { 
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter); 
      } 
    } // end of for loop "pocketID" 
  } // end of for loop "k" 
} 

function matchScenario(scenario) {

  // first check number of balls left on table
  let countOfBallsOnTable = 0;
  for (let ballID=0; ballID < Balls.length; ballID ++) {
    const b = Balls[ballID];
    if (b.inPocket) continue;
    // add 1 to counter for balls left on table
    countOfBallsOnTable ++;
  }

  // if the number of balls is not equal to number of regions in the scenario, no match
  if (countOfBallsOnTable != scenario.length) return [];


  // keep track of ball ID of each ball matching with a region
  let matchedBallIDs = [];

  // go through each region in the scenario array 
  for (let k=0; k < scenario.length; k++) {
    const r = scenario[k];
    
    // try to find a matching ball for this region
    let found = false;

    // go through all balls 
    for (let ballID=0; ballID < Balls.length; ballID ++) {
      const b = Balls[ballID];
      // ignore a ball if it is already pocketed
      if (b.inPocket) continue;

      // check ball color and coordinate against region definition
      if (b.colorType != r.colorType) continue;
      if (Math.abs(b.x - r.x) > r.width/2) continue;
      if (Math.abs(b.y - r.y) > r.height/2) continue;

      // this ball falls in the region
      found = true;

      // record the ballID matching this region
      matchedBallIDs.push(ballID);

      // no need to search for a matching region for this ball any more
      break;
    }

    // if any region doesn't have a matching ball, then not a match for the scenario
    if (!found) return [];
  }

  // we have a match, and here are the ballIDs for each region
  return matchedBallIDs;
}

function checkEndGame1() {

  const scenario = [
    {colorType: Pool.WHITE, x: -800, y: -300, width: 200, height: 150},
    {colorType: Pool.BLACK, x: ?, y: ?, width: ?, height: ?},
    {colorType: OpponentColorType, x: 125, y: 150, width: 400, height: 200},
  ];
  
  const matchedBallIDs = matchScenario(scenario);
  if (?) {
    return null;
  }
  // there is a match! Simply aim at table center for now. We'll improve it later.
  return {aimx: 0, aimy: 0, strength: 50};
}

async function getCallShot() {

  // check if we should use the special handler
  const specialCmd1 = checkEndGame1();
  // if specialCmd1 is not null, simply return it to the game engine
  if (specialCmd1) return specialCmd1;  
      
  // place holder for best command and highest probability
  let bestCommand = {prob: -1};

  // new constant representing table center
  const tableCenter = {x: 0, y: 0};
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) continue;

    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) continue ;

      // iterate through strength values of 20/40/60/80
      for (let s = 20; s <= 80; s = s + 20) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID };
        
        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        // new method to update best command 
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          // both commands are good enough for probability, 
          // so compare their cue ball end position
          if (cmd.distance < bestCommand.distance) {
              bestCommand = cmd; 
          }
        } else {
          // simply choose the one with higher probability
          if (cmd.prob > bestCommand.prob) {
              bestCommand = cmd; 
          }
        }
      }
    }
  }

  // new behavior when we don't have a good shot
  if (bestCommand.prob >= 0 && bestCommand.prob < 50) {
    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s=2; s<40; s=s+1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    }
  } else if (bestCommand.prob == -1) {
    // search for best kick shot command with highest success probability

    // setup the bestCommand as negative probability so it will be reassigned later
    bestCommand = {prob: -1};
    
    // iterate through all legal ball IDs
    for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
      const ballID = legalBallIDs[k];

      // iterate through all bottom pockets
      for (let pocketID = 3; pocketID <= 5 ; pocketID = pocketID + 1 ) {
        const contactPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);   
        const mirrorPoint = {x: contactPoint.x, y: 2 * Boundaries.TOP_Y - contactPoint.y};

        // search for the optimal adjustment amount 
        let direction = 1;
        if (Balls[ballID].x > Balls[0].x) {
          direction = -1;
        }
        
        for (let adjustX = 0; adjustX < 50; adjustX = adjustX + 1) { 
          const cmd = {aimx: mirrorPoint.x + adjustX * direction, aimy: mirrorPoint.y, strength: 45, targetBallID: ballID, targetPocketID: pocketID};    
          cmd.prob = await calculateProbability(cmd); 
          console.log("ball " + ballID + " pocket " + pocketID + " adjustX " + (adjustX * direction) + ": prob " + cmd.prob); 
          if (cmd.prob > bestCommand.prob) { 
            console.log("new best!");
            bestCommand = cmd; 
          } 
        }   
      }
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



// new lesson 19
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `[19] Optimizing Cue Ball End Position Using Cut Angle`,
  lessonName: `OptimizeEndPositionWithCutAngle`,
  coins: 1500,
  concepts: 'Practice searching for optimal solution',
  studyTime: "30 to 40 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 888, -213);
PlaceBallOnTable(1, 339, -413);
PlaceBallOnTable(2, 899, -368);
PlaceBallOnTable(3, -933, -88); 

// take first shot
await UpdateWorld();
ChooseRedColor(); 
TakeCallShot();

// take second shot
await WaitForAllBallStop();
await UpdateWorld();
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();

`,
  Difficulty: 5,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.EXAMPLES_FOR_OPEN,
};
lessonObj.baselineCode =
`
function getCueBallPlacement() {
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k ++) {
    const ballID = legalBallIDs[k];
    const ballPos = Balls[ballID];
    for (let pocketID=0; pocketID <= 5; pocketID ++) {
      const pocketPos = Pockets[pocketID];
      const isBlocked = isPathBlocked(ballPos, pocketPos);
      if ( !isBlocked ) {
          return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);  
      }
    }
  }
}


/*
Purpose: 
  To check if the current ball placement on table matches 
  with the given scenario description.

Return value: 
  - empty list "[]" if not matching 
  - an array of ball IDs corresponding to each region
*/

function matchScenario(scenario) {

  // first check number of balls left on table
  let countOfBallsOnTable = 0;
  for (let ballID=0; ballID < Balls.length; ballID ++) {
    const b = Balls[ballID];
    if (b.inPocket) continue;
    // add 1 to counter for balls left on table
    countOfBallsOnTable ++;
  }

  // if the number of balls is not equal to number of regions in the scenario, no match
  if (countOfBallsOnTable != scenario.length) return [];

  // keep track of ball ID of each ball matching with a region
  let matchedBallIDs = [];

  // go through each region in the scenario array 
  for (let k=0; k < scenario.length; k++) {
    const r = scenario[k];
    
    // try to find a matching ball for this region
    let found = false;

    // go through all balls 
    for (let ballID=0; ballID < Balls.length; ballID ++) {
      const b = Balls[ballID];
      // ignore a ball if it is already pocketed
      if (b.inPocket) continue;

      // check ball color and coordinate against region definition
      if (b.colorType != r.colorType) continue;
      if (Math.abs(b.x - r.x) > r.width/2) continue;
      if (Math.abs(b.y - r.y) > r.height/2) continue;

      // this ball has found a matching region
      found = true;

      // record the ballID matching this region
      matchedBallIDs.push(ballID);

      // no need to search any more
      break;
    }

    // if a region doesn't have a matching ball, then not a match
    if (!found) return [];
  }

  // we have a match, and here are the ballIDs for each region
  return matchedBallIDs;
}

async function checkEndGame1() {
  const scenario = [
    {colorType: Pool.WHITE, x: -800, y: -300, width: 200, height: 150},
    {colorType: Pool.BLACK, x: 680, y: 0, width: 200, height: 200},
    {colorType: OpponentColorType, x: 125, y: 150, width: 400, height: 200},
  ];
  
  const matchedBallIDs = matchScenario(scenario);
  if (matchedBallIDs.length == 0) return null;
  
  const targetPoint = extrapolatePoints(Balls[matchedBallIDs[2]], Balls[1], BallDiameter);
  let bestCommand = {distance: 10000};
  for (let y = (Balls[0].y + Balls[1].y)/2; y < Balls[1].y; y = y + 3) {
    for (let s = 18; s < 29; s ++) {
      console.log("Checking y " + y + " strength " + s);

      // calculate cue ball end position given the current aim point and strength
    	const cmd = {aimx: Boundaries.RIGHT_X - BallDiameter/2, aimy: y, strength: s};
      const endStates = await calculateEndState(cmd);
      cmd.distance = dist2(endStates[0], targetPoint);

      // check movement of black ball 
      const blackBallMovement = dist2(Balls[1], endStates[1]);

      // if cue ball's end position is closer to optimal point, update bestCommand
      if (cmd.distance < bestCommand.distance && blackBallMovement > 0) {
        console.log("new best " + cmd.distance);
        bestCommand = cmd;
      }
    }
  }
  
  return bestCommand;
}

async function getCallShot() {

  // adopt special handler if there is a match
  const specialCmd1 = await checkEndGame1();
  if (specialCmd1) return specialCmd1;  

  // place holder for best command and highest probability
  let bestCommand = {prob: -1};

  // new constant representing table center
  const tableCenter = {x: 0, y: 0};
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) continue;

    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) continue ;

      // iterate through strength values of 20/40/60/80
      for (let s = 20; s <= 80; s = s + 20) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID };
        
        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        // new method to update best command 
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          // both commands are good enough for probability, 
          // so compare their cue ball end position
          if (cmd.distance < bestCommand.distance) {
              bestCommand = cmd; 
          }
        } else {
          // simply choose the one with higher probability
          if (cmd.prob > bestCommand.prob) {
              bestCommand = cmd; 
          }
        }
      }
    }
  }

  // new behavior when we don't have a good shot
  if (bestCommand.prob >= 0 && bestCommand.prob < 50) {
    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s=2; s<40; s=s+1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    }
  } else if (bestCommand.prob == -1) {
    // search for best kick shot command with highest success probability

    // setup the bestCommand as negative probability so it will be reassigned later
    bestCommand = {prob: -1};
    
    // iterate through all legal ball IDs
    for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
      const ballID = legalBallIDs[k];

      // iterate through all bottom pockets
      for (let pocketID = 3; pocketID <= 5 ; pocketID = pocketID + 1 ) {
        const contactPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);   
        const mirrorPoint = {x: contactPoint.x, y: 2 * Boundaries.TOP_Y - contactPoint.y};

        // search for the optimal adjustment amount 
        let direction = 1;
        if (Balls[ballID].x > Balls[0].x) {
          direction = -1;
        }
        
        for (let adjustX = 0; adjustX < 50; adjustX = adjustX + 1) { 
          const cmd = {aimx: mirrorPoint.x + adjustX * direction, aimy: mirrorPoint.y, strength: 45, targetBallID: ballID, targetPocketID: pocketID};    
          cmd.prob = await calculateProbability(cmd); 
          console.log("ball " + ballID + " pocket " + pocketID + " adjustX " + (adjustX * direction) + ": prob " + cmd.prob); 
          if (cmd.prob > bestCommand.prob) { 
            console.log("new best!");
            bestCommand = cmd; 
          } 
        }   
      }
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







// new lesson 20
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `[20] Breaking Ball Clusters`,
  lessonName: `BreakingBallClusters`,
  coins: 1500,
  concepts: 'Practice searching for ball clusters',
  studyTime: "30 to 40 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);

PlaceBallOnTable(0, -800, 96);
PlaceBallOnTable(1, 839, -413);
PlaceBallOnTable(2, -600, 168);
PlaceBallOnTable(4, 737, 395);
PlaceBallOnTable(5, -824, 425);
PlaceBallOnTable(8, 686, -208);
PlaceBallOnTable(10, -570, 139);
await UpdateWorld();

ChooseRedColor(); 

TakeCallShot();
await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 5,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.EXAMPLES_FOR_OPEN,
};
lessonObj.baselineCode =
`

function getCueBallPlacement() {
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k ++) {
    const ballID = legalBallIDs[k];
    const ballPos = Balls[ballID];
    for (let pocketID=0; pocketID <= 5; pocketID ++) {
      const pocketPos = Pockets[pocketID];
      const isBlocked = isPathBlocked(ballPos, pocketPos);
      if ( !isBlocked ) {
          return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);  
      }
    }
  }
}


/*
Purpose: 
  To check if the current ball placement on table matches 
  with the given scenario description.

Return value: 
  - empty list "[]" if not matching 
  - an array of ball IDs corresponding to each region
*/

function matchScenario(scenario) {

  // first check number of balls left on table
  let countOfBallsOnTable = 0;
  for (let ballID=0; ballID < Balls.length; ballID ++) {
    const b = Balls[ballID];
    if (b.inPocket) continue;
    // add 1 to counter for balls left on table
    countOfBallsOnTable ++;
  }

  // if the number of balls is not equal to number of regions in the scenario, no match
  if (countOfBallsOnTable != scenario.length) return [];

  // keep track of ball ID of each ball matching with a region
  let matchedBallIDs = [];

  // go through each region in the scenario array 
  for (let k=0; k < scenario.length; k++) {
    const r = scenario[k];
    
    // try to find a matching ball for this region
    let found = false;

    // go through all balls 
    for (let ballID=0; ballID < Balls.length; ballID ++) {
      const b = Balls[ballID];
      // ignore a ball if it is already pocketed
      if (b.inPocket) continue;

      // check ball color and coordinate against region definition
      if (b.colorType != r.colorType) continue;
      if (Math.abs(b.x - r.x) > r.width/2) continue;
      if (Math.abs(b.y - r.y) > r.height/2) continue;

      // this ball has found a matching region
      found = true;

      // record the ballID matching this region
      matchedBallIDs.push(ballID);

      // no need to search any more
      break;
    }

    // if a region doesn't have a matching ball, then not a match
    if (!found) return [];
  }

  // we have a match, and here are the ballIDs for each region
  return matchedBallIDs;
}

function checkEndGame1() {
  const scenario = [
    {colorType: Pool.WHITE, x: -800, y: -300, width: 200, height: 150},
    {colorType: Pool.BLACK, x: 680, y: 0, width: 200, height: 200},
    {colorType: OpponentColorType, x: 125, y: 150, width: 400, height: 200},
  ];
  
  const matchedBallIDs = matchScenario(scenario);
  if (matchedBallIDs.length == 0) return null;
  return {aimx: 0, aimy: 0, strength: 50};
}

// given endStates, what's the minimum cut angel for any ball-pocket combination
function getMinCutAngle(endStates) {
  let minAngle = 361;
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k ++) { 
    const ballID = legalBallIDs[k]; 
    const targetBallPos = endStates[ballID]; 
    for (let pocketID=0; pocketID <= 5; pocketID ++) { 
      const cueballPos = endStates[0];
      const pocketPos = Pockets[pocketID]; 
      const aimPoint = getAimPosition(targetBallPos, pocketPos); 
      const angle = Math.abs(getCutAngle(pocketPos, aimPoint, cueballPos));

      if (angle < minAngle) {
        minAngle = angle;
      }
    }
  }
  return minAngle;
}


async function getCallShot() {

  // new logic: if special handler returns a shot command, then use it
  const specialCmd1 = checkEndGame1();
  if (specialCmd1) return specialCmd1;  

  // place holder for best command and highest probability
  let bestCommand = {prob: -1};

  // new constant representing table center
  const tableCenter = {x: 0, y: 0};
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) continue;

    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) continue ;

      // iterate through strength values of 20 to 80 at step of 10
      for (let s = 20; s <= 80; s = s + 10) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID };
        
        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        cmd.minAngle = getMinCutAngle(endStates);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        // new method to update best command 
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          // both commands are good enough for probability, 
          // so compare their cue ball end position
          if (cmd.minAngle < bestCommand.minAngle) {
              bestCommand = cmd; 
          }
        } else {
          // simply choose the one with higher probability
          if (cmd.prob > bestCommand.prob) {
              bestCommand = cmd; 
          }
        }
      }
    }
  }

  // new behavior when we don't have a good shot
  if (bestCommand.prob >= 0 && bestCommand.prob < 50) {
    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s=2; s<40; s=s+1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    }


    // new code added for lesson 20

    // check if end position of cue ball is blocked from all opponent balls
    const endStates = await calculateEndState(bestCommand);
    if (!allOpponentBallsBlocked(endStates)) {
      // return a command to break clusters if any
      const clusterCommand = getCommandForBreakingCluster();
      if (clusterCommand != null) return clusterCommand;
    }
    // end of new code

  } else if (bestCommand.prob == -1) {
    // search for best kick shot command with highest success probability

    // setup the bestCommand as negative probability so it will be reassigned later
    bestCommand = {prob: -1};
    
    // iterate through all legal ball IDs
    for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
      const ballID = legalBallIDs[k];

      // iterate through all bottom pockets
      for (let pocketID = 3; pocketID <= 5 ; pocketID = pocketID + 1 ) {
        const contactPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);   
        const mirrorPoint = {x: contactPoint.x, y: 2 * Boundaries.TOP_Y - contactPoint.y};

        // search for the optimal adjustment amount 
        let direction = 1;
        if (Balls[ballID].x > Balls[0].x) {
          direction = -1;
        }
        
        for (let adjustX = 0; adjustX < 50; adjustX = adjustX + 1) { 
          const cmd = {aimx: mirrorPoint.x + adjustX * direction, aimy: mirrorPoint.y, strength: 45, targetBallID: ballID, targetPocketID: pocketID};    
          cmd.prob = await calculateProbability(cmd); 
          console.log("ball " + ballID + " pocket " + pocketID + " adjustX " + (adjustX * direction) + ": prob " + cmd.prob); 
          if (cmd.prob > bestCommand.prob) { 
            console.log("new best!");
            bestCommand = cmd; 
          } 
        }   
      }
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


// new lesson 21
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'intermediate',
  ScenarioName: `[21] Taking Banks Shots`,
  lessonName: `ImprovingReboundShot`,
  coins: 1500,
  concepts: 'Practice searching for optimal rebound shots',
  studyTime: "30 to 40 minutes",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);

PlaceBallOnTable(0, 339, -156);
PlaceBallOnTable(1, -275, -433);
PlaceBallOnTable(2, 344, 350);
PlaceBallOnTable(3, 337, -340);

ChooseRedColor(); 
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 5,
  locked: true,
  gameId: 'uN9W4QhmdKu94Qi2Y',
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.INTERMEDIATE.EXAMPLES_FOR_OPEN,
};
lessonObj.baselineCode =
`
function getCueBallPlacement() {
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k ++) {
    const ballID = legalBallIDs[k];
    const ballPos = Balls[ballID];
    for (let pocketID=0; pocketID <= 5; pocketID ++) {
      const pocketPos = Pockets[pocketID];
      const isBlocked = isPathBlocked(ballPos, pocketPos);
      if ( !isBlocked ) {
          return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);  
      }
    }
  }
}


/*
Purpose: 
  To check if the current ball placement on table matches 
  with the given scenario description.

Return value: 
  - empty list "[]" if not matching 
  - an array of ball IDs corresponding to each region
*/

function matchScenario(scenario) {

  // first check number of balls left on table
  let countOfBallsOnTable = 0;
  for (let ballID=0; ballID < Balls.length; ballID ++) {
    const b = Balls[ballID];
    if (b.inPocket) continue;
    // add 1 to counter for balls left on table
    countOfBallsOnTable ++;
  }

  // if the number of balls is not equal to number of regions in the scenario, no match
  if (countOfBallsOnTable != scenario.length) return [];

  // keep track of ball ID of each ball matching with a region
  let matchedBallIDs = [];

  // go through each region in the scenario array 
  for (let k=0; k < scenario.length; k++) {
    const r = scenario[k];
    
    // try to find a matching ball for this region
    let found = false;

    // go through all balls 
    for (let ballID=0; ballID < Balls.length; ballID ++) {
      const b = Balls[ballID];
      // ignore a ball if it is already pocketed
      if (b.inPocket) continue;

      // check ball color and coordinate against region definition
      if (b.colorType != r.colorType) continue;
      if (Math.abs(b.x - r.x) > r.width/2) continue;
      if (Math.abs(b.y - r.y) > r.height/2) continue;

      // this ball has found a matching region
      found = true;

      // record the ballID matching this region
      matchedBallIDs.push(ballID);

      // no need to search any more
      break;
    }

    // if a region doesn't have a matching ball, then not a match
    if (!found) return [];
  }

  // we have a match, and here are the ballIDs for each region
  return matchedBallIDs;
}

async function checkEndGame1() {
  const scenario = [
    {colorType: Pool.WHITE, x: -800, y: -300, width: 200, height: 150},
    {colorType: Pool.BLACK, x: 680, y: 0, width: 200, height: 200},
    {colorType: OpponentColorType, x: 125, y: 150, width: 400, height: 200},
  ];
  
  const matchedBallIDs = matchScenario(scenario);
  if (matchedBallIDs.length == 0) return null;
  
  const targetPoint = extrapolatePoints(Balls[matchedBallIDs[2]], Balls[1], BallDiameter);
  let bestCommand = {distance: 10000};
  for (let y = (Balls[0].y + Balls[1].y)/2; y < Balls[1].y; y = y + 3) {
    for (let s = 18; s < 29; s ++) {
      console.log("Checking y " + y + " strength " + s);

      // calculate cue ball end position given the current aim point and strength
      const cmd = {aimx: Boundaries.RIGHT_X - BallDiameter/2, aimy: y, strength: s};
      const endStates = await calculateEndState(cmd);
      cmd.distance = dist2(endStates[0], targetPoint);

      // check movement of black ball 
      const blackBallMovement = dist2(Balls[1], endStates[1]);

      // if cue ball's end position is closer to optimal point, update bestCommand
      if (cmd.distance < bestCommand.distance && blackBallMovement > 0) {
        console.log("new best " + cmd.distance);
        bestCommand = cmd;
      }
    }
  }
  
  return bestCommand;
}

// given endStates, what's the minimum cut angel for any ball-pocket combination
function getMinCutAngle(endStates) {
  let minAngle = 361;
  const legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k = 0; k < legalBallIDs.length; k ++) { 
    const ballID = legalBallIDs[k]; 
    const targetBallPos = endStates[ballID]; 
    for (let pocketID=0; pocketID <= 5; pocketID ++) { 
      const cueballPos = endStates[0];
      const pocketPos = Pockets[pocketID]; 
      const aimPoint = getAimPosition(targetBallPos, pocketPos); 
      const angle = Math.abs(getCutAngle(pocketPos, aimPoint, cueballPos));

      if (angle < minAngle) {
        minAngle = angle;
      }
    }
  }
  return minAngle;
}

function allOpponentBallsBlocked(endStates) {
  const opponentBallIDs = world.CandidateBallList[1 - MyID];
  const cueballPos = endStates[0];
  for (let k = 0; k < opponentBallIDs.length; k++) {
    const ballID = opponentBallIDs[k];
    if (!isPathBlocked(endStates[ballID], cueballPos, endStates)) {
      return false;
    }
  }
  return true;
}

//search for any ball cluster and break it
function getCommandForBreakingCluster() {
  const legalBallIDs = world.CandidateBallList[MyID];
  
  // walk through all legal balls
  for (let k = 0; k < legalBallIDs.length; k++) {
    const ballID = legalBallIDs[k];

    // walk through each ball in the "Balls" array
    for (let ballID2 = 0; ballID2 < Balls.length; ballID2++) {
      // skip ballID2 if it is the same as ballID
      if ( ballID == ballID2 ) continue;

      // skip ballID2 if that ball is in pocket already
      if (Balls[ballID2].inPocket) continue;

      // calculate distance between the 2 balls
      const d = dist2(Balls[ballID], Balls[ballID2]);

      // if the distance is less than 1.5 times of ball diameter
      if ( d < 1.5*BallDiameter ) {
        // found a cluster, so simply shoot at the ball with ballID
        return { aimx: Balls[ballID].x, aimy: Balls[ballID].y };
      }
    }
  }
  // no cluster found, so return null
  return null;
}

async function getCallShot() {

  // adopt special handler if there is a match
  const specialCmd1 = await checkEndGame1();
  if (specialCmd1) return specialCmd1;  

  // place holder for best command and highest probability
  let bestCommand = {prob: -1};

  // new constant representing table center
  const tableCenter = {x: 0, y: 0};
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) continue;

    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) {
      console.log("\\nballID " + ballID + " pocketID " + pocketID);
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) continue ;

      // iterate through strength values of 20/40/60/80
      for (let s = 20; s <= 80; s = s + 20) {
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID };
        
        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        cmd.distance = dist2(tableCenter, cueballPosition);
        cmd.minAngle = getMinCutAngle(endStates);
        console.log("Strength " + s + " prob " + cmd.prob + " cue ball " + cueballPosition.x + " " + cueballPosition.y);
        // new method to update best command 
        if (cmd.prob > 70 && bestCommand.prob > 70) {
          // both commands are good enough for probability, 
          // so compare their cue ball end position
          if (cmd.minAngle < bestCommand.minAngle) {
              bestCommand = cmd; 
          }
        } else {
          // simply choose the one with higher probability
          if (cmd.prob > bestCommand.prob) {
              bestCommand = cmd; 
          }
        }
      }
    }
  }

  // new behavior when we don't have a good shot
  if (bestCommand.prob >= 0 && bestCommand.prob < 50) {

    // new code added to check for bank shot
    if (bestCommand.prob < 20) {
      const bankShotCmd = await getBankShot();
      if (bankShotCmd!=null) {
        return bankShotCmd;
      }
    }


    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s=2; s<40; s=s+1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    }

    // check if end position of cue ball is blocked from all opponent balls
    const endStates = await calculateEndState(bestCommand);
    if (!allOpponentBallsBlocked(endStates)) {
      // return a command to break clusters if any
      const clusterCommand = getCommandForBreakingCluster();
      if (clusterCommand != null) return clusterCommand;

    }

  } else if (bestCommand.prob == -1) {
    // search for best kick shot command with highest success probability

    // setup the bestCommand as negative probability so it will be reassigned later
    bestCommand = {prob: -1};
    
    // iterate through all legal ball IDs
    for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) {
      const ballID = legalBallIDs[k];

      // iterate through all bottom pockets
      for (let pocketID = 3; pocketID <= 5 ; pocketID = pocketID + 1 ) {
        const contactPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);   
        const mirrorPoint = {x: contactPoint.x, y: 2 * Boundaries.TOP_Y - contactPoint.y};

        // search for the optimal adjustment amount 
        let direction = 1;
        if (Balls[ballID].x > Balls[0].x) {
          direction = -1;
        }
        
        for (let adjustX = 0; adjustX < 50; adjustX = adjustX + 1) { 
          const cmd = {aimx: mirrorPoint.x + adjustX * direction, aimy: mirrorPoint.y, strength: 45, targetBallID: ballID, targetPocketID: pocketID};    
          cmd.prob = await calculateProbability(cmd); 
          console.log("ball " + ballID + " pocket " + pocketID + " adjustX " + (adjustX * direction) + ": prob " + cmd.prob); 
          if (cmd.prob > bestCommand.prob) { 
            console.log("new best!");
            bestCommand = cmd; 
          } 
        }   
      }
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









var parseLessonHTML = function (lessonName, gameName) {
  var data = Assets.getText(`TutorialLessons/${gameName}/${lessonName}.html`);

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
              //console.log("add to clean code: " + line);
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


const prepareLessonScenarios = () => {
  Scenarios.remove({gameId: poolGameId});

  let id = 1;
  _.map(gameLessonScenarioData, (doc) => {
        // add elements as parsed from the lesson html to the doc first
    doc.instructionElements = parseLessonHTML(doc.lessonName, doc.gameName);
    // const newdoc = JSON.parse(JSON.stringify(doc));
    doc._id = `P${id ++}`;
    // doc.prevId = 'none';
    // if (id > 2) {
    //   doc.prevId = `P${id-2}`;
    // }
    console.log("inserting newdoc " + doc._id + " " + doc.ScenarioSequenceNumber);
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
  
