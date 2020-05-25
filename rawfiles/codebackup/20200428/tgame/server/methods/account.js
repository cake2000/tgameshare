/* eslint object-shorthand: [2, "consistent"]*/
/* eslint-env es6*/
/* global Roles Email*/
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';
import Future from 'fibers/future';
import stripePackage from 'stripe';
import moment from 'moment';
import _ from 'lodash';
import { Games, StripeCustomer, ParentEmail, UserVisitHistory, Classes, Persons, Schools } from '../../lib/collections';
import { buildHtmlForParentEmail, buildHtmlForInviteEmail, buildTeacherSignUpMail } from '../../lib/util';
import { ROLES, PAYMENT_PLANS, USER_TYPES } from '../../lib/enum.js';
import { PAYMENT_FREE, REGISTER_CLASS_STATUS } from '../../lib/enum';
import React from 'react';


const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

const createStripeCustomer = async (userId) => {
  const u = Meteor.users.findOne({_id: userId});
  const promise = new Promise((resolve, reject) => {
    stripe.customers
      .create(
        {
          description: `Stripe for ${u.username} ${u.emails[0].address} ${userId}`,
        }
      )
      .then(customer => resolve(customer))
      .catch(err => reject(err));
  });
  const customer = await promise;

  if (customer) {
    Meteor.users.update(
      { _id: userId }, {
        $set: {
          stripeCusId: customer.id
        }
      }
    );
    if (StripeCustomer.findOne({ userId })) {
      StripeCustomer.update({ userId }, { $set: { data: { customer } } });
    } else {
      StripeCustomer.insert({
        userId: userId,
        data: {
          customer
        }
      });
    }
  }
  return {
    data: {
      customer
    }
  };
};

