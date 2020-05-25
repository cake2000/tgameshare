import React from 'react';
import ManualGameListItem from './ManualGameListItem.jsx';

class ManualGameList extends React.Component {

  renderGameListItem = (game, index) => (<ManualGameListItem
    game={game}
    key={game._id}
    order={index + 1}
  />)

  renderGameList = () => {
    const { gameList } = this.props;
    return (
      <div className="manual-page--list">
        {gameList.map(this.renderGameListItem)}
      </div>
    );
  }

  render() {
    return (
      <div className="manual-page">
        <div className="all-manual-game">
          <div className="manual-page--title">
            <h3>Manual Game List</h3>
          </div>
          {this.renderGameList()}
        </div>
      </div>
    );
  }
}

export default ManualGameList;
