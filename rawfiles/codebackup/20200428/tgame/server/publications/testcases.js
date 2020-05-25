import { TournamentMatch, FriendList, UserRobotCode, UserCodeTutorial, UserCodeTesting, Scenarios, WorldConfig, UserRobotCodeByLesson, UserTest, UserFactoryCode } from '../../lib/collections';

Meteor.publish('testcases.list', function(TrackName) {
  check(TrackName, String);
  // const ScenarioType = "Testing";
  if (!this.userId) {
    throw new Meteor.Error('userId is not defined');
  }
  const userIdList = ['system', this.userId];

  const selector = { TrackName, userId: { $in: userIdList } };
  // console.log(`publishing testcases.list ${TrackName}`);
  const options = {
    //   fields: {SetupScript: 0},
    fields: { ScenarioName: 1, userId: 1, package: 1, ScenarioSequenceNumber: 1, Difficulty: 1 }
    // sort: {createdAt: -1},
    // limit: 10
  };

  return Scenarios.find(selector, options);
});

Meteor.publish('testcases.one', function(id) {
  check(id, String);
  const selector = { _id: id };
  return Scenarios.findOne(selector);
});


Meteor.publish('worldconfig', function() {
  // check(track, String);
  // check(subtrack, String);
  // const selector = {TrackName: track, SubTrackName: subtrack};
  const options = {
    // fields: {_id: 1, title: 1},
    // sort: {createdAt: -1},
    // limit: 10
  };

  return WorldConfig.find();
});


Meteor.publish('UserCodeForTesting', function(scenarioID, uid) {
  check(scenarioID, String);
  // return CodeList.find({userId: this.userId, "gametrack": gametrack});
  // if (this.userId) {
  //   // console.log(`publishing UserCodeByID: ${scenarioID}`);
  // }
  check(uid, String);

  const userId = uid == ""? this.userId : uid;

  return UserCodeTesting.find({ UserID: userId, ScenarioID: scenarioID });
  // return this.ready();
});

Meteor.publish('UserRobotCode', function(gameId, gamesubtrack, uid) {
  check(gameId, String);
  check(gamesubtrack, String);
  check(uid, String);

  const userId = (uid == "" || typeof(uid) == "undefined") ? this.userId : uid;
  return UserRobotCode.find({ UserID: userId, gameId });
  // return this.ready();
});

Meteor.publish('UserRobotCodeByLesson', function(gameId, gamesubtrack, uid) {
  check(gameId, String);
  check(gamesubtrack, String);
  // check(uid, String);
  check(uid, Match.Optional(Match.OneOf(String, undefined)))
  // check(ScenarioID, String);


  const userId = (uid == "" || typeof(uid) == "undefined") ? this.userId : uid;
  return UserRobotCodeByLesson.find({ UserID: userId, gameId });
  // return this.ready();
});


Meteor.publish('userTestsByGame', function(gameId) {
  check(gameId, String);
  return UserTest.find({ userId: this.userId, gameId });
});

Meteor.publish('userFactoryCodeByGame', function(gameId) {
  check(gameId, String);
  return UserFactoryCode.find({ userId: this.userId, gameId });
});


//   Meteor.publish('UserRobotCodeByMatch', function(gametrack, gamesubtrack, matchId) {
//     check(gametrack, String);
//     check(gamesubtrack, String);
//     check(matchId, String);
//     //return CodeList.find({userId: this.userId, "gametrack": gametrack});
//     if (this.userId) {
//       // console.log("publishing UserRobotCodeByMatch: " + gametrack + " " + matchId);

//       const m = TournamentMatch.findOne({_id: matchId});

//       var idList = [this.userId];

//       if ( m.userId1 == this.userId && m.userId2 != this.userId ) {
//         idList.push(m.userId2);
//       }
//       if ( m.userId2 == this.userId && m.userId1 != this.userId ) {
//         idList.push(m.userId1);
//       }

//       if ( idList.length > 1 ) {
//         const f = FriendList.findOne(
//           {
//             $or: [
//               {
//                 $and: [
//                   {userId1: idList[0]},{userId2: idList[1]}
//                 ]
//               },
//               {
//                 $and: [
//                   {userId1: idList[1]},{userId2: idList[0]}
//                 ]
//               }
//             ]
//           }
//         );

//         if ( !f || f.status != "Friend" ) {
//           throw new Meteor.Error("no friendship between users");
//         }
//       }
//       return UserRobotCode.find({UserID: {$in: idList}, TrackName:gametrack,SubTrackName: gamesubtrack});
//     }
//     return this.ready();
//   });

//   Meteor.publish('UserCodeForTutorial', function(scenarioID) {
//     check(scenarioID, String);
//     //return CodeList.find({userId: this.userId, "gametrack": gametrack});
//     if (this.userId) {
//       //// console.log("publishing UserRobotCode: " + gametrack);
//       return UserCodeTutorial.find({UserID: this.userId, ScenarioID: scenarioID});
//     }
//     return this.ready();
//   });

//   Meteor.publish(null, function () {
//     return Meteor.roles.find({});
//   });
