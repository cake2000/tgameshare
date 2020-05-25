import React from 'react';

const featuresSection = (props) => {
  //const { features } = props;
  // moved here to simplify changes
  const features = [
    {
      logo: null,
      name: 'CODE',
      des: 'game robots in JavaScript following interactive tutorials',
      defaultLogo: '/images/ai-programing.svg'
    },
    {
      logo: null,
      name: 'CHALLENGE',
      des: 'your friends in online games by yourself or with your robot',
      defaultLogo: '/images/friends.svg'
    },
    {
      logo: null,
      name: 'COMPETE',
      des: 'in upcoming tournaments to earn official rating and awards',
      defaultLogo: '/images/awards.svg'
    }
  ];

  return (
    <div className="feature-section" style={{ backgroundColor: 'floralwhite' }} id="features">
      <center><h2 className="hero-heading">FEATURES</h2></center>
      <div className="features">
        <div className="features-section tg-container">
          {
            _.map(features, (feature, index) =>
              (<div className="features-section__block" key={index}>
                <img
                  className="wow fadeIn feature-logo"
                  src={!feature.logo ? feature.defaultLogo : feature.logo}
                  width="180"
                  alt=""
                />
                <div className="text wow fadeInUp">
                  <span className="text__bold">{feature.name}</span>
                  <br />{feature.des}
                </div>
              </div>)
            )
          }
        </div>
      </div>
    </div>
  );
};

export default featuresSection;
