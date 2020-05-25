
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
import { Number } from 'es6-shim';
import _ from 'lodash';
import { UserChat, UserLesson, Lessons, TBotQA, Scenarios, UserScenarios, UserRobotCodeByLesson, UserRobotCode, TBotIssue, Languages, SlideContent } from '../../lib/collections';
import { USER_TYPES } from '../../lib/enum';
import { calcNewCodeBase, getCodeBlocks } from '../../lib/util';

const acorn = require("acorn");
const dialogflow = require('dialogflow');

const dmp = DiffMatchPatch.DiffMatchPatch;

const getPatch = function(oldv, newv) {
  // console.log("\n\n\n get patch\n");
  // console.log("old is " + oldv);
  // console.log("new is " + newv);

  const diff = dmp.diff_main(oldv, newv, true);

  if (diff.length > 2) {
    dmp.diff_cleanupSemantic(diff);
  }
  const patchList = dmp.patch_make(oldv, newv, diff);
  const patchText = dmp.patch_toText(patchList);

  return patchText;
};

const htmlparser = require("htmlparser2");

const readAllQAs = function(qaType) {
  const data = Assets.getText(`BotQA/${qaType}.html`);
  const json = [];
  let currentQA = {};

  const parser = new htmlparser.Parser({
    onopentag: (name, attribs) => {
      if (name === "qa") {
        currentQA = {
          html: "",
          qtype: "",
          key: ""
        };
      } else if (name === "question") {
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
    ontext: (text) => {
      currentQA.html += text;
    },
    onclosetag: (name) => {
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
  const allQAs = {
    questionToKey: {},
    keyToAnswer: {}
  };

  for (let i = 0; i < json.length; i++) {
    const qa = json[i];
    allQAs.keyToAnswer[qa.key] = qa.html;
  }

  return allQAs;
};

const stopwords = ["what", "is", "a", "how", "do", "you", "define", "explain", "use", "write", "create", "does"];
const getVector = function (wordlist, q) {
  const v = [];
  for (let i = 0; i < wordlist.length; i++) {
    if (q.indexOf(wordlist[i]) >= 0) {
      if (stopwords.indexOf(wordlist[i]) > 0) v.push(1);
      else v.push(5);
    } else v.push(0);
  }
  return v;
};
// statistic distance

const calculateScore = function(q1, q2) {
  const words = {};
  // console.log("calculateScore for " + q1 + " " + q2);
  const parts1 = q1.trim().toLowerCase().split(" ");
  const parts2 = q2.trim().toLowerCase().split(" ");
  if (parts1.length === 0 || parts2.length === 0) return -1; // empty string

  for (let i = 0; i < parts1.length; i++) {
    words[parts1[i]] = 1;
  }
  for (let i = 0; i < parts2.length; i++) {
    words[parts2[i]] = 1;
  }
  const wordlist = Object.keys(words);
  const vector1 = getVector(wordlist, q1.toLowerCase());
  const vector2 = getVector(wordlist, q2.toLowerCase());
  let size1 = 0; let size2 = 0; let sum = 0;
  for (let i = 0; i < wordlist.length; i++) {
    sum += vector1[i] * vector2[i];
    size1 += vector1[i]; size2 += vector2[i];
  }
  const score = sum / (size1 * size2);
  return score;
};

const queryQADB = (qaType, key) => {
  console.log("TBotQA " + qaType + " " + key);
  const ans = TBotQA.findOne({
    category: qaType, key
  });
  if (ans && ans.answer) {
    return ans.answer;
  } else {
    return "<div>Sorry I don't know the answer to that question...</div>."
  }
};

const TbotFunc = function() {
  this.getAnswerForJavascriptObject = (userKey) => {
    // return qaAll.JavascriptQA.keyToAnswer[userKey];
    const answer = queryQADB("JavascriptQA", userKey);
    return answer;
  };
  this.getAnswerForPathPoolObject = (userKey) => {
    // return qaAll.PathPoolQA.keyToAnswer[userKey];
    const answer = queryQADB("PathPoolQA", userKey);
    return answer;
  };
  this.getAnswerForPathPoolRobotCode = (userKey) => {
    // return qaAll.PathPoolRobotCode.keyToAnswer[userKey];
    const answer = queryQADB("PathPoolRobotCodeQA", userKey);
    return answer;
  };
  this.getAnswerForDodgeBallRobotCode = (userKey) => {
    // return qaAll.DodgeBallRobotCode.keyToAnswer[userKey];
    const answer = queryQADB("DodgeBallRobotCodeQA", userKey);
    return answer;
  };

  this.getAnswerForTGameWebApp = (userKey) => {
    // return qaAll.TGameWebApp.keyToAnswer[userKey];
    const answer = queryQADB("TGameWebApp", userKey);
    return answer;
  };
  this.getAnswerForCommonErrorsFAQs = (userKey) => {
    // return qaAll.TGameWebApp.keyToAnswer[userKey];
    const answer = queryQADB("CommonErrorsQA", userKey.toLowerCase());
    return answer;
  };
};

const tbot = new TbotFunc();

const updateUserScratchPreference = (ok) => {
  console.log("updateUserScratchPreference set to " + ok + " for " + Meteor.userId());
  Meteor.users.update({
    _id: Meteor.userId()
  }, { $set: { 'OKWithScratch': ok } });
};

const updateUserJSLevel = (level) => {
  Meteor.users.update({
    _id: Meteor.userId()
  }, { $set: { JSLevel: level } });
};

const addUserSkills = (skills) => {
  if (!skills || skills.length === 0) return;
  const user = Meteor.users.findOne({ _id: Meteor.userId() });
  const languageName = user.defaultLanguage || 'JavaScript';
  const userObj = Meteor.users.findOne({ _id: Meteor.userId() });
  if (!("languages" in userObj) || !userObj.languages) userObj.languages = [];
  const filtered = userObj.languages.filter(l => l.name === languageName);
  if (filtered && filtered.length > 0) {

    const lans = userObj.languages;
    for (let i=0; i<lans.length; i++) {
      const langObj = lans[i];
      if (!("skills" in langObj)) langObj.skills = [];
      const skillset = new Set(langObj.skills);
      const orig = langObj.skills.length;
      skills.forEach((s) => { if (!skillset.has(s)) langObj.skills.push(s); });
    }

    console.log(`update skills info ${JSON.stringify(lans)}`);
    Meteor.users.update({
      _id: Meteor.userId()
    }, {
      $set: { languages: lans }
    });

    return;

    const langObj = filtered[0];
    if (!("skills" in langObj)) langObj.skills = [];
    const skillset = new Set(langObj.skills);
    const orig = langObj.skills.length;
    skills.forEach((s) => { if (!skillset.has(s)) langObj.skills.push(s); });
    // if no new skills added, return
    if (orig === langObj.skills.length) return;
    console.log(`add new skills info ${JSON.stringify(langObj)}`);
    Meteor.users.update({
      _id: Meteor.userId(),
      'languages.name': languageName
    }, {
      $set: { 'languages.$.skills': langObj.skills }
    });
  } else {
    // console.log(`before bind ${JSON.stringify(skills)}`);
    const userObj2 = Meteor.users.findOne({ _id: Meteor.userId() });
    // setTimeout(Meteor.bindEnvironment(()=> {
      // console.log("userObj2 " + JSON.stringify(userObj2));
      const newObj = { name: languageName, level: '', skills , assessments: []};
      const lans = userObj2.languages || [];
      // console.log(`lans info ${JSON.stringify(lans)}`);
      lans.push(newObj);
      // console.log(`insert new language info ${JSON.stringify(lans)}`);
      Meteor.users.update({
        _id: Meteor.userId()
      //}, { $addToSet: { languages: newObj } });
      }, { $set: { languages: lans } });
      // console.log(`insert new language info done ${JSON.stringify(newObj)}`);
  
    // }, 3000));
  }
};

const accountupdateProgress = function(tutorialId, progress, gameId, ScenarioSequenceNumber) {
  const user = Meteor.users.findOne({ _id: Meteor.userId() });

  const scenario = Scenarios.findOne({
    userId: "system", ScenarioSequenceNumber
  });

  const userObj = Meteor.users.findOne({ _id: Meteor.userId() });
  if (userObj && userObj.tutorial && userObj.tutorial.length > 0) {
    
    let tutorial = userObj.tutorial;
    let newCoin = -1;
    let updatedTutorial = false;

    for (let k=0; k<tutorial.length; k++ ) {
      if (tutorial[k].id == tutorialId) {
        tu = tutorial[k];
        tu.progress = progress;
        updatedTutorial = true;
        if (!tu.coinsPaid) {
          if (Math.round(progress * 100) >= 100) {
            // console.log("pay coins with progress at " + progress + " coins " + scenario.coins);
            // options = Object.assign(options, {
            //   'profile.coins': user.profile.coins + scenario.coins,
            //   'tutorial.$.coinsPaid': true
            // });

            Meteor.users.update({
              _id: Meteor.userId(),
            }, { $set: {'profile.coins': user.profile.coins + scenario.coins} });
            tu.coinsPaid = true;
          }
        }
      }
    }
    if (updatedTutorial) {
      Meteor.users.update({
        _id: Meteor.userId(),
      }, { $set: {tutorial} });
      return;
    }

  } 

  const tutorial = {
    id: tutorialId,
    unlocked: true, // need this?
    progress,
    gameId,
    ScenarioSequenceNumber
  };
  Meteor.users.update({
    _id: Meteor.userId()
  }, { $addToSet: { tutorial } });
};




const unlockNextTutorial = function(scenario) {
  console.log("unlocking next scenario");

  const nextScenario = Scenarios.findOne({
    userId: "system", gameId: scenario.gameId, ScenarioSequenceNumber: scenario.ScenarioSequenceNumber + 1
  });

  if (typeof nextScenario === "undefined") {
    console.log("no more scenarios");
    return;
  }

  if (Meteor.users.findOne({ _id: Meteor.userId(), 'tutorial.id': nextScenario._id })) {
    // console.log("found next " + nextScenario._id);
    const tutorial = _.get(Meteor.users.findOne({ _id: Meteor.userId()}), 'tutorial');
    for (let k = 0; k < tutorial.length; k++) {
      if (tutorial[k].id === nextScenario._id) {
        tutorial[k].unlocked = true;
        break;
      }
    }
    Meteor.users.update({
      _id: Meteor.userId(),
      // 'tutorial.id': nextScenario._id
    }, { $set: { tutorial } });
  } else {
    console.log("next not found");
    const tutorial = {
      id: nextScenario._id,
      progress: 0,
      unlocked: true,
      gameId: scenario.gameId,
      ScenarioSequenceNumber: scenario.ScenarioSequenceNumber + 1
    };
    Meteor.users.update({
      _id: Meteor.userId()
    }, { $addToSet: { tutorial } });
  }
};

const markChatProgress = function (chat, scenario) {
  let totalcnt = 0;
  let donecnt = 0;
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT") {
      if (c.condition !== "" && c.elementType != "Quiz") {
        if (c.conditionDone) {
          //console.log(`done: ${c.actionContent}`);
          donecnt++;
        }
      }
    }
  }

  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    if (typeof(e.condition) !== "undefined" && e.condition !== "") {
      totalcnt++;
    }
  }

  // console.log("donecnt " + donecnt + " " + totalcnt);
  if (donecnt === totalcnt && (donecnt > 0 || totalcnt === 0)) {
    // console.log("unlock donecnt " + donecnt + " " + totalcnt);
    unlockNextTutorial(scenario);
  }

  console.log(`accountupdateProgress ${donecnt} / ${totalcnt}`);
  const prog = (totalcnt === 0) ? 1 : (donecnt / totalcnt);
  accountupdateProgress(scenario._id, prog, scenario.gameId, scenario.ScenarioSequenceNumber);
};

const markLastElementDone = function (cc, ele, scenario) {
  // let lastElementId = "";
  // let oneChatId = "";
  // UserChat.update(
  //   { _id: chat._id, "chats._id": oneChatId, "chats.actionContent": lastElementId },
  //   { $set: { "chats.$.conditionDone": true } }
  // );

  setTimeout(Meteor.bindEnvironment(()=> {
    let chat = UserChat.findOne({_id: cc._id});
    for (let i = chat.chats.length - 1; i >= 0; i--) {
      const c = chat.chats[i];
      if (c.actionType === "REVEAL_ELEMENT" && c.actionContent === ele.elementId) {
        // lastElementId = c.actionContent;
        // if (c.condition !== "") {
        // oneChatId = c._id;
        c.conditionDone = true;
        // }
        break;
      }
    }
  
    UserChat.update(
      { _id: cc._id },
      { $set: { chats: chat.chats } }
    );
    // console.log("do markChatProgress delayed");
    chat = UserChat.findOne({_id: cc._id});
    markChatProgress(chat, scenario);

  }), 3000);
  
};


const removeEmptyLines = (c) => {
  const lines = c.trim().split("\n");
  const nonEmptyLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line !== "") {
      nonEmptyLines.push(line);
    }
  }
  return nonEmptyLines.join("\n");
};

