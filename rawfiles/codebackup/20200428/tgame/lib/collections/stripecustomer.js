import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const StripeCustomer = new Mongo.Collection('stripeCustomer');

const Schema = {};

Schema.StripeCustomer = new SimpleSchema({
  userId: {
    type: String,
  },
  data: {
    type: Object,
    blackbox: true
  }
});
StripeCustomer.attachSchema(Schema.StripeCustomer);
Meteor.startup(() => {
  if (Meteor.isServer) {
    StripeCustomer._ensureIndex({ userId: 1 });
  }
  export default StripeCustomer;
});
