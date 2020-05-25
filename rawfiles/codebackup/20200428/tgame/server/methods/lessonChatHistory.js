import { check, Match } from 'meteor/check';
import { ChatSupport, LessonChatHistory, TBotQA } from '../../lib/collections';
import { ACTION_TYPE_SUPPORT_MESSAGE } from '../../lib/enum';
import { stripHTML } from '../../lib/util';

const queryQADB = (qaType, key) => {
  console.log(`TBotQA ${qaType} ${key}`);
  const ans = TBotQA.findOne({
    category: qaType, key
  });
  if (ans && ans.answer) {
    return ans.answer;
  }
  return "<div>Sorry I don't know the answer to that question...</div>.";
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

const lessonChatHistoryCreate = (conversationId, content, createdBy, messageType = ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT) => {
  check(conversationId, Match.Maybe(String));
  check(content, String);
  check(createdBy, String);
  check(messageType, String);

  let chatSupportId = conversationId;

  if (!chatSupportId) {
    chatSupportId = Meteor.call('chatSupport.createNewChatSupport');
  }
  const message = {
    content,
    chatSupportId,
    messageType,
    createdBy,
    createdAt: new Date(),
    isRead: false
  };
  const updateUnread = {};

  if (messageType === ACTION_TYPE_SUPPORT_MESSAGE.USER_TEXT) {
    updateUnread.unReadCount = 1;
  } else updateUnread.unReadClientCount = 1;
  ChatSupport.update(chatSupportId, {
    $inc: updateUnread,
    $set: {
      lastTimeAdded: new Date()
    }
  });

  return LessonChatHistory.insert(message);
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
  'Common errors': 'CommonErrorsQA'
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
// New TBOT!

const composeResponse = (response, userText) => {
  // console.log(`response action ${response.action}`);

  const smalltalkExceptionSet = new Set([
    "smalltalk.confirmation.no",
    "smalltalk.appraisal.good",
    "smalltalk.confirmation.yes"
  ]);

  if (!smalltalkExceptionSet.has(response.action) && response.action.indexOf("smalltalk") === 0) {
    response.action = "smalltalk";
  }

  switch (response.action) {
    case "input.welcome":
    case "smalltalk": {
      // console.log("action: " + response.action + " response: " + response.fulfillment.speech);
      return response.fulfillment.speech;
    }

    case "positive":
    case "smalltalk.confirmation.yes": {
      console.log(`positive action ${response.action}`);
      // for now assume I just asked if you are ready to continue. do we have other questions?
      // revealNextTutorialElement(chat, scenario);
      return "";
    }
    case "negative_response":
    case "smalltalk.confirmation.no": {
      // const okanswers = ['OK', 'OKay', 'Sure', 'Got it', 'I understand', 'No problem', 'I see', 'Of course'];
      // const oksentence = okanswers[Math.floor(Math.random() * okanswers.length)];
      // chatAnswer(chat, `${oksentence}. Please tell me your questions.`);
      return "";
    }
    case "need_further_explanation": {
      // explainLastElement(chat, scenario);
      return "";
    }
    case "repeat_current_test": {
      // repeatLastTestElement(chat, scenario);
      return "";
    }
    // case "need_help_on_tgane_webapp": {
    //   const answer = tbot.getAnswerForTGameWebApp(response.parameters.actions_on_tgame_webapp);
    //   UserChat.update({ _id: chat._id },
    //     { $push:
    //     {
    //       chats: {
    //         createdAt: new Date(),
    //         actionType: "TBOT_ANSWER",
    //         actionContent: answer
    //       }
    //     }
    //     }
    //   );
    //   return;
    // }
    // case "need_a_hint": {
    //   // revealNextHintElement(chat, scenario);
    //   generateHintReply(chat, scenario, lintError, testRunCount, codeChangeCount);
    //   return;
    // }
    // case "reveal_clean_code": {
    //   // revealNextHintElement(chat, scenario);
    //   revealCleanCodeForLastTest(chat, scenario);
    //   return;
    // }

    case "support.contacts": {
      return "You can email us at tgameai@gmail.com";
    }
    case "support.live_person": {
      return "I apologize. I'll let someone smarter than me to get back to you soon!";
    }
    case "query_luckypool_object": {
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.luckypool_objects}`);
      const answer = tbot.getAnswerForPathPoolObject(response.parameters.luckypool_objects);
      // console.log(`answer is ${JSON.stringify(answer)}`);
      // answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      // UserChat.update({ _id: chat._id },
      //   { $push:
      //   {
      //     chats: {
      //       createdAt: new Date(),
      //       actionType: "TBOT_ANSWER",
      //       actionContent: answer
      //     }
      //   }
      //   }
      // );
      return answer;
    }
    case "query_robotcode": {
      return "";
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.robot_code_keywords}`);
      let answer = "";
      console.log(`in query_robotcode checking scenario game name ${scenario.gameName}`);
      if (scenario.gameName === "TrajectoryPool") answer = tbot.getAnswerForPathPoolRobotCode(response.parameters.robot_code_keywords);
      if (scenario.gameName === "DodgeBall") answer = tbot.getAnswerForDodgeBallRobotCode(response.parameters.robot_code_keywords);
      // console.log(`answer is ${JSON.stringify(answer)}`);
      // answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      // UserChat.update({ _id: chat._id },
      //   { $push:
      //   {
      //     chats: {
      //       createdAt: new Date(),
      //       actionType: "TBOT_ANSWER",
      //       actionContent: answer
      //     }
      //   }
      //   }
      // );
      return answer;
    }
    case "query_javascript_keyword": {
      console.log("queury javascript");
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.Javascript_Keywords}`);
      const answer = tbot.getAnswerForJavascriptObject(response.parameters.Javascript_Keywords);
      // answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      // console.log(`answer is ${JSON.stringify(answer)}`);
      // UserChat.update({ _id: chat._id },
      //   { $push:
      //   {
      //     chats: {
      //       createdAt: new Date(),
      //       actionType: "TBOT_ANSWER",
      //       actionContent: answer
      //     }
      //   }
      //   }
      // );
      return answer;
    }
    case "qa.category": {
      console.log("query qa category");
      const category = response.parameters.QA_Category;
      const html = getQAKeysInHtml(category);
      const answer = (html === ''
        ? `There are no FAQs in category "${category}". Please type in another category or "next" to continue. `
        : `Here is the list of FAQs in category "${category}". Please click the link below to get the answer. \n${html}`
      );
      // UserChat.update({ _id: chat._id },
      //   { $push:
      //   {
      //     chats: {
      //       createdAt: new Date(),
      //       actionType: "TBOT_ANSWER",
      //       actionContent: answer
      //     }
      //   }
      //   }
      // );
      return answer;
    }
    case "error.message": {
      console.log("queury javascript");
      // chatAnswer(chat, `I'll tell your more about ${response.parameters.Javascript_Keywords}`);
      const answer = tbot.getAnswerForCommonErrorsFAQs(response.parameters.error_message);
      // answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
      // // console.log(`answer is ${JSON.stringify(answer)}`);
      // UserChat.update({ _id: chat._id },
      //   { $push:
      //   {
      //     chats: {
      //       createdAt: new Date(),
      //       actionType: "TBOT_ANSWER",
      //       actionContent: answer
      //     }
      //   }
      //   }
      // );
      return answer;
    }
    case "input.welcome":
    case "smalltalk": {
      // console.log("action: " + response.action + " response: " + response.fulfillment.speech);
      return response.fulfillment.speech;
    }
    default:
    case "wrong_answer":
    case "input.unknown": {
      if (isAboutJSSymbols(userText)) {
        const answer = tbot.getAnswerForJavascriptObject('javascript symbols');
        // answer = `${answer} <p>Type <b>ok</b> or click <img src='/images/icon-next.png' style='width: auto; height: 25px; vertical-align: bottom;'/> to continue.</p>`;
        // // console.log(`answer is ${JSON.stringify(answer)}`);
        // UserChat.update({ _id: chat._id },
        //   { $push:
        //   {
        //     chats: {
        //       createdAt: new Date(),
        //       actionType: "TBOT_ANSWER",
        //       actionContent: answer
        //     }
        //   }
        //   }
        // );
        return answer;
      }
      // console.log("in input.unknown");
      const choices = [`Sorry I'm confused.`, `I'm sorry. I'm having trouble understanding what you said.`, `I'm sorry. I didn't quite grasp what you just said.`, `Sorry I'm a bit confused by that last part.`, `I'm not sure I follow.`, `I'm afraid I don't understand.`, `I'm a bit confused.`];
      const ind = Math.floor(Math.random() * choices.length);
      const choices2 = [`Can you try rephrase it?`, `Please clarify what you mean.`, `Would you please rephrase your question?`, `Can you say it a different way?`, `Would you mind trying a different question?`, `Maybe you can ask me in a different way?`, `Can you explain what you need to me again?`, `Please help me out here.`];
      const ind2 = Math.floor(Math.random() * choices.length);
      const html = getQACategoriesInHtml();
      let askForQACategories = '';
      if (html.length > 0) {
        askForQACategories = `If your question falls into one of the following categories, please click the link. Or, you can always post your question in our <a href="https://forum.tgame.ai/c/site-feedback" target="_blank">forum</a>. \n\n${html}`;
      }
      return `${choices[ind]}. ${choices2[ind2]} ${askForQACategories}`;
    }
  }
};

