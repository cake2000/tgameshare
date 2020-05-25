import { Languages } from '../../../lib/collections';

const htmlparser = require('htmlparser2');

const parseLanguageHTML = (filename) => {
  // const data = fs.readFileSync(filename);
  const data = Assets.getText(filename);
  const json = [];
  let currentElement = {};

  const parser = new htmlparser.Parser({
    onopentag(name, attribs) {
      if (name === 'element') {
        currentElement = {
          elementId: attribs.elementid,
          elementType: attribs.elementtype ? attribs.elementtype : '', // lower case only!!
          answerKey: attribs.answerkey ? attribs.answerkey : '',
          answerReason: attribs.answerreason ? attribs.answerreason : '',
          html: '',
          optional: attribs.optional ? attribs.optional : 'False',
          showCondition: attribs.showcondition ? attribs.showcondition : '',
          skill: attribs.skill ? attribs.skill : '',
        };
      } else {
        currentElement.html += `<${name} `;
        Object.keys(attribs).forEach((field) => {
          currentElement.html += `${field} = "${attribs[field]}"`;
        });
        currentElement.html += '>';
      }
    },
    ontext(text) {
      currentElement.html += text;
    },
    onclosetag(name) {
      if (name === 'element') {
        json.push(currentElement);
      } else {
        currentElement.html += `</${name}>`;
      }
    }
  }, {
    decodeEntities: true
  });
  parser.write(data);
  parser.end();

  return json;
};

const prepareLanguageLessons = () => {
  Languages.remove({});

  let id = 1;
  const langs = ['JavaScript'];
  for (let i = 0; i < langs.length; i++) {
    const lang = langs[i];
    const path = `TutorialLessons/Language/${lang}/`;
    const files = ['Array', 'Evaluation', 'ForLoop', 'Function', 'IfCondition', 'Object', 'Variable'];
    // fs.readdirSync(abpath);
    files.forEach((filename) => {
      const skill = filename;
      const doc = { languageName: lang, skill };
      doc.instructionElements = parseLanguageHTML(`${path}${filename}.html`);
      doc._id = `P${id}`;
      Languages.insert(doc);
      id += 1;
    });
  }
};

export default prepareLanguageLessons;
