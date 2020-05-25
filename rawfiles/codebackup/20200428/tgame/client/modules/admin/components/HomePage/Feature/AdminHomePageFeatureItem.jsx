import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';


class AdminHomePageFeatureItem extends React.Component {
  static propTypes = {
    setFeatureForEdit: PropTypes.func.isRequired,
    updateFeature: PropTypes.func.isRequired,
    feature: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  render() {
    const { feature, index } = this.props;

    return (
      <div className="admin-homepage-feature-item admin-cards__content__item">
        <div className="admin-cards__content__item__block">
          <img
            src={feature.logo ? feature.logo : feature.defaultLogo}
            alt="Feature logo"
            style={{ objectFit: 'cover', width: '100px', height: '100px' }}
          />
          <div className="admin-cards__content__item__block__info">
            <div className="admin-cards__content__item__block__info__title">{feature.name}</div>
            <div className="admin-cards__content__item__block__info__desc">{feature.des}</div>
          </div>
        </div>
        <div className="admin-cards__content__item__footer">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={(e) => { this.props.setFeatureForEdit(index, e); }}
          >
            <i className="fa fa-pencil-square-o" />
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => { this.props.updateFeature('delete', null, index); }}
          >
            <i className="fa fa-trash-o" />
          </button>
        </div>
      </div>
    );
  }
}

export default AdminHomePageFeatureItem;
