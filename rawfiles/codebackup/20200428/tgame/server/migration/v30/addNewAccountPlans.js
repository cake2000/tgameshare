import { BILLING_TYPES, PAYMENT_PLANS, PAYMENT_PRICE } from '../../../lib/enum';
import { Admin } from '../../../lib/collections';

const addNewAccountPlans = () => {
  Admin.remove({ type: 'accounts' });

  const account = {
    type: 'accounts',
    data: {
      title: 'Account Plans',
      description: 'Pick an account plan that fits your workflow',
      plans: [
        {
          name: 'Starter',
          isFree: true,
          features: [
            {
              name: 'Practice games',
              explanation: 'Practice playing yourself manually or using your game bot'
            },
            {
              name: 'Online battles',
              explanation: 'Online games with friends and family, manually or with your game bot'
            },
            {
              name: 'Beginner courses',
              explanation: 'Only the beginner level courses'
            },
            {
              name: 'Beginner level games',
              explanation: 'Only the beginner difficulty'
            }
          ]
        },
        {
          name: 'Premium',
          price: {
            monthly: {
              planId: PAYMENT_PLANS.MONTH_PRO_ROBOT,
              price: PAYMENT_PRICE[BILLING_TYPES.MONTHLY].price
            }
            // annual: {
            //   planId: PAYMENT_PLANS.YEAR_PRO_ROBOT,
            //   price: PAYMENT_PRICE[BILLING_TYPES.ANNUAL].price
            // }
          },
          isFree: false,
          features: [
            {
              name: 'Practice games',
              explanation: 'Practice playing yourself manually or using your game bot'
            },
            {
              name: 'Online battles',
              explanation: 'Online games with friends and family, manually or with your game bot'
            },
            {
              name: 'All course levels',
              explanation: 'All course levels (beginner, intermediate, advanced)'
            },
            {
              name: 'All game levels',
              explanation: 'All difficulties of games'
            },
            {
              name: 'Customized test cases in factory',
              explanation: 'Define your own test cases in gamebot factory'
            },
            {
              name: 'Compete for leaderboard',
              explanation: 'Compete with others in the Leaderboard'
            },
            {
              name: 'Official rating/ranking',
              explanation: 'Official rating and ranking for your game bot'
            }
          ]
        }
      ]
    }
  };

  console.log('insert account info');

  Admin.insert(account);
};

export default addNewAccountPlans;
