import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const StripePlans = new Mongo.Collection('stripePlans');

const Schema = {};

Schema.StripePlans = new SimpleSchema({
  object: {
    type: String
  },
  active: {
    type: Boolean
  },
  aggregate_usage: {
    type: Object,
    optional: true
  },
  amount: {
    type: Number
  },
  billing_scheme: {
    type: String
  },
  created: {
    type: Number
  },
  currency: {
    type: String
  },
  interval: {
    type: String
  },
  interval_count: {
    type: Number
  },
  livemode: {
    type: Boolean
  },
  metadata: {
    type: Object,
    optional: true
  },
  nickname: {
    type: String,
    optional: true
  },
  product: {
    type: String
  },
  tiers: {
    type: Object,
    optional: true
  },
  tiers_mode: {
    type: Object,
    optional: true
  },
  transform_usage: {
    type: Object,
    optional: true
  },
  trial_period_days: {
    type: Object,
    optional: true
  },
  usage_type: {
    type: String
  }
});

StripePlans.attachSchema(Schema.StripePlans);

export default StripePlans;
