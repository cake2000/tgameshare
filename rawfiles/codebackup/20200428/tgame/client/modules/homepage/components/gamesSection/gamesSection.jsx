import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';

class gamesSection extends React.Component {
  static propTypes = {
    games: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    history: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  }
  constructor(props) {
    super(props);
    this.state = {};
    this.redirectTo = this.redirectTo.bind(this);
  }
  redirectTo(path) {
    const { history } = this.props;
    if (Meteor.userId()) {
      history.push(`/gamesboard/${path}`);
    } else {
      history.push('/signup');
    }
  }
  render() {
    const { games } = this.props;
    let gameArray = [];

    if (games.length > 0) {
      gameArray = _.map(games, (game, index) => (
        <div className="pricing-games__block" key={index} onClick={() => (this.redirectTo(game.name))}>
          <img
            className="game-icon"
            src={game.imageUrl}
            alt={game.title}
            style={{ objectFit: 'cover', width: '160px', height: '160px' }}
          />
          <h1 className="heading">{game.title}</h1>
          <div className="text">{game.description}</div>
          {/* <div className="games-sign-up-button" data-ix="mobile-signup-popup">
            <div aria-hidden onClick={() => (this.redirectTo(game.name))} className="text-block-9">Sign Up &amp; Play FREE</div>
          </div> */}
        </div>
        ));
    } else {
      gameArray.push(
        <div />
      );
    }

    const settings = {
      slidesToScroll: 2,
      slidesToShow: 2,
      arrows: false,
      dotsClass: 'slick--dot',
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
        },
      ]
    };

    if (gameArray.length > 2) {
      settings.dots = true;
    }

    return (
      <div>
        <div className="games-section" id="games">
          <center><h2 className="title">GAMES</h2></center>
          <div className="pricing-games tg-container">
            <div className="games-section wow fadeIn">
              <div className="pricing-games tg-container">
                {gameArray}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default gamesSection;
