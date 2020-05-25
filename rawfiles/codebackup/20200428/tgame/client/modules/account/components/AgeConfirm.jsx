import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import ParentForm from '../containers/ParentForm';

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
    transform: 'translate(-50%, -50%)',
    maxWidth: '480px',
    padding: '0',
    borderRadius: '0px',
    width: '100%',
    margin: '0 auto',
    border: 'none',
    alignItems: 'center'
  }
};

class AgeConfirm extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    accountType: PropTypes.string,
    handleClose: PropTypes.func.isRequired
  }

  static defaultProps = {
    isOpen: false,
    accountType: ''
  }

  constructor(props) {
    super(props);

    this.state = {
      showParentForm: false
    };
  }

  toggleParentForm = () => {
    this.setState(prevState => ({ showParentForm: !prevState.showParentForm }));
  }

  render() {
    const { handleClose, accountType, isOpen } = this.props;

    return (
      <Modal
        style={StyleModal}
        isOpen={isOpen}
        contentLabel="Modal"
      >
        {
          !this.state.showParentForm
            ? (
              <div className="modal_block_general modal--AgeConfirm">
                <div className="modal__header">
                  <div className="modal__header__title">Free sign up</div>
                  <div className="modal__header--close" onClick={handleClose} role="presentation">x</div>
                </div>
                <div className="modal__body">
                  <div className="modal__body__left">
                    <img src="/images/tboticon.png" alt="tbot icon" />
                  </div>
                  <div className="modal__body__right">
                    <span className="text">Please choose your age group:</span>
                    <div className="btn--group">
                      <div className="btn btn-info " role="presentation" onClick={this.toggleParentForm}>12 or younger</div>
                      <Link className="btn btn-info " to={`/signup${(accountType && accountType.trim() !== '') ? `/${accountType}` : ''}`} onClick={handleClose}>13 or older</Link>
                    </div>
                  </div>
                </div>
              </div>
            )
            : (
              <ParentForm handleClose={handleClose} toggleParentForm={this.toggleParentForm} />
            )
        }
      </Modal>
    );
  }
}

export default AgeConfirm;
