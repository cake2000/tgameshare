import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { MESSAGES } from '../../../../lib/const.js';

const errorMessages = MESSAGES().SIGNUP_FORM.ERRORS;

class ParentForm extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      emailParent: '',
      submitError: {},
      isSending: false,
      success: false,
      error: ''
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    this.setState({
      emailParent: value
    });
  };

  validateForm = (type) => {
    const {
      emailParent,
      submitError
    } = this.state;
    let errCount = 0;

    // Validate  email
    if (!type || type === 'emailParent') {
      if (!errorMessages.EMAIL_PATT.test(emailParent.trim())) {
        submitError.emailParent = errorMessages.EMAIL_INVAILD;
        errCount += 1;
      } else {
        submitError.emailParent = '';
      }
      if (type) {
        this.setState({ submitError });
        return errCount;
      }
    }
    this.setState({ submitError });
    return errCount;
  };

  submitForm = () => {
    const countError = this.validateForm();
    if (!countError) {
      this.setState({
        isSending: true,
        error: ''
      });
      this.props.sendParentEmail(this.state.emailParent, (error) => {
        if (!error) {
          this.setState({ success: true });
        } else {
          this.setState({
            error: error.reason
          });
        }
        this.setState({
          isSending: false
        });
      });
    }
  };

  render() {
    const { handleClose, toggleParentForm } = this.props;

    return (
      <div className="modal_block_general parent-email-modal">
        <div className="modal__header">
          <div className="modal__header__title">{ !this.state.success ? 'Sign up by Parents or Guardian' : 'Invitation Sent!'}</div>
          <div className="modal__header--close" onClick={toggleParentForm} role="presentation">x</div>
        </div>
        <div className="modal__body">
          <div className="modal__body--content">
            {
          !this.state.success
            ? (
              <div className="form form--signup">
                <div className="form__block">
                  <div className="form__group form__group--textbox">
                    <span className="form__group__title" htmlFor="email-address">Parent or Guardian Email (since you are under 13): </span>
                    <div className="form__group__control">
                      <input
                        type="text"
                        className="input"
                        value={this.state.emailParent}
                        onChange={this.handleChange}
                        onBlur={() => { this.validateForm('emailParent'); }}
                      />
                      {
                        this.state.submitError.emailParent
                          ? <span htmlFor=" " className="form__group__error validate-error">{this.state.submitError.emailParent}</span>
                          : <span htmlFor=" " className="form__group__error validate-error validate-hidden">Error hidden</span>
                      }
                    </div>
                    {
                      this.state.error
                        ? <span htmlFor=" " className="form__group__error validate-error">{this.state.error}</span>
                        : <span htmlFor=" " className="form__group__error validate-error validate-hidden">Error hidden</span>
                    }
                  </div>
                </div>
                <div className="form__group form__group--action">
                  <button id="submit-btn" className={`button button--submit ${this.state.isSending ? 'button--submit--loading' : ''}`} disabled={this.state.isSending} type="button" onClick={this.submitForm}>
                    { this.state.isSending ? 'Sending...' : 'Send' }
                  </button>
                </div>
              </div>
            )
            : (
              <div>
                <p>Please ask your parent or guardian to check our invitation email.</p>
                <br />
                <Link to="/" onClick={handleClose}>Got it</Link>
              </div>
            )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default ParentForm;
