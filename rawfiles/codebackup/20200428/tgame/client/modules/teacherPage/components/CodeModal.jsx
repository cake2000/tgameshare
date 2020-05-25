import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import CodeMirror from 'react-codemirror';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import moment from 'moment';
import DiffMatchPatch from 'meteor/gampleman:diff-match-patch';
//import DMP from 'meteor/gampleman:diff-match-patch';
// import '../../../../node_modules/codemirror/addon/merge/merge.css';
// import '../../../../node_modules/codemirror/addon/merge/merge.js';
import {
  TUTORIAL_STATEMENT, PREDEFINED_ANSWER_POOL_19, PREDEFINED_ANSWER_POOL_20,
  PREDEFINED_ANSWER_TANK_26, PREDEFINED_ANSWER_TANK_27, PREDEFINED_ANSWER_TANK_28, PREDEFINED_ANSWER_TANK_29
} from '../../../../lib/const';
import { get_quick_answer } from '../../lessonpage/components/sharedlib';
const beautify = require('js-beautify').js_beautify;

import "../lib/codemirror.css";
import "../addon/merge/merge.css";
// import "../addon/merge/merge.js";
import "../lib/codemirror.js";
{/* <script src="../mode/xml/xml.js"></script>
<script src="../mode/css/css.js"></script>
<script src="../mode/javascript/javascript.js"></script>
<script src="../mode/htmlmixed/htmlmixed.js"></script> */}
//<script src="https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js"></script>

// import "../addon/merge/merge.js";

const getFunctionContext = (line) => {
  let functionContext = line.substring(0, line.indexOf('=')).trim();
  if (functionContext.indexOf('var') == 0) {
    functionContext = functionContext.substring(4).trim();
  }
  return functionContext;
};

function replaceAll(str, find, replace) {
  if (!str) return "undefined";
  return str.replace(new RegExp(find, 'g'), replace);
}


let functionList = [];

const combineCode = function(newCode, oldCode) {
  oldCode = oldCode ? oldCode : "";
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_POOL_19") >= 0) {
    oldCode = PREDEFINED_ANSWER_POOL_19;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_POOL_20") >= 0) {
    oldCode = PREDEFINED_ANSWER_POOL_20;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_26") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_26;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_27") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_27;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_28") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_28;
  }
  if (oldCode.indexOf("USE_PREDEFINED_ANSWER_TANK_29") >= 0) {
    oldCode = PREDEFINED_ANSWER_TANK_29;
  }

  let finalCode = newCode + "\n\n";
  const newBlocks = getCodeBlocks(newCode);
  const newFunctionList = Object.keys(newBlocks);
  const oldBlocks = getCodeBlocks(oldCode);
  const oldFunctionList = Object.keys(oldBlocks);
  for(let k=0; k<oldFunctionList.length; k++) {
    const f = oldFunctionList[k]
    if (!newFunctionList.includes(f)) {
      const codelist = oldBlocks[f];
      for (let j=0; j<codelist.length; j++) {
        finalCode += codelist[j].code + "\n\n";
      }
    }
  }
  const prettier = beautify(finalCode, { indent_size: 2, jslint_happy: true });
  return prettier;
}

const getFunctionName = (line) => {
  if (line.indexOf("function") >= 0) {
    let s = line.substring(line.indexOf("function") + 8);
    s = s.substring(0, s.indexOf("(")).trim();
    return s;
  }
  return 'noFuncName';
};

function addToBlock(blocks, funcName, codeStr, lineNum) {
  if (!(funcName in blocks)) {
    blocks[funcName] = [];
  }
  const info = {
    line: lineNum,
    code: codeStr
  };
  blocks[funcName].push(info);
}

const cleanUpComment = (userCode, removeIndent) => {
  const lines = userCode.split("\n");
  const outlines = [];
  let inComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inComment) {
      let stop = line.length;
      if (line.indexOf("*/") >= 0) {
        inComment = false;
        stop = line.indexOf("*/") + 2;
      }
      let newline = "";
      for (let k=0; k<stop; k++) {
        newline += " ";
      }
      newline += line.substring(stop);
      outlines.push(newline);
      continue;
    } else {
      if (line.indexOf("/*") >= 0) {
        inComment = true;
        let start = line.indexOf("/*");
        let stop = line.length;
        if (line.indexOf("*/") >= 0) {
          inComment = false;
          stop = line.indexOf("*/")+2;
        }
        let newline = line.substring(0, start);
        for (let k=start; k<stop; k++) {
          newline += " ";
        }
        newline += line.substring(stop);
        outlines.push(newline);
        continue;
      }
      if (line.indexOf('//') >= 0) {
        let start = line.indexOf("//");
        let newline = line.substring(0, start);
        for (let k=start+1; k<=line.length-1; k++) {
          newline += " ";
        }
        outlines.push(newline);
      } else {
        outlines.push(line);
      }
    }
  }
  if (removeIndent) {
    for (let k=0; k<outlines.length; k++) {
      outlines[k] = outlines[k].trim();
    }
  }
  return outlines.join("\n");
};




