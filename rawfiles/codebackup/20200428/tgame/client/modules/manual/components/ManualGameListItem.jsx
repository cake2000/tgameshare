import React from 'react';
import { withRouter } from 'react-router-dom';

class ManualGameListItem extends React.Component {

  goToManualDetail = () => {
    const { game, history } = this.props;
    const { _id } = game;
    history.push(`/manual-detail/${_id}`);
  }

  render() {
    const { game, order } = this.props;
    return (
      <div className="game-item" onClick={this.goToManualDetail}>
        <span className="game-item--title">{order}. {game.title}</span>
      </div>
    );
  }
}

export default withRouter(ManualGameListItem);
