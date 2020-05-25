import _find from 'lodash/find';
import {
  FriendActionHistory, FriendList, UserScenarios, UserCodeTesting, Scenarios, UserRobotCodeByLesson, UserRobotCode, UserCodeTutorial, UserChat, UserLesson
} from '../../lib/collections';

const NO_BOT_RELEASE = "no-bot-selected-special-value-IUYDFSW";

export default function () {
  const doAcceptFriendship = (_id, userId) => {
  // make sure I'm not the invitor
    const f = FriendList.findOne(
      { _id, userId2: userId }
    );
    if (typeof (f) !== 'undefined') {
      if (f.status === 'Friend') {
      // nothing needs to be done
      // throw new Meteor.Error("you are already friend with " + UserName2);
      } else {
        FriendList.update({
        // userId2: this.userId, userId1: _id, invitorId: _id
          _id
        }, {
          $set: {
            status: 'Friend'
          }
        });

        const createdAt = new Date();
        const hid = Meteor.uuid();
        const UserName1 = Meteor.user().username;
        FriendActionHistory.insert({
          _id: hid, fid: _id, userId, createdAt, action: `${UserName1} accepted`
        });
      }
    } else {
      throw new Meteor.Error(`no invitation found with id  ${_id}`);
    }
  };


  const doDenyFriendship = (_id, userId) => {
    const f = FriendList.findOne(_id);
    if (typeof (f) !== 'undefined') {
      if (f.userId === userId) {
      // I'm the invitor?
        throw new Meteor.Error(`can't deny one's own invitation ${_id}`);
      }

      FriendList.remove(_id);

      const UserName1 = Meteor.user().username;
      const createdAt = new Date();
      const hid = Meteor.uuid();
      FriendActionHistory.insert({
        _id: hid, fid: _id, userId, createdAt, action: `${UserName1} denied`
      });
    } else {
      throw new Meteor.Error(`no invitation found with id  ${_id}`);
    }
  };

  const doWithdrawFriendship = (_id, userId) => {
    const f = FriendList.findOne(
      { _id, userId1: userId }
    );
    if (typeof (f) !== 'undefined') {
    // nothing needs to be done
    // throw new Meteor.Error("you are already friend with " + UserName2);
      FriendList.remove({ _id });
      const createdAt = new Date();
      const hid = Meteor.uuid();
      const UserName1 = Meteor.user().username;
      FriendActionHistory.insert({
        _id: hid, fid: _id, userId, createdAt, action: `${UserName1} withdrew invitation`
      });
    } else {
      throw new Meteor.Error(`no invitation found with id  ${_id}`);
    }
  };

  const doEndFriendship = (_id, userId) => {
    const f = FriendList.findOne(_id);
    if (typeof (f) !== 'undefined') {
      if (f.status === 'Friend') {
      // nothing needs to be done
      // throw new Meteor.Error("you are already friend with " + UserName2);
        FriendList.remove(_id);
        const createdAt = new Date();
        const hid = Meteor.uuid();
        const UserName1 = Meteor.user().username;
        FriendActionHistory.insert({
          _id: hid, fid: _id, userId, createdAt, action: `${UserName1} ended friendship`
        });
      } else if (f.userId1 === userId) {
        doWithdrawFriendship(_id, userId);
      } else {
        doDenyFriendship(_id, userId);
      }
    } else {
      throw new Meteor.Error(`no invitation found with id  ${_id}`);
    }
  };


  // export default function () {
  Meteor.methods({
    // generateTournamentCode(gameId, gamesubtrack, newChg) {
    //   check(gameId, String);
    //   check(gamesubtrack, String);
    //   check(newChg, Object);

    //   UserRobotCode.update(
    //     { UserID: this.userId, gameId, SubTrackName: gamesubtrack },
    //     { $set: { CodeUpdates: [newChg] } },
    //     { upsert: true }
    //   );
    // }
  });

  Meteor.methods({
    updateUserTestName(gameId, num, v) {
      check(gameId, String);
      check(num, Number);
      check(v, String);
      const userId = Meteor.userId();
      const s = UserScenarios.findOne({ gameId, userId, ScenarioSequenceNumber: num });
      if (!s) {
        UserScenarios.insert(
          {
            gameId, userId, ScenarioSequenceNumber: num, ScenarioName: v
          }
        );
        return;
      }
      UserScenarios.update(
        { _id: s._id },
        { $set: { ScenarioName: v } }
      );
    },
    saveRobotCodeChange(gameId, chg, chatId, lintError, ScenarioID) {
      check(gameId, String);
      check(chg, Object);
      check(chatId, String);
      check(lintError, String);
      check(ScenarioID, String);
      if (chg.chg !== null) {
        // console.log(`saveRobotCodeChange this.userId ${this.userId}`);
        UserRobotCodeByLesson.update(
          { UserID: this.userId, gameId, ScenarioID },
          { $push: { CodeUpdates: chg }, $set: { lastUpdateTime: Number(new Date()) } },
          { upsert: true }
        );
      } else if (lintError === "") {
        Meteor.defer(() => {
          Meteor.call('handNewUserChatAction', chatId, "USER_CODE_UPDATE", "", lintError, (err) => {
            if (err) {
              console.log('err', err);
            }
          });
        });
      }
    }
  });

  Meteor.methods({
    saveRobotCodeChangeReset(gameId, chg, chatId, lintError, ScenarioID) {
      check(gameId, String);
      check(chg, Object);
      check(chatId, String);
      check(lintError, String);
      check(ScenarioID, String);

      UserRobotCodeByLesson.remove({ UserID: this.userId, gameId, ScenarioID });
      UserRobotCodeByLesson.update(
        { UserID: this.userId, gameId, ScenarioID },
        { $push: { CodeUpdates: chg }, $set: { lastUpdateTime: Number(new Date()) } },
        { upsert: true }
      );
    }
  });

  Meteor.methods({
    saveTestingCodeChange(gameId, scenarioId, chg) {
      check(gameId, String);
      check(scenarioId, String);
      check(chg, Object);

      // console.log("UserCodeTesting " + scenarioId + " " + JSON.stringify(chg));
      // UserCode.update({ name: codefilename },{ $push: { CodeUpdates: chg }});
      UserCodeTesting.update(
        {
          UserID: this.userId, SubTrackName: "Standard", gameId, ScenarioID: scenarioId
        },
        { $push: { CodeUpdates: chg } },
        { upsert: true }
      );
    }
  });


  Meteor.methods({
    saveTutorialCodeChange(gametrack, gamesubtrack, scenarioId, chg) {
      check(gametrack, String);
      check(gamesubtrack, String);
      check(scenarioId, String);
      check(chg, Object);

      // UserCode.update({ name: codefilename },{ $push: { CodeUpdates: chg }});
      UserCodeTutorial.update(
        {
          UserID: this.userId, TrackName: gametrack, SubTrackName: gamesubtrack, ScenarioID: scenarioId
        },
        { $push: { CodeUpdates: chg } },
        { upsert: true }
      );
    }
  });

  Meteor.methods({
    resetChat(scenarioId) {
      check(scenarioId, String);
      const c = UserChat.findOne({scenarioId, userId: this.userId});
      if (c ) {
        UserChat.remove({ scenarioId, userId: this.userId });
        return;
      }

      const ul = UserLesson.findOne({lessonId: scenarioId, userId: this.userId});
      if (ul) {
        console.log("reset user lesson for " + scenarioId + " for " + this.userId);
        UserLesson.remove({lessonId: scenarioId, userId: this.userId});
      }
    },
    removeUserTestCase(_id) {
      check(_id, String);
      const userId = this.userId;
      Scenarios.remove({
        _id, userId
      });
    },
    updateUserTestCaseName(_id, newname) {
      check(_id, String);
      check(newname, String);
      const userId = this.userId;
      Scenarios.update({
        _id, userId
      }, {
        $set: {
          ScenarioName: newname
        }
      });
    },
    updateUserTestCaseDescription(_id, newdesc) {
      check(_id, String);
      check(newdesc, String);
      const userId = this.userId;
      Scenarios.update({
        _id, userId
      }, {
        $set: {
          Description: newdesc
        }
      });
    }
  });

  Meteor.methods({
    createUserTestCase(_id, TrackName, SubTrackName, ScenarioName, Description, setupcode) {
      check(_id, String);
      check(TrackName, String);
      check(SubTrackName, String);
      check(ScenarioName, String);
      check(Description, String);
      check(setupcode, String);
      const ScenarioType = 'Testing';
      const isUserTestCase = 1;
      const CameraPosition = [-2, 200, 0.000001];
      const CameraTarget = [0, 1, 0];
      const CameraViewDirection = 'Vertical';
      const SetupScript = setupcode;
      const createdAt = new Date();
      const userId = this.userId;
      Scenarios.insert({
        _id, userId, createdAt, isUserTestCase, ScenarioType, TrackName, SubTrackName, ScenarioName, Description, CameraPosition, CameraTarget, CameraViewDirection, SetupScript
      });
    }
  });

  Meteor.methods({
    InviteAsFriend(_id, UserName2) {
      check(_id, String);
      check(UserName2, String);
      const createdAt = new Date();
      const userId = this.userId;
      const UserName1 = Meteor.user().username;

      if (_id === userId) {
        // can't invite oneself
        throw new Meteor.Error("can't invite oneself as friend");
      }

      // check if there is already pending invitation
      const f = FriendList.findOne(
        { userId1: userId, userId2: _id }
      );
      if (typeof (f) !== 'undefined') {
        if (f.status === 'Friend') {
          throw new Meteor.Error(`you are already friend with ${UserName2}`);
        } else {
          throw new Meteor.Error(`you already invited ${UserName2}`);
        }
      }

      const f2 = FriendList.findOne(
        { userId2: userId, userId1: _id }
      );
      if (typeof (f2) !== 'undefined') {
        if (f2.status === 'Friend') {
          throw new Meteor.Error(`you are already friend with ${UserName2}`);
        } else {
          throw new Meteor.Error(`you have already been invited by ${UserName2} so just need to accept invitation`);
        }
      }

      // EndTheFriendship(userId, _id);
      const fid = Meteor.uuid();
      FriendList.insert({
        _id: fid, userId1: this.userId, userId2: _id, createdAt, status: 'Pending', invitorId: this.userId, UserName1, UserName2
      });

      const hid = Meteor.uuid();
      FriendActionHistory.insert({
        _id: hid, fid, userId: this.userId, createdAt, action: `${UserName1} sent invitation`
      });
    },

    AcceptFriend(_id) {
      check(_id, String);
      doAcceptFriendship(_id, this.userId);
    },

    WithdrawFriendship(_id) {
      check(_id, String);
      doWithdrawFriendship(_id, this.userId);
    },

    EndFriendship(_id) {
      check(_id, String);
      doEndFriendship(_id, this.userId);
    },

    DenyFriendship(_id) {
      check(_id, String);
      doDenyFriendship(_id, this.userId);
    },

    setOfficialBotRelease(botId, gameId) {
      check([botId, gameId], [String]);

      if (!this.userId) throw new Meteor.Error(401, 'Please login');

      const user = Meteor.users.findOne({ _id: this.userId });

      if (!user) throw new Meteor.Error(404, 'User not found');

      let { officialBotReleases = [] } = user;

      if (officialBotReleases.find(release => release.gameId === gameId)) {
        if (botId === NO_BOT_RELEASE) {
          return Meteor.users.update(
            { _id: this.userId },
            {
              $pull: {
                officialBotReleases: {
                  gameId
                }
              }
            }
          );
        }
        return Meteor.users.update(
          { _id: this.userId, 'officialBotReleases.gameId': gameId },
          {
            $set: {
              'officialBotReleases.$.botId': botId
            }
          }
        );
      }
      return Meteor.users.update(
        { _id: this.userId },
        {
          $push: {
            officialBotReleases: {
              gameId,
              botId
            }
          }
        }
      );

      if (user.officialBotReleases && user.officialBotReleases.length > 0) {
        if (botId == NO_BOT_RELEASE) {
          const officialBotRelease = _find(user.officialBotReleases, officialBot => officialBot.gameId === gameId);
          if (officialBotRelease) {
            // need to remove it
            return Meteor.users.update({ _id: this.userId, 'officialBotReleases.gameId': gameId }, {
              $set: {
                'officialBotReleases.$.botId': botId
              }
            });
          }
        }
        const officialBotRelease = _find(user.officialBotReleases, officialBot => officialBot.gameId === gameId);
        if (officialBotRelease) {
          return Meteor.users.update({ _id: this.userId, 'officialBotReleases.gameId': gameId }, {
            $set: {
              'officialBotReleases.$.botId': botId
            }
          });
        }
        officialBotReleases = [...user.officialBotReleases];
      }

      officialBotReleases.push({ gameId, botId });
      return Meteor.users.update({ _id: this.userId }, {
        $set: {
          officialBotReleases
        }
      });
    }

  });
}
