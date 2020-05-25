/*




*/
var Highcharts = require('highcharts');
// Load module after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);
// import regression from 'regression';
// const jsregression = require('js-regression');
import { GAME_TYPE, PLAYER_TYPE } from '../../../../../lib/enum';
import PoolActions from './poolActions.js';
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

const AllPolyBodies = [];
const processedCommands = {};
let lastProcessedCmdKey = "";
let lastProcessedIndex= -1;
const locallyExecutedCommands = {};

let printed = {world: true};

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

const deepPrint = (obj, level) => {
  if (!obj) {
    let ss = "";
    for (let j=0; j<level; j++) ss += "  ";
    console.log(ss + "null");
    return;
  }


  if (Array.isArray(obj)) {
    let ss = "";
    for (let j=0; j<level; j++) ss += "  ";
    console.log(ss + "array of length " + obj.length);
    for (let i=0; i<obj.length; i++) {
      console.log(ss + "array [" + i + "]");
      deepPrint(obj[i], level+1);
    }
    return;
  } else if (typeof(obj) != "object") {
    let ss = "";
    for (let j=0; j<level; j++) ss += "  ";
    console.log(ss + " " + obj);
    return;
  }

  Object.keys(obj).forEach((k) => {
    if (typeof(obj[k]) == "object") {
      if (printed[k]) return;
      printed[k] = true;
      let ss = "";
      for (let j=0; j<level; j++) ss += "  ";
      if (level <= 2) {
        console.log(ss + "["+k+"]: ");
        deepPrint(obj[k], level+1);
      } else {
        console.log(ss + "["+k+"]: Object");
      }
    } else {
      let ss = "";
      for (let j=0; j<level; j++) ss += "  ";
      console.log(ss + "["+k+"]: " + obj[k]);
    }
  });
};


// const regression = new jsregression.LinearRegression({
//   alpha: 0.0000001, //
//   iterations: 30000,
//   lambda: 0.0,
//   trace: true
// });

const resolvedAllStop = {};
const resolvedPlanCallShot = {};
const vcushion = 0;
const BEGINNER = 0;
const ADVANCED = 1;
// const PROFESSIONAL = 1;

const MAZE_SIZE = {
  BEGINNER: 7,
  ADVANCED: 8,
};

//const BOMB_COST = [1, 2, 3, 4, 5, 6 ];
// T: transfer, "ADDPOINTS"
// S: regenerate,
// D: dirt,
// H: Home run,
// C: clear bombs for opponent
const BOMB_NAME = ["D", "H", "C", "T", "R", "6"]; //, "0", "F", "0", "F"];
let BOMB_COST = {
  "6": 2, "R": 2, "T": 3, "C": 3, "H": 4, "D": 6
};

const TIME_OUT_SECONDS = 8;

/*3 modes of simulation:
1. SIM_PROB: part of a probability run with pre-specified skew so just needs to know if target is pocketd.
2. SIM_DRAW: need to draw forecast lines with no skew
3. SIM_ENDSTATE: similar to SIM_PROB, run with pre-specified skew, no need for drawing
*/
const SIM_PROB = 0;
const SIM_DRAW = 1;
const SIM_ENDSTATE = 2;

const WAIT_FOR_BREAK_STATE = -1;
const BREAK_SHOT_STATE = 0;
const CALL_SHOT_STATE = 1;
const CUEBALL_IN_HAND = 2;
const GAME_OVER_STATE = 3;
const BREAK_CUEBALL_IN_HAND_STATE = 4;

// cmd for communicating with webworker
const CMD_READY = -1;
const CMD_GET_COMMAND = 0;
const CMD_TEST_RUN = 6;
const CMD_SCRIPT_RESET_MAZE = 7;
const CMD_SCRIPT_REPORT_END_OF_TEST_SETUP = 24;
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

const PoolGame = {

    /* Here we've just got some global level vars that persist regardless of State swaps */
  score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
  music: null,

    /* Your game can check PoolGame.orientated in internal loops to know if it should pause or not */
  orientated: false,

  PRACTICE: GAME_TYPE.PRACTICE,
  MATCH: GAME_TYPE.MATCH,
  TESTING: GAME_TYPE.TESTING,
  TOURNAMENT: GAME_TYPE.TOURNAMENT
};


const workerCodeTemplat = `

// import { debug } from "util";



Victor.prototype.scale = function(s) {
  this.x *= s;
  this.y *= s;
  return this;
};


const GameInfo = {};
let MyID = -1;
let url = "";
let world = {};
let MyMaze, OpponentMaze;
let ROW_COUNT=0, COLUMN_COUNT=0;
const resolveProbs = {};
const resolvedPlaceCueBall = {};


function waitSeconds(s){
  return new Promise(function(resolve, reject){
    setTimeout(function () {
      // console.log("time out done ");
      resolve();
    },s * 1000);
  });
}


async function getSecondsLeft() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_GET_SECONDS_LEFT, resolveID);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID] && resolveRequests[resolveID] != 0) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    // console.log("AI: got resolveProbs!! " + resolveID);
    resolve(resolveRequests[resolveID]);
  });
};



async function UpdateWorld() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_UPDATE_WORLD, resolveID);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    resolve();
  });

};

function ReportEndOfTest(res) {
  sendCommand(CMD_SCRIPT_REPORT_END_OF_TEST, res);
};

function ReportEndOfTestSetup(res) {
  sendCommand(CMD_SCRIPT_REPORT_END_OF_TEST_SETUP, res);
};


const SetSecondsLeft = (s) => {
  sendCommand(CMD_SCRIPT_SET_SECONDS_LEFT, s);
};

const copyValues = function(w) {
  for (let k=0; k<w.maze.length; k++) {
    for (let j=0; j<w.maze[k].length; j++) {
      world.maze[k][j].d = w.maze[k][j].d;
      world.maze[k][j].t = w.maze[k][j].t;
      world.maze2[k][j].d = w.maze2[k][j].d;
      world.maze2[k][j].t = w.maze2[k][j].t;

    }
  }
};

const initWorld = function(w) {
  world = JSON.parse(JSON.stringify(w));
  PlayerInfo = world.PlayerInfo;
  ROW_COUNT = world.ROW_COUNT;
  COLUMN_COUNT = world.COLUMN_COUNT;
  // debugger;
  if (!world.maze) {
    world.maze = [];
    world.maze2 = [];
    for (let k=0; k<w.maze.length; k++) {
      world.maze.push([]);
      world.maze2.push([]);
      for (let j=0; j<w.maze[k].length; j++) {
        world.maze[k].push({c: -1});
        world.maze2[k].push({c: -1});
      }
    }
  }
  copyValues(w);
};

GameInfo.initialize = function(data) {
  // this.world = data.world;
  initWorld(data.world);

  // console.log("worker: " + data.playerID + " initialize " );
  MyID = data.playerID;
  url = data.url;
  if (data.isHost) {
    MyMaze = world.maze; OpponentMaze = world.maze2;
  } else {
    MyMaze = world.maze2; OpponentMaze = world.maze;
  }

  sendCommand(CMD_READY);
};

GameInfo.update = function(data) {
  // world = data.world;
  copyValues(data.world);
  // initWorld(data.world);
};

function getRandomDir() {
  const r = Math.random();
  if (r >= 0.75) 
    return "U";
  else if (r >= 0.5) 
    return "D";
  else if (r >= 0.25) 
    return "L";
  else 
    return "R";
}

function getRandomSticker() {
  const r = Math.random();
  if (r >= 0.9) 
    return "D";
  else if (r >= 0.72) 
    return "C";
  else if (r >= 0.54) 
    return "H";
  else if (r >= 0.36) 
    return "6";
  else if (r >= 0.18) 
    return "R";
  else 
    return "T";
}


let getNewCommand2 = function() {
  return {
    action: "SWAPTILE",
    r: 1 + Math.floor(Math.random()*(ROW_COUNT-1)),
    c: 1 + Math.floor(Math.random()*(COLUMN_COUNT-1)),
    type: getRandomDir()
  };
};

const OutOfBound = function(c, r) {
  if (c < 0 || c >= COLUMN_COUNT || r < 0 || r >= ROW_COUNT) return true;
  return false;
}

const findMatchV = function(c, r) {
  const targetType = MyMaze[c][r].d;
  let cnt = 1;
  // up
  for (let newr = r + 1; newr <= r + ROW_COUNT; newr ++) {
    if (OutOfBound(c, newr)) break;
    if (MyMaze[c][newr].d == targetType) {
      // console.log(targetType + ": c r "  + c + " " + r + " up " + c + " " + newr);
      cnt ++;
    } else
      break;
  }

  // down
  for (let newr = r - 1; newr >= r - ROW_COUNT; newr --) {
    if (OutOfBound(c, newr)) break;
    if (MyMaze[c][newr].d == targetType) {
      // console.log(targetType + ": c r "  + c + " " + r + " down " + c + " " + newr);
      cnt ++
    } else
      break;
  }
  return cnt;
}

const findMatchH = function(c, r) {
  const targetType = MyMaze[c][r].d;
  let cnt = 1;
  // right
  for (let newc = c + 1; newc <= c + COLUMN_COUNT; newc ++) {
    if (OutOfBound(newc, r)) break;
    if (MyMaze[newc][r].d == targetType) {
      // console.log(targetType + ": c r " + c + " " + r + " right " + newc + " " + r);
      cnt ++;
    } else
      break;
  }

  // left
  for (let newc = c - 1; newc >= c - COLUMN_COUNT; newc --) {
    if (OutOfBound(newc, r)) break;
    if (MyMaze[newc][r].d == targetType) {
      // console.log(targetType + ": c r "  + c + " " + r + " left " + newc + " " + r);
      cnt ++;
    } else
      break;
  }
  return cnt;
};

const SwapTile = function(c, r, newc, newr) {
  const tmp = MyMaze[c][r].d;
  MyMaze[c][r].d = MyMaze[newc][newr].d;
  MyMaze[newc][newr].d = tmp;
};

const getBestMatch = function(c, r, newc, newr) {

  SwapTile(c, r, newc, newr);
  
  // console.log("h1 c r " + c + " " + r + " " + MyMaze[c][r].d);
  const H1 = findMatchH(c, r);
  // console.log("v1 c r " + c + " " + r + " " + MyMaze[c][r].d);
  const V1 = findMatchV(c, r);

  // console.log("h2 newc newr " + newc + " " + newr + " " + MyMaze[newc][newr].d);
  const H2 = findMatchH(newc, newr);

  // console.log("v2 newc newr " + newc + " " + newr + " " + MyMaze[newc][newr].d);
  const V2 = findMatchV(newc, newr);

  SwapTile(newc, newr, c, r);
  // if (Math.max(H1, V1, H2, V2) >= 3)
  //   console.log("c r newc newr " + c + " " + r + " " + newc + " " + newr + " H1 V1 H2 V2 " + H1 + " " + V1 + " " + H2 + " " + V2);
  return Math.max(H1, V1, H2, V2);
};

// for dev only
let getNewCommand3 = function() {

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
        // console.log("try to find best " + " " + r + " " + c + " " + move.dir);
        const maxMatch = getBestMatch(c, r, newc, newr);
        if (maxMatch >= 3) {
          // console.log("---- ---- found best " + maxMatch + " r " + r + " c " + c + " dir " + move.dir);
          // for (let k=0; k<MyMaze.length; k++) {
          //   let rows = "";
          //   for (let j=0; j<MyMaze[k].length; j++) {
          //     rows += MyMaze[k][j].d + " ";
          //   }
          //   console.log("col " + k + ": " + rows);
          // }

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

 -------------



// functions available for test scripts:


async function CalculateCommand() {
  try {
    let cmd = {};
    if (typeof(getNewCommand) !== "undefined")
      cmd = await getNewCommand();
    else 
      cmd = getNewCommand2();

    // cmd = getNewCommand3(); // dev only
    sendCommand(CMD_GET_COMMAND, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when calculating new Command so do nothing', e.stack);
    
  }
}



// functions available for test scripts:


const ResetTable = function(clearTable) {
  sendCommand(CMD_SCRIPT_RESET_MAZE, clearTable);
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

var commandID = 0;
const CMD_READY = -1;
const CMD_GET_COMMAND = 0;
const CMD_TEST_RUN = 6;
// commands for test scripts
const CMD_SCRIPT_RESET_MAZE = 7;
const CMD_SCRIPT_REPORT_END_OF_TEST_SETUP = 24;

const CMD_ERROR_IN_WORKER = 100;

self.addEventListener('message', async function(e) {
  const data = JSON.parse(e.data);
  // console.log("worker received data e.data is " + data.cmd);
    let cmd = {};
    // var data = e.data; // no stringify before post?
    // console.log("e.data.cmd is " + data.cmd);
    // console.log("player on message " + data);
    switch(data.cmd) {
      case CMD_READY:
        // console.log("PoolPlayerWorker initialize "); // + JSON.stringify(e.data));
        GameInfo.initialize(data);            
        break;
      case CMD_GET_COMMAND:
        GameInfo.update(data);
        await CalculateCommand();
        break;
      case CMD_GET_SECONDS_LEFT: 
        GameInfo.update(data);
        //resolve promise so that webworker can use the probability
        // console.log("AI: got probability back! resolveID " + data.resolveID + " prob: " + data.probability);
        resolveRequests[data.resolveID] = data.secondsLeft;
        break;
      case CMD_TEST_RUN:
        GameInfo.update(data);
        testRun();
        break;
      case CMD_SCRIPT_UPDATE_WORLD:
        GameInfo.update(data);
        resolveRequests[data.resolveID] = 1;
        break;
      default:
        console.log("unknown message received in player worker: " + JSON.stringify(data));
    }
}, false); // [useCapture = false]


var sendCommand  = function (cmdType, param1, param2, param3, param4, param5) {
  commandID ++;
  const cmdID = MyID + "_" + commandID;
  // console.log("player id " + MyID + " sending command " + cmdType + " " + JSON.stringify(param1));
  // debugger;
  switch(cmdType) {
    case CMD_READY:
      self.postMessage({
          'cmdID': MyID + "_" + commandID,
          'playerID': MyID,
          'cmdType': cmdType
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

    case CMD_ERROR_IN_WORKER:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'cmdType': cmdType,
        'message': param1,
        'stack': param2
      });
      break;

    case CMD_GET_SECONDS_LEFT:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1,
      });
      break;
    case CMD_SCRIPT_RESET_MAZE:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'clearTable': param1
      });
      break;
    case CMD_SCRIPT_UPDATE_WORLD:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1
      });
      break;
    case CMD_SCRIPT_REPORT_END_OF_TEST:
    case CMD_SCRIPT_REPORT_END_OF_TEST_SETUP:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'result': param1
      });
      break;
    case CMD_SCRIPT_SET_SECONDS_LEFT:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'secondsLeft': param1
      });
      break;      
    default:
      // debugger;
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'playerID': MyID,
          'cmdType': cmdType,
          'cmd': param1
      });
      console.log("unknown command from fsm but we send anyways " + JSON.stringify(param1));
      break;
  }
};







`;

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

