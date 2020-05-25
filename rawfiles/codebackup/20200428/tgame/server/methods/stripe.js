/* global SyncedCron */
import stripePackage from 'stripe';
import { check, Match } from 'meteor/check';
import moment from 'moment';
import _get from 'lodash/get';
// eslint-disable-next-line import/named
import { StripeCustomer, Persons, CourseCoupon } from '../../lib/collections';
import { PAYMENT_PLANS, COURSE_PRICE } from '../../lib/enum';
import { emailSubscription } from '../../lib/util';
import { sendEmailAboutCouponExpiration } from '../cronjobs/email';

const stripe = stripePackage(Meteor.settings.private.stripe.liveSecretKey);

const sendEmailToAdmin = (action) => {
  const userId = Meteor.userId();
  const email = Meteor.user().emails[0].address;
  const { username } = Meteor.user();

  Meteor.defer(() => {
    Email.send({
      from: 'TuringGame <support@tgame.ai>',
      to: 'tgameai@gmail.com',
      subject: `User's subscription`,
      html: emailSubscription({
        action, email, userId, username
      })
    });
  });
};

const updateUserType = (userId, subscription, isStudent) => {
  StripeCustomer.update(
    { userId },
    {
      $push: {
        'data.customer.subscriptions.data': subscription
      }
    }
  );
  Meteor.users.update(userId, {
    $set: {
      accountType: subscription.plan.id,
      referralUser: null,
      subscriptionStudentId: isStudent ? subscription.id : null
    }
  });
};

const upgradePaymentPlan = async (currentUser, stripeCustomer, planId, coupon, isReferral, selectedStudents) => {
  const { referralUser } = currentUser;
  const quantity = selectedStudents.length > 0 ? selectedStudents.length : 1;

  const promise = new Promise((resolve, reject) => {
    // Check if customer already had subscription
    if (stripeCustomer.data.customer.subscriptions.data.length > 0) {
      const currentSubscription = stripeCustomer.data.customer.subscriptions.data[0];
      // Retrieve old plan and add new plan
      stripe.subscriptions
        .retrieve(currentSubscription.id)
        .then(Meteor.bindEnvironment((subscription) => {
          StripeCustomer.update(
            { userId: currentUser._id },
            {
              $pull: {
                'data.customer.subscriptions.data': {
                  id: subscription.id
                }
              }
            }
          );
          return stripe.subscriptions.update(
            subscription.id,
            {
              items: [{
                id: subscription.items.data[0].id,
                // If user is referral, use old plan
                plan: isReferral ? stripeCustomer.data.customer.subscriptions.data[0].plan.id : planId,
                quantity: selectedStudents.length > 0 ? currentSubscription.quantity + quantity : 1
              }],
              prorate: false,
              // If user is referral, add 1 month free to old plan
              trial_end: isReferral ? moment(currentSubscription.current_period_end * 1000).add(1, 'month').unix() : currentSubscription.current_period_end,
              coupon
            }
          );
        }))
        .then(subscription => resolve(subscription))
        .catch(err => reject(err));
      sendEmailToAdmin('Update Premium Subscription');
    } else {
      // Create new subscription
      const data = {
        customer: currentUser.stripeCusId,
        items: [
          {
            plan: planId,
            quantity
          }
        ],
        coupon
      };

      // If user has referral user then both of them will get 1 month free
      if (referralUser || isReferral) {
        data.prorate = false;
        data.trial_end = moment().add(1, 'month').unix();
      }
      stripe.subscriptions
        .create(data)
        .then(subscription => resolve(subscription))
        .catch(err => reject(err));
      sendEmailToAdmin('New Premium Subscription');
    }
  });
  const subscription = await promise;

  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    // Update database
    updateUserType(currentUser._id, subscription, false);
    if (selectedStudents.length > 0) {
      const person = Persons.findOne({ userId: currentUser._id });

      if (person && person.teacherProfile) {
        if (!person.teacherProfile.paidStudents) {
          person.teacherProfile.paidStudents = selectedStudents;
        } else {
          person.teacherProfile.paidStudents.push(...selectedStudents);
        }
      }
      Persons.update(
        { userId: currentUser._id },
        {
          $set: {
            teacherProfile: person.teacherProfile
          }
        }
      );
      selectedStudents.map((student) => {
        updateUserType(student, subscription, true);
        return null;
      });
    }
    if (coupon) {
      try {
        const couponPromise = new Promise((resolve, reject) => {
          stripe.coupons
            .retrieve(coupon)
            .then(cp => resolve(cp))
            .catch(err => reject(err));
        });
        const couponData = await couponPromise;

        if (couponData && couponData.duration_in_months) {
          const cronjobTime30Days = moment().add(couponData.duration_in_months - 1, 'month').add(30, 'second');
          const cronjobTime10Days = moment().add(couponData.duration_in_months - 1, 'month').add(20, 'day').add(10, 'second');
          const userId = Meteor.userId();
          const cronjobCoupon = [];
          const addCronjob = (cronjobTime, expirationInDay) => {
            const name = `Coupon expiration ${userId} ${cronjobTime.format('LLL')}`;

            SyncedCron.add({
              name,
              schedule: parser => parser.cron(cronjobTime.format('m H D M d')),
              job: async () => {
                await sendEmailAboutCouponExpiration({ userId, coupon, expirationInDay });
              }
            });
            cronjobCoupon.push(name);
          };

          addCronjob(cronjobTime30Days, 30);
          addCronjob(cronjobTime10Days, 10);
          Meteor.users.update(userId, {
            $set: {
              cronjobCoupon
            }
          });
        }
      } catch (err) {
        throw new Meteor.Error(500, err.message);
      }
    }
  } else {
    throw new Meteor.Error(500, 'Payment has failed, please try again!');
  }
};

