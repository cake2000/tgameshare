/* global Counts */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import _get from 'lodash/get';
import { withRouter } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { GAME_INVITE_STATUS } from '../../../../lib/enum';
import { isVisitPage } from '../components/MainLayout.jsx';

const emptyRounds = [];
const emptyTournamentInfoList = [];
export const composer = ({
  ChatSupport, Notifications, Meteor, history
}, onData) => {
  // hide navigation header
  if (isVisitPage(_get(history, 'location'), 'lesson')) return onData(null, { hideComponent: true });
  if (isVisitPage(_get(history, 'location'), 'factory')) return onData(null, { hideComponent: true });

  if (Meteor.userId()) {
    const handleUnRead = Meteor.subscribe('changeSupport.getCountUnRead');
    const handleNotis = Meteor.subscribe('notification.listToShow');
    const handleUnreadNotiCount = Meteor.subscribe('notification.unreadCount');
    const handlePerson = Meteor.subscribe('persons.getUserId', Meteor.userId());

    if (handleUnRead.ready() && handleNotis.ready() && handleUnreadNotiCount.ready() && handlePerson.ready()) {
      // // Unread support chat
      const chatSupport = ChatSupport.findOne({
        userId: Meteor.userId()
      });
      const unReadSupportChatCount = chatSupport ? chatSupport.unReadClientCount : 0;
      const invitationNotifyCount = Counts.get('unReadNotiCount');
      const userData = Meteor.user();
      const notifications = Notifications.find(
        {
          $and: [
            {
              recipients: Meteor.userId(),
              status: { $ne: GAME_INVITE_STATUS.HOST_CANCEL }
            },
            {
              $or: [
                {
                  isDelete: {
                    $exists: false
                  }
                },
                {
                  isDelete: {
                    $eq: []
                  }
                },
                {
                  'isDelete.playerId': {
                    $ne: Meteor.userId()
                  }
                }
              ]
            },
            {
              'readBy.readerId': {
                $ne: Meteor.userId()
              }
            }
          ]
        },
        {
          sort: { createdAt: -1 },
          limit: 3
        }
      ).fetch();
      return onData(null, {
        notifications,
        rounds: emptyRounds,
        tournamentInfoList: emptyTournamentInfoList,
        unReadSupportChatCount,
        isProfessionalUser: true,
        invitationNotifyCount,
        userData
      });
    }
  } else {
    return onData(null, {
      rounds: emptyRounds,
      tournamentInfoList: emptyTournamentInfoList,
      unReadSupportChatCount: 0,
      isProfessionalUser: true,
      invitationNotifyCount: 0
    });
  }
};

export const depsMapper = (context, actions) => {
  const { Meteor, Collections, LocalState } = context;
  const acceptClick = LocalState.get('CLICK_ACCEPT');
  const declineClick = LocalState.get('CLICK_DECLINE');

  const { Games, ChatSupport, Notifications } = Collections;
  return ({
    clearGameBoardData: actions.gamesBoard.clearGameBoardData,
    accept: actions.invite.accept,
    decline: actions.invite.decline,
    joinRoom: actions.tournament.joinRoom,
    viewResult: actions.tournament.viewResult,
    cancel: actions.tournament.cancel,
    clearErrors: actions.invite.clearErrors,
    acceptClick,
    declineClick,
    Meteor,
    Games,
    ChatSupport,
    Notifications
  });
};

export default composeAll(
  composeWithTracker(composer),
  useDeps(depsMapper)
)(withRouter(Header));

// commented in withTracker
// console.log("notifications "+ Date.now() + " " + JSON.stringify(notifications));
// console.log("header.js: notifications "+ Date.now());

// const roundIds = notifications.map((notification) => {
//   if (notification.entityType === NOTIFICATION.TOURNAMENT_INVITE) {
//     return notification.entityId;
//   }
//   return null;
// });

