import React from 'react';
import PropTypes from 'prop-types';
import { getBase64String } from '../../../configs/helpers.js';

class AdminHomePageFeatureForm extends React.Component {
  static propTypes = {
    feature: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    updateFeature: PropTypes.func.isRequired,
    closeForm: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    let feature = {
      logo: null,
      name: '',
      des: ''
    };
    if (props.feature) {
      feature = props.feature;
    }
    this.state = {
      feature
    };
  }

  handleUpload = () => {
    const fileImages = $('#file-input')[0].files;
    const feature = this.state.feature;

    _.map(fileImages, (fileImage) => {
      getBase64String(fileImage, { height: 415, width: 594 }, (base64String) => {
        feature.logo = base64String;
        this.setState({ feature });
      });
    });
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { feature } = this.state;

    feature[property] = value;
    this.setState({ feature });
  }

  validateForm = () => {
    let errCount = 0;
    const { feature } = this.state;
    if (feature.name.trim() === '' || feature.des.trim() === '') { errCount += 1; }

    return errCount;
  }

  updateFeature = () => {
    const { updateFeature, feature } = this.props;
    if (this.validateForm() > 0) {
      return null;
    }
    let action = 'add';
    if (feature) {
      action = 'edit';
    }

    return updateFeature(action, this.state.feature);
  }

  render() {
    const { feature } = this.state;

    return (
      <div className="admin-homepage-feature-form admin-form">
        <div className="admin-form__header">{this.props.feature ? 'Edit feature' : 'Add feature'}</div>
        <div className="admin-form__block">
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Name</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={feature.name}
                onChange={(e) => { this.changeValue('name', e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="textarea-input">Description</label>
            <div className="admin-form__item__input">
              <textarea
                id="textarea-input"
                value={feature.des}
                onChange={(e) => { this.changeValue('des', e); }}
                name="textarea-input"
                rows="4"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item--upload-image">
            <label className="admin-form__item--upload-image__label" htmlFor="file-input">Logo</label>
            {
              feature.logo ?
                <div className="admin-form__item--upload-image__image">
                  <img
                    className="float-left"
                    src={feature.logo}
                    alt="Feature logo"
                    style={{ objectFit: 'cover', width: '100px', height: '100px' }}
                  />
                </div>
                 :
                <div className="admin-form__item--upload-image__image">
                  <img
                    className="float-left"
                    src={feature.defaultLogo}
                    alt="Feature logo"
                    style={{ objectFit: 'cover', width: '100px', height: '100px' }}
                  />
                </div>
            }
            <div className="admin-form__item--upload-image__input">
              <input
                type="file"
                id="file-input"
                name="file-input"
                accept="image/*"
                onChange={this.handleUpload}
                className="admin-form__item--upload-image__input__control"
              />
            </div>
          </div>
        </div>
        <div className="admin-form__footer">
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.updateFeature}>Save changes</button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.props.closeForm}>Cancel</button>
        </div>
      </div>
    );
  }
}

export default AdminHomePageFeatureForm;
