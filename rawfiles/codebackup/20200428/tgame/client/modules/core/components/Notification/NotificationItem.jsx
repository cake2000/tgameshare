import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import NotificationItemWrapper from './NotificationItemWrapper.jsx';

export default class NotificationItem extends PureComponent {
  render() {
    const { notification } = this.props;
    return (
      <NotificationItemWrapper>
        {notification.message}
      </NotificationItemWrapper>
    );
  }
}


NotificationItem.propTypes = {
  notification: PropTypes.object // eslint-disable-line react/forbid-prop-types
};

NotificationItem.defaultProps = {
  notification: {}
};
