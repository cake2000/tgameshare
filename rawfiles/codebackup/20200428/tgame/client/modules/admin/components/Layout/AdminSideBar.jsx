import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';


class AdminSideBar extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    isSupport: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      showHomepageSubItem: props.history.location.pathname.includes('/admin/home/')
    };
  }

  showHomepageSubItem = (e) => {
    e.preventDefault();
    this.setState({ showHomepageSubItem: !this.state.showHomepageSubItem });
  }

  componentDidMount() {
    document.title = 'TGame - Admin';
  }

  render() {
    const { isSupport, isAdmin } = this.props;
    return (
      <div className="admin-sidebar">
        <nav className="admin-sidebar--nav">
          { isSupport
            && (
            <ul className="admin-sidebar--nav__list">
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/dashboard" className="nav-link" activeClassName="active"> Dashboard </NavLink>
                </div>
              </li>
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/chat-support" className="nav-link" activeClassName="active"> Chat support</NavLink>
                </div>
              </li>
            </ul>
            )
          }
          {
            isAdmin
            && (
            <ul className="admin-sidebar--nav__list">
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/dashboard" className="nav-link" activeClassName="active"> Dashboard </NavLink>
                </div>
              </li>
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/general" className="nav-link" activeClassName="active"> General</NavLink>
                </div>
              </li>
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/contact" className="nav-link" activeClassName="active"> Contact</NavLink>
                </div>
              </li>
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <a className="nav-link" href="#" onClick={this.showHomepageSubItem}> Homepage</a>
                </div>
                {
                  this.state.showHomepageSubItem
                    ? (
                      <ul className="admin-sidebar--nav__page--component">
                        <li className="page--component__item">
                          <NavLink to="/admin/home/banner" className="nav-link " activeClassName="active"> Top Banner</NavLink>
                        </li>
                        <li className="page--component__item">
                          <NavLink to="/admin/home/feature" className="nav-link" activeClassName="active"> Features Section</NavLink>
                        </li>
                        <li className="page--component__item">
                          <NavLink to="/admin/home/account" className="nav-link" activeClassName="active"> Account Types</NavLink>
                        </li>
                        <li className="page--component__item">
                          <NavLink to="/admin/home/about" className="nav-link" activeClassName="active"> About</NavLink>
                        </li>
                        <li className="page--component__item">
                          <NavLink to="/admin/home/FAQ" className="nav-link" activeClassName="active"> FAQ</NavLink>
                        </li>
                      </ul>
                    ) : null
                }
              </li>
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/game" className="nav-link" activeClassName="active"> Games</NavLink>
                </div>
              </li>
              <li className="admin-sidebar--nav__item">
                <div className="admin-sidebar--nav__page">
                  <NavLink to="/admin/tournament" className="nav-link" activeClassName="active"> Tournament</NavLink>
                </div>
              </li>
            </ul>
            )
          }
        </nav>
      </div>
    );
  }
}

export default AdminSideBar;
