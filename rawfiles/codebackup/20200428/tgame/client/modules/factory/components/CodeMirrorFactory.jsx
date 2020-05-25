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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Bert } from 'meteor/themeteorchef:bert';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
// import Pool from '../../games/gamePool/lib/localpool8ball2dworld.js';
// import Pool from '../../games/gamePool/lib/luckypoolgame.js';
import gameModal from '../../games/gamePool/components/gamemodal.js';
//import '../../../../node_modules/codemirror/theme/blackboard.css';
import '../../../../node_modules/codemirror/theme/neat.css';
import '../../../../node_modules/codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import '../../../../node_modules/codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/brace-fold';
import { GAME_TYPE, GAME_CONFIG_OPTION, BUTTON } from '../../../../lib/enum';
// import PoolActions from '../../../packages/gamemaster/lib/modules/gamePool/actions/luckypoolgameactions.js';
// import { BUTTON } from '../../../../lib/enum';
import { TUTORIAL_STATEMENT } from '../../../../lib/const';

import { UserRobotCodeByLesson, UserTest, UserFactoryCode } from '../../../../lib/collections';

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
//import getRichErrorMessages, { moreErrorChecks, moreErrorCheckAST, checkArrayAccess, checkFunctionCall, checkBracketErrors, checkMissingAsync, checkParenthesis, checkMisspellErrors, checkKnownTypeErrors, checkForLoopErrors } from '../../lessonpage/components/imports/eslintcodeErrorCheck';


let functionList = [];



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


