/* eslint-disable */
/*

TODO:
1. 3 meters         DONE
2. angle            DONE
10. avatar and coins DONE
3. timer change     DONE
7. end of game result and add coin on server DONE
6. message at bototm      DONE
8. testing scaling  DONE
9. improve auto target DONE
5. pay coins on break shot and each consecutive shot (great shot window)  DONE
4. improve network ??
11. battle: show (AI)
12. reward coin sound and amount

new network play mode using mongodb

1. both player enter room and call
   PoolActions.reportEnteringGameRoom(gameSetup.room._id, gameSetup.localPlayerID);
2. when both are in room, in handleRoomUpdate, set gameSetup.peerReady to true and
   init networkHandler if first time; otherwise process command

   gameSetup.networkHandler.handleWTCData(cmdkey);
3. trySelectPlayer:
   since gameSetup.activePlayerInfo == null and gameSetup.peerReady is set to true, then we select th
  first player --> this.chooseActivePlayerToStart(); --> sendToAll "NewActivePlayerInfo"



*/

const hideTrail = false;

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

let AllPolyBodies = [];
const processedCommands = {};
let lastProcessedCmdKey = "";
let lastProcessedIndex= -1;

let printed = {world: true};

function getPosition(string, subString, index) {
  return string.split(subString, index).join(subString).length;
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
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
const CMD_TAKE_BREAK_SHOT = 0;
const CMD_TAKE_CALLED_SHOT = 1;
// const CMD_CHOSEN_GROUP = 2;
const CMD_PLACE_CUEBALL = 3;
const CMD_GET_PROBABILITY = 4;
const CMD_PLAN_CALLED_SHOT = 5;
const CMD_TEST_RUN = 6;
const CMD_SCRIPT_RESET_TABLE = 7;
const CMD_SCRIPT_PLACE_BALL_ON_TABLE = 8;
const CMD_SCRIPT_UPDATE_WORLD = 9;
const CMD_SCRIPT_CHOOSE_COLOR = 10;
const CMD_FINISH_PLACE_CUEBALL = 11;
const CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP = 12;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;
const CMD_SCRIPT_SUBMIT_DATA = 14;
const CMD_SCRIPT_PLOT_DATA = 15;
const CMD_SCRIPT_CALCULATE_END_STATE = 16;
const CMD_GET_FIRST_BALL_TOUCHED = 17;
const CMD_ERROR_IN_WORKER = 100;
const CMD_SCRIPT_LOAD_DATA = 18;
const CMD_SCRIPT_TRAIN_LINEAR_MODEL = 19;
const CMD_GET_SECONDS_LEFT = 20;
const CMD_SCRIPT_SET_SECONDS_LEFT = 21;
const CMD_SCRIPT_CALCULATE_END_STATE_2 = 22;
const CMD_GET_PROBABILITY_2 = 23;
const CMD_SCRIPT_REPORT_END_OF_TEST_SETUP = 24;
const CMD_PRINT = 25;
const CMD_CLEAR_PRINT = 26;
const CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL = 27;
const CMD_SCRIPT_EXPECT_BALL_POCKETED = 28;
const CMD_SCRIPT_EXPECT_SHOT_COMMAND = 29;

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
  BATTLE: GAME_TYPE.BATTLE,
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


/* game info storage */

const Pool = {
  RED: 0,
  YELLOW: 1,
  WHITE: 2,
  BLACK: 3,
};

function getRandomNumber(min, max) {
  return (max-min) * Math.random() + min;
}

const GameInfo = {};
let MyID = -1;
let MyColorType = -1, OpponentColorType = -1;
let url = "";
let world = {};
let Balls, Pockets, Cushions, BallDiameter, TableHeight, TableWidth, CushionWidth, PlayerInfo, Boundaries, CandidateBallList, TOP_Y, BOTTOM_Y, LEFT_X, RIGHT_X;
const resolveProbs = {};
const resolvedPlaceCueBall = {};

function getAimPosition(ballPos, pocketPos) {
  const bp = ballPos.clone ? ballPos.clone() : new Victor(ballPos.x, ballPos.y);
  const ballD = world.BallDiameter; 
  const pp = pocketPos.clone ? pocketPos.clone() : new Victor(pocketPos.x, pocketPos.y);

  // check if ball is outside the box of cushion - ball radius
  let xout = Math.abs(bp.x) >= TableWidth / 2 - CushionWidth - BallDiameter/2;
  let yout = Math.abs(bp.y) >= TableHeight / 2 - CushionWidth - BallDiameter/2;
  if (xout || yout) {
    //console.log("ball too close: xout " + xout + " yout " + yout);
    if (pp.x == Pockets[0].x && pp.y == Pockets[0].y) {
      //pp.x = 0 - TableWidth / 2; pp.y = 0 - TableHeight / 2;
      pp.x = bp.x - BallDiameter; pp.y = bp.y - BallDiameter;
    }
    if (pp.x == Pockets[2].x && pp.y == Pockets[2].y) {
      //pp.x = TableWidth / 2; pp.y = 0 - TableHeight / 2;
      pp.x = bp.x + BallDiameter; pp.y = bp.y - BallDiameter;
    }
    if (pp.x == Pockets[3].x && pp.y == Pockets[3].y) {
      //pp.x = TableWidth / 2; pp.y = TableHeight / 2;
      pp.x = bp.x + BallDiameter; pp.y = bp.y + BallDiameter;
    }
    if (pp.x == Pockets[5].x && pp.y == Pockets[5].y) {
      //pp.x = 0 - TableWidth / 2; pp.y = TableHeight / 2;
      pp.x = bp.x - BallDiameter; pp.y = bp.y + BallDiameter;
    }
    if (pp.x == Pockets[1].x && pp.y == Pockets[1].y) {
      //pp.x = 0; pp.y = 0 - TableHeight / 2;
      pp.x = 0; pp.y = bp.y - 5 * BallDiameter;
    }
    if (pp.x == Pockets[4].x && pp.y == Pockets[4].y) {
      //pp.x = 0; pp.y = TableHeight / 2;
      pp.x = 0; pp.y = bp.y + 5 * BallDiameter;
    }
  }

  const dirBallToPocket = pp.clone().subtract(bp); 

  const dirAimToBall = dirBallToPocket.normalize().scale(ballD);
  const aimPosition = bp.subtract(dirAimToBall);
  return aimPosition;
}

const p1c = new Victor(0, 0);
const p2c = new Victor(0, 0);
function extrapolatePoints(p1, p2, shift) {
  p2c.x = p2.x; p2c.y = p2.y;
  const ballD = world.BallDiameter; 
  p1c.x = p1.x; p1c.y = p1.y;

  const dir2to1 = p1c.clone().subtract(p2c); 

  //if (typeof(shift) == "undefined") shift = ballD * 2;
  const dir3to2 = dir2to1.normalize().scale(shift);
  return p2c.clone().subtract(dir3to2);
}

function isPathBlocked(pos1, pos2, endStates) {
  const ballPosList = endStates ? endStates : world.Balls;
  const allBallIDs = Object.keys(ballPosList);

  for (let k=0; k < allBallIDs.length; k++) {
    if (allBallIDs[k] == 0) continue;
    const otherBallPos = ballPosList[allBallIDs[k]];
    if (dist2(pos1, otherBallPos) <= 0.001) continue;
    if (dist2(pos2, otherBallPos) <= 0.001) continue;
    
    const dist = distToSegment(otherBallPos, pos1, pos2);
    if (dist <= world.BallDiameter) 
      return true;
  }
  return false;
}


function waitSeconds(s){
  return new Promise(function(resolve, reject){
    setTimeout(function () {
      // console.log("time out done ");
      resolve();
    },s * 1000);
  });
}

// calculate cut angle between line 1 (pos1, pos2) and line 2 (pos2, pos3)
// result is between -180 and 180
function getCutAngle(pos1, pos2, pos3) {
  const line1 = pos1.clone().subtract(pos2);
  const line2 = pos2.clone().subtract(pos3);
  const angle1 = line1.angleDeg();
  const angle2 = line2.angleDeg();
  let angleDiff = angle1 - angle2;
  if (angleDiff >= 180) angleDiff -= 360;
  if (angleDiff < -180) angleDiff += 360;
  return angleDiff;
}

function calculateCutAngle(ball_id, pocket_id) {
  const aimPos = getAimPosition(Balls[ball_id], Pockets[pocket_id]);  
  return Math.abs(getCutAngle(Pockets[pocket_id], aimPos, Balls[0]));
}

function calculateSidePocketSkew(ball_id, pocket_id) {
  if (pocket_id != 1 && pocket_id != 4) return -1;
  const ang = getAngleToSidePocket(Balls[ball_id], pocket_id);  
  return Math.abs(ang);
}

// calculate angle between line (target ball, side pocket) and pocket center normal line
// result is between -90 and 90
const ballPos = new Victor(0, 0);
function getAngleToSidePocket(ballPos0, pocketID) {
  // if not a side pocket, return a large number for now
  if (pocketID != 1 && pocketID != 4) {
    return 360 * 100;
  }
  ballPos.x = ballPos0.x; ballPos.y = ballPos0.y;
  const pocketPos = Pockets[pocketID];
  const line1 = ballPos.clone().subtract(pocketPos);
  const angle1 = line1.angleDeg();
  const angle2 = pocketID == 1 ? 90 : -90;
  let angleDiff = angle1 - angle2;
  return angleDiff;
}

// calculate euclidean distance between two positions
function getDistance(pos1, pos2) {
  return Math.abs(pos1.distance(pos2));
}

function matchScenario(s) {
  for (let ballID=0; ballID < Balls.length; ballID ++) {
    const b = Balls[ballID];
    let found = false;
    for (let k=0; k<s.length; k++) {
      const b2 = s[k];
      if (ballID == b2.ballID) {
        found = true;
        const distance = dist2(b, b2);
        if (distance > b2.radius) return false;
      }
      if (found) break;
    }
    if (!found && !b.inPocket) return false;
  }
}

async function calculateProbability(shotCmd) {
  let resolveID = Math.random().toFixed(10);
  while (resolveProbs[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_GET_PROBABILITY, resolveID, shotCmd);
  return new Promise(async function(resolve, reject){
    while (!resolveProbs[resolveID] && resolveProbs[resolveID] != 0) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    // console.log("AI: got resolveProbs!! " + resolveID);
    resolve(resolveProbs[resolveID]);
  });
};

async function calculateProbability2(initState, shotCmd) {
  let resolveID = Math.random().toFixed(10);
  while (resolveProbs[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_GET_PROBABILITY_2, resolveID, initState, shotCmd);
  return new Promise(async function(resolve, reject){
    while (!resolveProbs[resolveID] && resolveProbs[resolveID] != 0) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    // console.log("AI: got resolveProbs!! " + resolveID);
    resolve(resolveProbs[resolveID]);
  });
};


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

async function calculateEndState2(initStates, shotCmd, WithRandomNess = false) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_CALCULATE_END_STATE_2, resolveID, initStates, shotCmd, WithRandomNess);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    resolve(resolveRequests[resolveID]);
  });
};

async function calculateEndState(shotCmd, WithRandomNess = false) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_CALCULATE_END_STATE, resolveID, shotCmd, WithRandomNess);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    resolve(resolveRequests[resolveID]);
  });
};

async function calculateCTP(shotCmd, ball_id, target_point) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL, resolveID, shotCmd, ball_id, target_point);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.04);
    }
    resolve(resolveRequests[resolveID]);
  });
};


async function getFirstBallTouched(shotCmd) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_GET_FIRST_BALL_TOUCHED, resolveID, shotCmd);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID] && resolveRequests[resolveID] != 0) {
      // busy wait
      await waitSeconds(0.1);
    }
    // console.log("AI: got resolveRequests!! " + resolveID);
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

function ExpectBallPocketed(ball_id, pocket_id) {
  sendCommand(CMD_SCRIPT_EXPECT_BALL_POCKETED, ball_id, pocket_id);
}

function ExpectShotCommand(cmd) {
  sendCommand(CMD_SCRIPT_EXPECT_SHOT_COMMAND, cmd);
}

function ReportEndOfTest(res) {
  sendCommand(CMD_SCRIPT_REPORT_END_OF_TEST, res);
};

function ReportEndOfTestSetup(res) {
  sendCommand(CMD_SCRIPT_REPORT_END_OF_TEST_SETUP, res);
};

async function PlotData(tableName, chartType, xCol, yCol) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_PLOT_DATA, tableName, chartType, xCol, yCol, resolveID);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    resolve(resolveRequests[resolveID]);
  });
};

async function SubmitData(tableName, tableValue) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_SUBMIT_DATA, tableName, tableValue, resolveID);  
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.2);
    }
    resolve();
  });
}

async function TrainLinearModel(tableName, ycol, xcols) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_TRAIN_LINEAR_MODEL, tableName, ycol, xcols, resolveID);  
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.2);
    }
    resolve(resolveRequests[resolveID]);
  });
}

async function LoadData(tableName) {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_LOAD_DATA, tableName, resolveID);  
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.2);
    }
    resolve(resolveRequests[resolveID]);
  });
}

async function WaitForAllBallStopold() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP, resolveID);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.5);
    }
    resolve();
  });

};

const WaitForAllBallStop = async function() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP, resolveID);
  return new Promise(async function(resolve, reject){
    while (!resolveRequests[resolveID]) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.5);
    }
    resolve();
  });

};


const SetSecondsLeft = (s) => {
  sendCommand(CMD_SCRIPT_SET_SECONDS_LEFT, s);
};

const ChooseRedColor = function () {
  sendCommand(CMD_SCRIPT_CHOOSE_COLOR, Pool.RED);
};

const ChooseYellowColor = function () {
  sendCommand(CMD_SCRIPT_CHOOSE_COLOR, Pool.YELLOW);
};

const ChooseBlackColor = function () {
  sendCommand(CMD_SCRIPT_CHOOSE_COLOR, Pool.BLACK);
};

const copyValues = function(w) {
  for (let k=0; k<w.Pockets.length; k++) {
    world.Pockets[k].x = w.Pockets[k].x;
    world.Pockets[k].y = w.Pockets[k].y;    
  }

  let needToCreate = typeof(world.Balls) == "undefined";
  if (world.Balls && world.Balls.length != w.Balls.length) needToCreate = true;
  if (needToCreate) {
    world.Balls = [];
    // world.CandidateBallList = JSON.parse(JSON.stringify(w.CandidateBallList));
  } 
  world.CandidateBallList = JSON.parse(JSON.stringify(w.CandidateBallList));
  for (let k=0; k<w.Balls.length; k++) {
    if (!needToCreate) {
      world.Balls[k].x = w.Balls[k].x;
      world.Balls[k].y = w.Balls[k].y;    
    } else {
      world.Balls.push(new Victor(w.Balls[k].x, w.Balls[k].y));
      world.Balls[k].ID = w.Balls[k].ID;
    }
    world.Balls[k].inPocket = w.Balls[k].inPocket;
    world.Balls[k].colorType = w.Balls[k].colorType;
  }

  world.PlayerInfo[0].chosenColor = w.PlayerInfo[0].chosenColor;
  world.PlayerInfo[1].chosenColor = w.PlayerInfo[1].chosenColor;
  MyColorType = world.PlayerInfo[MyID].chosenColor;
  OpponentColorType = world.PlayerInfo[1 - MyID].chosenColor;
  
  Balls = world.Balls;
  CandidateBallList = world.CandidateBallList;
  Pockets = world.Pockets;
  Cushions = world.Cushions;
  BallDiameter = world.BallDiameter;
  TableHeight = world.TableHeight;
  TableWidth = world.TableWidth;
  CushionWidth = world.CushionWidth;
  PlayerInfo = world.PlayerInfo;
  Boundaries = {
    TOP_Y: -w.TableHeight/2 + CushionWidth + BallDiameter / 2,
    BOTTOM_Y: w.TableHeight/2 - (CushionWidth + BallDiameter / 2),
    LEFT_X: -w.TableWidth/2 + CushionWidth + BallDiameter / 2,
    RIGHT_X: w.TableWidth/2 - (CushionWidth + BallDiameter / 2), 
  };
  TOP_Y = -w.TableHeight/2 + CushionWidth + BallDiameter / 2;
  BOTTOM_Y = w.TableHeight/2 - (CushionWidth + BallDiameter / 2);
  LEFT_X = -w.TableWidth/2 + CushionWidth + BallDiameter / 2;
  RIGHT_X = w.TableWidth/2 - (CushionWidth + BallDiameter / 2);
};

const initWorld = function(w) {
  world = JSON.parse(JSON.stringify(w));
  // calculateProbability = calcProb;
  // create victors for ball pos and pocket pos
  // debugger;
  world.Pockets = [];
  if (w.Pockets) {
    for (let k=0; k<w.Pockets.length; k++) {
      world.Pockets.push(new Victor(w.Pockets[k].x, w.Pockets[k].y));
    }
  } else {
    for (let k=0; k<6; k++) {
      world.Pockets.push(new Victor(0, 0));
    }
  }

  if (w.Balls) {
    world.Balls = [];
    for (let k=0; k<w.Balls.length; k++) {
      world.Balls.push(new Victor(w.Balls[k].x, w.Balls[k].y));
      world.Balls[k].ID = w.Balls[k].ID;
      world.Balls[k].inPocket = w.Balls[k].inPocket;
      world.Balls[k].colorType = w.Balls[k].colorType;
    }
  } 
};

GameInfo.initialize = function(data) {
  // this.world = data.world;
  initWorld(data.world);

  // console.log("worker: " + data.playerID + " initialize " );
  MyID = data.playerID;
  url = data.url;

  sendCommand(CMD_READY);
};

GameInfo.update = function(data) {
  // world = data.world;
  copyValues(data.world);
  // initWorld(data.world);
};


// back up
let getBreakShot2 = function() {
  return {aimx: 0, aimy: 0};
};
let getCallShot2 = function() {
  return {aimx: 0, aimy: 0};
};
let getCueBallPlacement2 = function() {
  return {x:0, y: 0};
};

-------------



// functions available for test scripts:

const TakeBreakShot = function(newcmd) {
  try {
    if (newcmd) {
      sendCommand(CMD_TAKE_BREAK_SHOT, newcmd);
      return;
    }
    let cmd = {};
    if (typeof(getBreakShot) !== "undefined")
      cmd = getBreakShot();
    else 
      cmd = getBreakShot2();
    sendCommand(CMD_TAKE_BREAK_SHOT, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when taking break shot so using default shot to shoot at table center', e.stack);
    sendCommand(CMD_TAKE_BREAK_SHOT, {aimx: 0, aimy: 0, strength: 80});
  }
};

const print = function(str) {
  try {
    sendCommand(CMD_PRINT, {str});
  } catch (e) {
  }
};

const clearLog = function() {
  try {
    sendCommand(CMD_CLEAR_PRINT, {});
  } catch (e) {
  }
};


const TakeCallShot = async function() {
  try {
    await UpdateWorld();
    if (typeof(getCallShot) !== "undefined")
      cmd = await getCallShot();
    else
      cmd = getCallShot2();
    // debugger;
    sendCommand(CMD_TAKE_CALLED_SHOT, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when taking call shot so using default shot to shoot at table center', e.stack);
    sendCommand(CMD_TAKE_CALLED_SHOT, {aimx: Math.random() * 1600 - 800, aimy: Math.random() * 800 - 400, strength: 50});
  }
};

const ResetTable = function(clearTable) {
  sendCommand(CMD_SCRIPT_RESET_TABLE, clearTable);
};

const PlaceBallOnTable = function(id, x, y) {
  sendCommand(CMD_SCRIPT_PLACE_BALL_ON_TABLE, id, x, y);
};

const doPlaceCueBallSync = async (cmd) => {
  let resolveID = Math.random().toFixed(10);
  while (resolvedPlaceCueBall[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_PLACE_CUEBALL, resolveID, cmd);
  
  return new Promise(async function(resolve, reject){
    while (!resolvedPlaceCueBall[resolveID] && resolvedPlaceCueBall[resolveID] != 0) {
      // busy wait
      // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      await waitSeconds(0.1);
    }
    // console.log("AI: got resolveProbs!! " + resolveID);
    resolve(resolvedPlaceCueBall[resolveID]);
  });
};

const PlaceCueBallFromHand = async function() {
  try {
    await UpdateWorld();
    if (typeof(getCueBallPlacement) !== "undefined")
      cmd = getCueBallPlacement();
    else
      cmd = getCueBallPlacement2();

    await doPlaceCueBallSync(cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when placing cue ball from hand so using default location', e.stack);
    //sendCommand(CMD_PLACE_CUEBALL, resolveID, cmd);
    await doPlaceCueBallSync({x: 0, y: 0,});
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

var commandID = 0;
const CMD_READY = -1;
const CMD_TAKE_BREAK_SHOT = 0;
const CMD_TAKE_CALLED_SHOT = 1;
const CMD_CHOSEN_GROUP = 2;
const CMD_PLACE_CUEBALL = 3;
const CMD_GET_PROBABILITY = 4;
const CMD_PLAN_CALLED_SHOT = 5;
const CMD_TEST_RUN = 6;

// commands for test scripts
const CMD_SCRIPT_RESET_TABLE = 7;
const CMD_SCRIPT_PLACE_BALL_ON_TABLE = 8;
const CMD_SCRIPT_UPDATE_WORLD = 9;
const CMD_SCRIPT_CHOOSE_COLOR = 10;
const CMD_FINISH_PLACE_CUEBALL = 11;
const CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP = 12;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;
const CMD_SCRIPT_SUBMIT_DATA = 14;
const CMD_SCRIPT_PLOT_DATA = 15;
const CMD_SCRIPT_CALCULATE_END_STATE = 16;

const CMD_GET_FIRST_BALL_TOUCHED = 17;
const CMD_SCRIPT_LOAD_DATA = 18;
const CMD_SCRIPT_TRAIN_LINEAR_MODEL = 19;
const CMD_GET_SECONDS_LEFT = 20;
const CMD_SCRIPT_SET_SECONDS_LEFT = 21;
const CMD_SCRIPT_CALCULATE_END_STATE_2 = 22;
const CMD_GET_PROBABILITY_2 = 23;
const CMD_SCRIPT_REPORT_END_OF_TEST_SETUP = 24;
const CMD_PRINT = 25;
const CMD_CLEAR_PRINT = 26;
const CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL = 27;
const CMD_SCRIPT_EXPECT_BALL_POCKETED = 28;
const CMD_SCRIPT_EXPECT_SHOT_COMMAND = 29;

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
      case CMD_TAKE_BREAK_SHOT:
        GameInfo.update(data);
        TakeBreakShot();
        break;
      case CMD_TAKE_CALLED_SHOT:
      // debugger;
        GameInfo.update(data);
        TakeCallShot();
        break;
      case CMD_PLAN_CALLED_SHOT:
        GameInfo.update(data);
        if (typeof(getCallShot) !== "undefined")
          cmd = await getCallShot();
        else
          cmd = getCallShot2();
        cmd.rind = data.rind;
        sendCommand(CMD_PLAN_CALLED_SHOT, cmd);
        break;        
      case CMD_PLACE_CUEBALL:
      // debugger;
        GameInfo.update(data);
        PlaceCueBallFromHand();
        break;
      case CMD_GET_SECONDS_LEFT: 
        GameInfo.update(data);
        //resolve promise so that webworker can use the probability
        // console.log("AI: got probability back! resolveID " + data.resolveID + " prob: " + data.probability);
        resolveRequests[data.resolveID] = data.secondsLeft;
        break;
      case CMD_GET_PROBABILITY:
      case CMD_GET_PROBABILITY_2:
        GameInfo.update(data);
        //resolve promise so that webworker can use the probability
        // console.log("AI: got probability back! resolveID " + data.resolveID + " prob: " + data.probability);
        resolveProbs[data.resolveID] = data.probability;
        break;
      case CMD_SCRIPT_CALCULATE_END_STATE:
      case CMD_SCRIPT_CALCULATE_END_STATE_2:
        GameInfo.update(data);
        resolveRequests[data.resolveID] = data.endState;
        break;
      case CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL:
        resolveRequests[data.resolveID] = data.point;
        break;
      case CMD_GET_FIRST_BALL_TOUCHED:
        GameInfo.update(data);
        resolveRequests[data.resolveID] = data.firstBallTouched;
        break;
      case CMD_SCRIPT_PLOT_DATA:
      case CMD_SCRIPT_SUBMIT_DATA: 
        resolveRequests[data.resolveID] = 1;
        break;
      case CMD_SCRIPT_LOAD_DATA: 
        resolveRequests[data.resolveID] = data.tableValue;
        break;
      case CMD_SCRIPT_TRAIN_LINEAR_MODEL:
        resolveRequests[data.resolveID] = data.model;
        break;
      case CMD_FINISH_PLACE_CUEBALL:
        GameInfo.update(data);
        resolvedPlaceCueBall[data.resolveID] = 1;
        break;
      case CMD_TEST_RUN:
        GameInfo.update(data);
        testRun();
        break;
      case CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP:
        GameInfo.update(data);
        resolveRequests[data.resolveID] = 1;
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
    case CMD_TAKE_BREAK_SHOT:
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'cmdType': cmdType,
          'playerID': MyID,
          'cmd': param1
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

    case CMD_TAKE_CALLED_SHOT:
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'cmdType': cmdType,
          'playerID': MyID,
          'cmd': param1
      });
      break;
    case CMD_PLAN_CALLED_SHOT:
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'cmdType': cmdType,
          'playerID': MyID,
          'cmd': param1
      });
      break;
      //     case CMD_CHOSEN_GROUP:
// //debugger;
//       self.postMessage({
//           'cmdID': MyID+"_" + commandID,
//           'cmd': 'CHOSEN_GROUP',
//           'param': param1
//       });
//       break;
    case CMD_PLACE_CUEBALL:
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'playerID': MyID,
          'cmdType': cmdType,
          'resolveID': param1,
          'cmd': param2
      });
      break;
    case CMD_SCRIPT_CALCULATE_END_STATE:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1,
        'cmd': param2,
        'WithRandomNess': param3
      });
      break;
    case CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1,
        'cmd': param2,
        'ball_id': param3,
        'target_point': param4,
      });
      break;      
    case CMD_SCRIPT_CALCULATE_END_STATE_2:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1,
        'initState': param2,
        'cmd': param3,
        'WithRandomNess': param4
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
    case CMD_GET_PROBABILITY:
        // console.log("AI: send get probability command! resolveID " + param1);
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'playerID': MyID,
          'cmdType': cmdType,
          'resolveID': param1,
          'cmd': param2
      });
      break;
    case CMD_GET_PROBABILITY_2:
        // console.log("AI: send get probability command! resolveID " + param1);
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'playerID': MyID,
          'cmdType': cmdType,
          'resolveID': param1,
          'initState': param2,
          'cmd': param3
      });
      break;
    case CMD_GET_FIRST_BALL_TOUCHED:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1,
        'cmd': param2
      });
      break;
    case CMD_SCRIPT_RESET_TABLE:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'clearTable': param1
      });
      break;
    case CMD_SCRIPT_PLACE_BALL_ON_TABLE:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'id': param1,
        'x': param2,
        'y': param3
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
    case CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1
      });
      break;
    case CMD_SCRIPT_EXPECT_BALL_POCKETED:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'ball_id': param1,
        'pocket_id': param2,
      });
      break;
    case CMD_SCRIPT_EXPECT_SHOT_COMMAND:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'cmd': param1,
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
    case CMD_SCRIPT_SUBMIT_DATA:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'tableName': param1,
        'tableValue': param2,
        'resolveID': param3
      });
      break;
    case CMD_SCRIPT_TRAIN_LINEAR_MODEL:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'tableName': param1,
        'yCol': param2,
        'xCols': param3,
        'resolveID': param4
      });
      break;
    case CMD_SCRIPT_LOAD_DATA:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'tableName': param1,
        'resolveID': param2
      });
      break;
    case CMD_SCRIPT_PLOT_DATA:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'tableName': param1,
        'chartType': param2,
        'xCol': param3,
        'yCol': param4,
        'resolveID': param5
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
    case CMD_SCRIPT_CHOOSE_COLOR:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'color': param1
      });
      break;
    case CMD_PRINT:
    case CMD_CLEAR_PRINT:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'cmd': param1
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
    if (p[k].indexOf("clearLog") >= 0)
     continue;

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


    // if (!gameSetup.isLocal) {
    //   if (!gameSetup.peerReady || !gameSetup.peer || !gameSetup.peer._channel || gameSetup.peer._channel.readyState != "open") {
    //     // console.log("peer not good so quit on command? " + cmd);
    //     // debugger;
    //     const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    //     gameSetup.cmdHistory.push(cmdstr);
    //     return;
    //   }
    // }



    if (allLocal && gameSetup.gameType != GAME_TYPE.AUTORUN ) {
      // console.log("all local!!");
      this.executeCommandLocallyImmediately(cmd, 0);
      return;
    }

    const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    if (1 || cmd.c != "UT" && cmd.c != "KA") {
      Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
    } else {
      // if (!gameSetup.lastLongUpdateTime) {
      //   gameSetup.lastLongUpdateTime = -1;
      // }
      // const timeNow = Date.now();
      // if (timeNow - gameSetup.lastLongUpdateTime >= 4500) {
      //   Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
      //   gameSetup.lastLongUpdateTime = timeNow;
      // }
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

    const cmdkey = cmd.c + " " + cmd.t + " " + cmd.w;
    // if (cmdkey.indexOf("UT") < 0 && cmdkey.indexOf("KA") < 0)
    //   console.log("received cmd " + cmdkey);
    if (processedCommands[cmdkey]) return;

    processedCommands[cmdkey] = 1;

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
      }, 10);
    } else if (cmd.c == "ResumeGame") {
      setTimeout(() => {
        if (gameSetup && gameSetup.controller) {

          // console.log("execute NewActivePlayerInfo " + cmd.w + " " + cmd.t);
          gameSetup.controller.doResumeGame(cmd.allData);
        }
      }, 300);

    } else if (cmd.c == "QuitGameRoomWithIssue") {
      console.log("QuitGameRoomWithIssue received!");
      gameSetup.sounds.backgroundmusic.stop();
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
      gameSetup.sounds.backgroundmusic.stop();
      //gameSetup.showModalMessage(`Exiting Game Room`, `Player ${gameSetup.playerInfo[cmd.w].username} has chosen to exit the game room.`, MODAL_NOBUTTON);
      if (gameSetup.gameType == GAME_TYPE.PRACTICE) {
        gameSetup.config.showHeadline(`You are leaving the game.`, 2.5);
      } else {
        gameSetup.config.showHeadline(`Player ${gameSetup.playerInfo[cmd.w].username} chose to exit game.`, 2.5);
      }

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
      gameSetup.isKickShot = false;
      gameSetup.firstCushionTouchedByBall = null;
      gameSetup.firstBallTouchCushion = null;
      gameSetup.someBallTouchedRailedAfter = false;
      gameSetup.ballsTouchedRails = [];
      gameSetup.railsTouchedByTargetBall = [];
      gameSetup.railsTouchedByCueBall = [];
      gameSetup.newlyPocketedBalls = [];
      gameSetup.firstBallMark.position.x = 10000;
      gameSetup.firstBallMark.position.y = 10000;
      gameSetup.targetBallMark.position.x = 10000;
      gameSetup.targetPocketMark.position.x = 10000;

      if (gameSetup.difficulty == BEGINNER) {
        gameSetup.playerInfo[0].secondsLeft = 600;
        gameSetup.playerInfo[1].secondsLeft = 600;
        gameSetup.playerInfo[0].c.clockTimeStr = "10:00";
        gameSetup.playerInfo[1].c.clockTimeStr = "10:00";
      } else {
        gameSetup.playerInfo[0].secondsLeft = 1200;
        gameSetup.playerInfo[1].secondsLeft = 1200;
        gameSetup.playerInfo[0].c.clockTimeStr = "20:00";
        gameSetup.playerInfo[1].c.clockTimeStr = "20:00";
      }
      gameSetup.playerInfo[0].c.updateTimer(gameSetup.playerInfo[0].secondsLeft);
      gameSetup.playerInfo[1].c.updateTimer(gameSetup.playerInfo[1].secondsLeft);

      gameSetup.playerInfo[0].c.showNameTag(Pool.WHITE);
      gameSetup.playerInfo[1].c.showNameTag(Pool.WHITE);
      gameSetup.playerInfo[0].chosenColor = null;
      gameSetup.playerInfo[1].chosenColor = null;


    } else if (cmd.c == "UT") {
      const p = cmd.w.split("_");
      // gameSetup.playerInfo[p[0]].c.updateTimer(Number(p[1]));
      if (p.length > 2 && gameSetup.activePlayerInfo) {
        // remote preview
        if (!gameSetup.activePlayerInfo.isLocal) {
          // show preview
          if (!gameSetup.previewDir) {
            gameSetup.previewDir = new Victor(0, 0);
          }
          gameSetup.previewStrength = Number(p[3]);
          gameSetup.previewDir.x = Number(p[4]);
          gameSetup.previewDir.y = Number(p[5]);
          gameSetup.previewSpinMultiplier = Number(p[6]);
          gameSetup.previewHSpin = Number(p[7]);
          gameSetup.previewBallID = Number(p[8]);
          gameSetup.previewPocketID = Number(p[9]);
          gameSetup.runForecast(gameSetup.previewStrength, gameSetup.previewDir, gameSetup.previewSpinMultiplier, gameSetup.previewHSpin, gameSetup.previewBallID, gameSetup.previewPocketID);
        }
      }

    } else if (cmd.c == "PlaceCueBall") {
      const p = cmd.w.split("_");
      gameSetup.controller.actuallyDoPlaceCueball(Number(p[1]), Number(p[2]));
    } else if (cmd.c == "ShowMessage") {
      gameSetup.config.showMessage(cmd.w);
    } else if (cmd.c == "GoldMessage") {
      const p = cmd.w.split("_");
      gameSetup.config.showHeadline(p[0], 1.5, p[1]);
    } else if (cmd.c == "StrikeCueBall") {
      gameSetup.resetBallStopped();
      // debugger; // aaaaaa
      const p = cmd.w.split("_");
      const force = new Victor(Number(p[1]), Number(p[2]));
      const av = new Victor(Number(p[3]), Number(p[4]));
      gameSetup.controller.actuallyDoStrikeCueball(force, av, Number(p[5]), Number(p[6]), Number(p[7]), Number(p[8]), Number(p[9]), Number(p[10]), Number(p[11]) );
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
      if (cmd.c == "ALLBALLSTOPPED") return;
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
        console.log("received all ball stopped");
        const thepeer = gameSetup.peer;
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







const PathPoolGame = function (gameSetup) {
  // create the root of the scene graph
  const PathPoolGameObj = this;
  const that = this;
  const GameEngine = this;

  let tablerenderer, ballrenderer, overlayrenderer, overlayrenderer2,  controlrenderer, pixicontrolrendererexit, pixirenderertestresult;
  const unitScale = 1;
  let world = null, world2 = null;
  let balls = {}, ballbodies = {}, ballbodies2 = {};

  gameSetup.ballbodies = ballbodies;
  gameSetup.ballbodies2 = ballbodies2;

  gameSetup.clearWorld = () => {

    if (world) {
      world.clear();
      world2.clear();
    }
    // gameSetup.ballbodies = {};
    ballbodies = {};
    // gameSetup.ballbodies2 = {};
    ballbodies2 = {};
  };

  gameSetup.initWorld = () => {

    world = new p2.World({ gravity: [0, 0] });
    world2 = new p2.World({ gravity: [0, 0] });

    world.defaultContactMaterial.friction = 0;
    world.defaultContactMaterial.restitution = 0.99;
    world.defaultContactMaterial.stiffness = Number.MAX_VALUE;
    world2.defaultContactMaterial.friction = 0;
    world2.defaultContactMaterial.restitution = 0.99;
    world2.defaultContactMaterial.stiffness = Number.MAX_VALUE;

    gameSetup.world = world;
    gameSetup.world2 = world2;

    gameSetup.allObjects = {}; // used to store physics body of ball at all players
    gameSetup.allMesh = {}; // used to store mesh of ball
    gameSetup.allObjects2 = {}; // used to store physics body of copy of ball for local forecast lines at all players

    gameSetup.ballbodies = ballbodies;
    gameSetup.ballbodies2 = ballbodies2;
  };

  gameSetup.initWorld();

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

    const cfg = {
      TrueWidth: 2549, TrueHeight: 1453.5, bottomBoxHeight: 110, coinXShift: 460
    };
    gameSetup.config = cfg;
    cfg.tableW = 2000;
    cfg.tableH = cfg.tableW * 0.5;
    const whratio = cfg.TrueWidth / cfg.TrueHeight; // width vs height
    const oldnewratio = cfg.TrueWidth / 1600; // new vs old true width



    cfg.forwardLookingRatio = 1.4; // forward look 1.2 cycle for predicting ball next position

    const r = (cfg.tableW / 108); // table width is 9 feet = 108 inch
    // cfg.tableCenterX = cfg.window.left + 0.88*cfg.window.width/2;
    // cfg.tableCenterY = cfg.window.top + 1.1*cfg.window.height/2;

    if (typeof(gameSetup.difficulty) == "undefined") { gameSetup.difficulty = BEGINNER; }
    // gameSetup.difficulty = ADVANCED;// PROFESSIONAL;

    if (0 && gameSetup.difficulty == BEGINNER) {
      cfg.cornerPocketD = 5.6 * r; // new table
      cfg.sidePocketD = 4.6 * r; // new table
      cfg.metalBorderThick = 2.5 * r; // new table
      cfg.roundedRadius = 0.1 * r;
      cfg.cushionBarShift = 2 * r;
      cfg.cushionBarThick = 2 * r; // new table
      cfg.ballD = 2.05 * r; // new table
    } else {
      // use same measurement for both beginner and advanced!!
      // only difference is number of balls and time control!
      cfg.cornerPocketD = 6.4 * r; // 6.2 * r; // new table
      cfg.sidePocketD = 4.2 * r; // 5.2 * r; // new table
      //cfg.metalBorderThick = 2.1 * r;// 2.5 * r; // new table
      // cfg.metalBorderThick = 33.3964 * whratio;
      cfg.metalBorderThick = 33.3964 * oldnewratio * 1.1;
      cfg.roundedRadius = 0.1 * r;
      cfg.cushionBarShift = 1.6 * r;
      cfg.cushionBarThick = 2.8 * r; // 2 * r; // new table
      // cfg.ballD = 1.7 * r; //2.05 * r; // new table
      cfg.ballD = 2.25 * r; // new table
    }
    cfg.forecastGWidth = cfg.ballD * 0.04;
    cfg.tableCenterX = cfg.TrueWidth / 2; //cfg.tableW / 2 + cfg.metalBorderThick;
    cfg.tableCenterY = cfg.TrueHeight - cfg.tableH/2 -  cfg.metalBorderThick - cfg.bottomBoxHeight;
    cfg.cushionBarThick = 42;

    cfg.pocketShiftSide = cfg.cushionBarThick / 2; // 1 * r; // new table
    cfg.scalingratio = r;
    cfg.pocketShift = 0 - r * 0.2;
    cfg.quitArrowWidth = 8 * r;
    cfg.quitArrowHeight = 6 * r;
    cfg.quitArrowCenterX = cfg.tableCenterX - cfg.tableW / 2 + cfg.quitArrowWidth / 2 - cfg.strengthBarThick;
    cfg.quitArrowCenterY = 4 * r;

    // cfg.setupBallButtonRadius = 40 * r;
    // cfg.setupBallButtonCenterX = cfg.tableCenterX + cfg.tableW/2 + cfg.strengthBarThick - cfg.setupBallButtonRadius - 30 * r;
    // cfg.setupBallButtonCenterY = 60 * r;

    cfg.adjustButtonCfg = {
      cx: cfg.tableCenterX + cfg.tableW / 2 - 6 * r,
      cy: 4 * r,
      size: 6 * r
    };
    cfg.goButtonCfg = {
      cx: cfg.tableCenterX + cfg.tableW / 2 - 0.6 * r,
      cy: 4 * r,
      size: 6 * r
    };

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

    cfg.strikeButtonCfg = {
      text: 'Strike',
      // bColor: 160 * 256 * 256 + 0 * 256 + 0,
      bColor: 0 * 256 * 256 + 0 * 256 + 160,
      x: cfg.tableCenterX + cfg.tableW * 0.613,
      y: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick - cfg.tableH * 0.07,
      w: cfg.tableW * 0.14,
      h: cfg.quitButtonCfg.h
      // x: cfg.tableCenterX + cfg.tableW * 0.54,
      // y: cfg.tableCenterY + cfg.tableH / 2 + cfg.metalBorderThick - cfg.tableH * 0.18,
      // w: cfg.tableW * 0.1,
      // h: cfg.tableH * 0.18
    };

    // console.log('set player info');

    // since in pool game there are always only 2 players, we can simply
    // ungroup gameSetup.playerInfo into 2 playerInfo objects
    gameSetup.playerInfo1 = gameSetup.playerInfo[0];
    gameSetup.playerInfo1.chosenColor = null;
    gameSetup.playerInfo1.ID = 0;
    gameSetup.playerInfo2 = gameSetup.playerInfo[1];
    gameSetup.playerInfo2.ID = 1;
    gameSetup.playerInfo2.chosenColor = null;


    cfg.playerPanel1 = {
      cx: cfg.tableCenterX - cfg.tableW * 0.224,
      //cy: cfg.quitButtonCfg.y + cfg.quitButtonCfg.h / 2, // cfg.tableCenterY - cfg.tableH * 0.65,
      cy: (cfg.TrueHeight - cfg.tableH - 2 * cfg.metalBorderThick) / 2,
      borderwidth: 0.4 * r,
      w: cfg.tableW * 0.345558,
      h: cfg.quitButtonCfg.h,
      clockXShift: 0 - cfg.tableW * 0.159,
      isHuman: gameSetup.playerInfo1.playerType === 'Human',
      userName: gameSetup.playerInfo1.username,
      rating: gameSetup.playerInfo1.playerRating
    };

    cfg.playerPanel2 = {
      cx: cfg.tableCenterX + cfg.tableW * 0.224, // cfg.playerPanel1.w + cfg.tableW * 0.11,
      cy: cfg.playerPanel1.cy, // cfg.tableCenterY - cfg.tableH * 0.65,
      borderwidth: cfg.playerPanel1.borderwidth,
      w: cfg.playerPanel1.w,
      h: cfg.quitButtonCfg.h,
      clockXShift: 0 + cfg.tableW * 0.159,
      isHuman: gameSetup.playerInfo2.playerType === 'Human',
      userName: gameSetup.playerInfo2.username,
      rating: gameSetup.playerInfo2.playerRating
    };


    cfg.forceButtonCfg = {
      text: 'STRENGTH',
      bColor: 0 * 256 * 256 + 0 * 256 + 64, // 160*256*256+160*256+0,
      x: cfg.tableCenterX + cfg.tableW * 0.53,
      y: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick, // - cfg.tableH * 0.15,
      w: cfg.tableW * 0.1,
      h: cfg.tableH * 0.07
    };

    cfg.speedMeterCfg = {
      meterFile: '/images/SliderSlot1Speed8NoWord.png',
      bColor: 160 * 256 * 256 + 160 * 256 + 0,
      valueLow: 10,
      valueHigh: 1800,
      initValue: 2000,
      x: cfg.tableCenterX + cfg.tableW * 0.61,
      // y: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick,
      y: cfg.forceButtonCfg.y + 50,
      hlow: 270,
      hhigh: 23,
      barlength: cfg.tableW * 0.08,
      w: 70 // width of the raw image
      // w: cfg.tableW * 0.02,
      // h: cfg.tableH * 0.6,
      // barh: cfg.tableH * 0.03
    };

    // if (gameSetup.difficulty == ADVANCED)
      cfg.speedMeterCfg.valueHigh = 3000;
    // if (gameSetup.difficulty == PROFESSIONAL) {
    //   cfg.speedMeterCfg.valueHigh = 5000;
    // }

    // cfg.speedMeterCfg.initValue = (cfg.speedMeterCfg.valueHigh) / 2;
    cfg.speedMeterCfg.initValue = 900;

    gameSetup.initialTimeSeconds = 600;
    if (gameSetup.difficulty >= ADVANCED) {
      gameSetup.initialTimeSeconds = 1200;
    }

    cfg.spinButtonCfg = {
      text: 'SPIN',
      bColor: 0 * 256 * 256 + 0 * 256 + 64, // 0*256*256+160*256+0,
      x: cfg.tableCenterX + cfg.tableW * 0.53,
      y: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick + cfg.tableH * 0.55,
      w: cfg.tableW * 0.1,
      h: cfg.tableH * 0.07
    };

    cfg.spinMeterCfg = {
      meterFile: '/images/SliderSlot1SpinNoWord.png',
      bColor: cfg.speedMeterCfg.bColor,
      valueLow: -1,
      valueHigh: 1,
      initValue: 0,
      x: cfg.tableCenterX + cfg.tableW * 0.61,
      y: cfg.spinButtonCfg.y + 50,
      hlow: 144,
      hhigh: 20,
      barlength: cfg.speedMeterCfg.barlength,
      w: 70 // width of the raw image
      // w: cfg.tableW * 0.02,
      // h: cfg.tableH * 0.6,
      // barh: cfg.tableH * 0.03
    };


    // cfg.spinMeterCfg = {
    //   bColor: 0 * 256 * 256 + 160 * 256 + 0,
    //   valueLow: -1,
    //   valueHigh: 1,
    //   initValue: 0.4, //0.4,
    //   x: cfg.speedMeterCfg.x,
    //   y: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick + cfg.tableH * 0.62,
    //   w: cfg.speedMeterCfg.w,
    //   h: cfg.tableH * 0.24,
    //   barh: cfg.speedMeterCfg.barh
    // };


    cfg.angleButtonCfg = {
      text: 'ANGLE',
      bColor: 0 * 256 * 256 + 0 * 256 + 64, // 0*256*256+160*256+0,
      x: cfg.tableCenterX + cfg.tableW * 0.53,
      y: cfg.tableCenterY + cfg.tableH / 2 - cfg.metalBorderThick - cfg.tableH * 0.06,
      w: cfg.tableW * 0.1,
      h: cfg.tableH * 0.07
    };

    cfg.cwButtonCfg = {
      // cx: cfg.tableCenterX + cfg.tableW * 0.43,
      // cy: cfg.tableCenterY - cfg.tableH / 2 - cfg.metalBorderThick - cfg.tableH * 0.10,
      cx: cfg.tableCenterX + cfg.tableW * 0.515,
      cy: cfg.tableCenterY + cfg.tableH / 2 - cfg.metalBorderThick + cfg.tableH * 0.04,
      w: cfg.tableH * 0.08,
      h: cfg.tableH * 0.08,
      iconName: '/images/cwmetal3.png'
    };

    cfg.ccwButtonCfg = {
      // cx: cfg.tableCenterX + cfg.tableW * 0.49,
      cx: cfg.cwButtonCfg.cx + cfg.cwButtonCfg.w * 2.86,
      cy: cfg.cwButtonCfg.cy,
      w: cfg.cwButtonCfg.w,
      h: cfg.cwButtonCfg.h,
      iconName: '/images/ccwmetal3.png'
    };

    cfg.autoButtonCfg = {
      // cx: cfg.tableCenterX + cfg.tableW * 0.49,
      text: "AUTO",
      x: cfg.cwButtonCfg.cx + cfg.cwButtonCfg.w * 0.55,
      y: cfg.cwButtonCfg.cy - cfg.cwButtonCfg.h * 0.3,
      w: cfg.cwButtonCfg.w,
      h: cfg.cwButtonCfg.h
    };

    if (0 && gameSetup.difficulty < ADVANCED) {
      const shift = 250;
      cfg.angleButtonCfg.y -= shift;
      cfg.cwButtonCfg.cy -= shift;
      cfg.ccwButtonCfg.cy -= shift;
      cfg.autoButtonCfg.y -= shift;
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

      this.inStrike = false;
      gameSetup.enteringSimulation = false;
      this.gameState = WAIT_FOR_BREAK_STATE;
      this.setState = (s, p) => {
        if (this.gameState ==  WAIT_FOR_BREAK_STATE) {
          if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {

          } else {
            // this line runs on both sides so no need to send message all
            if (gameSetup.activePlayerInfo.isLocal && gameSetup.activePlayerInfo.playerType != "AI") {
              gameSetup.config.showMessage(`Player ${gameSetup.activePlayerInfo.username} to place cue ball on left of head string then click 'Place'.`, 10, gameSetup.placeButton.position.x - gameSetup.placeButton.width/2, gameSetup.placeButton.position.y + gameSetup.config.tableH * 0.07);
            } else {
              gameSetup.config.showMessage(`Player ${gameSetup.activePlayerInfo.username} to place cue ball on left of head string.`);

            }
          }
        }

        if (this.gameState == BREAK_CUEBALL_IN_HAND_STATE && Number(s) == BREAK_SHOT_STATE) {

          if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {

          } else {
            // this line runs on both sides so no need to send message all
            gameSetup.config.showMessage(`Player ${gameSetup.activePlayerInfo.username} to take the break shot`);
          }
        }

        this.gameState = Number(s);
        this.enterState(p);
      };

      // this.doResumeGame = (info) => {
      //   const p = info.split("^");
      //   const allStopCmd = p[0];
      //   const msgCmd = p[1];
      //   const newPlayerCmd = p[2];
      //   const playerUserId0 = p[3];
      //   const playerUserId1 = p[4];
      //   // first, reset balls
      //   const parts = allStopCmd.split(";");
      //   if (parts[2] != "") {
      //     ResetTable(true);
      //     const allBallInfo = parts[7].split("|");
      //     for (let j=0; j<allBallInfo.length - 3; j++) {
      //       const infop = allBallInfo[j].split("_");
      //       if (isNaN(infop[1]) || isNaN(infop[2]) ) {
      //         continue;
      //       }
      //       if (Number(infop[1]) == 100000 && Number(infop[2]) == 100000) {
      //         continue;
      //       }
      //       PlaceBallOnTable(infop[0], Number(infop[1]) - gameSetup.config.tableCenterX, Number(infop[2]) - gameSetup.config.tableCenterY);
      //     }

      //     const color0 = Number(allBallInfo[allBallInfo.length-3]);
      //     const color1 = Number(allBallInfo[allBallInfo.length-2]);
      //     if (color0 != -1) {
      //       // also need to set legal colors
      //       if (playerUserId0 == gameSetup.playerInfo[0].playerUserId) {
      //         gameSetup.playerInfo[0].chosenColor = color0;
      //         gameSetup.playerInfo[1].chosenColor = color1;
      //       } else {
      //         gameSetup.playerInfo[1].chosenColor = color0;
      //         gameSetup.playerInfo[0].chosenColor = color1;
      //       }
      //       gameSetup.playerInfo[0].c.showNameTag(gameSetup.playerInfo[0].chosenColor);
      //       gameSetup.playerInfo[1].c.showNameTag(gameSetup.playerInfo[1].chosenColor);
      //     }
      //   } else {
      //     ResetTable(false);
      //   }

      //   // second, show message
      //   if (msgCmd != "") {
      //     const parts = msgCmd.split(";");
      //     gameSetup.config.showMessage(parts[4]);
      //   }

      //   if (newPlayerCmd != "") {
      //     const parts = newPlayerCmd.split(";");
      //     this.setActivePlayerInfo(parts[4]);
      //   } else {
      //     // major error!
      //   }

      // };

      this.setActivePlayerInfo = (info) => {
        const p = info.split("_");
        if (gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.BATTLE) {
          if (!gameSetup.activePlayerInfo || Number(p[0]) != gameSetup.activePlayerInfo.ID || gameSetup.activePlayerInfoJustSet) {
            if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.BATTLE) {
              if (gameSetup.playerInfo[p[0]].isLocal && gameSetup.playerInfo[p[0]].userId == Meteor.userId()) {
                gameSetup.config.showHeadline("Your Turn");
              } else {
                gameSetup.config.showHeadline("Your Opponent " + gameSetup.playerInfo[p[0]].username + "'s Turn");
              }

            } else {
              gameSetup.config.showHeadline("Player " + p[0] + " " + gameSetup.playerInfo[p[0]].username + "'s Turn");
            }
            delete gameSetup.activePlayerInfoJustSet;
          }
        }

        if (gameSetup.activePlayerInfo) {
          if (!gameSetup.activePlayerInfo.cumRun ||  gameSetup.activePlayerInfo.ID !== gameSetup.playerInfo[p[0]].ID) {
            gameSetup.activePlayerInfo.cumRun = 0;
          }
        }

        gameSetup.activePlayerInfo = gameSetup.playerInfo[p[0]];
        gameSetup.activePlayerInfo.countdownStartTIme = Date.now();
        gameSetup.activePlayerInfo.secondsLeftStart = Number(p[6]);


        gameSetup.waitingPlayerInfo = gameSetup.playerInfo[1 - Number(p[0])];
        gameSetup.waitingPlayerInfo.cumRun = 0;
        gameSetup.activePlayerInfo.c.showPlayerAsActive(true);
        gameSetup.waitingPlayerInfo.c.showPlayerAsActive(false);
        gameSetup.activePlayerInfo.c.inTimeCountDown = true;
        gameSetup.waitingPlayerInfo.c.inTimeCountDown = false;

        gameSetup.enteringSimulation = true;

        if (Number(p[1]) == CALL_SHOT_STATE && Number(p[2]) >= 0) {
          const chosenColor = Number(p[2]);
          // also set chosen color!
          // console.log("chosen color!! " + gameSetup.activePlayerInfo.playerUserId + " " + chosenColor);
          gameSetup.activePlayerInfo.chosenColor = chosenColor;
          // getPlayerActionMessage(false, `GreatShotChosen${gameSetup.activePlayerInfo.chosenColor}`);
          let otherColor = Pool.RED;
          if (chosenColor === Pool.RED) { otherColor = Pool.YELLOW; }
          gameSetup.waitingPlayerInfo.chosenColor = otherColor;

          gameSetup.activePlayerInfo.c.showNameTag(gameSetup.activePlayerInfo.chosenColor);
          gameSetup.waitingPlayerInfo.c.showNameTag(gameSetup.waitingPlayerInfo.chosenColor);


          // if (gameSetup.activePlayerInfo === gameSetup.playerInfo1) {
          //   gameSetup.playerInfo2.chosenColor = otherColor;
          // } else {
          //   gameSetup.playerInfo1.chosenColor = otherColor;
          // }
        }

        // if (Number(p[3]) > -1000) {
        //   // place cue ball! decoupled!!
        //   this.actuallyDoPlaceCueball(Number(p[3]), Number(p[4]));
        // }

        gameSetup.controller.setState(p[1], p);
        // Check change item
        if (gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.TOURNAMENT) {
          if (gameSetup.activePlayerInfo.playerUserId === Meteor.userId()) {
            gameSetup.cuestick = gameSetup.yourcuestick;
            gameSetup.tableTop.buttonMode = true;
            gameSetup.cuestickcontainer = gameSetup.cuestickyourcontainer;
            gameSetup.cuestickOpponent.visible = false;
          } else {
            gameSetup.cuestick = gameSetup.cuestickOpponent;
            gameSetup.tableTop.buttonMode = false;
            gameSetup.cuestickcontainer = gameSetup.cuestickOpponentcontainer;
            gameSetup.yourcuestick.visible = false;

          }
        }
      };

      this.resetTableAndStart = () => {
        const r = gameSetup.resumeCommands;
        if (isTesting) {
          return;
        }
        let stopCmd = "";
        if (r.allStopCmd) stopCmd = r.allStopCmd;
        let msgCmd = "";
        if (r.showMessageCmd) msgCmd = r.showMessageCmd;
        if (!r.newPlayerCmd) {
          Bert.alert("failed to resume game since can't find new player command");
          return;
        }
        const newPlayerCmd = r.newPlayerCmd;
        // set activePlayerInfo so we don't do this again
        const parts = newPlayerCmd.split(";");
        const p = parts[4].split("_");
        gameSetup.activePlayerInfo = gameSetup.playerInfo[p[0]];
        gameSetup.waitingPlayerInfo = gameSetup.playerInfo[1 - Number(p[0])];

        gameSetup.playerInfo[0].secondsLeft = Number(r.timerCommand0 ? r.timerCommand0 : gameSetup.initialTimeSeconds);
        gameSetup.playerInfo[0].c.updateTimer(Number(r.timerCommand0 ? r.timerCommand0 : gameSetup.initialTimeSeconds));
        gameSetup.playerInfo[1].secondsLeft = Number(r.timerCommand0 ? r.timerCommand0 : gameSetup.initialTimeSeconds);
        gameSetup.playerInfo[1].c.updateTimer(Number(r.timerCommand1 ? r.timerCommand1 : gameSetup.initialTimeSeconds));

        const cmd = {
          c: "ResumeGame", t: gameSetup.currentCycleTime, w: `${stopCmd}^${msgCmd}^${newPlayerCmd}^${r.playerIDs[0]}^${r.playerIDs[1]}`
        };

        gameSetup.networkHandler.sendCommandToAll(cmd);
      };

      this.chooseActivePlayerToStart = () => {
        // console.log("chooseActivePlayerToStart");
        if (isTesting) {

        } else {
          let id = 0;
          if (Math.random() >= 0.5) {
            id = 1;
          }
          //id = 0; // bbbbb testing

          // console.log("active player chosen : " + id);

          // set it first at host so that we don't run into this choosing function again!
          gameSetup.activePlayerInfo = gameSetup.playerInfo[id];
          gameSetup.activePlayerInfoJustSet = true;

          if (gameSetup.activePlayerInfo.playerType == "AI") {
            this.setNewPlayerState(id, BREAK_SHOT_STATE);
            // gameSetup.networkHandler.sendCommandToAll({
            //   c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${id}_${BREAK_SHOT_STATE}`
            // });
          } else {
            this.setNewPlayerState(id, BREAK_CUEBALL_IN_HAND_STATE);
            // gameSetup.networkHandler.sendCommandToAll({
            //   c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${id}_${BREAK_CUEBALL_IN_HAND_STATE}`
            // });
          }
        }
      };

      const resetBall = function (b, x, y) {
        b.body.position[0] = x;
        b.body.position[1] = y;
        b.body.velocity[0] = 0; b.body.velocity[1] = 0;
        b.body.vlambda[0] = 0; b.body.vlambda[1] = 0;
        b.body.wlambda = 0;
        b.body.angularVelocity = 0;


        // newly added after print world
        b.body.previousPosition[0] = 0; // or always origx?
        b.body.previousPosition[1] = 0;
        b.body.invMassSolve = 0; // or always 1?
        b.body.hasFirstContact = false;
        b.body.hspin = 0;
        b.body.touchedBall = false;
        b.body.touchedRail = false;

        b.body.av.x = 0; b.body.av.y = 0;
        b.body.setZeroForce();
        b.body.inPocketID = null;
        b.body.isStopped = false;
        // b.animations.stop();




        b.body2.position[0] = x;
        b.body2.position[1] = y;
        b.body2.velocity[0] = 0; b.body2.velocity[1] = 0;
        b.body2.vlambda[0] = 0; b.body2.vlambda[1] = 0;
        b.body2.wlambda = 0;
        b.body2.angularVelocity = 0;
        b.body2.av.x = 0; b.body2.av.y = 0;
        b.body2.setZeroForce();
        b.body2.inPocketID = null;
        b.body2.isStopped = false;

        b.position.x = b.body.position[0];
        b.position.y = b.body.position[1];

        // console.log("moving ball " + b.ID + " " + b.body2.position[0]);
        if (gameSetup.gameType != GAME_TYPE.REPLAY)
          b.gotoAndStop(10);

        // b.x = x;
        // b.y = y;
      };

      this.tryPlaceCueBall = (testtarget) => {
        if (!this.checkIfCollidingBall(testtarget)) {
          const cb = gameSetup.ballsByID[0];
          if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE) {
            if (testtarget.x >= config.tableCenterX - config.tableW/4 ) return;
          }
          resetBall(cb, testtarget.x, testtarget.y);
        }
      };




      const ResetTable = (clearTable, IgnoreCueBall = false) => {


        printed = {world: true};

        // console.log("\n\n\nworld before is ");
        // deepPrint(world, 0);
        // debugger;

        this.inStrike = false;
        gameSetup.clearWorld();
        gameSetup.initWorld();
        gameSetup.createMaterials();
        gameSetup.addMateirals();
        gameSetup.setupContactEvent();
        gameSetup.reAddPolyBodies();
        gameSetup.reAddBallBodies(clearTable, IgnoreCueBall);


        if (!gameSetup.cueballDirection) {
          gameSetup.cueballDirection = new Victor(1, 0);
          // gameSetup.cueballDirection.x = 1;
          // gameSetup.cueballDirection.y = 0;

        }
        gameSetup.AIStrength = 40;
        gameSetup.AISpinMultiplier = 0;
        gameSetup.AIHSpin = 0;

        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
          that.clearForecastLines();
        }


        printed = {world: true};

        // console.log("\n\n\nworld after is ");
        // deepPrint(world, 0);
        // debugger;


        // delete gameSetup.playerInfo1.chosenColor;
        // delete gameSetup.playerInfo2.chosenColor;
      };

      // const ResetTableOld = (clearTable, IgnoreCueBall = false) => {


      //   this.inStrike = false;
      //   // gameSetup.testStarted = false;
      //   const allIDs = Object.keys(ballbodies);
      //   for (let j=0; j<allIDs.length; j++) {
      //     const i = allIDs[j];
      //     const b = ballbodies[i];
      //     if (IgnoreCueBall && i == 0) continue;
      //     if (clearTable) {
      //       resetBall(b.ball, b.ball.origX * 1000, b.ball.origY * 1000);
      //       b.inPocketID = 0;
      //     } else {
      //       // debugger;
      //       resetBall(b.ball, b.ball.origX, b.ball.origY);
      //       b.inPocketID = null;
      //     }
      //   }

      //   gameSetup.cueballDirection.x = 1;
      //   gameSetup.cueballDirection.y = 0;
      //   gameSetup.AIStrength = 30;
      //   gameSetup.AISpinMultiplier = 0;
      //   gameSetup.AIHSpin = 0;

      //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      //     that.clearForecastLines();
      //   }


      //   // world.solver.removeAllEquations();


      //   printed = {world: true};

      //   console.log("\n\n\nworld is ");
      //   deepPrint(world, 0);
      //   debugger;


      //   // delete gameSetup.playerInfo1.chosenColor;
      //   // delete gameSetup.playerInfo2.chosenColor;
      // };

      this.ResetTable = ResetTable;

      this.checkIfCollidingBall = (pos) => {
        let collide = false;
        if (!gameSetup.innerRectangle.contains(pos.x, pos.y)) {
          return true;
        }
        gameSetup.balls.forEach((b) => {
          if (b.body.inPocketID !== null || b.ID === 0) { return; }
          const pos1 = new Victor(b.x, b.y);
          const d = pos.distance(pos1);
          if (d <= config.ballD * 0.99999) {
            collide = true;
          }
        });
        return collide;
      };

      this.replaceCueBallNoCollision = (cb) => {
        const point1 = new Victor(cb.origX, cb.origY);
        const point2 = new Victor(config.tableCenterX + config.tableW * 0.2, config.tableCenterY);
            // search through point1 to point2, and find the first position where it is safe to place the cue ball

        const step = point2.clone().subtract(point1).normalize().multiplyScalar(config.ballD / 4);
        const totalD = point2.distance(point1);
        for (let i = 0; i < totalD / step.length(); i++) {
          const pt = point1.clone().add(step.multiplyScalar(i));
          // console.log(`testing replace position ${pt.x} `);

          let found = false;
          gameSetup.balls.forEach((b) => {
            if (found || b.body.inPocketID !== null || b.ID === 0) {
              return;
            }
            const pos = new Victor(b.x, b.y);
            const d = pos.distance(pt);
            if (d <= config.ballD) {
              found = true;
            }
          });

          if (!found) {
            resetBall(cb, pt.x, pt.y);
            return;
          }
        }
      };

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
        const grey = 0xA0A0A0;
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




      this.defineLegalColorForPlayer = (info) => {
        if (info.chosenColor != null) {
          // define legal color
          const ids = Object.keys(gameSetup.ballsByID);
          for (let k=0; k<ids.length; k++) {
            const b = gameSetup.ballsByID[ids[k]];
            if (b.body.inPocketID == null) {
              if (b.colorType == info.chosenColor) {
                info.legalColor = info.chosenColor;
                return;
              }
            }
          }

          // no ball of chosen color is left, so can only shoot black
          if (gameSetup.blackball.body.inPocketID != null) {
            debugger;
          }
          info.legalColor = gameSetup.blackball.colorType;
        } else {
          info.legalColor = null;
        }
      };

      this.defineLegalColorForNonActivePlayer = () => {
        if (gameSetup.activePlayerInfo.ID == 0) {
          this.defineLegalColorForPlayer(gameSetup.playerInfo2);
        } else {
          this.defineLegalColorForPlayer(gameSetup.playerInfo1);
        }
      };

      this.defineLegalColorForActivePlayer = () => {
        this.defineLegalColorForPlayer(gameSetup.activePlayerInfo);
        // if (gameSetup.activePlayerInfo.chosenColor != null) {
        //   // define legal color
        //   const ids = Object.keys(gameSetup.ballsByID);
        //   for (let k=0; k<ids.length; k++) {
        //     const b = gameSetup.ballsByID[ids[k]];
        //     if (b.body.inPocketID == null) {
        //       if (b.colorType == gameSetup.activePlayerInfo.chosenColor) {
        //         gameSetup.activePlayerInfo.legalColor = gameSetup.activePlayerInfo.chosenColor;
        //         return;
        //       }
        //     }
        //   }

        //   // no ball of chosen color is left, so can only shoot black
        //   if (gameSetup.blackball.body.inPocketID != null) {
        //     debugger;
        //   }
        //   gameSetup.activePlayerInfo.legalColor = gameSetup.blackball.colorType;
        // } else {
        //   gameSetup.activePlayerInfo.legalColor = null;
        // }
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

      gameSetup.calculateRotation = (strength, spinMultiplier, hspin, givenSkew) => {
        let rr = rnd2(); // 0.0
        // strength = strength;
        // console.log(`strike using rr of ${rr} at time ${Date.now()}`);
        if (typeof(givenSkew) != "undefined")
          rr = givenSkew;
        const rot = (rr) * (Math.PI / gameSetup.Randomness) * (strength * (1 + Math.abs(spinMultiplier / 2.5)  + Math.abs(hspin / (30*2.5))));
        return rot;
      };

      this.strikeWith = (strength, dir, spinMultiplier, hspin) => {
        // const rr = rnd2(); // 0.0
        // strength = strength;
        // console.log(`dddd strike with using rr of ${rr} at time ${Date.now()}`);
        // console.log("Strike with " + JSON.stringify(dir));

        // const rot = (rr) * (Math.PI / gameSetup.Randomness) * (strength * (1 + Math.abs(spinMultiplier / 2.5)));
        const rot = gameSetup.calculateRotation(strength, spinMultiplier, hspin);
        dir.rotate(rot);
        const force = dir.normalize().multiplyScalar(strength);
        force.x = Math.fround(force.x);
        force.y = Math.fround(force.y);


        gameSetup.counter = 0;
        const av = force.clone().multiplyScalar(spinMultiplier);

        gameSetup.strikeCallback(force, av);

        // console.log("before clearForecastLines");
        this.clearForecastLines(true);
        // console.log("after clearForecastLines");
      };

      gameSetup.showAllBallPosition = () => {
        return;
        const allIDs = Object.keys(ballbodies);
        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          const b = ballbodies[i];
          if (b.inPocketID != null) continue;
          console.log(`ball ${b.ID}: ${b.position[0]} ${b.position[1]} `);
        }
        console.log("\n\n\n\n\n");
      };

      this.strikeWithExact = (force, av, hspin) => {
        // const rr = rnd2(); // 0.0
        // // strength = strength;
        gameSetup.resetBallStopped();
        // console.log(`exact strike using of force ${force.x} ${force.y} av ${av}`);
        // gameSetup.showAllBallPosition();

        gameSetup.counter = 0;
        // const av = force.clone().multiplyScalar(spinMultiplier);

        gameSetup.strikeCallback(force, av, hspin);

        // console.log("before clearForecastLines");
        // this.clearForecastLines(true);
        // console.log("after clearForecastLines");
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

      this.doStrikeCmd = function(cmd) {
        if (!cmd.strikeCmd) {
          debugger;
        }
        const p = cmd.strikeCmd.split("_");
        const force = new Victor(Number(p[1]), Number(p[2]));
        const av = new Victor(Number(p[3]), Number(p[4]));
        this.actuallyDoStrikeCueball(force, av, Number(p[5]), Number(p[6]), Number(p[7]), Number(p[8]), Number(p[9]), Number(p[10]), Number(p[11]));
      };

      this.replayCommand = function(cmd) {

        if (gameSetup.strikeTimer) {
          clearTimeout(gameSetup.strikeTimer);
          delete gameSetup.strikeTimer;
        }
        this.resetToCommand(cmd);
        if (!cmd.placeCmd) {
          this.doStrikeCmd(cmd);
        } else {
          const me = this;
          gameSetup.inWaitingPlacement = true;
          // should wait 1 sec to show the movement of cue ball
          gameSetup.strikeTimer = setTimeout(() => {
            me.doStrikeCmd(cmd);
            gameSetup.inWaitingPlacement = false;
          }, 1000);
        }

        // this.actuallyDoStrikeCueball(force, av, strength, hspin, tb, tp, spin);
          // if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
          //   const cmdstr = `StrikeCueBall;${gameSetup.currentCycleTime};${gameSetup.activePlayerInfo.ID}_${Math.fround(force.x)}_${Math.fround(force.y)}_${Math.fround(av.x)}_${Math.fround(av.y)}_${Math.fround(strength)}_${Math.fround(hspin)}_${tb}_${tp}`;
          //   this.saveCommand(cmdstr);
          // }
      };

      this.planToStrikeCueball = function (force, av, strength, hspin, tb, tp, spin) {
        // console.log("planToStrikeCueball target ball " + tb + " target pocket " + tp);

        if (gameSetup.isLocal) {
          this.actuallyDoStrikeCueball(force, av, strength, hspin, tb, tp, spin);
          if (gameSetup.gameType == GAME_TYPE.AUTORUN) {

            let prob = -1;
            if (gameSetup.probText.text != "  -  ")
              prob = Number(gameSetup.probText.text.substring(2, gameSetup.probText.text.length - 3));
            const cb = gameSetup.ballsByID[0];
            const cmdstr = `StrikeCueBall;${gameSetup.currentCycleTime};${gameSetup.activePlayerInfo.ID}_${Math.fround(force.x)}_${Math.fround(force.y)}_${Math.fround(av.x)}_${Math.fround(av.y)}_${Math.fround(strength)}_${Math.fround(hspin)}_${tb}_${tp}_${spin}_${cb.body.position[0]}_${cb.body.position[1]}_${prob}`;

            this.saveCommand(cmdstr);
          }
        } else {

          // also need to send new cue ball position!
          delete gameSetup.savedStrength;
          const cb = gameSetup.ballsByID[0];
          gameSetup.networkHandler.sendCommandToAll({
            c: "StrikeCueBall", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${Math.fround(force.x)}_${Math.fround(force.y)}_${Math.fround(av.x)}_${Math.fround(av.y)}_${Math.fround(strength)}_${Math.fround(hspin)}_${tb}_${tp}_${spin}_${cb.body.position[0]}_${cb.body.position[1]}`
          });
        }
      };

      this.onPlaceButtonClick = () => {
        if (gameSetup.isCueballInHand()) {
          const cb = gameSetup.ballsByID[0];
          const x = Math.fround(cb.position.x);
          const y = Math.fround(cb.position.y);
          gameSetup.controller.planToPlaceCueball(x, y);
          gameSetup.config.hideMessage();
        } else {
        }
      }

      this.onStrikeButtonClick = function () {
        if (!gameSetup.controller || !gameSetup.controller.allowInput()) {
          return;
        }

        gameSetup.config.hideMessage();

        //gameSetup.controller.inStrike = true;

        // much faster if commented out??
        // that.clearCueballTrails();


        const dir = gameSetup.cueballDirection.clone();
        // console.log("onStrikeButtonClick dir is " + JSON.stringify(dir));
        // testing reproducible
        // dir.x = 1; dir.y = 0.5;

        let strength;
        let spinMultiplier;
        let hspin = 0;
        if (gameSetup.activePlayerInfo.playerType == "AI") {
          if (!gameSetup.AIStrength) { gameSetup.AIStrength = 40; }
          if (!gameSetup.AISpinMultiplier) { gameSetup.AISpinMultiplier = 0; }
          if (!gameSetup.AIHSpin) { gameSetup.AIHSpin = 0; }
          strength = gameSetup.AIStrength / 100 * MAX_SPEED / unitScale; // unit difference?
          spinMultiplier = gameSetup.AISpinMultiplier;
          hspin = gameSetup.AIHSpin;
        } else {
          strength = gameSetup.speedMeterBall.value/ 100 * MAX_SPEED / unitScale; // unit difference?
          spinMultiplier = 0 - SPIN_M * gameSetup.spinMeterBar.value;
          hspin = gameSetup.spinMeterBarH.value;
        }

        strength = Math.fround(strength);
        spinMultiplier = Math.fround(spinMultiplier);
        hspin = Math.fround(hspin);

        const rr = rnd2(); // 0.0

        // strength = strength;
        // console.log(`plan to strike using rr of ${rr} at time ${Date.now()}`);

        //const rot = (rr) * (Math.PI / gameSetup.Randomness) * (strength * (1 + Math.abs(spinMultiplier / 2.5)));
        const rot = (rr) * (Math.PI / gameSetup.Randomness) * (strength * (1 + Math.abs(spinMultiplier / 2.5)  + Math.abs(hspin / (30*2.5))));

        // testing reproducible
        dir.rotate(rot);

        const force = dir.normalize().multiplyScalar(strength);
        force.x = Math.fround(force.x);
        force.y = Math.fround(force.y);


        const av = force.clone().multiplyScalar(spinMultiplier);
        av.x = Math.fround(av.x);
        av.y = Math.fround(av.y);

        const spin = (0 - spinMultiplier)/2.5;
        gameSetup.controller.planToStrikeCueball(force, av, strength, hspin, gameSetup.targetBallID ? gameSetup.targetBallID : -1, gameSetup.targetPocketID != null && gameSetup.targetPocketID >= 0 ? gameSetup.targetPocketID : -1, spin);
      };

      this.actuallyDoStrikeCueball = function(force, av, strength, hspin, tb, tp, spin, cbx, cby) {
        // console.log("actuallyDoStrikeCueball " + tb + " " + tp + " " + Date.now());
        if (tb >=0 && tp <0) { // error
          //debugger;
        }
        // console.log("\n\nactuallyDoStrikeCueball " + JSON.stringify(force) + " " + JSON.stringify(av) + " " + JSON.stringify(strength) + " " + hspin + " " + cbx + " " + cby);

        let posStr = "";
        for (let k=0; k<gameSetup.balls.length; k++) {
          const b = gameSetup.balls[k];
          if (!b.inPocketID || b.inPocketID == null)
            posStr += `${b.ID}_${b.x}_${b.y}_${b.body.position[0]}_${b.body.position[1]}|`;
        }
        // console.log("posstr " + posStr);

        if (typeof(cbx) != "undefined") {
          const cb = gameSetup.ballsByID[0];
          resetBall(cb, cbx, cby);
        }
        if (gameSetup.gameType !== GAME_TYPE.AUTORUN && gameSetup.gameType !== GAME_TYPE.PRACTICE && gameSetup.activePlayerInfo != gameSetup.playerInfo[gameSetup.localPlayerID]) {
          if (gameSetup.probText) gameSetup.probText.text = `  -  `;
        }
        gameSetup.config.hideMessage();
        // aaaa
        that.clearForecastLines(true);
        gameSetup.controller.inStrike = false;
        that.clearIsStopped();
        gameSetup.cueball.body.hasFirstContact = false;

        // const spinMultiplier = 0 - 2.5 * spin;
        // gameSetup.AIStrength = strength;
        // gameSetup.AISpinMultiplier = spinMultiplier;
        // gameSetup.AIHSpin = hspin;


        gameSetup.inStrikeAnimation = true;
        gameSetup.gameOver = false;
        gameSetup.currentShotStrength = strength;
        gameSetup.cuestick.visible = true;
        gameSetup.cuestick.alpha = 1;
        gameSetup.cuestick.position.y = strength / 10 + config.ballD / 2;
        gameSetup.cuestick.position.x = -1 * config.ballD/2 * hspin / 30;
        const rot = Math.atan2(force.y, force.x) + Math.PI / 2;
        gameSetup.cuestickcontainer.rotation = rot;
        gameSetup.cuestickcontainer.position.x = gameSetup.cueball.body.position[0];
        gameSetup.cuestickcontainer.position.y = gameSetup.cueball.body.position[1];


        if (gameSetup.controller.gameState != CALL_SHOT_STATE) {
          gameSetup.targetBallMark.visible = false;
          gameSetup.targetPocketMark.visible = false;

        } else {
          // console.log("setting target ball/pocket mark visible for " + tb + " " + tp);
          gameSetup.targetBallID = tb;
          gameSetup.targetPocketID = gameSetup.pocketIDMap[tp];

          if (gameSetup.targetBallID > 0 && gameSetup.targetPocketID != null && gameSetup.targetPocketID >= 0) {
            gameSetup.targetBallMark.visible = true;
            gameSetup.targetPocketMark.visible = true;
            const pocket = gameSetup.tablePocket2[gameSetup.targetPocketID];
            gameSetup.targetPocketMark.position.x = pocket.x;
            gameSetup.targetPocketMark.position.y = pocket.y;
            gameSetup.targetBallMark.position.x = gameSetup.ballsByID[gameSetup.targetBallID].position.x;
            gameSetup.targetBallMark.position.y = gameSetup.ballsByID[gameSetup.targetBallID].position.y;
          } else {
            gameSetup.targetBallMark.visible = false;
            gameSetup.targetPocketMark.visible = false;
          }
        }

        const oldy = gameSetup.cuestick.position.y;
        // console.log("on strike: old cue stick position " + oldy);
        const obj = { y: oldy, alpha: 1 };
        if (gameSetup.gameType != GAME_TYPE.REPLAY && gameSetup.gameType != GAME_TYPE.TESTING) {
          gameSetup.tweenF1 = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
            .to({ y: config.ballD / 1.9 }, 1000) // if strength is 1000, then 1 second
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onUpdate(() => { // Called after tween.js updates 'coords'.
              // console.log("update tween f1 " + obj.y + " " + Date.now());
              if (gameSetup.gameOver || !gameSetup.inStrikeAnimation) return;
              gameSetup.cuestick.position.y = obj.y;
            });
          gameSetup.tweenB1 = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
            .to({ y: oldy }, 500)
            .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
            .onUpdate(() => { // Called after tween.js updates 'coords'.
              // console.log("update tween b1 " + obj.y + " " + Date.now());
              if (!gameSetup || !gameSetup.cuestick) return;
              if (gameSetup.gameOver || !gameSetup.inStrikeAnimation) return;
              gameSetup.cuestick.position.y = obj.y;
            });
        }
        gameSetup.tweenF2 = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ y: config.ballD / 1.9 }, 200) // if strength is 1200, then 1 second
          // .easing(TWEEN.Easing.Quadratic.In) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            // console.log("update tween f2 " + obj.y + " " + Date.now());
            if (!gameSetup || !gameSetup.cuestick) return;
            if (gameSetup.gameOver || !gameSetup.inStrikeAnimation) return;
            gameSetup.cuestick.position.y = obj.y;
          })
          .onComplete(() => {
            // console.log("tweenF2 comppppplete!! " + " " + Date.now());
            if (gameSetup.gameOver || !gameSetup.inStrikeAnimation) return;
            // gameSetup.controller.strikeWith(strength, dir, spinMultiplier);
            if (gameSetup.gameType !== GAME_TYPE.AUTORUN && gameSetup.gameType !== GAME_TYPE.PRACTICE && gameSetup.activePlayerInfo != gameSetup.playerInfo[gameSetup.localPlayerID]) {
              if (gameSetup.probText) gameSetup.probText.text = `  -  `;
            }
            // console.log("Strike with force " + JSON.stringify(force));
            gameSetup.controller.strikeWithExact(force, av, hspin);
            gameSetup.inStrikeAnimation = false;
          });

        gameSetup.tweenB2 = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ y: config.ballD * 6, alpha: 0 }, 800) // if strength is 1200, then 1 second
          // .easing(TWEEN.Easing.Quadratic.In) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            // console.log("update tween b2 " + obj.y  + " " + Date.now());
            if (!gameSetup || !gameSetup.cuestick) return;
            gameSetup.cuestick.position.y = obj.y;
            gameSetup.cuestick.alpha = obj.alpha;
          })
          .onComplete(() => {
            // console.log("tweenB2 comppppplete!! " + " " + Date.now());
            if (!gameSetup || !gameSetup.cuestick) return;
            gameSetup.cuestick.visible = false;
            gameSetup.cuestick.alpha = 1;
          });


        if (gameSetup.gameType == GAME_TYPE.REPLAY || gameSetup.gameType == GAME_TYPE.TESTING) {
          gameSetup.tweenF2.chain(gameSetup.tweenB2);
          gameSetup.tweenF2.start();
        } else {
          gameSetup.tweenF1.chain(gameSetup.tweenB1);
          gameSetup.tweenB1.chain(gameSetup.tweenF2);
          gameSetup.tweenF2.chain(gameSetup.tweenB2);
          gameSetup.tweenF1.start();
        }



              // gameSetup.allStopped = false;
              // gameSetup.cueball.av = gameSetup.cueballAV.clone();
              // console.log("Hit button clicked ");
      };




      this.createWorldForPlayer = function() {
        // WorldForPlayer.CenterX = config.tableCenterX;
        // WorldForPlayer.CenterY = config.tableCenterY;
        WorldForPlayer.level = gameSetup.difficulty;
        WorldForPlayer.TableWidth = config.tableW;
        WorldForPlayer.TableHeight = config.tableH;
        WorldForPlayer.CushionWidth = config.cushionBarThick;
        WorldForPlayer.BallDiameter = config.ballD;
        WorldForPlayer.PlayerInfo = {};

        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID] = {};
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID] = {};
        WorldForPlayer.ColorType = Pool;

        WorldForPlayer.Pockets = [];
        if (0 && gameSetup.difficulty >= ADVANCED) {
          gameSetup.tablePocket.forEach((p) => {
            WorldForPlayer.Pockets.push(new Victor(p.x - config.tableCenterX, p.y - config.tableCenterY));
          });
        } else {
          // do not add mirrored pockets
          for (let k=0; k<6; k++) {
            const p = gameSetup.tablePocket[k];
            WorldForPlayer.Pockets.push(new Victor(p.x - config.tableCenterX, p.y - config.tableCenterY));
          }
        }

        // do I need to add these??

        // const cornershift = config.cushionBarThick * 1;
        // WorldForPlayer.Pockets[0].x += cornershift;
        // WorldForPlayer.Pockets[0].y += cornershift;

        // WorldForPlayer.Pockets[2].x -= cornershift;
        // WorldForPlayer.Pockets[2].y += cornershift;

        // WorldForPlayer.Pockets[3].x -= cornershift;
        // WorldForPlayer.Pockets[3].y -= cornershift;

        // WorldForPlayer.Pockets[5].x += cornershift;
        // WorldForPlayer.Pockets[5].y -= cornershift;

        // const sideshift = config.cushionBarThick;
        // WorldForPlayer.Pockets[1].y += sideshift;
        // WorldForPlayer.Pockets[4].y -= sideshift;

                  // 6 end points for rails corresponding to 6 pockets
        const endPoints = [];
        const adj = config.cushionBarThick + config.ballD / 2;
        endPoints.push(new Victor(config.tableCenterX, config.tableCenterY - 0.5 * config.tableH + adj));
        endPoints.push(new Victor(config.tableCenterX + config.tableW / 2 - adj, config.tableCenterY - 0.5 * config.tableH + adj));
        endPoints.push(new Victor(config.tableCenterX + config.tableW / 2 - adj, config.tableCenterY + 0.5 * config.tableH - adj));
        endPoints.push(new Victor(config.tableCenterX, config.tableCenterY + 0.5 * config.tableH - adj));
        endPoints.push(new Victor(config.tableCenterX - config.tableW / 2 + adj, config.tableCenterY + 0.5 * config.tableH - adj));
        endPoints.push(new Victor(config.tableCenterX - config.tableW / 2 + adj, config.tableCenterY - 0.5 * config.tableH + adj));

        WorldForPlayer.Cushions = [];
        WorldForPlayer.Cushions.push({ p1: endPoints[0], p2: endPoints[1] });
        WorldForPlayer.Cushions.push({ p1: endPoints[1], p2: endPoints[2] });
        WorldForPlayer.Cushions.push({ p1: endPoints[2], p2: endPoints[3] });
        WorldForPlayer.Cushions.push({ p1: endPoints[3], p2: endPoints[4] });
        WorldForPlayer.Cushions.push({ p1: endPoints[4], p2: endPoints[5] });
        WorldForPlayer.Cushions.push({ p1: endPoints[5], p2: endPoints[0] });



        // WorldForPlayer.calculateProbability = function (shotCmd) {
        //   return gameSetup.controller.calcProbSync(shotCmd);
        // };

        // WorldForPlayer.CalculateProbabilityByBallID = function (shotCmd, ballID) {
        //   return gameSetup.controller.calcProbSyncByBallID(shotCmd, ballID);
        // };

        // WorldForPlayer.isValidFirstTouchColor = function (shotCmd, myColor) {
        //   if (typeof (myColor) === 'undefined') { return true; }
        //   return gameSetup.controller.calculateFirstTouchGoodByColor(shotCmd, myColor);
        // };
        // WorldForPlayer.getIntersection = function (a1, a2, b1, b2) {
        //   return checkLineIntersection(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y, b2.x, b2.y);
        // };
      };


      this.updateWorld = () => {
        const game = gameSetup;
        // debugger;
        WorldForPlayer.Balls = [];
        WorldForPlayer.level = gameSetup.difficulty;
        WorldForPlayer.CandidateBallList = [];
        WorldForPlayer.CandidateBallList.push([]);
        WorldForPlayer.CandidateBallList.push([]);
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = gameSetup.playerInfo1.chosenColor;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = gameSetup.playerInfo2.chosenColor;
        const color0 = WorldForPlayer.PlayerInfo[0].chosenColor;
        const color1 = WorldForPlayer.PlayerInfo[1].chosenColor;
        for (let i = 0; i < gameSetup.balls.length; i++) { WorldForPlayer.Balls.push({}); }

        gameSetup.balls.forEach((b) => {
          WorldForPlayer.Balls[b.ID] = new Victor(b.x - gameSetup.config.tableCenterX, b.y - gameSetup.config.tableCenterY);
          WorldForPlayer.Balls[b.ID].inPocket = b.body.inPocketID !== null;
          WorldForPlayer.Balls[b.ID].colorType = b.colorType;
          WorldForPlayer.Balls[b.ID].ID = b.ID;

          if ((color0 == null || (typeof (color0) === 'undefined') || (color0 === b.colorType)) && (b.body.inPocketID === null || typeof(b.body.inPocketID) == "undefined") && b.ID > 1) {
            WorldForPlayer.CandidateBallList[0].push(b.ID);
          }
          if ((color1 == null || (typeof (color1) === 'undefined') || (color1 === b.colorType)) && (b.body.inPocketID === null || typeof(b.body.inPocketID) == "undefined") && b.ID > 1) {
            WorldForPlayer.CandidateBallList[1].push(b.ID);
          }
        });
        const blackballbody = gameSetup.ballbodies[1];
        if (WorldForPlayer.CandidateBallList[0].length === 0 && (blackballbody.inPocketID === null || typeof(blackballbody.inPocketID) == "undefined")) {
          WorldForPlayer.CandidateBallList[0].push(1);
        }
        if (WorldForPlayer.CandidateBallList[1].length === 0 && (blackballbody.inPocketID === null || typeof(blackballbody.inPocketID) == "undefined")) {
          WorldForPlayer.CandidateBallList[1].push(1);
        }

        if (WorldForPlayer.CandidateBallListOverwrite) {
          WorldForPlayer.CandidateBallList[0] = WorldForPlayer.CandidateBallListOverwrite;
          WorldForPlayer.CandidateBallList[1] = WorldForPlayer.CandidateBallListOverwrite;
        }
      };

      this.enterState = (p) => {
        if (!gameSetup.controller) return;
        this.updatePlayerPanel(gameSetup.playerInfo1);
        this.updatePlayerPanel(gameSetup.playerInfo2);
        this.gameState = Number(this.gameState);

        if (this.gameState == BREAK_CUEBALL_IN_HAND_STATE && gameSetup.activePlayerInfo.playerType == "AI") {
          // for AI no need for cue ball in hand state!?
          // this.gameState = BREAK_SHOT_STATE;
        }

        // console.log(`\n\n\n\n\nenter state for active player ${gameSetup.activePlayerInfo.ID} ${this.gameState}`);
        if (this.gameState == CUEBALL_IN_HAND) {
          // debugger;
        }
        if (gameSetup.activePlayerInfo.isLocal) {
          if (gameSetup.activePlayerInfo.playerType == "AI") {
            this.disableGUIInputs();
          } else {
            // enable local input GUI and wait for strike or place action
            if (this.gameState != CUEBALL_IN_HAND && this.gameState != BREAK_CUEBALL_IN_HAND_STATE && this.gameState != GAME_OVER_STATE) {
              this.enableGUIInputs();
              gameSetup.toggleHitButton(true);
            } else {
              this.disableGUIInputs();
              if (this.gameState == CUEBALL_IN_HAND || this.gameState == BREAK_CUEBALL_IN_HAND_STATE) {
                gameSetup.toggleHitButton(false);
                that.clearForecastLines();
              }
            }
          }
        } else {
          that.clearForecastLines();
          this.disableGUIInputs();
        }

        switch (this.gameState) {
          case WAIT_FOR_BREAK_STATE: {
            config.sendMessageAll(`Waiting for game start...`, 1);
            break;
          }
          case BREAK_CUEBALL_IN_HAND_STATE: { // dedicated for human player state!
            this.ResetTable(false);
            // console.log("enter BREAK_CUEBALL_IN_HAND_STATE STATE");
            gameSetup.cuestick.visible = false;
            // config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to place cue ball`, 0);

            if (!isTesting && !gameSetup.activePlayerInfo.isLocal) {
              // that.clearForecastLines();
            } else if (!isTesting) {
              const cb = gameSetup.ballsByID[0];
              gameSetup.controller.replaceCueBallNoCollision(cb);
              cb.body.inPocketID = null;
              if (gameSetup.activePlayerInfo.playerType == 'AI') {
                // no need to do place seperately!
                this.setState(BREAK_SHOT_STATE);
              } else {
                cueballInHand = true;
                //gameSetup.strikeButton.text.text = "Place";
                // console.log("set probtext to -- 4");
                gameSetup.probText.text = `  -  `;
                gameSetup.toggleHitButton(false);
              }
              // that.enablePlaceButton();
              // getPlayerActionMessage(true, 'CueballInHand');
            }
            break;
          }
          case BREAK_SHOT_STATE: {
            //config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to take break shot`, 1);
            // config.sendMessageAll(`to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot`, 1);
            // if (isTesting)
            if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY)
              this.ResetTable(false);
            else {
              if (gameSetup.activePlayerInfo.playerType !== "AI") {
                // manual player
                this.ResetTable(false, true);
              } else {
                // AI player, so reset table!
                this.ResetTable(false);
              }
            }

            if (gameSetup.activePlayerInfo.isLocal) {
              if (gameSetup.activePlayerInfo.playerType == "AI") {
                // get break shot command from robot

                let lag = 600;
                if (isMatch || isPractice) lag = 1200;
                setTimeout(() => {
                  gameSetup.controller.updateWorld();
                  // const shotCmdUser = gameSetup.activePlayerInfo.playerAI.getBreakShot();
                  gameSetup.activePlayerInfo.playerWorker.sendMessage({
                    'cmd': CMD_TAKE_BREAK_SHOT,
                    'world': WorldForPlayer
                  });

                  // setTimeout(() => {
                  //                   // that.clearForecastLines(true);
                  //   // what's this line?
                  //   // if (gameSetup.firstBallTouchedByCueball !== null) {
                  //   //   gameSetup.firstBallTouchedByCueball.colorType = null;
                  //   // }
                  //   that.clearForecastLines();
                  //   console.log("before strikeWith");
                  //   that.strikeWith(strength, dir, spinMultiplier);
                  //   console.log("after strikeWith");
                  // }, 1000);
                }, lag);
              } else {
                // should just do nothing and wait for strike or place action
              }
            }
            break;
          }
          case CALL_SHOT_STATE: {
            gameSetup.controller.defineLegalColorForActivePlayer();
            // config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to take a call shot`, 0);
            //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = "Strike";
            gameSetup.toggleHitButton(true);
            if (gameSetup.activePlayerInfo.isLocal) {
              if (gameSetup.activePlayerInfo.playerType == "AI") {
                let lag = 600;
                if (isMatch || isPractice) lag = 1200;

                setTimeout(() => {
                  // debugger;
                  gameSetup.controller.updateWorld();
                  // const shotCmdUser = gameSetup.activePlayerInfo.playerAI.getCallShot();

                  gameSetup.activePlayerInfo.playerWorker.sendMessage({
                    'cmd': CMD_TAKE_CALLED_SHOT,
                    'world': WorldForPlayer
                  });

                  // });
                }, lag);
              } else {
                // should just wait for strike or place action
              }
            }
            break;
          }
          case CUEBALL_IN_HAND: {
            // console.log("enter CUEBALL_IN_HAND STATE");
            // config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to place cue ball`, 0);
            //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = "Place";
            if (gameSetup.activePlayerInfo.isLocal)
              gameSetup.toggleHitButton(false);

            if (!isTesting && !gameSetup.activePlayerInfo.isLocal) {
              // that.clearForecastLines();
              break;
            } else if (!isTesting && gameSetup.activePlayerInfo.playerType !== 'AI') {
              const cb = gameSetup.ballsByID[0];
              gameSetup.controller.replaceCueBallNoCollision(cb);
              cb.body.inPocketID = null;
              cueballInHand = true;
              // that.enablePlaceButton();
              // getPlayerActionMessage(true, 'CueballInHand');
              break;
            }

            // get AI command for place ball:
            //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = "Strike";
            gameSetup.toggleHitButton(true);
            let lag = 600;
            if (isMatch || isPractice) lag = 1200;
            setTimeout(() => {
              gameSetup.controller.updateWorld();
              // const shotCmdUser = gameSetup.activePlayerInfo.playerAI.getCallShot();

              gameSetup.activePlayerInfo.playerWorker.sendMessage({
                'cmd': CMD_PLACE_CUEBALL,
                'world': WorldForPlayer
              });
            }, lag);

            break;
          }
          case GAME_OVER_STATE: {
            // console.log("enter GAME OVER STATE");
            gameSetup.gameOver = true;
            gameSetup.sounds.backgroundmusic.stop();
            //gameSetup.showWinner(gameSetup.activePlayerInfo.ID, gameSetup.activePlayerInfo.username);
            // if (0 && gameSetup.isHost && gameSetup.gameType != GAME_TYPE.TOURNAMENT) {

            //   gameSetup.showModalMessage(`The winner is player ${gameSetup.activePlayerInfo.ID}: ${gameSetup.activePlayerInfo.username} !`, p[5], MODAL_EXITORREPLAY);
            // } else {
            //   gameSetup.showModalMessage(`The winner is player ${gameSetup.activePlayerInfo.ID}: ${gameSetup.activePlayerInfo.username} !`, p[5], MODAL_EXITGAME);
            // }

            if (isMatch || isBattle) { // ignore practice?
              if (gameSetup.isLocal || gameSetup.isHost) {
                PoolActions.reportGameResult(gameSetup.room._id, gameSetup.activePlayerInfo.playerUserId, gameSetup.playerInfo[0].extraCoins, gameSetup.playerInfo[1].extraCoins);
              }
              //gameSetup.showModalMessage(`The winner is player ${gameSetup.activePlayerInfo.username} !`, p[5], MODAL_EXITGAME);

            }
            if (isMatch || isBattle || isPractice) {
              gameSetup.showEndOfGame(gameSetup.activePlayerInfo.ID);
            }

            if (isTournament) {
              gameSetup.showModalMessage(`The winner is player ${gameSetup.activePlayerInfo.username} !`, p[5], MODAL_NOBUTTON);
              PoolActions.reportGameResult(gameSetup.room._id, gameSetup.activePlayerInfo.playerUserId);
              const params = {
                modalIsOpen: true,
                sectionKey: gameSetup.pairData.sectionId,
                tournamentId: gameSetup.pairData.tournamentId
              };
              PoolActions.finishTournamentSectionRound(
                gameSetup.pairData.roundId,
                gameSetup.activePlayerInfo.playerUserId,
                gameSetup.pairData.id,
                PLAYER_TYPE.WINNER
              );
              setTimeout(() => {
                if (gameSetup && gameSetup.reacthistory) {
                  console.log("dddd redirect to tournament/game id in game over state ");
                  // gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
                  gameSetup.reacthistory.push(`/section-info/${gameSetup.room.gameId}/${gameSetup.pairData.sectionId}/`);
                }
              }, 3000);
            } else if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
              PoolActions.reportGameResult(gameSetup.room._id, gameSetup.activePlayerInfo.playerUserId);
              gameSetup.showModalMessage(`Autorun: the winner is player ${gameSetup.activePlayerInfo.username} !`, p[5], MODAL_EXITGAME);

              // PoolActions.finishTournamentSectionRound(
              //   gameSetup.pairData.roundId,
              //   gameSetup.activePlayerInfo.playerUserId,
              //   gameSetup.pairData.id,
              //   PLAYER_TYPE.WINNER
              // );
              setTimeout(() => {
                gameSetup.reacthistory.push('/autorungame');
              }, 3000);
            }


            break;
          }
        }
      };

      this.trySelectPlayer = () => {
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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
        if ((gameSetup.isLocal || gameSetup.peerReady) && gameSetup.activePlayerInfo == null) {
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
        // return; // aaaa
        // if (0) {
        //   for (let k=0; k<1000; k++) {
        //     //console.log(rnd2());
        //     const skew = jstat.normal.inv(1/1000*k, 0, 1);
        //     console.log(skew);
        //   }
        //   debugger;
        // }
        if (gameSetup.activePlayerInfo == null) return;


        this.updateGameWorld();
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
        let info = gameSetup.playerInfo1;
        if (playerID === 2) { info = gameSetup.playerInfo2; }
        for (let colorTypeID = 0; colorTypeID <= 4; colorTypeID++) {
          let m = {
            type: `modal_${playerID}_CallShot${colorTypeID}`,
            content: `${info.playerID} to shoot ${ColorTypeString[colorTypeID]} ball`,
          };
          modalItems.push(m);

          m = {
            type: `modal_${playerID}_NotFirstTouch${colorTypeID}`,
            content: `${ColorTypeString[colorTypeID]} ball was not the first ball touched`,
          };
          modalItems.push(m);


          m = {
            type: `modal_${playerID}_GreatShotChosen${colorTypeID}`,
            content: `Great shot! ${ColorTypeString[colorTypeID]} balls are chosen`,
          };
          modalItems.push(m);
        }

        modalItems.push({
          type: `modal_${playerID}_CueballInHand`,
          content: `${info.playerID} to place cue ball on table`,
        });

        modalItems.push({
          type: `modal_${playerID}_NoBallTouched`,
          content: 'no object ball was touched',
        });

        modalItems.push({
          type: `modal_${playerID}_CueballPocketed`,
          content: 'cue ball was pocketed',
        });

        modalItems.push({
          type: `modal_${playerID}_BlackballPocketedBreak`,
          content: `black ball was pocketed in break shot`
        });

        modalItems.push({
          type: `modal_${playerID}_BlackballPocketedNoTarget`,
          content: 'black ball was pocketed by accident',
        });

        modalItems.push({
          type: `modal_${playerID}_WonGame`,
          content: `Bravo! ${info.playerID} won the game!`,
        });

        modalItems.push({
          type: `modal_${playerID}_BlackBallPocketedWrong`,
          content: 'black ball was pocketed into the wrong pocket!',
        });

        modalItems.push({
          type: `modal_${playerID}_CueballPocketedWithBlack`,
          content: 'cue ball was pocketed along with the black ball!',
        });

        modalItems.push({
          type: `modal_${playerID}_AtLeast4Rail`,
          content: 'less than 4 balls touched cushions',
        });

        modalItems.push({
          type: `modal_${playerID}_NoTargetPocket`,
          content: 'No target ball or pocket indicated',
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
          content: 'No ball hit the cushions after cue ball initial hit',
        });

        modalItems.push({
          type: `modal_${playerID}_NoBallPocketed`,
          content: 'Unfortunately no ball was pocketed.',
        });

        modalItems.push({
          type: `modal_${playerID}_BreakShot`,
          content: `${info.playerID} to take the break shot`,
        });

        modalItems.push({
          type: `modal_${playerID}_CueBallPlaced`,
          content: `Cue ball was successfully placed by ${info.playerID}`,
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

        // decouple state transition from cue ball placement
        // if I'm the active player
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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
        Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.activePlayerInfo.ID, cmdstr);
      };

      this.planToPlaceCueball = function (x, y) {
        // console.log("planToPlaceCueball");
        if (gameSetup.isLocal) {
          this.actuallyDoPlaceCueball(x, y);
          if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
            const cmdstr = `PlaceCueBall;${gameSetup.currentCycleTime};${gameSetup.activePlayerInfo.ID}_${Math.fround(x)}_${Math.fround(y)}`;
            this.saveCommand(cmdstr);
          }
        } else {

          gameSetup.networkHandler.sendCommandToAll({
            c: "PlaceCueBall", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${Math.fround(x)}_${Math.fround(y)}`
          });
        }

        // if (isMatch || isTournament) {
        //   //PoolActions.reportPlaceCueBallMove(gameSetup.roomId, activePlayerInfo.playerUserId, cb.x, cb.y);
        //   // need this so it will stop allowing place the ball??
        //   // this.enterState(GameState.CallShot, activePlayerInfo);
        // } else {
        //   // this.enterState(GameState.CallShot, activePlayerInfo);
        // }
      };


      this.isValidBreakShot = function isValidBreakShot() {
        if (gameSetup.cueball.body.inPocketID !== null) { // cue ball pocketed?
          return getPlayerActionMessage(false, 'CueballPocketed');
          // return false;
        }
        if (gameSetup.blackball.body.inPocketID !== null) { // black ball pocketed?
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
          if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
            const cmdstr = `ShowMessage;${gameSetup.currentCycleTime};${msg}`;
            this.saveCommand(cmdstr);
          }
        } else {
          // console.log("do sendMessage All " + msg);

          gameSetup.networkHandler.sendCommandToAll({
            c: "ShowMessage", t: gameSetup.currentCycleTime, w: msg
          });
        }
      };


      gameSetup.config.sendGoldMessageAll = (msg) => {
        const p = msg.split("_");
        if (gameSetup.isLocal) {
          gameSetup.config.showHeadline(p[0], 1.5, p[1]);
        } else {
          gameSetup.networkHandler.sendCommandToAll({
            c: "GoldMessage", t: gameSetup.currentCycleTime, w: msg
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
          c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${newID}_${newState}_${chosenColor}_${Math.fround(cbx)}_${Math.fround(cby)}_${winReason}_${gameSetup.playerInfo[newID].secondsLeft}`
        });
      };

      this.togglePlayer = (newState) => {
        if (newState == CUEBALL_IN_HAND) {
          // debugger;
        }
        this.setNewPlayerState(1 - gameSetup.activePlayerInfo.ID, newState);
      };

      this.findBallPositionIssue = () => {
        const peerstr = gameSetup.peer.posStr;
        const peertime = gameSetup.peer.stopTime;

        const posStr = gameSetup.getPosStr();

        if (peerstr != posStr) {

          // analyze where is the problem
          const peerparts = peerstr.split("|");
          const myparts = posStr.split("|");

          for (let k=0; k<peerparts.length; k++) {
            // console.log("my k " + myparts[k]);
            // console.log("ta k " + peerparts[k]);
            if (myparts[k] != peerparts[k]) {
              console.log("out of sync!!");
              console.log("peerstr " + peerstr);
              console.log("posStr " + posStr);
              for (let j=0; j<peerparts.length; j++) {
                console.log("my " + j + " " + myparts[j]);
                console.log("ta " + j + " " + peerparts[j]);
              }

              break;
            }
          }

          if (peertime < gameSetup.hostStopTime) {
            // return host's ID
            return 0;
          } else {
            return 1;
          }
        }
        return -1;
      };

      this.handleGoodShotGold = (isGameOver) => {
        const that = this;
        const config = gameSetup.config;

        gameSetup.activePlayerInfo.cumRun ++;
        let goldmsg = "";
        let goldsum = 0;
        if (gameSetup.activePlayerInfo.cumRun >= 2) {
          goldmsg += gameSetup.activePlayerInfo.cumRun + "-Ball Run!";
          goldsum += Math.pow(2, gameSetup.activePlayerInfo.cumRun-2);
          // gameSetup.config.sendGoldMessageAll(gameSetup.activePlayerInfo.cumRun + " Shots In A Run!_" + Math.pow(2, gameSetup.activePlayerInfo.cumRun-1));
        }
        if (gameSetup.isKickShot) {
          goldmsg += " Kick Shot!";
          goldsum += 3;
          // gameSetup.config.sendGoldMessageAll("A Great Kick Shot!_3");
        }

        if (gameSetup.ballsTouchedRails.includes(gameSetup.targetBallID)){
          // console.log("target ball touched " + JSON.stringify(gameSetup.railsTouchedByTargetBall));

          /*
                0          2
              4               5
                1          3

          */
          const allValidRails = [ [1, 3, 5], [1, 3], [1, 3, 4], [0, 2, 4], [0, 2], [0, 2, 5] ];
          const validRails = allValidRails[gameSetup.targetPocketID];
          let validBankShot = false;
          for (let k=0; k<gameSetup.railsTouchedByTargetBall.length; k++) {
            const railNumber = Number(gameSetup.railsTouchedByTargetBall[k].substring(8));
            if (validRails.includes(railNumber)) {
              validBankShot = true; break;
            }
          }
          if (validBankShot) {
            goldmsg += " Bank Shot!";
            goldsum += 3;
          }
          // gameSetup.config.sendGoldMessageAll("A Great Bank Shot!_3");
        }



        if (isGameOver) {
          let timeout = 10;
          if (goldsum > 0 ) { // && gameSetup.gameType == GAME_TYPE.MATCH
            gameSetup.config.sendGoldMessageAll(goldmsg.trim() + "_" + goldsum);
            timeout = 3000;
          } else {

          }

          const username = gameSetup.activePlayerInfo.username;

          setTimeout(() => {
            // failReason = getPlayerActionMessage(false, `GreatShot`);
            config.sendMessageAll(`Bravo! Player ${username} won the game!`);
            this.setNewPlayerState(gameSetup.activePlayerInfo.ID, GAME_OVER_STATE);
          }, timeout);
        } else {
          if (goldsum > 0 ) { // && gameSetup.gameType == GAME_TYPE.MATCH
            gameSetup.config.sendGoldMessageAll(goldmsg.trim() + "_" + goldsum);
          } else {
            gameSetup.config.sendGoldMessageAll("Great Shot!");
          }
        }
      }

      // only run at host or all local!
      this.handleAllStopped = () => {
        // console.log("do handle all stopped " + gameSetup.targetBallID + " " + gameSetup.targetPocketID);

        gameSetup.resetBallStopped();
        gameSetup.tableDirty = true;

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
            debugger;
            gameSetup.networkHandler.sendCommandToAll({ c: "QuitGameRoomWithIssue", t: gameSetup.currentCycleTime, w: `Sorry! Your game state is somehow out of sync with the opponent's.` });
            return;
          }
        }
        this.inStrike = false;
        this.inNewTest = false;
        // const config = gameSetup.config;
        config.playerPanel1.inTimeCountDown = false;
        config.playerPanel2.inTimeCountDown = false;

        if (gameSetup.speedMeterBall) {
          gameSetup.speedMeterBall.value = 50;
          gameSetup.speedMeterBall.setPositionByValue(50);
          gameSetup.spinMeterBar.value = 0;
          gameSetup.spinMeterBar.setPositionByValue(0);
          gameSetup.spinMeterBarH.value = 0;
          gameSetup.spinMeterBarH.setPositionByValue(0);
        }

        const username = gameSetup.activePlayerInfo.username;

        if (isTesting) {
          if (window.waitForAllStopResolveID) {
            gameSetup.controller.updateWorld();
            if (gameSetup.activePlayerInfo.playerWorker) {
              gameSetup.activePlayerInfo.playerWorker.sendMessage({
                'cmd': CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP,
                'world': WorldForPlayer,
                'resolveID': window.waitForAllStopResolveID
              });
            }
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

                config.sendMessageAll(`Player ${gameSetup.playerInfo[newID].username} will make a call shot on any RED or YELLOW ball.`);
                // config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to take a call shot`);
                this.setNewPlayerState(newID, newState);
              } else {

                config.sendGoldMessageAll("Ball Pocketed on Break!_5");


                setTimeout(() => {
                  config.sendMessageAll(`Player ${gameSetup.playerInfo[newID].username} will continue to make a call shot on any RED or YELLOW ball.`);
                  // config.sendMessageAll(`${gameSetup.activePlayerInfo.username} to take a call shot`);
                  this.setNewPlayerState(newID, newState);
                }, 1500);
              }




            } else {
              // invalid break shot: switch to opponent to redo it
              config.sendMessageAll(`Invalid break shot: ${failReason}. Player ${otherUsername} will make a break shot now.`);
              //this.togglePlayer(BREAK_CUEBALL_IN_HAND_STATE);

              if (gameSetup.waitingPlayerInfo.playerType == "AI") {
                this.setNewPlayerState(gameSetup.waitingPlayerInfo.ID, BREAK_SHOT_STATE);
                // gameSetup.networkHandler.sendCommandToAll({
                //   c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${gameSetup.waitingPlayerInfo.ID}_${BREAK_SHOT_STATE}`
                // });
              } else {
                this.setNewPlayerState(gameSetup.waitingPlayerInfo.ID, BREAK_CUEBALL_IN_HAND_STATE);
                // gameSetup.networkHandler.sendCommandToAll({
                //   c: "NewActivePlayerInfo", t: gameSetup.currentCycleTime, w: `${gameSetup.waitingPlayerInfo.ID}_${BREAK_CUEBALL_IN_HAND_STATE}`
                // });
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
                  config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} won the game!`);
                  this.togglePlayer(GAME_OVER_STATE);
                }
              } else if (gameSetup.ballsByID[BLACK_BALL_ID].body.inPocketID !== gameSetup.targetPocketID) {
                failReason = getPlayerActionMessage(false, 'BlackballPocketedWrong');

                if (!isTesting) {
                  config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} won the game!`);
                  this.togglePlayer(GAME_OVER_STATE);
                }
              } else { // correctly pocketed black ball into target pocket
                if (gameSetup.ballsByID[CUE_BALL_ID].body.inPocketID !== null) {
                  failReason = getPlayerActionMessage(false, 'CueballPocketedWithBlack');
                  if (!isTesting) {
                    config.sendMessageAll(`Unfortunately ${failReason}. Player ${otherUsername} won the game!`);
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
                    this.handleGoodShotGold(true);
                    // failReason = getPlayerActionMessage(false, `GreatShot`);
                    // config.sendMessageAll(`Bravo! Player ${username} won the game!`);
                    // this.setNewPlayerState(gameSetup.activePlayerInfo.ID, GAME_OVER_STATE);
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

                this.handleGoodShotGold(false);


                // console.log("handle allstop in call shot state 7");
                if (gameSetup.activePlayerInfo.chosenColor == null) { // still open table so choose color
                  //console.log("chosen color!! " + gameSetup.activePlayerInfo.playerUserId + " " + gameSetup.activePlayerInfo.chosenColor);
                  // gameSetup.activePlayerInfo.chosenColor = gameSetup.ballsByID[gameSetup.targetBallID].colorType;
                                      // Bert.alert("Great Shot! You have chosen " + ColorTypeString[activePlayerInfo.chosenColor] + " balls!", 'success', 'growl-bottom-left');
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

      gameSetup.resetBallStopped = () => {
        // if (gameSetup.isHost)
          gameSetup.hostAllStopped = false;
        // else
          gameSetup.allPeerAllStopped = false;
        gameSetup.allStopHandled = false;
        if (gameSetup.peer)
          gameSetup.peer.allBallStopped = false;
        // if (!gameSetup.allPeers) return; // local game
        // for (let j = 0; j < gameSetup.playerCount; j++) {
        //   const p1 = gameSetup.allPeers[j];
        //   if (p1) {
        //     p1.allBallStopped = false;
        //   }
        // }
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

      // const delayedSimulation = () => {
      //     if (gameSetup.targetBallID != null) {
      //       // run probability estimate
      //       // const b = gameSetup.ballsByID[gameSetup.targetBallID].body2;
      //       let pocketCount = 0;
      //       const totalRunCount = 50;
      //       const saveTargetBallID = gameSetup.targetBallID;
      //       const saveTargetPocketID = gameSetup.targetPocketID;
      //       for (let run=0; run < totalRunCount; run++) {
      //         // console.log("start run " + run);
      //         that.runSimulation(SIM_PROB);
      //         if (saveTargetBallID == gameSetup.targetBallID && saveTargetPocketID == gameSetup.targetPocketID) {
      //           pocketCount ++;
      //         }
      //       }
      //       console.log("set target pocket id to saved " + saveTargetPocketID);
      //       gameSetup.targetBallID = saveTargetBallID;
      //       gameSetup.targetPocketID = saveTargetPocketID;
      //       const probability = pocketCount / totalRunCount * 100;
      //       //gameSetup.strikeButton.text.text = `Strike (${probability.toFixed(1)}%)`;
      //       console.log("set probtext to value " + probability);
      //       gameSetup.probText.text = `[ ${probability.toFixed(1)}% ]`;
      //     } else {
      //       // gameSetup.strikeButton.text.text = `Strike`;
      //       console.log("set probtext to -- 5");
      //       gameSetup.probText.text = `  -  `;
      //     }
      // };

      // old simple one run 50 times
      // const doSimulationOld = () => {
      //   if (gameSetup.runSimHandle) {
      //     // console.log("cancel old simulation----------");
      //     clearTimeout(gameSetup.runSimHandle);
      //     gameSetup.runSimHandle = 0;
      //   }
      //   if (gameSetup.targetBallID != null) {
      //     gameSetup.runSimHandle = setTimeout(() => {
      //       delayedSimulation();
      //     }, 1000);
      //   } else {
      //     gameSetup.strikeButton.text.text = `Strike`;
      //   }
      // };

      const doRefineBounds = () => {
        const PRECISION = gameSetup.refinePrecision;
        const saveTargetBallID = gameSetup.targetBallID;
        const saveTargetPocketID = gameSetup.targetPocketID;

        if (!gameSetup || !gameSetup.simConfig) return;

        let needToRunAgain = false;
        // refine max pocketing
        if (gameSetup.simConfig.maxPocketingProb.UB - gameSetup.simConfig.maxPocketingProb.LB >= PRECISION) {
          const midProb = (gameSetup.simConfig.maxPocketingProb.UB + gameSetup.simConfig.maxPocketingProb.LB)/2;
          const skew = jstat.normal.inv(midProb, 0, 1);
          // console.log("that.runSimulation " + skew + " " + saveTargetBallID + " " + saveTargetPocketID);
          gameSetup.closestPointTarget = null;
          that.runSimulation(SIM_PROB, skew, saveTargetBallID);
          if (saveTargetBallID == gameSetup.targetBallID && gameSetup.pocketIDMap[saveTargetPocketID] == gameSetup.targetPocketID) {
            // const abskew = Math.abs(skew);
            if (Math.abs(skew) < Math.abs(gameSetup.minSkew)) {
              gameSetup.minSkew = skew;
              console.log("saving minskew " + skew);
            }
            gameSetup.simConfig.maxPocketingProb.LB = midProb;
          } else {
            gameSetup.simConfig.maxPocketingProb.UB = midProb;
          }
          if (gameSetup.simConfig.maxPocketingProb.UB - gameSetup.simConfig.maxPocketingProb.LB >= PRECISION) {
            needToRunAgain = true;
          }
        }
        // refine min pocketing
        if (gameSetup.simConfig.minPocketingProb.UB - gameSetup.simConfig.minPocketingProb.LB >= PRECISION) {
          const midProb = (gameSetup.simConfig.minPocketingProb.UB + gameSetup.simConfig.minPocketingProb.LB)/2;
          const skew = jstat.normal.inv(midProb, 0, 1);
          gameSetup.closestPointTarget = null;
          that.runSimulation(SIM_PROB, skew, saveTargetBallID);
          if (saveTargetBallID == gameSetup.targetBallID && gameSetup.pocketIDMap[saveTargetPocketID] == gameSetup.targetPocketID) {
            gameSetup.simConfig.minPocketingProb.UB = midProb;
            if (Math.abs(skew) < Math.abs(gameSetup.minSkew)) {
              gameSetup.minSkew = skew;
              console.log("saving minskew " + skew);
            }
          } else {
            gameSetup.simConfig.minPocketingProb.LB = midProb;
          }
          if (gameSetup.simConfig.minPocketingProb.UB - gameSetup.simConfig.minPocketingProb.LB >= PRECISION) {
            needToRunAgain = true;
          }
        }

        gameSetup.targetBallID = saveTargetBallID;
        gameSetup.targetPocketID = saveTargetPocketID;
        return needToRunAgain;
      };



      let probCache = {};
      // get probability of pocketing while at least itself is pocketing!
      const getPocketProbability = (saveTargetBallID, saveTargetPocketID) => {
        const key = `${gameSetup.cueballDirection.x}_${gameSetup.cueballDirection.y}`;
        if (probCache[key]) {
          return probCache[key];
        } else {
          // make sure itself is pocketing??
          // that.runSimulation(SIM_PROB, 0);
          // if (gameSetup.targetBallID != saveTargetBallID || gameSetup.targetPocketID != saveTargetPocketID) {
          //   probCache[key] = 0;
          //   return 0;
          // }


          // run binary search on probability

          gameSetup.simConfig = {
            maxPocketingProb: {
              UB: 1.0, LB: 0.5 // we know at 0.5, which means no skew in shooting it should pocket
            },
            minPocketingProb: {
              UB: 0.5, LB: 0
            }
          };

          gameSetup.refinePrecision = 0.001;
          while (true) {
            const needToRunAgain = doRefineBounds();
            if (!needToRunAgain) break;
          }
          const minProb = (gameSetup.simConfig.minPocketingProb.UB + gameSetup.simConfig.minPocketingProb.LB)/2;
          const maxProb = (gameSetup.simConfig.maxPocketingProb.UB + gameSetup.simConfig.maxPocketingProb.LB)/2;
          // probCache[key] = (maxProb - minProb) * 100;
          // return probCache[key];
          let p = (maxProb - minProb) * 100;
          if (p <= 0.09765625) p = 0;
          return p;
        }
      };

      this.calcEndStateSync = (shotCmd, WithRandomNess = false) => {
        var cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
        if (window.InitState) {
          cueballPos.x = window.InitState[0].x + gameSetup.config.tableCenterX;
          cueballPos.y = window.InitState[0].y + gameSetup.config.tableCenterY;
        }

        const pocketPos = gameSetup.tablePocket[shotCmd.targetPocketID].clone();
        // console.log("pocketPos " + (pocketPos.x - config.tableCenterX) + " " + (pocketPos.y - config.tableCenterY));
        const targetBall = gameSetup.ballsByID[shotCmd.targetBallID];
        const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);
        // console.log("targetBallPos " + (targetBallPos.x - config.tableCenterX) + " " + (targetBallPos.y - config.tableCenterY));
        const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
        // console.log("dirBallToPocket " + JSON.stringify(dirBallToPocket));
        const dirAimToBall = dirBallToPocket.clone().normalize().scale(config.ballD);
        let aimPos = targetBallPos.clone().subtract(dirAimToBall);
        if (aimPos.distance(cueballPos) <= 0.01) {
          // debugger;
          aimPos = targetBallPos;
          // console.log("setting aimpos to target pos");
        }
        if (typeof(shotCmd.aimx) != "undefined" && typeof(shotCmd.aimy) != "undefined") {
          aimPos.x = shotCmd.aimx; aimPos.y = shotCmd.aimy;
        }

        const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

        // console.log("\n\nangle for pocketID " + shotCmd.targetPocketID + ": ");
        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cueballPos " + JSON.stringify(cueballPos));

        // console.log("aimPos " + aimPos.x + " " + aimPos.y);
        gameSetup.cueballDirection.x = aimPos.x - cueballPos.x;
        gameSetup.cueballDirection.y = aimPos.y - cueballPos.y;
        gameSetup.targetBallID = shotCmd.targetBallID;
        gameSetup.targetPocketID = shotCmd.targetPocketID;

        let strength = Math.min(100, shotCmd.strength);
        if (strength < 2) strength = 2;

        let spin = 0;
        if (typeof(shotCmd.spin) != "undefined") spin = shotCmd.spin;
        spin = Math.max(-1, Math.min(1, spin));
        let hspin = 0;
        if (typeof(shotCmd.hspin) != "undefined") hspin = shotCmd.hspin;
        hspin = Math.max(-30, Math.min(30, hspin));

        const spinMultiplier = 0 - 2.5 * spin;
        gameSetup.AIStrength = strength;
        gameSetup.AISpinMultiplier = spinMultiplier;
        gameSetup.AIHSpin = hspin;

        // do not specify skew, so each run will be different
        gameSetup.closestPointTarget = null;
        that.runSimulation(SIM_ENDSTATE, WithRandomNess);

        const endState = [];
        const allIDs = Object.keys(ballbodies2);
        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          const b2 = ballbodies2[i];
          if (b2.inPocketID != null) {
            endState.push({ballID: j, inPocketID: b2.inPocketID});
          } else {
            endState.push({ballID: j, inPocketID: null, x: b2.position[0] - gameSetup.config.tableCenterX, y: b2.position[1] - gameSetup.config.tableCenterY});
          }
        }
        // console.log("prob for " + shotCmd.targetPocketID + " is " + prob);
        return endState;
        // console.log("prob for " + gameSetup.cueballDirection.x + " " + gameSetup.cueballDirection.y + " is " + prob);
      };


      this.calcClosestPointSync = (shotCmd, ball_id, target_point) => {
        var cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
        if (window.InitState) {
          cueballPos.x = window.InitState[0].x + gameSetup.config.tableCenterX;
          cueballPos.y = window.InitState[0].y + gameSetup.config.tableCenterY;
        }

        const pocketPos = gameSetup.tablePocket[shotCmd.targetPocketID].clone();
        // console.log("pocketPos " + (pocketPos.x - config.tableCenterX) + " " + (pocketPos.y - config.tableCenterY));
        const targetBall = gameSetup.ballsByID[shotCmd.targetBallID];
        const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);
        // console.log("targetBallPos " + (targetBallPos.x - config.tableCenterX) + " " + (targetBallPos.y - config.tableCenterY));
        const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
        // console.log("dirBallToPocket " + JSON.stringify(dirBallToPocket));
        const dirAimToBall = dirBallToPocket.clone().normalize().scale(config.ballD);
        let aimPos = targetBallPos.clone().subtract(dirAimToBall);
        if (aimPos.distance(cueballPos) <= 0.01) {
          // debugger;
          aimPos = targetBallPos;
          // console.log("setting aimpos to target pos");
        }
        if (typeof(shotCmd.aimx) != "undefined" && typeof(shotCmd.aimy) != "undefined") {
          aimPos.x = shotCmd.aimx; aimPos.y = shotCmd.aimy;
        }

        const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

        // console.log("\n\nangle for pocketID " + shotCmd.targetPocketID + ": ");
        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cueballPos " + JSON.stringify(cueballPos));

        // console.log("aimPos " + aimPos.x + " " + aimPos.y);
        gameSetup.cueballDirection.x = aimPos.x - cueballPos.x;
        gameSetup.cueballDirection.y = aimPos.y - cueballPos.y;
        gameSetup.targetBallID = shotCmd.targetBallID;
        gameSetup.targetPocketID = shotCmd.targetPocketID;

        let strength = Math.min(100, shotCmd.strength);
        if (strength < 2) strength = 2;

        let spin = 0;
        if (typeof(shotCmd.spin) != "undefined") spin = shotCmd.spin;
        spin = Math.max(-1, Math.min(1, spin));
        let hspin = 0;
        if (typeof(shotCmd.hspin) != "undefined") hspin = shotCmd.hspin;
        hspin = Math.max(-30, Math.min(30, hspin));

        const spinMultiplier = 0 - 2.5 * spin;
        gameSetup.AIStrength = strength;
        gameSetup.AISpinMultiplier = spinMultiplier;
        gameSetup.AIHSpin = hspin;

        // do not specify skew, so each run will be different
        gameSetup.closestPointTarget = target_point;
        gameSetup.closestPointTarget.x += gameSetup.config.tableCenterX;
        gameSetup.closestPointTarget.y += gameSetup.config.tableCenterY;
        gameSetup.closestPointBallID = ball_id;
        gameSetup.closestPointDistance = 100000;
        gameSetup.closestPoint = {x: 0, y: 0};
        gameSetup.closestTargetBallTouchedRails = [];
        that.runSimulation(SIM_ENDSTATE, false);

        // console.log("prob for " + shotCmd.targetPocketID + " is " + prob);
        gameSetup.closestPoint.x -= gameSetup.config.tableCenterX;
        gameSetup.closestPoint.y -= gameSetup.config.tableCenterY;
        return gameSetup.closestPoint;
        // console.log("prob for " + gameSetup.cueballDirection.x + " " + gameSetup.cueballDirection.y + " is " + prob);
      };



      this.calcProbSync = (shotCmd) => {
        if (shotCmd.targetBallID == 3 && shotCmd.targetPocketID == 5) {
          // debugger;
        }
        var cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
        if (window.InitState) {
          cueballPos.x = window.InitState[0].x + gameSetup.config.tableCenterX;
          cueballPos.y = window.InitState[0].y + gameSetup.config.tableCenterY;
        }
        const pocketPos = gameSetup.tablePocket[shotCmd.targetPocketID].clone();
        // console.log("pocketPos " + (pocketPos.x - config.tableCenterX) + " " + (pocketPos.y - config.tableCenterY));
        const targetBall = gameSetup.ballsByID[shotCmd.targetBallID];
        const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);
        // console.log("targetBallPos " + (targetBallPos.x - config.tableCenterX) + " " + (targetBallPos.y - config.tableCenterY));
        const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
        // console.log("dirBallToPocket " + JSON.stringify(dirBallToPocket));
        const dirAimToBall = dirBallToPocket.clone().normalize().scale(config.ballD);
        let aimPos = targetBallPos.clone().subtract(dirAimToBall);
        if (aimPos.distance(cueballPos) <= 0.01) {
          // debugger;
          aimPos = targetBallPos;
          // console.log("setting aimpos to target pos");
        }
        if (typeof(shotCmd.aimx) != "undefined" && typeof(shotCmd.aimy) != "undefined") {
          aimPos.x = shotCmd.aimx; aimPos.y = shotCmd.aimy;
        }

        const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

        // console.log("\n\nangle for pocketID " + shotCmd.targetPocketID + ": ");
        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cueballPos " + JSON.stringify(cueballPos));

        // console.log("aimPos " + aimPos.x + " " + aimPos.y);
        gameSetup.cueballDirection.x = aimPos.x - cueballPos.x;
        gameSetup.cueballDirection.y = aimPos.y - cueballPos.y;
        gameSetup.targetBallID = shotCmd.targetBallID;
        gameSetup.targetPocketID = shotCmd.targetPocketID;

        let strength = Math.min(100, shotCmd.strength);
        if (strength < 2) strength = 2;

        let spin = 0;
        if (typeof(shotCmd.spin) != "undefined") spin = shotCmd.spin;
        spin = Math.max(-1, Math.min(1, spin));
        let hspin = 0;
        if (typeof(shotCmd.hspin) != "undefined") hspin = shotCmd.hspin;
        hspin = Math.max(-30, Math.min(30, hspin));

        const spinMultiplier = 0 - 2.5 * spin;
        gameSetup.AIStrength = strength;
        gameSetup.AISpinMultiplier = spinMultiplier;
        gameSetup.AIHSpin = hspin;

        // console.log("get prob using " + gameSetup.AIStrength + " " + gameSetup.AISpinMultiplier + " " + gameSetup.AIHSpin);

        const prob = getPocketProbability(shotCmd.targetBallID, shotCmd.targetPocketID);
        // console.log("prob for " + shotCmd.targetPocketID + " is " + prob);
        return prob;
        // console.log("prob for " + gameSetup.cueballDirection.x + " " + gameSetup.cueballDirection.y + " is " + prob);
      };

      this.getFirstBallTouched = (shotCmd) => {
        const cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
        const pocketPos = gameSetup.tablePocket[shotCmd.targetPocketID].clone();
        // console.log("pocketPos " + (pocketPos.x - config.tableCenterX) + " " + (pocketPos.y - config.tableCenterY));
        const targetBall = gameSetup.ballsByID[shotCmd.targetBallID];
        const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);
        // console.log("targetBallPos " + (targetBallPos.x - config.tableCenterX) + " " + (targetBallPos.y - config.tableCenterY));
        const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
        // console.log("dirBallToPocket " + JSON.stringify(dirBallToPocket));
        const dirAimToBall = dirBallToPocket.clone().normalize().scale(config.ballD);
        let aimPos = targetBallPos.clone().subtract(dirAimToBall);
        if (aimPos.distance(cueballPos) <= 0.01) {
          aimPos = targetBallPos;
        }
        if (typeof(shotCmd.aimx) != "undefined" && typeof(shotCmd.aimy) != "undefined") {
          aimPos.x = shotCmd.aimx; aimPos.y = shotCmd.aimy;
        }

        const dirCueBallToAim = aimPos.clone().subtract(cueballPos);

        // console.log("\n\nangle for pocketID " + shotCmd.targetPocketID + ": ");
        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cueballPos " + JSON.stringify(cueballPos));

        // console.log("aimPos " + aimPos.x + " " + aimPos.y);
        gameSetup.cueballDirection.x = aimPos.x - cueballPos.x;
        gameSetup.cueballDirection.y = aimPos.y - cueballPos.y;
        gameSetup.targetBallID = shotCmd.targetBallID;
        gameSetup.targetPocketID = shotCmd.targetPocketID;

        let strength = Math.min(100, shotCmd.strength);
        if (strength < 2) strength = 2;

        let spin = 0;
        if (typeof(shotCmd.spin) != "undefined") spin = shotCmd.spin;
        spin = Math.max(-1, Math.min(1, spin));
        let hspin = 0;
        if (typeof(shotCmd.hspin) != "undefined") hspin = shotCmd.hspin;
        hspin = Math.max(-30, Math.min(30, hspin));

        const spinMultiplier = 0 - 2.5 * spin;
        gameSetup.AIStrength = strength;
        gameSetup.AISpinMultiplier = spinMultiplier;
        gameSetup.AIHSpin = hspin;

        // do not specify skew, so each run will be different
        gameSetup.closestPointTarget = null;
        that.runSimulation(SIM_ENDSTATE, false);

        const firstBallTouched = {
          ballID: gameSetup.firstBallTouchedByCueball == null ? undefined: gameSetup.firstBallTouchedByCueball.ID,
          colorType: gameSetup.firstBallTouchedByCueball == null ? undefined : gameSetup.firstBallTouchedByCueball.colorType,
        };
        return firstBallTouched;
      };

      const refineBounds = () => {
        // try mid for max

        gameSetup.refinePrecision = 0.001;
        const needToRunAgain = doRefineBounds();

        const minProb = (gameSetup.simConfig.minPocketingProb.UB + gameSetup.simConfig.minPocketingProb.LB)/2;
        const maxProb = (gameSetup.simConfig.maxPocketingProb.UB + gameSetup.simConfig.maxPocketingProb.LB)/2;
        const probability = (maxProb - minProb) * 100;
        //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = `Strike (${probability.toFixed(1)}%)`;
        // console.log("updating probtext to " + probability.toFixed(1));
        // console.log("min UB LB " + gameSetup.simConfig.minPocketingProb.UB + " " + gameSetup.simConfig.minPocketingProb.LB);
        // console.log("max UB LB " + gameSetup.simConfig.maxPocketingProb.UB + " " + gameSetup.simConfig.maxPocketingProb.LB);
        gameSetup.probText.text = `  ${probability.toFixed(1)}%  `;

        if (needToRunAgain) {
          gameSetup.runSimHandle = setTimeout(() => {
            refineBounds();
          }, 5);
        }
      };

      // new binary search: each run refines upper and lower bound by 1 step, then setTimeout again if not good enough
      // can cancel setTimeout if new run is starting
      const doSimulation = () => {
        if (gameSetup.runSimHandle) {
          // console.log("cancel old simulation----------");
          clearTimeout(gameSetup.runSimHandle);
          gameSetup.runSimHandle = 0;
        }

        if (gameSetup.targetBallID != null) {
          gameSetup.simConfig = {
            maxPocketingProb: {
              UB: 1.0, LB: 0.5 // we know at 0.5, which means no skew in shooting it should pocket
            },
            minPocketingProb: {
              UB: 0.5, LB: 0
            }
          };
          // console.log("do simulation using " + gameSetup.AIStrength + " " + gameSetup.AISpinMultiplier + " " + gameSetup.AIHSpin);
          gameSetup.runSimHandle = setTimeout(() => {
            refineBounds();
          }, 150);
        } else {
          // console.log("set probtext to -- 1");
          gameSetup.probText.text = `  -  `;
        }
      };


      const v = new Victor(0, 0);
      this.applyBallAnimationAndAngle = () => {
        const ids = Object.keys(gameSetup.ballsByID);
        for (let k=0; k<ids.length; k++) {
          const b = gameSetup.ballsByID[ids[k]];
          if (b.body.inPocketID == null) {
            const bv = new Victor(b.body.velocity[0], b.body.velocity[1]);
            const ang = Math.atan2(bv.y, bv.x);
            const speed = bv.length();
            if (speed > 0.001) {
              b.rotation = (ang / Math.PI * 180 + 90) * (Math.PI / 180);

              // // estimate ball facing dir change
              // const dx = b.position.x - b.oldp.x;
              // const dy = b.position.y - b.oldp.y;
              // const dist = Math.sqrt(dx*dx + dy*dy);
              // const frameChg = (dist / (config.ballD * Math.PI)) * 72;
              // b.frame += frameChg;


              // add effect of spin!
              const bb = b.body;
              v.x = bb.velocity[0]; v.y = bb.velocity[1];
              const spinV = bb.av.clone().add(v);
              // if (spinV.length() > 0) { // that is: v != av

              //   const distav = spinV.length() / 60;
              //   const frameChg2 = (distav / (config.ballD * Math.PI)) * 72;
              //   b.frame += frameChg2;
              // }

              /*
                v = 10

                1. av = 15 -> add to speed
                2. av = -5 -> STILL add speed
                3. av = -10 -> match speed
                4. av = -15 -> remove speed
              */
              const distav = bb.av.length() / (60);
              const frameChg2 = (distav / (config.ballD * Math.PI)) * 72;
              // console.log("avx " + bb.av.x + " vx " + v.x);
              if (spinV.length() >= v.length() && spinV.length() >= bb.av.length() ) { // same dir
                // console.log("reduce frame by " + frameChg2);
                b.frame -= frameChg2;
              } else if (spinV.length() > 0) {
                // console.log("add frame by " + frameChg2);
                b.frame += frameChg2;
              } else {
                const dx = b.position.x - b.oldp.x;
                const dy = b.position.y - b.oldp.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const frameChg = (dist / (config.ballD * Math.PI)) * 72;
                // console.log("add frame by " + frameChg);
                b.frame += frameChg;
              }


              // if (Math.round(b.frame) >= 36) b.frame -= 36;
              b.gotoAndStop(Math.round(b.frame));
              // // console.log("speed " + speed + " so fr " + framerate);
              // if (b.framerate != framerate) {
              //   const curf = b.animations.currentAnim.frame;
              //   b.animations.stop();
              //   // b.animations.currentAnim.setFrame(curf, false);
              //   // var curf2 = b.animations.currentAnim.frame;
              //   // console.log("curf vs curf2 " + curf + " " + curf2);
              //   b.animations.play('roll', framerate, true);
              //   b.animations.currentAnim.setFrame(curf + 1, false);
              //   b.framerate = framerate;
              // }
            } else {
              // if (b.frame != 10) {
              //   b.frame = 10;
              //   b.gotoAndStop(Math.round(b.frame));
              // }
            }
          }
        }
      };

      /*
        1. find all balls with speed > 100
        2. for each of them, find if it will be colliding with another static ball
        3. for each colliding pair, calculate time it takes for ball to collide exactly at ball diameter distance
        4. return min of all such times as next time step
      */
      this.calculateStepSize = (bodylist) => {
        let minTimeStep = 1.5 / 60;
        const allIDs = Object.keys(bodylist);
        let hasContact = false;



        // new: if a fast ball is 3 diameters away from any cushion, then use slower speed

        if ( gameSetup.controller.gameState == BREAK_SHOT_STATE ) {
          for (let j=0; j<allIDs.length; j++) {
            const i = allIDs[j];
            const b = bodylist[i];
            if (j == 2 || j == 0) {
              // console.log("ball " + j + " v " + b.velocity[0] + " " + b.velocity[1] + " pos " + b.position[0] + " " + b.position[1]);
            }
            if (b.inPocketID == null && !b.isStopped) {
              if (Math.abs(b.velocity[0]) < 3500 && Math.abs(b.velocity[1]) < 3500) continue;
              // if (!gameSetup.innerRectangle2.contains(b.position[0], b.position[1])) {
                // if (gameSetup.innerRectangle.contains(b.position[0], b.position[1])) {
                  minTimeStep = 1 / 1200; hasContact = true;
                  break;
                // }
              // }
            }
          }
        }

        if ( gameSetup.controller.gameState !== BREAK_SHOT_STATE ) {
          for (let j=0; j<allIDs.length; j++) {
            const i = allIDs[j];
            const b = bodylist[i];
            if (b.inPocketID == null && !b.isStopped) {
              if (Math.abs(b.velocity[0]) < 3500 && Math.abs(b.velocity[1]) < 3500) continue;
              if (!gameSetup.innerRectangle2.contains(b.position[0], b.position[1])) {
                // if (gameSetup.innerRectangle.contains(b.position[0], b.position[1])) {
                  minTimeStep = 1 / 1200; hasContact = true;
                  break;
                // }
              }
            }
          }
        }



        const movingBodies = [];

        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          const b = bodylist[i];
          if (j == 2 || j == 0) {
            // console.log("ball " + j + " v " + b.velocity[0] + " " + b.velocity[1] + " pos " + b.position[0] + " " + b.position[1]);
          }
          if (b.inPocketID == null && !b.isStopped) {
            if (Math.abs(b.velocity[0]) < 100 && Math.abs(b.velocity[1]) < 100) continue;
            movingBodies.push(b);
            if (b.ID == 2) {
              // console.log("recording ball 2 pos " + b.position[0] + " " + b.position[1]);
            }
          }
        }

        if (movingBodies.length == 0) return 1/60;
        let ms = "";
        for (let x=0; x<movingBodies.length; x++) {
          ms += " " + movingBodies[x].ID;
        }
        // console.log("moving Bodies: " + ms);

        const pos = new Victor(0, 0);
        const bpos = new Victor(0, 0);
        const mv = new Victor(0, 0);
        for (let k=0; k<movingBodies.length; k++) {
          const mb = movingBodies[k];
          mv.x = mb.velocity[0]; mv.y = mb.velocity[1];
          const mspeed = len(mv);
          pos.x = mb.position[0]; pos.y = mb.position[1];
          const npos = pos.clone().add(mv.scale(1.5/60));

          if (mb.ID == 2) {
            let ss = 1;
          }
          if (mb.ID == 2 && mv.length() > 50) {
            let ss = 2;
          }

          // check all other balls
          for (let j=0; j<allIDs.length; j++) {
            const i = allIDs[j];
            const b = bodylist[i];
            if (b.inPocketID == null && b != mb) {
              bpos.x = b.position[0]; bpos.y = b.position[1];
              const d = dist2(bpos, pos);
              if (d <= config.ballD) continue;

              const cp = getContactPosition(pos, npos, bpos, config.ballD * 0.9999);
              if (cp === null) continue;

              // go overlap a little bit
              hasContact = true;
              const timeToCP = 1.0001 * dist2(cp, pos) / mspeed;
              if (timeToCP < minTimeStep) {
                // console.log("change minTimeStep to " + timeToCP + " for ball  k " + k + " j " + j + " " + i + " " + bpos.x + " " + bpos.y );
                // console.log("cp " + JSON.stringify(cp) + " pos " + JSON.stringify(pos) + " npos " + JSON.stringify(npos) + " mspeed " + mspeed);
                minTimeStep = timeToCP;
              }
            }
          }

          // check all cushions
          if (!gameSetup.innerRectangle.contains(npos.x, npos.y)) {
            // hack! when a ball is pocketing, simply
            if (pos.y >= 61.044444 && npos.y <= 61.04444 && mb.ID == 2) {
              // debugger;
              const ss = 1;
            }
            if (mb.ID == 2) {
              let dd = 3;
            }
            // minTimeStep = 1/60 * 0.2;
            for (let i=0; i<gameSetup.cushionLines.length; i++) {
              if (i == 15) {
                const sss = 1;
              }
              const cline = gameSetup.cushionLines[i];
              const cp = checkLineIntersection(pos.x, pos.y, npos.x, npos.y, cline.p1.x, cline.p1.y, cline.p2.x, cline.p2.y);
              if (cp != null && cp.onLine1 && cp.onLine2) {
                if (mb.ID == 2 && i == 15) {
                  const ss = 1;
                }
                // console.log("find hitting cushion at cp " + cp.x + " " + cp.y + " pos " + pos.x + " " + pos.y + " npos " + npos.x + " " + npos.y);
                const timeToCP = 1.00001 * dist2(cp, pos) / mspeed;
                hasContact = true;
                // console.log("dist2(cp, pos) " + dist2(cp, pos) + " " + timeToCP);
                if (timeToCP < minTimeStep) {
                  // if (mb.ID == 2)
                    // console.log("change minTimeStep to " + timeToCP + " for cushion  " + i);

                  minTimeStep = timeToCP;
                }
                break; // won't overlap 2 cushion lines!
              }
            }

            // check all cushion corners

            for (let i=0; i<gameSetup.cushionCorners.length; i++) {
              const corner = gameSetup.cushionCorners[i];
              bpos.x = corner.x; bpos.y = corner.y;
              const d = dist2(bpos, pos);
              if (d < config.ballD / 2) continue;

              const cp = getContactPosition(pos, npos, bpos, config.ballD * 0.49999);
              if (cp === null) continue;

              // go overlap a little bit
              hasContact = true;
              const timeToCP = 1.001 * dist2(cp, pos) / mspeed;
              if (timeToCP < minTimeStep) {
                // console.log("\n\nchange minTimeStep to " + timeToCP + " for ball  " + i + " " + pos.x + " " + pos.y + " npos " + npos.x + " " + npos.y);
                // console.log(`corner is ${bpos.x} ${bpos.y} cp is ${cp.x} ${cp.y}`);
                minTimeStep = timeToCP;
              }
              break; // won't overlap 2 cushion corners
            }

          }
        }
        // no need to change speed if no contact
        if (!hasContact) return 1/60;

        // console.log("minTimeStep " + minTimeStep);
        if (minTimeStep <  1 / 600) {
          minTimeStep = 1 / 600;
        }
        return minTimeStep;
      };

      this.saveAllBallStoppedCommand = () => {
        let posStr = "";
        for (let k=0; k<gameSetup.balls.length; k++) {
          const b = gameSetup.balls[k];
          if (!b.inPocketID || b.inPocketID == null)
            posStr += `${b.ID}_${b.x}_${b.y}|`;
        }

        const cmdstr = `ALLBALLSTOPPED;${Date.now()};${gameSetup.playerID};${posStr}`;
        Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.activePlayerInfo.ID, cmdstr);
      };

      let elapsed = Date.now();
      const testtarget = new Victor(0, 0);

      gameSetup.runForecast = (strength, dir, spinMultiplier, hspin, ballID, pocketID) => {
        if (gameSetup.forecastHandle) {
          // console.log("cancel old forecast----------");
          clearTimeout(gameSetup.forecastHandle);
          gameSetup.forecastHandle = 0;
          // might as well cancel sim runs!
          if (gameSetup.runSimHandle) {
            // console.log("cancel old simulation----------");
            clearTimeout(gameSetup.runSimHandle);
            gameSetup.runSimHandle = 0;
          }
          //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = `Strike`;
          if (gameSetup.probText) {
            // console.log("set probtext to -- 3");
            gameSetup.probText.text = `  -  `;
          }
        }

        gameSetup.prevDirX = dir.x;
        gameSetup.prevDirY = dir.y;
        gameSetup.prevStrength = strength;
        gameSetup.prevhspin = hspin;
        gameSetup.prevspinMultiplier = spinMultiplier;

        gameSetup.targetBallID = ballID;
        gameSetup.targetPocketID = pocketID;

        gameSetup.forecastHandle = setTimeout(() => {
          // console.log("do forecast in gameSetup.forecastHandle");
          // console.log("cue ball dir " + gameSetup.cueballDirection.x + " " + gameSetup.cueballDirection.y);
          // testing
          // gameSetup.AIStrength = 100;
          gameSetup.closestPointTarget = null;
          // ccccc draw closest point
          if (0) {
            //gameSetup.closestPointTarget = {x: gameSetup.ballsByID[4].position.x, y: gameSetup.ballsByID[4].position.y};
            // gameSetup.closestPointTarget = {x: 530.4023 + gameSetup.config.tableCenterX, y: -158.34 + gameSetup.config.tableCenterY};
            // gameSetup.closestPointTarget = {x: 758.079 + gameSetup.config.tableCenterX, y: -156.029 + gameSetup.config.tableCenterY};
            //gameSetup.closestPointTarget = {x: -683.474 + gameSetup.config.tableCenterX, y: 220.4515 + gameSetup.config.tableCenterY};
            // gameSetup.closestPointTarget = {x: 329 + gameSetup.config.tableCenterX, y: -158.34 + gameSetup.config.tableCenterY};
            gameSetup.closestPointTarget = {x: gameSetup.tablePocket[0].x, y: gameSetup.tablePocket[0].y};
            gameSetup.closestPointBallID = 5;
            gameSetup.closestPointDistance = 100000;
            gameSetup.closestPoint = {x: 0, y: 0};
            gameSetup.closestTargetBallTouchedRails = [];
          }
          that.runSimulation(SIM_DRAW);
          // ccccc draw that point
          if (0) {
            const g = gameSetup.forecastG;
            g.lineStyle(config.forecastGWidth*6, 0x00ff00, 1);
            g.drawCircle(gameSetup.closestPoint.x, gameSetup.closestPoint.y, gameSetup.config.ballD/3);
          }

          // clear forecast lines if first touch is wrong color
          if (!gameSetup.controller) return;

          if (gameSetup.controller.gameState >= CALL_SHOT_STATE && gameSetup.firstBallTouchedByCueball != null) {
            if (gameSetup.activePlayerInfo.chosenColor != null) {
              if (gameSetup.firstBallTouchedByCueball.colorType !== gameSetup.activePlayerInfo.legalColor) {
                // that.clearForecastLines();
                return;
              }
            }
          }

          if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

          if (gameSetup.targetBallID != null && gameSetup.targetPocketID != null) {
            doSimulation();
          }
          // console.log("reset strike button final");
          // if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = `Strike`;
          // gameSetup.probText.text = `  -  `;
        }, 10);
      };

      this.updateGameWorld = () => {

        if (gameSetup.activePlayerInfo == null) return;

        if (gameSetup.emitter) {
          const now = Date.now();
          // gameSetup.speedMeterBall.emitter.emit = true;
          gameSetup.emitter.update((now - elapsed) * 0.001);
          elapsed = now;
        }


        if (this.allowInput()) {
          if (cueballInHand || (gameSetup.gameType != GAME_TYPE.TESTING && gameSetup.controller.gameState < 0)) {
            // do nothing while trying to place cue ball

            if (gameSetup.isCueballInHand() && gameSetup.placeBallSpeedX != 0 || gameSetup.placeBallSpeedY != 0 ) {
              const cb = gameSetup.ballsByID[0];
              testtarget.x = Math.fround(cb.position.x + gameSetup.placeBallSpeedX * gameSetup.config.ballD / 10);
              testtarget.y = Math.fround(cb.position.y + gameSetup.placeBallSpeedY * gameSetup.config.ballD / 10);
              gameSetup.controller.tryPlaceCueBall(testtarget);
            }

          } else {
            // if there is any change in strength, dir or spin, run simulation here, and show target ball/pocket/prob if any

            // console.log("\n\n------- update game world ");


            if (gameSetup.gameType != GAME_TYPE.TESTING) {
              PIXI.keyboardManager.update();
            }



            let strength;
            let spinMultiplier, hspin;
            let dir;
            if (gameSetup.activePlayerInfo.playerType == "AI") {
              if (!gameSetup.AIStrength) { gameSetup.AIStrength = 40; }
              if (!gameSetup.AISpinMultiplier) { gameSetup.AISpinMultiplier = 0; }
              if (!gameSetup.AIHSpin) { gameSetup.AIHSpin = 0; }
              strength = gameSetup.AIStrength / 100 * MAX_SPEED / unitScale; // unit difference?
              spinMultiplier = gameSetup.AISpinMultiplier;
              hspin = gameSetup.AIHSpin;
              dir = gameSetup.cueballDirection.clone();
            } else {
              // if (gameSetup.targetBallID == null && gameSetup.strikeButton.text.text != `Strike`) {
              //   gameSetup.strikeButton.text.text = `Strike`;
              // }
              // console.log("set probtext to -- 2");
              // gameSetup.probText.text = `  -  `;


              if (gameSetup.strengthChangeSpeed != 0) {

                gameSetup.emitter.updateOwnerPos(gameSetup.speedMeterBall.position.x, gameSetup.speedMeterBall.position.y);
                gameSetup.emitter.emit = true;

                let acc = 1;
                if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
                  acc = 10;
                }

                gameSetup.speedMeterBall.value += gameSetup.strengthChangeSpeed * 0.25 * acc;
                if (gameSetup.speedMeterBall.value >= 100) gameSetup.speedMeterBall.value = 100;
                if (gameSetup.speedMeterBall.value <= 2) gameSetup.speedMeterBall.value = 2;
                gameSetup.speedMeterBall.setPositionByValue(gameSetup.speedMeterBall.value);
              }

              if (gameSetup.turnChangeSpeed == 1) {
                gameSetup.emitter.updateOwnerPos(gameSetup.ccwControl.position.x, gameSetup.ccwControl.position.y);
                gameSetup.emitter.emit = true;
              }

              if (gameSetup.turnChangeSpeed == -1) {
                gameSetup.emitter.updateOwnerPos(gameSetup.cwControl.position.x, gameSetup.cwControl.position.y);
                gameSetup.emitter.emit = true;
              }

              if (gameSetup.spinChangeSpeed != 0) {

                // const now = Date.now();
                // // gameSetup.speedMeterBall.emitter.emit = true;
                // gameSetup.spinMeterBar.emitter.update((now - elapsed) * 0.001);
                // elapsed = now;

                gameSetup.emitter.updateOwnerPos(gameSetup.spinMeterBar.position.x, gameSetup.spinMeterBar.position.y);
                gameSetup.emitter.emit = true;
                let acc = 1;
                if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
                  acc = 10;
                }

                gameSetup.spinMeterBar.value += gameSetup.spinChangeSpeed * 0.002 * acc;
                if (gameSetup.spinMeterBar.value >= 1) gameSetup.spinMeterBar.value = 1;
                if (gameSetup.spinMeterBar.value <= -1) gameSetup.spinMeterBar.value = -1;
                gameSetup.spinMeterBar.setPositionByValue(gameSetup.spinMeterBar.value);
              }

              if (gameSetup.hspinChangeSpeed != 0) {

                // const now = Date.now();
                // // gameSetup.speedMeterBall.emitter.emit = true;
                // gameSetup.spinMeterBarH.emitter.update((now - elapsed) * 0.001);
                // elapsed = now;

                gameSetup.emitter.updateOwnerPos(gameSetup.spinMeterBarH.position.x, gameSetup.spinMeterBarH.position.y);
                gameSetup.emitter.emit = true;

                let acc = 1;
                if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
                  acc = 10;
                }

                gameSetup.spinMeterBarH.value += gameSetup.hspinChangeSpeed * 0.05 * acc;
                if (gameSetup.spinMeterBarH.value >= 30) gameSetup.spinMeterBarH.value = 30;
                if (gameSetup.spinMeterBarH.value <= -30) gameSetup.spinMeterBarH.value = -30;
                gameSetup.spinMeterBarH.setPositionByValue(gameSetup.spinMeterBarH.value);
              }

              // if (gameSetup.turnChangeSpeed != 0) {
                gameSetup.turnCCW(gameSetup.turnChangeSpeed);
              // }

              if (gameSetup.emitter.emit) {
                // if (!gameSetup.sounds.magicwand.playing()) {
                //   gameSetup.sounds.magicwand.play();
                // } else {
                //   const pos = gameSetup.sounds.magicwand.seek() || 0;
                //   if (pos > 2) {
                //     gameSetup.sounds.magicwand.stop();
                //     gameSetup.sounds.magicwand.play();
                //   }
                // }
              }

              const PlacingStates = [BREAK_CUEBALL_IN_HAND_STATE, CUEBALL_IN_HAND];
              if (PlacingStates.includes(gameSetup.controller.gameState)) {
                gameSetup.toggleHitButton(false);
              } else {
                gameSetup.toggleHitButton(true);
              }

              // if changed do new run:
              strength = gameSetup.speedMeterBall.value / 100 * MAX_SPEED / unitScale; // unit difference?
              spinMultiplier = 0 - SPIN_M * gameSetup.spinMeterBar.value;
              hspin = gameSetup.spinMeterBarH.value;
              dir = gameSetup.cueballDirection.clone();
            }



            let changed = false;
            if (gameSetup.prevStrength != strength)
              changed = true;
            else if (gameSetup.prevspinMultiplier != spinMultiplier)
              changed = true;
            else if (gameSetup.prevhspin != hspin)
              changed = true;
            else if (gameSetup.prevDirX != dir.x)
              changed = true;
            else if (gameSetup.prevDirY != dir.y)
              changed = true;

            if (gameSetup.enteringSimulation) {
              // debugger;
              gameSetup.enteringSimulation = false;
              changed = true;
            }

            if (changed) {


              if (gameSetup.gameType == GAME_TYPE.MATCH && gameSetup.activePlayerInfo.isLocal) {
                gameSetup.savedStrength = strength;
                gameSetup.savedDirX = dir.x;
                gameSetup.savedDirY = dir.y;
                gameSetup.savedhspin = hspin;
                gameSetup.savedspinMultiplier = spinMultiplier;
                gameSetup.savedBallID = gameSetup.targetBallID;
                gameSetup.savedPocketID = gameSetup.targetPocketID;
              }

              gameSetup.runForecast(strength, dir, spinMultiplier, hspin, gameSetup.targetBallID, gameSetup.targetPocketID);
            }
          }
        } else if (this.inStrike) {
          const strength = gameSetup.currentShotStrength;
          // let ROUNDS = Math.round(strength/500);
          // if (ROUNDS < 2) ROUNDS = 2;
          // const stepsizePerRound = stepsize / ROUNDS;
          let allStopped = false;
          // for (let k=0; k<ROUNDS; k++) {
          let totalStepSize = 0;
          const ballSpeedOld = {};
          const ballSpeedNew = {};
          let totalenergy = 0;
          let totalenergynew = 0;
          // console.log("\n\n\n\n\n\n real trail");
          while (totalStepSize <= 1/60.001) {

            const b = ballbodies[0];
            // if (b.position[0] - gameSetup.config.tableCenterX <= -660)
            //   console.log("cue ball before step " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1] + " " + b.av.x + " " + b.av.y);
            const b2 = ballbodies[1];
            // console.log("ball 1 before step " + b2.position[0] + " " + b2.position[1] + " " + b2.velocity[0] + " " + b2.velocity[1] + " " + b2.av.x + " " + b2.av.y);

            for (let x=0; x < 22; x ++) {
              const bb = ballbodies[x];
              // console.log("details " + bb.ID + " " + bb.position[0] + " " + bb.position[1] + " " + bb.velocity[0] + " " + bb.velocity[1] + " " + bb.av.x + " " + bb.av.y + " " + bb.inertia + " " + bb.ccdIterations + " " + JSON.stringify(bb.vlambda));
            }

            if ( b.position[0] == 1540.810546875 && b.position[1] == 705.5906982421875) {
            // if ( b.position[0] == 1539.0308837890625 && b.position[1] == 705.6083984375) {

            // if (b2.position[0] == 1672.1751708984375 && b2.position[1] == 705.3029174804688) {

              // debugger;

            // }
          }
            let step = this.calculateStepSize(ballbodies);

            // console.log("new step is " + step);

            if (1) {

              // console.log("before world step " + step);
              if (gameSetup.controller.gameState == CALL_SHOT_STATE) {
                const allIDs = Object.keys(ballbodies);
                const g = gameSetup.forecastG;
                for (let j=0; j<allIDs.length; j++) {
                  const i = allIDs[j];
                  const b = ballbodies[i];
                  if (b.inPocketID != null) continue;
                  ballSpeedOld[i] = len2(b.velocity);
                  totalenergy += ballSpeedOld[i] * ballSpeedOld[i];
                  // console.log("before ball " + j + " " + i + " " + b.inPocketID + " " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1]);
                }
              }
            }


            if (step < 0.1 / 61) {
              // step = 0.1 / 60;
            }

            if (step < 0.1 / 120) {
              // step = 0.1 / 120;
            }

            // console.log("step is " + step);

            that.prepareForHSpin(gameSetup.cueball.body);

            // if (step == 0.015843064564962317) {
            //   // becomes different!
            //   //maybe print out world??

            //   printed = {world: true};
            //   console.log("\n\n\nworld is ");
            //   // deepPrint(world, 0);

            //   // debugger;
            // }

            world.step(step);

            // if (gameSetup.blackball.body.position[1] >= 1000 && gameSetup.blackball.body.position[1] <= 3000)
            //   console.log(" black body " + gameSetup.blackball.body.velocity[0] + " " + gameSetup.blackball.body.velocity[1] + " " + gameSetup.blackball.body.position[0] + " " + gameSetup.blackball.body.position[1]);

            that.adjustForHSpin(gameSetup.cueball.body);

            if (1) {
              if (gameSetup.controller.gameState == CALL_SHOT_STATE) {
                const allIDs = Object.keys(ballbodies);
                const g = gameSetup.forecastG;
                for (let j=0; j<allIDs.length; j++) {
                  const i = allIDs[j];
                  const b = ballbodies[i];
                  if (b.inPocketID != null) continue;
                  ballSpeedNew[i] = len2(b.velocity);
                  totalenergynew += ballSpeedNew[i] * ballSpeedNew[i];
                  // console.log("after ball " + j + " " + i + " " + b.inPocketID + " " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1]);
                }

                if (totalenergynew > totalenergy) {
                  // debugger;
                }
              }
            }

            for (let x=0; x < 22; x ++) {
              const bb = ballbodies[x];
              // console.log("after step details " + bb.ID + " " + bb.position[0] + " " + bb.position[1] + " " + bb.velocity[0] + " " + bb.velocity[1] + " " + bb.av.x + " " + bb.av.y + " " + bb.inertia + " " + bb.ccdIterations + " " + JSON.stringify(bb.vlambda));
            }



            // if (1) {
            //   const allIDs = Object.keys(ballbodies);
            //   const g = gameSetup.forecastG;
            //   for (let j=0; j<allIDs.length; j++) {
            //     const i = allIDs[j];
            //     const b = ballbodies[i];
            //     if (i == 0 || i == 1) {
            //       // console.log("ball " + i + " " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1]  + " " + b.av.x + " " + b.av.y);
            //     }
            //     if (b.inPocketID != null) continue;
            //     if (isNaN(b.position[0]) || isNaN(b.velocity[0])) {
            //       // console.log("nan issue! step " + step + " ball id " + i);
            //       // debugger;
            //       // debugger;
            //     }
            //   }
            // }
            totalStepSize += step;
          }

          gameSetup.counter ++;

          that.applyRollingFriction(ballbodies, true);
          allStopped = that.markPocketedOrStopped(ballbodies, false);
          // if (allStopped) break;
          for (let x=0; x < 22; x ++) {
            const bb = ballbodies[x];
            // console.log("after friction details " + bb.ID + " " + bb.position[0] + " " + bb.position[1] + " " + bb.velocity[0] + " " + bb.velocity[1] + " " + bb.av.x + " " + bb.av.y + " " + bb.inertia + " " + bb.ccdIterations + " " + JSON.stringify(bb.vlambda));
          }


          // const b = ballbodies[0];
          // console.log("after frict cue ball  " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1] + " " + b.av.x + " " + b.av.y);
          // const b2 = ballbodies[1];
          // console.log("after frict ball 1  " + b2.position[0] + " " + b2.position[1] + " " + b2.velocity[0] + " " + b2.velocity[1] + " " + b2.av.x + " " + b2.av.y);

          // sync ball image to body
          for (let k=0; k<that.balls.length; k++) {
            const ball = that.balls[k];
            ball.oldp.x = ball.position.x;
            ball.oldp.y = ball.position.y;
            ball.position.x = ball.body.position[0];
            ball.position.y = ball.body.position[1];

            if (gameSetup.gameType == GAME_TYPE.TESTING) {
              // ball.body.ballIDLabel.visible = true; // ccc? always keep commented!
              // ball.body.ballIDLabel.position.x = ball.body.position[0];
              // ball.body.ballIDLabel.position.y = ball.body.position[1] + gameSetup.config.ballD * 1;


              // ccccc draw this ball's trail
              if (0) {
                if (ball.ID == 4) {
                  const g = gameSetup.forecastG;
                  // g.lineStyle(config.forecastGWidth, ball.color, 1);
                  g.lineStyle(config.forecastGWidth*2, 0x00ff00, 1);
                  g.moveTo(ball.oldp.x, ball.oldp.y);
                  g.lineTo(ball.position.x, ball.position.y);
                }
              }

            }

          }
          if (gameSetup.targetBallID != null && gameSetup.targetBallID > 0 ) {
            gameSetup.targetBallMark.position.x = gameSetup.ballsByID[gameSetup.targetBallID].position.x;
            gameSetup.targetBallMark.position.y = gameSetup.ballsByID[gameSetup.targetBallID].position.y;
          }

          this.applyBallAnimationAndAngle();


          // console.log("checking gameSetup.controller.inStrike " + gameSetup.controller.inStrike + " allStopped " + allStopped);
          if (gameSetup.controller.inStrike && allStopped) {
            // gameSetup.allStopped = true;
            // console.log("all ball stopped for me!!");
            gameSetup.controller.inStrike = false;
            gameSetup.targetBallMark.visible = false;
            gameSetup.targetPocketMark.visible = false;

            gameSetup.showAllBallPosition();

            if (gameSetup.isLocal) {
              if (gameSetup.gameType == GAME_TYPE.AUTORUN)
                this.saveAllBallStoppedCommand();

              this.handleAllStopped();


              // don't save for local!
              // const posStr = gameSetup.getPosStr();

              // if (gameSetup.gameType != GAME_TYPE.TESTING) {
              //   const cmdstr = `ALLBALLSTOPPED;${Date.now()};${gameSetup.activePlayerInfo.ID};${posStr}`;
              //   Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
              // }
            } else {
              if (!gameSetup.isHost) {
                console.log("non host sendAllBallStopped");
                gameSetup.networkHandler.sendAllBallStopped();
              } else {
                gameSetup.hostAllStopped = true;
                gameSetup.hostStopTime = new Date();
                this.checkIfAllPeerAllStopped();
              }
            }
            // that.allStoppedCallback();
            // midms1 = getMS();
          }
        } else {
          // what to do here?
          // debugger;
        }
      };

      gameSetup.isCueballInHand = function () {
        return cueballInHand;
      };

      gameSetup.strikeCallback = function strikeCallback(force, av, hspin) {
        // if (!isMatch && !isTournament) {
          const newMove = { Type: 'STRIKE', playerUserId: gameSetup.activePlayerInfo.playerUserId, forcex: force.x, forcey: force.y, avx: av.x, avy: av.y, hspin: hspin, targetPocketID: gameSetup.targetPocketID, targetBallID: gameSetup.targetBallID };
          // console.log("dddd in strikeCallback to executeStrikeMove " + Date.now());
          gameSetup.executeStrikeMove(newMove);
        // } else {
            // instead of actually striking here, we just update the data channel, and in data channel handler do the actual striking
            // Meteor.call('reportNewGameMove', gameSetup.roomId, activePlayerInfo.playerUserId, force.x, force.y, av.x, av.y, gameSetup.targetPocketID, gameSetup.targetBallID, (err) => {
            //     if (err) {
            //         console.log('error in reportNewGameMove ');
            //       }
            //   });

          // PoolActions.reportNewGameMove(gameSetup.roomId, activePlayerInfo.playerUserId, force.x, force.y, av.x, av.y, gameSetup.targetPocketID, gameSetup.targetBallID);
        // }
      };



      this.allowInput = function () {
        if (gameSetup.activePlayerInfo == null) return false;
        if (gameSetup.gameType == GAME_TYPE.TESTING && !this.inStrike) return true;
        if (gameSetup.gameType == GAME_TYPE.REPLAY) return false;

        // if (gameSetup.gameType == GAME_TYPE.AUTORUN) return false;
        if (gameSetup.gameOver) return false;
        // if (gameSetup.gameType == GAME_TYPE.TESTING) return false;
        // if (isTesting) { return false; } // in testing mode no manual input! ??
        if (gameSetup.inAutoSearch) return false;
        if (cueballInHand) return true;
        // return (!inStrike && !inModal && gameSetup.config.localPlayerID == activePlayerInfo.playerUserId);
        return (!this.inStrike && gameSetup.activePlayerInfo.isLocal);
      };


      this.verifyTestResult = () => {
        if (gameSetup.gameType != GAME_TYPE.TESTING) return;
      };

      gameSetup.executeStrikeMove = function (lastMove) {
        // console.log("dddd executeStrikeMove " + JSON.stringify(lastMove));
        //that.toggleAllControls(false);
        gameSetup.controller.disableGUIInputs();

        gameSetup.targetPocketID = lastMove.targetPocketID;
        gameSetup.targetBallID = lastMove.targetBallID;
        that.applyStrike(new Victor(lastMove.forcex, lastMove.forcey), new Victor(lastMove.avx, lastMove.avy), lastMove.hspin);
        gameSetup.breakStartTime = -1;
                // console.log("set in strike true");
        gameSetup.allStopped = false;
                // gameSetup.targetBallID = -1;
                // gameSetup.targetPocketID = -1;
        // gameSetup.targetPocketMark.x = config.tableW * 100;
        // gameSetup.targetPocketMark.y = config.tableW * 100;

        // gameSetup.targetBallMark.x = config.tableW * 100;
        // gameSetup.targetBallMark.y = config.tableW * 100;

        GameEngine.clearForecastLines();

        // console.log("setting gameSetup.firstBallTouchedByCueball = null;");
        gameSetup.firstBallTouchedByCueball = null;
        ballbodies[0].touchedRail = false;
        gameSetup.isKickShot = false;
        gameSetup.firstCushionTouchedByBall = null;
        gameSetup.firstBallTouchCushion = null;
        gameSetup.someBallTouchedRailedAfter = false;
        gameSetup.ballsTouchedRails = [];
        gameSetup.railsTouchedByTargetBall = [];
        gameSetup.railsTouchedByCueBall = [];
        gameSetup.newlyPocketedBalls = [];
        gameSetup.firstBallMark.position.x = 10000;
        gameSetup.firstBallMark.position.y = 10000;
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
          pi.isLocal = pi.playerUserId == gameSetup.config.localPlayerID || gameSetup.gameType == GAME_TYPE.AUTORUN || gameSetup.gameType == GAME_TYPE.BATTLE;
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
        // console.log("new ai worker command " + JSON.stringify(data));
        const shotCmdUser = data.cmd;
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          if (data.cmdType == CMD_TAKE_CALLED_SHOT || data.cmdType == CMD_TAKE_BREAK_SHOT) {
            gameSetup.AICommand = data.cmd;
          }
        }
        const shotCmdUserRaw = {};
        if (shotCmdUser) {
          shotCmdUserRaw.aimx = shotCmdUser.aimx;
          shotCmdUserRaw.aimy = shotCmdUser.aimy;
          shotCmdUserRaw.strength = shotCmdUser.strength;
        }

        if (shotCmdUser && typeof(shotCmdUser) != "undefined") {
          if (typeof(shotCmdUser.aimx) != "undefined") shotCmdUser.aimx = Math.fround(shotCmdUser.aimx);
          if (typeof(shotCmdUser.aimy) != "undefined") shotCmdUser.aimy = Math.fround(shotCmdUser.aimy);
          if (typeof(shotCmdUser.cueballx) != "undefined") shotCmdUser.cueballx = Math.fround(shotCmdUser.cueballx);
          if (typeof(shotCmdUser.cuebally) != "undefined") shotCmdUser.cuebally = Math.fround(shotCmdUser.cuebally);
          if (typeof(shotCmdUser.strength) != "undefined") shotCmdUser.strength = Math.fround(shotCmdUser.strength);
          if (typeof(shotCmdUser.spin) != "undefined") shotCmdUser.spin = Math.fround(shotCmdUser.spin);
          if (typeof(shotCmdUser.hspin) != "undefined") shotCmdUser.hspin = Math.fround(shotCmdUser.hspin);
        }

        //gameSetup.aimBallMark.aimCText.text = ""; // aaaa
        // // debugger;
        // gameSetup.aimBallMark.aimCText.visible = false;

        if (shotCmdUser && typeof(shotCmdUser) != "undefined" && typeof(shotCmdUser.aimx) != "undefined") {
          gameSetup.aimx = 1000000;
          gameSetup.aimy = 1000000;
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


        if (data.cmdType == CMD_SCRIPT_RESET_TABLE) {
          if (gameSetup.gameType == GAME_TYPE.TESTING)
            ResetTable(data.clearTable);
          return;
        } else if (data.cmdType == CMD_SCRIPT_REPORT_END_OF_TEST) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.handleTestResult(data.result);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_EXPECT_BALL_POCKETED) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.userExpectedResult.push("EXPECTBALLPOCKETED_" + data.ball_id + "_" + data.pocket_id);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_EXPECT_SHOT_COMMAND) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.userExpectedResult.push("EXPECTSHOTCOMMAND_" + data.cmd.aimx + "_" + data.cmd.aimy + "_" + data.cmd.strength  + "_" + data.cmd.spin  + "_" + data.cmd.hspin + "_" + data.cmd.targetBallID + "_" + data.cmd.targetPocketID);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_REPORT_END_OF_TEST_SETUP) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.inRunningTest = false;
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_SUBMIT_DATA) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.handleSubmitData(data);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_PLOT_DATA) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.handlePlotData(data);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_LOAD_DATA) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.handleLoadData(data);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_TRAIN_LINEAR_MODEL) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.handleTrainLinearModel(data);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            window.waitForAllStopResolveID = data.resolveID;
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_UPDATE_WORLD) {
          gameSetup.controller.updateWorld();
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_UPDATE_WORLD,
            'world': WorldForPlayer,
            'resolveID': data.resolveID
          });
          // if (gameSetup.gameType == GAME_TYPE.TESTING)
          return;
        } else if (data.cmdType == CMD_PRINT) {
          if (window.handleNewConsole)
            window.handleNewConsole(data.cmd.str);
          return;
        } else if (data.cmdType == CMD_CLEAR_PRINT) {
          window.handleClearConsole();
          return;
        } else if (data.cmdType == CMD_GET_SECONDS_LEFT) {
          gameSetup.controller.updateWorld();
          let ss = gameSetup.activePlayerInfo.secondsLeft;
          if (typeof(ss) == "undefined") ss = 10000;
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_SECONDS_LEFT,
            'world': WorldForPlayer,
            'secondsLeft': ss,
            'resolveID': data.resolveID
          });
          // if (gameSetup.gameType == GAME_TYPE.TESTING)
          return;
        } else if (data.cmdType == CMD_SCRIPT_SET_SECONDS_LEFT) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            setSecondsLeft(data.secondsLeft);
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_CHOOSE_COLOR) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            if (data.color == Pool.RED) ChooseRedColor();
            if (data.color == Pool.YELLOW) ChooseYellowColor();
            if (data.color == Pool.BLACK) ChooseBlackColor();
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_PLACE_BALL_ON_TABLE) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            try {

              PlaceBallOnTable(data.id, data.x, data.y);
            } catch (e) {

            }
            // that.clearForecastLines();
          }
          return;
        } else if (data.cmdType == CMD_PLAN_CALLED_SHOT) {
          // debugger;
          if (gameSetup.gameType == GAME_TYPE.TESTING)
            resolvedPlanCallShot[shotCmdUser.rind] = shotCmdUser.maxProb;
          return;
        } else if (data.cmdType == CMD_TAKE_CALLED_SHOT && (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.controller.gameState == CALL_SHOT_STATE)) {

          if (!shotCmdUser) {
            window.testResult = "Test failed: no valid shot command returned by the getCallShot function.";
            gameSetup.showTestResult();
            return;
          }

          if (gameSetup.gameType == GAME_TYPE.TESTING) {

            if (window.testCondition && window.testCondition.indexOf("AimXY00") >=0) {
              if (shotCmdUser.aimx!== 0 || shotCmdUser.aimy !== 0) {
                window.testResult = "Test failed: you are supposed to shoot at aimx = 0 and aimy = 0.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_userAim_") >=0) {
              const p = window.testCondition.split("_");
              const targetaimx = Number(p[2]);
              const targetaimy = Number(p[3]);
              if (Math.abs(shotCmdUser.aimx - targetaimx) > 1 || Math.abs(shotCmdUser.aimy - targetaimy) > 1) {
                window.testResult = "Test failed: the aiming point in your shot command is not correct.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_getDouble") >=0) {
              if (shotCmdUser.strength!== 40) {
                window.testResult = "Test failed: the shot strength should be 40 (from 2 * 20).";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition && window.testCondition.indexOf("TestFinished_NewReturn") >=0) {
              if (shotCmdUser.aimx!== 20 || shotCmdUser.aimy !== 30 || shotCmdUser.strength != 50) {
                window.testResult = "Test failed: you are supposed to return an aim point at aimx of 20, aimy of 30, and strength of 50.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_UseStrength_") >=0) {
              const p = window.testCondition.split("_");
              if (shotCmdUser.strength != Number(p[2])) {
                window.testResult = "Test failed: you are supposed to choose the shot with a strength of 70.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_2_0") >=0) {
              if ( !window.calcProbCmd || window.calcProbCmd.targetBallID != 2 || window.calcProbCmd.targetPocketID != 0) {
                window.testResult = "Test failed: you are supposed to calculate the probability for ball 2 and pocket 0.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_3") >=0) {
              if ( !window.calcProbCmd || window.calcProbCmd.targetBallID != 4 || window.calcProbCmd.targetPocketID != 3) {
                window.testResult = "Test failed: you are supposed to calculate the probability for ball 4 and pocket 3.";
                gameSetup.showTestResult();
                return;
              }
            }



            if (window.testCondition && window.testCondition.indexOf("TestFinished_AccelerateGetCommand") >=0) {

              let ball4count = 0;
              let ball5count = 0;
              for (let k=0; k<window.calcProbCmdList.length; k++) {
                if (window.calcProbCmdList[k].targetBallID == 4) ball4count ++;
                if (window.calcProbCmdList[k].targetBallID == 5) ball5count ++;
              }
              if ( ball4count > 24 ) {
                window.testResult = "Test failed: you have not skipped some unnecessary shots for ball 4.";
                gameSetup.showTestResult();
                return;
              }

              if ( ball5count > 45 ) {
                window.testResult = "Test failed: you have not skipped some unnecessary shots for ball 5.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_ReturnEarly") >=0) {

              let ball5count = 0;
              for (let k=0; k<window.calcProbCmdList.length; k++) {
                if (window.calcProbCmdList[k].targetBallID == 5) ball5count ++;
              }

              if ( ball5count > 38 ) {
                window.testResult = "Test failed: you have not skipped some unnecessary shots for ball 5.";
                gameSetup.showTestResult();
                return;
              }
            }



            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_4_4_5") >=0) {
              if (window.calcProbCmdList.length != 2) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 into pocket 4 and 5.";
                gameSetup.showTestResult();
                return;
              }

              const cmd1 = window.calcProbCmdList[0];
              const cmd2 = window.calcProbCmdList[1];
              if ( cmd1.targetBallID != 4 || cmd1.targetPocketID != 4 || cmd2.targetBallID != 4 || cmd2.targetPocketID != 5 ) {
                window.testResult = "Test failed: you are supposed to calculate the probability for ball 4 into pocket 4, then ball 4 into pocket 5.";
                gameSetup.showTestResult();
                return;
              }

            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_0_4_1") >=0) {
              if (window.calcProbCmdList.length != 2) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 into pocket 0 and 1.";
                gameSetup.showTestResult();
                return;
              }

              const cmd1 = window.calcProbCmdList[0];
              const cmd2 = window.calcProbCmdList[1];
              if ( cmd1.targetBallID != 4 || cmd1.targetPocketID != 0 || cmd2.targetBallID != 4 || cmd2.targetPocketID != 1 ) {
                window.testResult = "Test failed: you are supposed to calculate the probability for ball 4 into pocket 0, then ball 4 into pocket 1.";
                gameSetup.showTestResult();
                return;
              }

            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4151") >=0) {
              if (window.calcProbCmdList.length != 4) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 and ball 5 into pocket 1, each with vertical and horizontal rebounds.";
                gameSetup.showTestResult();
                return;
              }

              let cnt41 = 0;
              let cnt51 = 0;
              for (let k=0; k<4; k++) {
                const cmd = window.calcProbCmdList[k];
                if (cmd.targetBallID == 4 && cmd.targetPocketID == 1) cnt41 ++;
                if (cmd.targetBallID == 5 && cmd.targetPocketID == 1) cnt51 ++;
              }

              if ( cnt41 != 2 || cnt51 != 2 ) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 and ball 5 into pocket 1, each with vertical and horizontal rebounds.";
                gameSetup.showTestResult();
                return;
              }

            }


            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_allkickdirect") >=0) {
              if (window.calcProbCmdList.length != 4) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 and ball 5 into pocket 1, each with vertical and horizontal rebounds.";
                gameSetup.showTestResult();
                return;
              }

              let cnt41 = 0;
              let cnt51 = 0;
              for (let k=0; k<4; k++) {
                const cmd = window.calcProbCmdList[k];
                if (cmd.targetBallID == 4 && cmd.targetPocketID == 1) cnt41 ++;
                if (cmd.targetBallID == 5 && cmd.targetPocketID == 1) cnt51 ++;
              }

              if ( cnt41 != 2 || cnt51 != 2 ) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 and ball 5 into pocket 1, each with vertical and horizontal rebounds.";
                gameSetup.showTestResult();
                return;
              }

            }

            if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_0_4_5") >=0) {
              if (window.calcProbCmdList.length != 2) {
                window.testResult = "Test failed: you are supposed to calculate the probability for shooting ball 4 into pocket 0 and 5.";
                gameSetup.showTestResult();
                return;
              }

              const cmd1 = window.calcProbCmdList[0];
              const cmd2 = window.calcProbCmdList[1];
              if ( cmd1.targetBallID != 4 || cmd1.targetPocketID != 0 || cmd2.targetBallID != 4 || cmd2.targetPocketID != 5 ) {
                window.testResult = "Test failed: you are supposed to calculate the probability for ball 4 into pocket 0, then ball 4 into pocket 5.";
                gameSetup.showTestResult();
                return;
              }


            }

            if (window.testCondition && window.testCondition.indexOf("TestFinishedAnyResultAimBall_") >=0) {
              const p = window.testCondition.split("_");
              const ballPos = gameSetup.ballbodies[p[1]].position;
              if (Math.abs(shotCmdUser.aimx - (ballPos[0] - gameSetup.config.tableCenterX)) > 0.1 || Math.abs(shotCmdUser.aimy - (ballPos[1] - gameSetup.config.tableCenterY)) > 0.1 ) {
                window.testResult = "Test failed: you are supposed to shoot at ball " + p[1] + " directly.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition == "TestFinishedAnyResultAimXYStrength") {
              if (typeof(shotCmdUserRaw.aimx) == "undefined") {
                window.testResult = "Test failed: you need to set shot command's aimx property in the getCallShot function.";
                gameSetup.showTestResult();
                return;
              }
              if (typeof(shotCmdUserRaw.aimy) == "undefined") {
                window.testResult = "Test failed: you need to set shot command's aimy property in the getCallShot function.";
                gameSetup.showTestResult();
                return;
              }
              if (typeof(shotCmdUserRaw.strength) == "undefined") {
                window.testResult = "Test failed: you need to set shot command's strength property in the getCallShot function.";
                gameSetup.showTestResult();
                return;
              }
            }
            if (window.testCondition == "TestFinishedAimYCall00") {
              if (typeof(shotCmdUser.aimx) == "undefined" || shotCmdUser.aimx !== 0) {
                window.testResult = "Test failed: you need to set shot command's aimx property to 0 in the getCallShot function.";
                gameSetup.showTestResult();
                return;
              }
              if (typeof(shotCmdUser.aimy) == "undefined" || shotCmdUser.aimy !== 0) {
                window.testResult = "Test failed: you need to set shot command's aimy property to 0 in the getCallShot function.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition == "TestFinished_Strength10") {
              if (typeof(shotCmdUser.strength) == "undefined" || shotCmdUser.strength !== 10) {
                window.testResult = "Test failed: your robot should make a soft shot with strength of 10.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition == "TestFinished_Strength7") {
              if (typeof(shotCmdUser.strength) == "undefined" || shotCmdUser.strength !== 7) {
                window.testResult = "Test failed: your robot should make a soft shot with strength of 7 after search.";
                gameSetup.showTestResult();
                return;
              }
            }


            gameSetup.activePlayerInfo = gameSetup.playerInfo1;

          }
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: -1,
            targetPocketID: -1
          };

          // console.log("shotCmdUser " + JSON.stringify(shotCmdUser));

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.max(2, Math.min(100, shotCmdUser.strength));
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = Math.max(-1, Math.min(1, shotCmdUser.spin));
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = Math.max(-30, Math.min(30, shotCmdUser.hspin));
              if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }
          } else {

          }
        } else if (data.cmdType == CMD_TAKE_BREAK_SHOT  && (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.controller.gameState == BREAK_SHOT_STATE)) {
          // gameSetup.aimBallMark.visible = false; // aaaa to hide aim mark

          if (!shotCmdUser) {
            window.testResult = "Test failed: No break shot cmd returned by robot.";
            gameSetup.showTestResult();
            return;
          }


          if (gameSetup.gameType == GAME_TYPE.TESTING) {

            if (window.testCondition == "TestFinishedAnyResultAimXYStrength") {
              if (typeof(shotCmdUserRaw.aimx) == "undefined") {
                window.testResult = "Test failed: please set shot command's aimx property in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              }


              if (typeof(shotCmdUserRaw.aimy) == "undefined") {
                window.testResult = "Test failed: please set shot command's aimy property in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              }
              if (typeof(shotCmdUserRaw.strength) == "undefined") {
                window.testResult = "Test failed: please set shot command's strength property in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition == "TestFinished_Strength100") {
              if (typeof(shotCmdUser.strength) == "undefined" || shotCmdUser.strength !== 100) {
                window.testResult = "Test failed: your robot should use a strength of 100.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition == "TestFinished_Spin_1") {
              if (typeof(shotCmdUser.spin) == "undefined" || shotCmdUser.spin !== 1) {
                window.testResult = "Test failed: your robot should use a spin of 1.";
                gameSetup.showTestResult();
                return;
              }
            }
            if (window.testCondition == "TestFinished_hspin_30") {
              if (typeof(shotCmdUser.spin) == "undefined" || shotCmdUser.hspin !== 30) {
                window.testResult = "Test failed: your robot should use a hspin of 30.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition == "TestFinished_cueballxy") {
              if (shotCmdUser.cueballx != -700) {
                window.testResult = "Test failed: your robot should have a cueballx property of value -700.";
                gameSetup.showTestResult();
                return;
              }
              if (shotCmdUser.cuebally != 250) {
                window.testResult = "Test failed: your robot should have a cuebally property of value 250.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition == "TestFinishedAimY35") {
              if (typeof(shotCmdUser.aimy) == "undefined" || shotCmdUser.aimy !== 35) {
                window.testResult = "Test failed: you need to set aimy to 35 in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition == "TestFinishedAimPoint_") {
              const p = window.testCondition.split("_");
              if ( Math.abs(shotCmdUser.aimx - Number(p[1])) > 1 || Math.abs(shotCmdUser.aimy - Number(p[2])) > 1 ) {
                window.testResult = "Test failed: you need to calculate the correct aiming point in the getCallShot function.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCodeCondition == "TestFinishedAimY42") {
              if (typeof(shotCmdUser.aimy) == "undefined" || shotCmdUser.aimy !== 42) {
                window.testResult = "Test failed: you need to set aimy to 42 in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (window.testCondition == "TestFinishedFirstTouchBall_11_CueballXY" || window.testCondition == "TestFinishedFirstTouchBall_2_CueballXY") {
              if (typeof(shotCmdUser.cueballx) == "undefined" || typeof(shotCmdUser.cuebally) == "undefined") {
                window.testResult = "Test failed: you need to specify cueballx and cuebally in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              } else if (shotCmdUser.cueballx != -800) {
                window.testResult = "Test failed: you need to specify cueballx as -800.";
                gameSetup.showTestResult();
                return;
              } else if (shotCmdUser.cuebally != 400) {
                window.testResult = "Test failed: you need to specify cuebally as 400.";
                gameSetup.showTestResult();
                return;

              }
            }
          }

          if (window.testCondition == "TestFinishedAnyResultAimXY") {
            if (typeof(shotCmdUserRaw.aimx) == "undefined" || typeof(shotCmdUserRaw.aimy) == "undefined") {
              window.testResult = "Test failed: You need to specify both aimx and aimy.";
              gameSetup.showTestResult();
              return;
            }
          }


          // gameSetup.activePlayerInfo = gameSetup.playerInfo1; // aaaa testing

          shotCmd = {
            cueballx: gameSetup.config.tableCenterX - gameSetup.config.tableW / 4,
            cuebally: gameSetup.config.tableCenterY,
            aimx: gameSetup.config.tableCenterX + gameSetup.config.tableW / 4,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0
          };
          // translate user inputs if specified
          if (typeof(shotCmdUser.aimx) != "undefined") shotCmd.aimx = gameSetup.config.tableCenterX + shotCmdUser.aimx;
          if (typeof(shotCmdUser.aimy) != "undefined") shotCmd.aimy = gameSetup.config.tableCenterY + shotCmdUser.aimy;
          if (typeof(shotCmdUser.cueballx) != "undefined") shotCmd.cueballx = gameSetup.config.tableCenterX + shotCmdUser.cueballx;
          if (typeof(shotCmdUser.cuebally) != "undefined") shotCmd.cuebally = gameSetup.config.tableCenterY + shotCmdUser.cuebally;
          if (typeof(shotCmdUser.strength) != "undefined") shotCmd.strength = Math.min(100, shotCmdUser.strength);
          if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = Math.max(-1, Math.min(1, shotCmdUser.spin));
          if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = Math.max(-30, Math.min(30, shotCmdUser.hspin));
          // that.clearForecastLines();

          // const strength = shotCmd.strength;
          // const spinMultiplier = 0 - 2.5 * shotCmd.spin;

          const cb = gameSetup.ballsByID[0];
          const cbx = Math.max(Math.min(gameSetup.config.tableCenterX - gameSetup.config.tableW / 4, shotCmd.cueballx), gameSetup.config.tableCenterX - gameSetup.config.tableW / 2 + config.cushionBarThick + config.ballD);
          const cby = Math.min(Math.max(gameSetup.config.tableCenterY - gameSetup.config.tableH / 2 + config.cushionBarThick + config.ballD, shotCmd.cuebally), gameSetup.config.tableCenterY + gameSetup.config.tableH / 2 - config.cushionBarThick - config.ballD);
          // debugger;
          resetBall(cb, cbx, cby);
          // let dir = new Victor(shotCmd.aimx - cb.x, shotCmd.aimy - cb.y);
          // if (shotCmd.aimy == cb.y) {
          //   if (shotCmd.aimx >= cb.x)
          //     dir = new Victor(1, 0);
          //   else
          //     dir = new Victor(-1, 0);
          // }
        } else if (data.cmdType == CMD_PLACE_CUEBALL) {
          if (gameSetup.gameType != GAME_TYPE.TESTING) {
            if (gameSetup.controller.gameState != CUEBALL_IN_HAND) return;
          }
          const cueballPos = (data.cmd == null) ? new Victor(-500, 0) : data.cmd;
          const testtarget = new Victor(cueballPos.x + gameSetup.config.tableCenterX, cueballPos.y+gameSetup.config.tableCenterY);

          if (window.testCondition == "TestFinishedAnyResult_CueBallNoOverlap") {
            for (let i = 0; i < gameSetup.balls.length; i ++) {
              const b = gameSetup.balls[i];
              if (b.body.inPocketID !== null || b.ID === 0) continue;
              const pos1 = new Victor(b.x, b.y);
              const d = testtarget.distance(pos1);
              if (d <= config.ballD * 0.99999) {
                window.testResult = "Test failed: You cannot place cue ball on top of another ball.";
                gameSetup.showTestResult();
                return;
              }
            }
          }

          //if (!gameSetup.isProfessionalUser) {
          //  testtarget.x = 0; testtarget.y = 0;
          //}

          const cb = gameSetup.ballsByID[0];
          cb.body.inPocketID = null;
          cb.inPocket = false;
          // if (!gameSetup.controller.checkIfCollidingBall(testtarget)) {
          //   resetBall(cb, testtarget.x, testtarget.y);
          // } else {
          //   // user input is not good, so we just find one place for user
          //   gameSetup.controller.replaceCueBallNoCollision(cb);
          // }
          gameSetup.controller.planToPlaceCueball(testtarget.x, testtarget.y);
          //me.enterState(GameState.CallShot, activePlayerInfo);

          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_FINISH_PLACE_CUEBALL,
            'world': WorldForPlayer,
            'resolveID': data.resolveID
          });

          return;

        } else if (data.cmdType == CMD_SCRIPT_CALCULATE_END_STATE_2) {


          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: 1,
            targetPocketID: 0
          };


          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;
            if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            window.calcEndStateCount ++;
            if (data.WithRandomNess) {
              window.calcEndStateCountRandom ++;
            }
          }

          let endState = [];
          if (data.initState.length > 0) {
            if (window.deleteInitStateHandle) {
              clearTimeout(window.deleteInitStateHandle);
            }
            window.InitState = data.initState;
            endState = gameSetup.controller.calcEndStateSync(shotCmd, data.WithRandomNess);
            window.deleteInitStateHandle = setTimeout(() => {
              delete window.InitState;
            }, 100);
          } else {
          }
          // console.log("main thread: got prob and send back " + prob + " for resolve id " + data.resolveID);
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_CALCULATE_END_STATE_2,
            'world': WorldForPlayer,
            'endState': endState,
            'resolveID': data.resolveID
          });
          return;
        } else if (data.cmdType == CMD_SCRIPT_CALCULATE_END_STATE) {
          delete window.InitState;
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            // if (shotCmdUser.spin && gameSetup.difficulty >= ADVANCED) shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;
            if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            window.calcEndStateCount ++;
            if (data.WithRandomNess) {
              window.calcEndStateCountRandom ++;
            }
          }
          // console.log("main thread: calc prob " + JSON.stringify(shotCmd));
          const endState = gameSetup.controller.calcEndStateSync(shotCmd, data.WithRandomNess);
          // console.log("main thread: got prob and send back " + prob + " for resolve id " + data.resolveID);
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_CALCULATE_END_STATE,
            'world': WorldForPlayer,
            'endState': endState,
            'resolveID': data.resolveID
          });
          return;

        } else if (data.cmdType == CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL) {
          delete window.InitState;
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            // if (shotCmdUser.spin && gameSetup.difficulty >= ADVANCED) shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;
            if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            window.calcClosestTrailCount ++;
          }
          // console.log("main thread: calc prob " + JSON.stringify(shotCmd));
          const point = gameSetup.controller.calcClosestPointSync(shotCmd, data.ball_id, data.target_point);
          // console.log("main thread: got prob and send back " + prob + " for resolve id " + data.resolveID);
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_CALCULATE_CLOSEST_TRAIL,
            'world': WorldForPlayer,
            'point': point,
            'resolveID': data.resolveID
          });
          return;
        } else if (data.cmdType == CMD_GET_PROBABILITY) {
          delete window.InitState;
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            window.calcProbCmd = shotCmdUser;
            window.calcProbCmdList.push(shotCmdUser);
          }
          if (shotCmdUser.targetBallID == 3 && shotCmdUser.targetPocketID == 5) {
            // debugger;
          }
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;

            if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            // for test on call probability
            window.probabilityInquiryHistory += `${shotCmdUser.targetBallID}_${shotCmdUser.targetPocketID};`;
          }
          // console.log("main thread: calc prob " + JSON.stringify(shotCmd));
          const prob = gameSetup.controller.calcProbSync(shotCmd);
          window.probQueryAnswer = prob;
          // console.log("main thread: got prob and send back " + prob + " for resolve id " + data.resolveID);
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_PROBABILITY,
            'world': WorldForPlayer,
            'probability': prob,
            'resolveID': data.resolveID
          });
          return;

        } else if (data.cmdType == CMD_GET_PROBABILITY_2) {
          if (shotCmdUser.targetBallID == 3 && shotCmdUser.targetPocketID == 5) {
            // debugger;
          }
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;

            if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            // for test on call probability
            window.probabilityInquiryHistory += `${shotCmdUser.targetBallID}_${shotCmdUser.targetPocketID};`;
          }
          // console.log("main thread: calc prob " + JSON.stringify(shotCmd));

          let prob = -1;
          if (data.initState.length > 0) {
            if (window.deleteInitStateHandle) {
              clearTimeout(window.deleteInitStateHandle);
            }

            window.InitState = data.initState;
            prob = gameSetup.controller.calcProbSync(shotCmd);
            window.deleteInitStateHandle = setTimeout(() => {
              delete window.InitState;
            }, 100);
          }

          // console.log("main thread: got prob and send back " + prob + " for resolve id " + data.resolveID);
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_PROBABILITY_2,
            'world': WorldForPlayer,
            'probability': prob,
            'resolveID': data.resolveID
          });
          return;

        } else if (data.cmdType == CMD_GET_FIRST_BALL_TOUCHED) {
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetBallID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;

            if (shotCmdUser.targetBallID) {
              shotCmd.targetBallID = shotCmdUser.targetBallID;
              gameSetup.targetBallID = shotCmdUser.targetBallID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

          }
          // console.log("main thread: get first ball touched " + JSON.stringify(shotCmd));
          const firstBallTouched = gameSetup.controller.getFirstBallTouched(shotCmd);
          // console.log("main thread: got first ball touched and send back " + firstBallTouched.ballID + " for resolve id " + data.resolveID);
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_FIRST_BALL_TOUCHED,
            'world': WorldForPlayer,
            'firstBallTouched': firstBallTouched,
            'resolveID': data.resolveID
          });
          return;
        }

        if (shotCmd.strength < 2) shotCmd.strength = 2;

        // that.clearCueballTrails();

        gameSetup.aimx = shotCmd.aimx;
        gameSetup.aimy = shotCmd.aimy;

        // console.log(`cmd: ${JSON.stringify(shotCmd)}`);
        const strength = shotCmd.strength;
        const spinMultiplier = 0 - 2.5 * shotCmd.spin;
        const hspin = shotCmd.hspin;

        const cb = gameSetup.ballsByID[0];
        const dir = new Victor(shotCmd.aimx - cb.x, shotCmd.aimy - cb.y);
        // console.log("final dir " + JSON.stringify(dir));
        if (!shotCmdUser) {
          // debugger;
        }
        if (0 && dir.length() < 0.001 && shotCmdUser.targetBallID > 0) {
          const targetBall = gameSetup.ballsByID[shotCmdUser.targetBallID];
          // const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);
          dir.x = targetBall.position.x - cb.x;
          dir.y = targetBall.position.y - cb.y;
        }

        // that.setMeterByValue(config.speedMeterCfg, strength, gameSetup.speedMeterBall);
        // that.setMeterByValue(config.spinMeterCfg, shotCmd.spin, gameSetup.spinMeterBar);
        if (gameSetup.speedMeterBall) {
          gameSetup.speedMeterBall.setPositionByValue(shotCmd.strength);
          gameSetup.spinMeterBar.setPositionByValue(shotCmd.spin);
          gameSetup.spinMeterBarH.setPositionByValue(shotCmd.hspin);
        }
        // that.setMeterByValueNew(shotCmd.spin, gameSetup.spinMeterBar);
        // console.log("setting cueballDirection to dir " + JSON.stringify(dir));
        gameSetup.cueballDirection = dir.clone();

        gameSetup.AIStrength = strength; // unit difference?
        gameSetup.AISpinMultiplier = spinMultiplier;
        gameSetup.AIHSpin = hspin;

        // console.log("before on strike button " + gameSetup.targetPocketID);
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
        }, 600);
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
        window.calcProbCmd = null;
        window.calcProbCmdList = [];
        window.probQueryAnswer = -1;
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


      const PlaceBallOnTable = function (ballID, x, y) {
        const b = gameSetup.ballsByID[ballID];
        const xbound = (config.tableW - 2 * config.cushionBarThick - config.ballD);
        const ybound = (config.tableH - 2 * config.cushionBarThick - config.ballD);
        if (x > xbound) x = xbound;
        if (x < 0 - xbound) x = 0 - xbound;
        if (y > ybound) y = ybound;
        if (y < 0 - ybound) y = 0 - ybound;
                // resetBall(b, x * (config.tableW - 2 * config.cushionBarThick - config.ballD) + config.tableCenterX, y * (config.tableH- 2 * config.cushionBarThick - config.ballD) + config.tableCenterY);
        resetBall(b, x  + config.tableCenterX, y  + config.tableCenterY);
      };


      const PlaceCueBallFromHand = function() {
        // debugger;
        gameSetup.controller.setActivePlayerInfo(`${0}_${CUEBALL_IN_HAND}_-1_-100000_-100000_none_1000000`);
        // gameSetup.controller.updateWorld();
        // const b = gameSetup.ballsByID[0];
        // gameSetup.playerInfo1.playerAI.getCueBallPlacement();
        // PlaceBallOnTable(0, pos.x, pos.y);
      };

      const setSecondsLeft = (s) => {
        gameSetup.playerInfo1.secondsLeft = s;
        gameSetup.playerInfo2.secondsLeft = s;
      };

      const ChooseRedColor = function () {
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = Pool.RED;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = Pool.YELLOW;
        gameSetup.playerInfo1.chosenColor = Pool.RED;
        gameSetup.playerInfo2.chosenColor = Pool.YELLOW;
        gameSetup.playerInfo1.legalColor = Pool.RED;
        gameSetup.playerInfo2.legalColor = Pool.YELLOW;
      };
      const ChooseYellowColor = function () {
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = Pool.YELLOW;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = Pool.RED;
        gameSetup.playerInfo1.chosenColor = Pool.YELLOW;
        gameSetup.playerInfo2.chosenColor = Pool.RED;
        gameSetup.playerInfo1.legalColor = Pool.YELLOW;
        gameSetup.playerInfo2.legalColor = Pool.RED;
      };
      const ChooseBlackColor = function () {
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = Pool.BLACK;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = Pool.BLACK;
        gameSetup.playerInfo1.chosenColor = Pool.BLACK;
        gameSetup.playerInfo2.chosenColor = Pool.BLACK;
        gameSetup.playerInfo1.legalColor = Pool.BLACK;
        gameSetup.playerInfo2.legalColor = Pool.BLACK;
      };


      //TODO: game test scenario setup api


      const SetCandidateBalls = (list) => {
        WorldForPlayer.CandidateBallListOverwrite = list;
        // WorldForPlayer.CandidateBallList2[0] = list;
        // WorldForPlayer.CandidateBallList2[1] = list;
      };

      const TakeBreakShot = function () {
        //me.enterState(GameState.BreakShot, gameSetup.playerInfo1);
        gameSetup.controller.setActivePlayerInfo(`${0}_${BREAK_SHOT_STATE}_-1_-100000_-100000_none_1000000`);
      };

      const TakeCallShot = function () {
        //me.enterState(GameState.BreakShot, gameSetup.playerInfo1);
        gameSetup.controller.setActivePlayerInfo(`${0}_${CALL_SHOT_STATE}_-1_-100000_-100000_none_1000000`);
      };

      const GetCallShotProbability = async function() {
        let resolveID = Math.random().toFixed(10);
        while (resolvedPlanCallShot[resolveID]) {
          resolveID = Math.random().toFixed(10);
        }
        gameSetup.controller.updateWorld();
        // const rind = Math.random();

        // let lag = 600;
        // setTimeout(() => {
          console.log("\n\n\n\nsend to worker CMD_PLAN_CALLED_SHOT " + resolveID);
          gameSetup.activePlayerInfo = gameSetup.playerInfo1;
          gameSetup.playerInfo1.playerWorker.sendMessage({
            'cmd': CMD_PLAN_CALLED_SHOT,
            'world': WorldForPlayer,
            'rind': resolveID
          });
        // }, lag);

        return new Promise(async (resolve, reject) => {
          while ( typeof(resolvedPlanCallShot[resolveID]) == "undefined") {
            // busy wait
            // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
            await waitSeconds(0.5);
          }
          // debugger;
          resolve(resolvedPlanCallShot[resolveID]);
        });


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

      function getBallInfo(ballID) {
        const b = ballbodies[ballID];
        if (b.inPocketID == null) {
          return {i: ballID, p: -1, x: b.position[0] - gameSetup.config.tableCenterX, y: b.position[1] - gameSetup.config.tableCenterY};
        } else {
          return {i: ballID, p: b.inPocketID};
        }
      }

      function getAllBallInfo() {
        const allIDs = Object.keys(ballbodies);
        const allInfo = [];
        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          allInfo.push(getBallInfo(i));
        }
        return allInfo;
      }

      // function saveDataToCollection(collectionID, data) {
      //   PoolActions.saveDataToCollection(collectionID, data);
      // }

      // function loadDataFromCollection(collectionID) {
      //   return PoolActions.saveDataToCollection(collectionID);
      // }

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

      // async function WaitForAllBallStop() {
      //   if (!gameSetup.isProfessionalUser) {
      //     console.log("WaitForAllBallStop is supported only for PROFESSIONAL account. Please update your account first.");
      //     return;
      //   }
      //   // let WaitForAllBallStopID = Math.random().toFixed(10);
      //   // while (resolvedAllStop[WaitForAllBallStopID]) {
      //   //   WaitForAllBallStopID = Math.random().toFixed(10);
      //   // }
      //   window.allStoppedTriggered = false;
      //   window.isWaitingForAllStop = true;
      //   return new Promise(async (resolve, reject) => {
      //     while (!window.allStoppedTriggered) {
      //       // busy wait
      //       // console.log("waiting for prob resolveID " + resolveID + " " + JSON.stringify(shotCmd));
      //       await waitSeconds(0.2);
      //     }
      //     window.allStopCount ++;
      //     // console.log("AI: got resolveProbs!! " + resolveID);
      //     resolve();
      //   });
      // }

    };

    gameSetup.controller = new GameController();
    window.gameController = gameSetup.controller;


    // if (!isTesting) {
    // }

    // gameSetup.player0 = new Player(gameSetup.playerInfo[0]);
    // if (!isTesting) {
    //   gameSetup.player1 = new Player(gameSetup.playerInfo[1]);
    //   gameSetup.player0.setOpponentPlayer(gameSetup.player1);
    //   gameSetup.player1.setOpponentPlayer(gameSetup.player0);
    //   if (Math.random() >= 0.5) {
    //     gameSetup.player0.receiveToken();
    //   } else {
    //     gameSetup.player1.receiveToken();
    //   }
    // } else {
    //   gameSetup.player0.receiveToken();
    // }
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
    // debugger;
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


    gameSetup.emitter.updateOwnerPos(x, y);
    gameSetup.emitter.emit = true;
  };

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



  this.setupGameRoom = function () {


//     debugger;

//     // === training data generated from y = 2.0 + 5.0 * x + 2.0 * x^2 === //
// var data = [];
// for(var x = 1.0; x < 100.0; x += 1.0) {
//   var y = 2.0 + 5.0 * x + 2.0 * x * x + Math.random() * 1.0;
//   data.push([x, x * x, y]); // Note that the last column should be y the output
// }

// // === Create the linear regression === //
// // var regression = new jsregression.LinearRegression({
// //   alpha: 0.0000001, //
// //   iterations: 3000,
// //   lambda: 0.0,
// //   trace: false
// // });
// // can also use default configuration: var regression = new jsregression.LinearRegression();

// // === Train the linear regression === //
// var model = regression.fit(data);

// // === Print the trained model === //
// console.log(model);


// // === Testing the trained linear regression === //
// var testingData = [];
// for(var x = 1.0; x < 100.0; x += 1.0) {
//   var actual_y = 2.0 + 5.0 * x + 2.0 * x * x + Math.random() * 1.0;
//   var predicted_y = regression.transform([x, x * x]);
//   let zz = model.theta[0] + model.theta[1] * x + model.theta[2] * x * x;
//   console.log("actual: " + actual_y + " predicted: " + predicted_y + " zz " + zz);
// }

    // debugger;

    // var Y = $M([[1],[2],[3], [4], [6]]),
    //     X = $M([[1,2,3.2],[2.1,3.3, 5.7],[3.1, 5.8, 7.2], [5.2, 6.6, 7.2], [3.2, 6.6, 9.1]]);
    // const m = ols.reg(Y, X);



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
    // textures.push('/images/smallclothhalf.jpg');
    // this.load.spritesheet('button', '/images/plus_minus.png', 31, 31);
    // load default cue stick
    // const defaultCueStick = '/images/poolstickpurple.png';
    // textures.push(defaultCueStick);
    let cueStick = _.get(gameSetup, 'mainItems.imageSrc.main', '/images/diamondstick.png');
    textures.push(cueStick);

    if (gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.TOURNAMENT) {
      const opponentMainItems = _.get(gameSetup, 'opponentMainItems.imageSrc.main', '/images/diamondstick.png');
      if (opponentMainItems !== cueStick) {
        textures.push(opponentMainItems);
      }
    }

    if (gameSetup.gameType == GAME_TYPE.REPLAY) {
      const cueStick = "/images/Lightning_Strike.png";
      textures.push(cueStick);
    } else {
      const mainItems = _.get(gameSetup, 'mainItems')
      _.map(mainItems, (mainItem) => {
        if (mainItem.gameId != "uN9W4QhmdKu94Qi2Y") return;
        const main = _.get(mainItem, 'imageSrc.main');
        if (_.isString(main)) {
          if(textures.indexOf(main) === -1) {
            textures.push(main);
          }
        } else if (_.isObject(main) && _.get(_.keys(main), 'length') > 0) {
          _.forEach(main, src => {
            if(textures.indexOf(src) === -1) {
              textures.push(src);
            }
          })
        }
      });
    }

    // textures.push(`/images/white_rolling_adj_hd2.png`);
    // textures.push(`/images/red_rolling_adj_hd2.png`);
    // textures.push(`/images/yellow_rolling_adj_hd2.png`);
    // textures.push(`/images/black_rolling_adj_hd2.png`);
    // textures.push(`/images/spintargetballpanel2.png`);
    textures.push(`/images/whitetargetball.png`);
    textures.push(`/images/particle.png`);

    textures.push(`/images/handbridgeandcuestick2.png`);
    textures.push(`/images/hitbtn.png`);
    textures.push(`/images/replaybtn.png`);
    textures.push(`/images/exitbtn.png`);
    textures.push(`/images/modalmessagebg.png`);
    textures.push(`/images/okbtn.png`);
    textures.push(`/images/quitbtn.png`);
    textures.push(`/images/placebtn.png`);

    textures.push(`/images/staybtn.png`);
    textures.push(`/images/exitwarning2.png`);
    textures.push(`/images/redbackground.png`);
    textures.push(`/images/yellowarrow.png`);
    textures.push(`/images/newpool/tishi.png`);
    textures.push(`/images/newpool/jinbi.png`);

    textures.push(`/images/newpool/endoverlay2.png`);
    textures.push(`/images/newpool/bj3b.png`);
    textures.push(`/images/newpool/exit_1.png`);
    textures.push(`/images/newpool/exit_2.png`);
    textures.push(`/images/newpool/restart_1.png`);
    textures.push(`/images/newpool/restart_2.png`);
    textures.push(`/images/newpool/winner.png`);


    if (false && (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch)) {
      textures.push(`/images/controlsandrulessmall.png`);
    } else {
      textures.push(`/images/controlsandrules.png`);
    }
    // textures.push(`/images/nametaggrey.png`);
    textures.push(`/images/newpool/starback3.jpg`);
    textures.push(`/images/newpool/myplacebtn1a.png`);
    textures.push(`/images/newpool/myplacebtn0a.png`);
    textures.push(`/images/newpool/myquitbtn0.png`);
    textures.push(`/images/newpool/myquitbtn1.png`);
    textures.push(`/images/newpool/myhitbtn0.png`);
    textures.push(`/images/newpool/myhitbtn1.png`);
    textures.push(`/images/newpool/myhelpbtn0.png`);
    textures.push(`/images/newpool/myhelpbtn1.png`);


    textures.push(`/images/newpool/1_1.png`);
    textures.push(`/images/newpool/1_2.png`);
    textures.push(`/images/newpool/2-1.png`);
    textures.push(`/images/newpool/2-2.png`);
    textures.push(`/images/newpool/3_1.png`);
    textures.push(`/images/newpool/3_2.png`);

    textures.push(`/images/newpool/anniu1_1.png`);
    textures.push(`/images/newpool/anniu1_2.png`);
    textures.push(`/images/newpool/anniu2_1.png`);
    textures.push(`/images/newpool/anniu2_2.png`);
    textures.push(`/images/newpool/anniu3_1.png`);
    textures.push(`/images/newpool/anniu3_2.png`);
    textures.push(`/images/newpool/firework4.png`);

    textures.push(`/images/bluecrystallball.png`);
    textures.push(`/images/greencrystallball.png`);
    textures.push(`/images/yellowcrystallball.png`);
    // textures.push(`/images/speedbarbackground2.png`);
    // textures.push(`/images/directionwoodbackground.png`);
    // textures.push(`/images/auto_zoom_search2.png`);


    let bgitems = gameSetup.backgroundItems;
    if (gameSetup.backgroundItems.length > 0) {
      for (let k=0; k<gameSetup.backgroundItems.length; k++) {
        bgitems = gameSetup.backgroundItems[k];
        if (bgitems.gameId == "uN9W4QhmdKu94Qi2Y") {
          break;
        }
      }
    }

    const poolTableBig = _.get(bgitems, 'imageSrc.main', '/images/diamondpoolbig.png');
    const poolTableSmall = _.get(bgitems, 'imageSrc.small', '/images/diamondpoolsmall.png');
    //const poolTableSmall = '/images/rt.png';
    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      textures.push(poolTableSmall);
    } else if (gameSetup.gameType == GAME_TYPE.REPLAY) {
      textures.push("/images/Lightning_Night_Small.png");
    } else
      textures.push(poolTableBig);
    // textures.push('/images/wood-vs-sign.png');
    textures.push(`/images/newwhiteballrolling.png`);
    textures.push(`/images/newyellowballrolling.png`);
    textures.push(`/images/newredballrolling.png`);
    textures.push(`/images/newblackballrolling.png`);
    textures.push('/images/robot1.png');
    textures.push('/images/human1.png');
    // textures.push('/images/gowhite.png');
    // textures.push('/images/adjustwhite.png');
    // textures.push('/images/cwmetal3.png');
    // textures.push('/images/ccwmetal3.png');
    // textures.push('/images/cwblue.png');
    // textures.push('/images/ccwblue.png');
    // textures.push('/images/helpquestionmark.png');
    // textures.push('/images/SliderSlot1Speed8NoWord.png');
    // textures.push('/images/TGameLogoHead.png');
    textures.push('/images/tboticon.png');
    textures.push('/images/activeframe2.png');


    // textures.push('/images/tbotmessagebackground2.png');
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
      if (!PIXI.loader.resources["/images/newpool/starback3.jpg"]) {
        // loading of game screen cancelled?
        console.log("do not have blue background 4 yet");
        if (typeof(gameSetup.gameType) == "undefined") return;
        setTimeout(() => {
          console.log("try initFunction again");
          initFunction();
        }, 1000);
        return;
      }

      if (gameSetup.initFunctionExecuted) return;

      gameSetup.initFunctionExecuted = true;
      that.initScreen();

      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.AUTORUN  || gameSetup.gameType == GAME_TYPE.REPLAY || gameSetup.gameType === GAME_TYPE.BATTLE) {
        gameSetup.allInitialized = true;
        if (gameSetup.gameType == GAME_TYPE.REPLAY) {
          window.replayControl.setGameEngineReady();
        }
        if (gameSetup.gameType == GAME_TYPE.TESTING) {

          gameSetup.controller.ResetTable(true);
        }
      } else {
        gameSetup.controller.disableGUIInputs();
        console.log("reportEnteringGameRoom " + gameSetup.room._id + " gameSetup.localPlayerID " + gameSetup.localPlayerID);
        //gameSetup.showModalMessage('Connecting players ...', '', MODAL_NOBUTTON);
        gameSetup.config.showHeadline('Connecting players ...', 200);
        PoolActions.reportEnteringGameRoom(gameSetup.room._id, gameSetup.localPlayerID);

        // if (!gameSetup.isHost && !gameSetup.isLocal) {
        //   console.log("send game initialized from guest");
        //   gameSetup.networkHandler.sendGameInitialized();
        //   gameSetup.allInitialized = true;
        // } else {
        //   if (gameSetup.isLocal) {
        //     gameSetup.allInitialized = true;
        //   } else {
        //     gameSetup.hostInitialized = true;
        //     gameSetup.allInitialized = true;
        //     for (let j = 1; j < gameSetup.playerCount; j++) {
        //       const p1 = gameSetup.allPeers[j];
        //       console.log(`checking peer init ${j} ${p1.gameInitialized}`);
        //       if (!p1.gameInitialized) {
        //         gameSetup.allInitialized = false;
        //         break;
        //       }
        //     }

        //     console.log(`check all init result: ${gameSetup.allInitialized}`);
        //   }
        // }

        // if (gameSetup.isHost) {
        //   // host has token

        // } else {
        //   if (!gameSetup.isHost && gameSetup.networkHandler)
        //     gameSetup.networkHandler.sendReadyToHost();
        // }
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

  // pool table
  this.createTableAll = () => {
    // this.createTableRenderer();
    // this.createBallRenderer();
    gameSetup.createMaterials();
    gameSetup.addMateirals();
    this.addTableImage(); // bbbbb
    this.drawPockets();
    // this.testDrawPockets(); // ccccc
    this.addPocketLabel();
    this.drawTableCushionBars();
    this.drawTargetBall();
    this.drawTargetPocket();
    this.addBalls();
    gameSetup.addBalls = this.addBalls.bind(this);


    this.addPoolStick();
    if (gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.TOURNAMENT ) {
      this.addOpponentPoolStick();
    }


    this.drawFirstBall();



    // this.addWinnerMessage();
    this.drawAimBall();
    this.setupAimingHandler();

    this.drawPocketingStar();

    gameSetup.renderer.render(gameSetup.stage);

    gameSetup.controller.createWorldForPlayer();

    if (gameSetup.gameType != GAME_TYPE.TESTING && gameSetup.gameType != GAME_TYPE.REPLAY) {
      gameSetup.controller.createAIPlayers();
    } else {
      // run init setup code
      // debugger;
      // if (window.UserSetupCode) {
      //   const latestTime = window.UserSetupCode.CodeUpdates[window.UserSetupCode.CodeUpdates.length - 1].time;
      //   gameSetup.testSetupCode = reconstructCode(window.UserSetupCode, latestTime);
      //   console.log("setting 1 gameSetup.testSetupCode to " + gameSetup.testSetupCode);
      // } else {
      //   console.log("no window.UserSetupCode yet ");
      // }

      if (gameSetup.gameType != GAME_TYPE.REPLAY) {

        Meteor.setTimeout(() => {
          // console.log('to reset table after test!');
          // debugger;
          if (!gameSetup.controller) return;
          gameSetup.controller.setRobotCode("     "); //can't be blank

          if (window.UserSetupCode) {
            const latestTime = window.UserSetupCode.CodeUpdates[window.UserSetupCode.CodeUpdates.length - 1].time;
            gameSetup.testSetupCode = reconstructCode(window.UserSetupCode, latestTime);
            // console.log("setting 1a gameSetup.testSetupCode to " + gameSetup.testSetupCode);
          } else {
            // console.log("no 1a window.UserSetupCode yet ");
            if (gameSetup.scenario && gameSetup.scenario.SetupScript) {
              gameSetup.testSetupCode = gameSetup.scenario.SetupScript; // used to resetup table after all stop!
              // console.log("setting 2a gameSetup.testSetupCode to " + gameSetup.testSetupCode);
            }
          }

          const cleanTestSetupCode = getCleanTestCode(window.getTestScript ? window.getTestScript() : gameSetup.testSetupCode);
          // const p = gameSetup.testSetupCode.split("\n");
          // for (let k=0; k<p.length; k++) {
          //   if (p[k].indexOf("ResetTable") >= 0) {
          //     cleanTestSetupCode += `${p[k]}\n`;
          //   }
          //   if (p[k].indexOf("PlaceBallOnTable") >= 0) {
          //     const q = p[k].replace("PlaceBallOnTable","").split(/[\s,\(\)]+/);
          //     let allNumber = true;
          //     for (let j=0; j<q.length; j++) {
          //       if (isNaN(q[j])) {
          //         allNumber = false; break;
          //       }
          //     }
          //     if (allNumber)
          //       cleanTestSetupCode += `${p[k]}\n`;
          //   }
          // }
          if (gameSetup.testSetupCode)
            gameSetup.controller.createAIPlayers(cleanTestSetupCode, true);
        }, 2000);
      }



    }
  };

  this.loadFramedSpriteSheet = function(textureUrl, textureName, frameWidth, frameHeight, cols, cb) {
    // PIXI.loader.add(textureUrl).load(() => {
      const frames = [];
      // console.log("to load " + textureUrl);
      const texture = PIXI.loader.resources[textureUrl].texture.baseTexture;
      // const cols = Math.floor(texture.width / frameWidth);
      // const rows = Math.floor(texture.height / frameHeight);
      // const cols = 36;
      const rows = 1;
      let i = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++, i++) {
          PIXI.utils.TextureCache[`${textureName}-${i}`] = new PIXI.Texture(texture, { x: x * frameWidth, y: y * frameHeight, width: frameWidth, height: frameHeight });
          frames.push(PIXI.utils.TextureCache[`${textureName}-${i}`]);
        }
      }
      if (typeof cb == 'function') {
        cb(frames);
      }
    // });

    // // const texture = image.texture.baseTexture;
    // image.addEventListener("loaded", (event) => {
    //   const cols = Math.floor(texture.width / frameWidth);
    //   const rows = Math.floor(texture.height / frameHeight);
    //   let i = 0;
    //   for (let y = 0; y < rows; y++) {
    //     for (let x = 0; x < cols; x++, i++) {
    //       PIXI.TextureCache[`${textureName}-${i}`] = new PIXI.Texture(texture, { x: x * frameWidth, y: y * frameHeight, width: frameWidth, height: frameHeight });
    //       frames.push(PIXI.TextureCache[`${textureName}-${i}`]);
    //     }
    //   }
    //   if (typeof cb == 'function') {
    //     cb(frames);
    //   }
    // });
    // image.load();
    // return frames;
  };


  gameSetup.reAddBallBodies = (clearTable = false, IgnoreCueBall = false) => {
    const ids = Object.keys(gameSetup.ballsByID);
    for (let k=0; k<ids.length; k++) {
      const ball = gameSetup.ballsByID[ids[k]];
      if (IgnoreCueBall && ids[k] == 0) {
        gameSetup.addOneBallBody(ball, clearTable, false);
      } else {
        gameSetup.addOneBallBody(ball, clearTable, true);
      }
    }
  };

  gameSetup.addOneBallBody = (ball, clearTable = false, resetBallPos = true) => {
    const config = gameSetup.config;
    let x = ball.origX;
    let y = ball.origY;
    if (clearTable) {
      x = x * 10000;
      y = y * 10000;
    } else if (!resetBallPos) {
      x = ball.position.x;
      y = ball.position.y;
    }
    ball.body = that.addBallBody(world, config.ballD/2, x, y);
    ball.body.colorType = ball.colorType;

    ball.position.x = ball.body.position[0];
    ball.position.y = ball.body.position[1];

  // const bodyIndex = world.bodies.length - 1;
    // world.bodies[bodyIndex].bodyIndex = bodyIndex;
    ball.body.ID = ball.ID;
    ball.body.ball = ball;
    ballbodies[ball.ID] = ball.body;

    ball.body2 = that.addBallBody(world2, config.ballD/2, x, y);
    ball.body2.colorType = ball.colorType;
    ball.body2.isSim = true;
    ball.body2.ID = ball.ID;
    ballbodies2[ball.ID] = ball.body2;
    ball.body2.ball = ball;

    ball.body.inPocketID = null;
    ball.body2.inPocketID = null;
    if (clearTable) {
      ball.body.inPocketID = 0;
      ball.body2.inPocketID = 0;
    }
    ball.body.isStopped = false;
    ball.body2.isStopped = false;

    ball.body.av = new Victor(0, 0);
    ball.body2.av = new Victor(0, 0);

    ball.body.ballIDLabel = ball.ballIDLabel;
  };

  this.makeBall = (x, y, color, ID) => {
    const config = gameSetup.config;

    let ballfile = 'white';
    switch (color) {
      case Pool.RED: ballfile = 'red'; break;
      case Pool.YELLOW: ballfile = 'yellow'; break;
      case Pool.BLACK: ballfile = 'black'; break;
    }

    let ballcolor = 255 * 256 * 256 + 255 * 256 + 255;
    let ballframe = 10;
    if (color == Pool.WHITE) ballframe = 0;
    switch (color) {
      case Pool.RED: ballcolor = 255 * 256 * 256 + 5 * 256 + 5; break;
      case Pool.YELLOW: ballcolor = 255 * 256 * 256 + 255 * 256; break;
      case Pool.BLACK: ballcolor = 20 * 256 * 256 + 20 * 256 + 30; break;
    }


    //this.loadFramedSpriteSheet(`/images/${ballfile}_adj_hd2.png`, ballfile, 109, 85, (frames) => {
    this.loadFramedSpriteSheet(`/images/new${ballfile}ballrolling.png`, ballfile, 41, 41, 36, (frames) => {
      const ball = new PIXI.extras.AnimatedSprite(frames);
      ball.scale.set(config.ballD / 41);

      ball.oldp = new Victor(config.tableCenterX + x, config.tableCenterY + y);
      ball.oldp.x = Math.fround(ball.oldp.x);
      ball.oldp.y = Math.fround(ball.oldp.y);
      ball.nextPos = new Victor(config.tableCenterX + x, config.tableCenterY + y);

      ball.position.x = ball.oldp.x;
      ball.position.y = ball.oldp.y;
      ball.anchor.x = 0.5;
      ball.anchor.y = 0.5;

      gameSetup.stage.addChild(ball);

      ball.frame = 10;
      ball.gotoAndStop(ball.frame);
      ball.rotation = (Math.random() * Math.PI * 2);
      // ball.currentFrame = ballframe;
      // ball.framerate = -1;
      ball.animationSpeed = 12;
      // ball.angle = Math.random() * 360;
      // ball.rotation = Math.random() * 360;
      // ball.scale.set(config.ballD / 41);

      ball.ID = ID; ball.color = ballcolor;
      ball.colorType = color;

      ball.inputEnabled = false;

      if (ball.ID == 0) {
        gameSetup.cueball = ball;
      } else if (ball.ID == 1) {
        gameSetup.blackball = ball;
      }

      // ball.shadow = shadow;
      ball.origX = ball.oldp.x;
      ball.origY = ball.oldp.y;


      gameSetup.addOneBallBody(ball, false, true);



      that.balls.push(ball);
      gameSetup.ballsByID[ID] = ball;

      const ballIDLabelStyle = new PIXI.TextStyle({
        fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: 35,
        fontStyle: '',
        fontWeight: '',
        fill: ['#00ff00'],
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

      if (ball.colorType == Pool.YELLOW) {
        ballIDLabelStyle.fill = '#ffff00';
      } else if (ball.colorType == Pool.RED) {
        ballIDLabelStyle.fill = '#ff0000';
      } else if (ball.colorType == Pool.BLACK) {
        ballIDLabelStyle.fill = '#000000';
      } else if (ball.colorType == Pool.WHITE) {
        ballIDLabelStyle.fill = '#ffffff';
      }
      const label = new PIXI.Text(ball.ID, ballIDLabelStyle);
      label.position.x = -10000;
      label.anchor.set(0.5, 0.5);
      gameSetup.stage.addChild(label);
      ball.ballIDLabel = label;
      ball.body.ballIDLabel = label;

      // ball.visible = false;

      // gameSetup.ballBodyToID[bodyIndex] = ID;

      // ball.loop = false;
      // ball.onComplete = function() {
      //     //stage.removeChild(explosion);
      //     // gameSetup.explosionPool.killSprite(explosion);
      //     // console.log("kill explosion marker at " + gameSetup.explosionPool.marker);
      // };
    });
  };

  const cbtesttarget = new Victor(0, 0);
  this.enableDraggingCueBall = () => {

    const config = gameSetup.config;

    gameSetup.cueball.interactive = true;
    gameSetup.cueball.buttonMode = true;

    const updateCueBall = (event) => {
      // if (gameSetup.gameType == GAME_TYPE.TESTING) {
      //   showPointerCoordinate(event);
      // }

      if (true) {
        // document.getElementById("BallDiv").style.cursor = 'move';
        // console.log(" global: " + event.data.global.x + " " + event.data.global.y);
        // console.log(" original: " + event.data.originalEvent.clientX + " " + event.data.originalEvent.clientY);
        const cb = gameSetup.cueball.body;
        // console.log("updateInputs: " + cb.position[0] + " " + cb.position[1]);

        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          const whratio = config.TrueWidth / config.TrueHeight; // width vs height
          const oldnewratio = config.TrueWidth / 1600; // new vs old true width
          const metalBorderThick = 33.3964 * oldnewratio * 1.1;
          const wtabletop = 2000; // table is 2000x1000 now!
          const wfulltable = wtabletop + 2 * metalBorderThick;
          const hfulltable = wtabletop/2 + 2 * metalBorderThick;

          const px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
          const py = (config.TrueHeight - 110 - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;

          cbtesttarget.x = px;
          cbtesttarget.y = py;
          if (gameSetup.controller.checkIfCollidingBall(cbtesttarget)) {
            return;
          }

          cb.position[0] = px;
          cb.position[1] = py;
          gameSetup.cueball.position.x = cb.position[0];
          gameSetup.cueball.position.y = cb.position[1];

          gameSetup.cueballDirection.x = gameSetup.aimBallMark.position.x - cb.position[0];
          gameSetup.cueballDirection.y = gameSetup.aimBallMark.position.y - cb.position[1];
        }
        // console.log("setting cueballDirection to " + JSON.stringify(cueballDirection));
        gameSetup.cueballDirection = gameSetup.cueballDirection.normalize();
      } else {
      }
    };

    const onDragStart = (event) => { // cue ball drag
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;

      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        if (!gameSetup.activePlayerInfo.isLocal) return false;
        if (gameSetup.activePlayerInfo.playerType == "AI") return false;
      }

      const t = event.currentTarget;
      t.dragging = true;
      updateCueBall(event);
      event.stopped = true;
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      // event.stopPropegation();
      // const cb = gameSetup.cueball.body;
      // gameSetup.cueballDirection.x = event.data.global.x / gameSetup.stage.scale.x - cb.position[0];
      // gameSetup.cueballDirection.y = event.data.global.y / gameSetup.stage.scale.y - cb.position[1];
    };

    const onDragEnd = (event) => {
      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        if (!gameSetup.activePlayerInfo.isLocal) return false;
        if (gameSetup.activePlayerInfo.playerType == "AI") return false;
      }

      const t = event.currentTarget;
      // console.log("xxxxxxxxx end dragging...");
      t.dragging = false;
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      event.stopped = true;
    };

    const onDragMove = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        if (!gameSetup.activePlayerInfo.isLocal) return false;
        if (gameSetup.activePlayerInfo.playerType == "AI") return false;
      }

      const t = event.currentTarget;
      if (!t.dragging) return;
      // console.log("in dragging...");
      updateCueBall(event);
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      event.stopped = true;
    };

    gameSetup.cueball
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

  this.addBalls = () => {
    // gameSetup.ballBodyToID = {};


    //  Ball shadows
    this.shadows = []; // this.add.group();
    //  The balls

    this.balls = []; // this.add.physicsGroup(Phaser.Physics.P2JS);
    gameSetup.ballsByID = {};
    gameSetup.balls = this.balls;

    const config = gameSetup.config;

    let x = config.tableW / 4 - config.tableW * 0.1;

    this.makeBall(0 - config.tableW / 4, 0, Pool.WHITE, 0);

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      this.enableDraggingCueBall();
    }

    if (0) { // aaaaa
      const pp = gameSetup.tablePocket[3];
      const by = config.ballD / Math.sqrt(2);
      const disty = pp.y - by;
      const bx = pp.x - config.tableW / 4 - disty;
      this.makeBall(bx - 400, by - 0 * config.ballD - 100, Pool.RED, 2);
      return;
    }

    this.makeBall(x, 0, Pool.RED, 2);

    x += config.ballD * Math.sqrt(3) / 2;

    let y = config.ballD / 2;
    this.makeBall(x, y, Pool.RED, 3);
    this.makeBall(x, y - config.ballD, Pool.YELLOW, 4);


    x += config.ballD * Math.sqrt(3) / 2;

    y = config.ballD;
    this.makeBall(x, y - config.ballD, Pool.BLACK, 1);
    if (gameSetup.difficulty == BEGINNER) {
      // aaaaaa
      if (gameSetup.gameType == GAME_TYPE.AUTORUN || gameSetup.gameType == GAME_TYPE.REPLAY) {
        return;
      }
    } else {
    }
// aaaaaa
// return;

    this.makeBall(x, y, Pool.YELLOW, 5);
    this.makeBall(x, y - config.ballD * 2, Pool.RED, 6);
// return;

    if (gameSetup.difficulty == BEGINNER) {
      x += config.ballD * 0.94; //WHY?? aaaa
      // this.makeBall(x, y - config.ballD, Pool.YELLOW, 7);
      y = config.ballD * 1.5;
      this.makeBall(x, y, Pool.RED, 7);
      this.makeBall(x, y - config.ballD, Pool.YELLOW, 8);
      this.makeBall(x, y - config.ballD * 2, Pool.RED, 9);
      this.makeBall(x, y - config.ballD * 3, Pool.YELLOW, 10);

      x += 1 * config.ballD * Math.sqrt(3) / 2;
      y = config.ballD * 2;
      this.makeBall(x, 0, Pool.YELLOW, 11);

    } else {
      x += config.ballD * Math.sqrt(3) / 2;
      y = config.ballD * 1.5;
      this.makeBall(x, y, Pool.RED, 7);
      this.makeBall(x, y - config.ballD, Pool.YELLOW, 8);
      this.makeBall(x, y - config.ballD * 2, Pool.RED, 9);
      this.makeBall(x, y - config.ballD * 3, Pool.YELLOW, 10);

      x += config.ballD * Math.sqrt(3) / 2;
      y = config.ballD * 2;
      this.makeBall(x, y, Pool.YELLOW, 11);
      this.makeBall(x, y - config.ballD, Pool.RED, 12);
      this.makeBall(x, y - config.ballD * 2, Pool.YELLOW, 13);
      this.makeBall(x, y - config.ballD * 3, Pool.YELLOW, 14);
      this.makeBall(x, y - config.ballD * 4, Pool.RED, 15);
    }

    if (gameSetup.difficulty >= ADVANCED) {
      // add one more row of 6 balls
      x += config.ballD * Math.sqrt(3) / 2;
      y = config.ballD * 2.5;
      this.makeBall(x, y, Pool.RED, 16);
      this.makeBall(x, y - config.ballD, Pool.YELLOW, 17);
      this.makeBall(x, y - config.ballD * 2, Pool.RED, 18);
      this.makeBall(x, y - config.ballD * 3, Pool.YELLOW, 19);
      this.makeBall(x, y - config.ballD * 4, Pool.RED, 20);
      this.makeBall(x, y - config.ballD * 5, Pool.YELLOW, 21);
    }

    // gameSetup.cueball = this.makeBall(541.378 - config.tableCenterX, 217.8 - config.tableCenterY, Pool.WHITE, 0);

    // testing
    // gameSetup.cueball.body.reset(1354.9, 21300);
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
  this.addOpponentPoolStick = () => {
    const config = gameSetup.config;

    gameSetup.cuestickOpponentcontainer = new PIXI.Container();
    const mainItem = _.find(gameSetup.mainItems, ({userId}) => userId !== config.localPlayerID)
    const cueStick = _.get(mainItem, 'imageSrc.main', '/images/diamondstick.png');
    // const cueStick = _.get(gameSetup, 'opponentMainItems.imageSrc.main', '/images/diamondstick.png');
    const s = new PIXI.Sprite(PIXI.loader.resources[cueStick].texture);
    s.scale.set(1.1 * config.tableH / 800, 1.2 * config.tableH / 800); // will overflow on bottom
    // s.position.x = config.tableCenterX;
    // s.position.y = config.tableCenterY;
    gameSetup.stage.addChild(gameSetup.cuestickOpponentcontainer);
    gameSetup.cuestickOpponentcontainer.addChild(s);
    gameSetup.cuestickOpponent = s;

    s.position.x = 0;
    s.position.y = 0;
    s.anchor.set(0.5, 0);

    gameSetup.cuestickOpponentcontainer.position.x = gameSetup.cueball.position.x - 100000;
    gameSetup.cuestickOpponentcontainer.position.y = gameSetup.cueball.position.y;
    gameSetup.cuestickOpponentcontainer.pivot.x = 0;
    gameSetup.cuestickOpponentcontainer.pivot.y = 0;
    gameSetup.cuestickOpponentcontainer.rotation = 0/180 * Math.PI;
  }

  this.addPoolStick = () => {
    const config = gameSetup.config;

    gameSetup.cuestickyourcontainer = new PIXI.Container();
    let mainItem = _.find(gameSetup.mainItems, { userId: config.localPlayerID });
    if (!mainItem) {
      mainItem = gameSetup.mainItems;
    }
    let cueStick = _.get(mainItem, 'imageSrc.main', '/images/diamondstick.png');
    // let cueStick = _.get(gameSetup, 'mainItems.imageSrc.main', '/images/diamondstick.png');
    if (gameSetup.gameType == GAME_TYPE.REPLAY) {
      cueStick = "/images/Lightning_Strike.png";
    }
    const s = new PIXI.Sprite(PIXI.loader.resources[cueStick].texture);
    s.scale.set(1.2 * config.tableH / 800, 1.2 * config.tableH / 800); // will overflow on bottom
    // s.position.x = config.tableCenterX;
    // s.position.y = config.tableCenterY;
    gameSetup.stage.addChild(gameSetup.cuestickyourcontainer);
    gameSetup.cuestickyourcontainer.addChild(s);
    gameSetup.yourcuestick = s;


    s.position.x = 0;
    s.position.y = 0;
    s.anchor.set(0.5, 0);

    gameSetup.cuestickyourcontainer.position.x = gameSetup.cueball.position.x - 100000;
    gameSetup.cuestickyourcontainer.position.y = gameSetup.cueball.position.y;
    gameSetup.cuestickyourcontainer.pivot.x = 0;
    gameSetup.cuestickyourcontainer.pivot.y = 0;
    gameSetup.cuestickyourcontainer.rotation = 0/180 * Math.PI;
    gameSetup.cuestickcontainer = gameSetup.cuestickyourcontainer;
    gameSetup.cuestick = gameSetup.yourcuestick;
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

    let prevDeltaY = 0;
    gameSetup.mouseWheelHandler = (e) => {
      if (!gameSetup.controller) return;
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // gameSetup.placeBallSpeedY = -1;
      } else {
        if (e.deltaY * prevDeltaY > 0 ) {
          // no sound if same dir
        } else {
          gameSetup.playMagicSound();
        }
        prevDeltaY = e.deltaY;

        gameSetup.emitter.updateOwnerPos(gameSetup.speedMeterBall.position.x, gameSetup.speedMeterBall.position.y);
        gameSetup.emitter.emit = true;

        let acc = 1;
        if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
          acc = 10;
        }
        if (e.deltaY > 0) acc *= -1;

        gameSetup.speedMeterBall.value += 1 * 0.25 * acc;
        if (gameSetup.speedMeterBall.value >= 100) gameSetup.speedMeterBall.value = 100;
        if (gameSetup.speedMeterBall.value <= 2) gameSetup.speedMeterBall.value = 2;
        gameSetup.speedMeterBall.setPositionByValue(gameSetup.speedMeterBall.value);
      }
      // console.log("mouse event");
    };
    document.addEventListener("mousewheel", gameSetup.mouseWheelHandler, false);

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
          if (key.isUp && key.press) key.press(event.ctrlKey);
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

    gameSetup.turnChangeSpeed = 0;
    gameSetup.strengthChangeSpeed = 0;
    gameSetup.spinChangeSpeed = 0;
    gameSetup.hspinChangeSpeed = 0;

    //Capture the keyboard arrow keys
    const left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40),
        zkey = keyboard(90),
        skey = keyboard(83),
        xkey = keyboard(88),
        akey = keyboard(65),
        tabkey = keyboard(9),
        enterkey = keyboard(13);

    // w -> a
    // s -> s
    // a -> z
    // d -> x

    tabkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_SHOT_STATE || gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // gameSetup.controller.onPlaceButtonClick();
      } else {
        let dir = 1;
        if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.SHIFT)) {
          // dir = -1;
        }
        gameSetup.nextAutoTarget(dir);
      }
    };

    enterkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.activePlayerInfo.playerType == "AI") return;

      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        gameSetup.controller.onPlaceButtonClick();
      } else {
        gameSetup.controller.onStrikeButtonClick();
      }
    };

    // const testtarget = new Victor(0, 0);
    left.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        gameSetup.placeBallSpeedX = -1;
      } else {
        gameSetup.turnChangeSpeed = 1;
        gameSetup.playMagicSound();
      }

    };

    left.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.turnChangeSpeed = 0;
      gameSetup.placeBallSpeedX = 0;
    };


    //Right
    right.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // ? move cue ball??
        gameSetup.placeBallSpeedX = 1;
      } else {
        gameSetup.turnChangeSpeed = -1;
        gameSetup.playMagicSound();
      }
    };
    right.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.turnChangeSpeed = 0;
      gameSetup.placeBallSpeedX = 0;
    };

    //Up
    up.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // ? move cue ball??
        gameSetup.placeBallSpeedY = -1;
      } else {
        gameSetup.config.hideMessage();
        gameSetup.strengthChangeSpeed = 1;
        gameSetup.playMagicSound();
        gameSetup.speedMeterBallD.visible = false;
        gameSetup.speedMeterBall.visible = true;
      }
    };
    up.release = () => {
      gameSetup.speedMeterBall.visible = false;
      gameSetup.speedMeterBallD.visible = true;
      gameSetup.strengthChangeSpeed = 0;
      gameSetup.placeBallSpeedY = 0;
    };

    //Down
    down.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // ? move cue ball??
        gameSetup.placeBallSpeedY = 1;
      } else {
        gameSetup.config.hideMessage();
        gameSetup.strengthChangeSpeed = -1;
        gameSetup.playMagicSound();
        gameSetup.speedMeterBallD.visible = false;
        gameSetup.speedMeterBall.visible = true;
      }
    };
    down.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.speedMeterBall.visible = false;
      gameSetup.speedMeterBallD.visible = true;
      gameSetup.strengthChangeSpeed = 0;
      gameSetup.placeBallSpeedY = 0;
    };

    // vspin using w and s

    akey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      gameSetup.spinChangeSpeed = 1;
      gameSetup.playMagicSound();

      gameSetup.greenCrystall.visible = true;
      gameSetup.greenCrystallDark.visible = false;

    };

    akey.release = () => {
      gameSetup.spinChangeSpeed = 0;
      gameSetup.greenCrystallDark.visible = true;
      gameSetup.greenCrystall.visible = false;
    };

    skey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      gameSetup.spinChangeSpeed = -1;
      gameSetup.playMagicSound();
      gameSetup.greenCrystall.visible = true;
      gameSetup.greenCrystallDark.visible = false;

    };

    skey.release = () => {
      gameSetup.spinChangeSpeed = 0;
      gameSetup.greenCrystallDark.visible = true;
      gameSetup.greenCrystall.visible = false;
    };


    // hspin using a and d

    zkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      gameSetup.hspinChangeSpeed = 1;
      gameSetup.playMagicSound();
      gameSetup.yellowCrystallDark.visible = false;
      gameSetup.yellowCrystall.visible = true;

    };

    zkey.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.hspinChangeSpeed = 0;
      gameSetup.yellowCrystall.visible = false;
      gameSetup.yellowCrystallDark.visible = true;
    };

    xkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.config.hideMessage();
      gameSetup.hspinChangeSpeed = -1;
      gameSetup.playMagicSound();
      gameSetup.yellowCrystallDark.visible = false;
      gameSetup.yellowCrystall.visible = true;

    };

    xkey.release = () => {
      gameSetup.hspinChangeSpeed = 0;
      gameSetup.yellowCrystall.visible = false;
      gameSetup.yellowCrystallDark.visible = true;

    };


  };

  const knobAreas = [];

  this.setupMeterClick = () => {
    const updateKnob = (t, lowv, highv, initv, highy, lowy, floorv) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;

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
      t.brother.position.y = t.position.y;
      gameSetup.emitter.updateOwnerPos(t.position.x,t.position.y);
      gameSetup.emitter.emit = true;
      gameSetup.playMagicSound();

      const ratio2 = (highy - t.position.y) /(highy - lowy);
      t.value = lowv + (highv - lowv) * ratio2;
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
          event.currentTarget = a.knob;
          gameSetup.onBallDragStart(event);
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
          max: 1
        },
        frequency: 0.004,
        spawnChance: 1,
        particlesPerWave: 1,
        emitterLifetime: 0.5,
        maxParticles: 2000,
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
    knob.brother.alpha = 0.8;
    knob.knobArea = knobAreas[knobAreas.length-1];

    gameSetup.controlButtons.push(knob);
    knob.interactive = true;
    knob.buttonMode = true;
    // knob.cfg = cfg;



    const onDragStart = (event) => { // meter ball
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        if (!gameSetup.activePlayerInfo.isLocal) return false;
        if (gameSetup.activePlayerInfo.playerType == "AI") return false;
      }

      gameSetup.yellowCrystall.dragging = false;
      gameSetup.blueCrystall.dragging = false;
      gameSetup.greenCrystall.dragging = false;

      let t = event.currentTarget;
      if (t.brother == gameSetup.yellowCrystall) t = t.brother;
      if (t.brother == gameSetup.greenCrystall) t = t.brother;
      if (t.brother == gameSetup.blueCrystall) t = t.brother;
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
      t.dragging = true;
      gameSetup.playMagicSound();

    };

    gameSetup.onBallDragStart = onDragStart;

    const onDragEnd = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      let t = event.currentTarget;
      // this.alpha = 1;
      if (t.brother == gameSetup.yellowCrystall) t = t.brother;
      if (t.brother == gameSetup.greenCrystall) t = t.brother;
      if (t.brother == gameSetup.blueCrystall) t = t.brother;
      if (t.dragging) {
        t.dragging = false;
        if (t.brother && !t.mouseIn) { // crystall ball
          t.visible = false;
          t.brother.visible = true;
        }
      }
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
      t.brother.position.y = t.position.y;
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
      let t = event.currentTarget;
      if (t.brother == gameSetup.yellowCrystall) t = t.brother;
      if (t.brother == gameSetup.greenCrystall) t = t.brother;
      if (t.brother == gameSetup.blueCrystall) t = t.brother;
      if (event.data.buttons == 0) {
        onDragEnd(event);
        return;
      }
      if (t.dragging) {



        // let pointerChgX = event.data.originalEvent.clientX - t.dragStartPointerX; // getLocalPosition(this.parent);
        // if (typeof(event.data.originalEvent.clientX) == "undefined") {
        //   pointerChgX = event.data.originalEvent.targetTouches[0].clientX - t.dragStartPointerX; // getLocalPosition
        // }
        // console.log("pointerchgx " + pointerChgX + " vs " + (gameSetup.config.tableW * 0.03));
        // if (Math.abs(pointerChgX) >= gameSetup.config.tableW * 0.03) {
        //   onDragEnd(event);
        //   return;
        // }

        let centerX = (t.vertexData[0] + t.vertexData[2]) / 2;
        let buttonW = t.vertexData[2] - t.vertexData[0];
        let xChg = Math.abs(event.data.originalEvent.offsetX - centerX);
        // console.log("xChg " + xChg);
        if (Math.abs(xChg) >= buttonW) {
          onDragEnd(event);
          return;
        }


        // let centerY = (t.vertexData[1] + t.vertexData[5]) / 2;
        // let buttonH = t.vertexData[5] - t.vertexData[1];
        // let yChg = Math.abs(event.data.originalEvent.clientY - centerY);
        // console.log("yChg " + yChg);
        // if (Math.abs(yChg) >= buttonH*2) {
        //   onDragEnd(event);
        //   return;
        // }


        let pointerChg = event.data.originalEvent.clientY - t.dragStartPointerY; // getLocalPosition(this.parent);
        if (typeof(event.data.originalEvent.clientY) == "undefined") {
          pointerChg = event.data.originalEvent.targetTouches[0].clientY - t.dragStartPointerY; // getLocalPosition(this.parent);
        }
        // console.log(event.data.originalEvent.clientY + " - " + t.dragStartPointerY + " = " + pointerChg);
        pointerChg = pointerChg / gameSetup.stage.scale.y;
        t.position.y = t.dragStartPosY + pointerChg;
        // t.brother.position.y = t.position.y;
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
        .on('pointerdown', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('pointerup', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove);
    knob.position.y = highy - (initv - lowv) / (highv - lowv) * (highy - lowy);

    knob.setPositionByValue = (v) => {
      knob.position.y = highy - (v - lowv) / (highv - lowv) * (highy - lowy);
      knob.brother.position.y = knob.position.y;
    };
  };

  this.addVSpinBallNew = () => {
    const config = gameSetup.config;
    let ratio = (config.TrueWidth * 0.035) / 54;

    // dark
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/anniu1_2.png"].texture);

    bg2.scale.set(ratio* 1.4, ratio); // will overflow on bottom

    bg2.position.x = -3 + (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.256;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "vspinball";
    bg2.buttonMode = true;
    bg2.interactive = true;

    // bright
    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/anniu1_1.png"].texture);

    bg2b.scale.set(ratio* 1.4, ratio); // will overflow on bottom

    bg2b.position.x = bg2.position.x; //-1 + (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.256;
    bg2b.position.y = bg2.position.y; //config.TrueHeight - config.TrueHeight * 0.144;
    bg2b.anchor.set(0.5, 0.5);
    bg2b.name = "vspinballb";
    bg2b.visible = false;
    bg2b.buttonMode = true;
    bg2b.interactive = true;

    bg2.mouseover = function(mouseData) {
      // if (bg2.visible) {
        bg2.visible = false;
        bg2b.visible = true;
        bg2.interactive = true;
        bg2b.interactive = true;
      // }
    }
    bg2b.mouseout = function(mouseData) {
      if (!bg2b.dragging) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = true;
      }
    };


    gameSetup.greenCrystall = bg2b;
    gameSetup.greenCrystallDark = bg2;
    gameSetup.greenCrystall.brother = bg2;
    gameSetup.greenCrystallDark.brother = bg2b;

    this.addKnob(bg2b, -1, 1, 0, config.TrueHeight - config.TrueHeight * 0.514, config.TrueHeight - config.TrueHeight * 0.785, -1, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    this.addKnob(bg2, -1, 1, 0, config.TrueHeight - config.TrueHeight * 0.514, config.TrueHeight - config.TrueHeight * 0.785, -1, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);

    bg2b.setPositionByValue(0);
    bg2b.valueLow = -1;
    bg2b.valueHigh = 1;


    gameSetup.spinMeterBar = bg2b;
    gameSetup.stage.addChild(bg2);
    gameSetup.stage.addChild(bg2b);
  };

  this.addHSpinBallNew = () => {
    const config = gameSetup.config;

    let ratio = (config.TrueWidth * 0.035) / 54;
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      //   ratio = (config.TrueWidth * 0.06) / 100;
      // }
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/anniu2_2.png"].texture);
    bg2.scale.set(ratio* 1.4, ratio); // will overflow on bottom

    bg2.position.x = -3 + (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.255;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "hspinball";
    bg2.buttonMode = true;
    bg2.interactive = true;

    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/anniu2_1.png"].texture);
    bg2b.scale.set(ratio* 1.4, ratio); // will overflow on bottom

    bg2b.position.x = bg2.position.x; // -4 + (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.255;
    bg2b.position.y = bg2.position.y; //config.TrueHeight - config.TrueHeight * 0.144;
    bg2b.anchor.set(0.5, 0.5);
    bg2b.name = "hspinballb";
    bg2b.visible = false;
    bg2b.buttonMode = true;
    bg2b.interactive = true;


    bg2.mouseover = function(mouseData) {
      // if (bg2.visible) {
        bg2.visible = false;
        bg2b.visible = true;
        bg2.interactive = true;
        bg2b.interactive = true;
      // }
    }
    bg2b.mouseout = function(mouseData) {
      if (!bg2b.dragging) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = true;
      }
    }




    gameSetup.yellowCrystall = bg2b;
    gameSetup.yellowCrystallDark = bg2;
    gameSetup.yellowCrystall.brother = bg2;
    gameSetup.yellowCrystallDark.brother = bg2b;

    this.addKnob(bg2b, -30, 30, 0, config.TrueHeight - config.TrueHeight * 0.07, config.TrueHeight - config.TrueHeight * 0.35, -30, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    this.addKnob(bg2, -30, 30, 0, config.TrueHeight - config.TrueHeight * 0.07, config.TrueHeight - config.TrueHeight * 0.35, -30, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    bg2b.setPositionByValue(0);
    bg2b.valueLow = -30;
    bg2b.valueHigh = 30;

    gameSetup.spinMeterBarH = bg2b;
    gameSetup.stage.addChild(bg2);
    gameSetup.stage.addChild(bg2b);
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
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   maxr = (gameSetup.config.TrueWidth * 0.06) / 2;
    // }


    const emitter = addEmitter(ec, maxr + 3);
    // emitter.container.position.x = 100;
    // emitter.container.position.y = 100;
    // emitter.visible = true;
    // emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);
    emitter.emit = false;
    gameSetup.emitter = emitter;
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


  this.addStrengthBallNew = () => {
    const config = gameSetup.config;
    let ratio = (config.TrueWidth * 0.035) / 54;
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   ratio = (config.TrueWidth * 0.06) / 100;
    // }

    // dark one
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/anniu3_2.png"].texture);
    bg2.scale.set(ratio* 1.4, ratio); // will overflow on bottom
    bg2.position.x = 3 + config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.249;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.3;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "speedball";
    bg2.interactive = true;
    bg2.buttonMode = true;
    gameSetup.stage.addChild(bg2);

    // bright one
    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/anniu3_1.png"].texture);
    bg2b.scale.set(ratio * 1.4, ratio); // will overflow on bottom
    bg2b.position.x = bg2.position.x; //3 + config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.249;
    bg2b.position.y = bg2.position.y; // config.TrueHeight - config.TrueHeight * 0.3;
    bg2b.anchor.set(0.5, 0.5);
    bg2b.name = "speedball2";
    // bg2.interactive = true;
    bg2b.buttonMode = true;
    bg2b.visible = false;
    gameSetup.blueCrystall = bg2b;
    gameSetup.stage.addChild(bg2b);


    bg2.mouseover = function(mouseData) {
      // if (bg2.visible) {
        bg2.visible = false;
        bg2b.visible = true;
        bg2.interactive = true;
        bg2b.interactive = true;
        bg2b.mouseIn = true;
      // }

      if (mouseData.data.buttons > 0) {
        if (mouseData.data.button == 0) {
          gameSetup.onBallDragStart(mouseData);
        }
      }

    }
    bg2b.mouseout = function(mouseData) {
      bg2b.mouseIn = false;
      if (!bg2b.dragging) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = true;
      } else {

      }
    }



    gameSetup.speedMeterBall = bg2b;
    gameSetup.speedMeterBall.brother = bg2;
    gameSetup.speedMeterBallD = bg2;
    gameSetup.speedMeterBallD.brother = bg2b;

    let initvalue = 70;
    if (gameSetup.difficulty == ADVANCED) initvalue = 85;
    this.addKnob(bg2b, 0, 100, initvalue, config.TrueHeight - config.TrueHeight * 0.06, config.TrueHeight - config.TrueHeight * 0.532, 2, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    this.addKnob(bg2, 0, 100, initvalue, config.TrueHeight - config.TrueHeight * 0.06, config.TrueHeight - config.TrueHeight * 0.532, 2, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    bg2b.setPositionByValue(initvalue);
    bg2b.valueLow = 2;
    bg2b.valueHigh = 100;
  };

  this.initializeForecastG = () => {
    if (!gameSetup.forecastG) {
      gameSetup.forecastG = new PIXI.Graphics();
      gameSetup.forecastG.zOrder = 50;
      gameSetup.stage.addChild(gameSetup.forecastG);
    }
  };

  this.addHelpQuestionMark = () => {
    const config = gameSetup.config;

    // controls help box
    let bg, ratio;

    if (false && (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) ) {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/controlsandrulessmall.png"].texture);
      ratio = (config.tableW * 1.05) / 800;
    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/controlsandrules.png"].texture);
      ratio = (config.tableW * 1.05) / 1417;
    }
    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.position.x = config.tableCenterX;
    bg.position.y = config.tableCenterY - config.tableH * 0.016;
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
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myhelpbtn1.png"].texture);
    ratio = 140/159;
    bg2.scale.set(ratio * 1, ratio); // will overflow on bottom
    bg2.position.x = 120;
    bg2.position.y = 115;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    bg2.buttonMode = true;
    bg2.visible = true;

    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myhelpbtn0.png"].texture);
    bg2b.scale.set(ratio * 1, ratio); // will overflow on bottom
    bg2b.position.x = bg2.position.x;
    bg2b.position.y = bg2.position.y;
    bg2b.anchor.set(0.5, 0.5);
    bg2b.interactive = false;
    bg2b.buttonMode = true;
    bg2b.visible = false;

    bg2.mouseover = function(mouseData) {
      if (bg2.visible) {
        bg2.visible = false;
        bg2b.visible = true;
        bg2.interactive = false;
        bg2b.interactive = true;
      }
    }
    bg2b.mouseout = function(mouseData) {
      if (bg2b.visible) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = false;
      }
    }

    gameSetup.stage.addChild(bg2);
    gameSetup.stage.addChild(bg2b);

    const helpButtonPointerDown = () => {
      if (bg.visible) {
        bg.visible = false;
        bg.interactive = false;
      } else {
        bg.visible = true;
        bg.interactive = true;
      }
    };

    bg2b.on('pointerdown', helpButtonPointerDown);
    bg2.on('pointerdown', helpButtonPointerDown);

  };



  // new vertical
  this.addCWNew = () => {
    const config = gameSetup.config;


    let ratio = (config.TrueHeight * 0.14 / 1.5) / 90;
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   ratio = ratio * 1.2;
    // }

    const ga = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/1_2.png"].texture);
    ga.scale.set(ratio, ratio); // will overflow on bottom

    ga.position.x = config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    ga.position.y = 300; //config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) - config.TrueHeight * 0.005;
    ga.anchor.set(0.5, 0.5);
    ga.interactive = true;
    gameSetup.stage.addChild(ga);
    gameSetup.controlButtons.push(ga);


    const ga2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/1_1.png"].texture);
    ga2.scale.set(ratio, ratio); // will overflow on bottom

    ga2.position.x = ga.position.x;// config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    ga2.position.y = ga.position.y; //config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) - config.TrueHeight * 0.005;
    ga2.anchor.set(0.5, 0.5);
    ga2.interactive = true;
    ga2.visible = false;
    gameSetup.stage.addChild(ga2);
    gameSetup.controlButtons.push(ga2);


    ga.mouseover = function(mouseData) {
      if (ga.visible) {
        ga.visible = false;
        ga2.visible = true;
        ga.interactive = false;
        ga2.interactive = true;
      }
    }
    ga2.mouseout = function(mouseData) {
      if (ga2.visible) {
        ga.visible = true;
        ga2.visible = false;
        ga.interactive = true;
        ga2.interactive = false;
      }
    }



    gameSetup.autoBtn = ga;
    gameSetup.autoBtn2 = ga2;
    ga.buttonMode = true;
    ga2.buttonMode = true;


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
        if (ids.length > 2 && legalColor == null) {
          if (ids[j] == 1) continue;
        }
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

    const calcMinDir = (targetID, hasToBeSmall) => {
      const targetBall = gameSetup.ballsByID[targetID];
      const cueball = gameSetup.ballsByID[0];
      // let maxPocketID = null;
      const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);

      let minAngleDiff = Math.PI / 180 * 70;
      if (!hasToBeSmall) {
        minAngleDiff = Math.PI * 2;
      }
      // let dirx = 0; let diry = 0;
      let minDir = null;
      const cueballPos = new Victor(gameSetup.cueball.position.x, gameSetup.cueball.position.y);
      // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
      for (let pocketID=0; pocketID<6; pocketID++) {
        let pocketPos = gameSetup.tablePocket[pocketID].clone();
        const pocketCenter = gameSetup.tablePocket3[pocketID].clone();
        const pocketAimDist = pocketPos.distance(pocketCenter.clone());
        const pocketTargetDist = targetBallPos.clone().distance(pocketCenter.clone());
        if (pocketAimDist > pocketTargetDist) {
          pocketPos = gameSetup.tablePocket3[pocketID].clone();
        }
        const dirBallToPocket = pocketPos.clone().subtract(targetBallPos);
        const dirAimToBall = dirBallToPocket.normalize().scale(config.ballD);
        const aimPos = targetBallPos.clone().subtract(dirAimToBall);
        const dirCueBallToAim = aimPos.clone().subtract(cueballPos);
        if (pocketID == 1 || pocketID == 4) {
          const line1 = targetBallPos.clone().subtract(pocketPos);
          const angle1 = line1.angleDeg();
          const angle2 = pocketID == 1 ? 90 : -90;
          let angleDiff = Math.abs(angle1 - angle2);

          if (angleDiff > 50) continue;
        }

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

          // aaaaa wait until aiming is always on target
          // gameSetup.pocketingStar.x = pocketPos.x;
          // gameSetup.pocketingStar.y = pocketPos.y;
          // gameSetup.pocketingStar.scale.x = 0.1;
          // gameSetup.pocketingStar.scale.y = 0.1;

        }
      }
      return minDir;
    }

    gameSetup.nextAutoTarget = (dir=1) => {
      gameSetup.playMagicSound();
      gameSetup.emitter.updateOwnerPos(ga.position.x, ga.position.y);
      gameSetup.emitter.emit = true;

      let b = gameSetup.firstBallTouchedByCueball;

      let counter = 0;
      let nextMinDir = null;
      const ids = Object.keys(gameSetup.ballsByID);

      if (gameSetup.activePlayerInfo.legalColor == null && ids.length > 1) {
        if (b != null && b.ID == 1)
          b = null;
      }

      while (counter <= ids.length) {
        counter ++;
        if (b == null || ( gameSetup.activePlayerInfo.legalColor != null && gameSetup.activePlayerInfo.legalColor != b.colorType)) {
          b = findNextBall(gameSetup.activePlayerInfo.legalColor, -1, dir);
        } else {
          const currentMinDir = calcMinDir(b.ID, true);
          if (currentMinDir == null) {
            // blocked!
            b = findNextBall(gameSetup.activePlayerInfo.legalColor, b.ID, dir);
            continue;
          }
          if (currentMinDir.x == gameSetup.cueballDirection.x && currentMinDir.y == gameSetup.cueballDirection.y) {
            // need to jump to aim next ball
            b = findNextBall(gameSetup.activePlayerInfo.legalColor, b.ID, dir);
          } else {
            // just need to adjust aiming for current ball
            gameSetup.cueballDirection.x = currentMinDir.x;
            gameSetup.cueballDirection.y = currentMinDir.y;
            return;
          }
        }
        nextMinDir = calcMinDir(b.ID, true);
        if (nextMinDir != null) break;
      }

      if (nextMinDir != null) {
        gameSetup.cueballDirection.x = nextMinDir.x;
        gameSetup.cueballDirection.y = nextMinDir.y;
      } else {
        // can't find a good one, so just find a bad one

        counter = 0;
        b = null;
        while (counter <= ids.length) {
          counter ++;
          if (b == null || ( gameSetup.activePlayerInfo.legalColor != null && gameSetup.activePlayerInfo.legalColor != b.colorType)) {
            b = findNextBall(gameSetup.activePlayerInfo.legalColor, -1, dir);
          } else {
            const currentMinDir = calcMinDir(b.ID, false);
            if (currentMinDir == null) {
              // blocked!
              b = findNextBall(gameSetup.activePlayerInfo.legalColor, b.ID, dir);
              continue;
            }
            if (currentMinDir.x == gameSetup.cueballDirection.x && currentMinDir.y == gameSetup.cueballDirection.y) {
              // need to jump to aim next ball
              b = findNextBall(gameSetup.activePlayerInfo.legalColor, b.ID, dir);
            } else {
              // just need to adjust aiming for current ball
              gameSetup.cueballDirection.x = currentMinDir.x;
              gameSetup.cueballDirection.y = currentMinDir.y;
              return;
            }
          }
          nextMinDir = calcMinDir(b.ID, false);
          if (nextMinDir != null) break;
        }

        if (nextMinDir != null) {
          gameSetup.cueballDirection.x = nextMinDir.x;
          gameSetup.cueballDirection.y = nextMinDir.y;
        }

      }


    };

    gameSetup.nextAutoTargetEvent = () => {
      gameSetup.nextAutoTarget(1);
    };

    ga.on('pointerdown', gameSetup.nextAutoTargetEvent);
    ga2.on('pointerdown', gameSetup.nextAutoTargetEvent);


    // counter clock fine tune

    ratio = (config.tableH * 0.14 / 1.1) / 90;
    // if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
    //   ratio = ratio * 1.2;
    // }

    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/2-2.png"].texture);
    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.tint = 0xffffff;

    bg.position.x = ga.position.x; // config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    bg.position.y = ga.position.y + 130; //config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.175;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = true;
    gameSetup.controlButtons.push(bg);
    gameSetup.ccwControl = bg;
    bg.buttonMode = true;

    const bgb = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/2-1.png"].texture);
    bgb.scale.set(ratio, ratio); // will overflow on bottom
    bgb.tint = 0xffffff;

    bgb.position.x = bg.position.x; // config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    bgb.position.y = bg.position.y; //config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.175;
    bgb.anchor.set(0.5, 0.5);
    bgb.interactive = true;
    gameSetup.controlButtons.push(bgb);
    gameSetup.ccwControlb = bgb;
    bgb.buttonMode = true;
    bgb.visible = false;


    bg.mouseover = function(mouseData) {
      if (bg.visible) {
        bg.visible = false;
        bgb.visible = true;
        bg.interactive = false;
        bgb.interactive = true;
      }
    }
    bgb.mouseout = function(mouseData) {
      if (bgb.visible) {
        bg.visible = true;
        bgb.visible = false;
        bg.interactive = true;
        bgb.interactive = false;
      }
    }

    const pointerDown = turnChangeSpeed => () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.turnChangeSpeed = turnChangeSpeed;
      gameSetup.playMagicSound();
    };
    const pointerUp = () => {
      gameSetup.turnChangeSpeed = 0;
    };

    bgb.on('pointerdown', pointerDown(1));
    bg.on('pointerdown', pointerDown(1));
    bgb.on('pointerup', pointerUp);
    bg.on('pointerup', pointerUp);

    gameSetup.stage.addChild(bg);
    gameSetup.stage.addChild(bgb);




    // clock wise

    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/3_2.png"].texture);

    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = bg.position.x;
    bg2.position.y = bg.position.y + 100; // config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.28;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    gameSetup.controlButtons.push(bg2);
    gameSetup.cwControl = bg2;
    bg2.buttonMode = true;


    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/3_1.png"].texture);

    bg2b.scale.set(ratio, ratio); // will overflow on bottom

    bg2b.position.x = bg2.position.x;
    bg2b.position.y = bg2.position.y; // config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.28;
    bg2b.anchor.set(0.5, 0.5);
    bg2b.interactive = true;
    gameSetup.controlButtons.push(bg2b);
    gameSetup.cwControlb = bg2b;
    bg2b.buttonMode = true;
    bg2b.visible = false;


    bg2.mouseover = function(mouseData) {
      if (bg2.visible) {
        bg2.visible = false;
        bg2b.visible = true;
        bg2.interactive = false;
        bg2b.interactive = true;
      }
    }
    bg2b.mouseout = function(mouseData) {
      if (bg2b.visible) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = false;
      }
    }


    bg2b.on('pointerdown', pointerDown(-1));
    bg2.on('pointerdown', pointerDown(-1));
    bg2b.on('pointerup', pointerUp);
    bg2.on('pointerup', pointerUp);
    gameSetup.stage.addChild(bg2);
    gameSetup.stage.addChild(bg2b);

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
      gameSetup.cueballDirection.rotate(0 - acc * Math.PI * dir / (256 * 180)); // 1 / 32 degree per click
    };



    // this.addControlLable('Direction', (bg2.position.x + bg.position.x)*0.5 - config.TrueWidth * 0.1, bg.position.y);
  };





  this.addSpinBall = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/spintargetballpanel2.png"].texture);

    let ratio = (config.TrueWidth * 0.09) / 166;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.TrueWidth - (config.TrueWidth - (config.tableW + 2 * config.metalBorderThick)) * 0.5;
    bg.position.y = config.tableCenterY - config.tableH * 0.15;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = false;
    gameSetup.stage.addChild(bg);


    // yellow target

    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/yellowspintarget.png"].texture);

    ratio = (config.TrueWidth * 0.055) / 140;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth - (config.TrueWidth - (config.tableW + 2 * config.metalBorderThick)) * 0.5;
    bg2.position.y = config.tableCenterY - config.tableH * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    gameSetup.stage.addChild(bg2);
  };


  this.addQuitButton = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myquitbtn1.png"].texture);
    let ratio = (140) / 159;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.tableCenterX - config.tableW/2 - config.metalBorderThick + 10;
    bg.position.y = 115;
    bg.anchor.set(0, 0.5);
    bg.interactive = true;
    bg.buttonMode = true;
    bg.visible = true;


    const bgb = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myquitbtn0.png"].texture);
    bgb.scale.set(ratio, ratio); // will overflow on bottom

    bgb.position.x = config.tableCenterX - config.tableW/2 - config.metalBorderThick + 10;
    bgb.position.y = 115;
    bgb.anchor.set(0, 0.5);
    bgb.interactive = false;
    bgb.buttonMode = true;
    bgb.visible = false;


    bg.mouseover = function(mouseData) {
      if (bg.visible) {
        bgb.visible = false;
        bgb.visible = true;
        bg.interactive = false;
        bgb.interactive = true;
      }
    }
    bgb.mouseout = function(mouseData) {
      if (bgb.visible) {
        bg.visible = true;
        bgb.visible = false;
        bg.interactive = true;
        bgb.interactive = false;
      }
    }


    gameSetup.stage.addChild(bg);
    gameSetup.stage.addChild(bgb);
    // gameSetup.controlButtons.push(bg);


    // exit warning message
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/exitwarning2.png"].texture);
    ratio = (config.tableW * 0.95) / 1000;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.tableCenterX;
    bg2.position.y = config.tableCenterY;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;
    gameSetup.stage.addChild(bg2);
    gameSetup.warningSign = bg2;

    // add 2 buttons

    const bg3 = new PIXI.Sprite(PIXI.loader.resources["/images/quitbtn.png"].texture);
    ratio = (config.tableW * 0.103) / 242;
    bg3.scale.set(ratio, ratio); // will overflow on bottom
    bg3.position.x = config.tableCenterX - config.tableW * 0.15;
    bg3.position.y = config.tableCenterY + config.tableH * 0.12;
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
      if (_.get(gameSetup, 'room.playerInfo[1].userId') == Meteor.userId()) {
        id = 1;
      }
      if (gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.AUTORUN) {
        gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});
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

    bgb.on('pointerdown', gameSetup.showExitWarning);
    bg.on('pointerdown', gameSetup.showExitWarning);
    bg3.on('pointerdown', gameSetup.exitBtnHandler);
    bg4.on('pointerdown', gameSetup.hideExitWarning);
  };







  this.addHitButton = () => {
    const config = gameSetup.config;

    const ratio = (140) / 159;

    // dark
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myplacebtn1a.png"].texture);
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = (config.tableCenterX + config.tableW/2 + config.metalBorderThick) - 10;
    bg2.position.y = 115;
    bg2.anchor.set(1, 0.5);
    bg2.interactive = true;
    bg2.buttonMode = true;

    const bg2b = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myplacebtn0a.png"].texture);
    bg2b.scale.set(ratio, ratio); // will overflow on bottom

    bg2b.position.x = bg2.position.x;
    bg2b.position.y = bg2.position.y;
    bg2b.anchor.set(1, 0.5);
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
    // bg2.mouseout = function(mouseData) {
    //   if (bg2b.visible) {
    //     bg2.visible = true;
    //     bg2b.visible = false;
    //     bg2.interactive = true;
    //     bg2b.interactive = false;
    //   }
    // }
    // bg2b.mouseover = function(mouseData) {
    //   if (bg2.visible) {
    //     bg2.visible = false;
    //     bg2b.visible = true;
    //     bg2.interactive = false;
    //     bg2b.interactive = true;
    //   }
    // }
    bg2b.mouseout = function(mouseData) {
      if (bg2b.visible) {
        bg2.visible = true;
        bg2b.visible = false;
        bg2.interactive = true;
        bg2b.interactive = true;
      }
    }


    bg2b.on('pointerdown', gameSetup.controller.onPlaceButtonClick);
    bg2.on('pointerdown', gameSetup.controller.onPlaceButtonClick);
    gameSetup.stage.addChild(bg2b);
    gameSetup.stage.addChild(bg2);
    // gameSetup.controlButtons.push(bg2);

    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myhitbtn1.png"].texture);
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = bg2.position.x;
    bg.position.y = bg2.position.y;
    bg.anchor.set(1, 0.5);
    bg.interactive = true;
    bg.buttonMode = true;

    const bgb = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/myhitbtn0.png"].texture);
    bgb.scale.set(ratio, ratio); // will overflow on bottom

    bgb.position.x = bg.position.x;
    bgb.position.y = bg.position.y;
    bgb.anchor.set(1, 0.5);
    bgb.interactive = true;
    bgb.buttonMode = true;
    bgb.visible = false;


    bg.mouseover = function(mouseData) {
      if (bg.visible) {
        bg.visible = false;
        bgb.visible = true;
        // bg.interactive = true;
        // bgb.interactive = true;
      }
    }

    bgb.mouseout = function(mouseData) {
      if (bgb.visible) {
        bg.visible = true;
        bgb.visible = false;
        // bg.interactive = true;
        // bgb.interactive = false;
      }
    }

    bgb.on('pointerdown', gameSetup.controller.onStrikeButtonClick);
    bg.on('pointerdown', gameSetup.controller.onStrikeButtonClick);
    gameSetup.controlButtons.push(bgb);
    gameSetup.controlButtons.push(bg);

    gameSetup.stage.addChild(bg);
    gameSetup.stage.addChild(bgb);
    gameSetup.hitButton = bg;
    gameSetup.placeButton = bg2;
    gameSetup.hitButton.visible = false;
    gameSetup.placeButton.visible = false;
    gameSetup.hitButton2 = bgb;
    gameSetup.placeButton2 = bg2b;

    gameSetup.toggleHitButton = (showHit) => {
      if (showHit) {
        if (gameSetup.hitButton.visible || gameSetup.hitButton2.visible) return;
        gameSetup.hitButton.visible = true;
        gameSetup.hitButton.interactive = true;
        gameSetup.placeButton.visible = false;
        gameSetup.hitButton2.visible = true;
        gameSetup.hitButton2.interactive = true;
        gameSetup.placeButton2.visible = false;
        gameSetup.hitButton.interactive = true;
        // gameSetup.placeButton.interactive = false;
      } else {
        if (gameSetup.placeButton.visible || gameSetup.placeButton2.visible) return;
        gameSetup.placeButton.visible = true;
        gameSetup.placeButton2.visible = true;
        gameSetup.placeButton.interactive = true;
        gameSetup.placeButton2.interactive = true;
        gameSetup.hitButton.visible = false;
        gameSetup.hitButton2.visible = false;
        // gameSetup.hitButton.interactive = false;
      }
    };
  };



  this.addModalMessageScreen = () => {
    const config = gameSetup.config;

    // game over message background
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/tishi.png"].texture);
    let ratio = (config.tableW * 1) / 1000;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.tableCenterX;
    bg2.position.y = config.tableCenterY;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;

    // message header
    const style2 = new PIXI.TextStyle({
      //fontFamily:  "\"Droid Sans\", sans-serif",
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: config.tableW / 90,
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
    headerText.y = 0 - config.tableH * 0.02;
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
      fontSize: config.tableW / 120,
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
    msgText.y = 0 + config.tableH * 0.02;
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
      // bg3.visible = false; bg4.visible = false; bg3.interactive = false; bg4.interactive = false;
    };

    gameSetup.exitBtnHandler = () => {
      // gameSetup.hideModalMessage();
      gameSetup.hideExitWarning();
      // let id = gameSetup.activePlayerInfo.ID;
      // if (gameSetup.activePlayerInfo.isLocal) {
      //   id = gameSetup.activePlayerInfo.ID;
      // }

      if (gameSetup.renderer && gameSetup.renderer.plugins && gameSetup.renderer.plugins.interaction)
        gameSetup.renderer.plugins.interaction.destroy();

      if (gameSetup.room && gameSetup.room._id) {
        PoolActions.leavingGame(gameSetup.room._id, gameSetup.localPlayerID, false);
      }
      if (!gameSetup.networkHandler) {
        console.log("in exitBtnHandler with no gameSetup.networkHandler");
        // have not setup game room yet
        if (gameSetup.isLocal) {
          if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
            const cmdstr = `ExitGameRoom;${gameSetup.currentCycleTime};0`;
            this.saveCommand(cmdstr);
          }
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
            //   PoolActions.finishTournamentSectionRound(
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
          case GAME_TYPE.BATTLE:
            gameSetup.reacthistory.push('/leaderboard');
            break;
        }
      }
      let id = 0;
      if (_.get(gameSetup, 'room.playerInfo[1].userId') == Meteor.userId()) {
        id = 1;
      }

      // console.log("ExitGameRoom sent from " + id);
      if (gameSetup.networkHandler) gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});


      if (gameSetup.sounds) gameSetup.sounds.backgroundmusic.stop();
      if (window.gameSetup) window.gameSetup.showModalMessage(`Exiting Game`, `You have chosen to exit the game room.`, MODAL_NOBUTTON);

    };

    exitbtn.on('pointerdown', gameSetup.exitBtnHandler);

    const replayBtnHandler = () => {
      gameSetup.hideModalMessage();
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
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/starback3.jpg"].texture);

    bg.scale.set(config.TrueWidth/1841, config.TrueHeight / 1050); // will overflow on bottom

    bg.position.x = 0;
    bg.position.y = 0;
    bg.anchor.set(0, 0);
    bg.interactive = true;
    bg.name = "bluebackground";
    gameSetup.stage.addChild(bg);

    gameSetup.bluebackground = bg;
  };

  this.addTableImage = () => {

    let bgitems = gameSetup.backgroundItems;
    if (gameSetup.backgroundItems.length > 0) {
      for (let k=0; k<gameSetup.backgroundItems.length; k++) {
        bgitems = gameSetup.backgroundItems[k];
        if (bgitems.gameId == "uN9W4QhmdKu94Qi2Y") {
          break;
        }
      }
    }

    const poolTableBig = _.get(bgitems, 'imageSrc.main', '/images/diamondpoolbig.png');
    let poolTableSmall = _.get(bgitems, 'imageSrc.small', '/images/diamondpoolsmall.png');

    // const poolTableBig = _.get(gameSetup, 'backgroundItems.imageSrc.main', '/images/diamondpoolbig.png');
    // let poolTableSmall = _.get(gameSetup, 'backgroundItems.imageSrc.small', '/images/diamondpoolsmall.png');
    if (gameSetup.gameType == GAME_TYPE.REPLAY) {
      poolTableSmall = "/images/Lightning_Night_Small.png";
    }
    //const poolTableSmall = '/images/rt.png';
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    let bg, w, h;
    // console.log('gameType', gameSetup.gameType);
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      bg = new PIXI.Sprite(PIXI.loader.resources[poolTableSmall].texture);
      //w = 1012 * 1.0; h = 464 * 1.0;
      w = 1012 * 1.0; h = 464 * 1.0;

    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources[poolTableBig].texture);
      w = 2023 * 1.0; h = 928 * 1.0;
    }


    bg.scale.set((config.tableW + 2 * config.metalBorderThick) / w, (config.tableH + 2 * config.metalBorderThick) / h); // will overflow on bottom

    bg.position.x = config.tableCenterX;
    bg.position.y = config.tableCenterY;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = false;
    gameSetup.stage.addChild(bg);
    gameSetup.tableTop = bg;
  };

  // this.drawTableTop = () => {
  //   const config = gameSetup.config;
  //   // new new way: draw a green table top graphics
  //   const bg = new PIXI.Sprite(PIXI.loader.resources["/images/smallclothhalf.jpg"].texture);
  //   bg.scale.set(config.tableW / 1228, config.tableW / 1228); // will overflow on bottom
  //   bg.position.x = config.tableCenterX;
  //   bg.position.y = config.tableCenterY;
  //   bg.anchor.set(0.5, 0.5);
  //   gameSetup.tablecontainer.addChild(bg);

  //   const tableg = new PIXI.Graphics();
  //   tableg.lineStyle(0);
  ///   tableg.beginFill(0x166aa0, 0.8); // original blue
  //   tableg.beginFill(0x004a80, 0.8); // original blue
  //   tableg.drawRect(config.tableCenterX - config.tableW / 2, config.tableCenterY - config.tableH / 2, config.tableW, config.tableH);
  //   tableg.endFill();

  //   // head string
  //   // const lineg = new PIXI.Graphics();
  //   tableg.lineStyle(1, 0xFFFFFF);
  //   tableg.moveTo(config.tableCenterX - config.tableW / 4, config.tableCenterY - config.tableH / 2 + config.cushionBarThick);
  //   tableg.lineTo(config.tableCenterX - config.tableW / 4, config.tableCenterY + config.tableH / 2 - config.cushionBarThick);
  //   gameSetup.tablecontainer.addChild(tableg);
  //   // gameSetup.tablecontainer.addChild(lineg);
  // };

  this.testDrawPockets = () => {
    const config = gameSetup.config;
    const pocketg2 = new PIXI.Graphics();
    pocketg2.lineStyle(0);
    pocketg2.beginFill(0xffff00, 0.9);


    for (let k=0; k<6; k++) {
      const p = gameSetup.tablePocket[k];
      pocketg2.drawCircle(p.x, p.y, config.ballD/4);
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
      // ball.ballIDLabel = label;
      // ball.body.ballIDLabel = label;
    }
  }

  this.drawPockets = () => {
    const config = gameSetup.config;

    //const shift = config.ballD / 2.35;
    const  shift = config.ballD * 1.32;

    // pocketg5.drawCircle(config.tableCenterX - config.tableW/2 + shift, config.tableCenterY-config.tableH/2 + shift, config.ballD*2.2);
    const shift2 = config.ballD * 0.9;
    // pocketg5.drawCircle(config.tableCenterX, config.tableCenterY-config.tableH/2 - shift2, config.ballD*2.2);

    gameSetup.tablePocket = [];
    gameSetup.tablePocket[0] = new Victor(config.tableCenterX - config.tableW / 2 + shift * 1, config.tableCenterY - config.tableH / 2 + shift);
    gameSetup.tablePocket[2] = new Victor(config.tableCenterX + config.tableW / 2 - shift * 1, config.tableCenterY - config.tableH / 2 + shift);
    gameSetup.tablePocket[3] = new Victor(config.tableCenterX + config.tableW / 2 - shift * 1, config.tableCenterY + config.tableH / 2 - shift);
    gameSetup.tablePocket[5] = new Victor(config.tableCenterX - config.tableW / 2 + shift * 1, config.tableCenterY + config.tableH / 2 - shift);

    gameSetup.tablePocket[1] = new Victor(config.tableCenterX, config.tableCenterY - config.tableH / 2 + shift2);
    gameSetup.tablePocket[4] = new Victor(config.tableCenterX, config.tableCenterY + config.tableH / 2 - shift2);


    gameSetup.innerRectangle = new PIXI.Rectangle(
      config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick,
      config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick,
      config.tableW - config.ballD - 2 * config.cushionBarThick,
      config.tableH - config.ballD - 2 * config.cushionBarThick
    );

    gameSetup.innerRectangle2 = new PIXI.Rectangle(
      config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick + config.ballD * 3,
      config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick + config.ballD * 3,
      config.tableW - config.ballD - 2 * config.cushionBarThick - config.ballD * 6,
      config.tableH - config.ballD - 2 * config.cushionBarThick - config.ballD * 6
    );

    // 4 mirror lines
    gameSetup.leftMirrorX = config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick;
    gameSetup.rightMirrorX = config.tableCenterX + config.tableW / 2 - config.ballD / 2 - config.cushionBarThick;
    gameSetup.topMirrorY = config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick;
    gameSetup.bottomMirrorY = config.tableCenterY + config.tableH / 2 - config.ballD / 2 - config.cushionBarThick;

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
    gameSetup.tablePocket2[0] = new Victor(config.tableCenterX - config.tableW / 2 + shiftdisplay, config.tableCenterY - config.tableH / 2 + shiftdisplay);
    gameSetup.tablePocket2[2] = new Victor(config.tableCenterX + config.tableW / 2 - shiftdisplay, config.tableCenterY - config.tableH / 2 + shiftdisplay);
    gameSetup.tablePocket2[3] = new Victor(config.tableCenterX + config.tableW / 2 - shiftdisplay, config.tableCenterY + config.tableH / 2 - shiftdisplay);
    gameSetup.tablePocket2[5] = new Victor(config.tableCenterX - config.tableW / 2 + shiftdisplay, config.tableCenterY + config.tableH / 2 - shiftdisplay);

    gameSetup.tablePocket2[1] = new Victor(config.tableCenterX, config.tableCenterY - config.tableH / 2);
    gameSetup.tablePocket2[4] = new Victor(config.tableCenterX, config.tableCenterY + config.tableH / 2);




    // pocket center for telling if pocketed

    const  shift3 = 14;


    gameSetup.tablePocket3 = [];
    gameSetup.tablePocket3[0] = new Victor(config.tableCenterX - config.tableW / 2 + shift3, config.tableCenterY - config.tableH / 2 + shift3);
    gameSetup.tablePocket3[2] = new Victor(config.tableCenterX + config.tableW / 2 - shift3, config.tableCenterY - config.tableH / 2 + shift3);
    gameSetup.tablePocket3[3] = new Victor(config.tableCenterX + config.tableW / 2 - shift3, config.tableCenterY + config.tableH / 2 - shift3);
    gameSetup.tablePocket3[5] = new Victor(config.tableCenterX - config.tableW / 2 + shift3, config.tableCenterY + config.tableH / 2 - shift3);

    gameSetup.tablePocket3[1] = new Victor(config.tableCenterX, config.tableCenterY - config.tableH / 2 + shift3);
    gameSetup.tablePocket3[4] = new Victor(config.tableCenterX, config.tableCenterY + config.tableH / 2 - shift3);



    return;


    const metalColor = 160 * 256 * 256 + 160 * 256 + 160;
    const pocketg2 = new PIXI.Graphics();
    pocketg2.lineStyle(0);
    pocketg2.beginFill(metalColor);
    pocketg2.drawRect(config.tableCenterX - config.tableW / 2 - config.metalBorderThick, config.tableCenterY - config.tableH / 2 - config.metalBorderThick, config.tableW + 2 * config.metalBorderThick, config.metalBorderThick);
    pocketg2.drawRect(config.tableCenterX - config.tableW / 2 - config.metalBorderThick, config.tableCenterY - config.tableH / 2 - config.metalBorderThick, config.metalBorderThick, config.metalBorderThick * 3);
    pocketg2.drawRect(config.tableCenterX + config.tableW / 2, config.tableCenterY - config.tableH / 2 - config.metalBorderThick, config.metalBorderThick, config.metalBorderThick * 3);


    pocketg2.drawRect(config.tableCenterX - config.tableW / 2 - config.metalBorderThick, config.tableCenterY + config.tableH / 2, config.tableW + 2 * config.metalBorderThick, config.metalBorderThick);
    pocketg2.drawRect(config.tableCenterX - config.tableW / 2 - config.metalBorderThick, config.tableCenterY + config.tableH / 2 - config.metalBorderThick * 2, config.metalBorderThick, config.metalBorderThick * 3);
    pocketg2.drawRect(config.tableCenterX + config.tableW / 2, config.tableCenterY + config.tableH / 2 - config.metalBorderThick * 2, config.metalBorderThick, config.metalBorderThick * 3);

    pocketg2.endFill();
    gameSetup.tablecontainer.addChild(pocketg2);

    const pocketColor = 13 * 256 * 256 + 15 * 256 + 102;
    let sizeratio = 0.73;
    // let pocketg = gameSetup.add.graphics(config.tableCenterX - config.tableW / 2 + 0.25 * config.cornerPocketD / 2, config.tableCenterY - config.tableH / 2 - 0.8 * config.cornerPocketD / 2);
    let pocketg = new PIXI.Graphics();
    pocketg.position.set(config.tableCenterX - config.tableW / 2 + 0.25 * config.cornerPocketD / 2, config.tableCenterY - config.tableH / 2 - 0.8 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = 45 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);

    // pocketg = gameSetup.add.graphics(config.tableCenterX + config.tableW / 2 - 0.25 * config.cornerPocketD / 2, config.tableCenterY - config.tableH / 2 - 0.8 * config.cornerPocketD / 2);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.tableCenterX + config.tableW / 2 - 0.25 * config.cornerPocketD / 2, config.tableCenterY - config.tableH / 2 - 0.8 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = 45 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);

    // pocketg = gameSetup.add.graphics(config.tableCenterX - config.tableW / 2 - 0.75 * config.cornerPocketD / 2,
    // config.tableCenterY + config.tableH / 2 - 0.2 * config.cornerPocketD / 2);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.tableCenterX - config.tableW / 2 - 0.75 * config.cornerPocketD / 2, config.tableCenterY + config.tableH / 2 - 0.2 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = -45 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);

    // pocketg = gameSetup.add.graphics(config.tableCenterX + config.tableW / 2 + 0.75 * config.cornerPocketD / 2,
    //                                 config.tableCenterY + config.tableH / 2 - 0.2 * config.cornerPocketD / 2);

    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.tableCenterX + config.tableW / 2 + 0.75 * config.cornerPocketD / 2, config.tableCenterY + config.tableH / 2 - 0.2 * config.cornerPocketD / 2);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, config.cornerPocketD * sizeratio, config.cornerPocketD * sizeratio, config.cornerPocketD / 2.5);
    pocketg.endFill();
    pocketg.rotation = 135 / 180 * Math.PI;
    gameSetup.tablecontainer.addChild(pocketg);


    sizeratio = 0.8;
    // pocketg = gameSetup.add.graphics(config.tableCenterX - sizeratio * config.sidePocketD / 2,
    //                                 config.tableCenterY - config.tableH / 2 - 0.45 * config.sidePocketD / 2 - config.pocketShiftSide);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.tableCenterX - sizeratio * config.sidePocketD / 2, config.tableCenterY - config.tableH / 2 - 0.45 * config.sidePocketD / 2 - config.pocketShiftSide);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, sizeratio * config.sidePocketD, sizeratio * 0.9 * config.sidePocketD, config.sidePocketD / 2.5);
    pocketg.endFill();
    gameSetup.tablePocket[1].y = pocketg.y + sizeratio * 0.9 * config.sidePocketD / 2;
    gameSetup.tablecontainer.addChild(pocketg);


    // pocketg = gameSetup.add.graphics(config.tableCenterX - sizeratio * config.sidePocketD / 2,
    //                                 config.tableCenterY + config.tableH / 2 + 0.45 * config.sidePocketD / 2 + config.pocketShiftSide - sizeratio * 0.9 * config.sidePocketD);
    pocketg = new PIXI.Graphics();
    pocketg.position.set(config.tableCenterX - sizeratio * config.sidePocketD / 2, config.tableCenterY + config.tableH / 2 + 0.45 * config.sidePocketD / 2 + config.pocketShiftSide - sizeratio * 0.9 * config.sidePocketD);
    pocketg.lineStyle(0);
    pocketg.beginFill(pocketColor); // light blue pockets
    pocketg.drawRoundedRect(0, 0, sizeratio * config.sidePocketD, sizeratio * 0.9 * config.sidePocketD, config.sidePocketD / 2.5);
    pocketg.endFill();
    gameSetup.tablePocket[4].y = pocketg.y + sizeratio * 0.9 * config.sidePocketD / 2;
    gameSetup.tablecontainer.addChild(pocketg);
    // config.sidePocketD = config.sidePocketD * sizeratio*0.9
  };

  this.addBallBody = (w, r, x, y) => {
    const ballShape = new p2.Circle({ radius: r, material: gameSetup.ballMaterial });
    const b = new p2.Body({
        mass:1,
        position:[x, y],
        damping: 0, // controls when speed is large how it slows down
        angularDamping: 0,
        fixedRotation: true,
        angularVelocity:0,
        velocity: [0, 0]
    });
    b.name = "ball";
    b.av = new Victor(0, 0);
    b.addShape(ballShape);
    w.addBody(b);
    return b;
  };


  this.addBoxBody = (wor, w, h, x, y) => {
    const boxShape = new p2.Box({ width: w, height: h, material: gameSetup.cushionMaterial });
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


  gameSetup.addPolygonBody = (points, id) => {
    const path = [];
    for (let k = 0; k < points.length - 2; k += 2) {
      path.push([points[k], points[k + 1]]);
    }

    const b = new p2.Body({ mass: 0, position: [0, 0] });
    // console.log("from polygon 1 " + JSON.stringify(path));
    if (id > 5) {
      debugger;
    }
    b.name = `polybody${id}`;

    b.fromPolygon(path);
    b.shapes[0].material = gameSetup.cushionMaterial;
    b.mass = 0;
    world.addBody(b);

    const path2 = [];
    for (let k = 0; k < points.length - 2; k += 2) {
      path2.push([points[k], points[k + 1]]);
    }

    const b2 = new p2.Body({ mass: 0, position: [0, 0] });
    // console.log("from polygon 2 " + JSON.stringify(path2));
    b2.fromPolygon(path2);
    b2.shapes[0].material = gameSetup.cushionMaterial;
    b2.mass = 0;
    b2.name = b.name;
    world2.addBody(b2);
  };

  this.drawTargetPocket = () => {
    const config = gameSetup.config;
    const g = new PIXI.Graphics();
    g.position.x = config.tableW * 1000;
    g.position.y = config.tableW * 1000;
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
    // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.tableCenterX;
    g.position.y = config.tableCenterY;

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
    // g.aimCText.visible = false; // aaaa testing
    gameSetup.stage.addChild(g);
  };


  this.drawTargetBall = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.tableW * 1000;
    g.position.y = config.tableW * 1000;

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
    // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.tableW * 1000;
    g.position.y = config.tableW * 1000;

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

  gameSetup.reAddPolyBodies = () => {
    for (let k=0; k < AllPolyBodies.length; k++)
      gameSetup.addPolygonBody(AllPolyBodies[k], k);
  };

  this.drawTableCushionBars = () => {
    const config = gameSetup.config;
    // const borderg = gameSetup.add.graphics(0, 0);


    // 4. table cushion bars
    const cushiong = new PIXI.Graphics();
    cushiong.lineStyle(1, 30 * 256 * 256 + 30 * 256 + 30);
    // borderg.beginFill(103*256*256+58*256+29);
    // cushiong.beginFill(64 * 256 * 256 + 93 * 256 + 170, 0.7); // blue
    // cushiong.beginFill(0 * 256 * 256 + 170 * 256 + 70, 0.7); // green
    // cushiong.beginFill(0x1c87cc, 0.7); // blue
    cushiong.beginFill(0xaa0000, 0.4); // blue


    this.cushions = [];
    AllPolyBodies = [];

    gameSetup.cushionLines = [];
    gameSetup.cushionCorners = [];

    const sizeratio = 0.85; // for side pocket

    /*
           0          2
         4               5
           1          3

    */
    // upper left cushion
    config.tableW *= 1.006;
    const points0 = [
      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.tableCenterY - config.tableH / 2,

      config.tableCenterX - sizeratio * config.sidePocketD / 2,
      config.tableCenterY - config.tableH / 2,

      config.tableCenterX - sizeratio * config.sidePocketD / 2 - config.cushionBarShift / 4,
      config.tableCenterY - config.tableH / 2 + config.cushionBarThick,

      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift + config.cushionBarShift,
      config.tableCenterY - config.tableH / 2 + config.cushionBarThick,

      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.tableCenterY - config.tableH / 2
    ];
    cushiong.drawPolygon(points0);
    gameSetup.addPolygonBody(points0, 0);
    AllPolyBodies.push(points0);
    gameSetup.cushionCorners.push(new Victor(points0[6], points0[7]));
    gameSetup.cushionCorners.push(new Victor(points0[4], points0[5]));

    this.parallelShift(cushiong, { p1: new Victor(points0[0], points0[1]), p2: new Victor(points0[6], points0[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points0[6], points0[7]), p2: new Victor(points0[4], points0[5]), });
    this.parallelShift(cushiong, { p1: new Victor(points0[4], points0[5]), p2: new Victor(points0[2], points0[3]), });


    // verify inner rectangle is same as the new cushion lines
    // gameSetup.innerRectangle = new PIXI.Rectangle(
    //   config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick,
    //   config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick,
    //   config.tableW - config.ballD - 2 * config.cushionBarThick,
    //   config.tableH - config.ballD - 2 * config.cushionBarThick
    // );
    // cushiong.moveTo(config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick, config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick);
    // cushiong.lineTo(config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick + config.tableW - config.ballD - 2 * config.cushionBarThick, config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick);
    // cushiong.lineTo(config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick + config.tableW - config.ballD - 2 * config.cushionBarThick, config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick + config.tableH - config.ballD - 2 * config.cushionBarThick);


    // const p0 = this.add.sprite(0, 0);
    // this.physics.p2.enable(p0, false);
    //  p0.body.clearShapes();
    //  p0.body.addPolygon({}, points0);
    //  p0.body.static = true;
    // this.cushions.push(p0);

    // bottom left cushion
    const points1 = [
      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.tableCenterY + config.tableH / 2,

      config.tableCenterX - sizeratio * config.sidePocketD / 2,
      config.tableCenterY + config.tableH / 2,

      config.tableCenterX - sizeratio * config.sidePocketD / 2 - config.cushionBarShift / 4,
      config.tableCenterY + config.tableH / 2 - config.cushionBarThick,

      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift + config.cushionBarShift,
      config.tableCenterY + config.tableH / 2 - config.cushionBarThick,

      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.tableCenterY + config.tableH / 2
    ];
    cushiong.drawPolygon(points1);
    gameSetup.addPolygonBody(points1, 1);
    AllPolyBodies.push(points1);
    gameSetup.cushionCorners.push(new Victor(points1[6], points1[7]));
    gameSetup.cushionCorners.push(new Victor(points1[4], points1[5]));

    this.parallelShift(cushiong, { p2: new Victor(points1[0], points1[1]), p1: new Victor(points1[6], points1[7]), });
    this.parallelShift(cushiong, { p2: new Victor(points1[6], points1[7]), p1: new Victor(points1[4], points1[5]), });
    this.parallelShift(cushiong, { p2: new Victor(points1[4], points1[5]), p1: new Victor(points1[2], points1[3]), });

    // const p1 = this.add.sprite(0, 0); this.physics.p2.enable(p1, false); p1.body.clearShapes(); p1.body.addPolygon({}, points1); p1.body.static = true;
    // this.cushions.push(p1);

    // upper right cushion
    const points2 = [
      config.tableCenterX * 2 - points0[0], points0[1],
      config.tableCenterX * 2 - points0[2], points0[3],
      config.tableCenterX * 2 - points0[4], points0[5],
      config.tableCenterX * 2 - points0[6], points0[7],
      config.tableCenterX * 2 - points0[0], points0[1]
    ];
    cushiong.drawPolygon(points2);
    gameSetup.addPolygonBody(points2, 2);
    AllPolyBodies.push(points2);
    gameSetup.cushionCorners.push(new Victor(points2[6], points2[7]));
    gameSetup.cushionCorners.push(new Victor(points2[4], points2[5]));

    this.parallelShift(cushiong, { p1: new Victor(points2[6], points2[7]), p2: new Victor(points2[0], points2[1]), });
    this.parallelShift(cushiong, { p1: new Victor(points2[4], points2[5]), p2: new Victor(points2[6], points2[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points2[2], points2[3]), p2: new Victor(points2[4], points2[5]), });


    // const p2 = this.add.sprite(0, 0); this.physics.p2.enable(p2, false); p2.body.clearShapes(); p2.body.addPolygon({}, points2); p2.body.static = true;
    // this.cushions.push(p2);

    // lower right cushion
    const points3 = [
      config.tableCenterX * 2 - points1[0], points1[1],
      config.tableCenterX * 2 - points1[2], points1[3],
      config.tableCenterX * 2 - points1[4], points1[5],
      config.tableCenterX * 2 - points1[6], points1[7],
      config.tableCenterX * 2 - points1[0], points1[1]
    ];
    cushiong.drawPolygon(points3);
    gameSetup.addPolygonBody(points3, 3);
    AllPolyBodies.push(points3);
    gameSetup.cushionCorners.push(new Victor(points3[6], points3[7]));
    gameSetup.cushionCorners.push(new Victor(points3[4], points3[5]));

    this.parallelShift(cushiong, { p1: new Victor(points3[0], points3[1]), p2: new Victor(points3[6], points3[7]), });
    this.parallelShift(cushiong, { p1: new Victor(points3[6], points3[7]), p2: new Victor(points3[4], points3[5]), });
    this.parallelShift(cushiong, { p1: new Victor(points3[4], points3[5]), p2: new Victor(points3[2], points3[3]), });

    // const p3 = this.add.sprite(0, 0); this.physics.p2.enable(p3, false); p3.body.clearShapes(); p3.body.addPolygon({}, points3); p3.body.static = true;
    // this.cushions.push(p3);


    // left cushion
    const points4 = [
      config.tableCenterX - config.tableW / 2,
      config.tableCenterY - config.tableH / 2 + 1.15 * config.sidePocketD / 2,

      config.tableCenterX - config.tableW / 2,
      config.tableCenterY + config.tableH / 2 - 1.15 * config.sidePocketD / 2,

      config.tableCenterX - config.tableW / 2 + config.cushionBarThick,
      config.tableCenterY + config.tableH / 2 - 1.5 * config.sidePocketD / 2 - config.cushionBarShift,

      config.tableCenterX - config.tableW / 2 + config.cushionBarThick,
      config.tableCenterY - config.tableH / 2 + 1.5 * config.sidePocketD / 2 + config.cushionBarShift,

      config.tableCenterX - config.tableW / 2,
      config.tableCenterY - config.tableH / 2 + 1.15 * config.sidePocketD / 2

    ];

    cushiong.drawPolygon(points4);
    gameSetup.addPolygonBody(points4, 4);
    AllPolyBodies.push(points4);
    gameSetup.cushionCorners.push(new Victor(points4[6], points4[7]));
    gameSetup.cushionCorners.push(new Victor(points4[4], points4[5]));

    this.parallelShift(cushiong, { p2: new Victor(points4[0], points4[1]), p1: new Victor(points4[6], points4[7]), });
    this.parallelShift(cushiong, { p2: new Victor(points4[6], points4[7]), p1: new Victor(points4[4], points4[5]), });
    this.parallelShift(cushiong, { p2: new Victor(points4[4], points4[5]), p1: new Victor(points4[2], points4[3]), });

    // const p4 = this.add.sprite(0, 0); this.physics.p2.enable(p4, false); p4.body.clearShapes(); p4.body.addPolygon({}, points4); p4.body.static = true;
    // this.cushions.push(p4);

    const points5 = [
      config.tableCenterX * 2 - points4[0], points4[1],
      config.tableCenterX * 2 - points4[2], points4[3],
      config.tableCenterX * 2 - points4[4], points4[5],
      config.tableCenterX * 2 - points4[6], points4[7],
      config.tableCenterX * 2 - points4[0], points4[1]
    ];
    cushiong.drawPolygon(points5);
    gameSetup.addPolygonBody(points5, 5);
    AllPolyBodies.push(points5);
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
    //   pp.body.setMaterial(gameSetup.cushionMaterial);
    //   pp.body.setCollisionGroup(this.borderCollisionGroup);
    //   pp.body.collides([this.ballCollisionGroup]);
    // }

    cushiong.endFill();
    config.tableW /= 1.006;
    // aaaaa
    // gameSetup.stage.addChild(cushiong); // aaaa test cushion bar by setting them visible!
  };

  this.createAllCollisionGroups = () => {
    this.ballCollisionGroup = gameSetup.physics.p2.createCollisionGroup();
    this.borderCollisionGroup = gameSetup.physics.p2.createCollisionGroup(); gameSetup.physics.p2.updateBoundsCollisionGroup();
  };

  gameSetup.createMaterials = () => {
    gameSetup.cushionMaterial =  new p2.Material();
    gameSetup.ballMaterial =  new p2.Material();


    gameSetup.ballCushionMaterial = new p2.ContactMaterial(gameSetup.ballMaterial, gameSetup.cushionMaterial, {
      friction: 0,
      restitution: 1,
      stiffness : Number.MAX_VALUE
      // stiffness: 0.1,
      // relaxation: 3000000,
      // frictionStiffness: 0.1,
      // frictionRelaxation: 3000000
      // surfaceelocity: 10000
    });

    gameSetup.ballBallMaterial = new p2.ContactMaterial(gameSetup.ballMaterial, gameSetup.ballMaterial, {
      friction: 0,
      stiffness : Number.MAX_VALUE,
      restitution: 1
    });


    // //  ere is the contact material. It's a combination of 2 materials, so whenever shapes with
    // //  those 2 materials collide it uses the following settings.
    // //  A single material can be used by as many different sprites as you lie.
    // this.ballCushionMaterial = gameSetup.physics.p2.createContactMaterial(gameSetup.ballMaterial, gameSetup.cushionMaterial);
    // this.ballCushionMaterial.friction = 0;      // riction to use in the contact of these two materials.
    // this.ballCushionMaterial.restitution = 1;  // restitution (i.e. how bouncy it is!) to use in the contact of these two materials.

    // if very stiff, then will not deform
    // this.ballCushionMaterial.stiffness = 1e9;     // Stiffness of the resulting contactuation that that ContactMaterial generate.
    // this.ballCushionMaterial.relaxation = 3;      // Relaxation of the resulting ContactEquation setup setup ContactMaterial generate.
    // this.ballCushionMaterial.frictionStiffness = 1e7;     // Stiffness of the resulting FrictionEquation that this ContactMaterial generate.
    // this.ballCushionMaterial.frictionRelaxation = 3;      // Relaxation of the resulting FrictionEquation that this ContactMaterial generate.
    // this.ballCushionMaterial.surfaceelocity = 0;         // Will add surface velocity to  this material. If bodyA rests on top if bodyB, and the surface velocity is positive,bodyA will slide to the right.


    // this.ballBallMaterial = gameSetup.physics.p2.createContactMaterial(gameSetup.ballMaterial, gameSetup.ballMaterial);
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

  gameSetup.addMateirals = () => {

    gameSetup.world.addContactMaterial(gameSetup.ballCushionMaterial);
    gameSetup.world2.addContactMaterial(gameSetup.ballCushionMaterial);
    gameSetup.world.addContactMaterial(gameSetup.ballBallMaterial);
    gameSetup.world2.addContactMaterial(gameSetup.ballBallMaterial);

  };

  // this.createTableRenderer = () => {
  //   const cfg = gameSetup.config;
  //   // gameDiv -> DIV -> canvas for drawing
  //   const tableDiv = document.createElement("DIV");
  //   tableDiv.setAttribute("id", "PoolTableDiv");

  //   const gameDiv = document.getElementById('gameDiv');
  //   gameDiv.appendChild(tableDiv);


  //   let w = window.innerWidth;
  //   let h = window.innerHeight - vcushion;
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     const shell = document.getElementById('gameDivShellModal');
  //     w = shell.clientWidth * 1;
  //     h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
  //   }

  //   // calculate rendering size of div, based on whether this is testing or not
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     // only show table
  //     // cfg.tableTop = 0;

  //   } else {
  //     // table is at lower left portion of overall div
  //     // table inside area is tableW, which is truewidth * 0.86; so ratio of table plus border is wratio > 0.86
  //     const wratio = (cfg.tableW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
  //     const hratio = (cfg.tableH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
  //     w = w * wratio;
  //     h = h * hratio;
  //   }


  //   tablerenderer = PIXI.autoDetectRenderer(w, h, { transparent: false, antialias: true });
  //   tableDiv.appendChild(tablerenderer.view);
  //   tablerenderer.view.setAttribute("id", "PoolTableCanvas");

  //   // actual size on page, to be used for scaling objects later
  //   // tablerenderer.displayW = w;
  //   // tablerenderer.displayH = h;


  //   // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
  //   // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
  //   tablerenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:105`);

  //   gameSetup.tablecontainer = new PIXI.Container();
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     // only show table
  //     // cfg.tableTop = 0;
  //     gameSetup.tablecontainer.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
  //     gameSetup.tablecontainer.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
  //   } else {
  //     // same scaling as all
  //     gameSetup.tablecontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
  //     gameSetup.tablecontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
  //   }
  // };

  // this.createBallRenderer = () => {
  //   // transparent canvas just for the balls, so we don't need to re-render the table!!
  //   const cfg = gameSetup.config;
  //   // gameDiv -> DIV -> canvas for drawing
  //   const tableDiv = document.createElement("DIV");
  //   tableDiv.setAttribute("id", "BallDiv");

  //   const gameDiv = document.getElementById('gameDiv');
  //   gameDiv.appendChild(tableDiv);


  //   let w = window.innerWidth;
  //   let h = window.innerHeight - vcushion;
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     const shell = document.getElementById('gameDivShellModal');
  //     w = shell.clientWidth * 1;
  //     h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
  //   }

  //   // calculate rendering size of div, based on whether this is testing or not
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     // only show table

  //   } else {
  //     // table is at lower left portion of overall div
  //     const wratio = (cfg.tableW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
  //     const hratio = (cfg.tableH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
  //     w = w * wratio;
  //     h = h * hratio;
  //   }

  //   ballrenderer = PIXI.autoDetectRenderer(w, h, { transparent: true, antialias: true });
  //   tableDiv.appendChild(ballrenderer.view);
  //   ballrenderer.view.setAttribute("id", "BallCanvas");
  //   ballrenderer.plugins.interaction.autoPreventDefault = true;

  //   // actual size on page, to be used for scaling objects later
  //   // ballrenderer.displayW = w;
  //   // ballrenderer.displayH = h;


  //   // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
  //   // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
  //   ballrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:200`);

  //   gameSetup.ballcontainer = new PIXI.Container();
  //   // gameSetup.stage.scale.x = w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
  //   // gameSetup.stage.scale.y = h / (cfg.TrueHeight); //h / (cfg.tableH + 2 * cfg.metalBorderThick);

  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     // only show table
  //     // cfg.tableTop = 0;
  //     gameSetup.stage.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
  //     gameSetup.stage.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
  //   } else {
  //     // same scaling as all
  //     gameSetup.stage.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
  //     gameSetup.stage.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
  //   }

  //   this.setupAimingHandler();
  // };

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
  //   overlayText.x = gameSetup.config.tableCenterX;
  //   overlayText.y = gameSetup.config.tableCenterY - gameSetup.config.tableH / 6;
  //   overlayText.anchor.set(0.5, 0.5);

  //   const overlayText2 = new PIXI.Text(`abc`, style);
  //   overlayText2.x = gameSetup.config.tableCenterX;
  //   overlayText2.y = gameSetup.config.tableCenterY;
  //   overlayText2.anchor.set(0.5, 0.5);


  //   overlayText.visible = false;
  //   overlayText2.visible = false;

  //   gameSetup.stage.addChild(overlayText);
  //   gameSetup.stage.addChild(overlayText2);



  //   // exit button
  //   const buttony = gameSetup.config.tableCenterY + gameSetup.config.tableH / 6;
  //   const buttonx = gameSetup.config.tableCenterX;
  //   const btnWidth = gameSetup.config.tableW / 5;
  //   const btnHeight = gameSetup.config.tableH / 8;
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
  this.setupAimingHandler = () => {

    const c = gameSetup.tableTop;
    const config = gameSetup.config;

    // gameSetup.controlButtons.push(c);
    c.interactive = true;
    c.buttonMode = true;
    //c.hitArea = new PIXI.Rectangle(config.tableCenterX - config.tableW/2, config.tableCenterY - config.tableH/2, config.tableW + 2 * config.metalBorderThick, config.tableH + 2 * config.metalBorderThick);
    // c.hitArea = new PIXI.Rectangle(0, 0, 500, 500);
    const testtarget = new Victor(0, 0);

    const showPointerCoordinate = (event) => {
      const whratio = config.TrueWidth / config.TrueHeight; // width vs height
      const oldnewratio = config.TrueWidth / 1600; // new vs old true width
      const metalBorderThick = 33.3964 * oldnewratio * 1.1;
      const wtabletop = 2000; // table is 2000x1000 now!
      const wfulltable = wtabletop + 2 * metalBorderThick;
      const hfulltable = wtabletop/2 + 2 * metalBorderThick;

      let px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
      let py = (config.TrueHeight - 110 - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;

      if (px > config.tableCenterX + config.tableW/2 - config.ballD/2 - config.cushionBarThick)
        px = config.tableCenterX + config.tableW/2 - config.ballD/2 - config.cushionBarThick;
      if (px < config.tableCenterX - config.tableW/2 + config.ballD/2 + config.cushionBarThick)
        px = config.tableCenterX - config.tableW/2 + config.ballD/2 + config.cushionBarThick;
      if (py > config.tableCenterY + config.tableH/2 - config.ballD/2 - config.cushionBarThick) py = config.tableCenterY + config.tableH/2 - config.ballD/2 - config.cushionBarThick;
      if (py < config.tableCenterY - config.tableH/2 + config.ballD/2 + config.cushionBarThick) py = config.tableCenterY - config.tableH/2 + config.ballD/2 + config.cushionBarThick;

      gameSetup.aimBallMark.position.x = px;
      gameSetup.aimBallMark.position.y = py;
      gameSetup.aimx = px;
      gameSetup.aimy = py;

      gameSetup.aimBallMark.aimCText.text = `(${Math.round(px-config.tableCenterX)}, ${Math.round(py-config.tableCenterY)})`;

      // aaaa for screenshots
      if (hideTrail) {
        gameSetup.aimBallMark.aimCText.text = "";
        gameSetup.aimBallMark.position.x = -10000;
      }
    };

    const updateInputs = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        if (!gameSetup.activePlayerInfo.isLocal) return false;
        if (gameSetup.activePlayerInfo.playerType == "AI") return false;
      }

      if (gameSetup.gameType == GAME_TYPE.TESTING) {
        // disable clicking on table during a test run
        if (gameSetup.inRunningTest) return false;
      }

      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
        showPointerCoordinate(event);
        // return;
      }

      if (!gameSetup.isCueballInHand()) {
        // document.getElementById("BallDiv").style.cursor = 'move';
        // console.log(" global: " + event.data.global.x + " " + event.data.global.y);
        // console.log(" original: " + event.data.originalEvent.clientX + " " + event.data.originalEvent.clientY);
        const cb = gameSetup.cueball.body;
        // console.log("updateInputs: " + cb.position[0] + " " + cb.position[1]);

        // const oldnewratio = config.TrueWidth / 1600; // new vs old true width
        // const metalBorderThick = 33.3964 * oldnewratio * 1.1;
        // const wtabletop = 2000; // table is 2000x1000 now!
        // const wfulltable = wtabletop + 2 * metalBorderThick;
        // const hfulltable = wtabletop/2 + 2 * metalBorderThick;

        // let px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
        // let py = (config.TrueHeight - 110 - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;

        // if (px > config.tableCenterX + config.tableW/2 - config.ballD/2 - config.cushionBarThick) px = config.tableCenterX + config.tableW/2 - config.ballD/2 - config.cushionBarThick;
        // if (px < config.tableCenterX - config.tableW/2 + config.ballD/2 + config.cushionBarThick) px = config.tableCenterX - config.tableW/2 + config.ballD/2 + config.cushionBarThick;
        // if (py > config.tableCenterY + config.tableH/2 - config.ballD/2 - config.cushionBarThick) py = config.tableCenterY + config.tableH/2 - config.ballD/2 - config.cushionBarThick;
        // if (py < config.tableCenterY - config.tableH/2 + config.ballD/2 + config.cushionBarThick) py = config.tableCenterY - config.tableH/2 + config.ballD/2 + config.cushionBarThick;
        // px = px - config.tableCenterX;
        // py = py - config.tableCenterY;
        // gameSetup.cueballDirection.x = px - cb.position[0];
        // gameSetup.cueballDirection.y = py - 105 - cb.position[1];

        gameSetup.cueballDirection.x = event.data.global.x / gameSetup.stage.scale.x - cb.position[0];
        gameSetup.cueballDirection.y = event.data.global.y / gameSetup.stage.scale.y - cb.position[1]

        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
          const whratio = config.TrueWidth / config.TrueHeight; // width vs height
          const oldnewratio = config.TrueWidth / 1600; // new vs old true width
          const metalBorderThick = 33.3964 * oldnewratio * 1.1;
          const wtabletop = 2000; // table is 2000x1000 now!
          const wfulltable = wtabletop + 2 * metalBorderThick;
          const hfulltable = wtabletop/2 + 2 * metalBorderThick;

          const px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
          const py = (config.TrueHeight - 110 - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;
          gameSetup.cueballDirection.x = px - cb.position[0];
          gameSetup.cueballDirection.y = py - cb.position[1];
        }


        gameSetup.cueballDirection = gameSetup.cueballDirection.normalize();


        // let pointerChg = event.data.originalEvent.clientY - t.dragStartPointerY; // getLocalPosition(this.parent);
        // console.log(event.data.originalEvent.clientY + " - " + t.dragStartPointerY + " = " + pointerChg);
        // pointerChg = pointerChg / gameSetup.controlcontainer.scale.y;
        // t.position.y = t.dragStartPosY + pointerChg;
        // console.log(t.position.y + " = " + t.dragStartPosY  + " + " + pointerChg);
        // // this.position.x = newPosition.x;
        // // this.position.y = newy;
        // if (t.position.y > maxknoby) {
        //   t.position.y = maxknoby;
        // }
        // if (t.position.y < minknoby) {
        //   t.position.y = minknoby;
        // }

        // const ratio2 = (maxknoby - t.position.y) /(maxknoby - minknoby);
        // t.value = cfg.valueLow + (cfg.valueHigh - cfg.valueLow) * ratio2;
        // if (cfg.valueHigh < 2) {
        //   t.value = Math.round(t.value * 100)/100;
        // } else {
        //   t.value = Math.round(t.value);
        // }
        // t.textActual.text = `${t.value}`;
        // t.textActual.position.y = t.position.y - 15;
        // t.textMax.y = t.position.y + 15;
        // t.barg.position.y = t.position.y;
      } else {
        testtarget.x = Math.fround(event.data.global.x / gameSetup.stage.scale.x);
        testtarget.y = Math.fround(event.data.global.y / gameSetup.stage.scale.y);
        gameSetup.controller.tryPlaceCueBall(testtarget);
      }
    };

    const onDragStart = (event) => { // aiming handler

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
      if (t.dragging) {
        // console.log("xxxxxxxxx end dragging...");
        t.dragging = false;
        if (t.brother) {
          t.visible  = false;
          t.brother.visible = true;
        }
      }
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

  // this.createControlRenderer = () => {

  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     // shouldn't be here!
  //     return;
  //   }

  //   // bottom render for top and right controls
  //   const cfg = gameSetup.config;
  //   // gameDiv -> DIV -> canvas for drawing
  //   const tableDiv = document.createElement("DIV");
  //   tableDiv.setAttribute("id", "ControlDiv");

  //   const gameDiv = document.getElementById('gameDiv');
  //   gameDiv.appendChild(tableDiv);


  //   let w = window.innerWidth;
  //   let h = window.innerHeight - vcushion;
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     const shell = document.getElementById('gameDivShellModal');
  //     w = shell.clientWidth * 1;
  //     h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
  //   }

  //   cfg.tableTop = cfg.TrueHeight - cfg.tableH - cfg.metalBorderThick*2;
  //   cfg.tableRight = cfg.TrueWidth - cfg.tableW - cfg.metalBorderThick*2;

  //   // calculate rendering size of div, based on whether this is testing or not
  //   if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  //     // shouldn't be here!
  //     return;

  //   } else {
  //     // table is at lower left portion of overall div
  //   }

  //   controlrenderer = PIXI.autoDetectRenderer(w, h, { transparent: false, antialias: true });
  //   tableDiv.appendChild(controlrenderer.view);
  //   controlrenderer.view.setAttribute("id", "controlCanvas");
  //   // controlrenderer.plugins.interaction.autoPreventDefault = true;

  //   // actual size on page, to be used for scaling objects later
  //   // controlrenderer.displayW = w;
  //   // controlrenderer.displayH = h;


  //   // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
  //   // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
  //   controlrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:100`);

  //   gameSetup.controlcontainer = new PIXI.Container();
  //   gameSetup.controlcontainer.scale.x = w / (cfg.TrueWidth);
  //   gameSetup.controlcontainer.scale.y = h / (cfg.TrueHeight);
  // };





  const loadPlayRightBall = (cc, x, y, color) => {
    let ballfile = 'white';
    switch (color) {
      case Pool.RED: ballfile = 'red'; break;
      case Pool.YELLOW: ballfile = 'yellow'; break;
      case Pool.BLACK: ballfile = 'black'; break;
    }

    that.loadFramedSpriteSheet(`/images/new${ballfile}ballrolling.png`, ballfile, 41, 41, 36, (frames) => {
      const ball = new PIXI.extras.AnimatedSprite(frames);
      ball.scale.set(gameSetup.config.ballD * 1.1 / 41);

      ball.position.x = x;
      ball.position.y = y;
      ball.anchor.x = 0.5;
      ball.anchor.y = 0.5;

      let ballframe = 10;
      if (color == Pool.WHITE) {
        ballframe = 10;
        ball.visible = true;
      } else {
        ball.visible = false;
      }

      ball.frame = ballframe;
      ball.gotoAndStop(ball.frame);
      ball.rotation = Math.PI / 2; // (Math.random() * Math.PI * 2);
      ball.animationSpeed = 0.5;
      ball.interactive = false;

      cc.ballIcons[color] = ball;
      gameSetup.stage.addChild(ball);
    });
  };

  this.addPlayerPanelNew = (c, pi) => {
    const config = gameSetup.config;
    //const gb = this.gameSetup.add.graphics(0, 0);
    const gb = new PIXI.Graphics();
    gameSetup.stage.addChild(gb);

    this.addPlayerTimer(c, pi);
    this.addPlayerCoins(c, pi);
    this.addPlayerFrame(c, pi);

    c.ballIcons = [];
    const ballX = config.tableCenterX + (-1 + 2 * pi.ID) * 765;
    const ballY = -15 + c.cy + c.h * 0;
    loadPlayRightBall(c, ballX, ballY, Pool.WHITE);
    loadPlayRightBall(c, ballX, ballY, Pool.RED);
    loadPlayRightBall(c, ballX, ballY, Pool.YELLOW);
    loadPlayRightBall(c, ballX, ballY, Pool.BLACK);

    // grey area for name tag

    // const ratio = (config.tableW * 0.38) / 100;

    // const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/nametaggrey.png"].texture);
    // bg2.scale.set(ratio, ratio); // will overflow on bottom
    // bg2.position.x = c.cx + c.w * 0;
    // bg2.position.y = c.cy;
    // bg2.anchor.set(0.5, 0.5);
    // bg2.interactive = false;
    // gameSetup.stage.addChild(bg2);
    // bg2.alpha = 0.9;
    // bg2.visible = true;


    // load avatar
    const a = PIXI.Sprite.fromImage(pi.playerAvatarURL, true);
    a.texture.baseTexture.on('loaded', function(){
      // console.log(a.texture.orig.width, a.texture.orig.height);
      a.scale.set(140 / a.texture.orig.width, 140 / a.texture.orig.height);
    });
    // if (pi.playerAvatarURL == "/img_v2/ProfileIcon.png") {
    //   a.scale.set(0.135);
    // } else {
    //   a.scale.set(0.8);
    // }
    a.scale.set(0.1, 0.1);
    a.position.x = config.tableCenterX-155;
    if (c.PanelID == 1) {
      a.position.x =  config.tableCenterX + 155;
    }
    a.position.y = 115;
    a.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(a);




    c.showNameTag = (color, isActive) => {
      // console.log("show name tag " + color);
      for (let k=0; k <= 3; k++) {
        if (color == k) {
          c.ballIcons[k].visible = true;
          if (isActive) {
            c.ballIcons[k].play();
            c.ballIcons[k].visible = true;
          } else {
            c.ballIcons[k].stop();
            c.ballIcons[k].visible = false;
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
    text.position.y = 75;
    text.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(text);


    c.showPlayerAsActive = (isActive) => {
      let tint = 0xCCCCCC;
      if (isActive) {
        // bg2.visible = false;
        tint = 0xffffff;
      }
      c.activeFrame.visible = isActive;
      // text.tint = tint;
      c.countdownClockText.tint = tint;
      for (let k=0; k <= 3; k++) {
        // if (c.ballIcons[k].visible) {
          c.ballIcons[k].tint = tint;
          if (isActive) {

            c.ballIcons[k].play();
            c.ballIcons[k].visible = true;
          }
          else {

            c.ballIcons[k].stop();
            c.ballIcons[k].visible = false;
          }
        // }
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
      fill: ['#66ff66'],
      stroke: '#66ff66',
      strokeThickness: 3,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 2440
    });

    const text = new PIXI.Text(" - ", style);
    text.position.x = config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.251 + 3;
    text.position.y = 115; //(config.TrueHeight - config.tableH - 2 * config.metalBorderThick) * 0.5 ;
    text.anchor.set(0.5, 0.5);
    gameSetup.probText = text;
    gameSetup.stage.addChild(text);
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

  this.addPlayerFrame = (panel, pi) => {
    // add coin count
    const config = gameSetup.config;

    const s = new PIXI.Sprite(PIXI.loader.resources['/images/activeframe2.png'].texture);
    s.scale.set(2.1, 2.1); // will overflow on bottom

    s.position.x = config.tableCenterX - 156;
    if (panel.PanelID == 1) {
      s.position.x = config.tableCenterX + 156;
    }
    s.position.y = 114;
    s.anchor.set(0.5, 0.5);
    // btn.tint = 0xa0a0a0;
    panel.activeFrame = s;
    s.visible = false;
    s.tint = 0xffffff;


    gameSetup.stage.addChild(s);

    let dir = 1;
    const obj = { tt: 511 };
    const tween = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
      .to({ tt: 1 }, 2000) // if strength is 1000, then 1 second
      .repeat(Infinity)
      .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
      .onUpdate(() => { // Called after tween.js updates 'coords'.
        if (!s.visible) return;
        // if (s.tint >= 0xffffff) {
        //   dir = -1;
        // } else if (s.tint <= 0) {
        //   dir = 1;
        // }
        // s.tint += (0xffffff / 60) * dir;
        let r = Math.round(Math.abs(obj.tt - 256));
        //s.alpha = r / 60  + 0;
        s.tint = Math.max(0, r * 256 * 256 + r * 256 + r);
        // console.log("obj tt " + obj.tt + " r " + r + " tint " + s.tint);
        // if (obj.tt <=0 ) obj.tt = 512;
      });
    // tween.start();

  };

  this.addPlayerCoins = (panel, pi) => {
    // add coin count
    const config = gameSetup.config;
    const size = Math.floor(2 * config.scalingratio);
    const style0 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: size,
      fontStyle: '',
      fontWeight: 'bold',
      fill: ['#FFFF00'],  // DEEBF7
      stroke: '#FFFF00',
      strokeThickness: 1,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const richText0 = new PIXI.Text(pi.playerCoins, style0);
    richText0.x = config.tableCenterX - config.coinXShift;
    if (panel.PanelID == 1) {
      richText0.x = config.tableCenterX + config.coinXShift;
    }
    richText0.y = 163;
    richText0.anchor.set(0.5, 0.5);
    richText0.anchor.set(0.5, 0.5);

    gameSetup.stage.addChild(richText0);
    panel.goldCoinText = richText0;
    pi.goldCoinText = richText0;
    pi.extraCoins = 0; // cum count on how much he earned during this game

    pi.addCoins = (s) => {
      pi.extraCoins += Number(s);
      const coinstr = `${pi.playerCoins} + ${pi.extraCoins}`;
      panel.goldCoinText.text = coinstr;
    };
  };


  this.addPlayerTimer = (panel, pi) => {
      // add count down clock
      const config = gameSetup.config;
      const size = Math.floor(3 * config.scalingratio);
      const style0 = new PIXI.TextStyle({
        fontFamily:  "\"Droid Sans\", sans-serif",
        fontSize: size,
        fontStyle: '',
        fontWeight: 'bold',
        fill: ['#FFFFFF'],  // DEEBF7
        stroke: '#FFFFFF',
        strokeThickness: 2,
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
      panel.clockTimeStr = "10:00";
      if (gameSetup.difficulty == ADVANCED) {
        panel.clockTimeStr = "20:00";
      }
      panel.inTimeCountDown = false;

      const richText0 = new PIXI.Text(panel.clockTimeStr, style0);
      richText0.x = panel.cx + panel.clockXShift;
      richText0.y = 90;
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


      if (gameSetup.controller.gameState > BREAK_SHOT_STATE || gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {

        if (b.ballIDLabel) {
          b.ballIDLabel.visible = true; // aaaa test
          b.ballIDLabel.position.x = b.position[0];
          b.ballIDLabel.position.y = b.position[1] + gameSetup.config.ballD * 1;
        } else {
          // add ball ID label

        }
      }

      // ccccc
      if (hideTrail)
        continue;


      if (b2.trail.length == 0) continue;
      // if (i != 21) continue;

      g.lineStyle(config.forecastGWidth, b2.ball.color, 1);
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

    if (gameSetup.gameType != GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // console.log("do clear aim ball mark");
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


  const recordRailTouchInfo = (myID,railname) => {
    if (!["polybody0","polybody1","polybody2","polybody3","polybody4","polybody5"].includes(railname)) return;
    if (gameSetup.firstBallTouchedByCueball !== null) {
      gameSetup.someBallTouchedRailedAfter = true;
    }

    if (myID !== 0) {
      if (myID == gameSetup.targetBallID) {
        gameSetup.railsTouchedByTargetBall.push(railname);
      }
      if (!gameSetup.ballsTouchedRails.includes(myID)) {
        gameSetup.ballsTouchedRails.push(myID);
      }
    } else { // cue ball
      if (gameSetup.firstBallTouchedByCueball == null) {
        gameSetup.firstBallTouchAfterRail = true;
      }
      gameSetup.railsTouchedByCueBall.push(railname);
    }


    if (gameSetup.closestPointTarget != null && myID == gameSetup.closestPointBallID) {
      gameSetup.closestTargetBallTouchedRails.push(railname);

      if (gameSetup.closestTargetBallTouchedRails.length == 2) {
        if (gameSetup.closestPointBallID != 0 || !gameSetup.ballbodies2[0].hasFirstContact) {

          // shift by 30
          const ballPos = gameSetup.ballbodies2[gameSetup.closestPointBallID];
          const newobj = {x: ballPos.oldx, y: ballPos.oldy};
          const newdist = dist2(newobj, gameSetup.closestPointTarget);
          if (newdist <= gameSetup.closestPointDistance+0.001 ) {
            const shift = Math.max(1, newdist / 2);
            if (railname == "polybody4" ) { newobj.x -= shift/3;}
            if (railname == "polybody5" ) { newobj.x += shift/3;}
            if (railname == "polybody0" || railname == "polybody2" ) { newobj.y -= shift;}
            if (railname == "polybody1" || railname == "polybody3" ) { newobj.y += shift;}

            // if (newdist < 100) console.log("cushion update CTP " + gameSetup.closestPointDistance + " to " + newdist + " old CTP " + (gameSetup.closestPointTarget.x - gameSetup.config.tableCenterX) + " " + (gameSetup.closestPointTarget.y - gameSetup.config.tableCenterY) +  " " + (newobj.x - gameSetup.config.tableCenterX) + " " + (newobj.y - gameSetup.config.tableCenterY));
            gameSetup.closestPointDistance = newdist;
            gameSetup.closestPoint.x = newobj.x;
            gameSetup.closestPoint.y = newobj.y;
          }
        }


      }
    }
  };

  gameSetup.setupContactEvent = () => {
    /*
          0          2
        4               5
          1          3

    */
    const allValidRails = [ [1, 3, 5], [1, 3], [1, 3, 4], [0, 2, 4], [0, 2], [0, 2, 5] ];
    world.on("beginContact", (evt) => {
      const b = evt.contactEquations[0].bodyA;
      const b2 = evt.contactEquations[0].bodyB;
      if (b.name == "ball" && b2.name == "ball") {
        if (b.ID == 0) {
          //console.log("world begin contact 1 " + b.ID + " " + b2.ID + " " + b.position[0] + " " + b.position[1]);
          b.hasFirstContact = true;
          //if (gameSetup.firstBallTouchedByCueball === null && [0,1,2,3,4,5].includes(gameSetup.targetPocketID) ) {
            if (gameSetup.firstBallTouchedByCueball === null ) {
            gameSetup.firstBallTouchedByCueball = b2;
            if (b.touchedRail && [0,1,2,3,4,5].includes(gameSetup.targetPocketID) ) {
              const validRails = allValidRails[gameSetup.targetPocketID];
              let validBankShot = false;
              for (let k=0; k<gameSetup.railsTouchedByCueBall.length; k++) {
                const railNumber = Number(gameSetup.railsTouchedByCueBall[k].substring(8));
                if (validRails.includes(railNumber)) {
                  gameSetup.isKickShot = true; break;
                }
              }
            }

          }
          b.touchedBall = true;
        }
        if (b2.ID == 0) {
          // console.log("world begin contact 2 " + b.ID + " " + b2.ID + " " + (b2.position[0] - gameSetup.config.tableCenterX) + " " + (b2.position[1] - gameSetup.config.tableCenterY));
          b2.hasFirstContact = true;
          if (gameSetup.firstBallTouchedByCueball === null ) {
            // console.log("setting gameSetup.firstBallTouchedByCueball = b; color " + b.colorType);
            gameSetup.firstBallTouchedByCueball = b;
            if (b2.touchedRail && [0,1,2,3,4,5].includes(gameSetup.targetPocketID) ) {
              const validRails = allValidRails[gameSetup.targetPocketID];
              let validBankShot = false;
              for (let k=0; k<gameSetup.railsTouchedByCueBall.length; k++) {
                const railNumber = Number(gameSetup.railsTouchedByCueBall[k].substring(8));
                if (validRails.includes(railNumber)) {
                  gameSetup.isKickShot = true; break;
                }
              }
            }
          }
          b2.touchedBall = true;
        }
        gameSetup.sounds.ballclick.play();
      } else {
        let cname = b2.name;
        if (b.name == "ball") {
          recordRailTouchInfo(b.ID, b2.name);
          if (b.ID == 0) b.touchedRail = true;
        } else {
          recordRailTouchInfo(b2.ID, b.name);
          if (b2.ID == 0) b2.touchedRail = true;
          cname = b.name;
        }
        if (gameSetup.firstCushionTouchedByBall == null) {
          gameSetup.firstCushionTouchedByBall = cname;
        }
        if (gameSetup.firstBallTouchCushion == null) {
          if (b.name == "ball")
            gameSetup.firstBallTouchCushion = b.ID;
          else
            gameSetup.firstBallTouchCushion = b2.ID;
        }
        gameSetup.sounds.ballbouncerail.play();
      }
    });

    // const p1 = new Victor(0,0);
    // const p2 = new Victor(0,0);
    // const v1 = new Victor(0, 0);
    // const v2 = new Victor(0, 0);
    // const rewindCollidingBalls = (b1, b2) => {
    //   // don't need  this for break shot state
    //   if (gameSetup.controller.gameState == 0) return;
    //   // first find which ball is moving faster
    //   console.log("rewindCollidingBalls for " + b1.ID + " " + b2.ID);
    //   const s1 = len2(b1.velocity);
    //   const s2 = len2(b2.velocity);
    //   v1.x = b1.velocity[0];
    //   v1.y = b1.velocity[1];
    //   v2.x = b2.velocity[0];
    //   v2.y = b2.velocity[1];
    //   p1.x = b1.position[0];
    //   p1.y = b1.position[1];
    //   p2.x = b2.position[0];
    //   p2.y = b2.position[1];

    //   // now move both balls back bit by bit until they are only marginally overlapping
    //   let dist = 0; //p1.distance(p2);
    //   const BD = config.ballD;
    //   const scale = 0.25 * BD / ((v1.length() + v2.length()));
    //   v1.scale(scale);
    //   v2.scale(scale);
    //   // debugger;
    //   let cnt = 0;
    //   let prevdist = 0;
    //   while ( true ) {
    //     cnt ++;
    //     if (cnt > 100) break;
    //     dist = p1.distance(p2);
    //     console.log("dist " + dist + " BD " + BD + " p1 " + p1.x.toFixed(2) + " " + p1.y.toFixed(2) + " p1 " + p2.x.toFixed(2) + " " + p2.y.toFixed(2));
    //     if (dist <= BD) {
    //       if (dist >= BD * 0.999) {
    //         // good enough
    //         break;
    //       } else {
    //         // dist still too small
    //         prevdist = dist;
    //         p1.subtract(v1); p2.subtract(v2);

    //       }
    //     } else {
    //       // distance is too large
    //       const ratio = (BD*0.99 - prevdist)/(dist - prevdist);
    //       v1.scale(1-ratio);
    //       v2.scale(1-ratio);
    //       p1.add(v1); p2.add(v2);
    //       break;
    //     }
    //   }

    //   // set ball positions before equation solving
    //   b1.position[0] = p1.x;
    //   b1.position[1] = p1.y;
    //   b2.position[0] = p2.x;
    //   b2.position[1] = p2.y;
    // };

    // too late
    // world2.on("preSolve", (evt) => {
    //   if (evt.contactEquations.length == 0) return;
    //   const b = evt.contactEquations[0].bodyA;
    //   const b2 = evt.contactEquations[0].bodyB;
    //   if (b.name == "ball" && b2.name == "ball") {
    //     // rewind ball pos back a bit so that the outgoing direction is correct
    //     rewindCollidingBalls(b, b2);
    //   }
    // });


    world2.on("beginContact", (evt) => {
      const b = evt.contactEquations[0].bodyA;
      const b2 = evt.contactEquations[0].bodyB;
      if (b.name == "ball" && b2.name == "ball") {
        if (b.ID == 0) {
          b.hasFirstContact = true;
          if (gameSetup.firstBallTouchedByCueball === null) {
            gameSetup.firstBallTouchedByCueball = b2;
          }
          b.touchedBall = true;
        }
        if (b2.ID == 0) {
          // console.log("world2  begin contact 2 " + b.ID + " " + b2.ID + " " + (b2.position[0] - gameSetup.config.tableCenterX) + " " + (b2.position[1] - gameSetup.config.tableCenterY));




          b2.hasFirstContact = true;
          if (gameSetup.firstBallTouchedByCueball === null) {
            gameSetup.firstBallTouchedByCueball = b;
          }
          b2.touchedBall = true;
        }
      } else {
        if (b.name == "ball") {
          recordRailTouchInfo(b.ID, b2.name);
          if (b.ID == 0) b.touchedRail = true;
        } else {
          recordRailTouchInfo(b2.ID, b.name);
          if (b2.ID == 0) b2.touchedRail = true;
        }
      }

      if (b.name == "ball" && b.trail && b.inPocketID == null) {
        b.trail.push([b.position[0], b.position[1]]);
        // console.log("adding trail point " + b.ID + " " + b.position[0] + " " + b.position[1]);
      }
      if (b2.name == "ball" && b2.trail && b2.inPocketID == null) {
        b2.trail.push([b2.position[0], b2.position[1]]);
        // console.log("adding trail point " + b2.ID + " " + b2.position[0] + " " + b2.position[1]);
      }
    });
  };

  this.setupForecast = () => {
    const config = gameSetup.config;
    if (!gameSetup.cueballDirection) {
      // console.log("reset cue ball dir to 1,0");
      gameSetup.cueballDirection = new Victor(1, 0);
    }

    let strength = 100;
    if (gameSetup.speedMeterBall)
      strength = gameSetup.speedMeterBall.value / 100 * MAX_SPEED;
    const m = 100;
    // const turnSpeed = Math.max(500, 2 * m * strength); // the higher is I, the less we turn
    // gameSetup.cueballDirection.rotate(0 - Math.PI / turnSpeed);


    gameSetup.prevStrength = 0;
    gameSetup.prevspinMultiplier = 0;
    gameSetup.prevDirX = 0;
    gameSetup.prevDirY = 0;


        // gameSetup.cueballDirection = new Victor(861.9682516429777, -5.169456405744111);
        // gameSetup.cueballDirection = new Victor(1, 0);
        // gameSetup.cueballAV = new Victor(-2000,0);
    let sizeratio = 0.8;
    // 10/90?
    gameSetup.slidingFriction = Math.fround(config.ballD / 1.1); // changed from 5 to 1! larger -> more curving since more speed store into av. controls how much is transferred between angular v and v on each step
    gameSetup.speedDecay = Math.fround(22); // larger -> sliding further. controls how speed slows down each cycle especially when ball is slow

        // var testtarget = new Victor(-1 + config.tableCenterX + sizeratio*config.sidePocketD/2 + config.cushionBarShift/4, - 10 + config.tableCenterY+config.tableH/2 - config.cushionBarThick);
        // testtarget = new Victor(842.815, 180.495);
        // testtarget = new Victor(842.815, 176.495);
        // gameSetup.cueballDirection = testtarget.subtract(gameSetup.cueball.oldp);
        // gameSetup.maxForecastCount = 5;
        // gameSetup.forecastGs = [];
        // for(var i = 0; i < gameSetup.maxForecastCount; i ++) {
        //     gameSetup.forecastGs.push(gameSetup.add.graphics(0, 0));
        // }

        // gameSetup.cueballForecastG = null;

    // gameSetup.cueTrailG = gameSetup.add.graphics(0, 0);
    // gameSetup.cueTrailG.lineStyle(config.ballD * 0.05, 0x0000a0, 1);

    // gameSetup.otherTrailG = gameSetup.add.graphics(0, 0);
    // gameSetup.otherTrailG.lineStyle(config.ballD * 0.2, 0xa0a000, 1);

    // gameSetup.otherTrailG2 = gameSetup.add.graphics(0, 0);
    // gameSetup.otherTrailG2.lineStyle(config.ballD * 0.2, 0xa09030, 1);


    sizeratio = 0.8; // for side pocket
    const points0 = [ // left top
      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift,
      config.tableCenterY - config.tableH / 2,
      config.tableCenterX - sizeratio * config.sidePocketD / 2,
      config.tableCenterY - config.tableH / 2,
      config.tableCenterX - sizeratio * config.sidePocketD / 2 - config.cushionBarShift / 4,
      config.tableCenterY - config.tableH / 2 + config.cushionBarThick,
      config.tableCenterX - config.tableW / 2 + config.cornerPocketD / 2 - config.pocketShift + config.cushionBarShift,
      config.tableCenterY - config.tableH / 2 + config.cushionBarThick
    ];

    gameSetup.borderLines = []; gameSetup.borderCorners = [];
    gameSetup.borderLines.push({ // 0: top left pocket right edge
      p1: new Victor(points0[0], points0[1]), p2: new Victor(points0[6], points0[7]), norm: 'ANY'
    });

    gameSetup.borderCorners.push(new Victor(points0[6], points0[7])); // 0: top left pocket right edge

    gameSetup.borderLines.push({ // 1: left top long bar
      p1: new Victor(points0[6], points0[7]), p2: new Victor(points0[4], points0[5]), norm: 'DOWN'
    });
    gameSetup.borderCorners.push(new Victor(points0[4], points0[5])); // 1: top pocket left edge

    gameSetup.borderLines.push({ // 2: top pocket left edge
      p1: new Victor(points0[4], points0[5]), p2: new Victor(points0[2], points0[3]), norm: 'ANY'
    });


    const points1 = [
      points0[0], config.tableCenterY * 2 - points0[1],
      points0[2], config.tableCenterY * 2 - points0[3],
      points0[4], config.tableCenterY * 2 - points0[5],
      points0[6], config.tableCenterY * 2 - points0[7],
            // config.tableCenterX - sizeratio*config.sidePocketD/2,
            //     config.tableCenterY+config.tableH/2,
            // config.tableCenterX - sizeratio*config.sidePocketD/2 - config.cushionBarShift/4,
            //     config.tableCenterY+config.tableH/2 - config.cushionBarThick,
            // config.tableCenterX - config.tableW/2 + config.cornerPocketD/2 - config.pocketShift + config.cushionBarShift, config.tableCenterY+config.tableH/2 - config.cushionBarThick
    ];

    gameSetup.borderLines.push({ // 3: bottom left pocket right edge
      p1: new Victor(points1[6], points1[7]), p2: new Victor(points1[0], points1[1]), norm: 'ANY'
    });

    gameSetup.borderCorners.push(new Victor(points1[6], points1[7])); // 2: bottom left pocket right edge

    gameSetup.borderLines.push({ // 4: left bottom long bar
      p1: new Victor(points1[4], points1[5]), p2: new Victor(points1[6], points1[7]), norm: 'UP'
    });
    gameSetup.borderCorners.push(new Victor(points1[4], points1[5])); // 3: bottom pocket left edge

    gameSetup.borderLines.push({ // 5: bottom pocket left edge
      p1: new Victor(points1[2], points1[3]), p2: new Victor(points1[4], points1[5]), norm: 'ANY'
    });

    const points2 = [
      config.tableCenterX * 2 - points0[0], points0[1],
      config.tableCenterX * 2 - points0[2], points0[3],
      config.tableCenterX * 2 - points0[4], points0[5],
      config.tableCenterX * 2 - points0[6], points0[7]
    ];

    gameSetup.borderLines.push({ // 6: top right pocket left edge
      p2: new Victor(points2[0], points2[1]), p1: new Victor(points2[6], points2[7]), norm: 'ANY'
    });

    gameSetup.borderCorners.push(new Victor(points2[6], points2[7])); // 4: top right pocket left edge

    gameSetup.borderLines.push({ // 7: right top long bar
      p2: new Victor(points2[6], points2[7]), p1: new Victor(points2[4], points2[5]), norm: 'DOWN'
    });
    gameSetup.borderCorners.push(new Victor(points2[4], points2[5])); // 5: top pocket right edge

    gameSetup.borderLines.push({ // 8: top pocket right edge
      p2: new Victor(points2[4], points2[5]), p1: new Victor(points2[2], points2[3]), norm: 'ANY'
    });


    const points3 = [
      config.tableCenterX * 2 - points1[0], points1[1],
      config.tableCenterX * 2 - points1[2], points1[3],
      config.tableCenterX * 2 - points1[4], points1[5],
      config.tableCenterX * 2 - points1[6], points1[7]
    ];

    gameSetup.borderLines.push({ // 9: bottom right pocket left edge
      p2: new Victor(points3[6], points3[7]), p1: new Victor(points3[0], points3[1]), norm: 'ANY'
    });

    gameSetup.borderCorners.push(new Victor(points3[6], points3[7])); // 6: bottom right pocket left edge

    gameSetup.borderLines.push({ // 10: right bottom long bar
      p2: new Victor(points3[4], points3[5]), p1: new Victor(points3[6], points3[7]), norm: 'UP'
    });
    gameSetup.borderCorners.push(new Victor(points3[4], points3[5])); // 7: bottom pocket right edge

    gameSetup.borderLines.push({ // 11: bottom pocket right edge
      p2: new Victor(points3[2], points3[3]), p1: new Victor(points3[4], points3[5]), norm: 'ANY'
    });


    const points4 = [
      config.tableCenterX - config.tableW / 2,
      config.tableCenterY - config.tableH / 2 + 1.2 * config.sidePocketD / 2,
      config.tableCenterX - config.tableW / 2,
      config.tableCenterY + config.tableH / 2 - 1.12 * config.sidePocketD / 2,
      config.tableCenterX - config.tableW / 2 + config.cushionBarThick,
      config.tableCenterY + config.tableH / 2 - 1.12 * config.sidePocketD / 2 - config.cushionBarShift,
      config.tableCenterX - config.tableW / 2 + config.cushionBarThick,
      config.tableCenterY - config.tableH / 2 + 1.2 * config.sidePocketD / 2 + config.cushionBarShift
    ];

    gameSetup.borderLines.push({ // 12: top left pocket left edge
      p1: new Victor(points4[6], points4[7]), p2: new Victor(points4[0], points4[1]), norm: 'ANY'
    });

    gameSetup.borderCorners.push(new Victor(points4[6], points4[7])); // 8: top left pocket left edge

    gameSetup.borderLines.push({ // 13: left long bar
      p1: new Victor(points4[4], points4[5]), p2: new Victor(points4[6], points4[7]), norm: 'RIGHT'
    });
    gameSetup.borderCorners.push(new Victor(points4[4], points4[5])); // 9: bottom left pocket left edge

    gameSetup.borderLines.push({ // 14: bottom left pocket left edge
      p1: new Victor(points4[2], points4[3]), p2: new Victor(points4[4], points4[5]), norm: 'ANY'
    });


    const points5 = [
      config.tableCenterX * 2 - points4[0], points4[1],
      config.tableCenterX * 2 - points4[2], points4[3],
      config.tableCenterX * 2 - points4[4], points4[5],
      config.tableCenterX * 2 - points4[6], points4[7]
    ];

    gameSetup.borderLines.push({ // 15: top right pocket right edge
      p1: new Victor(points5[0], points5[1]), p2: new Victor(points5[6], points5[7]), norm: 'ANY'
    });

    gameSetup.borderCorners.push(new Victor(points5[6], points5[7])); // 10: top right pocket right edge

    gameSetup.borderLines.push({ // 16: right long bar
      p1: new Victor(points5[6], points5[7]), p2: new Victor(points5[4], points5[5]), norm: 'LEFT'
    });
    gameSetup.borderCorners.push(new Victor(points5[4], points5[5])); // 11: bottom right pocket right edge

    gameSetup.borderLines.push({ // 17: bottom right pocket right edge
      p1: new Victor(points5[4], points5[5]), p2: new Victor(points5[2], points5[3]), norm: 'ANY'
    });

        /*
        gameSetup.borderLines.sort(function(a,b) {
            var alen = dist2(a.p1, a.p2);
            var blen = dist2(b.p1, b.p2);
            if ( alen > blen ) {
                return -1;
            }
            if ( alen < blen) {
                return 1;
            }
            return 0;
        });
        */

        // shift out all lines by ball radius
    gameSetup.shiftedBorderLines = [];
    gameSetup.fullyShiftedBorderLines = [];
    gameSetup.ballDCushion = config.ballD / 60;
    const ballDCushion = gameSetup.ballDCushion;
    for (let i = 0; i < gameSetup.borderLines.length; i++) {
      const line = gameSetup.borderLines[i];
            // console.log("borderline " + i + ": " + line.p1.x + " " + line.p1.y + " " + line.p2.x + " " + line.p2.y);
      const lineDir = line.p2.clone().subtract(line.p1);
      const normalDir = lineDir.clone().rotate(Math.PI / 2).normalize().multiplyScalar(config.ballD * 0.45);
      const normalDirFull = lineDir.clone().rotate(Math.PI / 2).normalize().multiplyScalar(config.ballD / 2 - ballDCushion);
      gameSetup.shiftedBorderLines.push({
        p1: line.p1.clone().add(normalDir), p2: line.p2.clone().add(normalDir), norm: line.norm
      });
      gameSetup.fullyShiftedBorderLines.push({
        p1: line.p1.clone().add(normalDirFull), p2: line.p2.clone().add(normalDirFull), norm: line.norm
      });
    }

        // 4 table top border lines
        // gameSetup.tableTopBorders = [];
        // var p0 = new Victor(config.tableCenterX - config.tableW/2, config.tableCenterY - config.tableH/2);
        // var p1 = new Victor(config.tableCenterX + config.tableW/2, config.tableCenterY - config.tableH/2);
        // var p2 = new Victor(config.tableCenterX + config.tableW/2, config.tableCenterY + config.tableH/2);
        // var p3 = new Victor(config.tableCenterX - config.tableW/2, config.tableCenterY + config.tableH/2);

        // gameSetup.tableTopBorders.push({p1: p0, p2: p1});
        // gameSetup.tableTopBorders.push({p1: p1, p2: p2});
        // gameSetup.tableTopBorders.push({p1: p2, p2: p3});
        // gameSetup.tableTopBorders.push({p1: p3, p2: p0});


        // center rectangle
    const R = 2; // 1.1
    gameSetup.centerRectangle = new PIXI.Rectangle(
      config.tableCenterX - config.tableW / 2 + config.ballD * R,
      config.tableCenterY - config.tableH / 2 + config.ballD * R,
      config.tableW - config.ballD * 2 * R,
      config.tableH - config.ballD * 2 * R
    );

    gameSetup.innerRectangle = new PIXI.Rectangle(
      config.tableCenterX - config.tableW / 2 + config.ballD / 2 + config.cushionBarThick,
      config.tableCenterY - config.tableH / 2 + config.ballD / 2 + config.cushionBarThick,
      config.tableW - config.ballD - 2 * config.cushionBarThick,
      config.tableH - config.ballD - 2 * config.cushionBarThick
    );


        // gameSetup.centerRectangle = new Phaser.Rectangle(
        //     config.tableCenterX - config.tableW/2 + config.cushionBarThick + config.ballD/2 - ballDCushion +1,
        //     config.tableCenterY - config.tableH/2 + config.cushionBarThick + config.ballD/2 - ballDCushion +1,
        //     config.tableW - 2*config.cushionBarThick - config.ballD + 2*ballDCushion - 2,
        //     config.tableH - 2*config.cushionBarThick - config.ballD + 2*ballDCushion- 2
        //     );

        // for debugging:

    // if (false) {
    //   const g = gameSetup.add.graphics(0, 0);
    //   g.lineStyle(1, 0xffffff, 0.5);
    //   for (var i = 0; i < gameSetup.fullyShiftedBorderLines.length; i++) {
    //     var line = gameSetup.fullyShiftedBorderLines[i];
    //     g.moveTo(line.p1.x, line.p1.y);
    //     g.lineTo(line.p2.x, line.p2.y);
    //   }
    // }


    gameSetup.setupContactEvent();
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
    gameSetup.timerID = setInterval(() => {
      if (gameSetup.gameOver) return;
      if (!gameSetup.activePlayerInfo) return;

      let secondsPassedInThisSection = Date.now() - gameSetup.activePlayerInfo.countdownStartTIme;
      secondsPassedInThisSection = Math.round(secondsPassedInThisSection/1000);

      gameSetup.activePlayerInfo.secondsLeft = gameSetup.activePlayerInfo.secondsLeftStart - secondsPassedInThisSection;
      gameSetup.activePlayerInfo.c.updateTimer(gameSetup.activePlayerInfo.secondsLeft);

      if (gameSetup.isHost) {
        if (gameSetup.activePlayerInfo.secondsLeft <= 0) {
          gameSetup.controller.setNewPlayerState(gameSetup.waitingPlayerInfo.ID, GAME_OVER_STATE, -1, -10000, -10000, `The player ${gameSetup.activePlayerInfo.username} has timed out.`);

          clearInterval(gameSetup.timerID);

          return;

        }
      }

      if (!gameSetup.isLocal) {
        let previewString = "";
        const timediff = (gameSetup.currentCycleTime - gameSetup.lastPreviewTime) / 1000;
        if (timediff >= 3 || !gameSetup.lastPreviewTime) {
          if (gameSetup.savedStrength) {
            previewString = `_${gameSetup.activePlayerInfo.ID}_${Math.fround(gameSetup.savedStrength)}_${Math.fround(gameSetup.savedDirX)}_${Math.fround(gameSetup.savedDirY)}_${Math.fround(gameSetup.savedspinMultiplier)}_${Math.fround(gameSetup.savedhspin)}_${gameSetup.savedBallID}_${gameSetup.savedPocketID}`;
            delete gameSetup.savedStrength;
            gameSetup.lastPreviewTime = gameSetup.currentCycleTime;
          }
        }

        if (previewString != "") {
          gameSetup.networkHandler.sendCommandToAll({ c: "UT", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${gameSetup.activePlayerInfo.secondsLeft}${previewString}`});
        }
      }




    }, 1000);
  };



  this.setupTimerUpdateOld = () => {

    // use setInterval so it works even when tab is switched off
    // each host has his own timer for both player, so that even if
    // one player leaves game room abruptly the other one still has the timer


    if (gameSetup.isHost) {
      gameSetup.timerID = setInterval(() => {
        if (gameSetup.gameOver) return;
        if (!gameSetup.activePlayerInfo) return;

        gameSetup.activePlayerInfo.secondsLeft -= 1;
        if (gameSetup.activePlayerInfo.secondsLeft <= 0) {
          gameSetup.controller.setNewPlayerState(gameSetup.waitingPlayerInfo.ID, GAME_OVER_STATE, -1, -10000, -10000, `The player ${gameSetup.activePlayerInfo.username} has timed out.`);

          // if (gameSetup.isLocal) {
          //   //gameSetup.activePlayerInfo.c.updateTimer(gameSetup.activePlayerInfo.secondsLeft);
          //   // just show game over screen
          //   // gamesSetup.showModalMessage(`The Winner Is ${gameSetup.activePlayerInfo.ID}!`, `The player ${gameSetup.waitingPlayerInfo.ID} has timed out.`);

          // } else {
          //   //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          //   gameSetup.networkHandler.sendCommandToAll({
          //     c: "UT", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${gameSetup.activePlayerInfo.secondsLeft}`
          //   });
          // }

          return;
        }
        if (gameSetup.isLocal) {
          gameSetup.activePlayerInfo.c.updateTimer(gameSetup.activePlayerInfo.secondsLeft);
        } else {

          let previewString = "";
          if (gameSetup.savedStrength) {
            previewString = `_${gameSetup.activePlayerInfo.ID}_${Math.fround(gameSetup.savedStrength)}_${Math.fround(gameSetup.savedDirX)}_${Math.fround(gameSetup.savedDirY)}_${Math.fround(gameSetup.savedspinMultiplier)}_${Math.fround(gameSetup.savedhspin)}_${gameSetup.savedBallID}_${gameSetup.savedPocketID}`;
            delete gameSetup.savedStrength;
          }

          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "UT", t: gameSetup.currentCycleTime, w: `${gameSetup.activePlayerInfo.ID}_${gameSetup.activePlayerInfo.secondsLeft}${previewString}`
          });
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

          let previewString = "";
          if (gameSetup.savedStrength) {
            previewString = `_${gameSetup.activePlayerInfo.ID}_${Math.fround(gameSetup.savedStrength)}_${Math.fround(gameSetup.savedDirX)}_${Math.fround(gameSetup.savedDirY)}_${Math.fround(gameSetup.savedspinMultiplier)}_${Math.fround(gameSetup.savedhspin)}_${gameSetup.savedBallID}_${gameSetup.savedPocketID}`;
            delete gameSetup.savedStrength;
          }

          //this.setNewPlayerState(gameSetup.activePlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          gameSetup.networkHandler.sendCommandToAll({
            c: "KA", t: gameSetup.currentCycleTime, w: `${0}${previewString}`
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



  this.createControls = () => {
    gameSetup.downlisteners = [];
    gameSetup.uplisteners = [];
    gameSetup.controlButtons = [];
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

    const config = gameSetup.config;

    this.addBackGround();

    // this.addNameTagSign();
    this.addHitButton();
    this.addProbText();
    this.addCWNew();
    this.addStrengthBallNew();
    this.addVSpinBallNew();
    this.addHSpinBallNew();
    this.setupMeterClick();
    this.setupKeyboardControl();


    config.playerPanel1.PanelID = 0;
    gameSetup.playerInfo1.bg = this.addPlayerPanelNew(config.playerPanel1, gameSetup.playerInfo1);
    gameSetup.playerInfo1.c = config.playerPanel1;

    config.playerPanel2.PanelID = 1;
    // config.playerPanel2.isHuman = false; // hack to test
    gameSetup.playerInfo2.bg = this.addPlayerPanelNew(config.playerPanel2, gameSetup.playerInfo2);
    gameSetup.playerInfo2.c = config.playerPanel2;

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

      // setTimeout(() => {
      //   f.position.x = anchor.position.x + (0.5 - Math.random()) * gameSetup.config.tableW * 0.2;
      //   f.position.y = anchor.position.y + (0.5 - Math.random()) * gameSetup.config.tableH * 0.2;
      //   f.play();
      // }, time2);

      // setTimeout(() => {
      //   // f.loop = false;
      //   // f.stop();
      //   // f.visible = false;
      // }, 3000);

    }


  };

  this.addFirework = (colorname, color) => {
    const config = gameSetup.config;
    //this.loadFramedSpriteSheet(`/images/newpool/firework1.png`, 'firework', 256, 256, 15, (frames) => {
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

    // add transparent beijing
    const bj3 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/bj3b.png"].texture);

    let bj3ratio = (config.tableW * 1.2) / 1000;
    bj3.scale.set(bj3ratio*1.2, bj3ratio * 1); // will overflow on bottom

    bj3.position.x = config.tableCenterX + config.tableW * 0.02;
    bj3.position.y = config.tableCenterY;
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
    endoverlay.position.y = config.tableCenterY - config.tableH * 0.032;
    endoverlay.anchor.set(0.5, 0.5);
    endoverlay.interactive = false;
    endoverlay.visible = false;
    endoverlay.alpha = 1;
    endoverlay.zOrder = 109;
    gameSetup.stage.addChild(endoverlay);
    gameSetup.endoverlay = endoverlay;

    // winner icon
    const winner = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/winner.png"].texture);

    let winnerratio = (config.tableW * 0.1) / 175;
    winner.scale.set(winnerratio, winnerratio); // will overflow on bottom

    winner.position.x = config.tableCenterX - config.tableW * 0.18;
    winner.position.y = config.tableCenterY - config.tableH * 0.29;
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
    let ratio = 0.9;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/exit_2.png"].texture);
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.tableCenterX;
    if (gameSetup.gameType == GAME_TYPE.PRACTICE) bg2.position.x -= config.tableW * 0.15;
    bg2.position.y = config.tableCenterY + 300;
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
        .to({ s: 1 }, 1200) // if strength is 1000, then 1 second
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
      rbg2.position.y = config.tableCenterY + 300;
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
          .to({ s: 1 }, 1200) // if strength is 1000, then 1 second
          .easing(TWEEN.Easing.Elastic.Out) // Use an easing function to make the animation smooth.
          .onUpdate(() => { // Called after tween.js updates 'coords'.
            rbg2.scale.x = obj.s;
            rbg2.scale.y = obj.s;
          });

        tween.start();
      };

    }






    gameSetup.showEndOfGame = (winnerID) => {
      bj3.visible = true;
      endoverlay.visible = true;

      winner.visible = false;
      if (winnerID == 1) {
        winner.position.x = config.tableCenterX + config.tableW * 0.18;
      }

      for (let ind=0; ind <=1; ind++) {
        const pi = gameSetup.playerInfo[ind];

        const a = PIXI.Sprite.fromImage(pi.playerAvatarURL, true);
        a.texture.baseTexture.on('loaded', function(){
          // console.log(a.texture.orig.width, a.texture.orig.height);
          a.scale.set(130 / a.texture.orig.width, 130 / a.texture.orig.height);
        });

        a.scale.set(130 / a.texture.orig.width, 130 / a.texture.orig.height);
        a.position.x = config.tableCenterX+ 363 * (-1 + 2*ind);
        a.position.y = config.tableCenterY - 110;
        a.anchor.set(0.5, 0.5);
        gameSetup.stage.addChild(a);


        // user name

        const text = new PIXI.Text(pi.username, style);
        text.position.x = a.position.x;
        text.position.y = config.tableCenterY + 20;
        text.anchor.set(0.5, 0.5);
        gameSetup.stage.addChild(text);



        // gold message
        let goldstring = pi.playerCoins;
        if (pi.extraCoins > 0) {
          goldstring = pi.playerCoins + pi.extraCoins;
        }
        const goldText = new PIXI.Text(goldstring, style2);
        goldText.position.x = config.tableCenterX + 380 * (-1 + 2*ind);
        if (ind == 0) goldText.position.x += 35;
        goldText.position.y = config.tableCenterY + 90;
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
            const newpos = { x: gameSetup.playerInfo[0].endGoldText.position.x, y: gameSetup.playerInfo[0].endGoldText.position.y, s: 0.4 };
            if (winnerID == 1) {
              newpos.x = gameSetup.playerInfo[1].endGoldText.position.x;
              newpos.y = gameSetup.playerInfo[1].endGoldText.position.y;
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
                const oldnumber = Number(gameSetup.playerInfo[winnerID].endGoldText.text);
                gameSetup.playerInfo[winnerID].endGoldText.text = oldnumber + winreward;
                bg2.visible = true;
                // gameSetup.goldemitter.updateOwnerPos(winner.position.x, winner.position.y);
                // gameSetup.goldemitter.emit = true;

                gameSetup.sounds.itemcollected.play();
                gameSetup.goldemitter.updateOwnerPos(gameSetup.playerInfo[winnerID].endGoldText.position.x, gameSetup.playerInfo[winnerID].endGoldText.position.y);
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

    // add tishi
    const tishi = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/tishi.png"].texture);

    let tishiratio = (config.tableW * 1.0) / 1000;
    tishi.scale.set(tishiratio, tishiratio * 1.4); // will overflow on bottom

    tishi.position.x = config.tableCenterX;
    tishi.position.y = config.tableCenterY;
    tishi.anchor.set(0.5, 0.5);
    tishi.interactive = false;
    tishi.visible = false;
    tishi.alpha = 0.9;
    tishi.zOrder = 105;
    gameSetup.stage.addChild(tishi);
    gameSetup.tishi = tishi;


    // add goldIcon
    const goldIcon = new PIXI.Sprite(PIXI.loader.resources["/images/newpool/jinbi.png"].texture);

    let goldIconratio = (config.tableW * 0.06) / 50;
    goldIcon.scale.set(goldIconratio, goldIconratio); // will overflow on bottom

    goldIcon.position.x = config.tableCenterX - config.tableW * 0.03;
    goldIcon.position.y = config.tableCenterY + config.tableH * 0.1;
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
      wordWrapWidth: config.tableW * 0.7
    });

    const t = new PIXI.Text('no message', style);
    t.position.x = config.tableCenterX;
    t.position.y = config.tableCenterY - config.tableH * 0.05;
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
      wordWrapWidth: config.tableW * 0.7
    });

    const goldText = new PIXI.Text('no message', style2);
    goldText.position.x = config.tableCenterX + config.tableW * 0.05;
    goldText.position.y = config.tableCenterY + config.tableH * 0.1;
    goldText.anchor.set(0.5, 0.5);
    goldText.visible = false;
    goldText.zOrder = 101;
    goldText.alpha = 0.9;
    goldText.coinCount = 0;
    gameSetup.stage.addChild(goldText);









    gameSetup.config.hideHeadline = (isFast = false) => {
      //t.visible = false;

      // console.log("hide headline!");
      goldText.isShowing = false;

      if (typeof(TWEEN) == "undefined") return;

      if (isFast) {
        t.alpha = 0;
        tishi.alpha = 0;
        goldText.coinCount = 0;
        goldText.alpha = 0;
        return;
      }

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
      if (gameSetup.gameType !== GAME_TYPE.MATCH && gameSetup.gameType !== GAME_TYPE.BATTLE ) {
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
        goldText.position.x = config.tableCenterX + config.tableW * 0.05;
        goldText.position.y = config.tableCenterY + config.tableH * 0.1;
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
      if (msg.includes("No challenge specified")) timeoutseconds = 1;
      // console.log("show heddline " + msg + " " + timeoutseconds);

      if (gameSetup.hideHeadlineTimer) {
        clearTimeout(gameSetup.hideHeadlineTimer);
      }
      gameSetup.hideHeadlineTimer = setTimeout(gameSetup.config.hideHeadline, timeoutseconds * 1000);

    };

  };


  this.setupTbotMessage = () => {
    const config = gameSetup.config;

    // background
    // const g = new PIXI.Sprite(PIXI.loader.resources["/images/tbotmessagebackground2.png"].texture);

    // let ratio = (config.tableW * 0.88) / 800;
    // g.scale.set(ratio, ratio); // will overflow on bottom

    // g.position.x = config.tableCenterX;
    // g.position.y = config.tableCenterY + config.tableH / 2 + config.cushionBarThick * 1.3;
    // g.anchor.set(0.5, 1);
    // g.interactive = false;
    // g.visible = false;
    // g.alpha = 0.9;
    // g.zOrder = 100;
    // gameSetup.stage.addChild(g);


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
    // const s = new PIXI.Sprite(PIXI.loader.resources["/images/tboticon.png"].texture);
    // s.position.x = config.tableCenterX - config.tableW * 0.39;
    // s.position.y = config.tableCenterY + config.tableH / 2;
    // s.anchor.set(0.5, 0.5);
    // s.scale.set(1.1, 1.1);
    // s.interactive = false;
    // s.visible = false;
    // s.zOrder = 101;
    // gameSetup.stage.addChild(s);

    // message text
    let size = Math.floor(2 * config.scalingratio);
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
      wordWrapWidth: config.tableW * 0.7
    });

    const t = new PIXI.Text('no message', style);
    t.position.x = config.tableCenterX;
    t.position.y = config.tableCenterY + config.tableH / 2 + 110;
    t.anchor.set(0.5, 0.5);
    t.visible = false;
    t.zOrder = 102;
    gameSetup.stage.addChild(t);

    gameSetup.config.hideMessage = () => {
      t.visible = false;
      return;
      if (!g.visible) return;
      // debugger;
      g.visible = false;
      g.interactive = false;
      s.visible = false;
      if (gameSetup.tweenyellowarrow) {
        gameSetup.tweenyellowarrow.stop();
        yellowarrow.visible = false;
      }
    };
    // g.on('pointerdown', () => {
    //   gameSetup.config.hideMessage();
    //   if (gameSetup.tweenyellowarrow) {
    //     gameSetup.tweenyellowarrow.visible = false;
    //     gameSetup.tweenyellowarrow.stop();
    //     delete gameSetup.tweenyellowarrow;
    //   }
    // });

    gameSetup.oldMessage = '';
    gameSetup.config.showMessage = (msg, timeout, x, y) => {
      t.text = msg;
      // g.visible = true;
      // g.interactive = true;
      // s.visible = true;
      t.visible = true;
      gameSetup.oldMessage = msg;
      yellowarrow.visible = false;

      let timeoutseconds = 16;
      if (typeof(timeout) != "undefined") {
        timeoutseconds = timeout;
      }
      if (msg.indexOf("won the game") > 0) {
        timeoutseconds = 100000;
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

    gameSetup.getPosStr = () => {
      let posStr = "";
      const config = gameSetup.config;
      // it's possible ball 0 is not synced!
      for (let k=0; k<gameSetup.balls.length; k++) {
        const b = gameSetup.balls[k];
        if (typeof(b.inPocketID) == "undefined" || b.inPocketID == null) {
          if (isNaN(b.x) || (b.x == 10000 && b.y == 10000)) continue;
          if (b.x > config.tableCenterX + config.tableW * 0.6 || b.x < config.tableCenterX - config.tableW * 0.6) continue;
          if (b.x > config.tableCenterX + config.tableW * 0.6 || b.x < config.tableCenterX - config.tableW * 0.6) continue;
          posStr += `${b.ID}_${b.x}_${b.y}|`;
        }
      }

      posStr += gameSetup.playerInfo[0].chosenColor != null ? gameSetup.playerInfo[0].chosenColor : -1;
      posStr += "|";
      posStr += gameSetup.playerInfo[1].chosenColor != null ? gameSetup.playerInfo[1].chosenColor : -1;
      posStr += "|";
      return posStr;
    };

    gameSetup.setupPeer = (room) => {
      //console.log("setupPeer room['offer1'] " + room["offer1"] + " room['answer1'] " + room["answer1"]);
      // console.log("setupPeer " + (Date.now()));
      gameSetup.room = room;
      // debugger;

      if (gameSetup.isHost) {
        // one peer connection to each other player
        gameSetup.playerID = 0;
        gameSetup.setupOnePeer(1, true); // as host = true
      } else {
        gameSetup.playerID = 1;
        gameSetup.setupOnePeer(1, false); // as host = false
      }
    };



    gameSetup.setupWTCServer = (id) => {
      const room = gameSetup.room;

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
        reconnectTimer: 1000 });

      p.on('signal', function (data) {
        // console.log(" HOST 1 " + (Date.now()));
        console.log(`\n\n\n\n\n\n\n--- HOST 1 --- initial signal call for ${id} saveInitSignalOffer`);
        //HOST_1
        // debugger;
        Meteor.call('saveInitSignalOffer', room._id, id, JSON.stringify(data), (err) => {
          if (err) {
            console.log('error in saveInitSignalOffer ');
          } else {
          }
        });
        p.newlyCreated = false;
        p.offerSaved = true;
      });
      p.newlyCreated = true;
      return p;
    };

    gameSetup.connectToWTCServer = (id) => {
      // const {lobbyInd, lobbys, playerID} = this.props;
      //const game = this.game;
      //const config = game.config;
      // const that = this;
      const room = gameSetup.room;
      console.log('\n\nin connectToWTCServer ' + Date.now());
      const offerKey = `offer${id}`;
      const answerKey = `anwser${id}`;
      console.log("offerKey " + offerKey + " answerkey " + answerKey + " " + room.offer1.substr(0, 10));
      if (typeof(room.offer1) == "undefined") return null;
      if (room.offer1 == "") return null;
      console.log('in connectToWTCServer 2 ' + Date.now());
      if (typeof(room.answer1) == "undefined") {
        console.log("answer1 is undefined");
        return null;
      }
      if (room.answer1 == "") return null;

      console.log('in connectToWTCServer 3 ' + Date.now());
      console.log("room[answer1] " + room.answer1);
      if (room.answer1 !== "newoffer") return null;
      if (gameSetup.offerSignaled) {
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
        reconnectTimer: 1000 });


      gameSetup.savedOffer1 = room.offer1;

      gameSetup.peer = null;
      console.log("\n\n--- GUEST 1 --- to signal offer "  + Date.now()); // + " " + room.offer1);
      p.answer = "";
      //GUEST_1
      // debugger;
      try {
        p.signal(JSON.parse(room.offer1));
        gameSetup.offerSignaled = true;
      } catch (err) {
        console.log(" guest signal error ");
      }

      p.on('signal', function (data) {
          console.log('\n\n\n\n--- GUEST 2 --- answer SIGNAL'); //, JSON.stringify(data));
          // debugger;
      //GUEST_2
      // debugger;
      //document.querySelector('#outgoing').textContent = JSON.stringify(data)
          Meteor.call('saveInitSignalAnswer', room._id, id, JSON.stringify(data));
      });
      return p;
    };

    gameSetup.doRetry = () => {
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

      console.log("\n\n\n\n\n\n\n\n\ntrying " + gameSetup.retryCount + " ... resetRoomConnection");

      // if (gameSetup.isHost) {
        Meteor.call('resetRoomConnection', gameSetup.room._id);
      // }

      gameSetup.peerReady = false;
    };

    gameSetup.setupOnePeer = (id, asHost) => {
      /**
       * how signalling works:
       * 1. initiator on start, will get a 'signal' -> save it to lobby as offer
       * 2. joiner get the offer signal, call p.signal with it
       * 3. joiner get a 'signal' -> save it to lobby as answer
       * 4. initiator will read the answer signal, and call p.signal with it again
       * 5. joiner will get 'connect' this time.
       */
      // console.log("in setupOnePeer " + id + " " + asHost + " " + (Date.now()));
      const that = gameSetup;
      const room = gameSetup.room;
      // let peer = gameSetup.allPeers[id];
      // let peer = gameSetup.peer;
      console.log(`\n** room is ${JSON.stringify(room.offer1).substr(0, 10)} ${JSON.stringify(room.answer1).substr(0, 10)}`);

      if (room.offer1 == "" && room.answer1 == "") {
        if (gameSetup.isHost && gameSetup.peer) {
          console.log("at host with peer, room both empty, at host gameSetup.peer.newlyCreated " + gameSetup.peer.newlyCreated);
        }
        if (gameSetup.isHost && gameSetup.peer && gameSetup.peer.newlyCreated) {
          console.log("newly created room so just ignore this room reset");
          return;
        }

        console.log(`room reset! `);
        // console.log(`delete gameSetup.peer 1!`);
        if (gameSetup.peer)
          gameSetup.peer.destroy();
        delete gameSetup.peer;
        delete gameSetup.networkHandler;
        gameSetup.peer = null;
        gameSetup.answerSignaled = false;
        gameSetup.offerSignaled = false;

        if (gameSetup.isHost) {
          // setup a timer to try to reconnect
          if (gameSetup.tryReconnectTimer) clearTimeout(gameSetup.tryReconnectTimer);
          gameSetup.tryReconnectTimer = setTimeout(() => {
            // check for reconnect
            if (!gameSetup.networkHandler) {
              console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nnot connected after 8 sec! try to reconnect!");
              gameSetup.peer.newlyCreated = false;
              gameSetup.enterReconnect();
            }
          }, 8000);
        } else {
          // setup a timer to try to reconnect
          // if (gameSetup.tryReconnectTimer) clearTimeout(gameSetup.tryReconnectTimer);
          // gameSetup.tryReconnectTimer = setTimeout(() => {
          //   // check for reconnect
          //   if (!gameSetup.networkHandler) {
          //     console.log("not connected after 5 sec! try to reconnect!");
          //     gameSetup.enterReconnect();
          //   }
          // }, 5654);
        }


      }



      if (gameSetup.peer && gameSetup.peer != null) {
        // console.log(`has peer ishost ${gameSetup.isHost} offer saved: ${gameSetup.peer.offerSaved}`);
        if (gameSetup.isHost && gameSetup.peer.offerSaved) {
          // already have peer object but waiting for answer
          if (typeof(room.answer1) != "undefined"  && room.answer1 != "" && room.answer1 != "newoffer") {
            //HOST_2 got new answer
            // debugger;
            // console.log(" HOST 2 " + (Date.now()));
            console.log("\n\n\n--- HOST 2 --- to signal answer "); // + room[`answer${id}`]);
            if (!gameSetup.answerSignaled) {
              try {
                console.log("\n\n\n&&&& to signal answer &&&&");
                let s = JSON.parse(room.answer1);
                if (!gameSetup.retryCount) {
                  // testing retry so change numbers to incorrect ones
                  // s.sdp = s.sdp.replace("5", "7");
                  // s.sdp = s.sdp.replace("udp", "tcp");
                  // s.sdp = s.sdp.replace("192", "182");
                  gameSetup.peer.signal(s);
                } else {
                  gameSetup.peer.signal(s);
                }
                // gameSetup.peer.signal(JSON.parse(room.answer1));
                gameSetup.answerSignaled = true;
              } catch (err) {
                console.log(" host signal error " + err);
              }
            } else {
              console.log("answer already signaled")
            }
          }
          return;
        }

        if (!gameSetup.isHost) {
          if (room.answer1 !== "newoffer") {
            console.log("room answer1 is not newoffer");
            return;
          }
          if (room.answer1 == "newoffer" && room.offer1 != gameSetup.savedOffer1) {
          } else {
            console.log("room offer1 is same as old gameSetup.savedOffer1 " + gameSetup.savedOffer1);
            return;
          }
        }
      }

      {

        if (gameSetup.peer) {
          console.log(`delete gameSetup.peer 2!`);
          gameSetup.peer.destroy();
          delete gameSetup.peer;
        }
        if (gameSetup.isHost) {

          gameSetup.peer = gameSetup.setupWTCServer(id);
          console.log("new peer creatd at host gameSetup.peer.newlyCreated " + gameSetup.peer.newlyCreated);
        } else {
          const pp = gameSetup.connectToWTCServer(id);
          if (pp) {
            gameSetup.peer = pp;
          }
        }




        // peer = gameSetup.allPeers[id];
        // peer = gameSetup.peer;

        if (gameSetup.peer == null) return;

        gameSetup.peer.dosend = (cmd) => {
          if (cmd.indexOf('LASTGOODCOMMAND') < 0) {
            gameSetup.cmdHistory.push(cmd);
          }
          if (!gameSetup.peer._channel) {
            console.log("no channel for cmd " + cmd);
            return;
          }
          if (gameSetup.peer._channel.readyState != "open") {
            console.log("channel not open for cmd " + cmd);
            return;
          }
          gameSetup.peer.send(cmd);
        };

        gameSetup.peer.on('error', function (err) {
          console.log('peer error', err);

          if (gameSetup.networkHandler) {
            console.log("already setup connection before so quit");
            if (gameSetup.quitGameForConnectivityIssue)
              gameSetup.quitGameForConnectivityIssue();
            return;
          }

          gameSetup.doRetry();


          // if (gameSetup.quitGameForConnectivityIssue)
          //   gameSetup.quitGameForConnectivityIssue();
          // window.gameSetup.enterReconnect();
        });

        gameSetup.peer.on('close', function () {

          console.log('peer closed so do nothing for now');

          if (gameSetup.networkHandler) {
            console.log("already setup connection before so quit");
            if (gameSetup.quitGameForConnectivityIssue)
              gameSetup.quitGameForConnectivityIssue();
            return;
          }

          // aaaa
          // if (gameSetup.quitGameForConnectivityIssue)
          //   gameSetup.quitGameForConnectivityIssue();

          // if (!gameSetup.enterReconnect) {
          //   debugger;
          // }
          // window.gameSetup.enterReconnect();
        });


        gameSetup.peer.on('connect', function () {

          if (!gameSetup.peer) {
            console.log("unusual error: connected then peer not defined");
            gameSetup.doRetry();
            return;
          }

          if (!gameSetup.peer._channel) {
            console.log("connected by no channellllll!");
            return;
          }
          if (gameSetup.peer._channel.readyState != "open") {
            console.log("channel is not ready state open!");
            return;
          }

          //HOST_3 GUEST_3
          // debugger;
            console.log('\n\nCONNECTED!!' + (Date.now()));
            // debugger;
            //peer.send('whatever' + Math.random());
            // console.log("connected! send initial echo");
            //peer.send("echo_" + playerID+"_0-" + Date.now());

            // this will trigger game to start!

            gameSetup.hideModalMessage();
            if (gameSetup.connectionTimer)
              clearTimeout(gameSetup.connectionTimer);

            if (gameSetup.isLocal) {
              gameSetup.networkHandler = new NetworkHandler(gameEngine, true);
            } else {
              gameSetup.networkHandler = new NetworkHandler(gameEngine, false);
            }

            setTimeout(()=>{
              if (!gameSetup.peer) {
                console.log("unusual error: connected then peer not defined");
                gameSetup.doRetry();
                return;
              }
              gameSetup.peer.peerSetup = true;
              gameSetup.peerReady = true;
              if (gameSetup.connectionTimer) {
                clearTimeout(gameSetup.connectionTimer);
                delete gameSetup.connectionTimer;
              }

              gameSetup.hideModalMessage();
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
                if (!gameSetup.peer._channel) {
                  return;
                }
                if (gameSetup.peer._channel.readyState != "open") {
                  return;
                }
                gameSetup.inReconnect = false;
                gameSetup.peer.send(cmdstr);
                // PathPoolGameObj.tick();
              }
            }, 500);

          //   const game = {};
          //   game.peer = peer;
          //   if (playerID == 0) {
          //     game.isHost = true;
          //   } else {
          //     game.isHost = false;
          //   }
          // debugger;
        });

        gameSetup.peer.on('data', function (data) {
          // console.log('got data: ' + data);
          data = `${data}`;
          if (data.indexOf("echo_") == 0) {
            // if (!that.peerReady) {
              // peer.send("echo_");
              // that.peerReady = true;
              // that.createPoolGame();
              // that.game.peer = peer;
            // }
          } else {
            // console.log("test that.game " + that.game);
            // console.log("test that.processWTCData " + that.processWTCData);
            // debugger;
            if (that.processWTCData)
              that.processWTCData(data);
          }
        });

        // gameSetup.peer = peer;
      }
    };




    gameSetup.handleRoomUpdate = (room) => {
      // debugger;
      // console.log(`new room update _id: ${JSON.stringify(room._id)} in ${room.usersInRoom}`);

      const allReady = room.usersInRoom.indexOf(false) === -1;
      if (allReady) {

        // console.log(`both players in room! gameSetup.peerReady ` + gameSetup.peerReady);
        if (!gameSetup.peerReady) {
          // debugger;
          // first time room is ready, so kick start game
          gameSetup.peerReady = true;
          gameSetup.hideModalMessage();
          gameSetup.config.hideHeadline();
          if (gameSetup.isLocal) {
            gameSetup.networkHandler = new NetworkHandler(GameEngine, true);
          } else {
            gameSetup.networkHandler = new NetworkHandler(GameEngine, false);
          }
          //gameSetup.controller.tryStartGame();
        }

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

  this.initScreen = () => {
    this.createControls();

    this.createTableAll();

    this.setupForecast();

    this.addInputEmitter();
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      this.setupTestResultDisplay();
      this.setupHandleTestResult();
    } else {

    }

    this.initializeForecastG();

    this.setupTbotMessage();

    this.setupCenterMessage();


    this.addHelpQuestionMark();


    this.addModalMessageScreen();
    this.setupEndOfGame();
    this.addFireworks();
    this.addQuitButton();

    this.setupHandleRoom();

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
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }
    container.setAttribute("style", `position:relative;background-color:#011a42;width:${w}px;height:${h}px`);



    // window.addEventListener('resize', this.onWindowResize, false);
  };

  this.initPhysics = function () {

  };

  this.showGameOver = (redPoint) => {
    gameSetup.gameOver = true;
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
    // gameSetup.shotcontroller = new ShotController(gameSetup, isHost, this);

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
        document.removeEventListener('webkitfullscreenchange', gameSetup.fullScreenHandler);
        document.removeEventListener('mozfullscreenchange', gameSetup.fullScreenHandler);
        document.removeEventListener('fullscreenchange', gameSetup.fullScreenHandler);
        document.removeEventListener('MSFullscreenChange', gameSetup.fullScreenHandler);

        document.removeEventListener("mousewheel", gameSetup.mouseWheelHandler);

        if (gameSetup.gameType !== GAME_TYPE.TESTING)
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

      PoolActions.leavingGame(gameSetup.room._id, gameSetup.localPlayerID, gameSetup.failedToReconnect || gameSetup.inQuit);
      switch (gameSetup.room.gameType) {
        case GAME_TYPE.PRACTICE:
          gameSetup.reacthistory.push("/gamesRoomEntry");
          break;
        case GAME_TYPE.MATCH:
          const link = Meteor.userId() === gameSetup.room.owner ? '/gamesRoomNetwork/' : `/gamesRoomNetwork/${gameSetup.room.gameRoomId}`;
          gameSetup.reacthistory.push(link);
          // gameSetup.reacthistory.push('/gamesBoard', { notiId: gameSetup.room.notiId });
          break;
        case GAME_TYPE.TOURNAMENT:
          if (gameSetup.pairData && gameSetup.pairData.sectionId) {
            gameSetup.reacthistory.push(`/section-info/${gameSetup.room.gameId}/${gameSetup.pairData.sectionId}`);
          }
          // if (false && gameSetup.activePlayerInfo && gameSetup.pairData) {
          //   const params = {
          //     modalIsOpen: true,
          //     sectionKey: gameSetup.pairData.sectionId,
          //     tournamentId: gameSetup.pairData.tournamentId
          //   };
          //   PoolActions.finishTournamentSectionRound(
          //     gameSetup.pairData.roundId,
          //     gameSetup.activePlayerInfo.playerUserId,
          //     gameSetup.pairData.id,
          //     PLAYER_TYPE.WINNER
          //   );
          //   gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
          // }
          break;
        case GAME_TYPE.BATTLE:
          gameSetup.reacthistory.push('/leaderboard');
          break;
      }
    };


    // try to reconnect p2p connection
    gameSetup.enterReconnect = () => {
      // first, halt all rfa ticks
      // console.log("- - - - - set inReconnect true -- - --  " + Date.now());
      // gameSetup.inReconnect = true;
      // gameSetup.reconnectTime = Date.now();
      // gameSetup.showModalMessage('Connection Lost', 'Trying to reconnect. Please stay in this page', MODAL_NOBUTTON);

      if (gameSetup.tryReconnectTimer)
        clearTimeout(gameSetup.tryReconnectTimer);

      if (gameSetup.peer) {
        gameSetup.peer.destroy();
        // console.log(`delete gameSetup.peer 3!`);
        delete gameSetup.peer;
      }

      // if (gameSetup.isHost) {
        Meteor.call('resetRoomConnection', gameSetup.room._id);
      // }

      console.log("called resetRoomConnection " + gameSetup.room._id);

      gameSetup.peerReady = false;

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
      if (typeof(TWEEN) !== "undefined") {
        TWEEN.removeAll()
      }

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

      gameSetup.world.clear();
      gameSetup.world2.clear();

      gameSetup.deepClean(gameSetup.world);
      gameSetup.deepClean(gameSetup.world2);

      delete gameSetup.world;
      delete gameSetup.world2;

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

    if (gameSetup.gameType !== GAME_TYPE.TESTING)
      document.addEventListener('keydown', gameSetup.OneOnKeyDown);



    // screen size manager

    gameSetup.fullScreenHandler = () => {

      let w = window.innerWidth;
      let h = window.innerHeight - vcushion;
      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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
      gameSetup.overlaycontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
      gameSetup.hideOverlay();

      overlayrenderer2.view.width = w;
      overlayrenderer2.view.height = h;
      overlayrenderer2.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      gameSetup.overlaycontainer2.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer2.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
      gameSetup.hideOverlay2();


      // ball and table container at smaller and aligned bottom left

      const wratio = (cfg.tableW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.tableH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;



      ballrenderer.view.width = w;
      ballrenderer.view.height = h;
      ballrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
        // only show table
        // cfg.tableTop = 0;
        gameSetup.stage.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
        gameSetup.stage.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
      } else {
        // same scaling as all
        gameSetup.stage.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
        gameSetup.stage.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
      }



      tablerenderer.view.width = w;
      tablerenderer.view.height = h;
      tablerenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      gameSetup.tablecontainer.scale.x = gameSetup.stage.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.tablecontainer.scale.y = gameSetup.stage.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);


        if (document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement !== null) {
          // is full screen
        } else {
          // not full screen
        }
    };

    // if (document.addEventListener) {
    //   document.addEventListener('webkitfullscreenchange', gameSetup.fullScreenHandler, false);
    //   document.addEventListener('mozfullscreenchange', gameSetup.fullScreenHandler, false);
    //   document.addEventListener('fullscreenchange', gameSetup.fullScreenHandler, false);
    //   document.addEventListener('MSFullscreenChange', gameSetup.fullScreenHandler, false);
    // }
  };

  this.loadSounds = function () {
    gameSetup.sounds = {};
    gameSetup.sounds.ballbouncerail = new Howl({ src: ['/sounds/ballbouncerail.wav'] });
    gameSetup.sounds.magicwand = new Howl({ src: ['/sounds/magicwand.mp3'], volume: 0.2 });
    gameSetup.sounds.ballclick = new Howl({ src: ['/sounds/ballclick.wav'] });
    gameSetup.sounds.ballpocketed = new Howl({ src: ['/sounds/ballpocketed.wav'] });
    // gameSetup.sounds.breakshot = new Howl({ src: ['/sounds/breakshot.wav'] });
    gameSetup.sounds.cueballhit = new Howl({ src: ['/sounds/cueballhit.wav'] });
    gameSetup.sounds.victory = new Howl({ src: ['/sounds/Victory.mp3'], volume: 0.5 });
    gameSetup.sounds.failure = new Howl({ src: ['/sounds/failure.mp3'], volume: 0.4 });
    gameSetup.sounds.itemcollected = new Howl({ src: ['/sounds/ItemCollected.mp3'], volume: 0.6 });
    gameSetup.sounds.backgroundmusic = new Howl({ src: ['/sounds/happymusicsmall.mp3'], loop: true, volume: 0.4 });
    if (gameSetup.gameType!=GAME_TYPE.TESTING && gameSetup.gameType!=GAME_TYPE.AUTORUN && gameSetup.gameType!=GAME_TYPE.REPLAY)
      gameSetup.sounds.backgroundmusic.play();

    gameSetup.playMagicSound = () => {
      // if (!gameSetup.sounds.magicwand.playing()) {
      //   gameSetup.sounds.magicwand.play();
      // } else {
      //   const pos = gameSetup.sounds.magicwand.seek() || 0;
      //   if (pos > 1) {
          gameSetup.sounds.magicwand.stop();
          gameSetup.sounds.magicwand.play();
      //   }
      // }
    }
  };

  gameSetup.unloadSounds = () => {
    Object.keys(gameSetup.sounds).forEach((s) => {
      gameSetup.sounds[s].unload();
    });
    delete gameSetup.sounds;
  };







  this.setupHandleTestResult = () => {

    gameSetup.resetTestTable = () => {

      gameSetup.inRunningTest = false;

      if (gameSetup.testSetupCode ) {

        Meteor.setTimeout(() => {
          if (!gameSetup.controller) return;
          //if (gameSetup.controller.inStrike) return;
          if (!gameSetup.tableDirty) return;
          // console.log('to reset table after test!');
          // debugger;
          gameSetup.controller.setRobotCode("     "); //can't be blank
          const cleanTestSetupCode = getCleanTestCode(window.getTestScript ? window.getTestScript() : gameSetup.testSetupCode);
          //const cleanTestSetupCode = getCleanTestCode(gameSetup.testSetupCode);
          // let cleanTestSetupCode = "";
          // const p = gameSetup.testSetupCode.split("\n");
          // for (let k=0; k<p.length; k++) {
          //   if (p[k].indexOf("PlaceBallOnTable") >= 0 || p[k].indexOf("ResetTable") >= 0) {
          //     cleanTestSetupCode += `${p[k]}\n`;
          //   }
          // }
          gameSetup.controller.createAIPlayers(cleanTestSetupCode, true);
          gameSetup.tableDirty = false;
        }, 100);
      }
    };


    gameSetup.handleTestResult = (res) => {

      gameSetup.inRunningTest = false;

      if (gameSetup.testSetupCode ) {

        Meteor.setTimeout(() => {
          if (that.inNewTest) return;
          if (!gameSetup.controller) return;
          if (!gameSetup.tableDirty) return;
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


      if (gameSetup.userExpectedResult && gameSetup.userExpectedResult.length > 0) {

        for (const exp of gameSetup.userExpectedResult) {
          if (exp.indexOf("EXPECTBALLPOCKETED_") == 0) {
            const pp = exp.split("_");
            if (gameSetup.ballsByID[pp[1]].body.inPocketID != pp[2]) {
              window.testResult = "Test failed: ball " + pp[1] + " did not fall into pocket " + pp[2] + ".";
              gameSetup.showTestResult();
              return;
            }
          } else if (exp.indexOf("EXPECTSHOTCOMMAND_") == 0) {
            const pp = exp.split("_");
            const cmd = gameSetup.AICommand;
            if (pp[1] != "undefined") {
              if ( Math.abs(cmd.aimx - Number(pp[1])) >= 2 ) {
                window.testResult = "Test failed: shot command's aimx " + Math.round(cmd.aimx) + " did not match with expected value of " + pp[1] + ".";
                gameSetup.showTestResult();
                return;
              }
            } 
            if (pp[2] != "undefined") {
              if ( Math.abs(cmd.aimy - Number(pp[2])) >= 2 ) {
                window.testResult = "Test failed: shot command's aimy " + Math.round(cmd.aimy) + " did not match with expected value of " + pp[2] + ".";
                gameSetup.showTestResult();
                return;
              }
            }
            if (pp[3] != "undefined") {
              if ( Math.abs(cmd.strength - Number(pp[3])) >= 2 ) {
                window.testResult = "Test failed: shot command's strength " + Math.round(cmd.strength) + " did not match with expected value of " + pp[3] + ".";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[4] != "undefined") {
              if ( Math.abs(cmd.spin - Number(pp[4])) >= 0.01 ) {
                window.testResult = "Test failed: shot command's spin " + Math.round(cmd.spin) + " did not match with expected value of " + pp[4] + ".";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[5] != "undefined") {
              if ( Math.abs(cmd.strength - Number(pp[5])) >= 0.01 ) {
                window.testResult = "Test failed: shot command's hspin " + Math.round(cmd.hspin) + " did not match with expected value of " + pp[5] + ".";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[6] != "undefined") {
              if ( cmd.targetBallID != Number(pp[6]) ) {
                window.testResult = "Test failed: shot command's targetBallID " + Math.round(cmd.targetBallID) + " did not match with expected value of " + pp[6] + ".";
                gameSetup.showTestResult();
                return;
              }
            }
            if (pp[7] != "undefined") {
              if ( cmd.targetPocketID != Number(pp[7]) ) {
                window.testResult = "Test failed: shot command's targetPocketID " + Math.round(cmd.targetPocketID) + " did not match with expected value of " + pp[7] + ".";
                gameSetup.showTestResult();
                return;
              }
            }
          }
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


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
        window.testResult = "No challenge specified at the moment.";
        gameSetup.showTestResult();
        return;
      }


      const passingList = ["TestFinishedAnyResult", "TestFinished_userAim_", "TestFinished_Strength10", "TestFinished_Strength100", "TestFinished_Spin_1", "TestFinished_hspin_30","TestFinished_cueballxy","TestFinished_Strength7","TestFinishedCallCalcEndState","TestFinishedCallConsoleLog","TestFinished_NewFunc_getTestCommand","TestFinished_NewReturn", "TestFinished_getCommandNoVar","TestFinished_refactorgetLegal", "TestFinished_getCallShotRefactor", "TestFinished_refactorgetCueBallP", "TestFinished_UseStrength_", "TestFinished_UseAimingPointGiven"];

      for (let k=0; k<passingList.length; k++) {
        if (window.testCondition && window.testCondition.indexOf(passingList[k]) >= 0) {
          window.testResult = "Test passed!";
          gameSetup.showTestResult();
          return;
        }
      }


      // if (window.testCondition && window.testCondition.indexOf("TestFinishedAnyResult") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }

      // if (window.testCondition && window.testCondition.indexOf("TestFinished_Strength10") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }

      // if (window.testCondition && window.testCondition.indexOf("TestFinished_Strength100") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }

      // if (window.testCondition && window.testCondition.indexOf("TestFinished_Spin_1") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }



      // if (window.testCondition && window.testCondition.indexOf("TestFinished_hspin_30") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }

      // if (window.testCondition && window.testCondition.indexOf("TestFinished_cueballxy") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }


      // if (window.testCondition && window.testCondition.indexOf("TestFinished_Strength7") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }



      // if (window.testCondition && window.testCondition.indexOf("TestFinishedCallCalcEndState") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }

      // if (window.testCondition && window.testCondition.indexOf("TestFinishedCallConsoleLog") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }



      // if (window.testCondition && window.testCondition.indexOf("TestFinished_NewFunc_getTestCommand") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }

      // if (window.testCondition && window.testCondition.indexOf("TestFinished_NewReturn") >= 0) {
      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_prob237") >= 0) {

        let foundAll = true;
        let ballIDs = [2, 3, 7];
        for (let i=0; i<=2; i++) {
          let found = false;
          for (let k=0; k<window.calcProbCmdList.length; k++) {
            const c = window.calcProbCmdList[k];
            if (c.targetPocketID == 3 && c.targetBallID == ballIDs[k]) {
              found = true; break;
            }
          }
          if (!found) {
            foundAll = false; break;
          }
        }

        if (!foundAll) {
          window.testResult = "Test failed: you have not checked the probability of shooting ball k into pocket 3.";
          gameSetup.showTestResult();
          return;

        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;

      }




      if (window.testCondition && window.testCondition.indexOf("TestFinished_printClosestBall") >= 0) {
        let found = false;
        let correct = false;
        const tableCenter = {x: gameSetup.config.tableCenterX, y: gameSetup.config.tableCenterY};
        for (let j = 0; j <= window.AllConsoleLog.length-1; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (line.toLowerCase().indexOf("closest ball:") >= 0 || line.toLowerCase().indexOf("closest ball :") >= 0 || line.toLowerCase().indexOf("closestball:") >= 0 || line.toLowerCase().indexOf("closest ball  :") >= 0) {
            found = true;
            const pp1 = line.split(":");
            const pp2 = pp1[1].trim().split(",");
            const x1 = Number(pp2[0].trim());
            const y1 = Number(pp2[1].trim());
            const b = gameSetup.ballsByID[4];
            if (Math.abs(x1 - (b.x-tableCenter.x)) < 10 && Math.abs(y1 - (b.y-tableCenter.y)) < 10) {
              correct = true; break;
            }
          }
        }

        if (!found) {
          window.testResult = "Test failed: you did not print out the line starting with 'closest ball:'.";
          gameSetup.showTestResult();
          return;
        }


        if (!correct) {
          window.testResult = "Test failed: you need to print out the coordinates of the ball closest to table center.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_printFarthestBall") >= 0) {
        let found = false;
        let correct = false;
        const tableCenter = {x: gameSetup.config.tableCenterX, y: gameSetup.config.tableCenterY};
        for (let j = 0; j <= window.AllConsoleLog.length-1; j++) {
          const line = window.AllConsoleLog[j] + "";
          const line1 = replaceAll(line, " ", "");
          if (line1.toLowerCase().indexOf("farthestball:") >= 0) {
            found = true;
            const pp1 = line.split(":");
            const pp2 = pp1[1].trim().split(",");
            const x1 = Number(pp2[0].trim());
            const y1 = Number(pp2[1].trim());
            const b = gameSetup.ballsByID[5];
            if (Math.abs(x1 - (b.x-tableCenter.x)) < 10 && Math.abs(y1 - (b.y-tableCenter.y)) < 10) {
              correct = true; break;
            }
          }
        }

        if (!found) {
          window.testResult = "Test failed: you did not print out the line that says 'farthest ball:'.";
          gameSetup.showTestResult();
          return;
        }


        if (!correct) {
          window.testResult = "Test failed: you need to print out the coordinates of the ball farthest from the cue ball.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_loggingbasicprob2") >= 0) {
        let found = false;
        for (let j = 0; j <= window.AllConsoleLog.length-1; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (line.toLowerCase().indexOf("prob2 is 99") >= 0) {
            found = true;
          }
        }

        if (!found) {
          window.testResult = "Test failed: you did not print out the correct probability starting with 'prob2 is '.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_findClosestBall") >= 0) {
        let found = false;
        let correct = false;
        const tableCenter = {x: gameSetup.config.tableCenterX, y: gameSetup.config.tableCenterY};
        for (let j = 0; j <= window.AllConsoleLog.length-1; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (line.toLowerCase().indexOf("shortest distance:") >= 0 || line.toLowerCase().indexOf("shortest distance :") >= 0 || line.toLowerCase().indexOf("shortest distance  :") >= 0 || line.toLowerCase().indexOf("shortestdistance:") >= 0) {
            found = true;
            const pp = line.split(":");
            const d1 = Number(pp[1].trim());
            const b = gameSetup.ballsByID[4];
            const d2 = Math.sqrt( (b.x - tableCenter.x)*(b.x - tableCenter.x) + (b.y - tableCenter.y)*(b.y - tableCenter.y) );
            if (Math.abs(d1 - d2) < 3) {
              correct = true; break;
            }
          }
        }

        if (!found) {
          window.testResult = "Test failed: you did not print out the line starting with 'shortest distance:'.";
          gameSetup.showTestResult();
          return;
        }


        if (!correct) {
          window.testResult = "Test failed: you need to print out the distance between the table center and the closest ball to it.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_printBallDistance") >= 0) {

        let foundAll = true;
        const IDs = [1, 3, 4, 5];
        const distances = [570, 925, 428, 434];
        const tableCenter = {x: gameSetup.config.tableCenterX, y: gameSetup.config.tableCenterY};
        for (let i=0; i<=3; i++) {
          let found = false;
          const b = gameSetup.ballsByID[IDs[i]];
          for (let j = 0; j <= 3; j++) {
            const line = window.AllConsoleLog[j] + "";
            if (typeof(line) == "undefined") {
              break;
            }
            const d1 = Number(line);
            //const d2 = Math.sqrt( (b.x - tableCenter.x)*(b.x - tableCenter.x) + (b.y - tableCenter.y)*(b.y - tableCenter.y) );
            const d2 = distances[i];
            if (Math.abs(d1 - d2) < 10) {
              found = true; break;
            }
          }

          if (!found) {
            foundAll = false; break;
          }
        }

        if (!foundAll) {
          window.testResult = "Test failed: you need to print out the distance between each of the 4 balls and the table center.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;

      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_getCommandAll6") >= 0) {

        let foundAll = true;
        for (let i=0; i<=5; i++) {
          let found = false;
          for (let k=0; k<window.calcProbCmdList.length; k++) {
            const c = window.calcProbCmdList[k];
            if (c.targetPocketID == i && c.targetBallID == 2) {
              found = true; break;
            }
          }
          if (!found) {
            foundAll = false; break;
          }
        }

        if (!foundAll) {
          window.testResult = "Test failed: you have not checked the probability of shooting ball 2 to every pocket.";
          gameSetup.showTestResult();
          return;

        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;

      }




      if (window.testCondition && window.testCondition.indexOf("TestFinished_loop531") >= 0) {

        let foundAll = true;
        const pocketlist = [5, 3, 1];
        for (let i=0; i<=2; i++) {
          const c = window.calcProbCmdList[i];
          if (c.targetPocketID !== pocketlist[i] ) {
            foundAll = false; break;
          }
        }

        if (!foundAll) {
          window.testResult = "Test failed: you need to check pocket 5, then pocket 3, then pocket 1.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_getCommand2") >= 0) {

        let foundAll = true;
        const balllist = [2, 3];
        for (let i=0; i<=1; i++) {
          const c = window.calcProbCmdList[i];
          if (c.targetBallID !== balllist[i] || c.targetPocketID != 3 ) {
            foundAll = false; break;
          }
        }

        if (!foundAll || window.calcProbCmdList.length != 2) {
          window.testResult = "Test failed: you need to check only ball 2 and ball 3 against pocket 3.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinished_getCommandsBest5") >= 0) {

        let foundAll = true;
        const pocketlist = [2, 3, 4, 1, 2];
        const balllist = [2, 2, 2, 3, 3];
        for (let i=0; i<=4; i++) {
          let found = false;
          for (let k=0; k<window.calcProbCmdList.length; k++) {
            const c = window.calcProbCmdList[k];
            if (c.targetPocketID == pocketlist[i] && c.targetBallID == balllist[i] ) {
              found = true; break;
            }
          }
          if (!found) {
            foundAll = false; break;
          }
        }

        if (!foundAll) {
          window.testResult = "Test failed: you have not checked the probability of all 5 commands.";
          gameSetup.showTestResult();
          return;
        }

        if (gameSetup.ballsByID[3].body.inPocketID !== 2) {
          window.testResult = "Test failed: you didn't pick the best command.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_CheckPockets5to0") >= 0) {

        let foundAll = true;
        for (let i=5; i>=0; i--) {
          const c = window.calcProbCmdList[i];
          if (c.targetPocketID !== 5-i || c.targetBallID != 2 ) {
            foundAll = false; break;
          }
        }

        if (!foundAll) {
          window.testResult = "Test failed: you have not checked the probability of all 6 pockets in the correct order.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_print_0to5") >= 0) {


        let hasLogging = true;
        for (let j = 0; j < 6; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim() !== j + "") {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out numbers 0 to 5.";
          gameSetup.showTestResult();
          // window.submitTestResultInChat(`Please use 'console.log()' in your robot code to log message into the developer console.`);
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_filterBallInfo") >= 0) {
        let hasLogging = true;
        let ballIDs = [2, 3, 7];
        for (let j = 0; j <= 2; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim().indexOf("Balls " + ballIDs[j]) < 0) {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out information for red balls on the right half of the table.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_printBallInfo") >= 0) {
        let hasLogging = true;
        for (let j = 0; j <= 11; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim().indexOf("Balls " + j) < 0) {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out all ball information in the for-loop.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_NewForLoop1") >= 0) {

        let hasLogging = true;
        for (let j = 0; j < 6; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim() !== (j*2) + "") {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out the sequence 0 2 4 6 8 10 using a for-loop.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_NewForLoop2") >= 0) {

        let hasLogging = true;
        for (let j = 0; j <= 4; j++) {
          const line = window.AllConsoleLog[j] + "";
          if (typeof(line) == "undefined" || ("" + line).trim() !== (21 - j * 4) + "") {
            hasLogging = false; break;
          }
        }
        if (!hasLogging) {
          window.testResult = "Error: Please print out the sequence 21 17 13 9 5 using a for-loop.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_getRandom") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_getCalcAim") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }
      

      if (window.testCondition && window.testCondition.indexOf("TestFinished_getDouble") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_call_getCommand") >= 0) {
        const b = gameSetup.ballbodies[2];
        if (b.inPocketID !== 3) {
          window.testResult = "Test failed: ball 2 should fall into pocket 3";
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_compare23") >= 0) {
        const b = gameSetup.ballbodies[2];
        if (b.inPocketID !== 3) {
          window.testResult = "Test failed: ball 2 should fall into pocket 3";
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_compare4") >= 0) {
        const b = gameSetup.ballbodies[2];
        if (b.inPocketID !== 4) {
          window.testResult = "Test failed: ball 2 should fall into pocket 4.";
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_compare5") >= 0) {
        const b = gameSetup.ballbodies[2];
        if (b.inPocketID !== 5) {
          window.testResult = "Test failed: ball 2 should fall into pocket 5.";
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_2_0") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_3") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_4_4_5") >= 0) {

        if (gameSetup.ballsByID[4].body.inPocketID !== 4) {
          window.testResult = "Test failed: ball 4 is supposed to fall into pocket 4.";
          gameSetup.showTestResult();
          return;
        }

        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }
      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_0_4_1") >= 0) {
        // if (gameSetup.ballsByID[4].body.inPocketID !== 1) {
        //   window.testResult = "Test failed: ball 4 is supposed to fall into pocket 1.";
        //   gameSetup.showTestResult();
        //   return;
        // }
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4151") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_allkickdirect") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinished_calcprob_4_0_4_5") >= 0) {
        // if (gameSetup.ballsByID[4].body.inPocketID !== 0) {
        //   window.testResult = "Test failed: ball 4 is supposed to fall into pocket 0.";
        //   gameSetup.showTestResult();
        //   return;
        // }
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_loggingbasic") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinished_cmd_var") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedAimY35") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedAimPoint_") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }
      
      if (window.testCondition && window.testCondition.indexOf("TestFinishedAimY42") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedAimYCall00") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinishedFirstBall2_Rebound") == 0) {
        if (gameSetup.firstBallTouchCushion !== 0) {
          window.testResult = "Test failed! The cue ball needs to rebound off a cushion first.";
        } else {
          if (gameSetup.firstBallTouchedByCueball.ID == "2") {
            window.testResult = "Test passed!";
          } else {
            if (!gameSetup.firstBallTouchedByCueball) {
              window.testResult = "Test failed: the cue ball didn't hit ball 2.";
            } else {
              window.testResult = "Test failed: first ball hit by the cue ball is not ball 2.";
            }
          }
        }

        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedFirstBall10_Rebound") == 0) {
        if (gameSetup.firstBallTouchCushion !== 0) {
          window.testResult = "Test failed! The cue ball needs to rebound off a cushion first.";
        } else {
          if (gameSetup.firstBallTouchedByCueball.ID == "10") {
            window.testResult = "Test passed!";
          } else {
            if (!gameSetup.firstBallTouchedByCueball) {
              window.testResult = "Test failed: the cue ball didn't hit ball 10.";
            } else {
              window.testResult = "Test failed: first ball hit by the cue ball is not ball 10.";
            }
          }
        }

        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedBallReboundCushion_") == 0) {
        const pp = window.testCondition.split("_");
        if (gameSetup.firstCushionTouchedByBall == `polybody${pp[1]}`) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: target ball didn't bounce off top right cushion first.";
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition == "TestFinishedYellowBallFirstTouch") {
        if (gameSetup.firstBallTouchedByCueball === null) {
          window.testResult = "Test failed: no ball touched by cue ball.";
        } else {
          if (gameSetup.firstBallTouchedByCueball.colorType == Pool.YELLOW) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first ball hit by cue ball is not yellow.";
          }
        }

        // if (typeof(shotCmdUser.aimx) == "undefined" || typeof(shotCmdUser.aimy) == "undefined") {
        //   window.testResult = "Test failed: you need to specify aimx and aimy in the getBreakShot function";
        //   gameSetup.showTestResult();
        //   return;
        // } else if (shotCmdUser.aimx == 123 && shotCmdUser.aimy == 456) {
        //   window.testResult = "Test failed: please change aimx and aimy in the getBreakShot function";
        //   gameSetup.showTestResult();
        //   return;
        // }



        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition == "TestFinishedRedBallFirstTouch") {
        if (gameSetup.firstBallTouchedByCueball === null) {
          window.testResult = "Test failed: no ball touched by cue ball.";
        } else {
          if (gameSetup.firstBallTouchedByCueball.colorType == Pool.RED) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first ball hit by cue ball is not red.";
          }
        }
        gameSetup.showTestResult();
        return;
      }

      //TestFinishedFirstTouchBall_2
      if (window.testCondition && window.testCondition.indexOf("TestFinishedFirstTouchBall") == 0) {
        if (gameSetup.firstBallTouchedByCueball === null) {
          window.testResult = "Test failed: no ball touched by cue ball.";
        } else {
          const pp = window.testCondition.split("_");
          if (gameSetup.firstBallTouchedByCueball.ID == pp[1]) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = `Test failed: first ball hit by cue ball is not ball ${pp[1]}`;
          }
        }
        gameSetup.showTestResult();
        return;
      }

      // TestPPPocketBall_3_In_1
      if (window.testCondition && window.testCondition.indexOf("TestPPPocketBall_") == 0) {
        const pp = window.testCondition.split("_");
        const b = gameSetup.ballbodies[pp[1]];
        const pocketid = pp[3];
        if (b.inPocketID == pocketid || (pocketid == 6 && [0, 1, 2, 3, 4, 5].includes(b.inPocketID))) {
          window.testResult = "Test passed!";
        } else {
          if (pocketid == 6)
            window.testResult = `Test failed: expected ball ${pp[1]} to fall in some pocket.`;
          else
            window.testResult = `Test failed: expected ball ${pp[1]} to fall in pocket ${pocketid}.`;
        }
        gameSetup.showTestResult();
        return;
      }

       // TestPPPocketBall2_2_In_4_3_In_2
       if (window.testCondition && window.testCondition.indexOf("TestPPPocketBall2_") == 0) {
        const pp = window.testCondition.split("_");
        const b = gameSetup.ballbodies[pp[1]];
        const b2 = gameSetup.ballbodies[pp[4]];
        const pocketid = pp[3];
        const pocketid2 = pp[6];
        if (b.inPocketID == pocketid && b2.inPocketID == pocketid2 ) {
          window.testResult = "Test passed!";
        } else {
            window.testResult = `Test failed: expected ball ${pp[1]} to fall in pocket ${pocketid} and ball ${pp[4]} to fall in pocket ${pocketid2}. `;
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedFirstHitBall") == 0) {
        const theballid = window.testCondition.substring("TestFinishedFirstHitBall".length);
        if (gameSetup.firstBallTouchedByCueball === null) {
          window.testResult = "Test failed: no ball touched by cue ball.";
        } else {
          if (gameSetup.firstBallTouchedByCueball.ID == theballid) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first ball hit by cue ball is not number " + theballid + ".";
          }
        }
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition == "TestFinishedBlackBallFirstTouch") {
        if (gameSetup.firstBallTouchedByCueball === null) {
          window.testResult = "Test failed: no ball touched by cue ball.";
        } else {
          if (gameSetup.firstBallTouchedByCueball.colorType == Pool.BLACK) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first ball hit by cue ball is not black.";
          }
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition == "TestFinished_AccelerateGetCommand") {
        if (gameSetup.ballsByID[5].body.inPocketID == 3) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: ball 5 did not fall into pocket 3.";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition == "TestFinished_ReturnEarly") {
        if (gameSetup.ballsByID[5].body.inPocketID == 1) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: ball 5 did not fall into pocket 1.";
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition == "TestFinishedTwoBallPocketed") {
        if (typeof(gameSetup.ballsByID[0].body.inPocketID) != 'undefined' && gameSetup.ballsByID[0].body.inPocketID !== null) {
          window.testResult = "Test failed: the cue ball should not be pocketed!";
        } else {
          let cumpocketed = 0;
          for (let k=2; k<gameSetup.balls.length; k++) {
            if (typeof(gameSetup.ballsByID[k].body.inPocketID) != 'undefined' && gameSetup.ballsByID[k].body.inPocketID != null) {
              cumpocketed ++;
            }
          }

          if (cumpocketed >= 2) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: less than 2 red or yellow balls were pocketed.";
          }
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition == "TestFinishedBlackBallPocketed") {
        if (typeof(gameSetup.ballsByID[BLACK_BALL_ID].body.inPocketID) != 'undefined' && gameSetup.ballsByID[BLACK_BALL_ID].body.inPocketID !== null) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: black ball not pocketed.";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition == "TestFinishedCueBallPocketedAfterTouch") {
        if (typeof(gameSetup.ballsByID[0].body.inPocketID) != 'undefined' && gameSetup.ballsByID[0].body.inPocketID !== null) {
          if (gameSetup.firstBallTouchedByCueball == null) {
            window.testResult = "Test failed: the cue ball did't not touch any ball.";
          } else {
            window.testResult = "Test passed!";
          }
        } else {
          window.testResult = "Test failed: the cue ball was not pocketed.";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition == "TestFinished_calcprob_95") {
        if (window.probQueryAnswer >= 95) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: your shot's probability is less than 95%";
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedBallPocketed_") == 0) {
        const pp = window.testCondition.split("_");
        if (gameSetup.ballsByID[pp[1]].body.inPocketID == pp[2]) {

          if (pp.length == 4) {
            if (pp[3] == "accelerateindirect") {
              if (window.calcProbCmdList.length > 34) {
                window.testResult = "Test failed: you need to skip more shot commands.";
                gameSetup.showTestResult();
                return;
              }
            }
            if (pp[3] == "18choices") {
              // also check if all 18 choices are considered
              let foundAll = true;
              let IDList = [2,3,6];
              for (let j=0; j<=2; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  let found = false;
                  for (let k=0; k<window.calcProbCmdList.length; k++) {
                    const c = window.calcProbCmdList[k];
                    if (c.targetPocketID == i && c.targetBallID == ball_id) {
                      found = true; break;
                    }
                  }
                  if (!found) {
                    foundAll = false; break;
                  }
                }
              }
              if (!foundAll) {
                window.testResult = "Test failed: you have not checked the probability of shooting all 3 balls to all 6 pockets.";
                gameSetup.showTestResult();
                return;
              }

            }

            if (pp[3] == "54choices205080") {
              // also check if all 18 choices are considered
              let foundAll = true;
              let IDList = [2,3,6];
              for (let j=0; j<=2; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  for (let s = 20; s <= 80; s+= 30) {
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == s) {
                        found = true; break;
                      }
                    }
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (!foundAll) {
                window.testResult = "Test failed: you have not checked the probability of shooting all 3 balls to all 6 pockets, with strength of 20/50/80.";
                gameSetup.showTestResult();
                return;
              }

            }

            if (pp[3] == "108choices204070") {
              // also check if all 18 choices are considered
              let foundAll = true;
              let IDList = [2,6];
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    for (let sp=-1; sp<=1; sp ++) {
                      let found = false;
                      for (let k=0; k<window.calcProbCmdList.length; k++) {
                        const c = window.calcProbCmdList[k];
                        if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                          found = true; break;
                        }
                      }
                      if (!found) {
                        foundAll = false; break;
                      }
                    }
                    if (!foundAll) break;
                  }
                  if (!foundAll) break;
                }
                if (!foundAll) break;
              }
              if (!foundAll) {
                window.testResult = "Test failed: you have not checked all 108 choices for ball 2 and 6, all 6 pockets, strength of 20/40/70 and spin of -1/0/1.";
                gameSetup.showTestResult();
                return;
              }
            }



            if (pp[3] == "54choices204070") {
              // also check if all 18 choices are considered
              let foundAll = true;
              let IDList = [2,3,6];
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                  if (!foundAll) break;
                }
                if (!foundAll) break;
              }
              if (!foundAll) {
                window.testResult = "Test failed: you have not checked the probability of shooting all 3 balls to all 6 pockets, with strength of 20/40/70.";
                gameSetup.showTestResult();
                return;
              }

            }


            if (pp[3] == "36choices204070") {
              // also check if all 18 choices are considered
              let foundAll = true;
              let IDList = [2,6];
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (!foundAll) {
                window.testResult = "Test failed: you have not checked the probability of shooting balls 2 and 6 to all 6 pockets, with strength of 20/40/70.";
                gameSetup.showTestResult();
                return;
              }

            }


            if (pp[3] == "36choices204070reverse") {
              // also check if all 18 choices are considered
              let foundAll = true;
              let IDList = [2,6];
              let firstID = -1;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (firstID < 0) {
                        firstID = c.targetBallID;
                      }
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (!foundAll) {
                window.testResult = "Test failed: you have not checked the probability of shooting balls 2 and 6 to all 6 pockets, with strength of 20/40/70.";
                gameSetup.showTestResult();
                return;
              } else if (firstID != 6) {
                window.testResult = "Test failed: the first ball you check should be ball 6.";
                gameSetup.showTestResult();
                return;
              }

            }


            if (pp[3] == "skipball2") {
              let foundAll = true;
              let IDList = [3,6];
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (!foundAll) {
                window.testResult = "Test failed: you need to check only ball 3 and 6 against all 6 pockets, with strength of 20/40/70.";
                gameSetup.showTestResult();
                return;
              }

            }


            if (pp[3] == "skippocket3ball6") {
              let foundAll = true;
              let IDList = [3,6];
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  if (ball_id == 6 && i == 3) continue;
                  if (ball_id == 6 && i == 0) continue;
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (!foundAll) {
                window.testResult = "Test failed: you need to skip pocket 0 and 3 for ball 6.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (pp[3] == "skipstrength4070ball3pocket1") {
              let foundAll = true;
              let IDList = [3,6];
              let count = 0;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  if (ball_id == 6 && i == 3) continue;
                  if (ball_id == 6 && i == 0) continue;
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    if (ball_id == 3 && i == 1 && s == 1) break;
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    count ++;
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (count > window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking less choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (count < window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking more choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (!foundAll) {
                window.testResult = "Test failed: you have not checked all possible ball/pocket/strength combinations.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (pp[3] == "skipstrength20ball3pocket1") {
              let foundAll = true;
              let IDList = [3,6];
              let count = 0;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  if (ball_id == 6 && i == 3) continue;
                  if (ball_id == 6 && i == 0) continue;
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    if (ball_id == 3 && i == 1 && s == 1) break;
                    if (ball_id == 3 && (i == 0 || i== 2 || i == 3 || i == 5) && s == 0) continue;
                    if (ball_id == 6 && (i == 0 || i== 1 || i == 4 || i == 5) && s == 0) continue;
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    count ++;
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (count > window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking less choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (count < window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking more choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (!foundAll) {
                window.testResult = "Test failed: you have not checked all necessary ball/pocket/strength combinations.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[3] == "skipcutangle90") {
              let foundAll = true;
              let IDList = [3,6];
              let count = 0;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  if (ball_id == 3 && i == 3) break;
                  if (ball_id == 6 && i !== 2) continue;
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    if (ball_id == 3 && i == 2 && s == 2) break;
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    count ++;
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (count > window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking less choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (count < window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking more choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (!foundAll) {
                window.testResult = "Test failed: you have not skipped some pockets properly.";
                gameSetup.showTestResult();
                return;
              }
            }
            if (pp[3] == "sp") {
              let foundAll = true;
              let IDList = [3,6];
              let count = 0;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  if (ball_id == 3 && i == 3) break;
                  if (ball_id == 3 && i == 0) continue;
                  if (ball_id == 6 && i !== 2) continue;
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    if (ball_id == 3 && i == 2 && s == 2) break;
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    count ++;
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (count > window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking less choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (count < window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking more choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (!foundAll) {
                window.testResult = "Test failed: you have not skipped some pockets properly.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[3] == "sphw") {

              let found = false;
              for (let k=0; k<window.calcProbCmdList.length; k++) {
                const c = window.calcProbCmdList[k];
                if (c.targetPocketID == 0 && c.targetBallID == 3) {
                  found = true; break;
                }
              }

              if (found) {
                window.testResult = "Test failed: you have not skipped pocket 0 for ball 3.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[3] == "skipsidepocketskew") {
              let foundAll = true;
              let IDList = [3,6];
              let count = 0;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=5; i++) {
                  if (ball_id == 3 && i == 3) break;
                  if (ball_id == 3 && i == 0) continue;
                  if (ball_id == 3 && i == 1) continue;
                  if (ball_id == 6 && i !== 2) continue;
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    if (ball_id == 3 && i == 2 && s == 2) break;
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    count ++;
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (count > window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking less choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (count < window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking more choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (!foundAll) {
                window.testResult = "Test failed: you have not skipped some pockets properly.";
                gameSetup.showTestResult();
                return;
              }
            }

            if (pp[3] == "return90") {
              let foundAll = true;
              let IDList = [3];
              let count = 0;
              for (let j=0; j<=IDList.length-1; j++) {
                let ball_id = IDList[j];
                for (let i=0; i<=1; i++) {
                  const sList = [20, 40, 70];
                  for (let s = 0; s <= 2; s ++) {
                    if (ball_id == 3 && i == 1 && s == 1) break;
                    let found = false;
                    for (let k=0; k<window.calcProbCmdList.length; k++) {
                      const c = window.calcProbCmdList[k];
                      if (c.targetPocketID == i && c.targetBallID == ball_id && c.strength == sList[s]) {
                        found = true; break;
                      }
                    }
                    count ++;
                    if (!found) {
                      foundAll = false; break;
                    }
                  }
                }
              }
              if (count > window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking less choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (count < window.calcProbCmdList.length) {
                window.testResult = "Test failed: you are checking more choices than necessary.";
                gameSetup.showTestResult();
                return;
              } else if (!foundAll) {
                window.testResult = "Test failed: you have not checked all necessary ball/pocket/strength combinations.";
                gameSetup.showTestResult();
                return;
              }
            }
          }

          window.testResult = "Test passed!";
        } else {
          window.testResult = `FAIL (ball ${pp[1]} not pocketed in pocket ${pp[2]})`;
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition == "TestFinishedValidBreakShot") {
        const failReason = gameSetup.controller.isValidBreakShot();
        if (failReason == "") {
          window.testResult = "Test passed!";
        } else {
          window.testResult = `Test failed: ${failReason}`;
        }
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
        if (gameSetup.activePlayerInfo.playerWorker) {
          gameSetup.activePlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_SUBMIT_DATA,
            'resolveID': data.resolveID
          });

        }

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

      window.submitTestResultInChat(window.testResult);
      //if (window.recordTestAttempt && !window.testResult.includes("No challenge specified")) {
      if (window.recordTestAttempt) {
        window.recordTestAttempt(window.testResult);
      }

      // window.exitTestScreen();
      // gameSetup.gameOver = true;
      if (gameSetup.tweenF1) {
        gameSetup.tweenF1.stop();
        gameSetup.tweenB1.stop();
        gameSetup.tweenF2.stop();
        gameSetup.tweenB2.stop();
        gameSetup.inStrikeAnimation = false;
      }

      if (window.toggleTestButton) {
        window.toggleTestButton(false);
      }

      return;

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


      gameSetup.config.showMessage(window.testResult);

      window.submitTestResultInChat(window.testResult);

      // gameSetup.paused = true;
      gameSetup.controller.killAIPlayers();

      // window.exitTestScreen();
      // gameSetup.gameOver = true;
      if (gameSetup.tweenF1) {
        gameSetup.tweenF1.stop();
        gameSetup.tweenB1.stop();
        gameSetup.tweenF2.stop();
        gameSetup.tweenB2.stop();
        gameSetup.inStrikeAnimation = false;
      }
    }
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


  this.markPocketedOrStopped = (bodylist, isProb, savedTargetBallID) => {
    const allIDs = Object.keys(bodylist);
    const pos = new Victor(0, 0);
    let allStopped = true;
    const cb = bodylist[0];
    if (isProb && gameSetup.stopAtFirstTouch) {
      if (gameSetup.firstBallTouchedByCueball != null) {
        return true;
      }
    }
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b2 = bodylist[i];
      if (b2.inPocketID == null && isNaN(b2.velocity[0])) {
        // debugger;
      }
      if (b2.inPocketID != null) {
        b2.isStopped = true;
      } else {
        b2.isStopped = false;
      }
      if (!cb) {
        debugger;
      }
      if (!cb.hasFirstContact && b2.ID != "0") continue;
      const speed = Math.sqrt(b2.velocity[0] * b2.velocity[0] + b2.velocity[1] * b2.velocity[1]);
      let aspeed = 0;
      if (b2.ID == 0) {
        aspeed = b2.av.length();
      }
      // if ( i!= 0) console.log("speed " + i + " " + speed);
      pos.x = b2.position[0];
      pos.y = b2.position[1];
      if (b2.inPocketID != null) {
        // if we only care about pocketing probability of target ball...
      } else {
        if (b2.ID == 2 && b2.position[1] <= 673) {
          // console.log("ball 2 pos " + pos.x + " " + pos.y);
        }
        b2.inPocketID = this.checkIfPocketed(pos, b2.ID);
        // if (b2.ID == 2 && b2.inPocketID > 0)
        // console.log("ball " + b2.ID + " color " + b2.colorType + " in pocket ID " + b2.inPocketID);
        if (b2.inPocketID == null && isNaN(b2.position[0])) {
          debugger;
        }
        if (b2.inPocketID != null && b2.ID != 0) {
          // debugger;
          if (!gameSetup.newlyPocketedBalls.includes(b2.ID)) {
            gameSetup.newlyPocketedBalls.push(b2.ID);
          }
        }

        if (b2.inPocketID != null) {
          // add to trail
          if (b2.trail) {
            b2.trail.push([b2.position[0], b2.position[1]]);
          }
        }

        if (b2.inPocketID != null && !b2.isSim) {
          gameSetup.sounds.ballpocketed.play();
          const p = gameSetup.tablePocket2[b2.inPocketID];
          that.showPocketingStar(p.x, p.y);

          // gameSetup.playFireworks("white", gameSetup.pocketingStar, 0);
          // gameSetup.playFireworks("red", gameSetup.pocketingStar, 500);
          // gameSetup.playFireworks("green", gameSetup.pocketingStar, 1000);
          // gameSetup.playFireworks("yellow", gameSetup.pocketingStar, 1500);

        }

        // short cut?
        if (b2.inPocketID != null && isProb && b2.ID == savedTargetBallID) {
          return true;
        }

        if (b2.ID == 0) {
          // console.log("cue ball stop test: " + b2.position[0] + " " + b2.position[1] + " " + b2.av.x + " " + b2.velocity[0]);
        }
        if (b2.inPocketID == null) {
          const fspeed = Math.fround(speed);
          const faspeed = Math.fround(aspeed);
          if ((fspeed < 0.01) && (faspeed < 0.01)) {
            b2.isStopped = true;
            if (b2.trail) {
              // this is body2 so mark end of trail
              const p = b2.trail[b2.trail.length-1];
              if (b2.position[0] != p[0] || b2.position[1] != p[1])
                b2.trail.push([b2.position[0], b2.position[1]]);
            }
            if (speed > 0) {
              b2.velocity[0] = 0;
              b2.velocity[1] = 0;
              b2.av.x = 0;
              b2.av.y = 0;
            }
          } else {
            if (fspeed < 0.01) {
              if (b2.trail) {
                // this is a spin turning point so add it
                const p = b2.trail[b2.trail.length-1];
                if (b2.position[0] != p[0] || b2.position[1] != p[1]) {
                  b2.trail.push([b2.position[0], b2.position[1]]);
                }
              }
            } else {
              // ccccc more granular trail
              if (gameSetup.gameType == GAME_TYPE.TESTING && b2 && b2.trail && b2.ID >= 0) {
                b2.trail.push([b2.position[0], b2.position[1]]);
                if (b2.ID == 0) {
                  // console.log("add cue ball pos " + b2.position[0] + " " + b2.position[1]);
                }
              }
            }
          }
        } else {
          // in pocket
          b2.isStopped = true;
          b2.velocity[0] = 0;
          b2.velocity[1] = 0;
          b2.av.x = 0;
          b2.av.y = 0;
        }

        if (b2.inPocketID != null) {
          b2.position[0] = 100000;
          b2.position[1] = 100000;
        }
      }
      // if (!b2.isStopped) allStopped = false;
      allStopped = allStopped && b2.isStopped;
    }
    if (allStopped ) {
      // console.log("set to all stopped!");
    }

    return allStopped;
  };

  this.checkIfPocketed = (pos, ID) => {
    const config = gameSetup.config;
    let pocketID = null;
    if (ID == 2 && pos.y <= 233) {
      // console.log("test ball 1 pocketing pos y " + pos.y + " " + pos.x);
    }
    // debugger;
    if (isNaN(pos.x) || (isNaN(pos.y))) {

      return 0;
    }

    if (Math.abs(pos.x - config.tableCenterX) <= config.ballD * 2) { // only need to test for center pockets
      if (pos.y < config.tableCenterY && pos.y > config.tableCenterY - config.tableH/2 + config.ballD * 0.67) {
        // if (ID == 3) console.log("return too in 1 "  + pos.x + " " + pos.y);
        return null;
      }
      if (pos.y > config.tableCenterY && pos.y < config.tableCenterY + config.tableH/2 - config.ballD * 0.67) {
        // if (ID == 3) console.log("return too in 2 "  + pos.x + " " + pos.y);
        return null;
      }
    }


    if ((gameSetup.centerRectangle.contains(pos.x, pos.y))) {
      // inside rectangle, so if
      // if (ID == 3) console.log("return in center " + pos.x + " " + pos.y);
      return null;
    }

    if (Math.abs(pos.x - config.tableCenterX) >= (config.tableW / 2 - config.ballD / 6) || Math.abs(pos.y - config.tableCenterY) >= (config.tableH / 2 - config.ballD / 6)) {
      // if (ID == 3) console.log("outside table " + pos.x + " " + pos.y);
      // outside table, so find nearest pocket
      if (ID == 21) {
        // console.log("outside table ball 21 pos " + pos.x.toFixed(2) + " " + pos.y.toFixed(2));
      }

      let minD = config.tableW * 10;
      for (let i = 0; i < 6; i++) {
        const p = gameSetup.tablePocket[i];
        const dist = dist2(p, pos);
        if (dist < minD) {
          minD = dist; pocketID = i;
          if (dist < config.cornerPocketD * 2) break; // can't have any other pocket that's closer!
        }
      }
      return pocketID;
    } else {
      if (ID == 21) {
        // console.log("table border ball 21 pos " + pos.x.toFixed(2) + " " + pos.y.toFixed(2));
      }
      // if (ID == 3) console.log("check which pocket " + pos.x + " " + pos.y);

      let dist = config.tableW;
      let tablePocketR = config.cornerPocketD / 2 * 0.77;
      if (pos.x < config.tableCenterX - config.tableW / 4 && pos.y < config.tableCenterY - config.tableH / 4) {
                // check left top pocket
        dist = dist2(gameSetup.tablePocket3[0], pos);
        pocketID = 0;
      } else if (pos.x > config.tableCenterX + config.tableW / 4 && pos.y < config.tableCenterY - config.tableH / 4) {
                // check right top pocket
        dist = dist2(gameSetup.tablePocket3[2], pos);
        pocketID = 2;
      } else if (pos.x < config.tableCenterX - config.tableW / 4 && pos.y > config.tableCenterY + config.tableH / 4) {
                // check left bottom pocket
        dist = dist2(gameSetup.tablePocket3[5], pos);
        pocketID = 5;
      } else if (pos.x > config.tableCenterX + config.tableW / 4 && pos.y > config.tableCenterY + config.tableH / 4) {
                // check right bottom pocket
        dist = dist2(gameSetup.tablePocket3[3], pos);
        pocketID = 3;
      } else if (pos.y < config.tableCenterY - config.tableH / 4) {
                // check  top pocket
        dist = dist2(gameSetup.tablePocket3[1], pos);
        tablePocketR = config.sidePocketD / 2 * 0.73;
        pocketID = 1;
      } else {
                // bottom pocket
        dist = dist2(gameSetup.tablePocket3[4], pos);
        tablePocketR = config.sidePocketD / 2 * 0.73;
        pocketID = 4;
      }

      // return pocketID;
      // if (ID == 1)
      //   console.log("dist " + dist + " " + tablePocketR);
      if (dist < tablePocketR * 0.98) {
        return pocketID;
                // console.log("pocket type 2 " + pos + " " + dist + " " + tablePocketR);
      }
    }
    return null;
  };

  gameSetup.fround = (v) => {
    v.x = Math.fround(v.x);
    v.y = Math.fround(v.y);
  };

  this.adjustVAV = (v, av, b, isRealRun) => {
    const config = gameSetup.config;
    if (b.ID == 2 && isRealRun) {
      // console.log(gameSetup.counter + ": before adjustVAV , " + b.position[0] + " " + b.position[1] + " " + v.x + "," + v.y + ",av," + av.x + "," + av.y);
    }

    let spinV = av.clone().add(v);
    gameSetup.fround(spinV);
    let ff = 0;
    const origspeed = v.length();
    if (spinV.length() > 0) { // that is: v != av
      // if (b.ID == 0) console.log("spinV " + spinV.length() + " av " + JSON.stringify(av) + " v " + JSON.stringify(v));
      // console.log("spinv length " + spinV.length() + " vs 3.5 sliding " + (3.5 * gameSetup.slidingFriction));
      if (spinV.length() < 3.5 * gameSetup.slidingFriction) {
                // after this, v and av will be the same
        // converting speed into angular speed and store energy
        const friction = spinV.multiplyScalar(2 / 7);
        gameSetup.fround(friction);
        ff = friction;
        // if (b.ID == 0) console.log("spinV 1 " + spinV.length().toFixed(1) + " fiction " + friction.x.toFixed(1) + " " + friction.y.toFixed(1));
        v.subtract(friction);
        gameSetup.fround(v);
        const fictionAngular = friction.multiplyScalar(5 / 2);
        gameSetup.fround(fictionAngular);
        av.subtract(fictionAngular);
        gameSetup.fround(av);
      } else {
        if (b.trail && b.inPocketID == null && !b.hasFirstCurve) {
          b.trail.push([b.position[0], b.position[1]]);
          b.hasFirstCurve = true;
        }
        // normal sliding friction applied to both v and av
        const friction = spinV.normalize().multiplyScalar(gameSetup.slidingFriction);
        gameSetup.fround(friction);
        ff = friction;
        // if (b.ID == 0) console.log("fiction " + JSON.stringify(fiction));
        // if (b.ID == 0) console.log("spinV 2 " + spinV.length().toFixed(1) + " fiction " + friction.x.toFixed(1) + " "+ friction.y.toFixed(1));
        v.subtract(friction);
        gameSetup.fround(v);
        const fictionAngular = friction.multiplyScalar(5 / 2);
        gameSetup.fround(fictionAngular);
        av.subtract(fictionAngular);
        gameSetup.fround(av);
      }
    }

    const speed = v.length();
    if (speed > 0) {
      const dd = Math.fround(gameSetup.speedDecay * (1 + speed/800));
      // const dd = gameSetup.speedDecay * (1);
      const newspeed = Math.fround(Math.max(0, speed - config.ballD / (dd * (1 + speed / 100000000))));
      // if (b.ID == 0 && speed >= 300 ) console.log("origspeed " + origspeed.toFixed(0) + " speed " + speed.toFixed(0) + " newspeed " + newspeed.toFixed(0) + " ff " + ff.toFixed(0));
      spinV = av.clone().add(v);
      gameSetup.fround(spinV);
      v.multiplyScalar(newspeed / speed);
      gameSetup.fround(v);
      if (spinV.length() === 0) { // that is: v == av
                // av = v.clone().multiplyScalar(-1);
        av.multiplyScalar(newspeed / speed);
        gameSetup.fround(av);
      } else {
                // anything to do if not in equilibrium state yet?
      }
    }
    if (b.ID == 2 && isRealRun) {
      // console.log(gameSetup.counter + ": after adjustVAV , " + b.position[0] + " " + b.position[1] + " " + v.x + "," + v.y + ",av," + av.x + "," + av.y);
    }
  };

  this.prepareForHSpin = (b) => {
    if (b.hspin == 0) return;

    b.touchedRail = false;
    b.touchedBall = false;

    if (!b.oldv) b.oldv = new Victor(0, 0);
    b.oldv.x = b.velocity[0];
    b.oldv.y = b.velocity[1];
  };

  this.adjustForHSpin = (b) => {
    if (b.hspin == 0) return;
    if (b.touchedRail || b.touchedBall) {
      // debugger;
      // adjust cue ball velocity direction and speed
      if (!b.new) b.newv = new Victor(0, 0);
      b.newv.x = b.velocity[0];
      b.newv.y = b.velocity[1];

      b.oldv.scale(-1);

      const oldVUnit = b.oldv.clone().normalize();
      const newVUnit = b.newv.clone().normalize();
      const avgVUnit = oldVUnit.clone().add(newVUnit).normalize();

      const oldToNewDir = newVUnit.clone().subtract(oldVUnit);
      let newV;
      if (b.hspin > 0) {
        newV = avgVUnit.rotateDeg(90);
      } else {
        newV = avgVUnit.rotateDeg(-90);
      }

      // now calculate how much is new velocity due to friction that's to be added to ball velocity
      let maxAdjAmount = 20;
      if (b.touchedBall) {
        maxAdjAmount = 2;
      }

      let actualAdjAmt = 0;
      if (Math.abs(b.hspin) <= maxAdjAmount) {
        actualAdjAmt = Math.abs(b.hspin);
        b.hspin = 0;
      } else {
        if (b.hspin > 0) {
          b.hspin -= maxAdjAmount;
        } else {
          b.hspin += maxAdjAmount;
        }
        actualAdjAmt = maxAdjAmount;
      }

      const ratio = actualAdjAmt * 20;
      newV.scale(ratio);
      b.velocity[0] += newV.x;
      b.velocity[1] += newV.y;


      return;

      // const oldAng = b.oldv.horizontalAngleDeg();
      // let newAng = b.newv.horizontalAngleDeg();

      // if (newAng > oldAng + 180) newAng -= 360;
      // if (newAng < oldAng - 180) newAng += 360;

      // const midAng = (oldAng + newAng) / 2;
      // const diffAng = (newAng - oldAng) / 2;

      // let maxAdjAmount = 20;
      // if (b.touchedBall) {
      //   maxAdjAmount = 10;
      // }

      // // add limit so it never spin more than 0.95 * 90 degrees!
      // const maxAdjRoom = (90 * 0.95) - Math.abs(diffAng);
      // if (maxAdjRoom <= 0) return;
      // if (maxAdjAmount > maxAdjRoom) {
      //   maxAdjAmount = maxAdjRoom;
      // }

      // let newDiffAng;
      // let actualAdjAmt = 0;
      // if (Math.abs(b.hspin) <= maxAdjAmount) {
      //   newDiffAng = diffAng + b.hspin;
      //   actualAdjAmt = b.hspin;
      //   b.hspin = 0;
      // } else {
      //   if (b.hspin > 0) {
      //     newDiffAng = diffAng + maxAdjAmount;
      //     actualAdjAmt = 0 - maxAdjAmount;
      //     b.hspin -= maxAdjAmount;
      //   } else {
      //     newDiffAng = diffAng - maxAdjAmount;
      //     actualAdjAmt = maxAdjAmount;
      //     b.hspin += maxAdjAmount;
      //   }
      // }

      // const newAng2 = midAng + newDiffAng;

      // // adjust speed by adding to velocity a parallel v!
      // const midNorm = new Victor(Math.cos(midAng / 180 * Math.PI), Math.sin(midAng / 180 * Math.PI));



      // const oldspeed = b.oldv.length();

      // old way
      // let newspeed = oldspeed * 1.1;
      // if (Math.abs(newDiffAng) < Math.abs(diffAng)) {
      //   newspeed = oldspeed * 0.9;
      // }

      // new way
      // const newspeed = oldspeed * Math.abs(newDiffAng) / Math.abs(diffAng);

      // b.velocity[0] = newspeed * Math.cos(newAng2 / 180 * Math.PI);
      // b.velocity[1] = newspeed * Math.sin(newAng2 / 180 * Math.PI);
    }
  };

  const v = new Victor(0, 0);

  this.applyRollingFriction = (bodylist, isRealRun) => {
    const config = gameSetup.config;

    const allIDs = Object.keys(bodylist);
    const pos = new Victor(0, 0);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = bodylist[i];
      if (b.inPocketID == null && !b.isStopped) {
        v.x = b.velocity[0]; v.y = b.velocity[1];
        const av = b.av;
        this.adjustVAV(v, av, b, isRealRun);

        if (b.ID === 0) {
          that.counter ++;
          // console.log(that.counter + ": after adjustVAV , " + v.x + "," + v.y + ",av," + av.x + "," + av.y + ",pos," + b.position[0] + "," + b.position[1]);
        }
        b.velocity[0] = Math.fround(v.x);
        b.velocity[1] = Math.fround(v.y);
      }
    }
  };


  this.countBallOnTable = (c) => {
    let count = 0;
    for (let k=0; k < gameSetup.balls.length; k++) {
      const b2 = ballbodies2[k];
      if ( ( typeof(b2.inPocketID) == "undefined" || b2.inPocketID == null) && b2.colorType == c) {
        count ++;
      }
    }
    return count;
  };


  // isProb: false then update forecast, true then estimate pocket probability
  /*
    3 modes of simulation:
    1. SIM_PROB: part of a probability run with pre-specified skew so just needs to know if target is pocketd.
    2. SIM_DRAW: need to draw forecast lines with no skew
    3. SIM_ENDSTATE: similar to SIM_PROB, run with pre-specified skew, no need for drawing
  */
  this.runSimulation = (simType, simSkew, savedTargetBallID) => {
    const config = gameSetup.config;
    // if input has changed, run simulation in world2 and draw forecast trail

    if (gameSetup.inStrikeAnimation) return;

    if (!gameSetup.activePlayerInfo) return;


    let strength;
    let spinMultiplier, hspin;

    if (gameSetup.activePlayerInfo.playerType == "AI") {
      if (!gameSetup.AIStrength) { gameSetup.AIStrength = 40; }
      if (!gameSetup.AISpinMultiplier) { gameSetup.AISpinMultiplier = 0; }
      if (!gameSetup.AIHSpin) { gameSetup.AIHSpin = 0; }
      strength = gameSetup.AIStrength / 100 * MAX_SPEED / unitScale; // unit difference?
      spinMultiplier = gameSetup.AISpinMultiplier;
      hspin = gameSetup.AIHSpin;
    } else {
      strength = gameSetup.speedMeterBall.value / 100 * MAX_SPEED / unitScale; // unit difference?
      spinMultiplier = 0 - SPIN_M * gameSetup.spinMeterBar.value;
      hspin = gameSetup.spinMeterBarH.value;
    }
    const dir = gameSetup.cueballDirection.clone();


    // console.log("run sim xxx: strength " + strength + " spinMultiplier " + spinMultiplier + " hspin " + hspin);

    // console.log("run sim : " + gameSetup.targetBallID + " " + gameSetup.targetPocketID + " " + gameSetup.cueballDirection.x + " " + gameSetup.cueballDirection.y);

    if (gameSetup.gameType == GAME_TYPE.MATCH && !gameSetup.activePlayerInfo.isLocal && gameSetup.previewStrength) {
      strength = gameSetup.previewStrength;
      dir.x = gameSetup.previewDir.x;
      dir.y = gameSetup.previewDir.y;
      spinMultiplier = gameSetup.previewSpinMultiplier;
      hspin = gameSetup.previewHSpin;
      // delete gameSetup.previewStrength;
    }


    if (simType == SIM_PROB || simType == SIM_ENDSTATE) {
      // add random noise
      // const rr = rnd2();
      // console.log(`strike using rr of ${rr} at time ${Date.now()}`);
      // ?? do we need to add it if it is a prob run? yes why not!
      //const rot = (simSkew) * (Math.PI / gameSetup.Randomness) * (strength * (1 + Math.abs(spinMultiplier / 2.5)));
      let givenSkew = simSkew;
      let rot;
      if (simType == SIM_ENDSTATE) { // simSkew means withRandom
        if (simSkew)
          rot = gameSetup.calculateRotation(strength, spinMultiplier, hspin);
        else
          rot = gameSetup.calculateRotation(strength, spinMultiplier, hspin, 0);
      } else {
        // console.log("calc prob using " + strength + " " + spinMultiplier + " " + hspin + " " + givenSkew)
        rot = gameSetup.calculateRotation(strength, spinMultiplier, hspin, givenSkew);
      }
      dir.rotate(rot);
      // console.log("sim dir with skew " + simSkew + " is " + dir.x + " " + dir.y);
    }

    const time1 = getMS();

    if (simType == SIM_DRAW) {
      // let changed = false;
      // if (gameSetup.prevStrength != strength)
      //   changed = true;
      // else if (gameSetup.prevspinMultiplier != spinMultiplier)
      //   changed = true;
      // else if (gameSetup.prevDirX != dir.x)
      //   changed = true;
      // else if (gameSetup.prevDirY != dir.y)
      //   changed = true;

      // if (gameSetup.enteringSimulation) {
      //   gameSetup.enteringSimulation = false;
      //   changed = true;
      // }
      // if (!changed) return false;

      // aaaa drawing for lesson 22
      // spinMultiplier = 1;
      // strength = 1500;

      gameSetup.prevStrength = strength;
      gameSetup.prevspinMultiplier = spinMultiplier;
      gameSetup.prevhspin = hspin;
      gameSetup.prevDirX = dir.x;
      gameSetup.prevDirY = dir.y;

      if (!gameSetup.forecastG) {
        gameSetup.forecastG = new PIXI.Graphics();
        gameSetup.forecastG.zOrder = 50;
        gameSetup.stage.addChild(gameSetup.forecastG);
      }
      this.clearForecastLines();
      // const targetBall = gameSetup.ballsByID[gameSetup.targetBallID];
      // const targetBallPos = new Victor(targetBall.position.x, targetBall.position.y);
      gameSetup.targetBallID = null;
      gameSetup.targetPocketID = null;

      gameSetup.cuestick.visible = true;
      gameSetup.cuestick.alpha = 1;
      gameSetup.cuestick.position.y = strength / 15 + config.ballD / 2;
      gameSetup.cuestick.position.x = -1 * config.ballD/2 * hspin / 30;
      const rot = Math.atan2(dir.y, dir.x) + Math.PI / 2;
      gameSetup.cuestickcontainer.rotation = rot;
      gameSetup.cuestickcontainer.position.x = gameSetup.cueball.body.position[0];
      gameSetup.cuestickcontainer.position.y = gameSetup.cueball.body.position[1];
      if (window.InitState) {
        gameSetup.cuestickcontainer.position.x = window.InitState[0].x + gameSetup.config.tableCenterX;
        gameSetup.cuestickcontainer.position.y = window.InitState[0].y + gameSetup.config.tableCenterY;
      }
      if (gameSetup.gameType == GAME_TYPE.TESTING) {
        // ccccc
        if (hideTrail) gameSetup.cuestick.visible = false;
      }

      if (gameSetup.controller.gameState != CALL_SHOT_STATE) {
        gameSetup.targetBallMark.visible = false;
        gameSetup.targetPocketMark.visible = false;
      } else {
        gameSetup.targetBallMark.visible = true;
        gameSetup.targetPocketMark.visible = true;
      }

      // this is controlling distance from cue to ball!
      const distance = strength / 15 + config.ballD / 2;
      // console.log("set cue stick position to " + distance);
      gameSetup.cuestick.position.y = distance;
      gameSetup.cuestick.position.x = -1 * config.ballD/2 * hspin / 30;
    } else {
      // ?? if prob run, I still need to know target ball id and compare to actually pockted ball! so I can't null these?
      gameSetup.targetBallID = null;
      gameSetup.targetPocketID = null;
    }

    const time2 = getMS();
    // console.log("sim time 1 " + (time2 - time1));

    if (window.InitState) {
      this.setupWorld2ByInitState();
    } else {
      this.copyWorldTo2();
    }
    gameSetup.cueball.body2.hasFirstContact = false;
    gameSetup.currentShotStrength = strength;
    gameSetup.firstBallTouchedByCueball = null;
    ballbodies[0].touchedRail = false;
    gameSetup.isKickShot = false;

    gameSetup.firstCushionTouchedByBall = null;
    gameSetup.firstBallTouchAfterRail = false;
    gameSetup.someBallTouchedRailedAfter = false;
    gameSetup.ballsTouchedRails = [];
    gameSetup.railsTouchedByTargetBall = [];
    gameSetup.railsTouchedByCueBall = [];
    gameSetup.newlyPocketedBalls = [];

    const force = dir.normalize().multiplyScalar(strength);
    force.x = Math.fround(force.x);
    force.y = Math.fround(force.y);
    const av = force.clone().multiplyScalar(spinMultiplier);

    gameSetup.cueball.body2.applyImpulse([force.x, force.y], 0, 0);
    gameSetup.cueball.body2.av = av;
    gameSetup.cueball.body2.hspin = hspin ? hspin : 0;

    // physics loop
    let allStopped2 = false;
    let cnt = 0;
    // let ROUNDS = Math.round(strength/500);
    // if (ROUNDS < 2) ROUNDS = 2;
    // const stepsizePerRound = stepsize / ROUNDS;

    // console.log("run simulation with " + strength.toFixed(0) + " " + dir.x.toFixed(1) + " " + dir.y.toFixed(1) );

    const time3 = getMS();
    // console.log("sim time 2 " + (time3 - time2));

    let round = 0;
    // console.log("\n\n\n\n\n\n sim trail");
    while (!allStopped2) {
      cnt ++;
      if (cnt > 10000) break;
      // for (let k=0; k<ROUNDS; k++) {
        const b = gameSetup.cueball.body2;
        // if (cnt < 250) {
        //   console.log("b.velocity " + b.velocity[0] + " " + b.position[0]);
        // }
        // if (isNaN(b.velocity[0]) || isNaN(b.position[0]) ) {
        //   debugger;
        // }
        // console.log("b speed before " + b.velocity[0]);

        let totalStep = 0;
        const allIDs = Object.keys(ballbodies);
        while (totalStep <= 1/60.001) {


          if (gameSetup.cueball.body2.position[0] - gameSetup.config.tableCenterX <= -660) {
            // console.log("cueball body2 before step " + (gameSetup.cueball.body2.position[0] - gameSetup.config.tableCenterX) + " " + (gameSetup.cueball.body2.position[1] - gameSetup.config.tableCenterY) + " " + gameSetup.cueball.body2.velocity[0] + " " + gameSetup.cueball.body2.velocity[1] + " "  + gameSetup.cueball.body2.av.x + " " + gameSetup.cueball.body2.av.y);
          }

          let step = gameSetup.controller.calculateStepSize(ballbodies2);

          if (step < 1 / 61) {

            // console.log("ball 6 body2 before step " + step + " " + gameSetup.ballsByID[6].body2.velocity[0] + " " + gameSetup.ballsByID[6].body2.velocity[1] + " " + gameSetup.ballsByID[6].body2.position[0] + " " + gameSetup.ballsByID[6].body2.position[1]);
          }
          if (step < 0.1 / 120) {
            // step = 0.1 / 120;
          }


          // console.log("cueball body2 before step " + step + " " + gameSetup.cueball.body2.velocity[0] + " " + gameSetup.cueball.body2.velocity[1] + " " + gameSetup.cueball.body2.position[0] + " " + gameSetup.cueball.body2.position[1]);


          that.prepareForHSpin(gameSetup.cueball.body2);

          if (gameSetup.closestPointTarget != null && gameSetup.closestTargetBallTouchedRails.length < 2) {
            const ballPos = gameSetup.ballbodies2[gameSetup.closestPointBallID];
            const ballPosObj = {x: ballPos.position[0], y: ballPos.position[1]};
            ballPos.prevx = ballPos.oldx;
            ballPos.prevy = ballPos.oldy;
            ballPos.oldx = ballPosObj.x;
            ballPos.oldy = ballPosObj.y;
            const newdist = dist2(ballPosObj, gameSetup.closestPointTarget);
            if (newdist < gameSetup.closestPointDistance ) {
              if (gameSetup.closestPointBallID != 0 || !gameSetup.ballbodies2[0].hasFirstContact) {
                // if (newdist < 100) console.log("before step update CTP " + gameSetup.closestPointDistance + " to " + newdist + " old CTP " + (gameSetup.closestPointTarget.x - gameSetup.config.tableCenterX) + " " + (gameSetup.closestPointTarget.y - gameSetup.config.tableCenterY) +  " " + (ballPosObj.x - gameSetup.config.tableCenterX) + " " + (ballPosObj.y - gameSetup.config.tableCenterY));
                gameSetup.closestPointDistance = newdist;
                gameSetup.closestPoint.x = ballPosObj.x;
                gameSetup.closestPoint.y = ballPosObj.y;
              }
            }
          }


          world2.step(step);

          that.adjustForHSpin(gameSetup.cueball.body2);

          // if (cnt > 5 && cnt < 9)
          //   console.log(cnt + " black body2 " + gameSetup.blackball.body2.velocity[0] + " " + gameSetup.blackball.body2.velocity[1] + " " + gameSetup.blackball.body2.position[0] + " " + gameSetup.blackball.body2.position[1]);

          if (0) {
            if (round <= 38 || round == 39) {
              console.log("step is " + step);
              for (let j=0; j<allIDs.length; j++) {
                const i = allIDs[j];
                const bb = ballbodies2[i];
                // console.log("ball " + i  + " " + len2(bb.velocity) + " " + bb.velocity[0] + " " + bb.velocity[1]);
              }
            }
          } else {
            // let bb = ballbodies2[0];
            // console.log("" + round  + " " + len2(bb.velocity) + " " + bb.velocity[0] + " " + bb.velocity[1]);
          }
          totalStep += step;
          round ++;
        }

        if (gameSetup.controller.gameState >= CALL_SHOT_STATE && gameSetup.firstBallTouchedByCueball != null) {
          if (gameSetup.activePlayerInfo.chosenColor != null) {
            if (gameSetup.firstBallTouchedByCueball.colorType !== gameSetup.activePlayerInfo.legalColor) {
              // only do forecast up to first ball touched if it is wrong!
              break;
            }
          }
        }


        // this.saveBodyPositions(ballbodies2);
        // console.log("b speed after " + b.velocity[0]);
        this.applyRollingFriction(ballbodies2, false);
        // console.log("b speed after 2 " + b.velocity[0]);
        allStopped2 = this.markPocketedOrStopped(ballbodies2, simType != SIM_DRAW, savedTargetBallID);
        // console.log("b speed after 3 " + b.velocity[0]);
        if (allStopped2) {
          break;
        }
      // }
    }

    const time4 = getMS();
    // console.log("sim time 3 " + (time4 - time3));

    // draw trail graphics
    if (simType == SIM_DRAW) {
      // console.log("drawForecast in sim");
      this.drawForecast();
    }

    const time5 = getMS();
    // console.log("sim time 4 " + (time4 - time4));

    // mark target ball/pockete if not in break shot mode
    if (gameSetup.controller.gameState > 0 || gameSetup.gameType == GAME_TYPE.TESTING) {
      let shouldRemoveTargets = true;
      if (gameSetup.newlyPocketedBalls.length > 0) {
        let validShot = true;
        if (gameSetup.activePlayerInfo.chosenColor != null) {
          // check if first touched ball is legal!
          if (gameSetup.firstBallTouchedByCueball.ball.colorType != gameSetup.activePlayerInfo.legalColor) {
            if (gameSetup.firstBallTouchedByCueball.ball.colorType == Pool.BLACK) {
              // if no ball of that legalColor colorType is on table then fine
              let myBallOnTable = this.countBallOnTable(gameSetup.activePlayerInfo.legalColor);
              if (myBallOnTable > 0) {
                validShot = false;
              }
            } else {
              validShot = false;
            }
          }
        } else {
          // no ball chosen, but can't shoot black unless all other balls are pocketed!
          if (gameSetup.firstBallTouchedByCueball.ball.ID == 1) {
            let allotherballpocketed = true;
            const allIDs = Object.keys(ballbodies);
            for (let j=0; j<allIDs.length; j++) {
              const i = allIDs[j];
              const b2 = ballbodies2[i];
              if (b2.ID >= 2 && b2.inPocketID == null) {
                allotherballpocketed = false;
                break;
              }
            }

            if (!allotherballpocketed) {
              validShot = false;
            }
          }
        }

        if (validShot) { // move target ball and pocket marks
          for (let j=0; j<gameSetup.newlyPocketedBalls.length; j++) {
            const bid = Number(gameSetup.newlyPocketedBalls[j]);
            const b = gameSetup.ballsByID[bid]; // b is the ball
            if (bid > 0) {
              // target ball doesn't have to be first in newlyPocketedBalls
              // but it has to be first of the legal color!
              if (gameSetup.activePlayerInfo.chosenColor == null
                || b.colorType == gameSetup.activePlayerInfo.legalColor
                || b.colorType == Pool.BLACK && 0 == this.countBallOnTable(gameSetup.activePlayerInfo.legalColor)
                ) {
                if (b.ID == 1) {
                  if (gameSetup.activePlayerInfo.chosenColor == null) {
                    // black ball would pocket and no color chosen yet, so unless no other color ball
                    // exist you can't shoot black ball!

                    let allotherballpocketed = true;
                    const allIDs = Object.keys(ballbodies);
                    for (let j2=0; j2<allIDs.length; j2++) {
                      const i = allIDs[j2];
                      const b2 = ballbodies2[i];
                      if (b2.ID >= 2 && b2.inPocketID == null) {
                        allotherballpocketed = false;
                        break;
                      }
                    }

                    if (!allotherballpocketed) {
                      gameSetup.targetBallID = b.ID;
                      gameSetup.targetPocketID = b.body2.inPocketID;
                      shouldRemoveTargets = false;
                    }

                  } else {
                    // black ball would pocket and it is the legal color so good
                    gameSetup.targetBallID = b.ID;
                    gameSetup.targetPocketID = b.body2.inPocketID;
                    shouldRemoveTargets = false;
                  }
                } else {
                  gameSetup.targetBallID = b.ID;
                  gameSetup.targetPocketID = b.body2.inPocketID;
                  shouldRemoveTargets = false;
                  break;
                }
              }
            }
          }
        }
      }

      if (simType != SIM_DRAW) {
        return true;
      } else {
        let showAutoMark = false;
        if (gameSetup.controller.gameState == CALL_SHOT_STATE && gameSetup.firstBallTouchedByCueball != null) {
          if (gameSetup.activePlayerInfo.chosenColor != null) {
            if (gameSetup.firstBallTouchedByCueball.colorType !== gameSetup.activePlayerInfo.legalColor) {
            } else {
              if (gameSetup.firstBallTouchAfterRail) {
                showAutoMark = false;

              } else {
                showAutoMark = true;
              }
            }
          } else {
            if (gameSetup.firstBallTouchAfterRail) {
              showAutoMark = false;
            } else {
              if (gameSetup.firstBallTouchedByCueball.colorType == Pool.BLACK) {
                showAutoMark = false;
              } else {
                showAutoMark = true;
              }
            }
          }
        }
        if (true || showAutoMark) {
          if (gameSetup.firstBallTouchedByCueball) {
            gameSetup.firstBallMark.position.x = gameSetup.firstBallTouchedByCueball.ball.body.position[0];
            gameSetup.firstBallMark.position.y = gameSetup.firstBallTouchedByCueball.ball.body.position[1];
          }
          if (gameSetup.autoBtn) {
            gameSetup.autoBtn.visible = true;
          }
        } else {
          gameSetup.firstBallMark.position.x = 1000000;
          gameSetup.firstBallMark.position.y = 1000000;
          if (gameSetup.autoBtn) gameSetup.autoBtn.visible = false;
        }
        if (shouldRemoveTargets) {
          gameSetup.targetPocketMark.position.x = 1000000;
          gameSetup.targetBallMark.position.x = 1000000;
        } else {
          let thepid = gameSetup.targetPocketID;
          if (thepid > 5) {
            thepid = gameSetup.pocketIDMap[thepid];
          }
          const pocket = gameSetup.tablePocket2[thepid];
          gameSetup.targetPocketMark.position.x = pocket.x;
          gameSetup.targetPocketMark.position.y = pocket.y;
          const b = gameSetup.ballsByID[gameSetup.targetBallID];
          gameSetup.targetBallMark.position.x = b.position.x;
          gameSetup.targetBallMark.position.y = b.position.y;
        }

        if (gameSetup.controller.gameState != CALL_SHOT_STATE) {
          gameSetup.targetBallMark.visible = false;
          gameSetup.targetPocketMark.visible = false;
        } else {
          gameSetup.targetBallMark.visible = true;
          gameSetup.targetPocketMark.visible = true;
        }

        // draw aim ball

      }
    }

    if (gameSetup.gameType == GAME_TYPE.TESTING) {
      if (typeof(gameSetup.aimx) == "undefined") {
        gameSetup.aimBallMark.position.x = gameSetup.config.tableCenterX;
        gameSetup.aimBallMark.position.y = gameSetup.config.tableCenterY;
        gameSetup.aimBallMark.aimCText.text = `(0, 0)`;
      } else {
        gameSetup.aimBallMark.position.x = gameSetup.aimx;
        gameSetup.aimBallMark.position.y = gameSetup.aimy;
        gameSetup.aimBallMark.aimCText.text = `(${Math.round(gameSetup.aimx-config.tableCenterX)}, ${Math.round(gameSetup.aimy-config.tableCenterY)})`;
      }

      // ccccc for screenshot
      if (hideTrail) {
        gameSetup.aimBallMark.aimCText.text = "";
        gameSetup.aimBallMark.position.x = -10000;
      }
      // gameSetup.aimBallMark.aimCText.text = "";
    } else {
      gameSetup.aimBallMark.position.x = 1000000;
    }


    return true;
  };

  this.saveBodyPositions = (bodies) => {
    const allIDs = Object.keys(bodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = bodies[i];
      b.oldx = b.position[0];
      b.oldy = b.position[1];
    }
  };

  this.copyWorldTo2 = () => {
    const allIDs = Object.keys(ballbodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = ballbodies[i];
      const b2 = ballbodies2[i];

      b2.inPocketID = b.inPocketID;
      b2.isStopped = false;
      b2.velocity[0] = 0;
      b2.velocity[1] = 0;
      b2.angularVelocity = 0;
      b2.vlambda[0] = 0;
      b2.vlambda[1] = 0;
      b2.wlambda = 0;
      b2.av.x = 0; b2.av.y = 0;
      b2.trail = [];
      b2.hasFirstCurve = false;
      if (b.inPocketID != null) {
        b2.position[0] = 1000000;
        b2.position[1] = 1000000 + j * 100;
      } else {
        b2.position[0] = b.position[0];
        b2.position[1] = b.position[1];
        b2.oldx = b.position[0];
        b2.oldy = b.position[1];
        b2.trail.push([b2.position[0], b2.position[1]]);
      }
    }
  };


  this.setupWorld2ByInitState = () => {

    let allStates = [];
    const allIDs = Object.keys(ballbodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b2 = ballbodies2[i];
      let found = false;
      for (let k=0; k<window.InitState.length; k++) {
        if (window.InitState[k].ballID == i) {
          allStates.push(window.InitState[k]);
          found = true;
          break;
        }
      }
      if (!found) {
        allStates.push({
          ballID: i, inPocketID: 0
        });
      }
    }

    for(let j=0; j<allStates.length; j++) {
      const b = allStates[j];
      const b2 = ballbodies2[b.ballID];

      b2.inPocketID = b.inPocketID;
      b2.isStopped = false;
      b2.velocity[0] = 0;
      b2.velocity[1] = 0;
      b2.angularVelocity = 0;
      b2.vlambda[0] = 0;
      b2.vlambda[1] = 0;
      b2.wlambda = 0;
      b2.av.x = 0; b2.av.y = 0;
      b2.trail = [];
      b2.hasFirstCurve = false;
      if (b.inPocketID != null || typeof(b.inPocketID) == "undefined") {
        b2.position[0] = 1000000;
        b2.position[1] = 1000000  + j * 100;
      } else {
        b2.position[0] = b.x + gameSetup.config.tableCenterX;
        b2.position[1] = b.y + gameSetup.config.tableCenterY;
        b2.oldx = b.x;
        b2.oldy = b.y;
        b2.trail.push([b2.position[0], b2.position[1]]);
      }
    }
  };

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
      if (gameSetup.isHost && gameSetup.hostAllStopped && !gameSetup.allStopHandled) {
        gameSetup.controller.checkIfAllPeerAllStopped();
        if (!gameSetup.allStopHandled) {
          //console.log("still haven't handle all stopped!");
        }
      }



      gameSetup.controller.trySelectPlayer();
      gameSetup.controller.tickUpdate();
    } else {
      if (gameSetup.goldemitter) {
        const now = Date.now();
        if (!gameSetup.goldEmitterPast) {gameSetup.goldEmitterPast = now;}
        gameSetup.goldemitter.update((now - gameSetup.goldEmitterPast) * 0.001);
        gameSetup.goldEmitterPast = now;
      }
    }

    TWEEN.update(time);

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
};

export default PathPoolGame;


/**
 *
 * advanced class 4


working test code:

ResetTable(true);
PlaceBallOnTable(0, -322, -351);
PlaceBallOnTable(2, -861, -387);
PlaceBallOnTable(3, -928, 364);
PlaceBallOnTable(1, -910, 310);
PlaceBallOnTable(6, 810, 89);

ChooseRedColor();

await UpdateWorld();
TakeCallShot();
await WaitForAllBallStop();

//await UpdateWorld();
//TakeCallShot();
//await WaitForAllBallStop();

ReportEndOfTest();



working robot code for prob2:


const LoggingLevel = 1;

function p0(msg) {
  if (LoggingLevel >= 0)
    console.log(msg);
}

function p1(msg) {
  if (LoggingLevel >= 1) console.log(msg);
}


function getCueBallPlacement() {
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k++) {
    const ballID = legalBallIDs[k];
    const ballPos = Balls[ballID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {
      const pocketPos = Pockets[pocketID];
      const isBlocked = isPathBlocked(ballPos, pocketPos);
      if (!isBlocked) {
        return extrapolatePoints(pocketPos, ballPos, 2 * BallDiameter);
      }
    }
  }
}


function getMinCutAngle(endStates, prevTargetBallID) {
  const cueballPos = endStates[0];
  let minAngle = 361;

  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k++) {
    const ballID = legalBallIDs[k];
    if (ballID == prevTargetBallID) continue;
    const targetBallPos = endStates[ballID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {
      const pocketPos = Pockets[pocketID];
      const aimPoint = getAimPosition(targetBallPos, pocketPos);
      const angle = Math.abs(getCutAngle(pocketPos, aimPoint, cueballPos));


      if (angle < minAngle) {
        p1("new min angle " + ballID + " " + pocketID + ": " + angle);
        minAngle = angle;
      }
    }
  }

  return minAngle;
}




async function getMaxNextProb(endStates, prevTargetBallID) {
  //if (1) return Math.random();
  const cueballPos = endStates[0];
  let maxProb = -1;

  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k < legalBallIDs.length; k++) {
    const ballID = legalBallIDs[k];
    if (ballID == prevTargetBallID) continue;
    const targetBallPos = endStates[ballID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {


    //if (ballID != 6) continue;
    //if (pocketID != 3) continue;


      const pocketPos = Pockets[pocketID];
      const aimPoint = getAimPosition(targetBallPos, pocketPos);

      const cmd = {
        aimx: aimPoint.x,
        aimy: aimPoint.y,
        strength: 50,
        targetBallID: ballID,
        targetPocketID: pocketID
      };


      const prob = await calculateProbability2(endStates, cmd);
      p1("next prob " + ballID + " " + pocketID + ": " + prob);

      if (prob > maxProb) {
        p1("new prob " + ballID + " " + pocketID + ": " + prob);
        maxProb = prob;
      }
    }
  }

  return maxProb;
}

async function getCallShot() {
  // place holder for best command and highest probability
  let bestCommand = {
    prob: -1
  };

  // new constant representing table center
  const tableCenter = {
    x: 0,
    y: 0
  };
  const legalBallIDs = world.CandidateBallList[MyID];
  for (let k = 0; k <= legalBallIDs.length - 1; k = k + 1) {
    const ballID = legalBallIDs[k];
    const isBlocked = isPathBlocked(Balls[ballID], Balls[0]);
    if (isBlocked) continue;



    for (let pocketID = 0; pocketID <= 0; pocketID = pocketID + 1) {
      const aimPoint = getAimPosition(Balls[ballID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Balls[0]);
      if (Math.abs(cutAngle) > 90) continue;

      // iterate through strength values of 20/40/60/80
      for (let s = 10; s <= 80; s = s + 5) {
        const cmd = {
          aimx: aimPoint.x,
          aimy: aimPoint.y,
          strength: s,
          targetBallID: ballID,
          targetPocketID: pocketID
        };

        const endStates = await calculateEndState(cmd);
        const cueballPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        if (cmd.prob > 0) {
		      p0("\nfirst shoot ball " + ballID + " pocket " + pocketID + " s " + s);
        }
        //const currentState = [];

        //for (let i = 0; i < Balls.length; i++) {
        //  const b = Balls[i];
        //  currentState.push({
        //    x: b.x,
        //    y: b.y,
        //    ballID: i,
        //    inPocketID: b.inPocket ? 0 : null
        //  });
        //}
        //const prob2 = await calculateProbability2(currentState, cmd);
        //const endStates2 = await calculateEndState2(currentState, cmd);
        //debugger;


        if (cmd.prob > 70 && bestCommand.prob > 70) {
          // both commands are good enough for probability,
          cmd.nextProb = await getMaxNextProb(endStates, ballID);
          if (cmd.nextProb > bestCommand.nextProb) {
            p1("new best command ! " + cmd.nextProb);
            bestCommand = cmd;
          }
        } else {
          // simply choose the one with higher probability
          if (cmd.prob > bestCommand.prob) {
            cmd.nextProb = await getMaxNextProb(endStates, ballID);
            p1("new best command ! " + cmd.nextProb);
            bestCommand = cmd;
          }
        }


      }
    }
  }

  // play safety when we don't have a good shot
  if (bestCommand.prob < 50) {
    const targetPosOld = Balls[bestCommand.targetBallID];
    for (let s = 2; s < 40; s = s + 1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetBallID];
      if (targetPosOld.x != targetPosNew.x || targetPosOld.y != targetPosNew.y) {
        break;
      }
    }
  }

  // return the best command we found
  return bestCommand;
}

function getBreakShot() {
  return {
    aimx: 0,
    aimy: 0,
    strength: 80
  };
}


 */
