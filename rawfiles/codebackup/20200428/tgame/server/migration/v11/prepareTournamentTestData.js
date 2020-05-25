import {
  TOURNAMENT_ORGANIZED_BY,
  TOURNAMENT_SECTION_STATUS,
  TOURNAMENT_REWARD,
  TOURNAMENT_SECTION_TYPE,
  MIGRATION_CONST,
  TOURNAMENT_STATUS
} from '../../../lib/enum.js';
import { Tournament, TournamentSection, TournamentRound } from '../../../lib/collections';

const poolGameId = MIGRATION_CONST.poolGameId;

const prepareTournamentTestData = () => {
  Tournament.remove({});
  TournamentSection.remove({});
  TournamentRound.remove({});
  const gameId = poolGameId;

  // current tournaments
  const tournament1 = {
    Name: 'Best Player Of Year 2018',
    description: 'Find new the best player in 2018',
    RegistrationFee: 0,
    gameId,
    status: TOURNAMENT_STATUS.PREPARED,
    isAIOnly: false,
    isHumanOnly: false,
    startTime: new Date(2018, 8, 5, 19, 30, 0),
    endTime: new Date(2018, 8, 30, 19, 30, 0),
    organizedBy: TOURNAMENT_ORGANIZED_BY.RATING,
    createdAt: new Date(2018, 8, 5, 19, 30, 0),
  };

  const newTournament1Id = Tournament.insert(tournament1);

  let newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.NEW_REGISTRATION,
    name: 'New Registration',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2018, 8, 5, 19, 30, 0),
    endTime: new Date(2018, 8, 5, 21, 30, 0),
  };
  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.CHAMPIONSHIP,
    name: 'CHAMPIONSHIP',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2018, 8, 5, 22, 0, 0),
    endTime: new Date(2018, 8, 5, 23, 30, 0),
  };

  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.OPEN,
    name: 'OPEN',
    registeredUserIds: [
      {
        userId: 'kEmnDrYssC2gKNDxy',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
      {
        userId: 'kEmnDrYssC2gKNDxx',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
      {
        userId: 'ZmjDvnCJKvA678ZDW',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
    ],
    numberOfRounds: 8,
    currentRound: 5,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2018, 8, 5, 22, 0, 0),
    endTime: new Date(2018, 8, 5, 23, 30, 0),
  };

  let sectionId = TournamentSection.insert(newSection);

  /* Round */
  let newRound = {
    sectionId,
    tournamentId: newTournament1Id,
    numberOfPairs: 2,
    numberOfFinishPairs: 1,
    round: 1,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 100
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 80
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 1,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 120
          },
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 20
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
    ]
  };

  TournamentRound.insert(newRound);

  newRound = {
    sectionId,
    tournamentId: newTournament1Id,
    numberOfPairs: 2,
    numberOfFinishPairs: 1,
    round: 3,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 150
          },
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 100
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 1,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 120
          },
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 20
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 3,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 300
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 280
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
    ]
  };

  TournamentRound.insert(newRound);

  newRound = {
    sectionId,
    tournamentId: newTournament1Id,
    numberOfPairs: 2,
    numberOfFinishPairs: 1,
    round: 2,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 50
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 200
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 0,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 30
          },
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 80
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      }
    ]
  };

  TournamentRound.insert(newRound);

  newRound = {
    sectionId,
    tournamentId: newTournament1Id,
    numberOfPairs: 2,
    numberOfFinishPairs: 1,
    round: 2,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 350
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 500
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 1,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 120
          },
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 50
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      }
    ]
  };

  TournamentRound.insert(newRound);
  /* Round */


  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.BOOSTER,
    name: 'BOOSTER',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2018, 8, 5, 22, 0, 0),
    endTime: new Date(2018, 8, 5, 23, 30, 0),
  };

  TournamentSection.insert(newSection);

  const tournament = {
    Name: 'North-Eastern Class Action September 2018',
    description: 'Monthly with rated sections',
    RegistrationFee: 0,
    gameId,
    status: TOURNAMENT_STATUS.IN_PROGRESS,
    isAIOnly: false,
    isHumanOnly: false,
    startTime: new Date(2018, 8, 2, 8, 30, 0),
    endTime: new Date(2018, 8, 3, 3, 30, 0),
    organizedBy: TOURNAMENT_ORGANIZED_BY.RATING,
    createdAt: new Date(2018, 8, 2, 19, 30, 0),
  };

  const newTournamentId = Tournament.insert(tournament);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournamentId,
    type: TOURNAMENT_SECTION_TYPE.NEW_REGISTRATION,
    name: 'New Registration',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2018, 8, 2, 20, 30, 0),
    endTime: new Date(2018, 8, 2, 21, 30, 0),
  };
  TournamentSection.insert(newSection);

  newSection = {
    announcement: [
      {
        msg: 'Hi all, welcome to the board',
        createdAt: new Date(2018, 6, 30, 8, 30, 0),
      },
      {
        msg: 'We are going to start round 1 soon',
        createdAt: new Date(2018, 6, 30, 9, 30, 0),
      },
      {
        msg: 'Round 1 is all completed, we\'ll kick off round 2 in 5 minutes',
        createdAt: new Date(2018, 6, 30, 20, 30, 0),
      },
    ],
    createdAt: new Date(),
    tournamentId: newTournamentId,
    type: TOURNAMENT_SECTION_TYPE.UNRATED,
    name: 'UNRATED',
    registeredUserIds: [
      {
        userId: 'ZmjDvnCJKvA678ZDW',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(2018, 6, 30, 19, 30, 0),
        point: 100,
      },
      {
        userId: 'kEmnDrYssC2gKNDxy',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(2018, 6, 30, 19, 30, 0),
        point: 200,
      },
      {
        userId: 'kEmnDrYssC2gKNDxx',
        hasBYE: false,
        isBYE: false,
        rating: 150,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(2018, 6, 30, 19, 30, 0),
        point: 300,
      }
    ],
    numberOfRounds: 8,
    currentRound: 5,
    playerRatingLowerBound: 1,
    playerRatingUpperBound: 9999,
    playerGradeLowerBound: 1,
    playerGradeUpperBound: 12,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2018, 8, 2, 21, 45, 0),
    endTime: new Date(2018, 8, 2, 22, 45, 0),
  };

  sectionId = TournamentSection.insert(newSection);

  /* Round */
  newRound = {
    sectionId,
    tournamentId: newTournamentId,
    numberOfPairs: 2,
    numberOfFinishPairs: 1,
    round: 1,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 20
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 30
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 1,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 50
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 70
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
    ]
  };

  TournamentRound.insert(newRound);

  newRound = {
    sectionId,
    tournamentId: newTournamentId,
    numberOfPairs: 3,
    numberOfFinishPairs: 1,
    round: 3,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 150
          },
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 100
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 1,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 20
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 50
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 2,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 130
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 150
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
    ]
  };

  TournamentRound.insert(newRound);

  newRound = {
    sectionId,
    tournamentId: newTournamentId,
    numberOfPairs: 2,
    numberOfFinishPairs: 1,
    round: 2,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 50
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 200
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
      {
        id: 1,
        players: [
          {
            playerId: 'kEmnDrYssC2gKNDxx',
            point: 130
          },
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 150
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      },
    ]
  };

  TournamentRound.insert(newRound);

  newRound = {
    sectionId,
    tournamentId: newTournamentId,
    numberOfPairs: 1,
    numberOfFinishPairs: 1,
    round: 2,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 350
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 500
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      }
    ]
  };

  TournamentRound.insert(newRound);
  /* Round */

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournamentId,
    type: TOURNAMENT_SECTION_TYPE.BOOSTER,
    name: 'BOOSTER',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: 1,
    playerRatingUpperBound: 599,
    playerGradeLowerBound: 4,
    playerGradeUpperBound: 8,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2018, 8, 2, 22, 0, 0),
    endTime: new Date(2018, 8, 2, 23, 30, 0),
  };

  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournamentId,
    type: TOURNAMENT_SECTION_TYPE.PRIMARY,
    name: 'PRIMARY',
    registeredUserIds: [
      {
        userId: 'ZmjDvnCJKvA678ZDW',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
      {
        userId: 'kEmnDrYssC2gKNDxy',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
    ],
    numberOfRounds: 8,
    currentRound: 2,
    playerRatingLowerBound: 600,
    playerRatingUpperBound: 999,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2018, 8, 2, 23, 45, 0),
    endTime: new Date(2018, 8, 2, 24, 30, 0),
  };

  sectionId = TournamentSection.insert(newSection);

  newRound = {
    sectionId,
    tournamentId: newTournamentId,
    numberOfPairs: 1,
    numberOfFinishPairs: 1,
    round: 1,
    pairs: [
      {
        id: 0,
        players: [
          {
            playerId: 'ZmjDvnCJKvA678ZDW',
            point: 1
          },
          {
            playerId: 'kEmnDrYssC2gKNDxy',
            point: 0
          }
        ],
        activeGameListId: null,
        gameRoomId: 'qK66bTbFGxaAo9TJt',
        status: 'finished'
      }
    ]
  };

  TournamentRound.insert(newRound);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournamentId,
    type: TOURNAMENT_SECTION_TYPE.OPEN,
    name: 'OPEN',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: 1500,
    playerRatingUpperBound: 1999,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2018, 8, 3, 1, 0, 0),
    endTime: new Date(2018, 8, 3, 2, 30, 0),
  };

  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newTournamentId,
    type: TOURNAMENT_SECTION_TYPE.CHAMPIONSHIP,
    name: 'CHAMPIONSHIP',
    registeredUserIds: [],
    numberOfRounds: 8,
    currentRound: 1,
    playerRatingLowerBound: 2000,
    playerRatingUpperBound: 9999,
    playerGradeLowerBound: 2,
    playerGradeUpperBound: 6,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2018, 8, 3, 2, 45, 0),
    endTime: new Date(2018, 8, 3, 3, 30, 0),
  };

  TournamentSection.insert(newSection);

  // past tournament
  const pastTournament1 = {
    Name: 'North-Eastern Class Action September 2017',
    description: 'Monthly with rated sections',
    RegistrationFee: 0,
    gameId,
    status: TOURNAMENT_STATUS.END,
    isAIOnly: false,
    isHumanOnly: false,
    startTime: new Date(2017, 8, 30, 7, 30, 0),
    endTime: new Date(2017, 8, 30, 11, 30, 0),
    organizedBy: TOURNAMENT_ORGANIZED_BY.RATING,
    createdAt: new Date(2017, 8, 20, 19, 30, 0),
  };

  const newPastTournament1Id = Tournament.insert(pastTournament1);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.NEW_REGISTRATION,
    name: 'New Registration',
    registeredUserIds: [],
    numberOfRounds: 0,
    currentRound: 0,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2017, 8, 30, 7, 30, 0),
    endTime: new Date(2017, 8, 30, 8, 30, 0),
  };
  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.UNRATED,
    name: 'UNRATED',
    registeredUserIds: [
      {
        userId: 'kEmnDrYssC2gKNDxx',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
      {
        userId: 'ZmjDvnCJKvA678ZDW',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
    ],
    numberOfRounds: 4,
    currentRound: 4,
    playerRatingLowerBound: 1,
    playerRatingUpperBound: 9999,
    playerGradeLowerBound: 1,
    playerGradeUpperBound: 12,
    status: TOURNAMENT_SECTION_STATUS.END,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2017, 8, 30, 8, 40, 0),
    endTime: new Date(2017, 8, 30, 9, 30, 0),
  };

  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.BOOSTER,
    name: 'BOOSTER',
    registeredUserIds: [],
    numberOfRounds: 4,
    currentRound: 4,
    playerRatingLowerBound: 1,
    playerRatingUpperBound: 9999,
    playerGradeLowerBound: 1,
    playerGradeUpperBound: 12,
    status: TOURNAMENT_SECTION_STATUS.END,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2017, 8, 30, 9, 40, 0),
    endTime: new Date(2017, 8, 30, 10, 40, 0),
  };

  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament1Id,
    type: TOURNAMENT_SECTION_TYPE.PRIMARY,
    name: 'PRIMARY',
    registeredUserIds: [],
    numberOfRounds: 4,
    currentRound: 4,
    playerRatingLowerBound: 1,
    playerRatingUpperBound: 9999,
    playerGradeLowerBound: 1,
    playerGradeUpperBound: 12,
    status: TOURNAMENT_SECTION_STATUS.END,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2017, 8, 30, 9, 40, 0),
    endTime: new Date(2017, 8, 30, 10, 40, 0),
  };

  TournamentSection.insert(newSection);

  const pastTournament2 = {
    Name: 'North-Eastern Class Action September 2016',
    description: 'Monthly with rated sections',
    RegistrationFee: 0,
    gameId,
    status: TOURNAMENT_STATUS.END,
    isAIOnly: false,
    isHumanOnly: false,
    startTime: new Date(2016, 5, 20, 8, 30, 0),
    endTime: new Date(2016, 5, 20, 12, 30, 0),
    organizedBy: TOURNAMENT_ORGANIZED_BY.RATING,
    createdAt: new Date(2016, 5, 1, 19, 30, 0),
  };

  const newPastTournament2Id = Tournament.insert(pastTournament2);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament2Id,
    type: TOURNAMENT_SECTION_TYPE.NEW_REGISTRATION,
    name: 'New Registration',
    registeredUserIds: [],
    numberOfRounds: 0,
    currentRound: 0,
    playerRatingLowerBound: -1,
    playerRatingUpperBound: -1,
    playerGradeLowerBound: -1,
    playerGradeUpperBound: -1,
    status: TOURNAMENT_SECTION_STATUS.PREPARED,
    reward: [],
    startTime: new Date(2016, 5, 20, 8, 30, 0),
    endTime: new Date(2016, 5, 20, 9, 30, 0),
  };
  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament2Id,
    type: TOURNAMENT_SECTION_TYPE.UNRATED,
    name: 'UNRATED',
    registeredUserIds: [
      {
        userId: 'kEmnDrYssC2gKNDxx',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
      {
        userId: 'ZmjDvnCJKvA678ZDW',
        hasBYE: false,
        isBYE: false,
        rating: 100,
        isFirstMove: false,
        firstMoveCount: 0,
        registerTime: new Date(),
      },
    ],
    currentRound: 4,
    numberOfRounds: 4,
    playerRatingLowerBound: 1,
    playerRatingUpperBound: 9999,
    playerGradeLowerBound: 1,
    playerGradeUpperBound: 12,
    status: TOURNAMENT_SECTION_STATUS.END,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2016, 5, 20, 9, 45, 0),
    endTime: new Date(2016, 5, 20, 10, 30, 0),
  };

  TournamentSection.insert(newSection);

  newSection = {
    announcement: [],
    createdAt: new Date(),
    tournamentId: newPastTournament2Id,
    type: TOURNAMENT_SECTION_TYPE.CHAMPIONSHIP,
    name: 'CHAMPIONSHIP',
    registeredUserIds: [],
    numberOfRounds: 4,
    currentRound: 4,
    playerRatingLowerBound: 100,
    playerRatingUpperBound: 400,
    playerGradeLowerBound: 1,
    playerGradeUpperBound: 12,
    status: TOURNAMENT_SECTION_STATUS.END,
    reward: [
      {
        top: 1,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 2,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      },
      {
        top: 3,
        type: TOURNAMENT_REWARD.MEMBERSHIP
      }
    ],
    startTime: new Date(2016, 5, 20, 10, 45, 0),
    endTime: new Date(2016, 5, 20, 11, 30, 0),
  };

  TournamentSection.insert(newSection);
};

export default prepareTournamentTestData;
