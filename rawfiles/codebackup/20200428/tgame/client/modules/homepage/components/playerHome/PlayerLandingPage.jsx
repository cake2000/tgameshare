import React from 'react';
import isEqual from 'lodash/isEqual';
import { Link } from 'react-router-dom';

class PlayerLandingPage extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }
  render() {
    return (
      <div className="player-landing player-list">
        <span className="player-landing-content">Check out our upcoming national tournament on October 29 <a href="/landing.html" >here</a></span>
        {/* <Link className="right-link" to="landing.html">here</Link> */}
      </div>
    );
  }
}

export default PlayerLandingPage;
