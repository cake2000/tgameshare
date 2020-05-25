import React from 'react';
import PropTypes from 'prop-types';
import AdminHomePageFeatureItem from './AdminHomePageFeatureItem.jsx';
import AdminHomePageFeatureForm from './AdminHomePageFeatureForm.jsx';

class AdminHomePageFeature extends React.Component {

  static propTypes = {
    features: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    homepageData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    updateHomePage: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    let features = [];
    if (props.features) { features = props.features; }
    this.state = {
      features,
      showForm: false,
      currentFeature: null
    };
  }


  setFeatureForEdit = (index, e) => {
    e.preventDefault();
    this.setState({ currentFeature: index });
    this.toggleForm();
  }

  toggleForm = () => this.setState({ showForm: !this.state.showForm });

  updateFeature = (action, feature, index) => {
    let newfeatures = this.state.features;
    const { homepageData, updateHomePage } = this.props;
    if (action === 'add') {
      newfeatures.push(feature);
    }
    if (action === 'edit') {
      newfeatures[index] = feature;
    }
    if (action === 'delete') {
      newfeatures = _.without(newfeatures, newfeatures[index]);
    }
    homepageData.data.features = newfeatures;
    updateHomePage(homepageData.data, () => {
      this.setState({ features: newfeatures });
      if (action !== 'delete') {
        this.toggleForm();
      }
    });
  }

  render() {
    const { showForm, features, currentFeature } = this.state;
    return (
      <div className="admin-homepage-feature">
        {
          !showForm ?
            <div className="admin-cards">
              <div className="admin-title">Features</div>
              <div className="admin-cards__content">
                {
                  _.map(features, (feature, index) => (
                    <AdminHomePageFeatureItem
                      key={index}
                      index={index}
                      feature={feature}
                      setFeatureForEdit={this.setFeatureForEdit}
                      updateFeature={this.updateFeature}
                    />
                  ))
                }
                <div role="button" tabIndex={0} onClick={this.toggleForm} className="admin-cards__content__add-btn">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                  >
                    <i className="fa fa-plus" /> Add Feature
                  </button>
                </div>
              </div>
            </div>
           : <AdminHomePageFeatureForm
             updateFeature={this.updateFeature}
             feature={features[currentFeature]}
             closeForm={this.toggleForm}
           />
        }
      </div>
    );
  }
}

export default AdminHomePageFeature;