const getLatestQuizAnswerReason = (chat, scenario) => {
  let lastElementId = "";
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT" && c.elementType === "Quiz") {
      lastElementId = c.actionContent;
      break;
    }
  }

  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    if (e.elementId === lastElementId) {
      // console.log("reason: found element " + JSON.stringify(e));
      return e.answerReason;
    }
  }
  return "";
};


const getLatestQuizAnswer = (chat, scenario) => {
  let lastElementId = "";
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT" && c.elementType === "Quiz") {
      lastElementId = c.actionContent;
      break;
    }
  }

  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    if (e.elementId === lastElementId) {
      return e.answerKey;
    }
  }
  return "";
};


const getLatestElement = (chat, scenario) => {
  let lastElementId = "";
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT") {
      lastElementId = c.actionContent;
      break;
    }
  }

  if (!scenario.instructionElements) {
    return {};
  }
  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    if (e.elementId === lastElementId) {
      return e;
    }
  }

  return {};
};

const chatAnswer = (chat, answer, scenarioId = '', isIssue = false, userText = "") => {
  const time = new Date();
  // console.log("in chat answer " + isIssue);
  if (isIssue) {
    // console.log("all chats " + JSON.stringify(chat.chats));

    // // console.log("insert new issue " + userText);
    // TBotIssue.insert({
    //   chatId: chat._id,
    //   userId: Meteor.userId(),
    //   username: Meteor.user().username,
    //   scenarioId,
    //   time,
    //   lastUserText: userText,
    //   status: "new"
    // });
  }
  UserChat.update({ _id: chat._id },
    { $push:
    {
      chats: {
        createdAt: time,
        actionType: "TBOT_ANSWER",
        actionContent: answer
      }
    }
    }
  );
};

const setHintSubDisplayed = (chat, elementId, hid) => {
  const newlist = `${chat.subDislayList} ${elementId}_${hid} `;
  UserChat.update({ _id: chat._id },
    { $set: {
      subDislayList: newlist,
      lastHintDisplayTime: Date.now()
      }
    }
  );
};


const displayOneHint = (hint, chat, elementId) => {
  console.log(`\n\n in displayOneHint ${JSON.stringify(hint)}`);
  if (hint.sub) {
    const subDisplayed = ` ${chat.subDislayList} `.indexOf(` ${elementId}_${hint.hid} `) >= 0;
    if (!subDisplayed || hint.choice.length === 0) {
      // just display sub
      let answer = `${hint.choice.length === 0 ? "Final" : "Additional"} hint for <b class="reallyhighlight">${hint.hid}</b>: <span class="hintcontent">${hint.sub}</b>.`;
      if (hint.choice.length > 0) {
        answer += ` <br/><br/>More hints on this line is available as well (type or click <b class="reallyhighlight" ><a style="color: blue" href="#" onclick="ClickToSendChat(event, '${hint.hid}')" class="inlinebutton">${hint.hid}</a></b> again)`;
      }
      chatAnswer(chat, answer);
      setHintSubDisplayed(chat, elementId, hint.hid);
      // updateHintDisplayTime(chat, elementId);
      return;
    } else {
      // already displayed sub hint, now display choices
      if (hint.choice.length > 0) {
        let choicetext = `Final hint for <b class="reallyhighlight">${hint.hid}</b>: one of the following lines would work (you need to find out which one is correct:)<br/>`;
        choicetext += '<ul>';
        for (let j = 0; j < hint.choice.length; j++) {
          choicetext += `<li  class="hintcontent">${hint.choice[j]}</li>`;
        }
        choicetext += '</ul>';
        chatAnswer(chat, choicetext);
        return;
      }
    }
  } else if (hint.choice.length > 0) {
    let choicetext = `Final hint for <b>${hint.hid}</b>: one of the following lines would work (you need to find out which one is correct:)<br/>`;
    choicetext += '<ul>';
    for (let j = 0; j < hint.choice.length; j++) {
      choicetext += `<li>${hint.choice[j]}</li>`;
    }
    choicetext += '</ul>';
    chatAnswer(chat, choicetext);
    return;
  }
  // no more hints
  if (Math.random() > 0.5) {
    chatAnswer(chat, "Sorry I've given you all the hints I can.");
  } else {
    chatAnswer(chat, "Sorry no more hints are available about it.");
  }
};

