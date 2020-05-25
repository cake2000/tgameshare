import _get from 'lodash/get';
import { ActiveGameList } from "../../../lib/collections";
import { UserAICodeProd } from '../../../lib/collections';
import { Games, Persons, StripeCustomer } from '../../../lib/collections';
import { ROLES, PAYMENT_PLANS } from '../../../lib/enum';
import { GAME_TYPE, MIGRATION_CONST } from "../../../lib/enum";

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
    cueballx: -500, cuebally: ${number*10 -300}, aimx: 292, aimy: 0, strength: 100
  }; 
}
    `
  };
  UserAICodeProd.insert(userAICode);
}

export default function addTestDataUser() {
  const games = Games.find().fetch();
  const playGames = games.map(game => ({
    gameId: game._id,
    rating: 100,
    tournamentIds: []
  }));

  let testAI = null;
  for (let i = 0; i < 100; i++) {
    console.log("adding user testai " + i + " pass 123456789");
    testAI = {
      _id: `TestAI${i}`,
      createdAt: new Date(),
      accountType: PAYMENT_PLANS.FREE_ROBOT,
      services: {
        password:
        {
          bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
        }
        ,
        email: {
          verificationTokens: []
        },
      },
      emails: [
        {
          address: `testai${i}@mail.com`,
          verified: true
        }
      ],
      roles: [
        ROLES.AI
      ],
      username: `TestAI${i}`,
      profile: {
        "age": 30,
        "grade": "6",
        "gradeAsOfDate": new Date(),
        "firstName": "AI" + i,
        "lastName": "Tester",
        "zipcode": "11021",
        "gender": Math.random() > 0.5 ? "M" : "F",
        "coins": 1000,
        "practiceGamesCount": 0,
        "onlineBattleCount": 0,
        "battleWonCount": 0,
        "itemGames": [
          {
            "itemId": "msC7DccE4Lo7EcEBs",
            "active": true
          },
          {
            "itemId": "HapQntju5NqemEETh",
            "active": true
          }
        ]
      },
      playGames
    };
    const c = UserAICodeProd.find({ _id: `aicode${testAI._id}` });
    if (c) {
      UserAICodeProd.remove({ _id: `aicode${testAI._id}` });
    }
    const u = Meteor.users.find({ username: testAI.username });
    if (u) {
      Meteor.users.remove({ _id: testAI._id });
    }


    const userId = Meteor.users.insert(testAI);
    addAICode(testAI._id, i);
    const personId = Persons.insert({
      userId
    });
    Meteor.users.update({ _id: userId }, { $set: { personId } });

    // Meteor.call('gameRoom.tournament.registerUser', 'Register For Tournament', poolGameId, 'yZJk98G6TjwaZzHDX', sectionKey);
  }



  const newUsers = [];
  newUsers.push({ username: "scottallison", firstName: "Scott", lastName: "Allison", grade: 6, gender: "M" });
  newUsers.push({ username: "jimanderson", firstName: "Jim", lastName: "Anderson", grade: 7, gender: "M" });
  newUsers.push({ username: "lindaarmstrong", firstName: "Linda", lastName: "Armstrong", grade: 8, gender: "F" });
  newUsers.push({ username: "jackbrown", firstName: "Jack", lastName: "Brown", grade: 7, gender: "M" });
  newUsers.push({ username: "cindycole", firstName: "Cindy", lastName: "Cole", grade: 6, gender: "F" });
  newUsers.push({ username: "harveyfischer", firstName: "Harvey", lastName: "Fischer", grade: 6, gender: "M" });
  newUsers.push({ username: "sandragraham", firstName: "Sandra", lastName: "Graham", grade: 8, gender: "F" });
  newUsers.push({ username: "frankharrison", firstName: "Frank", lastName: "Harrison", grade: 8, gender: "M" });
  newUsers.push({ username: "gloriajonas", firstName: "Gloria", lastName: "Jonas", grade: 7, gender: "F" });
  newUsers.push({ username: "stevenewman", firstName: "Steve", lastName: "Newman", grade: 8, gender: "M" });


  for (let i = 0; i < newUsers.length; i++) {
    const u = newUsers[i];
    console.log("adding user " + i + " " + u.username + " pass 123456789");
    testAI = {
      _id: `${u.username}`,
      createdAt: new Date(),
      accountType: PAYMENT_PLANS.FREE_ROBOT,
      services: {
        password: 
        {
          bcrypt: '$2a$10$0dlG6eQnOv.okZ/hgenVQejmmoVkV0GCn/FLbECb6bSMUlHxb4oX6'
        },
        email: {
          verificationTokens: []
        },
      },
      emails: [
        {
          address: `${u.username}@mail.com`,
          verified: true
        }
      ],
      roles: [
        ROLES.AI
      ],
      username: `${u.username}`,
      profile : {
        "age" : 30,
        "grade": "" + u.grade,
        "gradeAsOfDate": new Date(),
        "firstName": u.firstName,
        "lastName": u.lastName,
        "zipcode": "11021",
        "gender": u.gender,
        "coins" : 10000,
        "practiceGamesCount" : 0,
        "onlineBattleCount" : 0,
        "battleWonCount" : 0,
        "itemGames" : [
          {
            "itemId": "msC7DccE4Lo7EcEBs",
            "active": true
          },
          {
            "itemId": "HapQntju5NqemEETh",
            "active": true
          }
        ]
      },
      playGames
    };
    const c = UserAICodeProd.find({ _id:`aicode${u.username}` });
    if (c) {
      UserAICodeProd.remove({_id:`aicode${u.username}`});
    }
    // const u2 = Meteor.users.find({ username: u.username });
    // if (u2) {
      Meteor.users.remove({_id: testAI._id});
    // }
    
    Meteor.users.insert(testAI);
    addAICode(testAI._id, i);
    // Meteor.call('gameRoom.tournament.registerUser', 'Register For Tournament', poolGameId, 'yZJk98G6TjwaZzHDX', sectionKey);
  }

}



