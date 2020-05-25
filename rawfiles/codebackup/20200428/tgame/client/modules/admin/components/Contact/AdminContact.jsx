import React from 'react';
import PropTypes from 'prop-types';
import AdminContactItem from './AdminContactItem.jsx';

class AdminContact extends React.Component {

  static propTypes = {
    contacts: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  render() {
    const { contacts } = this.props;
    return (
      <div className="admin-contact admin-table">
        <div className="admin-table__header">Contact Detail</div>
        <div className="admin-table__content">
          <div className="admin-table__content__title">
            <div className="admin-table__content__col--3 admin-table__content__title__item">
              <span>Email</span>
            </div>
            <div className="admin-table__content__col--3 admin-table__content__title__item">
              <span>Subject</span>
            </div>
            <div className="admin-table__content__col--4 admin-table__content__title__item">
              <span>Message</span>
            </div>
          </div>
          <div className="admin-table__content__data">
            {
              _.map(contacts, (contact, index) =>
                (<AdminContactItem contact={contact} key={index} />)
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default AdminContact;
