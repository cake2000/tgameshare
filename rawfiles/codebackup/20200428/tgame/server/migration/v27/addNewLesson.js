// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

import { SlideContent } from "../../../lib/collections";
const fs = require('fs');
const util = require('util');

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

const files = [
  "slides-pool_lesson_0.html",
  "slides-pool_lesson_1.html",
  "slides-pool_homework_1.html",
  "slides-pool_lesson_2.html",
  "slides-pool_homework_2.html",
  "slides-pool_lesson_3.html",
  "slides-pool_homework_3.html",
  "slides-pool_lesson_4.html",
  "slides-pool_homework_4.html",
  "slides-pool_lesson_5.html",
  "slides-pool_homework_5.html",
  "slides-pool_lesson_6.html",
  "slides-pool_homework_6.html",
  "slides-pool_lesson_7.html",
  "slides-pool_homework_7.html",
  "slides-pool_lesson_8.html",
  "slides-pool_homework_8.html",
  "slides-pool_lesson_9.html",
  "slides-pool_homework_9.html",
  "slides-pool_lesson_10.html",
  "slides-pool_homework_10.html",
  "slides-pool_lesson_11.html",
  "slides-pool_homework_11.html",
  "slides-pool_lesson_12.html",
  "slides-pool_homework_12.html",
  "slides-pool_lesson_125.html",
  "slides-pool_lesson_13.html",
  "slides-pool_homework_13.html",
  "slides-pool_lesson_14.html",
  "slides-pool_homework_14.html",
  "slides-pool_lesson_15.html",
  "slides-pool_lesson_16.html",
  "slides-pool_lesson_17.html",
  "slides-pool_lesson_18.html",
  "slides-pool_lesson_19.html",
  "slides-tank_lesson_0.html",
  "slides-tank_lesson_1.html",
  "slides-tank_homework_1.html",  
  "slides-tank_lesson_2.html",
  "slides-tank_homework_2.html",  
  "slides-tank_lesson_3.html",
  "slides-tank_homework_3.html",  
  "slides-tank_lesson_4.html",
  "slides-tank_homework_4.html",  
  "slides-tank_lesson_5.html",
  "slides-tank_lesson_6.html",
  "slides-tank_lesson_7.html",
  "slides-tank_lesson_8.html",
];


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
      if (pp[0].toUpperCase() == "#TITLE") { si.TITLE = parts[x].trim().substring(6).trim(); }
      if (pp[0].toUpperCase() == "#NODE") {
        si.NODE = parts[x].trim().substring(6);
        pNode = si.NODE; // same for next node
      }
    }
    if (!si.NODE) {
      si.NODE = pNode;
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
    var stats, mtime;
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
    var stats, mtime;
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

  for (let k = 0; k < tankfiles.length; k++) {
    const f = {
      filename: tankfiles[k]
    };
    f._id = `tank_lesson_${k}`;
    var stats, mtime;
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
    var stats, mtime;
    if (isDev) {
      stats = fs.statSync(process.env.PWD + '/private/NewCourses/Tank/' + tankhomeworks[k]);
      mtime = new Date(util.inspect(stats.mtime));
    }
    f._id = `tank_homework_${k+1}`;


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





}
