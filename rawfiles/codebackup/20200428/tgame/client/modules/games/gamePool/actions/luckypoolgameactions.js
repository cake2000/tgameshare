import { debug } from "util";

export default {
  setGameRoomNetwork({ Meteor }, gameRoomId) {
    if (!gameRoomId) {
      debugger;
    }
    
    Meteor.call('gameRoom.setGameRoomNetwork', gameRoomId, (err) => {
      if (err) {
        console.log('error in setGameRoomNetWork');
      }
    });
  },

  reportNewGameMove({ Meteor }, gameRoomId,
    playerUserId, forcex, forcey, avx, avy, targetPocketID, targetBallID) {
    Meteor.call('reportNewGameMove', gameRoomId, playerUserId, forcex, forcey, avx, avy, targetPocketID, targetBallID, (err) => {
      if (err) {
        console.log('error in reportNewGameMove ');
      }
    });
  },
  reportPlaceCueBallMove({ Meteor }, gameRoomId, playerUserId, newx, newy) {
    Meteor.call('reportPlaceCueBallMove', gameRoomId, playerUserId, newx, newy, (err) => {
      if (err) {
        console.log('error in reportPlaceCueBallMove ');
      }
    });
  },

  reportQuitGame({ Meteor }, gameRoomId) {
    Meteor.call('reportQuitGame', gameRoomId, (err) => {
      if (err) {
        console.log('error in reportQuitGame ');
      }
    });
  },
  leavingGame({ Meteor }, gameRoomId) {
    // debugger;
    console.log("leaving room 2");
    Meteor.call('leavingGame', gameRoomId, (err) => {
      if (err) {
        console.log('error in leavingGame ');
      }
    });
  },

  saveBallPosSnapshot({ Meteor }, gameRoomId, ballposlist) {
    Meteor.call('saveBallPosSnapshot', gameRoomId, ballposlist, (err) => {
      if (err) {
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      }
    });
  },

  reportGameResult({ Meteor }, gameRoomId, winnerPlayerUserId, player0Gold, player1Gold) {
    Meteor.call('recordGameResult', gameRoomId, winnerPlayerUserId, player0Gold, player1Gold, (err) => {
      if (err) {
        console.log('error in reportNewGameMove ');
      }
    });
  },

  reportEnteringGameRoom({ Meteor }, gameRoomId, playerID) {
    Meteor.call('reportEnteringGameRoom', gameRoomId, playerID, (err) => {
      if (err) {
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {

      }
    });
  },

  markUserAsLeavingRoom({ Meteor }, gameRoomId, playerID) {
    // console.log("markUserAsLeavingRoom room " + gameRoomId + " " + playerID);
    Meteor.call('markUserAsLeavingRoom', gameRoomId, playerID, (err, roomId) => {
      if (err) {
        console.log("error when mark user leaving game " + gameRoomId + " " + err);
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {
        // console.log("success when mark user leaving game " + gameRoomId);
      }
    });
  },

  unmarkUserAsLeavingRoom({ Meteor }, gameRoomId, playerID) {
    // console.log("unmarkUserAsLeavingRoom room " + gameRoomId + " " + playerID);
    Meteor.call('unmarkUserAsLeavingRoom', gameRoomId, playerID, (err, roomId) => {
      if (err) {
        console.log("error when unmark user leaving game " + gameRoomId + " " + err);
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {
        // console.log("success when unmark user leaving game " + gameRoomId + " " + err);
      }
    });
  },



  leavingRoom({ Meteor }, gameRoomId, playerID) {
    console.log("leaving room 1 " + gameRoomId + " " + playerID);
    Meteor.call('leavingGame', gameRoomId, playerID, (err, roomId) => {
      if (err) {
        console.log("error when leaving game " + gameRoomId + " " + err);
        // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {
        // console.log("success when leaving game " + gameRoomId + " " + err);
      }
    });
  },

  addPhaserIlluminated({ Meteor }, Phaser, game) {
    Phaser.Plugin.PhaserIlluminated = function(game) {
      this._game = game;
      this._construct();
    };


    Phaser.Plugin.PhaserIlluminated.prototype = Object.create(Phaser.Plugin.prototype);
    Phaser.Plugin.PhaserIlluminated.prototype.constructor = Phaser.Plugin.Webcam;
    Phaser.Plugin.PhaserIlluminated.prototype._construct = function() {
          // these guys function as sprites
      this._game.add.illuminated = {};
      this._game.add.illuminated.lamp = this._createLamp;
      this._game.add.illuminated.darkMask = this._createDarkMask;

          // these guys function as their regular illuminated.js counterparts
      this._game.add.illuminated.rectangleObject = this._createRectangleObject;
      this._game.add.illuminated.discObject = this._createDiscObject;
      this._game.add.illuminated.lineObject = this._createLineObject;
      this._game.add.illuminated.polygonObject = this._createPolygonObject;

          // this is a bit hacky but the add calls are from the scope of the illuminated object, so we put needed
          // variables here
      this._game.add.illuminated._illuminatedSprites = [];
      this._game.add.illuminated._opaqueObjects = [];
      this._game.add.illuminated._game = this._game;

          // override this to respect the sprite offset
      illuminated.Lamp.prototype.mask = function (ctx) {
        const c = this._getVisibleMaskCache();
        const orientationCenter = new illuminated.Vec2(Math.cos(this.angle), -Math.sin(this.angle)).mul(this.roughness * this.distance);
        ctx.drawImage(c.canvas, this.offset.x + Math.round(this.position.x + orientationCenter.x - c.w / 2), this.offset.y + Math.round(this.position.y + orientationCenter.y - c.h / 2));
      };
    };

    Phaser.Plugin.PhaserIlluminated.prototype._createLamp = function(x, y, config) {
      if (!config) {
        config = {};
      }

          // distance is the actual distance the light travels
      let distance;
      if (!config.distance) {
        distance = 200;
      } else {
        distance = config.distance;
      }

      if (!x) {
        x = 0;
      }

      if (!y) {
        y = 0;
      }

      config.distance = distance;
      config.position = new illuminated.Vec2(config.centerX, config.centerY);
          // config.position = new illuminated.Vec2(0, 0);


          // var bmd = game.add.bitmapData(distance*2, distance*2);
      const bmd = game.add.bitmapData(config.width, config.height);
      game.cache.addBitmapData(`illuminated-lamp-${this._illuminatedSprites.length}`, bmd);
      const lamp = new illuminated.Lamp(config);
      lamp.offset = {};
          // var sprite = game.add.sprite(config.centerX - config.width/2, config.centerY - config.height/2, bmd);
      const sprite = game.add.sprite(0, 0, bmd);
      sprite.bmdIndex = `illuminated-lamp-${this._illuminatedSprites.length}`;
      sprite.bmd = bmd;
      sprite.lamp = lamp;

          // update the bmd and update the position of the lamp for masking and lighting purposes
      sprite.refresh = function() {
        this.bmd.ctx.clearRect(0, 0, this.bmd.width, this.bmd.height);

        if (this.lighting) {
                  // render solid objects relative to position of sprites
          this.lighting.objects.forEach(function(o) {
            if (o.topleft && o.bottomright) { // rect obj
              o.topleft.x = o.originalX - this.x;
              o.topleft.y = o.originalY - this.y;
              o.bottomright.x = o.originalX + o.originalW - this.x;
              o.bottomright.y = o.originalY + o.originalH - this.y;
              o.syncFromTopleftBottomright();
            } else if (o.radius) { // disc obj
              o.center.x = o.originalX - this.x;
              o.center.y = o.originalY - this.y;
            } else if (o.a && o.b) { // line obj
              o.a.x = o.originalStartX - this.x;
              o.a.y = o.originalStartY - this.y;
              o.b.x = o.originalEndX - this.x;
              o.b.y = o.originalEndY - this.y;
            } else if (o.points) { // polygon
              o.points.forEach(function(point, index) {
                point.x = o.originalData[index].x - this.x;
                point.y = o.originalData[index].y - this.y;
              }, this);
            }
          }, this);

          this.lighting.compute(this.bmd.width, this.bmd.height);
          this.lighting.render(this.bmd.ctx);
        } else {
          this.lamp.render(this.bmd.ctx);
        }

        this.bmd.dirty = true;
        this.lamp.offset.x = this.x;
        this.lamp.offset.y = this.y;
      };
      sprite.createLighting = function(opaqueObjects) {
        if (!opaqueObjects) {
          return null;
        }

        const bmd = this.bmd;

        const lighting = new illuminated.Lighting({ light: lamp, objects: opaqueObjects });
        lighting.compute(bmd.width, bmd.height);
        lighting.render(bmd.ctx);

        this.lighting = lighting;

        return this;
      };
      sprite.getLamp = function() {
        return this.lamp;
      };

      sprite.refresh();

      this._illuminatedSprites.push(sprite);
      return sprite;
    };

    Phaser.Plugin.PhaserIlluminated.prototype._createDarkMask = function(illuminatedSprites, color) {
          // if we aren't provided with some sprites, we grab all by default
      if (!illuminatedSprites) {
        illuminatedSprites = this._game.add.illuminated._illuminatedSprites;
      }

      const lamps = [];
      illuminatedSprites.forEach((e) => {
        lamps.push(e.lamp);
      }, this);

      const config = game.config;
          // var bmd = game.add.bitmapData(this._game.width, this._game.height);
      const tw = config.tableW * 1.045;
      const th = config.tableH * 1.1;
      const bmd = game.add.bitmapData(tw, th);
      game.cache.addBitmapData('illuminated-darkmask', bmd);
      const darkMask = new illuminated.DarkMask({ lights: lamps, color: color || 'rgba(0,0,0,0.8' });
      darkMask.compute(tw, th);
      darkMask.render(bmd.ctx);
      const sprite = game.add.sprite(0, config.tableCenterY - config.tableH * 0.55, bmd);
      sprite.darkMask = darkMask;
      sprite.bmdIndex = 'illuminated-darkmask';
      sprite.bmd = bmd;
      sprite.refresh = function() {
        this.bmd.ctx.clearRect(0, 0, this.bmd.width, this.bmd.height);
        this.darkMask.compute(this.bmd.width, this.bmd.height);
        this.darkMask.render(bmd.ctx);
        this.bmd.dirty = true;
      };
      sprite.getMask = function() {
        return this.darkMask;
      };
      sprite.addLampSprite = function(lampSprite) {
        this.darkMask.lights.push(lampSprite.lamp);
        this.refresh();
      };


      return sprite;
    };

    Phaser.Plugin.PhaserIlluminated.prototype._createRectangleObject = function(x, y, w, h) {
      const obj = new illuminated.RectangleObject({ topleft: new illuminated.Vec2(x, y), bottomright: new illuminated.Vec2(x + w, y + h) });
      obj.originalX = x;
      obj.originalY = y;
      obj.originalW = w;
      obj.originalH = h;

      return obj;
    };

    Phaser.Plugin.PhaserIlluminated.prototype._createDiscObject = function(centerX, centerY, radius) {
      const obj = new illuminated.DiscObject({ position: new illuminated.Vec2(centerX, centerY), radius });
      obj.originalX = centerX;
      obj.originalY = centerY;

      return obj;
    };

    Phaser.Plugin.PhaserIlluminated.prototype._createLineObject = function(startX, startY, endX, endY) {
      const obj = new illuminated.LineObject(new illuminated.Vec2(startX, startY), new illuminated.Vec2(startX, startY));
      obj.originalStartX = startX;
      obj.originalStartY = startY;
      obj.originalEndX = endX;
      obj.originalEndY = endY;

      return obj;
    };

      // data in the form [{x: x, y: y},{x: x, y: y}, ...]
    Phaser.Plugin.PhaserIlluminated.prototype._createPolygonObject = function(data) {
      const vec2Data = [];
      data.forEach((point) => {
        vec2Data.push(new illuminated.Vec2(point.x, point.y));
      }, this);


      const obj = new illuminated.PolygonObject({ points: vec2Data });
      obj.originalData = data;

      return obj;
    };
  },

  reportPlayerReadyToPlay({ Meteor }, gameRoomId) {
    Meteor.call('reportPlayerReadyToPlay', gameRoomId, (err) => {
      if (err) {
                    // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {

      }
    });
  },

  reportAllBallStopped({ Meteor }, gameRoomId) {
    Meteor.call('reportAllBallStopped', gameRoomId, (err) => {
      if (err) {
                    // return LocalState.set('CREATE_COMMENT_ERROR', err.message);
      } else {

      }
    });
  }

//   invitePlayer({ Meteor }, inviteInfo) {
//     Meteor.call('gameRoom.invitePlayer', inviteInfo);
//   },
//   createGame({ Meteor }, game, type1, type2, history, aiVersion) {
//     Meteor.call('startPracticeGame', game, type1, type2, aiVersion, (err, res) => {
//       if (err) {
//         console.log('err', err);
//       }

//       if (res) {
//         history.push(`/playgame/${res}`);
//       }
//     });
//   },
};
