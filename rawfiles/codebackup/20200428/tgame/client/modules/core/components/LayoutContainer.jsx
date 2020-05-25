import React from 'react';
import PropTypes from 'prop-types';


class MainLayout extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired
  }

  render() {
    const { children } = this.props;

    return (
      <div>
        {children}
      </div>
    );
  }
}

export default MainLayout;
