import Modal from 'react-modal';
import React from 'react';
import PropTypes from 'prop-types';
import InviteComponent from '../containers/InviteComponent.js';

class InviteModal extends React.Component {
  static propTypes = {
    openModal: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    handleModal: PropTypes.func.isRequired
  }

  static defaultProps = {
    history: null
  }

  render() {
    const { openModal, currentUser } = this.props;
    let inviteNumber = 0;

    if (currentUser.invite) {
      inviteNumber = currentUser.invite.length;
    }

    return (
      <Modal
        isOpen={openModal}
        contentLabel={'Modal'}
      >
        <div className="modal__header">
          <div className="modal__header--title">{`Invitation( ${inviteNumber} )`}</div>
          <div className="modal__header--close" onClick={() => this.props.handleModal(false)} role="presentation">x</div>
        </div>
        <div className="modal__body">
          <div className="modal__body--content">
            {
              _.map(currentUser.invite, (item, index) => {
                return (
                  <InviteComponent
                    currentUser={currentUser}
                    gameRoomId={item.gameRoomId}
                    key={index}
                    history={this.props.history}
                  />
                );
              })
            }
          </div>
        </div>
        {/* <div className="player--invite--wrapper">
          <div className="player--invite__header">
            <div className="player--invite__header__title">
              <span>{`Invitation( ${inviteNumber} )`}</span>
            </div>
            <div className="player--invite__header__button">
              <button
                className="button--close"
                onClick={() => {
                  this.props.handleModal(false);
                }}
              >
                x
            </button>
            </div>
          </div>
          <div className="player--invite__content">
            <div className="invite--wrapper">
              <div className="invite__content">
                {
                  _.map(currentUser.invite, (item, index) => {
                    return (
                      <InviteComponent
                        currentUser={currentUser}
                        gameRoomId={item.gameRoomId}
                        key={index}
                        history={this.props.history}
                      />
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div> */}
      </Modal>
    );
  }
}

export default InviteModal;
