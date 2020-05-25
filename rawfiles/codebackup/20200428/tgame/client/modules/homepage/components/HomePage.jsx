import React from 'react';
import PropTypes from 'prop-types';
import TopBanner from './topBanner/TopBanner.jsx';
import FeaturesSection from './featuresSection/featuresSection.jsx';
import GamesSection from '../containers/gamesSection.js';
import QuestionsSection from './questionsSection/questionsSection.jsx';
import DeactivatedAccount from './DeactivedAccount/DeactivedAccount.jsx';
// import { ScrollAnimation } from '../../../lib/scrollAnimationMenu.js';

// moved here to simplify changes
const abouts = [
  {
    title: 'Why Learning to Code?',
    childrens: [
      {
        logo: null,
        defaultLogo: '/images/tg_have_fun.png',
        title: 'To Have Fun',
        content: '<p>It’s magical to watch your program takes on a life of its own</p>',
      },
      {
        logo: null,
        defaultLogo: '/images/tg_practice_computational_thinking_small.png',
        title: 'To Train Computational Thinking',
        content: '<p>Analyze a problem, build a digital model, and solve it efficiently</p>',
      },
      {
        logo: null,
        defaultLogo: '/images/tg_AI_power.png',
        title: 'To Become a Power User of AI',
        content: '<p>Understand basic concepts and algorithms of AI</p>',
      },
      {
        logo: null,
        defaultLogo: '/images/tg_explore_career_option.png',
        title: 'To Explore A New Career Option',
        content: '<p>Programmers are changing the world, and you can be one of them</p>',
      },
    ]
  },
  {
    title: 'Why Learning with TuringGame?',
    childrens: [
      {
        logo: null,
        defaultLogo: '/images/tg_convinient_online_tutorials.png',
        title: 'Convenient Online Tutorials',
        content: '<p>We provide interactive tutorials to help you build game robots at your own pace</p>',
      },
      {
        logo: null,
        defaultLogo: '/images/tg_fun_and_challenge.png',
        title: 'Fun Combat Games',
        content: '<p>We offer fun combat games between human and robots, for FREE</p>',
      },
      {
        logo: null,
        defaultLogo: '/images/tg_official_world_ranking.png',
        title: 'Official World Ranking',
        content: '<p>You will show the entire world your efforts and get recognized</p>',
      },
    ]
  },
];
class HomePage extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    homePageData: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  };

  componentWillMount() {
    const user = Meteor.user();
    if (user && !user.roles) {
      const { history } = this.props;
      history.push('/selectRole');
    }
  }

  componentDidMount() {
    window.scroll(0, 0);
    const { homePageData } = this.props;
    if (homePageData) {
      window.prerenderReady = true;
    }
  }

  componentWillReceiveProps(nextProps) {
    const { homePageData } = nextProps;
    if (homePageData) {
      window.prerenderReady = true;
    }
  }

  checkActiveUser = () => {
    const user = Meteor.user();
    if (!user) return true;
    return user.accountStatus ? user.accountStatus.isActive : true;
  };

  render() {
    const { homePageData, userIsLoggedIn, history, activeAccount } = this.props;
    const activeStatus = this.checkActiveUser();

    return (
      <div className="tg-home-page" id="home-page">
        {
          // render account is deactived message
          !activeStatus ?
            <DeactivatedAccount
              activeAccount={activeAccount}
            />
            : null
        }

        {
          // render topbanner
          <TopBanner
            history={history}
            banner={homePageData.banner}
            userIsLoggedIn={userIsLoggedIn}
          />
        }

        {
          // render feature section when user is active
          activeStatus ?
            <FeaturesSection features={homePageData.features} />
            : null
        }

        {
          // render game section when user is active
          activeStatus ?
            <GamesSection history={history} />
            : null
        }

        {
          activeStatus ?
            <QuestionsSection questions={abouts} />
            : null
        }
      </div>
    );
  }
}

export default HomePage;
