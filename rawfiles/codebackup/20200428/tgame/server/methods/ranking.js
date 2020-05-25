/* eslint object-shorthand: [2, "consistent"] */
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';
import { check, Match } from 'meteor/check';
import _ from 'lodash';
import {
  ZipCode, UserAICodeProd, GameRoom, ActiveGameList, Games
} from '../../lib/collections';
import {
  MIGRATION_CONST, LEVELS, OPPONENTS, GAME_CONFIG_OPTION, SLOT_OPTION, GAME_TYPE, COINS_FEE
} from '../../lib/enum';
import { getDetailItemsForUserId } from '../../lib/util';
import { MESSAGES } from '../../lib/const';

const NO_BOT_RELEASE = "no-bot-selected-special-value-IUYDFSW";

const buildBasePipeline = (aiUserIds, gameId, school) => {
  const $match = {
    _id: { $in: aiUserIds },
  };

  if (school && school !== 'All') {
    $match['profile.school'] = school;
  }
  return [
    { $match },
    {
      $project: {
        profile: 1,
        username: 1,
        playGames: {
          $filter: {
            input: "$playGames",
            as: "playGame",
            cond: { $eq: ['$$playGame.gameId', gameId] }
          }
        },
        officialBotReleases: {
          $filter: {
            input: "$officialBotReleases",
            as: "officialBotRelease",
            cond: { $eq: ['$$officialBotRelease.gameId', gameId] }
          }
        }
      }
    },
    { $unwind: '$playGames' },
    { $unwind: '$officialBotReleases' },
    {
      $group: {
        _id: "$_id",
        rating: { $first: "$playGames.rating" },
        coins: { $first: "$profile.coins" },
        firstName: { $first: "$profile.firstName" },
        lastName: { $first: "$profile.lastName" },
        username: { $first: "$username" },
        officialBattleCount: { $first: "$profile.officialBattleCount" },
        officialBattleWonCount: { $first: "$profile.officialBattleWonCount" }
      }
    },
    { $sort: { rating: -1, coins: -1 } }
  ];
};

const makeRankingNumberPipeline = [
  {
    $group: {
      _id: { rating: '$rating', coins: '$coins' },
      players: {
        $push: {
          _id: "$_id",
          rating: "$rating",
          coins: "$coins",
          firstName: "$firstName",
          lastName: "$lastName",
          username: "$username",
          officialBattleCount: "$officialBattleCount",
          officialBattleWonCount: "$officialBattleWonCount"
        }
      }
    }
  },
  { $sort: { '_id.rating': -1, '_id.coins': -1 } },
  {
    $group: {
      _id: false,
      hits: {
        $push: {
          rating: "$_id.rating",
          coins: "$_id.coins",
          players: "$players"
        }
      }
    }
  },
  {
    $unwind: {
      path: "$hits",
      includeArrayIndex: "rankingNumber"
    }
  }
];

function buildPipelineUserRankingInGame(aiUserIds, gameId, userId, userRating) {
  const numberOfHigherOrEqualRatingPlayers = Meteor.users.find({ 'playGames.gameId': gameId, 'playGames.rating': { $gte: userRating } }).count() + 1;

  return [
    ...buildBasePipeline(aiUserIds, gameId),
    { $limit: numberOfHigherOrEqualRatingPlayers <= 0 ? 1 : numberOfHigherOrEqualRatingPlayers },
    ...makeRankingNumberPipeline,
    { $match: { 'hits.players._id': userId } }
  ];
}

function getOfficialBotRelease(userId, gameId) {
  check([userId, gameId], [String]);
  const user = Meteor.users.findOne({ _id: userId, 'officialBotReleases.gameId': gameId });
  if (user) {
    const userSettingBot = _.find(user.officialBotReleases, userBot => userBot.gameId === gameId);
    if (userSettingBot && userSettingBot.botId) {
      if (userSettingBot.botId == NO_BOT_RELEASE) {
        return null;
      }
      return UserAICodeProd.findOne({ _id: userSettingBot.botId });
    }
  }
  return null;
  // return UserAICodeProd.findOne({ userId, gameId }, { sort: { releasedAt: -1 } });
}

