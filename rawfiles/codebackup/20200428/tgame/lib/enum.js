
const DEFAULT_BATTLE_PROJECT_ID = '327565483'; // '326501518';
const DEFAULT_BATTLE_PROJECT_ID_RECYCLER = '356542718'; // '326501518';

const TUTORIAL_GROUP = {
  BEGINNER: {
    FLAPPY_BIRD_LESSONS: 'Flappy Bird',
    DRAWING_TURTLE_LESSONS: 'Drawing Turtle',
    APPLE_HARVEST_LESSONS: 'Apple Harvest',
    LEVEL_A_LESSONS: 'Level A',
    GENERALCONCEPTS_LESSONS: "Welcome",
    SMART_TANK_LESSONS: 'Smart Tank I',
    YOUR_FIRST_GAME_BOT: 'Your First Game Bot',
    MAKING_CALL_SHOTS: 'Understanding Call Shots',
    SEARCHING_FOR_BEST_SHOTS: 'Optimizing Call Shots',
    PLACING_CUE_BALL: 'Placing Cue Ball',
    TEST_SCRIPT: 'Test script',
    BASIC_ACTIONS_I: 'Basic actions I',
    BASIC_ACTIONS_II: 'Basic actions II',
    INTRODUCE: 'Introduce',

    FOUNDATION: 'Laying Out The Foundation',
    FOUNDATION2: 'Automating Shot Calculation',
    BASICALGO: 'From Good to Great',
    BASICALGO2: 'Handling Tough Situations',
    FOUNDATIONTANK2: 'Shooting White Tanks'

    // INITIAL_ROBOT_RELEASE: 'Initial Robot Release'
  },
  INTERMEDIATE: {
    SMART_TANK_LESSONS: 'Smart Tank',
    DRAWING_TURTLE_LESSONS: 'Drawing Turtle',
    SCRATCH_SOCCER_LESSONS: 'Scratch Soccer',
    CANDY_CRUSH_LESSONS: 'Candy Crush',
    FOUNDATIONTANK3: 'Getting Power-Ups',
    FOUNDATION3: 'A Smart Gamebot Is Born',
    OPTIMIZE_YOUR_ROBOT: "Optimizing Your Robot",
    OPTIMIZE_YOUR_ROBOT_TANK: "Optimizing Your Robot",
    SOLVING_TOUGH_ISSUES: "Solving Some Tough Issues",
    EXAMPLES_FOR_OPEN: "Examples for Open Directions",
    DANGEROUS_SITUATIONS: "Handling Dangerous Situations",
    SPECIAL_WEAPONS: "Strategies for Weapons",
    OPPONENT_IMPACTS: "Considering Opponents' Impacts",
    TIME_IS_UP: "Game Ending Strategies",
    TEAMWORK: "Teamwork",
    ACCELEATE_YOUR_BOT: "Accelerate Your Bot",
    BASIC_TANK_ACTIONS_I: "Basic Tank Actions I",
    MAZE_LESSONS: 'Maze',
    BALLOON_LESSONS: 'Balloon Buster'
    // SPEED_UP_CALL_SHOTS: 'Speeding up Call Shots',
    // MORE_INTERMEDIATE_TACTICS: 'More Useful Optimizations',
    // REBOUNDS: 'Using Rebounds',
  },
  ADVANCED: {
    INDIRECT_SHOTS: "Indirect Shots",
    ADVANCED_TECH: "Advanced Techniques",
    LINEAR_REGRESSION_MODEL: 'Linear Regression Model',
    LOGISTIC_REGRESSION_MODEL: 'Logistic Regression Model',
    MORE_ADVANCED_TACTICS: 'More Advanced Tactics',
    OPTIMIZE_YOUR_ROBOT_TANK_II: "Optimizing Your Robot II",
    TANK_SPECIAL_WEAPONS: "Strategies for Sepcial Weapons",
    TANK_TEAMWORK: "Teamwork and Collaboration Among Tanks",
    ALGORITHM_LESSONS: 'Data Structure and Algorithm'
  }
};

const TUTORIAL_LEVEL = {};

TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.APPLE_HARVEST_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.MAZE_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.LEVEL_A_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.BALLOON_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.DRAWING_TURTLE_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.DRAWING_TURTLE_LESSONS] = 2;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.FLAPPY_BIRD_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.GENERALCONCEPTS_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.SMART_TANK_LESSONS] = 2;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.MAKING_CALL_SHOTS] = 2;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.SEARCHING_FOR_BEST_SHOTS] = 3;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.PLACING_CUE_BALL] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT] = 5;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.SOLVING_TOUGH_ISSUES] = 6;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.EXAMPLES_FOR_OPEN] = 7;

TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.SMART_TANK_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.SCRATCH_SOCCER_LESSONS] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.CANDY_CRUSH_LESSONS] = 4;

TUTORIAL_LEVEL[TUTORIAL_GROUP.ADVANCED.ALGORITHM_LESSONS] = 1;

TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.INTRODUCE] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.TEST_SCRIPT] = 2;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_I] = 3;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.BASIC_ACTIONS_II] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.FOUNDATIONTANK3] = 3;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.OPTIMIZE_YOUR_ROBOT_TANK] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.ADVANCED.OPTIMIZE_YOUR_ROBOT_TANK_II] = 6;
TUTORIAL_LEVEL[TUTORIAL_GROUP.ADVANCED.TANK_SPECIAL_WEAPONS] = 7;
TUTORIAL_LEVEL[TUTORIAL_GROUP.ADVANCED.TANK_TEAMWORK] = 8;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.BASIC_TANK_ACTIONS_I] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.BASIC_ACTIONS_II] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.BASIC_TANK_ACTIONS_II] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.BASIC_ACTIONS_I] = 3;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.DANGEROUS_SITUATIONS] = 5;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.SPECIAL_WEAPONS] = 6;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.OPPONENT_IMPACTS] = 7;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.TIME_IS_UP] = 8;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.TEAMWORK] = 9;

TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.FOUNDATION] = 1;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.FOUNDATION2] = 2;
TUTORIAL_LEVEL[TUTORIAL_GROUP.BEGINNER.FOUNDATIONTANK2] = 2;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.FOUNDATION3] = 3;
TUTORIAL_LEVEL[TUTORIAL_GROUP.INTERMEDIATE.ACCELEATE_YOUR_BOT] = 4;
TUTORIAL_LEVEL[TUTORIAL_GROUP.ADVANCED.INDIRECT_SHOTS] = 5;
TUTORIAL_LEVEL[TUTORIAL_GROUP.ADVANCED.ADVANCED_TECH] = 6;

/*
let i = 0;
Object.keys(TUTORIAL_GROUP).forEach((category) => {
  Object.keys(TUTORIAL_GROUP[category]).forEach((title) => {
    i += 1;
    TUTORIAL_LEVEL[TUTORIAL_GROUP[category][title]] = i;
  });
});
*/
const TUTORIAL_IMAGE = [];
for (let k = 0; k < 10; k++) {
  TUTORIAL_IMAGE.push(
    {
      INCOMPLETE: `level${k}.png`,
      COMPLETE: `level${k}completed.png`
    }
  );
}

const TRACK_USER_FROM_CHANNELS = [
  {
    value: 'Friend\'s recommendation',
    label: 'Friend\'s recommendation'
  },
  {
    value: 'Web search',
    label: 'Web search'
  },
  {
    value: 'STEAM Event',
    label: 'STEAM Event'
  },
  {
    value: 'News/articles online',
    label: 'News/articles online'
  },
  {
    value: 'Teacher or coach',
    label: 'Teacher or coach'
  },
  {
    value: 'Online ads',
    label: 'Online ads'
  }
];

const NOTIFICATION_ACTION = {
  DELETE: 'delete',
  SEEN: 'seen'
};

const GENDER_VALUE = {
  MALE: 'Male',
  FEMALE: 'Female'
};

const LEVELS = {
  BEGINNER: 'Beginner',
  ADVANCED: 'Advanced'
  // PROFESSIONAL: 'Professional'
};

const MULTIPLAYER_MODE = {
  MODE1VS1: '1vs1',
  MODE2VS2: '2vs2',
  MODE3VS3: '3vs3'
};

const MULTIPLAYER_MODE_MAP = {
  [MULTIPLAYER_MODE.MODE1VS1]: 1,
  [MULTIPLAYER_MODE.MODE2VS2]: 2,
  [MULTIPLAYER_MODE.MODE3VS3]: 3
};

const POINTS = {
  WIN: 1,
  DRAW: 0.5,
  LOSE: 0
};

