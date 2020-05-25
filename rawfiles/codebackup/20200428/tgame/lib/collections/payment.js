import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { NOTIFICATION } from '../enum';

const Payments = new Mongo.Collection('payments');

const Schema = {};

Schema.Payments = new SimpleSchema({
  _id: {
    type: String
  },
  stripeCusId: {
    type: String,
    label: 'For referral with stripe customer',
    optional: true
  },
  stripeCardId: {
    type: String,
    label: 'For referral with stripe card id',
    optional: true
  },
  type: {
    type: String,
    label: 'Credit Card, Paypal, check'
  },
  name: {
    type: String,
    label: 'Cardholder\'s full name'
  },

});
Payments.attachSchema(Schema.Payments);
export default Payments;
