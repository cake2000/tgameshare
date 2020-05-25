import { Games, Scenarios, UserChat, UserCodeTesting } from '../../../lib/collections';
import { LEVELS, OPPONENTS, TUTORIAL_GROUP, MIGRATION_CONST } from '../../../lib/enum';

const tankGameId = MIGRATION_CONST.tankGameId;
const htmlparser = require('htmlparser2');
const fs = require('fs');


var gameLessonScenarioData = [];
var lessonNumber = 1;


// lesson 1
var lessonObj = {
  userId: 'system',
  visibleUserIds: [],
  package: 'starter',
  coins: 500,
  concepts: 'Functions, Tank Commands, Randomness',  
  ScenarioName: 'A Random Shooter',
  lessonName: 'ARandomlyShootingTank',
  ScenarioSequenceNumber: lessonNumber,
  SetupScript: `
RemoveAllTanks();
PlaceTile('R', 5, 2);
PlaceTank('blue', 5, 5);
//PlaceTank('red', 7, 5);
PlaceTank('white', 10, 5);
//CalculateCommand();
//await WaitForAllShellsToExplode();
//ReportEndOfTest();

await SetupTickUpdates(180);

ReportEndOfTest();
`,
  Difficulty: 2,
  locked: true,
  gameId: tankGameId,
  gameName: 'SmartTank',
  hideReleaseButton: false,
  applyBaselineCode: true,
  group: TUTORIAL_GROUP.BEGINNER.YOUR_FIRST_GAME_BOT
};
lessonObj.baselineCode =
`
function getNewCommand() {
  return "S"; 
}
`;
gameLessonScenarioData.push(lessonObj);





var parseLessonHTML = function (lessonName, gameName) {
  var data = Assets.getText(`TutorialLessons/${gameName}/${lessonName}.html`);
  //var data = fs.readFileSync(`TutorialLessons/${gameName}/${lessonName}.html`);
  // console.log("data is " + data);

  var json = [];
  var currentElement = {};

  var parser = new htmlparser.Parser({
    onopentag(name, attribs) {
      if (name === 'element') {
        currentElement = {
          elementId: attribs.elementid,
          codeType: attribs.codetype ? attribs.codetype : '',
          elementType: attribs.elementtype ? attribs.elementtype : '', // lower case only!!
          answerKey: attribs.answerkey ? attribs.answerkey : '',
          answerReason: attribs.answerreason ? attribs.answerreason : '',
          html: '',
          codeHidden: true,
          // hints: {},
          condition: attribs.condition ? attribs.condition : '',
          conditionInd: attribs.conditionind ? attribs.conditionind : '',
          optional: attribs.optional ? attribs.optional : 'False',
          showCondition: attribs.showcondition ? attribs.showcondition : '',
          languageSkills: attribs.languageskills ? attribs.languageskills : '',
          // codecondition: attribs.codecondition ? attribs.codecondition : '',
        };
        // console.log("\n\n\n\ncurrent element " + JSON.stringify(currentElement));
      } else {
        currentElement.html += `<${name} `;
        Object.keys(attribs).forEach((field) => {
          currentElement.html += `${field} = "${attribs[field]}"`;
        });
        currentElement.html += '>';
      }
    },
    ontext(text) {
      currentElement.html += text;
    },
    onclosetag(name) {
      if (name === 'element') {
        // seperate html vs code
        var allhtmllines = currentElement.html.split("\n");
        var html = "";
        var code = "";
        var cleancode = "";
        var inCode = false;
        var inCleanCode = false;
        for (var i=0; i<allhtmllines.length; i++) {
          var line = allhtmllines[i];
          // console.log("reviewing line " + line);
          if (!inCode) {
            if (inCleanCode) {

            } else {
              if (line.indexOf("<code") >= 0) {
                // console.log("found code block");
                inCode = true;
              }
              if (line.indexOf("<cleancode") >= 0) {
                // console.log("found clean code block");
                inCleanCode = true;
              }
            }
          }

          if (inCode) {
            if (line.indexOf("<code") >= 0) {
              if (line.indexOf("false") >= 0) {
                currentElement.codeHidden = false;
              } else {
                currentElement.codeHidden = true;
              }
              // console.log("set codeHidden " + currentElement.codeHidden);
            } else if (line.indexOf("</code>") >= 0) {
              // do nothing
              // console.log("end code block");
              inCode = false;
            } else {
              code += `${line} \n`;
            }
          } else if (inCleanCode) {
            if (line.indexOf("<cleancode") >= 0) {
            } else if (line.indexOf("</cleancode>") >= 0) {
              // console.log("end clean code block");
              inCleanCode = false;
            } else {
              // console.log("add to clean code: " + line);
              cleancode += `${line} \n`;
            }
          } else {
            html += `${line} \n`;
          }
        }
        currentElement.html = html;
        currentElement.code = code;
        currentElement.cleancode = cleancode;
        json.push(currentElement);
      } else if (name.indexOf('condition') >= 0) {
                // skip
      } else {
        currentElement.html += `</${name}>`;
      }
    }
  }, {
    decodeEntities: true
  });
  parser.write(data);
  parser.end();

  // console.log("json is " + JSON.stringify(json));
  return json;
};




const removeLessonScenarios = () => {
  // if (UserChat.find().count() > 0) {
  //   UserChat.remove({});
  // }
}

const prepareLessonScenarios = () => {

  // if (UserChat.find().count() > 0) {
  //   UserChat.remove({});
  // }
  // if (UserCodeTesting.find().count() > 0) {
  //   UserCodeTesting.remove({});
  // }
  // return;
  if (Scenarios.find({gameId: tankGameId}).count() > 0) {
    Scenarios.remove({gameId: tankGameId});
  }

  let id = 1;
  _.map(gameLessonScenarioData, (doc) => {
        // add elements as parsed from the lesson html to the doc first
    doc.instructionElements = parseLessonHTML(doc.lessonName, doc.gameName);
    // const newdoc = JSON.parse(JSON.stringify(doc));
    doc._id = `T${id ++}`;
    console.log("inserting newdoc " + doc._id + " " + doc.ScenarioSequenceNumber);
    const readonlyLineNumbers = [];
    if (doc.applyBaselineCode) {
      const p = doc.baselineCode.split("\n");
      let newBaseline = "";
      for (let i=0; i<p.length; i++) {
        newBaseline += `${p[i].replace("---", "")}\n`;
        continue;
        // if (!p[i].trim().endsWith("---")) {
        //   readonlyLineNumbers.push(i);
        //   newBaseline += `${p[i]}                                                                        ////READONLY\n`;
        // } else {
        //   newBaseline += `${p[i].replace("---", "")}\n`;
        // }
      }
      doc.baselineCode = newBaseline;
    }
    doc.readonlyLinenumbers = readonlyLineNumbers;
    Scenarios.insert(doc);
  });
};


export default prepareLessonScenarios;
// export removeLessonScenarios;