import { Admin } from '../../../lib/collections';

// Update payment data for sample user
const updateAdminHomePageData = () => {
  const homePageData = Admin.findOne({ type: 'homepage' });

  const abouts = [
    {
      title: 'Why Learning Coding?',
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
          content: '<p>Computer programmers are changing our lives for better, and you can become one of them</p>',
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
          content: '<p>We offer the best combat games between human and robots, for FREE</p>',
        },
        {
          logo: null,
          defaultLogo: '/images/tg_official_world_ranking.png',
          title: 'Official World Ranking',
          content: '<p>You will show the entire world your efforts and talent, and get recognized</p>',
        },
      ]
    },
    // {
    //   title: 'Human Player or Robot Player?',
    //   childrens: [
    //     {
    //       logo: null,
    //       defaultLogo: '/images/tg_human_player.png',
    //       title: 'Human Player',
    //       content: '<p>Access to self-practice games, online games with friends or their game bots, and public forums</p>',
    //     },
    //     {
    //       logo: null,
    //       defaultLogo: '/images/tg_robot_player.png',
    //       title: 'Robot Player',
    //       content: '<p>Additional access to robot code editor and interactive tutorials to build your game bots</p>',
    //     },
    //   ]
    // },
  ];

  const ourVision = {
    title: 'Vision: build the best eSports platform for robots and human',
    content: `
    <p>
      Combat games are the best venue for practice coding and applying AI algorithms. That's why Google's DeepMind team developped the <a href="https://deepmind.com/research/alphago/" target="_blank">AlphaGo</a> robot to research AI techniques, and <a href="" target="_blank">OpenAI</a> explores artificial general intelligence using arcade games.
    </p>
    <p>
      At our TuringGame platform, we help players <b>build their own "AlphaGo"</b>, and experience the challenge and excitement of building their own game bots that can even beat human players. This is done by carefully redesigning classic combat games to be more fair for both human and robot players, and by providing easy-to-follow tutorials to guide players through the process of building and improving their robots. 
    </p>
    <p>
      We have just started on this journey, and we would love to hear your feedback. Don't hesitate to drop us a <a href="/contact-us" target="_blank">message</a> at any time!
      </p>
    `
  };

  // const ourMission = {
  //   title: 'Mission: empower people with AI',
  //   content: `
  //   <p>
  //     AI (Artificial Intelligence) is an extremely powerful tool, but not many people truly understand the strengths and limitations of AI. People need to realize that AI can accomplish certain tasks faster and better than human beings, and learn to employ AI solutions in those situations. That change in mindset will not only boost our productivity substantially, but also free up our own minds for more challenging and interesting endeavors. 
  //   </p>
  //   <p>
  //     The world will not enter the era of AI until its people fully embrace the power of AI. We are working on it.
  //   </p>
  //   `
  // };

  const ourMission = {
    title: 'Mission: make it fun for kids to learn coding',
    content: `
    <p>
      Learning to code can be hard and tedious, especially when the project size grows and more complex logical thinking is required. But we seldom hear kids complaining about how hard it is to play a video game, do we? That's why it is crucial to have really fun coding projects for kids to work on.
    </p>
    <p>
      We are not the first to propose using video games as a teaching platform, but we have a unique approach. By making coding fun again, we aim to attract more kids to understand and enjoy coding.
    </p>
    `
  };

  if (homePageData && homePageData._id) {
    Admin.update({ _id: homePageData._id }, {
      $set: {
        'data.abouts': abouts,
        'data.ourVision': ourVision,
        'data.ourMission': ourMission
      }
    });
  }
};

export default updateAdminHomePageData;
