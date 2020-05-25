import React, { Component } from 'react';
import _map from 'lodash/map';
import FactoryItem from './factoryItem';
import PropTypes from 'prop-types';
import Collapsible from 'react-collapsible';

class Factories extends Component {
  openScratchEditor() {
    let pid = document.getElementById('scratchprojectid').value;
    this.props.history.push(`/scratcheditor/${pid}`);
  }

  render() {
    const { games} = this.props;

    return (
      <div className="tg-page__container" style={{maxWidth: "700px"}}>
        <div className="tg-page__container__wrapper">
          <div className="player-block">
            <div>
              <center>
                <br/>
                <label>Scratch Editor &nbsp;&nbsp;&nbsp;</label>
                <input type="text" width="100px" id="scratchprojectid" placeholder="project ID" />
                &nbsp;
                &nbsp;
                <button className="btn btn--courses" type="button" onClick={this.openScratchEditor.bind(this)} >Open</button>
              </center>
              <h2 style={{textAlign: "center", margin: "30px"}}>
                Select Game Bot Factory
              </h2>
            </div>
            <div className="collapsible2 collapsible2--courses">
              {_map(games || [], game => (
                <FactoryItem id={game._id} title={game.title} imageUrl={game.imageUrl}  passcnt={game.passcnt}  totalcnt={game.totalcnt}  key={game._id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Factories.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    progress: PropTypes.number,
    unlocked: PropTypes.bool,
    package: PropTypes.string,
    ScenarioName: PropTypes.string
  })),
  selectGameTutorial: PropTypes.func.isRequired
};

Factories.defaultProps = {
  courses: []
};

export default Factories;
