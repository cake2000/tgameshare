import Modal from 'react-modal';
import React from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Avatar from '../../core/components/Avatar.jsx';

import {
  validateEmail, sortUserStatus, checkUserInGame, checkUserInvited
} from '../../../../lib/util';

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    minWidth: '840px',
    padding: '0',
    borderRadius: '0px',
    maxHeight: 'calc(100vh - 40px)',
    border: 'none',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

class PlayerInviteModal extends React.Component {
  static propTypes = {
    openModal: PropTypes.bool,
    handleButtonInvite: PropTypes.func,
    userOnline: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    userSearchResult: PropTypes.arrayOf(PropTypes.shape()),
    playerInvitationHistory: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    handleModal: PropTypes.func.isRequired,
    changeSearchKeyword: PropTypes.func.isRequired,
    searchKeyword: PropTypes.string,
    sendInviteEmail: PropTypes.func.isRequired,
    gameRoomId: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    invitedPlayers: PropTypes.arrayOf(PropTypes.any)
  };

  static defaultProps = {
    openModal: false,
    handleButtonInvite: PropTypes.func,
    userOnline: null,
    playerInvitationHistory: [],
    searchKeyword: '',
    userSearchResult: [],
    gameRoomId: '',
    invitedPlayers: []
  };

  constructor(props) {
    super(props);
    this.state = {
      isSendInvite: false
    };
  }

