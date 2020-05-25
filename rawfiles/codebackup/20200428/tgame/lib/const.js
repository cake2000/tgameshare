const TIMES = {
  // Tournament will start and show confirm popup before 5 min
  START_TOURNAMENT_BEFORE: 5,
  // Allow user to join tournament after tournament section round start 2 min
  OVERTIME_TOURNAMENT: 2,
  CANNOT_RES_WITHDRAW_TOURNAMENT_BEFORE: 5
};


const MESSAGES = content => ({
  UPDATE_BIRTHDAY: {
    TITLE: 'Please update your info',
    MESSAGE: 'To upgrade your account. You have to update fully your info includes first name, last name, gender and your birthday!'
  },
  GAME_ROOM_TOURNAMENT_DATA: {
    CURRENT_TOURNAMENT_TITLE: 'Current Tournaments ',
    PAST_TOURNAMENT_TITLE: 'Past Tournaments ',
    EMPTY_REGISTERED_USERS: 'There is no registered players yet',
    PLAYERS_NAME: 'PLAYERS\' NAME',
    REGISTERED_USER_MODAL_TITLE: 'Registered Players',
    TOURNAMENT_GAME_ROUNDS: 'Section Scoreboards',
    LOWER: `Your ${content} is lower than `,
    OLDER: `Your ${content} is older than `,
    SECTION_FULL: 'This section is full, please choose another sections',
    CANNOT_WITHDRAW: `The tournament is about to start in ${content} minutes`,
    ALREADY_JOINED_ANOTHER_SECTION: 'You have already joined another section',
    JOIN_TOURNAMENT: 'Join Tournament\'s Game',
    TIMES_REMAIN_START_TOURNAMENT: 'Join tournament game now!',
    LATE_TOURNAMENT: ` You are late! ${TIMES.OVERTIME_TOURNAMENT} minutes added!`,
    TIME_UP: 'You are too late for this round. Please wait for the next round.',
    PLEASE_JOIN: 'Please join the game venue when you are ready',
    TOURNAMENT: 'Tournament: ',
    SECTION: 'Section: ',
    ROUND: 'Round: ',
    TOURNAMENT_GAME: 'Tournament\'s game',
    LUCKY: 'You are very lucky - no one want to play with you!!!',
    OPPONENT_CANCEL: 'Your opponent do not want to join this game.',
    TIME_UP_IN_ROOM: 'Time is up, your opponent didn\'t join this game.',
    WINNER: 'You won',
    TOP_PLAYER: `Congratulation!!! You finished tournament at ${content} place`,
    REWARD: `Reward is ${content}!!!`
  },
  SIGNUP_FORM: {
    ERRORS: {
      TERM_ACCEPT_REQUIRED: 'You must accept Terms & Privacy Policy to sign up',
      EMAIL_INVAILD: 'Invalid email address',
      USERNAME_REQUIRED: 'User ID is required',
      USERNAME_NO_SPACE: 'User ID can not have space',
      PASSWORD_INVAILD: 'Password have at lest 8 character',
      PASSWORD_REQUIRED: 'Password is required',
      PASSWORD_NOT_MATCH: 'Password does not match',
      ACCOUNT_TYPE_REQUIRED: 'Account Type is required',
      AGE_REQUIRED: 'Age is required',
      EMAIL_PATT: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      USERNAME_IS_TOO_LONG: 'Username must be less than 15 characters',
      SCHOOL_REQUIRED: 'School is required',
      FIRST_NAME_REQUIRED: 'First name is required',
      LAST_NAME_REQUIRED: 'Last name is required'
    }
  },
  UPGRADE_ACCOUNT_MODAL: {
    TITLE: 'Account Plans',
    BILLING_TYPE: 'Billing Type:',
    BUTTON_CANCEL: 'Cancel',
    BUTTON_CANCEL_ACCOUNT: 'Cancel Account',
    BUTTON_UPGRADE: 'Upgrade',
    BUTTON_UPDATE_PERIOD: 'Update Pay Period',
    FREE_PRICE: 'Free',
    CURRENT_PLAN: 'Current Plan',
    BUTTON_DOWNGRADE: 'Downgrade',
    PAID_BY_SCHOOL: 'Paid By Your School'
  },
  PAYMENT_DETAIL_MODAL: {
    TITLE: 'Payment'
  },
  ADD_PAYMENT_CARD_MODAL: {
    TITLE: 'Premium Account',
    DEFAULT_TITLE: 'Payment'
  },
  MY_ACCOUNT_COMPONENT: {
    UPGRADE_BUTTON: 'Upgrade',
    DOWNGRADE_BUTTON: 'Cancel Plan',
    MARK_DEFAULT: 'Set as default',
    CARD_HOLDER: 'Holder:',
    CARD_NUMBER: 'Card No.:',
    CARD_EXP: 'Exp Date:',
    CARD_ZIPCODE: 'Zip Code:',
    REMOVE_CARD: 'Remove',
    DEFAULT_CARD: 'Default Card',
    NO_CARD: 'You haven\'t added any card. Please add card to payment'
  },
  LEADERBOARD: {
    MISSING_MY_BOT: 'Your official bot release is not specified',
    MISSING_OPPONENT_BOT: "Your opponent's official bot release is not specified"
  }
});

const MONTHS = {
  TOURNAMENT_LIST: {

  }
};

const MAINLAYOUT_STATEMENT = {
  NEW_INVITATION: 'You have new invitation'
};

const GAMEBOARD_STATEMENT = {
  NOT_LEVEL: 'Level is required!',
  NOT_RELEASE: 'You need to complete the beginner tutorials for robot development and release a production version of your code before your robot can play games. ',
  LINK_TO_ROBOT_PAGE: 'Go to the Robot Page'
};

const TUTORIAL_STATEMENT = {
  NOT_STUDY: 'Error! You haven\'t started any tutorials!',
  SUCCESS_RELEASE_AI: 'Your robot release is successful.',
  PLACEHOLDER_TAG_RELEASE_AI: 'Tag your robot release',
  NOT_NAME: 'Error! You need input the robot code name!',
  EXIST_NAME: 'Error! Your input name is existed. Please input another name',
  NO_EXIST_NAME: 'Error! The release name does not exist!'
};

const VERIFY_MESSAGE = {
  VERIFY: 'Verifying...',
  VERIFY_ERROR: 'Opps! Your verification account have something wrong'
};

const CURRENCY = {
  USD: 'usd'
};


const LAYOUT_OPTION_2_TEXT = {
  OPTION1: 'Control left, Game Right',
  OPTION2: 'Game fullscreen'
};


const LAYOUT_OPTION_2 = {
  OPTION1: [{
    i: 'control',
    x: 0,
    y: 0,
    w: 6,
    h: 12
  }, {
    i: 'game',
    x: 6,
    y: 0,
    w: 6,
    h: 12
  }],
  OPTION2: [{
    i: 'control',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 12,
    h: 12
  }]
};

const LAYOUT_OPTION_TEXT = {
  OPTION1: 'Lecture left, Editor/Game right',
  OPTION2: 'Lecture left, Editor right',
  OPTION3: 'Editor fullscreen',
  OPTION4: 'Game fullscreen',
  OPTION5: 'Editor left, Game right',
  OPTION6: 'Lecture fullscreen'
};

const LAYOUT_OPTION = {
  OPTION1: [{
    i: 'chat',
    x: 0,
    y: 0,
    w: 6,
    h: 12
  }, {
    i: 'editor',
    x: 6,
    y: 0,
    w: 6,
    h: 6
  }, {
    i: 'game',
    x: 6,
    y: 6,
    w: 6,
    h: 6
  }],
  OPTION2: [{
    i: 'chat',
    x: 0,
    y: 0,
    w: 6,
    h: 12
  }, {
    i: 'editor',
    x: 6,
    y: 0,
    w: 6,
    h: 12
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }],
  OPTION3: [{
    i: 'editor',
    x: 0,
    y: 0,
    w: 12,
    h: 12
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }, {
    hide: true,
    i: 'chat',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }],
  OPTION4: [{
    i: 'game',
    x: 0,
    y: 0,
    w: 12,
    h: 12
  }, {
    i: 'editor',
    hide: true,
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }, {
    hide: true,
    i: 'chat',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }],
  OPTION5: [{
    i: 'editor',
    x: 0,
    y: 0,
    w: 6,
    h: 12
  }, {
    i: 'game',
    x: 6,
    y: 0,
    w: 6,
    h: 12
  }, {
    hide: true,
    i: 'chat',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }],
  OPTION6: [{
    i: 'chat',
    x: 0,
    y: 0,
    w: 12,
    h: 12
  }, {
    hide: true,
    i: 'game',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }, {
    hide: true,
    i: 'editor',
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }]
};

