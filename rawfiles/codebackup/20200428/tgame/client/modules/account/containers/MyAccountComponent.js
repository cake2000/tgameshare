/*  global Roles */
import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoadingPage from '../../loading/components/loadingPage.jsx';
import MyAccountComponent from '../components/MyAccountComponent.jsx';
import { ACCOUNT_TYPES, PAYMENT_PLANS, ROLES } from '../../../../lib/enum';

export const composer = ({ context, clearErrors, history }, onData) => {
  const { Collections, LocalState } = context();
  const userError = LocalState.get('UPDATE_USER_ERROR');
  const userData = Meteor.user();
  let accountType = ACCOUNT_TYPES.FREE;
  let stripeCustomer = null;
  let subscribedPlan = [];
  let isLoading = true;
  if (userData) {
    if (Meteor.subscribe('stripeCustomer.single').ready()) {
    // if (true) {
      const stripe = Collections.StripeCustomer.findOne({ userId: Meteor.userId() });

      if (stripe && stripe.data && stripe.data.customer && stripe.data.customer.subscriptions ) {
        stripeCustomer = stripe.data.customer;

        const subscriptionData = stripeCustomer.subscriptions.data[0];
        subscribedPlan = (subscriptionData ? subscriptionData.items.data : [])
          .map((item) => {
            return item.plan.id;
          });

        accountType = ACCOUNT_TYPES.PRO;

        if (
          subscribedPlan.includes(PAYMENT_PLANS.FREE_HUMAN) ||
          subscribedPlan.includes(PAYMENT_PLANS.FREE_ROBOT) ||
          subscribedPlan.includes(undefined) ||
          subscribedPlan.length === 0
        ) {
          accountType = ACCOUNT_TYPES.FREE;
        }
      }
      accountType = ACCOUNT_TYPES.FREE;
      isLoading = false;
    }
    const isAIUser = Roles.userIsInRole(Meteor.userId(), ROLES.AI);
    onData(null, { userData, isAIUser, userError, isLoading, accountType, stripeCustomer, subscribedPlan });
  } else {
    if (!Meteor.userId())
      history.push('/signin');
  }

  return clearErrors;
};

export const depsMapper = (context, actions) => ({
  clearErrors: actions.account.clearErrors,
  resetPassword: actions.account.resetPassword,
  updateUserAction: actions.account.updateUser,
  uploadUserAvatarAction: actions.account.uploadUserAvatar,
  setDefaultCard: actions.account.setDefaultCard,
  removeCard: actions.account.removeCard,
  checkIfCompletedAllLesson: actions.account.checkIfCompletedAllLesson,
  cancelRegistration: actions.account.cancelRegistration,
  context: () => context
});

export default composeAll(
  composeWithTracker(composer, LoadingPage),
  useDeps(depsMapper)
)(MyAccountComponent);
