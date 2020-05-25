import React from 'react';
// import PropTypes from 'prop-types';
import Banner from '../../core/components/Banner.jsx';

const localGamesList = [
  {
    title: 'Trajectory Pool',
    imageUrl: '/images/poolscreenicon2.png',
    description: 'Pool game with full preview of ball trajectory and random shot execution to try your luck',
    teamSize: 1,
    teamNumber: 2
  },
  // {
  //   title: 'Dodge Ball',
  //   imageUrl: '/images/cardodgeballicon.jpg',
  //   description: 'First-person ball shooting game with cars in a 3D world',
  //   teamSize: 1,
  //   teamNumber: 2
  // }
  // {
  //   title: 'Magic Forest',
  //   imageUrl: '/images/magicforestscreenshot1.png',
  //   description: 'Grab magic mushroom in a maze guarded by monsters',
  //   teamSize: 1,
  //   teamNumber: 2
  // }
];

class GameGuideComponents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSection: 0
    };
    this.accordionShow = this.accordionShow.bind(this);
  }
  accordionShow = (section, event) => {
    if (section === 'accordion-5') {
      const { target } = event;
      if (target.className.includes('game')) return;
    }
    $(`#${section}`).slideToggle('slow');
  };

  toggleGamesection = (e, index) => {
    e.preventDefault();
    const { currentSection } = this.state;
    if (index === currentSection) {
      $(`#section-guide-${index}`).slideToggle();
      return;
    }
    $(`#section-guide-${currentSection}`).slideUp();
    $(`#section-guide-${index}`).slideDown();
    this.setState({ currentSection: index });
  }

  render() {
    const { currentSection } = this.state;
    const { gamesList } = this.props;

    const games = gamesList || localGamesList;

    return (
      <div className="tg-page tg-page--gameGuide">
        {/* <Banner title="Game Guide" /> */}
        <div className="tg-page__content tg-page__content--gameGuide tg-container">
          <div
            className="guide-game-wrapper"
          >
            {/* <div className="game--container">
              {
                games.map((game, index) => (
                  <div
                    aria-hidden
                    key={index}
                    className={`game--wrapper ${index === currentSection ? 'active' : ''}`}
                    onClick={e => this.toggleGamesection(e, index)}
                  >
                    <div className="game__info">
                      <img className="game__info__image" src={game.imageUrl} alt="game" />
                      <div className="game__info__title">{game.title}</div>
                    </div>
                  </div>
                ))
              }
            </div> */}
          </div>
          <div className="tg-page__content__header">
            <h4>{games[currentSection].title} Guide Book</h4>
          </div>
          <div className="accordion--guide">
            <div
              className="accordion__items"
              role="button"
              tabIndex={0}
              onClick={() => { this.accordionShow('accordion-1'); }}
            >
              <div className="accordion__items__header">
                <p>Introduction</p>
                <span className="tg-icon-tg-down" />
              </div>
              <div id="accordion-1" className="accordion__items__content">
                <p>
                  Trajectory Pool is different from all the pool games you have played before: full preview of baseline trajectory is displayed for all balls, but your shot direciton is randomly shocked based on how difficult the shot is (strength and spin). 
                </p>
                <p>
                  These new changes (US patent pending) make the game much more fair between human and robot players. Since all players can input their shot intention precisely, strategic planning becomes the key factor in winning a game.
                </p>
              </div>
            </div>
            <div
              className="accordion__items"
              role="button"
              tabIndex={0}
              onClick={() => { this.accordionShow('accordion-2'); }}
            >
              <div className="accordion__items__header">
                <p>Player Inputs</p>
                <span className="tg-icon-tg-down" />
              </div>
              <div id="accordion-2" className="accordion__items__content">
                <img src="images/TrajectoryPoolControls.jpg" width="100%" alt="" />
                <p>
                  To take a shot, you need to specify its direction, speed and spin:
                </p>
                <ul className="accordion__list accordion__list--level">
                  <li className="accordion__list__items">
                    <span className="heading">Direction</span>
                    <span className="content">you can click or touch any point on the pool table, and cue stick will aim the cue ball towards that point. To fine-tune the direction, you can press one of the 2 buttons at bottom right to adjust the direction clockwise or counterclockwise. In addition, whenever the cue ball is aimed at a ball you can legally shoot, you can press the blue <b>AUTO</b> button at bottom right, which will automatically adjust the aiming direction towards an optimal pocket for you.  </span>
                  </li>
                  <li className="accordion__list__items">
                    <span className="heading">Speed</span>
                    <span className="content">you can touch any point on the SPEED bar on right to specify a strength to use;</span>
                  </li>
                  <li className="accordion__list__items">
                    <span className="heading">Spin (advanced game level only)</span>
                    <span className="content">you can touch any point on the SPIN bar on right to specify a vertical spin, which can be forward spin or backward spin depending on you hitting above or below the middle mark;</span>
                  </li>
                </ul>
                <p>
                  You can review the baseline trajectory in real time as you change these shot parameters. Whenever a ball can be legally pocketed (see game rules below), a green circle will mark that ball as the <b>Target Ball</b> and that pocket the <b>Target Pocket</b>. Note that these trajectory lines are only for baseline forecasts, since we add a random adjustment to your inputs.
                </p>
                <ul className="accordion__list accordion__list--level">
                  <li className="accordion__list__items">
                    <span className="heading">Randomized Simulation [Patent Pending]</span>
                    <span className="content">In real-world pool games, there are always random errors when you take a shot, so the cue ball wouldn’t be going exactly where you are aiming at, especially when you are hitting the cue ball with stronger strength or more spin. To reproduce this effect, the Trajectory Pool game engine will add a random adjustment to your shot parameter inputs. The faster the shot, and the more spin applied, the more random is the shot.</span>
                    <span className="content">The random adjustment will follow a Normal (Gaussian) distribution with a mean of 0 and a standard deviation that increases as you increase shot strength and spin. It is possible that you take a more uncertain shot (like aimingat a faraway target ball with full speed) but end up being lucky.</span>
                    <span className="content">To help you gauge how much randomness will affect your shot, we tell you how likely a ball would be pocketed whenever a target ball is projected to fall into a pocket in the baseline trajectory. This success probability is displayed on the striek button on the top right.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="accordion__items"
              role="button"
              tabIndex={0}
              onClick={() => { this.accordionShow('accordion-3'); }}
            >
              <div className="accordion__items__header">
                <p>Rules of Play</p>
                <span className="tg-icon-tg-down" />
              </div>
              <div id="accordion-3" className="accordion__items__content">
                <p>
                  We apply a simplified version of the rules from WPA
                  <br />
                  (link to http://upatour.com/official-billiard-rules/u-s-8-ball-rules/)
                </p>
                <ul className="accordion__list accordion__list--icon">
                  <li className="accordion__list__items">

                    <span className="heading">Time Control</span>
                    <span className="content">
                      <i className="">.i</i>
                      Each player has a dedicated clock, which runs during a player's turn to make a shot and is paused when the turn is over. If a player's time is used up before game is over, then that player loses the game on time.
                    </span>
                    
                    <span className="heading">Break Shot</span>
                    <span className="content">
                      <i className="">.i</i>
                      A randomly chosen player (the Breaker) starts the
                         game with a break shot, with the cue ball placed
                         at anywhere behind the head string;
                    </span>

                    <span className="content">
                      <i className="">.ii</i>
                      If the cue ball is pocketed, the opponent takes the break shot after the table is reset (all balls reset to their original position);
                    </span>

                    <span className="content">
                      <i className="">.iii</i>
                      Otherwise, if the black ball is pocketed, the breaker wins the game;
                    </span>

                    <span className="content">
                      <i className="">.iv</i>
                      Otherwise, if a non-black ball is pocketed without any foul, the breaker continues to take a call shot (he/she is still free to call any color);
                    </span>

                    <span className="content">
                      <i className="">.v</i>
                      Otherwise, If less than 4 balls are driven to the rails, the table is reset for the opponent player to take the break shot;
                    </span>
                    <span className="content">
                      <i className="">.vi</i>
                      Otherwise, the break shot is valid, and the opponent player proceeds to take a called shot
                    </span>
                  </li>


                  <li className="accordion__list__items">
                    <span className="heading">Call Shot</span>
                    <span className="content">
                      <i className="">.i</i>
                      The player has to adjust the shot parameters (direction/strength/spin) until the baseline trajectory shows that a target ball will be pocketed in a target pocket. This is what we mean by calling a ball.
                    </span>

                    <span className="content">
                      <i className="">.ii</i>
                      If the table is open (i.e. neither player has chosen a color suite yet), the active player can call on any ball; after a player has pocketed a target ball, that ball's color (red or yellow) becomes his/her chosen color, and the opponent will assume the other color (yellow or red); only after all balls of a player’s chosen color are pocketed can a player call on the black ball;
                    </span>

                    <span className="content">
                      <i className="">.iii</i>
                      A call shot is successful if the target ball is pocketed into the targeted pocket. If the black ball is called legally and pocketed, the player wins the game. If a non-black ball is called and pocketed, the player continues to make another call shot;
                    </span>

                    <span className="content">
                      <i className="">.iv</i>
                      Otherwise, if the black ball is pocketed without being called, or not into the called pocket, then the opponent player wins the game immediately;
                    </span>

                    <span className="content">
                      <i className="">.v</i>
                      Otherwise, if a non-black ball is pocketed, but it is not the called ball, or the pocket is not the called pocket, then it is the opponent’s turn to take a call shot next;
                    </span>
                    <span className="content">
                      <i className="">.vi</i>
                      “Scratch” foul: If the cue ball is pocketed, then the opponent takes a call shot by first placing the cue ball anywhere on the table;
                    </span>
                    <span className="content">
                      <i className="">.vii</i>
                      “Bad Hit” foul: if the cue ball first touches a ball not of his legal color, then the opponent takes a call shot by first placing the cue ball anywhere on the table;
                    </span>
                    <span className="content">
                      <i className="">.viii</i>
                      “No Rail” foul: if after the cue ball hits a target ball, neither ball hits the rail or gets pocketed, then the opponent takes a called shot by placing the cue ball anywhere on the table.
                    </span>
                    <span className="content">
                      <i className="">.ix</i>
                      A summary table is below for quick reference:
                    </span>
                  </li>

                </ul>
                <div className="accordion__items__content__table">
                  <div className="tg-table">
                    <div className="tg-table__heading">
                      <div className="tg-table__heading__content">
                        <span>Which ball is pocketed</span>
                      </div>
                      <div className="tg-table__heading__content">
                        <span>Which pocket</span>
                      </div>
                      <div className="tg-table__heading__content">
                        <span>Rule</span>
                      </div>
                    </div>
                    <div className="tg-table__content">
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>Called ball (black)</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Called pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Player wins game</span>
                        </div>
                      </div>
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>Called ball (black)</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Not called pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Opponent wins game</span>
                        </div>
                      </div>
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>Called ball (nonblack)</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Called pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Player takes called shot next</span>
                        </div>
                      </div>
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>Called ball (nonblack)</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Not called pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Opponent takes called shot next</span>
                        </div>
                      </div>
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>Not called ball (black)</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Any Pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Opponent wins game</span>
                        </div>
                      </div>
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>Not called ball (nonblack)</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Any Pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Opponent takes called shot next</span>
                        </div>
                      </div>
                      <div className="tg-table__content__items">
                        <div className="tg-table__content__items__content">
                          <span>No pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>No pocket</span>
                        </div>
                        <div className="tg-table__content__items__content">
                          <span>Opponent takes called shot next</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div
              className="accordion__items"
              role="button"
              tabIndex={0}
              onClick={() => { this.accordionShow('accordion-4'); }}
            >
              <div className="accordion__items__header">
                <p>Game Levels</p>
                <span className="tg-icon-tg-down" />
              </div>
              <div id="accordion-4" className="accordion__items__content">
                <p>
                  Two difficulty levels are available to cater for players with different level of skills and experiences.
                </p>
                <ul className="accordion__list accordion__list--level">
                  <li className="accordion__list__items">
                    <span className="heading">Beginner</span>
                    <span className="content">The pockets are bigger than normal, and there are only 12 balls in total to make the game easier for beginners; each player has 5 minutes in total; the SPIN meter is not available; maximum shot speed is 1800. </span>
                  </li>
                  <li className="accordion__list__items">
                    <span className="heading">Advanced</span>
                    <span className="content">The ball size, table size and pocket size are all proportional to standard pool table in real sports, but there are total of 22 balls in 6 rows; each player has 10 minutes in total; the SPIN meter is available; maximum shot speed is 3000.</span>
                  </li>

                </ul>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GameGuideComponents;