export default function () {
  Meteor.methods({
    'rankingPage.getAllZipcode'() {
      return ZipCode.find({}, { fields: { Zipcode: 1 }, limit: 100 }).fetch();
    },

    'rankingPage.filterTopPlayers'(filter, limit = 10) {
      check(filter, Object);
      check(filter.gameId, String);
      check(limit, Number);

      if (!filter || !filter.gameId) return [];
      const aiUsers = UserAICodeProd.aggregate([
        { $match: { gameId: filter.gameId } },
        { $project: { userId: 1, gameId: 1 } },
        { $group: { _id: "$userId" } }
      ]);
      if (aiUsers.length === 0) return [];

      const aiUserIds = _.map(aiUsers, '_id');

      const basePipeline = buildBasePipeline(aiUserIds, filter.gameId, filter.school);
      const rawUserCollection = Meteor.users.rawCollection();

      // Ranking of logged in user
      let userRanking = 0;
      const currentUser = Meteor.user();
      if (currentUser && currentUser.playGames && currentUser.playGames.length > 0) {
        const userRating = _.find(currentUser.playGames, ({ gameId }) => gameId === filter.gameId);
        if (userRating && userRating.rating && userRating.rating > 0) {
          const query = {
            'playGames.gameId': filter.gameId,
            'playGames.rating': { $gte: userRating.rating }
          };
          if (filter.school && filter.school !== 'All') {
            query.profile = {
              school: filter.school
            };
          }
          if (!filter.school || filter.school === 'All' || filter.school === currentUser.profile.school) {
            const numberOfHigherOrEqualRatingPlayers = Meteor.users.find(query)
              .count() + 1;
            const userRankingPipeline = [...basePipeline,
              { $limit: numberOfHigherOrEqualRatingPlayers <= 0 ? 1 : numberOfHigherOrEqualRatingPlayers },
              ...makeRankingNumberPipeline,
              { $match: { 'hits.players._id': currentUser._id } }
            ];
            const userRankingResult = Promise.await(rawUserCollection.aggregate(userRankingPipeline)
              .toArray());
            if (userRankingResult && userRankingResult.length > 0) {
              userRanking = _.get(userRankingResult[0], 'rankingNumber', -1) + 1;
            }
          }
        }
      }

      let leaderboardResults = [];
      const leaderboardPipeline = [...basePipeline,
        { $limit: limit <= 0 ? 10 : limit },
        ...makeRankingNumberPipeline
      ];

      try {
        leaderboardResults = Promise.await(rawUserCollection.aggregate(leaderboardPipeline).toArray());
      } catch (error) {
        console.error('Error while aggregating leaderboard', JSON.stringify(error));
        console.error('leaderboardPipeline', JSON.stringify(leaderboardPipeline));
      }

      return { leaderboardResults, userRanking };
    },

    // Start a challenge game
    startChallengeGame(challengeGame) {
      check(challengeGame, Object);
      const {
        opponent, game, isAIBattle, botRelease: challengerBotId, type
      } = challengeGame;
      check(opponent, Match.ObjectIncluding({
        _id: String
      }));
      check(game, Match.ObjectIncluding({
        _id: String
      }));
      check(isAIBattle, Boolean);
      check(challengerBotId, String);
      check(type, Number);
      // Context: We call A as challenger, and B as opponent;
      try {
        // 1. Fee for the Challenge: A -25 coins, B +25 coins
        const challenger = Meteor.user();
        if (!challenger) throw new Meteor.Error(500, 'Please login first.');

        const opponentUser = Meteor.users.findOne({ _id: opponent._id });
        if (!opponentUser) throw new Meteor.Error(500, 'Opponent not found');

        const opponentBot = getOfficialBotRelease(opponentUser._id, game._id);
        // console.log("opponentBot " + opponentBot);
        if (!opponentBot) throw new Meteor.Error(500, MESSAGES().LEADERBOARD.MISSING_OPPONENT_BOT);


        const playerInfo = [
          {
            teamID: 0,
            playerType: !isAIBattle ? GAME_CONFIG_OPTION.HUMAN : GAME_CONFIG_OPTION.AI,
            userId: challenger._id,
            playerID: challenger._id,
            ready: true,
            slot: 0,
            username: challenger.username,
            defaultItems: getDetailItemsForUserId(challenger._id),
            slotOption: null
          },
          {
            teamID: 1,
            playerType: GAME_CONFIG_OPTION.AI,
            userId: opponentUser._id,
            playerID: opponentUser._id,
            ready: false,
            slot: 1,
            slotOption: SLOT_OPTION.NETWORK_PLAYER,
            username: opponentUser.username,
            defaultItems: getDetailItemsForUserId(opponentUser._id),
            aiVersion: opponentBot._id,
            aiList: UserAICodeProd.find({ userId: opponent._id, gameId: game._id }, { sort: { releasedAt: -1 } }).fetch(),
            aiLabel: opponentBot.releaseName
          }
        ];


        playerInfo[0].playerAvatarURL = challenger.avatar && challenger.avatar.url ? challenger.avatar.url : '/img_v2/ProfileIcon.png';
        if (isAIBattle && !playerInfo[0].playerAvatarURL) {
          playerInfo[0].playerAvatarURL = '/img_v2/ProfileIcon.png';
        }
        playerInfo[0].playerCoins = challenger.profile.coins;


        playerInfo[1].playerAvatarURL = opponentUser.avatar && opponentUser.avatar.url ? opponentUser.avatar.url : '/img_v2/ProfileIcon.png';
        if (isAIBattle && !playerInfo[1].playerAvatarURL) {
          playerInfo[1].playerAvatarURL = '/img_v2/ProfileIcon.png';
        }

        playerInfo[1].playerCoins = opponentUser.profile.coins;
        // console.log("in battle setting avatar and coin: " + JSON.stringify(playerInfo));


        // 1. Fee
        // Enhance: the Fee only apply battle type isAIBattle
        if (isAIBattle) {
          const challengerBot = UserAICodeProd.findOne({ _id: challengerBotId });
          if (!challengerBot) throw new Meteor.Error(500, MESSAGES().LEADERBOARD.MISSING_MY_BOT);

          const challengerCoin = _.get(challenger, 'profile.coins', 0);
          if (challengerCoin < 25) throw new Meteor.Error(500, "You need to have at least 25 coins to initialize a challenge.");

          // A -25 coins
          Meteor.users.update({ _id: challenger._id }, {
            $inc: {
              'profile.coins': (COINS_FEE.CHALLENGE * -1)
            }
          });
          // B +25 coins
          Meteor.users.update({ _id: opponentUser._id }, {
            $inc: {
              'profile.coins': COINS_FEE.CHALLENGE
            }
          });

          playerInfo[1].playerCoins = opponentUser.profile.coins + 25;
          playerInfo[0].playerCoins = challenger.profile.coins - 25;

          playerInfo[0].aiList = UserAICodeProd.find({ userId: challenger._id, gameId: game._id }, { sort: { releasedAt: -1 } }).fetch();
          playerInfo[0].aiVersion = challengerBot._id;
          playerInfo[0].aiLabel = challengerBot.releaseName;
          for (let i = 2; i <= type; i++) {
            const challengerAI = {
              teamID: 0,
              playerType: GAME_CONFIG_OPTION.AI,
              userId: challenger._id,
              playerID: challenger._id,
              ready: true,
              username: challenger.username,
              defaultItems: getDetailItemsForUserId(challenger._id),
              slotOption: null,
              aiVersion: challengerBot._id,
              aiLabel: challengerBot.releaseName,
              playerCoins: challenger.profile.coins - 25,
              playerAvatarURL: challenger.avatar && challenger.avatar.url ? challenger.avatar.url : '/img_v2/ProfileIcon.png'
            };
            const opponentAI = {
              teamID: 1,
              playerType: GAME_CONFIG_OPTION.AI,
              userId: opponentUser._id,
              playerID: opponentUser._id,
              ready: true,
              slotOption: SLOT_OPTION.NETWORK_PLAYER,
              username: opponentUser.username,
              defaultItems: getDetailItemsForUserId(opponentUser._id),
              aiVersion: opponentBot._id,
              aiList: UserAICodeProd.find({ userId: opponent._id, gameId: game._id }, { sort: { releasedAt: -1 } }).fetch(),
              aiLabel: opponentBot.releaseName,
              playerCoins: opponentUser.profile.coins + 25,
              playerAvatarURL: opponentUser.avatar && opponentUser.avatar.url ? opponentUser.avatar.url : '/img_v2/ProfileIcon.png'
            };
            playerInfo.push(challengerAI, opponentAI);
          }
        }

        // 2. Create a game
        const gameRoomData = {
          owner: challenger._id,
          gameId: game._id,
          level: LEVELS.ADVANCED,
          mode: OPPONENTS.MYSELF.name,
          playerInfo: playerInfo,
          gameType: GAME_TYPE.BATTLE,

          // meta data
          createdAt: new Date()
        };

        const gameRoomId = GameRoom.insert(gameRoomData);
        // console.log("new gameRoomId " + gameRoomId);

        // const gameOption = {
        //   gameId: game._id,
        //   gameRoomId: gameRoomId,
        //   difficulty: LEVELS.ADVANCED,
        //   playerTypes: _.map(playerInfo, 'playerType'),
        //   aiLabel: _.map(playerInfo, 'aiLabel'),
        //   aiVersion: _.map(playerInfo, 'aiVersion')
        // };

        // Meteor.call('startPracticeGame', gameOption, defaultItems);

        const activeGameConfig = {
          playerInfo: gameRoomData.playerInfo,
          gameId: gameRoomData.gameId,
          gameType: GAME_TYPE.BATTLE,
          difficulty: gameRoomData.level,
          isActive: true,
          lastInd: -1,
          isPractice: true,
          ballPosSnapshot: [],
          gameRoomId: gameRoomId,
          usersInRoom: [true, true]
        };

        // console.log("\n\n\n\nbefore insert activeGameRoom " + JSON.stringify(activeGameConfig));
        const activeGameRoomId = ActiveGameList.insert(activeGameConfig);
        // console.log("new activeGameRoomId " + activeGameRoomId);

        GameRoom.update(
          { _id: gameRoomId },
          {
            $set: {
              inRoom: activeGameRoomId
            }
          }
        );

        return activeGameRoomId;
      } catch (error) {
        throw new Meteor.Error(error.error, error.reason);
      }
    },

    getUserRanking(userId) {
      check(userId, String);
      const currentUser = Meteor.users.findOne({ _id: userId });
      if (!currentUser) throw new Meteor.Error(404, 'User not found');

      // const games = Games.find({}).fetch();
      const games = Games.find({ _id: { $in: [MIGRATION_CONST.poolGameId, MIGRATION_CONST.tankGameId] } }).fetch();
      const result = _.map(games, ({ _id: gameId, name }) => {
        // Ranking of logged in user
        let numberRanking = 0;

        const haveRobotForThisGame = UserAICodeProd.findOne({ userId: currentUser._id, gameId: gameId });
        if (haveRobotForThisGame) {
          const rawUserCollection = Meteor.users.rawCollection();
          if (currentUser && currentUser.playGames && currentUser.playGames.length > 0) {
            const userRating = _.find(currentUser.playGames, ({ gameId: _gameId }) => _gameId === gameId);
            // console.log(`userRating : ${JSON.stringify(userRating)}`);
            if (userRating && userRating.rating && userRating.rating > 0) {
              const aiUsers = UserAICodeProd.aggregate([
                { $match: { gameId } },
                { $project: { userId: 1, gameId: 1 } },
                { $group: { _id: "$userId" } }
              ]);
              if (aiUsers.length === 0) return ({ name, gameId, numberRanking });

              const aiUserIds = _.map(aiUsers, '_id');
              const userRankingPipeline = buildPipelineUserRankingInGame(aiUserIds, gameId, currentUser._id, userRating.rating);
              const userRankingResult = Promise.await(rawUserCollection.aggregate(userRankingPipeline).toArray());
              // console.log(`userRankingResult: ${JSON.stringify(userRankingResult)}`);
              if (userRankingResult && userRankingResult.length > 0) {
                numberRanking = _.get(userRankingResult[0], 'rankingNumber', -1) + 1;
              }
            }
          }
        }

        return ({ name, gameId, numberRanking });
      });

      return result;
    }
  });
}