const getCodeBlocks = (code) => {
  const lines = cleanUpComment(code).split('\n');
  const blocks = {};
  let newblock = '';

  let inFunction = false;
  let funcName = '';
  let funcBegin = 0;
  let leftBCount = 0;
  let rightBCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // if (line.trim() === '') continue;
    // if (line.trim().indexOf('//') == 0) continue;

    if (inFunction) {
      if (line.indexOf('}') === 0 && leftBCount == rightBCount + 1) {
        inFunction = false;
        newblock += line;
        addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
        funcName = '';
        newblock = '';
        leftBCount = 0;
        rightBCount = 0;
      } else {
        newblock += line;
        newblock += '\n';
        leftBCount += line.split("{").length - 1;
        rightBCount += line.split("}").length - 1;
      }
    } else { // not in function
      if (line.indexOf('function') == 0 ||  (  line.indexOf('async') == 0 && line.indexOf('function') > line.indexOf('async') ) ) {
        // a new block of code!
        if (newblock !== '') {
          addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
          newblock = '';
        }
        inFunction = true;
        funcName = getFunctionName(line);
        funcBegin = i;
        leftBCount = line.split("{").length - 1;
        rightBCount = line.split("}").length - 1;
      }
      newblock += line;
      newblock += '\n';
    }
  }

  if (newblock.trim() !== '') {
    addToBlock(blocks, funcName, `${newblock}\n`, funcBegin);
  }
  if ('' in blocks && blocks[''].length > 0) {
    let outside = '';
    blocks[''].forEach((c) => { outside += c.code; });
    outside = replaceAll(outside, "\n", "").trim();
    if (outside != "") {
      blocks[''] = {
        line: blocks[''][0].line,
        code: [outside]
      };
    } else {
      delete blocks[''];
    }
  }
  return blocks;
};

var value, orig1, orig2, dv, panes = 2, highlight = true, connect = "align", collapse = false;
function initUI() {
  var target = document.getElementById("view");
  if (!target) return;

  // window.diff_match_patch =  DiffMatchPatch;
  window.dmp = DiffMatchPatch.DiffMatchPatch;
  
  require("../addon/merge/merge.js");
  // const CodeMirror = require('../../../../node_modules/codemirror/addon/merge/merge.js');
  const CodeMirror = require("../lib/codemirror.js");
  value = `
function ss(dd) {
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
}
function add(m, n) {
  return m+n;
}  
function ss(dd) {
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
}
`;
  orig2 = `
function ss(dd) {
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
}
function add2(m, n) {
  return m-n;
}
function ss(dd) {
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
  return dd*2;
}
`;
  target.innerHTML = "";
  dv = CodeMirror.MergeView(target, {
    value: window.studentCode,
    origLeft: null,
    orig: window.answerCode,
    lineNumbers: true,
    revertButtons: false,
    mode: "text/html",
    highlightDifferences: true,
    // ignoreWhitespace: true,
    connect: true,
    collapseIdentical: 3
  });
}

let RevealRef = null;
var gotoUserCurrentSlide = (slideContent, slideId) => {
  if (!RevealRef) return;
  window.currentSlideID = slideId;
  for (let k=0; k < slideContent.slideInfo.length; k++) {
    const slide = slideContent.slideInfo[k];
    if (slide.ID == slideId) {
      
      // debugger;
      const actualSlide = RevealRef.getIndices();
      if (actualSlide.v == Number(k) && !forceUpdate) return;
      // console.log("going to slide " + k + " from actual " + JSON.stringify(actualSlide) + ": " + slideId);
      RevealRef.slide(0, k, 100);
      return;
    }
  }
};

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '1200px',
    width: '80%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '0px',
    display: 'flex',
    alignItems: 'center',
  }
};

export default class CodeModal extends Component {

  state = {
    error: null,
    success: '',
    isLoading: false
  };