const PREDEFINED_ANSWER_POOL_20 = `
function getEndStateDistance(endState) {
  let minDist = 10000;
  const legalBallIDs = getLegalBallIDs();
  for (let i = 0; i < legalBallIDs.length; i++) {
    const ballID = legalBallIDs[i];
    if (endState[ballID].inPocketID != null) continue;
    const d = dist2(endState[0], endState[ballID]);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}




async function getCallShotCommand(skipIndirect) {
  let bestCommand = {
    probability: -1
  };
  const IDList = getLegalBallIDs();
  for (let k = 0; k <= IDList.length - 1; k++) {
    const ball_id = IDList[k];
    for (let pocket_id = 0; pocket_id <= 5; pocket_id++) {
      if (isPocketBlockedFromBall(ball_id, pocket_id)) {
        continue;
      }
      if (isSidePocketWithLargeSkew(ball_id, pocket_id)) {
        continue;
      }

      const StrengthList = [20, 40, 70];
      for (let j = 0; j <= StrengthList.length - 1; j++) {
        const cmd = await getCommand(pocket_id, ball_id, StrengthList[j], skipIndirect);
        const endState = await calculateEndState(cmd);
        if (endState[0].inPocketID != null) continue;
        if (endState[1].inPocketID != null && ball_id != 1) continue;

        cmd.distance = getEndStateDistance(endState);
        if (cmd.probability > 70 && bestCommand.probability > 70) {
          if (cmd.distance < bestCommand.distance) {
            bestCommand = cmd;
          }
        } else {
          if (cmd.probability > bestCommand.probability) {
            bestCommand = cmd;
          }
        }
      }
    }
  }
  return bestCommand;
}

async function getCallShot() {
  let cmd = await getCallShotCommand(true);
  const secondsLeft = await getSecondsLeft();
  const IDList = getLegalBallIDs();
  if (secondsLeft < 300 || cmd.probability > 70 || IDList.length > 4) {
    return cmd;
  }
  return await getCallShotCommand(false);
}


async function getCommand(pocketID, ballID, s, skipIndirect) {
  const cmds = [];
  const ballBlocked = isPathBlocked(Balls[0], Balls[ballID]);
  if (!ballBlocked) {
    const aim = extrapolatePoints(Pockets[pocketID], Balls[ballID], BallDiameter);
    const cmd = {
      aimx: aim.x,
      aimy: aim.y,
      strength: s,
      targetPocketID: pocketID,
      targetBallID: ballID
    };
    cmd.probability = await calculateProbability(cmd);
    if (cmd.probability > 70 || s < 40 || skipIndirect) return cmd;
    cmds.push(cmd);
  }
  if (skipIndirect) return {
    probability: -1
  };
  cmds.push(await getComboShotCommand(ballID, pocketID, s));
  cmds.push(await getKickShotCommandVertical(ballID, pocketID, s));
  cmds.push(await getKickShotCommandHorizontal(ballID, pocketID, s));
  if (!ballBlocked) cmds.push(await getBankShotCommandVertical(ballID, pocketID, s));
  if (!ballBlocked) cmds.push(await getBankShotCommandHorizontal(ballID, pocketID, s));

  let bestCommand = {
    probability: -1
  };
  for (let k = 0; k < cmds.length; k++) {
    if (cmds[k].probability > bestCommand.probability) {
      bestCommand = cmds[k];
    }
  }
  return bestCommand;
}


async function getComboShotCommand(ball_id, pocket_id, strength) {
  let bestCommand = {
    probability: -1
  };
  if (isPocketCutAngleTooBig(ball_id, pocket_id))
    return bestCommand;
  const IDList = getLegalBallIDs();
  for (let k = 0; k <= IDList.length - 1; k++) {
    const helper_ball_id = IDList[k];
    if (isPathBlocked(Balls[ball_id], Balls[helper_ball_id])) continue;
    if (isPathBlocked(Balls[0], Balls[helper_ball_id])) continue;
    const pointP = extrapolatePoints(Pockets[pocket_id], Balls[ball_id], BallDiameter);
    const pointQ = extrapolatePoints(pointP, Balls[helper_ball_id], BallDiameter);
    const cmd = {
      aimx: pointQ.x,
      aimy: pointQ.y,
      strength: strength,
      targetBallID: ball_id,
      targetPocketID: pocket_id
    };
    cmd.probability = await calculateProbability(cmd);
    if (cmd.probability > bestCommand.probability) {
      bestCommand = cmd;
    }
  }
  return bestCommand;
}


async function getBankShotCommandHorizontal(ball_id, pocket_id, strength) {
  const targetPocket = Pockets[pocket_id];
  let mirrorLine = RIGHT_X;
  if ([0, 5].includes(pocket_id)) mirrorLine = LEFT_X;
  const mirrorPoint = {
    y: targetPocket.y,
    x: 2 * mirrorLine - targetPocket.x
  };
  let aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
  let cmd = {
    aimx: aimingPoint.x,
    aimy: aimingPoint.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 20; k++) {

    const CTP = await calculateCTP(cmd, ball_id, targetPocket);


    const errorInY = Math.abs(CTP.y - targetPocket.y);


    if (CTP.y > targetPocket.y) {
      mirrorPoint.y = mirrorPoint.y - errorInY;
    } else {
      mirrorPoint.y = mirrorPoint.y + errorInY;
    }
    aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
    cmd = {
      aimx: aimingPoint.x,
      aimy: aimingPoint.y,
      strength: strength,
      targetBallID: ball_id,
      targetPocketID: pocket_id
    };
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}


async function getBankShotCommandVertical(ball_id, pocket_id, strength) {
  const targetPocket = Pockets[pocket_id];
  let mirrorLine = TOP_Y;
  if ([0, 1, 2].includes(pocket_id)) mirrorLine = BOTTOM_Y;
  const mirrorPoint = {
    x: targetPocket.x,
    y: 2 * mirrorLine - targetPocket.y
  };
  let aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
  let cmd = {
    aimx: aimingPoint.x,
    aimy: aimingPoint.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 20; k++) {

    const CTP = await calculateCTP(cmd, ball_id, targetPocket);


    const errorInX = Math.abs(CTP.x - targetPocket.x);


    if (CTP.x > targetPocket.x) {
      mirrorPoint.x = mirrorPoint.x - errorInX;
    } else {
      mirrorPoint.x = mirrorPoint.x + errorInX;
    }
    aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
    cmd = {
      aimx: aimingPoint.x,
      aimy: aimingPoint.y,
      strength: strength,
      targetBallID: ball_id,
      targetPocketID: pocket_id
    };
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}


async function getKickShotCommand(ball_id, pocket_id, strength) {
  const cmdv = await getKickShotCommandVertical(ball_id, pocket_id, strength);
  const cmdh = await getKickShotCommandHorizontal(ball_id, pocket_id, strength);
  if (cmdv.probability > cmdh.probability) {
    return cmdv;
  } else {
    return cmdh;
  }
}


async function getKickShotCommandHorizontal(ball_id, pocket_id, strength) {
  const targetBallPos = Balls[ball_id];

  const contactPos = extrapolatePoints(Pockets[pocket_id], Balls[ball_id], BallDiameter);


  let mirrorLine = LEFT_X;
  if ([0, 5].includes(pocket_id)) mirrorLine = RIGHT_X;
  const mirrorPos = {
    x: 2 * mirrorLine - contactPos.x,
    y: contactPos.y,
  };

  const cmd = {
    aimx: mirrorPos.x,
    aimy: mirrorPos.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 5; k++) {

    const closestPoint = await calculateCTP(cmd, 0, contactPos);
    const errorInY = Math.abs(closestPoint.y - contactPos.y);
    if (closestPoint.y > contactPos.y) {
      cmd.aimy = cmd.aimy - errorInY;
    } else {
      cmd.aimy = cmd.aimy + errorInY;
    }
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}


async function getKickShotCommandVertical(ball_id, pocket_id, strength) {
  const targetBallPos = Balls[ball_id];

  const contactPos = extrapolatePoints(Pockets[pocket_id], Balls[ball_id], BallDiameter);


  let mirrorLine = TOP_Y;
  if ([0, 1, 2].includes(pocket_id)) mirrorLine = BOTTOM_Y;
  const mirrorPos = {
    x: contactPos.x,
    y: 2 * mirrorLine - contactPos.y
  };

  const cmd = {
    aimx: mirrorPos.x,
    aimy: mirrorPos.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 5; k++) {

    const closestPoint = await calculateCTP(cmd, 0, contactPos);
    const errorInX = Math.abs(closestPoint.x - contactPos.x);
    if (closestPoint.x > contactPos.x) {
      cmd.aimx = cmd.aimx - errorInX;
    } else {
      cmd.aimx = cmd.aimx + errorInX;
    }
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}


function getCueBallPlacement() {
  const pocketIDs = [0, 2, 3, 5];
  const IDList = getLegalBallIDs();
  for (let i = 0; i <= IDList.length - 1; i++) {
    const ball_id = IDList[i];
    for (let j = 0; j <= pocketIDs.length - 1; j++) {
      const k = pocketIDs[j];
      const isPocketBlocked = isPathBlocked(Pockets[k], Balls[ball_id]);
      if (!isPocketBlocked) {
        const p = extrapolatePoints(Pockets[k], Balls[ball_id], 2 * BallDiameter);

        const X_LIMIT = 937;
        const Y_LIMIT = 435;
        if (p.x <= X_LIMIT && p.x >= 0 - X_LIMIT && p.y <= Y_LIMIT && p.y >= 0 - Y_LIMIT)
          return p;
      }
    }
  }
}


function getBreakShot() {
  return {
    aimx: 0,
    aimy: 0,
    strength: 100,
    spin: 1
  };
}


function getLegalBallIDs() {
  const IDs = [];

  for (let i = 2; i < Balls.length; i++) {
    const ballInfo = Balls[i];
    if (!ballInfo.inPocket) {
      if (MyColorType == null) {
        IDs.push(i);
      } else {
        if (ballInfo.colorType == MyColorType) {
          IDs.push(i);
        }
      }
    }
  }
  if (IDs.length == 0) {
    IDs.push(1);
  }
  return IDs;
}


function checkBallDistance() {
  const IDs = [1, 3, 4, 5];
  const tableCenter = {
    x: 0,
    y: 0
  };
  let shortestDistance = null;
  let closestBallID = null;
  for (let k = 0; k < IDs.length; k++) {
    const id = IDs[k];
    const ballInfo = Balls[id];
    const ballDistance = dist2(ballInfo, tableCenter);
    print(ballDistance);
    if (shortestDistance == null) {
      shortestDistance = ballDistance;
      closestBallID = id;
    } else {
      if (ballDistance < shortestDistance) {
        shortestDistance = ballDistance;
        closestBallID = id;
      }
    }
  }
  print("shortest distance: " + shortestDistance);
  print("closest ball: " + Balls[closestBallID].x + ", " + Balls[closestBallID].y);
}


function isBallBlocked(ball_id) {
  const targetBallPosition = Balls[ball_id];
  const cueBallPosition = Balls[0];
  return isPathBlocked(cueBallPosition, targetBallPosition);
}


function isPocketBlockedFromBall(ball_id, pocket_id) {
  const ballPosition = Balls[ball_id];
  const pocketPosition = Pockets[pocket_id];
  return isPathBlocked(ballPosition, pocketPosition);
}


function isPocketCutAngleTooBig(ball_id, pocket_id) {
  const angle = calculateCutAngle(ball_id, pocket_id);


  if (angle >= 90) {
    return true;
  }

  const pocketDistance = dist2(Pockets[pocket_id], Balls[ball_id]);

  if (pocketDistance > 1000 && angle >= 60) {
    return true;
  }

  return false;
}


function isSidePocketWithLargeSkew(ball_id, pocket_id) {
  if (pocket_id != 1 && pocket_id != 4) return false;
  const angle = calculateSidePocketSkew(ball_id, pocket_id);
  return angle >= 45;
}
`;

