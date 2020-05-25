// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
import getRichErrorMessages, { moreErrorChecks, checkBracketErrors, checkForLoopErrors } from './eslintcodeErrorCheck';

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
    "getAimPosition": true, "getNewCommand": true, "getRandomNumber": true, 'getSecondsLeft': true, "extrapolatePoints":true, "calculateProbability": true, "console": true, "CandidateBallList": true,
    "MyID": true, "Pool": true, "OpponentColorType": true, "MyColorType": true,
    "world": true, "isPathBlocked": true, "getCutAngle": true, "calculateCutAngle": true, "calculateSidePocketSkew": true, "getAngleToSidePocket": true,
    "calculateEndState": true, 
    "calculateCTP": true,
    'calculateEndState2': true,
    'calculateProbability2': true,
    'calculateProbability': true,
    "getDistance": true, "Victor": true, "getFirstBallTouched": true,
    "Boundaries": true, "dist2": true, "getShortestPath": true,
  },
  "rules": {
      "no-alert": 2,
      "no-array-constructor": 2,
      "no-bitwise": 0,
      "no-caller": 2,
      "no-catch-shadow": 2,
      "comma-dangle": 0,
      "no-cond-assign": 2,
      "no-console": 0,
      "no-constant-condition": 2,
      "no-control-regex": 2,
      "no-debugger": 2,
      "no-delete-var": 2,
      "no-div-regex": 0,
      "no-dupe-keys": 2,
      "no-else-return": 0,
      "no-empty": 2,
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
      "no-mixed-spaces-and-tabs": [2, false],
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
      "no-extra-parens": 2,
      "block-scoped-var": 0,
      "brace-style": [0, "1tbs"],
      "camelcase": 0,
      "comma-spacing": 2,
      "comma-style": 0,
      "complexity": [0, 11],
      "consistent-return": 0,
      "consistent-this": [0, "that"],
      "curly": [0, "all"],
      "default-case": 0,
      "dot-notation": [2, { "allowKeywords": true }],
      "eol-last": 0,
      "eqeqeq": 0,
      "func-names": 0,
      "func-style": [0, "declaration"],
      "generator-star": 0,
      "guard-for-in": 0,
      "handle-callback-err": 0,
      "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
      "max-depth": [0, 4],
      "max-len": [0, 80, 4],
      "max-nested-callbacks": [0, 2],
      "max-params": [0, 3],
      "max-statements": [0, 10],
      "new-cap": 2,
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
      "keyword-spacing": 2,
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

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../../../../node_modules/codemirror/lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../../../../node_modules/codemirror/lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  // declare global: JSHINT

  function validator(text, options) {
    console.log("init validator");

    if (!window.eslint) {
      window.console.error("Error: can't find eslint.");
      $.getScript('/js/eslint.js');
      return;
    } 

    console.log("run linter");
    // check if it is test code or robot code
    let editor = window.testCodeEditor;
    if (text.indexOf('ReportEndOfTest') < 0 && text.indexOf('ResetTable') < 0 && text.indexOf('PlaceBallOnTable') < 0) {
      editor = window.robotCodeEditor;
    }
    
    if (!editor || !window.userChat || !window.scenario) {
      console.log("can't detect editor or userchat or scenario");
      return [];
    }

    const code = editor.codeMirror.getValue();
    if (editor == window.robotCodeEditor) {
      const functionErrors = checkBracketErrors(window.userChat, window.scenario, code);
      if (functionErrors.length > 0) {
        return functionErrors;
      }
    }

    var linter = new window.eslint();
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

    if (esresult.length == []) {
      // additional errors added by ourselves

      const forloopErrors = checkForLoopErrors(window.userChat, window.scenario, code);
      if (forloopErrors.length > 0) {
        return forloopErrors;
      } else {
        return [];
      }
    }


    
    
    if (eserrors && eserrors.length > 0) parseErrors(eserrors, esresult, editor);


    // more error checks using known correct answer
    if (window.userChat && window.scenario && editor) {
      const code = editor.codeMirror.getValue();
      const moreErrs = moreErrorChecks(window.userChat, window.scenario, code);
      if (moreErrs) moreErrs.forEach((r) => { esresult.push(r); });
    }

    return esresult;
  }
  console.log("registerHelper");

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
});
