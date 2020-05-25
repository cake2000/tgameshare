import React from 'react';
import PropTypes from 'prop-types';
import { getBase64String } from '../../../configs/helpers.js';

class AdminHomePageBanner extends React.Component {

  static propTypes = {
    banner: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    homepageData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    updateHomePage: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    let banner = {
      sloganFirstLine: '',
      sloganSecondLine: '',
      chooseCampText: '',
      camps: {
        humanCamp: {
          logo: null,
          title: 'Human Camp',
          des: ''
        },
        aiCamp: {
          logo: null,
          title: 'Robot Camp',
          des: ''
        }
      }
    };
    if (props.banner) { banner = props.banner; }
    this.state = {
      banner
    };
  }

  validateForm = () => {
    const { banner } = this.state;
    let count = 0;
    if (banner.sloganFirstLine.trim() === '' ||
    banner.sloganSecondLine.trim() === '' ||
    banner.chooseCampText.trim() === '' ||
    banner.aiCamp.des === '' ||
    banner.humanCamp.des === '') {
      count += 1;
    }
    return count;
  }

  updateBanner = () => {
    const { banner } = this.state;
    const { updateHomePage, homepageData } = this.props;
    homepageData.data.banner = banner;
    updateHomePage(homepageData.data, () => {
    });
  }

  handleUpload = (index) => {
    const fileImages = $(`#camp-file-input-${index}`)[0].files;
    const banner = this.state.banner;

    _.map(fileImages, (fileImage) => {
      getBase64String(fileImage, { height: 415, width: 594 }, (base64String) => {
        banner.camps[index].logo = base64String;
        this.setState({ banner });
      });
    });
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { banner } = this.state;
    if (property === 'humanCampTitle') {
      banner.camps.humanCamp.des = value;
    } else if (property === 'aiCampTitle') {
      banner.camps.aiCamp.des = value;
    } else {
      banner[property] = value;
    }
    this.setState({ banner });
  }

  render() {
    const { banner } = this.state;
    return (
      <div className="admin-hp-banner">
        <div className="admin-hp-banner__form admin-form">
          <div className="admin-form__header">
            <strong>Homepage Top Banner Configuration</strong>
          </div>
          <div className="admin-form__block">
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Slogan First Line</label>
              <div className="admin-form__item__input">
                <input
                  type="text"
                  value={banner.sloganFirstLine}
                  onChange={(e) => { this.changeValue('sloganFirstLine', e); }}
                  id="text-input"
                  name="text-input"
                  className="admin-form__item__input__control"
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Slogan Second Line</label>
              <div className="admin-form__item__input">
                <input
                  type="text"
                  value={banner.sloganSecondLine}
                  onChange={(e) => { this.changeValue('sloganSecondLine', e); }}
                  className="admin-form__item__input__control"
                />
              </div>
            </div>
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Choose Camp Text</label>
              <div className="admin-form__item__input">
                <input
                  type="text"
                  value={banner.chooseCampText}
                  onChange={(e) => { this.changeValue('chooseCampText', e); }}
                  className="admin-form__item__input__control"
                />
              </div>
            </div>
            {
              _.map(banner.camps, (camp, index) => (
                <div className="admin-form__fieldset" key={index}>
                  <div className="admin-form__fieldset__title">
                    {camp.title}
                  </div>
                  <div className=" admin-form__item">
                    <label className="admin-form__item__label" htmlFor="text-input">Description</label>
                    <div className="admin-form__item__input">
                      <input
                        type="text"
                        value={camp.des}
                        onChange={(e) => {
                          let property = 'humanCampTitle';
                          if (camp.title === 'Robot Camp') { property = 'aiCampTitle'; }
                          this.changeValue(property, e);
                        }}
                        className="admin-form__item__input__control"
                      />
                    </div>
                  </div>
                  {/* <div className="admin-form__item--upload-image">
                    <label className="admin-form__item--upload-image__label" htmlFor="file-input">Camp Logo</label>
                    {
                      camp.logo ?
                        <div className="admin-form__item--upload-image__image">
                          <img
                            className=""
                            src={camp.logo}
                            alt="Camp logo"
                            style={{ objectFit: 'cover', width: '100px', height: '100px' }}
                          />
                        </div>
                         : null
                    }
                    <div className="admin-form__item--upload-image__input">
                      <input
                        type="file"
                        id={`camp-file-input-${index}`}
                        name="file-input"
                        accept="image/*"
                        onChange={() => this.handleUpload(index)}
                        className="admin-form__item__input__control"
                      />
                    </div>
                  </div> */}
                </div>
              ))
            }
          </div>
          <div className="admin-form__footer">
            <button type="button" className="admin-btn admin-btn--primary" onClick={this.updateBanner}>Save changes</button>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminHomePageBanner;
