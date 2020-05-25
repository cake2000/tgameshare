
import _ from 'lodash';
import { ADDRCONFIG } from 'dns';
import { setTimeout, clearTimeout } from "timers";
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
import { Howler, Howl } from "howler";
import { debug } from "util";
import { Bert } from 'meteor/themeteorchef:bert';
import Detector from "./detector.js";
import Stats from "./stats.min.js";
import jstat from "./jstat.min.js";
import IL from "./illuminated";
import { GAME_TYPE, PLAYER_TYPE } from '../../../../../lib/enum';

const ols = require('./ols.js');
const sylvester = require('sylvester');
const isMobile = require('ismobilejs');
const localForage = require("localforage");

localForage.config({
  driver: localForage.INDEXEDDB,
  name: 'myDb'
});

let allcommands = [];

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

const resolvedAllStop = {};
const vcushion = 0;
const BEGINNER = 0;
const ADVANCED = 1;
// const PROFESSIONAL = 1;

const GAME_ONGOING = 0;
const GAME_OVER_STATE = 1;
const GAME_MAZE_MODE = 2;

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

const AlgorithmSetupObj = {
  /* Here we've just got some global level vars that persist regardless of State swaps */
  score: 0,

  /* If the music in your game needs to play through-out a few State swaps, then you could reference it here */
  music: null,

  /* Your game can check AlgorithmSetupObj.orientated in internal loops to know if it should pause or not */
  orientated: false,
  TESTING: GAME_TYPE.TESTING
};


