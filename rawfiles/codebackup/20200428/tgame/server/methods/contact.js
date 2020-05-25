/* eslint object-shorthand: [2, "consistent"]*/
import { Accounts, AccountsClient } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Contact } from '../../lib/collections';
import { getReferralContentEmail } from '../../lib/util';

export default function () {
  Meteor.methods({
    'contactCreate'(email, subject, message) {
      check(email, String);
      check(subject, String);
      check(message, String);
      const createdAt = new Date();

      if (email.trim().length === 0) {
        throw new Meteor.Error(403, 'Email is required');
      }

      if (subject.trim().length === 0) {
        throw new Meteor.Error(403, 'Subject is required');
      }

      if (message.trim().length === 0) {
        throw new Meteor.Error(403, 'Message is required');
      }
      Meteor.defer(() => {
        Email.send({
          from: 'TuringGame <support@tgame.ai>',
          to: 'tgameai@gmail.com',
          subject: `[${email}] - ${subject}`,
          text: `Email from: ${email}\nMessage:\n${message}`,
        });
      })
      return Contact.insert({ email, subject, message, createdAt });
    },

    doChangePassword: (curp, newp) => {
      check(curp, String);
      check(newp, String);

      console.log("in doChangePassword: " + curp + " " + newp);

      Accounts.changePassword(curp, newp, (err) => {
        if (err) {
          throw new Meteor.Error(500, err);
        } else {
          return "success";
        }
      });
    },

    sendFriendEmail: (email, name, token) => {
      check(email, String);
      check(name, String);
      check(token, String);

      const user = Meteor.users.findOne({ 'emails.address': email });

      if (user) {
        throw new Meteor.Error(500, 'This email already exists!');
      }
      const newUrl = Meteor.absoluteUrl(`signup/${token}`);
      let { username } = Meteor.user();

      if (Meteor.user().profile.firstName || Meteor.user().profile.lastName) {
        username = `${Meteor.user().profile.firstName ? `${Meteor.user().profile.firstName} ` : ''}${Meteor.user().profile.lastName ? `${Meteor.user().profile.lastName} ` : ''}`;
      }
      username += ` (${Meteor.user().emails[0].address})`;
      Meteor.defer(() => {
        Email.send({
          from: 'TuringGame <support@tgame.ai>',
          to: email,
          subject: 'Friend referral',
          html: getReferralContentEmail(newUrl, name, username)
        });
      });
    }
  });
}
