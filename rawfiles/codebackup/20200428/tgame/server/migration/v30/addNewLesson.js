// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

import { SlideContent } from "../../../lib/collections";
import { ROLES, GENDER_VALUE, MIGRATION_CONST } from '../../../lib/enum';
const fs = require('fs');
const util = require('util');

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var files = [
  // "slides-pool_lesson_0.html",
  // "slides-pool_lesson_1.html",
  // "slides-pool_homework_1.html",
  // "slides-pool_lesson_2.html",
  // "slides-pool_homework_2.html",
  // "slides-pool_lesson_3.html",
  // "slides-pool_homework_3.html",
  // "slides-pool_lesson_4.html",
  // "slides-pool_homework_4.html",
  // "slides-pool_lesson_5.html",
  // "slides-pool_homework_5.html",
  // "slides-pool_lesson_6.html",
  // "slides-pool_homework_6.html",
  // "slides-pool_lesson_7.html",
  // "slides-pool_homework_7.html",
  // "slides-pool_lesson_8.html",
  // "slides-pool_homework_8.html",
  // "slides-pool_lesson_9.html",
  // "slides-pool_homework_9.html",
  // "slides-pool_lesson_10.html",
  // "slides-pool_homework_10.html",
  // "slides-pool_lesson_11.html",
  // "slides-pool_homework_11.html",
  // "slides-pool_lesson_12.html",
  // "slides-pool_homework_12.html",
  // "slides-pool_lesson_125.html",
  // "slides-pool_lesson_13.html",
  // "slides-pool_homework_13.html",
  // "slides-pool_lesson_14.html",
  // "slides-pool_homework_14.html",
  // "slides-pool_lesson_15.html",
  // "slides-pool_lesson_16.html",
  // "slides-pool_lesson_17.html",
  // "slides-pool_lesson_18.html",
  // "slides-pool_lesson_19.html",
  // "slides-tank_lesson_0.html",
  // "slides-tank_lesson_1.html",
  // "slides-tank_homework_1.html",  
  // "slides-tank_lesson_2.html",
  // "slides-tank_homework_2.html",  
  // "slides-tank_lesson_3.html",
  // "slides-tank_homework_3.html",  
  // "slides-tank_lesson_4.html",
  // "slides-tank_homework_4.html",  
  // "slides-tank_lesson_5.html",
  // "slides-tank_homework_5.html",  
  // "slides-tank_lesson_6.html",
  // "slides-tank_homework_6.html",  
  // "slides-tank_lesson_7.html",
  // "slides-tank_homework_7.html",  
  // "slides-tank_lesson_8.html",
  // "slides-tank_homework_8.html",  
  // "slides-tank_lesson_9.html",
  // "slides-tank_homework_9.html",  
  // "slides-tank_lesson_10.html",
  // "slides-tank_homework_10.html",  
  // "slides-tank_lesson_11.html",
  // "slides-tank_homework_11.html",  
  // "slides-tank_lesson_12.html",
  // "slides-tank_homework_12.html",  
  // "slides-tank_lesson_125.html",
  // // "slides-tank_test_1.html",  
  // "slides-tank_lesson_13.html",
  // "slides-tank_lesson_14.html",
  // "slides-tank_homework_14.html",  
  // "slides-tank_lesson_15.html",
  // "slides-tank_homework_15.html",  
  // "slides-tank_lesson_16.html",
  // "slides-tank_homework_16.html",  
  // "slides-tank_lesson_17.html",
  // "slides-tank_homework_17.html",  
  // "slides-tank_lesson_18.html",
  // "slides-tank_homework_18.html",  
  // "slides-tank_lesson_19.html",
  // "slides-tank_homework_19.html",  
  // "slides-tank_lesson_20.html",
  // "slides-tank_homework_20.html",  
  // "slides-tank_lesson_21.html",
  // "slides-tank_homework_21.html",  
  // "slides-tank_lesson_22.html",
  // "slides-tank_lesson_23.html",
  // "slides-tank_lesson_24.html",
  // "slides-tank_lesson_25.html",
  // "slides-tank_lesson_26.html",
  // "slides-tank_lesson_27.html",
  // "slides-tank_lesson_28.html",
  // "slides-tank_lesson_29.html",

  // "slides-scratch_lesson_0.html",
  // "slides-scratch_homework_0.html",  
  // "slides-scratch_lesson_1.html",
  // "slides-scratch_homework_1.html",  
  // "slides-scratch_lesson_2.html",
  // "slides-scratch_homework_2.html",  
  // "slides-scratch_lesson_3.html",
  // "slides-scratch_homework_3.html",  
  // "slides-scratch_lesson_4.html",
  // "slides-scratch_homework_4.html",  
  // "slides-scratch_lesson_5.html",
  // "slides-scratch_homework_5.html",  
  // "slides-scratch_lesson_6.html",
  // "slides-scratch_homework_6.html",  
  // "slides-scratch_lesson_7.html",
  // "slides-scratch_homework_7.html",  
  // "slides-scratch_lesson_8.html",
  // "slides-scratch_homework_8.html",  
  // "slides-scratch_lesson_9.html",
  // "slides-scratch_homework_9.html",  
  // "slides-scratch_lesson_10.html",
  // "slides-scratch_homework_10.html",  
  // "slides-scratch_lesson_11.html",
  // "slides-scratch_homework_11.html",  
  // "slides-scratch_lesson_12.html",
  // "slides-scratch_homework_12.html",  
  // "slides-scratch_lesson_13.html",
  // "slides-scratch_homework_13.html",  
  // "slides-scratch_lesson_14.html",
  // "slides-scratch_homework_14.html",  
  // "slides-scratch_lesson_15.html",
  // "slides-scratch_homework_15.html",  
  // "slides-scratch_lesson_16.html",
  // "slides-scratch_lesson_17.html",
  // "slides-scratch_homework_17.html",  
  // "slides-scratch_lesson_18.html",
  // "slides-scratch_homework_18.html",  
  // "slides-scratch_lesson_19.html",
  // "slides-scratch_homework_19.html",  
  // "slides-scratch_lesson_20.html",
  // "slides-scratch_homework_20.html",  
  // "slides-scratch_lesson_21.html",
  // "slides-scratch_homework_21.html",  
  // "slides-scratch_lesson_22.html",
  // "slides-scratch_homework_22.html",  
  // "slides-scratch_lesson_23.html",
  // "slides-scratch_homework_23.html",  
  // "slides-scratch_lesson_24.html",
  // "slides-scratch_homework_24.html",  
  // "slides-scratch_lesson_25.html",
  // "slides-scratch_homework_25.html",  
  // "slides-scratch_lesson_26.html",
  // "slides-scratch_homework_26.html",  
  // "slides-flappybird_lesson_0.html",
  // "slides-flappybird_homework_0.html",  
  // "slides-flappybird_lesson_1.html",
  // "slides-flappybird_homework_1.html",  
  // "slides-flappybird_lesson_2.html",
  // "slides-flappybird_homework_2.html",  
  // "slides-flappybird_lesson_3.html",
  // "slides-flappybird_homework_3.html",  
  // "slides-flappybird_lesson_4.html",
  // "slides-flappybird_homework_4.html",  
  // "slides-flappybird_lesson_5.html",
  // "slides-flappybird_homework_5.html",  
  // "slides-tankscratch2_lesson_0.html",
  // "slides-tankscratch2_homework_0.html",  
  // "slides-tankscratch2_lesson_1.html",
  // "slides-tankscratch2_homework_1.html",  
  // "slides-tankscratch2_lesson_2.html",
  // "slides-tankscratch2_homework_2.html",  
  // "slides-tankscratch2_lesson_3.html",
  // "slides-tankscratch2_homework_3.html",  
  // "slides-tankscratch2_lesson_4.html",
  // "slides-tankscratch2_homework_4.html",  
  // "slides-tankscratch2_lesson_5.html",
  // "slides-tankscratch2_homework_5.html",  
  // "slides-tankscratch2_lesson_6.html",
  // "slides-tankscratch2_homework_6.html",  
  // "slides-tankscratch2_lesson_7.html",
  // "slides-tankscratch2_homework_7.html",  
  // "slides-tankscratch2_lesson_8.html",
  // "slides-tankscratch2_homework_8.html",  
  // "slides-tankscratch2_lesson_9.html",
  // "slides-tankscratch2_homework_9.html",  
  "slides-tankscratch2_lesson_10.html",
  "slides-tankscratch2_homework_10.html",  
  "slides-tankscratch2_lesson_11.html",
  "slides-tankscratch2_homework_11.html",  
  // "slides-tankscratch2_lesson_12.html",
  // "slides-tankscratch2_homework_12.html",  
  // "slides-tankscratch2_lesson_13.html",
  // "slides-tankscratch2_homework_13.html",  
  // "slides-tankscratch2_lesson_14.html",
  // "slides-tankscratch2_homework_14.html",  
  // "slides-tankscratch2_lesson_15.html",
  "slides-generalconcepts_lesson_0.html",
  "slides-generalconcepts_lesson_1.html",
  "slides-scratchsoccer_lesson_0.html",
  "slides-scratchsoccer_homework_0.html",
  "slides-scratchsoccer_lesson_1.html",
  "slides-scratchsoccer_homework_1.html",
  "slides-scratchsoccer_lesson_2.html",
  "slides-scratchsoccer_homework_2.html",
  "slides-scratchsoccer_lesson_3.html",
  "slides-scratchsoccer_homework_3.html",
  "slides-scratchsoccer_lesson_4.html",
  "slides-scratchsoccer_homework_4.html",
  "slides-scratchsoccer_lesson_5.html",
  "slides-scratchsoccer_homework_5.html",
  "slides-scratchsoccer_lesson_6.html",
  "slides-scratchsoccer_homework_6.html",
  "slides-scratchsoccer_lesson_7.html",
  "slides-scratchsoccer_homework_7.html",
  "slides-scratchsoccer_lesson_8.html",
  "slides-scratchsoccer_homework_8.html",
  // "slides-ia_k_turtle_lesson_1.html",
  "slides-drawingturtle_lesson_0.html",
  "slides-drawingturtle_homework_0.html",
  "slides-drawingturtle_lesson_1.html",
  "slides-drawingturtle_homework_1.html",
  "slides-drawingturtle_lesson_2.html",
  "slides-drawingturtle_homework_2.html",
  "slides-drawingturtle_lesson_3.html",
  "slides-drawingturtle_homework_3.html",
  "slides-drawingturtle_lesson_4.html",
  "slides-drawingturtle_homework_4.html",
  "slides-drawingturtle_lesson_5.html",
  "slides-drawingturtle_homework_5.html",
  "slides-drawingturtle_lesson_6.html",
  // "slides-tankscratch_lesson_0.html",
  // "slides-tankscratch_homework_0.html",  
  // "slides-tankscratch_lesson_1.html",
  // "slides-tankscratch_homework_1.html",  
  // "slides-tankscratch_lesson_2.html",
  // "slides-tankscratch_homework_2.html",  
  // "slides-tankscratch_lesson_3.html",
  // "slides-tankscratch_homework_3.html",  
  // "slides-tankscratch_lesson_4.html",
  // "slides-tankscratch_homework_4.html",  
  // "slides-tankscratch_lesson_5.html",
  // "slides-tankscratch_homework_5.html",  
  // "slides-tankscratch_lesson_6.html",
  // "slides-tankscratch_homework_6.html",  
  // "slides-tankscratch_lesson_7.html",
  // "slides-tankscratch_homework_7.html",  
  // "slides-tankscratch_lesson_8.html",
  // "slides-tankscratch_homework_8.html",  
  // "slides-tankscratch_lesson_9.html",
  // "slides-tankscratch_homework_9.html",  
  // "slides-tankscratch_lesson_10.html",
  
  // "slides-candycrush_lesson_0.html",
  // "slides-candycrush_homework_0.html",  
  // "slides-candycrush_lesson_1.html",
  // "slides-candycrush_homework_1.html",  
  // "slides-candycrush_lesson_2.html",
  // "slides-candycrush_homework_2.html",  
  // "slides-candycrush_lesson_3.html",
  // "slides-candycrush_homework_3.html",  
  // "slides-candycrush_lesson_4.html",
  // "slides-candycrush_homework_4.html",  
  // "slides-candycrush_lesson_5.html",
  // "slides-candycrush_homework_5.html",  
  // "slides-candycrush_lesson_6.html",
  // "slides-candycrush_homework_6.html",  
  // "slides-candycrush_lesson_7.html",
  // "slides-candycrush_homework_7.html",  
  // "slides-candycrush_lesson_8.html",
  // "slides-candycrush_homework_8.html",  
  // "slides-candycrush_lesson_9.html",
  // "slides-candycrush_homework_9.html",  

  "slides-school_a_lesson_1.html",
  "slides-school_a_lesson_2.html",
  "slides-school_a_lesson_3.html",
  "slides-school_a_lesson_4.html",
  "slides-school_a_lesson_5.html",
  "slides-school_a_lesson_6.html",
  "slides-school_a_lesson_7.html",
  "slides-school_a_lesson_8.html",
  "slides-school_a_lesson_9.html",
  "slides-school_a_lesson_10.html",
  "slides-school_a_lesson_11.html",
  "slides-school_a_lesson_12.html",
  "slides-school_a_lesson_13.html",
  "slides-school_a_lesson_14.html",
  "slides-school_a_lesson_15.html",
  "slides-school_a_lesson_16.html",
  "slides-school_a_lesson_17.html",
  "slides-school_a_lesson_18.html",
  "slides-school_a_lesson_19.html",
  "slides-school_a_lesson_20.html",
  "slides-school_a_lesson_21.html",
  "slides-school_a_lesson_22.html",
  "slides-school_a_lesson_23.html",
  "slides-school_a_lesson_24.html",
  "slides-school_a_lesson_25.html",
  "slides-school_a_lesson_26.html",
  "slides-school_a_lesson_27.html",
  "slides-school_a_lesson_28.html",
  "slides-school_a_lesson_29.html",
  "slides-school_a_lesson_30.html",
  "slides-school_a_lesson_31.html",
  "slides-school_a_lesson_32.html",
  "slides-school_a_lesson_33.html",
  "slides-school_a_lesson_34.html",
  "slides-school_a_lesson_35.html",
  "slides-school_a_lesson_36.html",

  "slides-canvasjs_lesson_0.html",

  "slides-algo_lesson_0.html",
  "slides-algo_lesson_1.html",
  "slides-algo_lesson_2.html",
  "slides-algo_lesson_3.html",
  "slides-algo_lesson_4.html",

  "slides-codinggame_lesson_0.html",
  "slides-codinggame_lesson_1.html",
  "slides-codinggame_lesson_2.html",
  "slides-codinggame_lesson_3.html",
  "slides-codinggame_lesson_4.html",


  "slides-recycler_lesson_0.html",
  "slides-recycler_lesson_1.html",
  "slides-recycler_lesson_2.html",
  "slides-recycler_lesson_3.html",
  "slides-recycler_lesson_4.html",
  "slides-recycler_lesson_5.html",

  "slides-appleharvest_lesson_0.html",
  "slides-appleharvest_homework_0.html",
  "slides-appleharvest_lesson_1.html",
  "slides-appleharvest_homework_1.html",
  "slides-appleharvest_lesson_2.html",
  "slides-appleharvest_homework_2.html",
  "slides-appleharvest_lesson_3.html",
  "slides-appleharvest_homework_3.html",
  "slides-appleharvest_lesson_4.html",
  "slides-appleharvest_homework_4.html",
  "slides-appleharvest_lesson_5.html",
  "slides-appleharvest_homework_5.html",
  "slides-appleharvest_lesson_6.html",
  "slides-appleharvest_homework_6.html",
  "slides-appleharvest_lesson_7.html",
  "slides-appleharvest_homework_7.html",
  "slides-appleharvest_lesson_8.html",
  "slides-appleharvest_homework_8.html",
  "slides-appleharvest_lesson_9.html",
  "slides-appleharvest_homework_9.html",
  "slides-appleharvest_lesson_10.html",
  "slides-appleharvest_homework_10.html",
  "slides-appleharvest_lesson_11.html",
  "slides-appleharvest_homework_11.html",
  "slides-appleharvest_lesson_12.html",


  "slides-maze_lesson_0.html",
  "slides-maze_homework_0.html",
  "slides-maze_lesson_1.html",
  "slides-maze_homework_1.html",
  "slides-maze_lesson_2.html",
  "slides-maze_homework_2.html",
  "slides-maze_lesson_3.html",
  "slides-maze_homework_3.html",
  "slides-maze_lesson_4.html",
  "slides-maze_lesson_5.html",
  "slides-maze_homework_5.html",
  "slides-maze_lesson_6.html",
  "slides-maze_homework_6.html",
  "slides-maze_lesson_7.html",

  "slides-algorithmjs_lesson_1.html",
  "slides-algorithmjs_lesson_2.html",
  "slides-algorithmjs_lesson_3.html",
  "slides-algorithmjs_lesson_4.html",
  "slides-algorithmjs_lesson_5.html",
  "slides-algorithmjs_lesson_6.html",
  "slides-algorithmjs_lesson_7.html",
  "slides-algorithmjs_lesson_8.html",
  "slides-algorithmjs_lesson_9.html",
  "slides-algorithmjs_lesson_10.html",
  "slides-algorithmjs_lesson_11.html",
  "slides-algorithmjs_lesson_12.html",
  "slides-algorithmjs_lesson_13.html",
];

