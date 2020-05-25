
import { UserAICodeProd } from '../../../lib/collections';
import { MIGRATION_CONST } from '../../../lib/enum';

const tankGameId = MIGRATION_CONST.tankGameId;

const prepareUserAICode = () => {
  UserAICodeProd.remove({gameId: tankGameId, _id: 'aitankcodesystem'});
  UserAICodeProd.remove({gameId: tankGameId, _id: 'aitankcode2'});

  const userAICode = {
    _id: 'aitankcodesystem',
    userId: 'system',
    gameId: tankGameId,
    SubTrackName: 'Standard',
    releasedAt: new Date(),
    releaseName: 'TGame_Bot',
    PlayerCode: `

// blocked by rocks or not at the same r or c.
function isShellBlocked(pos1, pos2) {
  if (pos1.r === pos2.r && pos1.c === pos2.c) return true;
  if (pos1.r === pos2.r) {
    if (pos1.r >= world.maze.length) return false;
    const row = world.maze[pos1.r];
    for (let i = Math.min(pos1.c, pos2.c) + 1; i < Math.max(pos1.c, pos2.c); i += 1) {
      if (i.toString() in row && row[i.toString()] === 'R') return true;
    }
    return false;
  }
  if (pos1.c === pos2.c) {
    for (let i = Math.min(pos1.r, pos2.r) + 1; i < Math.max(pos1.r, pos2.r); i += 1) {
      if (i >= world.maze.length) return false;
      if (pos1.c.toString() in world.maze[i] && world.maze[i][pos1.c.toString()] === 'R') return true;
    }
    return false;
  }
  return true;
}

// create 2D array filled with zeros
function createNewGraph() {
  return Array(world.TileRows).fill().map(() => Array(world.TileCols).fill(0));
}

function getDangerScores(myPos) {
  let dScores = 0;
  const oppScore = world.tanks[1 - MyID].specialPower.damage + 1;

  for (let i = 0; i < world.tanks.length; i += 1) {
    if (i === MyID) continue;
    const t = world.tanks[i];
    if (!isShellBlocked(myPos, t)) {
      if (myPos.r === t.r &&
        (myPos.c < t.c && t.dir === 'L' ||
          myPos.c > t.c && t.dir === 'R')) {
        dScores += (i === 1 - MyID ? oppScore : 1); // high weight for opp tank
      } else if (myPos.c === t.c &&
        (myPos.r < t.r && t.dir === 'U' ||
          myPos.r > t.r && t.dir === 'D')) {
        dScores += (i === 1 - MyID ? oppScore : 1);
      }
    }
  }
  return dScores;
}

// calculate danger score for every tile
function getAllDangerScores() {
  const scores = createNewGraph();
  let oppScore = 1;
  const oppTank = world.tanks[1 - MyID];
  if (oppTank && oppTank.specialPower && oppTank.specialPower.damage > 0)
    oppScore += oppTank.specialPower.damage;
  for (let i = 0; i < world.tanks.length; i += 1) {
    if (i === MyID) continue;
    const dscore = i === 1 - MyID ? oppScore : 1;
    const t = world.tanks[i];
    if (t.dir === 'U') {
      for (let j = t.r - 1; j >= 0 && (!(t.c.toString in world.maze[j]) || world.maze[j][t.c.toString()] !== 'R'); j -= 1) {
        scores[j][t.c] += dscore;
      }
    } else if (t.dir === 'D') {
      for (let j = t.r + 1; j < world.TileRows && (!(t.c.toString in world.maze[j]) || world.maze[j][t.c.toString()] !== 'R'); j += 1) {
        scores[j][t.c] += dscore;
      }
    } else if (t.dir === 'L') {
      for (let j = t.c - 1; j >= 0 && (!(j.toString in world.maze[t.r]) || world.maze[t.r][j.toString()] !== 'R'); j -= 1) {
        scores[t.r][j] += dscore;
      }
    } else if (t.dir === 'D') {
      for (let j = t.c + 1; j < world.TileCols && (!(j.toString in world.maze[t.r]) || world.maze[t.r][j.toString()] !== 'R'); j += 1) {
        scores[t.r][j] += dscore;
      }
    }
  }
  return scores;
}

function getClosestItem(items) {
  const myTank = world.tanks[MyID];
  const oppTank = world.tanks[1 - MyID];
  let dis = -1;
  let ans = null;
  for (let i = 0; i < items.length; i += 1) {
    const curdis = dist2(myTank, items[i]);
    const oppdis = (oppTank.x < 0 || oppTank.y < 0) ? -1 : dist2(oppTank, items[i]);
    if (dis === -1 || curdis < dis && (oppdis === -1 || oppdis >= curdis)) {
      dis = curdis;
      ans = items[i];
    }
  }
  return ans;
}

function getTileType(r, c) {
  const cstr = c.toString();
  if (!(cstr in world.maze[r])) return '';
  return world.maze[r][cstr];
}

function getBestDir(pos, dangerScores) {
  const myTank = world.tanks[MyID];
  if (myTank.r === pos.r && myTank.c === pos.c) return [];
  const blockTileTypes = new Set(['R', 'M', 'T', 'B']);
  const graph = createNewGraph();

  for (let i = 0; i < graph.length; i += 1) {
    for (let j = 0; j < graph[i].length; j += 1) {
      const tile = getTileType(i, j);
      if (blockTileTypes.has(tile)) graph[i][j] = 0;
      else graph[i][j] = 1 + dangerScores[i][j];
    }
  }

  return getShortestPath(graph, myTank, pos);
}

function goForWeapon(dangerScores) {
  const myTank = world.tanks[MyID];
  const oppTank = world.tanks[1 - MyID];
  const WTS = world.SPECIAL_WEAPON_TYPES;
  const wps = {};
  wps[WTS.LASER_GUN] = 1;
  wps[WTS.MATRIX] = 2;
  wps[WTS.SERIAL_KILLER] = 3;
  wps[WTS.WAY4] = 4;
  wps[WTS.SPLITTER3] = 5;
  wps[WTS.FREEZER] = 6;


  let bestwptype = myTank.specialWeapon && myTank.specialWeapon.type > 0 ? wps[myTank.specialWeapon.type] : -1;
  let bestwp = null;
  if (bestwptype === -1 && !(bestwptype === world.SPECIAL_WEAPON_TYPES.FREEZER && myTank.specialPower.damage < 3)) {
    bestwp = getClosestItem(world.weapons);
    if (bestwp) bestwptype = bestwp.type;
  } else if (bestwptype > 0) {
    for (let i = 0; i < world.weapons.length; i += 1) {
      const w = world.weapons[i];
      if (wps[w.type] <= bestwptype) {
        bestwptype = wps[w.type];
        bestwp = w;
      }
    }
  }
  if (bestwp) {
    bestwp.c = Math.round((bestwp.x - world.TileWidth / 2) / world.TileWidth);
    bestwp.r = Math.round(bestwp.y / world.TileHeight - 1.5);
    // console.log("go for weapon " + bestwp.type + " at r=" + bestwp.r + " c=" + bestwp.c);
    return getBestDir(bestwp, dangerScores);
  }
  return '';
}

function goForCrystal(dangerScores) {
  const closeCrystal = getClosestItem(world.crystals);
  if (closeCrystal) {
    closeCrystal.c = Math.round((closeCrystal.x - world.TileWidth / 2) / world.TileWidth);
    closeCrystal.r = Math.round(closeCrystal.y / world.TileHeight - 1.5);
    return getBestDir(closeCrystal, dangerScores);
  }
  return '';
}

function upgradeSuperPowers() {
  const myTank = world.tanks[MyID];
  if (myTank.powerPoint > 0) {
    const sp = myTank.specialPower;
    if (myTank.health < 2000 && sp.healthRegen < world.MAX_POWER) return '3';
    if (sp.speed < 2) return '2';
    if (sp.damage < 2) return '1';
    if (sp.healthRegen < 2) return '3';
    if (sp.speed < world.MAX_POWER) return '2';
    if (sp.damage < world.MAX_POWER) return '1';
    if (sp.reload < world.MAX_POWER) return '4';
    if (sp.healthRegen < world.MAX_POWER) return '3';
  }
  return '';
}

function goForTank(t2, dangerScores) {
  if (t2.r < 0 || t2.c < 0) return '';
  const myTank = world.tanks[MyID];

  if (myTank.r === t2.r && myTank.c === t2.c) return '';
  if (myTank.r === t2.r && !isShellBlocked(myTank, t2)) {
    if (myTank.c < t2.c) return myTank.dir === 'R' ? 'S' : 'R';
    else return myTank.dir === 'L' ? 'S' : 'L';
  }
  if (myTank.c === t2.c && !isShellBlocked(myTank, t2)) {
    if (myTank.r < t2.r) return myTank.dir === 'D' ? 'S' : 'D';
    else return myTank.dir === 'U' ? 'S' : 'U';
  }
  return getBestDir(t2, dangerScores);
}

const targetTankPos = {r: -1, c: -1};

function goForWhiteTank(dangerScores) {
  const myTank = world.tanks[MyID];
  let dis = -1;
  let target = null;
  for (let i = 2; i < world.tanks.length; i += 1) {
    const cur = world.tanks[i];
    // console.log(cur.freeze + " " + myTank.specialWeapon.type);
    if (cur.r === myTank.r && cur.c === myTank.c ||
      cur.freeze && myTank.specialWeapon && myTank.specialWeapon.type === world.SPECIAL_WEAPON_TYPES.FREEZER)
      continue;
    if (cur.r < 0 || cur.c < 0 || cur.r === myTank.r && cur.c === myTank.c) continue;
    // if (cur.r === myTank.r || cur.c === myTank.c)
    //  return goForTank(cur, dangerScores);
    if (cur.r === targetTankPos.r && cur.c === targetTankPos.c) return goForTank(cur, dangerScores);
    
    const curdis = (Math.abs(cur.r - myTank.r) + Math.abs(cur.c - myTank.c)) * (cur.health || 500);
    if (dis === -1 || curdis < dis) {
      dis = curdis;
      target = cur;
    }
  }
  if (target) {
    targetTankPos.r = target.r;
    targetTankPos.c = target.c;
    return goForTank(target, dangerScores);
  }
  targetTankPos.r = -1;
  targetTankPos.c = -1;
  return '';
}

function moveToSafe(dangerScores) {
  const myTank = world.tanks[MyID];
  const cands = [];
  const dirs = {
    U: [-1, 0],
    D: [1, 0],
    L: [0, -1],
    R: [0, 1]
  };
  const keys = Object.keys(dirs);
  for (let i = 0; i < keys.length; i += 1) {
    const dir = keys[i];
    const delta = dirs[dir];
    const r = myTank.r + delta[0];
    const c = myTank.c + delta[1];
    if (r < 0 || r >= world.TileRows || c < 0 || c >= world.TileCols) continue;
    const tile = (world.maze && world.maze[r] && world.maze[r][c.toString()]) ? world.maze[r][c.toString()] : "";
    if (tile === 'R' || tile === 'M') continue;
    if (dangerScores[r][c] === 0 || dangerScores[r][c] < dangerScores[myTank.r][myTank.c]) cands.push(dir);
  }
  if (cands.length > 0) {
    // randomly pick one safe direction for mow.
    const rand = Math.floor(Math.random() * cands.length);
    return cands[rand];
  }
  return '';
}

function goForOpponent(dangerScores, myTank, oppTank) {
  
  if (oppTank && oppTank.r >= 0 && oppTank.c >= 0 && // opponet is on maze
      myTank.health > 2000 && // my health is good
      // I recover faster or I am healthier
      (myTank.specialPower.healthRegen > oppTank.specialPower.healthRegen || 
        myTank.health >= oppTank.health || oppTank.freeze ) &&
    	!(oppTank.freeze && myTank.specialWeapon && myTank.specialWeapon.type === world.SPECIAL_WEAPON_TYPES.FREEZER) &&
    	(oppTank.r !== myTank.r || oppTank.c !== myTank.c) &&
      // if i'm supper strong
    	(myTank.specialPower.damage === world.MAX_POWER || myTank.specialPower.reload === world.MAX_POWER)
     ) {
    return goForTank(oppTank, dangerScores);
  }
  return '';
}

function goForRandom() {
  const cands = ['U', 'D', 'L', 'R'];
  const random = Math.floor(Math.random() * 4);
  return cands[random];
}

let preHealth = -1;

function getNewCommand() {
  let cmd = '';
  const myTank = world.tanks[MyID];
  cmd = upgradeSuperPowers();
  if (cmd && cmd.length > 0) {
    preHealth = myTank.health;
    return cmd;
  }

  for (let i = 0; i < world.tanks.length; i += 1) {
    const t = world.tanks[i];
    t.c = Math.round((t.x - world.TileWidth / 2) / world.TileWidth);
    t.r = Math.round(t.y / world.TileHeight - 1.5);
  }
  const dangerScores = getAllDangerScores();
  if (preHealth > 0 && preHealth - myTank.health > 10) {
    preHealth = myTank.health;
    cmd = moveToSafe(dangerScores);
    // console.log("escape!!!!" + cmd);
    return cmd;
  }
  preHealth = myTank.health;

  const oppTank = world.tanks[1 - MyID] || {};
  if (myTank.r === oppTank.r && myTank.c === oppTank.c) return goForRandom();
  
  // get all options based on current world
  const optionWeapon = goForWeapon(dangerScores);
  const optionCrystal = goForCrystal(dangerScores);
  const optionOpponent = goForOpponent(dangerScores, myTank, oppTank);
  const optionWhiteTank = goForWhiteTank(dangerScores);
  const optionSafe = moveToSafe(dangerScores);
  
  const specialSpeed = myTank.specialPower.speed + 1;
  
  if (optionSafe && optionSafe.length > 0 &&
      (dangerScores[myTank.r][myTank.c] > world.MAX_POWER + 1 ||
      dangerScores[myTank.r][myTank.c] > 2 && myTank.health < 1500)
     ) {
    // console.log("Safety 1");
    cmd = optionSafe[0];
  } else if ((myTank.powerPoint < 2 || oppTank.powerPoint && oppTank.powerPoint < 2) &&
    optionCrystal && optionCrystal.length > 0 && optionCrystal.length < specialSpeed * 20
  ) {
    // console.log("Crystal!");
    cmd = optionCrystal[0];
  } else if (optionWeapon && optionWeapon.length > 0 && optionWeapon.length < specialSpeed * 15) {
    // console.log("Weapon!");
    cmd = optionWeapon[0];
  } else if (optionOpponent && optionOpponent.length > 0) {
    // console.log("Opponent!");
    cmd = optionOpponent[0];
  } else if (optionWhiteTank && optionWhiteTank.length > 0) {
    // console.log("White!");
    cmd = optionWhiteTank[0];
  } else if (optionSafe && optionSafe.length > 0) {
    // console.log("Safety 2!");
    cmd = optionSafe[0];
  }
  
  if (!cmd || cmd === '') {
    // console.log("Random!");
    cmd = goForRandom();
  }
  if (cmd === 'U' && myTank.speedY === 1 ||
     cmd === 'D' && myTank.spendY === -1 ||
     cmd === 'L' && myTank.spendX === -1 ||
     cmd === 'R' && myTank.spendX === 1) cmd = '';
  // console.log("getNewCommand sending " + cmd);
  return cmd;
}


    `
  };
  UserAICodeProd.insert(userAICode);

  const userAICode2 = {
    _id: 'aitankcode2',
    userId: 'kEmnDrYssC2gKNDxx',
    gameId: tankGameId,
    SubTrackName: 'Standard',
    releasedAt: new Date(),
    releaseName: 'v1',
  };
  userAICode2.PlayerCode = userAICode.PlayerCode;
  UserAICodeProd.insert(userAICode2);

};


export default prepareUserAICode;
