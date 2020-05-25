import React from 'react';
import renderHTML from 'react-render-html';

const FAQSection = (props) => {
  const { ourVision, ourMission, faq } = props;
  return (
    <div className="faq tg-tutorial__container" id="FAQ">
      {/* <center><h2 className="hero-heading">About Us</h2></center> */}
      <center><h2 className="hero-heading">&nbsp;</h2></center>
      <div className="about-us-section__block tg-container wow fadeIn">
        <div className="about-us-section__block__list">
          <h3 className="about-us-section__block__list__title">{ourMission.title}</h3>
          <div className="about-us-section__block__list__content">
            {/* {renderHTML(ourMission.content)} */}
            <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: ourMission.content }} />
          </div>
        </div>
      </div>
      {/* <center><h2 className="hero-heading">VISION</h2></center>
      <center><h2 className="hero-heading">&nbsp;</h2></center> */}
      <div className="about-us-section__block tg-container wow fadeIn">
        <div className="about-us-section__block__list">
          <h3 className="about-us-section__block__list__title">{ourVision.title}</h3>
          <div className="about-us-section__block__list__content">
            {/* {renderHTML(ourVision.content)} */}
            <div style={{ textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: ourVision.content }} />
          </div>
        </div>
      </div>
      <center><h2 className="hero-heading">FAQ</h2></center>
      <center><h2 className="hero-heading">&nbsp;</h2></center>
      <div className="about-us-section__block tg-container wow fadeIn">
        <div className="about-us-section__block__list">
          {/* <h3 className="about-us-section__block__list__title">Frequently Asked Questions</h3> */}
          <ul className="list-faq">
            {
              _.map(faq, (item, index) => (
                <li className="list-faq__items" key={index}>
                  <strong>{item.question}</strong>
                  <br />
                  <br />
                  <div style={{ marginLeft: '20px', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: item.answer }} />
                  <br />
                  <br />
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
