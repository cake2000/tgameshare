import _find from 'lodash/find';
import {
  UserScratchAIFile, FriendActionHistory, FriendList, UserScenarios, UserCodeTesting, Scenarios, UserRobotCodeByLesson, UserRobotCode, UserCodeTutorial, UserChat, UserLesson, UserTest, UserFactoryCode
} from '../../lib/collections';
import { MIGRATION_CONST } from '../../lib/enum';

const NO_BOT_RELEASE = "no-bot-selected-special-value-IUYDFSW";

export default function () {
  
  Meteor.methods({

    checkOpponentRKey(gameId, username, skey) {
      check(gameId, String);
      check(username, String);
      check(skey, String);

      const ai = UserScratchAIFile.findOne(
        {
          username, gameId, key: skey
        }
      );

      if (!ai) {
        throw new Meteor.Error(1234, "Can't find the AI for user '" + username + "' with key '" + skey + "'.", "Can't find the AI for that user name with that secret key.");
      } else {
        return [ai.rkey, ai.UserID];
      }

    },

    saveUserScratchAIFile(gameId, name, skey, nickname, newCode) {
      check(gameId, String);
      check(name, String);
      check(nickname, String);
      check(skey, String);
      check(newCode, String);

      try {
        const user = Meteor.users.findOne(this.userId);

        const existing = UserScratchAIFile.findOne({username: nickname, gameId});
        if (existing) {
          console.log("existing " + JSON.stringify(existing.UserID));
          console.log("this userid " + this.userId);
          if (existing && existing.UserID != this.userId ) {
            throw new Meteor.Error(1233, "This nickname is already used by some other player.")
          }
        }

        
  
        UserScratchAIFile.update(
          {
            UserID: this.userId, gameId
          },
          { $set: { username: nickname, useremail: user.emails[0].address, filename: nickname, key: skey, rkey: (""+Math.random()).substr(2, 10), data: newCode, asOfTime: new Date() } },
          {upsert: true}
        );
      } catch (e) {
        let err = e.message;
        console.log(err);
        throw e;
      }
    },

    createUserCodeForFactory(gameId) {
      check(gameId, String);

      let newCode = `
function getBreakShot() {
  return {
    aimx: 0, aimy: 0, strength: 80
  };
} 

function getCallShot() {
  return {
    aimx: -66, aimy: -154, strength: 30
  };
}
            `;
      
            if (gameId == MIGRATION_CONST.tankGameId) {
              newCode = `
function getNewCommand() {
  return "S";
}
              `;
            }
            
            if (gameId == MIGRATION_CONST.canvasGameId) {
              newCode = `
function run() {
  printText("start!");
  DrawCircle(100, 50, 30, "#ff0000", 4, "#00ff00");
}
              `;
            }

            if (gameId === MIGRATION_CONST.algorithmGameId) {
              newCode = `
function run() {
  printText("Hello World!");
}
              `;
            }
      UserFactoryCode.insert(
        {
          userId: this.userId, gameId, code: newCode, asOfTime: new Date()
        }
      );
    },

    saveUserCodeForFactory(gameId, newCode) {
      check(gameId, String);
      check(newCode, String);

      UserFactoryCode.update(
        {
          userId: this.userId, gameId
        },
        { $set: { code: newCode, asOfTime: new Date() } },
      );
    },

    createUserTestScriptForFactory(gameId, testSeq, testName) {
      check(gameId, String);
      check(testSeq, Number);
      check(testName, String);

      let newScript = `
ResetTable(true);
PlaceBallOnTable(0, -200, -80);
PlaceBallOnTable(2, -50, -200);
PlaceBallOnTable(3, -450, -300);
PlaceBallOnTable(4, 0, 0);
TakeCallShot();
await WaitForAllBallStop();
ExpectBallPocketed(2, 1);
ReportEndOfTest();
            `;
      
            if (gameId == MIGRATION_CONST.tankGameId) {
              newScript = `
ClearMaze();
RemoveAllTanks();

PlaceTank('blue', 7, 12);
PlaceTank('white', 7, 3, false);
PlaceTank('white', 7, 6, false);
PlaceTank('white', 10, 4, false);
await SetupTickUpdates(600);
ExpectNumberOfWhiteTanksKilled(2);
ReportEndOfTest();
              `;
            }      
console.log("try new script " + gameId);
            if (gameId == MIGRATION_CONST.canvasGameId) {
              console.log("set new canvas script ");
  newScript = `
ClearOutput(false);
CallRun();
ReportEndOfTest();  
  `;
            }

            if (gameId === MIGRATION_CONST.algorithmGameId) {
  newScript = `
ClearOutput(false);
CallRun();
ReportEndOfTest();  
  `;
            }

      UserTest.insert(
        {
          userId: this.userId, gameId, testName, testSeq, script: newScript, asOfTime: new Date()
        }
      );
    },

    saveUserTestScriptForFactory(gameId, testSeq, newScript) {
      check(gameId, String);
      check(testSeq, Number);
      check(newScript, String);

      UserTest.update(
        {
          userId: this.userId, gameId, testSeq
        },
        { $set: { script: newScript, asOfTime: new Date() } },
      );
    },

    updateFactoryTestName(gameId, testSeq, newName) {
      check(gameId, String);
      check(testSeq, Number);
      check(newName, String);

      const currentTest = UserTest.findOne({userId: this.userId, gameId, testSeq});
      if (currentTest) {
        if (newName == "") {
          UserTest.update(
            {
              userId: this.userId, gameId, testSeq
            },
            { $set: { testName: newName, asOfTime: new Date(), testResult: "" } },
          );

          UserFactoryCode.update(
            {
              userId: this.userId, gameId
            },
            {
              $set: {
                currentFactoryTestSeq: 0
              }
            }
          );
  
        } else {
          UserTest.update(
            {
              userId: this.userId, gameId, testSeq
            },
            { $set: { testName: newName, asOfTime: new Date() } },
          );
  
        }
      } else if (newName != "") {
        // need to insert new test 
        Meteor.call('createUserTestScriptForFactory', gameId, testSeq, newName);        
      }

    },

    resetAllUserTestResult(gameId) {
      check(gameId, String);

      UserTest.update(
        {
          userId: this.userId, gameId
        },
        {
          $set: {
            testResult: "None"
          }
        },
        { multi: 1 }
      );
    },


    resetAndSetCurrentTest(gameId, testSeq) {
      check(gameId, String);
      check(testSeq, Number);

      UserTest.update(
        {
          userId: this.userId, gameId, testSeq
        },
        {
          $set: {
            testResult: "None"
          }
        }
      );

      UserFactoryCode.update(
        {
          userId: this.userId, gameId
        },
        {
          $set: {
            currentFactoryTestSeq: testSeq
          }
        }
      );
    },

    resetUserTestResult(gameId, testSeq) {
      check(gameId, String);
      check(testSeq, Number);

      UserTest.update(
        {
          userId: this.userId, gameId, testSeq
        },
        {
          $set: {
            testResult: "None"
          }
        }
      );
    },

    recordUserTestResult(gameId, testSeq, testResult) {
      check(gameId, String);
      check(testSeq, Number);
      check(testResult, String);

      // console.log("recordUserTestResult " + gameId + " " + testSeq);

      UserTest.update(
        {
          userId: this.userId, gameId, testSeq
        },
        {
          $set: {
            testResult
          }
        }
      );
    },

    updateUserCurrentTest(gameId, testSeq) {
      check(gameId, String);
      check(testSeq, Number);

      console.log("updateUserCurrentTest " + gameId + " " + testSeq);

      UserFactoryCode.update(
        {
          userId: this.userId, gameId
        },
        {
          $set: {
            currentFactoryTestSeq: testSeq
          }
        }
      );
    },
  });




}
