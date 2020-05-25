import React from 'react';
import Modal from 'react-modal';
import UpgradeItem from './UpgradeItem.jsx';


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
    transform: 'translate(-50%, -50%)'
  }
};

const UpdateProfile = (props) => {
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
        <div className="player--invite--wrapper upgrade-item-wrapper">
          <div className="modal__header" id={`change-${activeItemChoosen.type}-header`}>
            <div className="modal__header--title">
              <span className="flex-mobile" />
              <span className="modal__header--content flex change-items">
                Change 
{' '}
{activeItemChoosen.type}
              </span>
              <div className="flex change-items">
                {
                !fromGameRoom
                  && <div className="modal__header--coins">
                    <img src="/images/statics-coin-icon.png" />
                    <span>
{coins}
{' '}
available
</span>
                  </div>
                }
              </div>
            </div>
            <div className="modal__header--close" onClick={closeModal} role="presentation">x</div>
          </div>
          <div className="modal__body" id={`change-${activeItemChoosen.type}-body`}>
            <div className="modal__body--content">
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
        </div>
      </Modal>
    </div>
  );
};

UpdateProfile.propTypes = {

};


export default UpdateProfile;
