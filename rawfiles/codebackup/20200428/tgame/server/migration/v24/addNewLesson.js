// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

import { SlideContent } from "../../../lib/collections";

const files = [
  "slides-pool_lesson_0.html",
  "slides-pool_lesson_1.html",
  "slides-pool_lesson_2.html",
  "slides-pool_lesson_3.html",
  "slides-pool_lesson_4.html",
  "slides-pool_lesson_5.html",
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
      if (pp[0].toUpperCase() == "#TYPE") { si.TYPE = pp[1].trim().toLowerCase(); }
      if (pp[0].toUpperCase() == "#WINDOWS") { si.WINDOWS = pp[1].trim(); }
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
      if (ss.trim() == "") continue;
      if (ss.indexOf("#STARTROBOTCODE") >= 0 && ss.indexOf("#STARTROBOTCODEANSWER") < 0) {
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
  SlideContent.remove({});

  console.log(`files is ${JSON.stringify(files)}`);

  for (let k = 0; k < files.length; k++) {
    const f = {
      filename: files[k]
    };
    f._id = `pool_lesson_${k}`;
    f.createdAt = new Date();
    f.content = Assets.getText(`NewCourses/Pool/${f.filename}`);
    parseNotes(f);

    SlideContent.insert(f);
  }
}
