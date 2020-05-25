import { Games, TBotQA, UserChat, UserCodeTesting } from '../../../lib/collections';
import { LEVELS, OPPONENTS, TUTORIAL_GROUP } from '../../../lib/enum';

const htmlparser = require('htmlparser2');
const fs = require('fs');
// global.Buffer = global.Buffer || require("buffer").Buffer;
// const ObjectID = require('mongodb').ObjectID;


const readAllQAs = function(qa, qaType) {
  const filename = `BotQA/${qaType}.html`;
  const data = Assets.getText(filename);
  // fs.readFile(filename, 'utf8', function(err, data) {
    // if (err) throw err;
    // console.log('OK: ' + filename);

    const json = [];
    let currentQA = {};

    const parser = new htmlparser.Parser({
        onopentag: function(name, attribs) {
            if (name === "qa") {
              currentQA = {
                  html:"",
                  qtype: "",
                  key: ""
              };
            } else if (name == "question") {
                currentQA.qtype = attribs.t;
                currentQA.key = attribs.key;
            } else {
                currentQA.html += `<${name} `;
                Object.keys(attribs).forEach((field) => {
                    currentQA.html += `${field} = "${attribs[field]}"`;
                });
                currentQA.html += ">";
            }
        },
        ontext: function(text) {
            currentQA.html += text;
        },
        onclosetag: function(name) {
          // console.log("onclosing " + name);
          if (name == "question") return;
            if (name === "qa") {
                json.push(currentQA);
            } else {
                currentQA.html += `</${name}>`;
            }
        }
    }, {
        decodeEntities: true
    });
    parser.write(data);
    parser.end();

    // console.log(" json is " + JSON.stringify(json));


    for (let i=0; i < json.length; i++) {
      const oneqa = json[i];
      //allQAs.keyToAnswer[qa.key] = `<p><b>What is ${qa.key}?</b></p>\n${qa.html}`;
      // console.log("qa is " + JSON.stringify(qa));
      // allQAs.keyToAnswer[qa.key] = qa.html;
      // var OID = new ObjectID();
      // console.log("OID is " + JSON.stringify(OID));
      // console.log("OID str is " + OID);
      const doc = {
        _id: "" + Math.random(),
        category: qaType,
        key: oneqa.key,
        answer: oneqa.html        
      };
      console.log("insert " + qaType + " " + oneqa.key);
      qa.insert(doc);
    }
  // });
};


const prepareQAs = () => {

// MongoClient.connect(url, function(err, db) {
  // console.log("db is " + db);
  // var qa = db.collection('TBotQA');

  

  TBotQA.remove({});
  

  readAllQAs(TBotQA, "JavascriptQA");
  readAllQAs(TBotQA, "PathPoolQA");
  readAllQAs(TBotQA, "PathPoolRobotCodeQA");
  // readAllQAs(qa, "DodgeBallRobotCodeQA");
  readAllQAs(TBotQA, "TGameWebAppQA");
  readAllQAs(TBotQA, "CommonErrorsQA");


};


export default prepareQAs;
