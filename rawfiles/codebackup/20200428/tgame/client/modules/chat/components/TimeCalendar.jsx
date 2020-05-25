import React from 'react';
import moment from 'moment';


class TimeCalendar extends React.Component {
  componentWillMount() {
    this.interval = setInterval(() => {
      this.forceUpdate();
    }, 60000);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  render() {
    const { datetime } = this.props;
    return (
      <span>{moment(datetime).fromNow()}</span>
    );
  }
}

export default TimeCalendar;
