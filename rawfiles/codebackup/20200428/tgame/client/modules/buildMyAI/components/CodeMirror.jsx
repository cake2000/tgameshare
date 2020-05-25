import React from 'react';
import CodeMirror from 'react-codemirror';
import Victor from 'victor';
import Modal from 'react-modal';
import swal from 'sweetalert';
import PropTypes from 'prop-types';
// require('react/addons');
// import DropdownInput from 'react-dropdown-input';
import DropdownList from 'react-widgets/lib/DropdownList';
import 'react-widgets/dist/css/react-widgets.css';
import { Combobox } from 'react-widgets';
import { Bert } from 'meteor/themeteorchef:bert';
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
// import Pool from '../../games/gamePool/lib/localpool8ball2dworld.js';
// import Pool from '../../games/gamePool/lib/luckypoolgame.js';
import gameModal from '../../games/gamePool/components/gamemodal.js';
import '../../../../node_modules/codemirror/theme/blackboard.css';
import '../../../../node_modules/codemirror/theme/blackboard.css';
import '../../../../node_modules/codemirror/addon/hint/show-hint.css';
import '../../../../node_modules/codemirror/addon/edit/matchbrackets';
import '../../../../node_modules/codemirror/addon/edit/closebrackets';
import '../../../../node_modules/codemirror/addon/fold/foldcode';
import '../../../../node_modules/codemirror/addon/fold/foldgutter.js';
import '../../../../node_modules/codemirror/addon/fold/foldgutter.css';
import '../../../../node_modules/codemirror/addon/fold/brace-fold';
import { GAME_TYPE, GAME_CONFIG_OPTION, BUTTON } from '../../../../lib/enum';
// import PoolActions from '../../../packages/gamemaster/lib/modules/gamePool/actions/luckypoolgameactions.js';
// import { BUTTON } from '../../../../lib/enum';
import { TUTORIAL_STATEMENT } from '../../../../lib/const';

import { UserRobotCodeByLesson } from '../../../../lib/collections';

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');
const beautify = require('js-beautify').js_beautify;

// newly added for linting according to: https://github.com/angelozerr/codemirror-lint-eslint
//const Linter = require('codemirror/addon/lint/eslint');
//window.eslint = new Linter();
// require('codemirror/addon/lint/lint');

// require('./eslint-lint');

// new way to lint: https://github.com/JedWatson/react-codemirror/issues/89
// import { JSHINT } from 'jshint';
import 'codemirror/addon/lint/lint';
//import 'codemirror/addon/lint/javascript-lint';
//import './my-javascript-lint';
import 'codemirror/mode/javascript/javascript';
// import getTernServer from './tern';

// window.JSHINT = JSHINT;

// require('./myShowHint');
// require('./myJSHint');


import getRichErrorMessages, { moreErrorChecks, moreErrorCheckAST, checkArrayAccess, checkFunctionCall, checkBracketErrors, checkMissingAsync, checkParenthesis, checkMisspellErrors, checkKnownTypeErrors, checkForLoopErrors } from './imports/eslintcodeErrorCheck';

let functionList = [];

let lastTime = 0;
const printTime = (s) => {
  return;
  if (lastTime == 0) {
    lastTime = Date.now();
  } else {
    let newtime = Date.now();
    print("" + s + " " + newtime);
    lastTime = newtime;
  }
}

const getFunctionName = (line) => {
  if (line.indexOf("function") >= 0) {
    let s = line.substring(line.indexOf("function") + 8);
    s = s.substring(0, s.indexOf("(")).trim();
    return s;
  }
  return 'noFuncName';
};

function addToBlock(blocks, funcName, codeStr, lineNum) {
  if (!(funcName in blocks)) {
    blocks[funcName] = [];
  }
  const info = {
    line: lineNum,
    code: codeStr
  };
  blocks[funcName].push(info);
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




const getCodeBlocks = (code) => {
  const lines = cleanUpComment(code).split('\n');
  const blocks = {};
  let newblock = '';

  let inFunction = false;
  let funcName = '';
  let funcBegin = 0;
  let leftBCount = 0;
  let rightBCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // if (line.trim() === '') continue;
    // if (line.trim().indexOf('//') == 0) continue;

    if (inFunction) {
      if (line.indexOf('}') === 0 && leftBCount == rightBCount + 1) {
        inFunction = false;
        newblock += line;
        addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
        funcName = '';
        newblock = '';
        leftBCount = 0;
        rightBCount = 0;
      } else {
        newblock += line;
        newblock += '\n';
        leftBCount += line.split("{").length - 1;
        rightBCount += line.split("}").length - 1;
      }
    } else { // not in function
      if (line.indexOf('function') == 0 ||  (  line.indexOf('async') == 0 && line.indexOf('function') > line.indexOf('async') ) ) {
        // a new block of code!
        if (newblock !== '') {
          addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
          newblock = '';
        }
        inFunction = true;
        funcName = getFunctionName(line);
        funcBegin = i;
        leftBCount = line.split("{").length - 1;
        rightBCount = line.split("}").length - 1;
      }
      newblock += line;
      newblock += '\n';
    }
  }

  if (newblock.trim() !== '') {
    addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
  }
  if ('' in blocks && blocks[''].length > 0) {
    let outside = '';
    blocks[''].forEach((c) => { outside += c.code; });
    outside = replaceAll(outside, "\n", "").trim();
    if (outside != "") {
      blocks[''] = {
        line: blocks[''][0].line,
        code: [outside]
      };
    } else {
      delete blocks[''];
    }
  }
  return blocks;
};

const getCodeBlocksOld = (code) => {
  const lines = code.split('\n');
  const blocks = {};
  let newblock = '';

  let inFunction = false;
  let funcName = '';
  let funcBegin = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // if (line.trim() === '') continue;
    // if (line.trim().indexOf('//') == 0) continue;

    if (inFunction) {
      if (line.indexOf('}') === 0) {
        inFunction = false;
        newblock += line;
        addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
        funcName = '';
        newblock = '';
      } else {
        newblock += line;
        newblock += '\n';
      }
    } else { // not in function
      if (line.indexOf('function') >= 0) {
        // a new block of code!
        if (newblock !== '') {
          addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
          newblock = '';
        }
        inFunction = true;
        funcName = getFunctionName(line);
        funcBegin = i;
      }
      newblock += line;
      newblock += '\n';
    }
  }

  if (newblock.trim() !== '') {
    addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
  }
  if ('' in blocks && blocks[''].length > 0) {
    let outside = '';
    blocks[''].forEach((c) => { outside += c.code; });
    outside = replaceAll(outside, "\n", "").trim();
    if (outside != "") {
      blocks[''] = {
        line: blocks[''][0].line,
        code: [outside]
      };
    } else {
      delete blocks[''];
    }
  }
  return blocks;
};


const asyncReg = new RegExp("async ", 'g');
const awaitReg = new RegExp("await ", 'g');
function getSeverity(error) {
	switch(error.severity) {
	  case 1:
	    return "warning";
	  case 2:
		return "error";	    
	  default:
		return "error";
	}    
}
function getPos(error, from) {
  var line = error.line-1, ch = from ? error.column-1 : error.column;
  if (error.node && error.node.loc) {
    line = from ? error.node.loc.start.line -1 : error.node.loc.end.line -1;
    ch = from ? error.node.loc.start.column-1 : error.node.loc.end.column-1;
  }
  //return CodeMirror.Pos(line, ch);
  return {
    line: line, ch: ch
  };
}
const esconfig = {
  "ecmaFeatures": {},
  "parserOptions": {
    "ecmaVersion": 2017
  },
  "extends": "eslint:recommended",
  "env": {
      "es6": true,
      "browser": true,
      "node": false,
      "amd": false,
      "mocha": false,
      "jasmine": false
  },
  "globals": {
    "console": true,
    "Balls": true, "BallDiameter": true, "TableHeight": true, "TableWidth": true,
    "Pockets": true, "Rails": true, "Cushions": true, "CushionWidth": true, "PlayerInfo": true,
    "getAimPosition": true, "getRandomNumber": true, "extrapolatePoints":true, "CandidateBallList": true, "calculateProbability": true, "console": true, 
    "MyID": true, "Pool": true, "OpponentColorType": true, "MyColorType": true,
    "world": true, "isPathBlocked": true, "getCutAngle": true, "calculateCutAngle": true, "calculateCutAngle": true, "getAngleToSidePocket": true,
    "getNewCommand": true,
    "calculateEndState": true, 
    'calculateEndState2': true,
    'calculateProbability2': true,
    "getDistance": true, "Victor": true, "getFirstBallTouched": true,
    "Boundaries": true, TOP_Y: true, BOTTOM_Y: true, LEFT_X: true, RIGHT_X: true, "dist2": true, "getShortestPath": true,
    'PlaceCueBallFromHand': true, "Victor": true, "waitSeconds": true,  
    "extrapolatePoints": true, "calculateProbability": true, "console": true, 
    "CandidateBallList": true, 
    "ResetTable": true,
    "PlaceBallOnTable": true,
    "TakeCallShot": true,
    "print": true,
    "clearLog": true,
    "TakeBreakShot": true,
    "SetSecondsLeft": true,
    "WaitForAllBallStop": true,
    "ReportEndOfTest": true,
    "WaitForAllShellsToExplode": true,
    "PlaceTile": true,
    "PlaceTank": true,
    "sendCommandToWhiteTank": true,
    SendCommandToTank: true,
    "SetupTickUpdates": true,
    "RemoveAllTanks": true,
    RemoveAllSprites: true,
    "ClearMaze": true,
    "CalculateCommand": true,
    "ChooseRedColor": true,
    "ChooseBlackColor": true,
    "ChooseYellowColor": true,
    "calculateShotCommand": true,
    "UpdateWorld": true,
    "SubmitTestOutputData": true,
    "PlotData": true,
    "calculateEndState": true,
    getShortestPath: true, getShortestPathCmd: true, getShortestPathLength: true,
    "Tanks": true, "Weapons": true, "Crystals": true, "Maze": true, MyTanks: true, MyTank: true,
    students: true,
    numbers: true,
    numbers2: true,
    array1: true,
    array2: true,
    numbers2D: true,
    sorted2D: true,
    toeplitz1: true,
    toeplitz2: true,
    toeplitz3: true,
    sorted2D2: true,
    createNewGraph: true,
    getSecondsLeft: true,
    PlaceCrystal: true,
    PlaceWeapon: true,
    SetTankProperties: true,
    SetExpectedResult: true,
    isShellBlocked: true,
    isInMyRange: true,
    "MAX_POWER": true,
    upgradeSpecialPowers: true,
    "SPECIAL_WEAPON_TYPES": true,
    sendMessageToTeam: true,
    sendTeamMessage: true,
    setInterval: true,
    clearInterval: true,
    SubmitData: true,
    LoadData: true,
    TrainLinearModel: true,
    dist2: true,
    getShortestPath: true,
    Maze: true,
    getNovaRange: true,
    get4WayRange: true,
    get3SplitterRange: true,
    getWeaponRange: true,
    StartEndGameMode: true,
    getNextEndGameRockPos: true,
    getNextRockPositions: true,
    getTimeLeftInSeconds: true,
  },
  "rules": {
      "no-alert": 2,
      "no-array-constructor": 2,
      "no-bitwise": 0,
      "no-caller": 2,
      "no-catch-shadow": 2,
      "comma-dangle": 0,
      "no-cond-assign": 2,
      "no-const-assign": 2,
      "no-console": 0,
      "no-constant-condition": 1,
      "no-control-regex": 2,
      "no-debugger": 0,
      "no-delete-var": 2,
      "no-div-regex": 0,
      "no-dupe-keys": 2,
      "no-else-return": 0,
      "no-empty": 1,
      "no-empty-character-class": 2,
      "no-labels": 2,
      "no-eq-null": 0,
      "no-eval": 2,
      "no-ex-assign": 2,
      "no-extend-native": 2,
      "no-extra-bind": 2,
      "no-extra-boolean-cast": 2,
      "no-extra-parens": 0,
      "no-extra-semi": 2,
      "strict": 2,
      "no-fallthrough": 2,
      "no-floating-decimal": 0,
      "no-func-assign": 2,
      "no-implied-eval": 2,
      "no-inline-comments": 0,
      "no-inner-declarations": [2, "functions"],
      "no-invalid-regexp": 2,
      "no-irregular-whitespace": 2,
      "no-iterator": 2,
      "no-label-var": 2,
      "no-labels": 2,
      "no-lone-blocks": 2,
      "no-lonely-if": 0,
      "no-loop-func": 2,
      "no-mixed-requires": [0, false],
      "no-mixed-spaces-and-tabs": [0, false],
      "no-multi-spaces": 0,
      "no-multi-str": 2,
      "no-multiple-empty-lines": [0, {"max": 2}],
      "no-native-reassign": 2,
      "no-negated-in-lhs": 2,
      "no-nested-ternary": 0,
      "no-new": 2,
      "no-new-func": 2,
      "no-new-object": 2,
      "no-new-require": 0,
      "no-new-wrappers": 2,
      "no-obj-calls": 2,
      "no-octal": 2,
      "no-octal-escape": 2,
      "no-path-concat": 0,
      "no-plusplus": 0,
      "no-process-env": 0,
      "no-process-exit": 2,
      "no-proto": 2,
      "no-redeclare": 2,
      "no-regex-spaces": 2,
      "no-reserved-keys": 0,
      "no-restricted-modules": 0,
      "no-return-assign": 2,
      "no-script-url": 2,
      "no-self-compare": 0,
      "no-sequences": 2,
      "no-shadow": 2,
      "no-shadow-restricted-names": 2,
      "semi-spacing": 0,
      "no-spaced-func": 2,
      "no-sparse-arrays": 2,
      "no-sync": 0,
      "no-ternary": 0,
      "no-trailing-spaces": 0,
      "no-undef": 2,
      "no-undef-init": 2,
      "no-undefined": 0,
      "no-underscore-dangle": 2,
      "no-unreachable": 2,
      "no-unused-expressions": 2,
      "no-unused-vars": 0, // [2, {"vars": "all", "args": "after-used"}],
      "no-use-before-define": 0,
      "no-void": 0,
      "no-var": 0,
      "no-warning-comments": [0, { "terms": ["todo", "fixme", "xxx"], "location": "start" }],
      "no-with": 2,
      "block-scoped-var": 0,
      "brace-style": [0, "1tbs"],
      "camelcase": 2,
      "comma-spacing": 0,
      "comma-style": 0,
      "complexity": [0, 11],
      "consistent-return": 0,
      "consistent-this": [0, "that"],
      "curly": [0, "all"],
      "default-case": 0,
      "dot-notation": [0, { "allowKeywords": true }],
      "eol-last": 0,
      "eqeqeq": 0,
      "func-names": 0,
      "func-style": [0, "declaration"],
      "generator-star": 0,
      "guard-for-in": 0,
      "handle-callback-err": 0,
      "key-spacing": [0, { "beforeColon": false, "afterColon": true }],
      "max-depth": [0, 4],
      "max-len": [0, 80, 4],
      "max-nested-callbacks": [0, 2],
      "max-params": [0, 3],
      "max-statements": [0, 10],
      "new-cap": 0,
      "new-parens": 2,
      "one-var": 0,
      "operator-assignment": [0, "always"],
      "padded-blocks": 0,
      "quote-props": 0,
      "quotes": [0, "double", "single"],
      "radix": 0,
      "semi": 2,
      "sort-vars": 0,
      "space-after-function-name": [0, "never"],
      "space-after-keywords": [0, "always"],
      "space-before-blocks": [0, "always"],
      "space-in-brackets": [0, "never"],
      "space-in-parens": [0, "never"],
      "space-infix-ops": 0,
      "keyword-spacing": 0,
      "space-unary-ops": [0, { "words": true, "nonwords": false }],
      "spaced-line-comment": [0, "always"],
      "strict": 0,
      "use-isnan": 2,
      "valid-jsdoc": 0,
      "valid-typeof": 2,
      "vars-on-top": 0,
      "wrap-iife": 0,
      "wrap-regex": 0,
      "yoda": [2, "never"]
  }
};

