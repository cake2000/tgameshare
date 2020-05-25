import React from 'react';
import PropTypes from 'prop-types';
import AdminHomePageFAQForm from './AdminHomePageFAQForm.jsx';
import AdminHomePageFAQItem from './AdminHomePageFAQItem.jsx';

class AdminHomePageFAQ extends React.Component {

  static propTypes = {
    faq: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    homepageData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    updateHomePage: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    let faq = [];
    if (props.faq) { faq = props.faq; }
    this.state = {
      faq,
      showForm: false,
      currentFAQ: null
    };
  }

  setFAQForEdit = (index, e) => {
    e.preventDefault();
    this.setState({ currentFAQ: index });
    this.toggleForm();
  }

  toggleForm = () => this.setState({ showForm: !this.state.showForm });

  updateFaq = (action, faqItem, index) => {
    let newFaq = this.state.faq;
    const { homepageData, updateHomePage } = this.props;
    if (action === 'add') {
      newFaq.push(faqItem);
    }
    if (action === 'edit') {
      newFaq[index] = faqItem;
    }
    if (action === 'delete') {
      newFaq = _.without(newFaq, newFaq[index]);
    }
    homepageData.data.faq = newFaq;
    updateHomePage(homepageData.data, () => {
      this.setState({ faq: newFaq });
      if (action !== 'delete') {
        this.toggleForm();
      }
    });
  }
  render() {
    const { faq, showForm, currentFAQ } = this.state;
    return (
      <div className="admin-hp-faq admin-cards">
        {
          !showForm ?
            <div>
              <div className="admin-title">
                FAQ
              </div>
              <div className="admin-hp-faq__list admin-cards__content">
                {
                  _.map(faq, (item, index) =>
                    (
                      <AdminHomePageFAQItem
                        index={index}
                        faq={item}
                        key={index}
                        updateFaq={this.updateFaq}
                        setFAQForEdit={this.setFAQForEdit}
                      />
                    )
                  )
                }
              </div>
              <div role="button" tabIndex={0} onClick={this.toggleForm} className="admin-cards__content__add-btn">
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                >
                  <i className="fa fa-plus" /> Add FAQ
                </button>
              </div>
            </div>
          :
            <div className="admin-hp-faq__form">
              <AdminHomePageFAQForm
                updateFaq={this.updateFaq}
                closeForm={this.toggleForm}
                faq={faq[currentFAQ]}
              />
            </div>
        }
      </div>
    );
  }
}

export default AdminHomePageFAQ;
