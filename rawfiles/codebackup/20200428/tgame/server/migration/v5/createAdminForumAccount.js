/* global Roles */

import { Accounts } from 'meteor/accounts-base';
import { ROLES } from '../../../lib/enum';
import { Persons } from '../../../lib/collections';

const createAdminForumAccount = () => {
  const adminForum = {
    firstName: 'Forum',
    lastName: 'Admin',
    email: 'adminforum@mail.com',
    password: '123456789',
    roles: [ROLES.SUPER_ADMIN],
    groups: ['admins'],
    username: 'adminforum',
  };
  const existedAdminForum = Meteor.users.findOne({ 'emails.address': adminForum.email });
  if (!existedAdminForum) {
    const userId = Accounts.createUser({
      email: adminForum.email,
      username: adminForum.username,
      password: adminForum.password,
      profile: {
        firstName: adminForum.firstName,
        lastName: adminForum.lastName
      },
      createdAt: new Date(),
    });
    const personId = Persons.insert({
      userId
    });
    Meteor.users.update(
      {
        _id: userId,
        'emails.address': adminForum.email
      },
      {
        $set: {
          'emails.$.verified': true,
          groups: adminForum.groups,
          personId
        }
      }
    );
    Roles.addUsersToRoles(userId, ROLES.SUPER_ADMIN);
  } else {
    const userId = existedAdminForum._id;
    Meteor.users.update(
      {
        _id: userId,
        'emails.address': adminForum.email
      },
      {
        $set: {
          'emails.$.verified': true,
          groups: adminForum.groups,
        }
      }
    );
    Roles.addUsersToRoles(userId, ROLES.SUPER_ADMIN);
  }
};

export default createAdminForumAccount;
