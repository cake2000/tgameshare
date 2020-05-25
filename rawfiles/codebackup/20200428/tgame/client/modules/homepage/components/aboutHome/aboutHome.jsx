import React from 'react';

import FAQSection from '../faqSection/faqSection.jsx';

class AboutHome extends React.Component {
  componentDidMount() {
    window.scroll(0, 0);
  }

  render() {
    // const { ourVision, ourMission, faq } = this.props;

    // moved here to simplify changes
    const ourMission = {
      title: 'Mission: give all kids an opportunity to learn coding with their own gamebots',
      content: `
      <p>
        Computational thinking may be the most important skill for our kids to learn today. As the world runs more on automated solutions, our kids will be dealing with hundreds of robots every day when they grow up. They need to undersand how computers and robots work, and learn to leverage the immense computing power to help them in their work, no matter what career they pursue. And that starts with learning to code today.
        </p>
        <p>
        Learning to code is hard and coding exercise can be tedious, especially when the project size grows and more complex logical thinking is required. But we seldom hear anyone complaining about how hard it is to play a video game, do we? That's why we propose to use video games as a learning platform. We are not the first to do so, but we have an innovative and unique approach. By making coding fun again, we aim to attract more young people to enjoy coding.
      </p>
      `
    };

    const ourVision = {
      title: 'Vision: building a playground for programmers',
      content: `
      <p>
        They all have playgrounds: chess players go to chess.com to play with friends, math kids solve puzzles on prodigygame.com, and robotics lovers join competitions in VEX and FLL tournaments. However, there is no playground for programmers, until TuringGame.
      </p>
      <p>
        With the TuringGame platform, we offer fun battle games that everyone would enjoy playing manually, and we offer the API (programming interface) to create your own game bots. To help you get started, we provide easy-to-follow tutorials to guide you through the process of building and improving your game bots step-by-step. To test how good your game bot is, you can challenge top players on our national leaderboard. This will be the best playground for all programmers to learn, to practice, and to show off!
      </p>
      <p>
        We have just started on this project, and we would love to hear your feedback. Don't hesitate to share your thoughts <a href="https://forum.tgame.ai/c/site-feedback" target="_blank">on our forum</a>!
        </p>
      `
    };


    const faq = [
      {
        question: 'Who play on TuringGame?',
        answer: `
        <p>
          There are 2 types of players on TuringGame: robot players and human players.
        </p>
        <br/>
        <ul>
          <li>
            <b>Robot players</b> are programmers who write computer programs (called game robot or game AI) to play games. Each robot is composed of hundreds lines of code, which is a perfect project for anyone looking for fun coding projects. It is relatively simple to get started for new programmers, yet sky is the limit if you want to apply advanced optimization and machine learning algorithms in your robot program.
          </li>
          <br/>
          <li>
            <b>Human players</b> could be anyone looking for some fun games to play manually themselves. If your friend or kid is learning to write game robots with us, we encourage you to sign up and play with their game robots for fun. You can have tons of fun for FREE and help someone to learn coding at the same time!
          </li>
        </ul>
        `
      },
      {
        question: 'Is it really free?',
        answer: `
        <p>
          Yes. You only need to sign up with your email, and no payment info is needed. And we are not showing any ads on our site.
        </p>
        <br/>
        <p>
          We will figure out a way to get paid by providing more value to you in the future. Don't worry about us.
        </p>
          `
      },
      {
        question: 'What games are available?',
        answer: `
        <p>
          Since we have just started, currently we only have 2 games available: Trajectory Pool and Smart Tank. We are actively working on adding more games to our platform, and if there is a specific combat game that you would like added, <a href="https://forum.tgame.ai/t/which-game-to-add-next/16" target="_blank">let us know</a>!
        </p>
        `
      },
      {
        question: 'What if I don’t know how to program?',
        answer: `
        <p>
          That's not a problem! We offer interactive tutorials that teach you JavaScript programming and gamebot coding at the same time.
        </p>
        <br/>
        <p>
          If you are the kind of learner who prefer a systematic introduction of all basic concepts before diving in, there are plenty of excellent tutorials and courses in JavaScript freely available online to get you started, such as <a target="_blank" href="https://www.khanacademy.org/computing/computer-programming/programming">Khan Academy</a>, <a target="_blank" href="http://www.learn-js.org/">Learn-JS</a>, and <a target="_blank" href="https://www.codeschool.com/courses/javascript-road-trip-part-1">Code School</a>, etc.
        </p>
        `
      },
      {
        question: 'So a robot will be teaching the tutorials?',
        answer:
        `
        <p>
          Yes, and no.
        </p>
        <br/>
        <p>
          We are a group of computer scientists with years of experience in applying automated solutions to various challenging problems, and we design the tutorials the same way as if we are personally talking you through the process of building your game robots. 
        </p>
        <br/>
        <p>
          However, we can't really talk to many people personally, so we need the help of our chatbot <b>TBot</b> to walk you through the tutorials <b>on behalf of us</b>. Our goal is to make your interaction with our robot teacher as pleasant as talking to one of us. In face, our robot teacher can serve you better in many ways, such as responding to you instantly, or repeating the same information patiently as many times as you need.
        </p>
        <br/>
        <p>
          This is a challenging task for us, and we need your help to do better. If you find any issue with TBot's response to you, please post it <a href="https://forum.tgame.ai/t/improvements-to-tbot/48"  target="_blank">on our forum</a>. Thanks!
        </p>
        `
      },
      {
        question: 'Can I learn or apply AI (Artificial Intelligence) with TuringGame?',
        answer: `
        <p>
          Absolutely! The term artificial intelligence refers to all human activities that create intelligent behavior in computing devices, which can take one of the following 2 approaches:
        </p>
        <br/>
        <ul>
          <li>
            <p>
              With <b>logic programming</b>, the programmer analyzes the issue at hand, design an algorithm to solve the problem, and then implement the algorithm as computer programs. For example, given 2 locations on a map, find the shortest path between them. Logic programming is the mostly widely used AI techniques since it is easy to understand and diagnose, and it is especially useful when you only have limited amount of training data.  
            </p>
            <br/>
            <p>
              When writing your game robot on TuringGame, you will be applying the same kind of logical thinking and algorithm design, such as how to search for the best course of action quickly, how to balance the risk and reward of your action, etc. 
            </p>
          </li>
          <br/>
          <li>
            <p>
              In <b>machine learning</b>, intead of directly specifying the logic to solve a problem step-by-step, you feed example training data to a computer model or a robot, which "learns" to reproduce the desired output according to the training. For example, given tens of thousands of images of the number 0, a good model will be able to tell a new image contains a 0 or not.   
            </p>
            <br/>
            <p>
              On the TurinGame platform, you can write test scripts to generate tons of training data and build machine learning models using such data.
            </p>
          </li>
        </ul>
        `
      },
      {
        question: 'Why JavaScript?',
        answer: `
        <p>
          JavaScript is simple to pick up, and it is by far the <a href="https://thenewstack.io/javascript-popularity-surpasses-java-php-stack-overflow-developer-survey/" target="_blank">most popular programming language for the web</a> today. With frameworks like the <a href="http://mean.io/" target="_blank">MEAN Stack</a>, JavaScript allows you to write both web interface and web servers in one language, and it is also the key language for building web-based games. 
        </p>
        <br/>
        <p>
          In addition, the algorithms and techniques you learn in writing game robots with JavaScript will be equally applicable in most programming languages (e.g. Java, C/C++, Python, C#, etc). If you have a strong preference for some other language you would like added, <a href="/contact-us"  target="_blank">let us know</a>!
        </p>
          `
      },
      {
        question: 'Is my robot code protected when I play a game?',
        answer: 'Yes it is 100% safe. We understand that advanced users can check JavaScript source code in the browser\'s developer console, so we only load your robot program in your own desktop or mobile device when you are playing a game, and the only data sent over the Internet is your robot\'s commands.'
      }
    ];

    return (
      <div className="tg-page tg-page--general" id="about">
        {ourVision && faq && ourMission && <FAQSection ourVision={ourVision} ourMission={ourMission} faq={faq} />}
      </div>
    );
  }
}

export default AboutHome;
