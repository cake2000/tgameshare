import React from 'react';
import { shape, number } from 'prop-types';
import PlayerStaticsItem from './PlayerStaticsItem.jsx';


class PlayerStatics extends React.Component {
  render() {
    const { statics, style } = this.props;
    return (
      <div className="player-statics" style={style}>
        <PlayerStaticsItem
          imageIconUrl="/img_v2/Coins@2x.png"
          title="Gold Coins"
          staticsValue={statics.coins}
        />
        <PlayerStaticsItem
          imageIconUrl="/img_v2/Games@2x.png"
          title="Practice Games"
          staticsValue={statics.practiceGamesCount}
        />
        <PlayerStaticsItem
          imageIconUrl="/img_v2/Battles@2x.png"
          title="Online Battles"
          staticsValue={statics.onlineBattleCount}
        />
        <PlayerStaticsItem
          imageIconUrl="/img_v2/Trophy@2x.png"
          title="Battles Won"
          staticsValue={statics.battleWonCount}
        />
      </div>
    );
  }
}

PlayerStatics.propTypes = {
  statics: shape({
    coins: number,
    practiceGamesCount: number,
    onlineBattleCount: number,
    battleWonCount: number
  }).isRequired
};


export default PlayerStatics;
