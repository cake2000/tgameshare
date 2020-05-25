// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

import { SlideContent } from "../../../lib/collections";
import { ROLES, GENDER_VALUE, MIGRATION_CONST } from '../../../lib/enum';
const fs = require('fs');
const util = require('util');

const REGEX_CHINESE = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u;

// Object.defineProperty(String.prototype, 'hashCode', {
//   value: function() {
//     var hash = 0, i, chr;
//     for (i = 0; i < this.length; i++) {
//       chr   = this.charCodeAt(i);
//       hash  = ((hash << 5) - hash) + chr;
//       hash |= 0; // Convert to 32bit integer
//     }
//     return hash;
//   }
// });

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

var files = [
  // "slides-appleharvest_homework_1.html",
  // "slides-appleharvest_lesson_4.html",
  "slides-recycler_lesson_1.html",
  "slides-recycler_lesson_5.html",
  // "slides-algo_lesson_0.html",
  // "slides-algo_lesson_4.html",
  // "slides-algo_lesson_5.html",
  "slides-algo_lesson_7.html",
  "slides-school_a_lesson_1.html",
  "slides-school_a_lesson_1_ch.html",
  "slides-school_a_lesson_2.html",
  "slides-school_a_lesson_2_ch.html",
  "slides-school_a_lesson_3.html",
  "slides-school_a_lesson_3_ch.html",
  "slides-school_a_lesson_4.html",
  "slides-school_a_lesson_4_ch.html",
  "slides-school_a_lesson_5.html",
  "slides-school_a_lesson_5_ch.html",
  "slides-school_a_lesson_6.html",
  "slides-school_a_lesson_6_ch.html",
  "slides-school_a_lesson_7.html",
  "slides-school_a_lesson_7_ch.html",
  "slides-school_a_lesson_8.html",
  "slides-school_a_lesson_8_ch.html",
  "slides-school_a_lesson_9.html",
  "slides-school_a_lesson_9_ch.html",
  "slides-school_a_lesson_10.html",
  "slides-school_a_lesson_10_ch.html",
  "slides-school_a_lesson_11.html",
  "slides-school_a_lesson_11_ch.html",
  "slides-school_a_lesson_12.html",
  "slides-school_a_lesson_12_ch.html",
  "slides-school_a_lesson_13.html",
  "slides-school_a_lesson_13_ch.html",
  "slides-school_a_lesson_14.html",
  "slides-school_a_lesson_14_ch.html",
  "slides-school_a_lesson_15.html",
  "slides-school_a_lesson_15_ch.html",
  "slides-school_a_lesson_35.html",
  "slides-school_a_lesson_36.html",
  "slides-school_a_lesson_37.html",
  "slides-school_a_lesson_38.html",
  "slides-school_a_lesson_39.html",
  "slides-school_a_lesson_40.html",
  "slides-school_a_lesson_41.html",
  "slides-school_a_lesson_42.html",
  "slides-school_a_lesson_43.html",
  "slides-school_a_lesson_44.html",
  "slides-school_a_lesson_45.html",
  "slides-school_a_lesson_46.html",
  "slides-school_a_lesson_47.html",
  "slides-school_a_lesson_48.html",
  "slides-school_a_lesson_49.html",
  "slides-school_a_lesson_18.html",
  "slides-school_a_lesson_18_ch.html",
  "slides-school_b_lesson_1.html",
  "slides-school_b_lesson_2.html",
  "slides-school_b_lesson_3.html",
  "slides-school_b_lesson_4.html",
  // "slides-algorithmjs_lesson_11.html",
  // "slides-algorithmjs_lesson_12.html",
  // "slides-algorithmjs_lesson_13.html",
   "slides-balloonbuster_lesson_0.html",
  // "slides-balloonbuster_homework_0.html",
   "slides-balloonbuster_lesson_1.html",
  // "slides-balloonbuster_homework_1.html",
  "slides-balloonbuster_lesson_2.html",
  // "slides-balloonbuster_homework_2.html",
  // "slides-balloonbuster_lesson_3.html",
  // "slides-balloonbuster_lesson_4.html",
  // "slides-maze_lesson_7.html",
  // "slides-maze_lesson_6.html",
];

// hack to update one lesson in prod
// files = [
//   "slides-tank_lesson_1.html",
// ]; 