  closeModal = () => {
    const { hideCode } = this.props;

    this.setState({
      error: null,
      success: '',
      isLoading: false
    });
    hideCode();
  };

  

  handleInput = (e) => {
    if (e.target.validationMessage.length > 0) {
      this.setState({ error: e.target.validationMessage });
    } else {
      this.setState({ error: null });
    }
  };

  componentDidMount() {
    const { showModal, selectedSlideId, slideFileId, slideContent } = this.props;
  }

  componentDidUpdate() {
    
  }


  getRobotCodeAnswer() {
    const { lesson, ul, slideContent, isProfessionalUser, ReleaseLabels } = this.props;
    const userLesson = ul;
    // if (slide.TYPE.toLowerCase() != "coding") return "";
    // const log2 = userLesson.slideVisitLog.find(e => (e.slideId == userLesson.currentSlideId));
    // const log = userLesson.slideVisitLog.find(e => (e.slideNode == log2.slideNode));
    const slide = slideContent.slideInfo.find(e => (e.ID == userLesson.currentSlideId));
    if (slide.ANSWERCODE) {

      if (slide.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_POOL_19") >= 0) {
        return PREDEFINED_ANSWER_POOL_19;
      }
      if (slide.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_POOL_20") >= 0) {
        return PREDEFINED_ANSWER_POOL_20;
      }
      if (slide.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_26") >= 0) {
        return PREDEFINED_ANSWER_TANK_26;
      }
      if (slide.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_27") >= 0) {
        return PREDEFINED_ANSWER_TANK_27;
      }
      if (slide.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_28") >= 0) {
        return PREDEFINED_ANSWER_TANK_28;
      }
      if (slide.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_29") >= 0) {
        return PREDEFINED_ANSWER_TANK_29;
      }

      return combineCode(slide.ANSWERCODE, slideContent.slideInfo[0].ANSWERCODE);
    }


    // see if any clean robot code from any previous slide
    let isBeforeCurrent = false;
    for (let k=slideContent.slideInfo.length-1; k >= 0; k--) {
      const s = slideContent.slideInfo[k];
      if (s.ID == userLesson.currentSlideId) {
        isBeforeCurrent = true;
      }
      if (!isBeforeCurrent) continue;
      if (s.ANSWERCODE) {
        if (s.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_POOL_19") >= 0) {
          return combineCode(PREDEFINED_ANSWER_POOL_19, slideContent.slideInfo[0].ANSWERCODE);
        }
        if (s.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_POOL_20") >= 0) {
          return combineCode(PREDEFINED_ANSWER_POOL_20, slideContent.slideInfo[0].ANSWERCODE);
        }
        if (s.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_26") >= 0) {
          return combineCode(PREDEFINED_ANSWER_TANK_26, slideContent.slideInfo[0].ANSWERCODE);
        }
        if (s.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_27") >= 0) {
          return combineCode(PREDEFINED_ANSWER_TANK_27, slideContent.slideInfo[0].ANSWERCODE);
        }
        if (s.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_28") >= 0) {
          return combineCode(PREDEFINED_ANSWER_TANK_28, slideContent.slideInfo[0].ANSWERCODE);
        }
        if (s.ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_29") >= 0) {
          return combineCode(PREDEFINED_ANSWER_TANK_29, slideContent.slideInfo[0].ANSWERCODE);
        }
        return combineCode(s.ANSWERCODE, slideContent.slideInfo[0].ANSWERCODE);
      }
      // if (s.ROBOTCODE) return s.ROBOTCODE;
    }

    // no robot code found??
    return slideContent.slideInfo[0].ANSWERCODE ? (slideContent.slideInfo[0].ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_POOL_19") >= 0 ? PREDEFINED_ANSWER_POOL_19 : (slideContent.slideInfo[0].ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_POOL_20") >= 0 ? PREDEFINED_ANSWER_POOL_20 : (slideContent.slideInfo[0].ANSWERCODE.indexOf("USE_PREDEFINED_ANSWER_TANK_26") >= 0 ? PREDEFINED_ANSWER_TANK_26 : slideContent.slideInfo[0].ANSWERCODE ) ) ) : slideContent.slideInfo[0].ROBOTCODE;
  }

  getQuickAnswer(slide) {
    let origAnswer = get_quick_answer(slide.QUICKQUESTION);
    const p = origAnswer.split("\n");
    let answer = "";
    let inAnswerCode = false;
    for (let k=0; k<p.length; k++) {
      const line = p[k];
      if (!inAnswerCode) {
        if (line.indexOf("______________") >= 0) {
          inAnswerCode = true;
          continue;
        }
      } else {
        if (line.indexOf("______________") >= 0) {
          break;
        } else {
          if (line == "") continue;
          answer += line + "\n";
        }
      }
    }
    return answer;
  }

  render() {
    const { ul, showModal, selectedSlideId, slideFileId, slideContent, student, selectedAttemptIndex } = this.props;
    const { error, isLoading, success } = this.state;
    // let slideTitle = "- "
    // for (let j=0; j<slideContent.slideInfo.length; j++) {
    //   if (slideContent.slideInfo[j].ID == selectedSlideId) {
    //     slideTitle = slideContent.slideInfo[j].TITLE;
    //     break;
    //   }
    // }

    let slideCode = "- ";
    let slideType = "coding";
    let slide = null;
    for (let j=0; j<slideContent.slideInfo.length; j++) {
      if (slideContent.slideInfo[j].ID == selectedSlideId) {
        slideCode = slideContent.slideInfo[j].ANSWERCODE;
        slideType = slideContent.slideInfo[j].TYPE;
        slide = slideContent.slideInfo[j];
        break;
      }
    }

    if (selectedSlideId == "" || !showModal) {
      return (<div > </div>);
    }
    const log = ul.slideVisitLog.find(e => (e.slideId == selectedSlideId));

    const att = log.attempt[selectedAttemptIndex];
    if (!att || typeof(att.code) == "undefined") {
      return (<div > </div>);
    }
    let icon = "play-circle";
    if (log.TYPE == "input") {
      icon = "play-circle";
      if (att.code == "ACTION_CLICK_HINT") {
        icon = "question-circle";
      } else if (att.code == "ACTION_CLICK_ANSWER") {
        icon = "info-circle_";
      } else if (att.result == "success") {
        icon = "check-circle";
      } else {
        icon = "times-circle";
      }
    } else {
      if (att.result.toLowerCase().includes("test passed")) {
        icon = "check-circle";
      } else if (att.result.toLowerCase().includes("fail")) {
        icon = "times-circle";
      }
    }
    const options = {
      mode: 'javascript',
      lineNumbers: true,
      // autoRefresh:true,
      readOnly: true,
      // gutters: ['CodeMirror-lint-markers', 'CodeMirror-foldgutter'],
    };

    window.studentCode = att.code;

    if (slideType !== "input") {
      window.answerCode = this.getRobotCodeAnswer();
    } else {
      window.answerCode = this.getQuickAnswer(slide);
    }

    setTimeout(() => {
      initUI();
    }, 200);

    return (
      <Modal
        style={StyleModal}
        isOpen={!!showModal}
        contentLabel={'Modal'}
      >
        <div className="modal_block_general change-pw-modal">
          <div className="modalSlideTitle" style={{margin: "20px"}}>
            <div className="modalSlideTitle">{"Result: " + att.result} &nbsp; {<FontAwesomeIcon style={{marginLeft: "2px", color: icon == "check-circle" ? "green" : icon == "times-circle" ? "red" : "blue" }} icon={icon} />} </div>
            <br/>
            <div className="modalSlideTitle">{`Time: ${moment(att.time)}`} </div>
            <button className="modalCodeCloseButton" onClick={this.closeModal} role="presentation">X</button>
          </div>
    
          {!slideContent._id.includes("scratch_lesson") && !slideContent._id.includes("scratch_homework") &&
          <div style={{display: "block", overflow: scroll, fontSize: "20px"}} id="codeSolution2">
            
            <table style={{tableLayout: "fixed", width: "100%", textAlign: "center"}}>
              <tr>
                <td><label style={{color: "yellow"}}>Student Code</label></td>
                <td><label style={{color: "lightgreen"}}>Answer Code</label></td>
              </tr>
            </table>

            
              <div id="codemirrorFrame2" style={{marginTop: "20px"}} onclick="event.stopPropagation()">
              <div id="view"></div>
              {/* <CodeMirror 
                options={options} 
                ref={(ref) => {
                  if (ref != null ) {
                    window.userCodeEditorModal = ref;
                    if (att) {
                      window.userCodeEditorModal.codeMirror.setValue(att.code);
                    }
                  }
                }}
                />   */}
            </div>
          </div>
        }

        </div>
      </Modal>
    );
  }
}

CodeModal.defaultProps = {
  userId: ''
};

CodeModal.propTypes = {
  // toggleResetLessonModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  userId: PropTypes.string,
};
