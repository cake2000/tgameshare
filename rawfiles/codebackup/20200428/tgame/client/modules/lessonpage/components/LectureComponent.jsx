/**
 *
 * TODO:
 * 1. end of lesson                   DONE
 * 2. solution line number problem    DONE
 * 3. Q&A give to dev                 DONE
 * 4. 3 level quiz navigation system  DONE
 * 5. test coding/hint slides         DONE
 * 6. navigation scroll right         DONE
 * 7. editor error message            DONE
 * 
 
& {
  background: #2d83af; //#4C6940; // #3A6039; // #3A495C;
}

@import url('https://fonts.googleapis.com/css?family=ZCOOL+KuaiLe&display=swap');
@import url(https://fonts.googleapis.com/css?family=Patrick+Hand);
//body{
  //font-family: ‘Comic Sans MS’,serif;

  
//@import url(//fonts.googleapis.com/css?family=Comfortaa:400,300,700);

.slides h1, .slides h2, .slides h3 {
   font-family: 'Patrick Hand', 'ZCOOL KuaiLe', cursive;
   //font-family: Arial,"Microsoft YaHei";
   //font-family: "Microsoft Yahei", sans-serif;
   //font-family: 'Patrick Hand', sans-serif;
   //font-family: 'Open Sans', sans-serif;
   //font-family: "Comic Sans MS", "Comic Sans", regular;
}


 * 
 * 
 */
import React from 'react';
import CodeMirror from 'react-codemirror';
import renderHTML from 'react-render-html';
import { Howler } from "howler";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Script from 'react-load-script';
import TinyMCE from 'react-tinymce';
import ReactTooltip from 'react-tooltip';
import { UserLesson } from '../../../../lib/collections';
// import SH from '/js/syntaxhighlighter.js';
import '../../../../node_modules/codemirror/addon/display/autorefresh';
import { debug } from 'util';
import {
  TUTORIAL_STATEMENT, PREDEFINED_ANSWER_POOL_19, PREDEFINED_ANSWER_POOL_20,
  PREDEFINED_ANSWER_TANK_26, PREDEFINED_ANSWER_TANK_27, PREDEFINED_ANSWER_TANK_28, PREDEFINED_ANSWER_TANK_29
} from '../../../../lib/const';
import { ITEM_GAME_TYPE, MIGRATION_CONST} from '../../../../lib/enum';
require('codemirror/mode/javascript/javascript');

import SafeSrcDocIframe from 'react-safe-src-doc-iframe';

const beautify = require('js-beautify').js_beautify;

import { get_quick_answer } from './sharedlib';


const avatarhtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>My Cats Page</title>
    </head>
    <body>
      <a href="https://link-to-about-page.com">About</a><br />
      <a href="https://link-to-awesome-cats.com"><img src="http://placekitten.com/200/300" /></a><br />
      <button onclick="navigate();">Click me to see more cats!</button>
    </body>
  </html>
`;

const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;

Object.defineProperty(String.prototype, 'hashCode', {
  value: function() {
    var hash = 0, i, chr;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
});


var genericcodes = [];
var genericcodesch = [];

var choices = ["Well done", "Terrific", "That's correct", "Way to go", "Bravo", "You are the best","Not bad", "Excellent", "Marvelous", "Wonderful", "I knew you had it in you", "Awesome", "Remarkable", "Sweet", "I'm impressed", "You're very talented", "Magnificent",  "Brilliant", "Right on", "Great job", "You rock", "Phenomenal", "Exceptional", "Keep up the good work", "Fantastic work", "Very good", "Stupendous", "It couldn't be better", "Good for you", "Spectacular work", "How extraordinary", "You are a winner", "Great effort", "You are a genius", "You are sharp", "You've earned my respect", "Outstanding effort", "Top notch", "Good choice", "Sorry, the correct answer is 'A'", "Sorry, the correct answer is B", "Sorry, the correct answer is C", "Sorry, the correct answer is D", "Sorry, the correct answer is E", "Sorry, the correct answer is F"];

for (let i=0; i<choices.length; i++) {
    const line = choices[i] + "!";
    genericcodes.push(line.hashCode());
}

var choices2 = ["太棒了", "很好", "完全正确", "你真厉害", "做的好", "你真是个天才", "向你致敬", "我很佩服你", "了不起", "你太优秀了", "你太有才了", "你做的很好", "太漂亮了", "你的努力没有白费", "你越做越好了", "很可惜, 正确的答案是 A","很可惜, 正确的答案是 B","很可惜, 正确的答案是 C","很可惜, 正确的答案是 D","很可惜, 正确的答案是 E","很可惜, 正确的答案是 F"];
for (let i=0; i<choices2.length; i++) {
  const line = choices2[i] + "!";
  genericcodesch.push(line.hashCode());
}



const scratchGameList = [
  MIGRATION_CONST.scratchGameId,
  MIGRATION_CONST.flappybirdGameId,
  MIGRATION_CONST.scratchtankGameId,
  MIGRATION_CONST.tankscratch2GameId,
  MIGRATION_CONST.candycrushGameId,
  MIGRATION_CONST.scratchSoccerGameId,
  MIGRATION_CONST.drawingturtleGameId,
  MIGRATION_CONST.ia_k_turtleGameId,
  MIGRATION_CONST.generalconceptsGameId,
  MIGRATION_CONST.cannonpongGameId,
  MIGRATION_CONST.appleharvestGameId,
  MIGRATION_CONST.recyclerGameId,
  MIGRATION_CONST.codinggameGameId,
  MIGRATION_CONST.algoScratchGameId,
  MIGRATION_CONST.mazeGameId,
  MIGRATION_CONST.balloonBusterGameId,
  MIGRATION_CONST.schoolAGameId,
  MIGRATION_CONST.schoolAGameCHId,
  MIGRATION_CONST.schoolBGameId,
  MIGRATION_CONST.schoolBGameCHId,
];
  

const combineCode = function(newCode, oldCode) {
  oldCode = oldCode ? oldCode : "";
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_POOL_19") >= 0) {
    oldCode = PREDEFINED_ANSWER_POOL_19;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_POOL_20") >= 0) {
    oldCode = PREDEFINED_ANSWER_POOL_20;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_26") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_26;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_27") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_27;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_28") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_28;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_29") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_29;
  }
  let finalCode = newCode + "\n\n";
  const newBlocks = getCodeBlocks(newCode);
  const newFunctionList = Object.keys(newBlocks);
  const oldBlocks = getCodeBlocks(oldCode);
  const oldFunctionList = Object.keys(oldBlocks);
  for(let k=0; k<oldFunctionList.length; k++) {
    const f = oldFunctionList[k]
    if (!newFunctionList.includes(f)) {
      const codelist = oldBlocks[f];
      for (let j=0; j<codelist.length; j++) {
        finalCode += codelist[j].code + "\n\n";
      }
    }
  }
  const prettier = beautify(finalCode, { indent_size: 2, jslint_happy: true });
  return prettier;
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


const AllQuizTypes = ["quiz", "q1", "q2", "q3", "coding", "survey", "input"];
var speechSpeedM = 1;

let hintClicked = false;
let solutionClicked = false;


jQuery.fn.neonText = function(options){
  var options = jQuery.extend({
		textColor: '#FFFFFF',
		textSize: '20pt',
		neonHighlight: '#FFFFFF',
		neonHighlightColor: '#FF00DE',
		neonHighlightHover: '#00FFFF',
		neonFontHover: '#FFFFFF'
	},options)
	return this.each(function() {
    jQuery(this)
      // .css('color', options.textColor)
			// .css('font-size', options.textSize)
      // .css('text-shadow','0 0 3px '+options.neonHighlight+',0 0 6px '+options.neonHighlight+',0 0 10x '+options.neonHighlight +',0 0 15px '+options.neonHighlightColor+',0 0 19px '+options.neonHighlightColor+',0 0 24px '+options.neonHighlightColor+',0 0 30px '+options.neonHighlightColor);

      .css('text-shadow','0 0 10px '+options.neonHighlight+',0 0 20px '+options.neonHighlight+',0 0 30px '+options.neonHighlight+',0 0 40px '+options.neonHighlightHover+',0 0 70px '+options.neonHighlightHover+',0 0 80px '+options.neonHighlightHover+',0 0 100px '+options.neonHighlightHover)
      // .css('color', options.neonFontHover);

			// .hover(
			// 	function () {
			// 		jQuery(this)
			// 			.css('text-shadow','0 0 10px '+options.neonHighlight+',0 0 20px '+options.neonHighlight+',0 0 30px '+options.neonHighlight+',0 0 40px '+options.neonHighlightHover+',0 0 70px '+options.neonHighlightHover+',0 0 80px '+options.neonHighlightHover+',0 0 100px '+options.neonHighlightHover)
			// 			.css('color', options.neonFontHover);
			// 	},
			// 	function () {
			// 		jQuery(this)
			// 			.css('color', options.textColor)
			// 			.css('text-shadow','0 0 1px '+options.neonHighlight+',0 0 3px '+options.neonHighlight+',0 0 4x '+options.neonHighlight +',0 0 5px '+options.neonHighlightColor+',0 0 6px '+options.neonHighlightColor+',0 0 8px '+options.neonHighlightColor+',0 0 10px '+options.neonHighlightColor)
			// 	}
			// );
	});
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

function replaceAll(str, find, replace) {
  if (!str || str == "") {
    return "";
  }
  return str.replace(new RegExp(find, 'g'), replace);
}

function cleanStr(str) {
  //return replaceAll(replaceAll(str, "\\[", ""), "\\]", "");
  if (!str) {
    debugger;
  }
  let s = str.trim();
  if (s.substring(0,1) == "[") s = s.substring(1);
  if (s.substring(s.length-1) == "]") s = s.substring(0, s.length-1);
  return s;
}

function hideNavArrows() {
  var iframes = document.getElementById('slides').getElementsByTagName('iframe');
  var iframe = iframes[0];
  if (!iframe.contentDocument) return;
  var arrows = iframe.contentDocument.getElementsByClassName("controls-arrow");
  for (let k=0; k<arrows.length; k++) {
    //arrows[k].setAttribute("display", "none");
    $(arrows[k]).hide();
  }

  var sn = iframe.contentDocument.getElementsByClassName("slide-number");
  for (let k=0; k<sn.length; k++) {
    //arrows[k].setAttribute("display", "none");
    $(sn[k]).hide();
  }

  // progress bar
  // var pg = iframe.contentDocument.getElementsByClassName("progress");
  // for (let k=0; k<pg.length; k++) {
  //   $(pg[k]).hide();
  // }

}


const READY_MODE = -1;
const PRESENTING_MODE = 0;
const USER_INPUT_MODE = 1;
const QUIZ_MODE = 2;
const CODING_CHALLENGE_MODE = 3;
const SURVEY_MODE = 4;
const QUICK_INPUT_MODE = 5;
let currentMode = PRESENTING_MODE;
let localStudentName = "";
let localSchoolGrade = "";
let localJavaScriptLevel = "";
let localRobotStartCode = "";
let localTestScript = "";
let localRobotCodeAnswer = "";
let localTestScriptAnswer = "";

const updateButtons = (newMode, param) => {
  currentMode = newMode;
  $("#userinput").hide();
  $("#usersurveyquiz").hide();
  $("#usersurveyquiz").empty();

  $("#userquickinput").hide();

  if (currentMode == PRESENTING_MODE) {
    $("#userinput").hide();
  } else if (currentMode == QUICK_INPUT_MODE) {
    const parts = param.split("||");
    if (parts.length >= 4) {
      // already completed, so just show user input in box and keep it disabled
      // $("#userinputtext").attr("inputfield", parts[1].trim());
      $("#userquickinputtext").val(parts[3].trim());
      $("#userquickinput").show();
      $("#userquickinputtext").prop('disabled', true).css('opacity',1);
      // $("#submitquickinput").prop('disabled', true).css('opacity',1);
      // $("#hintquickinput").prop('disabled', true).css('opacity',1);
      $("#submitquickinput").hide();
      $("#hintquickinput").hide();
      $("#answerquickinput").hide();

    } else {
      $("#userquickinputtext").attr("quickexercisequestion", parts[1].trim());
      $("#userquickinputtext").val("");
      $("#userquickinput").show();
      $("#userquickinputtext").prop('disabled', false).css('opacity',1);
      $("#userquickinputtext").prop('rows', '5'); //parts[2]);
      $("#submitquickinput").prop('disabled', false).css('opacity',1);
      $("#hintquickinput").prop('disabled', false).css('opacity',1);
      $("#submitquickinput").show();
      $("#hintquickinput").show();
      const user = Meteor.user();
      if (hintClicked && user.showSolutionButton != false) {
        $("#answerquickinput").show();
      } else {
        $("#answerquickinput").hide();
      }
    }

  } else if (currentMode == USER_INPUT_MODE) {
    const parts = param.split("||");
    if (parts.length >= 4) {
      // already completed, so just show user input in box and keep it disabled
      // $("#userinputtext").attr("inputfield", parts[1].trim());
      $("#userinputtext").val(parts[3].trim());
      $("#userinput").show();
      $("#userinputtext").prop('disabled', true).css('opacity',1);

      if (parts[1].trim() == "SN") {
        localStudentName = parts[3].trim();
      }
    } else {
      $("#userinputtext").attr("placeholder", parts[2].trim());
      $("#userinputtext").attr("inputfield", parts[1].trim());
      $("#userinputtext").val("");
      $("#userinput").show();
      $("#userinputtext").prop('disabled', false).css('opacity',1);
    }
  } else if (currentMode == QUIZ_MODE) {
    $("#userinput").hide();
    $("#buttonA").show();
    $("#buttonB").show();
    if (param > 2) $("#buttonC").show();
    if (param > 3) $("#buttonD").show();
  } else if (currentMode == SURVEY_MODE || currentMode == QUIZ_MODE) {
    const parts = param.split("||");
    const choices = parts[1].trim().split(" ");
    // $("#usersurveyquiz").show();
    $('#usersurveyquiz').css('display', 'flex');
    let userChoice = "";
    if (parts.length >= 4) { // already answered
      userChoice = parts[3].trim();
      if (parts[2].trim() == "SchoolGrade") {
        localSchoolGrade = userChoice;
      }
      if (parts[2].trim() == "JavaScriptLevel") {
        localJavaScriptLevel = userChoice;
      }

    }

    // append choices buttons
    let inputfield = parts[2].trim();
    if (param.toLowerCase().indexOf("#quiz") >= 0) {
      inputfield = "quizanswer_" + inputfield;
    }

    for (let k=0; k<choices.length; k++) {
      const c = choices[k];
      let inputchoice = null;
      if (userChoice == c) {
        inputchoice = $('<input type="button" ' + (userChoice == ""? '' : 'disabled') + ' class="surveybuttonchosen" value="' + c + '" />');
      } else {
        inputchoice = $('<button type="button" inputfield="' + inputfield + '" ' + (userChoice == ""? '' : 'disabled') + ' class="glow-on-hover" value="' + c + '" >' + c + "</button>");
      }
      inputchoice.appendTo($("#usersurveyquiz"));
    }
  }
};


var currentSlide = -1;
var currentScript = -1;
let isPaused = false;
var currentAction = null;
var AllScripts = [];

var slideBase = "https://docs.google.com/presentation/d/e/2PACX-1vT1AVF1RfHkHpZNVBxM3i7L6lvRraAp1Cri91MX5G05rp3v65BxlFWt18K0OqhAUNIfN8HS3jB8F3uF/embed?start=false&loop=false&delayms=3000&rm=minimal&slide=";
slideBase = "https://docs.google.com/presentation/d/e/2PACX-1vT1AVF1RfHkHpZNVBxM3i7L6lvRraAp1Cri91MX5G05rp3v65BxlFWt18K0OqhAUNIfN8HS3jB8F3uF/embed?start=false&loop=false&delayms=3000&slide=";



const getCalledName = (user) => {
  return localStudentName ? localStudentName : (user.studentname ? user.studentname : (user.profile.firstName ? user.profile.firstName : ( user.username ? user.username : "" ) ));
};

const getSchoolGrade = (user) => {

  let grademapped = user.profile.grade;
  if (grademapped == 13) {
    grademapped = ">=13";
  }
  return localSchoolGrade ? localSchoolGrade : (user.profile.grade ? grademapped : 'unknown');
};

const JSLevelDes = {
  'NONE': "no",
  'SOME': "some",
  'UNKNOWN': "unknown"
};
const getJSLevel = (user) => {
  return localJavaScriptLevel ? localJavaScriptLevel : (user.javascriptlevel ? user.javascriptlevel : 'UNKNOWN');
};



let RevealRef = null;

// var getRevealReference = (callback) => {
//   var iframes = document.getElementById('slides').getElementsByTagName('iframe');
//   var iframe = iframes[0];

//   if (iframe.contentWindow.Reveal && iframe.contentWindow.Reveal.getSlideNotes) {
//     RevealRef = iframe.contentWindow.Reveal;
//     console.log("real start here! got reveal reference.");
//     $("#slideIFrame").show();
//     hideNavArrows();


//     callback();


//   } else {
//     console.log("waiting for reveal reference ...");
//     setTimeout(() => {
//       getRevealReference(callback);
//     }, 200);
//   }
// };

var getCurrentSlideIndex = (slideContent, slideId) => {
  // console.log("LC: gotoUserCurrentSlide 1 " + slideId + " window.currentSlideID " + window.currentSlideID);
  if (!RevealRef) return 0;
  for (let k=0; k < slideContent.slideInfo.length; k++) {
    const slide = slideContent.slideInfo[k];
    if (slide.ID == slideId) {
      return k;
    }
  }
  return 0;
};

var gotoUserCurrentSlide = (slideContent, slideId, forceUpdate = false) => {
  // console.log("LC: gotoUserCurrentSlide 1 " + slideId + " window.currentSlideID " + window.currentSlideID);
  if (slideId == "welcome") {
    // debugger;
  }
  if (!RevealRef) return false;
  // if (window.currentSlideID == slideId) return;
  // console.log("LC: gotoUserCurrentSlide 2 " + slideId + " window.currentSlideID " + window.currentSlideID);
  window.currentSlideID = slideId;

  for (let k=0; k < slideContent.slideInfo.length; k++) {
    const slide = slideContent.slideInfo[k];
    if (slide.ID == slideId) {

      // debugger;
      const actualSlide = RevealRef.getIndices();
      if (actualSlide.v == Number(k) && !forceUpdate) return false;
      // console.log("going to slide " + k + " from actual " + JSON.stringify(actualSlide) + ": " + slideId);
      RevealRef.slide(0, k, -1);
      return true;
    }
  }
  return false
};

/**
 * TODO: add typing speed detector, add copy paster detector
 */

let inputKeyDownSetup = false;
let chatInputSetup = false;

const removeScratchExampleFor = (txt) => {
  if (!txt) return '';
  // go through all <p> pairs and remove it if it is marked as AScratchExample
  const p = txt.split("\n");
  let out = "";
  let inRemovePart = false;
  for (let k=0; k<p.length; k++) {
    if (p[k].indexOf(`ascratchexample =`) >= 0) {
      inRemovePart = true;
    }
    const ind = p[k].indexOf("</p>");
    if (inRemovePart && ind >= 0) {
      inRemovePart = false;
      continue;
    }

    if (!inRemovePart) {
      out += `${p[k]}\n`;
    }
  }
  return out;
};


const removeJSLevelFor = (txt, level) => {
  // go through all <p> pairs and remove it if it is of that level
  const p = txt.split("\n");
  let out = "";
  let inRemovePart = false;
  for (let k=0; k<p.length; k++) {
    if (p[k].indexOf(`js = "${level}"`) >= 0) {
      inRemovePart = true;
    }
    const ind = p[k].indexOf("</p>");
    if (inRemovePart && ind >= 0) {
      inRemovePart = false;
      continue;
    }

    if (!inRemovePart) {
      out += `${p[k]}\n`;
    }
  }
  return out;
};


const removeJSLevelForOld = (txt, level) => {
  // go through all <p> pairs and remove it if it is of that level
  const p = txt.split("<p");
  let out = "";
  for (let k=0; k<p.length; k++) {
    if (k > 0) {
      out += "<p";
    }
    if (p[k].indexOf(`js = "${level}"`) >= 0) {
      const ind = p[k].indexOf("</p>");
      out += `${p[k].substring(ind+4)}`;
    } else {
      out += `${p[k]}`;
    }
  }
  return out;
};

const getTimeStr = function(chattime) {
  return `${chattime.getMonth() + 1}/${chattime.getDate()}/${chattime.getFullYear()} ${chattime.getHours() < 10 ? '0' : ''}${chattime.getHours()}:${chattime.getMinutes() < 10 ? '0' : ''}${chattime.getMinutes()}:${chattime.getSeconds() < 10 ? '0' : ''}${chattime.getSeconds()}`;
};

const getFunctionContext = (line) => {
  let functionContext = line.substring(0, line.indexOf('=')).trim();
  if (functionContext.indexOf('var') === 0) {
    functionContext = functionContext.substring(4).trim();
  }
  return functionContext;
};

const sharedStart = (a1, a2) => {
  a1 = a1.trim(); a2 = a2.trim();
  const L = a1.length;
  let i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
};

const insertNewWholeFunction = function insertNewWholeFunction(newcode, usercodeall, pattern) {
  const usercode = usercodeall.split('\n');

  if (newcode.indexOf(pattern) < 0) return usercode;
  const newlines = newcode.split('\n');
  // for now let's assume there is only one new function
  let foundStart = false;
  let foundEnd = false;
  for (let i = 0; i < newlines.length; i++) {
    const line = newlines[i];
    let linetrim = line;
    if (line.indexOf('//') > 0) {
      linetrim = line.substring(0, line.indexOf('//')).trimRight();
    }
    if (foundEnd) break;

    if (line.indexOf(pattern) > 0) {
      if (foundStart) {
        foundEnd = true;
      } else {
        foundStart = true;
      }
    }

    if (foundStart) {
      usercode.push(linetrim);
    }
  }
  return usercode.join('\n');
};

const replaceWholeFunction = function replaceWholeFunction(newcode, usercodeall) {
  const usercode = usercodeall.split('\n');

  if (newcode.indexOf('// REPLACEFUNC') < 0) return usercode;

  // first find name of function to replace
  let funcname = '';
  const newlines = newcode.split('\n');
  for (let i = 0; i < newlines.length; i++) {
    const line = newlines[i];
    if (line.indexOf('// REPLACEFUNC') > 0) {
      funcname = line.substring(0, line.indexOf('function'));
      break;
    }
  }

  if (funcname === '') return usercodeall; // shouldn't happenn

  // then remove the function from usercode
  const userlines = usercode; // .split("\n");
  const userlinesreduced = [];

  let foundStart = false;
  let foundEnd = false;
  let leftPCnt = 0; let rightPCnt = 0;
  // debugger;
  for (let i = 0; i < userlines.length; i++) {
    const userline = userlines[i];
    if (!foundStart && userline.indexOf(funcname) >= 0) {
      foundStart = true;
    }
    let donothing = false;
    if (foundStart && !foundEnd) {
      leftPCnt += userline.split('{').length - 1;
      rightPCnt += userline.split('}').length - 1;
      if (leftPCnt <= rightPCnt) {
        foundEnd = true;
        donothing = true;
      }
    }
    // else if (userline.indexOf("}") === 0) {
    //   foundEnd = true;
    // } else {
    if ((foundStart && !foundEnd) || donothing) {
      // do nothing
    } else {
      // copy
      userlinesreduced.push(userline);
    }
  }
  const newusercode = userlinesreduced.join('\n');

  return insertNewWholeFunction(newcode, newusercode, '// REPLACEFUNC');
};

const findLineInCode = (funcContext, usercode, oldLine1, oldLine2) => {
  // first try to find exact match
  if (typeof (oldLine2) === 'undefined') {
    oldLine2 = '';
  }
  let ctxt = '';
  for (let i = 0; i < usercode.length; i++) {
    // if (i === 0 && oldLine2 === "") {
//    if (i === 0) {
    if (usercode[i].indexOf('function') >= 0) {
      ctxt = getFunctionContext(usercode[i]);
    }
    if (ctxt === funcContext && oldLine1.trim() === usercode[i].trim()) return i;
    // } else {
    //   if (oldLine1.trim() === usercode[i].trim() && oldLine2.trim() === usercode[i-1].trim()) return i;
    // }
  }

  // then find 2 lines with longest common prefix together
  let longest = 0;
  let longestInd = 0;

  ctxt = '';
  for (let i = 0; i < usercode.length; i++) {
    if (usercode[i].indexOf('function') >= 0) {
      ctxt = getFunctionContext(usercode[i]);
    }

    if (ctxt !== funcContext) continue;
    const s1 = sharedStart(oldLine1, usercode[i]);
    let s2 = '';
    if (i > 0 && oldLine2 !== '') {
      s2 = sharedStart(oldLine2, usercode[i - 1]);
    }
    if (((s1.length * 3) + s2.length) > longest) {
      // give prev one line more weight for prefix length
      longest = ((s1.length) * 3) + s2.length; longestInd = i;
    }
  }
  return longestInd;
};

// usercodeall and return value are both continuous
const copyBlockToUserCode = (codeblock, usercodeall) => {
  const lines = codeblock.split('\n');
  if (lines.length === 0) return usercodeall;
  let isFunctionBlock = false;

  if (lines[0].indexOf('function') >= 0 && lines[0].indexOf(' ') !== 0) {
    isFunctionBlock = true;
  }
  if (isFunctionBlock) {
    if (lines[0].indexOf('// INSERTFUNC') >= 0) {
      return insertNewWholeFunction(codeblock, usercodeall, '// INSERTFUNC');
    }
    if (lines[0].indexOf('// REPLACEFUNC') >= 0) {
      return replaceWholeFunction(codeblock, usercodeall);
    }
    // console.log(`possible error in copy code in function block \n ${codeblock}`);
    // return usercode;
  }

  // deal with line by line changes (shouldn't be all new functions any more)

  const newLinesType = [];
  const usercode = usercodeall.split('\n');

     // find in prev element code the start and end line before and after newly inserted lines
  let functionContext = '';
  for (let ni = 0; ni < lines.length; ni++) {
    const newline = lines[ni];
    if (newline.indexOf('function') >= 0) {
      functionContext = getFunctionContext(newline);
    }
    const newLineObj = { lineNo: ni, newInd: ni };
    if (newline.trim().endsWith('// NEW')) {
      newLineObj.lineType = 'INSERT';
    } else if (newline.trim().endsWith('// CHG')) {
      newLineObj.lineType = 'REPLACE';
      newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, '');
    } else {
      newLineObj.lineType = 'SAME';
      if (ni === 0) { newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, ''); } else {
        const pnewLineObj = newLinesType[ni - 1];
        if (pnewLineObj.lineType === 'SAME') {
          const pnewline = lines[ni - 1];
          newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, pnewline);
        } else {
          newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, '');
        }
      }
    }
    newLinesType.push(newLineObj);
  }

  // find in prev element code the start and end line before and after newly inserted lines

  // use unchanged lines in user code to serve as anchor
  let superStartLine = ''; // to be used for appending new inserted lines at the beginning
  for (let ni = 0; ni < lines.length; ni++) {
    let newline = lines[ni];
    console.log(`newline is ${newline}`);
    if (newline.indexOf('//') > 0) {
      newline = newline.substring(0, newline.indexOf('//')).trimRight();
      console.log(`newline is after trim: ${newline}`);
    }
    const newLineObj = newLinesType[ni];
    console.log(`newLineObj is ${JSON.stringify(newLineObj)}`);

    if (newLineObj.lineType !== 'SAME') {
      if (newLineObj.lineType === 'REPLACE') {
        usercode[newLineObj.indInUserCode] = newline;
      } else { // must be a new INSERT
        if (ni === 0) {
          // append this to the new "-1" line that is to be prepended to usercode at the end
          // find this line in user code
          superStartLine += `${newline}`;
          newLineObj.indInUserCode = -1;
        } else {
          // find prev line
          const prevNewLineObj = newLinesType[ni - 1];
          usercode[prevNewLineObj.indInUserCode] += `\n${newline}`;
          newLineObj.indInUserCode = prevNewLineObj.indInUserCode;
        }
      }
    }
  }

  if (superStartLine !== '') {
    superStartLine = `${superStartLine}\n`;
  }
  const newusercodeall = `${superStartLine}${usercode.join('\n')}`;
  return newusercodeall;
};

const getHintCode = (code) => {
  const lines = code.split('\n');
  let newcode = "";
  let intodo = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.indexOf("//TODO") === 0) {
      newcode += `\n${lines[i]}\n`;
      intodo = true;
      continue;
    } else if (line.indexOf("//ENDTODO") === 0) {
      intodo = false;
      continue;
    } else {
      if (intodo) {
        if (line.indexOf("//h") === 0 && line.indexOf("::") > 0) {
          // console.log("found hint line " + line);
          const parts = lines[i].split("::");
          const part0parts = parts[0].split("//");
          newcode += `${part0parts[0]}//[${part0parts[1]}]: ${parts[1]}\n`;
          continue;
        } else if (line.indexOf("::") === 0) {
          continue;
        } else {
          newcode += `${lines[i]}\n`;
        }
      }
    }
  }
  return newcode;
};

// new version: simply
const removeHints = (code) => {
  const lines = code.split('\n');
  let newcode = "";
  let intodo = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // console.log("new line " + line);
    if (line.indexOf("//TODO") === 0) {
      newcode += `${lines[i]}\n`;
      intodo = true;
    } else {
      if (line.indexOf("//ENDTODO") === 0) {
        intodo = false;
      } else {
        if (!intodo) {
          newcode += `${lines[i]}\n`;
        } else {
          if (line.indexOf("//h") === 0 || line.indexOf("::") ==0 ) {

          } else {
            newcode += `${lines[i]}\n`;
          }
        }
      }
    }
  }
  return newcode;
};

const removeHintsOld = (code) => {
  const lines = code.split('\n');
  let newcode = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.indexOf("//h") === 0 && line.indexOf("::") > 0) {
      // console.log("found hint line " + line);
      let step = 1;
      let nextLine = lines[i+step];
      while (nextLine.trim().indexOf("::") === 0) {
        // console.log("nextLine is " + nextLine);
        step ++;
        nextLine = lines[i+step];
      }
      // do not auto hide any line now!!
      step --;
      i += step;
    } else {
      newcode += `${lines[i]}\n`;
    }
  }
  return newcode;
};

const getTestCodeSample = (code) => {
  const lines = code.split('\n');
  let codelines = ''; let foundstart = false;
  for (let i = 2; i < lines.length - 2; i++) {
    const line = lines[i].trimRight();
    const line1 = lines[i - 1].trim();
    const line2 = lines[i - 2].trim().replace(' ', '');
    const linen1 = lines[i + 1].trim();
    const linen2 = lines[i + 2].trim();
    if (line1.indexOf('<pre') >= 0 && line2.indexOf('<p>') >= 0) {
      foundstart = true;
    }
    if (foundstart) {
      codelines += `\n${line}`;
      if (linen1.indexOf('</pre>') >= 0 && linen2.indexOf('</p>') >= 0) {
        break;
      }
    }
  }
  return codelines;
};

const insertHiddenCodeCopy = (content) => {
  let newcontent = '';
  let newcode = "<p class='hiddenCode'>\n";
  const lines = content.split('\n');
  let foundstart = false; let foundEnd = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimRight();
    if (i < 2) {
      newcontent += line;
      newcontent += '\n';
      continue;
    }
    const line1 = lines[i - 1].trim();
    const line2 = lines[i - 2].trim().replace(' ', '');
    let linen1 = ''; let linen2 = '';
    if (i < lines.length - 2) {
      linen1 = lines[i + 1].trim();
      linen2 = lines[i + 2].trim();
    }

    if (line1.indexOf('<pre') >= 0 && line2.indexOf('<p>') >= 0) {
      foundstart = true;
    }

    if (foundstart) {
      if (!foundEnd) {
        if (linen1.indexOf('</pre>') >= 0 && linen2.indexOf('</p>') >= 0) {
          foundEnd = true;
        }
        newcode += line;
        newcode += '\n';
        if (line.trim().indexOf('//') > 0) // "//" comment is ok if it is starting from line start
        { line = line.substring(0, line.indexOf('//')).trimRight(); }
      }
      newcontent += line;
      newcontent += '\n';
      // codelines += `\n${line}`;
    } else { // before found start, simply copy
      newcontent += line;
      newcontent += '\n';
    }
  }

  newcontent += newcode;
  newcontent += '\n</p>';
  return newcontent;
};


const insertCopyLink = (code) => {
  const lines = code.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line1 = lines[i].trim();
    const line2 = lines[i - 1].trim();
    if (line1.indexOf('</p>') >= 0 && line2.indexOf('</pre>') >= 0) {
      lines[i] += '\n<p style="font-style: italic">[Type code above into robot code editor or click <a href="#" onclick="CopyCodeClicked(event)" class="inlinebutton">Copy</a>]\n</p>';
      break;
    }
  }
  return lines.join('\n');
};


class LectureComponent extends React.Component {
  constructor (props) {
    super(props);
    const { lesson } = this.props;
    window.lesson = lesson;
  //   // const { instructionLength, tutorialProgress } = this.props;
  //   // const slideIndex = tutorialProgress * instructionLength;

  //   // this.state = {
  //   //   slideIndex: slideIndex === 0 ? 1 : slideIndex,
  //   //   showHelp: false,
  //   //   listMenu: false,
  //   //   tutorialType: [],
  //   //   tutorialContent: {},
  //   //   scriptLoaded: false
  //   // };
    this.state = {
      isWaitingToGoToNextTutorial: false,
      isGetNextTurorial: false,
      nextScenarioId: null,

    };

    this.handleClickOverlay = this.handleClickOverlay.bind(this);
    this.skipToNextNode = this.skipToNextNode.bind(this);
    
  }

