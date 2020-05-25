import { CourseCoupon } from '/lib/collections';
import { check } from 'meteor/check';
import moment from 'moment';


export default function() {
  Meteor.methods({
    findCourseCoupon: async (coupon) => {
      check(coupon, String);
      try {
        const couponData = CourseCoupon.findOne({ couponCode: coupon });

        if (!couponData) {
          throw new Meteor.Error(400, 'Invalid coupon!');
        }

        const { expirationYear, expirationMonth, expirationDay } = couponData;
        const expiredDate = moment({ year: expirationYear, month: expirationMonth - 1, day: expirationDay });
        const expiredDateString = expiredDate.format('YYYY-MM-DD');
        const currentDateString = moment().format('YYYY-MM-DD');

        if (currentDateString > expiredDateString) {
          throw new Meteor.Error(400, 'Coupon has expired!');
        }

        return couponData;
      } catch (err) {
        throw new Meteor.Error(500, err.message);
      }
    }
  });
}
