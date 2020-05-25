import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

class FactoryItem extends Component {
  gotoFactory = (gameId) => {
    const {
      history, id
    } = this.props;

    // selectGameTutorial({ gameId, packageType, isSlideFormat });
    const url = `/factory/${id}`;
    history.push(url);
  }

  getTestString() {
    const {
      title, totalcnt, imageUrl, passcnt
    } = this.props;
    if (totalcnt > 1) {
      return `${passcnt} out of ${totalcnt} tests passing.`;
    } else if (totalcnt == 1) {
      return `${passcnt} out of ${totalcnt} test passing.`;
    } else {
      return `No tests at the moment.`;
    }
  }

  render() {
    const {
      title, totalcnt, imageUrl, passcnt
    } = this.props;

    return (
      <div className="courses--wrapper">
        <div className="courses__logoGames">
          <img src={imageUrl || "/img_v2/Pool@2x.png"} alt={title} />
        </div>
        <div className="courses__nameGames">
          <h5 className="courses__nameGames__title">{title}</h5>
          <div className="courses__nameGames__breadcrumbs">{ this.getTestString() }</div>
        </div>
        <div className="courses__resumeGame">
          <button className="btn btn--courses" type="button" onClick={this.gotoFactory}>Go to Factory</button>
        </div>
      </div>
    );
  }
}

FactoryItem.propTypes = {
  title: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  totalcnt: PropTypes.number.isRequired,
  passcnt: PropTypes.number.isRequired,
  _id: PropTypes.string.isRequired,
  // router
  history: PropTypes.shape().isRequired
};

export default withRouter(FactoryItem);
