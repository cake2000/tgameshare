/*

genius soccer new way of networking!

1. no more peers. only save to ActiveGameList command list and snapshots
  a. if host send command, it saves to server db, which then passes to all!
  b. add a state of WAIT_FOR_COMMAND_STATE inbetween all valid state transitions
  c. state transition: RESET_FIELD, PLAN_SHOT, RUN_SHOT, PLAN_SHOT (auto submit by end of 10s), RUN_SHOT (submit end positions of 10 mallets at end), HAS_GOAL, RESET_FIELD
  d. host checks gameRoom's commands to see if both sides have submitted command!
2. replay also uses this command list


detailed workflow for setup game:
1. initFunction: if network game, report entering room if network game
   -> server: set user1InRoom and user1InRoom to true
2. playgame.js component: componentDidUpdate -> call window.gameSetup.handleRoomUpdate(room)
3. handleRoomUpdate: 
   a. first time both players are in room: create network handler, start game
   b. other updates: give it to network handler
4. networkHandler:
   a. if local, no need to use mongo, so simply update state
   b. if network, send means saving into mongodb with latestIndex, and then handle update to take latest command and run them if both
      players have added command there


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

const KnobColors = [
  0xffff00, 0xe28746, 0x46e2e2, 0xe24dc7, 0x6a46e2
];
const processedCommands = {};
let lastProcessedCmdKey = "";
let lastProcessedIndex= -1;
const controlAdjustX = 235;

const AllPolyBodies = [];

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

/*3 modes of simulation:
1. SIM_PROB: part of a probability run with pre-specified skew so just needs to know if target is pocketd.
2. SIM_DRAW: need to draw forecast lines with no skew
3. SIM_ENDSTATE: similar to SIM_PROB, run with pre-specified skew, no need for drawing
*/
const SIM_PROB = 0;
const SIM_DRAW = 1;
const SIM_ENDSTATE = 2;

const RESET_FIELD_STATE = -1;
const PLAN_SHOT_STATE = 0;
const RUN_SHOT_STATE = 1;
const REPLAY_GOAL_SHOT_STATE = 2;
const GAME_OVER_STATE = 3;
const HAS_GOAL_STATE = 4;
const WAIT_FOR_COMMAND_STATE = 5;

// cmd for communicating with webworker
const CMD_READY = -1;
const CMD_GET_COMMAND = 0;

// commands for test scripts
const CMD_TEST_RUN = 6;
const CMD_SCRIPT_RESET_FIELD = 7;
const CMD_SCRIPT_PLACE_BALL_ON_FIELD = 8;
const CMD_SCRIPT_UPDATE_WORLD = 9;
const CMD_SCRIPT_WAIT_FOR_ALL_OBJECTS_STOP = 12;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;

const CMD_GET_SECONDS_LEFT = 20;
const CMD_SCRIPT_SET_SECONDS_LEFT = 21;
const CMD_SCRIPT_CALCULATE_END_STATE_2 = 22;
const CMD_GET_PROBABILITY_2 = 23;

const CMD_ERROR_IN_WORKER = 100;


const MODAL_EXITGAME = 0; // one button to exit game
const MODAL_EXITORREPLAY = 1;
const MODAL_NOBUTTON = 2; // read only

const autobuttoncolor = 0x1f71f4; //0x4286f4;
const autobuttoncolor2 = '#1f71f4';
const MAX_SPEED = 4000;
const SPIN_M = 2.2; // larger means more spin at strike
const stepsize = 1/60;
const MalletColors = {
  RED: 0,
  BLUE: 1
};



// const SoccerGame = {

//   /* Your game can check SoccerGame.orientated in internal loops to know if it should pause or not */
//   orientated: false,

//   PRACTICE: GAME_TYPE.PRACTICE,
//   MATCH: GAME_TYPE.MATCH,
//   TESTING: GAME_TYPE.TESTING,
//   TOURNAMENT: GAME_TYPE.TOURNAMENT
// };

// const workerCodeTemplat = fs.readFileSync('/js/soccerplayerworker.js');

const workerCodeTemplat = `




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

const SoccerGame = {
  RED: 0,
  BLUE: 1,
};

function getRandomNumber(min, max) {
  return (max-min) * Math.random() + min;
}

const GameInfo = {};
let MyID = -1;
let OpponentID = -1;
let MyGoalPosts = [];
let OpponentGoalPosts = [];
let MyPlayerPositions = [];
let OpponentPlayerPositions = [];
let MyGoalCenter = new Victor();
let OpponentGoalCenter = new Victor();
let SoccerPosition = new Victor();

let MyColorType = -1, OpponentColorType = -1;
let url = "";
let world = {};
let Players, Soccer, Goals, BallDiameter, FieldHeight, FieldWidth, PlayerInfo, Boundaries;

function getAimPosition(ballPos, pocketPos) {
  const bp = ballPos.clone ? ballPos.clone() : new Victor(ballPos.x, ballPos.y);
  const PlayerDiameter = world.playerD; 
  let pp = pocketPos.clone();

  const dirBallToPocket = pp.clone().subtract(bp); 

  const dirAimToBall = dirBallToPocket.normalize().scale(PlayerDiameter * 0.8);
  const aimPosition = bp.subtract(dirAimToBall);
  return aimPosition;
}

function extrapolatePoints(p1, p2, shift) {
  const p2c = p2.clone();
  const ballD = world.BallDiameter; 
  const p1c = p1.clone();

  const dir2to1 = p1c.clone().subtract(p2c); 

  //if (typeof(shift) == "undefined") shift = ballD * 2;
  const dir3to2 = dir2to1.normalize().scale(shift);
  const p3 = p2c.subtract(dir3to2);
  return p3;
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

// calculate angle between line (target ball, side pocket) and pocket center normal line
// result is between -90 and 90
function getAngleToSidePocket(ballPos, pocketID) {
  // if not a side pocket, return a large number for now
  if (pocketID != 1 && pocketID != 4) {
    return 360 * 100;
  }
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

function ReportEndOfTest(res) {
  sendCommand(CMD_SCRIPT_REPORT_END_OF_TEST, res);
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

async function WaitForAllBallStop() {
  let resolveID = Math.random().toFixed(10);
  while (resolveRequests[resolveID]) {
    resolveID = Math.random().toFixed(10);
  }
  sendCommand(CMD_SCRIPT_WAIT_FOR_ALL_OBJECTS_STOP, resolveID);
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
  sendCommand(CMD_SCRIPT_CHOOSE_COLOR, SoccerGame.RED);
};

const ChooseYellowColor = function () {
  sendCommand(CMD_SCRIPT_CHOOSE_COLOR, SoccerGame.YELLOW);
};

const ChooseBlackColor = function () {
  sendCommand(CMD_SCRIPT_CHOOSE_COLOR, SoccerGame.BLACK);
};

const copyValues = function(w) {
  SoccerPosition.x = w.SoccerPosition.x;
  SoccerPosition.y = w.SoccerPosition.y;

  
  for (let i=0; i<world.PLAYER_COUNT; i++) {
    MyPlayerPositions[i].x = w.PlayerPositions[i + MyID * world.PLAYER_COUNT].x;
    MyPlayerPositions[i].y = w.PlayerPositions[i + MyID * world.PLAYER_COUNT].y;
  }

  for (let i=0; i<world.PLAYER_COUNT; i++) {
    OpponentPlayerPositions[i].x = w.PlayerPositions[i + (1-MyID)*world.PLAYER_COUNT].x;
    OpponentPlayerPositions[i].y = w.PlayerPositions[i + (1-MyID)*world.PLAYER_COUNT].y;
  }


  return;
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
  Pockets = world.Pockets;
  Cushions = world.Cushions;
  BallDiameter = world.BallDiameter;
  FieldHeight = world.FieldHeight;
  FieldWidth = world.FieldWidth;
  CushionWidth = world.CushionWidth;
  PlayerInfo = world.PlayerInfo;
  Boundaries = {
    TOP_Y: -w.FieldHeight/2 + CushionWidth + BallDiameter / 2,
    BOTTOM_Y: w.FieldHeight/2 - (CushionWidth + BallDiameter / 2),
    LEFT_X: -w.FieldWidth/2 + CushionWidth + BallDiameter / 2,
    RIGHT_X: w.FieldWidth/2 - (CushionWidth + BallDiameter / 2), 
	};
};

const initWorld = function(w) {
  world = JSON.parse(JSON.stringify(w));
  MyGoalPosts = [];
  let gp = world.goalPosts[MyID];
  MyGoalPosts.push(new Victor(gp.p0.x, gp.p0.y));
  MyGoalPosts.push(new Victor(gp.p1.x, gp.p1.y));

  MyGoalCenter.x = (MyGoalPosts[0].x + MyGoalPosts[1].x)/2;
  MyGoalCenter.y = (MyGoalPosts[0].y + MyGoalPosts[1].y)/2;

  OpponentGoalPosts = [];
  gp = world.goalPosts[OpponentID];
  OpponentGoalPosts.push(new Victor(gp.p0.x, gp.p0.y));
  OpponentGoalPosts.push(new Victor(gp.p1.x, gp.p1.y));
  // for (let i=0; i<2; i++) {
  //   OpponentGoalPosts.push(new Victor(gp.x, gp.y));
  // }
  OpponentGoalCenter.x = (OpponentGoalPosts[0].x + OpponentGoalPosts[1].x)/2;
  OpponentGoalCenter.y = (OpponentGoalPosts[0].y + OpponentGoalPosts[1].y)/2;

  SoccerPosition.x = world.SoccerPosition.x;
  SoccerPosition.y = world.SoccerPosition.y;

  MyPlayerPositions = [];
  for (let i=0; i<world.PLAYER_COUNT; i++) {
    MyPlayerPositions.push(new Victor());
  }

  OpponentPlayerPositions = [];
  for (let i=0; i<world.PLAYER_COUNT; i++) {
    OpponentPlayerPositions.push(new Victor());
  }

  return;


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
  // console.log("worker: " + data.playerID + " initialize " );
  MyID = data.playerID;
  OpponentID = 1 - MyID;

  // this.world = data.world;
  initWorld(data.world);

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

let getNewCommand2 = function() {
  const cmd = [];

  for (let i = 0; i < world.MOVE_COUNT; i += 1) {
    // choose a random player and try to kick ball into goal
    const angle = Math.random() * Math.PI * 2;
    cmd.push({
      playerID: Math.floor(Math.random()*world.PLAYER_COUNT), 
      kickFrameIndex: 0, // Math.floor(600*Math.random()), 
      forceX: world.MAX_STRENGTH * Math.cos(angle), forceY: world.MAX_STRENGTH * Math.sin(angle)
    });
  }
  console.log("getNewCommand sending " + JSON.stringify(cmd));
  return cmd;

};


// functions available for test scripts:

const DoGetNewCommand = function(newcmd) {
  try {
    if (newcmd) {
      sendCommand(CMD_GET_COMMAND, newcmd);
      return;
    }
    let cmd = {};
    if (typeof(getNewCommand) !== "undefined")
      cmd = getNewCommand();
    else 
      cmd = getNewCommand2();
    sendCommand(CMD_GET_COMMAND, cmd);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when taking break shot so using default shot to shoot at table center', e.stack);
    sendCommand(CMD_GET_COMMAND, getNewCommand2());
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
  sendCommand(CMD_SCRIPT_RESET_FIELD, clearTable);
};

const PlaceBallOnTable = function(id, x, y) {
  sendCommand(CMD_SCRIPT_PLACE_BALL_ON_FIELD, id, x, y);
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
const CMD_GET_COMMAND = 0;
const CMD_TEST_RUN = 6;

// commands for test scripts
const CMD_SCRIPT_RESET_FIELD = 7;
const CMD_SCRIPT_PLACE_BALL_ON_FIELD = 8;
const CMD_SCRIPT_UPDATE_WORLD = 9;
const CMD_SCRIPT_WAIT_FOR_ALL_OBJECTS_STOP = 12;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;

const CMD_GET_SECONDS_LEFT = 20;
const CMD_SCRIPT_SET_SECONDS_LEFT = 21;
const CMD_SCRIPT_CALCULATE_END_STATE_2 = 22;
const CMD_GET_PROBABILITY_2 = 23;

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
        DoGetNewCommand();
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
      case CMD_TEST_RUN:
        GameInfo.update(data);
        testRun();
        break;
      case CMD_SCRIPT_WAIT_FOR_ALL_OBJECTS_STOP:
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
    case CMD_GET_COMMAND:
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
    case CMD_SCRIPT_RESET_FIELD:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'clearTable': param1
      });
      break;
    case CMD_SCRIPT_PLACE_BALL_ON_FIELD:
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
    case CMD_SCRIPT_WAIT_FOR_ALL_OBJECTS_STOP:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'resolveID': param1
      });
      break;
    case CMD_SCRIPT_REPORT_END_OF_TEST:
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
    if (p[k].indexOf("PlaceMalletOnTable") >= 0) {
      const q = p[k].replace("PlaceMalletOnTable", "").replace("Math.floor", "").replace("Math.random", "").split(/[\s,\*\+\(\);]+/);
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
  return cleanTestSetupCode;
};



// const BALL_GROUP = Math.pow(2,0), ENEMY =  Math.pow(2,1), GROUND = Math.pow(2,2)


const WorldForPlayer = {};


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

const getContactPosition = function (bfrom, bto, tpos, malletD) {
  const p = projectPoint(bfrom, bto, tpos);
  const tdist = dist2(p, tpos);
  if (tdist > malletD) return null;
  const dfrom = dist2(tpos, bfrom);
  const dto = dist2(tpos, bto);
  // if (dfrom < dto) return null;
  if (dfrom < malletD) return null; // already contact?
  const pshift = Math.sqrt(malletD * malletD - tdist * tdist);
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

// const NORM_PROB = {};
// NORM_PROB[128] = 0; // at x = 0 (no skew), cum prob is 0.5
// NORM_PROB[129] = 0.0097916731613;
// NORM_PROB[130] = 0.0195842852301;
// NORM_PROB[131] = 0.0293787757442;
// NORM_PROB[132] = 0.0391760855031;
// NORM_PROB[133] = 0.0489771572021;
// NORM_PROB[134] = 0.0587829360689;
// NORM_PROB[135] = 0.0685943705051;
// NORM_PROB[136] = 0.0784124127331;
// NORM_PROB[137] = 0.0882380194499;
// NORM_PROB[138] = 0.0980721524887;
// NORM_PROB[139] = 0.1079157794892;
// NORM_PROB[140] = 0.1177698745791;
// NORM_PROB[141] = 0.1276354190663;
// NORM_PROB[142] = 0.1375134021443;
// NORM_PROB[143] = 0.1474048216124;
// NORM_PROB[144] = 0.1573106846102;
// NORM_PROB[145] = 0.1672320083709;
// NORM_PROB[146] = 0.1771698209917;
// NORM_PROB[147] = 0.1871251622257;
// NORM_PROB[148] = 0.1970990842943;
// NORM_PROB[149] = 0.2070926527244;
// NORM_PROB[150] = 0.2171069472101;
// NORM_PROB[151] = 0.2271430625027;
// NORM_PROB[152] = 0.2372021093288;
// NORM_PROB[153] = 0.2472852153408;
// NORM_PROB[154] = 0.2573935261009;
// NORM_PROB[155] = 0.2675282061011;
// NORM_PROB[156] = 0.2776904398216;
// NORM_PROB[157] = 0.287881432831;
// NORM_PROB[158] = 0.2981024129305;
// NORM_PROB[159] = 0.3083546313448;
// NORM_PROB[160] = 0.3186393639644;
// NORM_PROB[161] = 0.3289579126405;
// NORM_PROB[162] = 0.3393116065388;
// NORM_PROB[163] = 0.3497018035539;
// NORM_PROB[164] = 0.3601298917896;
// NORM_PROB[165] = 0.3705972911096;
// NORM_PROB[166] = 0.3811054547636;
// NORM_PROB[167] = 0.3916558710926;
// NORM_PROB[168] = 0.4022500653217;
// NORM_PROB[169] = 0.4128896014437;
// NORM_PROB[170] = 0.4235760842012;
// NORM_PROB[171] = 0.4343111611752;
// NORM_PROB[172] = 0.4450965249855;
// NORM_PROB[173] = 0.4559339156131;
// NORM_PROB[174] = 0.4668251228526;
// NORM_PROB[175] = 0.4777719889039;
// NORM_PROB[176] = 0.4887764111147;
// NORM_PROB[177] = 0.4998403448837;
// NORM_PROB[178] = 0.5109658067382;
// NORM_PROB[179] = 0.522154877598;
// NORM_PROB[180] = 0.5334097062413;
// NORM_PROB[181] = 0.5447325129882;
// NORM_PROB[182] = 0.5561255936187;
// NORM_PROB[183] = 0.5675913235446;
// NORM_PROB[184] = 0.5791321622556;
// NORM_PROB[185] = 0.5907506580628;
// NORM_PROB[186] = 0.6024494531644;
// NORM_PROB[187] = 0.6142312890602;
// NORM_PROB[188] = 0.6260990123464;
// NORM_PROB[189] = 0.6380555809225;
// NORM_PROB[190] = 0.650104070648;
// NORM_PROB[191] = 0.6622476824884;
// NORM_PROB[192] = 0.6744897501961;
// NORM_PROB[193] = 0.6868337485747;
// NORM_PROB[194] = 0.6992833023832;
// NORM_PROB[195] = 0.7118421959394;
// NORM_PROB[196] = 0.7245143834924;
// NORM_PROB[197] = 0.7373040004387;
// NORM_PROB[198] = 0.7502153754679;
// NORM_PROB[199] = 0.7632530437326;
// NORM_PROB[200] = 0.7764217611479;
// NORM_PROB[201] = 0.7897265199433;
// NORM_PROB[202] = 0.8031725655979;
// NORM_PROB[203] = 0.8167654153151;
// NORM_PROB[204] = 0.8305108782054;
// NORM_PROB[205] = 0.8444150773753;
// NORM_PROB[206] = 0.8584844741418;
// NORM_PROB[207] = 0.872725894627;
// NORM_PROB[208] = 0.8871465590189;
// NORM_PROB[209] = 0.9017541138301;
// NORM_PROB[210] = 0.9165566675331;
// NORM_PROB[211] = 0.9315628300071;
// NORM_PROB[212] = 0.946781756301;
// NORM_PROB[213] = 0.9622231952954;
// NORM_PROB[214] = 0.9778975439405;
// NORM_PROB[215] = 0.9938159078609;
// NORM_PROB[216] = 1.0099901692496;
// NORM_PROB[217] = 1.0264330631379;
// NORM_PROB[218] = 1.0431582633185;
// NORM_PROB[219] = 1.0601804794354;
// NORM_PROB[220] = 1.0775155670403;
// NORM_PROB[221] = 1.0951806527614;
// NORM_PROB[222] = 1.1131942771609;
// NORM_PROB[223] = 1.1315765583862;
// NORM_PROB[224] = 1.150349380376;
// NORM_PROB[225] = 1.1695366102071;
// NORM_PROB[226] = 1.1891643501993;
// NORM_PROB[227] = 1.2092612317092;
// NORM_PROB[228] = 1.2298587592166;
// NORM_PROB[229] = 1.2509917154626;
// NORM_PROB[230] = 1.2726986411905;
// NORM_PROB[231] = 1.2950224067058;
// NORM_PROB[232] = 1.3180108973035;
// NORM_PROB[233] = 1.3417178410803;
// NORM_PROB[234] = 1.3662038163721;
// NORM_PROB[235] = 1.3915374879959;
// NORM_PROB[236] = 1.4177971379963;
// NORM_PROB[237] = 1.4450725798181;
// NORM_PROB[238] = 1.4734675779471;
// NORM_PROB[239] = 1.5031029431293;
// NORM_PROB[240] = 1.5341205443526;
// NORM_PROB[241] = 1.5666885860684;
// NORM_PROB[242] = 1.6010086648861;
// NORM_PROB[243] = 1.6373253827681;
// NORM_PROB[244] = 1.6759397227734;
// NORM_PROB[245] = 1.7172281175057;
// NORM_PROB[246] = 1.7616704103631;
// NORM_PROB[247] = 1.8098922384806;
// NORM_PROB[248] = 1.8627318674217;
// NORM_PROB[249] = 1.9213507742937;
// NORM_PROB[250] = 1.9874278859299;
// NORM_PROB[251] = 2.0635278983162;
// NORM_PROB[252] = 2.1538746940615;
// NORM_PROB[253] = 2.2662268092097;
// NORM_PROB[254] = 2.4175590162365;
// NORM_PROB[255] = 2.6600674686175;


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

// if mallet1 is moving from bfrom to bto, would it touch the mallet2 at tpos?
// if yes, return the position of mallet1 when it contacts mallet2;
// if no,  return null;

// var getContactPosition = function(bfrom, bto, tpos, malletD) {
//     var b2Dist = distToSegment(tpos, bfrom, bto);
//     if ( b2Dist > malletD) {
//         return null;
//     }
//     return getContactPositionSafe(bfrom, bto, tpos, malletD);
// };



// }





let pcanvas, pctx, pimgData;


const CBuffer = require('CBuffer');

const NUMPRECISION = 3;

const DODEBUG = false;

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
  // const peer = gameSetup.peer;
  const isHost = gameSetup.isHost;
  const that = this;
  // for now assume just one peer

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
    if (cmd.c != "UpdateTimer" && cmd.c != "KeepALive") {
      console.log("new send command to all " + JSON.stringify(cmd.c));
    }


    if (allLocal && gameSetup.gameType != GAME_TYPE.AUTORUN ) {
      // console.log("all local!!");
      this.executeCommandLocallyImmediately(cmd, 0);
      return;
    }

    // network game: 
    const cmdstr = `${cmd.c};${cmd.t};${cmd.w}`;
    if (cmd.c != "KeepALive") {
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


    // no need to specify lag since we'll play out using timestamp??
    cmd.allData = `${cmd.c};${cmd.t};${cmd.w}`;
    this.executeCommandLocallyImmediately(cmd, 0);
  };


  // only at non host
  // this.sendEchoToHost = function (timestamp) {
  //   // const p = gameSetup.allPeers[gameSetup.playerID];
  //   const p = gameSetup.peer;
  //   p.dosend(`ECHO;${timestamp};${gameSetup.playerID}`);
  // };



  this.sendAllObjectsStopped = function () {
    // const p = gameSetup.allPeers[gameSetup.playerID];
    const p = gameSetup.peer;
    // new: also send out all the mallet positions on table
    // if (gameSetup.gameType == GAME_TYPE.AUTORUN)
    //   this.saveAllMalletStoppedCommand();

    let posStr = gameSetup.getPosStr();
    // let posStr = "";
    // for (let k=1; k<gameSetup.mallets.length; k++) {
    //   const b = gameSetup.mallets[k];
    //   if (!b.inPocketID || b.inPocketID == null)
    //     posStr += `${b.ID}_${b.x}_${b.y}|`;
    // }

    // posStr += gameSetup.playerInfo[0].chosenColor ? gameSetup.playerInfo[0].chosenColor : -1;
    // posStr += "|";
    // posStr += gameSetup.playerInfo[1].chosenColor ? gameSetup.playerInfo[1].chosenColor : -1;
    // posStr += "|";


    const cmdstr = `ALL_OBJECTS_STOPPED;${Date.now()};${gameSetup.playerID};${posStr}`;
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
    const cmdkey = cmd.c + "_" + cmd.t + "_" + cmd.w;
    if (cmdkey.indexOf("UpdateTimer") < 0) 
      console.log("received cmd " + cmdkey);
    if (processedCommands[cmdkey]) return;

    processedCommands[cmdkey] = 1;

    cmd.executed = false;
    if (cmd.c == "ALL_OBJECTS_STOPPED") {
      if (gameSetup.isHost) {
        //const thepeer = gameSetup.allPeers[cmd.w];
        console.log("host received ALL_OBJECTS_STOPPED");
        const thepeer = gameSetup.peer;
        thepeer.allObjectStopped = true;
        gameSetup.controller.checkIfAllPeerAllStopped();
      }

    } else if (cmd.c == "NewInitPlayerInfo") {
      // if (!gameSetup.sounds.backgroundmusic.isPlaying()) {
      //   gameSetup.sounds.backgroundmusic.play();
      // }
      // console.log("received NewInitPlayerInfo " + cmd.w + " " + cmd.t);
      setTimeout(() => {
        // console.log("execute NewInitPlayerInfo " + cmd.w + " " + cmd.t);
        if (gameSetup && gameSetup.controller)
          gameSetup.controller.setinitPlayerInfo(cmd.w);
      }, 600);
    } else if (cmd.c == "START_GAME") {
      
      gameSetup.controller.setState(RESET_FIELD_STATE);
      gameSetup.gameStarted = true;
    } else if (cmd.c == "SUBMIT_COMMAND") {
      const p = cmd.w.split("_");
      const pi = gameSetup.playerInfo[Number(p[0])];
      pi.isPlanning = false;
      pi.nextCommands = [];
      for (let i=1; i<p.length; i+= 4) {
        pi.nextCommands.push({
          playerID: Number(p[i]),  kickFrameIndex: Number(p[i+1]), forceX: Number(p[i+2]), forceY: Number(p[i+3])
        });
      }
      gameSetup.controller.checkForAllCommands();

    } else if (cmd.c == "RUN_SHOT") {
      const p = cmd.w.split("|");
      for (let j=0; j < p.length; j++) {
        const q = p[j].split("_");
        const pi = gameSetup.playerInfo[Number(q[0])];
        pi.nextCommands = [];
        for (let i=1; i<q.length; i+= 4) {
          pi.nextCommands.push({
            playerID: Number(q[i]),  kickFrameIndex: Number(q[i+1]), forceX: Number(q[i+2]), forceY: Number(q[i+3])
          });
        }
      }

      gameSetup.controller.setState(RUN_SHOT_STATE);

    } else if (cmd.c == "PLAN_SHOT") {
      if (!gameSetup.isHost) {
        // check if position in sync
        let posstr = "";
        for (let i=0; i<gameSetup.mallets.length; i++) {
          const m = gameSetup.mallets[i];
          posstr += m.position.x + "_" + m.position.y + "_";
        }
        if (cmd.w != posstr) {
          console.log("mismatch!");
          console.log("host: " + cmd.w);
          console.log("guest: " + posstr);
        }
      }
      gameSetup.controller.setState(PLAN_SHOT_STATE);

    } else if (cmd.c == "RESET_FIELD") {
      gameSetup.controller.setState(RESET_FIELD_STATE);

    } else if (cmd.c == "HAS_GOAL") {
      gameSetup.inGoal = Number(cmd.w);
      gameSetup.controller.setState(HAS_GOAL_STATE);

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
      console.log("ExitGameRoom received from " + cmd.w);
      gameSetup.sounds.backgroundmusic.stop();
      gameSetup.showModalMessage(`Exiting Game Room`, `Player ${cmd.w} ${gameSetup.playerInfo[cmd.w].playerID} has chosen to exit the game room.`, MODAL_NOBUTTON);

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
      gameSetup.initPlayerInfo = null;
      gameSetup.waitingplayerInfo = null;
      gameSetup.controller.inStrike = false;
      gameSetup.hideModalMessage();
      gameSetup.allStopHandled = false;
      gameSetup.hostAllStopped = false;
      gameSetup.controller.gameState = WAIT_FOR_BREAK_STATE;
      GameEngine.clearForecastLines();
      // gameSetup.controller.ResetTable(false);

      gameSetup.firstMalletTouchedByCuemallet = null;
      gameSetup.firstCushionTouchedByMallet = null;
      gameSetup.someMalletTouchedRailedAfter = false;
      gameSetup.malletsTouchedRails = [];
      gameSetup.newlyPocketedMallets = [];
      gameSetup.firstMalletMark.position.x = 10000;
      gameSetup.firstMalletMark.position.y = 10000;
      gameSetup.targetMalletMark.position.x = 10000;
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

      // gameSetup.playerInfo[0].c.showNameTag(MalletColors.WHITE);
      // gameSetup.playerInfo[1].c.showNameTag(MalletColors.WHITE);
      // gameSetup.playerInfo[0].chosenColor = null;
      // gameSetup.playerInfo[1].chosenColor = null;


    } else if (cmd.c == "UpdateTimer") {
      const p = cmd.w.split("_");
      gameSetup.playerInfo[p[0]].c.updateTimer(Number(p[1]));
      // gameSetup.playerInfo[p[2]].c.updateTimer(Number(p[3]));
    } else if (cmd.c == "ShowMessage") {
      gameSetup.config.showMessage(cmd.w);
    } else if (cmd.c == "StrikeCueMallet") {
      gameSetup.resetMalletStopped();
      // debugger; // aaaaaa
      const p = cmd.w.split("_");
      const force = new Victor(Number(p[1]), Number(p[2]));
      const av = new Victor(Number(p[3]), Number(p[4]));
      gameSetup.controller.actuallyDoStrikeCuemallet(force, av, Number(p[5]), Number(p[6]), Number(p[7]), Number(p[8]), Number(p[9]), Number(p[10]), Number(p[11]) );
    } else if (cmd.c == "COUNTDOWN") {
      GameEngine.showCountDown(cmd.w);
    } else if (cmd.c == "GAMEOVER") {
      GameEngine.showGameOver(cmd.w);
    } else if (cmd.c == "KeepALive") {

    } else {
      console.log("executeCommandLocallyImmediately executeCommand " + JSON.stringify(cmd));
      debugger;
      // gameSetup.allObjects[cmd.w].controller.executeCommand(cmd);
    }
  };

  // let echoCount = 0;
  // dispatch data to the approprirate controller!
  this.handleWTCData = function (data) {
    // if (data.indexOf("KeepALive") < 0 && data.indexOf("UpdateTimer") < 0)
    //   console.log(" handle new wtc data " + data);
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
        for (let j=0; j <=gameSetup.cmdHistory.length-1; j++) {
          console.log("* * **       * resending past command " + j + " " + gameSetup.cmdHistory[j]);
          gameSetup.peer.send(gameSetup.cmdHistory[j]);
        }
      } else {
        const allTimeStamps = cmd.w.split("|");

        // find all timestamp missing in allTimeStamps and resend it
        for (let k=gameSetup.cmdHistory.length-1; k >= 0; k--) {
          const p2 = gameSetup.cmdHistory[k].split(';');
          if (gameSetup.cmdHistory[k].indexOf("UpdateTimer") >= 0) {
            continue;
          }
          if (gameSetup.cmdHistory[k].indexOf("KeepALive") >= 0) {
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
            gameSetup.peer.send(gameSetup.cmdHistory[k]);
            console.log("* * **       * resending past command " + k + " " + gameSetup.cmdHistory[k]);
          }
        }
      }
      return;
    }

    if (!isHost) {
      this.executeCommandLocallyImmediately(cmd, 0); // if not host, add command to queue with no lag for run at next cycle
    } else {
      if (cmd.c == "PEERREADY") {
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







const SoccerGame = function (gameSetup) {
  // create the root of the scene graph
  const SoccerGameObj = this;
  const that = this;

  let tablerenderer, malletrenderer, overlayrenderer, overlayrenderer2,  controlrenderer, pixicontrolrendererexit, pixirenderertestresult;
  const unitScale = 1;
  let world = null, world2 = null;
  let mallets = {}, malletbodies = {}, malletbodies2 = {};

  gameSetup.malletbodies = malletbodies;
  gameSetup.malletbodies2 = malletbodies2;

  gameSetup.clearWorld = () => {

    if (world) {
      world.clear();
      world2.clear();
    }
    // gameSetup.malletbodies = {};
    malletbodies = {};
    // gameSetup.malletbodies2 = {};
    malletbodies2 = {};
  };

  gameSetup.initWorld = () => {
    
    world = new p2.World({ gravity: [0, 0] });
    world2 = new p2.World({ gravity: [0, 0] });

    world.defaultContactMaterial.friction = 0;
    world.defaultContactMaterial.restitution = 1;
    world.defaultContactMaterial.stiffness = Number.MAX_VALUE;
    world2.defaultContactMaterial.friction = 0;
    world2.defaultContactMaterial.restitution = 1;
    world2.defaultContactMaterial.stiffness = Number.MAX_VALUE;

    gameSetup.world = world;
    gameSetup.world2 = world2;

    gameSetup.allObjects = {}; // used to store physics body of mallet at all players
    gameSetup.allMesh = {}; // used to store mesh of mallet
    gameSetup.allObjects2 = {}; // used to store physics body of copy of mallet for local forecast lines at all players

    gameSetup.malletbodies = malletbodies;
    gameSetup.malletbodies2 = malletbodies2;
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

  this.setupConfig = () => { // SoccerGame
    window.isWaitingForAllStop = false;

    const cfg = {
      TrueWidth: 2600, TrueHeight: 1265, MALLET_COUNT: 5, MOVE_COUNT: 3, goalSize: 200, goalThickNess: 150,
      xbase: 2185, ybase: 243 + 78, ymax: 263 + 1692/2 - 68, timeIndexLimit: 600, // 10 seconds
      kickStrengthScaler: -8
    };
    gameSetup.config = cfg;
    cfg.tableW = 1692;
    cfg.tableH = cfg.tableW * 0.5;
    const whratio = cfg.TrueWidth / cfg.TrueHeight; // width vs height
    const oldnewratio = cfg.TrueWidth / 1600; // new vs old true width



    cfg.forwardLookingRatio = 1.4; // forward look 1.2 cycle for predicting mallet next position

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
      cfg.malletD = 2.05 * r; // new table
    } else {
      // use same measurement for both beginner and advanced!!
      // only difference is number of mallets and time control!
      cfg.cornerPocketD = 6.4 * r; // 6.2 * r; // new table
      cfg.sidePocketD = 4.2 * r; // 5.2 * r; // new table
      //cfg.metalBorderThick = 2.1 * r;// 2.5 * r; // new table
      // cfg.metalBorderThick = 33.3964 * whratio;
      cfg.metalBorderThick = 33.3964 * oldnewratio * 1.1;
      // cfg.metalBorderThick = 40 * oldnewratio * 1.1;
      cfg.roundedRadius = 0.1 * r;
      cfg.cushionBarShift = 1.6 * r;
      cfg.cushionBarThick = 2.4 * r; // 2 * r; // new table
      // cfg.malletD = 1.7 * r; //2.05 * r; // new table
      cfg.malletD = 3.3 * r; // new table
      cfg.soccerD = cfg.malletD * 0.7; 
    }
    cfg.forecastGWidth = 2; //cfg.malletD * 0.04;
    cfg.tableCenterX = cfg.tableW / 2 + cfg.metalBorderThick + 104;
    cfg.tableCenterY = cfg.TrueHeight - cfg.tableH/2 -  cfg.metalBorderThick - 95;

    cfg.pocketShiftSide = cfg.cushionBarThick / 2; // 1 * r; // new table
    cfg.scalingratio = r;
    cfg.pocketShift = 0 - r * 0.2;
    cfg.quitArrowWidth = 8 * r;
    cfg.quitArrowHeight = 6 * r;
    cfg.quitArrowCenterX = cfg.tableCenterX - cfg.tableW / 2 + cfg.quitArrowWidth / 2 - cfg.strengthBarThick;
    cfg.quitArrowCenterY = 4 * r;

    // cfg.setupMalletButtonRadius = 40 * r;
    // cfg.setupMalletButtonCenterX = cfg.tableCenterX + cfg.tableW/2 + cfg.strengthBarThick - cfg.setupMalletButtonRadius - 30 * r;
    // cfg.setupMalletButtonCenterY = 60 * r;

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
      cx: cfg.tableCenterX - cfg.tableW * 0.224 - 22.4,
      //cy: cfg.quitButtonCfg.y + cfg.quitButtonCfg.h / 2, // cfg.tableCenterY - cfg.tableH * 0.65,
      cy: (cfg.TrueHeight - cfg.tableH - 2 * cfg.metalBorderThick) / 2,
      borderwidth: 0.4 * r,
      w: (cfg.tableW+200) * 0.345558,
      h: cfg.quitButtonCfg.h,
      clockXShift: cfg.tableW * 0.14 + 60,
      scoreShift: cfg.tableW * 0.01 - 23,
      isHuman: gameSetup.playerInfo1.playerType === 'Human',
      userName: gameSetup.playerInfo1.playerID,
      rating: gameSetup.playerInfo1.playerRating
    };

    cfg.playerPanel2 = {
      cx: cfg.tableCenterX + cfg.tableW * 0.224 + 100, // cfg.playerPanel1.w + cfg.tableW * 0.11,
      cy: cfg.playerPanel1.cy, // cfg.tableCenterY - cfg.tableH * 0.65,
      borderwidth: cfg.playerPanel1.borderwidth,
      w: cfg.playerPanel1.w,
      h: cfg.quitButtonCfg.h,
      clockXShift: cfg.tableW * 0.14 + 75,
      scoreShift: 0 - cfg.tableW * 0.003 - 20,
      isHuman: gameSetup.playerInfo2.playerType === 'Human',
      userName: gameSetup.playerInfo2.playerID,
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

  this.createController = () => { // SoccerGame
    const config = gameSetup.config;
    const GameEngine = this;

    let isTesting = false;
    let isMatch = false;
    let isPractice = false;
    let isTournament = false;

    // bigger means less random!
    gameSetup.Randomness = 3000000; //3000000;//1500000;


    if (gameSetup.gameType === SoccerGame.MATCH) {
      isMatch = true;
    } else if (gameSetup.gameType === SoccerGame.PRACTICE) {
      isPractice = true;
    } else if (gameSetup.gameType === SoccerGame.TESTING) {
      isTesting = true;
    } else if (gameSetup.gameType === SoccerGame.TOURNAMENT) {
      isTournament = true;
    }


    const GameController = function () {
      const me = this;
      // let robotStarted = false;
      let cuemalletInHand = false;
      // let inModal = false;
      gameSetup.initPlayerInfo = null;
      gameSetup.waitingPlayerInfo = null;

      this.inStrike = false;
      gameSetup.enteringSimulation = false;
      this.gameState = PLAN_SHOT_STATE;
      this.setState = (s, p) => { // GameController
        // return; // aaaa
        // gameSetup.config.hideMessage();

        // console.log(`now setState ${s}`);
        // const activeID = gameSetup.initPlayerInfo.ID;
        // const otherID = 1 - activeID;

        this.gameState = Number(s);
        this.enterState(p);
      };

      this.resetField = () => {
        const initPositions = [];
        initPositions.push({x: config.tableW * 0.5, y: config.tableH * 0.05});
        initPositions.push({x: config.tableW * 0.5, y: 0 - config.tableH * 0.05});
        initPositions.push({x: config.tableW * 0.3, y: 0});
        initPositions.push({x: config.tableW * 0.2, y: config.tableH * 0.1});
        initPositions.push({x: config.tableW * 0.2, y: 0 - config.tableH * 0.1});

        for (let i=0; i<gameSetup.mallets.length; i++) {
          const m = gameSetup.mallets[i];
          const xdir = m.userID == 0 ? -1 : 1;

          // m.body.position[0] = gameSetup.config.tableCenterX + xdir * initPositions[i % gameSetup.config.MALLET_COUNT].x;
          // m.body.position[1] = gameSetup.config.tableCenterY + initPositions[i % gameSetup.config.MALLET_COUNT].y;

          resetMallet(m, gameSetup.config.tableCenterX + xdir * initPositions[i % gameSetup.config.MALLET_COUNT].x, gameSetup.config.tableCenterY + initPositions[i % gameSetup.config.MALLET_COUNT].y);
        }

        gameSetup.soccer.body.position[0] = gameSetup.config.tableCenterX;
        gameSetup.soccer.body.position[1] = gameSetup.config.tableCenterY;

        gameSetup.soccer.body.velocity[0] = 0; gameSetup.soccer.body.velocity[1] = 0;
        gameSetup.soccer.body.vlambda[0] = 0; gameSetup.soccer.body.vlambda[1] = 0;
        gameSetup.soccer.body.wlambda = 0;
        gameSetup.soccer.body.angularVelocity = 0;


        this.resetMalletForces();  
      };

      this.resetMalletForces = () => {
        gameSetup.forecastParameters = [];
        for (let j=0; j<gameSetup.config.MOVE_COUNT; j++) {
          const m = gameSetup.timerMallets[j];
          m.label.setText("?");
          // const f = gameSetup.forecastParameters[j];
          // f.x = 0;
          // f.y = 0;
          // f.startIndex = -1;
          // m.startIndex = -1;
          const k = m.kickKnob;
          k.visible = false;
          k.kickLineG.clear();
          // k.position.x = m.position.x - gameSetup.config.malletD * 0.8;
          // k.position.y = m.position.y;
          m.timerKnob.position.y = gameSetup.config.ybase;
          m.timerKnob.visible = false;

          const t = m.kickTarget;
          t.visible = false;
          m.chosenMalletID = -1;

          // if ( j <= 4) {
          //   gameSetup.timerMallets[j].position.y = gameSetup.config.ybase;
          // }
        }

        //this.clearForecastLines();
      };

      this.hideMalletForces = () => {
        for (let j=0; j<gameSetup.config.MOVE_COUNT; j++) {
          const m = gameSetup.timerMallets[j];
          const k = m.kickKnob;
          k.visible = false;
          k.kickLineG.clear();
          m.kickTarget.visible = false;
        }
      };



      this.setinitPlayerInfo = (info) => { // GameController
        return;
        const p = info.split("_");
        gameSetup.initPlayerInfo = gameSetup.playerInfo[p[0]];
        gameSetup.waitingPlayerInfo = gameSetup.playerInfo[1 - Number(p[0])];
        gameSetup.initPlayerInfo.c.showPlayerAsActive(true);
        gameSetup.waitingPlayerInfo.c.showPlayerAsActive(false);
        gameSetup.initPlayerInfo.c.inTimeCountDown = true;
        gameSetup.waitingPlayerInfo.c.inTimeCountDown = false;

        gameSetup.enteringSimulation = true;

        if (Number(p[1]) == CALL_SHOT_STATE && Number(p[2]) >= 0) {
          const chosenColor = Number(p[2]);
          // also set chosen color!
          // console.log("chosen color!! " + gameSetup.initPlayerInfo.playerUserId + " " + chosenColor);
          gameSetup.initPlayerInfo.chosenColor = chosenColor;
          // getPlayerActionMessage(false, `GreatShotChosen${gameSetup.initPlayerInfo.chosenColor}`);
          let otherColor = MalletColors.RED;
          if (chosenColor === MalletColors.RED) { otherColor = MalletColors.YELLOW; }
          gameSetup.waitingPlayerInfo.chosenColor = otherColor;

          // gameSetup.initPlayerInfo.c.showNameTag(gameSetup.initPlayerInfo.chosenColor);
          // gameSetup.waitingPlayerInfo.c.showNameTag(gameSetup.waitingPlayerInfo.chosenColor);


          // if (gameSetup.initPlayerInfo === gameSetup.playerInfo1) {
          //   gameSetup.playerInfo2.chosenColor = otherColor;
          // } else {
          //   gameSetup.playerInfo1.chosenColor = otherColor;
          // }
        }

        // if (Number(p[3]) > -1000) {
        //   // place cue mallet! decoupled!!
        //   this.actuallyDoPlaceCuemallet(Number(p[3]), Number(p[4]));
        // }

        gameSetup.controller.setState(p[1], p);
        // Check change item
        if (gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.TOURNAMENT) {
          if (gameSetup.initPlayerInfo.playerUserId === Meteor.userId()) {
            gameSetup.cuestick = gameSetup.yourcuestick;
            gameSetup.cuestickcontainer = gameSetup.cuestickyourcontainer;
            gameSetup.cuestickOpponent.visible = false;
          } else {
            gameSetup.cuestick = gameSetup.cuestickOpponent;
            gameSetup.cuestickcontainer = gameSetup.cuestickOpponentcontainer;
            gameSetup.yourcuestick.visible = false;
          }
        }
      };

      this.resetTableAndStart = () => { // GameController
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
        // set initPlayerInfo so we don't do this again
        const parts = newPlayerCmd.split(";");
        const p = parts[4].split("_");
        gameSetup.initPlayerInfo = gameSetup.playerInfo[p[0]];
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

      

      const resetMallet = function (b, x, y) { // GameController
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
        b.body.touchedMallet = false;
        b.body.touchedRail = false;

        b.body.av.x = 0; b.body.av.y = 0;
        b.body.setZeroForce();
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
        b.body2.isStopped = false;

        b.position.x = b.body.position[0];
        b.position.y = b.body.position[1];

        // console.log("moving mallet " + b.ID + " " + b.body2.position[0]);
        // if (gameSetup.gameType != GAME_TYPE.REPLAY)
        //   b.gotoAndStop(10);

        // b.x = x;
        // b.y = y;
      };

      this.tryPlaceCueMallet = (testtarget) => { // GameController
        if (!this.checkIfCollidingMallet(testtarget)) {
          const cb = gameSetup.malletsByID[0];
          if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE) {
            if (testtarget.x >= config.tableCenterX - config.tableW/4 ) return;
          }
          resetMallet(cb, testtarget.x, testtarget.y);
        }
      };


      

      const ResetTable = (clearTable, IgnoreCueMallet = false) => { // GameController
        

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
        gameSetup.reAddMalletBodies(clearTable, IgnoreCueMallet);


        if (!gameSetup.cuemalletDirection) {
          gameSetup.cuemalletDirection = new Victor(1, 0);
          // gameSetup.cuemalletDirection.x = 1;
          // gameSetup.cuemalletDirection.y = 0;
  
        }
        gameSetup.AIStrength = 30;
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

      // const ResetTableOld = (clearTable, IgnoreCueMallet = false) => {
        

      //   this.inStrike = false;
      //   // gameSetup.testStarted = false;
      //   const allIDs = Object.keys(malletbodies);
      //   for (let j=0; j<allIDs.length; j++) {
      //     const i = allIDs[j];
      //     const b = malletbodies[i];
      //     if (IgnoreCueMallet && i == 0) continue;
      //     if (clearTable) {
      //       resetMallet(b.mallet, b.mallet.origX * 1000, b.mallet.origY * 1000);
      //       b.inPocketID = 0;
      //     } else {
      //       // debugger;
      //       resetMallet(b.mallet, b.mallet.origX, b.mallet.origY);
      //       b.inPocketID = null;
      //     }
      //   }

      //   gameSetup.cuemalletDirection.x = 1;
      //   gameSetup.cuemalletDirection.y = 0;
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

      this.checkIfCollidingMallet = (pos) => { // GameController
        let collide = false;
        if (!gameSetup.innerRectangle.contains(pos.x, pos.y)) {
          return true;
        }
        gameSetup.mallets.forEach((b) => {
          if (b.body.inPocketID !== null || b.ID === 0) { return; }
          const pos1 = new Victor(b.x, b.y);
          const d = pos.distance(pos1);
          if (d <= config.malletD * 0.99999) {
            collide = true;
          }
        });
        return collide;
      };


      
      this.enableGUIInputs = () => { // GameController
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

        // console.log("enableGUIInputs " + this.gameState);
        if (!gameSetup.controlButtons) return;
        gameSetup.controlButtons.forEach((btn) => {
          btn.interactive = true;
          btn.tint = 0xffffff;
        });
        // gameSetup.strikeButton.tint = 0xffffff;
      };
      this.disableGUIInputs = () => { // GameController
        // return; // aaaa
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;
        // console.log("disableGUIInputs " + this.gameState);
        const grey = 0x606060;
        if (!gameSetup.controlButtons) return;
        gameSetup.controlButtons.forEach((btn) => {
          btn.interactive = false;
          btn.tint = grey;
        });
        // if (this.gameState == GAME_OVER_STATE || (gameSetup.initPlayerInfo && !gameSetup.initPlayerInfo.isLocal)) {
        //   // gameSetup.hitButton.tint = 0x606060;
        //   //gameSetup.
        //   // console.log("game over or not local so return disabled");
        //   return;
        // }

        // if (this.gameState != CUEBALL_IN_HAND && this.gameState != BREAK_CUEBALL_IN_HAND_STATE) {
        //   // gameSetup.hitButton.tint = 0x606060;
        // } else {
        //   if (gameSetup.gameType != GAME_TYPE.TESTING) {
        //     // gameSetup.toggleHitButton(false);
        //     // gameSetup.strikeButton.tint = 0xffffff;
        //     // gameSetup.stage.interactive = true;
        //     // gameSetup.strikeButton.interactive = true;
        //   }
        // }
      };

      this.updatePlayerPanel = function (PlayerInfo) { // GameController
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;
        // var gb = PlayerInfo.bg;
        const c = PlayerInfo.c;
        let bcolor = MalletColors.WHITE;
        if (PlayerInfo.chosenColor != null) {
          bcolor = PlayerInfo.chosenColor;

          // check if no mallet of that color left!
          let hasSomeLeft = false;
          const ids = Object.keys(gameSetup.malletsByID);
          for (let k=0; k<ids.length; k++) {
            const b = gameSetup.malletsByID[ids[k]];
            if (b.body.inPocketID == null || typeof(b.body.inPocketID) == "undefined") {
              if (b.colorType == bcolor) {
                hasSomeLeft = true;
                break;
              }
            }
          }

          if (!hasSomeLeft) {
            bcolor = MalletColors.BLACK;
          }

        } else {
          bcolor = MalletColors.WHITE;
        }

        const isActive = PlayerInfo == gameSetup.initPlayerInfo;

        // console.log("showNameTag " + bcolor);
        // PlayerInfo.c.showNameTag(bcolor, isActive);
        // PlayerInfo.chosenColor = null;
      };




      

      const inActionModal = false;
      const getPlayerActionMessage = function (isNext, typestr, thePlayerID) { // GameController
        // if ( gameSetup.isInStrike() )
        //     return;
        let playerID = 1;
        if (gameSetup.initPlayerInfo === gameSetup.playerInfo2) { playerID = 2; }
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

      gameSetup.calculateRotation = (strength, spinMultiplier, hspin, givenSkew) => { // GameController
        let rr = rnd2(); // 0.0
        // strength = strength;
        // console.log(`strike using rr of ${rr} at time ${Date.now()}`);
        if (typeof(givenSkew) != "undefined")
          rr = givenSkew;
        const rot = (rr) * (Math.PI / gameSetup.Randomness) * (strength * (1 + Math.abs(spinMultiplier / 2.5)  + Math.abs(hspin / (30*2.5))));
        return rot;
      };

      this.strikeWith = (strength, dir, spinMultiplier, hspin) => { // GameController
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
        // this.clearForecastLines(true);
        // console.log("after clearForecastLines");
      };

      gameSetup.showAllMalletPosition = () => { // GameController
        return;
        const allIDs = Object.keys(malletbodies);
        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          const b = malletbodies[i];
          if (b.inPocketID != null) continue;
          console.log(`mallet ${b.ID}: ${b.position[0]} ${b.position[1]} `);
        }
        console.log("\n\n\n\n\n");
      };

      this.strikeWithExact = (force, av, hspin) => { // GameController
        // const rr = rnd2(); // 0.0
        // // strength = strength;
        gameSetup.resetMalletStopped();
        // console.log(`exact strike using of force ${force.x} ${force.y} av ${av}`);
        // gameSetup.showAllMalletPosition();

        gameSetup.counter = 0;
        // const av = force.clone().multiplyScalar(spinMultiplier);

        gameSetup.strikeCallback(force, av, hspin);

        // console.log("before clearForecastLines");
        // this.clearForecastLines(true);
        // console.log("after clearForecastLines");
      };

      this.convertCommandToTestScript = function(cmd) { // GameController
        const config = gameSetup.config;
        let s = "ResetTable(true);\n";

        const poslist = cmd.malletPos.split("|");
        for (let k=0; k<poslist.length; k++) {
          if (poslist[k].length < 2) continue;
          const pos = poslist[k].split("_");
          // const b = gameSetup.malletsByID[pos[0]];
          
          if (pos[1] == "NaN" || pos[1] == "100000") {
          } else {
            //resetMallet(b, Number(pos[1]), Number(pos[2]));
            s += "PlaceMalletOnTable(" + pos[0] + ", " + (parseFloat(pos[1])- config.tableCenterX).toFixed(3) + ", " + (parseFloat(pos[2])- config.tableCenterY).toFixed(3) + ");\n";
          }
        }

        s += "\n";

        if (cmd.chosenColor == 'R') s += 'ChooseRedColor();\n';
        if (cmd.chosenColor == 'Y') s += 'ChooseYellowColor();\n';
        

        s += `TakeCallShot();
