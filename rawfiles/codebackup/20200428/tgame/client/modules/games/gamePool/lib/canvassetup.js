/* eslint-disable */
/*

*/

const hideTrail = false;

import { GAME_TYPE, PLAYER_TYPE } from '../../../../../lib/enum';
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

let allcommands = [];

const processedCommands = {};
let lastProcessedCmdKey = "";
let lastProcessedIndex= -1;

let printed = {world: true};


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

const resolvedAllStop = {};
const vcushion = 0;
const BEGINNER = 0;
const ADVANCED = 1;
// const PROFESSIONAL = 1;

// cmd for communicating with webworker
const CMD_READY = -1;
const CMD_CALL_RUN = 0;
const CMD_PRINT_TEXT = 1;
const CMD_CLEAR_OUTPUT = 2;
const CMD_DRAW_CIRCLE = 3;
const CMD_TEST_RUN = 6;
const CMD_SCRIPT_RESET_CANVAS = 7;
const CMD_SCRIPT_UPDATE_WORLD = 8;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;
const CMD_ERROR_IN_WORKER = 100;
const CMD_SCRIPT_REPORT_END_OF_TEST_SETUP = 24;
const CMD_PRINT = 25;
const CMD_CLEAR_PRINT = 26;

const MODAL_EXITGAME = 0; // one button to exit game
const MODAL_EXITORREPLAY = 1;
const MODAL_NOBUTTON = 2; // read only

const autobuttoncolor = 0x1f71f4; //0x4286f4;

const CanvasSetupObj = {

    /* Here we've just got some global level vars that persist regardless of State swaps */
  score: 0,

    /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
  music: null,

    /* Your game can check CanvasSetupObj.orientated in internal loops to know if it should pause or not */
  orientated: false,
  TESTING: GAME_TYPE.TESTING,
};


const workerCodeTemplat = `


const GameInfo = {};
let cmds = []; // drawing commands to be sent back
let MyID = -1;
let url = "";

Victor.prototype.scale = function(s) {
  this.x *= s;
  this.y *= s;
  return this;
};

function getRandomNumber(min, max) {
  return (max-min) * Math.random() + min;
}


function waitSeconds(s){
  return new Promise(function(resolve, reject){
    setTimeout(function () {
      // console.log("time out done ");
      resolve();
    },s * 1000);
  });
}



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


const copyValues = function(w) {
  
};

const initWorld = function(w) {
  world = JSON.parse(JSON.stringify(w));
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

-------------


// functions available for test scripts:

const ClearOutput = function() {
  try {
    sendCommand(CMD_CLEAR_OUTPUT);
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when taking break shot so using default shot to shoot at table center', e.stack);
  }
};


const CallRun = function() {
  try {
    run();
  } catch (e) {
    sendCommand(CMD_ERROR_IN_WORKER, 'Error found when taking break shot so using default shot to shoot at table center', e.stack);
  }
};

const DrawCircle = function(x, y, radius, color, strokeWidth, fill) {
  try {
    sendCommand(CMD_DRAW_CIRCLE, x + ":" + y + ":" + radius + ":" + color + ":" + strokeWidth + ":" + fill);
  } catch (e) {

  }

}

const printText = function(str) { 
  try {
    sendCommand(CMD_PRINT_TEXT, str);
  } catch (e) {

  }

};

const print = function(str) {
  try {
    sendCommand(CMD_PRINT, str);
  } catch (e) {
  }
};

const clearLog = function() {
  try {
    sendCommand(CMD_CLEAR_PRINT, {});
  } catch (e) {
  }
};

const ResetCanvas = function(clearTable) {
  sendCommand(CMD_SCRIPT_RESET_CANVAS, clearTable);
};



async function testRun() { 
  
  try {

    -------------
  
  } catch (e) {
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
const CMD_CALL_RUN = 0;
const CMD_PRINT_TEXT = 1;
const CMD_CLEAR_OUTPUT = 2;
const CMD_DRAW_CIRCLE = 3;
const CMD_TEST_RUN = 6;
const CMD_SCRIPT_RESET_CANVAS = 7;
const CMD_SCRIPT_UPDATE_WORLD = 8;
const CMD_SCRIPT_REPORT_END_OF_TEST = 13;
const CMD_ERROR_IN_WORKER = 100;
const CMD_SCRIPT_REPORT_END_OF_TEST_SETUP = 24;
const CMD_PRINT = 25;
const CMD_CLEAR_PRINT = 26;

self.addEventListener('message', async function(e) {
  const data = JSON.parse(e.data);
  // console.log("worker received data e.data is " + data.cmd);
    let cmd = {};
    // var data = e.data; // no stringify before post?
    console.log("e.data.cmd is " + data.cmd);
    console.log("player on message " + data);
    switch(data.cmd) {
      case CMD_READY:
        // console.log("PoolPlayerWorker initialize "); // + JSON.stringify(e.data));
        GameInfo.initialize(data);            
        break;
      case CMD_CALL_RUN:
        GameInfo.update(data);
        CallRun();
        break;
      case CMD_TEST_RUN:
        
        // GameInfo.update(data);
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
    case CMD_CALL_RUN:
      self.postMessage({
          'cmdID': MyID+"_" + commandID,
          'cmdType': cmdType,
          'playerID': MyID,
          'cmds': param1
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

    case CMD_SCRIPT_RESET_CANVAS:
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
    case CMD_PRINT:
    case CMD_CLEAR_PRINT:
    case CMD_CLEAR_OUTPUT:
    case CMD_PRINT_TEXT:
      self.postMessage({
        'cmdID': MyID+"_" + commandID,
        'playerID': MyID,
        'cmdType': cmdType,
        'cmd': param1
      });
      break;    
    case CMD_DRAW_CIRCLE:
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
    if (p[k].indexOf("ResetCanvas") >= 0) {
      cleanTestSetupCode += `${p[k]}\n`;
    }
    if (p[k].indexOf("clearLog") >= 0)
     continue;

    if (p[k].indexOf("CallRun") >= 0 || p[k].indexOf("TakeCallShot") >= 0) {
      break;
    }
  }
  // console.log("\n\nget clean test code new " + cleanTestSetupCode);
  cleanTestSetupCode += `\nReportEndOfTestSetup();`;
  return cleanTestSetupCode;
};


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

const VictorString = `