// if (roundIds && roundIds.length > 0 &&
//   Meteor.subscribe('tournamentRoundFindByRoundIds', roundIds).ready()) {
//   rounds = roundIds.map((roundId) => {
//     const roundData = Collections.TournamentRound.findOne({ _id: roundId });
//     if (!roundData) {
//       return null;
//     }
//     const pairData = roundData.pairs.find((pair) => {
//       const findPair = pair.players.find(player => player.playerId === Meteor.userId());
//       if (findPair) {
//         return {
//           roomId: pair.gameRoomId,
//           index: pair.id
//         };
//       }
//       return null;
//     });
//     return {
//       roundData, pairData
//     };
//   });
// }

// subcribe when there is tournament invite
// if (notifications.some(
//   noti => noti.entityType === NOTIFICATION.TOURNAMENT_INVITE
// )) {
//   const roundIdList = _.filter(
//     notifications, noti => noti.entityType === NOTIFICATION.TOURNAMENT_INVITE
//   ).map(noti => noti.entityId);

// if (Meteor.subscribe('notification.tournament').ready()) {
//   tournamentList = Collections.Tournament.find().fetch();
// }

// if (Meteor.subscribe('notification.tournamentRound', roundIdList).ready()) {
//   tournamentRoundList = Collections.TournamentRound.find().fetch();
// }

// if (Meteor.subscribe('notification.section').ready()) {
//   sectionList = Collections.TournamentSection.find().fetch();
//   // console.log("got sectionList " + JSON.stringify(sectionList));
// }
// }
// ignore tournamet notifications that are more than 7 minutes old
// console.log("ignore old notifications " + Date.now());
// const notilist2 = [];
// const timenow = new Date();
// for (let i=0; i<notifications.length; i++) {
//   const n = notifications[i];
//   if (n.entityType !== NOTIFICATION.TOURNAMENT_INVITE) {
//     notilist2.push(n);
//   } else {
//     if (n.createdAt >= timenow - 1000 * 60 * 7) {
// still new

// see if this game is not in waiting
// let pairInWaiting = true;
// const rid = n.entityId;
// for (let k=0; k<tournamentRoundList.length; k++) {
//   const r = tournamentRoundList[k];
//   if (r._id == rid) {
//     // find my pair and check status
//     for (let x=0; x < r.pairs.length; x++) {
//       const onepair = r.pairs[x];
//       if (onepair.players[0].playerId == Meteor.userId() || onepair.players[1].playerId == Meteor.userId()) {
//         if (onepair.players[0].playerId == null || onepair.players[1].playerId == null) {
//           pairInWaiting = false;
//         }
// if (onepair.status == TOURNAMENT_ROUND_STATUS.IN_PROGRESS || onepair.status == TOURNAMENT_ROUND_STATUS.FINISH) {
//   pairInWaiting = false;
// }
//             }
//           }
//         }
//       }
//       if (pairInWaiting)
//         notilist2.push(n);
//     }
//   }
// }

// notifications = notilist2;

// filter tournament round list
// tournamentRoundList = tournamentRoundList.filter(round =>
//   !!notifications.find(noti => noti.entityId === round._id));
// console.log("after filter tournamentRoundList " + JSON.stringify(tournamentRoundList));

// filter tournament list
// tournamentList = tournamentList.filter(tournament =>
//   !!tournamentRoundList.find(round => round.tournamentId === tournament._id));

// console.log("after filter tournamentList " + JSON.stringify(tournamentList));

// filter section list
// sectionList = sectionList.filter(section =>
//   !!tournamentRoundList.find(round => round.sectionId === section._id));

// console.log("after filter sectionList " + JSON.stringify(sectionList));

//   tournamentInfoList = tournamentRoundList.map(round => ({
//     id: round._id,
//     section: sectionList.find(section => section._id === round.sectionId),
//     tournament: tournamentList.find(tournament => tournament._id === round.tournamentId),
//   }));

//   console.log("after filter tournamentInfoList " + JSON.stringify(tournamentInfoList));
