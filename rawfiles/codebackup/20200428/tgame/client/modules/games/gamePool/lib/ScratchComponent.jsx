/* global screen */
import React from 'react';
import Victor from 'victor';
import _get from 'lodash/get';
import _keys from 'lodash/keys';
import { orientation } from 'o9n';
import { Bert } from 'meteor/themeteorchef:bert';
// window.PIXI = require('pixi.js');
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import isMobile from 'ismobilejs';
import screenfull from 'screenfull';
import ScratchGUI from "../../../scratch/scratch.jsx";
import { LZString } from 'meteor/nunohvidal:lz-string';
import {
  GAME_TYPE, GAME_CONFIG_OPTION,MIGRATION_CONST
} from '../../../../../lib/enum';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { getPeers } from '../../../../../lib/util';
var convert = require('xml-js');


var UTF = {};

UTF.U16to8 = function(convertMe) {
  var out = "";
  for(var i = 0; i < convertMe.length; i++) {
    var charCode = convertMe.charCodeAt(i);
    out += String.fromCharCode(~~(charCode/256));
    out += String.fromCharCode(charCode%256);
  }
return out;
}

UTF.U8to16 = function(convertMe) {
  var out = ""
  for(var i = 0; i < convertMe.length; i += 2) {
    var charCode = convertMe.charCodeAt(i)*256;
    charCode += convertMe.charCodeAt(i+1);
    out += String.fromCharCode(charCode)
  }
  return out;
}

const kindergartenScratchGameList = [
  MIGRATION_CONST.ia_k_turtleGameId, 
  MIGRATION_CONST.schoolAGameId,
  MIGRATION_CONST.schoolAGameCHId,
  MIGRATION_CONST.schoolBGameId,
  MIGRATION_CONST.schoolBGameCHId,
];

const ResizeSensor = require('css-element-queries/src/ResizeSensor');
let robotCodeSaveInd = 0;
let waitingToSave = -1;
let allXML = "";
let valuePendingSaving = "";
let robotCodeSaveSlideId = "";
let currentXML = "";
let currentRunCount = -100;
const timestamps = {};

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1
  // Professional: 1
};

const showNewAlert = (msg) => {
  Bert.defaults.hideDelay = 6000;
  if (!msg.toUpperCase().includes("TEST PASSED") && !msg.toUpperCase().includes("成功")) {

    if (window.currentChosenLocale == "CH") {
      if (msg.includes("No test specified at this moment") ) {
        Bert.alert({
          title: '信息',
          message: "目前没有需要通过的测试",
          type: 'info',
          style: 'growl-bottom-right',
          icon: 'fa-info'
        });   
        return;
      }
  
  
      //throw new Meteor.Error(500, err);
      Bert.alert({
        title: '错误',
        hideDelay: 6000,
        message: msg,
        type: 'codeInValidError',
        style: 'growl-bottom-right',
        icon: 'fas fa-warning'
      });          
      return;  
  
    }
    
    if (msg.includes("No test specified at this moment") ) {
      Bert.alert({
        title: 'Info',
        message: msg,
        type: 'info',
        style: 'growl-bottom-right',
        icon: 'fa-info'
      });   
      return;
    }


    //throw new Meteor.Error(500, err);
    Bert.alert({
      title: 'Error',
      hideDelay: 6000,
      message: msg,
      type: 'codeInValidError',
      style: 'growl-bottom-right',
      icon: 'fas fa-warning'
    });            
  
  } else {
    if (window.currentChosenLocale == "CH") {
      Bert.alert({
        title: '成功',
        message: msg,
        type: 'success',
        style: 'growl-bottom-right',
        icon: 'fas fa-check'
      });
      return;
    }
    Bert.alert({
      title: 'Success',
      message: msg,
      type: 'success',
      style: 'growl-bottom-right',
      icon: 'fas fa-check'
    });    
  }
};

const getAllText = (b) => {
  let s = "";
  if (!b ) return "";
  if (!b._attributes) {
    return;
  }
  if (b._attributes.type == "procedures_definition") {
    s = "define " + b.statement.shadow.mutation._attributes.proccode;    
  } else if (b._attributes.type == "pen_setPenColorParamTo") {
    s = "set pen ";
    if (b.value["0"] && b.value["0"].block) {
      s += getAllText(b.value["0"].block) + " ";
    } else if (b.value["0"] && b.value["0"].shadow && b.value["0"].shadow.field) {
      s += b.value["0"].shadow.field._text + " ";
    }

    if (b.value["1"] && b.value["1"].block) {
      s += "to " + getAllText(b.value["1"].block) + " ";
    } else if (b.value["1"] && b.value["1"].shadow && b.value["1"].shadow.field) {
      s += "to " + b.value["1"].shadow.field._text + " ";
    }
  } else if (b._attributes.type === "motion_gotoxy") {
    s = ` ${b._attributes.type} ${b.value["0"].block ? getAllText(b.value["0"].block) : getAllText(b.value["0"].shadow.field)} ${b.value["1"].block ? getAllText(b.value["1"].block) : getAllText(b.value["1"].shadow.field)}`;
  } else if (b._attributes.type === "motion_glidesecstoxy") {
    s = `motion_glide ${getAllText(b.value["0"].block || b.value["0"].shadow)} secs to x ${getAllText(b.value["1"].block || b.value["1"].shadow)} y ${getAllText(b.value["2"].block || b.value["2"].shadow)}`;
  } else if (b._attributes.type === "sensing_resettimer" || b._attributes.type === "sensing_timer") {
    s = " " + b._attributes.type;
  } else if (b._attributes.name === "NUM") {
    s = " " + b._text;
  } else if (b._attributes.name === "TEXT") {
    s = s = "\"" + b._text + "\"";
  } else if (b._attributes.type === "argument_reporter_string_number") {
    s = s = "\"" + b.field._text + "\"";
  } else if (b._attributes.type == "data_deletealloflist") {
    s = "delete all of " + b.field._text;    
  } else if (b._attributes.type == "event_whenbroadcastreceived") {
    s = "when I receive " + b.field._text + " ";
  } else if (b._attributes.type == "event_whentouchingobject") {
    s = "when this sprite touches " + b.value.shadow.field._text + " ";
  } else if (b._attributes.type == "event_whenkeypressed") {
    s = "when key pressed " + b.field._text + " ";
  } else if (b._attributes.type == "procedures_call") {
    s = "call " + b.mutation._attributes.proccode + " ";

    if (b.value && b.value.block ) {
      if (b.value.block.length > 0) {
        for(let k=0; k<b.value.block.length; k++) {
          s += getAllText(b.value.block[k]) + " ";
        }
      } else {
        s += getAllText(b.value.block) + " ";
      }
    } else if (b.value ) {
      for (let k=0; k<b.value.length; k++) {
        s += getAllText(b.value[k].block || b.value[k].shadow) + "|";
      }    

      // if (b.value.length > 0) {
      //   for (let k=0; k<b.value.length; k++) {
      //     const bv = b.value[k];
      //     if (bv.block) {
      //       s += getAllText(bv.block) + " ";
      //     } else {
      //       s += bv.shadow.field._text;
      //     }
      //   }
      // } else {
      //   s += b.value.shadow.field._text;
      // }    

    }
  } else if (b._attributes.type == "data_setvariableto") {
    s = "set " + b.field._text + " to " + getAllText(b.value.block  || b.value.shadow);
    if (s.includes("set c to")) {
      var x = 1;
    }
  } else if (b._attributes.type == "data_changevariableby") {
    s = "change " + b.field._text + " by " + getAllText(b.value.block || b.value.shadow);
  } else if (b._attributes.type == "data_replaceitemoflist") {
    s = "data_replaceitemoflist item " + (b.value[0].block ? getAllText(b.value[0].block).trim() : b.value[0].shadow.field._text.trim()) + " of " + b.field._text + " with " + getAllText(b.value[1].block || b.value[1].shadow);
  } else if (b._attributes.type == "data_lengthoflist") {
    s = "length of " + b.field._text;
  } else if (b._attributes.type == "text") {
    if (isNaN(b.field._text))
      s = "\"" + b.field._text + "\"";
    else 
      s = b.field._text;
  } else if (b._attributes.type == "math_number") {
    s = b.field._text;
  } else if (b._attributes.type.indexOf("operator_") == 0) {
    let op = " unknownop " + b._attributes.type;
    s = op;
    if (b.value.length == 2) {
      if (b._attributes.type == "operator_subtract") {
        op = " - ";
      } else if (b._attributes.type == "operator_add") {
        op = " + ";
      } else if (b._attributes.type == "operator_random") {
        op = " pick random ";
      } else if (b._attributes.type == "operator_divide") {
        op = " / ";
      } else if (b._attributes.type == "operator_and") {
        op = " && ";
      } else if (b._attributes.type == "operator_or") {
        op = " || ";
      } else if (b._attributes.type == "operator_equals") {
        op = " == ";
      } else if (b._attributes.type == "operator_gt") {
        op = " > ";
      } else if (b._attributes.type == "operator_lt") {
        op = " < ";
      } else if (b._attributes.type == "operator_not") {
        op = " ! ";
      } else if (b._attributes.type == "operator_join") {
        op = " ";
      }
      s = getAllText(b.value[0].block || b.value[0].shadow) + op + getAllText(b.value[1].block || b.value[1].shadow);
    } else if (b.value && b.value.block) {
      if (b._attributes.type == "operator_not") {
        s = "not " + getAllText(b.value.block);
      } else {
        if (b.field)
          s = b.field._text + " of " + getAllText(b.value.block);
        else {
          s = getAllText(b.value.block);
        }
      }
    }

    

  } else if (b._attributes.type == "data_variable") {
    s = "'" + b.field._text + "'";
  } else if (b._attributes.type == "data_itemoflist") {
    s = "item " + (b.value.block ? getAllText(b.value.block) : b.value.shadow.field._text) + " of " + b.field._text;
  } else if (b._attributes.type == "sensing_of") {
    s = b.field._text + " of " + b.value.shadow.field._text;
  } else if (b._attributes.type == "event_broadcast") {
    s = "broadcast " + b.value.shadow.field._text;
  } else if (b._attributes.type == "control_if") { 
    s = " if " + getAllText(b.value.block);
    if (b.statement ) {
      s = s + " \n then " + getAllText(b.statement.block);
    }
  } else if (b._attributes.type == "control_repeat_until") {
    s = "repeat until " + getAllText(b.value.block);
    if (b.statement ) {
      s = s + " \n     " + getAllText(b.statement.block);
    }
  } else if (b._attributes.type == "control_repeat") {
    s = "repeat for ";// getAllText(b.value.block);
    if (b.value && b.value.block) {
      s += getAllText(b.value.block);
    } else if (b.value && b.value.shadow && b.value.shadow.field && b.value.shadow.field._text) {
      s += b.value.shadow.field._text;
    }
    if (b.statement ) {
      s = s + " \n     " + getAllText(b.statement.block);
    }
  } else if (b._attributes.type == "control_wait") {
    s = "wait ";
    
    if (b.value.block) {
      s += getAllText(b.value.block)  + " seconds";
    } else if (b.value && b.value.shadow && b.value.shadow.field) {
      s += b.value.shadow.field._text + " seconds";
    }
    
  } else if (b._attributes.type == "music_playNoteForBeats") {
    s = "play notes ";
    
    if (b.value["0"] && b.value["0"].shadow && b.value["0"].shadow.field) {
      s += b.value["0"].shadow.field._text;
    }
    
    s += " for ";
    if (b.value["1"] && b.value["1"].shadow && b.value["1"].shadow.field) {
      s += b.value["1"].shadow.field._text;
    }
    s += " beats";  

  } else if (b._attributes.type == "looks_thinkforsecs") {
    s = "think ";
    
    if (b.value["0"] && b.value["0"].shadow && b.value["0"].shadow.field) {
      s += b.value["0"].shadow.field._text;
    }
    
    s += " for ";
    if (b.value["1"] && b.value["1"].shadow && b.value["1"].shadow.field) {
      s += b.value["1"].shadow.field._text;
    }
    s += " seconds";  

  } else if (b._attributes.type == "looks_sayforsecs") {
    s = "say ";

    if (b.value["0"] && b.value["0"].block) {
      s += getAllText(b.value[0].block);
    } else if (b.value["0"] && b.value["0"].shadow && b.value["0"].shadow.field) {
      s += b.value["0"].shadow.field._text;
    }
    
    s += " for ";
    if (b.value["1"] && b.value["1"].block) {
      s += getAllText(b.value[1].block);
    } else if (b.value["1"] && b.value["1"].shadow && b.value["1"].shadow.field) {
      s += b.value["1"].shadow.field._text;
    }
    s += " seconds";

  } else if (b._attributes.type == "control_forever") {
    s = "forever ";
    if (b.statement ) {
      s = s + " \n     " + getAllText(b.statement.block);
    }

  } else if (b._attributes.type == "argument_reporter_string_number") {
    s = s + b._attributes.type + " " + b.field._text + " ";
  } else if (b._attributes.type === "motion_setrotationstyle") {
    s = `${s}${b._attributes.type} ${b.field._text} `;
  } else if (b._attributes.type == "control_if_else") {
    s = " if " + getAllText(b.value.block);

    if (b.statement && b.statement[0]) {
      s = s + " \n then " + getAllText(b.statement[0].block);
      if (b.statement[1]) {
        s = s + " \n else " + getAllText(b.statement[1].block);
      }    
    } else {
      if (b.statement) {
        if (b.statement._attributes && b.statement._attributes.name == "SUBSTACK2") {
          s = s + " \n then \n else " + getAllText(b.statement.block);
        } else {
          s = s + " \n then " + getAllText(b.statement.block);
        }
      }
    }
  } else {
    s = b._attributes.type + " ";
    
    if (b.value && b.value.block && b.value.block && b.value.block.length > 0) { 
      for(let k=0; k<b.value.block.length; k++) {
        s += getAllText(b.value.block[k]) + " ";
      }
    } else if (b.value && b.value.block && b.value.block) {
      s += getAllText(b.value.block) + " ";
    } else if (b.value && b.value.shadow && b.value.shadow.field && b.value.shadow.field._text) {
      s += b.value.shadow.field._text + " ";
    }
  }

  

  if (b.next && b.next.block) {
    return s + " \n " + getAllText(b.next.block);
  } else if (b.next && b.next.shadow) {
    return s + " \n " + getAllText(b.next.shadow);
  } else {
    return s;
  }


  const keys2 = Object.keys(b);

  for (let j=0; j<keys2.length; j++) {
      const p = b[keys2[j]];

      if (typeof(p) == "string") {
        s += b[keys2[j]];
      } else if (typeof(p) == "object") {
        s += getAllText(p);
      } else if (typeof(p) == "array") {
        for (let x=0; x < p.length; x++) {
          if (typeof(p[x]) == "object")
            s += getAllText(p[x]);
        }
      } else {

      }
      // if (keys2[j].includes("colour") || keys2[j].includes("category") || keys2[j]=="id") continue;
      // if (typeof(p) == "string") {
      //     s += b[keys2[j]];
      // } else {
      //     if (["inputList", "proccode", "fieldRow", "0","1","2","3","4","5","6","7","8","9" ].includes(keys2[j])) {
      //       s += getAllText(p);
      //     }
      //     // if (typeof(p) == "array") {
      //     //     for (let x=0; x < p.length; x++) {
      //     //         s += getAllText(p[x]);
      //     //     }
      //     // } else if (typeof(p) == "object") {
      //     //     s += getAllText(p);
      //     // }
      // }
  }
  return s;
}

const getScriptFromXML = (type, field = "") => {
  const obj = JSON.parse(convert.xml2json(currentXML, { compact: true, spaces: 4 }));
  const blocks = obj.xml.block;
  let startB = blocks;
  if (blocks && blocks.length) {
    for (let k = 0; k < blocks.length; k++) {
      if (blocks[k]._attributes.type === type) {
        if (field.length === 0 || blocks[k].field && blocks[k].field._text === field) {
          startB = blocks[k]; break;
        }
      }
    }
  }
  const str = getAllText(startB);
  return (str === undefined ? "" : str);
};