// if last element is done, then show next, otherwise reshow last!
const revealNextTutorialElement = (chat, scenario, waittime, overwriteLastDone) => {





  let nextId = 0;

  let lastElementId = "";
  let lastCondition = "";
  let lastConditionDone = false;
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT" && c.elementType !== "Hint") {
      lastElementId = c.actionContent;
      lastCondition = c.condition;
      lastConditionDone = c.conditionDone;
      break;
    }
  }

  if (overwriteLastDone) lastConditionDone = overwriteLastDone;

  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    // console.log(`comparing lastElementId ${lastElementId} with ${e.elementId}`);
    if (e.elementId == lastElementId) {

      // if ( true ) {
      //   // aaaa proofreading so get all
      //   for (let k=j+1; k<scenario.instructionElements.length; k++) {
      //     const f = scenario.instructionElements[k];
      //     if (f.elementType != "Hint") {
      //       if (f.optional === "True") {
      //         if (!(f.showCondition === "PreNonZeroFailures" && chat.testFailureCurrentElementCount > 0)) continue;
      //       }
      //       nextId = k;
      //       break;
      //     }
      //   }
      //   UserChat.update({ _id: chat._id },
      //     { $push:
      //       {
      //         chats: {
      //           createdAt: new Date(),
      //           actionType: "REVEAL_ELEMENT",
      //           actionContent: scenario.instructionElements[nextId].elementId,
      //           elementType: scenario.instructionElements[nextId].elementType,
      //           condition: scenario.instructionElements[nextId].condition ? scenario.instructionElements[nextId].condition : "",
      //           conditionDone: false
      //         }
      //       }
      //     }
      //   );
      //   return;
      // }



      // check if this element is done!


      if (( (e.elementType == "Coding" || e.elementType == "Quiz") &&  !lastConditionDone) ) { // replay unfinished element
        // nextId = j;
        // console.log(`condition is false so resume nextId is ${nextId}`);
        if (e.elementType === "Coding") {
          chatAnswer(chat, "Please complete the current challenge and click the <img src='/images/testbutton.png' style='width: 40px; height: auto; vertical-align: bottom;'/> button.");
        } else {
          chatAnswer(chat, "Please complete the current quiz. You can click or type the choice letter.");
        }
        return;
      } else {
      // if (typeof(e.condition) == "undefined" || e.condition == "" || lastConditionDone) {
        // find next non hint element

        if (j === scenario.instructionElements.length - 1) {
          chatAnswer(chat, `This tutorial has concluded.`);
          return;
        }


        for (let k = j+1; k < scenario.instructionElements.length; k++) {
          const f = scenario.instructionElements[k];
          if (f.elementType !== "Hint") {
            if (f.optional === "True") {
              if (!(f.showCondition === "PreNonZeroFailures" && chat.testFailureCurrentElementCount > 0)) continue;
            }
            nextId = k;
            break;
          }
        }
        // console.log(`condition is true and nextId is ${nextId}`);
        // chatAnswer(chat, `OK let's continue.`);

        // reset failure count
        UserChat.update({ _id: chat._id }, { $set: { testFailureCurrentElementCount: 0 } });
      }
      break;
    } else if (e.elementId > lastElementId) {
      nextId = j;
      // reset failure count
      UserChat.update({ _id: chat._id }, { $set: { testFailureCurrentElementCount: 0 } });
      break;
    }
  }

  const responsewait = waittime ? waittime : 300;

  Meteor.setTimeout(() => {
    UserChat.update({ _id: chat._id },
      { $push:
      {
        chats: {
          createdAt: new Date(),
          actionType: "REVEAL_ELEMENT",
          actionContent: scenario.instructionElements[nextId].elementId,
          elementType: scenario.instructionElements[nextId].elementType,
          condition: scenario.instructionElements[nextId].condition ? scenario.instructionElements[nextId].condition : "",
          conditionDone: false
        }
      }
      }
    );
  }, responsewait);

  if (scenario.instructionElements[nextId].elementType === "Conclusion") {
    markChatProgress(chat, scenario);
  }

  if (scenario.instructionElements[nextId].elementType === "SkillLearned") {
    const skills = (scenario.instructionElements[nextId].skill || '').split('|');
    addUserSkills(skills);
  }
};

const revealCleanCodeForLastTest = (chat, scenario) => {
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    // console.log(`checking chat ${i} ${c.actionType} ${c.elementType} ${c.conditionDone}`);
    if (c.actionType !== "REVEAL_ELEMENT" ||
    c.actionType === "REVEAL_ELEMENT" && c.elementType === "Coding" && !c.conditionDone) {
      continue;
    }
    const elementId = c.actionContent;
    let lastJ = -1;

    for (let j = scenario.instructionElements.length - 1; j >= 0; j--) {
      const e = scenario.instructionElements[j];
      if ((e.elementType === 'Coding' || e.elementType === 'InitialCode') && e.elementId <= elementId && e.cleancode && e.cleancode.trim() !== '') {
        lastJ = j;
        break;
      }
    }
    if (lastJ > -1) {
      UserChat.update({ _id: chat._id },
        { $push: {
          chats: {
            createdAt: new Date(),
            actionType: "REVEAL_CLEANCODE",
            actionContent: scenario.instructionElements[lastJ].elementId,
            elementType: scenario.instructionElements[lastJ].elementType,
          } }
        });
    } else {
      // Since "InitialCode" should always be the first element in a tutorial,
      // a cleancode can always be found. Should never be here.
      console.log(`Failed finding a cleancode for ${c.elementType} ${c.actionType}.`);
    }
    return;
  }
};

const repeatLastTestElement = (chat, scenario) => {
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT") {
      if (c.elementType === "Coding") {
        const lastElementId = c.actionContent;
        let lastInd = -1;

        for (let j = 0; j < scenario.instructionElements.length; j++) {
          const e = scenario.instructionElements[j];
          console.log(`comparing lastElementId ${lastElementId} with ${e.elementId}`);
          if (e.elementId === lastElementId) {
            lastInd = j;
            break;
          }
        }

        if (lastInd < 0) {
          chatAnswer(chat, `I have not given you the any challenge yet. Please type 'ok' to continue.`);
          return;
        }

        UserChat.update({ _id: chat._id },
          { $push:
          {
            chats: {
              createdAt: new Date(),
              actionType: "REVEAL_ELEMENT",
              actionContent: scenario.instructionElements[lastInd].elementId,
              elementType: scenario.instructionElements[lastInd].elementType,
              condition: scenario.instructionElements[lastInd].condition ? scenario.instructionElements[lastInd].condition : "",
              conditionDone: false
            }
          }
          }
        );
      } else {
        chatAnswer(chat, `I have not given you the next challenge yet. Please type 'ok' to continue.`);
      }
      return;
    }
  }
};

let allQAs = {};

const getAllQAs = (toRefresh = true) => {
  if (allQAs && Object.keys(allQAs).length > 0 && !toRefresh) return allQAs;
  allQAs = {};
  const rawData = TBotQA.find();
  rawData.forEach((d) => {
    if (!(d.category in allQAs)) allQAs[d.category] = {};
    allQAs[d.category][d.key] = d.answer;
  });
  return allQAs;
};

const QACategoryMap = {
  PathPoolQA: 'Trajectory Pool Game questions',
  PathPoolRobotCodeQA: 'Game Bot code questions',
  JavascriptQA: 'JavaScript related questions',
  CommonErrorsQA: 'Common error FAQs',
  'Trajectory Pool Game': 'PathPoolQA',
  'Game Bot code': 'PathPoolRobotCodeQA',
  'JavaScript related': 'JavascriptQA',
  'Common errors': 'CommonErrorsQA',
};

function getQACategoriesInHtml() {
  if (!allQAs || Object.keys(allQAs).length === 0) {
    getAllQAs(true);
    if (!allQAs || Object.keys(allQAs).length === 0) return '';
  }
  const categories = Object.keys(allQAs).filter(q => q in QACategoryMap);
  const html = [];
  for (let i = 0; i < categories.length; i++) {
    let addOn = '';
    if (i > 0) addOn = ', ';
    else if (i === categories.length - 1) addOn = ', or ';
    const str = QACategoryMap[categories[i]];
    html.push(`${addOn}<a href="#" onclick="ClickToSendChat(event, '${str}')" class="inlinebutton">${str}</a>`);
  }
  return html.join('');
}

function getQAKeysInHtml(category) {
  if (!(category in QACategoryMap)) return '';
  const qac = QACategoryMap[category];
  if (!allQAs || !(qac in allQAs)) {
    getAllQAs(true);
    if (!allQAs || !(qac in allQAs)) return '';
  }
  const html = [];
  html.push('<table class="ReferenceTableLink"><tbody>');
  const keys = Object.keys(allQAs[qac]).sort();
  for (let i = 0; i < keys.length; i += 3) {
    html.push('<tr>');
    for (let j = 0; j < 3; j++) {
      if (i + j >= keys.length) html.push('<td></td>');
      else html.push(`<td><a href="#" onclick="ClickToSendChat(event, '${keys[i + j]}')" class="inlinebutton"> ${keys[i + j]} </a></td>`);
    }
    html.push('</tr>');
  }
  html.push('</tbody></table>');
  return html.join('');
}

const explainLastElement = (chat, scenario) => {
  const html = getQACategoriesInHtml();
  let askForQACategories = '';
  if (html.length > 0) {
    askForQACategories = `Could you tell me more about your question?
If it belongs to one of the following categories, please click the link. Otherwise, you can always post your question in our <a href="https://forum.tgame.ai/c/site-feedback" target="_blank">forum</a>.
${html}`;
  }
  if (askForQACategories !== '') {
    chatAnswer(chat, askForQACategories);
  } else {
    for (let i = chat.chats.length - 1; i >= 0; i--) {
      const c = chat.chats[i];
      if (c.actionType === "REVEAL_ELEMENT" && c.elementType !== "Hint") {
        switch (c.elementType) {
          case "Coding": {
            chatAnswer(chat, `Please complete the coding requirement as specified and then click "TEST" to check if it passes the test.`);
            break;
          }
          case "Quiz": {
            // chatAnswer(chat, `Please answer the quiz by typing your chosen answer key.`);
            revealNextTutorialElement(chat, scenario);
            break;
          }
          case "UserJavascriptLevel": {
            chatAnswer(chat, `Please choose A or B based on your experience with Javascript.`);
            revealNextTutorialElement(chat, scenario);
            break;
          }
          default:
          case "Info": {
            chatAnswer(chat, `If you understand the information from the previous section, you can simply tell me to move on by saying "OK" or "Let's continue".`);
          }
        }
        return;
      }
    }
  }
};

