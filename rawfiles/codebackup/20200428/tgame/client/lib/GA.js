/* global Roles */
import { Meteor } from 'meteor/meteor';
import ReactGA from 'react-ga';

import { ROLES, GOOGLE_ANALYTICS_ID, GA_USER_TYPE, DIMENSION_KEY_USER_TYPE, GOOGLE_ANALYTICS_ID_QA } from '../../lib/enum';

let userId = '';
let userType = '';

function getUserType() {
  if (userId.length === 0) {
    userId = Meteor.userId() || '';
  }
  if (userType.length === 0 || userId.length > 0 && userType === GA_USER_TYPE.UNSIGNED_USER) {
    const userRoles = Roles.getRolesForUser(userId);
    if (!userId || !userRoles || userRoles.length < 1) {
      userType = GA_USER_TYPE.UNSIGNED_USER;
    } else {
      switch (userRoles[0]) {
        case ROLES.AI:
          userType = GA_USER_TYPE.AI_USER;
          break;
        case ROLES.MANUAL:
          userType = GA_USER_TYPE.MANUAL_USER;
          break;
        default:
          userType = GA_USER_TYPE.OTHER_USER;
      }
    }
    // console.log(userType);
  }
  return GA_USER_TYPE.AI_USER;
}

// Set User ID and Type after tracking initialized. 
function setGAUserIDAndType() {
  if (userId.length == 0) {
    userId = Meteor.userId() || '';
  }

  // Set up Options
  const setOption = {};
  setOption['userId'] = userId;
  if (Meteor.isProduction) {
    setOption[DIMENSION_KEY_USER_TYPE.ACCOUNT_TYPE] = getUserType();
  } else {
    setOption['dimension1'] = getUserType();
  }
  ReactGA.set(setOption);
}

// Initialize Google Analytics with User ID and User Type
function initializeGASession() {
  // Get User ID
  if (userId.length == 0) {
    userId = Meteor.userId() || '';
  }
  // console.log(userId);

  // Set up Options
  const setOption = {};
  setOption['userId'] = userId;

  // Initialize Google Analytics
  if (Meteor.isProduction) {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID, { debug: false, gaOptions: setOption });
  } else {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID_QA, { debug: true, cookieDomain: 'none', gaOptions: setOption });
  }
  setGAUserIDAndType();
}

function sendGAPageviewWhenChangePage(title) {
  setGAUserIDAndType();
  let pgTitle = title;
  if (title.indexOf("/buildMyAI") === 0) pgTitle = "/buildMyAI";
  if (title.indexOf("/playgame") === 0) pgTitle = "/playgame";
  if (title.indexOf("/gamesRoomNetwork") === 0) pgTitle = "/gamesRoomNetwork";
  if (title.indexOf("/gamesRoomTournamentNetwork") === 0) pgTitle = "/gamesRoomTournamentNetwork";
  if (title.indexOf("/verify-email") === 0) pgTitle = "/verify-email";
  if (title.indexOf("/resend-verification") === 0) pgTitle = "/resend-verification";

  ReactGA.pageview(pgTitle);

  // if (Meteor.userId()) {
    // Meteor.call('user.updateUserInPage', title);
  // }
}

function updateInPageDuration(duration) {
  if (Meteor.userId()) {
    // Meteor.call('user.updateUserInPageDuration', duration);
  }
}


export {
    initializeGASession,
    sendGAPageviewWhenChangePage,
    setGAUserIDAndType,
    updateInPageDuration,
};
