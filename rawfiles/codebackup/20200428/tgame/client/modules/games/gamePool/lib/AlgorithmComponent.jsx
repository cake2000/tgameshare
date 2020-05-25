import React from 'react';
import Victor from 'victor';
import Script from 'react-load-script';
import _get from 'lodash/get';
import { orientation } from 'o9n';
import { GAME_TYPE, GAME_CONFIG_OPTION, BUTTON } from '../../../../../lib/enum';


import AlgorithmSetup from "./algorithmsetup.js";

const TrueHeight = 1453.5;
const TrueWidth = 2549;


const ResizeSensor = require('css-element-queries/src/ResizeSensor');

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1
  // Professional: 1
};

// interface IMainProps {}
// interface IMainState {}
class AlgorithmComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptLoaded: false
    };
  }

  handleScriptLoad = () => {
    this.setState({ scriptLoaded: true });

    this.lc = LC.init(
      this.gameCanvas,
      {
        imageURLPrefix: '/canvasjs/img',
        imageSize: { width: 800, height: null },
        primaryColor: "#008325",
        backgroundColor: "#fff"
      },
    );
  }

  handleScriptError = () => (
    <div className="admin-msg-err">
        Can not load script
    </div>
  )

  componentDidMount() {
    const { isTesting, room } = this.props;
    // this.app = new Pixi.Application(window.innerWidth, window.innerHeight);
    // this.gameCanvas.appendChild(this.app.view);
    // this.app.start();

    // Create the canvas and add it the DOM...
    const w = $(this.gameCanvas).width();
    const h = $(this.gameCanvas).height();

    this.tryResize();

    window.addEventListener('resize', this.handleResize.bind(this));
    window.resizeGameWindow = this.tryResize.bind(this);

    const s = new ResizeSensor($(this.gameCanvas).parent().parent(), this.tryResize.bind(this));

    this.createCanvas();

    this.tryResize();

    // const lock = orientation.lock('landscape-primary');
    // console.log(lock);
  }

  componentDidUpdate() {
    // this.tryResize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  /**
   * Stop the Application when unmounting.
   */
  componentWillUnmount() {
    // console.log("cm will unmount");
    // if (this.gameSetup) {
    //   if (this.gameSetup.cleanUpAll) { this.gameSetup.cleanUpAll(); }

    //   if (this.gameSetup.gameObj) { this.deepClean(this.gameSetup.gameObj); }
    //   this.deepClean(this.gameSetup);
    //   delete this.gameSetup;
    // }
    // this.cleanUpPoolGame();
    // orientation.unlock();
  }

  tryResize() {

    if (this.lc) this.lc.respondToSizeChange();

    const { isTesting, isReplay } = this.props;
    let w2 = $(this.gameCanvas).parent().width();
    let h2 = $(this.gameCanvas).parent().height();
    // const h2 = w2 / 2;


    // const TrueHeight = 1200;
    // const TrueWidth = 2400;
    const whratio = TrueWidth / TrueHeight; // width vs height
    const oldnewratio = 2600 / 1600; // new vs old true width
    const metalBorderThick = 33.3964 * oldnewratio * 1.1;
    const wtabletop = 2000; // table is 2000x1000 now!
  }

  deepClean(obj) {
    if (!obj) return;
    Object.keys(obj).forEach((k) => {
      if (obj[k] && obj[k].destroy) {
        if (typeof obj.destroy === 'function') { obj.destroy(true); }
      }
      delete obj[k];
    });
  }

  cleanUpPoolGame() {
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
    // // delete this.gameSetup.exitTestScreen;
    delete window.handleNewRobotCodeChange;
    // delete window.TWEEN;
    // // delete window.eslint;
    delete window.Howl;
    delete window.HowlerGlobal;
    delete window.Howler;
    // delete window.p2;
    delete window.testCondition;
    delete window.testResult;
    // delete window.testGameComponent;
  }


  handleResize() {
    if (!this.gameCanvas) return;
    const w2 = $(this.gameCanvas).parent().width();
    const h2 = $(this.gameCanvas).parent().height();

    // console.log("window resize new w2 h2 " + w2 + " " + h2);
    // this.renderer.resize(w2, h2); // trigger a resize of parent's parent
  }

  createCanvas() {
    const {
      scenario, isReplay, isTesting, activeGame, room, config, isProfessionalUser, reacthistory, isFactory
    } = this.props;
    const myUser = Meteor.user();
    const that = this;

    let diff = 0;


    const Howler = require('howler');
    window.Howl = Howler.Howl;
    window.Victor = Victor;

    const gameSetup = {
      winners: [],
      peerReady: false,
      isOver: false
    };
    gameSetup.scenario = scenario;

    const userId = Meteor.userId();

    if (0) {
      
    } else if (1) {
      gameSetup.gameType = GAME_TYPE.TESTING;
      if (scenario) {
        if (scenario.package === "intermediate" || scenario.isUserTest) diff = 1;
      }

      if (isFactory) diff = 1;
      gameSetup.difficulty = diff;

      const playerInfo1 = {
        ID: 0,
        ready: true,
        localInput: true,
        playerID: myUser.username,
        playerRating: 500,
        playerType: 'AI',
        playerUserId: userId,
        PlayerCode: ""
      };
      const playerInfo2 = {
        ID: 1,
        ready: true,
        localInput: true,
        playerID: myUser.username,
        playerRating: 500,
        playerType: 'AI',
        playerUserId: userId,
        PlayerCode: ""
      };
      gameSetup.playerInfo = [playerInfo1, playerInfo2];
      gameSetup.roomId = "TestingRoom";
      gameSetup.isHost = true;
      gameSetup.isLocal = true;
    }

    gameSetup.isProfessionalUser = isProfessionalUser; // isProfessionalUser;

    gameSetup.history = history;
    gameSetup.playerCount = 1;
    gameSetup.room = room;

    this.gameSetup = gameSetup;
    this.gameSetup.inStrikeAnimation = false;

    window.testGameComponent = this;

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
          if (lines[k].indexOf("//") < 0) { return c3; }
          if (lines[k].indexOf("ReportEndOfTest") < lines[k].indexOf("//")) {
            return c3;
          }
        }
      }
      return c3;
    };

    gameSetup.onNewTestRun = function(setupCode, robotCode) {
      // console.log("onNewTestRun: to call old setup code!!!! " + oldSetupCode);
      Meteor.setTimeout(() => {
        if (!gameSetup.controller) return;
        gameSetup.inNewTest = true;
        gameSetup.controller.setRobotCode(robotCode);
        let setup = setupCode;
        setup = setup + "\n\nReportEndOfTest();";

        setup = getSetupCodeBeforeEnd(setup);

        gameSetup.controller.createAIPlayers(setup, true);
        gameSetup.testSetupCode = setup; // used to resetup table after all stop!
        gameSetup.paused = false;
        gameSetup.gameOver = false;
        gameSetup.lc = that.lc;
      }, 5);
    };

    if (scenario && scenario.SetupScript) {
      gameSetup.testSetupCode = scenario.SetupScript; // used to resetup table after all stop!
      // console.log("setting 2 gameSetup.testSetupCode to " + gameSetup.testSetupCode);
    }

    window.gameSetup = gameSetup; // pointer to be used by codemirror and chat components
    // gameSetup.setupGame(room);
    // console.log('gameSetup', gameSetup);
    const gameObj = new AlgorithmSetup(gameSetup);
    // console.log("gameObj.setupGameRoom");
    gameObj.setupGameRoom();
  }

  hideChartDiv() {
    $("#chartcontainer").hide();
  }

  /**
   * Simply render the div that will contain the Pixi Renderer.
   */
  render() {
    const component = this;
    return (
      <div className="gameWrapper" style={{ height: '100%', width: '100%', position: 'relative', display: 'block', border: '1px solid #383737', 'flex': 1, 'flexDirection': 'column', backgroundColor: "#310d54" }}>
        {/* <div style={{ position: 'relative', height: '100%' }} ref={(thisDiv) => { component.gameCanvas = thisDiv; }} /> */}
        <iframe id="canvasIFrame" style={{width: '100%', height: '100%'}} src={"/canvasjs/canvasmain.html"}/>        
        {/* <Script
                url="/canvasjs/literallycanvas.js"
                onError={() => { this.handleScriptError(); }}
                onLoad={() => { this.handleScriptLoad(); }}
              />         */}
      </div>

    );
  }
}

export default AlgorithmComponent;
