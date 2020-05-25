/* global screen */
import React from 'react';
import Victor from 'victor';
import _get from 'lodash/get';
import _keys from 'lodash/keys';
import { orientation } from 'o9n';
// window.PIXI = require('pixi.js');
import isMobile from 'ismobilejs';
import screenfull from 'screenfull';
import TankWar from "./tankwargame.js";
import {
  GAME_TYPE, GAME_CONFIG_OPTION, BUTTON_FOR_PHONE, BUTTON_HIGHLIGHT
} from '../../../../../lib/enum';
import { getPeers } from '../../../../../lib/util';

const ResizeSensor = require('css-element-queries/src/ResizeSensor');

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1
  // Professional: 1
};

// interface IMainProps {}
// interface IMainState {}
class TankWarComponent extends React.Component {
  constructor(props) {
    super(props);
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
  }

  componentDidUpdate() {
    this.tryResize();
  }

  componentDidMount() {
    const { isTesting, room } = this.props;
    // this.app = new Pixi.Application(window.innerWidth, window.innerHeight);
    // this.gameCanvas.appendChild(this.app.view);
    // this.app.start();

    // Create the canvas and add it the DOM...
    const w = $(this.gameCanvas).width();
    const h = $(this.gameCanvas).height();
    window.PIXI = require('pixi.js');
    window.PIXI["default"] = PIXI;
    // require('pixi-particles');
    require("pixi-layers");
    if (!isTesting) {
      require('pixi-keyboard');
    }
    const renderer = PIXI.autoDetectRenderer(400, 200, { transparent: false, antialias: true });
    const ticker = PIXI.ticker.shared;
    // Set this to prevent starting this ticker when listeners are added to it
    // By default this is true only on the PIXI.ticker.shared instance
    ticker.autoStart = false;
    // Call this to ensure the ticker is stopped right now
    ticker.stop();

    this.gameCanvas.appendChild(renderer.view);

    const stage = new PIXI.Container();
    this.stage = stage;
    const tableg = new PIXI.Graphics();

    tableg.lineStyle(0);
    if (isTesting) {
      tableg.beginFill(0x000000, 1); // black game background
    } else {
      tableg.beginFill(0x110000, 1); // dark red game background
    }

    tableg.drawRect(0, 0, this.TrueWidth, this.TrueHeight);
    tableg.endFill();
    // tableg.beginFill(0x166aa0, 0.8); // original blue
    // tableg.drawRect(0, 200, 2000, 1000);
    // tableg.beginFill(0xff0000, 0.8); // original blue
    // tableg.drawRect(20, 210, 1960, 980);
    stage.addChild(tableg);
    renderer.render(stage);
    this.renderer = renderer;

    // if (h > 10) {
    window.resizeGameWindow = this.tryResize.bind(this);
    this.tryResize();
    // }

    window.addEventListener('resize', this.handleResize.bind(this));

    const s = new ResizeSensor($(this.gameCanvas).parent().parent(), this.tryResize.bind(this));

    this.createTankGame();

    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    BUTTON_FOR_PHONE.map((button) => {
      if (document.getElementById(button.id)) {
        document.getElementById(button.id).oncontextmenu = (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        };
      }
      return null;
    });
    const lock = orientation.lock('landscape-primary');
    console.log(lock);
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
    this.cleanUpTankGame();

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
    if (showControls) {
      // h2 = h2  - 182; // top and bottom bars
      // console.log("old w2 h2 " + w2 + " " + h2);
      if (w2 > h2 * whratio) {
        w2 = h2 * whratio;
      } else {
        h2 = w2 / whratio;
      }
      // console.log("new w2 h2 " + w2 + " " + h2);
      if (w2 >0 && h2 > 0)
        renderer.resize(w2, h2);

      stage.scale.x = w2 / this.TrueWidth;
      stage.scale.y = stage.scale.x; // h2 / 1000;
      stage.position.set(0, 0);
    } else {
      const wfulltable = this.TrueWidth; // wtabletop + 2 * metalBorderThick ;
      const hfulltable = this.TrueHeight; // wtabletop/2 + 2 * metalBorderThick;
      const ratio = wfulltable / hfulltable;
      const isTablet = isMobile.tablet;

      if (isTablet && this.isLandscape) {
        w2 = hfulltable;
      }

      // console.log("old w2 h2 " + w2 + " " + h2);
      if (w2 > h2 * ratio) {
        w2 = h2 * ratio;
      } else {
        h2 = w2 / ratio;
      }
      // console.log("new w2 h2 " + w2 + " " + h2);
      if (w2 >0 && h2 > 0)
        renderer.resize(w2, h2);


      // const r = (wtabletop / 108); // table width is 9 feet = 108 inch
      // const metalBorderThick = 2.2 * r; // new table
      stage.scale.x = w2 / wfulltable;
      stage.scale.y = h2 / hfulltable; // h2 / 1000;
      stage.position.set(0 - (this.TrueWidth - wfulltable) / 2 * stage.scale.x, 0 - (this.TrueHeight - hfulltable + 5) * stage.scale.y);
    }
    renderer.render(stage);
    renderer.view.setAttribute("style", `position:absolute;right:${0}px;left:${0}px;top:0px;bottom:0px;margin:auto`);
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

  createTankGame() {
    const {
      scenario, isTesting, isReplay, room, config, isProfessionalUser, reacthistory
    } = this.props;
    const myUser = Meteor.user();
    const that = this;

    let diff = 0;


    // window.PIXI = require('pixi.js');
    const Howler = require('howler');
    window.Howl = Howler.Howl;
    window.TWEEN = require('../components/Tween.min.js');
    window.Victor = Victor;
    // const PathPoolGameSetupLib = require('../lib/trajectorypoolgamesetup.js');
    // const PathPoolGameSetup = PathPoolGameSetupLib.default;
    // const gameSetup = new PathPoolGameSetup();



    const gameSetup = {
      winners: [],
      isOver: false
    };
    gameSetup.backgroundItems = _get(config, 'backgroundItems');
    gameSetup.mainItems = _get(config, 'mainItems');


    if (isReplay) {
      gameSetup.gameType = GAME_TYPE.REPLAY;

      gameSetup.difficulty = LEVEL_NUMBER[activeGame.difficulty];

      // gameSetup.playerInfo = [playerInfo1, playerInfo2];
      gameSetup.playerInfo = activeGame.playerInfo;
      const numberOfPlayers = gameSetup.playerInfo.length;
      for (let k = 0; k < numberOfPlayers; k++) {
        gameSetup.playerInfo[k].ID = 0;
        gameSetup.playerInfo[k].ready = true;
        gameSetup.playerInfo[k].localInput = true;
        gameSetup.playerInfo[k].playerID = gameSetup.playerInfo[k].username;
        gameSetup.playerInfo[k].playerUserId = gameSetup.playerInfo[k].userId;
        gameSetup.playerInfo[k].PlayerCode = "";
      }

      gameSetup.roomId = "ReplayRoom";
      gameSetup.isHost = true;
      gameSetup.isLocal = true;
    } else if (isTesting) {
      gameSetup.gameType = GAME_TYPE.TESTING;
      if (scenario) {
        if (scenario.package == "intermediate") diff = 1;
      }

      gameSetup.difficulty = diff;

      gameSetup.playerInfo = [];
      for (let k = 0; k < 6; k++) {
        const playerInfo1 = {
          ID: k,
          ready: true,
          localInput: true,
          playerID: myUser.username,
          playerRating: 500,
          playerType: 'AI',
          playerUserId: Meteor.userId(),
          PlayerCode: ""
        };
        gameSetup.playerInfo.push(playerInfo1);
      }
      gameSetup.roomId = "TestingRoom";
      gameSetup.isHost = true;
      gameSetup.isLocal = true;
      gameSetup.localPlayerID = 0;
    } else {
      gameSetup.gameType = room.gameType;
      gameSetup.roomId = config.roomId;
      gameSetup.resumeCommands = config.resumeCommands;

      gameSetup.difficulty = LEVEL_NUMBER[room.difficulty];
      gameSetup.playerInfo = [];

      // console.log('#', room.playerInfo);
      for (let i = 0; i < room.playerInfo.length; i++) {
        room.playerInfo[i].ID = i;
        gameSetup.playerInfo.push(room.playerInfo[i]);
      }

      // console.log("gameSetup.playerInfo", gameSetup.playerInfo);
      // gameSetup.playerInfo = room.playerInfo;

      gameSetup.roomId = config.roomId;
      gameSetup.reacthistory = reacthistory;
      gameSetup.playerCount = room.playerInfo.length;
      gameSetup.pairData = config.pairData;

      gameSetup.isLocal = false;
      if (gameSetup.gameType == GAME_TYPE.PRACTICE || gameSetup.gameType == GAME_TYPE.TESTING || gameSetup.gameType == GAME_TYPE.AUTORUN || gameSetup.gameType === GAME_TYPE.BATTLE) {
        gameSetup.isLocal = true;
      }

      const myPlayerInfo = room.playerInfo.find(p => p.userId === Meteor.userId());
      gameSetup.isHost = myPlayerInfo.slot == 0 || gameSetup.gameType == GAME_TYPE.AUTORUN || gameSetup.isLocal;
      if (!gameSetup.isLocal) {
        const connectionInfoFields = _keys(room.connectionInfo);
        gameSetup.offerNames = getPeers(connectionInfoFields, myPlayerInfo.slot, 'offer');
        gameSetup.answerNames = getPeers(connectionInfoFields, myPlayerInfo.slot, 'answer');
        gameSetup.localPlayerID = room.playerInfo.find(p => p.userId === Meteor.userId()).slot;
      } else if (gameSetup.gameType === GAME_TYPE.BATTLE) {
        gameSetup.localPlayerID = room.playerInfo.findIndex(player => player.playerUserId === myUser._id);
      } else {
        gameSetup.localPlayerID = room.playerInfo.findIndex(player => player.playerType === GAME_CONFIG_OPTION.HUMAN);
        if (gameSetup.localPlayerID < 0) {
          gameSetup.localPlayerID = room.playerInfo.findIndex(player => player.playerUserId === myUser._id);
        }
      }
    }



    gameSetup.isProfessionalUser = isProfessionalUser; // isProfessionalUser;

    gameSetup.history = history;
    gameSetup.playerCount = gameSetup.playerInfo.length;
    gameSetup.renderer = this.renderer;
    gameSetup.stage = this.stage;
    gameSetup.room = room;


    // whoever is the first in the playerInfo list is the game host, though
    // it doesn't mean he takes the break. Just means he has to decide who
    // has the token to take the break
    this.gameSetup = gameSetup;
    this.gameSetup.inStrikeAnimation = false;


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
    const gameObj = new TankWar(gameSetup);
    gameObj.setupGameRoom();
    this.gameObject = gameObj;
  }

  hideChartDiv() {
    $("#chartcontainer").hide();
  }

  handleTouchStartArrowButton = (name, target) => (e) => {
    if (!target && !e) return;
    if (e) {
      e.preventDefault();
    }

    const currentTarget = target || e.target;

    BUTTON_HIGHLIGHT
      .filter(button => button !== `${currentTarget.id}2`)
      .map((button) => {
        document.getElementById(button).style.cssText = 'z-index: 0;';
        return null;
      });
    if (document.getElementById(`${currentTarget.id}2`)) {
      document.getElementById(`${currentTarget.id}2`).style.cssText = 'z-index: 2;';
    }
    if (['U', 'D', 'L', 'R'].includes(name)) {
      Object.keys(this.timers).map((key) => {
        if (key !== name && key !== 'S') {
          clearInterval(this.timers[key]);
          delete this.timers[key];
        }
        return null;
      });
      this.currentTarget = currentTarget;
      this.currentKeyName = name;
    }
    if (!this.timers[name]) {
      this.gameObject.handlePhoneButton(name);
      this.timers[name] = setInterval(() => {
        this.gameObject.handlePhoneButton(name);
      }, 150);
    }
    this.gameWrapper.click();
  };

  handleTouchEndArrowButton = name => (e) => {
    if (!e && !this.currentTarget) return;
    if (e) {
      e.preventDefault();
    }

    console.log('---------------------------------------');
    console.log('Key - ', name);
    console.log('Current key - ', this.currentKeyName)
    const keyName = ['U', 'D', 'L', 'R'].includes(name) && this.currentKeyName || name;
    console.log(keyName);
    console.log('End this.currentTarget-', this.currentTarget);
    if (e) console.log('End e target', e.target);
    const currentTarget = ['U', 'D', 'L', 'R'].includes(keyName) && this.currentTarget || e.target;

    console.log('End - ', currentTarget);
    if (document.getElementById(`${currentTarget.id}2`)) {
      document.getElementById(`${currentTarget.id}2`).style.cssText = 'z-index: 0';
    } else if (document.getElementById(currentTarget.id) && currentTarget.id.includes('2')) {
      document.getElementById(currentTarget.id).style.cssText = 'z-index: 0';
    }
    if (this.timers[keyName]) {
      clearInterval(this.timers[keyName]);
      delete this.timers[keyName];
      if (['U', 'D', 'L', 'R'].includes(keyName)) {
        this.gameObject.handlePhoneButton('P');
        this.currentTarget = null;
        this.currentKeyName = null;
      }
    }
  };

  handleTouchMove = (e) => {
    if (!e) return;
    if (!this.currentTarget) {
      this.currentTarget = e.target;
    }
    const movedTarget = document.elementFromPoint(e.targetTouches[0].clientX, e.targetTouches[0].clientY);

    if (!movedTarget.id.includes('Arrow')) return;
    if (this.currentTarget.id === 'backgroundButton') {
      const movedButton = BUTTON_FOR_PHONE.find(button => button.id === movedTarget.id);

      this.handleTouchStartArrowButton(movedButton.key, movedTarget)();
      return;
    }
    if (this.currentTarget.id.replace('2', '') !== movedTarget.id.replace('2', '')) {
      const currentButton = BUTTON_FOR_PHONE.find(button => button.id === this.currentTarget.id);
      const movedButton = BUTTON_FOR_PHONE.find(button => button.id === movedTarget.id);

      this.handleTouchEndArrowButton(currentButton.key)();
      this.handleTouchStartArrowButton(movedButton.key, movedTarget)();
    }
  };

  /**
   * Simply render the div that will contain the Pixi Renderer.
   */
  render() {
    const component = this;
    const { room } = this.props;
    const currentPlayer = room && room.playerInfo.find(player => player.userId === Meteor.userId() && !player.aiVersion);
    const showButton = room && room.gameType !== GAME_TYPE.TESTING && currentPlayer;

    return (
      <div
        id="gameWrapper"
        className="gameWrapper"
        style={{
          height: '100%', width: '100%', position: 'relative', display: 'block', border: '1px solid #383737', flex: 1, flexDirection: 'column'
        }}
        ref={(gameWrapper) => { this.gameWrapper = gameWrapper; }}
      >
        <div style={{ position: 'relative', height: '100%' }} ref={(thisDiv) => { component.gameCanvas = thisDiv; }} />
        {
          (isMobile.apple.phone || isMobile.android.phone || isMobile.seven_inch || isMobile.apple.tablet) && showButton && (
            <div className="buttons-game">
              {
                BUTTON_FOR_PHONE.map(button => (
                  <div
                    key={button.id}
                    id={button.id}
                    className={button.className}
                    onTouchStart={!button.noTouch ? this.handleTouchStartArrowButton(button.key) : () => {}}
                    onTouchEnd={!button.noTouch ? this.handleTouchEndArrowButton(button.key) : () => {}}
                    onTouchMove={button.handleMove ? this.handleTouchMove : () => {}}
                  />
                ))
              }
            </div>
          )
        }
        <div
          style={{
            backgroundColor: 'white', display: 'none', opacity: 1, position: 'absolute', top: '0px', width: '100%', height: '100%'
          }}
          id="chartcontainer"
        >
          <button
            style={{
              backgroundColor: '#236bc2', position: 'absolute', zIndex: 100, color: '#ffffff', right: '10px'
            }}
            onClick={this.hideChartDiv.bind(this)}
            type="button"
          >
            Close
          </button>
          <div
            style={{
              backgroundColor: 'white', position: 'absolute', zIndex: 10, top: '0px', width: '100%', height: '100%'
            }}
            id="datachart"
          />
        </div>
      </div>
    );
  }
}

export default TankWarComponent;