const workerCodeTemplat = `


const GameInfo = {};
let cmds = []; // drawing commands to be sent back
let MyID = -1;
let url = "";
const students = [
  {ID: 1, Name: 'Leo', Age: 13},
  {ID: 2, Name: 'Mike', Age: 13},
  {ID: 3, Name: 'John', Age: 10},
  {ID: 4, Name: 'Lisa', Age: 11},
  {ID: 5, Name: 'Joan', Age: 13},
  {ID: 6, Name: 'Mia', Age: 12},
  {ID: 7, Name: 'Anna', Age: 13},
  {ID: 8, Name: 'Emma', Age: 11},
  {ID: 9, Name: 'Jack', Age: 12},
  {ID: 10, Name: 'Emily', Age: 10}
];

const numbers = [1, 3, 2, 43, 17, -6, -9, -3, 12, 15, 4, 18];
const numbers2 = [1, 3, 2, 43, 17, -6, -9, 43, 12, 15, 4, 19];
const array1 = [0, 2, 5, 9, 12];
const array2 = [1, 4, 7, 10];

const numbers2D = [
  [3, 6, -1, 4, -4],
  [8, 12, 4, -5, 9],
  [2, -4, 3, 13, 11],
  [1, 9, 3, -4, 7]
];

const sorted2D = [
  [13, 10,  8,  2, -3],
  [12,  9,  5,  1, -3],
  [ 6,  4,  3, -1, -4],
  [ 4,  2,  1, -3, -7],
  [-1, -3, -6, -8, -10]
];

const sorted2D2 = [
  [-29, -17, -15, -11, -8],
  [-5, -3, 0, 1, 4],
  [6, 7, 9, 11, 14]
];

const toeplitz1 = [
  [1, 2, 3, 4],
  [5, 1, 2, 3],
  [6, 5, 1, 2],
  [7, 6, 5, 1],
  [8, 7, 6, 5]
];

const toeplitz2 = [[1, 2], [2, 2]];

const toeplitz3 = [
  [1, 2, 3], 
  [-1, 1, 2]
];

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

const WorldForPlayer = {};

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



const AlgorithmSetup = function (gameSetup) {
  // create the root of the scene graph
  const AlgorithmSetupObj = this;
  const that = this;
  const GameEngine = this;

  let tablerenderer, ballrenderer, overlayrenderer, overlayrenderer2, controlrenderer;
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

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    document.getElementById('gameDiv').innerHTML = "";
    return;
  }


  // - Global variables -
  let container;
  let renderer;

  // this.updatePhysicsList = [];
  // this.getPosList = [];
  // let time = 0;

  this.setupConfig = () => {
    window.isWaitingForAllStop = false;

    const cfg = {
      TrueWidth: 2549, TrueHeight: 1453.5, bottomBoxHeight: 110, coinXShift: 460
    };
    gameSetup.config = cfg;

    if (typeof gameSetup.difficulty === "undefined") { gameSetup.difficulty = BEGINNER; }

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
        if (gameSetup.gameType === GAME_TYPE.PRACTICE || gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.BATTLE) {
          if (!gameSetup.activePlayerInfo || Number(p[0]) !== gameSetup.activePlayerInfo.ID || gameSetup.activePlayerInfoJustSet) {
            if (gameSetup.gameType === GAME_TYPE.MATCH || gameSetup.gameType === GAME_TYPE.BATTLE) {
              if (gameSetup.playerInfo[p[0]].isLocal && gameSetup.playerInfo[p[0]].userId === Meteor.userId()) {
                gameSetup.config.showHeadline("Your Turn");
              } else {
                gameSetup.config.showHeadline(`Your Opponent ${gameSetup.playerInfo[p[0]].username}'s Turn`);
              }
            } else {
              gameSetup.config.showHeadline(`Player ${p[0]} ${gameSetup.playerInfo[p[0]].username}'s Turn`);
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

      const ResetCanvas = (clearTable) => {
        // gameSetup.lc.clear();
      };

      this.ResetCanvas = ResetCanvas;

      this.verifyTestResult = () => {
        if (gameSetup.gameType !== GAME_TYPE.TESTING) return;
      };

      this.setRobotCode = (robotCode) => {
        if (gameSetup.gameType === GAME_TYPE.TESTING) {
          gameSetup.playerInfo[0].PlayerCode = robotCode;
        }
      };

      this.createAIPlayers = (setupCode, runTestOnReady) => {
        for (let k = 0; k < gameSetup.playerInfo.length; k++) {
          const pi = gameSetup.playerInfo[k];
          pi.isLocal = pi.playerUserId === gameSetup.config.localPlayerID || gameSetup.gameType === GAME_TYPE.AUTORUN || gameSetup.gameType === GAME_TYPE.BATTLE;
          if (pi.playerType !== "AI") continue;
          if (typeof setupCode !== "undefined") {
            pi.TestCode = setupCode;
          }
          if (pi.playerWorker) {
            pi.playerWorker.terminate();
          }
          if (gameSetup.gameType === GAME_TYPE.TESTING && k > 0) break;
          // console.log("create AI using robot code for " + pi.playerID);
          that.createRobot(pi, k, runTestOnReady);
        }
        gameSetup.activePlayerInfo = gameSetup.playerInfo[0];
      };

      // execute the received command
      gameSetup.executeAIWorkerCommand = (data) => {
        // console.log("new ai worker command " + JSON.stringify(data));
        if (gameSetup.gameType === GAME_TYPE.TESTING) {
          if (data.cmdType === CMD_CALL_RUN) {
            gameSetup.AICommand = data.cmd;
          }
        }

        const pinfo = gameSetup.playerInfo[data.playerID];
        if (pinfo !== gameSetup.activePlayerInfo) {
          // debugger;
          console.log("received cmd from non active player");
          return;
        }

        if (data.cmdType === CMD_SCRIPT_RESET_CANVAS) {
          ResetCanvas();
          return;
        }
        if (data.cmdType === CMD_SCRIPT_UPDATE_WORLD) {
          return;
        }
        if (data.cmdType === CMD_SCRIPT_REPORT_END_OF_TEST) {
          if (gameSetup.gameType === GAME_TYPE.TESTING) {
            gameSetup.handleTestResult(data.result);
          }
          return;
        }
        if (data.cmdType === CMD_SCRIPT_REPORT_END_OF_TEST_SETUP) {
          if (gameSetup.gameType === GAME_TYPE.TESTING) {
            gameSetup.inRunningTest = false;
          }
          return;
        }
        if (data.cmdType === CMD_PRINT) {
          if (window.handleNewConsole) window.handleNewConsole(data.cmd.str);
          return;
        }
        if (data.cmdType === CMD_DRAW_CIRCLE) {
          allcommands.push(data);
          const iframe = document.getElementById("canvasIFrame");
          if (iframe) {
            iframe.contentWindow.postMessage(`DRAW_CIRCLE: ${data.cmd}`, '*');
          }
          return;
        }
        if (data.cmdType === CMD_PRINT_TEXT) {
          allcommands.push(data);
          const iframe = document.getElementById("canvasIFrame");
          if (iframe) {
            iframe.contentWindow.postMessage(`PRINT_TEXT: ${data.cmd}`, '*');
          }
          return;
        }
        if (data.cmdType === CMD_CLEAR_OUTPUT) {
          allcommands = [];
          const iframe = document.getElementById("canvasIFrame");
          if (iframe) {
            iframe.contentWindow.postMessage(`CLEAR_OUTPUT: ${data.cmd}`, '*');
          }
          return;
        }
        if (data.cmdType === CMD_CLEAR_PRINT) {
          window.handleClearConsole();
          return;
        }
        if (data.cmdType === CMD_CALL_RUN && (gameSetup.gameType === GAME_TYPE.TESTING)) {
          if (gameSetup.gameType === GAME_TYPE.TESTING) {
            if (window.testCondition === "TestFinished_CanvasJStestdrawing") {

            }
          }
        }

        // console.log("before on strike button " + gameSetup.targetPocketID);
        if (gameSetup.gameType === GAME_TYPE.TESTING) {
          //gameSetup.controller.inStrike = true; // prevent from old test finish reset to affect new test click
          // doesnt work!
          gameSetup.controller.inNewTest = true;
        }
      };


      this.killAIPlayers = () => {
        for (let k = 0; k < gameSetup.playerInfo.length; k++) {
          const pi = gameSetup.playerInfo[k];
          // that.createRobot(pi);
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
          cmd: CMD_TEST_RUN,
          world: WorldForPlayer
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

  this.setupGameRoom = function () {
    this.setupConfig();
    //this.enhanceVictor();
    this.loadSounds();
    this.setup();
    this.initScreen();

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
      url = url.substring(0, url.indexOf("buildMyAI") - 1);

      // insert actual player code into template
      const p = workerCodeTemplat.split("-------------");
      // debugger;
      const testcode = pinfo.TestCode;
      const workerCode = `${p[0]} ${pinfo.PlayerCode} ${p[1]} ${testcode} ${p[2]}`;

      // console.log("createRobot: createWorkerFromString " + testcode);
      const playerWorker = that.createWorkerFromString(workerCode);

      playerWorker.isReady = false;
      pinfo.playerWorker = playerWorker;

      this.listener = function(e) {
        if (e.data.cmdType === CMD_READY) {
          // console.log(` worker is ready ${pinfo.ID} ${JSON.stringify(e.data)}`);
          playerWorker.isReady = true;

          if (gameSetup.gameType === GAME_TYPE.TESTING && runTestOnReady) {
            gameSetup.controller.runTest();
          }
        } else if (e.data.cmdType === CMD_ERROR_IN_WORKER) {
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
      playerWorker.sendMessage = function(m) {
        this.postMessage(JSON.stringify(m));
        this.lastPostMessage = m;
      };

      const msg = {
        cmd: CMD_READY,
        playerID: pinfo.ID,
        world: WorldForPlayer,
        url: window.origin
      };

      playerWorker.sendMessage(msg);
      playerWorker.playerID = pinfo.ID;
    }
  };



  this.createRobotOld = (pinfo) => {
    if (pinfo.playerType !== 'AI') {
      return;
    }

    const PlayerCode = pinfo.PlayerCode;
    if (PlayerCode) {
      const playerFunc = Function('world', 'myID', PlayerCode);
      pinfo.playerAI = new playerFunc(WorldForPlayer, pinfo.ID);
    }
  };

/*
  this.enhanceVictor = () => {
    window.Victor.prototype.scale = function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    };
  };
*/
  this.setupTimerUpdate = () => {
    gameSetup.timerID = setInterval(() => {
      if (gameSetup.gameOver) return;
      if (!gameSetup.activePlayerInfo) return;

      let secondsPassedInThisSection = Date.now() - gameSetup.activePlayerInfo.countdownStartTIme;
      secondsPassedInThisSection = Math.round(secondsPassedInThisSection / 1000);

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

        if (previewString !== "") {
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
          style: 'growl-top-right'
          // icon: 'fas fa-smile-o'
        });
      } else if (msg.toLowerCase().includes("no challenge specified")) {

        Bert.alert({
          title: 'No challenge specified.',
          message: event.message,
          type: 'info',
          style: 'growl-top-right'
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
      }
    };

    if (gameSetup.gameType === GAME_TYPE.TESTING || gameSetup.gameType === GAME_TYPE.REPLAY) {
      this.setupTestResultDisplay();
      this.setupHandleTestResult();
    }

    gameSetup.timedifflist = [];

    // console.log("done with initialization");
  };



  this.initGraphics = function () {
    const cfg = gameSetup.config;

    container = document.getElementById('gameDiv');
    let w = window.innerWidth;
    let h = window.innerHeight - vcushion;
    if (gameSetup.gameType === GAME_TYPE.TESTING || gameSetup.gameType === GAME_TYPE.REPLAY) {
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

    gameSetup.gameOver = false;
    gameSetup.exitGame = () => {
      console.log("in gameSetup.exitGame");
      gameSetup.gameOver = true;
      gameSetup.renderer.plugins.interaction.destroy();
      // if (gameSetup.renderer.plugins.accessibility && gameSetup.renderer.plugins.accessibility.children)
      //   gameSetup.renderer.plugins.accessibility.destroy();

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
          break;
        case GAME_TYPE.BATTLE:
          gameSetup.reacthistory.push('/leaderboard');
          break;
      }
    };

    gameSetup.cleanContainer = (c) => {
      if (!c) return;
      for (let x = c.children.length - 1; x >= 0; x--) {
        const obj = c.children[x];
        if (obj.parent) obj.parent.removeChild(obj);
        // console.log("obj type " + typeof(obj.destroy));
        if (obj._activeVao) {
          obj._activeVao.destroy();
          delete obj._activeVao;
        }
        if (typeof obj.destroy === 'function') obj.destroy(true);
        if (typeof obj.clean === 'function' && typeof PIXI !== "undefined") obj.clean(true);
        gameSetup.deepClean(obj);
      }
      c.destroy({ children: true, texture: true, baseTexture: true });
    };

    gameSetup.deepClean = (obj) => {
      Object.keys(obj).forEach((k) => {
        if (obj[k] && obj[k].removeAllListeners) obj[k].removeAllListeners();
        if (obj[k] && obj[k].destroy) {
          if (typeof obj.destroy === 'function') obj.destroy(true);
        }
        delete obj[k];
      });
    };


    gameSetup.cleanUpAll = () => {
      if (gameSetup.connectionTimer) clearTimeout(gameSetup.connectionTimer);
      if (gameSetup.tryReconnectTimer)clearTimeout(gameSetup.tryReconnectTimer);
      gameSetup.inCleanUp = true;
      cancelAnimationFrame(gameSetup.tickHandle);
      clearInterval(gameSetup.timerID);

      delete window.UserSetupCode;
      delete gameSetup.testSetupCode;
      delete gameSetup.scenario;

      window.onkeydown = null;
      window.onkeyup = null;

      gameSetup.controller.killAIPlayers();

      gameSetup.unloadSounds();

      gameSetup.deepClean(gameSetup.playerInfo1);
      gameSetup.deepClean(gameSetup.playerInfo2);
      gameSetup.deepClean(gameSetup.config);

    };


    gameSetup.OneOnKeyDown = (e) => {
      if (e.keyCode === 27) { // escape key
        // debugger;
        // console.log("key down esc");
        if (gameSetup.hideOverlay) gameSetup.hideOverlay();
        return false;
      }
      return true;
    };

    if (gameSetup.gameType !== GAME_TYPE.TESTING) document.addEventListener('keydown', gameSetup.OneOnKeyDown);

    gameSetup.fullScreenHandler = () => {
      let w = window.innerWidth;
      let h = window.innerHeight - vcushion;
      if (gameSetup.gameType === GAME_TYPE.TESTING || gameSetup.gameType === GAME_TYPE.REPLAY) {
        const shell = document.getElementById('gameDivShellModal');
        w = shell.clientWidth * 1;
        h = shell.clientHeight * 0.99; // hack: otherwise there is a scroll bar!
      }

      if (!controlrenderer) return;

      const gameDiv = document.getElementById('gameDiv');
      gameDiv.style.width = `${w}px`;
      gameDiv.style.height = `${h}px`;

      controlrenderer.view.width = w;
      controlrenderer.view.height = h;
      controlrenderer.view.setAttribute("style", `position:absolute;bottom:${0}px;left:${0}px;width:${w}px;height:${h}px`);

      gameSetup.controlcontainer.position.set(0, 120);
      gameSetup.controlcontainer.scale.x = w / (cfg.TrueWidth);
      gameSetup.controlcontainer.scale.y = h / (cfg.TrueHeight);

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
    gameSetup.sounds.victory = new Howl({ src: ['/sounds/Victory.mp3'], volume: 0.5 });
    gameSetup.sounds.failure = new Howl({ src: ['/sounds/failure.mp3'], volume: 0.4 });
    if (gameSetup.gameType !== GAME_TYPE.TESTING && gameSetup.gameType !== GAME_TYPE.AUTORUN && gameSetup.gameType !== GAME_TYPE.REPLAY) {
      gameSetup.sounds.backgroundmusic.play();
    }
    gameSetup.playMagicSound = () => {
      gameSetup.sounds.magicwand.stop();
      gameSetup.sounds.magicwand.play();
    };
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
      if (window.testCondition === "TestFinished_CanvasJStestdrawing") {
        let passing = false;
        if (allcommands.length < 2) {
          passing = false;
        } else if (allcommands[0].cmd === "start!" && allcommands[1].cmd === "100:50:30:#ff0000:4:#00ff00") {
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

      if (window.testCondition.indexOf('TestFinishedWithLog_') > -1) {
        const logAnwsers = {
          array1: `Jack's ID is 9, and his age is 12`,
          all13s: `There are 4 students in 13 year old.`,
          averageAge: `The average age of all the students is 12`,
          longestName: `Emily`,
          secondBest: '18',
          secondBest2: '19',
          twoSum: '[4, 11]',
          swapElements: '18,3,2,43,17,-6,-9,-3,12,15,4,1',
          getSmallest: '6',
          selectionSort: '-9,-6,-3,1,2,3,4,12,15,17,18,43',
          bubbleSort: '-9,-6,1,2,3,4,12,15,17,19,43,43',
          sortByAge: 'John(10),Emily(10),Lisa(11),Emma(11),Mia(12),Jack(12),Leo(13),Mike(13),Joan(13),Anna(13)',
          selectionDes: '43,18,17,15,12,4,3,2,1,-3,-6,-9',
          factorial10: '3628800',
          tribonacci25: '1389537',
          binarySearch: 'The Searching Result: 9',
          fibonacci25: '75025',
          towerOfHanoi: `A to B,A to C,B to C,A to B,C to A,C to B,A to B,A to C,B to C,B to A,C to A,B to C,A to B,A to C,B to C`,
          mergeArrays: '0,1,2,4,5,7,9,10,12',
          mergeSort: '-9,-6,-3,1,2,3,4,12,15,17,18,43',
          quickSort: '-9,-6,-3,1,2,3,4,12,15,17,18,43',
          mergeSort2: '-9,-6,1,2,3,4,12,15,17,19,43,43',
          sumOfMatrix: '77',
          numOfNegative: '11',
          binarySearch2: '3',
          toeplitzMatrix: 'true,false,true',
          pascalsTriangle: '[ [1], [1,1], [1,2,1], [1,3,3,1], [1,4,6,4,1], [1,5,10,10,5,1], [1,6,15,20,15,6,1] ]',
          transposeMatrix: '[ [3,8,2,1], [6,12,-4,9], [-1,4,3,3], [4,-5,13,-4], [-4,9,11,7] ]',
          binarySearch3: 'true,true,false',
          reverseString: '.od nac uoy tahw gniod morf uoy pots od t’nac uoy tahw tel t’noD',
          reverseString2: 't’noD tel tahw uoy t’nac od pots uoy morf gniod tahw uoy nac .od',
          romanToInteger: '2350',
          romanToInteger2: '6666',
          frequencyOfChar: 'The frequency of the smallest character is 2.',
          addStrings: 'The sum of 29083152709420394 and 80537490710719048 is: 109620643420139442',
          numOfBalloons: 'The maximum number of "balloon" is 2.',
          firstUniqueCharacter: 'The first unique character is at 6',
          houseRobber: 'The maximum amount you can rob is 54',
          maxSubarray: 'The largest sum is 8',
          maxSubarray2: 'The largest sum is 10',
          buySellStock: 'The maximum profit is 9',
          findJudge1: '[0,0,1,1,1],[0,0,0,1,0],[0,1,0,1,0],[0,0,0,0,0],[1,1,1,1,0]',
          findJudge: 'The secret town judge is people 4',
          BFT: 'The breadth-first traversal is 0,1,2,6,3,4,5',
          DFT: 'The depth-first traversal is 0,6,5,3,1,4,2',
          DFT2: 'The depth-first traversal is 0,1,3,5,6,4,2',
          directedCycle: 'The first graph has a cycle; the second graph has no cycle.'
        };

        const lognum = window.testCondition.substring("TestFinishedWithLog_".length);
        const answer = logAnwsers[lognum];
        const logs = allcommands;
        let found = false;

        if (lognum === 'towerOfHanoi') {
          if (logs.map(l => l.cmd).toString().trim() === answer) found = true;
        } else {
          for (let i = 0; i < logs.length; i += 1) {
            if (("" + logs[i].cmd).trim() === answer) {
              found = true;
              break;
            } else {
              // console.log("\n\n" + logs[i]);
              // console.log("\n\n" + answer + "\n\n");
              // break;
            }
          }
        }
        allcommands = [];
        if (found) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = `Test failed: your program did not print out the correct output.`;
        }
        gameSetup.showTestResult();
        return;
      }

      if (!window.testCondition || window.testCondition == "") {
        window.testResult = "No challenge specified at the moment.";
        gameSetup.showTestResult();
        return;
      }


      const passingList = [
        "TestFinishedAnyResult",
        "TestFinishedCallConsoleLog"
      ];

      for (let k = 0; k < passingList.length; k++) {
        if (window.testCondition && window.testCondition.indexOf(passingList[k]) >= 0) {
          window.testResult = "Test passed!";
          gameSetup.showTestResult();
          return;
        }
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

      if (window.recordTestAttempt) {
        window.recordTestAttempt(window.testResult);
      }

      if (window.toggleTestButton) {
        window.toggleTestButton(false);
      }
    };
  };

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
    } else if (gameSetup.goldemitter) {
      const now = Date.now();
      if (!gameSetup.goldEmitterPast) { gameSetup.goldEmitterPast = now; }
      gameSetup.goldemitter.update((now - gameSetup.goldEmitterPast) * 0.001);
      gameSetup.goldEmitterPast = now;
    }

    TWEEN.update(time);

    gameSetup.renderer.render(gameSetup.stage);
  };
};

export default AlgorithmSetup;
