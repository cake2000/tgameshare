/* eslint no-underscore-dangle: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { COINS_WAGER, GAME_CONFIG_OPTION, PLAY_WITH_FRIEND_STATEMENT, MIGRATION_CONST } from '../../../../lib/enum';
import GameRoomMember from './GameRoomMember.jsx';
import _isEqual from 'lodash/isEqual';
import _get from 'lodash/get';
import _isString from 'lodash/isString';

class GameRoomTeams extends React.Component {
  static propTypes = {
    teams: PropTypes.arrayOf(PropTypes.any),
    gameData: PropTypes.objectOf(PropTypes.any),
    switchTeam: PropTypes.func.isRequired,
    isGamePool: PropTypes.bool,
    handleInvitationModel: PropTypes.func.isRequired,
    changePlayerType: PropTypes.func.isRequired,
    users: PropTypes.arrayOf(PropTypes.any),
    handleCancelInvite: PropTypes.func.isRequired,
    handleSelectOption: PropTypes.func.isRequired,
    userView: PropTypes.objectOf(PropTypes.any),
    handleChangeSlotOption: PropTypes.func.isRequired,
    updateAICodeForRobotSlot: PropTypes.func.isRequired
  };

  static defaultProps = {
    gameData: {},
    isGamePool: false,
    users: [],
    teams: [],
    userView: null
  };

  componentDidUpdate(prevProps, prevState) { // eslint-disable-line
    const {
      updateAICodeForRobotSlot, gameData: { _id: gameId }
    } = this.props;
    const prevTeam2Leader = _get(prevProps, 'teams.1.0.userId', null);
    const team2Leader = _get(this.props, 'teams.1.0.userId', null);
    const teamID = _get(team2Leader, 'teamID');
    // console.log('did update', prevTeam2Leader, team2Leader, !_isEqual(prevTeam2Leader, team2Leader));
    if (!_isEqual(prevTeam2Leader, team2Leader)) {
      if (_isString(teamID)) {
        updateAICodeForRobotSlot(gameId, teamID);
      }
    }
  }

  switchTeam() {
    const { switchTeam, gameData } = this.props;

    const currentTeam = _.find(gameData.playerInfo, member => member.userId === Meteor.userId());
    const changeTeam = _.find(gameData.playerInfo, member => member.playerType === GAME_CONFIG_OPTION.DEFAULT && member.teamID !== currentTeam.teamID);

    if (!changeTeam) {
      toast(PLAY_WITH_FRIEND_STATEMENT.CAN_NOT_SWITCH, { type: 'warning', autoClose: 5000 });
    } else {
      switchTeam(gameData._id, currentTeam);
    }
  }

  renderTeam = (member, index) => {
    const {
      gameData,
      isGamePool,
      handleInvitationModel,
      changePlayerType,
      users,
      handleCancelInvite,
      handleSelectOption,
      userView,
      handleChangeSlotOption
    } = this.props;
    return (
      <GameRoomMember
        key={`member-${index}`}
        index={index}
        gameData={gameData}
        memberInfo={member}
        isGamePool={isGamePool}
        handleInvitationModel={handleInvitationModel}
        changePlayerType={changePlayerType}
        users={users}
        handleCancelInvite={handleCancelInvite}
        handleSelectOption={handleSelectOption}
        userView={userView}
        handleChangeSlotOption={handleChangeSlotOption}
      />
    );
  }

  render() {
    const { gameData, teams } = this.props;
    return (
      <div className="configure-groups__content">
        <div className="team-session team-session--tank">
          {
            gameData.gameId == MIGRATION_CONST.tankGameId
            && (
              <div className="team-session__name">
                <img src="/images/tank1_blue_64.png" alt="Blue Team" />
                <span className="blue">Blue Team</span>
              </div>
            )
          }
          {
            teams[0].map(this.renderTeam)
          }
        </div>

        <div className="configure-groups__content_vs">
          <span>VS</span>
          {/* <button
            type="button"
            onClick={
              () => {
                this.switchTeam();
              }}
          >
            <i className="fa fa-exchange" aria-hidden="true" />
          </button>
          <div className="level__info__coin">
            <img width="25px" src="/images/coin.png" alt="" />
            <span>{COINS_WAGER[gameData.level.toUpperCase()]}</span>
          </div> */}
        </div>

        <div className="team-session team-session--tank">
          {
            gameData.gameId == MIGRATION_CONST.tankGameId
            && (
              <div className="team-session__name">
                <img src="/images/tank1_red_64.png" alt="Red Team" />
                <span className="red">Red Team</span>
              </div>
            )
          }
          {
            teams[1].map(this.renderTeam)
          }
        </div>
      </div>
    );
  }
}

export default GameRoomTeams;
