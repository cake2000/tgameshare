import { NOTIFICATION_ACTION } from '../../../../lib/enum';

export default {
  joinRoom({ Meteor }, pairData, roundId, notiId, history) {
    console.log("calling tournament.joinRoom " + pairData.gameRoomId);
    Meteor.call('tournament.joinRoom', pairData.gameRoomId, notiId, (err, res) => {
      if (!err) {
        history.push(`/gamesRoomTournamentNetwork/${res}`, { roundId, pairData, notiId });
      } else {
        Bert.alert("This is strange. We cannot find the game room.", 'warn', 'growl-bottom-right');
      }
    });
  },
  cancel({ Meteor }, pairData, notiId) {
    Meteor.call('tournament.cancel', pairData, notiId, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  createTournamentGameMatch({ Meteor }, gameOption, notiId, roundId, pairIndex) {
    Meteor.call('tournament.createTournamentGameMatch', gameOption, notiId, roundId, pairIndex, (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  },
  viewResult({ Meteor }, sectionId, notiId, type, history) {
    switch (type) {
      case NOTIFICATION_ACTION.SEEN:
        Meteor.call('tournament.seen', notiId, (err) => {
          if (err) {
            console.log('err', err);
          }
        });
        break;
      case NOTIFICATION_ACTION.DELETE:
        Meteor.call('tournament.deleteNotification', notiId, (err) => {
          if (err) {
            console.log('err', err);
          }
        });
        break;
      default:
        break;
    }
    Meteor.call('tournament.viewResult', sectionId, (err, res) => {
      if (!err) {
        const params = {
          modalIsOpen: true,
          sectionKey: sectionId,
          showResult: true,
          tournamentId: res._id
          // sameLocation: history.location.pathname === `/tournament/${res}`,
        };
        console.log("dddd redirect to tournament/game id in tournament.viewResult ");
        history.push(`/tournament/${res.gameId}`, params);
      }
    });
  }
};
