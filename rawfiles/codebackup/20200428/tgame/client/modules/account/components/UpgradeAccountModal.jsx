import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { BILLING_TYPES, ROLES, PAYMENT_PLANS } from '../../../../lib/enum.js';
import { MESSAGES } from '../../../../lib/const.js';


const message = MESSAGES().UPGRADE_ACCOUNT_MODAL;

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '840px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '0px',
    display: 'flex',
    alignItems: 'center',
  }
};
export default class UpgradeAccountModal extends React.Component {
  static propTypes = {
    accountData: PropTypes.object
  }

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {
      billingType: BILLING_TYPES.MONTHLY
    };
  }


  changeBillingType(type) {
    this.setState({ billingType: BILLING_TYPES[type] });
  }

  renderBillingType = () => {
    const { accountData } = this.props;
    const { billingType } = this.state;
    return (
      <div className="modal__content__billing">
        <div className="modal__content__billing__desc">
          {accountData.description}
        </div>
        <div className="modal__content__billing__switch">
          <div className="modal__content__billing__switch__label">
            <span>{MESSAGES.BILLING_TYPES}</span>
          </div>
          <div className="modal__content__billing__switch__action">
            {
              _.map(BILLING_TYPES.ARRAY_OBJECT, (type, index) => {
                return (
                  <button
                    className={BILLING_TYPES[type.key] === billingType ? 'btn disabled' : 'btn'}
                    key={index}
                    onClick={() => this.changeBillingType(type.key)}
                  >{type.value}</button>
                );
              })
            }
          </div>

        </div>
      </div>
    );
  }

  renderPlanItem = (plan, key) => {
    const { billingType } = this.state;
    return (
      <div className="modal__content__plans__item plan-item" key={key}>
        <div className="plan-item__title">
          {plan.name}
        </div>
        <div className="plan-item__price">
          {
            plan.isFree ? message.FREE_PRICE :
              plan.price[billingType].price
          }
        </div>
        <div className="plan-item__price--desc" />
        {/* <div className="plan-item__desc">
          Free forever when you host with Webflow. Free for freelancers with Client Billing.
      </div> */}
        <div className="plan-item__features">
          {
            _.map(plan.features, (feature, index) => {
              return (
                <div className="plan-item__features__item" key={index}>
                  <span>{feature}</span>
                  <a href="#"><i className="fa fa-question-circle-o" /></a>
                </div>
              );
            })
          }
          <div className="plan-item__features__item">
            {this.renderPlanButton(plan)}
          </div>
        </div>
      </div>
    );
  }

  downgradePlan = (plan) => {
    const { subscribeToPlan,
      toggleUpgradeAccountModal, loadingData } = this.props;
    loadingData();
    toggleUpgradeAccountModal();
    subscribeToPlan(null, plan,
      () => {
      });
  }

  renderPlanButton = (plan) => {
    const { subscribedPlan, deactiveAccount, history } = this.props;
    const _deactiveAccount = () => {
      deactiveAccount(() => {
        history.push('/');
      });
    };
    if (plan.isFree) {
      return (
        <button
          className="btn"
          onClick={_deactiveAccount}
        >
          {message.BUTTON_CANCEL}
        </button>
      );
    }
    if (Roles.userIsInRole(Meteor.userId(), ROLES.AI)) {
      if (subscribedPlan.includes(PAYMENT_PLANS.MONTH_PRO_ROBOT) ||
        subscribedPlan.includes(PAYMENT_PLANS.YEAR_PRO_ROBOT)) {
        return (
          <button className="btn" onClick={() => { this.downgradePlan(PAYMENT_PLANS.FREE_ROBOT); }}>{message.BUTTON_CANCEL}</button>
        );
      }
      return (
        <button className="btn" onClick={() => { this.goToPaymentDetail(plan); }}>{message.BUTTON_UPGRADE}</button>
      );
    }
      // no need for upgrade for human account
    return (<div />);

    if (subscribedPlan.includes(PAYMENT_PLANS.MONTH_PRO_HUMAN) ||
      subscribedPlan.includes(PAYMENT_PLANS.YEAR_PRO_HUMAN)) {
      return (
        <button className="btn" onClick={() => { this.downgradePlan(PAYMENT_PLANS.FREE_HUMAN); }} >{message.BUTTON_CANCEL}</button>
      );
    }
    return (
      <button className="btn" onClick={() => { this.goToPaymentDetail(plan); }}>{message.BUTTON_UPGRADE}</button>
    );
  }

  goToPaymentDetail = (plan) => {
    const { toggleUpgradeAccountModal, togglePaymentDetailModal, setPlanToSubcribe } = this.props;
    const { billingType } = this.state;

    toggleUpgradeAccountModal();
    setPlanToSubcribe(plan.price[billingType].planId);
    togglePaymentDetailModal();
  }

  renderPlans = () => {
    const { accountData } = this.props;
    const plans = Roles.userIsInRole(Meteor.userId(), ROLES.AI) ?
      accountData.plans[ROLES.AI] : accountData.plans[ROLES.MANUAL];

    return (
      <div className="modal__content__plans">
        {
          _.map(plans, (plan, index) => {
            return this.renderPlanItem(plan, index)
              ;
          })
        }
      </div>
    );
  }
  render() {
    const { showModal, toggleUpgradeAccountModal, shouldUpdateInfo } = this.props;
    const updateBirthdayMsg = MESSAGES().UPDATE_BIRTHDAY;
    const title = !shouldUpdateInfo ? message.TITLE : updateBirthdayMsg.TITLE;

    return (
      <Modal
        style={StyleModal}
        isOpen={showModal}
        contentLabel={'Modal'}
      >
        <div className="upgrade-account-modal" id="account-plans">
          <div className="modal__header">
            <div className="modal__header--title">{title}</div>
            <div className="modal__header--close" onClick={() => toggleUpgradeAccountModal()} role="presentation">x</div>
          </div>
          <div className="modal__body">
            <div className="modal__body--img">
              <img src="/images/tboticon.png" alt="tbot icon" />
            </div>
            <div className="modal__body--content">
              <p className="text">This feature will be available soon</p>
              <div className="btn--group">
                <div className="btn btn-info" role="presentation" onClick={() => toggleUpgradeAccountModal()}>OK</div>
              </div>
              {shouldUpdateInfo ? updateBirthdayMsg.MESSAGE : ''}
              {!shouldUpdateInfo ? this.renderBillingType() : ''}
              {!shouldUpdateInfo ? this.renderPlans() : ''}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
