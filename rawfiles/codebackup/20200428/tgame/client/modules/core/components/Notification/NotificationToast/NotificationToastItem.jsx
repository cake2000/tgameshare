import React, { PureComponent } from 'react';

export default class NotificationToastItem extends PureComponent {
  render() {
    const { msg } = this.props;
    return (
      <div className="toast-notification">
        {msg}
      </div>
    );
  }
}
