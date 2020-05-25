/* global Stripe */
import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import Script from 'react-load-script';
import { MESSAGES } from '../../../../lib/const.js';
import { PAYMENT_PRICE } from '../../../../lib/enum';
import { COUNTRIES } from '../../../../lib/countries.js';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

const message = MESSAGES().ADD_PAYMENT_CARD_MODAL;

const StyleModal = maxWidth => ({
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
    maxWidth: maxWidth || '600px',
    width: '100%',
    margin: '0 auto',
    border: 'none',
    display: 'flex',
    padding: '0px',
    alignItems: 'center',
    background: '#f5f5f5'
  }
});

export default class AddPaymentCardModal extends React.Component {
  static propTypes = {
    planId: PropTypes.string.isRequired,
    toggleAddPaymentCardModal: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired,
    subscribeToPlan: PropTypes.func.isRequired,
    handleLoading: PropTypes.func.isRequired,
    todayTotal: PropTypes.string.isRequired,
    doesChangePaymentPeriod: PropTypes.bool.isRequired,
    paymentMonthly: PropTypes.string.isRequired,
    billingDate: PropTypes.string.isRequired,
    coupon: PropTypes.shape(),
    changeBillingType: PropTypes.func.isRequired,
    billingType: PropTypes.string.isRequired,
    selectedStudents: PropTypes.arrayOf(PropTypes.shape())
  };

  static defaultProps = {
    coupon: null,
    selectedStudents: []
  };