const PLAYER_TYPE = {
  WINNER: 'winner',
  LOSER: 'loser',
  BOTH_LOSER: 'both_loser'
};

const GAME_MATCH_STATUS = {
  WIN: 'WON',
  LOSE: 'LOST',
  DRAW: 'DRAW',
  NOT_YET: '',
  NOT_JOIN: 'NONE JOINED'
};

const LEVEL_IMAGES = {
  Beginner: '/images/basic-gray.svg',
  Advanced: '/images/advanced.svg'
  // Professional: '/images/advanced-grey.svg'
};

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1
  // Professional: 2
};

const OPPONENTS = {
  MYSELF: {
    name: 'myself',
    title: 'Practice Myself',
    link: '/gamesRoomEntry',
    imageUrl: '/images/casual-gray.svg'
  },
  PLAYERNETWORK: {
    name: 'playernetwork',
    title: 'Battle Online',
    link: '/gamesRoomNetwork',
    imageUrl: '/images/friends3.svg'
  },
  TOURNAMENT: {
    name: 'tournament',
    title: 'Join Tournament',
    link: '/gamesRoomTournament',
    imageUrl: '/images/trophy-gray.svg'
  }
};

const USERS = {
  AI_USERS: 'AI users',
  MANUAL_USERS: 'Manual users',
  ALL_USERS: 'All users'
};

const ROLES = {
  PUBLIC_VISITOR: 'publicVisitor',
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',
  SUPPORT: 'Support',
  AI: 'AI',
  MANUAL: 'Human',
  TEACHER: 'Teacher',
  STUDENT: 'Student'
};

const REGISTER_BUTTON = {
  REGISTER: 'Register For Tournament',
  WITHDRAW: 'Withdraw'
};

const TUTORIAL_STATUS = {
  COMPLETE: 'Complete',
  NOT_STARTED: 'Not started yet',
  IN_PROGRESS: 'In progress'
};

const TOURNAMENT_ORGANIZED_BY = {
  RATING: 'rating',
  AGE: 'age',
  ARRAY_OBJECT: [
    {
      key: 'rating',
      value: 'Rating'
    },
    {
      key: 'age',
      value: 'Age'
    },
    {
      key: 'grade',
      value: 'Grade'
    }
  ]
};

const TOURNAMENT_STATUS = {
  PREPARED: 'In Preparation',
  IN_PROGRESS: 'In Progress',
  END: 'Ended'
};

const TOURNAMENT_SECTION_STATUS = {
  PREPARED: 'In Preparation',
  IN_PROGRESS: 'In Progress',
  END: 'Ended'
};


const TOURNAMENT_SECTION_ROUND_STATUS = (round, numberOfRounds) => ({
  PENDING: `Round ${round} pending`,
  UNDERWAY: `Round ${round} underway`,
  COMPLETED: numberOfRounds === round ? 'All rounds completed' : `Round ${round} completed`
});

const TOURNAMENT_SECTION = {
  AGE: {
    MIDDLE_SCHOOL: {
      min: 13,
      max: 14
    },
    HIGH_SCHOOL: {
      min: 14,
      max: 18
    },
    COLLEGE: {
      min: 18,
      max: 22
    },
    POST_COLLEGE: {
      min: 22,
      max: 999
    },
    ARRAY_OBJECT: [
      {
        key: 'MIDDLE_SCHOOL',
        value: 'Middle School'
      },
      {
        key: 'HIGH_SCHOOL',
        value: 'High School'
      },
      {
        key: 'COLLEGE',
        value: 'College'
      },
      {
        key: 'POST_COLLEGE',
        value: 'Post-College'
      }
    ]
  },
  RATING: {
    NOT_RATED: {
      min: 0,
      max: 9999
    },
    PRIMARY: {
      min: 0,
      max: 500
    },
    CLASSIC: {
      min: 501,
      max: 1000
    },
    OPEN: {
      min: 1001,
      max: 1500
    },
    CHAMPIONSHIP: {
      min: 1501,
      max: 9999
    },
    ARRAY_OBJECT: [
      {
        key: 'NOT_RATED',
        value: 'Not rated'
      },
      {
        key: 'PRIMARY',
        value: 'Primary'
      },
      {
        key: 'CLASSIC',
        value: 'Classic'
      },
      {
        key: 'OPEN',
        value: 'Open'
      },
      {
        key: 'CHAMPIONSHIP',
        value: 'Championship'
      }
    ]
  }
};
const TOURNAMENT_REWARD = {
  MEMBERSHIP: 'Membership'
};
const PLAYER_STATUS = {
  Ready: 'Ready',
  Waiting: 'Waiting',
  Unprepared: 'Unprepared'
};

