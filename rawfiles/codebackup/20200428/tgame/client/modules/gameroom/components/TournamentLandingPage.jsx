import React from 'react';



const infos = [
  // {
  //   title: 'What is it?',
  //   html: `<p>We are very excited to announce our first nation-wide online tournament for game bots. This will be a fun and rewarding coding project for anyone interested in learning computer programming. You can follow our tutorials to write the code for a game bot that plays our Trajectory Pool game, and then use this game bot to compete with other players' bots in the tournament.</p>`
  // }, 
  {
    title: `What's the award if I win?`,
    html: '<p>The top players at the regional and national levels will be listed on our leader board. The national top players will receive a cash award up to $1000. More importantly, you will learn to build an smart game bot in JavaScript using some kick-ass algorithms. You can continue to improve your game bot and play in future tournaments as well.</p>'
  }, {
    title: 'How do I participate?',
    html: `<p>You need to first <a href="/signup" target="blank">sign up</a> for a free account and then click the 'Tournament' menu link to register for this tournament. Then you can follow the tutorials to create your game bot, which usually takes a few weeks.</p>`
  }, {
    title: 'How much does it cost?',
    html: '<p>No cost. You can sign up our free account, and also register for this tournament for free.</p>'
  }, {
    title: 'What if I don’t know how to code?',
    html: '<p>No problem. Our tutorials teach you how to create the game robot program in JavaScript from scratch. You don’t need any previous knowledge in programming.</p>'
  }, {
    title: 'When is the tournament?',
    html: `<p>Regional Level: August 25 2018, 2:00 PM to 5:00PM US Eastern Time</p>
          <p>National Level: August 26 2018, 2:00 PM to 5:00PM US Eastern Time</p>`
  }, {
    title: 'What happens during the tournament?',
    html: `
    If you have ever seen a chess tournament, this is very similar, except it is all done online. Here is an overview of the process: <p/>
    <div class="chatHistoryScroll">
    <ul>
      <li>
        After registration, you will be listed under the 'New Registration" section of the tournament. 
        <p>
        </p>
      </li>
      <li>
        About 3 days before the tournament date, we'll stop accepting registration, and divide all registered players into regional sections, depending on number of players registered and their geographical distribution based on zipcode.
        <p/>
      </li>
      <li>
        When it's time for the tournament, all players in your section will be paired up (using the <a href="https://en.wikipedia.org/wiki/Swiss-system_tournament" target="_blank">Swiss System</a>), and you will receive a game invitations from our tournament administrator to join a game room to compete with your assigned opponent. The game starts when you and your opponent are ready. After your game finishes, we will add 1 point to the winner of the game.
        <p/>
      </li>
      <li>
        When all games are finished for the first round, we will generate a new set of player pairings for the second round of games for your section, and then kick it off.
        <p/>
      </li>
      <li>
        When all games of the last round of your section are finished, we will calculate the top players for each section based on cumulative points, and invite them into a new section for the national level competition on the second day.
        <p/>
      </li>
      <li>
        If your robot is selected to participate in the national level competition, you will go through a similar process on the second day with a few rounds of games.
        <p/>
      </li>
      <li>
        The top players from the national level competition will be given cash awards, and all players will get an official rating for their game bots. You can find top players listed on our leaderboards as sorted by rating and grouped by region, gender, school grade, etc.
        <p/>
      </li>
    </ul>
    </div>
    `
  }
];


const InfoItem = ({ info: { title, html } }) => (
  <div className="tournament-intro__block tg-container wow fadeIn">
    <div className="tournament-intro__block__list">
      <h3 className="tournament-intro__block__list__title">{title}</h3>
      <div className="tournament-intro__block__list__content">
          <div style={{ fontSize: '18px', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    </div>
  </div>
);

const TournamentLandingPage = () => {
  return (
    <div className="tournament-intro" id="about">
      <div className="faq-section" id="FAQ">
        <center><h2 className="hero-heading">Inaugural National Trajertory Pool Tournament</h2></center>
        <center><h2 className="hero-heading">&nbsp;</h2></center>
      </div>

      <div className="tournament-intro__block tg-container wow fadeIn" id="FAQ">
        <p style={{fontSize: '18px'}} className="hero-heading">We are very excited to announce our first nation-wide online tournament for game bots. This will be a fun and rewarding coding project for anyone interested in learning computer programming from beginner to intermediate levels. </p>
        <br />
        <p style={{fontSize: '18px'}} className="hero-heading">You can follow our tutorials to write the code for a game bot that plays our Trajectory Pool game, and then use this game bot to compete with other players' bots in the tournament.</p>
        <h4 className="hero-heading">&nbsp;</h4>
      </div>

      
      {
        infos.map((info, index) => <InfoItem info={info} key={index} />)
      }
    </div>
  );
};

export default TournamentLandingPage;