// hack to update one lesson in prod
// files = [
//   "slides-tank_lesson_1.html",
// ]; 

function parseNotes(f) {
  // find script tag
  console.log('content is ' + f.content.substring(0, 100));
  const lines = f.content.split("\n");
  // console.log('lines are ' + lines.length + " " + JSON.stringify(lines));
  let s = "";
  let inScript = false;
  for (var k = 0; k < lines.length; k++) {
    const line = lines[k].trim();
    // console.log('line is ' + line);
    if (inScript) {
      if (line == "</script>") {
        break;
      } else {
        s = `${s} ${line}`;
      }
    } else if (line == "<script>") {
      inScript = true;  
      continue;
    }
  }
  
  // console.log("got s " + s.substring(0, 200));
  eval(s);
  const keys = Object.keys(SLConfig.deck.notes);
  // console.log("keys " + JSON.stringify(keys));

  // sort keys by when they appear in string!
  keys.sort((a, b) => {
    return f.content.indexOf(a) - f.content.indexOf(b);
  });

  // console.log("sorted keys " + JSON.stringify(keys));
  f.slideInfo = [];
  const existingIDs = {};
  let pNode = "";
  let prevProj = "";
  let prevSearchString = "";
  let prevUnlock = "";
  let prevFull = "";
  let prevScaleRatio = "";

  for (let j = 0; j < keys.length; j++) {
    var k = keys[j];
    const ind1 = f.content.indexOf(k);
    const ind2 = f.content.substring(ind1 + k.length).indexOf(k);
    if (ind2 < 0) continue;
    const n = SLConfig.deck.notes[keys[j]];
    const nlines = n.split("\n");
    // console.log("nlines " + nlines);
    const si = {};

    if (nlines[0].indexOf("//#ID") < 0) continue;

    const parts = nlines[0].replace("//", "").split("||");
    for (let x = 0; x < parts.length; x++) {
      // console.log("p " + x + " " + parts[x].trim());
      const pp = parts[x].trim().split(" ");     
      // console.log("pp[0] " + pp[0]);
      if (pp[0].toUpperCase() == "#ID") {
        si.ID = pp[1].trim();
        if (existingIDs[si.ID]) {
          console.log(`found duplicate ID!! ${si.ID}`);
          process.exit();
        } else {
          existingIDs[si.ID] = 1;
        }
      }
      if (pp[0].toUpperCase() == "#TYPE") { 
        si.TYPE = pp[1].trim().toLowerCase(); 
        if (si.TYPE.includes("coding") && si.TYPE != "coding") {
          console.log(`wrong coding ID!! ${si.TYPE}`);
          process.exit();
        }
      }
      if (pp[0].toUpperCase() == "#WINDOWS" || pp[0].toUpperCase() == "#WINDOW") { si.WINDOWS = pp[1].trim(); }
      if (pp[0].toUpperCase() == "#CONDITION") { si.TESTCONDITION = pp[1].trim(); }
      if (pp[0].toUpperCase() === "#IFRAME") { si.IFRAME = pp[1].trim(); };
      if (pp[0].toUpperCase() === "#SCRATCHUNLOCKED") { 
        si.SCRATCHUNLOCKED = 1; 
        prevUnlock = si.SCRATCHUNLOCKED;
      };
      if (pp[0].toUpperCase() === "#SCRATCHFULL") { 
        // console.log("\n\n\nfound scratch full")
        si.SCRATCHFULL = 1; 
        prevFull = si.SCRATCHFULL;
      };
      // console.log("checking pp[0].toUpperCase() " + pp[0].toUpperCase());
      if (pp[0].toUpperCase() == "#STARTINGBLOCKSTRING") { 
        si.STARTINGBLOCKSTRING = parts[x].trim().substring(21).trim(); 
        prevSearchString = si.STARTINGBLOCKSTRING;
        console.log("adding STARTINGBLOCKSTRING " + si.STARTINGBLOCKSTRING + " " + JSON.stringify(si));
        
      }
      if (pp[0].toUpperCase() == "#LOCALE") { 
        si.LOCALE = pp[1].trim(); 
        console.log("adding LOCALE " + si.LOCALE);
      }
      if (pp[0].toUpperCase() == "#SCALERATIO") { 
        si.SCALERATIO = parts[x].trim().substring(12).trim(); 
        prevScaleRatio = si.SCALERATIO;
        console.log("adding scale ratio " + si.SCALERATIO);
      }
      if (pp[0].toUpperCase() == "#PROJECTID") { 
        si.PROJECTID = pp[1].trim(); 
        prevProj = si.PROJECTID;
      }
      if (pp[0].toUpperCase() == "#DOWNLOADLINK") { 
        si.DOWNLOADLINK = pp[1].trim(); 
      }
      if (pp[0].toUpperCase() == "#HIDEOVERLAY") { 
        si.HIDEOVERLAY = pp[1].trim(); 
      }
      
      if (pp[0].toUpperCase() == "#TITLE") { si.TITLE = parts[x].trim().substring(6).trim(); }
      if (pp[0].toUpperCase() == "#NODE") {
        si.NODE = parts[x].trim().substring(6);
        pNode = si.NODE; // same for next node
      }
    }
    if (!si.NODE) {
      si.NODE = pNode;
    }
    if (!si.PROJECTID && ("coding" == si.TYPE || "hint" == si.TYPE || "solution" == si.TYPE ) ) {
      // console.log("si.TYPE " + si.TYPE + " pid " + si.PROJECTID + " prevProj " + prevProj);
      si.PROJECTID = prevProj;
      // console.log(JSON.stringify(si));
    }

    if (!si.STARTINGBLOCKSTRING && ("hint" == si.TYPE || "solution" == si.TYPE ) && prevSearchString != "" ) {
      // console.log("si.TYPE " + si.TYPE + " pid " + si.PROJECTID + " prevProj " + prevProj);
      si.STARTINGBLOCKSTRING = prevSearchString;
      // console.log(JSON.stringify(si));
    }
    if (!si.SCRATCHUNLOCKED && ("hint" == si.TYPE || "solution" == si.TYPE ) && prevUnlock != "" ) {
      // console.log("si.TYPE " + si.TYPE + " pid " + si.PROJECTID + " prevProj " + prevProj);
      si.SCRATCHUNLOCKED = prevUnlock;
      // console.log(JSON.stringify(si));
    }
    if (!si.SCRATCHFULL && ("hint" == si.TYPE || "solution" == si.TYPE ) && prevFull != "" ) {
      // console.log("si.TYPE " + si.TYPE + " pid " + si.PROJECTID + " prevProj " + prevProj);
      si.SCRATCHFULL = prevFull;
      // console.log(JSON.stringify(si));
    }
    if (!si.SCALERATIO && ("hint" == si.TYPE || "solution" == si.TYPE ) && prevScaleRatio != "" ) {
      // console.log("si.TYPE " + si.TYPE + " pid " + si.PROJECTID + " prevProj " + prevProj);
      si.SCALERATIO = prevScaleRatio;
      // console.log(JSON.stringify(si));
    }

    // also look for robot code and test script

    for (var k = 0; k < nlines.length; k++) {
      const ss = nlines[k];
      // console.log("ss is " + ss);
      if (ss.trim() == "") continue;
      if (ss.indexOf("////notes") >= 0) break;
      if (ss.indexOf("#quickinput") >= 0) {
        // save quick input question
        const parts = ss.split("||");
        si.QUICKQUESTION = parts[1].trim();
      } else if (ss.indexOf("#STARTROBOTCODE") >= 0 && ss.indexOf("#STARTROBOTCODEANSWER") < 0) {
        si.ROBOTCODE = "";
        k++;
        var ss1 = nlines[k];
        while (ss1.indexOf("#ENDROBOTCODE") < 0) {
          si.ROBOTCODE += `${ss1}\n`;
          k++;
          ss1 = nlines[k];
        }
        continue;
      } else if (ss.indexOf("#STARTTESTSCRIPT") >= 0) {
        si.TESTSCRIPT = "";
        k++;
        var ss1 = nlines[k];
        while (ss1.indexOf("#ENDTESTSCRIPT") < 0) {
          si.TESTSCRIPT += `${ss1}\n`;
          k++;
          ss1 = nlines[k];
        }
        continue;
      } else if (ss.indexOf("#STARTROBOTCODEANSWER") >= 0) {
        si.ANSWERCODE = "";
        k++;
        var ss1 = nlines[k];
        while (ss1.indexOf("#ENDROBOTCODEANSWER") < 0) {
          si.ANSWERCODE += `${ss1}\n`;
          k++;
          ss1 = nlines[k];
        }
        continue;
      } else if (ss.indexOf("#STARTTESTSCRIPTANSWER") >= 0) {
        si.ANSWERSCRIPT = "";
        k++;
        var ss1 = nlines[k];
        while (ss1.indexOf("#ENDTESTSCRIPTANSWER") < 0) {
          si.ANSWERSCRIPT += `${ss1}\n`;
          k++;
          ss1 = nlines[k];
        }
        continue;
      }
    }


    f.slideInfo.push(si);
    if (si.TYPE === "endoflesson") break;
  }
}


