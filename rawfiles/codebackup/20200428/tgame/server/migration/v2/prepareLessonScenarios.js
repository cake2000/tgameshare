import { Games, Scenarios, UserChat, UserCodeTesting } from '../../../lib/collections';
import { LEVELS, OPPONENTS, TUTORIAL_GROUP, MIGRATION_CONST } from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;
const htmlparser = require('htmlparser2');
const fs = require('fs');



// old pool tutorials at /home/binyu/dev/iGame/iGameApp/public/RiskyPool
// pool jargon glossary: http://billiards.colostate.edu/glossary.html
// top machine learning algorithms: https://towardsdatascience.com/a-tour-of-the-top-10-algorithms-for-machine-learning-newbies-dde4edffae11


const parseLessonHTML = function parseLessonHTML(lessonName, gameName) {
    // const data = fs.readFileSync(`./TutorialLessons/lesson${lessonnumber}.html`, 'utf8');
    // const data = fs.readFileSync("./lesson1.html",'utf8');
  //const data = Assets.getText(`TutorialLessons/${gameName}/newlesson${lessonnumber}.html`);
  const data = Assets.getText(`TutorialLessons/${gameName}/${lessonName}.html`);

  // console.log("data is " + data);

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
        let codeStarted = false;
        for (let i=0; i<allhtmllines.length; i++) {
          const line = allhtmllines[i];
          // console.log("reviewing line " + line);
          if (!codeStarted) {
            if (line.indexOf("<code") >= 0) {
              // console.log("found code block");
              codeStarted = true;
            }
          }

          if (codeStarted) {
            if (line.indexOf("<code") >= 0) {
              if (line.indexOf("false") >= 0) {
                currentElement.codeHidden = false;
              } else {
                currentElement.codeHidden = true;
              }
              // console.log("set codeHidden " + currentElement.codeHidden);
            } else if (line.indexOf("</code>") >= 0) {
              // do nothing
            } else {
              // parse line for hint comments
              if (false && line.trim().indexOf("//h") == 0 && line.indexOf("::") > 0) {
                console.log("found hint line " + line);
                const pp = line.trim().substring(2).split("::");
                const newHint = {
                  hid: pp[0], main: pp[1], sub: pp[2], choice: []
                };
                let step = 1;
                let nextLine = allhtmllines[i+step];
                while (nextLine.trim().indexOf("::") == 0) {
                  // console.log("nextLine is " + nextLine);
                  newHint.choice.push(nextLine.trim().substring(2));
                  step ++;
                  nextLine = allhtmllines[i+step];
                }
                i += step;
                console.log("new hint is " + JSON.stringify(newHint));
                currentElement.hints[newHint.hid] = newHint;
                code += `//${newHint.hid}: ${newHint.main}\n`;
              } else {
                code += `${line} \n`;
              }
            }
          } else {
            html += `${line} \n`;
          }
        }
        currentElement.html = html;
        currentElement.code = code;
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


const gameLessonScenarioData = [];
let lessonNumber = 1;
let lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Aiming Point',
  lessonName: 'AimingPoint',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(false);
TakeBreakShot();
await WaitForAllBallStop();
ReportEndOfTest();
  `,
  Difficulty: 1,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.STARTING_WITH_BREAK_SHOTS
};
lessonObj.baselineCode =
`function getBreakShot() {
  return { 
    aimx: 0, aimy: 0---
  }; 
}`;
gameLessonScenarioData.push(lessonObj);


lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'A Great Break Shot',
  lessonName: 'AGreatBreakShot',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(false); \r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 1,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.STARTING_WITH_BREAK_SHOTS
};
lessonObj.baselineCode =
`function getBreakShot() {
  return { 
    aimx: 0, aimy: 0, strength: 30---
  }; 
}`;
gameLessonScenarioData.push(lessonObj);


// lesson 3
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Down Goes The Black Ball',
  lessonName: 'DownGoesTheBlackBall',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -80);\r\nPlaceBallOnTable(1, 0, 50 + Math.floor(Math.random()*400)); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
`function getCallShot() {
  return { 
    aimx: 0, aimy: 0, strength: 30---
  }; 
}`;
gameLessonScenarioData.push(lessonObj);



// lesson 4
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Aim Position Calculation Helper',
  lessonName: 'AimPositionCalculationHelper',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nPlaceBallOnTable(6, 330, 130); \r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
`function getCallShot() {
  const ballPos = Balls[3];
  const pocketPos = Pockets[0];
  const aimPosition = {x: ballPos.x + 40, y: ballPos.y + 20};
  return { aimx: aimPosition.x, aimy: aimPosition.y, strength: 30 }; 
}`;
gameLessonScenarioData.push(lessonObj);



// lesson 5
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Shot Success Probability',
  lessonName: 'ShotSuccessProbability',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 0, 170); \r\nPlaceBallOnTable(3, 120, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS
};
lessonObj.baselineCode =
`// refactored function
function calculateShotCommand(ballID, pocketID) {
  const ballPos = Balls[ballID];
  const pocketPos = Pockets[pocketID];
  const aimPosition = getAimPosition(ballPos, pocketPos);
  return { 
    aimx: aimPosition.x, 
    aimy: aimPosition.y, 
    strength: 30, 
    targetBallID: ballID, 
    targetPocketID: pocketID 
  }; 
}

async function getCallShot() {
  // get command to shoot ball 3 to pocket 0 and 1
  const cmd0 = ?;
  const cmd1 = ?;

  if ( Math.random() > 0.5 ) {
    return cmd0;
  } else {
    return cmd1;
  }
}`;
gameLessonScenarioData.push(lessonObj);




// lesson 6
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Walking Through Multiple Pockets',
  lessonName: 'WalkingThroughMultiplePockets',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
`
function calculateShotCommand(ballID, pocketID) {
  let ballPos = Balls[ballID];
  let pocketPos = Pockets[pocketID];
  let aimPosition = getAimPosition(ballPos, pocketPos);
  return { aimx: aimPosition.x, aimy: aimPosition.y, strength: 30, targetBallID: ballID, targetPocketID: pocketID };
}

async function getCallShot() {
  // command to shoot ball 3 to pocket 0
  const cmd0 = calculateShotCommand(3, 0);
  // probability for shooting ball 3 to pocket 0
  const prob0 = await calculateProbability(cmd0);

  // command to shoot ball 3 to pocket 1
  const cmd1 = calculateShotCommand(3, 1);
  // probability for shooting ball 3 to pocket 1
  const prob1 = await calculateProbability(cmd1);

  // command to shoot ball 3 to pocket 2
  const cmd2 = calculateShotCommand(3, 2);
  // probability for shooting ball 3 to pocket 2
  const prob2 = await calculateProbability(cmd2);

  // walk through commands and compare probability 
  let bestCommand = null;
  let highestProb = -1;

  if (prob0 > highestProb) {
    bestCommand = cmd0; 
    highestProb = prob0;
  }

  //TODO: check on cmd1 and cmd2
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
`;
gameLessonScenarioData.push(lessonObj);





// lesson 7
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Using For-Loop to Walk Through All Pockets',
  lessonName: 'UsingForLoop',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
`
function calculateShotCommand(ballID, pocketID) {
  let ballPos = Balls[ballID];
  let pocketPos = Pockets[pocketID];
  let aimPosition = getAimPosition(ballPos, pocketPos);
  return { aimx: aimPosition.x, aimy: aimPosition.y, strength: 30, targetBallID: ballID, targetPocketID: pocketID };
}

async function getCallShot() {
  // place holder for best command
  let bestCommand = null;
  let highestProb = -1;
  let ballID = 3;
  //TODO: complete for-loop using variable 'pocketID'
  for (let pocketID = ?; pocketID <= ? ; ? ) {
    const cmd = calculateShotCommand(ballID, pocketID);
    const prob = await calculateProbability(cmd);

    if ( ? ) {
      bestCommand = ? ; 
      highestProb = ? ;
    }
  }

  return bestCommand;
}
`;
gameLessonScenarioData.push(lessonObj);


// lesson 8
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: 'Another For-Loop to Walk Through All Balls',
  lessonName: "AnotherForLoop",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 300, 180);\r\nPlaceBallOnTable(2, 70, 180); \r\nPlaceBallOnTable(3, 50, -50);\r\nPlaceBallOnTable(6, 330, 130);\r\nChooseRedColor(); \r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: true,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS
};
lessonObj.baselineCode =
`
async function getCallShot() {
  // place holder for best command
  let bestCommand = null;
  let highestProb = -1;
  // array of ball IDs that can be legally targeted
  let legalBallIDs = world.CandidateBallList[MyID];
  //TODO: complete for-loop to iterate through legalBallIDs
  for (let k = ? ; ? ; ? ) {
    const ballID = ?;
    for (let pocketID = 0; pocketID <= 5 ; pocketID ++) {
      const cmd = calculateShotCommand(ballID, pocketID);
      const prob = await calculateProbability(cmd);
      if ( prob > highestProb ) {
        bestCommand = cmd ; 
        highestProb = prob ;
      }
    }
  }
  return bestCommand;
}
`;
gameLessonScenarioData.push(lessonObj);





// lesson 9
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  ScenarioName: `Managing Your Robot Releases`,
  lessonName: `ManageYourRobotReleases`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nTakeBreakShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 1,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false,
  group: TUTORIAL_GROUP.BEGINNER.INITIAL_ROBOT_RELEASE
};
gameLessonScenarioData.push(lessonObj);




/* --------------- Pro Account Lessons  ------------- */


// lesson 10
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  ScenarioName: `Changing Test Script`,
  lessonName: 'ChangingTestScript',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(2, -270, 180);
PlaceBallOnTable(3, 0, -150);
PlaceBallOnTable(4, 0, 250);
PlaceBallOnTable(6, 400, 350);
PlaceBallOnTable(7, -400, -250);

//set robot to shoot red balls only
ChooseRedColor(); 
//prompt robot to send a call shot command
TakeCallShot();

await WaitForAllBallStop();
ReportEndOfTest();
`,
  Difficulty: 1,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);






// lesson 11
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  ScenarioName: `Placing Cue Ball 'By Hand'`,
  lessonName: "PlacingCueBallByHand",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0, 0);\r\nPlaceBallOnTable(2, -570, 180); \r\nPlaceBallOnTable(3, 0, -150);\r\nPlaceBallOnTable(1, -719, -37);\r\nChooseRedColor(); \r\nPlaceCueBallFromHand();\r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true
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
  package: 'professional',
  ScenarioName: `Avoiding Blocked Pockets`,
  lessonName: "AvoidingBlockedPockets",
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0, 0);\r\nPlaceBallOnTable(2, -570, 180); \r\nPlaceBallOnTable(3, 0, -150);\r\nPlaceBallOnTable(1, -920, -422);\r\nPlaceBallOnTable(4, -617, 213);\r\nPlaceBallOnTable(5, -523, 161);\r\nChooseRedColor(); \r\nPlaceCueBallFromHand();\r\nTakeCallShot();\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();\r\n',
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: true
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
      return getAimPosition(ballPos, pocketPos, 2 * BallDiameter);  
    }
  }
}
`;
gameLessonScenarioData.push(lessonObj);






// lesson 13
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);





// lesson 14
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);



// lesson 15
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);


// lesson 16
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  // using new API from game engine for current baseline shot's outcome: every ball's ending position, pocket ID or table position
  ScenarioName: `Avoid Pocketing Cue Ball or Black Ball`,
  lessonName: `AvoidPocketingCueBallorBlackBall`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
PlaceBallOnTable(0, 0, 0);
PlaceBallOnTable(1, -903, -312);
PlaceBallOnTable(2, 0, -437);
PlaceBallOnTable(3, 3, 390);
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);





// lesson 17
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  Difficulty: 4,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);







// lesson 18
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  // in getCueballPlacement, test if cue ball place point is out side cushions or blocked from target ball. also remember target ball and pocket chosen to save time!?
  ScenarioName: `Improve Cue Ball Placement`,
  lessonName: `ImproveCueBallPlacement`,
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);




// lesson 19
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  // world.Pockets2, which has all mirrors already? also need to do grid search
  ScenarioName: `Rebound Shot Using Mirrored Pockets`,
  lessonName: `ReboundShotUsingMirroredPockets`,
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);






// lesson 20
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  // if all balls are blocked for direct shot, find indirect shot to touch a ball with my color to avoid foul
  ScenarioName: `Rebound Shot When There is No Direct Shot`,
  lessonName: `ReboundShotWhenThereisNoDirectShot`,
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);




/* --------- Start of Machine Learning -------- */


// lesson 21
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
let endState = await calculateEndState(cmd);
// format the endState object as a string and print it out
console.log(JSON.stringify(endState));

// report the end of test
ReportEndOfTest();


`,
  Difficulty: 2,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);


