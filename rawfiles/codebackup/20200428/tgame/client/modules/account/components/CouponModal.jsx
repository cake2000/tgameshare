import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import LoadingIcon from '../../../lib/LoadingIcon.jsx';

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
    maxWidth: '600px',
    width: '100%',
    margin: '0 auto',
    border: 'none',
    display: 'flex',
    padding: '0px',
    alignItems: 'center',
    background: '#f5f5f5'
  }
};

class CouponModal extends Component {
  state = {
    err: null,
    isLoading: false
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { submitCoupon, toggleCouponModal } = this.props;

    this.setState({ err: null, isLoading: true });
    submitCoupon(this.coupon.value, false, (err) => {
      this.setState({ isLoading: false });
      if (err) {
        this.setState({ err });
      } else {
        toggleCouponModal();
      }
    });
  };

  render() {
    const { showModal, toggleCouponModal } = this.props;
    const { err, isLoading } = this.state;

    return (
      <Modal
        style={StyleModal}
        isOpen={showModal}
        contentLabel="Modal"
      >
        <div className="coupon-modal">
          <div className="modal__header">
            <div className="modal__header__title">
              Coupon
            </div>
            <div className="modal__header__action">
              <button
                onClick={() => toggleCouponModal()}
                type="button"
              >
                <i className="fa fa-times" />
              </button>
            </div>
          </div>
          <div className="modal__content payment-form">
            <form className="form" onSubmit={this.onSubmit}>
              <div className="form__group">
                <div className="form__label">Enter your coupon:</div>
                <input
                  name="coupon"
                  className="field is-empty form__group__text"
                  ref={(coupon) => { this.coupon = coupon; }}
                />
              </div>
              {
                err && (
                  <div className="form-wraper__status form-wraper__status--error">
                    <span>{err}</span>
                    <div className="error" role="alert" />
                  </div>
                )
              }
              <div className="form__group form__group--action">
                <button className="btn charged-btn" type="submit" disabled={isLoading}>
                  {
                    isLoading ? (
                      <LoadingIcon />
                    ) : 'Submit'
                  }
                </button>
                <button
                  className="btn cancelled-btn"
                  type="button"
                  onClick={() => toggleCouponModal()}
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

CouponModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  toggleCouponModal: PropTypes.func.isRequired,
  submitCoupon: PropTypes.func.isRequired
};

export default CouponModal;
