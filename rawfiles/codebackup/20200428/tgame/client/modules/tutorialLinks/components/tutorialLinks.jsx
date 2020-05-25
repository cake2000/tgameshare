import React from 'react';
import PropTypes from 'prop-types';
import TutorialLinksListComponent from '../containers/TutorialLinksList.js';

class TutorialLinksComponent extends React.Component {
  static propTypes = {
    games: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    games: null,
    history: null
  };

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  render() {
    const {
      history, games
    } = this.props;

    return (
      <div id="all-tutorials" className="tg-page tg-page--general tg-page--tutorialLinks">
        <TutorialLinksListComponent
          listGames={games}
          history={history}
        />
      </div>
    );
  }
}

export default TutorialLinksComponent;
