import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Contact = new Mongo.Collection('contact');

const Schema = {};

Schema.Contact = new SimpleSchema({
  email: {
    type: String,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: Date
  }
});
Contact.attachSchema(Schema.Contact);
export default Contact;
