import React from 'react';
import PropTypes from 'prop-types';
import AdminEditor from '../../General/AdminEditor.jsx';


class AdminHomePageAbout extends React.Component {

  static propTypes = {
    about: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    homepageData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    updateHomePage: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    let about = {
      title: '',
      content: ''
    };
    if (props.about) {
      about = props.about;
    }
    this.state = {
      about
    };
  }

  onChange = (string) => {
    const { about } = this.state;
    about.content = string;
    this.setState({ about });
  }

  changeValue = (e) => {
    const { about } = this.state;
    about.title = e.target.value;
    this.setState({ about });
  }

  updateAbout = () => {
    const { about } = this.state;
    const { updateHomePage, homepageData } = this.props;
    homepageData.data.about = about;
    updateHomePage(homepageData.data, () => {
    });
  }

  render() {
    const { about } = this.state;
    return (
      <div className="admin-hp-about admin-form">
        <div className="admin-form__header">Homepage About Section Configuration</div>
        <div className="admin-form__block">
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Title</label>
            <div className="admin-form__item__input">
              <input
                type="text"
                value={about.title}
                onChange={(e) => { this.changeValue(e); }}
                id="text-input"
                name="text-input"
                className="admin-form__item__input__control"
              />
            </div>
          </div>
          <div className="admin-form__item">
            <label className="admin-form__item__label" htmlFor="text-input">Content</label>
            <div className="admin-form__item__input">
              <AdminEditor
                onChange={this.onChange}
                string={about.content}
              />
            </div>
          </div>
        </div>
        <div className="admin-form__footer">
          <button type="button" className="admin-btn admin-btn--primary" onClick={this.updateAbout}>Save changes</button>
        </div>
      </div>
    );
  }
}

export default AdminHomePageAbout;
