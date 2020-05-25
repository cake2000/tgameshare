import { check } from 'meteor/check';
import stripePackage from 'stripe';
import moment from 'moment';
import { emailRepeatingCoupon } from '../../lib/util';
import { StripeCustomer } from '../../lib/collections';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

export const sendEmailAboutCouponExpiration = async ({ userId, coupon, expirationInDay }) => {
  check(userId, String);
  check(coupon, String);

  const user = Meteor.users.findOne(userId);

  if (!user) throw new Meteor.Error(403, 'User not found');
  const promise = new Promise((resolve, reject) => {
    stripe
      .coupons
      .retrieve(coupon)
      .then(cp => resolve(cp))
      .catch(err => reject(err));
  });
  const couponData = await promise;

  if (!couponData || !couponData.valid) throw new Meteor(403, 'Coupon not found');
  const stripeUser = StripeCustomer.findOne({ userId });
  const money = stripeUser.data.customer.subscriptions.data[0].plan.amount / 100;
  const date = moment(stripeUser.data.customer.subscriptions.data[0].current_period_end * 1000).format('LL');

  if (!stripeUser) throw new Meteor.Error(403, 'Stripe account is not found');
  Email.send({
    from: 'TuringGame <support@tgame.ai>',
    to: user.emails[0].address,
    subject: `Your TuringGame coupon is expiring in ${expirationInDay} days`,
    html: emailRepeatingCoupon({
      money, date
    })
  });
};
