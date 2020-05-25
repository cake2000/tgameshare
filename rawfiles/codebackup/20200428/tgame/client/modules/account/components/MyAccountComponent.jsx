/* global WOW */
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import Banner from '../../core/components/Banner.jsx';
import Avatar from '../../core/components/Avatar.jsx';
import FormEditBasicInfo from './FormEditBasicInfo.jsx';
// import FormEditPayMentInfo from './FormEditPaymentInfo.jsx';
import UpgradeAccountModal from '../containers/UpgradeAccountModal.js';
import AddPaymentCardModal from '../containers/AddPaymentCardModal.js';
import PaymentDetailModal from '../containers/PaymentDetailModal.js';
import AddTeacherModal from './AddTeacherModal.jsx';
import ManageTeacherSection from '../containers/ManageTeacherSection.js';
import TeacherAccountModal from '../containers/TeacherAccountModal.js';
import {
  ACCOUNT_TYPES, USER_TYPES, SCHOOL_GRADES, CARD_TYPE, PAYMENT_PLANS
} from '../../../../lib/enum.js';
import { MESSAGES } from '../../../../lib/const.js';

const message = MESSAGES().MY_ACCOUNT_COMPONENT;

class MyAccountComponent extends React.Component {
  static propTypes = {
    userError: PropTypes.any,
    userData: PropTypes.objectOf(PropTypes.any).isRequired,
    updateUserAction: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      editPayMentForm: false,
      showUpgradeAccountModal: false,
      showPaymentDetailModal: false,
      showAddPaymentCardModal: false,
      showTeacherAccountModal: false,
      planToSubscribe: null,
      subscribedPlan: [],
      accountType: ACCOUNT_TYPES.FREE,
      stripeCustomer: null,
      _isLoading: false,
      error: null,
      isCompletedLesson: true
    };
  }

  componentWillMount() {
    const { history, userData, checkIfCompletedAllLesson } = this.props;
    if (!Meteor.userId()) {
      history.push('/');
    }
    // checkIfCompletedAllLesson((err, res) => {
    //   if (err) {
    //     console.log('Error: ', err);
    //   } else {
    //     this.setState({ isCompletedLesson: res });
    //   }
    // });
    // console.log(userData.roles);
    // if (userData && !userData.roles) {
    //   history.push('/selectRole');
    //   return;
    // }

    this.getStripeCustomerData();
  }

  componentDidMount() {
    new WOW().init(); // Wow is animation package for login form
  }

  setDefaultCard = (sourceId) => {
    this.loadingData();
    this.props.setDefaultCard(sourceId, () => {
    });
  }


  getStripeCustomerData = () => {
    this.setState({ isLoading: true });
    Meteor.call('stripeGetStripeCustomer', (err) => {
      if (err) {
        console.log(err.reason);
      }
    });
  }


  componentDidUpdate(prevProps) {
    const props = this.props;
    if (
      this.state._isLoading
      && (JSON.stringify(prevProps.stripeCustomer) !== JSON.stringify(props.stripeCustomer))
      || (JSON.stringify(prevProps.subscribedPlan) !== JSON.stringify(props.subscribedPlan))
    ) {
      this.setState({
        _isLoading: false
      });
    }
  }

  setPlanToSubcribe = (plan) => {
    this.setState({ planToSubscribe: plan });
  }

  loadingData = () => {
    this.setState({
      _isLoading: true
    });
  }

  removeCard = (sourceId) => {
    this.loadingData();
    this.props.removeCard(sourceId, () => {
    });
  }

  checkShouldUpdateInfo = () => {
    const profile = (this.props.userData && this.props.userData.profile) || {};
    return Boolean(!profile.gender || !profile.firstName || !profile.lastName);
  }

  toggleUpgradeAccountModal = () => {
    this.setState((prevState) => {
      const { showUpgradeAccountModal } = prevState;
      const newState = {
        showUpgradeAccountModal: !showUpgradeAccountModal,
      };
      if (showUpgradeAccountModal && this.checkShouldUpdateInfo()) {
        newState.editBasicForm = true;
      }
      return newState;
    });
    this.setState({ showUpgradeAccountModal: !this.state.showUpgradeAccountModal });
  }

  togglePaymentDetailModal = () => {
    this.setState({ showPaymentDetailModal: !this.state.showPaymentDetailModal });
  }

  toggleTeacherAccountModal = () => {
    this.setState({ showTeacherAccountModal: !this.state.showTeacherAccountModal });
  }

  toggleAddPaymentCardModal = () => {
    this.setState({ showAddPaymentCardModal: !this.state.showAddPaymentCardModal });
  }

  paymentFormToggle = () => {
    this.setState({ editPayMentForm: !this.state.editPayMentForm });
  }

  cancelRegistration = (e) => {
    e.preventDefault();
    const { cancelRegistration } = this.props;
    cancelRegistration();
  }

  render() {
    const { userData } = this.props;
    const {
      showUpgradeAccountModal, showPaymentDetailModal,
      showAddPaymentCardModal, planToSubscribe, _isLoading,
      showTeacherAccountModal, isCompletedLesson
    } = this.state;

    const {
      isLoading, stripeCustomer, subscribedPlan, history, accountType
    } = this.props;
    const isTeacher = _.includes(_.get(userData.getPerson(), 'type', []), USER_TYPES.TEACHER);
    const isWaitingForApproval = _.includes(_.get(userData.getPerson(), 'type', []), USER_TYPES.WAITING_FOR_APPROVAL);

    /* *NOTE: when admin approve user as a teacher, please replace 'waiting-for-approval-as-teacher' with 'teacher' in Person.type */
    return (
      <div className="tg-page tg-page--general" id="my-account">
        <div className="tg-page tg-page--myaccount__container tg-tutorial__container">
          {
            (isLoading || _isLoading)
              ? (
                <div className="loading loading--account">
                  <svg width="30px" height="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="lds-infinity" style={{ background: 'none' }}>
                    <path fill="none" d="M24.3,30C11.4,30,5,43.3,5,50s6.4,20,19.3,20c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50s-6.4,20-19.3,20C56.4,70,43.6,30,24.3,30z" stroke="#fff" strokeWidth="4" strokeDasharray="243.75948181152344 12.829446411132807">
                      <animate attributeName="stroke-dashoffset" calcMode="linear" values="0;256.58892822265625" keyTimes="0;1" dur="2.1" begin="0s" repeatCount="indefinite" />
                    </path>
                  </svg>
                Loading...
                </div>
              )
              : null
          }
          <div className="tg-page__content tg-container tg-page__content--myaccount">
            {/*<div className="basic-info basic-info--accountInfo">*/}
              {/*<div className="basic-info__title">*/}
                {/*<h4 className="basic-info__title__heading">Account Info</h4>*/}
              {/*</div>*/}
              {/*<div className="basic-info__content">*/}
                {/*<div className="basic-info__content__line">*/}
                  {/*<span className="basic-info__content__line__label">Account Type</span>*/}
                  {/*<span className="basic-info__content__line__des">{accountType}</span>*/}
                  {/*<span className="basic-info__content__line__des align-right">*/}
                    {/*<button className="btn" onClick={this.toggleUpgradeAccountModal}>*/}
                      {/*{*/}
                        {/*accountType === ACCOUNT_TYPES.FREE*/}
                          {/*? message.UPGRADE_BUTTON*/}
                          {/*: message.DOWNGRADE_BUTTON*/}
                      {/*}*/}
                    {/*</button>*/}
                  {/*</span>*/}
                {/*</div>*/}
              {/*</div>*/}
            {/*</div>*/}

            <ManageTeacherSection
              profile={userData.profile || {}}
              toggleAddTeacherModal={this.toggleAddTeacherModal}
            />


            <div className="basic-info" style={{background: "#3a6936"}}>
              <div className="basic-info__title">
                <h4 className="basic-info__title__heading">Teacher Registration</h4>
              </div>
              <div className="basic-info__content">
                {
                  (!isTeacher && !isWaitingForApproval)
                  && (
                  <div className="basic-info__content__line">
                    <button
                      // style={{background: '#94e080', color: 'black'}}
                      className="schoolinfobtn btn register-teacher "
                      onClick={this.toggleTeacherAccountModal}
                      type="button"
                    >
                      Add school information for approval
                    </button>
                  </div>
                  )
                }
                {
                  (!isTeacher && isWaitingForApproval)
                  && (
                    [
                      <div key={0} className="basic-info__content__line">
                        <button
                          className="btn register-teacher"
                          onClick={this.cancelRegistration}
                          type="button"
                        >
                          Cancel Registration
                        </button>
                      </div>,
                      <div key={1} className="basic-info__content__line">
                        <span>waiting for approval</span>
                      </div>
                    ]
                  )
                }
                {
                  isTeacher
                  && (
                  <div className="basic-info__content__line">
                    <span>approved as teacher</span>
                  </div>
                  )
                }
              </div>
            </div>

          </div>
          {/*<div className="payment-info">*/}
            {/*<div className="payment-info__title">*/}
              {/*<h4 className="payment-info__title__heading">Payment Info</h4>*/}
              {/*<span role="button" tabIndex="0" className="basic-info__title__heading" onClick={() => (this.toggleAddPaymentCardModal())}>Add card</span>*/}
            {/*</div>*/}
            {/*<div className="payment-info__content">*/}
              {/*{*/}
                {/*!stripeCustomer ? null :*/}
                  {/*stripeCustomer.sources.data.length === 0 ?*/}
                    {/*<div className="payment-info__content__noCard">*/}
                      {/*{message.NO_CARD}*/}
                    {/*</div> :*/}
                    {/*_.map(stripeCustomer.sources.data, (source, index) => {*/}
                      {/*const card = source.card;*/}
                      {/*return (*/}
                        {/*<div className="payment-block" key={index}>*/}
                          {/*<div className={`payment-block__type payment-block__type--${card.brand}`}>*/}
                            {/*<img src={CARD_TYPE[card.brand]} alt="payment tgame" width="45px" />*/}
                          {/*</div>*/}
                          {/*<div className="payment-block__content">*/}
                            {/*<div className="payment-block__content__line">*/}
                              {/*<span className="payment-block__content__line__label">{message.CARD_HOLDER}</span>*/}
                              {/*<span className="payment-block__content__line__des">{source.owner.name}</span>*/}
                            {/*</div>*/}
                            {/*<div className="payment-block__content__line">*/}
                              {/*<span className="payment-block__content__line__label">{message.CARD_NUMBER}</span>*/}
                              {/*<span className="payment-block__content__line__des">**** **** **** {card.last4}</span>*/}
                            {/*</div>*/}
                            {/*<div className="payment-block__content__line">*/}
                              {/*<span className="payment-block__content__line__label">{message.CARD_EXP}</span>*/}
                              {/*<span className="payment-block__content__line__des">{card.exp_month} / {card.exp_year}</span>*/}
                            {/*</div>*/}
                            {/*<div className="payment-block__content__line">*/}
                              {/*<span className="payment-block__content__line__label">{message.CARD_ZIPCODE}</span>*/}
                              {/*<span className="payment-block__content__line__des">{*/}
                                {/*source.owner.address ? source.owner.address.postal_code : null*/}
                                {/*}*/}
                              {/*</span>*/}
                            {/*</div>*/}
                            {/*<div className="payment-block__content__line payment-block__content__line--setDefault">*/}
                              {/*{*/}
                                {/*stripeCustomer.default_source === source.id*/}
                                  {/*? <span><i className="tg-icon-tg-down" />{message.DEFAULT_CARD}</span>*/}
                                  {/*: <button className="setDefault" onClick={() => this.setDefaultCard(source.id)}>{message.MARK_DEFAULT}</button>*/}
                              {/*}*/}
                              {/*{*/}
                                {/*stripeCustomer.default_source !== source.id &&*/}
                                {/*<button className="remove" onClick={() => this.removeCard(source.id)}>{message.REMOVE_CARD}</button>*/}
                              {/*}*/}
                            {/*</div>*/}
                          {/*</div>*/}
                        {/*</div>*/}
                      {/*);*/}
                    {/*})*/}
              {/*}*/}
            {/*</div>*/}
          {/*</div>*/}
          {/*{*/}
            {/*stripeCustomer*/}
              {/*? (*/}
                {/*<div>*/}
                  {/*<UpgradeAccountModal*/}
                    {/*showModal={showUpgradeAccountModal}*/}
                    {/*toggleUpgradeAccountModal={this.toggleUpgradeAccountModal}*/}
                    {/*togglePaymentDetailModal={this.togglePaymentDetailModal}*/}
                    {/*toggleAddPaymentCardModal={this.toggleAddPaymentCardModal}*/}
                    {/*stripeCustomer={stripeCustomer}*/}
                    {/*setPlanToSubcribe={this.setPlanToSubcribe}*/}
                    {/*subscribedPlan={subscribedPlan}*/}
                    {/*loadingData={this.loadingData}*/}
                    {/*history={history}*/}
                    {/*shouldUpdateInfo={this.checkShouldUpdateInfo()}*/}
                  {/*/>*/}
                  {/*<PaymentDetailModal*/}
                    {/*showModal={showPaymentDetailModal}*/}
                    {/*toggleUpgradeAccountModal={this.toggleUpgradeAccountModal}*/}
                    {/*togglePaymentDetailModal={this.togglePaymentDetailModal}*/}
                    {/*stripeCustomer={stripeCustomer}*/}
                    {/*plan={planToSubscribe}*/}
                    {/*loadingData={this.loadingData}*/}
                  {/*/>*/}
                  {/*<AddPaymentCardModal*/}
                    {/*showModal={showAddPaymentCardModal}*/}
                    {/*toggleAddPaymentCardModal={this.toggleAddPaymentCardModal}*/}
                    {/*stripeCustomer={stripeCustomer}*/}
                    {/*loadingData={this.loadingData}*/}
                  {/*/>*/}
                {/*</div>*/}
              {/*)*/}
              {/*: null*/}
          {/*}*/}
          <TeacherAccountModal
            userData={userData}
            showModal={showTeacherAccountModal}
            toggleTeacherAccountModal={this.toggleTeacherAccountModal}
            isCompletedLesson={isCompletedLesson}
          />
        </div>
      </div>
    );
  }
}
export default MyAccountComponent;
