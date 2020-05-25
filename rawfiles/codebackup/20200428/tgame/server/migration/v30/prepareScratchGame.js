import { Games, NewScenarios } from '../../../lib/collections';
import { LEVELS, OPPONENTS, MIGRATION_CONST, MULTIPLAYER_MODE } from '../../../lib/enum';

const scratchGameId = MIGRATION_CONST.scratchGameId;
const tankGameId = MIGRATION_CONST.tankGameId;
const canvasGameId = MIGRATION_CONST.canvasGameId;
const algorithmGameId = MIGRATION_CONST.algorithmGameId;
const flappybirdGameId = MIGRATION_CONST.flappybirdGameId;
const scratchtankGameId = MIGRATION_CONST.scratchtankGameId;
const candycrushGameId = MIGRATION_CONST.candycrushGameId;
const scratchSoccerGameId = MIGRATION_CONST.scratchSoccerGameId;
const drawingturtleGameId = MIGRATION_CONST.drawingturtleGameId;
const kturtleGameId = MIGRATION_CONST.ia_k_turtleGameId;
const generalconceptsGameId = MIGRATION_CONST.generalconceptsGameId;
const cannonpongGameId = MIGRATION_CONST.cannonpongGameId;
const tankscratch2GameId = MIGRATION_CONST.tankscratch2GameId;
const appleharvestGameId = MIGRATION_CONST.appleharvestGameId;
const recyclerGameId = MIGRATION_CONST.recyclerGameId;
const codinggameGameId = MIGRATION_CONST.codinggameGameId;
const algoScratchGameId = MIGRATION_CONST.algoScratchGameId;
const mazeGameId = MIGRATION_CONST.mazeGameId;
const schoolAGameId = MIGRATION_CONST.schoolAGameId;
const schoolAGameCHId = MIGRATION_CONST.schoolAGameCHId;

