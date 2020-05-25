import stripePackage from 'stripe';
import { PAYMENT_PRICE } from '../../../lib/enum';
import { StripePlans } from '../../../lib/collections';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

const createPlan = (plan, product) => {
  const paymentPlan = PAYMENT_PRICE[plan];

  stripe.plans.create({
    id: plan,
    amount: Math.round(paymentPlan.price * 100),
    interval: paymentPlan.interval,
    product: product || {
      name: paymentPlan.value
    },
    currency: 'usd'
  })
    .then(Meteor.bindEnvironment((result) => {
      StripePlans.insert({
        _id: result.id,
        ...result
      });
    }))
    .catch(Meteor.bindEnvironment(err => console.log(err)));
};

const checkPlanItem = async (plan) => {
  stripe.plans
    .retrieve(plan)
    .then(Meteor.bindEnvironment((planData) => {
      if (planData) {
        stripe.plans
          .del(plan)
          .then((confirm) => {
            if (confirm) {
              StripePlans.remove(plan);
              createPlan(plan, planData.product);
            }
          })
          .catch(Meteor.bindEnvironment(err => err && createPlan(plan, planData.product)));
      }
    }))
    .catch(Meteor.bindEnvironment((err) => {
      if (err) {
        createPlan(plan);
      }
    }));
};

const createPlans = () => {
  Object.keys(PAYMENT_PRICE).forEach(plan => checkPlanItem(plan));
};

export default createPlans;