// interface IMainProps {}
// interface IMainState {}
class ScratchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingScratch: false
    };    
    const { room, isTesting, scenario } = props;
    let diff = LEVEL_NUMBER.Beginner;
    if (!isTesting) {
      diff = LEVEL_NUMBER[room.difficulty];
    }

    if (scenario) {
      if (scenario.package == "intermediate") diff = 1;
    }

    const mazeSize = diff === LEVEL_NUMBER.Beginner ? 15 : 21;
    this.TrueWidth = 64 * mazeSize;
    this.TrueHeight = 64 * (0.5 + Math.sqrt(0.5) * mazeSize);
    this.gameObject = null;
    this.timers = {};
    this.isLandscape = orientation.type.includes('landscape');
    this.dismissOverlay = this.dismissOverlay.bind(this);

    const that = this;
    window.dismissScratchOverlay = () => {
      // that.setState({isLoadingScratch: false});
      // that.dismissOverlay();

    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.slide.PROJECTID != nextProps.slide.PROJECTID || ( this.props.slide.PROJECTID == nextProps.slide.PROJECTID && this.props.slide.LOCALE != nextProps.slide.LOCALE   )   ) {
      // this.setState({isLoadingScratch: true});
      // $("#messagecontent").html("Loading project ...");
      // $("#scratchoverlay").show();
    }
    return true;
  }

  componentDidUpdate() {
    this.tryResize();
  }

  addKeyHandler() {
    const that = this;
    function keyHandler(event){
      if(event.ctrlKey && event.shiftKey && event.type == "keydown") {
          console.log("event.keyCode " + event.keyCode);
          if (event.keyCode === 70 && !timestamps[event.timeStamp] ) {
              // find next 

              timestamps[event.timeStamp] = 1;
              event.preventDefault();
              event.stopPropagation();

              var str = prompt("enter string to search", "");
              if (str != null) {
                const iframe = document.getElementById("scratchIFrame");
                if (iframe) {
                  iframe.contentWindow.postMessage("SEARCHSTRING:" + str , '*');
                  
                }
              }
          }
          // if (event.keyCode === 70 && !timestamps[event.timeStamp] ) {
          //     timestamps[event.timeStamp] = 1;
          //     event.preventDefault();
          //     event.stopPropagation();
          //     // keydown = true;
          //     var str = prompt("enter string to search", "");

          //     if (str != null) {
          //         console.log(str);

          //         const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace()));
          //         let found = false;

          //         const keys = Object.keys(Blockly.getMainWorkspace().blockDB_);
          //         for (let k=0; k<keys.length; k++) {
          //             const b = Blockly.getMainWorkspace().blockDB_[keys[k]];
          //             let s = getAllText(b);
          //             // console.log("str for id " + keys[k] + " " + s);
                      
          //             if (s.toUpperCase().includes(str.toUpperCase())) {
          //                 Blockly.getMainWorkspace().centerOnBlock(keys[k]);
          //                 //Blockly.getMainWorkspace().highlightBlock(keys[k]);
          //                 // const bounds = b.getBoundingRectangle();
          //                 // Blockly.getMainWorkspace().scrollbar.set(bounds.topLeft.x, bounds.topLeft.y);
          //                 found = true;
          //                 lastFoundBlockID = keys[k];
          //                 lastString = str;
          //                 break;
          //             }
          //         }

          //         if (!found) {
          //             window.alert("'" + str + "'" + " not found!");
          //             lastFoundBlockID = null;
          //             lastString = null;                        
          //         }
          //     }
          // }
          //Do whatever when esc is pressed
      }
  }
  document.removeEventListener("keydown",keyHandler);
  document.addEventListener("keydown", keyHandler, false);    
  }

  componentDidMount() {
    const { isTesting, room, userLesson, slide } = this.props;
    // this.app = new Pixi.Application(window.innerWidth, window.innerHeight);
    // this.gameCanvas.appendChild(this.app.view);
    // this.app.start();

    this.addKeyHandler();

    // Create the canvas and add it the DOM...
    const w = $(this.gameCanvas).width();
    const h = $(this.gameCanvas).height();

    window.addEventListener('resize', this.handleResize.bind(this));

    const s = new ResizeSensor($(this.gameCanvas).parent().parent(), this.tryResize.bind(this));

    this.createScratchGame();

    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    // const iframe = document.getElementById("scratchIFrame");
    // if (iframe) {
    //   iframe.contentWindow.postMessage("SET_PROJECT_ID:" + slide.PROJECTID , '*');
    // }

    const lock = orientation.lock('landscape-primary');
    console.log(lock);

    const that = this;
    // msg from iframe
    const starttime = Date.now();
    window.onmessage = function(e){
      if (!e.data) return;
      if (!e.data.indexOf) return;

      // if (e.data.includes("reveal") && e.data.includes("resize") && e.data.includes("eventName") ) {
      //   that.setState({isLoadingScratch: true});
      //   $("#messagecontent").html("Loading project ...");
      //   $("#scratchoverlay").show();
      // }

      if (e.data.indexOf('TGAME_ScratchDIDMOUNT') == 0) {
        // that.setState({isLoadingScratch: true});
        // $("#messagecontent").html("Loading project ...");
        // $("#scratchoverlay").show();
      }

      if (e.data.indexOf('TGAME_HIDEFLYOUT') == 0) {
        that.setState({isLoadingScratch: false});
        that.dismissOverlay();
      }
      if (e.data.indexOf('TGAME_') == 0) {


          // console.log( ((Date.now() - starttime) / 1000) + " got tgame message " + e.data);
          if (e.data == "TGAME_PROJECTLOADED") {

            let log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == that.props.slide.ID));
            let prevCode = "";
            if (log.userRobotCode && log.userRobotCode.length > 0 && log.userRobotCode != "INVALIDECODE") {
              prevCode = log.userRobotCode;
            } else if (log.slideNode.includes("bilingualtime")) {
              let newid = log.slideId;
              newid = newid.substring(0, newid.indexOf("_"));
              log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
              if (log.userRobotCode && log.userRobotCode.length > 0) {
                prevCode = log.userRobotCode;
              } 
            } else if (log.slideNode.includes("extracredit")) {
              if (log.userRobotCode && log.userRobotCode.length > 0) {
                prevCode = log.userRobotCode;
              } 
            } else if (log.slideId.includes("_")) {
              let newid = log.slideId;
              newid = newid.substring(0, newid.indexOf("_"));
              log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
              if (log.userRobotCode && log.userRobotCode.length > 0) {
                prevCode = log.userRobotCode;
              } 
            } else if (log.slideId.includes("_h2")) {
              let newid = log.slideId;
              newid = newid.substring(0, newid.length-1)+"1";
              log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
              if (log && log.userRobotCode && log.userRobotCode.length > 0) {
                prevCode = log.userRobotCode;
              } else {
                newid = newid.substring(0, newid.length-3);
                log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
                if (log.userRobotCode && log.userRobotCode.length > 0) {
                  prevCode = log.userRobotCode;
                }
              }
            } 

            if (prevCode != "" && prevCode != "INVALIDECODE") {
              console.log("load prev code");
              if (prevCode.indexOf("LZLZ") == 0) {
                //prevCode = LZString.decompressFromUTF16(UTF.U8to16(prevCode.substring(4)));
                prevCode = LZString.decompressFromBase64(prevCode.substring(4));
              }
              that.handleNewXML(prevCode);
              setTimeout(() => {
                const iframe = document.getElementById("scratchIFrame");
                if (iframe) {

                  if (prevCode && prevCode.indexOf("&&") < 0) {
                    iframe.contentWindow.postMessage("XML:" + "AI&&" + prevCode, '*');
                  } else {
                    const parts = prevCode.split("&&");
                    if (prevCode.indexOf("AI&&") == 0 && parts.length == 2 ) {
                      // old savings! 
                      iframe.contentWindow.postMessage("XML:" + prevCode, '*');
    
    
                    } else {
                      for (let i = 0; i < parts.length; i+=2) {
                        if (parts[i] == window.currentSpriteName) {
                          iframe.contentWindow.postMessage("XML:" + parts[i] + "&&" + parts[i+1], '*');
                          break;
                        }
                      }
                    }
                  }

                }
              }, 100);
            }

            if (that.props.slide.SCRATCHUNLOCKED == "1") {
              // console.log("send SCRATCHUNLOCKED");
              // setTimeout(() => {
              //   const iframe = document.getElementById("scratchIFrame");
              //   if (iframe) {
              //     iframe.contentWindow.postMessage("SCRATCHUNLOCKED", '*');
              //   }
              // }, 200);
            }
            if (that.props.slide.STARTINGBLOCKSTRING) {
              setTimeout(() => {
                const iframe = document.getElementById("scratchIFrame");
                if (iframe) {
                  iframe.contentWindow.postMessage("SEARCHSTRING:" + that.props.slide.STARTINGBLOCKSTRING, '*');
                }
              }, 800);
            }
            if (that.props.slide.SCALERATIO) {
              setTimeout(() => {
                const iframe = document.getElementById("scratchIFrame");
                if (iframe) {
                  iframe.contentWindow.postMessage("SCALERATIO:" + that.props.slide.SCALERATIO, '*');
                  // iframe.contentWindow.postMessage("SCALERATIO:1" , '*');
                }
              }, 500);
            }
            return;
          }
          if (e.data.indexOf("TGAME_NEW_XML") == 0) {
            // check if we have saved usr xml for its AI sprite
            that.handleNewXML(e.data.substr(14));

            // if (that.props.slide.SCRATCHUNLOCKED == "1" || that.props.slide.SCRATCHFULL == "1") {

            // } else {

            // }
            return;
          }


          if (e.data.indexOf("TGAME_NEW_LOCALE") == 0) {
            
            if (that.props.slide.STARTINGBLOCKSTRING) {
              setTimeout(() => {
                const iframe = document.getElementById("scratchIFrame");
                if (iframe) {
                  iframe.contentWindow.postMessage("SEARCHSTRING:" + that.props.slide.STARTINGBLOCKSTRING, '*');
                }
              }, 200);
            }


            if (that.props.slide.SCALERATIO) {
              setTimeout(() => {
                const iframe = document.getElementById("scratchIFrame");
                if (iframe) {
                  iframe.contentWindow.postMessage("SCALERATIO:" + that.props.slide.SCALERATIO, '*');
                  // iframe.contentWindow.postMessage("SCALERATIO:1" , '*');
                }
              }, 100);
            }


            return;
          }


          if (e.data.indexOf("TGAME_CURRENT_SPRITE") == 0) {
            // check if we have saved usr xml for its AI sprite
            // aaaaa no longe save for scratch!

            if (window.currentSpriteName != e.data.substr(21)) {
              window.currentSpriteName = e.data.substr(21);

              // if switch sprite and there is a pending save then save
              // right away instead of waiting the 10 seconds.
              if (waitingToSave > 0) {

                robotCodeSaveInd ++;
                robotCodeSaveSlideId = that.props.slide.ID;
          
                const cs = "LZLZ" + LZString.compressToBase64(allXML);
          
                clearTimeout(waitingToSave);
                waitingToSave = -1;                
                Meteor.call("saveUserRobotCodeForLesson", that.props.userLesson._id, cs, robotCodeSaveInd);
              }

              // load our saved code 
              let log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == that.props.slide.ID));
              let prevCode = "";
              if (log.userRobotCode && log.userRobotCode.length > 0 && log.userRobotCode != "INVALIDECODE") {
                prevCode = log.userRobotCode;
              } else if (log.slideId.includes("_")) {
                let newid = log.slideId;
                newid = newid.substring(0, newid.indexOf("_"));
                log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
                if (log.userRobotCode && log.userRobotCode.length > 0) {
                  prevCode = log.userRobotCode;
                } 
              } else if (log.slideId.includes("_h2")) {
                let newid = log.slideId;
                newid = newid.substring(0, newid.length-1)+"1";
                log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
                if (log && log.userRobotCode && log.userRobotCode.length > 0) {
                  prevCode = log.userRobotCode;
                } else {
                  newid = newid.substring(0, newid.length-3);
                  log = that.props.userLesson.slideVisitLog.find(e => (e.slideId == newid));
                  if (log.userRobotCode && log.userRobotCode.length > 0) {
                    prevCode = log.userRobotCode;
                  }
                }
              } 
  
              if (prevCode != "" && prevCode != "INVALIDECODE") {
                console.log("load prev code");
                // change currentXML if necessary

                if (prevCode.indexOf("LZLZ") == 0) {
                  //prevCode = LZString.decompressFromUTF16(UTF.U8to16(prevCode.substring(4)));
                  prevCode = LZString.decompressFromBase64(prevCode.substring(4));
                }

                that.handleNewXML(prevCode);

                setTimeout(() => {
                  const iframe = document.getElementById("scratchIFrame");
                  if (iframe) {

                    
                    if (prevCode && prevCode.indexOf("&&") < 0) {
                      iframe.contentWindow.postMessage("XML:" + "AI&&" + prevCode, '*');
                    } else {
                      // iframe.contentWindow.postMessage("XML:" + "AI" + "&&" + currentXML, '*');
                      const parts = prevCode.split("&&");
                      if (prevCode.indexOf("AI&&") == 0 && parts.length == 2 ) {
                        // old savings! 
                        iframe.contentWindow.postMessage("XML:" + prevCode, '*');
      
      
                      } else {
                        for (let i = 0; i < parts.length; i+=2) {
                          if (parts[i] == window.currentSpriteName) {
                            iframe.contentWindow.postMessage("XML:" + parts[i] + "&&" + parts[i+1], '*');
                            break;
                          }
                        }
                      }
                    }

                    
  
  
                  }
                }, 100);
              }



            }

            // if (that.props.slide.SCRATCHUNLOCKED == "1" || that.props.slide.SCRATCHFULL == "1") {
            // } else {
            //   // window.currentSpriteName = "AI";
            // }
            return;
          }
          


          if (e.data.indexOf("TGAME_RUNCOUNT") == 0) {
            // check if we have saved usr xml for its AI sprite

        
            currentRunCount = e.data.substr(15);
            console.log("new run count " + currentRunCount);
            return;
          }

          if (e.data.indexOf("TGAME_SUCCESS") == 0) {
            // check if we have saved usr xml for its AI sprite
            that.handleResult(e.data.substr(14));
            return;
          }
      }
    };


    if (!this.state.isLoadingScratch) {
      // this.setState({isLoadingScratch: true});
      // $("#messagecontent").html("Loading project ...");
      // $("#scratchoverlay").show();
    }


  }

  handleResult(result) {
    const { saveRobotCode, userLesson, slide } = this.props;


    const log = userLesson.slideVisitLog.find(e => (e.slideId == slide.ID));


    const p = result.split("_");
    const newCount = p[0];
    if (newCount == currentRunCount || newCount == "") return;
    currentRunCount = newCount;
    // console.log("handle result new run count " + currentRunCount);
    const s = p[1];

    if (window.testCondition.indexOf("TestFinished_BirdHome") == 0) {
      const p = window.testCondition.split("_");
      if (s == "1") {
        if (p.length == 2) {
          window.testResult = "Test passed!";
        } else {
          // there are other conditions
          if (p[2] == "UseRepeat") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = blocks;
              if (blocks && blocks.length) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              }


              const str = getAllText(startB);

              if (!str.includes("repeat")) {
                window.testResult = "Test failed: you should use a repeat loop.";
              } else {
                window.testResult = "Test passed!";
              }


              // if (startB.field._attributes.id != "broadcastMsgId-start" ||  startB._attributes.type != "event_whenbroadcastreceived") {
              //   window.testResult = "Test failed: all blocks should be attached to the 'when I receive start' block!";
              // } else {
              //   const nextB = startB.next.block;
              //   if (!nextB || nextB._attributes.type != "control_repeat") {
              //     window.testResult = "Test failed: your program should start with the repeat block after receiving the 'start' message, not the " + nextB._attributes.type + " block.";
              //   } else {
              //     const thirdB = nextB.statement.block;
              //     if (!thirdB || !thirdB.next) {
              //       window.testResult = "Test failed: your program should have 4 blocks!";
              //     } else {
              //       const fourthB = thirdB.next.block;
              //       if (fourthB.next) {
              //         window.testResult = "Test failed: your program should have 4 blocks!";
              //       } else {
              //         window.testResult = "Test passed!";
              //       }
              //     }
              //   }
              // }
            }
            

          }

          
          if (p[2] == "UseNewFlyTo") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {

              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = blocks;
              if (blocks && blocks.length) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              }


              const str = getAllText(startB);

              if (!str.includes("call flap once towards")) {
                window.testResult = "Test failed: you should use the new block 'flap once towards'.";
              } else {
                if (!str.includes("forever")) {
                  window.testResult = "Test failed: you should use 'forever'.";
                } else {
                  window.testResult = "Test passed!";
                }  
              }


              // var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              // const blocks = obj.xml.block;
              // let startB = null;
              // for (let k=0; k<blocks.length; k++) {
              //   if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
              //     startB = blocks[k]; break;
              //   }
              // }
              // if (startB == null) {
              //   window.testResult = "Test failed: can't find the 'when I receive start' block!";
              // } else {
              //   const nextB = startB.next.block;
              //   if (!nextB || nextB._attributes.type != "control_forever") {
              //     window.testResult = "Test failed: you need a 'forever' block after receiving the 'start' message.";
              //   } else {
              //     const thirdB = nextB.statement ? nextB.statement.block : null;
              //     if (!thirdB || thirdB._attributes.type != "procedures_call") {
              //       window.testResult = "Test failed: you need to use the new block in the forever loop!";
              //     } else {
              //       window.testResult = "Test passed!";
              //     }
              //   }
              // }

            }
            

          }


          if (p[2] == "UseRepeatUntilShorter") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {


              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = blocks;
              if (blocks && blocks.length) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              }


              const str = getAllText(startB);

              if (!str.includes("repeat until")) {
                window.testResult = "Test failed: you should use 'repeat until'.";
              } else {
                if (!str.includes("forever")) {
                  window.testResult = "Test failed: you should use 'forever'.";
                } else {
                  window.testResult = "Test passed!";
                }  
              }
              
              // var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              // const blocks = obj.xml.block;
              // let startB = blocks;
              // for (let k=0; k<blocks.length; k++) {
              //   if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
              //     startB = blocks[k]; break;
              //   }
              // }
              // if (startB == null) {
              //   window.testResult = "Test failed: can't find the 'when I receive start' block!";
              // } else {
              //   const nextB = startB.next.block;
              //   if (!nextB || nextB._attributes.type != "control_repeat_until") {
              //     window.testResult = "Test failed: you need a 'repeat until' block after receiving the 'start' message.";
              //   } else {
              //     const thirdB = nextB.next ? nextB.next.block : null;
              //     if (!thirdB || thirdB._attributes.type != "control_forever") {
              //       window.testResult = "Test failed: you need to use a 'forever' block below the repeat loop!";
              //     } else {
              //       window.testResult = "Test passed!";
              //     }
              //   }
              // }
            }
          }

          if (p[2] == "UseTimingTable") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              


              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = blocks;
              if (blocks && blocks.length) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              }


              const str = getAllText(startB);

              if (!str.includes("timing table")) {
                window.testResult = "Test failed: you should use the timing table.";
              } else {
                  window.testResult = "Test passed!";
              }


              // var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              // const blocks = obj.xml.block;
              // let startB = null;
              // for (let k=0; k<blocks.length; k++) {
              //   if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
              //     startB = blocks[k]; break;
              //   }
              // }
              // if (startB == null) {
              //   window.testResult = "Test failed: can't find the 'when I receive start' block!";
              // } else {
              //   const nextB = startB.next.block;
              //   if (!nextB || nextB._attributes.type != "control_repeat_until") {
              //     window.testResult = "Test failed: you need a 'repeat until' block after receiving the 'start' message.";
              //   } else {
              //     const thirdB = nextB.statement ? nextB.statement.block : null;
              //     if (!thirdB || thirdB._attributes.type != "data_setvariableto") {
              //       window.testResult = "Test failed: first block in the repeat loop should be calculating the 'fall distance'!";
              //     } else {
              //       const b4 = thirdB.next ? thirdB.next.block : null;
              //       if (!b4 || b4._attributes.type != "event_broadcast") {
              //         window.testResult = "Test failed: you should broadcast the 'flap' message after calculating the fall distance.";
              //       } else {
              //         const b5 = b4.next ? b4.next.block : null;
              //         if (!b5 || b5._attributes.type != "control_wait") {
              //           window.testResult = "Test failed: you should add the wait block after broadcasting the 'flap' message.";
              //         } else {
              //           const b6 = b5.value ? b5.value.block : null;
              //           if (!b6 || b6._attributes.type != "data_itemoflist") {
              //             window.testResult = "Test failed: the waiting time should be read out of the 'timing table'.";
              //           } else {
              //             window.testResult = "Test passed!";
              //           }
              //         }
              //       }
              //     }
              //   }
              // }

            }
            

          }

          if (p[2] == "UseNewBlock") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {

              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = blocks;
              if (blocks && blocks.length) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              }


              const str = getAllText(startB);

              if (!str.includes("call flap")) {
                window.testResult = "Test failed: you should use the new block 'flap'.";
              } else {
                window.testResult = "Test passed!";
              }


              // var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              // const blocks = obj.xml.block;
              // let startB = null;
              // for (let k=0; k<blocks.length; k++) {
              //   if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
              //     startB = blocks[k]; break;
              //   }
              // }
              // if (startB == null) {
              //   window.testResult = "Test failed: can't find the 'when I receive start' block!";
              // } else {
              //   const nextB = startB.next.block;
              //   if (!nextB || nextB._attributes.type != "procedures_call") {
              //     window.testResult = "Test failed: your program should call the new block after receiving the 'start' message.";
              //   } else {
              //     const thirdB = nextB.next.block;
              //     if (!thirdB || thirdB._attributes.type != "procedures_call") {
              //       window.testResult = "Test failed: your program should call the new block twice!";
              //     } else {
              //       if (thirdB.next) {
              //         window.testResult = "Test failed: your program should only have 2 of the new block after the start message!";
              //       } else {
              //         window.testResult = "Test passed!";
              //       }
              //     }
              //   }
              // }
            }

          }


        }
      } else {
        window.testResult = "Test failed: the bird did not reach its nest!";
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult);    

      
    } else if (window.testCondition.indexOf("TestFinished_CG") == 0) {

      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_CGCCscore_120", "TestFinished_CGCCscore_160", "TestFinished_CGCCscore_5", "TestFinished_CGCCscore_2three", "TestFinished_CGCCscore_3and4", "TestFinished_CGCCscore_3match", "TestFinished_CGCCscore_cascade", "TestFinished_CGDTJrdrawlinebelow", "TestFinished_CGDTJrdrawlineleft", "TestFinished_CGDTJrdrawasquare", "TestFinished_CGDTJrdrawa3square", "TestFinished_CGDTJrdrawa4squarearound", "TestFinished_CGDTJrdrawaastaircase", "TestFinished_CGDTJrdrawaflower", "TestFinished_CGDT2Jrdrawatriangle", "TestFinished_CGDTdrawingthenumber8cg2", "TestFinished_CGDTSrdrawamaze", "TestFinished_CGDTJrdrawaturtle2", "TestFinished_CGDTJrdrawa4separatedsquare", "TestFinished_CGDTJrdrawcolorpalette", "TestFinished_CGFBdescendcg3", "TestFinished_CGflytohighnestcg3", "TestFinished_CGveryfarnestcg3", "TestFinished_CGrandomheightnestcg3", "TestFinished_CGgoingthroughacolcg3", "TestFinished_CGacompleteturncg4", "TestFinished_CGpickupthetorchcg4", "TestFinished_CGgrabthekeycg4", "TestFinished_CGopengatecg4"]; // gggg
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          window.testResult = "Test passed!";
          

          if (window.testCondition.includes("TestFinished_Algotheswapblockalgo0")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("define swap") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the definition of the 'swap' block.";  
              } else {
                const str = getAllText(nB);


                

                if (!str.includes("set temp to item \"index1\" of numbers")) {
                  window.testResult = "Test failed: you should use the 'temp' variable to hold the value of item at 'index1' of 'numbers' initially.";
                } else if (!str.includes("data_replaceitemoflist item \"index1\" of numbers with item \"index2\" of numbers")) {
                  window.testResult = "Test failed: you should replace item at index1 of 'numbers' with item at index2 of 'numbers'.";
                } else if (!str.includes("data_replaceitemoflist item \"index2\" of numbers with 'temp'")) {
                  window.testResult = "Test failed: you should replace item at index2 of 'numbers' with 'temp'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Algoswaplist2numbersonlistalgo0")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);

                if (!str.includes("set temp to item 1 of numbers")) {
                  window.testResult = "Test failed: you should use the 'temp' variable to hold the value of item 1 of 'numbers' initially.";
                } else if (!str.includes("data_replaceitemoflist item 1 of numbers with item 2 of numbers")) {
                  window.testResult = "Test failed: you should replace item 1 of 'numbers' with item 2 of 'numbers'.";
                } else if (!str.includes("data_replaceitemoflist item 2 of numbers with 'temp'")) {
                  window.testResult = "Test failed: you should replace item 2 of 'numbers' with 'temp'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Algoswap2numbers")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("set temp to 'number1'")) {
                  window.testResult = "Test failed: you should use the 'temp' variable to hold the value of 'number1' initially.";
                } else if (!str.includes("set number1 to 'number2'")) {
                  window.testResult = "Test failed: you should set 'number1' to the value of 'number2'.";
                } else if (!str.includes("set number2 to 'temp'")) {
                  window.testResult = "Test failed: you should set 'number2' to the value of 'temp'.";
                } else if (str.indexOf("set temp to 'number1'") > str.indexOf("set number1 to 'number2'")) {
                  window.testResult = "Test failed: you should store number1's value to temp before changing the value of number1.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  
        }
      } else {
        window.testResult = "Test failed: You did not make the changes as expected.";
        
        if (window.testCondition == "TestFinished_CGCCscore_120") {
          window.testResult = "Test failed: please make a valid swap!";
        }

        
        if (window.testCondition == "TestFinished_CGCCscore_160") {
          window.testResult = "Test failed: please find a match with 4 candies in a row or column!";
        }

        
        if (window.testCondition == "TestFinished_CGCCscore_5") {
          window.testResult = "Test failed: please find a match with 5 candies in a row or column!";
        }

        
        if (window.testCondition == "TestFinished_CGCCscore_2three") {
          window.testResult = "Test failed: please find a swap that can lead to 2 matches of 3 candies in each.";
        }

        
        if (window.testCondition == "TestFinished_CGCCscore_3and4") {
          window.testResult = "Test failed: please find a swap that can lead to 2 matches of 3 candies and 4 candies.";
        }

        
        if (window.testCondition == "TestFinished_CGCCscore_3match") {
          window.testResult = "Test failed: please find a swap that leads to 3 matches at the same time!";
        }

        
        if (window.testCondition == "TestFinished_CGCCscore_cascade") {
          window.testResult = "Test failed: please find a match that leads to another cascade match!";
        }

        const redlinemsg = ["TestFinished_CGDTJrdrawlinebelow", "TestFinished_CGDTJrdrawlineleft", "TestFinished_CGDTJrdrawasquare", "TestFinished_CGDTJrdrawa3square", "TestFinished_CGDTJrdrawa4squarearound", "TestFinished_CGDTJrdrawaastaircase", "TestFinished_CGDTJrdrawaflower"];
        if (redlinemsg.includes(window.testCondition) ) {
          window.testResult = "Test failed: the turtle did not cover the red lines!";
        }

        
        const greylinemsg = ["TestFinished_CGDT2Jrdrawatriangle", "TestFinished_CGDTdrawingthenumber8cg2", "TestFinished_CGDTSrdrawamaze", "TestFinished_CGDTJrdrawaturtle2", "TestFinished_CGDTJrdrawa4separatedsquare", "TestFinished_CGDTJrdrawcolorpalette"];
        if (greylinemsg.includes(window.testCondition) ) {
          window.testResult = "Test failed: your drawing did not cover the grey lines!";
        }

        const birdnestmsg = ["TestFinished_CGFBdescendcg3", "TestFinished_CGflytohighnestcg3", "TestFinished_CGveryfarnestcg3", 'TestFinished_CGrandomheightnestcg3', "TestFinished_CGgoingthroughacolcg3"];
        if (birdnestmsg.includes(window.testCondition) ) {
          window.testResult = "Test failed: the bird did not arrive at its nest safely!";
        }

        
        if (window.testCondition == "TestFinished_CGacompleteturncg4") {
          window.testResult = "Test failed: the monkey did not make a complete turn of 360 degrees.";
        }

        
        if (window.testCondition == "TestFinished_CGpickupthetorchcg4") {
          window.testResult = "Test failed: the monkey did not pick up the torch.";
        }

        
        if (window.testCondition == "TestFinished_CGgrabthekeycg4") {
          window.testResult = "Test failed: the monkey needs to pick up the torch then the key.";
        }

        
        if (window.testCondition == "TestFinished_CGopengatecg4") {
          window.testResult = "Test failed: the monkey needs to use the key to open the tate.";
        }


        // gggg
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

      // $("#messagecontent").html(window.testResult);
      // $("#scratchoverlay").show();
      // const timeout = window.testResult.indexOf("Test passsed") == 0 ? 2000 : 3000;
      
      // setTimeout(() => {
      //   $("#scratchoverlay").hide();
      // }, timeout);

      // window.submitTestResultInChat(window.testResult); 

      showNewAlert(window.testResult);
      window.submitTestResultInChat(window.testResult); 

      
    } else if (window.testCondition.indexOf("TestFinished_Algo") == 0) {

      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_AlgoRotating5", "TestFinished_Algosortingallkidswithswapalgo1", "TestFinished_Algousingindexandrepeatpatternalgo1", "TestFinished_Algorepeat6timesalgo1", "TestFinished_Algosort8", "TestFinished_Algoselectindexlbokalgo2", "TestFinished_Algosearchfortallestalgo2", "TestFinished_Algorepeat5timesalgo2", "TestFinished_Algosortshorttotallsalgo2", "TestFinished_Algothemoveitemblockalgo3", "TestFinished_Algosortallmovealgo3", "TestFinished_Algofindinsertautoalgo3", "TestFinished_Algosort8shorttotall", "TestFinished_Algomerge2subalgo5", "TestFinished_Algocopyasublistalgo6", "TestFinished_Algocopyremainingalgo6", "TestFinished_Algocopybackalgo6", "TestFinished_Algofullmergesortalgo6"]; // ffff
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          window.testResult = "Test passed!";
          

          


          if (window.testCondition.includes("TestFinished_Algocountfactor")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("define count") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the definition of the 'count factor' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*if.*==.*0.*then.*set.*answer.*to.*0.*else.*call.*count.*factor.*\/.*set.*answer.*\+.*say/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not using recursion correctly.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          } 

          if (window.testCondition.includes("TestFinished_Algodiffto5algo4")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("define difference") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the definition of the 'difference' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*if.*==.*5.*then.*set.*answer.*to.*0.*else.*call.*difference.*\-.*set.*answer.*\+.*say/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not using recursion correctly.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          } 

          if (window.testCondition.includes("TestFinished_Algofactorialbyrecuralgo4")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("define factorial") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the definition of the 'factorial' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*if.*==.*then.*set.*answer.*to.*1.*else.*call.*factorial.*\-.*set.*answer.*multiply.*say/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not using recursion correctly.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          } 

          if (window.testCondition.includes("TestFinished_Algotheswapblockalgo0")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("define swap") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the definition of the 'swap' block.";  
              } else {
                const str = getAllText(nB);


                

                if (!str.includes("set temp to item \"index1\" of numbers")) {
                  window.testResult = "Test failed: you should use the 'temp' variable to hold the value of item at 'index1' of 'numbers' initially.";
                } else if (!str.includes("data_replaceitemoflist item \"index1\" of numbers with item \"index2\" of numbers")) {
                  window.testResult = "Test failed: you should replace item at index1 of 'numbers' with item at index2 of 'numbers'.";
                } else if (!str.includes("data_replaceitemoflist item \"index2\" of numbers with 'temp'")) {
                  window.testResult = "Test failed: you should replace item at index2 of 'numbers' with 'temp'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Algoswaplist2numbersonlistalgo0")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);

                if (!str.includes("set temp to item 1 of numbers")) {
                  window.testResult = "Test failed: you should use the 'temp' variable to hold the value of item 1 of 'numbers' initially.";
                } else if (!str.includes("data_replaceitemoflist item 1 of numbers with item 2 of numbers")) {
                  window.testResult = "Test failed: you should replace item 1 of 'numbers' with item 2 of 'numbers'.";
                } else if (!str.includes("data_replaceitemoflist item 2 of numbers with 'temp'")) {
                  window.testResult = "Test failed: you should replace item 2 of 'numbers' with 'temp'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          
          if (window.testCondition.includes("TestFinished_Algosetuprandlistalgo8")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("define set up lists") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'define set up lists' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*delete all.*delete all.*repeat.*size.*add.*pick random.*10000/;
                if (!str.includes("pick random") || !str.includes("10000")) {
                  window.testResult = "Test failed: the program should add random numbers between 1 and 10000 to list A.";
                } else if (!str.includes("delete all")) {
                  window.testResult = "Test failed: the program should clear both lists first.";
                } else if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: the program should clear both lists, then insert random numbers repeatedly to list A, and insert empty items into list B.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          } 

          
          if (window.testCondition.includes("TestFinished_Algotimeforbubblealgo8")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when I receive start") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive start' block.";  
              } else {
                const str = getAllText(nB);
                const p = /reset.*repeat.*100.*set up lists.*bubble sort.*set.*average time.*timer/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program should reset the timer, run the bubble sort repeatedly for 100 times, and then calculate the average run time.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Algosetitostart2")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("set i to 2") || str.includes("set i to 1")) {
                  window.testResult = "Test failed: the program should initialize i to 2.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Algoswap2numbers")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("set temp to 'number1'")) {
                  window.testResult = "Test failed: you should use the 'temp' variable to hold the value of 'number1' initially.";
                } else if (!str.includes("set number1 to 'number2'")) {
                  window.testResult = "Test failed: you should set 'number1' to the value of 'number2'.";
                } else if (!str.includes("set number2 to 'temp'")) {
                  window.testResult = "Test failed: you should set 'number2' to the value of 'temp'.";
                } else if (str.indexOf("set temp to 'number1'") > str.indexOf("set number1 to 'number2'")) {
                  window.testResult = "Test failed: you should store number1's value to temp before changing the value of number1.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  
        }
      } else {
        window.testResult = "Test failed: You did not make the changes as specified.";
        
        if (window.testCondition == "TestFinished_AlgoRotating5") {
          window.testResult = "Test failed: please rotate these 5 items using the 'swap' blocks.";
        }

        
        if (window.testCondition == "TestFinished_Algosortingallkidswithswapalgo1") {
          window.testResult = "Test failed: your program did not make all swaps correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algousingindexandrepeatpatternalgo1") {
          window.testResult = "Test failed: your program did not make all swaps correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algorepeat6timesalgo1") {
          window.testResult = "Test failed: your program did not sort all students correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algosort8") {
          window.testResult = "Test failed: your program did not sort all students from the shortest to the tallest correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algoselectindexlbokalgo2") {
          window.testResult = "Test failed: your program did not select all students from the tallest to the shortest one by one.";
        }

        
        if (window.testCondition == "TestFinished_Algosearchfortallestalgo2") {
          window.testResult = "Test failed: your program did not select the tallest student correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algorepeat5timesalgo2") {
          window.testResult = "Test failed: your program did not sort all students correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algosortshorttotallsalgo2") {
          window.testResult = "Test failed: your program did not sort all students from the shortest to the tallest correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algosetitostart2") {
          window.testResult = "Test failed: your program did not sort all students from the shortest to the tallest correctly.";
        }

        
        if (window.testCondition == "TestFinished_Algothemoveitemblockalgo3") {
          window.testResult = "Test failed: your 'move item' block is not correctly defined.";
        }

        
        if (window.testCondition == "TestFinished_Algosortallmovealgo3") {
          window.testResult = "Test failed: your program did not sort all 5 students from tall to short.";
        }

        
        if (window.testCondition == "TestFinished_Algofindinsertautoalgo3") {
          window.testResult = "Test failed: your program did not sort all 5 students from tall to short.";
        }
        
        
        if (window.testCondition == "TestFinished_Algosort8shorttotall") {
          window.testResult = "Test failed: your program did not sort all 8 students from short to tall.";
        }

        
        if (window.testCondition == "TestFinished_Algomerge2subalgo5") {
          window.testResult = "Test failed: your program did not correctly merge these 2 sublists.";
        }

        
        if (window.testCondition == "TestFinished_Algocopyasublistalgo6") {
          window.testResult = "Test failed: your program did not correctly copy items 2 to 4 from list A to list B.";
        }

        

        if (window.testCondition == "TestFinished_Algocopyremainingalgo6") {
          window.testResult = "Test failed: your program did not correctly copy remaining items in the sublists from list A to list B.";
        }

        
        if (window.testCondition == "TestFinished_Algocopybackalgo6") {
          window.testResult = "Test failed: your program did not correctly copy the sorted numbers back to list A.";
        }

        
        if (window.testCondition == "TestFinished_Algofullmergesortalgo6") {
          window.testResult = "Test failed: your program did not correctly sort list A.";
        }

        
        if (window.testCondition == "TestFinished_Algosetuprandlistalgo8") {
          window.testResult = "Test failed: both lists should have 64 items after your program runs.";
        }

        // ffff
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult); 


    } else if (window.testCondition.indexOf("TestFinished_School") == 0) {

      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Schooladdbackdropschool", "TestFinished_Schooladddanianddeeschoola6", "TestFinished_Schoolmovingandresizing", "TestFinished_Schooladjustspritesschoola8", "TestFinished_Schooljoymovestosmithschoola8", "TestFinished_Schooljoymovestokitchenschoola8", "TestFinished_Schoolbilingaltimehelloschoola8", "TestFinished_Schooladdmorekeysschoola17", "TestFinished_Schoolpickupthecanschoola16", "dropofftheloadschoola16", "TestFinished_Schooldropofftheloadschoola16", "TestFinished_Schoolbilingaltimehelloschoola16", "TestFinished_Schoolcollectingthecanschoola19", "TestFinished_Schoolhandlingthedownarrowschoola26", "TestFinished_Schoolhandlingtheleftrightarrowschoola26", "TestFinished_Schoolbilingaltimehelloschoola32", "TestFinished_Schoolchangedice6schoola36", "TestFinished_Schoolchangingthediceto5then2schoola36", "TestFinished_Schoolmoveandcountschoola36", "TestFinished_Schoolresetschoola38", "TestFinished_Schoolincrboxsizeschoola43", "TestFinished_Schoolsepboxschoola43", "TestFinished_Schooldottedschoolb6", "TestFinished_Schoolnestedchoolb6", "TestFinished_Schoolbilingaltimehelloschoolb6"]; // eeee
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          window.testResult = "Test passed!";

          
          if (window.testCondition.includes("TestFinished_Schooladdorangeschoola37")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {

              if (!currentXML.includes("orange count")) {
                window.testResult = "Test failed: you should add a variable 'orange count'.";
              } else {
                window.testResult = "Test passed!";
              }
            }
          }

          

          if (window.testCondition.includes("TestFinished_Schoolrenameanddeleteschoola37")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {

              if (!currentXML.includes("eggs count")) {
                window.testResult = "Test failed: you should rename the variable 'egg count' to 'eggs count'.";
              } else if (currentXML.includes("milk count")) {
                window.testResult = "Test failed: you should delete the variable 'milk count'.";
              } else {
                window.testResult = "Test passed!";
              }
            }
          }

          

          if (window.testCondition.includes("TestFinished_Schooldescr1schoola38")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              if (!blocks) {
                window.testResult = "Test failed: you haven't added any blocks yet.";
              } else {
                let nB = null;
                if (blocks.length > 0) {
                  let found = 0;
                  for (let k=0; k<blocks.length; k++) {
                    const s = getAllText(blocks[k]);
                    if (s.includes("whenthisspriteclicked") ) {
                      nB = blocks[k];
                      found = 1;
                      break;
                    }
                  }
                } else {
                  nB = blocks;
                }
                if (!nB) {
                  window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
                } else {
                  const str = getAllText(nB);
                  if (!str.includes("whenthisspriteclicked")) {
                    window.testResult = "Test failed: you should use the 'when this sprite clicked' block.";
                  } else if (!str.includes("change") || !str.includes("apple count") || !str.includes("by") || !str.includes("-1")) {
                    window.testResult = "Test failed: you should change 'apple count' by -1 when '+' button is clicked .";
                  } else {
                    window.testResult = "Test passed!";
                  }
                }
  
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolincreaseappleby1schoola38")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              if (!blocks) {
                window.testResult = "Test failed: you haven't added any blocks yet.";
              } else {
                let nB = null;
                if (blocks.length > 0) {
                  let found = 0;
                  for (let k=0; k<blocks.length; k++) {
                    const s = getAllText(blocks[k]);
                    if (s.includes("whenthisspriteclicked") ) {
                      nB = blocks[k];
                      found = 1;
                      break;
                    }
                  }
                } else {
                  nB = blocks;
                }
                if (!nB) {
                  window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
                } else {
                  const str = getAllText(nB);
                  if (!str.includes("whenthisspriteclicked")) {
                    window.testResult = "Test failed: you should use the 'when this sprite clicked' block.";
                  } else if (!str.includes("change") || !str.includes("apple count") || !str.includes("by") || !str.includes("1")) {
                    window.testResult = "Test failed: you should change 'apple count' by 1 when '+' button is clicked .";
                  } else {
                    window.testResult = "Test passed!";
                  }
                }
  
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolclicktoshownextflagschoola31")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("whenthisspriteclicked")) {
                  window.testResult = "Test failed: you should use the 'when this sprite clicked' block.";
                } else if (!str.includes("nextcostume")) {
                  window.testResult = "Test failed: you should run the 'next costume' block when the flag sprite is clicked .";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          

          if (window.testCondition.includes("TestFinished_Schoolbuyboxschoolb4")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*forever.*motion_jrgotocolumn.*stamp/;
                const p2 = /.*forever.*motion_jrgotocolumn.*change.*coins A.*-2/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not stamp the token.";
                } else if (!p2.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not reduce the 'coins A' variable by 2.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolkeepmovingschoolb4")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*forever.*set.*row dice/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not keep moving the token forever.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          

          if (window.testCondition.includes("TestFinished_Schoolmoverandschoolb4")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*motion_jrgotocolumn.*column dice/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not move the token to the column specified by 'column dice'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolrandcolschoolb4")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*set.*column dice.*1.*pick random.*6/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not set 'column dice' to a random number between 1 and 6.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          

          if (window.testCondition.includes("TestFinished_Schoolsetscore0schoola39")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*set.*Score.*0/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not set 'Score' to 0.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolsettheother2schoola37")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*set.*orange.*count.*3/;
                const p2 = /.*set.*apple.*count.*4/;
                if (!p.test(str.replace(/\r?\n|\r/g, "")) || !p2.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not set 'orange count' and 'apple count' correctly.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola36")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") && s.includes("touching") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block with 'touching color' below it.";  
              } else {
                const str = getAllText(nB);
                const p = /.*repeat.*motion.*right.*if.*touching.*\+.*else.*\-/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not correctly counting how many more black cards there are compared with the red cards.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolcountblackonlyschoola36")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") && s.includes("touching") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block with 'touching color' below it.";  
              } else {
                const str = getAllText(nB);
                const p = /.*repeat.*motion.*right.*if.*touching.*\+/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not correctly counting black cards only.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolabetterpathschoola34")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*right.*right.*right.*down.*down.*left.*up.*left.*down.*left.*up.*up/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: the spray head needs to follow the new path specified.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }



          if (window.testCondition.includes("TestFinished_Schoolcounterschoola43")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*set.*Counter.*0.*repeat.*repeat.*forward.*left.*change.*Counter.*1/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Counter is not correctly counting the number of boxes drawn.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolmovespraybackschoola34")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*right.*right.*right.*down.*left.*left.*left.*down.*right.*right.*right.*left.*left.*left.*up.*right.*right.*right.*up.*left.*left.*left/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: the spray head needs to follow the zigzag path to go down then back specified.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola34")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let nB2 = null;
              let nB3 = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    if (!nB) {
                      nB = blocks[k];
                    } else if (!nB2) {
                      nB2 = blocks[k];
                    } else if (!nB3) {
                      nB3 = blocks[k];
                    }
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB || !nB2 || !nB3) {
                window.testResult = "Test failed: can't find all the 'when green flag clicked' blocks.";  
              } else {
                const str = getAllText(nB);
                const str2 = getAllText(nB2);
                const str3 = getAllText(nB3);
                const p = /.*forever.*if.*touching.*switch.*on.*wait.*switch.*off/;
                if (!p.test(str.replace(/\r?\n|\r/g, "")) && !p.test(str2.replace(/\r?\n|\r/g, "")) && !p.test(str3.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you need to switch the spray off 0.1 seconds after turning it on.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          if (window.testCondition.includes("TestFinished_Schoolspraytouchyellowschoola34")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let nB2 = null;
              let nB3 = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    if (!nB) {
                      nB = blocks[k];
                    } else if (!nB2) {
                      nB2 = blocks[k];
                    } else if (!nB3) {
                      nB3 = blocks[k];
                    }
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB || !nB2 || !nB3) {
                window.testResult = "Test failed: can't find all the 'when green flag clicked' blocks.";  
              } else {
                const str = getAllText(nB);
                const str2 = getAllText(nB2);
                const str3 = getAllText(nB3);
                const p = /.*forever.*if.*touching.*switch.*on/;
                if (!p.test(str.replace(/\r?\n|\r/g, "")) && !p.test(str2.replace(/\r?\n|\r/g, "")) && !p.test(str3.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you need to switch the spray on when it touches the yellow weed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolcoverallschoola34")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*right.*right.*right.*down.*left.*left.*left.*down.*right.*right.*right/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: the spray head needs to follow the zigzag path specified.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolswitchthesprayoffschoola33")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nL = null;
              let nU = null;
              let nD = null;
              let nR = null;
              if (blocks.length > 0) {
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("key pressed up") ) {
                    nU = blocks[k];
                  }
                  if (s.includes("key pressed down") ) {
                    nD = blocks[k];
                  }
                  if (s.includes("key pressed right") ) {
                    nR = blocks[k];
                  }
                  if (s.includes("key pressed left") ) {
                    nL = blocks[k];
                  }
                }
              } else {
                // nB = blocks;
              }
              if (!nL || !nR || !nU || !nD) {
                window.testResult = "Test failed: can't find the blocks for when the left, right, up or down arrows are pressed.";  
              } else {
                const strL = getAllText(nL);
                const strU = getAllText(nU);
                const strD = getAllText(nD);
                const strR = getAllText(nR);
                if (!strL.toLowerCase().includes("switch") || !strL.toLowerCase().includes("off") || strL.indexOf("off") > strL.indexOf("motion_") ) {
                  window.testResult = "Test failed: you should switch the spray head to 'off' before moving left.";
                } else if (!strR.toLowerCase().includes("switch") || !strR.toLowerCase().includes("off") || strR.indexOf("off") > strR.indexOf("motion_") ) {
                  window.testResult = "Test failed: you should switch the spray head to 'off' before moving right.";
                } else if (!strU.toLowerCase().includes("switch") || !strU.toLowerCase().includes("off") || strU.indexOf("off") > strU.indexOf("motion_") ) {
                  window.testResult = "Test failed: you should switch the spray head to 'off' before moving up.";
                } else if (!strD.toLowerCase().includes("switch") || !strD.toLowerCase().includes("off") || strD.indexOf("off") > strD.indexOf("motion_") ) {
                  window.testResult = "Test failed: you should switch the spray head to 'off' before moving down.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schooladd3dirschoola33")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nL = null;
              let nU = null;
              let nD = null;
              let found = 0;
              if (blocks.length > 0) {
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("key pressed up") ) {
                    nU = blocks[k];
                  }
                  if (s.includes("key pressed down") ) {
                    nD = blocks[k];
                  }
                  if (s.includes("key pressed left") ) {
                    nL = blocks[k];
                  }
                }
              } else {
                // nB = blocks;
              }
              if (!nL || !nU || !nD) {
                window.testResult = "Test failed: can't find the blocks for when the left, up or down arrows are pressed.";  
              } else {
                const strL = getAllText(nL);
                const strU = getAllText(nU);
                const strD = getAllText(nD);
                if (!strL.toLowerCase().includes("motion_jrleft")) {
                  window.testResult = "Test failed: you should move the spray head left when the left arrow is pressed.";
                } else if (!strU.toLowerCase().includes("motion_jrup")) {
                  window.testResult = "Test failed: you should move the spray head up when the up arrow is pressed.";
                } else if (!strD.toLowerCase().includes("motion_jrdown")) {
                  window.testResult = "Test failed: you should move the spray head down when the down arrow is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          
          if (window.testCondition.includes("TestFinished_Schoolleftrightschoola42")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let nB2 = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed left") ) {
                    nB = blocks[k];
                  }
                  if (s.toLowerCase().includes("key pressed right") ) {
                    nB2 = blocks[k];
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when left arrow key pressed' block.";  
              } else if (!nB2) {
                window.testResult = "Test failed: can't find the 'when right arrow key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const str2 = getAllText(nB2);
                const p = /.*turnleft.*/;
                const p2 = /.*turnright.*/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Tina should turn left when the left arrow is pressed.";
                } else if (!p2.test(str2.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Tina should turn right when the right arrow is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola42")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed g") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when g key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /repeat.*repeat.*if.*touching.*Crab.*else.*.*forward/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Tina should use nested repeat loops to draw a grid when the g key is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schooldrawgridgschoola42")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed g") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when g key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /repeat.*repeat.*4.*forward/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Tina should use nested repeat loops to draw a grid when the g key is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolsquaresschoola42")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed s") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when s key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /repeat.*4.*forward/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Tina should draw a square when the s key is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolmoveforwardupschoola42")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed up") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when up arrow key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*forward.*/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: Tina should move forward when the up arrow is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolgameoverifoncropschoola33")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed space") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when space key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*if.*touching.*say.*over/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: the spray head should say 'Game over!' when the spray head is turned on over a green crop.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolturnonwithspaceschoola33")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.toLowerCase().includes("key pressed space") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when space key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*switch.*on/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should switch the spray head's costume to 'on' when the space key is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          



          if (window.testCondition.includes("TestFinished_Schoolusestepschoola40")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /set.*Step.*1.*forever.*change.*Count.*by.*Step/;
                const p1 = /set.*Step.*1.*forever/;
                if (!p1.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should set the 'Step' variable to 1 before the forever loop.";
                } else if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should change 'Count' by 'Step' in each step.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          if (window.testCondition.includes("TestFinished_Schoolchangecntschoola40")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*forever.*change.*Count.*by.*1.*wait/;
                if (!str.includes("change")) {
                  window.testResult = "Test failed: you should use a 'change variable by' block after saying the value of 'Count'.";
                } else if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not changing 'Count' in each step.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolsaycountforeverschoola40")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*forever.*say.*Count.*seconds.*wait/;
                if (!str.includes("forever")) {
                  window.testResult = "Test failed: you should use a 'forever' block.";
                } else if (!str.includes("say")) {
                  window.testResult = "Test failed: you should use a 'say' block to say the value of 'Count' for 1 second.";
                } else if (!str.includes("wait")) {
                  window.testResult = "Test failed: you should use a 'wait' block after saying the value of 'Count'.";
                } else if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program is not repeatedly saying the value of 'Count'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolresettingthecostumeschoola32")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*switch.*level0/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should switch the camera's costume to 'level0' when the green flag is clicked.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoollevelupcamschoola32")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite touches' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*panda.*say.*Panda/;
                const p2 = /.*panda.*next.*costume/;
                if (!p2.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should switch the camera to the next level costume when it touches a panda.";
                } else if (p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should remove the 'say Panda' block.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schooldetectingpandasnearbyschoola32")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite touches' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*panda.*say.*Panda/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: the camera should say 'Panda' when it touches the panda.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          

          if (window.testCondition.includes("TestFinished_Schoolincreasescoreschoola39")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /change.*Score.*by.*1.*/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you should change 'Score' by 1 when the cookie sprite is clicked.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          
          if (window.testCondition.includes("TestFinished_Schoolbubbleanischoola40")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /change.*size.*\-10.*repeat.*10.*change.*size.*1/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: when the bubble is clicked, you should change the bubble's size by -10, then grow it by 1 for 10 times.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          

          if (window.testCondition.includes("TestFinished_Schoolsetting5forbuttleschoola40")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /set.*Step.*5/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: when the bubble is clicked, you should set 'Step' to 5.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          

          if (window.testCondition.includes("TestFinished_Schoolgrowcookielargerschoola39")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /change.*size.*\-10.*repeat.*15.*change.*size.*1/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: when the cookie is clicked, you should change its size by -10 first, then increase it by 1 for 15 times.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolsizeanischoola39")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /setsize.*90.*repeat.*10.*change.*size.*1/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: when the cookie is clicked, you should set its size to 90 then increase it by 1 for 10 times.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          if (window.testCondition.includes("TestFinished_Schoolblackandwhitepanelschoola31")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("whenthisspriteclicked")) {
                  window.testResult = "Test failed: you should use the 'when this sprite clicked' block.";
                } else if (!str.includes("nextcostume")) {
                  window.testResult = "Test failed: you should run the 'next costume' block when the panel sprite is clicked .";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schooljumptousaschoola31")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("key pressed") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when key pressed' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("key pressed u")) {
                  window.testResult = "Test failed: you should use the 'when u key pressed' block.";
                } else if (!str.includes("switchcostume") || !str.includes("USA")) {
                  window.testResult = "Test failed: you should switch the costume to 'USA' when key 'u' is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }



          if (window.testCondition.includes("TestFinished_SchoolDanisaysHello")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("say")) {
                  window.testResult = "Test failed: you should use the 'say' block below the 'when the flag is clicked' block.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  


          
          if (window.testCondition.includes("TestFinished_Schooljoincollectbooksschoola26")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("touch") && s.includes("when") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite touches' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*hide.*/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you did not add the new blocks correclty to hide the book when it touches Joy.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola26")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("click") && s.includes("when") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*hide.*/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you did not add the new blocks correclty to hide the chair when it is clicked.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolturnaroundschoola26")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("space") && s.includes("when") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when space key pressed' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*up.*right.*down.*left/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you did not add the new blocks correclty to turn Joy around.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schoolshowing2rollingpicschoola24")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /.*switchcostume.*center.*repeat.*nextcostume.*center.*repeat.*/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you did not add the new blocks correclty.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          
          if (window.testCondition.includes("TestFinished_Schoolshowallpicschoola24")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /switchcostume.*forever.*center.*repeat.*nextcostume/;
                const p2 = /switchcostume.*forever/;
                var count = (str.match(/repeat/g) || []).length;
                if (!str.includes("forever")) {
                  window.testResult = "Test failed: you did not use the 'forever' block.";
                } else if (!p2.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you did not add the 'forever' block correctly.";
                } else if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: you did not modify the program correclty.";
                } else if (count != 1) {
                  window.testResult = "Test failed: you should only use the 'repeat' block once.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          

          if (window.testCondition.includes("TestFinished_Schoolsaycostumename24")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                const p = /forever.*say.*costume.*name/;
                if (!p.test(str.replace(/\r?\n|\r/g, ""))) {
                  window.testResult = "Test failed: your program did not say the costume name correclty.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolhandleother3keyschoola19")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("keypressed right arrow") || !str.includes("motion_jrright")) {
                  window.testResult = "Test failed: you should add the blocks to move right when the right arrow key is pressed.";
                } else if (!str.includes("keypressed left arrow") || !str.includes("motion_jrleft")) {
                  window.testResult = "Test failed: you should add the blocks to move left when the left arrow key is pressed.";
                } else if (!str.includes("keypressed down arrow") || !str.includes("motion_jrdown")) {
                  window.testResult = "Test failed: you should add the blocks to move down when the down arrow key is pressed.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          
          if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola19")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("forever")) {
                  window.testResult = "Test failed: you should use the 'forever' block below the 'when flag clicked' block.";
                } else if (!str.includes("if sensing_touchingobject truck") ) {
                  window.testResult = "Test failed: you should use the 'if then else' block to check if the can is touching the truck.";
                } else if (!str.includes("hide") || !str.includes("show") ) {
                  window.testResult = "Test failed: you should use the 'hide' and 'show' blocks inside the 'if then else' block.";
                } else if (str.indexOf("show") < str.indexOf("hide") ) {
                  window.testResult = "Test failed: you should use the 'hide' block in the first space for 'if then else', and use the 'show' block in the second space.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Schoolabbysaysholaschoola7")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("wait 6 second")) {
                  window.testResult = "Test failed: you should make Abby wait 6 seconds first.";
                } else if (str.indexOf("say") < str.indexOf("wait")) {
                  window.testResult = "Test failed: Abby should wait 6 seconds before talking.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          
          if (window.testCondition.includes("TestFinished_Schoolabbyhatransschoola7")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("think Hola for 2 seconds")) {
                  window.testResult = "Test failed: you should make Abby think 'Hola' for 2 seconds.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolshowrewardschoola16")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when this sprite touches truck") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite touches truck' block.";  
              } else {
                const str = getAllText(nB);

                var count = (str.match(/wait 0.1/g) || []).length;
                if (!str.includes("switchcostumeto coin1") || !str.includes("switchcostumeto coin7") || !str.includes("switchcostumeto normal")  ) {
                  window.testResult = "Test failed: you should switch the station's costume from 'coin1' to 'coin2'... up to 'coin7', then to 'normal'.";
                } else if (count < 7) {
                  window.testResult = "Test failed: you should add 'wait 0.1 seconds' blocks between the 'switch costume' blocks.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolhidingthecanschoola16")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when this sprite touches truck") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite touches truck' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("hide")) {
                  window.testResult = "Test failed: you should make the can hide when touching the truck.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition.includes("TestFinished_Schooldeeshattransdanischoola7")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("think Hello for 2 seconds")) {
                  window.testResult = "Test failed: you should make Dee's hat think 'Hello' for 2 seconds.";
                } else if (str.indexOf("think Hello") < str.indexOf("wait 3 seconds")) {
                  window.testResult = "Test failed: Dee's hat should wait 3 seconds before showing the translation.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolmrsmithishungreschoola8")) {

            if (!allXML) {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {

              window.testResult = "Test passed!";
              if (!allXML.includes("&&")) {
                window.testResult = "Test failed: you haven't changed your program yet.";
              } else if (!allXML.includes("Joy&&")) {
                window.testResult = "Test failed: you haven't changed Joy's program yet.";
              } else if (!allXML.includes("Smith&&")) {
                window.testResult = "Test failed: you haven't changed Mr. Smith's program yet.";
              } else {
                const parts = allXML.split("&&");
                for (let i = 0; i < parts.length; i+=2) {
                  if (parts[i] == "Joy") {
                    var obj = JSON.parse(convert.xml2json(parts[i+1], {compact: true, spaces: 4}));
                    const blocks = obj.xml.block;
                    let nB = null;
                    if (blocks.length > 0) {
                      let found = 0;
                      for (let k=0; k<blocks.length; k++) {
                        const s = getAllText(blocks[k]);
                        if (s.includes("whenflag") ) {
                          nB = blocks[k];
                          found = 1;
                          break;
                        }
                      }
                    } else {
                      nB = blocks;
                    }
                    if (!nB) {
                      window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
                    } else {
                      const str = getAllText(nB);
                      if (!str.includes("wait 4 seconds")) {
                        window.testResult = "Test failed: you should make Joy wait 4 seconds between the 2 say blocks.";
                      } else if (!str.includes("No problem")) {
                        window.testResult = "Test failed: Joy should say 'No problem. Let me get some snack.'";
                      } else if (!str.includes("How can I help you")) {
                        window.testResult = "Test failed: Joy should say 'How can I help you?'";
                      } else {

                        if (str.indexOf("How can I help you") < str.indexOf("wait 4 seconds") && str.indexOf("wait 4 seconds") < str.indexOf("Let me get some")) {
                        } else {
                          window.testResult = "Test failed: the ordering for the new blocks of Joy is not correct'";
                        }

                      }
                    }      
                  } else if (parts[i] == "Mr. Smith") {
                    
                    var obj = JSON.parse(convert.xml2json(parts[i+1], {compact: true, spaces: 4}));
                    const blocks = obj.xml.block;
                    let nB = null;
                    if (blocks.length > 0) {
                      let found = 0;
                      for (let k=0; k<blocks.length; k++) {
                        const s = getAllText(blocks[k]);
                        if (s.includes("whenflag") ) {
                          nB = blocks[k];
                          found = 1;
                          break;
                        }
                      }
                    } else {
                      nB = blocks;
                    }
                    if (!nB) {
                      window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
                    } else {
                      const str = getAllText(nB);
                      if (!str.includes("wait 12 seconds")) {
                        window.testResult = "Test failed: you should make Mr. Smith wait 12 seconds before saying he is hungry.";
                      } else if (!str.includes("I'm hungry")) {
                        window.testResult = "Test failed: Mr. Smith should say 'I'm hungry.'";
                      } else {
                        if (str.indexOf("wait 12 seconds") < str.indexOf("I'm hungry") ) {

                        } else {
                          window.testResult = "Test failed: the ordering for the new blocks of Mr. Smith is not correct'";
                        }

                      }
                    }


                  }
                }

              }
            }
            






            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schooldeeshattransabbyschoola7")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("wait 1 seconds")) {
                  window.testResult = "Test failed: you should make Dee's hat wait another 1 seconds.";
                } else if (!str.includes("wait 3 seconds")) {
                  window.testResult = "Test failed: Dee's hat should wait 3 seconds before showing the first translation.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          
          if (window.testCondition.includes("TestFinished_Schoolanimationforkeypressschoola17")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);

                if (!str.includes("switchcostumeto down")) {
                  window.testResult = "Test failed: you should switch the key's costume to 'down' first.";
                } else if (!str.includes("wait 1 seconds")) {
                  window.testResult = "Test failed: you should wait 1 seconds after switching to the 'down' costume.";
                } else if (!str.includes("switchcostumeto up")) {
                  window.testResult = "Test failed: you should switch the key's costume to 'up' after waiting 1 second.";
                } else if (str.indexOf("switchcostumeto up") < str.indexOf("switchcostumeto down")) {
                  window.testResult = "Test failed: you should switch the key's costume to 'down' first.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }


          
          if (window.testCondition.includes("TestFinished_Schoolhandlingthedownarrowschoola16")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("when key pressed") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when down arrow key clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (str.indexOf("motion_jrdown") < 0 ) {
                  window.testResult = "Test failed: you should attach a 'move down' block below the 'when down arrow key clicked' block.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (window.testCondition.includes("TestFinished_Schoolinitthetruckasemptyschoola16")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenflag") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when green flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (str.indexOf("switchcostumeto Empty") < 0 ) {
                  window.testResult = "Test failed: you should switch the costume to 'Empty' when the green flag is clicked.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola17")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/say/g) || []).length;
                if (count < 2) {
                  window.testResult = "Test failed: you should add 2 'say' blocks each each key sprite's code.";
                } else if (str.indexOf("switchcostumeto down") > str.indexOf("say") ) {
                  window.testResult = "Test failed: you should insert the say block after the key's costume is changed to 'down'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition.includes("TestFinished_Schoolplaynoteonclickschoola17")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              if (blocks.length > 0) {
                let found = 0;
                for (let k=0; k<blocks.length; k++) {
                  const s = getAllText(blocks[k]);
                  if (s.includes("whenthisspriteclicked") ) {
                    nB = blocks[k];
                    found = 1;
                    break;
                  }
                }
              } else {
                nB = blocks;
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when this sprite clicked' block.";  
              } else {
                const str = getAllText(nB);
                if (!str.includes("play notes 66 for 2 beats")) {
                  window.testResult = "Test failed: you should play the note 66 for 2 beats.";
                } else if (!str.includes("whenthisspriteclicked")) {
                  window.testResult = "Test failed: you should use the event block for 'when this sprite clicked'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

        }

      } else {
        window.testResult = "Test failed: You did not make the change as specified.";
        
        
        if (window.testCondition == "TestFinished_Schoolincrboxsizeschoola43") {
          window.testResult = "Test failed: each box should have longer edges as shown.";
        }
        
        if (window.testCondition == "TestFinished_Schoolcounterschoola43") {
          window.testResult = "Test failed: after drawing 6 boxes, Counter should become 6.";
        }
        
        if (window.testCondition == "TestFinished_Schooladdorangeschoola37") {
          window.testResult = "Test failed: you need to add an orange sprite and set its size to 160.";
        }
        
        if (window.testCondition == "TestFinished_Schooladdbackdropschool") {
          window.testResult = "Test failed: please add the backdrop named 'school'.";
        }

        if (window.testCondition.includes("TestFinished_Schooladddanianddeeschoola6")) {
          window.testResult = "Test failed: please add the 2 sprites for Dani and Dee.";
        }


        if (window.testCondition.includes("TestFinished_Schoolmovingandresizing")) {
          window.testResult = "Test failed: please change Dani's size to 40 and move her to the middle.";
        }
        
        
        if (window.testCondition.includes("TestFinished_Schooladjustspritesschoola8")) {
          window.testResult = "Test failed: please move and resize the 2 sprites as instructed.";
        }

        
        if (window.testCondition.includes("TestFinished_Schooljoymovestosmithschoola8")) {
          window.testResult = "Test failed: Joy needs to move next to Mr. Smith.";
        }

        
        if (window.testCondition.includes("TestFinished_Schooljoymovestokitchenschoola8")) {
          window.testResult = "Test failed: Joy needs to move into the kitchen.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola8")) {
          window.testResult = "Test failed: Joy needs to move from the Kitchen back to Mr. Smith";
        }

        
        if (window.testCondition.includes("TestFinished_Schooladdmorekeysschoola17")) {
          window.testResult = "Test failed: please add all 6 keys.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolpickupthecanschoola16")) {
          window.testResult = "Test failed: please drive the truck to the can, and its costume should then switch to 'Empty'.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolhidingthecanschoola16")) {
          window.testResult = "Test failed: please drive the truck to the can to pick it up.";
        }

        
        if (window.testCondition.includes("TestFinished_Schooldropofftheloadschoola16")) {
          window.testResult = "Test failed: please drive the truck to the station after picking up the can.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolshowrewardschoola16")) {
          window.testResult = "Test failed: please drive the truck to the station after picking up the can.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola16")) {
          window.testResult = "Test failed: please drive the truck to the cardboard, and its costume should switch to 'Loaded'.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolcollectingthecanschoola19")) {
          window.testResult = "Test failed: please drive the truck to the can, and its costume should switch to 'Loaded'.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola19")) {
          window.testResult = "Test failed: please drive the truck to the can, and then the can should hide itself.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolhandlingthedownarrowschoola26")) {
          window.testResult = "Test failed: please move Joy to the bottom by pressing the 'down arrow' key.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolhandlingtheleftrightarrowschoola26")) {
          window.testResult = "Test failed: please move Joy to the apple using the keyboard.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolturnaroundschoola26")) {
          window.testResult = "Test failed: please make Joy turn around when you press the SPACE key.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola32")) {
          window.testResult = "Test failed: can't find all 5 camera sprites.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolchangedice6schoola36")) {
          window.testResult = "Test failed: the dice should be changed to 6.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolchangingthediceto5then2schoola36")) {
          window.testResult = "Test failed: the dice should be changed to 5 then 2.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolmoveandcountschoola36")) {
          window.testResult = "Test failed: the dice should move 9 times, and increase its value by 1 each time.";
        }



        
        if (window.testCondition.includes("TestFinished_Schoolresetschoola38")) {
          window.testResult = "Test failed: please set all 3 variables to 0.";
        }
      
        
        if (window.testCondition.includes("TestFinished_Schoolleftrightschoola42")) {
          window.testResult = "Test failed: please move Tina to draw the square using the keyboard.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolsquaresschoola42")) {
          window.testResult = "Test failed: please move Tina to draw the 4 squares using the keyboard.";
        }

        
        if (window.testCondition.includes("TestFinished_Schooldrawgridgschoola42")) {
          window.testResult = "Test failed: please move Tina to draw the given pattern using the keyboard.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoola42")) {
          window.testResult = "Test failed: please press the 'g' key to move Tina, and she should stop on touching the crab.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolsepboxschoola43")) {
          window.testResult = "Test failed: please draw the square boxes separated as shown in the animation.";
        }

        
        if (window.testCondition.includes("TestFinished_Schooldottedschoolb6")) {
          window.testResult = "Test failed: your program needs to cover the dotted line.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolnestedchoolb6")) {
          window.testResult = "Test failed: your program needs to cover the 3 squares.";
        }

        
        if (window.testCondition.includes("TestFinished_Schoolbilingaltimehelloschoolb6")) {
          window.testResult = "Test failed: your program needs to cover the 6 lines of the ladder.";
        }

        // eeee
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult); 

    } else if (window.testCondition.indexOf("TestFinished_Tina") == 0) {

      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Tinadrawthenumber2schoola5", "TestFinished_TinadrawthelttterCschoola5", "TestFinished_TinaDrawtheletterEschoola5", "TestFinished_Tinadebugsquare", "TestFinished_Tinadebugthehat", "TestFinished_TinaDrawthe8", "TestFinished_TinaDrawnumber7ch", "TestFinished_TinadrawletterUsp", "TestFinished_Tinadrawthegivenpatterna12"]; // 
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          window.testResult = "Test passed!";

          if (window.testCondition.includes("TestFinished_Cocohomeinsteps_")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let found = 0;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (s.includes("whenflag") ) {
                  nB = blocks[k];
                  found = 1;
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/motion_/g) || []).length;
  
                if (count != steps) {
                  window.testResult = "Test failed: you should use " + steps + " arrow blocks when the flag is clicked.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

        }

      } else {
        window.testResult = "Test failed: Tina did not draw as expected.";
        
        if (window.testCondition == "TestFinished_Tinadrawthenumber2schoola5") {
          window.testResult = "Test failed: Tina needs to draw the number '2'.";
        }

        if (window.testCondition.includes("TestFinished_TinadrawthelttterCschoola5")) {
          window.testResult = "Test failed: Tina needs to draw the letter 'C'.";
        }

        if (window.testCondition.includes("TestFinished_TinaDrawtheletterEschoola5")) {
          window.testResult = "Test failed: Tina needs to draw the letter 'E'.";
        }

        if (window.testCondition.includes("TestFinished_Tinadebugsquare")) {
          window.testResult = "Test failed: Tina needs to draw the square correctly.";
        }
        
        
        if (window.testCondition.includes("TestFinished_Tinadebugthehat")) {
          window.testResult = "Test failed: Tina needs to draw the hat correctly.";
        }

        if (window.testCondition.includes("TestFinished_TinaDrawthe8")) {
          window.testResult = "Test failed: Tina needs to draw the number '8' correctly.";
        }

        

        if (window.testCondition.includes("TestFinished_TinaDrawnumber7ch")) {
          window.testResult = "Test failed: Tina needs to draw the Chinese number '7' correctly.";
        }

        if (window.testCondition.includes("TestFinished_TinadrawletterUsp")) {
          window.testResult = "Test failed: Tina needs to draw the letter 'U' correctly.";
        }
        
        
        if (window.testCondition.includes("TestFinished_Tinadrawthegivenpatterna12")) {
          window.testResult = "Test failed: Tina did not draw the pattern correctly.";
        }
        
        // 
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult); 



    } else if (window.testCondition.indexOf("TestFinished_Truck") == 0) {

      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_TruckSquarePath", "TestFinished_Truckzigzagpath", "TestFinished_Trucknorthorsouth", "TestFinished_TruckDropoffatstation", "TestFinished_TruckBestoutof3", "TestFinished_TruckBestoutof4", "TestFinished_Trucksearchbestvaluesrl2", "TestFinished_Trucksearchbydistance", "TestFinished_TruckDistancetoStation", "TestFinished_Truckupgradecapacity", "TestFinished_Truckcollectuptofullload", "TestFinished_Truckcapacityfirstallosrl3", "TestFinished_Truckrotationstrategyslr3", "TestFinished_Truckpredefinedlistslr3", "TestFinished_Truckupgradingstationssrl4", "TestFinished_Truckselectthebeststationsrl4", "TestFinished_Truckimprovingcalcdistantsrl4", "TestFinished_Truckgothrougeastslr4", "TestFinished_Truckgothroughsouthslr4"]; // ddddd
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {
          window.testResult = "Test passed!";

          if (window.testCondition.includes("TestFinished_TruckRandomitem")) {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let found = 0;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (s.includes("when I receive start") ) {
                  nB = blocks[k];
                  found = 1;
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);
                // var count = (str.match(/motion_/g) || []).length;
  
                if (str.indexOf("pick random") < 0 || str.indexOf("length of") < 0 ) {
                  window.testResult = "Test failed: you should set 'index' using the 'pick random' block and the length of 'waste x'.";
                } else if (str.indexOf("item 'index' of waste x") < 0 ) {
                  window.testResult = "Test failed: you should use 'index' to read from the 'waste x' list.";
                } else if (str.indexOf("item 'index' of waste y") < 0 ) {
                  window.testResult = "Test failed: you should use 'index' to read from the 'waste y' list.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

        }

      } else {
        window.testResult = "Test failed: the truck did not perform the action correctly.";
        
        if (window.testCondition == "TestFinished_TruckSquarePath") {
          window.testResult = "Test failed: the 2 trucks need to move in a square path then stop.";
        }

        if (window.testCondition == "TestFinished_Truckzigzagpath") {
          window.testResult = "Test failed: the 2 trucks need to move in a zigzag path then stop.";
        }

        if (window.testCondition == "TestFinished_Trucknorthorsouth") {
          window.testResult = "Test failed: the 2 trucks should both stop at the waste item's position.";
        }

        if (window.testCondition == "TestFinished_TruckDropoffatstation") {
          window.testResult = "Test failed: the 2 trucks should repeatedly pick up a waste item and drop it off at station 1.";
        }
        
        if (window.testCondition.includes("TestFinished_TruckRandomitem")) {
          window.testResult = "Test failed: the trucks did not earn any coins.";
        }

        
        if (window.testCondition.includes("TestFinished_TruckBestoutof3")) {
          window.testResult = "Test failed: the trucks did not go to the best item among these 3.";
        }


        if (window.testCondition.includes("TestFinished_TruckBestoutof4")) {
          window.testResult = "Test failed: the trucks did not go to the best item among these 4.";
        }


        if (window.testCondition.includes("TestFinished_Trucksearchbestvaluesrl2")) {
          window.testResult = "Test failed: the trucks did not go to the item with the most value.";
        }

        
        if (window.testCondition.includes("TestFinished_Trucksearchbydistance")) {
          window.testResult = "Test failed: the trucks did not go to the item with the shortest travel distance from the truck.";
        }
        
        
        if (window.testCondition.includes("TestFinished_TruckDistancetoStation")) {
          window.testResult = "Test failed: the trucks did not go to the item with the shortest total travel distance from the truck to the station.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckupgradecapacity")) {
          window.testResult = "Test failed: the yellow truck should upgrade capacity to 3.";
        }


        if (window.testCondition.includes("TestFinished_Truckcollectuptofullload")) {
          window.testResult = "Test failed: the yellow truck should pick up 3 items before going to the station.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckcapacityfirstallosrl3")) {
          window.testResult = "Test failed: the yellow truck should upgrade capacity to 3.";
        }
        
        
        if (window.testCondition.includes("TestFinished_Truckrotationstrategyslr3")) {
          window.testResult = "Test failed: the yellow truck should upgrade capacity and speed alternatively.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckpredefinedlistslr3")) {
          window.testResult = "Test failed: the upgrades should match the predefined list.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckupgradingstationssrl4")) {
          window.testResult = "Test failed: your truck should upgrade capacity, then station, then speed, then station initially.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckselectthebeststationsrl4")) {
          window.testResult = "Test failed: your truck should select the closest station.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckimprovingcalcdistantsrl4")) {
          window.testResult = "Test failed: your truck should select the waste item with the shortest travel distance considering all stations.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckgothrougeastslr4")) {
          window.testResult = "Test failed: your truck should go through the east border to pick up the can.";
        }

        
        if (window.testCondition.includes("TestFinished_Truckgothroughsouthslr4")) {
          window.testResult = "Test failed: your truck should go through the south border to pick up the can.";
        }

        // ddddd
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult); 


    } else if (window.testCondition.indexOf("TestFinished_Coco") == 0) {

      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Cocogethomeschoola2", "TestFinished_Cocogetbonehome", "TestFinished_Cocococogethomeschoola10"]; // 
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
          if (window.currentChosenLocale == "CH") {
            window.testResult = "成功通过测试!";
          }
        } else {

          window.testResult = "Test passed!";

          if (window.testCondition.includes("TestFinished_Cocohomeinsteps_")) {
            const parts = window.testCondition.split("_");
            const steps = parseInt(parts[2]);
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let found = 0;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (s.includes("whenflag") ) {
                  nB = blocks[k];
                  found = 1;
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/motion_/g) || []).length;
  
                if (count != steps) {
                  window.testResult = "Test failed: you should use " + steps + " arrow blocks when the flag is clicked.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          if (window.testCondition.includes("TestFinished_Cocousing2repeatsp2schoola10")) {
            const parts = window.testCondition.split("_");
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let found = 0;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (s.includes("whenflag") ) {
                  nB = blocks[k];
                  found = 1;
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/repeat/g) || []).length;
  
                if (count != 2) {
                  window.testResult = "Test failed: you should use 2 repeat blocks.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  


          if (window.testCondition.includes("TestFinished_Cocousing3repeatsp2schoola10")) {
            const parts = window.testCondition.split("_");
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let found = 0;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (s.includes("whenflag") ) {
                  nB = blocks[k];
                  found = 1;
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when flag clicked' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/repeat/g) || []).length;
  
                if (count != 3) {
                  window.testResult = "Test failed: you should use 3 repeat blocks.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  
        }

      } else {
        window.testResult = "Test failed: Coco did not walk home.";
        
        if (window.testCondition == "TestFinished_Cocogetonebonehome") {
          window.testResult = "Test failed: Coco needs to eat the bone and then go home.";
        }

        if (window.testCondition.includes("TestFinished_Cocohomeinsteps_")) {
          window.testResult = "Test failed: Coco needs to eat the bones and then go home.";
        }

        
        if (window.testCondition == "TestFinished_Cocoavoidingmanholeeatbone") {
          window.testResult = "Test failed: Coco needs to eat the bones and then go home safely.";
        }

        
        if (window.testCondition == "TestFinished_Cocococogethomeschoola10") {
          window.testResult = "Test failed: Coco needs to walk home using the specified path.";
          if (window.currentChosenLocale == "CH") {
            window.testResult = "测试失败：Coco需要图示的路线走回家。";
          }          
        }

        
        if (window.testCondition == "TestFinished_Cocousing2repeatsp2schoola10") {
          window.testResult = "Test failed: Coco needs to walk home using the specified path.";
        }

        
        if (window.testCondition == "TestFinished_Cocousing3repeatsp2schoola10") {
          window.testResult = "Test failed: Coco needs to walk home using the specified path.";
        }
        

        // 
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult); 


    } else if (window.testCondition.indexOf("TestFinished_Candy") == 0) {
      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Candyspecifyadifferentswap", "TestFinished_Candychoosingthebestswap", "TestFinished_Candyamoveworthmorethan2000", "TestFinished_Candyearatleast700pointsinonemove", "TestFinished_Candyswapupinsteadredcandy", "TestFinished_Candyswapdownredcandymatch", "TestFinished_Candyswapdownfirstredtype1", "TestFinished_Candyswapget480pointscombine", "TestFinished_Candyhandleoffset3to5", "TestFinished_Candyaddotherformationsusingnewcblock", "TestFinished_Candycheckingthecadythatsswapppedup", "TestFinished_Candygoodenoughonly3", "TestFinished_Candycheckingoneformationright", "TestFinished_Candycheckingthecadythatsswapppedleft1", "TestFinished_Candyreversesearch", "TestFinished_Candybestforwardandbestbackward", "TestFinished_Candycomparerightvsdownforeach", "TestFinished_Candycomparingacrossallcandies1", "TestFinished_Candyhandlingtiesdifferent", "TestFinished_Candycandiesontherightandbottom", "TestFinished_Candyusingthebombcandy", "TestFinished_Candycountingcandiesbytype", "TestFinished_Candychoosingthebestneighbor", "TestFinished_Candysimplifywithanewblock", "TestFinished_Candyusingthebombcandyhw", "TestFinished_Candyusingmod6", "TestFinished_Candyextrapointsforwrappedcandiescha", "TestFinished_Candyextrapointsforrowcolumnstripes", "TestFinished_Candywrappedcandyatbottom", "TestFinished_Candycalcpointsbytype1", "TestFinished_Candyduplicatecandylist", "TestFinished_Candymarkingmatchedcandiesascempty1", "TestFinished_Candyswappingemptyslotstothetop" , "TestFinished_Candyswapwithnonemptyposition", "TestFinished_Candymarkemptyswapdownhw", "TestFinished_Candydetecting3candyformationsinrrows", "TestFinished_Candycascadematchesiwthrewardcandies", "TestFinished_Candydetecting4candycascadematches", "TestFinished_Candy5candymatchescascade", "TestFinished_Candydetecting3candyformationsinrcols", "TestFinished_Candydetecting4candycascadematchincolshw" ]; // 
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          
          if (window.testCondition == "TestFinished_Candyaddingremainingformations2") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = blocks;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);

                var cnt = 0; 
                if (str.includes("call check for match") && str.includes("'index'|'r'|'c'|2|7|0|9") ) cnt ++;
                if (str.includes("call check for match") && str.includes("'index'|'r'|'c'|1|7|2|9") ) cnt ++;

                if (cnt  != 2) {
                  window.testResult = "Test failed: the parameters you added are not correct.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          if (window.testCondition == "TestFinished_Candyaddingremainingformations1") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);

                var cnt = 0; 
                if (str.includes("call check for match") && str.includes("-8") && str.includes("3") && str.includes("240|0") && (str.includes("'index'|'r'|'c'|1|8|0|7") ) ) cnt ++;
                if (str.includes("call check for match") && str.includes("-17") && str.includes("10") && str.includes("280|0") && (str.includes("'index'|'r'|'c'|2|8|0|7") ) ) cnt ++;

                if (cnt  != 2) {
                  window.testResult = "Test failed: the parameters you added are not correct.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition == "TestFinished_Candyswapget480points") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);

                var cnt = 0; 
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|0|8|2|10|7|8|120") || str.includes("'index'|'r'|'c'|0|8|2|10|8|7|120") )  ) cnt ++;
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|0|8|1|9|8|10|120") || str.includes("'index'|'r'|'c'|0|8|1|9|10|8|120") ) ) cnt ++;
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|0|8|0|8|11|10|120") || str.includes("'index'|'r'|'c'|0|8|0|8|10|11|120") ) ) cnt ++;
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|0|6|0|10|18|27|120") || str.includes("'index'|'r'|'c'|0|6|0|10|27|18|120")  )) cnt ++;


                if (cnt  != 4) {
                  window.testResult = "Test failed: the parameters for the 4 'check for match' blocks are not correct.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition == "TestFinished_Candyswapget480pointshw") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);

                var cnt = 0; 
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|1|9|2|10|-10|-11|120") || str.includes("'index'|'r'|'c'|1|9|2|10|-11|-10|120") )  ) cnt ++;
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|1|9|1|9|-8|-10|120") || str.includes("'index'|'r'|'c'|1|9|1|9|-10|-8|120") ) ) cnt ++;
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|1|9|0|8|-7|-8|120") || str.includes("'index'|'r'|'c'|1|9|0|8|-8|-7|120") ) ) cnt ++;
                if (str.includes("call check for match") && (str.includes("'index'|'r'|'c'|3|9|0|10|-18|-27|120") || str.includes("'index'|'r'|'c'|3|9|0|10|-27|-18|120")  )) cnt ++;


                if (cnt  != 4) {
                  window.testResult = "Test failed: the parameters for the 4 'check for match' blocks are not correct.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
        }
      } else {
        window.testResult = "Test failed: you did not find the correct move!";
        if (window.testCondition == "TestFinished_Candyspecifyadifferentswap") {
          window.testResult = "Test failed: your AI controller did not find a valid swap.";
        }
        if (window.testCondition == "TestFinished_Candychoosingthebestswap" || window.testCondition == "TestFinished_Candyearatleast700pointsinonemove" ) {
          window.testResult = "Test failed: your AI controller did not find a move worth 700 points or more.";
        }
        if (window.testCondition == "TestFinished_Candyamoveworthmorethan2000") {
          window.testResult = "Test failed: your AI controller did not find a move worth 2000 points or more.";
        }

        if (window.testCondition == "TestFinished_Candyswapdownfirstredtype1") {
          window.testResult = "Test failed: your AI controller did not find the first red candy to swap down.";
        }
        
        if (window.testCondition == "TestFinished_Candyswapdownredcandymatch" || window.testCondition == "TestFinished_Candyswapupinsteadredcandy") {
          window.testResult = "Test failed: your AI controller did not find the match.";
        }

        
        if (window.testCondition == "TestFinished_Candyswapget480points" || window.testCondition == "TestFinished_Candyswapget480pointscombine" || window.testCondition == "TestFinished_Candyswapget480pointshw") {
          window.testResult = "Test failed: your AI player should earn at least 480 points in 10 seconds.";
        }
        
      
        if (window.testCondition == "TestFinished_Candyhandleoffset3to5" || window.testCondition == "TestFinished_Candyaddotherformationsusingnewcblock") {
          window.testResult = "Test failed: your AI controller did not find the correct matches.";
        }
        
        if (window.testCondition == "TestFinished_Candycheckingthecadythatsswapppedup") {
          window.testResult = "Test failed: you did not put in the correct parameters.";
        }

        
        if (window.testCondition == "TestFinished_Candygoodenoughonly3") {
          window.testResult = "Test failed: your AI controller did not skip the checks as expected.";
        }

        
        if (window.testCondition == "TestFinished_Candycheckingoneformationright") {
          window.testResult = "Test failed: your AI controller did not find the correct swap to the right.";
        }

        
        if (window.testCondition == "TestFinished_Candycheckingthecadythatsswapppedleft1") {
          window.testResult = "Test failed: your AI controller did not find the correct swap to the right.";
        }

        
        if (window.testCondition == "TestFinished_Candyreversesearch") {
          window.testResult = "Test failed: your AI controller did not search from the bottom first.";
        }

        
        if (window.testCondition == "TestFinished_Candyaddingremainingformations1" || window.testCondition == "TestFinished_Candyaddingremainingformations2") {
          window.testResult = "Test failed: your AI player did not find the correct swap.";
        }

        
        if (window.testCondition == "TestFinished_Candybestforwardandbestbackward") {
          window.testResult = "Test failed: your AI controller did not calculate 'best forward' and 'best backward' correctly.";
        }

        
        if (window.testCondition == "TestFinished_Candycomparerightvsdownforeach" || window.testCondition == "TestFinished_Candycomparingacrossallcandies1" || window.testCondition == "TestFinished_Candyhandlingtiesdifferent" ) {
          window.testResult = "Test failed: your AI controller did not make the correct swap.";
        }

        
        if (window.testCondition == "TestFinished_Candycandiesontherightandbottom") {
          window.testResult = "Test failed: your AI controller did not check the correct number of moves.";
        }

        
        if (window.testCondition == "TestFinished_Candyusingthebombcandy") {
          window.testResult = "Test failed: your AI controller did not swap the bomb candy down.";
        }

        
        if (window.testCondition == "TestFinished_Candycountingcandiesbytype") {
          window.testResult = "Test failed: your AI controller did not count the candies by type correctly.";
        }

        
        if (window.testCondition == "TestFinished_Candychoosingthebestneighbor" || window.testCondition == "TestFinished_Candysimplifywithanewblock" ) {
          window.testResult = "Test failed: your AI controller did not swap the bomb candy with the best neighbor.";
        }
        if (window.testCondition == "TestFinished_Candyusingthebombcandyhw") {
          window.testResult = "Test failed: your AI controller did not swap the bomb candy with the worst neighbor.";
        }
        
        if (window.testCondition == "TestFinished_Candyusingmod6") {
          window.testResult = "Test failed: your AI controller did not match the wrapped candy with ordinary ones.";
        }
        
        if (window.testCondition == "TestFinished_Candyextrapointsforwrappedcandiescha") {
          window.testResult = "Test failed: your AI controller did not properly account for the extra points for the wrapped candy.";
        }

        
        if (window.testCondition == "TestFinished_Candyextrapointsforrowcolumnstripes") {
          window.testResult = "Test failed: your AI controller should try to match the orange candy with row stripes.";
        }
        
        if (window.testCondition == "TestFinished_Candywrappedcandyatbottom") {
          window.testResult = "Test failed: your AI controller did not calculate the total points for the wrapped candy correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candycalcpointsbytype1") {
          window.testResult = "Test failed: your AI controller did not calculate the points for bombing the wrapped candies correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candyduplicatecandylist") {
          window.testResult = "Test failed: your AI controller did not copy CandyList to CandyList2 correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candymarkingmatchedcandiesascempty1") {
          window.testResult = "Test failed: your AI controller did not set the empty slots to 0 in CandyList2 correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candyswappingemptyslotstothetop") {
          window.testResult = "Test failed: your AI controller did not swap all the empty slots to the top correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candyswapwithnonemptyposition") {
          window.testResult = "Test failed: your AI controller did not swap all the empty slots to the top in one round.";
        }
        
        if (window.testCondition == "TestFinished_Candymarkemptyswapdownhw") {
          window.testResult = "Test failed: your AI controller did not set all matched candies to empty for swapping down.";
        }
        
        if (window.testCondition == "TestFinished_Candydetecting3candyformationsinrrows") {
          window.testResult = "Test failed: your AI controller did not calculate the cascade points correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candycascadematchesiwthrewardcandies") {
          window.testResult = "Test failed: your AI controller did not account for the cascade match with reward candies correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candydetecting4candycascadematches") {
          window.testResult = "Test failed: your AI controller did not account for the 4-candy cascade match correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candy5candymatchescascade") {
          window.testResult = "Test failed: your AI controller did not account for the 5-candy cascade match correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candydetecting3candyformationsinrcols") {
          window.testResult = "Test failed: your AI controller did not account for 3-candy cascade matchs in columns correctly.";
        }
        
        if (window.testCondition == "TestFinished_Candydetecting4candycascadematchincolshw") {
          window.testResult = "Test failed: your AI controller did not account for 4-candy cascade matchs in columns correctly.";
        }
        //  
      }


      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult);      



    } else if (window.testCondition.indexOf("TestFinished_Turtle") == 0) {
      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Turtledrawingasquareturtle", "TestFinished_Turtleanequilateraltriangleturtle", "TestFinished_Turtledrawoctagon", "TestFinished_Turtledrawaszigzagturtle", "TestFinished_Turtledrawacricleusingrepeatturtle", "TestFinished_Turtleashrikningmazeturtle", "TestFinished_Turtlestopwhentheturtltaoucheedgeturtle", "TestFinished_Turtledrawstop100", "TestFinished_Turtledrawpentagonmazeturtle", "TestFinished_Turtlestoppingatthecrabturtle", "TestFinished_Turtlea3dballturtle", "TestFinished_Turtleadding3dballs2moreturtle", "TestFinished_Turtledrawabigturtleturtle", "TestFinished_Turtle3levelnestedloops", "TestFinished_Turtlestarofstartsturtle", "TestFinished_Turtledrawgrowingstarsturtle", "TestFinished_Turtlethegridforagoboardturtle", "TestFinished_Turtlepaintthegogameboardturtle", "TestFinished_Turtlethecopetegogameboardrturtle", "TestFinished_Turtlesixgreendotsturtle", "TestFinished_Turtledrawtotheeggsturtleiak", "TestFinished_Turtledrawasquareturtleiak", "TestFinished_Turtledrawarectangleturtleiak", "TestFinished_Turtleflytotheleftturtle", "TestFinished_Turtleflyupdanddownturtle", "TestFinished_Turtlepaintingrectanglesrturtle", "TestFinished_Turtledrawroofandchimneyrturtle", "TestFinished_Turtleadding2wheelsrturtle", "TestFinished_Turtlewagonsandwheelsturtle", "TestFinished_Turtledrawconnectorsandcoverssturtle" ]; // ccccc
        // if (window.testCondition == "TestFinished_Tank" || window.testCondition == "TestFinished_TankRandom4" || window.testCondition == "TestFinished_TankNewPath" || window.testCondition == "TestFinished_TankRandom5" || window.testCondition == "TestFinished_TankPick2Crystals" ) {
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          window.testResult = "Test passed!";

          if (window.testCondition == "TestFinished_Turtledrawwithapentagonblocklturtle") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let found = 0;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (s.includes("define") && s.includes("pentagon") ) found = 1;
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived" && s.includes("start")) {
                  nB = blocks[k];
                  // break;
                }
              }
              if (!found) {
                window.testResult = "Test failed: you haven't defined the new block 'pentagon' yet.";  
              } else if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/call pentagon/g) || []).length;
  
                if (count != 3) {
                  window.testResult = "Test failed: you should call the 'pentagon' block 3 times in the main script.";
                } else if ( str.includes("turn") || str.includes("repeat") || str.includes("draw") ) {
                  window.testResult = "Test failed: the main script should only contain 'square' and 'pentagon' blocks.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  

          

          if (window.testCondition == "TestFinished_Turtletheshapeblockturtle") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived" && s.includes("start")) {
                  nB = blocks[k];
                  // break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/call shape/g) || []).length;
  
                if (count != 2) {
                  window.testResult = "Test failed: you should call the 'shape' block 2 times in the main script.";
                } else if ( str.includes("turn") || str.includes("draw") ) {
                  window.testResult = "Test failed: the main script should only contain 'shape' and 'repeat' blocks.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (window.testCondition == "TestFinished_Turtlechangingtodotcolorsturtle") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived" && s.includes("start")) {
                  nB = blocks[k];
                  // break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const str = getAllText(nB);
                const lines = str.split("\n");
                let found1 = 0;
                let found2 = 0;
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];
                  if (line.indexOf("polygon") && line.includes("color") ) {
                    found1 = 1;
                  }
                  if (line.includes("change") && line.includes("color") && line.includes("16")) {
                    found2 = 1;
                  }
                }
  
                if ( !found1 ) {
                  window.testResult = "Test failed: you should use the 'color' vairable as a parameter of the 'polygon' block.";
                } else if ( !found2 ) {
                  window.testResult = "Test failed: you should increment the 'color' vairable by 16 in the repeat loop.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }
          
          
          if (window.testCondition == "TestFinished_Turtlethecolorparameterturtle") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let pB = null;
              let sB = null;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived" && s.includes("start")) {
                  nB = blocks[k];
                }
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode.includes("polygon")) {
                  pB = blocks[k];
                }
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode.includes("shape")) {
                  sB = blocks[k];
                }

              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else if (!sB) {
                window.testResult = "Test failed: can't find the definition of the 'shape' block.";  
              } else if (!pB) {
                window.testResult = "Test failed: can't find the definition of the 'polygon' block.";  
              } else {
                const str = getAllText(pB);
                const sstr = getAllText(sB);
                const wstr = getAllText(nB);
                if (!str.includes("set pen color")) {
                  window.testResult = "Test failed: you should set the pen color in the 'polygon' block.";
                } else if (!sstr.includes("set pen color")) {
                  window.testResult = "Test failed: you should set the pen color in the 'shape' block.";
                } else if (!str.includes("define polygon %s %s %s")) {
                  window.testResult = "Test failed: the 'polygon' block should take 3 input parameters of 'side count', 'length' and 'color'.";
                } else if (!sstr.includes("define shape %s %s %s %s")) {
                  window.testResult = "Test failed: the 'shape' block should take 4 input parameters of 'count', 'length', 'angle' and 'color'.";
                } else if (!wstr.includes("6|15|80")) {
                  window.testResult = "Test failed: you should draw the hexagon with a color of 80.";
                } else if (!wstr.includes("8|15|60")) {
                  window.testResult = "Test failed: you should draw the octagon with a color of 60.";
                } else if (!wstr.includes("3|15|10|40")) {
                  window.testResult = "Test failed: you should draw the circle with a color of 40.";
                } else {
                  window.testResult = "Test Passed!";
                }
              }
            }
          }



          if (window.testCondition == "TestFinished_Turtle3petalflower") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived" && s.includes("start")) {
                  nB = blocks[k];
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else {
                const wstr = getAllText(nB);
                if (!wstr.includes("36|2|60")) {
                  window.testResult = "Test failed: you should draw the small circles with a color of 60.";
                } else if (!wstr.includes("6|15|10|40")) {
                  window.testResult = "Test failed: you should draw the arc with a color of 40.";
                } else {
                  window.testResult = "Test Passed!";
                }
              }
            }
          }


          
          if (window.testCondition == "TestFinished_Turtlethestarshapeblockturtle") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              let sB = null;
              for (let k=0; k<blocks.length; k++) {
                const s = getAllText(blocks[k]);
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived" && s.includes("start")) {
                  nB = blocks[k];
                }
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode.includes("starshape")) {
                  sB = blocks[k];
                }                
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'when I receive' block.";  
              } else if (!sB) {
                window.testResult = "Test failed: can't find the definition of the 'starshape' block.";  
              
              } else {
                const wstr = getAllText(nB);
                const sstr = getAllText(sB);

                if (!wstr.includes("starshape")) {
                  window.testResult = "Test failed: you should use the 'starshape' block.";
                } else if (!wstr.includes("5|60|60")) {
                  window.testResult = "Test failed: you should use the 'starshape' block with parameters of 5, 60 and 60.";
                } else if (sstr.includes(" 60") || sstr.includes("72") ) {
                  window.testResult = "Test failed: the 'starshape' block should use the 3 input parameters for repeat count, drawing length and turning angle.";
                } else {
                  window.testResult = "Test Passed!";
                }
              }
            }
          }




        }

      } else {
        window.testResult = "Test failed: the turtle did not draw the specified pattern correctly.";
        
        if (window.testCondition == "TestFinished_Turtledrawingasquareturtle") {
          window.testResult = "Test failed: the turtle did not draw the square correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtleanequilateraltriangleturtle") {
          window.testResult = "Test failed: the turtle did not draw the triangle correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawoctagon") {
          window.testResult = "Test failed: the turtle did not draw the octagon correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawaszigzagturtle") {
          window.testResult = "Test failed: the turtle did not draw the staircase shape correctly.";
        }


        if (window.testCondition == "TestFinished_Turtledrawacricleusingrepeatturtle") {
          window.testResult = "Test failed: the turtle did not draw the circle shape correctly.";
        }

        if (window.testCondition == "TestFinished_Turtleashrikningmazeturtle") {
          window.testResult = "Test failed: the turtle did not draw the shrinking maze correctly.";
        }

        if (window.testCondition == "TestFinished_Turtlestopwhentheturtltaoucheedgeturtle") {
          window.testResult = "Test failed: the turtle did not draw the maze and stop when touching an edge.";
        }

        if (window.testCondition == "TestFinished_Turtledrawstop100") {
          window.testResult = "Test failed: the turtle did not draw the maze inside the blue square correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawpentagonmazeturtle") {
          window.testResult = "Test failed: the turtle did not draw the pentagon maze correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtlestoppingatthecrabturtle") {
          window.testResult = "Test failed: the turtle should draw the pentagon maze and stop when touching the crab.";
        }

        
        if (window.testCondition == "TestFinished_Turtlea3dballturtle") {
          window.testResult = "Test failed: the turtle did not draw the 3D ball correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtleadding3dballs2moreturtle") {
          window.testResult = "Test failed: the turtle did not draw the four 3D balls as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawabigturtleturtle") {
          window.testResult = "Test failed: the turtle did not draw the big turtle pattern as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtle3levelnestedloops") {
          window.testResult = "Test failed: the turtle did not draw the given pattern as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtlethegridforagoboardturtle") {
          window.testResult = "Test failed: the turtle did not draw the grid lines as specified.";
        }


        
        if (window.testCondition == "TestFinished_Turtlepaintthegogameboardturtle") {
          window.testResult = "Test failed: the turtle did not paint the square board as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtlethecopetegogameboardrturtle") {
          window.testResult = "Test failed: the turtle did not draw and paint the game board with stones as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtlesixgreendotsturtle") {
          window.testResult = "Test failed: the turtle did not draw and paint the 6 green dots as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtlechangingtodotcolorsturtle") {
          window.testResult = "Test failed: the turtle did not draw and paint the 6 dots as specified.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawtotheeggsturtleiak") {
          window.testResult = "Test failed: the turtle did not draw a line up to the eggs.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawasquareturtleiak") {
          window.testResult = "Test failed: the turtle did not draw the square correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawarectangleturtleiak") {
          window.testResult = "Test failed: the turtle did not draw the rectangle correctly.";
        }
        
        if (window.testCondition == "TestFinished_Turtleflytotheleftturtle") {
          window.testResult = "Test failed: the turtle did not fly to the left correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtleflyupdanddownturtle") {
          window.testResult = "Test failed: the turtle did not fly to the 4 corners correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtlepaintingrectanglesrturtle") {
          window.testResult = "Test failed: the turtle did not paint the rectangle correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawroofandchimneyrturtle") {
          window.testResult = "Test failed: the turtle did not draw the roof and chimney correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtleadding2wheelsrturtle") {
          window.testResult = "Test failed: the turtle did not draw the wheels correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtlewagonsandwheelsturtle") {
          window.testResult = "Test failed: the turtle did not draw the wagon with wheels correctly.";
        }

        
        if (window.testCondition == "TestFinished_Turtledrawconnectorsandcoverssturtle") {
          window.testResult = "Test failed: the turtle did not draw the connectors and covers correctly.";
        }

        // ccccc
      }


      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult); 
      

    } else if (window.testCondition.indexOf("TestFinished_Soccer") == 0) {
      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Soccerchangerandommovementlimit", "TestFinished_Soccermoveplayersbackandup", "TestFinished_Soccermovetowardscenterline", "TestFinished_Soccersettingypositionrelativetoplayer2", "TestFinished_Soccergrabthesoccerballifnottaken", "TestFinished_Soccercalcallplayerdistancetosoccer", "TestFinished_Soccersearchfortheshortestdistanceplayer", "TestFinished_Soccernearestplayereachteam", "TestFinished_Soccercalcplayerdistancetogaoal", "TestFinished_Soccerselectplayertoguardteamgoal", "TestFinished_Soccerdribbletowardsthetargetgoal", "TestFinished_Soccermakingashotfoofthesoccer", "TestFinished_Soccersearchfortheshortestdistanceplayer", "TestFinished_Soccercheckmorepointsintargetgoal", "TestFinished_Soccerstopwsarchingwaftershohting", "TestFinished_Soccerreboundofftopboundaryforgaoal", "TestFinished_Soccerbasicdefenseformationsoccer", "TestFinished_Socceradynamicblockadesoccer", "TestFinished_Socceravoidtheovershootsoccerscratch1", "TestFinished_Soccerdefendbehindnodrill", "TestFinished_Socceranewdefenseformationsoccer", "TestFinished_Soccerinterceptingtheballgoal", "TestFinished_Soccerwhoaremyteammatessoccer", "TestFinished_Soccerseekingtheincomingball", "TestFinished_Soccermoveteamforwardsoccerscratch1", "TestFinished_Soccerpasstofronttteammate", "TestFinished_Soccerdribbleorpasshwsoccer", "TestFinished_Soccerdonotpassifblockedsoccer", "TestFinished_Soccerpassingwithreboundshots", "TestFinished_Soccerreboundshotinbothdirections", "TestFinished_Soccerreboundoffwestandsouthboundary", "TestFinished_Soccercheckteammate2aswellsoccer", "TestFinished_Soccerusingtheslidetoblocksoccer", "TestFinished_Soccerassigningatgoalkeepersoccer", "TestFinished_Soccerinterceptingtehballsoccedr", "TestFinished_Soccerremovegoalkeeperformward", "TestFinished_Soccerreconfigratteammatessoccer", "TestFinished_Soccerbetterpassingfromthegoalkeepersoccer", "TestFinished_Soccerpkcingupthedoubelswppedawar4dsoccer", "TestFinished_Soccerdistancetoaawardsoccer", "TestFinished_Soccergrabtheawardtheother2", "TestFinished_Soccerusingmovetofortheballownersoccer", "TestFinished_Soccergrabthesecondwardsoccer", "TestFinished_Soccershrinkdistanceofdoublespeedplayersoccer", "TestFinished_Soccerswappingteammatessoccer", "TestFinished_Soccersettingthefasterplayerascaptain", "TestFinished_Socceravoidwastingthedoublespeedsoccer", "TestFinished_Soccerswapnamesinsoccer" ]; // bbbb
        // if (window.testCondition == "TestFinished_Tank" || window.testCondition == "TestFinished_TankRandom4" || window.testCondition == "TestFinished_TankNewPath" || window.testCondition == "TestFinished_TankRandom5" || window.testCondition == "TestFinished_TankPick2Crystals" ) {
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {

          window.testResult = "Test passed!";

          if (window.testCondition == "TestFinished_Soccerassignmeoneplayerotgragbthawwrdsoccer") {
            // check for duplication of blocks
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "send next command") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'send next command' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/call pass the ball/g) || []).length;
                var count2 = (str.match(/call dribble or pass/g) || []).length;
  
                if (count > 1 || count2 > 1) {
                  window.testResult = "Test failed: you should not duplicate all the existing blocks.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }  


        }

      } else {
        window.testResult = "Test failed!";
        
        if (window.testCondition == "TestFinished_Soccerchangerandommovementlimit") {
          window.testResult = "Test failed: the players did not move within the 100 by 100 range.";
        }
        
        if (window.testCondition == "TestFinished_Soccermoveplayersbackandup") {
          window.testResult = "Test failed: the players should move back and up.";
        }
        
        if (window.testCondition == "TestFinished_Soccermovetowardscenterline") {
          window.testResult = "Test failed: all the players should move towards the center line at y = 0.";
        }
        
        if (window.testCondition == "TestFinished_Soccersettingypositionrelativetoplayer2") {
          window.testResult = "Test failed: players 1 and 3 should be below or above player 2 with a distance of about 100.";
        }
        
        if (window.testCondition == "TestFinished_Soccergrabthesoccerballifnottaken") {
          window.testResult = "Test failed: all the players are supposed to move towards the ball before it's taken.";
        }
        
        if (window.testCondition == "TestFinished_Soccercalcallplayerdistancetosoccer") {
          window.testResult = "Test failed: the 'distances' list should contain the 6 players' distances to the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccersearchfortheshortestdistanceplayer") {
          window.testResult = "Test failed: player 2 alone should move towards the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccernearestplayereachteam") {
          window.testResult = "Test failed: player 2 and 5 should move towards the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccercalcplayerdistancetogaoal") {
          window.testResult = "Test failed: the 'distances' list should contain the 6 players' distances to their team goals.";
        }
        
        if (window.testCondition == "TestFinished_Soccerselectplayertoguardteamgoal") {
          window.testResult = "Test failed: player 1 and 4 should move towards their team goals.";
        }
        
        if (window.testCondition == "TestFinished_Soccerdribbletowardsthetargetgoal") {
          window.testResult = "Test failed: player 2 should pick up and then dribble the ball to the east.";
        }
        
        if (window.testCondition == "TestFinished_Soccermakingashotfoofthesoccer") {
          window.testResult = "Test failed: player 2 should score a point.";
        }
        
        if (window.testCondition == "TestFinished_Soccersearchfortheshortestdistanceplayer") {
          window.testResult = "Test failed: player 2 should score a point by shooting to the top corner.";
        }
        
        if (window.testCondition == "TestFinished_Soccercheckmorepointsintargetgoal") {
          window.testResult = "Test failed: player 2 should score a point by searching for an open spot.";
        }
        
        if (window.testCondition == "TestFinished_Soccerstopwsarchingwaftershohting") {
          window.testResult = "Test failed: player 2 should stop searching after shooting the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccerreboundofftopboundaryforgaoal") {
          window.testResult = "Test failed: player 2 should score a point by rebounding the ball off the top boundary.";
        }
        
        if (window.testCondition == "TestFinished_Soccerbasicdefenseformationsoccer") {
          window.testResult = "Test failed: the 3 red players should move to x of 150, and y positions of -40, 0 and 40.";
        }
        if (window.testCondition == "TestFinished_Socceradynamicblockadesoccer") {
          window.testResult = "Test failed: neighther team can score a point.";
        }
        
        if (window.testCondition == "TestFinished_Socceravoidtheovershootsoccerscratch1") {
          window.testResult = "Test failed: neighther team can score a point with the updated defense formation.";
        }
        
        if (window.testCondition == "TestFinished_Soccerdefendbehindnodrill") {
          window.testResult = "Test failed: all red players should stay to the east of the x=120 line.";
        }
        
        if (window.testCondition == "TestFinished_Socceranewdefenseformationsoccer") {
          window.testResult = "Test failed: player 5 should move back to the goal line and half of player 1's y position.";
        }
        
        if (window.testCondition == "TestFinished_Soccerinterceptingtheballgoal") {
          window.testResult = "Test failed: player 5 should intercept the ball successfully.";
        }
        
        if (window.testCondition == "TestFinished_Soccerwhoaremyteammatessoccer") {
          window.testResult = "Test failed: the ball should be passed among all 3 players.";
        }
        
        if (window.testCondition == "TestFinished_Soccerseekingtheincomingball") {
          window.testResult = "Test failed: player 1 should move forward proactively to receive the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccermoveteamforwardsoccerscratch1") {
          window.testResult = "Test failed: the whole team should move forward while passing the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccerpasstofronttteammate") {
          window.testResult = "Test failed: your players need to pass the ball to the teammate that's closer to the target goal.";
        }
        
        if (window.testCondition == "TestFinished_Soccerdribbleorpasshwsoccer") {
          window.testResult = "Test failed: your players should randomly dribble forward or pass the ball out.";
        }
        
        if (window.testCondition == "TestFinished_Soccerdonotpassifblockedsoccer") {
          window.testResult = "Test failed: the ball owner should not pass the ball directly to its teammates.";
        }
        
        if (window.testCondition == "TestFinished_Soccerpassingwithreboundshots") {
          window.testResult = "Test failed: player 1 should pass the ball to player 2 by rebounding off the south boundary.";
        }
        
        if (window.testCondition == "TestFinished_Soccerreboundshotinbothdirections") {
          window.testResult = "Test failed: player 1 should pass the ball to player 2 by rebounding off the north boundary.";
        }
        
        if (window.testCondition == "TestFinished_Soccerreboundoffwestandsouthboundary") {
          window.testResult = "Test failed: player 1 should pass the ball to player 2 by rebounding off the west boundary and then the south boundary.";
        }
        
        if (window.testCondition == "TestFinished_Soccercheckteammate2aswellsoccer") {
          window.testResult = "Test failed: player 1 should pass the ball to player 3 by rebounding off the bottom boundary.";
        }
        
        if (window.testCondition == "TestFinished_Soccerusingtheslidetoblocksoccer") {
          window.testResult = "Test failed: player 5 should intercept the ball by sliding to it.";
        }
        
        if (window.testCondition == "TestFinished_Soccerassigningatgoalkeepersoccer") {
          window.testResult = "Test failed: player 2 should pass the ball to teammate 1 and then move back to its goal.";
        }
        
        if (window.testCondition == "TestFinished_Soccerinterceptingtehballsoccedr") {
          window.testResult = "Test failed: player 1 and 3 should try to intercept the ball by moving to the ball's y position.";
        }
        
        if (window.testCondition == "TestFinished_Soccerremovegoalkeeperformward") {
          window.testResult = "Test failed: player 2 should stay behind the ball owner by half of its distance to the team goal.";
        }

        if (window.testCondition == "TestFinished_Soccerreconfigratteammatessoccer") {
          window.testResult = "Test failed: player 1 and 4's teammate settings need to be updated.";
        }
        
        
        if (window.testCondition == "TestFinished_Soccerbetterpassingfromthegoalkeepersoccer") {
          window.testResult = "Test failed: player 2 should pass the ball to player 1 via a rebound.";
        }

        
        if (window.testCondition == "TestFinished_Soccerpkcingupthedoubelswppedawar4dsoccer") {
          window.testResult = "Test failed: player 3 should grab the double speed award.";
        }

        
        if (window.testCondition == "TestFinished_Soccerdistancetoaawardsoccer") {
          window.testResult = "Test failed: you need to calculate all players' distances to the first award, and store them in the 'distances' list.";
        }


        if (window.testCondition == "TestFinished_Soccerassignmeoneplayerotgragbthawwrdsoccer") {
          window.testResult = "Test failed: if a player is not the closest to the award, it should follow the existing logic. ";
        }        


        if (window.testCondition == "TestFinished_Soccergrabtheawardtheother2") {
          window.testResult = "Test failed: player 1 and 3 should slide to the award when player 2 tries to get the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccerusingmovetofortheballownersoccer") {
          window.testResult = "Test failed: player 2 should move to the award using the 'move to' block.";
        }
        
        if (window.testCondition == "TestFinished_Soccergrabthesecondwardsoccer") {
          window.testResult = "Test failed: player 1 and 3 should move to the award on the left top while player 2 moves to the award on the right.";
        }

        
        if (window.testCondition == "TestFinished_Soccershrinkdistanceofdoublespeedplayersoccer") {
          window.testResult = "Test failed: player 3 should be elected to grab the ball.";
        }
        
        if (window.testCondition == "TestFinished_Soccerswappingteammatessoccer") {
          window.testResult = "Test failed: player 2 should pass to player 1 first.";
        }
        
        if (window.testCondition == "TestFinished_Soccersettingthefasterplayerascaptain") {
          window.testResult = "Test failed: player 1 should be elected as the new captain.";
        }

        
        if (window.testCondition == "TestFinished_Socceravoidwastingthedoublespeedsoccer") {
          window.testResult = "Test failed: player 2 should be elected to grab the new award.";
        }

        
        if (window.testCondition == "TestFinished_Soccerswapnamesinsoccer") {
          window.testResult = "Test failed: name A and name B should swap their values.";
        }

        // bbbb 
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult);        
    } else if (window.testCondition.indexOf("TestFinished_Tank") == 0) {
      const p = window.testCondition.split("_");
      if (s == "1") { 
        const passingconditions = ["TestFinished_Tank", "TestFinished_TankRandom4", "TestFinished_TankNewPath", "TestFinished_TankRandom5", "TestFinished_TankPick2Crystals", "TestFinished_TankCrystal2list", "TestFinished_TankCloseEnough", "TestFinished_TankMoveToWhiteTank1", "TestFinished_TankCrystalThenTank", "TestFinished_TankCalcDistance1", "TestFinished_TankAllDistances", "TestFinished_TankVisitReverse", "TestFinished_Tankdistancetowhitetank", "TestFinished_TankNearestCrystal3", "TestFinished_TankNearestCrystal5", "TestFinished_TankNearestCrystalRepeat", "TestFinished_Tankfurthest", "TestFinished_TankAllInSpeed", "TestFinished_TankInSequence", "TestFinished_TankBalanced1", "TestFinished_TankBalanced2", "TestFinished_TankDoubleSpeed", "TestFinished_TankDirRoundRobin", "TestFinished_TankDriveReversedir", "TestFinished_TankTurnRightAndFire", "TestFinished_TankKeepsomedistance", "TestFinished_TankVerticalDistance", "TestFinished_TanksOntheleft", "TestFinished_TankRefactorTankAction", "TestFinished_TankTurnRightFireRed", "TestFinished_TankRedOnTheLeft", "TestFinished_TankShootingnorthsouth", "TestFinished_TankShootingnorthsouth2", "TestFinished_TankCheckallwhitetanks", "TestFinished_TankCheckallwhitetanks2", "TestFinished_Tanksstoprepeatingwhenfound", "TestFinished_Tanksstoprepeatingwhenfound2", "TestFinished_TankCrystalCloseEnough", "TestFinished_TankMoveToXFirst", "TestFinished_TankMoveToXFirst2", "TestFinished_Tankalignxory", "TestFinished_Tankalignxory2", "TestFinished_Tankcalcdisttowhitetanks1", "TestFinished_Tanksfindbestindexinmovingdistances", "TestFinished_Tanksfindbestindexinmovingdistances2", "TestFinished_TankStopWhenless50", "TestFinished_Tankcalcdisttowhitetanksmanhattan1", "TestFinished_TankAttackRedTankIfInRange", "TestFinished_Tankmovetowardsredtank", "TestFinished_Tankstrongerineverypower", "TestFinished_Tanksattackwithtotalpower", "TestFinished_Tankatleast2outof3powers", "TestFinished_TankAttackNewTotalPower", "TestFinished_Tankmoverightifshellcomedown", "TestFinished_Tankescapewestinthese2situation", "TestFinished_Tankloopthroughallshells", "TestFinished_Tanksolvingtheother3directions", "TestFinished_Tankhitleftwall", "TestFinished_Tankescapeafterfiringashot", "TestFinished_Tankedontgettooclosewhite", "TestFinished_Tankfixingthegotoxyblock", "TestFinished_Tankcounterclockrectangle2", "TestFinished_TankRefactorSendRandom", "TestFinished_Tankdirauto", "TestFinished_TankRedTankKilled", "TestFinished_TankBlueTankKilled", "TestFinished_Tankpickuptheorbweapon", "TestFinished_Tankimprovemovementpath", "TestFinished_Tankabettergotoblock", "TestFinished_Tankescapefromtheorb", "TestFinished_Tankescapefromcornered", "TestFinished_Tankeorbvsorb", "TestFinished_Tankgothroughtheeastwall", "TestFinished_Tankimprovemovementpath", "TestFinished_Tankupdatingdistancecalc1", "TestFinished_Tankthematrixattackusingportal", "TestFinished_Tankespacingoutevenly", "TestFinished_Tankestaircaseattackportal", "TestFinished_Tankattackoneastindirectly", "TestFinished_Tankhittingthewestwallnova", "TestFinished_Tanknovadefenseagainstorb1", "TestFinished_Tanktimingnovadefensewell", "TestFinished_Tankescapevertically", "TestFinished_Tankescapingtothenearestwallnova", "TestFinished_Tankfiringmissilescontinuously", "TestFinished_Tankcheckingblockingwhitetanksabove", "TestFinished_Tankcheckallwhitetanksforblockage", "TestFinished_Tankcheckallwhitetanksforblockageeast", "TestFinished_Tankchecksecondlegblocking", "TestFinished_Tankfiremissilestothesouth", "TestFinished_Tankefiringtothewestmissile", "TestFinished_Tankpikcupthefirstweaponifbtter", "TestFinished_Tanksearchingforthegbestwaepontopickup", "TestFinished_Tankdowngradetofrontrunopponent", "TestFinished_Tankpickingupthesameweaponagain", "TestFinished_Tankadifferentinitialweaponranking", "TestFinished_Tankechangeweaponrankingfornovavsorb", "TestFinished_Tankrecalculatingydiffportal" ]; //   
        // if (window.testCondition == "TestFinished_Tank" || window.testCondition == "TestFinished_TankRandom4" || window.testCondition == "TestFinished_TankNewPath" || window.testCondition == "TestFinished_TankRandom5" || window.testCondition == "TestFinished_TankPick2Crystals" ) {
        if (passingconditions.includes(window.testCondition)) {
          window.testResult = "Test passed!";
        } else {
          if (p[1] == "TankRemoveDupXDiff") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "attack white tank") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'attack white tank' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/x position of bluetank - item 1 of white tank X list/g) || []).length;

                if (count > 1 || str.includes("x position of bluetank > item 1 of white tank X list") || str.includes("x position of bluetank < item 1 of white tank X list")) {
                  window.testResult = "Test failed: you need to simplify the 'attack white tank' block using 'x diff'.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          
          if (p[1] == "TankSetFoundtwice") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "attack white tank") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'attack white tank' block.";  
              } else {
                const str = getAllText(nB);
                var count = (str.match(/set found to 1/g) || []).length;

                if (count > 1) {
                  window.testResult = "Test failed: you only need to set 'found' to 1 once.";
                } else {
                  window.testResult = "Test passed!";
                }
              }
            }
          }

          if (p[1] == "TankSearchReverse") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "find nearest crystal") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'find nearest crystal' block.";  
              } else {
                const b1 = nB.next ? nB.next.block : null;
                if (!b1) {
                  window.testResult = "Test failed: the 'find nearest crystal' block is empty";  
                } else {
                  if (!b1._attributes || b1._attributes.type != "data_setvariableto"  || !b1.field || b1.field._text != "best index") {
                    window.testResult = "Test failed: you need to initialize 'best index' first in the 'find nearest crystal' block.";  
                  } else {
                    if (!b1.value || !b1.value.block || b1.value.block._attributes.type != "data_lengthoflist" || b1.value.block.field._text != "crystal distances") {
                      window.testResult = "Test failed: you need to initialize 'best index' to the length of 'crystal distances' in the 'find nearest crystal' block.";  
                    } else {
                      const b2 = b1.next ? b1.next.block : null;
                      if (!b2) {
                        window.testResult = "Test failed: the 'find nearest crystal' block is not compelte.";
                      } else {
                        if (!b2._attributes || b2._attributes.type != "data_setvariableto"  || !b2.field || b2.field._text != "index") {
                          window.testResult = "Test failed: you need to initialize 'index' next in the 'find nearest crystal' block.";  
                        } else {
                          if (!b2.value || !b2.value.block || b2.value.block._attributes.type != "operator_subtract" || b2.value.block.value["0"].block._attributes.type != "data_lengthoflist" || b2.value.block.value[1].shadow.field._text != "1") {
                            window.testResult = "Test failed: you need to initialize 'index' to the length of 'crystal distances' minus 1 in the 'find nearest crystal' block.";  
                          } else {
                            window.testResult = "Test passed!";
                          }

                        }          
                      }
                    }
                  }
                }


              }
            }
          }
          
          if (p[1] == "TankRefactorseekauto") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let nB = null;
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                }
                if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "go to %s %s") {
                  nB = blocks[k];
                  break;
                }
              }
              if (!nB) {
                window.testResult = "Test failed: can't find the 'go to' block.";  
              } else {
                let xm = JSON.stringify(nB);
                if (xm.includes("crystal x list") || xm.includes("crystal y list")) {
                  window.testResult = "Test failed: you should use 'x' and 'y' instead of reading from the lists in the 'go to' block.";   
                } else {
                  window.testResult = "Test passed!";  
                }
              }
            }
            

          }
          
          if (p[1] == "TankRandomCommandsconcise") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let hasStart = false;
              let hasNewBlock = false;
              let startB = null;
              let nB = null;
              if (1) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    hasStart = true;
                    startB = blocks[k];
                  }
                  if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "send a random command") {
                    hasNewBlock = true;
                    nB = blocks[k];
                  }
                }

                if (hasStart && hasNewBlock) {
                  const b1 = nB.next ? nB.next.block : null;
                  if (!b1) {
                    window.testResult = "Test failed: the 'send a random command' block is empty";  
                  } else {
                    const b2 = b1.next ? b1.next.block : null;
                    if (!b2) {
                      window.testResult = "Test passed!";
                    } else {
                      if (b2._attributes.type != "event_broadcast") {
                        window.testResult = "Test failed: the second row should broadcast the command.";
                      } else {
                        if (b2.next && b2.next.block) {
                          window.testResult = "Test failed: the new block should only contain at most 2 rows.";
                        } else {

                          window.testResult = "Test passed!";
                        }
                      }
                    }
                  }
                } else {
                  if (!hasStart) {
                    window.testResult = "Test failed: your program should handle the 'start' message.";
                  } else {
                    window.testResult = "Test failed: your program should define the new block 'send a random command'.";
                  }
                }
              } else {
                window.testResult = "Test failed: your program should contain 2 stacks!";
              }

            }
            

          }

          if (p[1] == "TankRefactorSendRandomxx") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let hasStart = false;
              let hasNewBlock = false;
              let startB = null;
              if (1) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    hasStart = true;
                    startB = blocks[k];
                  }
                  if (blocks[k]._attributes.type == "procedures_definition" && blocks[k].statement.shadow.mutation._attributes.proccode == "send a random command") {
                    hasNewBlock = true;
                  }
                }

                if (hasStart && hasNewBlock) {
                  const fB = startB.next ? startB.next.block : null;
                  if (!fB) {
                    window.testResult = "Test failed: you need to use a 'forever' block in the 'start' message handler!";  
                  } else {
                    const thirdB = fB.statement ? fB.statement.block : null;
                    if (!thirdB || thirdB._attributes.type != "procedures_call") {
                      window.testResult = "Test failed: you need to use the new block in the forever loop!";
                    } else {
                      const b4 = thirdB.next ? thirdB.next.block : null;
                      if (!b4 || b4._attributes.type != "control_wait") {
                        window.testResult = "Test failed: you need to wait some time after running the new block!";
                      } else {
                        window.testResult = "Test passed!";
                      }
                    }
                  }
                } else {
                  if (!hasStart) {
                    window.testResult = "Test failed: your program should handle the 'start' message.";
                  } else {
                    window.testResult = "Test failed: your program should define the new block 'send a random command'.";
                  }
                }
              } else {
                window.testResult = "Test failed: your program should contain 2 stacks!";
              }

            }
            

          }
          
          if (p[1] == "Tankcounterclockrectangle") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = null;
              if (blocks.length > 1) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              } else {
                if (blocks._attributes.type == "event_whenbroadcastreceived") {
                  startB = blocks;
                }
              }
              if (startB == null) {
                window.testResult = "Test failed: can't find the 'when I receive start' block!";
              } else {
                const nextB = startB.next.block;
                if (!nextB || nextB._attributes.type != "event_broadcast" || nextB.value.shadow.field._text != "blue N" ) {
                  window.testResult = "Test failed: you need to broadcast the 'blue N' command after receiving the 'start' message.";
                } else {
                  const thirdB = nextB.next ? nextB.next.block : null;
                  if (!thirdB || thirdB._attributes.type != "control_wait") {
                    window.testResult = "Test failed: you need to wait some time after sending the 'blue N' command.";
                  } else {
                    const b4 = thirdB.next.block;
                    if (!b4 || b4._attributes.type != "event_broadcast" || b4.value.shadow.field._text != "blue W" ) {
                      window.testResult = "Test failed: the second command should be 'blue W'.";
                    } else {
                      const b5 = b4.next ? b4.next.block : null;
                      if (!b5 || b5._attributes.type != "control_wait") {
                        window.testResult = "Test failed: you need to wait some time after sending the 'blue W' command.";
                      } else {
                        
                        const b6 = b5.next.block;
                        if (!b6 || b6._attributes.type != "event_broadcast" || b6.value.shadow.field._text != "blue S" ) {
                          window.testResult = "Test failed: the third command should be 'blue S'.";
                        } else {
                          const b7 = b6.next ? b6.next.block : null;
                          if (!b7 || b7._attributes.type != "control_wait") {
                            window.testResult = "Test failed: you need to wait some time after sending the 'blue S' command.";
                          } else {
                            
                            const b8 = b7.next.block;
                            if (!b8 || b8._attributes.type != "event_broadcast" || b8.value.shadow.field._text != "blue E" ) {
                              window.testResult = "Test failed: the forth command should be 'blue E'.";
                            } else {
                              const b9 = b8.next ? b8.next.block : null;
                              if (!b9 || b9._attributes.type != "control_wait") {
                                window.testResult = "Test failed: you need to wait some time after sending the 'blue E' command.";
                              } else {
                                
                                const b10 = b9.next.block;
                                if (!b10 || b10._attributes.type != "event_broadcast" || b10.value.shadow.field._text != "blue P" ) {
                                  window.testResult = "Test failed: the last command should be 'blue P'.";
                                } else {
                                  window.testResult = "Test passed!";
                                }

                              }
                            }
                          }
                        }

                      }
                    }
                  }
                }
              }

            }
            

          }



          if (p[1] == "Tankdirautoxxx") {
            if (currentXML == "") {
              window.testResult = "Test failed: you haven't changed your program yet.";
            } else {
              var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
              const blocks = obj.xml.block;
              let startB = null;
              if (blocks.length > 1) {
                for (let k=0; k<blocks.length; k++) {
                  if (blocks[k]._attributes.type == "event_whenbroadcastreceived") {
                    startB = blocks[k]; break;
                  }
                }
              } else {
                if (blocks._attributes.type == "event_whenbroadcastreceived") {
                  startB = blocks;
                }
              }
              if (startB == null) {
                window.testResult = "Test failed: can't find the 'when I receive start' block!";
              } else {
                const nextB = startB.next.block;
                if (!nextB || nextB._attributes.type != "control_if_else") {
                  window.testResult = "Test failed: you need to use an 'if-else' block after receiving the 'start' message.";
                } else {
                  const thirdB = nextB.next ? nextB.next.block : null;
                  if (!thirdB || thirdB._attributes.type != "control_if_else") {
                    window.testResult = "Test failed: you need to use 2 'if-else' blocks at the high level.";
                  } else {
                    
                    if (thirdB.value.block.value["0"].block.field._text == "y position" && thirdB.value.block.value[1].block.field._text == "crystal y list") {
                      window.testResult = "Test passed!";  
                    } else if (thirdB.value.block.value["1"].block.field._text == "y position" && thirdB.value.block.value[0].block.field._text == "crystal y list") {
                      window.testResult = "Test passed!";  
                    } else {
                      window.testResult = "Test failed: you need to compare the y position of the blue tank against the first item in the list 'crystal y list'";
                    }
                  }
                }
              }

            }
            

          }

        }

      } else {
        window.testResult = "Test failed: the bird did not reach its nest!";
        if (p[1] == "TankRandom4" || p[1] == "TankRefactorSendRandom" || p[1] == "TankRandomCommandsconcise") {
          window.testResult = "Test failed: your AI controller did not send all 4 types of commands.";
        } 

        if (p[1] == "TankNewPath") {
          window.testResult = "Test failed: the expected pattern is not produced.";
        }

        if (p[1] == "TankRandom5") {
          window.testResult = "Test failed: the command 'S' was not sent with a probability of about 40%.";
        }

        
        if (p[1] == "TankPick2Crystals" || window.testCondition == "TestFinished_TankCrystal2list" ) {
          window.testResult = "Test failed: your tank needs to collect 2 crystals.";
        }

        if (p[1] == "Tankdirauto") {
          window.testResult = "Test failed: your tank needs to collect the crystal.";
        }

        if (p[1] == "TankRefactorseekauto") {
          window.testResult = "Test failed: your tank needs to collect all 3 crystals.";
        }
        
        if (p[1] == "TankCloseEnough") {
          window.testResult = "Test failed: your tank needs to collect the crystal without moving East.";
        }

        if (p[1] == "TankMoveToWhiteTank1") {
          window.testResult = "Test failed: your tank should stop around the white tank.";
        }
        
        if (p[1] == "TankCrystalThenTank") {
          window.testResult = "Test failed: your tank should pick up the crystal and then stop around the white tank.";
        }
      
        if (p[1] == "TankCalcDistance1") {
          window.testResult = "Test failed: you add the correct distance as the first item in the 'crystal distances' list.";
        }

        if (p[1] == "TankAllDistances") {
          window.testResult = "Test failed: your program needs to calculate the distances to all crystals and add them to the 'crystal distances' list.";
        }
        
        if (p[1] == "TankVisitReverse") {
          window.testResult = "Test failed: your program needs to start with the last item in the 'crystal x list' and end with the first item.";
        }

        if (p[1] == "Tankdistancetowhitetank") {
          window.testResult = "Test failed: your program needs to calculate the distances to all white tanks and add them to the 'tank distances' list.";
        }

        if (p[1] == "TankNearestCrystal3") {
          window.testResult = "Test failed: your program did not find the nearest crystal correctly.";
        }

        if (p[1] == "TankNearestCrystal5") {
          window.testResult = "Test failed: your program did not find the nearest crystal correctly.";
        }

        if (p[1] == "TankNearestCrystalRepeat") {
          window.testResult = "Test failed: your program did not find the nearest crystal correctly.";
        }

        
        if (p[1] == "TankSearchReverse") {
          window.testResult = "Test failed: your program did not find the nearest crystal correctly.";
        }

        
        if (p[1] == "Tankfurthest") {
          window.testResult = "Test failed: your program did not find the furthest tank correctly.";
        }

        if (p[1] == "TankAllInSpeed") {
          window.testResult = "Test failed: you did not allocate all the crystals to the speed power.";
        }
        if (p[1] == "TankInSequence") {
          window.testResult = "Test failed: you did not allocate the crystals as instructed.";
        }

        if (p[1] == "TankBalanced2" || p[1] == "TankBalanced1") {
          window.testResult = "Test failed: you did not allocate the crystals as instructed.";
        }

        if (p[1] == "TankDoubleSpeed") {
          window.testResult = "Test failed: you did not allocate 2 times crystals to speed compared to other powers.";
        }

        if (p[1] == "Tankrecalculatingydiffportal") {
          window.testResult = "Test failed: your tank should go south through the portal.";
        }
        
        

        if (p[1] == "TankDirRoundRobin" || p[1] == "TankDriveReversedir") {
          window.testResult = "Test failed: the tank did not move in the expected pattern.";
        }

        if (p[1] == "TankTurnRightAndFire" || p[1]== "TankKeepsomedistance") {
          window.testResult = "Test failed: your tank did not kill the white tank on right.";
        }

        if (p[1] == "TankVerticalDistance") {
          window.testResult = "Test failed: your tank should move north just enough to kill the white tank on right.";
        }

        if (p[1] == "TankBlueTankKilled") {
          window.testResult = "Test failed: the blue tank should have been killed.";
        }

        if (p[1] == "TankRedTankKilled") {
          window.testResult = "Test failed: the red tank should have been killed.";
        }


        if (p[1] == "TanksOntheleft" || p[1] == "TankRefactorTankAction") {
          window.testResult = "Test failed: your tank should move north just enough to kill the white tank on left.";
        }

        if (p[1] == "TankRedOnTheLeft" || p[1] == "TankTurnRightFireRed") {
          window.testResult = "Test failed: your tank should kill the red tank.";
        }

        if (p[1] == "TankShootingnorthsouth" || p[1] == "TankCheckallwhitetanks") {
          window.testResult = "Test failed: your tank should kill those 2 tanks above and below.";
        }
        if (p[1] == "TankShootingnorthsouth2" || p[1] == "TankCheckallwhitetanks2") {
          window.testResult = "Test failed: your tank should kill the white tank above.";
        }

        if (p[1] == "Tanksstoprepeatingwhenfound") {
          window.testResult = "Test failed: your tank should kill all 3 tanks.";
        }

        if (p[1] == "Tanksstoprepeatingwhenfound2") {
          window.testResult = "Test failed: your tank should focus on attacking the white tank above.";
        }
        if (p[1] == "TankSetFoundtwice") {
          window.testResult = "Test failed: your tank should focus on attacking the white tank above.";
        }
        
        if (p[1] == "TankCrystalCloseEnough") {
          window.testResult = "Test failed: your tank did not pick up the first crystal that's close enough.";
        }
        if (p[1] == "TankMoveToXFirst") {
          window.testResult = "Test failed: your tank should kill all 3 white tanks.";
        }

        if (p[1] == "TankMoveToXFirst2") {
          window.testResult = "Test failed: your tank should move west to attack the white tank on top.";
        }
        
        if (p[1] == "Tankalignxory") {
          window.testResult = "Test failed: your tank should choose the better moving direction for killing all 3 tanks.";
        }
        if (p[1] == "Tankalignxory2") {
          window.testResult = "Test failed: your tank should choose to move north and attack the white tank on top.";
        }
        if (p[1] == "Tankcalcdisttowhitetanks1") {
          window.testResult = "Test failed: you need to calculate the moving distances correctly for all 3 white tanks.";
        }
        
        
        if (p[1] == "Tanksfindbestindexinmovingdistances") {
          window.testResult = "Test failed: you need to kill all 3 white tanks in the correct order.";
        }

        if (p[1] == "Tanksfindbestindexinmovingdistances2") {
          window.testResult = "Test failed: your tank should attack the white tank at the bottom.";
        }

        if (p[1] == "TankStopWhenless50") {
          window.testResult = "Test failed: you need to attack the correct white tank first.";
        }

        if (p[1] == "Tankcalcdisttowhitetanksmanhattan1") {
          window.testResult = "Test failed: you need to attack the white tanks in the correct order.";
        }
        
        if (window.testCondition == "TestFinished_TankAttackRedTankIfInRange" || window.testCondition == "TestFinished_Tankmovetowardsredtank") {
          window.testResult = "Test failed: you need to kill this red tank.";
        }

        if (window.testCondition == "TestFinished_Tankstrongerineverypower") {
          window.testResult = "Test failed: your tank should pick up all crystals and then attck the red tank.";
        }

        
        if (window.testCondition == "TestFinished_Tanksattackwithtotalpower") {
          window.testResult = "Test failed: your tank should pick up all crystals and then attack the red tank.";
        }
        

        if (window.testCondition == "TestFinished_Tankatleast2outof3powers") {
          window.testResult = "Test failed: your tank should calculate 'counter' correctly and then attack the red tank.";
        }
        
        if (window.testCondition == "TestFinished_TankAttackNewTotalPower") {
          window.testResult = "Test failed: your tank should calculate the total powers using the new weights and then attack the red tank.";
        }
        
        if (window.testCondition == "TestFinished_Tankmoverightifshellcomedown") {
          window.testResult = "Test failed: your tank should dodge the shell from above.";
        }
        
        if (window.testCondition == "TestFinished_Tankescapewestinthese2situation") {
          window.testResult = "Test failed: your tank should dodge the shell by going West.";
        }

        
        if (window.testCondition == "TestFinished_Tankhitleftwall") {
          window.testResult = "Test failed: your tank should dodge the shell by going East.";
        }

        if (window.testCondition == "TestFinished_Tankloopthroughallshells" || window.testCondition == "TestFinished_Tanksolvingtheother3directions" ) {
          window.testResult = "Test failed: your tank should dodge all the shells.";
        }

        
        if (window.testCondition == "TestFinished_Tankescapeafterfiringashot") {
          window.testResult = "Test failed: your tank should move East right after firing the shot.";
        }

        if (window.testCondition == "TestFinished_Tankedontgettooclosewhite") {
          window.testResult = "Test failed: your tank should not be hit by any white tank shell.";
        }

        if (window.testCondition == "TestFinished_Tankfixingthegotoxyblock") {
          window.testResult = "Test failed: your tank should pick up the crystal successfully.";
        }
        
        if (window.testCondition == "TestFinished_Tankcounterclockrectangle2") {
          window.testResult = "Test failed: your tank did not send the correct commands.";
        }

        
        if (window.testCondition == "TestFinished_Tankpickuptheorbweapon") {
          window.testResult = "Test failed: your tank did not pick up the orb weapon.";
        }
        
        if (window.testCondition == "TestFinished_Tankimprovemovementpath") {
          window.testResult = "Test failed: your tank should go to the target without being attacked.";
        }
        
        if (window.testCondition == "TestFinished_Tankabettergotoblock") {
          window.testResult = "Test failed: your tank should not be hurt by the opponent.";
        }
        
        if (window.testCondition == "TestFinished_Tankescapefromtheorb") {
          window.testResult = "Test failed: your tank should escape to the left top corner.";
        }
        
        if (window.testCondition == "TestFinished_Tankescapefromcornered") {
          window.testResult = "Test failed: your tank should escape from the top left corner.";
        }
        
        if (window.testCondition == "TestFinished_Tankeorbvsorb") {
          window.testResult = "Test failed: the blue tank should be killed because its survival time is shorter.";
        }
        
        if (window.testCondition == "TestFinished_Tankgothroughtheeastwall") {
          window.testResult = "Test failed: the blue tank is supposed to go through the east wall.";
        }
        
        if (window.testCondition == "TestFinished_Tankimprovemovementpath") {
          window.testResult = "Test failed: the blue tank is supposed to go through the south wall.";
        }
        
        if (window.testCondition == "TestFinished_Tankupdatingdistancecalc1") {
          window.testResult = "Test failed: the blue tank is supposed to go through the east wall to pick up the crystal on the left.";
        }
        if (window.testCondition == "TestFinished_Tankthematrixattackusingportal") {
          window.testResult = "Test failed: the blue tank is supposed to follow the opponent and fire many shots.";
        }
        
        if (window.testCondition == "TestFinished_Tankespacingoutevenly") {
          window.testResult = "Test failed: the blue tank is supposed to repeated turn north and east while firing.";
        }
        
        if (window.testCondition == "TestFinished_Tankestaircaseattackportal") {
          window.testResult = "Test failed: the blue tank is supposed to fire east or west while moving north or south.";
        }
        
        if (window.testCondition == "TestFinished_Tankattackoneastindirectly") {
          window.testResult = "Test failed: the blue tank is supposed to fire east without moving north much.";
        }
        
        if (window.testCondition == "TestFinished_Tankhittingthewestwallnova") {
          window.testResult = "Test failed: the blue tank is supposed to fire west without moving north much.";
        }
        
        if (window.testCondition == "TestFinished_Tanknovadefenseagainstorb1") {
          window.testResult = "Test failed: the blue tank is supposed to move west and fire at the wall.";
        }
        
        if (window.testCondition == "TestFinished_Tanktimingnovadefensewell") {
          window.testResult = "Test failed: the blue tank is supposed to wait until the opponent is really close to fire each shot.";
        }
        
        if (window.testCondition == "TestFinished_Tankescapevertically") {
          window.testResult = "Test failed: the blue tank is supposed to escape south and fire at the wall.";
        }
        
        if (window.testCondition == "TestFinished_Tankescapingtothenearestwallnova") {
          window.testResult = "Test failed: the blue tank is supposed to escape north and fire at the wall.";
        }
        
        if (window.testCondition == "TestFinished_Tankfiringmissilescontinuously") {
          window.testResult = "Test failed: the blue tank should keep firing missiles continuously.";
        }

        
        if (window.testCondition == "TestFinished_Tankcheckingblockingwhitetanksabove") {
          window.testResult = "Test failed: the blue tank should turn east to avoid the blocking white tank.";
        }
        
        if (window.testCondition == "TestFinished_Tankcheckallwhitetanksforblockage") {
          window.testResult = "Test failed: the blue tank should turn east to avoid the blocking white tanks.";
        }
        
        if (window.testCondition == "TestFinished_Tankcheckallwhitetanksforblockageeast") {
          window.testResult = "Test failed: the blue tank should try to avoid both of the blocking white tanks.";
        }
        
        if (window.testCondition == "TestFinished_Tankchecksecondlegblocking") {
          window.testResult = "Test failed: the blue tank should try to avoid the blocking white tank.";
        }
        
        if (window.testCondition == "TestFinished_Tankfiremissilestothesouth") {
          window.testResult = "Test failed: the blue tank should avoid the blocking white tank in the south.";
        }
        
        if (window.testCondition == "TestFinished_Tankefiringtothewestmissile") {
          window.testResult = "Test failed: the blue tank should avoid the blocking white tank in the west and south.";
        }
        
        if (window.testCondition == "TestFinished_Tankpikcupthefirstweaponifbtter") {
          window.testResult = "Test failed: the blue tank should pick up the Missile and ignore the Orb.";
        }
        
        if (window.testCondition == "TestFinished_Tanksearchingforthegbestwaepontopickup") {
          window.testResult = "Test failed: the blue tank should go for the Missile directly.";
        }
        
        if (window.testCondition == "TestFinished_Tankdowngradetofrontrunopponent") {
          window.testResult = "Test failed: the blue tank should downgrade to the Portal ahead of the red tank.";
        }
        
        if (window.testCondition == "TestFinished_Tankpickingupthesameweaponagain") {
          window.testResult = "Test failed: the blue tank should pick up the remaining Missile weapon first.";
        }
        
        if (window.testCondition == "TestFinished_Tankadifferentinitialweaponranking") {
          window.testResult = "Test failed: the 'weapon ranking' list doesn not reflect the given preferences.";
        }
        
        if (window.testCondition == "TestFinished_Tankechangeweaponrankingfornovavsorb") {
          window.testResult = "Test failed: the blue tank should go for the Nova instead of the Missile.";
        }
        //  
      }

      if (currentXML != "")
        Meteor.call('recordTestAttempt', userLesson._id, slide.ID, window.testResult, currentXML);

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult);        


    } else if (window.testCondition.indexOf("TestFinished_AppleHarvest") == 0) {
      const p = window.testCondition.split("_");
      if (s === "1") { 
        window.testResult = "Test passed!";
      } else if (p[2] === "AddAppleAndBowl") {
        if (s === "2") window.testResult = "Test failed: the Bowl sprite was not add to the project.";
        if (s === "3") window.testResult = "Test failed: the Apple sprite was not add to the project.";
      } else if (p[2] === "DeleteScratchCat") {
        if (s === "2") window.testResult = "Test failed: the Scratch cat sprite was not deleted from the project.";
      } else if (p[2] === "AddForest") {
        if (s === "2") window.testResult = "Test failed: the Forest backdrop was not added to the project.";
      } else if (p[2] === "ChangeToWoods") {
        if (s === "2") window.testResult = "Test failed: please delete the Forest backdrop from the project.";
        if (s === "3") window.testResult = "Test failed: the Woods backdrop was not added to the project.";
      } else if (p[2] === "AddMoreSprites") {
        if (s === "5") window.testResult = "Test failed: please delete the Scratch cat from the project.";
        if (s === "2") window.testResult = "Test failed: the Elephant sprite was not added to the project.";
        if (s === "3") window.testResult = "Test failed: the Mermaid sprite was not added to the project.";
        if (s === "4") window.testResult = "Test failed: the Watermelon sprite was not added to the project.";
      } else if (p[2] === "CreateStage1") {
        if (s === "7") window.testResult = "Test failed: please delete the Scratch cat from the project.";
        if (s === "6") window.testResult = "Test failed: please add the Blue Sky backdrop to the project.";
        if (s === "5") window.testResult = "Test failed: the Trees sprite was not added to the project.";
        if (s === "2") window.testResult = "Test failed: the Parrot sprite was not added to the project.";
        if (s === "3") window.testResult = "Test failed: the Butterfly 2 sprite was not added to the project.";
        if (s === "4") window.testResult = "Test failed: the Frog sprite was not added to the project.";
      } else if (p[2] === "CreateStage2") {
        if (s === "6") window.testResult = "Test failed: please delete the Scratch cat from the project.";
        if (s === "5") window.testResult = "Test failed: the Bedroom 3 backdrop was not added to the project.";
        if (s === "2") window.testResult = "Test failed: the Abby sprite was not added to the project.";
        if (s === "3") window.testResult = "Test failed: the Bedroom 1 backdrop was not added to the project.";
        if (s === "4") window.testResult = "Test failed: the Bedroom 2 backdrop was not added to the project.";
      } else if (p[2] === "SetAppleBowlCo") {
        if (s === "2") window.testResult = "Test failed: please set the Apple's x coordinate to 0.";
        if (s === "3") window.testResult = "Test failed: please set the Apple's y coordinate to 180.";
        if (s === "4") window.testResult = "Test failed: please set the Bowl's x coordinate to -221.";
        if (s === "5") window.testResult = "Test failed: please set the Bowl's y coordinate to -157.";
      } else if (p[2] === "ChangeAppleSize") {
        if (s === "2") window.testResult = "Test failed: please change the Apple's size to 40. ";
      } else if (p[2] === "Regrigerator") {
        if (s === "2") window.testResult = "Test failed: please configure the Apple as required.";
        if (s === "3") window.testResult = "Test failed: please configure the Bananas as required.";
        if (s === "4") window.testResult = "Test failed: please configure the Orange as required.";
        if (s === "5") window.testResult = "Test failed: please configure the Milk as required.";
        if (s === "6") window.testResult = "Test failed: please configure the Jar as required.";
      } else if (p[2] === "DropApple") {
        if (s === "2") window.testResult = "Test failed: please change the apple's y coordinate by -10. ";
      } else if (p[2] === "DropAppleAgain") {
        if (s === "2") window.testResult = "Test failed: the apple is expected to drop to 140 at y coordinate. ";
      } else if (p[2] === "DropForever") {
        if (s === "2") window.testResult = "Test failed: the apple is expected to drop to the bottom of the stage ";
      } else if (p[2] === "BlowBalloon") {
        if (s === "2") window.testResult = "Test failed: please gradually change the balloon's x coordinate to 240. ";
      } else if (p[2] === "BowlFollowMouse") {
        if (s === "2") window.testResult = "Test failed: please make the bowl's x equal to the moouse's x. ";
      } else if (p[2] === "HideIfTouch") {
        if (s === "2") window.testResult = "Test failed: please hide the apple and stop the apple's script when it touches the bowl. ";
      } else if (p[2] === "FlyToCloud") {
        if (s === "2") window.testResult = "Test failed: please program the butterfly to follow the mouse and move the mouse to the cloud. ";
      } else if (p[2] === "PutBallBack") {
        if (s === "2") window.testResult = "Test failed: please set the ball's positions to (0, 0) if it touches the edge of the stage. ";
      } else if (p[2] === "PlaceAppleBack") {
        if (s === "2") window.testResult = "Test failed: please place the apple back to the top after it is collected. ";
      } else if (p[2] === "ThrowApple") {
        if (s === "2") window.testResult = "Test failed: please change the apple's y position gradually from -180 to 180. ";
        if (s === "3") window.testResult = "Test failed: please put the apple to the bottom first. ";
      } else if (p[2] === "BlockApple") {
        if (s === "2") window.testResult = "Test failed: please use the mouse to block the apple dropping to a negative y position. ";
      } else if (p[2] === "RandomPosition") {
        if (s === "2") window.testResult = "Test failed: please set the apple's x position to a random number between -230 and 230. ";
      } else if (p[2] === "HalfStage") {
        if (s === "2") window.testResult = "Test failed: please set the apple's x position to a random number between 0 and 230. ";
      } else if (p[2] === "Fireworks") {
        if (s === "2") window.testResult = "Test failed: please place the 'f1' sprite at a random position. ";
        if (s === "3") window.testResult = "Test failed: please place the 'f2' sprite at a random position. ";
        if (s === "4") window.testResult = "Test failed: please place the 'f3' sprite at a random position. ";
        if (s === "5") window.testResult = "Test failed: please place the 'f4' sprite at a random position. ";
      } else if (p[2] === "CreateScore") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const variables = obj.xml.variables.variable;
          let found = false;
          if (Array.isArray(variables)) {
            for (let v of variables) {
              if (v._text.toLowerCase() === "score") {
                found = true;
                break;
              }
            }
          } else {
            if (variables._text.toLowerCase() === "score") {
              found = true;
            }
          }
          if (!found) window.testResult = "Test failed: please create a new variable and name it 'Score'. ";
          else {
            const blocks = obj.xml.block;
            let startB = blocks;
            if (blocks && blocks.length) {
              for (let k=0; k<blocks.length; k++) {
                if (blocks[k]._attributes.type == "event_whenflagclicked") {
                  startB = blocks[k]; break;
                }
              }
            }
            const str = getAllText(startB);

            if (!str || !str.toLowerCase().includes("set score to 0")) {
              window.testResult = "Test failed: please set the value of Score to 0.";
            } else {
              window.testResult = "Test passed!";
            }
          }
        }
      } else if (p[2] === "ScoreGreaterThan") {
        const exValue = Number(p[3]);
        if (s === "2") window.testResult = `Test failed: the Score should be more than ${exValue}.`;
      } else if (p[2] === "TrackX") {
        if (s === "2") window.testResult = "Test failed: please set the variable's value to 'x position' in the forever block. ";
      } else if (p[2] === "CountFireworks") {
        if (s === "2") window.testResult = "Test failed: please count the fireworks of all colors. ";
      } else if (p[2] === "AppleMissed") {
        if (s === "2") window.testResult = "Test failed: please end the game if the apple's y position is less than -165. ";
      } else if (p[2] === "CountMissed") {
        if (s === "2") window.testResult = "Test failed: please use the variable 'Missed' to count the missed apples and miss at least three apples. ";
      } else if (p[2] === "3MissedApples") {
        if (s === "2") window.testResult = "Test failed: please stop the script when three apples have been missed. ";
      } else if (p[2] === "FreeBowl") {
        if (s === "2") window.testResult = "Test failed: please set the bowl's y postion to the mouse's y position if Score > 5.";
      } else if (p[2] === "CountStars") {
        if (s === "2") window.testResult = "Test failed: please increase 'left' when the star is on the left side, and increase 'right' when the star is on the right side. ";
      } else if (p[2] === "ChangeCostume") {
        if (s === "2") window.testResult = "Test failed: please change the bowl's costume to one of the four available costumes every second. ";
      } else if (p[2] === "OneCollected") {
        if (s === "2") window.testResult = "Test failed: please change the bowl's costume bowl-b when the score is one. ";
      } else if (p[2] === "MoreCollected") {
        if (s === "2") window.testResult = "Test failed: please change the bowl's costume based on the number of collected apples. ";
      } else if (p[2] === "CatOnMoon") {
        if (s === "2") window.testResult = "Test failed: not all of the four costumes displayed at least once on the stage. ";
      } else if (p[2] === "DressHarper") {
        if (s === "2") window.testResult = "Test failed: change the Dress's costume accordingly based on the Harper's costume. ";
      } else if (p[2] === "RecordCostumeName") {
        if (s === "2") window.testResult = "Test failed: the value of 'Costume' is not the same as the name of the bowl's current costume. ";
      } else if (p[2] === "AddTwoSounds") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          const str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please play the two new sounds in the script. ";
          } else {
            const idx1 = str.indexOf(`if motion_yposition  < -165`);
            const idxBoing = str.indexOf('sound_play Boing');
            const idx2 = str.indexOf(`if sensing_touchingobject Bowl`);
            const idxCollect = str.indexOf('sound_play Collect');
            if (idxCollect < idx2) window.testResult = "Test failed: please play the Collect sound when an apple is collected. ";
            else if (idxBoing < idx1) window.testResult = "Test failed: please play the Boing sound when an apple is missed. ";
            else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "BackgroundMusic") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          const str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please add the background sound to the stage. ";
          } else if (str.indexOf('sound_setvolumeto 40') < 0) {
            window.testResult = "Test failed: please set the volume to 40. ";
          } else {
            const idx1 = str.indexOf(`forever`);
            const idxBMG = str.indexOf('sound_playuntildone Dance Magic');
            if (idxBMG < 0) window.testResult = "Test failed: please add and play the 'Dance Magic' sound. ";
            else if (idxBMG < idx1) window.testResult = "Test failed: please play the background sound in the forever blcok. ";
            else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "BowlSound") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          let str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please add the Pop sound to the bowl. ";
          } else {
            str = str.replace(/\s/g, '').toLowerCase();
            if (str.indexOf('ifmotion_xposition<-200thensound_playpop') < 0) {
              window.testResult = "Test failed: please start playing the pop sound if x position is less than -200.";
            } else if (str.indexOf('ifmotion_xposition>200thensound_playpop') < 0) {
              window.testResult = "Test failed: please start playing the pop sound if x position is greater than 200.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "ComingSoccerBall") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          let str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please change the volume by 5 if it is less than 100. ";
          } else if (str.indexOf('sound_play Guitar Chords2') > str.indexOf('forever')) {
            window.testResult = "Test failed: please start the sound 'Guitar Chords2' before the forever block.";
          } else if (str.indexOf('sound_setvolumeto 0') > str.indexOf('forever')) {
            window.testResult = "Test failed: please set the volume to 0 before the forever block.";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf('ifsound_volume<100thensound_changevolumeby5') < 0) {
              window.testResult = "Test failed: please change the volume by 5 if it is less than 100.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "TwoRules") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          let str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please add the two rules to make apples dropping faster. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`if'Score'<20thenmotion_changeyby-13`) < 0) {
              window.testResult = "Test failed: you need to change y by -13 if the Score < 20. ";
            } else if (str.indexOf(`if'Score'==20||'Score'>20&&'Score'<40thenmotion_changeyby-16`) < 0 &&
              str.indexOf(`if'Score'>20&&'Score'<40||'Score'==20thenmotion_changeyby-16`) < 0 && 
              str.indexOf(`if'Score'<40&&'Score'>20||'Score'==20thenmotion_changeyby-16`) < 0 && 
              str.indexOf(`if'Score'==20||'Score'<40&&'Score'>20thenmotion_changeyby-16`) < 0
              ) {
              window.testResult = "Test failed: you need to change y by -16 if the Score between 20 and 40. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "ThirdRule") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          let str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please implement the third rule as we discussed. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`if'Score'==40||'Score'>40thenmotion_changeyby-19`) < 0 &&
              str.indexOf(`if'Score'>40||'Score'==40thenmotion_changeyby-19`) < 0
            ) {
              window.testResult = "Test failed: you need to change y by -19 if the Score is equal to or greater than 40.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "MinorChange") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          var obj = JSON.parse(convert.xml2json(currentXML, {compact: true, spaces: 4}));
          const blocks = obj.xml.block;
          let startB = blocks;
          if (blocks && blocks.length) {
            for (let k=0; k<blocks.length; k++) {
              if (blocks[k]._attributes.type == "event_whenflagclicked") {
                startB = blocks[k]; break;
              }
            }
          }
          let str = getAllText(startB);
          if (!str || str === "") {
            window.testResult = "Test failed: please change the three rules as required. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`if'Score'<20||'Score'==20thenmotion_changeyby-13`) < 0 &&
              str.indexOf(`if'Score'==20||'Score'<20thenmotion_changeyby-13`) < 0
            ) {
              window.testResult = "Test failed: you need to change y by -13 if the Score is less than or equal to 20. ";
            } else if (str.indexOf(`if'Score'==40||'Score'>20&&'Score'<40thenmotion_changeyby-16`) < 0 &&
              str.indexOf(`if'Score'>20&&'Score'<40||'Score'==40thenmotion_changeyby-16`) < 0 && 
              str.indexOf(`if'Score'<40&&'Score'>20||'Score'==40thenmotion_changeyby-16`) < 0 && 
              str.indexOf(`if'Score'==40||'Score'<40&&'Score'>20thenmotion_changeyby-16`) < 0
            ) {
              window.testResult = "Test failed: you need to change y by -16 if the Score = 40 or between 20 and 40. ";
            } else if (str.indexOf(`if'Score'>40thenmotion_changeyby-19`) < 0) {
              window.testResult = "Test failed: you need to change y by -19 if the Score is greater than 40.";
            } else window.testResult = "Test passed!";  
          }
        }
      } else if (p[2] === "HalfStage") {
        if (s === "2") window.testResult = "Test failed: please set the apple's x position to a random number between 0 to 230. ";
      } else {
        window.testResult = "Test failed: the test condition was not met. ";
      }


            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult);    
          
    } else if (window.testCondition.indexOf("TestFinished_Maze") == 0) {
      const p = window.testCondition.split("_");
      if (s === "1") { 
        window.testResult = "Test passed!";
      } else if (p[2] === "CatSprite") {
        if (s === "2") window.testResult = "Test failed: please set the size of the cat sprite to 25. ";
        if (s === "3") window.testResult = "Test failed: please set both x and y position to zero. ";
      } else if (p[2] === "AddApple") {
        if (s === "2") window.testResult = "Test failed: please set the size of the apple sprite to 25. ";
        if (s === "3") window.testResult = "Test failed: please set x position to -12 and y position to 170. ";
        if (s === "4") window.testResult = "Test failed: you need to change the backdrop to Blue Sky 2. ";
      } else if (p[2] === "MazeCostume") {
        if (s === "2") window.testResult = "Test failed: please change the maze's costume to the next one every second. ";
      } else if (p[2] === "WalkingBear") {
        if (s === "2") window.testResult = "Test failed: please change the backdrop to the next one every two second. ";
      } else if (p[2] === "RightKey") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please add the if block as we discussed. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`ifsensing_keypressedrightarrowthenmotion_changexby10`) < 0) {
              window.testResult = "Test failed: you need to change x position if the right arrow key is pressed.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "RightKey2") {
        if (s === "2") window.testResult = "Test failed: please move the cat to touch the apple. ";
      } else if (p[2] === "ThreeKeys") {
        if (s === "2") window.testResult = "Test failed: please move the cat to touch the apple. ";
      } else if (p[2] === "CatJump") {
        if (s === "2") window.testResult = "Test failed: you need to change y position by 10, wait 0.3 seconds, and then change y position by -10.";
      } else if (p[2] === "FlyingBroom") {
        if (s === "2") window.testResult = "Test failed: you need to press the right arrow key a few times and move the broom to the wizard.";
      } else if (p[2] === "HatchEggs") {
        if (s === "2") window.testResult = "Test failed: you need to press the 'h' key only once to change the costumes for each egg. ";
      } else if (p[2] === "ChangeDirection") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the cat's facing directions as we discussed. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`sensing_keypressedrightarrowthenmotion_pointindirection90motion_changexby10`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction 90 if the right arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypressedleftarrowthenmotion_pointindirection-90motion_changexby-10`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction -90 if the left arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypresseduparrowthenmotion_pointindirection0motion_changeyby10`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction 0 if the up arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypresseddownarrowthenmotion_pointindirection180motion_changeyby-10`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction 180 if the down arrow key is pressed.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "RotationStyle") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the cat's rotation styles as we discussed. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`sensing_keypressedrightarrowthenmotion_setrotationstyleallaround`) < 0) {
              window.testResult = "Test failed: you need to set the rotation style to 'all around' when the right arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypressedleftarrowthenmotion_setrotationstyleleft-right`) < 0) {
              window.testResult = "Test failed: you need to set the rotation style to 'left-right' when the left arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypresseduparrowthenmotion_setrotationstyleallaround`) < 0) {
              window.testResult = "Test failed: you need to set the rotation style to 'all around' when the up arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypresseddownarrowthenmotion_setrotationstyleallaround`) < 0) {
              window.testResult = "Test failed: you need to set the rotation style to 'all around' when the down arrow key is pressed.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "LeanForward") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the cat's rotation styles as we discussed. ";
          } else {
            str = str.replace(/\s/g, '');
            if (str.indexOf(`sensing_keypressedrightarrowthenmotion_setrotationstyleallaroundmotion_pointindirection105`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction 105 when the right arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypresseduparrowthenmotion_setrotationstyleallaroundmotion_pointindirection15`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction 15 when the up arrow key is pressed.";
            } else if (str.indexOf(`sensing_keypresseddownarrowthenmotion_setrotationstyleallaroundmotion_pointindirection-165`) < 0) {
              window.testResult = "Test failed: you need to make the cat point in direction -165 when the down arrow key is pressed.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "Greetings") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please make the wizard face left when he is talking. ";
          } else {
            str = str.replace(/\s/g, '');
            const re = new RegExp("motion_setrotationstyleleft-rightmotion_pointindirection-90say.*");
            if (!str.match(re)) {
              window.testResult = "Test failed: you need to turn the wizard to face left before he starts talking.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "StarTrek") {
        if (s === "2") window.testResult = "Test failed: please rotate the cat counter-clockwise. ";
        if (s === "3") window.testResult = "Test failed: please rotate the dot clockwise. ";
      } else if (p[2] === "TouchBlack") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please set the color in the 'touching color' block, and insert the 'if' block to the existing code. ";
          } else {
            str = str.replace(/\s/g, '');
            const re = new RegExp('.*ifsensing_keypressedrightarrow.*ifsensing_touchingcolor#000000thensay.*for2seconds.*ifsensing_keypressedleftarrow.*');
            if (!str.match(re)) {
              window.testResult = "Test failed: please set the color in the 'touching color' block, and insert the 'if' block to the existing code.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "StopCat") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please move the cat back when it touches the black wall. ";
          } else {
            str = str.replace(/\s/g, '');
            const re = new RegExp('.*ifsensing_keypressedrightarrow.*ifsensing_touchingcolor#000000thenmotion_changexby-12.*ifsensing_keypressedleftarrow.*');
            if (!str.match(re)) {
              window.testResult = "Test failed: you need to change x position by -12 when the cat touches the black wall.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "CatInBox") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please implement the same 'if' block for the left, up, and down arrow keys. ";
          } else {
            str = str.replace(/\s/g, '');
            const reLeft = new RegExp('.*ifsensing_keypressedleftarrow.*ifsensing_touchingcolor#000000thenmotion_changexby12.*ifsensing_keypresseduparrow.*');
            const reUp = new RegExp('.*ifsensing_keypresseduparrow.*ifsensing_touchingcolor#000000thenmotion_changeyby-12.*ifsensing_keypresseddownarrow.*');
            const reDown = new RegExp('.*ifsensing_keypresseddownarrow.*ifsensing_touchingcolor#000000thenmotion_changeyby12.*');
            
            if (!str.match(reLeft)) {
              window.testResult = "Test failed: you need to change x position by 12 when the cat touches the black wall to its left.";
            } else if (!str.match(reUp)) {
              window.testResult = "Test failed: you need to change y position by -12 when the cat touches the black wall above.";
            } else if (!str.match(reDown)) {
              window.testResult = "Test failed: you need to change y position by 12 when the cat touches the black wall below.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "ColorfulBox") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the wall colors in your code. ";
          } else {
            str = str.replace(/\s/g, '');
            const reRight = new RegExp('.*ifsensing_keypressedrightarrow.*ifsensing_touchingcolor#cf53d8thenmotion_changexby-12.*ifsensing_keypressedleftarrow.*');
            const reLeft = new RegExp('.*ifsensing_keypressedleftarrow.*ifsensing_touchingcolor#ffc423thenmotion_changexby12.*ifsensing_keypresseduparrow.*');
            const reUp = new RegExp('.*ifsensing_keypresseduparrow.*ifsensing_touchingcolor#77d5c0thenmotion_changeyby-12.*ifsensing_keypresseddownarrow.*');
            const reDown = new RegExp('.*ifsensing_keypresseddownarrow.*ifsensing_touchingcolor#00bfffthenmotion_changeyby12.*');
            
            if (!str.match(reRight)) {
              window.testResult = "Test failed: you need to change the color of the right wall in your code.";
            } else if (!str.match(reLeft)) {
              window.testResult = "Test failed: you need to change the color of the left wall in your code.";
            } else if (!str.match(reUp)) {
              window.testResult = "Test failed: you need to change the color of the top wall in your code.";
            } else if (!str.match(reDown)) {
              window.testResult = "Test failed: you need to change the color of the bottom wall in your code.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "Bouncing") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the ball's color in your code. ";
          } else {
            str = str.replace(/\s/g, '');           
            if (str.indexOf(`ifsensing_touchingcolor#4085e0thenlooks_switchcostumetoball-b`) < 0) {
              window.testResult = "Test failed: change the ball's costume to 'ball-b' when it hits the blue edge. ";
            } else if (str.indexOf(`ifsensing_touchingcolor#f77decthenlooks_switchcostumetoball-c`) < 0) {
              window.testResult = "Test failed: change the ball's costume to 'ball-c' when it hits the pink edge.";
            } else if (str.indexOf(`ifsensing_touchingcolor#8b6ff5thenlooks_switchcostumetoball-e`) < 0) {
              window.testResult = "Test failed: change the ball's costume to 'ball-e' when it hits the purple edge.";
            } else if (str.indexOf(`ifsensing_touchingcolor#45d87cthenlooks_switchcostumetoball-d`) < 0) {
              window.testResult = "Test failed: change the ball's costume to 'ball-d' when it hits the green edge.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "Heartbeats") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the sizes as required.  ";
          } else {
            str = str.replace(/\s/g, '');           
            if (str.indexOf(`event_whenflagclickedforeverwait0.5secondslooks_setsizeto20wait0.5secondslooks_setsizeto30`) < 0 && 
                str.indexOf(`event_whenflagclickedforeverwait0.5secondslooks_setsizeto30wait0.5secondslooks_setsizeto20`) < 0 &&
                str.indexOf(`event_whenflagclickedforeverlooks_setsizeto30wait0.5secondslooks_setsizeto20wait0.5seconds`) < 0 &&
                str.indexOf(`event_whenflagclickedforeverlooks_setsizeto20wait0.5secondslooks_setsizeto30wait0.5seconds`) < 0
            ) {
              window.testResult = "Test failed: please mix the 'set size' blocks and the 'wait' blocks. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "SetSize") {
        if (s === "2") window.testResult = "Test failed: please set the cat's size to 15, and place it at (10, -170). ";
        if (s === "3") window.testResult = "Test failed: please set the apple's size to 25, and place it at (-12, 170). ";
      } else if (p[2] === "MazeColor") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please change the colors as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            var count = (str.match(/ifsensing_touchingcolor#3/g) || []).length;          
            if (count < 4) {
              window.testResult = "Test failed: please change the color in all the four 'touching color' blocks as required. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "SlowDown") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please slow down the cat as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            if (str.indexOf('changexby1') > 0 || str.indexOf('changeyby1') > 0 || str.indexOf('changexby-1') > 0 || str.indexOf('changeyby-1') > 0) {
              window.testResult = "Test failed: please update the distance in 'change x' and 'change y' blocks as required. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "AddAnimation") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please add the animation as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp('.*ifsensing_keypressedrightarrow.*nextcostume.*ifsensing_keypressedleftarrow.*nextcostume.*ifsensing_keypresseduparrow.*nextcostume.*ifsensing_keypresseddownarrow.*nextcostume.*');
            if (!str.match(re)) {
              window.testResult = "Test failed: please add 'next costume' block for all the four arrow keys. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "AddBGM") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please add the background music as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            if (str.indexOf('event_whenflagclickedforeversound_playuntildoneClassicalPiano') < 0) {
              window.testResult = "Test failed: please play 'Classical Piano' repeatedly as the background sound. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "ShowTimeSpent") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please show the time spent as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp('.*forever.*ifsensing_touchingobjectApplethensaysensing_timerfor2seconds.*');
            if (!str.match(re)) {
              window.testResult = "Test failed: please let the cat say the time spent for 2 seconds. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "FullSentence") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please show the time spent as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp('.*forever.*ifsensing_touchingobjectApplethensay"Youtook"sensing_timer"seconds!"for.seconds.*');
            if (!str.match(re)) {
              window.testResult = "Test failed: please let the cat say the full sentence. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "Sentence2") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please show the time spent as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp('.*forever.*ifsensing_touchingobjectApplethensay"Goodjob!Ittookyou"sensing_timer"secondstogetoutofthemaze!"for.seconds.*');
            if (!str.match(re)) {
              window.testResult = "Test failed: please let the cat say the new sentence. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "MagicBroom") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please display the words when the wizard touches the magic broom. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`.*forever.*ifsensing_touchingobjectBroomthensay.*Hey!Let'sgoflying!.*for.seconds.*`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please display the words when the wizard touches the magic broom. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "NextMaze") {
        if (s === "2") window.testResult = "Test failed: please change the Maze's costume to the next one when the cat touches the apple. ";
      } else if (p[2] === "ReadyForNext") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re1 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*motion_gotoxy10-170.*`);
            const re2 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*motion_pointindirection90.*`);
            const re3 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*sensing_resettimer.*`);
            if (!str.match(re1)) {
              window.testResult = "Test failed: please move the cat to (10, -170). ";
            } else if (!str.match(re2)) {
              window.testResult = "Test failed: please make the cat point in direction 90. ";
            } else if (!str.match(re3)) {
              window.testResult = "Test failed: please reset the timer. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "AllDone") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          if (s === "2") window.testResult = "Test failed: the Maze sprite should broadcast 'all done' message when the current costume number is 8.";
          else {
            let flag = true;
            /*let str = getScriptFromXML("event_whenbroadcastreceived", "next maze");
            if (!str || str === "") {
              window.testResult = "Test failed: please modify the script as required. ";
            } else {
              str = str.replace(/\s/g, ''); 
              const re1 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*gotox10y-170.*`)
              if (!str.match(re1)) {
                window.testResult = "Test failed: the Maze sprite should broadcast 'all done' message and stop its own script. ";
                flag = false;
              } 
            } */

            let str = getScriptFromXML("event_whenbroadcastreceived", "all done");
            if (!str || str === "") {
              window.testResult = "Test failed: please modify the cat's script as required. ";
              flag = false;
            } else {
              str = str.replace(/\s/g, ''); 
              const re1 = new RegExp(`whenIreceivealldonesay.*for.*seconds.*`);
              if (!str.match(re1)) {
                window.testResult = "Test failed: the cat should congratulate the player and stop its own script when receiving 'all done'. ";
                flag = false;
              } 
            } 

            if (flag) window.testResult = "Test passed!";
          }
        }
      } else if (p[2] === "ClickCat") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let flag = true;
          let str = getScriptFromXML("event_whenbroadcastreceived", "go right");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re1 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*gotox10y-170.*`);
            if (!str.match(re1)) {
              window.testResult = "Test failed: please make the cat go right upon receiving 'go right'. ";
              flag = false;
            } 
          } 

          str = getScriptFromXML("event_whenbroadcastreceived", "go up");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re1 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*gotox10y-170.*`);
            if (!str.match(re1)) {
              window.testResult = "Test failed: please make the cat go upward upon receiving 'go up'. ";
              flag = false;
            } 
          }
          
          str = getScriptFromXML("event_whenbroadcastreceived", "go left");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re1 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*gotox10y-170.*`);
            if (!str.match(re1)) {
              window.testResult = "Test failed: please make the cat go left upon receiving 'go left'. ";
              flag = false;
            } 
          }

          str = getScriptFromXML("event_whenbroadcastreceived", "go down");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re1 = new RegExp(`.*forever.*ifsensing_touchingobjectApplethensay.*gotox10y-170.*`);
            if (!str.match(re1)) {
              window.testResult = "Test failed: please make the cat go downward upon receiving 'go down'. ";
              flag = false;
            } 
          }

          if (flag) window.testResult = "Test passed!";
        }
      } else if (p[2] === "HitBall") {
        if (s === "2") window.testResult = "Test failed: please change the baseball's size by 10 until the size reaches 150. ";
        if (s === "3") window.testResult = "Test failed: please change the baseball's y position by -10 until its size reaches 150. ";
        if (s === "4") window.testResult = "Test failed: the batter's costume number should be 4 after she hit the baseball. ";
      } else if (p[2] === "ShootBasketball") {
        if (s === "2") window.testResult = "Test failed: the basketball's y position should be less than -50. ";
        if (s === "3") window.testResult = "Test failed: Andie should be in his costume #3. ";
      } else {
        window.testResult = "Test failed: the test condition was not met. ";
      }

            showNewAlert(window.testResult);


      window.submitTestResultInChat(window.testResult);

    } else if (window.testCondition.indexOf("TestFinished_Balloon") == 0) {
      const p = window.testCondition.split("_");
      if (s === "1") { 
        window.testResult = "Test passed!";
      } else if (p[2] === "DrawReticle") {
        if (s === "2") window.testResult = "Test failed: you need to draw a new sprite whose name is 'Reticle'.";
      } else if (p[2] === "AddCostumes") {
        if (s === "2") window.testResult = "Test failed: you need to add two costumes for the balloon sprite.";
      } else if (p[2] === "SmallerCostume") {
        if (s === "2") window.testResult = "Test failed: you need to add one smaller costume for the balloon sprite.";
      } else if (p[2] === "RainbowFlower") {
        if (s === "2") window.testResult = "Test failed: you need to draw a rainbow flower and put the butterfly on it.";
      } else if (p[2] === "CloneBalloon") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`.*control_create_clone_of_myself_motion_gotoxy-230pickrandom230-170pickrandom170`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please make a clone of the balloon and set it to a random position. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "CloneTenBalloons") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`.*repeatfor10control_create_clone_of_myself_.*looks_nextcostume.*`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please make ten clones of the balloon with different costumes. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "MoveClones") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("control_start_as_clone");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`control_start_as_clonemotion_gotoxy.*pickrandom.*forevermotion_changeyby.*pickrandom.*`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please write a script to raise the cloned balloons from the bottom to the top. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "HideParent") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str1 = getScriptFromXML("control_start_as_clone");
          let str2 = getScriptFromXML("event_whenflagclicked");
          if (!str1 || str1 === "" || !str2 || str2 === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str1 = str1.replace(/\s/g, ''); 
            str2 = str2.replace(/\s/g, ''); 
            const re1 = new RegExp(`control_start_as_clone.*show.*forever.*`)
            const re2 = new RegExp(`event_whenflagclicked.*hide.*repeat.*`)
            if (!str1.match(re1)) {
              window.testResult = "Test failed: please show the cloned balloons. ";
            } else if (!str2.match(re2)) {
              window.testResult = "Test failed: please hine the parent balloons. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "StarsInSky") {
        if (s === "2") window.testResult = "Test failed: please clone 25 stars and show them in a random size and at a random position. ";
      } else if (p[2] === "HatchChickens") {
        if (s === "2") window.testResult = "Test failed: please clone 10 eggs and hatch them by switching costumes. ";
      } else if (p[2] === "FollowMouse") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re1 = new RegExp(`event_whenflagclicked.*forever.*motion_goto_mouse.*`);
            const re2 = new RegExp(`event_whenflagclicked.*forever.*motion_gotoxysensing_mousexsensing_mousey.*`);
            if (!str.match(re1) && !str.match(re2)) {
              window.testResult = "Test failed: please use the 'go to' block to make the reticle move along the mouse.";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "BustBalloons") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenthisspriteclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`event_whenthisspriteclickedlooks_hide`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please hide the balloon if the sprite is clicked. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "RecycleBalloons") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("control_start_as_clone");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`control_start_as_clone.*forever.*ifmotion_yposition>170thenmotion_gotoxy-230pickrandom230-170.*`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please move the balloon back to the bottom if its y position is greater than 170. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "BustBalloons2") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("control_start_as_clone");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`control_start_as_clone.*forever.*ifsensing_touchingobject_mouse_&&sensing_mousedownthenlooks_hide.*`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please hide the balloon if the sprite is clicked. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "WandAndStars") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("control_start_as_clone");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            if (str.indexOf('looks_setsizeto10pickrandom30') < 0) {
              window.testResult = "Test failed: please set the star's size to a random number between 10 and 30. ";
            } else if (str.indexOf('forevermotion_glide0.5secstoxsensing_mousex+-20pickrandom20ysensing_mousey+-20pickrandom20') < 0) {
              window.testResult = "Test failed: please glide the star close to the wand. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "CrystalDigger") {
        if (s === "2") window.testResult = "Test failed: you need to find the crystal to pass the challenge. ";
      } else if (p[2] === "AddScores") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str1 = getScriptFromXML("event_whenflagclicked");
          let str2 = getScriptFromXML("event_whenthisspriteclicked");
          if (!str1 || str1 === "" || !str2 || str2 === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str1 = str1.replace(/\s/g, ''); 
            str2 = str2.replace(/\s/g, ''); 
            const re1 = new RegExp(`event_whenflagclicked.*setScoreto0.*repeat.*`);
            const re2 = new RegExp(`event_whenthisspriteclicked.*changeScoreby1.*`);
            if (!str1.match(re1)) {
              window.testResult = "Test failed: please initialize 'Score' to zero in the main script. ";
            } else if (!str2.match(re2)) {
              window.testResult = "Test failed: please change 'Score' by 1 when a balloon is clicked. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "AddBGM") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenflagclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`event_whenflagclickedforeversound_playuntildoneGuitarChords1`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please play the sound 'Guitar Chords1' repeatedly as the background music. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "SizeAndSound") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str1 = getScriptFromXML("event_whenflagclicked");
          let str2 = getScriptFromXML("event_whenthisspriteclicked");
          if (!str1 || str1 === "" || !str2 || str2 === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str1 = str1.replace(/\s/g, ''); 
            str2 = str2.replace(/\s/g, ''); 
            const re1 = new RegExp(`event_whenflagclicked.*setsizeto50.*repeat.*`);
            const re2 = new RegExp(`event_whenthisspriteclicked.*sound_playPop.*`);
            if (!str1.match(re1)) {
              window.testResult = "Test failed: please set the balloon size to 50. ";
            } else if (!str2.match(re2)) {
              window.testResult = "Test failed: please start the sound 'Pop' when the balloon is clicked. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "Randomness") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str1 = getScriptFromXML("event_whenflagclicked");
          let str2 = getScriptFromXML("control_start_as_clone");
          if (!str1 || str1 === "" || !str2 || str2 === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str1 = str1.replace(/\s/g, ''); 
            str2 = str2.replace(/\s/g, ''); 
            const re1 = new RegExp(`event_whenflagclicked.*repeat.*wait1seconds.*`);
            const re2 = new RegExp(`control_start_as_clone.*forever.*if.*hide.*wait1pickrandom5seconds.*show.*`);
            if (!str1.match(re1)) {
              window.testResult = "Test failed: please wait for a second before generating the next clone. ";
            } else if (!str2.match(re2)) {
              window.testResult = "Test failed: please wait for a random number of seconds before moving the balloon back to the bottom. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else if (p[2] === "BonusBalloon2") {
        if (currentXML == "") {
          window.testResult = "Test failed: you haven't changed your program yet.";
        } else {
          let str = getScriptFromXML("event_whenthisspriteclicked");
          if (!str || str === "") {
            window.testResult = "Test failed: please modify the script as required. ";
          } else {
            str = str.replace(/\s/g, ''); 
            const re = new RegExp(`event_whenthisspriteclicked.*iflooks_costume.*==6thenchangeScoreby3elsechangeScoreby1.*`);
            if (!str.match(re)) {
              window.testResult = "Test failed: please change the score by 3 if the orange balloon is busted. ";
            } else window.testResult = "Test passed!"; 
          }
        }
      } else {
        window.testResult = "Test failed: the test condition was not met. ";
      }
      showNewAlert(window.testResult);
      window.submitTestResultInChat(window.testResult);   

    } else if (!window.testCondition || window.testCondition == "") {

      // $("#messagecontent").html("No test specified at this moment.");
      // $("#scratchoverlay").show();
      // setTimeout(() => {
      //   $("#scratchoverlay").hide();
      // }, 1000);

      showNewAlert("No test specified at this moment.");
    }


  }

  dismissOverlay() {
    const { isLoadingScratch } = this.state;
    if (!isLoadingScratch)
      $("#scratchoverlay").hide();
  }

  // value should be decompressed plain xml here
  handleNewXML(value) {
    const { saveRobotCode, userLesson, slide } = this.props;
    // const cvalue = "LZLZ" + UTF.U16to8(LZString.compressToUTF16(value));
    const cvalue = "LZLZ" + LZString.compressToBase64(value);
  // const oldValue = this.state.oldCode;

    // const lintErrors = this.getLintErrors();
    // const firstError = lintErrors.length > 0 ? `${lintErrors[0].from.line}:${lintErrors[0].message}` : '';

    let v = value;

    currentXML = v;
    
    if (value.indexOf("&&") > 0) {
      const parts = value.split('&&');
      for (let i = 0; i < parts.length; i += 2) {
        if (parts[i] == window.currentSpriteName || !window.currentSpriteName) {
          currentXML = parts[i + 1];
          break;
        }
      }
    }
    // if (value.indexOf("AI&&") == 0)
    //   currentXML = value.substr(4);
    
    
    // if (1) return;
    const log = userLesson.slideVisitLog.find(e => (e.slideId == slide.ID));

    let logvalue = log.userRobotCode;
    if (logvalue && logvalue.indexOf("LZLZ") == 0) {
      logvalue = LZString.decompressFromBase64(logvalue.substring(4));
    }

    if (logvalue && logvalue.includes(value)) {
      allXML = logvalue;
      clearTimeout(waitingToSave);
      return;
    }

    const that = this;

    let thevalue;
    if (!log.userRobotCode || log.userRobotCode.includes("INVALIDECODE")) {
      thevalue = value;
    } else {

      let pvalue = log.userRobotCode;
      if (pvalue && pvalue.indexOf("LZLZ") == 0) {
        //pvalue = LZString.decompressFromUTF16(UTF.U8to16(log.userRobotCode.substring(4)));
        pvalue = LZString.decompressFromBase64(log.userRobotCode.substring(4));
      }

      const vparts = value.split("&&");

      const parts = pvalue.split("&&");
      let found = false;
      for (let k=0; k<parts.length; k += 2) {
        if (parts[k] == vparts[0]) {
          found = true;
          parts[k+1] = vparts[1];
          break;
        }
      }
      if (!found) {
        thevalue = pvalue + "&&" + value;
      } else {
        thevalue = parts.join("&&");
      }

    }

    allXML = thevalue;

    clearTimeout(waitingToSave);

    if (thevalue.indexOf("<block type") > 0) {
      // do not save if no block!!
      waitingToSave = setTimeout(() => {

        robotCodeSaveInd ++;
        robotCodeSaveSlideId = that.props.slide.ID;
  
        // thevalue = "testabcdeft&&<xml>";
        //const cs = "LZLZ" + UTF.U16to8(LZString.compressToUTF16(thevalue)) + "LZ";
        // thevalue = thevalue.substring(0, 88);
        const cs = "LZLZ" + LZString.compressToBase64(thevalue);
        console.log("compress " + thevalue.length + " to " + cs.length);
        // const bb = LZString.decompressFromBase64(cs.substring(4));
  
        Meteor.call("saveUserRobotCodeForLesson", userLesson._id, cs, robotCodeSaveInd);
        waitingToSave = -1;
      }, 2000);
    }
  }

  /**
   * Stop the Application when unmounting.
   */
  componentWillUnmount() {
    // console.log("cm will unmount");
    if (this.gameSetup) {
      if (this.gameSetup.cleanUpAll) {
        this.gameSetup.cleanUpAll();
      }

      if (this.gameSetup.gameObj) {
        this.deepClean(this.gameSetup.gameObj);
      }
      this.deepClean(this.gameSetup);
      delete this.gameSetup;
    }
    if (screenfull) {
      screenfull.exit();
      orientation.unlock();
    }
  }

  tryResize() {
    const { isTesting } = this.props;
    const renderer = this.renderer;
    const stage = this.stage;

    // console.log('content dimension changed');
    // debugger;
    let w2 = $(this.gameCanvas).parent().width();
    let h2 = $(this.gameCanvas).parent().height();
    this.isLandscape = orientation.type.includes('landscape');
    // const h2 = w2 / 2;


    // const TrueHeight = 1200;
    // const TrueWidth = 2400;
    const whratio = this.TrueWidth / this.TrueHeight; // width vs height
    const oldnewratio = this.TrueWidth / 1600; // new vs old true width
    const metalBorderThick = 33.3964 * oldnewratio * 1.1;
    const wtabletop = 2000; // table is 2000x1000 now!


    const showControls = false;
    // showControls = 0; // aaaa

  }

  deepClean(obj) {
    if (!obj) return;
    _keys(obj).forEach((k) => {
      if (obj[k] && obj[k].destroy) {
        if (typeof obj.destroy === 'function') {
          obj.destroy(true);
        }
      }
      delete obj[k];
    });
  }

  cleanUpTankGame() {
    // const newWindowAttrs = Object.keys(window);

    // for (let i=0; i<newWindowAttrs.length; i++) {
    //   const key = newWindowAttrs[i];
    //   if (!windowAttrs.includes(key)) {
    //     console.log("removing key from window " + key);
    //     delete window[key];
    //   }
    // }
    delete window.gameSetup;
    delete window.Victor;
    delete window.robotCodeEditor;
    // delete this.gameSetup.exitTestScreen;
    delete window.handleNewRobotCodeChange;
    delete window.TWEEN;
    // delete window.eslint;
    delete window.Howl;
    delete window.HowlerGlobal;
    delete window.Howler;
    delete window.testCondition;
    delete window.testResult;
    delete window.testGameComponent;
  }


  handleResize() {
    if (!this.gameCanvas) return;
    const w2 = $(this.gameCanvas).parent().width();
    const h2 = $(this.gameCanvas).parent().height();

    // console.log("window resize new w2 h2 " + w2 + " " + h2);
    this.renderer.resize(1, 200); // trigger a resize of parent's parent
  }

  createScratchGame() {
    const {
      scenario, isTesting, isReplay, room, config, isProfessionalUser, reacthistory
    } = this.props;
    const myUser = Meteor.user();
    const that = this;
    const gameSetup = {
      winners: [],
      isOver: false
    };
  
    let diff = 0;
    gameSetup.isProfessionalUser = isProfessionalUser; // isProfessionalUser;

    gameSetup.history = history;
    gameSetup.playerCount = 1;
    gameSetup.room = room;


    // whoever is the first in the playerInfo list is the game host, though
    // it doesn't mean he takes the break. Just means he has to decide who
    // has the token to take the break
    this.gameSetup = gameSetup;


    window.testGameComponent = this;

    // this.gameSetup.exitTestScreen = () => {
    //   that.toggleModal();
    // };

    const getSetupCodeBeforeEnd = (c) => {
      // first remove comments between /* and */
      const c2 = c.replace(/\/\*.*\*\//g, ' ');

      // then ignore all words after  //

      // then get all lines before ReportEndOfTest
      const lines = c2.split("\n");
      let c3 = "";
      for (let k = 0; k < lines.length; k++) {
        c3 += `${lines[k]}\n`;
        if (lines[k].indexOf("ReportEndOfTest") >= 0) {
          if (lines[k].indexOf("//") < 0) {
            return c3;
          }
          if (lines[k].indexOf("ReportEndOfTest") < lines[k].indexOf("//")) {
            return c3;
          }
        } else {
        }
      }
      return c3;
    };

    gameSetup.onNewTestRun = function onNewTestRun(setupCode, robotCode) {
      // console.log("onNewTestRun: to call old setup code!!!! " + oldSetupCode);
      Meteor.setTimeout(() => {
        if (!gameSetup.controller) return;
        gameSetup.inNewTest = true;
        gameSetup.config.hideHeadline(true);
        gameSetup.controller.setRobotCode(robotCode);
        let setup = setupCode;
        // if (setup.indexOf("ReportEndOfTest") < 0) {
        //   const p = setup.split("\n");
        //   for (let k=p.length-1; k>=0; k--) {
        //     if (p[k].trim().length > 0) {
        //       // last line in test script. if no WaitForAllBallStop, then add one
        //       if (p[k].indexOf("WaitForAllBallStop") < 0) {
        //         setup += "\r\nawait WaitForAllBallStop()";
        //       }
        //       break;
        //     }
        //   }
        //   setup += "\r\nReportEndOfTest();";
        // }

        // remove all lines after "ReportEndOfTest"
        // setup = setup.substring(0, setup.indexOf("ReportEndOfTest();") + 18);
        setup = getSetupCodeBeforeEnd(setup);

        gameSetup.controller.createAIPlayers(setup, true);
        gameSetup.testSetupCode = setup; // used to resetup table after all stop!
        gameSetup.paused = false;
        gameSetup.gameOver = false;
        // setTimeout(()=>{
        //   gameSetup.controller.runTest();
        // }, 500);
        // gameSetup.controller.runCode(oldSetupCode);
      }, 5);
    };

    if (scenario && scenario.SetupScript) {
      gameSetup.testSetupCode = scenario.SetupScript; // used to resetup table after all stop!
    }

    window.gameSetup = gameSetup; // pointer to be used by codemirror and chat components
    // gameSetup.setupGame(room);
    // console.log('gameSetup', gameSetup);
    // const gameObj = new ScratchGUI(gameSetup);
    // gameObj.setupGameRoom();
    // this.gameObject = gameObj;
  }

  hideChartDiv() {
    $("#chartcontainer").hide();
  }

  /**
   * Simply render the div that will contain the Pixi Renderer.
   */
  render() {
    const component = this;
    const { room, slide, lesson } = this.props;
    const currentPlayer = room && room.playerInfo.find(player => player.userId === Meteor.userId() && !player.aiVersion);
    const showButton = room && room.gameType !== GAME_TYPE.TESTING && currentPlayer;

    const h = document.body.clientHeight - 88;

    // const iframe = document.getElementById("scratchIFrame");
    // if (iframe && iframe.clientWidth < 200) {
    //   this.setState({isLoadingScratch: true});
    //   $("#messagecontent").html("Loading project ...");
    //   $("#scratchoverlay").show();
    // }

    let indexfile = "indexorig.html";
    if (kindergartenScratchGameList.includes(lesson.gameId) ) {
      indexfile = "index.html";
    }
    if (lesson.LessonName.includes("Drawing Turtle Jr") ) {
      indexfile = "index.html";
    }

    return (
      <div className="scratchgui" style={{height: (h-40) + 'px'}} >
        <iframe id="scratchIFrame" style={{width: '100%', minWidth: "1050px", height: h + 'px', marginTop: '1px'}} src={"/scratch/" + indexfile + "?" + ( slide.LOCALE ? "newlocale=" + slide.LOCALE + "&" : window.currentChosenLocale ? "newlocale=" + (window.currentChosenLocale == "CH" ? "zh-cn" : "en") + "&" : "newlocale=en&" ) + "#" + slide.PROJECTID + "&"+Math.random() + (slide.SCRATCHFULL ? "&fullscratch=1" :  (slide.SCRATCHUNLOCKED ? "&unlockscratch=1" : ""))   }/>

        {/* <iframe id="scratchIFrame" style={{width: '100%', height: h + 'px', marginTop: '1px'}} src={"/scratch/index.html?"+(slide.SCRATCHUNLOCKED ? "unlockscratch=1" : "") }/> */}
        

        {/* <Helmet>
          <script type="text/javascript" src="../../../../node_modules/scratch/dist/lib.min.js">
          </script>
          <script type="text/javascript" src="../../../../node_modules/scratch/dist/chunks/gui.js"></script>
        </Helmet> */}
        
        <div id="scratchoverlay" onClick={this.dismissOverlay} className="lectureoverlay" style={{display: "none"}} >
          <div id="scratchmessage">
            <label id="messagecontent">Test Failed</label>
            {/* <br/>
            <br/>
            <label id="coinslabel" style={{display: "block"}}> +10</label> */}
          </div>
        </div>
    </div>
    );
  }
}

export default ScratchComponent;