function parseNotes(f) {
  // find script tag
  // console.log('content is ' + f.content.substring(0, 100));
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
    console.log(nlines[0]);
    for (let x = 0; x < parts.length; x++) {
      console.log("p " + x + " " + parts[x].trim());
      
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
        // console.log("adding STARTINGBLOCKSTRING " + si.STARTINGBLOCKSTRING + " " + JSON.stringify(si));
        
      }
      if (pp[0].toUpperCase() == "#LOCALE") { 
        si.LOCALE = pp[1].trim(); 
        // console.log("adding LOCALE " + si.LOCALE);
      }
      if (pp[0].toUpperCase() == "#SCALERATIO") { 
        si.SCALERATIO = parts[x].trim().substring(12).trim(); 
        prevScaleRatio = si.SCALERATIO;
        // console.log("adding scale ratio " + si.SCALERATIO);
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
      
      if (pp[0].toUpperCase() == "#TITLE") { 
        si.TITLE = parts[x].trim().substring(6).trim(); 
      }
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

      // generate speech text files for each line 

      if (f._id.includes("school_") && !Meteor.isProduction && !ss.includes("#WindowLayoutLE") && !ss.includes("[#") && !ss.includes("#SchoolGrade")  && !ss.includes("#survey") && !ss.includes("#input") && !ss.includes("#quickinput") && !ss.includes("#ID") && !ss.includes("[#") && !ss.includes("#quiz") && !ss.includes("#match") && !ss.includes("#PauseSlide") && !ss.includes("#AwardCoin") && !ss.includes("#quiz") && !ss.includes("#NextFragment")) {


        // if ( (f._id.endsWith("_ch") || si.LOCALE == "zh-cn") ) {
          // var p = /^\[.+\]\s*\[.*\]/;
          if (REGEX_CHINESE.test(ss.trim()) ) {
            // this is a script line
            const parts = ss.split("[");
            const parts2 = parts[2].split("]");
            const line = parts2[0];

            let fn = "/home/binyu/dev/xunfei/voicefiles/data/text-" + f._id+"-" + si.ID+"-"+k+"-"+line.hashCode();
            console.log("fn is " + fn);
            console.log("ch line is " + line);

            try {
              fs.writeFileSync(fn, line);
            } catch(err) {
              // An error occurred
              console.error(err);
            }

          }
        // }



        if ((si.LOCALE == "es") ) {
          // var p = /^\[.+\]\s*\[.*\]/;
          if (1) {
            // this is a script line
            const parts = ss.split("[");
            const parts2 = parts[2].split("]");
            const line = parts2[0];

            let fn = "/home/binyu/dev/xunfei/voicefiles/dataes/text-" + f._id+"-" + si.ID+"-"+k+"-"+line.hashCode();
            console.log("fn is " + fn);
            console.log("es line is " + line);

            try {
              fs.writeFileSync(fn, line);
            } catch(err) {
              // An error occurred
              console.error(err);
            }

          }
        } else {

        // if (!Meteor.isProduction && f._id.includes("school") && !f._id.endsWith("_ch")) {
          // var p = /^\[.+\]\s*\[.*\]/;
          // if (!ss.includes("#ID")  ) {
            // this is a script line
            const parts = ss.split("[");
            const parts2 = parts[2].split("]");
            const line = parts2[0];

            console.log("line is " + line);
            let fn = "/home/binyu/dev/xunfei/voicefiles/dataen/text-" + f._id+"-" + si.ID+"-"+k+"-"+line.hashCode();
            console.log("fn is " + fn);
            console.log("en line is " + line);

            try {
              fs.writeFileSync(fn, line);
            } catch(err) {
              // An error occurred
              console.error(err);
            }

          // }
        }
      }


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

    if (!si.TITLE) {
      console.log("no title for " + JSON.stringify(si));
      process.exit();
    }


    f.slideInfo.push(si);
    if (si.TYPE === "endoflesson") break;
  }

  // also trim last part of file
  if (f.content.includes("Reveal.initialize({")) {
    let ind = f.content.indexOf("!function(t){function e(t,e,r,n,i){this._li");
    f.content = f.content.substring(0, ind);
  }

}


