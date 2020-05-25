import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _round from 'lodash/round';
import { withRouter } from 'react-router-dom';
import { COURSE_PRICE } from '../../../../../lib/enum';

class CourseItem extends Component {
  goToCourse = () => {
    const {
      gameId, isSlideFormat, packageType, history,
      selectGameTutorial
    } = this.props;

    selectGameTutorial({ gameId, packageType, isSlideFormat });
    const url = isSlideFormat ? '/courses' : '/courses';
    history.push(url);
  }

  calcCentToUsd = cent => _round(cent / 100, 2)

  render() {
    const {
      title, completed, total, imageUrl, packageType, userData, gameId,
    } = this.props;

    const boughtCourse = _get(userData, 'boughtCourse', []);
    const isBought = boughtCourse.find(item => item.gameId === gameId && item.packageType === packageType);
    const price = _get(COURSE_PRICE, [gameId, packageType], 0); 
    const priceUsd = this.calcCentToUsd(price);

    let url = imageUrl;
    if (url == "/images/turtlegreen.png" && packageType != "starter") {
      url = "/images/turtlecolor1.png";
    }

    return (
      <div
        onClick={this.goToCourse}
        role="presentation"
        className={`courses--wrapper courses--${packageType}`}
      >
        <div className="courses-group">
          <div className={`courses__logoGames courses__logoGames--${packageType}`}>
            <img src={url || "/img_v2/Pool@2x.png"} alt={title} />
          </div>
          <div className="courses-group__right">
            <div className="courses__nameGames">
              <h5 className="courses__nameGames__title">{title}</h5>
            </div>
            <div className="courses__progressGames">
              <div className="courses__nameGames__breadcrumbs">{`${completed}/${total}`}</div>
              <progress max="100" value={Math.round((completed / total) * 100)} />
            </div>
          </div>
        </div>
        <div className="courses__resumeGame">
          <span className={`courses__resumeGame__type courses__resumeGame__type--${packageType}`}>{packageType == "starter" ? "Beginner" :   ( packageType === "schoolA" || packageType === "schoolB" ? '' : packageType)}</span>
          <span className="courses__resumeGame__price">{packageType === "starter" ? 'Free' : isBought ? 'Bought' :  ( packageType === "schoolA" || packageType === "schoolB" ? 'School' : '$' + priceUsd)}</span>
        </div>
      </div>
    );
  }
}

CourseItem.propTypes = {
  title: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  completed: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  gameId: PropTypes.string.isRequired,
  packageType: PropTypes.string.isRequired,

  // router
  history: PropTypes.shape().isRequired
};

export default withRouter(CourseItem);
