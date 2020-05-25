import React from 'react';
import Modal from 'react-modal';
import _get from 'lodash/get';
import _round from 'lodash/round';
import Script from 'react-load-script';
import { COUNTRIES } from '../../../../lib/countries.js';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

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

class PaymentModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      scriptLoaded: false,
      isLoading: false,
      submitError: '',
      couponError: ''
    };
  }

      convertCentToUsd = cent => _round(cent / 100, 2)

      componentDidUpdate(prevProps, prevState) {
        const { scriptLoaded } = this.state;
        const {
          stripeBuyACourse, gameId, packageType, toggleAddPaymentCardModal
        } = this.props;
        if (scriptLoaded !== prevState.scriptLoaded || !scriptLoaded) {
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
                if (this.coupon.value && !this.state.couponDiscount) {
                  this.setState({
                    submitError: 'You need to apply coupon code before submit',
                  });
                } else {
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
                    stripeBuyACourse(gameId, packageType, source.id, this.coupon.value, (err) => {
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
                }
              });
          }
        }
      }

      applyCoupon = (e) => {
        e.preventDefault();
        const { searchCourseCoupon } = this.props;
        searchCourseCoupon(this.coupon.value, (err, res) => {
          if (err) {
            this.setState({
              couponError: err,
              couponDiscount: 0
            });

            this.coupon.value = "";
          } else {
            this.setState({
              couponDiscount: res.discountPercentage,
              couponError: '',
              submitError: ''
            });
          }
        });
      }

      displayPrice = (usd) => {
        const { couponDiscount = 0 } = this.state;
        const discountPrice = usd * (1 - couponDiscount);
        return discountPrice;
      }

      onChangeCoupon = () => {
        if (this.coupon.value === '') {
          this.setState({
            couponDiscount: 0,
            couponError: ''
          });
        }
      }

      handleScriptError = () => (
        <div className="admin-msg-err">
          Can not load script
        </div>
      );

      handleScriptLoad = (scriptLoaded) => {
        this.setState({ scriptLoaded });
      };

      render() {
        const {
          toggleAddPaymentCardModal, showModal, price, title
        } = this.props;
        const { isLoading = false, submitError = '', couponError = '' } = this.state;
        const maxWidth = 750;
        const usd = this.convertCentToUsd(price);

        return (
          <Modal
            style={StyleModal(maxWidth)}
            isOpen={showModal}
            contentLabel="Modal"
            onRequestClose={toggleAddPaymentCardModal}
          >
            <div className="payment-modal">
              <Script
                url="https://js.stripe.com/v3/"
                onError={() => { this.handleScriptError(); }}
                onLoad={() => { this.handleScriptLoad(true); }}
              />
              <div className="modal__top">
                <div className="modal__header">
                  <div className="modal__header__title">
                    {title}
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
              </div>
              <div className="payment-details">
                <div className="payment-details__title">PAYMENT DETAILS</div>
                <div className="payment-details__content">
                  <div className="payment-details__content--item">
                    <div className="payment-details__content--item__title">total:</div>
                    <div className={`payment-details__content--item__price ${this.displayPrice(usd) === usd ? ('') : ('discount_price')}`}>
                      $
                      {usd}
                    </div>
                    {this.displayPrice(usd) === usd ? ('') : (
                      <div className="payment-details__content--item__price">
                        $
                        {this.displayPrice(usd)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal__content payment-form">
                <form className="form">
                  <div className="form__group">
                    <div className="form__label">Enter coupon here (optional)</div>
                    <div className="coupon-field-wrapper">
                      <input
                        className="field is-empty form__group__text"
                        ref={(coupon) => { this.coupon = coupon; }}
                        onChange={this.onChangeCoupon}
                      />
                      <button
                        onClick={this.applyCoupon}
                        className="btn charged-btn"
                      >
                        Apply
                      </button>
                    </div>
                    {
                      couponError && (
                        <div className="form-wraper__status form-wraper__status--error">
                          <span>{couponError}</span>
                          <div className="error" role="alert" />
                        </div>
                      )
                    }
                  </div>
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
                        ) : `Charge My Card $${this.displayPrice(usd)} Now`
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
              </div>
            </div>
          </Modal>
        );
      }
}

export default PaymentModal;
