
import { UserAICodeProd } from '../../../lib/collections';
import { MIGRATION_CONST } from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;

const prepareUserAICode = () => {

  UserAICodeProd.remove({
    _id: 'aicode1'
  });
  UserAICodeProd.remove({
    _id: 'aicodesystem'
  });

  console.log("reinserting user AI code for pool game!");
    const userAICode = {
      _id: 'aicode1',
      userId: 'kEmnDrYssC2gKNDxx',
      gameId: poolGameId,
      SubTrackName: 'Standard',
      releasedAt: new Date(),
      releaseName: 'v1',
      PlayerCode: `
function getCueBallPlacement() {
  let legalBallIDs = world.CandidateBallList[MyID]; 
  for (let k=0; k < legalBallIDs.length; k++) {
    const ballPos = Balls[legalBallIDs[k]];
    for (let pocketID=0; pocketID <=5; pocketID ++) {
      const pocketPos = Pockets[pocketID];
      //TODO: calculate whether this pocket is blocked from ball 3
      const isBlocked = isPathBlocked(ballPos, pocketPos);
      if ( !isBlocked ) {
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);  
      }
    }
  }
}

function estimateProb(pocketID, dist, angle, distpocket,  s, ballPos) {
  let probEst = 0;
  if (pocketID == 1 || pocketID == 4) {
    const sideangle = Math.abs(getAngleToSidePocket(ballPos, pocketID));
    if (sideangle >= 50) return 0;    
    probEst = 166.0051 - 0.0419*dist - 0.7929*angle-0.0781*distpocket-0.1281*s;
  } else {
    probEst = 164.9102 - 0.0368 * dist - 0.5562 * angle -0.0538 * distpocket - 0.6142 * s;
  }
  probEst = Math.max(Math.min(probEst, 100), 0);
  return probEst;
}

async function getCallShot() {
  // place holder for best command
  
  const legalBallIDs = world.CandidateBallList[MyID]; 
  let bestCommand = { prob: -1, strength: 80}; 
  let unblocked = {x: Balls[legalBallIDs[0]].x, y: Balls[legalBallIDs[0]].y};
  for (let k = 0 ; k <= legalBallIDs.length-1 ; k=k+1 ) { 
    const ballID = legalBallIDs[k]; 
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]); 
    if (isBlocked) continue; 
    
    unblocked.x = Balls[ballID].x;
    unblocked.y = Balls[ballID].y;
  
    for (let pocketID = 0; pocketID <= 5 ; pocketID = pocketID + 1 ) { 
      
      const isBlocked2 = isPathBlocked(Balls[ballID], Pockets[pocketID]); 
      if (isBlocked2) continue; 
      
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]); 
  
      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]); 
      if (Math.abs(cutAngle) > 60) continue ; 
  
      // iterate through strength values of 20/40/60/80 
      for (let s = 20; s <= 80; s = s + 20) { 
        const cmd = { aimx: aimPoint.x, aimy: aimPoint.y, strength: s, targetBallID: ballID, targetPocketID: pocketID }; 
          
        const dist = dist2(Balls[ballID], Balls[0]);
        const distpocket = dist2(Pockets[pocketID], Balls[0]);
      
        const probEst = estimateProb(pocketID, dist, cutAngle, distpocket, s, Balls[ballID]);
        console.log("probEst " + probEst + " best " + bestCommand.prob);
        if (probEst < 50 && probEst < bestCommand.prob) continue;
        
        cmd.prob = await calculateProbability(cmd); 
        if (cmd.prob > bestCommand.prob) { 
          bestCommand = cmd;  
          if (bestCommand.prob > 80) return bestCommand;
        } 
      } 
    } 
  } 
  
  if (typeof(bestCommand.aimx) == "undefined") {
    bestCommand.aimx = unblocked.x;
    bestCommand.aimy = unblocked.y;
  }

  return bestCommand;
}

function calculateShotCommand(ballID, pocketID) {
  let ballPos = Balls[ballID];
  let pocketPos = Pockets[pocketID];
  let aimPosition = getAimPosition(ballPos, pocketPos);
  return { aimx: aimPosition.x, aimy: aimPosition.y, strength: 35, targetBallID: ballID, targetPocketID: pocketID };
}

function getBreakShot() {
  return { 
    cueballx: 0, cuebally: 0, aimx: 0, aimy: 0, strength: 90
  }; 
}
`      
    };
    UserAICodeProd.insert(userAICode);


    // const userAICode2 = {
    //   _id: 'aicode2',
    //   userId: 'kEmnDrYssC2gKNDxx',
    //   gameId: poolGameId,
    //   SubTrackName: 'Standard',
    //   releasedAt: new Date(),
    //   releaseName: 'v2',
    // };
    // userAICode2.PlayerCode = userAICode.PlayerCode;
    // UserAICodeProd.insert(userAICode2);



    // const userAICode3a = {
    //   _id: 'bicode1',
    //   userId: 'kEmnDrYssC2gKNDxy',
    //   gameId: poolGameId,
    //   SubTrackName: 'Standard',
    //   releasedAt: new Date(),
    //   releaseName: 'v1',
    // };
    // userAICode3a.PlayerCode = userAICode.PlayerCode;
    // UserAICodeProd.insert(userAICode3a);


    const userAICode3 = {
      _id: 'aicodesystem',
      userId: 'system',
      gameId: poolGameId,
      SubTrackName: 'Standard',
      releasedAt: new Date(),
      releaseName: 'TGame_Bot',
    };
    userAICode3.PlayerCode = userAICode.PlayerCode;
    UserAICodeProd.insert(userAICode3);
};


export default prepareUserAICode;
