import React from 'react';
import renderHTML from 'react-render-html';
import Script from 'react-load-script';
import TinyMCE from 'react-tinymce';
import isMobile from 'ismobilejs';
import ReactTooltip from 'react-tooltip';
// import SH from '/js/syntaxhighlighter.js';

function getUID() {
  const path = window.location.pathname;
  let uid = "";
  if (path.indexOf("/class") == 0) {
    // "/class/kpGqDfZSqcpBqQ8RQ/8WsN3rqnZ8odhKpHG/P1"
    const p = path.split("/");
    uid = p[3];
  }
  return uid;
}



/**
 * TODO: add typing speed detector, add copy paster detector
 */

let inputKeyDownSetup = false;
let chatInputSetup = false;

const removeScratchExampleFor = (txt) => {
  if (!txt) return '';
  // go through all <p> pairs and remove it if it is marked as AScratchExample
  const p = txt.split("\n");
  let out = "";
  let inRemovePart = false;
  for (let k=0; k<p.length; k++) {
    if (p[k].indexOf(`ascratchexample =`) >= 0) {
      inRemovePart = true;
    }
    const ind = p[k].indexOf("</p>");
    if (inRemovePart && ind >= 0) {
      inRemovePart = false;
      continue;
    }

    if (!inRemovePart) {
      out += `${p[k]}\n`;
    }
  }
  return out;
};


const removeJSLevelFor = (txt, level) => {
  // go through all <p> pairs and remove it if it is of that level
  const p = txt.split("\n");
  let out = "";
  let inRemovePart = false;
  for (let k=0; k<p.length; k++) {
    if (p[k].indexOf(`js = "${level}"`) >= 0) {
      inRemovePart = true;
    }
    const ind = p[k].indexOf("</p>");
    if (inRemovePart && ind >= 0) {
      inRemovePart = false;
      continue;
    }

    if (!inRemovePart) {
      out += `${p[k]}\n`;
    }
  }
  return out;
};


const removeJSLevelForOld = (txt, level) => {
  // go through all <p> pairs and remove it if it is of that level
  const p = txt.split("<p");
  let out = "";
  for (let k=0; k<p.length; k++) {
    if (k > 0) {
      out += "<p";
    }
    if (p[k].indexOf(`js = "${level}"`) >= 0) {
      const ind = p[k].indexOf("</p>");
      out += `${p[k].substring(ind+4)}`;
    } else {
      out += `${p[k]}`;
    }
  }
  return out;
};

const getTimeStr = function(chattime) {
  return `${chattime.getMonth() + 1}/${chattime.getDate()}/${chattime.getFullYear()} ${chattime.getHours() < 10 ? '0' : ''}${chattime.getHours()}:${chattime.getMinutes() < 10 ? '0' : ''}${chattime.getMinutes()}:${chattime.getSeconds() < 10 ? '0' : ''}${chattime.getSeconds()}`;
};

const getFunctionContext = (line) => {
  let functionContext = line.substring(0, line.indexOf('=')).trim();
  if (functionContext.indexOf('var') === 0) {
    functionContext = functionContext.substring(4).trim();
  }
  return functionContext;
};

const sharedStart = (a1, a2) => {
  a1 = a1.trim(); a2 = a2.trim();
  const L = a1.length;
  let i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
};

const insertNewWholeFunction = function insertNewWholeFunction(newcode, usercodeall, pattern) {
  const usercode = usercodeall.split('\n');

  if (newcode.indexOf(pattern) < 0) return usercode;
  const newlines = newcode.split('\n');
  // for now let's assume there is only one new function
  let foundStart = false;
  let foundEnd = false;
  for (let i = 0; i < newlines.length; i++) {
    const line = newlines[i];
    let linetrim = line;
    if (line.indexOf('//') > 0) {
      linetrim = line.substring(0, line.indexOf('//')).trimRight();
    }
    if (foundEnd) break;

    if (line.indexOf(pattern) > 0) {
      if (foundStart) {
        foundEnd = true;
      } else {
        foundStart = true;
      }
    }

    if (foundStart) {
      usercode.push(linetrim);
    }
  }
  return usercode.join('\n');
};

const replaceWholeFunction = function replaceWholeFunction(newcode, usercodeall) {
  const usercode = usercodeall.split('\n');

  if (newcode.indexOf('// REPLACEFUNC') < 0) return usercode;

  // first find name of function to replace
  let funcname = '';
  const newlines = newcode.split('\n');
  for (let i = 0; i < newlines.length; i++) {
    const line = newlines[i];
    if (line.indexOf('// REPLACEFUNC') > 0) {
      funcname = line.substring(0, line.indexOf('function'));
      break;
    }
  }

  if (funcname === '') return usercodeall; // shouldn't happenn

  // then remove the function from usercode
  const userlines = usercode; // .split("\n");
  const userlinesreduced = [];

  let foundStart = false;
  let foundEnd = false;
  let leftPCnt = 0; let rightPCnt = 0;
  // debugger;
  for (let i = 0; i < userlines.length; i++) {
    const userline = userlines[i];
    if (!foundStart && userline.indexOf(funcname) >= 0) {
      foundStart = true;
    }
    let donothing = false;
    if (foundStart && !foundEnd) {
      leftPCnt += userline.split('{').length - 1;
      rightPCnt += userline.split('}').length - 1;
      if (leftPCnt <= rightPCnt) {
        foundEnd = true;
        donothing = true;
      }
    }
    // else if (userline.indexOf("}") === 0) {
    //   foundEnd = true;
    // } else {
    if ((foundStart && !foundEnd) || donothing) {
      // do nothing
    } else {
      // copy
      userlinesreduced.push(userline);
    }
  }
  const newusercode = userlinesreduced.join('\n');

  return insertNewWholeFunction(newcode, newusercode, '// REPLACEFUNC');
};

const findLineInCode = (funcContext, usercode, oldLine1, oldLine2) => {
  // first try to find exact match
  if (typeof (oldLine2) === 'undefined') {
    oldLine2 = '';
  }
  let ctxt = '';
  for (let i = 0; i < usercode.length; i++) {
    // if (i === 0 && oldLine2 === "") {
//    if (i === 0) {
    if (usercode[i].indexOf('function') >= 0) {
      ctxt = getFunctionContext(usercode[i]);
    }
    if (ctxt === funcContext && oldLine1.trim() === usercode[i].trim()) return i;
    // } else {
    //   if (oldLine1.trim() === usercode[i].trim() && oldLine2.trim() === usercode[i-1].trim()) return i;
    // }
  }

  // then find 2 lines with longest common prefix together
  let longest = 0;
  let longestInd = 0;

  ctxt = '';
  for (let i = 0; i < usercode.length; i++) {
    if (usercode[i].indexOf('function') >= 0) {
      ctxt = getFunctionContext(usercode[i]);
    }

    if (ctxt !== funcContext) continue;
    const s1 = sharedStart(oldLine1, usercode[i]);
    let s2 = '';
    if (i > 0 && oldLine2 !== '') {
      s2 = sharedStart(oldLine2, usercode[i - 1]);
    }
    if (((s1.length * 3) + s2.length) > longest) {
      // give prev one line more weight for prefix length
      longest = ((s1.length) * 3) + s2.length; longestInd = i;
    }
  }
  return longestInd;
};