const BUTTON = {
  INVITE: 'Invite',
  KICK: 'Kick',
  CANCEL: 'Cancel',
  SWITCH: 'Switch',
  START_GAME: 'Start game',
  READY: 'Ready',
  NOT_READY: 'Not Ready',
  RELEASE_AI: 'Release Robot Code',
  LEAVE_ROOM: 'Leave',
  WAITING: 'Waiting'
};

const LINK = {
  REGISTER_PLAYER: 'Registered Players',
  ENTER: 'Enter'
};

const GAME_TYPE = {
  PRACTICE: 1,
  MATCH: 2,
  TESTING: 3,
  TOURNAMENT: 4,
  AUTORUN: 5,
  REPLAY: 6,
  BATTLE: 7
};

const GAME_TYPE_ARRAY = [
  {
    name: 'Practice'
  },
  {
    name: 'Match'
  },
  {
    name: 'Testing'
  },
  {
    name: 'Tournament'
  }
];

const INVITATION_LOGS_GAME_TYPE = {
  TOURNAMENT: 'Tournament',
  ONLINE: 'Online'
};

const LIMIT_REGISTERED_USERS = 1000;

const getEnumValue = (type, key) => {
  let value = '';
  _.map(type.ARRAY_OBJECT, (item) => {
    if (item.key === key) { value = _.get(item, 'value'); }
  });
  return value;
};

const ADMIN_PUBLICATION = {
  TYPES: {
    HOME_PAGE: 'homepage',
    GENERAL: 'general',
    ACCOUNTS: 'accounts'
  }
};

const GAME_CONFIG_OPTION = {
  HUMAN: 'Human',
  AI: 'AI',
  DEFAULT: 'default',
  READY: "I'm ready",
  NONE: "None"
};

const PLAY_WITH_FRIEND_STATEMENT = {
  CAN_NOT_START: 'The game can not start until the guest is ready!',
  CAN_NOT_SWITCH: 'Can not switch team!'
};

const TOURNAMENT_ROUND_STATUS = {
  PREPARED: 'prepared',
  WAITING: 'waiting',
  IN_PROGRESS: 'inProgress',
  FINISH: 'finished',
  ARRAY_OBJECT: [
    {
      key: 'prepared',
      value: 'Prepared'
    },
    {
      key: 'waiting',
      value: 'Waiting'
    },
    {
      key: 'inProgress',
      value: 'In Progress'
    },
    {
      key: 'finished',
      value: 'Finished'
    }
  ]
};

const TOURNAMENT_SECTION_TYPE = {
  NEW_REGISTRATION: 'New Registration',
  UNRATED: 'Unrated',
  BOOSTER: 'Booster',
  PRIMARY: 'Primary',
  OPEN: 'Open',
  CHAMPIONSHIP: 'Championship'
};

const NOTIFICATION = {
  INVITE_TO_PLAY_GAME: 'inviteToPlayGame',
  TOURNAMENT_INVITE: 'tournamentInvite',
  FINISH_TOURNAMENT: 'tournamentEnd'
};

const MAX_NOTI_COUNT = 9;

const BILLING_TYPES = {
  MONTHLY: 'monthly',
  // ANNUAL: 'annual',
  ARRAY_OBJECT: [
    {
      key: 'MONTHLY',
      value: 'Monthly',
      text: 'month'
    }
    // {
    //   key: 'ANNUAL',
    //   value: 'Annual',
    //   text: 'year'
    // }
  ]
};

const PAYMENT_PLANS = {
  FREE_HUMAN: 'month-free-human',
  FREE_ROBOT: 'month-free-robot',
  MONTH_PRO_HUMAN: 'month-pro-human',
  YEAR_PRO_HUMAN: 'year-pro-human',
  MONTH_PRO_ROBOT: 'monthly',
  YEAR_PRO_ROBOT: 'year-pro-robot',
  MONTH_PRO_ROBOT_STUDENT: 'month-pro-robot-student'
};

