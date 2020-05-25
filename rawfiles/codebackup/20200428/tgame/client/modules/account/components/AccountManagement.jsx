import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import moment from 'moment';
import swal from 'sweetalert';
import {
  BILLING_TYPES, PAYMENT_PLANS, PAYMENT_FREE, USER_TYPES, PAYMENT_PRO
} from '../../../../lib/enum';
import { MESSAGES } from '../../../../lib/const';
import AddPaymentCardModal from '../containers/AddPaymentCardModal';
import CouponModal from './CouponModal.jsx';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';
import StudentListModal from '../containers/StudentList';

const message = MESSAGES().UPGRADE_ACCOUNT_MODAL;

class AccountManagement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      billingType: BILLING_TYPES.MONTHLY,
      openPaymentCardModal: false,
      openCouponModal: false,
      openStudentAccountsModal: false,
      planId: null,
      coupon: null,
      isLoading: false,
      todayTotal: 0,
      paymentMonthly: 0,
      billingDate: moment().format('MM/DD/YYYY'),
      referralUser: null,
      premiumPlan: null,
      selectedStudents: [],
      cannotCancel: false,
      couponExpiration: null
    };
  }

  componentWillReceiveProps(nextProps) {
    const { userData, stripeCustomer } = this.props;

    if (JSON.stringify(nextProps.userData) !== JSON.stringify(userData)) {
      const { referralUser, accountType } = nextProps.userData;

      if (referralUser && PAYMENT_FREE.includes(accountType)) {
        Meteor.call('getUsername', referralUser, (err, res) => {
          if (res) {
            this.setState({
              referralUser: {
                id: referralUser,
                name: res
              }
            });
          }
        });
      }
    }
    if (!userData) {
      this.setState({ referralUser: null });
    }
    if (JSON.stringify(stripeCustomer) !== JSON.stringify(nextProps.stripeCustomer) && nextProps.stripeCustomer) {
      if (nextProps.stripeCustomer.subscriptions.data.length > 0 && nextProps.stripeCustomer.subscriptions.data[0].discount && nextProps.stripeCustomer.subscriptions.data[0].discount.coupon) {
        const { coupon, end } = nextProps.stripeCustomer.subscriptions.data[0].discount;
        const couponEnd = moment(end * 1000);

        if (couponEnd.isAfter(moment())) {
          this.setState({
            couponExpiration: `Coupon will expire at ${couponEnd.format('LL')}`
          });
        }
        this.getCoupon(coupon.id, true);
      }
    }
  }

  getOffPrice = (plan, type) => {
    const { coupon } = this.state;
    let { billingType } = this.state;

    if (type) {
      billingType = type;
    }
    let offPrice = plan.isFree ? 0 : plan.price[billingType].price;

    if (coupon && !plan.isFree) {
      if (coupon.percentOff) {
        offPrice -= offPrice * coupon.percentOff / 100;
      }
      if (coupon.amountOff) {
        offPrice -= (coupon.amountOff / 100);
      }
    }
    return offPrice;
  };

  changeBillingType = (type, planId) => {
    if (planId) {
      const { accountData } = this.props;
      const { plans } = accountData || [];
      const planData = plans.find(plan => plan.price && plan.price[type].planId === planId);

      this.calculatePaymentDetails(planData, type);
    } else {
      this.setState({ billingType: type });
    }
  };

  renderBillingType = () => {
    const {
      billingType, coupon, cannotCancel, couponExpiration
    } = this.state;

    return (
      <div className="modal__content__billing">
        <div className="modal__content__billing__desc">
          Account Plans
        </div>
        <div>
          <div className="modal__content__billing__switch">
            <div className="modal__content__billing__switch__title">
              {'Billing type: '}
            </div>
            <div className="modal__content__billing__switch__wrapper">
              <div className="modal__content__billing__switch__action">
                {
                  _.map(BILLING_TYPES.ARRAY_OBJECT, (type, index) => {
                    return (
                      <button
                        className={BILLING_TYPES[type.key] === billingType ? 'billing-btn disabled' : 'billing-btn'}
                        key={index}
                        onClick={() => this.changeBillingType(BILLING_TYPES[type.key])}
                        type="button"
                      >
                        {type.value}
                      </button>
                    );
                  })
                }
              </div>
            </div>
          </div>
          {
            coupon ? (
              <div className="modal__content__billing__switch__coupon has-coupon">
                {`Coupon: ${coupon.name} `}
                {
                  !cannotCancel && (
                    <i
                      className="fa fa-times"
                      onClick={() => this.getCoupon(null)}
                      role="presentation"
                    />
                  )
                }
              </div>
            ) : (
              <div
                className="modal__content__billing__switch__coupon"
                onClick={this.handleOpenCouponModal}
                role="presentation"
              >
                Apply Coupon
              </div>
            )
          }
          {
            couponExpiration && (
              <div className="modal__content__billing__switch__coupon coupon-expiration">
                {couponExpiration}
              </div>
            )
          }
        </div>
      </div>
    );
  };

  renderPrice = (plan) => {
    const paidBySchool = !!Meteor.user().subscriptionStudentId;
    const { coupon, billingType } = this.state;

    if (paidBySchool) {
      return (
        <span className="current-price paid-by-school">
          {message.PAID_BY_SCHOOL}
        </span>
      );
    }
    return (
      <span className={`current-price ${coupon && 'has-coupon'}`}>
        <i className="fa fa-usd" />
        {plan.price[billingType].price}
      </span>
    );
  };

  renderPlanItem = (plan, key) => {
    const { billingType, coupon } = this.state;
    const { accountType } = Meteor.user();
    const { accountData } = this.props;
    const { plans } = accountData || [];
    const currentPlan = (!plan.isFree && accountType === plan.price[billingType].planId) || (PAYMENT_FREE.includes(accountType) && plan.isFree);
    const offPrice = this.getOffPrice(plan);
    const person = Meteor.user().getPerson();
    const showStudentsModal = plan.name !== 'Starter' && person && person.type.includes(USER_TYPES.TEACHER) && PAYMENT_PRO.includes(accountType);
    const paidBySchool = !!Meteor.user().subscriptionStudentId;

    return (
      <div className="modal__content__plans__container" key={key}>
        <div className={`modal__content__plans__item plan-item ${currentPlan && 'current-plan'}`}>
          <ReactTooltip place="bottom" />
          <div className={`plan-item__title ${!plan.isFree && 'premium-title'}`}>
            {plan.name}
          </div>
          <div className="plan-item__price">
            {
              plan.isFree ? message.FREE_PRICE : this.renderPrice(plan)
            }
            {
              !plan.isFree && coupon && !paidBySchool && (
                <span className="new-price">
                  <i className="fa fa-usd" />
                  {offPrice.toFixed(2)}
                </span>
              )
            }
            {
              !plan.isFree && !paidBySchool && (
                <span className={`plan-item__price--duration ${coupon && 'has-coupon'}`}>
                  {`/${BILLING_TYPES.ARRAY_OBJECT.find(item => BILLING_TYPES[item.key] === billingType).text}`}
                </span>
              )
            }
          </div>
          <div className="plan-item__price--desc" />
          <div className="plan-item__features">
            {
              _.map(plan.features, (feature, index) => {
                let diff = false;

                if (key > 0) {
                  diff = !plans[key - 1].features.find(ft => ft.name === feature.name);
                }
                return (
                  <div className={`plan-item__features__item ${diff && 'different-item'}`} key={index}>
                    <span>{feature.name}</span>
                    <i className="fa fa-question-circle-o" data-tip={feature.explanation} />
                  </div>
                );
              })
            }
          </div>
          <div className="plan-item__button">
            {this.renderPlanButton(plan, currentPlan)}
          </div>
        </div>
        {
          showStudentsModal && (
            <div
              className="modal__content__plans__students"
              onClick={this.handleOpenStudentAccountsModal(plan)}
              role="presentation"
            >
              Manage Student Accounts
            </div>
          )
        }
      </div>
    );
  };

  downgradePlan = (plan) => {
    const {
      subscribeToPlan
    } = this.props;
    swal({
      title: 'You will lose access to all intermediate lessons and forfeit your official game bot ratings',
      text: '',
      icon: 'warning',
      buttons: {
        confirm: {
          text: 'Downgrade',
          value: true,
          visible: true,
          className: "",
          closeModal: true
        },
        cancel: {
          text: 'Cancel',
          value: null,
          visible: true,
          className: '',
          closeModal: true
        }
      },
      dangerMode: true
    })
      .then((confirmed) => {
        if (confirmed) {
          this.handleLoading();
          subscribeToPlan(null, plan, null, [], (err) => {
            if (err) {
              console.log(err);
            } else {
              this.setState({
                coupon: null,
                couponExpiration: null
              });
            }
            this.handleLoading();
          });
        }
      });
  };

  renderPlanButton = (plan, currentPlan) => {
    const { subscribedPlan, stripeCustomer } = this.props;
    const { isLoading } = this.state;
    let buttonName = message.CURRENT_PLAN;
    let onClickFunction = () => {};
    let variable = null;
    let subName = null;

    if (!currentPlan) {
      if (plan.isFree) {
        buttonName = message.BUTTON_DOWNGRADE;
        onClickFunction = this.downgradePlan;
        variable = PAYMENT_PLANS.FREE_ROBOT;
      } else {
        onClickFunction = this.goToPaymentDetail;
        variable = plan;
        if (subscribedPlan.length === 0) {
          buttonName = message.BUTTON_UPGRADE;
        } else {
          buttonName = message.BUTTON_UPDATE_PERIOD;
        }
      }
    } else if (!plan.isFree && stripeCustomer && stripeCustomer.subscriptions.data.length > 0) {
      subName = `(Next Bill: ${moment(stripeCustomer.subscriptions.data[0].current_period_end * 1000).format('MM/DD/YYYY')})`;
      onClickFunction = this.goToPaymentDetail;
      variable = plan;
    }

    if (buttonName !== message.CURRENT_PLAN && Meteor.user().subscriptionStudentId) return null;
    return (
      <button
        className={`btn ${currentPlan ? 'current-plan-btn' : buttonName === message.BUTTON_UPDATE_PERIOD ? 'updatepay-btn' : buttonName === message.BUTTON_UPGRADE ? 'upgrade-btn' : 'downgrade-btn'}`}
        onClick={() => onClickFunction(variable)}
        type="button"
        disabled={isLoading}
      >
        {
          isLoading ? (
            <LoadingIcon />
          ) : [
            (
              <div key={buttonName}>{buttonName}</div>
            ),
            subName && (
              <div className="sub-name" key={subName}>{subName}</div>
            )
          ]
        }
      </button>
    );
  };

  calculatePaymentDetails = (plan, type, numberOfStudents = 0) => {
    const { referralUser } = this.state;
    let { billingType } = this.state;

    if (type) {
      billingType = type;
    }
    const { stripeCustomer, subscribedPlan } = this.props;
    const currentPlan = plan.price[billingType];
    const isMonthly = billingType === BILLING_TYPES.MONTHLY;
    const person = Meteor.user().getPerson() || {};
    let paidStudents = 0;

    if (person.teacherProfile && person.teacherProfile.paidStudents) {
      paidStudents = person.teacherProfile.paidStudents.length;
    }
    const offPrice = this.getOffPrice(plan, billingType) * (paidStudents + numberOfStudents + 1);
    const doesChangePaymentPeriod = subscribedPlan.length > 0;
    let billingDate = doesChangePaymentPeriod ? moment(stripeCustomer.subscriptions.data[0].current_period_end * 1000).format('MM/DD/YYYY')
      : moment().add(1, isMonthly ? 'month' : 'year').format('MM/DD/YYYY');

    if (referralUser) {
      billingDate = doesChangePaymentPeriod ? moment(billingDate).add(1, 'month').format('MM/DD/YYYY')
        : moment().add(1, 'month').format('MM/DD/YYYY');
    }
    this.setState({
      planId: currentPlan.planId,
      todayTotal: offPrice.toFixed(2),
      paymentMonthly: isMonthly ? offPrice.toFixed(2) : (offPrice / 12).toFixed(2),
      billingDate
    });
  };

  goToPaymentDetail = (plan, selectedStudents = []) => {
    this.setState({ selectedStudents });
    this.calculatePaymentDetails(plan, null, selectedStudents.length);
    this.handleOpenPaymentCardModal();
  };

  renderPlans = () => {
    const { accountData } = this.props;
    const { plans } = accountData || [];

    return (
      <div className="modal__content__plans">
        {
          _.map(plans, (plan, index) => this.renderPlanItem(plan, index))
        }
      </div>
    );
  };

  handleOpenPaymentCardModal = () => {
    this.setState(previousState => ({ openPaymentCardModal: !previousState.openPaymentCardModal }));
  };

  handleOpenCouponModal = () => {
    this.setState(previousState => ({ openCouponModal: !previousState.openCouponModal }));
  };

  handleOpenStudentAccountsModal = plan => () => {
    this.setState(previousState => ({ openStudentAccountsModal: !previousState.openStudentAccountsModal, premiumPlan: plan }));
  };

  getCoupon = (coupon, cannotCancel = false, callback = () => {}) => {
    const { applyCoupon } = this.props;

    if (coupon) {
      applyCoupon(coupon, (err, res) => {
        if (res) {
          this.setState({
            coupon: {
              name: coupon,
              percentOff: res.percentOff,
              amountOff: res.amountOff
            },
            cannotCancel
          });
          callback(null);
        } else {
          callback('Sorry, the coupon you entered is invalid');
        }
      });
    } else {
      this.setState({ coupon: null });
    }
  };

  handleLoading = () => {
    this.setState(previousState => ({ isLoading: !previousState.isLoading }));
  };

  render() {
    const { accountData, subscribedPlan } = this.props;
    const {
      openPaymentCardModal, planId, openCouponModal,
      todayTotal, paymentMonthly, billingDate, coupon,
      referralUser, billingType, openStudentAccountsModal,
      premiumPlan, selectedStudents
    } = this.state;
    const doesChangePaymentPeriod = !!(subscribedPlan.length > 0 || referralUser);

    return (
      <div className="tg-page tg-page--general tg-page--playerHome account-plans">
        <div className="gamesboard__wrapper tg-tutorial__container">
          <div className="tg-page__container__wrapper">
            <div className="upgrade-account">
              {
                referralUser && (
                  <div className="referral-message">
                    {`* This is from the referral of ${referralUser.name}, and both you and ${referralUser.name} will get 1 month free after sign up`}
                  </div>
                )
              }
              <div className="modal__body">
                <div className="modal__body--content">
                  {accountData && this.renderBillingType()}
                  {accountData && this.renderPlans()}
                </div>
              </div>
            </div>
          </div>
        </div>
        {
          openPaymentCardModal && (
            <AddPaymentCardModal
              showModal={openPaymentCardModal}
              toggleAddPaymentCardModal={this.handleOpenPaymentCardModal}
              planId={planId}
              handleLoading={this.handleLoading}
              todayTotal={todayTotal}
              doesChangePaymentPeriod={doesChangePaymentPeriod}
              paymentMonthly={paymentMonthly}
              billingDate={billingDate}
              coupon={coupon}
              changeBillingType={this.changeBillingType}
              billingType={billingType}
              selectedStudents={selectedStudents}
            />
          )
        }
        {
          openCouponModal && (
            <CouponModal
              showModal={openCouponModal}
              toggleCouponModal={this.handleOpenCouponModal}
              submitCoupon={this.getCoupon}
            />
          )
        }
        {
          openStudentAccountsModal && (
            <StudentListModal
              showModal={openStudentAccountsModal}
              toggleStudentAccountsModal={this.handleOpenStudentAccountsModal}
              goToPaymentDetail={this.goToPaymentDetail}
              premiumPlan={premiumPlan}
            />
          )
        }
      </div>
    );
  }
}

AccountManagement.propTypes = {
  stripeCustomer: PropTypes.shape(),
  subscribedPlan: PropTypes.arrayOf(PropTypes.string),
  accountData: PropTypes.shape(),
  subscribeToPlan: PropTypes.func.isRequired,
  applyCoupon: PropTypes.func.isRequired
};

AccountManagement.defaultProps = {
  stripeCustomer: null,
  subscribedPlan: null,
  accountData: null
};

export default AccountManagement;
