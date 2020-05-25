import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'react-modal';
import {
  REGISTER_BUTTON,
  getEnumValue,
  TOURNAMENT_ORGANIZED_BY,
  LIMIT_REGISTERED_USERS
} from '../../../../lib/enum';
import { MESSAGES, TIMES } from '../../../../lib/const.js';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

const message = MESSAGES().GAME_ROOM_TOURNAMENT_DATA;

export default class GameRoomTournamentRegisteredModal extends React.Component {
  static propTypes = {
    isExisted: PropTypes.bool.isRequired,
    isAbleToWithdraw: PropTypes.bool.isRequired,
    registerUser: PropTypes.func.isRequired,
    sectionKey: PropTypes.string.isRequired,
    tournamentId: PropTypes.string.isRequired,
    // sectionType: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    minutesRemain: PropTypes.number.isRequired,
    // enabledButton: PropTypes.bool.isRequired,
    organizedBy: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    handleModal: PropTypes.func.isRequired,
    section: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    userGame: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    gameId: PropTypes.string.isRequired,
    currentRating: PropTypes.number.isRequired, // eslint-disable-line react/forbid-prop-types
    usersRating: PropTypes.array // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    users: null,
    section: null,
    usersRating: null
  }

  constructor(props) {
    super(props);

    this.state = {
      buttonName: REGISTER_BUTTON.REGISTER,
      enabledButton: false,
      registerFailed: '',
      isLoading: false,
      isPageLoading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {
      isExisted,
      isAbleToWithdraw,
      section,
      organizedBy,
      users,
      minutesRemain,
      tournamentId,
      userGame,
      currentRating
    } = nextProps;
    const buttonName = isExisted === false ? REGISTER_BUTTON.WITHDRAW
      : REGISTER_BUTTON.REGISTER;

    setTimeout(() => {
      this.setState({ isPageLoading: true });
    }, 500);
    this.setState({
      buttonName,
      enabledButton: (isExisted === false && isAbleToWithdraw === true)
    });
    if (buttonName === REGISTER_BUTTON.REGISTER) {
      if (userGame.tournamentIds.includes(tournamentId) === true && !this.state.isLoading) {
        this.createWarning(message.ALREADY_JOINED_ANOTHER_SECTION);
        return;
      }
      let min;
      let max;
      if (organizedBy === TOURNAMENT_ORGANIZED_BY.AGE && section.playerBirthYearLowerBound && section.playerBirthYearUpperBound) {
        min = section.playerBirthYearLowerBound;
        max = section.playerBirthYearUpperBound;
        if (min > Meteor.user().profile.age) {
          this.createWarning(`${MESSAGES(organizedBy).GAME_ROOM_TOURNAMENT_DATA.LOWER} ${min}`);
          return;
        }
        if (max < Meteor.user().profile.age) {
          this.createWarning(`${MESSAGES(organizedBy).GAME_ROOM_TOURNAMENT_DATA.OLDER} ${max}`);
          return;
        }
      }

      if (organizedBy === TOURNAMENT_ORGANIZED_BY.RATING && section.playerRatingLowerBound && section.playerRatingUpperBound) {
        min = section.playerRatingLowerBound;
        max = section.playerRatingUpperBound;
        if (min > currentRating) {
          this.createWarning(`${MESSAGES(organizedBy).GAME_ROOM_TOURNAMENT_DATA.LOWER} ${min}`);
          return;
        }
        if (max < currentRating) {
          this.createWarning(`${MESSAGES(organizedBy).GAME_ROOM_TOURNAMENT_DATA.OLDER} ${max}`);
          return;
        }
      }

      if (users && users.length === LIMIT_REGISTERED_USERS) {
        this.createWarning(message.SECTION_FULL);
        return;
      }
    } else if (buttonName === REGISTER_BUTTON.WITHDRAW
      && minutesRemain <= TIMES.CANNOT_RES_WITHDRAW_TOURNAMENT_BEFORE) {
      this.createWarning(MESSAGES(minutesRemain).GAME_ROOM_TOURNAMENT_DATA.CANNOT_WITHDRAW);
      return;
    }
    this.createWarning('');
  }

  createWarning = (warning) => {
    this.setState({
      registerFailed: warning,
      enabledButton: !(warning.length > 0)
    });
  }

  handleButton = (name) => {
    const {
      registerUser,
      sectionKey,
      tournamentId,
      gameId
    } = this.props;

    this.setState(() => ({ isLoading: true }));
    setTimeout(() => {
      registerUser(name, gameId, tournamentId, sectionKey, () => {
        this.setState(() => ({ isLoading: false }));
      });
    }, 500);
  }

  render() {
    const { buttonName, registerFailed, enabledButton, isLoading, isPageLoading } = this.state;
    const {
      users,
      minutesRemain,
      organizedBy,
      isOpen,
      handleModal,
      usersRating
    } = this.props;
    let btnClass = 'button--register ';
    if (isLoading) {
      btnClass += 'button--disabled';
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
          base: 'modal--container modal--register',
          afterOpen: 'modal--container--afteropen',
          beforeClose: 'modal--container--beforeclose'
        }}
      >
        {
          isPageLoading === false ?
            <div className="loading">
              <LoadingIcon
                width={'30px'}
                height={'20px'}
              />
            </div>
          :
            <div className="tournament--info__modal">
              <div className="tournament--info__header">
                <div className="tournament--info__header--title">
                  <span>{message.REGISTERED_USER_MODAL_TITLE}</span>
                </div>
                <div className="tournament--info__header--button">
                  <button onClick={e => handleModal('', e)}>
                    x
                  </button>
                </div>
              </div>
              <div className="tournament--info__content">
                {users && users.length > 0 ?
                  <div className="tournament--info__content--component">
                    <div className="tournament--info__content--userTitle">
                      <span>{message.PLAYERS_NAME}</span>
                    </div>
                    <div className="tournament--info__content--scoreTitle">
                      <span>
                        {getEnumValue(TOURNAMENT_ORGANIZED_BY, organizedBy).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  : null
                }
                <div className="tournament--info__content--componentBody">
                  {users && users.length > 0 ?
                    users.map((user, index) => (
                      <div key={user._id} className="tournament--info__content--component">
                        <div className="tournament--info__content--user">
                          <span>{user.username}</span>
                        </div>
                        <div className="tournament--info__content--score">
                          <span>
                            {organizedBy === 'age' ? user.profile.age : usersRating[index].rating}
                          </span>
                        </div>
                      </div>
                    ))
                    : users && users.length === 0 ?
                      <div className="tournament--info__content--warning">
                        <span>{message.EMPTY_REGISTERED_USERS}</span>
                      </div>
                      : null
                  }
                </div>
              </div>
              {registerFailed.length > 0 && !isLoading ?
                <div className="tournament--info__content--failed">
                  <span>{registerFailed}</span>
                </div>
                : null
              }
              {(minutesRemain > 0 && enabledButton === true) ?
                <div className="tournament--info__register">
                  <button
                    className={btnClass}
                    onClick={() => this.handleButton(buttonName)}
                    disabled={isLoading ? 'disabled' : null}
                  >
                    {isLoading &&
                      <i className="button__loading-icon fa fa-circle-o-notch fa-spin" />
                    }
                    {!isLoading ? buttonName : null}
                  </button>
                </div>
                : null
              }
            </div>
        }
      </Modal>
    );
  }
}
