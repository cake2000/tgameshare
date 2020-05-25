import React from 'react';
import PropTypes from 'prop-types';

class Banner extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  }

  static defaultProps = {
    backFunction: null
  }


  render() {
    const { title } = this.props;
    return (
      <div className="tg-page__header">
        <div className="tg-page__header__block tg-container">
          <h1 className="heading-page">{title}</h1>
        </div>
      </div>
    );
  }
}

export default Banner;
