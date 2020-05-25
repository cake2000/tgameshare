import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { MESSAGES } from '../../../../lib/const';

const WinnerModal = (props) => {
  const { isOpen, handleModal, message } = props;
  const closeModal = () => {
    handleModal(false);
  }

  return (
    <Modal
      isOpen={isOpen}
      contentLabel={'Modal'}
      overlayClassName={{
        base: 'modal--overlay',
        afterOpen: 'modal--overlay--afteropen',
        beforeClose: 'modal--overlay--beforeclose'
      }}
      className={{
        base: 'modal--container',
        afterOpen: 'modal--container--afteropen',
        beforeClose: 'modal--container--beforeclose'
      }}
    >
      <div className="tournamentModal--container">
        <div className="tournamentModal--container--wrapper">
          <div className="tournamentModal--container--wrapper__header">
            <span>
              {MESSAGES().GAME_ROOM_TOURNAMENT_DATA.TOURNAMENT_GAME}
            </span>
          </div>
          <div className="tournamentModal--container--wrapper--content">
            <div className="tournamentModal--container--wrapper--content--wrapper">
              <div className="tournamentModal--container--wrapper--content--wrapper__message">
                {message}
              </div>
              <div className="tournamentModal--container--wrapper--content--wrapper__winner">
                {MESSAGES().GAME_ROOM_TOURNAMENT_DATA.WINNER}
              </div>
            </div>
            <div className="tournamentModal--container--wrapper--content--button">
              <button
                className="tournamentModal--container--wrapper--content--button__close"
                onClick={() => closeModal()}
              >Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

WinnerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleModal: PropTypes.func.isRequired
}

export default WinnerModal;
