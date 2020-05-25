import { Games, Scenarios } from '../../../lib/collections';
import { LEVELS, OPPONENTS, MIGRATION_CONST } from '../../../lib/enum';

const poolGameId = MIGRATION_CONST.poolGameId;
const htmlparser = require("htmlparser2");
const fs = require('fs');

const parseLessonHTML = function parseLessonHTML(lessonnumber) {
    // const data = fs.readFileSync(`./TutorialLessons/lesson${lessonnumber}.html`, 'utf8');
    //const data = fs.readFileSync("./lesson1.html",'utf8');
    const data = Assets.getText(`TutorialLessons/lesson${lessonnumber}.html`);

    const json = [];
    let currentElement = {};

    const parser = new htmlparser.Parser({
        onopentag: function(name, attribs) {
            if (name === "element") {
                // console.log("found new element " + JSON.stringify(attribs));
                currentElement = {
                    elementId: attribs.elementid,
                    codeType: attribs.codetype ? attribs.codetype : "",
                    elementType: attribs.elementtype ? attribs.elementtype : "", // lower case only!!
                    answerKey: attribs.answerkey ? attribs.answerkey : "",
                    html: "",
                    condition: attribs.condition ? attribs.condition : "",
                    codecondition: attribs.codecondition ? attribs.codecondition : "",
                };
            // } else if (name.indexOf("condition") >= 0) {
            //     currentElement.conditions.push(name);
            } else {
                currentElement.html += `<${name} `;
                Object.keys(attribs).forEach((field) => {
                    currentElement.html += `${field} = "${attribs[field]}"`;
                });
                currentElement.html += ">";
            }
        },
        ontext: function(text) {
            currentElement.html += text;
        },
        onclosetag: function(name) {
            if (name === "element") {
                console.log("on closing element " + JSON.stringify(currentElement));
                json.push(currentElement);
            } else if (name.indexOf("condition") >= 0) {
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

    //console.log(" json is " + JSON.stringify(json));
    // for (let i=0; i < json.length; i++) {
        // console.log("element " + i + ": " + json[i].elementId);
        // console.log("element " + i + ": " + json[i].html);
    // }

    return json;
};

const gameLessonScenarioData = [
  {
    _id: '583b53e2e9026608852dd03c',
    userId: 'system',
    visibleUserIds: [],
    package: 'starter',
    ScenarioName: 'The Break Shot',
    ScenarioSequenceNumber: 1,
    SetupScript: 'TakeBreakShot();',
    Difficulty: 1,
    locked: true,
    gameId: poolGameId,
    instructionElements: ['a', 'b']
  },
  {
    _id: '583b53e2e9026608852dd03d',
    userId: 'system',
    package: 'starter',
    ScenarioName: 'The Call Shot: Down Goes the Black Ball',
    ScenarioSequenceNumber: 2,
    SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -200, -50);\r\nPlaceBallOnTable(1, 0, 100); \r\nTakeCallShot();',
    Difficulty: 2,
    gameId: poolGameId,
  },
  {
    _id: '583b53e2e9026608852dd03e',
    userId: 'system',
    package: 'starter',
    ScenarioName: 'The Call Shot: Dynamic Ball Position Using 2D Vectors',
    ScenarioSequenceNumber: 3,
    SetupScript: 'ResetTable(true); \r\nPlaceBallOnTable(0, -300, -50);\r\nPlaceBallOnTable(1, -120, 100); \r\nTakeCallShot();',
    Difficulty: 3,
    gameId: poolGameId,
  },
  {
    _id: '583b53e2e9026608852dd03f',
    userId: 'system',
    package: 'starter',
    ScenarioName: 'The Call Shot: Selecting Target by Pocketing Probability',
    ScenarioSequenceNumber: 4,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0.25, 0.2);\r\nPlaceBallOnTable(2, 0.15, -0.3); \r\nPlaceBallOnTable(3, -0.25, -0.1); \r\nPlaceBallOnTable(6, 0.4, -0.35); \r\nChooseRedColor(); \r\nTakeCallShot();\r\n',
    Difficulty: 4,
    gameId: poolGameId,
  },

  // need to insert one: determining break shot based on game difficulty level!

  {
    _id: '583b53e2e9026608852dd041',
    userId: 'system',
    package: 'advanced',
    ScenarioName: 'Placing Cue Ball ("Ball in Hand")',
    ScenarioSequenceNumber: 5,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    Difficulty: 3,
    gameId: poolGameId,
  },
  {
    _id: '583b53e2e9026608852dd040',
    userId: 'system',
    package: 'advanced',
    ScenarioName: 'The Call Shot: Avoiding Pocketing Cue Ball or Black Ball',
    ScenarioSequenceNumber: 6,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(0, 0, 0.2);\r\nPlaceBallOnTable(2, 0, 0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nChooseRedColor(); \r\nTakeCallShot();',
    Difficulty: 2,
    gameId: poolGameId,
  },
  {
    _id: '583b53e2e9026608852dd042',
    userId: 'system',
    package: 'advanced',
    ScenarioName: 'Hitting My Balls First',
    ScenarioSequenceNumber: 7,
    SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
    Difficulty: 2,
    gameId: poolGameId,
  },
//   {
//     _id: '583b53e2e9026608852dd043',
//     userId: 'system',
//     package: 'professional',
//     ScenarioName: 'Rebounding Shots',
//     ScenarioSequenceNumber: 8,
//     SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
//     Difficulty: 3,
//     gameId: poolGameId,
//   },
//   {
//     _id: '583b53e2e9026608852dd044',
//     userId: 'system',
//     package: 'professional',
//     ScenarioName: 'Increasing Pocketing Probability',
//     ScenarioSequenceNumber: 9,
//     SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
//     Difficulty: 5,
//     gameId: poolGameId,
//   },
//   {
//     _id: '583b53e2e9026608852dd045',
//     userId: 'system',
//     package: 'professional',
//     ScenarioName: 'Optimize for Next 2 Shots',
//     ScenarioSequenceNumber: 10,
//     SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
//     Difficulty: 3,
//     gameId: poolGameId,
//   },  
//   {
//     _id: '583b53e2e9026608852dd046',
//     userId: 'system',
//     package: 'professional',
//     ScenarioName: 'Safty Shot',
//     ScenarioSequenceNumber: 11,
//     SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
//     Difficulty: 3,
//     gameId: poolGameId,
//   },  
//   {
//     _id: '583b53e2e9026608852dd047',
//     userId: 'system',
//     package: 'professional',
//     ScenarioName: 'Creating Your Own Test Case Setup',
//     ScenarioSequenceNumber: 11,
//     SetupScript: 'ResetTable(true);\r\nPlaceBallOnTable(2, 0.2, -0.1); \r\nPlaceBallOnTable(3, 0.3, -0.3); \r\nPlaceBallOnTable(6, -0.2, 0.4); \r\nChooseRedColor(); \r\nPlaceCueBallFromHand();',
//     Difficulty: 3,
//     gameId: poolGameId,
//   },  
];


const prepareLessonScenarios = () => {
    if (Scenarios.find().count() > 0) {
        Scenarios.remove({});
    }

    _.map(gameLessonScenarioData, (doc) => {
        // add elements as parsed from the lesson html to the doc first
        doc.instructionElements = parseLessonHTML(doc.ScenarioSequenceNumber);
        Scenarios.insert(doc);
    });
};


export default prepareLessonScenarios;