function Victor(t,i){if(!(this instanceof Victor))return new Victor(t,i);this.x=t||0,this.y=i||0}function random(t,i){return Math.floor(Math.random()*(i-t+1)+t)}function radian2degrees(t){return t*degrees}function degrees2radian(t){return t/degrees}Victor.fromArray=function(t){return new Victor(t[0]||0,t[1]||0)},Victor.fromObject=function(t){return new Victor(t.x||0,t.y||0)},Victor.prototype.addX=function(t){return this.x+=t.x,this},Victor.prototype.addY=function(t){return this.y+=t.y,this},Victor.prototype.add=function(t){return this.x+=t.x,this.y+=t.y,this},Victor.prototype.addScalar=function(t){return this.x+=t,this.y+=t,this},Victor.prototype.addScalarX=function(t){return this.x+=t,this},Victor.prototype.addScalarY=function(t){return this.y+=t,this},Victor.prototype.subtractX=function(t){return this.x-=t.x,this},Victor.prototype.subtractY=function(t){return this.y-=t.y,this},Victor.prototype.subtract=function(t){return this.x-=t.x,this.y-=t.y,this},Victor.prototype.subtractScalar=function(t){return this.x-=t,this.y-=t,this},Victor.prototype.subtractScalarX=function(t){return this.x-=t,this},Victor.prototype.subtractScalarY=function(t){return this.y-=t,this},Victor.prototype.divideX=function(t){return this.x/=t.x,this},Victor.prototype.divideY=function(t){return this.y/=t.y,this},Victor.prototype.divide=function(t){return this.x/=t.x,this.y/=t.y,this},Victor.prototype.divideScalar=function(t){return 0!==t?(this.x/=t,this.y/=t):(this.x=0,this.y=0),this},Victor.prototype.divideScalarX=function(t){return 0!==t?this.x/=t:this.x=0,this},Victor.prototype.divideScalarY=function(t){return 0!==t?this.y/=t:this.y=0,this},Victor.prototype.invertX=function(){return this.x*=-1,this},Victor.prototype.invertY=function(){return this.y*=-1,this},Victor.prototype.invert=function(){return this.invertX(),this.invertY(),this},Victor.prototype.multiplyX=function(t){return this.x*=t.x,this},Victor.prototype.multiplyY=function(t){return this.y*=t.y,this},Victor.prototype.multiply=function(t){return this.x*=t.x,this.y*=t.y,this},Victor.prototype.multiplyScalar=function(t){return this.x*=t,this.y*=t,this},Victor.prototype.multiplyScalarX=function(t){return this.x*=t,this},Victor.prototype.multiplyScalarY=function(t){return this.y*=t,this},Victor.prototype.normalize=function(){var t=this.length();return 0===t?(this.x=1,this.y=0):this.divide(Victor(t,t)),this},Victor.prototype.norm=Victor.prototype.normalize,Victor.prototype.limit=function(t,i){return Math.abs(this.x)>t&&(this.x*=i),Math.abs(this.y)>t&&(this.y*=i),this},Victor.prototype.randomize=function(t,i){return this.randomizeX(t,i),this.randomizeY(t,i),this},Victor.prototype.randomizeX=function(t,i){var r=Math.min(t.x,i.x),o=Math.max(t.x,i.x);return this.x=random(r,o),this},Victor.prototype.randomizeY=function(t,i){var r=Math.min(t.y,i.y),o=Math.max(t.y,i.y);return this.y=random(r,o),this},Victor.prototype.randomizeAny=function(t,i){return Math.round(Math.random())?this.randomizeX(t,i):this.randomizeY(t,i),this},Victor.prototype.unfloat=function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},Victor.prototype.toFixed=function(t){return void 0===t&&(t=8),this.x=this.x.toFixed(t),this.y=this.y.toFixed(t),this},Victor.prototype.mixX=function(t,i){return void 0===i&&(i=.5),this.x=(1-i)*this.x+i*t.x,this},Victor.prototype.mixY=function(t,i){return void 0===i&&(i=.5),this.y=(1-i)*this.y+i*t.y,this},Victor.prototype.mix=function(t,i){return this.mixX(t,i),this.mixY(t,i),this},Victor.prototype.clone=function(){return new Victor(this.x,this.y)},Victor.prototype.copyX=function(t){return this.x=t.x,this},Victor.prototype.copyY=function(t){return this.y=t.y,this},Victor.prototype.copy=function(t){return this.copyX(t),this.copyY(t),this},Victor.prototype.zero=function(){return this.x=this.y=0,this},Victor.prototype.dot=function(t){return this.x*t.x+this.y*t.y},Victor.prototype.cross=function(t){return this.x*t.y-this.y*t.x},Victor.prototype.projectOnto=function(t){var i=(this.x*t.x+this.y*t.y)/(t.x*t.x+t.y*t.y);return this.x=i*t.x,this.y=i*t.y,this},Victor.prototype.horizontalAngle=function(){return Math.atan2(this.y,this.x)},Victor.prototype.horizontalAngleDeg=function(){return radian2degrees(this.horizontalAngle())},Victor.prototype.verticalAngle=function(){return Math.atan2(this.x,this.y)},Victor.prototype.verticalAngleDeg=function(){return radian2degrees(this.verticalAngle())},Victor.prototype.angle=Victor.prototype.horizontalAngle,Victor.prototype.angleDeg=Victor.prototype.horizontalAngleDeg,Victor.prototype.direction=Victor.prototype.horizontalAngle,Victor.prototype.rotate=function(t){var i=this.x*Math.cos(t)-this.y*Math.sin(t),r=this.x*Math.sin(t)+this.y*Math.cos(t);return this.x=i,this.y=r,this},Victor.prototype.rotateDeg=function(t){return t=degrees2radian(t),this.rotate(t)},Victor.prototype.rotateTo=function(t){return this.rotate(t-this.angle())},Victor.prototype.rotateToDeg=function(t){return t=degrees2radian(t),this.rotateTo(t)},Victor.prototype.rotateBy=function(t){var i=this.angle()+t;return this.rotate(i)},Victor.prototype.rotateByDeg=function(t){return t=degrees2radian(t),this.rotateBy(t)},Victor.prototype.distanceX=function(t){return this.x-t.x},Victor.prototype.absDistanceX=function(t){return Math.abs(this.distanceX(t))},Victor.prototype.distanceY=function(t){return this.y-t.y},Victor.prototype.absDistanceY=function(t){return Math.abs(this.distanceY(t))},Victor.prototype.distance=function(t){return Math.sqrt(this.distanceSq(t))},Victor.prototype.distanceSq=function(t){var i=this.distanceX(t),r=this.distanceY(t);return i*i+r*r},Victor.prototype.length=function(){return Math.sqrt(this.lengthSq())},Victor.prototype.lengthSq=function(){return this.x*this.x+this.y*this.y},Victor.prototype.magnitude=Victor.prototype.length,Victor.prototype.isZero=function(){return 0===this.x&&0===this.y},Victor.prototype.isEqualTo=function(t){return this.x===t.x&&this.y===t.y},Victor.prototype.toString=function(){return"x:"+this.x+", y:"+this.y},Victor.prototype.toArray=function(){return[this.x,this.y]},Victor.prototype.toObject=function(){return{x:this.x,y:this.y}};var degrees=180/Math.PI;