const lessonChatHistoryCreateSupport = (chatSupportId, htmlContent) => {
  try {
    check(chatSupportId, String);

    if (!chatSupportId)
      Meteor.call('chatSupport.createNewChatSupport');
  } catch (error) {
    throw error.message;
  }
};


const lessonChatHistoryBotReply = (chatSupportId, htmlContent) => {
  try {
    check(chatSupportId, String);
    check(htmlContent, String);

    console.log("in lessonChatHistoryBotReply " + chatSupportId);

    const accessToken = "d197e325a2b84a7cb7d501bd338a5477";
    const baseUrl = "https://api.dialogflow.com/v1/query?v=20170712";

    const newHtmlContent = htmlContent.replace(/<(?:.|\n)*?>/gm, '');

    HTTP.call('POST', baseUrl, {
      data: {
        query: stripHTML(newHtmlContent).substring(0, 255),
        lang: 'en',
        sessionId: chatSupportId,
        dataType: "json"
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }, (error, response) => {
      if (!error) {
        const data = JSON.parse(response.content);
        const { result } = data;
        const botReplyMessage = composeResponse(result, newHtmlContent);

        if (!botReplyMessage || botReplyMessage === "") return;

        lessonChatHistoryCreate(chatSupportId, botReplyMessage, 'system', ACTION_TYPE_SUPPORT_MESSAGE.BOT_TEXT);
      }
    });
  } catch (error) {
    throw error.message;
  }
};

export default function () {
  Meteor.methods({
    'lessonChatHistory.create': lessonChatHistoryCreate,
    'lessonChatHistory.botReply': lessonChatHistoryBotReply,
    'lessonChatHistory.recreateSupport': lessonChatHistoryCreateSupport
  });
}
