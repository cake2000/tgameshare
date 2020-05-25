import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '880px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    padding: '0px',
    display: 'flex',
    alignItems: 'center'
  }
};

class RequireLoginPopup extends Component {
  cancel = () => {
    const { onClose } = this.props;
    onClose();
  }

  render() {
    const { isOpen } = this.props;

    return (
      <Modal
        style={StyleModal}
        isOpen={!!isOpen}
        contentLabel="Modal"
      >
        <div className="modal_block_general modal--challenge-modal">
          <div className="modal__header">
            <span className="modal__header__title">Challenge</span>
          </div>
          <div className="modal__body">
            <div className="modal__body--content">
              <div className="challenge--main">
                <div className="challenge__line">
                  You need to login to challenge the top game bots
                </div>
                <div className="challenge__line">
                  <Link to="/signin">Login</Link>
                  <Link to="/signup">Free Sign Up</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <div className="modal__footer__content">
              <button className="cancel" onClick={this.cancel} type="button">Cancel</button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

RequireLoginPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

RequireLoginPopup.defaultProps = {
};

export default RequireLoginPopup;
