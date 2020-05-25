import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ZipCode = new Mongo.Collection('zipCode');

const Schema = {};

Schema.ZipCode = new SimpleSchema({
  Zipcode: {
    type: String
  },
  ZipCodeType: {
    type: String
  },
  City: {
    type: String
  },
  State: {
    type: String
  },
  LocationType: {
    type: String
  },
  Lat: {
    type: Number
  },
  Long: {
    type: Number
  },
  Location: {
    type: String
  },
  Decommisioned: {
    type: Boolean
  },
  TaxReturnsFiled: {
    type: String,
    optional: true
  },
  EstimatedPopulation: {
    type: String,
    optional: true
  },
  TotalWages: {
    type: String,
    optional: true
  }
});

ZipCode.allow({
  insert() { return true; }
});

ZipCode.attachSchema(Schema.ZipCode);

Meteor.startup(() => {
  if (Meteor.isServer) {
    ZipCode._ensureIndex({ Zipcode: 1 });
  }
});

export default ZipCode;
