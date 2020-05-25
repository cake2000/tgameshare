import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { MESSAGES } from '../../../../lib/const.js';
import { TOURNAMENT_ROUND_STATUS, GAME_MATCH_STATUS, getEnumValue, POINTS, TOURNAMENT_SECTION_STATUS } from '../../../../lib/enum';

const statusMap = {
  'prepared':'Prepared',
  'waiting': 'Waiting',
  'inProgress': 'In Progress',
  'finished' : 'Finished'
};
  

class TournamentSectionInfo extends React.Component {
  static propTypes = {
    section: PropTypes.objectOf(PropTypes.any),
    pairsInRounds: PropTypes.arrayOf(PropTypes.any),
    updateRobotRelease: PropTypes.func.isRequired
  };
  static defaultProps = {
    pairsInRounds: [],
    tournamentRounds: [],
    section: null
  };

  getResult = (pointOfPlayer, pointOfOpponent) => {
    if (pointOfPlayer === POINTS.WIN) {
      return GAME_MATCH_STATUS.WIN;
    } else if (pointOfPlayer === POINTS.LOSE && pointOfOpponent === POINTS.LOSE) {
      return GAME_MATCH_STATUS.NOT_JOIN;
    } else if (pointOfPlayer === POINTS.LOSE && pointOfOpponent !== POINTS.LOSE) {
      return GAME_MATCH_STATUS.LOSE;
    }
    return GAME_MATCH_STATUS.NOT_YET;
  };

  changeValue = (e) => {
    const { updateRobotRelease, section } = this.props;

    updateRobotRelease(e.target.value, section._id);
  };

  renderTabHeader = () => (
    <div className="sectionInfo--content--table__head">
      <div className="sectionInfo--content--table__head__title">Username</div>
      <div className="sectionInfo--content--table__head__title">Name</div>
      <div className="sectionInfo--content--table__head__title">Match Point</div>
      <div className="sectionInfo--content--table__head__title">Adjusted Point</div>
      <div className="sectionInfo--content--table__head__title">School Grade</div>
      <div className="sectionInfo--content--table__head__title">Gender</div>
      <div className="sectionInfo--content--table__head__title">Zipcode</div>
      <div className="sectionInfo--content--table__head__title">Robot release</div>
    </div>
  );

  renderBodyGroupContent = content => (
    <div className="sectionInfo--content--table__body__group__content">
      {content}
    </div>
  );

  renderRobot = (robot, robots, userId) => {
    if (userId === Meteor.userId()) {
      return (
        <div className="sectionInfo--content--table__body__group__content">
          <select
            className="registered-form__select"
            value={robot}
            onChange={this.changeValue}
          >
            {
              robots.map(code => (
                <option key={code._id} value={code._id}>
                  {code.releaseName}
                </option>
              ))
            }
          </select>
        </div>
      );
    }
    return (
      <div className="sectionInfo--content--table__body__group__content">
        {robots.length > 0 && (robots.find(element => element._id === robot) ? robots.find(element => element._id === robot).releaseName : "")}
      </div>
    );
  };

  renderPlayerInTotalScore = ({ username = '', profile = {}, point = 0, adjPoint = 0, _id, playGames }) => {
    const {
      firstName = '',
      lastName = '',
      grade = '',
      gender = null,
      zipcode = '',
    } = profile;
    const { robot, robots } = playGames;
    const rowClassname = classnames({
      'sectionInfo--content--table__body__group': true,
      'sectionInfo--content--table__body__group--owner': _id === Meteor.userId(),
    });
    return (
      <div className="sectionInfo--content--table__body__items">
        <div
          key={_id}
          className={rowClassname}
        >
          {/* <div className="sectionInfo--content--table__body__group__content">
            {index + 1}
          </div> */}
          {this.renderBodyGroupContent(username)}
          {this.renderBodyGroupContent(`${firstName} ${lastName}`)}
          {this.renderBodyGroupContent(point)}
          {this.renderBodyGroupContent(adjPoint)}
          {this.renderBodyGroupContent(grade)}
          {this.renderBodyGroupContent(gender)}
          {this.renderBodyGroupContent(zipcode)}
          {this.renderRobot(robot, robots, _id)}
        </div>

      </div>
    );
  };

  renderTotalScore = () => {
    const { playersList, playerRanking, section } = this.props;
    let ranking = '';

    switch (playerRanking) {
      case 1:
        ranking = `${playerRanking}st`;
        break;
      case 2:
        ranking = `${playerRanking}nd`;
        break;
      case 3:
        ranking = `${playerRanking}rd`;
        break;
      default:
        break;
    }

    return (
      <div className="sectionInfo--content--table">
        {this.renderTabHeader()}
        <div className="sectionInfo--content--table__body">
          {playersList.map(this.renderPlayerInTotalScore)}
        </div>
        {
          (playerRanking >= 1 && playerRanking <= 3
            && section.status === TOURNAMENT_SECTION_STATUS.END)
            ? (
              <div className="sectionInfo--content--table__foot">
                <span>
                  {MESSAGES(ranking).GAME_ROOM_TOURNAMENT_DATA.TOP_PLAYER}
                </span>
                <span>
                  {section
                    ? MESSAGES(section.reward[playerRanking - 1].type)
                      .GAME_ROOM_TOURNAMENT_DATA
                      .REWARD
                    : null}
                </span>
              </div>
            )
            : null
        }
      </div>
    );
  };

