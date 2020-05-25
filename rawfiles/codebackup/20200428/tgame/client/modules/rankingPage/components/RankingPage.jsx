import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactModal from 'react-modal';
import _ from 'lodash';
import Select from 'react-select';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import GameSelection from '../../core/containers/GameSelection';
import ChallengePopup from './ChallengePopup.jsx';
import RequireLoginPopup from './RequireLoginPopup.jsx';
import PlayerItem from './PlayerItem.jsx';
import { MIGRATION_CONST, PAYMENT_PRO } from '../../../../lib/enum';
import PlayerBasicInfo from '../containers/PlayerBasicInfo.js';
import { NavLink } from 'react-router-dom';

const NO_BOT_RELEASE = "no-bot-selected-special-value-IUYDFSW";

const customePlayerInfoPopupStyles = {
  content: {
    height: 615,
    padding: 40,
    borderRadius: 10,
    border: '2px solid #5076A4',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 1000
  }
};

function flattenLeaderboards(leaderboards = []) {
  return _.reduce(leaderboards, (players, rankLevel) => {
    return [...players, ..._.map(rankLevel.hits.players, player => ({ ...player, rankingNumber: rankLevel.rankingNumber }))];
  }, []);
}

class RankingPage extends Component {
  static defaultProps = {
    history: null,
    officialBotReleases: []
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoadingPlayers: true,
      filter: {
        gameId: ''
      },
      limit: 10,
      players: [],
      userRanking: 0,
      isOpenChallengePopup: false,
      isChallengeManually: false,
      isOpenRequireLoginPopup: false,
      isOpenPlayerBasicInfoPopup: false,
      game: null,
      botRelease: NO_BOT_RELEASE,
      opponent: {},
      selectedSchool: 'All'
    };
  }

  componentDidMount() {
    Meteor.call('getSchools', '', 'leaderBoard', (err, res) => {
      if (!err) {
        this.setState({ schools: res });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      filter, limit, isLoadingPlayers, botRelease
    } = this.state;

    if (prevState.filter !== filter || prevState.limit !== limit || prevState.botRelease !== botRelease) {
      if (!isLoadingPlayers) {
        this.fetchLeaderboard();
      }
    }

    const { officialBotReleases } = this.props;
    const haveOfficialBotReleases = Boolean(officialBotReleases && officialBotReleases.length > 0);

    if (haveOfficialBotReleases) {
      // Run once at the first time
      this.autoSetBotRelease(filter.gameId);
    }

    // Change the filter game, change the bot version
    // But now, we have only 1 game in the leaderboard
    if (_.get(prevState, 'filter.gameId') !== _.get(filter, 'gameId')) {
      this.isAutoSelectedBotVersion = false;
      this.autoSetBotRelease(filter.gameId);
    }
  }

  setBotRelease = (botId) => {
    const { filter: { gameId } } = this.state;
    Meteor.call('setOfficialBotRelease', botId, gameId);
    this.setState({ botRelease: botId });
  }

  autoSetBotRelease = (gameId) => {
    const { officialBotReleases } = this.props;

    if (_.isEmpty(officialBotReleases) || this.isAutoSelectedBotVersion) {
      // if (this.state.botRelease !== NO_BOT_RELEASE) { this.setState({ botRelease: NO_BOT_RELEASE }); }
      return;
    }

    const selectedOfficialBotRelease = _.find(officialBotReleases, r => r.gameId === gameId);
    if (selectedOfficialBotRelease) {
      if (selectedOfficialBotRelease.botId !== this.state.botRelease) {
        // console.log("set new botRelease " + selectedOfficialBotRelease.botId);
        this.setState({ botRelease: selectedOfficialBotRelease.botId });
      }
    } else {
      this.setState({ botRelease: NO_BOT_RELEASE });
    }

    this.isAutoSelectedBotVersion = true;
  }

  toggleChallengePopup = (isOpenChallengePopup = true, isChallengeManually = true, opponent = {}) => {
    this.setState({ isOpenChallengePopup, isChallengeManually, opponent });
  }

  toggleRequireLoginPopup = (isOpenRequireLoginPopup = true) => {
    this.setState({ isOpenRequireLoginPopup });
  }

  openChallengeBot = (opponent) => {
    if (Meteor.userId()) {
      this.toggleChallengePopup(true, false, opponent);
    } else {
      this.toggleRequireLoginPopup(true);
    }
  }

  openChallengeManually = (opponent) => {
    if (Meteor.userId()) {
      this.toggleChallengePopup(true, true, opponent);
    } else {
      this.toggleRequireLoginPopup(true);
    }
  }

  onSelectGame = async (game) => {
    const gameId = _.get(game, '_id');
    const { selectedSchool } = this.state;

    this.setState(preState => ({
      filter: {
        ...preState.filter,
        gameId
      },
      limit: 10,
      game
    }));

    await this.fetchLeaderboard({ gameId, school: selectedSchool._id });
  };

  fetchLeaderboard = async (_filter, _limit) => {
    const { filter: filterState, limit: limitState } = this.state;
    this.setState({ isLoadingPlayers: true });

    const filter = _filter || filterState;
    const limit = _limit || limitState || 10;

    Meteor.call('rankingPage.filterTopPlayers', filter, limit, (error, response) => {
      if (error) {
        console.error('Error while fetching leaderboard:', error);
        console.error('Params:', { filter, limit });
      }
      const { leaderboardResults = [], userRanking = 0 } = response;
      this.setState({
        players: flattenLeaderboards(leaderboardResults),
        userRanking,
        isLoadingPlayers: false
      });
    });
  }

  renderPlayers = () => {
    const { players, isLoadingPlayers } = this.state;
    const { botRelease } = this.state;
    if (isLoadingPlayers) return null;

    if (players && players.length > 0) {
      return (
        <div className="players">
          { _.map(players, player => (
            <PlayerItem
              key={player._id}
              player={player}
              myBotRelease={botRelease}
              openChallengeBot={this.openChallengeBot}
              openChallengeManually={this.openChallengeManually}
              openPlayerBasicInfo={this.openPlayerBasicInfoPopup}
            />
          ))}
        </div>
      );
    }

    return <div className="emptyPlayers"><span>No player listed yet</span></div>;
  }

  handleChangeBotRelease = (e) => {
    if (_.get(e, 'target.value')) {
      const botRelease = e.target.value;
      this.setBotRelease(botRelease);
    }
  }

  openPlayerBasicInfoPopup = (playerId) => {
    const { loadPlayerBasicInfo } = this.props;
    loadPlayerBasicInfo(playerId);
    this.setState({ isOpenPlayerBasicInfoPopup: true });
  }

  closePlayerBasicInfoPopup = () => {
    this.setState({ isOpenPlayerBasicInfoPopup: false });
  }

  getNoBotSelected() {
    const {
      isLoadingPlayers, filter: { gameId }, limit, players, userRanking,
      isOpenChallengePopup, isChallengeManually, isOpenRequireLoginPopup,
      game, opponent, botRelease
    } = this.state;
    const { officialBotReleases } = this.props;
    if (!officialBotReleases) return true;
    if (officialBotReleases.length == 0) return true;
    return false;
  }


  getIsSelected(botid) {
    const {
      isLoadingPlayers, filter: { gameId }, limit, players, userRanking,
      isOpenChallengePopup, isChallengeManually, isOpenRequireLoginPopup,
      game, opponent, botRelease
    } = this.state;
    const { officialBotReleases } = this.props;
    for (let k = 0; k < officialBotReleases.length; k++) {
      if (officialBotReleases[k].gameId == gameId) {
        return officialBotReleases[k].botId == botid;
      }
    }
    return false;
  }

  getDefaultSelection() {
    const {
      isLoadingPlayers, filter: { gameId }, limit, players, userRanking,
      isOpenChallengePopup, isChallengeManually, isOpenRequireLoginPopup,
      game, opponent, botRelease
    } = this.state;
    const { officialBotReleases } = this.props;
    if (!officialBotReleases || officialBotReleases.length == 0) return NO_BOT_RELEASE;
    for (let k = 0; k < officialBotReleases.length; k++) {
      if (officialBotReleases[k].gameId == gameId) {
        return officialBotReleases[k].botId;
      }
    }
    return NO_BOT_RELEASE;
  }

  getRatingForGame(gameId) {
    const user = Meteor.user();
    if (!user.playGames) return 50;
    for (let k=0; k<user.playGames.length; k++) {
      const p = user.playGames[k];
      if (p.gameId == gameId) {
        return p.rating;
      }
    }
    return 50;
  }

  handleLoadSchools = (value) => {
    if (value.trim().length > 0) {
      Meteor.call('getSchools', value.trim(), 'leaderBoard', (err, res) => {
        if (!err) {
          this.setState({ schools: res });
        }
      });
    }
  };

  handleSelectSchool = async (value) => {
    const { filter } = this.state;
    this.setState({ selectedSchool: value });
    await this.fetchLeaderboard({ gameId: filter.gameId, school: value._id });
  };

  render() {
    const {
      isLoadingPlayers, filter: { gameId }, limit, players, userRanking,
      isOpenChallengePopup, isChallengeManually, isOpenRequireLoginPopup,
      game, opponent, botRelease, isOpenPlayerBasicInfoPopup, schools, selectedSchool
    } = this.state;
    const { botReleases, officialBotReleases, games } = this.props;
    const botReleasesByGameId = _.filter(botReleases, bot => bot.gameId === gameId);
    const userId = Meteor.userId();
    const { accountType, isGrandfathered } = Meteor.user();
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered;

    return (
      <div className="tg-page tg-page--general tg-page--ranking">
        <div className={["ranking-block", isOpenChallengePopup || isOpenRequireLoginPopup ? "hide-table" : ''].join(' ')}>
          <div className="ranking__header">
            <h5 className="ranking__header__title">
              <img src="/img_v2/Icon-NLB@2x.png" alt="National Leaderboard" />
              <span>National Leaderboard</span>
            </h5>
            <div className="ranking__header__filterGames">
              <GameSelection
                listGames={games}
                // listGames={[{ _id: MIGRATION_CONST.poolGameId, imageUrl: "/images/poolscreenicon2.png", title: "Trajectory Pool" }]}
                onSelect={_game => this.onSelectGame(_game)}
                value={gameId}
              />
              <Select
                className="Select--gameSelect"
                searchable
                placeholder="School"
                onInputChange={this.handleLoadSchools}
                labelKey="SchoolName"
                valueKey="_id"
                options={schools}
                value={selectedSchool}
                onChange={this.handleSelectSchool}
              />
            </div>
            <div className="ranking__header__state">
              {
                !isPremium ? 'Rating is only available for premium account users.'
                  : (userId && (
                    <span>
                      Your Rating: &nbsp;
                      {this.getRatingForGame(gameId)}
                    </span>)
                  )
              }
            </div>
            <div className="ranking__header__selectBot">
              <span>Set your official bot:</span>
              {' '}
              <br />
              <select
                style={{ marginTop: "10px", backgroundColor: isPremium ? '#88e488' : '#9b9b9b' }}
                value={botRelease}
                onChange={this.handleChangeBotRelease}
                disabled={!isPremium}
              >
                <option value={NO_BOT_RELEASE}>{botReleasesByGameId && botReleasesByGameId.length > 0 ? "No bot specified" : "No bot release found"}</option>
                { botReleasesByGameId && botReleasesByGameId.length > 0
                  && _.map(botReleasesByGameId, bot => (
                    <option value={bot._id} key={bot._id}>{bot.releaseName}</option>
                  ))
                }
              </select>
              {
                !isPremium && (
                  <div className="ranking__header__selectBot--premiumWarning">
                    <NavLink to="/account-management">
                      <span>Premium account only</span>
                    </NavLink>
                  </div>
                )
              }
            </div>
          </div>
          <div className="ranking__table">
            <div className="ranking__table__title">
              <div className="ranking__table__title__number">Ranking</div>
              <div className="ranking__table__title__rating">Rating</div>
              <div className="ranking__table__title__fullname">Player</div>
              <div className="ranking__table__title__coin">Gold Coins</div>
              <div className="ranking__table__title__battle">Official Battles</div>
              <div className="ranking__table__title__challenge">Challenge It!</div>
            </div>
            <div className="ranking__table__content">
              { isLoadingPlayers ? <div className="ranking__table__content__loading"><LoadingIcon /></div> : this.renderPlayers() }
              {/* { limit === 10 && players.length === 10 && (
              <button className="btn btn-default btn-default--loading" onClick={() => this.setState({ limit: 100 })} type="button">
                <i className="fa fa-angle-double-down" aria-hidden="true" />
                {' '}
                &nbsp; Top 100 players
              </button>
              ) } */}
            </div>
          </div>
        </div>
        <ReactModal
          isOpen={isOpenPlayerBasicInfoPopup}
          onRequestClose={this.closePlayerBasicInfoPopup}
          shouldCloseOnOverlayClick
          style={{
            overlay: {
              backgroundColor: isOpenChallengePopup ? 'none' : 'rgba(255, 255, 255, 0.75)'
            },
            content: {
              ...customePlayerInfoPopupStyles.content,
              opacity: isOpenChallengePopup ? 0 : 1
            }
          }}
        >
          <div className="modal__header">
            <div className="modal__header--close Player-basic-info__close" onClick={this.closePlayerBasicInfoPopup} role="presentation">x</div>
          </div>
          <PlayerBasicInfo
            botRelease={botRelease}
            openChallengeBot={this.openChallengeBot}
            openChallengeManually={this.openChallengeManually}
          />
        </ReactModal>
        <ChallengePopup
          isOpen={isOpenChallengePopup}
          isAIBattle={!isChallengeManually}
          botRelease={botRelease}
          botReleases={botReleases}
          onClose={() => this.toggleChallengePopup(false)}
          game={game}
          opponent={opponent}
          reloadRanking={this.fetchLeaderboard}
          isMissingMyBot={Boolean(!botReleasesByGameId || botReleasesByGameId.length === 0)}
        />
        <RequireLoginPopup
          isOpen={isOpenRequireLoginPopup}
          onClose={() => this.toggleRequireLoginPopup(false)}
        />
      </div>
    );
  }
}

export default RankingPage;
