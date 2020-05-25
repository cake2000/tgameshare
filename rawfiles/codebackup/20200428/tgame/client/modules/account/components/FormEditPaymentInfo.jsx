/* global WOW*/
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class formEditPayMentInfo extends React.Component {
  static propTypes = {
    paymentFormShow: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      showForm: true,
      hideForm: false
    };
    this.hideForm = this.hideForm.bind(this);
  }

  componentDidMount() {
    new WOW().init(); // Wow is animation package for login form
  }
  hideForm() {
    const { paymentFormShow } = this.props;
    Meteor.setTimeout(() => {
      paymentFormShow(false);
    }, 500);
    this.setState({
      showForm: false,
      hideForm: true
    });
  }

  render() {
    const animatedMove = classNames({
      form: true,
      'form--editbasic': true,
      animated: true,
      fadeOutRight: this.state.hideForm,
      fadeInRight: this.state.showForm
    });
    return (
      <div className={animatedMove}>
        <div className="form__group">
          <input className="form__group__text" type="text" placeholder="FIrst & Last Name" required="required" />
        </div>
        <div className="form__group">
          <input className="form__group__text" type="text" placeholder="Zip Code" required="required" />
        </div>
        <div className="form__group">
          <input className="form__group__text" type="text" placeholder="Card Number" required="required" />
        </div>
        <div className="form__group">
          <input className="form__group__text" type="text" placeholder="Expiration" required="required" />
        </div>
        <div className="form__group">
          <input className="form__group__text" type="text" placeholder="CVV" required="required" />
        </div>
        <div className="form__group form__group--action">
          <button className="btn">Update</button>
          <button className="btn btn-transparent" onClick={() => (this.hideForm())}>Cancel</button>
        </div>
      </div>
    );
  }
}

export default formEditPayMentInfo;
