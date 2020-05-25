import React from 'react';
import Modal from 'react-modal';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    margin: '0 auto',
    background: '#051c30',
    // backgroundColor: '#051c30',
    border: 'none',
    // color: '#fff',
    display: 'flex',
    alignItems: 'center',
  }
};
const GeneralModal = ({ isOpen, contentLabel, children }) => (
  <Modal
    // style={StyleModal}
    isOpen={isOpen}
    contentLabel={contentLabel}
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
    {children}
  </Modal>
);
export default GeneralModal;