const PREDEFINED_ANSWER_POOL_19 = `
async function getCallShotCommand(skipIndirect) {
  let bestCommand = {
    probability: -1
  };
  const IDList = getLegalBallIDs();
  for (let k = 0; k <= IDList.length - 1; k++) {
    const ball_id = IDList[k];
    for (let pocket_id = 0; pocket_id <= 5; pocket_id++) {
      if (isPocketBlockedFromBall(ball_id, pocket_id)) { continue; }
      if (isSidePocketWithLargeSkew(ball_id, pocket_id)) { continue; }

      const StrengthList = [20, 40, 70];
      for (let j = 0; j <= StrengthList.length - 1; j++) {
        const cmd = await getCommand(pocket_id, ball_id, StrengthList[j], skipIndirect);
        if (cmd.probability > bestCommand.probability) {
          bestCommand = cmd;
        }
        if (cmd.probability > 80) {
          break;
        }
      }
    }
  }
  return bestCommand;
}

async function getCallShot() {
  let cmd = await getCallShotCommand(true);
  const secondsLeft = await getSecondsLeft();
  const IDList = getLegalBallIDs();
  if (secondsLeft < 300 || cmd.probability > 70 || IDList.length > 4) {
    return cmd;
  }
  return await getCallShotCommand(false);
}

async function getCommand(pocketID, ballID, s, skipIndirect) {
  const cmds = [];
  const ballBlocked = isPathBlocked(Balls[0], Balls[ballID]);
  if (!ballBlocked) {
    const aim = extrapolatePoints(Pockets[pocketID], Balls[ballID], BallDiameter);
    const cmd = {aimx: aim.x, aimy: aim.y, strength: s, targetPocketID: pocketID, targetBallID: ballID};
    cmd.probability = await calculateProbability(cmd);
    if (cmd.probability > 70 || s < 40 || skipIndirect) return cmd;
    cmds.push(cmd);
  }
  if (skipIndirect) return {probability: -1};
  cmds.push(await getComboShotCommand(ballID, pocketID, s));
  cmds.push(await getKickShotCommandVertical(ballID, pocketID, s));
  cmds.push(await getKickShotCommandHorizontal(ballID, pocketID, s));
  if (!ballBlocked) cmds.push(await getBankShotCommandVertical(ballID, pocketID, s));
  if (!ballBlocked) cmds.push(await getBankShotCommandHorizontal(ballID, pocketID, s));

  let bestCommand = {
    probability: -1
  };
  for (let k = 0; k < cmds.length; k++) {
    if (cmds[k].probability > bestCommand.probability) {
      bestCommand = cmds[k];
    }
  }
  return bestCommand;
}

async function getComboShotCommand(ball_id, pocket_id, strength) {
  let bestCommand = {probability: -1};
  if (isPocketCutAngleTooBig(ball_id, pocket_id)) 
      return bestCommand;
  const IDList = getLegalBallIDs();
  for (let k = 0; k <= IDList.length - 1; k++) {
      const helper_ball_id = IDList[k];
      if (isPathBlocked(Balls[ball_id], Balls[helper_ball_id])) continue;
      if (isPathBlocked(Balls[0], Balls[helper_ball_id])) continue;
      const pointP = extrapolatePoints(Pockets[pocket_id], Balls[ball_id], BallDiameter);
      const pointQ = extrapolatePoints(pointP, Balls[helper_ball_id], BallDiameter);
      const cmd = {
        aimx: pointQ.x,  aimy: pointQ.y,  strength: strength, 
        targetBallID: ball_id, targetPocketID: pocket_id
      };
      cmd.probability = await calculateProbability(cmd);
      if (cmd.probability > bestCommand.probability) {
        bestCommand = cmd;
      }
    }
    return bestCommand;
}




async function getBankShotCommandHorizontal(ball_id, pocket_id, strength) {
  const targetPocket = Pockets[pocket_id];
  let mirrorLine = RIGHT_X;
  if ([0, 5].includes(pocket_id)) mirrorLine = LEFT_X;
  const mirrorPoint = {
    y: targetPocket.y,
    x: 2 * mirrorLine - targetPocket.x
  };
  let aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
  let cmd = {
    aimx: aimingPoint.x,
    aimy: aimingPoint.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 20; k++) {
    // calculate closest trajectory point for ball and target pocket
    const CTP = await calculateCTP(cmd, ball_id, targetPocket);

    // calculate error in y coordinates
    const errorInY = Math.abs(CTP.y - targetPocket.y);

    // adjust aiming point horizontally based on error
    if (CTP.y > targetPocket.y) {
      mirrorPoint.y = mirrorPoint.y - errorInY;
    } else {
      mirrorPoint.y = mirrorPoint.y + errorInY;
    }
    aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
    cmd = {
      aimx: aimingPoint.x,
      aimy: aimingPoint.y,
      strength: strength,
      targetBallID: ball_id,
      targetPocketID: pocket_id
    };
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}

async function getBankShotCommandVertical(ball_id, pocket_id, strength) {
  const targetPocket = Pockets[pocket_id];
  let mirrorLine = TOP_Y;
  if ([0, 1, 2].includes(pocket_id)) mirrorLine = BOTTOM_Y;
  const mirrorPoint = {
    x: targetPocket.x,
    y: 2 * mirrorLine - targetPocket.y
  };
  let aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
  let cmd = {
    aimx: aimingPoint.x,
    aimy: aimingPoint.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 20; k++) {
    // calculate closest trajectory point for ball and target pocket
    const CTP = await calculateCTP(cmd, ball_id, targetPocket);

    // calculate error in x coordinates
    const errorInX = Math.abs(CTP.x - targetPocket.x);

    // adjust aiming point horizontally based on error
    if (CTP.x > targetPocket.x) {
      mirrorPoint.x = mirrorPoint.x - errorInX;
    } else {
      mirrorPoint.x = mirrorPoint.x + errorInX;
    }
    aimingPoint = extrapolatePoints(mirrorPoint, Balls[ball_id], BallDiameter);
    cmd = {
      aimx: aimingPoint.x,
      aimy: aimingPoint.y,
      strength: strength,
      targetBallID: ball_id,
      targetPocketID: pocket_id
    };
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}

async function getKickShotCommand(ball_id, pocket_id, strength) {
  const cmdv = await getKickShotCommandVertical(ball_id, pocket_id, strength);
  const cmdh = await getKickShotCommandHorizontal(ball_id, pocket_id, strength);
  if (cmdv.probability > cmdh.probability) {
    return cmdv;
  } else {
    return cmdh;
  }
}


async function getKickShotCommandHorizontal(ball_id, pocket_id, strength) {
  const targetBallPos = Balls[ball_id];

  const contactPos = extrapolatePoints(Pockets[pocket_id], Balls[ball_id], BallDiameter);


  let mirrorLine = LEFT_X;
  if ([0, 5].includes(pocket_id)) mirrorLine = RIGHT_X;
  const mirrorPos = {
    x: 2 * mirrorLine - contactPos.x,
    y: contactPos.y,
  };

  const cmd = {
    aimx: mirrorPos.x, aimy: mirrorPos.y, strength: strength, targetBallID: ball_id, targetPocketID: pocket_id
  };

  for (let k = 0; k < 5; k++) {

    const closestPoint = await calculateCTP(cmd, 0, contactPos);
    const errorInY = Math.abs(closestPoint.y - contactPos.y);
    if (closestPoint.y > contactPos.y) {
      cmd.aimy = cmd.aimy - errorInY;
    } else {
      cmd.aimy = cmd.aimy + errorInY;
    }
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}


async function getKickShotCommandVertical(ball_id, pocket_id, strength) {
  const targetBallPos = Balls[ball_id];

  const contactPos = extrapolatePoints(Pockets[pocket_id], Balls[ball_id], BallDiameter);


  let mirrorLine = TOP_Y;
  if ([0, 1, 2].includes(pocket_id)) mirrorLine = BOTTOM_Y;
  const mirrorPos = {
    x: contactPos.x,
    y: 2 * mirrorLine - contactPos.y
  };

  const cmd = {
    aimx: mirrorPos.x,
    aimy: mirrorPos.y,
    strength: strength,
    targetBallID: ball_id,
    targetPocketID: pocket_id
  };

  for (let k = 0; k < 5; k++) {

    const closestPoint = await calculateCTP(cmd, 0, contactPos);
    const errorInX = Math.abs(closestPoint.x - contactPos.x);
    if (closestPoint.x > contactPos.x) {
      cmd.aimx = cmd.aimx - errorInX;
    } else {
      cmd.aimx = cmd.aimx + errorInX;
    }
  }
  cmd.probability = await calculateProbability(cmd);
  return cmd;
}


function getCueBallPlacement() {
  const pocketIDs = [0, 2, 3, 5];
  const IDList = getLegalBallIDs();
  for (let i = 0; i <= IDList.length - 1; i++) {
    const ball_id = IDList[i];
    for (let j = 0; j <= pocketIDs.length - 1; j++) {
      const k = pocketIDs[j];
      const isPocketBlocked = isPathBlocked(Pockets[k], Balls[ball_id]);
      if (!isPocketBlocked) {
        const p = extrapolatePoints(Pockets[k], Balls[ball_id], 2 * BallDiameter);

        const X_LIMIT = 937;
        const Y_LIMIT = 435;
        if (p.x <= X_LIMIT && p.x >= 0 - X_LIMIT && p.y <= Y_LIMIT && p.y >= 0 - Y_LIMIT)
          return p;
      }
    }
  }
}


function getBreakShot() {
  return {
    aimx: 0,
    aimy: 0,
    strength: 100,
    spin: 1
  };
}


function getLegalBallIDs() {
  const IDs = [];

  for (let i = 2; i < Balls.length; i++) {
    const ballInfo = Balls[i];
    if (!ballInfo.inPocket) {
      if (MyColorType == null) {
        IDs.push(i);
      } else {
        if (ballInfo.colorType == MyColorType) {
          IDs.push(i);
        }
      }
    }
  }
  if (IDs.length == 0) {
    IDs.push(1);
  }
  return IDs;
}


function checkBallDistance() {
  const IDs = [1, 3, 4, 5];
  const tableCenter = {
    x: 0,
    y: 0
  };
  let shortestDistance = null;
  let closestBallID = null;
  for (let k = 0; k < IDs.length; k++) {
    const id = IDs[k];
    const ballInfo = Balls[id];
    const ballDistance = dist2(ballInfo, tableCenter);
    print(ballDistance);
    if (shortestDistance == null) {
      shortestDistance = ballDistance;
      closestBallID = id;
    } else {
      if (ballDistance < shortestDistance) {
        shortestDistance = ballDistance;
        closestBallID = id;
      }
    }
  }
  print("shortest distance: " + shortestDistance);
  print("closest ball: " + Balls[closestBallID].x + ", " + Balls[closestBallID].y);
}


function isBallBlocked(ball_id) {
  const targetBallPosition = Balls[ball_id];
  const cueBallPosition = Balls[0];
  return isPathBlocked(cueBallPosition, targetBallPosition);
}


function isPocketBlockedFromBall(ball_id, pocket_id) {
  const ballPosition = Balls[ball_id];
  const pocketPosition = Pockets[pocket_id];
  return isPathBlocked(ballPosition, pocketPosition);
}


function isPocketCutAngleTooBig(ball_id, pocket_id) {
  const angle = calculateCutAngle(ball_id, pocket_id);


  if (angle >= 90) {
    return true;
  }

  const pocketDistance = dist2(Pockets[pocket_id], Balls[ball_id]);

  if (pocketDistance > 1000 && angle >= 60) {
    return true;
  }

  return false;
}


function isSidePocketWithLargeSkew(ball_id, pocket_id) {
  if (pocket_id != 1 && pocket_id != 4) return false;
  const angle = calculateSidePocketSkew(ball_id, pocket_id);
  return angle >= 45;
}
`;

