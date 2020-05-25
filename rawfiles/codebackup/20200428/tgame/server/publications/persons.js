import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Persons } from '../../lib/collections';

export default function () {
  Meteor.publish('persons.getUserId', (userId) => {
    check(userId, String);

    return Persons.find({ userId });
  });
}
