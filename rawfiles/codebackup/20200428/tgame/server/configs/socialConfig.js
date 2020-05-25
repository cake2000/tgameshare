import { Games, Persons } from '../../lib/collections';
import { ROLES, USER_TYPES } from '../../lib/enum';

const randInt62 = () => {
  const c = parseInt(Math.random() * 62, 10);
  return c;
};

const generateUsername = () => {
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
  const length = 32;
  const username = [...new Array(length)];
  // collision rate 1/2^32
  const userToken = _.map(username, () => {
    const c = str[randInt62()];
    return c;
  }).join``;
  return `user_${userToken}`;
};

const craftFacebookUser = (oldUser) => {
  const newUser = oldUser;
  const { services: { facebook } } = newUser;
  newUser.emails = [{
    address: facebook.email,
    verified: true
  }];
  newUser.profile = {
    firstName: facebook.first_name,
    lastName: facebook.last_name
  };
  return newUser;
};

const craftGoogleUser = (oldUser) => {
  const newUser = oldUser;
  const { services: { google } } = newUser;
  newUser.emails = [{
    address: google.email,
    verified: true
  }];
  newUser.profile = {
    firstName: google.given_name,
    lastName: google.family_name
  };
  return newUser;
};

const craftTwitterUser = (oldUser) => {
  const newUser = oldUser;
  const { services: { twitter } } = newUser;
  newUser.emails = [{
    address: twitter.email,
    verified: true
  }];
  newUser.profile = {};
  newUser.username = twitter.screenName;
  return newUser;
};

// handle on create new user
Accounts.onCreateUser((options, user) => {
  let newUser = user;
  const userService = user.services;

  if (
    !userService.facebook
    && !userService.google
    && !userService.twitter
  ) {
    return user;
  }

  if (userService.facebook) {
    newUser = craftFacebookUser(user);
  }

  if (userService.google) {
    newUser = craftGoogleUser(user);
  }

  if (userService.twitter) {
    newUser = craftTwitterUser(user);
  }

  newUser.username = generateUsername();
  newUser.createdAt = new Date();
  newUser.roles = [ROLES.AI];

  const existedUser = Meteor.users.findOne({ 'emails.address': newUser.emails[0].address });
  if (!existedUser) {
    const games = Games.find().fetch();

    newUser.playGames = games.map((g) => {
      return {
        gameId: g._id,
        rating: 0,
        tournamentIds: []
      };
    });

    Persons.insert({
      userId: newUser._id,
      teacherProfile: {},
      type: [USER_TYPES.USER]
    });
    return newUser;
  }
  const service = Object.keys(userService)[0];

  existedUser.services[service] = newUser.services[service];
  Meteor.users.remove({ _id: existedUser._id });

  if (!existedUser.getPerson()) {
    Persons.insert({
      userId: existedUser._id,
      teacherProfile: {},
      type: [USER_TYPES.USER]
    });
  }
  return existedUser;
});