  handleKey(e){
   //console.log(e);

   if (window.location.href.includes("/courses")) return;
   if (window.location.href.includes("/gamesBoard")) return;
   if (window.location.href.includes("/player")) return;

   if (e.keyCode == 32){
    if (document.activeElement.type == "textarea") return;
    if (document.activeElement.type == "submit") return;
    if (document.activeElement.nodeName == "BUTTON") return;
    window.handleClickPlayPause();
   } else if (e.keyCode == 39){
    if (document.activeElement.type == "textarea") return;
    if (document.activeElement.type == "submit") return;
    if (document.activeElement.nodeName == "BUTTON") return;
    window.jumpToNextStep();
   }
  }

  componentWillMount() {

    

    // const script0 = document.createElement('script');
    // script0.src = '/js/syntaxhighlighter.js';
    // script0.async = false;
    // document.body.appendChild(script0);
    // const { lesson = {} } = this.props;
    // if (lesson._id) {
    //   this.updateNextScenarioId(lesson._id);
    // }
  }

  playSpeech(who, words, action) {
    const { userLesson, lesson, slideContent, slide, setPaused } = this.props;
    // play audio!
    var that = this;
    console.log("play speech " + words);


    if (window.inSyncMode) {
      Meteor.call("doSyncClassWords", userLesson._id, window.classToSync, words, (err, res) => {
        if (err) {
          // swal("Error unlocking lesson: " + err.message);
          Bert.alert({
            title: 'Error',
            hideDelay: 4000,
            message: "Error syncing words to class: " + err.message,
            type: 'codeInValidError',
            style: 'growl-bottom-right',
            icon: 'fas fa-warning'
          });   
        } else {
        }
      });
    }

    let lineID = "xxxx";
    if (lesson.slideFileId.startsWith("school_") ) {
      var allraw = RevealRef.getSlideNotes().split("\n");
      for(let k=0; k<allraw.length; k++) {
        const ss = allraw[k];
        if (!ss.includes("#WindowLayoutLE") && !ss.includes("[#") && !ss.includes("#SchoolGrade")  && !ss.includes("#survey") && !ss.includes("#input") && !ss.includes("#quickinput") && !ss.includes("#ID") && !ss.includes("[#") && !ss.includes("#quiz") && !ss.includes("#match") && !ss.includes("#PauseSlide") && !ss.includes("#AwardCoin") && !ss.includes("#quiz") && !ss.includes("#NextFragment")) {
          // this is a script line
          const parts = ss.split("[");
          const parts2 = parts[2].split("]");
          const line = parts2[0];
          if (line == words) {
            lineID = k;
            break;
          }
        }
      }
    }

    let cleanwords = replaceAll(words, "aimx", "aim x");
    cleanwords = replaceAll(cleanwords, "array\\.length - i - 1", "array dot length minus i minus 1");
    cleanwords = replaceAll(cleanwords, "array\\.length - i - 2", "array dot length minus i minus 2");

    cleanwords = replaceAll(cleanwords, "\\-1 block", "minus 1 block");
    cleanwords = replaceAll(cleanwords, "\\+1 block", "plus 1 block");
    cleanwords = replaceAll(cleanwords, "\"-\" sign", "minus sign");
    cleanwords = replaceAll(cleanwords, "\"-\" button", "minus button");

    cleanwords = replaceAll(cleanwords, "60 62 64", "60, 62, 64");
    cleanwords = replaceAll(cleanwords, "or 1234", "or 1 2 3 4");
    cleanwords = replaceAll(cleanwords, "ee i ee i o", "e i e i o");
    cleanwords = replaceAll(cleanwords, "ee i", "e i");
    cleanwords = replaceAll(cleanwords, "Counter2", "Counter 2");
    cleanwords = replaceAll(cleanwords, "mergesort", "merge sort");
    

    cleanwords = replaceAll(cleanwords, " PET", " P E T");
    // cleanwords = replaceAll(cleanwords, " ty\.", " t y.");
    cleanwords = replaceAll(cleanwords, "\"ty\"", " t y");
    cleanwords = replaceAll(cleanwords, "\"PET\"", "P E T");
    cleanwords = replaceAll(cleanwords, "ind1", "I N D 1");
    cleanwords = replaceAll(cleanwords, "ind2", "I N D 2");
    cleanwords = replaceAll(cleanwords, "direct range", "di-rect range");
    cleanwords = replaceAll(cleanwords, "327718824", "3 2 7 7 1 8 8 2 4");
    cleanwords = replaceAll(cleanwords, "\"a\"", "\"A\"");
    cleanwords = replaceAll(cleanwords, "set a to", "set \"A\" to");
    cleanwords = replaceAll(cleanwords, "a is 5", "\"A\" is 5");
    cleanwords = replaceAll(cleanwords, "a and b", "\"A\" and b");
    cleanwords = replaceAll(cleanwords, "a becomes 3", "\"A\" becomes 3");
    cleanwords = replaceAll(cleanwords, "tgame.ai", "t game dot \"A\" I");
    cleanwords = replaceAll(cleanwords, "direct firing range", "di-rect firing range");
    cleanwords = replaceAll(cleanwords, "direct fire range", "di-rect fire range");
    cleanwords = replaceAll(cleanwords, "direct attack range", "di-rect attack range");
    cleanwords = replaceAll(cleanwords, "isAGirl", "is a girl");
    cleanwords = replaceAll(cleanwords, "bestDir", "best dir");
    cleanwords = replaceAll(cleanwords, "should_skip", "should skip");
    cleanwords = replaceAll(cleanwords, "tanks\\.find", "tanks dot find");
    cleanwords = replaceAll(cleanwords, "Object\\.keys", "object dot keys");
    cleanwords = replaceAll(cleanwords, "newc", "new c");
    cleanwords = replaceAll(cleanwords, "newr", "new r");
    cleanwords = replaceAll(cleanwords, "escapeFromDanger", "escape From Danger");
    cleanwords = replaceAll(cleanwords, "isShellBlockedAtPos", "is Shell Blocked At Pos");
    cleanwords = replaceAll(cleanwords, "tankID", "tank ID");
    cleanwords = replaceAll(cleanwords, "shellDirList", "shell dir list");
    cleanwords = replaceAll(cleanwords, "shellXList", "shell x list");
    cleanwords = replaceAll(cleanwords, "shellYList", "shell y list");
    cleanwords = replaceAll(cleanwords, "shellColorList", "shell color list");
    cleanwords = replaceAll(cleanwords, " DR,", " d r, ");
    cleanwords = replaceAll(cleanwords, "user A ", "user 'A' ");
    cleanwords = replaceAll(cleanwords, "A - B", "'A' minus B");
    cleanwords = replaceAll(cleanwords, "10 - 8", "10 minus 8");
    cleanwords = replaceAll(cleanwords, "columnYs", "column y's");
    cleanwords = replaceAll(cleanwords, "ringYs", "ring y's");
    cleanwords = replaceAll(cleanwords, "Click A", "Click 'A'");
    cleanwords = replaceAll(cleanwords, "A\\*", "A.star ");
    cleanwords = replaceAll(cleanwords, "cell A", "cell 'A'");
    cleanwords = replaceAll(cleanwords, "dove-a", "dove 'A'");
    cleanwords = replaceAll(cleanwords, "nestY", "nest y");
    cleanwords = replaceAll(cleanwords, "myPower", "my power");
    cleanwords = replaceAll(cleanwords, "isInMyRange", "is In My Range");
    
    cleanwords = replaceAll(cleanwords, "calculateSurvivalTime", "calculate Survival Time");
    cleanwords = replaceAll(cleanwords, "createAStarGraph", "create A.star graph");
    cleanwords = replaceAll(cleanwords, "getShortestPathCmd", "get shortest path cmd");
    cleanwords = replaceAll(cleanwords, "getShortestPathLength", "get shortest path length");
    cleanwords = replaceAll(cleanwords, "getNearestItemManhattan", "get Nearest Item Manhattan");
    cleanwords = replaceAll(cleanwords, "getNearestItemAStar", "get Nearest Item A.star");
    cleanwords = replaceAll(cleanwords, "getFurthestItemAStar", "get furthest Item A.star");
    
    cleanwords = replaceAll(cleanwords, "createNewGraph", "create New Graph");
    
    cleanwords = replaceAll(cleanwords, "opponentSurvivalTime", "opponent Survival Time");
    cleanwords = replaceAll(cleanwords, "opponentPower", "opponent power");
    cleanwords = replaceAll(cleanwords, "attackOpponent", "attack opponent");
    cleanwords = replaceAll(cleanwords, "attackTank", "attack tank");
    cleanwords = replaceAll(cleanwords, "regeneration", "re generation");
    cleanwords = replaceAll(cleanwords, "regenerate", "re generate");
    cleanwords = replaceAll(cleanwords, "getCrystal", "get crystal");
    cleanwords = replaceAll(cleanwords, "moveAvatar", "move avatar");
    cleanwords = replaceAll(cleanwords, "notBothBlue", "not both blue");
    cleanwords = replaceAll(cleanwords, "t1\\.r", "t1 dot r");
    cleanwords = replaceAll(cleanwords, "t\\.r", "t dot r");
    cleanwords = replaceAll(cleanwords, "isPathBlockedVertical", "is path blocked vertical");
    cleanwords = replaceAll(cleanwords, "getTreeCountAbove", "get tree count above");
    cleanwords = replaceAll(cleanwords, "getTreeCountBelow", "get tree count below");
    // cleanwords = replaceAll(cleanwords, "A\\*", "'A' star");
    cleanwords = replaceAll(cleanwords, "isHomeworkDone", "is homework done");
    cleanwords = replaceAll(cleanwords, "choice A ", "choice 'A' ");
    cleanwords = replaceAll(cleanwords, "Choice A ", "choice 'A' ");
    // cleanwords = replaceAll(cleanwords, "Shot A", "shot A ");
    cleanwords = replaceAll(cleanwords, "superProduct", "super product");
    cleanwords = replaceAll(cleanwords, "superAdd", "super add");
    cleanwords = replaceAll(cleanwords, "8 - 6", "8 minus 6");
    cleanwords = replaceAll(cleanwords, "8 - x", "8 minus x");
    cleanwords = replaceAll(cleanwords, "car1\\.weight", "car 1 dot weight");
    cleanwords = replaceAll(cleanwords, "car2\\.weight", "car 2 dot weight");
    cleanwords = replaceAll(cleanwords, "ResetTable", "reset table");
    cleanwords = replaceAll(cleanwords, "PlaceBallOnTable", "place ball on table");
    cleanwords = replaceAll(cleanwords, "PlaceCueBallFromHand", "place cue ball from hand");
    cleanwords = replaceAll(cleanwords, "ReportEndOfTest", "report end of test");
    cleanwords = replaceAll(cleanwords, "arrayExercise", "array exercise");
    cleanwords = replaceAll(cleanwords, "cmd\\.", "cmd dot ");
    cleanwords = replaceAll(cleanwords, "getEndStateDistance", "get end state distance");
    cleanwords = replaceAll(cleanwords, "calculateEndState", "calculate end state");
    cleanwords = replaceAll(cleanwords, "point A", "point 'A'");
    cleanwords = replaceAll(cleanwords, "path A", "path 'A'");
    cleanwords = replaceAll(cleanwords, "\\.length - 1", " dot length minus 1");
    cleanwords = replaceAll(cleanwords, "\\.length - 2", " dot length minus 2");
    cleanwords = replaceAll(cleanwords, "\\.c - ", " dot c minus ");
    cleanwords = replaceAll(cleanwords, "\\.r - ", " dot r minus ");
    cleanwords = replaceAll(cleanwords, "Tank\\.r", " tank dot r");
    cleanwords = replaceAll(cleanwords, "Tank\\.c", " tank dot c");
    cleanwords = replaceAll(cleanwords, "nearest\\.item", " nearest dot item");
    cleanwords = replaceAll(cleanwords, "lastTankHealth", " last tank health");
    cleanwords = replaceAll(cleanwords, "\\.id", " dot ID ");
    cleanwords = replaceAll(cleanwords, "heroes\\.", " heroes dot ");
    cleanwords = replaceAll(cleanwords, 'other players\\.', 'other players . ');
    cleanwords = replaceAll(cleanwords, "players\\.", " players dot ");
    cleanwords = replaceAll(cleanwords, "damages\\.", " damages dot ");
    cleanwords = replaceAll(cleanwords, "\"id\"", "\"ID\"");
    cleanwords = replaceAll(cleanwords, "healthRegen", "health re jan");
    cleanwords = replaceAll(cleanwords, "regen", "re jan");
    cleanwords = replaceAll(cleanwords, "MyTank\\.specialWeapon\\.", "my tank dot special weapon dot ");
    cleanwords = replaceAll(cleanwords, "MyTank\\.specialPower\\.", "my tank dot special power dot ");
    cleanwords = replaceAll(cleanwords, "MyTank\\.", "my tank dot ");
    // cleanwords = replaceAll(cleanwords, "MyTank\\.specialPower\\.speed", "my tank dot special power dot speed");
    cleanwords = replaceAll(cleanwords, "TODO", "to-do");
    cleanwords = replaceAll(cleanwords, "]\\.c", " dot c");
    cleanwords = replaceAll(cleanwords, "]\\.r", " dot r");
    cleanwords = replaceAll(cleanwords, "]\\.type", " dot type ");
    cleanwords = replaceAll(cleanwords, "]\\.dir ", " dot D I R ");
    cleanwords = replaceAll(cleanwords, "getRandomCommand", "get random command");
    cleanwords = replaceAll(cleanwords, "GetPI", "get Pi");
    cleanwords = replaceAll(cleanwords, "StrengthList", "strength list");
    cleanwords = replaceAll(cleanwords, "getNewCommand", "get new command");
    cleanwords = replaceAll(cleanwords, "4's", "fours");
    cleanwords = replaceAll(cleanwords, "\\|\\|", "OR");
    cleanwords = replaceAll(cleanwords, "isBallBlocked", "is ball blocked");
    cleanwords = replaceAll(cleanwords, "skipIndirect", "skip indirect");
    cleanwords = replaceAll(cleanwords, "getSecondsLeft", "get seconds left");
    cleanwords = replaceAll(cleanwords, "secondsLeft", "seconds left");
    cleanwords = replaceAll(cleanwords, "getKickShotCommand", "get kick shot command");
    cleanwords = replaceAll(cleanwords, "getKickShotCommandVertical", "get kick shot command vertical");
    cleanwords = replaceAll(cleanwords, "getKickShotCommandHorizontal", "get kick shot command horizontal");
    cleanwords = replaceAll(cleanwords, "getBankShotCommand", "get bank shot command");
    cleanwords = replaceAll(cleanwords, "getComboShotCommand", "get combo shot command");
    cleanwords = replaceAll(cleanwords, "getComboShot", "get combo shot");
    cleanwords = replaceAll(cleanwords, "getBankShotCommandVertical", "get bank shot command vertical");
    cleanwords = replaceAll(cleanwords, "getBankShotCommandHorizontal", "get bank shot command horizontal");
    cleanwords = replaceAll(cleanwords, "getKickShot", "get kick shot");
    cleanwords = replaceAll(cleanwords, "getBankShot", "get bank shot");
    cleanwords = replaceAll(cleanwords, "errorInX", "error in x");
    cleanwords = replaceAll(cleanwords, "errorInX2", "error in x 2");
    cleanwords = replaceAll(cleanwords, "errorInY", "error in y");
    cleanwords = replaceAll(cleanwords, "calculateProbability", "calculate probability");
    cleanwords = replaceAll(cleanwords, "calculateCTP", "calculate C T P");
    cleanwords = replaceAll(cleanwords, "Math\\.abs", "math dot a b s ");
    cleanwords = replaceAll(cleanwords, "\"abs\"", "A B S");
    cleanwords = replaceAll(cleanwords, "'abs'", "A B S");
    
    cleanwords = replaceAll(cleanwords, "mirrorBallPos", "mirror ball pos ");
    cleanwords = replaceAll(cleanwords, "mirrorPos", "mirror pos ");
    cleanwords = replaceAll(cleanwords, "TOP_Y", "top y");
    cleanwords = replaceAll(cleanwords, "target_point", "target point");
    cleanwords = replaceAll(cleanwords, "targetBallPos", "target ball pos ");
    cleanwords = replaceAll(cleanwords, "BOTTOM_Y", "bottom y");
    cleanwords = replaceAll(cleanwords, "LEFT_X", "left x");
    cleanwords = replaceAll(cleanwords, "RIGHT_X", "right x");
    cleanwords = replaceAll(cleanwords, "\"0 4 8 12 16 20\"", "0, 4, 8, 12, 16, 20");
    cleanwords = replaceAll(cleanwords, "\"4 8 12 16 20\"", "4, 8, 12, 16, 20");
    cleanwords = replaceAll(cleanwords, "\"4 8 12 16\"", "4, 8, 12, 16");
    cleanwords = replaceAll(cleanwords, "\"1 4 7 10\"", "1, 4, 7, 10");
    cleanwords = replaceAll(cleanwords, "\"5 10 15\"", "5, 10, 15");
    cleanwords = replaceAll(cleanwords, "\"10 5 0 -5\"", "10, 5, 0, -5");

    cleanwords = replaceAll(cleanwords, "\"!==\"", " not equal to ");
    cleanwords = replaceAll(cleanwords, "calculateCutAngle", "calculate cut angle");
    cleanwords = replaceAll(cleanwords, "isSidePocketWithLargeSkew", "is Side Pocket With Large Skew");
    cleanwords = replaceAll(cleanwords, "calculateSidePocketSkew", "calculate side pocket skew ");

    cleanwords = replaceAll(cleanwords, "isPocketBlockedFromBall", " is Pocket Blocked From Ball ");
    cleanwords = replaceAll(cleanwords, "isPocketCutAngleTooBig", " is Pocket Cut Angle Too Big ");
    cleanwords = replaceAll(cleanwords, "redefine", "re-define");
    cleanwords = replaceAll(cleanwords, "\"var\"", "\"varr\"");
    cleanwords = replaceAll(cleanwords, "'var'", "'varr'");
    cleanwords = replaceAll(cleanwords, " var ", " varr ");
    cleanwords = replaceAll(cleanwords, "\"var ", "\"varr ");
    cleanwords = replaceAll(cleanwords, " var,", " varr,");
    //cleanwords = replaceAll(cleanwords, "var ", "varr ");
    cleanwords = replaceAll(cleanwords, " TODO", " to do");
    cleanwords = replaceAll(cleanwords, "p\\.x", "p dot x");
    cleanwords = replaceAll(cleanwords, "p\\.y", "p dot y");
    cleanwords = replaceAll(cleanwords, "getCueBallPlacement", "get Cue Ball Placement");

    cleanwords = replaceAll(cleanwords, "isPocket0Blocked", "is pocket 0 blocked");
    cleanwords = replaceAll(cleanwords, "isPocketBlocked", "is pocket blocked");
    cleanwords = replaceAll(cleanwords, "isPathBlocked", "is Path blocked");

    cleanwords = replaceAll(cleanwords, "IDList\\.length-1", "ID List dot length minus 1");
    cleanwords = replaceAll(cleanwords, "IDList\\.length", "ID List dot length");
    cleanwords = replaceAll(cleanwords, "IDList", "ID List");
    cleanwords = replaceAll(cleanwords, "ball_id", "ball ID");
    cleanwords = replaceAll(cleanwords, "getLebalBallIDs", "get legal ball IDs");
    cleanwords = replaceAll(cleanwords, "ballInfo", "ball info");

    cleanwords = replaceAll(cleanwords, "pocket_id", "pocket ID");
    cleanwords = replaceAll(cleanwords, "\"x: 1\"", "\"x colon 1\"");

    cleanwords = replaceAll(cleanwords, "getTestCommand", "get test command");
    cleanwords = replaceAll(cleanwords, "for-loop", "forloop");
    cleanwords = replaceAll(cleanwords, "For-loop", "forloop");
    cleanwords = replaceAll(cleanwords, "i - 1", "i minus 1");
    cleanwords = replaceAll(cleanwords, "x - 1", "x minus 1");
    cleanwords = replaceAll(cleanwords, "--", "minus minus");
    cleanwords = replaceAll(cleanwords, "]\\.cost", "] dot cost");
    cleanwords = replaceAll(cleanwords, "]\\.name", "] dot name");
    cleanwords = replaceAll(cleanwords, "]\\.health", "] dot health");
    cleanwords = replaceAll(cleanwords, "BallDiameter", "Ball Diameter");
    cleanwords = replaceAll(cleanwords, "Math\\.random", "Math dot random");
    cleanwords = replaceAll(cleanwords, "getRandomNumber", "get Random Number");
    cleanwords = replaceAll(cleanwords, "checkBallDistance", "check Ball Distance");
    cleanwords = replaceAll(cleanwords, "shortestDistance", "shortest Distance");
    cleanwords = replaceAll(cleanwords, "cuebally", "cueball y");
    cleanwords = replaceAll(cleanwords, "cueballx", "cueball x");
    cleanwords = replaceAll(cleanwords, "hspin", "h spin");
    cleanwords = replaceAll(cleanwords, "ballID", " ball ID");
    cleanwords = replaceAll(cleanwords, "pocketID", " pocket ID");
    cleanwords = replaceAll(cleanwords, "BallID", " Ball ID");
    cleanwords = replaceAll(cleanwords, "PocketID", " Pocket ID");
    cleanwords = replaceAll(cleanwords, ">=", " greater than or equal to");
    cleanwords = replaceAll(cleanwords, "<=", " less than or equal to");
    cleanwords = replaceAll(cleanwords, "OR", "or");
    cleanwords = replaceAll(cleanwords, " i-th ", " eyeth ");
    // cleanwords = replaceAll(cleanwords, "\"\\\"", "slash");
    // cleanwords = replaceAll(cleanwords, "targetBallID", "target Ball ID");
    // cleanwords = replaceAll(cleanwords, "targetPocketID", "target Pocket ID");
    cleanwords = replaceAll(cleanwords, "\\.x", " dot x");
    cleanwords = replaceAll(cleanwords, "\\.y", " dot y");
    cleanwords = replaceAll(cleanwords, "\\.length", " dot length");
    cleanwords = replaceAll(cleanwords, "from A", "from 'A'");
    cleanwords = replaceAll(cleanwords, "\\.c", " dot c");
    cleanwords = replaceAll(cleanwords, "createAStarGraph", "create A.Star graph");
    cleanwords = replaceAll(cleanwords, "getShortestPathCmdGreedy", "get shortest path CMD greedy");
    cleanwords = replaceAll(cleanwords, "attackWhiteTank", "attack white tank");
    cleanwords = replaceAll(cleanwords, "MAX_POWER", "max power");
    cleanwords = replaceAll(cleanwords, "attackOpponent", "attack opponent");
    cleanwords = replaceAll(cleanwords, "getClosestItemManhattan", "get closest item Manhattan");
    cleanwords = replaceAll(cleanwords, "getClosestItemAStar", "get closest item A.star");
    //cleanwords = replaceAll(cleanwords, "a", "A");
    cleanwords = replaceAll(cleanwords, "weaponIsBetter", "weapon is better");
    cleanwords = replaceAll(cleanwords, "SPECIAL_WEAPON_TYPES", "special weapon types");
    cleanwords = replaceAll(cleanwords, "WAY4", "way 4");
    cleanwords = replaceAll(cleanwords, "r - 1", "r minus 1");
    cleanwords = replaceAll(cleanwords, "c - 1", "c minus 1");
    cleanwords = replaceAll(cleanwords, "smallestID", "smallest ID");
    cleanwords = replaceAll(cleanwords, "senderID", "sender ID");
    cleanwords = replaceAll(cleanwords, "sendTeamMessage", "send team message");
    cleanwords = replaceAll(cleanwords, "receiveTeamMessage", "receive team message");    
    cleanwords = replaceAll(cleanwords, "ownerID", "owner ID");
    cleanwords = replaceAll(cleanwords, "Array\\.isArray", "Array dot is Array");
    cleanwords = replaceAll(cleanwords, "getTeamBattleTarget", "get team battle target");
    cleanwords = replaceAll(cleanwords, "targetTankID", "target tank ID");
    cleanwords = replaceAll(cleanwords, "handleTankDeath", "handle tank death");
    cleanwords = replaceAll(cleanwords, "MSG_STOP_ATTACK", "MSG stop attack");
    cleanwords = replaceAll(cleanwords, "TGame", "T Game");
    cleanwords = replaceAll(cleanwords, "getTimeLeftInSeconds", "get time left in seconds");
    cleanwords = replaceAll(cleanwords, "inEndGameMode", "in end game mode");
    cleanwords = replaceAll(cleanwords, "dirs", "D I Rs");
    cleanwords = replaceAll(cleanwords, "range\\.find", "range dot find");
    cleanwords = replaceAll(cleanwords, "handleCrystalRemoval", "handle crystal removal");
    cleanwords = replaceAll(cleanwords, "getTankTotalPowers", "get tank total powers");
    cleanwords = replaceAll(cleanwords, "Object\\.values", "object dot values");
    cleanwords = replaceAll(cleanwords, "PlaceTile", "place tile");
    cleanwords = replaceAll(cleanwords, "PlaceTank", "place tank");
    cleanwords = replaceAll(cleanwords, "PlaceCrystal", "place crystal");
    cleanwords = replaceAll(cleanwords, "PlaceWeapon", "place weapon");
    cleanwords = replaceAll(cleanwords, "SetTankProperties", "set tank properties");
    cleanwords = replaceAll(cleanwords, "RemoveAllTanks", "remove all tanks");
    cleanwords = replaceAll(cleanwords, "RemoveAllSprites", "remove all sprites");
    cleanwords = replaceAll(cleanwords, "SendCommandToTank", "send command to tank");
    cleanwords = replaceAll(cleanwords, "ClearMaze", "clear maze");
    cleanwords = replaceAll(cleanwords, "StartEndGameMode", "start end game mode");
    cleanwords = replaceAll(cleanwords, "SetExpectedResult", "set expected result");
    cleanwords = replaceAll(cleanwords, "scratch\\.mit\\.edu", "scratch dot M I T dot E D U");
    cleanwords = replaceAll(cleanwords, "mit\\.edu", "M I T dot E D U");
    cleanwords = replaceAll(cleanwords, "trash-can", "trashcan");

    //////////////////////////////////////////
    /*************** Scratch Basics *********/
    //////////////////////////////////////////

    cleanwords = replaceAll(cleanwords, "bowl-a", "bowl A");

    for(let i = 1; i <= 9; i++) {
      cleanwords = replaceAll(cleanwords, " -"+i, " negative " + i);
    }

    //////////////////////////////////////////
    /*************** Algorithms *************/
    //////////////////////////////////////////

    cleanwords = replaceAll(cleanwords, "O(log(mn))", "O log of M times N");
    cleanwords = replaceAll(cleanwords, "O(logm + logn)", "O log M plus log N");
    cleanwords = replaceAll(cleanwords, "length - 1", "length minus 1");
    cleanwords = replaceAll(cleanwords, "j - 1", "j minus 1");
    cleanwords = replaceAll(cleanwords, "N - 1", "N minus 1");
    cleanwords = replaceAll(cleanwords, "i - 2", "i minus 2");
    cleanwords = replaceAll(cleanwords, "O(N)", "O N");
    cleanwords = replaceAll(cleanwords, "logm", "log m");
    cleanwords = replaceAll(cleanwords, "O(nlogn)", "O N log N");
    cleanwords = replaceAll(cleanwords, "mlogn", "M log N");
    cleanwords = replaceAll(cleanwords, "O(logn)", "O log N");
    cleanwords = replaceAll(cleanwords, "(logn)", "log N");
    cleanwords = replaceAll(cleanwords, "nlogn", "N log N");
    cleanwords = replaceAll(cleanwords, "(n - 1)", "n minus 1");
    cleanwords = replaceAll(cleanwords, "(m - 1)", "m minus 1");
    cleanwords = replaceAll(cleanwords, "(m - i)", "m minus i");
    cleanwords = replaceAll(cleanwords, "middle - 1", "middle minus 1");
    cleanwords = replaceAll(cleanwords, "rectangles\\[0\\]\\.height", "rectangles 0 dot height");
    cleanwords = replaceAll(cleanwords, "XXV", "X X V");
    cleanwords = replaceAll(cleanwords, "IX", "I X");
    cleanwords = replaceAll(cleanwords, "charCounts.values", "char counts dot values");
    cleanwords = replaceAll(cleanwords, "sums\\[end\\] - sums\\[start\\]", "sums end minus sums start");
    
    // console.log("cleanwords " + cleanwords);


    const data = {
      "audioConfig": {
        "audioEncoding": "MP3",
        'effectsProfileId': ['large-automotive-class-device'],
        "pitch": "1.0",
        "speakingRate": 0.9,
      },
      "input": {
        "text": cleanwords
      },
      "voice": {
        "languageCode": "en-US",
        "name": "en-US-Wavenet-F"
      }
    };


    if (who.toUpperCase() == "JOHN") {
      //data.voice.name = "en-GB-Wavenet-B";
      data.voice.name = "en-US-Wavenet-A";
      data.audioConfig.pitch = "3.0";
      data.audioConfig.speakingRate = "1.05";
    } else if (who.toUpperCase() == "ANNIE") {
      //data.voice.name = "en-GB-Wavenet-A";
      data.voice.name = "en-US-Wavenet-E";
      data.audioConfig.pitch = "4.0";
      data.audioConfig.speakingRate = "1.0";
    } else if (who.toUpperCase() == "BINYU") {
      //data.voice.name = "en-GB-Wavenet-A";
      data.voice.name = "en-US-Wavenet-D";
      data.audioConfig.pitch = "0.80";
      data.audioConfig.speakingRate = "0.85";
    }

    if (lesson.package.startsWith("school")) {
      if (lesson.locale == "zh-cn") {
        data.voice.name = "cmn-CN-Wavenet-C";
        data.voice.languageCode = "cmn-CN";
        data.audioConfig.pitch = "1";
        data.audioConfig.speakingRate = "0.85";      
      }
  
      if (slide.LOCALE == "zh-cn") {
        data.voice.name = "cmn-CN-Wavenet-A";
        data.voice.languageCode = "cmn-CN";
        data.audioConfig.pitch = "1.5";
        data.audioConfig.speakingRate = "0.85";      
      }
  
      if (window.currentChosenLocale == "CH") { // ch slides
        data.voice.name = "cmn-CN-Wavenet-C";
        data.voice.languageCode = "cmn-CN";
        data.audioConfig.pitch = "1";
        data.audioConfig.speakingRate = "0.85";     
      } else if (window.currentChosenLocale == "EN") { // ch slides
        data.voice.name = "en-US-Wavenet-D";
        data.audioConfig.pitch = "0.80";
        data.audioConfig.speakingRate = "0.85";    
      }
  
      if (slide.LOCALE == "es") {
        data.voice.name = "es-ES-Standard-A";
        data.voice.languageCode = "es-ES";
        data.audioConfig.pitch = "1.5";
        data.audioConfig.speakingRate = "0.85";      
      }
    }



    const michelleGames = [MIGRATION_CONST.appleharvestGameId, MIGRATION_CONST.algorithmGameId, MIGRATION_CONST.mazeGameId, MIGRATION_CONST.balloonBusterGameId];
    if (michelleGames.includes(lesson.gameId)) {
      data.voice.name = "en-US-Wavenet-F";
      data.audioConfig.pitch = "1.0";
      data.audioConfig.speakingRate = "0.9";
    }

    data.audioConfig.speakingRate *= speechSpeedM;
    

    const now = new Date();
    if (!window.lastGoogleRequest) window.lastGoogleRequest = (new Date()) - 1000;
    if (now - window.lastGoogleRequest < 300) {
      console.log("too many requests!!");
      return;
    }

    //var url = "https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=AIzaSyAouonLf7F9HG9Cg501LoA-4XCHQ3Uyt_s";
    var url = "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyAouonLf7F9HG9Cg501LoA-4XCHQ3Uyt_s";


    // Fires when the currentSound finishes playing.
    window.soundEndFunc = function() {
      console.log("window.soundEndFunc ");
      if (isPaused) return;
      if (!action || action == null || action.indexOf("inputalreadycompleted") > 0) {
        // console.log("on sound end and no action given or action completed: play next script");
        that.playNextScript();
      } else {

        // if it is quizanswer, then wait!
        if (action.indexOf("#quizanswer") >= 0) {
          var r = action.split(" ");
          if (words.indexOf("not correct") > 0) {
            // will simply play next slide and not skipping!
            // console.log("on not correct: play next script");
            that.playNextScript();
          } else {
            // correct
            if (r.length > 1) {
              // check how many slides to skip
              var cnt = Number(r[1].trim());
              var ind = RevealRef.getIndices(); // { h: 0, v: 0, f: 0 }
              ind.v += cnt + 1;
              // console.log("going to slide " + k + " " + slideId);
              const actualSlide = RevealRef.getIndices();
              // console.log("going to slide " + k + " from actual " + JSON.stringify(actualSlide) + ": " + slideId);

              RevealRef.slide(0, ind.v, -1);
              presentSlideUsingNotes();
            } else {
              that.playNextScript();
            }
          }
        } else if (action.indexOf("#code") >= 0) {
          // console.log("#code: play next script");
          that.playNextScript();
        }
      }
    };
    window.JumpFragmentHandler = function() {
      setPaused(false);
      isPaused = false;
      window.soundEndFunc();
    };

    
    const handleData = function (response, isSchool) {
      // const delay = new Date() - requestTime;
      // console.log("got response  " + response);
      // if (delay > 1000) {
      //   debugger;
      // }
      if (window.currentSoundWords == words && window.isplaying && window.currentSound) {
        console.log("already playing " + words);
        window.currentSoundWords = "";
        return;
      }
      if (window.currentSound) {
        // console.log("stop sound 5");
        window.currentSound.unload();
        window.currentSound = null;
      }
      if (isPaused) return;
      console.log("new sound 1");
      if (!window.Howl) {
        const Howler = require('howler');
        window.Howl = Howler.Howl;
      }
      window.isplaying = false;
      if (isSchool) {
        let chURL = "";

        const wordhash = words.hashCode();
        if (slide.LOCALE == "es") {
          chURL = "https://cdn.jsdelivr.net/gh/cake2000/voicefiles/dataes/mp3-azurees-1-text-"+lesson.slideFileId+"-"+slide.ID+"-" + lineID+"-"+wordhash+".mp3";
        } else {

          if (genericcodes.includes(wordhash)) {
            chURL = "https://cdn.jsdelivr.net/gh/cake2000/voicefiles/dataen/mp3-wavenet-0.8-0.7-text-generic-"+wordhash+".mp3";
          } else if (genericcodesch.includes(wordhash)) {
            chURL = "https://cdn.jsdelivr.net/gh/cake2000/voicefiles/data/mp3-x2_xiaoxuan-40-50-text-generic-ch-"+wordhash+".mp3";
          } else {
            if (window.currentChosenLocale == "CH" || slide.LOCALE == "zh-cn" ) {
              // chURL = "https://cdn.jsdelivr.net/gh/cake2000/voicefiles/data/mp3-x2_xiaoxuan-40-50-text-"+lesson.slideFileId+ (lesson.slideFileId.endsWith("_ch") ? "":"_ch") + "-"+slide.ID+"-" + lineID+"-"+wordhash+".mp3";
              chURL = "https://cdn.jsdelivr.net/gh/cake2000/voicefiles/data/mp3-x2_xiaoxuan-40-50-text-"+lesson.slideFileId+ "-"+slide.ID+"-" + lineID+"-"+wordhash+".mp3";
            } else {
              // pure english
              chURL = "https://cdn.jsdelivr.net/gh/cake2000/voicefiles/dataen/mp3-wavenet-0.8-0.7-text-"+lesson.slideFileId+"-"+slide.ID+"-" + lineID+"-"+wordhash+".mp3";
            }
  
          }

        }

        console.log("chURL: " + chURL);
        window.currentSound = new Howl({
          // src: ["data:audio/mp3;base64," + response.audioContent],
          // src: ["https://cdn.jsdelivr.net/gh/cake2000/tgameshare/v3.0/1.nq4"],
          src: [chURL],
          format: ['mp3'],
          autoplay: true,
          loop: false,
          rate: 1,
          onplayerror: function() {
            console.log("play error");
            sound.once('unlock', function() {
              sound.play();
            });
          },
          onplay: function() {
            console.log("playing!");
            window.isplaying = true;
            const dur = window.currentSound.duration();
            let iframe = document.getElementById("avatariframe");
            if (iframe) {
              iframe.contentWindow.postMessage("PlaySilent_"+(dur*0.82), '*');
            }
            iframe = document.getElementById("avatariframees");
            if (iframe) {
              iframe.contentWindow.postMessage("PlaySilent_"+(dur*0.82), '*');
            }
            iframe = document.getElementById("avatariframech");
            if (iframe) {
              iframe.contentWindow.postMessage("PlaySilent_"+(dur*0.82), '*');
            }

          },
          onend: function() {
            console.log("end!");
            let iframe = document.getElementById("avatariframe");
            if (iframe) {
              iframe.contentWindow.postMessage("StopSpeech", '*');
            }
            iframe = document.getElementById("avatariframees");
            if (iframe) {
              iframe.contentWindow.postMessage("StopSpeech", '*');
            }
            iframe = document.getElementById("avatariframech");
            if (iframe) {
              iframe.contentWindow.postMessage("StopSpeech", '*');
            }
          },
          onstop: function() {
            console.log("end!");
            const iframe = document.getElementById("avatariframe");
            if (iframe) {
              iframe.contentWindow.postMessage("StopSpeech", '*');
            }
          },
          onload: function() {
            console.log("loaded!");
          },
          onloaderror: function(id, err) {
            console.log("load error! " + id + " " + err);
          },
        });
  
      } else {
        window.currentSound = new Howl({
          src: ["data:audio/mp3;base64," + response.audioContent],
          // src: ["https://cdn.jsdelivr.net/gh/cake2000/tgameshare/v3.0/1.nq4"],
          // src: ["https://cdn.jsdelivr.net/gh/cake2000/voicefiles/data/mp3-x2_yezi-1-text-school_a_lesson_18_ch-cocogethomeschoola18-1.mp3"],
          // format: ['mp3'],
          // autoplay: true,
          // loop: false,
          onplayerror: function() {
            console.log("play error");
            sound.once('unlock', function() {
              sound.play();
            });
          },
          onplay: function() {
            console.log("playing!");
            window.isplaying = true;
          },
          onload: function() {
            console.log("loaded!");
          },
          onloaderror: function(id, err) {
            console.log("load error! " + id + " " + err);
          },
        });
  
      }
      window.currentSoundWords = words;

      console.log("play sound 1 " + new Date() );
      window.currentSound.play();
      window.currentSound.on('end', window.soundEndFunc);

      setTimeout(() => {

        if (window.dismissScratchOverlay)
          window.dismissScratchOverlay();

        // old way of hard coded
        if (!window.isplaying) {
          console.log("playing error");
          //that.handleClickOverlay();
        }

      }, 3000);
    }

    // const requestTime = new Date();
    // console.log("send voice request  " + requestTime);


    if (window.NoSpeech == 1) return;

    if (lesson.slideFileId.startsWith("school_") ) {
      
      handleData({}, true);

    } else {

      $.ajax(url, {
        data : JSON.stringify(data),
        url: url,
        contentType : 'application/json',
        type : 'POST',
        timeout: 1500,
        success: function(r) {
          handleData(r);
        },
        error: function(){
          console.log("error in tts!");
          // try again
          $.ajax(url, {
            data : JSON.stringify(data),
            url: url,
            contentType : 'application/json',
            type : 'POST',
            timeout: 2500,
            success: function(r) {
              handleData(r);
            },
            error: function(){
              console.log("error in tts again!!");

              // try again without timeout!

              $.ajax(url, {
                data : JSON.stringify(data),
                url: url,
                contentType : 'application/json',
                type : 'POST',
                timeout: 3500,
                success: function(r) {
                  handleData(r);
                },
                error: function(){
                  console.log("error in tts again 2!!");
                  // try last time without timeout!
                  $.ajax(url, {
                    data : JSON.stringify(data),
                    url: url,
                    contentType : 'application/json',
                    type : 'POST',
                    success: function(r) {
                      handleData(r);
                    }
                  });
                },
              });
            },
          });
        },
      });

    }



  }