const PAYMENT_PRICE = {
  // [BILLING_TYPES.ANNUAL]: {
  //   name: 'Annual',
  //   value: 'Annual Billing',
  //   interval: 'year',
  //   price: 299,
  //   planId: PAYMENT_PLANS.YEAR_PRO_ROBOT
  // },
  [BILLING_TYPES.MONTHLY]: {
    name: 'Monthly',
    value: "Monthly Billing",
    interval: 'month',
    price: 29.99,
    planId: PAYMENT_PLANS.MONTH_PRO_ROBOT
  }
};

const ACCOUNT_TYPES = {
  FREE: 'Free',
  PRO: 'Professional'
};

const PAYMENT_PRO = [PAYMENT_PLANS.MONTH_PRO_HUMAN, PAYMENT_PLANS.MONTH_PRO_ROBOT, PAYMENT_PLANS.YEAR_PRO_HUMAN, PAYMENT_PLANS.YEAR_PRO_ROBOT, PAYMENT_PLANS.MONTH_PRO_ROBOT_STUDENT];

const PAYMENT_FREE = [PAYMENT_PLANS.FREE_HUMAN, PAYMENT_PLANS.FREE_ROBOT];

const CARD_TYPE = {
  Visa: '/images/icon-visa.jpg',
  MasterCard: '/images/icon-master.jpg',
  Discover: '/images/icon-discover.jpg',
  'American Express': '/images/icon-express.jpg'
};

const ACTION_TYPE_SUPPORT_MESSAGE = {
  USER_TEXT: 'USER_TEXT',
  BOT_TEXT: 'BOT_TEXT',
  SUPPORT_TEXT: 'SUPPORT_TEXT'
};

const CHAT_SENDER = {
  REVEAL_ELEMENT: 'REVEAL_ELEMENT',
  USER_TEXT: 'USER_TEXT',
  SYSTEM: 'SYSTEM'
};
const RATING_FLOOR = 150;

const SCHOOL_GRADES = [
  { name: '1', value: 1 },
  { name: '2', value: 2 },
  { name: '3', value: 3 },
  { name: '4', value: 4 },
  { name: '5', value: 5 },
  { name: '6', value: 6 },
  { name: '7', value: 7 },
  { name: '8', value: 8 },
  { name: '9', value: 9 },
  { name: '10', value: 10 },
  { name: '11', value: 11 },
  { name: '12', value: 12 },
  { name: 'college +', value: 13 },
  { name: 'teacher', value: 14 }
];

const GENDERS = [
  { name: 'Both', value: 'Both' },
  { name: 'Male', value: 'M' },
  { name: 'Female', value: 'F' }
];

export const TITLE_ROUTE = {
  '/': 'Home page',
  '/notify': 'Notify',
  '/selectRole': 'Select role',
  '/signin': 'Sign in',
  '/signup': 'Sign up',
  '/tutorialLinks': 'Tutorials',
  '/invitationLogs': 'Invitation Log',
  '/gamesBoard': 'Games',
  '/buildMyAI': 'Build my AI',
  '/gamesRoomEntry': 'Game rooms',
  '/tournament': 'Tournament',
  '/gamesRoomTournamentNetwork': 'Tournaments room',
  '/forgot-password': 'Forgot password',
  '/reset-password': 'Reset password',
  '/my-account': 'My account',
  '/support': 'Support',
  '/forum': 'Forum',
  '/chat-support': 'Chat support',
  '/topic': 'Topic',
  '/guide': 'Guide',
  '/blog': 'Blog',
  '/playgame': 'Play game',
  '/error': 'Error',
  '/tournament-introduce': 'Tournament Introduce'
};

const DIMENSION_KEY_USER_TYPE = {
  AI_USER: 'dimension1',
  MANUAL_USER: 'dimension2',
  UNSIGNED_USER: 'dimension3',
  OTHER_USER: 'dimension4',
  ACCOUNT_TYPE: 'dimension5'
};

const GA_USER_TYPE = {
  AI_USER: 'AI User',
  MANUAL_USER: 'Manual User',
  UNSIGNED_USER: 'Unsigned',
  OTHER_USER: 'Other'
};

const GAME_INVITE_STATUS = {
  ACCEPT: 'Accepted',
  REJECT: 'Rejected',
  HOST_CANCEL: 'Host cancelled',
  WAITING: 'Waiting'
};