const gameGeneralData = [
  {
    _id: canvasGameId,
    title: 'Canvas',
    trackName: 'canvas',
    name: 'canvas',
    imageUrl: '/images/scratchlogo.png',
    description: `Drawing Canvas - Draw shapes and text using JavaScript`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: algorithmGameId,
    title: 'Algorithm',
    trackName: 'algorithm',
    name: 'algorithm',
    imageUrl: '/images/algorithmjs3.png',
    description: `Data Structure and Algorithm in JavaScript`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: scratchGameId,
    title: 'Scratch',
    trackName: 'Scratch',
    name: 'scratch',
    imageUrl: '/images/scratchlogo.png',
    description: `Scratch 3.0 - World's most popular block programming language`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: algoScratchGameId,
    title: 'Algorithm in Scratch',
    trackName: 'algorithminscratch',
    name: 'algorithminscratch',
    imageUrl: '/images/algoinscratchwhite.png',
    description: `Algorithm in Scratch - learn basic algorithms using Scratch blocks`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: recyclerGameId,
    title: 'Super Recycler',
    trackName: 'superrecycler',
    name: 'superrecycler',
    imageUrl: '/images/superrecyclerlogo.png',
    description: `Super Recycler - control a garbage truck to recycle more waste items`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: appleharvestGameId,
    title: 'Apple Harvest',
    trackName: 'AppleHarvest',
    name: 'appleharvest',
    imageUrl: '/images/appleharvestlogo.png',
    description: `Scratch Basics I - Apple Harvest Game`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        // { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: mazeGameId,
    title: 'Maze',
    trackName: 'Maze',
    name: 'maze',
    imageUrl: '/images/mazelogo.png',
    description: `Scratch Basics II - Maze Game`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        // { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: flappybirdGameId,
    title: 'Flappy Bird',
    trackName: 'FlappyBird',
    name: 'flappybird',
    imageUrl: '/images/flappybirdlogo.png',
    description: `Flappy Bird game in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: scratchtankGameId,
    title: 'Smart Tank',
    trackName: 'Smart Tank Scratch',
    name: 'scratchsmarttank',
    imageUrl: '/images/smarttankscratchlogo.png',
    description: `Smart Tank game in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: candycrushGameId,
    title: 'Candy Crush',
    trackName: 'Candy Crush Scratch',
    name: 'scratchcandycrush',
    imageUrl: '/images/candycrushscratchlogo.png',
    description: `Candy Crush game in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: scratchSoccerGameId,
    title: 'RoboCup',
    trackName: 'Robocup Scratch',
    name: 'robocupcrush',
    imageUrl: '/images/robocupscratch.png',
    description: `Robocup 2D soccer in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: drawingturtleGameId,
    title: 'Drawing Turtle',
    trackName: 'Drawing Turtle',
    name: 'drawingturtle',
    imageUrl: '/images/turtlegreen.png',
    description: `Drawing Turtle in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: kturtleGameId,
    title: 'Drawing Turtle For K',
    trackName: 'Drawing Turtle For K',
    name: 'drawingturtlefork',
    imageUrl: '/images/turtlecolor1.png',
    description: `Drawing Turtle in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },  
  {
    _id: generalconceptsGameId,
    title: 'General Concepts',
    trackName: 'General Concepts',
    name: 'generalconcepts',
    imageUrl: '/images/intro ai 2.png',
    description: `Introduction of General Concepts in AI`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: schoolAGameId,
    title: 'Level A',
    trackName: 'Level A',
    name: 'levela',
    imageUrl: '/images/A-150.png',
    description: `First level for schools`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: cannonpongGameId,
    title: 'CannonPong',
    trackName: 'Cannon Pong Scratch',
    name: 'cannonpongscratch',
    imageUrl: '/images/cannonponggame.png',
    description: `Pong game with cannons shooting balls in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: tankscratch2GameId,
    title: 'Smart Tank',
    trackName: 'Smart Tank Scratch',
    name: 'scratchsmarttank',
    imageUrl: '/images/smarttankscratchlogo.png',
    description: `Smart Tank game in Scratch`,
    teamSize: 1,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  {
    _id: tankGameId,
    title: 'Smart Tank',
    trackName: 'SmartTank',
    name: 'smark_tank',
    imageUrl: '/images/tankscreenicon.png',
    description: 'Real-time shooting game betweeen tanks in a maze-like battlefield',
    teamSize: 3,
    teamNumber: 2,
    multiplayerMode: [MULTIPLAYER_MODE.MODE1VS1, MULTIPLAYER_MODE.MODE2VS2, MULTIPLAYER_MODE.MODE3VS3],
    level: [
        { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
        { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
        // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
    ],
    opponent: [
        { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
        { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
        { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
    ]
  },
  // {
  //   _id: 'z7Zw82CrjYW2ZJWZZ',
  //   title: 'Dodge Ball',
  //   trackName: 'DodgeBall',
  //   name: 'dodgeball',
  //   imageUrl: '/images/cardodgeballicon.jpg',
  //   description: 'First-person ball shooting game with cars in a 3D world',
  //   teamSize: 1,
  //   teamNumber: 2,
  //   level: [
  //       { name: LEVELS.BEGINNER, imageUrl: '/images/basic-gray.svg' },
  //       { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
  //       // { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
  //   ],
  //   opponent: [
  //       { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
  //       { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
  //       { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
  //   ]
  // }

  // {
  //   _id: 'x6Zw82CrjYW2ZJWYY',
  //   title: 'Magic Forest',
  //   trackName: 'MagicForest',
  //   name: 'magic_forest',
  //   imageUrl: '/images/magicforestscreenshot1.png',
  //   description: 'Grab magic mushroom in a maze guarded by monsters',
  //   teamSize: 1,
  //   teamNumber: 2,
  //   level: [
  //       { name: LEVELS.ADVANCED, imageUrl: '/images/advanced.svg' },
  //       { name: LEVELS.PROFESSIONAL, imageUrl: '/images/advanced-grey.svg' },
  //   ],
  //   opponent: [
  //       { title: OPPONENTS.MYSELF.title, name: OPPONENTS.MYSELF.name, imageUrl: '/images/casual-gray.svg', link: '/gamesRoomEntry' },
  //       { title: OPPONENTS.PLAYERNETWORK.title, name: OPPONENTS.PLAYERNETWORK.name, imageUrl: '/images/friends3.svg', link: '/gamesRoomNetwork' },
  //       { title: OPPONENTS.TOURNAMENT.title, name: OPPONENTS.TOURNAMENT.name, imageUrl: '/images/trophy-gray.svg', link: '/tournament' },
  //   ]
  // }
];

const prepareGameGeneralData = () => {
  Games.remove({_id: canvasGameId});
  Games.remove({_id: algorithmGameId});
  Games.remove({_id: scratchGameId});
  Games.remove({_id: recyclerGameId});
  Games.remove({_id: codinggameGameId});
  Games.remove({_id: algoScratchGameId});
  Games.remove({_id: appleharvestGameId});
  Games.remove({_id: mazeGameId});
  Games.remove({_id: schoolAGameId});
  Games.remove({_id: schoolAGameCHId});
  Games.remove({_id: flappybirdGameId});
  Games.remove({_id: scratchtankGameId});
  Games.remove({_id: candycrushGameId});
  Games.remove({_id: cannonpongGameId});
  Games.remove({_id: scratchSoccerGameId});
  Games.remove({_id: drawingturtleGameId});
  Games.remove({_id: kturtleGameId});
  Games.remove({_id: generalconceptsGameId});
  Games.remove({_id: tankscratch2GameId});
  Games.remove({_id: tankGameId});
  
  
  console.log("adding scratch game");
  _.map(gameGeneralData, (doc) => {
    Games.insert(doc);
  });
};
const prepareGameData = () => {
  prepareGameGeneralData();
  // prepareGameTutorialData();
};

export default prepareGameData;
