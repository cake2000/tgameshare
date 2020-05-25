import prepareNewCourse from './prepareNewCourse.js';
import addNewLesson from './addNewLesson.js';
import createCoupon from './createCoupon';
import addNewAccountPlans from './addNewAccountPlans';
import createPlans from './createPlans';
import prepareScratchGame from './prepareScratchGame';
import updateNewStripeCustomerData from './updateNewStripeCustomerData';
import prepareCourseCouponData from './createCourseCoupon';

Migrations.add({
  version: 32,
  name: 'Prepare data for v32',
  up() {
    // prepareScratchGame();
    // addNewLesson();
    // prepareNewCourse();

    // addNewAccountPlans();
    // prepareCourseCouponData();
    // createPlans();
    // createCoupon();
    // updateNewStripeCustomerData();
  },
  down() {
  }
});