const checkIfUserHasStripeCustomer = async (currentUser, stripeCustomer) => {
  try {
    const promise = new Promise((resolve, reject) => {
      stripe.customers
        .retrieve(currentUser.stripeCusId)
        .then(customerData => resolve(customerData))
        .catch(err => reject(err));
    });
    const customer = await promise;

    if (!stripeCustomer && customer && !customer.deleted) {
      StripeCustomer.insert({
        userId: currentUser.userId,
        data: {
          customer
        }
      });
    } else if (!customer || customer.deleted) {
      return {
        stripeCustomer: Meteor.call('createStripeCustomer'),
        currentUser: Meteor.users.findOne(currentUser._id)
      };
    }
  } catch (err) {
    return {
      stripeCustomer: Meteor.call('createStripeCustomer'),
      currentUser: Meteor.users.findOne(currentUser._id)
    };
  }
  return {
    stripeCustomer,
    currentUser
  };
};

export default function () {
  Meteor.methods({
    async stripeGetStripeCustomer() {
      const userId = Meteor.userId();
      if (!userId) {
        throw new Meteor.Error(403, 'Login to continue');
      }
      const currentUser = Meteor.users.findOne(
        {
          _id: userId
        },
        {
          stripeCusId: 1
        }
      );

      if (currentUser.stripeCusId) {
        const promise = new Promise((resolve, reject) => {
          stripe.customers.retrieve(
            currentUser.stripeCusId,
            (err, customer) => {
              if (err) {
                reject(err);
              }
              resolve(customer);
            }
          );
        });
        const customerResult = await promise;
        if (!customerResult) {
          throw new Meteor.Error('customer is not found');
        }
        if (customerResult.subscriptions && customerResult.subscriptions.data && customerResult.subscriptions.data.length > 0) {
          const planId = (customerResult.subscriptions.data[0].items.data[0].plan); // be careful
          // update accountType everytime reload page
          Meteor.users.update(
            { _id: userId }, {
              $set: {
                accountType: planId
              }
            }
          );
        }
        StripeCustomer.update(
          {
            userId
          },
          {
            $set: {
              'data.customer': customerResult
            }
          }
        );
        return customerResult;
      }
      return null;
    },

    stripeAddCustomerStripeCard: async (sourceId) => {
      check(sourceId, String);
      if (!Meteor.userId()) {
        throw new Meteor.Error(403, 'Login to continue');
      }
      const userId = Meteor.userId();
      const currentUser = Meteor.users.findOne(userId);

      try {
        const promise = new Promise((resolve, reject) => {
          stripe.customers
            .createSource(currentUser.stripeCusId, { source: sourceId })
            .then(source => resolve(source))
            .catch(err => reject(err));
        });
        const source = await promise;

        if (source) {
          const stripeCustomer = StripeCustomer.findOne({ userId: Meteor.userId() });

          if (stripeCustomer.data.customer.default_source !== sourceId) {
            StripeCustomer.update(
              { userId },
              {
                $set: {
                  'data.customer.default_source': sourceId
                }
              }
            );
          }
          StripeCustomer.update(
            { userId },
            {
              $inc: {
                'data.customer.sources.total_count': 1
              }
            }
          );
        }
      } catch (error) {
        throw new Meteor.Error(403, error.message);
      }
    },

    stripeSubscribeToPlan: async (sourceId, planId, coupon, selectedStudents) => {
      check(sourceId, Match.Maybe(String));
      check(planId, String);
      check(coupon, Match.Maybe(String));
      check(selectedStudents, Match.Maybe([String]));

      const userId = Meteor.userId();
      const { referralUser } = Meteor.user();

      if (!userId) {
        throw new Meteor.Error(403, 'Login to continue');
      }

      let currentUser = Meteor.users.findOne(userId);
      let stripeCustomer = StripeCustomer.findOne({ userId: Meteor.userId() });

      // Check if user has stripe customer
      const dataReturn = await checkIfUserHasStripeCustomer(currentUser, stripeCustomer);
      // console.log("check 4  " + JSON.stringify(dataReturn));
      currentUser = dataReturn.currentUser; // eslint-disable-line
      // console.log("check 5  " + JSON.stringify(currentUser));
      stripeCustomer = dataReturn.stripeCustomer; // eslint-disable-line

      // Check if students has stripe customer
      if (selectedStudents && selectedStudents.length > 0) {
        // console.log("check 6  ");
        selectedStudents.map(async (student) => {
          const studentData = Meteor.users.findOne(student);
          const stripeStudent = StripeCustomer.findOne({ userId: student });
          await checkIfUserHasStripeCustomer(studentData, stripeStudent);
        });
      }
      // Upgrade payment plan
      if (sourceId) {
        // If customer has no sources, create one
        if (stripeCustomer.data.customer.default_source !== sourceId) {
          Meteor.call('stripeAddCustomerStripeCard', sourceId);
        }
        // If user has referral, upgrade payment for referral user too
        if (referralUser) {
          // console.log("get user data " + JSON.stringify(referralUser));
          const referralUserData = Meteor.users.findOne(referralUser);
          // console.log("get user data " + JSON.stringify(referralUserData));
          const stripeReferral = StripeCustomer.findOne({ userId: referralUser });

          await upgradePaymentPlan(referralUserData, stripeReferral, PAYMENT_PLANS.MONTH_PRO_ROBOT, coupon, true, selectedStudents);
        }
        return upgradePaymentPlan(currentUser, stripeCustomer, planId, coupon, false, selectedStudents);
      }

      // Downgrade to free plan
      if (stripeCustomer.data.customer.subscriptions.data.length > 0) {
        const promise = new Promise((resolve, reject) => {
          stripe.subscriptions
            .del(stripeCustomer.data.customer.subscriptions.data[0].id)
            .then(Meteor.bindEnvironment(subscription => stripe.subscriptions.retrieve(subscription.id)))
            .then(subscription => resolve(subscription))
            .catch(err => reject(err));
        });
        const subscription = await promise;

        // Update database
        if (subscription) {
          StripeCustomer.update(
            { userId },
            {
              $pull: {
                'data.customer.subscriptions.data': {
                  id: subscription.id
                }
              }
            }
          );
          if (currentUser.cronjobCoupon) {
            currentUser.cronjobCoupon.map(name => SyncedCron.remove(name));
          }
          const person = Meteor.user()
            .getPerson();

          if (person && person.teacherProfile && person.teacherProfile.paidStudents) {
            person.teacherProfile.paidStudents.map((studentId) => {
              const student = Meteor.users.findOne(studentId);
              const studentStripe = StripeCustomer.findOne({ userId: studentId });
              const studentSubscriptions = studentStripe.data.customer.subscriptions.data;
              const studentFilteredSubscriptions = studentSubscriptions.filter(studentSubscription => studentSubscription.id !== student.subscriptionStudentId);

              StripeCustomer.update({ userId: studentId }, {
                $pull: {
                  'data.customer.subscriptions.data': {
                    id: student.subscriptionStudentId
                  }
                }
              });
              Meteor.users.update(studentId, {
                $set: {
                  accountType: studentFilteredSubscriptions.length > 0 ? studentFilteredSubscriptions[0].plan.id : PAYMENT_PLANS.FREE_ROBOT,
                  subscriptionStudentId: null
                }
              });
              return null;
            });
            person.teacherProfile.paidStudents = [];
            Persons.update({ userId: Meteor.userId() }, {
              $set: {
                teacherProfile: person.teacherProfile
              }
            });
          }
        }
        sendEmailToAdmin('Cancel Premium Subscription');
      }
      Meteor.users.update(Meteor.userId(), {
        $set: {
          accountType: planId,
          referralUser: null
        },
        $unset: {
          officialBotReleases: ''
        }
      });

      return true;
    },

    stripeSetDefaultCard: (sourceId) => {
      check(sourceId, String);
      if (!Meteor.userId()) {
        throw new Meteor.Error(403, 'Login to continue');
      }
      const currentUser = Meteor.user();
      stripe.customers.update(
        currentUser.stripeCusId,
        {
          default_source: sourceId
        }
      ).then(Meteor.bindEnvironment((result) => {
        if (result.error) {
          throw new Meteor.Error(403, result.error.message);
        }
        const userId = Meteor.userId();
        StripeCustomer.update(
          {
            userId
          },
          {
            $set: {
              data: {
                customer: result
              }
            }
          }
        ); // end stripeCustomer update
      }));
      return true;
    },

    stripeRemoveCard(sourceId) {
      check(sourceId, String);
      if (!Meteor.userId()) {
        throw new Meteor.Error(403, 'Login to continue');
      }
      const currentUser = Meteor.user();
      stripe.customers.deleteCard(
        currentUser.stripeCusId,
        sourceId
      ).then(Meteor.bindEnvironment((result) => {
        if (result.error) {
          throw new Meteor.Error(403, result.error.message);
        }

        StripeCustomer.update(
          {
            userId: this.userId
          },
          {
            $inc: {
              'data.customer.sources.total_count': -1
            }
          }
        ); // end stripeCustomer update
      }));
      return true;
    },

    async stripeCancelStudentSubscription(studentId) {
      check(studentId, String);

      if (!Meteor.userId()) {
        throw new Meteor.Error(403, 'Login to continue');
      }
      const student = Meteor.users.findOne(studentId);

      if (!student) {
        throw new Meteor.Error(403, 'Student not found');
      }
      const studentStripe = StripeCustomer.findOne({ userId: studentId });
      const currentStripe = StripeCustomer.findOne({ userId: Meteor.userId() });
      const person = Meteor.user().getPerson();

      if (!studentStripe) {
        throw new Meteor.Error(403, 'Student Stripe not found');
      }
      if (!currentStripe) {
        throw new Meteor.Error(403, 'User Stripe not found');
      }
      const studentSubscriptions = studentStripe.data.customer.subscriptions.data;
      const studentFilteredSubscriptions = studentSubscriptions.filter(subscription => subscription.id !== student.subscriptionStudentId);
      const promise = new Promise((resolve, reject) => {
        stripe.subscriptions
          .retrieve(student.subscriptionStudentId)
          .then(Meteor.bindEnvironment((subscription) => {
            StripeCustomer.update({ userId: studentId }, {
              $pull: {
                'data.customer.subscriptions.data': {
                  id: student.subscriptionStudentId
                }
              }
            });
            Meteor.users.update(studentId, {
              $set: {
                accountType: studentFilteredSubscriptions.length > 0 ? studentFilteredSubscriptions[0].plan.id : PAYMENT_PLANS.FREE_ROBOT,
                subscriptionStudentId: null
              }
            });
            person.teacherProfile.paidStudents = person.teacherProfile.paidStudents.filter(studentIdElement => studentIdElement !== studentId);
            Persons.update({ userId: Meteor.userId() }, {
              $set: {
                teacherProfile: person.teacherProfile
              }
            });
            return stripe.subscriptions.update(
              subscription.id,
              {
                items: [{
                  id: subscription.items.data[0].id,
                  plan: currentStripe.data.customer.subscriptions.data[0].plan.id,
                  quantity: person.teacherProfile.paidStudents.length + 1
                }],
                prorate: false,
                trial_end: currentStripe.data.customer.subscriptions.data[0].current_period_end
              }
            );
          }))
          .then(subscription => resolve(subscription))
          .catch(err => reject(err));
      });
      const subscription = await promise;

      if (subscription) {
        StripeCustomer.update(
          {
            userId: Meteor.userId(),
            'data.customer.subscriptions.data.id': subscription.id
          },
          {
            $set: {
              'data.customer.subscriptions.data.$': subscription
            }
          }
        );
      }
      sendEmailToAdmin(`Remove Student's Premium Subscription`);
    },

    stripeBuyACourse(gameId, packageType, sourceId, coupon) {
      check(sourceId, Match.Maybe(String));
      check(gameId, Match.Maybe(String));
      check(packageType, Match.Maybe(String));
      check(coupon, Match.Maybe(String));

      const userId = Meteor.userId();

      if (!userId) {
        throw new Meteor.Error(403, 'Please login first!');
      }

      let price = _get(COURSE_PRICE, [gameId, packageType], 0);

      if (coupon) {
        const couponData = CourseCoupon.findOne({ couponCode: coupon });

        if (!couponData) {
          throw new Meteor.Error(400, 'Invalid coupon!');
        }

        const { expirationYear, expirationMonth, expirationDay } = couponData;
        const expiredDate = moment({ year: expirationYear, month: expirationMonth - 1, day: expirationDay });
        const expiredDateString = expiredDate.format('YYYY-MM-DD');
        const currentDateString = moment().format('YYYY-MM-DD');

        if (currentDateString > expiredDateString) {
          throw new Meteor.Error(400, 'Coupon has expired!');
        }

        price *= (1 - couponData.discountPercentage);
      }

      if (price <= 0) {
        throw new Meteor.Error(400, 'Price can not be 0!');
      }

      stripe.charges.create(
        {
          amount: price,
          currency: 'usd',
          source: sourceId,
          description: 'Charge'
        },
        Meteor.bindEnvironment((error) => {
          if (error) {
            const { code, message } = error;
            throw new Meteor.Error(code, message);
          }

          const paymentObj = { gameId, packageType };

          Meteor.users.update(
            {
              _id: userId
            },
            {
              $addToSet: { boughtCourse: paymentObj }
            }
          );
        })
      );
    }
  });
}