const extraceCode = (content) => {
  let newcode = "";
  const lines = content.split('\n');
  let foundstart = false; let foundEnd = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimRight();
    if (i < 2) {
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
        if (line.trim().indexOf('//') > 0) { // "//" comment is ok if it is starting from line start
          line = line.substring(0, line.indexOf('//')).trimRight();
        }
      }
    } else { // before found start, simply copy
    }
  }

  return newcode;
};

const reconstructCode = (uc) => {
  let code = '';

  for (let i = 0; i < uc.CodeUpdates.length; i += 1) {
    const patch = dmp.patch_fromText(uc.CodeUpdates[i].chg);
    const results = dmp.patch_apply(patch, code);
    code = results[0];
  }
  return code;
};

const calcNewCode = (scenario) => {
  let oldCodeAll = scenario.baselineCode;
  const oldCodeUpdates = UserRobotCodeByLesson.findOne({ UserID: Meteor.userId(), gameId: scenario.gameId, ScenarioID: scenario._id });
  if (!oldCodeUpdates) {
    for (let i = 0; i < scenario.instructionElements.length; i += 1) {
      const element = scenario.instructionElements[i];
      if (element.elementType === 'InitialCode' && element.cleancode && element.cleancode.trim() !== '') {
        oldCodeAll = element.cleancode;
        break;
      }
    }
  } else {
    oldCodeAll = reconstructCode(oldCodeUpdates);
  }
  return calcNewCodeBase(oldCodeAll, scenario.baselineCode);
};



const getElementCode = (scenario, Id) => {
  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    if (e.elementId === Id) {
      return e.code;
    }
  }
  return "";
};

const getElementHtml = (scenario, Id) => {
  for (let j = 0; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    if (e.elementId === Id) {
      return e.html;
    }
  }
  return "";
};


const getPurposeLine = (code, startInd, myline) => {
  const lines = code.split("\n");
  // console.log("in getPurposeLine " + myline);
  if (myline.indexOf("if (probability") >= 0) {
    // console.log("\n\n\n\n----------------\n\n\n\n");
  }
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].indexOf(myline) >= 0) {
      // find prev line and see if it is a comment
      if (lines[i - 1].trim().indexOf("//") >= 0) {
        // console.log(`lines[i-1] is ${lines[i-1]}`);
        return lines[i - 1].trim().substring(2);
      }
      break;
    }
  }
  return "";
};

const mystringify = (o) => {
  let cache = [];
  const str = JSON.stringify(o, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return "";
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // Enable garbage collection
  return str;
};

const getNodeString = (obj) => {
  if (obj == null) return "";
  const p = obj.parent;
  switch (obj.type) {
    case "ExpressionStatement":
      return getNodeString(obj.expression);
    case "AssignmentExpression":
      // return `${(obj.left.name?obj.left.name:obj.left.type)} = ${getNodeString(obj.right)}`;
      return `update to ${obj.left.name}`;
    case "FunctionExpression":
      return `function on (${obj.params.join(",")})`;
    case "Identifier":
      return obj.name;
    case "Property": {
      const s = `property ${obj.key.name}`;
      return s;
    }
    case "CallExpression":
      return `a call to function ${obj.callee.codestr}`;
    //   return `call ${getNodeString(obj.callee)} with ${getNodeString(obj.arguments)}`;
    case "MemberExpression":
      return `${getNodeString(obj.object)}.${obj.property.name}`;
    case "ThisExpression":
      return `this`;
    case "SwitchCase":
      return `the case ${obj.test.codestr}`;
    case "ForStatement":
      return `a for-loop across `;
    case "ObjectExpression": {
      if (obj.properties.length === 0) return "empty object";
      let des = "object with properties ";
      for (let k = 0; k < obj.properties.length; k++) {
        des += obj.properties[k].key.name;
        if (k < obj.properties.length - 1) des += ", ";
      }
      return des;
    }
    case "VariableDeclaration": {
      let allVars = "";
      for (let i = 0; i < obj.declarations.length; i++) {
        const b = obj.declarations[i];
        allVars += `${getNodeString(b)} `;
      }
      return allVars.trim();
    }
    case "VariableDeclarator":
      return `variable ${obj.id.name}`;

    case "IfStatement":
      // console.log("if statement: " + mystringify(obj));
      if (!obj.test.right) {
        return `if on ${getNodeString(obj.test)}`;
      }
      if (obj.test.right.value) return `if on ${obj.test.left.name} ${obj.test.operator} ${obj.test.right.value}`;
      else if (obj.test.right.name) return `if on ${obj.test.left.name} ${obj.test.operator} ${obj.test.right.name}`;
      else return `if on ${obj.test.left.name} ${obj.test.operator} ${obj.test.right.codestr}`;
    case "ReturnStatement":
      // return `return ${getNodeString(obj.argument)}`;
      return `return statement`;
    default: // BlockStatement
      return obj.type;
  }
};

const walkAndCompare = (aobj, uobj, res) => {
  if (aobj == null) return;

  // first find obj itself among children of uobj, assuming so far parents are a match already
  const astr = getNodeString(aobj);
  console.log(`\n--- search for astr (${astr}) (${aobj.type}) (${aobj.codestr})`);
  let foundastr = false;
  console.log(`uobj has ${uobj.children.length} children ${uobj.codestr}`);
  for (let j = 0; j < uobj.children.length; j++) {
    const u = uobj.children[j];
    const ustr = getNodeString(u);
    // console.log(`ustr ${j} is ${ustr}`);
    if (ustr === astr) {
      console.log(`found matching user str ${ustr}`);
      foundastr = true;
      for (let k = 0; k < aobj.children.length; k++) {
        console.log(`drill to child ${k} of aobj`);
        walkAndCompare(aobj.children[k], u, res);
        if (res.length > 0) return;
      }
      return;
    }
  }

  if (!foundastr) { // must be false!
    console.log("found missing!!!!!!!!!!!!!!! " + astr);
    res.push({
      missing: astr,
      answerObj: aobj,
    });
  }
};

const cleanObj = (obj, code, parent)  => {
  if (obj == null) return;
  if (!obj) return;

  obj.path = `${parent.path}/${obj.type}`;

  const props = Object.keys(obj);

  obj.children = [];

  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (prop === 'start') {
      const startInd = obj.start;
      const endInd = obj.end;
      obj.codestr = code.substring(startInd, endInd);
      const lines = obj.codestr.split("\n");
      obj.purpose = getPurposeLine(code, startInd, lines[0]);

      // delete obj[prop];
    } else if (prop === 'end') {
        // delete obj[prop];
    } else if (typeof obj[prop] === 'object') {
      if (obj[prop] instanceof Array) {
        const a = obj[prop];
        for (let j = 0; j < a.length; j++) {
          cleanObj(a[j], code, obj);
        }
      } else {
        cleanObj(obj[prop], code, obj);
      }
    }
  }

  if (obj) {
    obj.parent = parent;
    parent.children.push(obj);
  }
};


const pp = (o) => {
  const keys = Object.keys(o);
  console.log("all keys " + JSON.stringify(keys));
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] !== "parent") {
      if (keys[i] === "children") {

      } else {
        console.log("print key " + keys[i]);
        pp(o[keys[i]]);
      }
    }
  }
};

