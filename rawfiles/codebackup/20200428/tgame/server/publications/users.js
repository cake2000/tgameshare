import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _reduce from 'lodash/reduce';
import _uniq from 'lodash/uniq';
import {
  Notifications, ParentEmail, GameRoom, Classes, Persons,
  Scenarios,
  Lessons,
  ChallengeHistory,
  UserTest,
  UserScratchAIFile
} from '../../lib/collections';
import {
  COINS_WAGER, LEVELS, USER_TYPES, MIGRATION_CONST, CHALLENGE_HISTORY_LENGTH, PAYMENT_PRO, PAYMENT_FREE
} from '../../lib/enum';

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

export default function () {
  Meteor.publish('users.all', () => {
    return Meteor.users.find();
  });
  Meteor.publish('usersGetUserData', function () {
    if (!this.userId) {
      return this.ready();
    }
    return Meteor.users.find(this.userId);
  });

  Meteor.publish('countdownTournament', function (gameRoomId, checkUserStatus, roundId) {
    check([gameRoomId, roundId], [String]);
    check(checkUserStatus, Boolean);
    let intervalId1;
    let intervalId2;
    const handle = Meteor.users.find({ _id: this.userId }).observe({
      added: (newDocument) => {
        if (checkUserStatus === false) {
          let count = Notifications.findOne({ entityId: roundId }).actionOnEntity.countdown;

          // console.log("dddd checkUserStatus false count is " + count + " gameRoomId " + gameRoomId);

          this.added('countdown', gameRoomId, { count });

          intervalId1 = Meteor.setInterval(() => {
            count -= 1;
            // console.log("dddd checkUserStatus false new count is " + count + " gameRoomId " + gameRoomId);
            this.changed('countdown', gameRoomId, { count });

            if (count === 0) {
              this.changed('countdown', gameRoomId, { count });
              Meteor.clearInterval(intervalId1);
              // Meteor.call('gameRoom.autoClearInvite', gameRoomId, this.userId);
            }
          }, 1000);
        } else {
          let countdownStartGame = 5;

          this.added('countdown', gameRoomId, { countdownStartGame });

          intervalId2 = Meteor.setInterval(() => {
            countdownStartGame -= 1;
            console.log(`dddd 2 checkUserStatus false new countdownStartGame is ${countdownStartGame} gameRoomId ${gameRoomId}`);
            this.changed('countdown', gameRoomId, { countdownStartGame });

            if (countdownStartGame === 0) {
              this.changed('countdown', gameRoomId, { countdownStartGame });
              Meteor.clearInterval(intervalId1);
              // Meteor.call('gameRoom.autoClearInvite', gameRoomId, this.userId);
            }
          }, 1000);
        }
      }
    });

    this.ready();
    this.onStop(() => {
      Meteor.clearInterval(intervalId1);
      Meteor.clearInterval(intervalId2);
      handle.stop();
    });
  });


  Meteor.publish('users.statusOnline', () => Meteor.users.find({ 'status.online': true, inRoom: { $exists: false } }));

  Meteor.publish('users.getUsersInviteNoCoins', () => {
    return Meteor.users.find(
      {},
      {
        fields: {
          _id: 1,
          username: 1,
          inGame: 1,
          inRoom: 1,
          'status.online': 1,
          userInPage: 1
        }
      }
    );
  });

  Meteor.publish('users.getUsersInvite', (gameRoomId) => {
    check(gameRoomId, String);

    const gameRoom = GameRoom.findOne({ _id: gameRoomId });
    let coins = 0;
    let accountType = {};

    if (gameRoom) {
      switch (gameRoom.level) {
        case LEVELS.BEGINNER:
          coins = COINS_WAGER.BEGINNER;
          accountType = { $in: [...PAYMENT_PRO, ...PAYMENT_FREE] };
          break;
        case LEVELS.ADVANCED:
          coins = COINS_WAGER.ADVANCED;
          accountType = { $in: PAYMENT_PRO };
          break;
        default:
          accountType = { $in: [...PAYMENT_PRO, ...PAYMENT_FREE] };
          break;
      }
    }

    return Meteor.users.find(
      {
        'status.online': true,
        'profile.coins': { $gte: coins },
        accountType
      },
      {
        fields: {
          username: 1, inGame: 1, inRoom: 1, 'status.online': 1, profile: 1, avatar: 1, userInPage: 1, accountType: 1
        }
      }
    );
  });

  Meteor.publish('users.getUsersInviteHistory', () => {
    return Meteor.users.find({ 'status.online': true },
      {
        fields: {
          _id: 1, username: 1, inGame: 1, inRoom: 1, 'status.online': 1, userInPage: 1
        }
      });
  });

  Meteor.publish('users.register', (userIds) => {
    check(userIds, [String]);
    return Meteor.users.find({ _id: { $in: userIds } },
      { fields: { username: 1, profile: 1, playGames: 1 } });
  });

  Meteor.publish('parentEmailCheckEmail', (email) => {
    check(email, String);
    return ParentEmail.find({ email });
  });

  Meteor.publish('userGetAvatar', (userIds) => {
    check(userIds, [String]);

    return Meteor.users.find({ _id: { $in: userIds } }, { fields: { username: 1, avatar: 1, profile: 1 } });
  });

  Meteor.publish('users.getUserName', (userId) => {
    check(userId, String);
    return userId && Meteor.users.find({ _id: userId }, {
      fields: {
        username: 1
      }
    });
  });

  Meteor.publish('users.getProfileUser', function getProfileUser(userId) {
    if (!userId) this.ready();
    check(userId, String);
    if (!userId) {
      throw new Meteor.Error('user has not logged in');
    }

    return Meteor.users.find({ _id: userId }, {
      fields: {
        avatar: 1,
        profile: 1,
        playGames: 1,
        personId: 1
      }
    });
  });

  Meteor.publish('users.getProfileUserChallenge', function getProfileUserChallenge(userId) {
    if (!userId) this.ready();
    check(userId, String);

    const challengeHistoryCursor = ChallengeHistory.find({
      $or: [
        { 'challenger._id': userId },
        { 'defender._id': userId }
      ]
    }, {
      sort: { createdAt: -1 },
      limit: CHALLENGE_HISTORY_LENGTH
    });
    const userIds = _uniq(_reduce(challengeHistoryCursor.fetch(), (memo, c) => [...memo, c.challenger._id, c.defender._id], [userId]));

    return [
      Meteor.users.find({ _id: { $in: userIds } }, {
        fields: {
          avatar: 1,
          username: 1,
          'profile.coins': 1,
          'profile.practiceGamesCount': 1,
          'profile.onlineBattleCount': 1,
          'profile.battleWonCount': 1
        }
      }),
      challengeHistoryCursor
    ];
  });

  Meteor.publish('users.teacherList', (inClasses) => {
    check(inClasses, Array);
    const personListCursor = Persons.find(
      {
        type: USER_TYPES.TEACHER
      },
      {
        fields: {
          userId: 1,
          type: 1,
          teacherProfile: 1
        }
      }
    );
    const teacherIds = personListCursor.map(person => person.userId);
    const teacherListCursor = Meteor.users.find(
      {
        _id: { $in: teacherIds }
      },
      {
        fields: {
          profile: 1, username: 1
        }
      }
    );
    const classesListCursor = Classes.find(
      {
        $or: [
          {
            _id: { $in: inClasses }
          }
        ]
      }
    );
    return [
      personListCursor,
      teacherListCursor,
      classesListCursor
    ];
  });

  Meteor.publish('users.getListStudents', (userIds) => {
    check(userIds, Array);

    return Meteor.users.find(
      {
        _id: { $in: userIds }
      },
      {
        fields: {
          username: 1,
          'tutorial.id': 1,
          'tutorial.progress': 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
          'profile.coins': 1,
          'profile.grade': 1,
          'emails': 1,
          'profile.inClasses': 1,
          'profile.allowFastForward': 1
        }
      }
    );
  });

  Meteor.publish('allmystudents', () => {
    const classes = Classes.find({ owner: this.userId });
    var allstudents = [];
    classes.forEach(e => {
      allstudents = allstudents.concat(e.users);
    });
    allstudents = allstudents.filter( onlyUnique );

    return Meteor.users.find(
      {
        _id: { $in: allstudents }
      },
      {
        fields: {
          username: 1,
          'emails': 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
        }
      }
    );
  });

  Meteor.publish('allmybattlestudents', () => {
    const classes = Classes.find({ owner: this.userId });
    var allstudents = [];
    classes.forEach(e => {
      allstudents = allstudents.concat(e.users);
    });
    allstudents = allstudents.filter( onlyUnique );

    return Meteor.users.find(
      {
        _id: { $in: allstudents }
      },
      {
        fields: {
          username: 1,
          'emails': 1,
          'username': 1,
        }
      }
    );
  });

  Meteor.publish('allmystudentswithbattlecode', () => {
    const classes = Classes.find({ owner: this.userId });
    var allstudents = [];
    classes.forEach(e => {
      allstudents = allstudents.concat(e.users);
    });
    allstudents = allstudents.filter( onlyUnique );
    // console.log(allstudents);

    return UserScratchAIFile.find(  
      {
        UserID: { $in: allstudents }
      }, {
        fields: { UserID: 1 }
      }
    ); 
    
    // allstudents = allstudents.filter(s => ids.includes(s));

    // return Meteor.users.find(
    //   {
    //     _id: { $in: allstudents }
    //   },
    //   {
    //     fields: {
    //       username: 1,
    //       'emails': 1,
    //       'username': 1,
    //     }
    //   }
    // );


    // if (allstudents.includes(players[0]) && allstudents.includes(players[1]) ) {
    //   return UserScratchAIFile.find(
    //     {
    //       UserID: { $in: players }
    //     }, {
    //       fields: { UserID: 1, username: 1, data: 1 }
    //     }
    //   );  
    // }
  });

  Meteor.publish('allmybattlestudentscode', (gameId, players) => {
    check(gameId, String);
    check(players, Array);
    const classes = Classes.find({ owner: this.userId });
    var allstudents = [];
    classes.forEach(e => {
      allstudents = allstudents.concat(e.users);
    });
    allstudents = allstudents.filter( onlyUnique );
    if (allstudents.includes(players[0]) && allstudents.includes(players[1]) ) {
      return UserScratchAIFile.find(
        {
          UserID: { $in: players }, gameId
        }, {
          fields: { UserID: 1, username: 1, data: 1 }
        }
      );  
    }
  });


  Meteor.publish('allmybattlestudentscode2', (gameId, info) => {
    check(gameId, String);
    check(info, Array);

    const players = [Meteor.userId(), info[0]];
    console.log("look for AI in players " + players);
    return UserScratchAIFile.find(
      {
        UserID: { $in: players }, gameId
      }, {
        fields: { UserID: 1, username: 1, data: 1 }
      }
    );  

    // return UserScratchAIFile.find(
    //   {
    //     $or: [
    //       { 
    //         UserID: this.userId 
    //       }, 
    //       {UserID: info[0], rkey: info[1] } ]
    //   }
    // );  
  });

  Meteor.publish('users.getTutorial', function() {
    if (!this.userId) return this.ready();
    return Meteor.users.find({ _id: this.userId }, { fields: { tutorial: 1 } });
  });

  Meteor.publish('users.getUserTest', function() {
    if (!this.userId) return this.ready();
    return UserTest.find({ userId: this.userId });
  });


  Meteor.publish('users.getLessonsAndCourses', function () {
    if (!this.userId) return this.ready();

    // We need to count how many starter/intermediate courses in dbs
    // to calculate the percent which user has been completed.
    const gameIds = [
      MIGRATION_CONST.poolGameId, 
      MIGRATION_CONST.canvasGameId, 
      MIGRATION_CONST.algorithmGameId, 
      MIGRATION_CONST.tankGameId, 
      MIGRATION_CONST.scratchGameId, 
      MIGRATION_CONST.flappybirdGameId, 
      MIGRATION_CONST.scratchSoccerGameId, 
      MIGRATION_CONST.drawingturtleGameId, 
      // MIGRATION_CONST.ia_k_turtleGameId, 
      MIGRATION_CONST.tankscratch2GameId, 
      MIGRATION_CONST.generalconceptsGameId, 
      MIGRATION_CONST.candycrushGameId,
      MIGRATION_CONST.appleharvestGameId,
      MIGRATION_CONST.recyclerGameId,
      MIGRATION_CONST.algoScratchGameId,
      MIGRATION_CONST.schoolAGameId,
      MIGRATION_CONST.schoolAGameCHId,
      MIGRATION_CONST.schoolBGameId,
      MIGRATION_CONST.schoolBGameCHId,
      MIGRATION_CONST.mazeGameId,
      MIGRATION_CONST.balloonBusterGameId
    ];
    return [
      Scenarios.find({ gameId: { $in: gameIds } }, {
        fields: {
          package: 1, // starter or intermediate
          ScenarioName: 1,
          ScenarioSequenceNumber: 1,
          group: 1,
          gameId: 1
        }
      }),
      Lessons.find({ gameId: { $in: gameIds } }, {
        // $fields: {
        //   package: 1,
        //   gameId: 1,
        //   LessonName: 1,
        //   LessonSequenceNumber: 1
        // }
      })
    ];
  });

  Meteor.publish('users.getStudentsInfo', function (userIds) {
    if (!this.userId) return this.ready();
    check(userIds, Match.Maybe([String]));

    return Meteor.users.find({ _id: { $in: userIds } }, {
      fields: {
        username: 1,
        emails: 1,
        profile: 1
      }
    });
  });
}
