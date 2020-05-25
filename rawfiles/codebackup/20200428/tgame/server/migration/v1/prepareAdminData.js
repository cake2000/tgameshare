/* global Roles */


import { ROLES, GENDER_VALUE, MIGRATION_CONST } from '../../../lib/enum';
import { Games, Admin, UserAICodeProd, Persons } from '../../../lib/collections';

const poolGameId = MIGRATION_CONST.poolGameId;

const prepareAdminHomepageData = () => {
  if (Admin.find().count() === 0) {
    const general = {
      type: 'general',
      data: {
        email: 'tgameai@gmail.com'
      }
    };
    const homePage = {
      type: 'homepage',
      data: {
        accounts: {
          ai: [
            // 'All games included',
            'Play games online using your robot',
            'Learn AI coding through tutorials',
            'Challenge other players or their robots',
            'Compete in tournaments using your robot'
          ],
          manual: [
            // 'All games included',
            'Play games online manually yourself',
            'Practice against human or robots',
            'Challenge other players or their robots',
            'Compete in tournaments yourself',
          ]
        },
        features: [
          {
            logo: null,
            name: 'CODE',
            des: 'game robots in JavaScript following TBot\'s tutorials',
            defaultLogo: '/images/ai-programing.svg'
          },
          {
            logo: null,
            name: 'CHALLENGE',
            des: 'your friends in online games by yourself or your robot',
            defaultLogo: '/images/friends.svg'
          },
          {
            logo: null,
            name: 'COMPETE',
            des: 'in tournaments to earn awards and official rating',
            defaultLogo: '/images/awards.svg'
          }
        ],
        faq: [
          {
            question: 'Who play on TGame?',
            answer: `
            <p>
              There are 2 types of players on TGame: robot players and human players.
            </p>
            <br/>
            <ul>
              <li>
                <b>Robot players</b> are programmers who write computer programs (called game robot or game AI) to play games. Each robot is driven by hundreds lines of code, which resembles the complexity of real-world AI applications. Game robot is a perfect project for anyone looking for fun coding projects and learning opportunity in artificial intelligence. It is relatively simple to get started for new programmers, yet sky is the limit if you want to apply advanced optimization and machine learning algorithms in your robot.
              </li>
              <br/>
              <li>
                <b>Human players</b> could be anyone looking for some competitive games to play manually themselves. If your friend or kid is learning to write game robots with us, we encourage you to sign up as a human player to play with their robots for fun. You can have tons of fun for FREE and help someone to learn AI algorithms at the same time!
              </li>
            </ul>
            `
          },
          {
            question: 'Is it really free?',
            answer: `
            <p>
              Yes. You only need to sign up with your email, and no payment info is needed. And we are not showing ads on our site.
            </p>
            <br/>
            <p>
              We will figure out a way to get paid by providing more value to you in the future. Don't worry about us.
            </p>
              `
          },
          {
            question: 'What games are available?',
            answer: `
            <p>
              Since we have just started, currently only the Trajectory Pool game is available. We are actively working on adding more games to our platform, and if there is a specific combat game that you would like added, <a href="/contact-us" target="_blank">let us know</a>!
            </p>
            `
          },
          {
            question: 'What if I don’t know how to program?',
            answer: `
            <p>
              That's not a problem! Your tutor TBot will explain each programming concept when it is first used, and you can ask TBot any programming question at any time throughout the tutorial.
            </p>
            <br/>
            <p>
              If you are the kind of learner who prefer a systematic introduction of all basic concepts before diving in, there are plenty of excellent tutorials and courses in JavaScript freely available online to get you started, such as <a target="_blank" href="https://www.khanacademy.org/computing/computer-programming/programming">Khan Academy</a>, <a target="_blank" href="http://www.learn-js.org/">Learn-JS</a>, and <a target="_blank" href="https://www.codeschool.com/courses/javascript-road-trip-part-1">Code School</a>, etc.
            </p>
            `
          },
          {
            question: 'So a robot will be teaching the tutorials?',
            answer: 
            `
            <p>
              Yes, and no.
            </p>
            <br/>
            <p>
              We are a group of computer scientists with years of experience in applying AI solutions to various challenging problems, and we design the tutorials the same way as if we are personally talking you through the process of building your game robots. 
            </p>
            <br/>
            <p>
              However, there are only so many people we can talk to in a single day, so we need the help of our chatbot <b>TBot</b> to walk you through the tutorials <b>on behalf of us</b>. Our goal is to make your interaction with TBot as pleasant as talking to one of us, and TBot can actually serve you better in many ways as well, such as responding to you instantly, or repeating the same information patiently as many times as you need.
            </p>
            <br/>
            <p>
              This is a challenging task for us, and we need your help to do better. If you find any issue with TBot's response to you, please <a href="/contact-us"  target="_blank">send us a message</a> or post it on our forum under the category of "TBot Improvement". Thanks!
            </p>
            `
          },
          {
            question: 'Can I learn or apply AI (Artificial Intelligence) with TuringGame?',
            answer: `
            <p>
              Absolutely! The term artificial intelligence refers to all human activities that create intelligent behavior in computing devices, which can take one of the following 2 approaches:
            </p>
            <br/>
            <ul>
              <li>
                <p>
                  With <b>logic programming</b>, the programmer analyzes the issue at hand, design an algorithm to solve the problem, and then implement the algorithm as computer programs. For example, given 2 locations on a map, find the shortest path between them. Logic programming is the mostly widely used AI techniques since it is easy to understand and diagnose, and it is especially useful when you only have limited amount of training data.  
                </p>
                <br/>
                <p>
                  When writing your game robot on TuringGame, you will be applying the same kind of logical thinking and algorithm design, such as how to search for the best course of action quickly, how to balance the risk and reward of your action, etc. 
                </p>
              </li>
              <br/>
              <li>
                <p>
                  In <b>machine learning</b>, intead of directly specifying the logic to solve a problem step-by-step, you feed example training data to a computer model or a robot, which "learns" to reproduce the desired output according to the training. For example, given tens of thousands of images of the number 0, a good model will be able to tell a new image contains a 0 or not.   
                </p>
                <br/>
                <p>
                  On the TurinGame platform, you can write test scripts to generate tons of training data and build machine learning models using such data.
                </p>
              </li>
            </ul>        
            `
          },
          {
            question: 'Why JavaScript?',
            answer: `
            <p>
              JavaScript is simple to pick up, and it is by far the <a href="https://thenewstack.io/javascript-popularity-surpasses-java-php-stack-overflow-developer-survey/" target="_blank">most popular programming language for the web</a> today. With frameworks like the <a href="http://mean.io/" target="_blank">MEAN Stack</a>, JavaScript allows you to write both web interface and web servers in one language, and it is also the key language for building web-based games. 
            </p>
            <br/>
            <p>
              In addition, our goal is more about teaching AI algorithms and computational thinking than any specific language. The algorithms and techniques you learn in writing game robots with JavaScript will be equally applicable in most programming languages (e.g. Java, C/C++, Python, C#, etc). If you have a strong preference for some other language you would like added, <a href="/contact-us"  target="_blank">let us know</a>!
            </p>
              `
          },
          {
            question: 'Is my robot code protected when I play a game?',
            answer: 'Yes it is 100% safe. We understand that advanced users can check JavaScript source code in the browser\'s developer console, so we only load your robot program in your own desktop or mobile device when you are playing a game, and the only data sent over the Internet is your robot\'s commands.'
          }
        ],
        banner: {
          sloganFirstLine: 'TuringGame - Learn to code your own game bots',
          sloganSecondLine: '', // 'Play games online - as human or create your robot',
          chooseCampText: 'Choose a camp to start!',
          camps: {
            aiCamp: {
              logo: null,
              title: 'Robot Mode',
              des: 'Learn coding JavaScript by programming a game bot'
            },
            humanCamp: {
              logo: null,
              title: 'Manual Mode',
              des: 'Play games manually with friends, or their game bots'
            }
          }
        },
      }
    };
    Admin.insert(homePage);
    Admin.insert(general);
  }
};

