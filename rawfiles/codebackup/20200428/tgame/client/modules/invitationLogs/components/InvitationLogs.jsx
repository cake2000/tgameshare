/* global Roles */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table';
import _ from 'lodash';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import {
  GAME_CONFIG_OPTION,
  GAME_INVITE_STATUS,
  INVITATION_LOGS_GAME_TYPE,
  OPPONENTS,
  ROLES, TOURNAMENT_ROUND_STATUS
} from '../../../../lib/enum';
import { checkUserInGame } from '../../../../lib/util';
import 'react-table/react-table.css';

class InvitationLogs extends Component {
  static propTypes = {
    accept: PropTypes.func.isRequired,
    decline: PropTypes.func.isRequired,
    joinRoom: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    createGameRoom: PropTypes.func.isRequired,
    invitePlayer: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    history: PropTypes.object // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    history: null,
    isLoading: true
  };

  constructor(props) {
    super(props);

    this.state = {
      disableLoadmore: false,
      keyword: '',
      limit: 10,
      invitationLogs: [],
      originalIvitationLogs: []
    };
  }

  componentDidMount() {
    this.markInviteNotifyAsRead();
  }

  componentWillMount() {
    const { fetchInvitationLogs } = this.props;
    fetchInvitationLogs(10, (res) => {
      this.setState({
        invitationLogs: res,
        originalIvitationLogs: res
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps, prevState) {
    const { limit } = this.state;
    if (limit !== prevState.limit) {
      this.markInviteNotifyAsRead();
    }
  }

  markInviteNotifyAsRead = () => {
    const { setAllNotiAsRead } = this.props;
    setAllNotiAsRead();
  }

  handleClickAccept = (entityId, notiId, pairData) => {
    const { accept, history, joinRoom } = this.props;

    if (pairData) {
      joinRoom(pairData, entityId, notiId, history);
    } else {
      accept(entityId, notiId, history);
    }
  };

  handleClickDecline = (entityId, notiId, pairData) => {
    const { decline, cancel } = this.props;

    if (pairData) {
      cancel(pairData, notiId);
    } else {
      decline(entityId, notiId);
    }
  };

  handleInvite = (log) => {
    const { createGameRoom, invitePlayer } = this.props;
    const isAI = Roles.userIsInRole(Meteor.userId(), ROLES.AI);
    const playerInfo = [
      {
        teamID: '0',
        playerType: isAI ? GAME_CONFIG_OPTION.AI : GAME_CONFIG_OPTION.HUMAN,
        userId: Meteor.userId(),
        ready: !isAI
      },
      {
        teamID: '1',
        playerType: GAME_CONFIG_OPTION.DEFAULT,
        ready: false
      }
    ];
    const gameData = {
      owner: Meteor.userId(),
      gameId: log.game.id,
      level: log.gameLevel,
      mode: OPPONENTS.PLAYERNETWORK.name,
      playerInfo
    };

    createGameRoom(gameData, (gameRoomId) => {
      if (gameRoomId) {
        const invitedPlayerInfo = {
          userId: log.user_invite.id,
          gameRoomId,
          teamID: '1'
        };

        invitePlayer(invitedPlayerInfo, (notiId) => {
          this.props.history.push(OPPONENTS.PLAYERNETWORK.link, { notiId });
        });
      }
    });
  };

  handleChangeInput(keyword) {
    const { invitationLogs, originalIvitationLogs } = this.state;
    this.setState({ keyword, disableLoadmore: false });
    let filteredInvitationLogs = invitationLogs;
    const lowerCaseKeyWord = keyword.toLowerCase();
    if (keyword !== '') {
      filteredInvitationLogs = _.filter(originalIvitationLogs, (item) => {
        const { game, gameLevel, user_invite: { name } } = item;
        return (
          game.name.toLowerCase().indexOf(lowerCaseKeyWord) !== -1
          || gameLevel.toLowerCase().indexOf(lowerCaseKeyWord) !== -1
          || name.toLowerCase().indexOf(lowerCaseKeyWord) !== -1
        );
      });
      if (JSON.stringify(invitationLogs) !== JSON.stringify(filteredInvitationLogs)) {
        this.setState({ invitationLogs: filteredInvitationLogs });
      }
    } else if (JSON.stringify(invitationLogs) !== JSON.stringify(originalIvitationLogs)) {
      this.setState({ invitationLogs: originalIvitationLogs });
    }
  }

  handleLoadMore = () => {
    const { fetchInvitationLogs } = this.props;
    const { limit } = this.state;
    this.setState({ keyword: '' });
    fetchInvitationLogs(limit + 10, (res) => {
      this.setState({
        invitationLogs: res,
        originalIvitationLogs: res,
        limit: limit + 10
      });
    });
  };

  render() {
    const { isLoading } = this.props;
    const { invitationLogs, disableLoadmore } = this.state;
    const styleColumn = {
      style: {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      headerStyle: {
        borderBottom: '1px solid white'
      }
    };
    const columns = [{
      Header: 'Player',
      id: 'player',
      accessor: item => item['user_invite'].name,
      width: 140,
      ...styleColumn
    }, {
      Header: 'Date/Time',
      id: 'date/time',
      width: 170,
      ...styleColumn,
      accessor: item => moment(item.createdAt).format('MMM DD YY, HH:mm a')
    }, {
      Header: 'My Role',
      id: 'direction',
      ...styleColumn,
      accessor: item => (item.sender.userId === Meteor.userId() ? 'Host' : 'Guest'),
      width: 80
    }, {
      Header: 'Game/Level',
      id: 'game',
      ...styleColumn,
      accessor: item => `${item.game.name} / ${item.gameLevel}`,
      width: 210
    }, {
      Header: 'Mode',
      id: 'mode',
      ...styleColumn,
      accessor: 'mode'
    }, {
      Header: 'Game Type',
      id: 'gameType',
      ...styleColumn,
      accessor: item => item.gameType
    }, {
      Header: 'Status',
      id: 'status',
      ...styleColumn,
      accessor: (item) => {
        if ((item.sender.userId === Meteor.userId() && item.status === GAME_INVITE_STATUS.HOST_CANCEL)
          || item.status !== GAME_INVITE_STATUS.HOST_CANCEL) {
          if (!item.pairData) return 'Terminated';
          const pairStatus = item.pairData.players.find(player => (player.playerId === Meteor.userId() && player.cancelTournament));
          if (item.pairData && !pairStatus) {
            return TOURNAMENT_ROUND_STATUS.ARRAY_OBJECT.find(element => element.key === item.pairData.status).value;
          } if (pairStatus) {
            return 'Cancelled';
          }
          return item.status;
        }
        return 'Missed';
      }
    }, {
      Header: 'Action',
      ...styleColumn,
      accessor: item => item,
      id: 'action',
      Cell: ({ value }) => {
        const invitationTournamentStatus = value.status === TOURNAMENT_ROUND_STATUS.WAITING && !value.pairData.players.find(player => (player.playerId === Meteor.userId() && player.cancelTournament));

        return (
          <div className="invitation-action-buttons">
            {
              value.sender.userId !== Meteor.userId()
                && (value.status === GAME_INVITE_STATUS.WAITING || invitationTournamentStatus)
                ? (
                  <div className="invite-button-group">
                    <button
                      className="inviteButton inviteButton--accept"
                      onClick={() => this.handleClickAccept(value.entityId, value._id, value.pairData)}
                    >
                      {value.gameType === INVITATION_LOGS_GAME_TYPE.ONLINE ? 'Accept' : 'Join'}
                    </button>
                    <button
                      className="inviteButton inviteButton--decine"
                      onClick={() => this.handleClickDecline(value.entityId, value._id, value.pairData)}
                    >
                    X
                    </button>
                  </div>
                )
                : (
                  <div>
                    {!_.get(value.user_invite, 'status.online') && <button className="buttonDisabled" disabled>Player Offline</button>}
                    {(checkUserInGame(value.user_invite.userInPage)) && <button className="buttonDisabled" disabled>Player In a Game</button>}
                    {_.get(value.user_invite, 'status.online') && (!checkUserInGame(value.user_invite.userInPage)) && <button onClick={() => { this.handleInvite(value); }}>Invite Now</button>}
                  </div>
                )
            }
          </div>
        );
      }
    }];

    return (
      <div className="invitationLog" id="invitations">
        <center><h2 className="invitationLog-title">Invitation Log</h2></center>
        <div className="invitationLog--content">
          <div className="invitationLog--content__header">
            <input
              type="text"
              placeholder="Player name, game, level"
              value={this.state.keyword}
              onChange={e => this.handleChangeInput(e.target.value)}
              className="invitationLog-search"
            />
            <i className="fa fa-search" aria-hidden="true" />
          </div>
          <ReactTable
            NoDataComponent={() => null}
            showPagination={false}
            style={{ width: 'calc(100vw - 30px)', maxWidth: 1135 }}
            pageSize={invitationLogs.length}
            data={invitationLogs}
            columns={columns}
            className="invitationLog-table-list"
          />
          {
            isLoading
            && (
            <div className="invitationLog--content__body--wrapper__body--loading">
              <LoadingIcon
                height="50px"
              />
            </div>
            )
          }
          {
            (!disableLoadmore && !isLoading)
            && (
            <div className="invitationLog--content__body--button">
              <button
                className="invitationLog-load-more"
                onClick={() => this.handleLoadMore()}
                disabled={isLoading ? 'disabled' : null}
              >
                Load more
              </button>
            </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default InvitationLogs;
