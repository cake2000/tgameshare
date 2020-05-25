import stripePackage from 'stripe';
import { StripeCustomer } from '../../../lib/collections';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

const createStripeCustomer = (userId, stripeCusId) => {
  if (stripeCusId) {
    stripe.customers
      .retrieve(stripeCusId)
      .then(Meteor.bindEnvironment(() => {
        return stripe.customers.del(stripeCusId);
      }))
      .catch(Meteor.bindEnvironment(err => console.log(err)));
  }
  stripe.customers.create(
    {
      description: `Stripe Customer user ${userId}`
    }
  ).then(Meteor.bindEnvironment((customer) => {
    Meteor.users.update(
      { _id: userId }, {
        $set: {
          stripeCusId: customer.id
        }
      }
    );
    StripeCustomer.insert({
      userId,
      data: {
        customer
      }
    });
  })).catch((err) => {
    console.log(err);
  });
};

const updateNewStripeCustomerData = () => {
  StripeCustomer.remove({});
  Meteor.users.find({}, { fields: { _id: 1, stripeCusId: 1 } }).map((user) => {
    createStripeCustomer(user._id, user.stripeCusId);
    return null;
  });
};

export default updateNewStripeCustomerData;