const USER_ACTION_IN_ROOM = {
  START_GAME: 'Start game',
  READY: 'Ready',
  NOT_READY: 'Not ready',
  JOIN_ROOM: 'Join room',
  QUIT_ROOM: 'Quit room',
  CHANGE_ROBOT_TYPE: 'Change Robot Type',
  CHANGE_HUMAN_TYPE: 'Change Human Type',
  CHANGE_ROBOT_VERSION: 'Change Robot Version'
};

const GOOGLE_ANALYTICS_ID = 'UA-114986010-1';
const GOOGLE_ANALYTICS_ID_QA = 'UA-114986010-2';
const COINS_WAGER = {
  PRACTICE: 100,
  BEGINNER: 25,
  ADVANCED: 50,
  TUTORIAL: 1000,
  CHALLENGE: 50
};

export const COINS_FEE = {
  CHALLENGE: 25
};

const ITEM_GAME_TYPE = {
  CUE: 'Cue',
  TABLE: 'Table',
  TANK: 'Tank',
  TILE: 'Tile',
  GRID: 'Grid',
  ITEM: 'Item'
};

const MIGRATION_CONST = {
  poolGameId: 'uN9W4QhmdKu94Qi2Y',
  tankGameId: 'tankwarmdKu94Qi2Y',
  canvasGameId: 'canvas029384sjuwe',
  algorithmGameId: 'algorithm3509fas',
  match3GameId: 'underminermdKu94Qi2Y',
  scratchGameId: "scratchm34fu94Qi2Y",
  flappybirdGameId: "flappybird342342",
  scratchtankGameId: "scratchtank7958732",
  tankscratch2GameId: "tankscratch2g039r0g3",
  candycrushGameId: "candycrushfc98",
  scratchSoccerGameId: "scratchsoccer820358",
  drawingturtleGameId: "drawingturtlef90w89er",
  ia_k_turtleGameId: "iakturtlef09328745",
  generalconceptsGameId: "generalconceptsp92835",
  cannonpongGameId: "cannonpong9v82q093ru",
  appleharvestGameId: "appleharvestadg932tq",
  recyclerGameId: "recycler0ugfwfaswp",
  codinggameGameId: "codinggame92834jf",
  algoScratchGameId: "algoscratch20738ufj",
  schoolAGameId: "schoollevelafuw0fje4",
  schoolBGameId: "schoollevelb2fuw",
  schoolAGameCHId: "schoollevelafuw0fje4CH",
  schoolBGameCHId: "schoollevelb2fuwCH",
  mazeGameId: "mazeafsd8dsf87",
  balloonBusterGameId: "balloonbustera7093hka"
};

export const MAIN_ITEMS = {
  [MIGRATION_CONST.poolGameId]: [
    ITEM_GAME_TYPE.CUE
  ],
  [MIGRATION_CONST.tankGameId]: [
    ITEM_GAME_TYPE.TANK
  ],
  [MIGRATION_CONST.match3GameId]: [
    ITEM_GAME_TYPE.ITEM
  ],
  [MIGRATION_CONST.canvasGameId]: [
    ITEM_GAME_TYPE.ITEM
  ],
  [MIGRATION_CONST.algorithmGameId]: [
    ITEM_GAME_TYPE.ITEM
  ]
};

export const BACKGROUND_ITEMS = {
  [MIGRATION_CONST.poolGameId]: [
    ITEM_GAME_TYPE.TABLE
  ],
  [MIGRATION_CONST.tankGameId]: [
    ITEM_GAME_TYPE.TILE
  ],
  [MIGRATION_CONST.match3GameId]: [
    ITEM_GAME_TYPE.GRID
  ]
};

const LANGUAGE_LEVEL = ['Learner', 'Beginner', 'Master'];

const SELECT_SCHOOL_TYPES = {
  SCHOOL: 'SCHOOL',
  AFTER_SCHOOL: 'AFTER_SCHOOL',
  INDIVIDUAL: 'INDIVIDUAL'
};

const USER_GROUP_VISIBILITY = [
  { name: 'Everyone', value: 'everyone' },
  { name: 'nobody', value: 'nobody' },
  { name: 'Only Moderators and Admins', value: 'onlyModeratorsAndAdmins' }
];

