/* globals Roles, DocHead */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { NavLink, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MAX_NOTI_COUNT, NOTIFICATION, NOTIFICATION_ACTION, PAYMENT_PRO, ROLES, USER_TYPES
} from '../../../../lib/enum';
import NotificationToastItem from './Notification/NotificationToast/NotificationToastItem.jsx';
import NotificationToastInvite from '../containers/NotificationToastInvite';
import { getTitleNameByRoute } from '../../../../lib/util';
import AgeConfirm from '../../account/components/AgeConfirm.jsx';
import NotificationTournamentItem from './Notification/NotificationTournamentItem.jsx';
import NotificationFinishTournament from './Notification/NotificationFinishTournament.jsx';

const FORUM_URL = "https://forum.tgame.ai/";

const checkIfNotificationChanged = (preNoti, noti) => {
  const last3PreNoti = _.take(_.orderBy(preNoti, ['createdAt'], ['desc']), 3).map(item => item._id);
  const last3Noti = _.take(_.sortBy(noti, ['createdAt'], ['desc']), 3).map(item => item._id);
  if (last3PreNoti.length !== last3Noti.length) {
    return true;
  }
  const unionLen = _.union(last3PreNoti, last3Noti).length;
  return unionLen === last3Noti.length;
};
const emptyRounds = [];
const emptyNotifications = [];
const emptyTournamentInfoList = [];
class TopNavBarHomePage extends PureComponent {
  static propTypes = {
    rounds: PropTypes.array // eslint-disable-line react/forbid-prop-types
  };

  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.shape()),
    tournamentInfoList: PropTypes.arrayOf(PropTypes.shape()),
    // isProfessionalUser: PropTypes.bool,
    unReadSupportChatCount: PropTypes.number,
    invitationNotifyCount: PropTypes.number
  }

  static defaultProps = {
    rounds: emptyRounds,
    notifications: emptyNotifications,
    tournamentInfoList: emptyTournamentInfoList,
    // isProfessionalUser: true,
    unReadSupportChatCount: 0,
    invitationNotifyCount: 0
  };

  constructor(props) {
    super(props);

    this.state = {
      showModalComingSoon: false,
      showAgeConfirmSignUp: false,
      isShowUserMenu: false
    };

    this.toastId = [];
    this.showDropdownMenu = this.showDropdownMenu.bind(this);
    this.hideDropdownMenu = this.hideDropdownMenu.bind(this);
  }

  showDropdownMenu() {
    this.setState({ isShowUserMenu: true }, () => {
      document.addEventListener('click', this.hideDropdownMenu);
    });
  }

  hideDropdownMenu() {
    this.setState({ isShowUserMenu: false }, () => {
      document.removeEventListener('click', this.hideDropdownMenu);
    });
  }

  componentDidUpdate(prevProps) {
    const { invitationNotifyCount, notifications } = this.props;
    const { invitationNotifyCount: preAllNotisCount, notifications: preNotifications } = prevProps;
    const pathname = _.get(this.props, 'history.location.pathname', null);
    const prePathName = _.get(prevProps, 'history.location.pathname', null);

    // change head title
    if (preAllNotisCount !== invitationNotifyCount || pathname !== prePathName) {
      const title = getTitleNameByRoute(pathname);
      const fullTitle = invitationNotifyCount > 0
        ? `(${invitationNotifyCount}) ${title}`
        : title;
      DocHead.setTitle(fullTitle);
    }

    // check allNotis
    if (notifications !== preNotifications) {
      const isNotificationChanged = checkIfNotificationChanged(preNotifications, notifications);
      if (isNotificationChanged) {
        this.showToast(preNotifications);
      }
    }
  }

  getOptionToastByNotiType = (notitype) => {
    const option = {};
    switch (notitype) {
      case NOTIFICATION.INVITE_TO_PLAY_GAME:
        option.autoClose = false;
        option.pauseOnHover = false;
        option.closeButton = false;
        option.closeOnClick = false;
        break;
      default: {
        option.autoClose = false;
        option.pauseOnHover = true;
        break;
      }
    }
    return option;
  };

  showToast = (prevNotifications) => {
    const {
      notifications, acceptClick, declineClick, clearErrors
    } = this.props;
    const reverseNoti = Array(...notifications).reverse();
    const prevReverseNotis = Array(...prevNotifications).reverse();
    if (acceptClick) {
      if (this.toastId && this.toastId.length > 0) {
        toast.dismiss();
        this.toastId = [];
      }
      clearErrors();
      return;
    }
    if (declineClick) {
      const dt = this.toastId.find(item => item.notiId === declineClick);
      if (dt && dt.toastId) {
        toast.dismiss(dt.toastId);
      }
      this.toastId = this.toastId.filter(item => item.notiId !== declineClick);
      clearErrors();
    }
    this.toastId = this.toastId.filter((item) => {
      const toastItem = notifications.find(noti => noti._id === item.notiId);
      if (!toastItem) {
        toast.dismiss(item.toastId);
      }
      return toastItem;
    });
    reverseNoti.map((notification, key) => {
      const existedId = this.toastId.find(item => item.notiId === notification._id);
      if (!existedId || (prevReverseNotis[key] || {})._id !== notification._id) {
        const renderToast = this.renderToastComponent(notification, key);
        if (renderToast) {
          if (!existedId) {
            this.toastId.push({
              toastId: toast(renderToast, {
                closeButton: false,
                position: toast.POSITION.BOTTOM_RIGHT,
                ...this.getOptionToastByNotiType(notification.entityType)
              }),
              notiId: notification._id
            });
          } else {
            toast.update(existedId.toastId, {
              render: renderToast
            });
          }
        }
      }
      return null;
    });
  };

  toggleModal = () => this.setState(prevState => ({
    showModalComingSoon: !prevState.showModalComingSoon
  }));

  craftToastMessage = (notitype) => {
    switch (notitype) {
      case NOTIFICATION.INVITE_TO_PLAY_GAME:
        return 'You have a new invitation to play game';
      case NOTIFICATION.TOURNAMENT_INVITE:
        return 'You have a new invitation to join tournament';
      case NOTIFICATION.FINISH_TOURNAMENT:
        return 'Tournament has ended! Thank you for your participation';
      default:
        return 'You have a new notification';
    }
  };

  handleLogout = () => {
    Meteor.logout(() => {
      this.props.history.push('/signin');
    });
    this.setState({ isShowUserMenu: false });
    return false;
  };

  handleGoToTournament = () => {
    this.props.history.push('/tournament/uN9W4QhmdKu94Qi2Y');
    this.setState({ isShowUserMenu: false });
    return false;
  };

  handleSelectGameNavLinkMobile = () => {
    this.handleSelectGameNavLink();
  }

  handleSelectGameNavLink = () => {
    const { clearGameBoardData } = this.props;

    clearGameBoardData();
  }

  checkChatOneOne = () => {
    const user = Meteor.user();
    if (user && user.roles && user.roles[0]) {
      const role = user.roles[0];
      // Should check more about payments in here
      if ([ROLES.AI, ROLES.MANUAL].indexOf(role) !== -1) {
        return true;
      }
    }
    return false;
  };

  handleClickTournament = () => {
    toast(<NotificationToastItem msg="The pro user account will be available soon." />, {
      position: toast.POSITION.BOTTOM_RIGHT,
      autoClose: 3000
    });
  };

  userProfileDropdown = () => {
    const { isShowUserMenu } = this.state;
    const { unReadSupportChatCount, invitationNotifyCount } = this.props;
    const totalNotifyCount = unReadSupportChatCount + invitationNotifyCount;
    const userId = Meteor.userId();
    const user = Meteor.user();
    const userName = _.get(user, 'profile.firstName') || _.get(user, 'username');
    const { accountType, isGrandfathered } = user || {};
    const isPremium = PAYMENT_PRO.includes(accountType) || isGrandfathered;

    if (userId) {
      return (
        <div className="tg-nav__menu__dropdown" onClick={this.showDropdownMenu} role="presentation">
          <div className="user-right" role="presentation">
            <span>
              <img alt="man user" src="/images/man-user.svg" />
              {userName}
            </span>
            {totalNotifyCount > 0 && <number>{totalNotifyCount > MAX_NOTI_COUNT ? `${MAX_NOTI_COUNT}+` : totalNotifyCount}</number>}
            { isShowUserMenu
              && (
              <div className="sub-menu-right">
                <div className="list-sub-menu">
                  <NavLink to="/account-management">
                    <span>Account Management</span>
                  </NavLink>
                  {
                    isPremium && (
                      <NavLink to="/referral">
                        <span>Invite a friend</span>
                      </NavLink>
                    )
                  }
                  <NavLink to="/changepassword">
                    <span>Change Password</span>
                  </NavLink>
                  {/* <NavLink to="/message-activity">
                    <span>Q & A</span>
                    {unReadSupportChatCount > 0 && <number>{unReadSupportChatCount > MAX_NOTI_COUNT ? `${MAX_NOTI_COUNT}+` : unReadSupportChatCount}</number>}
                  </NavLink> */}
                  <NavLink to="/invitationLogs">
                    <span>Online game invitation</span>
                    {invitationNotifyCount > 0 && <number>{invitationNotifyCount > MAX_NOTI_COUNT ? `${MAX_NOTI_COUNT}+` : invitationNotifyCount}</number>}
                  </NavLink>
                  <a href="#" className="" onClick={this.handleGoToTournament}>Past Tournaments</a>
                  <NavLink to="/about">About</NavLink>
                  <a href="#" className="log-out" onClick={this.handleLogout}>Log Out</a>
                </div>
              </div>
              )
            }
          </div>
        </div>
      );
    }

    return null;
  };

  notiMenuITem = () => {
    if (!Meteor.userId()) return null;
    const { invitationNotifyCount } = this.props;
    return (
      <NavLink
        className="tg-nav__menu__link noti-wrapper navbar-invitations"
        to="/invitationLogs"
        onClick={this.props.setAllNotiAsRead}
      >
        Invitations
        {
          invitationNotifyCount > 0
          && (
          <div className="noti-counter">
            <span>{invitationNotifyCount > MAX_NOTI_COUNT ? `${MAX_NOTI_COUNT}+` : invitationNotifyCount}</span>
          </div>
          )
        }
      </NavLink>
    );
  };

  shouldShowAgeConfirm = () => {
    const pathname = _.get(this.props, 'history.location.pathname', null);
    if (pathname !== '/signup' && pathname !== '/signup/AI' && pathname !== '/signup/Human') {
      this.setState({ showAgeConfirmSignUp: true });
    }
  }

  renderToastComponent = (lastestNoti, key) => {
    const {
      tournamentInfoList, rounds, joinRoom, cancel, viewResult, history
    } = this.props;
    switch (lastestNoti.entityType) {
      case NOTIFICATION.INVITE_TO_PLAY_GAME:
        return (
          <div className="tg-nav__menu__link noti-wrapper">
            <NotificationToastInvite notiId={lastestNoti._id} />
          </div>
        );
      case NOTIFICATION.TOURNAMENT_INVITE:
        if (rounds[key]) {
          return (
            <div className="tg-nav__menu__link noti-wrapper">
              <div
                className="noti-dropdown"
                id="noti-dropdown"
              >
                <NotificationTournamentItem
                  notification={lastestNoti}
                  tournamentInfo={tournamentInfoList.find(e => e.id === lastestNoti.entityId)}
                  roundInfo={rounds[key]}
                  joinRoom={() => joinRoom(rounds[key].pairData, rounds[key].roundData._id, lastestNoti._id, history)
                  }
                  cancel={() => {
                    cancel(rounds[key].pairData, lastestNoti._id);
                  }}
                  viewResult={() => viewResult(rounds[key].roundData.sectionId, lastestNoti._id, NOTIFICATION_ACTION.DELETE, history)
                  }
                  getKey={key}
                  key={key}
                />
              </div>
            </div>
          );
        }
        return null;
      case NOTIFICATION.FINISH_TOURNAMENT:
        return (
          <div className="tg-nav__menu__link noti-wrapper">
            <div
              className="noti-dropdown"
              id="noti-dropdown"
            >
              <NotificationFinishTournament
                notification={lastestNoti}
                viewResult={() => viewResult(lastestNoti.entityId, lastestNoti._id, NOTIFICATION_ACTION.DELETE, history)
                }
                getKey={key}
                key={key}
              />
            </div>
          </div>
        );
      default: return <NotificationToastItem msg={this.craftToastMessage(lastestNoti.entityType)} />;
    }
  };

  renderNavHome = () => {
    let teacherUser = false;
    const { userData } = this.props;
    const pathname = _.get(this.props, 'history.location.pathname');
    const isGameRoom = pathname === '/gamesRoomEntry' || pathname === '/gamesRoomNetwork';
    const userId = Meteor.userId();

    if (userData && _.isFunction(userData.getPerson)) {
      teacherUser = _.get(userData.getPerson(), 'type', []).includes(USER_TYPES.TEACHER);
    }

    const MyNavLink = (props) => {
      const handleOnClick = () => {
        this.closeNav();
        if (props.onClick) props.onClick();
      };
      return <NavLink {...props} onClick={handleOnClick} />;
    };

    return (
      <nav id="menuMobileOpen" className="tg-nav__menu">
        <a id="menuMobileClose" href="#" className="closebtn" onClick={this.closeNav}>&times;</a>
        <MyNavLink className={['tg-nav__menu__link', isGameRoom ? 'active' : ''].join(' ')} to="/gamesBoard">Games</MyNavLink>
        {
          Roles.userIsInRole(userId, ROLES.AI)
          && <MyNavLink className="tg-nav__menu__link" to="/courses">Courses</MyNavLink>
        }
        <MyNavLink className="tg-nav__menu__link" to="/factoryselect">Factory</MyNavLink>
        {
          userId && teacherUser
          && <MyNavLink className="tg-nav__menu__link" to="/teacher">Teacher</MyNavLink>
        }
        <MyNavLink className="tg-nav__menu__link" to="/leaderboard">Leaderboard</MyNavLink>
        <a className="tg-nav__menu__link" rel="noopener noreferrer" target="_blank" href={FORUM_URL}>Forum</a>

        <MyNavLink className="tg-nav__menu__link" to="/contact-us">Contact</MyNavLink>
        <MyNavLink className="tg-nav__menu__link" to="/classmanage">Class</MyNavLink>
        {!userId && <MyNavLink className="tg-nav__menu__link" to="/signin">Login</MyNavLink>}
      </nav>
    );
  };

  openNav = () => {
    document.getElementById("topNavBar").classList.add("open");
  }

  closeNav = () => {
    document.getElementById("topNavBar").className = 'header__container__navbar';
  }

  render() {
    const { showAgeConfirmSignUp } = this.state;

    return (
      <div className="top-nav-bar">
        <div className="header__container">
          <div className="header__padding header__padding__left" />
          <div id="topNavBar" className="header__container__navbar" data-animation="default" data-collapse="small" data-duration="400">
            <div className="tg-nav__brand">
              <Link
                to="/"
              >
                <img alt="" className="tgame-logo" src="/images/white-logo.png" width="200" />
              </Link>
            </div>
            <div className="menu-icon-mobile" onClick={this.openNav} role="presentation">
              <span className="icon-1" />
              <span className="icon-2" />
              <span className="icon-3" />
            </div>
            {this.renderNavHome()}
            {this.userProfileDropdown()}
          </div>
          <AgeConfirm isOpen={showAgeConfirmSignUp} handleClose={() => this.setState({ showAgeConfirmSignUp: false })} />
          <div className="header__padding header__padding__right" />
        </div>
      </div>
    );
  }
}

export default TopNavBarHomePage;
