/*  global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import AccountManagement from '../components/AccountManagement.jsx';
import { ADMIN_PUBLICATION } from '../../../../lib/enum';

export const composer = ({ context, clearErrors, history }, onData) => {
  const { Collections } = context();
  const userData = Meteor.user();
  let stripeCustomer = null;
  let subscribedPlan = [];
  let accountData = null;

  if (userData) {
    if (Meteor.subscribe('stripeCustomer.single').ready()) {
      // if (true) {
      const stripe = Collections.StripeCustomer.findOne({ userId: Meteor.userId() }, {
        fields: {
          userId: 1,
          'data.customer.subscriptions.data.current_period_end': 1,
          'data.customer.subscriptions.data.items.data.plan.id': 1,
          'data.customer.subscriptions.data.plan.id': 1,
          'data.customer.subscriptions.data.discount.coupon.id': 1,
          'data.customer.subscriptions.data.discount.end': 1
        }
      });

      if (stripe && stripe.data && stripe.data.customer && stripe.data.customer.subscriptions ) {
        stripeCustomer = stripe.data.customer;

        const subscriptionData = stripeCustomer.subscriptions.data[0];
        if (subscriptionData) {
          if (subscriptionData.items.data.length > 0) {
            subscribedPlan = subscriptionData.items.data.map((item) => {
              if (item.plan.id) {
                return item.plan.id;
              }
              return subscriptionData.plan.id;
            });
          } else if (subscriptionData.plan) {
            subscribedPlan = [subscriptionData.plan.id];
          }
        }
      }
    }
    if (Meteor.subscribe('adminAccountData').ready()) {
      accountData = Collections.Admin.findOne({ type: ADMIN_PUBLICATION.TYPES.ACCOUNTS });
      accountData = accountData ? accountData.data : null;
    }
    onData(null, {
      userData, stripeCustomer, subscribedPlan, accountData
    });
  } else if (!Meteor.userId()) {
    history.push('/signin');
  }

  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  deactiveAccount: actions.account.deactiveAccount,
  subscribeToPlan: actions.account.subscribeToPlan,
  applyCoupon: actions.account.applyCoupon,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(AccountManagement);