const USER_GROUP_MENTION = [
  { name: 'Everyone', value: 'everyone' },
  { name: 'nobody', value: 'nobody' },
  { name: 'Only Moderators and Admins', value: 'onlyModeratorsAndAdmins' }
];

const USER_GROUP_MESSAGE = [
  { name: 'Everyone', value: 'everyone' },
  { name: 'nobody', value: 'nobody' },
  { name: 'Only Moderators and Admins', value: 'onlyModeratorsAndAdmins' }
];

const USER_GROUP_VIEW = [
  { name: 'Everyone', value: 'everyone' },
  { name: 'nobody', value: 'nobody' },
  { name: 'Only Moderators and Admins', value: 'onlyModeratorsAndAdmins' }
];

const USER_GROUP_NOTIFICATION = [
  { name: 'Watching', value: 'watching' }
];

const GAME_OPTIONS = [
  { name: 'Trajectory Pool', value: 'uN9W4QhmdKu94Qi2Y' },
  { name: 'Smart Tank', value: 'tankwarmdKu94Qi2Y' }
];

const USER_TYPES = {
  USER: 'user',
  TEACHER: 'teacher',
  WAITING_FOR_APPROVAL: 'waiting-for-approval-as-teacher',
  SUPPORTER: 'supporter'
};

const REGISTER_CLASS_STATUS = {
  PENDING: 'Pending',
  APPROVE: 'Approved',
  DISAPPROVE: 'Disapproved'
};

const SLOT_OPTION = {
  NETWORK_PLAYER: 'NETWORK_PLAYER',
  ROBOT: 'ROBOT'
};

const PACKAGE_TYPES = {
  BEGINNER: 'starter',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  SCHOOLA: 'schoolA',
  SCHOOLB: 'schoolB'
};

const CHALLENGE_TYPES = {
  MY_BOT: 'ai',
  MY_SELF: 'manually'
};

const BUTTON_FOR_PHONE = [
  {
    id: 'backgroundButton',
    className: 'buttonWrapper',
    handleMove: true,
    noTouch: true
  },
  {
    id: 'upArrow',
    className: 'buttonArrow upArrowButton',
    key: 'U',
    handleMove: true
  },
  {
    id: 'upArrow2',
    className: 'buttonArrow upArrowButton upArrowButton2',
    key: 'U',
    handleMove: true
  },
  {
    id: 'downArrow',
    className: 'buttonArrow downArrowButton',
    key: 'D',
    handleMove: true
  },
  {
    id: 'downArrow2',
    className: 'buttonArrow downArrowButton downArrowButton2',
    key: 'D',
    handleMove: true
  },
  {
    id: 'leftArrow',
    className: 'buttonArrow leftArrowButton',
    key: 'L',
    handleMove: true
  },
  {
    id: 'leftArrow2',
    className: 'buttonArrow leftArrowButton leftArrowButton2',
    key: 'L',
    handleMove: true
  },
  {
    id: 'rightArrow',
    className: 'buttonArrow rightArrowButton',
    key: 'R',
    handleMove: true
  },
  {
    id: 'rightArrow2',
    className: 'buttonArrow rightArrowButton rightArrowButton2',
    key: 'R',
    handleMove: true
  },
  {
    id: 'shootButton',
    className: 'shootButton',
    key: 'S'
  },
  {
    id: 'shootButton2',
    className: 'shootButton shootButton2',
    key: 'S'
  },
  {
    id: 'damageButton',
    className: 'powerButton damagePower',
    key: '1'
  },
  {
    id: 'speedButton',
    className: 'powerButton speedPower',
    key: '2'
  },
  {
    id: 'healthRegenButton',
    className: 'powerButton healthRegenPower',
    key: '3'
  },
  {
    id: 'reloadButton',
    className: 'powerButton reloadPower',
    key: '4'
  }
];

export const BUTTON_HIGHLIGHT = ['upArrow2', 'downArrow2', 'leftArrow2', 'rightArrow2'];

export const CHALLENGE_HISTORY_LENGTH = 10;

export const DEFAULT_AVATAR = '/images/default_avatar3.jpg';



export const SIGN_UP_TYPES = [
  {
    name: ROLES.STUDENT,
    showAge: true
  },
  {
    name: ROLES.TEACHER
  }
];

