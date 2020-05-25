import React from 'react';
import PropTypes from 'prop-types';
import AgeConfirm from '../../../account/components/AgeConfirm.jsx';
import PlayerLandingPage from '../playerHome/PlayerLandingPage.jsx';

class TopBanner extends React.Component {
  static propTypes = {
    banner: PropTypes.shape().isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      showAgeConfirm: false,
      accountType: '',
    };
  }

  render() {
    const { banner, userIsLoggedIn, history } = this.props;

    const camps = {
      aiCamp: {
        logo: null,
        title: 'Robot Mode',
        des: 'Program robots in JavaScript to play games for you'
      },
      humanCamp: {
        logo: null,
        title: 'Manual Mode',
        des: 'Play games manually with friends, or their game bots'
      }
    };

    if (userIsLoggedIn) {
      return (
        <div className="tg-top-banner" id="hero">
          <div className="tg-top-banner__container tg-container">
            <div className="tg-top-banner__container__type wow fadeInLeft">
              <h1 className="hero-heading">TuringGame - Learn to code <i style={ {fontStyle:"italic"} }>your</i> game bots</h1>
              {/* <h4 className="hero-heading">{banner.sloganSecondLine}</h4> */}
              <div className="hero-heading--underline">{''}</div>

              <div className="hero-link wow fadeInUp" data-wow-delay="800ms">
                {
                  _.map(camps, (camp, index) => {
                    let accountType = 'AI';
                    if (index === 'humanCamp') {
                      accountType = 'Human';
                    }
                    
                    const campNew = camp.title;
                    const campClass = campNew.split(' ')[0];

                    return (
                      <div
                        key={index}
                        aria-hidden
                        className={`hero-link__block game-mode-${campClass}`}
                      >
                        <div className="hero-link__block__items" data-ix="fade-in-up-on-load" role="presentation" onClick={() => history.push("/gamesBoard")}>
                          {
                            index === 'humanCamp' ?
                              <span className="tg-icon-brain" /> :
                              <span className="tg-icon-ai" />
                          }
                          <div className="heading">{camp.title}</div>
                          <div className="text">{camp.des}</div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>

            </div>
          </div>
          
          <center>
          <div>
            <span style={{color: 'white', fontSize: '18px'}}>Check out our upcoming national tournament on October 29 <a href="/landing.html" >here</a></span>
            <br/>
            <br/>
          </div>
            <div>
              <a href="https://www.facebook.com/TuringGameOfficial/" target="_blank"><img src="/images/facebook.png" align="left" border="0" style={{margin:'1px'}}/></a>
              {/* <a href="https://twitter.com/TuringGame" target="_blank"><img src="/images/twitter.png" border="0" style={{margin:'1px'}}  align="left"/></a> */}
              <a href="https://www.youtube.com/channel/UCfhS7OcAPAla7rf_l-PzFEg" target="_blank"><img src="/images/youtube.png" border="0" style={{margin:'1px'}}  align="left"/></a>

            </div>
            <br/>
          </center>
        </div>
      );
    }


    return (
      <div className="tg-top-banner" id="hero">
        <div className="tg-top-banner__container tg-container">
          <div className="tg-top-banner__container__type wow fadeInLeft">
          <h1 className="hero-heading">TuringGame - Learn to code <i style={ {fontStyle:"italic"} }>your</i> game bots</h1>
            {/* <h4 className="hero-heading">{banner.sloganSecondLine}</h4> */}
            <div className="hero-heading--underline">{''}</div>
            <div className="hero-link wow fadeInUp" data-wow-delay="800ms">
              {
                _.map(camps, (camp, index) => {
                  let accountType = 'AI';
                  if (index === 'humanCamp') {
                    accountType = 'Human';
                  }

                  return (
                    <div
                      key={index}
                      aria-hidden
                      className="hero-link__block"
                    >
                      <div className="hero-link__block__items" data-ix="fade-in-up-on-load" role="presentation" onClick={() => this.setState({ accountType, showAgeConfirm: true })}>
                        {
                          index === 'humanCamp' ?
                            <span className="tg-icon-brain" /> :
                            <span className="tg-icon-ai" />
                        }
                        <div className="heading">{camp.title}</div>
                        <div className="text">{camp.des}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
        <center>
          <div>
            <span style={{color: 'white', fontSize: '18px'}}>Check out our upcoming national tournament on October 29 <a href="/landing.html" >here</a></span>
            <br/>
            <br/>
          </div>
            <div>
            <a href="https://www.facebook.com/TuringGameOfficial/" target="_blank"><img src="/images/facebook.png" align="left" border="0" style={{margin:'1px'}}/></a>
              {/* <a href="https://twitter.com/TuringGame" target="_blank"><img src="/images/twitter.png" border="0" style={{margin:'1px'}}  align="left"/></a> */}
              <a href="https://www.youtube.com/channel/UCfhS7OcAPAla7rf_l-PzFEg" target="_blank"><img src="/images/youtube.png" border="0" style={{margin:'1px'}}  align="left"/></a>

            </div>
            <br/>
          </center>
        <AgeConfirm
          isOpen={this.state.showAgeConfirm}
          handleClose={() => this.setState({ showAgeConfirm: false })}
          accountType={this.state.accountType}
        />
      </div>
    );
  }
}

export default TopBanner;
