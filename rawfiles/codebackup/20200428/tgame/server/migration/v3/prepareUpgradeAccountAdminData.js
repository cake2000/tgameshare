import { Admin } from '../../../lib/collections';
import { PAYMENT_PLANS } from '../../../lib/enum.js';
import stripePackage from 'stripe';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);


const prepareUpgradeAccountAdminData = () => {
  const account = {
    type: 'accounts',
    data: {
      title: 'Account Plans',
      description: 'Pick an account plan that fits your workflow',
      plans: {
        AI: [
          {
            name: 'FREE Account',
            isFree: true,
            features: [
              'Beginner and Advanced game levels',
              'Coding IDE and starter tutorials',
              'Practice games and online games',
              'Basic support through public forum'
            ],
          },
          {
            name: 'Professional Account',
            price: {
              monthly: {
                planId: PAYMENT_PLANS.MONTH_PRO_ROBOT,
                price: '9.99$'
              },
              annual: {
                planId: PAYMENT_PLANS.YEAR_PRO_ROBOT,
                price: '99.99$'
              }
            },
            isFree: false,
            features: [
              'Free account features, plus:',
              'Advanced tutorials',
              'Tournaments for official rating and awards',
              'Create your own test scripts',
              'Scripting for machine learning',
              'Priority support through online chat'
            ]
          }
        ],
        Human: [
          {
            name: 'Beginner Human Player',
            isFree: true,
            features: [
              'Beginner and Professional Game Levels',
              'Practice game with baseline robots',
              'Online games with friends and family',
            ]
          },
          {
            name: 'Professional Human Player',
            isFree: false,
            price: {
              monthly: {
                planId: PAYMENT_PLANS.MONTH_PRO_HUMAN,
                price: '4.99$'
              },
              annual: {
                planId: PAYMENT_PLANS.YEAR_PRO_HUMAN,
                price: '3.99$'
              }
            },
            features: [
              'Beginner, Advanced and Professional Levels',
              'Practice game with advanced robots',
              'Online games with friends and family',
              'Tournaments for official rating and awards'
            ]
          }
        ]
      }
    }
  };

  Admin.insert(account);
};


export default prepareUpgradeAccountAdminData;