  componentWillMount() {
    this.props.changeSearchKeyword(''); // eslint-disable-line
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.openModal && !nextProps.openModal) { // eslint-disable-line
      this.props.changeSearchKeyword(''); // eslint-disable-line
    }
  }

  changeSearchKeyword(value) {
    this.props.changeSearchKeyword(value); // eslint-disable-line
  }

  handleSendInviteEmail = () => {
    const { searchKeyword, sendInviteEmail, gameRoomId } = this.props;
    if (validateEmail(searchKeyword) && gameRoomId) {
      this.setState({
        isSendInvite: true
      });
      sendInviteEmail(searchKeyword, gameRoomId, () => {
        this.setState({
          isSendInvite: false
        });
        this.props.closeModal(); // eslint-disable-line
        toast('You have already sent an invitation with this email. Please wait for this user to join', { type: 'info', autoClose: 10000, hideProgressBar: true });
      });
    }
  }

  renderUserWithoutInfo = (item) => {
    const userInGame = checkUserInGame(item);
    const userInvited = checkUserInvited(item, this.props.invitedPlayers); // eslint-disable-line
    return (
      <div className="invite--available" key={item._id}>
        <div className="invite--avatar">
          {
            (item.avatar && item.avatar.url)
              ? <Avatar url={item.avatar.url} alt={item.username} />
              : <Avatar alt={item.username} />
          }
        </div>
        <div className="invite--info">
          <div className="invite--info__header">
            <span>{item.username}</span>
          </div>
          <div className="invite--info__content">
            {!_.get(item, 'status.online')
              && <button type="button" className="button--accept buttonDisabled" disabled>Player Offline</button>}
            {userInGame
              && <button type="button" className="button--accept buttonDisabled" disabled>IN GAME</button>}
            {userInvited && !userInGame
              && <button type="button" className="button--accept buttonDisabled" disabled>Waiting</button>}
            {
              _.get(item, 'status.online') && !userInGame && !userInvited
              && (
                <button
                  type="button"
                  className="button--accept"
                  onClick={() => { this.props.handleButtonInvite(item); }} // eslint-disable-line
                >
                  Invite Now
                </button>
              )
            }
          </div>
        </div>
      </div>
    );
  }

  renderUserListWithSearchKeyword = () => {
    const { userSearchResult, allowInviteEmail } = this.props;

    return (
      <div className="player--invite__content">
        <div className="invite--wrapper">
          <div className="invite__header">
            <span>Search results</span>
          </div>
          <div className="invite__content">
            {
              allowInviteEmail
              && (
                <button type="button" disabled={this.state.isSendInvite} className="button--accept" onClick={this.handleSendInviteEmail}> {/* eslint-disable-line */}
                  {this.state.isSendInvite ? 'SENDING...' : 'INVITE BY EMAIL'} {/* eslint-disable-line */}
                </button>
              )
            }
            {_.map(userSearchResult.sort(sortUserStatus), this.renderUser)}
          </div>
        </div>
        <div className="invite--wrapper" />
      </div>);
  }

  renderUser = (user, index) => {
    const userInvited = checkUserInvited(user, this.props.invitedPlayers); // eslint-disable-line
    const userInGame = checkUserInGame(user);

    return (
      <div className="invite--available" key={`invite-${index}`}>
        <div className="invite--avatar">
          {
            (user.avatar && user.avatar.url)
              ? <Avatar url={user.avatar.url} alt={user.username} />
              : (
                <Avatar alt={user.username} />
              )
          }
        </div>
        <div className="invite--info">
          <div className="invite--info__header">
            <span>{user.username}</span>
          </div>
          {/* for now, online game play for free
          {
            user.profile
            && (
              <div className="invite--info__coin">
                <img src="/images/coin.png" alt="" />
                <span>{user.profile.coins}</span>
              </div>
            )
          } */}
          <div className="invite--info__content">
            {
              userInGame
              && <button type="button" className="button--accept buttonDisabled" disabled>IN GAME</button>
            }
            {
              userInvited
              && !userInGame && <button type="button" className="button--accept buttonDisabled" disabled>Waiting</button>
            }
            {
              _.get(user, 'status.online') && !userInGame && !userInvited
              && <button type="button" className="button--accept" onClick={() => { this.props.handleButtonInvite(user); }}>Invite</button> // eslint-disable-line
            }
          </div>
        </div>
      </div>
    );
  }

  renderUserListWithoutSearchKeyword = () => {
    const { userOnline, playerInvitationHistory } = this.props;
    const userListAvail = userOnline;
    const renderedPlayers = new Set();

    return (
      <div className="player--invite__content">
        <div className="invite--wrapper">
          <div className="invite__header">
            <span>Players Online</span>
          </div>
          <div className="invite__content">
            {
              userListAvail.length > 0
                ? _.map(userListAvail.sort(sortUserStatus), this.renderUser)
                : (
                  <div>
                    <span>No users online</span>
                  </div>
                )
            }
          </div>
        </div>
        <div className="invite--wrapper">
          <div className="invite__header">
            <span>Recent Opponent</span>
          </div>
          <div className="invite__content">
            {
              playerInvitationHistory.length > 0
                ? playerInvitationHistory.map((player, index1) => (
                  player.playerInfo.map((item, index2) => {
                    const userId = _.get(item, '_id');
                    if (renderedPlayers.has(userId)) return undefined;
                    renderedPlayers.add(userId);

                    const winners = _.get(player, 'winners', []);
                    const isWinner = !!winners.find(uid => item && uid === item._id);
                    return (item
                      && (
                        <div className="invite--available" key={`invite-${index1}${index2}`}> {/* eslint-disable-line */}
                          <div className="invite--avatar">
                            {
                              (item.avatar && item.avatar.url)
                                ? <Avatar url={item.avatar.url} alt={item.username} />
                                : <Avatar alt={item.username} />
                            }
                          </div>
                          <div className="invite--info">
                            <div className="invite--info__header">
                              <span>{item.username}</span>
                            </div>
                            <div className={`invite--info__${isWinner ? 'lost' : 'win'}`}> {/* eslint-disable-line */}
                              {
                                isWinner ? 'Lost' : 'Win'
                              }
                            </div>
                            <div className="invite--info__content">
                              {
                                !_.get(item, 'status.online')
                                && <button type="button" className="button--accept buttonDisabled" disabled>Player Offline</button>
                              }
                              {
                                checkUserInGame(item)
                                && <button type="button" className="button--accept buttonDisabled" disabled>Player In a Game</button>
                              }
                              {
                                _.get(item, 'status.online') && (!checkUserInGame(item))
                                && (
                                  <button
                                    type="button"
                                    className="button--accept"
                                    onClick={() => { this.props.handleButtonInvite(item); }} // eslint-disable-line
                                  >
                                    Invite Now
                                  </button>
                                )
                              }
                            </div>
                          </div>
                        </div>
                      )
                    );
                  })
                ))
                : (
                  <div>
                    <span>No recent games</span>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { openModal, searchKeyword } = this.props;
    return (
      <Modal
        isOpen={openModal}
        style={StyleModal}
        contentLabel={'Modal'} // eslint-disable-line
      >
        <div className="modal_block_general modal--invite">
          <div className="modal__header">
            <div className="modal__header__title">Invite Players</div>
            <div className="modal__header--close" onClick={() => this.props.handleModal(false)} role="presentation"><i className="fa fa-times" /></div> {/* eslint-disable-line */}
          </div>
          <div className="modal__body">
            <div className="modal_body--content">
              <div className="">
                <div className="">
                  <div className="invite-search">
                    <input
                      type="text"
                      placeholder="Search by username"
                      value={searchKeyword}
                      onChange={(e) => {
                        this.changeSearchKeyword(e.target.value);
                      }}
                    />
                    <i className="fa fa-search" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
            {!searchKeyword && this.renderUserListWithoutSearchKeyword()}
            {searchKeyword && this.renderUserListWithSearchKeyword()}
          </div>
        </div>
      </Modal>
    );
  }
}

export default PlayerInviteModal;
