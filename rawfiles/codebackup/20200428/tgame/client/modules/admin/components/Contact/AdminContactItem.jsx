import React from 'react';
import PropTypes from 'prop-types';

class AdminContactItem extends React.Component {

  static propTypes = {
    contact: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  render() {
    const { contact } = this.props;
    return (
      <div className="admin-table__content__data__item">
        <div className="admin-table__content__col--3 admin-table__content__data__item__col">
          <span>{contact.email}</span>
        </div>
        <div className="admin-table__content__col--3 admin-table__content__data__item__col">
          <span>{contact.subject}</span>
        </div>
        <div className="admin-table__content__col--4 admin-table__content__data__item__col">
          <span>{contact.message}</span>
        </div>
      </div>
    );
  }
}

export default AdminContactItem;
