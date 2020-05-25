import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Lessons, SlideContent } from '../../lib/collections';


export default function () {
  Meteor.methods({
    'getSlideDetailById'(itemId) {
      check(itemId, String);
      return SlideContent.findOne({ _id: itemId });
    },
    'getLessonDetailById'(itemId) {
      check(itemId, String);
      return Lessons.findOne({ _id: itemId });
    },
  });
}
