/* global Roles */
import React from 'react';
import moment from 'moment';
import ReactTable from 'react-table';
import { arrayOf, bool, shape, func } from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import 'react-table/react-table.css';
import { GAME_INVITE_STATUS, GAME_CONFIG_OPTION, OPPONENTS, ROLES } from '../../../../../lib/enum';
import { checkUserInGame } from '../../../../../lib/util';

class PlayerRecentGames extends React.Component {
  static propTypes = {
    loading: bool.isRequired,
    invitationLogs: arrayOf(shape()).isRequired,
    history: shape({}).isRequired,
    decline: func.isRequired,
    accept: func.isRequired,
    createGameRoom: func.isRequired,
    invitePlayer: func.isRequired,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  handleClickAccept = (roomId, notiId) => {
    const { accept, history } = this.props;

    accept(roomId, notiId, history);
  };

  handleClickDecline = (roomId, notiId) => {
    const { decline } = this.props;

    decline(roomId, notiId);
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

  render() {
    const { invitationLogs } = this.props;
    const styleColumn = {
      style: {
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };

    const columns = [{
      Header: 'Player',
      id: 'player',
      accessor: item => item['user_invite'].name,
      ...styleColumn,
      width: 100,
    }, {
      Header: 'Date/Time',
      id: 'date/time',
      width: 170,
      ...styleColumn,
      accessor: item => moment(item.createdAt).format('MMMM DD YYYY, HH:mma'),
    }, {
      Header: 'My Role',
      id: 'direction',
      ...styleColumn,
      accessor: item => (item.sender.userId === Meteor.userId() ? 'Host' : 'Guest'),
      width: 80,
    }, {
      Header: 'Game/Level',
      id: 'game',
      ...styleColumn,
      accessor: item => `${item.game.name} / ${item.gameLevel}`,
      width: 210,
    }, {
      Header: 'Mode',
      id: 'mode',
      ...styleColumn,
      accessor: 'mode',
    }, {
      Header: 'Status',
      id: 'status',
      ...styleColumn,
      accessor: item =>
        ((item.sender.userId === Meteor.userId() && item.status === GAME_INVITE_STATUS.HOST_CANCEL)
        || item.status !== GAME_INVITE_STATUS.HOST_CANCEL ?
        item.status
        : 'Missed')
    }, {
      Header: 'Action',
      accessor: item => item,
      id: 'action',
      Cell: ({ value }) => (
        <div className="invitation-action-buttons">
          {
            value.sender.userId !== Meteor.userId() && value.status === GAME_INVITE_STATUS.WAITING ?
              <div className="invite-button-group">
                <button
                  className="inviteButton inviteButton--accept"
                  onClick={() => this.handleClickAccept(value.entityId, value._id)}
                >
                  Accept
                </button>
                <button
                  className="inviteButton inviteButton--decine"
                  onClick={() => this.handleClickDecline(value.entityId, value._id)}
                >
                  X
                </button>
              </div>
            :
              <div>
                { !_.get(value.user_invite, 'status.online') && <button className="buttonDisabled" disabled>Player Offline</button> }
                { checkUserInGame(value.user_invite.userInPage) && <button className="buttonDisabled" disabled>Player In a Game</button> }
                { _.get(value.user_invite, 'status.online') && (!checkUserInGame(value.user_invite.userInPage)) && <button onClick={() => { this.handleInvite(value); }}>Invite Now</button> }
              </div>
          }
        </div>
      ),
    }];
    const { loading } = this.props;
    return (
      <div className="player-recent-games player-list">
        <div className="recent-games-header recent-list-items">
          <span />
          <div className="recent-games-title">
            Recent Online Games
          </div>
          <Link className="right-link recent-more-info-button" to="/invitationLogs">More</Link>
        </div>
        <div className="recent-games-table recent-list-items">
          {
            !loading && <ReactTable
              NoDataComponent={() => null}
              showPagination={false}
              style={{ width: 'calc(100vw - 30px)', maxWidth: 960 }}
              defaultPageSize={invitationLogs.length}
              data={invitationLogs}
              columns={columns}
              className="recent-games-table-list"
            />
          }
        </div>
      </div>
    );
  }
}

export default PlayerRecentGames;
