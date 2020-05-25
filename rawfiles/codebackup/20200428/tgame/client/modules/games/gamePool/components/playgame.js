import React from 'react';
// import { withRouter } from 'react-router';
import NavigationPrompt from 'react-router-navigation-prompt';
import Match3Component from '../lib/Match3Component';
import { Prompt } from 'react-router';
import { Bert } from 'meteor/themeteorchef:bert';
import Modal from 'react-modal';
import Victor from 'victor';
import { debug } from 'util';
import PoolComponent from '../lib/TrajectoryPoolComponent.jsx';
import TankWarComponent from '../lib/TankWarComponent.jsx';
import { MIGRATION_CONST } from '../../../../../lib/enum';
import Banner from '../../../core/components/Banner.jsx';
import gameModal from './gamemodal.js';
import { GAME_TYPE } from '../../../../../lib/enum';



// for coding for now, just put it in local so only client updates; once done, put it back to the package to share within
// the full web app

const LEVEL_NUMBER = {
  Beginner: 0,
  Advanced: 1
  // Professional: 1
};

const dummyfunc = function (event) { event.stopPropagation(); };
// let showExitGameModal = false;

class PlayGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showExitGameModal: false
    };
  }

  componentDidMount() {
    const {
      setGameRoomNetwork, config, room, history, reportEnteringGameRoom, addPhaserIlluminated, leavingRoom, markUserAsLeavingRoom, unmarkUserAsLeavingRoom
    } = this.props;

    // window.addEventListener('unload', dummyfunc, true);

    if (room.gameType !== GAME_TYPE.TOURNAMENT && room.gameType !== GAME_TYPE.AUTORUN && room.gameType !== GAME_TYPE.BATTLE) {
      setGameRoomNetwork(room.gameRoomId);
    }
    window.myunloadhandler = (e) => {
      // debugger;
      // const mainDiv = document.getElementById("mainDiv");
      // mainDiv.style.position = "relative";
      console.log(`myunloadhandler called  ${e.type}`);
      // window.removeEventListener('unload', window.myunloadhandler);
      // document.removeEventListener("visibilitychange", window.myunloadhandler);
      // window.onpagehide = null;
      // debugger;
      // leavingRoom(config.roomId);
      // setTimeout(() => {
      //   setTimeout(() => {
      //       //$(document.body).css('background-color', 'red');
      //       console.log("user cancelled reload!!");
      //       unmarkUserAsLeavingRoom(config.roomId, localPlayerID);
      //   }, 500);
      // }, 1);

      if (window.gameSetup && window.gameSetup.exitBtnHandler) {
        window.gameSetup.exitBtnHandler();
      }





      // if (window.gameSetup)
      //   markUserAsLeavingRoom(config.roomId, window.gameSetup.localPlayerID);
      // // e.returnValue = 'ok shouldn not be here? You will lose the game if you exit the page. Are you sure?';

      // // window.addEventListener('unload', dummyfunc, true);
      // // document.addEventListener('visibilitychange', dummyfunc, true);
      // // return 'ok You will lose the game if you exit the page. Are you sure?';
      // // return window.undefined;
      // // debugger;
      // console.log(`push gamesBoard from window on unload`);
      // history.push("/gamesBoard");
      // window.onunload = null;
      // // return e.returnValue = 'ok ok';
      // return null;
    };
    // window.removeEventListener('unload', dummyfunc);
    // document.removeEventListener('visibilitychange', dummyfunc);
    // window.addEventListener('unload', window.myunloadhandler);
    window.onunload = window.myunloadhandler;
    // document.addEventListener("visibilitychange", window.myunloadhandler);
    // window.onpagehide = window.myunloadhandler;




    window.myhandleVisibilityChange = () => {
      if (document.hidden) {
        // the page is hidden
        // // this will be called anyway in Prompt!
        // // markUserAsLeavingRoom(config.roomId, window.gameSetup.localPlayerID);
        // console.log(`window.myhandleVisibilityChange!`);
        // history.push("/gamesBoard");
        document.removeEventListener("visibilitychange", window.myhandleVisibilityChange);
        if (window.gameSetup && window.gameSetup.gameType != GAME_TYPE.PRACTICE && window.gameSetup.gameType != GAME_TYPE.AUTORUN) {
          window.gameSetup.exitBtnHandler();
        }
      } else {
        // the page is visible
        console.log(`page is visible`);
      }
    };
    document.addEventListener("visibilitychange", window.myhandleVisibilityChange, false);


    // this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);

    // this.unblock = this.props.history.block((nextLocation)=>{
    //   if (this.props.dirty) {
    //       this.setState({
    //           showExitGameModal: true,
    //           nextLocation: nextLocation
    //       });
    //   }
    //   return !this.props.dirty;
    // });



    // let gameName = "PathPool";
    // if (room.gameId == "z7Zw82CrjYW2ZJWZZ") {
    //   gameName = "CarDodgeBall";
    // }

    // // const playerInfo1 = config.playerInfo1;
    // // const playerInfo2 = config.playerInfo2;
    // window.Bert = Bert;
    // global.Bert = Bert;
    // // global.PIXI = PIXI();
    // window.Victor = Victor;
    // global.Victor = Victor;
    // // window.p2 = p2;
    // // global.p2 = p2;
    // window.gameModal = gameModal;
    // global.gameModal = gameModal;

    // const w = window.innerWidth * window.devicePixelRatio;
    // // aaaa this is how to shrink the height?
    // const h = window.innerHeight * window.devicePixelRatio * 0.86;

    // if (gameName == "PathPoolOld") {
    //   window.PIXI = require('phaser/build/custom/pixi');
    //   // window.PIXI = global.PIXI;
    //   window.p2 = require('phaser/build/custom/p2');
    //   const Phaser = require('phaser');
    //   global.Phaser = Phaser;

    //   // get dimensions of the window considering retina displays
    //   // simply pass them in
    //   // for landscape mode always pass in the bigger side of the device as width
    //   const cfg = {
    //     p2: true,
    //     mpx (v) { return v; },
    //     pxm (v) { return v; },
    //     mpxi (v) { return -v; },
    //     pxmi (v) { return -v; }
    //   };

    //   // setup world content window so that all content are drawn relative within this window
    //   let windoww = (h > w) ? h : w,
    //       windowh = (h > w) ? w : h;
    //   const aspectratio = 16 / 9;
    //   if (windoww > windowh * aspectratio) {
    //     windoww = windowh * aspectratio;
    //   } else {
    //     windowh = windoww / aspectratio;
    //   }

    //   // for ios browser, this -200 is needed because of the bar on top. not sure about cordova on ios. need mac book
    //   // var gameSetup = new Phaser.Game((h > w) ? h : w, -200 + ((h > w) ? w : h), Phaser.CANVAS, 'gameDiv', null, false, true, cfg);
    //   // debugger;
    //   const gameSetup = new Phaser.Game((h > w) ? h : w, ((h > w) ? w : h), Phaser.CANVAS, 'gameDiv', null, false, true, cfg);
    //   // gameSetup.config.forceSetTimeOut = true;

    //   gameSetup.gameType = room.gameType; // or match
    //   gameSetup.difficulty = LEVEL_NUMBER[room.difficulty];
    //   gameSetup.playerInfo = room.playerInfo;
    //   gameSetup.roomId = config.roomId;
    //   gameSetup.pairData = config.pairData;
    //   gameSetup.room = room;
    //   gameSetup.history = history;

    //   addPhaserIlluminated(Phaser, gameSetup);

    //   const PoolLib = require('../lib/localpool8ball2dworld.js');
    //   const Pool = PoolLib.default;
    //   gameSetup.state.add('Boot', Pool.Boot);
    //   gameSetup.state.add('Preloader', Pool.Preloader);
    //   gameSetup.state.add('MainMenu', Pool.MainMenu);
    //   gameSetup.state.add('Game', Pool.Game);

    //   gameSetup.state.start('Boot');
    //   this.gameSetup = gameSetup;
    // } else if (gameName == "PathPool") {
    //   if (!window.PIXI) window.PIXI = require('pixi.js');
    //   // window.PIXI = global.PIXI;
    //   if (!window.p2) window.p2 = require('p2');
    //   if (!window.Howl) {
    //     const Howler = require('howler');
    //     window.Howl = Howler.Howl;
    //   }
    //   if (!window.TWEEN)
    //     window.TWEEN = require('./Tween.min.js');

    //   const PathPoolGameSetupLib = require('../lib/luckypoolgamesetup.js');
    //   const PathPoolGameSetup = PathPoolGameSetupLib.default;
    //   const gameSetup = new PathPoolGameSetup();

    //   gameSetup.gameType = room.gameType; // or match
    //   gameSetup.difficulty = LEVEL_NUMBER[room.difficulty];
    //   gameSetup.playerInfo = room.playerInfo;
    //   gameSetup.roomId = config.roomId;
    //   gameSetup.history = history;
    //   gameSetup.playerCount = room.playerInfo.length;

    //   // whoever is the first in the playerInfo list is the game host, though
    //   // it doesn't mean he takes the break. Just means he has to decide who
    //   // has the token to take the break
    //   gameSetup.isHost = room.playerInfo[0].userId == Meteor.userId();
    //   if (room.playerInfo[0].userId == Meteor.userId()) {
    //     gameSetup.localPlayerID = 0;
    //   } else {
    //     gameSetup.localPlayerID = 1;
    //   }
    //   gameSetup.setupGame(room);
    //   this.gameSetup = gameSetup;
    // } else if (gameName == "CarDodgeBall") {
    //   global.PIXI = require('pixi.js');
    //   window.PIXI = global.PIXI;

    //   const THREE = require('three');
    //   global.THREE = THREE;
    //   window.THREE = THREE;

    //   // hack: manually copied latest ammo.js files from ammo js github page, and add this line at bottom:
    //   // module.exports = Ammo();
    //   // didn't need to change idl file at all!
    //   // debugger;
    //   const Ammo = require('ammonext');
    //   global.Ammo = Ammo;
    //   window.Ammo = Ammo;

    //   const DodgeBallGameSetupLib = require('../lib/dodgeballgamesetup.js');
    //   const DodgeBallGameSetup = DodgeBallGameSetupLib.default;
    //   const gameSetup = new DodgeBallGameSetup();

    //   gameSetup.gameType = room.gameType; // or match
    //   gameSetup.difficulty = LEVEL_NUMBER[room.difficulty];
    //   gameSetup.playerInfo = room.playerInfo;
    //   gameSetup.roomId = config.roomId;
    //   // gameSetup.pairData = config.pairData;
    //   // gameSetup.room = room;
    //   gameSetup.history = history;
    //   gameSetup.playerCount = room.playerInfo.length;

    //   gameSetup.isHost = room.playerInfo[0].userId == Meteor.userId();
    //   gameSetup.isHost = room.playerInfo[0].userId == Meteor.userId();
    //   if (room.playerInfo[0].userId == Meteor.userId()) {
    //     gameSetup.localPlayerID = 0;
    //   } else {
    //     gameSetup.localPlayerID = 1;
    //   }

    //   gameSetup.setupGame(room);
    //   this.gameSetup = gameSetup;

    //   window.showExitGameModal = () => {
    //     // debugger;
    //     this.setState({ showExitGameModal: true });
    //     // showExitGameModal = true;
    //   };
    // }

    // const localPlayerID =  this.gameSetup.localPlayerID;

    // if (room.gameType == GAME_TYPE.PRACTICE) {
    //   // no need to warn about exit
    // } else {
    //   window.beforeunloadhandlernotused = (e) => {
    //     // debugger;
    //     // const mainDiv = document.getElementById("mainDiv");
    //     // mainDiv.style.position = "relative";
    //     console.log("window.onbeforeunload called 12");
    //     // leavingRoom(config.roomId);


    //     setTimeout(() => {
    //       setTimeout(() => {
    //           //$(document.body).css('background-color', 'red');
    //           console.log("user cancelled reload!!");
    //           unmarkUserAsLeavingRoom(config.roomId, localPlayerID);
    //       }, 500);
    //     }, 1);

    //     markUserAsLeavingRoom(config.roomId, localPlayerID);
    //     e.returnValue = 'shouldn not be here? You will lose the game if you exit the page. Are you sure?';

    //     return 'You will lose the game if you exit the page. Are you sure?';
    //   };
    // }

    // // window.addEventListener('beforeunload', window.beforeunloadhandler);

    // window.unloadhandler = function (event) {
    //   history.push('/gamesBoard');
    //   // const mainDiv = document.getElementById("mainDiv");
    //   // mainDiv.style.position = "relative";
    //   // console.log("actually unload! " + config.roomId);
    //   // leavingRoom(config.roomId);
    // };
    // window.addEventListener('unload', window.unloadhandler);


    // reportEnteringGameRoom(config.roomId, this.gameSetup.localPlayerID);
  }

  componentDidUpdate(prevProps) {
    const { room } = this.props;

    // let gameName = "PathPool";
    // if (room.gameId == "z7Zw82CrjYW2ZJWZZ") {
    //   gameName = "CarDodgeBall";
    // }


    if (room.gameType === GAME_TYPE.PRACTICE || room.gameType === GAME_TYPE.TESTING || room.gameType === GAME_TYPE.AUTORUN || room.gameType === GAME_TYPE.BATTLE) {
      // ignore all updaets!
      // console.log("ignore all updates " + room.gameType);
    } else {
      if (window.gameSetup && window.gameSetup.gameOver) {
        // console.log("playgame update game over " + window.gameSetup.gameOver);
        // return;
      }
      // console.log("playgame update 2 ");
      if (window.gameSetup && window.gameSetup.handleRoomUpdate) {
        // console.log("playgame update 3 " );
        window.gameSetup.handleRoomUpdate(room);
        return;
      }
      // console.log("call tryToHandleRoomUpdate need to continue peer setup for networked game!");
      // const tryToHandleRoomUpdate = () => {
      //   if (window.gameSetup && window.gameSetup.handleRoomUpdate) {
      //     console.log("playgame update 4 " );
      //     window.gameSetup.handleRoomUpdate(room);
      //   } else {
      //     setTimeout(tryToHandleRoomUpdate, 1000);
      //   }
      // };
      // tryToHandleRoomUpdate();
    }
    return;

    if (gameName == "CarDodgeBall") {
      if (this.gameSetup) {
        console.log("component did update!");
        // this.gameSetup.updateWithNewData(room);
      }
    } else {
      if (this.gameType == GAME_TYPE.PRACTICE || this.gameType == GAME_TYPE.TESTING) {
      } else {
        console.log("need to continue peer setup for networked game!");
        this.gameSetup.setupGame(room);
      }

      // if (room && room.lastInd < 0) {
      //   if (this.gameSetup && this.gameSetup.updateWithNewData) {
      //     this.gameSetup.updateWithNewData(room);
      //   }
      // } else if (room && prevProps.room.lastInd !== room.lastInd) {
      //   if (this.gameSetup && this.gameSetup.updateWithNewData) {
      //     this.gameSetup.updateWithNewData(room);
      //   }
      // }
    }
  }

  // routerWillLeave(nextLocation) {
  //   debugger;
  //   if (!this.gameSetup.gameOver) {
  //     this.gameSetup.confirmQuit();
  //     return 'are you sure??';
  //   }
  //   return null;
  // }

  cleanTankGame() {
    delete window.robotCodeEditor;
    delete window.handleNewRobotCodeChange;
    delete window.TWEEN;
    // delete window.eslint;
    // delete window.Howl;
    // delete window.HowlerGlobal;
    // delete window.Howler;
    delete window.PIXI;
    delete window.testCondition;
    delete window.testResult;
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
    delete window.Victor;
    delete window.robotCodeEditor;
    // delete this.gameSetup.exitTestScreen;
    delete window.handleNewRobotCodeChange;
    delete window.TWEEN;
    // delete window.eslint;
    delete window.Howl;
    delete window.HowlerGlobal;
    delete window.Howler;
    delete window.PIXI;
    delete window.p2;
    delete window.testCondition;
    delete window.testResult;
  }


  componentWillUnmount() {
    const {
      config, markUserAsLeavingRoom, leavingRoom, room
    } = this.props;
    // debugger;

    const mainDiv = document.getElementById("mainDiv");
    // mainDiv.style.position = "relative";
    // delete window.onbeforeunload;
    // debugger;
    // window.removeEventListener('beforeunload', window.myunloadhandler);
    // document.removeEventListener("visibilitychange", window.myunloadhandler);
    console.log("playgame.js will unmount ");
    if (window.gameSetup && window.gameSetup.exitBtnHandler) {
      window.gameSetup.exitBtnHandler();
    }
    markUserAsLeavingRoom(config.roomId, window.gameSetup.localPlayerID);
    window.ununload = null;
    delete window.myunloadhandler;
    // window.removeEventListener('unload', window.unloadhandler);

    // console.log("will unmount called 1");

    // leavingRoom(config.roomId, this.gameSetup.localPlayerID);
    if (window.gameSetup) {
      if (window.gameSetup.cleanUpAll) { window.gameSetup.cleanUpAll(); }

      if (window.gameSetup.gameObj) { this.deepClean(window.gameSetup.gameObj); }
      this.deepClean(window.gameSetup);
      delete window.gameSetup;
    }

    if (room.gameId == MIGRATION_CONST.tankGameId) {
      this.cleanTankGame();
    }
    if (room.gameId == MIGRATION_CONST.poolGameId) {
      this.cleanUpPoolGame();
    }
    // this.unblock();
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

  toggleExitGameModal() {
    // debugger;
    this.setState({ showExitGameModal: !this.state.showExitGameModal });
    // showExitGameModal = !showExitGameModal;
  }


  render() {
    // const {playerType1, playerType2} = this.props;
    const {
      markUserAsLeavingRoom, config, history, room
    } = this.props;
    const { showExitGameModal } = this.state;
    if (config.isGameOver || room.gameEnded) {
      // window.alert("game is over!");
      // history.push('/');
      // return (<div />);
    }

    const mainDiv = document.getElementById("mainDiv");
    // mainDiv.style.position = "absolute";

    let gameOver = false;
    if (window.gameSetup) { gameOver = window.gameSetup.gameOver || room.gameEnded; }

    // const isActive = true;

    if (room.gameId == MIGRATION_CONST.tankGameId) {
      return (
        <div
          className="tg-page"
          style={{
            margin: '0px', position: 'fixed', minHeight: '100%', minWidth: '100%', top: '0', left: '0', zIndex: '300'
          }}
        >
          <div className="tg-page__content tg-container tg-page__content--playgame">
            <TankWarComponent isTesting={false} room={room} config={config} reacthistory={history} />
          </div>
          <div id="orientation" />
        </div>
      );
    }

    if (room.gameId == MIGRATION_CONST.match3GameId) {
      return (
        <div className="tg-page" style={{ margin: '0px', position: 'fixed', minHeight: '100%', minWidth: '100%', top:   '0', left: '0', 'zIndex': '300' }}>
          <div className="tg-page__content tg-container tg-page__content--playgame">
            <Match3Component isTesting={false} room={room} config={config} reacthistory={history} />
          </div>
          <div id="orientation" />
        </div>
      );
    }


    return (

      <div
        className="tg-page"
        style={{
          margin: '0px', position: 'fixed', minHeight: '100%', minWidth: '100%', top: '0', left: '0', zIndex: '300'
        }}
      >
        {/* <Banner title="Play Game" /> */}
        <div className="tg-page__content tg-container tg-page__content--playgame">
          <PoolComponent isTesting={false} room={room} config={config} reacthistory={history} />
        </div>
        <div id="orientation" />
        {/*
        <NavigationPrompt
          // beforeConfirm={this.cleanup}
          // Children will be rendered even if props.when is falsey and isActive is false:
          // renderIfNotActive={true}
          // Confirm navigation if going to a path that does not start with current path:
          // when={(crntLocation, nextLocation) => !nextLocation.pathname.startsWith(crntLocation.pathname)}
          when={true}
        >
          {({ isActive }) => {
            if (isActive) {
              showExitGameModal = true;
              return (
                <Modal
                  isOpen={showExitGameModal}
                  className="ExitGameModel"
                  contentLabel="Do you want to exit the current game?"
                  onRequestClose={() => this.toggleExitGameModal()}
                >
                  <div>
                    <h3 className="MessageHeader">Exit the current game?</h3>
                    <button type="button" className="ConfirmExitButton admin-btn admin-btn--primary" onClick={gameSetup.exitGame}>
                      Confirm Exit
                    </button>
                    <button type="button" className="ReturnToGameButton admin-btn admin-btn--primary" onClick={this.toggleExitGameModal}>
                      Return to Game
                    </button>
                  </div>
                </Modal>
              );
              // return;
            }
            return (
              <div>This is probably an anti-pattern but ya know...</div>
            );
          }}
        </NavigationPrompt> */}


        {/* <Prompt
          when={this.gameSetup && !this.gameSetup.gameOver}
          message="You will lose the game if you exit the page now! Can you confirm?"
        /> */}

        {/* <Prompt message={(location) => {
          // debugger;
          if (window.gameSetup && !window.gameSetup.gameOver && window.gameSetup.gameType != GAME_TYPE.PRACTICE && window.gameSetup.showExitWarning) {
            // window.gameSetup.showExitWarning();


            console.log(`call markUserAsLeavingRoom in Prompt`);
            markUserAsLeavingRoom(config.roomId, window.gameSetup.localPlayerID);
            history.push("/gamesBoard");
            document.removeEventListener("visibilitychange", window.myhandleVisibilityChange);

            return false;
          } else {
            return true;
          }
          // this.gameSetup && !this.gameSetup.gameOver ? "You will lose the game if you exit the page now! Can you confirm?": true
         }} /> */}

        {/* <Modal
          isOpen={showExitGameModal}
          className="ExitGameModel"
          contentLabel="Do you want to exit the current game?"
          onRequestClose={() => this.toggleExitGameModal()}
        >
          <div>
            <h3 className="MessageHeader">Exit the current game?</h3>
            <button type="button" className="ConfirmExitButton admin-btn admin-btn--primary" onClick={gameSetup.exitGame}>
              Confirm Exit
            </button>
            <button type="button" className="ReturnToGameButton admin-btn admin-btn--primary" onClick={this.toggleExitGameModal}>
              Return to Game
            </button>
          </div>
        </Modal> */}
      </div>

    );
  }
}

export default PlayGame;
