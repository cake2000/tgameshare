// var json2csv = require('json2csv');
// var Json2csvParser = require('json2csv').Parser;

var fs = require('fs');
const { exec } = require('child_process');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:3001/meteor';



function getNotes(content) {
    // find script tag
    // console.log('content is ' + content.substring(0, 100));
    const lines = content.split("\n");
    // console.log('lines are ' + lines.length + " " + JSON.stringify(lines));
    let s = "";
    let inScript = false;
    for (var k = 0; k < lines.length; k++) {
      const line = lines[k].trim();
    //   console.log('line is ' + line);
      if (inScript) {
        if (line == "</script>") {
          break;
        } else {
          s = `${s} ${line}`;

          if (s.includes("</script> ")) {
              s = s.substring(0, s.indexOf("</script> "));
              break;
          }
        }
      } else if (line == "<script>") {
        inScript = true;  
        continue;
      }
    }
    
    // console.log("got s " + s.substring(0, 20000000000));
    eval(s);
    const keys = Object.keys(SLConfig.deck.notes);
    // console.log("keys " + JSON.stringify(keys));
  
    // sort keys by when they appear in string!
    keys.sort((a, b) => {
      return content.indexOf(a) - content.indexOf(b);
    });
  
    // console.log("sorted keys " + JSON.stringify(keys));
    const slideInfo = [];
    const existingIDs = {};
    let pNode = "";
    let prevProj = "";
    let prevNBPath = "";
    let prevSearchString = "";
    let prevUnlock = "";
    let prevFull = "";
    let prevScaleRatio = "";
  
    for (let j = 0; j < keys.length; j++) {
      var k = keys[j];
      const ind1 = content.indexOf(k);
      const ind2 = content.substring(ind1 + k.length).indexOf(k);
      if (ind2 < 0) continue;
      const n = SLConfig.deck.notes[keys[j]];
      if (n.includes("endoflesson")) break;
      const nlines = n.split("\n");
    //   console.log("nlines " + nlines);
      const si = nlines;



      slideInfo.push(si);
    }

    return slideInfo;
}


function docompare(idroot) {

    var url2 = 'mongodb+srv://upliftingtechnology:ABCD1234!!@tgamesharedplan-b45ae.mongodb.net/tgame?retryWrites=true&w=majority';

  MongoClient.connect(url2, function(err, client) {
    // console.log("connectd ");
    var db2 = client.db("tgame");

    // console.log("db is " + JSON.stringify(Object.keys(db2)));


    // var users = db1.collection('users');
    var SlideContent = db2.collection('SlideContent');
    // var allchats = UserChat.find({ }, { fields: { 'scenarioId':1, 'userId': 1, 'chats.createdAt': 1, 'chats.actionType': 1 } }).fetch();
  

    SlideContent.find({_id: {$in: [idroot, idroot + "_ch"] }}, {_id: 1, versionID: 1}).toArray(function(err, slides) {
          if (err) {
              console.log(err);
          } else {
                const goodfiles = slides.map((f) => f.versionID ? f._id + "-" + (f.versionID) + ".html" : f._id + ".html");
                console.log("slides  " + goodfiles);

                var fc = null;
                var fe = null; 
                if (goodfiles[0].includes(idroot+"_ch")) {
                    fc = fs.readFileSync("/home/binyu/dev/tgameshare/slidecontent/" + goodfiles[0], 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);
                    fe = fs.readFileSync("/home/binyu/dev/tgameshare/slidecontent/" + goodfiles[1], 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);
                } else {
                    fe = fs.readFileSync("/home/binyu/dev/tgameshare/slidecontent/" + goodfiles[0], 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);
                    fc = fs.readFileSync("/home/binyu/dev/tgameshare/slidecontent/" + goodfiles[1], 'utf8'); //Assets.getText(`NewCourses/algo/${f.filename}`);
                }

                const slidese = getNotes(fe);
                const slidesc = getNotes(fc);

                // for each slide and each note in en, if not found in ch slide, report
                for (let i=0; i<slidese.length; i++) {
                    const se = slidese[i];
                    const sc = slidesc[i];
                    if (se.length != sc.length) {
                        console.log((i+1) + " note line count different ");
                        console.log(se);
                        console.log(sc);
                        console.log("\n\n");
                    } else {
                        for (let j=0; j<se.length; j++) {
                            const e1 = se[j];
                            const c1 = sc[j];
                            if (e1.includes("#ID")) {
                                const linese1 = e1.replace("//", "").split("||");
                                const linesc1 = c1.replace("//", "").split("||");
                                if (linese1[0] != linesc1[0]) {
                                    console.log((i+1) + " ID different ");
                                    console.log(se);
                                    console.log(sc);
                                    console.log("\n\n");
                                    break;
                                }
                            }
                        }
                    }
                }

                process.exit(0);


          }
        });
    });
};

docompare("school_a_lesson_49");