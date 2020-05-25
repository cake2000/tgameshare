import React from 'react';
import { string, number } from 'prop-types';

const PlayerStaticsItem = ({ imageIconUrl, title, staticsValue }) => (
  <div className="player-statics__items">
    <img src={imageIconUrl} alt={title} />
    <div className="statics-info">
      <span className="statics-info__title">{title}</span>
      <span className="statics-info__value">{staticsValue}</span>
    </div>
  </div>
);

PlayerStaticsItem.propTypes = {
  imageIconUrl: string.isRequired,
  title: string.isRequired,
  staticsValue: number.isRequired,
};


export default PlayerStaticsItem;
