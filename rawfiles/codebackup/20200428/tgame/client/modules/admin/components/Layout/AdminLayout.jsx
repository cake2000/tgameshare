import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import AdminSideBar from "./AdminSideBar.jsx";
import AdminHeader from "./AdminHeader.jsx";


class AdminLayout extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    isSupport: PropTypes.bool.isRequired
  }


  render() {
    if (this.props.isAdmin || this.props.isSupport) {
      return (
        <div className="admin-layout">
          <div className="admin-layout__header">
            <AdminHeader />
          </div>
          <div className="admin-layout__body">
            <div className="admin-layout__body__sidebar">
              <AdminSideBar {...this.props} />
            </div>
            <div className="admin-layout__body__content">
              {this.props.children}
            </div>
          </div>
        </div>
      );
    }
    if (Meteor.userId()) {
      return (
        <div className="no-auth">Permission Denied</div>
      );
    }

    return (
      <Redirect to="/error/404" />
    );
  }
}

export default AdminLayout;