export default function uploadLessonFile() {
  // SlideContent.remove({});

  // console.log(`files are ${JSON.stringify(files)}`);

  Roles.addUsersToRoles("kEmnDrYssC2gKNDxx", ROLES.SUPER_ADMIN);
  Roles.addUsersToRoles("kEmnDrYssC2gKNDxx", ROLES.ADMIN);


  let isDev = Meteor.isDevelopment;


  const algofiles = files.filter(f => f.includes("algo_lesson"));
  // console.log("recyclerfiles " + JSON.stringify(recyclerfiles));

  for (let k = 0; k < algofiles.length; k++) {
    const f = {
      filename: algofiles[k]
    };
    //f._id = `school_a_lesson_${k+1}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));
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




  
  const levelafiles = files.filter(f => f.includes("school_"));
  console.log("levelafiles " + JSON.stringify(levelafiles));

  for (let k = 0; k < levelafiles.length; k++) {
    const f = {
      filename: levelafiles[k]
    };
    //f._id = `school_a_lesson_${k+1}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));
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
    console.log("adding school lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/School/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");

    let ind = f.content.indexOf("Reveal.initialize({") + "Reveal.initialize({".length;
    // console.log("found at ind " + ind);

    f.content = f.content.substring(0, ind) + "history: true," + f.content.substring(ind); 

    // f.content = replaceAll(f.content, "Reveal.initialize({", "Reveal.initialize({history: true, ");
    // f.content = replaceAll(f.content, "SLConfig.deck.background_transition", "'none'");
    // f.content = replaceAll(f.content, "SLConfig.deck.transition", "'none'");

    parseNotes(f);

    SlideContent.insert(f);
  }




  const algorithmfiles = files.filter(f => f.includes("algorithmjs_lesson"));
  // console.log("algorithmfiles " + JSON.stringify(algorithmfiles));

  for (let k = 0; k < algorithmfiles.length; k++) {
    const f = {
      filename: algorithmfiles[k]
    };
    // f._id = `algorithmjs_lesson_${k+1}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));

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

  const appleharvestfiles = files.filter(f => f.includes("appleharvest_lesson"));
  // console.log("appleharvestfiles " + JSON.stringify(appleharvestfiles));

  for (let k = 0; k < appleharvestfiles.length; k++) {
    const f = {
      filename: appleharvestfiles[k]
    };
    // f._id = `appleharvest_lesson_${k}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));    
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
    // f._id = `appleharvest_homework_${k <= 15 ? k : k+1}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));

    console.log("f id " + f._id);
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


  const mazefiles = files.filter(f => f.includes("maze_lesson"));
  // console.log("mazefiles " + JSON.stringify(mazefiles));

  for (let k = 0; k < mazefiles.length; k++) {
    const f = {
      filename: mazefiles[k]
    };
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));
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




  const balloonbusterfiles = files.filter(f => f.includes("balloonbuster_lesson"));
  // console.log("balloonbusterfiles " + JSON.stringify(balloonbusterfiles));

  for (let k = 0; k < balloonbusterfiles.length; k++) {
    const f = {
      filename: balloonbusterfiles[k]
    };
    // f._id = `balloonbuster_lesson_${k}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));    
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/BalloonBuster/' + balloonbusterfiles[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // console.log(mtime);
    const sc = SlideContent.findOne({_id: f._id });
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    console.log("adding balloonbuster lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/BalloonBuster/${f.filename}`);
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
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));   
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
    // console.log("adding recycler lesson slide: " + f.filename + " " + f._id);
    SlideContent.remove({_id: f._id });
    if (isDev) f.filetime = mtime;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/recycler/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



  const balloonbusterhomeworks = files.filter(f => f.includes("balloonbuster_homework"));
  // console.log("balloonbusterhomeworks " + JSON.stringify(balloonbusterhomeworks));
  console.log(process.env.PWD);

  k125 = 10000;
  for (let k = 0; k < balloonbusterhomeworks.length; k++) {
    const f = {
      filename: balloonbusterhomeworks[k]
    };
    // console.log("next "  + k + ": " + balloonbusterhomeworks[k]);
    var stats, mtime = new Date();
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/BalloonBuster/' + balloonbusterhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    // f._id = `balloonbuster_homework_${k <= 15 ? k : k+1}`;
    f._id = f.filename.substring(7);
    f._id = f._id.substring(0, f._id.indexOf("."));

    console.log("f id " + f._id);
    const sc = SlideContent.findOne({_id: f._id });
    // console.log("mtime: " + mtime.getTime());
    // console.log("sc.filetime: " + sc.filetime.getTime());
    if (isDev && sc && sc.filetime && sc.filetime.getTime() == mtime.getTime()) continue;
    // console.log("adding homework slide: " + f.filename);
    SlideContent.remove({_id: f._id });
    f.createdAt = new Date();
    if (isDev) f.filetime = mtime;
    f.content = Assets.getText(`NewCourses/BalloonBuster/${f.filename}`);
    f.content = replaceAll(f.content, "https://static.slid.es/fonts", "https://s3.amazonaws.com/static.slid.es/fonts");
    parseNotes(f);

    SlideContent.insert(f);
  }



}
