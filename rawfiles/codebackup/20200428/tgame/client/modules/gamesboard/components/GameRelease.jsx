import React from 'react';
import PropTypes from 'prop-types';

class GameRelease extends React.Component {
  static propTypes = {
    gamesRelease: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectGameRelease: PropTypes.func.isRequired
  }

  static defaultProps = {
    gamesRelease: []
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.handleSelectReleaseVersion = this.handleSelectReleaseVersion.bind(this);
  }


  componentDidMount() {
    this.handleSelectReleaseVersion();
  }

  handleSelectReleaseVersion() {
    const { selectGameRelease } = this.props;
    const value = this.selectRelease.children[this.selectRelease.selectedIndex].label;

    selectGameRelease(value);
  }

  render() {
    const { gamesRelease } = this.props;

    return (
      <div className="option--wrapper tg-container">
        <div className="option__header">
          <h1 className="option__header__title">Choose Robot&nbsp; Code Release</h1>
        </div>
        <div className="option__content">
          <div className="selection--wrapper">
            <select
              className="selection__content"
              onChange={() => {
                this.handleSelectReleaseVersion();
              }}
              ref={(ref) => { this.selectRelease = ref; }}
            >
              ({/*<option value="" >Select one...</option>*/})
              {
                _.map(gamesRelease, (item, index) => (
                  <option className="selection__option" value={item._id} key={index}>{item.releaseName}</option>
                ))
              }
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default GameRelease;