const PREDEFINED_ANSWER_TANK_26 = `
var graph = null;
var dangerScores = null;
var inEndGameMode = false;
var rankings = {};

function setWeaponRankings() {
  if (inEndGameMode) {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 6;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 5;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 4;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 2;
    rankings[0] = 7;
    return;
  }

  var cmd = attackOpponent();
  if (cmd != "") {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 5;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 4;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 2;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
    rankings[0] = 7;
    return;
  }

  rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 4;
  rankings[SPECIAL_WEAPON_TYPES.NOVA] = 2;
  rankings[SPECIAL_WEAPON_TYPES.WAY4] = 1;
  rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 3;
  rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 5;
  rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 0;
  rankings[0] = 7;

  if (
    Tanks.filter(t => t.color == MyTank.color).length == 1 &&
    MyTank.specialPower.damage < 2
  ) {
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
  }
}

function weaponIsBetter(weaponType1, weaponType2) {
  return rankings[weaponType1] < rankings[weaponType2];
}

function calcDangerScores() {
  dangerScores = createNewGraph();
  for (var t of Tanks) {
    if (t.color == MyTank.color || t.isFrozen) continue;
    var dscore = 1 + t.specialPower.damage;
    var range = getWeaponRange(t.specialWeapon.type, t, t.dir, t.color);
    for (var pos of range) {
      dangerScores[pos[1]][pos[0]] += dscore;
    }
  }

  if (inEndGameMode) {
    var nextPositions = getNextRockPositions(10);
    for (var k = 0; k < nextPositions.length; k += 1) {
      var col = nextPositions[k][0];
      var row = nextPositions[k][1];
      dangerScores[row][col] += 20 - 2 * k;
    }
  }
}


function freezeOpponent() {
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER) {
    var oppos = Tanks.filter(t => t.color != "white" && t.color != MyTank.color && !t.isFrozen);
    var closest = getNearestOpponentAStar(oppos);
    return attackTank(closest);
  }
  return "";
}

function getNewCommand() {
  if (!inEndGameMode) {
    var secondsLeft = getTimeLeftInSeconds();
    if (secondsLeft == 0) {
      inEndGameMode = true;
      print("in end game mode");
    }
  }

  calcDangerScores();
  createAStarGraph();
  setWeaponRankings();

  var cmd = upgradeSpecialPowers();
  if (cmd.length > 0) return cmd;

  var totalDamage = 180 * dangerScores[MyTank.r][MyTank.c];
  if (MyTank.health < 2 * totalDamage ||
    inEndGameMode && dangerScores[MyTank.r][MyTank.c] > 2
  ) {
    cmd = escapeFromDanger();
    if (cmd.length > 0) return cmd;
  }

  cmd = freezeOpponent();
  if (cmd != "") return cmd;

  cmd = getCrystal();
  if (cmd != "") return cmd;

  cmd = getWeapon();
  if (cmd != "") return cmd;

  cmd = attackOpponent();
  if (cmd != "") return cmd;

  cmd = attackWhiteTank();
  if (cmd != "") return cmd;

  return getRandomCommand();
}

function getNearestOpponentAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}

function attackWhiteTank() {
  var whiteTanks = Tanks.filter(t => t.color == "white");
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER)
    whiteTanks = whiteTanks.filter(t => !t.isFrozen);

  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.SPLITTER3 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.WAY4 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.NOVA
  ) {
    var c = MyTank.c;
    var r = MyTank.r;
    var positions = [
      [c, r],
      [c - 1, r],
      [c + 1, r],
      [c, r - 1],
      [c, r + 1]
    ];
    for (var pos of positions) {
      if (Maze[pos[1]][pos[0]] != "") continue;
      var dirs = ["U", "D", "L", "R"];
      for (var dir of dirs) {
        var range = getWeaponRange(MyTank.specialWeapon.type, {
          c: pos[0],
          r: pos[1]
        }, dir, MyTank.color);
        var count = 0;
        for (var wt of whiteTanks) {
          if (range.find(p => p[0] == wt.c && p[1] == wt.r) != undefined)
            count += 1;
        }
        if (count > 1) {
          if (pos[1] < r) return "U";
          if (pos[1] > r) return "D";
          if (pos[0] < c) return "L";
          if (pos[0] > c) return "R";
          if (dir == MyTank.dir) return "S";
          else return dir;
        }
      }
    }
  }
  var closest = getNearestItemAStar(whiteTanks);
  return attackTank(closest);
}

function attackTank(t) {
  if (t == null) return "";
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.MISSILE &&
    t.color != "white" && t.color != MyTank.color)
    return "S";

  var directions = ["U", "D", "L", "R"];
  for (var i = 0; i < directions.length; i += 1) {
    var range = getWeaponRange(MyTank.specialWeapon.type,
      MyTank, directions[i], MyTank.color);
    var pos = range.find(p => p[0] == t.c && p[1] == t.r);
    if (pos != undefined) {
      if (MyTank.dir == directions[i]) return "S";
      else return directions[i];
    }
  }

  var path = getShortestPathCmd(graph, MyTank, t);
  if (path.length > 0) return path[0];

  return "";
}

function calculateSurvivalTime(defender, attacker) {
  var damage = 180 * (1 + attacker.specialPower.damage) * 1000 /
    (1200 - 100 * attacker.specialPower.reload);
  var regen = 240 * (1 + defender.specialPower.healthRegen);
  if (inEndGameMode) regen = 0;

  if (damage <= regen) return Infinity;
  return defender.health / (damage - regen);
}


function getWeapon() {
  if (Weapons.length == 0) return "";

  var betterWeapons = Weapons.filter(w => weaponIsBetter(w.type, MyTank.specialWeapon.type));
  var bestWeapon = getNearestItemAStar(betterWeapons);

  var path = getShortestPathCmd(graph, MyTank, bestWeapon);
  if (path.length > 0) return path[0];
  return "";
}

function getNearestItemAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  var opponents = Tanks.filter(t => t.color != "white" && t.color != MyTank.color);

  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);
    var my_tt = distance / getSpeed(MyTank);
    var should_skip = false;

    for (var j = 0; j < opponents.length; j += 1) {
      var opponent = opponents[j];

      var oppo_distance = getShortestPathLength(graph, opponent, items[i]);
      var oppo_tt = oppo_distance / getSpeed(opponent);
      if (oppo_tt < my_tt) {
        should_skip = true;
        break;
      }
    }
    if (should_skip) continue;

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}

function getSpeed(tank) {
  return 60 / (19 - tank.specialPower.speed);
}

function escapeFromDanger() {
  var delta = {
    U: [0, -1],
    D: [0, 1],
    L: [-1, 0],
    R: [1, 0],
  };
  var bestDir = "";
  var lowestDS = dangerScores[MyTank.r][MyTank.c];
  var dirs = Object.keys(delta);
  for (var i = 0; i < dirs.length; i += 1) {
    var dir = dirs[i];
    var newc = MyTank.c + delta[dir][0];
    var newr = MyTank.r + delta[dir][1];
    if (Maze[newr][newc] == "" &&
      dangerScores[newr][newc] < lowestDS) {
      bestDir = dir;
      lowestDS = dangerScores[newr][newc];
    }
  }
  return bestDir;
}


function createAStarGraph() {
  graph = createNewGraph();

  for (var i = 0; i < graph.length; i += 1) {
    for (var j = 0; j < graph[i].length; j += 1) {
      if (Maze[i][j] == "") {
        graph[i][j] = 1 + 3 * dangerScores[i][j];
      }
    }
  }
}


function isShellBlockedAtPos(col, row, color) {
  var blockingTank = Tanks.find(x => x.c == col && x.r == row && x.color != color && x.tankID != MyID);
  return (blockingTank || Maze[row][col] == "R" || Maze[row][col] == "T");
}


function getCrystal() {
  if (Crystals.length == 0) return "";
  var target = getNearestItemAStar(Crystals);
  var path = getShortestPathCmd(graph, MyTank, target);
  if (path.length > 0) return path[0];
  return "";
}

function isPathBlocked(t1, t2) {
  var row = Maze[t1.r];
  var tiles = row.slice(t1.c + 1, t2.c);
  return tiles.includes("R");
}

function getNearestItemManhattan(items) {
  var nearest = {
    distance: 0,
    item: null
  };

  for (var i = 0; i < items.length; i++) {
    var distance = Math.abs(items[i].r - MyTank.r) + Math.abs(items[i].c - MyTank.c);
    if (distance < nearest.distance || i == 0) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}

function attackOpponent() {
  for (let i = 0; i < Tanks.length; i += 1) {
    var t = Tanks[i];
    if (t.color == "white" || t.color == MyTank.color) continue;

    var mySurvialTime = calculateSurvivalTime(MyTank, t);
    var opponentSurvivalTime = calculateSurvivalTime(t, MyTank);

    if (opponentSurvivalTime > 30) continue;
    if (mySurvialTime <= opponentSurvivalTime) continue;

    var cmd = attackTank(t);
    if (cmd != "") return cmd;
  }
  return "";
}

function upgradeSpecialPowers() {
  if (MyTank.powerPoint == 0) return "";

  if (MyTank.health < 2000 && MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  if (MyTank.specialPower.speed < MAX_POWER)
    return "2";
  if (MyTank.specialPower.damage < MAX_POWER)
    return "1";
  if (MyTank.specialPower.reload < MAX_POWER)
    return "4";
  if (MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  return "";
}


function getShortestPathCmdGreedy(MyTank, t) {
  if (MyTank.r > t.r && Maze[MyTank.r - 1][MyTank.c] == "") return "U";
  if (MyTank.r < t.r && Maze[MyTank.r + 1][MyTank.c] == "") return "D";
  if (MyTank.c > t.c && Maze[MyTank.r][MyTank.c - 1] == "") return "L";
  if (MyTank.c < t.c && Maze[MyTank.r][MyTank.c + 1] == "") return "R";
  return "";
}
`;

