import React from 'react';
import Modal from 'react-modal';
import UpgradeItem from './UpgradeItem.jsx';
import { ITEM_GAME_TYPE } from '../../../../../lib/enum.js';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '540px',
    padding: '0',
    background: 'transparent',
    borderRadius: '0px',
    maxHeight: 'calc(100vh - 40px)',
    border: 'none',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

const ITEM_CATEGORY = {
  [ITEM_GAME_TYPE.CUE]: 'Cue Stick',
  [ITEM_GAME_TYPE.TABLE]: 'Pool Table',
  [ITEM_GAME_TYPE.TANK]: 'Tank',
  [ITEM_GAME_TYPE.TILE]: 'Tile'
};

const UpgradeModal = (props) => {
  const {
    isOpenModal, activeItemChoosen,
    boughtItems, closeModal, loading,
    gameItems, coins, fromGameRoom,
    gameRoomId
  } = props;
  if (!isOpenModal) return null;
  const items = gameItems.map(gameItem => ({
    ...gameItem,
    active: !!boughtItems.find(item => item._id === gameItem._id && item.active === true),
    wasBought: boughtItems.find(item => item._id === gameItem._id) !== undefined
  }));

  return (
    <div>
      <Modal
        onRequestClose={closeModal}
        isOpen={isOpenModal}
        style={StyleModal}
        contentLabel="Modal"
      >
        <div className="modal-Shopping">
          <div className="modal-Shopping__header">
            <span className="modal-Shopping__header__title">{`Manage ${ITEM_CATEGORY[activeItemChoosen.type]}`}</span>
            <div className="modal-Shopping__header__close">
              <span onClick={closeModal} role="presentation"><i className="fa fa-times" /></span>
            </div>
          </div>
          <div className="modal-Shopping__main">
            {
                loading ? 'Loading items...'
                  : items.map(item => (
                    <UpgradeItem
                      fromGameRoom={fromGameRoom}
                      gameRoomId={gameRoomId}
                      key={item._id}
                      coins={coins}
                      item={item}
                    />
                  ))
              }
          </div>
        </div>








































        {/* <div className="modal_block_general modal--upgradeModal">
          <div className="modal__header" id={`change-${activeItemChoosen.type}-header`}>
            <div className="modal__header__title">
              <span>{`Change ${activeItemChoosen.type}`}</span>
              <div className="my-coins">
                {
                !fromGameRoom
                  && <div className="my-coins__available">
                    <img src="/img_v2/Coins@2x.png" alt="coins" />
                    <span>
{`${coins}`}
{' '}
 </span>
                  </div>
                }
              </div>
            </div>
            <div className="modal__header--close" onClick={closeModal} role="presentation">x</div>
          </div>

          <div className="modal_body" id={`change-${activeItemChoosen.type}-body`}>
            <div className="modal_body--content modal_body--changeTools">
              {
                loading ? 'Loading items...'
                  : items.map(item => (
                    <UpgradeItem
                      fromGameRoom={fromGameRoom}
                      gameRoomId={gameRoomId}
                      key={item._id}
                      coins={coins}
                      item={item}
                    />
                  ))
              }
            </div>
          </div>
        </div> */}
      </Modal>
    </div>
  );
};

UpgradeModal.propTypes = {

};


export default UpgradeModal;
