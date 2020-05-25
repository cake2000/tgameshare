import React from 'react';
import PropTypes from 'prop-types';
import adminEnums from '../../../configs/adminEnums.js';


class AdminHomePageAccount extends React.Component {
  static propTypes = {
    accountData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    homepageData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    updateHomePage: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      accountData: props.accountData
    };
  }

  changeDes =(index, type, e) => {
    e.preventDefault();
    const value = e.target.value;
    if (value.trim !== '') {
      const { accountData } = this.state;
      accountData[type][index] = value;
      this.setState({ accountData });
    }
  }

  addDes = (type) => {
    const { accountData } = this.state;
    accountData[type].push('');
    this.setState({ accountData });
  }

  saveData = () => {
    const { homepageData, updateHomePage } = this.props;
    homepageData.data.accounts = this.state.accountData;
    updateHomePage(homepageData.data, () => {
    });
  }

  removeDes = (index, type) => {
    const { accountData } = this.state;
    accountData[type] = _.without(accountData[type], accountData[type][index]);
    this.setState({ accountData });
  }

  render() {
    const { accountData } = this.state;
    return (
      <div className="admin-homepage-account admin-form">
        <div className="admin-form__header">
          <strong>Homepage Account Type Description Configuration</strong>
        </div>
        <div className="admin-form__block ">
          {
            _.map(adminEnums.HOME_PAGE.ACCOUNT_TYPES.ARRAY_OBJECT, (type, index) => (
              <div className="admin-homepage-account__part" key={index}>
                <div className="admin-homepage-account__part__title ">
                  {type.value}
                </div>
                <div>
                  {
                    _.map(
                      accountData[type.key],
                      (des, subindex) =>
                        (
                          <div className="admin-form__item" key={subindex}>
                            <div className="admin-form__item__input">
                              <input
                                type="text"
                                value={des}
                                onChange={e => this.changeDes(subindex, type.key, e)}
                                id="text-input"
                                name="text-input"
                                className="admin-form__item__input__control"
                              />
                            </div>
                            <button
                              type="button"
                              className="admin-btn admin-btn--primary"
                              onClick={() => { this.removeDes(subindex, type.key); }}
                            >
                              <i className="fa fa-trash-o" />
                            </button>
                          </div>
                        )
                    )
                  }
                </div>
                <div>
                  <button type="button" className="admin-btn admin-btn--primary" onClick={() => { this.addDes(type.key); }}>Add description</button>
                </div>
              </div>
              ))
          }
        </div>
        <div className="admin-form__footer">
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.saveData}>Save changes</button>
        </div>
      </div>
    );
  }
}

export default AdminHomePageAccount;
