import React from 'react';
import ReactDOM from 'react-dom';
import isEqual from 'lodash/isEqual';
import ModalVideo from 'react-modal-video';
import Slider from 'react-slick';
// import YouTube from 'react-youtube';
import PropTypes from 'prop-types';
import GameComponent from './GameComponent.jsx';

const opts = {
  height: '360',
  width: '640',
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 0
  }
};

const settings = {
  slidesToScroll: 2,
  slidesToShow: 2,
  arrows: false,
  dotsClass: 'slick--dot',
  // centerMode: true,
  // centerPadding: '60px',
  autoplay: false,
  infinite: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToScroll: 1,
        slidesToShow: 1,
        dots: false
      }
    }
  ]
};

class GameSelection extends React.Component {
  static propTypes = {
    gamesList: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectGame: PropTypes.func.isRequired,
    gameSelected: PropTypes.object // eslint-disable-line react/forbid-prop-types
  }
  static defaultProps = {
    gamesList: [],
    gameSelected: null
  }
  constructor(props) {
    super(props);
    this.state = {
      isOpenTutorial: false
    };
  }

  openModal = () => {
    this.setState({ isOpenTutorial: true });
  }

  closeModal = () => {
    this.setState({ isOpenTutorial: false });
  }

  renderGames = () => {
    const { gamesList, gameSelected } = this.props;
    if (gamesList.length === 0) return (<div />);
    return (
      <div className="option__content slick--content">
        <Slider {...settings} dots={gamesList.length > 2}>
          {_.map(gamesList, item => (
            <div key={item.name}>
              <GameComponent
                game={item}
                gameSelected={gameSelected}
                selectGame={this.props.selectGame}
              />
            </div>
          ))}
        </Slider>
      </div>
    );
  }

  render() {
    let isTutorial = false;
    if (document.URL.indexOf("/courses") > 0) {
      isTutorial = true;
    }
    return (
      <div className="option--wrapper tg-container" id="select-game">
        <div className="option__header">
          <h1 className="option__header__title select-game-title">{"" + (isTutorial ? "Select Game Robot Type" : "Pick A Game To Play")}</h1>
        </div>
        {this.renderGames()}
        <a className="tutorialVideoLink" onClick={this.openModal}>
          Quick Tour Video
        </a>
        <ModalVideo
          channel="youtube"
          isOpen={this.state.isOpenTutorial}
          videoId="Afo1HG9-wsk?hd=1"
          onClose={this.closeModal}
        />
      </div>
    );
  }
}

export default GameSelection;