// usercodeall and return value are both continuous
const copyBlockToUserCode = (codeblock, usercodeall) => {
  const lines = codeblock.split('\n');
  if (lines.length === 0) return usercodeall;
  let isFunctionBlock = false;

  if (lines[0].indexOf('function') >= 0 && lines[0].indexOf(' ') !== 0) {
    isFunctionBlock = true;
  }
  if (isFunctionBlock) {
    if (lines[0].indexOf('// INSERTFUNC') >= 0) {
      return insertNewWholeFunction(codeblock, usercodeall, '// INSERTFUNC');
    }
    if (lines[0].indexOf('// REPLACEFUNC') >= 0) {
      return replaceWholeFunction(codeblock, usercodeall);
    }
    // console.log(`possible error in copy code in function block \n ${codeblock}`);
    // return usercode;
  }

  // deal with line by line changes (shouldn't be all new functions any more)

  const newLinesType = [];
  const usercode = usercodeall.split('\n');

     // find in prev element code the start and end line before and after newly inserted lines
  let functionContext = '';
  for (let ni = 0; ni < lines.length; ni++) {
    const newline = lines[ni];
    if (newline.indexOf('function') >= 0) {
      functionContext = getFunctionContext(newline);
    }
    const newLineObj = { lineNo: ni, newInd: ni };
    if (newline.trim().endsWith('// NEW')) {
      newLineObj.lineType = 'INSERT';
    } else if (newline.trim().endsWith('// CHG')) {
      newLineObj.lineType = 'REPLACE';
      newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, '');
    } else {
      newLineObj.lineType = 'SAME';
      if (ni === 0) { newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, ''); } else {
        const pnewLineObj = newLinesType[ni - 1];
        if (pnewLineObj.lineType === 'SAME') {
          const pnewline = lines[ni - 1];
          newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, pnewline);
        } else {
          newLineObj.indInUserCode = findLineInCode(functionContext, usercode, newline, '');
        }
      }
    }
    newLinesType.push(newLineObj);
  }

  // find in prev element code the start and end line before and after newly inserted lines

  // use unchanged lines in user code to serve as anchor
  let superStartLine = ''; // to be used for appending new inserted lines at the beginning
  for (let ni = 0; ni < lines.length; ni++) {
    let newline = lines[ni];
    console.log(`newline is ${newline}`);
    if (newline.indexOf('//') > 0) {
      newline = newline.substring(0, newline.indexOf('//')).trimRight();
      console.log(`newline is after trim: ${newline}`);
    }
    const newLineObj = newLinesType[ni];
    console.log(`newLineObj is ${JSON.stringify(newLineObj)}`);

    if (newLineObj.lineType !== 'SAME') {
      if (newLineObj.lineType === 'REPLACE') {
        usercode[newLineObj.indInUserCode] = newline;
      } else { // must be a new INSERT
        if (ni === 0) {
          // append this to the new "-1" line that is to be prepended to usercode at the end
          // find this line in user code
          superStartLine += `${newline}`;
          newLineObj.indInUserCode = -1;
        } else {
          // find prev line
          const prevNewLineObj = newLinesType[ni - 1];
          usercode[prevNewLineObj.indInUserCode] += `\n${newline}`;
          newLineObj.indInUserCode = prevNewLineObj.indInUserCode;
        }
      }
    }
  }

  if (superStartLine !== '') {
    superStartLine = `${superStartLine}\n`;
  }
  const newusercodeall = `${superStartLine}${usercode.join('\n')}`;
  return newusercodeall;
};

const getHintCode = (code) => {
  const lines = code.split('\n');
  let newcode = "";
  let intodo = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.indexOf("//TODO") === 0) {
      newcode += `\n${lines[i]}\n`;
      intodo = true;
      continue;
    } else if (line.indexOf("//ENDTODO") === 0) {
      intodo = false;
      continue;
    } else {
      if (intodo) {
        if (line.indexOf("//h") === 0 && line.indexOf("::") > 0) {
          // console.log("found hint line " + line);
          const parts = lines[i].split("::");
          const part0parts = parts[0].split("//");
          newcode += `${part0parts[0]}//[${part0parts[1]}]: ${parts[1]}\n`;
          continue;
        } else if (line.indexOf("::") === 0) {
          continue;
        } else {
          newcode += `${lines[i]}\n`;
        }
      }
    }
  }
  return newcode;
};

// new version: simply
const removeHints = (code) => {
  const lines = code.split('\n');
  let newcode = "";
  let intodo = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // console.log("new line " + line);
    if (line.indexOf("//TODO") === 0) {
      newcode += `${lines[i]}\n`;
      intodo = true;
    } else {
      if (line.indexOf("//ENDTODO") === 0) {
        intodo = false;
      } else {
        if (!intodo) {
          newcode += `${lines[i]}\n`;
        } else {
          if (line.indexOf("//h") === 0 || line.indexOf("::") ==0 ) {

          } else {
            newcode += `${lines[i]}\n`;
          }
        }
      }
    }
  }
  return newcode;
};

const removeHintsOld = (code) => {
  const lines = code.split('\n');
  let newcode = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.indexOf("//h") === 0 && line.indexOf("::") > 0) {
      // console.log("found hint line " + line);
      let step = 1;
      let nextLine = lines[i+step];
      while (nextLine.trim().indexOf("::") === 0) {
        // console.log("nextLine is " + nextLine);
        step ++;
        nextLine = lines[i+step];
      }
      // do not auto hide any line now!!
      step --;
      i += step;
    } else {
      newcode += `${lines[i]}\n`;
    }
  }
  return newcode;
};

const getTestCodeSample = (code) => {
  const lines = code.split('\n');
  let codelines = ''; let foundstart = false;
  for (let i = 2; i < lines.length - 2; i++) {
    const line = lines[i].trimRight();
    const line1 = lines[i - 1].trim();
    const line2 = lines[i - 2].trim().replace(' ', '');
    const linen1 = lines[i + 1].trim();
    const linen2 = lines[i + 2].trim();
    if (line1.indexOf('<pre') >= 0 && line2.indexOf('<p>') >= 0) {
      foundstart = true;
    }
    if (foundstart) {
      codelines += `\n${line}`;
      if (linen1.indexOf('</pre>') >= 0 && linen2.indexOf('</p>') >= 0) {
        break;
      }
    }
  }
  return codelines;
};

const insertHiddenCodeCopy = (content) => {
  let newcontent = '';
  let newcode = "<p class='hiddenCode'>\n";
  const lines = content.split('\n');
  let foundstart = false; let foundEnd = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimRight();
    if (i < 2) {
      newcontent += line;
      newcontent += '\n';
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
        if (line.trim().indexOf('//') > 0) // "//" comment is ok if it is starting from line start
        { line = line.substring(0, line.indexOf('//')).trimRight(); }
      }
      newcontent += line;
      newcontent += '\n';
      // codelines += `\n${line}`;
    } else { // before found start, simply copy
      newcontent += line;
      newcontent += '\n';
    }
  }

  newcontent += newcode;
  newcontent += '\n</p>';
  return newcontent;
};