const prepareRobotCodeForUser = () => {


};

const addTestUser = function addTestUser(id) {
  const existedTestUser = Meteor.users.findOne({ 'emails.address': `t${id}@test.com` });
  // console.log(`existedTestUser is ${JSON.stringify(existedTestUser)}`);
  if (typeof (existedTestUser) === 'undefined') {
    Meteor.users.remove({ 'email.address': `t${id}@test.com` });
    const userId2 = Accounts.createUser({
      username: `test${id}`,
      email: `t${id}@test.com`,
      password: 't',
      profile: {
        age: 13,
        firstName: `user${id}`,
        lastName: 'test',
      }
    });
    const personId = Persons.insert({
      userId: userId2
    });
    Roles.addUsersToRoles(userId2, ROLES.AI);

    Meteor.users.update(
      {
        _id: userId2,
        'emails.address': `t${id}@test.com`
      },
      {
        $set: {
          'emails.$.verified': true,
          personId
        }
      }
    );


    const games = Games.find().fetch();
    const playGames = games.map((g) => {
      return {
        gameId: g._id,
        rating: 0,
        tournamentIds: []
      };
    });
    Meteor.users.update(
      { _id: userId2 }, { $set: {
        playGames
      } }
    );


    const gameId = poolGameId;
    const SubTrackName = 'Standard';
    const releasedAt = new Date();
    // const PlayerCode = "\nthis.getBreakShot = function() {\n\t// debugger;\n\treturn {\n\t\tcueballX: world.CenterX - world.TableWidth * 0.04,\n\t\tcueballY: world.CenterY - world.TableWidth * 0.2,\n\t\taimx: world.CenterX + world.TableWidth/4,\n\t\taimy: world.CenterY,\n\t\tstrength: 1200,\n\t\tspin: -0.5\n\t};\n};\n\n// this.getCallShot = function() {\n \n//     var targetBallPos = world.Balls[1];\n//     var pocketPos = world.Pockets[1];\n//     var direction = targetBallPos.clone().subtract(pocketPos).normalize();\n//     var aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter));\n \n//     var shotCmd = {\n//         aimx: aimPos.x,\n//         aimy: aimPos.y,\n//         strength: 700,\n//         spin: -0.5,\n//         targetBallID: 1,\n//         targetPocketID: 1\n//     };\n \n//     var probability = calculateProbability(shotCmd);\n//     console.log(\"probability of hitting ball \" + shotCmd.targetBallID + \" into pocket \" + shotCmd.targetPocketID + \" is \" + probability);\n\n \n//     return shotCmd;\n// };\n\n\n// var getCallShotForPocket = function(pocketID) {\n\n// \tvar targetBallPos = world.Balls[1];\n// \tvar pocketPos = world.Pockets[pocketID];\n// \tvar direction = targetBallPos.clone().subtract(pocketPos).normalize();\n// \tvar aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter));\n\n// \tvar cmd = {\n// \t\taimx: aimPos.x,\n// \t\taimy: aimPos.y,\n// \t//\taimx: world.Balls[1].x,\n// \t//\taimy: world.Balls[1].y,\n// \t\tstrength: 700,\n// \t\tspin: -0.5,\n// \t\ttargetPocketID: pocketID,\n//         targetBallID: 1\n// \t};\n\t\n// \treturn cmd;\n// };\n\n// this.getCallShot = function() {\n// \tvar maxProb = -1; var bestCmd = null;\n// \tfor(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n// \t\tvar cmd = getCallShotForPocket(pocketID);\n\t\t\n// \t\tvar prob = calculateProbability(cmd);\n// \t\tconsole.log(\"prob for pocket \" + pocketID + \" is \" + prob);\n// \t\tif ( prob > maxProb ) {\n// \t\t\tmaxProb = prob;\n// \t\t\tbestCmd = cmd;\n// \t\t}\n// \t}\n\t\n// \treturn bestCmd;\n\n// };\n\n\nvar getCallShotForPocketForBall = function(pocketID, ballID) {\n \n    var targetBallPos = world.Balls[ballID];\n    var pocketPos = world.Pockets[pocketID];\n    var direction = targetBallPos.clone().subtract(pocketPos).normalize();\n    var aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter));\n \n  var cmd = {\n        aimx: aimPos.x,\n        aimy: aimPos.y,\n        strength: 700,\n        spin: -0.5,\n        targetPocketID: pocketID,\n        targetBallID: ballID\n    };\n     \n    return cmd;\n};\n \n// this.getCallShot = function() {\n//     var maxProb = -1; var bestCmd = null;\n//     for(var i=0; i < world.CandidateBallList[MyID].length; i ++) {\n//         var ballID = world.CandidateBallList[MyID][i];\n//         for(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n//             var cmd = getCallShotForPocketForBall(pocketID, ballID);\n             \n//             var prob = calculateProbability(cmd);\n//             console.log(\"prob for pocket \" + pocketID + \" and ballID \" + ballID + \" is \" + prob);\n//             if ( prob > maxProb ) {\n//                 maxProb = prob;\n//                 bestCmd = cmd;\n//             }\n//         }\n//     };\n     \n//     return bestCmd;\n \n// };\n\nthis.getCallShot = function() {\n    var maxProb = -1; var bestCmd = null;\n    for(var i=0; i < world.CandidateBallList[MyID].length; i ++) {\n        var ballID = world.CandidateBallList[MyID][i];\n        for(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n            var cmd = getCallShotForPocketForBall(pocketID, ballID);\n            var targetballPocketProb = calculateProbability(cmd);\n            var cueballPocketProb = CalculateProbabilityByBallID(cmd, 0);\n            var blackballPocketProb = CalculateProbabilityByBallID(cmd, 1);\n\t\t\tif (targetballPocketProb > 0)\n            \tconsole.log(\"prob for pocket \" + pocketID + \" and ballID \" + ballID + \" is \" + targetballPocketProb + \" cue ball \" + cueballPocketProb + \" blackball \" + blackballPocketProb);\n            if ( targetballPocketProb > maxProb && cueballPocketProb < 20 && (ballID == 1 || blackballPocketProb < 0.1) ) {\n                maxProb = targetballPocketProb;\n                bestCmd = cmd;\n            }\n        }\n    };\n     \n    return bestCmd;\n \n};\n\n/*\nthis.getCueballPlacement = function() {\n\treturn {\n\t\tx: world.tableCenterX - world.tableWidth/4,\n\t\ty: world.tableCenterY\n\t};\n};\nvar getAnyTargetBallPos = function(chosenColor) {\n\tvar acceptableColor = [chosenColor];\n\tif ( typeof(chosenColor) == \"undefined\") {\n\t\tacceptableColor = [world.ColorType.YELLOW, world.ColorType.RED];\n\t} \n\tvar blackBallPos = null;\n\tfor (var k=0; k < world.balls.length; k++) {\n\t\tvar b = world.balls[k];\n\t\tif ( b.inPocket || b.ID == 0 ) continue;\n\t\tif ( b.ID == 1) {\n\t\t\tblackBallPos = new Victor(b.x, b.y);\n\t\t}\n\t\tif ( 0 <= $.inArray(b.colorType, acceptableColor)) {\n\t\t\treturn new Victor(b.x, b.y);\n\t\t}\n\t}\n\n\treturn blackBallPos; \n\n};\n\nthis.getCallShot = function() {\n\n\tvar targetBallPos = getAnyTargetBallPos(world.playerInfo[MyID].chosenColor);\n\tvar pocketPos = world.pockets[0];\n\tvar direction = targetBallPos.clone().subtract(pocketPos).normalize();\n\tvar aimPos = targetBallPos.clone().add(direction.multiplyScalar(world.ballDiameter));\n\n\treturn {\n\t\taimx: aimPos.x,\n\t\taimy: aimPos.y,\n\t\tstrength: 700,\n\t\tspin: -0.5\n\t};\n};\n\n\n\n*/\n\n\nvar getBallClosestToPocket = function() {\n  var minDistance = world.TableWidth * 10;\n  var bestBallID = -1; var bestPocketID = -1;\n \n  for(var i=0; i < world.CandidateBallList[MyID].length; i ++) {\n      var ballID = world.CandidateBallList[MyID][i];\n       \n      for(var pocketID = 0; pocketID < 6; pocketID ++ ) {\n        var dist = world.Pockets[pocketID].distance(world.Balls[ballID]);\n        if ( dist < minDistance ) {\n          minDistance = dist; bestBallID = ballID; bestPocketID = pocketID;\n        }\n      }\n  };\n  return {bestBallID, bestPocketID};\n};\n \nthis.getCueBallPlacement = function() {\n \n  var bestBP = getBallClosestToPocket();\n  var ballID = bestBP.bestBallID; var pocketID = bestBP.bestPocketID;\n \n  // now place cue ball behind best ball, but make sure it doesn't collide with any other balls\n    var targetBallPos = world.Balls[ballID];\n    var pocketPos = world.Pockets[pocketID];\n    var direction = targetBallPos.clone().subtract(pocketPos).normalize();\n    var cueballPos = targetBallPos.clone().add(direction.multiplyScalar(world.BallDiameter*1.01));\n \n    return cueballPos;\n \n};";
    // const PlayerCode = `
    // function getCueBallPlacement() {
    //   let legalBallIDs = world.CandidateBallList[MyID]; 
    //   for (let k=0; k < legalBallIDs.length; k++) {
    //     const ballPos = Balls[legalBallIDs[k]];
    //     for (let pocketID=0; pocketID <=5; pocketID ++) {
    //       const pocketPos = Pockets[pocketID];
    //       //TODO: calculate whether this pocket is blocked from ball 3
    //       const isBlocked = isPathBlocked(ballPos, pocketPos);
    //       if ( !isBlocked ) {
    //         return getAimPosition(ballPos, pocketPos, 2 * BallDiameter);  
    //       }
    //     }
    //   }
    // }
    
    
    // async function getCallShot() {
    //   // place holder for best command
    //   let bestCommand = null;
    //   let highestProb = -1;
    //   // array of ball IDs that can be legally targeted
    //   let legalBallIDs = world.CandidateBallList[MyID];
    //   //TODO: complete for-loop to iterate through legalBallIDs
    //   for (let k = 0 ; k < legalBallIDs.length ; k ++ ) {
    //     const ballID = legalBallIDs[k];
    //     for (let pocketID = 0; pocketID <= 5 ; pocketID ++) {
    //       const cmd = calculateShotCommand(ballID, pocketID);
    //       const prob = await calculateProbability(cmd);
    //       if ( prob > highestProb ) {
    //         bestCommand = cmd ; 
    //         highestProb = prob ;
    //       }
    //     }
    //   }
    //   return bestCommand;
    // }
    
    // function calculateShotCommand(ballID, pocketID) {
    //   let ballPos = Balls[ballID];
    //   let pocketPos = Pockets[pocketID];
    //   let aimPosition = getAimPosition(ballPos, pocketPos);
    //   return { aimx: aimPosition.x, aimy: aimPosition.y, strength: 50, targetBallID: ballID, targetPocketID: pocketID };
    // }
    
    // function getBreakShot() {
    //   return { 
    //     cueballx: 0, cuebally: 0, aimx: 0, aimy: 0, strength: 80
    //   }; 
    // }
    
        
        
    // `;
    // UserAICodeProd.insert(
    //   { userId: userId2, gameId, SubTrackName, releasedAt, releaseName: 'test code 1', PlayerCode }
    // );
  }
};

const prepareAdminUserData = () => {
  const adminUser = { firstName: 'Super', lastName: 'Admin', email: 'admin@tgame.com', password: 'admin', roles: [ROLES.SUPER_ADMIN] };
  const existedAdmin = Meteor.users.findOne({ 'emails.address': adminUser.email });
  if (!existedAdmin) {
    const userId = Accounts.createUser({
      email: adminUser.email,
      createdAt: new Date(),
      username: 'adminuser',
      password: adminUser.password,
      profile: {
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        gender: GENDER_VALUE.FEMALE
      },
    });
    const personId = Persons.insert({
      userId
    });
    Meteor.users.update(
      {
        _id: userId,
        'emails.address': adminUser.email
      },
      {
        $set: {
          'emails.$.verified': true,
          personId
        }
      }
    );
    Roles.addUsersToRoles(userId, ROLES.SUPER_ADMIN);
  }
  // addTestUser('0');
  // addTestUser('1');
};

const prepareAdminData = () => {
  prepareAdminHomepageData();
  prepareAdminUserData();
  prepareRobotCodeForUser();
};


export default prepareAdminData;
