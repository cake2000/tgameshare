import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const SlideContent = new Mongo.Collection('SlideContent');

const Schema = {};

Schema.SlideContent = new SimpleSchema({
  createdAt: {
    type: Date
  },
  filename: {
    type: String,
  },
  filetime: {
    type: Date, optional: true
  },
  slideInfo: {
    type: Array
  },
  'slideInfo.$': {
    type: Object
  },
  'slideInfo.$.ID': {
    type: String
  },
  'slideInfo.$.NODE': {
    type: String
  },
  'slideInfo.$.TITLE': {
    type: String
  },
  'slideInfo.$.TYPE': {
    type: String
  },
  'slideInfo.$.WINDOWS': {
    type: String, optional: true
  },
  'slideInfo.$.ROBOTCODE': {
    type: String, optional: true
  },
  'slideInfo.$.QUICKQUESTION': {
    type: String, optional: true
  },
  'slideInfo.$.TESTSCRIPT': {
    type: String, optional: true
  },
  'slideInfo.$.TESTCONDITION': {
    type: String, optional: true
  },
  'slideInfo.$.ANSWERCODE': {
    type: String, optional: true
  },
  'slideInfo.$.ANSWERSCRIPT': {
    type: String, optional: true
  },
  'slideInfo.$.PROJECTID': {
    type: String, optional: true
  },
  'slideInfo.$.DOWNLOADLINK': {
    type: String, optional: true
  },
  'slideInfo.$.HIDEOVERLAY': {
    type: String, optional: true
  },
  'slideInfo.$.IFRAME': {
    type: String, optional: true
  },
  'slideInfo.$.SCRATCHUNLOCKED': {
    type: String, optional: true
  },
  'slideInfo.$.SCRATCHFULL': {
    type: String, optional: true
  },
  'slideInfo.$.STARTINGBLOCKSTRING': {
    type: String, optional: true
  },
  'slideInfo.$.LOCALE': {
    type: String, optional: true
  },
  'slideInfo.$.SCALERATIO': {
    type: String, optional: true
  },  
  content: { 
    type: String, optional: true
  }
});

SlideContent.attachSchema(Schema.SlideContent);

Meteor.startup(() => {
  export default SlideContent;
});
