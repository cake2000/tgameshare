import React from 'react';
import PropTypes from 'prop-types';


class AdminHomePageFAQItem extends React.Component {
  static propTypes = {
    setFAQForEdit: PropTypes.func.isRequired,
    updateFaq: PropTypes.func.isRequired,
    faq: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  render() {
    const { faq, index } = this.props;

    return (
      <div className="admin-homepage-faq-item admin-cards__content__item--half">
        <div className="admin-cards__content__item__block">
          <div className="admin-cards__content__item__block__info">
            <div className="admin-cards__content__item__block__info__title">{faq.question}</div>
            <div className="admin-cards__content__item__block__info__desc">
              <div className="content" dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          </div>
        </div>
        <div className="admin-cards__content__item__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={(e) => { this.props.setFAQForEdit(index, e); }}
          >
            <i className="fa fa-pencil-square-o" />
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.props.updateFaq('delete', null, index); }}
          >
            <i className="fa fa-trash-o" />
          </button>
        </div>
      </div>
    );
  }
}

export default AdminHomePageFAQItem;
