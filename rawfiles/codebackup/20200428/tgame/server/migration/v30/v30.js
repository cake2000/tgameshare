import prepareNewCourse from './prepareNewCourse.js';
import addNewLesson from './addNewLesson.js';
import createCoupon from './createCoupon';
import addNewAccountPlans from './addNewAccountPlans';
import createPlans from './createPlans';
import prepareScratchGame from './prepareScratchGame';
import updateNewStripeCustomerData from './updateNewStripeCustomerData';
import prepareCourseCouponData from './createCourseCoupon';

Migrations.add({
  version: 30,
  name: 'Prepare data for v30',
  up() {
    addNewLesson();
    prepareNewCourse();
    prepareScratchGame();

    addNewAccountPlans();
    prepareCourseCouponData();
    // createPlans();
    // createCoupon();
    // updateNewStripeCustomerData();
  },
  down() {
  }
});