export default function () {
  Meteor.methods({
    'accountsCreate'(data) {
      check(data, Object);
      const {
        email, password, accountType, username, channel, parentInfo, type, referralUser
      } = data;
      let { profile = {} } = data;
      const createdAt = new Date();
      const userId = Accounts.createUser({
        email,
        username,
        password,
        createdAt
      });

      const personId = Persons.insert({
        userId
      });
      const games = Games.find().fetch();
      const playGames = games.map((game) => {
        return {
          gameId: game._id,
          rating: 300,
          tournamentIds: []
        };
      });

      // if (type === ROLES.TEACHER) {
      //   Meteor.call('registerAsTeacher', profile, userId);
      //   profile.school = Schools.findOne(profile.schoolName).SchoolName;
      //   Email.send({
      //     from: 'Tgame Support <support@tgame.ai>',
      //     to: 'tgameai@gmail.com',
      //     subject: 'Teacher Sign Up',
      //     html: buildTeacherSignUpMail(profile)
      //   });
      // }
      Roles.addUsersToRoles(userId, accountType);
      if (!profile) {
        profile = {};
      }
      Meteor.users.update(
        { _id: userId }, {
          $set: {
            username: username,
            playGames: playGames,
            accountType: accountType === ROLES.AI ? PAYMENT_PLANS.FREE_ROBOT : PAYMENT_PLANS.FREE_HUMAN,
            'profile.school': profile.schoolName,
            'profile.firstName': profile.firstName,
            'profile.lastName': profile.lastName,
            'profile.channel': channel,
            'profile.dateOfBirth': profile.dateOfBirth,
            personId: personId,
            referralUser: referralUser
          }
        }
      );
      Meteor.defer(() => {
        createStripeCustomer(userId);
      });
      let isVerified = false;
      const user = Meteor.users.findOne(userId);
      if (user) {
        // Check if parent email then no need send verification email
        const { parentEmail, key } = parentInfo;
        if (parentEmail && key) {
          const checkParentExists = ParentEmail.findOne({ email: parentEmail, key: key });
          if (checkParentExists) {
            const { emails } = user;
            if (emails && emails[0]) {
              emails[0].verified = true;
              Meteor.users.update(userId, {
                $set: {
                  emails: emails,
                  'profile.dateOfBirth': checkParentExists.dateOfBirth
                },
              });
              isVerified = true;
            }
          }
        } else {
          Meteor.defer(() => {
            Accounts.sendVerificationEmail(userId);
          });
        }
        return {
          userId,
          isVerified,
        };
      }
      throw new Meteor.Error(403, 'Cannot create this user.');
    },
    'accountsResendVerify'(userId) {
      check(userId, String);
      // We need show the loading indicator
      // Meteor.defer(() => {
      return Accounts.sendVerificationEmail(userId);
      // });
    },
    'accountsResetPassword'(email) {
      check(email, String);
      const user = Meteor.users.findOne({ 'emails.address': { $in: [email] } });
      if (!user) throw new Meteor.Error(403, 'Email not exists.');
      Meteor.defer(() => {
        Accounts.sendResetPasswordEmail(user._id, email, (error) => {
          if (error) {
            throw new Meteor.Error(403, 'We are sorry but something went wrong.');
          }
        });
      });
    },

    'accountSendParentEmail'(email, dateOfBirth) {
      check(email, String);
      check(dateOfBirth, String);

      const user = Meteor.users.findOne({ 'emails.address': email });
      if (user) {
        throw new Meteor.Error('email exists', 'Email has been used by another user');
      }
      let parentEmail = ParentEmail.findOne({ email });
      if (!parentEmail) {
        parentEmail = {
          email: email,
          key: Random.secret(10),
          dateOfBirth: dateOfBirth
        };
        ParentEmail.insert(parentEmail);
      }
      Meteor.defer(() => {
        Email.send({
          from: 'TuringGame <support@tgame.ai>',
          to: email,
          subject: 'Your Child\'s Sign Up Request',
          html: buildHtmlForParentEmail({
            email: parentEmail.email,
            key: parentEmail.key,
          }),
        });
      });
    },
    'accountSendInviteEmail'(email, gameRoomId) {
      check(email, String);
      check(gameRoomId, String);
      const user = Meteor.users.findOne({ 'emails.address': email });
      if (user) {
        throw new Meteor.Error('email exists', 'Email has been used by another user');
      }
      let parentEmail = ParentEmail.findOne({ email, gameRoomId });
      if (!parentEmail) {
        parentEmail = {
          email: email,
          key: Random.secret(10),
          inviteRoomId: gameRoomId,
        };
        ParentEmail.insert(parentEmail);
      }
      Meteor.defer(() => {
        Email.send({
          from: 'TuringGame <support@tgame.ai>',
          to: email,
          subject: 'You have been invited to join TuringGame',
          html: buildHtmlForInviteEmail({
            email: parentEmail.email,
            key: parentEmail.key,
            gameRoomId: gameRoomId,
          }),
        });
      });
    },
    'accountsUpdatePassword'(newPassword, token) {
      check(newPassword, String);
      check(token, String);

      const user = Meteor.users.findOne({ 'services.password.reset.token': token });
      if (!user) throw new Meteor.Error(403, 'Your request token for reset password is expired');
      return Accounts.setPassword(user._id, newPassword);
    },
    'accountsUpdateUserProfile'(userData) {
      check(userData, Object);
      const username = Meteor.users.findOne({ username: userData.username });
      let person = Persons.findOne({ userId: userData._id });
      if (!person) {
        Persons.insert({
          userId: userData._id
        });
        person = Persons.findOne({ userId: userData._id });
      }

      if (username && (username._id !== userData._id)) {
        throw new Meteor.Error(403, 'Username already exists');
      }

      const userWithEmail = Meteor.users.findOne({ 'emails.address': userData.emails[0].address });
      if (userWithEmail && (userWithEmail._id !== userData._id)) {
        throw new Meteor.Error(403, 'Email is already used');
      }
      userData.profile.inClasses = [];

      // let { profile } = userData;
      // const schoolId = profile.school;
      //
      // if (person.type.includes(USER_TYPES.TEACHER) || userData.type === ROLES.TEACHER) {
      //   person.teacherProfile.schoolName = userData.profile.school;
      //
      //   if (userData.type === ROLES.TEACHER) {
      //     Meteor.call('registerAsTeacher', userData.profile, userData._id);
      //     profile.school = Schools.findOne(schoolId).SchoolName;
      //     Email.send({
      //       from: 'Tgame Support <support@tgame.ai>',
      //       to: 'tgameai@gmail.com',
      //       subject: 'Teacher Sign Up',
      //       html: buildTeacherSignUpMail(profile)
      //     });
      //   } else {
      //     Persons.update({ _id: person._id }, { $set: { teacherProfile: person.teacherProfile } });
      //   }
      // }
      // profile = {
      //   ...username.profile,
      //   ...userData.profile,
      //   school: schoolId
      // };
      // return Meteor.users.update({ _id: userData._id }, { $set: { profile: profile, username: userData.username ? userData.username : Meteor.user().username } });
      return Meteor.users.update({ _id: userData._id }, { $set: { profile: userData.profile, username: userData.username } });
    },
    'accountsUpdateUserData'(userData) {
      check(userData, Object);
      const username = Meteor.users.findOne({ username: userData.username });

      if (username && (username._id !== userData._id)) {
        throw new Meteor.Error(403, 'Username is already existed');
      }

      const userWithEmail = Meteor.users.findOne({ 'emails.address': userData.emails[0].address });
      if (userWithEmail && (userWithEmail._id !== userData._id)) {
        throw new Meteor.Error(403, 'Email is already used');
      }

      if (userWithEmail.profile.grade != userData.profile.grade) {
        userData.profile.gradeAsOfDate = new Date();
        console.log("update user grade as of date to " + userData.profile.gradeAsOfDate);
      }

      Meteor.users.update({ _id: userData._id }, { $set: userData });
    },
    // 'accountupdateProgressOld'(tutorialId, progress) {
    //   check(tutorialId, String);
    //   check(progress, Number);

    //   if (Meteor.users.findOne({ _id: Meteor.userId(), 'tutorial.id': tutorialId })) {
    //     Meteor.users.update({
    //       _id: Meteor.userId(),
    //       'tutorial.id': tutorialId
    //     }, { $set: { 'tutorial.$.progress': progress } });
    //   } else {
    //     const tutorial = {
    //       id: tutorialId,
    //       progress: progress
    //     };
    //     Meteor.users.update({
    //       _id: Meteor.userId()
    //     }, { $addToSet: { tutorial: tutorial } });
    //   }
    // },
    'accountToggleActive'() {
      const { userId } = this;
      const user = Meteor.users.findOne({ _id: userId });
      const activeStatus = user.accountStatus.isActive;

      Meteor.users.update(
        {
          _id: userId
        },
        {
          $set: {
            accountStatus: {
              isActive: !activeStatus,
              modifiedAt: new Date()
            }
          }
        });
    },
    'accountAddCreateStripe'(accountType) {
      check(accountType, String);
      const { userId } = this;

      Meteor.users.update(
        { _id: userId }, {
          $set: {
            accountType: accountType === ROLES.AI ? PAYMENT_PLANS.FREE_ROBOT : PAYMENT_PLANS.FREE_HUMAN,
          }
        }
      );

      Roles.addUsersToRoles(userId, accountType);
      Meteor.defer(() => {
        createStripeCustomer(userId, accountType);
      });
    },
    'accountUserSetInGame'(userIds, gameRoomId) {
      check(gameRoomId, Match.Maybe(String));
      check(userIds, [String]);
      if (userIds) {
        Meteor.users.update(
          { _id: { $in: userIds } },
          { $set: { inGame: gameRoomId } },
          { multi: 1 }
        );
      }
    },

    async 'user.updateUserInPage'(pathPage) {
      check(pathPage, String);
      this.unblock();
      const userId = Meteor.userId();
      if (!userId) {
        // throw new Meteor.Error('Login to continue');
        console.log("error in updateUserInPage: not logged in");
        return;
      }
      UserVisitHistory.update({ userId }, {
        $push: {
          userInPageHistory: {
            page: pathPage,
            timestamp: new Date(),
            duration: 0
          }
        }
      });
      const newUpdated = {
        $set: {
          userInPage: pathPage
        }
      };
      if (!pathPage.startsWith('/playgame')) {
        newUpdated['$set']['inGame'] = null;
      }
      return Meteor.users.update( // eslint-disable-line
        userId,
        newUpdated
      );
    },
    async 'user.updateUserInPageDuration'(duration) {
      check(duration, Number);
      const userId = Meteor.userId();
      if (!userId) {
        // throw new Meteor.Error('Login to continue');
        console.log("error in updateUserInPageDuration: not logged in");
        return;
      }
      let userVisitHistory = UserVisitHistory.findOne({ userId });
      if (!userVisitHistory) {
        userVisitHistory = {
          userId: userId,
          userInPageHistory: []
        };
        UserVisitHistory.insert(userVisitHistory);
      }
      const userInPageHistory = userVisitHistory.userInPageHistory || [];
      const lastUpdate = userInPageHistory[userInPageHistory.length - 1];
      if (!lastUpdate) {
        //throw new Meteor.Error('update-user-inpage-duration', 'Last update does not exist.');
        console.log("error in updateUserInPageDuration: Last update does not exist");
        return;
      }
      lastUpdate.duration = duration;
      UserVisitHistory.update({ userId }, {
        $pop: {
          userInPageHistory: 1,
        }
      });
      return UserVisitHistory.update({ userId }, {
        $push: {
          userInPageHistory: lastUpdate
        }
      });
    },
    'accountUploadUserAvatar'(imageInfo) {
      check(imageInfo, Object);

      const currentUserId = Meteor.userId();

      Meteor.users.update({ _id: currentUserId }, {
        $set: {
          avatar: imageInfo
        }
      });
    },
    'discourseSSO'(userId, payload, sig) {
      check(userId, Match.Maybe(userId));
      check(payload, String);
      check(sig, String);
      const discourse_sso = require('discourse-sso');
      if (!userId) {
        throw new Meteor.Error(401, "Not logged in. Please log into Toitla before going to the forum.");
      }
      if (!payload || !sig) {
        throw new Meteor.Error(401, `Forum sent data incorrect: ${payload} - ${sig}`);
      }



      const user = Meteor.users.findOne({ _id: userId });

      if (!user.profile || !user.username) {
        throw new Meteor.Error(401, "Please fill your profile before going to the forum.");
      }
      const sso = new discourse_sso('tgame_ai');

      if (!sso.validate(payload, sig)) {
        throw new Meteor.Error(401, "Payload and Sig do not match");
      }
      const userparams = {
        // Required, will throw exception otherwise
        nonce: sso.getNonce(payload),
        external_id: user._id,
        email: user.emails[0].address,
        username: user.username.replace(/[^a-z0-9]+/gi, "_"),
        name: user.username
      };
      return sso.buildLoginString(userparams);
    },
    'checkIfCompletedAllLesson'() {
      const user = Meteor.user();
      const { tutorial = [] } = user || {};
      if (tutorial.length === 0 || _.findIndex(tutorial, item => item.progress === 0) !== -1) return false;
      return true;
      // const tutorialGroupByGameId = _.groupBy(tutorial, item => item.gameId);
      // const lessons = Scenarios.find(
      //   {
      //     userId: 'system'
      //   },
      //   {
      //     fields: {
      //       _id: 1,
      //       gameId: 1,
      //       ScenarioSequenceNumber: 1,
      //     }
      //   }
      // ).fetch();
      // const lessonsGroupByGameId = _.groupBy(lessons, lesson => lesson.gameId); // {gameId1: [], gameId2: []}
    },
    'updateUserLanguageLevel'(language, value) {
      check(language, String);
      check(value, String);

      if (Meteor.user().languages && Meteor.user().languages.length > 0) {
        console.log("update language for " + Meteor.userId() + " " + JSON.stringify(Meteor.user().languages));
        const lan = Meteor.user().languages;
        for (let k = 0; k < lan.length; k++) {
          if (lan[k].name == language) {
            lan[k].level = value;
            break;
          }
        }
        Meteor.users.update(
          {
            _id: Meteor.userId(),
            // 'languages.name': language
          },
          {
            $set: {
              // 'languages.$.level': value
              languages: lan
            }
          }
        );
      } else {
        console.log("language doesn't exists " + Meteor.userId() + " " + JSON.stringify(Meteor.user().languages));
        const languages = [
          {
            name: language,
            level: value,
            skills: [],
            assessments: []
          }
        ];
        Meteor.users.update({ _id: Meteor.userId() }, { $set: { languages } });
      }
    },
    'updateUserAssessment'(language, key, value) {
      check(language, String);
      check(key, String);
      check(value, String);
      if (Meteor.user().languages && Meteor.user().languages.length > 0) {
        console.log("updateUserAssessment 1 " + JSON.stringify(Meteor.user().languages));

        const lan = Meteor.user().languages;



        const languageData = lan.find(element => element.name === language);
        let assessments = languageData.assessments || [];
        // console.log("assessments " + JSON.stringify(assessments));
        if (assessments && assessments.find(element => element.key === key)) {
          // console.log("found key " + key);
          for (let k = 0; k < languageData.assessments.length; k++) {
            if (languageData.assessments[k].key == key) {
              languageData.assessments[k].answer = value;
              break;
            }
          }
        } else {
          languageData.assessments.push({
            key: key,
            answer: value
          });
        }

        Meteor.users.update(
          {
            _id: Meteor.userId(),
            // 'languages.name': language
          },
          {
            $set: {
              languages: lan
            }
          }
        );
      } else {
        console.log("updateUserAssessment 2 " + Meteor.userId() + " " + JSON.stringify(Meteor.user().languages));
        // const languages = [
        //   {
        //     name: 'JavaScript',
        //     assessments: [
        //       {
        //         key: key,
        //         answer: value
        //       }
        //     ]
        //   }
        // ];

        Meteor.users.update(
          {
            _id: Meteor.userId(),
          },
          {
            $addToSet: {
              languages: {
                name: 'JavaScript',
                skills: [],
                assessments: [
                  {
                    key: key,
                    answer: value
                  }
                ]
              }
            }
          }
        );
        // console.log("after update ass");
      }
    },
    cancelRegistrationAsTeacher() {
      const currentUserId = Meteor.userId();
      Persons.remove({ userId: currentUserId });
    },
    registerAsTeacher(userInfo, userId) {
      check(userInfo, Object);
      check(userId, Match.Maybe(String));
      const currentUserId = userId || Meteor.userId();
      let personId;
      // check if this user is already a teacher
      const person = Persons.findOne({ userId: currentUserId });
      if (person) {
        console.log('person found for ');
        console.log(userInfo);
        personId = person._id;
        Persons.update({ _id: personId }, {
          $set: {
            teacherProfile: userInfo
          },
          $addToSet: {
            type: USER_TYPES.WAITING_FOR_APPROVAL
          }
        });
      } else {
        console.log('no person found for ' + currentUserId);
        console.log(userInfo);
        personId = Persons.insert({
          userId: currentUserId,
          teacherProfile: userInfo,
          type: ['user', USER_TYPES.WAITING_FOR_APPROVAL]
        });
        console.log("new personId " + personId);
      }
      const school = userInfo.schoolName || userInfo.afterSchoolName;

      Meteor.users.update({ _id: currentUserId }, {
        $set: {
          personId: personId,
          'profile.school': school
        }
      });
    },
    // registerAsTeacher(userInfo) {
    //   check(userInfo, Object);
    //   const currentUserId = Meteor.userId();
    //   Persons.update({ userId: currentUserId }, {
    //     $set: {
    //       teacherProfile: userInfo
    //     },
    //     $push: {
    //       type: USER_TYPES.WAITING_FOR_APPROVAL
    //     },
    //   },
    //     { upsert: true }
    //   );
    // },
    'accountAddNewClass'(classId) {
      check(classId, String);
      const userId = Meteor.userId();
      const classData = Classes.findOne(classId);
      if (classData) {
        Classes.update(
          { _id: classId },
          {
            $inc: {
              numbOfStudents: 1
            },
            $addToSet: {
              users: Meteor.userId()
            }
          }
        );

        return Meteor.users.update(userId, {
          $addToSet: {
            'profile.inClasses': {
              classId: classId,
              status: REGISTER_CLASS_STATUS.PENDING
            }
          }
        });
      }
      throw new Meteor.Error(404, 'Class is not found');
    },
    'accountRemoveClass'(classId) {
      check(classId, String);
      const userId = Meteor.userId();
      const classData = Classes.findOne(classId);

      if (classData) {
        if (classData.users.includes(userId)) {
          if (classData.numbOfStudents > 0) {
            Classes.update(
              { _id: classId },
              {
                $inc: {
                  numbOfStudents: -1
                },
                $pull: {
                  users: userId
                }
              }
            );
          } else {
            Classes.update(
              { _id: classId },
              {
                $et: {
                  numbOfStudents: 0
                },
                $pull: {
                  users: userId
                }
              }
            );
          }
        }
        return Meteor.users.update(userId, {
          $pull: {
            'profile.inClasses': {
              classId: classId
            }
          }
        });
      }
      throw new Meteor.Error(404, 'Class is not found');
    },
    'accountUpdateClass'(currentClassId, classId) {
      check(currentClassId, String);
      check(classId, String);
      const userId = Meteor.userId();
      const { profile } = Meteor.users.findOne(userId);
      const inClasses = profile.inClasses.map((item) => {
        let newClass = item;
        if (item.classId === currentClassId) {
          newClass = {
            classId,
            status: REGISTER_CLASS_STATUS.PENDING
          };
        }
        return newClass;
      });

      Meteor.users.update(
        {
          _id: userId,
        },
        {
          $set: {
            'profile.inClasses': inClasses
          }
        }
      );
      Classes.update(
        {
          _id: currentClassId
        }, {
          $inc: {
            numbOfStudents: -1
          },
          $pull: {
            users: Meteor.userId()
          }
        }
      );
      Classes.update(
        {
          _id: classId
        }, {
          $inc: {
            numbOfStudents: 1
          },
          $addToSet: {
            users: Meteor.userId()
          }
        }
      );
    },
    createStripeCustomer: () => {
      return createStripeCustomer(Meteor.userId());
    },
    getUsername: (userId) => {
      check(userId, String);

      const user = Meteor.users.findOne(userId);

      if (user) {
        return user.username;
      }
      return null;
    },
    searchStudents: (value) => {
      check(value, String);

      const person = Meteor.user().getPerson();
      const query = {
        $or: [
          {
            username: { $regex: new RegExp(value, 'i') }
          },
          {
            'profile.firstName': { $regex: new RegExp(value, 'i') }
          },
          {
            'profile.lastName': { $regex: new RegExp(value, 'i') }
          },
          {
            'emails.address': { $regex: new RegExp(value, 'i') }
          }
        ],
        _id: {
          $nin: person.teacherProfile.paidStudents || []
        },
        accountType: {
          $in: PAYMENT_FREE
        }
      };
      return Meteor.users.find(query, {
        fields: {
          username: 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
          emails: 1
        },
        limit: 50
      }).map(user => ({
        ...user,
        label: `${user.profile.firstName || ''} ${user.profile.lastName || ''} (${user.username}) - ${user.emails[0].address}`
      }));
    }
  });
}