// check if all elements in answer code function are present in user code!
const checkCodeComplete = (chat, scenario) => {
  const result = [];
  console.log("checkCodeComplete");
  let tutorialElementStartInd = 0;
  let lastTutorialElementId = "";
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT") {
      tutorialElementStartInd = i;
      lastTutorialElementId = c.actionContent;
      break;
    }
  }
  console.log("before getElementCode " + lastTutorialElementId);
  const answerCode = getElementCode(scenario, lastTutorialElementId);
  console.log("before getElementCode");
  if (!answerCode) {
    result.push({
      missing: `not coding element`
    });
    console.log("return final result -1");
    return result;
  }
  const answerCodeLines = answerCode.split("\n");
  const firstAnswerLine = answerCodeLines[0];
  console.log("parsing answerCode " + answerCode);
  const answerast = acorn.parse(answerCode, { ecmaVersion: 6, locations: false, onComment: [] });
  console.log("raw ast " + JSON.stringify(answerast));
  const answerroot = { type: "root", path: "answerroot", children: [] };
  console.log("\n\n\n\n\nbefore clean obj--------\n\n\n\n");
  cleanObj(answerast, answerCode, answerroot);
  console.log("answerast ast " + JSON.stringify(answerast.body[0].expression));

  console.log("answerast.body[0] " + JSON.stringify(Object.keys(answerast.body[0])));
  // pp(answerast);
  let newFuncName = "don't know func name";
  if (answerast.body[0].expression) newFuncName = answerast.body[0].expression.left.codestr;
  else {
    if (answerast.body[0].declarations && answerast.body[0].declarations[0]) 
      newFuncName = answerast.body[0].declarations[0].id.name;
    else if (answerast.body[0].id && answerast.body[0].id.name) 
      newFuncName = answerast.body[0].id.name;
  
  }

  const userCodeChgs = UserRobotCodeByLesson.findOne({ UserID: Meteor.userId(), gameId: scenario.gameId, ScenarioID: scenario._id });
  console.log("userCodeChgs " + JSON.stringify(userCodeChgs));
  if (!userCodeChgs) {
    console.log("no user code!");
    result.push({
      missing: `no robot code found`
    });
    console.log("return final result 0");
    return result;
  }

  const userCodeAll = reconstructCode(userCodeChgs);
  const userBlocks = getCodeBlocks(userCodeAll);
  console.log("\n\n\n\all userBlocks: " + JSON.stringify(userBlocks));
  let userFunctionBlock = "";
  for (let z = 0; z < userBlocks.length; z++) {
    console.log("looking for " + newFuncName + " in " + userBlocks[z]);
    if (userBlocks[z].indexOf(newFuncName) >= 0) {
      userFunctionBlock = userBlocks[z];
      break;
    }
  }
  if (userFunctionBlock === "") {
    console.log(`checkCodeComplete: can't find function name in user code block ${newFuncName}`);
    result.push({
      missing: `can't find the function ${newFuncName}`
    });
    console.log("return final result 1");
    return result;
  }

  const userroot = { type: "root", path: "userroot", children: [] };
  const userast = acorn.parse(userFunctionBlock, { ecmaVersion: 6, locations: false, onComment: [] });
  cleanObj(userast, userFunctionBlock, userroot);

  console.log(`comparing ${userFunctionBlock} vs ${answerCode}`);

  // walk through every element in answer ast
  // and see if user ast also has the same element with same parents

  // why not do string comparison?
  // 1. formatting difference: same line or multiple lines in JSON, space or tab
  // 2. ordering difference: 2 lines can be done in any order, if else test which way
  // 3. variable naming difference? can I handle it or avoid it?
  walkAndCompare(answerast.children[0], userast, result);
  console.log("return final result 3");
  return result;
};

// see if we have already given this feedback on chat since last reveal element
const isDuplicateHint = (feedback, chat, scenario) => {
  const latestElement = getLatestElement(chat, scenario);
  for (let i = chat.chats.length - 1; i >= 0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT" && c.actionContent === latestElement.elementId) {
      break;
    }
    if (c.actionContent.indexOf(feedback) >= 0) {
      return true;
    }
  }
  return false;
};

const revealHintList = (chat, latestElement) => {
  UserChat.update({ _id: chat._id },
    { $push:
    {
      chats: {
        createdAt: new Date(),
        actionType: "REVEAL_HINTLIST",
        actionContent: latestElement.elementId,
      }
    }
    }
  );
};


const updateHintDisplayTime = (chat, elementId) => {
  console.log("\n\n\nupdateHintDisplayTime for " + elementId + " " + chat.firstHintsDisplayed);
  // const newlist = `${chat.firstHintsDisplayed} ${elementId}`;
  UserChat.update({ _id: chat._id },
    { $set: {
      lastHintDisplayTime: Date.now()
    }
    }
  );
};

// add this elementId to the list of hints displayed
const setFirstHintDisplayed = (chat, elementId) => {
  console.log("\n\nsetFirstHintDisplayed for elementId " + elementId + " " + chat.firstHintsDisplayed);
  if (chat.firstHintsDisplayed.indexOf(elementId) >= 0) return;
  const newlist = `${chat.firstHintsDisplayed} ${elementId}`;
  console.log("new list " + newlist);
  UserChat.update({ _id: chat._id },
    { $set: {
      firstHintsDisplayed: newlist,
      lastHintDisplayTime: Date.now()
    }
    }
  );
};


const revealElementCode = (chat, scenario) => {
  const latestElement = getLatestElement(chat, scenario);

  UserChat.update({ _id: chat._id },
    { $push:
    {
      chats: {
        createdAt: new Date(),
        actionType: "REVEAL_CODE",
        actionContent: latestElement.elementId,
      }
    }
    }
  );
};


/*
  new hint design:

*/

const generateHintReply = (chat, scenario, lintError, testRunCount, codeChangeCount)=>{
  console.log("\n\n\n generateHintReply");
  if (lintError !== "") {
    const ind = lintError.indexOf(":");
    const lineNo = lintError.substring(0, ind) + 1;
    const error = lintError.substring(ind + 1);

    const answer = `Let's fix the error on line ${lineNo} first: ${error}`;
    if (!isDuplicateHint(answer, chat, scenario)) {
      chatAnswer(chat, answer);
      return;
    }
  }

  console.log(`& & & testRunCount ${testRunCount} codeChangeCount ${codeChangeCount}`);
  if (codeChangeCount < 3) {
    // chatAnswer(chat, "Please try to work on your robot code a bit more before asking for more hints.");
    // return;
  }

  const result = checkCodeComplete(chat, scenario);

  if (result.length > 0) {
    console.log(`found diff: ${result[0].missing}`);
    if (result[0].missing == `no robot code found`) {
      chatAnswer(chat, "Looks like you haven't written code in your robot code editor on the right. You can start by adding the new function.");
      return;
    } else if (result[0].missing.indexOf(`can't find the function`) >= 0) {
      chatAnswer(chat, `I ${result[0].missing} in your robot code. Please add the function. Note that the case (upper or lower) of the letter matters in Javascript.`);
      return;
    } else if (result[0].missing.indexOf(`not coding element`) >= 0) {
      // chatAnswer(chat, `If you have no question on the information provided, please say 'ok' or 'next' to continue.`);
      chatAnswer(chat, `There is no coding challenge as of now. What's your question?`);
      return;
    }
    const aobj = result[0].answerObj;
    let feedback = "";
    // console.log("* * self " + aobj.codestr);
    // console.log("* * self purpose " + aobj.purpose);
    // console.log("* * parent " + aobj.parent.codestr);
    // console.log("* * grand parent " + aobj.parent.parent.codestr);

    // layer 0: if there is a purpose!
    if (aobj.purpose && aobj.purpose != "") {
      console.log("purpose is " + aobj.purpose);
      feedback = `At a high level you want to ${aobj.purpose}. Press '?' again for more detailed hints.`;
      if (!isDuplicateHint(feedback, chat, scenario)) {
        console.log("feed back level 0");
        chatAnswer(chat, feedback);
        return;
      }
    }

    feedback = `Please try to add ${getNodeString(aobj)}`;

    if (!isDuplicateHint(feedback, chat, scenario) && feedback != "") {
      console.log("feed back level 1");
      chatAnswer(chat, feedback);
    } else {
      feedback = `OK, you need to add ${result[0].codestr}.`;
      if (!isDuplicateHint(feedback, chat, scenario) && result[0].codestr) {
        console.log("feed back level 2");
        chatAnswer(chat, feedback);
      } else {
        feedback = `Looks like you are really struggling. This is what would work:`;
        if (!isDuplicateHint(feedback, chat, scenario)) {
          console.log("feed back level 3");
          chatAnswer(chat, feedback);
          // add the full code
          revealElementCode(chat, scenario);
        } else {
          chatAnswer(chat, "Sorry that's all that I can help. Please follow the example code I showed you above.");
        }
      }
    }
  } else {
      chatAnswer(chat, "Sorry I am not sure how to help you here.", scenario._id, true);
  }
  // console.log("no more hints!");
  // chatAnswer(chat, "Sorry, there is no more hints.");
};


// obsolete! now I dynamically figure out next hint based on code AST
const revealNextHintElement = (chat, scenario) => {
  let tutorialElementStartInd = 0;
  let lastTutorialElementId = "";
  for (let i = chat.chats.length-1; i>=0; i--) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT" && c.elementType !== "Hint") {
      tutorialElementStartInd = i;
      lastTutorialElementId = c.actionContent;
      break;
    }
  }


  let lastHintElementId = "";

  for (let i = tutorialElementStartInd + 1; i < chat.chats.length; i++) {
    const c = chat.chats[i];
    if (c.actionType === "REVEAL_ELEMENT" && c.elementType === "Hint") {
      lastHintElementId = c.actionContent;
    }
  }

  console.log(`last nonhint: ${lastTutorialElementId} and last hint: ${lastHintElementId}`);

  let lastElementId = lastHintElementId;
  if (lastHintElementId === "") {
    lastElementId = lastTutorialElementId;
  }
  console.log(`revealNextHintElement lastElementId ${lastElementId}`);

  let hintStartInd = 0;
  if (lastElementId !== "") {
    for (let j = 0; j < scenario.instructionElements.length; j++) {
      const e = scenario.instructionElements[j];
      if (e.elementId === lastElementId) {
        hintStartInd = j + 1;
      }
    }
  }
  console.log(`revealNextHintElement hintStartInd ${hintStartInd}`);

  for (let j = hintStartInd; j < scenario.instructionElements.length; j++) {
    const e = scenario.instructionElements[j];
    console.log(`revealNextHintElement ${j} e.elementType ${e.elementType}`);
    if (e.elementType === "Hint") {
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "REVEAL_ELEMENT",
            actionContent: scenario.instructionElements[j].elementId,
            elementType: scenario.instructionElements[j].elementType,
            condition: scenario.instructionElements[j].condition ? scenario.instructionElements[j].condition : "",
            conditionDone: false
          }
        }
        }
      );
      return;
    } else if (e.elementType !== "Hint") {
      break; // no more!!
    }
  }
  console.log("no more hints!");
  chatAnswer(chat, "Sorry, there is no more hints.");
};

