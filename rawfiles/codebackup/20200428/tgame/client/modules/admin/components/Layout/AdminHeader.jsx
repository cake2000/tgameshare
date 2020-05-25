import React from 'react';
// import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class AdminHeader extends React.Component {

  render() {
    return (
      <div className="header">
        <div className="header__container">
          <div className="header__container__navbar" data-animation="default" data-collapse="small" data-duration="400">
            <div className="tg-container">
              <Link className="brand tg-nav__brand" to="/">
                <img alt="" className="tgame-logo" src="/images/logo-3.gif" width="250" />
              </Link>
              <div className="menu-button-2 w-clearfix w-nav-button">
                <div className="icon-5 w-icon-nav-menu">{''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminHeader;
