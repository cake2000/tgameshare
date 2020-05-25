import { StripeCustomer } from '/lib/collections';

export default function () {
  Meteor.publish('stripeCustomer.single', () => {
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error(500, 'user is not logged in');
    return StripeCustomer.find({ userId }, {
      fields: {
        userId: 1,
        'data.customer.subscriptions.data.current_period_end': 1,
        'data.customer.subscriptions.data.items.data.plan.id': 1,
        'data.customer.subscriptions.data.plan.id': 1,
        'data.customer.subscriptions.data.discount.coupon.id': 1,
        'data.customer.subscriptions.data.discount.end': 1
      }
    });
    // currently we dont use stripe, will enable late
  });
}