let robotCodeSaveInd = 0;
let robotCodeSaveSlideId = "";
let localRobotCode = "";
let testScriptSaveInd = 0;
let testScriptSaveSlideId = "";
let localTestScript = "";

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
  ecmaFeatures: {},
  parserOptions: {
    ecmaVersion: 2017
  },
  extends: "eslint:recommended",
  env: {
    es6: true,
    browser: true,
    node: false,
    amd: false,
    mocha: false,
    jasmine: false
  },
  globals: {
    console: true,
    Balls: true,
    BallDiameter: true,
    TableHeight: true,
    TableWidth: true,
    Pockets: true,
    Rails: true,
    Cushions: true,
    CushionWidth: true,
    PlayerInfo: true,
    getAimPosition: true, getNewCommand: true, sendTankOrder: true, MoveRight: true, getRandomNumber: true, getRandomCommand: true, getSecondsLeft: true, extrapolatePoints:true, 
    CandidateBallList: true,
    MyID: true, Pool: true, OpponentColorType: true, MyColorType: true,
    world: true, isPathBlocked: true, getCutAngle: true, calculateCutAngle: true, calculateSidePocketSkew: true, getAngleToSidePocket: true,
    calculateEndState: true,
    calculateCTP: true,
    calculateEndState2: true,
    calculateProbability: true, console: true,
    calculateProbability2: true,
    getDistance: true, Victor: true, getFirstBallTouched: true,
    Boundaries: true, TOP_Y: true, BOTTOM_Y: true, LEFT_X: true, RIGHT_X: true,  dist2: true,
    PlaceCueBallFromHand: true, waitSeconds: true, 
    ResetTable: true,
    PlaceBallOnTable: true,
    TakeCallShot: true,
    print: true,
    clearLog: true,
    TakeBreakShot: true,
    SetSecondsLeft: true,
    WaitForAllBallStop: true,
    ReportEndOfTest: true,
    ExpectBallPocketed: true,
    ExpectShotCommand: true,
    WaitForAllShellsToExplode: true,
    PlaceTile: true,
    PlaceTank: true,
    CallRun: true,
    ClearOutput: true,
    DrawCircle: true,
    printText: true,
    "sendCommandToWhiteTank": true,
    SendCommandToTank: true,
    SetupTickUpdates: true,
    ExpectNumberOfWhiteTanksKilled: true,
    RemoveAllTanks: true,
    RemoveAllSprites: true,
    CalculateCommand: true,
    ChooseRedColor: true,
    ChooseBlackColor: true,
    ChooseYellowColor: true,
    calculateShotCommand: true,
    UpdateWorld: true,
    SubmitTestOutputData: true,
    PlotData: true,
    SubmitData: true,
    LoadData: true,
    TrainLinearModel: true,
    ClearMaze: true,
    getShortestPath: true,
    getShortestPathCmd: true,
    getShortestPathLength: true,
    Tanks: true,
    Weapons: true,
    Crystals: true,
    Maze: true,
    MyTanks: true,
    MyTank: true,
    students: true,
    numbers: true,
    numbers2: true,
    numbers2D: true,
    sorted2D: true,
    toeplitz1: true,
    sorted2D2: true,
    toeplitz2: true,
    toeplitz3: true,
    array1: true,
    array2: true,
    createNewGraph: true,
    PlaceCrystal: true,
    PlaceWeapon: true,
    SetTankProperties: true,
    SetExpectedResult: true,
    isShellBlocked: true,
    isInMyRange: true,
    MAX_POWER: true,
    upgradeSpecialPowers: true,
    SPECIAL_WEAPON_TYPES: true,
    sendMessageToTeam: true,
    sendTeamMessage: true,
    setInterval: true,
    clearInterval: true,
    getNovaRange: true,
    get4WayRange: true,
    get3SplitterRange: true,
    getWeaponRange: true,
    StartEndGameMode: true,
    getTimeLeftInSeconds: true,
    getNextEndGameRockPos: true,
    getNextRockPositions: true,
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
      "no-constant-condition": 0,
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
      "no-loop-func": 0,
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
      "camelcase": 0,
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

    // console.log("run linter");
    
    // check if it is test code or robot code
    let editor = window.testCodeEditor;
    if (text.indexOf('ReportEndOfTest') < 0 && text.indexOf('ResetTable') < 0 && text.indexOf('PlaceBallOnTable') < 0) {
      editor = window.robotCodeEditor;
    }

    
    if (!editor) {
      console.log("can't detect editor ");
      return [];
    }

    let code = editor.codeMirror.getValue();
    if (editor == window.robotCodeEditor) {
      const bracketErrors = checkBracketErrors(code);
      if (bracketErrors.length > 0) {
        return bracketErrors;
      }

      const asyncErrors = checkMissingAsync(code);
      if (asyncErrors.length > 0) {
        return asyncErrors;
      }


      const parenErrors = checkParenthesis(code);
      if (parenErrors.length > 0) {
        return parenErrors;
      }

      // const misspellErrors = checkMisspellErrors(answerCode, code);
      // if (mi sspellErrors.length > 0) {
      //   return misspellErrors;
      // }

      const arrayErrors = checkArrayAccess(code);
      if (arrayErrors.length > 0) {
        return arrayErrors;
      }

      const funcErrors = checkFunctionCall(code);
      if (funcErrors.length > 0) {
        return funcErrors;
      }
      
      const typeErrors = checkKnownTypeErrors( code);
      if (typeErrors.length > 0) {
        return typeErrors;
      }

      
    } else {
      code = "async function testRun() { " + code + " } ";
    }

    //var linter = new window.eslint();
    if (!linter) {
      linter = new window.eslint();
    }
    const eserrors = linter.verify(code, esconfig);

    // reduce line number?
    // for (let k=0; k<eserrors.length; k++) {
    //   eserrors[k].line --;
    //   eserrors[k].column --;
    //   if (eserrors[k].endLine) eserrors[k].endLine --;
    //   if (eserrors[k].endColumn) eserrors[k].endColumn --;
    // }



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

      const forloopErrors = checkForLoopErrors(code);
      if (forloopErrors.length > 0) {
        return forloopErrors;
      } else {
        return [];
      }
    }
    
    if (eserrors && eserrors.length > 0) {
      parseErrors(eserrors, esresult, editor);
    }

    if (esresult.length > 0) {
      // console.log("done with linter 2");
      return esresult;
    }

    // more error checks using known correct answer
    if (window.slide && editor) {
      const code = editor.codeMirror.getValue();
      const moreErrs = moreErrorChecks(code);
      if (moreErrs) moreErrs.forEach((r) => { esresult.push(r); });

      // const moreErrs2 = moreErrorCheckAST(code);
      // if (moreErrs2) moreErrs2.forEach((r) => { esresult.push(r); });
    }
    // console.log("done with linter 3");
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
    if (window.slide && editor && window.codeMirrorComponent) {
      const code = editor.codeMirror.getValue();
      let answerCode = "";
      if (editor == window.robotCodeEditor ) {
        answerCode = window.codeMirrorComponent.getRobotCodeAnswer();
        // answerCode = window.slide.ANSWERCODE ? window.slide.ANSWERCODE : "";
      } else {
        //answerCode = window.slide.TESTSCRIPTANSWER ? window.slide.TESTSCRIPTANSWER : "";
        answerCode = window.codeMirrorComponent.getTestScriptAnswer();
      }
  
      
      const results = getRichErrorMessages(answerCode, hints, code);

      if (results) {
        output.splice(0,output.length);
        results.forEach((r) => { output.push(r); });
      }
    } else {
      //hints.forEach((h) => { output.push(h); });
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
  "Pockets", "Rails", "Cushions", "CushionWidth", "PlayerInfo", "getTimeLeftInSeconds",
  "getAimPosition", "getNewCommand", "sendTankOrder", "MoveRight", "getRandomNumber", "getRandomCommand", "getSecondsLeft", "calculateProbability", "console",
  "MyID", "Pool", "OpponentColorType", "MyColorType", 'getNovaRange', 'get4WayRange' ,'get3SplitterRange', 'getWeaponRange',
  "world", "isPathBlocked", "getCutAngle", "calculateCutAngle", "calculateSidePocketSkew", "getAngleToSidePocket",
  "calculateEndState", "calculateCTP", 'calculateEndState2', 'calculateProbability2', "getDistance", "Victor", "getFirstBallTouched",
  "Boundaries", "TOP_Y", "BOTTOM_Y", "LEFT_X", "RIGHT_X", 'extrapolatePoints', "CandidateBallList", 'async', 'await',  "SPECIAL_WEAPON_TYPES.FREEZER", "SPECIAL_WEAPON_TYPES.MISSILE", "SPECIAL_WEAPON_TYPES.SPLITTER3", "SPECIAL_WEAPON_TYPES.WAY4", "SPECIAL_WEAPON_TYPES.MATRIX", "SPECIAL_WEAPON_TYPES.LASER_GUN"
];
const functionNames = [
  'getNovaRange', 'get4WayRange' ,'get3SplitterRange', "getTimeLeftInSeconds", 'getWeaponRange',
  'getAimPosition', 'getNewCommand', 'sendTankOrder', "MoveRight", 'getRandomNumber', "getRandomCommand", 'getCallShot', 'getBreakShot', 'getSecondsLeft', 'getCueBallPlacement', 'isPathBlocked', 'getAngleToSidePocket',
  'getCutAngle', 'calculateCutAngle', 'calculateSidePocketSkew', 'calculateEndState', 'calculateCTP',  'calculateEndState2', 'calculateProbability2', 'calculateProbability', 'Math', 'console', 'extrapolatePoints'
];
const testFunctions = [
  'ResetTable', 'PlaceBallOnTable', 'ChooseRedColor', 'ChooseBlackColor', 'StartEndGameMode', 'SetExpectedResult', 'SendCommandToTank',
  'ChooseYellowColor', 'TakeCallShot', "print", "clearLog", 'TakeBreakShot', "SetTankProperties", "SetSecondsLeft", 'PlaceCueBallFromHand', 'WaitForAllBallStop', 'UpdateWorld', 'RemoveAllSprites',
  'ReportEndOfTest','ExpectBallPocketed', "ExpectShotCommand", "ClearMaze", "CalculateCommand", "WaitForAllShellsToExplode", "PlaceTank", "PlaceCrystal", "PlaceWeapon", "sendCommandToWhiteTank", "PlaceTile", "RemoveAllTanks", "SetupTickUpdates", "ExpectNumberOfWhiteTanksKilled"
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
      activeTab: 1,
      waitingToSave: -1,
      difficulty: 0,
      releaseNameValue: '',
      showConfirmOverwriteRelease: false,
      showConfirmLoadRelease: false,
      showOKMessage: false,
      showDeleteConfirmMessage: false,
      selectedFunction: '',
      openFunc: false,
      inResetting: false,
      userCode: "",
      userScript: ""
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
          // console.log("tool tip removed! ");  
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
        hintTop = target.offsetTop + 10000;
        if (hintTop + hintHeight + 200 > docHeight) {
          hintTop = target.offsetTop + 10000 - hintHeight - 100;
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
    }, 50);
  }

  initComponentAndCode() {
    // const { oldCode, oldSetupCode } = this.state;
    const { UserSetupCode, RobotCode, scenario,lesson, saveTestingCode, saveRobotCodeReset } = this.props;

    // if (!scenario) return;

    if (!componentInit) {

      localRobotCode = window.robotCodeEditor.codeMirror.getValue();

      // if (typeof(RobotCode)!="undefined" && typeof(scenario)!="undefined") {
      //   window.onresize = (e) => {
      //     this.resizeDiv();
      //   };
      //   const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
      //   const code = this.reconstructCode(RobotCode, latestTime);

      //   if (code !== this.robotCodeEditor.codeMirror.getValue()) {
      //     const oldpos = this.robotCodeEditor.codeMirror.getCursor();
      //     this.robotCodeEditor.codeMirror.setValue(code);
      //     this.robotCodeEditor.codeMirror.setCursor(oldpos);
      //   }
  
      //   // console.log("setting oldCode to " + code);
      //   let diff = 0;
      //   if (scenario) {
      //     if (scenario.package == "advanced") diff = 1;
      //   }
      //   if (this.state.oldCode != code) {
      //     this.setState({
      //       oldCode: code,
      //     });
      //   }

      //   if (this.state.difficulty != diff) {
      //     this.state.difficulty = diff;
      //   }

      //   this.handleChange(code);

      //   // console.log("componentDidUpdate setup code" + (scenario? scenario.SetupScript:""));
      // }
  
      const that = this;
      window.handleNewRobotCodeChange = (v) => {
        that.handleChange(v);
      };

      this.setState({ activeTab: 1 });

      this.setupWatchOnCodeMirrorHint();

      gameSetup.testSetupCode = that.getTestScript();

      // console.log("componentDidMount 2 setup code" + (scenario? scenario.SetupScript:""));
      componentInit = true;
    } else {

      gameSetup.tableDirty = true;
      gameSetup.testSetupCode = this.getTestScript();
      if (window.gameSetup && window.gameSetup.resetTestTable) {
        window.gameSetup.resetTestTable();        
      }

      if (window.gameSetup &&gameSetup.resetMaze) {
        window.gameSetup.resetMaze();
      }
      // if (window.testCodeEditor && window.testCodeEditor.codeMirror) {
      //   if (gameSetup.testSetupCode != window.testCodeEditor.codeMirror.getValue()) {
      //     window.gameSetup.resetTestTable();        
      //   }
      // }

      // this.robotCodeEditor.codeMirror.setValue("");

      // if code is updated at server then update here
      // if (RobotCode && RobotCode.CodeUpdates) {
      //   const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
      //   const code = this.reconstructCode(RobotCode, latestTime);
  
      //   if (code && code !== '' && code !== this.robotCodeEditor.codeMirror.getValue() && inLoadingProcess) {
      //     const oldpos = this.robotCodeEditor.codeMirror.getCursor();
      //     this.robotCodeEditor.codeMirror.setValue(code);
      //     this.robotCodeEditor.codeMirror.setCursor(oldpos);
      //     inLoadingProcess = false;
      //   }
      // }
    }

    if (0 && !userSetupCodeInit && scenario) {
      
//       if (!UserSetupCode) {
//         // user hasn't specified anything, so just use test script given by scenario
//         // debugger;
//         if (scenario.isUserTest) {
//           scenario.SetupScript = `
// ResetTable(true);
// PlaceBallOnTable(0, -200, -80);
// PlaceBallOnTable(2, -50, -200);
// PlaceBallOnTable(3, -450, -300);
// PlaceBallOnTable(4, 0, 0);
// TakeCallShot();
// await WaitForAllBallStop();
// ReportEndOfTest();
//           `;
//         }
      //   if (getUID() == "") {
      //     // console.log("no UserSetupCode!! so save initial version using standard " + scenario.SetupScript);
      //     const chg = this.getPatch("", scenario.SetupScript);
      //     if (scenario.isUserTest) {
      //       saveTestingCode(lesson.gameId, "usertestcase_" + lesson._id, { time: new Date().getTime(), label: '', chg });
      //     } else {
      //       saveTestingCode(lesson.gameId, lesson._id, { time: new Date().getTime(), label: '', chg });
      //     }
      //     this.setState({
      //       oldSetupCode: scenario.SetupScript,
      //     });
      //   }
        

      // } else {
      //   const latestTime = UserSetupCode.CodeUpdates[UserSetupCode.CodeUpdates.length - 1].time;
      //   const code2 = this.reconstructCode(UserSetupCode, latestTime);
      //   // console.log("already have UserSetupCode so reconstruct!! " + code2);
      //   // debugger;
      //   if (code2 != this.state.oldSetupCode) {
      //     this.setState({ oldSetupCode: code2 });
      //   }
      // }



      userSetupCodeInit = true;
    }    

  }


  componentDidMount() {
    // const { oldCode, oldSetupCode } = this.state;
    const { UserSetupCode, RobotCode, scenario,lesson, saveTestingCode, saveRobotCodeReset } = this.props;
    const that = this;
    window.codeMirrorComponent = this;

    if (window.robotCodeEditor) {
      window.robotCodeEditor.codeMirror.refresh();
    }
    if (window.testCodeEditor) {
      window.testCodeEditor.codeMirror.refresh();
    }


    window.handlePlaygame = this.handlePlaygame.bind(this);
    window.handleStopTest = this.handleStopTest.bind(this);
    window.beautifyCode = this.beautifyCode.bind(this);
    window.getTestScript = this.getTestScript.bind(this);
        // console.log("in component componentDidUpdte " + UserSetupCode + " " + componentInit);

    window.submitTestResultInChat = (msg) => { 
      that.submitTestResult(msg); 
    };

    this.initComponentAndCode();
    this.updateFunctionList();
    if (functionList.length > 0)
      this.setState({selectedFunction: functionList[0]});

    // setup timer to trigger first code mirror lint
    setTimeout(() => {
      // console.log("set option lint");
      if (window.robotCodeEditor) {
        window.robotCodeEditor.codeMirror.setOption("lint", {});
      }
      if (window.testCodeEditor) {
        window.testCodeEditor.codeMirror.setOption("lint", {});
      }


  
    },4000);


    
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextProps.userLesson.currentSlideId != this.props.slide.ID) return true;
  //   if (!_.isEqual(this.state, nextState)) return true;
  //   return false;
  //   //return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  // }

  updateFunctionList() {
    if (!this.robotCodeEditor) return;
    if (!this.robotCodeEditor.codeMirror) return;
    const robotCode = this.robotCodeEditor.codeMirror.getValue();
    const userBlocks = getCodeBlocks(robotCode);
    functionList = Object.keys(userBlocks);
  }

  componentDidUpdate(prevProps, prevState) {
    // const { oldCode, oldSetupCode } = this.state;

    // const { oldCode, oldSetupCode } = this.state;
    const { UserSetupCode, RobotCode, scenario,lesson, saveTestingCode } = this.props;

    // console.log("codemirror did update: " + scenario);
    
    // this.initComponentAndCode();
    this.updateFunctionList();

    // const flist = $("#rw_1_input > div.rw-widget-input.rw-widget-picker.rw-widget-container");
    // flist.prop("width", "18px !important");
    // flist.prop("background-size", "cover");
    // flist.prop("background-image", "18px !important");
    // flist.prop("border", "none");

  //  : url("/images/funcButton.jpg");

    // this.forceUpdate();

  }

  componentWillMount() {
    const { gameId, Collections } = this.props;
    // console.log("cm will mount");
    userSetupCodeInit = false;
    //$.getScript('http://eslint.org/js/app/eslint.js', () => {
    $.getScript('/js/eslint.js', () => {
      // console.log("load linter");
      //import './imports/my-javascript-eslint.js';
      const CM = require("codemirror");
      mod(CM);
    });

    this.state.userCode = UserFactoryCode.findOne({gameId}).code;
    this.state.userScript = UserTest.findOne({gameId, testSeq: UserFactoryCode.findOne({gameId}).currentFactoryTestSeq || 0 }).script;

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

  componentWillUpdate() {
    const { gameId } = this.props;
    // if (window.robotCodeEditor && window.robotCodeEditor.codeMirror)
    //   this.handleChange(window.robotCodeEditor.codeMirror.getValue());
    
    // if (window.testCodeEditor && window.testCodeEditor.codeMirror)
    //   this.handleChangeSetupCode(window.testCodeEditor.codeMirror.getValue());
    const newcode = UserFactoryCode.findOne({gameId}).code;
    if (newcode != this.state.userCode)
      this.state.userCode = newcode;

    const newscript = UserTest.findOne({gameId, testSeq: UserFactoryCode.findOne({gameId}).currentFactoryTestSeq || 0 }).script;
    if (newscript != this.state.userScript) {
      this.state.userScript = newscript;
      gameSetup.testSetupCode = newscript;
      if (gameSetup.resetMaze) gameSetup.resetMaze();
      gameSetup.tableDirty = true;
      if (gameSetup.resetTestTable) {
        gameSetup.resetTestTable();
      }
      if (gameSetup.resetMaze) {
        gameSetup.resetMaze();
      }
    }

  }

  componentWillUnmount() {
    // console.log("cm will unmount");
    componentInit = false;

    if (window.robotCodeEditor && window.robotCodeEditor.codeMirror)
      this.handleChange(window.robotCodeEditor.codeMirror.getValue());
    
    if (window.testCodeEditor && window.testCodeEditor.codeMirror)
      this.handleChangeSetupCode(window.testCodeEditor.codeMirror.getValue());

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

  submitTestResult(result) {
    if (!result) return;

    if (result.toLowerCase().indexOf("test passed") >= 0) {
      gameSetup.config.showHeadline("Exercise completed!", 3, 0x00FF00);
    } else {
      gameSetup.config.showHeadline(result, 4, 0xFFFF00);
    }

    if (window.currentUserTestSeq >= 0) {
      let res = "FAIL";
      if (result.toLowerCase().indexOf("test passed") >= 0) {
        res = "PASS";
      }
      Meteor.call('recordUserTestResult', window.currentUserTestGameId, window.currentUserTestSeq, res, (err) => {
        if (err && err.reason) {
          this.setState({ isLoading: false, error: err.reason });
        }
      });
      delete window.currentUserTestSeq;
      delete window.currentUserTestGameId;
    }

  }

  handleChange(value) {
    const { gameId } = this.props;
    // const oldValue = this.state.oldCode;

    // const lintErrors = this.getLintErrors();
    // const firstError = lintErrors.length > 0 ? `${lintErrors[0].from.line}:${lintErrors[0].message}` : '';

    

    // console.log('in handle change');
    clearTimeout(this.state.waitingToSave);

    const that = this;
    const thevalue = value;
    that.state.userCode = value;


    this.state.waitingToSave = setTimeout(() => {

      // robotCodeSaveInd ++;
      // robotCodeSaveSlideId = that.props.userLesson.currentSlideId;
      // console.log("saving robot code 2: " + robotCodeSaveInd);
      that.updateFunctionList();
      Meteor.call("saveUserCodeForFactory", gameId, thevalue);

      // const prevCode = UserRobotCodeByLesson.findOne({
      //   gameId: lesson.gameId, UserID: getUID() == ""? Meteor.userId() : getUID(),
      //   ScenarioID: lesson._id
      // });
      // let chg = null;
      // if (!prevCode) {
      //   chg = that.getPatch("", value);
      // } else {
      //   chg = that.getPatch(oldValue, value);
      // }
       
      // that.setState({
      //   oldCode: value
      // });
      // // Should be check after 1000s all param have value
      // if (lesson.gameId && chg && window.chatId && getUID() == "") {
      //   saveRobotCode(lesson.gameId, { time: new Date().getTime(), label: '', chg }, window.chatId, firstError, lesson._id);
      //   window.CodeChangeCount ++;
      // }
    }, 1000);
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
    const { gameId, deleteAICodeRelease } = this.props;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const label = labelField.value;
    const deleteButton = document.getElementById('deleteButton'); 


    const that = this;
    // deleteButton.innerText = "deleting ...";
    deleteAICodeRelease(gameId, label, 'Standard', (err) => {
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
        
        window.setTimeout(() => {
          Bert.alert({
            title: 'Success',
            message: `Release ${label} successfully deleted.`,
            type: 'success',
            style: 'growl-bottom-right',
            icon: 'fa-check'
          });      
          that.forceUpdate();
        }, 1000);

      }
      
      Meteor.subscribe('UserAICodeProdLabels', gameId, 'Standard', getUID());
      this.setState({ showDeleteConfirmMessage: false });
    });
  }


  doLoadRelease = function() {
    const { gameId, loadAICodeRelease } = this.props;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const label = labelField.value;
    const loadButton = document.getElementById('loadButton'); 
    const codesave = this.state.userCode;

    inLoadingProcess = true;
    // this.state.oldCode = "loading ...";
    // window.robotCodeEditor.codeMirror.setValue(this.state.oldCode);

    const that = this;
    // loadButton.innerText = "loading ...";
    loadAICodeRelease(codesave, gameId, label, 'Standard', "factorytest_" + (UserFactoryCode.findOne({gameId}).currentFactoryTestSeq || 0), (err) => {
      if (err) {
        // Bert.alert(`Release ${label} can't be loaded: ${err}.`, 'error', 'growl-bottom-right');  
        Bert.alert({
          title: 'Error',
          message: `Release ${label} can't be loaded: ${err}.`,
          type: 'codeInValidError',
          style: 'growl-bottom-right',
          icon: 'fa-warning'
        });    
        //that.state.oldCode = codesave;            
      } else {
        // Bert.alert(`Release ${label} successfully loaded.`, 'success', 'growl-bottom-right');
        window.setTimeout(() => {
          Bert.alert({
            title: 'Success',
            message: `Release ${label} successfully loaded.`,
            type: 'success',
            style: 'growl-bottom-right',
            icon: 'fa-check'
          });                
          that.forceUpdate();
        }, 1000);
      }
      
      // seems duplicate?
      //Meteor.subscribe('UserRobotCode', lesson.gameId, 'Standard');
      // Meteor.subscribe('UserRobotCodeByLesson', lesson.gameId, 'Standard');
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
    const { gameId, releaseAICode } = this.props;
    const code = this.state.userCode;
    const labelField = document.getElementById('dropdownDIV').getElementsByTagName('input')[1];
    const releaseButton = document.getElementById('releaseButton'); 
    const label = labelField.value;
    // const that = this;
    releaseAICode(code, gameId, label, 'Standard', (err) => {
      if (err) {
        Bert.alert(`Release ${label} can't be saved: ${err}.`, 'error', 'growl-bottom-right');  
      } else {
        Bert.alert(`Release ${label} successfully uploaded.`, 'success', 'growl-bottom-right');
      }

      // labelField.value = '';
      // debugger;
      // releaseButton.innerText = "saving ...";
      // hack to work around autorun not being called issue!

      
      Meteor.subscribe('UserAICodeProdLabels', gameId, 'Standard', getUID());
      // setTimeout(() => {
      //   that.forceUpdate();
      // }, 1000);
    });
  }

  codeIsValid(code) {
    const { gameId } = this.props;

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
    if (gameId == "z7Zw82CrjYW2ZJWZZ") {
      gameName = "DodgeBall";
    } else if (gameId == "tankwarmdKu94Qi2Y") {
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
    const { scenario, lesson,ReleaseLabels } = this.props;
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
    const { scenario,lesson, releaseAICode } = this.props;
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
    const { gameId, ReleaseLabels, releaseAICode } = this.props;
    const code = this.state.userCode;
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
          this.doRelease(code, gameId, label);
        } 
      });


    } else {
      // release ai code
      this.doRelease(code, gameId, label);
    }
  }

  beautifyCode() {
    const editor = this.state.activeTab === 1 ? this.robotCodeEditor : this.setupCodeEditor;
    const code = editor.codeMirror.getValue();
    const prettier = beautify(code, { indent_size: 2, jslint_happy: true });
    editor.codeMirror.setValue(prettier);
    if (this.state.activeTab === 1) 
      this.handleChange(prettier);
    // else this.handleChangeSetupCode(prettier);
  }

  handleStopTest() {
    window.gameSetup.controller.killAIPlayers();
    window.gameSetup.tableDirty = true;
    gameSetup.inNewTest = false;
    window.gameSetup.config.hideHeadline(true);
    window.toggleTestButton(false);
    if (window.gameSetup && window.gameSetup.resetTestTable) {
      window.gameSetup.resetTestTable();        
    }

    if (window.gameSetup && window.gameSetup.resetMaze) {
      window.gameSetup.resetMaze();        
    }
    
  }

  handlePlaygame() {
    const { lesson, userLesson, slideContent, slide } = this.props;
    if (!window.enableTestButton) {
      // window.submitTestResultInChat(`I haven't given the next test yet. Please type 'next' or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.`);
      // return;
    }
  // window.TestRunCount ++;
    // first test if work syntax is correct!
    const code = window.robotCodeEditor.codeMirror.getValue();// this.state.oldCode;
    // const code = this.robotCodeEditor.codeMirror.getValue();
    if (code.indexOf('function') < 0 && code.indexOf('=> {') < 0  && code.indexOf('=>{') < 0) {
      window.testResult = `Error: your code has not defined any function.`;
      gameSetup.showTestResult();
      //window.submitTestResultInChat('Error: your code has not defined any function.');
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
          window.testResult = `Please fix the error at line ${errorLine+1} first: ${annotation.message}`;
          gameSetup.showTestResult();          
          // window.submitTestResultInChat(`Please fix error at line ${errorLine} first: <span class="hintcontent">${annotation.message}</span>`);
          return;
        }
      }
    }


    try {
      Function('world', 'myID', 'Victor', code);
    } catch (e) {
      let err = e.message;
      if (err.indexOf("await is only valid in async function") >= 0) {
        err += `. Have you forgotten to add the keyword 'async' in front of 'function getCallShot' or 'function checkEndGame1'?`;
      }
      //window.submitTestResultInChat(`Syntax Error: <span style="color: blue">${err}</span>.`);
      window.testResult = `Syntax Error: ${err}.`;
      gameSetup.showTestResult();
      return;
    }



    // $("#chartcontainer").hide();
    // this.toggleModal();
    window.gameSetup.userExpectedResult = [];
    window.gameSetup.onNewTestRun(this.getTestScript(), this.getRobotCode());
    
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
    // return;
    const { gameId } = this.props;
    // const oldValue = this.state.oldSetupCode;
    const user = Meteor.user();
    const thevalue = value;
    // // console.log('in handle change');
    this.state.userScript = thevalue;
    clearTimeout(this.state.waitingToSaveTesting);

    const that = this;
    this.state.waitingToSaveTesting = setTimeout(() => {
      // testScriptSaveInd ++;
      Meteor.call("saveUserTestScriptForFactory", gameId, UserFactoryCode.findOne({gameId}).currentFactoryTestSeq || 0, thevalue);
      // const chg = that.getPatch(oldValue, value);
      // if (scenario.isUserTest) {
      //   saveTestingCode(lesson.gameId, "usertestcase_" + lesson._id, { time: new Date().getTime(), label: '', chg });
      // } else {
      //   saveTestingCode(lesson.gameId, lesson._id, { time: new Date().getTime(), label: '', chg });
      // }

      // console.log("saving setup code" + value);
      // this.setState({
      //   oldSetupCode: value
      // });
    }, 1000);
    
    // debugger;
  }

  // sometimes when we save robot code, lint error wasn't removed yet, so
  // we need to call save here as well when we see lint errors are gone
  // actually we will only do it here! since only now can we be sure about lintError!
  lintUpdate(lintIssues) {
    // not used any more!
    const { gameId } = this.props;
    //debugger;
    //console.log(`in lint update!! ${JSON.stringify(lintIssues)}`);
    // if (lintIssues.length == 0) {
    //   saveRobotCode(gameId, { time: new Date().getTime(), label: '', chg: null }, window.chatId, "", lesson._id);
    // }
  }

  lintUpdateTestScript(lintIssues) {
    // not used any more!
    // const { scenario, saveRobotCode } = this.props;
    // debugger;
    console.log(`in lint update!! ${JSON.stringify(lintIssues)}`);
    lintIssues.length = 0;
  }

  getRobotCode() {
    const { Collections, gameId, isProfessionalUser, ReleaseLabels } = this.props;
    return UserFactoryCode.findOne({ gameId }).code; 
  }

  getTestScript() {
    const { Collections, gameId, isProfessionalUser, ReleaseLabels } = this.props;
    return UserTest.findOne({ gameId, testSeq: UserFactoryCode.findOne({gameId}).currentFactoryTestSeq || 0}).script; 

    return "";
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
    this.setState({ selectedFunction: v, openFunc: false });
  }

  toggleOpenFunc() {
    this.setState({openFunc: !this.state.openFunc});
  }

  render() {
    const { showModal, activeTab, oldSetupCode, showConfirmOverwriteRelease, showConfirmLoadRelease, showOKMessage, showDeleteConfirmMessage , inResetting } = this.state;
    const { gameId, isProfessionalUser, ReleaseLabels } = this.props;


    const dropdownDiv = document.getElementById('dropdownDIV');
    let label = "";
    if (dropdownDiv) {
      const labelField = dropdownDiv.getElementsByTagName('input')[1];
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
      theme: 'neat',
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
        options: {  // http://jshint.com/docs/options/
          "esversion": 6,
          "undef": true,
          "globals": {
            "Balls": true, "BallDiameter": true, "TableHeight": true, "TableWidth": true,
            "Pockets": true, "Rails": true, "Cushions": true, "CushionWidth": true, "PlayerInfo": true,
            "getAimPosition": true, "getRandomNumber": true, getRandomCommand: true, 'getSecondsLeft': true, "extrapolatePoints":true, 'getTimeLeftInSeconds': true,
            "calculateProbability": true, "console": true, 
            "MyID": true, "Pool": true, "OpponentColorType": true, "MyColorType": true,
            "world": true, "isPathBlocked": true, "getCutAngle": true, "calculateCutAngle": true, "calculateSidePocketSkew": true, "getAngleToSidePocket": true,
            "calculateEndState": true, 
            "calculateCTP" : true,
            'calculateEndState2': true,
            'calculateProbability2': true,
            'calculateProbability': true,
            "getDistance": true, "Victor": true, "getFirstBallTouched": true,
            "Boundaries": true, TOP_Y: true, BOTTOM_Y: true, LEFT_X: true, RIGHT_X: true, "dist2": true, "getShortestPath": true,
            getWeaponRange: true,
            StartEndGameMode: true,
            getNextEndGameRockPos: true,
            getNextRockPositions: true,
            getTimeLeftInSeconds: true,        
          }
          // "esnext": true
        }
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
            "Balls": true, 'PlaceCueBallFromHand': true, "Victor": true, "waitSeconds": true, "getCutAngle":true, "calculateCutAngle": true, "calculateSidePocketSkew": true, "BallDiameter": true, "TableHeight": true, "TableWidth": true,
            "Pockets": true, "Rails": true, "Cushions": true, "CushionWidth": true, "PlayerInfo": true,
            "getAimPosition": true, "getNewCommand": true, "sendTankOrder": true, "MoveRight": true, "getRandomNumber": true, getRandomCommand: true, "extrapolatePoints": true, "calculateProbability": true, "console": true, 
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
            "ExpectBallPocketed": true,
            "ExpectShotCommand": true,
            "WaitForAllShellsToExplode": true,
            "PlaceTile": true,
            "PlaceTank": true,
            "PlaceCrystal": true, 
            "PlaceWeapon": true,
            "sendCommandToWhiteTank": true,
            SendCommandToTank: true,
            "SetupTickUpdates": true,
            ExpectNumberOfWhiteTanksKilled: true,
            "RemoveAllTanks": true,
            RemoveAllSprites: true,
            "CalculateCommand": true,
            "ChooseRedColor": true,
            SetTankProperties: true,
            SetExpectedResult: true,
            "ChooseBlackColor": true,
            "ChooseYellowColor": true,
            "calculateShotCommand": true,
            "UpdateWorld": true,
            "SubmitTestOutputData": true,
            "PlotData": true,
            "calculateEndState": true,
            calculateCTP: true,
            SubmitData: true,
            LoadData: true,
            TrainLinearModel: true,
            dist2: true,
            getShortestPath: true,
            StartEndGameMode: true,
          }
          // "esnext": true
        }
      },
      theme: 'neat',
      readOnly: false //!isProfessionalUser
    };
    // const code = this.state.oldCode;
    // if (RobotCode) {
    //   const latestTime = RobotCode.CodeUpdates[RobotCode.CodeUpdates.length - 1].time;
    //   code = this.reconstructCode(RobotCode, latestTime);
    // }
    // console.log("in render codemirror.jsx");
    let tabs = [
      {
        id: 1,
        name: 'Robot Code'
      },
      {
        id: 2,
        name: 'Test Script'
      }
    ];

    const releaseButtonVisible = true; //!scenario.hideReleaseButton && getUID() == "";
    // const searchNames = ['Sydney', 'Melbourne', 'Brisbane', 'Adelaide', 'Perth', 'Hobart'];

    const hintHandler = (cm, event) => {
      const allLines = cm.getValue().split("\n");
      const line = allLines[cm.getCursor().line];
      // if (scenario.applyBaselineCode && line.endsWith("////READONLY")) {
      //   return;
      // }
  
      if (!cm.state.completionActive && /* Enables keyboard navigation in autocomplete list */
        !event.ctrlKey 
        && !event.altKey 
        // && !event.shiftKey 
        && !event.metaKey &&
        !cm.inCtrl && !cm.inAlt 
        // && !cm.inShift 
        && (event.keyCode === 190 || (event.keyCode >= 65 && event.keyCode <= 90))) {
          /* Enter - do not open autocomplete list just after item has been selected in it */
          // && event.keyCode != 13 && event.keyCode != 27
  
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

    let that = this;
    return (
      <div id="aicode" className="lessonPage__AIcode">
        <div className="lessonPage__AIcode__Tabs">
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
          <div className="lessonPage__AIcode__Tabs__Action alignButtonDiv" >
            {/* <button className={"btn leftrightmargin20 " + (releaseButtonVisible?"alignButton":"")} onClick={() => { this.handlePlaygame(); }} > Test </button> */}
            {
              releaseButtonVisible ? 
                <div className="labelDropdownlesson" id="dropdownDIV" >

                  <button title="beautify code format"
                    style={{marginRight: "10px", height: "31px", fontWeight: "bold"}}
                    className={"btn leftrightmargin5 alignButton"} 
                    onClick={() => { window.beautifyCode(); }}
                  >
                    {"{ }"}
                  </button>
                  <DropdownList className="labelDropdown" placeHolder="go to" title="Go to function"
                  // open={this.state.openFunc} 
                  data={functionList} defaultValue={this.state.selectedFunction} textField="gotoFunctionName" onSelect={this.funcChange.bind(this)}   />
                  {/* <button id={'funcButton'} className={`btn alignButton}`} onClick={this.toggleOpenFunc.bind(this)} > {"F"} </button> */}
                  <Combobox className="labelDropdown" placeHolder="release name" data={ReleaseLabels} defaultValue={''} textField="labelName" value={this.state.releaseNameValue} onChange={value => this.setState({ releaseNameValue: value })}   />
                  <button disabled={!labelNotEmpty} title="save release" id={'releaseButton'} className={`btn leftrightmargin5 alignButton ${labelNotEmpty?"":"disabledButton"}`} onClick={() => { this.handleReleaseCode(); }} > <FontAwesomeIcon icon="save" /> </button>
                  <button disabled={!labelNotEmpty || !existingRelease}  title="load release" id={'loadButton'} className={`btn leftrightmargin55 alignButton ${labelNotEmpty?"":"disabledButton"}`} onClick={() => { this.handleLoadCode(); }} > <FontAwesomeIcon icon="download" /> </button>
                  <button disabled={!labelNotEmpty || !existingRelease}  title="remove release" id={'deleteButton'} className={`btn leftrightmargin55 alignButton ${labelNotEmpty?"":"disabledButton"}`} onClick={() => { this.handleDeleteRelease(); }} > <FontAwesomeIcon icon="trash-alt" /> </button>
                </div>
              : null
            }
          </div>
        </div>
        <div className="lessonPage__AIcode__CodeMirror">
          {
            activeTab === 1 ?
              <div id="robotcodeeditordiv" className="lessonPage__AIcode__CodeMirror__groups active">
                <div className="lessonPage__AIcode__CodeMirror__header">
                  <span>Robot Code</span>
                  <div className="lessonPage__AIcode__CodeMirror__header__action">

                    <span tabIndex={0} role="button" className="tg-icon-refesh2" />
                  </div>
                </div>
                <CodeMirror
                  options={options}
                  onChange={(value) => {
                    if ( getUID() == "")
                      this.handleChange(value);
                  }}
                  ref={(ref) => {
                    if (ref != null) {
                      this.robotCodeEditor = ref;
                      window.robotCodeEditor = ref;
                      
                      const code = that.state.userCode;

                      if (code != ref.codeMirror.getValue()) {
                        // console.log("setting new robot code: " + code);
                        ref.codeMirror.setValue(code);
                        // that.state.oldCode = code;
                      }

                      ref.codeMirror.markClean();
                      
                      if (!hintHandlerInit1) {
                        //this.robotCodeEditor.codeMirror.off("keydown", hintHandler); 
                        this.robotCodeEditor.codeMirror._handlers["keydown"] = [];
                        this.robotCodeEditor.codeMirror.on("keydown", hintHandler);  
                        hintHandlerInit1 = true;
                      }
                     
                    }
                  }}
                />
              </div>
            : null
          }
          {
            activeTab === 2 ?
              <div id="setupcodeeditordiv" className="lessonPage__AIcode__CodeMirror__groups">
                <div className="lessonPage__AIcode__CodeMirror__header">
                  <span>Test Code</span>
                  <div className="lessonPage__AIcode__CodeMirror__header__action">
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
                    if (!ref) return;
                    that.testCode = ref; 
                    // this.testCode.codeMirrorCompo = this;
                    // doesn't work here! usually this is not active tab
                    that.setupCodeEditor = ref;
                    window.testCodeEditor = ref;

                    if (!$(window.testCodeEditor.codeMirror.getWrapperElement()).is(":visible")) {
                      return;
                    }

                    // const code = that.state.userScript;

                    // if (code != ref.codeMirror.getValue()) {
                    //   // console.log("setting new robot code: " + code);
                    //   ref.codeMirror.setValue(code);
                    //   // that.state.oldCode = code;
                    // }

                    // window.testCodeEditor.codeMirror.markClean();
                    // if (window.saveTestScriptInterval) {
                    //   clearInterval(window.saveTestScriptInterval);
                    // }
                    // window.saveTestScriptInterval = setInterval(() => {
                    //   if (!window.testCodeEditor) {
                    //     clearInterval(window.saveTestScriptInterval);
                    //     return;
                    //   }
                    //   if (!window.testCodeEditor.codeMirror.isClean()) {

                    //     testScriptSaveInd ++;
                    //     testScriptSaveSlideId = userLesson.currentSlideId;
                    //     localTestScript = window.testCodeEditor.codeMirror.getValue();
                    //     window.testCodeEditor.codeMirror.markClean();
                    //     // console.log("saving test script: " + window.testCodeEditor.codeMirror.getValue());
                    //     Meteor.call("saveUserTestScriptForLesson", userLesson._id, window.testCodeEditor.codeMirror.getValue(), testScriptSaveInd);
                    //   }
                    // },3000);

                    const code2 = that.state.userScript;
                    gameSetup.testSetupCode = code2;
                    if (code2 != window.testCodeEditor.codeMirror.getValue()) {
                      that.setState({ oldSetupCode: code2 });
                      const cursor = window.testCodeEditor.codeMirror.getCursor();
                      window.testCodeEditor.codeMirror.setValue(code2);
                      window.testCodeEditor.codeMirror.setCursor(cursor);
                    }
                    window.testCodeEditor.codeMirror.markClean();
                
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
          <div className="lessonPage__AIcode__runCode" id="gameDiv" />
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
