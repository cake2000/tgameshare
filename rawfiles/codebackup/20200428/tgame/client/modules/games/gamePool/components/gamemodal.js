var gameModal = gameModal || {};


gameModal = function (game) {
  const _this = this;

  game.modals = {};

    /**
     * [hideModal description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
  this.hideModal = function (type) {
    window.console.log(type);
    game.modals[type].visible = false;
  };

  return {

    createModal (options) {
      const type = options.type || ''; // must be unique
      const includeBackground = options.includeBackground; // maybe not optional
      const backgroundColor = options.backgroundColor || '0x000000';
      const backgroundOpacity = options.backgroundOpacity === undefined ? 0.7 : options.backgroundOpacity;
      const modalCloseOnInput = options.modalCloseOnInput || false;
      let modalBackgroundCallback = options.modalBackgroundCallback || false;
      const vCenter = options.vCenter || true;
      const hCenter = options.hCenter || true;
      const itemsArr = options.itemsArr || [];
      const fixedToCamera = options.fixedToCamera || false;
            /* var vPadding = options.vPadding || 20;*/

            // ///////////////////////////////////////////////////////////////////

      let modal;
      const modalGroup = game.add.group();
      if (fixedToCamera === true) {
        modalGroup.fixedToCamera = true;
        modalGroup.cameraOffset.x = 0;
        modalGroup.cameraOffset.y = 0;
      }

      if (includeBackground === true) {
        modal = game.add.graphics(game.width, game.height);
        modal.beginFill(backgroundColor, backgroundOpacity);
        modal.x = 0;
        modal.y = 0;

        modal.drawRect(0, 0, game.width, game.height);

        if (modalCloseOnInput === true) {
          var innerModal = game.add.sprite(0, 0);
          innerModal.inputEnabled = true;
          innerModal.width = game.width;
          innerModal.height = game.height;
          innerModal.type = type;
          innerModal.input.priorityID = 0;
          innerModal.events.onInputDown.add(function (e, pointer) {
            this.hideModal(e.type);
          }, _this, 2);

          modalGroup.add(innerModal);
        } else {
          modalBackgroundCallback = true;
                    // modal.inputEnabled = true;
                    /* var innerModal = game.add.sprite(0, 0);
                    innerModal.inputEnabled = true;
                    innerModal.width = game.width;
                    innerModal.height = game.height;
                    innerModal.type = type;
                    innerModal.input.priorityID = 2;
                    innerModal.events.onInputDown.add(function(e){
                        //
                    }, _this);
                    modalGroup.add(innerModal);*/
        }
      }

      if (modalBackgroundCallback) {
        var innerModal = game.add.sprite(0, 0);
        innerModal.inputEnabled = true;
        innerModal.width = game.width;
        innerModal.height = game.height;
        innerModal.type = type;
        innerModal.input.priorityID = 0;

        modalGroup.add(innerModal);
      }

            // add the bg
      if (includeBackground) {
        modalGroup.add(modal);
      }


      let modalLabel;
      for (let i = 0; i < itemsArr.length; i += 1) {
        const item = itemsArr[i];
        const itemType = item.type || 'text';
        const itemColor = item.color || 0x000000;
        const itemFontfamily = item.fontFamily || 'Arial';
        const itemFontSize = item.fontSize || 32;
        const itemStroke = item.stroke || '0x000000';
        const itemStrokeThickness = item.strokeThickness || 0;
        const itemAlign = item.align || 'center';
        const offsetX = item.offsetX || 0;
        const offsetY = item.offsetY || 0;
        const contentScale = item.contentScale || 1;
        const content = item.content || '';
        const centerX = game.width / 2;
        const centerY = game.height / 2;
        const callback = item.callback || false;
        const textAlign = item.textAlign || 'left';
        const atlasParent = item.atlasParent || '';
        const buttonHover = item.buttonHover || content;
        const buttonActive = item.buttonActive || content;
        const graphicColor = item.graphicColor || 0xffffff;
        const graphicOpacity = item.graphicOpacity || 1;
        const graphicW = item.graphicWidth || 200;
        const graphicH = item.graphicHeight || 200;
        const lockPosition = item.lockPosition || false;

        modalLabel = null;

        if (itemType === 'text' || itemType === 'bitmapText') {
          if (itemType === 'text') {
            modalLabel = game.add.text(0, 0, content, {
              font: `${itemFontSize}px ${itemFontfamily}`,
              fill: `#${String(itemColor).replace('0x', '')}`,
              stroke: `#${String(itemStroke).replace('0x', '')}`,
              strokeThickness: itemStrokeThickness,
              align: itemAlign
            });
            modalLabel.contentType = 'text';
            modalLabel.update();
                        // modalLabel.x = ((game.width / 2) - (modalLabel.width / 2)) + offsetX;
                        // modalLabel.y = ((game.height / 2) - (modalLabel.height / 2)) + offsetY;
            modalLabel.x = ((game.config.TrueWidth / 2) - (modalLabel.width / 2)) + offsetX;
            modalLabel.y = ((game.config.TrueHeight / 2) - (modalLabel.height / 2)) + offsetY;
          } else {
            modalLabel = game.add.bitmapText(0, 0, itemFontfamily, String(content), itemFontSize);
            modalLabel.contentType = 'bitmapText';
            modalLabel.align = textAlign;
            modalLabel.updateText();
            modalLabel.x = (centerX - (modalLabel.width / 2)) + offsetX;
            modalLabel.y = (centerY - (modalLabel.height / 2)) + offsetY;
          }
        } else if (itemType === 'image') {
                    // content = item.imageKey || "";
          modalLabel = game.add.image(0, 0, content);
          modalLabel.scale.setTo(contentScale, contentScale);
          modalLabel.contentType = 'image';
          modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
          modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
        } else if (itemType === 'sprite') {
          modalLabel = game.add.sprite(0, 0, atlasParent, content);
          modalLabel.scale.setTo(contentScale, contentScale);
          modalLabel.contentType = 'sprite';
          modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
          modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
        } else if (itemType === 'button') {
          modalLabel = game.add.button(0, 0, atlasParent, callback, this, buttonHover, content, buttonActive, content);
          modalLabel.scale.setTo(contentScale, contentScale);
          modalLabel.contentType = 'button';
          modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
          modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
        } else if (itemType === 'graphics') {
          modalLabel = game.add.graphics(graphicW, graphicH);
          modalLabel.beginFill(graphicColor, graphicOpacity);

          modalLabel.drawRect(0, 0, graphicW, graphicH);
          modalLabel.endFill();
          modalLabel.x = (centerX - ((modalLabel.width) / 2)) + offsetX;
          modalLabel.y = (centerY - ((modalLabel.height) / 2)) + offsetY;
        }

        modalLabel._offsetX = 0;
        modalLabel._offsetY = 0;
        modalLabel.lockPosition = lockPosition;
        modalLabel._offsetX = offsetX;
        modalLabel._offsetY = offsetY;


        if (callback !== false && itemType !== 'button') {
          modalLabel.inputEnabled = true;
          modalLabel.pixelPerfectClick = true;
          modalLabel.priorityID = 10;
          modalLabel.events.onInputDown.add(callback, modalLabel);
        }

        if (itemType !== 'bitmapText' && itemType !== 'graphics') {
          modalLabel.bringToTop();
          modalGroup.add(modalLabel);
          modalLabel.bringToTop();
          modalGroup.bringToTop(modalLabel);
        } else {
          modalGroup.add(modalLabel);
          modalGroup.bringToTop(modalLabel);
        }
      }

      modalGroup.visible = false;
      game.modals[type] = modalGroup;
    },
    updateModalValue (value, type, index, id) {
      let item;
      if (index !== undefined && index !== null) {
        item = game.modals[type].getChildAt(index);
      } else if (id !== undefined && id !== null) {

      }

      if (item.contentType === 'text') {
        item.text = value;
        item.update();
        if (item.lockPosition === true) {

        } else {
          item.x = ((game.width / 2) - (item.width / 2)) + item._offsetX;
          item.y = ((game.height / 2) - (item.height / 2)) + item._offsetY;
        }
      } else if (item.contentType === 'bitmapText') {
        item.text = value;
        item.updateText();
        if (item.lockPosition === true) {

        } else {
          item.x = ((game.width / 2) - (item.width / 2)) + item._offsetX;
          item.y = ((game.height / 2) - (item.height / 2)) + item._offsetY;
        }
      } else if (item.contentType === 'image') {
        item.loadTexture(value);
      }
    },
    getModalItem (type, index) {
      return game.modals[type].getChildAt(index);
    },
    showModal (type) {
      game.world.bringToTop(game.modals[type]);
      game.modals[type].visible = true;
            // you can add animation here
    },
    hideModal (type) {
      game.modals[type].visible = false;
            // you can add animation here
    },
    destroyModal (type) {
      game.modals[type].destroy();
      delete game.modals[type];
    }
  };
};

export default gameModal;
