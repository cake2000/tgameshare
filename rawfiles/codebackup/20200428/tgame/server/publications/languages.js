import { Meteor } from 'meteor/meteor';
import { Languages } from '../../lib/collections';

export default function () {
  Meteor.publish('language.getName', (name = 'JavaScript') => {
    check(name, String);
    return Languages.find({ languageName: name });
  });

  Meteor.publish('language.getAll', () => Languages.find({}));

  Meteor.publish('language.getElementsByNameAndSkill', (name, skill) => {
    check(name, String);
    check(skill, String);
    return Languages.find({
      languageName: name,
      skill,
    });
  });
}