export const COURSE_PRICE = {
  [MIGRATION_CONST.mazeGameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 1000
  },
  [MIGRATION_CONST.balloonBusterGameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 500
  },
  [MIGRATION_CONST.drawingturtleGameId]: {
    // [PACKAGE_TYPES.BEGINNER]: 800, // cent,
    [PACKAGE_TYPES.INTERMEDIATE]: 1000 // cent
  },
  [MIGRATION_CONST.tankscratch2GameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 2700 // cent
  },
  [MIGRATION_CONST.scratchSoccerGameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 1800 // cent
  },
  [MIGRATION_CONST.candycrushGameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 2000 // cent
  },
  [MIGRATION_CONST.tankGameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 2400, // cent
    [PACKAGE_TYPES.ADVANCED]: 1000 // cent
  },
  [MIGRATION_CONST.poolGameId]: {
    [PACKAGE_TYPES.INTERMEDIATE]: 1300, // cent
    [PACKAGE_TYPES.ADVANCED]: 500 // cent
  },
  [MIGRATION_CONST.algoScratchGameId]: {
    [PACKAGE_TYPES.ADVANCED]: 1000 // cent
  },
  [MIGRATION_CONST.algorithmGameId]: {
    [PACKAGE_TYPES.ADVANCED]: 1300 // cent
  }
};

export {
  PLAY_WITH_FRIEND_STATEMENT,
  GAME_INVITE_STATUS,
  GAME_CONFIG_OPTION,
  LEVELS,
  OPPONENTS,
  ROLES,
  LEVEL_IMAGES,
  REGISTER_BUTTON,
  TOURNAMENT_ORGANIZED_BY,
  TUTORIAL_STATUS,
  PLAYER_STATUS,
  BUTTON,
  USERS,
  TOURNAMENT_SECTION,
  GAME_TYPE,
  LEVEL_NUMBER,
  TOURNAMENT_STATUS,
  ADMIN_PUBLICATION,
  TOURNAMENT_SECTION_STATUS,
  LIMIT_REGISTERED_USERS,
  POINTS,
  TOURNAMENT_ROUND_STATUS,
  LINK,
  NOTIFICATION,
  MAX_NOTI_COUNT,
  TOURNAMENT_REWARD,
  GAME_MATCH_STATUS,
  BILLING_TYPES,
  PAYMENT_PLANS,
  ACCOUNT_TYPES,
  getEnumValue,
  RATING_FLOOR,
  PLAYER_TYPE,
  CARD_TYPE,
  NOTIFICATION_ACTION,
  TRACK_USER_FROM_CHANNELS,
  ACTION_TYPE_SUPPORT_MESSAGE,
  GOOGLE_ANALYTICS_ID,
  GOOGLE_ANALYTICS_ID_QA,
  DIMENSION_KEY_USER_TYPE,
  GA_USER_TYPE,
  GENDER_VALUE,
  TUTORIAL_GROUP,
  CHAT_SENDER,
  USER_ACTION_IN_ROOM,
  TUTORIAL_LEVEL,
  TUTORIAL_IMAGE,
  COINS_WAGER,
  DEFAULT_BATTLE_PROJECT_ID,
  DEFAULT_BATTLE_PROJECT_ID_RECYCLER,
  ITEM_GAME_TYPE,
  GAME_TYPE_ARRAY,
  INVITATION_LOGS_GAME_TYPE,
  TOURNAMENT_SECTION_ROUND_STATUS,
  TOURNAMENT_SECTION_TYPE,
  SCHOOL_GRADES,
  GENDERS,
  MIGRATION_CONST,
  LANGUAGE_LEVEL,
  SELECT_SCHOOL_TYPES,
  USER_GROUP_VISIBILITY,
  USER_GROUP_MENTION,
  USER_GROUP_VIEW,
  USER_GROUP_NOTIFICATION,
  USER_GROUP_MESSAGE,
  GAME_OPTIONS,
  USER_TYPES,
  REGISTER_CLASS_STATUS,
  MULTIPLAYER_MODE,
  MULTIPLAYER_MODE_MAP,
  SLOT_OPTION,
  PACKAGE_TYPES,
  CHALLENGE_TYPES,
  BUTTON_FOR_PHONE,
  PAYMENT_FREE,
  PAYMENT_PRO,
  PAYMENT_PRICE
};
