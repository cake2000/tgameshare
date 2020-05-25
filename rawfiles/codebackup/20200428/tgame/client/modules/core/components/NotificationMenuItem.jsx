import React, { Component } from 'react';
import Notification from './Notification/Notification.jsx';
import NotificationAngle from './Notification/NotificationAngle.jsx';
import { MAX_NOTI_COUNT } from '../../../../lib/enum.js';

export default class NotificationMenuItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isNotiShow: false
    };
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', this.toggleNoti);
      window.addEventListener('touchstart', this.toggleNoti);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('click', this.toggleNoti);
      window.removeEventListener('touchstart', this.toggleNoti);
    }
  }

  toggleNoti = (event) => {
    const { target } = event;
    const notiElement = this.notiMenuItem;
    const notiDropdownElement = document.getElementById('noti-dropdown');

    if (notiElement && (target === notiDropdownElement || notiDropdownElement.contains(target))) {
      this.setState({ isNotiShow: !this.state.isNotiShow });
      return false;
    }

    if (notiElement && (target === notiElement || notiElement.contains(target))) {
      this.setState({ isNotiShow: !this.state.isNotiShow });
      return true;
    }

    this.setState({ isNotiShow: false });

    return false;
  }

  render() {
    const {
      notifications, gameList, gameRoomList,
      accept, decline, joinRoom,
      history, notiCounter, rounds, cancel,
      viewResult, userList, tournamentInfoList
    } = this.props;
    const { isNotiShow } = this.state;

    if (!Meteor.userId()) {
      return null;
    }

    return (
      <a
        className="tg-nav__menu__link noti-wrapper"
        ref={(a) => { this.notiMenuItem = a; }}
      >
        <i className="tg-icon-bell" />
        {
          notiCounter > 0 &&
          <div className="noti-counter">
            <span>{notiCounter > MAX_NOTI_COUNT ? `${MAX_NOTI_COUNT}+` : notiCounter}</span>
          </div>
        }
        <NotificationAngle
          isNotiShow={isNotiShow}
        />
        <Notification
          history={history}
          notifications={notifications}
          gameList={gameList}
          gameRoomList={gameRoomList}
          userList={userList}
          tournamentInfoList={tournamentInfoList}
          accept={accept}
          decline={decline}
          joinRoom={joinRoom}
          isNotiShow={isNotiShow}
          rounds={rounds}
          cancel={cancel}
          viewResult={viewResult}
        />
      </a>
    );
  }
}