  constructor(props) {
    super(props);

    this.state = {
      scriptLoaded: false,
      submitError: '',
      selectedTab: PAYMENT_PRICE[props.billingType].name,
      isLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { planId } = this.props;

    if (planId !== nextProps.planId) {
      this.handleScriptLoad(false);
    }
  }

  shouldComponentUpdate(nextProps) {
    const { doesChangePaymentPeriod } = this.props;

    return nextProps.doesChangePaymentPeriod === doesChangePaymentPeriod;
  }

  componentDidUpdate(prevProps, prevState) {
    const { scriptLoaded } = this.state;
    const { coupon, selectedStudents } = this.props;

    if ((scriptLoaded !== prevState.scriptLoaded || !scriptLoaded)) {
      const {
        handleLoading, toggleAddPaymentCardModal, subscribeToPlan, planId
      } = this.props;
      const stripe = Stripe(Meteor.settings.public.stripe.livePublishableKey);
      const elements = stripe.elements();

      const card = elements.create('card', {
        iconStyle: 'solid',
        style: {
          base: {
            iconColor: '#757575',
            color: '#333333',
            lineHeight: '36px',
            fontWeight: 300,
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSize: '14px',
            padding: '8px 12px',
            background: 'fff',
            '::placeholder': {
              color: '#757575'
            }
          },
          invalid: {
            iconColor: '#e85746',
            color: '#e85746'
          }
        },
        classes: {
          focus: 'is-focused',
          empty: 'is-empty'
        }
      });
      if (document.getElementById('card-element')) {
        card.mount('#card-element');
      }
      this.handleScriptLoad(true);

      if (document.querySelector('form')) {
        document.querySelector('form')
          .addEventListener('submit', async (e) => {
            e.preventDefault();
            this.setState({ isLoading: true });
            const form = document.querySelector('form');
            const extraDetails = {
              owner: {
                name: form.querySelector('input[name=cardholder-name]').value,
                email: Meteor.user().emails[0].address,
                address: {
                  line1: this.line1.value,
                  line2: this.line2.value,
                  city: this.city.value,
                  state: this.stateValue.value,
                  country: this.country.value
                }
              }
            };
            const { source, error } = await stripe.createSource(card, extraDetails);

            if (error) {
              // Inform the user if there was an error
              this.setState({
                submitError: error.message,
                isLoading: false
              });
            } else {
              // Send the source to your server
              handleLoading();
              const studentIds = selectedStudents.map(student => student._id);

              subscribeToPlan(source.id, planId, coupon ? coupon.name : null, studentIds, (err) => {
                handleLoading();
                if (!err) {
                  toggleAddPaymentCardModal();
                } else {
                  this.setState({
                    submitError: err.reason,
                    isLoading: false
                  });
                }
              });
            }
          });
      }
    }
  }

  handleScriptLoad = (scriptLoaded) => {
    this.setState({ scriptLoaded });
  };

  handleScriptError = () => (
    <div className="admin-msg-err">
      Can not load script
    </div>
  );

  handleChangeTab = tab => () => {
    const { changeBillingType } = this.props;

    this.setState({ selectedTab: PAYMENT_PRICE[tab].name });
    changeBillingType(tab, PAYMENT_PRICE[tab].planId);
  };

  render() {
    const {
      showModal, toggleAddPaymentCardModal, todayTotal, billingType,
      paymentMonthly, billingDate, doesChangePaymentPeriod, planId, selectedStudents
    } = this.props;
    const {
      submitError, selectedTab, isLoading
    } = this.state;
    const tabs = Object.keys(PAYMENT_PRICE);
    const { accountType } = Meteor.user();
    const currentPlan = accountType === planId;
    const person = Meteor.user().getPerson() || {};
    let maxWidth = null;
    const numberOfStudents = person.teacherProfile && person.teacherProfile.paidStudents ? person.teacherProfile.paidStudents.length + selectedStudents.length : selectedStudents.length;

    if (doesChangePaymentPeriod) {
      maxWidth = 700;
    }
    if (selectedStudents.length > 0) {
      maxWidth = 750;
    }

    return (
      <Modal
        style={StyleModal(maxWidth)}
        isOpen={showModal}
        contentLabel="Modal"
      >
        <div className={`payment-modal ${currentPlan && selectedStudents.length === 0 && 'resize-modal'}`}>
          <Script
            url="https://js.stripe.com/v3/"
            onError={() => { this.handleScriptError(); }}
            onLoad={() => { this.handleScriptLoad(true); }}
          />
          <div className="modal__top">
            <div className="modal__header">
              <div className="modal__header__title">
                {message.TITLE}
                <span>{`$${paymentMonthly}/month`}</span>
              </div>
              <div className="modal__header__action">
                <button
                  onClick={() => toggleAddPaymentCardModal()}
                  type="button"
                >
                  <i className="fa fa-times" />
                </button>
              </div>
            </div>
            <div className="modal__tab">
              {
                tabs.map(tab => (
                  <div
                    className={`modal__tab--name ${PAYMENT_PRICE[tab].name === selectedTab && 'selected-tab'}`}
                    key={PAYMENT_PRICE[tab].name}
                    onClick={this.handleChangeTab(tab)}
                    role="presentation"
                  >
                    {PAYMENT_PRICE[tab].value}
                  </div>
                ))
              }
            </div>
          </div>
          <div className="payment-details">
            <div className="payment-details__title">PAYMENT DETAILS</div>
            <div className="payment-details__content">
              <div className={`payment-details__content--item ${doesChangePaymentPeriod && 'more-item'} ${numberOfStudents > 0 && 'more-items'}`}>
                <div className="payment-details__content--item__title">{'Today\'s total:'}</div>
                <div className="payment-details__content--item__price">{`$${doesChangePaymentPeriod ? 0 : todayTotal}`}</div>
              </div>
              {
                doesChangePaymentPeriod && (
                  <div className={`payment-details__content--item ${doesChangePaymentPeriod && 'more-item'} ${numberOfStudents > 0 && 'more-items'}`}>
                    <div className="payment-details__content--item__title">
                      {`Payment on next pay period${numberOfStudents > 0 ? ` (+${numberOfStudents} student${numberOfStudents > 1 ? 's' : ''})` : ''}:`}
                    </div>
                    <div className="payment-details__content--item__price">{`$${todayTotal}`}</div>
                  </div>
                )
              }
              <div className={`payment-details__content--item ${doesChangePaymentPeriod && 'more-item'} ${numberOfStudents > 0 && 'more-items'}`}>
                <div className="payment-details__content--item__title">
                  {'Next billing date: '}
                  <i className="fa fa-question-circle-o" />
                </div>
                <div className="payment-details__content--item__price">{billingDate}</div>
              </div>
            </div>
          </div>
          <div className="modal__content payment-form">
            {
              currentPlan && selectedStudents.length === 0 ? (
                <div className="payment-currentPlan">
                  Current Billing Schedule
                </div>
              ) : (
                <form className="form">
                  <div className="form__group">
                    <div className="form__label">CARD NUMBER:</div>
                    <div id="card-element" className="field is-empty" />
                  </div>
                  <div className="form__group">
                    <div className="form__label">NAME ON CARD:</div>
                    <input name="cardholder-name" className="field is-empty form__group__text" />
                  </div>
                  <div className="form__group">
                    <div className="form__label">ADDRESS LINE 1:</div>
                    <input
                      className="field is-empty form__group__text"
                      ref={(line1) => { this.line1 = line1; }}
                    />
                  </div>
                  <div className="form__group form__group--inline">
                    <div>
                      <div className="form__label">ADDRESS LINE 2:</div>
                      <input
                        className="field is-empty form__group__text"
                        ref={(line2) => { this.line2 = line2; }}
                      />
                    </div>
                    <div>
                      <div className="form__label">CITY:</div>
                      <input
                        className="field is-empty form__group__text"
                        ref={(city) => { this.city = city; }}
                      />
                    </div>
                  </div>
                  <div className="form__group form__group--inline">
                    <div>
                      <div className="form__label">STATE:</div>
                      <input
                        className="field is-empty form__group__text"
                        ref={(state) => { this.stateValue = state; }}
                      />
                    </div>
                    <div>
                      <div className="form__label">COUNTRY:</div>
                      <select
                        name="country"
                        className="field form__group__text"
                        ref={(country) => { this.country = country; }}
                      >
                        {
                          COUNTRIES.map(country => (
                            <option key={country.value} value={country.value}>{country.text}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  {
                    submitError && (
                      <div className="form-wraper__status form-wraper__status--error">
                        <span>{submitError}</span>
                        <div className="error" role="alert" />
                      </div>
                    )
                  }
                  <div className="form__group form__group--action">
                    <button
                      className="btn charged-btn"
                      type="submit"
                      disabled={isLoading}
                    >
                      {
                        // eslint-disable-next-line no-nested-ternary
                        isLoading ? (
                          <LoadingIcon />
                        ) : (!doesChangePaymentPeriod ? `Charge My Card $${todayTotal} Now` : `Update my plan to ${billingType} payment of $${todayTotal}`)
                      }
                    </button>
                    <button
                      className="btn cancelled-btn"
                      type="button"
                      onClick={() => toggleAddPaymentCardModal()}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )
            }
          </div>
        </div>
      </Modal>
    );
  }
}