const insertCopyLink = (code) => {
  const lines = code.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line1 = lines[i].trim();
    const line2 = lines[i - 1].trim();
    if (line1.indexOf('</p>') >= 0 && line2.indexOf('</pre>') >= 0) {
      lines[i] += '\n<p style="font-style: italic">[Type code above into robot code editor or click <a href="#" onclick="CopyCodeClicked(event)" class="inlinebutton">Copy</a>]\n</p>';
      break;
    }
  }
  return lines.join('\n');
};


class LessonChatComponent extends React.Component {
  constructor (props) {
    super(props);
    const { scenario } = this.props;
    window.scenario = scenario;
  //   // const { instructionLength, tutorialProgress } = this.props;
  //   // const slideIndex = tutorialProgress * instructionLength;

  //   // this.state = {
  //   //   slideIndex: slideIndex === 0 ? 1 : slideIndex,
  //   //   showHelp: false,
  //   //   listMenu: false,
  //   //   tutorialType: [],
  //   //   tutorialContent: {},
  //   //   scriptLoaded: false
  //   // };
    this.state = {
      isWaitingToGoToNextTutorial: false,
      isGetNextTurorial: false,
      nextScenarioId: null
    };
  }

  componentWillMount() {
    const script0 = document.createElement('script');
    script0.src = '/js/syntaxhighlighter2.js';
    script0.async = false;
    document.body.appendChild(script0);
    const { scenario = {} } = this.props;
    if (scenario._id) {
      this.updateNextScenarioId(scenario._id);
    }
  }

  componentDidMount() {
    const { userChat } = this.props;
    // new WOW().init(); // Wow is animation package for login form
    const that = this;
    window.OKClicked = (e) => { that.OKClicked(e); };
    window.CopyCodeClicked = (e) => { that.CopyCodeClicked(e); };
    window.CopyToClipboard = (e) => { that.CopyToClipboard(e); };

    window.DoneCodingClicked = (e) => { that.DoneCodingClicked(e); };
    window.GoToNextTutorial = (e) => { that.GoToNextTutorial(e); };
    window.GoToTutorialList = (e) => { that.GoToTutorialList(e); };
    window.submitTestResultInChat = (e) => { that.submitTestResultInChat(e); };

    window.ToggleVisibility = (e, id) => { that.ToggleVisibility(e, id); };
    window.ClickToSendChat = (e, textToBeSent) => { that.ClickToSendChat(e, textToBeSent) };

    if (userChat) {
      window.chatId = userChat._id;
      window.userChat = userChat;
    }

    $(document).ready(function() {
      // console.log("in document ready!!" + (typeof $('#inputtext')));
      chatInputSetup = true;
      setTimeout(function() {
        $('#inputtext').keyup((e) => {
          // console.log(`lessonchat 1: ctrl ${e.ctrlKey} code ${e.keyCode}`);
          if (e.keyCode === 13) {
            that.sendChat();
          }
        });
      }, 1000);
    });

    // setTimeout(() => {
    //   $('#inputtext').keydown((e) => {
    //     // console.log(`ctrl ${e.ctrlKey} code ${e.keyCode}`);
    //     if (e.keyCode === 13) {
    //       that.sendChat();
    //     }
    //   });
    // }, 2000);
  }

