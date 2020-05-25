import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Evaluation } from '../../lib/collections';

export default function () {
  Meteor.publish('evaluation.getByLanguage', (name) => {
    check(name, String);

    return Evaluation.find({ language: name });
  });
}
