import stripePackage from 'stripe';
import { Coupons } from '/lib/collections';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

const createCoupon = async () => {
  try {
    const promise = new Promise((resolve, reject) => {
      stripe.coupons
        .retrieve('classdiscount19')
        .then(coupon => resolve(coupon))
        .catch(error => reject(error));
    });
    const coupon = await promise;
    console.log(coupon);
  } catch (err) {
    if (err) {
      Coupons.remove({ _id: 'classdiscount19' });
      stripe.coupons
        .create({
          percent_off: 40,
          // A coupon's duration applies on a per-customer or per-subscription basis,
          // starting when the coupon is applied to the customer or subscription.
          // For example, a coupon with a four month duration applies to the first four months of a customer's monthly subscription.
          // If the subscription is yearly, the coupon is applied to the full invoice for the first year.
          // And for weekly a subscription, a four month coupon applies to every invoice in the first four months.
          duration: 'repeating',
          duration_in_months: 3,
          id: 'classdiscount19'
        })
        .then(Meteor.bindEnvironment((coupon) => {
          Coupons.insert({
            _id: coupon.id,
            ...coupon
          });
        }))
        .catch(Meteor.bindEnvironment(error => console.log(error)));
    }
  }
};

export default createCoupon;
