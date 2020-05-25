import React, { Component } from 'react';
import PropTypes from 'prop-types';
import swal from 'sweetalert';

class QuizTest extends Component {

  handleChangeValue = (e) => {
    const { updateUserAssessment } = this.props;

    updateUserAssessment('JavaScript', e.target.name, e.target.value);
  };

  scoreAssessment = () => {
    const { evaluation } = this.props;
    const assessments = Meteor.user().languages[0] && Meteor.user().languages[0].assessments;
    if (!assessments) {
      return [];
    }
    const skills = {};
    assessments.forEach((a) => {
      const index = Number(a.key.substring(1)) - 1;
      if (index < 0 || index >= evaluation.length) return;
      const eva = evaluation[index];
      if (eva.answerKey.charCodeAt(0) - 'A'.charCodeAt(0) === a.answer - 1) {
        if (!(eva.skill in skills)) skills[eva.skill] = 0;
        skills[eva.skill] += 1;
      }
    });
    const skillsGained = [];
    Object.keys(skills).forEach((key) => {
      if (skills[key] > 1) skillsGained.push(key);
    });
    return skillsGained;
  };

  handleSubmit = () => {
    const { updateUserLanguageLevel, updateUserLanguageSkills } = this.props;

    const skillsGained = this.scoreAssessment();

    const skillTermMap = {
      "Function": "functions", 
      "Variable": "variables",
      "Object": "objects",
      "Array": "arrays",
      "ForLoop": "for-loops",
      "IfCondition": "conditional statements"
    };
    
    let resultText = "You appear to be a beginner in JavaScript";
    if (skillsGained.length == 1) {
      resultText = "You have done well on questions about " + skillTermMap[skillsGained[0]];
    } else if (skillsGained.length > 1) {
      resultText = "You have done well on questions about";
      for (let k=0; k<skillsGained.length-1; k++) {
        resultText += " " + skillTermMap[skillsGained[k]];
        if (k == skillsGained.length-2) {
          resultText += " and";
        } else {
          resultText += ",";
        }
      }
      resultText += " " + skillTermMap[skillsGained[skillsGained.length-1]];
    }
    resultText += ". We will customize our tutorials for you accordingly.";
    swal({
      title: `Evaluation Summary`,
      text: resultText,
      icon: 'info'
    }).then(() => {
      updateUserLanguageLevel('JavaScript', 'Learner');
      updateUserLanguageSkills(Meteor.userId(), 'JavaScript', skillsGained);
    });
  };

  render() {
    const { evaluation } = this.props;
    const assessments = Meteor.user().languages[0] && Meteor.user().languages[0].assessments;

    setTimeout(() => {
      if (window.syntaxhighlighter) { window.syntaxhighlighter.highlight(); }
    }, 300);

    return (
      <div className="tutorialQuiz">
        {
          evaluation.map((element, index) => (
            <div className="tutorialQuiz--body tutorialQuiz-border" key={element._id}>
              <div className="tutorialQuiz--body__title">
                {element.header}
              </div>
              <div className="tutorialQuiz--body__question" dangerouslySetInnerHTML={{ __html: element.html }} />
              <div className="tutorialQuiz--body__answers">
                {
                  element.answers.map((answer, jindex) => {
                    const assessment = assessments && assessments.find(i => i.key === `Q${index + 1}`);

                    return (
                      <div
                        className="tutorialQuiz--body__answers--element"
                        key={answer}
                      >
                        <input
                          type="radio"
                          name={`Q${index + 1}`}
                          value={jindex + 1}
                          checked={assessment && Number(assessment.answer) === jindex + 1}
                          onChange={this.handleChangeValue}
                        />
                        <div dangerouslySetInnerHTML={{ __html: answer }} />
                      </div>
                    );
                  })
                }
              </div>
            </div>
          ))
        }
        <div className="tutorialQuiz--footer">
          <button
            className="tutorialQuiz--footer__button"
            onClick={() => this.handleSubmit()}
          >
            Submit
          </button>
        </div>
      </div>
    );
  
  }

  componentWillMount() {
    const script0 = document.createElement('script');
    script0.src = '/js/syntaxhighlighter.js';
    script0.async = false;
    document.body.appendChild(script0);
  }

  componentWillUnmount() {
    delete window.syntaxhighlighter;
  }
}

QuizTest.propTypes = {
  evaluation: PropTypes.array.isRequired,
  updateUserAssessment: PropTypes.func.isRequired,
  updateUserLanguageLevel: PropTypes.func.isRequired,
};

export default QuizTest;