const parseForHints = (code) => {
  if (!code) return {};
  const lines = code.split('\n');
  const hints = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    if (line.indexOf('//') < 0) continue;
    if (line.indexOf("//h") === 0 && line.indexOf("::") > 0) {
      // console.log("found hint line " + line);
      const parts = line.substring(2).split("::");
      const newHint = {
        hid: parts[0], main: parts[1], sub: parts[2], choice: []
      };
      let step = 1;
      let nextLine = lines[i + step];
      while (nextLine.trim().indexOf("::") === 0) {
        // console.log("nextLine is " + nextLine);
        newHint.choice.push(nextLine.trim().substring(2));
        step++;
        nextLine = lines[i + step];
      }
      i += step;
      console.log("new hint is " + JSON.stringify(newHint));
      hints[newHint.hid] = newHint;
      // code += `//${newHint.hid}: ${newHint.main}\n`;
    }
  }
  return hints;
};

const isAboutJSSymbols = (userText) => {
  const symbols = [
    '&&', '||', '++', '--', '==', '!=', '>', '<', '>=', '<=', '+=', '-=', '*=', '/=', '%=', '()', '[]',
    '{}', '}', '{'
  ];
  let hasSymbol = false;
  symbols.forEach((sy) => {
    if (userText.indexOf(sy) >= 0) {
      hasSymbol = true;
    }
  });
  if (userText.length < 30 && hasSymbol) return true;
  return false;
};

const handleResponse = (response, chat, scenario, lintError, testRunCount, codeChangeCount, userText) => {
  // console.log(`response action ${response.action}`);
  switch (response.action) {
    case "positive":
    case "smalltalk.appraisal.good":
    case "smalltalk.confirmation.yes": {
      console.log("positive action " + response.action);
      // for now assume I just asked if you are ready to continue. do we have other questions?
      revealNextTutorialElement(chat, scenario);
      return;
    }
    case "continue_with_tutorial": {
      revealNextTutorialElement(chat, scenario);
      return;
    }
    case "negative_response":
    case "smalltalk.confirmation.no": {
      const okanswers = ['OK', 'OKay', 'Sure', 'Got it', 'I understand', 'No problem', 'I see', 'Of course'];
      const oksentence = okanswers[Math.floor(Math.random() * okanswers.length)];
      chatAnswer(chat, `${oksentence}. Please tell me your questions, or type 'continue' to resume the tutorial.`);
      return;
    }
    case "need_further_explanation": {
      explainLastElement(chat, scenario);
      return;
    }
    case "repeat_current_test": {
      repeatLastTestElement(chat, scenario);

      return;
    }
    case "need_help_on_tgane_webapp": {
      const answer = tbot.getAnswerForTGameWebApp(response.parameters.fields.actions_on_tgame_webapp.stringValue);
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "TBOT_ANSWER",
            actionContent: answer
          }
        }
        }
      );
      return;
    }
    case "need_a_hint": {
      // revealNextHintElement(chat, scenario);
      generateHintReply(chat, scenario, lintError, testRunCount, codeChangeCount);
      return;
    }
    case "reveal_clean_code": {
      // revealNextHintElement(chat, scenario);
      revealCleanCodeForLastTest(chat, scenario);
      return;
    }

    case "support.contacts": {
      chatAnswer(chat, "You can email us at tgameai@gmail.com");
      return;
    }
    case "support.live_person": {
      chatAnswer(chat, "I apologize. I'll let someone smarter than me to get back to you soon!");
      return;
    }
    case "query_luckypool_object": {
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.luckypool_objects}`);
      let answer = tbot.getAnswerForPathPoolObject(response.parameters.fields.luckypool_objects.stringValue);
      // console.log(`answer is ${JSON.stringify(answer)}`);
      answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "TBOT_ANSWER",
            actionContent: answer
          }
        }
        }
      );
      return;
    }
    case "query_robotcode": {
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.robot_code_keywords}`);
      let answer = "";
      console.log(`in query_robotcode checking scenario game name ${scenario.gameName}`);
      if (scenario.gameName === "TrajectoryPool") answer = tbot.getAnswerForPathPoolRobotCode(response.parameters.fields.robot_code_keywords.stringValue);
      if (scenario.gameName === "DodgeBall") answer = tbot.getAnswerForDodgeBallRobotCode(response.parameters.fields.robot_code_keywords.stringValue);
      // console.log(`answer is ${JSON.stringify(answer)}`);
      answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "TBOT_ANSWER",
            actionContent: answer
          }
        }
        }
      );
      return;
    }
    case "query_javascript_keyword": {
      console.log("queury javascript");
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.Javascript_Keywords}`);
      let answer = tbot.getAnswerForJavascriptObject(response.parameters.fields.Javascript_Keywords.stringValue);
      answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      // console.log(`answer is ${JSON.stringify(answer)}`);
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "TBOT_ANSWER",
            actionContent: answer
          }
        }
        }
      );
      return;
    }
    case "qa.category": {
      console.log("query qa category");
      const category = response.parameters.fields.QA_Category.stringValue;
      const html = getQAKeysInHtml(category);
      const answer = (html === '' ?
        `There are no FAQs in category "${category}". Please type in another category or "next" to continue. ` :
        `Here is the list of FAQs in category "${category}". Please click the link below to get the answer. \n${html}`
      );
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "TBOT_ANSWER",
            actionContent: answer
          }
        }
        }
      );
      return;
    }
    case "error.message": {
      console.log("queury javascript");
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.Javascript_Keywords}`);
      let answer = tbot.getAnswerForCommonErrorsFAQs(response.parameters.fields.error_message.stringValue);
      answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      // console.log(`answer is ${JSON.stringify(answer)}`);
      UserChat.update({ _id: chat._id },
        { $push:
        {
          chats: {
            createdAt: new Date(),
            actionType: "TBOT_ANSWER",
            actionContent: answer
          }
        }
        }
      );
      return;
    }
    case "input.welcome":
    case "smalltalk": {
      // console.log("action: " + response.action + " response: " + response.fulfillment.speech);
      chatAnswer(chat, response.fulfillmentText);
      return;
    }
    default:
    case "wrong_answer":
    case "input.unknown": {
      if (isAboutJSSymbols(userText)) {
        let answer = tbot.getAnswerForJavascriptObject('javascript symbols');
        answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
        // console.log(`answer is ${JSON.stringify(answer)}`);
        UserChat.update({ _id: chat._id },
          { $push:
          {
            chats: {
              createdAt: new Date(),
              actionType: "TBOT_ANSWER",
              actionContent: answer
            }
          }
          }
        );
        return;
      }
      console.log("in input.unknown");
      const choices = [`Sorry I'm confused.`, `I'm sorry. I'm having trouble understanding what you said.`, `I'm sorry. I didn't quite grasp what you just said.`, `Sorry I'm a bit confused by that last part.`, `I'm not sure I follow.`, `I'm afraid I don't understand.`, `I'm a bit confused.`];
      const ind = Math.floor(Math.random() * choices.length);
      const choices2 = [`Can you try rephrase it?`, `Please clarify what you mean.`, `Would you please rephrase your question?`, `Can you say it a different way?`, `Would you mind trying a different question?`, `Maybe you can ask me in a different way?`, `Can you explain what you need to me again?`, `Please help me out here.`];
      const ind2 = Math.floor(Math.random() * choices.length);
      const html = getQACategoriesInHtml();
      let askForQACategories = '';
      if (html.length > 0) {
        askForQACategories = `If your question falls into one of the following categories, please click the link. Or, you can always post your question in our <a href="https://forum.tgame.ai/c/site-feedback" target="_blank">forum</a>. \n\n${html}`;
      }
      chatAnswer(chat, `${choices[ind]}. ${choices2[ind2]}
${askForQACategories}`, scenario._id, true, userText);
    }
  }
};

