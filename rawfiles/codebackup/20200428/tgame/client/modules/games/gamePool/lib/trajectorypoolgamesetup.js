
import { GAME_TYPE, PLAYER_TYPE } from '../../../../../lib/enum';
import { Meteor } from 'meteor/meteor';

import TrajectoryPool from './trajectorypoolgame.js';

// const BEGINNER = 0;
// // const ADVANCED = 1;
// const PROFESSIONAL = 1;


// const WorldForPlayer = {};



function TrajectoryPoolSetup() {
    this.peers = {};

    this.setupGame = (room) => {
      if (1) return;

      if (this.allPeers) {
        let allready = true;
        for (let i=1; i<this.playerInfo.length; i++) {
            const p = this.allPeers[i];
            if (!p.peerReady) {
                allready = false;
                break;
            }
        }
        if (allready) {
          console.log("all peers ready for host to create pool game");
          // this.handleRoomUpdate(room);
          // return;
        }
      }



        // const room = this.room;
        this.room = room;



        if (this.gameType == GAME_TYPE.PRACTICE || this.gameType == GAME_TYPE.TESTING) {
            // local game with all players on local host
            // so no need for p2p network. 
            // all inputs (robot or manual) are sent to the network handler, which execute them locally
            // no need to send anthing out to network
            this.isLocal = true;
            this.createPoolGame();
            this.playerID = 0;
        } else {
            // networked game. need to setup p2p link between host and each other player
            this.isLocal = false;
            if (!this.allPeers)
              this.allPeers = {};
            
            this.setupPeers();
        }
    };

    this.setupPeers = () => {
        if (this.isHost) {
          // one peer connection to each other player
          this.playerID = 0;
          for (let i=1; i<this.playerInfo.length; i++) {
              this.setupOnePeer(i, true); // as host = true
          }
        } else {
          //TODO won't work if 3 players all of same userId!!
          for (let i=1; i<this.playerInfo.length; i++) {
              if (this.playerInfo[i].userId == Meteor.userId()) {
                  this.playerID = i;
                  this.setupOnePeer(i, false); // as host = false
                  break;
              }
          }
        }
    };

    this.setupWTCServer = (id) => {
        const room = this.room;
    
        const buffer = require('buffer');
        window.Buffer = buffer.Buffer;
        global.Buffer = buffer.Buffer;
        const Peer = require('simple-peer');
        const p = new Peer({ initiator: true, trickle: false });
    
        p.on('signal', function (data) {
          console.log(`--- HOST 1 --- initial signal call for ${id} saveInitSignalOffer ${JSON.stringify(data)}`);
          //HOST_1
          // debugger;
          Meteor.call('saveInitSignalOffer', room._id, id, JSON.stringify(data));
          p.offerSaved = true;
        });
        return p;
    };

    this.connectToWTCServer = (id) => {
        // const {lobbyInd, lobbys, playerID} = this.props;
        //const game = this.game;
        //const config = game.config;
        // const that = this;
        const room = this.room;
        console.log('in setup of connectToWTCServer ' + Date.now());
        const offerKey = `offer${id}`;
        const answerKey = `anwser${id}`;
        console.log("offerKey " + offerKey + " answerkey " + answerKey + " " + room[offerKey]);
        if (typeof(room[offerKey]) == "undefined") return null;
        console.log('in setup of connectToWTCServer 2 ' + Date.now());
        if (typeof(room["answer" + id]) == "undefined") return null;
        console.log('in setup of connectToWTCServer 3 ' + Date.now());
        console.log("room[answerKey] " + room[answerKey]);
        console.log("room['answer1'] " + room["answer1"]);
        if (room["answer" + id] !== "newoffer") return null;
        console.log('in connectToWTCServer 4 ' + Date.now());
        
        const buffer = require('buffer');
        window.Buffer = buffer.Buffer;
        global.Buffer = buffer.Buffer;
        const Peer = require('simple-peer');
        const p = new Peer({ initiator: false, trickle: false });

        this.peer = null;
        // console.log("--- GUEST 1 --- to signal offer "  + Date.now());
        p.answer = "";
        //GUEST_1
        // debugger;
        try {
          p.signal(JSON.parse(room[offerKey]));
        } catch (err) {
          console.log(" guest signal error ");
        }

        p.on('signal', function (data) {
            // console.log('--- GUEST 2 --- answer SIGNAL', JSON.stringify(data));
        //GUEST_2
        // debugger;            
        //document.querySelector('#outgoing').textContent = JSON.stringify(data)
            Meteor.call('saveInitSignalAnswer', room._id, id, JSON.stringify(data));
        });
        return p;
    };


    this.setupOnePeer = (id, asHost) => {
        /**
         * how signalling works:
         * 1. initiator on start, will get a 'signal' -> save it to lobby as offer and set answer1 to "newoffer"
         * 2. joiner get the offer signal, call p.signal with it
         * 3. joiner get a 'signal' -> save it to lobby as answer
         * 4. initiator will read the answer signal, and call p.signal with it again
         * 5. joiner will get 'connect' this time. 
         */
        console.log("in setupOnePeer " + id + " " + asHost);
        const that = this;
        const room = this.room;
        let peer = this.allPeers[id];
        if (peer && peer != null) {
          if (this.isHost && peer.offerSaved) {
            // already have peer object but waiting for answer
            if (typeof(room[`answer${id}`]) != "undefined"  && room[`answer${id}`] != "" && room[`answer${id}`] != "newoffer") {
              //HOST_2
              // debugger;
              console.log("--- HOST 2 --- to signal answer " + room[`answer${id}`]);
              try {
                peer.signal(JSON.parse(room[`answer${id}`]));
              } catch (err) {
                console.log(" host signal error ");
              }
            }
          }
        } else {
          if (this.isHost) {
            this.allPeers[id] = this.setupWTCServer(id);
          } else {
            this.allPeers[id] = this.connectToWTCServer(id);
          }

          peer = this.allPeers[id];
    
          if (peer == null) return;
          peer.on('error', function (err) { console.log('peer error', err); });
    
          peer.on('connect', function () {
            //HOST_3 GUEST_3
            // debugger; 
              console.log('CONNECTED!!');
              // debugger;
              peer.peerSetup = true;
              //peer.send('whatever' + Math.random());
              // console.log("connected! send initial echo");
              //peer.send("echo_" + playerID+"_0-" + Date.now());
              peer.peerReady = true;
            //   const game = {};
            //   game.peer = peer;
            //   if (playerID == 0) {
            //     game.isHost = true;
            //   } else {
            //     game.isHost = false;
            //   }
            // debugger;
            if (!that.isHost)
              that.createPoolGame();
            else {
                let allready = true;
                for (let i=1; i<that.playerInfo.length; i++) {
                    const p = that.allPeers[i];
                    if (!p.peerReady) {
                        allready = false;
                        break;
                    }
                }
                if (allready) {
                  console.log("all peers ready for host to create pool game");
                  that.peerReady = true;
                  that.createPoolGame();
                }
            }
          });
    
          peer.on('data', function (data) {
            // console.log('got data: ' + data);
            data = `${data}`;
            if (data.indexOf("echo_") == 0) {
              // if (!that.peerReady) {
                // peer.send("echo_");
                // that.peerReady = true;
                // that.createPoolGame();
                // that.game.peer = peer;
              // }
            } else {
              console.log("processWTCData " + data);
              // console.log("test that.processWTCData " + that.processWTCData);
              // debugger;
              if (that.processWTCData)
                that.processWTCData(data);
            }
          });
    
          this.peer = peer;
        }
    };

    this.createPoolGame = () => {
        // global.PIXI = require('./pixi');
        //var audio = require('pixi-audio');
        // var howler = require('howler');
    
        // debugger;
        // const winW = document.body.offsetWidth;            
        // const winH = document.body.offsetHeight-4;
        // const gameDiv = document.getElementById('gameDiv');
        // var renderer = PIXI.autoDetectRenderer(winW, winH);
        // myView.appendChild(renderer.view);
        //document.body.appendChild(renderer.view);
        // var renderer = PIXI.autoDetectRenderer(800, 400, myView); 
    
        // winW = winW * 0.3;            
        // winH = winH * 0.35;
        // winW = winH;

        // const myView = document.createElement("DIV");   
        // gameDiv.appendChild(myView);
        // const pixirenderer = PIXI.autoDetectRenderer(winH * 0.35, winH * 0.35);
        // myView.appendChild(pixirenderer.view);
        
        // var myView2 = document.getElementById('statusboard');
        // var pixirenderer2 = PIXI.autoDetectRenderer(winH * 0.35, winH * 0.35);
        // myView2.appendChild(pixirenderer2.view);
        
    
        // window.game = this;
    
    
        this.winners = [];
        this.peerReady = true;
        this.isOver = false;
    
        this.gameObj = new TrajectoryPool(this);
        this.gameObj.startGame();
        // window.cargame = cargame;


    };
}

export default TrajectoryPoolSetup;