/*
ResetTable(false);

  // define an array of 3 different break shot commands
  const shotCmds = [];
  shotCmds.push({cueballx: -500, cuebally: 0, aimx: 0, aimy: 0, strength: 85});
  shotCmds.push({cueballx: -500, cuebally: 100, aimx: 0, aimy: 50, strength: 85});
  shotCmds.push({cueballx: -500, cuebally: 200, aimx: 0, aimy: 100, strength: 85});

  const commandList = [];
  const goodShotCountList = [];
  const badShotCountList = [];
  for (let cmdInd=0; cmdInd < shotCmds.length; cmdInd ++) {
    const cmd = shotCmds[cmdInd];
    PlaceBallOnTable(0, cmd.cueballx, cmd.cuebally);
    await UpdateWorld();
    let goodShotCount = 0;
    const totalRuns = 20;
    for (let i=0; i<totalRuns; i++) {
      const endState = await calculateEndState(cmd, true);
      let isGoodShot = false;
      for (let ballID=2; ballID<endState.length; ballID++) {
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

  const allResults = {
    Command: commandList,
    GoodShot: goodShotCountList,
    BadShot: badShotCountList
  };

  await SubmitData('BreakShotResult', allResults);
  PlotData('BreakShotResult', 'BasicColumn', 'Command');
  ReportEndOfTest();
*/