  renderPair = ({ player, opponent, pairStatus, point, status, winner, key, activeGameListId }) => {
    const rowClassname = classnames({
      'sectionInfo--content--table__body__group': true,
      'sectionInfo--content--table__body__group--owner': Meteor.userId() === player._id || Meteor.userId() === opponent._id,
    });
    return (
      <div
        className={rowClassname}
      >
        <div className="sectionInfo--content--table__body__group__content">
          {key}
        </div>
        <div className="sectionInfo--content--table__body__group__content">
          {player ? player.username : null}
        </div>
        {/* <div className="sectionInfo--content--table__body__group__content">
        {player ? player.playGames.rating : null}
      </div> */}
        <div className="sectionInfo--content--table__body__group__content">
          {opponent && opponent.username ? opponent.username : "BYE"}
        </div>
        {/* <div className="sectionInfo--content--table__body__group__content">
        {opponent ? opponent.playGames.rating : null}
      </div> */}
        <div className="sectionInfo--content--table__body__group__content">
          {pairStatus}
        </div>
        {/* <div className="sectionInfo--content--table__body__group__content">
        {status}
      </div> */}
        {/* <div className="sectionInfo--content--table__body__group__content">
        {point}
      </div> */}
        <div className="sectionInfo--content--table__body__group__content">
          {winner}
        </div>
        <div className="sectionInfo--content--table__body__group__content">
          <a href={"/viewrecording/" + activeGameListId}>{pairStatus == "Finished" && activeGameListId ? "View" : ""}</a>
          {/* {pairStatus == "Finished" ? (<a href=replayLink >Replay</a>) : ""} */}
        </div>
      </div>
    );
  };

  renderPairInRound = (pair, key) => {
    if (pair && pair.players.length === 0 || !pair.players[0]) {
      return <div key={key} />;
    }
    const pointOfPlayer1 = pair.players[0].point;
    const pointOfPlayer2 = pair.players[1].point;
    let winner = "None";
    if (pointOfPlayer1 > 0) {
      winner = pair.players[0].username;
    }
    if (pointOfPlayer2 > 0) {
      winner = pair.players[1].username;
    }

    return pair.players.length > 0 && (
      <div
        key={key}
        className="sectionInfo--content--table__body__items"
      >
        {this.renderPair({
          player: pair.players[0],
          opponent: pair.players[1],
          pairStatus: statusMap[pair.status], //getEnumValue(TOURNAMENT_ROUND_STATUS, pair.status),
          point: pointOfPlayer1,
          status: this.getResult(pointOfPlayer1, pointOfPlayer2),
          winner,
          key,
          activeGameListId: pair.activeGameListId
        })}
      </div>
    );
  };

  renderRound = (index) => {
    const { pairsInRounds } = this.props;
    return (
      <div className="sectionInfo--content--group">
        <div className="sectionInfo--content--table__head">
          <div className="sectionInfo--content--table__head__title">Game Index</div>
          <div className="sectionInfo--content--table__head__title">Player 1</div>
          <div className="sectionInfo--content--table__head__title">Player 2</div>
          <div className="sectionInfo--content--table__head__title">Status</div>
          <div className="sectionInfo--content--table__head__title">Winner</div>
          <div className="sectionInfo--content--table__head__title">Recording</div>
        </div>
        <div className="sectionInfo--content--table__body">
          {pairsInRounds[index] && pairsInRounds[index].map(this.renderPairInRound)}
        </div>
      </div>
    );
  };

  renderAnnouncement = (announcement, index) => {
    const { msg, createdAt } = announcement;
    return (<li key={index}>{`[ ${moment(createdAt).format('MMM DD HH:mm A')} ] ${msg}`}</li>);
  };

  renderTournamentInfo = () => {
    const { section, tournament = {} } = this.props;
    const { name, startTime, announcement = [] } = section || {};
    announcement.sort((a, b) => b.createdAt - a.createdAt);
    const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
    return (
      <div className="sectionInfo">
        <div className="sectionInfo--content--header">
          <div className="title sectionInfo--title fontSize--big textAlign--center">
            {tournament.Name || ''} - {name}
          </div>
          <div className="title sectionInfo--title fontSize--medium textAlign--center">
            {moment(startTime).tz(timeZone).format('MMM DD, HH:mm A')} {timeZone}
          </div>
        </div>
        <div className="sectionInfo--content--header">
          <div className="sectionInfo--messageBox">
            <div className="sectionInfo--messageBox--title fontSize--medium">
              Message Board
            </div>
            <div className="sectionInfo--messageBox--group">
              <ul className="sectionInfo--messageBox--content">
                {announcement.map(this.renderAnnouncement)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderTabs = (numberOfRound) => {
    const tabs = [];
    for (let i = 0; i < numberOfRound; i++) {
      tabs.push(<Tab key={i}>Round {i + 1}</Tab>);
    }
    return tabs;
  };

  renderTabPanels = (numberOfRound) => {
    const tabPanels = [];
    for (let i = 0; i < numberOfRound; i++) {
      tabPanels.push(<TabPanel key={i}>{this.renderRound(i)}</TabPanel>);
    }
    return tabPanels;
  };

  renderTable = () => {
    const { section } = this.props;
    const numberOfRounds = section ? section.numberOfRounds : 0;
    return (
      <div className="sectionInfo--table">
        <div className="sectionInfo--table--title fontSize--medium">
          Tournament's Scoreboards
        </div>
        <div className="sectionInfo--table--tabwrapper">
          <Tabs>
            <TabList>
              <Tab>Total Score</Tab>
              {
                this.renderTabs(numberOfRounds)
              }
            </TabList>
            <TabPanel>
              {this.renderTotalScore()}
            </TabPanel>
            {
              this.renderTabPanels(numberOfRounds)
            }
          </Tabs>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div aria-hidden className="sectionInfo--container">
        <div className="sectionInfo--container--wrapper">
          {this.renderTournamentInfo()}
          {this.renderTable()}
        </div>
      </div>
    );
  }
}

export default TournamentSectionInfo;
