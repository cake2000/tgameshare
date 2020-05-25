import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
// import Script from 'react-load-script';
import { MESSAGES } from '../../../../lib/const.js';


const message = MESSAGES().PAYMENT_DETAIL_MODAL;

const StyleModal = {
  overlay: {
    backgroundColor: 'rgba(4, 4, 4, 0.88)'
  },
  content: {
    maxWidth: '385px',
    width: '100%',
    margin: '0 auto',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
  }
};

export default class PaymentDetailModal extends React.Component {
  static propTypes = {
    subscribeToPlan: PropTypes.func.isRequired
  }

  static defaultProps = {
  }

  constructor(props) {
    super(props);
    this.state = {
      scriptLoaded: false,
      submitError: '',
      currentCard: 0
    };
  }

  handleOnCloseModal = () => {
    const { toggleUpgradeAccountModal, togglePaymentDetailModal } = this.props;

    toggleUpgradeAccountModal();
    togglePaymentDetailModal();
  }

  handleOnChooseCard = (currentCard) => {
    this.setState({ currentCard });
  }

  handleOnSubmit = (e) => {
    e.preventDefault();
    const { stripeCustomer, subscribeToPlan, plan,
      togglePaymentDetailModal, loadingData } = this.props;
    const cardList = stripeCustomer.sources.data;
    const { currentCard } = this.state;
    loadingData();
    togglePaymentDetailModal();
    subscribeToPlan(cardList[currentCard].id, plan, () => {
    });
  }

  renderCard = (cardInfo, key) => {
    const { currentCard } = this.state;
    const { card } = cardInfo;

    return (
      <div className="form__group" key={key}>
        <input
          type="radio"
          id={`card-${key}`}
          name="radio-group"
          checked={key === currentCard}
          onChange={() => this.handleOnChooseCard(key)}
        />
        <label htmlFor={`card-${key}`}>{`${card.brand} - Last four digit is ${card.last4}`}</label>
      </div>
    );
  }

  render() {
    const { showModal, stripeCustomer } = this.props;
    const { submitError } = this.state;
    const cardList = stripeCustomer.sources.data;

    return (
      <Modal
        style={StyleModal}
        isOpen={showModal}
        contentLabel={'Modal'}
      >
        <div className="payment-modal">
          <div className="modal__header">
            <div className="modal__header__title">
              {message.TITLE}
            </div>
            <div className="modal__header__action">
              <button onClick={this.handleOnCloseModal}>x</button>
            </div>
          </div>
          {
            cardList.length > 0 ?
              <div className="modal__content">
                <form className="form form--upgrade">
                  {cardList.map((card, key) => this.renderCard(card, key))}
                  <div className="form__group form__group--action">
                    <button className="btn btn-none" onClick={this.handleOnSubmit}>Check Out</button>
                    <button
                      className="btn btn-transparent"
                      type="button"
                      onClick={this.handleOnCloseModal}
                    >Cancel</button>
                  </div>
                  {
                  submitError === '' ? null :
                  <div className="form-wraper__status form-wraper__status--error">
                    <span>{submitError}</span>
                    <div className="error" role="alert" />
                  </div>
                }
                </form>
              </div> : 'Please add card to continue your payment'
          }
        </div>
      </Modal>
    );
  }
}