const getCleanTestCode = (oldCode) => {
  // console.log("get clean test code " + oldCode);
  if (!oldCode) return "";
  let cleanTestSetupCode = "";
  const p = oldCode.split("\n");
  for (let k = 0; k < p.length; k++) {
    if (p[k].indexOf("ResetTable") >= 0) {
      cleanTestSetupCode += `${p[k]}\n`;
    }
    if (p[k].indexOf("TakeBreakShot") >= 0 || p[k].indexOf("TakeCallShot") >= 0) {
      break;
    }
    if (p[k].indexOf("PlaceBallOnTable") >= 0) {
      const q = p[k].replace("PlaceBallOnTable", "").replace("Math.floor", "").replace("Math.random", "").split(/[\s,\*\+\(\);]+/);
      let allNumber = true;
      for (let j=0; j < q.length; j++) {
        if (q[j] === '') continue;
        if (isNaN(q[j])) {
          allNumber = false; break;
        }
      }
      if (allNumber)
        cleanTestSetupCode += `${p[k]}\n`;
    }
  }
  // console.log("\n\nget clean test code new " + cleanTestSetupCode);
  cleanTestSetupCode += `\nReportEndOfTestSetup();`;
  return cleanTestSetupCode;
};



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
function NetworkHandler(GameEngine, allLocal) {
  const gameSetup = GameEngine.gameSetup;
  const peer = gameSetup.peer;
  const isHost = gameSetup.isHost;
  const that = this;
  // for now assume just one peer

  if (gameSetup.isHost) {
    this.mapSent = false;
  }
  if (!allLocal) {
    gameSetup.peer = {};
    // console.log("NetworkHandler not all local!!");
    if (gameSetup.isHost) {
      // for (let j = 1; j < gameSetup.playerCount; j++) {
      //   const p = gameSetup.allPeers[j];
      //   p.peerLag = 0;
      //   p.peerLags = [];
      // }
      // const p = gameSetup.peer;
      // p.peerLag = 0;
      // p.peerLags = [];

    } else {
      // gameSetup.peerLag = 0;
      // gameSetup.peerLags = [];
      // const p = gameSetup.allPeers[gameSetup.playerID];
      // const p = gameSetup.peer;
      // p.peerLag = 0;
      // p.peerLags = [];
    }
  }

  let lastLocalKeyDown = 0;
  let currentCommand = "";




  this.sendCommandToAll = function (cmd) {
    if (cmd.c != "UT" && cmd.c != "KA") {
      // console.log("new send command to all " + JSON.stringify(cmd));
    }

    if (allLocal && gameSetup.gameType != GAME_TYPE.AUTORUN ) {
      // console.log("all local!!");
      this.executeCommandLocallyImmediately(cmd, 0);
      return;
    }

    const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    if (1 || (cmd.c != "UT" && cmd.c != "KA")) {

      // execute locally first, and remember we have done it
      locallyExecutedCommands[cmd.c + ";" + cmd.w] = 1;
      this.executeCommandLocallyImmediately(cmd, 0);

      Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
    } else {

    }

    if (allLocal && gameSetup.gameType == GAME_TYPE.AUTORUN ) {
      // console.log("all local!!");
      this.executeCommandLocallyImmediately(cmd, 0);
      return;
    }



    // send to all peers, including myself!
    if (!gameSetup.peerReady) return;

    // console.log("send command to all " + JSON.stringify(cmd));
    // TODO: when more than one peer, may need to delay the faster peer by some lag difference as well
    // this.sendCommandToPeerImmediately(cmd);

    // no need to specify lag since we'll play out using timestamp??
    // cmd.allData = `${cmd.c};${cmd.t};${cmd.w}`;
    // this.executeCommandLocallyImmediately(cmd, 0);
  };


  // only at non host
  // this.sendEchoToHost = function (timestamp) {
  //   // const p = gameSetup.allPeers[gameSetup.playerID];
  //   const p = gameSetup.peer;
  //   p.dosend(`ECHO;${timestamp};${gameSetup.playerID}`);
  // };



  this.sendAllBallStopped = function () {
    // const p = gameSetup.allPeers[gameSetup.playerID];
    const p = gameSetup.peer;
    // new: also send out all the ball positions on table
    // if (gameSetup.gameType == GAME_TYPE.AUTORUN)
    //   this.saveAllBallStoppedCommand();

    let posStr = gameSetup.getPosStr();
    // let posStr = "";
    // for (let k=1; k<gameSetup.balls.length; k++) {
    //   const b = gameSetup.balls[k];
    //   if (!b.inPocketID || b.inPocketID == null)
    //     posStr += `${b.ID}_${b.x}_${b.y}|`;
    // }

    // posStr += gameSetup.playerInfo[0].chosenColor ? gameSetup.playerInfo[0].chosenColor : -1;
    // posStr += "|";
    // posStr += gameSetup.playerInfo[1].chosenColor ? gameSetup.playerInfo[1].chosenColor : -1;
    // posStr += "|";


    const cmdstr = `ALLBALLSTOPPED;${Date.now()};${gameSetup.playerID};${posStr}`;
    Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);

    // if (!p) {
    //   gameSetup.cmdHistory.push(cmdstr);
    //   return;
    // }
    // p.dosend(cmdstr);
  };

  // this.sendGameInitialized = function () {
  //   // const p = gameSetup.allPeers[gameSetup.playerID];
  //   const p = gameSetup.peer;
  //   p.dosend(`GAMEINIT;${Date.now()};${gameSetup.playerID}`);
  // };
  // this.sendReadyToHost = function () {
  //   // const p = gameSetup.allPeers[gameSetup.playerID];
  //   const p = gameSetup.peer;
  //   p.dosend(`PEERREADY;${Date.now()};${gameSetup.playerID}`);
  // };

  // send car order from user input on remote client to host
  // this.sendCOToHostImmediately = function (order) {

  //   // const p = gameSetup.allPeers[gameSetup.playerID];
  //   const p = gameSetup.peer;
  //   const cmdstr = `${order.c};${order.t};${order.w}`; // + ";"  + cmd.nt + ";" + cmd.nr + ";" + cmd.nc + ";"  + cmd.nnr + ";" + cmd.nnc;
  //   // if (DODEBUG) console.log("send order to peer at " + Date.now() + ": " + cmdstr);
  //   p.send(cmdstr);
  // };


  // for pool game doesn't have to be host!
  this.sendCommandToPeerImmediately = function (cmd) {
    // if (!gameSetup.isHost) {
    //   debugger;
    //   return;
    // }
    this.sendCommandToAll(cmd);
    return;

    const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    // if (DODEBUG) console.log("sendCommandToPeer at " + Date.now() + ": " + cmdstr);

    const p = gameSetup.peer;
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

  this.executeCommandLocallyImmediately = function (cmd, lag) {
    if (gameSetup.gameOver) return;
    const cmdkey = cmd.c + " " + cmd.t + " " + cmd.w;
    // if (cmdkey.indexOf("UT") < 0 && cmdkey.indexOf("KA") < 0)
    //   console.log("received cmd " + cmdkey);
    if (processedCommands[cmdkey]) return;
    processedCommands[cmdkey] = 1;

    let p = [];
    let controllerID = 0;
    if (cmd.w.split && gameSetup.mazeControllers && cmdkey.indexOf("UT") < 0 && cmdkey.indexOf("KA") < 0) {
      p = cmd.w.split("_");
      controllerID = p[0];
      if (gameSetup.isLocal || gameSetup.isHost) {

      } else {
        controllerID = 1 - Number(p[0]);
      }
      let mazeController = gameSetup.mazeControllers[controllerID];
      // if (mazeController && mazeController.pinfo && cmdkey.indexOf("UT") < 0 && cmdkey.indexOf("KA") < 0)
      //   console.log(cmdkey + " my points are " + mazeController.pinfo.points);
    }

    // bbbbb
    // if (cmd.c == "PROCESS_MATCHES_REMOET" && p[0] == gameSetup.localPlayerID) {
    //   return;
    // }

    cmd.executed = false;
    if (cmd.c == "NewActivePlayerInfo") {
      // if (!gameSetup.sounds.backgroundmusic.isPlaying()) {
      //   gameSetup.sounds.backgroundmusic.play();
      // }
      // console.log("received NewActivePlayerInfo " + cmd.w + " " + cmd.t);
      setTimeout(() => {
        // console.log("execute NewActivePlayerInfo " + cmd.w + " " + cmd.t);
        if (gameSetup && gameSetup.controller)
          gameSetup.controller.setActivePlayerInfo(cmd.w);
      }, 600);
    } else if (cmd.c == "StartTimeOutMode") {
      console.log("------------enter timeout mode!!!");
      gameSetup.inTimeoutMode = true;
    } else if (cmd.c == "NewRequest") {
      const order = {
        action: p[1], r: p[2], c: p[3], type: p[4]
      };
      let mazeController = gameSetup.mazeControllers[controllerID];
      if (order.action == "USESTICKER") { // need to flip ID since this is meant for opponent maze
        mazeController = gameSetup.mazeControllers[1 - controllerID];
      }
      mazeController.addNewRequest(order);

    } else if (cmd.c == "WINNER") {
      // gameSetup.gameOver = true;
      let winnerID = Number(cmd.w);
      if (gameSetup.isLocal || gameSetup.isHost) {

      } else {
        winnerID = 1 - winnerID;
      }
      gameSetup.showEndOfGame(winnerID);
    } else if (cmd.c == "PROCESS_MATCHES_REMOET") {
      const mazeController = gameSetup.mazeControllers[1];
      mazeController.processRemoteMatch(cmd.w);
    } else if (cmd.c == "RequestAddBombs") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (mazeController.isOwner) {
        // gameSetup.networkHandler.sendCommandToAll({ c: "DoAddBombs", t: gameSetup.currentCycleTime, w: mazeController.playerID + "_" + p[1]});
        if (!mazeController.pendingDoAddBombs)
          mazeController.pendingDoAddBombs = p[1];
        else {
          mazeController.pendingDoAddBombs += p[1];
        }
      }
    } else if (cmd.c == "DoAddBombs") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      mazeController.actuallyDoAddBombs(p[1], mazeController);
      // if (!mazeController.container.inSwap) {
      //   mazeController.actuallyDoAddBombs(p[1], mazeController);
      // } else {
      //   if (!mazeController.pendingDoAddBombs)
      //     mazeController.pendingDoAddBombs = p[1];
      //   else {
      //     mazeController.pendingDoAddBombs += p[1];
      //   }
      // }

    } else if (cmd.c == "REQUESTCLEARBOMBS") {
      // const p = cmd.w.split("_");
      let controllerID = cmd.w;
      if (gameSetup.isLocal || gameSetup.isHost) {

      } else {
        controllerID = 1 - Number(cmd.w);
      }
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (mazeController.isOwner) {
        gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (mazeController.playerID) + "_CLEARBOMBS"});
        //gameSetup.networkHandler.sendCommandToAll({ c: "DoClearBombs", t: gameSetup.currentCycleTime, w: cmd.w });
      }
    } else if (cmd.c == "DoClearBombs") {
      // const p = cmd.w.split("_");
      let controllerID = cmd.w;
      if (gameSetup.isLocal || gameSetup.isHost) {

      } else {
        controllerID = 1 - Number(cmd.w);
      }
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (!mazeController.container.inSwap) {
        mazeController.actuallyDoClearBombs(mazeController);
      } else {
        mazeController.pendingDoClearBombs = true;
      }


    } else if (cmd.c == "REQUESTUSESTICKER") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (mazeController.isOwner) {
        gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: cmd.w});
      }

    } else if (cmd.c == "REQUESTCLEARCRYSTALS") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (mazeController.isOwner) {
        const p2 = cmd.w.split("_");
        gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (mazeController.playerID) + "_CLEARCRYSTALS_" + p2[1]});
      }
    } else if (cmd.c == "DoClearCrystals") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (!mazeController.container.inSwap) {
        mazeController.actuallyDoClearCrystals(mazeController, p[1]);
        setTimeout(() => {
          if (gameSetup.fillDownCrystals) gameSetup.fillDownCrystals(mazeController.container, 0);
        }, 300);

      } else {
        if (!mazeController.pendingDoClearCrystals)
          mazeController.pendingDoClearCrystals = p[1];
        else {
          mazeController.pendingDoClearCrystals += "_" + p[1];
        }
      }

    } else if (cmd.c == "ADDPOINTS") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      gameSetup.adjustTotalPoints(mazeController.pinfo, Number(p[1]));

    } else if (cmd.c == "PLAYER_ACTION") {
      const mazeController = gameSetup.mazeControllers[controllerID];
      if (!gameSetup.isLocal && !mazeController.isOwner) {
        gameSetup.inRemoteOperation = true;
      }
      // only the true owner controller of the maze can execute order
      // the other should only reflect result of the order
      // if (mazeController.isOwner) {
        const order = {
          action: p[1], r: p[2], c: p[3], type: p[4], tilemap: p[5]
        };
        mazeController.executeOrder(order);
      // }



    } else if (cmd.c == "InitMaze") {
      // console.log('in cmd InitMaze');
      // if (!gameSetup.isHost) {
        // console.log("guest received InitMaze " + cmd.w);
        gameSetup.maze = [];
        gameSetup.tilemap = cmd.w;
        const parts = gameSetup.tilemap.split(":");

        for (let k=0; k<parts.length; k++) {
          if (parts[k].length > 0) {
            const row = [];
            gameSetup.maze.push(row);
            const digit = parts[k] + "";
            for (let j=0; j<gameSetup.config.TileCols; j++) {
              row.push(Number(digit.substring(j, j+1)));
            }
          }
        }
      // }

      gameSetup.mazeC = []; // maze by columns
      for (let k=0; k<gameSetup.config.TileCols; k++) {
        const onecol = [];
        gameSetup.mazeC.push(onecol);
        for (let j=0; j<gameSetup.config.TotalRandomRows; j++) {
          onecol.push(gameSetup.maze[j][k]);
        }
      }

      GameEngine.setupUsingMaze();
      // if (gameSetup.setupTbotMessage) {
      //   gameSetup.setupTbotMessage();
      // }

    } else if (cmd.c == "QuitGameRoomWithIssue") {
      console.log("QuitGameRoomWithIssue received!");
      // gameSetup.sounds.backgroundmusic.stop();
      //gameSetup.showModalMessage(`Game Terminated`, `Player ${cmd.w} ${gameSetup.playerInfo[cmd.w].playerID}'s computer is having slowness issue.`, MODAL_NOBUTTON);
      gameSetup.showModalMessage(`Game Terminated`, cmd.w, MODAL_NOBUTTON);

      let waitS = 6000;

      // if (Meteor.userId() !== gameSetup.playerInfo[cmd.w].userId) {
      //   waitS = 10000;
      // }
      setTimeout(() => {
        if (gameSetup && gameSetup.exitGame)
          gameSetup.exitGame();
      }, waitS);

    } else if (cmd.c == "ExitGameRoom") {
      // bbbbb testing
      // return;
      // console.log("ExitGameRoom received from " + cmd.w);
      // gameSetup.sounds.backgroundmusic.stop();
      gameSetup.showModalMessage(`Exiting Game Room`, `Player ${gameSetup.playerInfo[cmd.w].username} has chosen to exit the game room.`, MODAL_NOBUTTON);

      let waitS = 3000;

      if (Meteor.userId() !== gameSetup.playerInfo[cmd.w].userId) {
        waitS = 5000;
      }
      if (gameSetup.gameType == GAME_TYPE.PRACTICE ) {
        waitS = 1000;
      } else if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
        waitS = 100;
      }
      setTimeout(() => {
        if (gameSetup && gameSetup.exitGame)
          gameSetup.exitGame();
      }, waitS);


    } else if (cmd.c == "UT") {
      // const p = cmd.w.split("_");
      gameSetup.updateTimer(cmd.w);


    } else if (cmd.c == "ShowMessage") {
      gameSetup.config.showMessage(cmd.w);
    } else if (cmd.c == "COUNTDOWN") {
      GameEngine.showCountDown(cmd.w);
    } else if (cmd.c == "GAMEOVER") {
      GameEngine.showGameOver(cmd.w);
    } else if (cmd.c == "KA") {

      const p = cmd.w.split("_");
      if (p.length > 1) {
        // remote preview
        if (!gameSetup.activePlayerInfo.isLocal) {
          // show preview
          if (!gameSetup.previewDir) {
            gameSetup.previewDir = new Victor(0, 0);
          }
          gameSetup.previewStrength = Number(p[2]);
          gameSetup.previewDir.x = Number(p[3]);
          gameSetup.previewDir.y = Number(p[4]);
          gameSetup.previewSpinMultiplier = Number(p[5]);
          gameSetup.previewHSpin = Number(p[6]);
          gameSetup.previewBallID = Number(p[7]);
          gameSetup.previewPocketID = Number(p[8]);
          gameSetup.runForecast(gameSetup.previewStrength, gameSetup.previewDir, gameSetup.previewSpinMultiplier, gameSetup.previewHSpin, gameSetup.previewBallID, gameSetup.previewPocketID);

        }
      }

    } else {
      console.log("executeCommandLocallyImmediately executeCommand " + JSON.stringify(cmd));
      debugger;
      // gameSetup.allObjects[cmd.w].controller.executeCommand(cmd);
    }
  };

  // let echoCount = 0;
  // dispatch data to the approprirate controller!
  this.handleWTCData = function (data) {
    // if (data.indexOf("KA") < 0 && data.indexOf("UT") < 0)
    //   console.log(" handle new wtc data " + data);
    // if (data.indexOf('LASTGOODCOMMAND') < 0) {
    //   gameSetup.cmdReceiveHistory.push(data);
    //   gameSetup.cmdReceiveHistoryT.push(Date.now());
    // }
    const p = data.split(";");
    const cmd = {
      c: p[0], t: Number(p[1]), w: p[2]
    };
    if (p[3]) {
      cmd.param = p[3];
    }
    cmd.allData = data;

    // if (cmd.c == "LASTGOODCOMMAND") {
    //   // this is the list of timestamps for all commands received by opponent

    //   if (cmd.w == "-1") {
    //     for (let j=0; j <=gameSetup.cmdHistory.length-1; j++) {
    //       console.log("* * **       * resending past command " + j + " " + gameSetup.cmdHistory[j]);
    //       gameSetup.peer.send(gameSetup.cmdHistory[j]);
    //     }
    //   } else {
    //     const allTimeStamps = cmd.w.split("|");

    //     // find all timestamp missing in allTimeStamps and resend it
    //     for (let k=gameSetup.cmdHistory.length-1; k >= 0; k--) {
    //       const p2 = gameSetup.cmdHistory[k].split(';');
    //       if (gameSetup.cmdHistory[k].indexOf("UT") >= 0) {
    //         continue;
    //       }
    //       if (gameSetup.cmdHistory[k].indexOf("KA") >= 0) {
    //         continue;
    //       }
    //       let found = false;

    //       for (let x = 0; x < allTimeStamps.length; x++) {
    //         const c = allTimeStamps[x];
    //         // console.log("compare last good commmand " + lastStamp + " with " + k + " " + p2[1] + " " + gameSetup.cmdHistory[k]);
    //         if (p2[1] == c) {
    //           found = true;
    //           break;
    //         }
    //       }
    //       if (!found) {
    //         gameSetup.peer.send(gameSetup.cmdHistory[k]);
    //         console.log("* * **       * resending past command " + k + " " + gameSetup.cmdHistory[k]);
    //       }
    //     }
    //   }
    //   return;
    // }

    if (!isHost) {
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
        const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
        if (!locallyExecutedCommands[cmd.c + ";" + cmd.w]) {
          this.executeCommandLocallyImmediately(cmd, 0);
        }
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

// // all commands are run in any time and take effect on next tween loop event callback
// // tween.onRepeat.add(onLoop, this);
// ObjectController.prototype.runcommands = function() {
//     if (this.commands.length == 0) return;
//     const now = Date.now();
//     // execute all commands if runt < now
//     let executedID = -1;
//     let foundUnexecuted = false;
//     for (let k=0; k < this.commands.length; k++) {
//         const cmd = this.commands.get(k);
//         // console.log("in runcommands " + JSON.stringify(cmd));
//         if (cmd.executed) {
//             if (!foundUnexecuted) {
//                 executedID = k;
//             }
//             continue;
//         } else {
//             foundUnexecuted = true;
//             if (cmd.runt < now) {
//                 cmd.executed = true;
//                 this.executeCommand(cmd);
//             }
//         }
//     }
//     // trim
//     for (let k=0; k<=executedID; k++) {
//         this.commands.shift();
//     }
// };


ObjectController.prototype.executeCommand = function (cmd) {
  console.log("ObjectController: no implementation found for  " + JSON.stringify(cmd));
  debugger;
};





function MazeController(gameSetup, playerID, container) {
  this.gameSetup = gameSetup;
  this.container = container;
  container.mazeController = this;
  this.playerID = playerID;
  this.pinfo = gameSetup.playerInfo[playerID];
  this.pinfo.controller = this;
  this.pendingRequests = [];
  this.isHandlingRequest = false;
  if (this.gameSetup.isLocal) {
    this.isOwner = true;
  } else {
    if (this.gameSetup.isHost) {
      this.isOwner = playerID == 0;
    } else {
      this.isOwner = playerID == 1;
    }
  }

};


MazeController.prototype.addNewRequest = function(order) {
  // if (this.gameSetup.inTimeoutMode) {
  //   if (order.action == "SWAPTILE" || order.action == "USESTICKER" ) {
  //     return;
  //   }
  // }
  this.pendingRequests.push(order);
};


MazeController.prototype.handleNextRequest = function() {
  if (this.isHandlingRequest) return;
  if (this.pendingRequests.length == 0) return;

  const r = this.pendingRequests.shift();
  // console.log("controller " + this.playerID  + " is handling request " + JSON.stringify(r));

  if (r.action == "SWAPTILE") {
    this.isHandlingRequest = true;
    this.executeOrder(r);
    return;
  }

  if (r.action == "USESTICKER") {
    // not blocking at all, so no need to set isHandlingRequest!
    const order = {
      type:r.type, r: r.r, c: r.c
    };
    this.doPlaceBomb(order);
    return;
  }

  if (r.action == "REGENERATE") {
    gameSetup.regenerateCrystals(this.container, r.r);
    this.container.showMsg("All crystals regenerated at random.");
    return;
  }

  if (r.action == "TIMEPAUSE") {
    gameSetup.startTimeout(this.container);
    this.container.showMsg("No input for " + TIME_OUT_SECONDS + " seconds.");
    return;
  }

  if (r.action == "CLEARBOMBS") {
    this.actuallyDoClearBombs(this);
    this.container.showMsg("All magic tags cleared.");
    return;
  }

  if (r.action == "CLEARCRYSTALS") {
    this.isHandlingRequest = true;
    const d = r.r; // r is the second part of the cmd key
    this.actuallyDoClearCrystals(this, d);
    if (d == 1) tt = "green";
    if (d == 2) tt = "red";
    if (d == 3) tt = "purple";
    if (d == 4) tt = "orange";
    if (d == 5) tt = "white";
    if (d == 6) tt = "cyan";
    if (d == 7) tt = "gold";
    if (d == 8) tt = "emarald";
    this.container.showMsg("All " + tt + " crystals are collected.");

    setTimeout(() => {
      if (gameSetup.fillDownCrystals) gameSetup.fillDownCrystals(this.container, 0);
    }, 300);

    return;
  }


};


MazeController.prototype.encodeMaze = function() {
  let tilemap = "";
  const gameSetup = this.gameSetup;
  const cfg = this.gameSetup.config;


  let map = "";
  const crs = this.container.crystals;
  for (let c=0; c<gameSetup.config.TileCols; c++) {
    let newnum = "";
    for (let r=0; r < cfg.TileRows; r++) {
      newnum += crs[c][r].digit;
    }
    if (map == "") {
      map = newnum;
    } else {
      map = map + ":" + newnum;
    }
  }

  let bombs = "";
  for (let c=0; c<gameSetup.config.TileCols; c++) {
    for (let r=0; r < cfg.TileRows; r++) {
      if (crs[c][r].childBomb) {
        let bombstr = crs[c][r].childBomb.bombType + "-" + c + "-" + r;
        if (bombs == "") {
          bombs = bombstr;
        } else {
          bombs = bombs + ":" + bombstr;
        }
      }
    }
  }

  tilemap = map + "&" + bombs + "&" + this.pinfo.points;
  return tilemap;
};

MazeController.prototype.decodeMaze = function(tilemap) {
  const maze = [];
  const sections = tilemap.split("&");
  const cfg = this.gameSetup.config;
  const parts = sections[0].split(":");
  for (let k=0; k<parts.length; k++) {
    if (parts[k].length > 0) {
      const col = [];
      maze.push(col);
      const digit = parts[k] + "";
      for (let j=0; j<gameSetup.config.TileRows; j++) {
        col.push(Number(digit.substring(j, j+1)));
      }
    }
  }

  // bombs
  // H-2-3:6-3-4
  const parts2 = sections[1].split(":");
  const bombs = {};
  for (let k=0; k<parts2.length; k++) {
    if (parts[k].length > 0) {
      const p = parts2[k].split("-");
      bombs[p[1] + "-" + p[2]] = p[0];
    }
  }

  // update crystals in container
  const crs = this.container.crystals;
  const mainItem = this.gameSetup.mainItems.find(item => item.userId === Meteor.userId());
  const resource = mainItem.imageSrc.main;

  for (let c=0; c<gameSetup.config.TileCols; c++) {
    for (let r=0; r < cfg.TileRows; r++) {
      const cr = crs[c][r];
      let newdigit = maze[c][r];
      if (cr.digit != newdigit) {
        cr.digit = newdigit;
        if (cr.digit == 9) {
          cr.setTexture(PIXI.loader.resources[`/images/Crystals/PNG/Dirt.png`].texture);
          cr.scale.x = gameSetup.config.TileSizeW / 340;
          cr.scale.y = gameSetup.config.TileSizeW / 340;
        } else {
          if (newdigit == 8) newdigit = 12;
          if (newdigit == 6) newdigit = 9;
          if (newdigit == 7) newdigit = 8;
          if (PIXI.loader.resources[`${resource}${newdigit}.png`]) {
            cr.setTexture(PIXI.loader.resources[`${resource}${newdigit}.png`].texture);
          } else {
            cr.setTexture(PIXI.loader.resources[`/images/Crystals/PNG/${newdigit}@2x.png`].texture);
          }
        }
      }
      const bombtype = bombs[c + "-" +r];
      if (!bombtype) {
        if (cr.childBomb) {
          cr.removeChild(cr.childBomb);
          delete cr.childBomb;
        }
      } else {
        if (!cr.childBomb) {
          this.doPlaceBomb({
            c, r, type: bombtype
          });
        } else if (cr.childBomb.bombType != bombtype) {
          this.doPlaceBomb({
            c, r, type: bombtype
          });
        }
      }
    }
  }

  const pointsamount = Number(sections[2]);
  if (pointsamount != this.pinfo.points) {
    this.pinfo.addPoints(pointsamount - this.pinfo.points);
  }
};

MazeController.prototype.initOrder = function(order) {
  let w = `${this.playerID}_${order.action}_${order.r}_${order.c}_${order.type}`;

  // if (order.action == "USESTICKER") {
  //   // just need to send the request to the opponent's controller
  //   const t = {
  //     bombType: order.type
  //   };
  //   t.starCost = BOMB_COST[t.bombType];
  //   const container = this.container;
  //   if (container.visibleStarCount < t.starCost) {
  //     return;
  //   }
  //   // const container2 = this.container == gameSetup.mazeContainer ? gameSetup.mazeContainer2 : gameSetup.mazeContainer;
  //   container.changeStars(0 - t.starCost);

  //   let bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
  //   let bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
  //   let bombrc = bombr + ":" + bombc;
  //   // make sure no bomb is already at that location
  //   let oppoContainer = gameSetup.mazeContainer2;
  //   if (this.container == gameSetup.mazeContainer2) {
  //     oppoContainer = gameSetup.mazeContainer;
  //   }

  //   let cnt = 0;
  //   while (oppoContainer.crystals[bombc][bombr].childBomb) {
  //     cnt ++;
  //     if (cnt > 100) break;
  //     bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
  //     bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
  //     bombrc = bombr + ":" + bombc;
  //   }

  //   let newbombs = t.bombType + ":" + bombrc + "-";

  //   gameSetup.networkHandler.sendCommandToAll({ c: "RequestAddBombs", t: gameSetup.currentCycleTime, w: (1-container.mazeController.playerID) + "_" + newbombs});

  //   return;
  // }

  if (!this.gameSetup.isLocal ) {
    // also add the whole maze with bomb info to it!
    w += "_" + this.encodeMaze(this.container);
  }
  gameSetup.networkHandler.sendCommandToAll({
    c: "PLAYER_ACTION", t: gameSetup.currentCycleTime, w: w
  });
};


MazeController.prototype.allowPlaceBomb = function() {
  if (!this.pendingBombOrder) return;
  const order = this.pendingBombOrder;
  this.pendingBombOrder = null;

  let w = `${this.playerID}_${"ALLOWPLACEBOMB"}_${order.r}_${order.c}_${order.type}`;
  gameSetup.networkHandler.sendCommandToAll({
    c: "PLAYER_ACTION", t: gameSetup.currentCycleTime, w: w
  });
}





MazeController.prototype.actuallyDoClearCrystals = (controller, clearType) => {
  const container = controller.container;
  container.inSwap = true;

  const p = clearType.split("_");
  const targetDs = [];
  for (let n=0; n<p.length; n++) {
    targetDs.push(Number(p[n]));
  }
  let totalpoints = 0;
  delete controller.pendingDoClearCrystals;

  // all cancelled are 3 points each for home run
  const points = 3;
  for (let k=0; k<gameSetup.config.TileCols; k++) {
    // move invisible tiles in this column to the outside
    const column = container.crystals[k];
    for (let j=0; j<gameSetup.config.TileRows; j++) {
      const cr = column[j];
      if (targetDs.includes(cr.digit)) {

        gameSetup.addCancelEffect(container, cr.position.x, cr.position.y);
        gameSetup.showPoints(points+"", cr.position.x + container.position.x, cr.position.y + container.position.y);

        cr.visible = false;
        // also delete any bomb on it!
        if (cr.childBomb) {
          cr.removeChild(cr.childBomb);
          delete cr.childBomb;
        }
      }
    }
  }


  gameSetup.adjustTotalPoints(controller.pinfo, totalpoints);
}


MazeController.prototype.actuallyDoClearBombs = (controller) => {
  // delete controller.pendingDoClearBombs;
  // delete controller.pendingDoAddBombs;

  for (let k=0; k<gameSetup.config.TileCols; k++) {
    // move invisible tiles in this column to the outside
    const column = controller.container.crystals[k];
    for (let j=0; j<gameSetup.config.TileRows; j++) {
      const cr = column[j];
      if (cr.childBomb) {
        cr.removeChild(cr.childBomb);
        delete cr.childBomb;
      }
    }
  }
}


MazeController.prototype.actuallyDoAddBombs = (bomblist, controller) => {
  delete controller.pendingDoAddBombs;

  const bombs = bomblist.split("-");
  for (let k=0; k<bombs.length; k++) {
    const cmd = bombs[k].trim();
    if (cmd != "") {
      const p = cmd.split(":");
      const order = {
        type: p[0], r: p[1], c: p[2]
      };
      controller.doPlaceBomb(order);
    }
  }
}

MazeController.prototype.doPlaceBomb = function(order) {
  // add a new bomb that's child of this crystal c
  const c = this.container.crystals[order.c][order.r];
  if (c.digit == 9) {
    return;
  }
  if (c.childBomb) {
    // overwrite previous existing bomb
    c.removeChild(c.childBomb);
    delete c.childBomb;
  }
  let tt = order.type;
  // if (tt == "T" && this.container == this.gameSetup.mazeContainer) {
  //   tt = "Q";
  // }
  const b = new PIXI.Sprite(PIXI.loader.resources["/images/Bomb_" + tt + "3.png"].texture);
  b.bombType = order.type;
  b.scale.set(0.72);
  b.position.x = 0;
  b.position.y = 0;

  b.anchor.set(0.5, 0.5);
  c.addChild(b);
  c.childBomb = b;
}


MazeController.prototype.executeOrder = function(order) {
  const gameSetup = this.gameSetup;

  // if (!gameSetup.isLocal && !this.isOwner) {
  //   // reinitialize map!
  //   this.decodeMaze(order.tilemap);
  // }

  if (order.action == "SWAPTILE") {
    const c = this.container.crystals[order.c][order.r];
    if (c.digit == 9) {
      this.isHandlingRequest = false;
      return;
    }

    let target = null;

    if (order.type == "R") {
      // swap to right
      if (!c.parentContainer.crystals[c.c + 1] || !c.parentContainer.crystals[c.c + 1][c.r]) {
        debugger;
      }
      target = c.parentContainer.crystals[c.c + 1][c.r];

    } else if (order.type == "L") {
      // swap to left
      if (!c.parentContainer.crystals[c.c - 1] || !c.parentContainer.crystals[c.c - 1][c.r]) {
        debugger;
      }
      target = c.parentContainer.crystals[c.c - 1][c.r];
    } else if (order.type == "D") {
      // swap to down
      if (!c.parentContainer.crystals[c.c][c.r-1]) {
        debugger;
      }

      target = c.parentContainer.crystals[c.c][c.r-1];
    } else if (order.type == "U") {
      // swap to up
      if (!c.parentContainer.crystals[c.c][c.r+1]) {
        debugger;
      }
      target = c.parentContainer.crystals[c.c][c.r+1];
    }

    if (target.digit == 9) {
      this.isHandlingRequest = false;
      return;
    }

    target.dragging = false;
    gameSetup.swapCrystals(c, target);
  } else if (order.action == "USESTICKER") {
    // const t = {
    //   bombType: order.type
    // };
    // t.starCost = BOMB_COST[t.bombType];
    // const container = this.container;
    // if (container.visibleStarCount < t.starCost) {
    //   return;
    // }
    // // const container2 = this.container == gameSetup.mazeContainer ? gameSetup.mazeContainer2 : gameSetup.mazeContainer;
    // container.changeStars(0 - t.starCost);

    // let bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
    // let bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
    // let bombrc = bombr + ":" + bombc;
    // // make sure no bomb is already at that location
    // let oppoContainer = gameSetup.mazeContainer2;
    // if (this.container == gameSetup.mazeContainer2) {
    //   oppoContainer = gameSetup.mazeContainer;
    // }

    // let cnt = 0;
    // while (oppoContainer.crystals[bombc][bombr].childBomb) {
    //   cnt ++;
    //   if (cnt > 100) break;
    //   bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
    //   bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
    //   bombrc = bombr + ":" + bombc;
    // }

    // let newbombs = t.bombType + ":" + bombrc + "-";

    // gameSetup.networkHandler.sendCommandToAll({ c: "RequestAddBombs", t: gameSetup.currentCycleTime, w: (1-container.mazeController.playerID) + "_" + newbombs});


  }

  // else if (order.action == "PLACEBOMB") {

  //   // add this as a pending request until next time handle matching is done
  //   this.pendingBombOrder = order;

  // } else if (order.action == "ALLOWPLACEBOMB") {
  //   this.doPlaceBomb(order);
  // }

}



const Match3Game = function (gameSetup) {
  // create the root of the scene graph
  const Match3GameObj = this;
  const that = this;
  const GameEngine = this;

  let tablerenderer, ballrenderer, overlayrenderer, overlayrenderer2,  controlrenderer, pixicontrolrendererexit, pixirenderertestresult;
  const unitScale = 1;
  let world = null, world2 = null;
  let balls = {}, ballbodies = {}, ballbodies2 = {};


  // gameSetup.mainstage = new PIXI.Container(); // pool table and overlay message
  // gameSetup.overlaystage = new PIXI.Container(); // menu on top
  // gameSetup.exitStage = new PIXI.Container();
  // gameSetup.testResultStage = new PIXI.Container();

  const isHost = gameSetup.isHost;
  this.isHost = isHost;


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

  // this.updatePhysicsList = [];
  // this.getPosList = [];
  // let time = 0;

  this.setupConfig = () => {
    window.isWaitingForAllStop = false;

    if (typeof(gameSetup.difficulty) == "undefined") { gameSetup.difficulty = BEGINNER; }
    const mazeSize = gameSetup.difficulty === ADVANCED ? MAZE_SIZE.ADVANCED : MAZE_SIZE.BEGINNER;

    const cfg = {
      TileCols: mazeSize, TileRows: mazeSize,
    };
    cfg.TrueHeight = 969;
    cfg.TrueWidth = 1607;

    cfg.w2mazes = 1561; // width of just 2 mazes
    cfg.h2mazes = 702;
    cfg.MazeWidth = 656; // space for pure crystals, 48 * 13
    cfg.centerSpaceWidth = 231; // 132;
    cfg.TileSizeW = cfg.MazeWidth / mazeSize; // total width / count of tiles
    cfg.TileSizeH = cfg.TileSizeW;

    if (gameSetup.difficulty == ADVANCED) {
      // BOMB_COST = {
      //   "6": 2, "R": 2, "T": 3, "C": 3, "H": 3, "D": 4
      // };

    }


    gameSetup.config = cfg;
    cfg.tableW = cfg.TrueWidth; // logical width? not needed!
    cfg.tableH = cfg.TrueHeight;
    // const whratio = cfg.TrueWidth / cfg.TrueHeight; // width vs height
    // const oldnewratio = cfg.TrueWidth / 1600; // new vs old true width


    const r = (cfg.tableW / 108); // table width is 9 feet = 108 inch

    // gameSetup.difficulty = ADVANCED;// PROFESSIONAL;

    cfg.tableCenterX = cfg.TrueWidth / 2; //cfg.tableW / 2 + cfg.metalBorderThick;
    //cfg.tableCenterY = cfg.TrueHeight - cfg.tableH/2 -  cfg.metalBorderThick - cfg.tableH * 0.1;
    cfg.tableCenterY = cfg.TrueHeight * 0.15;

    cfg.scalingratio = r;


    cfg.quitButtonCfg = {
      isQuitButton: true,
      text: 'Quit',
      bColor: 0 * 256 * 256 + 160 * 256 + 0,
      x: cfg.tableCenterX - cfg.tableW * 0.52,
      //y: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick - cfg.tableH * 0.15,
      y: cfg.tableH * 0.01,
      w: cfg.tableW * 0.12,
      h: cfg.tableH * 0.10
    };

    cfg.messageBoardCfg = {
      bColor: 0x0851c9,
      x: cfg.tableCenterX - cfg.tableW * 0.45,
      y: cfg.quitButtonCfg.y,
      w: cfg.tableW * 0.37,
      h: cfg.quitButtonCfg.h
      // x: cfg.tableCenterX + cfg.tableW * 0.54,
      // y: cfg.tableCenterY + cfg.tableH / 2 + cfg.metalBorderThick - cfg.tableH * 0.18,
      // w: cfg.tableW * 0.1,
      // h: cfg.tableH * 0.18
    };


    // console.log('set player info');

    // since in match 3 game there are always only 2 players, we can simply
    // ungroup gameSetup.playerInfo into 2 playerInfo objects
    gameSetup.playerInfo1 = gameSetup.playerInfo[0];
    gameSetup.playerInfo1.chosenColor = null;
    gameSetup.playerInfo1.ID = 0;
    gameSetup.playerInfo2 = gameSetup.playerInfo[1];
    gameSetup.playerInfo2.ID = 1;
    gameSetup.playerInfo2.chosenColor = null;

    // local is on left, remote is on right.
    // remote can be from remote computer, or an AI running on this computer
    if (gameSetup.isLocal) {
      gameSetup.localInputPlayerInfo = gameSetup.playerInfo1;
      gameSetup.remoteInputPlayerInfo = gameSetup.playerInfo2;
    } else {
      if (gameSetup.isHost) {
        gameSetup.localInputPlayerInfo = gameSetup.playerInfo1;
        gameSetup.remoteInputPlayerInfo = gameSetup.playerInfo2;
      } else {
        gameSetup.localInputPlayerInfo = gameSetup.playerInfo2;
        gameSetup.remoteInputPlayerInfo = gameSetup.playerInfo1;
      }
    }


    cfg.playerPanel1 = {
      cx: cfg.tableCenterX - cfg.tableW * 0.199,
      //cy: cfg.quitButtonCfg.y + cfg.quitButtonCfg.h / 2, // cfg.tableCenterY - cfg.tableH * 0.65,
      cy: 56,
      borderwidth: 0.4 * r,
      w: cfg.tableW * 0.345558,
      h: cfg.quitButtonCfg.h,
      clockXShift: cfg.tableW * 0.14,
      isHuman: gameSetup.localInputPlayerInfo.playerType === 'Human',
      userName: gameSetup.localInputPlayerInfo.username,
      rating: gameSetup.localInputPlayerInfo.playerRating
    };

    cfg.playerPanel2 = {
      cx: cfg.tableCenterX + cfg.tableW * 0.205, // cfg.playerPanel1.w + cfg.tableW * 0.11,
      cy: cfg.playerPanel1.cy, // cfg.tableCenterY - cfg.tableH * 0.65,
      borderwidth: cfg.playerPanel1.borderwidth,
      w: cfg.playerPanel1.w,
      h: cfg.quitButtonCfg.h,
      clockXShift: cfg.tableW * 0.14,
      isHuman: gameSetup.remoteInputPlayerInfo.playerType === 'Human',
      userName: gameSetup.remoteInputPlayerInfo.username,
      rating: gameSetup.remoteInputPlayerInfo.playerRating
    };

    // aaaaa
    gameSetup.initialTimeSeconds = 180;
    if (gameSetup.difficulty >= ADVANCED) {
      gameSetup.initialTimeSeconds = 300;
    }

    cfg.localPlayerID = Meteor.userId();
  };

  this.restartGame = function () {
    window.location.reload();
  };

  this.createController = () => {
    const config = gameSetup.config;

    let isTesting = false;
    let isMatch = false;
    let isBattle = false;
    let isPractice = false;
    let isTournament = false;

    // bigger means less random!
    gameSetup.Randomness = 3000000; //3000000;//1500000;

    if (gameSetup.gameType === PoolGame.MATCH) {
      isMatch = true;
    } else if (gameSetup.gameType === PoolGame.BATTLE) {
      isBattle = true;
    } else if (gameSetup.gameType === PoolGame.PRACTICE) {
      isPractice = true;
    } else if (gameSetup.gameType === PoolGame.TESTING) {
      isTesting = true;
    } else if (gameSetup.gameType === PoolGame.TOURNAMENT) {
      isTournament = true;
    }



    const GameController = function () {
      const me = this;
      // let robotStarted = false;
      let cueballInHand = false;
      // let inModal = false;
      gameSetup.activePlayerInfo = null;
      gameSetup.waitingPlayerInfo = null;

      this.handleEndGame = () => {
        if (gameSetup.isLocal || gameSetup.isHost) {

        } else {
          return false;
        }

        // handle tie by extending time
        if (gameSetup.playerInfo1.points == gameSetup.playerInfo2.points) {

          gameSetup.gameStartTime += 10 * 1000;
          gameSetup.inTimeoutMode = false;
          return false;
        }

        // check points of each player

        let w = "";
        let winnerPInfo = gameSetup.playerInfo1;
        if (gameSetup.playerInfo1.points > gameSetup.playerInfo2.points) {
          w = "0";
        } else {
          w = "1";
          winnerPInfo = gameSetup.playerInfo2;
        }

        // gameSetup.gameOver = true;
        // gameSetup.sounds.backgroundmusic.stop();

        if (isMatch || isBattle) { // ignore practice?
          if (gameSetup.isLocal || gameSetup.isHost) {
            PoolActions.reportGameResult(gameSetup.room._id, winnerPInfo.playerUserId, 0, 0);
          }
          //gameSetup.showModalMessage(`The winner is player ${gameSetup.activePlayerInfo.username} !`, p[5], MODAL_EXITGAME);

        }
        if (isMatch || isBattle || isPractice) {

          gameSetup.networkHandler.sendCommandToAll({
            c: "WINNER", t: gameSetup.currentCycleTime, w
          });
        }
      };


      const ResetTable = (clearTable, IgnoreCueBall = false) => {
      };



      this.ResetTable = ResetTable;


      this.enableGUIInputs = () => {
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

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
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;
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

      this.updatePlayerPanel = function (PlayerInfo) {
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;
        // var gb = PlayerInfo.bg;
        const c = PlayerInfo.c;
        let bcolor = Pool.WHITE;
        if (PlayerInfo.chosenColor != null) {
          bcolor = PlayerInfo.chosenColor;

          // check if no ball of that color left!
          let hasSomeLeft = false;
          const ids = Object.keys(gameSetup.ballsByID);
          for (let k=0; k<ids.length; k++) {
            const b = gameSetup.ballsByID[ids[k]];
            if (b.body.inPocketID == null || typeof(b.body.inPocketID) == "undefined") {
              if (b.colorType == bcolor) {
                hasSomeLeft = true;
                break;
              }
            }
          }

          if (!hasSomeLeft) {
            bcolor = Pool.BLACK;
          }

        } else {
          bcolor = Pool.WHITE;
        }

        const isActive = PlayerInfo == gameSetup.activePlayerInfo;

        // console.log("showNameTag " + bcolor);
        PlayerInfo.c.showNameTag(bcolor, isActive);
        // PlayerInfo.chosenColor = null;
      };



      const inActionModal = false;
      const getPlayerActionMessage = function (isNext, typestr, thePlayerID) {
        // if ( gameSetup.isInStrike() )
        //     return;
        let playerID = 1;
        if (gameSetup.activePlayerInfo === gameSetup.playerInfo2) { playerID = 2; }
        if (thePlayerID) { playerID = thePlayerID; }
        const ms = `modal_${playerID}_${typestr}`;

        for (let i = 0; i < modalItems.length; i++) {
          const item = modalItems[i];
          if (item.type == ms) {
            const msg = item.content;
            return msg;
            //config.sendMessageAll(msg);
            // if (!isNext) {
            //   config.sendMessageAll('', 0);
            //   config.sendMessageAll('', 1);
            //   setTimeout(() => {
            //     config.sendMessageAll(msg, 0);
            //   }, 100);
            // } else {
            //   config.sendMessageAll('', 1);
            //   setTimeout(() => {
            //     config.sendMessageAll(msg, 1);
            //   }, 10);
            // }
            break;
          }
        }
      };

      this.convertCommandToTestScript = function(cmd) {
        const config = gameSetup.config;
        let s = "ResetTable(true);\n";

        const poslist = cmd.ballPos.split("|");
        for (let k=0; k<poslist.length; k++) {
          if (poslist[k].length < 2) continue;
          const pos = poslist[k].split("_");
          // const b = gameSetup.ballsByID[pos[0]];

          if (pos[1] == "NaN" || pos[1] == "100000") {
          } else {
            //resetBall(b, Number(pos[1]), Number(pos[2]));
            s += "PlaceBallOnTable(" + pos[0] + ", " + (parseFloat(pos[1])- config.tableCenterX).toFixed(3) + ", " + (parseFloat(pos[2])- config.tableCenterY).toFixed(3) + ");\n";
          }
        }

        s += "\n";

        if (cmd.chosenColor == 'R') s += 'ChooseRedColor();\n';
        if (cmd.chosenColor == 'Y') s += 'ChooseYellowColor();\n';


        s += `TakeCallShot();
await WaitForAllBallStop();
ReportEndOfTest();
        `;

        return s;
      }

      this.resetToCommand = function(cmd) {
        if (cmd.playerAction == "Call" || cmd.playerAction == "Won" ) {
          // reset ball positions
          // 0_481.4021911621094_1063.8577880859375|2_2105.639892578125_287.0849609375|3_1789.742431640625_344.1299743652344|4_1485.9801025390625_1088.583251953125|1_1071.121826171875_917.1253662109375|
          const poslist = cmd.ballPos.split("|");
          for (let k=0; k<poslist.length; k++) {
            if (poslist[k].length < 2) continue;
            const pos = poslist[k].split("_");
            const b = gameSetup.ballsByID[pos[0]];

            if (pos[1] == "NaN" || pos[1] == "100000") {
              resetBall(b, 100000, 100000);
              b.body.inPocketID = 0;
            } else {
              resetBall(b, Number(pos[1]), Number(pos[2]));
            }
          }
        } else if (cmd.playerAction == 'Break') {
          ResetTable(false);

          // const allIDs = Object.keys(ballbodies);
          // for (let j=0; j<allIDs.length; j++) {
          //   const i = allIDs[j];
          //   const b = ballbodies[i];
          //   for (let k=b.shapes.length-1; k>=0; --k) {
          //     b.removeShape(b.shapes[i]);
          //   }
          //   const b2 = ballbodies2[i];
          //   for (let k=b2.shapes.length-1; k>=0; --k) {
          //     b2.removeShape(b2.shapes[i]);
          //   }
          //   b.ball = null;
          //   ballbodies[i] = null;
          //   b2.ball = null;
          //   ballbodies2[i] = null;
          // }
          // // ballbodies.length = 0;
          // // ballbodies2.length = 0;

          // gameSetup.addBalls();

        }
      };



      this.createWorldForPlayer = function() {
        // WorldForPlayer.CenterX = config.tableCenterX;
        // WorldForPlayer.CenterY = config.tableCenterY;
        WorldForPlayer.ROW_COUNT = gameSetup.config.TileRows;
        WorldForPlayer.COLUMN_COUNT = gameSetup.config.TileCols;
        WorldForPlayer.PlayerInfo = {};

        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID] = {};
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID] = {};

        WorldForPlayer.maze = [];
        WorldForPlayer.maze2 = [];
        for (let k=0; k<gameSetup.config.TileCols; k++) {
          const col = [];
          const col2 = [];
          WorldForPlayer.maze.push(col);
          WorldForPlayer.maze2.push(col2);
          for (let j=0; j<gameSetup.config.TileRows; j++) {
            col.push({});
            col2.push({});
          }
        }

      };


      this.updateWorld = () => {
        const game = gameSetup;

        for (let k=0; k<gameSetup.config.TileCols; k++) {
          const col = WorldForPlayer.maze[k];
          const realcol = gameSetup.mazeContainer.crystals[k];
          const col2 = WorldForPlayer.maze2[k];
          const realcol2 = gameSetup.mazeContainer2.crystals[k];
          for (let j=0; j<gameSetup.config.TileRows; j++) {
            col[j].d = realcol[j].digit;
            col[j].t = "";
            if (realcol[j].childBomb) {
              col[j].t = realcol[j].childBomb.bombType;
            }
            col2[j].d = realcol2[j].digit;
            col2[j].t = "";
            if (realcol2[j].childBomb) {
              col2[j].t = realcol2[j].childBomb.bombType;
            }
          }
        }

      };



      this.updateEmitters = () => {
        if (!gameSetup.emitters) return;
        const now = Date.now();

        if (!gameSetup.emitterelapsed) {
          gameSetup.emitterelapsed = now - 100;
        }
        const chg = (now - gameSetup.emitterelapsed) * 0.001;
        for (let k=0; k<gameSetup.emitters.length; k++) {
          gameSetup.emitters[k].update(chg);
        }
        gameSetup.emitterelapsed = now;

      }

      this.tickUpdate = () => {

        this.updateEmitters();

        if (gameSetup.mazeControllers) {
          gameSetup.mazeControllers[0].handleNextRequest();
          gameSetup.mazeControllers[1].handleNextRequest();
        }

        if (gameSetup.gameType != GAME_TYPE.TESTING && gameSetup.allSetup && !gameSetup.gameOver) {
          gameSetup.controller.updateWorld();

          let bothAI = true;
          for (let k = 0; k < gameSetup.playerInfo.length; k++) {
            const pi = gameSetup.playerInfo[k];
            if (pi.playerType != "AI") bothAI = false;
          }

          for (let k = 0; k < gameSetup.playerInfo.length; k++) {
            const pi = gameSetup.playerInfo[k];
            pi.isLocal = gameSetup.config.localPlayerID === pi.userId || gameSetup.config.localPlayerID === pi.playerCodeOwner
            if (pi.playerType != "AI") continue;
            if (!pi.isLocal && !pi.localInput) continue;
            if (pi.controller.container.inSwap) continue;
            if (pi.controller.isHandlingRequest) {
              console.log("block because is handling " + k);
              continue;
            }

            if (!('waitingForReply' in pi.playerWorker) || !pi.playerWorker.waitingForReply) {
              ///////////////////////
              // console.log(`worker sending a cmd ${m.cmd}, and waiting for reply ... `);
              if (!pi.playerWorker.lastTime) {
                pi.playerWorker.lastTime = 1;
              }
              if (!bothAI) {
                let RobotWaitTime = gameSetup.difficulty == BEGINNER ? 2500 : 1500;
                if (Date.now() - pi.playerWorker.lastTime < RobotWaitTime) {
                  continue;
                }
              } else {
                let RobotWaitTime = 500;
                if (Date.now() - pi.playerWorker.lastTime < RobotWaitTime) {
                  continue;
                }
              }

              pi.playerWorker.lastTime = Date.now();
              pi.playerWorker.waitingForReply = true;
              pi.playerWorker.sendMessage({
                'cmd': CMD_GET_COMMAND,
                'world': WorldForPlayer
              });
            }
          }
        }
      };

      this.saveCommand = (cmdstr) => {
        Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.activePlayerInfo.ID, cmdstr);
      };


      gameSetup.config.sendMessageAll = (msg) => {
        if (gameSetup.isLocal) {
          config.showMessage(msg);
          if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
            const cmdstr = `ShowMessage;${gameSetup.currentCycleTime};${msg}`;
            this.saveCommand(cmdstr);
          }
        } else {
          // console.log("do sendMessage All " + msg);
          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "ShowMessage", t: gameSetup.currentCycleTime, w: msg
          });
        }
      };


      // only run at host or all local!
      this.handleAllStopped = () => {
        // console.log("do handle all stopped " + gameSetup.targetBallID + " " + gameSetup.targetPocketID);

        gameSetup.resetBallStopped();

        if (gameSetup.gameType == GAME_TYPE.REPLAY) {
          if (gameSetup.inWaitingPlacement) return;
          window.replayControl.onReplayFinish();
          return;
        }

        // new: check if any issue with ball position
        if (!gameSetup.isLocal) {
          const issueID = this.findBallPositionIssue();
          // console.log("issueID is " + issueID);
          if (issueID >= 0 && !gameSetup.inQuit) {
            // exit game!
            gameSetup.inQuit = true;
            gameSetup.networkHandler.sendCommandToAll({ c: "QuitGameRoomWithIssue", t: gameSetup.currentCycleTime, w: `Sorry! Your game state is somehow out of sync with the opponent's.` });
            return;
          }
        }
        this.inStrike = false;
        this.inNewTest = false;
        // const config = gameSetup.config;
        config.playerPanel1.inTimeCountDown = false;
        config.playerPanel2.inTimeCountDown = false;


        const username = gameSetup.activePlayerInfo.username;

        if (isTesting) {
          if (window.waitForAllStopResolveID) {
            gameSetup.controller.updateWorld();
            gameSetup.activePlayerInfo.playerWorker.sendMessage({
              'cmd': CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP,
              'world': WorldForPlayer,
              'resolveID': window.waitForAllStopResolveID
            });
            delete window.waitForAllStopResolveID;
          }
          return;
        }

        const otherUsername = gameSetup.waitingPlayerInfo.username;




        // console.log("game state is " + this.gameState);

        // based on game results change game state
        switch (Number(this.gameState)) {
          case BREAK_CUEBALL_IN_HAND_STATE:
          case BREAK_SHOT_STATE: {
            const failReason = this.isValidBreakShot();
            // console.log("fail reason " + failReason);
            if (failReason == "") {
              const newState = CALL_SHOT_STATE;
              let newID = gameSetup.activePlayerInfo.ID;
              if (gameSetup.newlyPocketedBalls.length == 0) {
                // need to change player if no ball pocketed
                newID = 1 - newID;
              }


              config.sendMessageAll(`Great shot. Player ${gameSetup.playerInfo[newID].username} will make a call shot on any RED or YELLOW ball now.`);
              // config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to take a call shot`);
              this.setNewPlayerState(newID, newState);
            } else {
              // invalid break shot: switch to opponent to redo it
              config.sendMessageAll(`Invalid break shot: ${failReason}. Player ${otherUsername} will make a break shot now.`);
              //this.togglePlayer(BREAK_CUEBALL_IN_HAND_STATE);

              if (gameSetup.waitingPlayerInfo.playerType == "AI") {
                gameSetup.networkHandler.sendCommandToAll({
                  c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${gameSetup.waitingPlayerInfo.ID}_${BREAK_SHOT_STATE}`
                });
              } else {
                gameSetup.networkHandler.sendCommandToAll({
                  c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${gameSetup.waitingPlayerInfo.ID}_${BREAK_CUEBALL_IN_HAND_STATE}`
                });
              }


            }
            break;
          }
          case CALL_SHOT_STATE: {
            // console.log("handle allstop in call shot state 1");
            if (gameSetup.ballsByID[BLACK_BALL_ID] && gameSetup.ballsByID[BLACK_BALL_ID].body.inPocketID !== null) { // black ball pocketed! serious event!
              let failReason = "";
              if (gameSetup.targetBallID !== BLACK_BALL_ID) {
                failReason = getPlayerActionMessage(false, 'BlackballPocketedNoTarget');
                if (!isTesting) {
                  config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} has won the game!`);
                  this.togglePlayer(GAME_OVER_STATE);
                }
              } else if (gameSetup.ballsByID[BLACK_BALL_ID].body.inPocketID !== gameSetup.targetPocketID) {
                failReason = getPlayerActionMessage(false, 'BlackballPocketedWrong');

                if (!isTesting) {
                  config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} has won the game!`);
                  this.togglePlayer(GAME_OVER_STATE);
                }
              } else { // correctly pocketed black ball into target pocket
                if (gameSetup.ballsByID[CUE_BALL_ID].body.inPocketID !== null) {
                  failReason = getPlayerActionMessage(false, 'CueballPocketedWithBlack');
                  if (!isTesting) {
                    config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} has won the game!`);
                    this.togglePlayer(GAME_OVER_STATE);
                  }
                } else if (gameSetup.firstBallTouchedByCueball.ID !== BLACK_BALL_ID) {
                  failReason = getPlayerActionMessage(false, `NotFirstTouch${Pool.BLACK}`);
                  if (!isTesting) {
                    config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} will place the ball on the table and take a call shot.`);
                    this.togglePlayer(CUEBALL_IN_HAND);
                  }
                } else {
                  // good end!
                  if (!isTesting) {
                    failReason = getPlayerActionMessage(false, `GreatShot`);
                    config.sendMessageAll(`Bravo! Player ${username} has won the game!`);
                    this.setNewPlayerState(gameSetup.activePlayerInfo.ID, GAME_OVER_STATE);
                  }
                }
              }

              // console.log("handle allstop in call shot state 2");
              break;
            }

            // black ball was not pocketed. check for other foul

            if (gameSetup.ballsByID[CUE_BALL_ID].body.inPocketID !== null) {
              // console.log("handle allstop in call shot state 3");
              const fr = getPlayerActionMessage(false, 'CueballPocketed');
              if (!isTesting) {
                config.sendMessageAll(`Unfortunately ${fr}. Player ${otherUsername} will place the ball on the table and take a call shot.`);
                this.togglePlayer(CUEBALL_IN_HAND);
              }
              break;
            } else {
              if (gameSetup.firstBallTouchedByCueball === null) {
                // console.log("handle allstop in call shot state 4");
                const fr = getPlayerActionMessage(false, 'NoBallTouched');
                if (!isTesting) {
                  config.sendMessageAll(`Unfortunately ${fr}. Player ${otherUsername} will place the ball on the table and take a call shot.`);
                  this.togglePlayer(CUEBALL_IN_HAND);
                }
                break;
              }
              if (gameSetup.activePlayerInfo.chosenColor != null) {
                if (gameSetup.firstBallTouchedByCueball.colorType !== gameSetup.activePlayerInfo.legalColor) {
                  // console.log("handle allstop in call shot state 5");
                  const fr = getPlayerActionMessage(false, `NotFirstTouch${gameSetup.activePlayerInfo.legalColor}`);
                  if (!isTesting) {
                    // console.log(`Unfortunately for player ${username}: first touch color is ${gameSetup.firstBallTouchedByCueball.colorType} but legal color is  ${gameSetup.activePlayerInfo.legalColor}. Player ${otherUsername} will place the ball on the table and take a call shot.`);
                    // debugger;
                    config.sendMessageAll(`Unfortunately ${fr}. Player ${otherUsername} will place the ball on the table and take a call shot.`);
                    this.togglePlayer(CUEBALL_IN_HAND);
                  }
                  break;
                }
              }
              if (gameSetup.targetPocketID == null || gameSetup.targetBallID == -1) {
                // console.log("target pocket id null or -1 " + gameSetup.targetPocketID + " " + gameSetup.targetBallID);
                const fr = getPlayerActionMessage(false, 'NoTargetPocket');
                if (!isTesting) {
                  console.log("handle allstop in call shot state 6");
                  if (gameSetup.activePlayerInfo.chosenColor != null) {
                    // console.log("has chosen color");
                    this.defineLegalColorForNonActivePlayer();
                    config.sendMessageAll(`${fr}. Player ${otherUsername} will take a call shot on any ${ColorTypeString2[gameSetup.waitingPlayerInfo.legalColor]} ball.`);
                  } else {
                    config.sendMessageAll(`${fr}. Player ${otherUsername} will take a call shot on any red or yellow ball.`);
                  }
                  // config.sendMessageAll(`${fr}. Player ${otherUsername} will take a call shot now.`);
                  this.togglePlayer(CALL_SHOT_STATE);
                }
                break;
              }

              if (gameSetup.ballsByID[gameSetup.targetBallID].body.inPocketID == gameSetup.targetPocketID) {
                // good shot, continue
                // console.log("handle allstop in call shot state 7");
                if (gameSetup.activePlayerInfo.chosenColor == null) { // still open table so choose color
                  //console.log("chosen color!! " + gameSetup.activePlayerInfo.playerUserId + " " + gameSetup.activePlayerInfo.chosenColor);
                  // gameSetup.activePlayerInfo.chosenColor = gameSetup.ballsByID[gameSetup.targetBallID].colorType;
                                      // Bert.alert("Great Shot!   have chosen " + ColorTypeString[activePlayerInfo.chosenColor] + " balls!", 'success', 'growl-bottom-left');
                  // debugger;
                  //getPlayerActionMessage(true, `GreatShotChosen${gameSetup.ballsByID[gameSetup.targetBallID].colorType}`);
                  config.sendMessageAll(`Player ${username} has chosen the ${ColorTypeString2[gameSetup.ballsByID[gameSetup.targetBallID].colorType]} color, and will continue to make a call shot.`);

                  if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
                    const cmdstr = `ChooseColor;${gameSetup.currentCycleTime};${gameSetup.activePlayerInfo.ID}_${gameSetup.ballsByID[gameSetup.targetBallID].colorType}`;
                    this.saveCommand(cmdstr);
                  }

                  // let otherColor = Pool.RED;
                  // if (gameSetup.activePlayerInfo.chosenColor === Pool.RED) { otherColor = Pool.YELLOW; }
                  // if (gameSetup.activePlayerInfo === gameSetup.playerInfo1) {
                  //   gameSetup.playerInfo2.chosenColor = otherColor;
                  // } else {
                  //   gameSetup.playerInfo1.chosenColor = otherColor;
                  // }
                } else {
                  // getPlayerActionMessage(true, 'GreatShot');
                  this.defineLegalColorForActivePlayer();
                  config.sendMessageAll(`Player ${username} will continue to make a call shot on any ${ColorTypeString2[gameSetup.activePlayerInfo.legalColor]} ball.`);
                }
                this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, gameSetup.ballsByID[gameSetup.targetBallID].colorType);
              } else {
                // no ball pocketed, check to make sure some ball hit the rail
                // console.log("handle allstop in call shot state 8");
                if (1 || gameSetup.someBallTouchedRailedAfter) {
                  getPlayerActionMessage(false, 'NiceTry');
                  if (!isTesting) {
                    if (gameSetup.activePlayerInfo.chosenColor != null) {
                      this.defineLegalColorForNonActivePlayer();
                      config.sendMessageAll(`Target ball was not pocketed in the target pocket. Player ${otherUsername} will take a call shot on any ${ColorTypeString2[gameSetup.waitingPlayerInfo.legalColor]} ball.`);
                    } else {
                      config.sendMessageAll(`Target ball ${gameSetup.targetBallID} was not pocketed in target pocket ${gameSetup.targetPocketID}. Player ${otherUsername} will take a call shot on any red or yellow ball.`);
                    }
                    this.togglePlayer(CALL_SHOT_STATE);
                  }
                } else {
                  // console.log("handle allstop in call shot state 9");
                  getPlayerActionMessage(false, 'NoBallHitRailsAfter');
                  if (!isTesting) {
                    config.sendMessageAll(`Unfortunately no ball hit the cushions after the cue ball's initial hit. Player ${otherUsername} will place the ball on the table and take a call shot.`);
                    this.togglePlayer(CUEBALL_IN_HAND);
                  }
                }
              }
            }

            break;
          }
        }

        gameSetup.controller.verifyTestResult();
      };

      this.checkIfAllPeerAllStopped = () => {
        // console.log("dddd checkIfAllPeerAllStopped " + gameSetup.hostAllStopped + " " + gameSetup.peer.allBallStopped);
        gameSetup.allPeerAllStopped = gameSetup.hostAllStopped;
        if (!gameSetup.peer) return;
        if (!gameSetup.peer.allBallStopped) {
          gameSetup.allPeerAllStopped = false;
          // console.log("peer is still not all stopped ");
        }
        // for (let j = 0; j < gameSetup.playerCount; j++) {
        //   const p1 = gameSetup.allPeers[j];
        //   if (p1 && !p1.allBallStopped) {
        //     console.log("confirm peer all ball stopped!");
        //     gameSetup.allPeerAllStopped = false;
        //     break;
        //   }
        // }
        if (gameSetup.allPeerAllStopped) {
          gameSetup.allStopHandled = true;
          this.handleAllStopped();
        }
      };






      this.allowInput = function () {
        // if (gameSetup.activePlayerInfo == null) return false;
        if (gameSetup.gameType == GAME_TYPE.TESTING) return false;
        // if (gameSetup.gameType == GAME_TYPE.REPLAY) return false;

        // if (gameSetup.gameType == GAME_TYPE.AUTORUN) return false;
        if (gameSetup.gameOver) return false;
        // if (gameSetup.gameType == GAME_TYPE.TESTING) return false;
        // if (isTesting) { return false; } // in testing mode no manual input! ??
        return true;
      };


      this.verifyTestResult = () => {
        if (gameSetup.gameType != GAME_TYPE.TESTING) return;
      };


      this.setRobotCode = (robotCode) => {
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          gameSetup.playerInfo[0].PlayerCode = robotCode;
        }
      };



      this.createAIPlayers = (setupCode, runTestOnReady) => {
        // console.log("to create ai players");
        // debugger;
        if (gameSetup.gameType == GAME_TYPE.REPLAY) return;
        for (let k = 0; k < gameSetup.playerInfo.length; k++) {
          const pi = gameSetup.playerInfo[k];
          pi.isLocal = pi.playerUserId == gameSetup.config.localPlayerID || gameSetup.gameType == GAME_TYPE.AUTORUN;
          if (pi.playerType != "AI") continue;
          if (typeof(setupCode) != "undefined")
            pi.TestCode = setupCode;

          if (pi.playerWorker) {
            pi.playerWorker.terminate();
          }
          if (gameSetup.gameType == GAME_TYPE.TESTING && k > 0)   break;
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

      // execute the received command
      gameSetup.executeAIWorkerCommand = (data) => {
        if (gameSetup.gameOver) return;
        if (gameSetup.inTimeoutMode) return;
        if (gameSetup.inWaittime) return;


        let cmdUser = data.cmd;

        // hack: first 6 tanks are reserved for blue or red, and we have 6
        // ai playerworkers. but if we have less than 6 player tanks, then
        // white tanks will be in first 6
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
        }

        if (!cmdUser) {
          return;
        }

        if (typeof(data.playerID) == "undefined") {
          debugger;
        }

        if (data.cmdType === CMD_GET_COMMAND) {
          if (gameSetup.gameType === GAME_TYPE.TESTING) {
            window.commandHistory.push(cmdUser);
          }
          // aaaa overwrite AI order
          // cmdUser.r = 2;
          // cmdUser.c = 2;
          // cmdUser.type = "R";
          //gameSetup.mazeControllers[data.playerID].initOrder(cmdUser);

          const mazeController = gameSetup.mazeControllers[0].playerID == data.playerID ? gameSetup.mazeControllers[0] : gameSetup.mazeControllers[1];
          if (mazeController.inWaittime) return;
          const container = mazeController.container;

          if (cmdUser.action == "USESTICKER") {
            if (1 || gameSetup.difficulty == BEGINNER) {

              // just need to send the request to the opponent's controller
              const t = {
                bombType: cmdUser.type
              };
              t.starCost = BOMB_COST[t.bombType];
              if (container.visibleStarCount < t.starCost) {
                return;
              }
              // const container2 = this.container == gameSetup.mazeContainer ? gameSetup.mazeContainer2 : gameSetup.mazeContainer;
              container.changeStars(0 - t.starCost);

              let bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
              let bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
              let bombrc = bombr + ":" + bombc;
              // make sure no bomb is already at that location
              let oppoContainer = gameSetup.mazeContainer2;
              if (container == gameSetup.mazeContainer2) {
                oppoContainer = gameSetup.mazeContainer;
              }

              let cnt = 0;
              while (oppoContainer.crystals[bombc][bombr].childBomb) {
                cnt ++;
                if (cnt > 100) break;
                bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
                bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
                bombrc = bombr + ":" + bombc;
              }

              if (gameSetup.difficulty != BEGINNER && typeof(cmdUser.r) != "undefined" && typeof(cmdUser.c) != "undefined") {
                bombr = Math.max(0, Math.min(gameSetup.config.TileRows, cmdUser.r));
                bombc = Math.max(0, Math.min(gameSetup.config.TileCols, cmdUser.c));
              }

              gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (data.playerID) + "_USESTICKER_" + bombr + "_" + bombc + "_" + t.bombType});
              return;
            } else {
              //TODO:  advanced then AI can specify where!
            }
          }


          gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (data.playerID) + "_" + cmdUser.action + "_" + cmdUser.r + "_" + cmdUser.c + "_" + cmdUser.type});


          // if (gameSetup.isLocal) {
          //   gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (data.playerID) + "_" + cmdUser.action + "_" + cmdUser.r + "_" + cmdUser.c + "_" + cmdUser.type});
          // } else {
          //   const mazeController = gameSetup.mazeControllers[0].playerID == data.playerID ? gameSetup.mazeControllers[0] : gameSetup.mazeControllers[1];
          //   gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (data.playerID) + "_" + cmdUser.action + "_" + cmdUser.r + "_" + cmdUser.c + "_" + cmdUser.type + "_" + mazeController.encodeMaze() });
          // }

        } else if (data.cmdType == CMD_GET_SECONDS_LEFT) {
          gameSetup.controller.updateWorld();
          let ss = gameSetup.secondsLeft;
          if (typeof(ss) == "undefined") ss = 10000;
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_SECONDS_LEFT,
            'world': WorldForPlayer,
            'secondsLeft': ss,
            'resolveID': data.resolveID
          });
        }

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
        gameSetup.inRunningTest = true;

        that.clearForecastLines();
        delete window.waitForAllStopResolveID;
        window.probabilityInquiryHistory = "";
        window.calcEndStateCount = 0;
        window.calcEndStateCountRandom = 0;
        window.plottedBasicColumn = false;
        window.plottedBasicScatterBallDistanceProbability = false;
        window.plottedBasicScatterCutAngleProbability = false;
        window.savedDataLinearRegression = false;
        window.trainLinearModelX = [];
        //$("#chartcontainer").hide();
        gameSetup.controller.updateWorld();
        // const shotCmdUser = gameSetup.activePlayerInfo.playerAI.getBreakShot();
        gameSetup.activePlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_TEST_RUN,
          'world': WorldForPlayer
        });
        gameSetup.enteringSimulation = true;
      };



      this.runCode = function (code) {
        // debugger;
        that.clearForecastLines();

        // console.log('in run code ' + code );
        const fullcode = `
        async function testRun() { 
          ${code}
        }
        testRun();`;
        window.allStopCount = 0;
        window.allStoppedTriggered = false;
        eval(fullcode);
      };


      const setSecondsLeft = (s) => {
        gameSetup.secondsLeft = s;
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
    window.gameController = gameSetup.controller;

  };



  // this.enablePlaceButton = () => {
  //   // gameSetup.strikeButton.text.setText('Place');
  //   // var cfg = gameSetup.strikeButton.cfg;
  //   // cfg.bg.beginFill(cfg.origColor);
  //   // cfg.bg.drawRoundedRect(cfg.x, cfg.y, cfg.w, cfg.h, 10);
  //   // cfg.bg.endFill();

  //   gameSetup.strikeButton.inputEnabled = true;
  // };


  this.toggleAllControls = (enabled) => {
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;
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



  // main entry function
  this.setupGameRoom = function () {

    this.setupConfig();
    this.enhanceVictor();
    this.setup();
    // this.initGraphics();
    // this.setReady();

    this.createController();
    this.loadSounds();

    // load textures async, then on load complete draw assets
    this.loadTextures();
  };

  this.createWorkerFromString = function (code) {
    // URL.createObjectURL
    window.URL = window.URL || window.webkitURL;

    // console.log("AI Code: " + code);

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
        const workerCode = `${VictorString} ${p[0]} ${pinfo.PlayerCode} ${p[1]} ${testcode} ${p[2]}`;

        // console.log("createRobot: createWorkerFromString " + testcode);
        const playerWorker = that.createWorkerFromString(workerCode);

        playerWorker.isReady = false;
        pinfo.playerWorker = playerWorker;

        this.listener = function(e) {
          if (e.data.cmdType == CMD_READY) {
              // console.log(` worker is ready ${pinfo.ID} ${JSON.stringify(e.data)}`);
              playerWorker.isReady = true;

              if (gameSetup.gameType == GAME_TYPE.TESTING && runTestOnReady) {
                gameSetup.controller.runTest();
              }

              // me.checkIfAllReady();
          // } else if (e.data.cmd == "PAUSE") {
          //     window.isPaused = true;
          } else if (e.data.cmdType == CMD_ERROR_IN_WORKER) {
            Bert.defaults.hideDelay = 15000;
            Bert.alert({
              //title: 'Error found when executing test',
              title: e.data.message,
              message: e.data.stack,
              type: 'danger',
              style: 'growl-top-right',
              icon: 'fa-frown-o'
            });

          } else {
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
          'isHost': pinfo.ID == 0 || (pinfo.ID == 1 && !gameSetup.isLocal && !gameSetup.isHost),
          'world': WorldForPlayer,
          url: document.origin
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

    // assets for match3:
    textures.push(`/images/underempty4.png`);
    for (let k=0; k<12; k++) {
      textures.push(`/images/Crystals/PNG/${k}@2x.png`);
    }
    for (let k=0; k<BOMB_NAME.length; k++) {
      textures.push("/images/Bomb_" + BOMB_NAME[k] + "3.png");
    }
    textures.push("/images/Bomb_Q3.png"); // transfer for left
    textures.push("/images/Crystals/PNG/Dirt.png"); // transfer for left


    // textures.push("/images/arrows/b1.png"); // right
    // textures.push("/images/arrows/b2.png"); // down
    // textures.push("/images/arrows/b3.png"); // left
    // textures.push("/images/arrows/b4.png"); // up


    textures.push(`/images/newpool/tishi.png`);
    textures.push(`/images/newpool/jinbi.png`);
    textures.push(`/images/newpool/endoverlay2.png`);
    textures.push(`/images/newpool/bj3b.png`);
    textures.push(`/images/newpool/exit_1.png`);
    textures.push(`/images/newpool/exit_2.png`);
    textures.push(`/images/newpool/restart_1.png`);
    textures.push(`/images/newpool/restart_2.png`);
    textures.push(`/images/newpool/winner.png`);
    // textures.push(`/images/newpool/firework1.png`);
    textures.push(`/images/newpool/firework4.png`);
    // textures.push(`/images/beamv.png`);
    // textures.push(`/images/beamh.png`);
    textures.push(`/images/beamh2.png`);
    textures.push(`/images/shinestar1.gif`);

    // textures.push(`/images/white_rolling_adj_hd2.png`);
    // textures.push(`/images/red_rolling_adj_hd2.png`);
    // textures.push(`/images/yellow_rolling_adj_hd2.png`);
    // textures.push(`/images/black_rolling_adj_hd2.png`);
    // textures.push(`/images/spintargetballpanel2.png`);
    textures.push(`/images/whitetargetball.png`);
    textures.push(`/images/particle.png`);
    textures.push(`/images/newexplode1.png`);
    textures.push(`/images/smallgoldstar.png`);
    textures.push(`/images/hiteffect.png`);

    textures.push(`/images/waterspin2.png`);
    textures.push(`/images/hourglass1.png`);


    textures.push(`/images/handbridgeandcuestick2.png`);
    textures.push(`/images/hitbtn.png`);
    textures.push(`/images/replaybtn.png`);
    textures.push(`/images/exitbtn.png`);
    textures.push(`/images/modalmessagebg.png`);
    textures.push(`/images/okbtn.png`);
    textures.push(`/images/quitbtn.png`);
    textures.push(`/images/placebtn.png`);
    textures.push(`/images/staybtn.png`);
    textures.push(`/images/exitwarning.png`);
    textures.push(`/images/redbackground.png`);
    textures.push(`/images/yellowarrow.png`);
    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      textures.push(`/images/match3rules6.png`);
    } else {
      textures.push(`/images/match3rules6.png`);
    }
    // textures.push(`/images/nametaggrey.png`);
    // textures.push(`/images/bluebackground5.jpg`);
    // textures.push(`/images/speedbarbackground2.png`);
    // textures.push(`/images/directioncoalbackground.png`);


    textures.push('/images/robot1.png');
    textures.push('/images/human1.png');
    // textures.push('/images/gowhite.png');
    // textures.push('/images/adjustwhite.png');
    // textures.push('/images/cwmetal3.png');
    // textures.push('/images/ccwmetal3.png');
    textures.push('/images/helpquestionmark.png');
    // textures.push('/images/SliderSlot1Speed8NoWord.png');
    // textures.push('/images/TGameLogoHead.png');
    textures.push('/images/tboticon.png');
    textures.push('/images/tbotmessagebackground2.png');
    textures.push('/images/tbotmessagebackground.png');
    textures.push('/images/userRobotChat.jpg');
    // textures.push('/images/sliderknob1.png');
    // textures.push('/images/SliderSlot1SpinNoWord.png');
    // textures.push('/images/crossVcue2Small.png');
    // textures.push('/images/backarrowlight.png');
    // textures.push('/images/NewNameTagBlank2.png');
    // textures.push('/images/NewNameTagBlankRed2.png');
    // textures.push('/images/NewNameTagBlankWhite2.png');
    // textures.push('/images/NewNameTagBlankYellow2.png');
    // textures.push('/images/strikebutton.png');
    const mainItems = _.get(gameSetup, 'mainItems');
    // console.log('mainItems', mainItems);
    _.map(mainItems, (mainItem) => {
      const main = _.get(mainItem, 'imageSrc.main');
      if (main) {
        for (let k = 0; k < 12; k++) {
          if (!textures.includes(`${main}${k}.png`)) {
            textures.push(`${main}${k}.png`);
          }
        }
      }
    });

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
      if (!PIXI.loader.resources["/images/underempty4.png"]) {
        // loading of game screen cancelled?
        console.log("do not have coalback yet");
        if (typeof(gameSetup.gameType) == "undefined") return;
        setTimeout(() => {
          console.log("try initFunction again");
          initFunction();
        }, 1000);
        return;
      }

      if (gameSetup.initFunctionExecuted) return;

      gameSetup.initFunctionExecuted = true;
      gameSetup.config.TotalRandomRows = 300;

      that.drawInitialScreen();

      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.AUTORUN  || gameSetup.gameType == GAME_TYPE.REPLAY ) {
        that.initScreen();
      } else {
        that.setupHandleRoom();
        gameSetup.controller.disableGUIInputs();
        // console.log("reportEnteringGameRoom " + gameSetup.room._id + " gameSetup.localPlayerID " + gameSetup.localPlayerID);
        gameSetup.showModalMessage('Connecting players ...', '', MODAL_NOBUTTON);
        PoolActions.reportEnteringGameRoom(gameSetup.room._id, gameSetup.localPlayerID);
      }

      PIXI.ticker.shared.start();
      that.tick();
    };

    // aaaa always load?
    if (!needLoading) {
      console.log("no need for loading! so call initfunction directly");
      initFunction();
    } else {
      // console.log("load texture first "); // + JSON.stringify(neededTextures));
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
      const cols = Math.floor(texture.width / frameWidth);
      // const rows = Math.floor(texture.height / frameHeight);
      // const cols = cnt;
      const rows = cnt / cols;
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



  const findMatchesV = (m, n) => {
    const targetD = n.digit;
    const config = gameSetup.config;
    let match = n.r + "_" + n.c;
    let colcount = 1;
    // search up first
    for (let j=1; j<config.TileRows; j++) {
      const tile = n.parentContainer.crystals[n.c][n.r - j];
      if (!tile) break;
      if (tile.digit !== targetD) {
        break;
      } else {
        colcount ++;
        match = (n.r-j) + "_" + n.c + "-" + match;
      }
    }
    // search down
    for (let j=1; j<config.TileRows; j++) {
      const tile = n.parentContainer.crystals[n.c][n.r + j];
      if (!tile) break;
      if (tile.digit !== targetD) {
        break;
      } else {
        colcount ++;
        match = match + "-" + (n.r+j) + "_" + n.c;
      }
    }
    // if (match.includes("8")) {
    //   // debugger;
    // }
    if (colcount < 3) {
      return;
    }

    // check on "6+" stickers
    const allm = match.split("-");
    let allcnt = 0;
    let hasSixPlus = false;
    for (let i=0; i<allm.length; i++) {
      const addr = allm[i].trim();
      if (addr != "") {
        allcnt ++;
        const p = addr.split("_");
        const cr = n.parentContainer.crystals[p[1]][p[0]];
        if (cr.childBomb) {
          if (cr.childBomb.bombType == "6") {
            hasSixPlus = true;
          }
        }
      }
    }
    if (hasSixPlus && allcnt < 6) {
      return;
    }


    const finalmatch = n.digit + "-" + match;
    if (!m.includes(finalmatch))
      m.push(finalmatch);

  }

  const findMatchesH = (m, n) => {
    const targetD = n.digit;
    const config = gameSetup.config;
    let match = n.r + "_" + n.c;
    let rowcount = 1;

    // search left
    for (let j=1; j<config.TileCols; j++) {
      if (!n.parentContainer.crystals[n.c-j]) break;
      const tile = n.parentContainer.crystals[n.c-j][n.r];
      if (!tile) break;
      if (tile.digit !== targetD) {
        break;
      } else {
        rowcount ++;
        match = (n.r) + "_" + (n.c-j) + "-" + match;
      }
    }
    // search right
    for (let j=1; j<config.TileCols; j++) {
      if (!n.parentContainer.crystals[n.c+j]) break;
      const tile = n.parentContainer.crystals[n.c+j][n.r];
      if (!tile) break;
      if (tile.digit !== targetD) {
        break;
      } else {
        rowcount ++;
        match = match + "-" + (n.r) + "_" + (n.c+j);
      }
    }
    // if (match.includes("8")) {
    //   debugger;
    // }

    if (rowcount < 3) {
      return;
    }


    // check on "6+" stickers
    const allm = match.split("-");
    let allcnt = 0;
    let hasSixPlus = false;
    for (let i=0; i<allm.length; i++) {
      const addr = allm[i].trim();
      if (addr != "") {
        allcnt ++;
        const p = addr.split("_");
        const cr = n.parentContainer.crystals[p[1]][p[0]];
        if (cr.childBomb) {
          if (cr.childBomb.bombType == "6") {
            hasSixPlus = true;
          }
        }
      }
    }
    if (hasSixPlus && allcnt < 6) {
      return;
    }

    const finalmatch = n.digit + "-" + match;
    if (!m.includes(finalmatch))
      m.push(finalmatch);
  };

  gameSetup.addCancelEffect = (container, x, y) => {

    //gameSetup.gameEngine.loadFramedSpriteSheet(`/images/shinestar150.gif.png`, 'light', 150, 150, 8, (frames) => {
    //gameSetup.gameEngine.loadFramedSpriteSheet(`/images/waterspin2.png`, 'light', 150, 150, 15, (frames) => {
    gameSetup.gameEngine.loadFramedSpriteSheet(`/images/newexplode1.png`, 'light', 728/4, 824/4, 16, (frames) => {
      const ex = new PIXI.extras.AnimatedSprite(frames);
      ex.scale.set(0.5);

      ex.position.x = x;
      ex.position.y = y;
      ex.anchor.x = 0.5;
      ex.anchor.y = 0.5;

      container.addChild(ex);
      ex.loop = false;
      ex.animationSpeed = 0.8;
      ex.onComplete = () => {
        container.removeChild(ex);
        ex.position.x = -10000;
      };

      ex.play();
    });
  };

  gameSetup.addStarUsageEffect = (star) => {


    //gameSetup.gameEngine.loadFramedSpriteSheet(`/images/hiteffect.png`, 'stars', 192, 192, 7, (frames) => {
    gameSetup.gameEngine.loadFramedSpriteSheet(`/images/newexplode1.png`, 'light', 728/4, 824/4, 16, (frames) => {
      const ex = new PIXI.extras.AnimatedSprite(frames);
      ex.scale.set(1.1);

      ex.position.x = 0;
      ex.position.y = 5;
      ex.anchor.x = 0.5;
      ex.anchor.y = 0.5;

      star.addChild(ex);
      ex.loop = false;
      ex.animationSpeed = 0.8;
      ex.onComplete = () => {
        star.removeChild(ex);
        star.visible = false;
        // star.position.x = -10000;
      };

      ex.play();
    });
  };

  const addComboBonus = (container, matches) => {
    const combocount = matches.length;
    const bombcount = Math.min(5, combocount - 1);
    const bonus = 2 * Math.pow(2, combocount);

    // find avg position
    let totalx = 0;
    let totaly = 0;
    let cnt = 0;
    let newbombs = "";
    let newbombrcs = "";
    for (let j=0; j<matches.length; j++) {
      const m = matches[j];
      const p = m.split("-");
      for (let j=1; j<p.length; j++) {
        const p2 = p[j].split("_");
        const mr = Number(p2[0]);
        const mc = Number(p2[1]);
        const tile = container.crystals[mc][mr];
        totalx += tile.position.x;
        totaly += tile.position.y;
        cnt ++;
      }
      continue;
      if (j + 1 > bombcount) continue;
      let bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
      let bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
      let bombrc = bombr + ":" + bombc;
      if (!newbombrcs.includes(bombrc)) {
        newbombrcs += bombrc + "-";
        newbombs += BOMB_NAME[Math.floor(Math.random() * BOMB_NAME.length)] + ":" + bombrc + "-";
        // newbombs += BOMB_NAME[3] + ":" + bombrc + "-";
      }
    }

    if (container == gameSetup.mazeContainer) {
      setTimeout(() => {
        if (gameSetup.gameOver) return 0;
        if (gameSetup.showPoints)
          gameSetup.showPoints(combocount + "-Combo +"  + bonus, container.position.x + Math.max(200, totalx / cnt), container.position.y + (totaly / cnt));
        gameSetup.playBonusSound();
      }, 500);


    } else {
      gameSetup.showPoints(combocount + "-Combo +"  + bonus, container.position.x + Math.min(totalx / cnt, gameSetup.config.MazeWidth - 200), container.position.y + (totaly / cnt));
    }

    // add combo number of stars as owner
    container.changeStars(combocount);


    // add combo count number of bombs randomly!!
    // gameSetup.networkHandler.sendCommandToAll({ c: "RequestAddBombs", t: gameSetup.currentCycleTime, w: (1-container.mazeController.playerID) + "_" + newbombs});




    return bonus;
  }



  const processMatch = (container, m, extraP, bombActions) => {
    const p = m.split("-");
    let points = p.length - 3;
    if (p.length == 5) points = 2; // 4-match
    if (p.length >= 6) points = 3; // 5-match
    // if (p.length >= 7) points = 4;
    //if (p.length >= 8) points = 5;
    points += extraP;
    const d = p[0];
    let rndx = Math.random() * 30 - 15;
    let rndy = Math.random() * 30 - 15;

    // console.log("points A is " + points);

    // check if has bomb and not fake

    const bombTypes = [];
    for (let j=1; j<p.length; j++) {
      const p2 = p[j].split("_");
      const mr = Number(p2[0]);  const mc = Number(p2[1]);
      const cr = container.crystals[mc][mr];
      if (cr.digit == 9) return 0;
      if (cr.childBomb) {
        // remove it
        bombTypes.push(cr.childBomb.bombType);

        if (cr.childBomb.bombType == "R") {
          if (!bombActions.includes("R")) {
            bombActions.push("R");
          }
        }

        if (cr.childBomb.bombType == "C") {
          if (!bombActions.includes("C")) {
            bombActions.push("C");
          }
        }
        if (cr.childBomb.bombType == "H") {
          // home run for which color?
          const action = "H:" + cr.digit;
          if (!bombActions.includes(action)) {
            bombActions.push(action);
          }
        }

        cr.removeChild(cr.childBomb);
        delete cr.childBomb;
      }
    }

    if (bombTypes.includes("6")) {
      points = 1;
    }

    let totalx = 0; let totaly = 0; let cnt = 0;
    for (let j=1; j<p.length; j++) {
      const p2 = p[j].split("_");
      const mr = Number(p2[0]); const mc = Number(p2[1]);
      const cr = container.crystals[mc][mr];
      totalx += cr.x;  totaly += cr.y;   cnt ++;
      // add explosion effect
      gameSetup.addCancelEffect(container, cr.position.x, cr.position.y);
      gameSetup.showPoints(points+"", cr.position.x + container.position.x + rndx, cr.position.y + container.position.y + rndy);

      if (!bombTypes.includes("D")) {
        // so long as not dirt, will make crystal invisible, so it gets recycled
        cr.visible = false;
      } else {
        hasDirt = true;
        // apply magic: dirt effect
        cr.setTexture(PIXI.loader.resources[`/images/Crystals/PNG/Dirt.png`].texture);
        cr.digit = 9;
        cr.scale.x = gameSetup.config.TileSizeW / 340;
        cr.scale.y = gameSetup.config.TileSizeW / 340;
      }

    }

    if (bombTypes.includes("D")) {
      container.showMsg("Crystals are replaced by stone blocks.");
    }

    if (bombTypes.length > 0) {
      gameSetup.playBombSound(container);
    }

    if (bombTypes.includes("T")) {

      if (!bombActions.includes("T")) {
        bombActions.push("T");
      }

      // will give points to opponent
      // let w = `${1-container.mazeController.playerID}_${points * (p.length-1)}`;
      // gameSetup.networkHandler.sendCommandToAll({
      //   c: "ADDPOINTS", t: gameSetup.currentCycleTime, w: w
      // });

      // container.showMsg("Transfer " + (points * (p.length-1)) + " points to opponent!");
      // return 0;
    }

    if (bombTypes.includes("E")) {
      // will give points to opponent
      container.showMsg("Match erased!");
      return 0;
    }

    return points * (p.length-1);

  };

  gameSetup.startTimeout = (container) => {
    if (container.mazeController.inWaittime) {
      container.inWaitCounter = TIME_OUT_SECONDS;
      return;
    }
    const q = new PIXI.Sprite(
      PIXI.loader.resources['/images/hourglass1.png'].texture
    );
    q.parentContainer = container;
    q.position.x = gameSetup.config.MazeWidth/2;
    q.position.y = 400;
    q.anchor.set(0.5, 0.5);
    q.scale.set(0.9);
    container.addChild(q);
    container.mazeController.inWaittime = true;

    const style2 = new PIXI.TextStyle({
      // fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 240, //Math.round(config.,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#ffff00'],
      stroke: '#ffff00',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: 0, //Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    container.inWaitCounter = TIME_OUT_SECONDS;
    const labelText = new PIXI.Text("" + container.inWaitCounter, style2);
    labelText.x = q.position.x;
    labelText.y = q.position.y;
    labelText.anchor.set(0.5, 0.5);
    labelText.visible = false;
    container.addChild(labelText);


    container.waitTimeID = setInterval(() => {
      labelText.visible = true;
      container.inWaitCounter --;
      if (container.inWaitCounter == 0 || gameSetup.gameOver) {
        container.removeChild(q);
        container.removeChild(labelText);
        container.mazeController.inWaittime = false;
        clearInterval(container.waitTimeID);
      } else {
        labelText.setText(container.inWaitCounter + "");

        labelText.scale.set(0.1);
        labelText.position.y = q.position.y + 100;

        const obj = { s: 0.1, y: labelText.position.y }; // percent
        const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ s: 1, y: q.position.y }, 800) // if strength is 1000, then 1 second
          .easing(TWEEN.Easing.Quartic.Out) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            labelText.scale.set(obj.s);
            labelText.position.y = obj.y;
          });
        tween.start();
      }
    }, 1000);
  };

  gameSetup.clearHints = (container) => {
    if (gameSetup.isLocal || gameSetup.isHost) {
      if (gameSetup.playerInfo1.playerType == "AI") return;
    } else {
      if (gameSetup.playerInfo2.playerType == "AI") return;
    }
    if (container == gameSetup.mazeContainer2) return;
    const g = gameSetup.hintG;
    g.clear();
  }

  gameSetup.drawHints = () => {
    if (gameSetup.isLocal || gameSetup.isHost) {
      if (gameSetup.playerInfo1.playerType == "AI") return;
    } else {
      if (gameSetup.playerInfo2.playerType == "AI") return;
    }

    // draw all neighboring pairs
    const g = gameSetup.hintG;
    const container = gameSetup.mazeContainer;
    g.clear();
    g.lineStyle(3, 0xFFFFFF, 1); //0x007CC5
    const ccnt = gameSetup.config.TileCols;
    const rcnt = gameSetup.config.TileRows;
    const cc = container.crystals;
    const shifts = [
      [1, 1, 1, 2],
      [-1, 1, -1, 2],
      [1, 1, 0, 2],
      [-1, 1, 0, 2],
      [0, 1, -1, 2],
      [0, 1, 1, 2],
      [1, 0, 3, 0],
      [2, 0, 3, 0],
    ];
    // 1 for right, 2 for down, 3 for left, 4 for up
    const flipDir = {
      1: 2, 3: 4, 2: 1, 4: 3
    };
    const arrows = [
      [0, 0, 1],
      [0, 0, 3],
      [1, 1, 3],
      [-1, 1, 1],
      [-1, 2, 1],
      [1, 2, 3],
      [3, 0, 3],
      [0, 0, 1],
    ];
    for (let i=0; i<8; i++) {
      const s = shifts[i];
      const a = arrows[i];
      shifts.push([ s[1], s[0], s[3], s[2] ]);
      arrows.push([a[1], a[0], flipDir[a[2]]]);
    }
    const patterns = [];
    const moves = [];
    for (let k=0; k<ccnt; k++) {
      // move invisible tiles in this column to the outside
      const column = container.crystals[k];
      for (let j=0; j<rcnt; j++) {
        const c = column[j];

        /*
           1 2
           3 4
           5 6
        */

        /*
           1
             4
             6
        */

        for (let x=0; x<shifts.length; x++) {
          const s = shifts[x];
          const a = arrows[x];
          if (k + s[0] < ccnt && k + s[0] >= 0 && k + s[2] < ccnt && k + s[2] >= 0) {
            if (j + s[1] < rcnt && j + s[1] >= 0 && j + s[3] < rcnt && j + s[3] >= 0) {
              if (c.digit == cc[k+s[0]][j+s[1]].digit && c.digit == cc[k+s[2]][j+s[3]].digit) {
                patterns.push([k, j, k + s[0], j + s[1], k+s[2], j + s[3]]);
                moves.push([k + a[0], j + a[1], a[2]]);
              }
            }
          }
        }

      }
    }

    if (!gameSetup.arrows) {
      gameSetup.arrows = [];
    } else {
      for (let k=0; k < gameSetup.arrows.length; k++) {
        gameSetup.mazeContainer.removeChild(gameSetup.arrows[k]);
      }
      gameSetup.arrows = [];
    }
    for (let y=0; y<moves.length; y++) {
      const m = moves[y];
      const c0 = cc[m[0]][m[1]];
      gameSetup.drawMove2(c0, m[2], g); // draw an arrow from cc in the m[2] dir
      //gameSetup.drawLink(c0, c1, g);
      //gameSetup.drawLink(c1, c2, g);
    }


    // for (let y=0; y<patterns.length; y++) {
    //   const p = patterns[y];
    //   const c0 = cc[p[0]][p[1]];
    //   const c1 = cc[p[2]][p[3]];
    //   const c2 = cc[p[4]][p[5]];
    //   gameSetup.drawLink(c0, c1, g);
    //   gameSetup.drawLink(c1, c2, g);
    // }

  };

  gameSetup.drawMove = (c, m, g) => {
    let p2 = {x: c.position.x, y: c.position.y};
    const len = 28;
    const len2 = 6;
    if (m == 1) {
      p2.x += len;
    }
    if (m == 3) {
      p2.x -= len;
    }
    if (m == 4) {
      p2.y += len;
    }
    if (m == 2) {
      p2.y -= len;
    }

    const t = new PIXI.Sprite(
      PIXI.loader.resources[`/images/arrows/b${m}.png`].texture
    );

    t.position.x = p2.x;
    t.position.y = p2.y;

    t.scale.set(0.3 * gameSetup.config.TileSizeW / 128);
    t.anchor.set(0.5, 0.5);

    gameSetup.mazeContainer.addChild(t);
    gameSetup.arrows.push(t);
  }


  gameSetup.drawMove2 = (c, m, g) => {
    let p2 = {x: c.position.x, y: c.position.y};
    const len = gameSetup.config.TileSizeW * 0.46;
    const len2 = 6;
    if (m == 1) {
      p2.x += len;
    }
    if (m == 3) {
      p2.x -= len;
    }
    if (m == 4) {
      p2.y += len;
    }
    if (m == 2) {
      p2.y -= len;
    }

    // g.moveTo(p2.x, p2.y);
    g.drawCircle(p2.x, p2.y, gameSetup.config.TileSizeW * 0.04);

  }

  gameSetup.drawMoveOld = (c, m, g) => {
    let p2 = {x: c.position.x, y: c.position.y};
    let p3 = {x: c.position.x, y: c.position.y};
    let p4 = {x: c.position.x, y: c.position.y};

    const len = 45;
    const len2 = 6;
    if (m == 1) {
      p2.x += len;
      p3.x = p2.x - len2;
      p3.y = p2.y - len2;
      p4.x = p2.x - len2;
      p4.y = p2.y + len2;
    }
    if (m == 3) {
      p2.x -= len;
      p3.x = p2.x + len2;
      p3.y = p2.y - len2;
      p4.x = p2.x + len2;
      p4.y = p2.y + len2;
    }
    if (m == 4) {
      p2.y += len;
      p3.x = p2.x - len2;
      p3.y = p2.y - len2;
      p4.x = p2.x + len2;
      p4.y = p2.y - len2;
    }
    if (m == 2) {
      p2.y -= len;
      p3.x = p2.x - len2;
      p3.y = p2.y + len2;
      p4.x = p2.x + len2;
      p4.y = p2.y + len2;
    }
    g.moveTo(c.position.x, c.position.y);
    g.lineTo(p2.x, p2.y);
    g.lineTo(p3.x, p3.y);
    g.moveTo(p2.x, p2.y);
    g.lineTo(p4.x, p4.y);
  };

  gameSetup.drawLink = (c0, c1, g) => {
    const space = gameSetup.config.TileSizeW / 12;
    g.moveTo(c0.position.x, c0.position.y);
    g.lineTo(c1.position.x, c1.position.y);

    if ( 1 ) return;

    // vertical
    if (c0.position.x == c1.position.x) {
      g.moveTo(c0.position.x + space, c0.position.y);
      g.lineTo(c1.position.x + space, c1.position.y);
      g.moveTo(c0.position.x - space, c0.position.y);
      g.lineTo(c1.position.x - space, c1.position.y);
      return;
    }


    // horizontal
    if (c0.position.y == c1.position.y) {
      g.moveTo(c0.position.x, c0.position.y + space);
      g.lineTo(c1.position.x, c1.position.y + space);
      g.moveTo(c0.position.x, c0.position.y - space);
      g.lineTo(c1.position.x, c1.position.y - space);
      return;
    }


    g.moveTo(c0.position.x, c0.position.y + space * 1.414);
    g.lineTo(c1.position.x, c1.position.y + space * 1.414);
    g.moveTo(c0.position.x, c0.position.y - space * 1.414);
    g.lineTo(c1.position.x, c1.position.y - space * 1.414);



  };

  gameSetup.regenerateCrystals = (container, newmap) => {
    const cfg = gameSetup.config;

    const maze = [];
    const parts = newmap.split(":");
    for (let k=0; k<parts.length; k++) {
      if (parts[k].length > 0) {
        const col = [];
        maze.push(col);
        const digit = parts[k] + "";
        for (let j=0; j<gameSetup.config.TileRows; j++) {
          col.push(Number(digit.substring(j, j+1)));
        }
      }
    }



    // const maze2 = [];
    // const TYPE_CNT = gameSetup.difficulty == ADVANCED ? 6 : 5; // 5 types of crystals

    // for (let k=0; k<cfg.TileRows; k++) {
    //   const row = [];
    //   maze2.push(row);
    //   for (let j=0; j<cfg.TileCols; j++) {
    //     let d = Math.ceil(Math.random() * TYPE_CNT);
    //     if (k < 1 && j < 1) {
    //       // no need to check vertical or horizontal
    //     } else if (k >= 1 && j < 1) {
    //       // check vertical
    //       while (d == maze2[k-1][j]) {
    //         d = Math.ceil(Math.random() * TYPE_CNT);
    //       }
    //     } else if (k < 1 && j >= 1) {
    //       // check horizontal left
    //       while (d == maze2[k][j-1] ) {
    //         d = Math.ceil(Math.random() * TYPE_CNT);
    //       }
    //     } else {
    //       //while ( (d == maze2[k][j-1] || d == maze2[k][j-2])  || (d == maze2[k-1][j] && d == maze2[k-2][j]) ) {
    //       while ( d == maze2[k][j-1] || d == maze2[k-1][j] || d == maze2[k-1][j-1] ) {
    //         d = Math.ceil(Math.random() * TYPE_CNT);
    //       }
    //     }
    //     row.push(d);
    //   }
    // }
    const playerId = gameSetup.playerInfo.find(player => player.ID === container.mazeController.playerID).playerUserId;
    const mainItem = gameSetup.mainItems.find(item => item.userId === playerId);
    const resource = mainItem.imageSrc.main;

    for (let k=0; k<gameSetup.config.TileCols; k++) {
      // move invisible tiles in this column to the outside
      const column = container.crystals[k];
      for (let j=0; j<gameSetup.config.TileRows; j++) {
        const cr = column[j];
        if (!cr.visible) continue; // will be replaced later anyways
        if (cr.digit == 9) continue; // skip dirt!
        let newdigit = maze[k][j];
        cr.digit = newdigit;
        if (newdigit == 8) newdigit = 12;
        if (newdigit == 6) newdigit = 9;
        if (newdigit == 7) newdigit = 8;
        if (PIXI.loader.resources[`${resource}${newdigit}.png`]) {
          cr.setTexture(PIXI.loader.resources[`${resource}${newdigit}.png`].texture);
        } else {
          cr.setTexture(PIXI.loader.resources[`/images/Crystals/PNG/${newdigit}@2x.png`].texture);
        }
      }
    }
  };

  const handleMatching = (movedCrystals, extraP, container) => {
    // extraP = 0;
    if (gameSetup.gameOver) {
      container.inSwap = false;
      container.mazeController.isHandlingRequest = false;
      // if (!gameSetup.isLocal && !controller.isOwner) {
      //   gameSetup.inRemoteOperation = false;
      // }
      return;
    }
    // if (!gameSetup.isLocal && container !== gameSetup.mazeContainer) {
    //   // bbbbb for network game, only controller 0 can handle matching!
    //   return;
    // }
    const controller = container.mazeController;
    const cfg = gameSetup.config;
    if (movedCrystals.length == 0) {
      container.inSwap = false;
      container.mazeController.isHandlingRequest = false;
      if (!gameSetup.isLocal && !controller.isOwner) {
        gameSetup.inRemoteOperation = false;
      }
      return;
    }

    // check for match: extend in both horizontal, and then both vertical
    let matches = []; // format is ["3_5-4_5-5_5","3_6-4_6-5_6"]
    for (let k=0; k< movedCrystals.length; k++) {
      const ss = movedCrystals[k];
      if (ss.digit == 9) continue;
      findMatchesV(matches, ss);
      findMatchesH(matches, ss);
    }

    if (matches.length == 0) {
      if (movedCrystals[0].parentContainer == gameSetup.mazeContainer)
        gameSetup.drawHints();
      // if (extraP == 0 && container == gameSetup.mazeContainer ) debugger;
      container.inSwap = false;
      container.mazeController.isHandlingRequest = false;
      return;

      // only after all matching is done can we place bomb if there is a pending request
      //movedCrystals[0].parentContainer.mazeController.allowPlaceBomb();
      // console.log("matches length 0");
      if (controller.pendingDoAddBombs && !controller.pendingDoClearBombs) {
        controller.actuallyDoAddBombs(controller.pendingDoAddBombs, controller);
      }
      if (controller.pendingDoClearBombs) {
        controller.actuallyDoClearBombs(controller);
      }

      if (controller.pendingDoClearCrystals) {
        controller.actuallyDoClearCrystals(controller, controller.pendingDoClearCrystals);
        // still in swap!
        setTimeout(() => {
          gameSetup.fillDownCrystals(movedCrystals[0].parentContainer, extraP);
        }, 300);

        return;
      } else {
        container.inSwap = false;
        if (!gameSetup.isLocal && !controller.isOwner) {
          gameSetup.inRemoteOperation = false;
        }

        return;
      }
    }

    if (container == gameSetup.mazeContainer)
      gameSetup.clearHints(container);

    let totalpoints = 0;
    let maxMatch = -1;
    let bombActions = [];
    let nonErasedMatches = [];
    for (let j=0; j<matches.length; j++) {
      const m = matches[j];
      const matchBombActions = [];
      totalpoints += processMatch(movedCrystals[0].parentContainer, m, extraP, matchBombActions);
      if (!matchBombActions.includes("E")) {
        nonErasedMatches.push(m);
      }
      bombActions = bombActions.concat(matchBombActions);
      const p = m.split("-");
      if (p.length-1 > maxMatch) maxMatch = p.length-1;
    }

    // if (!gameSetup.isLocal) {
    //   // bbbbb send matches to remote controller
    //   let w = "" + extraP;
    //   for (let j=0; j<matches.length; j++) {
    //     const m = matches[j];
    //     w += "_" + m;
    //   }
    //   gameSetup.networkHandler.sendCommandToAll({
    //     c: "PROCESS_MATCHES_REMOET"  , t: gameSetup.currentCycleTime, w: w
    //   });
    // }


    matches = nonErasedMatches;

    if (bombActions.includes("R")) {
      // do complete regeneration without any 2 matching
      // regenerateCrystals(movedCrystals[0].parentContainer);
      // container.showMsg("All crystals regenerated at random!");
      if (controller.isOwner) {

        const maze2 = [];
        let newmap = "";

        const TYPE_CNT = gameSetup.difficulty == ADVANCED ? 6 : 5; // 5 types of crystals

        for (let k=0; k<cfg.TotalRandomRows; k++) {
          const row = [];
          maze2.push(row);
          for (let j=0; j<cfg.TileCols; j++) {
            let d = Math.ceil(Math.random() * TYPE_CNT);
            if (k < 2 && j < 2) {
              // no need to check vertical or horizontal
            } else if (k >= 2 && j < 2) {
              // check vertical
              while (d == maze2[k-1][j] && maze2[k-1][j] == maze2[k-2][j]) {
                d = Math.ceil(Math.random() * TYPE_CNT);
              }
            } else if (k < 2 && j >= 2) {
              // check horizontal left
              while (d == maze2[k][j-1] && maze2[k][j-1] == maze2[k][j-2]) {
                d = Math.ceil(Math.random() * TYPE_CNT);
              }
            } else {
              while ( (d == maze2[k][j-1] && maze2[k][j-1] == maze2[k][j-2])  || (d == maze2[k-1][j] && maze2[k-1][j] == maze2[k-2][j]) ) {
                d = Math.ceil(Math.random() * TYPE_CNT);
              }
            }
            row.push(d);
          }

          let newnum = 0;
          for (let j=0; j<cfg.TileCols; j++) {
            newnum *= 10;
            newnum += maze2[k][j];
          }
          //maze.push(newnum);
          newmap += newnum + ":";
        }

        if (controller.isOwner && !gameSetup.inTimeoutMode) {
          gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (controller.playerID) + "_REGENERATE_" + newmap});
        }
      }

    }

    if (bombActions.includes("C")) {


      if (controller.isOwner && !gameSetup.inTimeoutMode) {

        // clear all bombs
        let w = `${1-container.mazeController.playerID}`;
        gameSetup.networkHandler.sendCommandToAll({
          c: "REQUESTCLEARBOMBS"  , t: gameSetup.currentCycleTime, w: w
        });

        // gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (1 - controller.playerID) + "_CLEARBOMBS"});
      }
      // container.showMsg("Clear all bombs for opponent!");
    }



    if (bombActions.includes("T")) { // hour glass

      if (controller.isOwner && !gameSetup.inTimeoutMode) {
        gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (controller.playerID) + "_TIMEPAUSE_"});
      }
      // container.showMsg("Clear all bombs for opponent!");
    }

    for (let d=1; d <=12; d++) {
      if (bombActions.includes("H:" + d)) {


        if (controller.isOwner && !gameSetup.inTimeoutMode) {
          // gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (1 - controller.playerID) + "_CLEARCRYSTALS_" + d});
          let w = `${1-container.mazeController.playerID}_${d}`;
          gameSetup.networkHandler.sendCommandToAll({
            c: "REQUESTCLEARCRYSTALS"  , t: gameSetup.currentCycleTime, w: w
          });

        }

        // cancel all crystals of this color
        // let w = `${1-container.mazeController.playerID}_${d}`;
        // gameSetup.networkHandler.sendCommandToAll({
        //   c: "REQUESTCLEARCRYSTALS"  , t: gameSetup.currentCycleTime, w: w
        // });
        // let tt = "";
        // // need to customize message for each type of asset
        // if (d == 1) tt = "green";
        // if (d == 2) tt = "red";
        // if (d == 3) tt = "purple";
        // if (d == 4) tt = "orange";
        // if (d == 5) tt = "white";
        // if (d == 6) tt = "cyan";
        // if (d == 7) tt = "gold";
        // if (d == 8) tt = "emarald";
        // container.showMsg("Opponent will collect all " + tt + " crystals right away!");
      }
    }

    if (matches.length > 1) {
      // combo points
      totalpoints += addComboBonus(movedCrystals[0].parentContainer, matches);
    }

    if (totalpoints > 0)
      gameSetup.adjustTotalPoints(movedCrystals[0].parentContainer.mazeController.pinfo, totalpoints);

    if (movedCrystals[0].parentContainer == gameSetup.mazeContainer) {
      gameSetup.playMatchSound(extraP);
    }

    setTimeout(() => {
      if (gameSetup.fillDownCrystals) gameSetup.fillDownCrystals(movedCrystals[0].parentContainer, extraP);
    }, 300);

  };

  gameSetup.fillDownCrystals = (container, extraP) => {
    const cfg = gameSetup.config;
    if (gameSetup.gameOver) {
      container.mazeController.isHandlingRequest = false;
      return;
    }
    // add additional crystals from top
    if (container == gameSetup.mazeContainer) {
      gameSetup.playTileFallSound();
    }
    const newMovedList = [];
    const FallTime = 500;
    const playerId = gameSetup.playerInfo.find(player => player.ID === container.mazeController.playerID).playerUserId;
    const mainItem = gameSetup.mainItems.find(item => item.userId === playerId);
    const resource = mainItem.imageSrc.main;

    for (let k=0; k<gameSetup.config.TileCols; k++) {
      // move invisible tiles in this column to the outside
      const column = container.crystals[k];
      const newc = [];
      for (let j=0; j<gameSetup.config.TileRows; j++) {
        const cr = column[j];
        if (!cr) {
          debugger;
        }
        if (cr.visible) {
          // console.log("add orig " + j + " to newc " + newc.length);
          newc.push(cr);
          cr.position.x = cr.c * cfg.TileSizeW + cfg.TileSizeW / 2 + 2;
          cr.r = newc.length-1;
          cr.oldy = cr.position.y;
          cr.newy = ( (cfg.TileRows-1-(cr.r))  + 1 + 0.5) * cfg.TileSizeH;
          if (Math.abs(cr.oldy - cr.newy) > 0.1) {
            newMovedList.push(cr);
          }
        }
      }

      let extraRow = 1;
      for (let j=0; j<gameSetup.config.TileCols; j++) {
        const cr = column[j];
        if (!cr.visible) {
          // console.log("add orig " + j + " to newc " + newc.length);
          newc.push(cr);
          cr.r = newc.length-1;
          cr.newy = ( (cfg.TileRows-1-(cr.r))  + 1 + 0.5) * cfg.TileSizeH;
          cr.visible = true;

          // change its digit
          let newdigit = 0;

          if (container == gameSetup.mazeContainer) {
            newdigit = gameSetup.mazeC[j][gameSetup.nextRowIndexPerCol[j]++];
            if (gameSetup.nextRowIndexPerCol[j] >= gameSetup.config.TotalRandomRows) {
              gameSetup.nextRowIndexPerCol[j] = 0;
            }
          } else {
            newdigit = gameSetup.mazeC[j][gameSetup.nextRowIndexPerCol2[j]++];
            if (gameSetup.nextRowIndexPerCol2[j] >= gameSetup.config.TotalRandomRows) {
              gameSetup.nextRowIndexPerCol2[j] = 0;
            }
          }
          cr.digit = newdigit;
          if (newdigit == 8) newdigit = 12;
          if (newdigit == 6) newdigit = 9;
          if (newdigit == 7) newdigit = 8;
          if (!PIXI.loader.resources[`/images/Crystals/PNG/${newdigit}@2x.png`]) {
            debugger;
          }
          if (PIXI.loader.resources[`${resource}${newdigit}.png`]) {
            cr.setTexture(PIXI.loader.resources[`${resource}${newdigit}.png`].texture);
          } else {
            cr.setTexture(PIXI.loader.resources[`/images/Crystals/PNG/${newdigit}@2x.png`].texture);
          }
          const displayr = cfg.TileRows - 1 + (extraRow++);
          cr.position.y = ( (cfg.TileRows-1 - displayr)  + 1 + 0.5) * cfg.TileSizeH;
          cr.oldy = cr.position.y;
          cr.emitter.emit = true;
          if (Math.abs(cr.oldy - cr.newy) > 0.1) {
            newMovedList.push(cr);
          }
        }
      }
      container.crystals[k] = newc;
      if (newc.length != 8) {
        // debugger;
      }
    }


    const obj = { p: 0 }; // percent
    const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
      .to({ p: 1 }, FallTime) // if strength is 1000, then 1 second
      .easing(TWEEN.Easing.Bounce.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() => { // Called after tween.js updates 'coords'.
        for (let k=0; k<gameSetup.config.TileCols; k++) {
          // move invisible tiles in this column to the outside
          const column = container.crystals[k];
          for (let j=0; j<gameSetup.config.TileRows; j++) {
            const cr = column[j];
            if ( Math.abs(cr.oldy - cr.newy) > 0.01 ) {
              if (!cr.emitter.emit) {
                cr.emitter.emit = true;
              }
              cr.position.y = cr.oldy + (cr.newy - cr.oldy) * obj.p;
              if (obj.p >= 0.99) {
                cr.emitter.emit = false;
              } else {
                // if (!gameSetup.emitterelapsed) {
                //   gameSetup.emitterelapsed = now - 100;
                // }
                // cr.emitter.update((now - gameSetup.emitterelapsed) * 0.001);
              }
            }
          }
        }
      })
      .onComplete(() => {
        handleMatching(newMovedList, extraP+1, container);
      });
    tween.start();

    if (gameSetup.gameOver) {
      container.mazeController.isHandlingRequest = false;
      return;
    }

    // setTimeout(()=> {
    //   // console.log("new round of handle matching " + (extraP + 1));
    //   handleMatching(newMovedList, extraP+1, container);
    // },FallTime);
  }

  gameSetup.showSwapEffect = (s, t, id) => {
    const cfg = gameSetup.config;
    const container = s.parentContainer;
    const imgfile = s.c == t.c ? `/images/beamh2.png` : `/images/beamh2.png`;
    const q = new PIXI.Sprite(
      PIXI.loader.resources[imgfile].texture
    );
    // q.tint = "0x444444";
    q.parentContainer = container;
    q.position.x = (s.position.x + t.position.x) / 2;
    q.position.y = (s.position.y + t.position.y) / 2;
    if (s.c == t.c) {
      q.position.x += id * 18;
      q.rotation = Math.PI / 2;
    } else {
      q.position.y += id * 18 - 3;
    }
    q.anchor.set(0.5, 0.5);
    q.scale.x = cfg.TileSizeW * 0.8  / 850;
    q.scale.y = cfg.TileSizeW / 850;
    container.addChild(q);

    setTimeout(() => {
      container.removeChild(q);
    }, 200);
  }


  gameSetup.swapCrystals = (s, t) => {
    // s.zOrder = 100;
    // t.zOrder = 90;
    if (gameSetup.arrows && s.parentContainer == gameSetup.mazeContainer) {
      for (let k=0; k < gameSetup.arrows.length; k++) {
        gameSetup.mazeContainer.removeChild(gameSetup.arrows[k]);
      }
      gameSetup.arrows = [];
    }

    s.parentContainer.inSwap = true;
    if (s.parentContainer == gameSetup.mazeContainer) {
      gameSetup.playSwapSound();
    }
    gameSetup.showSwapEffect(s, t, 0);
    gameSetup.showSwapEffect(s, t, -1);
    gameSetup.showSwapEffect(s, t, 1);
    gameSetup.showSwapEffect(s, t, -2);
    gameSetup.showSwapEffect(s, t, 2);
    s.parentContainer.crystals[s.c][s.r] = t;
    s.parentContainer.crystals[t.c][t.r] = s;
    const tempr = s.r;
    const tempc = s.c;
    s.r = t.r; s.c = t.c;
    t.r = tempr; t.c = tempc;

    // play animation to swap
    // console.log("enter inSwap " + " " + s.r + " " + s.c + " " + t.r + " " + t.c);

    const obj = { x: t.x, y: t.y, x2: s.x, y2: s.y };
    const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
      .to({ x: s.x, y: s.y, x2: t.x, y2: t.y }, 300) // if strength is 1000, then 1 second
      .easing(TWEEN.Easing.Quadratic.Out) //
      // .easing(TWEEN.Easing.Bounce.Out) // https://sole.github.io/tween.js/examples/03_graphs.html
      .onUpdate(() => { // Called after tween.js updates 'coords'.
        t.x = obj.x; t.y = obj.y; s.x = obj.x2; s.y = obj.y2;
      })
      .onComplete(() => {
        // console.log("handle matching for inSwap " + " " + s.r + " " + s.c + " " + t.r + " " + t.c);
        handleMatching([s, t], 0, s.parentContainer);
      });
    tween.start();

  };

  const updateCrystal = (event) => {
    if (gameSetup.inTimeoutMode) return;
    const c = event.currentTarget;
    if (c.childBomb) return;
    if (c.parentContainer.mazeController.inWaittime) return;
    const config = gameSetup.config;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const whratio = config.TrueWidth / config.TrueHeight; // width vs height
      const oldnewratio = config.TrueWidth / 1600; // new vs old true width
      const metalBorderThick = 33.3964 * oldnewratio * 1.1;
      const wtabletop = 2000; // table is 2000x1000 now!
      const wfulltable = wtabletop + 2 * metalBorderThick;
      const hfulltable = wtabletop/2 + 2 * metalBorderThick;

      const px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
      const py = (config.TrueHeight - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;

      c.x = px;
      c.y = py;
    } else {
      c.newx = Math.fround(event.data.global.x / gameSetup.stage.scale.x) - c.parent.position.x - c.draggingOffsetX;
      c.newy = Math.fround(event.data.global.y / gameSetup.stage.scale.y) - c.parent.position.y - c.draggingOffsetY;
    }
    const SWAP_THRESHOLD = config.TileSizeH / 5;
    let dir = "";
    let target = null;
    // console.log("y: " + c.newy + " " + c.origy);
    if (c.newx - c.origx > SWAP_THRESHOLD && c.c < config.TileCols) {
      // swap to right
      target = c.parentContainer.crystals[c.c + 1][c.r];
      dir = "R";
    } else if (c.newx - c.origx < 0 - SWAP_THRESHOLD && c.c > 0) {
      // swap to left
      target = c.parentContainer.crystals[c.c - 1][c.r];
      dir = "L";
    } else if (c.newy - c.origy > SWAP_THRESHOLD && c.r > 0) {
      // swap to down
      target = c.parentContainer.crystals[c.c][c.r-1];
      dir = "D";
    } else if (c.newy - c.origy < 0 - SWAP_THRESHOLD && c.r < config.TileRows) {
      // swap to up
      target = c.parentContainer.crystals[c.c][c.r+1];
      dir = "U";
    }
    if (dir != "") {

      // check if next is dirt!
      if (target.digit == 9) return;
      if (target.childBomb) return;

      if (gameSetup.draggingTarget) {
        gameSetup.draggingTarget.dragging = false;
        gameSetup.draggingTarget.scale.x = 0.9 * gameSetup.config.TileSizeW / 155;
        gameSetup.draggingTarget.scale.y = 0.9 * gameSetup.config.TileSizeW / 155;
        delete gameSetup.draggingTarget;
      }


      c.scale.x = 0.9 * config.TileSizeW / 155;
      c.scale.y = 0.9 * config.TileSizeW / 155;
      c.dragging = false;

      // gameSetup.mazeControllers[0].initOrder({
      //   action: "SWAPTILE", r: c.r, c: c.c, type: dir
      // });
      gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (c.parentContainer.mazeController.playerID) + "_SWAPTILE_" + c.r + "_" + c.c + "_" + dir});


    }
  };



  const onDragStart = (event) => {
    if (gameSetup.mazeContainer.inSwap) return;
    if (gameSetup.inTimeoutMode) return;
    if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }
    const t = event.currentTarget;
    // if (t.childBomb) return;
    const container = t.parentContainer;
    if (container.mazeController.inWaittime) return;
    if (t.digit == 9) return;


    if (gameSetup.draggingTarget) {
      gameSetup.draggingTarget.dragging = false;
      gameSetup.draggingTarget.scale.x = 0.9 * gameSetup.config.TileSizeW / 155;
      gameSetup.draggingTarget.scale.y = 0.9 * gameSetup.config.TileSizeW / 155;
      delete gameSetup.draggingTarget;
    }

    gameSetup.draggingTarget = t;
    t.dragging = true;
    t.origx = t.x;
    t.origy = t.y;
    t.scale.x *= 0.8;
    t.scale.y *= 0.8;
    const calcx = Math.fround(event.data.global.x / gameSetup.stage.scale.x) - t.parent.position.x;
    const calcy = Math.fround(event.data.global.y / gameSetup.stage.scale.y) - t.parent.position.y;
    t.draggingOffsetX = calcx - t.x;
    t.draggingOffsetY = calcy - t.y;
    updateCrystal(event);
    event.stopped = true;
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
  };

  const onDragEnd = (event) => {
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }

    if (gameSetup.draggingTarget) {
      gameSetup.draggingTarget.dragging = false;
      gameSetup.draggingTarget.scale.x = 0.9 *  gameSetup.config.TileSizeW / 155;
      gameSetup.draggingTarget.scale.y = 0.9 * gameSetup.config.TileSizeW / 155;
      delete gameSetup.draggingTarget;
    }

    const t = event.currentTarget;
    if (t.digit == 9) return;
    t.dragging = false;
    t.scale.x = 0.9 * gameSetup.config.TileSizeW / 155;
    t.scale.y = 0.9 * gameSetup.config.TileSizeW / 155;
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
    event.stopped = true;
  };

  const onDragMove = (event) => {
    if (gameSetup.mazeContainer.inSwap) return;
    if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }

    const t = event.currentTarget;
    if (t.digit == 9) return;
    if (!t.dragging) return;
    // console.log("in dragging...");
    updateCrystal(event);
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
    event.stopped = true;
  };


  this.enableDraggingCrystal = (c) => {

    const config = gameSetup.config;
    c.interactive = true;

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



  // bomb dragging:

  const calculateTargetTile = (b, container) => {
    const cfg = gameSetup.config;
    // has to be within border!
    // console.log("b " + b.y + " container " + container.y + " " + (container.y + cfg.MazeWidth));
    if (b.x < container.x || b.x > container.x + cfg.MazeWidth || b.y < container.y || b.y > container.y + cfg.MazeWidth + cfg.TileSizeW) {
      return null;
    }

    let mindist = 1000000;
    let mintarget = -1;
    for (let c=0; c<cfg.TileCols; c++) {
      for (let r=0; r < cfg.TileRows; r++) {
        // calculate center of that tile
        const t = {r, c};
        t.x = c * cfg.TileSizeW + cfg.TileSizeW / 2 + 2 + container.x;
        t.y = ( (cfg.TileRows-1-r)  + 1 + 0.5) * cfg.TileSizeH + container.y;

        const dist = (t.x  - b.x)*(t.x- b.x) + (t.y - b.y)*(t.y - b.y);
        if (dist < mindist) {
          mindist = dist;
          mintarget = t;
        }
      }
    }
    return mintarget;
  }

  const updateBomb = (event) => {
    const c = event.currentTarget;



    const config = gameSetup.config;
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      const whratio = config.TrueWidth / config.TrueHeight; // width vs height
      const oldnewratio = config.TrueWidth / 1600; // new vs old true width
      const metalBorderThick = 33.3964 * oldnewratio * 1.1;
      const wtabletop = 2000; // table is 2000x1000 now!
      const wfulltable = wtabletop + 2 * metalBorderThick;
      const hfulltable = wtabletop/2 + 2 * metalBorderThick;

      const px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
      const py = (config.TrueHeight - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;

      c.x = px;
      c.y = py;
    } else {
      c.x = Math.fround(event.data.global.x / gameSetup.stage.scale.x) - c.draggingOffsetX;
      c.y = Math.fround(event.data.global.y / gameSetup.stage.scale.y) - c.draggingOffsetY;
    }

    const targetTile = calculateTargetTile(c, gameSetup.mazeContainer2);
    if (targetTile != null) {
      // show dropping target square

      const g = gameSetup.bombG;
      if (g.r != targetTile.r || g.c != targetTile.c) {
        g.clear();
        g.lineStyle(5, 0xffff00, 1);
        g.r = targetTile.r;
        g.c = targetTile.c;
        g.drawCircle(targetTile.x, targetTile.y-2, gameSetup.config.TileSizeW * 0.5);
      }

    }
  };



  const onDragBStart = (event) => {
    if (gameSetup.inPlacingBomb) return;
    if (gameSetup.inTimeoutMode) return;
    if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }
    if (gameSetup.mazeContainer.mazeController.inWaittime) return;
    const t = event.currentTarget;

    const container = gameSetup.mazeContainer;
    if (container.visibleStarCount < t.starCost) {
      return;
    }

    gameSetup.inPlacingBomb = true;
    t.dragging = true;
    t.origx = t.x;
    t.origy = t.y;
    t.scale.x *= 0.8;
    t.scale.y *= 0.8;
    const calcx = Math.fround(event.data.global.x / gameSetup.stage.scale.x); // - t.parent.position.x;
    const calcy = Math.fround(event.data.global.y / gameSetup.stage.scale.y); // - t.parent.position.y;
    t.draggingOffsetX = calcx - t.x;
    t.draggingOffsetY = calcy - t.y;
    // updateBomb(event);
    event.stopped = true;
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
  };

  const onDragBEnd = (event) => {
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }

    const t = event.currentTarget;
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
    event.stopped = true;
    gameSetup.inPlacingBomb = false;
    t.scale.set(0.67);
    t.dragging = false;
    const g = gameSetup.bombG;
    g.clear();

    g.r = -1;
    g.c = -1;

    const targetTile = calculateTargetTile(t, gameSetup.mazeContainer2);
    t.position.x = t.origx;
    t.position.y = t.origy;
    if (targetTile == null) {
      return;
    }


    // gameSetup.mazeControllers[1].initOrder({
    //   action: "PLACEBOMB", r: targetTile.r, c: targetTile.c, type: t.bombType
    // });

    gameSetup.mazeContainer.changeStars(0 - t.starCost);
    gameSetup.networkHandler.sendCommandToAll({
      c: "REQUESTUSESTICKER"  , t: gameSetup.currentCycleTime, w: (gameSetup.mazeContainer.mazeController.playerID) + "_USESTICKER_" + targetTile.r + "_" + targetTile.c + "_" + t.bombType
    });


  };

  const onDragBMove = (event) => {
    if (gameSetup.mazeContainer.inSwap) return;
    if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }

    const t = event.currentTarget;
    if (!t.dragging) return;
    // console.log("in dragging...");
    updateBomb(event);
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
    event.stopped = true;
  };

  const onClickBStart = (event) => {
    if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
    if (gameSetup.inTimeoutMode) return;
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }
    const t = event.currentTarget;
    if (gameSetup.mazeContainer.mazeController.inWaittime) return;

    const container = gameSetup.mazeContainer;
    const container2 = gameSetup.mazeContainer2;
    if (container.visibleStarCount < t.starCost) {
      return;
    }
    container.changeStars(0 - t.starCost);

    let bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
    let bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
    let bombrc = bombr + ":" + bombc;
    // make sure no bomb is already at that location

    let cnt = 0;
    while (container2.crystals[bombc][bombr].childBomb) {
      cnt ++;
      if (cnt > 100) break;
      bombr = Math.floor(Math.random()*gameSetup.config.TileRows);
      bombc = Math.floor(Math.random()*gameSetup.config.TileCols);
      bombrc = bombr + ":" + bombc;
    }

    // let newbombs = t.bombType + ":" + bombrc + "-";

    // gameSetup.networkHandler.sendCommandToAll({ c: "RequestAddBombs", t: gameSetup.currentCycleTime, w: (1-container.mazeController.playerID) + "_" + newbombs});

    // we will flip the controller playerID on receiving USESTICKER requests

      // gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (1 - controller.playerID) + "_CLEARCRYSTALS_" + d});
      // let w = `${container.mazeController.playerID}_${d}`;
      gameSetup.networkHandler.sendCommandToAll({
        c: "REQUESTUSESTICKER"  , t: gameSetup.currentCycleTime, w: (container.mazeController.playerID) + "_USESTICKER_" + bombr + "_" + bombc + "_" + t.bombType
      });


    // gameSetup.networkHandler.sendCommandToAll({ c: "NewRequest", t: gameSetup.currentCycleTime, w: (container.mazeController.playerID) + "_USESTICKER_" + bombr + "_" + bombc + "_" + t.bombType});


    event.stopped = true;
    event.data.originalEvent.preventDefault();
    event.data.originalEvent.stopPropagation();
  };

  this.enableClickingBomb = (b) => {
    if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
      if (gameSetup.isLocal || gameSetup.isHost) {
        if (gameSetup.playerInfo1.playerType == "AI") return;
      } else {
        if (gameSetup.playerInfo2.playerType == "AI") return;
      }
    }
    const config = gameSetup.config;
    b.interactive = true;

    b
        // events for drag start
        .on('mousedown', onClickBStart)
        .on('touchstart', onClickBStart)
  };

  this.enableDraggingBomb = (b) => {

    const config = gameSetup.config;
    b.interactive = true;

    b
        // events for drag start
        .on('mousedown', onDragBStart)
        .on('touchstart', onDragBStart)
        // events for drag end
        .on('mouseup', onDragBEnd)
        .on('mouseupoutside', onDragBEnd)
        .on('touchend', onDragBEnd)
        .on('touchendoutside', onDragBEnd)
        // events for drag move
        .on('mousemove', onDragBMove)
        .on('touchmove', onDragBMove);
  };





  this.addIllumination = () => {
    // doesn't work for webgl canvas!!
    const config = gameSetup.config;
    console.log('addIllumination');
    // gameSetup.centerLight = gameSetup.add.illuminated.lamp(config.tableCenterX, config.tableCenterY /*,{ illuminated lamp config object }*/);
    const light = new window.illuminated.Lamp({
      // position: new illuminated.Vec2(config.tableCenterX, config.tableCenterY),
      distance: 800,
      width: 1,
      height: 1,
      centerX: config.tableCenterX,
      centerY: config.tableCenterY,
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

    // var cx = config.tableCenterX/2;
    // gameSetup.topLight = gameSetup.add.illuminated.lamp(cx, 10, {
    //   // position: new illuminated.Vec2(config.tableCenterX, config.tableCenterY),
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

  const knobAreas = [];

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
              value: 0.8,
              time: 0
            },
            {
              value: 0.1,
              time: 1
            }
          ],
          isStepped: false
        },
        scale: {
          list: [
            {
              value: 0.2,
              time: 0
            },
            {
              value: 0.02,
              time: 1
            }
          ],
          isStepped: false
        },
        color: {
          list: [
            {
              value: "AEF5FA", //"FFFDAB",
              time: 0
            },
            {
              value: "AEF5FA",
              time: 1
            }
          ],
          isStepped: false
        },
        speed: {
          list: [
            {
              value: 300,
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
          max: 1
        },
        lifetime: {
          min: 0.2,
          max: 0.5
        },
        frequency: 0.002,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 0.5,
        maxParticles: 1000,
        pos: {
          x: 0,
          y: 0
        },
        addAtBack: false,
        //spawnType: "ring",
        // spawnCircle: {
        //   x: 0,
        //   y: 0,
        //   r: maxr,
        //   minR: maxr - 3
        // }

        // https://github.com/pixijs/pixi-particles/blob/master/src/Emitter.ts
        spawnType: "rect",
        spawnRect: {
          x: -77, y: -77, w: 155, h: 155
        }
      }
    );
    emitter.containercc = cc;
    return emitter;
  };


  this.addInputEmitter = (crystal) => {

    // add spark emitter
    const ec = new PIXI.Container();

    crystal.addChild(ec);

    let maxr = (gameSetup.config.TrueWidth * 0.06) / 2;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      maxr = (gameSetup.config.TrueWidth * 0.12) / 2;
    }

    const emitter = addEmitter(ec, maxr + 3);
    // emitter.container.position.x = 100;
    // emitter.container.position.y = 100;
    // emitter.visible = true;
    // emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);
    emitter.emit = false;
    crystal.emitter = emitter;
    gameSetup.emitters.push(emitter);
    //gameSetup.emitter = emitter;
    // return emitter;
  };


  gameSetup.addGoldEmitter = () => {

    // add spark emitter
    const ec = new PIXI.Container();

    gameSetup.stage.addChild(ec);

    let maxr = (gameSetup.config.TrueWidth * 0.2) / 2;
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   maxr = (gameSetup.config.TrueWidth * 0.06) / 2;
    // }

    const emitter = new PIXI.particles.Emitter(

      // The PIXI.Container to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the root stage Container
      ec,

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
              value: 0,
              time: 1
            }
          ],
          isStepped: false
        },
        scale: {
          list: [
            {
              value: 0.5,
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
              value: "ffff00",
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
              value: 10,
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
          max: 0.9
        },
        frequency: 0.004,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 0.8,
        maxParticles: 5000,
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
          minR: 5
        }
      }
    );
    emitter.containercc = ec;
    //const emitter = addEmitter(ec, maxr + 3);
    // emitter.container.position.x = 100;
    // emitter.container.position.y = 100;
    // emitter.visible = true;
    // emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);
    emitter.emit = false;
    gameSetup.goldemitter = emitter;
  };


  this.addHelpQuestionMark = () => {
    const config = gameSetup.config;

    // controls help box
    let bg, ratio;

    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/match3rules6.png"].texture);
      ratio = (config.tableW * 0.92) / 1147;
    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/match3rules6.png"].texture);
      ratio = (config.tableW * 0.92) / 1417;
    }
    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.position.x = config.tableCenterX;
    bg.position.y = 520;
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
    bg2.position.x = 270;
    bg2.position.y = 92;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    bg2.buttonMode = true;
    gameSetup.stage.addChild(bg2);

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





  this.addQuitButton = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/quitbtn.png"].texture);
    let ratio = (config.tableW * 0.103) / 242;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = 115;
    bg.position.y = 92;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = true;
    bg.buttonMode = true;
    gameSetup.stage.addChild(bg);
    // gameSetup.controlButtons.push(bg);


    // exit warning message
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/exitwarning.png"].texture);
    ratio = (config.tableW * 0.75) / 738;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    const tableCenterY = 500;
    bg2.position.x = config.tableCenterX;
    bg2.position.y = tableCenterY;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;
    gameSetup.stage.addChild(bg2);

    // add 2 buttons

    const bg3 = new PIXI.Sprite(PIXI.loader.resources["/images/quitbtn.png"].texture);
    ratio = (config.tableW * 0.103) / 242;
    bg3.scale.set(ratio, ratio); // will overflow on bottom
    bg3.position.x = config.tableCenterX - config.tableW * 0.15;
    bg3.position.y = tableCenterY + config.tableH * 0.12;
    bg3.anchor.set(0.5, 0.5);
    bg3.visible = false;
    bg3.buttonMode = true;
    bg3.interactive = true;
    gameSetup.stage.addChild(bg3);

    const bg4 = new PIXI.Sprite(PIXI.loader.resources["/images/staybtn.png"].texture);
    bg4.scale.set(ratio, ratio); // will overflow on bottom
    bg4.position.x = 2 * config.tableCenterX - bg3.position.x;
    bg4.position.y = bg3.position.y;
    bg4.anchor.set(0.5, 0.5);
    bg4.interactive = true;
    bg4.visible = false;
    bg4.buttonMode = true;
    gameSetup.stage.addChild(bg4);


    gameSetup.showExitWarning = () => {
      let id = 0;
      if (gameSetup.room.playerInfo[1].userId == Meteor.userId()) {
        id = 1;
      }
      if (gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.AUTORUN) {
        gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});
        // gameSetup.exitGame();
        return;
      } else if (gameSetup.gameType == GAME_TYPE.MATCH && gameSetup.gameOver) {
        gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});
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





  this.reAddModalMessageScreen = () => {
    gameSetup.stage.removeChild(gameSetup.modalbg2);
    gameSetup.stage.addChild(gameSetup.modalbg2);


  }


  this.addModalMessageScreen = () => {
    const config = gameSetup.config;

    // game over message background
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/tishi.png"].texture);
    let ratio = (config.tableW * 0.95) / 1000;
    bg2.scale.set(ratio*1.5, ratio*1.5); // will overflow on bottom

    const tableCenterY = 500;
    bg2.position.x = config.tableCenterX;
    bg2.position.y = tableCenterY;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;

    // message header
    const style2 = new PIXI.TextStyle({
      //fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: config.tableW / 60,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#ffff00'],
      stroke: '#ffff00',
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
    // headerText.x = config.tableW * 0.75 / 2;
    headerText.x = 0;
    headerText.y = 0 - config.tableH * 0.05 + 30;
    // headerText.y = 0;
    headerText.anchor.set(0.5, 0.5);
    headerText.visible = true;
    bg2.addChild(headerText);
    bg2.headerText = headerText;
    bg2.interactive = false;

    // message content
    const style3 = new PIXI.TextStyle({
      //fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: config.tableW / 80,
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
      wordWrapWidth: config.tableW * 0.6
    });

    const msgText = new PIXI.Text(``, style3);
    msgText.x = headerText.x;
    msgText.y = 0 - config.tableH * 0.01 + 30;
    // msgText.y = config.tableH * 0.05;
    msgText.anchor.set(0.5, 0.5);
    msgText.visible = true;
    bg2.addChild(msgText);
    bg2.msgText = msgText;


    // add exit button
    const exitbtn = new PIXI.Sprite(PIXI.loader.resources["/images/exitbtn.png"].texture);
    ratio = (config.tableW * 0.03) / 242;
    exitbtn.scale.set(ratio, ratio); // will overflow on bottom
    exitbtn.position.x = config.tableW * 0.05;
    exitbtn.position.y = config.tableH * 0.05;
    exitbtn.anchor.set(0.5, 0.5);
    exitbtn.visible = true;
    exitbtn.buttonMode = true;
    exitbtn.interactive = false;
    bg2.addChild(exitbtn);
    // bg2.exitbtn = bg3;

    // add replay button
    const replaybtn = new PIXI.Sprite(PIXI.loader.resources["/images/replaybtn.png"].texture);
    ratio = (config.tableW * 0.03) / 242;
    replaybtn.scale.set(ratio, ratio); // will overflow on bottom
    replaybtn.position.x = 0 - config.tableW * 0.05;
    replaybtn.position.y = config.tableH * 0.05;
    replaybtn.anchor.set(0.5, 0.5);
    replaybtn.visible = true;
    replaybtn.buttonMode = true;
    replaybtn.interactive = false;
    bg2.addChild(replaybtn);
    // bg2.exitbtn = replaybtn;


    gameSetup.modalbg2 = bg2;
    gameSetup.stage.addChild(bg2);



    gameSetup.showModalMessage = (header, msg, mode) => {
      gameSetup.inModal = true;
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
        exitbtn.position.x = 0 + config.tableW * 0.05;
        replaybtn.visible = true;
        exitbtn.interactive = true;
        replaybtn.interactive = true;
      } else if (mode == MODAL_NOBUTTON) {
        // exitbtn.position.x = 0 + config.tableW * 0.05;
        replaybtn.visible = false;
        exitbtn.visible = false;
        exitbtn.interactive = false;
        replaybtn.interactive = false;
      }

      // bg3.visible = true; headerText.visible = true; bg3.interactive = true; bg4.interactive = true;
    };
    gameSetup.hideModalMessage = () => {
      gameSetup.inModal = false;
      bg2.visible = false;
      exitbtn.interactive = false;
      replaybtn.interactive = false;
      // if (headerText.text.indexOf("The Winner Is ") >= 0) {
        // gameSetup.exitGame();
      // }
      // bg3.visible = false; bg4.visible = false; bg3.interactive = false; bg4.interactive = false;
    };

    gameSetup.exitBtnHandler = () => {
      gameSetup.hideModalMessage();
      gameSetup.hideExitWarning();
      // let id = gameSetup.activePlayerInfo.ID;
      // if (gameSetup.activePlayerInfo.isLocal) {
      //   id = gameSetup.activePlayerInfo.ID;
      // }

      if (gameSetup.renderer && gameSetup.renderer.plugins && gameSetup.renderer.plugins.interaction)
        gameSetup.renderer.plugins.interaction.destroy();

      if (gameSetup.isLocal) {
        console.log("in exitBtnHandler with local gameSetup.networkHandler");
        // have not setup game room yet
        if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
          const cmdstr = `ExitGameRoom;${gameSetup.currentCycleTime};0`;
          this.saveCommand(cmdstr);
        }
        //gameSetup.config.showHeadline("Exiting Game Room", 2);
        // gameSetup.showModalMessage(`Exiting Game Room`, ``, MODAL_NOBUTTON);
        gameSetup.exitGame();

        // if (!gameSetup.room) return;
        //   // if (gameSetup.renderer.plugins.accessibility && gameSetup.renderer.plugins.accessibility.children)
        //   //   gameSetup.renderer.plugins.accessibility.destroy();
        // switch (gameSetup.room.gameType) {
        //   case 1:
        //     gameSetup.reacthistory.push("/gamesRoomEntry");
        //     break;
        //   case 2:
        //     // const link = Meteor.userId() === gameSetup.room.owner ? '/gamesRoomNetwork/' : `/gamesRoomNetwork/${gameSetup.room.gameRoomId}`;
        //     // gameSetup.reacthistory.push(link, { notiId: gameSetup.room.notiId });
        //     break;
        //   case 4:
        //     // if (gameSetup.activePlayerInfo) {
        //     //   const params = {
        //     //     modalIsOpen: true,
        //     //     sectionKey: gameSetup.pairData.sectionId,
        //     //     tournamentId: gameSetup.pairData.tournamentId
        //     //   };
        //     //   PoolActions.finishTournamentSectionRound(
        //     //     gameSetup.pairData.roundId,
        //     //     gameSetup.activePlayerInfo.playerUserId,
        //     //     gameSetup.pairData.id,
        //     //     PLAYER_TYPE.WINNER
        //     //   );
        //     // }
        //     //gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
        //     gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`);
        //     break;
        // }
        return;
      } else {
        if (!gameSetup.room) return;
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
              PoolActions.finishTournamentSectionRound(
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
        }
      }
      let id = 0;
      if (gameSetup.room.playerInfo[1].userId == Meteor.userId()) {
        id = 1;
      }

      gameSetup.config.showHeadline("Exiting Game Room", 2);
      // console.log("ExitGameRoom sent from " + id);
      gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});

      gameSetup.exitGame();

      // gameSetup.sounds.backgroundmusic.stop();
      // window.gameSetup.showModalMessage(`Exiting Game`, `You have chosen to exit the game room.`, MODAL_NOBUTTON);

      // gameSetup.exitGame();
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

    const ratio = (config.tableW * 0.8) / 1111;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.tableCenterX;
    bg.position.y = (config.TrueHeight - config.tableH - 2 * config.metalBorderThick) / 2;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = false;
    gameSetup.stage.addChild(bg);
  };

  this.addBackGround = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/underempty4.png"].texture);

    bg.scale.set(1); // will overflow on bottom

    bg.position.x = 0;
    bg.position.y = 0;
    bg.anchor.set(0, 0);
    bg.interactive = true;
    bg.name = "bluebackground";
    gameSetup.stage.addChild(bg);

    // bg.on('pointerdown', () => {
      // debugger;
      //bg.visible = false;
      //bg.interactive = false;
    // });


    gameSetup.bluebackground = bg;
  };




  this.addPlayerPanelNew = (c, pi) => {
    const config = gameSetup.config;
    pi.panel = c;
    //const gb = this.gameSetup.add.graphics(0, 0);

    const size = Math.floor(2.4 * config.scalingratio);

    const style = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: '',
      // fontWeight: 'bold',
      fill: ['#ffd08f'],
      stroke: '#ffd08f',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 2440
    });

    const text = new PIXI.Text(c.userName.substring(0, 18), style);
    text.position.x = c.cx + c.w * 0;
    text.position.y = c.cy;
    text.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(text);



    const style2 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size*1.4,
      fontStyle: '',
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

    // points collected
    const text2 = new PIXI.Text(0, style2);
    text2.position.x = c.cx + 20;
    text2.position.y = c.cy + 63;
    text2.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(text2);

    pi.pointsText = text2;
    pi.points = 0;
    pi.extraCoins = 0;
    pi.addPoints = function(chg) {
      if (isNaN(chg)) {
        debugger;
      }
      pi.points += chg;
      pi.pointsText.setText(pi.points);
    }


    const a = PIXI.Sprite.fromImage(pi.playerAvatarURL, true);
    a.texture.baseTexture.on('loaded', function(){
      // console.log(a.texture.orig.width, a.texture.orig.height);
      a.scale.set(90 / a.texture.orig.width, 90 / a.texture.orig.height);
    });
    // if (pi.playerAvatarURL == "/img_v2/ProfileIcon.png") {
    //   a.scale.set(0.135);
    // } else {
    //   a.scale.set(0.8);
    // }
    a.scale.set(0.4, 0.4);


    a.position.x = c.cx + 198;
    if (c.PanelID == 1) {
      a.position.x = c.cx - 212;
    }
    a.position.y = c.cy + 37;
    a.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(a);

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
      wordWrapWidth: 440
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

  this.addBombTargetG = () => {
    gameSetup.bombG = new PIXI.Graphics();
    gameSetup.bombG.zOrder = 106;
    gameSetup.stage.addChild(gameSetup.bombG);
    gameSetup.bombG.r = -1;
    gameSetup.bombG.c = -1;
  }

  this.addHintG = () => {
    gameSetup.hintG = new PIXI.Graphics();
    gameSetup.hintG.zOrder = 106;
    gameSetup.mazeContainer.addChild(gameSetup.hintG);
  }

  this.addBombList = () => {
    const cfg = gameSetup.config;
    const size = Math.floor(2.5 * cfg.scalingratio);
    const style0 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 44,
      fontStyle: '',
      fontWeight: 'bold',
      fill: ['#ffffff'], // gradient
      stroke: '#ff0000',
      strokeThickness: 2,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: false,
      wordWrapWidth: 440
    });

    gameSetup.bombList = [];

    if (gameSetup.difficulty == ADVANCED) {
      // BOMB_COST["D"] = 8;
    }

    for (let k=0; k<6; k++) {
      const richText0 = new PIXI.Text(BOMB_COST[BOMB_NAME[k]], style0);
      let baseX = cfg.tableCenterX + 27;
      const baseY = cfg.tableCenterY + 110 + 112 * k;
      if (gameSetup.difficulty == ADVANCED) {
        // baseX += 2;
      }
      // richText0.position.x = baseX - 41;
      // richText0.position.y = baseY - 40;
      richText0.position.x = baseX + 41;
      richText0.position.y = baseY + 37;
      richText0.anchor.set(0.5, 0.5);
      gameSetup.stage.addChild(richText0);

      const b = new PIXI.Sprite(PIXI.loader.resources["/images/Bomb_" + BOMB_NAME[k] + "3.png"].texture);
      b.bombType = BOMB_NAME[k];
      b.starCost = BOMB_COST[b.bombType];
      // b.tint = 0x040404;
      b.alpha = 0.6;

      if (gameSetup.difficulty == BEGINNER) {
        this.enableClickingBomb(b);
      } else {
        this.enableDraggingBomb(b);
      }

      b.scale.set(0.67);
      b.position.x = baseX;
      //if (k >= 3) b.position.x -= 5;
      b.position.y = baseY;
      b.origx = b.position.x;
      b.origy = b.position.y;
      //if (k == 1 || k == 4) b.position.y -= 2;

      b.anchor.set(0.5, 0.5);
      gameSetup.stage.addChild(b);
      gameSetup.bombList.push(b);

    }

  }

  this.addGameTimer = () => {
      const cfg = gameSetup.config;
      const size = Math.floor(4.5 * cfg.scalingratio);
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

      let clockTimeStr = "03:00";
      if (gameSetup.difficulty == ADVANCED) {
        clockTimeStr = "05:00";
      }

      const richText0 = new PIXI.Text(clockTimeStr, style0);
      richText0.x = cfg.tableCenterX + cfg.MazeWidth - 32;
      richText0.y = 90;
      richText0.anchor.set(0.5, 0.5);
      richText0.anchor.set(0.5, 0.5);

      gameSetup.stage.addChild(richText0);
      gameSetup.countdownClockText = richText0;
      gameSetup.updateTimer = (seconds) => {
        gameSetup.secondsLeft = seconds;
        const sec = seconds % 60;

        const minutes = Math.round((seconds - sec) / 60);
        const secstr = (sec <= 9) ? `0${sec}` : sec;
        const minstr = (minutes <= 9) ? `0${minutes}` : minutes;
        const timestr = `${minstr}:${secstr}`;
        gameSetup.countdownClockText.text = timestr;

        if (seconds > 0 && seconds <= 10) {
          gameSetup.playBeepSound();
        }

        if (seconds == 0) {
          gameSetup.inTimeoutMode = true;
        } else {
          gameSetup.inTimeoutMode = false;
        }


      };
  };




  this.addTBotIcon = () => {
    const config = gameSetup.config;
    const s = new PIXI.Sprite(PIXI.loader.resources['/images/tboticon.png'].texture);
    s.scale.set(0.8, 0.8); // will overflow on bottom

    s.position.x = config.tableCenterX + config.tableW * 0.488;
    s.position.y = config.tableCenterY + - config.tableH/2 + 5;
    s.anchor.set(0.5, 0.5);
    // btn.tint = 0xa0a0a0;
    gameSetup.stage.addChild(s);

    s.interactive = true;
    s.buttonMode = true;
    s.on('pointerdown', () => {
      gameSetup.showPrevMessage();
    });
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
    richText.x = config.tableW * 0.04 + cfg.x + 10;
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

  this.checkAllDone = () => {
    const that = this;
    const c0 = gameSetup.mazeControllers[0];
    const c1 = gameSetup.mazeControllers[1];
    if (c0.pendingRequests.length == 0 && c1.pendingRequests.length == 0 && !c0.isHandlingRequest && !c1.isHandlingRequest ) {
      const gameended = gameSetup.controller.handleEndGame();
      if (gameended) {
        clearInterval(gameSetup.timerID);
      } else {

      }
    } else {
      console.log("in checkall done wait another 500ms");
      setTimeout(() => {
        that.checkAllDone();
      }, 500);
    }
  }


  this.setupTimerUpdate = () => {
    const that = this;
    // use setInterval so it works even when tab is switched off
    // each host has his own timer for both player, so that even if
    // one player leaves game room abruptly the other one still has the timer


    if (gameSetup.isHost) {
      gameSetup.timerID = setInterval(() => {
        if (gameSetup.gameOver) return;

        if (!gameSetup.gameStartTime) {
          gameSetup.gameStartTime = gameSetup.currentCycleTime - 1000;
        }
        let seconds = gameSetup.initialTimeSeconds - Math.round( (gameSetup.currentCycleTime - gameSetup.gameStartTime ) / 1000);
        if (seconds < 0) {
          seconds = 0;
        }

        if (gameSetup.isLocal) {
          gameSetup.updateTimer(seconds);
        } else {
          if (gameSetup.networkHandler) {
            gameSetup.networkHandler.sendCommandToAll({
              c: "UT", t: gameSetup.currentCycleTime, w: `${seconds}`
            });
          }
        }


        if (seconds == 0 && (gameSetup.isLocal || gameSetup.isHost)) {
          if (gameSetup.isLocal) {
            const gameended = gameSetup.controller.handleEndGame();
            if (gameended) {
              clearInterval(gameSetup.timerID);
            }
          } else {
            // need to wait until all simulations are done
            //gameSetup.inTimeoutMode = true;
            gameSetup.networkHandler.sendCommandToAll({
              c: "StartTimeOutMode", t: gameSetup.currentCycleTime, w: ``
            });
            that.checkAllDone();
          }
          return;
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
            c: "KA", t: gameSetup.currentCycleTime, w: `${0}$`
          });
        }
        // gameSetup.config.playerPanel1.updateTimer ();
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



  this.createControls = () => {
    gameSetup.downlisteners = [];
    gameSetup.uplisteners = [];
    gameSetup.controlButtons = [];
    // if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

    const config = gameSetup.config;

    this.addBackGround();



    // local is always on left!
    config.playerPanel1.PanelID = 0;
    this.addPlayerPanelNew(config.playerPanel1, gameSetup.localInputPlayerInfo);
    gameSetup.localInputPlayerInfo.c = config.playerPanel1;

    config.playerPanel2.PanelID = 1;
    // config.playerPanel2.isHuman = false; // hack to test
    this.addPlayerPanelNew(config.playerPanel2, gameSetup.remoteInputPlayerInfo);
    gameSetup.remoteInputPlayerInfo.c = config.playerPanel2;



    this.addGameTimer();
    this.setupTimerUpdate();


  };


  this.addFireworks = () => {
    gameSetup.allfireworks = {};
    this.addFirework("white", 0xffffff);
    this.addFirework("green", 0x99ff99);
    this.addFirework("red", 0xff9999);
    this.addFirework("yellow", 0xffff99);

    gameSetup.playFireworks = (colorname, anchor, basetime) => {
      const f = gameSetup.allfireworks[colorname];
      const time1 = Math.random() * 100 + basetime;
      const time2 = Math.random() * 2000 + time1 + 1000;
      f.loopcount = 0;
      setTimeout(() => {
        f.loop = true;
        f.visible = true;
        f.position.x = anchor.position.x + (0.5 - Math.random()) * gameSetup.config.tableW * 0.2;
        f.position.y = anchor.position.y + (0.5 - Math.random()) * gameSetup.config.tableH * 0.2;
        f.play();
      }, time1);
      f.onLoop = () => {
        f.loopcount ++;
        if (f.loopcount < 3) {
          f.position.x = anchor.position.x + (0.5 - Math.random()) * gameSetup.config.tableW * 0.2;
          f.position.y = anchor.position.y + (0.5 - Math.random()) * gameSetup.config.tableH * 0.2;
        } else {
          f.stop();
          f.visible = false;
        }
      }
    }


  };

  this.addFirework = (colorname, color) => {
    const config = gameSetup.config;
    //this.loadFramedSpriteSheet(`/images/newpool/firework1.png`, 'firework', 256, 256, 8, (frames) => {
    this.loadFramedSpriteSheet(`/images/newpool/firework4.png`, 'firework', 256, 256, 15, (frames) => {
      const fw = new PIXI.extras.AnimatedSprite(frames);
      // fw.loop = false;
      fw.tint = color;
      fw.scale.set(config.tableW * 0.3 / 256);

      fw.position.x = config.tableCenterX;
      fw.position.y = config.tableCenterY;
      fw.anchor.x = 0.5;
      fw.anchor.y = 0.5;


      fw.frame = 0;
      fw.gotoAndStop(fw.frame);
      fw.animationSpeed = 0.5;

      gameSetup.allfireworks[colorname] = fw;
      gameSetup.stage.addChild(fw);
      fw.visible = false;
      fw.onComplete = () => {
        fw.stop();
      };
      // fw.play();

    });
  };

  this.setupEndOfGame = () => {
    const config = gameSetup.config;

    const tableCenterY = 500;

    // add transparent beijing
    const bj3 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/bj3b.png"].texture);

    let bj3ratio = (config.tableW * 1.2) / 1000;
    bj3.scale.set(bj3ratio*1.2, bj3ratio * 1); // will overflow on bottom

    bj3.position.x = config.tableCenterX + config.tableW * 0.02;
    bj3.position.y = tableCenterY;
    bj3.anchor.set(0.5, 0.5);
    bj3.interactive = false;
    bj3.visible = false;
    bj3.alpha = 1;
    bj3.zOrder = 109;
    gameSetup.stage.addChild(bj3);
    gameSetup.bj3 = bj3;




    // add endoverlay
    const endoverlay = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/endoverlay2.png"].texture);

    let endoverlayratio = (config.tableW * 0.9) / 892;
    endoverlay.scale.set(endoverlayratio, endoverlayratio); // will overflow on bottom

    endoverlay.position.x = config.tableCenterX + config.tableW * 0.0175;
    endoverlay.position.y = tableCenterY - config.tableH * 0.032;
    endoverlay.anchor.set(0.5, 0.5);
    endoverlay.interactive = false;
    endoverlay.visible = false;
    endoverlay.alpha = 1;
    endoverlay.zOrder = 109;
    gameSetup.stage.addChild(endoverlay);
    gameSetup.endoverlay = endoverlay;

    // winner icon
    const winner = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/winner.png"].texture);

    let winnerratio = (config.tableW * 0.13) / 175;
    winner.scale.set(winnerratio, winnerratio); // will overflow on bottom

    winner.position.x = config.tableCenterX - config.tableW * 0.18;
    winner.position.y = tableCenterY - config.tableH * 0.29;
    winner.anchor.set(0.5, 0.5);
    winner.interactive = false;
    winner.visible = false;
    winner.alpha = 1;
    winner.zOrder = 109;
    gameSetup.stage.addChild(winner);
    gameSetup.winner = winner;


    // player name and avatar
    const size = Math.floor(2 * config.scalingratio);
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


    const size2 = Math.floor(2 * config.scalingratio);
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   size *= 1.25;
    // }
    const style2 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size2,
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
      wordWrapWidth: config.tableW * 0.7
    });






    // exit button
    // dark
    let ratio = 0.6;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/exit_2.png"].texture);
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.tableCenterX;
    if (gameSetup.gameType == GAME_TYPE.PRACTICE) bg2.position.x -= config.tableW * 0.15;
    bg2.position.y = tableCenterY + 220;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    bg2.buttonMode = true;
    bg2.visible = false;

    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/exit_1.png"].texture);
    bg2b.scale.set(ratio, ratio); // will overflow on bottom

    bg2b.position.x = bg2.position.x;
    bg2b.position.y = bg2.position.y;
    bg2b.anchor.set(0.5, 0.5);
    bg2b.interactive = true;
    bg2b.buttonMode = true;
    bg2b.visible = false;

    bg2.mouseover = function(mouseData) {
      if (bg2.visible) {
        bg2.visible = false;
        bg2b.visible = true;
        bg2.interactive = true;
        bg2b.interactive = true;
      }
    }

    bg2b.mouseout = function(mouseData) {
      if (bg2b.visible) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = true;
      }
    }


    bg2b.on('pointerdown', gameSetup.exitBtnHandler);
    bg2.on('pointerdown', gameSetup.exitBtnHandler);
    gameSetup.stage.addChild(bg2b);
    gameSetup.stage.addChild(bg2);

    const popoutExitButton = () => {
      bg2.visible = true;
      bg2.scale.x = 0.1;
      bg2.scale.y = 0.1;
      const obj = { s: 0.1 };
      const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
        .to({ s: 0.7 }, 1200) // if strength is 1000, then 1 second
        .easing(TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
          bg2.scale.x = obj.s;
          bg2.scale.y = obj.s;
        });

      tween.start();

    };


    let popoutRestartButton = null;
    // restart button
    if (gameSetup.gameType == GAME_TYPE.PRACTICE) {
      // dark
      const rbg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/restart_2.png"].texture);
      rbg2.scale.set(ratio, ratio); // will overflow on bottom

      rbg2.position.x = config.tableCenterX + config.tableW * 0.15;
      rbg2.position.y = tableCenterY + 220;
      rbg2.anchor.set(0.5, 0.5);
      rbg2.interactive = true;
      rbg2.buttonMode = true;
      rbg2.visible = false;

      const rbg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/restart_1.png"].texture);
      rbg2b.scale.set(ratio, ratio); // will overflow on bottom

      rbg2b.position.x = rbg2.position.x;
      rbg2b.position.y = rbg2.position.y;
      rbg2b.anchor.set(0.5, 0.5);
      rbg2b.interactive = true;
      rbg2b.buttonMode = true;
      rbg2b.visible = false;

      rbg2.mouseover = function(mouseData) {
        if (rbg2.visible) {
          rbg2.visible = false;
          rbg2b.visible = true;
          rbg2.interactive = true;
          rbg2b.interactive = true;
        }
      }

      rbg2b.mouseout = function(mouseData) {
        if (rbg2b.visible) {
          rbg2.visible = true;
          rbg2b.visible = false;
          rbg2.interactive = true;
          rbg2b.interactive = true;
        }
      }

      const restartGame = function () {
        window.location.reload();
      };

      rbg2b.on('pointerdown', restartGame);
      rbg2.on('pointerdown', restartGame);
      gameSetup.stage.addChild(rbg2b);
      gameSetup.stage.addChild(rbg2);

      popoutRestartButton = () => {
        rbg2.visible = true;
        rbg2.scale.x = 0.1;
        rbg2.scale.y = 0.1;
        const obj = { s: 0.1 };
        const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ s: 0.7 }, 1200) // if strength is 1000, then 1 second
          .easing(TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            rbg2.scale.x = obj.s;
            rbg2.scale.y = obj.s;
          });

        tween.start();
      };

    }






    gameSetup.showEndOfGame = (winnerID) => {
      gameSetup.gameOver = true;
      bj3.visible = true;
      endoverlay.visible = true;

      winner.visible = false;
      if (winnerID == 1) {
        winner.position.x = config.tableCenterX + config.tableW * 0.18;
      }

      for (let ind=0; ind <=1; ind++) {
        let pi = gameSetup.playerInfo[ind];
        if (gameSetup.isLocal || gameSetup.isHost) {

        } else {
          // flip left and right on remote guest computer
          pi = gameSetup.playerInfo[1 - ind];
        }

        const a = PIXI.Sprite.fromImage(pi.playerAvatarURL, true);
        a.texture.baseTexture.on('loaded', function(){
          // console.log(a.texture.orig.width, a.texture.orig.height);
          a.scale.set(110 / a.texture.orig.width, 110 / a.texture.orig.height);
        });

        a.scale.set(110 / a.texture.orig.width, 110 / a.texture.orig.height);
        a.position.x = config.tableCenterX + 290 * (-1 + 2*ind);
        a.position.y = tableCenterY - 91;
        a.anchor.set(0.5, 0.5);
        gameSetup.stage.addChild(a);


        // user name

        const text = new PIXI.Text(pi.username, style);
        text.position.x = a.position.x;
        text.position.y = tableCenterY + 10;
        text.anchor.set(0.5, 0.5);
        gameSetup.stage.addChild(text);



        // gold message
        let goldstring = pi.playerCoins;
        if (pi.extraCoins > 0) {
          goldstring = pi.playerCoins + pi.extraCoins;
        }
        const goldText = new PIXI.Text(goldstring, style2);
        goldText.position.x = config.tableCenterX + 305 * (-1 + 2*ind);
        if (ind == 0) goldText.position.x += 35;
        goldText.position.y = tableCenterY + 68;
        goldText.anchor.set(0.5, 0.5);
        goldText.visible = true;
        goldText.zOrder = 109;
        goldText.alpha = 0.9;
        goldText.coinCount = 0;
        gameSetup.stage.addChild(goldText);
        pi.endGoldText = goldText;

      }

      // exit btn not visible yet
      bg2.visible = false;


      if (gameSetup.endGameTimer) {
        clearTimeout(gameSetup.endGameTimer);
      }
      // show winner crown
      // debugger;
      gameSetup.endGameTimer = setTimeout(() => {
        winner.visible = true;
        winner.scale.set(0.1 * winnerratio, 0.1 * winnerratio);
        gameSetup.sounds.victory.play();
        gameSetup.addGoldEmitter();

        // show fireworks
        gameSetup.playFireworks("white", winner, 0);
        gameSetup.playFireworks("red", winner, 500);
        gameSetup.playFireworks("green", winner, 1000);
        gameSetup.playFireworks("yellow", winner, 1500);

        const obj = { s: 0.1 };
        const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ s: 1 }, 1400) // if strength is 1000, then 1 second
          .easing(TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            if (!winner || !winner.transform) return;
            winner.scale.x = obj.s * winnerratio;
            winner.scale.y = obj.s * winnerratio;
            // gameSetup.goldemitter.updateOwnerPos(winner.position.x, winner.position.y);
            // gameSetup.goldemitter.emit = true;
          })
          .onComplete(() => {

            // add coin for winning the game
            // gold message
            const size3 = Math.floor(6 * config.scalingratio);
            // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
            //   size *= 1.25;
            // }
            const style3 = new PIXI.TextStyle({
              fontFamily:  "\"Droid Sans\", sans-serif",
              fontSize: size3,
              fontStyle: '',
              fontWeight: '',
              fill: ['#ffff00'],
              stroke: '#ffff00',
              strokeThickness: 12,
              dropShadow: false,
              dropShadowColor: '#000000',
              dropShadowBlur: 2,
              dropShadowAngle: Math.PI / 6,
              dropShadowDistance: 2,
              wordWrap: true,
              wordWrapWidth: config.tableW * 0.7
            });

            let winreward = gameSetup.difficulty == BEGINNER ? 25 : 50;
            if (gameSetup.gameType == GAME_TYPE.BATTLE) {
              if (gameSetup.playerInfo[0].playerType == "Human") {
                // manual challenge
                winreward = 0;
              } else {
                winreward = 50;
                if (winnerID == 1) {
                  winreward = 0;
                }
              }
            }
            if (gameSetup.gameType == GAME_TYPE.PRACTICE) {
              winreward = 0;
            }

            if (gameSetup.playerInfo[0].playerUserId == gameSetup.playerInfo[1].playerUserId) {
              winreward = 0;
            }

            if (winreward == 0) {
              ///bg2.visible = true;
              popoutExitButton();
              if (gameSetup.gameType == GAME_TYPE.PRACTICE) {
                popoutRestartButton();
              }
              return;
            }

            const winnerGoldText = new PIXI.Text(winreward > 0? "+ " + winreward : "", style3);
            winnerGoldText.position.x = winner.position.x + 100;
            winnerGoldText.position.y = winner.position.y;
            winnerGoldText.anchor.set(0.5, 0.5);
            winnerGoldText.visible = true;
            winnerGoldText.zOrder = 109;
            gameSetup.stage.addChild(winnerGoldText);


            const pos = {x: winnerGoldText.position.x, y: winnerGoldText.position.y, s: 1 };
            const newpos = { x: gameSetup.playerInfo[winnerID].endGoldText.position.x, y: gameSetup.playerInfo[winnerID].endGoldText.position.y, s: 0.4 };

            if (gameSetup.isLocal || gameSetup.isHost) {

            } else {
              newpos.x = gameSetup.playerInfo[1 - winnerID].endGoldText.position.x;
              newpos.y = gameSetup.playerInfo[1 - winnerID].endGoldText.position.y;
            }

            const tween2 = new TWEEN.Tween(pos) // Create a new tween that modifies 'coords'.
              .to(newpos, 1500) // if strength is 1000, then 1 second
              .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
              .onUpdate(() => { // Called after tween.js updates 'coords'.
                if (!gameSetup.playerInfo) return;
                if (!winnerGoldText || !winnerGoldText.transform) return;
                winnerGoldText.position.x = pos.x;
                winnerGoldText.position.y = pos.y;
                winnerGoldText.scale.x = pos.s;
                winnerGoldText.scale.y = pos.s;

                // gameSetup.goldemitter.updateOwnerPos(winnerGoldText.position.x, winnerGoldText.position.y);
                // gameSetup.goldemitter.emit = true;

                // gameSetup.goldemitter.updateOwnerPos(winner.position.x, winner.position.y);
                // gameSetup.goldemitter.emit = true;

              })
              .onComplete(() => {
                if (!gameSetup.playerInfo) return;
                winnerGoldText.visible = false;
                bg2.visible = true;
                gameSetup.sounds.itemcollected.play();

                if (gameSetup.isLocal || gameSetup.isHost) {
                  gameSetup.goldemitter.updateOwnerPos(gameSetup.playerInfo[winnerID].endGoldText.position.x, gameSetup.playerInfo[winnerID].endGoldText.position.y);
                  const oldnumber = Number(gameSetup.playerInfo[winnerID].endGoldText.text);
                  gameSetup.playerInfo[winnerID].endGoldText.text = oldnumber + winreward;

                } else {
                  gameSetup.goldemitter.updateOwnerPos(gameSetup.playerInfo[1 - winnerID].endGoldText.position.x, gameSetup.playerInfo[1 - winnerID].endGoldText.position.y);
                  const oldnumber = Number(gameSetup.playerInfo[1 - winnerID].endGoldText.text);
                  gameSetup.playerInfo[1 - winnerID].endGoldText.text = oldnumber + winreward;
                }

                gameSetup.goldemitter.emit = true;
              });

            tween2.start();
          });
        tween.start();
      }, 500);
    };
  };

  this.setupCenterMessage = () => {
    const config = gameSetup.config;

    // message text
    let size = Math.floor(4 * config.scalingratio);
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      size *= 1.25;
    }
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
      wordWrapWidth: config.tableW * 0.7
    });

    const t = new PIXI.Text('no message', style);
    t.position.x = config.tableCenterX;
    t.position.y = config.tableCenterY - config.tableH * 0.2;
    t.anchor.set(0.5, 0.5);
    t.visible = false;
    t.zOrder = 102;
    t.alpha = 0.97;
    gameSetup.stage.addChild(t);

    gameSetup.config.hideHeadline = () => {
      //t.visible = false;
      if (typeof(TWEEN) == "undefined") return;

      const obj = { alpha: t.alpha };
      const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
        .to({ alpha: 0 }, 800) // if strength is 1000, then 1 second
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
          t.alpha = obj.alpha;
        });
      tween.start();

    };


    gameSetup.oldHeadline = '';
    gameSetup.config.showHeadline = (msg, timeout, x, y) => {
      t.text = msg;
      t.visible = true;
      t.alpha = 0.9;
      t.scale.x = 0.1;
      t.scale.y = 0.1;

      const obj = { s: 0.1 };
      const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
        .to({ s: 1 }, 500) // if strength is 1000, then 1 second
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
          t.scale.x = obj.s;
          t.scale.y = obj.s;
        });
      tween.start();

      gameSetup.oldHeadline = msg;

      let timeoutseconds = 3;
      if (typeof(timeout) != "undefined") {
        timeoutseconds = timeout;
      }
      if (gameSetup.hideHeadlineTimer) {
        clearTimeout(gameSetup.hideHeadlineTimer);
      }
      gameSetup.hideHeadlineTimer = setTimeout(gameSetup.config.hideHeadline, timeoutseconds * 1000);

    };

  };


  this.setupTbotMessage = () => {
    const config = gameSetup.config;

    // background
    const g = new PIXI.Sprite(PIXI.loader.resources["/images/tbotmessagebackground2.png"].texture);

    let ratio = (config.tableW * 0.88) / 800;
    g.scale.set(ratio, ratio); // will overflow on bottom

    g.position.x = config.tableCenterX;
    g.position.y = config.tableCenterY + config.tableH / 2 + config.cushionBarThick * 1.3;
    g.anchor.set(0.5, 1);
    g.interactive = false;
    g.visible = false;
    g.alpha = 0.9;
    g.zOrder = 100;
    gameSetup.stage.addChild(g);


    // add a red arrow for next step!
    const yellowarrow = new PIXI.Sprite(PIXI.loader.resources["/images/yellowarrow.png"].texture);

    ratio = (config.tableW * 0.04) / 70;
    yellowarrow.scale.set(ratio, ratio); // will overflow on bottom

    yellowarrow.position.x = config.tableCenterX;
    yellowarrow.position.y = config.tableCenterY;
    yellowarrow.anchor.set(0.5, 0.5);
    yellowarrow.interactive = false;
    yellowarrow.visible = false;
    yellowarrow.alpha = 0.9;
    yellowarrow.zOrder = 105;
    gameSetup.stage.addChild(yellowarrow);
    gameSetup.yellowarrow = yellowarrow;






    // tbot icon
    const s = new PIXI.Sprite(PIXI.loader.resources["/images/tboticon.png"].texture);
    s.position.x = config.tableCenterX - config.tableW * 0.39;
    s.position.y = config.tableCenterY + config.tableH / 2;
    s.anchor.set(0.5, 0.5);
    s.scale.set(1.1, 1.1);
    s.interactive = false;
    s.visible = false;
    s.zOrder = 101;
    gameSetup.stage.addChild(s);

    // message text
    let size = Math.floor(2 * config.scalingratio);
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      size *= 1.25;
    }
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
      wordWrapWidth: config.tableW * 0.7
    });

    const t = new PIXI.Text('no message', style);
    t.position.x = config.tableCenterX + config.tableW * 0.05;
    t.position.y = s.position.y;
    t.anchor.set(0.5, 0.5);
    t.visible = false;
    t.zOrder = 102;
    gameSetup.stage.addChild(t);

    gameSetup.config.hideMessage = () => {
      if (!g.visible) return;
      // debugger;
      g.visible = false;
      g.interactive = false;
      s.visible = false;
      t.visible = false;
      if (gameSetup.tweenyellowarrow) {
        gameSetup.tweenyellowarrow.stop();
        yellowarrow.visible = false;
      }
    };
    g.on('pointerdown', () => {
      gameSetup.config.hideMessage();
      if (gameSetup.tweenyellowarrow) {
        gameSetup.tweenyellowarrow.visible = false;
        gameSetup.tweenyellowarrow.stop();
        delete gameSetup.tweenyellowarrow;
      }
    });

    gameSetup.oldMessage = '';
    gameSetup.config.showMessage = (msg, timeout, x, y) => {
      t.text = msg;
      g.visible = true;
      g.interactive = true;
      s.visible = true;
      t.visible = true;
      gameSetup.oldMessage = msg;
      yellowarrow.visible = false;

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

      if (typeof(x) != "undefined") {
        yellowarrow.visible = true;
        gameSetup.yellowarrow.position.x = x;
        gameSetup.yellowarrow.position.y = y;
        const obj = { y: 0 };

        gameSetup.tweenyellowarrow = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ y: config.TrueHeight }, timeoutseconds * 1000) // if strength is 1200, then 1 second
          // .easing(TWEEN.Easing.Quadratic.In) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            if (!gameSetup || !gameSetup.cuestick) return;
            if (gameSetup.gameOver || gameSetup.inStrikeAnimation) return;
            const yrange = Math.round(config.tableH / 7);
            const r = Math.round(obj.y / yrange) * yrange;
            const yshift = Math.abs(obj.y - r);
            gameSetup.yellowarrow.position.y = y + yshift;
          })
          .onComplete(() => {
            // if (gameSetup.gameOver || !gameSetup.inStrikeAnimation) return;
            // gameSetup.controller.strikeWith(strength, dir, spinMultiplier);
            // gameSetup.controller.strikeWithExact(force, av, hspin);
            // gameSetup.inStrikeAnimation = false;
            if (gameSetup.yellowarrow)
              gameSetup.yellowarrow.visible = false;
          });

          gameSetup.tweenyellowarrow.start();
      }

    };

  };

  this.setupHandleRoom = () => {


    const gameEngine = this;
    const GameEngine = this;

    gameSetup.cmdHistory = [];
    gameSetup.cmdReceiveHistory = [];
    gameSetup.cmdReceiveHistoryT = [];
    gameSetup.failedToReconnect = false;
    gameSetup.inQuit = false;


    gameSetup.handleRoomUpdate = (room) => {
      // debugger;
      // console.log(`new room update _id: ${JSON.stringify(room._id)} in ${room.usersInRoom}`);
      // if (!gameSetup.arrLocalPlayerIds) {
      //   gameSetup.arrLocalPlayerIds = [];
      // }

      const allReady = room.usersInRoom.indexOf(false) === -1;
      if (allReady) {

        // console.log(`both players in room!`);
        if (!gameSetup.peerReady) {
          // first time room is ready, so kick start game
          gameSetup.peerReady = true;
          gameSetup.hideModalMessage();
          // if (gameSetup.isLocal) {
          //   gameSetup.networkHandler = new NetworkHandler(GameEngine, true);
          // } else {
            gameSetup.networkHandler = new NetworkHandler(GameEngine, false);
          // }
          gameSetup.gameEngine.initScreen();
        }

      } else {

      }

      if (gameSetup.networkHandler  ) {
          // update of commands
          // console.log("cmd history length: " + room.gameCommandHistory.length);

          if (room.gameCommandHistory && room.gameCommandHistory.length > 0) {

            let newCmdStartIndex = 0;
            if (lastProcessedCmdKey != "") {
              for (let i=room.gameCommandHistory.length-1; i>= 0; i-- ) {
                const data = room.gameCommandHistory[i];
                const start = getPosition(data, ";", 2);
                const cmdkey = data.substring(start+1);
                // console.log("comparing " + i + ": " + lastProcessedCmdKey + " vs " + cmdkey);
                if (lastProcessedCmdKey == cmdkey) {
                  newCmdStartIndex = i+1;
                  break;
                }
              }
            }
            for (let i=newCmdStartIndex; i <=room.gameCommandHistory.length-1 ; i++ ) {
              const data = room.gameCommandHistory[i];
              const start = getPosition(data, ";", 2);
              const cmdkey = data.substring(start+1);
              // console.log("processing cmdkey " + cmdkey);
              if (lastProcessedCmdKey == cmdkey) continue;

              // const p = cmdkey.split(";");
              // const cmd = {
              //   c: p[0], t: Number(p[1]), w: p[2]
              // };

              // if (cmd.c == "PLAYER_ACTION" || cmd.c == "DoAddBombs") { // bbbbb if we have not finished simulating a remote operation, just wait until next update
              //   const p2 = cmd.w.split("_");
              //   let controllerID = p2[0];
              //   if (gameSetup.isLocal || gameSetup.isHost) {

              //   } else {
              //     controllerID = 1 - Number(p2[0]);
              //   }

              //   const mazeController = gameSetup.mazeControllers[controllerID];
              //   if (!gameSetup.isLocal && mazeController.container.inSwap) return;
              //   if (!gameSetup.isLocal && !mazeController.isOwner) {
              //     if (gameSetup.inRemoteOperation) return;
              //   }
              // }


              lastProcessedCmdKey = cmdkey;
              lastProcessedIndex = i;
              // console.log("pushing new cmd " + i + " " + cmdkey);
              gameSetup.networkHandler.handleWTCData(cmdkey);
            }

            // console.log("last " + lastProcessedIndex + ": " + lastProcessedCmdKey);


          }
        }

      // } else {
      //   // if (gameSetup.gameOver) {
      //   //   return;
      //   // }
      //   console.log(`still waiting for player to enter room ${room._id} ${room.usersInRoom}`);
      // }
      // gameSetup.showModalMessage("")
    };

    // console.log("dddd set handle room");
  };

  this.calculateTileMap = function() {
    console.log("calculateTileMap");
    const cfg = gameSetup.config;

    const maze2 = [];
    gameSetup.tilemap = "";

    const TYPE_CNT = gameSetup.difficulty == ADVANCED ? 6 : 5; // 5 types of crystals

    for (let k=0; k<cfg.TotalRandomRows; k++) {
      const row = [];
      maze2.push(row);
      for (let j=0; j<cfg.TileCols; j++) {
        let d = Math.ceil(Math.random() * TYPE_CNT);
        if (k < 2 && j < 2) {
          // no need to check vertical or horizontal
        } else if (k >= 2 && j < 2) {
          // check vertical
          while (d == maze2[k-1][j] && maze2[k-1][j] == maze2[k-2][j]) {
            d = Math.ceil(Math.random() * TYPE_CNT);
          }
        } else if (k < 2 && j >= 2) {
          // check horizontal left
          while (d == maze2[k][j-1] && maze2[k][j-1] == maze2[k][j-2]) {
            d = Math.ceil(Math.random() * TYPE_CNT);
          }
        } else {
          while ( (d == maze2[k][j-1] && maze2[k][j-1] == maze2[k][j-2])  || (d == maze2[k-1][j] && maze2[k-1][j] == maze2[k-2][j]) ) {
            d = Math.ceil(Math.random() * TYPE_CNT);
          }
        }
        row.push(d);
      }

      let newnum = 0;
      for (let j=0; j<cfg.TileCols; j++) {
        newnum *= 10;
        newnum += maze2[k][j];
      }

      //maze.push(newnum);
      gameSetup.tilemap += newnum + ":";
    }

    gameSetup.maze = maze2;

    gameSetup.mazeC = []; // maze by columns
    for (let k=0; k<gameSetup.config.TileCols; k++) {
      const onecol = [];
      gameSetup.mazeC.push(onecol);
      for (let j=0; j<gameSetup.config.TotalRandomRows; j++) {
        onecol.push(gameSetup.maze[j][k]);
      }
    }

  };

  this.drawInitialScreen = () => {
    gameSetup.gameEngine = this;
    this.createControls();
    this.addModalMessageScreen();

  }

  this.setupUsingMaze = () => {


    console.log('setupUsingMaze');
    this.addMaze();

    this.setupRobots();


    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      this.setupTestResultDisplay();
      this.setupHandleTestResult();
    } else {
    }

    this.addBombList();

    //this.addTanks();
    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      this.addQuitButton();

    }

    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      this.addHelpQuestionMark();
    }

    this.addBombTargetG();
    this.reAddModalMessageScreen();
    this.setupCenterMessage();

    this.setupPointsMessage();
    this.setupEndOfGame();
    this.addFireworks();

    this.addHintG();

    gameSetup.drawHints();

    gameSetup.timedifflist = [];

    gameSetup.allSetup = true;


  };



  // this.createRobots = () => {
  //   gameSetup.renderer.render(gameSetup.stage);
  //   gameSetup.controller.createWorldForPlayer();

  //   if (gameSetup.gameType != GAME_TYPE.TESTING && gameSetup.gameType != GAME_TYPE.REPLAY) {
  //     gameSetup.controller.createAIPlayers();
  //   } else {

  //     if (gameSetup.gameType != GAME_TYPE.REPLAY) {

  //       Meteor.setTimeout(() => {
  //         // console.log('to reset table after test!');
  //         // debugger;
  //         if (!gameSetup.controller) return;
  //         gameSetup.controller.setRobotCode("     "); //can't be blank

  //         if (window.UserSetupCode) {
  //           const latestTime = window.UserSetupCode.CodeUpdates[window.UserSetupCode.CodeUpdates.length - 1].time;
  //           gameSetup.testSetupCode = reconstructCode(window.UserSetupCode, latestTime);
  //           // console.log("setting 1a gameSetup.testSetupCode to " + gameSetup.testSetupCode);
  //         } else {
  //           // console.log("no 1a window.UserSetupCode yet ");
  //           if (gameSetup.scenario && gameSetup.scenario.SetupScript) {
  //             gameSetup.testSetupCode = gameSetup.scenario.SetupScript; // used to resetup table after all stop!
  //             // console.log("setting 2a gameSetup.testSetupCode to " + gameSetup.testSetupCode);
  //           }
  //         }

  //         const cleanTestSetupCode = getCleanTestCode(gameSetup.testSetupCode);
  //         if (gameSetup.testSetupCode)
  //           gameSetup.controller.createAIPlayers(cleanTestSetupCode, true);
  //       }, 2000);
  //     }
  //   }
  // };

  this.setupRobots = () => {
    gameSetup.renderer.render(gameSetup.stage);
    gameSetup.controller.createWorldForPlayer();

    if (gameSetup.gameType != GAME_TYPE.TESTING) {
      gameSetup.controller.createAIPlayers();
    } else {

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

  this.setupPointsMessage = () => {
    const config = gameSetup.config;

    // message text
    let size = 40;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      size *= 1.25;
    }
    const style = new PIXI.TextStyle({
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
      wordWrap: false,
    });

    // combo
    const style2 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size + 15,
      fontStyle: '',
      fontWeight: '',
      fill: ['#00ff00'],
      stroke: '#ffffff',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 5,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
    });

    // bomb
    const style3 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size + 15,
      fontStyle: '',
      fontWeight: '',
      fill: ['#FC602A'],
      stroke: '#ffffff',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 5,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
    });

    gameSetup.showPoints = (pointsstr, x, y) => {

      const t = new PIXI.Text(pointsstr, pointsstr.includes("-Combo") ? style2 : pointsstr.includes("BOMB!") ? style3 :  style);
      t.position.x = x;
      t.position.y = y;
      t.anchor.set(0.5, 0.5);
      // t.visible = false;
      // t.zOrder = 102;
      t.alpha = 1;
      gameSetup.stage.addChild(t);

      const obj = { alpha: 1, y: y };
      const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
        .to({ alpha: 0, y: y - 30 }, 3000) // if strength is 1000, then 1 second
        .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
        .onUpdate(() => { // Called after tween.js updates 'coords'.
          t.alpha = obj.alpha;
          t.position.y = obj.y;
        })
        .onComplete( () => {
          gameSetup.stage.removeChild(t);
        });
      tween.start();
    };


    gameSetup.adjustTotalPoints = (pinfo, totalp) => {
      pinfo.addPoints(totalp);
      const panel = pinfo.panel;
      gameSetup.showPoints("+ " + totalp, panel.cx + 105, panel.cy + 30 );
    }
  };


  this.initScreen = () => {
    if (gameSetup.isLocal || gameSetup.isHost) {
      this.calculateTileMap();

      if (gameSetup.isLocal) {
        console.log("local game! so setup using maze");
        gameSetup.gameStarted = true;
        gameSetup.gameStartTime = Date.now();
        this.setupUsingMaze();

      } else {
        // send maze to all
        console.log("network game! so send InitMaze to all", gameSetup.peers);
        gameSetup.networkHandler.sendCommandToAll({
          c: "InitMaze", t: gameSetup.currentCycleTime, w: gameSetup.tilemap
        });

      }
    }

  }


  this.initGraphics = function () {
    const cfg = gameSetup.config;

    container = document.getElementById('gameDiv');
    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }
    container.setAttribute("style", `position:relative;background-color:#011a42;width:${w}px;height:${h}px`);



    // window.addEventListener('resize', this.onWindowResize, false);
  };

  this.showGameOver = (redPoint) => {
    gameSetup.gameOver = true;
  };

  this.setEmitterColor = (t, newdigit) => {
    const colors = {
      1: 0xCCF192, 2: 0xF2471B, 3: 0xE28AD6, 4: 0xFDD341, 5: 0xE4E3DC, 8: 0xFFFEA9, 9: 0xB1F4FB
    };
    const c = colors[newdigit];
    t.emitter.startColor.value.r = c / 65536;
    t.emitter.startColor.value.g = (c /256 ) % 256;
    t.emitter.startColor.value.b = c % 256;
  };

  this.addOneCrystal = (container, digit, r, c ) => {
    const cfg = gameSetup.config;
    let newdigit = digit;
    if (newdigit == 6) newdigit = 9;
    if (newdigit == 7) newdigit = 8;
    const playerId = gameSetup.playerInfo.find(player => player.ID === container.mazeController.playerID).playerUserId;
    const mainItem = gameSetup.mainItems.find(item => item.userId === playerId);
    const resource = mainItem.imageSrc.main;
    let t = new PIXI.Sprite(
      PIXI.loader.resources[`${resource}${newdigit}.png`].texture
    );
    if (PIXI.loader.resources[`${resource}${newdigit}@2x.png`]) {
      t = new PIXI.Sprite(
        PIXI.loader.resources[`${resource}${newdigit}@2x.png`].texture
      );
    }
    t.digit = digit;
    t.parentContainer = container;
    t.r = r;
    t.c = c;
    t.position.x = c * cfg.TileSizeW + cfg.TileSizeW / 2 + 2;
    t.position.y = ( (cfg.TileRows-1-r)  + 1 + 0.5) * cfg.TileSizeH;
    t.anchor.set(0.5, 0.5);
    t.scale.x = 0.9 * cfg.TileSizeW / 155;
    t.scale.y = 0.9 * cfg.TileSizeW / 155;
    // if (r == 0) {
    //   t.alpha = 0.5;
    // }
    container.addChild(t);

    this.addInputEmitter(t);
    // this.setEmitterColor(t, newdigit);
    return t;
  }

  this.addMazeMessageBox = (container) => {

    const config = gameSetup.config;

    const style2 = new PIXI.TextStyle({
      // fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 20, //Math.round(config.,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 1,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: 0, //Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const labelText = new PIXI.Text("", style2);
    labelText.x = 20;
    labelText.y = 800;
    if (gameSetup.difficulty == ADVANCED) {
      // labelText.y -= 16;
    }
    if (gameSetup.difficulty == BEGINNER) {
      labelText.y += 6;
    }
    labelText.anchor.set(0, 0.5);
    labelText.visible = true;
    container.addChild(labelText);

    container.msg = "";
    container.msg2 = "";

    container.showMsg = (m) => {
      if (container.msg2 != "") {
        container.msg = container.msg2;
        container.msg2 = m;
      } else {
        if (container.msg == "") {
          container.msg = m;
          container.msg2 = "";
        } else {
          container.msg2 = m;
        }
      }
      labelText.setText("> " + container.msg + "\n> " + container.msg2);
    }

  }

  this.addStarSprites = (container) => {
    const cfg = gameSetup.config;
    container.stars = [];
    container.visibleStarCount = 0;
    if (container !== gameSetup.mazeContainer2) {

      for (let r = 0; r < 15; r++) {
        const t = new PIXI.Sprite(
          PIXI.loader.resources[`/images/smallgoldstar.png`].texture
        );
        t.parentContainer = container;
        t.r = r;
        t.visible = false;
        t.position.x = cfg.tableCenterX - 91;
        t.position.y = 700 - r * 42;
        if (gameSetup.difficulty == ADVANCED) {
          // t.position.y -= 15;
          t.position.x += 1;
        }
        if (gameSetup.difficulty == BEGINNER) {
          t.position.x += 2;
          t.position.y += 6;
        }
        t.anchor.set(0.5, 0.5);
        t.scale.x = (cfg.TileSizeW * 0.39) / 74;
        t.scale.y = t.scale.x;
        t.origScale = t.scale.x;
        container.addChild(t);
        container.stars.push(t);
      }
    }


    container.changeStars = (chg) => {
      const oldCnt = container.visibleStarCount;
      const newCnt = Math.max(0, Math.min(15, oldCnt + chg));
      if (chg == 0) return;
      if (newCnt == oldCnt) return;
      container.visibleStarCount = newCnt;
      if (container == gameSetup.mazeContainer2) return; // no animation!

      // update alpha of all bombs
      for (let k=0; k < gameSetup.bombList.length; k++) {
        const b = gameSetup.bombList[k];
        if (b.starCost > container.visibleStarCount) {
          b.alpha = 0.6;
        } else {
          b.alpha = 1;
        }
      }


      if (newCnt > oldCnt) {
        let startScale = 1;
        let origScale = 1;
        for (let r=oldCnt; r < newCnt; r++) {
          const s = container.stars[r];
          s.visible = true;
          // s.scale.x = s.origScale / 10;
          // s.scale.y = s.origScale / 10;
          // startScale = s.scale.x;
          // origScale = s.origScale;
        }
        return;

        // zoom into star
        const obj = { scale: startScale }; // percent
        const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ scale: origScale }, 1000) // if strength is 1000, then 1 second
          .easing(TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            for (let r=oldCnt; r < newCnt; r++) {
              const s = container.stars[r];
              s.scale.x = obj.scale;
              s.scale.y = obj.scale;
            }
          });
        tween.start();
      } else {
        gameSetup.playBuyBomb();
        for (let r=newCnt; r < oldCnt; r++) {
          const s = container.stars[r];
          //gameSetup.addStarUsageEffect(s)
          s.visible = false;

        }
      }
    };
  }

  this.addMaze = () => {
    const cfg = gameSetup.config;
    console.log('addMaze');



    // maze container 0 is left so for local with input control
    // maze container 1 is for remote and no local input, but can be local AI controlled

    gameSetup.mazeContainer = new PIXI.Container();
    gameSetup.mazeContainer.position.x = cfg.tableCenterX - cfg.centerSpaceWidth / 2 - cfg.MazeWidth;
    gameSetup.mazeContainer.position.y = cfg.TrueHeight * 0.132;
    if (gameSetup.difficulty == ADVANCED) {
      gameSetup.mazeContainer.position.x += 2;
      //gameSetup.mazeContainer.position.y += 14;
    }
    if (gameSetup.difficulty == BEGINNER) {
      gameSetup.mazeContainer.position.y -= 12;
    }
    gameSetup.mazeContainer2 = new PIXI.Container();
    gameSetup.mazeContainer2.position.x = cfg.tableCenterX + cfg.centerSpaceWidth / 2 + 0;
    gameSetup.mazeContainer2.position.y = cfg.TrueHeight * 0.132;
    if (gameSetup.difficulty == ADVANCED) {
      gameSetup.mazeContainer2.position.x += 2;
      //gameSetup.mazeContainer2.position.y += 14;
    }
    if (gameSetup.difficulty == BEGINNER) {
      gameSetup.mazeContainer2.position.y -= 12;
      // gameSetup.mazeContainer2.position.x -= 15;
    }



    this.addMazeMessageBox(gameSetup.mazeContainer);
    this.addMazeMessageBox(gameSetup.mazeContainer2);


    this.addStarSprites(gameSetup.mazeContainer);
    this.addStarSprites(gameSetup.mazeContainer2);

    gameSetup.crystals = [];
    gameSetup.crystals2 = [];
    gameSetup.emitters = [];
    gameSetup.mazeContainer.crystals = gameSetup.crystals;
    gameSetup.mazeContainer2.crystals = gameSetup.crystals2;

    /*
      one maze controller for each maze:
      maze 0 is always local, human or AI
      maze 1 can be remotely controlled or local AI, but can't be local human
    */
    gameSetup.mazeControllers = [];
    gameSetup.mazeControllers.push(new MazeController(gameSetup, gameSetup.localInputPlayerInfo.ID, gameSetup.mazeContainer));
    gameSetup.mazeControllers.push(new MazeController(gameSetup, gameSetup.remoteInputPlayerInfo.ID, gameSetup.mazeContainer2));

    // gameSetup.maze is 300 rows, at the beginning
    // gameSetup.maze[0] maps to the bottom row on screen
    // gameSetup.maze[cfg.TileRows - 1] maps to row 0 on screen

    gameSetup.nextRowIndexPerCol = [];
    gameSetup.nextRowIndexPerCol2 = [];
    for (let c = 0; c < cfg.TileCols; c++) {
      // next to be used when needing a new digit for a specific column, would change over time
      // and be different for each column
      gameSetup.nextRowIndexPerCol.push(cfg.TileRows);
      gameSetup.nextRowIndexPerCol2.push(cfg.TileRows);
    }

    for (let c = 0; c < cfg.TileCols; c++) {
      let column = gameSetup.mazeC[c];
      const col = [];
      const col2 = [];
      gameSetup.crystals.push(col);
      gameSetup.crystals2.push(col2);
      for (let r = 0; r <= cfg.TileRows - 1; r++) {
        // let digit = num % 10;
        // num = (num - digit) / 10;
        // digit = 1 + digit % 5; // only 5 kinds of crystals
        const digit = column[r];
        const t = this.addOneCrystal(gameSetup.mazeContainer, digit, r, c);
        col.push(t);
        this.enableDraggingCrystal(t);

        const t2 = this.addOneCrystal(gameSetup.mazeContainer2, digit, r, c);
        col2.push(t2);
      }
    }
    // add 2 maze containers
    gameSetup.stage.addChild(gameSetup.mazeContainer);
    gameSetup.stage.addChild(gameSetup.mazeContainer2);


  };

  this.onWindowResize = function () {
    renderer.setSize(window.innerWidth * 0.99, window.innerHeight * 0.99);
  };


  this.setup = function () {
    const cfg = gameSetup.config;
    this.gameSetup = gameSetup;


    // Bert.defaults = {
    //   hideDelay: 20000
    // };
    if (gameSetup.isLocal) {
      gameSetup.networkHandler = new NetworkHandler(this, true);
    } else {
      // gameSetup.networkHandler = new NetworkHandler(this, false);
    }

    gameSetup.processWTCData = function (data) {
      // console.log("in gameSetup.processWTCData");
      if (gameSetup.networkHandler)
        gameSetup.networkHandler.handleWTCData(data);
      else {
        // console.log("no network handler yet! " + data);
      }
    };

    gameSetup.cleanUpKeyHandlers = function() {
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

        document.removeEventListener("mousewheel", gameSetup.mouseWheelHandler);

        document.removeEventListener('keydown', gameSetup.OneOnKeyDown);
      }

    };

    gameSetup.gameOver = false;
    gameSetup.exitGame = () => {
      console.log("in gameSetup.exitGame");
      gameSetup.gameOver = true;
      gameSetup.renderer.plugins.interaction.destroy();
      // if (gameSetup.renderer.plugins.accessibility && gameSetup.renderer.plugins.accessibility.children)
      //   gameSetup.renderer.plugins.accessibility.destroy();


      gameSetup.cleanUpKeyHandlers();

      if (!gameSetup.isLocal)
        PoolActions.leavingGame(gameSetup.room._id, gameSetup.localPlayerID, gameSetup.failedToReconnect || gameSetup.inQuit);

      switch (gameSetup.room.gameType) {
        case 1:
          gameSetup.reacthistory.push("/gamesRoomEntry");
          break;
        case 2:
          const link = Meteor.userId() === gameSetup.room.owner ? '/gamesRoomNetwork/' : `/gamesRoomNetwork/${gameSetup.room.gameRoomId}`;
          gameSetup.reacthistory.push(link);
          // gameSetup.reacthistory.push('/gamesBoard', { notiId: gameSetup.room.notiId });
          break;
        case 4:
          if (gameSetup.pairData && gameSetup.pairData.sectionId) {
            gameSetup.reacthistory.push(`/section-info/${gameSetup.room.gameId}/${gameSetup.pairData.sectionId}`);
          }
          break;

      }
    };



    gameSetup.quitGameForConnectivityIssue = () => {
      if (gameSetup.inQuit) {
        console.log("already in quit so return");
        return;
      }

      gameSetup.inQuit = true;
      // gameSetup.networkHandler.sendCommandToAll({ c: "QuitGameRoomWithIssue", t: gameSetup.currentCycleTime, w: `Sorry! Network connection with your opponent has been interrupted.` });

      // gameSetup.sounds.backgroundmusic.stop();
      if (!gameSetup.gameOver) {
        gameSetup.showModalMessage(`Game Terminated`, `Network connection with your opponent has been lost.`, MODAL_NOBUTTON);
      }
      let waitS = 5000;

      setTimeout(() => {
        gameSetup.exitBtnHandler();
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
      Object.keys(obj).forEach((k) => {
        if (obj[k] && obj[k].removeAllListeners)
          obj[k].removeAllListeners();
        if (obj[k] && obj[k].destroy) {
          if (typeof obj.destroy == 'function')
            obj.destroy(true);
        }
        delete obj[k];
      });
    };


    gameSetup.cleanUpAll = () => {
      TWEEN.removeAll();
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



      gameSetup.controller.killAIPlayers();

      if (gameSetup.networkHandler) delete gameSetup.networkHandler;
      // if (gameSetup.shotcontroller) delete gameSetup.shotcontroller;

      gameSetup.stage.removeChild(gameSetup.mazeContainer);
      gameSetup.stage.removeChild(gameSetup.mazeContainer2);
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
      // delete ballbodies;
      // delete ballbodies2;
      const allIDs = Object.keys(ballbodies);
      for (let j=0; j<allIDs.length; j++) {
        const i = allIDs[j];
        const b = ballbodies[i];
        for (let k=b.shapes.length-1; k>=0; --k) {
          b.removeShape(b.shapes[i]);
        }
        const b2 = ballbodies2[i];
        for (let k=b2.shapes.length-1; k>=0; --k) {
          b2.removeShape(b2.shapes[i]);
        }
        b.ball = null;
        ballbodies[i] = null;
        b2.ball = null;
        ballbodies2[i] = null;
      }
      // ballbodies.length = 0;
      // ballbodies2.length = 0;

      gameSetup.deepClean(gameSetup.playerInfo1);
      gameSetup.deepClean(gameSetup.playerInfo2);
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



  };

  this.loadSounds = function () {
    gameSetup.sounds = {};
    // gameSetup.sounds.magicwand = new Howl({ src: ['/sounds/magicwand.mp3'], volume: 0.1 });
    // gameSetup.sounds.bonus1 = new Howl({ src: ['/sounds/tadaF.mp3'], volume: 0.6 }); // gotitem.mp3 bonus1.mp3
    gameSetup.sounds.success3 = new Howl({ src: ['/sounds/success1.wav'], volume: 0.1 });
    gameSetup.sounds.tada1 = new Howl({ src: ['/sounds/success6.wav'], volume: 0.7 });
    gameSetup.sounds.beep = new Howl({ src: ['/sounds/beep.mp3'], volume: 0.7 });

    // gameSetup.sounds.explodeSound = new Howl({ src: ['/sounds/bombalert2.mp3'], volume: 0.7 });
    // gameSetup.sounds.success2 = new Howl({ src: ['/sounds/success6.wav'], volume: 1.3 });
    gameSetup.sounds.alertup = new Howl({ src: ['/sounds/alertup.mp3'], volume: 0.6 });
    gameSetup.sounds.alertdown = new Howl({ src: ['/sounds/alertdown.mp3'], volume: 0.6 });

    gameSetup.sounds.success1 = new Howl({ src: ['/sounds/jingle1.wav'], volume: 0.7 });
    gameSetup.sounds.victory = new Howl({ src: ['/sounds/Victory.mp3'], volume: 0.5 });
    gameSetup.sounds.failure = new Howl({ src: ['/sounds/failure.mp3'], volume: 0.4 });
    gameSetup.sounds.swapsound = new Howl({ src: ['/sounds/swipe1.mp3'], volume: 0.4 });
    gameSetup.sounds.tilefall = new Howl({ src: ['/sounds/stones3.mp3'], volume: 0.9 });
    gameSetup.sounds.itemcollected = new Howl({ src: ['/sounds/ItemCollected.mp3'], volume: 0.6 });
    // gameSetup.sounds.backgroundmusic = new Howl({ src: ['/sounds/happymusicsmall.mp3'], loop: true, volume: 0.5 });
    // if (gameSetup.gameType!=GAME_TYPE.TESTING && gameSetup.gameType!=GAME_TYPE.AUTORUN && gameSetup.gameType!=GAME_TYPE.REPLAY)
    //   gameSetup.sounds.backgroundmusic.play();

    gameSetup.playBuyBomb = () => {
      gameSetup.sounds.tada1.stop();
      gameSetup.sounds.tada1.play();
    }

    gameSetup.playBombSound = (container, type, param) => {
      // gameSetup.sounds.bonus1.stop();
      let soundfile = gameSetup.sounds.alertup;
      if (container == gameSetup.mazeContainer) {
        soundfile = gameSetup.sounds.alertdown;
      }
      soundfile.stop();
      soundfile.play();

    };
    gameSetup.playMatchSound = (extraP) => {
      // gameSetup.sounds.bonus1.stop();
      gameSetup.sounds.success1.stop();
      gameSetup.sounds.success1.play();
      // return;
      // if (extraP == 0) {
      //   gameSetup.sounds.success1.stop();
      //   gameSetup.sounds.success1.play();
      // } else if (extraP == 1) {
      //   gameSetup.sounds.success2.stop();
      //   gameSetup.sounds.success2.play();
      // } else {
      //   gameSetup.sounds.success3.stop();
      //   gameSetup.sounds.success3.play();
      // }
    };

    gameSetup.playBeepSound = () => {

      gameSetup.sounds.beep.stop();
      gameSetup.sounds.beep.play();
    }

    gameSetup.playBonusSound = () => {
      // gameSetup.sounds.bonus1.stop();
      // gameSetup.sounds.bonus1.play();
      gameSetup.sounds.success3.stop();
      gameSetup.sounds.success3.play();
    };


    gameSetup.playTileFallSound = () => {
      gameSetup.sounds.tilefall.stop();
      gameSetup.sounds.tilefall.play();
    };

    gameSetup.playSwapSound = () => {
      gameSetup.sounds.swapsound.stop();
      gameSetup.sounds.swapsound.play();
    };
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






  this.setupHandleTestResult = () => {

    gameSetup.resetTestTable = () => {

      gameSetup.inRunningTest = false;

      if (gameSetup.testSetupCode ) {

        Meteor.setTimeout(() => {
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
        }, 100);
      }
    };

    gameSetup.handleTestResult = (res) => {

      gameSetup.inRunningTest = false;

      if (gameSetup.testSetupCode ) {

        Meteor.setTimeout(() => {
          if (that.inNewTest) return;
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
        }, 2000);
      }



      // if (window.testCondition && window.testCondition.indexOf("RepeatingTest") == 0) {
      //   window.allStoppedTriggered = true;
      //   return;
      // }


      if (window.testCondition == "TestFinishedCueBallNotPocketed") {
        const inPocketID = gameSetup.ballsByID[CUE_BALL_ID].body.inPocketID;
        if (typeof(inPocketID) == 'undefined' || inPocketID === null) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: cue ball pocketed.";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("NoneProb") >= 0) {
        if (window.probabilityInquiryHistory != "") {
          window.testResult = `Test failed: you should not need to ask for success probability for any ball.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedNoProbabilityInquiry_") == 0) {
        const p = window.testCondition.split("_");
        const ballID = Number(p[1]);
        const pocketID = Number(p[2]);
        const h = window.probabilityInquiryHistory.split(";");
        let found = false;
        for (let k=0; k<h.length; k++) {
          if (h[k] == `${ballID}_${pocketID}`) {
            found = true; break;
          }
        }

        if (found) {
          window.testResult = `Test failed: you should not be asking for success probability for target ball ${ballID} and target pocket ${pocketID}.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;

      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedNoProbabilityInquiry2_") == 0) {
        const p = window.testCondition.split("_");
        const ballID = Number(p[1]);
        const h = window.probabilityInquiryHistory.split(";");
        let found = false;
        for (let k=0; k<h.length; k++) {
          if (h[k].indexOf(`${ballID}_`) == 0) {
            found = true; break;
          }
        }

        if (found) {
          window.testResult = `Test failed: you should not be asking for success probability for target ball ${ballID}.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;

      }



      if (window.testCondition && window.testCondition.indexOf("TestFinishedCalcStateCount_") == 0) {
        const p = window.testCondition.split("_");
        const count = Number(p[1]);
        if (count !== window.calcEndStateCount) {
          window.testResult = `Test failed: I expect you to run the end state calculation for ${count} times.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;

      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedCalcStateCountRandom_") == 0) {
        const p = window.testCondition.split("_");
        const count = Number(p[1]);
        if (count !== window.calcEndStateCountRandom) {
          window.testResult = `Test failed: I expect you to run the end state calculation for ${count} times with random simulation. Did you forget to add a second parameter 'true' to calculateEndState?`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedPlottedBasicColumnChart") == 0) {
        if (!window.plottedBasicColumn) {
          window.testResult = `Test failed: you did not successfully plot a basic column chart.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      // TestFinishedPlottedBasicScatterChart_BallDistance_Probability
      if (window.testCondition && window.testCondition.indexOf("TestFinishedPlottedBasicScatterChart_BallDistance_Probability") == 0) {
        if (!window.plottedBasicScatterBallDistanceProbability) {
          window.testResult = `Test failed: you did not successfully plot a scatter plot between BallDistance and Probability.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      // TestFinishedPlottedBasicScatterChart_CutAngle_Probability
      if (window.testCondition && window.testCondition.indexOf("TestFinishedPlottedBasicScatterChart_CutAngle_Probability") == 0) {
        if (!window.plottedBasicScatterCutAngleProbability) {
          window.testResult = `Test failed: you did not successfully plot a scatter plot between CutAngle and Probability.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      // lesson 22 linear regression part 1
      if (window.testCondition && window.testCondition.indexOf("GoodSaveDataLinearRegression") == 0) {
        if (!window.savedDataLinearRegression) {
          window.testResult = `Test failed: you did not successfully save training data for all attributes of 'BallDistance', 'PocketDistance', 'CutAngle' and 'Probability'.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestTrainLinearModelCutAngle") == 0) {
        if (!window.trainLinearModelX.length == 1 && window.trainLinearModelX[0] == 'CutAngle') {
          window.testResult = `Test failed: you did not train the probability model using CutAngle.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestTrainLinearModelCutAngleBallPocketDistance") == 0) {
        if (!window.trainLinearModelX.length == 3 && window.trainLinearModelX.includes('BallDistance') && window.trainLinearModelX.includes('CutAngle') && window.trainLinearModelX.includes('PocketDistance') ) {
          window.testResult = `Test failed: you did not train the probability model using all of BallDistance, CutAngle and PocketDistance.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }




      if (!window.testCondition || window.testCondition == "") {
        window.testResult = "No challenge specified at the moment. Type 'n' to continue.";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinishedAnyResult") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      // set all test results to true or false. can't miss any one.
      // window.TestFinishedAnyResult = true;
      // window.FirstTouchBallIsRed = gameSetup.firstBallTouchedByCueball.colorType == Pool.RED;
      // window.FirstTouchBallIsYellow = gameSetup.firstBallTouchedByCueball.colorType == Pool.YELLOW;
      // window.FirstTouchBallIsBlack = gameSetup.firstBallTouchedByCueball.colorType == Pool.BLACK;

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


      gameSetup.config.showMessage(window.testResult);

      window.submitTestResultInChat(window.testResult);

      // gameSetup.paused = true;
      gameSetup.controller.killAIPlayers();

    }
  };


  gameSetup.fround = (v) => {
    v.x = Math.fround(v.x);
    v.y = Math.fround(v.y);
  };

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
      if (gameSetup.isHost && gameSetup.hostAllStopped && !gameSetup.allStopHandled) {
        gameSetup.controller.checkIfAllPeerAllStopped();
        if (!gameSetup.allStopHandled) {
          //console.log("still haven't handle all stopped!");
        }
      }
    }
    gameSetup.controller.tickUpdate();
    TWEEN.update(time);

    gameSetup.renderer.render(gameSetup.stage);


    const endms = getMS();
    // console.log("tick took time " + (endms - startms).toFixed(3) + " " + (midms1-startms).toFixed(3) + " " + (midms2-midms1).toFixed(3) + " " + (midms3 - midms2).toFixed(3));
  };
};

export default Match3Game;
