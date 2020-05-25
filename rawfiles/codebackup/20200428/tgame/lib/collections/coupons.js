import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Coupons = new Mongo.Collection('coupons');

const Schema = {};

Schema.Coupons = new SimpleSchema({
  object: {
    type: String
  },
  amount_off: {
    type: Number,
    optional: true,
    label: 'A positive integer representing the amount to subtract from an invoice total (required if percent_off is not passed).'
  },
  created: {
    type: Number
  },
  currency: {
    type: String,
    optional: true,
    label: 'Three-letter ISO code for the currency of the amount_off parameter (required if amount_off is passed).'
  },
  duration: {
    type: String,
    label: 'Specifies how long the discount will be in effect. Can be forever, once, or repeating.'
  },
  duration_in_months: {
    type: Number,
    optional: true,
    label: 'Required only if duration is repeating, in which case it must be a positive integer that specifies the number of months the discount will be in effect.'
  },
  livemode: {
    type: Boolean
  },
  max_redemptions: {
    type: Number,
    optional: true,
    label: 'A positive integer specifying the number of times the coupon can be redeemed before it’s no longer valid. For example, you might have a 50% off coupon that the first 20 readers of your blog can use.'
  },
  metadata: {
    type: Object,
    optional: true,
    label: 'A set of key-value pairs that you can attach to a coupon object. It can be useful for storing additional information about the coupon in a structured format.'
  },
  name: {
    type: String,
    optional: true,
    label: 'Name of the coupon displayed to customers on, for instance invoices, or receipts. By default the id is shown if name is not set.'
  },
  percent_off: {
    type: Number,
    optional: true,
    label: 'A positive float larger than 0, and smaller or equal to 100, that represents the discount the coupon will apply (required if amount_off is not passed).'
  },
  redeem_by: {
    type: Number,
    optional: true,
    label: 'Unix timestamp specifying the last time at which the coupon can be redeemed. After the redeem_by date, the coupon can no longer be applied to new customers.'
  },
  times_redeemed: {
    type: Number,
    optional: true
  },
  valid: {
    type: Boolean,
    optional: true
  }
});

Coupons.attachSchema(Schema.Coupons);

export default Coupons;
