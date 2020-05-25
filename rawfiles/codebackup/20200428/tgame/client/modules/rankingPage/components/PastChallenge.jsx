import React from 'react';
import PastChallengeItem from './PastChallengeItem.jsx';

class PastChallenge extends React.PureComponent {
  renderPastChallengeRecord = (challengeHistory) => {
    return <PastChallengeItem {...this.props} key={challengeHistory._id} challengeHistory={challengeHistory} />;
  };

  render() {
    const { challengeHistoryList } = this.props;

    return (
      <div>
        <h2 className="Past-challenge__title">Past Game Bot Challenges</h2>
        <table className="Past-challenge__table">
          <thead className="Past-challenge__header">
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Role</th>
              <th>Opponent (Rating)</th>
              <th>Result</th>
              <th>Rating Change</th>
              {/* <th>Challenge Opponent</th> */}
            </tr>
          </thead>
          <tbody className="Past-challenge__body">
            {challengeHistoryList.map(this.renderPastChallengeRecord)}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PastChallenge;
