import { CourseCoupon } from '../../../lib/collections';

const courseCouponData = [
  {
    _id: '1',
    couponCode: 'TGAME20QG_40',
    discountPercentage: 0.4,
    expirationYear: 2020,
    expirationMonth: 12,
    expirationDay: 31
  },
  {
    _id: '2',
    couponCode: 'TGAME20RT3_80',
    discountPercentage: 0.8,
    expirationYear: 2020,
    expirationMonth: 12,
    expirationDay: 31
  },
  {
    _id: '3',
    couponCode: 'TGAME20WT_20',
    discountPercentage: 0.2,
    expirationYear: 2020,
    expirationMonth: 12,
    expirationDay: 31
  },
  {
    _id: '4',
    couponCode: 'TGAME20SR_30',
    discountPercentage: 0.3,
    expirationYear: 2020,
    expirationMonth: 12,
    expirationDay: 31
  },
  {
    _id: '5',
    couponCode: 'TGAME20U8_50',
    discountPercentage: 0.5,
    expirationYear: 2020,
    expirationMonth: 12,
    expirationDay: 31
  },
  {
    _id: '6',
    couponCode: 'TGSX',
    discountPercentage: 0.3,
    expirationYear: 2020,
    expirationMonth: 4,
    expirationDay: 31
  },
  {
    _id: '7',
    couponCode: 'OFF20WH',
    discountPercentage: 0.2,
    expirationYear: 2020,
    expirationMonth: 12,
    expirationDay: 31
  }
];

const prepareCourseCouponData = () => {
  CourseCoupon.remove({ _id: '1' });
  CourseCoupon.remove({ _id: '2' });
  CourseCoupon.remove({ _id: '3' });
  CourseCoupon.remove({ _id: '4' });
  CourseCoupon.remove({ _id: '5' });
  CourseCoupon.remove({ _id: '6' });
  CourseCoupon.remove({ _id: '7' });

  _.map(courseCouponData, (coupon) => {
    CourseCoupon.insert(coupon);
  });
};

export default prepareCourseCouponData;
