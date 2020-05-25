import React from 'react';
import PropTypes from 'prop-types';
import AdminEditor from '../../General/AdminEditor.jsx';

class AdminHomePageFAQForm extends React.Component {
  static propTypes = {
    faq: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    updateFaq: PropTypes.func.isRequired,
    closeForm: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    let faq = {
      question: '',
      answer: '',
    };
    if (props.faq) {
      faq = props.faq;
    }
    this.state = {
      faq
    };
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { faq } = this.state;

    faq[property] = value;
    this.setState({ faq });
  }

  validateForm = () => {
    let errCount = 0;
    const { faq } = this.state;
    if (faq.question.trim() === '' || faq.answer.trim() === '') { errCount += 1; }

    return errCount;
  }

  updateFaq = () => {
    const { updateFaq, faq } = this.props;
    if (this.validateForm() > 0) {
      return null;
    }
    let action = 'add';
    if (faq) {
      action = 'edit';
    }

    return updateFaq(action, this.state.faq);
  }

  onChange = (string) => {
    const { faq } = this.state;
    faq.answer = string;
    this.setState({ faq });
  }

  render() {
    const { faq } = this.state;

    return (
      <div className="admin-hp-faq-form admin-form">
        <div className="admin-form__header">{this.props.faq ? 'Edit FAQ' : 'Add FAQ'}</div>
        <div className="admin-form__block">
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Question</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => { this.changeValue('question', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Answer</label>
            <div className="admin-form__item__input">
              <AdminEditor
                onChange={this.onChange}
                string={faq.answer}
              />
            </div>
          </div>
        </div>
        <div className="admin-form__footer">
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.updateFaq}>Save changes</button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.props.closeForm}>Cancel</button>
        </div>
      </div>
    );
  }
}

export default AdminHomePageFAQForm;