`;


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


const CBuffer = require('CBuffer');


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



const CanvasSetup = function (gameSetup) {
  // create the root of the scene graph
  const CanvasSetupObj = this;
  const that = this;
  const GameEngine = this;

  let tablerenderer, ballrenderer, overlayrenderer, overlayrenderer2,  controlrenderer, pixicontrolrendererexit, pixirenderertestresult;
  const unitScale = 1;
  let world = null, world2 = null;

  gameSetup.clearWorld = () => {

    if (world) {
      world.clear();
    }
  };

  gameSetup.initWorld = () => {

  };

  gameSetup.initWorld();

  const isHost = true;
  this.isHost = isHost;

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


    if (typeof(gameSetup.difficulty) == "undefined") { gameSetup.difficulty = BEGINNER; }


    // since in pool game there are always only 2 players, we can simply
    // ungroup gameSetup.playerInfo into 2 playerInfo objects
    gameSetup.playerInfo1 = gameSetup.playerInfo[0];
    gameSetup.playerInfo1.ID = 0;
    gameSetup.playerInfo2 = gameSetup.playerInfo[1];
    gameSetup.playerInfo2.ID = 1;

    cfg.localPlayerID = Meteor.userId();
  };

  this.restartGame = function () {
    window.location.reload();
  };

  this.createController = () => {
    const config = gameSetup.config;

    let isTesting = true;

    const GameController = function () {
      const me = this;

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


        gameSetup.activePlayerInfo.c.inTimeCountDown = true;

        
      };

      
      

      const ResetCanvas = (clearTable, IgnoreCueBall = false) => {
        // gameSetup.lc.clear();

      }


      this.ResetCanvas = ResetCanvas;


      // only run at host or all local!
      this.handleAllStopped = () => {
        // console.log("do handle all stopped " + gameSetup.targetBallID + " " + gameSetup.targetPocketID);


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

        gameSetup.controller.verifyTestResult();
      };

      let elapsed = Date.now();
      const testtarget = new Victor(0, 0);

      this.verifyTestResult = () => {
        if (gameSetup.gameType != GAME_TYPE.TESTING) return;
      };

      this.setRobotCode = (robotCode) => {
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          gameSetup.playerInfo[0].PlayerCode = robotCode;
        }
      };

      this.createAIPlayers = (setupCode, runTestOnReady) => {
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
          // console.log("create AI using robot code for " + pi.playerID);
          that.createRobot(pi, k, runTestOnReady);
        }
        gameSetup.activePlayerInfo = gameSetup.playerInfo[0];
      };

      // execute the received command
      gameSetup.executeAIWorkerCommand = (data) => {
        // console.log("new ai worker command " + JSON.stringify(data));
        const shotCmdUser = data.cmd;
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          if (data.cmdType == CMD_CALL_RUN) {
            gameSetup.AICommand = data.cmd;
          }
        }

        const pinfo = gameSetup.playerInfo[data.playerID];
        if (pinfo != gameSetup.activePlayerInfo) {
          // debugger;
          console.log("received cmd from non active player");
          return;
        }

        if (data.cmdType == CMD_SCRIPT_RESET_CANVAS) {
          ResetCanvas();
          return;
        } else if (data.cmdType == CMD_SCRIPT_UPDATE_WORLD) {

          return;
        } else if (data.cmdType == CMD_SCRIPT_REPORT_END_OF_TEST) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.handleTestResult(data.result);
          }
          return;
        // } else if (data.cmdType == CMD_SCRIPT_EXPECT_SHOT_COMMAND) {
        //   if (gameSetup.gameType == GAME_TYPE.TESTING) {
        //     gameSetup.userExpectedResult.push("EXPECTSHOTCOMMAND_" + data.cmd.aimx + "_" + data.cmd.aimy + "_" + data.cmd.strength  + "_" + data.cmd.spin  + "_" + data.cmd.hspin + "_" + data.cmd.targetBallID + "_" + data.cmd.targetPocketID);
        //   }
        //   return;
        } else if (data.cmdType == CMD_SCRIPT_REPORT_END_OF_TEST_SETUP) {
          if (gameSetup.gameType == GAME_TYPE.TESTING) {
            gameSetup.inRunningTest = false;
          }
          return;
        // } else if (data.cmdType == CMD_SCRIPT_UPDATE_WORLD) {
        //   gameSetup.controller.updateWorld();
        //   gameSetup.activePlayerInfo.playerWorker.sendMessage({
        //     'cmd': CMD_SCRIPT_UPDATE_WORLD,
        //     'world': WorldForPlayer,
        //     'resolveID': data.resolveID
        //   });
        //   // if (gameSetup.gameType == GAME_TYPE.TESTING)
        //   return;
        } else if (data.cmdType == CMD_PRINT) {
          if (window.handleNewConsole)
            window.handleNewConsole(data.cmd.str);
          return;
        } else if (data.cmdType == CMD_DRAW_CIRCLE) {
          allcommands.push(data);
          const iframe = document.getElementById("canvasIFrame");
          if (iframe) {
            iframe.contentWindow.postMessage("DRAW_CIRCLE:" + data.cmd, '*');
          }
          return;
        } else if (data.cmdType == CMD_PRINT_TEXT) {
          allcommands.push(data);
          const iframe = document.getElementById("canvasIFrame");
          if (iframe) {
            iframe.contentWindow.postMessage("PRINT_TEXT:" + data.cmd, '*');
          }
          return;
        } else if (data.cmdType == CMD_CLEAR_OUTPUT) {
          allcommands = [];
          const iframe = document.getElementById("canvasIFrame");
          if (iframe) {
            iframe.contentWindow.postMessage("CLEAR_OUTPUT:" + data.cmd, '*');
          }
          return;
        } else if (data.cmdType == CMD_CLEAR_PRINT) {
          window.handleClearConsole();
          return;
        } else if (data.cmdType == CMD_CALL_RUN  && (gameSetup.gameType == GAME_TYPE.TESTING)) {
          
          if (gameSetup.gameType == GAME_TYPE.TESTING) {

            if (window.testCondition == "TestFinished_CanvasJStestdrawing") {

            }
          }

          // make the drawings

          let shapes = [];
          for (let i = 0; i < data.cmds.length; i++) {
            const cmd = data.cmds[i];
            if (cmd.type == "circle") {
              cmd.width = cmd.radius * 2;
              cmd.height = cmd.radius * 2;
              cmd.strokeWidth = 2;
              cmd.strokeColor = "#550000";
              shapes.push(LC.createShape("Ellipse", cmd));
            }
          }

          const div = document.getElementsByClassName("lc-drawing with-gui");
          const canvas = div[0].childNodes[1];
          LC.renderShapesToCanvas(shapes, {x: 0, y: 0, width: 1000, height: 1000 }, 1, canvas);

          // gameSetup.activePlayerInfo = gameSetup.playerInfo1; // aaaa testing

          // }
        } 


        // console.log("before on strike button " + gameSetup.targetPocketID);
        if (gameSetup.gameType == GAME_TYPE.TESTING) {
          //gameSetup.controller.inStrike = true; // prevent from old test finish reset to affect new test click
          // doesnt work!
          gameSetup.controller.inNewTest = true;
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

      this.runTest = function () {
        gameSetup.inRunningTest = true;
        delete window.waitForAllStopResolveID;
        // const shotCmdUser = gameSetup.activePlayerInfo.playerAI.getBreakShot();
        gameSetup.activePlayerInfo.playerWorker.sendMessage({
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
        window.allStopCount = 0;
        window.allStoppedTriggered = false;
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

  this.setupGameRoom = function () {

    this.setupConfig();
    this.enhanceVictor();
    this.loadSounds();
    this.setup();
    this.initScreen();
    // this.initGraphics();
    // this.setReady();

    this.createController();

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



  this.enhanceVictor = () => {
    window.Victor.prototype.scale = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };
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



  this.initScreen = () => {

    gameSetup.config.hideHeadline = () => { };
    gameSetup.config.showHeadline = (msg) => {

      if (msg.toLowerCase().includes("test passed") || msg.toLowerCase().includes("exercise completed")) {
        gameSetup.sounds.victory.play();
        Bert.alert({
          title: 'Great job!',
          message: event.message,
          type: 'success',
          style: 'growl-top-right',
          // icon: 'fas fa-smile-o'
        });
      } else if (msg.toLowerCase().includes("no challenge specified")) {

        Bert.alert({
          title: 'No challenge specified.',
          message: event.message,
          type: 'info',
          style: 'growl-top-right',
          // icon: 'fas fa-info'
        });

      } else if (msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")) {
        gameSetup.sounds.failure.play();
        Bert.alert({
          title: "Test failed!",
          message: msg,
          type: 'danger',
          style: 'growl-top-right',
          // icon: 'fas fa-exclamation-circle'
        });
      } else {

      }


      

    };

    if (gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.REPLAY) {
      this.setupTestResultDisplay();
      this.setupHandleTestResult();
    } else {

    }


    gameSetup.timedifflist = [];

    // console.log("done with initialization");
  };



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

      gameSetup.controller.killAIPlayers();

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

    gameSetup.handleTestResult = (res) => {

      gameSetup.inRunningTest = false;

      // if (gameSetup.userExpectedResult && gameSetup.userExpectedResult.length > 0) {

      //   for (const exp of gameSetup.userExpectedResult) {
      //     if (exp.indexOf("EXPECTSHOTCOMMAND_") == 0) {
      //       const pp = exp.split("_");
      //       const cmd = gameSetup.AICommand;
      //       if (pp[1] != "undefined") {
      //         if ( Math.abs(cmd.aimx - Number(pp[1])) >= 2 ) {
      //           window.testResult = "Test failed: shot command's aimx " + Math.round(cmd.aimx) + " did not match with expected value of " + pp[1] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       } 
      //       if (pp[2] != "undefined") {
      //         if ( Math.abs(cmd.aimy - Number(pp[2])) >= 2 ) {
      //           window.testResult = "Test failed: shot command's aimy " + Math.round(cmd.aimy) + " did not match with expected value of " + pp[2] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       }
      //       if (pp[3] != "undefined") {
      //         if ( Math.abs(cmd.strength - Number(pp[3])) >= 2 ) {
      //           window.testResult = "Test failed: shot command's strength " + Math.round(cmd.strength) + " did not match with expected value of " + pp[3] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       }

      //       if (pp[4] != "undefined") {
      //         if ( Math.abs(cmd.spin - Number(pp[4])) >= 0.01 ) {
      //           window.testResult = "Test failed: shot command's spin " + Math.round(cmd.spin) + " did not match with expected value of " + pp[4] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       }

      //       if (pp[5] != "undefined") {
      //         if ( Math.abs(cmd.strength - Number(pp[5])) >= 0.01 ) {
      //           window.testResult = "Test failed: shot command's hspin " + Math.round(cmd.hspin) + " did not match with expected value of " + pp[5] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       }

      //       if (pp[6] != "undefined") {
      //         if ( cmd.targetBallID != Number(pp[6]) ) {
      //           window.testResult = "Test failed: shot command's targetBallID " + Math.round(cmd.targetBallID) + " did not match with expected value of " + pp[6] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       }
      //       if (pp[7] != "undefined") {
      //         if ( cmd.targetPocketID != Number(pp[7]) ) {
      //           window.testResult = "Test failed: shot command's targetPocketID " + Math.round(cmd.targetPocketID) + " did not match with expected value of " + pp[7] + ".";
      //           gameSetup.showTestResult();
      //           return;
      //         }
      //       }
      //     }
      //   }

      //   window.testResult = "Test passed!";
      //   gameSetup.showTestResult();
      //   return;
      // }


      if (window.testCondition == "TestFinished_CanvasJStestdrawing") {

        let passing = false;
        if (allcommands.length < 2) {
          passing = false;
        } else if (allcommands[0].cmd == "start!" && allcommands[1].cmd == "100:50:30:#ff0000:4:#00ff00") {
          passing = true;
        }


        if (passing) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test failed: you need to print 'start!' and draw a circle of radius 30.";
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

  };

  this.setupTestResultDisplay = () => {
    gameSetup.showTestResult = function() {

      window.submitTestResultInChat(window.testResult);
      //if (window.recordTestAttempt && !window.testResult.includes("No challenge specified")) {
      if (window.recordTestAttempt) {
        window.recordTestAttempt(window.testResult);
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



  gameSetup.fround = (v) => {
    v.x = Math.fround(v.x);
    v.y = Math.fround(v.y);
  };

 

  const v = new Victor(0, 0);

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

export default CanvasSetup;
