/* global Roles */

import SimpleSchema from 'simpl-schema';
import { USER_TYPES } from '../enum';
import Persons from './persons';

if (Meteor.isServer) {
  Meteor.users.after.insert((userId, doc) => {
    const { _id } = doc;
    if (!doc.emails) {
      Roles.addUsersToRoles(_id, 'publicVisitor');
    }
    Meteor.call('gameItem.setDefaultItems', doc._id);
  });
}

const Schema = {};

Meteor.users.helpers({
  getPerson() {
    return Persons.findOne(this.personId);
  },
  isSupporter() {
    const person = Persons.findOne(this.personId);

    return person && person.type.includes(USER_TYPES.SUPPORTER);
  }
});

Schema.Users = new SimpleSchema({
  createdAt: {
    type: Date
  },
  services: {
    type: Object,
    blackbox: true,
    optional: true
  },
  accountStatus: {
    type: Object,
    optional: true
  },
  'accountStatus.isActive': {
    type: Boolean,
    defaultValue: true
  },
  'accountStatus.modifiedAt': {
    type: Date,
    optional: true
  },
  emails: {
    type: Array
  },
  'emails.$': {
    type: Object
  },
  'emails.$.address': {
    type: String
  },
  'emails.$.verified': {
    type: Boolean
  },
  roles: {
    type: Array,
    optional: true
  },
  'roles.$': {
    type: String
  },
  username: {
    type: String,
    optional: true
  },
  // new lesson user survey variables
  studentname: { // to be called by lecturer
    type: String,
    optional: true
  },
  // schoolgrade: {
  //   type: String, optional: true
  // },
  // schoolgradedate: {
  //   type: Date, optional: true
  // },
  javascriptlevel: {
    type: String, optional: true
  },
  syncMode: {
    type: String, optional: true, defaultValue: "Free"
  },
  syncModeURL: {
    type: String, optional: true, defaultValue: "/"
  },
  isScreenLocked: {
    type: Boolean, optional: true, defaultValue: false
  },
  showSolutionButton: {
    type: Boolean, optional: false, defaultValue: true
  },
  showFastForwardButton: {
    type: Boolean,
    defaultValue: false,
    optional: false
  },
  JSLevel: {
    type: String,
    defaultValue: 'Beginner',
    optional: true
  },
  OKWithScratch: {
    type: Number,
    defaultValue: 1,
    optional: true
  },
  profile: {
    type: Object,
    optional: true
  },
  'profile.firstName': {
    type: String,
    optional: true
  },
  'profile.coins': {
    type: Number,
    defaultValue: 1000,
    optional: true
  },
  'profile.practiceGamesCount': {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  'profile.onlineBattleCount': {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  'profile.battleWonCount': {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  'profile.officialBattleCount': {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  'profile.officialBattleWonCount': {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  'profile.lastName': {
    type: String,
    optional: true
  },
  'profile.gender': {
    type: String,
    optional: true
  },
  'profile.grade': {
    type: Number,
    defaultValue: 6,
    optional: true
  },
  'profile.zipcode': {
    type: String,
    optional: true
  },
  'profile.gradeAsOfDate': { // remember when is this grade recorded, so we can calculate correct grade later, and upgrade every user by September 1st
    type: Date,
    optional: true
  },
  'profile.itemGames': {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'profile.itemGames.$': Object,
  'profile.itemGames.$.itemId': String,
  'profile.itemGames.$.active': Boolean,
  'profile.channel': {
    type: String,
    optional: true
  },
  'profile.allowFastForward': {
    type: Boolean,
    optional: true
  },
  'profile.inClasses': {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'profile.inClasses.$': {
    type: Object,
    optional: true
  },
  'profile.inClasses.$.classId': {
    type: String,
    optional: true
  },
  'profile.inClasses.$.status': {
    type: String,
    optional: true
  },
  'profile.school': {
    type: String,
    optional: true
  },
  'profile.dateOfBirth': {
    type: String,
    optional: true
  },
  playGames: {
    type: Array,
    optional: true
  },
  'playGames.$': {
    type: Object
    // blackbox: true,
  },
  'playGames.$.gameId': {
    type: String, optional: true
  },
  'playGames.$.rating': {
    type: Number, optional: true
  },
  'playGames.$.rd': {
    type: Number, optional: true
  },
  'playGames.$.vol': {
    type: Number, optional: true
  },
  officialBotReleases: {
    type: Array,
    optional: true
  },
  'officialBotReleases.$': {
    type: Object
  },
  'officialBotReleases.$.gameId': {
    type: String
  },
  'officialBotReleases.$.botId': {
    type: String
  },
  status: {
    type: Object,
    blackbox: true,
    optional: true
  },
  inRoom: {
    type: String,
    optional: true
  },
  inGame: {
    type: String,
    optional: true
  },
  userInPage: {
    type: String,
    optional: true,
    defaultValue: ''
  },
  stripeCusId: {
    type: String,
    optional: true
  },
  invite: {
    type: Array,
    optional: true
  },
  'invite.$': {
    type: Object,
    blackbox: true
  },
  tutorial: {
    type: Array,
    defaultValue: [],
    optional: true
  },
  'tutorial.$': {
    type: Object
  },
  'tutorial.$.id': {
    type: String,
    optional: true
  },
  'tutorial.$.progress': {
    type: Number,
    optional: true
  },
  'tutorial.$.coinsPaid': {
    type: Boolean,
    optional: true
  },
  'tutorial.$.unlocked': {
    type: Boolean,
    optional: true
  },
  'tutorial.$.gameId': {
    type: String,
    optional: true
  },
  'tutorial.$.ScenarioSequenceNumber': {
    type: Number,
    optional: true
  },
  robotCodeId: {
    type: String,
    optional: true
  },
  accountType: {
    type: String,
    optional: true
  },
  avatar: {
    type: Object,
    label: 'Avatar image',
    optional: true
  },
  'avatar.title': {
    type: String,
    label: 'Image title'
  },
  'avatar.size': {
    type: Number,
    label: 'Image size'
  },
  'avatar.url': {
    type: String,
    label: 'Image base 64 string'
  },
  groups: {
    type: Array,
    optional: true,
    label: 'user groups'
  },
  'groups.$': {
    type: String,
    optional: true
  },
  defaultLanguage: {
    type: String,
    defaultValue: "JavaScript",
    optional: true
  },
  languages: {
    type: Array,
    optional: true,
    label: 'user languages',
    defaultValue: []
  },
  'languages.$': {
    type: Object,
    optional: true
  },
  'languages.$.name': {
    type: String,
    optional: true
  },
  'languages.$.level': {
    type: String,
    optional: true
  },
  'languages.$.skills': {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'languages.$.skills.$': {
    type: String,
    optional: true
  },
  'languages.$.assessments': {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'languages.$.assessments.$': {
    type: Object,
    optional: true
  },
  'languages.$.assessments.$.key': {
    type: String,
    optional: true
  },
  'languages.$.assessments.$.answer': {
    type: String,
    optional: true
  },
  personId: {
    type: String,
    optional: true,
    defaultValue: null
  },
  referralUser: {
    type: String,
    optional: true
  },
  subscriptionStudentId: {
    type: String,
    optional: true
  },
  cronjobCoupon: {
    type: Array,
    optional: true
  },
  'cronjobCoupon.$': {
    type: String,
    optional: true
  },
  isGrandfathered: {
    type: Boolean,
    optional: true
  },
  canViewSchool: {
    type: Boolean,
    optional: true
  },
  boughtCourse: {
    type: Array,
    optional: true
  },
  'boughtCourse.$': {
    type: Object,
    optional: true
  },
  'boughtCourse.$.gameId': {
    type: String
  },
  'boughtCourse.$.packageType': {
    type: String
  }
});

Meteor.users.attachSchema(Schema.Users);
Meteor.startup(() => {
  if (Meteor.isServer) {
    Meteor.users._ensureIndex({ username: 1 });
  }
});
