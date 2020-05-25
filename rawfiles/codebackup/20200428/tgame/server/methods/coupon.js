import { check } from 'meteor/check';
import { Coupons } from '/lib/collections';
import moment from 'moment';
import stripePackage from 'stripe';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

export default function () {
  Meteor.methods({
    findCoupon: async (coupon) => {
      check(coupon, String);

      // Use if you want to check in your own database
      // const couponData = Coupons.findOne(coupon);
      //
      // if (couponData) {
      //   const isExpired = couponData.redeem_by && moment(couponData.redeem_by * 1000).isBefore(moment());
      //   const canRedeem = (couponData.max_redemptions && couponData.max_redemptions > couponData.times_redeemed) || !couponData.max_redemptions;
      //
      //   if (!isExpired && canRedeem) {
      //     return {
      //       percentOff: couponData.percent_off,
      //       amountOff: couponData.amount_off
      //     };
      //   }
      // }

      // Use if you want to check through Stripe API

      try {
        const promise = new Promise((resolve, reject) => {
          stripe.coupons
            .retrieve(coupon)
            .then(cp => resolve(cp))
            .catch(err => reject(err));
        });
        const couponData = await promise;

        if (couponData && couponData.valid) {
          return {
            percentOff: couponData.percent_off,
            amountOff: couponData.amount_off
          };
        }
      } catch (err) {
        throw new Meteor.Error(500, err.message);
      }
      return null;
    },
    createCoupon: (id, percentOff, amountOff) => {
      check(id, String);
      check(percentOff, Number);
      check(amountOff, Number);

      stripe.coupons
        .create({
          percent_off: percentOff,
          amount_off: amountOff,
          // A coupon's duration applies on a per-customer or per-subscription basis,
          // starting when the coupon is applied to the customer or subscription.
          // For example, a coupon with a four month duration applies to the first four months of a customer's monthly subscription.
          // If the subscription is yearly, the coupon is applied to the full invoice for the first year.
          // And for weekly a subscription, a four month coupon applies to every invoice in the first four months.
          duration: 'repeating',
          duration_in_months: 3,
          id
        })
        .then(Meteor.bindEnvironment((coupon) => {
          Coupons.insert({
            _id: coupon.id,
            ...coupon
          });
        }))
        .catch(Meteor.bindEnvironment(err => console.log(err)));
    }
  });
}