export default function uploadLessonFile() {
  // SlideContent.remove({});

  // console.log(`files are ${JSON.stringify(files)}`);

  Roles.addUsersToRoles("kEmnDrYssC2gKNDxx", ROLES.SUPER_ADMIN);
  Roles.addUsersToRoles("kEmnDrYssC2gKNDxx", ROLES.ADMIN);

  const poolfiles = files.filter(f => f.includes("pool_lesson"));

  console.log(process.env.PWD);

  let isDev = Meteor.isDevelopment;
  // isDev = false;

  let k125 = 10000;
  for (let k = 0; k < poolfiles.length; k++) {
    const f = {
      filename: poolfiles[k]
    };
    // console.log("next " + poolfiles[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Pool/' + poolfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }

    if (poolfiles[k].indexOf("pool_lesson_125")>=0) {
      f._id = `pool_lesson_12.5`;
      k125 = k;
    } else {
      f._id = `pool_lesson_${k}`;
      if (k > k125) {
        f._id = `pool_lesson_${k-1}`;
      }
    }

    
    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("adding lesson slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/Pool/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }

  const poolhomeworks = files.filter(f => f.includes("pool_homework"));

  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < poolhomeworks.length; k++) {
    const f = {
      filename: poolhomeworks[k]
    };
    // console.log("next " + poolhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Pool/' + poolhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `pool_homework_${k+1}`;

    // if (poolhomeworks[k].indexOf("pool_homework_125")>=0) {
    //   f._id = `pool_homework_12.5`;
    //   k125 = k;
    // } else {
    //   f._id = `pool_homework_${k}`;
    // }



    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/Pool/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }





  const tankfiles = files.filter(f => f.includes("tank_lesson"));
  k125 = 10000;
  for (let k = 0; k < tankfiles.length; k++) {
    const f = {
      filename: tankfiles[k]
    };
    
    if (tankfiles[k].indexOf("tank_lesson_125")>=0) {
      f._id = `tank_lesson_12.5`;
      k125 = k;
    } else {
      f._id = `tank_lesson_${k}`;
      if (k > k125) {
        f._id = `tank_lesson_${k-1}`;
      }
    }

    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Tank/' + tankfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding lesson slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/Tank/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const tankhomeworks = files.filter(f => f.includes("tank_homework"));

  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < tankhomeworks.length; k++) {
    const f = {
      filename: tankhomeworks[k]
    };
    // console.log("next " + tankhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Tank/' + tankhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    //f._id = `tank_homework_${k+1}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.length-5);
    // console.log("f id " + f._id);


    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/Tank/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const tanktests = files.filter(f => f.includes("tank_test"));

  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < tanktests.length; k++) {
    const f = {
      filename: tanktests[k]
    };
    // console.log("next " + tankhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Tank/' + tanktests[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `tank_test_${k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("adding test slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/Tank/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }





  const scratchfiles = files.filter(f => f.includes("-scratch_lesson"));
  // console.log("scratchfiles " + JSON.stringify(scratchfiles));

  for (let k = 0; k < scratchfiles.length; k++) {
    const f = {
      filename: scratchfiles[k]
    };
    f._id = `scratch_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Scratch/' + scratchfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    // console.log("adding scratch lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/Scratch/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const scratchhomeworks = files.filter(f => f.includes("-scratch_homework"));
  // console.log("scratchhomeworks " + JSON.stringify(scratchhomeworks));
  // console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < scratchhomeworks.length; k++) {
    const f = {
      filename: scratchhomeworks[k]
    };
    // console.log("next "  + k + ": " + scratchhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Scratch/' + scratchhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `scratch_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/Scratch/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  // flappy Bird



  const flappybirdfiles = files.filter(f => f.includes("flappybird_lesson"));
  console.log("flappybirdfiles " + JSON.stringify(flappybirdfiles));

  for (let k = 0; k < flappybirdfiles.length; k++) {
    const f = {
      filename: flappybirdfiles[k]
    };
    f._id = `flappybird_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/FlappyBird/' + flappybirdfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding flappybird lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/FlappyBird/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const flappybirdhomeworks = files.filter(f => f.includes("flappybird_homework"));
  console.log("flappybirdhomeworks " + JSON.stringify(flappybirdhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < flappybirdhomeworks.length; k++) {
    const f = {
      filename: flappybirdhomeworks[k]
    };
    // console.log("next "  + k + ": " + flappybirdhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/FlappyBird/' + flappybirdhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `flappybird_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/FlappyBird/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }


  const tankscratchfiles = files.filter(f => f.includes("tankscratch_lesson"));
  console.log("tankscratchfiles " + JSON.stringify(tankscratchfiles));

  for (let k = 0; k < tankscratchfiles.length; k++) {
    const f = {
      filename: tankscratchfiles[k]
    };
    f._id = `tankscratch_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/tankscratch/' + tankscratchfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding tankscratch lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/tankscratch/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const tankscratchhomeworks = files.filter(f => f.includes("tankscratch_homework"));
  console.log("tankscratchhomeworks " + JSON.stringify(tankscratchhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < tankscratchhomeworks.length; k++) {
    const f = {
      filename: tankscratchhomeworks[k]
    };
    // console.log("next "  + k + ": " + tankscratchhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/tankscratch/' + tankscratchhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `tankscratch_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/tankscratch/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  const tankscratch2files = files.filter(f => f.includes("tankscratch2_lesson"));
  console.log("tankscratch2files " + JSON.stringify(tankscratch2files));

  for (let k = 0; k < tankscratch2files.length; k++) {
    const f = {
      filename: tankscratch2files[k]
    };
    f._id = `tankscratch2_lesson_${k+10}`; // bbbbb hack
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/tankscratch2/' + tankscratch2files[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("ttt mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding tankscratch2 lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/tankscratch2/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const tankscratch2homeworks = files.filter(f => f.includes("tankscratch2_homework"));
  console.log("tankscratch2homeworks " + JSON.stringify(tankscratch2homeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < tankscratch2homeworks.length; k++) {
    const f = {
      filename: tankscratch2homeworks[k]
    };
    // console.log("next "  + k + ": " + tankscratch2homeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/tankscratch2/' + tankscratch2homeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `tankscratch2_homework_${k <= 125 ? k+10 : k+1}`;

    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("adding homework slide: " + f._id);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/tankscratch2/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  const generalconceptsfiles = files.filter(f => f.includes("generalconcepts_lesson"));
  // console.log("generalconceptsfiles " + JSON.stringify(generalconceptsfiles));

  for (let k = 0; k < generalconceptsfiles.length; k++) {
    const f = {
      filename: generalconceptsfiles[k]
    };
    f._id = `generalconcepts_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/generalconcepts/' + generalconceptsfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding generalconcepts lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/generalconcepts/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  const scratchsoccerfiles = files.filter(f => f.includes("scratchsoccer_lesson"));
  // console.log("scratchsoccerfiles " + JSON.stringify(scratchsoccerfiles));

  for (let k = 0; k < scratchsoccerfiles.length; k++) {
    const f = {
      filename: scratchsoccerfiles[k]
    };
    f._id = `scratchsoccer_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/scratchsoccer/' + scratchsoccerfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding scratchsoccer lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/scratchsoccer/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const scratchsoccerhomeworks = files.filter(f => f.includes("scratchsoccer_homework"));
  // console.log("scratchsoccerhomeworks " + JSON.stringify(scratchsoccerhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < scratchsoccerhomeworks.length; k++) {
    const f = {
      filename: scratchsoccerhomeworks[k]
    };
    // console.log("next "  + k + ": " + scratchsoccerhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/scratchsoccer/' + scratchsoccerhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `scratchsoccer_homework_${k <= 125 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("adding homework slide: " + f._id);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/scratchsoccer/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }
















  const candycrushfiles = files.filter(f => f.includes("candycrush_lesson"));
  console.log("candycrushfiles " + JSON.stringify(candycrushfiles));

  for (let k = 0; k < candycrushfiles.length; k++) {
    const f = {
      filename: candycrushfiles[k]
    };
    f._id = `candycrush_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/candycrush/' + candycrushfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding candycrush lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/candycrush/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const candycrushhomeworks = files.filter(f => f.includes("candycrush_homework"));
  console.log("candycrushhomeworks " + JSON.stringify(candycrushhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < candycrushhomeworks.length; k++) {
    const f = {
      filename: candycrushhomeworks[k]
    };
    // console.log("next "  + k + ": " + candycrushhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/candycrush/' + candycrushhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `candycrush_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/candycrush/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }


  const appleharvestfiles = files.filter(f => f.includes("appleharvest_lesson"));
  // console.log("appleharvestfiles " + JSON.stringify(appleharvestfiles));

  for (let k = 0; k < appleharvestfiles.length; k++) {
    const f = {
      filename: appleharvestfiles[k]
    };
    f._id = `appleharvest_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/AppleHarvest/' + appleharvestfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding appleharvest lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/AppleHarvest/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const appleharvesthomeworks = files.filter(f => f.includes("appleharvest_homework"));
  // console.log("appleharvesthomeworks " + JSON.stringify(appleharvesthomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < appleharvesthomeworks.length; k++) {
    const f = {
      filename: appleharvesthomeworks[k]
    };
    // console.log("next "  + k + ": " + appleharvesthomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/AppleHarvest/' + appleharvesthomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `appleharvest_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/AppleHarvest/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }


  // aaaaa need to add for new courses!

  const canvasjsfiles = files.filter(f => f.includes("canvasjs_lesson"));
  console.log("canvasjsfiles " + JSON.stringify(canvasjsfiles));

  for (let k = 0; k < canvasjsfiles.length; k++) {
    const f = {
      filename: canvasjsfiles[k]
    };
    f._id = `canvasjs_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/canvasjs/' + canvasjsfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding canvasjs lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/canvasjs/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const canvasjshomeworks = files.filter(f => f.includes("canvasjs_homework"));
  console.log("canvasjshomeworks " + JSON.stringify(canvasjshomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < canvasjshomeworks.length; k++) {
    const f = {
      filename: canvasjshomeworks[k]
    };
    // console.log("next "  + k + ": " + canvasjshomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/canvasjs/' + canvasjshomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `canvasjs_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/canvasjs/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }






  const recyclerfiles = files.filter(f => f.includes("recycler_lesson"));
  // console.log("recyclerfiles " + JSON.stringify(recyclerfiles));

  for (let k = 0; k < recyclerfiles.length; k++) {
    const f = {
      filename: recyclerfiles[k]
    };
    f._id = `recycler_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/recycler/' + recyclerfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding recycler lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/recycler/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const recyclerhomeworks = files.filter(f => f.includes("recycler_homework"));
  // console.log("recyclerhomeworks " + JSON.stringify(recyclerhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < recyclerhomeworks.length; k++) {
    const f = {
      filename: recyclerhomeworks[k]
    };
    // console.log("next "  + k + ": " + recyclerhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/recycler/' + recyclerhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `recycler_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/recycler/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }

  const codinggamefiles = files.filter(f => f.includes("codinggame_lesson"));
  // console.log("recyclerfiles " + JSON.stringify(recyclerfiles));

  for (let k = 0; k < codinggamefiles.length; k++) {
    const f = {
      filename: codinggamefiles[k]
    };
    f._id = `codinggame_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/codinggame/' + codinggamefiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding codinggame lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/codinggame/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }





  const algofiles = files.filter(f => f.includes("algo_lesson"));
  // console.log("recyclerfiles " + JSON.stringify(recyclerfiles));

  for (let k = 0; k < algofiles.length; k++) {
    const f = {
      filename: algofiles[k]
    };
    f._id = `algo_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/algo/' + algofiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding algo lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/algo/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const algohomeworks = files.filter(f => f.includes("algo_homework"));
  // console.log("recyclerhomeworks " + JSON.stringify(recyclerhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < algohomeworks.length; k++) {
    const f = {
      filename: algohomeworks[k]
    };
    // console.log("next "  + k + ": " + algohomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/algo/' + algohomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `algo_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/algo/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  
  const levelafiles = files.filter(f => f.includes("school_a_lesson"));
  // console.log("levelafiles " + JSON.stringify(levelafiles));

  for (let k = 0; k < levelafiles.length; k++) {
    const f = {
      filename: levelafiles[k]
    };
    f._id = `school_a_lesson_${k+1}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/School/' + levelafiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding level a lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/School/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }





  const mazefiles = files.filter(f => f.includes("maze_lesson"));
  // console.log("mazefiles " + JSON.stringify(mazefiles));

  for (let k = 0; k < mazefiles.length; k++) {
    const f = {
      filename: mazefiles[k]
    };
    f._id = `maze_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Maze/' + mazefiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding maze lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/Maze/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  const mazehomeworks = files.filter(f => f.includes("maze_homework"));
  // console.log("mazehomeworks " + JSON.stringify(mazehomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < mazehomeworks.length; k++) {
    const f = {
      filename: mazehomeworks[k]
    };
    // console.log("next "  + k + ": " + mazehomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Maze/' + mazehomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `maze_homework_${k <= 3 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/Maze/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  const algorithmfiles = files.filter(f => f.includes("algorithmjs_lesson"));
  // console.log("algorithmfiles " + JSON.stringify(algorithmfiles));

  for (let k = 0; k < algorithmfiles.length; k++) {
    const f = {
      filename: algorithmfiles[k]
    };
    f._id = `algorithmjs_lesson_${k+1}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Algorithm/' + algorithmfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding algorithm lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/Algorithm/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }









  const drawingturtlefiles = files.filter(f => f.includes("drawingturtle_lesson"));
  // console.log("drawingturtlefiles " + JSON.stringify(drawingturtlefiles));

  for (let k = 0; k < drawingturtlefiles.length; k++) {
    const f = {
      filename: drawingturtlefiles[k]
    };
    f._id = `drawingturtle_lesson_${k}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/drawingturtle/' + drawingturtlefiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding drawingturtle lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/drawingturtle/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const drawingturtlehomeworks = files.filter(f => f.includes("drawingturtle_homework"));
  // console.log("drawingturtlehomeworks " + JSON.stringify(drawingturtlehomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < drawingturtlehomeworks.length; k++) {
    const f = {
      filename: drawingturtlehomeworks[k]
    };
    // console.log("next "  + k + ": " + drawingturtlehomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/drawingturtle/' + drawingturtlehomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `drawingturtle_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/drawingturtle/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  // IA Kindergarten


  const kturtlefiles = files.filter(f => f.includes("ia_k_turtle_lesson"));
  console.log("kturtlefiles " + JSON.stringify(kturtlefiles));

  for (let k = 0; k < kturtlefiles.length; k++) {
    const f = {
      filename: kturtlefiles[k]
    };
    f._id = `ia_k_turtle_lesson_${k+1}`;
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/ia_k_turtle/' + kturtlefiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding kturtle lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/ia_k_turtle/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }




  const kturtlehomeworks = files.filter(f => f.includes("ia_k_turtle_homework"));
  console.log("kturtlehomeworks " + JSON.stringify(kturtlehomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < kturtlehomeworks.length; k++) {
    const f = {
      filename: kturtlehomeworks[k]
    };
    // console.log("next "  + k + ": " + kturtlehomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/ia_k_turtle/' + kturtlehomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `ia_k_turtle_homework_${k <= 15 ? k : k+1}`;


    // console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/ia_k_turtle/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



}
