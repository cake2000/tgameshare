import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


const CourseCourpon = new Mongo.Collection('CourseCourpon');

const Schema = {};

Schema.CourseCourpon = new SimpleSchema({
  couponCode: { // need to be unique
    type: String
  },
  discountPercentage: { // 0.2 means new price is 80% of original price
    type: Number
  },
  expirationYear: { 
    type: Number
  },
  expirationMonth: { 
    type: Number
  },
  expirationDay: { 
    type: Number
  }
});

CourseCourpon.attachSchema(Schema.CourseCourpon);

Meteor.startup(() => {
  export default CourseCourpon;
});