const PREDEFINED_ANSWER_TANK_27 = `
var graph = null;
var dangerScores = null;
var inEndGameMode = false;
var rankings = {};
var isLeader = false;
var MESSAGE_TYPE = {
  MSG_ASSIGN_CRYSTAL: 1,
  MSG_ASSIGN_WEAPON: 2,
  MSG_ATTACK: 3,
  MSG_STOP_ATTACK: 4
};

function receiveTeamMessage(message) {
  switch (message.type) {
    case MESSAGE_TYPE.MSG_ATTACK:
      print("Tank " + MyTank.tankID + " got a message of attacking an opponent.");
      break;
    case MESSAGE_TYPE.MSG_STOP_ATTACK:
      print("Tank " + MyTank.tankID + " got a message to stop attacking an opponent.");
      break;
    case MESSAGE_TYPE.MSG_ASSIGN_CRYSTAL:
      print("Tank " + MyTank.tankID + " got a message of crystal assignment.");
      break;
    case MESSAGE_TYPE.MSG_ASSIGN_WEAPON:
      print("Tank " + MyTank.tankID + " got a message of weapon assignment.");
      break;
    default:
      print("Got an unknown message. ");
  }
}

function getNewCommand() {
  electLeader();

  if (!inEndGameMode) {
    var secondsLeft = getTimeLeftInSeconds();
    if (secondsLeft == 0) {
      inEndGameMode = true;
    }
  }

  calcDangerScores();
  createAStarGraph();
  setWeaponRankings();

  var cmd = upgradeSpecialPowers();
  if (cmd.length > 0) return cmd;

  var totalDamage = 180 * dangerScores[MyTank.r][MyTank.c];
  if (MyTank.health < 2 * totalDamage ||
    inEndGameMode && dangerScores[MyTank.r][MyTank.c] > 2
  ) {
    cmd = escapeFromDanger();
    if (cmd.length > 0) return cmd;
  }

  cmd = freezeOpponent();
  if (cmd != "") return cmd;
  cmd = getCrystal();
  if (cmd != "") return cmd;
  cmd = getWeapon();
  if (cmd != "") return cmd;
  cmd = attackOpponent();
  if (cmd != "") return cmd;
  cmd = attackWhiteTank();
  if (cmd != "") return cmd;
  return getRandomCommand();
}

function electLeader() {
  var smallestID = MyTank.tankID;
  for (var t of Tanks) {
    if (t.color == MyTank.color && t.tankID < smallestID) {
      smallestID = t.tankID;
    }
  }
  if (smallestID == MyTank.tankID) isLeader = true;
}

function setWeaponRankings() {
  if (inEndGameMode) {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 6;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 5;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 4;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 2;
    rankings[0] = 7;
    return;
  }

  var cmd = attackOpponent();
  if (cmd != "") {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 5;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 4;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 2;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
    rankings[0] = 7;
    return;
  }

  rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 4;
  rankings[SPECIAL_WEAPON_TYPES.NOVA] = 2;
  rankings[SPECIAL_WEAPON_TYPES.WAY4] = 1;
  rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 3;
  rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 5;
  rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 0;
  rankings[0] = 7;

  if (
    Tanks.filter(t => t.color == MyTank.color).length == 1 &&
    MyTank.specialPower.damage < 2
  ) {
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
  }
}


function weaponIsBetter(weaponType1, weaponType2) {
  return rankings[weaponType1] < rankings[weaponType2];
}


function calcDangerScores() {
  dangerScores = createNewGraph();
  for (var t of Tanks) {
    if (t.color == MyTank.color || t.isFrozen) continue;
    var dscore = 1 + t.specialPower.damage;
    var range = getWeaponRange(t.specialWeapon.type, t, t.dir, t.color);
    for (var pos of range) {
      dangerScores[pos[1]][pos[0]] += dscore;
    }
  }

  if (inEndGameMode) {
    var nextPositions = getNextRockPositions(10);
    for (var k = 0; k < nextPositions.length; k += 1) {
      var col = nextPositions[k][0];
      var row = nextPositions[k][1];
      dangerScores[row][col] += 20 - 2 * k;
    }
  }
}


function freezeOpponent() {
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER) {
    var oppos = Tanks.filter(t => t.color != "white" && t.color != MyTank.color && !t.isFrozen);
    var closest = getNearestOpponentAStar(oppos);
    return attackTank(closest);
  }
  return "";
}


function getNearestOpponentAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function attackWhiteTank() {
  var whiteTanks = Tanks.filter(t => t.color == "white");
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER)
    whiteTanks = whiteTanks.filter(t => !t.isFrozen);

  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.SPLITTER3 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.WAY4 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.NOVA
  ) {
    var c = MyTank.c;
    var r = MyTank.r;
    var positions = [
      [c, r],
      [c - 1, r],
      [c + 1, r],
      [c, r - 1],
      [c, r + 1]
    ];
    for (var pos of positions) {
      if (Maze[pos[1]][pos[0]] != "") continue;
      var dirs = ["U", "D", "L", "R"];
      for (var dir of dirs) {
        var range = getWeaponRange(MyTank.specialWeapon.type, {
          c: pos[0],
          r: pos[1]
        }, dir, MyTank.color);
        var count = 0;
        for (var wt of whiteTanks) {
          if (range.find(p => p[0] == wt.c && p[1] == wt.r) != undefined)
            count += 1;
        }
        if (count > 1) {
          if (pos[1] < r) return "U";
          if (pos[1] > r) return "D";
          if (pos[0] < c) return "L";
          if (pos[0] > c) return "R";
          if (dir == MyTank.dir) return "S";
          else return dir;
        }
      }
    }
  }
  var closest = getNearestItemAStar(whiteTanks);
  return attackTank(closest);
}


function attackTank(t) {
  if (t == null) return "";
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.MISSILE &&
    t.color != "white" && t.color != MyTank.color)
    return "S";

  var directions = ["U", "D", "L", "R"];
  for (var i = 0; i < directions.length; i += 1) {
    var range = getWeaponRange(MyTank.specialWeapon.type,
      MyTank, directions[i], MyTank.color);
    var pos = range.find(p => p[0] == t.c && p[1] == t.r);
    if (pos != undefined) {
      if (MyTank.dir == directions[i]) return "S";
      else return directions[i];
    }
  }

  var path = getShortestPathCmd(graph, MyTank, t);
  if (path.length > 0) return path[0];

  return "";
}


function calculateSurvivalTime(defender, attacker) {
  var damage = 180 * (1 + attacker.specialPower.damage) * 1000 /
    (1200 - 100 * attacker.specialPower.reload);
  var regen = 240 * (1 + defender.specialPower.healthRegen);
  if (inEndGameMode) regen = 0;

  if (damage <= regen) return Infinity;
  return defender.health / (damage - regen);
}


function getWeapon() {
  if (Weapons.length == 0) return "";

  var betterWeapons = Weapons.filter(w => weaponIsBetter(w.type, MyTank.specialWeapon.type));
  var bestWeapon = getNearestItemAStar(betterWeapons);

  var path = getShortestPathCmd(graph, MyTank, bestWeapon);
  if (path.length > 0) return path[0];
  return "";
}


function getNearestItemAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  var opponents = Tanks.filter(t => t.color != "white" && t.color != MyTank.color);

  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);
    var my_tt = distance / getSpeed(MyTank);
    var should_skip = false;

    for (var j = 0; j < opponents.length; j += 1) {
      var opponent = opponents[j];

      var oppo_distance = getShortestPathLength(graph, opponent, items[i]);
      var oppo_tt = oppo_distance / getSpeed(opponent);
      if (oppo_tt < my_tt) {
        should_skip = true;
        break;
      }
    }
    if (should_skip) continue;

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function getSpeed(tank) {
  return 60 / (19 - tank.specialPower.speed);
}


function escapeFromDanger() {
  var delta = {
    U: [0, -1],
    D: [0, 1],
    L: [-1, 0],
    R: [1, 0],
  };
  var bestDir = "";
  var lowestDS = dangerScores[MyTank.r][MyTank.c];
  var dirs = Object.keys(delta);
  for (var i = 0; i < dirs.length; i += 1) {
    var dir = dirs[i];
    var newc = MyTank.c + delta[dir][0];
    var newr = MyTank.r + delta[dir][1];
    if (Maze[newr][newc] == "" &&
      dangerScores[newr][newc] < lowestDS) {
      bestDir = dir;
      lowestDS = dangerScores[newr][newc];
    }
  }
  return bestDir;
}


function createAStarGraph() {
  graph = createNewGraph();

  for (var i = 0; i < graph.length; i += 1) {
    for (var j = 0; j < graph[i].length; j += 1) {
      if (Maze[i][j] == "") {
        graph[i][j] = 1 + 3 * dangerScores[i][j];
      }
    }
  }
}


function isShellBlockedAtPos(col, row, color) {
  var blockingTank = Tanks.find(x => x.c == col && x.r == row && x.color != color && x.tankID != MyID);
  return (blockingTank || Maze[row][col] == "R" || Maze[row][col] == "T");
}


function getCrystal() {
  if (Crystals.length == 0) return "";
  var target = getNearestItemAStar(Crystals);
  var path = getShortestPathCmd(graph, MyTank, target);
  if (path.length > 0) return path[0];
  return "";
}


function isPathBlocked(t1, t2) {
  var row = Maze[t1.r];
  var tiles = row.slice(t1.c + 1, t2.c);
  return tiles.includes("R");
}


function getNearestItemManhattan(items) {
  var nearest = {
    distance: 0,
    item: null
  };

  for (var i = 0; i < items.length; i++) {
    var distance = Math.abs(items[i].r - MyTank.r) + Math.abs(items[i].c - MyTank.c);
    if (distance < nearest.distance || i == 0) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function attackOpponent() {
  for (let i = 0; i < Tanks.length; i += 1) {
    var t = Tanks[i];
    if (t.color == "white" || t.color == MyTank.color) continue;

    var mySurvialTime = calculateSurvivalTime(MyTank, t);
    var opponentSurvivalTime = calculateSurvivalTime(t, MyTank);

    if (opponentSurvivalTime > 30) continue;
    if (mySurvialTime <= opponentSurvivalTime) continue;

    var cmd = attackTank(t);
    if (cmd != "") return cmd;
  }
  return "";
}


function upgradeSpecialPowers() {
  if (MyTank.powerPoint == 0) return "";

  if (MyTank.health < 2000 && MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  if (MyTank.specialPower.speed < MAX_POWER)
    return "2";
  if (MyTank.specialPower.damage < MAX_POWER)
    return "1";
  if (MyTank.specialPower.reload < MAX_POWER)
    return "4";
  if (MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  return "";
}


function getShortestPathCmdGreedy(MyTank, t) {
  if (MyTank.r > t.r && Maze[MyTank.r - 1][MyTank.c] == "") return "U";
  if (MyTank.r < t.r && Maze[MyTank.r + 1][MyTank.c] == "") return "D";
  if (MyTank.c > t.c && Maze[MyTank.r][MyTank.c - 1] == "") return "L";
  if (MyTank.c < t.c && Maze[MyTank.r][MyTank.c + 1] == "") return "R";
  return "";
}
`;

