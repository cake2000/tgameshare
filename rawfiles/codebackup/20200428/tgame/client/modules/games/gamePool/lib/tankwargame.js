/* eslint-disable */
/*

Tank State and Dir:
1. tank receives remove order, store as pending state and pendingx/pendingy
2. tank compares current position with pendingx/y to determine if can take pending state direction, or
   need to first move towards pending x/y first. Might need to force sync x or y position
3. in updateSpeedAndDir, update dir/speed based on state if actual dir is different from state

New way of controlling tanks
1. on key down, local owner tank controller would interpretOrder
2. Inside interpretOrder, calculate next state change's action and location
   assume can only change at next full block point if moving, or current point if paused
   then send it to all peers
3. on receiving an state update, the corresponding tank controller remembers this state change command
   given current tank actual dir, if can execute right away, then do so;
   otherwise, check if current tank will be arriving at the projected point, if so, store it, and check again;
   if won't be arriving at projected point, first "drag" tank back to that point, then run towards that point


Basic Idea:
1. each client controls his own object's movement
2. collision between bomb/tank is determined by host only, so for a guest, bomb may fly through tank
3. collision between tank/tank is determined by host only, so for a guest, tank may overlap through tank
   host will send new position update of tank/bomb to guest when they arrive at new tile center, and guest
   need to verify that's on its own path history. If not, send updated position of tank
3. collision between bomb/blocker or tank/blocker is determined locally at each client/host
4. whenever a tank changes row, need to change its zIndex?
https://github.com/pixijs/pixi.js/issues/300


Setup Process:
1. TankWarComponent DidMount -> createTankGame
2. createTankGameÃ¯Â¼Å¡
  const gameObj = new TankWar(gameSetup);
  gameObj.setupGameRoom();
3. setupGameRoom:
this.setupConfig();
    this.enhanceVictor();
    this.loadSounds();
    this.setup();
    this.createController();
    this.loadTextures();
4. loadTextures: call initFunction after textures loaded
5. initFunction:
    that.setupHandleRoom();
    TankActions.reportEnteringGameRoom(gameSetup.room._id, gameSetup.localPlayerID);
    that.tick
6. in setupHandleRoom:
   add gameSetup.handleRoomUpdate, which setup peers when the room is udpated
   when all peers are CONNECTED, create networkHandler, then call initScreen
7. in initScreen
if (gameSetup.isLocal || gameSetup.isHost) {
      this.calculateTileMap();

      if (gameSetup.isLocal) {
        this.setupUsingMaze();

        let newPoint = this.getNewEmptyBlock();
        this.addOneTank("blue", newPoint.r, newPoint.c, 0);
        newPoint = this.getNewEmptyBlock();
        this.addOneTank("red", newPoint.r, newPoint.c, 1);
        gameSetup.gameStarted = true;
      } else {
        // send maze to all
        gameSetup.networkHandler.sendCommandToAll({
          c: "InitMaze", t: gameSetup.currentCycleTime, w: gameSetup.tilemap
        });

        setTimeout(() => {
          const newPoint = tankWarGame.getNewEmptyBlock();
          gameSetup.sendCommandToAll({
            c: "AddTank", t: gameSetup.currentCycleTime, w: `blue_${newPoint.r}_${newPoint.c}_0`
          });
        }, 100);

        setTimeout(() => {
          const newPoint = tankWarGame.getNewEmptyBlock();
          gameSetup.sendCommandToAll({
            c: "AddTank", t: gameSetup.currentCycleTime, w: `red_${newPoint.r}_${newPoint.c}_1`
          });
        }, 150);
      }

8. when guest receives "InitMaze" and "AddTank", and when they have added all 2 tanks, they will return
with "MazeReady" host sents "StartGame" to all when all peers are maze ready

9. in that.tick:
    if (gameSetup.gameStarted) {
      gameSetup.controller.tickUpdate();
    }



TODO:
0. network handler for sending actions to all peers to carry out action locally
1. keyboard input -> command: move, stop, shoot
2. local tank controller to convert movement command to state change events (who change to what state at where). each command changes tank's state, like "TURN_RIGHT" or "MOVE_RIGHT", and need to move in current direction for at least half a block before making a 180 degree u-turn. If turning 90 degrees, need to be in 360 degrees. local tank controller determines if tank collides with obstacle, and tank can overlap with tanks!
tank state update is sent as command over network, and each tank controller implements the state update, and also manage actual tank move in real time based on state and stopping point.
3. only host can determine if a collision occurs beteen bomb/tank, bomb/obstacle, and if so, reduce health for tank, explode bomb, and remove obstacle





*/
// var Highcharts = require('highcharts');
// // Load module after Highcharts is loaded
// require('highcharts/modules/exporting')(Highcharts);
// import regression from 'regression';
// const jsregression = require('js-regression');
import { GAME_TYPE, PLAYER_TYPE } from '../../../../../lib/enum';
import TankActions from './tankActions';
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
import { astar, Graph } from "javascript-astar";
import { Howler } from "howler";
import { debug } from "util";
import Detector from "./detector.js";
import Stats from "./stats.min.js";
import jstat from "./jstat.min.js";
const isMobile = require('ismobilejs');
import { setTimeout, clearTimeout } from "timers";
// import Ammo from "./ammo.js";
import IL from "./illuminated";
import { GamesRelease } from '../../../../../lib/collections/index';
import { ADDRCONFIG } from 'dns';
import gamesSection from '../../../homepage/components/gamesSection/gamesSection';

const ols = require('./ols.js'), sylvester = require('sylvester');
import _ from 'lodash';
// import { left } from 'glamor';
const localForage = require("localforage");
localForage.config({
  driver: localForage.INDEXEDDB,
  name: 'myDb'
});

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

// const regression = new jsregression.LinearRegression({
//   alpha: 0.0000001, //
//   iterations: 30000,
//   lambda: 0.0,
//   trace: true
// });

const resolvedAllStop = {};
const resolvedPlanCallShot = {};

const WeaponName = {
  1: "3-Splitter",
  2: "4-Way gun",
  3: "Freezer gun",
  4: "Nova gun",
  5: "Missile gun",
  6: "Laser gun"
};


const vcushion = 0;
const BEGINNER = 0;
const ADVANCED = 1;
// const PROFESSIONAL = 1;

/*3 modes of simulation:
1. SIM_PROB: part of a probability run with pre-specified skew so just needs to know if target is pocketd.
2. SIM_DRAW: need to draw forecast lines with no skew
3. SIM_ENDSTATE: similar to SIM_PROB, run with pre-specified skew, no need for drawing
*/
const SIM_PROB = 0;
const SIM_DRAW = 1;
const SIM_ENDSTATE = 2;

const GAME_ONGOING = 0;
const GAME_OVER_STATE = 1;
const GAME_MAZE_MODE = 2;

const CMD_READY = -1;
const CMD_GET_COMMAND = 0;
const CMD_TEST_RUN = 1;

const CMD_SCRIPT_PLACE_TANK = 10;
const CMD_SCRIPT_CLEAR_MAZE = 11;
const CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE = 12;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;
const CMD_SCRIPT_PLACE_TILE = 14;
const CMD_SCRIPT_REMOVE_ALL_TANK = 15;
const CMD_SCRIPT_SETUP_TICK_UPDATE = 16;
const CMD_SCRIPT_PLACE_CRYSTAL = 17;
const CMD_SCRIPT_PLACE_WEAPON = 18;

const CMD_SEND_TEAM_MESSAGE = 20;
const CMD_NEW_CRYSTAL = 21;
const CMD_DIS_CRYSTAL = 32;
const CMD_NEW_WEAPON = 23;
const CMD_DIS_WEAPON = 24;
const CMD_RECEIVE_TEAM_MESSAGE = 25;
const CMD_TANK_DEAD = 26;
const CMD_SCRIPT_SET_TANK_PROPERTIES = 27;
const CMD_PRINT = 28;
const CMD_CLEAR_PRINT = 29;
const CMD_WHITE_TANK = 30;
const CMD_GET_SECONDS_LEFT = 31;
const CMD_SCRIPT_SET_SECONDS_LEFT = 32;
const CMD_SCRIPT_START_END_GAME_MODE = 33;
const CMD_SCRIPT_EXPECT_WHITETANK_KILLED = 34;
const CMD_TANK_ORDER = 35;
const CMD_SCRIPT_SET_EXPECTED_RESULT = 36;
const CMD_ERROR_IN_WORKER = 100;


const MODAL_EXITGAME = 0; // one button to exit game
const MODAL_EXITORREPLAY = 1;
const MODAL_NOBUTTON = 2; // read only

const autobuttoncolor = 0x1f71f4; //0x4286f4;
const autobuttoncolor2 = '#1f71f4';
const MAX_SPEED = 4000;
const SPIN_M = 2.2; // larger means more spin at strike
const stepsize = 1/60;
const Pool = {
  showDebug: false,
  RED: 0,
  YELLOW: 1,
  WHITE: 2,
  BLACK: 3,
  YORR: 4,
  BLANK: 5
};

const SPECIAL_WEAPON_TYPES = {
  SPLITTER3: 1,
  WAY4: 2,
  FREEZER: 3,
  MATRIX: 4,
  NOVA: 4,
  SERIAL_KILLER: 7,
  LASER_GUN: 6,
  MISSILE: 5,
};

const getSpecialWeaponResourceName = type => `/images/tank/weapon2_${type}.png`;

const ColorTypeString = {
  0: 'RED',
  1: 'YELLOW',
  2: 'WHITE',
  3: 'BLACK',
  4: 'YELLOW or RED'
};

const ColorTypeString2 = {
  0: 'red',
  1: 'yellow',
  2: 'white',
  3: 'black',
  4: 'yellow or red'
};

const InputMode = {
  DEFAULT: 0,
  SET_ANGLE: 1,
  SET_SPIN: 2,
  SET_FORCE: 3
};

const MAZE_SIZE = {
  BEGINNER: 15,
  ADVANCED: 21,
};

const MAX_POWER_UP = 3;

const TankGame = {

    /* Here we've just got some global level vars that persist regardless of State swaps */
  score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
  music: null,

    /* Your game can check TankGame.orientated in internal loops to know if it should pause or not */
  orientated: false,

  PRACTICE: GAME_TYPE.PRACTICE,
  MATCH: GAME_TYPE.MATCH,
  TESTING: GAME_TYPE.TESTING,
  TOURNAMENT: GAME_TYPE.TOURNAMENT
};

const SPECIAL_POWER = {
  DAMAGE: 'DAMAGE',
  RELOAD: 'RELOAD',
  SPEED: 'SPEED',
  HEALTH_REGEN: 'HEALTH-REGEN',
};
const SPECIAL_POWER_PREFIX = {
  DAMAGE: 'damage',
  RELOAD: 'reload',
  SPEED: 'speed',
  'HEALTH-REGEN': 'health_regen',
};
const MAX_POWER_BEGINNER = 4;
const MAX_POWER_ADVANCED = 6;

const TANK_MASK_PROP = 0.855;
const FULL_TANK_WIDTH = 106;
const FULL_TANK_HEIGHT = 137;

const TANK_UPGRADE_SPECIAL_POWER_CMD = 'TankUpgradeSpecialPower';

const DEFAULT_SPEED = 2;
const LASER_HEAD_WIDTH = 10;

const CHANGE_WEAPON_ALPHA_CMD = "CHANGE_WEAPON_ALPHA";
const REMOVE_WEAPON_ALPHA_CMD = "REMOVE_WEAPON_ALPHA";


const workerCodeTemplat = `

// import { debug } from "util";



Victor.prototype.scale = (s) => {
  this.x *= s;
  this.y *= s;
  return this;
};


function sqr(x) { return x * x; }
function dist2sqr(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
function dist2(v, w) { return Math.sqrt(dist2sqr(v, w)); }
function distToSegmentSqr(p, v, w) {
  const l2 = dist2sqr(v, w);
  if (l2 === 0) return dist2sqr(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2sqr(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSqr(p, v, w));
}

const isShellBlockedAt = (r, c, color) => {
  return (Maze[r][c] === 'T' || Maze[r][c] === 'R' || 
  r in TankMaze && c in TankMaze[r] 
  && TankMaze[r][c].filter(t => t.color !== color).length > 0);
};

const fromSetToArray = (rangeSet, pos) => {
  const ret = [];
  for (let r of rangeSet) {
    if (pos.c + '_' + pos.r === r) continue;
    const tokens = r.split("_");
    ret.push([tokens[0], tokens[1]]);
  }
  return ret;
};

const getWeaponRange = (type, pos, dir, color) => {
  let rangeSet = new Set();
  switch (type) {
    case 0: 
    case SPECIAL_WEAPON_TYPES.FREEZER:
    case SPECIAL_WEAPON_TYPES.LASER_GUN:
      rangeSet = getRange(pos, dir, color);
      break;
    case SPECIAL_WEAPON_TYPES.SPLITTER3:
      rangeSet = get3SplitterRange(pos, dir, color);
      break;
    case SPECIAL_WEAPON_TYPES.NOVA:
      rangeSet = getNovaRange(pos, dir, color);
      break;
    case SPECIAL_WEAPON_TYPES.WAY4:
      rangeSet = get4WayRange(pos, color);
      break;
    case SPECIAL_WEAPON_TYPES.MISSILE:
      rangeSet = getMissileRange(pos, dir, color);
  }
  // rangeSet.delete(pos.c + '_' + pos.r);
  return fromSetToArray(rangeSet, pos);
};

const getMissileRange = (pos, dir, color) => {
  const ret = new Set();
  if (dir === 'U') {
    for (let i = pos.r; i >= 0 && (pos.r - i < 3); i -= 1) {
      ret.add(pos.c + '_' + i);
      if (isShellBlockedAt(i, pos.c, color)) break;
    }
  } else if (dir === 'D') {
    for (let i = pos.r; i < Maze.length && (i - pos.r < 3); i += 1) {
      ret.add(pos.c + '_' + i);
      if (isShellBlockedAt(i, pos.c, color)) break;
    }
  } else if (dir === 'L') {
    for (let j = pos.c; j >= 0 && (pos.c - j < 3); j -= 1) {
      ret.add(j + '_' + pos.r);
      if (isShellBlockedAt(pos.r, j, color)) break;
    }
  } else if (dir === 'R') {
    for (let j = pos.c; j < Maze[pos.r].length && (j - pos.c < 3); j += 1) {
      ret.add(j + '_' + pos.r);
      if (isShellBlockedAt(pos.r, j, color)) break;
    }
  }
  return ret;
};


const getRange = (pos, dir, color) => {
  const ret = new Set();
  if (dir === 'U') {
    for (let i = pos.r; i >= 0; i -= 1) {
      ret.add(pos.c + '_' + i);
      if (isShellBlockedAt(i, pos.c, color)) break;
    }
  } else if (dir === 'D') {
    for (let i = pos.r; i < Maze.length; i += 1) {
      ret.add(pos.c + '_' + i);
      if (isShellBlockedAt(i, pos.c, color)) break;
    }
  } else if (dir === 'L') {
    for (let j = pos.c; j >= 0; j -= 1) {
      ret.add(j + '_' + pos.r);
      if (isShellBlockedAt(pos.r, j, color)) break;
    }
  } else if (dir === 'R') {
    for (let j = pos.c; j < Maze[pos.r].length; j += 1) {
      ret.add(j + '_' + pos.r);
      if (isShellBlockedAt(pos.r, j, color)) break;
    }
  }
  return ret;
};

function get3SplitterRange(pos, dir, color) {
  const ret = new Set();
  if (dir === 'U') {
    let cross = null;
    for (let i = pos.r - 1; i >= 0; i -= 1) {
      ret.add(pos.c + '_' + i);
      if (Maze[i][pos.c] === 'T' || i in TankMaze && pos.c in TankMaze[i] 
      && TankMaze[i][pos.c].filter(t => t.color !== color).length > 0) return Array.from(ret);

      if (Maze[i][pos.c] === 'R') {
        cross = { r: i + 1, c: pos.c };
        break;
      }
    }
    if (cross) {
      const lset = getRange(cross, 'L', color);
      const rset = getRange(cross, 'R', color);
      const dset = getRange(cross, 'D', color);
      return Array.from(new Set([...ret, ...lset, ...rset, ...dset]));
    }
  } else if (dir === 'D') {
    let cross = null;
    for (let i = pos.r + 1; i < Maze.length; i += 1) {
      ret.add(pos.c + '_' + i);
      if (Maze[i][pos.c] === 'T' || i in TankMaze && pos.c in TankMaze[i] 
      && TankMaze[i][pos.c].filter(t => t.color !== color).length > 0) return Array.from(ret);

      if (Maze[i][pos.c] === 'R') {
        cross = { r: i - 1, c: pos.c };
        break;
      }
    }
    if (cross) {
      const lset = getRange(cross, 'L', color);
      const rset = getRange(cross, 'R', color);
      const uset = getRange(cross, 'U', color);
      return Array.from(new Set([...ret, ...lset, ...rset, ...uset]));
    }
  } else if (dir === 'L') {
    let cross = null;
    for (let i = pos.c - 1; i >= 0; i -= 1) {
      ret.add(i + '_' + pos.r);
      if (Maze[pos.r][i] === 'T' || pos.r in TankMaze && i in TankMaze[pos.r] 
      && TankMaze[pos.r][i].filter(t => t.color !== color).length > 0) return Array.from(ret);

      if (Maze[pos.r][i] === 'R') {
        cross = { c: i + 1, r: pos.r };
        break;
      }
    }
    if (cross) {
      const uset = getRange(cross, 'U', color);
      const dset = getRange(cross, 'D', color);
      const rset = getRange(cross, 'R', color);
      return Array.from(new Set([...ret, ...uset, ...rset, ...dset]));
    }
  } else if (dir === 'R') {
    let cross = null;
    for (let i = pos.c + 1; i < Maze[pos.r].length; i += 1) {
      ret.add(i + '_' + pos.r);
      if (Maze[pos.r][i] === 'T' || pos.r in TankMaze && i in TankMaze[pos.r] 
      && TankMaze[pos.r][i].filter(t => t.color !== color).length > 0) return Array.from(ret);

      if (Maze[pos.r][i] === 'R') {
        cross = { c: i - 1, r: pos.r };
        break;
      }
    }
    if (cross) {
      const uset = getRange(cross, 'U', color);
      const dset = getRange(cross, 'D', color);
      const lset = getRange(cross, 'L', color);
      return Array.from(new Set([...ret, ...uset, ...lset, ...dset]));
    }
  }
  return Array.from(ret);
}

function get4WayRange(pos, color) {
  const uset = getRange(pos, 'U', color);
  const dset = getRange(pos, 'D', color);
  const lset = getRange(pos, 'L', color);
  const rset = getRange(pos, 'R', color);

  return Array.from(new Set([...uset, ...dset, ...lset, ...rset]));
}

const getNovaExposionRange = (row, col) => {
  const ret = new Set();
  for (let i = -2; i <= 2; i += 1) {
    for (let j = -2; j <= 2; j += 1) {
      const c = col + i;
      const r = row + j;
      if (r >= 0 && r < Maze.length && c >= 0 && c < Maze[r].length)
        ret.add(c + '_' + r);
    }
  }
  return ret;
}

function getNovaRange(pos, dir, color) {
  const ret = new Set();
  if (dir === 'U') {
    let cross = null;
    for (let i = pos.r - 1; i >= 0; i -= 1) {
      ret.add(pos.c + '_' + i);
      if (isShellBlockedAt(i, pos.c, color)) {
        const rangeSet = getNovaExposionRange(i, pos.c);
        return Array.from(new Set([...ret, ...rangeSet]));
      }
    }
  } else if (dir === 'D') {
    let cross = null;
    for (let i = pos.r + 1; i < Maze.length; i += 1) {
      ret.add(pos.c + '_' + i);
      if (isShellBlockedAt(i, pos.c, color)) {
        const rangeSet = getNovaExposionRange(i, pos.c);
        return Array.from(new Set([...ret, ...rangeSet]));
      }
    }
  } else if (dir === 'L') {
    let cross = null;
    for (let i = pos.c - 1; i >= 0; i -= 1) {
      ret.add(i + '_' + pos.r);
      if (isShellBlockedAt(pos.r, i, color)) {
        const rangeSet = getNovaExposionRange(pos.r, i);
        return Array.from(new Set([...ret, ...rangeSet]));
      }
    }
  } else if (dir === 'R') {
    let cross = null;
    for (let i = pos.c + 1; i < Maze[pos.r].length; i += 1) {
      ret.add(i + '_' + pos.r);
      if (isShellBlockedAt(pos.r, i, color)) {
        const rangeSet = getNovaExposionRange(pos.r, i);
        return Array.from(new Set([...ret, ...rangeSet]));
      }
    }
  }
  return Array.from(ret);
}

function getNextEndGameRockPos(numOfPos) {
  const lastPos = world.lastEndGameRockPos || { r: -1, c: -1 };
  let minColumn = 1;
  let minRow = 1;
  let maxColumn = world.TileCols - 2;
  let maxRow = world.TileRows - 2;
  let c = lastPos.c === -1 ? 1 : lastPos.c;
  let r = lastPos.r === -1 ? 1 : lastPos.r;
  const direct = { c: 1, r: 0 };
  if (c >= r) {
    if (c + r < world.TileRows) {
      direct.c = 1;
      direct.r = 0;
      minRow = r;
      maxRow = world.TileRows - (1 + minRow);
      minColumn = r;
      maxColumn = world.TileCols - (1 + minColumn);
    } else {
      direct.c = 0;
      direct.r = 1;
      maxColumn = c;
      maxRow = c;
      minRow = world.TileCols - maxRow;
      minColumn = world.TileCols - maxColumn - 1;
    }
  } else {
    if (c + r < world.TileRows) {
      direct.r = -1;
      direct.c = 0;
      minColumn = c;
      minRow = c + 1;
      maxRow = world.TileRows - (1 + minRow);
      maxColumn = world.TileCols - minColumn - 2;
    } else {
      direct.r = 0;
      direct.c = -1;
      maxRow = r;
      maxColumn = r - 1;
      minRow = world.TileRows - maxRow;
      minColumn = world.TileCols - maxColumn - 2;
    }
  }
  const result = [];
  for (let i = 0; i < numOfPos; i += 1) {
    if (c === Math.floor(world.TileCols / 2) && r === Math.floor(world.TileRows / 2)) break;
    const newC = c + direct.c;
    const newR = r + direct.r;
    if (newC > maxColumn) {
      minRow += 1;
      direct.c = 0;
      direct.r = 1;
    } else if (newR > maxRow) {
      maxColumn -= 1
      direct.c = -1;
      direct.r = 0;
    } else if (newC < minColumn) {
      maxRow -= 1;
      direct.c = 0;
      direct.r = -1;
    } else if (newR < minRow) {
      minColumn += 1;
      direct.c = 1;
      direct.r = 0;
    }
    c += direct.c;
    r += direct.r;
    result.push(c + "_" + r);
  }
  return result;
}

function getNextRockPositions(numOfPos) {
  const lastPos = world.lastEndGameRockPos || { r: -1, c: -1 };
  let minColumn = 1;
  let minRow = 1;
  let maxColumn = world.TileCols - 2;
  let maxRow = world.TileRows - 2;
  let c = lastPos.c === -1 ? 1 : lastPos.c;
  let r = lastPos.r === -1 ? 1 : lastPos.r;
  const direct = { c: 1, r: 0 };
  if (c >= r) {
    if (c + r < world.TileRows) {
      direct.c = 1;
      direct.r = 0;
      minRow = r;
      maxRow = world.TileRows - (1 + minRow);
      minColumn = r;
      maxColumn = world.TileCols - (1 + minColumn);
    } else {
      direct.c = 0;
      direct.r = 1;
      maxColumn = c;
      maxRow = c;
      minRow = world.TileCols - maxRow;
      minColumn = world.TileCols - maxColumn - 1;
    }
  } else {
    if (c + r < world.TileRows) {
      direct.r = -1;
      direct.c = 0;
      minColumn = c;
      minRow = c + 1;
      maxRow = world.TileRows - (1 + minRow);
      maxColumn = world.TileCols - minColumn - 2;
    } else {
      direct.r = 0;
      direct.c = -1;
      maxRow = r;
      maxColumn = r - 1;
      minRow = world.TileRows - maxRow;
      minColumn = world.TileCols - maxColumn - 2;
    }
  }
  const result = [];
  for (let i = 0; i < numOfPos; i += 1) {
    if (c === Math.floor(world.TileCols / 2) && r === Math.floor(world.TileRows / 2)) break;
    const newC = c + direct.c;
    const newR = r + direct.r;
    if (newC > maxColumn) {
      minRow += 1;
      direct.c = 0;
      direct.r = 1;
    } else if (newR > maxRow) {
      maxColumn -= 1
      direct.c = -1;
      direct.r = 0;
    } else if (newC < minColumn) {
      maxRow -= 1;
      direct.c = 0;
      direct.r = -1;
    } else if (newR < minRow) {
      minColumn += 1;
      direct.c = 1;
      direct.r = 0;
    }
    c += direct.c;
    r += direct.r;
    result.push([c, r]);
  }
  return result;
}

function getShortestPath(graphArray, start, end) {
  if (!graphArray || graphArray.length <= 0 || graphArray[0].length <= 0 ||
    !start || !end || start.r < 0 || start.c < 0 || end.r < 0 || end.c < 0 || 
    start.r >= graphArray.length || start.c >= graphArray[0].length || 
    end.r >= graphArray.length || end.c >= graphArray[0].length) {
    return [];
  }
  const graph = new Graph(graphArray);
  const s = graph.grid[start.r][start.c];
  const e = graph.grid[end.r][end.c];
  const path = astar.search(graph, s, e);
  return path;
}

function getShortestPathLength(graphArray, start, end) {
  const path = getShortestPath(graphArray, start, end);
  return path.length;
}

function getShortestPathCmd(graphArray, start, end) {
  const path = getShortestPath(graphArray, start, end);
  // if (path.length == 0) {
  //   debugger;
  //   const path1 = getShortestPath(graphArray, start, end);
  // }
  const graph = new Graph(graphArray);
  const s = graph.grid[start.r][start.c];
  const result = [];
  let pre = s;
  for (let i = 0; i < path.length; i += 1) {
    const cur = path[i];
    let lastcmd = result.length > 0 ? result[result.length - 1] : '';
    if (!cur || !pre) break;
    if (cur.x === pre.x && cur.y < pre.y) {
      if (lastcmd !== 'L') result.push('L');
      result.push('L');
      lastcmd = 'L';
    } else if (cur.x === pre.x && cur.y > pre.y) {
      if (lastcmd !== 'R') result.push('R');
      lastcmd = 'R';
      result.push('R');
    } else if (cur.y === pre.y && cur.x < pre.x) {
      if (lastcmd !== 'U') result.push('U');
      lastcmd = 'U';
      result.push('U');
    } else if (cur.y === pre.y && cur.x > pre.x) {
      if (lastcmd !== 'D') result.push('D');
      lastcmd = 'D';
      result.push('D');
    } else console.log("In getShortestPath: cannot move from (" + pre.r + ", " + pre.c + ") to (" + cur.r + ", " + cur.c + ")!!");
    pre = cur;
  }
  return result;
}

function getTimeLeftInSeconds() {
  if(world.secondsLeft === undefined) return -1;
  return world.secondsLeft;
}

function getRandomCommand() {
  const r = Math.random();
  if (r >= 0.8) 
    return "U";
  else if (r >= 0.6) 
    return "D";
  else if (r >= 0.4) 
    return "L";
  else if (r >= 0.2) 
    return "R";
  else 
    return "S";
}

/* game info storage */


const GameInfo = {};
let MyID = -1;
let url = "";
let world = {};
let PlayerInfo;
let Tanks = [];
let Crystals = [];
let Weapons = [];
let Maze = [];
let MAX_POWER = 0;
let SPECIAL_WEAPON_TYPES = {};
let MyTank = null;
let TankMaze = {};

function isInMyRange(pos) {
  return !isShellBlocked(MyTank, pos, MyTank.color);
}

// blocked by rocks or not at the same r or c.
function isShellBlocked(pos1, pos2, color = MyTank.color) {
  if (pos1.r === pos2.r && pos1.c === pos2.c) return true;
  if (pos1.r === pos2.r) {
    if (pos1.r >= world.maze.length) return false;
    const row = world.maze[pos1.r];

    const hasOtherTank = Tanks.find(t => t.color !== color &&
      t.c > Math.min(pos1.c, pos2.c) && t.c < Math.max(pos1.c, pos2.c) &&
      t.r === pos1.r);
    if (hasOtherTank) return true;

    for (let i = Math.min(pos1.c, pos2.c) + 1; i < Math.max(pos1.c, pos2.c); i += 1) {
      // if (i.toString() in row && row[i.toString()] === 'R') return true;
      if (row[i] === 'R' || row[i] === 'T') return true;
    }
    return false;
  }
  if (pos1.c === pos2.c) {
    const hasOtherTank = Tanks.find(t => t.color !== color && 
      t.c === pos1.c && 
      t.r > Math.min(pos1.r, pos2.r) && t.r < Math.max(pos1.r, pos2.r));
    if (hasOtherTank) return true;
    
    for (let i = Math.min(pos1.r, pos2.r) + 1; i < Math.max(pos1.r, pos2.r); i += 1) {
      if (i >= world.maze.length) return false;
      if (world.maze[i][pos1.c] === 'R' || world.maze[i][pos1.c] === 'T') return true;
    }
    return false;
  }
  return true;
}

// create 2D array filled with zeros
function createNewGraph() {
  return Array(world.TileRows).fill().map(() => Array(world.TileCols).fill(0));
}

function waitSeconds(s) {
  return new Promise((resolve, reject) => {
    setTimeout( () => {
      // console.log("time out done ");
      resolve();
    }, s * 1000);
  });
}

async function WaitForAllShellsToExplode() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE, resolveID);
  return new Promise(async (resolve, reject) => {
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.5);
    }
    resolve();
  });

};

async function getSecondsLeft() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_GET_SECONDS_LEFT, resolveID);
  return new Promise(async (resolve, reject) => {
    while (!resolveRequests[resolveID] && resolveRequests[resolveID] != 0) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.001);
    }
    // console.log("AI: got resolveProbs!! " + resolveID);
    resolve(resolveRequests[resolveID]);
  });
};

const sendTeamMessage = (message) => {
  if (!message) return;
  try {
    sendCommand(CMD_SEND_TEAM_MESSAGE, message);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when sending message', e.stack);
  }
};

function ReportEndOfTest(res) {
  sendCommand(CMD_SCRIPT_REPORT_END_OF_TEST, res);
};

function getActualDir(t) {
  if (t.speedX == 0 && t.speedY == 0) {
    return t.state.charAt(1);
  } else {
    if (t.speedX > 0) return "R";
    if (t.speedX < 0) return "L";
    if (t.speedY > 0) return "D";
    if (t.speedY < 0) return "U";
  }
}

function calcRowAndCol(arr) {
  for (let i = 0; i < arr.length; i += 1) {
    const cur = arr[i];
    cur.c = Math.round((cur.x - world.TileWidth / 2) / world.TileWidth);
    cur.r = Math.round(cur.y / world.TileHeight - 1.5);
  }
}

function genTankMaze() {
  TankMaze = {};
  for (let i = 0; i < Tanks.length; i += 1) {
    const t = Tanks[i];
    if (!TankMaze[t.r]) TankMaze[t.r] = {};
    if (!TankMaze[t.r][t.c]) TankMaze[t.r][t.c] = [];
    TankMaze[t.r][t.c].push(t);
  }
}

const updateWorld = (w) => {
  const world1 = JSON.parse(JSON.stringify(w));
  world.lastEndGameRockPos = world1.lastEndGameRockPos;
  world.secondsLeft = world1.secondsLeft;

  // update which short trees are gone
  // if (world1.tilesRemoved.trim() != "") {
  //   let p = world1.tilesRemoved.split(":");
  //   if (p.length > 0) {
  //     for (let k = 0; k < p.length - 1; k++) {
  //       if (p[k]) {
  //         const p2 = p[k].split("_");
  //         world.maze[Number(p2[0])][Number(p2[1])] = '';
  //       }
  //     }
  //   }
  // }
  // if (world1.tilesAdded.trim() != "") {
  //   let p = world1.tilesAdded.split(":");
  //   if (p.length > 0) {
  //     for (let k = 0; k < p.length - 1; k++) {
  //       if (p[k]) {
  //         const p2 = p[k].split("_");
  //         world.maze[Number(p2[1])][Number(p2[2])] = p2[0];
  //       }
  //     }
  //   }
  // }

  // new way of updating maze directly
  for (let k=0; k<world1.maze.length; k++) {
    const row1 = world1.maze[k];
    const cols = Object.keys(row1);
    for (let j=0; j<world1.maze.length; j++) {
      if (cols.includes(j+"")) {
        world.maze[k][j] = row1[j];
      } else {
        world.maze[k][j] = "";
      }
    }
  }


  world.crystals = world1.crystals;
  calcRowAndCol(world.crystals);
  Crystals = world.crystals;

  world.weapons = world1.weapons;
  calcRowAndCol(world.weapons);
  Weapons = world.weapons;

  world.tanks = world1.tanks.filter(tank => tank && tank.x >= 0);
  calcRowAndCol(world.tanks);
  for (let k = 0; k < world.tanks.length; k += 1) {
    world.tanks[k].dir = getActualDir(world.tanks[k]);
    world.tanks[k].isFrozen = ('freeze' in world.tanks[k] && world.tanks[k].freeze) ? true : false;
    if (!world.tanks[k].specialWeapon) world.tanks[k].specialWeapon = { type: 0 };
    if (!world.tanks[k].specialWeapon.type) world.tanks[k].specialWeapon.type = 0;
    if (!world.tanks[k].specialPower.damage) world.tanks[k].specialPower.damage = 0;
    if (!world.tanks[k].specialPower.reload) world.tanks[k].specialPower.reload = 0;
    if (!world.tanks[k].specialPower.speed) world.tanks[k].specialPower.speed = 0;
    if (!world.tanks[k].specialPower.healthRegen) world.tanks[k].specialPower.healthRegen = 0;
  }
  Tanks = world.tanks;
  Maze = world.maze;
  MyTank = Tanks.find(t => t.tankID === MyID);
  if (MyTank) {
    if (!MyTank.specialWeapon) MyTank.specialWeapon = { type: 0 };
    if (!MyTank.specialWeapon.type) MyTank.specialWeapon.type = 0;
  }
  genTankMaze();
};

const initWorld = (w) => {
  world = JSON.parse(JSON.stringify(w));
  // calculateProbability = calcProb;
  // create victors for ball pos and pocket pos
  world.maze = Array(world.TileRows).fill().map(() => Array(world.TileCols).fill(''));
  const parts = world.tilemap.split(":");
  for (let k = 0; k < parts.length; k++) {
    if (parts[k].length > 0) {
      const p = parts[k].split("_");
      world.maze[Number(p[1])][Number(p[2])] = p[0];
    }
  }
  Maze = world.maze;
  Tanks = world.tanks;
  MAX_POWER = world.MAX_POWER;
  SPECIAL_WEAPON_TYPES = world.SPECIAL_WEAPON_TYPES;
  MyTank = Tanks.find(t => t.tankID == MyID);
  if (MyTank) {
    if (!MyTank.specialWeapon) MyTank.specialWeapon = { type: 0 };
    if (!MyTank.specialWeapon.type) MyTank.specialWeapon.type = 0;
  }
  genTankMaze();
};

GameInfo.initialize = (data) => {
  // this.world = data.world;
  initWorld(data.world);

  // console.log("worker: " + data.playerID + " initialize " );
  MyID = data.playerID;
  url = data.url;

  sendCommand(CMD_READY);
};

GameInfo.update = function(data) {
  updateWorld(data.world);
};

const sendTankOrder = (order) => {
  sendCommand(CMD_TANK_ORDER, order);
}

const MoveRight = () => {
  sendTankOrder("R");
  sendTankOrder("R");
}

let getNewCommand2 = function() {
  return "P";
};

 -------------



// functions available for test scripts:


async function CalculateCommand() {
  try {
    let cmd = {};

    if (!MyTank) cmd = '';
    else if (typeof(getNewCommand) !== "undefined") 
      cmd = await getNewCommand();
    else 
      cmd = getNewCommand2();
    sendCommand(CMD_GET_COMMAND, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when calculating new Command so do nothing', e.stack);
    // sendCommand(CMD_TAKE_BREAK_SHOT, {aimx: 0, aimy: 0, strength: 80});
  }
}

const HandleNewCrystal = (data) => {
  try {
    if (typeof(handleNewCrystal) !== "undefined") handleNewCrystal(data);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when handling new crystal so do nothing', e.stack);
  }
};

const HandleDisCrystal = (data) => {
  try {
    if (typeof(handleCrystalRemoval) !== "undefined") handleCrystalRemoval(data);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when handling disappeared crystal so do nothing', e.stack);
  }
};

const HandleNewWeapon = (data) => {
  try {
    if (typeof(allocateNewWeapon) !== "undefined") allocateNewWeapon(data);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when handling new weapon so do nothing', e.stack);
  }
};

const HandleDisWeapon = (data) => {
  try {
    if (typeof(ackDisWeapon) !== "undefined") ackDisWeapon(data);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when handling disappeared weapon so do nothing', e.stack);
  }
};

const HandleTeamMessage = (message) => {
  try {
    if (typeof(receiveTeamMessage) !== "undefined") receiveTeamMessage(message);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when handling received team message so do nothing', e.stack);
  }
};

const HandleDeadTank = (message) => {
  try {
    if (typeof(handleTankDeath) !== "undefined") handleTankDeath(message.tankID);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when handling dead tank message so do nothing', e.stack);
  }
};

const ClearMaze = () => {
  let cmd = {};
  try {
    sendCommand(CMD_SCRIPT_CLEAR_MAZE, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when clearing maze so do nothing', e.stack);
    // sendCommand(CMD_TAKE_BREAK_SHOT, {aimx: 0, aimy: 0, strength: 80});
  }
};

const print = function(str) {
  try {
    sendCommand(CMD_PRINT, {str});
  } catch (e) {
  }
};

// define a new console

const console = (function() {
  return {
    log: (text) => {
      // oldCons.log(text);
      sendCommand(CMD_PRINT, { str: '' + text });
    },
    info: (text) => {
      //oldCons.info(text);
    },
    warn: (text) => {
      //oldCons.warn(text);
    },
    error: (text) => {
      //oldCons.error(text);
    }
  };
}());

//Then redefine the old console
//window.console = console;

const clearLog = function() {
  try {
    sendCommand(CMD_CLEAR_PRINT, {});
  } catch (e) {
  }
};

function ExpectNumberOfWhiteTanksKilled(num) {
  sendCommand(CMD_SCRIPT_EXPECT_WHITETANK_KILLED, num);
}

function SetExpectedResult(result) {
  sendCommand(CMD_SCRIPT_SET_EXPECTED_RESULT, result);
}

async function SetupTickUpdates(count) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_SETUP_TICK_UPDATE, count, resolveID);
  return new Promise(async (resolve, reject) => {
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.5);
    }
    resolve();
  });
};

const SetSecondsLeft = (s) => {
  try {
    sendCommand(CMD_SCRIPT_SET_SECONDS_LEFT, s);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when setting seconds left so do nothing', e.stack);
  }
};

const StartEndGameMode = () => {
  try {
    sendCommand(CMD_SCRIPT_START_END_GAME_MODE, {});
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when starting game end mode so do nothing', e.stack);
  }
};

const PlaceTank = (color, c, r, addAI = true) => {
  let cmd = {color, r, c, addAI};
  try {
    sendCommand(CMD_SCRIPT_PLACE_TANK, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when placing new tank so do nothing', e.stack);
  }
};


const RemoveAllTanks = () => {
  try {
    sendCommand(CMD_SCRIPT_REMOVE_ALL_TANK, {});
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when removing all tanks so do nothing', e.stack);
  }
};

const RemoveAllSprites = () => {
  try {
    sendCommand(CMD_SCRIPT_REMOVE_ALL_TANK, {});
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when removing all sprites so do nothing', e.stack);
  }
};


const PlaceTile = (tileType, c, r) => {
  let cmd = {tileType, r, c};
  try {
    sendCommand(CMD_SCRIPT_PLACE_TILE, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when calculating new Command so do nothing', e.stack);
  }
};

const PlaceCrystal = (c, r) => {
  let cmd = { r, c };
  try {
    sendCommand(CMD_SCRIPT_PLACE_CRYSTAL, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when calculating new Command so do nothing', e.stack);
  }
};

const PlaceWeapon = (weaponType, c, r) => {
  let cmd = {weaponType, r, c};
  try {
    sendCommand(CMD_SCRIPT_PLACE_WEAPON, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when calculating new Command so do nothing', e.stack);
  }
};

const SetTankProperties = (tankID, properties) => {
  let cmd = { tankID, properties };
  try {
    sendCommand(CMD_SCRIPT_SET_TANK_PROPERTIES, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when calculating new Command so do nothing', e.stack);
  }
};


const sendCommandToWhiteTank = (tankID, c) => {
  let cmd = { tankID, c };
  try {
    sendCommand(CMD_WHITE_TANK, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when sending new white tank Command ', e.stack);
  }
};

const SendCommandToTank = (tankID, c) => {
  let cmd = { tankID, c };
  try {
    sendCommand(CMD_WHITE_TANK, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when sending the tank Command ', e.stack);
  }
};


async function testRun() {

  try {
    
    -------------
  
  } catch (e) {
    // Bert.alert({
    //   title: 'Error found when executing test',
    //   message: e,
    //   type: 'danger',
    //   style: 'growl-top-right',
    //   icon: 'fa-frown-o'
    // });
    sendCommand(CMD_ERROR_IN_WORKER, 'Error in executing test script', e.stack);
    return null;
  }

}


self.onclose = function() { 
  console.log("on closing");
//    debugger;
};


const resolveRequests = {};

let commandID = 0;
const CMD_READY = -1;
const CMD_GET_COMMAND = 0;
const CMD_TEST_RUN = 1;
const CMD_SCRIPT_PLACE_TANK = 10;
const CMD_SCRIPT_CLEAR_MAZE = 11;
const CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE = 12;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;
const CMD_SCRIPT_PLACE_TILE = 14;
const CMD_SCRIPT_REMOVE_ALL_TANK = 15;
const CMD_SCRIPT_SETUP_TICK_UPDATE = 16;
const CMD_SCRIPT_PLACE_CRYSTAL = 17;
const CMD_SCRIPT_PLACE_WEAPON = 18;

const CMD_SEND_TEAM_MESSAGE = 20;
const CMD_NEW_CRYSTAL = 21;
const CMD_DIS_CRYSTAL = 32;
const CMD_NEW_WEAPON = 23;
const CMD_DIS_WEAPON = 24;
const CMD_RECEIVE_TEAM_MESSAGE = 25;
const CMD_TANK_DEAD = 26;
const CMD_SCRIPT_SET_TANK_PROPERTIES = 27;
const CMD_PRINT = 28;
const CMD_CLEAR_PRINT = 29;
const CMD_WHITE_TANK = 30;
const CMD_GET_SECONDS_LEFT = 31;
const CMD_SCRIPT_SET_SECONDS_LEFT = 32;
const CMD_SCRIPT_START_END_GAME_MODE = 33;
const CMD_SCRIPT_EXPECT_WHITETANK_KILLED = 34;
const CMD_TANK_ORDER = 35;
const CMD_SCRIPT_SET_EXPECTED_RESULT = 36;

// commands for test scripts
const CMD_ERROR_IN_WORKER = 100;

self.addEventListener('message', async (e) => {
  const data = JSON.parse(e.data);
  switch (data.cmd) {
    case CMD_READY:
      // console.log("PoolPlayerWorker initialize "); // + JSON.stringify(e.data));
      GameInfo.initialize(data);            
      break;
    case CMD_GET_COMMAND:
      GameInfo.update(data);
      await CalculateCommand();
      break;
    case CMD_NEW_CRYSTAL:
      GameInfo.update(data);
      HandleNewCrystal(data.data);
      break;
    case CMD_DIS_CRYSTAL:
      GameInfo.update(data);
      HandleDisCrystal(data.data);
      break;
    case CMD_NEW_WEAPON:
      GameInfo.update(data);
      HandleNewWeapon(data.data);
      break;
    case CMD_DIS_WEAPON:
      GameInfo.update(data);
      HandleDisWeapon(data.data);
      break;
    case CMD_RECEIVE_TEAM_MESSAGE:
      GameInfo.update(data);
      HandleTeamMessage(data.message);
      break;
    case CMD_TANK_DEAD:
      GameInfo.update(data);
      HandleDeadTank(data.data);
      break;
    case CMD_SCRIPT_SETUP_TICK_UPDATE:
      GameInfo.update(data);
      resolveRequests[data.resolveID] = 1;
      break;
    case CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE:
      GameInfo.update(data);
      resolveRequests[data.resolveID] = 1;
      break;
    case CMD_GET_SECONDS_LEFT: 
      GameInfo.update(data);
      resolveRequests[data.resolveID] = data.secondsLeft;
      break;
    case CMD_TEST_RUN:
      GameInfo.update(data);
      testRun();
      break;
    default:
      console.log("unknown message received in player worker: " + JSON.stringify(data));
  }
}, false); // [useCapture = false]


const sendCommand = (cmdType, param1, param2, param3, param4, param5) => {
  commandID ++;
  const cmdID = MyID + "_" + commandID;
  // console.log("player id " + MyID + " sending command " + cmdType + " " + JSON.stringify(param1));
  // debugger;
  switch(cmdType) {
    case CMD_READY:
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType
      });
      break;
    case CMD_TANK_ORDER: 
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType,
        order: param1
      });
      break;
    case CMD_GET_COMMAND:
      self.postMessage({
        cmdID,
        cmdType,
        playerID: MyID,
        cmd: param1
      });
      break;
    case CMD_SCRIPT_PLACE_TANK:
    case CMD_SCRIPT_PLACE_TILE:
    case CMD_SCRIPT_PLACE_CRYSTAL:
    case CMD_SCRIPT_PLACE_WEAPON:
    case CMD_SEND_TEAM_MESSAGE:
    case CMD_SCRIPT_SET_TANK_PROPERTIES:
    case CMD_WHITE_TANK:
    case CMD_PRINT:
    case CMD_CLEAR_PRINT:
    case CMD_SCRIPT_START_END_GAME_MODE:
      self.postMessage({
        cmdID,
        cmdType,
        playerID: MyID,
        cmd: param1
      });
      break;     
    case CMD_SCRIPT_REMOVE_ALL_TANK:
      self.postMessage({
        cmdID,
        cmdType,
        playerID: MyID,
        cmd: param1
      });
      break;     
    case CMD_SCRIPT_CLEAR_MAZE:
      self.postMessage({
        cmdID,
        cmdType,
        playerID: MyID,
        cmd: param1
      });
      break;
    case CMD_SCRIPT_EXPECT_WHITETANK_KILLED:
      self.postMessage({
        cmdID,
        cmdType,
        playerID: MyID,
        num: param1
      });
      break;
    case CMD_SCRIPT_SET_EXPECTED_RESULT:
      self.postMessage({
        cmdID,
        cmdType,
        playerID: MyID,
        result: param1
      });
      break;
    case CMD_ERROR_IN_WORKER:
      self.postMessage({
        cmdID,
        cmdType,
        message: param1,
        stack: param2
      });
      break;
    case CMD_SCRIPT_SETUP_TICK_UPDATE:
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType,
        updateCount: param1,
        resolveID: param2,
      });
      break;
    case CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE:
    case CMD_GET_SECONDS_LEFT:
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType,
        resolveID: param1
      });
      break;
    case CMD_SCRIPT_SET_SECONDS_LEFT:
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType,
        secondsLeft: param1
      });
      break;  
    case CMD_SCRIPT_REPORT_END_OF_TEST:
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType,
        result: param1
      });
      break;

    default:
      // debugger;
      self.postMessage({
        cmdID,
        playerID: MyID,
        cmdType,
        cmd: param1
      });
      console.log("unknown command from fsm but we send anyways " + JSON.stringify(param1));
      break;
  }
};















`;


function getTileTypeString(tt) {
  switch (tt) {
    case 'R':
      return 'rock';
    case 'M':
      return 'muddy puddle';
    case 'T':
      return 'short tree';
    case 'B':
      return 'tall bush';
    case '':
      return 'grass';
    default:
      return tt;
  }
}


// Keyboard input with customisable repeat (set to 0 for no key repeat)
//
function KeyboardController(keys, keyreleases, repeat) {
  // Lookup of key codes to timer ID, or null for no repeat
  //
  var timers= {};

  // When key is pressed and we don't already think it's pressed, call the
  // key action callback and set a timer to generate another one after a delay
  //
  document.onkeydown= function(event) {
      var key= (event || window.event).keyCode;
      if (!(key in keys))
          return true;
      // handle case the user press left, then right without releasing left
      if (key != '32' && key < '49' && key > '52') {
        for (let existingKey in timers) {
          if (existingKey != key) {
            clearInterval(timers[existingKey]);
            delete timers[existingKey];
          }
        }
      }
      if (!(key in timers)) {
          timers[key]= null;
          keys[key]();
          if (repeat!==0)
              timers[key]= setInterval(keys[key], repeat);
      }
      return false;
  };

  // Cancel timeout and mark key as released on keyup
  //
  document.onkeyup= function(event) {
    var key= (event || window.event).keyCode;
    // if (key == '40') {
    //   console.log("40 released");
    // }
    if (key in timers) {
      if (timers[key]!==null)
        clearInterval(timers[key]);
      delete timers[key];
      if (key in keyreleases)
        keyreleases[key]();
    }
  };

  // When window is unfocused we may not get key events. To prevent this
  // causing a key to 'get stuck down', cancel all held keys
  //
  window.onblur= function() {
    for (let key in timers)
      if (timers[key]!==null)
        clearInterval(timers[key]);
    timers= {};
  };
};



const dmp = DiffMatchPatch.DiffMatchPatch;
function reconstructCode(uc, latesttime) {
  if (typeof (uc) === 'undefined') {
    return "";
  }

  if (typeof (latesttime) === 'undefined') {
    latesttime = -1;
  }

  let code = '';

  for (let i = 0; i < uc.CodeUpdates.length; i += 1) {
    if ((latesttime <= 0) || (uc.CodeUpdates[i].time <= latesttime)) {
      const patch = dmp.patch_fromText(uc.CodeUpdates[i].chg);
      const results = dmp.patch_apply(patch, code);

      code = results[0];
    }
  }
  return code;
}

const cleanUpComment = (userCode, removeIndent) => {
  const lines = userCode.split("\n");
  const outlines = [];
  let inComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inComment) {
      let stop = line.length;
      if (line.indexOf("*/") >= 0) {
        inComment = false;
        stop = line.indexOf("*/") + 2;
      }
      let newline = "";
      for (let k=0; k<stop; k++) {
        newline += " ";
      }
      newline += line.substring(stop);
      outlines.push(newline);
      continue;
    } else {
      if (line.indexOf("/*") >= 0) {
        inComment = true;
        let start = line.indexOf("/*");
        let stop = line.length;
        if (line.indexOf("*/") >= 0) {
          inComment = false;
          stop = line.indexOf("*/")+2;
        }
        let newline = line.substring(0, start);
        for (let k=start; k<stop; k++) {
          newline += " ";
        }
        newline += line.substring(stop);
        outlines.push(newline);
        continue;
      }
      if (line.indexOf('//') >= 0) {
        let start = line.indexOf("//");
        let newline = line.substring(0, start);
        for (let k=start+1; k<=line.length-1; k++) {
          newline += " ";
        }
        outlines.push(newline);
      } else {
        outlines.push(line);
      }
    }
  }
  if (removeIndent) {
    for (let k=0; k<outlines.length; k++) {
      outlines[k] = outlines[k].trim();
    }
  }
  return outlines.join("\n");
};


const getCleanTestCode = (oldCode) => {
  oldCode = cleanUpComment(oldCode, true);
  let cleanTestSetupCode = "";
  const p = oldCode.split("\n");
  for (let k = 0; k < p.length; k++) {

    if (p[k].indexOf("CalculateCommand") >= 0 ||
    p[k].indexOf("SetupTickUpdates") >= 0 ||
    p[k].indexOf("ReportEndOfTest") >= 0) {
      break;
    }

    if (p[k].indexOf("PlaceTank") >= 0 && p[k].indexOf("white") >= 0) {
      // need to disable systemAI when setting up clean world
      const q = p[k].split(",");
      if (q[3].indexOf("true") < 0) {
        cleanTestSetupCode += `${p[k]}\n`;
      } else {
        cleanTestSetupCode += `${q[0]},${q[1]},${q[2]},false);\n`;
      }
    } else if (p[k].indexOf("clearLog") >= 0) {
      continue;
    } else if (p[k].indexOf("StartEndGameMode") >= 0) {
      continue;
    } else if (p[k].indexOf("SetSecondsLeft") >= 0) {
      continue;
    } else {

      cleanTestSetupCode += `${p[k]}\n`;
    }

  }
  return cleanTestSetupCode;
}



// const BALL_GROUP = Math.pow(2,0), ENEMY =  Math.pow(2,1), GROUND = Math.pow(2,2)


const WorldForPlayer = {};


const CUE_BALL_ID = 0;
const BLACK_BALL_ID = 1;

function waitSeconds(s){
  return new Promise(function(resolve, reject){
    setTimeout(function () {
      // console.log("time out done ");
      resolve();
    },s * 1000);
  });
}

const len = function (v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

const len2 = function (v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};

const rnd2old = function rnd2old() { // normal distribution
  // return Math.min(2, Math.max(-2, ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()  + Math.random() + Math.random()) - 4) / 4));
  // do we need limit?
  return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 4) / 4;
};

// Standard Normal variate using Box-Muller transform.
const rnd2 = function rnd2() {
  // return 0; // hack aaaa
  const u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
  const v = 1 - Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};


function projectPoint(A, B, C) {
  let x1 = A.x,
    y1 = A.y,
    x2 = B.x,
    y2 = B.y,
    x3 = C.x,
    y3 = C.y;
  let px = x2 - x1,
    py = y2 - y1,
    dAB = px * px + py * py;
  const u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
  let x = x1 + u * px,
    y = y1 + u * py;
  return new Victor(x, y);
}

function sqr(x) { return x * x; }
function dist2sqr(v, w) { return sqr(v.x - w.x) + sqr( (v.y - w.y)/0.707106781); }
function dist2(v, w) { return Math.sqrt(dist2sqr(v, w)); }
function distToSegmentSqr(p, v, w) {
  const l2 = dist2sqr(v, w);
  if (l2 === 0) return dist2sqr(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2sqr(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSqr(p, v, w));
}

const getContactPosition = function (bfrom, bto, tpos, ballD) {
  const p = projectPoint(bfrom, bto, tpos);
  const tdist = dist2(p, tpos);
  if (tdist > ballD) return null;
  const dfrom = dist2(tpos, bfrom);
  const dto = dist2(tpos, bto);
  // if (dfrom < dto) return null;
  if (dfrom < ballD) return null; // already contact?
  const pshift = Math.sqrt(ballD * ballD - tdist * tdist);
  const pdist = dist2(p, bfrom) - pshift;
  const b1len = dist2(bfrom, bto);
  const ratio = pdist / b1len;
  if (ratio > 1) return null;
  const cp = new Victor(
        bfrom.x + ratio * (bto.x - bfrom.x),
        bfrom.y + ratio * (bto.y - bfrom.y)
    );
  cp.distFrom = pdist;
  return cp;
};


const VictorString = `

function Victor(t,i){if(!(this instanceof Victor))return new Victor(t,i);this.x=t||0,this.y=i||0}function random(t,i){return Math.floor(Math.random()*(i-t+1)+t)}function radian2degrees(t){return t*degrees}function degrees2radian(t){return t/degrees}Victor.fromArray=function(t){return new Victor(t[0]||0,t[1]||0)},Victor.fromObject=function(t){return new Victor(t.x||0,t.y||0)},Victor.prototype.addX=function(t){return this.x+=t.x,this},Victor.prototype.addY=function(t){return this.y+=t.y,this},Victor.prototype.add=function(t){return this.x+=t.x,this.y+=t.y,this},Victor.prototype.addScalar=function(t){return this.x+=t,this.y+=t,this},Victor.prototype.addScalarX=function(t){return this.x+=t,this},Victor.prototype.addScalarY=function(t){return this.y+=t,this},Victor.prototype.subtractX=function(t){return this.x-=t.x,this},Victor.prototype.subtractY=function(t){return this.y-=t.y,this},Victor.prototype.subtract=function(t){return this.x-=t.x,this.y-=t.y,this},Victor.prototype.subtractScalar=function(t){return this.x-=t,this.y-=t,this},Victor.prototype.subtractScalarX=function(t){return this.x-=t,this},Victor.prototype.subtractScalarY=function(t){return this.y-=t,this},Victor.prototype.divideX=function(t){return this.x/=t.x,this},Victor.prototype.divideY=function(t){return this.y/=t.y,this},Victor.prototype.divide=function(t){return this.x/=t.x,this.y/=t.y,this},Victor.prototype.divideScalar=function(t){return 0!==t?(this.x/=t,this.y/=t):(this.x=0,this.y=0),this},Victor.prototype.divideScalarX=function(t){return 0!==t?this.x/=t:this.x=0,this},Victor.prototype.divideScalarY=function(t){return 0!==t?this.y/=t:this.y=0,this},Victor.prototype.invertX=function(){return this.x*=-1,this},Victor.prototype.invertY=function(){return this.y*=-1,this},Victor.prototype.invert=function(){return this.invertX(),this.invertY(),this},Victor.prototype.multiplyX=function(t){return this.x*=t.x,this},Victor.prototype.multiplyY=function(t){return this.y*=t.y,this},Victor.prototype.multiply=function(t){return this.x*=t.x,this.y*=t.y,this},Victor.prototype.multiplyScalar=function(t){return this.x*=t,this.y*=t,this},Victor.prototype.multiplyScalarX=function(t){return this.x*=t,this},Victor.prototype.multiplyScalarY=function(t){return this.y*=t,this},Victor.prototype.normalize=function(){var t=this.length();return 0===t?(this.x=1,this.y=0):this.divide(Victor(t,t)),this},Victor.prototype.norm=Victor.prototype.normalize,Victor.prototype.limit=function(t,i){return Math.abs(this.x)>t&&(this.x*=i),Math.abs(this.y)>t&&(this.y*=i),this},Victor.prototype.randomize=function(t,i){return this.randomizeX(t,i),this.randomizeY(t,i),this},Victor.prototype.randomizeX=function(t,i){var r=Math.min(t.x,i.x),o=Math.max(t.x,i.x);return this.x=random(r,o),this},Victor.prototype.randomizeY=function(t,i){var r=Math.min(t.y,i.y),o=Math.max(t.y,i.y);return this.y=random(r,o),this},Victor.prototype.randomizeAny=function(t,i){return Math.round(Math.random())?this.randomizeX(t,i):this.randomizeY(t,i),this},Victor.prototype.unfloat=function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},Victor.prototype.toFixed=function(t){return void 0===t&&(t=8),this.x=this.x.toFixed(t),this.y=this.y.toFixed(t),this},Victor.prototype.mixX=function(t,i){return void 0===i&&(i=.5),this.x=(1-i)*this.x+i*t.x,this},Victor.prototype.mixY=function(t,i){return void 0===i&&(i=.5),this.y=(1-i)*this.y+i*t.y,this},Victor.prototype.mix=function(t,i){return this.mixX(t,i),this.mixY(t,i),this},Victor.prototype.clone=function(){return new Victor(this.x,this.y)},Victor.prototype.copyX=function(t){return this.x=t.x,this},Victor.prototype.copyY=function(t){return this.y=t.y,this},Victor.prototype.copy=function(t){return this.copyX(t),this.copyY(t),this},Victor.prototype.zero=function(){return this.x=this.y=0,this},Victor.prototype.dot=function(t){return this.x*t.x+this.y*t.y},Victor.prototype.cross=function(t){return this.x*t.y-this.y*t.x},Victor.prototype.projectOnto=function(t){var i=(this.x*t.x+this.y*t.y)/(t.x*t.x+t.y*t.y);return this.x=i*t.x,this.y=i*t.y,this},Victor.prototype.horizontalAngle=function(){return Math.atan2(this.y,this.x)},Victor.prototype.horizontalAngleDeg=function(){return radian2degrees(this.horizontalAngle())},Victor.prototype.verticalAngle=function(){return Math.atan2(this.x,this.y)},Victor.prototype.verticalAngleDeg=function(){return radian2degrees(this.verticalAngle())},Victor.prototype.angle=Victor.prototype.horizontalAngle,Victor.prototype.angleDeg=Victor.prototype.horizontalAngleDeg,Victor.prototype.direction=Victor.prototype.horizontalAngle,Victor.prototype.rotate=function(t){var i=this.x*Math.cos(t)-this.y*Math.sin(t),r=this.x*Math.sin(t)+this.y*Math.cos(t);return this.x=i,this.y=r,this},Victor.prototype.rotateDeg=function(t){return t=degrees2radian(t),this.rotate(t)},Victor.prototype.rotateTo=function(t){return this.rotate(t-this.angle())},Victor.prototype.rotateToDeg=function(t){return t=degrees2radian(t),this.rotateTo(t)},Victor.prototype.rotateBy=function(t){var i=this.angle()+t;return this.rotate(i)},Victor.prototype.rotateByDeg=function(t){return t=degrees2radian(t),this.rotateBy(t)},Victor.prototype.distanceX=function(t){return this.x-t.x},Victor.prototype.absDistanceX=function(t){return Math.abs(this.distanceX(t))},Victor.prototype.distanceY=function(t){return this.y-t.y},Victor.prototype.absDistanceY=function(t){return Math.abs(this.distanceY(t))},Victor.prototype.distance=function(t){return Math.sqrt(this.distanceSq(t))},Victor.prototype.distanceSq=function(t){var i=this.distanceX(t),r=this.distanceY(t);return i*i+r*r},Victor.prototype.length=function(){return Math.sqrt(this.lengthSq())},Victor.prototype.lengthSq=function(){return this.x*this.x+this.y*this.y},Victor.prototype.magnitude=Victor.prototype.length,Victor.prototype.isZero=function(){return 0===this.x&&0===this.y},Victor.prototype.isEqualTo=function(t){return this.x===t.x&&this.y===t.y},Victor.prototype.toString=function(){return"x:"+this.x+", y:"+this.y},Victor.prototype.toArray=function(){return[this.x,this.y]},Victor.prototype.toObject=function(){return{x:this.x,y:this.y}};var degrees=180/Math.PI;

`;

const AstarString = `

function pathTo(node){
  var curr = node,
    path = [];
  while(curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }
  return path;
}

function getHeap() {
  return new BinaryHeap(function(node) {
    return node.f;
  });
}

const astar = {
  /**
  * Perform an A* Search on a graph given a start and end node.
  * @param {Graph} graph
  * @param {GridNode} start
  * @param {GridNode} end
  * @param {Object} [options]
  * @param {bool} [options.closest] Specifies whether to return the
             path to the closest node if the target is unreachable.
  * @param {Function} [options.heuristic] Heuristic function (see
  *          astar.heuristics).
  */
  search: (graph, start, end, options) => {
    if (!graph || !start || !end) return [];
    graph.cleanDirty();
    options = options || {};
    var heuristic = options.heuristic || astar.heuristics.manhattan,
        closest = options.closest || false;

    var openHeap = getHeap(),
        closestNode = start; // set the start node to be the closest if required

    start.h = heuristic(start, end);

    openHeap.push(start);

    while(openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if(currentNode === end) {
        return pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node.
      var neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        var neighbor = neighbors[i];
        if(!neighbor) continue;

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        var gScore = currentNode.g + neighbor.getCost(currentNode),
          beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {

          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          graph.markDirty(neighbor);
          if (closest) {
            // If the neighbour is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          }
          else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode);
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  },
  // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
  heuristics: {
    manhattan: function(pos0, pos1) {
      if (!pos0 || !pos1) return 1000000;
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    },
    diagonal: function(pos0, pos1) {
      if (!pos0 || !pos1) return 1000000;
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
  },
  cleanNode: (node) => {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  }
};

/**
* A graph memory structure
* @param {Array} gridIn 2D array of input weights
* @param {Object} [options]
* @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
*/
class Graph{

  constructor(gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
      this.grid[x] = [];

      for (var y = 0, row = gridIn[x]; y < row.length; y++) {
        var node = new GridNode(x, y, row[y]);
        this.grid[x][y] = node;
        this.nodes.push(node);
      }
    }
    this.init();
  }

  init() {
    this.dirtyNodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
      astar.cleanNode(this.nodes[i]);
    }
  };

  cleanDirty() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
      astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
  };

  markDirty(node) {
    this.dirtyNodes.push(node);
  };

  neighbors(node) {
    var ret = [],
      x = node.x,
      y = node.y,
      grid = this.grid;

    // West
    if(grid[x-1] && grid[x-1][y]) {
      ret.push(grid[x-1][y]);
    }

    // East
    if(grid[x+1] && grid[x+1][y]) {
      ret.push(grid[x+1][y]);
    }

    // South
    if(grid[x] && grid[x][y-1]) {
      ret.push(grid[x][y-1]);
    }

    // North
    if(grid[x] && grid[x][y+1]) {
      ret.push(grid[x][y+1]);
    }

    if (this.diagonal) {
      // Southwest
      if(grid[x-1] && grid[x-1][y-1]) {
          ret.push(grid[x-1][y-1]);
      }

      // Southeast
      if(grid[x+1] && grid[x+1][y-1]) {
          ret.push(grid[x+1][y-1]);
      }

      // Northwest
      if(grid[x-1] && grid[x-1][y+1]) {
          ret.push(grid[x-1][y+1]);
      }

      // Northeast
      if(grid[x+1] && grid[x+1][y+1]) {
          ret.push(grid[x+1][y+1]);
      }
    }

    return ret;
  };

  toString() {
    var graphString = [],
        nodes = this.grid, // when using grid
        rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = [];
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(" "));
    }
    return graphString.join(" ");
  };
}

class GridNode {
  constructor(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  toString() {
    return "[" + this.x + " " + this.y + "]";
  };

  getCost(fromNeighbor) {
    // Take diagonal weight into consideration.
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
        return this.weight * 1.41421;
    }
    return this.weight;
  };

  isWall() {
    return this.weight === 0;
  };
}

class BinaryHeap {
  constructor(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push(element) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  }

  pop() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
    }
    return result;
  }

  remove(node) {
    var i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    var end = this.content.pop();

    if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
            this.sinkDown(i);
        }
        else {
            this.bubbleUp(i);
        }
    }
  }

  size() {
    return this.content.length;
  }

  rescoreElement(node) {
    this.sinkDown(this.content.indexOf(node));
  }

  sinkDown(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];

    // When at 0, an element can not sink any further.
    while (n > 0) {

        // Compute the parent element's index, and fetch it.
        var parentN = ((n + 1) >> 1) - 1,
            parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
            this.content[parentN] = element;
            this.content[n] = parent;
            // Update 'n' to continue at the new position.
            n = parentN;
        }
        // Found a parent that is less, no need to sink any further.
        else {
            break;
        }
    }
  }

  bubbleUp(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) << 1,
            child1N = child2N - 1;
        // This is used to store the new position of the element, if any.
        var swap = null,
            child1Score;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
            // Look it up and compute its score.
            var child1 = this.content[child1N];
            child1Score = this.scoreFunction(child1);

            // If the score is less than our element's, we need to swap.
            if (child1Score < elemScore){
                swap = child1N;
            }
        }

        // Do the same checks for the other child.
        if (child2N < length) {
            var child2 = this.content[child2N],
                child2Score = this.scoreFunction(child2);
            if (child2Score < (swap === null ? elemScore : child1Score)) {
                swap = child2N;
            }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
        // Otherwise, we are done.
        else {
            break;
        }
    }
  }
}


`;

// verify we are really normal:
// var cnt = 0;
// for(var cc=0; cc< 10000; cc++) {
//     if ( Math.abs(rnd2()) <= 2 )
//         cnt ++;
// }
// console.log(cnt);

const NORM_PROB = {};
NORM_PROB[128] = 0; // at x = 0 (no skew), cum prob is 0.5
NORM_PROB[129] = 0.0097916731613;
NORM_PROB[130] = 0.0195842852301;
NORM_PROB[131] = 0.0293787757442;
NORM_PROB[132] = 0.0391760855031;
NORM_PROB[133] = 0.0489771572021;
NORM_PROB[134] = 0.0587829360689;
NORM_PROB[135] = 0.0685943705051;
NORM_PROB[136] = 0.0784124127331;
NORM_PROB[137] = 0.0882380194499;
NORM_PROB[138] = 0.0980721524887;
NORM_PROB[139] = 0.1079157794892;
NORM_PROB[140] = 0.1177698745791;
NORM_PROB[141] = 0.1276354190663;
NORM_PROB[142] = 0.1375134021443;
NORM_PROB[143] = 0.1474048216124;
NORM_PROB[144] = 0.1573106846102;
NORM_PROB[145] = 0.1672320083709;
NORM_PROB[146] = 0.1771698209917;
NORM_PROB[147] = 0.1871251622257;
NORM_PROB[148] = 0.1970990842943;
NORM_PROB[149] = 0.2070926527244;
NORM_PROB[150] = 0.2171069472101;
NORM_PROB[151] = 0.2271430625027;
NORM_PROB[152] = 0.2372021093288;
NORM_PROB[153] = 0.2472852153408;
NORM_PROB[154] = 0.2573935261009;
NORM_PROB[155] = 0.2675282061011;
NORM_PROB[156] = 0.2776904398216;
NORM_PROB[157] = 0.287881432831;
NORM_PROB[158] = 0.2981024129305;
NORM_PROB[159] = 0.3083546313448;
NORM_PROB[160] = 0.3186393639644;
NORM_PROB[161] = 0.3289579126405;
NORM_PROB[162] = 0.3393116065388;
NORM_PROB[163] = 0.3497018035539;
NORM_PROB[164] = 0.3601298917896;
NORM_PROB[165] = 0.3705972911096;
NORM_PROB[166] = 0.3811054547636;
NORM_PROB[167] = 0.3916558710926;
NORM_PROB[168] = 0.4022500653217;
NORM_PROB[169] = 0.4128896014437;
NORM_PROB[170] = 0.4235760842012;
NORM_PROB[171] = 0.4343111611752;
NORM_PROB[172] = 0.4450965249855;
NORM_PROB[173] = 0.4559339156131;
NORM_PROB[174] = 0.4668251228526;
NORM_PROB[175] = 0.4777719889039;
NORM_PROB[176] = 0.4887764111147;
NORM_PROB[177] = 0.4998403448837;
NORM_PROB[178] = 0.5109658067382;
NORM_PROB[179] = 0.522154877598;
NORM_PROB[180] = 0.5334097062413;
NORM_PROB[181] = 0.5447325129882;
NORM_PROB[182] = 0.5561255936187;
NORM_PROB[183] = 0.5675913235446;
NORM_PROB[184] = 0.5791321622556;
NORM_PROB[185] = 0.5907506580628;
NORM_PROB[186] = 0.6024494531644;
NORM_PROB[187] = 0.6142312890602;
NORM_PROB[188] = 0.6260990123464;
NORM_PROB[189] = 0.6380555809225;
NORM_PROB[190] = 0.650104070648;
NORM_PROB[191] = 0.6622476824884;
NORM_PROB[192] = 0.6744897501961;
NORM_PROB[193] = 0.6868337485747;
NORM_PROB[194] = 0.6992833023832;
NORM_PROB[195] = 0.7118421959394;
NORM_PROB[196] = 0.7245143834924;
NORM_PROB[197] = 0.7373040004387;
NORM_PROB[198] = 0.7502153754679;
NORM_PROB[199] = 0.7632530437326;
NORM_PROB[200] = 0.7764217611479;
NORM_PROB[201] = 0.7897265199433;
NORM_PROB[202] = 0.8031725655979;
NORM_PROB[203] = 0.8167654153151;
NORM_PROB[204] = 0.8305108782054;
NORM_PROB[205] = 0.8444150773753;
NORM_PROB[206] = 0.8584844741418;
NORM_PROB[207] = 0.872725894627;
NORM_PROB[208] = 0.8871465590189;
NORM_PROB[209] = 0.9017541138301;
NORM_PROB[210] = 0.9165566675331;
NORM_PROB[211] = 0.9315628300071;
NORM_PROB[212] = 0.946781756301;
NORM_PROB[213] = 0.9622231952954;
NORM_PROB[214] = 0.9778975439405;
NORM_PROB[215] = 0.9938159078609;
NORM_PROB[216] = 1.0099901692496;
NORM_PROB[217] = 1.0264330631379;
NORM_PROB[218] = 1.0431582633185;
NORM_PROB[219] = 1.0601804794354;
NORM_PROB[220] = 1.0775155670403;
NORM_PROB[221] = 1.0951806527614;
NORM_PROB[222] = 1.1131942771609;
NORM_PROB[223] = 1.1315765583862;
NORM_PROB[224] = 1.150349380376;
NORM_PROB[225] = 1.1695366102071;
NORM_PROB[226] = 1.1891643501993;
NORM_PROB[227] = 1.2092612317092;
NORM_PROB[228] = 1.2298587592166;
NORM_PROB[229] = 1.2509917154626;
NORM_PROB[230] = 1.2726986411905;
NORM_PROB[231] = 1.2950224067058;
NORM_PROB[232] = 1.3180108973035;
NORM_PROB[233] = 1.3417178410803;
NORM_PROB[234] = 1.3662038163721;
NORM_PROB[235] = 1.3915374879959;
NORM_PROB[236] = 1.4177971379963;
NORM_PROB[237] = 1.4450725798181;
NORM_PROB[238] = 1.4734675779471;
NORM_PROB[239] = 1.5031029431293;
NORM_PROB[240] = 1.5341205443526;
NORM_PROB[241] = 1.5666885860684;
NORM_PROB[242] = 1.6010086648861;
NORM_PROB[243] = 1.6373253827681;
NORM_PROB[244] = 1.6759397227734;
NORM_PROB[245] = 1.7172281175057;
NORM_PROB[246] = 1.7616704103631;
NORM_PROB[247] = 1.8098922384806;
NORM_PROB[248] = 1.8627318674217;
NORM_PROB[249] = 1.9213507742937;
NORM_PROB[250] = 1.9874278859299;
NORM_PROB[251] = 2.0635278983162;
NORM_PROB[252] = 2.1538746940615;
NORM_PROB[253] = 2.2662268092097;
NORM_PROB[254] = 2.4175590162365;
NORM_PROB[255] = 2.6600674686175;


const containsObject = function (obj, list) {
  let i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === obj) {
      return true;
    }
  }

  return false;
};
// var dist = function(v1, v2) {
// return Math.sqrt( (v1.x-v2.x) * (v1.x-v2.x) + (v1.y-v2.y) * (v1.y-v2.y));
// };


// A is line start, B is line end, C is point, return C's projection on line A -> B
function projectPoint(A, B, C) {
  let x1 = A.x,
    y1 = A.y,
    x2 = B.x,
    y2 = B.y,
    x3 = C.x,
    y3 = C.y;
  let px = x2 - x1,
    py = y2 - y1,
    dAB = px * px + py * py;
  const u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
  let x = x1 + u * px,
    y = y1 + u * py;
  return new Victor(x, y);
}

function sqr(x) { return x * x; }
function dist2sqr(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
function dist2(v, w) { return Math.sqrt(dist2sqr(v, w)); }
function distToSegmentSqr(p, v, w) {
  const l2 = dist2sqr(v, w);
  if (l2 === 0) return dist2sqr(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2sqr(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSqr(p, v, w));
}

function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
  // if the lines intersect, the result contains the x and y of the intersection
  // (treating the lines as infinite) and booleans for whether line segment 1 or
  // line segment 2 contain the point
  let a, b;
  const result = {
    x: null,
    y: null,
    onLine1: false,
    onLine2: false,
    exactLine1: false
  };
  const denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
  if (denominator === 0) {
    return result;
  }
  a = line1StartY - line2StartY;
  b = line1StartX - line2StartX;
  const numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
  const numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
  a = numerator1 / denominator;
  b = numerator2 / denominator;
  // if we cast these lines infinitely in both directions, they intersect here:
  result.x = line1StartX + (a * (line1EndX - line1StartX));
  result.y = line1StartY + (a * (line1EndY - line1StartY));
  /*
  // it is worth noting that this should be the same as:
  x = line2StartX + (b * (line2EndX - line2StartX));
  y = line2StartX + (b * (line2EndY - line2StartY));
  */
  // if line1 is a segment and line2 is infinite, they intersect if:
  if (a > -0.0000001 && a < 1.0000001) {
    result.onLine1 = true;
  }
  // if line2 is a segment and line1 is infinite, they intersect if:
  if (b > -0.0000001 && b < 1.0000001) {
    result.onLine2 = true;
  }
  if (Math.abs(a) <= 0.0000001 || Math.abs(a - 1) <= 0.0000001) {
    result.exactLine1 = true;
  }
  // if line1 and line2 are segments, they intersect if both of the above are true
  return result;
}

// if ball1 is moving from bfrom to bto, would it touch the ball2 at tpos?
// if yes, return the position of ball1 when it contacts ball2;
// if no,  return null;

// var getContactPosition = function(bfrom, bto, tpos, ballD) {
//     var b2Dist = distToSegment(tpos, bfrom, bto);
//     if ( b2Dist > ballD) {
//         return null;
//     }
//     return getContactPositionSafe(bfrom, bto, tpos, ballD);
// };



// }





let pcanvas, pctx, pimgData;


const CBuffer = require('CBuffer');

const NUMPRECISION = 3;

const DODEBUG = false;

const MAX_BALL_COUNT = 20;

const cycleTime = 1000 / 60;


function median(values) {
  if (values.length === 0) return 0;
  values.sort();
  const half = Math.floor(values.length / 2);
  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

// window.performance = window.performance || {};
const getMS = () => {
  // return Date.now();

  if (window.performance) {
    if (performance.now) return performance.now();
    if (performance.mozNow) return performance.mozNow();
    if (performance.msNow) return performance.msNow();
    if (performance.oNow) return performance.oNow();
    if (performance.webkitNow) return performance.webkitNow();
  }
  return Date.now();
  // const performance = window.performance || {};
  // return performance.now       ||
  //     performance.mozNow    ||
  //     performance.msNow     ||
  //     performance.oNow      ||
  //     performance.webkitNow ||
  //     Date.now  /*none found - fallback to browser default */
};

const shuffle = function (array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};


// function Player(GameEngine, playerInfo) {
//   const gameSetup = GameEngine.gameSetup;
//   this.isLocal = playerInfo.playerID == gameSetup.localPlayerID;
//   this.playerType = playerInfo.playerType;
//   this.pinfo = playerInfo;

//   this.hasToken = false;
//   // used by others to give token to me
//   this.receiveToken = () => {
//     this.hasToken = true;
//   };
//   this.loseToken = () => {
//     this.hasToken = false;
//   };

//   this.setOpponentPlayer = (p) => {
//     this.opponent = p;
//   };


// };



// if all players are local as in a practice or a testing game, then don't need to add lag or use p2p
function NetworkHandler(GameEngine, allLocal, selectedPeerName, asHost) {
  const gameSetup = GameEngine.gameSetup;
  // for now assume just one peer

  if (gameSetup.isHost) {
    this.mapSent = false;
  }
  if (!allLocal) {
    // console.log("NetworkHandler not all local!!");
    // if (asHost) {
    //   for (let i = 0; i < gameSetup.peers.length; i++) {
    //     const el = gameSetup.peers[i];
    //     if (el.peerName === selectedPeerName) {
    //       gameSetup.peers[i].peer.peerLag = 0;
    //       gameSetup.peers[i].peer.peerLags = [];
    //       break;
    //     }
    //   }
    //   // const p = gameSetup.peers[0];
    //   // p.peerLag = 0;
    //   // p.peerLags = [];
    // } else {
    //   // gameSetup.peerLag = 0;
    //   // gameSetup.peerLags = [];
    //   // const p = gameSetup.allPeers[gameSetup.playerID];

    //   // const p = gameSetup.peers[0];
    //   // p.peerLag = 0;
    //   // p.peerLags = [];
    // }
    for (let i = 0; i < gameSetup.peers.length; i++) {
      const el = gameSetup.peers[i];
      if (el.peerName === selectedPeerName) {
        gameSetup.peers[i].peer.peerLag = 0;
        gameSetup.peers[i].peer.peerLags = [];
        break;
      }
    }
  }

  let lastLocalKeyDown = 0;
  let currentCommand = "";

  this.sendCommandToAll = function (cmd) {
    if (cmd.c != "UpdateTimer" && cmd.c != "KeepALive") {
      // console.log("new send command to all " + JSON.stringify(cmd));
    }

    if (!gameSetup.isLocal) {
      const numberOfPeers = gameSetup.peers.length;
      for (let i = 0; i < numberOfPeers; i++) {
        const peerObj = gameSetup.peers[i];
        const peer = peerObj.peer;
        if (!peerObj.ready || !peer || !peer._channel || peer._channel.readyState != "open") {
          console.log("peer not good so quit on command? " + cmd);
          const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
          gameSetup.peers[i].cmdHistory.push(cmdstr);
          continue;
        } else { // peer ready, send to all peers, including myself!
          this.sendCommandToPeerImmediately(cmd, peer);
          if (cmd.c != "UpdateTimer" && cmd.c != "KeepALive") {
            // console.log('after sendCommandToPeerImmediately', peer);
          }
        }
      }
      // no need to specify lag since we'll play out using timestamp??
      cmd.allData = `${cmd.c};${cmd.t};${cmd.w}`;
      this.executeCommandLocallyImmediately(cmd, 0);
      if (cmd.c != "UpdateTimer" && cmd.c != "KeepALive") {
        // console.log('after executeCommandLocallyImmediately');
      }
    }

    if (allLocal && gameSetup.gameType != GAME_TYPE.AUTORUN ) {
      // console.log("all local!!");
      this.executeCommandLocallyImmediately(cmd, 0);
      return;
    }

    const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    if (cmd.c != "UpdateTimer" && cmd.c != "KeepALive") {
      // Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
    } else {
      if (!gameSetup.lastLongUpdateTime) {
        gameSetup.lastLongUpdateTime = -1;
      }
      const timeNow = Date.now();
      if (timeNow - gameSetup.lastLongUpdateTime >= 4500) {
        // Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
        gameSetup.lastLongUpdateTime = timeNow;
      }
    }

    if (allLocal && gameSetup.gameType == GAME_TYPE.AUTORUN ) {
      // console.log("all local!!");
      this.executeCommandLocallyImmediately(cmd, 0);
      return;
    }
  };
  // not using now
  this.sendGameInitialized = function () {
    // const p = gameSetup.allPeers[gameSetup.playerID];
    const p = gameSetup.peers[0];
    p.dosend(`GAMEINIT;${Date.now()};${gameSetup.playerID}`);
  };
  // not using now
  this.sendReadyToHost = function () {
    // const p = gameSetup.allPeers[gameSetup.playerID];
    const p = gameSetup.peers[0];
    p.dosend(`PEERREADY;${Date.now()};${gameSetup.playerID}`);
  };

  // send car order from user input on remote client to host
  this.sendCOToHostImmediately = function (order) {
    const peerObj = gameSetup.peers.find(poj => poj.offer.startsWith('offer_0')); // ex: offer_0_1, offer_0_2
    const p = peerObj.peer;
    const cmdstr = `${order.c};${order.t};${order.w}`; // + ";"  + cmd.nt + ";" + cmd.nr + ";" + cmd.nc + ";"  + cmd.nnr + ";" + cmd.nnc;
    // if (DODEBUG) console.log("send order to peer at " + Date.now() + ": " + cmdstr);
    p.send(cmdstr);
  };


  // for pool game doesn't have to be host!
  this.sendCommandToPeerImmediately = function (cmd, peer) {
    // if (!gameSetup.isHost) {
    //   debugger;
    //   return;
    // }
    const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    // if (DODEBUG) console.log("sendCommandToPeer at " + Date.now() + ": " + cmdstr);

    const p = peer;
    if (p) {
      if (p._channel) {
        p.dosend(cmdstr);
      } else {
        //gameSetup.quitGameForConnectivityIssue();
        console.log("channel disconnected?? so wait!!");
        // gameSetup.enterReconnect();
      }
    }
    // for (let j = 0; j < gameSetup.playerCount; j++) {
    //   const p = gameSetup.allPeers[j];
    //   if (p)
    //     p.send(cmdstr);
    // }
  };

  this.sendMessageToPlayers = (cmd, data) => {
    gameSetup.controller.updateWorld();
    for (let k = 0; k < gameSetup.playerInfo.length; k++) {
      const pi = gameSetup.playerInfo[k];
      pi.isLocal = gameSetup.config.localPlayerID === pi.userId || gameSetup.config.localPlayerID === pi.playerCodeOwner;
      if (pi.playerType !== "AI" || !pi.playerWorker) continue;
      if (!pi.isLocal && !pi.localInput) continue;
      const { ID } = pi;
      if (!gameSetup.tankControllers[ID]) continue;
      if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[ID].inTestCase) continue;
      const { tank } = gameSetup.tankControllers[ID];
      if (!tank || tank.position.x < 0) continue;
      pi.playerWorker.sendMessage({
        cmd,
        world: WorldForPlayer,
        data
      });
    }
  };

  this.executeCommandLocallyImmediately = function (cmd, lag) {
    cmd.executed = false;

    if (cmd.c == "U" || cmd.c == "D" || cmd.c == "L" || cmd.c == "R" || cmd.c == "PU" || cmd.c == "PD" || cmd.c == "PL" || cmd.c == "PR" || cmd.c == "S" || cmd.c == "KillShell" || cmd.c == "HurtTank") {
      const p = cmd.w.split("_");
      if (gameSetup.tankControllers[Number(p[0])].tank.freeze
      && cmd.c !== "KillShell" && cmd.c !== "HurtTank") {
        return;
      }
      gameSetup.tankControllers[Number(p[0])].executeCommand(cmd);
    } else if (cmd.c === "TankGainCrystal") {
      const p = cmd.w.split("_");
      const c = gameSetup.crystals[Number(p[1])];
      if (gameSetup.gameType === TankGame.TESTING) {
        if (!("gainCrystalInOrder" in gameSetup)) gameSetup.gainCrystalInOrder = [];
        gameSetup.gainCrystalInOrder.push({ x: c.position.x, y: c.position.y, tankID: Number(p[0]) });
      }

      c.c = Math.round((c.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
      c.r = Math.round(c.y / gameSetup.config.TileSizeH - 1.5);
      this.sendMessageToPlayers(CMD_DIS_CRYSTAL, { c: c.c, r: c.r });

      c.position.x = -10000;
      if (Number(p[0]) >= 0 && gameSetup.tankControllers[Number(p[0])]) {
        gameSetup.tankControllers[Number(p[0])].addPowerPoint();
      }
    } else if (cmd.c == "TankGainWeapon") {
      const p = cmd.w.split("_");
      const w = gameSetup.weapons[Number(p[1])];
      if (gameSetup.gameType === TankGame.TESTING) {
        if (!("gainWeaponInOrder" in gameSetup)) gameSetup.gainWeaponInOrder = [];
        gameSetup.gainWeaponInOrder.push({ x: w.position.x, y: w.position.y, type: w.type });
      }

      w.c = Math.round((w.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
      w.r = Math.round(w.y / gameSetup.config.TileSizeH - 1.5);
      this.sendMessageToPlayers(CMD_DIS_WEAPON, { c: w.c, r: w.r });

      w.position.x = -10000;
      if (Number(p[0]) >= 0 && gameSetup.tankControllers[Number(p[0])]) {
        gameSetup.tankControllers[Number(p[0])].pickSpecialWeapon(w.type);
      }
      // gameSetup.tankControllers[Number(p[0])].add();
    } else if (cmd.c === CHANGE_WEAPON_ALPHA_CMD) {
      const p = cmd.w.split("_");
      const weaponID = p[0];
      const alpha = p[1];
      const w = gameSetup.weapons[weaponID];
      w.alpha = alpha;
    } else if (cmd.c === REMOVE_WEAPON_ALPHA_CMD) {
      const p = cmd.w.split("_");
      const weaponID = p[0];
      const w = gameSetup.weapons[weaponID];
      w.isUsed = true;
      w.alpha = 1;
      w.position.x = -10000;
    } else if (cmd.c === TANK_UPGRADE_SPECIAL_POWER_CMD) {
      const p = cmd.w.split("_");
      gameSetup.tankControllers[Number(p[0])].upgradeSpecialPower(p[1]);
    } else if (cmd.c == "NewWhiteTank") {
      const p = cmd.w.split("_");
      gameSetup.gameEngine.addOneTank("white", Number(p[1]), Number(p[2]), p[0]);
    } else if (cmd.c == "NewCrystal") {
      const p = cmd.w.split("_");
      gameSetup.gameEngine.addOneCrystalByXY(Number(p[0]), Number(p[1]), Number(p[2]));
      const x = Number(p[0]);
      const y = Number(p[1]);
      const c = Math.round((x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
      const r = Math.round(y / gameSetup.config.TileSizeH - 1.5);
      this.sendMessageToPlayers(CMD_NEW_CRYSTAL, { c, r });

    } else if (cmd.c === 'NewWeapon') {
      const p = cmd.w.split("_");
      gameSetup.gameEngine.addOneWeaponByXY(Number(p[0]), Number(p[1]), Number(p[2]), Number(p[3]));
      const x = Number(p[0]);
      const y = Number(p[1]);
      const type = Number(p[3]);
      const c = Math.round((x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
      const r = Math.round(y / gameSetup.config.TileSizeH - 1.5);
      this.sendMessageToPlayers(CMD_NEW_WEAPON, { c, r, type });

    } else if (cmd.c == "RemoveTile") {
      gameSetup.tilesRemoved += cmd.w + ":";
      const p = cmd.w.split("_");
      const t = gameSetup.mazeTiles[p[0]][p[1]];
      if (t) {
        t.parent.removeChild(t);
        delete gameSetup.mazeTiles[p[0]][p[1]];
        delete gameSetup.maze[p[0]][p[1]];
      }
      const effect = p[2];
      if (effect === 'EXPLODE') {
        const tankID = p[3];
        const x = p[4];
        const y = p[5];
        gameSetup.tankControllers[tankID].playExplosion(x, y);
      }
    } else if (cmd.c == "InitMaze") {
      console.log('in cmd InitMaze');
      if (!gameSetup.isHost) {
        console.log("guest received InitMaze " + cmd.w);
        const parts = cmd.w.split(":");
        gameSetup.maze = [];
        gameSetup.tilemap = cmd.w;
        for (let r = 0; r <= gameSetup.config.TileRows - 1; r++) {
          const row = {};
          gameSetup.maze.push(row);
        }
        for (let k=0; k<parts.length; k++) {
          if (parts[k].length > 0) {
            const p = parts[k].split("_");
            gameSetup.maze[p[1]][p[2]] = p[0];
          }
        }
      }
      GameEngine.setupUsingMaze();
      if (gameSetup.setupTbotMessage) {
        gameSetup.setupTbotMessage();
      }
    } else if (cmd.c == "AddTank") {
      const p = cmd.w.split("_");
      GameEngine.addOneTank(p[0], Number(p[1]), Number(p[2]), Number(p[3]));
      if (gameSetup.tankControllers.length == gameSetup.numberOfPlayers) {
        if (!gameSetup.isHost) {
          gameSetup.networkHandler.sendCOToHostImmediately({
            c: "MazeReady", t: gameSetup.currentCycleTime, w: gameSetup.localPlayerID
          });
        } else {
          gameSetup.mazeReady[0] = true; // host ready
          const allMazeReady = gameSetup.mazeReady.findIndex(r => !r) === -1;
          if (allMazeReady) {
            gameSetup.networkHandler.sendCommandToAll({
              c: "StartGame", t: gameSetup.currentCycleTime, w: gameSetup.tilemap
            });
          }
        }
      }
    } else if (cmd.c == "MazeReady") {
      // must be host to receive this
      gameSetup.mazeReady[cmd.w] = true;
      const allMazeReady = gameSetup.mazeReady.findIndex(r => !r) === -1;
      console.log('allMazeReady', allMazeReady);
      if (allMazeReady) {
        setTimeout(() => {
          gameSetup.networkHandler.sendCommandToAll({
            c: "StartGame", t: gameSetup.currentCycleTime, w: gameSetup.tilemap
          });
        }, 500);
      }
    } else if (cmd.c == "StartGame") {
      console.log("----------- * * STARTING GAME * * -----------");
      gameSetup.gameStarted = true;
    } else if (cmd.c == "ResumeGame") {
      setTimeout(() => {
        // console.log("execute NewActivePlayerInfo " + cmd.w + " " + cmd.t);
        gameSetup.controller.doResumeGame(cmd.allData);
      }, 300);
    } else if (cmd.c == "QuitGameRoomWithIssue") {
      console.log("QuitGameRoomWithIssue received!");
      gameSetup.showModalMessage(`Game Terminated`, cmd.w, MODAL_NOBUTTON);
      let waitS = 6000;
      setTimeout(() => {
        if (gameSetup && gameSetup.exitGame)
          gameSetup.exitGame();
      }, waitS);
    } else if (cmd.c == "ExitGameRoom") {
      console.log("ExitGameRoom received from " + cmd.w);
      gameSetup.sounds.backgroundmusic.stop();
      let waitS = 3000;

      if (gameSetup.playerInfo[cmd.w] && Meteor.userId() !== gameSetup.playerInfo[cmd.w].userId) {
        waitS = 5000;
      }
      if (gameSetup.gameType == GAME_TYPE.PRACTICE) {
        waitS = 2000;
      }
      if (gameSetup.isLocal) {
        gameSetup.showModalMessage(`Exiting Game Room`, `You have chosen to exit game.`, MODAL_NOBUTTON);
        setTimeout(() => {
          if (gameSetup && gameSetup.exitGame) {
            gameSetup.exitGame();
          }
        }, waitS);
      } else if (gameSetup.playerInfo[cmd.w].playerID === gameSetup.config.localPlayerID) {
        gameSetup.config.sendMessageAll(`Player ${cmd.w} ${gameSetup.playerInfo[cmd.w].username} has exited game.`, waitS);
        setTimeout(() => {
          if (gameSetup && gameSetup.exitGame) {
            gameSetup.exitGame();
          }
        }, waitS);
      };
    } else if (cmd.c == "RestartGame") {
      // debugger;
      gameSetup.gameOver = false;
      gameSetup.activePlayerInfo = null;
      gameSetup.waitingplayerInfo = null;
      gameSetup.controller.inStrike = false;
      gameSetup.hideModalMessage();
      gameSetup.allStopHandled = false;
      gameSetup.hostAllStopped = false;
      gameSetup.controller.gameState = WAIT_FOR_BREAK_STATE;
      GameEngine.clearForecastLines();
      // gameSetup.controller.ResetTable(false);

      gameSetup.firstBallTouchedByCueball = null;
      gameSetup.firstCushionTouchedByBall = null;
      gameSetup.someBallTouchedRailedAfter = false;
      gameSetup.ballsTouchedRails = [];
      gameSetup.newlyPocketedBalls = [];
      gameSetup.firstBallMark.position.x = 10000;
      gameSetup.firstBallMark.position.y = 10000;
      gameSetup.targetBallMark.position.x = 10000;
      gameSetup.targetPocketMark.position.x = 10000;

      if (gameSetup.difficulty == BEGINNER) {
        for (let i = 0; i < gameSetup.numberOfPlayers; i++) {
          gameSetup.playerInfo[i].secondsLeft = 20;
          gameSetup.playerInfo[i].c.clockTimeStr = "10:00";
        }
      } else {
        for (let i = 0; i < gameSetup.numberOfPlayers; i++) {
          gameSetup.playerInfo[i].secondsLeft = 1200;
          gameSetup.playerInfo[i].c.clockTimeStr = "20:00";
        }
      }

      for (let i = 0; i < gameSetup.numberOfPlayers; i++) {
        gameSetup.playerInfo[i].c.updateTimer(gameSetup.playerInfo[i].secondsLeft);

        gameSetup.playerInfo[i].c.showNameTag(Pool.WHITE);
        gameSetup.playerInfo[i].chosenColor = null;
      }
    } else if (cmd.c == "UpdateTimer") {
      const p = cmd.w.split("_");
      if (gameSetup.updateTimer) gameSetup.updateTimer(Number(p[0]));
    } else if (cmd.c == "ShowMessage") {
      if (gameSetup.config && gameSetup.config.showMessage) gameSetup.config.showMessage(cmd.w);
    } else if (cmd.c == "COUNTDOWN") {
      GameEngine.showCountDown(cmd.w);
    } else if (cmd.c == "KeepALive") {

    } else if (cmd.c === 'WINNER') {
      GameEngine.showGameOver(cmd);

    } else if (cmd.c === 'EndGameMode') {
      let minColumn = 1;
      let minRow = 1;
      let maxColumn = gameSetup.config.TileCols - 2;
      let maxRow = gameSetup.config.TileRows - 2;
      let x = 1;
      let y = 1;
      const direct = { x: 1, y: 0 };
      let prevCycleInd = gameSetup.currentCycleInd - 1;
      gameSetup.addTileInterval = setInterval(() => {
        if (gameSetup.paused) {
          return;
        }
        if (prevCycleInd < gameSetup.currentCycleInd) {
          prevCycleInd = gameSetup.currentCycleInd;
        } else {
          // game is not updating so don't do anything
          return;
        }
        if (minRow > maxRow || minColumn > maxColumn || gameSetup.gameOver) {
          clearInterval(gameSetup.addTileInterval);
          return;
        }
        gameSetup.gameEngine.addEndGameRock(y, x);
        const newX = x + direct.x;
        const newY = y + direct.y;
        if (newX > maxColumn) {
          minRow += 1;
          direct.x = 0;
          direct.y = 1;
        } else if (newY > maxRow) {
          maxColumn -= 1
          direct.x = -1;
          direct.y = 0;
        } else if (newX < minColumn) {
          maxRow -= 1;
          direct.x = 0;
          direct.y = -1;
        } else if (newY < minRow) {
          minColumn += 1;
          direct.x = 1;
          direct.y = 0;
        }
        x += direct.x;
        y += direct.y;
      }, 1000);
    } else if (cmd.c === "FIREMISSILE") {
      const p = cmd.w.split("_");
      const type = p[1];
      const tankController = gameSetup.tankControllers[p[0]];
      const t = tankController.tank;
      const { row, col } = tankController.calculateShellRowCol(t);
      let r = row - 1, c = col;
      const dir = t.state.replace("P", "");
      if (dir == "U") {
        r = r - 2;
      } else if (dir == "D") {
        r = r + 2
      } else if (dir == "L") {
        c = c - 2;
      } else {
        c = c + 2;
      }

      const startPosition = {
        r,c
      }
      _.forEach(gameSetup.tanks, (tank) => {
        if (tank.isDead || tank.color === t.color || tank.color === "white") {
          return;
        }

        const { row: targetRow, col: targetCol } = tankController.calculateShellRowCol(tank);
        const endPosition = {
          r: targetRow - 1,
          c: targetCol
        }
        const theShortestPath = tankController.getBestDir(startPosition, endPosition, dir);
        theShortestPath.unshift(dir, dir)

        console.log("theShortestPath", theShortestPath)

        // let dirOf = theShortestPath[0] ? theShortestPath[0] : dir;
        const shellID = tankController.findDeadShell(dir, type);
        if (!t.missilePath) {
          t.missilePath = [];
        }

        let missilePathID = -1;

        _.forEach(t.missilePath, (item, key) => {
          if (item.isCompleted) {
            t.missilePath[key] = {
              path: theShortestPath,
              isCompleted: false,
            }
            missilePathID = key;
            return false;
          }
        })

        if (missilePathID == -1) {
          t.missilePath.push({
            path: theShortestPath,
            isCompleted: false
          })
          missilePathID = t.missilePath.length - 1;
        }
        let w = `${t.tankID}_${t.position._x}_${t.position._y}_${dir}_${shellID}_${type}_${missilePathID}`;
        gameSetup.networkHandler.sendCommandToAll({
          c: "S", t: gameSetup.currentCycleTime, w: w
        });
      });
    } else {
      console.log("executeCommandLocallyImmediately executeCommand " + JSON.stringify(cmd));
      // debugger;
      // gameSetup.allObjects[cmd.w].controller.executeCommand(cmd);
    }
  };

  // let echoCount = 0;
  // dispatch data to the approprirate controller!
  this.handleWTCData = function (data, peerObj) {
    // if (data.indexOf("KeepALive") < 0 && data.indexOf("UpdateTimer") < 0)
    //   console.log(" handle new wtc data " + data);
    const peer = peerObj.peer;
    const cmdHistory = peerObj.cmdHistory
    if (data.indexOf('LASTGOODCOMMAND') < 0) {
      gameSetup.cmdReceiveHistory.push(data);
      gameSetup.cmdReceiveHistoryT.push(Date.now());
    }
    const p = data.split(";");
    const cmd = {
      c: p[0], t: Number(p[1]), w: p[2]
    };
    if (p[3]) {
      cmd.param = p[3];
    }
    cmd.allData = data;

    if (cmd.c == "LASTGOODCOMMAND") {
      // this is the list of timestamps for all commands received by opponent

      if (cmd.w == "-1") {
        for (let j=0; j <=cmdHistory.length-1; j++) {
          console.log("* * **       * resending past command " + j + " " + cmdHistory[j]);
          peer.send(cmdHistory[j]);
        }
      } else {
        const allTimeStamps = cmd.w.split("|");

        // find all timestamp missing in allTimeStamps and resend it
        for (let k=cmdHistory.length-1; k >= 0; k--) {
          const p2 = cmdHistory[k].split(';');
          if (cmdHistory[k].indexOf("UpdateTimer") >= 0) {
            continue;
          }
          if (cmdHistory[k].indexOf("KeepALive") >= 0) {
            continue;
          }
          let found = false;

          for (let x = 0; x < allTimeStamps.length; x++) {
            const c = allTimeStamps[x];
            // console.log("compare last good commmand " + lastStamp + " with " + k + " " + p2[1] + " " + gameSetup.cmdHistory[k]);
            if (p2[1] == c) {
              found = true;
              break;
            }
          }
          if (!found) {
            peer.send(cmdHistory[k]);
            console.log("* * **       * resending past command " + k + " " + cmdHistory[k]);
          }
        }
      }
      return;
    }

    if (!gameSetup.isHost) {
      this.executeCommandLocallyImmediately(cmd, 0); // if not host, add command to queue with no lag for run at next cycle
    } else {
      if (cmd.c == "GAMEINIT") {
        debugger;
        // const thepeer = gameSetup.allPeers[cmd.w];
        // console.log(`received gameinit for peer ${cmd.w}`);
        // thepeer.gameInitialized = true;

        // gameSetup.allInitialized = gameSetup.hostInitialized;
        // gameSetup.allInitialized = false;
        // if (typeof(gameSetup.hostInitialized) !== "undefined") {
        //   gameSetup.allInitialized = true;
        //   for (let j = 1; j < gameSetup.playerCount; j++) {
        //     const p1 = gameSetup.allPeers[j];
        //     console.log(`checking peer init ${j} ${p1.gameInitialized}`);
        //     if (!p1.gameInitialized) {
        //       gameSetup.allInitialized = false;
        //       break;
        //     }
        //   }
        // }
        // console.log(`check 2 all init result: ${gameSetup.allInitialized}`);
      } else if (cmd.c == "ALLBALLSTOPPED") {
        //const thepeer = gameSetup.allPeers[cmd.w];
        const thepeer = peer;
        thepeer.allBallStopped = true;
        if (p[3]) {
          thepeer.posStr = p[3];
          thepeer.stopTime = new Date();
        }

        gameSetup.controller.checkIfAllPeerAllStopped();

      } else if (cmd.c == "PEERREADY") {
        debugger;
        // const thepeer = gameSetup.allPeers[cmd.w];
        // // thepeer.gameReady = true;

        // thepeer.peerReady = true;

        // gameSetup.allPeersReady = true;
        // for (let j = 1; j < gameSetup.playerCount; j++) {
        //   const p1 = gameSetup.allPeers[j];
        //   if (!p1.peerReady) {
        //     gameSetup.allPeersReady = false;
        //     break;
        //   }
        // }
      } else {
        this.executeCommandLocallyImmediately(cmd, 0);
      }
    }
  };
}


/*  each controller at host has 2 queues
    order queue:
    1. local input (keyboard or AI) is added to queue with lag
    2. remote input is added to order queue without lag
    3. orders are processed at each cycle if it has passed lag

    command queue:
    1. all cmd generated by controller at host is added to local command queue with lag
    2. all commands are executed at each cycle when it has passed lag


    each controller at nonhost has 1 command queue
    1. local inputs (keyboard or AI) are sent immediately to host
    2. command received from host are put in queue and executed on next cycles without any lag

*/


// inheriance: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance
function ObjectController(gameSetup, isHost) {

  this.commands = new CBuffer(100);
  this.isHost = isHost;
  this.nextID = 0;
}


ObjectController.prototype.addCommand = function (cmd) {
  this.commands.push(cmd);
};


ObjectController.prototype.executeCommand = function (cmd) {
  console.log("ObjectController: no implementation found for  " + JSON.stringify(cmd));
  debugger;
};



function ShotController(gameSetup, isHost, GameEngine) {
  ObjectController.call(this, gameSetup, isHost);
  this.GameEngine = GameEngine;
}

ShotController.prototype = Object.create(ObjectController.prototype);
ShotController.prototype.constructor = ShotController;

ShotController.prototype.takeShot = () => {
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;
};




const SystemAI = function(gameSetup, tank) {
  this.gameSetup = gameSetup;
  this.tank = tank;
  this.isHost = gameSetup.isHost;
  this.tankID = tank.tankID;
  // console.log("new system ai for tank " + tank.ID);

  // initialize a target to go to
  // const tr = (tank.orighy - 30 ) / 60;
  // const tc = (tank.orighx - 30 ) / 60;
  // this.updateTankPatrolTarget(tr, tc);
};


SystemAI.prototype.getTankDir = function(t) {
  if (t.speedX == 0 && t.speedY == 0) {
    return t.state;
  } else {
    if (t.speedX > 0) return "R";
    if (t.speedX < 0) return "L";
    if (t.speedY > 0) return "D";
    if (t.speedY < 0) return "U";
  }
};

SystemAI.prototype.generateOrder = function() {
  const gameSetup = this.gameSetup;
  const wt = this.tank;
  if (wt.freeze) return;
  const actualDir = this.getTankDir(wt);
  // check if any tank is in shoot range
  const targetDirs = [];
  for (let k=0; k<gameSetup.tanks.length; k++) {
    const t = gameSetup.tanks[k];
    if (t.isDead) {
      continue;
    };
    if (t.color == "white") break;
    if (eq2(t.position._x, wt.position._x)) {
      if ( wt.position._y > t.position._y + 1 ) {
        targetDirs.push("U");
      }
      if ( wt.position._y < t.position._y - 1 ) {
        targetDirs.push("D");
      }
    } else if (eq2(t.position._y, wt.position._y)) {
      if ( wt.position._x > t.position._x + 1) {
        targetDirs.push("L");
      }
      if ( wt.position._x < t.position._x - 1) {
        targetDirs.push("R");
      }
    }
  }
  let targetDir = "";
  if (targetDirs.length > 0) {
    targetDir = targetDirs[Math.floor(Math.random() * targetDirs.length)];
  }

  let forbiddenDir = [];
  for (let k=0; k<gameSetup.tanks.length; k++) {
    const t = gameSetup.tanks[k];
    if (t.isDead) continue;
    if (t.color == "white") break;

    // make sure white tank doesn't go overlap red/blue tank

    const d = dist2(wt.position, t.position);
    if (d >= gameSetup.config.TileSizeW * 2.01) continue;

    if (eq2(t.position._x, wt.position._x)) {
      if ( wt.position._y > t.position._y + 1 ) {
        forbiddenDir.push("U");
      }
      if ( wt.position._y < t.position._y - 1) {
        forbiddenDir.push("D");
      }
    } else if (eq2(t.position._y, wt.position._y)) {
      if ( wt.position._x > t.position._x + 1) {
        forbiddenDir.push("L");
      }
      if ( wt.position._x < t.position._x - 1) {
        forbiddenDir.push("R");
      }
    }
  }

  if (forbiddenDir.length > 0) {
    // console.log("tank " + wt.tankID + " forbidden: " + JSON.stringify(forbiddenDir));
  }

  if (forbiddenDir.includes(actualDir)) {
    gameSetup.tankControllers[wt.tankID].interpretOrder("P");
    gameSetup.tankControllers[wt.tankID].interpretOrder("S");
    return;
  }


  // if already facing target tank, don't need to follow it!
  if (targetDir != "" && targetDir != actualDir && "P" + targetDir != actualDir && Math.random() > 0.8) { // if has target, when to shoot?
    gameSetup.tankControllers[wt.tankID].interpretOrder(targetDir);
    gameSetup.tankControllers[wt.tankID].interpretOrder("S");
    return;
  }


  if ( ( (targetDir == actualDir) || ("P" + targetDir == actualDir)) && Math.random() > 0 ) { // if has target, always shoot
    gameSetup.tankControllers[wt.tankID].interpretOrder("S");
    return;
  }


  // return;
  if (Math.random() > 0.1) return;
  // if (Math.random() > 0.99) {
  //   gameSetup.tankControllers[this.tank.tankID].interpretOrder("S");
  // }



  if (this.lastOrder && Math.random() > 0.1) {
    if (!forbiddenDir.includes(this.lastOrder)) {
      gameSetup.tankControllers[this.tank.tankID].interpretOrder(this.lastOrder); return;
    }
  }
  const r = Math.random();

  let newOrder = "L";
  if (r < 0.2) newOrder = "L";
  else if (r < 0.4) newOrder = "R";
  else if (r < 0.6) newOrder = "U";
  else if (r < 0.8) newOrder = "D";
  else newOrder = "P";

  if (!forbiddenDir.includes(newOrder)) {
    gameSetup.tankControllers[this.tank.tankID].interpretOrder(newOrder);
    this.lastOrder = newOrder;
  }

};

SystemAI.prototype.shootShell = function() {
  const game = this.game;
  const cfg = game.config;
  const tank = game.allObjects[this.tankID];

  if (!tank) {
      // just died?
      return;
  }

  if (game.isFinalStage && !tank.isFixed) return;

  if (game.currentCycleTime < tank.lastShellTime + tank.shellInterval) {
      return;
  }


  // reduce calculation?
  if ( tank.x % 60 != 30 || tank.y % 60 != 30) {
      return;
  }


  // if (!tank.isFixed && Math.random() < 0.5) return;


  // if (Math.random() < 0.5) return;

  // check if there is any tank in sight, if so, turn and shoot towards it

  // check right
  var shortestDist = 1000;
  var shortestDir = "";

  var tc = (tank.x - 30) / 60;
  var tr = (tank.y - 30) / 60;

  var r = tr;
  var c = tc;

  var foundEnemy = false;

  var targettank = null;

  var dist = 0;
  for(var c = tc + 1; c < cfg.TileWidth; c++) {
      const numID = game.maphandler.map[r][c];
      if (numID == 0) {
          dist ++;
      } else if (numID <= 2) {
          dist = 1000000;
          break;
      } else if (numID == 3) {
          dist ++;
          if (dist > 3) {
              foundEnemy = true;
          }
          break;
      } else {
          const tt = game.allTanksByNumID[numID];
          if (tt) {
              if (tt.team == tank.team) {
                  dist ++;
              } else {
                  if ( Math.abs(tt.hiddenState.y - tank.hiddenState.y ) <= 36 ) {
                      foundEnemy = true;
                      targettank = tt;
                      break;
                  }
                  break;
              }
          }
      }
  }
  if (dist < shortestDist && foundEnemy) {
      shortestDist = dist; shortestDir = "R";
  }



  // "L"
  r = tr;
  c = tc;
  foundEnemy = false;

  dist = 0;
  for(var c = tc - 1; c >= 0; c--) {
      const numID = game.maphandler.map[r][c];
      if (numID == 0) {
          dist ++;
      } else if (numID <= 2) {
          dist = 1000000;
          break;
      } else if (numID == 3) {
          dist ++;
          if (dist > 3) {
              foundEnemy = true;
          }
          break;
      } else {
          const tt = game.allTanksByNumID[numID];
          if (tt) {
              if (tt.team == tank.team) {
                  dist ++;
              } else {
                  if ( Math.abs(tt.hiddenState.y - tank.hiddenState.y ) <= 36 ) {
                      foundEnemy = true;
                      targettank = tt;
                      break;
                  }
              }
          }
      }
  }
  if (dist < shortestDist && foundEnemy) {
      shortestDist = dist; shortestDir = "L";
  }


  // "U"
  r = tr;
  c = tc;
  foundEnemy = false;

  dist = 0;
  for(var r = tr - 1; r >= 0; r--) {
      const numID = game.maphandler.map[r][c];
      if (numID == 0) {
          dist ++;
      } else if (numID <= 2) {
          dist = 1000000;
          break;
      } else if (numID == 3) {
          dist ++;
          if (dist > 3) {
              foundEnemy = true;
          }
          break;
      } else {
          const tt = game.allTanksByNumID[numID];
          if (tt) {
              if (tt.team == tank.team) {
                  dist ++;
              } else {
                  if ( Math.abs(tt.hiddenState.x - tank.hiddenState.x ) <= 36 ) {
                      foundEnemy = true;
                      targettank = tt;
                      break;
                  }
              }
          }
      }
  }
  if (dist < shortestDist && foundEnemy) {
      shortestDist = dist; shortestDir = "U";
  }




  // "D"
  r = tr;
  c = tc;
  foundEnemy = false;

  dist = 0;
  for(var r = tr + 1; r < cfg.TileHeight; r++) {
      const numID = game.maphandler.map[r][c];
      // console.log("numID is " + numID);
      if (numID == 0) {
          dist ++;
      } else if (numID <= 2) {
          dist = 1000000;
          break;
      } else if (numID == 3) {
          dist ++;
          if (dist > 3) {
              foundEnemy = true;
          }
          break;
      } else {
          const tt = game.allTanksByNumID[numID];
          // console.log("found tt " + tt.ID + " " + tt.team);
          if (tt) {
              if (tt.team == tank.team) {
                  dist ++;
              } else {
                  if ( Math.abs(tt.hiddenState.x - tank.hiddenState.x ) <= 36 ) {
                      foundEnemy = true;
                      targettank = tt;
                      break;
                  }
              }
          }
      }
  }
  if (dist < shortestDist && foundEnemy) {
      shortestDist = dist; shortestDir = "D";
  }

  if (shortestDir == "U" || shortestDir == "D") {
      if ( tank.x % 60 != 30) {
          return;
      }
  }
  if (shortestDir == "L" || shortestDir == "R") {
      if ( tank.y % 60 != 30) {
          return;
      }
  }

  if (targettank != null && !tank.isFixed) {
      const hs = targettank.hiddenState;
      if (hs.f <= 1 && hs.s <= 2 && hs.h <= 2 ) {
          if (Math.random() < 0.99) return;
      } else if (hs.f <= 2) {
          if (Math.random() < 0.9) return;
      } else if (hs.f <= 3) {
          if (Math.random() < 0.5) return;
      } else if (hs.f <= 4) {
          if (Math.random() < 0.1) return;
      } else {
          // always shoot!
      }
  }

  let cmdDir = shortestDir;
  if (shortestDir == "") {
      if (!tank.isFixed) return;
      if (!tank.prevCmdDir) {
          return;
      } else {
          if (game.currentCycleInd - tank.prevCmdInd  < 300) {
              cmdDir = tank.prevCmdDir;
          } else {
              // no enemy for a long time
              delete tank.prevCmdDir;
              delete tank.prevCmdInd;
              return;
          }
      }
  } else {
      tank.prevCmdDir = cmdDir;
      tank.prevCmdInd = game.currentCycleInd;
  }

  var shortestAngle = 0;
  if (cmdDir == "R") shortestAngle = 90;
  if (cmdDir == "L") shortestAngle = -90;
  if (cmdDir == "D") shortestAngle = 180;

  var turnorder = null;
  if (tank.angle != shortestAngle) {
      // need to turn first
      turnorder = {
          // tank order
          w: tank.ID, t: Date.now(), c: "T" + shortestDir
      };

  }



  // console.log("new shell time " + tank.ID + " " + game.currentCycleTime + " " + tank.lastShellTime + " " + (game.currentCycleTime - tank.lastShellTime));
  // debugger;

  const order = {
      // tank order
      w: tank.ID, t: Date.now(), c: "S"
  };

  // if (game.isHost) {
      // must be at host for system AI!
      setTimeout(function() {
          const tank = game.allObjects[order.w];
          if (!tank) return;
          // console.log("shoot order from system AI " + JSON.stringify(order) + " " + Date.now());
          if (turnorder != null)
              tank.pendingOrders.push(turnorder);

          tank.pendingOrders.push(order);
      }, game.peerLag);

//     } else {
//         if (turnorder != null)
//             game.networkHandler.sendTOToHostImmediately(turnorder);

//         game.networkHandler.sendTOToHostImmediately(order);
//     }
};

SystemAI.prototype.updateWorld = function() {
  const game = this.game;
  const tank = this.tank;
  if (tank.health <= 0) return;
  this.shootShell();

  if (!tank.isFixed) {
      this.randomPatrol();
  }
};

SystemAI.prototype.updateTankPatrolTarget = function(tr, tc) {
  const game = this.game;
  const tank = this.tank;
  const cfg = game.config;

  // var pr = 2 + Math.floor(Math.random() * (cfg.TileHeight-4));
  // var pc = 2 + Math.floor(Math.random() * (cfg.TileWidth-4));
  var cushion = 1;
  if (tank.magicReward == "NA") {
      cushion = 0;
  }
  var pr = cushion + Math.floor(Math.random() * (cfg.TileHeight-2*cushion));
  var pc = cushion + Math.floor(Math.random() * (cfg.TileWidth-2*cushion));

  while (Math.abs(tr - pr) + Math.abs(tc-pc) < cfg.TileHeight) {
      pr = cushion + Math.floor(Math.random() * (cfg.TileHeight-2*cushion));
      pc = cushion + Math.floor(Math.random() * (cfg.TileWidth-2*cushion));
  }

  tank.patrolTarget = {
      r: pr, c: pc
  };

  return;



  // const path = game.maphandler.searchForPath(ntr, ntc, pr, pc);
  // while (path.length <= 6) {
  //     pr = Math.floor(Math.random() * cfg.TileHeight);
  //     pc = Math.floor(Math.random() * cfg.TileWidth);

  //     path = game.maphandler.searchForPath(ntr, ntc, pr, pc);
  // }

};

SystemAI.prototype.updateTankPatrol = function(ctr, ctc, ntr, ntc) {
  const game = this.gameSetup;
  const tank = this.tank;
  const cfg = game.config;

  let pr = Math.floor(Math.random() * cfg.TileHeight);
  let pc = Math.floor(Math.random() * cfg.TileWidth);

  let path = game.maphandler.searchForPath(ntr, ntc, pr, pc);
  while (path.length <= 6) {
      pr = Math.floor(Math.random() * cfg.TileHeight);
      pc = Math.floor(Math.random() * cfg.TileWidth);

      path = game.maphandler.searchForPath(ntr, ntc, pr, pc);
  }
  path.unshift({x: ntr, y: ntc});
  path.unshift({x: ctr, y: ctc});
  console.log("patrol path from " + ctr + " " + ctc + " to " + pr + " " + pc + " is " );
  for(var j=0; j<path.length; j++) {
      console.log("" + j + ": " + path[j].x + " " + path[j].y); // x is r and y is c
  }

  tank.patrolPath = path;
  tank.patrolIndex = 1; // tank.patrolPath[tank.pathIndex] is always where I'm moving to currently
};



function TankController(game, tankID, localID) {
  this.gameSetup = gameSetup;
  this.tank = gameSetup.tanks[tankID];
  this.tank.currentLaserID = null;
  this.localID = localID;
  this.matrixExplodes = [];
  if (this.gameSetup.isLocal) {
    this.isOwner = true;
  } else {
    const pi = gameSetup.playerInfo[tankID];
    const isLocalPlayer = pi && (gameSetup.config.localPlayerID === pi.userId || gameSetup.config.localPlayerID === pi.playerCodeOwner)
    if (isLocalPlayer) {
      gameSetup.arrLocalPlayerIds.push(tankID);
    }
    this.isOwner = isLocalPlayer || (gameSetup.isHost && this.tank.color == "white");
  }
};

TankController.prototype.findStopForLaser = function(pos, dir) {
  const { x, y } = pos;
  const gameSetup = this.gameSetup;
  const tank = this.tank;
  const cfg = gameSetup.config;
  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;

  const row = Math.round((y - yBlock / 2) / yBlock);
  const col = Math.round((x - xBlock / 2) / xBlock);
  let target = {

  }
  for (let k=0; k<gameSetup.tanks.length; k++) {
    const t = gameSetup.tanks[k];
    const { position } = t;
    if (t.isDead || t.color === tank.color) continue;

    const trow = Math.round((position._y - yBlock / 2) / yBlock);
    const tcol = Math.round((position._x - xBlock / 2) / xBlock);
  }

}

TankController.prototype.getTileType = function(r, c) {
  const cstr = c.toString();
  if (!(cstr in this.gameSetup.maze[r])) return '';
  return this.gameSetup.maze[r][cstr];
}

TankController.prototype.getBestDir = function(start, pos, dir) {
  if (start.r === pos.r && start.c === pos.c) return [];
  const blockingTileTypes = new Set(['R','T']);
  const graph = this.createNewGraph();

  for (let i = 0; i < graph.length; i += 1) {
    for (let j = 0; j < graph[i].length; j += 1) {
      const tile = this.getTileType(i, j);
      if (blockingTileTypes.has(tile)) graph[i][j] = 0;
      else graph[i][j] = 1;
    }
  }

  if (dir == "U") {
    graph[start.r + 1][start.c] = 0;
    graph[start.r + 2][start.c] = 0;
  } else if (dir == "D") {
    graph[start.r - 1][start.c] = 0;
    graph[start.r - 2][start.c] = 0;
  } else if (dir == "L") {
    graph[start.r][start.c + 1] = 0;
    graph[start.r][start.c + 2] = 0;
  } else {
    graph[start.r][start.c - 1] = 0;
    graph[start.r][start.c - 2] = 0;
  }

  return this.getShortestPath(graph, start, pos);
}

TankController.prototype.createNewGraph = function() {
  const { config } = gameSetup;
  const { TileCols, TileRows } = config;
  return Array(TileRows).fill().map(() => Array(TileCols).fill(0));
}

TankController.prototype.getShortestPath = function(graphArray, start, end) {
  if (!graphArray || graphArray.length <= 0 || graphArray[0].length <= 0 ||
    !start || !end || typeof(start.r) == "undefined" || typeof(start.c) == "undefined" || typeof(end.r) == "undefined" || typeof(end.c) == "undefined" || start.r < 0 || start.c < 0 || end.r < 0 || end.c < 0 ||
    start.r >= graphArray.length || start.c >= graphArray[0].length ||
    end.r >= graphArray.length || end.c >= graphArray[0].length)
    return [];

  const graph = new Graph(graphArray);
  const s = graph.grid[start.r][start.c];
  const e = graph.grid[end.r][end.c];
  const path = astar.search(graph, s, e);
  const result = [];
  let pre = s;
  for (let i = 0; i < path.length; i += 1) {
    const cur = path[i];
    if (!cur || !pre) break;
    if (cur.x === pre.x && cur.y < pre.y) result.push('L');
    else if (cur.x === pre.x && cur.y > pre.y) result.push('R');
    else if (cur.y === pre.y && cur.x < pre.x) result.push('U');
    else if (cur.y === pre.y && cur.x > pre.x) result.push('D');
    else console.log("In getShortestPath: cannot move from (" + pre.r + ", " + pre.c + ") to (" + cur.r + ", " + cur.c + ")!!");
    pre = cur;
  }
  return result;
}

TankController.prototype.pickSpecialWeapon = function(type) {
  const t = this.tank;
  if (t.specialWeapon.type === SPECIAL_WEAPON_TYPES.LASER_GUN && type !== SPECIAL_WEAPON_TYPES.LASER_GUN) {
    t.currentLaserID = null;
  }

  t.specialWeapon = {
    type,
    pickAt: new Date(),
  }
}

// TankController.prototype = Object.create(ObjectController.prototype);
// TankController.prototype.constructor = TankController;

TankController.prototype.updatePosition = function() {
  const yBlock = this.gameSetup.config.TileSizeH;
  const xBlock = this.gameSetup.config.TileSizeW;
  const t = this.tank;
  const { position } = t;
  const calculatedPos = {};
  calculatedPos.x = position._x;
  calculatedPos.y = position._y - yBlock;
  // UPDATE POSITION
  if (t.specialPowerBorder) {
    t.specialPowerBorder.position = calculatedPos;
  }
  if (t.circleMark) {
    t.circleMark.position = calculatedPos;
  }
  if (t.specialPowerBar) {
    const specialPowers = Object.values(t.specialPowerBar);
    for(let i = 0; i < specialPowers.length; i += 1) {
      const currentSpecialPower = specialPowers[i];
      const currentSpecialPowerStack = Object.values(currentSpecialPower);
      for(let j = 0; j < currentSpecialPowerStack.length; j += 1) {
        const currentSpecialPowerItem = currentSpecialPowerStack[j];
        currentSpecialPowerItem.position = calculatedPos;
      }
    }
  }
  // update laser
  if (t.currentLaserID !== null) {
    const s = t.shells[t.currentLaserID];
    let dir = t.state;
    if (t.state.indexOf("P") == 0) dir = t.state.substr(1,1);
    if (s && s.dir === dir) {
      s.position.x = t.position.x;
      s.position.y = t.position.y;
      if (dir == "U") {
        s.position.y -= yBlock*1.5;
        s.position.x -= xBlock/40;
        s.position.x -= 0.5;
      } else if (dir == "D") {
        s.position.x += 1.5;
        s.position.y -= (yBlock / 4);
      } else if (dir == "L") {
        s.position.y -= yBlock*1.07;
        s.position.x -= xBlock/2;
        s.position.x += 2;
      } else if (dir == "R") {
        s.position.x -= 2;
        s.position.y -= yBlock*1.07;
        s.position.x += xBlock/2;
      }
    }
  }

};

TankController.prototype.addFreezeLayout = function() {
  const t = this.tank;
  if (t.freezeLayout) {
    this.removeFreezeLayout();
  }
  const cfg = gameSetup.config;
  const { TileSizeW, TileSizeH } = cfg;

  let dir = t.state;
  if (t.state.indexOf("P") == 0) dir = t.state.substr(1,1);

  const c = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/ice_cover_${dir}.png`].texture);
  c.position.x = 0;
  c.position.y = 0;
  c.anchor.set(0.5, 1);
  t.freezeLayout = c;
  t.addChild(t.freezeLayout);
};

TankController.prototype.removeFreezeLayout = function() {
  const t = this.tank;
  t.removeChild(t.freezeLayout);
  t.freezeLayout = null;
};

TankController.prototype.frozen = function() {
  this.tank.freeze = true;
  this.addFreezeLayout();
  this.tank.freezeTimer = setTimeout(() => {
    if (!this.tank.freeze) return;
    this.tank.freeze = false;
    this.removeFreezeLayout();
  }, 6000);
}

TankController.prototype.addPowerPoint = function() {
  const t = this.tank;
  const gameSetup = this.gameSetup;
  if (t.powerPoint + 1 <= MAX_POWER_UP) {
    t.powerPoint ++;
    gameSetup.gameEngine.updatePowerStatus(t);
  }
};

TankController.prototype.updateHealth = function(health) {
  const tank = this.tank;
  tank.health = health;
  this.tank.healthLabel.text = health;
  gameSetup.gameEngine.addCurrentHealth(tank);
  gameSetup.gameEngine.addHealthStatus(tank);
}

TankController.prototype.upgradeSpecialPower = function(specialPower) {
  const t = this.tank;
  const gameSetup = this.gameSetup;
  gameSetup.gameEngine.upgradeSpecialPower(t, specialPower);
};

TankController.prototype.interpretOrder = function(order) {
  if (this.tank.isDead || this.tank.freeze || this.tank.noAI) return;
  let newstate = "PU";
  let newx = -1; let newy = -1;
  const t = this.tank;
  const gameSetup = this.gameSetup;
  // aaaa
  if (order == "R") {
    // debugger;
  }
  // console.log("interpret order " + order + " in state "  + t.state + " " + Date.now());
  if ( "UDLR".indexOf(order) >= 0 ) { // moving key down
    if (t.state == "P" + order) { // PU -> U
      newstate = order; newx = t.position._x; newy = t.position._y;
      // console.log("from pause to moving in " + order + " at " + newx + " " + newy + " " + Date.now());
    } else if (t.state.indexOf("P") == 0) { // PU -> PD
      newstate = "P" + order; newx = t.position._x; newy = t.position._y;
      // console.log("change pause dir " + order + " at " + newx + " " + newy + " " + Date.now());
    } else {
      // already in same moving state
      if (t.state == order) return;

      // not same direction, so pause facing new dir first if only one key press
      newstate = "P" + order;
      const newStop = projectNextStop(t, gameSetup);
      newx = newStop.x; newy = newStop.y;
      // console.log("stop moving to pause in dir " + order + " at " + newx + " " + newy + " " + Date.now());
    }
  } else if (order == "P") {
    // console.log("new p order");
    if (t.state.indexOf("P") == 0) {
      // already paused
      return;
    } else {
      newstate = "P" + t.state;
      const newStop = projectNextStop(t, gameSetup);
      newx = newStop.x; newy = newStop.y;
      // console.log("stop moving to pause in dir " + order + " at " + newx + " " + newy + " " + Date.now() + " newstate " + newstate);
    }
  } else if (order == "S") {
    let dir = t.state;
    if (t.state.indexOf("P") == 0) dir = t.state.substr(1,1);

    const time = Date.now();
    if (!t.lastFireTime) t.lastFireTime = -1;
    if ((t.specialWeapon.type !== SPECIAL_WEAPON_TYPES.LASER_GUN
      && time - t.lastFireTime < t.reloadTime)
      || (t.currentLaserID !== null && t.shells[t.currentLaserID] && t.shells[t.currentLaserID].dir === dir)
    ) return;
    t.lastFireTime = time;

    // find a dead shell to reuse
    const type = t.specialWeapon.type || 0;
    if (type === SPECIAL_WEAPON_TYPES.WAY4) {
      this.fire4way()
    } if (type === SPECIAL_WEAPON_TYPES.MISSILE) {
      // if (!this.gameSetup.isHost) {
      //   gameSetup.networkHandler.sendCOToHostImmediately({
      //     c: "FIREMISSILE", t: gameSetup.currentCycleTime, w: `${t.tankID}_${type}`
      //   });
      //   return;
      // }

      const { row, col } = this.calculateShellRowCol(t);
      let r = row - 1, c = col;

      if (dir == "U") {
        r = r - 2;
      } else if (dir == "D") {
        r = r + 2
      } else if (dir == "L") {
        c = c - 2;
      } else {
        c = c + 2;
      }

      const startPosition = {
        r,c
      }

      _.forEach(gameSetup.tanks, (tank) => {
        if (tank.isDead || tank.color === this.tank.color || tank.color === "white") {
          return;
        }

        const { row: targetRow, col: targetCol } = this.calculateShellRowCol(tank);
        const endPosition = {
          r: targetRow - 1,
          c: targetCol
        }
        const theShortestPath = this.getBestDir(startPosition, endPosition, dir);
        theShortestPath.unshift(dir, dir);

        dir = theShortestPath[0] ? theShortestPath[0] : t.state.replace("P", "");
        const shellID = this.findDeadShell(dir, type);
        if (!t.missilePath) {
          t.missilePath = [];
        }

        let missilePathID = -1;

        _.forEach(t.missilePath, (item, key) => {
          if (item.isCompleted) {
            t.missilePath[key] = {
              path: theShortestPath,
              isCompleted: false,
            }
            missilePathID = key;
            return false;
          }
        })

        if (missilePathID == -1) {
          t.missilePath.push({
            path: theShortestPath,
            isCompleted: false
          })
          missilePathID = t.missilePath.length - 1;
        }
        let w = `${t.tankID}_${t.position._x}_${t.position._y}_${dir}_${shellID}_${type}_${missilePathID}`;
        gameSetup.networkHandler.sendCommandToAll({
          c: "S", t: gameSetup.currentCycleTime, w: w
        });
      });
    } else {
      const shellID = this.findDeadShell(dir, type);
      let w = `${t.tankID}_${t.position._x}_${t.position._y}_${dir}_${shellID}_${type}`;

      gameSetup.networkHandler.sendCommandToAll({
        c: "S", t: gameSetup.currentCycleTime, w: w
      });
    }
    return;
  } else if (order >= "1" && order <= "4") {
    // console.log("upgrade special power order");

    // update special power
    let specialPowerName = SPECIAL_POWER.DAMAGE;
    switch (order) {
      case "1": {
        specialPowerName = SPECIAL_POWER.DAMAGE;
        break;
      }
      case "2": {
        specialPowerName = SPECIAL_POWER.SPEED;
        break;
      }
      case "3": {
        specialPowerName = SPECIAL_POWER.HEALTH_REGEN;
        break;
      }
      case "4": {
        specialPowerName = SPECIAL_POWER.RELOAD;
        break;
      }
    }
    let dir = t.state;
    if (t.state.indexOf("P") == 0) dir = t.state.substr(1,1);
    // find a dead shell to reuse
    gameSetup.networkHandler.sendCommandToAll({
      c: TANK_UPGRADE_SPECIAL_POWER_CMD, t: gameSetup.currentCycleTime, w: `${t.tankID}_${specialPowerName}`
    });
    return;
  } else {
    console.log("unknown order " + JSON.stringify(order));
    return;
  }

  // console.log("interpretOrder " + order + " state " + t.state + "->" + newstate + " " + Date.now());

  gameSetup.networkHandler.sendCommandToAll({
    c: newstate, t: gameSetup.currentCycleTime, w: `${t.tankID}_${newx}_${newy}`
  });
};




// an order is a local instruction from manual user keyboard event or robot AI
// an order is used to calculate a state change cmd, based on current state of tank
// and state change cmd is sent to all peers,
// and controller at each peer execute the state change cmd, and also determines
// how the tank moves step-by-step solely based on its state.
TankController.prototype.interpretOrderOld2 = function(order) {
  let newstate = "PU";
  let newx = -1; let newy = -1;
  const t = this.tank;
  console.log("interpret order " + order + " in state "  + this.tank.state + " " + Date.now());
  if ( "UDLR".indexOf(order) >= 0 ) { // moving key down
    if (this.tank.state == "P" + order) { // PU -> U
      console.log("set new state to " + order + " " + Date.now());
      newstate = order; newx = t.position._x; newy = t.position._y;
    } else if (this.tank.state.indexOf("P") == 0) { // PU -> PD
      newstate = "P" + order;
    } else {
      // already in moving state
      if (this.tank.state == order) return;

      // not same direction, so pause facing new dir first if only one key press
      newstate = "P" + order;
    }
  } else if (order == "P") {
    if (this.tank.state.indexOf("P") == 0) {
      // already paused
      return;
    } else {
      newstate = "P" + this.tank.state;
    }
  } else if (order == "S") {
    gameSetup.networkHandler.sendCommandToAll({
      c: "S", t: gameSetup.currentCycleTime, w: this.localID
    });
  } else {
    console.log("unknown order " + order);
    return;
  }

  console.log("interpretOrder " + order + " state " + this.tank.state + "->" + newstate + " " + Date.now());

  gameSetup.networkHandler.sendCommandToAll({
    c: newstate, t: gameSetup.currentCycleTime, w: `${this.localID}`
  });
};

const eq = (a, b) => {
  return Math.abs(a - b) <= 0.0001;
};

const eq2 = (a, b) => {
  return Math.abs(a - b) <= 16;
};

TankController.prototype.getShellTexture = function(type, dir) {
  switch(type) {
    case SPECIAL_WEAPON_TYPES.FREEZER:
      return PIXI.loader.resources[`/images/tank/bombshell_freezer_${dir}.png`].texture;
    case SPECIAL_WEAPON_TYPES.LASER_GUN:
      const { tank } = this;
      const { color } = tank;
      switch(dir) {
        case 'L': return PIXI.loader.resources[`/images/tank/laser_${color}_tail_horizon.png`].texture;
        case 'R': return PIXI.loader.resources[`/images/tank/laser_${color}_head_horizon.png`].texture;
        case 'D': return PIXI.loader.resources[`/images/tank/laser_${color}_head_vertical.png`].texture;
        case 'U': return PIXI.loader.resources[`/images/tank/laser_${color}_tail_vertical.png`].texture;
      }
    case SPECIAL_WEAPON_TYPES.MISSILE:
      return PIXI.loader.resources[`/images/tank/bombshell_missile_${dir}.png`].texture;
  }
  // console.log("new dir: " + dir);
  if (['L', 'R', 'U', 'D'].includes(dir)) {
    return PIXI.loader.resources[`/images/bombshell_64_${dir}.png`].texture;
  } else {
    return null;
  }
}

TankController.prototype.addBodyAndTailToLaser = function(shell) {
  const { dir } = shell;
  const { tank } = this;
  const { color } = tank;
  switch(dir) {
    case 'L': {
      const body = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_${color}_horizon.png`].texture);
      body.position.x = -LASER_HEAD_WIDTH;
      body.position.y = 0;
      body.anchor.x = 1;
      body.anchor.y = 0.5;
      shell.body = body;
      shell.addChild(body);


      const tail = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_dot_${color}_L.png`].texture);
      tail.position.x = -LASER_HEAD_WIDTH;
      tail.position.y = 4;
      tail.anchor.x = 0.5;
      tail.anchor.y = 0.5;
      shell.tail = tail;
      shell.addChild(tail);
      return;
    }
    case 'R': {
      const body = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_${color}_horizon.png`].texture);
      body.position.x = LASER_HEAD_WIDTH;
      body.position.y = 0;
      body.anchor.x = 0;
      body.anchor.y = 0.5;
      shell.body = body;
      shell.addChild(body);
      const tail = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_dot_${color}_R.png`].texture);
      tail.position.x = LASER_HEAD_WIDTH;
      tail.position.y = 4;
      tail.anchor.x = 0.5;
      tail.anchor.y = 0.5;
      shell.tail = tail;
      shell.addChild(tail);
      return;
    }
    case 'U': {
      const body = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_${color}_vertical.png`].texture);
      body.position.x = 0;
      body.position.y = -LASER_HEAD_WIDTH;
      body.anchor.x = 0.5;
      body.anchor.y = 1;
      shell.body = body;
      shell.addChild(body);
      const tail = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_dot_${color}_U.png`].texture);
      tail.position.x = 4.5;
      tail.position.y = -LASER_HEAD_WIDTH;
      tail.anchor.x = 0.5;
      tail.anchor.y = 0.5;
      shell.tail = tail;
      shell.addChild(tail);
      return;
    }
    case 'D': {
      const body = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_${color}_vertical.png`].texture);
      body.position.x = -2.75;
      body.position.y = LASER_HEAD_WIDTH;
      body.anchor.x = 0.5;
      body.anchor.y = 0;
      shell.body = body;
      shell.addChild(body);
      const tail = new PIXI.Sprite(PIXI.loader.resources[`/images/tank/laser_dot_${color}_D.png`].texture);
      tail.position.x = 2.5;
      tail.position.y = LASER_HEAD_WIDTH;
      tail.anchor.x = 0.5;
      tail.anchor.y = 0.5;
      shell.tail = tail;
      shell.addChild(tail);
      return;
    }
  }
}

TankController.prototype.findTheMissileTargetPosition = function(position, dir) {
  const x = position.x;
  const y = position.y;
  const config = this.gameSetup.config;
  const xBlock = config.TileSizeW;
  const yBlock = config.TileSizeH;
  let targetX, targetY;

  switch (dir) {
    case "U":
      targetY = y - yBlock;
      targetX = x;
      break;
    case "D":
      targetY = y + yBlock;
      targetX = x;
      break;
    case "L":
      targetY = y;
      targetX = x - xBlock;
      break;
    case "R":
      targetY = y;
      targetX = x + xBlock;
      break;
    default:
      break;
  }
  return {
    targetX, targetY
  }
}

TankController.prototype.createNewShell = function(w) {
  const p = w.split("_");
  const t = this.tank;
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;

  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;

  const x = Number(p[1]);
  const y = Number(p[2]);
  let dir = p[3];
  let shellID = p[4];
  const type = Number(p[5]);
  if (type === SPECIAL_WEAPON_TYPES.LASER_GUN && t.currentLaserID !== null) {
    return;
  }
  let s = null; let isReuse = false;
  if (t.shells[shellID]) {
    // reusing an existing shell!
    s = t.shells[shellID];
    s.isDead = false;
    isReuse = true;
  } else {
    const shellTexture = this.getShellTexture(type, dir);
    
    s = new PIXI.Sprite(shellTexture);
    t.shells.push(s);

    s.type = type;
  }

  s.position.x = x;
  s.position.y = y;
  if (type !== SPECIAL_WEAPON_TYPES.MISSILE || !p[7]) {
    if (dir == "U") {s.position.y -= yBlock*1.5; s.position.x -= xBlock/40;}
    if (dir == "L") {s.position.y -= yBlock*1.07; s.position.x -= xBlock/2;}
    if (dir == "R") {s.position.y -= yBlock*1.07; s.position.x += xBlock/2;}
  }

  if (type === SPECIAL_WEAPON_TYPES.MISSILE && !p[7]) {
    const missilePathID = Number(p[6]);
    let targetX, targetY;
    if (dir == "U") {
      targetY = s.position.y - 0.3 * yBlock;
      targetX = s.position.x;
    }
    if (dir == "L") {
      targetY = s.position.y;
      targetX = s.position.x - 0.5 * xBlock;
    }
    if (dir == "R") {
      targetY = s.position.y;
      targetX = s.position.x + 0.4 * xBlock;
    }
    if (dir == "D") {
      targetY = s.position.y + 0.2 * yBlock;
      targetX = s.position.x;
    }

    s.target = {
      position: {
        x: targetX,
        y: targetY,
      },
      missilePathID
    }
  }

  if (type === SPECIAL_WEAPON_TYPES.MISSILE && p[7]) {
    const missilePathID = Number(p[6]);
    const { targetX, targetY } = this.findTheMissileTargetPosition(s.position, dir);

    s.target = {
      position: {
        x: targetX,
        y: targetY,
      },
      missilePathID
    }
  }

  if (type === SPECIAL_WEAPON_TYPES.LASER_GUN) {
    if (dir == "U") {
      s.anchor.x = 0.5;
      s.anchor.y = 1;
      s.position.x -= 0.5;
    }
    if (dir == "D") {
      s.position.x += 1.5;
      s.position.y -= yBlock/4;
      s.anchor.x = 0.5;
      s.anchor.y = 0;
    }
    if (dir == "L") {
      s.position.x += 2;
      s.anchor.x = 1;
      s.anchor.y = 0.5;
    }
    if (dir == "R") {
      s.position.x -= 2;
      s.anchor.x = 0;
      s.anchor.y = 0.5;
    }
    t.currentLaserID = shellID;
  } else {
    s.anchor.x = 0.5;
    s.anchor.y = 0.5;
  }
  s.speedLimitX = cfg.TileSizeW / 7;// 2;
  s.speedLimitY = cfg.TileSizeH / 7;// 2;

  s.dir = dir;
  // will change later
  s.damage = 180;


  if (dir == "U") {s.speedX = 0; s.speedY = -1;}
  if (dir == "D") {s.speedX = 0; s.speedY =  1;}
  if (dir == "L") {s.speedX = -1; s.speedY =  0;}
  if (dir == "R") {s.speedX = 1; s.speedY =  0;}

  // b.scale.x = cfg.TrueWidth / 1280;
  // b.scale.y = cfg.TrueWidth / 900;

  // save target position for missile shell

  if (!isReuse)
    gameSetup.mazeContainer.addChild(s);

  // add explosion
  if (type == SPECIAL_WEAPON_TYPES.LASER_GUN) {
    if (!isReuse) {
      this.addBodyAndTailToLaser(s);
    }
    s.shellID = shellID;
  } else {
    if (!isReuse) {
      // record position before bomb moves away
      // add trail
      const exx = s.position._x;
      const exy = s.position._y;
      gameSetup.gameEngine.loadFramedSpriteSheet(`/images/explosionshoot.png`, 'explosion', 50, 50, 8, (frames) => {
        const ex = new PIXI.extras.AnimatedSprite(frames);
        // tank.scale.set(config.ballD / 41);

        ex.position.x = exx;
        ex.position.y = exy;
        ex.anchor.x = 0.5;
        ex.anchor.y = 0.5;

        gameSetup.mazeContainer.addChild(ex);
        s.ex = ex;
        ex.loop = false;
        ex.onComplete = () => {
          //gameSetup.mazeContainer.removeChild(ex);
          s.ex.position.x = -10000;
        };

        ex.play();
      });
      const texture = type === SPECIAL_WEAPON_TYPES.FREEZER
        ? PIXI.loader.resources[`/images/tank/bombshell_flametrail_freezer.png`].texture
        : PIXI.loader.resources[`/images/bombshell_flametrail_4_64.png`].texture;
      const tr = new PIXI.Sprite(texture);
      if (type === SPECIAL_WEAPON_TYPES.FREEZER) {
        // tr.width = 71; // will remove this after resize asset
        // tr.height = 19;
        tr.position.x = -91;
        tr.position.y = 0 - yBlock * 0.1;
        if (dir == "L") {tr.rotation = Math.PI; tr.position.x = 93; tr.position.y = 0 + yBlock * 0.1;}
        if (dir == "U") {tr.rotation = Math.PI * 1.5; tr.position.x = 0 - xBlock * 0.074; tr.position.y = 0 + 90;}
        if (dir == "D") {tr.rotation = Math.PI * 0.5; tr.position.x = 0 + xBlock * 0.074; tr.position.y = 0 - 91;}
      } else {
        // dir == "R"
        tr.position.x = 0 - xBlock * 0.99;
        tr.position.y = 0 - yBlock * 0.21;
        if (dir == "L") {tr.rotation = Math.PI; tr.position.x = xBlock * 1.01; tr.position.y = 0 + yBlock * 0.21;}
        if (dir == "U") {tr.rotation = Math.PI * 1.5; tr.position.x = 0 - xBlock * 0.15; tr.position.y = 0 + yBlock * 1.39;}
        if (dir == "D") {tr.rotation = Math.PI * 0.5; tr.position.x = 0 + xBlock * 0.15; tr.position.y = 0 - yBlock * 1.39;}
      }
        s.addChild(tr);
      s.shellID = shellID;
    } else {
      s.ex.position.x = s.position._x;
      s.ex.position.y = s.position._y;

      s.ex.play();
    }

    if (!p[7]) {
      gameSetup.shootSound.play();
    }
  }
};

TankController.prototype.playExplosion = function(x, y, width = 77, height = 86, speed = 1) {
  const gameSetup = this.gameSetup;
  gameSetup.gameEngine.loadFramedSpriteSheet(`/images/explosiontarget.png`, 'explosion', 77, 86, 8, (frames) => {
    const ex = new PIXI.extras.AnimatedSprite(frames);
    // tank.scale.set(config.ballD / 41);

    ex.position.x = x;
    ex.position.y = y;
    ex.anchor.x = 0.5;
    ex.anchor.y = 0.5;
    ex.width = width;
    ex.height = height;
    ex.animationSpeed = speed;
    gameSetup.mazeContainer.addChild(ex);
    ex.loop = false;
    ex.onComplete = () => {
      if (gameSetup.mazeContainer) gameSetup.mazeContainer.removeChild(ex);
    };
    ex.play();
  });

  gameSetup.explodeSound.play();

};

TankController.prototype.playMatrixExplosion = function(x, y, width = 77, height = 86, speed = 1) {
  const gameSetup = this.gameSetup;
  // for(let exi = 1; exi <= 12; exi += 1) {
  //   const explodeFrame = PIXI.loader.resources[`/images/tank/matrix_explosion/explosionmatrix_${exi}-64.png`].texture;
  //   frames.push(explodeFrame);
  // }

  let ex = this.matrixExplodes.find(explode => explode.available);
  if (!ex) {
    if (!this.matrixExplodeFrame) {
      this.matrixExplodeFrames = [];
      for(let exi = 0; exi <= 11; exi += 1) {
        const explodeFrame = PIXI.loader.resources[`/images/tank/novatile/tile0${exi >= 10 ? "" : "0"}${exi}.png`].texture;
        this.matrixExplodeFrames.push(explodeFrame);
      }
    }
    ex = new PIXI.extras.AnimatedSprite(this.matrixExplodeFrames);
    this.matrixExplodes.push(ex)
  }
  ex.available = false;
  ex.position.x = x;
  ex.position.y = y;
  ex.anchor.x = 0.5;
  ex.anchor.y = 0.46;
  ex.width = width * 1.5;
  ex.height = height * 4/3;
  ex.alpha = 0.88;
  ex.animationSpeed = speed;
  gameSetup.mazeContainer.addChild(ex);
  ex.loop = false;
  ex.onComplete = () => {
    gameSetup.mazeContainer.removeChild(ex);
    ex.available = true;
  };
  ex.gotoAndPlay(0);

  gameSetup.explodeSound.play();

};

TankController.prototype.executeCommand = function(cmd) {
  const t = this.tank;
  const gameSetup = this.gameSetup;
  if (gameSetup.gameType != GAME_TYPE.TESTING) {
    if ( t.isDead && cmd.c !== "KillShell" ) return;
  }
  // console.log("executeCommand: tank " + t.tankID + " received command " + cmd.c + " " + cmd.w + " while at " + t.position._x + " " + t.position._y + " state " + t.state);

  if (cmd.c == "S") {
    // create shell from given position and shoot a bomb
    this.createNewShell(cmd.w);
  } else if (cmd.c == "KillShell") {
    const p = cmd.w.split("_");
    const shellID = p[1];
    if (!t.shells[shellID]) return;
    // reset hited tank array
    t.shells[shellID].hitTank = [];
    if (t.shells[shellID].type === SPECIAL_WEAPON_TYPES.MATRIX) {
      this.matrixExplode(t.shells[shellID]);
    } else if (t.shells[shellID].type != SPECIAL_WEAPON_TYPES.LASER_GUN) {
      const noExplosion = p[2];

      if (!noExplosion) {
        this.playExplosion(t.shells[p[1]].position._x , t.shells[p[1]].position._y);
      }
    }
    if (t.currentLaserID === shellID) {
      t.currentLaserID = null;
    }
    t.shells[shellID].position.x = -1000000;
    t.shells[shellID].isDead = true;
  } else if (cmd.c == "HurtTank") {
    // reduce tank health
    const p = cmd.w.split("_");
    const damage = Number(p[1]);
    const effect = p[2];
    this.tank.health -= damage;

    if (effect === 'EXPLODE') {
      this.playExplosion(this.tank.position.x, this.tank.position.y)
    }

    if (this.tank.health <= 0) {
      this.tank.health = 0;
      this.tank.isDead = true;

      if ((this.tank.color === "white" && !cmd.z) && (this.gameSetup.isLocal || this.gameSetup.isHost) && effect !== 'ENDGAME' ) {
        if (this.gameSetup.gameType === TankGame.TESTING) {
          if (!("numOfTanksKilled" in this.gameSetup)) this.gameSetup.numOfTanksKilled = 0;
          this.gameSetup.numOfTanksKilled += 1;

          const c = Math.round((this.tank.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
          const r = Math.round(this.tank.y / gameSetup.config.TileSizeH - 1.5);

          this.gameSetup.whiteTanksKilled.push(`${c}_${r}`);
        }

        let chance = Math.random();
        if (chance < 0.25) { // bbbbb
          // leave nothing!
        } else if (chance < 0.5) { // how often leaving crystals? bbbbbb
          // leave crystal
          let cID = this.gameSetup.crystals.length;
          for (let k=0; k<this.gameSetup.crystals.length; k++) {
            const c = this.gameSetup.crystals[k];
            if (c.isUsed) {
              cID = k; break;
            }
          }
          gameSetup.networkHandler.sendCommandToAll({
            c: "NewCrystal", t: gameSetup.currentCycleTime, w: `${this.tank.position._x}_${this.tank.position._y}_${cID}`
          });
        } else {
          let type = Math.ceil(Math.random() * 6);
          // need remove next
          if (type == SPECIAL_WEAPON_TYPES.SERIAL_KILLER) {
            //type = SPECIAL_WEAPON_TYPES.LASER_GUN;
          }
          let wId = this.gameSetup.weapons.length;
          for (let k=0; k<this.gameSetup.weapons.length; k++) {
            const c = this.gameSetup.weapons[k];
            if (c.isUsed && c.type === type) {
              wId = k;
              break;
            }
          }
          gameSetup.networkHandler.sendCommandToAll({
            c: "NewWeapon", t: gameSetup.currentCycleTime, w: `${this.tank.position._x}_${this.tank.position._y}_${wId}_${type}`
          });
        }
      }

      if (this.tank.color !== 'white') {
        gameSetup.networkHandler.sendMessageToPlayers(CMD_TANK_DEAD, { tankID: this.tank.tankID });

        if (this.gameSetup.gameType === TankGame.TESTING) {
          if (!("numOfColoredTanksKilled" in this.gameSetup)) this.gameSetup.numOfColoredTanksKilled = 0;
          this.gameSetup.numOfColoredTanksKilled += 1;

        }

      }

      this.tank.position.x = -10000;
      this.tank.tankController.updatePosition();
    } else {
      if (effect === 'FREEZE') {
        this.frozen();
      }
      if (this.tank.health <= 0) {
        this.stopLaserShot();
      }
      this.updateHealth(this.tank.health);
    }
  } else {
    const p = cmd.w.split("_");
    const nx = Number(p[1]);
    const ny = Number(p[2]);

    /* record path for testing */
    if (gameSetup.gameType === TankGame.TESTING) {
      const c = Math.round((t.position.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
      const r = Math.round(t.position.y / gameSetup.config.TileSizeH - 1.5);

      if (!("footPrints" in gameSetup)) gameSetup.footPrints = {};
      if (!(t.tankID.toString() in gameSetup.footPrints)) {
        gameSetup.footPrints[t.tankID.toString()] = {
          lastC: c,
          lastR: r,
          path: new Set(),
        };
      }
      const fp = gameSetup.footPrints[t.tankID.toString()];

      if (r === fp.lastR) {
        for (let i = Math.min(c, fp.lastC); i <= Math.max(c, fp.lastC); i += 1) {
          fp.path.add(i + "_" + r);
        }
      } else if (c === fp.lastC) {
        for (let i = Math.min(r, fp.lastR); i <= Math.max(r, fp.lastR); i += 1) {
          fp.path.add(c + "_" + i);
        }
      }
      fp.lastC = c;
      fp.lastR = r;
    }

    if (eq(t.position._x,nx) && eq(t.position._y, ny)) {
      // console.log("can make state change right away! to state " + t.state);
      t.state = cmd.c;
      if (t.state == "L") {t.speedX = -1; t.speedY = 0;}
      if (t.state == "R") {t.speedX = 1; t.speedY = 0;}
      if (t.state == "U") {t.speedX = 0; t.speedY = -1;}
      if (t.state == "D") {t.speedX = 0; t.speedY = 1;}
      if (t.state.indexOf("P") == 0) {t.speedX = 0; t.speedY = 0;}
      delete t.pendingState;
      // return;
    } else {
      // make sure tank is on path towards state change coordinate

      if ( !eq(t.position._x,nx) && !eq(t.position._y,ny)) {
        // both x and y are off
        // console.log("mismatch both x and y!!!! x " + t.position._x + " " + nx + " y " + t.position._y + " " + ny + " " + Date.now());


        const xOff = Math.abs(t.position._x - nx);
        const yOff = Math.abs(t.position._y - ny);

        if (xOff <= yOff) {
          // console.log("will overwrite x position now " + t.position._x + " -> " + nx);
          t.position.x = nx; t.speedX = 0;
        } else {
          // console.log("will overwrite y position now " + t.position._y + " -> " + ny);
          t.position.y = ny; t.speedY = 0;
        }
        // we can continue as below since only x or y are off
      }
      if (!eq(t.position._x,nx) && eq(t.position._y,ny)) {
        // console.log("x not equal " + t.position._x + " " + nx + " " + t.state);
        if (t.position._x > nx) {
          if (t.state != "L") {
            // need to move towards new point now
            // console.log("force state L " + t.position._x + " " + nx + " " + Date.now());
            t.state = "L"; t.speedX = -1; t.speedY = 0;
          }
        } else {
          if (t.state != "R") {
            // need to move towards new point now
            // console.log("force state R " + t.position._x + " " + nx + " " + Date.now());
            t.state = "R"; t.speedX = 1; t.speedY = 0;
          }
        }
        t.pendingState = cmd.c; t.pendingX = nx; t.pendingY = ny;
      } else if (eq(t.position._x,nx) && !eq(t.position._y,ny)) {
        // console.log("y not equal " + t.position._y + " " + ny + " " + t.state);
        if (t.position._y > ny) {
          if (t.state != "U") {
            // need to move towards new point now
            // console.log("force state U " + t.position._y + " " + ny + " " + Date.now());
            t.state = "U"; t.speedX = 0; t.speedY = -1;
          }
        } else {
          if (t.state != "D") {
            // need to move towards new point now
            // console.log("force state D " + t.position._y + " " + ny + " " + Date.now());
            t.state = "D"; t.speedX = 0; t.speedY = 1;
          }
        }
        t.pendingState = cmd.c; t.pendingX = nx; t.pendingY = ny;
      }
    }
  }
};



TankController.prototype.executeCommandOld = function(cmd) {
  if (cmd.c == "PU" || cmd.c == "PD" || cmd.c == "PL" || cmd.c == "PR" || cmd.c == "L" || cmd.c == "R" || cmd.c == "U" || cmd.c == "D" ) {
    // set new movement state
    // console.log("set new state " + cmd.c + " " + Date.now());
    this.tank.state = cmd.c;
  } else if (cmd.c == "S") {
    // create shell controller from given position and shoot a bomb
  }
};

TankController.prototype.getTankDir = function() {
  const t = this.tank;
  if (t.speedX == 0 && t.speedY == 0) {
    return "P" + t.dir;
  } else {
    if (t.speedX > 0) return "R";
    if (t.speedX < 0) return "L";
    if (t.speedY > 0) return "D";
    if (t.speedY < 0) return "U";
  }
};

const isMultiple = (x, b) => {
  let res = x % b;
  if ( res > b / 2) res = res - b;
  if (Math.abs(res) < 0.01)
    return true;

  return false;
};

TankController.prototype.atCheckPoint = function() {
  const t = this.tank;
  const cfg = this.gameSetup.config;

  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;

  if (!isMultiple(t.position._x - xBlock/2, xBlock)) return false;
  if (!isMultiple(t.position._y - yBlock / 2, yBlock)) return false;
  return true;
};

const projectNextStop = (t, gameSetup) => {
  const cfg = gameSetup.config;

  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;

  let nx = t.position._x;
  let ny = t.position._y;


  if (isMultiple(nx - xBlock / 2, xBlock) && isMultiple(ny - yBlock / 2, yBlock)) {
    return {x: nx, y: ny};
  }

  if (t.state.indexOf("P") == 0) {
  } else if (t.state == "U") {
    // const row = Math.round((t.position._y - yBlock / 2) / yBlock);
    // ny = yBlock * (row - 2) + yBlock / 2;
    ny = Math.floor((Math.round(t.position._y * 1000) / 1000 - yBlock/2) / yBlock) * yBlock + yBlock / 2;
  } else if (t.state == "D") {
    // const row = Math.round((t.position._y - yBlock / 2) / yBlock);
    // ny = yBlock * (row) + yBlock / 2;
    ny = Math.ceil((Math.round(t.position._y * 1000) / 1000 - yBlock/2) / yBlock) * yBlock + yBlock / 2;
  } else if (t.state == "L") {
    // const col = Math.round((t.position._x - xBlock / 2) / xBlock);
    // nx = xBlock * (col-1) + xBlock / 2;
    nx = Math.floor((Math.round(t.position._x * 1000) / 1000 - xBlock/2) / xBlock) * xBlock + xBlock / 2;
  } else if (t.state == "R") {
    // const col = Math.round((t.position._x - xBlock / 2) / xBlock);
    // nx = xBlock * (col+1) + xBlock / 2;
    nx = Math.ceil((Math.round(t.position._x * 1000) / 1000 - xBlock/2) / xBlock) * xBlock + xBlock / 2;
  }
  return {x: nx, y: ny};
};

TankController.prototype.findDeadShell = function(dir, type) {
  // console.log('find dead shell', dir, type)
  const tank = this.tank;
  const { shells } = tank;
  for (let k=0; k< shells.length; k++) {
    if (shells[k].isDead && shells[k].dir === dir && shells[k].type === type) {
      return k;
    }
  }
  return shells.length;
}

TankController.prototype.fire4way = function() {
  const t = this.tank;
  // fire Up
  const dirs = ['U', 'D', 'L', 'R'];
  for (let i = 0 ; i < 4; i += 1) {
    const shellID = this.findDeadShell(dirs[i], 0);
    gameSetup.networkHandler.sendCommandToAll({
      c: "S", t: gameSetup.currentCycleTime, w: `${t.tankID}_${t.position._x}_${t.position._y}_${dirs[i]}_${shellID}_${0}`
    });
  }
}

TankController.prototype.matrixExplode = function(shell) {
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;
  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;
  const { TrueHeight, TrueWidth } = cfg;
  const t = this.tank;
  const damagePower = ((t.specialPower || {}).damage || 0) + 1;

  const minX = shell.position._x - (xBlock * 2.5);
  const minY = shell.position._y - (yBlock * 2.5);
  const maxX = shell.position._x + (xBlock * 2.5);
  const maxY = shell.position._y + (xBlock * 2.5);
  this.playMatrixExplosion(shell.position._x, shell.position._y, maxX - minX, maxY - minY, 0.25);

  let { row, col } = this.calculateShellRowCol(shell);
  if (shell.speedY === 1) row += 1;
  else if (shell.speedY === -1) row -= 1;

  for (let i = -2; i <= 2; i += 1) {
    for (let j = -2; j <= 2; j += 1) {
      const r = row + i;
      const c = col + j;
      if (r >= 0 && r < cfg.TileRows && c >= 0 && c < cfg.TileCols) {
        const tile = (gameSetup.maze[r] || {})[c];
        if (tile === "T") {
          gameSetup.networkHandler.sendCommandToAll({
            c: "RemoveTile", t: gameSetup.currentCycleTime, w: `${r}_${c}`
          });
        }
      }
    }
  }

  // hurt tank in matrix
  for (let i = 0; i < gameSetup.tankControllers.length; i++) {
    const tank = gameSetup.tankControllers[i].tank;
    if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[i].inTestCase) continue;
    let { row: tankR, col: tankC } = this.calculateShellRowCol(tank);
    tankR -= 1;
    if (tank.color !== t.color && Math.abs(tankR - row) <= 2 && Math.abs(tankC - col) <= 2) {
      gameSetup.networkHandler.sendCommandToAll({
        c: "HurtTank", t: gameSetup.currentCycleTime, w: `${tank.tankID}_${180 * damagePower}`
      });
    }
  }

}

TankController.prototype.splitter3Explode = function(shell) {
  // check type 1 weapon
  const t = this.tank;
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;

  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;
  // shot position is based on tank -> transform to position of father bomb shell
  const position = { ...shell.position };
  if (shell.dir === 'U') position._y += (yBlock / 4);
  if (shell.dir === 'D') position._y -= (yBlock / 4);
  if (shell.dir === 'L') position._x += (xBlock / 4);
  if (shell.dir === 'R') position._x -= (xBlock / 4);
  const { row, col } = this.calculateShellRowCol(shell);
  if (shell.dir !== 'U') {
    const y = shell.dir === 'D'
      ? (row + 1) * yBlock
      : position._y + yBlock*1.5;
    let shellID = this.findDeadShell('U', 0)
    gameSetup.networkHandler.sendCommandToAll({
      c: "S", t: gameSetup.currentCycleTime, w: `${t.tankID}_${position._x + xBlock/40}_${y}_U_${shellID}_0`
    });
  }
  if (shell.dir !== 'D') {
    let shellID = this.findDeadShell('D', 0)
    gameSetup.networkHandler.sendCommandToAll({
      c: "S", t: gameSetup.currentCycleTime, w: `${t.tankID}_${position._x}_${position._y}_D_${shellID}_0`
    });
  }
  if (shell.dir !== 'L') {
    let shellID = this.findDeadShell('L', 0)
    const y = shell.dir === 'R'
      ? position._y + yBlock*1.07
      : shell.dir === 'D'
        ? (row + 1) * yBlock
        : (row + 2.5) * yBlock
    gameSetup.networkHandler.sendCommandToAll({
      c: "S", t: gameSetup.currentCycleTime, w: `${t.tankID}_${position._x + xBlock/2}_${y}_L_${shellID}_0`
    });
  }
  if (shell.dir !== 'R') {
    let shellID = this.findDeadShell('R', 0)
    const y = shell.dir === 'L'
      ? position._y + yBlock*1.07
      : shell.dir === 'D'
        ? (row + 1) * yBlock
        : (row + 2.5) * yBlock
    gameSetup.networkHandler.sendCommandToAll({
      c: "S", t: gameSetup.currentCycleTime, w: `${t.tankID}_${position._x - xBlock/2}_${y}_R_${shellID}_0`
    });
  }
}

// laser have different position with other shells
TankController.prototype.getAbsoluteShellPos = function(s) {
  const { position } = s;
  let x = position._x;
  let y = position._y;
  return ({ x, y })
}

TankController.prototype.getAbsoluteTankPos = function() {
  const t = this.tank;
  const { position } = t;
  let x = position._x;
  let y = position._y;
  return ({ x, y })
}

TankController.prototype.calculateShellRowCol = function(s) {
  const { x, y } = this.getAbsoluteShellPos(s);
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;
  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;
  return ({
    row: Math.round((y - yBlock / 2) / yBlock),
    col: Math.round((x - xBlock / 2) / xBlock),
  })
}

TankController.prototype.calculateTankRowCol = function() {
  const t = this.tank;
  const { x, y } = this.getAbsoluteTankPos();
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;
  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;
  return ({
    row: Math.round((y - yBlock / 2) / yBlock),
    col: Math.round((x - xBlock / 2) / xBlock),
  })
}

TankController.prototype.findLaserStop = function(s) {
  const gameSetup = this.gameSetup;
  const tank = this.tank;
  const { config } = gameSetup;
  const { TileCols, TileRows, TileSizeW, TileSizeH } = config;
  const { row, col } = this.calculateShellRowCol(s);
  const { x, y } = this.getAbsoluteShellPos(s);
  const { dir } = s;
  const { maze } = gameSetup;
  let mazeDis = -1;
  // find next Rock or tall grass
  if (dir === 'L') {
    if (maze[row]) {
      const rowArray = maze[row];
      let currentCol = col;
      while (currentCol > 0 && (rowArray[currentCol] !== 'T' && rowArray[currentCol] !== 'R' )) {
        currentCol -= 1;
      }
      if (rowArray[currentCol]) {
        mazeDis = x - (currentCol + 1) * TileSizeW;
        if (mazeDis < 0) mazeDis = 0;
      }
    }
  } else if (dir === 'R') {
    if (maze[row]) {
      const rowArray = maze[row];
      let currentCol = col;
      while (currentCol < TileCols - 1 && (rowArray[currentCol] !== 'T' && rowArray[currentCol] !== 'R' )) {
        currentCol += 1;
      }
      if (rowArray[currentCol]) {
        mazeDis = currentCol * TileSizeW - x;
        if (mazeDis < 0) mazeDis = 0;
      }
    }
  } else if (dir === 'U') {
    let currentRow = row;
    while (currentRow > 0 && (!maze[currentRow] || (maze[currentRow][col] !== 'T' && maze[currentRow][col]  !== 'R'))) {
      currentRow -= 1;
    }
    if (maze[currentRow][col]) {
      mazeDis = y - (currentRow + 1) * TileSizeH;
      if (mazeDis < 0) mazeDis = 0;
    }
  } else if (dir === 'D') {
    let currentRow = row;
    while (currentRow < TileRows - 1 && (!maze[currentRow] || (maze[currentRow][col] !== 'T' && maze[currentRow][col]  !== 'R' ))) {
      currentRow += 1;
    }
    if (maze[currentRow][col]) {
      mazeDis = currentRow * TileSizeH - y - 2;
      if (mazeDis < 0) mazeDis = 0;
    }
  }
  // find next tank
  let tankDis = -1;
  let tankID = null;
  for (let k=0; k<gameSetup.tanks.length; k++) {
    const t = gameSetup.tanks[k];
    const { x: tankx, y: tanky } = tank;
    if (t.isDead || t.color === tank.color) continue;
    if (t.position._x >= tankx - TileSizeW / 2 && t.position._x <= tankx + TileSizeW / 2) {
      if (tanky >= t.position._y && dir === 'U') {
        const dis = tanky - t.position._y - TileSizeH;
        if (dis < tankDis || tankDis === -1) {
          tankDis = dis;
          tankID = t.tankID;
        }
        continue;
      }
      if (tanky <= t.position._y && dir === 'D') {
        const dis = t.position._y - tanky - (TileSizeH * 5) / 4;
        if (dis < tankDis || tankDis === -1) {
          tankDis = dis;
          tankID = t.tankID;
        }
        continue;
      }
    } else if (t.position._y >= tanky - TileSizeH/2 && t.position._y <= tanky + TileSizeH/2) {
      if ( tankx >= t.position._x && dir === 'L') {
        let dis = tankx - t.position._x - TileSizeW;
        let tankDir = t.state;
        if (tankDir.indexOf("P") == 0) tankDir = tankDir.substr(1,1);
        if (tankDir === 'U' || tankDir === 'D') {
          dis += (TileSizeW * 1/6 - 2);
        } else {
          dis += 2;
        }
        if (dis < tankDis || tankDis === -1) {
          tankDis = dis;
          tankID = t.tankID;
        }
        continue;
      }
      if (tankx <= t.position._x && dir === 'R') {
        let dis = t.position._x - tankx - TileSizeW;
        let tankDir = t.state;
        if (tankDir.indexOf("P") == 0) tankDir = tankDir.substr(1,1);
        if (tankDir === 'U' || tankDir === 'D') {
          dis += (TileSizeW * 1/6 - 2);
        } else {
          dis += 2;
        }
        if (dis < tankDis || tankDis === -1) {
          tankDis = dis;
          tankID = t.tankID;
        }
        continue;
      }
    }
  }
  if (tankDis === -1 || mazeDis < tankDis) {
    return {
      type: 'Maze',
      dis: mazeDis
    }
  }
  return {
    type: 'tank',
    tankID,
    dis: tankDis > 0? tankDis : 0,
  }
}

function checkInRange(value, beginRange, endRange) {
  return ((value >= beginRange && value <= endRange)
    || (value <= beginRange && value >= endRange)
  );
}

TankController.prototype.moveAndCheckShells = function() {
  // return;
  const tank = this.tank;
  const gameSetup = this.gameSetup;
  const cfg = gameSetup.config;

  const xBlock = cfg.TileSizeW;
  const yBlock = cfg.TileSizeH;

  let hasLiveShell = false;
  const tankDir = tank.state[tank.state.length - 1];
  for (let k=0; k<tank.shells.length; k++) {
    const s = tank.shells[k];
    if (s.isDead) continue;
    hasLiveShell = true;


    if (s.type === SPECIAL_WEAPON_TYPES.LASER_GUN) {
      const { dir } = s;
      if (tankDir !== dir || tank.freeze || tank.specialWeapon.type !== s.type) {
        if (this.isOwner) {
          s.isDead = true;
          gameSetup.networkHandler.sendCommandToAll({
            c: "KillShell", t: gameSetup.currentCycleTime, w: `${tank.tankID}_${s.shellID}`,
          });
          if (tankDir !== dir) {
            this.interpretOrder("S");
          }
        }
      } else {
        const { dis, type, tankID } = this.findLaserStop(s);
        if (dir === 'L' || dir === 'R') {
          s.width = Math.min(dis + LASER_HEAD_WIDTH/2, LASER_HEAD_WIDTH);
          s.body.width = Math.max(dis - LASER_HEAD_WIDTH, 0);
          const tailDis = dis;
          if (dir === 'R') {
            s.tail.x = tailDis;
          } else {
            s.tail.x = -tailDis;
          }
        } else {
          s.height = Math.min(dis + LASER_HEAD_WIDTH/2, LASER_HEAD_WIDTH);
          s.body.height = Math.max(dis - LASER_HEAD_WIDTH, 0);
          const tailDis = dis;
          if (dir === 'D') {
            s.tail.y = tailDis;
          } else {
            s.tail.y = -tailDis;
          }
        }
        if (type === 'tank' && tankID !== null && this.isOwner) {
          const damagePower = ((tank.specialPower || {}).damage || 0) + 1;
          let w = `${tankID}_${3 * damagePower}`;
          gameSetup.networkHandler.sendCommandToAll({
            c: "HurtTank", t: gameSetup.currentCycleTime, w,
          });
        }
      }
      continue;
    } else {
      s.position.x += s.speedLimitX * s.speedX;
      s.position.y += s.speedLimitY * s.speedY;
    }

    if (this.isOwner && gameSetup.maze.length > 0) {
      // console.log(s);
      // check if collision!
      const { row, col } = this.calculateShellRowCol(s);
      let hitTarget = false;
      // const row = Math.round((s.position._y - yBlock / 2) / yBlock);
      // const col = Math.round((s.position._x - xBlock / 2) / xBlock);
      const tile = (gameSetup.maze[row] || {})[col];
      if (tile == "T" || tile == "R") {
        if (tile == "T" && s.type !== SPECIAL_WEAPON_TYPES.MAXTRIX && s.type !== SPECIAL_WEAPON_TYPES.LASER_GUN) { // remove tree
          let w = `${row}_${col}`;
          if (s.type === SPECIAL_WEAPON_TYPES.SERIAL_KILLER) {
            w += `_EXPLODE_${tank.tankID}_${s.position.x}_${s.position.y}`;
          }
          gameSetup.networkHandler.sendCommandToAll({
            c: "RemoveTile", t: gameSetup.currentCycleTime, w,
          });
        } else if (s.type === SPECIAL_WEAPON_TYPES.SPLITTER3) {
          this.splitter3Explode(s);
        }
        // kill shell
        if (s.type !== SPECIAL_WEAPON_TYPES.LASER_GUN &&
          !(s.type === SPECIAL_WEAPON_TYPES.SERIAL_KILLER && tile === 'T')) {
          s.isDead = true;
          gameSetup.networkHandler.sendCommandToAll({
            c: "KillShell", t: gameSetup.currentCycleTime, w: `${tank.tankID}_${s.shellID}`
          });
        }
        hitTarget = true;
      } else if (tile == "M") {
        // continue;
      } else {
        // check for tanks
        const absoluteSPos = this.getAbsoluteShellPos(s);
        const spos = {x: absoluteSPos.x, y: absoluteSPos.y + 3};
        for (let x=0; x<gameSetup.tankControllers.length; x++) {
          let t2 = gameSetup.tankControllers[x].tank;
          if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[x].inTestCase) continue;
          if (t2.color != tank.color) {
            const pos = {x: t2.position._x, y: t2.position._y - yBlock};
            const d = dist2(pos, spos);
            if (d < xBlock / 2 ) {
              hitTarget = true;
              // kill sehll and hit tank
              // serial killer won't be killed when hit tank and continue fly
              if (s.type === SPECIAL_WEAPON_TYPES.SERIAL_KILLER) {
                if (Array.isArray(s.hitTank)) {
                  const isTankHit = s.hitTank.includes(t2.tankID)
                  if (isTankHit) return;
                }
                // serial killer play explosion when hit tank
                this.playExplosion(pos.x, pos.y);
                if (!s.hitTank) {
                  s.hitTank = [];
                }
                s.hitTank.push(t2.tankID);
              } else {
                s.isDead = true;
                gameSetup.networkHandler.sendCommandToAll({
                  c: "KillShell", t: gameSetup.currentCycleTime, w: `${tank.tankID}_${s.shellID}`
                });
              }
              // shell damage base on special power damage
              if (s.type !== SPECIAL_WEAPON_TYPES.MATRIX
                && (s.type !== SPECIAL_WEAPON_TYPES.FREEZER || tank.color === 'white' || !t2.freeze) // red/blue tank can not shot blue/red tank when it's frozen
              ) {
                const damagePower = ((tank.specialPower || {}).damage || 0) + 1;
                let w = `${t2.tankID}_${180 * damagePower}`;
                if (t2.color == 'blue') {
                  // check if both red and blue are in the same spot! so we don't always hurt blue
                  for (let x=0; x<gameSetup.tankControllers.length; x++) {
                    if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[x].inTestCase) continue;
                    const t3 = gameSetup.tankControllers[x].tank;
                    if (t3.color == 'white') break;
                    if (t3.color == 'red') {
                      const d = dist2(t2.position, t3.position);
                      if ( d < cfg.TileSizeW * 0.05) {
                        if (Math.random() > 0.5) {
                          t2 = t3;
                          break;
                        }
                      }
                    }
                  }
                }
                if (s.type === SPECIAL_WEAPON_TYPES.FREEZER) {
                  w += '_FREEZE'
                } else if (s.type === SPECIAL_WEAPON_TYPES.SERIAL_KILLER) {
                  w += '_EXPLODE';
                }
                gameSetup.networkHandler.sendCommandToAll({
                  c: "HurtTank", t: gameSetup.currentCycleTime, w,
                });
              }
              break;
            }
          }
        }
      }
      // if the shell hit a tank, rock or tree, so the path is completed
      if (s.type === SPECIAL_WEAPON_TYPES.MISSILE && hitTarget) {
        const pathId = s.target.missilePathID;
        tank.missilePath[pathId].isCompleted = true;
      }

      if (s.type === SPECIAL_WEAPON_TYPES.MISSILE && !hitTarget) {
        const currentTarget = s.target;
        if (((s.dir === "U" || s.dir === "D") &&
        checkInRange(currentTarget.position.y, s.position.y, s.position.y - s.speedLimitY * s.speedY)) ||
        ((s.dir === "L" || s.dir === "R") &&
        checkInRange(currentTarget.position.x, s.position.x, s.position.x - s.speedLimitX * s.speedX)))  {
          const pathId = s.target.missilePathID;
          tank.missilePath[pathId].path.shift();
          const missilePath = tank.missilePath[pathId].path;
          const dir = missilePath[0];

          if (!dir) {

          } else if (dir != s.dir) {
            let shellID = this.findDeadShell(dir, SPECIAL_WEAPON_TYPES.MISSILE);
            gameSetup.networkHandler.sendCommandToAll({
              c: "S", t: gameSetup.currentCycleTime, w: `${this.tank.tankID}_${currentTarget.position.x}_${currentTarget.position.y}_${dir}_${shellID}_${SPECIAL_WEAPON_TYPES.MISSILE}_${pathId}_1`
            });
            gameSetup.networkHandler.sendCommandToAll({
              c: "KillShell", t: gameSetup.currentCycleTime, w: `${this.tank.tankID}_${s.shellID}_1`
            });
          } else {
            const { targetX, targetY} = this.findTheMissileTargetPosition(currentTarget.position, dir);

            s.target = {
              position: {
                x: targetX,
                y: targetY
              },
              missilePathID: pathId
            }
          }
        }
      }
      }
  }

  if (!hasLiveShell && this.isOwner && this.tank.specialWeapon.type == SPECIAL_WEAPON_TYPES.LASER_GUN) {
    this.interpretOrder("S")
  }
  return hasLiveShell;
};

TankController.prototype.findDirOfTarget = function(s) {
  const { tankID } = s.target;
  const { row, col } = this.calculateShellRowCol(s);
  const { TileCols, TileRows, TileSizeW, TileSizeH } = this.gameSetup.config;
  const tankTarget = this.gameSetup.tanks[tankID];
  let { row: tankRow, col: tankCol } = this.calculateShellRowCol(tankTarget);
  tankRow -= 1;
  if (row != tankRow && tankCol != col) {
    return;
  }

  if (row === tankRow) {
    return {
      dir: col > tankCol ? "L" : "R",
      x: tankTarget.position._x,
      y: tankTarget.position._y,
    }
  } else {
    return {
      dir: row > tankRow ? "U" : "D",
      x: tankTarget.position._x,
      y: tankTarget.position._y - TileSizeH,
    }
  }
}

// simple move using state, and check for pending state for update
TankController.prototype.moveAndTurnTank = function() {
  const t = this.tank;

  if (t.freeze) return;
  if (t.isDead) return;


  const cfg = this.gameSetup.config;

  const yBlock = cfg.TileSizeH;
  const xBlock = cfg.TileSizeW;



  if (t.pendingState) {
    // console.log("for pending state " + t.pendingState + " in state " + t.state + " compare x "  + t.position._x + " " + t.pendingX + " y " + t.position._y + " " + t.pendingY);
    if (eq(t.position._x, t.pendingX) && eq(t.position._y, t.pendingY)) {
      // console.log("do update pending state right now");
      t.state = t.pendingState;
      delete t.pendingState;
    }
  }


  // turn is easy to make!
  if (t.state.indexOf("U") >= 0 && t.frame != 2) { t.frame = 2; t.gotoAndStop(2);}
  if (t.state.indexOf("D") >= 0 && t.frame != 3) { t.frame = 3; t.gotoAndStop(3);}
  if (t.state.indexOf("L") >= 0 && t.frame != 0) { t.frame = 0; t.gotoAndStop(0);}
  if (t.state.indexOf("R") >= 0 && t.frame != 1) { t.frame = 1; t.gotoAndStop(1);}


  // if to be static, set speed to 0 and then nothing to do
  if (t.state.indexOf("P") == 0) {
    t.speedX = 0; t.speedY = 0;
    return;
    // if (isMultiple(t.position._y - yBlock / 2, yBlock) && isMultiple(t.position._x - xBlock / 2, xBlock)) {
    //   t.speedX = 0; t.speedY = 0;
    //   return;
    // } else {
    //   if (!isMultiple(t.position._y - yBlock / 2, yBlock)) {
    //     console.log("not multiple Y yet " + (t.position._y - yBlock / 2) + " vs " + yBlock);
    //   } else {
    //     console.log("not multiple X yet " + (t.position._x - xBlock / 2) + " vs " + xBlock);
    //   }
    // }
  }

  if ( t.state == "U" || t.state == "D") {
    if (t.state == "U") {t.speedY = -1; t.speedX = 0;}
    if (t.state == "D") {t.speedY =  1; t.speedX = 0;}

    if (t.hasPendingSpeedUpdate ) {
      if (isMultiple(t.position._y - yBlock / 2, yBlock) && isMultiple(t.position._x - xBlock / 2, xBlock)) {
        // let sratio = 1 / 60 * (DEFAULT_SPEED + t.specialPower.speed);
        // if (t.specialPower.speed == 5) {
        //   sratio = 1 / 9;
        // }
        // if (t.specialPower.speed == 6) {
        //   sratio = 1 / 8;
        // }
        let sratio = 1 / 20;
        if (t.specialPower.speed == 1) sratio = 1 / 18;
        if (t.specialPower.speed == 2) sratio = 1 / 17;
        if (t.specialPower.speed == 3) sratio = 1 / 16;
        if (t.specialPower.speed == 4) sratio = 1 / 15;
        if (t.specialPower.speed == 5) sratio = 1 / 14;
        if (t.specialPower.speed == 6) sratio = 1 / 13;
        t.speedLimitX = cfg.TileSizeW * sratio; // 2;
        t.speedLimitY = cfg.TileSizeH * sratio; // 2;
        t.hasPendingSpeedUpdate = false;
      }
    }

    if (isMultiple(t.position._y - yBlock / 2, yBlock)) {
      const row = Math.round((t.position._y - yBlock / 2) / yBlock);
      const col = Math.round((t.position._x - xBlock / 2) / xBlock);

      // need to check if can go there!
      if (t.speedY == 1 && this.gameSetup.maze && this.gameSetup.maze[row] && this.gameSetup.maze[row][col]) {
        t.speedY = 0;
        if (t.state.indexOf("P") < 0) t.state = "P" + t.state;
        return;
      }
      if (t.speedY == -1 && this.gameSetup.maze && this.gameSetup.maze[row-2] && this.gameSetup.maze[row-2][col]) {
        t.speedY = 0;
        if (t.state.indexOf("P") < 0) t.state = "P" + t.state;
        return;
      }

      let newparent = null;
      if (t.speedY == -1) {
        newparent = gameSetup.mazeLayers[row-2];
      } else {
        newparent = gameSetup.mazeLayers[row];
      }
      if (t.parent)
        t.parent.removeChild(t);
      newparent.addChild(t);
    }
  }


  if ( t.state == "L" || t.state == "R") {
    if (t.state == "L") {t.speedY =  0; t.speedX = -1;}
    if (t.state == "R") {t.speedY =  0; t.speedX = 1;}

    if (isMultiple(t.position._x - xBlock / 2, xBlock)) {
      const row = Math.round((t.position._y - yBlock / 2) / yBlock);
      const col = Math.round((t.position._x - xBlock / 2) / xBlock);

      // need to check if can go there!
      if (t.speedX == 1 && this.gameSetup.maze[row-1][col+1]) {
        t.speedX = 0;
        if (t.state.indexOf("P") < 0) t.state = "P" + t.state;
        return;
      }
      if (t.speedX == -1 && this.gameSetup.maze && this.gameSetup.maze[row-1] && this.gameSetup.maze[row-1][col-1]) {
        t.speedX = 0;
        if (t.state.indexOf("P") < 0) t.state = "P" + t.state;
        return;
      }
    }
  }

  t.position.x += t.speedLimitX * t.speedX;
  t.position.y += t.speedLimitY * t.speedY;
  this.updatePosition();
};



const isOpposite = (d1, d2) => {
  if (d1 == "U" && d2 == "D") return true;
  if (d1 == "D" && d2 == "U") return true;
  if (d1 == "L" && d2 == "R") return true;
  if (d1 == "R" && d2 == "L") return true;
  return false;
};

// move tank based on tank's state, current speed and if at stopping point
TankController.prototype.updateSpeedAndDir = function() {
  const t = this.tank;
  // first, if tank state is same as actual dir, do nothing
  // both can only be 1 of these 8: PU/PD/PL/PR U/D/L/R
  const actualDir = this.getTankDir();

  if (actualDir == t.state) {
    // console.log("updateSpeedAndDir actualDir " + actualDir + " equal " + t.state + " " + Date.now());
    return;
  }
  // console.log("updateSpeedAndDir actualDir  " + actualDir + " NOT " + t.state + " " + Date.now());

  // second, if stay paused but change dir, can change right away
  if (actualDir.indexOf("P") == 0 && t.state.indexOf("P") == 0) {
    // turn sprite right away but stay paused at speed 0
    console.log("turn while paused from " + actualDir + " to " + t.state);
    t.dir = t.state.substr(1,1); t.speedX = 0; t.speedY = 0;
    return;
  }

  // third, if state is moving but currently actually static, then change immediately
  if (actualDir.indexOf("P") == 0 && t.state.indexOf("P") < 0) {
    console.log("starting to move from " + actualDir + " to " + t.state);
    t.dir = t.state;
    if (t.state == "U") { t.speedY = -1; t.speedX = 0; }
    if (t.state == "D") { t.speedY = 1; t.speedX = 0; }
    if (t.state == "L") { t.speedY = 0; t.speedX = -1; }
    if (t.state == "R") { t.speedY = 0; t.speedX = 1; }
    return;
  }


  // forth, if moving to opposite direction, can do it any time!
  if (actualDir.indexOf("P") < 0 && t.state.indexOf("P") < 0) {
    t.dir = t.state;
    if (isOpposite(actualDir, t.state) || this.atCheckPoint()) {
      if (t.state == "U") { t.speedY = -1; t.speedX = 0; }
      if (t.state == "D") { t.speedY = 1; t.speedX = 0; }
      if (t.state == "L") { t.speedY = 0; t.speedX = -1; }
      if (t.state == "R") { t.speedY = 0; t.speedX = 1; }
    }
    return;
  }


  // fifth, currently moving, but want to pause, can change dir right away, but wait until full stop to pause
  if (actualDir.indexOf("P") < 0 && t.state.indexOf("P") == 0) {
    t.dir = t.state.substr(1,1);
    if (this.atCheckPoint()) {
      t.speedX = 0; t.speedY = 0;
    }
    return;
  }

};




TankController.prototype.getRandomTargetPos = function() {
  const cfg = this.game.config;
  return {
      x: Math.floor(Math.random() * cfg.TileWidth),
      y: Math.floor(Math.random() * cfg.TileHeight)
  };
};
//this.targetPos = this.getRandomTargetPos();

// TankController.prototype.runTankOrders = function() {
//     if (!this.isHost) return;
//     if (this.tankorders.length == 0) return;
//     const game = this.game;

//     // has new order, so need to change our forecast object map!

//     let executedID = -1;
//     let foundUnexecuted = false;
//     for (let k=0; k < this.tankorders.length; k++) {
//         const order = this.tankorders.get(k);
//         console.log("in runTankOrders " + JSON.stringify(order));
//         if (order.executed) {
//             // console.log("already executed " + JSON.stringify(order));
//             if (!foundUnexecuted) {
//                 executedID = k;
//             }
//             continue;
//         } else {
//             foundUnexecuted = true;
//             if (order.runt <= game.currentCycleTime) {
//                 order.executed = true;
//                 this.interpretOrder(order);
//             }
//         }
//     }
//     // trim
//     for (let k=0; k<=executedID; k++) {
//         this.tankorders.shift();
//     }
// }

TankController.prototype.getNextStoppingPoint = function(tank, dir) {
  const cfg = this.game.config;
  let nx = tank.hiddenState.x; let ny = tank.hiddenState.y;
  if (dir == "P") {
      if (nx % 60 != 30 || ny % 60 != 30) {
          return null;
      } else {
          const nc = (nx - 30 ) / 60;
          const nr = (ny - 30 ) / 60;
          return {
              nc, nr
          };
      }
  }

  if (dir == "D" && tank.hiddenState.y == cfg.TrueHeight - 30) {
      // debugger;
  }

  if (dir == "U" && tank.hiddenState.y <= 30) return null;
  if (dir == "D" && tank.hiddenState.y >= cfg.TrueHeight - 30) return null;
  if (dir == "L" && tank.hiddenState.x <= 30) return null;
  if (dir == "R" && tank.hiddenState.x >= cfg.TrueWidth - 30) return null;


  // if (tank.hiddenState.sX == 0 && tank.hiddenState.sY != 0) { // up or down
  if (dir == "U" || dir == "D") {
      if (tank.hiddenState.x % 60 !== 30) {
          return null;
      } else {



          // check if no more movement in that direction can be made
          const res = ny % 60;
          // console.log("up: ny is " + ny + " res is " + res);
          //if (tank.hiddenState.sY == -1 ) {
          if (dir == "U") {
              if (res > 30)
                  ny = ny - (res - 30);
              else {
                  ny = ny - (30 + res);
              }
          } else {
              if (res < 30)
                  ny = ny + (30 - res);
              else {
                  ny = ny + (60 - res) + 30;
              }
          }
          // console.log("up: new ny is " + ny);
      }
  }


  //if (tank.hiddenState.sX != 0 && tank.hiddenState.sY == 0) {
  if (dir == "L" || dir == "R") {
      if (tank.hiddenState.y % 60 !== 30) {
          // tank.pendingOrder = order;
          return null;
      } else {
          // check if no more movement in that direction can be made
          const res = nx % 60;
          if (dir == "L") {
              if (res > 30)
                  nx = nx - (res - 30);
              else {
                  nx = nx - (30 + res);
              }
          } else {
              if (res < 30)
                  nx = nx + (30 - res);
              else {
                  nx = nx + (60 - res) + 30;
              }
          }
      }
  }

  const nc = (nx - 30 ) / 60;
  const nr = (ny - 30 ) / 60;

  // console.log("tank nx ny nc nr is " + tank.ID + " " + tank.numID + " " + nx + " " + ny + " " + nc + " " + nr);

  return {
      nc, nr
  }
};

TankController.prototype.getCanGoIn = function(tank, nr, nc) {
  // return true;
  var canGoIn = true;
  if (tank.isFixed) return false;
  if (tank.team <= 1) {
      var base = game.allObjects["A" + (1 - tank.team)];

      var bc = (base.x - 30) / 60;
      var br = (base.y - 30) / 60;
      if (Math.abs(nc - bc) <= 2  && Math.abs(nr-br) <= 2) {
          if (tank.team !== base.team)
              canGoIn = false;
      }
  } else {

      var base = game.allObjects["A0"];
      var bc = (base.x - 30) / 60;
      var br = (base.y - 30) / 60;
      if (Math.abs(nc - bc) <= 2  && Math.abs(nr-br) <= 2) {
          canGoIn = false;
      } else {
          base = game.allObjects["A1"];
          bc = (base.x - 30) / 60;
          br = (base.y - 30) / 60;
          if (Math.abs(nc - bc) <= 2  && Math.abs(nr-br) <= 2) {
              canGoIn = false;
          }
      }
  }
  return canGoIn;
};



// // execute order to change our projection of tank.nr to tank.nnr,
// // and if it is changed, we need to broadcast that to all
TankController.prototype.interpretOrderOld = function(order) {
  const game = this.game;
  const cfg = game.config;
  // console.log("execute tank order " + JSON.stringify(order));
  // if (order.w.indexOf("TO") == 0) {
  //     order.w = "T" + order.w.substring(2);
  // }
  const tank = this.game.allObjects[order.w];

  const now = Date.now();
  if (order.c == "S") { // new shell from tank.r to tank.nr
    if (now > tank.lastShellTime + tank.shellInterval) {
      // debugger;
      const cmd = {
          c: "NEWSHELL", t: game.currentCycleTime, w: "", nx: tank.hiddenState.x, ny: tank.hiddenState.y, param: tank.team + ":" + tank.hiddenState.a, newID: "S" + (this.nextShellID ++) + "-" + tank.team
      };
      tank.lastShellTime = game.currentCycleTime;
      // console.log("set lastShellTime " + tank.ID + " " + tank.lastShellTime);
      this.game.networkHandler.sendShellCommandToAll(cmd);
      // tank.pendingOrder = null;
      order.executed = true;


      // create the shell immediately at hidden position
      // game.shellcontroller.createShell(tank.hx, tank.hy, tank.team, tank.hstate, tank.angle);

    } else {
        // TODO: order is invalid! do we need to send feedback to AI on this?
        // console.log("invalid shoot order since not long enough since last shoot");
        // tank.pendingOrder = null;
        order.executed = true; // will still cancel the order!
    }
    return false; // tank itself has not changed

  } else if (order.c == "MAGIC") {

      if (  (tank.hiddenState.x % 60 == 30) && (tank.hiddenState.y % 60 == 30) ) {

          // check if tank is just reborn!
          var base = game.allObjects['A' + tank.team];

          if (Math.abs(base.x - tank.hiddenState.x) <= 60 * 3 && Math.abs(base.y - tank.hiddenState.y) <= 60 * 3) {
              // just reborn, so don't apply!
              // debugger;
          } else {
              var id = null;
              if (order.magic == "FIREPOWER") {
                  if (tank.hiddenState.f < 4) {
                      tank.hiddenState.f ++;
                      id = game.rewardSound.play();
                  }
              }
              if (order.magic == "HEALTH") {
                  if (tank.hiddenState.h < 3) {
                      tank.hiddenState.h ++;
                      id = game.rewardSound.play();
                  }
              }
              if (order.magic == "SPEED") {
                  if (tank.hiddenState.s < 4) {
                      // console.log("! ! ! ! " + tank.ID + " speed up from " + tank.hiddenState.s);
                      tank.hiddenState.s ++;
                      id = game.rewardSound.play();
                  }
              }
              if (id != null) {
                  game.rewardSound.volume(2.0, id);
              }
          }

          order.executed = true;
          return true;
      }
      return false;
  } else if (order.c.indexOf("T") == 0) {
      // just turn
      if (order.c == "TU") tank.hiddenState.a = 0;
      if (order.c == "TD") tank.hiddenState.a = 180;
      if (order.c == "TL") tank.hiddenState.a = -90;
      if (order.c == "TR") tank.hiddenState.a = 90;
      order.executed = true;
      return true;
  } else if (order.c.indexOf("H") == 0) { // hit!
      if (tank.markedAsReborn) {
          // already reborn so ignore any new hits on old location
          order.executed = true;
          return false;
      } else {
          tank.hiddenState.h --;
          if (tank.hiddenState.h <= 0) {
              if (tank.team < 2) {

                  if (!tank.isFixed) {
                      // tank will be reborn
                      tank.markedAsReborn = true;

                      tank.hiddenState.x = tank.orighx;
                      tank.hiddenState.y = tank.orighy;
                      tank.hiddenState.h = cfg.TANK_START_HEALTH;
                      tank.hiddenState.a = tank.origAngle;
                      tank.hiddenState.s = tank.origSpeedLevel; // speed level
                      tank.hiddenState.sX = 0;
                      tank.hiddenState.sY = 0;
                      tank.hiddenState.f = cfg.TANK_START_FiREPOWER; // how long to wait before next shell
                      tank.hiddenState.r = 1;

                      tank.rebornTime = game.currentCycleTime;

                      game.startLifeSound.play();

                  }
              } else {
                  // tank.markedAsReborn = false;
                  // tank.hiddenState.r = 0;

                  game.tankcontroller.whiteTankCount --;

                  // create new magic reward if any
                  if (tank.magicReward != "NA") {
                      const cmd = {
                          c: "NEWMAGIC", t: game.currentCycleTime, w: tank.numID, nr: Math.round((tank.hiddenState.y-30)/60), nc: Math.round((tank.hiddenState.x-30)/60), param: tank.magicReward
                      };
                      this.game.networkHandler.sendMagicCommandToAll(cmd);

                  }

              }

              game.maphandler.clearAllMyID(tank.numID);

          } else {


          }
          order.executed = true;
          return true;
      }

  } else {

      // U D R L P
      const nextBlock = this.getNextStoppingPoint(tank, order.c);
      if (nextBlock == null) {
          // not at center line to turn or pause, so keep order pending, but can change facing angle already!
          // if (order.c == "U") tank.hiddenState.a = 0;
          // if (order.c == "D") tank.hiddenState.a = 180;
          // if (order.c == "L") tank.hiddenState.a = -90;
          // if (order.c == "R") tank.hiddenState.a = 90;

          if (tank.hiddenState.x % 60 == 30 && tank.hiddenState.y % 60 == 30) {
              order.executed = true; // won't keep this order open any more!
          } else {
              order.executed = false;
          }

          return true; // did change tank's hidden state!
      }

      if (order.c == "P") {
          tank.hiddenState.sX = 0;
          tank.hiddenState.sY = 0;
          order.executed = true;
          return true;
      }

      const nc = nextBlock.nc;
      const nr = nextBlock.nr;

      var canGoIn = this.getCanGoIn(tank, nr, nc);

      //if (game.maphandler.map[nr][nc] > 0 && game.maphandler.map[nr][nc] != tank.numID) {
      if (!canGoIn || game.maphandler.notMe(nr, nc, tank.numID)) {
          // blocked on movement, so just pause!
          // console.log("order blocked since blocked at " + nr + " " + nc + " order.c " + order.c + " " + tank.angle);


          // if (order.c != "P" && order.c != "") {
          //     // debugger;
          //     // if (order.c == "R" && tank.angle != 90) {
          //     //     tank.angle = 90;
          //     // }
          //     // if (order.c == "L" && tank.angle != -90) {
          //     //     tank.angle = -90;
          //     // }
          //     // if (order.c == "U" && tank.angle != 0) {
          //     //     tank.angle = 0;
          //     // }
          //     // if (order.c  == "D" && tank.angle != -180 && tank.angle != 180) {
          //     //     tank.angle = 180;
          //     // }
          //     tank.hstate = order.c;
          //     // tank.rotation = Math.PI / 180 * tank.angle;
          //     // console.log("changed angle to " + tank.angle + " " + tank.rotation);
          // } else {
          //     tank.hstate = "P";
          // }
          // tank.hstate = "P";
          // tank.hangle = 0;
          // if (order.c == "R") tank.hangle = 90;
          // if (order.c == "L") tank.hangle = -90;
          // if (order.c == "D") tank.hangle = 180;
          // tank.pendingOrder = null;

          if (order.c == "U") tank.hiddenState.a = 0;
          if (order.c == "D") tank.hiddenState.a = 180;
          if (order.c == "L") tank.hiddenState.a = -90;
          if (order.c == "R") tank.hiddenState.a = 90;

          // if at exact location, block it
          if (tank.hiddenState.x % 60 == 30 && tank.hiddenState.y % 60 == 30) {
              // debugger;
              tank.hiddenState.sX = 0;
              tank.hiddenState.sY = 0;
          }
          order.executed = true;
          return true;
      } else {
          game.maphandler.addObj(tank.numID, nr, nc);
          // console.log("set hstate to " + order.c);
          // tank.hstate = order.c;
          // console.log("^ ^ ^ old hidden sx " + tank.hiddenState.sX + " sy " + tank.hiddenState.sY);
          if (order.c == "P") {
              // tank.hiddenState.a = 0;
              tank.hiddenState.sX = 0;
              tank.hiddenState.sY = 0;
          }
          if (order.c == "U") {
              tank.hiddenState.a = 0;
              tank.hiddenState.sX = 0;
              tank.hiddenState.sY = -1;
          }
          if (order.c == "D") {
              tank.hiddenState.a = 180;
              tank.hiddenState.sX = 0;
              tank.hiddenState.sY = 1;
          }
          if (order.c == "L") {
              tank.hiddenState.a = -90;
              tank.hiddenState.sX = -1;
              tank.hiddenState.sY = 0;
          }
          if (order.c == "R") {
              tank.hiddenState.a = 90;
              tank.hiddenState.sX = 1;
              tank.hiddenState.sY = 0;
          }

          if (order.targetR) {
              tank.hiddenState.targetR = order.targetR;
              tank.hiddenState.targetC = order.targetC;
          }

          // console.log("^ ^ ^ new hidden sx " + tank.hiddenState.sX + " sy " + tank.hiddenState.sY);
          // tank.hiddenState.x += tank.hiddenState.s * tank.hiddenState.sX;
          // tank.hiddenState.y += tank.hiddenState.s * tank.hiddenState.sY;
          order.executed = true;
          return true;
      }

  }
};

// var explodeTank = function(game, tank) {
//     // const tank = this.tank;
//     if (tank.hasProtection) {
//         tank.executedCommands.push(cmd);
//         cmd.executed = true;
//         return;
//     }
//     game.addExplosion(tank.x, tank.y, true);
//     tank.health --;
//     if (tank.health <= 0) {
//         tank.destroy();
//         tank.healthtext.destroy();
//         if (tank.shield)
//             tank.shield.destroy();

//         // game over if player tank is dead
//         // if (tank.ID == "T0") {
//         //     game.winner = "Red";
//         //     FSM.showExitScreen();
//         //     return;
//         // } else if (tank.ID == "T1") {
//         //     game.winner = "Blue";
//         //     FSM.showExitScreen();
//         //     return;
//         // }

//         if (tank.magicCircle) {
//             tank.magicCircle.destroy();
//             tank.magicTween.stop();

//             // add new magic power sprite
//             game.addMagicPowerIcon(tank.x, tank.y, tank.magicReward);
//         }
//     } else {
//         tank.healthtext.setText("" + tank.health);
//     }
// };

var fixcnt = 1;



TankController.prototype.greyAITanks = function() {
  const cfg = this.game.config;
  const game = this.game;

  const poslist = [];

  const timenow = getMS();

  for(let i=0; i<this.tanks.length; i++) {
      if (UsePool) { if (i >= this.tankPool.marker) break; }
      const tank = this.tanks[i];
      if (tank.team == 2) {
          tank.tint = 0x808080;
      }
  }
};









const TankWarGame = function (gameSetup) {
  // create the root of the scene graph
  // const PathPoolGameObj = this;
  const that = this;
  const tankWarGame = this;


  let tablerenderer, ballrenderer, overlayrenderer, overlayrenderer2,  controlrenderer, pixicontrolrendererexit, pixirenderertestresult;
  const unitScale = 1;

  // gameSetup.mainstage = new PIXI.Container(); // pool table and overlay message
  // gameSetup.overlaystage = new PIXI.Container(); // menu on top
  // gameSetup.exitStage = new PIXI.Container();
  // gameSetup.testResultStage = new PIXI.Container();

  const isHost = gameSetup.isHost;
  this.isHost = isHost;

  gameSetup.allObjects = {}; // used to store physics body of tank at all players
  gameSetup.allMesh = {}; // used to store mesh of tank
  gameSetup.allObjects2 = {}; // used to store physics body of copy of tank for local forecast lines at all players


  // may not need it if we only send commands across peer network and run locally
  // gameSetup.cachedHostTimes = new CBuffer(30);
  // gameSetup.cachedUpdates = new CBuffer(30);
  gameSetup.currentCycleInd = 0;
  let star = null;


  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    document.getElementById('gameDiv').innerHTML = "";
    return;
  }


  // - Global variables -
  let container;
  let textureloaded = false;
  let scene, renderer, views, rtTexture;
  const tanks = {};


  this.setupConfig = () => {
    window.isWaitingForAllStop = false;
    const mazeSize = gameSetup.difficulty === ADVANCED ? MAZE_SIZE.ADVANCED : MAZE_SIZE.BEGINNER;

    const cfg = {
      TrueWidth: 64 * mazeSize, TrueHeight: 64 * (0.5 + Math.sqrt(0.5) * mazeSize),
      TileSizeW: 64,      TileSizeH:  64 * Math.sqrt(0.5),
      TileCols: mazeSize, TileRows: mazeSize, scalingratio: 7
    };
    cfg.mazeW = cfg.TrueWidth;
    cfg.mazeH = cfg.TrueHeight;

    gameSetup.config = cfg;
    // cfg.mazeW = cfg.TileSize * 20;
    // cfg.mazeH = cfg.mazeW * 0.75;
    // const whratio = cfg.TrueWidth / cfg.TrueHeight; // width vs height
    // const oldnewratio = cfg.TrueWidth / 1600; // new vs old true width


    cfg.mazeCenterX = cfg.TrueWidth / 2; //cfg.mazeW / 2 + cfg.metalBorderThick;
    cfg.mazeCenterY = cfg.TrueHeight / 2;


    // console.log('set player info');

    // since in pool game there are always only 2 players, we can simply
    // ungroup gameSetup.playerInfo into 2 playerInfo objects
    const numberOfPlayers = gameSetup.playerInfo.length;
    const playerPanelNames = [];
    gameSetup.numberOfPlayers = numberOfPlayers;
    //cccc: change to assume 2 peers
    gameSetup.mazeReady = Array(2).fill(false);
    for (let i = 0; i < gameSetup.numberOfPlayers; i++) {
      const pi = gameSetup.playerInfo[i];
      const playerPanelName = `playerPanel${i + 1}`;
      playerPanelNames.push(playerPanelName);
      if (!pi.userId) {
        gameSetup.mazeReady[pi.slot] = true;
      }
    }
    gameSetup.playerPanelNames = playerPanelNames;

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      gameSetup.activePlayerInfo = gameSetup.playerInfo[0];
    }



    gameSetup.initialTimeSeconds = 300;
    if (gameSetup.difficulty >= ADVANCED) {
      gameSetup.initialTimeSeconds = 600; // bbbbb
    }
    // gameSetup.initialTimeSeconds = 1;

    cfg.localPlayerID = Meteor.userId();
  };

  this.restartGame = function () {
    window.location.reload();
  };

  this.createController = () => {
    const config = gameSetup.config;

    let isTesting = false;
    let isMatch = false;
    let isPractice = false;
    let isTournament = false;

    // bigger means less random!
    gameSetup.Randomness = 3000000; //3000000;//1500000;


    if (gameSetup.gameType === TankGame.MATCH) {
      isMatch = true;
    } else if (gameSetup.gameType === TankGame.PRACTICE) {
      isPractice = true;
    } else if (gameSetup.gameType === TankGame.TESTING) {
      isTesting = true;
    } else if (gameSetup.gameType === TankGame.TOURNAMENT) {
      isTournament = true;
    }


    const GameController = function () {

      this.gameState = GAME_ONGOING;
      this.setState = (p) => {
        this.gameState = Number(p);
        this.enterState(p);
      };




      this.enableGUIInputs = () => {
        if (gameSetup.gameType == GAME_TYPE.TESTING) return;

        // console.log("enableGUIInputs " + this.gameState);
        if (!gameSetup.controlButtons) return;
        gameSetup.controlButtons.forEach((btn) => {
          btn.interactive = true;
          btn.tint = 0xffffff;
        });
        // gameSetup.strikeButton.tint = 0xffffff;
      };

      this.disableGUIInputs = () => {
        // return; // aaaa
        if (gameSetup.gameType == GAME_TYPE.TESTING) return;
        // console.log("disableGUIInputs " + this.gameState);
        const grey = 0x606060;
        if (!gameSetup.controlButtons) return;
        gameSetup.controlButtons.forEach((btn) => {
          btn.interactive = false;
          btn.tint = grey;
        });
        if (this.gameState == GAME_OVER_STATE || (gameSetup.activePlayerInfo && !gameSetup.activePlayerInfo.isLocal)) {
          // gameSetup.hitButton.tint = 0x606060;
          //gameSetup.
          // console.log("game over or not local so return disabled");
          return;
        }

        if (this.gameState != CUEBALL_IN_HAND && this.gameState != BREAK_CUEBALL_IN_HAND_STATE) {
          // gameSetup.hitButton.tint = 0x606060;
        } else {
          if (gameSetup.gameType != GAME_TYPE.TESTING) {
            // gameSetup.toggleHitButton(false);
            // gameSetup.strikeButton.tint = 0xffffff;
            // gameSetup.stage.interactive = true;
            // gameSetup.strikeButton.interactive = true;
          }
        }
      };



      this.createWorldForPlayer = function() {
        WorldForPlayer.level = gameSetup.difficulty;
        WorldForPlayer.TrueWidth = config.TrueWidth;
        WorldForPlayer.TrueHeight = config.TrueHeight;
        WorldForPlayer.TileCols = config.TileCols;
        WorldForPlayer.TileRows = config.TileRows;
        WorldForPlayer.PlayerInfo = {};
        WorldForPlayer.tankWidth = FULL_TANK_WIDTH;
        WorldForPlayer.tankHeight = FULL_TANK_HEIGHT;
        WorldForPlayer.TileWidth = config.TileSizeW;
        WorldForPlayer.TileHeight = config.TileSizeH;
        WorldForPlayer.MAX_POWER = gameSetup.difficulty === BEGINNER ? MAX_POWER_BEGINNER : MAX_POWER_ADVANCED;
        WorldForPlayer.SPECIAL_WEAPON_TYPES = SPECIAL_WEAPON_TYPES;
        WorldForPlayer.lastEndGameRockPos = gameSetup.lastEndGameRockPos;
        WorldForPlayer.secondsLeft = gameSetup.secondsLeft;

        for(let i = 0; i < gameSetup.numberOfPlayers; i++) {
          const playerInfo = gameSetup.playerInfo[i];
          WorldForPlayer.PlayerInfo[playerInfo.ID] = {};
        }

        WorldForPlayer.tanks = [];
        for (let k=0; k<gameSetup.tanks.length; k++) {
          const t = gameSetup.tanks[k];
          if (!t || t.position.x < 0 || t.position.y < 0) continue;
          const newt = {
            x: t.position.x,
            y: t.position.y,
            shells: [],
            tankID: t.tankID,
            color: t.color,
            health: t.health,

            state: t.state,
            dir: t.dir,
            speedX: t.speedX,
            speedY: t.speedY,

            // actaul moving speed: 2 block per second at starting level
            speedLimitX: t.speedLimitX,
            speedLimitY: t.speedLimitY,

            freeze: t.freeze,
          }
          if (newt.color !== "white") {
            newt.reloadTime = t.reloadTime;
            newt.powerPoint = t.powerPoint;
            newt.specialWeapon = t.specialWeapon;

            newt.specialPower = {
              damage: t.specialPower.damage,
              reload: t.specialPower.reload,
              speed: t.specialPower.speed,
              healthRegen: t.specialPower.healthRegen
            };
          } else {
            newt.specialPower = {
              damage: t.specialPower.damage,
            };
          }
          newt.tankID = t.tankID;
          newt.shells = [];
          WorldForPlayer.tanks.push(newt);
        };

        WorldForPlayer.crystals = [];
        for (let z = 0; z < gameSetup.crystals.length; z += 1) {
          const c = gameSetup.crystals[z];
          if (c.position.x > 0 && c.position.y > 0 && !c.isUsed) {
            WorldForPlayer.crystals.push({ x: c.position.x, y: c.position.y });
          }
        }

        WorldForPlayer.weapons = [];
        for (let y = 0; y < gameSetup.weapons.length; y += 1) {
          const w = gameSetup.weapons[y];
          if (w.position.x > 0 && w.position.y > 0 && !w.isUsed) {
            WorldForPlayer.weapons.push({ x: w.position.x, y: w.position.y, type: w.type });
          }
        }
        // maze info
        WorldForPlayer.tilemap = gameSetup.tilemap;
        WorldForPlayer.maze = gameSetup.maze;
      };


      this.updateWorld = () => {
        for (let i = 0; i< gameSetup.numberOfPlayers; i++) {
          const playerInfo = gameSetup.playerInfo[i];
          WorldForPlayer.PlayerInfo[playerInfo.ID].health = playerInfo.health;
          WorldForPlayer.PlayerInfo[playerInfo.ID].powerPoint = playerInfo.powerPoint;
        }

        WorldForPlayer.tilesRemoved = gameSetup.tilesRemoved;
        WorldForPlayer.tilesAdded = gameSetup.tilesAdded;
        WorldForPlayer.lastEndGameRockPos = gameSetup.lastEndGameRockPos;
        WorldForPlayer.secondsLeft = gameSetup.secondsLeft;

        WorldForPlayer.crystals = [];
        for (let z = 0; z < gameSetup.crystals.length; z += 1) {
          const c = gameSetup.crystals[z];
          if (c.position.x > 0 && c.position.y > 0 && !c.isUsed) {
            WorldForPlayer.crystals.push({ x: c.position.x, y: c.position.y });
          }
        }

        WorldForPlayer.weapons = [];
        for (let y = 0; y < gameSetup.weapons.length; y += 1) {
          const w = gameSetup.weapons[y];
          if (w.position.x > 0 && w.position.y > 0 && !w.isUsed) {
            WorldForPlayer.weapons.push({ x: w.position.x, y: w.position.y, type: w.type });
          }
        }

        WorldForPlayer.tanks = [];

        for (let k=0; k<gameSetup.tanks.length; k++) {
          const t = gameSetup.tanks[k];
          if (!t || t.position.x < 0 || t.position.y < 0) continue;
          const newt = {
            x: t.position.x,
            y: t.position.y,
            shells: [],
            tankID: t.tankID,
            color: t.color,

            state: t.state,
            dir: t.dir,
            speedX: t.speedX,
            speedY: t.speedY,
            health: t.health,

            // actaul moving speed: 2 block per second at starting level
            speedLimitX: t.speedLimitX,
            speedLimitY: t.speedLimitY,

            freeze: t.freeze,
          }
          if (newt.color !== "white") {
            newt.reloadTime = t.reloadTime;
            newt.powerPoint = t.powerPoint;
            newt.specialWeapon = t.specialWeapon;

            newt.specialPower = {
              damage: t.specialPower.damage,
              reload: t.specialPower.reload,
              speed: t.specialPower.speed,
              healthRegen: t.specialPower.healthRegen
            };
          } else {
            newt.specialPower = {
              damage: t.specialPower.damage,
            };
          }

          if (t.shells.length > 0) {
            newt.shells = [];
            for (let j=0; j<t.shells.length; j++) {
              newt.shells.push({
                x: t.shells[j].position._x, y: t.shells[j].position._y, dir: t.shells[j].dir,
                shellID: t.shells[j].shellID, isDead: t.shells[j].isDead,
                speedX: t.shells[j].speedLimitX * t.shells[j].speedX,
                speedY: t.shells[j].speedLimitY * t.shells[j].speedY,
              })
            }
          }
          WorldForPlayer.tanks.push(newt);
        };
        // clean up after send info to player
        //gameSetup.tilesRemoved = '';
        //gameSetup.tilesAdded = '';

      };



      this.trySelectPlayer = () => {
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          if (gameSetup.activePlayerInfo == null) {
            gameSetup.activePlayerInfo = gameSetup.playerInfo[0];
            // if (gameSetup.initializationCallBack) {
            //   gameSetup.initializationCallBack();
            // } else {
            //   console.log("initializationCallBack not defined");
            // }
            return;
          }
        }
        // console.log("activePlayerInfo not null? " + gameSetup.allInitialized + " " + gameSetup.activePlayerInfo);
        if ((gameSetup.isLocal || gameSetup.peerReadys[0]) && gameSetup.activePlayerInfo == null) {
          if (gameSetup.isHost) {
            // console.log("host try select active player");

            // main entry point to kick off the state machine
            if (gameSetup.resumeCommands) {
              this.resetTableAndStart();
            } else {
              this.chooseActivePlayerToStart();
            }
          }
        }
      };

      this.tickUpdate = () => {
        const cfg = gameSetup.config;
        let noLiveShells = true;

        if (gameSetup.gameType != GAME_TYPE.TESTING) {
          gameSetup.controller.updateWorld();
          for (let k = 0; k < gameSetup.playerInfo.length; k++) {
            const pi = gameSetup.playerInfo[k];
            pi.isLocal = gameSetup.config.localPlayerID === pi.userId || gameSetup.config.localPlayerID === pi.playerCodeOwner
            if (pi.playerType != "AI") continue;
            if (!pi.isLocal && !pi.localInput) continue;
            if (pi.tank && pi.tank.isDead) continue;
            gameSetup.controller.updateWorld();
            if (!('waitingForReply' in pi.playerWorker) || !pi.playerWorker.waitingForReply) {
              ///////////////////////
              // console.log(`worker sending a cmd ${m.cmd}, and waiting for reply ... `);
              pi.playerWorker.waitingForReply = true;
              pi.playerWorker.sendMessage({
                'cmd': CMD_GET_COMMAND,
                'world': WorldForPlayer
              });
            }
          }
        }

        for (let k=0; k<gameSetup.tankControllers.length; k++) {
          const c = gameSetup.tankControllers[k];
          if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[k].inTestCase) continue;
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            if (!window.waitForTickUpdateDoneCount || window.waitForTickUpdateDoneCount < 0) {
              break;
            }
          }
          let hasLiveShell = c.moveAndCheckShells();
          if (c.tank.isDead) continue;
          if (hasLiveShell) noLiveShells = false;
          c.moveAndTurnTank();

          if (gameSetup.isHost || gameSetup.isLocal) {
            if (c.tank.color == "white" && c.tank.systemAI) {
              if (gameSetup.gameType == GAME_TYPE.TESTING) {
                if (window.waitForTickUpdateDoneCount > 0) {
                  c.tank.systemAI.generateOrder();
                }
              } else {
                c.tank.systemAI.generateOrder();
              }
            }
          }
          const { tank } = c;
          if (tank.color !== "white") {
            const time = Date.now();
            const { health, fullHealth } = tank;
            // new update: no health regen in end-game mode!
            if (gameSetup.secondsLeft > 0 && health < fullHealth) {
              if (!tank.lastHealthRegenTime) {
                // time === last time tank was shot
                tank.lastHealthRegenTime = time;
              }
              if (time - tank.lastHealthRegenTime >= 500) {
                const { specialPower = {} } = tank;
                const { healthRegen = 0 } = specialPower;
                const healthToRegen = 60 * 2 * (1 + healthRegen);
                const newHealth = Math.min(fullHealth, health + healthToRegen);
                if (health !== newHealth) {
                  tank.lastHealthRegenTime = time;
                  c.updateHealth(newHealth);
                }
              }
            } else {
              delete tank.lastHealthRegenTime;
            }
          }
        }

        // check special weapon
        for (let k = 0; k < gameSetup.playerInfo.length; k += 1) {
          const pi = gameSetup.playerInfo[k];
          const { ID } = pi;
          if (!gameSetup.tankControllers[ID]) continue;
          if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[ID].inTestCase) continue;
          const { tank } = gameSetup.tankControllers[ID];
          // const tank = pi.playerWorker ? pi.playerWorker.tank : null;
          const specialWeapon = tank ? tank.specialWeapon : null;
          if (specialWeapon && specialWeapon.type !== null
            && specialWeapon.pickAt !== null
            && gameSetup.currentCycleTime - specialWeapon.pickAt >= 20000
          ) {

            // if (tank.specialWeapon.type === SPECIAL_WEAPON_TYPES.MISSILE) {
            //   tank.crossTarget.position.x = 10000;
            // }
            tank.specialWeapon = {
              type: null,
              pickAt: null
            }
          }
        }

        if (window.waitForTickUpdateDoneID ) {
          if (isTesting) {
            window.waitForTickUpdateDoneCount --;
            if (window.waitForTickUpdateDoneCount < 0) {
              /*for(let z = 0; z < gameSetup.tanks.length; z += 1) {
                gameSetup.tanks[z].isDead = true;
              }
              gameSetup.controller.updateWorld();*/
              if (gameSetup.activePlayerInfo.playerWorker) {
                gameSetup.activePlayerInfo.playerWorker.sendMessage({
                  'cmd': CMD_SCRIPT_SETUP_TICK_UPDATE,
                  'world': WorldForPlayer,
                  'resolveID': window.waitForTickUpdateDoneID
                });
              }
              delete window.waitForTickUpdateDoneID;
              delete window.waitForTickUpdateDoneCount;
              return;
            } else {
              gameSetup.controller.updateWorld();
              for (let k=0; k<gameSetup.playerInfo.length; k++) {
                if (!gameSetup.tankControllers[k]) continue;
                if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[k].inTestCase) continue;
                if (gameSetup.tankControllers[k].tank.color == "white") continue;
                if (gameSetup.tankControllers[k].tank.isDead) continue;
                if (gameSetup.tankControllers[k].tank.noAI) continue;
                const pw = gameSetup.playerInfo[k].playerWorker;
                if (pw && (!('waitingForReply' in pw) || !pw.waitingForReply)) {
                  ///////////////////////
                  // console.log(`worker sending a cmd ${m.cmd}, and waiting for reply ... `);
                  pw.waitingForReply = true;
                  pw.sendMessage({
                    'cmd': CMD_GET_COMMAND,
                    'world': WorldForPlayer,
                  });
                }
              }
            }
          }
        }

        if (noLiveShells && window.waitForAllShellsExplodeResolveID ) {
          if (isTesting) {
            gameSetup.controller.updateWorld();
            gameSetup.activePlayerInfo.playerWorker.sendMessage({
              'cmd': CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE,
              'world': WorldForPlayer,
              'resolveID': window.waitForAllShellsExplodeResolveID
            });
            delete window.waitForAllShellsExplodeResolveID;
            return;
          }
        }

        if (gameSetup.isHost || gameSetup.isLocal) {

          const yBlock = cfg.TileSizeH;
          const xBlock = cfg.TileSizeW;

          // check crystals
          for (let j=0; j<gameSetup.crystals.length; j++) {
            const c = gameSetup.crystals[j];
            if (c.isUsed) continue;
            const cpos = {x: c.position._x, y: c.position._y};
            let tankWinner = null; let shortestDist = 10000;
            for (let k=0; k<gameSetup.tankControllers.length; k++) {
              const t = gameSetup.tankControllers[k];
              if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[k].inTestCase) continue;
              if (t.tank.isDead) continue;
              if (t.tank.color == "white") continue;

              const pos = {x: t.tank.position._x, y: t.tank.position._y};
              const d = dist2(pos, cpos);
              if (d < xBlock / 2 && d < shortestDist ) {
                tankWinner = t.tank;  shortestDist = d;
              }
            }

            if (tankWinner) {
              c.isUsed = true;

              gameSetup.networkHandler.sendCommandToAll({
                c: "TankGainCrystal", t: gameSetup.currentCycleTime, w: `${tankWinner.tankID}_${c.crystalID}`
              });
            }
          }

          // check weapons
          for (let j = 0; j<gameSetup.weapons.length; j++) {
            const weapon = gameSetup.weapons[j];
            if (weapon.isUsed) continue;
            if (gameSetup.currentCycleTime - weapon.createdAt >= 20000 && weapon.alpha !== 0.4) {
              gameSetup.networkHandler.sendCommandToAll({
                c: CHANGE_WEAPON_ALPHA_CMD, t: gameSetup.currentCycleTime, w: `${j}_${0.4}`
              });
            } else if (gameSetup.currentCycleTime - weapon.createdAt >= 30000) {
              // weapon.isUsed = true;
              // weapon.position.x = -10000;
              gameSetup.networkHandler.sendCommandToAll({
                c: REMOVE_WEAPON_ALPHA_CMD, t: gameSetup.currentCycleTime, w: `${j}`
              });
            }
            const wpos = {x: weapon.position._x, y: weapon.position._y};
            let tankWinner = null;
            let shortestDist = 10000;
            for (let k=0; k<gameSetup.tankControllers.length; k++) {
              const t = gameSetup.tankControllers[k];
              if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[k].inTestCase) continue;
              if (t.tank.isDead) continue;
              if (t.tank.color == "white") continue;

              const pos = {x: t.tank.position._x, y: t.tank.position._y};
              const d = dist2(pos, wpos);
              if (d < xBlock / 2 && d < shortestDist ) {
                tankWinner = t.tank;  shortestDist = d;
              }
            }

            if (tankWinner) {
              weapon.isUsed = true;
              gameSetup.networkHandler.sendCommandToAll({
                c: "TankGainWeapon", t: gameSetup.currentCycleTime, w: `${tankWinner.tankID}_${weapon.weaponID}`
              });
            }
          }


          // find winner
          if (gameSetup.gameType != GAME_TYPE.TESTING) {
            const playerAliveTank = gameSetup.tankControllers.filter(({ tank }) => tank.health > 0 && tank.color !== 'white');
            const blueAliveTank = playerAliveTank.filter(({ tank }) => tank.color === 'blue');
            const redAliveTank = playerAliveTank.filter(({ tank }) => tank.color === 'red');
            const blueAliveTankCount = blueAliveTank.length;
            const redAliveTankCount = redAliveTank.length;
            if (blueAliveTankCount === 0 && redAliveTankCount > 0) {
              const w = gameSetup.numberOfPlayers > 2 ? 't:Red' : `p:${gameSetup.playerInfo.find(p => p.teamID == 1).username}`;
              gameSetup.networkHandler.sendCommandToAll({
                c: "WINNER", t: gameSetup.currentCycleTime, w
              });
            } else if (redAliveTankCount === 0 && blueAliveTankCount > 0) {
              const w = gameSetup.numberOfPlayers > 2 ? 't:Blue' : `p:${gameSetup.playerInfo.find(p => p.teamID == 0).username}`
              gameSetup.networkHandler.sendCommandToAll({
                c: "WINNER", t: gameSetup.currentCycleTime, w
              });
            } else if (gameSetup.allTankInEndRock) {
              let redTankHealthSum = 0;
              let blueTankHealthSum = 0;
              for (let i = 0; i < redAliveTankCount; i++) {
                redTankHealthSum += redAliveTank[i].tank.health;
              }
              for (let i = 0; i < blueAliveTankCount; i++) {
                blueTankHealthSum += blueAliveTank[i].tank.health;
              }
              const w = redTankHealthSum > blueTankHealthSum ? 'Red' :
              (redTankHealthSum < blueTankHealthSum ? 'Blue' : 'Blue & Red');
              gameSetup.networkHandler.sendCommandToAll({
                c: "WINNER", t: gameSetup.currentCycleTime, w
              });
            }
          }

          let whiteTankCount = 0;
          for (let k=0; k<gameSetup.tankControllers.length; k++) {
            if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[k].inTestCase) continue;
            if (!gameSetup.tankControllers[k].tank.isDead && gameSetup.tankControllers[k].tank.color == "white") {
              whiteTankCount ++;
            }
          }

          let whiteTankLimit = 10;
          if (gameSetup.difficulty == ADVANCED) {
            whiteTankLimit = 14;
          }

          let increaseWhiteTank = 3 * (gameSetup.playerInfo.length  - 2);

          whiteTankLimit += increaseWhiteTank;

          const whiteTankGap = Math.max(0, whiteTankLimit - whiteTankCount);
          const whiteTankProb = 1 / Math.max(120, 300 - whiteTankGap * 25);

          // create new white tanks
          if (whiteTankCount < whiteTankLimit && gameSetup.gameType != GAME_TYPE.TESTING && Math.random() > 1 - (whiteTankProb)) {
            let newPoint = gameSetup.gameEngine.getNewEmptyBlock();

            // find a dead white tank to reuse
            let tankID = gameSetup.tankControllers.length;
            for (let k=0; k<gameSetup.tankControllers.length; k++) {
              if (gameSetup.tankControllers[k].tank.isDead && gameSetup.tankControllers[k].tank.color == "white") {
                tankID = k; break;
              }
            }
            gameSetup.networkHandler.sendCommandToAll({
              c: "NewWhiteTank", t: gameSetup.currentCycleTime, w: `${tankID}_${newPoint.r}_${newPoint.c}`
            });
          }


        }


        // this.updateGameWorld();
      };





      const modalItems = [];
      modalItems.push({
        type: 'modalRestartConfirm',
        content: 'Are you sure you want to restart game?',
      });


      modalItems.push({
        type: 'modalExitConfirm',
        content: 'Are you sure you want to exit game?',
      });

      modalItems.push({
        type: 'modalQuitConfirm',
        content: 'Are you sure you want to quit game?',
      });


      const bc = 0x202020;
      const fs = 52;
      const fc = '0x49FFFE';
      const oy = -100;
      // console.log('build messages');
      for (let playerID = 1; playerID <= 2; playerID++) {
        // let info = gameSetup.playerInfo1;
        // thanhdat
        let info = {
          playerID: "Red team"
        };


        // if (playerID === 2) { info = gameSetup.playerInfo2; }
        if (playerID === 2) {
          info = {
            playerID: "Blue team"
          }
        }


        for (let colorTypeID = 0; colorTypeID <= 4; colorTypeID++) {
          let m = {
            type: `modal_${playerID}_CallShot${colorTypeID}`,
            content: `${info.playerID} to shoot ${ColorTypeString[colorTypeID]} tank`,
          };
          modalItems.push(m);

          m = {
            type: `modal_${playerID}_NotFirstTouch${colorTypeID}`,
            content: `${ColorTypeString[colorTypeID]} tank was not the first tank touched`,
          };
          modalItems.push(m);


          m = {
            type: `modal_${playerID}_GreatShotChosen${colorTypeID}`,
            content: `Great shot! ${ColorTypeString[colorTypeID]} tanks are chosen`,
          };
          modalItems.push(m);
        }

        modalItems.push({
          type: `modal_${playerID}_CueballInHand`,
          content: `${info.playerID} to place cue tank on table`,
        });

        modalItems.push({
          type: `modal_${playerID}_NoBallTouched`,
          content: 'no object tank was touched',
        });

        modalItems.push({
          type: `modal_${playerID}_CueballPocketed`,
          content: 'cue tank was pocketed',
        });

        modalItems.push({
          type: `modal_${playerID}_BlackballPocketedBreak`,
          content: `black tank was pocketed in break shot`
        });

        modalItems.push({
          type: `modal_${playerID}_BlackballPocketedNoTarget`,
          content: 'black tank was pocketed though it\'s not the target',
        });

        modalItems.push({
          type: `modal_${playerID}_WonGame`,
          content: `Bravo! ${info.playerID} has won the game!`,
        });

        modalItems.push({
          type: `modal_${playerID}_BlackBallPocketedWrong`,
          content: 'black tank was pocketed into the wrong pocket!',
        });

        modalItems.push({
          type: `modal_${playerID}_CueballPocketedWithBlack`,
          content: 'cue tank was pocketed along with the black tank!',
        });

        modalItems.push({
          type: `modal_${playerID}_AtLeast4Rail`,
          content: 'less than 4 tanks touched cushions',
        });

        modalItems.push({
          type: `modal_${playerID}_NoTargetPocket`,
          content: 'No target tank or pocket indicated',
        });

        modalItems.push({
          type: `modal_${playerID}_GreatShot`,
          content: 'Great shot!',
        });


        modalItems.push({
          type: `modal_${playerID}_NiceTry`,
          content: 'Nice try! Maybe next time..',
        });

        modalItems.push({
          type: `modal_${playerID}_NoBallHitRailsAfter`,
          content: 'No tank hit the cushions after cue tank initial hit',
        });

        modalItems.push({
          type: `modal_${playerID}_NoBallPocketed`,
          content: 'Unfortunately no tank was pocketed.',
        });

        modalItems.push({
          type: `modal_${playerID}_BreakShot`,
          content: `${info.playerID} to take the break shot`,
        });

        modalItems.push({
          type: `modal_${playerID}_CueBallPlaced`,
          content: `Cue tank was successfully placed by ${info.playerID}`,
        });
      }

      this.actuallyDoPlaceCueball = (x, y) => {
        cueballInHand = false;
        // console.log("actuallyDoPlaceCueball " + x + " " + y);

        const cb = gameSetup.ballsByID[0];
        cb.body.inPocketID = null;
        cb.inPocket = false;
        const testtarget = new Victor(x, y);
        if (!gameSetup.controller.checkIfCollidingBall(testtarget)) {
          resetBall(cb, x, y);
        } else {
          // user input is not good, so we just find one place for user
          gameSetup.controller.replaceCueBallNoCollision(cb);
        }

        // resetBall(gameSetup.cueball, x, y);
        // if (this.gameState == BREAK_CUEBALL_IN_HAND_STATE)
        //   this.setState(BREAK_SHOT_STATE);
        // else
        //   this.setState(CALL_SHOT_STATE);
        // getPlayerActionMessage(false, 'CueBallPlaced');

        // decouple state transition from cue tank placement
        // if I'm the active player
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          // notify robot that this is done

        } else {
          if (gameSetup.activePlayerInfo.isLocal) {
            if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE)
              this.setNewPlayerState(gameSetup.activePlayerInfo.ID, BREAK_SHOT_STATE); //, -1, x, y);
            else
              this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE); //, -1, x, y);
          }
        }
      };

      this.saveCommand = (cmdstr) => {
        // Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
      };

      this.planToPlaceCueball = function (x, y) {
        // console.log("planToPlaceCueball");
        if (gameSetup.isLocal) {
          this.actuallyDoPlaceCueball(x, y);
          // const cmdstr = `PlaceCueBall;${gameSetup.currentCycleTime};${gameSetup.activePlayerInfo.ID}_${Math.fround(x)}_${Math.fround(y)}`;
          // this.saveCommand(cmdstr);
        } else {
          // this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "PlaceCueBall", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${Math.fround(x)}_${Math.fround(y)}`
          });
        }

        // if (isMatch || isTournament) {
        //   //TankActions.reportPlaceCueBallMove(gameSetup.roomId, activePlayerInfo.playerUserId, cb.x, cb.y);
        //   // need this so it will stop allowing place the tank??
        //   // this.enterState(GameState.CallShot, activePlayerInfo);
        // } else {
        //   // this.enterState(GameState.CallShot, activePlayerInfo);
        // }
      };


      this.isValidBreakShot = function isValidBreakShot() {
        if (gameSetup.cueball.body.inPocketID !== null) { // cue tank pocketed?
          return getPlayerActionMessage(false, 'CueballPocketed');
          // return false;
        }
        if (gameSetup.blackball.body.inPocketID !== null) { // black tank pocketed?
          return getPlayerActionMessage(false, 'BlackballPocketedBreak');
          // return false;
        }
        if (gameSetup.ballsTouchedRails.length < 4 && gameSetup.newlyPocketedBalls.length === 0) {
          return getPlayerActionMessage(false, 'AtLeast4Rail');
          // return false;
        }
        return "";
      };

      gameSetup.config.sendMessageAll = (msg) => {
        if (gameSetup.isLocal) {
          config.showMessage(msg);
          // const cmdstr = `ShowMessage;${gameSetup.currentCycleTime};${msg}`;
          // this.saveCommand(cmdstr);
        } else {
          // console.log("do sendMessage All " + msg);
          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "ShowMessage", t: gameSetup.currentCycleTime, w: msg
          });
        }
      };

      this.setNewPlayerState = (newID, newState, chosenColor, cbx, cby, winReason) => {
        if (typeof(chosenColor) == "undefined") {
          chosenColor = -1;
        }
        if (!cbx) {
          cbx = -10000; cby = -10000;
        }
        gameSetup.networkHandler.sendCommandToAll({
          c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${newID}_${newState}_${chosenColor}_${Math.fround(cbx)}_${Math.fround(cby)}_${winReason}`
        });
      };

      this.startEndGameMode = () => {
        gameSetup.networkHandler.sendCommandToAll({
          c: "EndGameMode",
          t: gameSetup.currentCycleTime,
        });
      }

      this.togglePlayer = (newState) => {
        if (newState == CUEBALL_IN_HAND) {
          // debugger;
        }
        this.setNewPlayerState(1 - gameSetup.activePlayerInfo.ID, newState);
      };




      gameSetup.setSecondsLeft = (s) => {
        for (let i = 0; i < gameSetup.numberOfPlayers; i++ ) {
          gameSetup.playerInfo[i].secondsLeft = s;
        }
        gameSetup.secondsLeft = s;
        gameSetup.gameEngine.setupTimer();
      };


      let elapsed = Date.now();
      const testtarget = new Victor(0, 0);



      this.allowInput = function () {
        if (gameSetup.gameType == GAME_TYPE.TESTING && !this.inStrike) return true;
        if (gameSetup.gameOver) return false;
        // if (gameSetup.gameType == GAME_TYPE.TESTING) return false;
        // if (isTesting) { return false; } // in testing mode no manual input! ??
        // return (!inStrike && !inModal && gameSetup.config.localPlayerID == activePlayerInfo.playerUserId);
        return true;
      };


      this.verifyTestResult = () => {
        if (gameSetup.gameType != GAME_TYPE.TESTING) return;
      };



      this.setRobotCode = (robotCode) => {
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          for (let k = 0; k < gameSetup.playerInfo.length; k++) {
            const pi = gameSetup.playerInfo[k];
            pi.PlayerCode = robotCode;
          }
        }
      };

      this.createAIPlayers = (setupCode, runTestOnReady) => {
        for (let k = 0; k < gameSetup.playerInfo.length; k++) {
          const pi = gameSetup.playerInfo[k];
          pi.isLocal = gameSetup.config.localPlayerID === pi.userId || gameSetup.config.localPlayerID === pi.playerCodeOwner;
          if (pi.playerType != "AI") continue;
          if (typeof(setupCode) != "undefined")
            pi.TestCode = setupCode;
          if (pi.playerWorker) {
            pi.playerWorker.terminate();
          }
          // only blue tank has AI player in testing?
          //if (gameSetup.gameType == GAME_TYPE.TESTING && k > 0)   break;
          if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
            // do not create robot if not my user id!
            if (!pi.isLocal) {
              continue;
            }
          }
          // console.log("create AI using robot code for " + pi.playerID);
          that.createRobot(pi, k, runTestOnReady);
        }
      };

      gameSetup.ClearMaze = () => {
        // gameSetup.tanks = [];
        // gameSetup.tankControllers = [];
        // gameSetup.maze = [];
        // gameSetup.tilemap = "";
        if (gameSetup.addTileInterval)
          clearInterval(gameSetup.addTileInterval);

        const cfg = gameSetup.config;
        const tilew = cfg.TileCols;
        const tileh = cfg.TileRows;

        for (let r=0; r < gameSetup.config.TileRows; r++) {
          const layer = gameSetup.mazeLayers[r];
          const cols = Object.keys(gameSetup.mazeTiles[r]);
          for (let ci = 0; ci < cols.length; ci++) {
            const c = Number(cols[ci]);
            if ( (r == 0) || ( r == tileh-1) || (c == 0) || ( c == tilew-1) ) {
              continue;
            }
            layer.removeChild(gameSetup.mazeTiles[r][c]);
            delete gameSetup.maze[r][c];
            delete gameSetup.mazeTiles[r][c];
          }
        }
      };



      gameSetup.removeAllTanks = () => {

        for (let k=0; k<gameSetup.tankControllers.length; k++) {
          gameSetup.tankControllers[k].inTestCase = false;
          const tank = gameSetup.tankControllers[k].tank;
          tank.isDead = true;
          tank.health = 0;
          tank.position.x = -10000;
          tank.speedX = 0;
          tank.speedY = 0;
          tank.freeze = false;
          tank.state = "PU";
          tank.pendingState = "PU";

          // if (tank.state.indexOf("U") >= 0 && tank.frame != 2) { tank.frame = 2; tank.gotoAndStop(2);}

          if (tank.color != "white") {
            tank.pendingState = "PU";
            tank.frame = 2; tank.gotoAndStop(2);
            tank.specialWeapon = {
              type: 0,
            };

            // tank.specialPowerBar = {};

            tank.powerPoint = 0;

            tank.specialPower.damage = 0;
            // this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.DAMAGE, tank.specialPower.damage);

            tank.specialPower.reload = 0;
            tank.reloadTime = 1200 - tank.specialPower.reload * 100;
            // this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.RELOAD, tank.specialPower.reload);

            tank.specialPower.speed = 0;
            tank.hasPendingSpeedUpdate = false;
            // this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.SPEED, tank.specialPower.speed);

            tank.specialPower.healthRegen = 0;
            // this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.HEALTH_REGEN, tank.specialPower.healthRegen);

            that.updatePowerStatus(tank);
            that.updateSpecialPower(tank);
          }

          gameSetup.tankControllers[k].removeFreezeLayout();
          if (gameSetup.tankControllers[k].tank.freezeTimer) {
            clearTimeout(gameSetup.tankControllers[k].tank.freezeTimer);
          }

          if ('specialPowerBorder' in gameSetup.tankControllers[k].tank && 'position' in gameSetup.tankControllers[k].tank.specialPowerBorder)
            gameSetup.tankControllers[k].tank.specialPowerBorder.position.x = -10000;
          if ('circleMark' in gameSetup.tankControllers[k].tank && 'position' in gameSetup.tankControllers[k].tank.circleMark)
            gameSetup.tankControllers[k].tank.circleMark.position.x = -10000;
        }
        for (let i = 0; i < gameSetup.tanks.length; i++) {
          gameSetup.tanks[i].isDead = true;
          gameSetup.tanks[i].health = 0;
          gameSetup.tanks[i].position.x = -10000;
          gameSetup.tanks[i].currentLaserID = null;

          for (let j = 0; j < gameSetup.tanks[i].shells.length; j += 1) {
            gameSetup.tanks[i].shells[j].position.x = -1000000;
            gameSetup.tanks[i].shells[j].isDead = true;
          }
        }

        for (let i = 0; i < gameSetup.crystals.length; i += 1) {
          gameSetup.crystals[i].position.x = -10000;
        }

        for (let i = 0; i < gameSetup.weapons.length; i += 1) {
          gameSetup.weapons[i].position.x = -10000;
        }


        //gameSetup.tankControllers = [];
        //gameSetup.tanks = [];
        gameSetup.gainCrystalInOrder = [];
        gameSetup.gainWeaponInOrder = [];
        gameSetup.numOfTanksKilled = 0;
        gameSetup.numOfColoredTanksKilled = 0;
        gameSetup.footPrints = [];
        window.commandHistory = [];
        window.logHistory = [];
        window.waitForTickUpdateDoneCount = -1;
      };

      gameSetup.PlaceTank = (cmd) => {
        const cfg = gameSetup.config;
        const maxnum = (gameSetup.difficulty === BEGINNER ? MAZE_SIZE.BEGINNER : MAZE_SIZE.ADVANCED) - 1;
        cmd.r = Math.min(maxnum, Math.max(0, cmd.r));
        cmd.c = Math.min(maxnum, Math.max(0, cmd.c));
        cmd.color = cmd.color ? cmd.color : "white";
        if (cmd.color == 'white') {
          // find a dead white tank to reuse
          cmd.tankID = gameSetup.tankControllers.length;
          // first 6 items reserved for blue and red tank
          for (let k=6; k<gameSetup.tankControllers.length; k++) {
            if (gameSetup.tankControllers[k].tank.position.x < 0 && gameSetup.tankControllers[k].tank.color == "white") {
              cmd.tankID = k; break;
            }
          }
          gameSetup.gameEngine.addOneTank(cmd.color, cmd.r, cmd.c, cmd.tankID, ("addAI" in cmd ? cmd.addAI : true));

        } else {
          let ind = 0;
          if (cmd.color == 'blue') {
            if (!gameSetup.tankControllers[0].inTestCase)
              ind = 0;
            else if (!gameSetup.tankControllers[2].inTestCase)
              ind = 2;
            else
              ind = 4;
          } else if (cmd.color == 'red') {
            if (!gameSetup.tankControllers[1].inTestCase)
              ind = 1;
            else if (!gameSetup.tankControllers[3].inTestCase)
              ind = 3;
            else
              ind = 5;
          }
          gameSetup.tankControllers[ind].inTestCase = true;
          const tank = gameSetup.tankControllers[ind].tank;
          if (tank.parent)
            tank.parent.removeChild(tank);
          gameSetup.mazeLayers[cmd.r].addChild(tank);
          tank.isDead =  false; 
          tank.noAI = !cmd.addAI;
          tank.health = 5000;
          if (gameSetup.difficulty == ADVANCED) {
            tank.health = 8000;
          }
          gameSetup.tankControllers[ind].updateHealth(tank.health);

          tank.pendingState = "P";
          gameSetup.tankControllers[ind].tank.c = cmd.c;
          gameSetup.tankControllers[ind].tank.r = cmd.r;
          gameSetup.tankControllers[ind].tank.position.x = Math.fround(cmd.c * cfg.TileSizeW + cfg.TileSizeW / 2);
          gameSetup.tankControllers[ind].tank.position.y = Math.fround((cmd.r+1 +0.5) * cfg.TileSizeH);
          gameSetup.tankControllers[ind].updatePosition();

        }



      };

      gameSetup.PlaceTile = (cmd) => {
        gameSetup.gameEngine.addOneTile(cmd.tileType, cmd.r, cmd.c);
      };

      gameSetup.PlaceCrystal = (cmd) => {
        gameSetup.gameEngine.addOneCrystal(cmd.r, cmd.c);
        if (gameSetup.gameType === GAME_TYPE.TESTING) {
          gameSetup.networkHandler.sendMessageToPlayers(CMD_NEW_CRYSTAL, { c: cmd.c, r: cmd.r });
        }
      };

      gameSetup.PlaceWeapon = (cmd) => {
        gameSetup.gameEngine.addOneWeapon(cmd.weaponType, cmd.r, cmd.c);
      };

      gameSetup.SetTankProperties = (cmd) => {
        const tankID = cmd.tankID;
        const tank = gameSetup.tankControllers[tankID].tank;
        Object.assign(tank, cmd.properties);
        if ('dir' in cmd.properties) {
          tank.state = cmd.properties.dir;
          if (tank.state.indexOf("U") >= 0 && tank.frame != 2) { tank.frame = 2; tank.gotoAndStop(2);}
          if (tank.state.indexOf("D") >= 0 && tank.frame != 3) { tank.frame = 3; tank.gotoAndStop(3);}
          if (tank.state.indexOf("L") >= 0 && tank.frame != 0) { tank.frame = 0; tank.gotoAndStop(0);}
          if (tank.state.indexOf("R") >= 0 && tank.frame != 1) { tank.frame = 1; tank.gotoAndStop(1);}
        }
        if ('specialPower' in cmd.properties) {
          gameSetup.gameEngine.updateSpecialPower(tank);
        }
        if ('health' in cmd.properties) {
          //gameSetup.gameEngine.addCurrentHealth(tank);
          gameSetup.tankControllers[tankID].updateHealth(cmd.properties.health);
        }
        if ('isFrozen' in cmd.properties) {
          tank.freeze = cmd.properties.isFrozen;
          if (tank.freeze) gameSetup.tankControllers[tankID].addFreezeLayout();
          else gameSetup.tankControllers[tankID].removeFreezeLayout();
        }
      };

      // execute the received command
      gameSetup.executeAIWorkerCommand = (data) => {

        let tankCmdUser = data.cmd;

        // hack: first 6 tanks are reserved for blue or red, and we have 6
        // ai playerworkers. but if we have less than 6 player tanks, then
        // white tanks will be in first 6
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          if (gameSetup.tankControllers[data.playerID].tank.color == "white") return;
        }

        if (!tankCmdUser) {
          tankCmdUser = "P";
        }

        if (typeof(data.playerID) == "undefined") {
          debugger;
        }

        if (data.cmdType === CMD_GET_COMMAND) {
          if (gameSetup.gameType === GAME_TYPE.TESTING) {
            // console.log("got new command " + tankCmdUser);
            const c = gameSetup.tankControllers[data.playerID];

            window.commandHistory.push(tankCmdUser);
          }
        }

        gameSetup.tankControllers[data.playerID].interpretOrder(tankCmdUser);
        return;




        if (tankCmdUser && typeof(tankCmdUser) != "undefined") {
          if (typeof(tankCmdUser.aimx) != "undefined") tankCmdUser.aimx = Math.fround(tankCmdUser.aimx);
          if (typeof(tankCmdUser.aimy) != "undefined") tankCmdUser.aimy = Math.fround(tankCmdUser.aimy);
          if (typeof(tankCmdUser.cueballx) != "undefined") tankCmdUser.cueballx = Math.fround(tankCmdUser.cueballx);
          if (typeof(tankCmdUser.cuebally) != "undefined") tankCmdUser.cuebally = Math.fround(tankCmdUser.cuebally);
          if (typeof(tankCmdUser.strength) != "undefined") tankCmdUser.strength = Math.fround(tankCmdUser.strength);
          if (typeof(tankCmdUser.spin) != "undefined") tankCmdUser.spin = Math.fround(tankCmdUser.spin);
          if (typeof(tankCmdUser.hspin) != "undefined") tankCmdUser.hspin = Math.fround(tankCmdUser.hspin);
        }

        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          gameSetup.activePlayerInfo = gameSetup.playerInfo1;
        }

        const pinfo = gameSetup.playerInfo[data.playerID];
        if (pinfo != gameSetup.activePlayerInfo) {
          // debugger;
          console.log("received cmd from non active player");
          return;
        }

        // const gs = gameSetup.controller.gameState;
        let shotCmd = {};

        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          //gameSetup.controller.inStrike = true; // prevent from old test finish reset to affect new test click
          // doesnt work!
          gameSetup.controller.inNewTest = true;
        }
        setTimeout(() => {
          // console.log("right before on strike button " + gameSetup.targetPocketID);
          if (shotCmd.targetBallID) {
            gameSetup.targetBallID = shotCmd.targetBallID;
          }
          if (shotCmd.targetPocketID >= 0) {
            gameSetup.targetPocketID = shotCmd.targetPocketID;
          }
          if (gameSetup.controller)
            gameSetup.controller.onStrikeButtonClick();
        }, 1200);
      };


      this.killAIPlayers = () => {
        for (let k = 0; k < gameSetup.playerInfo.length; k++) {
          const pi = gameSetup.playerInfo[k];
          //that.createRobot(pi);
          if (pi.playerWorker) {
            pi.playerWorker.terminate();
            delete pi.playerWorker;
          }
        }
      };

      // gameSetup.terminateRobotWorkers = () => {
      //   me.killAIPlayers();
      //   if (gameSetup.carcontroller) gameSetup.carcontroller.clearPendingOrders();
      // };


      // const startRobot = () => {
      //   console.log("\n\n\n\n\n\n\n\n\n\n\n---------start robot !!!!!!!!!! ");
      //   setTimeout(() => {
      //     console.log("set robot started true");
      //     robotStarted = true;
      //   }, 1000);
      //   // debugger;
      // };



      this.runTest = function () {
        gameSetup.controller.updateWorld();
        window.commandHistory = [];
        window.logHistory = [];
        gameSetup.gainCrystalInOrder = [];
        gameSetup.gainWeaponInOrder = [];
        gameSetup.numOfTanksKilled = 0;
        gameSetup.numOfColoredTanksKilled = 0;
        gameSetup.whiteTanksKilled = [];
        // const tankCmdUser = gameSetup.activePlayerInfo.playerAI.getBreakShot();
        gameSetup.playerInfo[0].playerWorker.sendMessage({
          'cmd': CMD_TEST_RUN,
          'world': WorldForPlayer
        });
      };




      this.runCode = function (code) {
        // debugger;

        // console.log('in run code ' + code );
        const fullcode = `
        async function testRun() {
          ${code}
        }
        testRun();`;
        eval(fullcode);
      };

      // async API for repeated test
      function waitSeconds(s) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // console.log("time out done ");
            resolve();
          }, s * 1000);
        });
      }



      // for multi-stop repeating tests, the test condition is checked in submitResult
      function submitResult(res) {
        if (window.testCondition && window.testCondition.indexOf("RepeatingTest") == 0) {
          // final result
          const p = window.testCondition.split("_");
          if (p[2] == "Stops") {
            if (window.allStopCount >= Number(p[1])) {
              if (window.testCondition && window.testCondition.indexOf("_Counter") > 0) {
                const pp = res.split(" ");
                if (res.indexOf("valid") >= 0 && res.indexOf("success") >= 0 && res.indexOf("invalid") >= 0 && pp.length == 6) {
                  const invalidCount = Number(pp[1].trim());
                  const validCount = Number(pp[3].trim());
                  const successfulCount = Number(pp[5].trim());
                  if (invalidCount + validCount + successfulCount == window.allStopCount) {
                    window.testResult = "Test passed!";
                  } else {
                    window.testResult = "Test failed: please submit result for valid, invalid and success shot counts.";
                  }
                } else {
                  window.testResult = "Test failed: please submit result for valid, invalid and success shot counts.";
                }
              } else {
                window.testResult = "Test passed!";
              }
            } else {
              window.testResult = `Test failed: need to run test to full stop for at least ${p[2]} times.`;
            }
            gameSetup.showTestResult();
          }
        } else {
          window.testResult = res;
          gameSetup.showTestResult();
        }
      }


    };

    gameSetup.controller = new GameController();

  };



  // this.enablePlaceButton = () => {
  //   // gameSetup.strikeButton.text.setText('Place');
  //   // var cfg = gameSetup.strikeButton.cfg;
  //   // cfg.bg.beginFill(cfg.origColor);
  //   // cfg.bg.drawRoundedRect(cfg.x, cfg.y, cfg.w, cfg.h, 10);
  //   // cfg.bg.endFill();

  //   gameSetup.strikeButton.inputEnabled = true;
  // };

  this.drawPocketingStar = () => {
    const cfg = gameSetup.config;

    const short = cfg.ballD / 3;
    const long = cfg.ballD * 8;


    const polys = [-short, -short, 0, -long, short, -short, long, 0, short, short, 0, long, -short, short, -long, 0];

    star = new PIXI.Graphics();
    star.lineStyle(0, 0x000000);
    star.beginFill(0xffffff);
    star.drawPolygon(polys);
    star.endFill();
    star.scale.x = 0;
    star.scale.y = 0;


    star.position.x = -3000;
    star.position.y = 300;

    gameSetup.stage.addChild(star);

    gameSetup.pocketingStar = star;
  };

  this.showPocketingStar = (x, y) => {
    const config = gameSetup.config;
    gameSetup.pocketingStar.x = x;
    gameSetup.pocketingStar.y = y;
    // const ts1 = gameSetup.add.tween(gameSetup.pocketingStar.scale).to({ x: 0.7, y: 0.7 }, 400, 'Linear', true);
    // const ts2 = gameSetup.add.tween(gameSetup.pocketingStar.scale).to({ x: 0, y: 0 }, 200, 'Linear', true);
    // ts1.chain(ts2);
    // gameSetup.pocketingStar.rotation = 0;
    // gameSetup.add.tween(gameSetup.pocketingStar).to({ rotation: Math.PI / 2 }, 600, 'Linear', true);


    star.x = x;
    star.y = y;

    const obj = { x: 0, y: 0 };
    const tweenA = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
      .to({ x: 0.3, y: 0.3 }, 300) // Move to (300, 200) in 1 second.
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() => { // Called after tween.js updates 'coords'.
          star.scale.x = obj.x; star.scale.y = obj.y;
      });
    const tweenB = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
      .to({ x: 0, y: 0 }, 200) // Move to (300, 200) in 1 second.
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() => { // Called after tween.js updates 'coords'.
          star.scale.x = obj.x; star.scale.y = obj.y;
      });

    tweenA.chain(tweenB);
    tweenA.start();

    const obj2 = { a: 0 };
    const tweenC = new TWEEN.Tween(obj2) // Create a new tween that modifies 'coords'.
        .to({ a: Math.PI/2 }, 300) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
            star.rotation = obj2.a;
        })
        .start();
  };

  this.toggleAllControls = (enabled) => {
    if (gameSetup.gameType == GAME_TYPE.TESTING) return;
    const config = gameSetup.config;
    const grey = 0x606060;
    // gameSetup.strikeButton.text.setText('Strike');
    gameSetup.iteration = -1; // stop calc right away
    gameSetup.cycleCounter = -1; // restart counter to do calc prob
    this.controlBG.forEach((cfg) => {
      if (!enabled) {
        cfg.bg.beginFill(grey);
      } else {
        cfg.bg.beginFill(cfg.origColor);
      }
      cfg.bg.drawRoundedRect(cfg.x, cfg.y, cfg.w, cfg.h, 10);
      cfg.bg.endFill();
    });

    // this.controlButtons.forEach((btn) => {
    //   btn.inputEnabled = enabled;
    // });

    // this.CWButtons.forEach((cfg) => {
    //         // cfg.btn.inputEnabled = enabled;
    //   if (!enabled) {
    //     cfg.btn.tint = grey;
    //   } else {
    //     cfg.btn.tint = cfg.origTint;
    //   }
    // });
  };

  // this.setReady = () => {
  //   if (!gameSetup.isHost && gameSetup.networkHandler) {
  //     gameSetup.networkHandler.sendReadyToHost();
  //     gameSetup.allPeersReady = true;
  //   }
  // };



  this.setupGameRoom = function () {


    this.setupConfig();
    this.enhanceVictor();
    this.loadSounds();
    this.setup();
    // this.initGraphics();
    // this.setReady();

    this.createController();



    // load textures async, then on load complete draw assets
    this.loadTextures();
  };

  this.createWorkerFromString = function (code) {
    // URL.createObjectURL
    window.URL = window.URL || window.webkitURL;

    // "Server response", used in all examples
    // let response = "self.onmessage=function(e) {postMessage('Worker: '+e.data);}";

    let blob;
    try {
        blob = new Blob([code], { type: 'application/javascript' });
    } catch (e) { // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new window.BlobBuilder();
        // blob.append(response);
        blob = blob.getBlob();
    }

    const w = new Worker(URL.createObjectURL(blob));
    w.onerror = (event) => {
      Bert.alert({
        title: 'Error found when creating robot',
        message: event.message,
        type: 'danger',
        style: 'growl-top-right',
        icon: 'fa-frown-o'
      });
    };
    return w;
  };



  this.createRobot = (pinfo, i, runTestOnReady) => {
    if (pinfo.playerType !== 'AI') {
      return;
    }

    // console.log("to create ai player " + pinfo.ID);

    const PlayerCode = pinfo.PlayerCode;

    if (PlayerCode) {
      let url = window.location.href;
      url = url.substring(0, url.indexOf("buildMyAI")-1);
      // Assets.getText('/RobotWorker/DodgeBallPlayerWorker.js', (workerCodeTemplat) => {

      // console.log("createRobot: before ajax load worker template");
      // $.ajax({
      //     type: "GET",
      //     url: "/js/pathpoolplayerworker.js",
      //     dataType: "text"
      // }).done(function (workerCodeTemplat) {
        // insert actual player code into template
        const p = workerCodeTemplat.split("-------------");
        // debugger;
        let testcode = pinfo.TestCode;
        const workerCode = `${AstarString} ${VictorString} ${p[0]} ${pinfo.PlayerCode} ${p[1]} ${testcode} ${p[2]}`;

        // console.log("createRobot: createWorkerFromString " + testcode);
        const playerWorker = that.createWorkerFromString(workerCode);

        playerWorker.isReady = false;
        pinfo.playerWorker = playerWorker;
        playerWorker.waitingForReply = false;

        this.listener = function(e) {

          const data = e.data;
          // console.log("received data from worker: " + JSON.stringify(data));
          if (data.cmdType === CMD_SEND_TEAM_MESSAGE) {
            gameSetup.sendMessageToTeam(data.cmd);
            return;
          } else if (data.cmdType == CMD_READY) {
              // console.log(` worker is ready ${pinfo.ID} ${JSON.stringify(e.data)}`);
              playerWorker.isReady = true;

              if (gameSetup.gameType == GAME_TYPE.TESTING && runTestOnReady && i == 0) {
                gameSetup.controller.runTest();
              }

          } else if (data.cmdType == CMD_TANK_ORDER) {
            gameSetup.tankControllers[data.playerID].interpretOrder(data.order);
          } else if (data.cmdType == CMD_ERROR_IN_WORKER) {
            Bert.defaults.hideDelay = 15000;
            Bert.alert({
              //title: 'Error found when executing test',
              title: data.message,
              message: data.stack,
              type: 'danger',
              style: 'growl-top-right',
              icon: 'fa-frown-o'
            });

          } else if (data.cmdType == CMD_SCRIPT_CLEAR_MAZE) {
            if (gameSetup.gameType == GAME_TYPE.TESTING)
              gameSetup.ClearMaze();
            return;
          } else if (data.cmdType == CMD_SCRIPT_REMOVE_ALL_TANK) {
            if (gameSetup.gameType == GAME_TYPE.TESTING)
              gameSetup.removeAllTanks();
            return;
          } else if (data.cmdType == CMD_SCRIPT_PLACE_TANK) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.PlaceTank(data.cmd);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_PLACE_TILE) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.PlaceTile(data.cmd);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_PLACE_CRYSTAL) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.PlaceCrystal(data.cmd);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_PLACE_WEAPON) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.PlaceWeapon(data.cmd);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_SET_TANK_PROPERTIES) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.SetTankProperties(data.cmd);
            }
            return;
          } else if (data.cmdType == CMD_WHITE_TANK) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.tankControllers[data.cmd.tankID].interpretOrder(data.cmd.c);
            }
            return;

          } else if (data.cmdType == CMD_SCRIPT_REPORT_END_OF_TEST) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              if (gameSetup.addTileInterval)
                clearInterval(gameSetup.addTileInterval);
              gameSetup.handleTestResult(data.result);
            }
            return;

          } else if (data.cmdType == CMD_PRINT) {
            console.log(data.cmd.str);
            if (window.logHistory) window.logHistory.push(data.cmd.str);
            if (window.handleNewConsole) window.handleNewConsole(data.cmd.str);
            return;
          } else if (data.cmdType == CMD_CLEAR_PRINT) {
            window.logHistory = [];
            window.handleClearConsole();
            return;
          } else if (data.cmdType == CMD_SCRIPT_EXPECT_WHITETANK_KILLED) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.userExpectedResult.push("EXPECTWHITETANKKILLED_" + data.num);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_SET_EXPECTED_RESULT) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.userExpectedResult.push(data.result);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_SETUP_TICK_UPDATE) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              window.waitForTickUpdateDoneID = data.resolveID;
              window.waitForTickUpdateDoneCount = data.updateCount;
            }
            return;

          } else if (data.cmdType == CMD_GET_SECONDS_LEFT) {
            gameSetup.controller.updateWorld();
            let ss = gameSetup.secondsLeft;
            playerWorker.sendMessage({
              cmd: CMD_GET_SECONDS_LEFT,
              world: WorldForPlayer,
              secondsLeft: ss,
              resolveID: data.resolveID
            });
            return;
          } else if (data.cmdType == CMD_SCRIPT_SET_SECONDS_LEFT) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.setSecondsLeft(data.secondsLeft);
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_START_END_GAME_MODE) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              gameSetup.setSecondsLeft(0);
              gameSetup.controller.startEndGameMode();
            }
            return;
          } else if (data.cmdType == CMD_SCRIPT_WAIT_FOR_ALL_SHELLS_EXPLODE) {
            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              window.waitForAllShellsExplodeResolveID = data.resolveID;
            }
            return;
          } else {
            ///////////////////////////
            // console.log(`listener got reply back. `);
            playerWorker.waitingForReply = false;

            gameSetup.executeAIWorkerCommand(e.data);
          }
        };


        playerWorker.addEventListener('message', this.listener);

        // msg.playerID = playerID;


        playerWorker.sendMessage = function(m) {
          this.postMessage(JSON.stringify(m));
          this.lastPostMessage = m;
        };

        const msg = {
          'cmd': CMD_READY,
          'playerID': pinfo.ID,
          'world': WorldForPlayer,
          url: window.origin
        };

        playerWorker.sendMessage(msg);

        playerWorker.playerID = pinfo.ID;




      // }).fail(function (jqXHR, textStatus, errorThrown) {
      //     alert("AJAX call failed: " + textStatus + ", " + errorThrown);
      // });
      // const playerFunc = Function('world', 'myID', 'Victor', PlayerCode);
      // pinfo.playerAI = new playerFunc(WorldForPlayer, pinfo.ID, Victor);
    }
  };



  this.createRobotOld = (pinfo) => {
    if (pinfo.playerType !== 'AI') {
      return;
    }

    const PlayerCode = pinfo.PlayerCode;
    if (PlayerCode) {
      const playerFunc = Function('world', 'myID', 'Victor', PlayerCode);
      pinfo.playerAI = new playerFunc(WorldForPlayer, pinfo.ID, Victor);
    }
  };



  this.loadTextures = () => {
    const textures = [];

    // textures.push(`/images/grassland1_64b.png`);
    // textures.push(`/images/grassland2_64.png`);
    // textures.push(`/images/grassland3_64.png`);


    // textures.push(`/images/flag1.png`);

    textures.push(`/images/bombshell_64_U.png`);
    textures.push(`/images/bombshell_64_D.png`);
    textures.push(`/images/bombshell_64_L.png`);
    textures.push(`/images/bombshell_64_R.png`);

    textures.push(`/images/bombshell_flametrail_4_64.png`);
    textures.push('/images/tboticon.png');
    textures.push('/images/tbotmessagebackground.png');
    textures.push('/images/userRobotChat.jpg');
    textures.push(`/images/yellowarrow.png`);

    //convert *.png +append sprites.png (append horizontally)
    textures.push(`/images/explosionshoot.png`);
    textures.push(`/images/explosiontarget.png`);

    // question mark
    textures.push("/images/helpquestionmark.png");
    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      textures.push(`/images/controlsandrulessmall.png`);
    } else {
      textures.push(`/images/tankwargamerule4.png`);
    }

    // new resource
    textures.push('/images/tank/health_border.png');
    textures.push('/images/tank/power_border.png');
    textures.push('/images/tank/special_power_advanced_border.png');
    textures.push('/images/tank/special_power_beginner_border.png');
    textures.push('/images/tank/power_1.png');
    textures.push('/images/tank/power_2.png');
    textures.push('/images/tank/power_3.png');
    textures.push('/images/tank/full_health_blue.png');
    textures.push('/images/tank/full_health_red.png');
    textures.push('/images/tank/full_health_white.png');

    if (gameSetup.difficulty == ADVANCED) {
      // advanced special power

      textures.push('/images/tank/damage_6_1.png');
      textures.push('/images/tank/damage_6_2.png');
      textures.push('/images/tank/damage_6_3.png');
      textures.push('/images/tank/damage_6_4.png');
      textures.push('/images/tank/damage_6_5.png');
      textures.push('/images/tank/damage_6_6.png');
      textures.push('/images/tank/reload_6_1.png');
      textures.push('/images/tank/reload_6_2.png');
      textures.push('/images/tank/reload_6_3.png');
      textures.push('/images/tank/reload_6_4.png');
      textures.push('/images/tank/reload_6_5.png');
      textures.push('/images/tank/reload_6_6.png');
      textures.push('/images/tank/speed_6_1.png');
      textures.push('/images/tank/speed_6_2.png');
      textures.push('/images/tank/speed_6_3.png');
      textures.push('/images/tank/speed_6_4.png');
      textures.push('/images/tank/speed_6_5.png');
      textures.push('/images/tank/speed_6_6.png');
      textures.push('/images/tank/health_regen_6_1.png');
      textures.push('/images/tank/health_regen_6_2.png');
      textures.push('/images/tank/health_regen_6_3.png');
      textures.push('/images/tank/health_regen_6_4.png');
      textures.push('/images/tank/health_regen_6_5.png');
      textures.push('/images/tank/health_regen_6_6.png');
      textures.push(`/images/grassBack.png`);
      textures.push('/images/tank/rockrange_horizontal.png')
      textures.push('/images/tank/rockrange_horizontal_2Update.png')
      textures.push('/images/tank/rockrange_vertical.png')

    } else {
      // beginner special power
      textures.push('/images/tank/damage_4_1.png');
      textures.push('/images/tank/damage_4_2.png');
      textures.push('/images/tank/damage_4_3.png');
      textures.push('/images/tank/damage_4_4.png');
      textures.push('/images/tank/reload_4_1.png');
      textures.push('/images/tank/reload_4_2.png');
      textures.push('/images/tank/reload_4_3.png');
      textures.push('/images/tank/reload_4_4.png');
      textures.push('/images/tank/speed_4_1.png');
      textures.push('/images/tank/speed_4_2.png');
      textures.push('/images/tank/speed_4_3.png');
      textures.push('/images/tank/speed_4_4.png');
      textures.push('/images/tank/health_regen_4_1.png');
      textures.push('/images/tank/health_regen_4_2.png');
      textures.push('/images/tank/health_regen_4_3.png');
      textures.push('/images/tank/health_regen_4_4.png');
      textures.push(`/images/grassBack_beginner.png`);
      textures.push('/images/tank/rockrange_beginer_horizontal.png')
      textures.push('/images/tank/rockrange_beginer_horizontal_2Update.png')
      textures.push('/images/tank/rockrange_beginer_vertical.png')
    }
    // tank weapon item
    textures.push('/images/tank/weapon2_1.png');
    textures.push('/images/tank/weapon2_2.png');
    textures.push('/images/tank/weapon2_3.png');
    textures.push('/images/tank/weapon2_4.png');
    textures.push('/images/tank/weapon2_5.png');
    textures.push('/images/tank/weapon2_6.png');
    // textures.push('/images/tank/weapon_7.png');
    textures.push('/images/tank/crosshair_blue.png')
    textures.push('/images/tank/crosshair_red.png')
    textures.push('/images/tank/weaponiconShadow.png');
    textures.push('/images/tank/ice_cover_D.png');
    textures.push('/images/tank/ice_cover_U.png');
    textures.push('/images/tank/ice_cover_L.png');
    textures.push('/images/tank/ice_cover_R.png');
    textures.push('/images/tank/bombshell_freezer_D.png');
    textures.push('/images/tank/bombshell_freezer_U.png');
    textures.push('/images/tank/bombshell_freezer_L.png');
    textures.push('/images/tank/bombshell_freezer_R.png');
    textures.push('/images/tank/bombshell_flametrail_freezer.png');

    textures.push('/images/tank/bombshell_missile_D.png');
    textures.push('/images/tank/bombshell_missile_U.png');
    textures.push('/images/tank/bombshell_missile_L.png');
    textures.push('/images/tank/bombshell_missile_R.png');

    textures.push('/images/tank/laser_dot_red_L.png');
    textures.push('/images/tank/laser_dot_red_R.png');
    textures.push('/images/tank/laser_dot_red_U.png');
    textures.push('/images/tank/laser_dot_red_D.png');

    textures.push('/images/tank/laser_red_head_horizon.png');
    textures.push('/images/tank/laser_red_tail_horizon.png');
    textures.push('/images/tank/laser_red_horizon.png');
    textures.push('/images/tank/laser_red_head_vertical.png');
    textures.push('/images/tank/laser_red_tail_vertical.png');
    textures.push('/images/tank/laser_red_vertical.png');

    textures.push('/images/tank/laser_dot_blue_L.png');
    textures.push('/images/tank/laser_dot_blue_R.png');
    textures.push('/images/tank/laser_dot_blue_U.png');
    textures.push('/images/tank/laser_dot_blue_D.png');

    textures.push('/images/tank/laser_blue_head_horizon.png');
    textures.push('/images/tank/laser_blue_tail_horizon.png');
    textures.push('/images/tank/laser_blue_horizon.png');
    textures.push('/images/tank/laser_blue_head_vertical.png');
    textures.push('/images/tank/laser_blue_tail_vertical.png');
    textures.push('/images/tank/laser_blue_vertical.png');

    textures.push(`/images/newpool/tishi.png`);
    textures.push(`/images/newpool/jinbi.png`);

    textures.push('/images/tank/circle_mark.png');
    textures.push('/images/tank/1-damage.png');
    textures.push('/images/tank/2-speed.png');
    textures.push('/images/tank/3-health-regen.png');
    textures.push('/images/tank/4-reload.png');

    // weapon
    textures.push('/images/tank/laser_item.png');
    // for(let exi = 1; exi <= 12; exi += 1) {
    //   textures.push(`/images/tank/matrix_explosion/explosionmatrix_${exi}-64.png`);
    // }
    for(let exi = 0; exi <= 11; exi += 1) {
      textures.push(`/images/tank/novatile/tile0${exi >= 10 ? "" : "0"}${exi}.png`);
    }

    textures.push(`/images/greenleftarrow.png`);
    textures.push(`/images/tank/quitbtn.png`);
    textures.push(`/images/tank/staybtn.png`);
    textures.push(`/images/tank/exitwarning.png`);
    textures.push(`/images/tank/modalmessagebg.png`);

    // Dynamic loading resources
    // load main items: tank asset.
    const userId = Meteor.userId();

    const mainItems = _.get(gameSetup, 'mainItems')
    // console.log('mainItems', mainItems);
    _.map(mainItems, (mainItem) => {
      if (mainItem.gameId != "tankwarmdKu94Qi2Y") return;
      const main = _.get(mainItem, 'imageSrc.main');
      if (main && _.get(_.keys(main), 'length') > 0) {
        _.forEach(main, src => {
          if(textures.indexOf(src) === -1) {
            textures.push(src);
          }
        })
      }
    });

    // load background items: grass, rock, tree, mud.

    let bgitems = gameSetup.backgroundItems;
    if (gameSetup.backgroundItems.length > 0) {
      for (let k=0; k<gameSetup.backgroundItems.length; k++) {
        bgitems = gameSetup.backgroundItems[k];
        if (bgitems.gameId == "tankwarmdKu94Qi2Y") {
          break;
        }
      }
    }

    const backgroundItems = _.get(bgitems, 'imageSrc.main');
    // console.log('backgroundItems', backgroundItems);
    if (backgroundItems && _.get(_.keys(backgroundItems), 'length') > 0) {
      _.forEach(backgroundItems, src => {
        if(textures.indexOf(src) === -1) {
          textures.push(src);
        }
      })
    }

    // Default Tank assets
    const defaultBackgroundItems = [];
    defaultBackgroundItems.push(`/images/Obs_Tallbush_64.png`);
    defaultBackgroundItems.push(`/images/Obs_Shorttree_64.png`);
    defaultBackgroundItems.push(`/images/Obs_Mud_64.png`);
    defaultBackgroundItems.push(`/images/Obs_Rock_64.png`);
    defaultBackgroundItems.push(`/images/diamond_64.png`);
    const defaultMainItems = [];
    defaultMainItems.push(`/images/bluetanksheetof4.png`); // left/right/up/down
    defaultMainItems.push(`/images/redtanksheetof4.png`); // left/right/up/down
    defaultMainItems.push(`/images/whitetanksheetof4.png`); // left/right/up/down
    const defaultTankAssets = [...defaultMainItems, ...defaultBackgroundItems];

    _.forEach(defaultTankAssets, src => {
      if(textures.indexOf(src) === -1) {
        textures.push(src);
      }
    })

    gameSetup.shootSound = new Howl({ src: ['/sounds/Gun1.mp3'] });
    gameSetup.explodeSound = new Howl({ src: ['/sounds/Explosion1.mp3'] });

    gameSetup.victory = new Howl({ src: ['/sounds/Victory.mp3'] });
    // gameSetup.itemcollected = new Howl({ src: ['/sounds/ItemCollected.mp3'] });

    // textures.push(`/images/nametaggrey.png`);
    // textures.push(`/images/bluebackground4.jpg`);


    let needLoading = false;
    const neededTextures = [];
    for (let k=0; k<textures.length; k++) {
      if (PIXI.loader.resources[textures[k]] && PIXI.loader.resources[textures[k]].texture && PIXI.loader.resources[textures[k]].texture.baseTexture) {
        console.log("confirmed we have texture " + textures[k]);
      } else {
        neededTextures.push(textures[k]);
        needLoading = true;
      }
    }

    const initFunction = () => {
      const backgroundKey = gameSetup.difficulty === ADVANCED ? 'BG' : 'BGB';
      let bgitems = gameSetup.backgroundItems;
      if (gameSetup.backgroundItems.length > 0) {
        for (let k=0; k<gameSetup.backgroundItems.length; k++) {
          bgitems = gameSetup.backgroundItems[k];
          if (bgitems.gameId == "tankwarmdKu94Qi2Y") {
            break;
          }
        }
      }

      const resource = _.get(bgitems, ['imageSrc', 'main', backgroundKey]);
      if (!PIXI.loader.resources[resource]) {
        // loading of game screen cancelled?
        console.log("do not have background yet");
        setTimeout(() => {
          console.log("try initFunction again");
          initFunction();
        }, 1000);
        return;
      }


      if (gameSetup.initFunctionExecuted) return;

      gameSetup.initFunctionExecuted = true;
      console.log("run initFunction");


      //gameSetup.showModalMessage = () => {};
      //gameSetup.hideModalMessage = () => {};



      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType === GAME_TYPE.BATTLE) {
        //gameSetup.allInitialized = true;


        that.initScreen();
      } else {
        that.setupHandleRoom();
        gameSetup.controller.disableGUIInputs();
        console.log("reportEnteringGameRoom " + gameSetup.room._id + " gameSetup.localPlayerID " + gameSetup.localPlayerID);
        TankActions.reportEnteringGameRoom(gameSetup.room._id, gameSetup.localPlayerID);
      }

      PIXI.ticker.shared.start();
      that.tick();
    };

    // aaaa always load?
    if (!needLoading) {
      console.log("no need for loading! so call initfunction directly");
      initFunction();
    } else {
      console.log("load texture first "); // + JSON.stringify(neededTextures));
      PIXI.loader.add(neededTextures).load(initFunction);
    }
  };


  this.loadFramedSpriteSheet = function(textureUrl, textureName, frameWidth, frameHeight, cnt, cb) {
    const frames = this.loadFramedSpriteSheetSync(textureUrl, textureName, frameWidth, frameHeight, cnt);
    if (typeof cb == 'function') {
      cb(frames);
    }
  };

  this.loadFramedSpriteSheetSync = function(textureUrl, textureName, frameWidth, frameHeight, cnt) {
    // PIXI.loader.add(textureUrl).load(() => {
      const frames = [];
      // console.log("to load " + textureUrl);
      if (!PIXI.loader.resources[textureUrl]) {
        debugger;
      }
      const texture = PIXI.loader.resources[textureUrl].texture.baseTexture;
      // const cols = Math.floor(texture.width / frameWidth);
      // const rows = Math.floor(texture.height / frameHeight);
      const cols = cnt;
      const rows = 1;
      let i = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) {
          PIXI.utils.TextureCache[`${textureName}-${i}`] = new PIXI.Texture(texture, { x: x * frameWidth, y: y * frameHeight, width: frameWidth, height: frameHeight });
          frames.push(PIXI.utils.TextureCache[`${textureName}-${i}`]);
        }
      }
      return frames;
    // });

  };



  this.addIllumination = () => {
    // doesn't work for webgl canvas!!
    const config = gameSetup.config;
    console.log('addIllumination');
    // gameSetup.centerLight = gameSetup.add.illuminated.lamp(config.mazeCenterX, config.mazeCenterY /*,{ illuminated lamp config object }*/);
    const light = new window.illuminated.Lamp({
      // position: new illuminated.Vec2(config.mazeCenterX, config.mazeCenterY),
      distance: 800,
      width: 1,
      height: 1,
      centerX: config.mazeCenterX,
      centerY: config.mazeCenterY,
      diffuse: 1,
      color: 'rgba(255,255,255,1)',
      radius: 10,
      samples: 1,
      angle: 0,
      roughness: 0
    });

    //gameSetup.centerLight.createLighting();


    const ctx = tablerenderer.view.getContext("2d");
    // var disc = new DiscObject({
    //   center: new Vec2(100, 100),
    //   radius: 30
    // });
    // var rect = new RectangleObject({
    //   topleft: new Vec2(250, 200),
    //   bottomright: new Vec2(350, 250)
    // });
    const lighting = new window.illuminated.Lighting({
      light: light,
      // objects: [ disc, rect ]
    });
    lighting.compute(tablerenderer.view.width, tablerenderer.view.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, tablerenderer.view.width, tablerenderer.view.height);
    lighting.render(ctx);

    // var cx = config.mazeCenterX/2;
    // gameSetup.topLight = gameSetup.add.illuminated.lamp(cx, 10, {
    //   // position: new illuminated.Vec2(config.mazeCenterX, config.mazeCenterY),
    //   distance: 20,
    //   width: 1, height: 1, centerX: cx, centerY: 10,
    //   diffuse: 10,
    //   color: 'rgba(255,255,255,1)',
    //   radius: 4,
    //   samples: 1,
    //   angle: 0,
    //   roughness: 0
    // });

    // gameSetup.topLight.createLighting();


    // gameSetup.lightMask = new window.illuminated.DarkMask({ lights: [gameSetup.centerLight] }/* , color*/);
  };

  this.addControlLable = (label, x, y) => {
    const config = gameSetup.config;

    const style2 = new PIXI.TextStyle({
      // fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 60, //Math.round(config.,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: 0, //Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const labelText = new PIXI.Text(label, style2);
    labelText.x = x;
    labelText.y = y;
    labelText.anchor.set(0.5, 0.5);
    labelText.visible = true;
    gameSetup.stage.addChild(labelText);
  };

  this.setupKeyboardControl = () => {
    if (this.gameSetup.gameType == GAME_TYPE.TESTING) return;
    KeyboardController(
      {
        37: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("L");
        },
        38: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("U");
        },
        39: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("R");
        },
        40: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("D");
        },
        32: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("S");
        },
        49: function() {
          // 1
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("1");
        },
        50: function() {
          // 2
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("2");
        },
        51: function() {
          // 3
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("3");
        },
        52: function() {
          // 4
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("4");
        }
      },
      { // key release events
        37: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
        },
        38: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
        },
        39: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
        },
        40: function() {
          if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
          gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
        },
      },
      150
    );
  };

  this.setupKeyboardControlOld = () => {

    gameSetup.downlisteners = [];
    gameSetup.uplisteners = [];


    function keyboard(keyCode) {
      const key = {};
      key.code = keyCode;
      key.isDown = false;
      key.isUp = true;
      key.press = undefined;
      key.release = undefined;
      //The `downHandler`
      key.downHandler = (event) => {

        if (event.keyCode === key.code) {
          console.log("new down " + event.keyCode + " " + Date.now());
          //if (key.isUp && key.press) key.press(event.ctrlKey);
          if (key.press) key.press(event.ctrlKey); // keep generating events!
          key.isDown = true;
          key.isUp = false;
          event.preventDefault();
        }
      };

      //The `upHandler`
      key.upHandler = (event) => {
        if (event.keyCode === key.code) {

          if (key.isDown && key.release) key.release();
          key.isDown = false;
          key.isUp = true;
          event.preventDefault();
        }
      };

      //Attach event listeners
      const keydownhandler = key.downHandler.bind(key);
      window.addEventListener(
        "keydown", keydownhandler, false
      );
      gameSetup.downlisteners.push(keydownhandler);
      const keyuphandler = key.upHandler.bind(key);
      window.addEventListener(
        "keyup", keyuphandler, false
      );
      gameSetup.uplisteners.push(keyuphandler);
      return key;
    };

    const left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40),
        spacekey = keyboard(32);


    // const testtarget = new Victor(0, 0);
    left.press = () => {
      console.log("new left key press" + " " + Date.now());
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("L");
    };

    left.release = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
      // gameSetup.networkHandler.sendCommandToAll({
      //   c: "P", t: gameSetup.currentCycleTime, w: `${gameSetup.localPlayerID}`
      // });
    };


    //Right
    right.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("R");
      // gameSetup.networkHandler.sendCommandToAll({
      //   c: "R", t: gameSetup.currentCycleTime, w: `${gameSetup.localPlayerID}`
      // });
    };
    right.release = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
      // gameSetup.networkHandler.sendCommandToAll({
      //   c: "P", t: gameSetup.currentCycleTime, w: `${gameSetup.localPlayerID}`
      // });
    };

    //Up
    up.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("U");
    };
    up.release = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
    };

    //Down
    down.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("D");
    };
    down.release = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder("P");
    };

    spacekey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.networkHandler.sendCommandToAll({
        c: "S", t: gameSetup.currentCycleTime, w: `${gameSetup.localPlayerID}`
      });
    };

    // skey.release = () => {
    // };




  };

  const knobAreas = [];

  this.setupMeterClick = () => {
    const updateKnob = (t, lowv, highv, initv, highy, lowy, floorv) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      // if (gameSetup.cwHandle !== null) {
      //   clearInterval(gameSetup.cwHandle);
      //   gameSetup.cwHandle = null;
      // }
      // if (gameSetup.ccwHandle !== null) {
      //   clearInterval(gameSetup.ccwHandle);
      //   gameSetup.ccwHandle = null;
      // }

      const floory = highy - (highy - lowy) / (highv - lowv) * (floorv - lowv);

      if (t.position.y > floory) {
        t.position.y = floory;
      }

      if (t.position.y > highy) {
        t.position.y = highy;
      }
      if (t.position.y < lowy) {
        t.position.y = lowy;
      }
      gameSetup.emitter.updateOwnerPos(t.position.x,t.position.y);
      gameSetup.emitter.emit = true;
      gameSetup.playMagicSound();

      const ratio2 = (highy - t.position.y) /(highy - lowy);
      t.value = lowv + (highv - lowv) * ratio2;
      // if (highv < 2) {
      //   t.value = Math.round(t.value * 100)/100;
      // } else {
      //   t.value = Math.round(t.value);
      // }
      // t.textActual.text = `${t.value}`;
      // t.textActual.position.y = t.position.y - 15;
      // t.textMax.y = t.position.y + 15;
      // t.barg.position.y = t.position.y;
    };

    const onBGClick = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      gameSetup.yellowCrystall.dragging = false;
      gameSetup.blueCrystall.dragging = false;
      gameSetup.greenCrystall.dragging = false;

      t.data = event.data;
      const clickY = event.data.originalEvent.offsetY/ gameSetup.stage.scale.y;
      const clickX = event.data.originalEvent.offsetX/ gameSetup.stage.scale.x;
      // console.log("click x y " + clickX + " " + clickY);

      // find out which knob area is this in
      for (let i=0; i < knobAreas.length; i++) {
        const a = knobAreas[i];
        // console.log("bound x " + a.leftx + " " + a.rightx + " y " + a.lowy + " " + a.highy);
        if (clickX >= a.leftx && clickX <= a.rightx && clickY <= a.highy && clickY >= a.lowy) {
          a.knob.position.y = clickY;
          updateKnob(a.knob, a.lowv, a.highv, a.initv, a.highy, a.lowy, a.floorv);
          break;
        }
      }
    };

    gameSetup.bluebackground.on('mousedown', onBGClick).on('touchstart', onBGClick);
  };

  const addEmitter = (cc, maxr) => {
    // const cc = new PIXI.Container();
    const emitter = new PIXI.particles.Emitter(

      // The PIXI.Container to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the root stage Container
      cc,

      // The collection of particle images to use
      [PIXI.Texture.fromImage('/images/particle.png')],
      // [PIXI.Texture.fromImage('/images/pinkdot.png')],

      // Emitter configuration, edit this to change the look
      // of the emitter
      {
        alpha: {
          list: [
            {
              value: 0.9,
              time: 0
            },
            {
              value: 0.2,
              time: 1
            }
          ],
          isStepped: false
        },
        scale: {
          list: [
            {
              value: 0.3,
              time: 0
            },
            {
              value: 0.05,
              time: 1
            }
          ],
          isStepped: false
        },
        color: {
          list: [
            {
              value: "ffffff",
              time: 0
            },
            {
              value: "ffffff",
              time: 1
            }
          ],
          isStepped: false
        },
        speed: {
          list: [
            {
              value: 100,
              time: 0
            },
            {
              value: 20,
              time: 1
            }
          ],
          isStepped: false
        },
        startRotation: {
          min: 0,
          max: 360
        },
        rotationSpeed: {
          min: 0,
          max: 0
        },
        lifetime: {
          min: 0.2,
          max: 0.3
        },
        frequency: 0.004,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 0.15,
        maxParticles: 1000,
        pos: {
          x: 0,
          y: 0
        },
        addAtBack: false,
        spawnType: "ring",
        // spawnType: "circle",
        spawnCircle: {
          x: 0,
          y: 0,
          r: maxr,
          minR: maxr - 3
        }
      }
    );
    emitter.containercc = cc;
    return emitter;
  };

  // lowv = -1, highv = 1, highy > lowy
  this.addKnob = (knob, lowv, highv, initv, highy, lowy, floorv, leftx, rightx) => {
    // console.log("bound x y " + leftx + " " + rightx);
    knobAreas.push({
      knob, leftx, rightx, highy, lowy, highv, lowv, floorv
    });
    // knob.value = cfg.initValue;
    knob.value = initv;
    knob.alpha = 0.8;

    gameSetup.controlButtons.push(knob);
    knob.interactive = true;
    knob.buttonMode = true;
    // knob.cfg = cfg;



    const onDragStart = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;

      gameSetup.yellowCrystall.dragging = false;
      gameSetup.blueCrystall.dragging = false;
      gameSetup.greenCrystall.dragging = false;

      const t = event.currentTarget;
      // console.log("start drag for " + t.name);
      // store a reference to the data
      // the reason for this is because of multitouch
      // we want to track the movement of this particular touch
      t.data = event.data;
      t.dragStartPointerY = event.data.originalEvent.clientY;
      t.dragStartPointerX = event.data.originalEvent.clientX;
      if (typeof(event.data.originalEvent.clientY) == "undefined") {
        t.dragStartPointerY = event.data.originalEvent.targetTouches[0].clientY;
      }

      if (typeof(event.data.originalEvent.clientX) == "undefined") {
        t.dragStartPointerX = event.data.originalEvent.targetTouches[0].clientX;
      }

      t.dragStartPosY = t.position.y;
      // this.alpha = 0.5;
      t.dragging = true;
      gameSetup.playMagicSound();

    };

    const onDragEnd = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      // this.alpha = 1;
      t.dragging = false;
      // set the interaction data to null
      t.data = null;
    };

    const updateKnob = (t) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      // if (gameSetup.cwHandle !== null) {
      //   clearInterval(gameSetup.cwHandle);
      //   gameSetup.cwHandle = null;
      // }
      // if (gameSetup.ccwHandle !== null) {
      //   clearInterval(gameSetup.ccwHandle);
      //   gameSetup.ccwHandle = null;
      // }


      const floory = highy - (highy - lowy) / (highv - lowv) * (floorv - lowv);

      if (t.position.y > floory) {
        t.position.y = floory;
      }

      if (t.position.y > highy) {
        t.position.y = highy;
      }
      if (t.position.y < lowy) {
        t.position.y = lowy;
      }
      gameSetup.emitter.updateOwnerPos(t.position.x,t.position.y);
      gameSetup.emitter.emit = true;

      const ratio2 = (highy - t.position.y) /(highy - lowy);
      t.value = lowv + (highv - lowv) * ratio2;
      // if (highv < 2) {
      //   t.value = Math.round(t.value * 100)/100;
      // } else {
      //   t.value = Math.round(t.value);
      // }
      // t.textActual.text = `${t.value}`;
      // t.textActual.position.y = t.position.y - 15;
      // t.textMax.y = t.position.y + 15;
      // t.barg.position.y = t.position.y;
    };

    const onDragMove = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      if (t.dragging) {



        let pointerChgX = event.data.originalEvent.clientX - t.dragStartPointerX; // getLocalPosition(this.parent);
        if (typeof(event.data.originalEvent.clientX) == "undefined") {
          pointerChgX = event.data.originalEvent.targetTouches[0].clientX - t.dragStartPointerX; // getLocalPosition
        }
        if (Math.abs(pointerChgX) >= gameSetup.config.mazeW * 0.03) {
          onDragEnd(event);
          return;
        }

        let pointerChg = event.data.originalEvent.clientY - t.dragStartPointerY; // getLocalPosition(this.parent);
        if (typeof(event.data.originalEvent.clientY) == "undefined") {
          pointerChg = event.data.originalEvent.targetTouches[0].clientY - t.dragStartPointerY; // getLocalPosition(this.parent);
        }
        // console.log(event.data.originalEvent.clientY + " - " + t.dragStartPointerY + " = " + pointerChg);
        pointerChg = pointerChg / gameSetup.stage.scale.y;
        t.position.y = t.dragStartPosY + pointerChg;
        // console.log("updateknob for " + t.name + " new y " + t.position.y);

        updateKnob(t);
      }
    };


    // emitter.ownerPos.x = knob.position.x;
    // emitter.ownerPos.y = knob.position.y;
    // knob.addChild(emitter);

    knob
        // events for drag start
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
    knob.position.y = highy - (initv - lowv) / (highv - lowv) * (highy - lowy);

    knob.setPositionByValue = (v) => {
      knob.position.y = highy - (v - lowv) / (highv - lowv) * (highy - lowy);
    };
  };

  this.addVSpinBallNew = () => {
    const config = gameSetup.config;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/greencrystallball.png"].texture);


    let ratio = (config.TrueWidth * 0.03) / 100;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = (config.TrueWidth * 0.06) / 100;
    }
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick) * 0.256;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "vspinball";
    this.addKnob(bg2, -1, 1, 0, config.TrueHeight - config.TrueHeight * 0.514, config.TrueHeight - config.TrueHeight * 0.828, -1, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    bg2.valueLow = -1;
    bg2.valueHigh = 1;

    gameSetup.greenCrystall = bg2;
    gameSetup.spinMeterBar = bg2;
    gameSetup.stage.addChild(bg2);
  };

  this.addHSpinBallNew = () => {
    const config = gameSetup.config;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/yellowcrystallball.png"].texture);

    let ratio = (config.TrueWidth * 0.03) / 100;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = (config.TrueWidth * 0.06) / 100;
    }
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick) * 0.255;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "hspinball";
    gameSetup.yellowCrystall = bg2;
    this.addKnob(bg2, -30, 30, 0, config.TrueHeight - config.TrueHeight * 0.073, config.TrueHeight - config.TrueHeight * 0.379, -30, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    bg2.valueLow = -30;
    bg2.valueHigh = 30;

    gameSetup.spinMeterBarH = bg2;
    gameSetup.stage.addChild(bg2);
  };

  this.addInputEmitter = () => {

    // add spark emitter
    const ec = new PIXI.Container();
    // const ec = new PIXI.particles.ParticleContainer();
    // ec.setProperties({
    //   scale: true,
    //   position: true,
    //   rotation: true,
    //   uvs: true,
    //   alpha: true
    // });

    gameSetup.stage.addChild(ec);

    let maxr = (gameSetup.config.TrueWidth * 0.03) / 2;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      maxr = (gameSetup.config.TrueWidth * 0.06) / 2;
    }


    const emitter = addEmitter(ec, maxr + 3);
    // emitter.container.position.x = 100;
    // emitter.container.position.y = 100;
    // emitter.visible = true;
    // emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);
    emitter.emit = false;
    gameSetup.emitter = emitter;
  };

  this.addStrengthBallNew = () => {
    const config = gameSetup.config;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/bluecrystallball.png"].texture);

    let ratio = (config.TrueWidth * 0.03) / 100;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = (config.TrueWidth * 0.06) / 100;
    }
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth - (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick) * 0.249;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.3;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "speedball";
    // bg2.interactive = true;
    gameSetup.blueCrystall = bg2;
    let initvalue = 60;
    if (gameSetup.difficulty == ADVANCED) initvalue = 85;
    this.addKnob(bg2, 0, 100, initvalue, config.TrueHeight - config.TrueHeight * 0.076, config.TrueHeight - config.TrueHeight * 0.48, 2, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    gameSetup.speedMeterBall = bg2;
    bg2.valueLow = 2;
    bg2.valueHigh = 100;
    gameSetup.stage.addChild(bg2);
  };


  this.addHelpQuestionMark = () => {
    console.log("addHelpQuestionMark")
    const config = gameSetup.config;

    // controls help box
    let bg, ratio;

    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/controlsandrulessmall.png"].texture);
      ratio = (config.mazeW * 1.05) / 800;
    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/tankwargamerule4.png"].texture);
      ratio = (config.mazeW * 0.85) / 994;
    }
    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.position.x = config.mazeCenterX;
    bg.position.y = config.mazeCenterY - config.mazeH * 0.016;
    bg.anchor.set(0.5, 0.5);
    bg.buttonMode = true;
    bg.interactive = false;
    bg.visible = false;
    bg.alpha = 0.95;
    gameSetup.mazeContainer.addChild(bg);
    bg.on('pointerdown', () => {
      bg.visible = false;
      bg.interactive = false;
    });

    // question mark
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/helpquestionmark.png"].texture);
    ratio = (config.TrueWidth * 0.022) / 44;
    bg2.scale.set(ratio * 1, ratio); // will overflow on bottom
    bg2.position.x = (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick)/4;
    bg2.position.y = (config.TrueHeight - (config.mazeH + 2 * config.metalBorderThick)) / 2;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    bg2.buttonMode = true;
    gameSetup.mazeContainer.addChild(bg2);

    bg2.on('pointerdown', () => {
      if (bg.visible) {
        bg.visible = false;
        bg.interactive = false;
      } else {
        bg.visible = true;
        bg.interactive = true;
      }
    });

  };



  // new vertical
  this.addCWNew = () => {
    const config = gameSetup.config;

    const ga = new PIXI.Sprite(PIXI.loader.resources["/images/auto_zoom_search2.png"].texture);

    let ratio = (config.TrueHeight * 0.14 / 1.2) / 75;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = ratio * 1.2;
    }

    ga.scale.set(ratio, ratio); // will overflow on bottom

    ga.position.x = config.TrueWidth - (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick)/4;
    ga.position.y = config.TrueHeight - (config.mazeH + 2 * config.metalBorderThick) - config.TrueHeight * 0.005;
    ga.anchor.set(0.5, 0);
    ga.interactive = true;
    gameSetup.stage.addChild(ga);
    gameSetup.controlButtons.push(ga);
    gameSetup.autoBtn = ga;
    ga.buttonMode = true;
    ga.visible = true;


    const findNextBall = (legalColor, startID, dir=1) => {
      const ids = Object.keys(gameSetup.ballsByID);
      // for (let k=startID+1; k<startID + 1 + ids.length; k++) {
      let k = startID;
      let counter = 0;
      while (counter < ids.length) {
        k += dir;
        counter ++;
        let j = k;
        if (j >= ids.length) j = j - ids.length;
        if (j < 0) j = ids.length-1;
        if (ids[j] <= 0) continue;
        // console.log("ids[j] is " + ids[j]);
        const b = gameSetup.ballsByID[ids[j]];
        if (b.body.inPocketID == null) {
          if (b.colorType == legalColor) {
            return b;
          } else if (legalColor == null && ids[j] >= 2) {
            return b;
          }
        }
      }
    };


    const otherBallPos = new Victor(0, 0);
    const isPathBlocked = (pos1, pos2, ignoreID) =>{
      const ids = Object.keys(gameSetup.ballsByID);
      for (let k=0; k<ids.length; k++) {
        if (ids[k] == ignoreID) continue;
        const b = gameSetup.ballsByID[ids[k]];
        otherBallPos.x = b.position.x;
        otherBallPos.y = b.position.y;
        if (dist2(pos1, otherBallPos) <= 0.001) continue;
        if (dist2(pos2, otherBallPos) <= 0.001) continue;

        const dist = distToSegment(otherBallPos, pos1, pos2);
        if (dist <= gameSetup.config.ballD)
          return true;
      }
      return false;
    };

    const calcMinDir = (targetID) => {
      const targetBall = gameSetup.ballsByID[targetID];
      const cueball = gameSetup.ballsByID[0];
      // let maxPocketID = null;
      const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);

      let minAngleDiff = Math.PI / 2;
      // let dirx = 0; let diry = 0;
      let minDir = null;
      const cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
      // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
      for (let pocketID=0; pocketID<6; pocketID++) {
        const pocketPos = gameSetup.tablePocket[pocketID].clone();
        const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
        const dirAimToBall = dirBallToPocket.normalize().scale(config.ballD);
        const aimPos = targetBallPos.clone().subtract(dirAimToBall);
        const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

        if (isPathBlocked(pocketPos, targetBallPos)) continue;
        if (isPathBlocked(cueballPos, aimPos, targetID)) continue;

        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cueballPos " + JSON.stringify(cueballPos));

        // first filter out a pocket if the angle is too large
        const angleCueBallToAim = dirCueBallToAim.angle();
        const angleAimToBall = dirAimToBall.angle();
        let angleDiff = angleCueBallToAim - angleAimToBall;
        // console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
        if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
        // console.log("angleCueBallToAim " + angleCueBallToAim + " angleAimToBall " + angleAimToBall + " angleDiff " + angleDiff)
        if (Math.abs(angleDiff) < minAngleDiff) {
          minAngleDiff = Math.abs(angleDiff);
          minDir = dirCueBallToAim;
        }
      }
      return minDir;
    }

    gameSetup.nextAutoTarget = (dir=1) => {
      gameSetup.playMagicSound();
      gameSetup.emitter.updateOwnerPos(ga.position.x, ga.position.y + 80);
      gameSetup.emitter.emit = true;

      let b = gameSetup.firstBallTouchedByCueball;

      let counter = 0;
      let nextMinDir = null;
      const ids = Object.keys(gameSetup.ballsByID);
      while (counter <= ids.length) {
        counter ++;
        if (b == null || ( gameSetup.activePlayerInfo.legalColor != null && gameSetup.activePlayerInfo.legalColor != b.colorType)) {
          b = findNextBall(gameSetup.activePlayerInfo.legalColor, -1, dir);
        } else {
          const currentMinDir = calcMinDir(b.ID);
          if (currentMinDir == null) {
            // blocked!
            b = findNextBall(gameSetup.activePlayerInfo.legalColor, b.ID, dir);
            continue;
          }
          if (currentMinDir.x == gameSetup.cueballDirection.x && currentMinDir.y == gameSetup.cueballDirection.y) {
            // need to jump to aim next tank
            b = findNextBall(gameSetup.activePlayerInfo.legalColor, b.ID, dir);
          } else {
            // just need to adjust aiming for current tank
            gameSetup.cueballDirection.x = currentMinDir.x;
            gameSetup.cueballDirection.y = currentMinDir.y;
            return;
          }
        }
        nextMinDir = calcMinDir(b.ID);
        if (nextMinDir != null) break;
      }

      if (nextMinDir != null) {
        gameSetup.cueballDirection.x = nextMinDir.x;
        gameSetup.cueballDirection.y = nextMinDir.y;
      }

      return;


      // let targetID = -1;
      // let msg = "Please aim at a tank first.";
      // if (b !== null) {
      //   if (gameSetup.activePlayerInfo.chosenColor != null) {
      //     if (gameSetup.firstBallTouchedByCueball.tank.colorType != gameSetup.activePlayerInfo.legalColor) {
      //       targetID = -1;
      //       msg = `Please aim at a ${gameSetup.activePlayerInfo.legalColor} tank first.`;
      //     } else {
      //       targetID = b.ID;
      //     }
      //   } else {
      //     targetID = b.ID;
      //   }
      // }

      // new way of simply calculate angle!

      // const targetBall = gameSetup.ballsByID[targetID];
      // const cueball = gameSetup.ballsByID[0];
      // // let maxPocketID = null;
      // const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);

      // let minAngleDiff = 3000;
      // // let dirx = 0; let diry = 0;
      // let minDir = null;
      // const cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
      // // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
      // for (let pocketID=0; pocketID<6; pocketID++) {
      //   const pocketPos = gameSetup.tablePocket[pocketID].clone();
      //   const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
      //   const dirAimToBall = dirBallToPocket.normalize().scale(config.ballD);
      //   const aimPos = targetBallPos.clone().subtract(dirAimToBall);
      //   const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

      //   // console.log("pocketPos " + JSON.stringify(pocketPos));
      //   // console.log("aimPos " + JSON.stringify(aimPos));
      //   // console.log("cueballPos " + JSON.stringify(cueballPos));

      //   // first filter out a pocket if the angle is too large
      //   const angleCueBallToAim = dirCueBallToAim.angle();
      //   const angleAimToBall = dirAimToBall.angle();
      //   let angleDiff = angleCueBallToAim - angleAimToBall;
      //   // console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
      //   if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
      //   if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
      //   // console.log("angleCueBallToAim " + angleCueBallToAim + " angleAimToBall " + angleAimToBall + " angleDiff " + angleDiff)
      //   if (Math.abs(angleDiff) < minAngleDiff) {
      //     minAngleDiff = Math.abs(angleDiff);
      //     minDir = dirCueBallToAim;
      //   }
      // }

      // gameSetup.cueballDirection.x = minDir.x;
      // gameSetup.cueballDirection.y = minDir.y;
    };

    gameSetup.nextAutoTargetEvent = () => {
      gameSetup.nextAutoTarget(1);
    };

    ga.on('pointerdown', gameSetup.nextAutoTargetEvent);

    // ga.on('pointerdown', () => {
    //   gameSetup.autoSearchHandle = setTimeout(()=>{
    //     // gameSetup.autoSearchStepSize = Math.PI / 2;

    //     const b = gameSetup.firstBallTouchedByCueball;
    //     let targetID = -1;
    //     let msg = "Please aim at a tank first.";
    //     if (b !== null) {
    //       if (gameSetup.activePlayerInfo.chosenColor != null) {
    //         if (gameSetup.firstBallTouchedByCueball.tank.colorType != gameSetup.activePlayerInfo.legalColor) {
    //           targetID = -1;
    //           msg = `Please aim at a ${gameSetup.activePlayerInfo.legalColor} tank first.`;
    //         } else {
    //           targetID = b.ID;
    //         }
    //       } else {
    //         targetID = b.ID;
    //       }
    //     }

    //     // if (targetID < 0) {
    //     //   config.sendMessageAll(msg, 1);
    //     //   return;
    //     // }

    //     gameSetup.playMagicSound();
    //     gameSetup.emitter.updateOwnerPos(ga.position.x, ga.position.y);
    //     gameSetup.emitter.emit = true;
    //     // new way of simply calculate angle!

    //     const targetBall = gameSetup.ballsByID[targetID];
    //     const cueball = gameSetup.ballsByID[0];
    //     // let maxPocketID = null;
    //     const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);

    //     let minAngleDiff = 3000;
    //     // let dirx = 0; let diry = 0;
    //     let minDir = null;
    //     const cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
    //     // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
    //     for (let pocketID=0; pocketID<6; pocketID++) {
    //       const pocketPos = gameSetup.tablePocket[pocketID].clone();
    //       const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
    //       const dirAimToBall = dirBallToPocket.normalize().scale(config.ballD);
    //       const aimPos = targetBallPos.clone().subtract(dirAimToBall);
    //       const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

    //       // console.log("pocketPos " + JSON.stringify(pocketPos));
    //       // console.log("aimPos " + JSON.stringify(aimPos));
    //       // console.log("cueballPos " + JSON.stringify(cueballPos));

    //       // first filter out a pocket if the angle is too large
    //       const angleCueBallToAim = dirCueBallToAim.angle();
    //       const angleAimToBall = dirAimToBall.angle();
    //       let angleDiff = angleCueBallToAim - angleAimToBall;
    //       // console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
    //       if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
    //       if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
    //       // console.log("angleCueBallToAim " + angleCueBallToAim + " angleAimToBall " + angleAimToBall + " angleDiff " + angleDiff)
    //       if (Math.abs(angleDiff) < minAngleDiff) {
    //         minAngleDiff = Math.abs(angleDiff);
    //         minDir = dirCueBallToAim;
    //       }
    //     }

    //     gameSetup.cueballDirection.x = minDir.x;
    //     gameSetup.cueballDirection.y = minDir.y;


    //     // old way of search by probability

    //     if (false) {
    //     // gameSetup.autoSearchTargetID = targetID;

    //     // if (!gameSetup.inAutoSearch) {
    //     //   gameSetup.showOverlay("Please wait while I adjust the shooting angle for you...", false, true);
    //     //   setTimeout(()=>{
    //     //     gameSetup.controller.runAutoSearch();
    //     //   }, 100);
    //     // }
    //     }

    //   }, 1);
    // });







    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/ccwblue.png"].texture);
    ratio = (config.mazeH * 0.14 / 1.2) / 128;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = ratio * 1.2;
    }

    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.tint = 0xffffff;

    bg.position.x = config.TrueWidth - (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick)/4;
    bg.position.y = config.TrueHeight - (config.mazeH + 2 * config.metalBorderThick) + config.TrueHeight * 0.175;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = true;
    gameSetup.controlButtons.push(bg);
    gameSetup.ccwControl = bg;
    bg.buttonMode = true;
    bg.on('pointerdown', () => {
      // turnCCW(1);
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.turnChangeSpeed = 1;
      gameSetup.playMagicSound();
    });
    bg.on('pointerup', () => {
      gameSetup.turnChangeSpeed = 0;
    });
    gameSetup.stage.addChild(bg);


    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/cwblue.png"].texture);

    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = bg.position.x;
    bg2.position.y = config.TrueHeight - (config.mazeH + 2 * config.metalBorderThick) + config.TrueHeight * 0.28;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    gameSetup.controlButtons.push(bg2);
    gameSetup.cwControl = bg2;
    bg2.buttonMode = true;
    bg2.on('pointerdown', () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.turnChangeSpeed = -1;
      gameSetup.playMagicSound();
      // turnCCW(-1);
    });
    bg2.on('pointerup', () => {
      gameSetup.turnChangeSpeed = 0;
    });
    gameSetup.stage.addChild(bg2);

    bg2.tint = 0xffffff;


    gameSetup.turnCCW = (dir) => {
      if (gameSetup.turnChangeSpeed == 0) {
        if (!gameSetup.controller || !gameSetup.controller.allowInput()) {
          bg.tint = 0x606060;
          bg2.tint = 0x606060;
        } else {
          bg.tint = 0xffffff;
          bg2.tint = 0xffffff;
        }
        return;
      }

      if (gameSetup.turnChangeSpeed == 1) {
        // bg.tint = 0x00ff00;
      } else {
        // bg2.tint = 0x00ff00;
      }

      //gameSetup.strikeButton.text.text = 'Strike';
      gameSetup.toggleHitButton(true);
      gameSetup.cycleCounter = 0; // restart counter to do calc prob
      // const strength = 360;
      // const m = 2;
      // const turnSpeed = dir * Math.max(360,  strength); // the higher is I, the less we turn
      let acc = 1;
      if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
        acc = 60;
      }
      gameSetup.cueballDirection.rotate(0 - acc * Math.PI * dir / (128 * 180)); // 1 / 32 degree per click
    };



    // this.addControlLable('Direction', (bg2.position.x + bg.position.x)*0.5 - config.TrueWidth * 0.1, bg.position.y);
  };


  this.addCW = () => {
    const config = gameSetup.config;


    const g = new PIXI.Sprite(PIXI.loader.resources["/images/directionwoodbackground.png"].texture);

    let ratio = (config.TrueHeight * 0.44) / 435;
    g.scale.set(ratio, ratio); // will overflow on bottom

    g.position.x = config.TrueWidth - (config.TrueWidth - (config.mazeW + 2 * config.metalBorderThick)) * 0.5;
    g.position.y = config.TrueHeight - config.mazeH - 2 * config.metalBorderThick + config.TrueHeight * 0.01;
    g.anchor.set(0.5, 0);
    g.interactive = false;
    g.visible = true;
    gameSetup.stage.addChild(g);

    const ga = new PIXI.Sprite(PIXI.loader.resources["/images/auto_zoom_search2.png"].texture);

    // const ga = new PIXI.Sprite(PIXI.loader.resources["/images/yellowspintarget.png"].texture);

    ratio = (config.TrueHeight * 0.1) / 150;
    ga.scale.set(ratio, ratio); // will overflow on bottom

    ga.position.x = config.TrueWidth - (config.TrueWidth - (config.mazeW + 2 * config.metalBorderThick)) * 0.5;
    ga.position.y = config.TrueHeight - (config.mazeH + 2 * config.metalBorderThick) + config.TrueHeight * 0.018;
    // ga.position.y = 0;
    ga.anchor.set(0.5, 0);
    ga.interactive = true;
    gameSetup.stage.addChild(ga);

    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/ccwmetal3.png"].texture);

    ratio = (config.mazeH * 0.07) / 128;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.TrueWidth - (config.TrueWidth - (config.mazeW + 2 * config.metalBorderThick)) * 0.7;
    bg.position.y = config.TrueHeight - config.mazeH + config.TrueHeight * 0.075;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = true;
    gameSetup.stage.addChild(bg);


    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/cwmetal3.png"].texture);

    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth - (config.TrueWidth - (config.mazeW + 2 * config.metalBorderThick)) * 0.3;
    bg2.position.y = bg.position.y;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    gameSetup.stage.addChild(bg2);

    // this.addControlLable('Direction', (bg2.position.x + bg.position.x)*0.5 - config.TrueWidth * 0.1, bg.position.y);
  };



  this.addSpinBall = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/spintargetballpanel2.png"].texture);

    let ratio = (config.TrueWidth * 0.09) / 166;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.TrueWidth - (config.TrueWidth - (config.mazeW + 2 * config.metalBorderThick)) * 0.5;
    bg.position.y = config.mazeCenterY - config.mazeH * 0.15;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = false;
    gameSetup.stage.addChild(bg);


    // yellow target

    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/yellowspintarget.png"].texture);

    ratio = (config.TrueWidth * 0.055) / 140;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth - (config.TrueWidth - (config.mazeW + 2 * config.metalBorderThick)) * 0.5;
    bg2.position.y = config.mazeCenterY - config.mazeH * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    gameSetup.stage.addChild(bg2);
  };

  this.addHelpQuestionMark = () => {
    console.log("addHelpQuestionMark 1")
    const config = gameSetup.config;

    // controls help box
    let bg, ratio;
    const { TrueWidth, TrueHeight, TileSizeH, TileSizeW } = config;
    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/controlsandrulessmall.png"].texture);
      ratio = (TrueWidth * 0.95) / 800;
    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/tankwargamerule4.png"].texture);
      ratio = (TrueWidth * 0.85)  / 994;
    }
    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.position.x = TrueWidth / 2;
    bg.position.y = TrueHeight / 2;
    bg.anchor.set(0.5, 0.5);
    bg.buttonMode = true;
    bg.interactive = false;
    bg.visible = false;
    bg.alpha = 0.95;
    gameSetup.stage.addChild(bg);
    bg.on('pointerdown', () => {
      bg.visible = false;
      bg.interactive = false;
    });

    // question mark
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/helpquestionmark.png"].texture);
    ratio = (config.TrueWidth * 0.022) / 44;
    bg2.scale.set(ratio * 1, ratio); // will overflow on bottom
    bg2.position.x = TileSizeW / 2;
    bg2.position.y = TileSizeH * 2;
    bg2.anchor.set(0.5, 0);
    bg2.interactive = true;
    bg2.buttonMode = true;
    // gameSetup.stage.addChild(bg2);
    gameSetup.mazeContainer.addChild(bg2);

    bg2.on('pointerdown', () => {
      if (bg.visible) {
        bg.visible = false;
        bg.interactive = false;
      } else {
        bg.visible = true;
        bg.interactive = true;
      }
    });
  }


  this.addQuitButton = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/greenleftarrow.png"].texture);
    // let ratio = (config.mazeW * 0.103) / 242;
    // bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = 10;
    bg.position.y = 10;
    bg.anchor.set(0, 0);
    bg.interactive = true;
    bg.buttonMode = true;
    gameSetup.mazeContainer.addChild(bg);


    // exit warning message
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/tank/exitwarning.png"].texture);
    const exitwarningHeight = 188;
    const exitwarningWidth = 600;
    let ratio = (config.TrueWidth * 0.5) / exitwarningWidth;
    bg2.scale.set(ratio, ratio); // will overflow on bottom
    bg2.position.x = config.TrueWidth / 2;
    bg2.position.y = config.TrueHeight * 0.5;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;
    // gameSetup.mazeContainer.addChild(bg2);
    gameSetup.stage.addChild(bg2);


    const btnPosition = exitwarningHeight * ratio / 5;
    // add 2 buttons
    const bg3 = new PIXI.Sprite(PIXI.loader.resources["/images/tank/quitbtn.png"].texture);
    ratio = (config.TrueWidth * 0.15) / 260;
    bg3.scale.set(ratio, ratio); // will overflow on bottom
    bg3.position.x = config.TrueWidth / 2 - config.TrueWidth * 0.12;
    bg3.position.y = config.TrueHeight * 0.5 + btnPosition + 25;
    bg3.anchor.set(0.5, 0.5);
    bg3.visible = false;
    bg3.buttonMode = true;
    bg3.interactive = true;
    gameSetup.stage.addChild(bg3);

    const bg4 = new PIXI.Sprite(PIXI.loader.resources["/images/tank/staybtn.png"].texture);
    bg4.scale.set(ratio, ratio); // will overflow on bottom
    bg4.position.x = config.TrueWidth - bg3.position.x;
    bg4.position.y = bg3.position.y;
    bg4.anchor.set(0.5, 0.5);
    bg4.interactive = true;
    bg4.visible = false;
    bg4.buttonMode = true;
    gameSetup.stage.addChild(bg4);


    gameSetup.showExitWarning = () => {
      if (window.gameSetup.gameType == GAME_TYPE.PRACTICE) {
        gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: gameSetup.localPlayerID});
        // gameSetup.exitGame();
        return;
      }
      bg2.visible = true; bg3.visible = true; bg4.visible = true;
      bg3.interactive = true; bg4.interactive = true;
    };
    gameSetup.hideExitWarning = () => {
      bg2.visible = false; bg3.visible = false; bg4.visible = false;
      bg3.interactive = false; bg4.interactive = false;
    };

    bg.on('pointerdown', gameSetup.showExitWarning);
    bg3.on('pointerdown', gameSetup.exitBtnHandler);
    bg4.on('pointerdown', gameSetup.hideExitWarning);
  };

  this.addHitButton = () => {
    const config = gameSetup.config;

    const ratio = (config.mazeW * 0.103) / 242;

    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/placebtn.png"].texture);
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = (config.mazeCenterX + config.mazeW/2 + config.metalBorderThick);
    bg2.position.y = (config.TrueHeight - config.mazeH - 2 * config.metalBorderThick) / 2;
    bg2.anchor.set(1, 0.5);
    bg2.interactive = false;
    bg2.buttonMode = true;
    bg2.on('pointerdown', gameSetup.controller.onPlaceButtonClick);
    gameSetup.stage.addChild(bg2);
    // gameSetup.controlButtons.push(bg2);

    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/hitbtn.png"].texture);
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = (config.mazeCenterX + config.mazeW/2 + config.metalBorderThick);
    bg.position.y = (config.TrueHeight - config.mazeH - 2 * config.metalBorderThick) / 2;
    bg.anchor.set(1, 0.5);
    bg.interactive = true;
    bg.buttonMode = true;
    bg.on('pointerdown', gameSetup.controller.onStrikeButtonClick);
    gameSetup.controlButtons.push(bg);

    gameSetup.stage.addChild(bg);
    gameSetup.hitButton = bg;
    gameSetup.placeButton = bg2;

    gameSetup.toggleHitButton = (showHit) => {
      if (showHit) {
        if (gameSetup.hitButton.visible) return;
        gameSetup.hitButton.visible = true;
        gameSetup.hitButton.interactive = true;
        gameSetup.placeButton.visible = false;
        gameSetup.placeButton.interactive = false;
      } else {
        if (!gameSetup.hitButton.visible) return;
        gameSetup.placeButton.visible = true;
        gameSetup.placeButton.interactive = true;
        gameSetup.hitButton.visible = false;
        gameSetup.hitButton.interactive = false;
      }
    };
  };



  this.addModalMessageScreen = () => {
    const config = gameSetup.config;

    // game over message background
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/tank/modalmessagebg.png"].texture);
    const modalWidth = 988;
    const modalHeight = 309;
    let ratio = (config.TrueWidth * 0.5) / modalWidth;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth / 2;
    bg2.position.y = config.TrueHeight * 0.5;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;

    // message header
    const style2 = new PIXI.TextStyle({
      //fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily: 'FuturaHeavy',
      fontSize: 45, //config.TrueWidth / 25,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#e6ca59'],
      stroke: '#e6ca59',
      strokeThickness: 0,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const headerText = new PIXI.Text(``, style2);
    // headerText.x = config.mazeW * 0.75 / 2;
    headerText.x = 0;
    headerText.y = 0 - modalHeight * ratio * 0.4;
    if (gameSetup.difficulty == BEGINNER) {
      headerText.y -= 20;
    }
    // headerText.y = 0;
    headerText.anchor.set(0.5, 0.5);
    headerText.visible = true;
    bg2.addChild(headerText);
    bg2.headerText = headerText;
    bg2.interactive = false;

    // message content
    const style3 = new PIXI.TextStyle({
      //fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  'FuturaHeavy',
      fontSize: 35, //config.TrueWidth / 30,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 0,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: true,
      wordWrapWidth: config.TrueWidth * 0.6
    });

    const msgText = new PIXI.Text(``, style3);
    msgText.x = headerText.x;
    msgText.y = headerText.y + modalHeight * ratio * 0.4 + 20;
    if (gameSetup.difficulty != BEGINNER) {
      msgText.y -= 25;
    }
    // msgText.y = config.mazeH * 0.05;
    msgText.anchor.set(0.5, 0.5);
    msgText.visible = true;
    bg2.addChild(msgText);
    bg2.msgText = msgText;


    // add exit button
    const exitbtn = new PIXI.Sprite(PIXI.loader.resources["/images/tank/quitbtn.png"].texture);
    ratio = (config.TrueWidth * 0.15) / 242;
    exitbtn.scale.set(ratio, ratio); // will overflow on bottom
    exitbtn.position.x = config.TrueWidth * 0.13;
    exitbtn.position.y = modalHeight * ratio * 0.3 + 25;
    if (gameSetup.difficulty != BEGINNER) {
      exitbtn.position.y = modalHeight * ratio * 0.3;
    }
    exitbtn.anchor.set(0.5, 0.5);
    exitbtn.visible = true;
    exitbtn.buttonMode = true;
    exitbtn.interactive = false;
    bg2.addChild(exitbtn);
    // bg2.exitbtn = bg3;

    // add replay button
    const replaybtn = new PIXI.Sprite(PIXI.loader.resources["/images/tank/staybtn.png"].texture);
    ratio = (config.TrueWidth * 0.11) / 242;
    replaybtn.scale.set(ratio, ratio); // will overflow on bottom
    replaybtn.position.x = 0 - config.TrueWidth * 0.13;
    replaybtn.position.y = modalHeight * ratio * 0.3;
    replaybtn.anchor.set(0.5, 0.5);
    replaybtn.visible = true;
    replaybtn.buttonMode = true;
    replaybtn.interactive = false;
    bg2.addChild(replaybtn);
    // bg2.exitbtn = replaybtn;



    gameSetup.mazeContainer.addChild(bg2);


    gameSetup.showModalMessage = (header, msg, mode) => {
      gameSetup.mazeContainer.removeChild(bg2);
      gameSetup.mazeContainer.addChild(bg2);
      bg2.visible = true;
      headerText.text = header;
      msgText.text = '';
      if (msg && msg != 'undefined') {
        msgText.text = msg;
      }

      if (mode == MODAL_EXITGAME) {
        exitbtn.interactive = true;
        exitbtn.visible = true;
        replaybtn.interactive = false;
        exitbtn.position.x = 0;
        replaybtn.visible = false;
      } else if (mode == MODAL_EXITORREPLAY) {
        exitbtn.visible = true;
        exitbtn.position.x = 0 + config.TrueWidth * 0.05;
        replaybtn.visible = true;
        exitbtn.interactive = true;
        replaybtn.interactive = true;
      } else if (mode == MODAL_NOBUTTON) {
        // exitbtn.position.x = 0 + config.mazeW * 0.05;
        replaybtn.visible = false;
        exitbtn.visible = false;
        exitbtn.interactive = false;
        replaybtn.interactive = false;
      }

      // bg3.visible = true; headerText.visible = true; bg3.interactive = true; bg4.interactive = true;
    };
    gameSetup.hideModalMessage = () => {
      bg2.visible = false;
      exitbtn.interactive = false;
      replaybtn.interactive = false;
      // if (headerText.text.indexOf("The Winner Is ") >= 0) {
        // gameSetup.exitGame();
      // }
      // bg3.visible = false; bg4.visible = false; bg3.interactive = false; bg4.interactive = false;
    };

    gameSetup.exitBtnHandler = () => {
      console.log('exitBtnHandler')
      gameSetup.hideModalMessage();
      gameSetup.hideExitWarning();
      // let id = gameSetup.activePlayerInfo.ID;
      // if (gameSetup.activePlayerInfo.isLocal) {
      //   id = gameSetup.activePlayerInfo.ID;
      // }

      if (gameSetup.renderer && gameSetup.renderer.plugins && gameSetup.renderer.plugins.interaction)
        gameSetup.renderer.plugins.interaction.destroy();

      if (gameSetup.room && gameSetup.room._id) {
        const gameState = gameSetup.isHost ? {
          secondsLeft: gameSetup.secondsLeft
        } : null;
        TankActions.leavingGame(gameSetup.room._id, gameSetup.localPlayerID, false, gameState, gameSetup.teamWon);
      }
      if (gameSetup.isLocal) {
        console.log("in exitBtnHandler with no gameSetup.networkHandler");
        // have not setup game room yet
        if (gameSetup.isLocal) {
          // const cmdstr = `ExitGameRoom;${gameSetup.currentCycleTime};0`;
          // this.saveCommand(cmdstr);
        }
        if (!gameSetup.room) return;
          // if (gameSetup.renderer.plugins.accessibility && gameSetup.renderer.plugins.accessibility.children)
          //   gameSetup.renderer.plugins.accessibility.destroy();
        switch (gameSetup.room.gameType) {
          case 1:
            gameSetup.reacthistory.push("/gamesRoomEntry");
            break;
          case 2:
            // const link = Meteor.userId() === gameSetup.room.owner ? '/gamesRoomNetwork/' : `/gamesRoomNetwork/${gameSetup.room.gameRoomId}`;
            // gameSetup.reacthistory.push(link, { notiId: gameSetup.room.notiId });
            break;
          case 4:
            // if (gameSetup.activePlayerInfo) {
            //   const params = {
            //     modalIsOpen: true,
            //     sectionKey: gameSetup.pairData.sectionId,
            //     tournamentId: gameSetup.pairData.tournamentId
            //   };
            //   TankActions.finishTournamentSectionRound(
            //     gameSetup.pairData.roundId,
            //     gameSetup.activePlayerInfo.playerUserId,
            //     gameSetup.pairData.id,
            //     PLAYER_TYPE.WINNER
            //   );
            // }
            //gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
            gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`);
            break;
          case GAME_TYPE.BATTLE:
            gameSetup.reacthistory.push('/leaderboard');
            break;
        }
        // if (gameSetup.room && gameSetup.room._id) {
        //   const gameState = gameSetup.isHost ? {
        //     secondsLeft: gameSetup.secondsLeft
        //   } : null;
        //   TankActions.leavingGame(gameSetup.room._id, gameSetup.localPlayerID, false, gameState, gameSetup.teamWon);
        // }
        return;
      } else {
        // network game
        switch (gameSetup.room.gameType) {
          case 1:
            // gameSetup.reacthistory.push("/gamesRoomEntry");
            break;
          case 2:
            // const link = Meteor.userId() === gameSetup.room.owner ? '/gamesRoomNetwork/' : `/gamesRoomNetwork/${gameSetup.room.gameRoomId}`;
            // gameSetup.reacthistory.push(link, { notiId: gameSetup.room.notiId });
            break;
          case 4:
            // if (gameSetup.activePlayerInfo) {
              const params = {
                modalIsOpen: true,
                sectionKey: gameSetup.pairData.sectionId,
                tournamentId: gameSetup.pairData.tournamentId
              };
              TankActions.finishTournamentSectionRound(
                gameSetup.pairData.roundId,
                gameSetup.playerInfo[gameSetup.localPlayerID].playerUserId,
                gameSetup.pairData.id,
                PLAYER_TYPE.LOSER
              );
            // }
            // if (gameSetup.pairData && gameSetup.pairData.sectionId) {
            //   gameSetup.reacthistory.push(`/section-info/${gameSetup.room.gameId}/${gameSetup.pairData.sectionId}`);
            // }

            //gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
            // gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`);
            break;
          case GAME_TYPE.BATTLE:
            gameSetup.reacthistory.push('/leaderboard');
            break;
        }
      }

      const id = gameSetup.localPlayerID;
      if (!gameSetup.isLocal && Array.isArray(gameSetup.arrLocalPlayerIds)) {
        for (let i = 0; i < gameSetup.arrLocalPlayerIds.length; i++) {
          const localTankId = gameSetup.arrLocalPlayerIds[i];
          const tank = gameSetup.tankControllers[localTankId].tank;
          if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[localTankId].inTestCase) continue;
          if (tank) {
            gameSetup.networkHandler.sendCommandToAll({
              c: "HurtTank", t: gameSetup.currentCycleTime, w: `${localTankId}_${tank.fullHealth}_ENDGAME`
            });
          };
        };
      }
      gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});
    };

    exitbtn.on('pointerdown', gameSetup.exitBtnHandler);

    const replayBtnHandler = () => {
      gameSetup.hideModalMessage();
      // gameSetup.exitGame();
      gameSetup.networkHandler.sendCommandToAll({ c: "RestartGame", t: gameSetup.currentCycleTime, w: ``});
      // restart game
    };
    replaybtn.on('pointerdown', replayBtnHandler);
  };


  this.addNameTagSign = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/wood-vs-sign.png"].texture);

    const ratio = (config.mazeW * 0.8) / 1111;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.mazeCenterX;
    bg.position.y = (config.TrueHeight - config.mazeH - 2 * config.metalBorderThick) / 2;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = false;
    gameSetup.stage.addChild(bg);
  };



  // this.drawTableTop = () => {
  //   const config = gameSetup.config;
  //   // new new way: draw a green table top graphics
  //   const bg = new PIXI.Sprite(PIXI.loader.resources["/images/smallclothhalf.jpg"].texture);
  //   bg.scale.set(config.mazeW / 1228, config.mazeW / 1228); // will overflow on bottom
  //   bg.position.x = config.mazeCenterX;
  //   bg.position.y = config.mazeCenterY;
  //   bg.anchor.set(0.5, 0.5);
  //   gameSetup.tablecontainer.addChild(bg);

  //   const tableg = new PIXI.Graphics();
  //   tableg.lineStyle(0);
  ///   tableg.beginFill(0x166aa0, 0.8); // original blue
  //   tableg.beginFill(0x004a80, 0.8); // original blue
  //   tableg.drawRect(config.mazeCenterX - config.mazeW / 2, config.mazeCenterY - config.mazeH / 2, config.mazeW, config.mazeH);
  //   tableg.endFill();

  //   // head string
  //   // const lineg = new PIXI.Graphics();
  //   tableg.lineStyle(1, 0xFFFFFF);
  //   tableg.moveTo(config.mazeCenterX - config.mazeW / 4, config.mazeCenterY - config.mazeH / 2 + config.cushionBarThick);
  //   tableg.lineTo(config.mazeCenterX - config.mazeW / 4, config.mazeCenterY + config.mazeH / 2 - config.cushionBarThick);
  //   gameSetup.tablecontainer.addChild(tableg);
  //   // gameSetup.tablecontainer.addChild(lineg);
  // };

  this.testDrawPockets = () => {
    const config = gameSetup.config;
    const pocketg2 = new PIXI.Graphics();
    pocketg2.lineStyle(0);
    pocketg2.beginFill(0xff0000, 0.4);


    for (let k=0; k<6; k++) {
      const p = gameSetup.tablePocket[k];
      pocketg2.drawCircle(p.x, p.y, config.ballD/2);
    }
    pocketg2.endFill();
    gameSetup.stage.addChild(pocketg2);
  }

  this.addPocketLabel = () => {
    if (gameSetup.gameType != GAME_TYPE.TESTING) return;


    const pocketIDLabelStyle = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 35,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    for (let k=0; k<6; k++) {
      const p = gameSetup.tablePocket2[k];
      const label = new PIXI.Text(k, pocketIDLabelStyle);
      label.position.x = p.x;
      label.position.y = p.y;
      label.anchor.set(0.5, 0.5);
      gameSetup.stage.addChild(label);
      // tank.ballIDLabel = label;
      // tank.body.ballIDLabel = label;
    }
  }

  this.drawPockets = () => {
    const config = gameSetup.config;

    //const shift = config.ballD / 2.35;
    const  shift = config.ballD * 1.44;

    // pocketg5.drawCircle(config.mazeCenterX - config.mazeW/2 + shift, config.mazeCenterY-config.mazeH/2 + shift, config.ballD*2.2);
    const shift2 = config.ballD * 0.9;
    // pocketg5.drawCircle(config.mazeCenterX, config.mazeCenterY-config.mazeH/2 - shift2, config.ballD*2.2);

    gameSetup.tablePocket = [];
    gameSetup.tablePocket[0] = new Victor(config.mazeCenterX - config.mazeW / 2 + shift * 1.1, config.mazeCenterY - config.mazeH / 2 + shift);
    gameSetup.tablePocket[2] = new Victor(config.mazeCenterX + config.mazeW / 2 - shift * 1.1, config.mazeCenterY - config.mazeH / 2 + shift);
    gameSetup.tablePocket[3] = new Victor(config.mazeCenterX + config.mazeW / 2 - shift * 1.1, config.mazeCenterY + config.mazeH / 2 - shift);
    gameSetup.tablePocket[5] = new Victor(config.mazeCenterX - config.mazeW / 2 + shift * 1.1, config.mazeCenterY + config.mazeH / 2 - shift);

    gameSetup.tablePocket[1] = new Victor(config.mazeCenterX, config.mazeCenterY - config.mazeH / 2 + shift2);
    gameSetup.tablePocket[4] = new Victor(config.mazeCenterX, config.mazeCenterY + config.mazeH / 2 - shift2);


    gameSetup.innerRectangle = new PIXI.Rectangle(
      config.mazeCenterX - config.mazeW / 2 + config.ballD / 2 + config.cushionBarThick,
      config.mazeCenterY - config.mazeH / 2 + config.ballD / 2 + config.cushionBarThick,
      config.mazeW - config.ballD - 2 * config.cushionBarThick,
      config.mazeH - config.ballD - 2 * config.cushionBarThick
    );

    // 4 mirror lines
    gameSetup.leftMirrorX = config.mazeCenterX - config.mazeW / 2 + config.ballD / 2 + config.cushionBarThick;
    gameSetup.rightMirrorX = config.mazeCenterX + config.mazeW / 2 - config.ballD / 2 - config.cushionBarThick;
    gameSetup.topMirrorY = config.mazeCenterY - config.mazeH / 2 + config.ballD / 2 + config.cushionBarThick;
    gameSetup.bottomMirrorY = config.mazeCenterY + config.mazeH / 2 - config.ballD / 2 - config.cushionBarThick;

    gameSetup.pocketIDMap = {};
    for (let k=0; k<6; k++) {
      gameSetup.pocketIDMap[k] = k;
    }

    // add mirrors
    gameSetup.tablePocket[6] = new Victor(gameSetup.tablePocket[0].x, 2 * gameSetup.bottomMirrorY - gameSetup.tablePocket[0].y);
    gameSetup.tablePocket[7] = new Victor(2*gameSetup.rightMirrorX - gameSetup.tablePocket[0].x, gameSetup.tablePocket[0].y);
    gameSetup.pocketIDMap[6] = 0;
    gameSetup.pocketIDMap[7] = 0;

    gameSetup.tablePocket[8] = new Victor(gameSetup.tablePocket[1].x, 2 * gameSetup.bottomMirrorY - gameSetup.tablePocket[1].y);
    gameSetup.pocketIDMap[8] = 1;

    gameSetup.tablePocket[9] = new Victor(gameSetup.tablePocket[2].x, 2 * gameSetup.bottomMirrorY - gameSetup.tablePocket[2].y);
    gameSetup.tablePocket[10] = new Victor(2*gameSetup.leftMirrorX - gameSetup.tablePocket[2].x, gameSetup.tablePocket[2].y);
    gameSetup.pocketIDMap[9] = 2;
    gameSetup.pocketIDMap[10] = 2;


    gameSetup.tablePocket[11] = new Victor(gameSetup.tablePocket[3].x, 2 * gameSetup.topMirrorY - gameSetup.tablePocket[3].y);
    gameSetup.tablePocket[12] = new Victor(2*gameSetup.leftMirrorX - gameSetup.tablePocket[3].x, gameSetup.tablePocket[3].y);
    gameSetup.pocketIDMap[11] = 3;
    gameSetup.pocketIDMap[12] = 3;

    gameSetup.tablePocket[13] = new Victor(gameSetup.tablePocket[4].x, 2 * gameSetup.topMirrorY - gameSetup.tablePocket[4].y);
    gameSetup.pocketIDMap[13] = 4;


    gameSetup.tablePocket[14] = new Victor(gameSetup.tablePocket[5].x, 2 * gameSetup.topMirrorY - gameSetup.tablePocket[5].y);
    gameSetup.tablePocket[15] = new Victor(2*gameSetup.rightMirrorX - gameSetup.tablePocket[5].x, gameSetup.tablePocket[5].y);

    gameSetup.pocketIDMap[14] = 5;
    gameSetup.pocketIDMap[15] = 5;

    const shiftdisplay = config.ballD / 2.35;
    gameSetup.tablePocket2 = [];
    gameSetup.tablePocket2[0] = new Victor(config.mazeCenterX - config.mazeW / 2 + shiftdisplay, config.mazeCenterY - config.mazeH / 2 + shiftdisplay);
    gameSetup.tablePocket2[2] = new Victor(config.mazeCenterX + config.mazeW / 2 - shiftdisplay, config.mazeCenterY - config.mazeH / 2 + shiftdisplay);
    gameSetup.tablePocket2[3] = new Victor(config.mazeCenterX + config.mazeW / 2 - shiftdisplay, config.mazeCenterY + config.mazeH / 2 - shiftdisplay);
    gameSetup.tablePocket2[5] = new Victor(config.mazeCenterX - config.mazeW / 2 + shiftdisplay, config.mazeCenterY + config.mazeH / 2 - shiftdisplay);

    gameSetup.tablePocket2[1] = new Victor(config.mazeCenterX, config.mazeCenterY - config.mazeH / 2);
    gameSetup.tablePocket2[4] = new Victor(config.mazeCenterX, config.mazeCenterY + config.mazeH / 2);




    // pocket center for telling if pocketed

    const  shift3 = 14;


    gameSetup.tablePocket3 = [];
    gameSetup.tablePocket3[0] = new Victor(config.mazeCenterX - config.mazeW / 2 + shift3, config.mazeCenterY - config.mazeH / 2 + shift3);
    gameSetup.tablePocket3[2] = new Victor(config.mazeCenterX + config.mazeW / 2 - shift3, config.mazeCenterY - config.mazeH / 2 + shift3);
    gameSetup.tablePocket3[3] = new Victor(config.mazeCenterX + config.mazeW / 2 - shift3, config.mazeCenterY + config.mazeH / 2 - shift3);
    gameSetup.tablePocket3[5] = new Victor(config.mazeCenterX - config.mazeW / 2 + shift3, config.mazeCenterY + config.mazeH / 2 - shift3);

    gameSetup.tablePocket3[1] = new Victor(config.mazeCenterX, config.mazeCenterY - config.mazeH / 2 + shift3);
    gameSetup.tablePocket3[4] = new Victor(config.mazeCenterX, config.mazeCenterY + config.mazeH / 2 - shift3);



    return;


    const metalColor = 160 * 256 * 256 + 160 * 256 + 160;
    const pocketg2 = new PIXI.Graphics();
    pocketg2.lineStyle(0);
    pocketg2.beginFill(metalColor);
    pocketg2.drawRect(config.mazeCenterX - config.mazeW / 2 - config.metalBorderThick, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick, config.mazeW + 2 * config.metalBorderThick, config.metalBorderThick);
    pocketg2.drawRect(config.mazeCenterX - config.mazeW / 2 - config.metalBorderThick, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick, config.metalBorderThick, config.metalBorderThick * 3);
    pocketg2.drawRect(config.mazeCenterX + config.mazeW / 2, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick, config.metalBorderThick, config.metalBorderThick * 3);


    pocketg2.drawRect(config.mazeCenterX - config.mazeW / 2 - config.metalBorderThick, config.mazeCenterY + config.mazeH / 2, config.mazeW + 2 * config.metalBorderThick, config.metalBorderThick);
    pocketg2.drawRect(config.mazeCenterX - config.mazeW / 2 - config.metalBorderThick, config.mazeCenterY + config.mazeH / 2 - config.metalBorderThick * 2, config.metalBorderThick, config.metalBorderThick * 3);
    pocketg2.drawRect(config.mazeCenterX + config.mazeW / 2, config.mazeCenterY + config.mazeH / 2 - config.metalBorderThick * 2, config.metalBorderThick, config.metalBorderThick * 3);

    pocketg2.endFill();
    gameSetup.tablecontainer.addChild(pocketg2);

    const pocketColor = 13 * 256 * 256 + 15 * 256 + 102;
    let sizeratio = 0.73;
    // let pocketg = gameSetup.add.graphics(config.mazeCenterX - config.mazeW / 2 + 0.25 * config.cornerPocketD / 2, config.mazeCenterY - config.mazeH / 2 - 0.8 * config.cornerPocketD / 2);
    let pocketg = new PIXI.Graphics();
    pocketg.position.set(config.mazeCenterX - config.mazeW / 2 + 0.25 * config.cornerPocketD / 2, config.mazeCenterY - config.mazeH / 2 - 0.8 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = 45 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);

    // pocketg = gameSetup.add.graphics(config.mazeCenterX + config.mazeW / 2 - 0.25 * config.cornerPocketD / 2, config.mazeCenterY - config.mazeH / 2 - 0.8 * config.cornerPocketD / 2);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.mazeCenterX + config.mazeW / 2 - 0.25 * config.cornerPocketD / 2, config.mazeCenterY - config.mazeH / 2 - 0.8 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = 45 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);

    // pocketg = gameSetup.add.graphics(config.mazeCenterX - config.mazeW / 2 - 0.75 * config.cornerPocketD / 2,
    // config.mazeCenterY + config.mazeH / 2 - 0.2 * config.cornerPocketD / 2);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.mazeCenterX - config.mazeW / 2 - 0.75 * config.cornerPocketD / 2, config.mazeCenterY + config.mazeH / 2 - 0.2 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = -45 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);

    // pocketg = gameSetup.add.graphics(config.mazeCenterX + config.mazeW / 2 + 0.75 * config.cornerPocketD / 2,
    //                                 config.mazeCenterY + config.mazeH / 2 - 0.2 * config.cornerPocketD / 2);

    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.mazeCenterX + config.mazeW / 2 + 0.75 * config.cornerPocketD / 2, config.mazeCenterY + config.mazeH / 2 - 0.2 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = 135 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);


    sizeratio = 0.8;
    // pocketg = gameSetup.add.graphics(config.mazeCenterX - sizeratio * config.sidePocketD / 2,
    //                                 config.mazeCenterY - config.mazeH / 2 - 0.45 * config.sidePocketD / 2 - config.pocketShiftSide);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.mazeCenterX - sizeratio * config.sidePocketD / 2, config.mazeCenterY - config.mazeH / 2 - 0.45 * config.sidePocketD / 2 - config.pocketShiftSide);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, sizeratio * config.sidePocketD, sizeratio * 0.9 * config.sidePocketD, config.sidePocketD / 2.5);
    pocketg.endFill();
    gameSetup.tablePocket[1].y = pocketg.y + sizeratio * 0.9 * config.sidePocketD / 2;
    gameSetup.tablecontainer.addChild(pocketg);


    // pocketg = gameSetup.add.graphics(config.mazeCenterX - sizeratio * config.sidePocketD / 2,
    //                                 config.mazeCenterY + config.mazeH / 2 + 0.45 * config.sidePocketD / 2 + config.pocketShiftSide - sizeratio * 0.9 * config.sidePocketD);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.mazeCenterX - sizeratio * config.sidePocketD / 2, config.mazeCenterY + config.mazeH / 2 + 0.45 * config.sidePocketD / 2 + config.pocketShiftSide - sizeratio * 0.9 * config.sidePocketD);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, sizeratio * config.sidePocketD, sizeratio * 0.9 * config.sidePocketD, config.sidePocketD / 2.5);
    pocketg.endFill();
    gameSetup.tablePocket[4].y = pocketg.y + sizeratio * 0.9 * config.sidePocketD / 2;
    gameSetup.tablecontainer.addChild(pocketg);
    // config.sidePocketD = config.sidePocketD * sizeratio*0.9
  };

  this.addBallBody = (w, r, x, y) => {
    const ballShape = new p2.Circle({ radius: r, material: this.ballMaterial });
    const b = new p2.Body({
        mass:1,
        position:[x, y],
        damping: 0, // controls when speed is large how it slows down
        angularDamping: 0,
        fixedRotation: true,
        angularVelocity:0,
        velocity: [0, 0]
    });
    b.name = "tank";
    b.av = new Victor(0, 0);
    b.addShape(ballShape);
    w.addBody(b);
    return b;
  };


  this.addBoxBody = (wor, w, h, x, y) => {
    const boxShape = new p2.Box({ width: w, height: h, material: this.cushionMaterial });
    const b = new p2.Body({
        mass:0,
        position:[x, y],
        damping: 0, // controls when speed is large how it slows down
        angularDamping: 0,
        fixedRotation: true,
        angularVelocity:0,
        velocity: [0, 0]
    });
    b.addShape(boxShape);
    wor.addBody(b);
    return b;
  };


  this.addPolygonBody = (points, id) => {
    const path = [];
    for (let k = 0; k < points.length - 2; k += 2) {
      path.push([points[k], points[k + 1]]);
    }

    const b = new p2.Body({ mass: 0, position: [0, 0] });
    // console.log("from polygon 1 " + JSON.stringify(path));

    b.name = `polybody${id}`;

    b.fromPolygon(path);
    b.shapes[0].material = this.cushionMaterial;
    b.mass = 0;
    world.addBody(b);

    const path2 = [];
    for (let k = 0; k < points.length - 2; k += 2) {
      path2.push([points[k], points[k + 1]]);
    }

    const b2 = new p2.Body({ mass: 0, position: [0, 0] });
    // console.log("from polygon 2 " + JSON.stringify(path2));
    b2.fromPolygon(path2);
    b2.shapes[0].material = this.cushionMaterial;
    b2.mass = 0;
    b2.name = b.name;
    world2.addBody(b2);
  };

  this.drawTargetPocket = () => {
    const config = gameSetup.config;
    const g = new PIXI.Graphics();
    g.position.x = config.mazeW * 1000;
    g.position.y = config.mazeW * 1000;
        // g.lineStyle(0);
    g.lineStyle(config.ballD / 8, 0x42f4aa, 1);
        // g.beginFill(0xffffff, config.ballD / 10); // white target
    g.drawCircle(0, 0, config.cornerPocketD * 0.3);
        // g.endFill();
    gameSetup.targetPocketMark = g;
    gameSetup.stage.addChild(g);
  };

  this.drawAimBall = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.mazeW * 1000, config.mazeH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.mazeCenterX;
    g.position.y = config.mazeCenterY;

    // g.lineStyle(config.ballD / 5, 0xffffff, 1); // 0x66b3ff, 0.8);
    // g.drawCircle(0, 0, config.ballD * 0.4);

    g.lineStyle(0, 0xffffff, 1); // 0x66b3ff, 0.8);
    //g.beginFill(0x6495ED, 1); // white target
    g.beginFill(0xF736F0, 0.5); // purple target
    g.drawCircle(0, 0, config.ballD * 0.5);
    g.endFill();


    // (x,y) coordinate for aim
    const style2 = new PIXI.TextStyle({
      //fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 40,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const aimCText = new PIXI.Text(`(0, 0)`, style2);
    aimCText.x = 0;
    aimCText.y = -80;
    aimCText.anchor.set(0.5, 0.5);
    aimCText.visible = true;
    g.addChild(aimCText);
    g.aimCText = aimCText;


    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      g.visible = false;
      g.aimCText.visible = false;
    }

    gameSetup.aimBallMark = g;
    // g.aimCText.visible = false; // aaaa
    gameSetup.stage.addChild(g);
  };


  this.drawTargetBall = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.mazeW * 1000, config.mazeH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.mazeW * 1000;
    g.position.y = config.mazeW * 1000;

    g.lineStyle(config.ballD / 8, 0x42f4aa, 1); // 0x66b3ff, 0.8);
        // g.beginFill(0xffffff, config.ballD / 10); // white target
    g.drawCircle(0, 0, config.ballD * 0.6);
        // g.endFill();
    gameSetup.targetBallMark = g;
    gameSetup.stage.addChild(g);
  };

  this.drawFirstBall = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.mazeW * 1000, config.mazeH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.mazeW * 1000;
    g.position.y = config.mazeW * 1000;

    g.lineStyle(config.ballD / 10, autobuttoncolor, 1); // 0x66b3ff, 0.8);
    g.beginFill(autobuttoncolor, 1); // white target
    g.drawCircle(0, 0, config.ballD * 0.15);
    g.endFill();
    gameSetup.firstBallMark = g;
    gameSetup.stage.addChild(g);
  };

  this.parallelShift = (cushiong, cline) => {
    const v12 = cline.p2.clone().subtract(cline.p1);
    const shift = v12.rotate(Math.PI / 2).normalize().scale(gameSetup.config.ballD * 0.99999/2);
    cline.p1.add(shift);
    cline.p2.add(shift);
    gameSetup.cushionLines.push(cline);
    // this.drawLine(cushiong, cline);
  };

  this.drawLine = (g, cline) => {
    g.lineStyle(2, 0x00ff00);
    g.moveTo(cline.p1.x, cline.p1.y);
    g.lineTo(cline.p2.x, cline.p2.y);
    // gameSetup.tablecontainer.addChild(g);
  };

  this.drawTableCushionBars = () => {
    const config = gameSetup.config;
    // const borderg = gameSetup.add.graphics(0, 0);

    // 0. metal border
    // borderg.lineStyle(0);


    // if (false) {
    //   // testing rebounding by adding boxes
    //   this.addBoxBody(world2, 10000, 10000, config.mazeCenterX + config.mazeW/2 + 5000 - 200, config.mazeCenterY);
    //   this.addBoxBody(world2, 10000, 10000, config.mazeCenterX - config.mazeW/2 - 5000 + 200, config.mazeCenterY);
    // }


    // // 1.9 pocket metal
    // const metalColor = 160 * 256 * 256 + 160 * 256 + 160;
    // // var pocketg2 = gameSetup.add.graphics(0, 0);

    // // 3. table border bars
    // const borderg = new PIXI.Graphics();
    // borderg.lineStyle(0, metalColor);
    // // borderg.beginFill(4*256*256+222*256+227); // green grass
    // // borderg.beginFill(91 * 256 * 256 + 46 * 256 + 0); // brown wood
    // borderg.beginFill(0x261604);
    // // borderg.beginFill(30*256*256+30*256+30);

    // let sizeratio = 0.8; // same as used in drawing side pocket
    // borderg.drawRect(config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift,
    //   config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick,
    //   config.mazeW / 2 - sizeratio * config.sidePocketD / 2 - config.cornerPocketD / 2,
    //   config.metalBorderThick);
    // borderg.drawRect(config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift,
    //   config.mazeCenterY + config.mazeH / 2,
    //   config.mazeW / 2 - sizeratio * config.sidePocketD / 2 - config.cornerPocketD / 2,
    //   config.metalBorderThick);

    // borderg.drawRect(config.mazeCenterX + sizeratio * config.sidePocketD / 2,
    //   config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick,
    //   config.mazeW / 2 - sizeratio * config.sidePocketD / 2 - config.cornerPocketD / 2,
    //   config.metalBorderThick);
    // borderg.drawRect(config.mazeCenterX + sizeratio * config.sidePocketD / 2,
    //   config.mazeCenterY + config.mazeH / 2,
    //   config.mazeW / 2 - sizeratio * config.sidePocketD / 2 - config.cornerPocketD / 2,
    //   config.metalBorderThick);

    // borderg.drawRect(config.mazeCenterX - config.mazeW / 2 - config.metalBorderThick,
    //   config.mazeCenterY - config.mazeH / 2 + 1.2 * config.sidePocketD / 2,
    //   config.metalBorderThick, config.mazeH - 1.12 * config.sidePocketD);
    // borderg.drawRect(config.mazeCenterX + config.mazeW / 2,
    //   config.mazeCenterY - config.mazeH / 2 + 1.2 * config.sidePocketD / 2,
    //   config.metalBorderThick, config.mazeH - 1.12 * config.sidePocketD);

    // borderg.endFill();
    // gameSetup.tablecontainer.addChild(borderg);


    // // add small white dots on border to look better
    // const dotg = new PIXI.Graphics();
    // dotg.lineStyle(0, metalColor);
    // dotg.beginFill(0xffffff);

    // dotg.drawCircle(config.mazeCenterX - config.mazeW / 4, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX - config.mazeW / 8, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX - 3 * config.mazeW / 8, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick / 2, config.ballD / 3);

    // dotg.drawCircle(config.mazeCenterX + config.mazeW / 4, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX + config.mazeW / 8, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX + 3 * config.mazeW / 8, config.mazeCenterY - config.mazeH / 2 - config.metalBorderThick / 2, config.ballD / 3);


    // dotg.drawCircle(config.mazeCenterX - config.mazeW / 4, config.mazeCenterY + config.mazeH / 2 + config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX - config.mazeW / 8, config.mazeCenterY + config.mazeH / 2 + config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX - 3 * config.mazeW / 8, config.mazeCenterY + config.mazeH / 2 + config.metalBorderThick / 2, config.ballD / 3);

    // dotg.drawCircle(config.mazeCenterX + config.mazeW / 4, config.mazeCenterY + config.mazeH / 2 + config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX + config.mazeW / 8, config.mazeCenterY + config.mazeH / 2 + config.metalBorderThick / 2, config.ballD / 3);
    // dotg.drawCircle(config.mazeCenterX + 3 * config.mazeW / 8, config.mazeCenterY + config.mazeH / 2 + config.metalBorderThick / 2, config.ballD / 3);


    // let centerx = config.mazeCenterX - config.mazeW / 2 - config.metalBorderThick / 2;
    // dotg.drawCircle(centerx, config.mazeCenterY - config.mazeH / 4, config.ballD / 3);
    // dotg.drawCircle(centerx, config.mazeCenterY, config.ballD / 3);
    // dotg.drawCircle(centerx, config.mazeCenterY + config.mazeH / 4, config.ballD / 3);

    // centerx = config.mazeCenterX + config.mazeW / 2 + config.metalBorderThick / 2;
    // dotg.drawCircle(centerx, config.mazeCenterY - config.mazeH / 4, config.ballD / 3);
    // dotg.drawCircle(centerx, config.mazeCenterY, config.ballD / 3);
    // dotg.drawCircle(centerx, config.mazeCenterY + config.mazeH / 4, config.ballD / 3);

    // dotg.endFill();
    // gameSetup.tablecontainer.addChild(dotg);



    // 4. table cushion bars
    const cushiong = new PIXI.Graphics();
    cushiong.lineStyle(1, 30 * 256 * 256 + 30 * 256 + 30);
    // borderg.beginFill(103*256*256+58*256+29);
    // cushiong.beginFill(64 * 256 * 256 + 93 * 256 + 170, 0.7); // blue
    // cushiong.beginFill(0 * 256 * 256 + 170 * 256 + 70, 0.7); // green
    // cushiong.beginFill(0x1c87cc, 0.7); // blue
    cushiong.beginFill(0x166aa0, 0.4); // blue


    this.cushions = [];

    gameSetup.cushionLines = [];
    gameSetup.cushionCorners = [];

    const sizeratio = 0.85; // for side pocket
    // upper left cushion
    const points0 = [
      config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.mazeCenterY - config.mazeH / 2,

      config.mazeCenterX - sizeratio * config.sidePocketD / 2,
      config.mazeCenterY - config.mazeH / 2,

      config.mazeCenterX - sizeratio * config.sidePocketD / 2 - config.cushionBarShift / 4,
      config.mazeCenterY - config.mazeH / 2 + config.cushionBarThick,

      config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift + config.cushionBarShift,
      config.mazeCenterY - config.mazeH / 2 + config.cushionBarThick,

      config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.mazeCenterY - config.mazeH / 2
    ];
    cushiong.drawPolygon(points0);
    this.addPolygonBody(points0, 0);
    gameSetup.cushionCorners.push(new Victor(points0[6], points0[7]));
    gameSetup.cushionCorners.push(new Victor(points0[4], points0[5]));

    this.parallelShift(cushiong, { p1: new Victor(points0[0], points0[1]), p2: new Victor(points0[6], points0[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points0[6], points0[7]), p2: new Victor(points0[4], points0[5]), });
    this.parallelShift(cushiong, { p1: new Victor(points0[4], points0[5]), p2: new Victor(points0[2], points0[3]), });


    // verify inner rectangle is same as the new cushion lines
    // gameSetup.innerRectangle = new PIXI.Rectangle(
    //   config.mazeCenterX - config.mazeW / 2 + config.ballD / 2 + config.cushionBarThick,
    //   config.mazeCenterY - config.mazeH / 2 + config.ballD / 2 + config.cushionBarThick,
    //   config.mazeW - config.ballD - 2 * config.cushionBarThick,
    //   config.mazeH - config.ballD - 2 * config.cushionBarThick
    // );
    // cushiong.moveTo(config.mazeCenterX - config.mazeW / 2 + config.ballD / 2 + config.cushionBarThick, config.mazeCenterY - config.mazeH / 2 + config.ballD / 2 + config.cushionBarThick);
    // cushiong.lineTo(config.mazeCenterX - config.mazeW / 2 + config.ballD / 2 + config.cushionBarThick + config.mazeW - config.ballD - 2 * config.cushionBarThick, config.mazeCenterY - config.mazeH / 2 + config.ballD / 2 + config.cushionBarThick);
    // cushiong.lineTo(config.mazeCenterX - config.mazeW / 2 + config.ballD / 2 + config.cushionBarThick + config.mazeW - config.ballD - 2 * config.cushionBarThick, config.mazeCenterY - config.mazeH / 2 + config.ballD / 2 + config.cushionBarThick + config.mazeH - config.ballD - 2 * config.cushionBarThick);


    // const p0 = this.add.sprite(0, 0);
    // this.physics.p2.enable(p0, false);
    //  p0.body.clearShapes();
    //  p0.body.addPolygon({}, points0);
    //  p0.body.static = true;
    // this.cushions.push(p0);

    // bottom left cushion
    const points1 = [
      config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.mazeCenterY + config.mazeH / 2,

      config.mazeCenterX - sizeratio * config.sidePocketD / 2,
      config.mazeCenterY + config.mazeH / 2,

      config.mazeCenterX - sizeratio * config.sidePocketD / 2 - config.cushionBarShift / 4,
      config.mazeCenterY + config.mazeH / 2 - config.cushionBarThick,

      config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift + config.cushionBarShift,
      config.mazeCenterY + config.mazeH / 2 - config.cushionBarThick,

      config.mazeCenterX - config.mazeW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.mazeCenterY + config.mazeH / 2
    ];
    cushiong.drawPolygon(points1);
    this.addPolygonBody(points1, 1);
    gameSetup.cushionCorners.push(new Victor(points1[6], points1[7]));
    gameSetup.cushionCorners.push(new Victor(points1[4], points1[5]));

    this.parallelShift(cushiong, { p2: new Victor(points1[0], points1[1]), p1: new Victor(points1[6], points1[7]), });
    this.parallelShift(cushiong, { p2: new Victor(points1[6], points1[7]), p1: new Victor(points1[4], points1[5]), });
    this.parallelShift(cushiong, { p2: new Victor(points1[4], points1[5]), p1: new Victor(points1[2], points1[3]), });

    // const p1 = this.add.sprite(0, 0); this.physics.p2.enable(p1, false); p1.body.clearShapes(); p1.body.addPolygon({}, points1); p1.body.static = true;
    // this.cushions.push(p1);

    // upper right cushion
    const points2 = [
      config.mazeCenterX * 2 - points0[0], points0[1],
      config.mazeCenterX * 2 - points0[2], points0[3],
      config.mazeCenterX * 2 - points0[4], points0[5],
      config.mazeCenterX * 2 - points0[6], points0[7],
      config.mazeCenterX * 2 - points0[0], points0[1]
    ];
    cushiong.drawPolygon(points2);
    this.addPolygonBody(points2, 2);
    gameSetup.cushionCorners.push(new Victor(points2[6], points2[7]));
    gameSetup.cushionCorners.push(new Victor(points2[4], points2[5]));

    this.parallelShift(cushiong, { p1: new Victor(points2[6], points2[7]), p2: new Victor(points2[0], points2[1]), });
    this.parallelShift(cushiong, { p1: new Victor(points2[4], points2[5]), p2: new Victor(points2[6], points2[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points2[2], points2[3]), p2: new Victor(points2[4], points2[5]), });


    // const p2 = this.add.sprite(0, 0); this.physics.p2.enable(p2, false); p2.body.clearShapes(); p2.body.addPolygon({}, points2); p2.body.static = true;
    // this.cushions.push(p2);

    // lower right cushion
    const points3 = [
      config.mazeCenterX * 2 - points1[0], points1[1],
      config.mazeCenterX * 2 - points1[2], points1[3],
      config.mazeCenterX * 2 - points1[4], points1[5],
      config.mazeCenterX * 2 - points1[6], points1[7],
      config.mazeCenterX * 2 - points1[0], points1[1]
    ];
    cushiong.drawPolygon(points3);
    this.addPolygonBody(points3, 3);
    gameSetup.cushionCorners.push(new Victor(points3[6], points3[7]));
    gameSetup.cushionCorners.push(new Victor(points3[4], points3[5]));

    this.parallelShift(cushiong, { p1: new Victor(points3[0], points3[1]), p2: new Victor(points3[6], points3[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points3[6], points3[7]), p2: new Victor(points3[4], points3[5]), });
    this.parallelShift(cushiong, { p1: new Victor(points3[4], points3[5]), p2: new Victor(points3[2], points3[3]), });

    // const p3 = this.add.sprite(0, 0); this.physics.p2.enable(p3, false); p3.body.clearShapes(); p3.body.addPolygon({}, points3); p3.body.static = true;
    // this.cushions.push(p3);


    // left cushion
    const points4 = [
      config.mazeCenterX - config.mazeW / 2,
      config.mazeCenterY - config.mazeH / 2 + 1.15 * config.sidePocketD / 2,

      config.mazeCenterX - config.mazeW / 2,
      config.mazeCenterY + config.mazeH / 2 - 1.15 * config.sidePocketD / 2,

      config.mazeCenterX - config.mazeW / 2 + config.cushionBarThick,
      config.mazeCenterY + config.mazeH / 2 - 1.5 * config.sidePocketD / 2 - config.cushionBarShift,

      config.mazeCenterX - config.mazeW / 2 + config.cushionBarThick,
      config.mazeCenterY - config.mazeH / 2 + 1.5 * config.sidePocketD / 2 + config.cushionBarShift,

      config.mazeCenterX - config.mazeW / 2,
      config.mazeCenterY - config.mazeH / 2 + 1.15 * config.sidePocketD / 2

    ];
    cushiong.drawPolygon(points4);
    this.addPolygonBody(points4, 4);
    gameSetup.cushionCorners.push(new Victor(points4[6], points4[7]));
    gameSetup.cushionCorners.push(new Victor(points4[4], points4[5]));

    this.parallelShift(cushiong, { p2: new Victor(points4[0], points4[1]), p1: new Victor(points4[6], points4[7]), });
    this.parallelShift(cushiong, { p2: new Victor(points4[6], points4[7]), p1: new Victor(points4[4], points4[5]), });
    this.parallelShift(cushiong, { p2: new Victor(points4[4], points4[5]), p1: new Victor(points4[2], points4[3]), });

    // const p4 = this.add.sprite(0, 0); this.physics.p2.enable(p4, false); p4.body.clearShapes(); p4.body.addPolygon({}, points4); p4.body.static = true;
    // this.cushions.push(p4);

    const points5 = [
      config.mazeCenterX * 2 - points4[0], points4[1],
      config.mazeCenterX * 2 - points4[2], points4[3],
      config.mazeCenterX * 2 - points4[4], points4[5],
      config.mazeCenterX * 2 - points4[6], points4[7],
      config.mazeCenterX * 2 - points4[0], points4[1]
    ];
    cushiong.drawPolygon(points5);
    this.addPolygonBody(points5, 5);
    gameSetup.cushionCorners.push(new Victor(points5[6], points5[7]));
    gameSetup.cushionCorners.push(new Victor(points5[4], points5[5]));
    this.parallelShift(cushiong, { p1: new Victor(points5[0], points5[1]), p2: new Victor(points5[6], points5[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points5[6], points5[7]), p2: new Victor(points5[4], points5[5]), });
    this.parallelShift(cushiong, { p1: new Victor(points5[4], points5[5]), p2: new Victor(points5[2], points5[3]), });

    // const p5 = this.add.sprite(0, 0); this.physics.p2.enable(p5, false); p5.body.clearShapes(); p5.body.addPolygon({}, points5); p5.body.static = true;
    // this.cushions.push(p5);


    // for (let i = 0; i < this.cushions.length; i++) {
    //   const pp = this.cushions[i];
    //         // gameSetup.physics.enable(pp, Phaser.Physics.P2JS);
    //   pp.body.setMaterial(this.cushionMaterial);
    //   pp.body.setCollisionGroup(this.borderCollisionGroup);
    //   pp.body.collides([this.ballCollisionGroup]);
    // }

    cushiong.endFill();
    // gameSetup.stage.addChild(cushiong); // aaaa test cushion bar by setting them visible!
  };

  this.createAllCollisionGroups = () => {
    this.ballCollisionGroup = gameSetup.physics.p2.createCollisionGroup();
    this.borderCollisionGroup = gameSetup.physics.p2.createCollisionGroup(); gameSetup.physics.p2.updateBoundsCollisionGroup();
  };

  this.createMaterials = () => {
    this.cushionMaterial =  new p2.Material();
    this.ballMaterial =  new p2.Material();


    this.ballCushionMaterial = new p2.ContactMaterial(this.ballMaterial, this.cushionMaterial, {
      friction: 0,
      restitution: 1,
      stiffness : Number.MAX_VALUE
      // stiffness: 0.1,
      // relaxation: 3000000,
      // frictionStiffness: 0.1,
      // frictionRelaxation: 3000000
      // surfaceelocity: 10000
    });
    gameSetup.world.addContactMaterial(this.ballCushionMaterial);
    gameSetup.world2.addContactMaterial(this.ballCushionMaterial);

    this.ballBallMaterial = new p2.ContactMaterial(this.ballMaterial, this.ballMaterial, {
      friction: 0,
      stiffness : Number.MAX_VALUE,
      restitution: 1
    });
    gameSetup.world.addContactMaterial(this.ballBallMaterial);
    gameSetup.world2.addContactMaterial(this.ballBallMaterial);





    // //  ere is the contact material. It's a combination of 2 materials, so whenever shapes with
    // //  those 2 materials collide it uses the following settings.
    // //  A single material can be used by as many different sprites as you lie.
    // this.ballCushionMaterial = gameSetup.physics.p2.createContactMaterial(this.ballMaterial, this.cushionMaterial);
    // this.ballCushionMaterial.friction = 0;      // riction to use in the contact of these two materials.
    // this.ballCushionMaterial.restitution = 1;  // restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

    // if very stiff, then will not deform
    // this.ballCushionMaterial.stiffness = 1e9;     // Stiffness of the resulting contactuation that that ContactMaterial generate.
    // this.ballCushionMaterial.relaxation = 3;      // Relaxation of the resulting ContactEquation setup setup ContactMaterial generate.
    // this.ballCushionMaterial.frictionStiffness = 1e7;     // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
    // this.ballCushionMaterial.frictionRelaxation = 3;      // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
    // this.ballCushionMaterial.surfaceelocity = 0;         // Will add surface velocity to  this material. If bodyA rests on top if bodyB, and the surface velocity is positive,bodyA will slide to the right.


    // this.ballBallMaterial = gameSetup.physics.p2.createContactMaterial(this.ballMaterial, this.ballMaterial);
    // this.ballBallMaterial.friction = 0;      // riction to use in the contact of these two materials.
    // this.ballBallMaterial.restitution = 1;  // restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

    // // if very stiff, then will not deform
    // this.ballBallMaterial.stiffness = 1e9;     // Stiffness of the resulting contactuation that that ContactMaterial generate.

    // high relaxation means when it returns to usual form after deform, it'll be fast

    // this.ballBallMaterial.relaxation = 100;      // Relaxation of the resulting ContactEquation setup setup ContactMaterial generate.
    // this.ballBallMaterial.frictionStiffness = 100;     // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
    // this.ballBallMaterial.frictionRelaxation = 100;      // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
    // this.ballBallMaterial.surfaceelocity = 0;         // Will add surface velocity to  this material. If bodyA rests on top if bodyB, and the surface velocity is positive,bodyA will slide to the right.
  };


  this.createTableRenderer = () => {
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "PoolTableDiv");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }

    // calculate rendering size of div, based on whether this is testing or not
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // only show table
      // cfg.tableTop = 0;

    } else {
      // table is at lower left portion of overall div
      // table inside area is mazeW, which is truewidth * 0.86; so ratio of table plus border is wratio > 0.86
      const wratio = (cfg.mazeW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.mazeH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;
    }


    tablerenderer = PIXI.autoDetectRenderer(w, h, { transparent: false, antialias: true });
    tableDiv.appendChild(tablerenderer.view);
    tablerenderer.view.setAttribute("id", "PoolTableCanvas");

    // actual size on page, to be used for scaling objects later
    // tablerenderer.displayW = w;
    // tablerenderer.displayH = h;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    tablerenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:105`);

    gameSetup.tablecontainer = new PIXI.Container();
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // only show table
      // cfg.tableTop = 0;
      gameSetup.tablecontainer.scale.x = w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.tablecontainer.scale.y = h / (cfg.mazeH + 2 * cfg.metalBorderThick);
    } else {
      // same scaling as all
      gameSetup.tablecontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.tablecontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
    }
  };

  this.createBallRenderer = () => {
    // transparent canvas just for the tanks, so we don't need to re-render the table!!
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "BallDiv");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }

    // calculate rendering size of div, based on whether this is testing or not
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // only show table

    } else {
      // table is at lower left portion of overall div
      const wratio = (cfg.mazeW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.mazeH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;
    }

    ballrenderer = PIXI.autoDetectRenderer(w, h, { transparent: true, antialias: true });
    tableDiv.appendChild(ballrenderer.view);
    ballrenderer.view.setAttribute("id", "BallCanvas");
    ballrenderer.plugins.interaction.autoPreventDefault = true;

    // actual size on page, to be used for scaling objects later
    // ballrenderer.displayW = w;
    // ballrenderer.displayH = h;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    ballrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:200`);

    gameSetup.ballcontainer = new PIXI.Container();
    // gameSetup.stage.scale.x = w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
    // gameSetup.stage.scale.y = h / (cfg.TrueHeight); //h / (cfg.mazeH + 2 * cfg.metalBorderThick);

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // only show table
      // cfg.tableTop = 0;
      gameSetup.stage.scale.x = w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.stage.scale.y = h / (cfg.mazeH + 2 * cfg.metalBorderThick);
    } else {
      // same scaling as all
      gameSetup.stage.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.stage.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
    }

    this.setupAimingHandler();
  };

  // this.addWinnerMessage = () => {
  //   // message text
  //   const style = new PIXI.TextStyle({
  //     fontFamily:  "\"Droid Sans\", sans-serif",
  //     fontSize: 60,
  //     fontStyle: 'italic',
  //     fontWeight: 'bold',
  //     fill: ['#f4df42'],
  //     stroke: '#cc2c52',
  //     strokeThickness: 2,
  //     dropShadow: false,
  //     dropShadowColor: '#000000',
  //     dropShadowBlur: 1,
  //     dropShadowAngle: Math.PI / 6,
  //     dropShadowDistance: 2,
  //     wordWrap: false,
  //     wordWrapWidth: 10000
  //   });

  //   const overlayText = new PIXI.Text(`Winner Is`, style);
  //   overlayText.x = gameSetup.config.mazeCenterX;
  //   overlayText.y = gameSetup.config.mazeCenterY - gameSetup.config.mazeH / 6;
  //   overlayText.anchor.set(0.5, 0.5);

  //   const overlayText2 = new PIXI.Text(`abc`, style);
  //   overlayText2.x = gameSetup.config.mazeCenterX;
  //   overlayText2.y = gameSetup.config.mazeCenterY;
  //   overlayText2.anchor.set(0.5, 0.5);


  //   overlayText.visible = false;
  //   overlayText2.visible = false;

  //   gameSetup.stage.addChild(overlayText);
  //   gameSetup.stage.addChild(overlayText2);



  //   // exit button
  //   const buttony = gameSetup.config.mazeCenterY + gameSetup.config.mazeH / 6;
  //   const buttonx = gameSetup.config.mazeCenterX;
  //   const btnWidth = gameSetup.config.mazeW / 5;
  //   const btnHeight = gameSetup.config.mazeH / 8;
  //   const g = new PIXI.Graphics();
  //   g.lineStyle(5, 0xdddddd, 1);
  //   g.beginFill(0x895120, 1); // 132fef
  //   g.drawRoundedRect(buttonx - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight, btnHeight/10);

  //   gameSetup.stage.addChild(g);

  //   g.visible = false;
  //   g.interactive = false;
  //   g.buttonMode = true;
  //   g.hitArea = new PIXI.Rectangle(buttonx - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight);
  //   g.on('pointerdown', () => {
  //     gameSetup.exitGame();
  //   });

  //   const style2 = new PIXI.TextStyle({
  //       //fontFamily:  "\"Droid Sans\", sans-serif",
  //       fontFamily: "\"Comic Sans MS\", cursive, sans-serif",
  //       fontSize: 30,
  //       // fontStyle: 'italic',
  //       // fontWeight: 'bold',
  //       fill: ['#ffffff'],
  //       stroke: '#4a1850',
  //       strokeThickness: 2,
  //       dropShadow: false,
  //       dropShadowColor: '#000000',
  //       dropShadowBlur: 2,
  //       dropShadowAngle: Math.PI / 6,
  //       dropShadowDistance: 2,
  //       wordWrap: false,
  //       wordWrapWidth: 440
  //   });

  //   const ExitText = new PIXI.Text(`Exit Game`, style2);
  //   ExitText.x = buttonx;
  //   ExitText.y = buttony;
  //   ExitText.anchor.set(0.5, 0.5);
  //   ExitText.visible = false;
  //   gameSetup.stage.addChild(ExitText);




  //   // gameSetup.showWinner = (id, name) => {
  //   //   overlayText.text = `WINNER IS PLAYER ${id}`;
  //   //   overlayText.visible = true;
  //   //   overlayText2.text = `${name}`;
  //   //   overlayText2.visible = true;

  //   //   g.visible = true;
  //   //   g.interactive = true;
  //   //   g.buttonMode = true;

  //   //   ExitText.visible = true;
  //   // };
  // };




  // const touchPos = new Victor(0, 0);

  this.createControlRenderer = () => {

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // shouldn't be here!
      return;
    }

    // bottom render for top and right controls
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "ControlDiv");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }

    cfg.tableTop = cfg.TrueHeight - cfg.mazeH - cfg.metalBorderThick*2;
    cfg.tableRight = cfg.TrueWidth - cfg.mazeW - cfg.metalBorderThick*2;

    // calculate rendering size of div, based on whether this is testing or not
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // shouldn't be here!
      return;

    } else {
      // table is at lower left portion of overall div
    }

    controlrenderer = PIXI.autoDetectRenderer(w, h, { transparent: false, antialias: true });
    tableDiv.appendChild(controlrenderer.view);
    controlrenderer.view.setAttribute("id", "controlCanvas");
    // controlrenderer.plugins.interaction.autoPreventDefault = true;

    // actual size on page, to be used for scaling objects later
    // controlrenderer.displayW = w;
    // controlrenderer.displayH = h;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    controlrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:100`);

    gameSetup.controlcontainer = new PIXI.Container();
    gameSetup.controlcontainer.scale.x = w / (cfg.TrueWidth);
    gameSetup.controlcontainer.scale.y = h / (cfg.TrueHeight);
  };





  const loadPlayRightBall = (cc, x, y, color) => {
    let ballfile = 'white';
    switch (color) {
      case Pool.RED: ballfile = 'red'; break;
      case Pool.YELLOW: ballfile = 'yellow'; break;
      case Pool.BLACK: ballfile = 'black'; break;
    }

    that.loadFramedSpriteSheet(`/images/new${ballfile}ballrolling.png`, ballfile, 41, 41, (frames) => {
      const tank = new PIXI.extras.AnimatedSprite(frames);
      tank.scale.set(gameSetup.config.ballD * 1.5 / 41);

      tank.position.x = x;
      tank.position.y = y;
      tank.anchor.x = 0.5;
      tank.anchor.y = 0.5;

      let ballframe = 10;
      if (color == Pool.WHITE) {
        ballframe = 10;
        tank.visible = true;
      } else {
        tank.visible = false;
      }

      tank.frame = ballframe;
      tank.gotoAndStop(tank.frame);
      tank.rotation = Math.PI / 2; // (Math.random() * Math.PI * 2);
      tank.animationSpeed = 0.5;
      tank.interactive = false;

      cc.ballIcons[color] = tank;
      gameSetup.stage.addChild(tank);
    });
  };

  this.addPlayerPanelNew = (c, pi) => {
    const config = gameSetup.config;
    //const gb = this.gameSetup.add.graphics(0, 0);
    const gb = new PIXI.Graphics();
    gameSetup.stage.addChild(gb);

    this.addPlayerTimer(c, pi);
    c.ballIcons = [];


    loadPlayRightBall(c, c.cx - c.w * 0.43, c.cy + c.h * 0, Pool.WHITE);
    loadPlayRightBall(c, c.cx - c.w * 0.43, c.cy + c.h * 0, Pool.RED);
    loadPlayRightBall(c, c.cx - c.w * 0.43, c.cy + c.h * 0, Pool.YELLOW);
    loadPlayRightBall(c, c.cx - c.w * 0.43, c.cy + c.h * 0, Pool.BLACK);

    // grey area for name tag

    // const ratio = (config.mazeW * 0.38) / 100;

    // const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/nametaggrey.png"].texture);
    // bg2.scale.set(ratio, ratio); // will overflow on bottom
    // bg2.position.x = c.cx + c.w * 0;
    // bg2.position.y = c.cy;
    // bg2.anchor.set(0.5, 0.5);
    // bg2.interactive = false;
    // gameSetup.stage.addChild(bg2);
    // bg2.alpha = 0.9;
    // bg2.visible = true;


    c.showNameTag = (color, isActive) => {
      // console.log("show name tag " + color);
      for (let k=0; k <= 3; k++) {
        if (color == k) {
          c.ballIcons[k].visible = true;
          if (isActive) {
            c.ballIcons[k].play();
          } else {
            c.ballIcons[k].stop();
          }
        } else {
          c.ballIcons[k].visible = false;
          c.ballIcons[k].stop();
        }
      }
    };

    c.showNameTag(Pool.WHITE);

    const size = Math.floor(2 * config.scalingratio);

    // // add player ID 1 or 2

    // const style0 = new PIXI.TextStyle({
    //   fontFamily:  "\"Droid Sans\", sans-serif",
    //   fontSize: size * 1.6,
    //   // fontStyle: 'italic',
    //   fontWeight: 'bold',
    //   fill: ['#000000'],
    //   stroke: '#000000',
    //   strokeThickness: 2,
    //   dropShadow: false,
    //   dropShadowColor: '#000000',
    //   dropShadowBlur: 2,
    //   dropShadowAngle: Math.PI / 6,
    //   dropShadowDistance: 2,
    //   wordWrap: false,
    //   wordWrapWidth: 440
    // });

    // const textID = new PIXI.Text(`${c.PanelID}.`, style0);
    // textID.position.x = c.cx - c.w / 2 - 10;
    // textID.position.y = c.cy;
    // textID.anchor.set(0.5, 0.5);
    // gameSetup.stage.addChild(textID);





    // // add human or robo icon
    // let s;
    // const scaling = c.h * 0.6 / (128 * 1);
    // if (c.isHuman) {
    //   // s = gameSetup.add.sprite(c.cx - c.w / 2 - c.w * 0.1, c.cy - c.h / 2 + c.h / 5, 'humanicon');
    //   // s.scale.set(scaling * 1.2, scaling);

    //   s = new PIXI.Sprite(PIXI.loader.resources['/images/human1.png'].texture);
    //   s.position.x = c.cx - c.w / 2 - c.w * 0.12 + 50;
    //   s.position.y = c.cy - c.h / 2 + c.h / 5;
    //   // s.anchor.set(0.5, 0.5);
    //   s.scale.set(scaling * 1.2, scaling);
    // } else {
    //   // s = gameSetup.add.sprite(c.cx - c.w / 2 - c.w * 0.05, c.cy - c.h / 2 + c.h / 5, 'roboticon');
    //   // s.scale.set(scaling * 0.7, scaling);
    //   s = new PIXI.Sprite(PIXI.loader.resources['/images/robot1.png'].texture);
    //   s.position.x = c.cx - c.w / 2 - c.w * 0.07 + 50;
    //   s.position.y = c.cy - c.h / 2 + c.h / 5;
    //   // s.anchor.set(0.5, 0.5);
    //   s.scale.set(scaling * 1.2, scaling);
    // }
    // gameSetup.stage.addChild(s);
    // s.tint = 0x000000;

    // const style = { font: `bold ${size}px Arial`, fill: '#000000', boundsAlignH: 'center', boundsAlignV: 'middle' };
    // const text = gameSetup.add.text(0, 0, c.userName, style);
    // text.setTextBounds(c.cx - c.w * 0.44, c.cy - c.h * 0.45, c.w * 0.8, c.h);


    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: '',
      // fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 2440
    });

    const text = new PIXI.Text(c.userName, style);
    text.position.x = c.cx + c.w * 0;
    text.position.y = c.cy;
    text.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(text);


    c.showPlayerAsActive = (isActive) => {
      let tint = 0x666666;
      if (isActive) {
        // bg2.visible = false;
        tint = 0xffffff;
      }
      text.tint = tint;
      c.countdownClockText.tint = tint;
      for (let k=0; k <= 3; k++) {
        if (c.ballIcons[k].visible) {
          c.ballIcons[k].tint = tint;
          if (isActive)
            c.ballIcons[k].play();
          else
            c.ballIcons[k].stop();
        }
      }
    };
    return gb;
  };

  this.addProbText = () => {
    const config = gameSetup.config;
    const size = Math.floor(2.4 * config.scalingratio);
    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 2440
    });

    const text = new PIXI.Text("[ - ]", style);
    text.position.x = config.TrueWidth - (config.TrueWidth - config.mazeW - 2 * config.metalBorderThick) * 0.251;
    text.position.y = (config.TrueHeight - config.mazeH - 2 * config.metalBorderThick) * 0.5 ;
    text.anchor.set(0.5, 0.5);
    gameSetup.probText = text;
    gameSetup.stage.addChild(text);
  };

  this.addPlayerPanel = (c) => {
    const config = gameSetup.config;
    //const gb = this.gameSetup.add.graphics(0, 0);
    const gb = new PIXI.Graphics();
    gameSetup.stage.addChild(gb);

    this.addPlayerTimer(c);

    const loadNameTag = function(name) {
      //const tag = gameSetup.add.sprite(c.cx, c.cy + 2, name);
      const tag = new PIXI.Sprite(PIXI.loader.resources[name].texture);
      tag.position.x = c.cx - 216;
      tag.position.y = c.cy + 2;
      tag.anchor.set(0, 0.5);
      tag.scale.set(0.75, 0.5);
      gameSetup.stage.addChild(tag);
      tag.visible = false;
      return tag;
    };

    c.showNameTag = (color) => {
      // console.log("show name tag " + color);
      if (color == Pool.BLANK) {
        c.nameTagRed.visible = false;
        c.nameTagYellow.visible = false;
        c.nameTagWhite.visible = false;
        c.nameTagBlank.visible = true;
        return;
      }

      c.nameTagBlank.visible = false;

      let tag = c.nameTagBlank;
      switch (color) {
        case Pool.RED: tag = c.nameTagRed; break;
        case Pool.YELLOW: tag = c.nameTagYellow; break;
        case Pool.WHITE: tag = c.nameTagWhite; break;
      }
      if (tag.visible) return;

      c.nameTagRed.visible = false;
      c.nameTagYellow.visible = false;
      c.nameTagWhite.visible = false;

      tag.visible = true;

      // tag.alpha = 0;
      // const obj = { alpha: 0 };
      // const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
      //   .to({ alpha: 1 }, 600) // if strength is 1000, then 1 second
      //   .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      //   .onUpdate(() => { // Called after tween.js updates 'coords'.
      //     tag.alpha = obj.alpha;
      //   });
      // tween.start();

      //gameSetup.add.tween(tag).to({ alpha: 1 }, 100, 'Linear', true, 600);
    };

    c.nameTagBlank = loadNameTag('/images/NewNameTagBlank2.png');
    c.nameTagWhite = loadNameTag('/images/NewNameTagBlankWhite2.png');
    c.nameTagRed = loadNameTag('/images/NewNameTagBlankRed2.png');
    c.nameTagYellow = loadNameTag('/images/NewNameTagBlankYellow2.png');

    c.nameTagBlank.visible = true;

    // add player ID 1 or 2
    const size = Math.floor(2.2 * config.scalingratio);

    const style0 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size * 1.3,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#000000'],
      stroke: '#000000',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const textID = new PIXI.Text(`${c.PanelID}.`, style0);
    textID.position.x = c.cx - c.w / 2 - 10;
    textID.position.y = c.cy;
    textID.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(textID);





    // add human or robo icon
    let s;
    const scaling = c.h * 0.6 / (128 * 1);
    if (c.isHuman) {
      // s = gameSetup.add.sprite(c.cx - c.w / 2 - c.w * 0.1, c.cy - c.h / 2 + c.h / 5, 'humanicon');
      // s.scale.set(scaling * 1.2, scaling);

      s = new PIXI.Sprite(PIXI.loader.resources['/images/human1.png'].texture);
      s.position.x = c.cx - c.w / 2 - c.w * 0.12 + 50;
      s.position.y = c.cy - c.h / 2 + c.h / 5;
      // s.anchor.set(0.5, 0.5);
      s.scale.set(scaling * 1.2, scaling);
    } else {
      // s = gameSetup.add.sprite(c.cx - c.w / 2 - c.w * 0.05, c.cy - c.h / 2 + c.h / 5, 'roboticon');
      // s.scale.set(scaling * 0.7, scaling);
      s = new PIXI.Sprite(PIXI.loader.resources['/images/robot1.png'].texture);
      s.position.x = c.cx - c.w / 2 - c.w * 0.07 + 50;
      s.position.y = c.cy - c.h / 2 + c.h / 5;
      // s.anchor.set(0.5, 0.5);
      s.scale.set(scaling * 1.2, scaling);
    }
    gameSetup.stage.addChild(s);
    s.tint = 0x000000;

    // const style = { font: `bold ${size}px Arial`, fill: '#000000', boundsAlignH: 'center', boundsAlignV: 'middle' };
    // const text = gameSetup.add.text(0, 0, c.userName, style);
    // text.setTextBounds(c.cx - c.w * 0.44, c.cy - c.h * 0.45, c.w * 0.8, c.h);


    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#000000'],
      stroke: '#000000',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const text = new PIXI.Text(c.userName, style);
    text.position.x = c.cx + c.w * 0.16;
    text.position.y = c.cy;
    text.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(text);

    return gb;
  };

  this.enhanceVictor = () => {
    window.Victor.prototype.scale = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };
  };

  this.addMessageBoard = () => {
    const config = gameSetup.config;
    const cfg = config.messageBoardCfg;
    // const barg = gameSetup.add.graphics(0, 0);
    const barg = new PIXI.Graphics();
    barg.lineStyle(0);
    const barColor = cfg.bColor;
    barg.beginFill(barColor);
    barg.drawRoundedRect(cfg.x, cfg.y, cfg.w, cfg.h, 10);
    barg.endFill();
    gameSetup.stage.addChild(barg);

    const size = Math.floor(1.8 * config.scalingratio);
    // const style = { font: `bold ${size}px Arial`, fill: '#d7dfea', boundsAlignH: 'left', boundsAlignV: 'middle' };

    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#d7dfea'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440,
    });



    const text1a = new PIXI.Text('>', style);
    text1a.position.x = cfg.x + cfg.w / 40;
    text1a.position.y = cfg.y + cfg.h / 10;

    // const text1a = gameSetup.add.text(0, 0, '>', style);
    // text1a.setTextBounds(cfg.x + cfg.w / 40, cfg.y + cfg.h / 10, 10, cfg.h / 2 - cfg.h / 10);

    const text1 = new PIXI.Text('', style);
    text1.position.x = text1a.position.x + 20;
    text1.position.y = text1a.position.y;

    // const text1 = gameSetup.add.text(0, 0, '', style);
    // text1.setTextBounds(cfg.x + cfg.w / 40 + 20, cfg.y + cfg.h / 10, cfg.w - 20, cfg.h / 2 - cfg.h / 10);


    // const text2a = gameSetup.add.text(0, 0, '>', style);
    // text2a.setTextBounds(cfg.x + cfg.w / 40, cfg.y + cfg.h / 2, 10, cfg.h / 2 - cfg.h / 10);
    // const text2 = gameSetup.add.text(0, 0, '', style);
    // text2.setTextBounds(cfg.x + cfg.w / 40 + 20, cfg.y + cfg.h / 2, cfg.w - 20, cfg.h / 2 - cfg.h / 10);



    const text2a = new PIXI.Text('>', style);
    text2a.position.x = text1a.position.x;
    text2a.position.y = cfg.y + cfg.h / 2;

    const text2 = new PIXI.Text('', style);
    text2.position.x = text1.position.x;
    text2.position.y = text2a.position.y;

    gameSetup.stage.addChild(text1a);
    gameSetup.stage.addChild(text1);
    gameSetup.stage.addChild(text2a);
    gameSetup.stage.addChild(text2);

    // config.sendMessageAll = function(msg, pos) {
    //   // console.log("show message " + pos + " " + msg);
    //   let t = text2;
    //   if (pos == 0) {
    //     t = text1;
    //     text2.text = "";
    //   }
    //   t.text = msg;
    //   if (msg == '') return;
    //   t.alpha = 0;
    //   const lag = 500;
    //   //new TWEEN.tween(t).to({ alpha: 1 }, lag, 'Linear', true, pos * 1000);
    //   const obj = { alpha: 1 };
    //   const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
    //     .to({ alpha: 1 }, lag) // if strength is 1000, then 1 second
    //     .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    //     .onUpdate(() => { // Called after tween.js updates 'coords'.
    //       t.alpha = obj.alpha;
    //     });
    //   tween.start();
    // };

    config.sendMessageAll('Welcome to the Trajectory Pool game!', 0);
  };

  this.addPlayerTimer = (panel, pi) => {
      // add count down clock
      const config = gameSetup.config;
      const size = Math.floor(2.5 * config.scalingratio);
      const style0 = new PIXI.TextStyle({
        fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: size,
        fontStyle: '',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: false,
        wordWrapWidth: 440
      });

      pi.secondsLeft = gameSetup.initialTimeSeconds;
      // pi.secondsLeft = 10;
      panel.clockTimeStr = "05:00";
      if (gameSetup.difficulty == ADVANCED) {
        panel.clockTimeStr = "10:00";
      }
      panel.inTimeCountDown = false;

      const richText0 = new PIXI.Text(panel.clockTimeStr, style0);
      richText0.x = panel.cx + panel.clockXShift;
      richText0.y = panel.cy;
      richText0.anchor.set(0.5, 0.5);
      richText0.anchor.set(0.5, 0.5);

      gameSetup.stage.addChild(richText0);
      panel.countdownClockText = richText0;
      panel.updateTimer = (s) => {
        //if (!panel.inTimeCountDown && "--:--" != panel.clockTimeStr) {
        // if (!panel.inTimeCountDown) {
        //   return;
        // }

        // debugger;
        // panel.secondsLeft -= 1; // new using setinterval every second
        let seconds = Math.round(s);



        if (seconds < 0) {
          seconds = 0;
        }
        const sec = seconds % 60;

        const minutes = Math.round((seconds - sec) / 60);
        const secstr = (sec <= 9) ? `0${sec}` : sec;
        const minstr = (minutes <= 9) ? `0${minutes}` : minutes;
        const timestr = `${minstr}:${secstr}`;
        // if (timestr != panel.clockTimeStr) {
          panel.clockTimeStr = timestr;
          panel.countdownClockText.text = timestr;
        // }
      };
  };

  // this.addVSSign = () => {
  //   const config = gameSetup.config;
  //   const cx = config.mazeCenterX; // config.playerPanel2.cx;
  //   const cy = config.playerPanel1.cy;

  //   const vs = new PIXI.Sprite(PIXI.loader.resources['/images/crossVcue2Small.png'].texture);
  //   vs.position.x = cx;
  //   vs.position.y = cy - config.playerPanel1.h * 0.55;
  //   vs.anchor.set(0.5, 0);
  //   vs.scale.set(0.5, 0.5);
  //   gameSetup.stage.addChild(vs);
  // };


  // this.addBackArrow = () => {
  //   const cfg = gameSetup.config;

  //   // const arrow = gameSetup.add.sprite(cfg.mazeCenterX - cfg.mazeW / 2 - cfg.metalBorderThick / 2, cfg.mazeCenterY - cfg.mazeH / 2 - vcushion, 'backarrow');
  //   const arrow = new PIXI.Sprite(PIXI.loader.resources['/images/backarrowlight.png'].texture);
  //   arrow.position.x = cfg.mazeCenterX - cfg.mazeW / 2 - cfg.metalBorderThick / 2 - 10;
  //   arrow.position.y = cfg.mazeCenterY - cfg.mazeH / 2 - 20;

  //   arrow.scale.set(0.4, 0.4);

  //   gameSetup.stage.addChild(arrow);

  //   arrow.interactive = true;
  //   arrow.buttonMode = true;

  //   // gameSetup.confirmQuit = (e) => {
  //   //   // gameSetup.config.showConfirm("You will lose the game if you exit the page. Are you sure?", () => {
  //   //   //   const mainDiv = document.getElementById("mainDiv");
  //   //   //   mainDiv.style.position = "relative";
  //   //   //   gameSetup.exitGame();
  //   //   // });
  //   // };
  //   arrow.on('pointerdown', (event) => {
  //     gameSetup.exitGame();

  //     // if (gameSetup.gameOver) {
  //     //   gameSetup.exitGame();
  //     // } else {
  //     //   // gameSetup.config.sendMessageAll("Are you sure you want to exit the game?");
  //     //   gameSetup.confirmQuit();
  //     // }
  //   });

  //   // debugger;
  //   // window.onbeforeunload = confirmQuit;
  //   // window.onpopstate = confirmQuit;

  //   // arrow.inputEnabled = true;
  //   // arrow.events.onInputDown.add(cfg.confirmExit, this);
  // };


  // this.addAutoButton = (c) => {
  //   const config = gameSetup.config;
  //   const btn = this.addLabel(c);
  //   btn._style.fontSize = 20;
  //   btn._style.fill = [autobuttoncolor2];

  //   btn.buttonMode = true;
  //   btn.interactive = true;
  //   btn.visible = false;

  //   btn.on('pointerdown', () => {
  //     gameSetup.autoSearchHandle = setTimeout(()=>{
  //       gameSetup.autoSearchStepSize = Math.PI / 2;


  //       const b = gameSetup.firstBallTouchedByCueball;
  //       let targetID = -1;
  //       let msg = "Please aim at a tank first.";
  //       if (b != null) {
  //         if (gameSetup.activePlayerInfo.chosenColor != null) {
  //           if (gameSetup.firstBallTouchedByCueball.tank.colorType != gameSetup.activePlayerInfo.legalColor) {
  //             targetID = -1;
  //             msg = `Please aim at a ${gameSetup.activePlayerInfo.legalColor} tank first.`;
  //           } else {
  //             targetID = b.ID;
  //           }
  //         } else {
  //           targetID = b.ID;
  //         }
  //       }

  //       if (targetID < 0) {
  //         config.showMessage(msg);
  //         return;
  //       }

  //       // new way of simply calculate angle!

  //       const targetBall = gameSetup.ballsByID[targetID];
  //       const cueball = gameSetup.ballsByID[0];
  //       // let maxPocketID = null;
  //       const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);

  //       let minAngleDiff = 3000;
  //       // let dirx = 0; let diry = 0;
  //       let minDir = null;
  //       const cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
  //       for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
  //         const pocketPos = gameSetup.tablePocket[pocketID].clone();
  //         const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
  //         const dirAimToBall = dirBallToPocket.normalize().scale(config.ballD);
  //         const aimPos = targetBallPos.clone().subtract(dirAimToBall);
  //         const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

  //         // console.log("pocketPos " + JSON.stringify(pocketPos));
  //         // console.log("aimPos " + JSON.stringify(aimPos));
  //         // console.log("cueballPos " + JSON.stringify(cueballPos));

  //         // first filter out a pocket if the angle is too large
  //         const angleCueBallToAim = dirCueBallToAim.angle();
  //         const angleAimToBall = dirAimToBall.angle();
  //         let angleDiff = angleCueBallToAim - angleAimToBall;
  //         console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
  //         if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
  //         if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
  //         // console.log("angleCueBallToAim " + angleCueBallToAim + " angleAimToBall " + angleAimToBall + " angleDiff " + angleDiff)
  //         if (Math.abs(angleDiff) < minAngleDiff) {
  //           minAngleDiff = Math.abs(angleDiff);
  //           minDir = dirCueBallToAim;
  //         }
  //       }

  //       gameSetup.cueballDirection.x = minDir.x;
  //       gameSetup.cueballDirection.y = minDir.y;


  //       // old way of search by probability

  //       if (false) {
  //       // gameSetup.autoSearchTargetID = targetID;

  //       // if (!gameSetup.inAutoSearch) {
  //       //   gameSetup.showOverlay("Please wait while I adjust the shooting angle for you...", false, true);
  //       //   setTimeout(()=>{
  //       //     gameSetup.controller.runAutoSearch();
  //       //   }, 100);
  //       // }
  //       }
  //     }, 1);
  //   });
  //   return btn;
  // };

  this.addCWButton = (c) => {
    const config = gameSetup.config;
    const s = new PIXI.Sprite(PIXI.loader.resources[c.iconName].texture);
    s.scale.set(c.w / 128, c.h / 128); // will overflow on bottom
    s.position.x = config.mazeW * 0.04 + c.cx - c.w / 2;
    s.position.y = config.tableTop + c.cy - c.h / 2;
    // bg.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(s);

    const grey = 0x606060;
    s.tint = grey;

    // const s2 = gameSetup.add.sprite(c.cx - c.w / 2, c.cy - c.h / 2, c.iconName);
    // s.tint = 0xaaaaaa;
    // this.CWButtons.push({ btn: s, origTint: s.tint });
    // s.scale.set(c.w / 128, c.h / 128);
    return s;
  };

  this.applyStrike = (force, av, hspin) => {
    // console.log("in applyStrike to play sound " + Date.now());
    gameSetup.sounds.cueballhit.play();
    gameSetup.allStopped = false;
    // console.log("in applyStrike to apply impulse " + force.x + " " + force.y + Date.now());
    gameSetup.cueball.body.applyImpulse([force.x, force.y], 0, 0);
    // console.log("after applyStrike to apply impulse " + Date.now());
    gameSetup.cueball.body.av = av;
    gameSetup.cueball.body.hspin = hspin ? hspin : 0;
    gameSetup.controller.inStrike = true;
  };

  this.addTBotIcon = () => {
    const config = gameSetup.config;
    const s = new PIXI.Sprite(PIXI.loader.resources['/images/tboticon.png'].texture);
    s.scale.set(0.8, 0.8); // will overflow on bottom

    s.position.x = config.mazeCenterX + config.mazeW * 0.488;
    s.position.y = config.mazeCenterY + - config.mazeH/2 + 5;
    s.anchor.set(0.5, 0.5);
    // btn.tint = 0xa0a0a0;
    gameSetup.stage.addChild(s);

    s.interactive = true;
    s.buttonMode = true;
    s.on('pointerdown', () => {
      gameSetup.showPrevMessage();
    });
  };

  this.addStrikeButton = (cfg, callback) => {
    const config = gameSetup.config;

    // const g = new PIXI.Graphics();
    // g.lineStyle(5, 0x687af2, 1);
    // g.beginFill(0x132fef, 1);
    // g.drawRoundedRect(cfg.x - cfg.w/2, cfg.y - cfg.h/2, cfg.w, cfg.h, cfg.h/10);
    // g.endFill();
    // gameSetup.stage.addChild(g);


    const btn = new PIXI.Sprite(PIXI.loader.resources["/images/strikebutton.png"].texture);
    btn.scale.set(cfg.w / 441, cfg.h / 196); // will overflow on bottom
    btn.position.x = cfg.x;
    btn.position.y = config.tableTop + cfg.y;
    btn.anchor.set(0.5, 0.5);
    btn.tint = 0xa0a0a0;
    gameSetup.stage.addChild(btn);

    gameSetup.controlButtons.push(btn);
    btn.interactive = true;
    btn.buttonMode = true;
    btn.on('pointerdown', callback);

    // btn.inputEnabled = true;
    // btn.events.onInputDown.add(callback, this);
    // this.controlButtons.push(btn);
    cfg.btn = btn;


    // text

    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: 21,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#114708'],
        stroke: '#114708', //'#4a1850'
        strokeThickness: 2,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 2,
        wordWrap: false,
        wordWrapWidth: 440
    });

    const txt = new PIXI.Text("Strike", style);
    txt.x = cfg.x;
    txt.y = config.tableTop + cfg.y;
    txt.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(txt);

    btn.text = txt;






    return btn;
  };

  this.addLabel = (cfg) => {
    const config = gameSetup.config;
    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 25,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });



    const richText = new PIXI.Text(cfg.text, style);
    richText.x = config.mazeW * 0.04 + cfg.x + 10;
    richText.y = config.tableTop + cfg.y + 5;
    richText.anchor.set(0, 0);
    gameSetup.stage.addChild(richText);
    return richText;
  };

  this.addButton = (cfg, callback) => {
    const config = gameSetup.config;

    // const bg = gameSetup.add.graphics(0, 0);
    const bg = new PIXI.Graphics();
    bg.lineStyle(0);
        // var bColor = 0*256*256+160*256+0;
    bg.beginFill(cfg.bColor);
    bg.drawRoundedRect(0, 0, cfg.w, cfg.h, 10);
    bg.endFill();
    const btn = gameSetup.add.sprite(cfg.x, cfg.y);
    btn.addChild(bg);
    btn.isQuitButton = cfg.isQuitButton;

    if (callback !== null) {
      btn.inputEnabled = true;
      btn.events.onInputDown.add(callback, this);
            // bg.beginFill(0x202020);
            // bg.drawRoundedRect(0, 0, cfg.w, cfg.h, 10);
            // bg.endFill();

            // quit or exit butto will always be enabled
      if (!btn.isQuitButton) {
        // this.controlButtons.push(btn);

                // this.controlBG.push(bg);
        this.controlBG.push({
          bg, x: 0, y: 0, w: cfg.w, h: cfg.h, origColor: cfg.bColor
        });
        btn.cfg = this.controlBG[this.controlBG.length - 1];
      } else {

      }
      cfg.btn = btn;
    }


    const size = Math.floor(1.9 * config.scalingratio);
    const style = { font: `bold ${size}px Arial`, fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'middle' };
    const text = gameSetup.add.text(0, 0, cfg.text, style);
    text.setTextBounds(cfg.x, cfg.y, cfg.w, cfg.h);
    btn.text = text;
    return btn;
  };




  this.drawForecast = () => {
    const config = gameSetup.config;
    const allIDs = Object.keys(ballbodies2);
    const g = gameSetup.forecastG;

    if (g) {
      g.clear();
    }


    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = ballbodies[i];
      const b2 = ballbodies2[i];


      if (gameSetup.controller.gameState > BREAK_SHOT_STATE || gameSetup.gameType == GAME_TYPE.TESTING) {

        if (b.ballIDLabel) {
          b.ballIDLabel.visible = true; // aaaa test
        } else {
          // add tank ID label

        }
        b.ballIDLabel.position.x = b.position[0];
        b.ballIDLabel.position.y = b.position[1] + gameSetup.config.ballD * 1;
      }



      if (b2.trail.length == 0) continue;
      // if (i != 21) continue;

      g.lineStyle(config.forecastGWidth, b2.tank.color, 1);
      // g.lineStyle(config.forecastGWidth*3, 0x00ff00, 1);
      // if (i == 0)
      //   console.log("draw trail for " + i + " " + JSON.stringify(b2.trail));
      g.moveTo(b2.trail[0][0], b2.trail[0][1]);
      let px = b2.trail[0][0];
      let py = b2.trail[0][1];
      for (let k=1; k<b2.trail.length; k++) {
        if (Math.abs(b2.trail[k][0] - px) >= config.ballD / 4 || Math.abs(b2.trail[k][1] - py) >= config.ballD / 4) {
          // if (i == 21) console.log("draw to " + JSON.stringify(b2.trail[k]));
          g.lineTo(b2.trail[k][0], b2.trail[k][1]);
          px = b2.trail[k][0];
          py = b2.trail[k][1];
        }
      }
      // draw circle
      g.drawCircle(b2.trail[b2.trail.length-1][0], b2.trail[b2.trail.length-1][1], config.ballD / 8);
    }
  };

  this.clearIsStopped = () => {
    const config = gameSetup.config;
    const allIDs = Object.keys(ballbodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = ballbodies[i];
      b.isStopped = false;
      b.av.x = 0; b.av.y = 0;
      b.velocity[0] = 0;
      b.velocity[1] = 0;
    }
  };

  this.clearForecastLines = (v) => {
    // return;
    // console.log("do clearForecastLines " + gameSetup.forecastG);
    const config = gameSetup.config;
    if (gameSetup.forecastG) {
      gameSetup.forecastG.clear();
    }

    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      // console.log("do clear aim tank mark");
      gameSetup.aimBallMark.position.x = 1000000;
    }
    // gameSetup.cuestickcontainer.position.x = 10000;
    const allIDs = Object.keys(ballbodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = ballbodies[i];
      //if (b.ballIDLabel && b.inPocketID !== null) {
      if (b.ballIDLabel) {
        b.ballIDLabel.visible = false;
      }
    }

    return;
    if (!gameSetup.simBalls) return;
    if (v) {
      gameSetup.simBalls.forEach((b) => {
        const g = b.forecastG;
        g.clear();
      });
    }
  };



  this.contained = (cfg, x, y) => {
    // console.log("contained : " + y + " " + (cfg.y + cfg.hhigh) + " " + (cfg.y + cfg.hlow) );
    if (x >= cfg.x - cfg.w * 1 && x <= cfg.x + cfg.w * 2 && y >= cfg.y + cfg.hhigh - 20 && y <= cfg.y + cfg.hlow + 30) {
      return true;
    }
    return false;
  };

  this.setMeterValue = (cfg, x, y, bar) => {
    let ratio = (cfg.hlow + cfg.y - y) / (cfg.hlow - cfg.hhigh);
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    const y2 = cfg.y + cfg.hlow - ratio * (cfg.hlow - cfg.hhigh);
    bar.y = y2;
    if (cfg.valueHigh > 100) { bar.value = Math.round(cfg.valueLow + (cfg.valueHigh - cfg.valueLow) * ratio); } else { bar.value = Math.round(100 * (cfg.valueLow + (cfg.valueHigh - cfg.valueLow) * ratio)) / 100; }
        // bar.value = -0.5;
    bar.textActual.setText(`${bar.value}`);
    bar.textActual.y = bar.y - 20;
    bar.textMax.y = bar.y + 10;
    bar.barg.y = bar.y;
  };

  this.setMeterByValue = (cfg, newvalue, bar) => {
    if (!bar) return;
    bar.value = newvalue;
    const ratio = (newvalue - cfg.valueLow) / (cfg.valueHigh - cfg.valueLow);
    // bar.y = cfg.y + cfg.h - cfg.h * ratio - cfg.barh / 2;
    const knoby = gameSetup.config.tableTop + cfg.y + cfg.hlow - ratio * (cfg.hlow - cfg.hhigh);
    bar.y = knoby;
    bar.textActual.setText(`${newvalue}`);
    bar.barg.y = knoby;
    bar.textActual.y = bar.y - 20;
    bar.textMax.y = bar.y + 10;
  };







  this.setupTimerUpdate = () => {

    // use setInterval so it works even when tab is switched off
    // each host has his own timer for both player, so that even if
    // one player leaves game room abruptly the other one still has the timer


    if (gameSetup.isHost) {
      gameSetup.timerID = setInterval(() => {
        if (gameSetup.gameOver) return;
        if (!gameSetup.activePlayerInfo) return;

        gameSetup.activePlayerInfo.secondsLeft -= 1;
        if (gameSetup.activePlayerInfo.secondsLeft === 0) {
          // gameSetup.controller.setNewPlayerState(gameSetup.waitingPlayerInfo.ID, GAME_OVER_STATE, -1, -10000, -10000, `The player ${gameSetup.activePlayerInfo.ID} ${gameSetup.activePlayerInfo.playerID} has timed out.`);

          // if (gameSetup.isLocal) {
          //   //gameSetup.activePlayerInfo.c.updateTimer(gameSetup.activePlayerInfo.secondsLeft);
          //   // just show game over screen
          //   // gamesSetup.showModalMessage(`The Winner Is ${gameSetup.activePlayerInfo.ID}!`, `The player ${gameSetup.waitingPlayerInfo.ID} has timed out.`);

          // } else {
          //   //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          //   gameSetup.networkHandler.sendCommandToAll({
          //     c: "UpdateTimer", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${gameSetup.activePlayerInfo.secondsLeft}`
          //   });
          // }
          clearInterval(gameSetup.timerID);
          return;
        }
        if (gameSetup.isLocal) {
          gameSetup.activePlayerInfo.c.updateTimer(gameSetup.activePlayerInfo.secondsLeft);
        } else {
          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          // gameSetup.networkHandler.sendCommandToAll({
          //   c: "UpdateTimer", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${gameSetup.activePlayerInfo.secondsLeft}`
          // });
        }
        // gameSetup.config.playerPanel1.updateTimer();
        // gameSetup.config.playerPanel2.updateTimer();
      }, 1000);
    } else {
      gameSetup.timerID = setInterval(() => {
        if (gameSetup.gameOver) return;
        if (!gameSetup.networkHandler) return;

        if (gameSetup.isLocal) {
        } else {
          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "KeepALive", t: gameSetup.currentCycleTime, w: `${0}`
          });
        }
        // gameSetup.config.playerPanel1.updateTimer();
        // gameSetup.config.playerPanel2.updateTimer();
      }, 1000);
    }



    // $(window).focus(function() {
    //   // if (!interval_id)
    //   //     interval_id = setInterval(hard_work, 1000);
    // });

    // $(window).blur(function() {
    //     // clearInterval(interval_id);
    //     // interval_id = 0;
    // });

  }



  

  this.setupHandleRoom = () => {


    const gameEngine = this;

    gameSetup.cmdHistory = [];
    gameSetup.cmdReceiveHistory = [];
    gameSetup.cmdReceiveHistoryT = [];
    gameSetup.failedToReconnect = false;
    gameSetup.inQuit = false;


    gameSetup.setupPeer = (room, peerInfo) => {
      gameSetup.room = room;
      gameSetup.playerID = gameSetup.playerInfo.find(p => p.userId === gameSetup.config.localPlayerID).slot;

      const { id, asHost, offerName, answerName } = peerInfo;
      gameSetup.setupOnePeer(id, asHost, offerName, answerName);
    };



    gameSetup.setupWTCServer = (id, offerName, answerName) => {
      const room = gameSetup.room;
      const peerName = `${offerName}_${answerName}`;
      // const peerIndex = gameSetup.peers.findIndex(p => p.peerName === peerName);

      const buffer = require('buffer');
      window.Buffer = buffer.Buffer;
      global.Buffer = buffer.Buffer;
      const Peer = require('simple-peer');
      const p = new Peer({ initiator: true, trickle: false,
        config: {
          iceServers: [
            // {
            //   "urls": "stun:numb.viagenie.ca",
            //   "username": "bin.yu.private@gmail.com",
            //   "credential": "yyyyyy"
            // },
            { urls: "stun:stun.counterpath.com:3478"},
            { urls: "stun:stun.voxgratia.org:3478"}
            // { urls: 'stun:stun.l.google.com:19302' },
            // { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
          ]
        },
        reconnectTimer: 3000 }
      );

      p.newlyCreated = true;
      p.on('signal', function (data) {
        console.log('saving offer, ', `${offerName}_${answerName}`);
        Meteor.call('saveInitSignalOfferForMultiplayer', room._id, offerName, answerName, JSON.stringify(data), (err) => {
          if (err) {
            console.log('error in saveInitSignalOfferForMultiplayer ');
          } else {
            p.newlyCreated = false;
            p.offerSaved = true;
          }
        });
      });
      return p;

  };

  gameSetup.connectToWTCServer = (id, offerName, answerName) => {
      const peerName = `${offerName}_${answerName}`;
      const peerIndex = gameSetup.peers.findIndex(p => p.peerName === peerName);

      const room = gameSetup.room;
      console.log('\n\n\n\n\n\nin connectToWTCServer ' + Date.now());
      if (typeof(room.connectionInfo[offerName]) == "undefined") return null;
      if (room.connectionInfo[offerName] == "") return null;
      console.log('in connectToWTCServer 2 ' + Date.now());
      if (typeof(room.connectionInfo[answerName]) == "undefined") {
        console.log("answer01 is undefined");
        return null;
      }
      if (room.connectionInfo[answerName] == "") return null;

      console.log('in connectToWTCServer 3 ' + Date.now());
      // console.log("room[answer01] " + room.answer01);
      // if (room.connectionInfo[answerName] !== "newoffer") return null;
      if (peerIndex !== -1 && gameSetup.peers[peerIndex].offerSignaled) {
        console.log("offer already signaled! ");
        return null;
      }
      console.log('in connectToWTCServer 4 ' + Date.now());

      const buffer = require('buffer');
      window.Buffer = buffer.Buffer;
      global.Buffer = buffer.Buffer;
      const Peer = require('simple-peer');
      //const p = new Peer({ initiator: false, trickle: false, reconnectTimer: 12000 });
      const p = new Peer({ initiator: false, trickle: false,
        config: {
          iceServers: [
            // {
            //   "urls": "stun:numb.viagenie.ca",
            //   "username": "bin.yu.private@gmail.com",
            //   "credential": "yyyyyy"
            // },
            { urls: "stun:stun.counterpath.com:3478"},
            { urls: "stun:stun.voxgratia.org:3478"}
            // { urls: 'stun:stun.l.google.com:19302' },
            // { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
          ]
        },
        reconnectTimer: 3000 });

      if (peerIndex !== -1) {
        gameSetup.peers[peerIndex].savedOffer = room.connectionInfo[offerName];
      }

      console.log("\n\n--- GUEST 1 --- to signal offer "  + Date.now()); // + " " + room.offer01);
      p.answer = "";
      //GUEST_1
      // debugger;
      try {
        p.signal(JSON.parse(room.connectionInfo[offerName]));
        if (peerIndex !== -1) {
          gameSetup.peers[peerIndex].offerSignaled = true;
        }
      } catch (err) {
        console.log(" guest signal error ");
      }

      p.on('signal', function (data) {
        console.log('saving answer, ', `${offerName}_${answerName}`);
        Meteor.call('saveInitSignalAnswerForMultiplayer', room._id, answerName, JSON.stringify(data));
      });
      return p;
    };

    gameSetup.doRetry = (selectedPeer) => {
      if (selectedPeer) {
        if (gameSetup.retryCount) {
          gameSetup.retryCount ++;
          if (gameSetup.retryCount > 5) {
            console.log("give up connection after 5 tries");
            if (gameSetup.quitGameForConnectivityIssue)
              gameSetup.quitGameForConnectivityIssue();
            return;
          }
        } else {
          gameSetup.retryCount = 1;
        }

        console.log("\n\n\n\n\n\n\n\n\ntrying " + gameSetup.retryCount + " ...");
        gameSetup.enterReconnect(selectedPeer);
      }
    };

    gameSetup.setupOnePeer = (id, asHost, offerName, answerName) => {
      /**
       * how signalling works:
       * 1. initiator on start, will get a 'signal' -> save it to lobby as offer
       * 2. joiner get the offer signal, call p.signal with it
       * 3. joiner get a 'signal' -> save it to lobby as answer
       * 4. initiator will read the answer signal, and call p.signal with it again
       * 5. joiner will get 'connect' this time.
       */

      const selectedPeerName = `${offerName}_${answerName}`;
      const peerIndex = gameSetup.peers.findIndex(p => p.peerName === selectedPeerName);
      let selectedPeer = null;
      if (peerIndex !== -1) {
        selectedPeer = gameSetup.peers[peerIndex];
      }
      console.log(`in setupOnePeer ${selectedPeerName}`);
      const that = gameSetup;
      const room = gameSetup.room;

      // if peer info existed
      if (selectedPeer && selectedPeer != null) {
        // peer as host and offer saved
        if (asHost && selectedPeer.peer && selectedPeer.peer.offerSaved) {
          // already have peer object but waiting for answer
          if (typeof(room.connectionInfo[answerName]) != "undefined"  && room.connectionInfo[answerName] != "" && room.connectionInfo[answerName] != "newoffer") {
            console.log("\n\n\n--- HOST 2 --- to signal answer "); // + room[`answer${id}`]);
            if (peerIndex !== -1 && !gameSetup.peers[peerIndex].answerSignaled) {
              try {
                console.log("\n\n\n&&&& to signal answer &&&&");
                console.log(JSON.stringify(room.connectionInfo[answerName]));
                let s = JSON.parse(room.connectionInfo[answerName]);
                if (!gameSetup.retryCount) {
                  // testing retry so change numbers to incorrect ones
                  // s.sdp = s.sdp.replace("5", "7");
                  // s.sdp = s.sdp.replace("udp", "tcp");
                  // s.sdp = s.sdp.replace("192", "182");
                  selectedPeer.peer.signal(s);
                } else {
                  selectedPeer.peer.signal(s);
                }
                if (peerIndex !== -1) {
                  gameSetup.peers[peerIndex].answerSignaled = true;
                }
              } catch (err) {
                console.log(" host signal error " + err);
              }
            } else {
              console.log("answer already signaled")
            }
          }
          return;
        }

        if (!asHost) {
          if (room.connectionInfo[answerName] !== "newoffer") {
            console.log(`room ${answerName} is not newoffer`);
            return;
          }
          if (room.connectionInfo[answerName] == "newoffer" && selectedPeer && room.connectionInfo[offerName] != selectedPeer.savedOffer) {
          } else {
            console.log(`room ${offerName} is same as old gameSetup.savedOffer ${selectedPeer.savedOffer}`);
            return;
          }
        }
      }

      const peerName = `${offerName}_${answerName}`;
      const peerExisted = gameSetup.peers.findIndex(pObj => pObj.peerName === peerName && pObj.peer) !== -1;
      if (!peerExisted) {
        if (asHost) {
          const newPeer = gameSetup.setupWTCServer(id, offerName, answerName);
          if (newPeer) {
            gameSetup.peers.push({
              peerName,
              offer: offerName,
              answer: answerName,
              peer: newPeer,
              ready: false,
              cmdHistory: [],
              asHost: asHost,
              tryReconnectTimer: setTimeout(() => {
                if (!newPeer.connected) {
                  console.log('tryReconnectTimer invoked')
                  gameSetup.enterReconnect(selectedPeer);
                }
              }, 5000)
            })
          }
        } else {
          const newPeer = gameSetup.connectToWTCServer(id, offerName, answerName);
          if (newPeer) {
            gameSetup.peers.push({
              peerName,
              offer: offerName,
              answer: answerName,
              peer: newPeer,
              ready: false,
              cmdHistory: [],
              asHost: asHost,
              tryReconnectTimer: setTimeout(() => {
                console.log('tryReconnectTimer invoked')
                if (!newPeer.connected) {
                  gameSetup.enterReconnect(selectedPeer);
                }
              }, 5000)
            })
          }
        }

        console.log('after pushing a new peers', gameSetup.peers);

        const peerIndex = gameSetup.peers.findIndex(p => p.peerName === selectedPeerName);
        selectedPeer = null;
        if (peerIndex !== -1) {
          selectedPeer = gameSetup.peers[peerIndex];
        }
        if (selectedPeer == null) return;

        selectedPeer.peer.dosend = (cmd) => {
          if (!selectedPeer) return;
          if (cmd.indexOf('LASTGOODCOMMAND') < 0) {
            selectedPeer.cmdHistory.push(cmd);
          }
          if (!selectedPeer.peer._channel) {
            console.log("no channel for cmd " + cmd);
            return;
          }
          if (selectedPeer.peer._channel.readyState != "open") {
            console.log("channel not open for cmd " + cmd);
            return;
          }
          selectedPeer.peer.send(cmd);
        };

        selectedPeer.peer.on('error', function (err) {
          console.log('peer error', err);
          if (!gameSetup) return;
          if (!gameSetup.doRetry) return;

          gameSetup.doRetry(selectedPeer);
        });

        selectedPeer.peer.on('close', function () {

          console.log('peer closed so do nothing for now');
          if (!gameSetup) return;
          if (!gameSetup.doRetry) return;
          gameSetup.doRetry(selectedPeer);
        });


        selectedPeer.peer.on('connect', function () {

          if (!selectedPeer) {
            console.log("unusual error: connected then peer not defined");
            gameSetup.doRetry(selectedPeer);
            return;
          }

          if (!selectedPeer.peer._channel) {
            console.log("connected by no channellllll!");
            return;
          }
          if (selectedPeer.peer._channel.readyState != "open") {
            console.log("channel is not ready state open!");
            return;
          }

          //HOST_3 GUEST_3
          // debugger;
            console.log('\n\nCONNECTED!!' + (Date.now()));
            if (gameSetup.connectionTimer)
              clearTimeout(gameSetup.connectionTimer);

            if (gameSetup.isLocal) {
              gameSetup.networkHandler = new NetworkHandler(gameEngine, true, selectedPeerName, asHost);
            } else {
              gameSetup.networkHandler = new NetworkHandler(gameEngine, false, selectedPeerName, asHost);
            }

            // setTimeout(()=>{
              if (!selectedPeer) {
                console.log("unusual error: connected then peer not defined");
                gameSetup.doRetry(selectedPeer);
                return;
              }
              const peerIndex = gameSetup.peers.findIndex(p => p.peerName === selectedPeerName);
              if (peerIndex !== -1) {
                gameSetup.peers[peerIndex].peerSetup = true;
                gameSetup.peers[peerIndex].ready = true;
              }

              if (gameSetup.connectionTimer) {
                clearTimeout(gameSetup.connectionTimer);
                delete gameSetup.connectionTimer;
              }

              // gameSetup.hideModalMessage();

              if (gameSetup.inReconnect) {
                let cmdstr = `LASTGOODCOMMAND;${Date.now()};${-1}`;
                if (gameSetup.cmdReceiveHistory.length == 0) {
                  // console.log("resend empty receive history " + cmdstr);
                } else {
                  // const lastGoodCmd = gameSetup.cmdReceiveHistory[gameSetup.cmdReceiveHistory.length-1];
                  // const p3 = lastGoodCmd.split(";");
                  // cmdstr = `LASTGOODCOMMAND;${Date.now()};${p3[1]}`;
                  let cmdTimeList = "";
                  for (let j=0; j < gameSetup.cmdReceiveHistory.length; j++) {
                    const cp = gameSetup.cmdReceiveHistory[j].split(";");
                    cmdTimeList += `${cp[1]}`;
                    if (j < gameSetup.cmdReceiveHistory.length-1) {
                      cmdTimeList += `|`;
                    }
                  }
                  cmdstr = `LASTGOODCOMMAND;${Date.now()};${cmdTimeList}`;
                  // console.log("resend all received command times " + cmdstr);
                }
                if (!selectedPeer.peer._channel) {
                  return;
                }
                if (selectedPeer.peer._channel.readyState != "open") {
                  return;
                }
                gameSetup.inReconnect = false;
                selectedPeer.peer.send(cmdstr);
                // PathPoolGameObj.tick();
              }

              setTimeout(()=>{
                tankWarGame.initScreen();
              }, 1000);
        });

        selectedPeer.peer.on('data', function (data) {
          // console.log('got data: ' + data);
          data = `${data}`;
          if (data.indexOf("echo_") == 0) {
            // if (!that.peerReady) {
              // peer.send("echo_");
              // that.peerReady = true;
              // that.createPoolGame();
              // that.gameSetup.peer = peer;
            // }
          } else {
            // console.log("test that.game " + that.game);
            // console.log("test that.processWTCData " + that.processWTCData);
            if (that.processWTCData)
              that.processWTCData(data, selectedPeer);
          }
        });

        // gameSetup.peer = peer;
      }
    };












    gameSetup.handleRoomUpdate = (room) => {
      console.log(`new room update _id: ${JSON.stringify(room._id)} in ${room.usersInRoom}}`);
      if (!gameSetup.peers) {
        console.log(gameSetup);
        gameSetup.peers = [];
      }
      if (!gameSetup.arrLocalPlayerIds) {
        gameSetup.arrLocalPlayerIds = [];
      }

      console.log('room.usersInRoom', room.host, gameSetup.config.localPlayerID);
      if (gameSetup.gameStarted && !gameSetup.asignedAsNewHost && room.host === gameSetup.config.localPlayerID) {
        gameSetup.isHost = true;
        /* update timer */
        if (room.gameState && room.gameState.secondsLeft) {
          gameSetup.secondsLeft = room.gameState.secondsLeft;
        }
        this.setupTimer();
        gameSetup.asignedAsNewHost = true;
      }

      const peerUserIds = gameSetup.playerInfo.map(pi => pi.userId);
      const uniqueUserIds = peerUserIds.filter( onlyUnique ); 
      const peerCount = uniqueUserIds.length - 1;

      const allPeersConnected = gameSetup.peers.length === peerCount
        && gameSetup.peers.findIndex(pObj => pObj.peer && !pObj.peer.connected) === -1;
      if (gameSetup.gameStarted && allPeersConnected) {
        return;
      }
      const allReady = room.usersInRoom.indexOf(false) === -1;
      if (allReady) {
        const peerInfos = [];
        const offerNamesLength = gameSetup.offerNames.length;
        const answerNamesLength = gameSetup.answerNames.length;
        for (let i = 0; i < offerNamesLength; i++) {
          const offerName = gameSetup.offerNames[i];
          const answerName = `answer${offerName.substring(offerName.indexOf('_'))}`;
          const info = {
            id: 1,
            asHost: true,
            offerName,
            answerName,
          }
          peerInfos.push(info);
        }

        for (let i = 0; i < answerNamesLength; i++) {
          const answerName = gameSetup.answerNames[i];
          const offerName = `offer${answerName.substring(answerName.indexOf('_'))}`;
          const info = {
            id: 1,
            asHost: false,
            offerName,
            answerName,
          }
          peerInfos.push(info);
        }

        for (let i = 0; i < peerInfos.length; i++) {
          const peerInfo = peerInfos[i];
          const peerName = `${peerInfo.offerName}_${peerInfo.answerName}`;
          const selectedPeer = gameSetup.peers.find(p => p.peerName === peerName);
          if (selectedPeer && selectedPeer.ready) {
            // console.log(`game peer ready so room update!`);
          } else {
            console.log(`peer setup related update`);
            // gameSetup.showModalMessage('Connecting players ...', '', MODAL_NOBUTTON);

            if (!gameSetup.connectionTimer) {
              // console.log('setup connection timer ');
              gameSetup.connectionTimer = setTimeout(() => {
                if ( typeof(selectedPeer.ready) != "undefined" && !selectedPeer.ready && gameSetup.showModalMessage) {
                  if (gameSetup.inQuit) {
                    return;
                  }

                  console.log("connection timeout");
                  gameSetup.inQuit = true;
                  //gameSetup.networkHandler.sendCommandToAll({ c: "QuitGameRoomWithIssue", t: gameSetup.currentCycleTime, w: `Sorry! Network connection with your opponent has been interrupted.` });
                  gameSetup.showModalMessage(`Failed to setup connection in 180s so exit now.`, ``, MODAL_NOBUTTON);
                  gameSetup.failedToReconnect = true;

                  setTimeout(() => {
                    console.log("--- do exit game from connectionTimer ----");
                    if (gameSetup.exitGame)
                      gameSetup.exitGame();
                  }, 5000);
                }
              }, 180000);
            }
            gameSetup.setupPeer(room, peerInfo);
          }
        }
        /* test */
      } else {
        console.log(`still waiting for player to enter room ${room._id} ${room.usersInRoom}`);
      }
      // gameSetup.showModalMessage("")
    };

    // console.log("dddd set handle room");
  };


  this.calculateTileMap = function() {
    console.log("calculateTileMap");
    const cfg = gameSetup.config;
    const tilew = cfg.TileCols;
    const tileh = cfg.TileRows;
    const maze = [];

    gameSetup.maze = maze;
    gameSetup.tilemap = "";

    for (let r=0; r<=tileh-1; r++) {
      const row = {};
      maze.push(row);
    }



    for (let r=0; r<=tileh-1; r++) {
      const row = maze[r];
      for (let c=0; c<=tilew-1; c++) {
        // row[c] = "R"; continue;
        if ( (r == 0) || ( r == tileh-1) || (c == 0) || ( c == tilew-1) ) {
          // tall rock around the 4 borders
          //gameSetup.tilemap += "R_"+r+"_"+c+":";
          row[c] = "R";
        } else {

          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            continue;
          }
          // first decide if we want to add a new block of tiles
          if ( r >= tileh - 3 || c >= tilew - 3) continue;

          if (maze[r-1][c] || maze[r][c-1] || maze[r-1][c-1] || maze[r-1][c+1] || maze[r-1][c+2] || maze[r-1][c+3] || maze[r+1][c-1] || maze[r+2][c-1] || maze[r+3][c-1]) continue;

          if (gameSetup.difficulty === BEGINNER) {
            // try to add a new block 20% of time
            if (Math.random() > 0.2) continue;
          } else {
            // try to add a new block 60% of time
            if (Math.random() > 0.6) continue;
          }

          // now decide width and height of block
          const blockW = Math.ceil(Math.random() * 3 + 1);
          const blockH = Math.ceil(Math.random() * 3 + 1);

          // console.log("block on r = " + r + " c = " + c + " block w " + blockW + " h " + blockH);

          // decide a smaller block to be cut off this block
          const cutW = blockW - 1;
          const cutH = blockH - 1;
          let cutStartX = c - cutW  + 1 * Math.ceil(Math.random() * blockW);
          let cutStartY = r - cutH  + 1 * Math.ceil(Math.random() * blockH);

          // console.log("block cut start " + cutStartX + " " + cutStartY + " cut dimension " + cutW + " " + cutH);
          if (gameSetup.difficulty === BEGINNER || Math.random() > 0.8 || blockH * blockW <= 4) {
            // don't cut 20% of time
            cutStartX = 10000;
          }


          // now decide what to add to this block


          let rG = 0.0;
          let rB = 0.0; // no tall bush for now
          let rM = 0.1; // mud
          let rT = 0.2; // tree
          let rR = 0.1; // Rock
          let rS = 0.1; // something
          let cutCount = 0;

          for (let w=0; w < blockW; w++) {
            for (let h=0; h < blockH; h++) {
              // do not over lap next block
              if (maze[r][c+w+1] ) continue;
              if (maze[r-1][c+w+1] ) continue;
              if (r + h >= tileh - 2) continue;
              if (c + w >= tilew - 2) continue;
              // console.log("compare c+w-cutStartX " + (c+w-cutStartX) + " with " + cutW );
              if (c + w - cutStartX >= 0 && c + w - cutStartX < cutW && r + h - cutStartY >= 0 && r + h - cutStartY < cutH && cutCount <= blockW*blockH/2) {
                cutCount ++;
                continue;
              }

              // console.log("add block!");

              // randomly add one of 4 kind of tiles
              const rnd = Math.random() * (rG + rT + rM + rR + rS);
              if ( rnd < rG) { // half of time it's just grass land
                // gameSetup.tilemap += "G_"+r+"_"+c+":";
                // grass is default
              } else if (rnd < rG + rB) { // 5% time it is tall grass
                //gameSetup.tilemap += "T_"+r+"_"+c+":";
                maze[r+h][c+w] = "B";
              } else if (rnd < rG + rB + rM) { // 10% time it is mud
                //gameSetup.tilemap += "M_"+r+"_"+c+":";
                maze[r+h][c+w] = "M";
              } else if (rnd < rG + rB + rM + rR) { // 10% time it is mud
                //gameSetup.tilemap += "M_"+r+"_"+c+":";
                maze[r+h][c+w] = "R";
              } else { // 35% time it is short tree
                //gameSetup.tilemap += "M_"+r+"_"+c+":";
                maze[r+h][c+w] = "T";
                if (gameSetup.difficulty === BEGINNER) {
                  // avoid chance of dead lock!
                  if (Math.random() > 0.5 ) 
                    maze[r+h][c+w] = "M";
                  else
                    maze[r+h][c+w] = "R";
                }
      
              }
            }
          }


        }
      }
    }

    // build string representation


    for (let r=0; r<tileh; r++) {
      const row = maze[r];
      for (let c=0; c < tilew; c++) {
        const imgType = row[c];
        if (imgType)
          gameSetup.tilemap += imgType + "_"+r+"_"+c+":";
      }
    }
  };

  this.addEndGameRock = (y, x) => {
    if (!gameSetup.lastEndGameRockPos) {
      gameSetup.lastEndGameRockPos = {c: -10000, r: -10000};
    }
    const prevRockC = gameSetup.lastEndGameRockPos.c;
    const prevRockR = gameSetup.lastEndGameRockPos.r;
    gameSetup.lastEndGameRockPos = { c: x, r: y };
    this.addOneTile("R", y, x);
    if (gameSetup.isHost) {
      const cfg = gameSetup.config;
      const xBlock = cfg.TileSizeW;
      const yBlock = cfg.TileSizeH;
      const spos = {x: (x + 0.5) * xBlock, y: (y + 0.5) * yBlock};
      for (let i = 0; i < gameSetup.tankControllers.length; i++) {
        const tank = gameSetup.tankControllers[i].tank;
        if (gameSetup.gameType == GAME_TYPE.TESTING && !gameSetup.tankControllers[i].inTestCase) continue;
        const pos = {x: tank.position._x, y: tank.position._y - yBlock};
        const posP = {x: (prevRockC+ 0.5) * xBlock, y:(prevRockR+ 0.5) * yBlock};
        const d = dist2(pos, spos);
        const dP = dist2(pos, posP);
        // console.log("d is " + d + " dP is " + dP);
        // if (dP < xBlock / 2) {
        //   debugger;
        // }
        if (d < xBlock / 2 || dP < xBlock / 2 ) {
          if (tank.color === 'blue' || tank.color === 'red') {
            const allTankInEndRock = gameSetup.tankControllers.length > 1 &&
            (new Set(gameSetup.tankControllers
            .filter(t => t.tank.color == 'blue' || t.tank.color == 'red')
            .map(t => {
              const { row, col } = t.calculateTankRowCol();
              return `${row}-${col}`;
            }))).size === 1;
            if (allTankInEndRock) {
              gameSetup.allTankInEndRock = true
              return;
            }
          }
          gameSetup.networkHandler.sendCommandToAll({
            c: "HurtTank", t: gameSetup.currentCycleTime, w: `${tank.tankID}_${tank.fullHealth}_ENDGAME`
          });
        }
      }
      // remove crystal
      for (let j=0; j<gameSetup.crystals.length; j++) {
        const crystal = gameSetup.crystals[j];
        if (crystal.isUsed) continue;
        const { position } = crystal;
        const row = Math.round((position.y - yBlock / 2) / yBlock);
        const col = Math.round((position.x - xBlock / 2) / xBlock);
        if (row - 1 === y && col === x) {
          gameSetup.networkHandler.sendCommandToAll({
            c: "TankGainCrystal", t: gameSetup.currentCycleTime, w: `-1_${crystal.crystalID}`
          });
        }
      }
      // remove weapon
      for (let j=0; j<gameSetup.weapons.length; j++) {
        const weapon = gameSetup.weapons[j];
        if (weapon.isUsed) continue;
        const { position } = weapon;
        const row = Math.round((position.y - yBlock / 2) / yBlock);
        const col = Math.round((position.x - xBlock / 2) / xBlock);
        if (row - 1 === y && col === x) {
          gameSetup.networkHandler.sendCommandToAll({
            c: "TankGainWeapon", t: gameSetup.currentCycleTime, w: `-1_${weapon.weaponID}`
          });
        }
      }
    }
  }

  this.addOneWeapon = (type, r, c) => {
    const cfg = gameSetup.config;
    const x = c * cfg.TileSizeW + cfg.TileSizeW / 2;
    const y = (r+1 +0.5) * cfg.TileSizeH;
    this.addOneWeaponByXY(x, y, -1, type);
  }

  this.addOneCrystal = (r, c) => {
    const cfg = gameSetup.config;
    const x = c * cfg.TileSizeW + cfg.TileSizeW / 2;
    const y = (r+1 +0.5) * cfg.TileSizeH;
    this.addOneCrystalByXY(x, y, -1);
  }

  this.addOneTile = (tileType, r, c) => {
    const cfg = gameSetup.config;

    // load BACKGROUND_ITEMS

    // console.log('tileType need to be load', tileType);
    const tileImageMap = {
      "G": '/images/grassland1_64b.png',
      "B": `/images/Obs_Tallbush_64.png`,
      "M": `/images/Obs_Mud_64.png`,
      "R": `/images/Obs_Rock_64.png`,
      "T": `/images/Obs_Shorttree_64.png`,
    };

    let bgitems = gameSetup.backgroundItems;
    if (gameSetup.backgroundItems.length > 0) {
      for (let k=0; k<gameSetup.backgroundItems.length; k++) {
        bgitems = gameSetup.backgroundItems[k];
        if (bgitems.gameId == "tankwarmdKu94Qi2Y") {
          break;
        }
      }
    }

    const resource = _.get(bgitems, ['imageSrc', 'main', tileType], tileImageMap[tileType]);
    const t = new PIXI.Sprite(PIXI.loader.resources[resource].texture);
    t.width = 64;
    t.height = 72;

    const layer = gameSetup.mazeLayers[r];
    if (!layer) return;
    t.position.x = c * cfg.TileSizeW + cfg.TileSizeW / 2;
    t.position.y = (r+1 +0.5) * cfg.TileSizeH;
    t.anchor.set(0.5, 1);
    //t.parentGroup = group;
    // t.scale.set(1.2, 1.2);
    layer.addChild(t);
    gameSetup.maze[r][c] = tileType;
    gameSetup.mazeTiles[r][c] = t;
    gameSetup.tilemap += tileType + "_"+r+"_"+c+":";
    gameSetup.tilesAdded += tileType + "_"+r+"_"+c+":";
  };

  this.setupAimingHandler = () => {

    const c = gameSetup.mazeContainer;
    const cfg = gameSetup.config;

    // gameSetup.controlButtons.push(c);
    c.interactive = true;
    c.buttonMode = true;
    //c.hitArea = new PIXI.Rectangle(config.mazeCenterX - config.mazeW/2, config.mazeCenterY - config.mazeH/2, config.mazeW + 2 * config.metalBorderThick, config.mazeH + 2 * config.metalBorderThick);
    // c.hitArea = new PIXI.Rectangle(0, 0, 500, 500);
    const testtarget = new Victor(0, 0);

    const showPointerCoordinate = (event) => {
      // const whratio = config.TrueWidth / config.TrueHeight; // width vs height
      // const oldnewratio = config.TrueWidth / 1600; // new vs old true width
      // const metalBorderThick = 33.3964 * oldnewratio * 1.1;
      // const wtabletop = 2000; // table is 2000x1000 now!
      // const wfulltable = wtabletop + 2 * metalBorderThick;
      // const hfulltable = wtabletop/2 + 2 * metalBorderThick;

      const px = event.data.global.x / gameSetup.stage.scale.x;
      const py = event.data.global.y / gameSetup.stage.scale.y;
      gameSetup.flaglabel.position.x = px;
      gameSetup.flaglabel.position.y = py;

      const xBlock = cfg.TileSizeW;
      const yBlock = cfg.TileSizeH;
      const row = Math.round((py - yBlock) / yBlock);
      const col = Math.round((px - xBlock / 2) / xBlock);

      gameSetup.flaglabel.text = `(${col}, ${row})`;
    };

    const updateInputs = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        if (!gameSetup.activePlayerInfo.isLocal) return false;
        if (gameSetup.activePlayerInfo.playerType == "AI") return false;
      }

      if (gameSetup.gameType == GAME_TYPE.TESTING) {
        showPointerCoordinate(event);
      } else {
        return;
      }
    };

    const onDragStart = (event) => {

      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      t.dragging = true;
      updateInputs(event);
      event.stopped = true;
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      // event.stopPropegation();
      // const cb = gameSetup.cueball.body;
      // gameSetup.cueballDirection.x = event.data.global.x / gameSetup.stage.scale.x - cb.position[0];
      // gameSetup.cueballDirection.y = event.data.global.y / gameSetup.stage.scale.y - cb.position[1];
    };

    const onDragEnd = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      // console.log("xxxxxxxxx end dragging...");
      t.dragging = false;
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      event.stopped = true;
    };

    const onDragMove = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      if (!t.dragging) return;
      // console.log("in dragging...");
      updateInputs(event);
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      event.stopped = true;
    };

    c
        // events for drag start
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
  };


  this.addTileMarkFlag = () => {
    const cfg = gameSetup.config;
    const tilew = cfg.TileCols;
    const tileh = cfg.TileRows;

    const rowLabelStyle = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 30,
      fontStyle: '',
      fontWeight: '',
      fill: ['#2222ff'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    // add flag
    // const texture = PIXI.loader.resources[`/images/flag1.png`].texture;
    // gameSetup.flag = new PIXI.Sprite(texture);
    // gameSetup.flag.scale.x = cfg.TileSizeW * 0.6 / 256;
    // gameSetup.flag.scale.y = cfg.TileSizeH * 0.6 / 256;

    // gameSetup.flag.position.x = cfg.TileSizeW / 2;
    // gameSetup.flag.position.y = cfg.TileSizeH / 2;
    // gameSetup.flag.anchor.set(0, 0.5);

    gameSetup.flaglabel = new PIXI.Text("0,0", rowLabelStyle);
    gameSetup.flaglabel.position.x = cfg.TileSizeW / 2;
    gameSetup.flaglabel.position.y = cfg.TileSizeH / 2;
    gameSetup.flaglabel.anchor.set(0.5, 0.5);
    // gameSetup.mazeContainer.addChild(gameSetup.flag);
    gameSetup.mazeContainer.addChild(gameSetup.flaglabel);

  }

  this.addRowColNumbers = () => {
    const cfg = gameSetup.config;
    const tilew = cfg.TileCols;
    const tileh = cfg.TileRows;

    const rowLabelStyle = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 35,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffff00'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    for (let r = 0; r <= tileh - 1; r++) {
      const label = new PIXI.Text(r, rowLabelStyle);
      label.position.x = cfg.TileSizeW / 2;
      label.position.y = (r + 0.5) * cfg.TileSizeH - cfg.TileSizeH * 0;
      label.anchor.set(0.5, 0.5);
      gameSetup.mazeContainer.addChild(label);
    }

    for (let c = 1; c <= tilew - 1; c++) {
      const label = new PIXI.Text(c, rowLabelStyle);
      label.position.y = cfg.TileSizeH / 2 - cfg.TileSizeH * 0;
      label.position.x = (c + 0.5) * cfg.TileSizeW;
      label.anchor.set(0.5, 0.5);
      gameSetup.mazeContainer.addChild(label);
    }

  }

  this.addMaze = () => {
    console.log('addMaze');

    gameSetup.mazeContainer = new PIXI.Container();
    const cfg = gameSetup.config;

    const tileImageMap = {
      "G": '/images/grassland1_64b.png',
      "B": `/images/Obs_Tallbush_64.png`,
      "M": `/images/Obs_Mud_64.png`,
      "R": `/images/Obs_Rock_64.png`,
      "T": `/images/Obs_Shorttree_64.png`,
      "D": `/images/diamond_64.png`
    };

    // const tileImageAdjustY = {
    //   "G": 10,
    //   "T": 5,
    //   "M": 5,
    //   "R": 10,
    //   "S": 10
    // };
    // add grassland
    const bgKey = gameSetup.difficulty === ADVANCED ? 'BG' : 'BGB';

    let bgitems = gameSetup.backgroundItems;
    if (gameSetup.backgroundItems.length > 0) {
      for (let k=0; k<gameSetup.backgroundItems.length; k++) {
        bgitems = gameSetup.backgroundItems[k];
        if (bgitems.gameId == "tankwarmdKu94Qi2Y") {
          break;
        }
      }
    }
    const resoure = _.get(bgitems, ['imageSrc', 'main', bgKey]);
    const texture = PIXI.loader.resources[resoure].texture;
    const b = new PIXI.Sprite(texture);
    const tilew = cfg.TileCols;
    const tileh = cfg.TileRows;
    b.position.x = 0;
    b.position.y = cfg.TileSizeH * 0.5;
    b.anchor.x = 0;
    b.anchor.y = 0;
    b.scale.x = tilew * cfg.TileSizeW / 640;
    b.scale.y = tileh * cfg.TileSizeH  / 450;

    gameSetup.mazeLayers = [];

    gameSetup.mazeTiles = [];
    for (let r = 0; r <= tileh - 1; r++) {
      gameSetup.mazeTiles.push({});
    }

    for (let r = 0; r <= tileh - 1; r++) {
      const row = gameSetup.maze[r];
      //const group = new PIXI.display.Group(r, false);
      const layer = new PIXI.Container();
      gameSetup.mazeLayers.push(layer);
      if (r == 0) {
        layer.addChild(b);
      }
      // skip rockrange
      if (r !== 0 && r !== tileh - 1) {
        for (let c = 1; c < tilew - 1; c++) {
          let imgType = row[c];
          if (!imgType) continue; // imgType = "G";

          let bgitems = gameSetup.backgroundItems;
          if (gameSetup.backgroundItems.length > 0) {
            for (let k=0; k<gameSetup.backgroundItems.length; k++) {
              bgitems = gameSetup.backgroundItems[k];
              if (bgitems.gameId == "tankwarmdKu94Qi2Y") {
                break;
              }
            }
          }

          const resource = _.get(bgitems, ['imageSrc', 'main', imgType], tileImageMap[imgType]);

          const t = new PIXI.Sprite(PIXI.loader.resources[resource].texture);
          t.width = 64;
          t.height = 72;
          t.position.x = c * cfg.TileSizeW + cfg.TileSizeW / 2;
          t.position.y = (r + 1 + 0.5) * cfg.TileSizeH;

          t.anchor.set(0.5, 1);
          //t.parentGroup = group;
          // t.scale.set(1.2, 1.2);
          layer.addChild(t);
          gameSetup.mazeTiles[r][c] = t; // pointer to actual tile object
        }
      }
      gameSetup.mazeContainer.addChild(layer);

    }
    // add rockrange
    this.addRockrange();
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      this.addRowColNumbers();
      this.addTileMarkFlag();
      this.setupAimingHandler();
    }

    const layer = new PIXI.Container();
    gameSetup.mazeLayers[100] = layer;

    const layer2 = new PIXI.Container();
    gameSetup.mazeLayers[-100] = layer2;

    gameSetup.stage.addChild(gameSetup.mazeContainer);
  };

  this.addRockrange = () => {
    const cfg = gameSetup.config;
    const tileh = cfg.TileRows;
    const checkMobile = isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet;
    const horizontalBorderKey = gameSetup.difficulty === ADVANCED ? 'BH' : 'BBH';
    let horizontalBorderKey2 = gameSetup.difficulty === ADVANCED ? 'BHU' : 'BBHU';

    if (checkMobile) {
      horizontalBorderKey2 = horizontalBorderKey2.replace('U', '');
    }
    const defaultTiles = {
      BBV: '/images/tank/rockrange_beginer_vertical.png',
      BBH: '/images/tank/rockrange_beginer_horizontal.png',
      BBHU: '/images/tank/rockrange_beginer_horizontal.png',
      BV: '/images/tank/rockrange_vertical.png',
      BH: '/images/tank/rockrange_horizontal.png',
      BHU: '/images/tank/rockrange_horizontal.png'
    };


    let bgitems = gameSetup.backgroundItems;
    if (gameSetup.backgroundItems.length > 0) {
      for (let k=0; k<gameSetup.backgroundItems.length; k++) {
        bgitems = gameSetup.backgroundItems[k];
        if (bgitems.gameId == "tankwarmdKu94Qi2Y") {
          break;
        }
      }
    }
    const horizontalBorderUrl = _.get(bgitems, ['imageSrc', 'main', horizontalBorderKey], defaultTiles[horizontalBorderKey]);
    const horizontalBorderTexture = PIXI.loader.resources[horizontalBorderUrl].texture;
    const horizontalRockrangeTop = new PIXI.Sprite(horizontalBorderTexture);
    horizontalRockrangeTop.position.x = 0;
    horizontalRockrangeTop.position.y= 0;
    horizontalRockrangeTop.anchor.x = 0;
    horizontalRockrangeTop.anchor.y = 0;
    gameSetup.mazeLayers[0].addChild(horizontalRockrangeTop);

    const horizontalRockrange2Url = _.get(bgitems, ['imageSrc', 'main', horizontalBorderKey2], defaultTiles[horizontalBorderKey2]);
    const horizontalRockrange2Texture = PIXI.loader.resources[horizontalRockrange2Url].texture;
    const horizontalRockrangeBottom = new PIXI.Sprite(horizontalRockrange2Texture);
    horizontalRockrangeBottom.position.x = cfg.TrueWidth;
    horizontalRockrangeBottom.position.y= (cfg.TileRows + 0.5) * cfg.TileSizeH - 1;
    horizontalRockrangeBottom.anchor.x = 1;
    horizontalRockrangeBottom.anchor.y = 1;
    gameSetup.mazeLayers[tileh - 1].addChild(horizontalRockrangeBottom);

    const verticalBorderKey = gameSetup.difficulty === ADVANCED ? 'BV' : 'BBV';

    const verticalBorderUrl = _.get(bgitems, ['imageSrc', 'main', verticalBorderKey], defaultTiles[verticalBorderKey]);
    const verticalBorderTexture = PIXI.loader.resources[verticalBorderUrl].texture;
    const leftVerticalRockrange = new PIXI.Sprite(verticalBorderTexture);
    leftVerticalRockrange.position.x = 0;
    leftVerticalRockrange.position.y = (cfg.TileRows + 0.5) * cfg.TileSizeH;
    leftVerticalRockrange.anchor.x = 0;
    leftVerticalRockrange.anchor.y = 1;
    leftVerticalRockrange.height = cfg.TileSizeH * cfg.TileRows + horizontalRockrangeTop.height - cfg.TileSizeH;
    gameSetup.mazeLayers[0].addChild(leftVerticalRockrange);
    const rightVerticalRockrange = new PIXI.Sprite(verticalBorderTexture);
    rightVerticalRockrange.position.x = cfg.TrueWidth;
    rightVerticalRockrange.position.y =  (cfg.TileRows + 0.5) * cfg.TileSizeH;
    rightVerticalRockrange.anchor.x = 1;
    rightVerticalRockrange.anchor.y = 1;
    rightVerticalRockrange.height = cfg.TileSizeH * cfg.TileRows + horizontalRockrangeTop.height - cfg.TileSizeH;
    gameSetup.mazeLayers[0].addChild(rightVerticalRockrange);
  }

  this.addTimer = () => {
    const config = gameSetup.config;
    const size = Math.floor(20 * config.scalingratio);
    const style0 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 50,
      fontStyle: '',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: false,
      wordWrapWidth: 440
    });

    gameSetup.secondsLeft = gameSetup.initialTimeSeconds;
    // pi.secondsLeft = 10;
    gameSetup.clockTimeStr = "05:00";
    if (gameSetup.difficulty == ADVANCED) {
      gameSetup.clockTimeStr = "10:00";
    }
    gameSetup.inTimeCountDown = false;

    const richText0 = new PIXI.Text(gameSetup.clockTimeStr, style0);
    richText0.x = config.TrueWidth  - 5;
    richText0.y = 5;
    richText0.anchor.set(1, 0);

    gameSetup.mazeContainer.addChild(richText0);
    gameSetup.countdownClockText = richText0;
    gameSetup.updateTimer = (s) => {
      let seconds = Math.round(s);
      if (seconds < 0) {
        seconds = 0;
      }
      const sec = seconds % 60;
      const minutes = Math.round((seconds - sec) / 60);
      const secstr = (sec <= 9) ? `0${sec}` : sec;
      const minstr = (minutes <= 9) ? `0${minutes}` : minutes;
      const timestr = `${minstr}:${secstr}`;
      gameSetup.clockTimeStr = timestr;
      gameSetup.countdownClockText.text = timestr;
    };
  }

  this.getNewEmptyBlock = () => {
    const cfg = gameSetup.config;

    // find a new random spot for it
    let c = -1; let r = -1;
    while (true) {
      c = Math.floor(Math.random() * cfg.TileCols);
      r = Math.floor(Math.random() * cfg.TileRows);
      if (!gameSetup.maze[r][c]) break;
    }
    return {r, c};
  };

  this.addCurrentHealth = (tank) => {
    const { health, fullHealth } = tank;
    if (tank.currentHealthBar) {
      tank.removeChild(tank.currentHealthBar);
    }
    const prop = health / fullHealth;
    const { fullTankWidth, fullTankHeight } = tank;
    const maskWidth = fullTankWidth;
    const maskHeight = fullTankHeight;
    const healthContentResourceWidth = 74; // need update
    const currentHealthContentResourceWidth = (maskWidth - healthContentResourceWidth) / 2 + healthContentResourceWidth * prop;
    const { texture } = PIXI.loader.resources[`/images/tank/full_health_${tank.color}.png`];
    const mask = new PIXI.Texture(texture, { x: 0, y: 0, width: currentHealthContentResourceWidth, height: maskHeight });
    const currentHealthBar = new PIXI.Sprite.from(mask);
    // const maskTexture = PIXI.loader.resources[`/images/tank_mask.png`].baseTexture;
    currentHealthBar.anchor.set(0, TANK_MASK_PROP);
    currentHealthBar.position.x = - fullTankWidth / 2;
    currentHealthBar.position.y = 0;
    currentHealthBar.width = currentHealthContentResourceWidth;
    currentHealthBar.height = maskHeight;
    currentHealthBar.zIndex = 2;
    tank.currentHealthBar = currentHealthBar;
    tank.addChild(currentHealthBar);
    if (tank.healthBorder) {
      tank.removeChild(tank.healthBorder)
    }
    const healthBorder = this.addTextureToTank(tank, '/images/tank/health_border.png', false);
    tank.healthBorder = healthBorder;
  }

  this.addHealthStatus = (tank) => {

    if (tank.healthLabel) {
      tank.removeChild(tank.healthLabel)
    }
    const { tankWidth, tankHeight, fullTankHeight } = tank;
    const barHeight = tankHeight / 4;
    const barWidth = tankWidth * 1.3;
    const bottomMargin = barHeight * 2;
    const tankHealthLabelStyle = new PIXI.TextStyle({
      fontFamily: 'EurostileBold',
      fontSize: 14,
      fontStyle: '',
      fontWeight: 500,
      fill: ['#ffffff'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 1,
      dropShadowAngle: Math.PI * 0.5,
      dropShadowDistance: 3,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const { health } = tank;

    const label = new PIXI.Text(health, tankHealthLabelStyle);

    label.position.x = 0;
    label.position.y = - TANK_MASK_PROP * fullTankHeight + 8;
    label.anchor.set(0.5, 0);
    label.zIndex = 3;
    tank.addChild(label);
    tank.healthLabel = label;
  };

  this.addTankName = (tank) => {
    if (tank.tankName) {
      tank.removeChild(tank.playerName)
    }
    const { tankWidth, tankHeight, fullTankHeight } = tank;
    const barHeight = tankHeight / 4;
    const barWidth = tankWidth * 1.3;
    const bottomMargin = barHeight * 2;
    const color = tank.tankID === 0 ? '#9cfa88' : '#dd6e64';
    const shadowColor = tank.tankID === 0 ? '#2d4234' : '##6d322e';

    const tankNameLabelStyle = new PIXI.TextStyle({
      fontFamily: 'EurostileBold',
      fontSize: 16,
      fontStyle: '',
      fontWeight: 500,
      fill: [color],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: shadowColor,
      dropShadowBlur: 1,
      dropShadowAngle: Math.PI * 0.5,
      dropShadowDistance: 3,
      wordWrap: false,
      wordWrapWidth: 440
    });
    const { playerInfo } = gameSetup;
    let tankNameValue = (playerInfo[tank.tankID] || {}).username || (playerInfo[tank.tankID] || {}).playerID || 'Unknown';

    const tankName = new PIXI.Text(tankNameValue, tankNameLabelStyle);
    tankName.position.x = 0;
    tankName.position.y = - fullTankHeight + 10;
    tankName.anchor.set(0.5, 0);
    tankName.zIndex = 3;
    tank.addChild(tankName);
    tank.tankName = tankName;

  }

  this.updatePowerStatus = (tank) => {
    const { fullTankWidth, fullTankHeight, powerPoint } = tank;
    const power = Math.min(tank.powerPoint, MAX_POWER_UP);
    for (let i = 1; i <= MAX_POWER_UP; i += 1) {
      if (tank.powerStackPoint && tank.powerStackPoint[i]) {
        tank.removeChild(tank.powerStackPoint[i])
        tank.powerStackPoint[i] = null;
      }
    }
    for (let i = 1; i <= power; i += 1) {
      const powerStack = this.addTextureToTank(tank, `/images/tank/power_${i}.png`, false);
      tank.addChild(powerStack);
      if (!tank.powerStackPoint) {
        tank.powerStackPoint = {};
      }
      tank.powerStackPoint[i] = powerStack;
    }
  }

  this.updateSpecialPower = (tank) => {
    const { specialPower } = tank;
    const { reload, speed, damage, healthRegen } = specialPower;
    if (tank.specialPowerBar) {
      tank.hasPendingSpeedUpdate = true;
      this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.DAMAGE, damage)
      this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.RELOAD, reload)
      this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.SPEED, speed)
      this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.HEALTH_REGEN, healthRegen)
    }
  }

  this.updateOneSpecialPowerUI = (tank, specialPower, power) => {
    const MAX_POWER = gameSetup.difficulty === BEGINNER ? MAX_POWER_BEGINNER : MAX_POWER_ADVANCED;
    const powerTexturePrefix = SPECIAL_POWER_PREFIX[specialPower];
    const { specialPowerBar } = tank;
    const currentSpecialPower = specialPowerBar[specialPower];
    for (let i = 1; i <= MAX_POWER; i += 1) {
      if (currentSpecialPower && currentSpecialPower[i]) {
        gameSetup.mazeLayers[this.gameSetup.config.TileRows - 1].removeChild(currentSpecialPower[i]);
        currentSpecialPower[i] = null;
      }
    }
    const newCurrentSpecialPower = {};
    for (let i = 1; i <= power; i += 1) {
      const powerStack = this.addTextureToTank(tank, `/images/tank/${powerTexturePrefix}_${MAX_POWER}_${i}.png`);
      // tank.addChild(powerStack);
      newCurrentSpecialPower[i] = powerStack;
    }
    tank.specialPowerBar[specialPower] = newCurrentSpecialPower;
  }

  this.upgradeSpecialPower = (tank, powerName) => {
    const MAX_POWER = gameSetup.difficulty === BEGINNER ? MAX_POWER_BEGINNER : MAX_POWER_ADVANCED;
    const { powerPoint, specialPower } = tank;
    const { reload, speed, damage, healthRegen } = specialPower;
    if (powerPoint > 0) {
      switch(powerName) {
        case SPECIAL_POWER.DAMAGE: {
          if (damage + 1 <= MAX_POWER) {
            tank.specialPower.damage += 1;
            tank.powerPoint -= 1;
            this.updatePowerStatus(tank);
            this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.DAMAGE, tank.specialPower.damage);
          }
          break;
        }
        case SPECIAL_POWER.RELOAD: {
          if (reload + 1 <= MAX_POWER) {
            tank.specialPower.reload += 1;
            tank.powerPoint -= 1;
            tank.reloadTime = 1200 - tank.specialPower.reload * 100;
            this.updatePowerStatus(tank);
            this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.RELOAD, tank.specialPower.reload);
          }
          break;
        }
        case SPECIAL_POWER.SPEED: {
          if (speed + 1 <= MAX_POWER) {
            tank.specialPower.speed += 1;
            tank.powerPoint -= 1;
            const cfg = gameSetup.config;
            tank.hasPendingSpeedUpdate = true;
            // tank.speedLimitX = cfg.TileSizeW / 60 * (DEFAULT_SPEED + tank.specialPower.speed); // 2;
            // tank.speedLimitY = cfg.TileSizeH / 60 * (DEFAULT_SPEED + tank.specialPower.speed); // 2;
            this.updatePowerStatus(tank);
            this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.SPEED, tank.specialPower.speed);
          }
          break;
        }
        case SPECIAL_POWER.HEALTH_REGEN: {
          if (healthRegen + 1 <= MAX_POWER) {
            tank.specialPower.healthRegen += 1;
            tank.powerPoint -= 1;
            this.updatePowerStatus(tank);
            this.updateOneSpecialPowerUI(tank, SPECIAL_POWER.HEALTH_REGEN, tank.specialPower.healthRegen);
          }
          break;
        }
      }
    }
  }

  this.addOneCrystalByXY= (x, y, crystalID) => {
    if (crystalID === -1) {
      let cId = this.gameSetup.crystals.length;
      for (let k = 0; k < this.gameSetup.crystals.length; k++) {
        const c = this.gameSetup.crystals[k];
        if (c.isUsed) {
          cId = k;
          break;
        }
      }
      crystalID = cId;
    }
    let c = null;
    if (gameSetup.crystals[crystalID]) {
      c = gameSetup.crystals[crystalID];
      c.position.x = x;
      c.position.y = y;
      c.isUsed = false;
    } else {
      const c = new PIXI.Sprite(PIXI.loader.resources[`/images/diamond_64.png`].texture);
      c.anchor.set(0.5, 1);
      // add shadow
      const shadow = new PIXI.Sprite(PIXI.loader.resources['/images/tank/weaponiconShadow.png'].texture);
      shadow.anchor.set(0.5, 0.75);
      shadow.position.x = x;
      shadow.position.y = y;
      shadow.scale.x = 0.75;
      shadow.scale.y = 0.75;
      shadow.addChild(c);
      shadow.crystalID = crystalID;

      gameSetup.mazeContainer.addChild(shadow);
      gameSetup.crystals.push(shadow);
    }
  };

  this.addOneWeaponByXY = (x, y, weaponID, type) => {
    if (weaponID === -1) {
      let wId = this.gameSetup.weapons.length;
      for (let k=0; k<this.gameSetup.weapons.length; k++) {
        const c = this.gameSetup.weapons[k];
        if (c.isUsed && c.type === type) {
          wId = k;
          break;
        }
      }
      weaponID = wId;
    }
    if (gameSetup.weapons[weaponID]) {
      const weapon = gameSetup.weapons[weaponID];
      weapon.createdAt = new Date();
      weapon.alpha = 1;
      weapon.position.x = x;
      weapon.position.y = y;
      weapon.isUsed = false;
    } else {
      const config = gameSetup.config;
      const { TileSizeH } = config;
      // will update type of weapon late
      const weapon = new PIXI.Sprite(PIXI.loader.resources[getSpecialWeaponResourceName(type)].texture);
      // weapon.scale.x = gameSetup.config.TileSizeW / weapon.width;
      // weapon.scale.y = gameSetup.config.TileSizeH / weapon.height;
      weapon.anchor.set(0.5, 1);

      // add shadow
      const shadow = new PIXI.Sprite(PIXI.loader.resources['/images/tank/weaponiconShadow.png'].texture);
      shadow.anchor.set(0.5, 0.75);
      shadow.position.x = x;
      shadow.position.y = y;
      shadow.scale.x = 0.75;
      shadow.scale.y = 0.75;
      shadow.addChild(weapon);
      shadow.type = type;
      shadow.createdAt = new Date();
      shadow.weaponID = weaponID;

      gameSetup.mazeContainer.addChild(shadow);
      gameSetup.weapons.push(shadow);
    }
  };

  this.addTankMask = (tank) => {
    const { fullTankWidth, fullTankHeight } = tank;
    const maskWidth = fullTankWidth;
    const maskHeight = fullTankHeight;
    const powerBorder = this.addTextureToTank(tank, '/images/tank/power_border.png', false);
    if (gameSetup.difficulty === BEGINNER) {
      tank.specialPowerBorder = this.addTextureToTank(tank, '/images/tank/special_power_beginner_border.png');
    } else {
      tank.specialPowerBorder = this.addTextureToTank(tank, '/images/tank/special_power_advanced_border.png');
    }
    if (tank.tankID === gameSetup.localPlayerID) {
      tank.circleMark = this.addTextureToTank(tank, '/images/tank/circle_mark.png');
    }
  }

  this.addTextureToTank = (tank, resourceName, bringToFront = true) => {
    const { fullTankWidth, fullTankHeight } = tank;
    const texture = new PIXI.Sprite(PIXI.loader.resources[resourceName].texture);
    if (!bringToFront) {
      texture.anchor.set(0.5, TANK_MASK_PROP);
      texture.position.x = 0;
      texture.position.y = 0;
      texture.width = fullTankWidth;
      texture.height = fullTankHeight;
      texture.zIndex = 1000;
      tank.addChild(texture);
      return texture;
    }
    texture.anchor.set(0.5, 0.5);
    texture.position = {};
    texture.position.x = tank.position._x
    texture.position.y = tank.position._y - gameSetup.config.TileSizeH;
    texture.width = fullTankWidth;
    texture.height = fullTankHeight;
    gameSetup.mazeLayers[this.gameSetup.config.TileRows - 1].addChild(texture);
    return texture;
  }

  this.addOneTank = (color, r, c, tankID, addAI = true) => {
    // tank can overlap so no need to add to this maze!
    // gameSetup.maze[r][c] = "T";
    // console.log("addOneTank to " + gameSetup.tankControllers.length + ": " + color + " " + c + " " + r + " " + tankID + " " + initDead + " " + addAI);
    const cfg = gameSetup.config;
    const that = this;

    let tank = null;
    if (gameSetup.tankControllers[tankID]) {
      let t = gameSetup.tankControllers[tankID];
      tank = t.tank;
      tank.isDead = false;
      tank.health = 500;
      tank.freeze = false;

      if (tank.freezeLayout) {
        t.removeFreezeLayout();
      }

      if (color == 'red' || color == 'blue') {
        tank.health = 5000;
        if (gameSetup.difficulty == ADVANCED) {
          tank.health = 8000;
        }
      } else {
        t.inTestCase = true;
      }
      tank.fullHealth = tank.health;
      gameSetup.tankControllers[tankID].updateHealth(tank.health);
      tank.position.x = Math.fround(c * cfg.TileSizeW + cfg.TileSizeW / 2);
      tank.position.y = Math.fround((r+1 +0.5) * cfg.TileSizeH);
      gameSetup.tankControllers[tankID].updatePosition();

      const newparent = gameSetup.mazeLayers[r];
      if (newparent != tank.parent) {
        if (tank.parent) tank.parent.removeChild(tank);
        newparent.addChild(tank);
      }

      if (tank.color == "white" && gameSetup.isHost && addAI) {
        // need to have an AI to control white tank
        tank.systemAI = new SystemAI(gameSetup, tank);
      } else {
        delete tank.systemAI;
      }


    } else {
      const tankWidth = cfg.TileSizeW;
      const tankHeight = 70;

      let userId;
      if (color === 'white') {
        userId = gameSetup.config.localPlayerID;
      } else {
        userId = _.get(_.find(gameSetup.playerInfo, info => info.ID === tankID), 'userId');
      }
      const mainItem = _.find(gameSetup.mainItems, { userId })
      tankImageUrl = _.get(mainItem, `imageSrc.main.${color}`, `/images/${color}tanksheetof4.png`);

      this.loadFramedSpriteSheet(tankImageUrl, color, cfg.TileSizeW, tankHeight, 4, (frames) => {
        const tank = new PIXI.extras.AnimatedSprite(frames);
        // tank.scale.set(config.ballD / 41);

        //tank.oldp = new Victor(Math.fround(c * cfg.TileSizeW + cfg.TileSizeW / 2), Math.fround((r+1 +0.5) * cfg.TileSizeH));
        // tank.nextPos = tank.oldp.clone();
        tank.tankWidth = tankWidth;
        tank.tankHeight = tankHeight;
        tank.position.x = Math.fround(c * cfg.TileSizeW + cfg.TileSizeW / 2);
        tank.position.y = Math.fround((r+1 +0.5) * cfg.TileSizeH);
        tank.anchor.x = 0.5;
        tank.anchor.y = 1;

        if (gameSetup.mazeLayers[r])
          gameSetup.mazeLayers[r].addChild(tank);
        // gameSetup.mazeContainer.addChild(tank);

        tank.shells = [];
        tank.tankID = tankID;
        tank.color = color;

        tank.state = "PU"; // paused facing up
        tank.dir = "U";  // sprite facing direction
        // tank.frame = 2;
        tank.gotoAndStop(2);

        tank.speedX = 0; // speed dir is 1/0/-1
        tank.speedY = 0;

        // actaul moving speed: 3 block per second at starting level
        tank.speedLimitX = cfg.TileSizeW / 60 * 3;// 2;
        tank.speedLimitY = cfg.TileSizeH / 60 * 3;// 2;

        tank.reloadTime = 1200; // at least 1.2 second
        tank.health = 5000;
        if (gameSetup.difficulty == ADVANCED) {
          tank.health = 8000;
        }
        tank.isDead = false;

        tank.powerPoint = 0; // initial power point
        tank.fullTankWidth = FULL_TANK_WIDTH;
        tank.fullTankHeight = FULL_TANK_HEIGHT;

        if (tank.color == "white") {
          tank.health = 500;
          tank.specialPower = {};
          tank.specialPower.damage = 0;
          if (gameSetup.difficulty == ADVANCED) {
            tank.specialPower.damage = 1;
          }
          tank.specialWeapon = {
            type: 0,
          };

        }
        tank.fullHealth = tank.health;
        if (tank.color !== "white") {
          that.addTankMask(tank);
          that.addTankName(tank);
          tank.specialPower = {
            damage: 0,
            reload: 0,
            speed: 0,
            healthRegen: 0
          };
          tank.zIndex = 1000;
          tank.specialPowerBar = {};
          // tank.powerPoint = 2;
          that.updatePowerStatus(tank);
          that.updateSpecialPower(tank);
          tank.specialWeapon = { // initial weapon
            type: 0,
          }
          
        }
        that.addCurrentHealth(tank);
        that.addHealthStatus(tank);


        gameSetup.tanks.push(tank);

        gameSetup.tankControllers.push(new TankController(gameSetup, tankID, gameSetup.localPlayerID));
        tank.tankController = gameSetup.tankControllers[tankID];

        gameSetup.tankControllers[tankID].updatePosition();
        if (tank.color == "white") gameSetup.tankControllers[tankID].inTestCase = true;

        if (tank.color == "white" && gameSetup.isHost && addAI) {
          // need to have an AI to control white tank
          tank.systemAI = new SystemAI(gameSetup, tank);
        }

        // if (initDead) {
        //   tank.health = 0;
        //   tank.isDead = true;
        //   // tank.position.x = -10000;
        // }
      });
    }

    
  };

  this.setupTimer = () => {
    console.log('setupTimer');
    if (gameSetup.timerID) {
      clearInterval(gameSetup.timerID);
    }
    if (gameSetup.isHost) {
      gameSetup.timerID = setInterval(() => {
        if (gameSetup.gameOver) return;

        gameSetup.secondsLeft -= 1;
        if (gameSetup.isLocal) {
          gameSetup.updateTimer(gameSetup.secondsLeft);
        } else {
          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "UpdateTimer", t: gameSetup.currentCycleTime, w: `${gameSetup.secondsLeft}`
          });
        }
        if (gameSetup.secondsLeft == 0) {
          clearInterval(gameSetup.timerID);
          gameSetup.controller.startEndGameMode();
          return;
        }
      }, 1000);
    }
  }

  this.setupUsingMaze = () => {
    console.log('setupUsingMaze');

    this.addMaze();

    //this.addTanks();
    this.setupKeyboardControl();
    this.addModalMessageScreen();
    this.addTimer();
    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      this.addQuitButton();
      this.addHelpQuestionMark();
      this.setupTimer();
    }

    this.setupRobots();

  };

  this.setupRobots = () => {
    gameSetup.controller.createWorldForPlayer();

    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      gameSetup.controller.createAIPlayers();
    } else {
      // run init setup code
      // debugger;
      if (window.UserSetupCode) {
        const latestTime = window.UserSetupCode.CodeUpdates[window.UserSetupCode.CodeUpdates.length - 1].time;
        gameSetup.testSetupCode = reconstructCode(window.UserSetupCode, latestTime);
      }

      if (gameSetup.testSetupCode) {

        Meteor.setTimeout(() => {
          // console.log('to reset table after test!');
          if (!gameSetup.controller) return;
          gameSetup.controller.setRobotCode("     "); //can't be blank

          const cleanTestSetupCode = getCleanTestCode(gameSetup.testSetupCode);
          gameSetup.controller.createAIPlayers(cleanTestSetupCode, true);
        }, 1500);
      }
    }
  };

  this.renderAllPlayerTanks = () => {
    let visibleTime = 1200;
    for (let i = 0; i < gameSetup.numberOfPlayers; i++) {
      // setTimeout(() => {

      // }, visibleTime);
      // visibleTime += 100;
      const player = gameSetup.playerInfo[i];
      const newPoint = this.getNewEmptyBlock();
      const team = (player.teamID == 0) ? "blue" : "red";
      gameSetup.networkHandler.sendCommandToAll({
        c: "AddTank", t: gameSetup.currentCycleTime, w: `${team}_${newPoint.r}_${newPoint.c}_${player.ID}`
      });
    }
  }

  this.initScreen = function() {
    if (!gameSetup.isLocal) {
      const allPeersConnected = gameSetup.peers.findIndex(pObj => pObj.peer && !pObj.peer.connected) === -1;
      if (gameSetup.initialized || !allPeersConnected) {
        return;
      }
      gameSetup.initialized = true;
      console.log('all peers connected');
    }

    // this.setItemEquipped();

    if (gameSetup.isLocal || gameSetup.isHost) {
      this.calculateTileMap();

      if (gameSetup.isLocal) {
        console.log("local game! so setup using maze");
        gameSetup.gameStarted = true;
        this.setupUsingMaze();

        if (gameSetup.gameType != GAME_TYPE.TESTING) {
          for (let i = 0; i < gameSetup.playerInfo.length; i++) {
            const player = gameSetup.playerInfo[i];
            if (player.teamID == 0) {
              let newPoint = this.getNewEmptyBlock();
              this.addOneTank("blue", newPoint.r, newPoint.c, i);
            } else {
              let newPoint = this.getNewEmptyBlock();
              this.addOneTank("red", newPoint.r, newPoint.c, i);
            }
          }
        } else {
          // create red and blue tank but set them to be dead initially
          let newPoint = {r: 0, c: 0};
          this.addOneTank("blue", newPoint.r, newPoint.c, 0, true);
          this.addOneTank("red", newPoint.r, newPoint.c, 1, true);
        }

        gameSetup.setupTbotMessage();

        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          this.setupTestResultDisplay();
          this.setupHandleTestResult();
        } else {

        }
      } else {
        // send maze to all
        console.log("network game! so send InitMaze to all", gameSetup.peers);
        gameSetup.networkHandler.sendCommandToAll({
          c: "InitMaze", t: gameSetup.currentCycleTime, w: gameSetup.tilemap
        });

        this.renderAllPlayerTanks();
      }
    }


    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // add blue and red tanks
      gameSetup.gameEngine.addOneTank("blue", -100, -100, 0, false);
      gameSetup.gameEngine.addOneTank("red", -100, -100, 1, false);
      gameSetup.gameEngine.addOneTank("blue", -100, -100, 2, false);
      gameSetup.gameEngine.addOneTank("red", -100, -100, 3, false);
      gameSetup.gameEngine.addOneTank("blue", -100, -100, 4, false);
      gameSetup.gameEngine.addOneTank("red", -100, -100, 5, false);
      for (let i = 0; i < gameSetup.tankControllers.length; i++) {
        const tc = gameSetup.tankControllers[i];
        tc.inTestCase = false;
        tc.pinfo = gameSetup.playerInfo[i];
      }
    }

    this.setupCenterMessage();

    return;

    this.createControls();

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      this.setupTestResultDisplay();
      this.setupHandleTestResult();
    } else {
      this.addInputEmitter();

    }

    this.addHelpQuestionMark();


    this.addModalMessageScreen();
    this.addQuitButton();



    // that.createOverlayScreen();
    // that.createOverlayScreen2();
    // if (gameSetup.gameType != GAME_TYPE.TESTING) {
    //     that.drawGameControlsLeft();
    //     that.drawGameControlsRight();
    //     that.drawExitScreen();
    // } else {
    //     that.drawTestResultScreen();
    // }

    // other one time initialization
    gameSetup.timedifflist = [];

    // console.log("done with initialization");
  };

  this.drawTestResultScreen = () => {
    // debugger;
    container = document.getElementById('gameDiv');
    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99;
    }

    const myView = document.createElement("DIV");
    myView.setAttribute("id", "TestResultScreen");
    container.appendChild(myView);
    // myView.setAttribute("style", "z-index:-100");

    pixirenderertestresult = PIXI.autoDetectRenderer(w, h, { transparent: true });
    myView.appendChild(pixirenderertestresult.view);
    pixirenderertestresult.view.setAttribute("id", "TestResultScreenCanvas");

    const top = renderer.domElement.offsetTop;
    //pixicontrolrendererexit.view.setAttribute("style", `position:absolute;background-color:#000000;opacity: 0.7;top:${top}px;left:0px;width:${w}px;height:${h}px`);
    // pixirenderertestresult.view.setAttribute("style", `position:absolute;z-index:-100;top:${top}px;left:0px;width:${w}px;height:${h}px`);
    pixirenderertestresult.view.setAttribute("style", `position:absolute;z-index:-100;top:0px;left:0px;width:100%;height:100%`);


    let g = new PIXI.Graphics();

    g.lineStyle(0, 0x000000, 1);
    g.beginFill(0x000000, 0.7);
    g.drawRect(0, 0, w, h);
    g.endFill();

    g.lineStyle(5, 0xffff00, 1);
    g.beginFill(0xcdd2d8, 1);
    const msgBoxy = top + h * 0.45;
    const msgBoxWidth = w * 0.8;
    const msgBoxHeight = h * 0.3;
    g.drawRoundedRect(w / 2 - msgBoxWidth / 2, msgBoxy - msgBoxHeight / 2, msgBoxWidth, msgBoxHeight, msgBoxHeight / 10);
    g.endFill();
    g.interactive = true;
    g.hitArea = new PIXI.Rectangle(0, 0, w, h);
    g.on('pointerdown', () => {
      gameSetup.clearTestResult();

      gameSetup.gameOver = true;
      if (gameSetup.tweenF1) {
        gameSetup.tweenF1.stop();
        gameSetup.tweenB1.stop();
        gameSetup.tweenF2.stop();
        gameSetup.tweenB2.stop();
        gameSetup.inStrikeAnimation = false;
      }

      gameSetup.exitTestScreen();
    });

    gameSetup.testResultStage.addChild(g);

    const buttony = top + h * 0.5;
    const buttonx = w * 0.5;
    const btnWidth = w * 0.1;
    const btnHeight = h * 0.06;
    g = new PIXI.Graphics();
    g.lineStyle(5, 0x687af2, 1);
    g.beginFill(0x132fef, 1);
    g.drawRoundedRect(buttonx - btnWidth / 2, buttony - btnHeight / 2, btnWidth, btnHeight, btnHeight / 10);

    gameSetup.testResultStage.addChild(g);


    // text

    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 30,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#03421c'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const testResultText = new PIXI.Text(`No Test Taken`, style);
    testResultText.x = buttonx;
    testResultText.y = top + h * 0.4;
    testResultText.anchor.set(0.5, 0.5);
    gameSetup.testResultStage.addChild(testResultText);


    const style2 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 30,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#4a1850',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const richText2 = new PIXI.Text(`OK`, style2);
    richText2.x = buttonx;
    richText2.y = buttony;
    richText2.anchor.set(0.5, 0.5);
    gameSetup.testResultStage.addChild(richText2);

    gameSetup.clearTestResult = () => {
      const s = document.getElementById('TestResultScreenCanvas');
      s.style.zIndex = -100;
    };

    gameSetup.showTestResult = () => {
      const s = document.getElementById('TestResultScreenCanvas');
      s.style.zIndex = 100;
      testResultText.text = window.testResult;

    };
  };

  // this.drawExitScreen = () => {
  //   container = document.getElementById('gameDiv');
  //   let w = window.innerWidth;
  //   let h = window.innerHeight - vcushion;
  //   if (gameSetup.gameType == GAME_TYPE.TESTING) {
  //     const shell = document.getElementById('gameDivShellModal');
  //     w = shell.clientWidth;
  //     h = shell.clientHeight;
  //   }

  //   const myView = document.createElement("DIV");
  //   myView.setAttribute("id", "ExitScreen");
  //   container.appendChild(myView);
  //   // myView.setAttribute("style", "z-index:-100");

  //   pixicontrolrendererexit = PIXI.autoDetectRenderer(w, h, { transparent: true });
  //   myView.appendChild(pixicontrolrendererexit.view);
  //   pixicontrolrendererexit.view.setAttribute("id", "ExitScreenCanvas");

  //   // const top = renderer.domElement.offsetTop;
  //   const top = container.offsetTop;
  //   //pixicontrolrendererexit.view.setAttribute("style", `position:absolute;background-color:#000000;opacity: 0.7;top:${top}px;left:0px;width:${w}px;height:${h}px`);
  //   pixicontrolrendererexit.view.setAttribute("style", `position:absolute;z-index:-100;top:${top}px;left:0px;width:${w}px;height:${h}px`);
  //   // pixicontrolrendererexit.backgroundColor = 0xff0000;


  //   let g = new PIXI.Graphics();

  //   g.lineStyle(0, 0x687af2, 1);
  //   g.beginFill(0x000000, 0.7);
  //   g.drawRect(0, 0, w, h);
  //   g.endFill();

  //   g.lineStyle(5, 0xffff00, 1);
  //   g.beginFill(0xcdd2d8, 1);
  //   const msgBoxy = top + h * 0.4;
  //   const msgBoxWidth = w * 0.4;
  //   const msgBoxHeight = h * 0.2;
  //   g.drawRoundedRect(w / 2 - msgBoxWidth / 2, msgBoxy - msgBoxHeight / 2, msgBoxWidth, msgBoxHeight, msgBoxHeight / 10);
  //   g.endFill();
  //   g.interactive = true;
  //   g.hitArea = new PIXI.Rectangle(0, 0, w, h);
  //   g.on('pointerdown', () => {
  //     const s = document.getElementById('ExitScreenCanvas');
  //     s.style.zIndex = -100;
  //   });

  //   gameSetup.exitStage.addChild(g);

  //   // exit button
  //   const buttony = top + h * 0.4;
  //   const buttonx = w * 0.42;
  //   const btnWidth = w * 0.1;
  //   const btnHeight = h * 0.08;
  //   g = new PIXI.Graphics();
  //   g.lineStyle(5, 0x687af2, 1);
  //   g.beginFill(0x132fef, 1);
  //   g.drawRoundedRect(buttonx - btnWidth / 2, buttony - btnHeight / 2, btnWidth, btnHeight, btnHeight / 10);

  //   g.interactive = true;
  //   g.hitArea = new PIXI.Rectangle(buttonx - btnWidth / 2, buttony - btnHeight / 2, btnWidth, btnHeight);
  //   g.on('pointerdown', () => {
  //     // gameSetup.networkHandler.sendCommandOrder("S");
  //     // really exit
  //     gameSetup.exitGame();
  //   });
  //   gameSetup.exitStage.addChild(g);

  //   g = new PIXI.Graphics();
  //   g.beginFill(0x132fef, 1);
  //   g.drawRoundedRect((w - buttonx) - btnWidth / 2, buttony - btnHeight / 2, btnWidth, btnHeight, btnHeight / 10);
  //   g.endFill();
  //   gameSetup.exitStage.addChild(g);



  //   // text

  //   const style = new PIXI.TextStyle({
  //     fontFamily:  "\"Droid Sans\", sans-serif",
  //     fontSize: 20,
  //     fontStyle: 'italic',
  //     fontWeight: 'bold',
  //     fill: ['#ffffff', '#00ff99'], // gradient
  //     stroke: '#4a1850',
  //     strokeThickness: 2,
  //     dropShadow: false,
  //     dropShadowColor: '#000000',
  //     dropShadowBlur: 2,
  //     dropShadowAngle: Math.PI / 6,
  //     dropShadowDistance: 2,
  //     wordWrap: true,
  //     wordWrapWidth: 440
  //   });

  //   const richText = new PIXI.Text(`Exit Game`, style);
  //   richText.x = buttonx;
  //   richText.y = buttony;
  //   richText.anchor.set(0.5, 0.5);
  //   gameSetup.exitStage.addChild(richText);

  //   const richText2 = new PIXI.Text(`Cancel`, style);
  //   richText2.x = w - buttonx;
  //   richText2.y = buttony;
  //   richText2.anchor.set(0.5, 0.5);
  //   gameSetup.exitStage.addChild(richText2);
  // };

  this.initGraphics = function () {
    const cfg = gameSetup.config;

    container = document.getElementById('gameDiv');
    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }
    container.setAttribute("style", `position:relative;background-color:#011a42;width:${w}px;height:${h}px`);



    // window.addEventListener('resize', this.onWindowResize, false);
  };

  this.initPhysics = function () {

  };

  this.showGameOver = (cmd) => {
    gameSetup.gameOver = true;
    const p = cmd.w.split(':');

    const msg = p[0] == 't' ? `The winner is ${p[1]} team` : `The winner is ${p[1]}`;
    let teamWon;
    if (p[0] == 't') {
      teamWon = p[1] === 'Blue' ? 0 : 1;
    } else {
      teamWon = (gameSetup.playerInfo.find(pi => pi.playerID === p[1]) || {}).teamID;
      if (typeof(teamWon) == "undefined") {
        teamWon = (gameSetup.playerInfo.find(pi => pi.username === p[1]) || {}).teamID;
      }
    }
    console.log('teamWon ', teamWon)
    gameSetup.teamWon = teamWon;
    gameSetup.showModalMessage('Game Over', msg, MODAL_EXITGAME);
    gameSetup.sounds.backgroundmusic.stop();
  };



  this.onWindowResize = function () {
    renderer.setSize(window.innerWidth * 0.99, window.innerHeight * 0.99);
  };

  this.setupCenterMessage = () => {
    const config = gameSetup.config;

    // add tishi
    const tishi = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/tishi.png"].texture);

    let tishiratio = (config.mazeW * 1.0) / 1000;
    tishi.scale.set(tishiratio, tishiratio * 1.4); // will overflow on bottom

    tishi.position.x = config.mazeCenterX;
    tishi.position.y = config.mazeCenterY;
    tishi.anchor.set(0.5, 0.5);
    tishi.interactive = false;
    tishi.visible = false;
    tishi.alpha = 0.9;
    tishi.zOrder = 105;
    gameSetup.stage.addChild(tishi);
    gameSetup.tishi = tishi;


    // add goldIcon
    const goldIcon = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/jinbi.png"].texture);

    let goldIconratio = (config.mazeW * 0.06) / 50;
    goldIcon.scale.set(goldIconratio, goldIconratio); // will overflow on bottom

    goldIcon.position.x = config.mazeCenterX - config.mazeW * 0.03;
    goldIcon.position.y = config.mazeCenterY + config.mazeH * 0.1;
    goldIcon.anchor.set(0.5, 0.5);
    goldIcon.interactive = false;
    goldIcon.visible = false;
    goldIcon.alpha = 0.9;
    goldIcon.zOrder = 104;
    gameSetup.stage.addChild(goldIcon);
    gameSetup.goldIcon = goldIcon;


    // message text
    let size = Math.floor(3.5 * config.scalingratio);
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   size *= 1.25;
    // }
    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: true,
      align: 'center',
      wordWrapWidth: config.mazeW * 0.7
    });

    const t = new PIXI.Text('no message', style);
    t.position.x = config.mazeCenterX;
    t.position.y = config.mazeCenterY - config.mazeH * 0.05;
    t.anchor.set(0.5, 0.5);
    t.visible = false;
    t.zOrder = 102;
    t.alpha = 0.9;
    gameSetup.stage.addChild(t);


    // gold message
    size = Math.floor(4 * config.scalingratio);
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   size *= 1.25;
    // }
    const style2 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffff00'],
      stroke: '#ffff00',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: true,
      wordWrapWidth: config.mazeW * 0.7
    });

    const goldText = new PIXI.Text('no message', style2);
    goldText.position.x = config.mazeCenterX + config.mazeW * 0.05;
    goldText.position.y = config.mazeCenterY + config.mazeH * 0.1;
    goldText.anchor.set(0.5, 0.5);
    goldText.visible = false;
    goldText.zOrder = 101;
    goldText.alpha = 0.9;
    goldText.coinCount = 0;
    gameSetup.stage.addChild(goldText);









    gameSetup.config.hideHeadline = () => {
      //t.visible = false;

      // console.log("hide headline!");
      goldText.isShowing = false;

      const obj = { alpha: t.alpha };
      const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
        .to({ alpha: 0 }, 800) // if strength is 1000, then 1 second
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
          if (goldText.isShowing) return;
          t.alpha = obj.alpha;
          tishi.alpha = obj.alpha;
          if (goldText && goldText.transform && goldText.coinCount > 0)
            goldIcon.alpha = obj.alpha;
          goldText.alpha = obj.alpha;
        })
        .onComplete(() => {
          goldText.coinCount = 0;
        });
      tween.start();

      // if (goldText && goldText.transform && goldText.coinCount > 0) {
      //   const obj2 = { x: goldText.position.x, y: goldText.position.y, alpha: goldText.alpha };
      //   const pi = gameSetup.activePlayerInfo;
      //   const tween2 = new TWEEN.Tween(obj2) // Create a new tween that modifies 'coords'.
      //     .to({ alpha: 0, x: pi.goldCoinText.position.x, y: pi.goldCoinText.position.y }, 800) // if strength is 1000, then 1 second
      //     .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      //     .onUpdate(() => { // Called after tween.js updates 'coords'.
      //       if (goldText.isShowing) return;
      //       goldText.alpha = obj2.alpha;
      //       goldText.position.x = obj2.x;
      //       goldText.position.y = obj2.y;
      //     })
      //     .onComplete(() => {
      //       // pi.addCoins(goldText.coinCount);
      //       goldText.coinCount = 0;
      //     });
      //   tween2.start();
      // }
    };


    gameSetup.oldHeadline = '';
    gameSetup.config.showHeadline = (msg, timeout, goldCoins) => {
      // if (!t) {
      //   debugger;
      // }
      // only give extra gold in online games! not even in battle!

      // winning sound for test
      if (msg.toLowerCase().includes("exercise completed")) {
        gameSetup.sounds.victory.play();
      } else if (msg.toLowerCase().includes("test passed")) {
        gameSetup.sounds.victory.play();
      } else if (msg.toLowerCase().includes("no challenge specified")) {

      } else if (msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")) {
        gameSetup.sounds.failure.play();
      } else {

      }


      goldText.isShowing = true;
      if (gameSetup.gameType !== GAME_TYPE.MATCH ) {
        goldCoins = 0;
      }
      t.text = msg;
      t.visible = true;
      t.alpha = 0.9;
      t.scale.x = 0.1;
      t.scale.y = 0.1;

      tishi.visible = true;
      tishi.alpha = 0.9;
      tishi.scale.x = 0.1;
      tishi.scale.y = 0.1;

      if (goldCoins > 0 ) {
        goldText.position.x = config.mazeCenterX + config.mazeW * 0.05;
        goldText.position.y = config.mazeCenterY + config.mazeH * 0.1;
        goldText.text = "+ " + goldCoins;
        goldText.alpha = 0.9;
        goldIcon.alpha = 0.9;
        goldText.visible = true;
        goldText.scale.x = 0.1;
        goldText.scale.y = 0.1;
        goldIcon.visible = true;
        goldIcon.scale.x = 0.1 * goldIconratio;
        goldIcon.scale.y = 0.1 * goldIconratio;
        goldText.coinCount = goldCoins;
        gameSetup.activePlayerInfo.addCoins(goldText.coinCount);
      } else {
        goldText.visible = false;
        goldIcon.visible = false;
        goldText.coinCount = 0;
      }


      const obj = { s: 0.1 };
      const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
        .to({ s: 1 }, 500) // if strength is 1000, then 1 second
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
          if (!t || !t.transform) {
            return;
          }
          t.scale.x = obj.s;
          t.scale.y = obj.s;
          tishi.scale.x = obj.s * tishiratio;
          tishi.scale.y = obj.s * tishiratio * 1.5;
          if (goldCoins > 0) {
            goldIcon.scale.x = obj.s * goldIconratio;
            goldIcon.scale.y = obj.s * goldIconratio;
            goldText.scale.x = obj.s;
            goldText.scale.y = obj.s;
          }
        });
      tween.start();

      gameSetup.oldHeadline = msg;

      let timeoutseconds = 1.5;
      if (typeof(timeout) != "undefined") {
        timeoutseconds = timeout;
      }
      // console.log("show heddline " + msg + " " + timeoutseconds);

      if (gameSetup.hideHeadlineTimer) {
        clearTimeout(gameSetup.hideHeadlineTimer);
      }
      gameSetup.hideHeadlineTimer = setTimeout(gameSetup.config.hideHeadline, timeoutseconds * 1000);

    };

  };

  this.setupMessage = () => {
    gameSetup.setupTbotMessage = () => {
      const config = gameSetup.config;

      // background
      const g = new PIXI.Sprite(PIXI.loader.resources["/images/tbotmessagebackground.png"].texture);

      let ratio = (config.TrueWidth * 0.88) / 800;
      g.scale.set(ratio, ratio); // will overflow on bottom

      g.position.x = config.TrueWidth / 2;
      g.position.y = config.TrueHeight * 0.85;
      g.anchor.set(0.5, 0.5);
      g.interactive = false;
      g.visible = false;
      g.alpha = 0.5;
      g.zOrder = 200;
      gameSetup.mazeContainer.addChild(g);

      // message text
      let size = Math.floor(2 * 14);
      if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
        size *= 1.25;
      }
      const style = new PIXI.TextStyle({
        fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: size,
        fontStyle: '',
        fontWeight: '',
        fill: ['#ffffff', '#ff8738'],
        stroke: '#4a1850',
        strokeThickness: 2,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 2,
        wordWrap: true,
        wordWrapWidth: config.TrueWidth * 0.7
      });

      const t = new PIXI.Text('no message', style);
      t.position.x = config.TrueWidth * 0.55;
      t.position.y = g.position.y;
      t.anchor.set(0.5, 0.5);
      t.visible = false;
      t.zOrder = 102;
      gameSetup.mazeContainer.addChild(t);

      gameSetup.config.hideMessage = () => {
        if (!g.visible) return;
        // debugger;
        g.visible = false;
        g.interactive = false;
        t.visible = false;
        // if (gameSetup.tweenyellowarrow) {
        //   gameSetup.tweenyellowarrow.stop();
        //   yellowarrow.visible = false;
        // }
      };
      g.on('pointerdown', () => {
        gameSetup.config.hideMessage();
        // if (gameSetup.tweenyellowarrow) {
        //   gameSetup.tweenyellowarrow.visible = false;
        //   gameSetup.tweenyellowarrow.stop();
        //   delete gameSetup.tweenyellowarrow;
        // }
      });

      gameSetup.oldMessage = '';
      gameSetup.config.showMessage = (msg, timeout, x, y) => {
        t.text = msg;
        g.visible = true;
        g.interactive = true;
        t.visible = true;
        gameSetup.oldMessage = msg;
        // yellowarrow.visible = false;

        let timeoutseconds = 8;
        if (typeof(timeout) != "undefined") {
          timeoutseconds = timeout;
        }
        if (msg.indexOf("has won the game") > 0) {
          timeoutseconds = 10000;
        }
        if (gameSetup.hideMessageTimer) {
          clearTimeout(gameSetup.hideMessageTimer);
        }
        gameSetup.hideMessageTimer = setTimeout(gameSetup.config.hideMessage, timeoutseconds * 1000);
      };

    };
  }

  this.setup = function () {
    const cfg = gameSetup.config;
    this.gameSetup = gameSetup;
    gameSetup.gameEngine = this;
    gameSetup.tankControllers = [];
    gameSetup.tanks = [];
    gameSetup.crystals = [];
    gameSetup.weapons = [];
    gameSetup.tilesRemoved = "";
    gameSetup.tilesAdded = "";

    // Bert.defaults = {
    //   hideDelay: 20000
    // };
    if (gameSetup.isLocal) {
      gameSetup.networkHandler = new NetworkHandler(this, true);
    } else {
      // gameSetup.networkHandler = new NetworkHandler(this, false);
    }
    // gameSetup.shotcontroller = new ShotController(gameSetup, isHost, this);

    this.setupMessage();

    gameSetup.processWTCData = function (data, peerObj) {
      // console.log("in gameSetup.processWTCData");
      if (gameSetup.networkHandler)
        gameSetup.networkHandler.handleWTCData(data, peerObj);
      else {
        // console.log("no network handler yet! " + data);
      }
    };

    gameSetup.cleanUpKeyHandlers = function() {

      window.onkeydown = null;
      window.onkeyup = null;

      document.onkeydown = null;
      document.onkeyup = null;

      if (gameSetup.downlisteners) {
        for (let j=0; j<gameSetup.downlisteners.length; j++) {
          const h = gameSetup.downlisteners[j];
          window.removeEventListener("keydown", h);
        }
        gameSetup.downlisteners = [];
      }
      if (gameSetup.uplisteners) {
        for (let j=0; j<gameSetup.uplisteners.length; j++) {
          const h = gameSetup.uplisteners[j];
          window.removeEventListener("keyup", h);
        }
        gameSetup.uplisteners = [];
      }

      if (document.addEventListener) {
        document.removeEventListener('webkitfullscreenchange', gameSetup.fullScreenHandler);
        document.removeEventListener('mozfullscreenchange', gameSetup.fullScreenHandler);
        document.removeEventListener('fullscreenchange', gameSetup.fullScreenHandler);
        document.removeEventListener('MSFullscreenChange', gameSetup.fullScreenHandler);

        document.removeEventListener("mousewheel", gameSetup.mouseWheelHandler);

        document.removeEventListener('keydown', gameSetup.OneOnKeyDown);
      }

    };

    gameSetup.gameOver = false;
    gameSetup.handleExitGame = () => {
      gameSetup.sounds.backgroundmusic.stop();
      gameSetup.gameOver = true;
      gameSetup.renderer.plugins.interaction.destroy();
      // if (gameSetup.renderer.plugins.accessibility && gameSetup.renderer.plugins.accessibility.children)
      //   gameSetup.renderer.plugins.accessibility.destroy();

      gameSetup.cleanUpKeyHandlers();
      switch (gameSetup.room.gameType) {
        case 1:
          gameSetup.reacthistory.push("/gamesRoomEntry");
          break;
        case 2:
          const link = gameSetup.config.localPlayerID === gameSetup.room.owner ? '/gamesRoomNetwork/' : `/gamesRoomNetwork/${gameSetup.room.gameRoomId}`;
          gameSetup.reacthistory.push(link);
          // gameSetup.reacthistory.push('/gamesBoard', { notiId: gameSetup.room.notiId });
          break;
        case GAME_TYPE.BATTLE:
          gameSetup.reacthistory.push('/leaderboard');
          break;

        case 4:
          if (gameSetup.pairData && gameSetup.pairData.sectionId) {
            gameSetup.reacthistory.push(`/section-info/${gameSetup.room.gameId}/${gameSetup.pairData.sectionId}`);
          }
          // if (false && gameSetup.activePlayerInfo && gameSetup.pairData) {
          //   const params = {
          //     modalIsOpen: true,
          //     sectionKey: gameSetup.pairData.sectionId,
          //     tournamentId: gameSetup.pairData.tournamentId
          //   };
          //   TankActions.finishTournamentSectionRound(
          //     gameSetup.pairData.roundId,
          //     gameSetup.activePlayerInfo.playerUserId,
          //     gameSetup.pairData.id,
          //     PLAYER_TYPE.WINNER
          //   );
          //   gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
          // }
          break;

      }
    }
    gameSetup.exitGame = () => {
      console.log("in gameSetup.exitGame");
      const gameState = gameSetup.isHost ? {
        secondsLeft: gameSetup.secondsLeft
      } : null;
      TankActions.leavingGame(gameSetup.room._id,
        gameSetup.localPlayerID,
        gameSetup.failedToReconnect || gameSetup.inQuit || false,
        gameState,
        gameSetup.teamWon,
        (err, result) => {
          if (gameSetup.handleExitGame) {
            gameSetup.handleExitGame();
          }
        });
    };

    // try to reconnect p2p connection
    // warning: selectedPeer must be existed
    gameSetup.enterReconnect = (selectedPeer) => {
      // first, halt all rfa ticks
      console.log("- - - - - set inReconnect true -- - --  " + Date.now());
      gameSetup.inReconnect = true;
      gameSetup.reconnectTime = Date.now();
      if (selectedPeer.peer) {
        selectedPeer.peer.destroy();
      }
      const peerIndex = gameSetup.peers.findIndex(p => p.peerName === selectedPeer.peerName);
      if (peerIndex !== -1) {
        gameSetup.peers.splice(peerIndex, 1);
      }

      if (selectedPeer.asHost) {
        const { asHost, offer: offerName, answer: answerName } = selectedPeer;
        Meteor.call('resetDisconnectedPeerInfo', gameSetup.room._id, asHost, offerName, answerName);
      }

      selectedPeer.ready = false;
    };

    gameSetup.quitGameForConnectivityIssue = () => {
      console.log('quitGameForConnectivityIssue');
      if (gameSetup.inQuit) {
        console.log("already in quit so return");
        return;
      }

      gameSetup.inQuit = true;
      // gameSetup.networkHandler.sendCommandToAll({ c: "QuitGameRoomWithIssue", t: gameSetup.currentCycleTime, w: `Sorry! Network connection with your opponent has been interrupted.` });

      // gameSetup.sounds.backgroundmusic.stop();
      if (!gameSetup.gameOver && gameSetup.showModalMessage) {
        gameSetup.showModalMessage(`Game Terminated`, `Network connection with your opponent has been lost.`, MODAL_NOBUTTON);
      }
      let waitS = 5000;

      setTimeout(() => {
        if (gameSetup.exitBtnHandler) {
          gameSetup.exitBtnHandler();
        } else {
          gameSetup.exitGame(); // when maze didn't render
        }
      }, waitS);
    };


    PIXI.Graphics.prototype.destroy = function destroy(options) {
      // destroy each of the GraphicsData objects

      if (this.graphicsData) {
        for (let i = 0; i < this.graphicsData.length; ++i) {
          this.graphicsData[i].destroy();
        }
      }

      for (const id in this._webgl) {
          for (let j = 0; j < this._webgl[id].data.length; ++j) {
              this._webgl[id].data[j].destroy();
          }
      }

      if (this._spriteRect) {
          this._spriteRect.destroy();
      }

      this.graphicsData = null;

      this.currentPath = null;
      this._webgl = null;
      this._localBounds = null;
    };


    PIXI.WebGLRenderer.prototype.destroy = function destroy(removeView) {
      this.destroyPlugins();

      // remove listeners
      if (this.view) {
        this.view.removeEventListener('webglcontextlost', this.handleContextLost);
        this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);
      }

      if (this.textureManager && this.textureManager.destroy) this.textureManager.destroy();

      // call base destroy
      // PIXI._SystemRenderer.prototype.destroy.call(this, removeView);

      this.uid = 0;

      // destroy the managers
      if (this.maskManager) this.maskManager.destroy();
      // if (this.stencilManager) this.stencilManager.destroy();
      if (this.filterManager) this.filterManager.destroy();

      this.maskManager = null;
      this.filterManager = null;
      this.textureManager = null;
      this.currentRenderer = null;

      this.handleContextLost = null;
      this.handleContextRestored = null;

      this._contextOptions = null;
      if (this.gl) {
        this.gl.useProgram(null);
        if (this.gl.getExtension('WEBGL_lose_context')) {
          this.gl.getExtension('WEBGL_lose_context').loseContext();
        }
        this.gl = null;
      }


      // this = null;
    };

    PIXI.DisplayObject.prototype.clean = function(remove) {
      // debugger;
      const rmv = remove || false;
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].clean(true);
      }
      this.removeChildren();
      if (this && rmv)    {
        if (this.parent) this.parent.removeChild(this);
        if (this instanceof PIXI.Text) {
          if (this._texture) {
            this._texture.destroy(true);
          }
          this.destroy({ children:false, texture:false, baseTexture:false });
        }
        // else if (this instanceof PIXI.TilingSprite && this.tilingTexture)
        //   this.tilingTexture.destroy(true);
        else if (typeof this.destroy == 'function')
          this.destroy(false);
      }
    };

    PIXI.Container.prototype.destroy = function destroy(options) {                                                          // 545
      // _DisplayObject.prototype.destroy.call(this);                                                                   // 546
                                                                                                                     // 547
      // var destroyChildren = typeof options === 'boolean' ? options : options && options.children;                    // 548
      //                                                                                                                // 549
      // var oldChildren = this.removeChildren(0, this.children.length);                                                // 550
      //                                                                                                                // 551
      // if (destroyChildren) {                                                                                         // 552
      //     for (var i = 0; i < oldChildren.length; ++i) {                                                             // 553
      //         oldChildren[i].destroy(options);                                                                       // 554
      //     }                                                                                                          // 555
      // }                                                                                                              // 556
    };                                                                                                                 // 557

    PIXI.Sprite.prototype.destroy = function destroy(options) {                                                             // 437
      // _Container.prototype.destroy.call(this, options);                                                              // 438
                                                                                                                     // 439
      this._anchor = null;                                                                                           // 440
                                                                                                                     // 441
      const destroyTexture = typeof options === 'boolean' ? options : options && options.texture;                      // 442
                                                                                                                     // 443
      if (destroyTexture) {                                                                                          // 444
        const destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;          // 445
        if (this._texture) this._texture.destroy(!!destroyBaseTexture);                                                               // 447
      }                                                                                                              // 448
      this._texture = null;                                                                                          // 450
      this.shader = null;                                                                                            // 451
    };

    gameSetup.cleanContainer = (c) => {
      if (!c) return;
      for (let x=c.children.length-1; x>=0; x--) {
        const obj = c.children[x];
        if (obj.parent) obj.parent.removeChild(obj);
        // console.log("obj type " + typeof(obj.destroy));
        if (obj._activeVao) {
          obj._activeVao.destroy();
          delete obj._activeVao;
        }
        if (typeof(obj.destroy) == 'function')
          obj.destroy(true);
        if (typeof(obj.clean) == 'function' && typeof(PIXI) != "undefined")
          obj.clean(true);
        gameSetup.deepClean(obj);
      }
      c.destroy({ children:true, texture:true, baseTexture:true });
    };

    gameSetup.cleanRenderer = (r) => {
      if (!r) return;
      // if (r._events) {
      //   for (let k=0; k<r._events.context.length; k++) {
      //     if (r._events.context[k].context) {
      //       const c = r._events.context[k].context;
      //       Object.keys(c).forEach((kk) => {
      //         if (c[kk] && c[kk].destroy) {
      //           try {
      //             c[kk].destroy(true);
      //           } catch (err) {}
      //         }
      //       });
      //     }
      //   }
      //   r._events.context.length = 0;
      // }
      if (r._activeShader) {
        delete r._activeShader.uniformData;
        delete r._activeShader.uniforms;
        r._activeShader.destroy();
      }
      if (r.rootRenderTarget) {
        if (r.rootRenderTarget.projectionMatrix) {
          r.rootRenderTarget.projectionMatrix = null;
          delete r.rootRenderTarget.projectionMatrix;
        }
        r.rootRenderTarget.destroy(true);
      }
      r.destroy(true);
      gameSetup.deepClean(r);
    };

    gameSetup.deepClean = (obj) => {
      if (obj instanceof Object) {
        Object.keys(obj).forEach((k) => {
          if (obj[k] && obj[k].removeAllListeners)
            obj[k].removeAllListeners();
          if (obj[k] && obj[k].destroy) {
            if (typeof obj.destroy == 'function')
              obj.destroy(true);
          }
          delete obj[k];
        });
      }
    };


    gameSetup.cleanUpAll = () => {

      if (gameSetup.connectionTimer)
        clearTimeout(gameSetup.connectionTimer);
      if (gameSetup.tryReconnectTimer)
        clearTimeout(gameSetup.tryReconnectTimer);
      gameSetup.inCleanUp = true;
      cancelAnimationFrame(gameSetup.tickHandle);
      clearInterval(gameSetup.timerID);


      delete window.UserSetupCode;
      delete gameSetup.testSetupCode;
      delete gameSetup.scenario;

      gameSetup.cleanUpKeyHandlers();

      window.onkeydown = null;
      window.onkeyup = null;

      if (typeof(PIXI) != "undefined") {
        Object.keys(PIXI.utils.TextureCache).forEach((texture) => {
          // console.log("clean up texture " + texture);
          if (PIXI.utils.TextureCache[texture] && PIXI.utils.TextureCache[texture].destroy)
            PIXI.utils.TextureCache[texture].destroy(true);
        });
        Object.keys(PIXI.utils.BaseTextureCache).forEach((texture) => {
          if (PIXI.utils.TextureCache[texture].destroy)
            PIXI.utils.TextureCache[texture].destroy(true);
        });
        Object.keys(PIXI.loader.resources).forEach((s) => {
          // delete PIXI.loader.resources[s].data;
          delete PIXI.loader.resources[s];
        });
      }


      gameSetup.tanks = [];
      gameSetup.tankControllers = [];
      gameSetup.crystals = [];

      gameSetup.controller.killAIPlayers();

      if (gameSetup.networkHandler) delete gameSetup.networkHandler;
      // if (gameSetup.shotcontroller) delete gameSetup.shotcontroller;

      gameSetup.cleanContainer(gameSetup.stage);
      // gameSetup.cleanContainer(gameSetup.tablecontainer);
      // gameSetup.cleanContainer(gameSetup.ballcontainer);
      // gameSetup.cleanContainer(gameSetup.overlaycontainer);
      // gameSetup.cleanContainer(gameSetup.overlaycontainer2);

      gameSetup.cleanRenderer(gameSetup.renderer);
      // gameSetup.cleanRenderer(tablerenderer);
      // gameSetup.cleanRenderer(ballrenderer);
      // gameSetup.cleanRenderer(overlayrenderer);
      // gameSetup.cleanRenderer(overlayrenderer2);

      gameSetup.unloadSounds();
      for (let i = 0; i < gameSetup.numberOfPlayers; i++) {
        gameSetup.deepClean(gameSetup.playerInfo[i]);
      }
      gameSetup.deepClean(gameSetup.config);
    };


    gameSetup.OneOnKeyDown = (e) => {
      if (e.keyCode == 27) { // escape key
        // debugger;
        // console.log("key down esc");
        if (gameSetup.hideOverlay)
          gameSetup.hideOverlay();
        return false;
      }
    };

    document.addEventListener('keydown', gameSetup.OneOnKeyDown);



    // screen size manager

    gameSetup.fullScreenHandler = () => {
      let w = window.innerWidth;
      let h = window.innerHeight - vcushion;
      if (gameSetup.gameType == GAME_TYPE.TESTING) {
        const shell = document.getElementById('gameDivShellModal');
        w = shell.clientWidth * 1;
        h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
      }

      if (!controlrenderer) return;

      const gameDiv = document.getElementById('gameDiv');
      console.log("setting gamediv width / height to " + w + " " + h);
      gameDiv.style.width = `${w}px`;
      gameDiv.style.height = `${h}px`;


      controlrenderer.view.width = w;
      controlrenderer.view.height = h;
      controlrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);

      gameSetup.controlcontainer.position.set(0, 120);
      gameSetup.controlcontainer.scale.x = w / (cfg.TrueWidth);
      gameSetup.controlcontainer.scale.y = h / (cfg.TrueHeight);
      // gameSetup.controlcontainer.pivot.set(gameSetup.config.TrueWidth/2, gameSetup.config.TrueHeight/2);

      // tablerenderer.view.style.display = `none`;
      // return;


      overlayrenderer.view.width = w;
      overlayrenderer.view.height = h;
      overlayrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      gameSetup.overlaycontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
      gameSetup.hideOverlay();

      overlayrenderer2.view.width = w;
      overlayrenderer2.view.height = h;
      overlayrenderer2.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      gameSetup.overlaycontainer2.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer2.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
      gameSetup.hideOverlay2();


      // tank and table container at smaller and aligned bottom left

      const wratio = (cfg.mazeW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.mazeH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;



      ballrenderer.view.width = w;
      ballrenderer.view.height = h;
      ballrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      if (gameSetup.gameType == GAME_TYPE.TESTING) {
        // only show table
        // cfg.tableTop = 0;
        gameSetup.stage.scale.x = w / (cfg.mazeW + 2 * cfg.metalBorderThick);
        gameSetup.stage.scale.y = h / (cfg.mazeH + 2 * cfg.metalBorderThick);
      } else {
        // same scaling as all
        gameSetup.stage.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
        gameSetup.stage.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
      }



      tablerenderer.view.width = w;
      tablerenderer.view.height = h;
      tablerenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      gameSetup.tablecontainer.scale.x = gameSetup.stage.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.tablecontainer.scale.y = gameSetup.stage.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);


        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null) {
          // is full screen
        } else {
          // not full screen
        }
    };

    if (document.addEventListener) {
      document.addEventListener('webkitfullscreenchange', gameSetup.fullScreenHandler, false);
      document.addEventListener('mozfullscreenchange', gameSetup.fullScreenHandler, false);
      document.addEventListener('fullscreenchange', gameSetup.fullScreenHandler, false);
      document.addEventListener('MSFullscreenChange', gameSetup.fullScreenHandler, false);
    }
  };

  this.loadSounds = function () {
    gameSetup.sounds = {};
    // gameSetup.sounds.breakshot = new Howl({ src: ['/sounds/breakshot.wav'] });
    gameSetup.sounds.cueballhit = new Howl({ src: ['/sounds/cueballhit.wav'] });
    gameSetup.sounds.victory = new Howl({ src: ['/sounds/Victory.mp3'], volume: 0.5 });
    gameSetup.sounds.failure = new Howl({ src: ['/sounds/failure.mp3'], volume: 0.4 });
    // gameSetup.sounds.itemcollected = new Howl({ src: ['/sounds/ItemCollected.mp3'], volume: 0.6 });

    //gameSetup.sounds.backgroundmusic = new Howl({ src: ['/sounds/happymusicsmall.mp3'], loop: true, volume: 0.5 });
    gameSetup.sounds.backgroundmusic = new Howl({ src: ['/sounds/WaroftheTitans.mp3'], loop: true, volume: 0.5 });
    if (gameSetup.gameType!=GAME_TYPE.TESTING)
      gameSetup.sounds.backgroundmusic.play();

  };

  gameSetup.unloadSounds = () => {
    Object.keys(gameSetup.sounds).forEach((s) => {
      gameSetup.sounds[s].unload();
    });
    delete gameSetup.sounds;
  };



  // this.drawBackground = function() {
  //     const graphics = new PIXI.Graphics();
  //     graphics.beginFill(0x2f7a3a);
  //     // set the line style to have a width of 5 and set the color to red
  //     graphics.lineStyle(0);
  //     // draw a rectangle
  //     graphics.drawRect(0, 0, gameSetup.config.TrueWidth, gameSetup.config.TrueHeight);
  //     graphics.zOrder = 1000;
  //     stage.addChild(graphics);
  // };


  // this.showExitScreen = function() {
  //     console.log("gameSetup over!!!!!!!!!!!!!!");
  // };


  // this.resize = function() {
  //     const container = document.getElementById('gameDiv').getBoundingClientRect();
  //     const h = container.height-5;
  //     const w = container.width;

  //     // renderer.resize(w,h);
  //     // const cfg = gameSetup.config;
  //     // stage.scale.x = w / cfg.TrueWidth;
  //     // stage.scale.y = h / cfg.TrueHeight;
  // };


  gameSetup.sendMessageToTeam = (message) => {
    if (message.senderID < 0) return;
    const temp = gameSetup.tanks.filter(t => t.tankID === message.senderID && t.position.x >= 0);
    if (temp.length === 0) return;
    const sender = temp[0];
    const members = gameSetup.tanks.filter(t => t.color === sender.color && t.position.x >= 0);
    gameSetup.controller.updateWorld();

    for (let i = 0; i < members.length; i += 1) {
      const m = members[i];
      const pi = gameSetup.playerInfo[m.tankID];
      pi.isLocal = gameSetup.config.localPlayerID === pi.userId || gameSetup.config.localPlayerID === pi.playerCodeOwner;
      if (pi.playerType !== "AI") continue;
      if (!pi.isLocal && !pi.localInput) continue;
      pi.playerWorker.sendMessage({
        cmd: CMD_RECEIVE_TEAM_MESSAGE,
        world: WorldForPlayer,
        message
      });
    }
  }


  this.createOverlayScreen = () => {
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // shouldn't be here!
      // return;
    }

    // bottom render for top and right controls
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "OverlayDiv");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      w = gameDiv.clientWidth;
      h = gameDiv.clientHeight;
    }

    overlayrenderer = PIXI.autoDetectRenderer(w, h, { transparent: true, antialias: true });
    tableDiv.appendChild(overlayrenderer.view);
    overlayrenderer.view.setAttribute("id", "OverlayCanvas");
    overlayrenderer.plugins.interaction.autoPreventDefault = true;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    overlayrenderer.view.setAttribute("style", `position:absolute;top:${0}px;left:${0}px;width:${w}px;height:${h}px`);

    // still scale it so we always show messages at proportional position
    gameSetup.overlaycontainer = new PIXI.Container();

    let mw = cfg.TrueWidth;
    let mh = cfg.TrueHeight;

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // only show table
      // cfg.tableTop = 0;
      gameSetup.overlaycontainer.scale.x = w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer.scale.y = h / (cfg.mazeH + 2 * cfg.metalBorderThick);
      mw = cfg.mazeW + 2 * cfg.metalBorderThick;
      mh = cfg.mazeH + 2 * cfg.metalBorderThick;
    } else {
      // same scaling as all
      gameSetup.overlaycontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
    }




    // overall transparent modal screen
    let g = new PIXI.Graphics();

    g.lineStyle(0, 0x000000, 1);
    g.beginFill(0x000000, 0.6);
    g.drawRect(0, 0, mw, mh);
    g.endFill();


    // message box background
    g.lineStyle(5, 0x132fef, 1);
    g.beginFill(0xd9e8f9, 1); //0xcdd2d8  d9e8f9
    const msgBoxy = mh * 0.4;
    const msgBoxWidth = mw * 0.6;
    const msgBoxHeight = mh * 0.3;
    g.drawRoundedRect(mw/2 - msgBoxWidth/2, msgBoxy - msgBoxHeight/2, msgBoxWidth, msgBoxHeight, msgBoxHeight/10);
    g.endFill();

    gameSetup.overlaycontainer.addChild(g);


    // message text
    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 25,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#133059'],
      stroke: '#133059',
      strokeThickness: 0,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 1,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: true,
      wordWrapWidth: mw * 0.45
    });

    const overlayText = new PIXI.Text(``, style);
    overlayText.x = mw * 0.5;
    overlayText.y = mh * 0.4;
    overlayText.anchor.set(0.5, 0.5);
    gameSetup.overlaycontainer.addChild(overlayText);



    gameSetup.hideOverlay = () => {
      // const s = document.getElementById('TestResultScreenCanvas');
      // if (gameSetup.overlayHandle) {
      //   clearTimeout(gameSetup.overlayHandle);
      // }
      overlayrenderer.view.style.zIndex = -100;
    };
    gameSetup.hideOverlay();

    gameSetup.showOverlay = (msg, autoClose, noClose) => {
        // const s = document.getElementById('TestResultScreenCanvas');
        overlayrenderer.view.style.zIndex = 400;
        overlayText.text = msg;
        if (gameSetup.overlayHandle) {
          clearTimeout(gameSetup.overlayHandle);
        }
        if (autoClose) {
          gameSetup.overlayHandle = setTimeout(() => {
            if (overlayrenderer.view.style.zIndex >= 0)
              gameSetup.hideOverlay();
          }, 5000);
        } else {
          if (noClose) {
            // hide the OK button
            // gameSetup.overlayOKText.text = "Please Wait";
            gameSetup.overlayOKText.visible = false;
            gameSetup.overlayOKButton.visible = false;
            gameSetup.overlayG.interactive = false;
            if (gameSetup.autoBtn) gameSetup.autoBtn.buttonMode = false;
            gameSetup.stage.interactive = false;
            gameSetup.stage.buttonMode = false;
            if (gameSetup.controlcontainer) gameSetup.controlcontainer.interactive = false;
            gameSetup.overlayG.buttonMode = false;
          } else {
            // gameSetup.overlayOKText.text = "Dismiss";
            gameSetup.overlayOKText.visible = true;
            gameSetup.overlayOKButton.visible = true;
            gameSetup.overlayG.interactive = true;
            if (gameSetup.autoBtn) gameSetup.autoBtn.buttonMode = true;
            if (gameSetup.gameType != GAME_TYPE.TESTING) {
              gameSetup.stage.interactive = true;
              gameSetup.stage.buttonMode = true;
              if (gameSetup.controlcontainer) gameSetup.controlcontainer.interactive = true;
              gameSetup.overlayG.buttonMode = true;
            }
          }
        }
    };

    // gameSetup.oldMessage = '';
    // gameSetup.config.showMessage = (msg) => {
    //   // gameSetup.showOverlay(msg, true);
    //   Bert.alert({
    //     title: msg,
    //     message: '',
    //     type: 'info',
    //     style: 'growl-bottom-left',
    //     icon: 'fa-info'
    //   });

    //   gameSetup.oldMessage = msg;
    // };

    // gameSetup.config.showMessageOld = (msg) => {
    //   gameSetup.showOverlay(msg, true);
    //   gameSetup.oldMessage = msg;
    // };


    // gameSetup.showPrevMessage = (msg) => {
    //   gameSetup.showOverlay(gameSetup.oldMessage, false);
    // };


    // add ok button
    const buttony = mh * 0.49;
    const buttonx = mw * 0.74;
    const btnWidth = mw * 0.08;
    const btnHeight = mh * 0.05;
    g = new PIXI.Graphics();
    g.lineStyle(5, 0x687af2, 1);
    g.beginFill(0x132fef, 1); // 132fef
    g.drawRoundedRect(buttonx - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight, btnHeight/10);

    gameSetup.overlaycontainer.addChild(g);

    gameSetup.overlayOKButton = g;


    g.interactive = true;
    g.buttonMode = true;
    g.hitArea = new PIXI.Rectangle(buttonx - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight);
    g.on('pointerdown', () => {
        gameSetup.hideOverlay();
        if (gameSetup.dismissCallBack) {
          gameSetup.dismissCallBack();
        }
    });


    // g.interactive = true;
    // g.hitArea = new PIXI.Rectangle(0, 0, btnWidth, btnHeight);
    // g.on('pointerdown', () => {
    //     // ok was pressed
    //     gameSetup.hideOverlay();
    //     gameSetup.OKCallBack();
    // });

    const style2 = new PIXI.TextStyle({
        fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: 20,
        // fontStyle: 'italic',
        // fontWeight: 'bold',
        fill: ['#ffffff'],
        stroke: '#4a1850',
        strokeThickness: 2,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 2,
        wordWrap: false,
        wordWrapWidth: 440
    });

    const OKText = new PIXI.Text(`Dismiss`, style2);
    OKText.x = buttonx;
    OKText.y = buttony;
    OKText.anchor.set(0.5, 0.5);
    gameSetup.overlaycontainer.addChild(OKText);
    gameSetup.overlayOKText = OKText;

    // add TBot Token
    // const s = new PIXI.Sprite(PIXI.loader.resources['/images/TGameLogoHead.png'].texture);
    const s = new PIXI.Sprite(PIXI.loader.resources['/images/tboticon.png'].texture);
    s.position.x = mw * 0.25;
    s.position.y = mh * 0.4;
    s.anchor.set(0.5, 0.5);
    s.scale.set(1.2, 1.2);
    gameSetup.overlaycontainer.addChild(s);
    gameSetup.overlayG = g;


    // test result related objects
    if (gameSetup.gameType == GAME_TYPE.TESTING)
      this.setupTestResultDisplay();



    // // add cancel button
    // const buttonx2 = mw * 0.3;
    // g = new PIXI.Graphics();
    // g.lineStyle(5, 0x687af2, 1);
    // g.beginFill(0x132fef, 1);
    // g.drawRoundedRect(buttonx2 - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight, btnHeight/10);

    // gameSetup.overlaycontainer.addChild(g);

    // g.interactive = true;
    // g.hitArea = new PIXI.Rectangle(0, 0, btnWidth, btnHeight);
    // g.on('pointerdown', () => {
    //     // cancel was pressed so do nothing
    //     gameSetup.hideOverlay();
    //     // gameSetup.OKCallBack();
    // });

    // const CancelText = new PIXI.Text(`Cancel`, style2);
    // CancelText.x = buttonx2;
    // CancelText.y = buttony;
    // CancelText.anchor.set(0.5, 0.5);
    // gameSetup.overlaycontainer.addChild(CancelText);
  };



  this.createOverlayScreen2 = () => {
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // shouldn't be here!
      // return;
    }

    // bottom render for top and right controls
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "OverlayDiv2");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      w = gameDiv.clientWidth;
      h = gameDiv.clientHeight;
    }

    overlayrenderer2 = PIXI.autoDetectRenderer(w, h, { transparent: true, antialias: true });
    tableDiv.appendChild(overlayrenderer2.view);
    overlayrenderer2.view.setAttribute("id", "OverlayCanvas2");
    overlayrenderer2.plugins.interaction.autoPreventDefault = true;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    overlayrenderer2.view.setAttribute("style", `position:absolute;top:${0}px;left:${0}px;width:${w}px;height:${h}px`);

    // still scale it so we always show messages at proportional position
    gameSetup.overlaycontainer2 = new PIXI.Container();

    let mw = cfg.TrueWidth;
    let mh = cfg.TrueHeight;

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      // only show table
      // cfg.tableTop = 0;
      gameSetup.overlaycontainer2.scale.x = w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer2.scale.y = h / (cfg.mazeH + 2 * cfg.metalBorderThick);
      mw = cfg.mazeW + 2 * cfg.metalBorderThick;
      mh = cfg.mazeH + 2 * cfg.metalBorderThick;
    } else {
      // same scaling as all
      gameSetup.overlaycontainer2.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.mazeW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer2.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.mazeH + 2 * cfg.metalBorderThick);
    }




    // overall transparent modal screen
    let g = new PIXI.Graphics();

    g.lineStyle(0, 0x000000, 1);
    g.beginFill(0x000000, 0.6);
    g.drawRect(0, 0, mw, mh);
    g.endFill();


    // message box background
    g.lineStyle(5, 0x132fef, 1);
    g.beginFill(0xd9e8f9, 1); //0xcdd2d8  d9e8f9
    const msgBoxy = mh * 0.4;
    const msgBoxWidth = mw * 0.6;
    const msgBoxHeight = mh * 0.3;
    g.drawRoundedRect(mw/2 - msgBoxWidth/2, msgBoxy - msgBoxHeight/2, msgBoxWidth, msgBoxHeight, msgBoxHeight/10);
    g.endFill();

    gameSetup.overlaycontainer2.addChild(g);


    // message text
    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 25,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#133059'],
      stroke: '#133059',
      strokeThickness: 0,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 1,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: true,
      wordWrapWidth: mw * 0.45
    });

    const overlayText = new PIXI.Text(``, style);
    overlayText.x = mw * 0.5;
    overlayText.y = mh * 0.35;
    overlayText.anchor.set(0.5, 0.5);
    gameSetup.overlaycontainer2.addChild(overlayText);



    gameSetup.showOverlay2 = (msg, callback) => {
      // const s = document.getElementById('TestResultScreenCanvas');
      overlayrenderer2.view.style.zIndex = 500;
      overlayText.text = msg;
      gameSetup.overlayConfirmCallback = callback;
    };

    gameSetup.hideOverlay2 = () => {
      overlayrenderer2.view.style.zIndex = -100;
    };
    gameSetup.hideOverlay2();

    gameSetup.config.showConfirm = (msg, callback) => {
      gameSetup.showOverlay2(msg, callback);
    };






    // add ok button
    const buttony = mh * 0.48;
    const buttonx = mw * 0.3;
    const btnWidth = mw * 0.08;
    const btnHeight = mh * 0.06;
    g = new PIXI.Graphics();
    g.lineStyle(5, 0x687af2, 1);
    g.beginFill(0x132fef, 1); // 132fef
    g.drawRoundedRect(buttonx - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight, btnHeight/10);

    gameSetup.overlaycontainer2.addChild(g);

    gameSetup.overlayOKButton2 = g;


    g.interactive = true;
    g.buttonMode = true;
    g.hitArea = new PIXI.Rectangle(buttonx - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight);
    g.on('pointerdown', () => {
        gameSetup.hideOverlay2();
        if (gameSetup.overlayConfirmCallback) {
          gameSetup.overlayConfirmCallback();
          delete gameSetup.overlayConfirmCallback;
        }
    });


    // g.interactive = true;
    // g.hitArea = new PIXI.Rectangle(0, 0, btnWidth, btnHeight);
    // g.on('pointerdown', () => {
    //     // ok was pressed
    //     gameSetup.hideOverlay();
    //     gameSetup.OKCallBack();
    // });

    const style2 = new PIXI.TextStyle({
        fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: 20,
        // fontStyle: 'italic',
        // fontWeight: 'bold',
        fill: ['#ffffff'],
        stroke: '#4a1850',
        strokeThickness: 2,
        dropShadow: false,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 2,
        wordWrap: false,
        wordWrapWidth: 440
    });

    const OKText = new PIXI.Text(`Yes`, style2);
    OKText.x = buttonx;
    OKText.y = buttony;
    OKText.anchor.set(0.5, 0.5);
    gameSetup.overlaycontainer2.addChild(OKText);
    gameSetup.overlayOKText2 = OKText;

    // add TBot Token
    // const s = new PIXI.Sprite(PIXI.loader.resources['/images/TGameLogoHead.png'].texture);
    const s = new PIXI.Sprite(PIXI.loader.resources['/images/tboticon.png'].texture);
    s.position.x = mw * 0.24;
    s.position.y = mh * 0.35;
    s.anchor.set(0.5, 0.5);
    s.scale.set(1.2, 1.2);
    gameSetup.overlaycontainer2.addChild(s);
    gameSetup.overlayG2 = g;







    // add cancel button
    const buttonx2 = mw * 0.7;
    g = new PIXI.Graphics();
    g.lineStyle(5, 0x687af2, 1);
    g.beginFill(0x132fef, 1);
    g.drawRoundedRect(buttonx2 - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight, btnHeight/10);

    gameSetup.overlaycontainer2.addChild(g);


    g.interactive = true;
    g.buttonMode = true;
    g.hitArea = new PIXI.Rectangle(buttonx2 - btnWidth/2, buttony - btnHeight/2, btnWidth, btnHeight);
    g.on('pointerdown', () => {
        // cancel was pressed so do nothing
        gameSetup.hideOverlay2();
        // gameSetup.OKCallBack();
    });

    const CancelText = new PIXI.Text(`No`, style2);
    CancelText.x = buttonx2;
    CancelText.y = buttony;
    CancelText.anchor.set(0.5, 0.5);
    gameSetup.overlaycontainer2.addChild(CancelText);
  };



  this.setupHandleTestResult = () => {

    gameSetup.resetMaze = () => {
      if ( gameSetup.testSetupCode ) {

        Meteor.setTimeout(() => {
          if (gameSetup.inNewTest) return;
          if (!gameSetup.controller) return;
          // console.log('to reset table after test!');
          // debugger;
          gameSetup.controller.setRobotCode("     "); //can't be blank
          const cleanTestSetupCode = getCleanTestCode(gameSetup.testSetupCode);
          // let cleanTestSetupCode = "";
          // const p = gameSetup.testSetupCode.split("\n");
          // for (let k=0; k<p.length; k++) {
          //   if (p[k].indexOf("PlaceBallOnTable") >= 0 || p[k].indexOf("ResetTable") >= 0) {
          //     cleanTestSetupCode += `${p[k]}\n`;
          //   }
          // }
          gameSetup.controller.createAIPlayers(cleanTestSetupCode, true);
        }, 300);

      }

      for (let i = 6; i < gameSetup.tankControllers.length; i++) {
        const tank = gameSetup.tankControllers[i].tank;
        tank.isDead = true;
        tank.state = "P";
      }

      window.waitForTickUpdateDoneCount = -1;

    };

    gameSetup.checkOneResult = (result) => {
      if (!result || result === "") return true;

      if (result.indexOf("TestFinishedCrystalAssignedEvenly_") === 0) {
        const p = result.split("_");
        const average = Number(p[1]);
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        const members = gameSetup.tanks.filter(t => t.position.x >= 0 && t.color === myTank.color);
        
        if (members.length > 0) {
          for (let i = 0; i < members.length; i += 1) {
            allpowers = Object.values(members[i].specialPower).reduce((a, b) => a + b, 0);
            if (allpowers !== average) {
              window.testResult = `Test failed: the tank ${t.tankID} has ${allpowers} special powers, not the average value ${average}.`;
              return false;
            }
          }
        }

        return true;
      }

      if (result.indexOf('TestFinishedStaySafe_') === 0) {
        const p = result.split("_");
        let dc = 0;
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        myTank.c = Math.round((myTank.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
        myTank.r = Math.round(myTank.y / gameSetup.config.TileSizeH - 1.5);
        for (let i = 0; i < gameSetup.tanks.length; i += 1) {
          const t = gameSetup.tanks[i];
          if (t.color === myTank.color) continue;
          t.c = Math.round((t.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
          t.r = Math.round(t.y / gameSetup.config.TileSizeH - 1.5);
          if (t.speedX == 0 && t.speedY == 0) {
            t.dir = t.state.charAt(1);
          } else {
            if (t.speedX > 0) t.dir = "R";
            if (t.speedX < 0) t.dir = "L";
            if (t.speedY > 0) t.dir = "D";
            if (t.speedY < 0) t.dir = "U";
          }
          if (
            (t.c === myTank.c && (t.r < myTank.r && t.dir === 'D' || t.r > myTank.r && t.dir === 'U')) ||
            (t.r === myTank.r && (t.c < myTank.c && t.dir === 'R' || t.c > myTank.c && t.dir === 'L'))
          ) {
            dc += 1 + t.specialPower.damage;
          }
        }
        if (dc > Number(p[1])) {
          window.testResult = `Test failed: MyTank is not at a safe position.`;
          return false;
        } 
        return true;
      }

      if (result.indexOf('TestFinishedAllFrozen_') === 0) {
        const p = result.split("_");
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        const color = p[1];
        for (let i = 1; i < gameSetup.tanks.length; i += 1) {
          const t = gameSetup.tanks[i];
          if (t && t.color === color && t.position.x >= 0 && !t.freeze) {
            window.testResult = `Test failed: all the ${color} tank should be frozen.`;
            return false;
          }
        }
        return true;
      }

      if (result.indexOf('TestFinishedNoneFrozen') === 0) {
        const p = result.split("_");
        for (let i = 1; i < gameSetup.tanks.length; i += 1) {
          const t = gameSetup.tanks[i];
          if (t && t.freeze) {
            window.testResult = `Test failed: none of the tanks should be frozen.`;
            return false;
          }
        }
        return true;
      }

      if (result.indexOf('TestFinishedPassAnd_') === 0) {
        const p = result.split("_");
        const tankID = p[1];
        if (!("footPrints" in gameSetup)) {
          window.testResult = `Test failed: no foot prints of your tank ${tankID} were recorded.`;
          return false;
        } else {
          const fp = gameSetup.footPrints[tankID];
          for (let i = 2; i + 1 < p.length; i += 2) {
            const pos = p[i] + "_" + p[i + 1];
            if (!fp.path.has(pos)) {
              window.testResult = `Test failed: your tank didn't pass position (${p[i]}, ${p[i + 1]}).`;
              return false;
            }
          }
        }
        return true;
      }

      if (result.indexOf('TestFinishedPassOr_') === 0) {
        const p = result.split("_");
        const tankID = p[1];
        if (!("footPrints" in gameSetup)) {
          window.testResult = `Test failed: no foot prints of your tank ${tankID} were recorded.`;
          return false;
        } else {
          const fp = gameSetup.footPrints[tankID];
          let flag = false;
          let cands = [];
          for (let i = 2; i + 1 < p.length; i += 2) {
            const pos = p[i] + "_" + p[i + 1];
            cands.push(`(${p[i]}, ${p[i + 1]})`);
            if (fp.path.has(pos)) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            window.testResult = `Test failed: your tank didn't pass any of the positions: ${JSON.stringify(cands)}.`;
            return false;
          } 
        }
        return true;
      }

      if (result.indexOf('TestFinishedNoPassAt_') === 0) {
        const p = result.split("_");
        const tankID = p[1];
        if (!("footPrints" in gameSetup)) {
          window.testResult = `Test failed: no foot prints of your tank ${tankID} were recorded.`;
          return false;
        } else {
          const fp = gameSetup.footPrints[tankID];
          if (fp.path.has(p[2] + "_" + p[3])) {
            window.testResult = `Test failed: your tank should not pass tile at column ${p[2]} and row ${p[3]}.`;
            gameSetup.footPrints = [];
            return false;
          } 
        }
        gameSetup.footPrints = [];
        return true;
      }

      if (result.indexOf('TestFinishedKilledOpponents_') === 0) {
        const p = result.split("_");
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        for (let i = 1; i < p.length; i += 1) {
          const t = gameSetup.tanks[Number(p[i])];
          if (t && t.color !== 'white' && t.color !== myTank.color && t.position.x >= 0) {
            window.testResult = `Test failed: the opponent tank at row ${t.r} column ${t.c} should be killed but it is still alive.`;
            return false;
          }
        }
        return true;
      }

      if (result.indexOf("TestFinished_print_0to4") >= 0) {
        let hasLogging = true;
        for (let j = 0; j < 5; j++) {
          const line = window.logHistory[j] + "";
          if (typeof(line) === "undefined" || ("" + line).trim() !== j + "") {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out numbers 0 to 4.";
          return false;
        }
        return true;
      }

      
      if (result.indexOf('tankstaycloseto_') === 0) {
        const p = result.split("_");
        const col = Number(p[1]);
        const row = Number(p[2]);
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        myTank.c = Math.round((myTank.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
        myTank.r = Math.round(myTank.y / gameSetup.config.TileSizeH - 1.5);

        if ( Math.abs(myTank.c - col) > 1  || Math.abs(myTank.r - row) > 1  ) {
          window.testResult = `Test failed: your tank did not stay close to column ${col} row ${row}.`;
          return false;
        }

        return true;
      }


      if (result.indexOf('TestFinishedGetWeaponAt_') === 0) {
        const p = result.split("_");
        const wps = gameSetup.gainWeaponInOrder;
        const type = Number(p[1]);
        const col = Number(p[2]);
        const row = Number(p[3]);

        if (!wps || wps.length === 0) {
          window.testResult = `Test failed: no weapon was collected.`;
          return false;
        }
        wps[0].c = Math.round((wps[0].x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
        wps[0].r = Math.round(wps[0].y / gameSetup.config.TileSizeH - 1.5);
        if (wps[0].type !== type) {
          window.testResult = `Test failed: a ${WeaponName[wps[0].type]} was collected first, though it should be a ${WeaponName[type]}.`;
          return false;
        } else if (wps[0].c !== col || wps[0].r !== row) {
          window.testResult = `Test failed: a ${WeaponName[wps[0].type]} was first collected at (${wps[0].c}, ${wps[0].r}), instead of at (${col}, ${row}).`;
          return false;
        } 
        return true;
      }

      if (result.indexOf('TestFinishedSpecialPower_') === 0) {
        const p = result.split("_");
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        // 1: damage, 2: speed, 3: health-regen, 4: reload
        for (let i = 1; i < p.length && i < 5; i += 1) {
          const sp = myTank.specialPower;
          const ans = Number(p[i]);
          let key = "";
          switch (i) {
            case 1:
              key = "damage";
              break;
            case 2:
              key = "speed";
              break;
            case 3:
              key = "healthRegen";
              break;
            case 4:
              key = "reload";
              break;
          }
          if (ans !== sp[key]) {
            window.testResult = `Test failed: special power ${key} should be ${ans}, instead of ${sp[key]}.`;
            return false;
          }
        }
        return true;
      }

      if (result.indexOf("callAttackWhiteTankKill1") == 0) {
        if (gameSetup.numOfTanksKilled !== 1) {
          window.testResult = `Test failed: expected 1 white tank to be killed. `;
          return false;
        }
        return true;
      }

      if (result.indexOf('TestFinishedTanksKilled_') === 0) {
        const p = result.split("_");
        const num = Number(p[1]);
        if (gameSetup.numOfTanksKilled !== num) {
          window.testResult = `Test failed: ${gameSetup.numOfTanksKilled} white tank(s) was/were killed instead of ${num}. `;
          return false;
        }
        return true;
      }

      if (result.indexOf('TestFinishedColorTanksKilled_') === 0) {
        const p = result.split("_");
        const num = Number(p[1]);
        if (gameSetup.numOfColoredTanksKilled !== num) {
          window.testResult = `Test failed: ${gameSetup.numOfColoredTanksKilled} opponent tank(s) was/were killed instead of ${num}. `;
          return false;
        }
        return true;
      }

      if (result == "TestFinished_printMudInRow") {
        const answer = [
          "In total, there are 2 mud tiles in my row.",
        ];
        let hasLogging = true;
        const line = window.AllConsoleLog[0] + "";
        if (line != answer[0]) {
          window.testResult = `Error: the printed information is not correct. `;
          return false;
        }

        return true;
      }

      if (result == "TestFinished_printMudInColumn") {
        const answer = [
          "In total, there are 2 mud tiles around me.",
        ];
        let hasLogging = true;
        const line = window.AllConsoleLog[0] + "";
        if (line != answer[0]) {
          window.testResult = `Error: the printed information is not correct. `;
          return false;
        }
        return true;
      }

      if (result == "TestFinished_printMudInRow2") {
        const answer = [
          "In total, there are 1 pair of mud tiles in my row side-by-side.",
        ];
        const line = window.AllConsoleLog[0] + "";
        if (line != answer[0]) {
          window.testResult = `Error: the printed information is not correct. `;
          return false;
        }
        return true;
      }


      if (result.indexOf("TestFinished_printTankInfo") >= 0) {
        const answer = [
          "Tank 0 is the blue tank at (4, 5).",
          "Tank 1 is the red tank at (11, 5).",
          "Tank 2 is the red tank at (2, 8).",
          "Tank 3 is the white tank at (3, 3).",
          "Tank 4 is the white tank at (5, 9).",
          "Tank 5 is the white tank at (9, 5).",
          "Tank 6 is the white tank at (7, 3).",
          "Tank 7 is the white tank at (11, 12).",
          "Tank 8 is the white tank at (13, 2).",
        ];
        let hasLogging = true;
        for (let j = 0; j < 9; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim().indexOf("Tank " + j) < 0) {
            hasLogging = false; break;
          }
          if (line != answer[j]) {
            window.testResult = `Error: the information about tank ${j} is not correct. `;
            return false;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out all tank information in the for-loop.";
          return false;
        }
        return true;
      }

      if (result.indexOf('TestFinishedWithLog_') === 0) {
        const logAnwsers = {
          1: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          2: "0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          3: "0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          4: "0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          5: "7_8,8_8,9_8,10_8,11_8,12_8,13_8,14_8,15_8,16_8,17_8,18_8,19_8,20_8,19_7,19_6,6_8,5_8,4_8,3_8,2_8,1_8,0_8,19_9,19_10,19_11,19_12",
          6: "1,4",
          7: "1,2,4",
          8: "6,8,5,8,4,8,3,8,2,8,1,8,7,8,8,8,9,8,10,8,11,8,12,8,13,8,14,8,15,8,16,8,17,8,18,8,19,8,6,7,6,6,6,5,6,4,6,3,6,2,6,1,6,9,6,10,6,11,6,12,6,13,6,14,6,15,6,16,6,17,6,18,6,19",
          9: "false",
          10: "240",
          11: "0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,6,3,3,3,3,3,3,3,3,3,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          "11slides": "0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,3,3,3,3,3,3,3,3,3,3,3,6,3,3,3,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0",
          12: "0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,9,3,3,3,3,3,3,3,3,3,0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          13: "in end game mode",
          14: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          15: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,1,0,1,1,1,1,1,1,1,0,0,1,1,0,0,1,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,1,0,0,1,1,1,1,0,0,0,0,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,0,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          mytank1: "MyTank's color is blue",
          mytank2: "MyTank has a damage power of 1",
          mytank2hw: "MyTank's speed power is 2",
          mytank3: "The sum of MyTank's special powers is 6",
          mytank4: "MyTank is the blue tank at (4, 5).",
          mytank5: "The nearest white tank is at (8, 5).",
          tankcoord1: "MyTank is at (7, 11).",
          tankcoord1hwt: "Tanks[2] is a white tank located at (7, 3).",
          tankcoord2: "The last tank is at (10, 4).",
          tankcoord3: "The sum of column indices is 43",
          "2darray1": "The number of tree tiles is 23",
          "2darray2": "Found a rock at (4, 2).",
          "2darray3": "In total, there are 12 mud tiles.",
          "2darray4": "In total, there are 4 occurrences of three trees in a row.",
          attackoppo1: "damage2 = 540, healthRecovery2 = 960, reduction2 = -420, surviveTime2 = -1",
          slide1: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          slide2: "0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,5,0,0,0,0,0,0,0,0,1,1,0,0,0,0,5,0,0,0,0,0,0,0,0,1,0,0,0,0,0,5,0,0,0,0,0,0,0,0,1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          slide3: "0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          speed: "My tank's current speed is 3.75 tiles per second.",
          slide3a: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
          danger: "the most dangerous place is at (7, 4).",
          team1: "Got a message of attacking an opponent.",
          team2: "Crystal at (3, 3) is assigned to Tank 2",
          team3: `{"2":[{"c":3,"r":3}]}`,
          team4: `{"2":[{"c":5,"r":10}]}`,
          team5: "Tank 1 can survive 5 seconds if attacked by my team.",
          team6: "We are attacking Tank 3",
          team7: "Now the target tank ID is -1",
        };

        const lognum = result.substring("TestFinishedWithLog_".length);
        const answer = logAnwsers[lognum];
        const logs = window.logHistory;
        let found = false;

        if (lognum === '2darray2' && logs.length > 1) {
          window.testResult = `Error: only one rock should be found.`;
          return false;
        }

        for (let i = 0; i < logs.length; i += 1) {
          if (("" + logs[i]).trim() === answer) {
            found = true;
            break;
          } else {
            // console.log("\n\n" + logs[i]);
            // console.log("\n\n" + answer + "\n\n");
            // break;
          }
        }
        window.logHistory = [];
        
        if (found) {
          return true;
        } else {
          if (lognum < 5) window.testResult = `Test failed: danger score matrix is not calculated correctly.`;
          else window.testResult = `Test failed: your program did not print out the correct output.`;
          return false;
        }
      }

      if (result.indexOf('TestFinishedOnlyWithLogs_') === 0) {
        const logAnwsers = {
          1: ["Tank 0 is the leader!"],
          2: ["Tank 0 got a message of attacking an opponent.", "Tank 2 got a message of attacking an opponent.", "Tank 4 got a message of attacking an opponent."]
        };

        const lognum = result.substring("TestFinishedOnlyWithLogs_".length);
        const answer = logAnwsers[lognum];
        const logs = window.logHistory;
        let found = 0;
        if (answer.length > logs.length) {
          window.testResult = `Test failed: not all expected messages were printed out. `;
          return false;
        } else if (answer.length > logs.length) {
          window.testResult = `Test failed: extra unexpected messages were printed out. `;
          return false;
        } else {
          for (let i = 0; i < answer.length && i < logs.length; i += 1) {
            if (("" + logs[i]).trim() === answer[i]) {
              found += 1;
            } else {
              window.testResult = `Test failed: unexpected message '${logs[i]}' is printed.`;
              return false;
            }
          }
          if (found === answer.length) {
            return true;
          } else {
            window.testResult = `Test failed: not all expected messagea are printed.`;
            return false;
          }
        }
      }

      if (result.indexOf('TestFinishedGetCrystalInOrder_') === 0) {
        const p = result.split("_");
        const tankID = Number(p[1]);
        const trs = gameSetup.gainCrystalInOrder.filter(a => a.tankID === tankID);
        let j = 2;
        for (let i = 0; i < trs.length && j + 1 < p.length; i += 1) {
          const tr = trs[i];
          tr.c = Math.round((tr.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
          tr.r = Math.round(tr.y / gameSetup.config.TileSizeH - 1.5);
          const col = Number(p[j]);
          const row = Number(p[j + 1]);
          j += 2;
          if (tr.c !== col || tr.r !== row) {
            let order = `${i + 1}th.`;
            if (i === 0) order = "first";
            else if (i === 1) order = "second";
            window.testResult = `Test failed: the ${order} crystal collected should be the one at (${col}, ${row}), instead of (${tr.c}, ${tr.r}).`;
            return false;
          }
        }
        gameSetup.gainCrystalInOrder = gameSetup.gainCrystalInOrder.filter(a => a.tankID !== tankID);

        if (j + 1 < p.length) {
          window.testResult = `Test failed: the crystal at (${Number(p[j])}, ${Number(p[j + 1])}) was not collected.`;
          return false;
        }
        return true;
      }

      if (result === 'TestFinishedPowerPointOne') {
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        const points = myTank.powerPoint + Object.values(myTank.specialPower).reduce((a, b) => a + b, 0);
        if (points >= 1) return true;
        window.testResult = `Test failed: no crystals were collected. `;
        return false;
      }

      if (result === 'TestFinishedPowerPoint_2') {
        const myTank = gameSetup.tanks[gameSetup.localPlayerID];
        const points = myTank.powerPoint + Object.values(myTank.specialPower).reduce((a, b) => a + b, 0);
        if (points == 2) return true;
        window.testResult = `Test failed: you need to collect 2 crystals. `;
        return false;
      }

      if (result.indexOf("TestFinishedBattleField_") === 0) {
        const battleFields = {
          1: [
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 3: "M", 4: "R", 6: "T", 14: "R"},
            {0: "R", 3: "T", 4: "T", 6: "T", 7: "M", 8: "T", 9: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 5: "M", 6: "M", 14: "R"},
            {0: "R", 5: "T", 6: "M", 8: "T", 9: "M", 10: "M", 11: "R", 14: "R"},
            {0: "R", 5: "R", 6: "R", 8: "R", 9: "T", 10: "M", 11: "R", 14: "R"},
            {0: "R", 8: "R", 9: "T", 10: "T", 11: "T", 14: "R"},
            {0: "R", 2: "M", 3: "T", 8: "M", 9: "M", 10: "R", 11: "T", 14: "R"},
            {0: "R", 2: "M", 3: "T", 14: "R"},
            {0: "R", 6: "T", 9: "T", 10: "T", 11: "T", 14: "R"},
            {0: "R", 6: "T", 8: "T", 9: "T", 10: "T", 11: "T", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"}
          ],
          2: [
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 4: "R", 14: "R"},
            {0: "R", 9: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 11: "R", 14: "R"},
            {0: "R", 5: "R", 6: "R", 8: "R", 11: "R", 14: "R"},
            {0: "R", 8: "R", 14: "R"},
            {0: "R", 10: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"}
          ],
          3: [
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"}
          ],
          4: [
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 14: "R"},
            {0: "R", 10: "M", 14: "R"},
            {0: "R", 9: "M", 14: "R"},
            {0: "R", 8: "M", 14: "R"},
            {0: "R", 7: "M", 14: "R"},
            {0: "R", 6: "M", 14: "R"},
            {0: "R", 5: "M", 14: "R"},
            {0: "R", 4: "M", 14: "R"},
            {0: "R", 4: "T", 5: "T", 6: "T", 7: "T", 8: "T", 9: "T", 10: "T",14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"}
          ],
          5: [
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 3: "R", 4: "R", 10: "R", 11: "R", 14: "R"},
            {0: "R", 3: "R", 4: "R", 10: "R", 11: "R", 14: "R"},
            {0: "R", 7: "M", 14: "R"},
            {0: "R", 7: "M", 14: "R"},
            {0: "R", 6: "M", 7: "M", 8: "M", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 4: "T", 5: "T", 9: "T", 10: "T", 14: "R"},
            {0: "R", 4: "T", 5: "T", 6: "T", 7: "T", 8: "T", 9: "T", 10: "T",14: "R"},
            {0: "R", 6: "T", 7: "T", 8: "T", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"}
          ],
          6: [
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 3: "R", 4: "R", 10: "R", 11: "R", 14: "R"},
            {0: "R", 3: "R", 4: "R", 10: "R", 11: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 14: "R"},
            {0: "R", 1: "R", 2: "R", 3: "R", 4: "R", 5: "R", 6: "R", 7: "R", 8: "R", 9: "R", 10: "R", 11: "R", 12: "R", 13: "R", 14: "R"}
          ],
        }
        const bfnum = result.substring("TestFinishedBattleField_".length);
        const answer = battleFields[bfnum];
        const userbf = gameSetup.maze;
        for (let i = 0; i < gameSetup.config.TileRows && !flag; i += 1) {
          const ansobj = answer[i];
          const usrobj = userbf[i];
          if (!usrobj) {
            window.testResult = `Test failed: row ${i} is missing.`;
            return false;
          }
          let keys = Object.keys(ansobj);
          for (let j = 0; j < keys.length; j += 1) {
            const key = keys[j];
            const ansTile = ansobj[key];
            if (!(key in usrobj)) {
              window.testResult = `Test failed: missing a ${getTileTypeString(ansTile)} at row ${i} and column ${key}.`;
              return false;
            }
            const usrTile = usrobj[key];
            if (usrTile !== ansTile) {
              window.testResult = `Test failed: the tile at row ${i} and column ${key} should be a ${getTileTypeString(ansTile)}, instead of a ${getTileTypeString(usrTile)}.`;
              return false;
            }
          }

          keys = Object.keys(usrobj);
          for (let j = 0; j < keys.length; j += 1) {
            const key = keys[j];
            const usrTile = usrobj[key];
            if (!(key in ansobj)) {
              window.testResult = `Test failed: extra ${getTileTypeString(usrTile)} at row ${i} and column ${key}.`;
              return false;
            }
          }
        }

        return true;
      }

      if (result.indexOf("TestFinishedWithCommandFirst_") === 0) {
        const p = result.split("_");
        const cmd = p[1];
        if (window.commandHistory && window.commandHistory.length > 0 && window.commandHistory[0] === cmd) {
          window.commandHistory = [];
          return true;
        } else {
          window.testResult = `Test failed: your tank needs to send command ${cmd} first.`;
          window.commandHistory = [];
          return false;
        }
      }

      if (result.indexOf("TestFinishedUseGetRandomCommand") === 0 || result.indexOf("TestFinished_returngetrandom") === 0) {

        if (window.commandHistory && window.commandHistory.length > 0) {
          let hasR = 0; let hasL = 0; let hasD = 0; let hasU = 0; let hasS = 0;
          for (let k = 0; k < window.commandHistory.length; k++) {
            const cc = window.commandHistory[k];
            if (cc == "R") hasR ++;
            if (cc == "L") hasL ++;
            if (cc == "D") hasD ++;
            if (cc == "U") hasU ++;
            if (cc == "S") hasS ++;
          }
          if (hasR * hasS * hasD * hasU * hasS > 0) {
            return true;
          } else {
            window.testResult = `Test failed: your tank is not sending back random commands.`;
            return false;
          }
        } else {
          window.testResult = `Test failed: your tank is not sending back any command.`;
          return false;
        }
        return true;
      }


      if (result.indexOf("TestFinishedWithCommands_") === 0) {
        const p = result.split("_");
        const cmds = new Set(p.slice(1));

        if (window.commandHistory && window.commandHistory.length > 0) {
          window.commandHistory.every(c => {
            if (!cmds.has(c)) {
              window.testResult = `Test failed: your gamebot sent an unexpected command "${c}".`;
              return false;
            }
          });
          const received = new Set(window.commandHistory);
          p.slice(1).forEach(c => {
            if (!received.has(c)) {
              window.testResult = `Test failed: your gamebot didn't send the expected command ${c}.`;
              return false;
            }
          });
          return true;
        } else {
          window.testResult = `Test failed: no command of {${p.slice(1).toString()}} sent from your gamebot.`;
          return false;
        }
        return true;
      }
      

      if (result.indexOf("TestFinishedKillTanksAt_") == 0) {
        const p = result.split("_");
        // for (let i = 2; i < gameSetup.tanks.length; i += 1) {
        //   const t = gameSetup.tanks[i];
        //   const c = Math.round((t.x - gameSetup.config.TileSizeW / 2) / gameSetup.config.TileSizeW);
        //   const r = Math.round(t.y / gameSetup.config.TileSizeH - 1.5);
        //   const key = `${c}_${r}`;
        //   if (!gameSetup.whiteTanksKilled.includes(key)) {
        //     window.testResult = `Test failed: no white tank killed at row ${r} column ${c}.`;
        //     flag = true; break;
        //   }
        // }
        for (let i = 1; i < p.length - 1; i += 2) {
          const col = Number(p[i]);
          const row = Number(p[i + 1]);
          const key = `${col}_${row}`;
          if (!gameSetup.whiteTanksKilled.includes(key)) {
            window.testResult = `Test failed: no white tank killed at row ${row} column ${col}.`;
            return false;
          }
        }
        return true;
      }

      if (result.indexOf("TestFinishedWithTiles_") == 0) {
        const p = result.split("_");
        for (let i = 1; i < p.length - 2; i += 3) {
          const type = p[i];
          const col = Number(p[i + 1]);
          const row = Number(p[i + 2]);
          const tile = gameSetup.maze[row][col];
          if (tile !== type) {
            window.testResult = `Test failed: there is no tile ${type} at row ${row} column ${col}.`;
            return false;
          }
        }
        return true;
      }

      if (result.indexOf("TestFinishedNoTreeAt_") == 0) {
        const p = result.split("_");
        const row = Number(p[1]);
        const col = Number(p[2]);
        const tile = gameSetup.maze[row][col];
        if (!tile) {
          window.testResult = "Test passed!";
          return true;
        } else {
          window.testResult = `Test failed: your tank needs to destroy the tree at row ${row} column ${col}.`;
          return false;
        }
      }

      if (result.indexOf("TestFinished_NewForLoop1") >= 0) {

        let hasLogging = true;
        for (let j = 0; j < 6; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim() !== (j*2) + "") {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out the sequence 0 2 4 6 8 10 using a for-loop.";
          return false;
        }

        return true;
      }

      if (result.indexOf("TestFinished_NewForLoop2") >= 0) {

        let hasLogging = true;
        for (let j = 0; j <= 4; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim() !== (21 - j * 4) + "") {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out the sequence 21 17 13 9 5 using a for-loop.";
          return false;
        }

        return true;
      }

      const passingList = [
        "TestFinishedAnyResult", 
        "TestFinishedCallConsoleLog",
        "TestFinished_NewFunc_getTestCommand",
        "TestFinished_NewReturnTank", 
        "TestFinishedRewriteIsPathBlocked",
        "TestFinished_getCommandNoVar",
        "TestFinished_refactorgetLegal", 
        "TestFinished_isPathBlocked",
        "TestFinished_check4rocks",
        "TestFinished_forlooprock",
        "TestFinished_addtreecount",
        "TestFinished_forlooptreecount",
        "TestFinished_extraforlooptreecount",
        "TestFinished_2345addtreecount",
        "TestFinished_changeforlooprock",
        "callgetShortestPathCmdGreedy",
        "TestFinishedCallAttackTank",
        "TestFinishedWithoutCode_1"
      ];

      for (let k=0; k<passingList.length; k++) {
        if (result.indexOf(passingList[k]) >= 0) {
          return true;
        }
      }

      if (result.indexOf("EXPECTWHITETANKKILLED_") == 0) {
        const pp = result.split("_");
        const num = Number(pp[1]);
        if (gameSetup.numOfTanksKilled !== num) {
          window.testResult = `Test failed: ${gameSetup.numOfTanksKilled} tank(s) was/were killed instead of ${num} of them. `;
          return false;
        }
        return true;
      }
      window.testResult = `Error: the test condistion "${result}" is not supported. `;
      return false;
    };

    gameSetup.handleTestResult = (res) => {

      gameSetup.resetMaze();
      gameSetup.inNewTest = false;

      if (gameSetup.userExpectedResult && gameSetup.userExpectedResult.length > 0) {

        for (const exp of gameSetup.userExpectedResult) {
          if (!gameSetup.checkOneResult(exp)) {
            gameSetup.showTestResult();
            return;
          }
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (!window.testCondition || window.testCondition == "") {
        window.testResult = "No challenge specified at the moment. Type 'n' to continue.";
      } else {
        const succeeded = gameSetup.checkOneResult(window.testCondition);
        if (succeeded) window.testResult = "Test passed!";
      }

      gameSetup.showTestResult();
      return;
    };



    gameSetup.handleSubmitData = (data) => {
      // store data into indexeddb
      // debugger;
      localForage.setItem(data.tableName, data.tableValue, function() {
        console.log(`Saved: ${data.tableName}`);
        gameSetup.activePlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_SCRIPT_SUBMIT_DATA,
          'resolveID': data.resolveID
        });

        let t = data.tableValue;
        if (!t.BallDistance || !t.PocketDistance || !t.CutAngle || !t.Probability) {

        } else {
          if (t.BallDistance.length == t.PocketDistance.length && t.BallDistance.length == t.CutAngle.length && t.BallDistance.length == t.Probability.length) {
            window.savedDataLinearRegression = true;
          }
        }
      });
    };

    gameSetup.handleTrainLinearModel = (data) => {
      localForage.getItem(data.tableName, (err, tableValue) => {

        window.trainLinearModelX = data.xCols;

        const yArray = tableValue[data.yCol];
        //const xcols = tableValue[data.xCols];

        // === training data generated from y = 2.0 + 5.0 * x + 2.0 * x^2 === //
        const xMatrix = [], yMatrix = [];
        let yAvg = 0;
        for (let k = 0; k < yArray.length; k++) {
          yMatrix.push([yArray[k]]);
          const row = [];
          for (let j=0; j<data.xCols.length; j++) {
            row.push(tableValue[data.xCols[j]][k]);
          }
          yAvg += yArray[k];
          xMatrix.push(row); // Note that the last column should be y the output
        }
        yAvg = yAvg / yArray.length;

        // === Train the linear regression === //
//        const m = regression.fit(d);

        // var Y = $M([[1],[2],[3], [4], [6]]),
        //     X = $M([[1,2,3.2],[2.1,3.3, 5.7],[3.1, 5.8, 7.2], [5.2, 6.6, 7.2], [3.2, 6.6, 9.1]]);
        const Y = $M(yMatrix);
        const X = $M(xMatrix);
        const m = ols.reg(Y, X);

        // === Print the trained model === //
        console.log(m);

        // // calculate r-squared
        // const theta = m.theta;
        // let totalS = 0;
        // let totalR = 0;
        // for (let z = 0; z < yArray.length; z++) {
        //   totalS += (yArray[z] - yAvg) * (yArray[z] - yAvg);
        //   let f = theta[0];
        //   for (let j=0; j<data.xCols.length; j++) {
        //     f += theta[j+1] * tableValue[data.xCols[j]][z];
        //   }
        //   console.log(f + "," + yArray[z]+","+tableValue[data.xCols[0]][z]);
        //   totalR += (yArray[z] - f) * (yArray[z] - f);
        // }
        const model = {};
        model.rSquared = m.overall.R2;
        model.intercept = m.B0.value;
        model.coefficients = {};
        for (let j=0; j<data.xCols.length; j++) {
          model.coefficients[data.xCols[j]] = m[`B${j+1}`].value;
        }


        gameSetup.activePlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_SCRIPT_TRAIN_LINEAR_MODEL,
          'model': model,
          'resolveID': data.resolveID
        });
      });
    };

    gameSetup.handleLoadData = (data) => {
      localForage.getItem(data.tableName, (err, tableValue) => {
        gameSetup.activePlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_SCRIPT_LOAD_DATA,
          'tableValue': tableValue,
          'resolveID': data.resolveID
        });
      });
    };

    gameSetup.handlePlotData = (data) => {
      // read data from indexeddb and plot it!
      // debugger;
      localForage.getItem(data.tableName, (err, tableValue) => {
        // console.log(`read: ${JSON.stringify(tableValue)}`);
        $("#chartcontainer").show();
        if (data.chartType == "Scatter") {
          const dataArray = [];
          const xArray = tableValue[data.xCol];
          const yArray = tableValue[data.yCol];
          for (let k=0; k<xArray.length; k++) {
            dataArray.push([xArray[k], yArray[k]]);
          }

          Highcharts.chart('datachart', {
            chart: {
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: `Scatter Plot: ${data.yCol} vs ${data.xCol}`,
                style: {
                  color: 'blue',
                  fontSize:'20px'
                }
            },
            // subtitle: {
            //     text: 'Source: Heinz  2003'
            // },
            xAxis: {
                title: {
                    enabled: true,
                    text: data.xCol,
                    style: {
                      color: 'blue',
                      fontSize:'18px'
                    }
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true,
                labels: {
                  style: {
                      color: 'black',
                      fontSize:'14px'
                  }
                }
            },
            yAxis: {
                title: {
                  enabled: true,
                  text: data.yCol,
                  style: {
                    color: 'blue',
                    fontSize:'18px'
                  }
                },
                labels: {
                  style: {
                      color: 'black',
                      fontSize:'14px'
                  }
                }
            },
            exporting: { enabled: false },
            // legend: {
            //     layout: 'vertical',
            //     align: 'left',
            //     verticalAlign: 'top',
            //     x: 100,
            //     y: 70,
            //     floating: true,
            //     backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            //     borderWidth: 1
            // },
            // plotOptions: {
            //     scatter: {
            //         marker: {
            //             radius: 5,
            //             states: {
            //                 hover: {
            //                     enabled: true,
            //                     lineColor: 'rgb(100,100,100)'
            //                 }
            //             }
            //         },
            //         states: {
            //             hover: {
            //                 marker: {
            //                     enabled: false
            //                 }
            //             }
            //         },
            //         tooltip: {
            //             headerFormat: '<b>{series.name}</b><br>',
            //             pointFormat: '{point.x} cm, {point.y} kg'
            //         }
            //     }
            // },
            series: [{
                name: 'All',
                color: 'rgba(223, 83, 83, .5)',
                data: dataArray //[[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0]]
            }]
          });
          if (data.yCol == 'Probability' && data.xCol == "BallDistance")
            window.plottedBasicScatterBallDistanceProbability = true;
          if (data.yCol == 'Probability' && data.xCol == "CutAngle")
            window.plottedBasicScatterCutAngleProbability = true;



        } else if (data.chartType == "BasicColumn") {
          try {
            const xArray = tableValue[data.xCol];
            const yArrays = [];
            const allFields = Object.keys(tableValue);
            for (let j=0; j<allFields.length; j++) {
              const f = allFields[j];
              if (f == data.xCol) continue;
              yArrays.push({
                name: f,
                data: tableValue[f]
              });
            }
            Highcharts.chart('datachart', {
              chart: {
                  type: 'column'
              },
              title: {
                  text: `Column Chart for ${data.tableName}`
                  // enabled: false
              },
              // subtitle: {
              //     text: 'Source: Heinz  2003'
              // },
              xAxis: {
                categories: xArray,
                crosshair: true
              },
              yAxis: {
                  title: {
                    enabled: false,
                    // text: data.yCol
                  }
              },
              exporting: { enabled: false },
              series: yArrays
            });
            window.plottedBasicColumn = true;
          } catch (ee) {
            Bert.alert({
              title: 'Error found when plotting basic column chart',
              message: event.message,
              type: 'danger',
              style: 'growl-top-right',
              icon: 'fa-frown-o'
            });
          }
        }


        gameSetup.activePlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_SCRIPT_PLOT_DATA,
          'world': WorldForPlayer,
          'resolveID': data.resolveID
        });

      });



    };



  };

  this.setupTestResultDisplay = () => {
    gameSetup.showTestResult = function() {
      const config = gameSetup.config;

      // if (window.testResult == "Test passed!") {
      //   Bert.alert({
      //     title: window.testResult,
      //     message: '',
      //     type: 'success',
      //     style: 'growl-bottom-right',
      //     icon: 'fa-check'
      //   });
      // } else if (window.testResult == "No challenge specified at the moment.") {
      //   Bert.alert({
      //     title: window.testResult,
      //     message: '',
      //     type: 'info',
      //     style: 'growl-bottom-right',
      //     icon: 'fa-info'
      //   });
      // } else {
      //   Bert.alert({
      //     title: window.testResult,
      //     message: '',
      //     type: 'warning',
      //     style: 'growl-bottom-right',
      //     icon: 'fa-warning'
      //   });
      // }

      if (window.recordTestAttempt) {
        window.recordTestAttempt(window.testResult);
      }


      //gameSetup.config.showMessage(window.testResult);
      gameSetup.config.showHeadline(window.testResult,2.5);

      window.submitTestResultInChat(window.testResult);

      // gameSetup.paused = true;
      gameSetup.controller.killAIPlayers();

      if (window.toggleTestButton) {
        window.toggleTestButton(false);
      }

    }
  };

  this.setupTestResultDisplayOld = () => {
    gameSetup.clearTestResult = function() {
      gameSetup.hideOverlay();
      // if (resultg) resultg.destroy();
      // if (resultmsg) resultmsg.destroy();
      // if (resultcbtn) resultcbtn.destroy();
      // if (resulttext) resulttext.destroy();
    };

    gameSetup.showTestResult = function() {
      const config = gameSetup.config;

      let res = `${window.testResult}`;
      if (window.testResult == "No test specified") {
        res = window.testResult;
      }


      gameSetup.dismissCallBack = () => {
        // gameSetup.clearTestResult();
        gameSetup.config.inExitScreen = false;

        gameSetup.gameOver = true;
        if (gameSetup.tweenF1) {
          gameSetup.tweenF1.stop();
          gameSetup.tweenB1.stop();
          gameSetup.tweenF2.stop();
          gameSetup.tweenB2.stop();
          gameSetup.inStrikeAnimation = false;
        }

        gameSetup.exitTestScreen();
      };
      gameSetup.showOverlay(res, false, false);
    };
  };

  // this.updateGameTimeClock = () => {
  //   if (true) return;
  //   if (gameSetup.gameOver) return;
  //   if (!gameSetup.allInitialized) return;
  //   if (gameSetup.gameType == GAME_TYPE.TESTING) return;
  //   const seconds = Math.round((gameSetup.countdownClockTime - gameSetup.currentCycleTime) / 1000);
  //   if (isNaN(seconds)) return;
  //   if (seconds < 0) {
  //     // times up for the shot!! switch active player!
  //     if (gameSetup.isHost) {
  //       const newactivePlayerInfoID = 0;
  //       gameSetup.networkHandler.sendCommandToAll({
  //         c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: newactivePlayerInfoID
  //       });
  //     }
  //     return;
  //   }
  //   let sign = "";
  //   if (seconds < 0) {
  //     sign = -1;
  //   }
  //   const sec = seconds % 60;
  //   const minutes = Math.round((seconds - sec) / 60);
  //   const secstr = (sec <= 9) ? `0${sec}` : sec;
  //   const minstr = (minutes <= 9) ? `0${minutes}` : minutes;
  //   const timestr = `${minstr}:${secstr}`;
  //   if (timestr != gameSetup.countdownClockStr) {
  //     gameSetup.countdownClockStr = timestr;
  //     gameSetup.countdownClockText.text = timestr;
  //   }
  // };

  this.updateCameraUsingCarPos = function (mesh, oldpos) {
    const dist = oldpos.distanceTo(mesh.position);
    const rawspeed = dist / (1 / 60);
    // console.log("oldpos " + oldpos.x + " " + oldpos.z + " new " + newpos.x + " " + newpos.z + " speed " + speed);
    // let oldspeed = mesh.speed;
    // if (!oldspeed) oldspeed = 0;
    // let newspeed = oldspeed * 0.9 + rawspeed * 0.1;
    // mesh.speed = newspeed;

    let speed = mesh.speed;
    if (Math.abs(speed) < 0.1) speed = 0;
    // convert from km/h to unit per second
    //console.log("km/h " + mesh.speedKMH + " raw " + rawspeed);

    // speedometer.innerHTML = Math.abs(mesh.speed).toFixed(1);
    //speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(2);
    gameSetup.speedText.text = `Speed: ${speed.toFixed(1)}`;

    const bpos = mesh.wheelMeshes[2].position.clone();
    bpos.add(mesh.wheelMeshes[3].position);
    bpos.divideScalar(2);
    bpos.y += 1.7;

    const fpos = mesh.wheelMeshes[0].position.clone();
    fpos.add(mesh.wheelMeshes[1].position);
    fpos.divideScalar(2);
    fpos.y += 1.7;

    const dir = fpos.clone();
    dir.sub(bpos);
    // let lookpos = fpos.clone().add(dir);
    // let campos = fpos.clone().add(dir.multiplyScalar(0.7));

    let campos = bpos.clone().add(dir.clone().multiplyScalar(-0.4));
    // campos.y = 3;

    // lookpos = fpos.clone();
    let lookpos = fpos.clone().add(dir.clone().multiplyScalar(0.2));
    // const m = 2;
    // lookpos.y = Math.floor(lookpos.y * m)/m;
    // campos.y = Math.floor(campos.y * m)/m;
    lookpos.y += 1.5;

    // let mpos = bpos.clone();
    // mpos.add(fpos);
    // mpos.divideScalar(2);
    // console.log(getMS() + " move camera by " + (campos.z - camera.position.z) + " to " + campos.z);

    camera.position.x = campos.x;
    camera.position.y = campos.y + 2.5;
    camera.position.z = campos.z;
    camera.lookAt(lookpos);


    lookpospreview.x = lookpos.x;
    lookpospreview.y = lookpos.y;
    lookpospreview.z = lookpos.z;


    // raycast to generate DM and AM map!

    // if (0 && gameSetup.ground && gameSetup.currentCycleInd > 100) {
    //     let pixelWidth = 1 / 32; // on 64x64 preview, each pixel is 1/32 when mapped to mouse vector
    //     // for (let screenx = -1 + pixelWidth; screenx < 1; screenx += pixelWidth) {
    //     //     for (let screeny = -1 + pixelWidth; screeny < 1; screeny += pixelWidth) {

    //     const car = gameSetup.allMesh["C"+gameSetup.playerID];
    //     const pos = car.position.clone();
    //     console.log("car [" + pos.x.toFixed(3) + "," + pos.z.toFixed(3) + "] " + car.angle.toFixed(3));

    //     for (let row=16; row<64; row++) {
    //         for (let col=0; col < 32; col++) {
    //             // console.log("\n\ncasting row " + row + " col " + col);
    //             let screenx = (col - 32) / 32 + 1/64;
    //             let screeny = (row - 32) / 32 + 1/64;
    //             mouseVector.x = screenx;
    //             mouseVector.y = screeny;
    //             posraycaster.setFromCamera(mouseVector, camera);
    //             let intersects = posraycaster.intersectObjects([gameSetup.ground]);
    //             //console.log("intersection: " + intersects[0].distance + " " + JSON.stringify(intersects[0].point));
    //             if (intersects.length == 0) continue;
    //             let it = intersects[0];
    //             // console.log("X: " + it.distance.toFixed(3) + " [" + it.point.x.toFixed(3) + "," + it.point.z.toFixed(3) + "] cam [" + campos.x.toFixed(3) + "," + campos.z.toFixed(3) + "]");
    //             // debugger;


    //             // relative angle from intersect point to camera
    //             let zdiff = it.point.z - pos.z;
    //             let xdiff = it.point.x - pos.x;
    //             let angleInterToCar = Math.atan2(xdiff, zdiff) / Math.PI * 180;
    //             let adiff = angleInterToCar - car.angle;
    //             if (adiff < -180) adiff += 360;
    //             if (adiff > 180) adiff -= 360;
    //             //console.log("angle  " + angleInterToCar + " diff " + (adiff));

    //             let grounddist = Math.sqrt((pos.x - it.point.x)*(pos.x-it.point.x) + (pos.z-it.point.z)*(pos.z-it.point.z));
    //             //console.log(row + " " + col + ": angle  " + adiff.toFixed(3) + " dist " + grounddist.toFixed(3));
    //             console.log("AM[\"" + (63-row) + "-" + col + "\"] = " + adiff.toFixed(2) + "; DM[\"" + (63-row) + "-" + col + "\"] = " + grounddist.toFixed(1) + ";");
    //         }
    //     }

    //     debugger;
    // }


    // rear view camera
    campos = bpos.clone().sub(dir.multiplyScalar(1.0));
    lookpos = bpos.clone().sub(dir.multiplyScalar(2.5));

    camera2.position.x = campos.x;
    camera2.position.y = campos.y;
    camera2.position.z = campos.z;

    camera2.lookAt(lookpos);
  };

  this.checkSteeringHistory = (mesh) => {
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      let steerDir = "";
      // console.log("check steering: " + mesh.steering);
      if (mesh.steering >= steeringIncrement) steerDir = "L";
      if (mesh.steering <= 0 - steeringIncrement) steerDir = "R";
      if (steerDir != "") {
        // console.log("add steerDir to history: " + steerDir);
        // record steering history
        if (!mesh.steeringHistory) {
          mesh.steeringHistory = [];
          mesh.steeringHistory.push(steerDir);
        } else {
          const lastDir = mesh.steeringHistory[mesh.steeringHistory.length - 1];
          if (lastDir != steerDir) {
            mesh.steeringHistory.push(steerDir);
          }
        }
      }

      let speedDir = "";
      // console.log("check speedDir: " + speedDir + " " + mesh.speed);
      if (mesh.speed >= 2) speedDir = "F";
      if (mesh.speed <= -2) speedDir = "B";
      if (speedDir != "") {
        // console.log("add steerDir to history: " + steerDir);
        // record steering history
        if (!mesh.speedHistory) {
          mesh.speedHistory = [];
          mesh.speedHistory.push(speedDir);
        } else {
          const lastDir = mesh.speedHistory[mesh.speedHistory.length - 1];
          if (lastDir != speedDir) {
            mesh.speedHistory.push(speedDir);
          }
        }
      }
    }
  };

  

  gameSetup.fround = (v) => {
    v.x = Math.fround(v.x);
    v.y = Math.fround(v.y);
  };

 

  const v = new Victor(0, 0);

  

  // isProb: false then update forecast, true then estimate pocket probability
  /*
    3 modes of simulation:
    1. SIM_PROB: part of a probability run with pre-specified skew so just needs to know if target is pocketd.
    2. SIM_DRAW: need to draw forecast lines with no skew
    3. SIM_ENDSTATE: similar to SIM_PROB, run with pre-specified skew, no need for drawing
  */
 

  // this.allStoppedCallback = () => {
  //   gameSetup.controller.inStrike = false;
  //   gameSetup.cueballDirection.x += 0.0001;




  //   gameSetup.controller.verifyTestResult();
  // };

  // main loop
  // let loopcnt = 0;
  this.tick = function (time) {
    if (gameSetup.inCleanUp) return;
    // if (gameSetup.inReconnect) return;
    // const newstartms = getMS();
    // if (that.startms)
    //     console.log("time since last tick " + (newstartms - that.startms).toFixed(3));
    // that.startms = newstartms;
    // const isdebug = false;
    // loopcnt++;
    gameSetup.tickHandle = requestAnimationFrame(that.tick);
    if (gameSetup.paused) return;


    const cfg = gameSetup.config;
    // gameSetup.cuestick.rotation += 0.2 / 180 * Math.PI;

    gameSetup.prevCycleTime = gameSetup.currentCycleTime;
    gameSetup.currentCycleTime = Date.now();


    gameSetup.currentCycleInd++;

    let midms1;
    let midms2;

    // that.updateGameTimeClock();

    if (!gameSetup.gameOver) {

      TWEEN.update(time);
      // gameSetup.controller.trySelectPlayer();
      if (gameSetup.gameStarted) {
        gameSetup.controller.tickUpdate();
      }
    }

    gameSetup.renderer.render(gameSetup.stage);

    // if (controlrenderer) controlrenderer.render(gameSetup.controlcontainer);
    // if (ballrenderer) ballrenderer.render(gameSetup.ballcontainer);
    // if (overlayrenderer) overlayrenderer.render(gameSetup.overlaycontainer);
    // if (overlayrenderer2) overlayrenderer2.render(gameSetup.overlaycontainer2);

    // overlayrenderer.render(gameSetup.overlaystage);
    // if (gameSetup.gameType != GAME_TYPE.TESTING) {
    //     pixicontrolrendererexit.render(gameSetup.exitStage);
    // } else {
    //     pixirenderertestresult.render(gameSetup.testResultStage);
    // }

    // gameSetup.controller.sendUpdateToRobots();

    const endms = getMS();
    // console.log("tick took time " + (endms - startms).toFixed(3) + " " + (midms1-startms).toFixed(3) + " " + (midms2-midms1).toFixed(3) + " " + (midms3 - midms2).toFixed(3));
  };

  this.handlePhoneButton = (name) => {
    gameSetup.tankControllers[gameSetup.localPlayerID].interpretOrder(name);
  };
};

export default TankWarGame;