const buildScenario = (scenario, language) => {
  const userObj = Meteor.users.findOne({ _id: Meteor.userId() });
  // console.log("buildScenario userObj " + JSON.stringify(userObj.languages));
  if (!("languages" in userObj) || !userObj.languages) return;

  let langSkills = [];
  const filtered = userObj.languages.filter(l => l.name === language);
  if (filtered.length > 0 && "skills" in filtered[0]) langSkills = filtered[0].skills;
  const skillset = new Set(langSkills);
  const instructions = [];
  let cleancodeSofar = '';
  if (scenario.applyBaselineCode && scenario.baselineCode.trim() !== '') {
    cleancodeSofar = scenario.baselineCode;
  }
  for (let i = 0; i < scenario.instructionElements.length; i += 1) {
    const element = scenario.instructionElements[i];
    if (element.elementType === 'Coding' || element.elementType === 'InitialCode') {
      if (element.cleancode && element.cleancode.trim() !== '') {
        cleancodeSofar = calcNewCodeBase(cleancodeSofar, element.cleancode);
      }
      element.cleancode = cleancodeSofar;
    } else if (element.elementType === "Language") {
      if (!element.languageSkills || element.languageSkills === '') continue;
      // get all language prerequisites specified in this element
      // console.log("handling element.languageSkills " + element.languageSkills);
      const prereqs = element.languageSkills.split('|');
      const elementId = element.elementId;
      const skills = [];
      for (let j = 0; j < prereqs.length; j++) {
        // console.log("handling prereqs[j] " + prereqs[j]);
        const tokens = prereqs[j].split(":");
        if (tokens && tokens.length === 2 && tokens[0].toLowerCase() === language.toLowerCase()) {
          skills.push(tokens[1]);
        }
      }
      // get all language elements
      for (let k = 0; k < skills.length; k++) {
        const skill = skills[k];
        if (skillset.has(skill)) continue;
        const langLesson = Languages.findOne({ languageName: language, skill });
        if (langLesson && langLesson.instructionElements) {
          // console.log(`Adding elements ${langLesson}`);
          const elms = langLesson.instructionElements;
          elms.forEach((elm) => {
            elm.elementId = elementId.indexOf('.') < 0 ? `${elementId}.${elm.elementId}` : `${elementId}${elm.elementId}`;
            // console.log("adding element " + elm.elementId);
            instructions.push(elm);
          });
        }
      }
      continue;
    } else if (element.elementType === "InfoToNew") {
      if (userObj.tutorial && userObj.tutorial.length > 0) {
        const poolTutorials = userObj.tutorial.filter(l => l.id.startsWith('P'));
        if (poolTutorials.length > 0) continue;
      }
    }
    instructions.push(element);
  }
  scenario.instructionElements = instructions;
};

