import React, { Component, PropTypes } from 'react';


class AdminGeneral extends Component {
  static propTypes = {
    updateGeneral: PropTypes.func.isRequired,
    generalData: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    let generalData = {
      email: ''
    };
    if (props.generalData) {
      generalData = props.generalData;
    }
    this.state = {
      generalData
    };
  }

  changeValue(property, e) {
    const value = e.target.value;
    const { generalData } = this.state;
    generalData[property] = value;
    this.setState({ generalData });
  }

  updateGeneral = () => {
    const { generalData } = this.state;
    const { updateGeneral } = this.props;
    updateGeneral(generalData, () => {
    });
  }

  render () {
    const { generalData } = this.state;
    return (
      <div className="admin-general">
        <div className="admin-general__form admin-form">
          <div className="admin-form__header">General Settings</div>
          <div className="admin-form__block">
            <div className="admin-form__item">
              <label className="admin-form__item__label" htmlFor="text-input">Admin email</label>
              <div className="admin-form__item__input">
                <input
                  type="text"
                  value={generalData.email}
                  onChange={(e) => { this.changeValue('email', e); }}
                  id="text-input"
                  name="text-input"
                  className="admin-form__item__input__control"
                />
              </div>
            </div>
          </div>
          <div className="admin-form__footer">
            <button type="button" className="admin-btn admin-btn--primary" onClick={this.updateGeneral}>Save changes</button>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminGeneral;

