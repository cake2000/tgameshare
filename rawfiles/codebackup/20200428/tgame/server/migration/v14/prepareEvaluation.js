import { Evaluation } from '../../../lib/collections';

const htmlParser = require('htmlparser2');

const parseOpenTag = (name, attributes) => {
  let html = `<${name}`;

  Object.keys(attributes).forEach((field) => {
    html += ` ${field} = "${attributes[field]}"`;
  });
  html += '>';

  return html;
};

const parseEvaluationHTML = (filename, language) => {
  const data = Assets.getText(filename);
  const json = [];
  let currentElement = {};
  let answers = [];
  let answer = '';
  let answerNumber = 0;
  let question = 0;

  const parser = new htmlParser.Parser({
    onopentag(name, attributes) {
      if (name === 'element') {
        question += 1;
        currentElement = {
          language,
          elementId: attributes.elementid,
          elementType: attributes.elementtype,
          answerKey: attributes.answerkey,
          answerReason: attributes.answerreason,
          skill: attributes.skill,
          header: `Question ${question}.`,
          html: '',
        };
        answers = [];
        answerNumber = 0;
      } else if (name !== 'li' && name !== 'ul') {
        if (answerNumber < 1) {
          currentElement.html += parseOpenTag(name, attributes);
        } else {
          answer += parseOpenTag(name, attributes);
        }
      } else if (name === 'li') {
        answerNumber += 1;
        answer = '';
      }
    },
    ontext(text) {
      if (answerNumber < 1) {
        currentElement.html += text;
      } else {
        answer += text;
      }
    },
    onclosetag(name) {
      if (name === 'element') {
        currentElement.answers = answers;
        json.push(currentElement);
      } else if (answerNumber < 1) {
        currentElement.html += `</${name}>`;
      } else if (answerNumber > 0) {
        if (name !== 'li') {
          answer += `</${name}>`;
        } else {
          answers.push(answer);
        }
      }
    }
  }, {
    decodeEntities: true
  });
  parser.write(data);
  parser.end();

  return json;
};

const prepareEvaluation = () => {
  Evaluation.remove({});

  const languages = ['JavaScript'];
  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    const path = `TutorialLessons/Language/${language}/`;
    const docs = parseEvaluationHTML(`${path}Evaluation.html`, language);

    docs.map(doc => Evaluation.insert(doc));
  }
};

export default prepareEvaluation;
