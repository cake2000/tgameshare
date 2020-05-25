/* global WOW*/
import React from 'react';
import PropTypes from 'prop-types';

class ContactHome extends React.Component {
  static propTypes = {
    error: PropTypes.string,
    success: PropTypes.bool,
    contactSubmit: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
  }
  static defaultProps = {
    error: null,
    success: null
  }
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showNotification: false,
      errorMsg: '',
    };
    this.submitContact = this.submitContact.bind(this);
  }


  componentDidUpdate(prevProps) {
    if (prevProps.success !== this.props.success && this.props.success === true) {
      this.setState({ isLoading: false });
    }
  }

  resetForm() {
    this.email.value = '';
    this.subject.value = '';
    this.message.value = '';
    const { clearErrors } = this.props;
    clearErrors();
  }

  toggleNotification = () => {
    this.setState({ showNotification: !this.state.showNotification });
  }

  validateForm = (email, subject, message) => {
    if (email.trim().length === 0) {
      this.setState({ errorMsg: 'Email is required' });
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email.trim())) {
      this.setState({ errorMsg: 'Email is invalid' });
      return false;
    }
    if (subject.trim().length === 0) {
      this.setState({ errorMsg: 'Subject is required' });
      return false;
    }
    if (message.trim().length === 0) {
      this.setState({ errorMsg: 'Message is required' });
      return false;
    }
    return true;
  }

  submitContact = (e) => {
    e.preventDefault();
    const email = this.email.value;
    const subject = this.subject.value;
    const message = this.message.value;
    if (!this.validateForm(email, subject, message)) return;

    const { contactSubmit } = this.props;
    this.setState({ isLoading: true });
    contactSubmit(email, subject, message, {
      clearLoading: () => this.setState({ isLoading: false, errorMsg: '' }),
      resetForm: () => this.resetForm(),
      toggleNoti: () => this.toggleNotification()
    });
  }

  render() {
    const { adminEmail, error, success } = this.props;
    const errorMsg = error || this.state.errorMsg;

    return (
      <div className="contact-us-section" id="contact">
        <div className="contact-us tg-container">
          <div className="contact-us__block contact-us--left wow fadeInUp">
            <img alt="" data-ix="fade-in-up" src="images/robot-head2.svg" width="275" />
          </div>
          <div className="contact-us__block  contact-us--right wow fadeInLeft" data-wow-delay="800ms">
            <h1 className="heading">CONTACT US</h1>
            <div className="contact-us__block__line">We would love to hear from you!&nbsp;
              <br />Please send us an email to <a href={`mailto:${adminEmail}`}>{adminEmail}</a> or fill out the form below</div>
            <div className="form-wraper">
              <form onSubmit={element => (this.submitContact(element))} className="form-wraper__block">
                <div className="form-wraper__block__group form-wraper__block--haft">
                  <label htmlFor="Email" className="">Email:</label>
                  <input ref={element => (this.email = element)} data-name="Email" id="Email-4" name="Email" placeholder="Enter your email" type="text" />
                </div>
                <div className="form-wraper__block__group form-wraper__block--haft">
                  <label htmlFor="Subject-3" className="">Subject:</label>
                  <input ref={element => (this.subject = element)} data-name="Subject 3" id="Subject-3" name="Subject-3" placeholder="Subject Here" type="text" />
                </div>
                <div className="form-wraper__block__group form-wraper__block--full">
                  <label htmlFor="field-3" className="">Message</label>
                  <textarea ref={element => (this.message = element)} data-name="Field 3" id="field-3" name="field-3" placeholder="Place your feedback here" defaultValue="" rows="15" />
                </div>
                {errorMsg
                  ?
                    <div className="form-wraper__status form-wraper__status--error">
                      <span>{errorMsg}</span>
                    </div>
                  : null
                }
                <div className="form-wraper__block__group form-wraper__block--full">
                  {
                    this.props.success
                      ? null
                      :
                      <input disabled={this.state.isLoading} data-wait="Please wait..." type="submit" value={!this.state.isLoading ? 'Submit' : 'Loading...'} />
                  }
                </div>
              </form>
              {
                this.props.success && this.state.showNotification
                  ?
                    <div className="form-wraper__status form-wraper__status--sucess">
                      <span>We have received your message, Thank You!</span>
                      <button type="button" onClick={this.toggleNotification} value="Dismiss">OK</button>
                    </div>
                  :
                  null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ContactHome;