  componentWillReceiveProps(nextProps) {
    // const { instructionLength, tutorialProgress, tutorial } = nextProps;
    // const tutorialType = Object.keys(tutorial);
    // const slideIndex = tutorialProgress * instructionLength;
    // const tutorialContent = {};

    // for (let i = 0; i < tutorialType.length; i++) {
    //   Object.assign(tutorialContent, { [tutorialType[i]]: false });
    // }
    // this.setState({
    //   slideIndex: slideIndex === 0 ? 1 : slideIndex,
    //   tutorialType,
    //   tutorialContent
    // });
    const { scenario = {} } = this.props;
    const { scenario: nextScenario = {} } = nextProps;
    if (scenario._id !== nextScenario._id) {
      this.updateNextScenarioId(nextScenario._id);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentDidUpdate() {
    const { userChat } = this.props;
    const that = this;
    if (userChat) {
      window.chatId = userChat._id;
      window.userChat = userChat;
      //if (!chatInputSetup) {
        chatInputSetup = true;
        $('#inputtext').unbind("keyup");
        $('#inputtext').keyup((e) => {
          // console.log(`lesson chat 2 ctrl ${e.ctrlKey} code ${e.keyCode}`);
          if (e.keyCode === 13) {
            that.sendChat();
          }
        });
      // }
      // });
    }
  }

  componentWillUnmount() {
    delete window.syntaxhighlighter;
    delete window.OKClicked;
    delete window.CopyCodeClicked;
    delete window.CopyToClipboard;

    delete window.DoneCodingClicked;
    delete window.GoToNextTutorial;
    delete window.GoToTutorialList;
    delete window.submitTestResultInChat;
    delete window.chatId;
    delete window.ToggleVisibility;
    delete window.userChat;
  }


  getTutorialList = (title, tutorial, type) => {
    let liClass = 'menu-all__item';

    if (this.state.tutorialContent[type]) {
      liClass += ' expanded';
    }
    return (
      <li className={liClass} key={type}>
        <div
          role="button"
          tabIndex="0"
          className="tutorial"
          onClick={() => (this.showTutorialContent(type))}
        >
          {title}
          <span className="tg-icon-expand" />
        </div>
        <div
          className={this.state.tutorialContent[type] ? 'animated slideInLeft' : 'animated slideInUp'}
        >
          {this.state.tutorialContent[type] && tutorial[type].map((testcase, index) => (
            <div
              role="button"
              tabIndex="0"
              key={testcase._id}
              className="tutorial-content"
              onClick={() => (this.showListMenu(testcase._id))}
            >
              {index + 1}. {testcase.ScenarioName}
            </div>
          ))}
        </div>
      </li>
    );

    // return (
    //   <li key={type}>
    //     <div className="tutorial">
    //       {title}
    //       <span
    //         className="tg-icon-expand"
    //         onClick={() => (this.showTutorialContent(type))}
    //       />
    //     </div>
    //   </li>
    // );
  }

  showTutorialContent = (type) => {
    const tutorialContent = Object.assign({}, this.state.tutorialContent);
    tutorialContent[type] = !this.state.tutorialContent[type];
    this.setState({ tutorialContent });
  }

  setTestConditionCallback = (successCondition, callback) => {
    const allConditions = ['TestFinishedAnyResult'];
    for (let i = 0; i < allConditions.length; i++) {
      const c = allConditions[i];

      if (c === successCondition) {
        window[c] = callback;
      } else {
        delete window[c];
      }
    }
  }

  // storeUserTestResult = () => {
  //   // add a new user action into chat
  //   const { scenario, userChat, handNewUserChatAction } = this.props;
  //   handNewUserChatAction(userChat._id, scenario._id, "USER_TEST_RESULT", "Test Passed!");
  // }

  submitTestResultInChat = (result) => {


    // don't do it in teacher account!
    if (getUID() != "") return;

    if ('showHeadline' in window.gameSetup.config) {
      window.gameSetup.config.showHeadline(result);
    }

    // add a new user action into chat
    const { scenario, userChat, handNewUserChatAction } = this.props;
    if (!result) return;
    if (result === 'Test passed!') {
      window.testCondition = ''; // so at least the same condition is not tested again
      window.testCodeCondition = '';
      window.testConditionInd = '';
      window.testCodeSample = '';
      result += " Feel free to chat '<b>code</b>' to view my answer code for reference.";

    } else if (result.indexOf('No test specified') >= 0) {
      return; // don't need to do anything
    }
    if (result.indexOf('Please ') === 0 || result.indexOf(`I haven't given the next test yet`) === 0) {
      handNewUserChatAction(userChat._id, 'USER_TEST_RESULT', result);
      return;
    }
    let timeout = 1000;
    let prefix = '';
    if (result.toUpperCase().indexOf('ERROR') >= 0) {
      timeout = 300;
      prefix = '';
    }
    if (result.indexOf('Unexpected identifier') >= 0) {
      result += ' Are you forgetting to close the previous line with ";" or "," ?';
    }
    if (result.indexOf("FAIL") >= 0 || result.indexOf("Test failed") >= 0) {
      result += ` 

Click '?' if you need some help.`;
    }

    setTimeout(() => {
      handNewUserChatAction(userChat._id, 'USER_TEST_RESULT', `${prefix}${result}`);
    }, timeout);
  }

  displayChatContent(chat, index, maxIndex) {
    const { scenario, userChat } = this.props;
    // console.log(`displayChatContent ${JSON.stringify(chat)}`);
    switch (chat.actionType) {
      case 'USER_TEXT': {
        const content = chat.actionContent;
        let className = 'isUser';

        if (chat && chat.sender !== Meteor.userId()) {
          className = '';
        }
          // content = content.replace(/ /g, '&nbsp;');
        // content = content.replace(/\n/g, '<br />');
        // content = content.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        return (
          <div className={`bubble you ${className}`} dangerouslySetInnerHTML={{ __html: content }} />
        );
        // return (
        //   <div className={'bubble you isUser'} >{content}</div>
        // );
      }
      case 'USER_TEST_RESULT': {
        //let content = chat.actionContent.replace(/ /g, '&nbsp;');
        let content = chat.actionContent;
        if (chat.actionContent.indexOf('Test passed!') >= 0) {
          window.testCondition = '';
          window.testConditionInd = '';
          window.testCodeCondition = '';
          window.testCodeSample = '';
        }
        content = `<p>${content}</p>`;
        return (
          <div className={'bubble you'} dangerouslySetInnerHTML={{ __html: content }} />
        );
        // return (
        //   <div>{content}</div>
        // );
      }
      case 'REVEAL_ELEMENT': {
        let elementContent = '';
        let successCondition = '';
        // let codeCondition = '';
        let elementType = '';
        let elementCode = '';
        let elementCodeHidden = true;
        let successConditionInd = '';
        if (!scenario.instructionElements) {
          scenario.instructionElements = [];
        }
        for (let i = 0; i < scenario.instructionElements.length; i += 1) {
          if (scenario.instructionElements[i].elementId === chat.actionContent) {
            elementContent = scenario.instructionElements[i].html;
            elementCode = scenario.instructionElements[i].code;
            elementCodeHidden = scenario.instructionElements[i].codeHidden;
            elementType = scenario.instructionElements[i].elementType;
            successCondition = scenario.instructionElements[i].condition;
            successConditionInd = scenario.instructionElements[i].conditionInd;
            //codeCondition = scenario.instructionElements[i].codecondition;
            break;
          }
        }
        if (elementType === 'Coding') {
          // debugger;
          window.testCodeCondition = '';
          window.testCondition = '';
          window.testConditionInd = '';
          window.testCodeSample = '';
          window.enableTestButton = true;
          if (elementContent !== '' && successCondition !== '') {
            // this.setTestConditionCallback(successCondition, this.storeUserTestResult);
            window.testCondition = successCondition;
            window.testCodeCondition = successCondition;
            window.testConditionInd = successConditionInd;
          }
          if (index === maxIndex) {
            window.TestRunCount = 0;
            window.CodeChangeCount = 0;
          }
        } else {
          window.enableTestButton = true; // always allow testing?
        }

        // if (elementContent !== '' && codeCondition !== '' && elementType === 'Coding') {
        //   window.testCodeCondition = codeCondition;
        //   window.testCodeSample = getTestCodeSample(elementContent);
        // }


        // if (elementContent !== '' && elementContent.indexOf('brush: js') > 0 && (elementType === 'Coding' || elementType === 'Hint')) {
        //   // this section has code, so need to insert a "copy" link automatically
        //   elementContent = insertCopyLink(elementContent);
        //   elementContent = insertHiddenCodeCopy(elementContent);
        // }

        if (elementCodeHidden === false && elementCode) {
          // insert code!
          elementContent += '\n<p><pre class="brush: js; gutter: false;">';
          const cleanCode = removeHints(elementCode);
          elementContent += cleanCode;
          elementContent += '\n</pre>\n</p>';

          // copy doesn't work?
          // elementContent += `<p><a href="#" onclick="CopyToClipboard(event)" class="inlinebutton">Copy Code</a></p>\n`;
        }

        if (elementType === 'Conclusion') {
          elementContent += `\n<p>You have been rewarded ${scenario.coins} <img src="/images/coin.png" style='height: 20px' alt="gold coins" />! </p>`;
          elementContent += '\n<p><a href="#" onclick="GoToTutorialList(event)" class="inlinebutton">Go Back to Tutorial List</a>. </p>';
          window.testCodeCondition = '';
          window.testCondition = '';
          window.testConditionInd = '';
          window.testCodeSample = '';
          window.enableTestButton = true;
        }

        if (Meteor.user().JSLevel !== 'Beginner') {
          // elementContent = removeJSLevelFor(elementContent, 'B');
        } else {
          // ?? need this?
          // elementContent = removeJSLevelFor(elementContent, 'I');
        }

        if (Meteor.user().OKWithScratch !== 1) {
          elementContent = removeScratchExampleFor(elementContent);
        }


        if (scenario.isUserTest) {
          elementContent = `
  <div>
  Welcome to the user test page! Feel free to customize the test script based on the specific scenario you want to test your game bot with. Note that you can still ask me questions in this chat, such as "how to use for-loop?" or "what is function?"
  </div>          
          `;
        }

        return (
          <div className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
        // return (
        //   <div>{elementContent.replace(/ /g, "\u00a0")}</div>
        // );
        // return (
        //   <div data-elementid={chat.actionContent} data-condition={successCondition} className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        // );
      }

      case 'REVEAL_CODE': {
        let elementContent = '';
        let elementCode = '';
        for (let i = 0; i < scenario.instructionElements.length; i += 1) {
          if (scenario.instructionElements[i].elementId === chat.actionContent) {
            elementCode = scenario.instructionElements[i].code;
            break;
          }
        }

        if (elementCode) {
          // insert code!
          debugger;
          elementContent = '<p><pre class="brush: js">';
          elementContent += elementCode;
          elementContent += '\n</pre>\n</p>';
        } else {
          break;
        }

        // debugger;
        return (
          <div data-elementid={chat.actionContent} data-condition={""} className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
      }

      case 'REVEAL_CLEANCODE': {
        let elementContent = '';
        let elementCode = '';
        for (let i = 0; i < scenario.instructionElements.length; i += 1) {
          if (scenario.instructionElements[i].elementId === chat.actionContent) {
            elementCode = scenario.instructionElements[i].cleancode;
            break;
          }
        }

        if (elementCode) {
          // insert code!
          elementContent = '<p>Here is my latest working code for your reference: <br/> <pre class="brush: js">';
          elementContent += elementCode;
          elementContent += '\n</pre>\n</p>';
        } else {
          break;
        }

        // debugger;
        return (
          <div data-elementid={chat.actionContent} data-condition={""} className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
      }

      case 'REVEAL_HINTLIST': {
        let elementContent = '';
        let elementCode = '';
        let elementType = '';
        for (let i = 0; i < scenario.instructionElements.length; i += 1) {
          if (scenario.instructionElements[i].elementId === chat.actionContent) {
            elementCode = scenario.instructionElements[i].code;
            elementType = scenario.instructionElements[i].elementType;
            break;
          }
        }

        if (elementCode) {
          // insert code!
          //elementContent = `<p>Here is a line by line hints for you. Each hint line corresponds to one line of code, and sometimes I provide you a template for the line with some <b>question mark</b> to be replaced. To get more hint on a specific line, type in the hint ID, like <b>h0</b></p>`;
          elementContent = `Here are the top level hints for you. <b>To get more detailed hints on a specific line, click on that line's "hint ID"</b>, such as [<a style="color: blue" href="#" onclick="ClickToSendChat(event, 'h0')" class="inlinebutton">h0</a>] or [<a style="color: blue" href="#" onclick="ClickToSendChat(event, 'h1')" class="inlinebutton">h1</a>].</p>`;
          elementContent += '<p><pre class="brush: js; gutter: false;">';
          const hintCode = getHintCode(elementCode);
          elementContent += hintCode;
          elementContent += '\n</pre>\n</p>';
        } else if (elementType === "Coding") {
          elementContent = `No more hints are available for this specified challenge. Please post your questions in our <a href="https://forum.tgame.ai/c/programminghelp" target="_blank">forum</a>. You can click <img src='/images/testbutton.png' style='width: 40px; height: auto; vertical-align: bottom;'/> to run your code.`;
        } else {
          elementContent = `Hints are linked with specified challenges. At the moment, no challenge is specified. Click <img src='/images/icon-next.png' style='width: 40px; height: auto; vertical-align: bottom;'/> to continue.`;
        }

        // debugger;
        return (
          <div data-elementid={chat.actionContent} data-condition={""} className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
      }


      case 'TBOT_ANSWER': {
        let elementContent = chat.actionContent;
        if (elementContent.indexOf("This tutorial has concluded") === 0) {
          elementContent += '\n<p><a href="#" onclick="GoToTutorialList(event)" class="inlinebutton">Go Back to Tutorial List</a>. </p>';
        } else {
          elementContent = `<p>${elementContent}</p>`;
        }

        // let isHint = false;
        // if (chat.actionContent.indexOf("Please try to add") === 0) {
        //   isHint = true;
        // }
        // if (chat.actionContent.indexOf("OK, so to be more specific") === 0) {
        //   isHint = true;
        // }
        // if (chat.actionContent.indexOf("At a high level you want to") === 0) {
        //   isHint = true;
        // }
        // if (isHint) {
        //   window.TestRunCount = 0;
        //   window.CodeChangeCount = 0;
        // }
        return (
          <div className={'bubble you'} >
            <div dangerouslySetInnerHTML={{ __html: elementContent }} />
            {/* <p>
              type <b>OK</b> to continue.
            </p> */}
          </div>
        );
      }
      case 'TBOT_CLARIFY_QUESTION': {
        const qs = chat.actionContent.trim().split('?');
        let elementContent = '<p>Can you clarify which one is your question?</p><ul>';
        for (let i = 0; i < qs.length; i++) {
          if (qs[i].length > 1) { elementContent += `<li>${qs[i]}</li>`; }
        }
        elementContent += '</ul>';
        return (
          <div className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
      }
      case 'TBOT_CONFUSED': {
        const elementContent = '<p>Sorry can you please clarify your question?</p>';
        return (
          <div className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
      }
      case 'TBOT_ENCOURAGING': {
        const elementContent = '<p>Please double-check your robot code and try "TEST" again.</p>';
        return (
          <div className={'bubble you'} dangerouslySetInnerHTML={{ __html: elementContent }} />
        );
      }
      default:
        return (<div />);
    }
    return (<div />);
  }

  OKClicked = (event) => {
    const e = $(event.srcElement);
    this.editor = $('#inputtext')[0];
    this.editor.value = 'OK';
    this.sendChat();
  }

  GoToTutorialList = (event) => {
    const { history } = this.props;
    history.push('/courses');
  }

  GoToNextTutorial = (event) => {
    const { history } = this.props;
    const { nextScenarioId } = this.state;
    // navigate to next tutoral or back to tutorial list!
    if (nextScenarioId === null && !this.state.isGetNextTurorial) {
      history.push('/courses');
    } else if (this.state.isGetNextTurorial) {
      this.this.setState({
        isWaitingToGoToNextTutorial: true,
      });
    } else {
      history.push(`/buildMyAI/${nextScenarioId}`);
    }
  }

  ToggleVisibility = (event, id) => {
    const e = document.getElementById(id);
    if (e.style.display === 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
  }

  ClickToSendChat = (event, textToBeSent) => {
    this.editor = $('#inputtext')[0];
    this.editor.value = textToBeSent;
    this.sendChat();
  }

  getCodeBlocks = (lines) => {
    const blocks = [];
    let newblock = '';

    let inFunction = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      if (line.trim().indexOf('//') === 0) continue;

      if (inFunction) {
        if (line.indexOf('}') === 0) {
          inFunction = false;
          newblock += line;
          blocks.push(`${newblock}\n`);
          newblock = '';
        } else {
          newblock += line;
          newblock += '\n';
        }
      } else { // not in function
        if (line.indexOf('function') >= 0 && line.indexOf(' ') !== 0) {
          // a new block of code!
          if (newblock !== '') {
            blocks.push(newblock);
            newblock = '';
            inFunction = true;
          }
        }
        newblock += line;
        newblock += '\n';
      }
    }

    if (newblock !== '') {
      blocks.push(newblock);
    }
    return blocks;
  }

  updateNextScenarioId = (scenarioId) => {
    const { isGetNextTurorial } = this.state;
    if (isGetNextTurorial) return;
    this.setState({
      isGetNextTurorial: true
    }, () => {
      Meteor.call('getNextScenarioId', scenarioId, (error, nextScenarioId) => {
        if (!error) {
          this.setState({
            nextScenarioId,
            isGetNextTurorial: false,
          }, () => {
            if (this.state.isWaitingToGoToNextTutorial) {
              this.GoToNextTutorial();
            }
          });
        } else {
          this.setState({
            isGetNextTurorial: false,
          });
        }
      });
    });
  }

  CopyToClipboard = (event) => {
    const { scenario, userChat, initializeUserChat } = this.props;
    const e = $(event.srcElement);
    let div = e.parent().parent();
    div = div.find(".syntaxhighlighter");
    if (document.selection) {
        const range = document.body.createTextRange();
        range.moveToElementText(div);
        range.select().createTextRange();
        document.execCommand("copy");
    } else if (window.getSelection) {
        const range = document.createRange();
        range.selectNode(div[0]);
        window.getSelection().addRange(range);
        document.execCommand("copy");
        alert("text copied");
    }
  }

  CopyCodeClicked = (event) => {
    const { scenario, userChat, initializeUserChat } = this.props;
    const e = $(event.srcElement);
    const div = e.parent().parent();
    const elementId = div.attr('data-elementid');
    const robotCodeEditor = window.robotCodeEditor;

    const newcode = div.find('.hiddenCode').text().split('\n');
    let usercodeall = robotCodeEditor.codeMirror.getValue();

    // first cut new code into blocks of functions or global variables
    // then deal with each block individually

    const codeblocks = this.getCodeBlocks(newcode);

    // debugger;
    for (let j = 0; j < codeblocks.length; j++) {
      usercodeall = copyBlockToUserCode(codeblocks[j], usercodeall);
    }

    // const usercodeall = usercode.join("\n");

    robotCodeEditor.codeMirror.setValue(usercodeall);
    if (window.handleNewRobotCodeChange) {
      window.handleNewRobotCodeChange(usercodeall);
    }
  }

  // CopyCodeClickedNewOld = (event) => {
  //   const { scenario, userChat, initializeUserChat } = this.props;
  //   const e = $(event.srcElement);
  //   const div = e.parent().parent();
  //   const elementId = div.attr("data-elementid");
  //   const robotCodeEditor = window.robotCodeEditor;

  //   // first check if all code is NEW
  //   //const codediv = div.find(".code");
  //   //const newcode = this.getAllCode(codediv, false).split("\n");
  //   // debugger;
  //   const newcode = div.find(".hiddenCode").text().split("\n");
  //   const usercode = robotCodeEditor.codeMirror.getValue().split("\n");

  //   const newLinesType = [];

  //   // find in prev element code the start and end line before and after newly inserted lines
  //   let newLineCount = 0;
  //   for (let ni=0; ni < newcode.length; ni++) {
  //     const newline = newcode[ni];
  //     const newLineObj = { lineNo: ni, newInd: ni };
  //     if (newline.trim().endsWith("// NEW")) {
  //       newLineObj.lineType = "INSERT";
  //       newLineCount ++;
  //     } else if (newline.trim().endsWith("// CHG")) {
  //       newLineObj.lineType = "REPLACE";
  //     } else {
  //       newLineObj.lineType = "SAME";
  //       if (ni ==0)
  //         newLineObj.indInUserCode =  findLineInCode(usercode, newline, "");
  //       else {
  //         const pnewLineObj = newLinesType[ni-1];
  //         if (pnewLineObj.lineType === "SAME") {
  //           const pnewline = newcode[ni-1];
  //           newLineObj.indInUserCode =  findLineInCode(usercode, newline, pnewline);
  //         } else {
  //           newLineObj.indInUserCode =  findLineInCode(usercode, newline, "");
  //         }
  //       }
  //     }
  //     newLinesType.push(newLineObj);
  //   }

  //   if (newLineCount === newcode.length) {
  //     // all lines are new, so simply append to existing robot code
  //     let newcodeTrim = "";
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       let newline = newcode[ni];
  //       if (newline.indexOf("//") > 0) {
  //         newline = newline.substring(0, newline.indexOf("//")).trimRight();
  //       }
  //       newcodeTrim += `\n${newline}`;
  //     }
  //     const finalnewcode = `${robotCodeEditor.codeMirror.getValue()}\n${newcodeTrim}`;
  //     robotCodeEditor.codeMirror.setValue(finalnewcode);
  //     if (window.handleNewRobotCodeChange) {
  //       window.handleNewRobotCodeChange(finalnewcode);
  //     }
  //   } else {
  //     // use unchanged lines in user code to serve as anchor
  //     let superStartLine = ""; // to be used for appending new inserted lines at the beginning
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       let newline = newcode[ni];
  //       if (newline.indexOf("//") > 0) {
  //         newline = newline.substring(0, newline.indexOf("//")).trimRight();
  //       }
  //       const newLineObj = newLinesType[ni];
  //       if (newLineObj.lineType !== "SAME") {
  //         if (newLineObj.lineType === "REPLACE") {
  //           usercode[newLineObj.indInUserCode] = newline;
  //         } else { // must be a new INSERT
  //           if (ni === 0) {
  //             // append this to the new "-1" line that is to be prepended to usercode at the end
  //             // find this line in user code
  //             superStartLine += `${newline}`;
  //             newLineObj.indInUserCode = -1;
  //           } else {
  //             // find prev line
  //             const prevNewLineObj = newLinesType[ni-1];
  //             usercode[prevNewLineObj.indInUserCode] += `\n${newline}`;
  //             newLineObj.indInUserCode = prevNewLineObj.indInUserCode;
  //           }
  //         }
  //       }
  //     }

  //     if (superStartLine !== "") {
  //       superStartLine = `${superStartLine}\n`;
  //     }
  //     let newusercodeall = `${superStartLine}${usercode.join("\n")}`;

  //     newusercodeall = insertNewWholeFunction(newcode, newusercodeall, "// INSERTFUNC");

  //     newusercodeall = replaceWholeFunction(newcode, newusercodeall);

  //     robotCodeEditor.codeMirror.setValue(newusercodeall);
  //   }
  // }

  // CopyCodeClickedOld = (event) => {
  //   const { scenario, userChat, initializeUserChat } = this.props;
  //   const e = $(event.srcElement);
  //   const div = e.parent().parent();
  //   const elementId = div.attr("data-elementid");
  //   // here we assume whenever there is robot code given in tutorial, then condition is not empty for testing!
  //   const alldivs = div.parent().parent().parent().parent().find("div.row").find('[data-condition]').find(".code");
  //   // debugger;

  //   const robotCodeEditor = window.robotCodeEditor;

  //   let prevInd = -1;
  //   for (let j=0; j<alldivs.length; j++) {
  //     const eid = $(alldivs[j]).closest("[data-elementid]").attr("data-elementid");
  //     //const codediv = alldivs[j].find("");
  //     if (eid === elementId) {
  //       prevInd = j - 1;
  //       break;
  //     }
  //   }

  //   if (prevInd < 0) {
  //     // current element is first code element so just append everything
  //     const codediv = div.find(".code");
  //     const newcode = this.getAllCode(codediv, true);
  //     console.log("all code is " + newcode);

  //     robotCodeEditor.codeMirror.setValue(`${robotCodeEditor.codeMirror.getValue()}\n\n${newcode}`);
  //     if (window.handleNewRobotCodeChange) {
  //       window.handleNewRobotCodeChange(newcode);
  //     }

  //   } else {
  //     const prevDiv = $(alldivs[prevInd]).closest("[data-elementid]").find(".code");
  //     const oldcode = this.getAllCode(prevDiv, true).split("\n");
  //     const codediv = div.find(".code");
  //     const newcode = this.getAllCode(codediv, false).split("\n");
  //     const usercode = robotCodeEditor.codeMirror.getValue().split("\n");
  //     /*
  //       I.  first, mark each line of new code to be "SAME", "REPLACE" or "INSERT", using comment I added!

  //       II. for each new line
  //           1. if REPLACE, then find the line in user code that's most similar and replace it
  //           2. if INSERT, then look at prev line
  //             a. if prev line is SAME, then look for that line in user code
  //             b. if prev line is "REPLACE", then use that line's replaced line as anchor and insert below it
  //     */

  //     const newLinesType = [];

  //     // find in prev element code the start and end line before and after newly inserted lines
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       const newline = newcode[ni];
  //       const newLineObj = { lineNo: ni, newInd: ni };
  //       if (newline.trim().endsWith("// NEW")) {
  //         newLineObj.lineType = "INSERT";
  //       } else if (newline.trim().endsWith("// CHG")) {
  //         newLineObj.lineType = "REPLACE";
  //       } else {
  //         newLineObj.lineType = "SAME";
  //         for (let oi=0; oi < oldcode.length; oi++) {
  //           const oldline = oldcode[oi];
  //           if (newline.trim() === oldline.trim()) {
  //             newLineObj.oldInd = oi;
  //             break;
  //           }
  //         }
  //       }
  //       newLinesType.push(newLineObj);
  //     }

  //     // debugger;

  //     let superStartLine = ""; // to be used for appending new inserted lines at the beginning
  //     for (let ni=0; ni < newcode.length; ni++) {
  //       let newline = newcode[ni];
  //       if (newline.indexOf("//") > 0) {
  //         newline = newline.substring(0, newline.indexOf("//"));
  //       }
  //       const newLineObj = newLinesType[ni];
  //       if (newLineObj.lineType !== "SAME") {
  //         if (newLineObj.lineType === "REPLACE") {
  //           if (ni === 0) {
  //             // replace first line
  //             // find this line in user code
  //             const indInUserCode = findLineInCode(usercode, oldcode[0], "");
  //             usercode[indInUserCode] = newline;
  //             newLineObj.indInUserCode = indInUserCode;
  //           } else {
  //             // find prev line
  //             const prevNewLineObj = newLinesType[ni-1];
  //             if (prevNewLineObj.lineType === "SAME") {
  //               // find that line in user code and replace next line
  //               const indInUserCode = findLineInCode(usercode, oldcode[prevNewLineObj.oldInd], oldcode[prevNewLineObj.oldInd-1]);
  //               usercode[indInUserCode+1] = newline;
  //               newLineObj.indInUserCode = indInUserCode+1;
  //             } else if (prevNewLineObj.lineType === "REPLACE") {
  //               const insertInd = prevNewLineObj.indInUserCode;
  //               usercode[insertInd] += `\n${newline}`; // simply append to it so we don't change line ordering
  //               newLineObj.indInUserCode = insertInd;
  //             } else { // prev line is an INSERT
  //               const indInUserCode = prevNewLineObj.indInUserCode;
  //               usercode[indInUserCode+1] = newline;
  //               newLineObj.indInUserCode = indInUserCode+1;
  //             }
  //           }
  //         } else { // must be a new INSERT
  //           if (ni === 0) {
  //             // append this to the new "-1" line that is to be prepended to usercode at the end
  //             // find this line in user code
  //             const indInUserCode = findLineInCode(usercode, oldcode[0], "");
  //             superStartLine += `${newline}`;
  //             newLineObj.indInUserCode = -1;
  //           } else {
  //             // find prev line
  //             const prevNewLineObj = newLinesType[ni-1];
  //             if (prevNewLineObj.lineType === "SAME") {
  //               // find that line in user code and append to it
  //               const indInUserCode = findLineInCode(usercode, oldcode[prevNewLineObj.oldInd], oldcode[prevNewLineObj.oldInd-1]);
  //               usercode[indInUserCode] += `\n${newline}`;
  //               newLineObj.indInUserCode = indInUserCode;
  //             } else if (prevNewLineObj.lineType === "REPLACE") {
  //               const insertInd = prevNewLineObj.indInUserCode;
  //               usercode[insertInd] += `\n${newline}`; // simply append to it so we don't change line ordering
  //               newLineObj.indInUserCode = insertInd;
  //             } else { // prev line is an INSERT
  //               const indInUserCode = prevNewLineObj.indInUserCode;
  //               usercode[indInUserCode] += `\n${newline}`;
  //               newLineObj.indInUserCode = indInUserCode;
  //             }
  //           }
  //         }
  //       }
  //     }

  //     if (superStartLine !== "") {
  //       superStartLine = `${superStartLine}\n`;
  //     }
  //     const newusercodeall = `${superStartLine}${usercode.join("\n")}`;

  //     robotCodeEditor.codeMirror.setValue(newusercodeall);
  //   }

  //   //console.log("all old code is " + alloldcode);
  //   // do insert for new code lines, but will not insert if there has been a line with same first 3 words
  //   //this.insertCodeIntoRobotCodeEditor(alloldcode);

  //   // this.checkCodeCopyResult();
  // }

  getAllCode = (codediv, removeComment) => {
    const lines = codediv.find('.container').find('div');
    let allcode = '';
    for (let j = 0; j < lines.length; j++) {
      let line = $(lines[j]).text();
      if (line.trim().substring(0, 2) !== '//') {
        let end = line.length;
        if (line.indexOf('//') > 0 && removeComment) end = line.indexOf('//');
        line = line.substring(0, end).trimRight();
        allcode += line;
        if (j < lines.length - 1) {
          allcode += '\n';
        }
      }
    }
    return allcode;
  }
  // need to make sure we don't remove any existing user code, but only insert if missing
  insertCodeIntoRobotCodeEditor = (code) => {
    // get codemirror
    const robotCodeEditor = window.robotCodeEditor;
    const oldCode = robotCodeEditor.codeMirror.getValue();
    // debugger;
    robotCodeEditor.codeMirror.setValue(code);
  }

  checkCodeCopyResult = () => {

  }

  sendChat() {
    const { scenario, userChat, handNewUserChatAction } = this.props;
    let lintError = "";
    const that = this;
    this.editor = $('#inputtext')[0];
    const txt = this.editor.value;
    if (txt.trim() === '') return;
    // console.log("clear editor value");
    this.editor.value = '';

    if (window.robotCodeEditor && window.robotCodeEditor.codeMirror.state.lint) {
      if (window.robotCodeEditor.codeMirror.state.lint.marked.length > 0) {
        //lintError = window.robotCodeEditor.codeMirror.state.lint.marked[0].lines[0].markedSpans[0].marker.__annotation.message;
        const annotation = window.robotCodeEditor.codeMirror.state.lint.marked[0].__annotation;
        lintError = `${annotation.from.line}:${annotation.message}`;
      }
    }

    handNewUserChatAction(userChat._id, 'USER_TEXT', txt, lintError, window.TestRunCount, window.CodeChangeCount);

    // just in case the first time it didn't hook up
    // $('#inputtext').keydown((e) => {
    //   // console.log(`ctrl ${e.ctrlKey} code ${e.keyCode}`);
    //   // if (e.ctrlKey && e.keyCode === 13) {
    //   if (e.keyCode === 13) {
    //     // Ctrl-Enter pressed
    //     that.sendChat();
    //   }
    // });
  }

  renderListMenu = () => {
    const { tutorial } = this.props;
    const { tutorialType } = this.state;
    const title = ['Basic Tutorials', 'Intermediate Tutorials'];

    return (
      <div
        className={this.state.listMenu ? 'buildmyAI__lessons__list_menu animated fadeInLeft' : 'buildmyAI__lessons__list_menu'}
      >
        <ul className="menu-all">
          {tutorialType.map((type, index) =>
            this.getTutorialList(title[index], tutorial, type)
          )}
        </ul>
      </div>
    );
  }

  askForHint() {
    $('#inputtext')[0].value = 'hint';
    this.sendChat();
  }

  nextTutorialElement() {
    $('#inputtext')[0].value = 'next';
    this.sendChat();
  }

  setLabel = (chat) => {
    const { users } = this.props;

    if (chat.actionType !== 'USER_TEXT') {
      return (
        <div className="chatHistory__List__Item__Line__User">
          <img src="/images/userRobotChat.jpg" alt="user Chat" width="40px"/>
          <span>TBot</span>
        </div>
      );
    }
    let avatar = '/img_v2/ProfileIcon.png';
    let username = 'You';

    if (chat.sender === Meteor.userId() && Meteor.user().avatar) {
      avatar = Meteor.user().avatar.url;
    } else if (chat.sender !== Meteor.userId()) {
      const otherUser = users.find(user => user._id === chat.sender);

      if (otherUser) {
        username = otherUser.username;

        if (otherUser.avatar) {
          avatar = otherUser.avatar.url;
        }
      }
    }
    return (
      <div className="chatHistory__List__Item__Line__User">
        <img src={avatar} alt="user Chat" width="40px"/>
        <span>{username}</span>
      </div>
    );
  };

  renderChat () {
    const { scenario, userChat, initializeUserChat, initializeUserChatUser, users } = this.props;
    const checkMobile = isMobile.tablet || isMobile.phone;
    setTimeout(() => {
      if (window.syntaxhighlighter) {
        // debugger;
        window.syntaxhighlighter.highlight();
      }
      const element = document.getElementById('chatHistoryScroll');
      if (element) {
          // debugger;
        const trs = $(element).find('div.topLevelTR');
        if (trs.length > 0) {
          if (trs.length === 1) {
            const lastHeight = trs.last().height();
            // console.log(`last element height ${lastHeight} vs total scroll height ${element.scrollHeight}`);
              // element.scrollTop = element.scrollHeight - 300;
            element.scrollTop = element.scrollHeight - lastHeight - 20;
          } else {
            const lastHeight = trs.last().height();
            const lastHeight2 = $(trs[trs.length - 2]).height();
            // debugger;
            if (lastHeight2 < 81 && lastHeight >= 150) {
              element.scrollTop = element.scrollHeight - lastHeight - lastHeight2 - 30;
            } else {
              element.scrollTop = element.scrollHeight - lastHeight - 20;
            }
          }
        }
      }
    }, 300);

    if (userChat) {
      const maxIndex = userChat.chats.length - 1;

      return (
        <div className="chatHistoryBlock">
          <ReactTooltip />
          <div className="chatHistoryTitle ">Chat history</div>
          <div className={`chatHistoryScroll ${checkMobile && 'chatHistoryScroll--responsive'}`} id="chatHistoryScroll">
            <div className="chatHistory">
              <div className="chatHistory__List">
                {
                  userChat.chats.map(
                    (chat, index) => {
                      let className = chat.actionType;

                      if (chat.actionType === 'USER_TEXT' && chat.sender !== Meteor.userId()) {
                        className = `${className} otherUser`;
                      }
                      return (
                        // eslint-disable-next-line
                        <div
                          className={`chatHistory__List__Item ${chat.actionType} topLevelTR`}
                          // eslint-disable-next-line
                          key={`tr-${index}`}
                        >
                          <div key={`td-${chat.actionType} ${chat.createdAt}`}>
                            <div
                              key={`div-${chat.actionType} ${chat.createdAt}`}
                              className={`chatHistory__List__Item__Line chatHistory__List__Item__Line--${className}`}
                            >
                              {this.setLabel(chat)}
                              <div className="chatHistory__List__Item__Line__Content">
                                {this.displayChatContent(chat, index, maxIndex)}
                              </div>
                            </div>
                          </div>
                          <time>
                            {(getTimeStr(chat.createdAt))}
                          </time>
                        </div>
                      );
                    }
                  )
                }
              </div>
            </div>
          </div>
          <div id="chatHistoryAction">
            <div className="chatHistoryForm">
              <textarea id="inputtext" placeholder="Type here ..." />
              <button
                className="btn sendChatButton"
                onClick={this.sendChat.bind(this)}
              >Send</button>
              <button
                className="btn sendChatButton"
                onClick={this.nextTutorialElement.bind(this)}
              >Next</button>
              <button
                className="btn sendChatButton"
                style={ {backgroundColor: 'green'}}
                onClick={this.askForHint.bind(this)}
              >?</button>
            </div>
          </div>
        </div>
      );


    } else {


      if (scenario.isUserTest) {
        initializeUserChatUser(scenario._id);
      }  else {
        initializeUserChat(scenario._id);
      }

      // debugger;
      if (scenario.applyBaselineCode) {

        // const resetCode = () => {
        //   if (window.robotCodeEditor && window.robotCodeEditor.codeMirror) {
        //     window.robotCodeEditor.codeMirror.setValue(scenario.baselineCode);
        //   } else {
        //     setTimeout(resetCode, 200);
        //   }
        // };
        // setTimeout(resetCode, 200);

        // const chg = this.getPatch("", scenario.baselineCode);
        // saveRobotCodeReset(scenario.gameId, { time: new Date().getTime(), label: '', chg }, window.chatId, "");
        // saveTestingCode(scenario.gameId, scenario._id, { time: new Date().getTime(), label: '', chg });
        // this.props.RobotCode = chg;
      }
    }


    return (<div>Chat History</div>);
  }
  render() {
    return this.renderChat();

    /* return (
      <div className="buildmyAI__lessons">
        {this.state.listMenu ? this.renderListMenu() : this.renderChat() }
        <Script
          url="https://cloud.tinymce.com/stable/tinymce.min.js"
          onError={() => { this.handleScriptError(); }}
          onLoad={() => { this.handleScriptLoad(); }}
        />
      </div>
    ); */
  }
}
export default LessonChatComponent;
