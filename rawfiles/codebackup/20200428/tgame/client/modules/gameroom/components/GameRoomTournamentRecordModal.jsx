import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { MESSAGES } from '../../../../lib/const.js';
import { TOURNAMENT_ROUND_STATUS, GAME_MATCH_STATUS, getEnumValue, POINTS, TOURNAMENT_SECTION_STATUS } from '../../../../lib/enum';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

const message = MESSAGES().GAME_ROOM_TOURNAMENT_DATA;


export default class GameRoomTournamentRecordModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    showResult: PropTypes.bool.isRequired,
    playerRanking: PropTypes.number.isRequired,
    playersList: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    handleModal: PropTypes.func.isRequired,
    section: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    pairsInRounds: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    tournamentRounds: PropTypes.array // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    tournamentRounds: [],
    section: null,
    pairsInRounds: [],
    playersList: []
  };

  constructor(props) {
    super(props);
    const { showResult } = this.props;
    this.state = {
      tabIndex: 0,
      showResult,
      isPageLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { section } = nextProps;
    const { showResult } = this.state;

    setTimeout(() => {
      this.setState({ isPageLoading: true });
    }, 500);
    if (section || showResult) {
      this.setState({
        tabIndex: (!showResult && (section && !(section.status === TOURNAMENT_SECTION_STATUS.END)))
          ? section.currentRound : 0
      });
    }
  }

  totalScore = () => {
    const { playersList, playerRanking, section } = this.props;
    const getPlayers = playersList.map((player, index) => (
      <div
        key={player.profile._id}
        className="tournament--info__content--table__body--row"
      >
        <div className="tournament--info__content--table__body--row__content">
          {index + 1}
        </div>
        <div className="tournament--info__content--table__body--row__content">
          {player.profile ? player.profile.username : null}
        </div>
        <div className="tournament--info__content--table__body--row__content">
          {player.profile ? player.profile.playGames.rating : null}
        </div>
        <div className="tournament--info__content--table__body--row__content">
          {player.profile ? player.point : null}
        </div>
      </div>
    ));
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
      <div className="tournament--info__content--table">
        <div className="tournament--info__content--table__head">
          <div className="tournament--info__content--table__head--content">Rank</div>
          <div className="tournament--info__content--table__head--content">Username</div>
          <div className="tournament--info__content--table__head--content">Rating</div>
          <div className="tournament--info__content--table__head--content">Point</div>
        </div>
        <div className="tournament--info__content--table__body">
          {getPlayers}
        </div>
        {
          (playerRanking >= 1 && playerRanking <= 3
            && section.status === TOURNAMENT_SECTION_STATUS.END) ?
              <div className="tournament--info__content--table__foot">
                <span>
                  {MESSAGES(ranking).GAME_ROOM_TOURNAMENT_DATA.TOP_PLAYER}
                </span>
                <span>
                  {section ?
                    MESSAGES(section.reward[playerRanking - 1].type)
                      .GAME_ROOM_TOURNAMENT_DATA
                      .REWARD
                  : null}
                </span>
              </div>
            : null
        }
      </div>
    );
  };

  renderTable = (index) => {
    const { pairsInRounds, tournamentRounds } = this.props;
    let getPairs = null;

    if (pairsInRounds[index]) {
      getPairs = pairsInRounds[index].map((pair, key) => {
        let status = '';

        if (tournamentRounds[index]) {
          if (tournamentRounds[index].pairs[key].players[0].point === POINTS.WIN) {
            status = GAME_MATCH_STATUS.WIN;
          } else if (tournamentRounds[index].pairs[key].players[0].point === POINTS.LOSE
            && tournamentRounds[index].pairs[key].players[1].point === POINTS.LOSE) {
            status = GAME_MATCH_STATUS.NOT_JOIN;
          } else if (tournamentRounds[index].pairs[key].players[0].point === POINTS.LOSE
            && tournamentRounds[index].pairs[key].players[1].point !== POINTS.LOSE) {
            status = GAME_MATCH_STATUS.LOSE;
          } else {
            status = GAME_MATCH_STATUS.NOT_YET;
          }
        }
        return (
          <div
            key={key}
            className="tournament--info__content--table__body--row"
          >
            <div className="tournament--info__content--table__body--row__content">
              {pair.players[0] ? pair.players[0].username : null}
            </div>
            <div className="tournament--info__content--table__body--row__content">
              {pair.players[0] ? pair.players[0].playGames.rating : null}
            </div>
            <div className="tournament--info__content--table__body--row__content">
              {pair.players[1] ? pair.players[1].username : null}
            </div>
            <div className="tournament--info__content--table__body--row__content">
              {pair.players[1] ? pair.players[1].playGames.rating : null}
            </div>
            <div className="tournament--info__content--table__body--row__content">
              {getEnumValue(TOURNAMENT_ROUND_STATUS, pair.status)}
            </div>
            <div className="tournament--info__content--table__body--row__content">
              {status}
            </div>
            <div className="tournament--info__content--table__body--row__content">
              {tournamentRounds[index] ?
                tournamentRounds[index].pairs[key].players[0].point
              : null}
            </div>
          </div>
        );
      });
    }
    return (
      <div className="tournament--info__content--table">
        <div className="tournament--info__content--table__head">
          <div className="tournament--info__content--table__head--content">Username</div>
          <div className="tournament--info__content--table__head--content">Rating</div>
          <div className="tournament--info__content--table__head--content">Opponent</div>
          <div className="tournament--info__content--table__head--content">{'Opponent\'s Rating'}</div>
          <div className="tournament--info__content--table__head--content">Status</div>
          <div className="tournament--info__content--table__head--content">Result</div>
          <div className="tournament--info__content--table__head--content">Point</div>
        </div>
        <div className="tournament--info__content--table__body">
          {getPairs}
        </div>
      </div>
    );
  };

  render() {
    const { isOpen, handleModal, section } = this.props;
    const { tabIndex, isPageLoading } = this.state;

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
          base: 'modal--container',
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
            <div className="tournament--info__result">
              <div className="tournament--info__header">
                <div className="tournament--info__header--title">
                  <span>{message.TOURNAMENT_GAME_ROUNDS}</span>
                </div>
                <div className="tournament--info__header--button">
                  <button onClick={e => handleModal('', e)}>
                    x
                  </button>
                </div>
              </div>
              <div className="tournament--info__content">
                <Tabs
                  selectedIndex={tabIndex}
                  onSelect={index => this.setState({ tabIndex: index })}
                >
                  <TabList>
                    <Tab>Total score</Tab>
                    {
                      section ? [...Array(section.numberOfRounds)].map((element, index) =>
                        <Tab key={index}>Round {index + 1}</Tab>
                      ) : null
                    }
                  </TabList>
                  <TabPanel>
                    {this.totalScore()}
                  </TabPanel>
                  {
                    section ? [...Array(section.numberOfRounds)].map((element, index) => (
                      <TabPanel key={index}>
                        {this.renderTable(index)}
                      </TabPanel>
                    )) : null
                  }
                </Tabs>
              </div>
            </div>
        }
      </Modal>
    );
  }
}