  moveToAfterInput() {
    for (let k=0; k<AllScripts.length; k++) {
      const s = AllScripts[k];
      if (s.indexOf("#quickinput") == 0 || s.indexOf("#input") == 0 || s.indexOf("#survey") == 0 || s.indexOf("#quiz") == 0 ) {
        currentScript = k;
        return;
      }
    }
  }

  updateQuizResultScript(correctAnswer, userAnswer, isCompleted) {
    for (let k=0; k<AllScripts.length; k++) {
      const s = AllScripts[k];
      if (s.toLowerCase().indexOf("#showquizresult") >= 0) {
        let news = "";
        if (correctAnswer.toLowerCase().trim() == userAnswer.toLowerCase().trim()) {
          var choices = ["Well done", "Terrific", "That's correct", "Way to go", "Bravo", "You are the best","Not bad", "Excellent", "Marvelous", "Wonderful", "I knew you had it in you", "Awesome", "Remarkable", "Sweet", "I'm impressed", "You're very talented", "Magnificent",  "Brilliant", "Right on", "Great job", "You rock", "Phenomenal", "Exceptional", "Keep up the good work", "Fantastic work", "Very good", "Stupendous", "It couldn't be better", "Good for you", "Spectacular work", "How extraordinary", "You are a winner", "Great effort", "You are a genius", "You are sharp", "You've earned my respect", "Outstanding effort", "Top notch", "Good choice"];

          if (window.currentChosenLocale == "CH") {
            choices = ["太棒了", "很好", "完全正确", "你真厉害", "做的好", "你真是个天才", "向你致敬", "我很佩服你", "了不起", "你太优秀了", "你太有才了", "你做的很好", "太漂亮了", "你的努力没有白费", "你越做越好了"];
          }
          const ind = Math.floor((Math.random() * choices.length));
          // news = choices[ind] + ", #SN!";
          news = choices[ind] + "!";          
          if (!isCompleted) {
            this.doCoinAward(10);
          }

        } else {
          if (window.currentChosenLocale == "CH") {
            news = "很可惜, 正确的答案是 " + correctAnswer + "!";
          } else {
            news = "Sorry, the correct answer is " + (correctAnswer == "A" ? "'A'" : correctAnswer) + "!";
          }
        }
        AllScripts[k] = "[0] [" + news + "]";
        return;
      }
    }
  }

  updateQuickInputResultScript(isCompleted) {
    let isExtraCredit = false;
    for (let k=0; k<AllScripts.length; k++) {
      const s = AllScripts[k];
      if (s.toLowerCase().indexOf("extra credit") >= 0) isExtraCredit = true;
      if (s.toLowerCase().indexOf("#showquickinputresult") >= 0) {
        let news = "";
        const choices = ["Well done", "Terrific", "That's correct", "Way to go", "Bravo", "You are the best","Not bad", "Excellent", "Marvelous", "Wonderful", "I knew you had it in you", "Awesome", "Remarkable", "Sweet", "I'm impressed", "You're very talented", "Magnificent", "Brilliant", "Right on", "Great job", "You rock", "Phenomenal", "Exceptional", "Keep up the good work", "Fantastic work", "Very good", "Stupendous", "It couldn't be better", "Good for you", "Spectacular work", "How extraordinary", "You are a winner", "Great effort", "You are a genius", "You are sharp", "You've earned my respect", "Outstanding effort", "Top notch"];
        const ind = Math.floor((Math.random() * choices.length));
        // news = choices[ind] + ", #SN!";
        news = choices[ind] + "!";

        if (!isCompleted) {
          if (isExtraCredit) {
            this.doCoinAward(200);
          } else if (hintClicked) {
            if (!solutionClicked) {
              this.doCoinAward(10);
            } else {
              this.doCoinAward(5);
            }
          } else {
            this.doCoinAward(10);
          }
        }
        AllScripts[k] = "[0] [" + news + "]";
        return;
      }
    }
  }


  doCreateCoinSound() {
    if (!window.Howl) {
      const Howler = require('howler');
      window.Howl = Howler.Howl;
    }

    if (!window.coinSound) {
      window.coinSound = new Howl({ src: ['/sounds/newcoin.mp3'], volume: 0.2 });
    }

    if (!window.collectCoinSound) {
      window.collectCoinSound = new Howl({ src: ['/sounds/WinMoney.mp3'], volume: 0.2 });
    }
  }

  showCoinAward(count) {
    $('#goldcoinsforlecture').css('display', 'flex');
    document.getElementById('goldcoincountlabel').innerHTML = "+" + (count);
  }

  showTestScore(score) {
    $('#scoreforlecture').css('display', 'flex');
    document.getElementById('scorelabel').innerHTML = "Score: " + score;
  }

  doCoinAward(count, hideGold = true) {
    const that = this;
    if (!window.Howl) {
      const Howler = require('howler');
      window.Howl = Howler.Howl;
    }
    if (!window.coinSound) {
      window.coinSound = new Howl({ src: ['/sounds/newcoin.mp3'], volume: 0.2 });
    }
    let steps = Math.min(count, 10);
    const stepSize = count / steps;

    document.getElementById('goldcoincountlabel').innerHTML = "";
    $('#goldcoinsforlecture').css('display', 'flex');
    for (let k=1; k<=steps; k++) {
      setTimeout(() => {
        window.coinSound.play();
        document.getElementById('goldcoincountlabel').innerHTML = "+" + Math.round(stepSize*k);
      }, 100 * k);
    }

    setTimeout(() => {
      window.coinSound.stop();
      if (hideGold) {
        $('#goldcoinsforlecture').hide();
      }

      Meteor.call('doAwardCoins', count);

      that.highLightUserCoin();
    }, 1500);

  }

  highLightUserCoin() {
    $('#goldcoincountuser').neonText({
      textColor:'white',
      textSize:'25pt',
      neonHighlight:'gold',
      neonHighlightColor:'#008000',
      neonHighlightHover:'#FFFF00',
      neonFontHover:'white'
    });

    if (!window.Howl) {
      const Howler = require('howler');
      window.Howl = Howler.Howl;
    }
    if (!window.collectCoinSound) {
      window.collectCoinSound = new Howl({ src: ['/sounds/WinMoney.mp3'], volume: 0.3 });
    }

    window.collectCoinSound.play();

    setTimeout(()=>{
      $('#goldcoincountuser').css('text-shadow', 'none').css('text-color', 'gold');
      window.collectCoinSound.stop();
    }, 2000);

  }