// lesson 22
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  // store test data into local web storage
  ScenarioName: `Linear Regression Model - Part I`,
  lessonName: `LinearRegressionModelPartI`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
const probabilityList = [];
const distanceList = [];
for (let i=0; i<20; i++) {
  PlaceBallOnTable(0, i * 40, i * 20);
  PlaceBallOnTable(2, -100, -50);
  await UpdateWorld();
  const cmd = calculateShotCommand(2, 0);
  const prob = await calculateProbability(cmd);
  probabilityList.push(prob);
  distanceList.push(dist2(Balls[2], Balls[0]));
}
const result = {
  distance: distanceList,
  probability: probabilityList
};
await SubmitData('testresult1', result);
await PlotData('testresult1', 'Scatter', 'distance', 'probability');
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);





// lesson 23
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
  // store test data into local web storage
  ScenarioName: `Linear Regression Model - Part II`,
  lessonName: `LinearRegressionModelPartII`,
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
ResetTable(true);
const probabilityList = [];
const distanceList = [];
for (let i=0; i<20; i++) {
  PlaceBallOnTable(0, i * 40, i * 20);
  PlaceBallOnTable(2, -100, -50);
  await UpdateWorld();
  const cmd = calculateShotCommand(2, 0);
  const prob = await calculateProbability(cmd);
  probabilityList.push(prob);
  distanceList.push(dist2(Balls[2], Balls[0]));
}
const result = {
  distance: distanceList,
  probability: probabilityList
};
await SubmitData('testresult1', result);
await PlotData('testresult1', 'Scatter', 'distance', 'probability');
ReportEndOfTest();
`,
  Difficulty: 3,
  locked: true,
  gameId: poolGameId,
  gameName: 'TrajectoryPool',
  hideReleaseButton: false,
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);



// lesson 24
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);



// lesson 25
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);




// lesson 26
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);




// lesson 27
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);




// lesson 28
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
};

gameLessonScenarioData.push(lessonObj);




// lesson 29
lessonNumber++;
lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'professional',
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
  applyBaselineCode: false
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