var linter = null;

function mod(CodeMirror) {
  "use strict";
  // declare global: JSHINT

  function validator(text, options) {
    // console.log("init validator");

    if (!window.eslint) {
      window.console.error("Error: can't find eslint.");
      $.getScript('/js/eslint.js');
      return;
    } 

    console.log("run linter");
    lastTime = 0;
    //printTime("start");
    
    
    // check if it is test code or robot code
    let editor = window.testCodeEditor;
    if (text.indexOf('ReportEndOfTest') < 0 && text.indexOf('ResetTable') < 0 && text.indexOf('PlaceBallOnTable') < 0) {
      editor = window.robotCodeEditor;
    }
    
    if (!editor || !window.userChat || !window.scenario) {
      console.log("can't detector editor or userchat or scenario");
      return [];
    }

    let code = editor.codeMirror.getValue();
    if (editor == window.robotCodeEditor) {
      const bracketErrors = checkBracketErrors(window.userChat, window.scenario, code);
      if (bracketErrors.length > 0) {
        return bracketErrors;
      }
      //printTime("s1");

      const asyncErrors = checkMissingAsync(code);
      if (asyncErrors.length > 0) {
        return asyncErrors;
      }
      
      //printTime("s2");
      const parenErrors = checkParenthesis(window.userChat, window.scenario, code);
      if (parenErrors.length > 0) {
        return parenErrors;
      }
      //printTime("s3");
      // const misspellErrors = checkMisspellErrors(window.userChat, window.scenario, code);
      // if (misspellErrors.length > 0) {
      //   return misspellErrors;
      // }

      const arrayErrors = checkArrayAccess(window.userChat, window.scenario, code);
      if (arrayErrors.length > 0) {
        return arrayErrors;
      }
      //printTime("s4");
      const funcErrors = checkFunctionCall(window.userChat, window.scenario, code);
      if (funcErrors.length > 0) {
        return funcErrors;
      }
      //printTime("s5");
      const typeErrors = checkKnownTypeErrors(window.userChat, window.scenario, code);
      if (typeErrors.length > 0) {
        return typeErrors;
      }
      //printTime("s6");
      
    } else {
      code = "async function testRun() { " + code + " } ";
    }

    //var linter = new window.eslint();
    if (!linter) {
      linter = new window.eslint();
    }
    const eserrors = linter.verify(code, esconfig);

    // reduce line number?
    for (let k=0; k<eserrors.length; k++) {
      eserrors[k].line --;
      eserrors[k].column --;
      if (eserrors[k].endLine) eserrors[k].endLine --;
      if (eserrors[k].endColumn) eserrors[k].endColumn --;
    }



    const esresult = [];
    for (var i = 0; i < eserrors.length; i++) {
      var error = eserrors[i];
      esresult.push({message: error.message,
                 severity: getSeverity(error),
                 from: getPos(error, true),
                   to: getPos(error, false)});	
    }

    if (0 && esresult.length == 0) {
      // additional errors added by ourselves

      const forloopErrors = checkForLoopErrors(window.userChat, window.scenario, code);
      if (forloopErrors.length > 0) {
        return forloopErrors;
      } else {
        return [];
      }
    }


    
    
    if (eserrors && eserrors.length > 0) parseErrors(eserrors, esresult, editor);
    //printTime("s7");
    if (esresult.length > 0) return esresult;

    // more error checks using known correct answer
    if (window.userChat && window.scenario && editor && window.robotCodeEditor == editor) {
      const code = editor.codeMirror.getValue();
      const moreErrs = moreErrorChecks(window.userChat, window.scenario, code);
      if (moreErrs) moreErrs.forEach((r) => { esresult.push(r); });
      //printTime("s8");
      const moreErrs2 = moreErrorCheckAST(window.userChat, window.scenario, code);
      if (moreErrs2) moreErrs2.forEach((r) => { esresult.push(r); });
      //printTime("s9");
    }

    return esresult;
  }
  // console.log("registerHelper");

  CodeMirror.registerHelper("lint", "javascript", validator);

  function parseErrors(errors, output, editor) {
    const hints = [];
    for ( var i = 0; i < errors.length; i++) {
      var error = errors[i];
      if (error) {
        if (error.line < 0) {
          if (window.console) {
            window.console.warn("Cannot display JSHint error (invalid line " + error.line + ")", error);
          }
          continue;
        }

        // var start = error.column - 1, end = start + 1;
        // if (error.evidence) {
        //   var index = error.evidence.substring(start).search(/.\b/);
        //   if (index > -1) {
        //     end += index;
        //   }
        // }

        // Convert to format expected by validation service
        var hint = {
          message: error.message,
          severity: error.severity == 1 ? "warning" : "error",
          from: CodeMirror.Pos(error.line, error.column),
          to: CodeMirror.Pos(typeof(error.endLine) == "undefined" ? error.line : error.endLine, typeof(error.endColumn) == "undefined" ? error.column+1 : error.endColumn)
        };

        hints.push(hint);
      }
    }
    // Get more accurate error messages
    if (window.userChat && window.scenario && editor) {
      const code = editor.codeMirror.getValue();
      const results = getRichErrorMessages(window.userChat, window.scenario, hints, code);

      if (results) {
        output.splice(0,output.length);
        results.forEach((r) => { output.push(r); });
      }
    } else {
      hints.forEach((h) => { output.push(h); });
    }
  }
};









let windowAttrs = [];
let inLoadingProcess = false;

let componentInit = false;
let userSetupCodeInit = false;
let overwriteMessage = "";
let loadMessage = "";
let okMessage = "";
let deleteMessage = "";

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1,
  // Professional: 1
};

function getUID() {
  const path = window.location.pathname;
  let uid = "";
  if (path.indexOf("/class") == 0) {
    // "/class/kpGqDfZSqcpBqQ8RQ/8WsN3rqnZ8odhKpHG/P1"
    const p = path.split("/");
    uid = p[3];
  }
  return uid;
}

function addPhaserIlluminated(Phaser, game) {
  Phaser.Plugin.PhaserIlluminated = function(game) {
    this._game = game;
    this._construct();
  };


  Phaser.Plugin.PhaserIlluminated.prototype = Object.create(Phaser.Plugin.prototype);
  Phaser.Plugin.PhaserIlluminated.prototype.constructor = Phaser.Plugin.Webcam;
  Phaser.Plugin.PhaserIlluminated.prototype._construct = function() {
        // these guys function as sprites
    this._game.add.illuminated = {};
    this._game.add.illuminated.lamp = this._createLamp;
    this._game.add.illuminated.darkMask = this._createDarkMask;

        // these guys function as their regular illuminated.js counterparts
    this._game.add.illuminated.rectangleObject = this._createRectangleObject;
    this._game.add.illuminated.discObject = this._createDiscObject;
    this._game.add.illuminated.lineObject = this._createLineObject;
    this._game.add.illuminated.polygonObject = this._createPolygonObject;

        // this is a bit hacky but the add calls are from the scope of the illuminated object, so we put needed
        // variables here
    this._game.add.illuminated._illuminatedSprites = [];
    this._game.add.illuminated._opaqueObjects = [];
    this._game.add.illuminated._game = this._game;

        // override this to respect the sprite offset
    illuminated.Lamp.prototype.mask = function (ctx) {
      const c = this._getVisibleMaskCache();
      const orientationCenter = new illuminated.Vec2(Math.cos(this.angle), -Math.sin(this.angle)).mul(this.roughness * this.distance);
      ctx.drawImage(c.canvas, this.offset.x + Math.round(this.position.x + orientationCenter.x - c.w / 2), this.offset.y + Math.round(this.position.y + orientationCenter.y - c.h / 2));
    };
  };

  Phaser.Plugin.PhaserIlluminated.prototype._createLamp = function(x, y, config) {
    if (!config) {
      config = {};
    }

        // distance is the actual distance the light travels
    let distance;
    if (!config.distance) {
      distance = 200;
    } else {
      distance = config.distance;
    }

    if (!x) {
      x = 0;
    }

    if (!y) {
      y = 0;
    }

    config.distance = distance;
    config.position = new illuminated.Vec2(config.centerX, config.centerY);
        // config.position = new illuminated.Vec2(0, 0);


        // var bmd = game.add.bitmapData(distance*2, distance*2);
    const bmd = game.add.bitmapData(config.width, config.height);
    game.cache.addBitmapData(`illuminated-lamp-${this._illuminatedSprites.length}`, bmd);
    const lamp = new illuminated.Lamp(config);
    lamp.offset = {};
        // var sprite = game.add.sprite(config.centerX - config.width/2, config.centerY - config.height/2, bmd);
    const sprite = game.add.sprite(0, 0, bmd);
    sprite.bmdIndex = `illuminated-lamp-${this._illuminatedSprites.length}`;
    sprite.bmd = bmd;
    sprite.lamp = lamp;

        // update the bmd and update the position of the lamp for masking and lighting purposes
    sprite.refresh = function() {
      this.bmd.ctx.clearRect(0, 0, this.bmd.width, this.bmd.height);

      if (this.lighting) {
                // render solid objects relative to position of sprites
        this.lighting.objects.forEach(function(o) {
          if (o.topleft && o.bottomright) { // rect obj
            o.topleft.x = o.originalX - this.x;
            o.topleft.y = o.originalY - this.y;
            o.bottomright.x = o.originalX + o.originalW - this.x;
            o.bottomright.y = o.originalY + o.originalH - this.y;
            o.syncFromTopleftBottomright();
          } else if (o.radius) { // disc obj
            o.center.x = o.originalX - this.x;
            o.center.y = o.originalY - this.y;
          } else if (o.a && o.b) { // line obj
            o.a.x = o.originalStartX - this.x;
            o.a.y = o.originalStartY - this.y;
            o.b.x = o.originalEndX - this.x;
            o.b.y = o.originalEndY - this.y;
          } else if (o.points) { // polygon
            o.points.forEach(function(point, index) {
              point.x = o.originalData[index].x - this.x;
              point.y = o.originalData[index].y - this.y;
            }, this);
          }
        }, this);

        this.lighting.compute(this.bmd.width, this.bmd.height);
        this.lighting.render(this.bmd.ctx);
      } else {
        this.lamp.render(this.bmd.ctx);
      }

      this.bmd.dirty = true;
      this.lamp.offset.x = this.x;
      this.lamp.offset.y = this.y;
    };
    sprite.createLighting = function(opaqueObjects) {
      if (!opaqueObjects) {
        return null;
      }

      const bmd = this.bmd;

      const lighting = new illuminated.Lighting({ light: lamp, objects: opaqueObjects });
      lighting.compute(bmd.width, bmd.height);
      lighting.render(bmd.ctx);

      this.lighting = lighting;

      return this;
    };
    sprite.getLamp = function() {
      return this.lamp;
    };

    sprite.refresh();

    this._illuminatedSprites.push(sprite);
    return sprite;
  };

  Phaser.Plugin.PhaserIlluminated.prototype._createDarkMask = function(illuminatedSprites, color) {
        // if we aren't provided with some sprites, we grab all by default
    if (!illuminatedSprites) {
      illuminatedSprites = this._game.add.illuminated._illuminatedSprites;
    }

    const lamps = [];
    illuminatedSprites.forEach((e) => {
      lamps.push(e.lamp);
    }, this);

    const config = game.config;
        // var bmd = game.add.bitmapData(this._game.width, this._game.height);
    const tw = config.tableW * 1.045;
    const th = config.tableH * 1.1;
    const bmd = game.add.bitmapData(tw, th);
    game.cache.addBitmapData('illuminated-darkmask', bmd);
    const darkMask = new illuminated.DarkMask({ lights: lamps, color: color || 'rgba(0,0,0,0.8' });
    darkMask.compute(tw, th);
    darkMask.render(bmd.ctx);
    const sprite = game.add.sprite(0, config.tableCenterY - config.tableH * 0.55, bmd);
    sprite.darkMask = darkMask;
    sprite.bmdIndex = 'illuminated-darkmask';
    sprite.bmd = bmd;
    sprite.refresh = function() {
      this.bmd.ctx.clearRect(0, 0, this.bmd.width, this.bmd.height);
      this.darkMask.compute(this.bmd.width, this.bmd.height);
      this.darkMask.render(bmd.ctx);
      this.bmd.dirty = true;
    };
    sprite.getMask = function() {
      return this.darkMask;
    };
    sprite.addLampSprite = function(lampSprite) {
      this.darkMask.lights.push(lampSprite.lamp);
      this.refresh();
    };


    return sprite;
  };

  Phaser.Plugin.PhaserIlluminated.prototype._createRectangleObject = function(x, y, w, h) {
    const obj = new illuminated.RectangleObject({ topleft: new illuminated.Vec2(x, y), bottomright: new illuminated.Vec2(x + w, y + h) });
    obj.originalX = x;
    obj.originalY = y;
    obj.originalW = w;
    obj.originalH = h;

    return obj;
  };

  Phaser.Plugin.PhaserIlluminated.prototype._createDiscObject = function(centerX, centerY, radius) {
    const obj = new illuminated.DiscObject({ position: new illuminated.Vec2(centerX, centerY), radius });
    obj.originalX = centerX;
    obj.originalY = centerY;

    return obj;
  };

  Phaser.Plugin.PhaserIlluminated.prototype._createLineObject = function(startX, startY, endX, endY) {
    const obj = new illuminated.LineObject(new illuminated.Vec2(startX, startY), new illuminated.Vec2(startX, startY));
    obj.originalStartX = startX;
    obj.originalStartY = startY;
    obj.originalEndX = endX;
    obj.originalEndY = endY;

    return obj;
  };

    // data in the form [{x: x, y: y},{x: x, y: y}, ...]
  Phaser.Plugin.PhaserIlluminated.prototype._createPolygonObject = function(data) {
    const vec2Data = [];
    data.forEach((point) => {
      vec2Data.push(new illuminated.Vec2(point.x, point.y));
    }, this);


    const obj = new illuminated.PolygonObject({ points: vec2Data });
    obj.originalData = data;

    return obj;
  };
}

