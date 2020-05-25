import SimpleSchema from 'simpl-schema';
import { USER_TYPES } from '../enum';

const Persons = new Mongo.Collection('persons');

const Schema = {};

Schema.Persons = new SimpleSchema({
  userId: {
    type: String
  },
  type: {
    type: Array,
    optional: true,
    defaultValue: [USER_TYPES.USER]
  },
  'type.$': {
    type: String,
    allowedValues: [USER_TYPES.USER, USER_TYPES.TEACHER, USER_TYPES.WAITING_FOR_APPROVAL, USER_TYPES.SUPPORTER]
  },
  teacherProfile: {
    type: Object,
    optional: true,
    defaultValue: {}
  },
  createdAt: {
    type: Date,
    optional: true,
    defaultValue: new Date()
  },
  'teacherProfile.firstName': {
    type: String,
    optional: true
  },
  'teacherProfile.lastName': {
    type: String,
    optional: true
  },
  'teacherProfile.teacherType': {
    type: String,
    optional: true
  },
  'teacherProfile.afterSchoolName': {
    type: String,
    optional: true
  },
  'teacherProfile.address': {
    type: String,
    optional: true
  },
  'teacherProfile.city': {
    type: String,
    optional: true
  },
  'teacherProfile.state': {
    type: String,
    optional: true
  },
  'teacherProfile.phone': {
    type: String,
    optional: true
  },
  'teacherProfile.schoolName': {
    type: String,
    optional: true
  },
  'teacherProfile.zipCode': {
    type: String,
    optional: true
  },
  'teacherProfile.classList': {
    type: Array,
    optional: true
  },
  'teacherProfile.classList.$': {
    type: String,
    optional: true
  },
  'teacherProfile.imageInfo': {
    type: Object,
    optional: true
  },
  'teacherProfile.imageInfo.title': {
    type: String,
    optional: true
  },
  'teacherProfile.imageInfo.size': {
    type: Number,
    optional: true
  },
  'teacherProfile.imageInfo.url': {
    type: String,
    optional: true
  },
  'teacherProfile.note': {
    type: String,
    optional: true
  },
  'teacherProfile.paidStudents': {
    type: Array,
    optional: true
  },
  'teacherProfile.paidStudents.$': {
    type: String,
    optional: true
  }
});

Persons.attachSchema(Schema.Persons);
export default Persons;
