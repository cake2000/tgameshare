
import { UserAICodeProd } from '../../../lib/collections';
import { MIGRATION_CONST } from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;

const prepareUserAICode = () => {
  if (UserAICodeProd.find({ userId: 'system' }).count() === 0) {
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
        return getAimPosition(ballPos, pocketPos, 2 * BallDiameter);  
      }
    }
  }
}


async function getCallShot() {
  // place holder for best command
  let bestCommand = null;
  let highestProb = -1;
  // array of ball IDs that can be legally targeted
  let legalBallIDs = world.CandidateBallList[MyID];
  //TODO: complete for-loop to iterate through legalBallIDs
  for (let k = 0 ; k < legalBallIDs.length ; k ++ ) {
    const ballID = legalBallIDs[k];
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

function calculateShotCommand(ballID, pocketID) {
  let ballPos = Balls[ballID];
  let pocketPos = Pockets[pocketID];
  let aimPosition = getAimPosition(ballPos, pocketPos);
  return { aimx: aimPosition.x, aimy: aimPosition.y, strength: 35, targetBallID: ballID, targetPocketID: pocketID };
}

function getBreakShot() {
  return { 
    cueballx: 0, cuebally: 0, aimx: 0, aimy: 0, strength: 80
  }; 
}
      `
      //PlayerCode: "\nthis.getBreakShot = function() {\n\t// debugger;\n\treturn {\n\t\tcueballX: world.CenterX - world.TableWidth * 0.04,\n\t\tcueballY: world.CenterY - world.TableWidth * 0.2,\n\t\taimx: world.CenterX + world.TableWidth/4,\n\t\taimy: world.CenterY,\n\t\tstrength: 1200,\n\t\tspin: -0.5\n\t};\n};\n\n// this.getCallShot = function() {\n \n//     var targetBallPos = world.Balls[1];\n//     var pocketPos = world.Pockets[1];\n//     var direction = targetBallPos.clone().subtract(pocketPos).normalize();\n//     var aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter));\n \n//     var shotCmd = {\n//         aimx: aimPos.x,\n//         aimy: aimPos.y,\n//         strength: 700,\n//         spin: -0.5,\n//         targetBallID: 1,\n//         targetPocketID: 1\n//     };\n \n//     var probability = calculateProbability(shotCmd);\n//     console.log(\"probability of hitting ball \" + shotCmd.targetBallID + \" into pocket \" + shotCmd.targetPocketID + \" is \" + probability);\n\n \n//     return shotCmd;\n// };\n\n\n// var getCallShotForPocket = function(pocketID) {\n\n// \tvar targetBallPos = world.Balls[1];\n// \tvar pocketPos = world.Pockets[pocketID];\n// \tvar direction = targetBallPos.clone().subtract(pocketPos).normalize();\n// \tvar aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter));\n\n// \tvar cmd = {\n// \t\taimx: aimPos.x,\n// \t\taimy: aimPos.y,\n// \t//\taimx: world.Balls[1].x,\n// \t//\taimy: world.Balls[1].y,\n// \t\tstrength: 700,\n// \t\tspin: -0.5,\n// \t\ttargetPocketID: pocketID,\n//         targetBallID: 1\n// \t};\n\t\n// \treturn cmd;\n// };\n\n// this.getCallShot = function() {\n// \tvar maxProb = -1; var bestCmd = null;\n// \tfor(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n// \t\tvar cmd = getCallShotForPocket(pocketID);\n\t\t\n// \t\tvar prob = calculateProbability(cmd);\n// \t\tconsole.log(\"prob for pocket \" + pocketID + \" is \" + prob);\n// \t\tif ( prob > maxProb ) {\n// \t\t\tmaxProb = prob;\n// \t\t\tbestCmd = cmd;\n// \t\t}\n// \t}\n\t\n// \treturn bestCmd;\n\n// };\n\n\nvar getCallShotForPocketForBall = function(pocketID, ballID) {\n \n    var targetBallPos = world.Balls[ballID];\n    var pocketPos = world.Pockets[pocketID];\n    var direction = targetBallPos.clone().subtract(pocketPos).normalize();\n    var aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter));\n \n    var cmd = {\n        aimx: aimPos.x,\n        aimy: aimPos.y,\n        strength: 700,\n        spin: -0.5,\n        targetPocketID: pocketID,\n        targetBallID: ballID\n    };\n     \n    return cmd;\n};\n \n// this.getCallShot = function() {\n//     var maxProb = -1; var bestCmd = null;\n//     for(var i=0; i < world.CandidateBallList[MyID].length; i ++) {\n//         var ballID = world.CandidateBallList[MyID][i];\n//         for(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n//             var cmd = getCallShotForPocketForBall(pocketID, ballID);\n             \n//             var prob = calculateProbability(cmd);\n//             console.log(\"prob for pocket \" + pocketID + \" and ballID \" + ballID + \" is \" + prob);\n//             if ( prob > maxProb ) {\n//                 maxProb = prob;\n//                 bestCmd = cmd;\n//             }\n//         }\n//     };\n     \n//     return bestCmd;\n \n// };\n\nthis.getCallShot = function() {\n    var maxProb = -1; var bestCmd = null;\n    for(var i=0; i < world.CandidateBallList[MyID].length; i ++) {\n        var ballID = world.CandidateBallList[MyID][i];\n        for(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n            var cmd = getCallShotForPocketForBall(pocketID, ballID);\n            var targetballPocketProb = calculateProbability(cmd);\n            var cueballPocketProb = CalculateProbabilityByBallID(cmd, 0);\n            var blackballPocketProb = CalculateProbabilityByBallID(cmd, 1);\n\t\t\tif (targetballPocketProb > 0)\n            \tconsole.log(\"prob for pocket \" + pocketID + \" and ballID \" + ballID + \" is \" + targetballPocketProb + \" cue ball \" + cueballPocketProb + \" blackball \" + blackballPocketProb);\n            if ( targetballPocketProb > maxProb && cueballPocketProb < 20 && (ballID == 1 || blackballPocketProb < 0.1) ) {\n                maxProb = targetballPocketProb;\n                bestCmd = cmd;\n            }\n        }\n    };\n     \n    return bestCmd;\n \n};\n\n/*\nthis.getCueballPlacement = function() {\n\treturn {\n\t\tx: world.tableCenterX - world.tableWidth/4,\n\t\ty: world.tableCenterY\n\t};\n};\nvar getAnyTargetBallPos = function(chosenColor) {\n\tvar acceptableColor = [chosenColor];\n\tif ( typeof(chosenColor) == \"undefined\") {\n\t\tacceptableColor = [world.ColorType.YELLOW, world.ColorType.RED];\n\t} \n\tvar blackBallPos = null;\n\tfor (var k=0; k < world.balls.length; k++) {\n\t\tvar b = world.balls[k];\n\t\tif ( b.inPocket || b.ID == 0 ) continue;\n\t\tif ( b.ID == 1) {\n\t\t\tblackBallPos = new Victor(b.x, b.y);\n\t\t}\n\t\tif ( 0 <= $.inArray(b.colorType, acceptableColor)) {\n\t\t\treturn new Victor(b.x, b.y);\n\t\t}\n\t}\n\n\treturn blackBallPos; \n\n};\n\nthis.getCallShot = function() {\n\n\tvar targetBallPos = getAnyTargetBallPos(world.playerInfo[MyID].chosenColor);\n\tvar pocketPos = world.pockets[0];\n\tvar direction = targetBallPos.clone().subtract(pocketPos).normalize();\n\tvar aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.ballDiameter));\n\n\treturn {\n\t\taimx: aimPos.x,\n\t\taimy: aimPos.y,\n\t\tstrength: 700,\n\t\tspin: -0.5\n\t};\n};\n\n\n\n*/\n\n\nvar getBallClosestToPocket = function() {\n  var minDistance = world.TableWidth * 10;\n  var bestBallID = -1; var bestPocketID = -1;\n \n  for(var i=0; i < world.CandidateBallList[MyID].length; i ++) {\n      var ballID = world.CandidateBallList[MyID][i];\n       \n      for(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n        var dist = world.Pockets[pocketID].distance(world.Balls[ballID]);\n        if ( dist < minDistance ) {\n          minDistance = dist; bestBallID = ballID; bestPocketID = pocketID;\n        }\n      }\n  };\n  return {bestBallID, bestPocketID};\n};\n \nthis.getCueBallPlacement = function() {\n \n  var bestBP = getBallClosestToPocket();\n  var ballID = bestBP.bestBallID; var pocketID = bestBP.bestPocketID;\n \n  // now place cue ball behind best ball, but make sure it doesn't collide with any other balls\n    var targetBallPos = world.Balls[ballID];\n    var pocketPos = world.Pockets[pocketID];\n    var direction = targetBallPos.clone().subtract(pocketPos).normalize();\n    var cueballPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter*1.01));\n \n    return cueballPos;\n \n};"
      // PlayerCode: `

      // function getCueBallPlacement() { 
      //   // get array of pocketPos.distance(ballPos)ball IDs that we can shoot 
      //   const legalBallIDs = world.CandidateBallList[MyID]; 
      //   // array of IDs for 4 corner pockets 
      //   const cornerPocketIDs = [0, 2, 3, 5]; 
        
      //   let bestBallID = -1; 
      //   let bestPocketID = -1; 
      //   //use maxDistance to keep track of max minDistance 
      //   let maxDistance = -1; 
        
      //   for (let i=0; i < legalBallIDs.length; i++){ 
      //     const ballID = legalBallIDs[i]; 
      //     const ballPos = world.Balls[ballID];   
        
      //     // keep track of minDistance and pocketID for that 
      //     let pocketIDAtMinDistance = -1; 
      //     let minDistance = 1000000; 
        
      //     // go through all corner pockets for this ball 
      //     for (let k=0; k < cornerPocketIDs.length; k++){ 
      //       const pocketID = cornerPocketIDs[k]; 
      //       const pocketPos = world.Pockets[pocketID];  
        
      //       //TODO: update minDistance  
      //       const dist = pocketPos.distance(ballPos); 
      //       console.log("dist ball " + ballID + " p " + pocketID + " " + dist);
      //       if ( dist < minDistance ) { 
      //         minDistance = dist;
      //         pocketIDAtMinDistance = pocketID;
      //       } 
      //     } 
        
      //     if ( minDistance < 1000000 && minDistance > maxDistance ) { 
      //       maxDistance = minDistance;
      //       bestBallID = ballID;
      //       bestPocketID = pocketIDAtMinDistance;
      //     } 
      //   } 
        
      //   const cueballPos = getAimPosition(world.Balls[bestBallID], world.Pockets[bestPocketID], 1); 
      //   return cueballPos; 
      // }
      
      // async function getCallShot() { 
      //   // get array of legal ball IDs 
      //   const legalBallIDs = world.CandidateBallList[MyID];
      //   //place holder for best shot command 
      //   let bestShotCommand = null; 
        
      //   //TODO: conduct a grid search for best target pocket 
      //   let maxProb = -1; 
      //   for (let i=0; i < legalBallIDs.length; i++ ) { 
      //     const ballID = legalBallIDs[i];
      //     for (let pocketID=0; pocketID < 6; pocketID++ ) { 
      //       const aimPos = getAimPosition(world.Balls[ballID], world.Pockets[pocketID]);
      //       const shotCmd = {aimx: aimPos.x, aimy: aimPos.y, strength: 60, targetBallID: ballID, targetPocketID: pocketID};
            
      //       const prob = await calculateProbability(shotCmd);
      //       console.log("calculating prob b " + ballID + " p " + pocketID + " is " + prob);
      //       if ( prob > maxProb ) { 
      //         maxProb = prob; 
      //         bestShotCommand = shotCmd;
      //       } 
      //     } 
      //   }  
      //   // return the best shot with highest probability 
      //   if (bestShotCommand == null) {
      //     debugger;
      //   }
      //   return bestShotCommand;  
      // }
      
      // function getBreakShot() { 
      //   return { strength: 70, aimx: 0, aimy: 0, cueballx: 0, cuebally: 0 };  
      // }
                
      // `
    };
    UserAICodeProd.insert(userAICode);


    const userAICode2 = {
      _id: 'aicode2',
      userId: 'kEmnDrYssC2gKNDxx',
      gameId: poolGameId,
      SubTrackName: 'Standard',
      releasedAt: new Date(),
      releaseName: 'v2',
    };
    userAICode2.PlayerCode = userAICode.PlayerCode;
    UserAICodeProd.insert(userAICode2);



    const userAICode3a = {
      _id: 'bicode1',
      userId: 'kEmnDrYssC2gKNDxy',
      gameId: poolGameId,
      SubTrackName: 'Standard',
      releasedAt: new Date(),
      releaseName: 'v1',
    };
    userAICode3a.PlayerCode = userAICode.PlayerCode;
    UserAICodeProd.insert(userAICode3a);


















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


    // userAICode._id = "aicode2";
    // userAICode.releasedAt = new Date();
    // userAICode.releaseName ='systemrelease1';    
    // UserAICodeProd.insert(userAICode);

    // userAICode._id = 'rG8pWismrFCejQhbj';
    // userAICode.userId = 'kEmnDrYssC2gKNDxx';
    // userAICode.releaseName ='systemrelease2';
    // UserAICodeProd.insert(userAICode);    
  }
};


export default prepareUserAICode;
