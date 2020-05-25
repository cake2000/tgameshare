import React from 'react';
import _ from 'lodash';
import renderHTML from 'react-render-html';


function QuestionsSection(props) {
  const { questions } = props;
  const renderQuestionsSection = (childrens) => {
    if (!childrens || childrens.length === 0) return null;

    // < 4 child
    if (childrens && childrens.length < 4) {
      return (
        <div className="features-section tg-container">
          {
            _.map(childrens, (child, index) => (
                <div className="features-section__block learning-section" key={index}>
                  <img
                    className="wow fadeIn"
                    src={!child.logo ? child.defaultLogo : child.logo}
                    width="180"
                    alt=""
                  />
                  <div className="text wow fadeInUp">
                    <span className="text__normal">{child.title}</span>
                    <br />
                    {renderHTML(child.content)}
                  </div>
                </div>
              )
            )
          }
        </div>
      );
    }

    // render 2 items each row
    return _.map(_.chunk(childrens, 2), (childs, index) => (
      <div className="features-section tg-container" key={index}>
        {
          _.map(childs, (child, idx) => (
              <div className="features-section__block learning-section" key={idx}>
                <img
                  className="wow fadeIn"
                  src={!child.logo ? child.defaultLogo : child.logo}
                  width="180"
                  alt=""
                />
                <div className="text wow fadeInUp">
                  <span className="text__normal">{child.title}</span>
                  <br />
                  {renderHTML(child.content)}
                </div>
              </div>
            )
          )
        }
      </div>
    ));
  };
  return (
    <div className="about-us-section" id="about">
      {/* Body */}
      { _.map(questions, (question, index) => (
        <div className={`about-us-section__block learning-${index} tg-container wow fadeIn`} key={index}>
          <center><h2 className="hero-heading">&nbsp;</h2></center>
          <div className="about-us-section__block__list">
            <div className="about-us-section__block__list__sub-title">
              {question.title}
            </div>
          </div>
          <div className="features">
            { renderQuestionsSection(question.childrens) }
          </div>
          { index !== questions.length - 1 && <center><h2 className="hero-heading">&nbsp;</h2></center> }
        </div>
      ))}
    </div>
  );

}

export default QuestionsSection;