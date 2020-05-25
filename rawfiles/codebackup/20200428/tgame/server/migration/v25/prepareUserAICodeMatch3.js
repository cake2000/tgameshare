
import { UserAICodeProd } from '../../../lib/collections';
import { MIGRATION_CONST } from '../../../lib/enum';

const match3GameId = MIGRATION_CONST.match3GameId;

const prepareUserAICodeMatch3 = () => {

  UserAICodeProd.remove({
    _id: 'aicode1'
  });
  UserAICodeProd.remove({
    _id: 'aicode2'
  });
  
  UserAICodeProd.remove({
    _id: 'aicodesystem'
  });

  // console.log("reinserting user AI code for match3 game!");
    const userAICode = {
      _id: 'aicode1',
      userId: 'kEmnDrYssC2gKNDxx',
      gameId: match3GameId,
      SubTrackName: 'Standard',
      releasedAt: new Date(),
      releaseName: 'v1',
      PlayerCode: `
function getNewCommand() {

  if (Math.random() > 0.7) {
    return {
      action: "USESTICKER",
      type: getRandomSticker()
    };
  }


  const MOVES = [{dir: "U", r: 1, c: 0}, {dir: "D", r: -1, c: 0}, {dir: "R", r: 0, c: 1}, {dir: "L", r: 0, c: -1}];
  let best2 = null;
  const startr = Math.floor(Math.random() * ROW_COUNT);
  const startc = Math.floor(Math.random() * COLUMN_COUNT);
  for (let r1=startr; r1<startr+ROW_COUNT; r1++) {
    for (let c1=startc; c1<startc+COLUMN_COUNT; c1++) {
      const c = c1 % COLUMN_COUNT;
      const r = r1 % ROW_COUNT;
      const tile = MyMaze[c][r];
      for (let i=0; i<=3; i++) {
        const move = MOVES[i];
        const newc = c + move.c;
        const newr = r + move.r;
        if (newc < 0 || newc >= COLUMN_COUNT || newr < 0 || newr >= ROW_COUNT) continue;
        if (MyMaze[newc][newr].d == tile.d) continue;
        const maxMatch = getBestMatch(c, r, newc, newr);
        if (maxMatch >= 3) {
          return {
            action: "SWAPTILE",
            r: r,
            c: c,
            type: move.dir
          };
        } else if (maxMatch == 2) {
          if (best2 == null) {
            best2 = {
              action: "SWAPTILE",
              r: r,
              c: c,
              type: move.dir
            };
          }
        }
      }
    }
  }

  if (best2 != null) return best2;

  return {
    action: "SWAPTILE",
    r: 1 + Math.floor(Math.random()*(ROW_COUNT-1)),
    c: 1 + Math.floor(Math.random()*(COLUMN_COUNT-1)),
    type: getRandomDir()
  };
};

`      
    };
    UserAICodeProd.insert(userAICode);

    // ai2
    userAICode._id = 'aicode2';
    userAICode.userId = "s6sPfxMsKzZghBXnN";
    UserAICodeProd.insert(userAICode);


    const userAICode3 = {
      _id: 'aicodesystem',
      userId: 'system',
      gameId: match3GameId,
      SubTrackName: 'Standard',
      releasedAt: new Date(),
      releaseName: 'TGame_Bot',
    };
    userAICode3.PlayerCode = userAICode.PlayerCode;
    UserAICodeProd.insert(userAICode3);
};


export default prepareUserAICodeMatch3;
