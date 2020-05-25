import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FriendActionHistory, FriendList, Tournament, TournamentMatch, TournamentMatchRecording, RatingUpdateRun, TournamentSection, TournamentRound } from '../../lib/collections';

export default function () {
  Meteor.publish('tournament.list', (gameId) => {
    check(gameId, Match.Maybe(String));

    return Tournament.find({ gameId });
  });

  Meteor.publish('tournament.items', (tournamentIds) => {
    check(tournamentIds, String);
    return Tournament.find(
      { _id: tournamentIds },
      { fields: { Name: 1 } }
    );
  });

  Meteor.publish('tournament.fromSectionId', (sectionId) => {
    check(sectionId, String);
    const tournamentSection = TournamentSection.findOne({ _id: sectionId }, {
      fields: {
        tournamentId: 1,
      }
    });
    if (!tournamentSection) return null;
    return Tournament.find({
      _id: tournamentSection.tournamentId,
    }, {
      fields: {
        Name: 1,
      }
    });
  });

  Meteor.publish('tournamentSection.users', (tournamentId) => {
    check(tournamentId, String);
    return TournamentSection.find({ tournamentId }, {
      fields: { type: 1, registeredUserIds: 1 }
    });
  });

  Meteor.publish('tournamentSection.item', (sectionId) => {
    check(sectionId, String);
    return TournamentSection.find({ _id: sectionId }, {
      fields: {
        name: 1,
        type: 1,
        registeredUserIds: 1,
        numberOfRounds: 1,
        currentRound: 1,
        status: 1,
        reward: 1,
        startTime: 1,
        playerGradeLowerBound: 1,
        playerGradeUpperBound: 1,
        zipCode: 1,
        tournamentId: 1,
        announcement: 1,
      }
    });
  });

  Meteor.publish('tournamentSection.data', (sectionId) => {
    check(sectionId, String);
    return TournamentSection.find({ _id: sectionId }, {
      fields: { currentRound: 1, tournamentId: 1, name: 1 }
    });
  });

  Meteor.publish('tournamentSection.list', (tournamentId) => {
    check(tournamentId, String);
    return TournamentSection.find({ tournamentId }, {
      fields: {
        type: 1,
        name: 1,
        tournamentId: 1,
        startTime: 1,
        playerRatingLowerBound: 1,
        playerRatingUpperBound: 1,
        playerGradeLowerBound: 1,
        playerGradeUpperBound: 1,
        registeredUserIds: 1,
        status: 1,
        currentRound: 1,
        numberOfRounds: 1,
      }
    });
  });

  Meteor.publish('tournamentSection.all', () => {
    return TournamentSection.find();
  });

  Meteor.publish('tournamentRound.item', (sectionId) => {
    check(sectionId, String);
    return TournamentRound.find({ sectionId });
  });

  Meteor.publish('tournamentRoundFindByRoundIds', (roundIds) => {
    check(roundIds, Array);
    return TournamentRound.find({ _id: { $in: roundIds } });
  });
  Meteor.publish('tournamentRoundFindByRoundId', (roundId) => {
    check(roundId, String);
    return TournamentRound.find({ _id: roundId });
  });

  Meteor.publish('tournamentmatchbyuser', (TrackName, SubTrackName, userId) => {
    check(TrackName, String);
    check(SubTrackName, String);
    check(userId, String);
    const selector = {
      $and: [
        { TrackName },
        { SubTrackName },
        {
          $or: [
            { userId1: userId },
            { userId2: userId }
          ]
        }
      ],
    };
    // console.log(`publishing tournamentmatchbyuser for ${TrackName} ${SubTrackName} for userId ${userId}`);
    const options = {
      fields: { Recording: 0 },
      sort: { createdAt: -1 }
      // limit: 10
    };

    return TournamentMatch.find(selector, options);
  });


  Meteor.publish('ratingupdaterunforuser', (TrackName, SubTrackName, userId) => {
    check(TrackName, String);
    check(SubTrackName, String);
    check(userId, String);

    const selector = {
      TrackName,
      SubTrackName,
      userId
    };
    // console.log(`publishing ratingupdaterunforuser for ${TrackName} ${SubTrackName} for userId ${userId}`);
    const options = {
      fields: { matchList: 0 },
      sort: { createdAt: -1 }
      // limit: 10
    };

    return RatingUpdateRun.find(selector, options);
  });


  Meteor.publish('userprofileinfo', (userId) => {
    check(userId, String);
    // console.log(`publishing userprofileinfo ${userId}`);
    return Meteor.users.find({ _id: userId }, { fields: { 'profile.firstName': 1, 'profile.lastName': 1, 'profile.Pool.Standard': 1 } });
  });


  Meteor.publish('mypendingfriendlist', function () {
    // console.log('publish mypendingfriendlist');
    const userId = this.userId;
    return FriendList.find(
      {
        status: 'Pending',
        $or: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    );
  });

  Meteor.publish('myfriendlist', function () {
    // console.log('publish myfriendlist');
    const userId = this.userId;
    return FriendList.find(
      {
        status: 'Friend',
        $or: [
          { userId1: userId },
          { userId2: userId }
        ]
      }
    );
  });

  Meteor.publish('myfrienduserinfo', function () {
    // console.log('publish myfrienduserinfo');
    const userId = this.userId;
    const myFriendIdList = FriendList.find(
      {
        $and: [
          {
            status: {
              $in: ['Friend', 'Pending']
            }
          },
          {
            $or: [
              { userId1: userId },
              { userId2: userId }
            ]
          }
        ]
      }, { userId1: 1, userId2: 1 }
    ).fetch();

    const friendIdList = [];
    myFriendIdList.forEach((x) => {
      friendIdList.push(x.userId1);
      friendIdList.push(x.userId2);
    });

    return Meteor.users.find({ _id: { $in: myFriendIdList } }, { fields: { 'profile.firstName': 1, 'profile.lastName': 1, 'profile.username': 1 } });
  });


  Meteor.publish('myFriendActionHistory', (fidList) => {
    check(fidList, [String]);
    // console.log('publish myFriendActionHistory');

    return FriendActionHistory.find(
      {
        fid: { $in: fidList }
      }
    );
  });

  // Meteor.publish('usersearch', function (UserName, FirstName, LastName, ratingMin, ratingMax) {
  Meteor.publish('usersearch', function (UserName, FirstName, LastName) {
    check(UserName, String);
    check(FirstName, String);
    check(LastName, String);
    // check(ratingMin, Number);
    // check(ratingMax, Number);

    // console.log(`usersearch for ${UserName} ${FirstName} ${LastName}`);
    const selector = {
      $and: [
        { 'profile.userName': { $regex: new RegExp(UserName, 'i') } },
        { 'profile.firstName': { $regex: new RegExp(FirstName, 'i') } },
        { 'profile.lastName': { $regex: new RegExp(LastName, 'i') } },
        // {'profile.Pool.Standard.Rating': {$gte: ratingMin}},
        // {'profile.Pool.Standard.Rating': {$lte: ratingMax}},
        { _id: { $ne: this.userId } }
      ],
    };

    return Meteor.users.find(selector, {/* limit: 1,*/ fields: { createdAt: 1, 'profile.userName': 1, 'profile.firstName': 1, 'profile.lastName': 1, 'profile.Rating': 1 } });
  });

  Meteor.publish('onetournamentbyid', (_id) => {
    check(_id, String);
    const selector = { _id };
    // console.log(`publishing onetournamentbyid ${_id}`);
    return Tournament.find(selector);
  });

  Meteor.publish('tournaments.list', (TrackName, SubTrackName) => {
    check(TrackName, String);
    check(SubTrackName, String);
    const selector = { TrackName, SubTrackName };
    // console.log(`publishing tournaments.list ${TrackName} ${SubTrackName}`);
    const options = {
      // fields: {_id: 1, title: 1},
      sort: { createdAt: -1 }
      // limit: 10
    };

    return Tournament.find(selector, options);
  });


  Meteor.publish('tournamentmatchbytournamentId', (tournamentId) => {
    check(tournamentId, String);
    // console.log(`publishing match for tournament  ${tournamentId}`);

    const options = {
      fields: { Records: 0, KeyMoves: 0 },
      // sort: {createdAt: -1},
      // limit: 10
    };

    return TournamentMatch.find({ tournamentId }, options);
  });

  Meteor.publish('tournamentmatchrecordingbyid', (matchId) => {
    check(matchId, String);
    const selector = { _id: matchId };
    // console.log(`publishing match recording ${matchId}`);
    // const options = {
    // fields: {_id: 1, title: 1},
    // sort: {createdAt: -1},
    // limit: 10
    // };

    return TournamentMatchRecording.find(selector);
  });


  Meteor.publish('mytournamentmatchbyid', function (matchId) {
    check(matchId, String);
    // console.log(`publishing match ${matchId}`);

    const userId = this.userId;

    const selector = {
      $and: [
        { _id: matchId },
        {
          $or: [
            { userId1: userId },
            { userId2: userId }
          ]
        }
      ],
    };

    // const options = {
    // fields: {_id: 1, title: 1},
    // sort: {createdAt: -1},
    // limit: 10
    // };

    return TournamentMatch.find(selector);
  });
}
