import { Games, NewScenarios } from '../../../lib/collections';
import { LEVELS, OPPONENTS, MIGRATION_CONST, MULTIPLAYER_MODE } from '../../../lib/enum';

const match3GameId = MIGRATION_CONST.match3GameId;


const gameGeneralData = [
  {
    _id: match3GameId,
    title: 'UnderMiner',
    trackName: 'UnderMiner',
    name: 'under_miner',
    imageUrl: '/images/Crystals/PNG/1@2x.png',
    description: 'Real-time tile-matching race with the twist of undermining the opponent',
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
  Games.remove({_id: match3GameId});
  _.map(gameGeneralData, (doc) => {
    Games.insert(doc);
  });
};
const prepareGameData = () => {
  prepareGameGeneralData();
  // prepareGameTutorialData();
};

export default prepareGameData;
