import React, { Component } from 'react';
import Modal from 'react-modal';
import Module from '../../../../lib/actionStorage';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    maxWidth: '385px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    display: 'flex',
    padding: '0px',
    alignItems: 'center',
  }
};

export default class GeneralModal extends Component {

  okAction = () => {
    this.closeModal();
    Module.getAction(Module.OK_ACTION)();
  }

  cancelAction = () => {
    this.closeModal();
    Module.getAction(Module.CANCEL_ACTION)();
  }

  closeModal = () => {
    const { closeModalAction } = this.props;
    closeModalAction();
  }

  render() {
    const {
      content, title, okBtnLabel, cancelBtnLabel, showModal
    } = this.props;
    return (
      <Modal
        style={StyleModal}
        isOpen={showModal}
        contentLabel={'Modal'}
      >
        <div className="general-modal">
          <div className="general-modal__header">
            <div className="general-modal__header__title">
              {title}
            </div>
            <div className="general-modal__header__action">
              <button onClick={this.closeModal}>x</button>
            </div>
          </div>
          <div className="general-modal__content">
            {content}
          </div>
          <div className="general-modal__button-group">
            <button
              onClick={this.okAction}
              className="button button--ok"
            >
              {okBtnLabel || 'OK'}
            </button>
            <button
              onClick={this.cancelAction}
              className="button button--cancel"
            >
              {cancelBtnLabel || 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}
