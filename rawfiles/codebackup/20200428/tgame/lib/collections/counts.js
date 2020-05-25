import SimpleSchema from 'simpl-schema';

const Counts = new Mongo.Collection('counters');

const Schemas = {};

Schemas.Counts = new SimpleSchema({

});

Counts.attachSchema(Schemas.Counts);

export default Counts;