  playNextScript() {
    const { lesson, userLesson, slide } = this.props;
    if (isPaused) return;
    const that = this;
    const user = Meteor.user();

    

    if (user && user.syncMode == "Sync") {
      return;
    }

    //updateButtons(PRESENTING_MODE);
    currentScript ++;
    // console.log("playNextScript script: " + currentScript);
    if (window.currentSound) {
      window.currentSound.unload();
      window.currentSound = null;
    }
    if (currentScript >= AllScripts.length  || ( AllScripts[currentScript].indexOf("#quickinput") >= 0 &&  slide.TYPE == "input" &&  slide.NODE == "extracredit"  )     ) {


      // if (slide.TYPE.toLowerCase() == "hint") {
      //   console.log("playNextScript do not auto next if in hint or coding page");
      //   return;
      // }
      if (slide.TYPE.toLowerCase() == "hint" || slide.TYPE.toLowerCase() == "coding" || slide.TYPE.toLowerCase() == "solution") {
        // const log = this.props.userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));
        if (window.testCondition !== "" && slide.NODE != "extracredit") {
          // console.log("playNextScript do not auto next if in hint or coding page and test not done");

          Bert.alert("Please solve the current test before continuing!", 'danger', 'growl-bottom-right');          
          return;
        }
      }


      if (slide.TYPE.toLowerCase() == "bilingualtime" ) {
        Bert.alert("Please click the 'Chinese', 'Spanish' or 'Skip' button to continue!", 'danger', 'growl-bottom-right');          
        return;
      }

      if (slide.NODE.toLowerCase() == "bilingualtime" ) {
        if (window.testCondition == "") {
          that.skipToNextNode();
          return;
        }

        Bert.alert("Please complete the puzzle or click the 'Skip' button to continue!", 'danger', 'growl-bottom-right');          
        return;
      }

      // console.log("playNextScript call autoPlayNextSlide ");

      // waiting 2 seconds before closing current slide
      // const timeout = ["q0","q1","q2","q3"].includes(slide.TYPE) ? 3000 : 2000;
      // window.autoPlayNextTimer = setTimeout(()=>{
        $("#codeSolution").hide();
        Meteor.call('autoPlayNextSlide', userLesson._id);
        Meteor.call('newLessonUpdateProgress', userLesson._id, (err) => {
          if (err) {
            console.log('err', err);
          }
        });

      // }, timeout);
      //presentNextSlide();
      return;
    }
    //document.getElementById('transcriptlabel').innerHTML = "";
    var s = AllScripts[currentScript];
    // console.log("LC: play next script: " + currentScript + " " + s);
    // if it is the input line, then pause and wait if not completed, otherwise jump over
    if (s.indexOf("#input") == 0 || s.indexOf("#quickinput") == 0 || s.indexOf("#survey") == 0 || s.indexOf("#quiz") == 0 || s.indexOf("#match") == 0 ) {
      let completedInput = "";
      for (let k=0; k<userLesson.slideVisitLog.length; k++) {
        const log = userLesson.slideVisitLog[k];
        if (log.slideId == userLesson.currentSlideId) {
          if (log.completed) {
            completedInput = log.input;
          }
          break;
        }
      }
      if (completedInput !== "") {
        // already satisifed!
        this.playNextScript();
      } else {
        // would wait for user to click button or press Enter to trigger next step
        if (s.indexOf("#survey") == 0 || s.indexOf("#quiz") == 0 ) {
          document.getElementById('transcriptlabel').innerHTML = "";
          setTimeout(() => {
            if (window.currentChosenLocale == "CH") {
              document.getElementById('transcriptlabel').innerHTML = "请选择一个按钮。";
            } else {
              document.getElementById('transcriptlabel').innerHTML = "Please click a choice to continue.";
            }
          }, 400);
          // currentScript --;
          // that.playSpeech("Lisa", "Please make a selection.");
        }

        if (s.indexOf("#input") == 0) {
          document.getElementById('transcriptlabel').innerHTML = "";
          setTimeout(() => {
            document.getElementById('transcriptlabel').innerHTML = "Please type your input and press ENTER to continue.";
          }, 400);
        } else if (s.indexOf("#quickinput") == 0) {
          document.getElementById('transcriptlabel').innerHTML = "";
          setTimeout(() => {
            document.getElementById('transcriptlabel').innerHTML = "Please type your input and click 'submit'.";
          }, 400);
        } else if (s.indexOf("#match") == 0) {
          document.getElementById('transcriptlabel').innerHTML = "";
          setTimeout(() => {
            if (window.currentChosenLocale == "CH") {
              document.getElementById('transcriptlabel').innerHTML = "请点击左边和右边相对应的图片或文字。";
            } else {
              document.getElementById('transcriptlabel').innerHTML = "Please click matching shapes or text between left and right.";
            }
          }, 400);
        }
      }

      return;
    }

    if (s.indexOf("#ShowTestScore") >= 0) {
      console.log("ShowTestScore : ");

      const logs = this.props.userLesson.slideVisitLog;
      const processedCodingID = {};
      let score = 0;
      for (let k=0; k<logs.length; k++) {
        const log = logs[k];
        if (log.slideType.toLowerCase().indexOf("q") == 0) {
          if (log.answer.toUpperCase() == log.input.toUpperCase()) {
            score += 4;
            console.log("[" + k + "] adding 4 for " + log.slideId);
          }
        } else if (log.slideType.toLowerCase() == "input") {

          let oneScore = 4;
          for (let j=0; j<log.attempt.length; j++) {
            const att = log.attempt[j];
            if (att.code == "ACTION_CLICK_HINT") {
              oneScore = 2;
            } else if (att.code == "ACTION_CLICK_ANSWER") {
              oneScore = 0;
              break;
            }
          }
          score += oneScore;
          console.log("[" + k + "] adding " + oneScore + " for " + log.slideId);
        } else if (log.slideType == "coding") {
          for (let j=0; j<log.attempt.length; j++) {
            const att = log.attempt[j];
            if (att.result == "Test passed!") {
              score += 6;
              console.log("[" + k + "] adding " + 6 + " for " + log.slideId);
              processedCodingID[log.slideId] = 1;
              break;
            }
          }
        } else if (log.slideType == "hint") {
          const ids = log.slideId.split("_");
          if (processedCodingID[ids[0]]) {

          } else {
            for (let j=0; j<log.attempt.length; j++) {
              const att = log.attempt[j];
              if (att.result == "Test passed!") {
                score += 3;
                console.log("[" + k + "] adding " + 3 + " for " + log.slideId);
                processedCodingID[ids[0]] = 1;
                break;
              }
            }
          }
        } else if (log.slideType == "solution") {
          // no points any way
        } 
      }
      that.showTestScore(score);
      that.playNextScript();
      return;
    }

    if (s.indexOf("#AwardCoin") >= 0) {
      console.log("award coin : ");
      const log = this.props.userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));
      var ap = s.split(" ");
      if (!log.completed) {

        Meteor.call('setTestPassed', userLesson._id, 0, userLesson.currentSlideId, () => {
          setTimeout(()=>{
            that.doCoinAward(Number(ap[1]), false);
          }, 100);

          if (log.slideType != "solution") {
            // setTimeout(()=>{
            //   that.playNextScript();
            // }, 2500);
          }
        });

      } else {
        that.showCoinAward(Number(ap[1]));
        // that.playNextScript();
      }
      return;
    }


    // console.log("next script: " + s);
    s = replaceAll(s, "\\]  \\[", "] [");
    s = replaceAll(s, "\\]   \\[", "] [");
    var p = s.split("] [");
    var timing = cleanStr(p[0]);
    var who = "Lisa";
    if (lesson.package == 'schoolA' || lesson.package == 'schoolB' || lesson.package == 'schoolC') {
      who = "BinYu";
    }
    if (timing.indexOf("-") > 0) {
      var q = timing.split("-");
      timing = q[0];
      who = q[1];
    }
    
    if (currentScript == 0) {
      // add 1 second to first line
      timing = Number(timing) + 1;
    }

    var words = "";
    if (p[0].trim().toLowerCase() == "#pauseslide")
      words = p[0];
    else
      words = cleanStr(p[1]);

    if (window.NoSpeech == 1) timing = 0;

    window.nextSpeechTimer = setTimeout(() => {
      if (isPaused) return;
      if (words == "#WindowLayoutLE") {
        window.switchLayout("LE");
        that.playNextScript();
        return;
      }
      if (words == "#NextFragment") {

        // need to check if this is after quiz, and quiz is not answered yet
        const log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));
        if (["q1", "q2", "q3", "q0"].includes(log.slideType.toLowerCase()) && !log.completed) {
          // if this fragment is before "#quiz", then don't show this fragment yet
          for (let j=0; j<currentScript; j++) {
            const ss = AllScripts[j];
            if (ss.includes("#quiz")) {
              // debugger;
              return;
            }
          }
        }

        RevealRef.nextFragment();
        // console.log("on #NextFragment: play next script");
        that.playNextScript();
        return;
      }
      if (words.trim().toLowerCase() == "#pauseslide") {
        if (isPaused) return;
        currentScript++;
        that.handleClickOverlay();
        return;
      }

      words = words.replace("#SN", getCalledName(user));
      words = words.replace("#SchoolGrade", getSchoolGrade(user));
      if (words.indexOf("#JavaScriptLevel") >= 0) {
        words = words.replace("#JavaScriptLevel", JSLevelDes[getJSLevel(user)]);
      }
      currentAction = null;
      if (p.length > 2) {
        let completedInput = "";
        for (let k=0; k<userLesson.slideVisitLog.length; k++) {
          const log = userLesson.slideVisitLog[k];
          if (log.slideId == userLesson.currentSlideId) {
            if (log.completed) {
              completedInput = log.input;
            }
            break;
          }
        }
        currentAction = cleanStr(p[2]);
        if (completedInput !== "") {
          currentAction += " || " + completedInput + " || inputalreadycompleted";

        }
      }

      if (document.getElementById('transcriptlabel'))
        document.getElementById('transcriptlabel').innerHTML = words;

      // use wavenet to generate audio
      that.playSpeech(who, words);

      // update buttons right away
      // if (currentAction) {
      //   if (currentAction.indexOf("#input") >= 0) { // #input means type in a string variable to be saved in profile
      //     updateButtons(USER_INPUT_MODE, currentAction);
      //   } else if (currentAction.indexOf("#quiz") >= 0) { // #quiz means user selects one choice and there is only one correct answer
      //     var r = currentAction.split(" ");
      //     var s = r[0].trim().split("_"); // how many options in the survey
      //     updateButtons(QUIZ_MODE, Number(s[1]));
      //   } else if (currentAction.indexOf("#survey") >= 0) { // #survey means user selects a choice variable to be saved in profile, similar to #input
      //     var r = currentAction.split("||");
      //     updateButtons(SURVEY_MODE, currentAction);
      //   }
      // }
    }, 1000 * Number(timing));
  }

  presentSlideUsingNotes() {
    const { userLesson, slideContent, setPaused } = this.props;
    const slide = slideContent.slideInfo.find(e => (e.ID == userLesson.currentSlideId));
    const that = this;
    var iframes = document.getElementById('slides').getElementsByTagName('iframe');
    if (!iframes) return;
    var iframe = iframes[0];
    if (!iframe) return;
    if (!slide) return;
    if (!iframe.contentWindow) return;
    if (!iframe.contentWindow.Reveal) return;
    if (!iframe.contentWindow.Reveal.getSlideNotes) return;
    // if (!iframe.contentWindow.Reveal.getSlideNotes()) return;





    if (!$(".lessonPageBlock").parent().is(":visible")) {
      return;
    }


    if (!RevealRef || RevealRef != iframe.contentWindow.Reveal || !RevealRef.getSlideNotes()) {
      try {
        if (iframe.contentWindow.Reveal && iframe.contentWindow.Reveal.getSlideNotes()) {
          RevealRef = iframe.contentWindow.Reveal;
        } else {
          return;
        }
      } catch (e) {
        return;
      }
    }
    var rawscripts = RevealRef.getSlideNotes().split("\n");

    // console.log("LC: present slides");

    isPaused = false;
    setPaused(isPaused);

    // console.log("newLessonUpdateProgress " + userLesson._id);
    // Meteor.call('newLessonUpdateProgress', userLesson._id, (err) => {
    //   if (err) {
    //     console.log('err', err);
    //   }
    // });

    // console.log("LC: getting slidecontent for " + userLesson.currentSlideId + " window id " + window.currentSlideID);

    if (window.setWindowLayout) window.setWindowLayout(slide);

    hintClicked = false;
    solutionClicked = false;

    AllScripts = [];

    
    // console.log("LC: got rawscripts " + JSON.stringify(rawscripts));

    // verify the right slide has been loaded
    if (!(rawscripts[0].includes("//#ID") && rawscripts[0].includes(userLesson.currentSlideId))) {
      if (this.gotoUserCurrentSlide) this.gotoUserCurrentSlide();
      return;
    }


    // console.log("LC: rawscripts[0] " + rawscripts[0] + " includes id " + userLesson.currentSlideId);


    let noInput = true;

    $('#goldcoinsforlecture').hide();
    $('#scoreforlecture').hide();
    
    this.showHideHintButton();
    this.showHideCodeSolution();
    this.updateMatchObjectStyles();
    if (window.moveToAfterTimer) {
      clearTimeout(window.moveToAfterTimer);
    }
    window.moveToAfterTimer = null;



    // setup test conditions

    const log = this.props.userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));

    window.testCondition = "";

    if (slide.TYPE.toLowerCase() == "coding") {
      if (slide.TESTCONDITION != "" && !log.completed) {
        window.testCodeCondition = slide.TESTCONDITION;
        window.testCondition = slide.TESTCONDITION;
      } else {
        window.testCondition = "";
        window.testCodeCondition = "";
      }
    } else if (slide.TYPE.toLowerCase() == "hint" || slide.TYPE.toLowerCase() == "solution") {
      // find corresponding coding slide
      const p = userLesson.currentSlideId.split("_");
      const codingSlideId = p[0];
      const log2 = this.props.userLesson.slideVisitLog.find(e => (e.slideId == codingSlideId));
      const slide2 = slideContent.slideInfo.find(e => (e.ID == log2.slideId));
      if (slide2.TESTCONDITION != "" && !log2.completed) {
        window.testCodeCondition = slide2.TESTCONDITION;
        window.testCondition = slide2.TESTCONDITION;
      } else {
        window.testCondition = "";
        window.testCodeCondition = "";
      }

    } else if (slide.TYPE.toLowerCase() == "endoflesson") {
      if (slide.TITLE.toLowerCase().includes("homework")) {
        rawscripts.push(`[1] [Thank you for completing this homework!]`);
      } else {
        rawscripts.push(`[1] [That's all for this lesson!]`);
      }
      //rawscripts.push(`Your award is ${count} coins.`);
    }

    for (let k=0; k<rawscripts.length; k++) {
      var ss = rawscripts[k].trim();
      if (ss.trim() == "") continue;
      if (ss.indexOf("////notes") >= 0) break;
      let completedInput = "";
      let isCompleted = false;
      if (ss != "" && ss.indexOf("//#ID") < 0) {
        if (ss.toLowerCase().indexOf("#input") == 0 || ss.toLowerCase().indexOf("#quickinput") == 0 || ss.toLowerCase().indexOf("#survey") == 0 || ss.toLowerCase().indexOf("#quiz") == 0 || ss.toLowerCase().indexOf("#match") == 0 ) {
          // show inputs
          noInput = false;

          for (let k=0; k<userLesson.slideVisitLog.length; k++) {
            const log = userLesson.slideVisitLog[k];
            if (log.slideId == userLesson.currentSlideId) {
              if (log.completed) {
                isCompleted = true;
                completedInput = log.input;
              }
              break;
            }
          }
          if (completedInput !== "") {
            ss += " || " + completedInput + " || inputalreadycompleted";
          }

          const newss = ss;
          setTimeout(()=>{
            if (newss.indexOf("#input") >= 0) { // #input means type in a string variable to be saved in profile
              updateButtons(USER_INPUT_MODE, newss);
            } else if (newss.indexOf("#quickinput") >= 0) { // #input means type in a string variable to be saved in profile
              updateButtons(QUICK_INPUT_MODE, newss);
              if (completedInput !== "") {
                that.updateQuickInputResultScript(true);
              }
            } else if (newss.indexOf("#quiz") >= 0) { // #quiz means user selects one choice and there is only one correct answer
              // var r = newss.split(" ");
              // var s = r[0].trim().split("_"); // how many options in the survey
              // updateButtons(QUIZ_MODE, Number(s[1]));
              updateButtons(SURVEY_MODE, newss);
              if (completedInput !== "") {
                const parts = newss.split("||");
                that.updateQuizResultScript(parts[2].trim(), completedInput, true);
              }
            } else if (newss.indexOf("#match") >= 0) { // #quiz means user selects one choice and there is only one correct answer

              // if (completedInput !== "") {
              //   const parts = newss.split("||");
              //   that.updateQuizResultScript(parts[1].trim(), completedInput.trim(), true);
              // } else {

              // }

            } else if (newss.indexOf("#survey") >= 0) { // #survey means user selects a choice variable to be saved in profile, similar to #input
              updateButtons(SURVEY_MODE, newss);
            }
          },1000);
        } else if (ss.indexOf("#STARTROBOTCODE") >= 0 ) {
          localRobotStartCode = "";
          k ++;
          var ss1 = rawscripts[k].trim();
          while (ss1.indexOf("#ENDROBOTCODE") < 0) {
            localRobotStartCode += ss1 + "\n";
            k ++;
            ss1 = rawscripts[k].trim();
          }
          continue;
        } else if (ss.indexOf("#STARTTESTSCRIPT") >= 0 ) {
          localTestScript = "";
          k ++;
          var ss1 = rawscripts[k].trim();
          while (ss1.indexOf("#ENDTESTSCRIPT") < 0) {
            localTestScript += ss1 + "\n";
            k ++;
            ss1 = rawscripts[k].trim();
          }
          continue;
        } else if (ss.indexOf("#STARTROBOTCODEANSWER") >= 0 ) {
          localRobotCodeAnswer = "";
          k ++;
          var ss1 = rawscripts[k].trim();
          while (ss1.indexOf("#ENDROBOTCODEANSWER") < 0) {
            localRobotCodeAnswer += ss1 + "\n";
            k ++;
            ss1 = rawscripts[k].trim();
          }
          continue;
        } else if (ss.indexOf("#STARTTESTSCRIPTANSWER") >= 0 ) {
          localTestScriptAnswer = "";
          k ++;
          var ss1 = rawscripts[k].trim();
          while (ss1.indexOf("#ENDTESTSCRIPTANSWER") < 0) {
            localTestScriptAnswer += ss1 + "\n";
            k ++;
            ss1 = rawscripts[k].trim();
          }
          continue;
        }
        if (ss.indexOf("#match") == 0) {
          if (!isCompleted) {
            AllScripts.push(ss);
            AllScripts.push("#showmatchresult");
          } else {
            // mark them as solved
            $(iframe.contentDocument).find(".quizclassA").parent().addClass("solvedobjectA");
            $(iframe.contentDocument).find(".answerclassA").parent().addClass("solvedobjectA");
            $(iframe.contentDocument).find(".quizclassB").parent().addClass("solvedobjectB");
            $(iframe.contentDocument).find(".answerclassB").parent().addClass("solvedobjectB");
            $(iframe.contentDocument).find(".quizclassC").parent().addClass("solvedobjectC");
            $(iframe.contentDocument).find(".answerclassC").parent().addClass("solvedobjectC");
            $(iframe.contentDocument).find(".quizclassD").parent().addClass("solvedobjectD");
            $(iframe.contentDocument).find(".answerclassD").parent().addClass("solvedobjectD");
          }
        } else {
          AllScripts.push(ss);
        }
        if (ss.indexOf("#quiz") == 0) {
          AllScripts.push("#showquizresult");
        }
        if (ss.indexOf("#quickinput") == 0) {
          AllScripts.push("#showquickinputresult");
        }
      }

      if (noInput) {
        updateButtons(PRESENTING_MODE);
      }
    }

    // always pause at the end?
    AllScripts.push("#PauseSlide");

    // console.log("LC: AllScripts " + AllScripts);
    currentScript = -1;
    // console.log("on -1: play next script");
    this.playNextScript();
  }

  handleUserClickHintButton(e) {
    const {userLesson, setPaused} = this.props;
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    isPaused = false;
    setPaused(false);
    Meteor.call('handleHintButtonClick', userLesson._id);
  }

  handleUserInputClick(e) {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  }

  handleKeyOverlay(e) {
    // if(e.which == 32) {
    //   this.handleClickOverlay();
    // }
  }

  handleClickOverlay() {
    const {setPaused} = this.props;
    let btn = "";
    if (window.autoPlayNextTimer) {
      clearTimeout(window.autoPlayNextTimer);
    }

    if (window.nextSpeechTimer) {
      clearTimeout(window.nextSpeechTimer);
    }

    if (isPaused) {
      isPaused = !isPaused;
      setPaused(isPaused);
      if (window.currentSound) {
        if (!window.currentSound.playing()) {
          console.log("play sound 2");
          window.currentSound.play();
        }
      } else {
        // replay previous one
        if (currentScript >= 0)
          currentScript --;
        this.playNextScript();
      }
      $("#playButton").show();
      $("#pauseButton").hide();
      btn = "#playButton";
    } else {
      isPaused = !isPaused;
      setPaused(isPaused);
      if (window.currentSound) {
        // console.log("stop sound 2");
        window.currentSound.unload();
        window.currentSound = null;
      }
      $("#pauseButton").show();
      $("#playButton").hide();
      btn = "#pauseButton";
    }
    $(btn).css({width: '40px', marginLeft: '-20px', opacity: '0'});

    $(btn).animate({width: '80px', marginLeft: '-40px', opacity: '0.6'}, 100, "linear", function() {
      $(btn).animate({width: '120px', marginLeft: '-60px', opacity: '0'}, 500, "linear");
    });



  }

  setTestPassed(award, passingSlideId) {
    const { userLesson, setPaused , slide} = this.props;
    const that = this;
    window.testCondition = ''; // so at least the same condition is not tested again
    window.testCodeCondition = '';
    window.testConditionInd = '';
    window.testCodeSample = '';

    Meteor.call('setTestPassed', userLesson._id, award, passingSlideId, () => {

      // set local db to be passed as well
      // for (let j=0; j<userLesson.slideVisitLog.length; j++) {
      //   if (userLesson.slideVisitLog[j].slideId == userLesson.currentSlideId) {
      //     const ind = 'slideVisitLog.' + j + ".completed";
      //     console.log("setTestPassed on client side ind is " + ind);
      //     const opt = {};
      //     opt[ind] = true;
      //     UserLesson.update({_id: userLesson.currentSlideId}, {$set: opt});
      //     break;
      //   }
      // }

      isPaused = false;
      setPaused(isPaused);
      if (slide.TYPE.toLowerCase() != "solution" && slide.NODE !== "bilingualtime") {
        that.playNextScript();
      }
      $("#codeSolution").hide();

      if (slide.NODE == "bilingualtime") {
        that.skipToNextNode();
      } else {
        //Meteor.call('autoPlayNextSlide', userLesson._id);    
      }


    });

  }

  getTestAward() {
    const { userLesson, lesson, slide, slideContent, setPaused } = this.props;
    let award = 50;
    let idroot = userLesson.currentSlideId;
    if (idroot.includes("_")) {
      const p = idroot.split("_");
      idroot = p[0];
    }
    
    for (let k=0; k<userLesson.slideVisitLog.length; k++) {
      const log = userLesson.slideVisitLog[k];
      if (log.slideId.includes(idroot)) {
        // new change! so long as don't look at answer, hint doesn't lose coins!
        if (log.slideType == "solution") {
          award = 25;
        }
        // if (log.slideId.includes("_h1")) {
        //   award = Math.min(award, 35);
        // }

        // if (log.slideId.includes("_h2")) {
        //   award = Math.min(award, 25);
        // }

        // if (log.slideId.includes("_h3")) {
        //   award = Math.min(award, 20);
        // }

        // if (log.slideId.includes("_h4")) {
        //   award = Math.min(award, 20);
        // }

        // if (log.slideId.includes("_h5")) {
        //   award = Math.min(award, 20);
        // }

        // if (log.slideId.includes("_h6")) {
        //   award = Math.min(award, 20);
        // }

        // if (log.slideId.includes("_h7")) {
        //   award = Math.min(award, 20);
        // }

        // if (log.slideId.includes("_h8")) {
        //   award = Math.min(award, 20);
        // }

        if (log.slideNode && log.slideNode.toLowerCase() == "extracredit") {
          if ( scratchGameList.includes(userLesson.gameId) ) {
            award = 50;
          } else {
            award = 200;
          }
            
        }
      }
    }
    if (lesson.package != 'starter') {
      award = award * 2;
    } 
    if (scratchGameList.includes(lesson.gameId)) {
      award = award / 2;
    }
    return Math.floor(award);
  }

  submitTestResult(result) {
    const { userLesson, lesson, slide, slideContent, setPaused } = this.props;
    if (!result) return;
    const that = this;


    if (result.toLowerCase().indexOf("test passed") >= 0 || result.toLowerCase().indexOf("成功") >= 0) {
      if (gameSetup.config && gameSetup.config.showHeadline) gameSetup.config.showHeadline("Exercise completed!", 3, 0x00FF00);

      const award = this.getTestAward();
      const slideId = this.props.userLesson.currentSlideId;

      if (scratchGameList.includes(lesson.gameId)) {
        setTimeout(()=>{
          this.doCoinAward(award);
        }, 200);
  
        setTimeout(()=>{
          this.setTestPassed(0, slideId);
        }, 2000);
  
      } else {
        setTimeout(()=>{
          this.doCoinAward(award);
        }, 2000);
  
        setTimeout(()=>{
          this.setTestPassed(0, slideId);
        }, 5000);
  
      }
    } else {
      if (gameSetup.config && gameSetup.config.showHeadline) gameSetup.config.showHeadline(result, 4, 0xFFFF00);
    }

    return;

    if (result.indexOf('Please ') === 0 || result.indexOf(`I haven't given the next test yet`) === 0) {
      handNewUserChatAction(userChat._id, 'USER_TEST_RESULT', result);
      return;
    }
    let timeout = 1000;
    let prefix = '';
    if (result.toUpperCase().indexOf('ERROR') >= 0) {
      timeout = 300;
      prefix = '';
    }
    if (result.indexOf('Unexpected identifier') >= 0) {
      result += ' Are you forgetting to close the previous line with ";" or "," ?';
    }
    if (result.indexOf("FAIL") >= 0 || result.indexOf("Test failed") >= 0) {
      result += ` 

Click '?' if you need some help.`;
    }

    setTimeout(() => {
      handNewUserChatAction(userChat._id, 'USER_TEST_RESULT', `${prefix}${result}`);
    }, timeout);

  }

  getCurrentSlide() {
    const { userLesson, slide, slideContent, setPaused } = this.props;
    for (let k=0; k < slideContent.slideInfo.length; k++) {
      const s1 = slideContent.slideInfo[k];
      if (s1.ID == userLesson.currentSlideId) {
        return s1;
      }
    }

  }

  showHideCodeSolution() {
    const { userLesson, slide, slideContent, setPaused } = this.props;
    if (scratchGameList.includes(lesson.gameId)) return;
  

    const s = this.getCurrentSlide();

    if (s.TYPE.toLowerCase() != "solution") {
      $("#codeSolution").hide();
    } else {
      $("#codeSolution").show();
      if (s.ANSWERCODE) {
        let v = combineCode(s.ANSWERCODE, slideContent.slideInfo[0].ANSWERCODE);
        window.solutionCodeEditor.codeMirror.setValue(v);
      } else if (s.ANSWERSCRIPT) {
        window.solutionCodeEditor.codeMirror.setValue(s.ANSWERSCRIPT);
      }
      // CodeMirror.fromTextArea(document.getElementById("codeSolution"), {
      //   lineNumbers: true,
      //   readOnly: true
      // });
    }
  }

  setAvatarIframe(slide) {
    let avatarfile = "/avatar.html";
    if (window.currentChosenLocale == "CH" || slide.LOCALE == "zh-cn") {
      avatarfile = "/avatarch.html";
    } else if (window.currentChosenLocale == "ES" || slide.LOCALE == "es") {
      avatarfile = "/avatares.html";
    }

    if (Meteor.user() && Meteor.user().syncMode == "Sync") {
      avatarfile = "/noavatar.html";
    }

    $("#avatariframe").css('display', avatarfile == "/avatar.html" ? "block" : "none");
    $("#avatariframees").css('display', avatarfile == "/avatares.html" ? "block" : "none");
    $("#avatariframech").css('display', avatarfile == "/avatarch.html" ? "block" : "none");

  }

  showHideEmbeddedIFrame(ss) {
    const { lesson} = this.props;
    const shouldshow = scratchGameList.includes(lesson.gameId) && ss.IFRAME != "" && typeof(ss.IFRAME) != "undefined";
    const that = this;
    if (shouldshow) {
      // const s = this.getCurrentSlide();
      // $("#embeddediframe").src = s.IFRAME;
      // $("#embeddediframe").contentWindow.location.reload(true);
      $("#embeddediframe").show();

      setTimeout(() => {
        const ff = $("#embeddediframe");
        if (ff && ff[0] && ff[0].contentWindow) {
          //const s = that.getCurrentSlide();
          if (ff[0].src != ss.IFRAME) {
            console.log("set new iframe " + ss.IFRAME);
            ff[0].src = ss.IFRAME;
            //ff[0].contentWindow.location.reload(true);
          }
        }
      }, 500);

    }
    else 
      $("#embeddediframe").hide();
  }

  showHideOpenInScratch(ss) {
    const { lesson, slide } = this.props;
    const theslide = ss ? ss : slide;
    const shouldshow = scratchGameList.includes(lesson.gameId) && ["activity", "coding", "hint",  "solution"].includes(theslide.TYPE) && theslide.PROJECTID != "" && typeof(theslide.PROJECTID) != "undefined";
    if (shouldshow)
      $("#scratchlink").show();
    else 
      $("#scratchlink").hide();


    if (theslide.DOWNLOADLINK && theslide.DOWNLOADLINK != "") {
      $("#downloadlink").show();
    } else {
      $("#downloadlink").hide();
    }


    if (theslide.TYPE == "bilingualtime") {
      $("#chinesebutton").show();
      $("#spanishbutton").show();
    } else {
      $("#chinesebutton").hide();
      $("#spanishbutton").hide();
    }

    if (theslide.NODE == "bilingualtime") {
      $("#skipbutton").show();
    } else {
      $("#skipbutton").hide();
    }

  }

  showHideOverlay(hide) {
    if (hide) {
      document.getElementById("lectureoverlay").style.pointerEvents = "none";
    } else {
      document.getElementById("lectureoverlay").style.pointerEvents = "auto";
    }
  }

  updateMatchObjectStyles() {
    const { userLesson, slide, slideContent, setPaused, lesson } = this.props;
    // check if there is hint or solution slide next to this one
    for (let k=0; k < slideContent.slideInfo.length-1; k++) {
      const s = slideContent.slideInfo[k];
      if (s.ID == userLesson.currentSlideId) {

      }
    }
  }

  showHideHintButton() {
    const { userLesson, slide, slideContent, setPaused, lesson } = this.props;
    // check if there is hint or solution slide next to this one
    for (let k=0; k < slideContent.slideInfo.length-1; k++) {
      const s = slideContent.slideInfo[k];
      if (s.ID == userLesson.currentSlideId) {
        const prefix = s.ID.substring(0, s.ID.indexOf("_")-1);
        let s1 = slideContent.slideInfo[k+1];
        if (s1.NODE == s.NODE) {
          $("#hintButton").hide();
          if (s1.TYPE.toLowerCase() == "hint") {
            $("#hintButton").show();
            $("#hintButton").html("Hint");
            if (window.currentChosenLocale == "CH") {
              $("#hintButton").html("小提示");
            }
            return;
          }

          if (s.TYPE.toLowerCase() == "coding" && s.NODE == "extracredit" && s1.TYPE == "coding") {
            $("#hintButton").show();
            $("#hintButton").html("Extra Credit");
            if (window.currentChosenLocale == "CH") {
              $("#hintButton").html("挑战一下");
            }          
  
            return;
          }

          const user = Meteor.user();
          if (s1.TYPE.toLowerCase() == "solution" && user.showSolutionButton != false && !lesson._id.toLowerCase().startsWith("school_a_lesson_")  ) {
            $("#hintButton").show();
            $("#hintButton").html("Solution");
            if (window.currentChosenLocale == "CH") {
              $("#hintButton").html("答案");
            }
            return;
          }
        } else {
          if (s1.NODE == "extracredit" && s1.TYPE.toLowerCase() == "coding" && ( s.TYPE.toLowerCase() == "solution" || s.TYPE.toLowerCase() == "extra" )  && s1.ID.includes(prefix) ) {
            $("#hintButton").show();
            $("#hintButton").html("Extra Credit");
            if (window.currentChosenLocale == "CH") {
              $("#hintButton").html("挑战一下");
            }
            return;
          }
        }
      }
    }
    $("#hintButton").hide();
  }

  componentDidMount() {
    delete window.lastGoogleRequest;
    document.addEventListener("keydown", this.handleKey.bind(this), false);


    this.showHideOpenInScratch();
    this.showHideEmbeddedIFrame(this.getCurrentSlide());

    const that = this;
    window.recordTestAttempt = function(res) {
      Meteor.call('recordTestAttempt', that.props.userLesson._id, that.props.userLesson.currentSlideId, res, window.robotCodeEditor.codeMirror.getValue());
    };

    window.recordQuickExerciseAttempt = function(action, result) {
      Meteor.call('recordQuickExerciseAttempt', that.props.userLesson._id, that.props.userLesson.currentSlideId, action, result);
    };

    window.triggerSync = function() {

      const actualSlide = RevealRef.getIndices();
      Meteor.call("doSyncClass", that.props.userLesson._id, window.classToSync, actualSlide.v || 0, actualSlide.f || 0, (err, res) => {
        if (err) {
          // swal("Error unlocking lesson: " + err.message);
          Bert.alert({
            title: 'Error',
            hideDelay: 4000,
            message: "Error syncing to class: " + err.message,
            type: 'codeInValidError',
            style: 'growl-bottom-right',
            icon: 'fas fa-warning'
          });   
        } else {
        }
      });

    }


    window.setSpeechM = function(newM) {
      speechSpeedM = newM;
    }


    if (window.solutionCodeEditor) window.solutionCodeEditor.codeMirror.refresh(); // fix line number inside problem

    // console.log("LC: did mount");

    // $('#lectureoverlay > svg').off('click');
    // $('#lectureoverlay > svg').off('mousedown');
    // $('#lectureoverlay > path').off('mousedown');
    // $('#lectureoverlay > svg').prop('disabled', true);
    // $('#lectureoverlay > path').prop('disabled', true);

    const noaction = function(e) {
      // console.log("show no action!");
      if (!e) var e = window.event;
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };

    $("#lectureoverlay > svg").get(0).addEventListener("click", noaction, true);
    $("#lectureoverlay > svg").get(1).addEventListener("click", noaction, true);
    $("#lectureoverlay > svg").get(0).addEventListener("mouseup", noaction, true);
    $("#lectureoverlay > svg").get(1).addEventListener("mouseup", noaction, true);
    $("#lectureoverlay > svg").get(0).addEventListener("mousedown", noaction, true);
    $("#lectureoverlay > svg").get(1).addEventListener("mousedown", noaction, true);

    if ($("#lectureoverlay > path").get(0)) {
      $("#lectureoverlay > path").get(0).addEventListener("click", noaction, true);
      $("#lectureoverlay > path").get(1).addEventListener("click", noaction, true);
      $("#lectureoverlay > path").get(0).addEventListener("mouseup", noaction, true);
      $("#lectureoverlay > path").get(1).addEventListener("mouseup", noaction, true);
      $("#lectureoverlay > path").get(0).addEventListener("mousedown", noaction, true);
      $("#lectureoverlay > path").get(1).addEventListener("mousedown", noaction, true);
    }


    // disable clicking the play icon itself
    // $('#lectureoverlay').on('click', 'svg', function(e){
    //   e.cancelBubble = true;
    //   if (e.stopPropagation) e.stopPropagation();
    // });
    // $('#lectureoverlay').on('mouseup', 'svg', function(e){
    //   e.cancelBubble = true;
    //   if (e.stopPropagation) e.stopPropagation();
    // });

    this.doCreateCoinSound();

    // this.showHideHintButton();

    window.submitTestResultInChat = (msg) => {
      that.submitTestResult(msg);
    };

    const tryToPresent = ()=>{

      let needToRetry = false;
      var iframes = document.getElementById('slides').getElementsByTagName('iframe');
      if (!iframes) {
        needToRetry = true;
      } else {
        var iframe = iframes[0];
        if (!iframe) {
          needToRetry = true;
        } else {
          if (!iframe.contentWindow) {
            needToRetry = true;
          } else {
            if (!iframe.contentWindow.Reveal) {
              needToRetry = true;
            } else {
              try {
                if (!iframe.contentWindow.Reveal.getSlideNotes()) {
                  needToRetry = true;
                }
              } catch (e) {
                needToRetry = true;
              }

            }

          }

        }
      }

      if (needToRetry) {
        setTimeout(tryToPresent,1000);
        return;
      }
      // console.log("LC: try to present");
      that.presentSlideUsingNotes();
    };

    // will present in did update so not doing it here unless first slide?
    if (this.props.userLesson.currentSlideId == "welcome") {
      setTimeout(tryToPresent,1000);
    }

    window.addEventListener( 'message', function( event ) {
      const { userLesson, slide, slideContent, setPaused } = that.props;

      if (!event.data) return;
      if (event.data && typeof event.data === 'object') return;
      if (event.data && typeof event.data === 'string' && event.data.indexOf("Meteor") == 0) return;
      if (event.data && typeof event.data === 'string' && event.data.indexOf("TGAME_") == 0) return;
      // console.log("new message " + event.data);
      var data = JSON.parse( event.data );

      const path = that.props.history.location.pathname;
      if (path.indexOf(that.props.userLesson.lessonId) < 0 ) return;

      if( data.namespace === 'reveal' ) {
        // Slide changed, see data.state for slide number

        if (data.eventName == 'ready') {
          var iframes = document.getElementById('slides').getElementsByTagName('iframe');
          var iframe = iframes[0];
          // first time loading a new deck
          RevealRef = iframe.contentWindow.Reveal;
          // console.log("real start here! got reveal reference.");
          $("#slideIFrame").show();
          hideNavArrows();

          gotoUserCurrentSlide(slideContent, userLesson.currentSlideId, true);

          
          // setTimeout(() => {
          //   // console.log("LC: present in ready");
          //   //that.presentSlideUsingNotes();
          // }, 1000);
        } else if (data.eventName == 'slidechanged' || data.eventName == 'framehidden' || data.eventName == "fragmentshown" || data.eventName == "fragmenthidden" ) {

          var iframes = document.getElementById('slides').getElementsByTagName('iframe');
          var iframe = iframes[0];
          // iframe.style.visibility = "visible";

          const actualSlide = RevealRef.getIndices();
          // console.log("LC: slide change! " + JSON.stringify(actualSlide) + " " + that.props.userLesson.currentSlideId);

          if (window.inSyncMode && (data.eventName == "slidechanged" || data.eventName == "ready"  || data.eventName == "fragmentshown" || data.eventName == "fragmenthidden") ) {
            // broadcast slide index to all
            const actualSlide = RevealRef.getIndices();
            Meteor.call("doSyncClass", that.props.userLesson._id, window.classToSync, actualSlide.v || 0, actualSlide.f || 0, (err, res) => {
              if (err) {
                // swal("Error unlocking lesson: " + err.message);
                Bert.alert({
                  title: 'Error',
                  hideDelay: 4000,
                  message: "Error syncing to class: " + err.message,
                  type: 'codeInValidError',
                  style: 'growl-bottom-right',
                  icon: 'fas fa-warning'
                });   
              } else {
              }
            });
    
          }


          if (data.eventName == "slidechanged") {

            if (!iframe.addedMatchingCSS) {
              // iframe.addedMatchingCSS = true;

              // if (slide.TYPE !== "matchquiz") return;
              // if (!iframe.firstload) return;
              // iframe.firstload = false;
              console.log("slide iframe loaded");
        
              // .solvedobject{border: 5px dotted yellow !important}   
        
              $(iframe.contentDocument).find("head")
                .append($(`<style type='text/css'>  
                
                
                .selectedobject{border: 5px solid white !important} 
        
                .solvedobject:before {
                  content: '';
                  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000) !important;
                  position: absolute;
                  top: -4px;
                  left:-4px;
                  background-size: 400%;
                  z-index: -1;
                  filter: blur(5px);
                  width: calc(100% + 8px);
                  height: calc(100% + 8px);
                  animation: glowingss 20s linear infinite;
                  opacity: 1;
                  transition: opacity .3s ease-in-out;
                  border-radius: 10px;
                }
                
                @-webkit-keyframes glowingss {
                  0% { background-position: 0 0; }
                  50% { background-position: 400% 0; }
                  100% { background-position: 0 0; }
                }
                
                @keyframes glowingss {
                  0% { background-position: 0 0; }
                  50% { background-position: 400% 0; }
                  100% { background-position: 0 0; }
                }
        
        
                .solvedobject:before {
                  content: '';
                  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000) !important;
                  position: absolute;
                  top: -4px;
                  left:-4px;
                  background-size: 400%;
                  z-index: -1;
                  filter: blur(5px);
                  width: calc(100% + 8px);
                  height: calc(100% + 8px);
                  animation: glowingss 20s linear infinite;
                  opacity: 1;
                  transition: opacity .3s ease-in-out;
                  border-radius: 10px;
                }
                
                .solvedobjectA {
                  border: 10px solid !important;
                  border-image-slice: 1  !important;
                  border-width: 5px  !important;
                  border-image-source: linear-gradient(to left, #00C853, #B2FF59) !important;
                }
        
                .solvedobjectB {
                  border: 10px solid !important;
                  border-image-slice: 1  !important;
                  border-width: 5px  !important;
                  border-image-source: linear-gradient(to left, #743ad5, #d53a9d) !important;
                }
        
                .solvedobjectC {
                  border: 10px solid !important;
                  border-image-slice: 1  !important;
                  border-width: 5px  !important;
                  border-image-source: linear-gradient(to left, #FFF600, #DDDDDD) !important;
                }
        
                .solvedobjectD {
                  border: 10px solid !important;
                  border-image-slice: 1  !important;
                  border-width: 5px  !important;
                  border-image-source: linear-gradient(to left, #00F9FF, #00A6FF) !important;
                }
        
                .quizclassA:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
                
                .answerclassA:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
        
        
                .quizclassB:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
                
                .answerclassB:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
        
        
                .quizclassC:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
                
                .answerclassC:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
        
                .quizclassD:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
                
                .answerclassD:hover {
                  transform: scale(1.05, 1.05);
                  -webkit-box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 1);
                }
                
                </style>`));
            }







            // handle matching quiz 

            var rawscripts = RevealRef.getSlideNotes().split("\n");

            let isCompleted = false;
            for (let k=0; k<userLesson.slideVisitLog.length; k++) {
              const log = userLesson.slideVisitLog[k];
              if (log.slideId == userLesson.currentSlideId) {
                if (log.completed) {
                  isCompleted = true;
                }
                break;
              }
            }
  


            if (rawscripts[0].toLowerCase().includes("matchquiz") && !isCompleted ) {
              iframe.currentselected = "";
              iframe.solved = [];

              $(iframe.contentDocument).find(".quizclassA").parent().removeClass("solvedobjectA");
              $(iframe.contentDocument).find(".answerclassA").parent().removeClass("solvedobjectA");
              $(iframe.contentDocument).find(".quizclassB").parent().removeClass("solvedobjectB");
              $(iframe.contentDocument).find(".answerclassB").parent().removeClass("solvedobjectB");
              $(iframe.contentDocument).find(".quizclassC").parent().removeClass("solvedobjectC");
              $(iframe.contentDocument).find(".answerclassC").parent().removeClass("solvedobjectC");
              $(iframe.contentDocument).find(".quizclassD").parent().removeClass("solvedobjectD");
              $(iframe.contentDocument).find(".answerclassD").parent().removeClass("solvedobjectD");
  

              const checkallmatch = () => {
                // check if all has been answered

                var parts = [];
                let allmatch = true;
                for (let k=0; k<rawscripts.length; k++) {
                  var ss = rawscripts[k].trim();
                  if (ss.includes("#match")) {
                    parts = ss.split("||");
                    const answers = parts[1].trim().split(" ");
                    for (let i=0; i<answers.length; i++) {
                      if (!iframe.solved.includes(answers[i])) {
                        allmatch = false;
                        break;
                      }
                    }
                    break;
                  }
                }      

                if (allmatch) {
                  Meteor.call('submitUserSurvey', userLesson._id, userLesson.currentSlideId, parts[1].trim(), parts[1].trim(), () => {
                    for (let k=0; k<AllScripts.length; k++) {
                      const s = AllScripts[k];
                      if (s.toLowerCase().indexOf("#showmatchresult") >= 0) {
                        let news = "";
                        var choices = ["Well done", "Terrific", "That's correct", "Way to go", "Bravo", "You are the best","Not bad", "Excellent", "Marvelous", "Wonderful", "I knew you had it in you", "Awesome", "Remarkable", "Sweet", "I'm impressed", "You're very talented", "Magnificent",  "Brilliant", "Right on", "Great job", "You rock", "Phenomenal", "Exceptional", "Keep up the good work", "Fantastic work", "Very good", "Stupendous", "It couldn't be better", "Good for you", "Spectacular work", "How extraordinary", "You are a winner", "Great effort", "You are a genius", "You are sharp", "You've earned my respect", "Outstanding effort", "Top notch", "Good choice"];
                        if (window.currentChosenLocale == "CH") {
                          choices = ["太棒了", "很好", "完全正确", "你真厉害", "做的好", "你真是个天才", "向你致敬", "我很佩服你", "了不起", "你太优秀了", "你太有才了", "你做的很好", "太漂亮了", "你的努力没有白费", "你越做越好了"];
                        }
                        const ind = Math.floor((Math.random() * choices.length));
                        // news = choices[ind] + ", #SN!";
                        news = choices[ind] + "!";
                        that.doCoinAward(10);
                        AllScripts[k] = "[0] [" + news + "]";
                        isPaused = false;
                        setPaused(isPaused);
                        window.moveToAfterTimer = setTimeout(()=>{
                          that.moveToAfterInput();
                          that.playNextScript();
                        }, 3000);
                        return;
                      }
                    }
                  });          
                }
              };


              $(iframe.contentDocument).find(".quizclassA").off("click");
              $(iframe.contentDocument).find(".quizclassA").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("A")) return;

                if (iframe.currentselected == ".answerclassA") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("A");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).parent().addClass("solvedobjectA");
                  $(this).parent().addClass("solvedobjectA");
                  iframe.currentselected = "";

                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".quizclassA";
                  }
                }
              });

              $(iframe.contentDocument).find(".answerclassA").off("click");
              $(iframe.contentDocument).find(".answerclassA").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("A")) return;

                if (iframe.currentselected == ".quizclassA") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("A");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).addClass("solvedobjectA");
                  $(this).addClass("solvedobjectA");
                  iframe.currentselected = "";
                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".answerclassA";
                  }
                }
              });


              $(iframe.contentDocument).find(".quizclassB").off("click");
              $(iframe.contentDocument).find(".quizclassB").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("B")) return;

                if (iframe.currentselected == ".answerclassB") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("B");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).parent().addClass("solvedobjectB");
                  $(this).parent().addClass("solvedobjectB");
                  iframe.currentselected = "";

                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".quizclassB";
                  }
                }
              });

              $(iframe.contentDocument).find(".answerclassB").off("click");
              $(iframe.contentDocument).find(".answerclassB").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("B")) return;

                if (iframe.currentselected == ".quizclassB") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("B");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).addClass("solvedobjectB");
                  $(this).addClass("solvedobjectB");
                  iframe.currentselected = "";
                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".answerclassB";
                  }
                }
              });


              $(iframe.contentDocument).find(".quizclassC").off("click");
              $(iframe.contentDocument).find(".quizclassC").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("C")) return;

                if (iframe.currentselected == ".answerclassC") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("C");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).parent().addClass("solvedobjectC");
                  $(this).parent().addClass("solvedobjectC");
                  iframe.currentselected = "";

                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".quizclassC";
                  }
                }
              });

              $(iframe.contentDocument).find(".answerclassC").off("click");
              $(iframe.contentDocument).find(".answerclassC").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("C")) return;

                if (iframe.currentselected == ".quizclassC") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("C");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).addClass("solvedobjectC");
                  $(this).addClass("solvedobjectC");
                  iframe.currentselected = "";
                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".answerclassC";
                  }
                }
              });


              $(iframe.contentDocument).find(".quizclassD").off("click");
              $(iframe.contentDocument).find(".quizclassD").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("D")) return;

                if (iframe.currentselected == ".answerclassD") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("D");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).parent().addClass("solvedobjectD");
                  $(this).parent().addClass("solvedobjectD");
                  iframe.currentselected = "";

                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".quizclassD";
                  }
                }
              });

              $(iframe.contentDocument).find(".answerclassD").off("click");
              $(iframe.contentDocument).find(".answerclassD").click(function() {
                // do nothing if already solved
                if (iframe.solved.includes("D")) return;

                if (iframe.currentselected == ".quizclassD") {
                  $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                  iframe.solved.push("D");  
                  checkallmatch();
                  $(iframe.contentDocument).find(iframe.currentselected).addClass("solvedobjectD");
                  $(this).addClass("solvedobjectD");
                  iframe.currentselected = "";
                } else {
                  if (iframe.currentselected.length > 0) {
                    $(iframe.contentDocument).find(iframe.currentselected).removeClass("selectedobject");
                    iframe.currentselected = "";
                  } else {
                    $(this).addClass("selectedobject");
                    iframe.currentselected = ".answerclassD";
                  }
                }
              });

            }


          // if (AllScripts.length == 0) {

            if (window.currentSound) {
              // console.log("stop sound 3");
              window.currentSound.unload();
              window.currentSound = null;
            }

            // console.log("LC: presentSlideUsingNotes AllScripts.length 0 so try to present ");
            that.presentSlideUsingNotes();
          // }

          }



        }
      }
    } );

    // set content string
    // document.getElementById('slideIFrame').contentWindow.document.write(slideContent.content);
    // getRevealReference(() => {
    //   gotoUserCurrentSlide(slideContent, userLesson.currentSlideId);
    //   this.presentSlideUsingNotes();
    // });


    //$("#lectureoverlay").mousedown(this.handleClickOverlay.bind(this));
    $(".fa-play-circle").mousedown(this.handleClickOverlay.bind(this));
    $(".fa-pause-circle").mousedown(this.handleClickOverlay.bind(this));
    window.handleClickPlayPause = this.handleClickOverlay.bind(this);

    // $("#userinputtext").click(this.handleUserInputClick.bind(this));
    $("#userinputtext").mousedown(this.handleUserInputClick.bind(this));
    $("#userquickinputtext").mousedown(this.handleUserInputClick.bind(this));

    $("#hintButton").mousedown(this.handleUserClickHintButton.bind(this));
    // $("#codeSolution").click(this.handleUserInputClick.bind(this));
    $("#codeSolution").mouseup(this.handleUserInputClick.bind(this));
    $("#codeSolution").mousedown(this.handleUserInputClick.bind(this));


    // $( "#lectureoverlay" ).keydown(this.handleKeyOverlay.bind(this));
    // $( "#lessonpageid" ).keydown(this.handleKeyOverlay.bind(this));
    
    // $( ".fa-play-circle" ).keyup(this.handleKeyOverlay.bind(this));
    // $( ".fa-pause-circle" ).keyup(this.handleKeyOverlay.bind(this));

    // $("#copySolutionButton").click(this.copyToClipboard.bind(this));



    $( "#userinputtext" ).keyup(function(event) {
      if ( event.keyCode === 13 ) {
        const { userLesson, slide, slideContent, setPaused } = that.props;
        Meteor.call('submitUserInput', userLesson._id, userLesson.currentSlideId, $( "#userinputtext" ).attr("inputfield").trim(), $( "#userinputtext" ).val().trim(), () => {
          if ($( "#userinputtext" ).attr("inputfield") == "SN") {
            localStudentName = $( "#userinputtext" ).val().trim();
            $("#userinputtext").prop('disabled', true).css('opacity',1);
            isPaused = false;
            setPaused(isPaused);
            that.moveToAfterInput();
            that.playNextScript();
          }
        });
      }
    });



    $( "#hintquickinput" ).mousedown(function(e){
      const { userLesson, slide, slideContent, setPaused } = that.props;
      e.target.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
      hintClicked = true;
      window.recordQuickExerciseAttempt("ACTION_CLICK_HINT", "");

      const question = $("#userquickinputtext").attr("quickexercisequestion").trim();
      let hint = "Sorry no hint is available.";
      switch(question) {
        case "emptyobjectdef": {
          hint = `You need to use curly brackets`;
          break;
        }
        case "objage12": {
          hint = `Please write a pair of curly brackets, then add the new property between them.`;
          break;
        }
        
        case "objheight23600": {
          hint = `Please write a pair of curly brackets, then add the property height between them.`;
          break;
        }

        case "objagelinda": {
          hint = `Please write a pair of curly brackets, then add these 2 new properties between them. Don't forget to add a comma after the first property's value.`;
          break;
        }
        case "objvarempty": {
          hint = `Please create an object variable using "var" and name it "student", then use "=" to assign an empty object to it.`;
          break;
        }
        case "objvarage": {
          hint = `Please create the variable using 'var student =', and then write the object definition.`;
          break;
        }

        case "objvarheight": {
          hint = `Please create the variable using 'var mountain =', and then define the object with 2 properties. Note that the name "Everest" is a string, which needs to be quoted.`;
          break;
        }

        case "objvartablelegs": {
          hint = `Please create the variable using 'var table =', and then write the object definition.`;
          break;
        }
        case "objvaragename": {
          hint = `You can add the property using student.firstName`;
          break;
        }
        case "objvarmountainlongitude": {
          hint = `You can add the property using "mountain.longitude ="`;
          break;
        }
        case "objvartablename": {
          hint = `You can add the property using table.color`;
          break;
        }
        case "objvarage13": {
          hint = `You can modify the age property using "student.age =" `;
          break;
        }

        case "objvarheight7200": {
          hint = `You can modify the height property using "mountain.height =" `;
          break;
        }
        
        case "objvartableleg3": {
          hint = `You can modify the legs property using table.legs`;
          break;
        }

        case "subtractfunc": {
          hint = `You can copy the "add" function, then change the name from "add" to "subtract", and the "+" operation to "-".`;
          break;
        }

        case "halffunctest": {
          hint = `You need to return the value of m divided by 2: m / 2 .`;
          break;
        }

        case "superAddfunc": {
          hint = `You can copy the "superProduct" function, and then change the function name from "superProduct" to "superAdd", and replace the "*" operators with "+".`;
          break;
        }
        
        case "squareFunc": {
          hint = `You can copy the "double" function, and then change the function name from "double" to "square", and return m * m.`;
          break;
        }

        case "doublefunc": {
          hint = `You can write "return 2*v;" inside the function.`;
          break;
        }
        case "runsubtractfunc": {
          hint = `You need to start with "var result2 =", and then call the subtract function with 2 arguments of 10 and 8.`;
          break;
        }
        case "runhalffunc": {
          hint = `You need to start with "var resultHalf =", and then call the half function with the argument of 12.`;
          break;
        }
        case "runAvg": {
          hint = `You need to start with "var resultAvg =", and then call the "average" function with 2 arguments of 10 and 8.`;
          break;
        }
        case "runProduct": {
          hint = `You need to start with "var result3 =", and then call the "product" function with 2 arguments of 7 and 6.`;
          break;
        }
        case "rundoublefunc": {
          hint = `You need to start with "var result3 =", and then call the double function with x.`;
          break;
        }
        case "runtriplefunchw": {
          hint = `You need to start with "var result4 =", and then call the function triple with the argument x.`;
          break;
        }
        case "arrayvar1": {
          hint = `You need to start with "var IDs =", and then create the array using a pair of square brackets.`;
          break;
        }
        case "arrayvar1hwt": {
          hint = `You need to start with "var colors =", and then create the array using a pair of square brackets.`;
          break;
        }
        case "arrayvarstring1": {
          hint = `You need to start with "var names =", and then create the array using a pair of square brackets.`;
          break;
        }
        case "arrayvar2": {
          hint = `You can access the second number in the array using IDs[1].`;
          break;
        }
        case "arrayvar2hwt": {
          hint = `You can access the third string in the array using colors[2].`;
          break;
        }
        case "arrayvarstring2": {
          hint = `You can access the last string in the array using names[2].`;
          break;
        }
        case "arrayvar3": {
          hint = `You can access the first student using students[0], so her age is students[0].age.`;
          break;
        }
        case "arrayvar3hwt": {
          hint = `You can access the second student object using students[1], so his name is students[1].name.`;
          break;
        }
        case "arrayvarchangename": {
          hint = `You can access the second student using students[1], so his name is students[1].name.`;
          break;
        }
        case "arraytanks1": {
          hint = `You can access the last tank object in Tanks using Tanks[Tanks.length - 1], so its health is Tanks[Tanks.length - 1].health.`;
          break;
        }
        case "printmsgeasy": {
          hint = `You can call the "print()" funciton, and put the text message inside a pair of quotation marks. Make sure you write the letters in the specified case (upper or lower).`;
          break;
        }
        case "printx": {
          hint = `You can call the "print()" funciton with x as the argument.`;
          break;
        }

        case "printxyhw": {
          hint = `You can call the "print()" funciton with a string template, such as: "x is " + x + " y is " + y.`;
          break;
        }

        case "printrandom": {
          hint = `You can join the string "r is " with the variable r using the "+" operator.`;
          break;
        }

        case "printpointhw": {
          hint = `You need to replace the numbers 40 and 50 in the given format with points[1].x and points[1].y, using the "+" operator.`;
          break;
        }

        case "printrandom2": {
          hint = `You can join these 4 parts together using "+":
"r is "
r
" and s is "
s`;
          break;
        }

        case "ticketprice1": {
          hint = `You need to use a conditional statement, with the condition of "age > 18", and assign 10 to ticketPrice if the condition is true, and set it to 5 otherwise.`;
          break;
        }

        case "gradetest1": {
          hint = `You need to use a conditional statement, with the condition of "score >= 90", and set grade to "A" if the condition is true, and set it to "B" otherwise.`;
          break;
        }

        case "logicalqe1": {
          hint = `You need to use the AND operator ("&&") to join 2 comparisons, one checking if m > 0 and another checking if n > 0.`;
          break;
        }


        case "logicalqe1test1": {
          hint = `You need to use the AND operator ("&&") to join 2 comparisons, one checking if m < 0 and another checking if n < 0.`;
          break;
        }
        
        case "logicalqe2": {
          hint = `You need to use the OR operator ("||") to join 2 comparisons, one checking if m != "blue" and another checking if n != "blue".`;
          break;
        }

        case "gradehwt": {
          hint = `You need to use a conditional statement, with the condition of "score >= 90", and assign "A" to grade if the condition is true, and set it to "B" otherwise.`;
          break;
        }

        case "testResultqe": {
          hint = `You need to use a conditional statement, with the condition of "testScore >= 60", and set testResult to "Pass" if the condition is true, and set it to "Fail" otherwise.`;
          break;
        }

        case "setwinner": {
          hint = `You need to use a conditional statement, with the condition of "score2 > score1", and set winner to "Player2" if that condition is true. Be careful of the case of each letter.`;
          break;
        }

        case "setwinnerhwt": {
          hint = `You need to use a conditional statement, with the condition of "score2 <= score1", and set winner to "Player1" if that condition is true. Be careful of the case of each letter.`;
          break;
        }

        case "7counting1": {
          hint = `The first number is 3, and you add 2 to it on each step, and keep going while the number is still less than 11.`;
          break;
        }

        case "7counting1hw": {
          hint = `The first number is 5, and you add 3 to it on each step, and keep going while the number is still less than or equal to 17.`;
          break;
        }

        case "7counting1hwt": {
          hint = `The starting number is 3, and you add 20 to it in each step, and keep going while the number is still less than 61.`;
          break;
        }

        case "7counting2": {
          hint = `The first number is 9, and you subtract 1 from it on each step, and keep going while the number is still no less than 5.`;
          break;
        }
        
        case "7counting2hw": {
          hint = `The first number is 15, and you subtract 4 from it in each step, and keep going while the number is still at least 5.`;
          break;
        }

        case "7counting2hwt": {
          hint = `The first number is 9, and you subtract 9 from it in each step, and keep going while the number is at least -9.`;
          break;
        }

        case "7forloop1": {
          hint = `The starting number would be 4, and the keep-going test would be "<= 16".`;
          break;
        }

        case "7forloop1test1": {
          hint = `The starting number would be 28, the keep-going test would be "j >= 4", and you need to subtract 8 from j in each step.`;
          break;
        }

        case "7forloop1hw": {
          hint = `The starting number would be 1, and the keep-going test would be "<= 11".`;
          break;
        }

        case "7forloop1hwt": {
          hint = `The starting number would be 1; the keep-going test would be "<= 10"; and the updating rule would be "adding 3 each step".`;
          break;
        }

        case "7forloop2": {
          hint = `The starting number would be 9, the keep-going test would be ">= 1", and the updating rule should subtract 2 from the index variable itself.`;
          break;
        }

        case "7forloop2hw": {
          hint = `The starting number would be 9, the keep-going test would be ">= 2", and the updating rule should subtract 1 from the index variable itself.`;
          break;
        }

        case "7forloop2hwt": {
          hint = `The starting number would be 10, the keep-going test would be ">= -5", and the updating rule should subtract 5 from the index variable in each step.`;
          break;
        }

        case "7forloop3": {
          hint = `The starting number would be 16, the keep-going test would be ">= 1", and the updating rule should divide the index variable by 2 like this: j = j/2.`;
          break;
        }

        case "7forloop3hwt": {
          hint = `The starting number would be 2, the keep-going test would be "<= 16", and the updating rule should multiply the index variable by 2 like this: j = j*2.`;
          break;
        }

        case "9nestfor1": {
          hint = `The loop for x should start at 1, keep going while "x <= 2", and update x to "x+1" each step. 

The inner loop for y should start at 1, keep going while "y <= 5", and update y to "y+2" each step. 

The print line is the same as in the example.`;
          break;
        }

        case "9nestfor1hw": {
          hint = `
The loop for x should start at 4, keep going while "x >= 2", and update x to "x-1" each step. 

The inner loop for y should start at 1, keep going while "y <= 7", and update y to "y+3" each step. 

The print line should be print("x: " + x + " y: " + y) .`;
          break;
        }

        case "definelookupicescream": {
          hint = `
You should use the flavor name as the property name, and its price as the property value. `;
          break;
        }

        case "buycheapericescream": {
          hint = `
You should use an if-else statement to compare iceCreamPrices["orange"] and iceCreamPrices["chocolate"], and set the iceCreamToBuy accordingly. `;
          break;
        }

        case "9nestfor2": {
          hint = `The outer loop for x should start at 4, keep going while "x <= 10", and update x to "x+3" each step. 

The inner loop for y should start at 2, keep going while "y <= 6", and update y to "y+2" each step. 

Also, the print line should be like this: "y: " + y + " x: " + x`;
          break;
        }

        case "9nestfor2hw": {
          hint = `The outer loop for x should start at 9, keep going while "x >= 5", and update x to "x-2" each step. 

The inner loop for y should start at 2, keep going while "y <= 6", and update y to "y+2" each step. 

Also, the print line should be like this: "y: " + y + " x: " + x`;
          break;
        }

        case "13break1": {
          hint = `You can use either break or continue, and trigger the command when k is 4 using an "if" statement.`;
          break;
        }

        case "13break2": {
          hint = `You can use the continue keyword, and trigger it when j is at least 2 using an "if" statement.`;
          break;
        }

        case "13break2test1": {
          hint = `You can use the "continue" keyword, and trigger it when j is greater than 0 using an "if" statement.`;
          break;
        }
        case "13break2hw": {
          hint = `You can use the continue keyword, and trigger it when j is less than 4 using an "if" statement.`;
          break;
        }


        case "13break2hwt": {
          hint = `You can trigger the "continue" command when j is exactly 3.`;
          break;
        }


        case "13break3": {
          hint = `You can use the break keyword, and trigger it when j is at least 0 using an "if" statement.`;
          break;
        }

        case "13break3hw": {
          hint = `You can use the break keyword, and trigger it when j is 2 using an "if" statement.`;
          break;
        }

        case "14callcalccutangle": {
          hint = `You can refer to the previous page for an example, and the parameters should be 10 and 5.`;
          break;
        }

        case "14callcalccutanglehw": {
          hint = `You can call the calculateCutAngle with 2 arguments of M and 4.`;
          break;
        }


        case "14callcalcskewangle": {
          hint = `You can refer to the previous page for an example, and the arguments should be 10 and 4.`;
          break;
        }

        case "14callcalcskewanglehw": {
          hint = `You can call calculateSidePocketSkew, and the arguments should be 12 and 1.`;
          break;
        }

        case "15mirror1": {
          hint = `To use the formula, MIRROR_Y should be 12 in this example, and M.y is 10.`;
          break;
        }

        case "15mirror2": {
          hint = `The formula "N.y = 2 * MIRROR_Y - M.y" works if M is below the mirror line as well! MIRROR_Y should be 15, and M.y is 20.`;
          break;
        }

        case "15mirror3": {
          hint = `The formula "N.x = 2 * MIRROR_X - M.x" can be used here, with MIRROR_X of 30, and M.x of 20.`;
          break;
        }

        case "array2dvar1": {
          hint = `You need to start the definition with "var nums = [", and then write down each row as a 1D array. Don't forget to use commas to separate the child arrays and finish with a "]".`;
          break;
        }

        case "array2dvar1hwt": {
          hint = `You need to start the definition with "var nums = [", and then write down each row as a 1D array. Don't forget to use commas to separate the child arrays and finish with a "]".`;
          break;
        }

        case "array2dvar2": {
          hint = `You need to access the third item in the second child array, so the first index is 1 and the second index is 2.`;
          break;
        }

        case "array2dvar2test1": {
          hint = `You need to access the third item in the first child array, so the first index is 0 and the second index is 2.`;
          break;
        }

        case "array2dvar2hwt": {
          hint = `You need to access the third item in the first child array, so the first index is 0 and the second index is 2.`;
          break;
        }

        case "array2dvar3": {
          hint = `The loop variable i goes from 0 to the last index of "nums", which is "nums.length - 1". You can add each item to "sum" using "sum = sum + nums[i]".`;
          break;
        }

        case "array2dvar4": {
          hint = `You need to write a two-level nested for-loop, using i and j as the indices. In the inner for-loop, add nums[i][j] to sum.`;
          break;
        }

        case "array2dvar4hwt": {
          hint = `You need to write a two-level nested for-loop, using i and j as the indices. In the inner for-loop, add scores[i][j] to total.`;
          break;
        }

        case "array2dvar5": {
          hint = `The first line printed out is "M[0][0] is 12". The second index changes more frequently than the first index. `;
          break;
        }

        case "array2dvar6": {
          hint = `In the outer loop, you need to decare a new array "row" to hold the values on this row, and push it into "table" after the inner loop. `;
          break;
        }

        case "pathvar1": {
          hint = `You should use "U" and "R" as the path goes up and right.`;
          break;
        }

        case "pathvar1test1": {
          hint = `You should use "U" and "R" as the path goes up and right.`;
          break;
        }

        case "pathvar1hwt": {
          hint = `You should use "U" and "R" as the path goes up and right.`;
          break;
        }

        case "astar1": {
          hint = `You should follow the numbers from 1 to 8 and use "U" and "R" as the path goes up and right.`;
          break;
        }

        case "astar2": {
          hint = `The blue tank should go up one tile, then to the right for six tiles, and down one tile. `;
          break;
        }

        case "astar2hwt": {
          hint = `The blue tank should go up one tile, then turn right, then turn to the bottom, then turn left, and finally go up. `;
          break;
        }

        case "astar3": {
          hint = `The graph array should have 4 rows and each row has 7 numbers of 0 or 1. `;
          break;
        }

        case "astar3hwt": {
          hint = `The graph array should have 4 rows and each row has 4 numbers of 0 or 1.`;
          break;
        }

        case "astar4": {
          hint = `The shortest path can go through the other cells around N that are marked 7.`;
          break;
        }

        case "astar5": {
          hint = `The shortest path should pass the left edge and then the top edge. `;
          break;
        }

        case "forbest1": {
          hint = `Please create a for-loop to traverse "nums", and update "smallest" if the current item is smaller than it. `;
          break;
        }

        case "quickmandist": {
          hint = `You need to use Math.abs to calculate the row difference and column difference, and add them up. `;
          break;
        }

        case "quickmandisthwt": {
          hint = `You need to use Math.abs to calculate the street difference and avenue difference, and add them up. `;
          break;
        }

        case "ternary1": {
          hint = `Your code should look like this: var watchTV = isHomeworkDone ? xx : xx. Replace the "xx" with the correct string values.`;
          break;
        }

        case "searchforbest": {
          hint = `You can use the for-loop in the previous slide as an example. You need to go through the names array and compare names[i].length with longest.length, and set longest to names[i] if it is longer. `;
          break;
        }

        case "searchforbesthwt": {
          hint = `You need to go through the names array and compare names[i].length with shortest.length, and set shortest to names[i] if it is shorter. `;
          break;
        }

        case "searchforbesthwt2": {
          hint = `You need to go through the students array and compare students[i].age with youngest.age, and update youngest.age and youngest.name if students[i].age is smaller. `;
          break;
        }

        case "quickdecision": {
          hint = `There should be three "if" conditions and three "else" in the answer.`;
          break;
        }

        case "damageexe1": {
          hint = `You need to replace "Damage_Points" and "Reload_Points" in the formula with MyTank's properties.`;
          break;
        }

        case "damageexe2": {
          hint = `You need to calculate the health recovery rate first, then subtract it from the damage.`;
          break;
        }

        case "arrowfunc0": {
          hint = `You should start with "var subtract = (...) => {...}", and then put in the parameter list and function statements. `;
          break;
        }

        case "arrowfunc1": {
          hint = `You should start with "var hasID = (...) => {...}", and then put in the parameter list and function statements. `;
          break;
        }

        case "arrowfuncmultiply": {
          hint = `You should start with "var multiply = (...) => {...}", and then put in the parameter list and function statements. `;
          break;
        }

        case "getoppo": {
          hint = `You should start with "var oppoTanks = Tanks.filter( ... )", and check the color property on each tank. The tank's color should not be white, nor the same as MyTank.`;
          break;
        }

        case "arraymethod1": {
          hint = `You should push a new object to the array. The new object has two properties: ID and Name. `;
          break;
        }

        case "arraymethod2": {
          hint = `You can push the two subarrays in one step or two steps. `;
          break;
        }

        case "arraymethod2a": {
          hint = `You can push the subarray like this: numbers.push(). `;
          break;
        }

        case "arraymethod3": {
          hint = `You should start with "var myRoommate = students.find( ... )". You can pass in an arrow function as the parameter. `;
          break;
        }

        case "arraymethod3hwt": {
          hint = `You should start with "var myRoommate = students.find( ... )". You can pass in an arrow function as the parameter. `;
          break;
        }

        case "arraymethod3num": {
          hint = `You should start with "var x = numbers.find( ... )". You can pass in an arrow function. `;
          break;
        }

        case "arraymethod3numhwt": {
          hint = `You should start with "var x = numbers.find( ... )". You can pass in an arrow function. `;
          break;
        }

        case "arraymethod4": {
          hint = `You should start with "var numbers2 = numbers.slice( , )" and pass in the correct start and end indices. `;
          break;
        }

        case "arraymethod4hwt": {
          hint = `You should start with "var numbers2 = numbers.slice( , )" and pass in the correct start and end indices. `;
          break;
        }

        case "placeballqe": {
          hint = `You should call "ResetTable(true)" first to clear the table, and then call "PlaceBallOnTable" for each of the 3 balls. `;
          break;
        }

        case "includesvsfind": {
          hint = `You need to call the find function on students and check both properties. Then lastly check whether the returned value is undefined. `;
          break;
        }

        case "forofexe": {
          hint = `You need to call a for-loop in this format: "for (var variableName of arrayName)". `;
          break;
        }

        case "lda1arraysquares": {
          hint = `Create the array with an array literal. The index numbers of the last two elements are 7 and 8. `;
          break;
        }

        case "lda1arraymethodreduce": {
          hint = `The reducer function should be like this (result, flower) => result + flower.count. `;
          break;
        }

        case "lda12adjmatrix": {
          hint = `You need to create a 5 by 5 array with an array literal. The elements are the weights of graph edges. `;
          break;
        }

        case "lda12adjlist": {
          hint = `You need to create an object, whose property names are node labels, and property values are objects as well. `;
          break;
        }

        default: {
          break;
        }
      }

      swal({
        title: "Hint",
        text: hint,
        // icon: "info",
        // buttons: false,
        dangerMode: false,
        button: "Got it!",
      });


    });

    // $( "#openscratchlink" ).mousedown(function(e){
    //   var win = window.open("https://scratch.mit.edu/projects/"+that.props.slide.PROJECTID, '_blank');
    //   win.focus();
    // });


    // $( "#opendownloadlink" ).mousedown(function(e){
    //   var win = window.open(that.props.slide.DOWNLOADLINK, '_blank');
    //   win.focus();
    // });

    $( "#answerquickinput" ).mousedown(function(e){
      const { userLesson, slide, slideContent, setPaused } = that.props;
      e.target.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
      solutionClicked = true;
      window.recordQuickExerciseAttempt("ACTION_CLICK_ANSWER", "");

      const question = $("#userquickinputtext").attr("quickexercisequestion").trim();
      const answer = get_quick_answer(question);

//       let answer = "Sorry no answer is available.";
//       switch(question) {
//         case "emptyobjectdef": {
//           answer = `Please write a pair of curly brackets like this: 
// _________________________

// { }
// _________________________
// `;
//           break;
//         }
//         case "objage12": {
//           answer = `You can create the object like this: 
// _________________________

// {
//   "age": 12
// }
// _________________________
// `;
//           break;
//         }
//         case "objagelinda": {
//           answer = `Please create an empty object, then add these 2 new properties between the curly brackets: 
// ____________________________

// {
//   "age": 12, 
//   "name": "Linda"
// }
// ____________________________

// Don't forget the comma between these 2 properties.
// `;
//           break;
//         }
//         case "objvarempty": {
//           answer = `You can create the variable like this:
// ____________________________

// var student = { }
// ____________________________
// `;
//           break;
//         }
//         case "objvarage": {
//           answer = `Please create the variable like this:
// ____________________________

// var student = {
//   age: 12
// }
// ____________________________
// `;
//           break;
//         }
//         case "objvartablelegs": {
//           answer = `Please create the variable like this:
// ____________________________

// var table = {
//   legs: 4
// }
// ____________________________
// `;
//           break;
//         }

//         case "objvaragename": {
//           answer = `You can add the new property like this: 
// ____________________________

// student.firstName = "Linda";
// ____________________________
// `;
//           break;
//         }

//         case "objvartablename": {
//           answer = `You can add the new property like this: 
// ____________________________

// table.color = "black";
// ____________________________
// `;
//           break;
//         }

//         case "objvarage13": {
//           answer = `You can modify the age property like this: 
// ____________________________

// student.age = 13;
// ____________________________`;
//           break;
//         }
//         case "objvartableleg3": {
//           answer = `You can modify the legs property like this: 
// ____________________________

// table.legs = 3;
// ____________________________`;
//           break;
//         }
//         case "subtractfunc": {
//           answer = `You can define the function like this: 

// ____________________________

// function subtract(m,n) {
//   return m-n;
// }
// ____________________________
// `;
//           break;
//         }

//         case "superAddfunc": {
//           answer = `You can define the function like this: 

// ____________________________

// function superAdd(i, j, k) {
//   return i + j + k;
// }
// ____________________________
// `;
//           break;
//         }

//         case "doublefunc": {
//           answer = `You can define the function like this: 
// ____________________________

// function double(v) {
//   return 2*v;
// }
// ____________________________`;
//           break;
//         }
//         case "runsubtractfunc": {
//           answer = `You can run the subtract function like this: 
// ____________________________

// var result2 = subtract(10, 8);
// ____________________________`;
//           break;
//         }

//         case "runAvg": {
//           answer = `You can run the average function like this: 
// ____________________________

// var resultAvg = average(10, 8);
// ____________________________`;
//           break;
//         }

//         case "rundoublefunc": {
//           answer = `You can run the double function like this: 
// ____________________________

// var result3 = double(x);
// ____________________________`;
//           break;
//         }

//         case "arrayvar1": {
//           answer = `You can create the array like this: 
// ____________________________

// var IDs = [6, 8, 9];
// ____________________________`;
//           break;
//         }

//         case "arrayvarstring1": {
//           answer = `You can create the array like this: 
// ____________________________

// var names = ["Jim", "Mike", "Harry"];
// ____________________________`;
//           break;
//         }

//         case "arrayvar2": {
//           answer = `You can change the array like this: 
// ____________________________

// IDs[1] = 12;
// ____________________________`;
//           break;
//         }

//         case "arrayvarstring2": {
//           answer = `You can change the array like this: 
// ____________________________

// names[2] = "Scott";
// ____________________________`;
//           break;
//         }

//         case "arrayvar3": {
//           answer = `You can change Linda's age like this: 
// ____________________________

// students[0].age = 14;
// ____________________________`;
//           break;
//         }

//         case "arrayvarchangename": {
//           answer = `You can change the second student's name like this: 
// ____________________________

// students[1].name = "John";
// ____________________________`;
//           break;
//         }

//         case "arraytanks1": {
//           answer = `You can define and set the variable like this: 
// ____________________________

// var lastTankHealth = Tanks[Tanks.length - 1].health;
// ____________________________`;
//           break;
//         }

//         case "printmsgeasy": {
//           answer = `You can print the message like this: 
// ____________________________

// print("This is easy!");
// ____________________________`;
//           break;
//         }

//         case "printx": {
//           answer = `You can print the value of x like this: 
// ____________________________

// print(x);
// ____________________________`;
//           break;
//         }
//         case "printrandom": {
//           answer = `You can print the message like this: 
// ____________________________

// print("r is " + r);
// ____________________________`;
//           break;
//         }
//         case "printrandom2": {
//           answer = `You can print the message like this: 
// ______________________________________

// print("r is " + r + " and s is " + s);
// ______________________________________
// `;
//           break;
//         }
//         case "ticketprice1": {
//           answer = `You can set ticket price like this: 
// ____________________________

// if (age > 18) {
//   ticketPrice = 10;
// } else {
//   ticketPrice = 5;
// }           
// ____________________________`;
//           break;
//         }

//         case "setwinner": {
//           answer = `You can set winner like this: 
// ____________________________

// if (score2 > score1) {
//   winner = "Player2";
// }           
// ____________________________`;
//           break;
//         }

//         case "7counting1": {
//           answer = `Here is the sequence of numbers: 
// ____________________________

// 3 5 7 9           
// ____________________________`;
//           break;
//         }

//         case "7counting2": {
//           answer = `Here is the sequence of numbers: 
// ____________________________

// 9 8 7 6 5
// ____________________________`;
//           break;
//         }
//         case "7forloop1": {
//           answer = `Here is one way to write the for-loop: 
// ____________________________

// for(var j=4; j<=16; j=j+4) {
//   print(j);
// }
// ____________________________`;
//           break;
//         }
//         case "7forloop2": {
//           answer = `Here is one way to write the for-loop: 
// ____________________________

// for(var j=9; j>=1; j=j-2) {
//   print(j);
// }
// ____________________________`;
//           break;
//         }

//         case "7forloop3": {
//           answer = `Here is one way to write the for-loop: 
// ____________________________

// for(var j=16; j>=1; j=j/2) {
//   print(j);
// }
// ____________________________`;
//           break;
//         }

//         case "9nestfor1": {
//           answer = `Here is one way to write the for-loop: 
// ____________________________________

// for (var x=1; x<=2; x = x + 1) {
//   for (var y=1; y<=5; y = y + 2) {
//     print("x: " + x + " y: " + y);
//   }
// }
// ____________________________________`;
//           break;
//         }


//         case "9nestfor2": {
//           answer = `Here is one way to write the for-loop: 
// ____________________________________

// for (var x=4; x<=10; x = x + 3) {
//   for (var y=2; y<=6; y = y + 2) {
//     print("y: " + y + " x: " + x);
//   }
// }
// ____________________________________`;
//           break;
//         }

//         case "13break1": {
//           answer = `Here is one way to change the for-loop: 
// ____________________________

// if (k >= 4) {
//   break;
// }
// ____________________________`;
//           break;
//         }


//         case "13break2": {
//           answer = `Here is one way to change the for-loop: 
// ____________________________

// if (j >= 2) {
//   continue;
// }
// ____________________________`;
//           break;
//         }


//         case "13break3": {
//           answer = `Here is one way to change the for-loop: 
// ____________________________

// if (j >= 0) {
//   break;
// }
// ____________________________`;
//           break;
//         }

//         case "14callcalccutangle": {
//           answer = `Here is the correct way to calculate the cut angle: 
// ____________________________

// const angle1 = calculateCutAngle(10, 5);
// ____________________________`;
//           break;
//         }

//         case "14callcalcskewangle": {
//           answer = `Here is the correct way to calculate the skew angle: 
// ____________________________

// const angle2 = calculateSidePocketSkew(10, 4);
// ____________________________`;
//           break;
//         }

//         case "15mirror1": {
//           answer = `The y coordinate of the point N is 2*12-10, which is: 
// ____________________________

// 14
// ____________________________`;
//           break;
//         }

//         case "15mirror2": {
//           answer = `The y coordinate of the point N is 2*15-20, which is: 
// ____________________________

// 10
// ____________________________`;
//           break;
//         }

//         case "15mirror3": {
//           answer = `The x coordinate of the point N is 2*30-20, which is: 
// ____________________________

// 40
// ____________________________`;
//           break;
//         }

//         case "array2dvar1": {
//           answer = `You can create the array like this: 
// ____________________________

// var nums = [ [4, 9, 3], [11, 0, -2] ];
// ____________________________`;
//           break;
//         }

//         case "array2dvar2": {
//           answer = `You can change the array item like this: 
// ____________________________

// Array2D[1][2] = -5;
// ____________________________`;
//           break;
//         }

//         case "array2dvar3": {
//           answer = `You can get the sum of the array like this: 
// ____________________________

// for (var i = 0; i < nums.length; i += 1) {
//   sum += nums[i];
// }
// ____________________________`;
//           break;
//         }

//         case "array2dvar4": {
//           answer = `You can get the sum of the array like this: 
// ____________________________

// for (var i = 0; i < nums.length; i += 1) {
//   for (var j = 0; j < nums[i].length; j += 1) {
//     sum += nums[i][j];
//   }
// }
// ____________________________`;
//           break;
//         }

//         case "array2dvar5": {
//           answer = `The printouts are like this: 
// ____________________________

// M[0][0] is 12 
// M[0][1] is 3 
// M[0][2] is -1 
// M[1][0] is 2 
// M[1][1] is 5 
// M[1][2] is 4 
// ____________________________`;
//           break;
//         }

//         case "array2dvar6": {
//           answer = `You can generate the multiplication table like this: 
// ____________________________

// for (var i = 1; i <= 9; i += 1) {
//   var row = [];
//   for (var j = 1; j <= i; j += 1) {
//     row.push(i * j);
//   }
//   table.push(row);
// }
// ____________________________`;
//           break;
//         }

//         case "placeballqe": {
//           answer = `You can setup this test scenario like this: 
// ____________________________

// ResetTable(true);
// PlaceBallOnTable(0, 50, -300);
// PlaceBallOnTable(1, 300, 250);
// PlaceBallOnTable(4, -100, 200);
// ____________________________`;
//         break;
//         }
        
//         case "pathvar1": {
//           answer = `The steps in the path are like this: 
// ____________________________

// U R R U R U R R R
// ____________________________`;
//           break;
//         }

//         case "ternary1": {
//           answer = `The steps in the path are like this: 
// ____________________________

// var watchTV = isHomeworkDone ? "Sure!" : "No!";
// ____________________________`;
//           break;
//         }

//         case "placeballqe": {
//           answer = `You can setup this test scenario like this: 
// ____________________________

// ResetTable(true);
// PlaceBallOnTable(0, 50, -300);
// PlaceBallOnTable(1, 300, 250);
// PlaceBallOnTable(4, -100, 200);
// ____________________________`;
//           break;
//         }

//         default: {
//           break;
//         }
//       }


      var slider = document.createElement("div");
      slider.innerHTML = "";
      const p = answer.split("\n");
      for (let k=0; k<p.length; k++) {
        for (let j=0; j<p[k].length; j++) {
          if(p[k].charAt(j) != " ") break;
          slider.innerHTML += "&nbsp;";
        }
        slider.innerHTML += p[k];
        slider.innerHTML += "\n<br>";
      }

      swal({
        title: "Solution",
        content: slider,
        dangerMode: false,
        button: "Got it!",
      });

      // swal({
      //   html: true,
      //   title: "Solution",
      //   text: answer,
      //   // icon: "info",
      //   // buttons: false,
      //   dangerMode: false,
      //   button: "Got it!",
      // });

    });


    $( "#submitquickinput" ).mousedown(function(e){
      const { userLesson, slide, slideContent, setPaused } = that.props;
      const question = $("#userquickinputtext").attr("quickexercisequestion").trim();
      let userinputvalue = $( "#userquickinputtext" ).val().trim();


      let s = replaceAll(userinputvalue, " ", "");
      s = replaceAll(s, "\\n", "");

      if (s == "") {
        swal({
          // title: "Hint",
          text: "You haven't written any code in the text box yet.",
          icon: "error",
          // buttons: false,
          dangerMode: false,
          button: "Okay!",
        });
        return;
      }


      // if the user tries again after looking at hint, show solution
      if (hintClicked && slide.NODE != "extracredit") {
        const user = Meteor.user();
        if (user.showSolutionButton != false) {
          $("#answerquickinput").show();
        }
      }

      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();

      let prompt = "Sorry, that's not correct. Please try again.";
      try {
        
        switch(question) {
          case "emptyobjectdef": {
            if (s == "{}") {
              prompt = "success";
            }
            break;
          }
          case "objage12": {
            let testobj = null;
            eval("testobj = " + userinputvalue);
            if (testobj.age == 12) {
              prompt = "success";
            }
            break;
          }
          case "objheight23600": {
            let testobj = null;
            eval("testobj = " + userinputvalue);
            if (testobj.height == 23600) {
              prompt = "success";
            }
            break;
          }
          case "objagelinda": {
            let testobj = null;
            eval("testobj = " + userinputvalue);
            if (testobj.age == 12 && testobj.name == "Linda") {
              prompt = "success";
            }
            break;
          }
          case "objvarempty": {
            // let student = null;
            let student = Function('"use strict";' + userinputvalue + '; return student;')();
            // eval(userinputvalue);
            if (student != null && typeof(student) == "object") {
              prompt = "success";
            }
            break;
          }
          case "objvarage": {
            // let student = null;
            let student = Function('"use strict";' + userinputvalue + '; return student;')();
            // eval(userinputvalue);
            if (student != null && typeof(student) == "object" && student.age == 12) {
              prompt = "success";
            }
            break;
          }
          case "objvarheight": {
            // let student = null;
            let m = Function('"use strict";' + userinputvalue + '; return mountain;')();
            // eval(userinputvalue);
            if (m != null && typeof(m) == "object" && m.height == 23600 && m.name == "Everest") {
              prompt = "success";
            }
            break;
          }
          case "objvartablelegs": {
            // let student = null;
            let table = Function('"use strict";' + userinputvalue + '; return table;')();
            // eval(userinputvalue);
            if (table != null && typeof(table) == "object" && table.legs == 4) {
              prompt = "success";
            }
            break;
          }
          case "objvaragename": {
            // let student = null;
            if (userinputvalue.trim().indexOf("var") == 0) {
              prompt = "You don't need to redefine the student varible. You only need to add a new property to it."
            } else {
              let student = Function('"use strict"; var student = {age: 12}; ' + userinputvalue + '; return student;')();
              // eval(userinputvalue);
              if (student != null && typeof(student) == "object" && student.age == 12 && student.firstName == "Linda") {
                prompt = "success";
              }
            }
            break;
          }

          case "objvarmountainlongitude": {
            // let student = null;
            if (userinputvalue.trim().indexOf("var") == 0) {
              prompt = "You don't need to redefine the mountain varible. You only need to add a new property to it."
            } else {
              const mountain = Function('"use strict"; var mountain = {height: 23600}; ' + userinputvalue + '; return mountain;')();
              // eval(userinputvalue);
              if (mountain != null && typeof(mountain) == "object" && mountain.height == 23600 && mountain.longitude == 86) {
                prompt = "success";
              }
            }
            break;
          }

          case "objvartablename": {
            // let student = null;
            if (userinputvalue.trim().indexOf("var") == 0) {
              prompt = "You don't need to redefine the table varible. You only need to add a new property to it."
            } else {
              let obj = Function('"use strict"; var table = {legs: 4}; ' + userinputvalue + '; return table;')();
              // eval(userinputvalue);
              if (obj != null && typeof(obj) == "object" && obj.legs == 4 && obj.color == "black") {
                prompt = "success";
              }
            }
            break;
          }

          case "objvarage13": {
            // let student = null;
            if (userinputvalue.trim().indexOf("var") == 0) {
              prompt = `You don't need to redefine the student varible. You only need to change the "age" property.`
            } else {
              let student = Function('"use strict"; var student = {age: 12}; ' + userinputvalue + '; return student;')();
              // eval(userinputvalue);
              if (student != null && typeof(student) == "object" && student.age == 13) {
                prompt = "success";
              }
            }
            break;
          }

          case "objvarheight7200": {
            // let student = null;
            if (userinputvalue.trim().indexOf("var") == 0) {
              prompt = `You don't need to redefine the mountain varible. You only need to change the "height" property.`
            } else {
              const mountain = Function('"use strict"; var mountain = {height: 23600, name: "Everest"}; ' + userinputvalue + '; return mountain;')();
              // eval(userinputvalue);
              if (mountain != null && typeof(mountain) == "object" && mountain.height == 7200) {
                prompt = "success";
              }
            }
            break;
          }
          
          case "objvartableleg3": {
            // let student = null;
            if (userinputvalue.trim().indexOf("var") == 0) {
              prompt = `You don't need to redefine the table varible. You only need to change the "legs" property.`
            } else {
              let obj = Function('"use strict"; var table = {legs: 4}; ' + userinputvalue + '; return table;')();
              // eval(userinputvalue);
              if (obj != null && typeof(obj) == "object" && obj.legs == 3) {
                prompt = "success";
              }
            }
            break;
          }

          case "subtractfunc": {
            if (s.trim().indexOf("function") < 0) {
              prompt = `You need to start with the "function" keyword to define the function.`
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return subtract(5,3);')();
              // eval(userinputvalue);
              if (res != null && res == 2) {
                prompt = "success";
              }
            }
            break;
          }

          case "halffunctest": {
            if (s.trim().indexOf("function") < 0) {
              prompt = `You need to start with the "function" keyword to define the function.`
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return half(10);')();
              // eval(userinputvalue);
              if (res != null && res == 5) {
                prompt = "success";
              }
            }
            break;
          }

          case "superAddfunc": {
            if (s.trim().indexOf("function") < 0) {
              prompt = `You need to start with the "function" keyword to define the function.`
            } else if (s.trim().indexOf("superAdd") < 0) {
              prompt = `You need to name the function as superAdd.`
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return superAdd(1,3, 5);')();
              // eval(userinputvalue);
              if (res != null && res == 9) {
                prompt = "success";
              }
            }
            break;
          }

          case "squareFunc": {
            if (s.trim().indexOf("function") < 0) {
              prompt = `You need to start with the "function" keyword to define the function.`
            } else if (s.trim().indexOf("square") < 0) {
              prompt = `You need to name the function as square.`
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return square(4);')();
              // eval(userinputvalue);
              if (res != null && res == 16) {
                prompt = "success";
              }
            }
            break;
          }

          case "doublefunc": {
            if (s.trim().indexOf("function") < 0) {
              prompt = `You need to start with the "function" keyword to define the function.`
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return double(5);')();
              // eval(userinputvalue);
              if (res != null && res == 10) {
                prompt = "success";
              }
            }
            break;
          }

          case "runsubtractfunc": {
            if (s.indexOf("var") < 0 || s.indexOf("result2") < 0) {
              prompt = `You need to start with "var result2" to store the function output.`;
            } else if (s.indexOf("subtract") < 0 || s.indexOf("10") < 0 || s.indexOf("8") < 0) {
              prompt = `You need to call the "subtract" function with 2 arguments of 10 and 8.`;
            } else {
              let res = Function('"use strict"; function subtract(m, n) {return m - n;} ' + userinputvalue + '; return result2;')();
              // eval(userinputvalue);
              if (res != null && res == 2) {
                prompt = "success";
              }
            }
            break;
          }

          case "runhalffunc": {
            if (s.indexOf("var") < 0 || s.indexOf("resultHalf") < 0) {
              prompt = `You need to start with "var resultHalf" to store the function output.`;
            } else if (s.indexOf("half") < 0 || s.indexOf("12") < 0) {
              prompt = `You need to call the "half" function with the argument of 12.`;
            } else {
              let res = Function('"use strict"; function half(m) {return m/2;} ' + userinputvalue + '; return resultHalf;')();
              // eval(userinputvalue);
              if (res != null && res == 6) {
                prompt = "success";
              }
            }
            break;
          }

          case "runAvg": {
            if (s.indexOf("var") < 0 || s.indexOf("resultAvg") < 0) {
              prompt = `You need to start with "var resultAvg" to store the function output.`;
            } else if (s.indexOf("average") < 0 || s.indexOf("10") < 0 || s.indexOf("8") < 0) {
              prompt = `You need to call the "average" function with 2 arguments of 10 and 8.`;
            } else {
              let res = Function('"use strict"; function average(m, n) {return (m + n)/2;} ' + userinputvalue + '; return resultAvg;')();
              // eval(userinputvalue);
              if (res != null && Math.abs(res - 9) < 0.01) {
                prompt = "success";
              }
            }
            break;
          }

          case "runProduct": {
            if (s.indexOf("var") < 0 || s.indexOf("result3") < 0) {
              prompt = `You need to start with "var result3" to store the function output.`;
            } else if (s.indexOf("product") < 0 || s.indexOf("7") < 0 || s.indexOf("6") < 0) {
              prompt = `You need to call the "product" function with 2 arguments of 7 and 6.`;
            } else {
              let res = Function('"use strict"; function product(m, n) {return (m * n);} ' + userinputvalue + '; return result3;')();
              // eval(userinputvalue);
              if (res != null && Math.abs(res - 42) < 0.01) {
                prompt = "success";
              }
            }
            break;
          }

          case "rundoublefunc": {
            if (s.indexOf("var") < 0 || s.indexOf("result3") < 0) {
              prompt = `You need to start with "var result3" to store the function output.`;
            } else if (s.indexOf("double") < 0 || s.indexOf("x") < 0) {
              prompt = `You need to call the "double" function with the argument of x.`;
            } else {
              let res = Function('"use strict"; function double(v) {return 2*v;}; var x = 10; ' + userinputvalue + '; return result3;')();
              // eval(userinputvalue);
              if (res != null && res == 20) {
                prompt = "success";
              }
            }
            break;
          }

          case "runtriplefunchw": {
            if (s.indexOf("var") < 0 || s.indexOf("result4") < 0) {
              prompt = `You need to start with "var result4" to store the function output.`;
            } else if (s.indexOf("triple") < 0 || s.indexOf("x") < 0) {
              prompt = `You need to call the function "triple" with the argument of x.`;
            } else {
              let res = Function('"use strict"; function triple(v) {return 3*v;}; var x = 20; ' + userinputvalue + '; return result4;')();
              // eval(userinputvalue);
              if (res != null && res == 60) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvar1": {
            if (s.indexOf("var") < 0 || s.indexOf("IDs") < 0) {
              prompt = `You need to start with "var IDs" to create the variable`;
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return IDs;')();
              // eval(userinputvalue);
              if (res != null && res[0] == 6 && res[1] == 8 && res[2] == 9 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvar1hwt": {
            if (s.indexOf("var") < 0 || s.indexOf("colors") < 0) {
              prompt = `You need to start with "var colors" to create the variable`;
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return colors;')();
              // eval(userinputvalue);
              if (res != null && res[0] == "blue" && res[1] == "red" && res[2] == "green" ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvarstring1": {
            if (s.indexOf("var") < 0 || s.indexOf("names") < 0) {
              prompt = `You need to start with "var names" to create the variable`;
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return names;')();
              // eval(userinputvalue);
              if (res != null && res[0] == "Jim" && res[1] == "Mike" && res[2] == "Harry" ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvar2": {
            if (s.indexOf("var") >= 0) {
              prompt = `You don't need to redefine the IDs array. You only need to change its second item.`;
            } else {
              let res = Function('"use strict"; const IDs = [6, 8, 9]; ' + userinputvalue + '; return IDs;')();
              // eval(userinputvalue);
              if (res != null && res[0] == 6 && res[1] == 12 && res[2] == 9 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvar2hwt": {
            if (s.indexOf("var") >= 0) {
              prompt = `You don't need to redefine the colors array. You only need to change its third item.`;
            } else {
              let res = Function('"use strict"; const colors = ["blue", "red", "green"]; ' + userinputvalue + '; return colors;')();
              // eval(userinputvalue);
              if (res != null && res[0] == "blue" && res[1] == "red" && res[2] == "white" ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvarstring2": {
            if (s.indexOf("var") >= 0) {
              prompt = `You don't need to redefine the names array. You only need to change its last item.`;
            } else {
              let res = Function('"use strict"; const names = ["Jim", "Mike", "Harry"]; ' + userinputvalue + '; return names;')();
              // eval(userinputvalue);
              if (res != null && res[0] == "Jim" && res[1] == "Mike" && res[2] == "Scott" ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvar3": {
            if (s.indexOf("var") >= 0) {
              prompt = `You don't need to redefine the students array. You only need to change its first item.`;
            } else {
              let res = Function('"use strict"; const students = [{name: "Linda", age: 13},{name: "Joe", age: 15}];; ' + userinputvalue + '; return students;')();
              // eval(userinputvalue);
              if (res != null && res[0].age == 14 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvar3hwt": {
            if (s.indexOf("var") >= 0) {
              prompt = `You don't need to redefine the students array. You only need to change its second item.`;
            } else {
              let res = Function('"use strict"; const students = [{name: "Linda", age: 13},{name: "Joe", age: 15}];; ' + userinputvalue + '; return students;')();
              // eval(userinputvalue);
              if (res != null && res[1].name == "John" ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrayvarchangename": {
            if (s.indexOf("var") >= 0) {
              prompt = `You don't need to redefine the students array. You only need to change its second item.`;
            } else {
              let res = Function('"use strict"; const students = [{name: "Linda", age: 13},{name: "Joe", age: 15}];; ' + userinputvalue + '; return students;')();
              // eval(userinputvalue);
              if (res != null && res[1].name == "John" ) {
                prompt = "success";
              }
            }
            break;
          }

          case "arraytanks1": {
            if (s.indexOf("var") < 0 || s.indexOf("lastTankHealth") < 0) {
              prompt = `You need to define a new variable "lastTankHealth".`;
            } else if (s.indexOf("Tanks[Tanks.length") < 0) {
              prompt = `You need to access the last tank object in Tanks using the index "Tanks.length - 1".`;
            } else {
              let res = Function('"use strict"; const Tanks = [{health: 1000, color: "blue"},{health: 500, color: "white"}]; ' + userinputvalue + '; return lastTankHealth;')();
              if (res != null && res == 500 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "printmsgeasy": {

            if (s.indexOf("print(") < 0) {
              prompt = `You need to call the print function.`;
            } else {
              let res = Function('"use strict"; const print = (s) => {return s;}; const t = ' + userinputvalue + '; return t;')();
              // eval(userinputvalue);
              if (res == "This is easy!") {
                prompt = "success";
              }
            }
            break;

          }

          case "printx": {
            if (s.indexOf("print(") < 0 || s.indexOf("x") < 0) {
              prompt = `You need to call the print function with the argument of "x".`;
            } else if (s.indexOf("23") >= 0) {
              prompt = `You should use the variable x, not hardcoding the number 23.`;
            } else {
              let res = Function('"use strict"; var x = 4545; const print = (s) => {return s;}; const t = ' + userinputvalue + '; return t;')();
              // eval(userinputvalue);
              if (res == "4545") {
                prompt = "success";
              }
            }
            break;

          }

          case "printxyhw": {
            if (s.indexOf("print(") < 0 || s.indexOf("x") < 0 || s.indexOf("y") < 0) {
              prompt = `You need to call the print function and create a string template using x and y.`;
            } else if (s.indexOf("23") >= 0 || s.indexOf("44") >= 0) {
              prompt = `You should use the variables x and y, not the numbers 23 or 44 themselves.`;
            } else {
              let res = Function('"use strict"; var x = 45; var y = 56; const print = (s) => {return s;}; const t = ' + userinputvalue + '; return t;')();
              // eval(userinputvalue);
              if (res == "x is 45 and y is 56") {
                prompt = "success";
              }
            }
            break;

          }

          case "printrandom": {
            if (s.indexOf("print(") < 0) {
              prompt = `You need to call the print function.`;
            } else {
              let res = Function('"use strict"; var r = 4545; const print = (s) => {return s;}; const t = ' + userinputvalue + '; return t;')();
              // eval(userinputvalue);
              if (res == "r is 4545") {
                prompt = "success";
              }
            }
            break;
          }

          case "printpointhw": {
            if (s.indexOf("print(") < 0) {
              prompt = `You need to call the print function.`;
            } else if ( s.indexOf("points[1].x") < 0 || s.indexOf("points[1].y") < 0 ) {
              prompt = `You need to use points[1].x and points[1].y to compose the output string.`;
            } else {
              let res = Function('"use strict"; var points = [{x: 20, y: 30},{x: 42, y: 52}]; const print = (s) => {return s;}; const t = ' + userinputvalue + '; return t;')();
              // eval(userinputvalue);
              if (res == "The second point is (42, 52)") {
                prompt = "success";
              }
            }
            break;
          }

          case "printrandom2": {
            if (s.indexOf("print(") < 0) {
              prompt = `You need to call the print function.`;
            } else {
              let res = Function('"use strict"; var r = 4545; var s = 5656; const print = (s) => {return s;}; const t = ' + userinputvalue + '; return t;')();
              // eval(userinputvalue);
              if (res == "r is 4545 and s is 5656") {
                prompt = "success";
              }
            }
            break;
          }

          case "ticketprice1": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an "if" statement.`;
            } else {
              let res1 = Function('"use strict"; var age = 18; var ticketPrice = 0; ' + userinputvalue + '; return ticketPrice;')();
              let res2 = Function('"use strict"; var age = 19; var ticketPrice = 0; ' + userinputvalue + '; return ticketPrice;')();
              // eval(userinputvalue);
              if (res1 == 5 && res2 == 10) {
                prompt = "success";
              }
            }
            break;
          }

          case "gradetest1": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an "if" statement.`;
            } else {
              let res1 = Function('"use strict"; var score = 90; var grade = ""; ' + userinputvalue + '; return grade;')();
              let res2 = Function('"use strict"; var score = 89; var grade = ""; ' + userinputvalue + '; return grade;')();
              // eval(userinputvalue);
              if (res1 == "A" && res2 == "B") {
                prompt = "success";
              }
            }
            break;
          }

          case "logicalqe1": {
            if (s.indexOf("&&") < 0) {
              prompt = `You need to use an "AND" operator "&&".`;
            } else {
              let res1 = Function('"use strict"; var m = 1; var n = 1; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
              let res2 = Function('"use strict"; var m = 1; var n = -1; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
              let res3 = Function('"use strict"; var m = -1; var n = 1; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
              let res4 = Function('"use strict"; var m = -1; var n = -1; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
              // eval(userinputvalue);
              if (res1 == true && res2 == false && res3 == false && res4 == false) {
                prompt = "success";
              }
            }
            break;
          }


          case "logicalqe1test1": {
            if (s.indexOf("&&") < 0) {
              prompt = `You need to use an "AND" operator "&&".`;
            } else {
              let res1 = Function('"use strict"; var m = 1; var n = 1; var bothAreNegative = ' + userinputvalue + '; return bothAreNegative;')();
              let res2 = Function('"use strict"; var m = 1; var n = -1; var bothAreNegative = ' + userinputvalue + '; return bothAreNegative;')();
              let res3 = Function('"use strict"; var m = -1; var n = 1; var bothAreNegative = ' + userinputvalue + '; return bothAreNegative;')();
              let res4 = Function('"use strict"; var m = -1; var n = -1; var bothAreNegative = ' + userinputvalue + '; return bothAreNegative;')();
              // eval(userinputvalue);
              if (res1 == false && res2 == false && res3 == false && res4 == true) {
                prompt = "success";
              }
            }
            break;
          }

          case "logicalqe2": {
            let res1 = Function('"use strict"; var m = "blue"; var n = "blue"; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
            let res2 = Function('"use strict"; var m = "blue"; var n = "red"; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
            let res3 = Function('"use strict"; var m = "red"; var n = "blue"; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
            let res4 = Function('"use strict"; var m = "red"; var n = "red"; var bothArePositive = ' + userinputvalue + '; return bothArePositive;')();
            // eval(userinputvalue);
            if (res1 == false && res2 == true && res3 == true && res4 == true) {
              prompt = "success";
            }
            break;
          }

          case "gradehwt": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an "if" statement.`;
            } else {
              let res1 = Function('"use strict"; var score = 90; var grade = ""; ' + userinputvalue + '; return grade;')();
              let res2 = Function('"use strict"; var score = 89; var grade = ""; ' + userinputvalue + '; return grade;')();
              // eval(userinputvalue);
              if (res1 == "A" && res2 == "B") {
                prompt = "success";
              }
            }
            break;
          }

          case "testResultqe": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an "if-else" statement.`;
            } else {
              let res1 = Function('"use strict"; var testScore = 60; var testResult = ""; ' + userinputvalue + '; return testResult;')();
              let res2 = Function('"use strict"; var testScore = 59; var testResult = ""; ' + userinputvalue + '; return testResult;')();
              // eval(userinputvalue);
              if (res1 == "Pass" && res2 == "Fail") {
                prompt = "success";
              }
            }
            break;
          }

          case "setwinner": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an "if" statement.`;
            } else if (s.indexOf("winner=") < 0) {
              prompt = `You need to set the winner in the "if" statement block.`;
            } else {
              let res = Function('"use strict"; var score1 = 10; var score2 = 15; var winner="Player1"; ' + userinputvalue + '; return winner;')();
              let res2 = Function('"use strict"; var score1 = 10; var score2 = 5; var winner="Player1"; ' + userinputvalue + '; return winner;')();
              // eval(userinputvalue);
              if (res == "Player2" && res2 == "Player1") {
                prompt = "success";
              }
            }
            break;
          }

          case "setwinnerhwt": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an "if" statement.`;
            } else if (s.indexOf("winner=") < 0) {
              prompt = `You need to set the winner in the "if" statement block.`;
            } else {
              let res = Function('"use strict"; var score1 = 10; var score2 = 15; var winner="Player2"; ' + userinputvalue + '; return winner;')();
              let res2 = Function('"use strict"; var score1 = 10; var score2 = 10; var winner="Player2"; ' + userinputvalue + '; return winner;')();
              // eval(userinputvalue);
              if (res == "Player2" && res2 == "Player1") {
                prompt = "success";
              }
            }
            break;
          }

          case "7counting1": {
            s = replaceAll(s, ",", "");
            s = replaceAll(s, ";", "");
            if (s == "3579") {
              prompt = "success";
            }
            break;
          }

          case "7counting1hw": {
            s = replaceAll(s, ",", "");
            s = replaceAll(s, ";", "");
            if (s == "58111417") {
              prompt = "success";
            }
            break;
          }

          case "7counting1hwt": {
            s = replaceAll(s, ",", "");
            s = replaceAll(s, ";", "");
            if (s == "32343") {
              prompt = "success";
            }
            break;
          }

          case "7counting2": {
            s = replaceAll(s, ",", "");
            if (s == "98765") {
              prompt = "success";
            }
            break;
          }

          case "7counting2hw": {
            s = replaceAll(s, ",", "");
            if (s == "15117") {
              prompt = "success";
            }
            break;
          }

          case "7counting2hwt": {
            s = replaceAll(s, ",", "");
            if (s == "90-9") {
              prompt = "success";
            }
            break;
          }

          case "7forloop1": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 4 && output[1] == 8 && output[2] == 12 && output[3] == 16 && output.length == 4) {
                prompt = "success";
              }
            }
            break;
          }

          case "7forloop1test1": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 28 && output[1] == 20 && output[2] == 12 && output[3] == 4) {
                prompt = "success";
              }
            }
            break;
          }
          
          case "7forloop1hw": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 1 && output[1] == 3 && output[2] == 5 && output[3] == 7  && output[4] == 9 && output[5] == 11 && output.length == 6) {
                prompt = "success";
              }
            }
            break;
          }

          case "7forloop1hwt": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 1 && output[1] == 4 && output[2] == 7 && output[3] == 10 && output.length == 4) {
                prompt = "success";
              }
            }
            break;
          }
          
          case "7forloop2": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 9 && output[1] == 7 && output[2] == 5 && output[3] == 3 && output[4] == 1  && output.length == 5) {
                prompt = "success";
              }
            }
            break;
          }


          case "7forloop2hw": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 9 && output[1] == 8 && output[2] == 7 && output[3] == 6 && output[4] == 5 && output[5] == 4 && output[6] == 3 && output[7] == 2  && output.length == 8) {
                prompt = "success";
              }
            }
            break;
          }

          case "7forloop2hwt": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 10 && output[1] == 5 && output[2] == 0 && output[3] == -5 && output.length == 4) {
                prompt = "success";
              }
            }
            break;
          }

          case "7forloop3": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else if (s.indexOf("8") >= 0 && s.indexOf("4") >= 0) {
              prompt = `You should not print the numbers directly. You should print the index variable instead.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 16 && output[1] == 8 && output[2] == 4 && output[3] == 2 && output[4] == 1) {
                prompt = "success";
              }
            }
            break;
          }

          case "7forloop3hwt": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else if (s.indexOf("8") >= 0 && s.indexOf("4") >= 0) {
              prompt = `You should not print the numbers directly. You should print the index variable instead.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && output[0] == 2 && output[1] == 4 && output[2] == 8 && output[3] == 16 && output.length == 4) {
                prompt = "success";
              }
            }
            break;
          }

          case "9nestfor1": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 6 && output[0] == "x: 1 y: 1" && output[1] == "x: 1 y: 3" && output[2] == "x: 1 y: 5" && output[3] == "x: 2 y: 1" && output[4] == "x: 2 y: 3" && output[5] == "x: 2 y: 5") {
                prompt = "success";
              }
            }
            break;
          }


          case "9nestfor1hw": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use 2 for-loops.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function inside the for-loops.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 9 && output[0] == "x: 4 y: 1" && output[1] == "x: 4 y: 4" && output[2] == "x: 4 y: 7" && output[3] == "x: 3 y: 1" && output[4] == "x: 3 y: 4" && output[5] == "x: 3 y: 7"  && output[6] == "x: 2 y: 1" && output[7] == "x: 2 y: 4" && output[8] == "x: 2 y: 7") {
                prompt = "success";
              }
            }
            break;
          }

          case "definelookupicescream": {
            {
              let output = Function('"use strict"; var iceCreamPrices = {}; ' + userinputvalue + '; return iceCreamPrices;')();
              if (output != null && typeof(output) != "undefined" && output["orange"] == 2 && output["chocolate"] == 2.5 && output["strawberry"] == 1.5) {
                prompt = "success";
              }
            }
            break;
          }

          case "buycheapericescream": {
            {
              let output = Function('"use strict"; var iceCreamToBuy = null; var iceCreamPrices = {"orange": 10, "chocolate": 20}; ' + userinputvalue + '; var a1 = iceCreamToBuy; iceCreamPrices = {"orange": 20, "chocolate": 10}; ' + userinputvalue + '; var a2 = iceCreamToBuy; return a1 + " " + a2;')();
              if (output != null && typeof(output) != "undefined" && output == "orange chocolate") {
                prompt = "success";
              }
            }
            break;
          }

          case "9nestfor2": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use a for-loop.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 9) {
                var hasIssue = false;
                var k = 0;
                for (var x=4; x<=10; x = x + 3) {
                  for (var y=2; y<=6; y = y + 2) {
                    if (output[k++] != "y: " + y + " x: " + x) {
                      hasIssue = true; break;
                    }
                  }
                }
                if (!hasIssue) {
                  prompt = "success";
                }
              }
            }
            break;
          }

          case "9nestfor2hw": {
            if (s.indexOf("for(") < 0) {
              prompt = `You need to use 2 for-loops.`;
            } else if (s.indexOf("print(") < 0) {
              prompt = `You need to use the "print" function inside the for-loops.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; ' + userinputvalue + '; return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 9) {
                var hasIssue = false;
                var k = 0;
                for (var x=9; x>=5; x = x -2) {
                  for (var y=2; y<=6; y = y + 2) {
                    if (output[k++] != "y: " + y + " x: " + x) {
                      hasIssue = true; break;
                    }
                  }
                }                
                if (!hasIssue) {
                  prompt = "success";
                }
              }
            }
            break;
          }

          case "13break1": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=0; j<=8; j = j+2) { print(j); ' + userinputvalue + '; } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 3 && output[0] == 0 && output[1] == 2 && output[2] == 4) {
                prompt = "success";
              }
            }
            break;
          }

          case "13break2": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=0; j<=4; j=j+2) { print(j + " A"); ' + userinputvalue + '; print(j + " B"); } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 4 && output[0] == "0 A" && output[1] == "0 B" && output[2] == "2 A" && output[3] == "4 A") {
                prompt = "success";
              }
            }
            break;
          }

          case "13break2test1": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=4; j>=0; j=j-2) { print(j + " A"); ' + userinputvalue + '; print(j + " B"); } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 4 && output[0] == "4 A" && output[1] == "2 A" && output[2] == "0 A" && output[3] == "0 B") {
                prompt = "success";
              }
            }
            break;
          }

          case "13break2hw": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=0; j<=4; j=j+2) { print(j + " A"); ' + userinputvalue + '; print(j + " B"); } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 4 && output[0] == "0 A" && output[1] == "2 A" && output[2] == "4 A" && output[3] == "4 B") {
                prompt = "success";
              }
            }
            break;
          }

          case "13break2hwt": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=0; j<=6; j=j+3) { print(j + " A"); ' + userinputvalue + '; print(j + " B"); } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 5 && output[0] == "0 A" && output[1] == "0 B" && output[2] == "3 A" && output[3] == "6 A" && output[4] == "6 B") {
                prompt = "success";
              }
            }
            break;
          }

          case "13break3": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=0; j<=4; j=j+2) { print(j + " A"); ' + userinputvalue + '; print(j + " B"); } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 1 && output[0] == "0 A") {
                prompt = "success";
              }
            }
            break;
          }

          case "13break3hw": {
            if (s.indexOf("if(") < 0) {
              prompt = `You need to use an if statement.`;
            } else {
              let output = Function('"use strict"; var output=[]; const print = (s) => {output.push(s);}; for (let j=0; j<=4; j=j+2) { print(j + " A"); ' + userinputvalue + '; print(j + " B"); } return output;')();
              if (output != null && typeof(output) != "undefined" && output.length == 3 && output[0] == "0 A" && output[1] == "0 B" && output[2] == "2 A") {
                prompt = "success";
              }
            }
            break;
          }

          case "14callcalccutangle": {
            if (s.indexOf("calculateCutAngle(") < 0) {
              prompt = `You need to call the calculateCutAngle function.`;
            } else if (s.indexOf("angle1") < 0 || s.indexOf("const") < 0) {
              prompt = `You need to save the result in a const named 'angle1'.`;
            } else {
              let output = Function(`"use strict"; const calculateCutAngle = (bid, pid) => { if (bid == 10 && pid == 5) { return 'good'; } else { return 'you need to pass in ball ID of 10 and pocket ID of 5'; }  }; ` + userinputvalue + `; return angle1;`)();
              if (output != null && typeof(output) != "undefined") {
                if (output == 'good') {
                  prompt = "success";
                } else {
                  prompt = output;
                }
              }
            }
            break;
          }


          case "14callcalccutanglehw": {
            if (s.indexOf("calculateCutAngle(") < 0) {
              prompt = `You need to call the calculateCutAngle function.`;
            } else if (s.indexOf("angle4") < 0 || s.indexOf("const") < 0) {
              prompt = `You need to save the result in a const named 'angle4'.`;
            } else {
              let output = Function(`"use strict"; const M = 3; const calculateCutAngle = (bid, pid) => { if (bid == M && pid == 4) { return 'good'; } else { return 'you need to pass in ball ID of M and pocket ID of 4'; }  }; ` + userinputvalue + `; return angle4;`)();
              if (output != null && typeof(output) != "undefined") {
                if (output == 'good') {
                  prompt = "success";
                } else {
                  prompt = output;
                }
              }
            }
            break;
          }

          case "14callcalcskewangle": {
            if (s.indexOf("calculateSidePocketSkew(") < 0) {
              prompt = `You need to call the calculateSidePocketSkew function.`;
            } else if (s.indexOf("angle2") < 0 || s.indexOf("const") < 0) {
              prompt = `You need to save the result in a const named 'angle2'.`;
            } else {
              let output = Function(`"use strict"; const calculateSidePocketSkew = (bid, pid) => { if (bid == 10 && pid == 4) { return 'good'; } else { return 'you need to pass in ball ID of 10 and pocket ID of 4'; }  }; ` + userinputvalue + `; return angle2;`)();
              if (output != null && typeof(output) != "undefined") {
                if (output == 'good') {
                  prompt = "success";
                } else {
                  prompt = output;
                }
              }
            }
            break;
          }

          case "14callcalcskewanglehw": {
            if (s.indexOf("calculateSidePocketSkew(") < 0) {
              prompt = `You need to call the calculateSidePocketSkew function.`;
            } else if (s.indexOf("angleTop") < 0 || s.indexOf("const") < 0) {
              prompt = `You need to save the result in a const named 'angleTop'.`;
            } else {
              let output = Function(`"use strict"; const calculateSidePocketSkew = (bid, pid) => { if (bid == 12 && pid == 1) { return 'good'; } else { return 'you need to pass in ball ID of 12 and pocket ID of 1'; }  }; ` + userinputvalue + `; return angleTop;`)();
              if (output != null && typeof(output) != "undefined") {
                if (output == 'good') {
                  prompt = "success";
                } else {
                  prompt = output;
                }
              }
            }
            break;
          }

          case "15mirror1": {
            if (s == "14") {
              prompt = "success";
            }
            break;
          }

          case "15mirror2": {
            if (s == "10") {
              prompt = "success";
            }
            break;
          }

          case "15mirror3": {
            if (s == "40") {
              prompt = "success";
            }
            break;
          }

          case "array2dvar1": {
            if (s.indexOf("var") < 0 || s.indexOf("nums") < 0) {
              prompt = `You need to start with "var nums" to create the variable`;
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return nums;')();
              // eval(userinputvalue);
              if (res != null && res.length == 2 && res[0].length == 3 && res[1].length == 3
                && res[0][0] == 4 && res[0][1] == 9 && res[0][2] == 3
                && res[1][0] == 11 && res[1][1] == 0 && res[1][2] == -2 ) {
                prompt = "success";
              } 
            }
            break;
          }

          case "array2dvar1hwt": {
            if (s.indexOf("var") < 0 || s.indexOf("nums") < 0) {
              prompt = `You need to start with "var nums" to create the variable`;
            } else {
              let res = Function('"use strict"; ' + userinputvalue + '; return nums;')();
              // eval(userinputvalue);
              if (res != null && res.length == 3 && res[0].length == 2 && res[1].length == 2
                && res[0][0] == 4 && res[0][1] == 9 && res[1][0] == 11
                && res[1][1] == 0 && res[2][0] == 5 && res[2][1] == 3 ) {
                prompt = "success";
              } 
            }
            break;
          }

          case "array2dvar2": {
            if (s.indexOf("Array2D[") < 0 ) {
              prompt = `You need to start with "Array2D" to change the target array item`;
            } else {
              let res = Function('"use strict"; var Array2D = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]; ' + userinputvalue + '; return Array2D;')();
              // eval(userinputvalue);
              if (res != null && res[1][2] == -5 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "array2dvar2test1": {
            if (s.indexOf("Array2D[") < 0 ) {
              prompt = `You need to start with "Array2D" to change the target array item`;
            } else {
              let res = Function('"use strict"; var Array2D = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]; ' + userinputvalue + '; return Array2D;')();
              // eval(userinputvalue);
              if (res != null && res[0][2] == -2 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "array2dvar2hwt": {
            if (s.indexOf("Array2D[") < 0 ) {
              prompt = `You need to start with "Array2D" to change the target array item`;
            } else {
              let res = Function('"use strict"; var Array2D = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]; ' + userinputvalue + '; return Array2D;')();
              // eval(userinputvalue);
              if (res != null && res[0][2] == 4 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "array2dvar3": {
            const count = (s.match(/\x2B/g) || []).length;
            const digits = s.replace( /\D+/g, '').split('');
            if ((digits.filter(d => d != '1' && d != '0') || []).length > 0 || count > 3) {
              prompt = "You cannot hard-code the numbers. You need to write a for-loop and use the array's length in the test condition."
            } else if (s.indexOf("for") < 0 ) {
              prompt = `You need to write a for-loop to go through the array "nums"`;
            // } else if (count < 1) {
            //   prompt = `You have to add each item to "sum" using "+"`;
            } else {
              let res = Function('"use strict"; setTimeout(function () {throw "timeout";}, 100); var nums = [0, 1, 2, 3, 4, 5, 6, 7, 8]; var sum = 0; ' + userinputvalue + '; return sum;')();
              // eval(userinputvalue); 
              if (res != null && res == 36 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "array2dvar4": {
            const countOfFor = (s.match(/for/g) || []).length;
            const count = (s.match(/\x2B/g) || []).length;
            const digits = s.replace( /\D+/g, '').split('');
            if ((digits.filter(d => d != '1' && d != '0') || []).length > 0) {
              prompt = "You cannot hard-code the numbers. You need to write a for-loop and use the array's length in the test condition."
            } else if (countOfFor < 2) {
              prompt = `You have to write a nested for-loop to add each item to "sum"`;
            } else {
              let res = Function('"use strict"; var nums = [[0, 1, 2], [3, 4, 5], [6, 7, 7]]; var sum = 0; ' + userinputvalue + '; return sum;')();
              // eval(userinputvalue); 
              if (res != null && res == 35 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "array2dvar4hwt": {
            const countOfFor = (s.match(/for/g) || []).length;
            const count = (s.match(/\x2B/g) || []).length;
            const digits = s.replace( /\D+/g, '').split('');
            if ((digits.filter(d => d != '1' && d != '0') || []).length > 0) {
              prompt = "You cannot hard-code the numbers. You need to write a for-loop and use the array's length in the test condition."
            } else if (countOfFor < 2) {
              prompt = `You have to write a nested for-loop to add each item to "sum"`;
            } else {
              let res = Function('"use strict"; var scores = [[100, 99, 95], [83, 97, 88]]; var total = 0; ' + userinputvalue + '; return total;')();
              // eval(userinputvalue); 
              if (res != null && res == 100 + 99 + 95 + 83 + 97 + 88 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "array2dvar5": {
            const i00 = s.indexOf('M[0][0]is12'), i01 = s.indexOf('M[0][1]is3'), i02 = s.indexOf('M[0][2]is-1');
            const i10 = s.indexOf('M[1][0]is2'), i11 = s.indexOf('M[1][1]is5'), i12 = s.indexOf('M[1][2]is4');
            
            if (i00 >= 0 && i01 > i00 && i02 > i01 && i10 > i02 && i11 > i10 && i12 > i11) {
              prompt = "success";
            } else {
              prompt = `You need to type in the expected outputs one by one in the correct order.`;
            }
            break;
          }

          case "array2dvar6": {
            const answer = [
              [1],
              [2, 4],
              [3, 6, 9],
              [4, 8, 12, 16],
              [5, 10, 15, 20, 25],
              [6, 12, 18, 24, 30, 36],
              [7, 14, 21, 28, 35, 42, 49],
              [8, 16, 24, 32, 40, 48, 56, 64],
              [9, 18, 27, 36, 45, 54, 63, 72, 81]
            ];
            let res = Function('"use strict"; var table = []; ' + userinputvalue + '; return table;')();
            let flag = true;
            for (let i = 0; i < answer.length; i += 1) {
              for (let j = 0; j < answer[i].length; j += 1) {
                if (i >= res.length || res[i][j] != answer[i][j]) {
                  flag = false;
                  break;
                }
              }
            }
            const digits = s.replace( /\D+/g, '').split('');
            if ((digits.filter(d => d != '1' && d != '0' && d != '9') || []).length > 0) {
              prompt = "You cannot hard-code the numbers. You have to write a nested for-loop."
            } else if (flag) {
              prompt = "success";
            } else {
              prompt = "The table is not generated correctly."
            }
            break;
          }

          case "placeballqe": {
            if (s.indexOf("ResetTable(true)") < 0) {
              prompt = `You need to clear all the balls first using ResetTable.`;
            } else if (s.indexOf("PlaceBallOnTable(") < 0) {
              prompt = `You need to use the "PlaceBallOnTable" function.`;
            } else {
              let output = Function('"use strict"; var balls={"3": {x: 1, y:1}}; const ResetTable = (c) => {if(c) balls = {};}; const PlaceBallOnTable = (bid, a, b) => { balls[bid] = {x: a, y: b}   }; ' + userinputvalue + '; return balls;')();
              if (output != null && typeof(output) != "undefined" && !output["3"] && output["0"].x == 50 && output["0"].y == -300 && output["1"].x == 300 && output["1"].y == 250 && output["4"].x == -100 && output["4"].y == 200 ) {
                prompt = "success";
              }
            }
            break;
          }

          case "pathvar1": {
            s = s.toUpperCase();
            const numOfU = (s.match(/U/g) || []).length;
            const numOfR = (s.match(/R/g) || []).length;
            if (numOfU != 3) prompt = `There should be three "U" steps. `;
            else if (numOfR != 6) prompt = `There should be six "R" steps. `;
            else if (!s.includes("'") && !s.includes('"')) {
              prompt = `You need to quote your answer with a pair of quotation marks.`;
            } else {
              s = replaceAll(s, " ", "");
              if (s == '"URRURURRR"' || s == "'URRURURRR'") prompt = "success";
            }
            
            break;
          }

          case "pathvar1test1": {
            s = s.toUpperCase();
            const numOfU = (s.match(/U/g) || []).length;
            const numOfR = (s.match(/R/g) || []).length;
            if (numOfR != 3) prompt = `There should be 3 "R" steps. `;
            else if (numOfU != 5) prompt = `There should be 5 "U" steps. `;
            else if (!s.includes("'") && !s.includes('"')) {
              prompt = `You need to quote your answer with a pair of quotation marks.`;
            } else {
              s = replaceAll(s, " ", "");
              if (s == '"UURURRUU"' || s == "'UURURRUU'") prompt = "success";
            }
            
            break;
          }

          case "pathvar1hwt": {
            s = s.toUpperCase();
            const numOfU = (s.match(/U/g) || []).length;
            const numOfR = (s.match(/R/g) || []).length;
            if (numOfU != 3) prompt = `There should be 3 "U" steps. `;
            else if (numOfR != 6) prompt = `There should be 6 "R" steps. `;
            else if (!s.includes("'") && !s.includes('"')) {
              prompt = `You need to quote your answer with a pair of quotation marks.`;
            } else {
              s = replaceAll(s, " ", "");
              if (s == '"URRRRUURR"' || s == "'URRRRUURR'") prompt = "success";
            }
            
            break;
          }

          case "astar1": {
            s = s.toUpperCase();
            s = replaceAll(s, " ", "");
            const answers = [
              '"URRRRRUU"',
              '"URRRRURU"',
              '"URRRRUUR"',
              '"RRRRRUUU"',
              '"RRRRURUU"',
              '"RRRRUURU"',
              '"RRRRUUUR"',
            ];
            if (answers.includes(s)) prompt = "success";
            const numOfU = (s.match(/U/g) || []).length;
            const numOfR = (s.match(/R/g) || []).length;
            if (numOfU != 3) prompt = `There should be three "U" steps. `;
            else if (numOfR != 5) prompt = `There should be five "R" steps. `;
            
            break;
          }

          case "astar2": {
            s = s.toUpperCase();
            s = replaceAll(s, " ", "");
            const answers = [
              '"URRRRRRD"',
              '"URRRDRRR"',
              '"URRRRDRR"',
              '"URRRRRDR"'
            ];
            if (answers.includes(s)) prompt = "success";
            
            break;
          }

          case "astar2hwt": {
            s = s.toUpperCase();
            s = replaceAll(s, " ", "");
            const answers = [
              '"URRDDDDLLU"',
            ];
            if (answers.includes(s)) prompt = "success";
            
            break;
          }

          case "astar3": {
            const numOf0 = (s.match(/0/g) || []).length;
            const numOf1 = (s.match(/1/g) || []).length;
            if (numOf0 != 12) prompt = `There should be 12 blocked tiles. `;
            else if (numOf1 != 16) prompt = `There should be 16 open tiles. `;
            let output = Function('"use strict"; ' + userinputvalue + '; return graph;')();
            const answer = [
              [0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1],
              [1, 0, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 1, 1]
            ];
            if (output != null && typeof(output) != "undefined") {
              let flag = true;
              for (let i = 0; i < 4; i += 1) {
                for (let j = 0; j < 7; j += 1) {
                  if (output[i] == undefined || output[i][j] == undefined || output[i][j] != answer[i][j]) 
                  {
                    flag = false;
                    prompt = `The value at (${i}, ${j}) is not correct. `
                    break;
                  }
                }
              }
              if (flag) prompt = "success";
            }

            break;
          }

          case "astar3hwt": {
            const numOf0 = (s.match(/0/g) || []).length;
            const numOf1 = (s.match(/1/g) || []).length;
            if (numOf0 != 9) prompt = `There should be 9 blocked tiles. `;
            else if (numOf1 != 7) prompt = `There should be 7 open tiles. `;
            let output = Function('"use strict"; ' + userinputvalue + '; return graph;')();
            const answer = [
              [0, 0, 0, 0],
              [0, 1, 1, 1],
              [0, 1, 1, 0],
              [0, 1, 1, 0]
            ];
            if (output != null && typeof(output) != "undefined") {
              let flag = true;
              for (let i = 0; i < 4; i += 1) {
                for (let j = 0; j < 4; j += 1) {
                  if (output[i] == undefined || output[i][j] == undefined || output[i][j] != answer[i][j]) 
                  {
                    flag = false;
                    prompt = `The value at (${i}, ${j}) is not correct. `
                    break;
                  }
                }
              }
              if (flag) prompt = "success";
            }

            break;
          }

          case "astar4": {
            s = s.toUpperCase();
            s = replaceAll(s, " ", "");
            const answers = [
              '"RDRRURU"',
              '"RDRRUUR"',
              '"DRRRRUU"',
              '"DRRRURU"',
              '"DRRRUUR"'
            ];

            if (answers.includes(s)) prompt = "success";
            
            break;
          }

          case "astar5": {
            s = s.toUpperCase();
            s = replaceAll(s, " ", "");
            const answers = [
              '"LUUURRRRRDD"',
              '"ULUURRRRRDD"'
            ];
            if (answers.includes(s)) prompt = "success";
            
            break;
          }

          case "searchforbest": {
            if (s.indexOf('for') < 0) {
              prompt = "Please write a for-loop to go through each name in names. "
            } else if (s.indexOf('Christopher') >= 0) {
              prompt = "You can not hardcode the answer. Please write a for-loop."
            } else {
              let output = Function('"use strict"; var longest = ""; var names = ["Lisa", "William", "Christopher", "Tiffany", "Quiana", "Leo"]; ' + userinputvalue + '; return longest;')();
              if (output != null && typeof(output) != "undefined" && output == 'Christopher') {
                prompt = "success";
              }
            }
            break;
          }

          case "includesvsfind": {
            if (s.indexOf('students.find(') < 0) {
              prompt = "Please call the array function find on students. "
            } else {
              let output = Function('"use strict"; var students = [{ id: 0, name: "Mike" },{ id: 1, name: "Tom" },{ id: 2, name: "Crag" }]; var s1 = { id: 2, name: "Crag" };' + userinputvalue + '; return result;')();
              if (output != null && typeof(output) != "undefined" && output == true) {
                prompt = "success";
              }
            }
            break;
          }

          case "forofexe": {
            if (s.indexOf('of') < 0) {
              prompt = "Please write a for-loop in this format: 'for (var variableName of arrayName)'."
            } else {
              let output = Function('"use strict"; var array1 = [2, 7, 13, -7]; ' + userinputvalue + '; return sum;')();
              if (output != null && typeof(output) != "undefined" && output === 15) {
                prompt = "success";
              }
            }
            break;
          }

          case "searchforbesthwt": {
            if (s.indexOf('for') < 0) {
              prompt = "Please write a for-loop to go through each name in names. "
            } else {
              let output = Function('"use strict"; var shortest = "areallylongname"; var names = ["Lisa", "William", "Christopher", "Tiffany", "Quiana", "Jo"]; ' + userinputvalue + '; return shortest;')();
              if (output != null && typeof(output) != "undefined" && output == 'Jo') {
                prompt = "success";
              }
            }
            break;
          }

          case "searchforbesthwt2": {
            if (s.indexOf('for') < 0) {
              prompt = "Please write a for-loop to go through each name in names. "
            } else {
              let output = Function('"use strict"; var youngest = {name: "", age: 100}; var students = [{name: "Aiden", age: 10}, {name: "Albert", age: 12}, {name: "JJ", age: 9}]; ' + userinputvalue + '; return youngest;')();
              if (output != null && typeof(output) != "undefined" && output.name == 'JJ' && output.age == 9) {
                prompt = "success";
              }
            }
            break;
          }

          case "forbest1": {
            let output = Function('"use strict"; var nums = [[0, -1, 3]]; ' + userinputvalue + '; return smallest;')();
            if (output != null && typeof(output) != "undefined" && output == -1) {
              prompt = "success";
            }
            
            break;
          }

          case "quickmandist": {
            let output = Function('"use strict"; var p1 = {r: 2, c: 5}; var p2 = {r: 6, c: 2}; ' + userinputvalue + '; return distance;')();
            if (output != null && typeof(output) != "undefined" && output == 7) {
              prompt = "success";
            }
            
            break;
          }

          case "quickmandisthwt": {
            let output = Function('"use strict"; var home = {street: 35, avenue: 5}; var school = {street: 42, avenue: 2}; ' + userinputvalue + '; return blocks;')();
            if (output != null && typeof(output) != "undefined" && output == 10) {
              prompt = "success";
            }
            
            break;
          }

          case "quickdecision": {
            const numOfIf = (s.match(/if/g) || []).length;
            const numOfElse = (s.match(/else/g) || []).length;
            if (numOfIf != 3) {
              prompt = "There should be three 'if' in your answer."
            } else if (numOfElse != 3) {
              prompt = "There should be three 'else' in your answer."
            } else {
              let output = Function('"use strict"; const r = 5; let a = 1; ' + userinputvalue + '; return a;')();
              if (output != null && typeof(output) != "undefined" && output == 10) {
                prompt = "success";
              }
            }
            break;
          }

          case "damageexe1": {
            let output = Function('"use strict"; var MyTank = {specialPower: {damage: 3, reload: 2}}; ' + userinputvalue + '; return damage;')();
            if (output != null && typeof(output) != "undefined" && output == 720) {
              prompt = "success";
            }
            break;
          }

          case "damageexe2": {
            let output = Function('"use strict"; var damage = 720; var target = {specialPower: {healthRegen: 3}};' + userinputvalue + '; return healthReduction;')();
            if (output != null && typeof(output) != "undefined" && output == -240) {
              prompt = "success";
            }
            break;
          }

          case "arrowfunc0": {
            if (s.indexOf('=>') < 0) {
              prompt = "Please write an arrow function. "
            } else {
              let output = Function('"use strict";  ' + userinputvalue + '; return subtract(10, 2);')();
              if (output != null && typeof(output) != "undefined" && output == 8) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrowfunc1": {
            if (s.indexOf('=>') < 0) {
              prompt = "Please write an arrow function. "
            } else {
              let output = Function('"use strict"; var student = {ID: 112}; ' + userinputvalue + '; return hasID(student, 12);')();
              if (output != null && typeof(output) != "undefined" && output == false) {
                prompt = "success";
              }
            }
            break;
          }

          case "arrowfuncmultiply": {
            if (s.indexOf('=>') < 0) {
              prompt = "Please write an arrow function. "
            } else {
              let output = Function('"use strict";  ' + userinputvalue + '; return multiply(10, 2);')();
              if (output != null && typeof(output) != "undefined" && output == 20) {
                prompt = "success";
              }
            }
            break;
          }

          case "getoppo": {
            if (s.indexOf('Tanks.filter') < 0) {
              prompt = "Please use the filter method on Tanks. "
            } else {
              let output = Function('"use strict"; var MyTank = {color: "red"}; var Tanks = [{color: "white"}, {color: "blue"}, {color:"blue"}, {color:"red"}];' + userinputvalue + '; return oppoTanks;')();
              if (output != null && typeof(output) != "undefined" && output.length == 2 && output[0].color == 'blue' && output[1].color == 'blue') {
                prompt = "success";
              }
            }
            break;
          }

          case "arraymethod1": {
            if (s.indexOf('students.push') < 0) {
              prompt = "Please use the push method on students. "
            } else {
              let output = Function('"use strict"; var students = [{ ID: 110, Name: "William" },{ ID: 111, Name: "Leo" },{ ID: 112, Name: "Kevin" }];' + userinputvalue + '; return students[3];')();
              if (output != null && typeof(output) != "undefined" && output.ID == 113 && output.Name == 'Larry') {
                prompt = "success";
              }
            }
            break;
          }
          
          case "arraymethod2": {
            if (s.indexOf('numbers.push') < 0) {
              prompt = "Please use the push method on numbers. "
            } else {
              let output = Function('"use strict"; var numbers = [[0, 1, 2],[1, 2, 3],[2, 3, 4]];' + userinputvalue + '; return numbers;')();
              if (output != null && typeof(output) != "undefined") {
                let flag = true;
                for (let i = 3; i < 5; i += 1) {
                  for (let j = 0; j < 3; j += 1) {
                    if (output[i][j] != i + j) {
                      flag = false;
                      prompt = "numbers[" + i + "][" + j + "] should not be " + output[i][j];
                      break;
                    }
                  }
                }
                if (flag) prompt = "success";
              }
            }
            break;
          }

          case "arraymethod2a": {
            if (s.indexOf('numbers.push') < 0) {
              prompt = "Please use the push method on numbers. "
            } else {
              let output = Function('"use strict"; var numbers = [[0, 1]];' + userinputvalue + '; return numbers;')();
              if (output != null && typeof(output) != "undefined") {
                let flag = true;
                for (let i = 1; i < 2; i += 1) {
                  for (let j = 0; j < 2; j += 1) {
                    if (output[i][j] != i + j) {
                      flag = false;
                      prompt = "numbers[" + i + "][" + j + "] should not be " + output[i][j];
                      break;
                    }
                  }
                }
                if (flag) prompt = "success";
              }
            }
            break;
          }

          case "arraymethod3": {
            if (s.indexOf('students.find') < 0) {
              prompt = "Please use the find method on students. "
            } else {
              let output = Function('"use strict"; var students = [{ ID: 110, Name: "William" },{ ID: 111, Name: "Leo" },{ ID: 112, Name: "Kevin" }];' + userinputvalue + '; return myRoommate;')();
              if (output != null && typeof(output) != "undefined" && output.ID == 111 && output.Name == 'Leo') {
                prompt = "success";
              }
            }
            break;
          }

          case "arraymethod3hwt": {
            if (s.indexOf('students.find') < 0) {
              prompt = "Please use the find method on students. "
            } else {
              let output = Function('"use strict"; var students = [{ age: 10, Name: "William" },{ age: 11, Name: "Leo" },{ age: 12, Name: "Kevin" }];' + userinputvalue + '; return myRoommate;')();
              if (output != null && typeof(output) != "undefined" && output.age == 12 && output.Name == 'Kevin') {
                prompt = "success";
              }
            }
            break;
          }

          case "arraymethod3num": {
            if (s.indexOf('numbers.find') < 0) {
              prompt = "Please use the find method. "
            } else {
              let output = Function('"use strict"; var numbers = [4, 8, 6, 5, 3, 9];' + userinputvalue + '; return x;')();
              if (output != null && typeof(output) != "undefined" && output == 3) {
                prompt = "success";
              }
            }
            break;
          }

          case "arraymethod3numhwt": {
            if (s.indexOf('numbers.find') < 0) {
              prompt = "Please use the find method. "
            } else {
              let output = Function('"use strict"; var numbers = [4, 9, 6, 5, 3, 10];' + userinputvalue + '; return x;')();
              if (output != null && typeof(output) != "undefined" && output == 9) {
                prompt = "success";
              }
            }
            break;
          }

          case "arraymethod4": {
            if (s.indexOf('numbers.slice') < 0) {
              prompt = "Please use the slice method on numbers. "
            } else {
              let output = Function('"use strict"; var numbers = [2, 4, 8, 5, 10, 12, 6];' + userinputvalue + '; return numbers2;')();
              if (output != null && typeof(output) != "undefined" && output.length == 3 && output[0] == 8 && output[1] == 5 && output[2] == 10) {
                prompt = "success";
              }
            }
            break;
          }

          case "arraymethod4hwt": {
            if (s.indexOf('numbers.slice') < 0) {
              prompt = "Please use the slice method on numbers. "
            } else {
              let output = Function('"use strict"; var numbers = [2, 4, 8, 5, 10, 12, 6];' + userinputvalue + '; return numbers2;')();
              if (output != null && typeof(output) != "undefined" && output.length == 2 && output[0] == 10 && output[1] == 12) {
                prompt = "success";
              }
            }
            break;
          }

          case "ternary1": {
            let res = Function('"use strict"; const isHomeworkDone = true; ' + userinputvalue + '; return watchTV;')();
            if (s.indexOf('watchTV=isHomeworkDone?') >= 0 && s.indexOf(':') >= 0 && res == "Sure!") prompt = "success";
            
            break;
          }

          case "placeballqe": {
            if (s.indexOf("ResetTable(true)") < 0) {
              prompt = `You need to clear all the balls first using ResetTable.`;
            } else if (s.indexOf("PlaceBallOnTable(") < 0) {
              prompt = `You need to use the "PlaceBallOnTable" function.`;
            } else {
              let output = Function(`"use strict"; var balls={"3": {x: 1, y:1}}; const ResetTable = (c) => {if(c) balls = {};}; const PlaceBallOnTable = (bid, a, b) => { balls[bid] = {x: a, y: b}   }; ' + userinputvalue + '; return balls;`)();
              if (output != null && typeof(output) != "undefined" && !output["3"] && output["0"].x == 50 && output["0"].y == -300 && output["1"].x == 300 && output["1"].y == 250 && output["4"].x == -100 && output["4"].y == 200 ) {
                prompt = "success";
              }
            }
            break;

          }

          case "lda1arraysquares": {
            let output = Function('"use strict";' + userinputvalue + '; squares.push(sum); return squares;')();
            if (output !== null && typeof output !== "undefined" && output.length == 10) {
              const sum = output.pop();
              let flag = (sum === 145);
              for (let i = 0; i < output.length && flag; i += 1) {
                if (output[i] !== (i + 1) * (i + 1)) flag = false;
              }
              if (flag) prompt = "success";
            }
            break;
          }

          case "lda1arraymethodreduce": {
            if (s.indexOf("flowers.reduce") < 0) {
              prompt = `You need to call the "reduce" method on "flowers".`;
            } else {
              let output = Function('"use strict"; var flowers=[{name:"Lily", count:3},{name:"Rose", count:12}, {name:"Iris", count:1},{name:"Jasmine",count:4},{name:"Levander",count:7}];' + userinputvalue + '; return sum;')();
              if (output != null && typeof output !== "undefined" && output === 27 ) {
                prompt = "success";
              }
            }
            break;

          }

          case "lda12adjmatrix": {
            let output = Function('"use strict";' + userinputvalue + '; return graph;')();
            const answer = [[0,3,2,0,0],[0,0,0,0,0],[0,0,0,0,7],[6,0,0,0,0],[0,0,4,5,0]];
            if (output !== null && typeof output !== "undefined" && output.length === 5 && output.length === 5) {
              let flag = true;
              for (let i = 0; i < 5; i ++) {
                for (let j = 0; j < 5; j ++) {
                  if (answer[i][j] !== output[i][j]) {
                    prompt = `The value at row ${i} and column ${j} is not correct.`
                    flag = false;
                  }
                }
              }
              if (flag) prompt = "success";
            } else {
              prompt = "You need to create a 5 by 5 array."
            }
            break;
          }

          case "lda12adjlist": {
            let output = Function('"use strict";' + userinputvalue + '; return graph;')();
            const answer = {0: {1:3, 2:2}, 1:{}, 2: {4:7}, 3: {0:6}, 4: {2:4, 3:5}};
            if (output !== null && typeof output !== "undefined") {
              if (JSON.stringify(answer) === JSON.stringify(output)) prompt = "success";
              else prompt = "Your object is not correct. Please check it again.";
            } else {
              prompt = "You need to define an object variable 'graph'."
            }
            break;
          }

          default: {
            break;
          }
        }

      } catch (err) {
        prompt = `Sorry, that's not correct. There is a syntax error:

${err.message}

Please try again.`;
      }

      window.recordQuickExerciseAttempt(userinputvalue, prompt);

      if (prompt != "success") {
        swal({
          // title: "Hint",
          text: prompt,
          icon: "error",
          // buttons: false,
          dangerMode: false,
          button: "Okay!",
        });
        return;
      } else {


        that.updateQuickInputResultScript(false);

        // disable all buttons
        $("#submitquickinput").prop('disabled', true);
        isPaused = false;
        setPaused(isPaused);
        window.moveToAfterTimer = setTimeout(()=>{
          Meteor.call('submitUserInput', userLesson._id, userLesson.currentSlideId, question, userinputvalue, () => {
            $("#userquickinputtext").prop('disabled', true).css('opacity',1);
            isPaused = false;
            setPaused(isPaused);
            that.moveToAfterInput();
            that.playNextScript();
          });
        }, 3000);


      }

    });


    $('#usersurveyquiz').on('mousedown', '.glow-on-hover', function(e){
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    });

    $('#usersurveyquiz').on('mouseup', '.glow-on-hover', function(e){
      const { userLesson, slide, slideContent, setPaused } = that.props;
      const inputfield = $( e.target ).attr("inputfield").trim();
      const userinputvalue = $( e.target ).val().trim();

      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();

      Meteor.call('submitUserSurvey', userLesson._id, userLesson.currentSlideId, inputfield, userinputvalue, () => {

        if (inputfield.indexOf("quizanswer_") >= 0) {
          const localCorrectAnswer = inputfield.substring(11);
          const localUserQuizAnswer = userinputvalue;
          // this step won't do anything if the showquizanswer line has been replaced already
          that.updateQuizResultScript(localCorrectAnswer, localUserQuizAnswer, false);

          // disable all buttons
          $(".glow-on-hover").prop('disabled', true);
          $( e.target ).removeClass("glow-on-hover");
          $( e.target ).addClass("surveybuttonchosen");
          isPaused = false;
          setPaused(isPaused);
          window.moveToAfterTimer = setTimeout(()=>{
            that.moveToAfterInput();
            that.playNextScript();
          }, localCorrectAnswer == localUserQuizAnswer ? 3000 : 0);

        } else {
          if (inputfield == "SchoolGrade") {
            localSchoolGrade = userinputvalue;
          }

          if (inputfield == "JavaScriptLevel") {
            localJavaScriptLevel = userinputvalue;
          }


          // disable all buttons
          $(".glow-on-hover").prop('disabled', true);
          $( e.target ).removeClass("glow-on-hover");
          $( e.target ).addClass("surveybuttonchosen");
          isPaused = false;
          setPaused(isPaused);
          that.moveToAfterInput();
          that.playNextScript();
        }


      });
    });



    // setTimeout(() => {
    //   hideNavArrows();
    // }, 1000);
    //hideNavArrows();
    // document.getElementById('slideIFrame').onload = function() {
    //   // go to the correct slide ?
    //   hideNavArrows();
    // };
    // new WOW().init(); // Wow is animation package for login form
    window.OKClicked = (e) => { that.OKClicked(e); };
    window.CopyCodeClicked = (e) => { that.CopyCodeClicked(e); };
    // window.CopyToClipboard = (e) => { that.CopyToClipboard(e); };

    window.DoneCodingClicked = (e) => { that.DoneCodingClicked(e); };
    window.GoToNextTutorial = (e) => { that.GoToNextTutorial(e); };
    window.GoToTutorialList = (e) => { that.GoToTutorialList(e); };


    window.ToggleVisibility = (e, id) => { that.ToggleVisibility(e, id); };
    window.ClickToSendChat = (e, textToBeSent) => { that.ClickToSendChat(e, textToBeSent) };

    window.replayCurrent = this.replayCurrent.bind(this);

    if (this.props.userLesson) {
      // window.chatId = userLesson._id;
      // window.userLesson = this.props.userLesson;
    }
  }

  componentWillReceiveProps(nextProps) {
    // const { instructionLength, tutorialProgress, tutorial } = nextProps;
    // const tutorialType = Object.keys(tutorial);
    // const slideIndex = tutorialProgress * instructionLength;
    // const tutorialContent = {};

    // for (let i = 0; i < tutorialType.length; i++) {
    //   Object.assign(tutorialContent, { [tutorialType[i]]: false });
    // }
    // this.setState({
    //   slideIndex: slideIndex === 0 ? 1 : slideIndex,
    //   tutorialType,
    //   tutorialContent
    // });
    // const { lesson = {} } = this.props;
    // const { lesson: nextScenario = {} } = nextProps;
    // if (lesson._id !== nextScenario._id) {
    //   this.updateNextScenarioId(nextScenario._id);
    // }
  }

  replayCurrent() {
    const { userLesson, slideContent } = this.props;

    if (window.autoPlayNextTimer) {
      clearTimeout(window.autoPlayNextTimer);
    }
    if (window.nextSpeechTimer) {
      clearTimeout(window.nextSpeechTimer);
    }
    if (window.moveToAfterTimer) {
      clearTimeout(window.moveToAfterTimer);
    }
    gotoUserCurrentSlide(slideContent, userLesson.currentSlideId, true);
    this.presentSlideUsingNotes();
  }

  componentDidUpdate() {
    const { userLesson, slideContent, slide } = this.props;

    this.showHideHintButton();
    this.showHideOpenInScratch();
    
    this.showHideEmbeddedIFrame(this.getCurrentSlide());


    if (RevealRef && Meteor.user().syncMode == "Sync") {
      // console.log("LC: did update");
      if (window.currentSlideID != userLesson.currentSlideId) {
        gotoUserCurrentSlide(slideContent, userLesson.currentSlideId);
        // console.log("LC: presentSlideUsingNotes in did update");
        this.presentSlideUsingNotes();
      } else {
        
        const actualSlide = RevealRef.getIndices();
        if (actualSlide.v != userLesson.currentSlideInd || actualSlide.f != userLesson.currentFragmentInd) {
          for (let k=0; k < slideContent.slideInfo.length; k++) {
            const slide = slideContent.slideInfo[k];
            if (slide.ID == userLesson.currentSlideId) {
              RevealRef.slide(0, userLesson.currentSlideInd, userLesson.currentFragmentInd);
              break;
            }
          }
        }


      }

    } else {
      // console.log("LC: did update");
      if (window.currentSlideID != userLesson.currentSlideId) {
        gotoUserCurrentSlide(slideContent, userLesson.currentSlideId);
        // console.log("LC: presentSlideUsingNotes in did update");
        this.presentSlideUsingNotes();
      }

    }


  }

  componentWillUnmount() {

    document.removeEventListener("keydown", this.handleKey, false);

    if (window.currentSound) {
      window.currentSound.unload();
      delete window.currentSound;
    }
    if (window.collectCoinSound) {
      window.collectCoinSound.unload();
      delete window.collectCoinSound;
    }
    if (window.coinSound) {
      window.coinSound.unload();
      delete window.coinSound;
    }
    delete window.syntaxhighlighter;
    delete window.OKClicked;
    delete window.CopyCodeClicked;
    // delete window.CopyToClipboard;

    delete window.DoneCodingClicked;
    delete window.GoToNextTutorial;
    delete window.GoToTutorialList;
    delete window.submitTestResultInChat;
    delete window.chatId;
    delete window.ToggleVisibility;
    delete window.userLesson;
  }


  getTutorialList = (title, tutorial, type) => {
    let liClass = 'menu-all__item';

    if (this.state.tutorialContent[type]) {
      liClass += ' expanded';
    }
    return (
      <li className={liClass} key={type}>
        <div
          role="button"
          tabIndex="0"
          className="tutorial"
          onClick={() => (this.showTutorialContent(type))}
        >
          {title}
          <span className="tg-icon-expand" />
        </div>
        <div
          className={this.state.tutorialContent[type] ? 'animated slideInLeft' : 'animated slideInUp'}
        >
          {this.state.tutorialContent[type] && tutorial[type].map((testcase, index) => (
            <div
              role="button"
              tabIndex="0"
              key={testcase._id}
              className="tutorial-content"
              onClick={() => (this.showListMenu(testcase._id))}
            >
              {index + 1}. {testcase.ScenarioName}
            </div>
          ))}
        </div>
      </li>
    );

    // return (
    //   <li key={type}>
    //     <div className="tutorial">
    //       {title}
    //       <span
    //         className="tg-icon-expand"
    //         onClick={() => (this.showTutorialContent(type))}
    //       />
    //     </div>
    //   </li>
    // );
  }

  showTutorialContent = (type) => {
    const tutorialContent = Object.assign({}, this.state.tutorialContent);
    tutorialContent[type] = !this.state.tutorialContent[type];
    this.setState({ tutorialContent });
  }

  setTestConditionCallback = (successCondition, callback) => {
    const allConditions = ['TestFinishedAnyResult'];
    for (let i = 0; i < allConditions.length; i++) {
      const c = allConditions[i];

      if (c === successCondition) {
        window[c] = callback;
      } else {
        delete window[c];
      }
    }
  }

  // storeUserTestResult = () => {
  //   // add a new user action into chat
  //   const { lesson, userLesson, handNewUserChatAction } = this.props;
  //   handNewUserChatAction(userLesson._id, lesson._id, "USER_TEST_RESULT", "Test Passed!");
  // }

//   submitTestResultInChat = (result) => {


//     // don't do it in teacher account!
//     if (getUID() != "") return;
//     debugger;

//     // add a new user action into chat
//     const { lesson, userLesson, handNewUserChatAction } = this.props;
//     if (!result) return;
//     if (result === 'Test passed!') {
//       window.testCondition = ''; // so at least the same condition is not tested again
//       window.testCodeCondition = '';
//       window.testConditionInd = '';
//       window.testCodeSample = '';
//       result += " Feel free to chat '<b>code</b>' to view my answer code for reference.";
//     } else if (result.indexOf('No test specified') >= 0) {
//       return; // don't need to do anything
//     }
//     if (result.indexOf('Please ') === 0 || result.indexOf(`I haven't given the next test yet`) === 0) {
//       handNewUserChatAction(userLesson._id, 'USER_TEST_RESULT', result);
//       return;
//     }
//     let timeout = 1000;
//     let prefix = '';
//     if (result.toUpperCase().indexOf('ERROR') >= 0) {
//       timeout = 300;
//       prefix = '';
//     }
//     if (result.indexOf('Unexpected identifier') >= 0) {
//       result += ' Are you forgetting to close the previous line with ";" or "," ?';
//     }
//     if (result.indexOf("FAIL") >= 0 || result.indexOf("Test failed") >= 0) {
//       result += `

// Click '?' if you need some help.`;
//     }

//     setTimeout(() => {
//       handNewUserChatAction(userLesson._id, 'USER_TEST_RESULT', `${prefix}${result}`);
//     }, timeout);
//   }




  GoToTutorialList = (event) => {
    const { history } = this.props;
    history.push('/courses');
  }

  GoToNextTutorial = (event) => {
    const { history } = this.props;
    const { nextScenarioId } = this.state;
    // navigate to next tutoral or back to tutorial list!
    if (nextScenarioId === null && !this.state.isGetNextTurorial) {
      history.push('/courses');
    } else if (this.state.isGetNextTurorial) {
      this.this.setState({
        isWaitingToGoToNextTutorial: true,
      });
    } else {
      history.push(`/buildMyAI/${nextScenarioId}`);
    }
  }

  ToggleVisibility = (event, id) => {
    const e = document.getElementById(id);
    if (e.style.display === 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
  }

  ClickToSendChat = (event, textToBeSent) => {
    this.editor = $('#inputtext')[0];
    this.editor.value = textToBeSent;
    this.sendChat();
  }

  getCodeBlocks = (lines) => {
    const blocks = [];
    let newblock = '';

    let inFunction = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      if (line.trim().indexOf('//') === 0) continue;

      if (inFunction) {
        if (line.indexOf('}') === 0) {
          inFunction = false;
          newblock += line;
          blocks.push(`${newblock}\n`);
          newblock = '';
        } else {
          newblock += line;
          newblock += '\n';
        }
      } else { // not in function
        if (line.indexOf('function') >= 0 && line.indexOf(' ') !== 0) {
          // a new block of code!
          if (newblock !== '') {
            blocks.push(newblock);
            newblock = '';
            inFunction = true;
          }
        }
        newblock += line;
        newblock += '\n';
      }
    }

    if (newblock !== '') {
      blocks.push(newblock);
    }
    return blocks;
  }

  updateNextScenarioId = (scenarioId) => {
    const { isGetNextTurorial } = this.state;
    if (isGetNextTurorial) return;
    this.setState({
      isGetNextTurorial: true
    }, () => {
      Meteor.call('getNextScenarioId', scenarioId, (error, nextScenarioId) => {
        if (!error) {
          this.setState({
            nextScenarioId,
            isGetNextTurorial: false,
          }, () => {
            if (this.state.isWaitingToGoToNextTutorial) {
              this.GoToNextTutorial();
            }
          });
        } else {
          this.setState({
            isGetNextTurorial: false,
          });
        }
      });
    });
  }

  // copyToClipboard = () => {
  //   var textField = document.createElement('textarea');
  //   let str =  window.solutionCodeEditor.codeMirror.getSelection();
  //   if (str == "") {
  //     const s = this.getCurrentSlide();
  //     str = s.ANSWERCODE;
  //   }

  //   textField.innerText = str + " &amp " + "another";
  //   document.body.appendChild(textField);
  //   textField.select();
  //   document.execCommand('copy');
  //   textField.remove();
  // }

  // CopyToClipboard = (event) => {
  //   const { lesson, userLesson, initializeUserLesson } = this.props;
  //   const e = $(event.srcElement);
  //   let div = e.parent().parent();
  //   div = div.find(".syntaxhighlighter");
  //   if (document.selection) {
  //       const range = document.body.createTextRange();
  //       range.moveToElementText(div);
  //       range.select().createTextRange();
  //       document.execCommand("copy");
  //   } else if (window.getSelection) {
  //       const range = document.createRange();
  //       range.selectNode(div[0]);
  //       window.getSelection().addRange(range);
  //       document.execCommand("copy");
  //       alert("text copied");
  //   }
  // }

  // CopyCodeClicked = (event) => {
  //   const { lesson, userLesson, initializeUserLesson } = this.props;
  //   const e = $(event.srcElement);
  //   const div = e.parent().parent();
  //   const elementId = div.attr('data-elementid');
  //   const robotCodeEditor = window.robotCodeEditor;

  //   const newcode = div.find('.hiddenCode').text().split('\n');
  //   let usercodeall = robotCodeEditor.codeMirror.getValue();

  //   // first cut new code into blocks of functions or global variables
  //   // then deal with each block individually

  //   const codeblocks = this.getCodeBlocks(newcode);

  //   // debugger;
  //   for (let j = 0; j < codeblocks.length; j++) {
  //     usercodeall = copyBlockToUserCode(codeblocks[j], usercodeall);
  //   }

  //   // const usercodeall = usercode.join("\n");

  //   robotCodeEditor.codeMirror.setValue(usercodeall);
  //   if (window.handleNewRobotCodeChange) {
  //     window.handleNewRobotCodeChange(usercodeall);
  //   }
  // }

  // CopyCodeClickedNewOld = (event) => {
  //   const { lesson, userLesson, initializeUserLesson } = this.props;
  //   const e = $(event.srcElement);
  //   const div = e.parent().parent();
  //   const elementId = div.attr("data-elementid");
  //   const robotCodeEditor = window.robotCodeEditor;

  //   // first check if all code is NEW
  //   //const codediv = div.find(".code");
  //   //const newcode = this.getAllCode(codediv, false).split("\n");
  //   // debugger;
  //   const newcode = div.find(".hiddenCode").text().split("\n");
  //   const usercode = robotCodeEditor.codeMirror.getValue().split("\n");

  //   const newLinesType = [];

  //   // find in prev element code the start and end line before and after newly inserted lines
  //   let newLineCount = 0;
  //   for (let ni=0; ni < newcode.length; ni++) {
  //     const newline = newcode[ni];
  //     const newLineObj = { lineNo: ni, newInd: ni };
  //     if (newline.trim().endsWith("// NEW")) {
  //       newLineObj.lineType = "INSERT";
  //       newLineCount ++;
  //     } else if (newline.trim().endsWith("// CHG")) {
  //       newLineObj.lineType = "REPLACE";
  //     } else {
  //       newLineObj.lineType = "SAME";
  //       if (ni ==0)
  //         newLineObj.indInUserCode =  findLineInCode(usercode, newline, "");
  //       else {
  //         const pnewLineObj = newLinesType[ni-1];
  //         if (pnewLineObj.lineType === "SAME") {
  //           const pnewline = newcode[ni-1];
  //           newLineObj.indInUserCode =  findLineInCode(usercode, newline, pnewline);
  //         } else {
  //           newLineObj.indInUserCode =  findLineInCode(usercode, newline, "");
  //         }
  //       }
  //     }
  //     newLinesType.push(newLineObj);
  //   }

  //   if (newLineCount === newcode.length) {
  //     // all lines are new, so simply append to existing robot code
  //     let newcodeTrim = "";
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       let newline = newcode[ni];
  //       if (newline.indexOf("//") > 0) {
  //         newline = newline.substring(0, newline.indexOf("//")).trimRight();
  //       }
  //       newcodeTrim += `\n${newline}`;
  //     }
  //     const finalnewcode = `${robotCodeEditor.codeMirror.getValue()}\n${newcodeTrim}`;
  //     robotCodeEditor.codeMirror.setValue(finalnewcode);
  //     if (window.handleNewRobotCodeChange) {
  //       window.handleNewRobotCodeChange(finalnewcode);
  //     }
  //   } else {
  //     // use unchanged lines in user code to serve as anchor
  //     let superStartLine = ""; // to be used for appending new inserted lines at the beginning
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       let newline = newcode[ni];
  //       if (newline.indexOf("//") > 0) {
  //         newline = newline.substring(0, newline.indexOf("//")).trimRight();
  //       }
  //       const newLineObj = newLinesType[ni];
  //       if (newLineObj.lineType !== "SAME") {
  //         if (newLineObj.lineType === "REPLACE") {
  //           usercode[newLineObj.indInUserCode] = newline;
  //         } else { // must be a new INSERT
  //           if (ni === 0) {
  //             // append this to the new "-1" line that is to be prepended to usercode at the end
  //             // find this line in user code
  //             superStartLine += `${newline}`;
  //             newLineObj.indInUserCode = -1;
  //           } else {
  //             // find prev line
  //             const prevNewLineObj = newLinesType[ni-1];
  //             usercode[prevNewLineObj.indInUserCode] += `\n${newline}`;
  //             newLineObj.indInUserCode = prevNewLineObj.indInUserCode;
  //           }
  //         }
  //       }
  //     }

  //     if (superStartLine !== "") {
  //       superStartLine = `${superStartLine}\n`;
  //     }
  //     let newusercodeall = `${superStartLine}${usercode.join("\n")}`;

  //     newusercodeall = insertNewWholeFunction(newcode, newusercodeall, "// INSERTFUNC");

  //     newusercodeall = replaceWholeFunction(newcode, newusercodeall);

  //     robotCodeEditor.codeMirror.setValue(newusercodeall);
  //   }
  // }

  // CopyCodeClickedOld = (event) => {
  //   const { lesson, userLesson, initializeUserLesson } = this.props;
  //   const e = $(event.srcElement);
  //   const div = e.parent().parent();
  //   const elementId = div.attr("data-elementid");
  //   // here we assume whenever there is robot code given in tutorial, then condition is not empty for testing!
  //   const alldivs = div.parent().parent().parent().parent().find("div.row").find('[data-condition]').find(".code");
  //   // debugger;

  //   const robotCodeEditor = window.robotCodeEditor;

  //   let prevInd = -1;
  //   for (let j=0; j<alldivs.length; j++) {
  //     const eid = $(alldivs[j]).closest("[data-elementid]").attr("data-elementid");
  //     //const codediv = alldivs[j].find("");
  //     if (eid === elementId) {
  //       prevInd = j - 1;
  //       break;
  //     }
  //   }

  //   if (prevInd < 0) {
  //     // current element is first code element so just append everything
  //     const codediv = div.find(".code");
  //     const newcode = this.getAllCode(codediv, true);
  //     console.log("all code is " + newcode);

  //     robotCodeEditor.codeMirror.setValue(`${robotCodeEditor.codeMirror.getValue()}\n\n${newcode}`);
  //     if (window.handleNewRobotCodeChange) {
  //       window.handleNewRobotCodeChange(newcode);
  //     }

  //   } else {
  //     const prevDiv = $(alldivs[prevInd]).closest("[data-elementid]").find(".code");
  //     const oldcode = this.getAllCode(prevDiv, true).split("\n");
  //     const codediv = div.find(".code");
  //     const newcode = this.getAllCode(codediv, false).split("\n");
  //     const usercode = robotCodeEditor.codeMirror.getValue().split("\n");
  //     /*
  //       I.  first, mark each line of new code to be "SAME", "REPLACE" or "INSERT", using comment I added!

  //       II. for each new line
  //           1. if REPLACE, then find the line in user code that's most similar and replace it
  //           2. if INSERT, then look at prev line
  //             a. if prev line is SAME, then look for that line in user code
  //             b. if prev line is "REPLACE", then use that line's replaced line as anchor and insert below it
  //     */

  //     const newLinesType = [];

  //     // find in prev element code the start and end line before and after newly inserted lines
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       const newline = newcode[ni];
  //       const newLineObj = { lineNo: ni, newInd: ni };
  //       if (newline.trim().endsWith("// NEW")) {
  //         newLineObj.lineType = "INSERT";
  //       } else if (newline.trim().endsWith("// CHG")) {
  //         newLineObj.lineType = "REPLACE";
  //       } else {
  //         newLineObj.lineType = "SAME";
  //         for (let oi=0; oi < oldcode.length; oi++) {
  //           const oldline = oldcode[oi];
  //           if (newline.trim() === oldline.trim()) {
  //             newLineObj.oldInd = oi;
  //             break;
  //           }
  //         }
  //       }
  //       newLinesType.push(newLineObj);
  //     }

  //     // debugger;

  //     let superStartLine = ""; // to be used for appending new inserted lines at the beginning
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       let newline = newcode[ni];
  //       if (newline.indexOf("//") > 0) {
  //         newline = newline.substring(0, newline.indexOf("//"));
  //       }
  //       const newLineObj = newLinesType[ni];
  //       if (newLineObj.lineType !== "SAME") {
  //         if (newLineObj.lineType === "REPLACE") {
  //           if (ni === 0) {
  //             // replace first line
  //             // find this line in user code
  //             const indInUserCode = findLineInCode(usercode, oldcode[0], "");
  //             usercode[indInUserCode] = newline;
  //             newLineObj.indInUserCode = indInUserCode;
  //           } else {
  //             // find prev line
  //             const prevNewLineObj = newLinesType[ni-1];
  //             if (prevNewLineObj.lineType === "SAME") {
  //               // find that line in user code and replace next line
  //               const indInUserCode = findLineInCode(usercode, oldcode[prevNewLineObj.oldInd], oldcode[prevNewLineObj.oldInd-1]);
  //               usercode[indInUserCode+1] = newline;
  //               newLineObj.indInUserCode = indInUserCode+1;
  //             } else if (prevNewLineObj.lineType === "REPLACE") {
  //               const insertInd = prevNewLineObj.indInUserCode;
  //               usercode[insertInd] += `\n${newline}`; // simply append to it so we don't change line ordering
  //               newLineObj.indInUserCode = insertInd;
  //             } else { // prev line is an INSERT
  //               const indInUserCode = prevNewLineObj.indInUserCode;
  //               usercode[indInUserCode+1] = newline;
  //               newLineObj.indInUserCode = indInUserCode+1;
  //             }
  //           }
  //         } else { // must be a new INSERT
  //           if (ni === 0) {
  //             // append this to the new "-1" line that is to be prepended to usercode at the end
  //             // find this line in user code
  //             const indInUserCode = findLineInCode(usercode, oldcode[0], "");
  //             superStartLine += `${newline}`;
  //             newLineObj.indInUserCode = -1;
  //           } else {
  //             // find prev line
  //             const prevNewLineObj = newLinesType[ni-1];
  //             if (prevNewLineObj.lineType === "SAME") {
  //               // find that line in user code and append to it
  //               const indInUserCode = findLineInCode(usercode, oldcode[prevNewLineObj.oldInd], oldcode[prevNewLineObj.oldInd-1]);
  //               usercode[indInUserCode] += `\n${newline}`;
  //               newLineObj.indInUserCode = indInUserCode;
  //             } else if (prevNewLineObj.lineType === "REPLACE") {
  //               const insertInd = prevNewLineObj.indInUserCode;
  //               usercode[insertInd] += `\n${newline}`; // simply append to it so we don't change line ordering
  //               newLineObj.indInUserCode = insertInd;
  //             } else { // prev line is an INSERT
  //               const indInUserCode = prevNewLineObj.indInUserCode;
  //               usercode[indInUserCode] += `\n${newline}`;
  //               newLineObj.indInUserCode = indInUserCode;
  //             }
  //           }
  //         }
  //       }
  //     }

  //     if (superStartLine !== "") {
  //       superStartLine = `${superStartLine}\n`;
  //     }
  //     const newusercodeall = `${superStartLine}${usercode.join("\n")}`;

  //     robotCodeEditor.codeMirror.setValue(newusercodeall);
  //   }

  //   //console.log("all old code is " + alloldcode);
  //   // do insert for new code lines, but will not insert if there has been a line with same first 3 words
  //   //this.insertCodeIntoRobotCodeEditor(alloldcode);

  //   // this.checkCodeCopyResult();
  // }

  getAllCode = (codediv, removeComment) => {
    const lines = codediv.find('.container').find('div');
    let allcode = '';
    for (let j = 0; j < lines.length; j++) {
      let line = $(lines[j]).text();
      if (line.trim().substring(0, 2) !== '//') {
        let end = line.length;
        if (line.indexOf('//') > 0 && removeComment) end = line.indexOf('//');
        line = line.substring(0, end).trimRight();
        allcode += line;
        if (j < lines.length - 1) {
          allcode += '\n';
        }
      }
    }
    return allcode;
  }
  // need to make sure we don't remove any existing user code, but only insert if missing
  insertCodeIntoRobotCodeEditor = (code) => {
    // get codemirror
    const robotCodeEditor = window.robotCodeEditor;
    const oldCode = robotCodeEditor.codeMirror.getValue();
    // debugger;
    robotCodeEditor.codeMirror.setValue(code);
  }

  checkCodeCopyResult = () => {

  }

  sendChat() {
    const { lesson, userLesson, handNewUserChatAction } = this.props;
    let lintError = "";
    const that = this;
    this.editor = $('#inputtext')[0];
    const txt = this.editor.value;
    if (txt.trim() === '') return;
    // console.log("clear editor value");
    this.editor.value = '';

    if (window.robotCodeEditor && window.robotCodeEditor.codeMirror.state.lint) {
      if (window.robotCodeEditor.codeMirror.state.lint.marked.length > 0) {
        //lintError = window.robotCodeEditor.codeMirror.state.lint.marked[0].lines[0].markedSpans[0].marker.__annotation.message;
        const annotation = window.robotCodeEditor.codeMirror.state.lint.marked[0].__annotation;
        lintError = `${annotation.from.line}:${annotation.message}`;
      }
    }

    handNewUserChatAction(userLesson._id, 'USER_TEXT', txt, lintError, window.TestRunCount, window.CodeChangeCount);

  }

  renderListMenu = () => {
    const { tutorial } = this.props;
    const { tutorialType } = this.state;
    const title = ['Basic Tutorials', 'Intermediate Tutorials'];

    return (
      <div
        className={this.state.listMenu ? 'buildmyAI__lessons__list_menu animated fadeInLeft' : 'buildmyAI__lessons__list_menu'}
      >
        <ul className="menu-all">
          {tutorialType.map((type, index) =>
            this.getTutorialList(title[index], tutorial, type)
          )}
        </ul>
      </div>
    );
  }

  askForHint() {
    $('#inputtext')[0].value = 'hint';
    this.sendChat();
  }

  nextTutorialElement() {
    $('#inputtext')[0].value = 'next';
    this.sendChat();
  }

  setLabel = (chat) => {
    const { users } = this.props;

    if (chat.actionType !== 'USER_TEXT') {
      return (
        <div className="chatHistory__List__Item__Line__User">
          <img src="/images/userRobotChat.jpg" alt="user Chat" width="40px"/>
          <span>TBot</span>
        </div>
      );
    }
    let avatar = '/img_v2/ProfileIcon.png';
    let username = 'You';

    if (chat.sender === Meteor.userId() && Meteor.user().avatar) {
      avatar = Meteor.user().avatar.url;
    } else if (chat.sender !== Meteor.userId()) {
      const otherUser = users.find(user => user._id === chat.sender);

      if (otherUser) {
        username = otherUser.username;

        if (otherUser.avatar) {
          avatar = otherUser.avatar.url;
        }
      }
    }
    return (
      <div className="chatHistory__List__Item__Line__User">
        <img src={avatar} alt="user Chat" width="40px"/>
        <span>{username}</span>
      </div>
    );
  }


  // presentNextSlide () {

  //   // if (!RevealRef) return;
  //   // // check if at end of slides
  //   // // if (RevealRef.getProgress() >= 0.999999999999) {
  //   // //   updateButtons(USER_INPUT_MODE);
  //   // //   return;
  //   // // }

  //   // RevealRef.next();
  //   // this.presentSlideUsingNotes();
  // };


  shouldComponentUpdate(nextProps, nextState) {
    const { lesson, userLesson, slideContent, slide } = this.props;
    // return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    // return true;

    if (this.props.currentLocale != nextProps.currentLocale) return true;

    // console.log("LC: should update");
    this.showHideHintButton();
    
    this.showHideOpenInScratch();
    this.showHideEmbeddedIFrame(nextProps.slide);
    this.setAvatarIframe(nextProps.slide);
    if (RevealRef) {


      if (Meteor.user() && Meteor.user().syncMode == "Sync") {
        // console.log("LC: did update");
        const actualSlide = RevealRef.getIndices();
        if (actualSlide.v != nextProps.userLesson.currentSlideInd || actualSlide.f != nextProps.userLesson.currentFragmentInd) {
          RevealRef.slide(0, nextProps.userLesson.currentSlideInd, nextProps.userLesson.currentFragmentInd);
        }
        

        if (document.getElementById('transcriptlabel').innerHTML != nextProps.userLesson.currentSpeech) {
          document.getElementById('transcriptlabel').innerHTML = nextProps.userLesson.currentSpeech;
        }

      }

      // check if it is just slide update
      if (window.currentLessonID && window.currentLessonID != lesson._id) {
        window.currentLessonID = lesson._id;
        return true;
      }
      window.currentLessonID = lesson._id;
      if (nextProps.lesson._id !== lesson._id) return true;
      if (nextProps.userLesson._id !== userLesson._id) return true;
      if (nextProps.slideContent._id !== slideContent._id) return true;
      // if (slide.HIDEOVERLAY || nextProps.slide.HIDEOVERLAY) return true;

      this.showHideOverlay(nextProps.slide.HIDEOVERLAY);

      // console.log("should update: compare old slide id " + userLesson.currentSlideId + " vs new " + nextProps.userLesson.currentSlideId)
      if (nextProps.userLesson.currentSlideId !== userLesson.currentSlideId) {
        // simply changed slide
        // console.log("should update: old slide id " + userLesson.currentSlideId + " vs new " + nextProps.userLesson.currentSlideId)
        if (window.currentSound) {
          // console.log("stop sound 4");
          window.currentSound.unload();
          window.currentSound = null;
        }
        const changed = gotoUserCurrentSlide(slideContent, nextProps.userLesson.currentSlideId);
        this.props.userLesson.currentSlideId = nextProps.userLesson.currentSlideId;
        this.props.userLesson.slideVisitLog = nextProps.userLesson.slideVisitLog;
        this.showHideOpenInScratch(nextProps.slide);
        // console.log("LC: presentSlideUsingNotes present in shouldupdate");
        if (!changed) this.presentSlideUsingNotes();
        return false;
      } else {
        // console.log("should not update: old slide id " + userLesson.currentSlideId + " vs new " + nextProps.userLesson.currentSlideId)
        return false;
      }
    } else
      return true;
  }

  openNext(locale) {
    const { lesson, userLesson, slideContent, slide } = this.props;
    Meteor.call('gotoBilingualTimeSlide', userLesson._id, locale);
  }

  skipToNextNode() {
    const { lesson, userLesson, slideContent, slide } = this.props;
    Meteor.call('gotoNextSlide', userLesson._id, false);
  }

  renderLecture () {
    const { lesson, userLesson, slideContent, slide } = this.props;
    const that = this;
    // console.log("LC: render lecture");
    $(".verification-email").hide();


    const s = this.getCurrentSlide();
    // const showSolution = s.TYPE.toLowerCase() == "solution";
    const options = {
      mode: 'javascript',
      lineNumbers: true,
      // autoRefresh:true,
      readOnly: true,
      // gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
    };

    const currentSlideIndex = getCurrentSlideIndex(slideContent, userLesson.currentSlideId);
    
    // jump example
    //http://localhost:3000/loadslide?postMessageEvents=true&slideId=school_a_lesson_18&rand=0.3645224733#/0/1

    let fileId = lesson.slideFileId;
    if (lesson.slideFileId.startsWith("school")) {
      if (window.currentChosenLocale == "CH" && !fileId.endsWith("_ch")) {
        fileId += "_ch";
      } else if (window.currentChosenLocale == "EN" && fileId.endsWith("_ch")) {
        fileId = fileId.substring(0, fileId.length-3);
      }
    }

    let avatarfile = "/avatar.html";
    if (window.currentChosenLocale == "CH" || slide.LOCALE == "zh-cn") {
      avatarfile = "/avatarch.html";
    } else if (window.currentChosenLocale == "ES" || slide.LOCALE == "es") {
      avatarfile = "/avatares.html";
    }
    if (Meteor.user() && Meteor.user().syncMode == "Sync") {
      avatarfile = "/noavatar.html";
    }

    return (
      <div className="lessonPageBlock">
        <div id="slidediv">
          <div id="slides">
            <iframe sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" style={{display: "block", visibility: "visible"}} id="slideIFrame"  src={`/loadslide?postMessageEvents=true&slideId=${fileId}&rand=${Math.random().toFixed(10)}#/0/${currentSlideIndex}`} width="100%" scrolling="no" frameBorder="0"></iframe>
            {/* <iframe style={{display: "block"}} id="slideIFrame" src={"data:text/html,"+slideContent.content}  width="100%" scrolling="no" frameborder="0"></iframe> */}
            <div id="lectureoverlay" style={{pointerEvents: slide.HIDEOVERLAY ? "none" : "auto"}} className="lectureoverlay" onMouseDown={ (e) => {that.handleClickOverlay()} } >

            {lesson.package.startsWith("school") ? 
              <iframe style={{width: "100%", height: "100%", pointerEvents: 'none', display: avatarfile == "/avatar.html" ? "block" : "none" }} id="avatariframe"  src="/avatar.html" allowTransparency="true" scrolling="no" frameBorder="0" allowFullScreen></iframe>
              : <div />
              }

            {lesson.package.startsWith("school") ? 
              <iframe style={{width: "100%", height: "100%", pointerEvents: 'none', display: avatarfile == "/avatares.html" ? "block" : "none" }} id="avatariframees"  src="/avatares.html" allowTransparency="true" scrolling="no" frameBorder="0" allowFullScreen></iframe>
              : <div />
              }

            {lesson.package.startsWith("school") ? 
              <iframe style={{width: "100%", height: "100%", pointerEvents: 'none', display: avatarfile == "/avatarch.html" ? "block" : "none" }} id="avatariframech"  src="/avatarch.html" allowTransparency="true" scrolling="no" frameBorder="0" allowFullScreen></iframe>
              : <div />
              }






              <iframe style={{display: "none", position: "absolute"}} id="embeddediframe"  src={`${s.IFRAME}`} allowTransparency="true" scrolling="no" frameBorder="0" allowFullScreen></iframe>

               <div id="scratchlink" style={{display: "hidden", position: "absolute", top: "0px"} }>
                {/* <a src={"https://scratch.mit.edu/projects/"+slide.PROJECTID} >Open in Scratch</a></button> */}
                <button style={{width: "210px"}}  className="glow-on-hover2" id="openscratchlink" onMouseDown={(e) => {e.stopPropagation();  var win = window.open("https://scratch.mit.edu/projects/"+that.props.slide.PROJECTID+"/editor", '_blank'); win.focus(); } } >Open in Scratch</button>
              </div>
              <div id="downloadlink" style={{display: "hidden"} }>
                <button id="opendownloadlink" onMouseDown={(e) => {e.stopPropagation(); var win = window.open(that.props.slide.DOWNLOADLINK, '_blank'); win.focus();} }   >Open Worksheet</button>
              </div>
              <input type="image" id="chinesebutton" onMouseDown={(e) => {e.stopPropagation(); that.openNext("zh-cn"); }} src="/images/chinese button.png" /> 
              <input type="image" id="spanishbutton" onMouseDown={(e) => {e.stopPropagation(); that.openNext("es"); }} src="/images/spanish button.png" />  
              <input type="image" id="skipbutton" onMouseDown={(e) => {e.stopPropagation(); that.skipToNextNode(); }} src="/images/skip button.png" /> 
              <div id="userinput" style={{display: "none"} }>
                <input type="text" id="userinputtext" placeholder=""/>
                {/* <button id="userinputsubmit">Submit</button> */}
              </div>
              <div id="userquickinput" style={{display: "none"} }>
                {/* <input type="text" id="userquickinputtext" placeholder=""/>  */}
                <textarea id="userquickinputtext" cols="40" rows="5"></textarea>
                <button id="submitquickinput">Submit</button>
                <button id="hintquickinput">Hint</button>
                <button id="answerquickinput">Solution</button>
              </div>
              <div id="usersurveyquiz" style={{display: "none"} }>
              </div>
              <span id="transcriptlabel" className={scratchGameList.includes(lesson.gameId) ? (lesson.gameId == MIGRATION_CONST.scratchSoccerGameId ? "transcriptlabelscratchclasssoccer" :  ( lesson.gameId == MIGRATION_CONST.generalconceptsGameId ? "transcriptlabelscratchclassgeneral" : ( lesson.gameId == MIGRATION_CONST.appleharvestGameId || lesson.gameId == MIGRATION_CONST.mazeGameId || lesson.gameId == MIGRATION_CONST.balloonBusterGameId ? "transcriptlabelscratchbasics" : (lesson.gameId == MIGRATION_CONST.drawingturtleGameId ? "transcriptlabelturtle" :  (lesson.gameId == MIGRATION_CONST.ia_k_turtleGameId ? "transcriptlabelscratchturtlekclass" : (  lesson.package.startsWith("school") ? ( window.currentChosenLocale == "CH" || lesson.gameId == MIGRATION_CONST.schoolAGameCHId ? "transcriptlabelsschoolACH" : (lesson.gameId == MIGRATION_CONST.schoolBGameId ? "transcriptlabelsschoolB" : "transcriptlabelsschoolA") ) :  (lesson.gameId == MIGRATION_CONST.recyclerGameId ? "transcriptlabelscratchrecycler" :  (lesson.gameId == MIGRATION_CONST.algoScratchGameId ? "transcriptlabelscratchalgoscratch" : "transcriptlabelscratchclass") )))  )  ) ) ) : "transcriptlabelclass"   }>&nbsp; </span>


              

              <button title="Hint" style={{display: "none", width: "120px"}} className="glow-on-hover2" id="hintButton">Hint</button>

              { lesson.gameId == scratchGameList.includes(lesson.gameId) ? <div /> :

              <div style={{display: "none", overflow: scroll}} id="codeSolution">
                <h2 style={{color: "white", textAlign: "center", marginBottom: "20px"}}>Solution</h2>
                {/* <button id="copySolutionButton">Copy</button> */}
                <br />
                <div id="codemirrorFrame" onClick={(e) => {e.stopPropagation();}}>
                  <CodeMirror
                    options={options}
                    ref={(ref) => {
                      if (ref != null ) {
                        window.solutionCodeEditor = ref;
                        if (s && s.TYPE.toLowerCase() == "solution" && s.ANSWERCODE) {
                          window.solutionCodeEditor.codeMirror.setValue(s.ANSWERCODE);
                        }
                      }}}
                    />
                </div>
              </div>
              }

              <div id="goldcoinsforlecture" onClick={(e) => {e.stopPropagation();}} style={{display: "none", zIndex: 110} }>
                {/* <div id="deservelabel">Time for some reward!</div> */}
                <span id="goldcoincountlabel">+10</span>
                <img src="/images/goldcoins400.png" style={{height: '60px'}} alt="gold coins" />
              </div>

              <FontAwesomeIcon className="playerCenterButton" disabled id="pauseButton" onClick={(e) => {e.stopPropagation();}} icon="pause-circle" style={{opacity: 0, display: "hidden"}} />
              <FontAwesomeIcon className="playerCenterButton" disabled id="playButton" onClick={(e) => {e.stopPropagation();}} icon="play-circle" style={{opacity: 0, display: "hidden"}} />

              <div id="scoreforlecture" onClick={(e) => {e.stopPropagation();}} style={{display: "none", zIndex: 110} }>
                <span id="scorelabel">0</span>
              </div>

            </div>
          </div>
          {/*<div id="controlwindow">
             <div id="transcriptdiv">
              <div id="lecture-table-scroll">
                <table>
                    <tbody>
                      <tr> <td  style={{width: "40px"}}></td> <td style={{width: "60px"}}>Lisa</td> <td>OK welcome to this first class!</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>We'll be learning how to build your game robot using JavaScript. Please take a look at the following picture and tell me about it!.</td> </tr>
                      <tr> <td></td> <td>John</td> <td>I can't wait to get started</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>OK welcome to this first class!</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>We'll be learning how to build your game robot using JavaScript. . Please take a look at the following picture and tell me about it!.</td> </tr>
                      <tr> <td></td> <td>John</td> <td>I can't wait to get started</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>OK welcome to this first class!</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>We'll be learning how to build your game robot using JavaScript.</td> </tr>
                      <tr> <td></td> <td>John</td> <td>I can't wait to get started</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>OK welcome to this first class!</td> </tr>
                      <tr> <td></td> <td>Lisa</td> <td>We'll be learning how to build your game robot using JavaScript.</td> </tr>
                      <tr> <td></td> <td>John</td> <td>I can't wait to get started</td> </tr>
                    </tbody>
                </table>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    );

  }

  render() {
    return this.renderLecture();
  }
}
export default LectureComponent;
