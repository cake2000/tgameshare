import _get from 'lodash/get';
import { ActiveGameList } from "../../../lib/collections";
import { UserAICodeProd } from '../../../lib/collections';
import { Games, StripeCustomer } from '../../../lib/collections';
import { ROLES, PAYMENT_PLANS } from '../../../lib/enum';
import { GAME_TYPE, MIGRATION_CONST } from "../../../lib/enum";
// import TankWarGame from '../../../client/modules/games/gamePool/lib/tankwargame';

const poolGameId = MIGRATION_CONST.poolGameId;
function addAICode(userId, number) {
  const userAICode = {
    _id: `aicode${userId}`,
    userId,
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


async function getCallShot() {
  // place holder for best command
  let bestCommand = null;
  let highestProb = -1;
  // array of ball IDs that can be legally targeted
  let legalBallIDs = world.CandidateBallList[MyID];
  //TODO: complete for-loop to iterate through legalBallIDs
  for (let k = 0 ; k < legalBallIDs.length ; k ++ ) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) {
      continue;
    }

    for (let pocketID = 0; pocketID <= 5 ; pocketID ++) {
      const isBlocked2 = isPathBlocked(Balls[ballID], Pockets[pocketID]);  
      if (isBlocked2) continue;

      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);
      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) {
        continue;
      }

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
    cueballx: -500, cuebally: ${number*10 -300}, aimx: 292, aimy: 0, strength: 100
  }; 
}
    `
  };
  UserAICodeProd.insert(userAICode);


}

export default function addTestDataUser () {
  const games = Games.find().fetch();
  const playGames = games.map(game => ({
    gameId: game._id,
    rating: 100,
    tournamentIds: []
  }));

  let testAI = null;
  for (let i = 0; i < 20; i++) {
    console.log("adding user autorunner_" + i + " pass autorunner1234!");
    testAI = {
      _id: `autorunner_${i}`,
      createdAt: new Date(),
      accountType: PAYMENT_PLANS.FREE_ROBOT,
      services: {
        password: 
        {
          bcrypt: "$2a$10$/vXlP7LCVs7msvLs90k91ORFPBuT8HhMU4x4.tcheDu05F.lNKGiK"
        },
        email: {
          verificationTokens: []
        },
      },
      emails: [
        {
          address: `autorunner_${i}@mail.com`,
          verified: true
        }
      ],
      roles: [
        ROLES.AI
      ],
      username: `autorunner_${i}`,
      profile : {
        "age" : 30,
        "grade": "6",
        "gradeAsOfDate": new Date(),
        "firstName": "Runner" + i,
        "lastName": "Auto",
        "zipcode": "11021",
        "gender": Math.random() > 0.5 ? "M" : "F",
        "coins" : 10000000,
        "practiceGamesCount" : 0,
        "onlineBattleCount" : 0,
        "battleWonCount" : 0,
        "itemGames" : [
          {
            "itemId" : "msC7DccE4Lo7EcEBs",
            "active" : true
          },
          {
            "itemId" : "HapQntju5NqemEETh",
            "active" : true
          }
        ]
      },
      playGames
    };
    const c = UserAICodeProd.find({ _id:`aicode${testAI._id}` });
    if (c) {
      UserAICodeProd.remove({_id:`aicode${testAI._id}`});
    }
    const u = Meteor.users.find({ username: testAI._id.username });
    if (u) {
      Meteor.users.remove({_id: testAI._id});
    }
    
    Meteor.users.insert(testAI);
    addAICode(testAI._id, i);
    // Meteor.call('gameRoom.tournament.registerUser', 'Register For Tournament', poolGameId, 'yZJk98G6TjwaZzHDX', sectionKey);
  }



}