await WaitForAllMalletStop();
ReportEndOfTest();
        `;

        return s;
      }

      this.resetToCommand = function(cmd) { // GameController
        if (cmd.playerAction == "Call" || cmd.playerAction == "Won" ) {
          // reset mallet positions 
          // 0_481.4021911621094_1063.8577880859375|2_2105.639892578125_287.0849609375|3_1789.742431640625_344.1299743652344|4_1485.9801025390625_1088.583251953125|1_1071.121826171875_917.1253662109375|
          const poslist = cmd.malletPos.split("|");
          for (let k=0; k<poslist.length; k++) {
            if (poslist[k].length < 2) continue;
            const pos = poslist[k].split("_");
            const b = gameSetup.malletsByID[pos[0]];
            
            if (pos[1] == "NaN" || pos[1] == "100000") {
              resetMallet(b, 100000, 100000);
              b.body.inPocketID = 0;
            } else {
              resetMallet(b, Number(pos[1]), Number(pos[2]));
            }
          }
        } else if (cmd.playerAction == 'Break') {
          ResetTable(false);

          // const allIDs = Object.keys(malletbodies);
          // for (let j=0; j<allIDs.length; j++) {
          //   const i = allIDs[j];
          //   const b = malletbodies[i];
          //   for (let k=b.shapes.length-1; k>=0; --k) {
          //     b.removeShape(b.shapes[i]);
          //   }
          //   const b2 = malletbodies2[i];
          //   for (let k=b2.shapes.length-1; k>=0; --k) {
          //     b2.removeShape(b2.shapes[i]);
          //   }
          //   b.mallet = null;
          //   malletbodies[i] = null;
          //   b2.mallet = null;
          //   malletbodies2[i] = null;
          // }
          // // malletbodies.length = 0;
          // // malletbodies2.length = 0;

          // gameSetup.addMallets();

        }
      };

      this.doStrikeCmd = function(cmd) { // GameController
        if (!cmd.strikeCmd) {
          debugger;
        }
        const p = cmd.strikeCmd.split("_");
        const force = new Victor(Number(p[1]), Number(p[2]));
        const av = new Victor(Number(p[3]), Number(p[4]));
        this.actuallyDoStrikeCuemallet(force, av, Number(p[5]), Number(p[6]), Number(p[7]), Number(p[8]), Number(p[9]), Number(p[10]), Number(p[11]));
      };

      this.replayCommand = function(cmd) { // GameController

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
          // should wait 1 sec to show the movement of cue mallet
          gameSetup.strikeTimer = setTimeout(() => {
            me.doStrikeCmd(cmd);
            gameSetup.inWaitingPlacement = false;
          }, 1000);
        }
  
        // this.actuallyDoStrikeCuemallet(force, av, strength, hspin, tb, tp, spin);
          // if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
          //   const cmdstr = `StrikeCueMallet;${gameSetup.currentCycleTime};${gameSetup.initPlayerInfo.ID}_${Math.fround(force.x)}_${Math.fround(force.y)}_${Math.fround(av.x)}_${Math.fround(av.y)}_${Math.fround(strength)}_${Math.fround(hspin)}_${tb}_${tp}`;
          //   this.saveCommand(cmdstr);
          // }
      };

      this.planToStrikeCuemallet = function (force, av, strength, hspin, tb, tp, spin) { // GameController
        // console.log("planToStrikeCuemallet target mallet " + tb + " target pocket " + tp);

        if (gameSetup.isLocal) {
          this.actuallyDoStrikeCuemallet(force, av, strength, hspin, tb, tp, spin);
          if (gameSetup.gameType == GAME_TYPE.AUTORUN) {
            
            let prob = -1;
            if (gameSetup.probText.text != "[ - ]")
              prob = Number(gameSetup.probText.text.substring(2, gameSetup.probText.text.length - 3));
            const cb = gameSetup.malletsByID[0];
            const cmdstr = `StrikeCueMallet;${gameSetup.currentCycleTime};${gameSetup.initPlayerInfo.ID}_${Math.fround(force.x)}_${Math.fround(force.y)}_${Math.fround(av.x)}_${Math.fround(av.y)}_${Math.fround(strength)}_${Math.fround(hspin)}_${tb}_${tp}_${spin}_${cb.body.position[0]}_${cb.body.position[1]}_${prob}`;
            
            this.saveCommand(cmdstr);
          }
        } else {
          //this.setNewPlayerState(gameSetup.initPlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
          // also need to send new cue mallet position!
          const cb = gameSetup.malletsByID[0];
          gameSetup.networkHandler.sendCommandToAll({
            c: "StrikeCueMallet", t: gameSetup.currentCycleTime, w: `${gameSetup.initPlayerInfo.ID}_${Math.fround(force.x)}_${Math.fround(force.y)}_${Math.fround(av.x)}_${Math.fround(av.y)}_${Math.fround(strength)}_${Math.fround(hspin)}_${tb}_${tp}_${spin}_${cb.body.position[0]}_${cb.body.position[1]}`
          });
        }
      };

      this.onSubmitButtonClick = () => { // GameController
        gameSetup.controller.disableGUIInputs();
        if (gameSetup.isLocal) { // one player is manual
          for (let j=0; j<2; j++) {
            const pi = gameSetup.playerInfo[j];
            if (pi.playerType == "Human") {
              pi.isPlanning = false;
              if (!pi.nextCommands) {
                pi.nextCommands = [];
              }
              gameSetup.controller.checkForAllCommands();
              break;
            }
          }
        } else { // network game
          if (gameSetup.isHost) { // host is player 0
            const pi = gameSetup.playerInfo[0];
            pi.isPlanning = false;
            if (!pi.nextCommands) {
              pi.nextCommands = [];
            }
            gameSetup.controller.checkForAllCommands();
          } else {
            let cmdstr = "1";

            // read out of the forecast

            for (let j=0; j<config.MOVE_COUNT; j++) {
              const tm = gameSetup.timerMallets[j];
              // if (!gameSetup.forecastParameters[j]) {
              //   const f = new Victor(0, 0);
              //   f.startIndex = 0;
              //   f.targetXWhenApplied = -10000;
              //   f.targetYWhenApplied = -10000;
              //   gameSetup.forecastParameters.push(f);
              // }
              if (tm.chosenMalletID >= 0) {
                // check timing
                const f = gameSetup.forecastParameters[j];
                const newIndex = Math.floor((tm.timerKnob.position.y - config.ybase) / (config.ymax - config.ybase) * config.timeIndexLimit);
                // console.log("move j " + j + " newIndex " + newIndex + " findex " + f.startIndex);
                f.startIndex = newIndex;
  
                // check strength and force
                const m = tm.kickTarget;
                const k = tm.kickKnob;
                const d = Math.max(0, dist2(m.position, k.position) - gameSetup.config.malletD * 0.8);
  
                newf.x = 0; newf.y = 0;
                if (d > gameSetup.config.malletD * 0.1) {
                  newf.x = k.position.x - m.position.x;
                  newf.y = k.position.y - m.position.y;
                  newf.multiplyScalar((newf.length() - gameSetup.config.malletD * 0.8)/newf.length());
                }
                f.x = newf.x;
                f.y = newf.y;
                cmdstr += `_${tm.chosenMalletID}_${f.startIndex}_${Math.fround(f.x*gameSetup.config.kickStrengthScaler)}_${Math.fround(f.y*gameSetup.config.kickStrengthScaler)}`;
              }

            }

            gameSetup.networkHandler.sendCommandToPeerImmediately({
              c: "SUBMIT_COMMAND", t: gameSetup.currentCycleTime, w: cmdstr
            });
          }
        }
        //this.setState(RUN_SHOT_STATE);
      }

      this.onStrikeButtonClick = function () { // GameController
        if (!gameSetup.controller || !gameSetup.controller.allowInput()) {
          return;
        }

        gameSetup.config.hideMessage();

        //gameSetup.controller.inStrike = true;

        // much faster if commented out??
        // that.clearCuemalletTrails();

        // const strength = gameSetup.timerMallet1.value / unitScale; // unit difference?
        // const spinMultiplier = 0 - SPIN_M * gameSetup.timerMallet2.value;
        const dir = gameSetup.cuemalletDirection.clone();
        // console.log("onStrikeButtonClick dir is " + JSON.stringify(dir));
        // testing reproducible
        // dir.x = 1; dir.y = 0.5;

        let strength;
        let spinMultiplier;
        let hspin = 0;
        if (gameSetup.initPlayerInfo.playerType == "AI") {
          if (!gameSetup.AIStrength) { gameSetup.AIStrength = 30; }
          if (!gameSetup.AISpinMultiplier) { gameSetup.AISpinMultiplier = 0; }
          if (!gameSetup.AIHSpin) { gameSetup.AIHSpin = 0; }
          strength = gameSetup.AIStrength / 100 * MAX_SPEED / unitScale; // unit difference?
          spinMultiplier = gameSetup.AISpinMultiplier;
          hspin = gameSetup.AIHSpin;
        } else {
          strength = gameSetup.timerMallet1.value/ 100 * MAX_SPEED / unitScale; // unit difference?
          spinMultiplier = 0 - SPIN_M * gameSetup.timerMallet2.value;
          hspin = gameSetup.timerMallet3.value;
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
        gameSetup.controller.planToStrikeCuemallet(force, av, strength, hspin, gameSetup.targetMalletID ? gameSetup.targetMalletID : -1, gameSetup.targetPocketID != null && gameSetup.targetPocketID >= 0 ? gameSetup.targetPocketID : -1, spin);
      };

      this.actuallyDoStrikeCuemallet = function(force, av, strength, hspin, tb, tp, spin, cbx, cby) { // GameController
        // console.log("actuallyDoStrikeCuemallet " + tb + " " + tp + " " + Date.now());
        if (tb >=0 && tp <0) { // error
          //debugger;
        }
        // console.log("\n\nactuallyDoStrikeCuemallet " + JSON.stringify(force) + " " + JSON.stringify(av) + " " + JSON.stringify(strength) + " " + hspin + " " + cbx + " " + cby);

        let posStr = "";
        for (let k=0; k<gameSetup.mallets.length; k++) {
          const b = gameSetup.mallets[k];
          if (!b.inPocketID || b.inPocketID == null)
            posStr += `${b.ID}_${b.x}_${b.y}_${b.body.position[0]}_${b.body.position[1]}|`;
        }
        // console.log("posstr " + posStr);

        if (typeof(cbx) != "undefined") {
          const cb = gameSetup.malletsByID[0];
          resetMallet(cb, cbx, cby);
        }
        if (gameSetup.gameType !== GAME_TYPE.AUTORUN && gameSetup.gameType !== GAME_TYPE.PRACTICE && gameSetup.initPlayerInfo != gameSetup.playerInfo[gameSetup.localPlayerID]) {
          if (gameSetup.probText) gameSetup.probText.text = `[ - ]`;
        }
        gameSetup.config.hideMessage();
        // aaaa
        that.clearForecastLines(true);
        gameSetup.controller.inStrike = false;
        that.clearIsStopped();
        gameSetup.cuemallet.body.hasFirstContact = false;

        // const spinMultiplier = 0 - 2.5 * spin;
        // gameSetup.AIStrength = strength;
        // gameSetup.AISpinMultiplier = spinMultiplier;
        // gameSetup.AIHSpin = hspin;


        gameSetup.inStrikeAnimation = true;
        gameSetup.gameOver = false;
        gameSetup.currentShotStrength = strength;
        gameSetup.cuestick.visible = true;
        gameSetup.cuestick.alpha = 1;
        gameSetup.cuestick.position.y = strength / 10 + config.malletD / 2;
        gameSetup.cuestick.position.x = -1 * config.malletD/2 * hspin / 30;
        const rot = Math.atan2(force.y, force.x) + Math.PI / 2;
        gameSetup.cuestickcontainer.rotation = rot;
        gameSetup.cuestickcontainer.position.x = gameSetup.cuemallet.body.position[0];
        gameSetup.cuestickcontainer.position.y = gameSetup.cuemallet.body.position[1];


        if (gameSetup.controller.gameState != CALL_SHOT_STATE) {
          gameSetup.targetMalletMark.visible = false;
          gameSetup.targetPocketMark.visible = false;

        } else {
          // console.log("setting target mallet/pocket mark visible for " + tb + " " + tp);
          gameSetup.targetMalletID = tb;
          gameSetup.targetPocketID = gameSetup.pocketIDMap[tp];

          if (gameSetup.targetMalletID > 0 && gameSetup.targetPocketID != null && gameSetup.targetPocketID >= 0) {
            gameSetup.targetMalletMark.visible = true;
            gameSetup.targetPocketMark.visible = true;
            const pocket = gameSetup.tablePocket2[gameSetup.targetPocketID];
            gameSetup.targetPocketMark.position.x = pocket.x;
            gameSetup.targetPocketMark.position.y = pocket.y;
            gameSetup.targetMalletMark.position.x = gameSetup.malletsByID[gameSetup.targetMalletID].position.x;
            gameSetup.targetMalletMark.position.y = gameSetup.malletsByID[gameSetup.targetMalletID].position.y;
          } else {
            gameSetup.targetMalletMark.visible = false;
            gameSetup.targetPocketMark.visible = false;
          }
        }

        const oldy = gameSetup.cuestick.position.y;
        // console.log("on strike: old cue stick position " + oldy);
        const obj = { y: oldy, alpha: 1 };
        if (gameSetup.gameType != GAME_TYPE.REPLAY && gameSetup.gameType != GAME_TYPE.TESTING) {
          gameSetup.tweenF1 = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
            .to({ y: config.malletD / 1.9 }, 1000) // if strength is 1000, then 1 second
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
          .to({ y: config.malletD / 1.9 }, 200) // if strength is 1200, then 1 second
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
            if (gameSetup.gameType !== GAME_TYPE.AUTORUN && gameSetup.gameType !== GAME_TYPE.PRACTICE && gameSetup.initPlayerInfo != gameSetup.playerInfo[gameSetup.localPlayerID]) {
              if (gameSetup.probText) gameSetup.probText.text = `[ - ]`;
            }
            // console.log("Strike with force " + JSON.stringify(force));
            gameSetup.controller.strikeWithExact(force, av, hspin);
            gameSetup.inStrikeAnimation = false;
          });

        gameSetup.tweenB2 = new TWEEN.Tween(obj) // Create a new tween that modifies 'coords'.
          .to({ y: config.malletD * 6, alpha: 0 }, 800) // if strength is 1200, then 1 second
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
              // gameSetup.cuemallet.av = gameSetup.cuemalletAV.clone();
              // console.log("Hit button clicked ");
      };




      this.createWorldForPlayer = function() { // GameController
        // WorldForPlayer.CenterX = config.tableCenterX;
        // WorldForPlayer.CenterY = config.tableCenterY;

        WorldForPlayer.PLAYER_COUNT = gameSetup.config.MALLET_COUNT;
        WorldForPlayer.MOVE_COUNT = gameSetup.config.MOVE_COUNT;
        WorldForPlayer.playerD = gameSetup.config.malletD;

        WorldForPlayer.MAX_STRENGTH = Math.abs(gameSetup.config.malletD * 2.1 * gameSetup.config.kickStrengthScaler);

        WorldForPlayer.goalPosts = [];
        WorldForPlayer.goalPosts.push( // left goal
          {p0: {x: 0 - config.tableW/2, y:0 - config.goalSize/2}, p1: {x: 0 - config.tableW/2, y: 0 + config.goalSize/2}},
        );
        WorldForPlayer.goalPosts.push( // right goal
          {p0: {x: 0 + config.tableW/2, y:0 + config.goalSize/2}, p1: {x: 0 + config.tableW/2, y: 0 - config.goalSize/2}},
        );

        WorldForPlayer.SoccerPosition = {x: 0, y: 0};

        WorldForPlayer.PlayerPositions = [];
        for (let i=0; i < gameSetup.mallets.length; i++) {
          WorldForPlayer.PlayerPositions.push({x: 0, y:0});
        }

        return;

        WorldForPlayer.level = gameSetup.difficulty;
        WorldForPlayer.TableWidth = config.tableW;
        WorldForPlayer.TableHeight = config.tableH;
        WorldForPlayer.CushionWidth = config.cushionBarThick;
        WorldForPlayer.MalletDiameter = config.malletD;
        WorldForPlayer.PlayerInfo = {};

        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID] = {};
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID] = {};
        WorldForPlayer.ColorType = MalletColors;


        WorldForPlayer.goals = [];


        // WorldForPlayer.Pockets = [];
        // if (0 && gameSetup.difficulty >= ADVANCED) {
        //   gameSetup.tablePocket.forEach((p) => {
        //     WorldForPlayer.Pockets.push(new Victor(p.x - config.tableCenterX, p.y - config.tableCenterY));
        //   });
        // } else {
        //   // do not add mirrored pockets
        //   for (let k=0; k<6; k++) {
        //     const p = gameSetup.tablePocket[k];
        //     WorldForPlayer.Pockets.push(new Victor(p.x - config.tableCenterX, p.y - config.tableCenterY));
        //   }
        // }

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
        const adj = config.cushionBarThick + config.malletD / 2;
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

        // WorldForPlayer.CalculateProbabilityByMalletID = function (shotCmd, malletID) {
        //   return gameSetup.controller.calcProbSyncByMalletID(shotCmd, malletID);
        // };

        // WorldForPlayer.isValidFirstTouchColor = function (shotCmd, myColor) {
        //   if (typeof (myColor) === 'undefined') { return true; }
        //   return gameSetup.controller.calculateFirstTouchGoodByColor(shotCmd, myColor);
        // };
        // WorldForPlayer.getIntersection = function (a1, a2, b1, b2) {
        //   return checkLineIntersection(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y, b2.x, b2.y);
        // };
      };


      this.updateWorld = () => { // GameController
        const game = gameSetup; 

        WorldForPlayer.SoccerPosition.x = gameSetup.soccer.body.position[0] - gameSetup.config.tableCenterX;
        WorldForPlayer.SoccerPosition.y = gameSetup.soccer.body.position[1] - gameSetup.config.tableCenterY;

        for (let i=0; i < gameSetup.mallets.length; i++) {
          WorldForPlayer.PlayerPositions[i].x = gameSetup.mallets[i].body.position[0] - gameSetup.config.tableCenterX;
          WorldForPlayer.PlayerPositions[i].y = gameSetup.mallets[i].body.position[1] - gameSetup.config.tableCenterY;
        }


        // debugger;
        // WorldForPlayer.PLAYER_COUNT = gameSetup.config.MALLET_COUNT;
        // WorldForPlayer.MOVE_COUNT = gameSetup.config.MOVE_COUNT;

        return;

        WorldForPlayer.Mallets = [];
        WorldForPlayer.level = gameSetup.difficulty;
        WorldForPlayer.CandidateMalletList = [];
        WorldForPlayer.CandidateMalletList.push([]);
        WorldForPlayer.CandidateMalletList.push([]);
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = gameSetup.playerInfo1.chosenColor;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = gameSetup.playerInfo2.chosenColor;
        const color0 = WorldForPlayer.PlayerInfo[0].chosenColor;
        const color1 = WorldForPlayer.PlayerInfo[1].chosenColor;
        for (let i = 0; i < gameSetup.mallets.length; i++) { WorldForPlayer.Mallets.push({}); }

        gameSetup.mallets.forEach((b) => {
          WorldForPlayer.Mallets[b.ID] = new Victor(b.x - gameSetup.config.tableCenterX, b.y - gameSetup.config.tableCenterY);
          WorldForPlayer.Mallets[b.ID].inPocket = b.body.inPocketID !== null;
          WorldForPlayer.Mallets[b.ID].colorType = b.colorType;
          WorldForPlayer.Mallets[b.ID].ID = b.ID;

          if ((color0 == null || (typeof (color0) === 'undefined') || (color0 === b.colorType)) && (b.body.inPocketID === null || typeof(b.body.inPocketID) == "undefined") && b.ID > 1) {
            WorldForPlayer.CandidateMalletList[0].push(b.ID);
          }
          if ((color1 == null || (typeof (color1) === 'undefined') || (color1 === b.colorType)) && (b.body.inPocketID === null || typeof(b.body.inPocketID) == "undefined") && b.ID > 1) {
            WorldForPlayer.CandidateMalletList[1].push(b.ID);
          }
        });
        const blackmalletbody = gameSetup.malletbodies[1];
        if (WorldForPlayer.CandidateMalletList[0].length === 0 && (blackmalletbody.inPocketID === null || typeof(blackmalletbody.inPocketID) == "undefined")) {
          WorldForPlayer.CandidateMalletList[0].push(1);
        }
        if (WorldForPlayer.CandidateMalletList[1].length === 0 && (blackmalletbody.inPocketID === null || typeof(blackmalletbody.inPocketID) == "undefined")) {
          WorldForPlayer.CandidateMalletList[1].push(1);
        }

        if (WorldForPlayer.CandidateMalletListOverwrite) {
          WorldForPlayer.CandidateMalletList[0] = WorldForPlayer.CandidateMalletListOverwrite;
          WorldForPlayer.CandidateMalletList[1] = WorldForPlayer.CandidateMalletListOverwrite;
        }
      };

      this.startTimer = () => {
        if (gameSetup.isLocal) {

        } else if (gameSetup.isHost) {

        }
      };

      this.enterState = (p) => {
        if (!gameSetup.controller) return;
        // this.updatePlayerPanel(gameSetup.playerInfo1);
        // this.updatePlayerPanel(gameSetup.playerInfo2);
        this.gameState = Number(this.gameState);

        // if (this.gameState == BREAK_CUEBALL_IN_HAND_STATE && gameSetup.initPlayerInfo.playerType == "AI") {
        //   // for AI no need for cue mallet in hand state!?
        //   // this.gameState = BREAK_SHOT_STATE;
        // }

        // console.log(`\n\n\n\n\nenter state for active player ${gameSetup.initPlayerInfo.ID} ${this.gameState}`);
        // if (gameSetup.initPlayerInfo.isLocal) {
        //   if (gameSetup.initPlayerInfo.playerType == "AI") {
        //     this.disableGUIInputs();
        //   } else {
        //     // enable local input GUI and wait for strike or place action
        //     if (this.gameState != CUEBALL_IN_HAND && this.gameState != BREAK_CUEBALL_IN_HAND_STATE && this.gameState != GAME_OVER_STATE) {
        //       this.enableGUIInputs();
        //       gameSetup.toggleHitButton(true);
        //     } else {
        //       this.disableGUIInputs();
        //       if (this.gameState == CUEBALL_IN_HAND || this.gameState == BREAK_CUEBALL_IN_HAND_STATE) {
        //         gameSetup.toggleHitButton(false);
        //         that.clearForecastLines();
        //       }
        //     }
        //   }
        // } else {
        //   that.clearForecastLines();
        //   this.disableGUIInputs();
        // }

        switch (this.gameState) {
          case WAIT_FOR_COMMAND_STATE: 
            break;
          case RESET_FIELD_STATE: {
            this.resetField();
            this.resetMalletForces();
  
            if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
  
            } else {
              // this line runs on both sides so no need to send message all
              // gameSetup.config.showMessage(`Please setup next shot for all players, then click 'Submit'.`, 10, gameSetup.submitButton.position.x - gameSetup.submitButton.width/2, gameSetup.submitButton.position.y + gameSetup.config.tableH * 0.07);
            }
            
            this.setState(PLAN_SHOT_STATE);
            break;
          }
          case PLAN_SHOT_STATE: {
            gameSetup.inGoal = -1;
            gameSetup.controller.disableGUIInputs();
            let b = gameSetup.soccer.body;
            console.log("soccer " + b.position[0] + " " + b.position[1]);
            b = gameSetup.mallets[4].body;
            console.log("mallet 4 " + b.position[0] + " " + b.position[1]);

            for (let i=0; i<2; i++) {
              const pi = gameSetup.playerInfo[i];
              pi.isPlanning = true; // will be reset to false when submitted command
              pi.nextCommands = null;
              if (pi.isLocal) {
                if (pi.playerType == "AI") {
                  gameSetup.controller.updateWorld();
                  // const shotCmdUser = gameSetup.initPlayerInfo.playerAI.getBreakShot();
                  pi.playerWorker.sendMessage({
                    'cmd': CMD_GET_COMMAND,
                    'world': WorldForPlayer
                  });
                } else {
                  // one of the players is manual!
                  gameSetup.controller.enableGUIInputs();
                }
              }
            }
          
            this.resetMalletForces();
            break;
          }
          case RUN_SHOT_STATE: {
            this.disableGUIInputs();
            this.hideMalletForces();
            gameSetup.resetMalletStopped();
            if (gameSetup.forecastG) {
              gameSetup.forecastG.clear();
            }
        
            gameSetup.physicsCnt = 0;
            // for (let k=0; k<gameSetup.config.MOVE_COUNT; k++) {
            //   const f = gameSetup.forecastParameters[k];
            //   const m  = gameSetup.mallets[k];
            //   m.startIndex = 0;
            //   m.timePeriods = [];
            //   if (f.x ==0 && f.y ==0) {
                
            //   } else {
            //     if ( k <= 4) {
            //       const timerm = gameSetup.timerMallets[k];
            //       m.startIndex = Math.floor((timerm.position.y - config.ybase) / (config.ymax - config.ybase) * config.timeIndexLimit);
            //     }
            //   }
            // }            
            break;
          }

          case HAS_GOAL_STATE: {

            gameSetup.playerInfo[1 - gameSetup.inGoal].c.increaseScore();

            gameSetup.showModalMessage(`Goal by player ${1 - gameSetup.inGoal}!`, "", MODAL_NOBUTTON);

            setTimeout(()=>{
              gameSetup.hideModalMessage();
              if (gameSetup.isLocal)
                this.setState(RESET_FIELD_STATE);
              else {
                if (gameSetup.isHost) {
                  gameSetup.networkHandler.sendCommandToAll({
                    c: "RESET_FIELD", t: gameSetup.currentCycleTime
                  });
                }
              }
            }, 3000);

            break;
          }
          
          case BREAK_SHOT_STATE: {
            //config.sendMessageAll(`${gameSetup.initPlayerInfo.playerID} to take break shot`, 1);
            // config.sendMessageAll(`to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot to take break shot`, 1);
            // if (isTesting)
            if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY)
              this.ResetTable(false);
            else {
              if (gameSetup.initPlayerInfo.playerType !== "AI") {
                // manual player
                this.ResetTable(false, true);
              } else {
                // AI player, so reset table!
                this.ResetTable(false);
              }
            }

            if (gameSetup.initPlayerInfo.isLocal) {
              if (gameSetup.initPlayerInfo.playerType == "AI") {
                // get break shot command from robot

                let lag = 600;
                if (isMatch || isPractice) lag = 1200;
                setTimeout(() => {
                  gameSetup.controller.updateWorld();
                  // const shotCmdUser = gameSetup.initPlayerInfo.playerAI.getBreakShot();
                  gameSetup.initPlayerInfo.playerWorker.sendMessage({
                    'cmd': CMD_TAKE_BREAK_SHOT,
                    'world': WorldForPlayer
                  });

                  // setTimeout(() => {
                  //                   // that.clearForecastLines(true);
                  //   // what's this line?
                  //   // if (gameSetup.firstMalletTouchedByCuemallet !== null) {
                  //   //   gameSetup.firstMalletTouchedByCuemallet.colorType = null;
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
            // config.sendMessageAll(`${gameSetup.initPlayerInfo.playerID} to take a call shot`, 0);
            //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = "Strike";
            gameSetup.toggleHitButton(true);
            if (gameSetup.initPlayerInfo.isLocal) {
              if (gameSetup.initPlayerInfo.playerType == "AI") {
                let lag = 600;
                if (isMatch || isPractice) lag = 1200;

                setTimeout(() => {
                  // debugger;
                  gameSetup.controller.updateWorld();
                  // const shotCmdUser = gameSetup.initPlayerInfo.playerAI.getCallShot();

                  gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
            // config.sendMessageAll(`${gameSetup.initPlayerInfo.playerID} to place cue mallet`, 0);
            //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = "Place";
            if (gameSetup.initPlayerInfo.isLocal)
              gameSetup.toggleHitButton(false);

            if (!isTesting && !gameSetup.initPlayerInfo.isLocal) {
              // that.clearForecastLines();
              break;
            } else if (!isTesting && gameSetup.initPlayerInfo.playerType !== 'AI') {
              const cb = gameSetup.malletsByID[0];
              gameSetup.controller.replaceCueMalletNoCollision(cb);
              cb.body.inPocketID = null;
              cuemalletInHand = true;
              // that.enablesubmitButton();
              // getPlayerActionMessage(true, 'CuemalletInHand');
              break;
            }

            // get AI command for place mallet:
            //if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = "Strike";
            gameSetup.toggleHitButton(true);
            let lag = 600;
            if (isMatch || isPractice) lag = 1200;
            setTimeout(() => {
              gameSetup.controller.updateWorld();
              // const shotCmdUser = gameSetup.initPlayerInfo.playerAI.getCallShot();

              gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
            //gameSetup.showWinner(gameSetup.initPlayerInfo.ID, gameSetup.initPlayerInfo.playerID);
            // if (0 && gameSetup.isHost && gameSetup.gameType != GAME_TYPE.TOURNAMENT) {

            //   gameSetup.showModalMessage(`The winner is player ${gameSetup.initPlayerInfo.ID}: ${gameSetup.initPlayerInfo.playerID} !`, p[5], MODAL_EXITORREPLAY);
            // } else {
            //   gameSetup.showModalMessage(`The winner is player ${gameSetup.initPlayerInfo.ID}: ${gameSetup.initPlayerInfo.playerID} !`, p[5], MODAL_EXITGAME);
            // }

            if (isMatch || isPractice) {
              PoolActions.reportGameResult(gameSetup.room._id, gameSetup.initPlayerInfo.playerUserId);
              gameSetup.showModalMessage(`The winner is player ${gameSetup.initPlayerInfo.ID}: ${gameSetup.initPlayerInfo.playerID} !`, p[5], MODAL_EXITGAME);
              
            }

            if (isTournament) {
              gameSetup.showModalMessage(`The winner is player ${gameSetup.initPlayerInfo.ID}: ${gameSetup.initPlayerInfo.playerID} !`, p[5], MODAL_NOBUTTON);
              PoolActions.reportGameResult(gameSetup.room._id, gameSetup.initPlayerInfo.playerUserId);
              const params = {
                modalIsOpen: true,
                sectionKey: gameSetup.pairData.sectionId,
                tournamentId: gameSetup.pairData.tournamentId
              };
              PoolActions.finishTournamentSectionRound(
                gameSetup.pairData.roundId,
                gameSetup.initPlayerInfo.playerUserId,
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
              PoolActions.reportGameResult(gameSetup.room._id, gameSetup.initPlayerInfo.playerUserId);
              gameSetup.showModalMessage(`Autorun: the winner is player ${gameSetup.initPlayerInfo.ID}: ${gameSetup.initPlayerInfo.playerID} !`, p[5], MODAL_EXITGAME);

              // PoolActions.finishTournamentSectionRound(
              //   gameSetup.pairData.roundId,
              //   gameSetup.initPlayerInfo.playerUserId,
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

      this.setGameStarted = () => {
        if (gameSetup.isLocal) {
          gameSetup.controller.setState(RESET_FIELD_STATE);
          gameSetup.gameStarted = true;
        } else {
          if (gameSetup.isHost) {
            gameSetup.networkHandler.sendCommandToAll({
              c: "START_GAME", t: gameSetup.currentCycleTime, w: ""
            });
          }
        }
      };

      this.tryStartGame = () => {
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
          if (!gameSetup.gameStarted) {
            this.setGameStarted();
            return;
          }
        }

        if ((gameSetup.isLocal || gameSetup.peerReady) && !gameSetup.gameStarted) {
          if (gameSetup.isHost) {
            // main entry point to kick off the state machine
            this.setGameStarted();
          }
        }
      };

      this.trySelectPlayer = () => {
        if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
          if (gameSetup.initPlayerInfo == null) {
            gameSetup.initPlayerInfo = gameSetup.playerInfo[0];
            // if (gameSetup.initializationCallBack) {
            //   gameSetup.initializationCallBack();
            // } else {
            //   console.log("initializationCallBack not defined");
            // }
            return;
          }
        }
        // console.log("initPlayerInfo not null? " + gameSetup.allInitialized + " " + gameSetup.initPlayerInfo);
        if ((gameSetup.isLocal || gameSetup.peerReady) && gameSetup.initPlayerInfo == null) {
          if (gameSetup.isHost) {
            // console.log("host try select active player");

            // main entry point to kick off the state machine
            if (gameSetup.resumeCommands) {
            } else {
              this.chooseInitPlayerToStart();
            }
          }
        }
      };

      this.tickUpdate = () => {
        if (!gameSetup.gameStarted) return;

        this.updateGameWorld();
      };


      this.saveCommand = (cmdstr) => {
        Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.initPlayerInfo.ID, cmdstr);
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
          //this.setNewPlayerState(gameSetup.initPlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
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
          c: "NewInitPlayerInfo", t: gameSetup.currentCycleTime, w: `${newID}_${newState}_${chosenColor}_${Math.fround(cbx)}_${Math.fround(cby)}_${winReason}`
        });
      };

      this.handleAllStopped = () => {

        if (gameSetup.isLocal) {

          if (gameSetup.inGoal >= 0) {
            this.setState(HAS_GOAL_STATE);
          } else {
            this.setState(PLAN_SHOT_STATE);
          }
        } else {

          if (gameSetup.isHost) {
            if (gameSetup.inGoal >= 0) {
              gameSetup.networkHandler.sendCommandToAll({
                c: "HAS_GOAL", t: gameSetup.currentCycleTime, w: gameSetup.inGoal
              });
            } else {
              let posstr = "";
              for (let i=0; i<gameSetup.mallets.length; i++) {
                const m = gameSetup.mallets[i];
                posstr += m.position.x + "_" + m.position.y + "_";
              }
              gameSetup.networkHandler.sendCommandToAll({
                c: "PLAN_SHOT", t: gameSetup.currentCycleTime, w: posstr
              });
            }
          }
        }
        return;

        gameSetup.networkHandler.sendCommandToAll({
          c: "NewInitPlayerInfo", t: gameSetup.currentCycleTime, w: `${newID}_${newState}_${chosenColor}_${Math.fround(cbx)}_${Math.fround(cby)}_${winReason}`
        });


        // console.log("do handle all stopped " + gameSetup.targetMalletID + " " + gameSetup.targetPocketID);

        gameSetup.resetMalletStopped();

        if (gameSetup.gameType == GAME_TYPE.REPLAY) {
          if (gameSetup.inWaitingPlacement) return;
          window.replayControl.onReplayFinish();
          return;
        }

        
        this.inStrike = false;
        this.inNewTest = false;
        // const config = gameSetup.config;
        config.playerPanel1.inTimeCountDown = false;
        config.playerPanel2.inTimeCountDown = false;

        if (gameSetup.timerMallet1) {
          gameSetup.timerMallet1.value = 0;
          gameSetup.timerMallet1.setPositionByValue(0);
          gameSetup.timerMallet2.value = 0;
          gameSetup.timerMallet2.setPositionByValue(0);
          gameSetup.timerMallet3.value = 0;
          gameSetup.timerMallet3.setPositionByValue(0);
        }

        if (isTesting) {
          if (window.waitForAllStopResolveID) {
            gameSetup.controller.updateWorld();
            gameSetup.initPlayerInfo.playerWorker.sendMessage({
              'cmd': CMD_SCRIPT_WAIT_FOR_ALL_BALL_STOP,
              'world': WorldForPlayer,
              'resolveID': window.waitForAllStopResolveID
            });
            delete window.waitForAllStopResolveID;
          }
          return;
        }

        // check for any goals
        let hasAnyGoal = false;

        if (!hasAnyGoal) {
          this.setGlobalState(PLAN_SHOT_STATE);
        } else {
          this.setGlobalState(RESET_FIELD_STATE);
        }

        if (true) return;

        // console.log("game state is " + this.gameState);

        gameSetup.controller.verifyTestResult();
      };

      gameSetup.resetMalletStopped = () => {
        // if (gameSetup.isHost)
          gameSetup.hostAllStopped = false;
        // else
          gameSetup.allPeerAllStopped = false;
        gameSetup.allStopHandled = false;
        if (gameSetup.peer)
          gameSetup.peer.allObjectStopped = false;
        // if (!gameSetup.allPeers) return; // local game
        // for (let j = 0; j < gameSetup.playerCount; j++) {
        //   const p1 = gameSetup.allPeers[j];
        //   if (p1) {
        //     p1.allObjectStopped = false;
        //   }
        // }
      };

      this.checkForAllCommands = () => {

        let allReady = true;
        for (let i=0; i<2; i++) {
          if (gameSetup.playerInfo[i].isPlanning) {
            allReady = false;
            break;
          }
          if (!gameSetup.playerInfo[i].nextCommands) {
            allReady = false;
            break;
          }
        }

        if (allReady) {
          if (gameSetup.isLocal) {
            gameSetup.controller.setState(RUN_SHOT_STATE);
          } else if (gameSetup.isHost) {
            // for network game, all peers transit state based on host decision
            let cmdstr = "";
            for (let j=0; j<2; j++) {
              const pinfo = gameSetup.playerInfo[j];
              cmdstr += pinfo.ID;
              for (let i=0; i<pinfo.nextCommands.length; i++) {
                const c = pinfo.nextCommands[i];
                if (c.kickFrameIndex >= 0)
                  cmdstr += `_${c.playerID}_${c.kickFrameIndex}_${c.forceX}_${c.forceY}`;
              }
              if (j == 0) {
                cmdstr += "|";
              }
            }

            gameSetup.networkHandler.sendCommandToAll({
              c: "RUN_SHOT", t: gameSetup.currentCycleTime, w: cmdstr
            });
          }
        }

        return;


        gameSetup.allPeerCommandReady = gameSetup.hostCommandReady;
        if (!gameSetup.peer) return;
        if (!gameSetup.peer.allObjectStopped) {
          gameSetup.allPeerAllStopped = false;
          // console.log("peer is still not all stopped ");
        }
        // for (let j = 0; j < gameSetup.playerCount; j++) {
        //   const p1 = gameSetup.allPeers[j];
        //   if (p1 && !p1.allObjectStopped) {
        //     console.log("confirm peer all mallet stopped!");
        //     gameSetup.allPeerAllStopped = false;
        //     break;
        //   }
        // }
        if (gameSetup.allPeerAllStopped) {
          gameSetup.allStopHandled = true;
          this.handleAllStopped();
        }
      };

      this.checkIfAllPeerAllStopped = () => {
        // console.log("dddd checkIfAllPeerAllStopped " + gameSetup.hostAllStopped + " " + gameSetup.peer.allObjectStopped);
        if (!gameSetup.isHost) return;
        gameSetup.allPeerAllStopped = gameSetup.hostAllStopped;
        if (!gameSetup.peer) return;
        if (!gameSetup.peer.allObjectStopped) {
          gameSetup.allPeerAllStopped = false;
          // console.log("peer is still not all stopped ");
        }
        // for (let j = 0; j < gameSetup.playerCount; j++) {
        //   const p1 = gameSetup.allPeers[j];
        //   if (p1 && !p1.allObjectStopped) {
        //     console.log("confirm peer all mallet stopped!");
        //     gameSetup.allPeerAllStopped = false;
        //     break;
        //   }
        // }
        if (gameSetup.allPeerAllStopped) {
          gameSetup.allStopHandled = true;
          this.handleAllStopped();
        }
      };


      this.calcEndStateSync = (shotCmd, WithRandomNess = false) => {
        var cuemalletPos = new Victor(gameSetup.cuemallet.position.x, gameSetup.cuemallet.position.y);
        if (window.InitState) {
          cuemalletPos.x = window.InitState[0].x + gameSetup.config.tableCenterX;
          cuemalletPos.y = window.InitState[0].y + gameSetup.config.tableCenterY;
        }
        
        const pocketPos = gameSetup.tablePocket[shotCmd.targetPocketID].clone();
        // console.log("pocketPos " + (pocketPos.x - config.tableCenterX) + " " + (pocketPos.y - config.tableCenterY));
        const targetMallet = gameSetup.malletsByID[shotCmd.targetMalletID];
        const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);
        // console.log("targetMalletPos " + (targetMalletPos.x - config.tableCenterX) + " " + (targetMalletPos.y - config.tableCenterY));
        const dirMalletToPocket = pocketPos.clone().subtract(targetMalletPos);
        // console.log("dirMalletToPocket " + JSON.stringify(dirMalletToPocket));
        const dirAimToMallet = dirMalletToPocket.clone().normalize().scale(config.malletD);
        let aimPos = targetMalletPos.clone().subtract(dirAimToMallet);
        if (aimPos.distance(cuemalletPos) <= 0.01) {
          // debugger;
          aimPos = targetMalletPos;
          // console.log("setting aimpos to target pos");
        }
        if (typeof(shotCmd.aimx) != "undefined" && typeof(shotCmd.aimy) != "undefined") {
          aimPos.x = shotCmd.aimx; aimPos.y = shotCmd.aimy;
        }

        const dirCueMalletToAim = aimPos.clone().subtract(cuemalletPos);

        // console.log("\n\nangle for pocketID " + shotCmd.targetPocketID + ": ");
        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cuemalletPos " + JSON.stringify(cuemalletPos));

        // console.log("aimPos " + aimPos.x + " " + aimPos.y);
        gameSetup.cuemalletDirection.x = aimPos.x - cuemalletPos.x;
        gameSetup.cuemalletDirection.y = aimPos.y - cuemalletPos.y;
        gameSetup.targetMalletID = shotCmd.targetMalletID;
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
        that.runSimulation(SIM_ENDSTATE, WithRandomNess);

        const endState = [];
        const allIDs = Object.keys(malletbodies2);
        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          const b2 = malletbodies2[i];
          if (b2.inPocketID != null) {
            endState.push({malletID: j, inPocketID: b2.inPocketID});
          } else {
            endState.push({malletID: j, inPocketID: null, x: b2.position[0] - gameSetup.config.tableCenterX, y: b2.position[1] - gameSetup.config.tableCenterY});
          }
        }
        // console.log("prob for " + shotCmd.targetPocketID + " is " + prob);
        return endState;
        // console.log("prob for " + gameSetup.cuemalletDirection.x + " " + gameSetup.cuemalletDirection.y + " is " + prob);
      };


      

      this.calcProbSync = (shotCmd) => {
        if (shotCmd.targetMalletID == 3 && shotCmd.targetPocketID == 5) {
          // debugger;
        }
        var cuemalletPos = new Victor(gameSetup.cuemallet.position.x, gameSetup.cuemallet.position.y);
        if (window.InitState) {
          cuemalletPos.x = window.InitState[0].x + gameSetup.config.tableCenterX;
          cuemalletPos.y = window.InitState[0].y + gameSetup.config.tableCenterY;
        }
        const pocketPos = gameSetup.tablePocket[shotCmd.targetPocketID].clone();
        // console.log("pocketPos " + (pocketPos.x - config.tableCenterX) + " " + (pocketPos.y - config.tableCenterY));
        const targetMallet = gameSetup.malletsByID[shotCmd.targetMalletID];
        const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);
        // console.log("targetMalletPos " + (targetMalletPos.x - config.tableCenterX) + " " + (targetMalletPos.y - config.tableCenterY));
        const dirMalletToPocket = pocketPos.clone().subtract(targetMalletPos);
        // console.log("dirMalletToPocket " + JSON.stringify(dirMalletToPocket));
        const dirAimToMallet = dirMalletToPocket.clone().normalize().scale(config.malletD);
        let aimPos = targetMalletPos.clone().subtract(dirAimToMallet);
        if (aimPos.distance(cuemalletPos) <= 0.01) {
          // debugger;
          aimPos = targetMalletPos;
          // console.log("setting aimpos to target pos");
        }
        if (typeof(shotCmd.aimx) != "undefined" && typeof(shotCmd.aimy) != "undefined") {
          aimPos.x = shotCmd.aimx; aimPos.y = shotCmd.aimy;
        }

        const dirCueMalletToAim = aimPos.clone().subtract(cuemalletPos);

        // console.log("\n\nangle for pocketID " + shotCmd.targetPocketID + ": ");
        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cuemalletPos " + JSON.stringify(cuemalletPos));

        // console.log("aimPos " + aimPos.x + " " + aimPos.y);
        gameSetup.cuemalletDirection.x = aimPos.x - cuemalletPos.x;
        gameSetup.cuemalletDirection.y = aimPos.y - cuemalletPos.y;
        gameSetup.targetMalletID = shotCmd.targetMalletID;
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

        const prob = getPocketProbability(shotCmd.targetMalletID, shotCmd.targetPocketID);
        // console.log("prob for " + shotCmd.targetPocketID + " is " + prob);
        return prob;
        // console.log("prob for " + gameSetup.cuemalletDirection.x + " " + gameSetup.cuemalletDirection.y + " is " + prob);
      };


      const v = new Victor(0, 0);
      this.applyMalletAnimationAndAngle = () => {
        const ids = Object.keys(gameSetup.malletsByID);
        for (let k=0; k<ids.length; k++) {
          const b = gameSetup.malletsByID[ids[k]];
          if (b.body.inPocketID == null) {
            const bv = new Victor(b.body.velocity[0], b.body.velocity[1]);
            const ang = Math.atan2(bv.y, bv.x);
            const speed = bv.length();
            if (speed > 0.001) {
              b.rotation = (ang / Math.PI * 180 + 90) * (Math.PI / 180);

              // // estimate mallet facing dir change
              // const dx = b.position.x - b.oldp.x;
              // const dy = b.position.y - b.oldp.y;
              // const dist = Math.sqrt(dx*dx + dy*dy);
              // const frameChg = (dist / (config.malletD * Math.PI)) * 72;
              // b.frame += frameChg;


              // add effect of spin!
              const bb = b.body;
              v.x = bb.velocity[0]; v.y = bb.velocity[1];
              const spinV = bb.av.clone().add(v);
              // if (spinV.length() > 0) { // that is: v != av

              //   const distav = spinV.length() / 60;
              //   const frameChg2 = (distav / (config.malletD * Math.PI)) * 72;
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
              const frameChg2 = (distav / (config.malletD * Math.PI)) * 72;
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
                const frameChg = (dist / (config.malletD * Math.PI)) * 72;
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

      

      this.saveAllMalletStoppedCommand = () => {
        let posStr = "";
        for (let k=0; k<gameSetup.mallets.length; k++) {
          const b = gameSetup.mallets[k];
          if (!b.inPocketID || b.inPocketID == null)
            posStr += `${b.ID}_${b.x}_${b.y}|`;
        }
    
        const cmdstr = `ALL_OBJECTS_STOPPED;${Date.now()};${gameSetup.playerID};${posStr}`;
        Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.initPlayerInfo.ID, cmdstr);
      };

      this.syncSpriteToBody = () => {
        const cfg = gameSetup.config;
        gameSetup.soccer.position.x = gameSetup.soccer.body.position[0];
        gameSetup.soccer.position.y = gameSetup.soccer.body.position[1];

        for (let k=0; k<gameSetup.mallets.length; k++) {
          const m  = gameSetup.mallets[k];
          let b = m.body;
          m.position.x = b.position[0];
          m.position.y = b.position[1];
        }
      }
      
      let elapsed = Date.now();
      const testtarget = new Victor(0, 0);
      const newf = new Victor(0, 0);
      gameSetup.forecastParameters = [];
  
      this.updateGameWorld = () => {
        const config = gameSetup.config;
        this.syncSpriteToBody();

        if (gameSetup.controller.gameState == PLAN_SHOT_STATE) {
          let changed = false;
  
          for (let j=0; j<config.MOVE_COUNT; j++) {
            const tm = gameSetup.timerMallets[j];
            if (!gameSetup.forecastParameters[j]) {
              const f = new Victor(0, 0);
              f.startIndex = 0;
              f.targetXWhenApplied = -10000;
              f.targetYWhenApplied = -10000;
              gameSetup.forecastParameters.push(f);
            }
            if (tm.chosenMalletID >= 0) {
              // check timing
              const f = gameSetup.forecastParameters[j];
              const newIndex = Math.floor((tm.timerKnob.position.y - config.ybase) / (config.ymax - config.ybase) * config.timeIndexLimit);
              // console.log("move j " + j + " newIndex " + newIndex + " findex " + f.startIndex);
              if (newIndex != f.startIndex) {
                f.startIndex = newIndex;
                changed = true;
              }

              // check strength and force
              const m = tm.kickTarget;
              const k = tm.kickKnob;
              const d = Math.max(0, dist2(m.position, k.position) - gameSetup.config.malletD * 0.8);

              newf.x = 0; newf.y = 0;
              if (d > gameSetup.config.malletD * 0.1) {
                newf.x = k.position.x - m.position.x;
                newf.y = k.position.y - m.position.y;
                newf.multiplyScalar((newf.length() - gameSetup.config.malletD * 0.8)/newf.length());
              }
              if ( Math.abs(newf.x - f.x) > 0.1 || Math.abs(newf.y - f.y) > 0.1) {
                f.x = newf.x;
                f.y = newf.y;
                changed = true;
              }
            }
          }

          if (changed) {
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
            }

            gameSetup.forecastHandle = setTimeout(() => {
              // console.log("do forecast in gameSetup.forecastHandle");
              // console.log("cue mallet dir " + gameSetup.cuemalletDirection.x + " " + gameSetup.cuemalletDirection.y);
              // testing
              // gameSetup.AIStrength = 100;
              that.runSimulation(SIM_DRAW);

              // clear forecast lines if first touch is wrong color
              if (!gameSetup.controller) return;

              if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

              // if (gameSetup.targetMalletID != null && gameSetup.targetPocketID != null) {
              //   doSimulation();
              // }
              // console.log("reset strike button final");
              // if (gameSetup.strikeButton) gameSetup.strikeButton.text.text = `Strike`;
              // gameSetup.probText.text = `[ - ]`;
            }, 10);
          }
        } else if (gameSetup.controller.gameState == RUN_SHOT_STATE) {
          
          SoccerGameObj.applyKicksForThisTime(false, gameSetup.physicsCnt);

          const allStopped = SoccerGameObj.checkGoalOrAllStopped(false, gameSetup.physicsCnt);
          // console.log("b speed after 3 " + b.velocity[0]);
          if (!allStopped) {
            world.step(1/60);
            gameSetup.physicsCnt ++;
            
            // for (let i=2; i<=7; i+= 5) {
            //   const m = gameSetup.mallets[i].body;
            //   console.log("m " + i + " " + m.position[0] + " " + m.position[1]);
            // }
          } else {
            
            if (gameSetup.isLocal) {

              if (gameSetup.inGoal >= 0) {
                gameSetup.controller.setState(HAS_GOAL_STATE);
              } else {
                gameSetup.controller.setState(PLAN_SHOT_STATE);
              }

            } else {
              if (gameSetup.isHost) {
                gameSetup.hostAllStopped = true;
                gameSetup.controller.checkIfAllPeerAllStopped();
              } else {
                console.log("send all stopped from guest___!");
                gameSetup.controller.setState(WAIT_FOR_COMMAND_STATE);
                gameSetup.networkHandler.sendCommandToPeerImmediately({
                  c: "ALL_OBJECTS_STOPPED", t: gameSetup.currentCycleTime
                });
              }
            }
          }
        }
        
        return;

        if (gameSetup.initPlayerInfo == null) return;
        if (this.allowInput()) {
          if (cuemalletInHand || (gameSetup.gameType != GAME_TYPE.TESTING && gameSetup.controller.gameState < 0)) {
            // do nothing while trying to place cue mallet

            if (gameSetup.isCuemalletInHand() && gameSetup.placeMalletSpeedX != 0 || gameSetup.placeMalletSpeedY != 0 ) {
              const cb = gameSetup.malletsByID[0];
              testtarget.x = Math.fround(cb.position.x + gameSetup.placeMalletSpeedX * gameSetup.config.malletD / 10);
              testtarget.y = Math.fround(cb.position.y + gameSetup.placeMalletSpeedY * gameSetup.config.malletD / 10);
              gameSetup.controller.tryPlaceCueMallet(testtarget);
            }

          } else {
            // if there is any change in strength, dir or spin, run simulation here, and show target mallet/pocket/prob if any

            // console.log("\n\n------- update game world ");


            if (gameSetup.emitter) {
              const now = Date.now();
              // gameSetup.timerMallet1.emitter.emit = true;
              gameSetup.emitter.update((now - elapsed) * 0.001);
              elapsed = now;

            }

            if (gameSetup.gameType != GAME_TYPE.TESTING) {
              PIXI.keyboardManager.update();
            }



            let strength;
            let spinMultiplier, hspin;
            let dir;
            if (gameSetup.initPlayerInfo.playerType == "AI") {
              if (!gameSetup.AIStrength) { gameSetup.AIStrength = 30; }
              if (!gameSetup.AISpinMultiplier) { gameSetup.AISpinMultiplier = 0; }
              if (!gameSetup.AIHSpin) { gameSetup.AIHSpin = 0; }
              strength = gameSetup.AIStrength / 100 * MAX_SPEED / unitScale; // unit difference?
              spinMultiplier = gameSetup.AISpinMultiplier;
              hspin = gameSetup.AIHSpin;
              dir = gameSetup.cuemalletDirection.clone();
            } else {
              // if (gameSetup.targetMalletID == null && gameSetup.strikeButton.text.text != `Strike`) {
              //   gameSetup.strikeButton.text.text = `Strike`;
              // }
              // console.log("set probtext to -- 2");
              // gameSetup.probText.text = `[ - ]`;


              if (gameSetup.strengthChangeSpeed != 0) {

                gameSetup.emitter.updateOwnerPos(gameSetup.timerMallet1.position.x, gameSetup.timerMallet1.position.y);
                gameSetup.emitter.emit = true;

                let acc = 1;
                if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
                  acc = 10;
                }

                gameSetup.timerMallet1.value += gameSetup.strengthChangeSpeed * 0.25 * acc;
                if (gameSetup.timerMallet1.value >= 100) gameSetup.timerMallet1.value = 100;
                if (gameSetup.timerMallet1.value <= 2) gameSetup.timerMallet1.value = 2;
                gameSetup.timerMallet1.setPositionByValue(gameSetup.timerMallet1.value);
                // gameSetup.timerMallet2.setPositionByValue(shotCmd.spin);
                // gameSetup.timerMallet3.setPositionByValue(shotCmd.hspin);
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
                // // gameSetup.timerMallet1.emitter.emit = true;
                // gameSetup.timerMallet2.emitter.update((now - elapsed) * 0.001);
                // elapsed = now;

                gameSetup.emitter.updateOwnerPos(gameSetup.timerMallet2.position.x, gameSetup.timerMallet2.position.y);
                gameSetup.emitter.emit = true;
                let acc = 1;
                if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
                  acc = 10;
                }

                gameSetup.timerMallet2.value += gameSetup.spinChangeSpeed * 0.002 * acc;
                if (gameSetup.timerMallet2.value >= 1) gameSetup.timerMallet2.value = 1;
                if (gameSetup.timerMallet2.value <= -1) gameSetup.timerMallet2.value = -1;
                gameSetup.timerMallet2.setPositionByValue(gameSetup.timerMallet2.value);
              }

              if (gameSetup.hspinChangeSpeed != 0) {

                // const now = Date.now();
                // // gameSetup.timerMallet1.emitter.emit = true;
                // gameSetup.timerMallet3.emitter.update((now - elapsed) * 0.001);
                // elapsed = now;

                gameSetup.emitter.updateOwnerPos(gameSetup.timerMallet3.position.x, gameSetup.timerMallet3.position.y);
                gameSetup.emitter.emit = true;

                let acc = 1;
                if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
                  acc = 10;
                }

                gameSetup.timerMallet3.value += gameSetup.hspinChangeSpeed * 0.05 * acc;
                if (gameSetup.timerMallet3.value >= 30) gameSetup.timerMallet3.value = 30;
                if (gameSetup.timerMallet3.value <= -30) gameSetup.timerMallet3.value = -30;
                gameSetup.timerMallet3.setPositionByValue(gameSetup.timerMallet3.value);
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


              gameSetup.toggleHitButton(true);

              // if changed do new run:
              strength = gameSetup.timerMallet1.value / 100 * MAX_SPEED / unitScale; // unit difference?
              spinMultiplier = 0 - SPIN_M * gameSetup.timerMallet2.value;
              hspin = gameSetup.timerMallet3.value;
              dir = gameSetup.cuemalletDirection.clone();
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

            
          }
        } else if (this.inStrike) {
          const strength = gameSetup.currentShotStrength;
          // let ROUNDS = Math.round(strength/500);
          // if (ROUNDS < 2) ROUNDS = 2;
          // const stepsizePerRound = stepsize / ROUNDS;
          let allStopped = false;
          // for (let k=0; k<ROUNDS; k++) {
          let totalStepSize = 0;
          const malletSpeedOld = {};
          const malletSpeedNew = {};
          let totalenergy = 0;
          let totalenergynew = 0;
          while (totalStepSize <= 1/60.001) {
            
            const b = malletbodies[0];
            // console.log("cue mallet before step " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1] + " " + b.av.x + " " + b.av.y);
            const b2 = malletbodies[1];
            // console.log("mallet 1 before step " + b2.position[0] + " " + b2.position[1] + " " + b2.velocity[0] + " " + b2.velocity[1] + " " + b2.av.x + " " + b2.av.y);
             
            for (let x=0; x < 22; x ++) {
              const bb = malletbodies[x];
              // console.log("details " + bb.ID + " " + bb.position[0] + " " + bb.position[1] + " " + bb.velocity[0] + " " + bb.velocity[1] + " " + bb.av.x + " " + bb.av.y + " " + bb.inertia + " " + bb.ccdIterations + " " + JSON.stringify(bb.vlambda));
            }
             
            if ( b.position[0] == 1540.810546875 && b.position[1] == 705.5906982421875) {
            // if ( b.position[0] == 1539.0308837890625 && b.position[1] == 705.6083984375) {
               
            // if (b2.position[0] == 1672.1751708984375 && b2.position[1] == 705.3029174804688) {
              
              // debugger;
              
            // }
          }
            let step = this.calculateStepSize(malletbodies);

            // console.log("new step is " + step);

            if (1) {

              // console.log("before world step " + step);
              if (gameSetup.controller.gameState == CALL_SHOT_STATE) {
                const allIDs = Object.keys(malletbodies);
                const g = gameSetup.forecastG;
                for (let j=0; j<allIDs.length; j++) {
                  const i = allIDs[j];
                  const b = malletbodies[i];
                  if (b.inPocketID != null) continue;
                  malletSpeedOld[i] = len2(b.velocity);
                  totalenergy += malletSpeedOld[i] * malletSpeedOld[i];
                  // console.log("before mallet " + j + " " + i + " " + b.inPocketID + " " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1]);
                }
              }
            }


            if (step < 0.1 / 60) {
              step = 0.1 / 60;
            }
            // console.log("step is " + step);

            that.prepareForHSpin(gameSetup.cuemallet.body);

            if (step == 0.015843064564962317) {
              // becomes different!
              //maybe print out world??

              printed = {world: true};
              console.log("\n\n\nworld is ");
              // deepPrint(world, 0);

              // debugger;
            }

            world.step(step);

            // if (gameSetup.blackmallet.body.position[1] >= 1000 && gameSetup.blackmallet.body.position[1] <= 3000)
            //   console.log(" black body " + gameSetup.blackmallet.body.velocity[0] + " " + gameSetup.blackmallet.body.velocity[1] + " " + gameSetup.blackmallet.body.position[0] + " " + gameSetup.blackmallet.body.position[1]);

            that.adjustForHSpin(gameSetup.cuemallet.body);

            if (1) {
              if (gameSetup.controller.gameState == CALL_SHOT_STATE) {
                const allIDs = Object.keys(malletbodies);
                const g = gameSetup.forecastG;
                for (let j=0; j<allIDs.length; j++) {
                  const i = allIDs[j];
                  const b = malletbodies[i];
                  if (b.inPocketID != null) continue;
                  malletSpeedNew[i] = len2(b.velocity);
                  totalenergynew += malletSpeedNew[i] * malletSpeedNew[i];
                  // console.log("after mallet " + j + " " + i + " " + b.inPocketID + " " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1]);
                }

                if (totalenergynew > totalenergy) {
                  // debugger;
                }
              }
            }

            for (let x=0; x < 22; x ++) {
              const bb = malletbodies[x];
              // console.log("after step details " + bb.ID + " " + bb.position[0] + " " + bb.position[1] + " " + bb.velocity[0] + " " + bb.velocity[1] + " " + bb.av.x + " " + bb.av.y + " " + bb.inertia + " " + bb.ccdIterations + " " + JSON.stringify(bb.vlambda));
            }



            if (1) {
              const allIDs = Object.keys(malletbodies);
              const g = gameSetup.forecastG;
              for (let j=0; j<allIDs.length; j++) {
                const i = allIDs[j];
                const b = malletbodies[i];
                if (i == 0 || i == 1) {
                  // console.log("mallet " + i + " " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1]  + " " + b.av.x + " " + b.av.y);
                }
                if (b.inPocketID != null) continue;
                if (isNaN(b.position[0]) || isNaN(b.velocity[0])) {
                  // console.log("nan issue! step " + step + " mallet id " + i);
                  // debugger;
                  // debugger;
                }
              }
            }
            totalStepSize += step;
          }

          gameSetup.counter ++;

          that.applyRollingFriction(malletbodies, true);
          allStopped = that.markPocketedOrStopped(malletbodies, false);
          // if (allStopped) break;
          for (let x=0; x < 22; x ++) {
            const bb = malletbodies[x];
            // console.log("after friction details " + bb.ID + " " + bb.position[0] + " " + bb.position[1] + " " + bb.velocity[0] + " " + bb.velocity[1] + " " + bb.av.x + " " + bb.av.y + " " + bb.inertia + " " + bb.ccdIterations + " " + JSON.stringify(bb.vlambda));
          }


          // const b = malletbodies[0];
          // console.log("after frict cue mallet  " + b.position[0] + " " + b.position[1] + " " + b.velocity[0] + " " + b.velocity[1] + " " + b.av.x + " " + b.av.y);
          // const b2 = malletbodies[1];
          // console.log("after frict mallet 1  " + b2.position[0] + " " + b2.position[1] + " " + b2.velocity[0] + " " + b2.velocity[1] + " " + b2.av.x + " " + b2.av.y);

          // sync mallet image to body
          for (let k=0; k<that.mallets.length; k++) {
            const mallet = that.mallets[k];
            mallet.oldp.x = mallet.position.x;
            mallet.oldp.y = mallet.position.y;
            mallet.position.x = mallet.body.position[0];
            mallet.position.y = mallet.body.position[1];

            // mallet.body.malletIDLabel.visible = true; // aaaa test
            // mallet.body.malletIDLabel.position.x = mallet.body.position[0];
            // mallet.body.malletIDLabel.position.y = mallet.body.position[1] + gameSetup.config.malletD * 1;
  
          }
          if (gameSetup.targetMalletID != null && gameSetup.targetMalletID > 0 ) {
            gameSetup.targetMalletMark.position.x = gameSetup.malletsByID[gameSetup.targetMalletID].position.x;
            gameSetup.targetMalletMark.position.y = gameSetup.malletsByID[gameSetup.targetMalletID].position.y;
          }

          this.applyMalletAnimationAndAngle();


          // console.log("checking gameSetup.controller.inStrike " + gameSetup.controller.inStrike + " allStopped " + allStopped);
          if (gameSetup.controller.inStrike && allStopped) {
            // gameSetup.allStopped = true;
            // console.log("all mallet stopped for me!!");
            gameSetup.controller.inStrike = false;
            gameSetup.targetMalletMark.visible = false;
            gameSetup.targetPocketMark.visible = false;

            gameSetup.showAllMalletPosition();

            if (gameSetup.isLocal) {
              if (gameSetup.gameType == GAME_TYPE.AUTORUN)
                this.saveAllMalletStoppedCommand();

              this.handleAllStopped();
              

              // don't save for local!
              // const posStr = gameSetup.getPosStr();

              // if (gameSetup.gameType != GAME_TYPE.TESTING) {
              //   const cmdstr = `ALL_OBJECTS_STOPPED;${Date.now()};${gameSetup.initPlayerInfo.ID};${posStr}`;
              //   Meteor.call('saveGameCommand', gameSetup.room._id, gameSetup.localPlayerID, cmdstr);
              // }
            } else {
              if (!gameSetup.isHost) {
                // console.log("non host sendAllObjectsStopped");
                gameSetup.networkHandler.sendAllObjectsStopped();
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

      gameSetup.isCuemalletInHand = function () {
        return cuemalletInHand;
      };

      gameSetup.strikeCallback = function strikeCallback(force, av, hspin) {
        // if (!isMatch && !isTournament) {
          const newMove = { Type: 'STRIKE', playerUserId: gameSetup.initPlayerInfo.playerUserId, forcex: force.x, forcey: force.y, avx: av.x, avy: av.y, hspin: hspin, targetPocketID: gameSetup.targetPocketID, targetMalletID: gameSetup.targetMalletID };
          // console.log("dddd in strikeCallback to executeStrikeMove " + Date.now());
          gameSetup.executeStrikeMove(newMove);
        // } else {
            // instead of actually striking here, we just update the data channel, and in data channel handler do the actual striking
            // Meteor.call('reportNewGameMove', gameSetup.roomId, initPlayerInfo.playerUserId, force.x, force.y, av.x, av.y, gameSetup.targetPocketID, gameSetup.targetMalletID, (err) => {
            //     if (err) {
            //         console.log('error in reportNewGameMove ');
            //       }
            //   });

          // PoolActions.reportNewGameMove(gameSetup.roomId, initPlayerInfo.playerUserId, force.x, force.y, av.x, av.y, gameSetup.targetPocketID, gameSetup.targetMalletID);
        // }
      };

      /* new method:
        1. calc prob given target mallet and each pocket, pick the best
        2. fine tune angle to maximize pocketing probability
      */

      
      this.allowInput = function () {
        if (gameSetup.gameType == GAME_TYPE.TESTING && !this.inStrike) return true;
        if (gameSetup.gameType == GAME_TYPE.REPLAY) return false;
        if (gameSetup.controller.gameState == RUN_SHOT_STATE) return false;
        if (gameSetup.controller.gameState == PLAN_SHOT_STATE) {
          for (let i=0; i<2; i++) {
            const pi = gameSetup.playerInfo[i];
            if (pi.isLocal && pi.playerType == "Human") {
              return true;
            }
          }
        }
        
        // if (gameSetup.gameType == GAME_TYPE.AUTORUN) return false;
        if (gameSetup.gameOver) return false;
        // if (gameSetup.gameType == GAME_TYPE.TESTING) return false;
        // if (isTesting) { return false; } // in testing mode no manual input! ??
        // return (!inStrike && !inModal && gameSetup.config.localPlayerID == initPlayerInfo.playerUserId);
        // return (!this.inStrike && gameSetup.initPlayerInfo.isLocal);
        return false;
      };


      this.verifyTestResult = () => {
        if (gameSetup.gameType != GAME_TYPE.TESTING) return;
      };

      gameSetup.executeStrikeMove = function (lastMove) {
        // console.log("dddd executeStrikeMove " + JSON.stringify(lastMove));
        //that.toggleAllControls(false);
        gameSetup.controller.disableGUIInputs();

        gameSetup.targetPocketID = lastMove.targetPocketID;
        gameSetup.targetMalletID = lastMove.targetMalletID;
        that.applyStrike(new Victor(lastMove.forcex, lastMove.forcey), new Victor(lastMove.avx, lastMove.avy), lastMove.hspin);
        gameSetup.breakStartTime = -1;
                // console.log("set in strike true");
        gameSetup.allStopped = false;
                // gameSetup.targetMalletID = -1;
                // gameSetup.targetPocketID = -1;
        // gameSetup.targetPocketMark.x = config.tableW * 100;
        // gameSetup.targetPocketMark.y = config.tableW * 100;

        // gameSetup.targetMalletMark.x = config.tableW * 100;
        // gameSetup.targetMalletMark.y = config.tableW * 100;

        // console.log("setting gameSetup.firstMalletTouchedByCuemallet = null;");
        gameSetup.firstMalletTouchedByCuemallet = null;
        gameSetup.firstCushionTouchedByMallet = null;
        gameSetup.someMalletTouchedRailedAfter = false;
        gameSetup.malletsTouchedRails = [];
        gameSetup.newlyPocketedMallets = [];
        gameSetup.firstMalletMark.position.x = 10000;
        gameSetup.firstMalletMark.position.y = 10000;
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
      gameSetup.executeAIWorkerCommand = (pinfo, data) => {
        if (gameSetup.isLocal || gameSetup.isHost) {
          pinfo.isPlanning = false;
          pinfo.nextCommands = data.cmd;
          gameSetup.controller.checkForAllCommands();
        } else {
          let cmdstr = pinfo.ID;
          for (let i=0; i<data.cmd.length; i++) {
            const c = data.cmd[i];
            cmdstr += `_${c.playerID}_${c.kickFrameIndex}_${Math.fround(c.forceX)}_${Math.fround(c.forceY)}`;
          }
          gameSetup.networkHandler.sendCommandToPeerImmediately({
            c: "SUBMIT_COMMAND", t: gameSetup.currentCycleTime, w: cmdstr
          });
        }
        return;

        const shotCmdUser = data.cmd;
        const shotCmdUserRaw = {};
        if (shotCmdUser) {
          shotCmdUserRaw.aimx = shotCmdUser.aimx;
          shotCmdUserRaw.aimy = shotCmdUser.aimy;
          shotCmdUserRaw.strength = shotCmdUser.strength;
        }

        if (shotCmdUser && typeof(shotCmdUser) != "undefined") {
          if (typeof(shotCmdUser.aimx) != "undefined") shotCmdUser.aimx = Math.fround(shotCmdUser.aimx);
          if (typeof(shotCmdUser.aimy) != "undefined") shotCmdUser.aimy = Math.fround(shotCmdUser.aimy);
          if (typeof(shotCmdUser.cuemalletx) != "undefined") shotCmdUser.cuemalletx = Math.fround(shotCmdUser.cuemalletx);
          if (typeof(shotCmdUser.cuemallety) != "undefined") shotCmdUser.cuemallety = Math.fround(shotCmdUser.cuemallety);
          if (typeof(shotCmdUser.strength) != "undefined") shotCmdUser.strength = Math.fround(shotCmdUser.strength);
          if (typeof(shotCmdUser.spin) != "undefined") shotCmdUser.spin = Math.fround(shotCmdUser.spin);
          if (typeof(shotCmdUser.hspin) != "undefined") shotCmdUser.hspin = Math.fround(shotCmdUser.hspin);
        }

        // gameSetup.aimMalletMark.aimCText.text = ""; // aaaa
        // // debugger;
        // gameSetup.aimMalletMark.aimCText.visible = false;

        if (shotCmdUser && typeof(shotCmdUser) != "undefined" && typeof(shotCmdUser.aimx) != "undefined") {
          gameSetup.aimx = 1000000;
          gameSetup.aimy = 1000000;
        }

        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          gameSetup.initPlayerInfo = gameSetup.playerInfo1;
        }

        // const pinfo = gameSetup.playerInfo[data.playerID];
        // if (pinfo != gameSetup.initPlayerInfo) {
        //   // debugger;
        //   console.log("received cmd from non active player");
        //   return;
        // }

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
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_UPDATE_WORLD,
            'world': WorldForPlayer,
            'resolveID': data.resolveID
          });
          // if (gameSetup.gameType == GAME_TYPE.TESTING)
          return;
        } else if (data.cmdType == CMD_GET_SECONDS_LEFT) {
          gameSetup.controller.updateWorld();
          let ss = gameSetup.initPlayerInfo.secondsLeft;
          if (typeof(ss) == "undefined") ss = 10000;
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
            if (data.color == MalletColors.RED) ChooseRedColor();
            if (data.color == MalletColors.YELLOW) ChooseYellowColor();
            if (data.color == MalletColors.BLACK) ChooseBlackColor();
          }
          return;
        } else if (data.cmdType == CMD_SCRIPT_PLACE_BALL_ON_TABLE) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            PlaceMalletOnTable(data.id, data.x, data.y);
            // that.clearForecastLines();
            // that.runSimulation(SIM_DRAW);
          }
          return;
        } else if (data.cmdType == CMD_PLAN_CALLED_SHOT) {
          // debugger;
          if (gameSetup.gameType == GAME_TYPE.TESTING)
            resolvedPlanCallShot[shotCmdUser.rind] = shotCmdUser.maxProb;
          return;
        } else if (data.cmdType == CMD_TAKE_CALLED_SHOT && (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.controller.gameState == CALL_SHOT_STATE)) {

          if (!shotCmdUser) {
            window.testResult = "Test failed: No shot cmd returned by the getCallShot function.";
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


            gameSetup.initPlayerInfo = gameSetup.playerInfo1;

          }
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetMalletID: -1,
            targetPocketID: -1
          };

          // console.log("shotCmdUser " + JSON.stringify(shotCmdUser));

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.max(2, Math.min(100, shotCmdUser.strength));
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = Math.max(-1, Math.min(1, shotCmdUser.spin));
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = Math.max(-30, Math.min(30, shotCmdUser.hspin));
              if (shotCmdUser.targetMalletID) {
              shotCmd.targetMalletID = shotCmdUser.targetMalletID;
              gameSetup.targetMalletID = shotCmdUser.targetMalletID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }
          } else {
            
          }
        } else if (data.cmdType == CMD_TAKE_BREAK_SHOT  && (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.controller.gameState == BREAK_SHOT_STATE)) {
          // gameSetup.aimMalletMark.visible = false; // aaaa to hide aim mark

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

            if (window.testCondition == "TestFinishedAimY35") {
              if (typeof(shotCmdUser.aimy) == "undefined" || shotCmdUser.aimy !== 35) {
                window.testResult = "Test failed: you need to set aimy to 35 in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              }
            }


            if (window.testCondition == "TestFinishedFirstTouchMallet_11_CuemalletXY" || window.testCondition == "TestFinishedFirstTouchMallet_2_CuemalletXY") {
              if (typeof(shotCmdUser.cuemalletx) == "undefined" || typeof(shotCmdUser.cuemallety) == "undefined") {
                window.testResult = "Test failed: you need to specify cuemalletx and cuemallety in the getBreakShot function.";
                gameSetup.showTestResult();
                return;
              } else if (shotCmdUser.cuemalletx != -800) {
                window.testResult = "Test failed: you need to specify cuemalletx as -800.";
                gameSetup.showTestResult();
                return;
              } else if (shotCmdUser.cuemallety != 400) {
                window.testResult = "Test failed: you need to specify cuemallety as 400.";
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


          // gameSetup.initPlayerInfo = gameSetup.playerInfo1; // aaaa testing

          shotCmd = {
            cuemalletx: gameSetup.config.tableCenterX - gameSetup.config.tableW / 4,
            cuemallety: gameSetup.config.tableCenterY,
            aimx: gameSetup.config.tableCenterX + gameSetup.config.tableW / 4,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0
          };
          // translate user inputs if specified
          if (typeof(shotCmdUser.aimx) != "undefined") shotCmd.aimx = gameSetup.config.tableCenterX + shotCmdUser.aimx;
          if (typeof(shotCmdUser.aimy) != "undefined") shotCmd.aimy = gameSetup.config.tableCenterY + shotCmdUser.aimy;
          if (typeof(shotCmdUser.cuemalletx) != "undefined") shotCmd.cuemalletx = gameSetup.config.tableCenterX + shotCmdUser.cuemalletx;
          if (typeof(shotCmdUser.cuemallety) != "undefined") shotCmd.cuemallety = gameSetup.config.tableCenterY + shotCmdUser.cuemallety;
          if (typeof(shotCmdUser.strength) != "undefined") shotCmd.strength = Math.min(100, shotCmdUser.strength);
          if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = Math.max(-1, Math.min(1, shotCmdUser.spin));
          if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = Math.max(-30, Math.min(30, shotCmdUser.hspin));
          // that.clearForecastLines();

          // const strength = shotCmd.strength;
          // const spinMultiplier = 0 - 2.5 * shotCmd.spin;

          const cb = gameSetup.malletsByID[0];
          const cbx = Math.max(Math.min(gameSetup.config.tableCenterX - gameSetup.config.tableW / 4, shotCmd.cuemalletx), gameSetup.config.tableCenterX - gameSetup.config.tableW / 2 + config.cushionBarThick + config.malletD);
          const cby = Math.min(Math.max(gameSetup.config.tableCenterY - gameSetup.config.tableH / 2 + config.cushionBarThick + config.malletD, shotCmd.cuemallety), gameSetup.config.tableCenterY + gameSetup.config.tableH / 2 - config.cushionBarThick - config.malletD);
          // debugger;
          resetMallet(cb, cbx, cby);
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
          const cuemalletPos = (data.cmd == null) ? new Victor(-500, 0) : data.cmd;
          const testtarget = new Victor(cuemalletPos.x + gameSetup.config.tableCenterX, cuemalletPos.y+gameSetup.config.tableCenterY);

          if (window.testCondition == "TestFinishedAnyResult_CueMalletNoOverlap") {
            for (let i = 0; i < gameSetup.mallets.length; i ++) {
              const b = gameSetup.mallets[i];
              if (b.body.inPocketID !== null || b.ID === 0) continue;
              const pos1 = new Victor(b.x, b.y);
              const d = testtarget.distance(pos1);
              if (d <= config.malletD * 0.99999) {
                window.testResult = "Test failed: You cannot place cue mallet on top of another mallet.";
                gameSetup.showTestResult();
                return;
              }
            }
          }

          //if (!gameSetup.isProfessionalUser) {
          //  testtarget.x = 0; testtarget.y = 0;
          //}

          const cb = gameSetup.malletsByID[0];
          cb.body.inPocketID = null;
          cb.inPocket = false;
          // if (!gameSetup.controller.checkIfCollidingMallet(testtarget)) {
          //   resetMallet(cb, testtarget.x, testtarget.y);
          // } else {
          //   // user input is not good, so we just find one place for user
          //   gameSetup.controller.replaceCueMalletNoCollision(cb);
          // }
          gameSetup.controller.planToPlaceCuemallet(testtarget.x, testtarget.y);
          //me.enterState(GameState.CallShot, initPlayerInfo);

          gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
            targetMalletID: 1,
            targetPocketID: 0
          };


          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;
            if (shotCmdUser.targetMalletID) {
              shotCmd.targetMalletID = shotCmdUser.targetMalletID;
              gameSetup.targetMalletID = shotCmdUser.targetMalletID;
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
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
            targetMalletID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            // if (shotCmdUser.spin && gameSetup.difficulty >= ADVANCED) shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;
            if (shotCmdUser.targetMalletID) {
              shotCmd.targetMalletID = shotCmdUser.targetMalletID;
              gameSetup.targetMalletID = shotCmdUser.targetMalletID;
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
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_SCRIPT_CALCULATE_END_STATE,
            'world': WorldForPlayer,
            'endState': endState,
            'resolveID': data.resolveID
          });
          return;
        } else if (data.cmdType == CMD_GET_PROBABILITY) {
          delete window.InitState;
          if (shotCmdUser.targetMalletID == 3 && shotCmdUser.targetPocketID == 5) {
            // debugger;
          }
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetMalletID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;

            if (shotCmdUser.targetMalletID) {
              shotCmd.targetMalletID = shotCmdUser.targetMalletID;
              gameSetup.targetMalletID = shotCmdUser.targetMalletID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            // for test on call probability
            window.probabilityInquiryHistory += `${shotCmdUser.targetMalletID}_${shotCmdUser.targetPocketID};`;
          }
          // console.log("main thread: calc prob " + JSON.stringify(shotCmd));
          const prob = gameSetup.controller.calcProbSync(shotCmd);
          // console.log("main thread: got prob and send back " + prob + " for resolve id " + data.resolveID);
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_PROBABILITY,
            'world': WorldForPlayer,
            'probability': prob,
            'resolveID': data.resolveID
          });
          return;

        } else if (data.cmdType == CMD_GET_PROBABILITY_2) {
          if (shotCmdUser.targetMalletID == 3 && shotCmdUser.targetPocketID == 5) {
            // debugger;
          }
          shotCmd = {
            aimx: gameSetup.config.tableCenterX,
            aimy: gameSetup.config.tableCenterY,
            strength: 30,
            spin: 0,
            hspin: 0,
            targetMalletID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;

            if (shotCmdUser.targetMalletID) {
              shotCmd.targetMalletID = shotCmdUser.targetMalletID;
              gameSetup.targetMalletID = shotCmdUser.targetMalletID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

            // for test on call probability
            window.probabilityInquiryHistory += `${shotCmdUser.targetMalletID}_${shotCmdUser.targetPocketID};`;
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
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
            targetMalletID: 0,
            targetPocketID: 0
          };

          if (shotCmdUser!=null) {
            if (shotCmdUser.aimx) shotCmd.aimx += shotCmdUser.aimx;
            if (shotCmdUser.aimy) shotCmd.aimy += shotCmdUser.aimy;
            if (shotCmdUser.strength) shotCmd.strength = Math.min(100, shotCmdUser.strength);
            if (typeof(shotCmdUser.spin) != "undefined") shotCmd.spin = shotCmdUser.spin;
            if (typeof(shotCmdUser.hspin) != "undefined") shotCmd.hspin = shotCmdUser.hspin;

            if (shotCmdUser.targetMalletID) {
              shotCmd.targetMalletID = shotCmdUser.targetMalletID;
              gameSetup.targetMalletID = shotCmdUser.targetMalletID;
            }
            if (shotCmdUser.targetPocketID >= 0) {
              shotCmd.targetPocketID = shotCmdUser.targetPocketID;
              gameSetup.targetPocketID = shotCmdUser.targetPocketID;
            }

          }
          // console.log("main thread: get first mallet touched " + JSON.stringify(shotCmd));
          const firstMalletTouched = gameSetup.controller.getFirstMalletTouched(shotCmd);
          // console.log("main thread: got first mallet touched and send back " + firstMalletTouched.malletID + " for resolve id " + data.resolveID);
          gameSetup.initPlayerInfo.playerWorker.sendMessage({
            'cmd': CMD_GET_FIRST_BALL_TOUCHED,
            'world': WorldForPlayer,
            'firstMalletTouched': firstMalletTouched,
            'resolveID': data.resolveID
          });
          return;
        }

        if (shotCmd.strength < 2) shotCmd.strength = 2;

        // that.clearCuemalletTrails();

        gameSetup.aimx = shotCmd.aimx;
        gameSetup.aimy = shotCmd.aimy;

        // console.log(`cmd: ${JSON.stringify(shotCmd)}`);
        const strength = shotCmd.strength;
        const spinMultiplier = 0 - 2.5 * shotCmd.spin;
        const hspin = shotCmd.hspin;

        const cb = gameSetup.malletsByID[0];
        const dir = new Victor(shotCmd.aimx - cb.x, shotCmd.aimy - cb.y);
        // console.log("final dir " + JSON.stringify(dir));
        if (!shotCmdUser) {
          // debugger;
        }
        if (0 && dir.length() < 0.001 && shotCmdUser.targetMalletID > 0) {
          const targetMallet = gameSetup.malletsByID[shotCmdUser.targetMalletID];
          // const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);
          dir.x = targetMallet.position.x - cb.x;
          dir.y = targetMallet.position.y - cb.y;
        }

        // that.setMeterByValue(config.speedMeterCfg, strength, gameSetup.timerMallet1);
        // that.setMeterByValue(config.spinMeterCfg, shotCmd.spin, gameSetup.timerMallet2);
        if (gameSetup.timerMallet1) {
          gameSetup.timerMallet1.setPositionByValue(shotCmd.strength);
          gameSetup.timerMallet2.setPositionByValue(shotCmd.spin);
          gameSetup.timerMallet3.setPositionByValue(shotCmd.hspin);
        }
        // that.setMeterByValueNew(shotCmd.spin, gameSetup.timerMallet2);
        // console.log("setting cuemalletDirection to dir " + JSON.stringify(dir));
        gameSetup.cuemalletDirection = dir.clone();

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
          if (shotCmd.targetMalletID) {
            gameSetup.targetMalletID = shotCmd.targetMalletID;
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
        that.clearForecastLines();
        delete window.waitForAllStopResolveID;
        window.probabilityInquiryHistory = "";
        window.calcEndStateCount = 0;
        window.calcEndStateCountRandom = 0;
        window.plottedBasicColumn = false;
        window.plottedBasicScatterMalletDistanceProbability = false;
        window.plottedBasicScatterCutAngleProbability = false;
        window.savedDataLinearRegression = false;
        window.trainLinearModelX = [];
        //$("#chartcontainer").hide();
        gameSetup.controller.updateWorld();
        // const shotCmdUser = gameSetup.initPlayerInfo.playerAI.getBreakShot();
        gameSetup.initPlayerInfo.playerWorker.sendMessage({
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


      const PlaceMalletOnTable = function (malletID, x, y) {
        const b = gameSetup.malletsByID[malletID];
        const xbound = (config.tableW - 2 * config.cushionBarThick - config.malletD);
        const ybound = (config.tableH - 2 * config.cushionBarThick - config.malletD);
        if (x > xbound) x = xbound;
        if (x < 0 - xbound) x = 0 - xbound;
        if (y > ybound) y = ybound;
        if (y < 0 - ybound) y = 0 - ybound;
                // resetMallet(b, x * (config.tableW - 2 * config.cushionBarThick - config.malletD) + config.tableCenterX, y * (config.tableH- 2 * config.cushionBarThick - config.malletD) + config.tableCenterY);
        resetMallet(b, x  + config.tableCenterX, y  + config.tableCenterY);
      };


      const PlaceCueMalletFromHand = function() {
        // debugger;
        gameSetup.controller.setinitPlayerInfo(`${0}_${CUEBALL_IN_HAND}_-1_-100000_-100000`);
        // gameSetup.controller.updateWorld();
        // const b = gameSetup.malletsByID[0];
        // gameSetup.playerInfo1.playerAI.getCueMalletPlacement();
        // PlaceMalletOnTable(0, pos.x, pos.y);
      };

      const setSecondsLeft = (s) => {
        gameSetup.playerInfo1.secondsLeft = s;
        gameSetup.playerInfo2.secondsLeft = s;
      };

      const ChooseRedColor = function () {
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = MalletColors.RED;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = MalletColors.YELLOW;
        gameSetup.playerInfo1.chosenColor = MalletColors.RED;
        gameSetup.playerInfo2.chosenColor = MalletColors.YELLOW;
        gameSetup.playerInfo1.legalColor = MalletColors.RED;
        gameSetup.playerInfo2.legalColor = MalletColors.YELLOW;
      };
      const ChooseYellowColor = function () {
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = MalletColors.YELLOW;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = MalletColors.RED;
        gameSetup.playerInfo1.chosenColor = MalletColors.YELLOW;
        gameSetup.playerInfo2.chosenColor = MalletColors.RED;
        gameSetup.playerInfo1.legalColor = MalletColors.YELLOW;
        gameSetup.playerInfo2.legalColor = MalletColors.RED;
      };
      const ChooseBlackColor = function () {
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo1.ID].chosenColor = MalletColors.BLACK;
        WorldForPlayer.PlayerInfo[gameSetup.playerInfo2.ID].chosenColor = MalletColors.BLACK;
        gameSetup.playerInfo1.chosenColor = MalletColors.BLACK;
        gameSetup.playerInfo2.chosenColor = MalletColors.BLACK;
        gameSetup.playerInfo1.legalColor = MalletColors.BLACK;
        gameSetup.playerInfo2.legalColor = MalletColors.BLACK;
      };


      //TODO: game test scenario setup api


      const SetCandidateMallets = (list) => {
        WorldForPlayer.CandidateMalletListOverwrite = list;
        // WorldForPlayer.CandidateMalletList2[0] = list;
        // WorldForPlayer.CandidateMalletList2[1] = list;
      };

      const TakeBreakShot = function () {
        //me.enterState(GameState.BreakShot, gameSetup.playerInfo1);
        gameSetup.controller.setinitPlayerInfo(`${0}_${BREAK_SHOT_STATE}_-1_-100000_-100000`);
      };

      const TakeCallShot = function () {
        //me.enterState(GameState.BreakShot, gameSetup.playerInfo1);
        gameSetup.controller.setinitPlayerInfo(`${0}_${CALL_SHOT_STATE}_-1_-100000_-100000`);
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
          gameSetup.initPlayerInfo = gameSetup.playerInfo1;
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

      function getMalletInfo(malletID) {
        const b = malletbodies[malletID];
        if (b.inPocketID == null) {
          return {i: malletID, p: -1, x: b.position[0] - gameSetup.config.tableCenterX, y: b.position[1] - gameSetup.config.tableCenterY};
        } else {
          return {i: malletID, p: b.inPocketID};
        }
      }

      function getAllMalletInfo() {
        const allIDs = Object.keys(malletbodies);
        const allInfo = [];
        for (let j=0; j<allIDs.length; j++) {
          const i = allIDs[j];
          allInfo.push(getMalletInfo(i));
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

      

    };

    gameSetup.controller = new GameController();
    window.gameController = gameSetup.controller;


  }; // GameController



  this.drawPocketingStar = () => { // SoccerGame
    
    const cfg = gameSetup.config;

    const short = cfg.malletD / 3;
    const long = cfg.malletD * 8;


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

  this.showPocketingStar = (x, y) => { // SoccerGame
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
  };

  this.toggleAllControls = (enabled) => { // SoccerGame
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



  this.setupGameRoom = function () { // SoccerGame

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
      // Assets.getText('/RobotWorker/DodgeMalletPlayerWorker.js', (workerCodeTemplat) => {

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
              gameSetup.executeAIWorkerCommand(pinfo, e.data);
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
    textures.push(`/images/hitbtn.png`);
    textures.push(`/images/replaybtn.png`);
    textures.push(`/images/exitbtn.png`);
    textures.push(`/images/modalmessagebg.png`);
    textures.push(`/images/okbtn.png`);
    textures.push(`/images/quitbtn.png`);
    textures.push(`/images/submitbtn.png`);
    textures.push(`/images/staybtn.png`);
    textures.push(`/images/exitwarning.png`);
    textures.push(`/images/redbackground.png`);
    textures.push(`/images/yellowarrow.png`);
    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      textures.push(`/images/controlsandrulessmall.png`);
    } else {
      textures.push(`/images/controlsandrules.png`);
    }
    // textures.push(`/images/nametaggrey.png`);
    textures.push(`/images/bluebackgroundsoccer10.jpg`);
    textures.push(`/images/bluecrystallmallet.png`);
    textures.push(`/images/redbutton2.png`);
    textures.push(`/images/bluebutton2.png`);

    textures.push(`/images/chooseChipToKick6.png`);
    


    // const soccerFieldBig = _.get(gameSetup, 'soccerField.imageSrc.main', '/images/diamondpoolbig.png');
    // const soccerFieldSmall = _.get(gameSetup, 'soccerField.imageSrc.small', '/images/diamondpoolsmall.png');
    // const soccerFieldBig = "/images/soccerfield4.jpg";
    // const soccerFieldSmall = "/images/soccerfield4.jpg";
    // if (gameSetup.gameType == GAME_TYPE.TESTING) {
    //   textures.push(soccerFieldSmall);
    // } else if (gameSetup.gameType == GAME_TYPE.REPLAY) {
    //   textures.push("/images/Lightning_Night_Small.png");
    // } else
    //   textures.push(soccerFieldBig);

    textures.push("/images/bluemallet254.png");
    textures.push("/images/redmallet254.png");
    textures.push("/images/soccer1.png");
      // textures.push('/images/wood-vs-sign.png');
    textures.push('/images/robot1.png');
    textures.push('/images/human1.png');
    // textures.push('/images/gowhite.png');
    // textures.push('/images/adjustwhite.png');
    // textures.push('/images/cwmetal3.png');
    // textures.push('/images/ccwmetal3.png');
    textures.push('/images/cwblue.png');
    textures.push('/images/ccwblue.png');
    textures.push('/images/helpquestionmark.png');
    // textures.push('/images/SliderSlot1Speed8NoWord.png');
    // textures.push('/images/TGameLogoHead.png');
    textures.push('/images/tboticon.png');
    textures.push('/images/tbotmessagebackground2.png');
    textures.push('/images/userRobotChat.jpg');
    // textures.push('/images/sliderknob1.png');
    // textures.push('/images/SliderSlot1SpinNoWord.png');
    // textures.push('/images/crossVcue2Small.png');
    // textures.push('/images/backarrowlight.png');
    // textures.push('/images/NewNameTagBlank2.png');
    // textures.push('/images/NewNameTagBlankRed2.png');
    // textures.push('/images/NewNameTagBlankWhite2.png');
    // textures.push('/images/NewNameTagBlankYellow2.png');
    // textures.push('/images/strikebutton2.png');

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
      if (!PIXI.loader.resources["/images/bluebackgroundsoccer10.jpg"]) {
        // loading of game screen cancelled?
        console.log("do not have blue background soccer 1 yet");
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

      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.AUTORUN  || gameSetup.gameType == GAME_TYPE.REPLAY ) {
        // gameSetup.allInitialized = true;
        if (gameSetup.gameType == GAME_TYPE.REPLAY) {
          window.replayControl.setGameEngineReady();
        }
        gameSetup.controller.tryStartGame();
      } else {
        // gameSetup.controller.disableGUIInputs();
        console.log("reportEnteringGameRoom " + gameSetup.room._id + " gameSetup.localPlayerID " + gameSetup.localPlayerID);
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
    // this.createMalletRenderer();
    this.addBackGround();
    this.addGoalAreas();
    gameSetup.createMaterials();
    gameSetup.addMateirals();
    // this.addTableImage();
    this.addBorders(gameSetup.world);
    // this.drawPockets();
    // this.testDrawPockets();
    // this.addPocketLabel();
    // this.drawTableCushionBars();
    // this.drawTargetMallet();
    // this.drawTargetPocket();
    this.addMallets();
    this.setupKickKnobHandlers();
    this.addSoccer();
    // gameSetup.addMallets = this.addMallets.bind(this);


    // this.addPoolStick();
    // if (gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.TOURNAMENT ) {
    //   this.addOpponentPoolStick();
    // }


    // this.drawFirstMallet();

    

    // this.addWinnerMessage();
    // this.drawAimMallet();
    // this.setupAimingHandler();

    // this.drawPocketingStar();

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

          const cleanTestSetupCode = getCleanTestCode(gameSetup.testSetupCode);
          // const p = gameSetup.testSetupCode.split("\n");
          // for (let k=0; k<p.length; k++) {
          //   if (p[k].indexOf("ResetTable") >= 0) {
          //     cleanTestSetupCode += `${p[k]}\n`;
          //   }
          //   if (p[k].indexOf("PlaceMalletOnTable") >= 0) {
          //     const q = p[k].replace("PlaceMalletOnTable","").split(/[\s,\(\)]+/);
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

  this.loadFramedSpriteSheet = function(textureUrl, textureName, frameWidth, frameHeight, cb) {
    // PIXI.loader.add(textureUrl).load(() => {
      const frames = [];
      // console.log("to load " + textureUrl);
      const texture = PIXI.loader.resources[textureUrl].texture.baseTexture;
      // const cols = Math.floor(texture.width / frameWidth);
      // const rows = Math.floor(texture.height / frameHeight);
      const cols = 36;
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


  gameSetup.reAddMalletBodies = (clearTable = false, IgnoreCueMallet = false) => {
    const ids = Object.keys(gameSetup.malletsByID);
    for (let k=0; k<ids.length; k++) {
      const mallet = gameSetup.malletsByID[ids[k]];
      if (IgnoreCueMallet && ids[k] == 0) {
        gameSetup.addOneMalletBody(mallet, clearTable, false);
      } else {
        gameSetup.addOneMalletBody(mallet, clearTable, true);
      }
    }
  };

  gameSetup.addOneMalletBody = (mallet, clearTable = false, resetMalletPos = true) => {
    const config = gameSetup.config;
    let x = mallet.origX;
    let y = mallet.origY;
    if (clearTable) {
      x = x * 10000;
      y = y * 10000;
    } else if (!resetMalletPos) {
      x = mallet.position.x;
      y = mallet.position.y;
    }
    mallet.body = that.addMalletBody(world, config.malletD/2, x, y);
    mallet.body.colorType = mallet.colorType;

    mallet.position.x = mallet.body.position[0];
    mallet.position.y = mallet.body.position[1];

  // const bodyIndex = world.bodies.length - 1;
    // world.bodies[bodyIndex].bodyIndex = bodyIndex;
    mallet.body.ID = mallet.ID;
    mallet.body.mallet = mallet;
    malletbodies[mallet.ID] = mallet.body;

    mallet.body2 = that.addMalletBody(world2, config.malletD/2, x, y);
    mallet.body2.colorType = mallet.colorType;
    mallet.body2.isSim = true;
    mallet.body2.ID = mallet.ID;
    malletbodies2[mallet.ID] = mallet.body2;
    mallet.body2.mallet = mallet;
    mallet.body2.position[0] = -10000;
    mallet.body2.position[1] = -10000;

    mallet.body.isStopped = false;
    mallet.body2.isStopped = false;

    mallet.body.av = new Victor(0, 0);
    mallet.body2.av = new Victor(0, 0);

    mallet.body.malletIDLabel = mallet.malletIDLabel;
  };

  

  
  

  this.addSoccer = () => {
    const config = gameSetup.config;

    const soccer = new PIXI.Sprite(PIXI.loader.resources[`/images/soccer1.png`].texture);

    soccer.scale.set(config.soccerD / 150);

    soccer.oldp = new Victor(config.tableCenterX - 300 , config.tableCenterY );
    soccer.oldp.x = Math.fround(soccer.oldp.x);
    soccer.oldp.y = Math.fround(soccer.oldp.y);
    soccer.nextPos = new Victor(config.tableCenterX, config.tableCenterY);

    soccer.position.x = soccer.oldp.x;
    soccer.position.y = soccer.oldp.y;
    soccer.anchor.x = 0.5;
    soccer.anchor.y = 0.5;

    gameSetup.stage.addChild(soccer);
    soccer.inputEnabled = false;
    gameSetup.soccer = soccer;

    // soccer.shadow = shadow;
    soccer.origX = soccer.oldp.x;
    soccer.origY = soccer.oldp.y;

    const soccerShape = new p2.Circle({ radius: config.soccerD / 2, material: gameSetup.soccerMaterial });
    const bodyConfig = {
      mass:0.5,
      position:[config.tableCenterX - 300, config.tableCenterY],
      damping: 0.95, // controls when speed is large how it slows down
      angularDamping: 0,
      fixedRotation: true,
      angularVelocity:0,
      velocity: [0, 0]
    };
    const b = new p2.Body(bodyConfig);
    b.name = "soccer";
    b.av = new Victor(0, 0);
    b.addShape(soccerShape);
    gameSetup.world.addBody(b);
    soccer.body = b;
    b.ID = "soccerb";

    const soccerShape2 = new p2.Circle({ radius: config.soccerD / 2, material: gameSetup.soccerMaterial });
    const b2 = new p2.Body(bodyConfig);
    b2.name = "soccer";
    b2.addShape(soccerShape2);
    gameSetup.world2.addBody(b2);
    b2.trail = [];
    soccer.body2 = b2;
    b2.ID = "soccer";

  };


  
  // this.drawKickKnob = (m) => {
  //   const config = gameSetup.config;
  //       // new new way: draw a green table top graphics
  //   // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

  //   const g = new PIXI.Graphics();
  //   g.position.x = m.position.x - 0.8 * config.malletD;
  //   g.position.y = m.position.y;

  //   g.lineStyle(0, 0xffffff, 1); // 0x66b3ff, 0.8);
  //   g.beginFill(0xffff00, 1); // white target
  //   g.drawCircle(0, 0, config.malletD * 0.3 );
  //   g.endFill();
  //   g.name = "kickknob" + m.ID;
  //   m.kickKnob = g;
  //   g.mallet = m;
  //   gameSetup.stage.addChild(g);


  //   g.kickLineG = new PIXI.Graphics();
  //   g.kickLineG.lineStyle(5, 0xffff00, 1); // 0x66b3ff, 0.8);
  //   gameSetup.stage.addChild(g.kickLineG);
  //   // m.addChild(g);
  // };

  

  
  this.addMallet = (userID, x, y, ID) => {
    const config = gameSetup.config;

    let malletfile = 'red';
    let color = MalletColors.BLUE;
    if (userID == 1) {
      color = MalletColors.RED;
    }
    switch (color) {
      case MalletColors.RED: malletfile = 'red'; break;
      case MalletColors.BLUE: malletfile = 'blue'; break;
    }

    let malletcolor = 255 * 256 * 256 + 255 * 256 + 255;
    switch (color) {
      case MalletColors.RED: malletcolor = 239 * 256 * 256 + 121 * 256 + 1155; break;
      case MalletColors.BLUE: malletcolor = 143 * 256 * 256 + 180 * 256 + 239; break;
    }
    
    const mallet = new PIXI.Sprite(PIXI.loader.resources[`/images/${malletfile}button2.png`].texture);

    mallet.scale.set(config.malletD / 150);

    mallet.oldp = new Victor(config.tableCenterX + x, config.tableCenterY + y);
    mallet.oldp.x = Math.fround(mallet.oldp.x);
    mallet.oldp.y = Math.fround(mallet.oldp.y);
    mallet.nextPos = new Victor(config.tableCenterX + x, config.tableCenterY + y);

    mallet.position.x = mallet.oldp.x;
    mallet.position.y = mallet.oldp.y;
    mallet.anchor.x = 0.5;
    mallet.anchor.y = 0.5;

    gameSetup.stage.addChild(mallet);

    //this.drawKickKnob(mallet);

    //mallet.rotation = (Math.random() * Math.PI * 2);
    mallet.fixedRotation = true;
    // mallet.currentFrame = malletframe;
    // mallet.framerate = -1;
    // mallet.angle = Math.random() * 360;
    // mallet.rotation = Math.random() * 360;
    // mallet.scale.set(config.malletD / 41);

    mallet.ID = ID; 
    mallet.userID = userID;
    mallet.color = malletcolor;
    mallet.colorType = color;

    mallet.inputEnabled = false;

    // mallet.shadow = shadow;
    mallet.origX = mallet.oldp.x;
    mallet.origY = mallet.oldp.y;


    gameSetup.addOneMalletBody(mallet, false, true);

    mallet.name = "mallet" + ID;
    gameSetup.mallets.push(mallet);
    gameSetup.malletsByID[ID] = mallet;

    const malletIDLabelStyle = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 85,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 3,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 0,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    // if (mallet.colorType == MalletColors.BLUE) {
    //   malletIDLabelStyle.fill = '#0000ff';
    // } else if (mallet.colorType == MalletColors.RED) {
    //   malletIDLabelStyle.fill = '#ff0000';
    // }
    const label = new PIXI.Text(mallet.ID, malletIDLabelStyle);
    label.position.x = 0;
    label.position.y = 0;
    label.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(label);
    mallet.addChild(label);
    mallet.malletIDLabel = label;
    mallet.body.malletIDLabel = label;
  };

  this.addMallets = () => {

    this.mallets = []; // this.add.physicsGroup(Phaser.Physics.P2JS);
    gameSetup.malletsByID = {};
    gameSetup.mallets = this.mallets;

    const config = gameSetup.config;

    for (let userID = 0; userID <=1; userID ++) {
      for (let id=0; id<config.MALLET_COUNT; id++) {
        let x = - config.tableW / 4;
        if (userID == 1) {
          x = config.tableW / 4;
        }
        let y = 0 + (id) * config.tableH / 8 - config.malletD / 2;
        if (id == 0) {
          y = 0 - (id+4) * config.tableH / 8 + config.malletD / 2;
        }

        this.addMallet(userID, x, y, id);
      }
    }

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
    const cueStick = _.get(gameSetup, 'opponentMainItems.imageSrc.main', '/images/diamondstick.png');
    const s = new PIXI.Sprite(PIXI.loader.resources[cueStick].texture);
    s.scale.set(1.2 * config.tableH / 800, 1.2 * config.tableH / 800); // will overflow on bottom
    // s.position.x = config.tableCenterX;
    // s.position.y = config.tableCenterY;
    gameSetup.stage.addChild(gameSetup.cuestickOpponentcontainer);
    gameSetup.cuestickOpponentcontainer.addChild(s);
    gameSetup.cuestickOpponent = s;


    s.position.x = 0;
    s.position.y = 0;
    s.anchor.set(0.5, 0);

    gameSetup.cuestickOpponentcontainer.position.x = gameSetup.cuemallet.position.x - 100000;
    gameSetup.cuestickOpponentcontainer.position.y = gameSetup.cuemallet.position.y;
    gameSetup.cuestickOpponentcontainer.pivot.x = 0;
    gameSetup.cuestickOpponentcontainer.pivot.y = 0;
    gameSetup.cuestickOpponentcontainer.rotation = 0/180 * Math.PI;
  }

  this.addPoolStick = () => {
    const config = gameSetup.config;

    gameSetup.cuestickyourcontainer = new PIXI.Container();
    let cueStick = _.get(gameSetup, 'mainItems.imageSrc.main', '/images/diamondstick.png');
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

    gameSetup.cuestickyourcontainer.position.x = gameSetup.cuemallet.position.x - 100000;
    gameSetup.cuestickyourcontainer.position.y = gameSetup.cuemallet.position.y;
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
        // gameSetup.placeMalletSpeedY = -1;
      } else {
        if (e.deltaY * prevDeltaY > 0 ) {
          // no sound if same dir
        } else {
          gameSetup.playMagicSound();
        }
        prevDeltaY = e.deltaY;

        gameSetup.emitter.updateOwnerPos(gameSetup.timerMallet1.position.x, gameSetup.timerMallet1.position.y);
        gameSetup.emitter.emit = true;

        let acc = 1;
        if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.CTRL)) {
          acc = 10;
        }
        if (e.deltaY > 0) acc *= -1;

        gameSetup.timerMallet1.value += 1 * 0.25 * acc;
        if (gameSetup.timerMallet1.value >= 100) gameSetup.timerMallet1.value = 100;
        if (gameSetup.timerMallet1.value <= 2) gameSetup.timerMallet1.value = 2;
        gameSetup.timerMallet1.setPositionByValue(gameSetup.timerMallet1.value);
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
        // gameSetup.controller.onSubmitButtonClick();
      } else {
        let dir = 1;
        if (PIXI.keyboardManager.isDown(PIXI.keyboard.Key.SHIFT)) {
          dir = -1;
        }
        gameSetup.nextAutoTarget(dir);
      }
    };

    enterkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.initPlayerInfo.playerType == "AI") return;

      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        gameSetup.controller.onSubmitButtonClick();
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
        gameSetup.placeMalletSpeedX = -1;
      } else {
        gameSetup.turnChangeSpeed = 1;
        gameSetup.playMagicSound();
      }

    };

    left.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.turnChangeSpeed = 0;
      gameSetup.placeMalletSpeedX = 0;
    };


    //Right
    right.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // ? move cue mallet??
        gameSetup.placeMalletSpeedX = 1;
      } else {
        gameSetup.turnChangeSpeed = -1;
        gameSetup.playMagicSound();
      }
    };
    right.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.turnChangeSpeed = 0;
      gameSetup.placeMalletSpeedX = 0;
    };

    //Up
    up.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // ? move cue mallet??
        gameSetup.placeMalletSpeedY = -1;
      } else {
        gameSetup.strengthChangeSpeed = 1;
        gameSetup.playMagicSound();
      }
    };
    up.release = () => {
      gameSetup.strengthChangeSpeed = 0;
      gameSetup.placeMalletSpeedY = 0;
    };

    //Down
    down.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      if (gameSetup.controller.gameState == BREAK_CUEBALL_IN_HAND_STATE || gameSetup.controller.gameState == CUEBALL_IN_HAND) {
        // ? move cue mallet??
        gameSetup.placeMalletSpeedY = 1;
      } else {
        gameSetup.config.hideMessage();
        gameSetup.strengthChangeSpeed = -1;
        gameSetup.playMagicSound();
      }
    };
    down.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.strengthChangeSpeed = 0;
      gameSetup.placeMalletSpeedY = 0;
    };

    // vspin using w and s

    akey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      gameSetup.spinChangeSpeed = 1;
      gameSetup.playMagicSound();
    };

    akey.release = () => {
      gameSetup.spinChangeSpeed = 0;
    };

    skey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      gameSetup.spinChangeSpeed = -1;
      gameSetup.playMagicSound();
    };

    skey.release = () => {
      gameSetup.spinChangeSpeed = 0;
    };


    // hspin using a and d

    zkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.config.hideMessage();
      gameSetup.hspinChangeSpeed = 1;
      gameSetup.playMagicSound();
    };

    zkey.release = () => {
      if (gameSetup.gameType == GAME_TYPE.AUTORUN) return;
      gameSetup.hspinChangeSpeed = 0;
    };

    xkey.press = () => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      gameSetup.config.hideMessage();
      gameSetup.hspinChangeSpeed = -1;
      gameSetup.playMagicSound();
    };

    xkey.release = () => {
      gameSetup.hspinChangeSpeed = 0;
    };


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





  
  this.addTimerMalletSelectorPanel = () => {
    const config = gameSetup.config;
    gameSetup.timerSelectorMallets = [];

    const space = 320 / (config.MALLET_COUNT - 1);

    // game over message background
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/chooseChipToKick6.png"].texture);
    let ratio = (config.tableW * 0.5) / 427;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = -100000;
    bg2.position.y = -100000;
    // bg2.zOrder = 10;
    bg2.anchor.set(1, 0);
    bg2.interactive = true;
    bg2.visible = false;
    gameSetup.stage.addChild(bg2);

    let currentSlot = null;

    const chooseChip = (event) => {
      currentSlot.chooseID(currentSlot, event.target.ID);
      gameSetup.hideChipChooser();
    };

    gameSetup.chooserMallets = [];

    const malletIDLabelStyle = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 85,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 3,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 0,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const xbase = -375; const ybase = 145;
    for (let k=0; k<config.MALLET_COUNT; k++) {
      const mallet = new PIXI.Sprite(PIXI.loader.resources["/images/bluebutton2.png"].texture);

      let ratio = (config.TrueWidth * 0.01) / 150;
      mallet.scale.set(ratio, ratio); 
  
      mallet.position.x = xbase + k * space;
      mallet.position.y = ybase;
      mallet.anchor.set(0.5, 0.5);
      mallet.name = "choosermallet"+k;
      mallet.ID = k;
      const label = new PIXI.Text(mallet.ID, malletIDLabelStyle);
      label.position.x = 0;
      label.position.y = 0;
      label.anchor.set(0.5, 0.5);
      gameSetup.stage.addChild(label);
      mallet.addChild(label);
      mallet.buttonMode = true;
      mallet.interactive = true;
      

      mallet.on('pointerdown', chooseChip);

      gameSetup.chooserMallets.push(mallet);
      gameSetup.stage.addChild(mallet);
      bg2.addChild(mallet);
    }    

    bg2.on('pointerdown', gameSetup.hideChipChooser);

    gameSetup.showChipChooser = (event) => {
      if (!gameSetup.controller.allowInput()) return;
      currentSlot = event.target;
      bg2.visible = true;
      bg2.position.x = currentSlot.x - 2;
      bg2.position.y = currentSlot.y + 32;
    };
    gameSetup.hideChipChooser = () => {
      currentSlot = null;
      bg2.visible = false;
      bg2.position.x = -10000;
      bg2.position.y = -10000;
    };

    for (let k=0; k<config.MOVE_COUNT; k++) {
      const mallet = gameSetup.timerMallets[k];
      
      mallet.on('pointerdown', gameSetup.showChipChooser);
    }

    // const replayBtnHandler = () => {
    //   gameSetup.hideModalMessage();
    //   // gameSetup.exitGame();
    //   gameSetup.networkHandler.sendCommandToAll({ c: "RestartGame", t: gameSetup.currentCycleTime, w: ``});
    //   // restart game
    // };
    // replaybtn.on('pointerdown', replayBtnHandler);
  };

  this.addTimerMallets = () => {
    const config = gameSetup.config;
    gameSetup.timerMallets = [];

    // const xbase = config.xbase; //2185;
    // const ybase = config.ybase;

    const space = 320 / (config.MOVE_COUNT - 1);

    const malletIDLabelStyle = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 85,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffff00'],
      stroke: '#ffff00',
      strokeThickness: 3,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 0,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    const malletIDLabelStyle2 = new PIXI.TextStyle({
      fontFamily:  "\"Droid Sans\", sans-serif",
      fontSize: 85,
      fontStyle: '',
      fontWeight: '',
      fill: ['#ffffff'],
      stroke: '#ffffff',
      strokeThickness: 3,
      dropShadow: false,
      dropShadowColor: '#000000',
      dropShadowBlur: 0,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 2,
      wordWrap: false,
      wordWrapWidth: 440
    });

    // each timer mallet starts with "?" and then become 0 to 4
    // it also has a timerKnob below it, a timlingLineG below it, 
    // a kickTargetImage along the target mallet's moving path,
    // a kickKnob around the kickTargetImage

    for (let k=0; k<config.MOVE_COUNT; k++) {
      const mallet = new PIXI.Sprite(PIXI.loader.resources["/images/bluebutton2.png"].texture);

      let ratio = (config.TrueWidth * 0.02) / 150;
      mallet.scale.set(ratio, ratio); 
  
      mallet.position.x = config.xbase + k * space;
      mallet.position.y = config.ybase - 78;
      mallet.anchor.set(0.5, 0.5);
      mallet.name = "timermallet"+k;
      // this.addKnob(bg2, -1, 1, 0, config.TrueHeight - config.TrueHeight * 0.514, config.TrueHeight - config.TrueHeight * 0.828, -1, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
      // bg2.valueLow = 10000; // 10 seconds
      // bg2.valueHigh = 0;
  

      // if (mallet.colorType == MalletColors.BLUE) {
      //   malletIDLabelStyle.fill = '#0000ff';
      // } else if (mallet.colorType == MalletColors.RED) {
      //   malletIDLabelStyle.fill = '#ff0000';
      // }

      mallet.chosenMalletID = -1; // which mallet does this move apply to
      mallet.ID = k; // move id, different from mallet's ID!!
      const label = new PIXI.Text("?", malletIDLabelStyle);
      mallet.label = label;
      label.position.x = 0;
      label.position.y = 0;
      label.anchor.set(0.5, 0.5);
      gameSetup.stage.addChild(label);
      mallet.addChild(label);
      mallet.buttonMode = true;
      mallet.interactive = true;



      // draw timerKnob on timeline
      const g = new PIXI.Graphics();
      g.position.x = mallet.position.x;
      g.position.y = mallet.position.y + 78;

      
      g.lineStyle(0, 0xffffff, 1); // 0x66b3ff, 0.8);
      g.beginFill(KnobColors[k], 1); // 
      g.drawCircle(0, 0, config.malletD * 0.5 );
      g.endFill();
      g.name = "timerknob" + mallet.ID;
      // g.zIndex = 50;
      g.visible = false;
      mallet.timerKnob = g;
      g.mallet = mallet;

      g.timingLineG = new PIXI.Graphics();
      const linecolor = 143 * 256 * 256 + 180 * 256 + 239;
      g.timingLineG.lineStyle(5, linecolor, 1); // 0x66b3ff, 0.8);
      g.timingLineG.moveTo(g.position.x, config.ybase);
      g.timingLineG.lineTo(g.position.x, config.ymax);
      gameSetup.stage.addChild(g.timingLineG);
      gameSetup.stage.addChild(g);
      //g.addChild(g.timingLineG);


      // draw kickKnob and kickTarget and kikLine and hide them for now
      if (1) {
        const g = new PIXI.Graphics();
        g.position.x = -10000;//m.position.x - 0.8 * config.malletD;
        g.position.y = -10000;//m.position.y;
    
        g.lineStyle(0, 0xffffff, 1); // 0x66b3ff, 0.8);
        g.beginFill(KnobColors[k], 1); // white target
        g.drawCircle(0, 0, config.malletD * 0.3 );
        g.endFill();
        g.name = "kickknob" + mallet.ID;
        mallet.kickKnob = g;
        g.mallet = mallet;
        gameSetup.stage.addChild(g);
        g.visible = false;
    
    
        g.kickLineG = new PIXI.Graphics();
        g.kickLineG.lineStyle(5, KnobColors[k], 1); // 0x66b3ff, 0.8);
        gameSetup.stage.addChild(g.kickLineG);
  

        const g2 = new PIXI.Graphics();
        g2.position.x = -10000; //mallet.position.x;
        g2.position.y = -10000; //mallet.position.y + 78;

        
        g2.lineStyle(0, 0xffffff, 1); // 0x66b3ff, 0.8);
        g2.beginFill(KnobColors[k], 0.5); // 
        g2.drawCircle(0, 0, config.malletD * 0.5 );
        g2.endFill();
        g2.name = "kicktarget" + mallet.ID;
        // g.zIndex = 50;
        g2.visible = false;
        mallet.kickTarget = g2;
        g2.mallet = mallet;
        gameSetup.stage.addChild(g2);
  
      }



      mallet.chooseID = (me, id) => {
        me.label.setText(id);
        //me.label.style = malletIDLabelStyle2;
        me.label.style.fill = 0xffffff;
        me.chosenMalletID = id;
        me.timerKnob.visible = true;
        me.kickingStrength = 0;

        let mid = id;
        for (let i=0; i<2; i++) {
          const pi = gameSetup.playerInfo[i];
          if (pi.isLocal && pi.playerType == "Human") {
            mid = id + i * 5;
            break;
          }
        }
        const mallet = gameSetup.mallets[mid];
        me.kickTarget.visible = true;
        me.kickTarget.position.x = mallet.position.x;
        me.kickTarget.position.y = mallet.position.y;
        me.kickKnob.visible = true;
        me.kickKnob.position.x = mallet.position.x + 0.8 * config.malletD * Math.cos(me.ID * Math.PI / 3);
        me.kickKnob.position.y = mallet.position.y + 0.8 * config.malletD * Math.sin(me.ID * Math.PI / 3);

        gameSetup.updateKickLine(me.kickKnob);
      };
      

      gameSetup.timerMallets.push(mallet);
      gameSetup.stage.addChild(mallet);
    }
  };

  this.addVSpinMalletNew = () => {
    const config = gameSetup.config;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/greencrystallmallet.png"].texture);


    let ratio = (config.TrueWidth * 0.03) / 100;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = (config.TrueWidth * 0.06) / 100;
    }
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.256;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "vspinmallet";
    this.addKnob(bg2, -1, 1, 0, config.TrueHeight - config.TrueHeight * 0.514, config.TrueHeight - config.TrueHeight * 0.828, -1, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    bg2.valueLow = -1;
    bg2.valueHigh = 1;

    gameSetup.greenCrystall = bg2;
    gameSetup.timerMallet2 = bg2;
    gameSetup.stage.addChild(bg2);
  };

  this.addHSpinMalletNew = () => {
    const config = gameSetup.config;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/yellowcrystallmallet.png"].texture);

    let ratio = (config.TrueWidth * 0.03) / 100;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = (config.TrueWidth * 0.06) / 100;
    }
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.255;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.144;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "hspinmallet";
    gameSetup.yellowCrystall = bg2;
    this.addKnob(bg2, -30, 30, 0, config.TrueHeight - config.TrueHeight * 0.073, config.TrueHeight - config.TrueHeight * 0.379, -30, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    bg2.valueLow = -30;
    bg2.valueHigh = 30;

    gameSetup.timerMallet3 = bg2;
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

  this.addStrengthMalletNew = () => {
    const config = gameSetup.config;
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/bluecrystallmallet.png"].texture);

    let ratio = (config.TrueWidth * 0.03) / 100;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = (config.TrueWidth * 0.06) / 100;
    }
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.249;
    bg2.position.y = config.TrueHeight - config.TrueHeight * 0.3;
    bg2.anchor.set(0.5, 0.5);
    bg2.name = "speedmallet";
    // bg2.interactive = true;
    gameSetup.blueCrystall = bg2;
    let initvalue = 60;
    if (gameSetup.difficulty == ADVANCED) initvalue = 85;
    this.addKnob(bg2, 0, 100, initvalue, config.TrueHeight - config.TrueHeight * 0.076, config.TrueHeight - config.TrueHeight * 0.48, 2, bg2.position.x - 100*ratio/2, bg2.position.x + 100*ratio/2);
    gameSetup.timerMallet1 = bg2;
    bg2.valueLow = 2;
    bg2.valueHigh = 100;
    gameSetup.stage.addChild(bg2);
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

    if (false && isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/controlsandrulessmall.png"].texture);
      ratio = (config.tableW * 1.05) / 800;
    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources["/images/controlsandrules.png"].texture);
      ratio = (config.tableW * 1.05) / 1417;
    }
    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.position.x = config.tableCenterX;
    bg.position.y = config.tableCenterY - 100 - config.tableH * 0.016;
    bg.anchor.set(0, 0.5);
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
    bg2.position.x = 180; //(config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    bg2.position.y = 70; //(config.TrueHeight - (config.tableH + 2 * config.metalBorderThick)) / 2;
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



  // new vertical
  this.addCWNew = () => {
    const config = gameSetup.config;

    const ga = new PIXI.Sprite(PIXI.loader.resources["/images/auto_zoom_search2.png"].texture);

    let ratio = (config.TrueHeight * 0.14 / 1.2) / 75;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = ratio * 1.2;
    }

    ga.scale.set(ratio, ratio); // will overflow on bottom

    ga.position.x = config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    ga.position.y = config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) - config.TrueHeight * 0.005;
    ga.anchor.set(0.5, 0);
    ga.interactive = true;
    gameSetup.stage.addChild(ga);
    gameSetup.controlButtons.push(ga);
    gameSetup.autoBtn = ga;
    ga.buttonMode = true;
    ga.visible = true;


    const findNextMallet = (legalColor, startID, dir=1) => {
      const ids = Object.keys(gameSetup.malletsByID);
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
        const b = gameSetup.malletsByID[ids[j]];
        if (b.body.inPocketID == null) {
          if (b.colorType == legalColor) {
            return b;
          } else if (legalColor == null && ids[j] >= 2) {
            return b;
          }
        }
      }
    };


    const otherMalletPos = new Victor(0, 0);
    const isPathBlocked = (pos1, pos2, ignoreID) =>{
      const ids = Object.keys(gameSetup.malletsByID);
      for (let k=0; k<ids.length; k++) {
        if (ids[k] == ignoreID) continue;
        const b = gameSetup.malletsByID[ids[k]];
        otherMalletPos.x = b.position.x;
        otherMalletPos.y = b.position.y;
        if (dist2(pos1, otherMalletPos) <= 0.001) continue;
        if (dist2(pos2, otherMalletPos) <= 0.001) continue;

        const dist = distToSegment(otherMalletPos, pos1, pos2);
        if (dist <= gameSetup.config.malletD)
          return true;
      }
      return false;
    };

    const calcMinDir = (targetID) => {
      const targetMallet = gameSetup.malletsByID[targetID];
      const cuemallet = gameSetup.malletsByID[0];
      // let maxPocketID = null;
      const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);

      let minAngleDiff = Math.PI / 2;
      // let dirx = 0; let diry = 0;
      let minDir = null;
      const cuemalletPos = new Victor(gameSetup.cuemallet.position.x, gameSetup.cuemallet.position.y);
      // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
      for (let pocketID=0; pocketID<6; pocketID++) {
        const pocketPos = gameSetup.tablePocket[pocketID].clone();
        const dirMalletToPocket = pocketPos.clone().subtract(targetMalletPos);
        const dirAimToMallet = dirMalletToPocket.normalize().scale(config.malletD);
        const aimPos = targetMalletPos.clone().subtract(dirAimToMallet);
        const dirCueMalletToAim = aimPos.clone().subtract(cuemalletPos);

        if (isPathBlocked(pocketPos, targetMalletPos)) continue;
        if (isPathBlocked(cuemalletPos, aimPos, targetID)) continue;

        // console.log("pocketPos " + JSON.stringify(pocketPos));
        // console.log("aimPos " + JSON.stringify(aimPos));
        // console.log("cuemalletPos " + JSON.stringify(cuemalletPos));

        // first filter out a pocket if the angle is too large
        const angleCueMalletToAim = dirCueMalletToAim.angle();
        const angleAimToMallet = dirAimToMallet.angle();
        let angleDiff = angleCueMalletToAim - angleAimToMallet;
        // console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
        if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
        // console.log("angleCueMalletToAim " + angleCueMalletToAim + " angleAimToMallet " + angleAimToMallet + " angleDiff " + angleDiff)
        if (Math.abs(angleDiff) < minAngleDiff) {
          minAngleDiff = Math.abs(angleDiff);
          minDir = dirCueMalletToAim;
        }
      }
      return minDir;
    }

    gameSetup.nextAutoTarget = (dir=1) => {
      gameSetup.playMagicSound();
      gameSetup.emitter.updateOwnerPos(ga.position.x, ga.position.y + 80);
      gameSetup.emitter.emit = true;

      let b = gameSetup.firstMalletTouchedByCuemallet;

      let counter = 0;
      let nextMinDir = null;
      const ids = Object.keys(gameSetup.malletsByID);
      while (counter <= ids.length) {
        counter ++;
        if (b == null || ( gameSetup.initPlayerInfo.legalColor != null && gameSetup.initPlayerInfo.legalColor != b.colorType)) {
          b = findNextMallet(gameSetup.initPlayerInfo.legalColor, -1, dir);
        } else {
          const currentMinDir = calcMinDir(b.ID);
          if (currentMinDir == null) {
            // blocked!
            b = findNextMallet(gameSetup.initPlayerInfo.legalColor, b.ID, dir);
            continue;
          }
          if (currentMinDir.x == gameSetup.cuemalletDirection.x && currentMinDir.y == gameSetup.cuemalletDirection.y) {
            // need to jump to aim next mallet
            b = findNextMallet(gameSetup.initPlayerInfo.legalColor, b.ID, dir);
          } else {
            // just need to adjust aiming for current mallet
            gameSetup.cuemalletDirection.x = currentMinDir.x;
            gameSetup.cuemalletDirection.y = currentMinDir.y;
            return;
          }
        }
        nextMinDir = calcMinDir(b.ID);
        if (nextMinDir != null) break;
      }

      if (nextMinDir != null) {
        gameSetup.cuemalletDirection.x = nextMinDir.x;
        gameSetup.cuemalletDirection.y = nextMinDir.y;
      }

      return;


      // let targetID = -1;
      // let msg = "Please aim at a mallet first.";
      // if (b !== null) {
      //   if (gameSetup.initPlayerInfo.chosenColor != null) {
      //     if (gameSetup.firstMalletTouchedByCuemallet.mallet.colorType != gameSetup.initPlayerInfo.legalColor) {
      //       targetID = -1;
      //       msg = `Please aim at a ${gameSetup.initPlayerInfo.legalColor} mallet first.`;
      //     } else {
      //       targetID = b.ID;
      //     }
      //   } else {
      //     targetID = b.ID;
      //   }
      // }

      // new way of simply calculate angle!

      // const targetMallet = gameSetup.malletsByID[targetID];
      // const cuemallet = gameSetup.malletsByID[0];
      // // let maxPocketID = null;
      // const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);

      // let minAngleDiff = 3000;
      // // let dirx = 0; let diry = 0;
      // let minDir = null;
      // const cuemalletPos = new Victor(gameSetup.cuemallet.position.x, gameSetup.cuemallet.position.y);
      // // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
      // for (let pocketID=0; pocketID<6; pocketID++) {
      //   const pocketPos = gameSetup.tablePocket[pocketID].clone();
      //   const dirMalletToPocket = pocketPos.clone().subtract(targetMalletPos);
      //   const dirAimToMallet = dirMalletToPocket.normalize().scale(config.malletD);
      //   const aimPos = targetMalletPos.clone().subtract(dirAimToMallet);
      //   const dirCueMalletToAim = aimPos.clone().subtract(cuemalletPos);

      //   // console.log("pocketPos " + JSON.stringify(pocketPos));
      //   // console.log("aimPos " + JSON.stringify(aimPos));
      //   // console.log("cuemalletPos " + JSON.stringify(cuemalletPos));

      //   // first filter out a pocket if the angle is too large
      //   const angleCueMalletToAim = dirCueMalletToAim.angle();
      //   const angleAimToMallet = dirAimToMallet.angle();
      //   let angleDiff = angleCueMalletToAim - angleAimToMallet;
      //   // console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
      //   if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
      //   if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
      //   // console.log("angleCueMalletToAim " + angleCueMalletToAim + " angleAimToMallet " + angleAimToMallet + " angleDiff " + angleDiff)
      //   if (Math.abs(angleDiff) < minAngleDiff) {
      //     minAngleDiff = Math.abs(angleDiff);
      //     minDir = dirCueMalletToAim;
      //   }
      // }

      // gameSetup.cuemalletDirection.x = minDir.x;
      // gameSetup.cuemalletDirection.y = minDir.y;
    };

    gameSetup.nextAutoTargetEvent = () => {
      gameSetup.nextAutoTarget(1);
    };

    ga.on('pointerdown', gameSetup.nextAutoTargetEvent);

    // ga.on('pointerdown', () => {
    //   gameSetup.autoSearchHandle = setTimeout(()=>{
    //     // gameSetup.autoSearchStepSize = Math.PI / 2;

    //     const b = gameSetup.firstMalletTouchedByCuemallet;
    //     let targetID = -1;
    //     let msg = "Please aim at a mallet first.";
    //     if (b !== null) {
    //       if (gameSetup.initPlayerInfo.chosenColor != null) {
    //         if (gameSetup.firstMalletTouchedByCuemallet.mallet.colorType != gameSetup.initPlayerInfo.legalColor) {
    //           targetID = -1;
    //           msg = `Please aim at a ${gameSetup.initPlayerInfo.legalColor} mallet first.`;
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

    //     const targetMallet = gameSetup.malletsByID[targetID];
    //     const cuemallet = gameSetup.malletsByID[0];
    //     // let maxPocketID = null;
    //     const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);

    //     let minAngleDiff = 3000;
    //     // let dirx = 0; let diry = 0;
    //     let minDir = null;
    //     const cuemalletPos = new Victor(gameSetup.cuemallet.position.x, gameSetup.cuemallet.position.y);
    //     // for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
    //     for (let pocketID=0; pocketID<6; pocketID++) {
    //       const pocketPos = gameSetup.tablePocket[pocketID].clone();
    //       const dirMalletToPocket = pocketPos.clone().subtract(targetMalletPos);
    //       const dirAimToMallet = dirMalletToPocket.normalize().scale(config.malletD);
    //       const aimPos = targetMalletPos.clone().subtract(dirAimToMallet);
    //       const dirCueMalletToAim = aimPos.clone().subtract(cuemalletPos);

    //       // console.log("pocketPos " + JSON.stringify(pocketPos));
    //       // console.log("aimPos " + JSON.stringify(aimPos));
    //       // console.log("cuemalletPos " + JSON.stringify(cuemalletPos));

    //       // first filter out a pocket if the angle is too large
    //       const angleCueMalletToAim = dirCueMalletToAim.angle();
    //       const angleAimToMallet = dirAimToMallet.angle();
    //       let angleDiff = angleCueMalletToAim - angleAimToMallet;
    //       // console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
    //       if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
    //       if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
    //       // console.log("angleCueMalletToAim " + angleCueMalletToAim + " angleAimToMallet " + angleAimToMallet + " angleDiff " + angleDiff)
    //       if (Math.abs(angleDiff) < minAngleDiff) {
    //         minAngleDiff = Math.abs(angleDiff);
    //         minDir = dirCueMalletToAim;
    //       }
    //     }

    //     gameSetup.cuemalletDirection.x = minDir.x;
    //     gameSetup.cuemalletDirection.y = minDir.y;


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
    ratio = (config.tableH * 0.14 / 1.2) / 128;
    if (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch) {
      ratio = ratio * 1.2;
    }

    bg.scale.set(ratio, ratio); // will overflow on bottom
    bg.tint = 0xffffff;

    bg.position.x = config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick)/4;
    bg.position.y = config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.175;
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
    bg2.position.y = config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.28;
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
      gameSetup.cuemalletDirection.rotate(0 - acc * Math.PI * dir / (128 * 180)); // 1 / 32 degree per click
    };



    // this.addControlLable('Direction', (bg2.position.x + bg.position.x)*0.5 - config.TrueWidth * 0.1, bg.position.y);
  };


  this.addCW = () => {
    const config = gameSetup.config;


    const g = new PIXI.Sprite(PIXI.loader.resources["/images/directionwoodbackground.png"].texture);

    let ratio = (config.TrueHeight * 0.44) / 435;
    g.scale.set(ratio, ratio); // will overflow on bottom

    g.position.x = config.TrueWidth - (config.TrueWidth - (config.tableW + 2 * config.metalBorderThick)) * 0.5;
    g.position.y = config.TrueHeight - config.tableH - 2 * config.metalBorderThick + config.TrueHeight * 0.01;
    g.anchor.set(0.5, 0);
    g.interactive = false;
    g.visible = true;
    gameSetup.stage.addChild(g);

    const ga = new PIXI.Sprite(PIXI.loader.resources["/images/auto_zoom_search2.png"].texture);

    // const ga = new PIXI.Sprite(PIXI.loader.resources["/images/yellowspintarget.png"].texture);

    ratio = (config.TrueHeight * 0.1) / 150;
    ga.scale.set(ratio, ratio); // will overflow on bottom

    ga.position.x = config.TrueWidth - (config.TrueWidth - (config.tableW + 2 * config.metalBorderThick)) * 0.5;
    ga.position.y = config.TrueHeight - (config.tableH + 2 * config.metalBorderThick) + config.TrueHeight * 0.018;
    // ga.position.y = 0;
    ga.anchor.set(0.5, 0);
    ga.interactive = true;
    gameSetup.stage.addChild(ga);

    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/ccwmetal3.png"].texture);

    ratio = (config.tableH * 0.07) / 128;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = config.TrueWidth - (config.TrueWidth - (config.tableW + 2 * config.metalBorderThick)) * 0.7;
    bg.position.y = config.TrueHeight - config.tableH + config.TrueHeight * 0.075;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = true;
    gameSetup.stage.addChild(bg);


    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/cwmetal3.png"].texture);

    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.TrueWidth - (config.TrueWidth - (config.tableW + 2 * config.metalBorderThick)) * 0.3;
    bg2.position.y = bg.position.y;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = true;
    gameSetup.stage.addChild(bg2);

    // this.addControlLable('Direction', (bg2.position.x + bg.position.x)*0.5 - config.TrueWidth * 0.1, bg.position.y);
  };



  this.addSpinMallet = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/spintargetmalletpanel2.png"].texture);

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
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/quitbtn.png"].texture);
    let ratio = (config.tableW * 0.103) / 242;
    bg.scale.set(ratio, ratio); // will overflow on bottom

    bg.position.x = 260; //config.tableCenterX - config.tableW/2 - config.metalBorderThick + controlAdjustX;
    bg.position.y = 70; //(config.TrueHeight  - 100 - config.tableH - 2 * config.metalBorderThick) / 2;
    bg.anchor.set(0, 0.5);
    bg.interactive = true;
    bg.buttonMode = true;
    gameSetup.stage.addChild(bg);
    // gameSetup.controlButtons.push(bg);


    // exit warning message
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/exitwarning.png"].texture);
    ratio = (config.tableW * 0.75) / 738;
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = config.tableCenterX;
    bg2.position.y = config.tableCenterY;
    bg2.anchor.set(0.5, 0.5);
    bg2.interactive = false;
    bg2.visible = false;
    gameSetup.stage.addChild(bg2);

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
      if (window.gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.AUTORUN) {
        gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: 0});
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







  this.addSubmitButton = () => {
    const config = gameSetup.config;

    const ratio = (config.tableW * 0.103) / 242;

    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/submitbtn.png"].texture);
    bg2.scale.set(ratio, ratio); // will overflow on bottom

    bg2.position.x = 2400; //(config.tableCenterX + config.tableW/2 + config.metalBorderThick + controlAdjustX);
    bg2.position.y = 70; //(config.TrueHeight - config.tableH - 2 * config.metalBorderThick) / 2;
    bg2.anchor.set(1, 0.5);
    bg2.interactive = true;
    bg2.buttonMode = true;
    bg2.on('pointerdown', gameSetup.controller.onSubmitButtonClick);
    gameSetup.stage.addChild(bg2);
    gameSetup.controlButtons.push(bg2);

    gameSetup.submitButton = bg2;

    // gameSetup.toggleHitButton = (showHit) => {
    //   if (showHit) {
    //     if (gameSetup.hitButton.visible) return;
    //     gameSetup.hitButton.visible = true;
    //     gameSetup.hitButton.interactive = true;
    //     gameSetup.submitButton.visible = false;
    //     gameSetup.submitButton.interactive = false;
    //   } else {
    //     if (!gameSetup.hitButton.visible) return;
    //     gameSetup.submitButton.visible = true;
    //     gameSetup.submitButton.interactive = true;
    //     gameSetup.hitButton.visible = false;
    //     gameSetup.hitButton.interactive = false;
    //   }
    // };
  };



  this.addModalMessageScreen = () => {
    const config = gameSetup.config;

    // game over message background
    const bg2 = new PIXI.Sprite(PIXI.loader.resources["/images/modalmessagebg.png"].texture);
    let ratio = (config.tableW * 0.75) / 500;
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
      fontSize: config.tableW / 120,
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
    headerText.y = 0 - config.tableH * 0.05;
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
      fontSize: config.tableW / 160,
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
    msgText.y = 0 - config.tableH * 0.01;
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
      // let id = gameSetup.initPlayerInfo.ID;
      // if (gameSetup.initPlayerInfo.isLocal) {
      //   id = gameSetup.initPlayerInfo.ID;
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
            // if (gameSetup.initPlayerInfo) {
            //   const params = {
            //     modalIsOpen: true,
            //     sectionKey: gameSetup.pairData.sectionId,
            //     tournamentId: gameSetup.pairData.tournamentId
            //   };
            //   PoolActions.finishTournamentSectionRound(
            //     gameSetup.pairData.roundId,
            //     gameSetup.initPlayerInfo.playerUserId,
            //     gameSetup.pairData.id,
            //     PLAYER_TYPE.WINNER
            //   );
            // }
            //gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
            gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`);
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
            // if (gameSetup.initPlayerInfo) {
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

      // console.log("ExitGameRoom sent from " + id);
      gameSetup.networkHandler.sendCommandToAll({ c: "ExitGameRoom", t: gameSetup.currentCycleTime, w: id});
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


  // this.addNameTagSign = () => {
  //   const config = gameSetup.config;
  //   // new new way: draw a green table top graphics
  //   const bg = new PIXI.Sprite(PIXI.loader.resources["/images/wood-vs-sign.png"].texture);

  //   const ratio = (config.tableW * 0.8) / 1111;
  //   bg.scale.set(ratio, ratio); // will overflow on bottom

  //   bg.position.x = config.tableCenterX;
  //   bg.position.y = (config.TrueHeight - config.tableH - 2 * config.metalBorderThick) / 2;
  //   bg.anchor.set(0.5, 0.5);
  //   bg.interactive = false;
  //   gameSetup.stage.addChild(bg);
  // };

  this.addBackGround = () => {
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    const bg = new PIXI.Sprite(PIXI.loader.resources["/images/bluebackgroundsoccer10.jpg"].texture);

    bg.scale.set(config.TrueWidth/(1398-6), config.TrueHeight / 680); // will overflow on bottom

    bg.position.x = 0;
    bg.position.y = 0;
    bg.anchor.set(0, 0);
    bg.interactive = true;
    bg.name = "bluebackground";
    gameSetup.stage.addChild(bg);

    gameSetup.bluebackground = bg;
  };


  this.addGoalAreas = () => {
    const config = gameSetup.config;


    gameSetup.goalAreaG = new PIXI.Graphics();
    gameSetup.goalAreaG.zOrder = 2;
    gameSetup.stage.addChild(gameSetup.goalAreaG);

    const goalThickNess = config.goalThickNess;

    // blue goal
    //gameSetup.goalAreaG.beginFill(0x8fb4ef);
    gameSetup.goalAreaG.lineStyle(3, 0x8fb4ef);
    gameSetup.goalAreaG.drawRect(config.tableCenterX - config.tableW/2 - goalThickNess + 2, config.tableCenterY - config.goalSize/2, goalThickNess, config.goalSize);

    //gameSetup.goalAreaG.beginFill(0xed958b);
    gameSetup.goalAreaG.lineStyle(3, 0xed958b);
    gameSetup.goalAreaG.drawRect(config.tableCenterX + config.tableW/2 - 2, config.tableCenterY - config.goalSize/2, goalThickNess, config.goalSize);


  };

  this.addBorders = () => {
    const config = gameSetup.config;
    gameSetup.borderConfig = [];
    const borderThickNess = 1000;
    gameSetup.borderConfig.push({w: config.tableW, h: borderThickNess, x: config.tableCenterX, y: config.tableCenterY - config.tableH/2 - borderThickNess/2 }); // top
    gameSetup.borderConfig.push({w: config.tableW, h: borderThickNess, x: config.tableCenterX, y: config.tableCenterY + config.tableH/2 + borderThickNess/2 }); // bottom

    gameSetup.borderConfig.push({w: borderThickNess, h: (config.tableH - config.goalSize)/2, x: config.tableCenterX - config.tableW/2 - borderThickNess/2, y: config.tableCenterY - config.tableH/2}); // left up
    gameSetup.borderConfig[gameSetup.borderConfig.length-1].y += gameSetup.borderConfig[gameSetup.borderConfig.length-1].h/2;

    gameSetup.borderConfig.push({w: borderThickNess, h: (config.tableH - config.goalSize)/2, x: config.tableCenterX - config.tableW/2 - borderThickNess/2, y: config.tableCenterY + config.tableH/2}); // left up
    gameSetup.borderConfig[gameSetup.borderConfig.length-1].y -= gameSetup.borderConfig[gameSetup.borderConfig.length-1].h/2;

    gameSetup.borderConfig.push({w: borderThickNess, h: (config.tableH - config.goalSize)/2, x: config.tableCenterX + config.tableW/2 + borderThickNess/2, y: config.tableCenterY - config.tableH/2}); // left up
    gameSetup.borderConfig[gameSetup.borderConfig.length-1].y += gameSetup.borderConfig[gameSetup.borderConfig.length-1].h/2;

    gameSetup.borderConfig.push({w: borderThickNess, h: (config.tableH - config.goalSize)/2, x: config.tableCenterX + config.tableW/2 + borderThickNess/2, y: config.tableCenterY + config.tableH/2}); // left up
    gameSetup.borderConfig[gameSetup.borderConfig.length-1].y -= gameSetup.borderConfig[gameSetup.borderConfig.length-1].h/2;

    gameSetup.borderConfig.push({w: borderThickNess, h: config.goalSize, x: config.tableCenterX + config.tableW/2 + config.goalThickNess + borderThickNess/2, y: config.tableCenterY}); // right behind goal

    gameSetup.borderConfig.push({w: borderThickNess, h: config.goalSize, x: config.tableCenterX - config.tableW/2 - config.goalThickNess - borderThickNess/2, y: config.tableCenterY}); // right behind goal

    // gameSetup.debugBoxG = new PIXI.Graphics();
    // gameSetup.stage.addChild(gameSetup.debugBoxG);

    for (let k=0; k<gameSetup.borderConfig.length; k++) {
      this.addOneBorder(gameSetup.world, gameSetup.borderConfig[k]);
      this.addOneBorder(gameSetup.world2, gameSetup.borderConfig[k]);
      // this.addDebugBox(gameSetup.borderConfig[k]);
    }
  };

  this.addDebugBox = (cfg) => {
    const g = gameSetup.debugBoxG;    
    g.lineStyle(5, 0xffff00, 1);
    g.moveTo(cfg.x - cfg.w/2, cfg.y - cfg.h/2);
    g.lineTo(cfg.x + cfg.w/2, cfg.y - cfg.h/2);
    g.lineTo(cfg.x + cfg.w/2, cfg.y + cfg.h/2);
    g.lineTo(cfg.x - cfg.w/2, cfg.y + cfg.h/2);
    g.lineTo(cfg.x - cfg.w/2, cfg.y - cfg.h/2);

  };

  this.addOneBorder = (world, cfg, noRebound) => {
    const malletShape = new p2.Box({ width: cfg.w, height: cfg.h, material: noRebound ? gameSetup.cushionMaterialNoRebound : gameSetup.cushionMaterial });
    const b = new p2.Body({
        mass:0,
        position:[cfg.x, cfg.y],
        damping: 0, // controls when speed is large how it slows down
        angularDamping: 0,
        fixedRotation: true,
        angularVelocity:0,
        velocity: [0, 0]
    });
    b.name = "border";
    b.addShape(malletShape);
    world.addBody(b);
    return b;
  };

  this.addTableImage = () => {
    // const soccerFieldBig = _.get(gameSetup, 'soccerField.imageSrc.main', '/images/diamondpoolbig.png');
    // let soccerFieldSmall = _.get(gameSetup, 'soccerField.imageSrc.small', '/images/diamondpoolsmall.png');
    const soccerFieldBig = "/images/soccerfield4.jpg";
    const soccerFieldSmall = "/images/soccerfield4.jpg";

    //const soccerFieldSmall = '/images/rt.png';
    const config = gameSetup.config;
    // new new way: draw a green table top graphics
    let bg, w, h;
    // console.log('gameType', gameSetup.gameType);
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      bg = new PIXI.Sprite(PIXI.loader.resources[soccerFieldSmall].texture);
      w = 1012 * 1.009; h = 464;
    } else {
      bg = new PIXI.Sprite(PIXI.loader.resources[soccerFieldBig].texture);
      w = 955; h = 479;
    }

    bg.scale.set((config.tableW) / w, (config.tableH) / h); // will overflow on bottom

    bg.position.x = config.tableCenterX;
    bg.position.y = config.tableCenterY;
    bg.anchor.set(0.5, 0.5);
    bg.interactive = false;
    gameSetup.stage.addChild(bg);
    gameSetup.fieldTop = bg;
  };

  // this.drawfieldTop = () => {
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
    pocketg2.beginFill(0xff0000, 0.4);


    for (let k=0; k<6; k++) {
      const p = gameSetup.tablePocket[k];
      pocketg2.drawCircle(p.x, p.y, config.malletD/2);
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
      // mallet.malletIDLabel = label;
      // mallet.body.malletIDLabel = label;
    }
  };

  

  this.addMalletBody = (w, r, x, y) => {
    const malletShape = new p2.Circle({ radius: r, material: gameSetup.malletMaterial });
    const b = new p2.Body({
        mass:1,
        position:[x, y],
        damping: 0.8, // controls when speed is large how it slows down
        angularDamping: 0,
        fixedRotation: true,
        angularVelocity:0,
        velocity: [0, 0]
    });
    b.name = "mallet";
    b.av = new Victor(0, 0);
    b.addShape(malletShape);
    w.addBody(b);
    return b;
  };


  

  gameSetup.addPolygonBody = (points, id) => {
    const path = [];
    for (let k = 0; k < points.length - 2; k += 2) {
      path.push([points[k], points[k + 1]]);
    }

    const b = new p2.Body({ mass: 0, position: [0, 0] });
    // console.log("from polygon 1 " + JSON.stringify(path));

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
    g.lineStyle(config.malletD / 8, 0x42f4aa, 1);
        // g.beginFill(0xffffff, config.malletD / 10); // white target
    g.drawCircle(0, 0, config.cornerPocketD * 0.3);
        // g.endFill();
    gameSetup.targetPocketMark = g;
    gameSetup.stage.addChild(g);
  };

  this.drawAimMallet = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.tableCenterX;
    g.position.y = config.tableCenterY;

    // g.lineStyle(config.malletD / 5, 0xffffff, 1); // 0x66b3ff, 0.8);
    // g.drawCircle(0, 0, config.malletD * 0.4);

    g.lineStyle(0, 0xffffff, 1); // 0x66b3ff, 0.8);
    //g.beginFill(0x6495ED, 1); // white target
    g.beginFill(0xF736F0, 0.5); // purple target
    g.drawCircle(0, 0, config.malletD * 0.5);
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

    gameSetup.aimMalletMark = g;
    // g.aimCText.visible = false; // aaaa
    gameSetup.stage.addChild(g);
  };


  this.drawTargetMallet = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.tableW * 1000;
    g.position.y = config.tableW * 1000;

    g.lineStyle(config.malletD / 8, 0x42f4aa, 1); // 0x66b3ff, 0.8);
        // g.beginFill(0xffffff, config.malletD / 10); // white target
    g.drawCircle(0, 0, config.malletD * 0.6);
        // g.endFill();
    gameSetup.targetMalletMark = g;
    gameSetup.stage.addChild(g);
  };

  this.drawFirstMallet = () => {
    const config = gameSetup.config;
        // new new way: draw a green table top graphics
    // const g = gameSetup.add.graphics(config.tableW * 1000, config.tableH * 1000);

    const g = new PIXI.Graphics();
    g.position.x = config.tableW * 1000;
    g.position.y = config.tableW * 1000;

    g.lineStyle(config.malletD / 10, autobuttoncolor, 1); // 0x66b3ff, 0.8);
    g.beginFill(autobuttoncolor, 1); // white target
    g.drawCircle(0, 0, config.malletD * 0.15);
    g.endFill();
    gameSetup.firstMalletMark = g;
    gameSetup.stage.addChild(g);
  };

  this.parallelShift = (cushiong, cline) => {
    const v12 = cline.p2.clone().subtract(cline.p1);
    const shift = v12.rotate(Math.PI / 2).normalize().scale(gameSetup.config.malletD * 0.99999/2);
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
    //   config.tableCenterX - config.tableW / 2 + config.malletD / 2 + config.cushionBarThick,
    //   config.tableCenterY - config.tableH / 2 + config.malletD / 2 + config.cushionBarThick,
    //   config.tableW - config.malletD - 2 * config.cushionBarThick,
    //   config.tableH - config.malletD - 2 * config.cushionBarThick
    // );
    // cushiong.moveTo(config.tableCenterX - config.tableW / 2 + config.malletD / 2 + config.cushionBarThick, config.tableCenterY - config.tableH / 2 + config.malletD / 2 + config.cushionBarThick);
    // cushiong.lineTo(config.tableCenterX - config.tableW / 2 + config.malletD / 2 + config.cushionBarThick + config.tableW - config.malletD - 2 * config.cushionBarThick, config.tableCenterY - config.tableH / 2 + config.malletD / 2 + config.cushionBarThick);
    // cushiong.lineTo(config.tableCenterX - config.tableW / 2 + config.malletD / 2 + config.cushionBarThick + config.tableW - config.malletD - 2 * config.cushionBarThick, config.tableCenterY - config.tableH / 2 + config.malletD / 2 + config.cushionBarThick + config.tableH - config.malletD - 2 * config.cushionBarThick);


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
    //   pp.body.collides([this.malletCollisionGroup]);
    // }

    cushiong.endFill();
    // gameSetup.stage.addChild(cushiong); // aaaa test cushion bar by setting them visible!
  };

  this.createAllCollisionGroups = () => {
    this.malletCollisionGroup = gameSetup.physics.p2.createCollisionGroup();
    this.borderCollisionGroup = gameSetup.physics.p2.createCollisionGroup(); gameSetup.physics.p2.updateBoundsCollisionGroup();
  };

  gameSetup.createMaterials = () => {
    gameSetup.cushionMaterial =  new p2.Material();
    gameSetup.malletMaterial =  new p2.Material();
    gameSetup.soccerMaterial =  new p2.Material();
    gameSetup.cushionMaterialNoRebound = new p2.Material();


    gameSetup.malletCushionMaterial = new p2.ContactMaterial(gameSetup.malletMaterial, gameSetup.cushionMaterial, {
      friction: 0,
      restitution: 1,
      stiffness : Number.MAX_VALUE
    });


    gameSetup.soccerCushionMaterial = new p2.ContactMaterial(gameSetup.soccerMaterial, gameSetup.cushionMaterial, {
      friction: 0,
      restitution: 1,
      stiffness : Number.MAX_VALUE
    });


    gameSetup.malletCushionMaterialNoRebound = new p2.ContactMaterial(gameSetup.malletMaterial, gameSetup.cushionMaterialNoRebound, {
      friction: 0,
      restitution: 0,
      stiffness : Number.MAX_VALUE
    });


    gameSetup.soccerCushionMaterialNoRebound = new p2.ContactMaterial(gameSetup.soccerMaterial, gameSetup.cushionMaterialNoRebound, {
      friction: 0,
      restitution: 0,
      stiffness : Number.MAX_VALUE
    });




    gameSetup.malletMalletMaterial = new p2.ContactMaterial(gameSetup.malletMaterial, gameSetup.malletMaterial, {
      friction: 0,
      stiffness : Number.MAX_VALUE,
      restitution: 0.02
    });


    gameSetup.soccerMalletMaterial = new p2.ContactMaterial(gameSetup.soccerMaterial, gameSetup.malletMaterial, {
      friction: 0,
      stiffness : Number.MAX_VALUE,
      restitution: 1
    });
  };

  gameSetup.addMateirals = () => {

    gameSetup.world.addContactMaterial(gameSetup.malletCushionMaterial);
    gameSetup.world2.addContactMaterial(gameSetup.malletCushionMaterial);
    gameSetup.world.addContactMaterial(gameSetup.malletMalletMaterial);
    gameSetup.world2.addContactMaterial(gameSetup.malletMalletMaterial);


    gameSetup.world.addContactMaterial(gameSetup.soccerCushionMaterial);
    gameSetup.world2.addContactMaterial(gameSetup.soccerCushionMaterial);
    gameSetup.world.addContactMaterial(gameSetup.soccerMalletMaterial);
    gameSetup.world2.addContactMaterial(gameSetup.soccerMalletMaterial);


    gameSetup.world.addContactMaterial(gameSetup.malletCushionMaterialNoRebound);
    gameSetup.world2.addContactMaterial(gameSetup.malletCushionMaterialNoRebound);
    gameSetup.world.addContactMaterial(gameSetup.soccerCushionMaterialNoRebound);
    gameSetup.world2.addContactMaterial(gameSetup.soccerCushionMaterialNoRebound);

  };

  this.createTableRenderer = () => {
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "soccerFieldDiv");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }

    // calculate rendering size of div, based on whether this is testing or not
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // only show table
      // cfg.fieldTop = 0;

    } else {
      // table is at lower left portion of overall div
      // table inside area is tableW, which is truewidth * 0.86; so ratio of table plus border is wratio > 0.86
      const wratio = (cfg.tableW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.tableH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;
    }


    tablerenderer = PIXI.autoDetectRenderer(w, h, { transparent: false, antialias: true });
    tableDiv.appendChild(tablerenderer.view);
    tablerenderer.view.setAttribute("id", "soccerFieldCanvas");

    // actual size on page, to be used for scaling objects later
    // tablerenderer.displayW = w;
    // tablerenderer.displayH = h;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    tablerenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:105`);

    gameSetup.tablecontainer = new PIXI.Container();
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // only show table
      // cfg.fieldTop = 0;
      gameSetup.tablecontainer.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.tablecontainer.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
    } else {
      // same scaling as all
      gameSetup.tablecontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.tablecontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
    }
  };

  this.createMalletRenderer = () => {
    // transparent canvas just for the mallets, so we don't need to re-render the table!!
    const cfg = gameSetup.config;
    // gameDiv -> DIV -> canvas for drawing
    const tableDiv = document.createElement("DIV");
    tableDiv.setAttribute("id", "MalletDiv");

    const gameDiv = document.getElementById('gameDiv');
    gameDiv.appendChild(tableDiv);


    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }

    // calculate rendering size of div, based on whether this is testing or not
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // only show table

    } else {
      // table is at lower left portion of overall div
      const wratio = (cfg.tableW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.tableH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;
    }

    malletrenderer = PIXI.autoDetectRenderer(w, h, { transparent: true, antialias: true });
    tableDiv.appendChild(malletrenderer.view);
    malletrenderer.view.setAttribute("id", "MalletCanvas");
    malletrenderer.plugins.interaction.autoPreventDefault = true;

    // actual size on page, to be used for scaling objects later
    // malletrenderer.displayW = w;
    // malletrenderer.displayH = h;


    // const top = 0; //container.offsetTop; // + renderer.trueHeight * 0.65 ;
    // const left = renderer.trueLeft; // + renderer.trueWidth  - renderer.trueHeight * 0.35;
    malletrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px;z-index:200`);

    gameSetup.malletcontainer = new PIXI.Container();
    // gameSetup.stage.scale.x = w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
    // gameSetup.stage.scale.y = h / (cfg.TrueHeight); //h / (cfg.tableH + 2 * cfg.metalBorderThick);

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // only show table
      // cfg.fieldTop = 0;
      gameSetup.stage.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.stage.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
    } else {
      // same scaling as all
      gameSetup.stage.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.stage.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
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
  this.setupKickKnobHandlers = () => {

    const c = gameSetup.bluebackground;
    const config = gameSetup.config;
    const knob = null;

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
      const wfieldTop = 2000; // table is 2000x1000 now!
      const wfulltable = wfieldTop + 2 * metalBorderThick;
      const hfulltable = wfieldTop/2 + 2 * metalBorderThick;

      const px = (config.TrueWidth - wfulltable)/2 + event.data.global.x / gameSetup.stage.scale.x;
      const py = (config.TrueHeight - hfulltable + 5) + event.data.global.y / gameSetup.stage.scale.y;
      gameSetup.aimMalletMark.position.x = px;
      gameSetup.aimMalletMark.position.y = py;
      gameSetup.aimx = px;
      gameSetup.aimy = py;

      gameSetup.aimMalletMark.aimCText.text = `(${Math.round(px-config.tableCenterX)}, ${Math.round(py-config.tableCenterY)})`;
    };

    gameSetup.updateKickLine = (knob, d) => {
      const g = knob.kickLineG;
      g.clear();
      // if (d <= gameSetup.config.malletD * 0.9) {
      //   knob.inForce = false;
      //   return;
      // }
      // knob.inForce = true;
      g.lineStyle(5, KnobColors[knob.mallet.ID], 1); // 0x66b3ff, 0.8);
      g.moveTo(knob.position.x, knob.position.y);
      g.lineTo(knob.mallet.kickTarget.position.x, knob.mallet.kickTarget.position.y);
    };

    const mpos = new Victor(0,0);
    const kpos = new Victor(0,0);
    const tryPlaceKnob = (testtarget, knob) => {
      const kickTarget = knob.mallet.kickTarget;
      mpos.x = kickTarget.position.x; mpos.y = kickTarget.position.y;
      kpos.x = testtarget.x; kpos.y = testtarget.y;
      let d = mpos.distance(kpos);
      if (d < gameSetup.config.malletD * 0.79) d = gameSetup.config.malletD * 0.8;
      if (d > gameSetup.config.malletD * 2.9) d = gameSetup.config.malletD * 2.9;
      const arrow = kpos.subtract(mpos).normalize().multiplyScalar(d);
      mpos.add(arrow);
      // if (d >= gameSetup.config.malletD * 0.8 && d <= gameSetup.config.malletD * 5) {
      //resetBall(cb, testtarget.x, testtarget.y);
      knob.position.x = mpos.x;
      knob.position.y = mpos.y;
      // console.log("new mpos " + mpos.x + " " + mpos.y);
      gameSetup.updateKickLine(knob, d);
      // }
    };

    const updateTimingLine = (m) => {
      const g = m.timingLineG;
      g.clear();
      const mallet = gameSetup.mallets[m.ID];
      const ybase = gameSetup.config.ybase; const ymax = gameSetup.config.ymax;
      const linecolor = 143 * 256 * 256 + 180 * 256 + 239
      g.lineStyle(5, linecolor, 1); // 0x66b3ff, 0.8);

      for(let k=0; k<mallet.timePeriods.length; k++) {
        const t = mallet.timePeriods[k];
        const starty = ybase + (ymax - ybase) / config.timeIndexLimit * (t.start);
        const endy = ybase + (ymax - ybase) / config.timeIndexLimit * (t.stop);
        g.moveTo(m.position.x, starty);
        g.lineTo(m.position.x, endy);
      }

    };

    const tryPlaceTimerMallet = (testtarget, mallet) => {
      const ybase = gameSetup.config.ybase; const ymax = gameSetup.config.ymax;
      let newy = testtarget.y;
      if (newy < ybase) newy = ybase;
      if (newy > ymax) newy = ymax;
      mallet.position.y = newy;
    };


    const updateInputs = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      if (gameSetup.gameType == GAME_TYPE.MATCH || gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.TOURNAMENT) {
        // if (gameSetup.initPlayerInfo.playerType == "AI") return false;
      }
      const t = event.currentTarget;

      if (!t.draggedKnob) return;

      testtarget.x = Math.fround(event.data.global.x / gameSetup.stage.scale.x);
      testtarget.y = Math.fround(event.data.global.y / gameSetup.stage.scale.y);

      if (t.draggedKnob.name.indexOf("timerknob") == 0) {
        tryPlaceTimerMallet(testtarget, t.draggedKnob);
      } else if (t.draggedKnob.name.indexOf("mallet") == 0) {
        // short cut to add timer mallet
        let currentSlot = null;
        for (let k=0; k<gameSetup.config.MOVE_COUNT; k++) {
          const m  = gameSetup.timerMallets[k];
          if (m.chosenMalletID < 0) {
            currentSlot = m;
            break;
          }
        }
        if (currentSlot) {
          const id = t.draggedKnob.ID;
          console.log("short cut " + id);
          currentSlot.chooseID(currentSlot, id);
          t.draggedKnob = currentSlot.kickKnob;
          tryPlaceKnob(testtarget, currentSlot.kickKnob);
        }
      } else {
        tryPlaceKnob(testtarget, t.draggedKnob);
      }

      // for (let mindex =0; mindex< config.MALLET_COUNT; mindex ++) {
      //   const m = gameSetup.timerMallets[mindex];
      //   updateTimingLine(m);
      // }
    };

    const findDraggingKnobOrTimer = (x, y) => {

      if ( x >= 2180) {
        for (let k=0; k<gameSetup.timerMallets.length; k++) {
          const mp  = gameSetup.timerMallets[k].timerKnob.position;
          const d = Math.sqrt((mp.x-x)*(mp.x-x)+(mp.y-y)*(mp.y-y));
          if (d < gameSetup.config.malletD * 0.7) {
            return gameSetup.timerMallets[k].timerKnob;
          } 
        }

        return null;
      }


      let hasUnusedTimerMallet = false;
      for (let k=0; k<gameSetup.config.MOVE_COUNT; k++) {
        const m  = gameSetup.timerMallets[k];
        if (m.chosenMalletID < 0) hasUnusedTimerMallet = true;
        const kp = m.kickKnob.position;
        const d = Math.sqrt((kp.x-x)*(kp.x-x)+(kp.y-y)*(kp.y-y));
        if (d < gameSetup.config.malletD * 0.5) {
          return m.kickKnob;
        } 
      }

      if (hasUnusedTimerMallet) {
        // short cut method to start a new timer mallet
        let offset = 0;
        if (gameSetup.playerInfo[1].isLocal && gameSetup.playerInfo[1].playerType == "Human") {
          offset = gameSetup.config.MALLET_COUNT;
        }
        for (let k=0; k<gameSetup.config.MALLET_COUNT; k++) {
          const m  = gameSetup.mallets[k + offset];
          const mp = m.position;
          const d = Math.sqrt((mp.x-x)*(mp.x-x)+(mp.y-y)*(mp.y-y));
          if (d < gameSetup.config.malletD * 0.9) {
            return m;
          }
        }
      }

      return null;
    };

    const onDragStart = (event) => {

      gameSetup.hideChipChooser();

      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      t.draggedKnob = findDraggingKnobOrTimer(event.data.global.x / gameSetup.stage.scale.x, event.data.global.y/ gameSetup.stage.scale.y);
      if (!t.draggedKnob) return;
      updateInputs(event);
      event.stopped = true;
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
    };

    const onDragEnd = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      delete t.draggedKnob;
      event.data.originalEvent.preventDefault();
      event.data.originalEvent.stopPropagation();
      event.stopped = true;
    };

    const onDragMove = (event) => {
      if (!gameSetup.controller || !gameSetup.controller.allowInput()) return;
      const t = event.currentTarget;
      if (!t.draggedKnob) return;
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

  this.createControlRenderer = () => {

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      const shell = document.getElementById('gameDivShellModal');
      w = shell.clientWidth * 1;
      h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
    }

    cfg.fieldTop = cfg.TrueHeight - cfg.tableH - cfg.metalBorderThick*2;
    cfg.tableRight = cfg.TrueWidth - cfg.tableW - cfg.metalBorderThick*2;

    // calculate rendering size of div, based on whether this is testing or not
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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





  const loadPlayRightMallet = (cc, x, y, color) => {
    y = 70;
    let malletfile = 'white';
    switch (color) {
      case MalletColors.RED: malletfile = 'red'; break;
      case MalletColors.BLUE: malletfile = 'blue'; break;
    }

    const mallet = new PIXI.Sprite(PIXI.loader.resources[`/images/${malletfile}button2.png`].texture);

    mallet.scale.set(gameSetup.config.malletD * 1 / 150);

    mallet.position.x = x  + controlAdjustX;
    mallet.position.y = y;
    mallet.anchor.x = 0.5;
    mallet.anchor.y = 0.5;

    mallet.interactive = false;

    // cc.malletIcons[color] = mallet;
    gameSetup.stage.addChild(mallet);
  };

  this.addPlayerPanelNew = (c, pi) => {
    const config = gameSetup.config;
    //const gb = this.gameSetup.add.graphics(0, 0);
    const gb = new PIXI.Graphics();
    gameSetup.stage.addChild(gb);

    this.addPlayerTimer(c, pi);
    this.addPlayerScore(c, pi);
    c.malletIcons = [];

    if (pi.ID == 1)
      loadPlayRightMallet(c, c.cx - c.w * 0.43 - 5, c.cy + c.h * 0, MalletColors.RED);
    else 
      loadPlayRightMallet(c, c.cx - c.w * 0.43 - 25, c.cy + c.h * 0, MalletColors.BLUE);

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


    

    // c.showNameTag(MalletColors.WHITE);

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
    text.position.x = c.cx + c.w * 0 + controlAdjustX;
    text.position.y = 70; //c.cy;
    text.anchor.set(0.5, 0.5);
    gameSetup.stage.addChild(text);


    c.showPlayerAsActive = (isActive) => {
      let tint = 0x666666;
      if (isActive) {
        // bg2.visible = false;
        tint = 0xffffff;
      }
      text.tint = tint;
      return;
      c.countdownClockText.tint = tint;
      for (let k=0; k <= 3; k++) {
        if (c.malletIcons[k].visible) {
          c.malletIcons[k].tint = tint;
          if (isActive)
            c.malletIcons[k].play();
          else
            c.malletIcons[k].stop();
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
    text.position.x = config.TrueWidth - (config.TrueWidth - config.tableW - 2 * config.metalBorderThick) * 0.251;
    text.position.y = (config.TrueHeight - config.tableH - 2 * config.metalBorderThick) * 0.5 ;
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
      if (color == MalletColors.BLANK) {
        c.nameTagRed.visible = false;
        c.nameTagYellow.visible = false;
        c.nameTagWhite.visible = false;
        c.nameTagBlank.visible = true;
        return;
      }

      c.nameTagBlank.visible = false;

      let tag = c.nameTagBlank;
      switch (color) {
        case MalletColors.RED: tag = c.nameTagRed; break;
        case MalletColors.YELLOW: tag = c.nameTagYellow; break;
        case MalletColors.WHITE: tag = c.nameTagWhite; break;
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

    config.sendMessageAll('Welcome to the Trajectory MalletColors game!', 0);
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
      panel.clockTimeStr = "10:00";
      if (gameSetup.difficulty == ADVANCED) {
        panel.clockTimeStr = "20:00";
      }
      panel.inTimeCountDown = false;

      const richText0 = new PIXI.Text(panel.clockTimeStr, style0);
      richText0.x = panel.cx + panel.clockXShift + controlAdjustX;
      richText0.y = 70; //panel.cy;
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

  this.addPlayerScore = (panel, pi) => {
    // add count down clock
    const config = gameSetup.config;
    const size = Math.floor(3.5 * config.scalingratio);
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

    pi.score = 0;

    const richText0 = new PIXI.Text(pi.score, style0);
    richText0.x = panel.cx - panel.scoreShift;
    richText0.y = 70; //panel.cy;
    richText0.anchor.set(0.5, 0.5);
    richText0.anchor.set(0.5, 0.5);

    gameSetup.stage.addChild(richText0);
    panel.scoreText = richText0;
    panel.increaseScore = () => {
      pi.score ++;
      panel.scoreText.setText(pi.score);
    };
  };

  // this.addVSSign = () => {
  //   const config = gameSetup.config;
  //   const cx = config.tableCenterX; // config.playerPanel2.cx;
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

  //   // const arrow = gameSetup.add.sprite(cfg.tableCenterX - cfg.tableW / 2 - cfg.metalBorderThick / 2, cfg.tableCenterY - cfg.tableH / 2 - vcushion, 'backarrow');
  //   const arrow = new PIXI.Sprite(PIXI.loader.resources['/images/backarrowlight.png'].texture);
  //   arrow.position.x = cfg.tableCenterX - cfg.tableW / 2 - cfg.metalBorderThick / 2 - 10;
  //   arrow.position.y = cfg.tableCenterY - cfg.tableH / 2 - 20;

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


  //       const b = gameSetup.firstMalletTouchedByCuemallet;
  //       let targetID = -1;
  //       let msg = "Please aim at a mallet first.";
  //       if (b != null) {
  //         if (gameSetup.initPlayerInfo.chosenColor != null) {
  //           if (gameSetup.firstMalletTouchedByCuemallet.mallet.colorType != gameSetup.initPlayerInfo.legalColor) {
  //             targetID = -1;
  //             msg = `Please aim at a ${gameSetup.initPlayerInfo.legalColor} mallet first.`;
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

  //       const targetMallet = gameSetup.malletsByID[targetID];
  //       const cuemallet = gameSetup.malletsByID[0];
  //       // let maxPocketID = null;
  //       const targetMalletPos = new Victor(targetMallet.position.x, targetMallet.position.y);

  //       let minAngleDiff = 3000;
  //       // let dirx = 0; let diry = 0;
  //       let minDir = null;
  //       const cuemalletPos = new Victor(gameSetup.cuemallet.position.x, gameSetup.cuemallet.position.y);
  //       for (let pocketID=0; pocketID<gameSetup.tablePocket.length; pocketID++) {
  //         const pocketPos = gameSetup.tablePocket[pocketID].clone();
  //         const dirMalletToPocket = pocketPos.clone().subtract(targetMalletPos);
  //         const dirAimToMallet = dirMalletToPocket.normalize().scale(config.malletD);
  //         const aimPos = targetMalletPos.clone().subtract(dirAimToMallet);
  //         const dirCueMalletToAim = aimPos.clone().subtract(cuemalletPos);

  //         // console.log("pocketPos " + JSON.stringify(pocketPos));
  //         // console.log("aimPos " + JSON.stringify(aimPos));
  //         // console.log("cuemalletPos " + JSON.stringify(cuemalletPos));

  //         // first filter out a pocket if the angle is too large
  //         const angleCueMalletToAim = dirCueMalletToAim.angle();
  //         const angleAimToMallet = dirAimToMallet.angle();
  //         let angleDiff = angleCueMalletToAim - angleAimToMallet;
  //         console.log("\n\nangle for pocketID " + pocketID + ": " + angleDiff);
  //         if (angleDiff >= Math.PI) angleDiff -= Math.PI * 2;
  //         if (angleDiff < 0 - Math.PI) angleDiff += Math.PI * 2;
  //         // console.log("angleCueMalletToAim " + angleCueMalletToAim + " angleAimToMallet " + angleAimToMallet + " angleDiff " + angleDiff)
  //         if (Math.abs(angleDiff) < minAngleDiff) {
  //           minAngleDiff = Math.abs(angleDiff);
  //           minDir = dirCueMalletToAim;
  //         }
  //       }

  //       gameSetup.cuemalletDirection.x = minDir.x;
  //       gameSetup.cuemalletDirection.y = minDir.y;


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
    s.position.x = config.tableW * 0.04 + c.cx - c.w / 2;
    s.position.y = config.fieldTop + c.cy - c.h / 2;
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
    gameSetup.sounds.cuemallethit.play();
    gameSetup.allStopped = false;
    // console.log("in applyStrike to apply impulse " + force.x + " " + force.y + Date.now());
    gameSetup.cuemallet.body.applyImpulse([force.x, force.y], 0, 0);
    // console.log("after applyStrike to apply impulse " + Date.now());
    gameSetup.cuemallet.body.av = av;
    gameSetup.cuemallet.body.hspin = hspin ? hspin : 0;
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


    const btn = new PIXI.Sprite(PIXI.loader.resources["/images/strikebutton2.png"].texture);
    btn.scale.set(cfg.w / 441, cfg.h / 196); // will overflow on bottom
    btn.position.x = cfg.x;
    btn.position.y = config.fieldTop + cfg.y;
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
    txt.y = config.fieldTop + cfg.y;
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
    richText.y = config.fieldTop + cfg.y + 5;
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



  const newf = new Victor(0, 0);
  this.drawForecast = () => {
    const config = gameSetup.config;
    const g = gameSetup.forecastG;

    if (g) {
      g.clear();
    }

    let b2 = gameSetup.soccer.body2;
    if (b2.trail.length > 1) {
      g.lineStyle(config.forecastGWidth, 0xffffff, 1);
      g.moveTo(b2.trail[0][0], b2.trail[0][1]);
      let px = b2.trail[0][0];
      let py = b2.trail[0][1];
      for (let k=1; k<b2.trail.length; k++) {
        if (1 || Math.abs(b2.trail[k][0] - px) >= config.malletD / 4 || Math.abs(b2.trail[k][1] - py) >= config.malletD / 4) {
          // console.log("draw to " + JSON.stringify(b2.trail[k]));
          g.lineTo(b2.trail[k][0], b2.trail[k][1]);
          px = b2.trail[k][0];
          py = b2.trail[k][1];
        }
      }
      // draw circle
      g.drawCircle(b2.trail[b2.trail.length-1][0], b2.trail[b2.trail.length-1][1], config.malletD / 8);      
    }

    for (let k=0; k<gameSetup.mallets.length; k++) {
      const m  = gameSetup.mallets[k];
      b2 = m.body2;
      if (b2.trail.length <= 1) continue;
      // if (i != 21) continue;

      g.lineStyle(config.forecastGWidth, b2.mallet.color, 1);
      // g.lineStyle(config.forecastGWidth*3, 0x00ff00, 1);
      // if (i == 0)
      //   console.log("draw trail for " + i + " " + JSON.stringify(b2.trail));
      g.moveTo(b2.trail[0][0], b2.trail[0][1]);
      let px = b2.trail[0][0];
      let py = b2.trail[0][1];
      for (let k=1; k<b2.trail.length; k++) {
        if (1 || Math.abs(b2.trail[k][0] - px) >= config.malletD / 4 || Math.abs(b2.trail[k][1] - py) >= config.malletD / 4) {
          // if (i == 21) console.log("draw to " + JSON.stringify(b2.trail[k]));
          g.lineTo(b2.trail[k][0], b2.trail[k][1]);
          px = b2.trail[k][0];
          py = b2.trail[k][1];
        }
      }
      // draw circle
      g.drawCircle(b2.trail[b2.trail.length-1][0], b2.trail[b2.trail.length-1][1], config.malletD / 8);      

      // move kick target and kick know and kick line! for local human player 
      for (let i=0; i<2; i++) {
        const pi = gameSetup.playerInfo[i];
        if (pi.playerType != "Human") continue; // simulation only works for local player
        if (!pi.isLocal) continue; // simulation only works for local player
        for (let j=0; j<pi.nextCommands.length; j++) {
          const cmd = pi.nextCommands[j];
          const tm = gameSetup.timerMallets[j];
          if (cmd.kickFrameIndex >= 0 && tm.chosenMalletID >= 0 && tm.chosenMalletID == cmd.playerID && cmd.targetXWhenApplied && cmd.targetXWhenApplied > -10000 ) {
            if (Math.abs(tm.kickTarget.position.x - cmd.targetXWhenApplied) > 0.1 && Math.abs(tm.kickTarget.position.y - cmd.targetYWhenApplied) > 0.1 ) {
              tm.kickTarget.position.x = cmd.targetXWhenApplied;
              tm.kickTarget.position.y = cmd.targetYWhenApplied;
              //const d = f.length() + gameSetup.config.malletD * 0.8;
              newf.x = cmd.forceX / gameSetup.config.kickStrengthScaler; newf.y = cmd.forceY / gameSetup.config.kickStrengthScaler;
              newf.multiplyScalar((newf.length() + gameSetup.config.malletD * 0.8)/newf.length());
              tm.kickKnob.position.x = tm.kickTarget.position.x + newf.x;
              tm.kickKnob.position.y = tm.kickTarget.position.y + newf.y;
              gameSetup.updateKickLine(tm.kickKnob);
            }
          }
        }
        break;
      }  
      
      // for (let x=0; x<gameSetup.config.MOVE_COUNT; x++) {
      //   const tm = gameSetup.timerMallets[x];
      //   const f = gameSetup.forecastParameters[x];
      //   if (tm.chosenMalletID == k && f.targetXWhenApplied && f.targetXWhenApplied > -10000 ) {
      //     if (Math.abs(tm.kickTarget.position.x - f.targetXWhenApplied) > 0.1 && Math.abs(tm.kickTarget.position.y - f.targetYWhenApplied) > 0.1 ) {
      //       tm.kickTarget.position.x = f.targetXWhenApplied;
      //       tm.kickTarget.position.y = f.targetYWhenApplied;
      //       const d = f.length() + gameSetup.config.malletD * 0.8;
      //       newf.x = f.x; newf.y = f.y;
      //       newf.multiplyScalar((newf.length() + gameSetup.config.malletD * 0.8)/newf.length());
      //       tm.kickKnob.position.x = tm.kickTarget.position.x + newf.x;
      //       tm.kickKnob.position.y = tm.kickTarget.position.y + newf.y;
      //       gameSetup.updateKickLine(tm.kickKnob);
      //     }
      //   }
      // }

    }
  };

  this.clearIsStopped = () => {
    const config = gameSetup.config;
    const allIDs = Object.keys(malletbodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b = malletbodies[i];
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

    return;
  };


  const recordRailTouchInfo = (myID) => {
    if (gameSetup.firstMalletTouchedByCuemallet !== null) {
      gameSetup.someMalletTouchedRailedAfter = true;
    }

    if (myID !== 0) {
      if (!gameSetup.malletsTouchedRails.includes(myID)) {
        gameSetup.malletsTouchedRails.push(myID);
      }
    } else { // cue mallet
      if (gameSetup.firstMalletTouchedByCuemallet == null) {
        gameSetup.firstMalletTouchAfterRail = true;
      }
    }
  };

  gameSetup.setupContactEvent = () => {
    world.on("beginContact", (evt) => {
      const b = evt.contactEquations[0].bodyA;
      const b2 = evt.contactEquations[0].bodyB;
      if (b.name == "mallet" && b2.name == "mallet") {
        // console.log("world begin contact " + b.ID + " " + b2.ID + " " + b.position[0]);
        if (b.ID == 0) {
          b.hasFirstContact = true;
          if (gameSetup.firstMalletTouchedByCuemallet === null) {
            // console.log("setting gameSetup.firstMalletTouchedByCuemallet = b2; color " + b2.colorType);
            gameSetup.firstMalletTouchedByCuemallet = b2;
          }
          b.touchedMallet = true;
        }
        if (b2.ID == 0) {
          b2.hasFirstContact = true;
          if (gameSetup.firstMalletTouchedByCuemallet === null) {
            // console.log("setting gameSetup.firstMalletTouchedByCuemallet = b; color " + b.colorType);
            gameSetup.firstMalletTouchedByCuemallet = b;
          }
          b2.touchedMallet = true;
        }
        gameSetup.sounds.malletclick.play();
      } else {
        let cname = b2.name;
        if (b.name == "mallet") {
          recordRailTouchInfo(b.ID);
          if (b.ID == 0) b.touchedRail = true;
        } else {
          recordRailTouchInfo(b2.ID);
          if (b2.ID == 0) b2.touchedRail = true;
          cname = b.name;
        }
        if (gameSetup.firstCushionTouchedByMallet == null) {
          gameSetup.firstCushionTouchedByMallet = cname;
        }
        gameSetup.sounds.malletbouncerail.play();
      }
    });

    // const p1 = new Victor(0,0);
    // const p2 = new Victor(0,0);
    // const v1 = new Victor(0, 0);
    // const v2 = new Victor(0, 0);
    // const rewindCollidingMallets = (b1, b2) => {
    //   // don't need  this for break shot state
    //   if (gameSetup.controller.gameState == 0) return;
    //   // first find which mallet is moving faster
    //   console.log("rewindCollidingMallets for " + b1.ID + " " + b2.ID);
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

    //   // now move both mallets back bit by bit until they are only marginally overlapping
    //   let dist = 0; //p1.distance(p2);
    //   const BD = config.malletD;
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

    //   // set mallet positions before equation solving
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
    //   if (b.name == "mallet" && b2.name == "mallet") {
    //     // rewind mallet pos back a bit so that the outgoing direction is correct
    //     rewindCollidingMallets(b, b2);
    //   }
    // });


    world2.on("beginContact", (evt) => {
      const b = evt.contactEquations[0].bodyA;
      const b2 = evt.contactEquations[0].bodyB;
      if (b.name == "mallet" && b2.name == "mallet") {
        if (b.ID == 0) {
          b.hasFirstContact = true;
          if (gameSetup.firstMalletTouchedByCuemallet === null) {
            gameSetup.firstMalletTouchedByCuemallet = b2;
          }
          b.touchedMallet = true;
        }
        if (b2.ID == 0) {
          b2.hasFirstContact = true;
          if (gameSetup.firstMalletTouchedByCuemallet === null) {
            gameSetup.firstMalletTouchedByCuemallet = b;
          }
          b2.touchedMallet = true;
        }
      } else {
        if (b.name == "mallet") {
          recordRailTouchInfo(b.ID);
          if (b.ID == 0) b.touchedRail = true;
        } else {
          recordRailTouchInfo(b2.ID);
          if (b2.ID == 0) b2.touchedRail = true;
        }
      }

      if (b.name == "mallet" && b.trail && b.inPocketID == null) {
        b.trail.push([b.position[0], b.position[1]]);
        // console.log("adding trail point " + b.ID + " " + b.position[0] + " " + b.position[1]);
      }
      if (b2.name == "mallet" && b2.trail && b2.inPocketID == null) {
        b2.trail.push([b2.position[0], b2.position[1]]);
        // console.log("adding trail point " + b2.ID + " " + b2.position[0] + " " + b2.position[1]);
      }
    });
  };

  this.setupForecast = () => {
    const config = gameSetup.config;

    let strength = 100;
    if (gameSetup.timerMallet1)
      strength = gameSetup.timerMallet1.value / 100 * MAX_SPEED;
    const m = 100;
    // const turnSpeed = Math.max(500, 2 * m * strength); // the higher is I, the less we turn
    // gameSetup.cuemalletDirection.rotate(0 - Math.PI / turnSpeed);


    gameSetup.prevStrength = 0;
    gameSetup.prevspinMultiplier = 0;
    gameSetup.prevDirX = 0;
    gameSetup.prevDirY = 0;


        // gameSetup.cuemalletDirection = new Victor(861.9682516429777, -5.169456405744111);
        // gameSetup.cuemalletDirection = new Victor(1, 0);
        // gameSetup.cuemalletAV = new Victor(-2000,0);
    let sizeratio = 0.8;
    // 10/90?
    gameSetup.slidingFriction = Math.fround(config.malletD / 1.1); // changed from 5 to 1! larger -> more curving since more speed store into av. controls how much is transferred between angular v and v on each step
    gameSetup.speedDecay = Math.fround(22); // larger -> sliding further. controls how speed slows down each cycle especially when mallet is slow

        // var testtarget = new Victor(-1 + config.tableCenterX + sizeratio*config.sidePocketD/2 + config.cushionBarShift/4, - 10 + config.tableCenterY+config.tableH/2 - config.cushionBarThick);
        // testtarget = new Victor(842.815, 180.495);
        // testtarget = new Victor(842.815, 176.495);
        // gameSetup.cuemalletDirection = testtarget.subtract(gameSetup.cuemallet.oldp);
        // gameSetup.maxForecastCount = 5;
        // gameSetup.forecastGs = [];
        // for(var i = 0; i < gameSetup.maxForecastCount; i ++) {
        //     gameSetup.forecastGs.push(gameSetup.add.graphics(0, 0));
        // }

        // gameSetup.cuemalletForecastG = null;

    // gameSetup.cueTrailG = gameSetup.add.graphics(0, 0);
    // gameSetup.cueTrailG.lineStyle(config.malletD * 0.05, 0x0000a0, 1);

    // gameSetup.otherTrailG = gameSetup.add.graphics(0, 0);
    // gameSetup.otherTrailG.lineStyle(config.malletD * 0.2, 0xa0a000, 1);

    // gameSetup.otherTrailG2 = gameSetup.add.graphics(0, 0);
    // gameSetup.otherTrailG2.lineStyle(config.malletD * 0.2, 0xa09030, 1);


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

        // shift out all lines by mallet radius
    gameSetup.shiftedBorderLines = [];
    gameSetup.fullyShiftedBorderLines = [];
    gameSetup.malletDCushion = config.malletD / 60;
    const malletDCushion = gameSetup.malletDCushion;
    for (let i = 0; i < gameSetup.borderLines.length; i++) {
      const line = gameSetup.borderLines[i];
            // console.log("borderline " + i + ": " + line.p1.x + " " + line.p1.y + " " + line.p2.x + " " + line.p2.y);
      const lineDir = line.p2.clone().subtract(line.p1);
      const normalDir = lineDir.clone().rotate(Math.PI / 2).normalize().multiplyScalar(config.malletD * 0.45);
      const normalDirFull = lineDir.clone().rotate(Math.PI / 2).normalize().multiplyScalar(config.malletD / 2 - malletDCushion);
      gameSetup.shiftedBorderLines.push({
        p1: line.p1.clone().add(normalDir), p2: line.p2.clone().add(normalDir), norm: line.norm
      });
      gameSetup.fullyShiftedBorderLines.push({
        p1: line.p1.clone().add(normalDirFull), p2: line.p2.clone().add(normalDirFull), norm: line.norm
      });
    }

        // 4 table top border lines
        // gameSetup.fieldTopBorders = [];
        // var p0 = new Victor(config.tableCenterX - config.tableW/2, config.tableCenterY - config.tableH/2);
        // var p1 = new Victor(config.tableCenterX + config.tableW/2, config.tableCenterY - config.tableH/2);
        // var p2 = new Victor(config.tableCenterX + config.tableW/2, config.tableCenterY + config.tableH/2);
        // var p3 = new Victor(config.tableCenterX - config.tableW/2, config.tableCenterY + config.tableH/2);

        // gameSetup.fieldTopBorders.push({p1: p0, p2: p1});
        // gameSetup.fieldTopBorders.push({p1: p1, p2: p2});
        // gameSetup.fieldTopBorders.push({p1: p2, p2: p3});
        // gameSetup.fieldTopBorders.push({p1: p3, p2: p0});


        // center rectangle
    const R = 2; // 1.1
    gameSetup.centerRectangle = new PIXI.Rectangle(
      config.tableCenterX - config.tableW / 2 + config.malletD * R,
      config.tableCenterY - config.tableH / 2 + config.malletD * R,
      config.tableW - config.malletD * 2 * R,
      config.tableH - config.malletD * 2 * R
    );

    gameSetup.innerRectangle = new PIXI.Rectangle(
      config.tableCenterX - config.tableW / 2 + config.malletD / 2 + config.cushionBarThick,
      config.tableCenterY - config.tableH / 2 + config.malletD / 2 + config.cushionBarThick,
      config.tableW - config.malletD - 2 * config.cushionBarThick,
      config.tableH - config.malletD - 2 * config.cushionBarThick
    );


        // gameSetup.centerRectangle = new Phaser.Rectangle(
        //     config.tableCenterX - config.tableW/2 + config.cushionBarThick + config.malletD/2 - malletDCushion +1,
        //     config.tableCenterY - config.tableH/2 + config.cushionBarThick + config.malletD/2 - malletDCushion +1,
        //     config.tableW - 2*config.cushionBarThick - config.malletD + 2*malletDCushion - 2,
        //     config.tableH - 2*config.cushionBarThick - config.malletD + 2*malletDCushion- 2
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
    const knoby = gameSetup.config.fieldTop + cfg.y + cfg.hlow - ratio * (cfg.hlow - cfg.hhigh);
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

      for (let i=0; i<2; i++) {
        const pi = gameSetup.playerInfo[i];
        pi.isPlanning = false;
      }

      gameSetup.timerID = setInterval(() => {
        if (gameSetup.gameOver) return;
        if (!gameSetup.gameStarted) return;

        // for each player, if still thinking, subtract time
        let cmdstr = "";
        for (let i=0; i<2; i++) {
          const pi = gameSetup.playerInfo[i];
          // console.log("pi " + i + " isplanning " + pi.isPlanning);
          if (pi.isPlanning) {
            pi.secondsLeft -= 1;
            if (pi.secondsLeft < 0) pi.secondsLeft = 0;
          }

          if (gameSetup.isLocal) {
            pi.c.updateTimer(pi.secondsLeft);
          } else {
            cmdstr = `${pi.ID}_${pi.secondsLeft}`;
            gameSetup.networkHandler.sendCommandToAll({
              c: "UpdateTimer", t: gameSetup.currentCycleTime, w: cmdstr
            });
  
          }
        }
        // if (!gameSetup.isLocal) {
        //   gameSetup.networkHandler.sendCommandToAll({
        //     c: "UpdateTimer", t: gameSetup.currentCycleTime, w: cmdstr
        //   });
        // }
        // gameSetup.config.playerPanel1.updateTimer();
        // gameSetup.config.playerPanel2.updateTimer();
      }, 1000);
    } else {
      // gameSetup.timerID = setInterval(() => {
      //   if (gameSetup.gameOver) return;
      //   if (!gameSetup.networkHandler) return;

      //   if (gameSetup.isLocal) {
      //   } else {
      //     //this.setNewPlayerState(gameSetup.initPlayerInfo.ID, CALL_SHOT_STATE, -1, x, y);
      //     gameSetup.networkHandler.sendCommandToAll({
      //       c: "KeepALive", t: gameSetup.currentCycleTime, w: `${0}`
      //     });
      //   }
      //   // gameSetup.config.playerPanel1.updateTimer();
      //   // gameSetup.config.playerPanel2.updateTimer();
      // }, 1000);
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
    
    this.addTimerMallets();
    this.addTimerMalletSelectorPanel();
    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) return;

    const config = gameSetup.config;
    this.addSubmitButton();
    // this.addProbText();
    // this.addCWNew();
    // this.addVSpinMalletNew();
    // this.addHSpinMalletNew();
    // this.addStrengthMalletNew();
    // this.setupMeterClick();
    // this.setupKeyboardControl();

    // this.addSpinMallet();
    // this.addStrengthHand();
    // this.addCW();


    config.playerPanel1.PanelID = 0;
    gameSetup.playerInfo1.bg = this.addPlayerPanelNew(config.playerPanel1, gameSetup.playerInfo1);
    gameSetup.playerInfo1.c = config.playerPanel1;

    config.playerPanel2.PanelID = 1;
    // config.playerPanel2.isHuman = false; // hack to test
    gameSetup.playerInfo2.bg = this.addPlayerPanelNew(config.playerPanel2, gameSetup.playerInfo2);
    gameSetup.playerInfo2.c = config.playerPanel2;

    this.setupTimerUpdate();


    // gameSetup.stage.updateLayersOrder = function () {
    //   gameSetup.stage.children.sort(function(a,b) {
    //       a.zIndex = a.zIndex || 0;
    //       b.zIndex = b.zIndex || 0;
    //       return b.zIndex - a.zIndex
    //   });
    // };

    // gameSetup.stage.updateLayersOrder();

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


    const GameEngine = this;

    gameSetup.cmdHistory = [];
    gameSetup.cmdReceiveHistory = [];
    gameSetup.cmdReceiveHistoryT = [];
    gameSetup.failedToReconnect = false;
    gameSetup.inQuit = false;

    gameSetup.getPosStr = () => {
      let posStr = "";
      const config = gameSetup.config;
      // it's possible mallet 0 is not synced!
      for (let k=0; k<gameSetup.mallets.length; k++) {
        const b = gameSetup.mallets[k];
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
              gameSetup.networkHandler = new NetworkHandler(GameEngine, true);
            } else {
              gameSetup.networkHandler = new NetworkHandler(GameEngine, false);
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
                // SoccerGameObj.tick();
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
      console.log(`new room update _id: ${JSON.stringify(room._id)} 1 in ${room.user1InRoom} 2 in ${room.user2InRoom}`);
      if (room.user1InRoom && room.user2InRoom) {
        // console.log(`both players in room!`);

        if (!gameSetup.peerReady) {
          // first time room is ready, so kick start game
          gameSetup.peerReady = true;
          if (gameSetup.isLocal) {
            gameSetup.networkHandler = new NetworkHandler(GameEngine, true);
          } else {
            gameSetup.networkHandler = new NetworkHandler(GameEngine, false);
          }
          gameSetup.controller.tryStartGame();
        } else {
          // update of commands
          if (room.gameCommandHistory && room.gameCommandHistory.length > 0) {
            // console.log("cmd history length: " + room.gameCommandHistory.length);
            let newCmdStartIndex = room.gameCommandHistory.length-1;
            for (let i=room.gameCommandHistory.length-1; i>= 0; i-- ) {
              const data = room.gameCommandHistory[i];
              const start = getPosition(data, ";", 2);
              const cmd = data.substring(start+1);
              // const cmdkey = cmd.c + "_" + cmd.t + "_" + cmd.w;
              // console.log("comparing " + i + ": " + lastProcessedCmdKey + " vs " + cmd);
              if (lastProcessedCmdKey == cmd) {
                newCmdStartIndex = i+1;
                break;
              }
            }
            for (let i=newCmdStartIndex; i <=room.gameCommandHistory.length-1 ; i++ ) {
              const data = room.gameCommandHistory[i];
              const start = getPosition(data, ";", 2);
              const cmd = data.substring(start+1);
              // const cmdkey = cmd.c + "_" + cmd.t + "_" + cmd.w;
              lastProcessedCmdKey = cmd;
              lastProcessedIndex = i;
              
              gameSetup.networkHandler.handleWTCData(cmd);
            }

            // console.log("last " + lastProcessedIndex + ": " + lastProcessedCmdKey);
            

          }
        }
        return;


        if (gameSetup.peerReady) {
          // console.log(`game peer ready so room update!`);
        } else {
          // console.log(`peer setup related update`);
          gameSetup.showModalMessage('Connecting players ...', '', MODAL_NOBUTTON);

          if (!gameSetup.connectionTimer) {
            // console.log('setup connection timer ');
            gameSetup.connectionTimer = setTimeout(() => {
              if ( typeof(gameSetup.peerReady) != "undefined" && !gameSetup.peerReady && gameSetup.showModalMessage) {
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

          // setup!
          gameSetup.setupPeer(room);

        }
      } else {
        console.log(`still waiting for player to enter room ${room._id} ${room.user1InRoom} ${room.user2InRoom}`);
        gameSetup.peerReady = false;
      }
      // gameSetup.showModalMessage("")
    };

    // console.log("dddd set handle room");
  };

  this.initScreen = () => {
    this.createTableAll();
    this.createControls();


    // this.setupForecast();

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      this.setupTestResultDisplay();
      this.setupHandleTestResult();
    } else {
      // this.addInputEmitter();

    }

    this.initializeForecastG();

    this.setupTbotMessage();


    this.addHelpQuestionMark();


    this.addModalMessageScreen();
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

  this.drawTestResultScreen = () => {
    // debugger;
    container = document.getElementById('gameDiv');
    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType == GAME_TYPE.TESTING ) {
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
      gameSetup.peerReady = false;
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
          // if (false && gameSetup.initPlayerInfo && gameSetup.pairData) {
          //   const params = {
          //     modalIsOpen: true,
          //     sectionKey: gameSetup.pairData.sectionId,
          //     tournamentId: gameSetup.pairData.tournamentId
          //   };
          //   PoolActions.finishTournamentSectionRound(
          //     gameSetup.pairData.roundId,
          //     gameSetup.initPlayerInfo.playerUserId,
          //     gameSetup.pairData.id,
          //     PLAYER_TYPE.WINNER
          //   );
          //   gameSetup.reacthistory.push(`/tournament/${gameSetup.room.gameId}`, params);
          // }
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
        // if (gameSetup && gameSetup.exitGame)
        //   gameSetup.exitGame();
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
      // gameSetup.cleanContainer(gameSetup.malletcontainer);
      // gameSetup.cleanContainer(gameSetup.overlaycontainer);
      // gameSetup.cleanContainer(gameSetup.overlaycontainer2);

      gameSetup.cleanRenderer(gameSetup.renderer);
      // gameSetup.cleanRenderer(tablerenderer);
      // gameSetup.cleanRenderer(malletrenderer);
      // gameSetup.cleanRenderer(overlayrenderer);
      // gameSetup.cleanRenderer(overlayrenderer2);


      gameSetup.unloadSounds();
      // delete malletbodies;
      // delete malletbodies2;
      const allIDs = Object.keys(malletbodies);
      for (let j=0; j<allIDs.length; j++) {
        const i = allIDs[j];
        const b = malletbodies[i];
        for (let k=b.shapes.length-1; k>=0; --k) {
          b.removeShape(b.shapes[i]);
        }
        const b2 = malletbodies2[i];
        for (let k=b2.shapes.length-1; k>=0; --k) {
          b2.removeShape(b2.shapes[i]);
        }
        b.mallet = null;
        malletbodies[i] = null;
        b2.mallet = null;
        malletbodies2[i] = null;
      }
      // malletbodies.length = 0;
      // malletbodies2.length = 0;

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


      // mallet and table container at smaller and aligned bottom left

      const wratio = (cfg.tableW + 2 * cfg.metalBorderThick) / cfg.TrueWidth;
      const hratio = (cfg.tableH + 2 * cfg.metalBorderThick) / cfg.TrueHeight;
      w = w * wratio;
      h = h * hratio;



      malletrenderer.view.width = w;
      malletrenderer.view.height = h;
      malletrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);
      if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
        // only show table
        // cfg.fieldTop = 0;
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

    if (document.addEventListener) {
      document.addEventListener('webkitfullscreenchange', gameSetup.fullScreenHandler, false);
      document.addEventListener('mozfullscreenchange', gameSetup.fullScreenHandler, false);
      document.addEventListener('fullscreenchange', gameSetup.fullScreenHandler, false);
      document.addEventListener('MSFullscreenChange', gameSetup.fullScreenHandler, false);
    }
  };

  this.loadSounds = function () {
    gameSetup.sounds = {};
    gameSetup.sounds.malletbouncerail = new Howl({ src: ['/sounds/malletbouncerail.wav'] });
    gameSetup.sounds.magicwand = new Howl({ src: ['/sounds/magicwand.mp3'], volume: 0.2 });
    gameSetup.sounds.malletclick = new Howl({ src: ['/sounds/malletclick.wav'] });
    gameSetup.sounds.malletpocketed = new Howl({ src: ['/sounds/malletpocketed.wav'] });
    // gameSetup.sounds.breakshot = new Howl({ src: ['/sounds/breakshot.wav'] });
    gameSetup.sounds.cuemallethit = new Howl({ src: ['/sounds/cuemallethit.wav'] });
    gameSetup.sounds.backgroundmusic = new Howl({ src: ['/sounds/happymusicsmall.mp3'], loop: true, volume: 0.5 });
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

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // only show table
      // cfg.fieldTop = 0;
      gameSetup.overlaycontainer.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
      mw = cfg.tableW + 2 * cfg.metalBorderThick;
      mh = cfg.tableH + 2 * cfg.metalBorderThick;
    } else {
      // same scaling as all
      gameSetup.overlaycontainer.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
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

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
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

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      // only show table
      // cfg.fieldTop = 0;
      gameSetup.overlaycontainer2.scale.x = w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer2.scale.y = h / (cfg.tableH + 2 * cfg.metalBorderThick);
      mw = cfg.tableW + 2 * cfg.metalBorderThick;
      mh = cfg.tableH + 2 * cfg.metalBorderThick;
    } else {
      // same scaling as all
      gameSetup.overlaycontainer2.scale.x = gameSetup.controlcontainer.scale.x; //  w / (cfg.TrueWidth); //w / (cfg.tableW + 2 * cfg.metalBorderThick);
      gameSetup.overlaycontainer2.scale.y = gameSetup.controlcontainer.scale.y; // h / (cfg.TrueHeight); // h / (cfg.tableH + 2 * cfg.metalBorderThick);
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

    gameSetup.handleTestResult = (res) => {

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
          //   if (p[k].indexOf("PlaceMalletOnTable") >= 0 || p[k].indexOf("ResetTable") >= 0) {
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


      if (window.testCondition == "TestFinishedCueMalletNotPocketed") {
        const inPocketID = gameSetup.malletsByID[CUE_BALL_ID].body.inPocketID;
        if (typeof(inPocketID) == 'undefined' || inPocketID === null) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: cue mallet pocketed.";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("NoneProb") >= 0) {
        if (window.probabilityInquiryHistory != "") {
          window.testResult = `Test failed: you should not need to ask for success probability for any mallet.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedNoProbabilityInquiry_") == 0) {
        const p = window.testCondition.split("_");
        const malletID = Number(p[1]);
        const pocketID = Number(p[2]);
        const h = window.probabilityInquiryHistory.split(";");
        let found = false;
        for (let k=0; k<h.length; k++) {
          if (h[k] == `${malletID}_${pocketID}`) {
            found = true; break;
          }
        }

        if (found) {
          window.testResult = `Test failed: you should not be asking for success probability for target mallet ${malletID} and target pocket ${pocketID}.`;
        } else {
          window.testResult = "Test passed!";
        }
        gameSetup.showTestResult();
        return;

      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedNoProbabilityInquiry2_") == 0) {
        const p = window.testCondition.split("_");
        const malletID = Number(p[1]);
        const h = window.probabilityInquiryHistory.split(";");
        let found = false;
        for (let k=0; k<h.length; k++) {
          if (h[k].indexOf(`${malletID}_`) == 0) {
            found = true; break;
          }
        }

        if (found) {
          window.testResult = `Test failed: you should not be asking for success probability for target mallet ${malletID}.`;
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

      // TestFinishedPlottedBasicScatterChart_MalletDistance_Probability
      if (window.testCondition && window.testCondition.indexOf("TestFinishedPlottedBasicScatterChart_MalletDistance_Probability") == 0) {
        if (!window.plottedBasicScatterMalletDistanceProbability) {
          window.testResult = `Test failed: you did not successfully plot a scatter plot between MalletDistance and Probability.`;
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
          window.testResult = `Test failed: you did not successfully save training data for all attributes of 'MalletDistance', 'PocketDistance', 'CutAngle' and 'Probability'.`;
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


      if (window.testCondition && window.testCondition.indexOf("TestTrainLinearModelCutAngleMalletPocketDistance") == 0) {
        if (!window.trainLinearModelX.length == 3 && window.trainLinearModelX.includes('MalletDistance') && window.trainLinearModelX.includes('CutAngle') && window.trainLinearModelX.includes('PocketDistance') ) {
          window.testResult = `Test failed: you did not train the probability model using all of MalletDistance, CutAngle and PocketDistance.`;
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

      if (window.testCondition && window.testCondition.indexOf("TestFinished_Strength10") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinished_Strength7") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinishedCallCalcEndState") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedCallConsoleLog") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }
      if (window.testCondition && window.testCondition.indexOf("TestFinishedAimY35") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition && window.testCondition.indexOf("TestFinishedAimYCall00") >= 0) {
        window.testResult = "Test passed!";
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition && window.testCondition.indexOf("TestFinishedMalletReboundCushion_") == 0) {
        const pp = window.testCondition.split("_");
        if (gameSetup.firstCushionTouchedByMallet == `polybody${pp[1]}`) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: target mallet didn't bounce off top right cushion first.";
        }
        gameSetup.showTestResult();
        return;
      }

      if (window.testCondition == "TestFinishedYellowMalletFirstTouch") {
        if (gameSetup.firstMalletTouchedByCuemallet === null) {
          window.testResult = "Test failed: no mallet touched by cue mallet.";
        } else {
          if (gameSetup.firstMalletTouchedByCuemallet.colorType == MalletColors.YELLOW) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first mallet hit by cue mallet is not yellow.";
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

      if (window.testCondition == "TestFinishedRedMalletFirstTouch") {
        if (gameSetup.firstMalletTouchedByCuemallet === null) {
          window.testResult = "Test failed: no mallet touched by cue mallet.";
        } else {
          if (gameSetup.firstMalletTouchedByCuemallet.colorType == MalletColors.RED) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first mallet hit by cue mallet is not red.";
          }
        }
        gameSetup.showTestResult();
        return;
      }

      //TestFinishedFirstTouchMallet_2
      if (window.testCondition && window.testCondition.indexOf("TestFinishedFirstTouchMallet") == 0) {
        if (gameSetup.firstMalletTouchedByCuemallet === null) {
          window.testResult = "Test failed: no mallet touched by cue mallet.";
        } else {
          const pp = window.testCondition.split("_");
          if (gameSetup.firstMalletTouchedByCuemallet.ID == pp[1]) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = `Test failed: first mallet hit by cue mallet is not mallet ${pp[1]}`;
          }
        }
        gameSetup.showTestResult();
        return;
      }

      // TestPPPocketMallet_3_In_1
      if (window.testCondition && window.testCondition.indexOf("TestPPPocketMallet_") == 0) {
        const pp = window.testCondition.split("_");
        const b = gameSetup.malletbodies[pp[1]];
        const pocketid = pp[3];
        if (b.inPocketID == pocketid || (pocketid == 6 && [0, 1, 2, 3, 4, 5].includes(b.inPocketID))) {
          window.testResult = "Test passed!";
        } else {
          if (pocketid == 6)
            window.testResult = `Test failed: expected mallet ${pp[1]} to fall in some pocket.`;
          else
            window.testResult = `Test failed: expected mallet ${pp[1]} to fall in pocket ${pocketid}.`;
        }
        gameSetup.showTestResult();
        return;
      }

       // TestPPPocketMallet2_2_In_4_3_In_2
       if (window.testCondition && window.testCondition.indexOf("TestPPPocketMallet2_") == 0) {
        const pp = window.testCondition.split("_");
        const b = gameSetup.malletbodies[pp[1]];
        const b2 = gameSetup.malletbodies[pp[4]];
        const pocketid = pp[3];
        const pocketid2 = pp[6];
        if (b.inPocketID == pocketid && b2.inPocketID == pocketid2 ) {
          window.testResult = "Test passed!";
        } else {
            window.testResult = `Test failed: expected mallet ${pp[1]} to fall in pocket ${pocketid} and mallet ${pp[4]} to fall in pocket ${pocketid2}. `;
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedFirstHitMallet") == 0) {
        const themalletid = window.testCondition.substring("TestFinishedFirstHitMallet".length);
        if (gameSetup.firstMalletTouchedByCuemallet === null) {
          window.testResult = "Test failed: no mallet touched by cue mallet.";
        } else {
          if (gameSetup.firstMalletTouchedByCuemallet.ID == themalletid) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first mallet hit by cue mallet is not number " + themalletid + ".";
          }
        }
        gameSetup.showTestResult();
        return;
      }



      if (window.testCondition == "TestFinishedBlackMalletFirstTouch") {
        if (gameSetup.firstMalletTouchedByCuemallet === null) {
          window.testResult = "Test failed: no mallet touched by cue mallet.";
        } else {
          if (gameSetup.firstMalletTouchedByCuemallet.colorType == MalletColors.BLACK) {
            window.testResult = "Test passed!";
          } else {
            window.testResult = "Test failed: first mallet hit by cue mallet is not black.";
          }
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition == "TestFinishedBlackMalletPocketed") {
        if (typeof(gameSetup.malletsByID[BLACK_BALL_ID].body.inPocketID) != 'undefined' && gameSetup.malletsByID[BLACK_BALL_ID].body.inPocketID !== null) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: black mallet not pocketed.";
        }
        gameSetup.showTestResult();
        return;
      }


      if (window.testCondition && window.testCondition.indexOf("TestFinishedMalletPocketed_") == 0) {
        const pp = window.testCondition.split("_");
        if (gameSetup.malletsByID[pp[1]].body.inPocketID == pp[2]) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = `FAIL (mallet ${pp[1]} not pocketed in pocket ${pp[2]})`;
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
      // window.FirstTouchMalletIsRed = gameSetup.firstMalletTouchedByCuemallet.colorType == MalletColors.RED;
      // window.FirstTouchMalletIsYellow = gameSetup.firstMalletTouchedByCuemallet.colorType == MalletColors.YELLOW;
      // window.FirstTouchMalletIsBlack = gameSetup.firstMalletTouchedByCuemallet.colorType == MalletColors.BLACK;

    };



    gameSetup.handleSubmitData = (data) => {
      // store data into indexeddb
      // debugger;
      localForage.setItem(data.tableName, data.tableValue, function() {
        console.log(`Saved: ${data.tableName}`);
        gameSetup.initPlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_SCRIPT_SUBMIT_DATA,
          'resolveID': data.resolveID
        });

        let t = data.tableValue;
        if (!t.MalletDistance || !t.PocketDistance || !t.CutAngle || !t.Probability) {

        } else {
          if (t.MalletDistance.length == t.PocketDistance.length && t.MalletDistance.length == t.CutAngle.length && t.MalletDistance.length == t.Probability.length) {
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


        gameSetup.initPlayerInfo.playerWorker.sendMessage({
          'cmd': CMD_SCRIPT_TRAIN_LINEAR_MODEL,
          'model': model,
          'resolveID': data.resolveID
        });
      });
    };

    gameSetup.handleLoadData = (data) => {
      localForage.getItem(data.tableName, (err, tableValue) => {
        gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
          if (data.yCol == 'Probability' && data.xCol == "MalletDistance")
            window.plottedBasicScatterMalletDistanceProbability = true;
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


        gameSetup.initPlayerInfo.playerWorker.sendMessage({
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
  //       const NewInitPlayerInfoID = 0;
  //       gameSetup.networkHandler.sendCommandToAll({
  //         c: "NewInitPlayerInfo", t: gameSetup.currentCycleTime, w: NewInitPlayerInfoID
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

  const processBody = (b, isSim) => {
    if (Math.abs(b.velocity[0]) < 20 && Math.abs(b.velocity[1]) < 20) {
      b.velocity[0] = 0; b.velocity[1] = 0;
    }
    if (isSim && b.trail) {
      const p = b.trail[b.trail.length-1];
      if (b.position[0] != p[0] || b.position[1] != p[1])
        b.trail.push([b.position[0], b.position[1]]);
      // if (b.ID == "4")
      //   console.log("add trail " + b.ID + " " + b.position[0] + " " + b.position[1] + " v " + b.velocity[0] + " " + b.velocity[1]);
    }
  };
  
  this.checkGoalOrAllStopped = (isSim, cnt) => {
    const pos = new Victor(0, 0);
    const cfg = gameSetup.config;
    let allStopped = true;
    // first check for goal event

    let sb = gameSetup.soccer.body;
    if (isSim) sb = gameSetup.soccer.body2;
    gameSetup.inGoal = -1;
    
    if (sb.position[0] > cfg.tableCenterX + cfg.tableW/2 + cfg.soccerD/2) {
      gameSetup.inGoal = 1;
    } else if (sb.position[0] < cfg.tableCenterX - cfg.tableW/2 - cfg.soccerD/2) {
      gameSetup.inGoal = 0;
    }

    if (gameSetup.inGoal >= 0) {
      return true;
    }
    processBody(sb, isSim);
    if (sb.velocity[0] != 0 || sb.velocity[1] != 0) {
      allStopped = false;
    }

    // check mallets
    // console.log("\n\nadd trail");

    for (let k=0; k<gameSetup.mallets.length; k++) {
      const m  = gameSetup.mallets[k];
      let b = m.body;
      if (isSim) b = m.body2;

      processBody(b, isSim);

      if (k == 0) {
        // console.log(b.velocity[0] + " " + b.velocity[1] + " " + b.position[0]);
      }

      if (b.velocity[0] != 0 || b.velocity[1] != 0) {
        allStopped = false;

        // add to time period
        // if (m.timePeriods.length == 0) {
        //   m.timePeriods.push({
        //     start: cnt, stop: -1
        //   });
        // } else {
        //   const tp = m.timePeriods[m.timePeriods.length-1];
        //   if (tp.stop >= 0) {
        //     m.timePeriods.push({
        //       start: cnt, stop: -1
        //     });
        //   }
        // }
      } else {
        // if (m.timePeriods.length > 0) {
        //   const tp = m.timePeriods[m.timePeriods.length-1];
        //   if (tp.stop < 0) {
        //     tp.stop = cnt;
        //   }
        // }
      }
    }

    //if (cnt < gameSetup.config.timeIndexLimit) allStopped = false;

    if (allStopped) {
      // console.log("all stopped! ");

      for (let i=0; i<2; i++) {
        const pi = gameSetup.playerInfo[i];
        if (!pi.nextCommands) continue;
        for (let j=0; j<pi.nextCommands.length; j++) {
          const cmd = pi.nextCommands[j];
          if (cmd.kickFrameIndex >= cnt) {
            allStopped = false;
            break;
          }  
        }
      }  
      
    }
    return allStopped;

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
        // if we only care about pocketing probability of target mallet...
      } else {
        if (b2.ID == 2 && b2.position[1] <= 673) {
          // console.log("mallet 2 pos " + pos.x + " " + pos.y);
        }
        b2.inPocketID = this.checkIfPocketed(pos, b2.ID);
        // if (b2.ID == 2 && b2.inPocketID > 0)
        // console.log("mallet " + b2.ID + " color " + b2.colorType + " in pocket ID " + b2.inPocketID);
        if (b2.inPocketID == null && isNaN(b2.position[0])) {
          debugger;
        }
        if (b2.inPocketID != null && b2.ID != 0) {
          // debugger;
          if (!gameSetup.newlyPocketedMallets.includes(b2.ID)) {
            gameSetup.newlyPocketedMallets.push(b2.ID);
          }
        }

        if (b2.inPocketID != null) {
          // add to trail
          if (b2.trail) {
            b2.trail.push([b2.position[0], b2.position[1]]);
          }
        }

        if (b2.inPocketID != null && !b2.isSim) {
          gameSetup.sounds.malletpocketed.play();
          const p = gameSetup.tablePocket2[b2.inPocketID];
          that.showPocketingStar(p.x, p.y);
        }

        // short cut?
        if (b2.inPocketID != null && isProb && b2.ID == savedTargetMalletID) {
          return true;
        }

        if (b2.ID == 0) {
          // console.log("cue mallet stop test: " + b2.position[0] + " " + b2.position[1] + " " + b2.av.x + " " + b2.velocity[0]);
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
                if (b2.position[0] != p[0] || b2.position[1] != p[1])
                  b2.trail.push([b2.position[0], b2.position[1]]);
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
      // console.log("test mallet 1 pocketing pos y " + pos.y + " " + pos.x);
    }
    // debugger;
    if (isNaN(pos.x) || (isNaN(pos.y))) {

      return 0;
    }

    if (Math.abs(pos.x - config.tableCenterX) <= config.malletD * 2) { // only need to test for center pockets
      if (pos.y < config.tableCenterY && pos.y > config.tableCenterY - config.tableH/2 + config.malletD * 0.67) {
        // if (ID == 3) console.log("return too in 1 "  + pos.x + " " + pos.y);
        return null;
      }
      if (pos.y > config.tableCenterY && pos.y < config.tableCenterY + config.tableH/2 - config.malletD * 0.67) {
        // if (ID == 3) console.log("return too in 2 "  + pos.x + " " + pos.y);
        return null;
      }
    }


    if ((gameSetup.centerRectangle.contains(pos.x, pos.y))) {
      // inside rectangle, so if
      // if (ID == 3) console.log("return in center " + pos.x + " " + pos.y);
      return null;
    }

    if (Math.abs(pos.x - config.tableCenterX) >= (config.tableW / 2 - config.malletD / 6) || Math.abs(pos.y - config.tableCenterY) >= (config.tableH / 2 - config.malletD / 6)) {
      // if (ID == 3) console.log("outside table " + pos.x + " " + pos.y);
      // outside table, so find nearest pocket
      if (ID == 21) {
        // console.log("outside table mallet 21 pos " + pos.x.toFixed(2) + " " + pos.y.toFixed(2));
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
        // console.log("table border mallet 21 pos " + pos.x.toFixed(2) + " " + pos.y.toFixed(2));
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
      const newspeed = Math.fround(Math.max(0, speed - config.malletD / (dd * (1 + speed / 100000000))));
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
    b.touchedMallet = false;

    if (!b.oldv) b.oldv = new Victor(0, 0);
    b.oldv.x = b.velocity[0];
    b.oldv.y = b.velocity[1];
  };

  this.adjustForHSpin = (b) => {
    if (b.hspin == 0) return;
    if (b.touchedRail || b.touchedMallet) {
      // debugger;
      // adjust cue mallet velocity direction and speed
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

      // now calculate how much is new velocity due to friction that's to be added to mallet velocity
      let maxAdjAmount = 20;
      if (b.touchedMallet) {
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
      // if (b.touchedMallet) {
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


  this.countMalletOnTable = (c) => {
    let count = 0;
    for (let k=0; k < gameSetup.mallets.length; k++) {
      const b2 = malletbodies2[k];
      if ( ( typeof(b2.inPocketID) == "undefined" || b2.inPocketID == null) && b2.colorType == c) {
        count ++;
      }
    }
    return count;
  };

  this.applyKicksForThisTime = (isSim, cnt) => {

    for (let i=0; i<2; i++) {
      const pi = gameSetup.playerInfo[i];
      if (isSim && pi.playerType != "Human") continue; // simulation only works for local player
      if (isSim && !pi.isLocal) continue; // simulation only works for local player
      for (let j=0; j<pi.nextCommands.length; j++) {
        const cmd = pi.nextCommands[j];
        if (cmd.kickFrameIndex < 0) continue;
        const m = gameSetup.mallets[cmd.playerID + pi.ID * 5]; 
        let b2 = m.body2;
        if (!isSim) b2 = m.body;
        if (cnt == cmd.kickFrameIndex) {
          if (!isSim) {
            console.log("apply kick m " + m.ID + " " + m.position.x + " " + m.position.y + " " + cmd.forceX + " " + cmd.forceY );
          }
          b2.applyImpulse([cmd.forceX, cmd.forceY], 0, 0);  
          cmd.targetXWhenApplied = b2.position[0];
          cmd.targetYWhenApplied = b2.position[1];
        }
      }
    }


    // for (let k=0; k<gameSetup.config.MOVE_COUNT; k++) {
    //   const f = gameSetup.forecastParameters[k];
    //   const tm = gameSetup.timerMallets[k];
    //   if (tm.chosenMalletID < 0) continue;
    //   if (f.x == 0 && f.y == 0) continue;
    //   const m  = gameSetup.mallets[tm.chosenMalletID];
    //   let b2 = m.body2;
    //   if (!isSim) b2 = m.body;
      
    //   if (f.startIndex == cnt) {
    //     b2.applyImpulse([f.x, f.y], 0, 0);  
    //     f.targetXWhenApplied = b2.position[0];
    //     f.targetYWhenApplied = b2.position[1];
    //   }
    // }
  };

  // isProb: false then update forecast, true then estimate pocket probability
  /*
    3 modes of simulation:
    1. SIM_PROB: part of a probability run with pre-specified skew so just needs to know if target is pocketd.
    2. SIM_DRAW: need to draw forecast lines with no skew
    3. SIM_ENDSTATE: similar to SIM_PROB, run with pre-specified skew, no need for drawing
  */
  this.runSimulation = (simType, simSkew, savedTargetMalletID) => {
    const config = gameSetup.config;
    // if input has changed, run simulation in world2 and draw forecast trail
    // const strength = gameSetup.timerMallet1.value / unitScale; // unit difference?
    // const spinMultiplier = 0 - SPIN_M * gameSetup.timerMallet2.value;
    // const dir = gameSetup.cuemalletDirection.clone();

    if (simType == SIM_DRAW) {

      this.clearForecastLines();

    } else {
    }

    const time2 = getMS();
    // console.log("sim time 1 " + (time2 - time1));

    if (window.InitState) {
      this.setupWorld2ByInitState();
    } else {
      this.copyWorldTo2();
    }

    // for (let k=0; k<gameSetup.mallets.length; k++) {
    //   const f = gameSetup.forecastParameters[k];
    //   const m  = gameSetup.mallets[k];
    //   const b2 = m.body2;
    //   //const kickStrengthScaler = -4;
    //   m.startIndex = 0;
    //   m.timePeriods = [];
    //   if (f.x ==0 && f.y ==0) {
        
    //   } else {
    //     if ( k <= 4) {
    //       const timerm = gameSetup.timerMallets[k];
    //       m.startIndex = Math.floor((timerm.position.y - config.ybase) / (config.ymax - config.ybase) * config.timeIndexLimit);
          
    //       //b2.applyImpulse([f.x * kickStrengthScaler, f.y * kickStrengthScaler], 0, 0);  
    //     }
    //   }
    // }

    // physics loop
    let allStopped2 = false;
    let cnt = 0;
    // let ROUNDS = Math.round(strength/500);
    // if (ROUNDS < 2) ROUNDS = 2;
    // const stepsizePerRound = stepsize / ROUNDS;

    // console.log("run simulation with " + strength.toFixed(0) + " " + dir.x.toFixed(1) + " " + dir.y.toFixed(1) );

    const time3 = getMS();
    // console.log("sim time 2 " + (time3 - time2));


    // setup command for local player
    for (let i=0; i<2; i++) {
      const pi = gameSetup.playerInfo[i];
      if (pi.isLocal && pi.playerType == "Human") {
        pi.nextCommands = [];
        for (let j=0; j<config.MOVE_COUNT; j++) {
          const tm = gameSetup.timerMallets[j];
          if (tm.chosenMalletID >= 0) {
            const cmd = {playerID: tm.chosenMalletID};
            // check timing
            const newIndex = Math.floor((tm.timerKnob.position.y - config.ybase) / (config.ymax - config.ybase) * config.timeIndexLimit);
            // console.log("move j " + j + " newIndex " + newIndex + " findex " + f.startIndex);
            cmd.kickFrameIndex = newIndex;
    
            // check strength and force
            const m = tm.kickTarget;
            const k = tm.kickKnob;
            const d = Math.max(0, dist2(m.position, k.position) - gameSetup.config.malletD * 0.8);
    
            newf.x = 0; newf.y = 0;
            if (d > gameSetup.config.malletD * 0.1) {
              newf.x = k.position.x - m.position.x;
              newf.y = k.position.y - m.position.y;
              newf.multiplyScalar((newf.length() - gameSetup.config.malletD * 0.8)/newf.length());
            }
            cmd.forceX = newf.x * gameSetup.config.kickStrengthScaler;
            cmd.forceY = newf.y * gameSetup.config.kickStrengthScaler;
            pi.nextCommands.push(cmd);
          } else {
            // make sure we have one command for each MOVE_COUNT so we can show correct 
            pi.nextCommands.push({kickFrameIndex: -1});
          }
        } 
        break;
      }
    }


    

    const stepSize = 1/60;
    while (!allStopped2) {
      //let b2 = gameSetup.mallets[4].body2;
      // console.log("v " + b2.velocity[0] + " " + b2.velocity[1]);

      this.applyKicksForThisTime(true, cnt);

      allStopped2 = this.checkGoalOrAllStopped(true, cnt);
      // console.log("b speed after 3 " + b.velocity[0]);
      if (allStopped2) {
        break;
      }

      world2.step(stepSize);

      cnt ++;
      if (cnt > 1000) break;
      // }
    }

    const time4 = getMS();
    // console.log("sim time 3 " + (time4 - time3));

    // draw trail graphics
    if (simType == SIM_DRAW) {
      // console.log("drawForecast in sim");
      this.drawForecast();
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
     
    for (let k=0; k<gameSetup.mallets.length; k++) {
      const m  = gameSetup.mallets[k];
      const b = m.body;
      const b2 = m.body2;
      b2.isStopped = false;
      b2.velocity[0] = 0;
      b2.velocity[1] = 0;
      b2.angularVelocity = 0;
      b2.vlambda[0] = 0;
      b2.vlambda[1] = 0;
      b2.wlambda = 0;
      b2.trail = [];
      b2.hasFirstCurve = false;
      b2.position[0] = b.position[0];
      b2.position[1] = b.position[1];
      b2.oldx = b.position[0];
      b2.oldy = b.position[1];
      b2.trail.push([b2.position[0], b2.position[1]]);
    }

    let b2 = gameSetup.soccer.body2;
    let b = gameSetup.soccer.body;
    b2.isStopped = false;
    b2.velocity[0] = 0;
    b2.velocity[1] = 0;
    b2.angularVelocity = 0;
    b2.vlambda[0] = 0;
    b2.vlambda[1] = 0;
    b2.wlambda = 0;
    b2.position[0] = b.position[0];
    b2.position[1] = b.position[1];
    b2.trail = [ [b2.position[0], b2.position[1]] ];
    b2.oldx = b.position[0];
    b2.oldy = b.position[1];
  };


  this.setupWorld2ByInitState = () => {
    
    let allStates = [];
    const allIDs = Object.keys(malletbodies);
    for (let j=0; j<allIDs.length; j++) {
      const i = allIDs[j];
      const b2 = malletbodies2[i];
      let found = false;
      for (let k=0; k<window.InitState.length; k++) {
        if (window.InitState[k].malletID == i) {
          allStates.push(window.InitState[k]);
          found = true;
          break;
        } 
      }
      if (!found) {
        allStates.push({
          malletID: i, inPocketID: 0
        });
      }
    }

    for(let j=0; j<allStates.length; j++) {
      const b = allStates[j];
      const b2 = malletbodies2[b.malletID];

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
        b2.position[1] = 1000000;
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
  //   gameSetup.cuemalletDirection.x += 0.0001;




  //   gameSetup.controller.verifyTestResult();
  // };

  // main loop
  // let loopcnt = 0;
  this.tick = function (time) {
    if (gameSetup.inCleanUp) return;
    gameSetup.tickHandle = requestAnimationFrame(that.tick);
    if (gameSetup.paused) return;

    const cfg = gameSetup.config;
    gameSetup.prevCycleTime = gameSetup.currentCycleTime;
    gameSetup.currentCycleTime = Date.now();
    gameSetup.currentCycleInd++;

    if (!gameSetup.gameOver) {
      if (gameSetup.isHost && gameSetup.hostAllStopped && !gameSetup.allStopHandled) {
        gameSetup.controller.checkIfAllPeerAllStopped();
      }

      TWEEN.update(time);
      //gameSetup.controller.tryStartGame();
      gameSetup.controller.tickUpdate();
    }

    gameSetup.renderer.render(gameSetup.stage);


    // const endms = getMS();
    // console.log("tick took time " + (endms - startms).toFixed(3) + " " + (midms1-startms).toFixed(3) + " " + (midms2-midms1).toFixed(3) + " " + (midms3 - midms2).toFixed(3));
  };
};

export default SoccerGame;


/**
 * 
 * advanced class 4
 

working test code: 

ResetTable(true);
PlaceMalletOnTable(0, -322, -351);
PlaceMalletOnTable(2, -861, -387);
PlaceMalletOnTable(3, -928, 364);
PlaceMalletOnTable(1, -910, 310);
PlaceMalletOnTable(6, 810, 89);

ChooseRedColor(); 

await UpdateWorld();
TakeCallShot();
await WaitForAllMalletStop();

//await UpdateWorld();
//TakeCallShot();
//await WaitForAllMalletStop();

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


function getCueMalletPlacement() {
  const legalMalletIDs = world.CandidateMalletList[MyID];
  for (let k = 0; k < legalMalletIDs.length; k++) {
    const malletID = legalMalletIDs[k];
    const malletPos = Mallets[malletID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {
      const pocketPos = Pockets[pocketID];
      const isBlocked = isPathBlocked(malletPos, pocketPos);
      if (!isBlocked) {
        return extrapolatePoints(pocketPos, malletPos, 2 * MalletDiameter);
      }
    }
  }
}


function getMinCutAngle(endStates, prevTargetMalletID) {
  const cuemalletPos = endStates[0];
  let minAngle = 361;

  const legalMalletIDs = world.CandidateMalletList[MyID];
  for (let k = 0; k < legalMalletIDs.length; k++) {
    const malletID = legalMalletIDs[k];
    if (malletID == prevTargetMalletID) continue;
    const targetMalletPos = endStates[malletID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {
      const pocketPos = Pockets[pocketID];
      const aimPoint = getAimPosition(targetMalletPos, pocketPos);
      const angle = Math.abs(getCutAngle(pocketPos, aimPoint, cuemalletPos));
      

      if (angle < minAngle) {
        p1("new min angle " + malletID + " " + pocketID + ": " + angle);
        minAngle = angle;
      }
    }
  }

  return minAngle;
}




async function getMaxNextProb(endStates, prevTargetMalletID) {
  //if (1) return Math.random();
  const cuemalletPos = endStates[0];
  let maxProb = -1;

  const legalMalletIDs = world.CandidateMalletList[MyID];
  for (let k = 0; k < legalMalletIDs.length; k++) {
    const malletID = legalMalletIDs[k];
    if (malletID == prevTargetMalletID) continue;
    const targetMalletPos = endStates[malletID];
    for (let pocketID = 0; pocketID <= 5; pocketID++) {

      
    //if (malletID != 6) continue;
    //if (pocketID != 3) continue;

      
      const pocketPos = Pockets[pocketID];
      const aimPoint = getAimPosition(targetMalletPos, pocketPos);

      const cmd = {
        aimx: aimPoint.x,
        aimy: aimPoint.y,
        strength: 50,
        targetMalletID: malletID,
        targetPocketID: pocketID
      };
      
      
      const prob = await calculateProbability2(endStates, cmd);      
      p1("next prob " + malletID + " " + pocketID + ": " + prob);

      if (prob > maxProb) {
        p1("new prob " + malletID + " " + pocketID + ": " + prob);
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
  const legalMalletIDs = world.CandidateMalletList[MyID];
  for (let k = 0; k <= legalMalletIDs.length - 1; k = k + 1) {
    const malletID = legalMalletIDs[k];
    const isBlocked = isPathBlocked(Mallets[malletID], Mallets[0]);
    if (isBlocked) continue;
    

    
    for (let pocketID = 0; pocketID <= 0; pocketID = pocketID + 1) {
      const aimPoint = getAimPosition(Mallets[malletID], Pockets[pocketID]);

      const cutAngle = getCutAngle(Pockets[pocketID], aimPoint, Mallets[0]);
      if (Math.abs(cutAngle) > 90) continue;

      // iterate through strength values of 20/40/60/80 
      for (let s = 10; s <= 80; s = s + 5) {
        const cmd = {
          aimx: aimPoint.x,
          aimy: aimPoint.y,
          strength: s,
          targetMalletID: malletID,
          targetPocketID: pocketID
        };

        const endStates = await calculateEndState(cmd);
        const cuemalletPosition = endStates[0];

        cmd.prob = await calculateProbability(cmd);
        if (cmd.prob > 0) {
		      p0("\nfirst shoot mallet " + malletID + " pocket " + pocketID + " s " + s);        
        }
        //const currentState = [];

        //for (let i = 0; i < Mallets.length; i++) {
        //  const b = Mallets[i];
        //  currentState.push({
        //    x: b.x,
        //    y: b.y,
        //    malletID: i,
        //    inPocketID: b.inPocket ? 0 : null
        //  });
        //}
        //const prob2 = await calculateProbability2(currentState, cmd);
        //const endStates2 = await calculateEndState2(currentState, cmd);
        //debugger;


        if (cmd.prob > 70 && bestCommand.prob > 70) { 
          // both commands are good enough for probability,  
          cmd.nextProb = await getMaxNextProb(endStates, malletID); 
          if (cmd.nextProb > bestCommand.nextProb) { 
            p1("new best command ! " + cmd.nextProb);
            bestCommand = cmd;  
          } 
        } else { 
          // simply choose the one with higher probability 
          if (cmd.prob > bestCommand.prob) {            
            cmd.nextProb = await getMaxNextProb(endStates, malletID); 
            p1("new best command ! " + cmd.nextProb);
            bestCommand = cmd;  
          } 
        } 
        
        
      }
    }
  }

  // play safety when we don't have a good shot 
  if (bestCommand.prob < 50) {
    const targetPosOld = Mallets[bestCommand.targetMalletID];
    for (let s = 2; s < 40; s = s + 1) {
      console.log("trying strength " + s);
      bestCommand.strength = s;
      const endStates = await calculateEndState(bestCommand);
      const targetPosNew = endStates[bestCommand.targetMalletID];
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