// helper functions

const getFunctionContext = (line) => {
  let functionContext = line.substring(0, line.indexOf('=')).trim();
  if (functionContext.indexOf('var') == 0) {
    functionContext = functionContext.substring(4).trim();
  }
  return functionContext;
};

function replaceAll(str, find, replace) {
  if (!str) return "undefined";
  return str.replace(new RegExp(find, 'g'), replace);
}


const BEGINNER = 0;
const ADVANCED = 1;
// const PROFESSIONAL = 1;

const dmp = DiffMatchPatch.DiffMatchPatch;

// auto-completion
const worldKeys = [
  "TableHeight", "TableWidth", "BallDiameter", "CushionWidth", "Pockets", "Cushions", "Balls", "CandidateBallList"
];
const globalKeys = [
  "Balls", "BallDiameter", "TableHeight", "TableWidth",
  "Pockets", "Rails", "Cushions", "CushionWidth", "PlayerInfo",
  "getAimPosition", "getNewCommand", "getRandomNumber", "getSecondsLeft", "calculateProbability", "console", "getTimeLeftInSeconds",
  "MyID", "Pool", "OpponentColorType", "MyColorType", 'getNovaRange', 'get4WayRange' ,'get3SplitterRange','getWeaponRange',
  "world", "isPathBlocked", "getCutAngle", "calculateCutAngle", "calculateCutAngle", "getAngleToSidePocket",
  "calculateEndState", 'calculateEndState2', 'calculateProbability2', "getDistance", "Victor", "getFirstBallTouched",
  "Boundaries", "TOP_Y", "BOTTOM_Y", "LEFT_X", "RIGHT_X", 'extrapolatePoints', "CandidateBallList", 'async', 'await', "SPECIAL_WEAPON_TYPES.FREEZER", "SPECIAL_WEAPON_TYPES.MISSILE", "SPECIAL_WEAPON_TYPES.SPLITTER3", "SPECIAL_WEAPON_TYPES.WAY4", "SPECIAL_WEAPON_TYPES.MATRIX", "SPECIAL_WEAPON_TYPES.LASER_GUN"
];
const functionNames = [
  'getNovaRange', 'get4WayRange' ,'get3SplitterRange', "getTimeLeftInSeconds", 'getWeaponRange',
  'getAimPosition', "getNewCommand", 'getRandomNumber', 'getCallShot', 'getBreakShot', 'getSecondsLeft', 'getCueBallPlacement', 'isPathBlocked', 'getAngleToSidePocket',
  'getCutAngle', "calculateCutAngle", 'calculateCutAngle', 'calculateEndState',  'calculateEndState2', 'calculateProbability2', 'calculateProbability', 'Math', 'console', 'extrapolatePoints'
];
const testFunctions = [
  'ResetTable', 'PlaceBallOnTable', 'ChooseRedColor', 'ChooseBlackColor',
  "RemoveAllTanks", "SetupTickUpdates", "PlaceCrystal", "PlaceWeapon", "StartEndGameMode", "RemoveAllSprites", "SendCommandToTank",
  'ChooseYellowColor', 'TakeCallShot', "print", "clearLog",'TakeBreakShot', "SetSecondsLeft", 'PlaceCueBallFromHand', 'WaitForAllBallStop', 'UpdateWorld',
  'ReportEndOfTest', "ClearMaze", "CalculateCommand", "WaitForAllShellsToExplode", "PlaceTank","sendCommandToWhiteTank", "PlaceTile", "SetupTickUpdates", "ClearMaze",
];

const MathKeys = [
  'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor',
  'fround', 'hypot', 'imul', 'log', 'log10', 'log1p', 'log2', 'max', 'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt',
  'tan', 'tanh', 'trunc', 'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2',
];

const consoleKeys = [
  'assert', 'clear', 'count', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'profile',
  'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn',
];

const arrayNames = [
  'legalBallIDs', 'Balls', 'Pockets', 'Rails', 'Cushions'
];

let observer = null;


class CodeMirrorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      oldCode: '',
      oldSetupCode: '',
      activeTab: 1,
      waitingToSave: -1,
      difficulty: 0,
      releaseNameValue: '',
      showConfirmOverwriteRelease: false,
      showConfirmLoadRelease: false,
      showOKMessage: false,
      showDeleteConfirmMessage: false,
      selectedFunction: ''
    };

    // this.createPoolGame = this.createPoolGame.bind(this);
    // this.createDodgeBallGame = this.createDodgeBallGame.bind(this);
    this.handlePlaygame = this.handlePlaygame.bind(this);
    this.doOverwrite = this.doOverwrite.bind(this);
    this.doLoadRelease = this.doLoadRelease.bind(this);
    this.doDeleteRelease = this.doDeleteRelease.bind(this);
    this.beautifyCode = this.beautifyCode.bind(this);
    
    this.game = null;
    this.resizeDiv = this.resizeDiv.bind(this);
    //this.handleChangeSetupCode = this.handleChangeSetupCode.bind(this);
  }

  setupWatchOnCodeMirrorHint() {
    // select the target node

    window.tooltipObserverHandle = setInterval(() => {
      var target = document.querySelector('.CodeMirror-lint-tooltip');
      // create an observer instance
      // pass in the target node, as well as the observer options
      if (!target) {
        if (window.currentTip) {
          console.log("tool tip removed! ");  
          $("#hintBox").hide(100);
          delete window.currentTip;
        }
        return;
      }

      // found a tool tip!!
      const t1 = replaceAll(target.innerText, "\n", "").trim();
      const t2 = replaceAll(window.currentTip, "\n", "").trim();
      if (t1 === t2) return;
      // console.log("tool tip! " + target.innerText);
      // console.log("old tip: " + window.currentTip);
      window.currentTip = target.innerText;
      //const p = target.innerText.split("##");
      const errortype = target.childNodes[0].classList[0];
      if (errortype == "CodeMirror-lint-message-error") {
        $("#hintHeader").text("Error");
        $("#hintHeader").css({background: "rgb(211,27,23)"});
      } else if (errortype == "CodeMirror-lint-message-warning") {
        $("#hintHeader").text("Warning");
        $("#hintHeader").css({background: "rgb(189, 134, 10)"});
      } else {
        $("#hintHeader").text("Information");
        $("#hintHeader").css({background: "rgb(33, 51, 152)"});
      }
      //$("#hintContent").text(target.innerText);
      $("#hintContent").html(target.innerHTML);
      const editorOffset = $("#aicode").offset();
      const docHeight = $(document).height();
      const hintHeight = $("#hintBox").height();
      let hintLeft = -420;
      let hintTop = Math.max(40, target.offsetTop + 10000 - 100);
      if (editorOffset.left < 100) {
        // need to show within editor
        hintLeft = 70;
        // need to show hint above code line
        hintTop = target.offsetTop + 10000 - 60;
        if (hintTop + hintHeight + 200 > docHeight) {
          hintTop = target.offsetTop + 10000 - hintHeight - 160;
        }
        // $("hintBox").css({border: "solid 2px white"});
      } else {
        if (hintTop + hintHeight + 200 > docHeight) {
          hintTop = docHeight - hintHeight - 240;
        }
        // $("hintBox").css({border: "solid 2px blue"});
      }

      $("#hintBox").css({top: hintTop, left: hintLeft});
      $("#hintBox").show(100);
    }, 200);
  }

  initComponentAndCode() {
    const { oldCode, oldSetupCode } = this.state;
    const { UserSetupCode, RobotCode, scenario, saveTestingCode, saveRobotCodeReset } = this.props;

    if (!scenario) return;

    if (!componentInit) {

      if (typeof(RobotCode)!="undefined" && typeof(scenario)!="undefined") {
        window.onresize = (e) => {
          this.resizeDiv();
        };
        const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
        const code = this.reconstructCode(RobotCode, latestTime);

        if (code !== this.robotCodeEditor.codeMirror.getValue()) {
          const oldpos = this.robotCodeEditor.codeMirror.getCursor();
          this.robotCodeEditor.codeMirror.setValue(code);
          this.robotCodeEditor.codeMirror.setCursor(oldpos);
        }
  
        // console.log("setting oldCode to " + code);
        let diff = 0;
        if (scenario) {
          if (scenario.package == "advanced") diff = 1;
        }
        if (this.state.oldCode != code) {
          this.setState({
            oldCode: code,
          });
        }

        if (this.state.difficulty != diff) {
          this.state.difficulty = diff;
        }

        this.handleChange(code);

        this.setupWatchOnCodeMirrorHint();

        // console.log("componentDidUpdate setup code" + (scenario? scenario.SetupScript:""));
      }
  
      const that = this;
      window.handleNewRobotCodeChange = (v) => {
        that.handleChange(v);
      };

      this.setState({ activeTab: 1 });

      this.setupWatchOnCodeMirrorHint();

      // console.log("componentDidMount 2 setup code" + (scenario? scenario.SetupScript:""));
      componentInit = true;
    } else {
      // if code is updated at server then update here
      if (RobotCode && RobotCode.CodeUpdates) {
        const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
        const code = this.reconstructCode(RobotCode, latestTime);
  
        if (code && code !== '' && code !== this.robotCodeEditor.codeMirror.getValue() && inLoadingProcess) {
          const oldpos = this.robotCodeEditor.codeMirror.getCursor();
          this.robotCodeEditor.codeMirror.setValue(code);
          this.robotCodeEditor.codeMirror.setCursor(oldpos);
          inLoadingProcess = false;
        }
      }
    }

    if (!userSetupCodeInit && scenario) {
      
      if (!UserSetupCode) {
        // user hasn't specified anything, so just use test script given by scenario
        // debugger;
        if (scenario.isUserTest) {
          scenario.SetupScript = `
ResetTable(true);
PlaceBallOnTable(0, -200, -80);
PlaceBallOnTable(2, -50, -200);
PlaceBallOnTable(3, -450, -300);
PlaceBallOnTable(4, 0, 0);
TakeCallShot();
await WaitForAllBallStop();
ReportEndOfTest();
          `;
        }
        if (getUID() == "") {
          // console.log("no UserSetupCode!! so save initial version using standard " + scenario.SetupScript);
          const chg = this.getPatch("", scenario.SetupScript);
          if (scenario.isUserTest) {
            saveTestingCode(scenario.gameId, "usertestcase_" + scenario._id, { time: new Date().getTime(), label: '', chg });
          } else {
            saveTestingCode(scenario.gameId, scenario._id, { time: new Date().getTime(), label: '', chg });
          }
          this.setState({
            oldSetupCode: scenario.SetupScript,
          });
        }
        

      } else {
        const latestTime = UserSetupCode.CodeUpdates[UserSetupCode.CodeUpdates.length - 1].time;
        const code2 = this.reconstructCode(UserSetupCode, latestTime);
        // console.log("already have UserSetupCode so reconstruct!! " + code2);
        // debugger;
        if (code2 != this.state.oldSetupCode) {
          this.setState({ oldSetupCode: code2 });
        }
      }
      userSetupCodeInit = true;
    }    

  }

  componentDidMount() {
    const { oldCode, oldSetupCode } = this.state;
    const { UserSetupCode, RobotCode, scenario, saveTestingCode, saveRobotCodeReset } = this.props;

    // console.log("codemirror did mount: " + scenario);
    // if (scenario.applyBaselineCode) {
    //   const chg = this.getPatch("", scenario.baselineCode);
    //   saveRobotCodeReset(scenario.gameId, { time: new Date().getTime(), label: '', chg }, window.chatId, "");
    //   // saveTestingCode(scenario.gameId, scenario._id, { time: new Date().getTime(), label: '', chg });
    //   // this.props.RobotCode = chg;
    // }
  
    // if (!scenario) return;

    // this.setState({
    //   oldSetupCode: scenario? scenario.SetupScript:""
    // });

    //console.log("in componentDidMount: " + oldSetupCode + " " + JSON.stringify(RobotCode) + " scenario " + (scenario?scenario.SetupScript:"notyet"));
    // debugger;
    //if (typeof(RobotCode)!="undefined" && typeof(oldSetupCode)=="undefined" && typeof(scenario)!="undefined") {

    window.handlePlaygame = this.handlePlaygame.bind(this);
    window.handleStopTest = this.handleStopTest.bind(this);
    window.beautifyCode = this.beautifyCode.bind(this);
        // console.log("in component componentDidUpdte " + UserSetupCode + " " + componentInit);


    this.initComponentAndCode();

    this.updateFunctionList();
    if (functionList.length > 0)
      this.setState({selectedFunction: functionList[0]});

    // setup timer to trigger first code mirror lint
    setTimeout(() => {
      // console.log("set option lint");
      if (window.robotCodeEditor) {
        window.robotCodeEditor.codeMirror.state.options = {delay: 2000};
        window.robotCodeEditor.codeMirror.setOption("lint", {delay: 2000});
      }
      if (window.testCodeEditor) {
        window.testCodeEditor.codeMirror.setOption("lint", {});
      }
    },4000);
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  updateFunctionList() {
    if (!this.robotCodeEditor) return;
    if (!this.robotCodeEditor.codeMirror) return;
    const robotCode = this.robotCodeEditor.codeMirror.getValue();
    const userBlocks = getCodeBlocks(robotCode);
    functionList = Object.keys(userBlocks);
  }

  componentDidUpdate(prevProps, prevState) {
    // const { oldCode, oldSetupCode } = this.state;

    const { oldCode, oldSetupCode } = this.state;
    const { UserSetupCode, RobotCode, scenario, saveTestingCode } = this.props;

    // console.log("codemirror did update: " + scenario);
    this.initComponentAndCode();

    this.updateFunctionList();
    //this.setState({selectedFunction: functionList[0]});
    return;

    // // debugger;

    // // // this.setState({
    // // //   oldSetupCode: scenario? scenario.SetupScript:""
    // // // });

    // // console.log("in did update: ");
    
    // // if (typeof(RobotCode)!="undefined" && typeof(oldSetupCode)=="undefined" && typeof(scenario)!="undefined") {
    // //   const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
    // //   const code = this.reconstructCode(RobotCode, latestTime);

    // //   this.robotCodeEditor.codeMirror.setValue(code);

    // //   console.log("setting oldCode to " + code);
    // //   if (scenario)
    // //     console.log("setting oldSetupCode to " + scenario.SetupScript);
    // //   this.setState({
    // //     oldCode: code,
    // //     oldSetupCode: scenario? scenario.SetupScript:""
    // //   });
    // // }

    // if (prevState.showModal && !this.state.showModal) {
    //   if (!this.game) return;
    //   // we only submit the result after the modal window is dismissed
    //   window.submitTestResultInChat(window.testResult);

    //   this.game.paused = true;
    //   document.getElementById('gameDivShellHidden').appendChild(
    //     document.getElementById('gameDiv')
    //   );


    //   // also remove worker thread.
    //   if (this.game.terminateRobotWorkers)
    //     this.game.terminateRobotWorkers();

    //   // window.exitTestScreen();
    //   this.game.gameOver = true;
    //   if (this.game.tweenF1) {
    //     this.game.tweenF1.stop();
    //     this.game.tweenB1.stop();
    //     this.game.tweenF2.stop();
    //     this.game.tweenB2.stop();
    //     this.game.inStrikeAnimation = false;
    //   }



    //   // this.game.controller.inStrike = true;
    // } else if (!prevState.showModal && this.state.showModal) {
    //   // bring up the game world modal window
      
    //   if (this.game != null) {
    //     window.testResult = '';
    //     this.game.inStrikeAnimation = false;
    //     const game = this.game;
    //     game.clearTestResult();
    //     console.log('game exists!');
    //     this.game.clearTestResult();
    //     this.game.activePlayerInfo = null;
    //     this.game.waitingPlayerInfo = null;        
    //     this.game.controller.ResetTable(true);
    //     Meteor.setTimeout(() => {
    //       // console.log('to append game div!');
    //       document.getElementById('gameDivShellModal').appendChild(
    //         document.getElementById('gameDiv')
    //       );

    //       const robotCode = this.robotCodeEditor.codeMirror.getValue();
          
    //       // console.log(`assign robot code ${robotCode}`);
    //       for (let j = 0; j < game.playerInfo.length; j++) {
    //         game.playerInfo[j].PlayerCode = robotCode;
    //         game.playerInfo[j].TestCode = oldSetupCode;
    //       }
    //       // game.playerInfo1.PlayerCode = robotCode;
    //       // game.playerInfo2.PlayerCode = robotCode;
    //       Meteor.setTimeout(() => {
    //         // console.log('to create ai player in show modal!');
    //         // game.controller.createAIPlayers();
    //         // debugger;
    //         game.paused = false; // this will trigger initialization call back!
    //         // const setupCode = window.setupCodeEditor.codeMirror.getValue();
    //         game.gameOver = false;
    //         // setTimeout(()=> {
    //         //   // game.controller.runCode(oldSetupCode);
    //         //   game.controller.runTest();
    //         // }, 600);
    //       }, 500);
    //     }, 500);
    //   } else {
    //     Meteor.setTimeout(() => {
    //       // debugger;
    //       document.getElementById('gameDivShellModal').appendChild(
    //         document.getElementById('gameDiv')
    //       );
    //       if (gameName == "PathPool")
    //         this.createPoolGameNew();
    //       else {
    //         console.log("to create dodge ball game");
    //         this.createDodgeBallGame();
    //       }
    //     }, 500);
    //   }
    // }
  }

  componentWillMount() {
    // console.log("cm will mount");
    userSetupCodeInit = false;
    // windowAttrs = Object.keys(window);

    //$.getScript('http://eslint.org/js/app/eslint.js', () => {
    $.getScript('/js/eslint.js', () => {
      // console.log("load linter");
      //import './imports/my-javascript-eslint.js';

      const CM = require("../../../../node_modules/codemirror/lib/codemirror");
      mod(CM);


    });
  }

  deepClean(obj) {
    if (!obj) return;
    Object.keys(obj).forEach((k) => {  
      if (obj[k] && obj[k].destroy) {
        if (typeof obj.destroy == 'function')            
          obj.destroy(true);    
      }
      delete obj[k];
    });
  }

  componentWillUnmount() {
    // console.log("cm will unmount");
    componentInit = false;
    if (window.tooltipObserverHandle) clearInterval(window.tooltipObserverHandle);
    userSetupCodeInit = false;
    if (this.game) {
      if (this.game.cleanUpAll)
      this.game.cleanUpAll();

      if (this.game.gameObj)
        this.deepClean(this.game.gameObj);
      this.deepClean(this.game);
      delete this.game;
      delete this.gameSetup;
    }
    this.cleanUpPoolGame();
  }

  changeTab = (id) => {
    this.setState({ activeTab: id });
  }

  // createDodgeBallGame() {
  //   const { oldSetupCode, difficulty } = this.state;
  //   const { scenario } = this.props;

  //   let diff = 0;
  //   if (scenario) {
  //     // console.log("setting oldSetupCode to " + scenario.SetupScript);
  //     // if (scenario.package == "advanced") diff = 1;
  //     if (scenario.package == "advanced") diff = 1;
  //   }
  //   // const oldSetupCode = this.setupCodeEditor.codeMirror.getValue();
  //   const myUser = Meteor.user();
  //   const robotCode = this.robotCodeEditor.codeMirror.getValue();
  //   // debugger;
  //   console.log(`init robot code ${robotCode}`);

  //   const playerInfo1 = {
  //     ID: 0,
  //     ready: true,
  //     localInput: true,
  //     playerID: myUser.username,
  //     playerRating: 500,
  //     playerType: GAME_CONFIG_OPTION.AI,
  //     playerUserId: Meteor.userId(),
  //     PlayerCode: robotCode
  //   };
  //   const playerInfo2 = {
  //     ID: 1,
  //     ready: true,
  //     localInput: true,
  //     playerID: myUser.username,
  //     playerRating: 500,
  //     playerType: GAME_CONFIG_OPTION.HUMAN,
  //     playerUserId: Meteor.userId(),
  //     PlayerCode: robotCode
  //   };


  //   global.PIXI = require('pixi.js');
  //   window.PIXI = global.PIXI;
      
  //   const THREE = require('three');
  //   global.THREE = THREE;
  //   window.THREE = THREE;

  //   // hack: manually copied latest ammo.js files from ammo js github page, and add this line at bottom:
  //   // module.exports = Ammo();
  //   // didn't need to change idl file at all!
  //   // debugger;
  //   const Ammo = require('ammonext');
  //   global.Ammo = Ammo;
  //   window.Ammo = Ammo;

  //   const DodgeBallGameSetupLib = require('../../games/gamePool/lib/dodgeballgamesetup.js');
  //   const DodgeBallGameSetup = DodgeBallGameSetupLib.default;
  //   const gameSetup = new DodgeBallGameSetup();
  //   const room = { isPractice: false, isTesting: true };

  //   gameSetup.gameType = GAME_TYPE.TESTING;
  //   gameSetup.difficulty = diff; //LEVEL_NUMBER[difficulty];
  //   gameSetup.isProfessionalUser = true; //isProfessionalUser;
  //   gameSetup.playerInfo = [playerInfo1, playerInfo2];
  //   gameSetup.roomId = "TestingRoom";
  //   // gameSetup.pairData = config.pairData;
  //   gameSetup.room = room;
  //   gameSetup.history = history;
  //   gameSetup.playerCount = gameSetup.playerInfo.length;

  //   //gameSetup.isHost = gameSetup.playerInfo[0].userId == Meteor.userId();
  //   gameSetup.isHost = true;

  //   this.game = gameSetup;

  //   gameSetup.initializationCallBack = function() {
  //     Meteor.setTimeout(() => {
  //       console.log("dodge ball initializationCallBack: to call old setup code!!!! " + oldSetupCode);
  //       console.log('to create ai player!');
  //       // gameSetup.controller.createAIPlayers();
  //       gameSetup.paused = false;
  //       // gameSetup.controller.runCode(oldSetupCode);
  //       gameSetup.controller.runTest();
  //     }, 100);
  //   };


  //   gameSetup.setupGame();
  // }

  cleanUpPoolGame() {
    // const newWindowAttrs = Object.keys(window);

    // for (let i=0; i<newWindowAttrs.length; i++) {
    //   const key = newWindowAttrs[i];
    //   if (!windowAttrs.includes(key)) {
    //     console.log("removing key from window " + key);
    //     delete window[key];
    //   }
    // }
    delete window.Victor;
    delete window.robotCodeEditor;
    delete this.robotCodeEditor;
    delete this.setupCodeEditor;
    // delete this.gameSetup.exitTestScreen;
    delete window.handleNewRobotCodeChange;
    delete window.TWEEN;
    // delete window.eslint;
    delete window.Howl;
    delete window.HowlerGlobal;
    delete window.Howler;
    // delete window.PIXI;
    delete window.p2;
    delete window.testCondition;
    delete window.testResult;
  }

  // createPoolGameNew() {
  //   const { oldSetupCode, difficulty } = this.state;
  //   const { scenario } = this.props;

  //   const that = this;
  //   let diff = 0;
  //   if (scenario) {
  //     // console.log("setting oldSetupCode to " + scenario.SetupScript);
  //     // if (scenario.package == "advanced") diff = 1;
  //     if (scenario.package == "advanced") diff = 1;
  //   }

  //   // const oldSetupCode = this.setupCodeEditor.codeMirror.getValue();
  //   const myUser = Meteor.user();
  //   const robotCode = this.robotCodeEditor.codeMirror.getValue();
  //   // console.log(`init robot code ${robotCode}`);

  //   const playerInfo1 = {
  //     ID: 0,
  //     ready: true,
  //     localInput: true,
  //     playerID: myUser.username,
  //     playerRating: 500,
  //     playerType: 'AI',
  //     playerUserId: Meteor.userId(),
  //     PlayerCode: robotCode
  //   };
  //   const playerInfo2 = {
  //     ID: 1,
  //     ready: true,
  //     localInput: true,
  //     playerID: myUser.username,
  //     playerRating: 500,
  //     playerType: 'AI',
  //     playerUserId: Meteor.userId(),
  //     PlayerCode: robotCode
  //   };
  //   // const container = document.getElementById('gameDiv').getBoundingClientRect();


  //   window.PIXI = require('pixi.js');
  //   window.p2 = require('p2');
  //   const Howler = require('howler');
  //   window.Howl = Howler.Howl;
  //   window.TWEEN = require('../../games/gamePool/components/Tween.min.js');
  //   window.Victor = Victor;
      
  //   const PathPoolGameSetupLib = require('../../games/gamePool/lib/luckypoolgamesetup.js');
  //   const PathPoolGameSetup = PathPoolGameSetupLib.default;
  //   const gameSetup = new PathPoolGameSetup();

  //   gameSetup.gameType = GAME_TYPE.TESTING;
  //   gameSetup.difficulty = diff;
  //   gameSetup.isProfessionalUser = true; //isProfessionalUser;

  //   gameSetup.playerInfo = [playerInfo1, playerInfo2];
  //   gameSetup.roomId = "TestingRoom";
  //   gameSetup.history = history;
  //   gameSetup.playerCount = gameSetup.playerInfo.length;

  //   // whoever is the first in the playerInfo list is the game host, though
  //   // it doesn't mean he takes the break. Just means he has to decide who
  //   // has the token to take the break
  //   gameSetup.isHost = true;
  //   this.gameSetup = gameSetup;      
  //   this.game = gameSetup;
  //   this.game.inStrikeAnimation = false;

  //   this.gameSetup.exitTestScreen = () => {
  //     that.toggleModal();
  //   };

  //   // gameSetup.initializationCallBack = function() {
  //   //   // console.log("initializationCallBack: to call old setup code!!!! " + oldSetupCode);
  //   //   Meteor.setTimeout(() => {
  //   //     console.log('to create ai player from within initializationCallBack!');
  //   //     debugger;
  //   //     let setupCode = that.state.oldSetupCode;
  //   //     if (setupCode.indexOf("ReportEndOfTest") < 0) {
  //   //       setupCode += "\r\nawait WaitForAllBallStop();\r\nReportEndOfTest();";
  //   //     }
        
  //   //     gameSetup.controller.createAIPlayers(setupCode);
  //   //     gameSetup.paused = false;
  //   //     setTimeout(()=>{
  //   //       gameSetup.controller.runTest();
  //   //     },500);
  //   //     // gameSetup.controller.runCode(oldSetupCode);
  //   //   }, 500);
  //   // };

  //   gameSetup.setupGame();    
  // }

  // createPoolGame() { // obsolete
  //   const { oldSetupCode, difficulty } = this.state;
  //   // const oldSetupCode = this.setupCodeEditor.codeMirror.getValue();
  //   const myUser = Meteor.user();
  //   const robotCode = this.robotCodeEditor.codeMirror.getValue();
  //   console.log(`init robot code ${robotCode}`);

  //   const playerInfo1 = {
  //     ID: 0,
  //     ready: true,
  //     localInput: true,
  //     playerID: myUser.username,
  //     playerRating: 500,
  //     playerType: 'AI',
  //     playerUserId: Meteor.userId(),
  //     PlayerCode: robotCode
  //   };
  //   const playerInfo2 = {
  //     ID: 1,
  //     ready: true,
  //     localInput: true,
  //     playerID: myUser.username,
  //     playerRating: 500,
  //     playerType: 'AI',
  //     playerUserId: Meteor.userId(),
  //     PlayerCode: robotCode
  //   };
  //   const container = document.getElementById('gameDiv').getBoundingClientRect();

  //   window.Bert = Bert;
  //   // global.Bert = Bert;

  //   global.PIXI = require('phaser/build/custom/pixi');
  //   // window.PIXI = PIXI();
  //   global.Victor = Victor;
  //   window.Victor = Victor;
  //   // global.Victor = Victor;
  //   window.p2 = require('phaser/build/custom/p2');
  //   // global.p2 = p2;
  //   window.gameModal = gameModal;
  //   // global.gameModal = gameModal;

  //   const Phaser = require('phaser');

  //   global.Phaser = null;
  //   global.Phaser = Phaser;
  //   // window.Phaser = Phaser;
  //   const cfg = {
  //     p2: true,
  //     mpx: v => v,

  //     /**
  //     * Convert pixel value to p2 physics scale (meters).
  //     */
  //     pxm: v => v,

  //     /**
  //     * Convert p2 physics value (meters) to pixel scale and inverses it.
  //     */
  //     mpxi: v => -v,

  //     /**
  //     * Convert pixel value to p2 physics scale (meters) and inverses it.
  //     */
  //     pxmi: v => -v
  //   };

  //   const h = container.height;
  //   const w = container.width;

  //   const game = new Phaser.Game(h > w ? h : w, h > w ? w : h, Phaser.CANVAS, 'gameDiv', null, false, true, cfg);
  //   // game.config.forceSetTimeOut = true;

  //   game.gameType = GAME_TYPE.TESTING;
  //   game.difficulty = difficulty;
  //   game.playerInfo = [playerInfo1, playerInfo2];

  //   game.room = { isPractice: false, isTesting: true, playerInfo: game.playerInfo };
  //   game.isPractice = game.room.isPractice;
  //   game.isTesting = game.room.isTesting;

  //   addPhaserIlluminated(Phaser, game);

  //   game.state.add('Boot', Pool.Boot);
  //   game.state.add('Preloader', Pool.Preloader);
  //   game.state.add('MainMenu', Pool.MainMenu);
  //   game.state.add('Game', Pool.Game);
  //   game.state.start('Boot');

  //   game.initializationCallBack = function() {
  //     Meteor.setTimeout(() => {
  //       game.controller.runCode(oldSetupCode);
  //     }, 200);
  //   };
  //   this.game = game;
  // }

  reconstructCode(uc, latesttime) {
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

  resizeDiv() {
    if (!document.getElementById('gameDiv')) return;
    const container = document.getElementById('gameDiv').getBoundingClientRect();
    const h = container.height;
    const w = container.width;
    if (this.game) {
      this.game.width = h > w ? h : w;
      this.game.height = h > w ? w : h;
    }
  }

  /* Get into full screen */
  GoInFullscreen = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  /* Get out of full screen */
  GoOutFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
  /* Call FullScreen */
  Fullscreen(element) {
    if (this.IsFullScreenCurrently()) {
      this.GoOutFullscreen();
    } else {
      this.GoInFullscreen(document.getElementsByClassName(element)[0]);
    }
  }
  /* Is currently in full screen or not */
  IsFullScreenCurrently = () => (
    document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen
  )

  getLintErrors() {
    const result = [];
    if (window.robotCodeEditor && window.robotCodeEditor.codeMirror.state.lint) {
      const candidates = window.robotCodeEditor.codeMirror.state.lint.marked;
      candidates.forEach((c) => {
        if (c.__annotation.severity !== 'information') result.push(c.__annotation);
      });
    }
    return result;
  }

  handleChange(value) {
    const { scenario, saveRobotCode } = this.props;
    const oldValue = this.state.oldCode;

    const lintErrors = this.getLintErrors();
    const firstError = lintErrors.length > 0 ? `${lintErrors[0].from.line}:${lintErrors[0].message}` : '';

    // console.log('in handle change');
    clearTimeout(this.state.waitingToSave);

    const that = this;
    this.state.waitingToSave = setTimeout(() => {

      const prevCode = UserRobotCodeByLesson.findOne({
        gameId: scenario.gameId, UserID: getUID() == ""? Meteor.userId() : getUID(),
        ScenarioID: scenario._id
      });
      let chg = null;
      if (!prevCode) {
        chg = that.getPatch("", value);
      } else {
        chg = that.getPatch(oldValue, value);
      }
       
      that.setState({
        oldCode: value
      });
      // Should be check after 1000s all param have value
      if (scenario.gameId && chg && window.chatId && getUID() == "") {
        saveRobotCode(scenario.gameId, { time: new Date().getTime(), label: '', chg }, window.chatId, firstError, scenario._id);
        window.CodeChangeCount ++;
      }
    }, 3000);
  }

  toggleOverwriteReleaseModal = () => {
    // debugger;
    this.setState({ showConfirmOverwriteRelease: !this.state.showConfirmOverwriteRelease });
  }

  toggleLoadReleaseModal = () => {
    // debugger;
    this.setState({ showConfirmLoadRelease: !this.state.showConfirmLoadRelease });
  }

  toggleOKMessageModal = () => {
    this.setState({ showOKMessage: !this.state.showOKMessage });
  }

  toggleDeleteConfirmModal = () => {
    this.setState({ showDeleteConfirmMessage: !this.state.showDeleteConfirmMessage });
  }

  doOverwrite = function() {
    this.doRelease();
    this.setState({ showConfirmOverwriteRelease: false });
  }

  doDeleteRelease = function() {
    const { scenario, deleteAICodeRelease } = this.props;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const label = labelField.value;
    const deleteButton = document.getElementById('deleteButton'); 


    const that = this;
    // deleteButton.innerText = "deleting ...";
    deleteAICodeRelease(scenario.gameId, label, 'Standard', (err) => {
      if (err) {
        //Bert.alert(`Release ${label} can't be deleted: ${err}.`, 'error', 'growl-bottom-right');  
        Bert.alert({
          title: 'Error',
          message: `Release ${label} can't be deleted: ${err}.`,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });        
      } else {
        // Bert.alert(`Release ${label} successfully deleted.`, 'success', 'growl-bottom-right');
        Bert.alert({
          title: 'Success',
          message: `Release ${label} successfully deleted.`,
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-check'
        });                
      }

      
      Meteor.subscribe('UserAICodeProdLabels', scenario.gameId, 'Standard', getUID());
      this.setState({ showDeleteConfirmMessage: false });
    });
  }


  doLoadRelease = function() {
    const { scenario, loadAICodeRelease } = this.props;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const label = labelField.value;
    const loadButton = document.getElementById('loadButton'); 
    const codesave = this.state.oldCode;

    inLoadingProcess = true;
    // this.state.oldCode = "loading ...";
    // window.robotCodeEditor.codeMirror.setValue(this.state.oldCode);

    const that = this;
    // loadButton.innerText = "loading ...";
    loadAICodeRelease(codesave, scenario.gameId, label, 'Standard', scenario._id, (err) => {
      if (err) {
        // Bert.alert(`Release ${label} can't be loaded: ${err}.`, 'error', 'growl-bottom-right');  
        Bert.alert({
          title: 'Error',
          message: `Release ${label} can't be loaded: ${err}.`,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });    
        that.state.oldCode = codesave;            
      } else {
        // Bert.alert(`Release ${label} successfully loaded.`, 'success', 'growl-bottom-right');
        Bert.alert({
          title: 'Success',
          message: `Release ${label} successfully loaded.`,
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-check'
        });                
      }
      
      // seems duplicate?
      //Meteor.subscribe('UserRobotCode', scenario.gameId, 'Standard');
      Meteor.subscribe('UserRobotCodeByLesson', scenario.gameId, 'Standard');
      that.setState({ showConfirmLoadRelease: false });

      // if (window.robotCodeEditor) {
      //   // if (window.robotCodeEditor.codeMirror.getValue() != code) {
      //     window.robotCodeEditor.codeMirror.setValue(code);
      //     this.state.oldCode = code;
      //   // }
      // }
        
      // that.forceUpdate();
    });
  }

  doRelease = function() {
    const { scenario, releaseAICode } = this.props;
    const code = this.state.oldCode;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const releaseButton = document.getElementById('releaseButton'); 
    const label = labelField.value;
    // const that = this;
    releaseAICode(code, scenario.gameId, label, 'Standard', (err) => {
      if (err) {
        Bert.alert(`Release ${label} can't be saved: ${err}.`, 'error', 'growl-bottom-right');  
      } else {
        Bert.alert(`Release ${label} successfully uploaded.`, 'success', 'growl-bottom-right');
      }

      // labelField.value = '';
      // debugger;
      // releaseButton.innerText = "saving ...";
      // hack to work around autorun not being called issue!

      
      Meteor.subscribe('UserAICodeProdLabels', scenario.gameId, 'Standard', getUID());
      // setTimeout(() => {
      //   that.forceUpdate();
      // }, 1000);
    });
  }

  codeIsValid(code) {
    const { scenario } = this.props;

    if (window.robotCodeEditor && window.robotCodeEditor.codeMirror.state.lint) {
      const lintErrors = this.getLintErrors();
      if (lintErrors.length > 0) {
        okMessage = "Please fix the grammar errors first.";
        // Bert.alert(okMessage, 'codeInValidError', 'growl-bottom-right');
        Bert.alert({
          title: 'Error',
          message: okMessage,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });
        // this.toggleOKMessageModal();  
        return false;
      }
    }

    let gameName = "PathPool";
    if (scenario.gameId == "z7Zw82CrjYW2ZJWZZ") {
      gameName = "DodgeBall";
    } else if (scenario.gameId == "tankwarmdKu94Qi2Y") {
      gameName = "TankWar";

      if (code.indexOf("getNewCommand") < 0) {
        okMessage = "Your code is missing the getNewCommand function";
        // Bert.alert(okMessage, 'codeInValidError', 'growl-bottom-right');
        Bert.alert({
          title: 'Error',
          message: okMessage,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });
        // this.toggleOKMessageModal();  
        return false;
      }      

    } else {
      // check if there are at least 2 functions
      if (code.indexOf("getBreakShot") < 0) {
        okMessage = "Your code is missing the getBreakShot function";
        // Bert.alert(okMessage, 'codeInValidError', 'growl-bottom-right');
        Bert.alert({
          title: 'Error',
          message: okMessage,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });
        // this.toggleOKMessageModal();  
        return false;
      }
      if (code.indexOf("getCallShot") < 0) {
        okMessage = "Your code is missing the getCallShot function";
        Bert.alert({
          title: 'Error',
          message: okMessage,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });
        // this.toggleOKMessageModal();
        return false;
      }
      // if (code.indexOf("getCueBallPlacement") < 0) {
      //   okMessage = "Your code is missing the getCueBallPlacement function";
      //   Bert.alert({
      //     title: 'Error',
      //     message: okMessage,
      //     type: 'codeInValidError',
      //     style: 'growl-bottom-right',
      //     icon: 'fa-warning'
      //   });
      //   // this.toggleOKMessageModal();
      //   return false;
      // }
    }

    return true;
  }

  handleDeleteRelease() {
    const { scenario, ReleaseLabels } = this.props;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const label = labelField.value;

    if (ReleaseLabels.includes(label)) {
      // need to confirm if overwrite!
      //deleteMessage = `Are you sure you want to delete release ${label}?`;
      //this.toggleDeleteConfirmModal();


      swal({
        title: `Are you sure you want to delete release ${label}?`,
        text: "",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.doDeleteRelease();
        } 
      });   

    } else {
      // release ai code
    }
  }

  handleLoadCode() {
    const { scenario, releaseAICode } = this.props;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const loadButton = document.getElementById('loadButton'); 
    const label = labelField.value;

    //loadMessage = `Load release ${label} and overwrite current code in editor?`;
    //this.toggleLoadReleaseModal();

    swal({
      title: `Load release ${label} and overwrite current code in editor?`,
      text: "",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
    .then((confirmed) => {
      if (confirmed) {
        this.doLoadRelease();
      } 
    });    
  }


  handleReleaseCode() {
    const { scenario, ReleaseLabels, releaseAICode } = this.props;
    const code = this.state.oldCode;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const releaseButton = document.getElementById('releaseButton'); 
    const label = labelField.value;

    if (!this.codeIsValid(code)) {
      return;
    }

    if (ReleaseLabels.includes(label)) {
      // need to confirm if overwrite!
      // overwriteMessage = `Overwrite existing release ${label}?`;
      //this.toggleOverwriteReleaseModal();

      swal({
        title: `Overwrite existing release ${label}?`,
        text: "",
        icon: "info",
        buttons: true,
        dangerMode: true,
      })
      .then((confirmed) => {
        if (confirmed) {
          this.doRelease(code, scenario.gameId, label);
        } 
      });


    } else {
      // release ai code
      this.doRelease(code, scenario.gameId, label);
    }
  }

  beautifyCode() {
    const editor = this.state.activeTab === 1 ? this.robotCodeEditor : this.setupCodeEditor;
    const code = editor.codeMirror.getValue();
    const prettier = beautify(code, { indent_size: 2, jslint_happy: true });
    editor.codeMirror.setValue(prettier);
    if (this.state.activeTab === 1) this.handleChange(prettier);
    else this.handleChangeSetupCode(prettier);
  }

  handleStopTest() {
    window.gameSetup.controller.killAIPlayers();
    window.gameSetup.tableDirty = true;
  }

  handlePlaygame() {
    if (!window.enableTestButton) {
      window.submitTestResultInChat(`I haven't given the next test yet. Please type 'next' or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.`);
      return;
    }
    window.TestRunCount ++;
    // first test if work syntax is correct!
    const code = this.state.oldCode;
    // const code = this.robotCodeEditor.codeMirror.getValue();
    if (code.indexOf('function') < 0 && code.indexOf('=> {') < 0  && code.indexOf('=>{') < 0) {
      window.submitTestResultInChat('Error: your code has not defined any function.');
      return;
    }

    try {
      Function('world', 'myID', 'Victor', code);
    } catch (e) {
      let err = e.message;
      if (err.indexOf("await is only valid in async function") >= 0) {
        err += `. Have you forgotten to add the keyword 'async' in front of 'function getCallShot' or 'function checkEndGame1'?`;
      }
      window.submitTestResultInChat(`Syntax Error: ${err}.`);
      return;
    }

    if (this.robotCodeEditor.codeMirror.state.lint) {
      const lintErrors = this.getLintErrors();
      if (lintErrors.length > 0) {
        //const err = this.robotCodeEditor.codeMirror.state.lint.marked[0].lines[0].markedSpans[0].marker.__annotation.message;
        let errorLine = -1;
        let annotation = "";
        for (let k=0; k<lintErrors.length; k++) {
          if (lintErrors[k].severity == "error") {
            errorLine = lintErrors[k].from.line;
            annotation = lintErrors[k];
            break;
          }
        }
        if (annotation == "" || (annotation.message == "Forgotten 'debugger' statement?" && lintErrors.length == 1)) {
          // this is ok
        } else {
          // const lintError = `${1 + Number(annotation.from.line)}:${annotation.message}`;
          window.submitTestResultInChat(`Please fix error at line ${errorLine} first: ${annotation.message}`);
          return;
        }
      }
    }

    // then check for testCodeCondition if any
    if (window.testCodeCondition && window.testCodeCondition != '') {
      if (window.testCodeCondition.indexOf('_UsingAwait') > 0) {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        // debugger;
        let hasAwait = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('await calculateProbability') >= 0) {
            hasAwait = true; break;
          }
        }
        if (!hasAwait) {
          window.submitTestResultInChat(`Please use the new 'await calculateProbability(command)' method. See example code above.`);
          return;
        }        
      }

      if (window.testCodeCondition.indexOf("_BoundaryTop") >= 0) {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        // debugger;
        let hasBoundaryTop = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('Boundaries.TOP_Y') >= 0) {
            hasBoundaryTop = true; break;
          }
        }
        if (!hasBoundaryTop) {
          window.submitTestResultInChat(`Please use Boundaries.TOP_Y to calculate the mirror point of ball 2's position.`);
          return;
        }   
      }

      if (window.testCondition == "TestFinishedAnyResultAsyncGetProb") {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        // debugger;
        let hasAsync = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('async') >= 0 && line.indexOf('function') > line.indexOf('async') && line.indexOf('getCallShot') > line.indexOf('function')   ) {
            hasAsync = true; break;
          }
        }
        if (!hasAsync) {
          window.submitTestResultInChat(`Please add the keyword <b>async</b> at the beginning of your getCallShot function definition.`);
          return;
        }        
      }

      

      if (window.testCondition == "TestFinishedCallCalcEndState") {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        // debugger;
        let hasAwait = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('await') >= 0 && line.indexOf('calculateEndState') > line.indexOf('await')) {
            hasAwait = true; break;
          }
        }
        if (!hasAwait) {
          window.submitTestResultInChat(`Please use 'await calculateEndState' to calculate end states.`);
          return;
        }        
      }

      
      if (window.testCondition == "TestFinishedCallConsoleLogTest") {
        const sampleCode = this.testCode.codeMirror.getValue().split("\n");
        // debugger;
        let hasLogging = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('console.log(') >= 0) {
            hasLogging = true; break;
          }
        }
        if (!hasLogging) {
          window.submitTestResultInChat(`Please use 'console.log()' in your test script to log message into the developer console.`);
          return;
        }        
      }

      if (window.testCondition == "TestFinishedCallConsoleLog") {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        // debugger;
        let hasLogging = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('console.log(') >= 0) {
            hasLogging = true; break;
          }
        }
        if (!hasLogging) {
          window.submitTestResultInChat(`Please use 'console.log()' in your robot code to log message into the developer console.`);
          return;
        }        
      }

      const codeToErrMsg = {
        "MyTank.r": "Your robot code has to check the row number of MyTank.",
        "MyTank.c": "Your robot code has to check the column number of MyTank.",
        "attackWhiteTank": "You need to define the function 'attackWhiteTank'.",
        "getRandomCommand": "You need to define the function 'getRandomCommand'.",
        "functiongetDangerScores()": "You need to define the function 'getDangerScores'.",
        "=attackOpponent()": "Function attackOpponent should be called in getNewCommand.",
        "functionattackTank(": "You need to define the function 'attackTank'.",
        "=getSpecialWeapon(": "Function getSpecialWeapon should be called in getNewCommand.",
        "returnweaponType1==": "The answer is 'return weaponType1 == SPECIAL_WEAPON_TYPES.WAY4;'",
        "functionshootWith4Way(":  "You need to define the function 'shootWith4Way'.",
        "functionshootWith3SplOrNova(": "You need to define the function 'shootWith3SplOrNova'.",
        "60/(19-tank.specialPower.speed)": "Please calculate the tank's speed with the specific formula.",
        "getWeaponRange": "Please call the function getWeaponRange."
      };

      if (window.testCondition && window.testCondition.indexOf("TestFinishedCodeIncludes_") >= 0) {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        const conditions = window.testCondition.split(';');
        // **** suppose "TestFinishedCodeIncludes_" is always used as the FIRST condition *****
        const expected = conditions[0].split('_').slice(1);
        for (let i = 0; i < expected.length; i += 1) {
          const cur = expected[i];
          let hascode = false;
          for (let j = 0; j < sampleCode.length; j++) {
            const line = sampleCode[j].replace(/\s/g,'');
            if (line.indexOf(cur) >= 0) {
              hascode = true; break;
            }
          }
          if (!hascode) {
            const msg = cur in codeToErrMsg ? codeToErrMsg[cur] : `'${cur}' is expected in your robot code.`;
            window.submitTestResultInChat(`Test failed: ${msg}`);
            return;
          }
        }   
        if (conditions.length > 1) {
          window.testCondition = conditions.slice(1).join(";");
        }
      }

      if (window.testCondition && window.testCodeCondition.indexOf('_UsingExtrapolate') > 0) {
        const sampleCode = this.robotCodeEditor.codeMirror.getValue().split("\n");
        let hasIt = false;
        let inGetCueBallPlacement = false;
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf("getCueBallPlacement") > 0 && line.indexOf("//") < 0) {
            inGetCueBallPlacement = true; continue;
          }
          if (inGetCueBallPlacement && line.indexOf("function") > 0 && line.indexOf("//") < 0) {
            break;
          }
          if (inGetCueBallPlacement && line.indexOf('extrapolatePoints(') >= 0) {
            hasIt = true; break;
          }
        }
        if (!hasIt) {
          window.submitTestResultInChat(`Please use 'extrapolatePoints' to calculate where to place cue ball. See example code above.`);
          return;
        }        
      }
      



      if (window.testCodeCondition == 'UseVariableSpeified') {
        const sampleCode = window.testCodeSample.split('\n');
        // debugger;
        let functionContext = '';
        let functionContextUser = '';
        for (let j = 0; j < sampleCode.length; j++) {
          const line = sampleCode[j];
          if (line.indexOf('function') >= 0) {
            functionContext = getFunctionContext(line);
          }
          if (line.indexOf('change to use') > 0 && line.trim().indexOf('//') > 0) {
            const prefix = line.substring(0, line.indexOf(':')).trim();
            const parts = line.trim().split(' ');
            const variables = parts[parts.length - 1].split(';');

            const userCodeLines = code.split('\n');
            for (let k = 0; k < userCodeLines.length; k++) {
              if (userCodeLines[k].indexOf('function') >= 0) {
                functionContextUser = getFunctionContext(userCodeLines[k]);
              }

              console.log(`functionContext ${functionContext} vs ${functionContextUser}`);
              if (userCodeLines[k].indexOf(`${prefix}:`) >= 0 && (functionContext == functionContextUser)) {
                for (let z = 0; z < variables.length; z++) {
                  const variable = variables[z];
                  console.log(`line is ${userCodeLines[k]}`);
                  console.log(`variables are ${variable}`);
                  // debugger;
                  if (userCodeLines[k].indexOf(variable) < 0) {
                    window.submitTestResultInChat(`Please use ${variable} for ${prefix} calculation.`);
                    return;
                  }
                }
              }
            }
          }
        }
        // go through each line of user code
      }
    }


    $("#chartcontainer").hide();
    // this.toggleModal();
    if (getUID() == "")
      window.gameSetup.onNewTestRun(this.state.oldSetupCode, this.robotCodeEditor.codeMirror.getValue());
    else {
      if (window.testCodeEditor)
        window.gameSetup.onNewTestRun(window.testCodeEditor.codeMirror.getValue(), this.robotCodeEditor.codeMirror.getValue());
      else {
        window.gameSetup.onNewTestRun(this.state.oldSetupCode, this.robotCodeEditor.codeMirror.getValue());
      }
    }
  }

  getPatch(oldv, newv) {
    const diff = dmp.diff_main(oldv, newv, true);

    if (diff.length > 2) {
      dmp.diff_cleanupSemantic(diff);
    }
    const patchList = dmp.patch_make(oldv, newv, diff);
    const patchText = dmp.patch_toText(patchList);

    return patchText;
  }

  toggleModal = () => {
    // if (this.isMounted())
    console.log("try toggle modal!");
    const oldModal = this.state.showModal;
    this.setState({ showModal: !oldModal });

    // if (!oldModal) return;
    // const that = this;
    // setTimeout(() => {
    //   if (that.state.showModal == oldModal) {
    //     console.log("second try to set modal to not " + oldModal);
    //     that.setState({ showModal: !oldModal });
    //   }
    // }, 1800);
  }

  closeModal = () => {
    // if (this.isMounted())
      this.setState({ showModal: false });
  }


  handleChangeSetupCode(value) {
    const { scenario, saveTestingCode } = this.props;
    const oldValue = this.state.oldSetupCode;

    // console.log('in handle change');
    clearTimeout(this.state.waitingToSaveTesting);

    const that = this;
    
    this.state.waitingToSaveTesting = setTimeout(() => {
      const chg = that.getPatch(oldValue, value);
      if (scenario.isUserTest) {
        saveTestingCode(scenario.gameId, "usertestcase_" + scenario._id, { time: new Date().getTime(), label: '', chg });
      } else {
        saveTestingCode(scenario.gameId, scenario._id, { time: new Date().getTime(), label: '', chg });
      }

      // console.log("saving setup code" + value);
      this.setState({
        oldSetupCode: value
      });
    }, 1000);
    
    // debugger;
  }

  // sometimes when we save robot code, lint error wasn't removed yet, so
  // we need to call save here as well when we see lint errors are gone
  // actually we will only do it here! since only now can we be sure about lintError!
  lintUpdate(lintIssues) {
    // not used any more!
    const { scenario, saveRobotCode } = this.props;
    //debugger;
    //console.log(`in lint update!! ${JSON.stringify(lintIssues)}`);
    if (lintIssues.length == 0)
      saveRobotCode(scenario.gameId, { time: new Date().getTime(), label: '', chg: null }, window.chatId, "", scenario._id);
  }

  lintUpdateTestScript(lintIssues) {
    // not used any more!
    // const { scenario, saveRobotCode } = this.props;
    // debugger;
    console.log(`in lint update!! ${JSON.stringify(lintIssues)}`);
    lintIssues.length = 0;
  }

  funcChange(v) {
    const editor = this.robotCodeEditor.codeMirror;
    const lines = editor.getValue().split("\n");
    let lineNumber = 0;
    for (let k=0; k<lines.length; k++) {
      const line = lines[k].trim();
      if (line.indexOf("TODO") >= 0) continue;
      if (line.indexOf("//") == 0) continue;
      if (line.indexOf("function") >= 0 && line.indexOf(v) >= line.indexOf("function")) {
        lineNumber = k;
        break;
      }

    }
    var t = editor.charCoords({line: lineNumber, ch: 0}, "local").top; 
    var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
    //editor.scrollTo(null, t - middleHeight - 5); 
    editor.scrollTo(null, t - 5); 
    this.setState({ selectedFunction: v });
  }

  render() {
    const { showModal, activeTab, oldSetupCode, showConfirmOverwriteRelease, showConfirmLoadRelease, showOKMessage, showDeleteConfirmMessage  } = this.state;
    const { scenario, RobotCode, UserSetupCode, isProfessionalUser, ReleaseLabels } = this.props;

    if (!scenario) return (
      <div />
    );

    const code = this.reconstructCode(RobotCode);
    if (window.robotCodeEditor && getUID() != "") {
      // console.log("\n\n-- get value is \n\n" + window.robotCodeEditor.codeMirror.getValue());
      // if (window.robotCodeEditor.codeMirror.getValue() == "loading ..." || window.robotCodeEditor.codeMirror.getValue().trim() == "") {
        // console.log("\n!!do set value for teacher!!");
        window.robotCodeEditor.codeMirror.setValue(code);
      // }
    }
    this.state.oldCode = code;

    if (UserSetupCode && window.testCodeEditor && getUID() != "") {
      const latestTime = UserSetupCode.CodeUpdates[UserSetupCode.CodeUpdates.length - 1].time;
      const code2 = this.reconstructCode(UserSetupCode, latestTime);
      // console.log("already have UserSetupCode so reconstruct!! " + code2);
      // debugger;
      if (code2 != this.state.oldSetupCode) {
        this.setState({ oldSetupCode: code2 });
        window.testCodeEditor.codeMirror.setValue(code2);
      }
    }


    const dropdownDiv = document.getElementById('dropdownDIV');
    let label = "";
    if (dropdownDiv) {
      const labelField = dropdownDiv.getElementsByTagName('input')[0];
      label = labelField.value;
    }

    const loadButton = document.getElementById('loadButton'); 
    const deleteButton = document.getElementById('deleteButton'); 

    const labelNotEmpty = (this.state.releaseNameValue.trim() != "");
    const existingRelease = ReleaseLabels.includes(this.state.releaseNameValue.trim());

    const releaseButton = document.getElementById('releaseButton'); 
    // if (releaseButton) {
      // setTimeout(() => {
      //   releaseButton.innerText = "Release";
      //   loadButton.innerText = "Load";
      //   deleteButton.innerText = "Delete";
      // }, 2000);
    // }

    /*
    const request = new XMLHttpRequest();
    request.open("GET", "/js/ecmascript.json", false);
    request.send(null);
    const ternServer = getTernServer({ defs: [JSON.parse(request.responseText)] });
    //this.robotCodeEditor.codeMirror.on("cursorActivity", (cm) => { server.updateArgHints(cm); });
    */

    const options = {
      mode: 'javascript',
      lineNumbers: true,
      tabSize: 2,
      theme: 'blackboard',
      foldGutter: {
        // widget: "\u2194",
        // minFoldSize: 0,
        // scanUp: false,
        // clearOnEnter: true
      },
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
      matchBrackets: true,
      autoCloseBrackets: false,
      // extraKeys: { "Ctrl-Space": "autocomplete" },
      //lint: { onUpdateLinting: this.lintUpdate.bind(this) }
      lint: {
        // onUpdateLinting: this.lintUpdate.bind(this),
        // options: {  // http://jshint.com/docs/options/
        //   "esversion": 6,
        //   "undef": true,
        //   "globals": {
        //     "Balls": true, "BallDiameter": true, "TableHeight": true, "TableWidth": true,
        //     "Pockets": true, "Rails": true, "Cushions": true, "CushionWidth": true, "PlayerInfo": true,
        //     "getAimPosition": true, "getRandomNumber": true, 'getSecondsLeft': true, "extrapolatePoints":true, "calculateProbability": true, "console": true, 
        //     "MyID": true, "Pool": true, "OpponentColorType": true, "MyColorType": true,
        //     "world": true, "isPathBlocked": true, "getCutAngle": true, "getAngleToSidePocket": true,
        //     "calculateEndState": true, 
        //     'calculateEndState2': true,
        //     'calculateProbability2': true,
        //     'calculateProbability': true,
        //     "getDistance": true, "Victor": true, "getFirstBallTouched": true,
        //     "Boundaries": true, "dist2": true, "getShortestPath": true,
        //   }
        //   // "esnext": true
        // }
      },
      extraKeys:{/*
        "Ctrl-Space": (cm) => { ternServer.complete(cm); },
        "Ctrl-I": (cm) => { ternServer.showType(cm); },
        "Ctrl-O": (cm) => { ternServer.showDocs(cm); },
        "Alt-.": (cm) => { ternServer.jumpToDef(cm); },
        "Alt-,": (cm) => { ternServer.jumpBack(cm); },
        "Ctrl-Q": (cm) => { ternServer.rename(cm); },
        "Ctrl-.": (cm) => { ternServer.selectName(cm); }*/
      }
    };


    // const isProfessionalUser = true; // TODO: to get from user account info
    const options2 = {
      mode: 'javascript',
      lineNumbers: true,
      tabSize: 2,
      foldGutter: {
        // widget: "\u2194",
        // minFoldSize: 0,
        // scanUp: false,
        // clearOnEnter: true
      },
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
      matchBrackets: true,
      autoCloseBrackets: false,
      lint: {
        // onUpdateLinting: this.lintUpdateTestScript.bind(this),
        options: {  // http://jshint.com/docs/options/
          "esversion": 6,
          "undef": true,
          "globals": {
            "Balls": true, 'PlaceCueBallFromHand': true, "Victor": true, "waitSeconds": true, "getCutAngle":true, "calculateCutAngle":true, "BallDiameter": true, "TableHeight": true, "TableWidth": true,
            "Pockets": true, "Rails": true, "Cushions": true, "CushionWidth": true, "PlayerInfo": true,
            "getSecondsLeft": true, "getAimPosition": true, "getNewCommand": true, "getRandomNumber": true, "extrapolatePoints": true, "calculateProbability": true, "console": true, 
            "MyID": true, "CandidateBallList": true, "Pool": true, "OpponentColorType": true, "MyColorType": true, "world": true, "isPathBlocked": true,
            "getAngleToSidePocket": true,
            "ResetTable": true,
            "PlaceBallOnTable": true,
            "TakeCallShot": true,
            "print": true,
            "clearLog": true,
            "TakeBreakShot": true,
            "SetSecondsLeft": true,
            "WaitForAllBallStop": true,
            "ReportEndOfTest": true,
            "WaitForAllShellsToExplode": true,
            "PlaceTile": true,
            "PlaceTank": true,
            "sendCommandToWhiteTank": true,
            SendCommandToTank: true,
            "SetupTickUpdates": true,
            "RemoveAllTanks": true,
            RemoveAllSprites: true,
            "CalculateCommand": true,
            "ChooseRedColor": true,
            "ChooseBlackColor": true,
            "ChooseYellowColor": true,
            "calculateShotCommand": true,
            "UpdateWorld": true,
            "SubmitTestOutputData": true,
            "PlotData": true,
            "calculateEndState": true,
            SubmitData: true,
            LoadData: true,
            TrainLinearModel: true,
            dist2: true,
            "ClearMaze": true,
            getShortestPath: true, getShortestPathCmd: true, getShortestPathLength: true,
            "Tanks": true, "Weapons": true, "Crystals": true, "Maze": true, MyTanks: true, MyTank: true,
            students: true,
            numbers: true,
            numbers2: true,
            numbers2D: true,
            sorted2D: true,
            toeplitz1: true,
            toeplitz2: true,
            toeplitz3: true,
            sorted2D2: true,
            array1: true,
            array2: true,
            createNewGraph: true,
            PlaceCrystal: true,
            PlaceWeapon: true,
            SetTankProperties: true,
            SetExpectedResult: true,
            isShellBlocked: true,
            isInMyRange: true,
            "MAX_POWER": true,
            upgradeSpecialPowers: true,
            "SPECIAL_WEAPON_TYPES": true,
            sendMessageToTeam: true,
            sendTeamMessage: true,
            setInterval: true,
            clearInterval: true,
            StartEndGameMode: true,
            getNextEndGameRockPos: true,
            getNextRockPositions: true,
            getTimeLeftInSeconds: true,
          }
          // "esnext": true
        }
      },
      theme: 'blackboard',
      readOnly: !isProfessionalUser
    };
    // const code = this.state.oldCode;
    // if (RobotCode) {
    //   const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
    //   code = this.reconstructCode(RobotCode, latestTime);
    // }
    // console.log("in render codemirror.jsx");
    const tabs = [
      {
        id: 1,
        name: 'Robot Code'
      },
      {
        id: 2,
        name: 'Test Script'
      }
    ];

    const releaseButtonVisible = !scenario.hideReleaseButton && getUID() == "";
    // const searchNames = ['Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Perth', 'Hobart'];

    // console.log("* * * oldSetupCode is " + oldSetupCode);
    if (oldSetupCode == "") {
      // debugger;
    }

    const hintHandler = (cm, event) => {
      const allLines = cm.getValue().split("\n");
      const line = allLines[cm.getCursor().line];
      if (scenario.applyBaselineCode && line.endsWith("////READONLY")) {
        return;
      }

      // console.log("event.keyCode " + event.keyCode);
      // console.log("event.shiftKey " + event.shiftKey);
  
      if (!cm.state.completionActive && /* Enables keyboard navigation in autocomplete list */
        !event.ctrlKey && !event.altKey 
        // && !event.shiftKey 
        && !event.metaKey &&
        !cm.inCtrl && !cm.inAlt 
        // && !cm.inShift 
        && (event.keyCode === 190 || (event.keyCode >= 65 && event.keyCode <= 90))
        ) {
          /* Enter - do not open autocomplete list just after item has been selected in it */
          // && event.keyCode != 13 && event.keyCode != 27
  
          // console.log("inside");

        const allwords = cm.getValue().replace(/\W/g, ' ').replace(/\s+/g, ' ').trim().split(" ");
        let longwords = [];
        if (event.keyCode !== 190) {
          longwords = allwords.filter(word => word.length > 1 && isNaN(word));
          longwords = longwords.concat(["for-loop-col", "for-loop-row", "this", "MyInfo", "GameInfo", "update", "sendCommand"]);
          longwords = longwords.concat(globalKeys).concat(functionNames);
          if (window.testCodeEditor && cm === window.testCodeEditor.codeMirror) {
            longwords = longwords.concat(testFunctions);
          }
        } else { // "." dot is the letter
          const A1 = cm.getCursor().line;
          const A2 = cm.getCursor().ch - 2;
  
          const B1 = cm.findWordAt({ line: A1, ch: A2 }).anchor.ch;
          const B2 = cm.findWordAt({ line: A1, ch: A2 }).head.ch;
  
          const word = cm.getRange({ line: A1, ch: B1 }, { line: A1, ch: B2 });
          if (word === "MyInfo") {
            longwords = longwords.concat(["x", "z", "angle", "hasCapturedBall", "myBallColor", "mySpeed", "mySteering", "myCarColor", "opponentBallColor", "opponentCarColor"]);
          } else if (word === "world") {
            longwords = longwords.concat(worldKeys);
          } else if (word === 'Math') {
            longwords = longwords.concat(MathKeys);
          } else if (word === 'console') {
            longwords = longwords.concat(consoleKeys);
          } else if (arrayNames.includes(word)) {
            longwords = longwords.concat('length');
          }
        }
        // console.log("show hints on keydown " + event.keyCode + " " + JSON.stringify(longwords));
        cm.showHint({ useGlobalScope: false, completeSingle: false, extraWords: longwords.sort() });
        //cm.showHint({ useGlobalScope: false, completeSingle: false });
      }
    };
    let hintHandlerInit1 = false;
    let hintHandlerInit2 = false;

    // console.log("this.state.selectedFunction " + this.state.selectedFunction);
    let that = this;
    return (
      <div id="aicode" className="buildmyAI__AIcode">

        <div className="buildmyAI__AIcode__Tabs">
          {
            _.map(tabs, (tab, index) =>
            (
              <span
                role="button"
                tabIndex={0}
                key={index}
                onClick={() => { this.changeTab(tab.id); }}
                className={`${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.name}
              </span>
            ))
          }
          <div className="buildmyAI__AIcode__Tabs__Action alignButtonDiv" style={{paddingTop: "0px"}}>
            {/* <button className={"btn leftrightmargin20 " + (releaseButtonVisible?"alignButton":"")} onClick={() => { this.handlePlaygame(); }} > Test </button> */}
            {
              releaseButtonVisible ? 
                <div className="labelDropdown" id="dropdownDIV" >
                  <DropdownList className="labelDropdown" placeHolder="go to" data={functionList} defaultValue={this.state.selectedFunction} textField="gotoFunctionName" value={this.state.selectedFunction} onChange={this.funcChange.bind(this)}   />
                  <Combobox className="leftrightmargin5 labelDropdown" placeHolder="release name" data={ReleaseLabels} defaultValue={''} textField="labelName" value={this.state.releaseNameValue} onChange={value => this.setState({ releaseNameValue: value })}   />
                  <button disabled={!labelNotEmpty} id={'releaseButton'} className={`btn leftrightmargin5 alignButton ${labelNotEmpty?"":"disabledButton"}`} onClick={() => { this.handleReleaseCode(); }} > Save </button>
                  <button disabled={!labelNotEmpty || !existingRelease} id={'loadButton'} className={`btn leftrightmargin55 alignButton ${labelNotEmpty?"":"disabledButton"}`} onClick={() => { this.handleLoadCode(); }} > Load </button>
                  <button disabled={!labelNotEmpty || !existingRelease} id={'deleteButton'} className={`btn leftrightmargin55 alignButton ${labelNotEmpty?"":"disabledButton"}`} onClick={() => { this.handleDeleteRelease(); }} > Delete </button>
                </div>
              : null
            }
          </div>
        </div>
        <div className="buildmyAI__AIcode__CodeMirror">
          {
            activeTab === 1 ?
              <div id="robotcodeeditordiv" className="buildmyAI__AIcode__CodeMirror__groups active">
                <div className="buildmyAI__AIcode__CodeMirror__header">
                  <span>Robot Code</span>
                  <div className="buildmyAI__AIcode__CodeMirror__header__action">

                    <span tabIndex={0} role="button" className="tg-icon-refesh2" />
                  </div>
                </div>
                <CodeMirror
                  value={code}
                  options={options}
                  onChange={(value) => {
                    if ( getUID() == "")
                      this.handleChange(value);
                  }}
                  ref={(ref) => {
                    if (ref != null) {
                      this.robotCodeEditor = ref;
                      window.robotCodeEditor = ref;
                      
                      if (!hintHandlerInit1) {
                        //this.robotCodeEditor.codeMirror.off("keydown", hintHandler); 
                        this.robotCodeEditor.codeMirror._handlers["keydown"] = [];
                        this.robotCodeEditor.codeMirror.on("keydown", hintHandler);  
                        hintHandlerInit1 = true;
                      }
                     
                      if (scenario.applyBaselineCode) {
                        // listen for the beforeChange event, test the changed line number, and cancel
                        ref.codeMirror.on('beforeChange', (cm, change) => {

                          const allLines = this.robotCodeEditor.codeMirror.getValue().split("\n");
                          const line = allLines[cm.getCursor().line];
                          if (scenario.applyBaselineCode && line.endsWith("////READONLY")) {
                            change.cancel();
                          }
                  

                          // if (scenario.readonlyLinenumbers.includes(change.from.line)) {
                          //   change.cancel();
                          // }
                        });

                      }
                      
                    }
                  }}
                />
              </div>
            : null
          }
          {
            activeTab === 2 ?
              <div id="setupcodeeditordiv" className="buildmyAI__AIcode__CodeMirror__groups">
                <div className="buildmyAI__AIcode__CodeMirror__header">
                  <span>Test Code</span>
                  <div className="buildmyAI__AIcode__CodeMirror__header__action">
                    <span tabIndex={0} role="button" className="tg-icon-refesh2" />
                  </div>
                </div>
                <CodeMirror
                  value={oldSetupCode}
                  options={options2}
                  onChange={(value) => {
                    if ( getUID() == "")
                      this.handleChangeSetupCode(value);
                  }}
                  ref={(ref) => { 
                    this.testCode = ref; 
                    // this.testCode.codeMirrorCompo = this;
                    // doesn't work here! usually this is not active tab
                    this.setupCodeEditor = ref;
                    window.testCodeEditor = ref;
                    if (!hintHandlerInit2) {
                      //this.setupCodeEditor.codeMirror.off("keydown", hintHandler);
                      this.setupCodeEditor.codeMirror._handlers["keydown"] = [];
                      this.setupCodeEditor.codeMirror.on("keydown", hintHandler);
                      hintHandlerInit2 = true;
                    }
                  }}
                />
              </div>
            : null
          }

        </div>

        <Modal
          isOpen={showModal}
          contentLabel="Run Game"
          onRequestClose={() => { console.log("in onRequestClose"); this.toggleModal(); }}
          style={{
            overflow: 'hidden',
            overlay: {
              background: 'rgba(19, 19, 19, 0.51)'
            },
            content: {
              background: 'rgba(0, 0, 0, 0)',
              padding: '0px',
              border: 'none'
            }
          }}
        >
          <div className="gamedivshellmodal" id="gameDivShellModal" >
          {/* <button id="exitModalButton" onClick={window.exitTestScreen}>Exit</button> */}
          </div>
        </Modal>


        <Modal
          isOpen={showConfirmOverwriteRelease}
          className="OverwriteReleaseModel"
          contentLabel="Do you want to overwrite the existing code for this release?"
          onRequestClose={() => this.toggleOverwriteReleaseModal()}
        >
          <div>
            <h4 className="MessageHeader2">{overwriteMessage}</h4>
            <button type="button" className="ConfirmExitButton admin-btn modelButton" onClick={this.doOverwrite}>
              Confirm Overwrite
            </button>
            <button type="button" className="ReturnToGameButton admin-btn modelButton" onClick={this.toggleOverwriteReleaseModal}>
              Cancel Release
            </button>
          </div>
        </Modal>


        <Modal
          isOpen={showConfirmLoadRelease}
          className="OverwriteCurrentModel"
          contentLabel="Do you want to overwrite the current code using this release?"
          onRequestClose={() => this.toggleLoadReleaseModal()}
        >
          <div>
            <h4 className="MessageHeader2">{loadMessage}</h4>
            <button type="button" className="ConfirmExitButton admin-btn modelButton" onClick={this.doLoadRelease}>
              Confirm Loading
            </button>
            <button type="button" className="ReturnToGameButton admin-btn modelButton" onClick={this.toggleLoadReleaseModal}>
              Cancel Loading
            </button>
          </div>
        </Modal>
        
        <Modal
          isOpen={showOKMessage}
          className="OverwriteCurrentModel"
          contentLabel="confirm please"
          onRequestClose={() => this.toggleOKMessageModal()}
        >
          <div>
            <h4 className="MessageHeader2">{okMessage}</h4>
            <button type="button" className="OKButton admin-btn modelButton" onClick={this.toggleOKMessageModal}>
              OK
            </button>
          </div>
        </Modal>
        
        <Modal
          isOpen={showDeleteConfirmMessage}
          className="OverwriteCurrentModel"
          contentLabel="confirm please"
          onRequestClose={() => this.toggleDeleteConfirmModal()}
        >
          <div>
          <h4 className="MessageHeader2">{deleteMessage}</h4>
          <button type="button" className="ConfirmExitButton admin-btn modelButton" onClick={this.doDeleteRelease}>
            Confirm Deletion
          </button>
          <button type="button" className="ReturnToGameButton admin-btn modelButton" onClick={this.toggleDeleteConfirmModal}>
            Cancel Deletion
          </button>
        </div>
      </Modal>

        {/* <button onClick={this.closeModal}>close</button> */}

        <div className="gamedivshellhidden" id="gameDivShellHidden">
          <div className="buildmyAI__AIcode__runCode" id="gameDiv" />
        </div>

        <div id="hintBox" className="codingroundbox" style={{position: "absolute", left: "100px", top: "100px", width: "400px", border: "solid 3px darkturquoise", zIndex: 100, display: "none"}}>              
            <div id="hintHeader" className="gridheaderleft codingroundbox-top" style={{color: "white", background: "rgb(211,27,23)", fontSize: "20px", fontWeight: "bold", color: "white", padding: "9px 25px"}}>Syntax Error</div>
            {/* <div id="hintContent" className="boxcontenttext codingroundbox-bottom" style={{background: "rgb(33, 47, 90)", lineHeight: "20px", fontSize: "16px", color: "white", padding: "12px 20px"}}> */}
            <div id="hintContent" className="boxcontenttext codingroundbox-bottom" style={{background: "rgb(218, 229, 243)", lineHeight: "20px", fontSize: "16px", color: "black", padding: "12px 20px"}}>            
                Did you forget to add a closing bracket at end of this line?
            </div>
        </div>

      </div>
    );
  }
}
export default CodeMirrorComponent;
