import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const Lessons = new Mongo.Collection('Lessons');

const Schema = {};

Schema.Lessons = new SimpleSchema({
  // prevId: {
  //   type: String // ID of previous Lesson
  // },
  userId: { // owner of Lesson, by default it is "system"
    type: String
  },
  package: { // 'starter' or 'advanced' or 'pro' or ''
    type: String
  },
  LessonName: {
    type: String
  },
  LessonNameCH: {
    type: String, optional: true
  },
  LessonSequenceNumber: { // sequence in the package
    type: Number
  },
  coins: {
    type: Number, optional: true
  },
  concepts: {
    type: String,
    optional: false, 
    defaultValue: ""
  },
  studyTime: {
    type: String,
    optional: true, 
    defaultValue: ""
  },
  Difficulty: { // 1 to 5
    type: Number
  },
  locale: {
    type: String,
    optional: true, 
    defaultValue: "en"
  },
  lessonType: {
    type: String,
    optional: true, 
    defaultValue: ""
  },
  gameId: {
    type: String
  },
  gameName: {
    type: String
  },
  group: {
    type: String
  },
  slideFileId: { // id into the slide content collection
    type: String
  }
});

Lessons.attachSchema(Schema.Lessons);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Lessons._ensureIndex({ gameId: 1 });
  }
  export default Lessons;
});
