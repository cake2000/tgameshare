/* global screen */
import React from 'react';
import Victor from 'victor';
import _get from 'lodash/get';
import _keys from 'lodash/keys';
import { orientation } from 'o9n';
// window.PIXI = require('pixi.js');
import isMobile from 'ismobilejs';
import screenfull from 'screenfull';
import ScratchGUI from "../../../scratch/scratch.jsx";
import {
  GAME_TYPE, GAME_CONFIG_OPTION
} from '../../../../../lib/enum';
import { getPeers } from '../../../../../lib/util';
var convert = require('xml-js');

const ResizeSensor = require('css-element-queries/src/ResizeSensor');
let robotCodeSaveInd = 0;
let waitingToSave = -1;
let robotCodeSaveSlideId = "";
let currentXML = "";
let currentRunCount = -100;
const timestamps = {};

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1
  // Professional: 1
};



const getAllText = (b) => {
  let s = "";
  if (!b ) return "";
  if (!b._attributes) {
    return;
  }
  if (b._attributes.type == "procedures_definition") {
    s = "define " + b.statement.shadow.mutation._attributes.proccode;    
  } else if (b._attributes.type == "data_deletealloflist") {
    s = "delete all of " + b.field._text;    
  } else if (b._attributes.type == "procedures_call") {
    s = "call " + b.mutation._attributes.proccode + " ";
    if (b.value ) {
      for (let k=0; k<b.value.length; k++) {
        s += getAllText(b.value[k].block || b.value[k].shadow) + "|";
      }    
    }
  } else if (b._attributes.type == "data_setvariableto") {
    s = "set " + b.field._text + " to " + getAllText(b.value.block  || b.value.shadow);
    if (s.includes("set c to")) {
      var x = 1;
    }
  } else if (b._attributes.type == "data_changevariableby") {
    s = "change " + b.field._text + " by " + getAllText(b.value.block || b.value.shadow);
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
      }
      s = getAllText(b.value[0].block || b.value[0].shadow) + op + getAllText(b.value[1].block || b.value[1].shadow);
    } else if (b.value && b.value.block) {
      s = b.field._text + " of " + getAllText(b.value.block);
    }

    

  } else if (b._attributes.type == "data_variable") {
    s = "'" + b.field._text + "'";
  } else if (b._attributes.type == "data_itemoflist") {
    s = "item " + b.value.shadow.field._text + " of " + b.field._text;
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
    s = "repeat for " + getAllText(b.value.block);
    if (b.statement ) {
      s = s + " \n     " + getAllText(b.statement.block);
    }

  } else if (b._attributes.type == "control_if_else") {
    s = " if " + getAllText(b.value.block);
    if (b.statement && b.statement[0]) {
      s = s + " \n then " + getAllText(b.statement[0].block);
      if (b.statement[1]) {
        s = s + " \n else " + getAllText(b.statement[1].block);
      }    
    } else {
      if (b.statement) {
        s = s + " \n then " + getAllText(b.statement.block);
      }
    }
  } else {
    // debugger;
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


// interface IMainProps {}
// interface IMainState {}
class ScratchEditorPage extends React.Component {
  constructor(props) {
    super(props);
    this.isLandscape = orientation.type.includes('landscape');
  }

  componentDidUpdate() {
    this.tryResize();
  }

  componentDidMount() {
    const { aicode } = this.props;
    // this.app = new Pixi.Application(window.innerWidth, window.innerHeight);
    // this.gameCanvas.appendChild(this.app.view);
    // this.app.start();

    

    // Create the canvas and add it the DOM...
    const w = $(this.gameCanvas).width();
    const h = $(this.gameCanvas).height();

    window.addEventListener('resize', this.handleResize.bind(this));

    const s = new ResizeSensor($(this.gameCanvas).parent().parent(), this.tryResize.bind(this));

    this.createScratchGame();

    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    const lock = orientation.lock('landscape-primary');
    console.log(lock);

    const that = this;
    // msg from iframe
  }

  dismissOverlay() {
    $("#scratchoverlay").hide();
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
    
  }

  hideChartDiv() {
    $("#chartcontainer").hide();
  }

  /**
   * Simply render the div that will contain the Pixi Renderer.
   */
  render() {
    const component = this;
    const {history, aicode, pid } = this.props;
    const h = window.innerHeight - 77;

    return (
      <div>
      {
          <div className="scratchgui">
            <iframe id="scratchIFrame3" style={{width: '100%', height: h + 'px', marginTop: '1px'}} src={"/scratch/index2.html#" + pid + "&fullscratch=1?"+Math.random()}/>
          </div>
      }

      </div>
    );
  }
}

export default ScratchEditorPage;