export default function () {
  Meteor.methods({
    initializeUserChatServerUser(scenarioId) {
      check(scenarioId, String);
      const userId = Meteor.userId();
      // console.log(`initializeUserChatServerUser for ${scenarioId} ${userId}`);

      const existingChat = UserChat.findOne({ scenarioId, userId });
      if (existingChat != null) {
        console.log("initializeUserChatServer chat already existed!");
        return;
      }
      if (userId == null) {
        console.log("initializeUserChatServer user id is null");
        return;
      }

      // const user = Meteor.users.findOne({ _id: Meteor.userId() });
      // const scenario = UserScenarios.findOne({ _id: scenarioId });

      const chat = {
        scenarioId, userId, testFailureCurrentElementCount: 0, chats: []
      };
      chat.chats.push({
        createdAt: new Date(),
        actionType: "REVEAL_ELEMENT",
        actionContent: "welcomeusertest",
        elementType: "info"
      });
      console.log(`adding new user test chat ${JSON.stringify(chat)}`);
      UserChat.insert(chat);
    },

    initializeUserChatServer(scenarioId) {
      check(scenarioId, String);
      const userId = Meteor.userId();
      // console.log(`initializeUserChatServer for ${scenarioId} ${userId}`);

      const existingChat = UserChat.findOne({ scenarioId, userId });
      if (existingChat) {
        console.log("initializeUserChatServer chat already existed!");
        return;
      }
      if (!userId) {
        console.log("initializeUserChatServer user id is null");
        return;
      }

      const user = Meteor.users.findOne({ _id: Meteor.userId() });
      const language = user.defaultLanguage ? user.defaultLanguage : 'JavaScript';
      const scenario = Scenarios.findOne({ _id: scenarioId });
      buildScenario(scenario, language);

      const chat = {
        scenarioId, userId, testFailureCurrentElementCount: 0, chats: []
      };
      const excludeTypes = { InitialCode: true };
      let ind = 0;
      while (ind < scenario.instructionElements.length &&
      scenario.instructionElements[ind].elementType in excludeTypes) {
        ind++;
      }
      if (ind >= scenario.instructionElements.length) {
        console.log('Cannot find an instruction element to initialize a chat.');
        return;
      }
      let c = scenario.instructionElements[ind].condition;
      if (typeof(c) === "undefined") {
        c = "";
      }
      chat.chats.push({
        createdAt: new Date(),
        actionType: "REVEAL_ELEMENT",
        actionContent: scenario.instructionElements[ind].elementId,
        elementType: scenario.instructionElements[ind].elementType,
        condition: c,
        conditionDone: false
      });
      // console.log(`adding new chat ${JSON.stringify(chat)}`);
      // const chatId =
      UserChat.insert(chat);
      // return chatId;

      accountupdateProgress(scenario._id, 0, scenario.gameId, scenario.ScenarioSequenceNumber);

      if (scenario.applyBaselineCode) {
        /*
        new logic: 
          1. if new lesson first time, then apply baseline
          2. if not new, does not have code in UserRobotCodeByLesson, then read from UserRobotCode

         */

        const newCode = calcNewCode(scenario);
        // console.log("\n\n\n\n------\n\nafter apply base line new code: " + newCode);
        const chgTxt = getPatch("", newCode);
        const chg = { time: new Date().getTime(), label: '', chg: chgTxt };
        // console.log("apply baseline for chat chg is " + JSON.stringify(chg));
        UserRobotCodeByLesson.remove({ UserID: this.userId, gameId: scenario.gameId, ScenarioID: scenario._id });
        UserRobotCodeByLesson.update(
          { UserID: this.userId, gameId: scenario.gameId, ScenarioID: scenario._id },
          { $push: { CodeUpdates: chg }, $set: {lastUpdateTime: Number(new Date())} },
          { upsert: true }
        );
      }
    },


    async handNewUserChatAction(chatId, userAction, actionContent, lintError, testRunCount, codeChangeCount, language = '') {
      check(chatId, String);
      check(userAction, String);
      check(actionContent, String);
      // check(scenarioId, String);
      check(lintError, String);
      check(testRunCount, Number);
      check(codeChangeCount, Number);
      const that = this;
      let isUserTest = false;

      const chat = UserChat.findOne({ _id: chatId });
      if (chat == null) { throw new Error(`chat not found ${chatId}`); }
      let scenario = Scenarios.findOne({ _id: chat.scenarioId });
      if (!scenario) {
        scenario = UserScenarios.findOne({ _id: chat.scenarioId });
        scenario.instructionElements = [{
          elementType: "info", elementId: "welcomeusertest"
        }];
        scenario.isUserTest = true;
        isUserTest = true;
      }
      const userId = Meteor.userId();
      console.log(`handNewUserChatAction for chatId ${chatId} userId ${userId}  ${userAction} ${actionContent} ${lintError} `);

      if (!isUserTest) {
        if (language === '') {
          const user = Meteor.users.findOne({ _id: Meteor.userId() });
          language = user.defaultLanguage ? user.defaultLanguage : 'JavaScript';
        }
        buildScenario(scenario, language);
      }

      if (userAction !== 'USER_CODE_UPDATE') {
        // console.log("not USER_CODE_UPDATE " + userAction + " content " + actionContent);
        const chatData = {
          createdAt: new Date(),
          actionType: userAction,
          actionContent,
          sender: Meteor.userId()
        };
        // console.log("before pushing to userchat");
        UserChat.update({ _id: chat._id },
          { $push: 
            {
              chats: chatData
            } 
          }
        );

        if (chat.userId != Meteor.userId()) {
          return;
          // const isTeacher = _.includes(_.get(Meteor.user().getPerson(), 'type', []), USER_TYPES.TEACHER);;
          // if (isTeacher) {
          //   return;
          // }
        }
      }

      // setTimeout(Meteor.bindEnvironment(() => {
        // console.log(`after timeout, userAction is ${userAction}`);
      const latestElement = getLatestElement(chat, scenario);
      let latestElementType = latestElement.elementType;
      // let hasConcluded = latestElement.elementId == scenario.instructionElements[scenario.instructionElements.length-1].elementId;
      if (isUserTest) {
        latestElementType = "info";
        // hasConcluded = true;
      }


      if (userAction === "USER_TEXT") {
        actionContent = removeEmptyLines(actionContent);
        // console.log(`actionContent is ${actionContent}`);

        // if (hasConcluded) {
        //   // chatAnswer(chat, `This tutorial has concluded.`);
        //   // return;
        // }

        // need to see if we are in a quiz by looking at last element type
        // console.log(`latestElementType ${latestElementType}`);
        if (latestElementType === "UserJavascriptLevel") {
          if (actionContent.trim().length === 1 && "AB".indexOf(actionContent.toUpperCase().trim()) >= 0) {
            let userJSLevel = "Beginner";
            let comment = "No worries! I will do my best to explain basic Javascript features as we go, and you can always ask me for help on any Javascript key words at any time";
            if (actionContent.toUpperCase().trim() === "B") {
              userJSLevel = "Intermediate";
              comment = "Sounds good. I will not bother you with basic language features, but if you need a refresher, you can always ask me for help on any Javascript key words at any time";
            }
            updateUserJSLevel(userJSLevel);
            chatAnswer(chat, `${comment}. Now let's continue.`);
            revealNextTutorialElement(chat, scenario);
          } else {
            chatAnswer(chat, "Please answer with A or B.");
          }
          return;
        }

        if (latestElementType === "UserOKWithScratch") {
          if (actionContent.trim().length === 1 && "AB".indexOf(actionContent.toUpperCase().trim()) >= 0) {
            let userOKWithScratch = 1;
            let comment = "All right! I will show you Scratch examples";
            if (actionContent.toUpperCase().trim() === "B") {
              userOKWithScratch = 0;
              comment = "No problem. I will not bother you with Scratch examples";
            }
            updateUserScratchPreference(userOKWithScratch);
            chatAnswer(chat, `${comment}. Now let's continue.`);
            revealNextTutorialElement(chat, scenario);
          } else {
            chatAnswer(chat, "Please choose A or B.");
          }
          return;
        }

        if (latestElementType === "Quiz") {
            if (actionContent.trim().length == 1 && "ABCD".indexOf(actionContent.toUpperCase().trim())>=0 || actionContent.trim().toLowerCase() === 'code') {
            // check answer
            const correctAnswer = getLatestQuizAnswer(chat, scenario);
            const correctAnswerReasib = getLatestQuizAnswerReason(chat, scenario);
            const ansReasons = {};
            if (correctAnswerReasib && correctAnswerReasib.indexOf('|') > 0) {
              // the format of answerReason is "A:why A is wrong|B:why B is wrong|C:why C is correct|D:why D is wrong"
              const reasons = correctAnswerReasib.split('|');
              reasons.forEach((r) => {
                const tokens = r.split(':');
                if (tokens && tokens.length === 2) {
                  ansReasons[tokens[0]] = tokens[1];
                }
              });
            } else {
              ansReasons[correctAnswer] = correctAnswerReasib;
            }
            // console.log("quiz 1");
            if (actionContent.toUpperCase().trim() === correctAnswer.toUpperCase()) {
              // console.log("quiz 2");

              let answerString = `That's correct! <b>${ansReasons[correctAnswer] || ""}</b><br/>Now let's continue.`;
              if (chat.testFailureCurrentElementCount == 0) {
                // correct answer on first try!
                answerString = `That's correct! <b>${ansReasons[correctAnswer] || ""}</b><br/>You have been rewarded 10 <img src="/images/coin.png" style='height: 20px' alt="gold coins" /> for answering the question correctly on the first try! Now let's continue.`;

                const user = Meteor.user();
                Meteor.users.update({
                  _id: Meteor.userId(),
                }, { $set: {'profile.coins': user.profile.coins + 10} });
              }


              chatAnswer(chat, answerString);
              // console.log("quiz 3");
              markLastElementDone(chat, latestElement, scenario);
              // console.log("quiz 4");
              if (correctAnswerReasib) 
                revealNextTutorialElement(chat, scenario, 2000, true);
              else 
                revealNextTutorialElement(chat, scenario, 500, true);
            } else {
              // console.log("quiz 5");
              UserChat.update({ _id: chat._id }, { $inc: { testFailureCurrentElementCount: 1 } });
              // console.log("quiz 6");
              chatAnswer(chat, `That's incorrect. ${ansReasons[actionContent.toUpperCase().trim()] || ''} Please try again.`);
              // console.log("quiz 7");
            }
            return;
          } else {
            // parse response first!
            // chatAnswer(chat, "Please answer the quiz with one letter of your choice.");
          }
        } else {
          // not in quiz mode

          console.log("checking firstHintDisplayed " + chat.firstHintsDisplayed + " vs " + latestElement.elementId);
          const ind = (` ${chat.firstHintsDisplayed}`).indexOf(latestElement.elementId);
          console.log("\n\n\n\n ind " + ind);
          const firstHintDisplayed = ind >= 1;

          // console.log("\n\n\n\n firstHintDisplayed " + firstHintDisplayed);
          const hints = parseForHints(latestElement.code);

          // check for special hint keys
          if (latestElementType === "Coding") {
            // console.log("last type is " + latestElementType);
            console.log("hints are " + JSON.stringify(hints));

            if (hints[actionContent.trim()]) {
              // shortcut: user typed in "h0"
              console.log("return specific hint " + firstHintDisplayed);
              if (!firstHintDisplayed) {
                // console.log("need to display all first hints first");
                revealHintList(chat, latestElement);
                setFirstHintDisplayed(chat, latestElement.elementId);
                return;
              }

              console.log("compare current time with when first hint list given");
              const timeDiff = Math.round(0.001 * (new Date() - chat.lastHintDisplayTime));

              const HINT_WAIT_TIME = 30; // 1 minutes ?
              if (timeDiff < HINT_WAIT_TIME && userId !== "kEmnDrYssC2gKNDxx") {
                chatAnswer(chat, `The last hint was given just <b>${timeDiff}</b> seconds ago. I will wait at least <b>${HINT_WAIT_TIME}</b> seconds before giving out each new hint. Please give it some more thought!`);
                return;
              }

              displayOneHint(hints[actionContent.trim()], chat, latestElement.elementId);
              return;
            } else {
              // console.log("no hint yet");
            }
          }
        }

        if (false) { // aaaa if no internet!
          let response = "continue_with_tutorial";
          if (actionContent === "hint") {
            response = "need_a_hint";
          }
          handleResponse({ action: response }, chat, scenario, lintError, testRunCount, codeChangeCount);
          return;
        }

        if (actionContent === "next") {
          handleResponse({ action: 'continue_with_tutorial' }, chat, scenario, lintError, testRunCount, codeChangeCount);
          return;
        }


        if (actionContent.toUpperCase() === "CODE") {
          handleResponse({ action: 'reveal_clean_code' }, chat, scenario, lintError, testRunCount, codeChangeCount);
          return;
        }

        if (actionContent.toUpperCase() === "CHALLENGE") {
          handleResponse({ action: 'repeat_current_test' }, chat, scenario, lintError, testRunCount, codeChangeCount);
          return;
        }

        // const accessToken = "f3012e6c5871408b93090c633daff480";
        // const baseUrl = "https://api.dialogflow.com/v1/query?v=20170712";//"https://api.api.ai/v1/query?v=20150910";

        const smalltalkExceptionSet = new Set([
          "smalltalk.confirmation.no",
          "smalltalk.appraisal.good",
          "smalltalk.confirmation.yes",
        ]);

        let intentResponse;
        const projectId = "tbotv1-3-afmvid";

        try {
          console.log(`Sending Query: ${actionContent.trim().substring(0, 255)}`);
          intentResponse = await detectIntent(
            projectId,
            chat._id,  //sessionId,
            actionContent.trim().substring(0, 255), // query,
            "",         //context,
            'en'        //languageCode
          );
          // console.log('Detected intent');
          // console.log(
          //   `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
          // );
          // Use the context from this response for next queries
          // context = intentResponse.queryResult.outputContexts;

        } catch (error) {
          console.log(`api.ai returned error: ${error}`);
          let response = "continue_with_tutorial";
          if (actionContent === "hint") {
            response = "need_a_hint";
          }
          handleResponse({ action: response }, chat, scenario, lintError, testRunCount, codeChangeCount);
          return;
        }

        const response = intentResponse.queryResult;
        console.log("got response " + JSON.stringify(intentResponse.queryResult));

        if (!smalltalkExceptionSet.has(response.action) && response.action.indexOf("smalltalk") === 0) {
          response.action = "smalltalk";
        }

        if (latestElementType === "Quiz") {
          // console.log("handle non-letter choice situation for quiz");
          switch (response.action) {
            case "negative_response":
            case "smalltalk.confirmation.no": {
              const correctAnswer = getLatestQuizAnswer(chat, scenario);
              const correctAnswerReasib = getLatestQuizAnswerReason(chat, scenario);
              chatAnswer(chat, `No problem. The correct answer is ${correctAnswer}, because ${correctAnswerReasib}`);
              revealNextTutorialElement(chat, scenario, 3000);
              return;
              // break;
            }
            // default:
            //   chatAnswer(chat, "Please answer the quiz with one letter of your cohice.");
          }
          // return;
        }

        if (response.action === "need_a_hint") {
          console.log("need a hint");

          revealHintList(chat, latestElement);
          setFirstHintDisplayed(chat, latestElement.elementId);
        } else {
          handleResponse(response, chat, scenario, lintError, testRunCount, codeChangeCount, actionContent);
        }

      } else if (userAction === "USER_TEST_RESULT") {
        if (actionContent.indexOf('Test passed!') >= 0) {

          answerString = `Well done! You have been rewarded 50 <img src="/images/coin.png" style='height: 20px' alt="gold coins" /> for completing this coding challenge!`;

          const user = Meteor.user();
          Meteor.users.update({
            _id: Meteor.userId(),
          }, { $set: {'profile.coins': user.profile.coins + 50} });
          chatAnswer(chat, answerString);
          

          console.log("markLastElementDone ");
          markLastElementDone(chat, latestElement, scenario);
          // console.log("mark progress ");
          // markChatProgress(chat, scenario);
          console.log("review next ");
          revealNextTutorialElement(chat, scenario, 500, true);
        } else {
          UserChat.update({ _id: chat._id }, { $inc: { testFailureCurrentElementCount: 1 } });
        }
      }
    },
  });
}

// Dialogflow V2 API

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(
  projectId,
  sessionId,
  query,
  contexts,
  languageCode
) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

