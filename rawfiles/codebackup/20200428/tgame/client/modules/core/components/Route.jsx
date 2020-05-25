import React from 'react';
import moment from 'moment';
import { Route } from 'react-router-dom';
import { sendGAPageviewWhenChangePage, updateInPageDuration } from '../../../lib/GA';


class RouteMiddleware extends React.Component {
  constructor(props) {
    super(props);
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }
  componentDidMount() {
    const title = window.location.pathname + window.location.search;
    sendGAPageviewWhenChangePage(title);
    this.startTime = Date.now();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    const nextPathname = location.pathname;
    const prevPathname = prevProps.location.pathname;
    if (nextPathname !== prevPathname) {
      const title = window.location.pathname + window.location.search;
      this.updateInPageDuration();
      sendGAPageviewWhenChangePage(title);
    }
  }

  componentWillUnmount() {
    this.updateInPageDuration();
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }

  onBeforeUnload = (ev) => {
    ev.preventDefault();
    this.updateInPageDuration();
  }

  updateInPageDuration = () => {
    const endTime = moment(Date.now());
    const startTime = moment(this.startTime);
    const duration = moment.duration(endTime.diff(startTime)).asSeconds();
    updateInPageDuration(duration);
  }

  render() {
    return (
      <Route {...this.props} />
    );
  }
}

export default RouteMiddleware;