const PREDEFINED_ANSWER_TANK_28 = `
var graph = null;
var dangerScores = null;
var inEndGameMode = false;
var rankings = {};
var isLeader = false;
var ownerOfCrystals = {};
var MESSAGE_TYPE = {
  MSG_ASSIGN_CRYSTAL: 1,
  MSG_ASSIGN_WEAPON: 2,
  MSG_ATTACK: 3,
  MSG_STOP_ATTACK: 4
};

function getCrystal() {
  if (Crystals.length == 0) return "";
  var target = null;
  if (Tanks.filter(t => t.color == MyTank.color).length == 1) {
    target = getNearestItemAStar(Crystals);
  } else if (MyTank.tankID in ownerOfCrystals && ownerOfCrystals[MyTank.tankID].length > 0) {
    target = getNearestItemAStar(ownerOfCrystals[MyTank.tankID]);
  }
  if (target != null) {
    var path = getShortestPathCmd(graph, MyTank, target);
    if (path.length > 0) return path[0];
  }
  return "";
}

function handleCrystalRemoval(position) {
  var tankIDs = Object.keys(ownerOfCrystals);
  for (var tankID of tankIDs) {
    ownerOfCrystals[tankID] = ownerOfCrystals[tankID].filter(record => record.c != position.c || record.r != position.r);
  }
}

function receiveTeamMessage(message) {
  switch (message.type) {
  case MESSAGE_TYPE.MSG_ATTACK:
    print("Tank " + MyTank.tankID + " got a message of attacking an opponent.");
    break;
  case MESSAGE_TYPE.MSG_STOP_ATTACK:
    print("Tank " + MyTank.tankID + " got a message to stop attacking an opponent.");
    break;
  case MESSAGE_TYPE.MSG_ASSIGN_CRYSTAL:
    if (!(message.ownerID in ownerOfCrystals)) {
      ownerOfCrystals[message.ownerID] = [];
    }
    ownerOfCrystals[message.ownerID].push({
      c: message.c,
      r: message.r
    });
    break;
  case MESSAGE_TYPE.MSG_ASSIGN_WEAPON:
    break;
  default:
    print("Got an unknown message. ");
  }
}

function getTankTotalPowers(tank) {
  var specialPowers = Object.values(tank.specialPower);
  var sum = 0;
  for (var sp of specialPowers) {
    sum += sp;
  }
  if (tank.tankID in ownerOfCrystals)
    sum += ownerOfCrystals[tank.tankID].length;

  return sum;
}

function handleNewCrystal(position) {
  electLeader();
  if (!isLeader) return;
  var teamMembers = Tanks.filter(t => t.color == MyTank.color);
  if (teamMembers.length == 1) return;

  var weakest = {
    tankID: MyTank.tankID,
    power: 100
  };
  for (var t of teamMembers) {
    var power = getTankTotalPowers(t);
    if (power < weakest.power) {
      weakest.tankID = t.tankID;
      weakest.power = power;
    }
  }
  sendTeamMessage({
    senderID: MyTank.tankID,
    type: MESSAGE_TYPE.MSG_ASSIGN_CRYSTAL,
    c: position.c,
    r: position.r,
    ownerID: weakest.tankID,
  });
}

function getNewCommand() {
  electLeader();

  if (!inEndGameMode) {
    var secondsLeft = getTimeLeftInSeconds();
    if (secondsLeft == 0) {
      inEndGameMode = true;
    }
  }

  calcDangerScores();
  createAStarGraph();
  setWeaponRankings();

  var cmd = upgradeSpecialPowers();
  if (cmd.length > 0) return cmd;

  var totalDamage = 180 * dangerScores[MyTank.r][MyTank.c];
  if (MyTank.health < 2 * totalDamage ||
    inEndGameMode && dangerScores[MyTank.r][MyTank.c] > 2
  ) {
    cmd = escapeFromDanger();
    if (cmd.length > 0) return cmd;
  }

  cmd = freezeOpponent();
  if (cmd != "") return cmd;
  cmd = getCrystal();
  if (cmd != "") return cmd;
  cmd = getWeapon();
  if (cmd != "") return cmd;
  cmd = attackOpponent();
  if (cmd != "") return cmd;
  cmd = attackWhiteTank();
  if (cmd != "") return cmd;
  return getRandomCommand();
}


function electLeader() {
  var smallestID = MyTank.tankID;
  for (var t of Tanks) {
    if (t.color == MyTank.color && t.tankID < smallestID) {
      smallestID = t.tankID;
    }
  }
  if (smallestID == MyTank.tankID) isLeader = true;
}


function setWeaponRankings() {
  if (inEndGameMode) {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 6;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 5;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 4;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 2;
    rankings[0] = 7;
    return;
  }

  var cmd = attackOpponent();
  if (cmd != "") {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 5;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 4;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 2;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
    rankings[0] = 7;
    return;
  }

  rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 4;
  rankings[SPECIAL_WEAPON_TYPES.NOVA] = 2;
  rankings[SPECIAL_WEAPON_TYPES.WAY4] = 1;
  rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 3;
  rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 5;
  rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 0;
  rankings[0] = 7;

  if (
    Tanks.filter(t => t.color == MyTank.color).length == 1 &&
    MyTank.specialPower.damage < 2
  ) {
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
  }
}


function weaponIsBetter(weaponType1, weaponType2) {
  return rankings[weaponType1] < rankings[weaponType2];
}


function calcDangerScores() {
  dangerScores = createNewGraph();
  for (var t of Tanks) {
    if (t.color == MyTank.color || t.isFrozen) continue;
    var dscore = 1 + t.specialPower.damage;
    var range = getWeaponRange(t.specialWeapon.type, t, t.dir, t.color);
    for (var pos of range) {
      dangerScores[pos[1]][pos[0]] += dscore;
    }
  }

  if (inEndGameMode) {
    var nextPositions = getNextRockPositions(10);
    for (var k = 0; k < nextPositions.length; k += 1) {
      var col = nextPositions[k][0];
      var row = nextPositions[k][1];
      dangerScores[row][col] += 20 - 2 * k;
    }
  }
}


function freezeOpponent() {
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER) {
    var oppos = Tanks.filter(t => t.color != "white" && t.color != MyTank.color && !t.isFrozen);
    var closest = getNearestOpponentAStar(oppos);
    return attackTank(closest);
  }
  return "";
}


function getNearestOpponentAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function attackWhiteTank() {
  var whiteTanks = Tanks.filter(t => t.color == "white");
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER)
    whiteTanks = whiteTanks.filter(t => !t.isFrozen);

  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.SPLITTER3 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.WAY4 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.NOVA
  ) {
    var c = MyTank.c;
    var r = MyTank.r;
    var positions = [
      [c, r],
      [c - 1, r],
      [c + 1, r],
      [c, r - 1],
      [c, r + 1]
    ];
    for (var pos of positions) {
      if (Maze[pos[1]][pos[0]] != "") continue;
      var dirs = ["U", "D", "L", "R"];
      for (var dir of dirs) {
        var range = getWeaponRange(MyTank.specialWeapon.type, {
          c: pos[0],
          r: pos[1]
        }, dir, MyTank.color);
        var count = 0;
        for (var wt of whiteTanks) {
          if (range.find(p => p[0] == wt.c && p[1] == wt.r) != undefined)
            count += 1;
        }
        if (count > 1) {
          if (pos[1] < r) return "U";
          if (pos[1] > r) return "D";
          if (pos[0] < c) return "L";
          if (pos[0] > c) return "R";
          if (dir == MyTank.dir) return "S";
          else return dir;
        }
      }
    }
  }
  var closest = getNearestItemAStar(whiteTanks);
  return attackTank(closest);
}


function attackTank(t) {
  if (t == null) return "";
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.MISSILE &&
    t.color != "white" && t.color != MyTank.color)
    return "S";

  var directions = ["U", "D", "L", "R"];
  for (var i = 0; i < directions.length; i += 1) {
    var range = getWeaponRange(MyTank.specialWeapon.type,
      MyTank, directions[i], MyTank.color);
    var pos = range.find(p => p[0] == t.c && p[1] == t.r);
    if (pos != undefined) {
      if (MyTank.dir == directions[i]) return "S";
      else return directions[i];
    }
  }

  var path = getShortestPathCmd(graph, MyTank, t);
  if (path.length > 0) return path[0];

  return "";
}


function calculateSurvivalTime(defender, attacker) {
  var damage = 180 * (1 + attacker.specialPower.damage) * 1000 /
    (1200 - 100 * attacker.specialPower.reload);
  var regen = 240 * (1 + defender.specialPower.healthRegen);
  if (inEndGameMode) regen = 0;

  if (damage <= regen) return Infinity;
  return defender.health / (damage - regen);
}


function getWeapon() {
  if (Weapons.length == 0) return "";

  var betterWeapons = Weapons.filter(w => weaponIsBetter(w.type, MyTank.specialWeapon.type));
  var bestWeapon = getNearestItemAStar(betterWeapons);

  var path = getShortestPathCmd(graph, MyTank, bestWeapon);
  if (path.length > 0) return path[0];
  return "";
}


function getNearestItemAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  var opponents = Tanks.filter(t => t.color != "white" && t.color != MyTank.color);

  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);
    var my_tt = distance / getSpeed(MyTank);
    var should_skip = false;

    for (var j = 0; j < opponents.length; j += 1) {
      var opponent = opponents[j];

      var oppo_distance = getShortestPathLength(graph, opponent, items[i]);
      var oppo_tt = oppo_distance / getSpeed(opponent);
      if (oppo_tt < my_tt) {
        should_skip = true;
        break;
      }
    }
    if (should_skip) continue;

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function getSpeed(tank) {
  return 60 / (19 - tank.specialPower.speed);
}


function escapeFromDanger() {
  var delta = {
    U: [0, -1],
    D: [0, 1],
    L: [-1, 0],
    R: [1, 0],
  };
  var bestDir = "";
  var lowestDS = dangerScores[MyTank.r][MyTank.c];
  var dirs = Object.keys(delta);
  for (var i = 0; i < dirs.length; i += 1) {
    var dir = dirs[i];
    var newc = MyTank.c + delta[dir][0];
    var newr = MyTank.r + delta[dir][1];
    if (Maze[newr][newc] == "" &&
      dangerScores[newr][newc] < lowestDS) {
      bestDir = dir;
      lowestDS = dangerScores[newr][newc];
    }
  }
  return bestDir;
}


function createAStarGraph() {
  graph = createNewGraph();

  for (var i = 0; i < graph.length; i += 1) {
    for (var j = 0; j < graph[i].length; j += 1) {
      if (Maze[i][j] == "") {
        graph[i][j] = 1 + 3 * dangerScores[i][j];
      }
    }
  }
}


function isShellBlockedAtPos(col, row, color) {
  var blockingTank = Tanks.find(x => x.c == col && x.r == row && x.color != color && x.tankID != MyID);
  return (blockingTank || Maze[row][col] == "R" || Maze[row][col] == "T");
}


function isPathBlocked(t1, t2) {
  var row = Maze[t1.r];
  var tiles = row.slice(t1.c + 1, t2.c);
  return tiles.includes("R");
}


function getNearestItemManhattan(items) {
  var nearest = {
    distance: 0,
    item: null
  };

  for (var i = 0; i < items.length; i++) {
    var distance = Math.abs(items[i].r - MyTank.r) + Math.abs(items[i].c - MyTank.c);
    if (distance < nearest.distance || i == 0) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function attackOpponent() {
  for (let i = 0; i < Tanks.length; i += 1) {
    var t = Tanks[i];
    if (t.color == "white" || t.color == MyTank.color) continue;

    var mySurvialTime = calculateSurvivalTime(MyTank, t);
    var opponentSurvivalTime = calculateSurvivalTime(t, MyTank);

    if (opponentSurvivalTime > 30) continue;
    if (mySurvialTime <= opponentSurvivalTime) continue;

    var cmd = attackTank(t);
    if (cmd != "") return cmd;
  }
  return "";
}


function upgradeSpecialPowers() {
  if (MyTank.powerPoint == 0) return "";

  if (MyTank.health < 2000 && MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  if (MyTank.specialPower.speed < MAX_POWER)
    return "2";
  if (MyTank.specialPower.damage < MAX_POWER)
    return "1";
  if (MyTank.specialPower.reload < MAX_POWER)
    return "4";
  if (MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  return "";
}


function getShortestPathCmdGreedy(MyTank, t) {
  if (MyTank.r > t.r && Maze[MyTank.r - 1][MyTank.c] == "") return "U";
  if (MyTank.r < t.r && Maze[MyTank.r + 1][MyTank.c] == "") return "D";
  if (MyTank.c > t.c && Maze[MyTank.r][MyTank.c - 1] == "") return "L";
  if (MyTank.c < t.c && Maze[MyTank.r][MyTank.c + 1] == "") return "R";
  return "";
}
`;

