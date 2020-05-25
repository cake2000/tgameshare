/* eslint no-underscore-dangle: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { GAME_CONFIG_OPTION, PLAY_WITH_FRIEND_STATEMENT, MIGRATION_CONST } from '../../../../lib/enum';
import LocalGameRoomMember from './GameRoomMember.Local.jsx';

class LocalGameRoomTeams extends React.Component {
  static propTypes = {
    teams: PropTypes.arrayOf(PropTypes.any),
    gameRoomData: PropTypes.objectOf(PropTypes.any),
    switchTeam: PropTypes.func.isRequired,
    isGamePool: PropTypes.bool,
    playerControllers: PropTypes.arrayOf(PropTypes.any).isRequired,
    handleSelectOptionType: PropTypes.func.isRequired,
    handleSelectReleaseVersion: PropTypes.func.isRequired,
    defaultItems: PropTypes.arrayOf(PropTypes.any)
  };

  static defaultProps = {
    gameRoomData: {},
    isGamePool: false,
    teams: [],
    defaultItems: []
  };

  switchTeam() {
    const { switchTeam, gameRoomData } = this.props;

    const currentTeam = _.find(gameRoomData.playerInfo, member => member.userId === Meteor.userId());
    const changeTeam = _.find(gameRoomData.playerInfo, member => member.playerType === GAME_CONFIG_OPTION.DEFAULT && member.teamID !== currentTeam.teamID);

    if (!changeTeam) {
      toast(PLAY_WITH_FRIEND_STATEMENT.CAN_NOT_SWITCH, { type: 'warning', autoClose: 5000 });
    } else {
      switchTeam(gameRoomData._id, currentTeam);
    }
  }

  renderTeam = (member, index) => {
    const {
      gameRoomData,
      isGamePool,
      playerControllers,
      handleSelectOptionType,
      handleSelectReleaseVersion,
      gamesRelease,
      defaultItems
    } = this.props;

    return (
      <LocalGameRoomMember
        key={`member-${index}`}
        index={index}
        gamesRelease={gamesRelease}
        gameRoomData={gameRoomData}
        memberInfo={member}
        isGamePool={isGamePool}
        playerController={playerControllers[member.slot]}
        handleSelectOptionType={handleSelectOptionType}
        handleSelectReleaseVersion={handleSelectReleaseVersion}
        defaultItems={defaultItems}
      />
    );
  }

  render() {
    const { teams, gameRoomData } = this.props;
    return (
      <div className="configure-groups__content">
        <div className="team-session team-session--tank">
          {
            gameRoomData.gameId === MIGRATION_CONST.tankGameId
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
            onClick={() => {
              this.switchTeam();
            }}
          >
            <i className="fa fa-exchange" aria-hidden="true" />
          </button> */}
        </div>

        <div className="team-session team-session--tank">
          {
            gameRoomData.gameId === MIGRATION_CONST.tankGameId
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

export default LocalGameRoomTeams;