const PREDEFINED_ANSWER_TANK_29 = `
var graph = null;
var dangerScores = null;
var inEndGameMode = false;
var rankings = {};
var isLeader = false;
var ownerOfCrystals = {};
var MESSAGE_TYPE = {
  MSG_ASSIGN_CRYSTAL: 1,
  MSG_ASSIGN_WEAPON: 2,
  MSG_ATTACK: 3,
  MSG_STOP_ATTACK: 4
};
var targetTankID = -1;

function attackOpponent() {
  if (isLeader) {
    var target = getTeamBattleTarget();
    if (target && targetTankID != target.tankID) {
      sendTeamMessage({
        senderID: MyTank.tankID,
        type: MESSAGE_TYPE.MSG_ATTACK,
        targetTankID: target.tankID,
      });
      targetTankID = target.tankID;
    }
    if (target == null && targetTankID >= 0) {
      sendTeamMessage({
        senderID: MyTank.tankID,
        type: MESSAGE_TYPE.MSG_STOP_ATTACK,
      });
    }
  }

  var cmd = "";
  if (targetTankID >= 0) {
    target = Tanks.find(t => t.tankID == targetTankID);
    cmd = attackTank(target);
  }
  if (cmd == "") {
    for (let i = 0; i < Tanks.length; i += 1) {
      var t = Tanks[i];
      if (t.color == "white" || t.color == MyTank.color) continue;
      var mySurvialTime = calculateSurvivalTime(MyTank, [t]);
      var opponentSurvivalTime = calculateSurvivalTime(t, [MyTank]);
      if (opponentSurvivalTime > 30) continue;
      if (mySurvialTime <= opponentSurvivalTime) continue;
      cmd = attackTank(t);
    }
  }
  return cmd;
}

function receiveTeamMessage(message) {
  switch (message.type) {
  case MESSAGE_TYPE.MSG_ATTACK:
    targetTankID = message.targetTankID;
    break;
  case MESSAGE_TYPE.MSG_STOP_ATTACK:
    targetTankID = -1;
    break;
  case MESSAGE_TYPE.MSG_ASSIGN_CRYSTAL:
    if (!(message.ownerID in ownerOfCrystals)) {
      ownerOfCrystals[message.ownerID] = [];
    }
    ownerOfCrystals[message.ownerID].push({
      c: message.c,
      r: message.r
    });
    break;
  case MESSAGE_TYPE.MSG_ASSIGN_WEAPON:
    break;
  default:
    print("Got an unknown message. ");
  }
}

function handleTankDeath(tankID) {
  if (targetTankID == tankID) targetTankID = -1;

  if (tankID in ownerOfCrystals) {
    for (var pos of ownerOfCrystals[tankID]) {
      handleNewCrystal(pos);
    }
  }
}

function getTeamBattleTarget() {
  var target = null;
  var shortestST = 300;
  var myTeam = Tanks.filter(t => t.color == MyTank.color);
  var oppoTeam = Tanks.filter(t => t.color != "white" && t.color != MyTank.color);

  for (var oppo of oppoTeam) {
    var oppoST = calculateSurvivalTime(oppo, myTeam);
    if (oppoST > 30) continue;
    var skip = false;
    for (var member of myTeam) {
      var memST = calculateSurvivalTime(member, [oppo]);
      if (memST <= oppoST) {
        skip = true;
        break;
      }
    }
    if (skip) continue;
    if (oppoST < shortestST) {
      target = oppo;
      shortestST = oppoST;
    }
  }
  return target;
}

function calculateSurvivalTime(defender, attackers) {
  var damage = 0;
  for (var attacker of attackers) {
    damage += 180 * (1 + attacker.specialPower.damage) * 1000 /
      (1200 - 100 * attacker.specialPower.reload);
  }
  var regen = 240 * (1 + defender.specialPower.healthRegen);
  if (inEndGameMode) regen = 0;
  if (damage <= regen) return Infinity;
  return defender.health / (damage - regen);
}

function getCrystal() {
  if (Crystals.length == 0) return "";
  var target = null;
  if (Tanks.filter(t => t.color == MyTank.color).length == 1) {
    target = getNearestItemAStar(Crystals);
  } else if (MyTank.tankID in ownerOfCrystals && ownerOfCrystals[MyTank.tankID].length > 0) {
    target = getNearestItemAStar(ownerOfCrystals[MyTank.tankID]);
  }
  if (target != null) {
    var path = getShortestPathCmd(graph, MyTank, target);
    if (path.length > 0) return path[0];
  }
  return "";
}


function handleCrystalRemoval(position) {
  var tankIDs = Object.keys(ownerOfCrystals);
  for (var tankID of tankIDs) {
    ownerOfCrystals[tankID] = ownerOfCrystals[tankID].filter(record => record.c != position.c || record.r != position.r);
  }
}


function getTankTotalPowers(tank) {
  var specialPowers = Object.values(tank.specialPower);
  var sum = 0;
  for (var sp of specialPowers) {
    sum += sp;
  }
  if (tank.tankID in ownerOfCrystals)
    sum += ownerOfCrystals[tank.tankID].length;

  return sum;
}


function handleNewCrystal(position) {
  electLeader();
  if (!isLeader) return;
  var teamMembers = Tanks.filter(t => t.color == MyTank.color);
  if (teamMembers.length == 1) return;

  var weakest = {
    tankID: MyTank.tankID,
    power: 100
  };
  for (var t of teamMembers) {
    var power = getTankTotalPowers(t);
    if (power < weakest.power) {
      weakest.tankID = t.tankID;
      weakest.power = power;
    }
  }
  sendTeamMessage({
    senderID: MyTank.tankID,
    type: MESSAGE_TYPE.MSG_ASSIGN_CRYSTAL,
    c: position.c,
    r: position.r,
    ownerID: weakest.tankID,
  });
}


function getNewCommand() {
  electLeader();

  if (!inEndGameMode) {
    var secondsLeft = getTimeLeftInSeconds();
    if (secondsLeft == 0) {
      inEndGameMode = true;
    }
  }

  calcDangerScores();
  createAStarGraph();
  setWeaponRankings();

  var cmd = upgradeSpecialPowers();
  if (cmd.length > 0) return cmd;

  var totalDamage = 180 * dangerScores[MyTank.r][MyTank.c];
  if (MyTank.health < 2 * totalDamage ||
    inEndGameMode && dangerScores[MyTank.r][MyTank.c] > 2
  ) {
    cmd = escapeFromDanger();
    if (cmd.length > 0) return cmd;
  }

  cmd = freezeOpponent();
  if (cmd != "") return cmd;
  cmd = getCrystal();
  if (cmd != "") return cmd;
  cmd = getWeapon();
  if (cmd != "") return cmd;
  cmd = attackOpponent();
  if (cmd != "") return cmd;
  cmd = attackWhiteTank();
  if (cmd != "") return cmd;
  return getRandomCommand();
}


function electLeader() {
  var smallestID = MyTank.tankID;
  for (var t of Tanks) {
    if (t.color == MyTank.color && t.tankID < smallestID) {
      smallestID = t.tankID;
    }
  }
  if (smallestID == MyTank.tankID) isLeader = true;
}


function setWeaponRankings() {
  if (inEndGameMode) {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 6;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 5;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 4;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 2;
    rankings[0] = 7;
    return;
  }

  var cmd = attackOpponent();
  if (cmd != "") {
    rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 5;
    rankings[SPECIAL_WEAPON_TYPES.NOVA] = 3;
    rankings[SPECIAL_WEAPON_TYPES.WAY4] = 4;
    rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 2;
    rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 1;
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
    rankings[0] = 7;
    return;
  }

  rankings[SPECIAL_WEAPON_TYPES.LASER_GUN] = 4;
  rankings[SPECIAL_WEAPON_TYPES.NOVA] = 2;
  rankings[SPECIAL_WEAPON_TYPES.WAY4] = 1;
  rankings[SPECIAL_WEAPON_TYPES.SPLITTER3] = 3;
  rankings[SPECIAL_WEAPON_TYPES.MISSILE] = 5;
  rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 0;
  rankings[0] = 7;

  if (
    Tanks.filter(t => t.color == MyTank.color).length == 1 &&
    MyTank.specialPower.damage < 2
  ) {
    rankings[SPECIAL_WEAPON_TYPES.FREEZER] = 6;
  }
}


function weaponIsBetter(weaponType1, weaponType2) {
  return rankings[weaponType1] < rankings[weaponType2];
}


function calcDangerScores() {
  dangerScores = createNewGraph();
  for (var t of Tanks) {
    if (t.color == MyTank.color || t.isFrozen) continue;
    var dscore = 1 + t.specialPower.damage;
    var range = getWeaponRange(t.specialWeapon.type, t, t.dir, t.color);
    for (var pos of range) {
      dangerScores[pos[1]][pos[0]] += dscore;
    }
  }

  if (inEndGameMode) {
    var nextPositions = getNextRockPositions(10);
    for (var k = 0; k < nextPositions.length; k += 1) {
      var col = nextPositions[k][0];
      var row = nextPositions[k][1];
      dangerScores[row][col] += 20 - 2 * k;
    }
  }
}


function freezeOpponent() {
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER) {
    var oppos = Tanks.filter(t => t.color != "white" && t.color != MyTank.color && !t.isFrozen);
    var closest = getNearestOpponentAStar(oppos);
    return attackTank(closest);
  }
  return "";
}


function getNearestOpponentAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function attackWhiteTank() {
  var whiteTanks = Tanks.filter(t => t.color == "white");
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.FREEZER)
    whiteTanks = whiteTanks.filter(t => !t.isFrozen);

  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.SPLITTER3 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.WAY4 ||
    MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.NOVA
  ) {
    var c = MyTank.c;
    var r = MyTank.r;
    var positions = [
      [c, r],
      [c - 1, r],
      [c + 1, r],
      [c, r - 1],
      [c, r + 1]
    ];
    for (var pos of positions) {
      if (Maze[pos[1]][pos[0]] != "") continue;
      var dirs = ["U", "D", "L", "R"];
      for (var dir of dirs) {
        var range = getWeaponRange(MyTank.specialWeapon.type, {
          c: pos[0],
          r: pos[1]
        }, dir, MyTank.color);
        var count = 0;
        for (var wt of whiteTanks) {
          if (range.find(p => p[0] == wt.c && p[1] == wt.r) != undefined)
            count += 1;
        }
        if (count > 1) {
          if (pos[1] < r) return "U";
          if (pos[1] > r) return "D";
          if (pos[0] < c) return "L";
          if (pos[0] > c) return "R";
          if (dir == MyTank.dir) return "S";
          else return dir;
        }
      }
    }
  }
  var closest = getNearestItemAStar(whiteTanks);
  return attackTank(closest);
}


function attackTank(t) {
  if (t == null) return "";
  if (MyTank.specialWeapon.type == SPECIAL_WEAPON_TYPES.MISSILE &&
    t.color != "white" && t.color != MyTank.color)
    return "S";

  var directions = ["U", "D", "L", "R"];
  for (var i = 0; i < directions.length; i += 1) {
    var range = getWeaponRange(MyTank.specialWeapon.type,
      MyTank, directions[i], MyTank.color);
    var pos = range.find(p => p[0] == t.c && p[1] == t.r);
    if (pos != undefined) {
      if (MyTank.dir == directions[i]) return "S";
      else return directions[i];
    }
  }

  var path = getShortestPathCmd(graph, MyTank, t);
  if (path.length > 0) return path[0];

  return "";
}


function getWeapon() {
  if (Weapons.length == 0) return "";

  var betterWeapons = Weapons.filter(w => weaponIsBetter(w.type, MyTank.specialWeapon.type));
  var bestWeapon = getNearestItemAStar(betterWeapons);

  var path = getShortestPathCmd(graph, MyTank, bestWeapon);
  if (path.length > 0) return path[0];
  return "";
}


function getNearestItemAStar(items) {
  var nearest = {
    distance: 10000,
    item: null
  };
  var opponents = Tanks.filter(t => t.color != "white" && t.color != MyTank.color);

  for (var i = 0; i < items.length; i += 1) {
    var distance = getShortestPathLength(graph, MyTank, items[i]);
    var my_tt = distance / getSpeed(MyTank);
    var should_skip = false;

    for (var j = 0; j < opponents.length; j += 1) {
      var opponent = opponents[j];

      var oppo_distance = getShortestPathLength(graph, opponent, items[i]);
      var oppo_tt = oppo_distance / getSpeed(opponent);
      if (oppo_tt < my_tt) {
        should_skip = true;
        break;
      }
    }
    if (should_skip) continue;

    if (distance < nearest.distance) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function getSpeed(tank) {
  return 60 / (19 - tank.specialPower.speed);
}


function escapeFromDanger() {
  var delta = {
    U: [0, -1],
    D: [0, 1],
    L: [-1, 0],
    R: [1, 0],
  };
  var bestDir = "";
  var lowestDS = dangerScores[MyTank.r][MyTank.c];
  var dirs = Object.keys(delta);
  for (var i = 0; i < dirs.length; i += 1) {
    var dir = dirs[i];
    var newc = MyTank.c + delta[dir][0];
    var newr = MyTank.r + delta[dir][1];
    if (Maze[newr][newc] == "" &&
      dangerScores[newr][newc] < lowestDS) {
      bestDir = dir;
      lowestDS = dangerScores[newr][newc];
    }
  }
  return bestDir;
}


function createAStarGraph() {
  graph = createNewGraph();

  for (var i = 0; i < graph.length; i += 1) {
    for (var j = 0; j < graph[i].length; j += 1) {
      if (Maze[i][j] == "") {
        graph[i][j] = 1 + 3 * dangerScores[i][j];
      }
    }
  }
}


function isShellBlockedAtPos(col, row, color) {
  var blockingTank = Tanks.find(x => x.c == col && x.r == row && x.color != color && x.tankID != MyID);
  return (blockingTank || Maze[row][col] == "R" || Maze[row][col] == "T");
}


function isPathBlocked(t1, t2) {
  var row = Maze[t1.r];
  var tiles = row.slice(t1.c + 1, t2.c);
  return tiles.includes("R");
}


function getNearestItemManhattan(items) {
  var nearest = {
    distance: 0,
    item: null
  };

  for (var i = 0; i < items.length; i++) {
    var distance = Math.abs(items[i].r - MyTank.r) + Math.abs(items[i].c - MyTank.c);
    if (distance < nearest.distance || i == 0) {
      nearest.distance = distance;
      nearest.item = items[i];
    }
  }
  return nearest.item;
}


function upgradeSpecialPowers() {
  if (MyTank.powerPoint == 0) return "";

  if (MyTank.health < 2000 && MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  if (MyTank.specialPower.speed < MAX_POWER)
    return "2";
  if (MyTank.specialPower.damage < MAX_POWER)
    return "1";
  if (MyTank.specialPower.reload < MAX_POWER)
    return "4";
  if (MyTank.specialPower.healthRegen < MAX_POWER)
    return "3";
  return "";
}


function getShortestPathCmdGreedy(MyTank, t) {
  if (MyTank.r > t.r && Maze[MyTank.r - 1][MyTank.c] == "") return "U";
  if (MyTank.r < t.r && Maze[MyTank.r + 1][MyTank.c] == "") return "D";
  if (MyTank.c > t.c && Maze[MyTank.r][MyTank.c - 1] == "") return "L";
  if (MyTank.c < t.c && Maze[MyTank.r][MyTank.c + 1] == "") return "R";
  return "";
}
`;

export {
  LAYOUT_OPTION_TEXT,
  LAYOUT_OPTION,
  LAYOUT_OPTION_2_TEXT,
  LAYOUT_OPTION_2,
  MESSAGES,
  MONTHS,
  TIMES,
  MAINLAYOUT_STATEMENT,
  GAMEBOARD_STATEMENT,
  TUTORIAL_STATEMENT,
  CURRENCY,
  VERIFY_MESSAGE,
  PREDEFINED_ANSWER_POOL_19,
  PREDEFINED_ANSWER_TANK_26,
  PREDEFINED_ANSWER_TANK_27,
  PREDEFINED_ANSWER_TANK_28,
  PREDEFINED_ANSWER_TANK_29
};

